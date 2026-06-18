import { DossierFrame } from "@/components/dossier-frame";

/**
 * The decoy. Once "Yes I'm Josh" is confirmed, the localStorage flag is
 * permanent — every subsequent visit to ANY route inside the gate
 * bounces here. Tone: cheerful, dry, nothing to investigate. Premium
 * not cartoonish.
 */
export default function DecoyPage() {
  return (
    <DossierFrame fileNumber="—" classification="UNREMARKABLE">
      <div className="space-y-8">
        <header className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-dossier-ink-muted">
            Document · Routine
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-dossier-ink leading-tight">
            Nothing to see here.
          </h1>
        </header>

        <p className="font-mono text-base text-dossier-ink leading-relaxed">
          Sunshine. Rainbows. A gentle breeze. A bowl of unremarkable
          oats. Completely normal activities, all of them — the kind any
          reasonable adult might enjoy on a Saturday afternoon.
        </p>

        <div className="border-l-2 border-copper pl-4 space-y-1">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper">
            Bulletin
          </p>
          <p className="font-serif text-lg text-dossier-ink">
            No events of note are scheduled in your vicinity.
          </p>
        </div>

        <p className="font-mono text-sm text-dossier-ink-muted leading-relaxed">
          If you believed you were arriving at a briefing of consequence,
          please disregard. Refresh, retry, or return another day. You
          will not find what you are looking for here.
        </p>

        <div className="pt-6 border-t border-dossier-ink/20">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-dossier-ink-faint">
            Carry on as you were.
          </p>
        </div>
      </div>
    </DossierFrame>
  );
}
