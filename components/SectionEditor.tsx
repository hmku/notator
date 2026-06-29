"use client";

import type { Section } from "@/lib/types";
import { createRow } from "@/lib/types";
import { BeatGrid } from "./BeatGrid";

interface SectionEditorProps {
  section: Section;
  onChange: (section: Section) => void;
  onDelete?: () => void;
}

export function SectionEditor({ section, onChange, onDelete }: SectionEditorProps) {
  function updateRow(index: number, row: Section["rows"][number]) {
    const rows = [...section.rows];
    rows[index] = row;
    onChange({ ...section, rows });
  }

  function deleteRow(index: number) {
    const rows = section.rows.filter((_, rowIndex) => rowIndex !== index);
    onChange({ ...section, rows: rows.length > 0 ? rows : [createRow()] });
  }

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_88%,black)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid flex-1 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-[var(--muted)]">
              Section label
            </span>
            <input
              value={section.label ?? ""}
              onChange={(event) =>
                onChange({ ...section, label: event.target.value || undefined })
              }
              placeholder="block chords, interlude, ending"
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-[var(--muted)]">
              Notes
            </span>
            <textarea
              value={section.notes ?? ""}
              onChange={(event) =>
                onChange({ ...section, notes: event.target.value || undefined })
              }
              placeholder="maybe start high and move down, chopin style..."
              rows={2}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3"
            />
          </label>
        </div>

        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--danger)] hover:bg-[var(--surface-2)]"
          >
            Delete section
          </button>
        ) : null}
      </div>

      <div className="space-y-3">
        {section.rows.map((row, index) => (
          <BeatGrid
            key={row.id}
            row={row}
            onChange={(nextRow) => updateRow(index, nextRow)}
            onDelete={section.rows.length > 1 ? () => deleteRow(index) : undefined}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange({ ...section, rows: [...section.rows, createRow()] })}
        className="w-full rounded-xl border border-dashed border-[var(--border)] px-4 py-3 text-sm font-medium hover:bg-[var(--surface-2)]"
      >
        + row
      </button>
    </section>
  );
}
