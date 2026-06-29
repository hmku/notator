import { describe, expect, it } from "vitest";
import { mergeByUpdatedAt } from "./storage";
import type { Piece } from "./types";

function makePiece(id: string, updatedAt: string, title = ""): Piece {
  return { id, title, meta: "", doc: { sections: [] }, updatedAt };
}

describe("mergeByUpdatedAt", () => {
  it("keeps the newer copy when ids collide", () => {
    const local = [makePiece("a", "2026-01-02T00:00:00.000Z", "local-newer")];
    const remote = [makePiece("a", "2026-01-01T00:00:00.000Z", "remote-older")];

    const merged = mergeByUpdatedAt(local, remote);
    expect(merged).toHaveLength(1);
    expect(merged[0].title).toBe("local-newer");
  });

  it("prefers remote when it is newer", () => {
    const local = [makePiece("a", "2026-01-01T00:00:00.000Z", "local-older")];
    const remote = [makePiece("a", "2026-01-02T00:00:00.000Z", "remote-newer")];

    const merged = mergeByUpdatedAt(local, remote);
    expect(merged[0].title).toBe("remote-newer");
  });

  it("unions ids only present on one side", () => {
    const local = [makePiece("a", "2026-01-01T00:00:00.000Z")];
    const remote = [makePiece("b", "2026-01-01T00:00:00.000Z")];

    const merged = mergeByUpdatedAt(local, remote);
    expect(merged.map((p) => p.id).sort()).toEqual(["a", "b"]);
  });

  it("returns pieces sorted newest first", () => {
    const local = [makePiece("a", "2026-01-01T00:00:00.000Z")];
    const remote = [makePiece("b", "2026-03-01T00:00:00.000Z")];

    const merged = mergeByUpdatedAt(local, remote);
    expect(merged.map((p) => p.id)).toEqual(["b", "a"]);
  });
});
