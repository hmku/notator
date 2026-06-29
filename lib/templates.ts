export interface BeatTemplate {
  id: string;
  label: string;
  beats: string[];
}

export const BEAT_TEMPLATES: BeatTemplate[] = [
  {
    id: "1-4",
    label: "1 2 3 4",
    beats: ["1", "2", "3", "4"],
  },
  {
    id: "1-6",
    label: "1–6",
    beats: ["1", "2", "3", "4", "5", "6"],
  },
  {
    id: "8ths",
    label: "1 + 2 + 3 + 4 +",
    beats: ["1", "+", "2", "+", "3", "+", "4", "+"],
  },
  {
    id: "16ths",
    label: "1 e + a",
    beats: [
      "1",
      "e",
      "+",
      "a",
      "2",
      "e",
      "+",
      "a",
      "3",
      "e",
      "+",
      "a",
      "4",
      "e",
      "+",
      "a",
    ],
  },
  {
    id: "triplets",
    label: "1 & a (triplets)",
    beats: ["1", "&", "a", "2", "&", "a", "3", "&", "a", "4", "&", "a"],
  },
];
