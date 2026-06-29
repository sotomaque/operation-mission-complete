"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

/**
 * Escape hatch off the decoy. Clicking "Yes — that's me" on the gate
 * sets a PERMANENT localStorage lock, which is great for fooling Josh
 * but traps any guest who fat-fingered the wrong button. This clears
 * the lock and sends them back to route selection so they can pick the
 * correct briefing.
 *
 * Kept understated + on-theme so it doesn't blow the gag for the real
 * subject — a genuine Josh has no reason to hunt for a way out.
 */
const DECOY_FLAG_KEY = "omc_decoy_lock";

export function DecoyEscape() {
  const router = useRouter();

  function handleEscape() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DECOY_FLAG_KEY);
    }
    router.replace("/mission");
  }

  return (
    <div className="space-y-2">
      <Button variant="outline" size="sm" onClick={handleEscape}>
        Filed in error? Return to your briefing.
      </Button>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dossier-ink-faint">
        Only if you reached this page by mistake.
      </p>
    </div>
  );
}
