import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";

import { getSessionOptions, type SessionData } from "@/lib/session";

/**
 * Logout endpoint. POST to clear the session and bounce to `/`.
 *
 * Two reasons we land on `/` instead of `/admin/login`:
 *
 *   1. The admin who just signed out is rarely the next visitor — much
 *      more often the next view is "let me check the gate / public site
 *      from a fresh state." Landing on `/` gives them that without an
 *      extra click.
 *
 *   2. The previous destination was `/admin/login`, but the URL was
 *      built from `NEXT_PUBLIC_APP_URL` — when that env var doesn't
 *      match the host the request actually arrived on (preview deploy,
 *      custom domain, etc.), the redirect target's origin is wrong and
 *      browsers render a blank page. Building the redirect from
 *      `request.url`'s origin is robust against every deployment shape.
 */
export async function POST(request: Request) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    getSessionOptions(),
  );
  session.destroy();
  return NextResponse.redirect(new URL("/", request.url), 303);
}
