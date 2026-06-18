"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateAdventureCapacity } from "./admin-actions";

export function CapacityEditor({
  currentCap,
  taken,
}: {
  currentCap: number;
  taken: number;
}) {
  const router = useRouter();
  const [cap, setCap] = useState(currentCap);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await updateAdventureCapacity(cap);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-end gap-3 p-4 bg-dossier-bg-elevated rounded-sm border border-dossier-fg/10">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-dossier-fg-muted mb-1">
          Adventure capacity
        </p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={taken}
            max={500}
            value={cap}
            onChange={(e) => setCap(Number(e.target.value))}
            className="w-24 bg-dossier-bg border-dossier-fg/20 text-dossier-fg"
          />
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={saving || cap === currentCap}
            onClick={handleSave}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
      <p className="font-mono text-[11px] text-dossier-fg-muted mb-1">
        {taken} of {currentCap} seats filled
        {cap < taken
          ? " — cannot reduce below current count"
          : cap === currentCap
            ? ""
            : ` · new cap: ${cap}`}
      </p>
    </div>
  );
}
