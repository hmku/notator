import { describe, expect, it } from "vitest";
import { renderPiece, renderRow } from "./render";
import type { Piece, Row } from "./types";

function makeRow(cells: Array<{ beat: string; note: string; chord?: string }>): Row {
  return {
    id: "row-1",
    cells: cells.map((cell, index) => ({
      id: `cell-${index}`,
      beat: cell.beat,
      note: cell.note,
      chord: cell.chord,
    })),
  };
}

describe("renderRow", () => {
  it("aligns beats and notes by column width", () => {
    const lines = renderRow(
      makeRow([
        { beat: "1", note: "D" },
        { beat: "2", note: "Eb" },
        { beat: "3", note: "F" },
      ]),
    );

    expect(lines).toEqual(["1 2  3", "D Eb F"]);
  });

  it("places chords at cell offsets", () => {
    const lines = renderRow(
      makeRow([
        { beat: "1", note: "G", chord: "Fm7" },
        { beat: "2", note: "C" },
        { beat: "+", note: "Ab" },
        { beat: "3", note: "C" },
      ]),
    );

    expect(lines[0]).toBe("Fm7");
    expect(lines[1]).toBe("1 2 +  3");
    expect(lines[2]).toBe("G C Ab C");
  });

  it("extends chord line when chord is longer than beat line", () => {
    const lines = renderRow(
      makeRow([
        { beat: "1", note: "G", chord: "G7b9b13" },
        { beat: "2", note: "C" },
      ]),
    );

    expect(lines[0]).toBe("G7b9b13");
    expect(lines[0].length).toBeGreaterThanOrEqual("G7b9b13".length);
  });

  it("handles blank beats", () => {
    const lines = renderRow(
      makeRow([
        { beat: "", note: "Bb" },
        { beat: "1", note: "C" },
      ]),
    );

    expect(lines).toEqual(["   1", "Bb C"]);
  });

  it("trims trailing whitespace from every line", () => {
    const lines = renderRow(
      makeRow([
        { beat: "1", note: "C", chord: "Cm7" },
        { beat: "2", note: "Eb" },
      ]),
    );

    for (const line of lines) {
      expect(line).toBe(line.replace(/\s+$/, ""));
    }
  });
});

describe("renderPiece", () => {
  it("renders title, meta, sections, and free text", () => {
    const piece: Pick<Piece, "title" | "meta" | "doc"> = {
      title: "2026-04-04",
      meta: "Key of Bb, piano only",
      doc: {
        sections: [
          {
            id: "section-1",
            label: "block chords",
            notes: "maybe start high and move down",
            rows: [
              makeRow([
                { beat: "1", note: "F", chord: "Bb" },
                { beat: "2", note: "F" },
              ]),
            ],
          },
        ],
      },
    };

    const text = renderPiece(piece);
    expect(text).toContain("2026-04-04");
    expect(text).toContain("Key of Bb, piano only");
    expect(text).toContain("block chords");
    expect(text).toContain("maybe start high and move down");
    expect(text).toContain("Bb");
    expect(text).toContain("1 2");
    expect(text).toContain("F F");
  });
});
