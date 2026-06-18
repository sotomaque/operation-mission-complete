"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Pencil, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Rsvp } from "@/lib/supabase";

import { updateRsvp } from "./admin-actions";

/**
 * Per-row edit dialog. Keeps the dashboard one-page (no nested route
 * for individual edits) — open dialog, tweak fields, save, dialog
 * closes, RSC re-renders the row.
 */
export function EditRsvpDialog({ rsvp }: { rsvp: Rsvp }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    await updateRsvp(rsvp.id, {
      first_name: String(fd.get("first_name")),
      last_name: String(fd.get("last_name")),
      email: String(fd.get("email")),
      mobile_phone: String(fd.get("mobile_phone")),
      guest_count: Number(fd.get("guest_count")),
      rsvp_choice: fd.get("rsvp_choice") as Rsvp["rsvp_choice"],
      meal_choice: (fd.get("meal_choice") as Rsvp["meal_choice"]) || null,
      dietary_restrictions: (fd.get("dietary_restrictions") as string) || null,
      admin_notes: (fd.get("admin_notes") as string) || null,
    });
    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="p-1.5 rounded-sm text-dossier-fg-muted hover:text-dossier-fg hover:bg-dossier-fg/10"
          aria-label="Edit"
        >
          <Pencil className="size-4" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[90vh] overflow-auto paper rounded-sm p-6">
          <Dialog.Title className="font-serif text-2xl text-dossier-ink mb-1">
            Edit RSVP
          </Dialog.Title>
          <Dialog.Description className="font-mono text-xs text-dossier-ink-muted mb-4">
            {rsvp.email}
          </Dialog.Description>
          <Dialog.Close
            className="absolute top-4 right-4 text-dossier-ink-muted hover:text-dossier-ink"
            aria-label="Close"
          >
            <X className="size-5" />
          </Dialog.Close>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="first_name">First</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  defaultValue={rsvp.first_name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  defaultValue={rsvp.last_name}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={rsvp.email}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="mobile_phone">Phone</Label>
                <Input
                  id="mobile_phone"
                  name="mobile_phone"
                  defaultValue={rsvp.mobile_phone}
                  required
                />
              </div>
              <div>
                <Label htmlFor="guest_count">Guests</Label>
                <Input
                  id="guest_count"
                  name="guest_count"
                  type="number"
                  min={1}
                  max={10}
                  defaultValue={rsvp.guest_count}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rsvp_choice">Choice</Label>
                <select
                  id="rsvp_choice"
                  name="rsvp_choice"
                  defaultValue={rsvp.rsvp_choice}
                  className="h-11 w-full px-3 rounded-sm border border-dossier-ink/40 bg-dossier-paper/40 text-dossier-ink font-mono text-sm"
                >
                  <option value="adventure">Adventure</option>
                  <option value="welcome">Welcome</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
              <div>
                <Label htmlFor="meal_choice">Meal</Label>
                <select
                  id="meal_choice"
                  name="meal_choice"
                  defaultValue={rsvp.meal_choice ?? ""}
                  className="h-11 w-full px-3 rounded-sm border border-dossier-ink/40 bg-dossier-paper/40 text-dossier-ink font-mono text-sm"
                >
                  <option value="">—</option>
                  <option value="beef">Beef</option>
                  <option value="chicken">Chicken</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="dietary_restrictions">Dietary</Label>
              <Textarea
                id="dietary_restrictions"
                name="dietary_restrictions"
                defaultValue={rsvp.dietary_restrictions ?? ""}
                maxLength={500}
              />
            </div>
            <div>
              <Label htmlFor="admin_notes">Admin notes</Label>
              <Textarea
                id="admin_notes"
                name="admin_notes"
                defaultValue={rsvp.admin_notes ?? ""}
                placeholder="Internal only — not shown to the guest."
                maxLength={500}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <Button type="button" variant="outline" size="sm">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
