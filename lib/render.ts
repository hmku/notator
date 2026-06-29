import type { Cell, Piece, PieceDoc, Row, Section } from "./types";

function cellWidth(cell: Cell): number {
  return Math.max(cell.beat.length, cell.note.length, 1);
}

function padRight(text: string, width: number): string {
  if (text.length >= width) return text;
  return text + " ".repeat(width - text.length);
}

function trimEnd(text: string): string {
  return text.replace(/\s+$/, "");
}

function cellOffsets(widths: number[]): number[] {
  return widths.map((_, index) => {
    let offset = 0;
    for (let i = 0; i < index; i += 1) {
      offset += widths[i] + 1;
    }
    return offset;
  });
}

export function renderRow(row: Row): string[] {
  if (row.cells.length === 0) return [];

  const widths = row.cells.map(cellWidth);
  const offsets = cellOffsets(widths);
  const beatLine = row.cells.map((cell, i) => padRight(cell.beat, widths[i])).join(" ");
  const noteLine = row.cells.map((cell, i) => padRight(cell.note, widths[i])).join(" ");

  const lines: string[] = [];
  const hasChords = row.cells.some((cell) => cell.chord);

  if (hasChords) {
    let maxLength = beatLine.length;
    for (let i = 0; i < row.cells.length; i += 1) {
      const chord = row.cells[i].chord;
      if (chord) {
        maxLength = Math.max(maxLength, offsets[i] + chord.length);
      }
    }

    const chars = Array.from({ length: maxLength }, () => " ");
    for (let i = 0; i < row.cells.length; i += 1) {
      const chord = row.cells[i].chord;
      if (!chord) continue;
      for (let j = 0; j < chord.length; j += 1) {
        chars[offsets[i] + j] = chord[j];
      }
    }
    lines.push(trimEnd(chars.join("")));
  }

  lines.push(trimEnd(beatLine));
  lines.push(trimEnd(noteLine));
  return lines;
}

export function renderSection(section: Section): string {
  const lines: string[] = [];

  if (section.label) lines.push(section.label);
  if (section.notes) lines.push(section.notes);

  for (const row of section.rows) {
    const rowLines = renderRow(row);
    if (rowLines.length > 0) {
      lines.push(...rowLines);
    }
  }

  return lines.join("\n");
}

export function renderPiece(piece: Pick<Piece, "title" | "meta" | "doc">): string {
  const lines: string[] = [];

  if (piece.title) lines.push(piece.title);
  if (piece.meta) lines.push(piece.meta);

  if (lines.length > 0 && piece.doc.sections.length > 0) {
    lines.push("");
  }

  piece.doc.sections.forEach((section, index) => {
    const sectionText = renderSection(section);
    if (sectionText) lines.push(sectionText);
    if (index < piece.doc.sections.length - 1) lines.push("");
  });

  return lines.join("\n").trim();
}

export function emptyDoc(): PieceDoc {
  return { sections: [] };
}
