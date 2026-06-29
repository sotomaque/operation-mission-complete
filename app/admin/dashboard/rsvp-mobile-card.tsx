import type { Rsvp } from "@/lib/supabase";

import { DeleteRsvpButton } from "./delete-rsvp-button";
import { EditRsvpDialog } from "./edit-rsvp-dialog";

/**
 * Mobile card representation of a single RSVP row. The 9-column
 * desktop table is unusable on a phone — this card surfaces the
 * decision-essentials (name, choice, guest count, contact) and pushes
 * everything else into the edit dialog which already exists.
 *
 * Renders only at `<md` (handled by the dashboard's container — table
 * shows at `md:`, cards show at base).
 */
export function RsvpMobileCard({ rsvp: r }: { rsvp: Rsvp }) {
  return (
    <article className="rounded-sm border border-dossier-fg/10 bg-dossier-bg-elevated p-4 font-mono text-sm">
      <header className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="text-dossier-fg text-base font-medium truncate">
            {r.first_name} {r.last_name}
          </p>
          <p className="text-dossier-fg-muted text-xs truncate">{r.email}</p>
        </div>
        <ChoicePill choice={r.rsvp_choice} />
      </header>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <Field label="Phone" value={r.mobile_phone} mono />
        <Field
          label="Guests"
          value={String(r.guest_count)}
          mono
        />
        <Field
          label="Invite"
          value={r.invite_type === "adventure" ? "A · Adventure" : "B · Welcome"}
        />
        <Field label="Meal" value={r.meal_choice ?? "—"} />
      </dl>

      {(r.dietary_restrictions || r.admin_notes) && (
        <div className="mt-3 pt-3 border-t border-dossier-fg/10 text-xs text-dossier-fg-muted">
          {[r.dietary_restrictions, r.admin_notes].filter(Boolean).join(" · ")}
        </div>
      )}

      <footer className="mt-4 flex items-center justify-end gap-1">
        <EditRsvpDialog rsvp={r} />
        <DeleteRsvpButton id={r.id} />
      </footer>
    </article>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] uppercase tracking-[0.2em] text-dossier-fg-muted">
        {label}
      </dt>
      <dd
        className={`mt-0.5 text-dossier-fg truncate ${mono ? "font-mono" : ""}`}
      >
        {value}
      </dd>
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
      className={`shrink-0 inline-block border px-2 py-0.5 rounded-sm font-mono text-[11px] uppercase tracking-[0.15em] ${v.cls}`}
    >
      {v.label}
    </span>
  );
}
