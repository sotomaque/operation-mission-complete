import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";

import { getSessionOptions, type SessionData } from "@/lib/session";

/**
 * Logout endpoint. POST to clear the session and bounce to /admin/login.
 */
export async function POST() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    getSessionOptions(),
  );
  session.destroy();
  return NextResponse.redirect(
    new URL("/admin/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
    303,
  );
}
