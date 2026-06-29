import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DossierFrame } from "@/components/dossier-frame";

/**
 * Fallback landing for guests who hit /mission without an invite code.
 * Normal entry is via QR → /mission/adventure or /mission/welcome.
 * This card exists so a forwarded text or a manually-typed URL doesn't
 * 404 — the guest picks which envelope they had and continues.
 *
 * The gate (/) sends "No, I'm not Josh" answers here when no `?next=`
 * was set. From the QR path, `/mission/[code]` handles its own gate
 * bounce with `?next=/mission/[code]` so the right page comes back.
 */
export default function MissionLanding() {
  return (
    <DossierFrame fileNumber="OMC-0042" classification="ROUTE SELECTION">
      <header className="space-y-3 mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-dossier-ink-muted">
          Verification confirmed · Step 02
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-dossier-ink leading-tight">
          Which envelope did you receive?
        </h1>
        <p className="font-mono text-sm text-dossier-ink-muted max-w-md">
          Each invitation carries a different briefing. If you arrived
          here without one, pick the option that matches the seal on
          your envelope.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4 reveal-2">
        <Link href="/mission/adventure" className="group block">
          <div className="border border-dossier-ink/30 bg-dossier-paper/60 rounded-sm p-5 h-full transition-all hover:border-copper hover:bg-dossier-paper/80 hover:-translate-y-0.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-copper mb-2">
              Seal · Alpha
            </p>
            <p className="font-serif text-xl text-dossier-ink mb-1">
              Adventure + Celebration
            </p>
            <p className="font-mono text-xs text-dossier-ink-muted">
              Daytime mystery + evening rendezvous.
            </p>
          </div>
        </Link>

        <Link href="/mission/welcome" className="group block">
          <div className="border border-dossier-ink/30 bg-dossier-paper/60 rounded-sm p-5 h-full transition-all hover:border-copper hover:bg-dossier-paper/80 hover:-translate-y-0.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-copper mb-2">
              Seal · Bravo
            </p>
            <p className="font-serif text-xl text-dossier-ink mb-1">
              Celebration
            </p>
            <p className="font-mono text-xs text-dossier-ink-muted">
              The evening rendezvous only.
            </p>
          </div>
        </Link>
      </div>

      <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-dossier-ink-faint">
        Not sure?{" "}
        <Link
          href="/mission/welcome"
          className="text-copper hover:text-copper-bright underline underline-offset-2"
        >
          Pick the Celebration — never the wrong choice.
        </Link>
      </p>
    </DossierFrame>
  );
}
