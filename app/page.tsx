import { Suspense } from "react";

import { IdentityGate } from "./identity-gate";

/**
 * Server-component shell so Next.js's static-export pass doesn't choke
 * on `useSearchParams()` inside the client gate. The client component
 * is suspended; nothing renders until the params resolve in the
 * browser. Renders null as the fallback so we don't flash a different
 * frame before the dossier appears.
 */
export default function GatePage() {
  return (
    <Suspense fallback={null}>
      <IdentityGate />
    </Suspense>
  );
}
