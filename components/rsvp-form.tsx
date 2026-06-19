"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { submitRsvp, type RsvpFormState } from "@/app/mission/[code]/actions";

/**
 * The RSVP form. Client component so we can drive the conditional
 * "Adventure vs Welcome" radio + show the capacity-full fallback
 * inline without a hard reload.
 *
 * Choice rendering:
 *   • inviteType=adventure + adventureAvailable=true → Adventure +
 *     Welcome + Declined radio options.
 *   • inviteType=adventure + adventureAvailable=false → Welcome +
 *     Declined (banner above already explains why).
 *   • inviteType=welcome → Welcome + Declined.
 *
 * The form action sets `rsvpChoice` via a hidden input mirror of the
 * radio so the server sees the validated literal.
 */

export function RsvpForm({
  inviteType,
  adventureAvailable,
}: {
  inviteType: "adventure" | "welcome";
  adventureAvailable: boolean;
}) {
  const [state, formAction, pending] = useActionState<
    RsvpFormState,
    FormData
  >(submitRsvp, null);

  // Pick a sensible default RSVP choice. Adventure if it's available
  // (most exciting); else Welcome.
  const defaultChoice =
    inviteType === "adventure" && adventureAvailable ? "adventure" : "welcome";

  const [rsvpChoice, setRsvpChoice] = useState<
    "adventure" | "welcome" | "declined"
  >(defaultChoice);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="inviteType" value={inviteType} />
      <input type="hidden" name="rsvpChoice" value={rsvpChoice} />

      <fieldset className="space-y-3">
        <Label>Your Response</Label>
        <div className="grid sm:grid-cols-3 gap-2">
          {inviteType === "adventure" && adventureAvailable ? (
            <ChoiceTile
              active={rsvpChoice === "adventure"}
              onClick={() => setRsvpChoice("adventure")}
              top="A"
              title="Adventure"
              note="Boat at 4:30"
            />
          ) : null}
          <ChoiceTile
            active={rsvpChoice === "welcome"}
            onClick={() => setRsvpChoice("welcome")}
            top="B"
            title="Celebration"
            note="6:30 PM"
          />
          <ChoiceTile
            active={rsvpChoice === "declined"}
            onClick={() => setRsvpChoice("declined")}
            top="—"
            title="Can't make it"
            note="Will regret on deathbed"
          />
        </div>
      </fieldset>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" name="firstName" required maxLength={60} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" name="lastName" required maxLength={60} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          inputMode="email"
          autoComplete="email"
        />
        <p className="font-mono text-[11px] text-dossier-ink-faint">
          Used to send logistics closer to the date.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="mobilePhone">Mobile</Label>
        <Input
          id="mobilePhone"
          name="mobilePhone"
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder="+1 555-555-5555"
        />
      </div>

      {rsvpChoice !== "declined" ? (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="guestCount">Total in your party</Label>
            <Input
              id="guestCount"
              name="guestCount"
              type="number"
              min={1}
              max={10}
              defaultValue={1}
              required
              className="w-32"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dietaryRestrictions">
              Dietary restrictions
            </Label>
            <Textarea
              id="dietaryRestrictions"
              name="dietaryRestrictions"
              placeholder="Any allergies, intolerances, vegetarian / vegan, or anything we should be aware of…"
              maxLength={500}
            />
          </div>
        </>
      ) : null}

      {state && !state.ok ? (
        <div className="border border-classified-red/50 bg-classified-red/10 rounded-sm px-3 py-2 font-mono text-sm text-classified-red">
          {state.capacityFull
            ? "Vessel filled up while you were typing. We've switched you to the Celebration — submit again."
            : state.message}
        </div>
      ) : null}

      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-2">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Transmitting…" : "Confirm RSVP"}
        </Button>
      </div>
    </form>
  );
}

function ChoiceTile({
  active,
  onClick,
  top,
  title,
  note,
}: {
  active: boolean;
  onClick: () => void;
  top: string;
  title: string;
  note: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left border rounded-sm p-3 transition-all ${
        active
          ? "border-copper bg-copper/15 ring-2 ring-copper/40"
          : "border-dossier-ink/30 bg-dossier-paper/60 hover:bg-dossier-paper/80"
      }`}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-copper mb-1">
        {top}
      </p>
      <p className="font-serif text-base text-dossier-ink leading-tight">
        {title}
      </p>
      <p className="font-mono text-[11px] text-dossier-ink-muted mt-0.5">
        {note}
      </p>
    </button>
  );
}
