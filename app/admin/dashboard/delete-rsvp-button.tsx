"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteRsvp } from "./admin-actions";

export function DeleteRsvpButton({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  return (
    <button
      type="button"
      disabled={deleting}
      onClick={async () => {
        if (!confirm("Delete this RSVP? This can't be undone.")) return;
        setDeleting(true);
        await deleteRsvp(id);
        router.refresh();
      }}
      className="p-1.5 rounded-sm text-dossier-fg-muted hover:text-classified-red-bright hover:bg-classified-red/10 disabled:opacity-40"
      aria-label="Delete"
    >
      <Trash2 className="size-4" />
    </button>
  );
}
