import { redirect } from "next/navigation";
import { Resend } from "resend";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireAdmin } from "@/lib/admin-guard";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * Email blast surface. Compose a subject + body, pick an audience
 * (adventure, welcome, all confirmed), preview the recipient list
 * count, and send via Resend. No template editor — markdown-style
 * paragraphs split by blank lines, rendered as <p> for the email body.
 */

async function sendBlast(formData: FormData) {
  "use server";
  await requireAdmin();
  const audience = String(formData.get("audience") ?? "all");
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!subject || !body) {
    throw new Error("Subject and body are required");
  }
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error("RESEND_API_KEY and RESEND_FROM_EMAIL must be set");
  }

  const db = getSupabaseAdmin();
  let q = db.from("rsvps").select("email").not("rsvp_choice", "eq", "declined");
  if (audience === "adventure") q = q.eq("rsvp_choice", "adventure");
  if (audience === "welcome") q = q.eq("rsvp_choice", "welcome");
  const { data, error } = await q;
  if (error) throw new Error(`Recipient lookup failed: ${error.message}`);

  const emails = Array.from(new Set((data ?? []).map((r) => r.email)));
  if (emails.length === 0) {
    throw new Error("No recipients matched");
  }

  const html = body
    .split(/\n\n+/)
    .map((p) => `<p style="margin:0 0 1em;font-family:serif;color:#1a1810;">${escapeHtml(p)}</p>`)
    .join("");

  const resend = new Resend(apiKey);

  // Resend's `to` accepts an array — for blast, send individually so
  // each guest sees only their own address in the To: field. ~hundreds
  // of recipients, well under Resend's rate limits.
  let sent = 0;
  let failed = 0;
  for (const email of emails) {
    try {
      await resend.emails.send({
        from,
        to: email,
        subject,
        html,
      });
      sent += 1;
    } catch (err) {
      failed += 1;
      console.error("[email blast]", email, err);
    }
  }

  // Redirect with a result summary in the query string. Cheap UI.
  // `redirect()` throws — Next.js catches and routes appropriately.
  redirect(`/admin/email?sent=${sent}&failed=${failed}`);
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default async function EmailBlastPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; failed?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("rsvps")
    .select("rsvp_choice, email")
    .not("rsvp_choice", "eq", "declined");

  const totals = (data ?? []).reduce(
    (acc, r) => {
      const emails = acc.byChoice.get(r.rsvp_choice) ?? new Set<string>();
      emails.add(r.email);
      acc.byChoice.set(r.rsvp_choice, emails);
      acc.all.add(r.email);
      return acc;
    },
    {
      all: new Set<string>(),
      byChoice: new Map<string, Set<string>>(),
    },
  );

  return (
    <main className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <header className="mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-dossier-fg-muted">
          Outbound Comms
        </p>
        <h1 className="font-serif text-3xl text-dossier-fg leading-tight">
          Email Blast
        </h1>
        <p className="font-mono text-sm text-dossier-fg-muted mt-2 max-w-2xl">
          Logistics updates to confirmed guests. Sends individually so
          each recipient sees only their own address. Declined RSVPs are
          excluded from every audience.
        </p>
      </header>

      {sp.sent ? (
        <div className="mb-6 rounded-sm border border-copper/40 bg-copper/10 p-3 font-mono text-sm text-copper-bright">
          Sent {sp.sent}
          {Number(sp.failed) > 0 ? ` · failed ${sp.failed}` : ""}.
        </div>
      ) : null}

      <form
        action={sendBlast}
        className="space-y-5 p-6 bg-dossier-bg-elevated rounded-sm border border-dossier-fg/10"
      >
        <div>
          <Label className="text-dossier-fg-muted">Audience</Label>
          <div className="grid sm:grid-cols-3 gap-2 mt-2">
            <AudienceTile
              value="all"
              label="All confirmed"
              count={totals.all.size}
              defaultChecked
            />
            <AudienceTile
              value="adventure"
              label="Adventure only"
              count={totals.byChoice.get("adventure")?.size ?? 0}
            />
            <AudienceTile
              value="welcome"
              label="Welcome only"
              count={totals.byChoice.get("welcome")?.size ?? 0}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="subject" className="text-dossier-fg-muted">
            Subject
          </Label>
          <Input
            id="subject"
            name="subject"
            required
            placeholder="Mission update — what to bring Saturday"
            className="bg-dossier-bg border-dossier-fg/20 text-dossier-fg placeholder:text-dossier-fg-muted/60"
          />
        </div>

        <div>
          <Label htmlFor="body" className="text-dossier-fg-muted">
            Body
          </Label>
          <Textarea
            id="body"
            name="body"
            required
            rows={10}
            placeholder={"Agents,\n\nA few items for Saturday…"}
            className="bg-dossier-bg border-dossier-fg/20 text-dossier-fg placeholder:text-dossier-fg-muted/60"
          />
          <p className="font-mono text-[11px] text-dossier-fg-muted mt-1">
            Plain text. Blank lines become paragraphs.
          </p>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg">
            Transmit
          </Button>
        </div>
      </form>
    </main>
  );
}

function AudienceTile({
  value,
  label,
  count,
  defaultChecked,
}: {
  value: string;
  label: string;
  count: number;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-start gap-2 border border-dossier-fg/20 hover:border-copper rounded-sm p-3 cursor-pointer transition-colors has-[:checked]:border-copper has-[:checked]:bg-copper/10">
      <input
        type="radio"
        name="audience"
        value={value}
        defaultChecked={defaultChecked}
        className="mt-0.5 accent-copper"
      />
      <div>
        <p className="font-serif text-sm text-dossier-fg">{label}</p>
        <p className="font-mono text-[11px] text-dossier-fg-muted">
          {count} recipient{count === 1 ? "" : "s"}
        </p>
      </div>
    </label>
  );
}
