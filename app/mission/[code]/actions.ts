"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * Server action for the RSVP form. Validates input + race-safely
 * enforces adventure capacity by checking the current count inside a
 * single Supabase call (RLS-free service role; capacity is a JSONB cell
 * on the config row).
 *
 * Capacity race: two guests submitting `adventure` at the same time
 * could both see "49 < 50" and both insert. Supabase JS doesn't expose
 * SELECT ... FOR UPDATE conveniently from the client lib, so we use a
 * Postgres RPC (`reserve_adventure_seat`) that does the check + insert
 * atomically. The function lives in supabase/schema.sql.
 *
 * Return shape: { ok: true } on success → redirect to confirmation. On
 * validation failure: { ok: false, fieldErrors }. On capacity-full:
 * { ok: false, capacityFull: true } so the page can fall back to the
 * welcome-only flow without an angry red banner.
 */

const rsvpInput = z.object({
  inviteType: z.enum(["adventure", "welcome"]),
  rsvpChoice: z.enum(["adventure", "welcome", "declined"]),
  firstName: z.string().trim().min(1, "Required").max(60),
  lastName: z.string().trim().min(1, "Required").max(60),
  email: z.string().trim().email("Looks malformed").max(255),
  mobilePhone: z
    .string()
    .trim()
    .min(7, "Looks too short")
    .max(30, "Looks too long"),
  guestCount: z.coerce.number().int().min(1).max(10),
  dietaryRestrictions: z.string().trim().max(500).optional().nullable(),
  mealChoice: z.enum(["beef", "chicken"]).optional().nullable(),
});

export type RsvpFormState =
  | { ok: true; redirectTo: string }
  | { ok: false; message: string; capacityFull?: boolean }
  | null;

export async function submitRsvp(
  _prev: RsvpFormState,
  formData: FormData,
): Promise<RsvpFormState> {
  // Coerce the FormData into the zod-validated shape. Nullable fields
  // come back as the empty string from the form; normalize to null so
  // the DB sees the right "absent" value.
  const raw = {
    inviteType: formData.get("inviteType"),
    rsvpChoice: formData.get("rsvpChoice"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    mobilePhone: formData.get("mobilePhone"),
    // Declined RSVPs don't render the party-size stepper, so no
    // guestCount is submitted. Fall back to 1 (the DB column is
    // NOT NULL with a 1–10 check) instead of failing validation.
    guestCount: formData.get("guestCount") ?? 1,
    dietaryRestrictions: formData.get("dietaryRestrictions") || null,
    mealChoice: formData.get("mealChoice") || null,
  };

  const parsed = rsvpInput.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      message: first ? `${first.path.join(".")}: ${first.message}` : "Invalid form",
    };
  }

  const db = getSupabaseAdmin();
  const data = parsed.data;

  // Capacity check — only for adventure RSVPs. Done via RPC so the
  // count + insert run inside the same transaction with a row-level
  // lock on the config row. See supabase/schema.sql for the function
  // body.
  if (data.rsvpChoice === "adventure") {
    const { data: reserved, error } = await db.rpc(
      "reserve_adventure_seat",
      {
        p_invite_type: data.inviteType,
        p_first_name: data.firstName,
        p_last_name: data.lastName,
        p_email: data.email.toLowerCase(),
        p_mobile_phone: data.mobilePhone,
        p_guest_count: data.guestCount,
        p_dietary_restrictions: data.dietaryRestrictions,
        p_meal_choice: data.mealChoice,
      },
    );
    if (error) {
      // duplicate email → friendly message
      if (error.code === "23505") {
        return {
          ok: false,
          message:
            "An RSVP already exists for that email — reach out to the host to update it.",
        };
      }
      // capacity_full custom raise → handle specially
      if (error.message?.includes("capacity_full")) {
        return { ok: false, capacityFull: true, message: "Adventure is full" };
      }
      console.error("[submitRsvp] capacity-check rpc failed", error);
      return { ok: false, message: "Something went sideways on our side." };
    }
    if (!reserved) {
      return { ok: false, capacityFull: true, message: "Adventure is full" };
    }
  } else {
    // Welcome / declined — plain insert, no capacity check.
    const { error } = await db.from("rsvps").insert({
      invite_type: data.inviteType,
      rsvp_choice: data.rsvpChoice,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email.toLowerCase(),
      mobile_phone: data.mobilePhone,
      guest_count: data.guestCount,
      dietary_restrictions: data.dietaryRestrictions,
      meal_choice: data.mealChoice,
    });
    if (error) {
      if (error.code === "23505") {
        return {
          ok: false,
          message:
            "An RSVP already exists for that email — reach out to the host to update it.",
        };
      }
      console.error("[submitRsvp] insert failed", error);
      return { ok: false, message: "Something went sideways on our side." };
    }
  }

  redirect(`/mission/confirmed?type=${data.rsvpChoice}`);
}

/** Server-only adventure-capacity check used by the RSVP page to decide
 *  whether to render the adventure option. Reads the cap from the
 *  config row + the current count of confirmed adventure RSVPs. Called
 *  from the RSC body of the form route. */
export async function getAdventureCapacityStatus(): Promise<{
  cap: number;
  taken: number;
  available: boolean;
}> {
  const db = getSupabaseAdmin();
  const [{ data: cfg }, { count }] = await Promise.all([
    db.from("config").select("value").eq("key", "adventure_capacity").single(),
    db
      .from("rsvps")
      .select("*", { count: "exact", head: true })
      .eq("rsvp_choice", "adventure"),
  ]);
  const cap = Number(cfg?.value ?? 50);
  const taken = count ?? 0;
  return { cap, taken, available: taken < cap };
}
