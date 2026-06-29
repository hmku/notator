"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { usePieces } from "@/lib/store";

export default function HomePage() {
  const router = useRouter();
  const { pieces, loading, createPiece, removePiece, syncStatus, cloudEnabled } =
    usePieces();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return pieces;
    return pieces.filter(
      (piece) =>
        piece.title.toLowerCase().includes(normalized) ||
        piece.meta.toLowerCase().includes(normalized),
    );
  }, [pieces, query]);

  function handleCreate() {
    const piece = createPiece();
    router.push(`/piece/${piece.id}`);
  }

  return (
    <div className="min-h-dvh">
      <AppHeader
        title="Notator"
        right={
          <span className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs text-[var(--muted)]">
            {cloudEnabled
              ? syncStatus === "offline"
                ? "Offline"
                : syncStatus === "syncing"
                  ? "Syncing"
                  : "Cloud"
              : "Local only"}
          </span>
        }
      />

      <main className="mx-auto max-w-3xl px-4 py-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search ideas..."
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
          />
          <button
            type="button"
            onClick={handleCreate}
            className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[#0f1115]"
          >
            New idea
          </button>
        </div>

        {!cloudEnabled ? (
          <p className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
            Running in local-only mode. Add Supabase env vars to enable cloud sync.
          </p>
        ) : null}

        {loading ? (
          <p className="text-sm text-[var(--muted)]">Loading ideas...</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center">
            <p className="mb-4 text-[var(--muted)]">No ideas yet.</p>
            <button
              type="button"
              onClick={handleCreate}
              className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[#0f1115]"
            >
              Capture your first idea
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((piece) => (
              <li
                key={piece.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/piece/${piece.id}`} className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-semibold">
                      {piece.title || "Untitled idea"}
                    </h2>
                    {piece.meta ? (
                      <p className="mt-1 truncate text-sm text-[var(--muted)]">{piece.meta}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      Updated {new Date(piece.updatedAt).toLocaleString()}
                    </p>
                  </Link>
                  <button
                    type="button"
                    onClick={() => void removePiece(piece.id)}
                    className="rounded-lg px-3 py-2 text-xs text-[var(--danger)] hover:bg-[var(--surface-2)]"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
