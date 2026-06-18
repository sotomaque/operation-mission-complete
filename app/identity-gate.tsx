"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { DossierFrame } from "@/components/dossier-frame";

/**
 * Identity gate. Renders as a client component so the localStorage
 * check happens on first paint without flashing the invite link. The
 * flag is PERMANENT — once Josh confirms "yes I'm Josh," the redirect
 * to /decoy sticks for that browser. Incognito is the only escape
 * hatch (by design — friend forwards the link, Josh fat-fingers Yes,
 * no easy exit).
 *
 * Wrapped by `app/page.tsx` in `<Suspense>` so the build-time static
 * pass doesn't bail out on `useSearchParams()`.
 */

const DECOY_FLAG_KEY = "omc_decoy_lock";

export function IdentityGate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // If Josh has already self-identified, the lock is permanent — push
    // back to /decoy regardless of the entry point.
    if (typeof window !== "undefined") {
      const locked = window.localStorage.getItem(DECOY_FLAG_KEY);
      if (locked === "true") {
        router.replace("/decoy");
        return;
      }
    }
    setChecked(true);
  }, [router]);

  function handleYes() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DECOY_FLAG_KEY, "true");
    }
    router.replace("/decoy");
  }

  function handleNo() {
    // `push` (not `replace`) so the browser back button traces back
    // here — easter egg: guests can revisit the gate and click "Yes
    // I'm Josh" for kicks, locking themselves out of the invite for
    // the joke. The "Yes" path still uses `replace` because that's
    // the lock-in moment for actual Josh.
    router.push(next || "/mission");
  }

  // Avoid flashing the gate before the localStorage check resolves.
  if (!checked) return null;

  return (
    <DossierFrame fileNumber="OMC-0001" classification="EYES ONLY">
      <header className="space-y-3 mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-dossier-ink-muted">
          Subject Verification · Step 01
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-dossier-ink leading-tight caret">
          Before we proceed.
        </h1>
        <p className="font-mono text-sm text-dossier-ink-muted max-w-md">
          This briefing concerns a subject of interest. Confirm your
          identity to continue.
        </p>
      </header>

      <div className="border-t border-b border-dossier-ink/20 py-8 space-y-6 reveal-2">
        <p className="font-serif text-2xl text-dossier-ink">
          Are you{" "}
          <span className="underline decoration-copper decoration-2 underline-offset-4">
            Josh
          </span>
          ?
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={handleYes}
            className="flex-1"
          >
            Yes — that's me
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleNo}
            className="flex-1"
          >
            No — proceed
          </Button>
        </div>
      </div>

      <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-dossier-ink-faint reveal-3">
        Coordinates redacted · Date redacted · Theme:{" "}
        <span className="text-copper">CLASSIFIED</span>
      </p>
    </DossierFrame>
  );
}
