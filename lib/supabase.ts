import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client with the service-role key. Bypasses RLS.
 * Used ONLY from server actions and admin routes; never exposed to the
 * browser. We don't ship a browser client because every write path goes
 * through a server action — the page reads come from the admin/dashboard
 * RSC which also runs server-side.
 *
 * Both env vars are required at runtime. The throw is intentional — a
 * misconfigured env should fail loud at boot, not pretend to insert and
 * silently drop the RSVP.
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY (see .env.example).",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export type Rsvp = {
  id: string;
  created_at: string;
  updated_at: string;
  invite_type: "adventure" | "welcome";
  rsvp_choice: "adventure" | "welcome" | "declined";
  first_name: string;
  last_name: string;
  email: string;
  mobile_phone: string;
  guest_count: number;
  dietary_restrictions: string | null;
  meal_choice: "beef" | "chicken" | null;
  admin_notes: string | null;
};
