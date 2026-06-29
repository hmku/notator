"use client";

import { useState } from "react";
import { renderPiece } from "@/lib/render";
import type { Piece } from "@/lib/types";

interface RenderedPreviewProps {
  piece: Pick<Piece, "title" | "meta" | "doc">;
}

export function RenderedPreview({ piece }: RenderedPreviewProps) {
  const [copied, setCopied] = useState(false);
  const text = renderPiece(piece);

  async function copyText() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
          Preview
        </h2>
        <button
          type="button"
          onClick={() => void copyText()}
          className="rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[#0f1115]"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="mono-preview overflow-x-auto rounded-xl bg-[#0b0d11] p-4 text-sm leading-6 text-[#e8ebf2]">
        {text || "Start adding beats, chords, and notes..."}
      </pre>
    </section>
  );
}
