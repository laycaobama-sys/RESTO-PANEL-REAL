/**
 * RestoPanel · Mock data — Floor plan tables (24)
 * Coordinates are normalized to a 0–100 grid for a 16:10 floor plan.
 */

export type TableShape = "round" | "square" | "rect" | "oval";
export type TableZone = "sala" | "terraza";

export interface MockTable {
  id: string;
  name: string;
  zone: TableZone;
  seats: number;
  shape: TableShape;
  x: number; // 0–100 (left percentage on the plan)
  y: number; // 0–100 (top percentage on the plan)
}

export const MOCK_TABLES: MockTable[] = [
  // ── Sala (indoor) — 14 tables
  { id: "T01", name: "Mesa 1",  zone: "sala", seats: 2, shape: "round",  x: 14, y: 18 },
  { id: "T02", name: "Mesa 2",  zone: "sala", seats: 2, shape: "round",  x: 26, y: 18 },
  { id: "T03", name: "Mesa 3",  zone: "sala", seats: 4, shape: "square", x: 38, y: 18 },
  { id: "T04", name: "Mesa 4",  zone: "sala", seats: 4, shape: "square", x: 50, y: 18 },
  { id: "T05", name: "Mesa 5",  zone: "sala", seats: 6, shape: "rect",   x: 14, y: 38 },
  { id: "T06", name: "Mesa 6",  zone: "sala", seats: 6, shape: "rect",   x: 30, y: 38 },
  { id: "T07", name: "Mesa 7",  zone: "sala", seats: 8, shape: "oval",   x: 50, y: 40 },
  { id: "T08", name: "Mesa 8",  zone: "sala", seats: 2, shape: "round",  x: 14, y: 58 },
  { id: "T09", name: "Mesa 9",  zone: "sala", seats: 4, shape: "square", x: 26, y: 58 },
  { id: "T10", name: "Mesa 10", zone: "sala", seats: 4, shape: "square", x: 38, y: 58 },
  { id: "T11", name: "Mesa 11", zone: "sala", seats: 2, shape: "round",  x: 14, y: 78 },
  { id: "T12", name: "Mesa 12", zone: "sala", seats: 2, shape: "round",  x: 26, y: 78 },
  { id: "T13", name: "Mesa 13", zone: "sala", seats: 6, shape: "rect",   x: 40, y: 78 },
  { id: "T14", name: "Mesa 14", zone: "sala", seats: 4, shape: "oval",   x: 56, y: 78 },

  // ── Terraza (outdoor) — 10 tables
  { id: "T15", name: "Terraza 1", zone: "terraza", seats: 2, shape: "round",  x: 72, y: 18 },
  { id: "T16", name: "Terraza 2", zone: "terraza", seats: 2, shape: "round",  x: 82, y: 18 },
  { id: "T17", name: "Terraza 3", zone: "terraza", seats: 4, shape: "square", x: 72, y: 34 },
  { id: "T18", name: "Terraza 4", zone: "terraza", seats: 4, shape: "square", x: 82, y: 34 },
  { id: "T19", name: "Terraza 5", zone: "terraza", seats: 6, shape: "rect",   x: 72, y: 50 },
  { id: "T20", name: "Terraza 6", zone: "terraza", seats: 6, shape: "rect",   x: 82, y: 50 },
  { id: "T21", name: "Terraza 7", zone: "terraza", seats: 2, shape: "round",  x: 72, y: 66 },
  { id: "T22", name: "Terraza 8", zone: "terraza", seats: 4, shape: "oval",   x: 82, y: 66 },
  { id: "T23", name: "Terraza 9", zone: "terraza", seats: 4, shape: "square", x: 72, y: 82 },
  { id: "T24", name: "Terraza 10",zone: "terraza", seats: 8, shape: "oval",   x: 82, y: 82 },
];
