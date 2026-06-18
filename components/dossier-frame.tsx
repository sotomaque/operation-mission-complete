import { cn } from "@/lib/utils";

/**
 * The outer classified-dossier frame. Header band, paper card, optional
 * coordinate strip. Every public page (gate, decoy, RSVP) renders inside
 * one of these so the theme stays consistent.
 *
 * Pirate styling is contained to a CHILD card inside the paper, not the
 * frame itself — this stays "intelligence briefing."
 */
export function DossierFrame({
  children,
  fileNumber,
  classification = "EYES ONLY",
  className,
}: {
  children: React.ReactNode;
  fileNumber?: string;
  classification?: string;
  className?: string;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div
        className={cn(
          "w-full max-w-2xl",
          "[--paper-edge:theme(colors.dossier-paper-edge)]",
          className,
        )}
      >
        {/* Top band: title + classification stamp + file number */}
        <div className="flex items-end justify-between gap-4 mb-3 font-mono text-xs text-dossier-fg-muted">
          <div className="flex items-center gap-3">
            <span className="text-copper-bright tracking-[0.3em] font-bold">
              OPERATION
            </span>
            <span className="tracking-[0.3em]">MISSION COMPLETE</span>
          </div>
          {fileNumber ? (
            <div className="tracking-[0.2em]">
              FILE&nbsp;NO.&nbsp;{fileNumber}
            </div>
          ) : null}
        </div>

        {/* Paper card */}
        <article className="paper rounded-sm p-8 md:p-12 relative reveal">
          {/* Classification stamp top-right */}
          <div className="absolute top-6 right-6">
            <span className="stamp">{classification}</span>
          </div>
          {children}
        </article>

        {/* Footer band: file metadata */}
        <div className="mt-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.25em] text-dossier-fg-muted">
          <span>Distribution: Restricted</span>
          <span>This document self-destructs · 08·16·26</span>
        </div>
      </div>
    </main>
  );
}
