"use client";

import type { Cell } from "@/lib/types";

interface BeatChipProps {
  cell: Cell;
  selected: boolean;
  onSelect: () => void;
}

export function BeatChip({ cell, selected, onSelect }: BeatChipProps) {
  const hasContent = cell.beat || cell.note || cell.chord;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex min-w-[3.25rem] flex-col rounded-xl border px-2 py-2 text-left transition ${
        selected
          ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_18%,var(--surface))]"
          : hasContent
            ? "border-[var(--border)] bg-[var(--surface-2)]"
            : "border-dashed border-[var(--border)] bg-[var(--surface)]"
      }`}
    >
      {cell.chord ? (
        <span className="truncate text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)]">
          {cell.chord}
        </span>
      ) : (
        <span className="h-[14px]" />
      )}
      <span className="text-sm font-medium text-[var(--foreground)]">
        {cell.beat || "·"}
      </span>
      <span className="truncate text-xs text-[var(--muted)]">
        {cell.note || "note"}
      </span>
    </button>
  );
}
