export interface Cell {
  id: string;
  beat: string;
  note: string;
  chord?: string;
}

export interface Row {
  id: string;
  cells: Cell[];
}

export interface Section {
  id: string;
  label?: string;
  notes?: string;
  rows: Row[];
}

export interface PieceDoc {
  sections: Section[];
}

export interface Piece {
  id: string;
  title: string;
  meta: string;
  doc: PieceDoc;
  updatedAt: string;
}

export function createId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function createCell(partial?: Partial<Omit<Cell, "id">>): Cell {
  return {
    id: createId(),
    beat: partial?.beat ?? "",
    note: partial?.note ?? "",
    chord: partial?.chord,
  };
}

export function createRow(cells: Cell[] = [createCell()]): Row {
  return { id: createId(), cells };
}

export function createSection(partial?: Partial<Omit<Section, "id" | "rows">>): Section {
  return {
    id: createId(),
    label: partial?.label,
    notes: partial?.notes,
    rows: [createRow()],
  };
}

export function createPiece(partial?: Partial<Omit<Piece, "id" | "updatedAt" | "doc">>): Piece {
  const now = new Date().toISOString();
  return {
    id: createId(),
    title: partial?.title ?? new Date().toISOString().slice(0, 10),
    meta: partial?.meta ?? "",
    doc: { sections: [createSection()] },
    updatedAt: now,
  };
}

export function createCellsFromBeats(beats: string[]): Cell[] {
  return beats.map((beat) => createCell({ beat }));
}
