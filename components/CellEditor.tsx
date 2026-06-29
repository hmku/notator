"use client";

import { useEffect, useRef } from "react";
import type { Cell } from "@/lib/types";

interface CellEditorProps {
  cell: Cell;
  onChange: (cell: Cell) => void;
  onNext: () => void;
  onClose: () => void;
}

export function CellEditor({ cell, onChange, onNext, onClose }: CellEditorProps) {
  const noteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    noteRef.current?.focus();
  }, [cell.id]);

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_-12px_40px_rgba(0,0,0,0.35)]">
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-[var(--muted)]">Edit cell</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-sm text-[var(--muted)] hover:bg-[var(--surface-2)]"
          >
            Done
          </button>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-[var(--muted)]">Chord</span>
          <input
            value={cell.chord ?? ""}
            onChange={(event) =>
              onChange({ ...cell, chord: event.target.value || undefined })
            }
            placeholder="BbMaj7"
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-[var(--muted)]">Beat</span>
            <input
              value={cell.beat}
              onChange={(event) => onChange({ ...cell, beat: event.target.value })}
              placeholder="1, +, e"
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-[var(--muted)]">Note</span>
            <input
              ref={noteRef}
              value={cell.note}
              onChange={(event) => onChange({ ...cell, note: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onNext();
                }
              }}
              placeholder="Eb, Bb C"
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={onNext}
          className="rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[#0f1115]"
        >
          Next cell
        </button>
      </div>
    </div>
  );
}
