import type { Piece, PieceDoc } from "./types";
import { createPiece } from "./types";

const STORAGE_KEY = "notator:pieces";

export interface DbPieceRow {
  id: string;
  user_id: string;
  title: string;
  meta: string;
  doc: PieceDoc;
  updated_at: string;
}

export function rowToPiece(row: DbPieceRow): Piece {
  return {
    id: row.id,
    title: row.title,
    meta: row.meta,
    doc: row.doc ?? { sections: [] },
    updatedAt: row.updated_at,
  };
}

export function pieceToRow(piece: Piece, userId: string): Omit<DbPieceRow, "updated_at"> & {
  updated_at: string;
} {
  return {
    id: piece.id,
    user_id: userId,
    title: piece.title,
    meta: piece.meta,
    doc: piece.doc,
    updated_at: piece.updatedAt,
  };
}

export function readLocalPieces(): Piece[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Piece[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeLocalPieces(pieces: Piece[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pieces));
}

export function readLocalPiece(id: string): Piece | null {
  return readLocalPieces().find((piece) => piece.id === id) ?? null;
}

export function upsertLocalPiece(piece: Piece): Piece[] {
  const pieces = readLocalPieces();
  const index = pieces.findIndex((item) => item.id === piece.id);
  const next = [...pieces];
  if (index >= 0) {
    next[index] = piece;
  } else {
    next.unshift(piece);
  }
  writeLocalPieces(next);
  return next;
}

export function deleteLocalPiece(id: string): Piece[] {
  const next = readLocalPieces().filter((piece) => piece.id !== id);
  writeLocalPieces(next);
  return next;
}

export function createDefaultPiece(): Piece {
  return createPiece();
}

export function sortPiecesByUpdated(pieces: Piece[]): Piece[] {
  return [...pieces].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

/**
 * Merge two sets of pieces by id, keeping whichever copy has the newer
 * `updatedAt`. Used to reconcile local (possibly offline-edited) state with the
 * remote copy so neither side clobbers fresher edits from the other.
 */
export function mergeByUpdatedAt(local: Piece[], remote: Piece[]): Piece[] {
  const byId = new Map<string, Piece>();
  for (const piece of remote) {
    byId.set(piece.id, piece);
  }
  for (const piece of local) {
    const existing = byId.get(piece.id);
    if (!existing || new Date(piece.updatedAt) > new Date(existing.updatedAt)) {
      byId.set(piece.id, piece);
    }
  }
  return sortPiecesByUpdated([...byId.values()]);
}
