import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/lib/admin-guard";
import { getSupabaseAdmin, type Rsvp } from "@/lib/supabase";

import { CapacityEditor } from "./capacity-editor";
import { EditRsvpDialog } from "./edit-rsvp-dialog";
import { DeleteRsvpButton } from "./delete-rsvp-button";
import { RsvpMobileCard } from "./rsvp-mobile-card";

/**
 * Admin dashboard — guest manifest, capacity counters, search, edit,
 * CSV export. The "dossier" theming is preserved (paper card, monospace
 * type) so the admin surface feels like part of the same world.
 *
 * Server-rendered. Search and filter come from the URL query string so
 * they're shareable and survive refresh.
 */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    choice?: string;
    invite?: string;
  }>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  const db = getSupabaseAdmin();

  // Top-level counters — same query for both, just filtered. Cheap
  // enough at our scale (hundreds, not millions).
  const [allRows, cfgRow] = await Promise.all([
    db.from("rsvps").select("*").order("created_at", { ascending: false }),
    db
      .from("config")
      .select("value")
      .eq("key", "adventure_capacity")
      .single(),
  ]);

  const rows = (allRows.data ?? []) as Rsvp[];
  const adventureCap = Number(cfgRow.data?.value ?? 50);

  const totals = rows.reduce(
    (acc, r) => {
      acc.totalGuests += r.guest_count;
      if (r.rsvp_choice === "adventure") {
        acc.adventure += 1;
        acc.adventureGuests += r.guest_count;
      } else if (r.rsvp_choice === "welcome") {
        acc.welcome += 1;
        acc.welcomeGuests += r.guest_count;
      } else {
        acc.declined += 1;
      }
      return acc;
    },
    {
      totalGuests: 0,
      adventure: 0,
      adventureGuests: 0,
      welcome: 0,
      welcomeGuests: 0,
      declined: 0,
    },
  );

  // Filter view AFTER counting so the counters always reflect the
  // full pool, not the filtered subset.
  const q = (sp.q ?? "").toLowerCase().trim();
  const choice = sp.choice ?? "";
  const invite = sp.invite ?? "";
  const filtered = rows.filter((r) => {
    if (choice && r.rsvp_choice !== choice) return false;
    if (invite && r.invite_type !== invite) return false;
    if (q) {
      const hay = `${r.first_name} ${r.last_name} ${r.email} ${r.mobile_phone}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return (
    <main className="min-h-screen px-3 py-6 sm:px-4 sm:py-8 max-w-7xl mx-auto">
      {/* Header band. Title on top, actions below on mobile. Actions
          flow-wrap on small screens so they're never crammed; on `sm:`+
          they sit on a single row aligned to the right. */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] text-dossier-fg-muted">
            Operation: Mission Complete
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl text-dossier-fg leading-tight">
            Guest Manifest
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Link href="/admin/qr">
            <Button variant="ghost" size="sm">
              QR
            </Button>
          </Link>
          <Link href="/admin/email">
            <Button variant="ghost" size="sm">
              Email
            </Button>
          </Link>
          <Link href="/admin/export">
            <Button variant="ghost" size="sm">
              Export
            </Button>
          </Link>
          <form action="/admin/logout" method="POST">
            <Button variant="ghost" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        </div>
      </div>

      {/* Counters strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Counter label="Total RSVPs" value={rows.length} />
        <Counter
          label="Adventure"
          value={`${totals.adventure} / ${adventureCap}`}
          sub={`${totals.adventureGuests} guests`}
          warning={totals.adventure >= adventureCap}
        />
        <Counter
          label="Welcome"
          value={totals.welcome}
          sub={`${totals.welcomeGuests} guests`}
        />
        <Counter label="Declined" value={totals.declined} />
        <Counter label="Total guests" value={totals.totalGuests} />
      </div>

      {/* Capacity editor — separate client component so the input can
          be controlled and the submit is a server action. */}
      <CapacityEditor currentCap={adventureCap} taken={totals.adventure} />

      {/* Filter bar. Mobile: full-width stacked inputs, two-button row
          at the bottom. `sm:+`: horizontal flow with search expanding
          to fill remaining space. */}
      <form
        method="GET"
        className="my-6 p-4 bg-dossier-bg-elevated rounded-sm border border-dossier-fg/10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-2"
      >
        <div className="sm:flex-1 sm:min-w-48">
          <label
            htmlFor="q"
            className="block font-mono text-[10px] uppercase tracking-[0.25em] text-dossier-fg-muted mb-1"
          >
            Search
          </label>
          <Input
            id="q"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Name, email, phone…"
            className="bg-dossier-bg border-dossier-fg/20 text-dossier-fg placeholder:text-dossier-fg-muted/60"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:contents">
          <div>
            <label
              htmlFor="choice"
              className="block font-mono text-[10px] uppercase tracking-[0.25em] text-dossier-fg-muted mb-1"
            >
              Choice
            </label>
            <select
              id="choice"
              name="choice"
              defaultValue={sp.choice ?? ""}
              className="h-11 w-full px-3 rounded-sm border border-dossier-fg/20 bg-dossier-bg text-dossier-fg font-mono text-sm"
            >
              <option value="">All</option>
              <option value="adventure">Adventure</option>
              <option value="welcome">Welcome</option>
              <option value="declined">Declined</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="invite"
              className="block font-mono text-[10px] uppercase tracking-[0.25em] text-dossier-fg-muted mb-1"
            >
              Invite link
            </label>
            <select
              id="invite"
              name="invite"
              defaultValue={sp.invite ?? ""}
              className="h-11 w-full px-3 rounded-sm border border-dossier-fg/20 bg-dossier-bg text-dossier-fg font-mono text-sm"
            >
              <option value="">All</option>
              <option value="adventure">A · Adventure</option>
              <option value="welcome">B · Welcome</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:contents">
          <Button type="submit" variant="primary" size="default" className="w-full sm:w-auto">
            Apply
          </Button>
          <Link href="/admin/dashboard" className="w-full sm:w-auto">
            <Button type="button" variant="ghost" size="default" className="w-full">
              Clear
            </Button>
          </Link>
        </div>
      </form>

      {/* Mobile manifest — cards. Hidden at md:+ where the table takes
          over. The card layout surfaces decision-essentials (name,
          choice, guest count, contact); everything else is one tap
          away in the existing edit dialog. */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-sm border border-dossier-fg/10 bg-dossier-bg-elevated p-6 text-center font-mono text-sm text-dossier-fg-muted">
            No matches.
          </div>
        ) : (
          filtered.map((r) => <RsvpMobileCard key={r.id} rsvp={r} />)
        )}
      </div>

      {/* Desktop manifest table — hidden under md: */}
      <div className="hidden md:block overflow-x-auto bg-dossier-bg-elevated rounded-sm border border-dossier-fg/10">
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="text-left text-dossier-fg-muted text-xs uppercase tracking-[0.2em] border-b border-dossier-fg/10">
              <th className="px-3 py-3 font-medium">Name</th>
              <th className="px-3 py-3 font-medium">Email</th>
              <th className="px-3 py-3 font-medium">Phone</th>
              <th className="px-3 py-3 font-medium text-center">Guests</th>
              <th className="px-3 py-3 font-medium">Choice</th>
              <th className="px-3 py-3 font-medium">Invite</th>
              <th className="px-3 py-3 font-medium">Meal</th>
              <th className="px-3 py-3 font-medium">Notes / Diet</th>
              <th className="px-3 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-8 text-center text-dossier-fg-muted"
                >
                  No matches.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-dossier-fg/5 hover:bg-dossier-fg/5"
                >
                  <td className="px-3 py-3 text-dossier-fg">
                    {r.first_name} {r.last_name}
                  </td>
                  <td className="px-3 py-3 text-dossier-fg-muted">
                    {r.email}
                  </td>
                  <td className="px-3 py-3 text-dossier-fg-muted">
                    {r.mobile_phone}
                  </td>
                  <td className="px-3 py-3 text-dossier-fg text-center">
                    {r.guest_count}
                  </td>
                  <td className="px-3 py-3">
                    <ChoicePill choice={r.rsvp_choice} />
                  </td>
                  <td className="px-3 py-3 text-dossier-fg-muted">
                    {r.invite_type === "adventure" ? "A" : "B"}
                  </td>
                  <td className="px-3 py-3 text-dossier-fg-muted">
                    {r.meal_choice ?? "—"}
                  </td>
                  <td className="px-3 py-3 text-dossier-fg-muted text-xs max-w-xs truncate">
                    {[r.dietary_restrictions, r.admin_notes]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <EditRsvpDialog rsvp={r} />
                      <DeleteRsvpButton id={r.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-dossier-fg-muted">
        Showing {filtered.length} of {rows.length}
      </p>
    </main>
  );
}

function Counter({
  label,
  value,
  sub,
  warning,
}: {
  label: string;
  value: number | string;
  sub?: string;
  warning?: boolean;
}) {
  return (
    <div
      className={`rounded-sm border p-3 ${
        warning
          ? "border-classified-red/50 bg-classified-red/10"
          : "border-dossier-fg/10 bg-dossier-bg-elevated"
      }`}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-dossier-fg-muted">
        {label}
      </p>
      <p
        className={`font-serif text-2xl mt-1 ${
          warning ? "text-classified-red-bright" : "text-dossier-fg"
        }`}
      >
        {value}
      </p>
      {sub ? (
        <p className="font-mono text-[10px] text-dossier-fg-muted mt-0.5">
          {sub}
        </p>
      ) : null}
    </div>
  );
}

function ChoicePill({
  choice,
}: {
  choice: "adventure" | "welcome" | "declined";
}) {
  const map = {
    adventure: {
      label: "Adventure",
      cls: "border-brass/60 bg-brass/15 text-brass",
    },
    welcome: {
      label: "Celebration",
      cls: "border-copper/60 bg-copper/15 text-copper-bright",
    },
    declined: {
      label: "Declined",
      cls: "border-dossier-fg/30 bg-dossier-fg/8 text-dossier-fg-muted",
    },
  } as const;
  const v = map[choice];
  return (
    <span
      className={`inline-block border px-2 py-0.5 rounded-sm font-mono text-[11px] uppercase tracking-[0.15em] ${v.cls}`}
    >
      {v.label}
    </span>
  );
}
