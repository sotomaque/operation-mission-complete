import { notFound } from "next/navigation";

import { DossierFrame } from "@/components/dossier-frame";
import { RsvpForm } from "@/components/rsvp-form";
import { GateBounce } from "@/components/gate-bounce";

import { getAdventureCapacityStatus } from "./actions";

const VALID_CODES = ["adventure", "welcome"] as const;
type Code = (typeof VALID_CODES)[number];

function isCode(c: string): c is Code {
  return (VALID_CODES as readonly string[]).includes(c);
}

/**
 * RSVP page. Two URL forms drive the same component:
 *   • /mission/adventure  — both options (Adventure + Welcome) surface.
 *   • /mission/welcome    — Welcome only.
 *
 * Adventure capacity is checked server-side via
 * `getAdventureCapacityStatus()` and the option is hidden if the cap
 * is hit. The form's server action ALSO re-checks atomically inside
 * the Postgres function — defense in depth against the cap filling up
 * between page render and submission.
 *
 * The gate (/) doesn't run as a layout, so deep links land here
 * directly. `<GateBounce />` checks the localStorage decoy lock
 * client-side and bounces to /decoy if Josh is here. The lock check
 * happens fast enough that it's pre-paint for the normal case.
 */
export default async function MissionRsvpPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  if (!isCode(code)) notFound();

  const showAdventure = code === "adventure";
  const adventure = showAdventure
    ? await getAdventureCapacityStatus()
    : null;
  const adventureAvailable = showAdventure && adventure?.available === true;

  return (
    <>
      <GateBounce />
      <DossierFrame fileNumber="OMC-1815" classification="CLASSIFIED">
        <header className="space-y-3 mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-dossier-ink-muted">
            Mission briefing · Step 03
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-dossier-ink leading-tight">
            Operation: Mission Complete
          </h1>
          <p className="font-serif text-lg text-dossier-ink-muted italic">
            Subject turns 50. The target is unaware. You are not.
          </p>
        </header>

        {/* Coordinate strip — same for both codes, gives the briefing
            a survey-marker vibe. */}
        <div className="coords flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm mb-8">
          <div>
            <span className="text-dossier-ink-muted">Date</span> ·{" "}
            <span className="font-bold">Sat 15 Aug 2026</span>
          </div>
          <div>
            <span className="text-dossier-ink-muted">Coords</span> ·{" "}
            <span className="font-bold">32°43′04″N · 117°10′21″W</span>
          </div>
        </div>

        {/* Rendezvous block — pinned for both flows. */}
        <div className="space-y-1 mb-8 reveal-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-copper">
            Rendezvous Point
          </p>
          <p className="font-serif text-xl text-dossier-ink leading-snug">
            Drop Point Foxtrot
          </p>
          <p className="font-mono text-sm text-dossier-ink-muted">
            1360 N Harbor Dr, San Diego, CA 92101
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-dossier-ink-faint mt-1">
            Meet curbside. Stand by for handler contact. Do not enter
            any establishment ahead of pickup.
          </p>
        </div>

        {/* Option cards — adventure is conditional, welcome is always
            there. Adventure shows different copy when full. */}
        <div className="grid gap-4 mb-8 reveal-3">
          {showAdventure && adventureAvailable ? (
            <AdventureOptionCard />
          ) : showAdventure ? (
            <AdventureFullNotice />
          ) : null}
          <WelcomeOptionCard />
        </div>

        {/* The form. inviteType is fixed per-page; rsvpChoice comes
            from the form's radio. */}
        <div className="border-t border-dossier-ink/20 pt-8">
          <RsvpForm
            inviteType={code}
            adventureAvailable={adventureAvailable}
          />
        </div>
      </DossierFrame>
    </>
  );
}

function AdventureOptionCard() {
  return (
    <div className="border border-brass/50 bg-brass/8 rounded-sm p-5 relative">
      <div className="flex items-start gap-3">
        <div className="font-serif text-3xl text-brass leading-none mt-0.5">
          ★
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-copper mb-1">
            Option A · The Adventure
          </p>
          <p className="font-serif text-2xl text-dossier-ink leading-snug mb-2">
            Rendezvous at sixteen-thirty hours
          </p>
          <p className="font-mono text-sm text-dossier-ink mb-2">
            Rendezvous for the adventure at 4:30 — or join the
            celebration at 6:30 (your call once you arrive).
          </p>
          <ul className="space-y-1 font-mono text-sm text-dossier-ink">
            <li>
              <span className="text-dossier-ink-muted">Nature</span> ·
              Classified, declassified day-of
            </li>
            <li>
              <span className="text-dossier-ink-muted">Duration</span> ·
              Approximately 2 hours
            </li>
            <li>
              <span className="text-dossier-ink-muted">Followed by</span>
              · Celebration at 6:30 PM
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function AdventureFullNotice() {
  return (
    <div className="border border-dossier-ink/30 bg-dossier-paper/60 rounded-sm p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-classified-red mb-1">
        Option A · The Adventure
      </p>
      <p className="font-serif text-lg text-dossier-ink mb-1">
        Operation at capacity.
      </p>
      <p className="font-mono text-sm text-dossier-ink-muted">
        The manifest is full. Please proceed with the Celebration
        option — we'll see you there.
      </p>
    </div>
  );
}

function WelcomeOptionCard() {
  return (
    <div className="border border-dossier-ink/30 bg-dossier-paper/60 rounded-sm p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-copper mb-1">
        Option B · Celebration only
      </p>
      <p className="font-serif text-2xl text-dossier-ink leading-snug mb-2">
        Join us for the Celebration at 6:30
      </p>
      <ul className="space-y-1 font-mono text-sm text-dossier-ink">
        <li>
          <span className="text-dossier-ink-muted">Arrival</span> · 6:30
          PM
        </li>
      </ul>
    </div>
  );
}
