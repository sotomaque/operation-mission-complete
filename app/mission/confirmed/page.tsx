import { DossierFrame } from "@/components/dossier-frame";

/**
 * Confirmation receipt after a successful RSVP. Pirate-themed for the
 * adventure path, dossier-styled for the welcome / declined paths. The
 * `?type=` query param drives the tonal difference but the layout is
 * the same.
 */
export default async function ConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const sp = await searchParams;
  const type = sp.type ?? "welcome";
  const adventure = type === "adventure";
  const declined = type === "declined";

  return (
    <DossierFrame
      fileNumber="OMC-2026"
      classification={declined ? "REGRETS RECEIVED" : "RSVP CONFIRMED"}
    >
      <div className="space-y-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-copper">
          Transmission received
        </p>

        {adventure ? (
          <>
            <h1
              className="text-5xl text-dossier-ink leading-tight"
              style={{ fontFamily: "'Pirata One', serif" }}
            >
              Welcome aboard, agent.
            </h1>
            <p className="font-serif text-lg text-dossier-ink leading-snug">
              Your name has been added to the crew manifest. You sail
              at half-past four.
            </p>
            <div className="border-l-2 border-treasure-gold pl-4 space-y-1">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-treasure-gold">
                What to bring
              </p>
              <ul className="font-mono text-sm text-dossier-ink space-y-0.5">
                <li>· Layers — breeze on the water</li>
                <li>· Closed-toe shoes</li>
                <li>· Your best straight face for the celebration at 6:30</li>
              </ul>
            </div>
          </>
        ) : declined ? (
          <>
            <h1 className="font-serif text-4xl md:text-5xl text-dossier-ink leading-tight">
              Noted. Stand down.
            </h1>
            <p className="font-serif text-lg text-dossier-ink-muted">
              We'll miss you. Your regrets have been logged. We'll keep
              your contact details in case plans change.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-4xl md:text-5xl text-dossier-ink leading-tight">
              See you shoreside.
            </h1>
            <p className="font-serif text-lg text-dossier-ink leading-snug">
              Your name has been added to the celebration roster.
              We'll send logistics as we approach the date.
            </p>
          </>
        )}

        <div className="border-t border-dossier-ink/20 pt-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-dossier-ink-muted mb-1">
            Mission Date
          </p>
          <p className="font-serif text-xl text-dossier-ink">
            Saturday, 15 August 2026
          </p>
          <p className="font-mono text-xs text-dossier-ink-muted mt-3">
            Drop Point Foxtrot · 1360 N Harbor Dr, San Diego, CA 92101
          </p>
        </div>

        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-dossier-ink-faint">
          This message will not self-destruct. Keep it.
        </p>
      </div>
    </DossierFrame>
  );
}
