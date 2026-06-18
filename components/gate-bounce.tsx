"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Deep-link gate enforcer. The /mission/[code] pages are linked
 * directly from QR codes, so they DON'T go through the / identity
 * gate. Drop this client island inside the page tree and it runs the
 * same localStorage check — if Josh has self-identified, he bounces
 * to /decoy.
 *
 * Renders null. The check is fast (single localStorage read in a
 * useEffect) but a real Josh might still see one frame of the form
 * before the redirect fires. Acceptable for a one-day-of-the-year
 * event; the security threat model is "Josh forwards link to a friend
 * who forwards it back to Josh" not "state actor."
 */
const DECOY_FLAG_KEY = "omc_decoy_lock";

export function GateBounce() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(DECOY_FLAG_KEY) === "true") {
      router.replace("/decoy");
    }
  }, [router]);
  return null;
}
