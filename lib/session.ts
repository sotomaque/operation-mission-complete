import type { SessionOptions } from "iron-session";

/**
 * iron-session config for the admin auth cookie. We're not running a
 * real auth provider — admin access is gated by a single shared
 * password kept in `ADMIN_PASSWORD`. Successful login sets
 * `session.isAdmin = true` and iron-session signs the cookie with
 * `SESSION_SECRET` so it can't be forged client-side.
 */

export type SessionData = {
  isAdmin?: boolean;
};

export function getSessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set (>= 32 chars). Generate with: openssl rand -base64 32",
    );
  }
  return {
    password,
    cookieName: "omc_admin_session",
    cookieOptions: {
      // `secure: true` in production (Vercel forces HTTPS), false in
      // local dev so the cookie sets over http://localhost.
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      // 30-day TTL — admin doesn't need to re-auth every browser session
      // while they manage the guest list over the runway to the event.
      maxAge: 60 * 60 * 24 * 30,
    },
  };
}
