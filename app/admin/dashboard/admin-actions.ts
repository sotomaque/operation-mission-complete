"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin-guard";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * Admin actions for dashboard mutations. All require an admin session
 * (`requireAdmin` redirects to login if not). Server-only — never
 * imported into a client component except via Next.js's "use server"
 * action-passing.
 */

export async function updateAdventureCapacity(cap: number) {
  await requireAdmin();
  if (!Number.isInteger(cap) || cap < 1 || cap > 500) {
    throw new Error("Capacity must be 1–500");
  }
  const db = getSupabaseAdmin();
  await db
    .from("config")
    .update({ value: cap, updated_at: new Date().toISOString() })
    .eq("key", "adventure_capacity");
  revalidatePath("/admin/dashboard");
}

export async function updateRsvp(
  id: string,
  fields: {
    first_name?: string;
    last_name?: string;
    email?: string;
    mobile_phone?: string;
    guest_count?: number;
    rsvp_choice?: "adventure" | "welcome" | "declined";
    meal_choice?: "beef" | "chicken" | null;
    dietary_restrictions?: string | null;
    admin_notes?: string | null;
  },
) {
  await requireAdmin();
  const db = getSupabaseAdmin();
  const { error } = await db.from("rsvps").update(fields).eq("id", id);
  if (error) {
    console.error("[updateRsvp]", error);
    throw new Error("Update failed");
  }
  revalidatePath("/admin/dashboard");
}

export async function deleteRsvp(id: string) {
  await requireAdmin();
  const db = getSupabaseAdmin();
  const { error } = await db.from("rsvps").delete().eq("id", id);
  if (error) {
    console.error("[deleteRsvp]", error);
    throw new Error("Delete failed");
  }
  revalidatePath("/admin/dashboard");
}
