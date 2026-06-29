"use client";

import { useMemo, useState } from "react";
import type { Row } from "@/lib/types";
import { createCell } from "@/lib/types";
import { BeatChip } from "./BeatChip";
import { CellEditor } from "./CellEditor";
import { TemplateBar } from "./TemplateBar";

interface BeatGridProps {
  row: Row;
  onChange: (row: Row) => void;
  onDelete?: () => void;
}

export function BeatGrid({ row, onChange, onDelete }: BeatGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectedCell = useMemo(
    () => (selectedIndex === null ? null : row.cells[selectedIndex]),
    [row.cells, selectedIndex],
  );

  function updateCell(index: number, nextCell: typeof row.cells[number]) {
    const cells = [...row.cells];
    cells[index] = nextCell;
    onChange({ ...row, cells });
  }

  function applyTemplate(beats: string[]) {
    onChange({
      ...row,
      cells: beats.map((beat) => createCell({ beat })),
    });
    setSelectedIndex(0);
  }

  function addCell() {
    onChange({ ...row, cells: [...row.cells, createCell()] });
    setSelectedIndex(row.cells.length);
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <TemplateBar onApply={applyTemplate} />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addCell}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium hover:bg-[var(--surface-2)]"
          >
            + cell
          </button>
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--danger)] hover:bg-[var(--surface-2)]"
            >
              Delete row
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {row.cells.map((cell, index) => (
          <BeatChip
            key={cell.id}
            cell={cell}
            selected={selectedIndex === index}
            onSelect={() => setSelectedIndex(index)}
          />
        ))}
      </div>

      {selectedCell && selectedIndex !== null ? (
        <CellEditor
          cell={selectedCell}
          onChange={(cell) => updateCell(selectedIndex, cell)}
          onNext={() => {
            const nextIndex = Math.min(selectedIndex + 1, row.cells.length - 1);
            setSelectedIndex(nextIndex);
          }}
          onClose={() => setSelectedIndex(null)}
        />
      ) : null}
    </div>
  );
}
