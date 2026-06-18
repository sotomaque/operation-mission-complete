import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-guard";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * CSV export of the full RSVP manifest. Streams as a download with a
 * date-stamped filename. Opens cleanly in Excel / Numbers / Sheets.
 *
 * Column order matches what the admin team has been triaging in the
 * dashboard, so the export reads top-to-bottom as the same shape.
 */

const HEADERS = [
  "RSVP ID",
  "Created",
  "Updated",
  "First Name",
  "Last Name",
  "Email",
  "Mobile Phone",
  "Guest Count",
  "Invite Link",
  "RSVP Choice",
  "Meal Choice",
  "Dietary Restrictions",
  "Admin Notes",
];

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  // RFC 4180: quote if contains comma / quote / newline. Double inner quotes.
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  await requireAdmin();
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("rsvps")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    return new NextResponse(`Export failed: ${error.message}`, { status: 500 });
  }

  const rows = data ?? [];
  const lines: string[] = [HEADERS.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.id,
        r.created_at,
        r.updated_at,
        r.first_name,
        r.last_name,
        r.email,
        r.mobile_phone,
        r.guest_count,
        r.invite_type,
        r.rsvp_choice,
        r.meal_choice ?? "",
        r.dietary_restrictions ?? "",
        r.admin_notes ?? "",
      ]
        .map(csvEscape)
        .join(","),
    );
  }
  const body = `﻿${lines.join("\n")}\n`; // BOM so Excel reads UTF-8

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="omc-rsvps-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
