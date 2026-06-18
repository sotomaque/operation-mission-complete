import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession } from "iron-session";

import { getSessionOptions, type SessionData } from "@/lib/session";

/**
 * `/admin` is the natural URL someone types from memory. Without a page
 * here it 404s. Redirect to the right destination based on session
 * state:
 *
 *   • Authed → /admin/dashboard (skip the login round-trip)
 *   • Not    → /admin/login
 *
 * Conditional rather than a flat redirect to /admin/login so a returning
 * admin doesn't have to walk through the login screen just to bounce
 * straight onto the dashboard.
 */
export default async function AdminRootPage() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    getSessionOptions(),
  );
  redirect(session.isAdmin ? "/admin/dashboard" : "/admin/login");
}
