"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PieceEditor } from "@/components/PieceEditor";
import { usePiece } from "@/lib/store";

export default function PiecePage() {
  const params = useParams<{ id: string }>();
  const { piece, loading, savePiece, syncStatus } = usePiece(params.id);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-[var(--muted)]">
        Loading...
      </div>
    );
  }

  if (!piece) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-[var(--muted)]">Idea not found.</p>
        <Link
          href="/"
          className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[#0f1115]"
        >
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <PieceEditor initialPiece={piece} onSave={savePiece} syncStatus={syncStatus} />
  );
}
