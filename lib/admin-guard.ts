import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession } from "iron-session";

import { getSessionOptions, type SessionData } from "@/lib/session";

/**
 * Server-side guard for /admin/* routes. Call at the top of every
 * admin RSC. Redirects to /admin/login if the session isn't admin.
 *
 * Returns nothing on the happy path so the caller can `await` it and
 * continue rendering.
 */
export async function requireAdmin() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    getSessionOptions(),
  );
  if (!session.isAdmin) {
    redirect("/admin/login");
  }
}
