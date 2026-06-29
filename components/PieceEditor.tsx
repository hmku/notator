"use client";

import { useEffect, useState } from "react";
import type { Piece } from "@/lib/types";
import { createSection } from "@/lib/types";
import { AppHeader } from "./AppHeader";
import { RenderedPreview } from "./RenderedPreview";
import { SectionEditor } from "./SectionEditor";

interface PieceEditorProps {
  initialPiece: Piece;
  onSave: (piece: Piece) => Piece;
  syncStatus: "idle" | "syncing" | "error" | "offline";
}

export function PieceEditor({ initialPiece, onSave, syncStatus }: PieceEditorProps) {
  const [piece, setPiece] = useState(initialPiece);

  useEffect(() => {
    setPiece(initialPiece);
  }, [initialPiece]);

  function updatePiece(next: Piece) {
    setPiece(next);
    onSave(next);
  }

  function updateSection(index: number, section: Piece["doc"]["sections"][number]) {
    const sections = [...piece.doc.sections];
    sections[index] = section;
    updatePiece({ ...piece, doc: { sections } });
  }

  function deleteSection(index: number) {
    const sections = piece.doc.sections.filter((_, sectionIndex) => sectionIndex !== index);
    updatePiece({
      ...piece,
      doc: { sections: sections.length > 0 ? sections : [createSection()] },
    });
  }

  const syncLabel =
    syncStatus === "syncing"
      ? "Saving..."
      : syncStatus === "offline"
        ? "Offline"
        : syncStatus === "error"
          ? "Sync error"
          : "Saved";

  return (
    <div className="min-h-dvh pb-28">
      <AppHeader
        title={piece.title || "Untitled idea"}
        backHref="/"
        right={
          <span className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs text-[var(--muted)]">
            {syncLabel}
          </span>
        }
      />

      <main className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-5">
        <div className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-[var(--muted)]">Title</span>
            <input
              value={piece.title}
              onChange={(event) => updatePiece({ ...piece, title: event.target.value })}
              placeholder="2026-04-04"
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3 text-lg font-semibold"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-[var(--muted)]">Meta</span>
            <input
              value={piece.meta}
              onChange={(event) => updatePiece({ ...piece, meta: event.target.value })}
              placeholder="Key of Bb, piano only"
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3"
            />
          </label>
        </div>

        {piece.doc.sections.map((section, index) => (
          <SectionEditor
            key={section.id}
            section={section}
            onChange={(nextSection) => updateSection(index, nextSection)}
            onDelete={piece.doc.sections.length > 1 ? () => deleteSection(index) : undefined}
          />
        ))}

        <button
          type="button"
          onClick={() =>
            updatePiece({
              ...piece,
              doc: { sections: [...piece.doc.sections, createSection()] },
            })
          }
          className="rounded-xl border border-dashed border-[var(--border)] px-4 py-4 text-sm font-medium hover:bg-[var(--surface-2)]"
        >
          + section
        </button>

        <RenderedPreview piece={piece} />
      </main>
    </div>
  );
}
