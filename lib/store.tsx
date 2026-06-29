"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Piece } from "./types";
import { createDefaultPiece } from "./storage";
import {
  deleteLocalPiece,
  mergeByUpdatedAt,
  pieceToRow,
  readLocalPiece,
  readLocalPieces,
  rowToPiece,
  sortPiecesByUpdated,
  upsertLocalPiece,
  writeLocalPieces,
} from "./storage";
import { isSupabaseConfigured, tryCreateClient } from "./supabaseClient";

const SYNC_DELAY_MS = 500;

type SyncStatus = "idle" | "syncing" | "error" | "offline";

export interface PiecesStore {
  pieces: Piece[];
  loading: boolean;
  syncStatus: SyncStatus;
  cloudEnabled: boolean;
  userId: string | null;
  refreshFromRemote: () => Promise<void>;
  savePiece: (piece: Piece) => Piece;
  createPiece: () => Piece;
  removePiece: (id: string) => Promise<void>;
}

function usePiecesStore(): PiecesStore {
  const [pieces, setPieces] = useState<Piece[]>(() =>
    typeof window === "undefined" ? [] : sortPiecesByUpdated(readLocalPieces()),
  );
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [userId, setUserId] = useState<string | null>(null);
  const pendingSync = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  // Pieces edited but not yet confirmed synced to the remote. Retried on reconnect.
  const dirtyIds = useRef<Set<string>>(new Set());

  const supabase = useMemo(() => tryCreateClient(), []);
  const cloudEnabled = isSupabaseConfigured();

  const syncPiece = useCallback(
    async (piece: Piece) => {
      if (!supabase || !userId || !navigator.onLine) {
        setSyncStatus(navigator.onLine ? "idle" : "offline");
        return;
      }

      setSyncStatus("syncing");
      const payload = pieceToRow(piece, userId);
      const { error } = await supabase.from("pieces").upsert(payload);
      if (error) {
        setSyncStatus("error");
        return;
      }
      dirtyIds.current.delete(piece.id);
      setSyncStatus("idle");
    },
    [supabase, userId],
  );

  const flushPending = useCallback(async () => {
    if (!supabase || !userId || !navigator.onLine) return;
    const ids = Array.from(dirtyIds.current);
    for (const id of ids) {
      const piece = readLocalPiece(id);
      if (piece) await syncPiece(piece);
    }
  }, [supabase, userId, syncPiece]);

  const refreshFromRemote = useCallback(async () => {
    if (!supabase) {
      setPieces(sortPiecesByUpdated(readLocalPieces()));
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUserId(null);
      setPieces(sortPiecesByUpdated(readLocalPieces()));
      setLoading(false);
      return;
    }

    setUserId(user.id);

    const { data, error } = await supabase
      .from("pieces")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      setSyncStatus("error");
      setPieces(sortPiecesByUpdated(readLocalPieces()));
      setLoading(false);
      return;
    }

    const remotePieces = (data ?? []).map(rowToPiece);
    const localPieces = readLocalPieces();
    const merged = mergeByUpdatedAt(localPieces, remotePieces);

    writeLocalPieces(merged);
    setPieces(merged);
    setLoading(false);
    setSyncStatus("idle");

    // Any merged piece that's newer than (or missing from) the remote came from
    // local edits made while offline/unauthenticated — push them up.
    for (const piece of merged) {
      const remote = remotePieces.find((item) => item.id === piece.id);
      if (!remote || new Date(piece.updatedAt) > new Date(remote.updatedAt)) {
        dirtyIds.current.add(piece.id);
        const payload = pieceToRow(piece, user.id);
        void supabase.from("pieces").upsert(payload).then(({ error: pushError }) => {
          if (!pushError) dirtyIds.current.delete(piece.id);
        });
      }
    }
  }, [supabase]);

  useEffect(() => {
    refreshFromRemote();
  }, [refreshFromRemote]);

  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus("idle");
      void flushPending();
    };
    const handleOffline = () => {
      setSyncStatus("offline");
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    if (!navigator.onLine) setSyncStatus("offline");
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [flushPending]);

  const scheduleSync = useCallback(
    (piece: Piece) => {
      const existing = pendingSync.current.get(piece.id);
      if (existing) clearTimeout(existing);

      const timeout = setTimeout(() => {
        pendingSync.current.delete(piece.id);
        void syncPiece(piece);
      }, SYNC_DELAY_MS);

      pendingSync.current.set(piece.id, timeout);
    },
    [syncPiece],
  );

  const savePiece = useCallback(
    (piece: Piece) => {
      const updated = { ...piece, updatedAt: new Date().toISOString() };
      const next = upsertLocalPiece(updated);
      setPieces(sortPiecesByUpdated(next));
      dirtyIds.current.add(updated.id);
      scheduleSync(updated);
      return updated;
    },
    [scheduleSync],
  );

  const createPiece = useCallback(() => {
    const piece = createDefaultPiece();
    return savePiece(piece);
  }, [savePiece]);

  const removePiece = useCallback(
    async (id: string) => {
      const next = deleteLocalPiece(id);
      setPieces(sortPiecesByUpdated(next));
      dirtyIds.current.delete(id);

      const pending = pendingSync.current.get(id);
      if (pending) {
        clearTimeout(pending);
        pendingSync.current.delete(id);
      }

      if (supabase && userId && navigator.onLine) {
        setSyncStatus("syncing");
        const { error } = await supabase.from("pieces").delete().eq("id", id);
        setSyncStatus(error ? "error" : "idle");
      }
    },
    [supabase, userId],
  );

  return {
    pieces,
    loading,
    syncStatus,
    cloudEnabled,
    userId,
    refreshFromRemote,
    savePiece,
    createPiece,
    removePiece,
  };
}

const PiecesContext = createContext<PiecesStore | null>(null);

export function PiecesProvider({ children }: { children: ReactNode }) {
  const store = usePiecesStore();
  return <PiecesContext.Provider value={store}>{children}</PiecesContext.Provider>;
}

export function usePieces(): PiecesStore {
  const ctx = useContext(PiecesContext);
  if (!ctx) {
    throw new Error("usePieces must be used within a PiecesProvider");
  }
  return ctx;
}

export function usePiece(id: string) {
  const { pieces, loading, savePiece, syncStatus, cloudEnabled } = usePieces();
  const piece = pieces.find((item) => item.id === id) ?? readLocalPiece(id);

  return {
    piece,
    loading: loading && !piece,
    syncStatus,
    cloudEnabled,
    savePiece,
  };
}
