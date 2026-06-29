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
  classification = "CLASSIFIED",
  className,
}: {
  children: React.ReactNode;
  fileNumber?: string;
  classification?: string;
  className?: string;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center px-3 py-6 sm:px-4 sm:py-10">
      <div
        className={cn(
          "w-full max-w-2xl",
          "[--paper-edge:theme(colors.dossier-paper-edge)]",
          className,
        )}
      >
        {/* Top band: title + file number. Mobile-tighter sizing so the
            tracking-[0.3em] type doesn't wrap awkwardly on a 375px
            viewport; the file number drops to its own line under
            ~360px instead of crowding the title. */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-3 font-mono text-[10px] sm:text-xs text-dossier-fg-muted">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-copper-bright tracking-[0.2em] sm:tracking-[0.3em] font-bold">
              OPERATION
            </span>
            <span className="tracking-[0.2em] sm:tracking-[0.3em]">
              MISSION COMPLETE
            </span>
          </div>
          {fileNumber ? (
            <div className="tracking-[0.15em] sm:tracking-[0.2em]">
              FILE&nbsp;NO.&nbsp;{fileNumber}
            </div>
          ) : null}
        </div>

        {/* Paper card. Tighter padding on mobile so the inner content
            isn't fighting for horizontal space on a 375px viewport.
            Classification stamp moves below the top edge on mobile so
            it doesn't overlap the page heading. */}
        <article className="paper rounded-sm p-5 sm:p-8 md:p-12 relative reveal">
          {/* Classification stamp. On mobile, the stamp sits inline at
              the top of the card content (`mb-4` block) instead of
              absolute-positioned (which overlaps page headers at
              narrow widths). At sm:+ it goes back to its absolute
              top-right slot. */}
          <div className="mb-4 sm:mb-0 sm:absolute sm:top-6 sm:right-6">
            <span className="stamp">{classification}</span>
          </div>
          {children}
        </article>

        {/* Footer band: file metadata + easter-egg re-verify link. The
            "wait — am I Josh?" link routes back to / where curious
            guests can pick "Yes" for the joke and permanently lock
            themselves out. Subtle so it reads as flavor text, not
            navigation.

            Mobile: the easter-egg link gets its own row centered
            underneath the meta strip so the three items aren't
            crammed at illegible sizes. */}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[10px] font-mono uppercase tracking-[0.2em] sm:tracking-[0.25em] text-dossier-fg-muted">
          <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-0">
            <span>Distribution: Restricted</span>
            <span className="sm:hidden">Self-destructs · 08·16·26</span>
          </div>
          <a
            href="/"
            className="text-dossier-fg-muted hover:text-copper-bright transition-colors order-first sm:order-none"
          >
            Wait — am I Josh?
          </a>
          <span className="hidden sm:inline">Self-destructs · 08·16·26</span>
        </div>
      </div>
    </main>
  );
}
