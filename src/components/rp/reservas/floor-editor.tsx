"use client";

/* ============================================================
 * RestoPanel · Editor de plano de mesas (Floor Editor)
 * ------------------------------------------------------------
 * Editor profesional de plano de restaurante con:
 *  - 8 estados visuales (libre, reservada, ocupada, próxima
 *    reserva, VIP, bloqueada, limpieza, cuenta solicitada)
 *  - 4 zonas (Sala principal, Terraza, VIP, Barra)
 *  - Añadir / eliminar mesas
 *  - Mover mesas DENTRO de una zona (drag, touch)
 *  - TRASPASAR mesas ENTRE zonas (move-to-zone) — clave
 *  - Fusionar / separar mesas
 *  - Rotar / redimensionar
 *  - Selección múltiple (click, shift/ctrl+click, box-select)
 *  - Undo / redo con histórico (Ctrl+Z / Ctrl+Shift+Z)
 *  - Panel de propiedades lateral (desktop) / bottom sheet (mobile)
 *  - Modo editar / Modo operación
 *  - Tema dark premium (dorado, turquesa, glassmorphism)
 *  - Animaciones transform+opacity, respeta prefers-reduced-motion
 *  - Responsive: 4 columnas (2xl) → 2 cols (lg) → tabs (mobile)
 *  - Datos demo (15 mesas)
 * ============================================================ */

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  ArrowRightLeft,
  Combine,
  Split,
  RotateCw,
  Undo2,
  Redo2,
  Filter,
  Wifi,
  WifiOff,
  Pencil,
  Eye,
  Users,
  Clock,
  Sparkles,
  Crown,
  ChevronRight,
  Coffee,
  Wine,
  Glasses,
  CheckCircle2,
  Lock,
  Brush,
  FileText,
  X,
  Square,
  Circle,
  RectangleHorizontal,
  Maximize2,
  Hand,
  MapPin,
  ArrowRight,
} from "lucide-react";

/* ============================================================
 * Tipos
 * ============================================================ */
export type TableState =
  | "free"
  | "reserved"
  | "occupied"
  | "next_reservation"
  | "vip"
  | "blocked"
  | "cleaning"
  | "bill_requested";

export type TableShape = "round" | "square" | "rect" | "oval";

export interface Zone {
  id: string;
  name: string;
  color: string; // token: "gold" | "teal" | "fuchsia" | "amber"
  icon: React.ElementType;
}

export interface FloorTable {
  id: string;
  name: string;
  seats: number;
  shape: TableShape;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  zoneId: string;
  state: TableState;
  customerName?: string;
  partySize?: number;
  reservationTime?: string;
  occupiedSince?: number;
  estimatedRemaining?: number;
  nextReservation?: { time: string; name: string; party: number };
  vipLevel?: number;
  assignedTo?: string;
  notes?: string;
  mergedFrom?: string[];
}

export interface FloorState {
  zones: Zone[];
  tables: FloorTable[];
  selectedIds: string[];
  history: FloorTable[][];
  future: FloorTable[][];
  editMode: boolean;
}

/* ============================================================
 * Constantes
 * ============================================================ */
const DEFAULT_ZONES: Zone[] = [
  { id: "z-sala", name: "Sala principal", color: "gold", icon: Wine },
  { id: "z-terraza", name: "Terraza", color: "teal", icon: Coffee },
  { id: "z-vip", name: "Zona VIP", color: "fuchsia", icon: Crown },
  { id: "z-barra", name: "Barra", color: "amber", icon: Glasses },
];

interface StateMeta {
  label: string;
  short: string;
  bg: string;
  border: string;
  text: string;
  dot: string;
  icon: React.ElementType;
  hex: string;
}

const STATE_META: Record<TableState, StateMeta> = {
  free: {
    label: "Libre",
    short: "Libre",
    bg: "bg-emerald-500/12",
    border: "border-emerald-400/55",
    text: "text-emerald-200",
    dot: "bg-emerald-400",
    icon: CheckCircle2,
    hex: "#34D399",
  },
  reserved: {
    label: "Reservada",
    short: "Reservada",
    bg: "bg-sky-500/14",
    border: "border-sky-400/60",
    text: "text-sky-200",
    dot: "bg-sky-400",
    icon: Clock,
    hex: "#38BDF8",
  },
  occupied: {
    label: "Ocupada",
    short: "Ocupada",
    bg: "bg-red-500/15",
    border: "border-red-400/60",
    text: "text-red-200",
    dot: "bg-red-400",
    icon: Users,
    hex: "#F87171",
  },
  next_reservation: {
    label: "Próxima reserva",
    short: "Próxima",
    bg: "bg-amber-500/14",
    border: "border-amber-400/60",
    text: "text-amber-200",
    dot: "bg-amber-400",
    icon: Sparkles,
    hex: "#FBBF24",
  },
  vip: {
    label: "VIP",
    short: "VIP",
    bg: "bg-fuchsia-500/16",
    border: "border-fuchsia-400/65",
    text: "text-fuchsia-200",
    dot: "bg-fuchsia-400",
    icon: Crown,
    hex: "#E879F9",
  },
  blocked: {
    label: "Bloqueada",
    short: "Bloqueada",
    bg: "bg-zinc-500/16",
    border: "border-zinc-400/50",
    text: "text-zinc-300",
    dot: "bg-zinc-400",
    icon: Lock,
    hex: "#A1A1AA",
  },
  cleaning: {
    label: "Limpieza",
    short: "Limpieza",
    bg: "bg-orange-500/14",
    border: "border-orange-400/60",
    text: "text-orange-200",
    dot: "bg-orange-400",
    icon: Brush,
    hex: "#FB923C",
  },
  bill_requested: {
    label: "Cuenta solicitada",
    short: "Cuenta",
    bg: "bg-[var(--teal)]/14",
    border: "border-[var(--teal)]/60",
    text: "text-[var(--teal)]",
    dot: "bg-[var(--teal)]",
    icon: FileText,
    hex: "#3DD6C9",
  },
};

// Ciclo en modo operación: libre → reservada → ocupada → limpieza → bloqueada → libre
const OP_CYCLE: TableState[] = [
  "free",
  "reserved",
  "occupied",
  "cleaning",
  "blocked",
];

const STATE_ORDER: TableState[] = [
  "free",
  "reserved",
  "occupied",
  "next_reservation",
  "vip",
  "blocked",
  "cleaning",
  "bill_requested",
];

const SHAPE_OPTIONS: { value: TableShape; label: string; icon: React.ElementType }[] = [
  { value: "round", label: "Redonda", icon: Circle },
  { value: "square", label: "Cuadrada", icon: Square },
  { value: "rect", label: "Rectangular", icon: RectangleHorizontal },
  { value: "oval", label: "Ovalada", icon: Circle },
];

function shapeClass(shape: TableShape): string {
  switch (shape) {
    case "round":
      return "rounded-full";
    case "square":
      return "rounded-lg";
    case "rect":
      return "rounded-lg";
    case "oval":
      return "rounded-full";
  }
}

function zoneBgClass(color: string): string {
  switch (color) {
    case "gold":
      return "bg-[var(--gold)]/[0.05] border-[var(--gold)]/25";
    case "teal":
      return "bg-[var(--teal)]/[0.05] border-[var(--teal)]/25";
    case "fuchsia":
      return "bg-fuchsia-500/[0.05] border-fuchsia-500/25";
    case "amber":
      return "bg-amber-500/[0.05] border-amber-500/25";
    default:
      return "bg-foreground/[0.03] border-border/50";
  }
}

function zoneAccentClass(color: string): string {
  switch (color) {
    case "gold":
      return "text-[var(--gold)]";
    case "teal":
      return "text-[var(--teal)]";
    case "fuchsia":
      return "text-fuchsia-300";
    case "amber":
      return "text-amber-300";
    default:
      return "text-muted-foreground";
  }
}

/* ============================================================
 * Datos demo
 * ============================================================ */
const NOW = Date.now();
const MIN = 60_000;

const DEMO_TABLES: FloorTable[] = [
  // Sala principal
  {
    id: "t1", name: "M1", seats: 4, shape: "square", x: 24, y: 32, w: 84, h: 84,
    rotation: 0, zoneId: "z-sala", state: "free",
  },
  {
    id: "t2", name: "M2", seats: 2, shape: "round", x: 130, y: 32, w: 84, h: 84,
    rotation: 0, zoneId: "z-sala", state: "reserved",
    customerName: "Elena Vidal", partySize: 2, reservationTime: "13:30",
  },
  {
    id: "t3", name: "M3", seats: 6, shape: "rect", x: 24, y: 140, w: 140, h: 84,
    rotation: 0, zoneId: "z-sala", state: "occupied",
    customerName: "Familia Ruiz", partySize: 6,
    occupiedSince: NOW - 42 * MIN, estimatedRemaining: 35, assignedTo: "Carlos",
  },
  {
    id: "t4", name: "M4", seats: 4, shape: "round", x: 184, y: 140, w: 84, h: 84,
    rotation: 0, zoneId: "z-sala", state: "next_reservation",
    nextReservation: { time: "15:00", name: "Marc P.", party: 4 },
  },
  // Terraza
  {
    id: "t5", name: "T1", seats: 2, shape: "round", x: 24, y: 32, w: 84, h: 84,
    rotation: 0, zoneId: "z-terraza", state: "free",
  },
  {
    id: "t6", name: "T2", seats: 4, shape: "square", x: 130, y: 32, w: 84, h: 84,
    rotation: 0, zoneId: "z-terraza", state: "occupied",
    customerName: "Pareja López", partySize: 2,
    occupiedSince: NOW - 18 * MIN, estimatedRemaining: 60, assignedTo: "María",
  },
  {
    id: "t7", name: "T3", seats: 4, shape: "rect", x: 24, y: 140, w: 130, h: 84,
    rotation: 0, zoneId: "z-terraza", state: "bill_requested",
    customerName: "Sr. Gómez", partySize: 4,
    occupiedSince: NOW - 75 * MIN,
  },
  {
    id: "t8", name: "T4", seats: 2, shape: "round", x: 180, y: 140, w: 84, h: 84,
    rotation: 0, zoneId: "z-terraza", state: "cleaning",
    assignedTo: "Equipo de limpieza",
  },
  // VIP
  {
    id: "t9", name: "V1", seats: 8, shape: "rect", x: 24, y: 32, w: 150, h: 88,
    rotation: 0, zoneId: "z-vip", state: "vip",
    customerName: "Sra. Delgado", partySize: 6, vipLevel: 2,
    occupiedSince: NOW - 25 * MIN, estimatedRemaining: 90, assignedTo: "Ana (gerente)",
  },
  {
    id: "t10", name: "V2", seats: 4, shape: "round", x: 194, y: 32, w: 90, h: 90,
    rotation: 0, zoneId: "z-vip", state: "reserved",
    customerName: "Marc T.", partySize: 4, reservationTime: "21:30", vipLevel: 1,
  },
  {
    id: "t11", name: "V3", seats: 6, shape: "oval", x: 80, y: 150, w: 140, h: 80,
    rotation: 0, zoneId: "z-vip", state: "free", vipLevel: 1,
  },
  // Barra
  {
    id: "t12", name: "B1", seats: 2, shape: "square", x: 16, y: 36, w: 70, h: 70,
    rotation: 0, zoneId: "z-barra", state: "occupied",
    customerName: "Jorge", partySize: 1, occupiedSince: NOW - 8 * MIN,
  },
  {
    id: "t13", name: "B2", seats: 2, shape: "square", x: 96, y: 36, w: 70, h: 70,
    rotation: 0, zoneId: "z-barra", state: "free",
  },
  {
    id: "t14", name: "B3", seats: 2, shape: "square", x: 176, y: 36, w: 70, h: 70,
    rotation: 0, zoneId: "z-barra", state: "blocked",
    notes: "Reservada para evento privado a las 22:00",
  },
  {
    id: "t15", name: "B4", seats: 2, shape: "square", x: 256, y: 36, w: 70, h: 70,
    rotation: 0, zoneId: "z-barra", state: "free",
  },
];

/* ============================================================
 * Helpers
 * ============================================================ */
function uid(prefix = "t"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function nextTableName(zoneId: string, tables: FloorTable[]): string {
  const prefix =
    zoneId === "z-sala" ? "M" :
    zoneId === "z-terraza" ? "T" :
    zoneId === "z-vip" ? "V" :
    zoneId === "z-barra" ? "B" : "X";
  const nums = tables
    .filter((t) => t.name.startsWith(prefix))
    .map((t) => parseInt(t.name.slice(prefix.length), 10))
    .filter((n) => !Number.isNaN(n));
  const next = nums.length === 0 ? 1 : Math.max(...nums) + 1;
  return `${prefix}${next}`;
}

function findFreePosition(zoneId: string, tables: FloorTable[], w: number, h: number) {
  const zoneTables = tables.filter((t) => t.zoneId === zoneId);
  const ZONE_W = 360;
  const ZONE_H = 260;
  const PAD = 12;
  // Try grid positions
  for (let y = PAD; y < ZONE_H - h - PAD; y += 20) {
    for (let x = PAD; x < ZONE_W - w - PAD; x += 20) {
      const overlap = zoneTables.some(
        (t) =>
          x < t.x + t.w + 8 &&
          x + w + 8 > t.x &&
          y < t.y + t.h + 8 &&
          y + h + 8 > t.y
      );
      if (!overlap) return { x, y };
    }
  }
  return { x: PAD, y: PAD };
}

function formatElapsed(since?: number): string {
  if (!since) return "—";
  const mins = Math.floor((Date.now() - since) / MIN);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

function makeInitialFloor(): FloorState {
  return {
    zones: DEFAULT_ZONES,
    tables: DEMO_TABLES.map((t) => ({ ...t })),
    selectedIds: [],
    history: [],
    future: [],
    editMode: true,
  };
}

/* ============================================================
 * FloorEditor — componente principal
 * ============================================================ */
export function FloorEditor() {
  const reduceMotion = useReducedMotion();
  const { toast } = useToast();

  const [floor, setFloor] = React.useState<FloorState>(() => makeInitialFloor());
  const [zoneFilter, setZoneFilter] = React.useState<string>("all");
  const [online, setOnline] = React.useState(true);
  const [mobileZone, setMobileZone] = React.useState<string>("z-sala");
  const [mobilePanelOpen, setMobilePanelOpen] = React.useState(false);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  // Refs de drag (transient, no re-render)
  const dragRef = React.useRef<DragState | null>(null);
  const resizeRef = React.useRef<ResizeState | null>(null);
  const boxRef = React.useRef<BoxState | null>(null);
  const historyPushedRef = React.useRef(false);

  // Box-select preview (sí re-render para mostrar el rectángulo)
  const [boxPreview, setBoxPreview] = React.useState<{
    zoneId: string;
    x1: number; y1: number; x2: number; y2: number;
  } | null>(null);

  /* ----- Selección ----- */
  function setSelected(ids: string[]) {
    setFloor((p) => ({ ...p, selectedIds: ids }));
  }

  function selectTable(id: string, additive: boolean) {
    setFloor((p) => {
      if (additive) {
        const has = p.selectedIds.includes(id);
        return {
          ...p,
          selectedIds: has
            ? p.selectedIds.filter((x) => x !== id)
            : [...p.selectedIds, id],
        };
      }
      return { ...p, selectedIds: [id] };
    });
  }

  function clearSelection() {
    setFloor((p) => ({ ...p, selectedIds: [] }));
  }

  /* ----- Historial ----- */
  function pushHistorySnapshot() {
    setFloor((p) => ({
      ...p,
      history: [...p.history, p.tables].slice(-50),
      future: [],
    }));
  }

  /** Commit con snapshot al historial. */
  function commit(updater: (prev: FloorTable[]) => FloorTable[]) {
    setFloor((p) => ({
      ...p,
      history: [...p.history, p.tables].slice(-50),
      future: [],
      tables: updater(p.tables),
    }));
  }

  function undo() {
    setFloor((p) => {
      if (p.history.length === 0) return p;
      const last = p.history[p.history.length - 1];
      return {
        ...p,
        tables: last,
        history: p.history.slice(0, -1),
        future: [p.tables, ...p.future].slice(0, 50),
        selectedIds: p.selectedIds.filter((id) => last.some((t) => t.id === id)),
      };
    });
    toast({ title: "Deshecho", description: "Se restauró el estado anterior." });
  }

  function redo() {
    setFloor((p) => {
      if (p.future.length === 0) return p;
      const next = p.future[0];
      return {
        ...p,
        tables: next,
        history: [...p.history, p.tables].slice(-50),
        future: p.future.slice(1),
        selectedIds: p.selectedIds.filter((id) => next.some((t) => t.id === id)),
      };
    });
    toast({ title: "Rehecho", description: "Se reaplicó el cambio." });
  }

  /* ----- Mutaciones ----- */
  function addTable(input: {
    name: string;
    seats: number;
    shape: TableShape;
    zoneId: string;
  }) {
    const w = input.shape === "rect" ? 130 : input.shape === "oval" ? 130 : 84;
    const h = 84;
    const pos = findFreePosition(input.zoneId, floor.tables, w, h);
    const newTable: FloorTable = {
      id: uid("t"),
      name: input.name,
      seats: input.seats,
      shape: input.shape,
      x: pos.x,
      y: pos.y,
      w,
      h,
      rotation: 0,
      zoneId: input.zoneId,
      state: "free",
    };
    commit((prev) => [...prev, newTable]);
    setSelected([newTable.id]);
    setMobileZone(input.zoneId);
    toast({
      title: "Mesa añadida",
      description: `${newTable.name} · ${input.seats} comensales · ${
        DEFAULT_ZONES.find((z) => z.id === input.zoneId)?.name
      }`,
    });
  }

  function deleteSelected() {
    const ids = floor.selectedIds;
    if (ids.length === 0) return;
    commit((prev) => prev.filter((t) => !ids.includes(t.id)));
    setSelected([]);
    setDeleteDialogOpen(false);
    toast({
      title: "Mesas eliminadas",
      description: `${ids.length} ${ids.length === 1 ? "mesa eliminada" : "mesas eliminadas"}.`,
    });
  }

  function moveSelectedToZone(targetZoneId: string) {
    const ids = floor.selectedIds;
    if (ids.length === 0) return;
    const targetZone = floor.zones.find((z) => z.id === targetZoneId);
    if (!targetZone) return;
    commit((prev) =>
      prev.map((t) => {
        if (!ids.includes(t.id)) return t;
        if (t.zoneId === targetZoneId) return t;
        const pos = findFreePosition(
          targetZoneId,
          prev.filter((x) => x.id !== t.id),
          t.w,
          t.h
        );
        return { ...t, zoneId: targetZoneId, x: pos.x, y: pos.y };
      })
    );
    setMobileZone(targetZoneId);
    toast({
      title: "Mesa traspasada",
      description:
        ids.length === 1
          ? `Mesa movida a ${targetZone.name}.`
          : `${ids.length} mesas movidas a ${targetZone.name}.`,
    });
  }

  function mergeSelected() {
    const sel = floor.tables.filter((t) => floor.selectedIds.includes(t.id));
    if (sel.length < 2) return;
    const totalSeats = sel.reduce((sum, t) => sum + t.seats, 0);
    const cx = sel.reduce((s, t) => s + t.x + t.w / 2, 0) / sel.length;
    const cy = sel.reduce((s, t) => s + t.y + t.h / 2, 0) / sel.length;
    const newW = clamp(120 + sel.length * 30, 140, 260);
    const newH = 90;
    const newTable: FloorTable = {
      id: uid("m"),
      name: sel.map((t) => t.name).join("+"),
      seats: totalSeats,
      shape: "rect",
      x: clamp(cx - newW / 2, 8, 360 - newW - 8),
      y: clamp(cy - newH / 2, 8, 280 - newH - 8),
      w: newW,
      h: newH,
      rotation: 0,
      zoneId: sel[0].zoneId,
      state: sel.some((t) => t.state === "occupied") ? "occupied" : "free",
      mergedFrom: sel.map((t) => t.id),
    };
    commit((prev) => [
      ...prev.filter((t) => !floor.selectedIds.includes(t.id)),
      newTable,
    ]);
    setSelected([newTable.id]);
    toast({
      title: "Mesas fusionadas",
      description: `${sel.length} mesas → ${newTable.name} (${totalSeats} comensales).`,
    });
  }

  function splitSelected() {
    const id = floor.selectedIds[0];
    const table = floor.tables.find((t) => t.id === id);
    if (!table || table.shape !== "rect") return;
    const half = Math.max(1, Math.floor(table.seats / 2));
    const otherHalf = Math.max(1, table.seats - half);
    const wasMerged = table.mergedFrom && table.mergedFrom.length > 0;
    const baseName = wasMerged ? (table.mergedFrom!.length > 1 ? "M" : "M") : "M";
    const t1: FloorTable = {
      ...table,
      id: uid("t"),
      name: wasMerged ? `${baseName}${Math.floor(Math.random() * 90 + 10)}` : `${table.name}a`,
      seats: half,
      shape: "square",
      w: 84,
      h: 84,
      x: table.x,
      y: table.y,
      mergedFrom: undefined,
    };
    const t2: FloorTable = {
      ...table,
      id: uid("t"),
      name: wasMerged ? `${baseName}${Math.floor(Math.random() * 90 + 10)}` : `${table.name}b`,
      seats: otherHalf,
      shape: "square",
      w: 84,
      h: 84,
      x: clamp(table.x + table.w - 84, 8, 280),
      y: table.y,
      mergedFrom: undefined,
    };
    commit((prev) => [...prev.filter((x) => x.id !== id), t1, t2]);
    setSelected([t1.id, t2.id]);
    toast({
      title: "Mesa separada",
      description: `${table.name} → ${t1.name} (${half}) + ${t2.name} (${otherHalf}).`,
    });
  }

  function rotateSelected(delta: number) {
    if (floor.selectedIds.length === 0) return;
    commit((prev) =>
      prev.map((t) =>
        floor.selectedIds.includes(t.id)
          ? { ...t, rotation: (t.rotation + delta + 360) % 360 }
          : t
      )
    );
  }

  function updateTable(id: string, patch: Partial<FloorTable>) {
    commit((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
  }

  function setEditMode(on: boolean) {
    setFloor((p) => ({ ...p, editMode: on }));
    if (!on) clearSelection();
  }

  function cycleState(id: string) {
    commit((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const idx = OP_CYCLE.indexOf(t.state as TableState);
        const nextIdx = (idx + 1) % OP_CYCLE.length;
        const nextState = OP_CYCLE[nextIdx];
        const patch: Partial<FloorTable> = { state: nextState };
        if (nextState === "free") {
          patch.customerName = undefined;
          patch.partySize = undefined;
          patch.occupiedSince = undefined;
          patch.estimatedRemaining = undefined;
          patch.reservationTime = undefined;
        }
        return { ...t, ...patch };
      })
    );
  }

  /* ----- Drag (pointer events, touch-friendly) ----- */
  function onTablePointerDown(table: FloorTable, e: React.PointerEvent) {
    if (floor.editMode) {
      e.stopPropagation();
      const additive = e.shiftKey || e.ctrlKey || e.metaKey;
      selectTable(table.id, additive);
      const zoneEl = (e.currentTarget as HTMLElement).closest(
        "[data-zone-id]"
      ) as HTMLElement | null;
      const rect = zoneEl?.getBoundingClientRect();
      dragRef.current = {
        tableId: table.id,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        lastY: e.clientY,
        zoneW: rect?.width ?? 360,
        zoneH: rect?.height ?? 280,
        moved: false,
      };
      historyPushedRef.current = false;
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    }
  }

  function onTablePointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const d = dragRef.current;
    const dx = e.clientX - d.lastX;
    const dy = e.clientY - d.lastY;
    const totalDx = e.clientX - d.startX;
    const totalDy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(totalDx, totalDy) < 4) return;
    if (!d.moved) d.moved = true;
    if (!historyPushedRef.current) {
      pushHistorySnapshot();
      historyPushedRef.current = true;
    }
    d.lastX = e.clientX;
    d.lastY = e.clientY;
    const selectedSet = new Set(floor.selectedIds.length > 0 ? floor.selectedIds : [d.tableId]);
    setFloor((p) => ({
      ...p,
      tables: p.tables.map((t) => {
        if (!selectedSet.has(t.id)) return t;
        return {
          ...t,
          x: clamp(t.x + dx, 0, d.zoneW - t.w),
          y: clamp(t.y + dy, 0, d.zoneH - t.h),
        };
      }),
    }));
  }

  function onTablePointerUp(e: React.PointerEvent) {
    if (dragRef.current) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(dragRef.current.pointerId);
      } catch {
        /* noop */
      }
    }
    dragRef.current = null;
    historyPushedRef.current = false;
  }

  function onTableClick(table: FloorTable, e: React.MouseEvent) {
    if (floor.editMode) return; // selección se maneja en pointerdown
    // Modo operación: clic = ciclo de estado + selecciona para info
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      selectTable(table.id, true);
    } else {
      selectTable(table.id, false);
      cycleState(table.id);
    }
  }

  /* ----- Resize ----- */
  function onResizePointerDown(table: FloorTable, e: React.PointerEvent) {
    if (!floor.editMode) return;
    e.stopPropagation();
    if (!floor.selectedIds.includes(table.id)) {
      selectTable(table.id, false);
    }
    resizeRef.current = {
      tableId: table.id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origW: table.w,
      origH: table.h,
    };
    historyPushedRef.current = false;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  }

  function onResizePointerMove(e: React.PointerEvent) {
    if (!resizeRef.current) return;
    const r = resizeRef.current;
    const dx = e.clientX - r.startX;
    const dy = e.clientY - r.startY;
    if (!historyPushedRef.current && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
      pushHistorySnapshot();
      historyPushedRef.current = true;
    }
    const newW = clamp(r.origW + dx, 56, 280);
    const newH = clamp(r.origH + dy, 56, 200);
    setFloor((p) => ({
      ...p,
      tables: p.tables.map((t) =>
        t.id === r.tableId ? { ...t, w: newW, h: newH } : t
      ),
    }));
  }

  function onResizePointerUp(e: React.PointerEvent) {
    if (resizeRef.current) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(resizeRef.current.pointerId);
      } catch {
        /* noop */
      }
    }
    resizeRef.current = null;
    historyPushedRef.current = false;
  }

  /* ----- Box-select ----- */
  function onZonePointerDown(zoneId: string, e: React.PointerEvent) {
    if (!floor.editMode) return;
    // Solo en zona vacía (las mesas hacen stopPropagation)
    const zoneEl = e.currentTarget as HTMLElement;
    const rect = zoneEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    boxRef.current = {
      zoneId,
      pointerId: e.pointerId,
      startX: x,
      startY: y,
      curX: x,
      curY: y,
    };
    if (!e.shiftKey && !e.ctrlKey && !e.metaKey) clearSelection();
    setBoxPreview({ zoneId, x1: x, y1: y, x2: x, y2: y });
    try {
      zoneEl.setPointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  }

  function onZonePointerMove(e: React.PointerEvent) {
    if (!boxRef.current) return;
    const b = boxRef.current;
    const zoneEl = e.currentTarget as HTMLElement;
    const rect = zoneEl.getBoundingClientRect();
    b.curX = e.clientX - rect.left;
    b.curY = e.clientY - rect.top;
    setBoxPreview({ zoneId: b.zoneId, x1: b.startX, y1: b.startY, x2: b.curX, y2: b.curY });
  }

  function onZonePointerUp(e: React.PointerEvent) {
    if (!boxRef.current) return;
    const b = boxRef.current;
    const x1 = Math.min(b.startX, b.curX);
    const y1 = Math.min(b.startY, b.curY);
    const x2 = Math.max(b.startX, b.curX);
    const y2 = Math.max(b.startY, b.curY);
    const moved = Math.abs(b.curX - b.startX) > 4 || Math.abs(b.curY - b.startY) > 4;
    if (moved) {
      const hits = floor.tables
        .filter((t) => t.zoneId === b.zoneId)
        .filter((t) => t.x < x2 && t.x + t.w > x1 && t.y < y2 && t.y + t.h > y1)
        .map((t) => t.id);
      setSelected(hits);
    }
    boxRef.current = null;
    setBoxPreview(null);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(b.pointerId);
    } catch {
      /* noop */
    }
  }

  /* ----- Teclado ----- */
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inField =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        const k = e.key.toLowerCase();
        if (k === "z" && !e.shiftKey) {
          e.preventDefault();
          undo();
          return;
        }
        if ((k === "z" && e.shiftKey) || k === "y") {
          e.preventDefault();
          redo();
          return;
        }
      }

      if (inField) return;

      // Delete
      if ((e.key === "Delete" || e.key === "Backspace") && floor.selectedIds.length > 0) {
        e.preventDefault();
        setDeleteDialogOpen(true);
        return;
      }

      // Arrow keys: mover selección
      if (
        floor.selectedIds.length > 0 &&
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
      ) {
        if (!floor.editMode) return;
        e.preventDefault();
        const step = e.shiftKey ? 10 : 4;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        if (!historyPushedRef.current) {
          pushHistorySnapshot();
          historyPushedRef.current = true;
        }
        commit((prev) =>
          prev.map((t) =>
            floor.selectedIds.includes(t.id)
              ? { ...t, x: clamp(t.x + dx, 0, 360 - t.w), y: clamp(t.y + dy, 0, 280 - t.h) }
              : t
          )
        );
        // reset para que el siguiente keydown sea un nuevo snapshot
        window.setTimeout(() => {
          historyPushedRef.current = false;
        }, 80);
      }

      // Escape: limpiar selección
      if (e.key === "Escape") {
        clearSelection();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [floor.selectedIds, floor.editMode, floor.tables]);

  /* ----- Derivados ----- */
  const selectedTables = floor.tables.filter((t) =>
    floor.selectedIds.includes(t.id)
  );
  const singleSelected = selectedTables.length === 1 ? selectedTables[0] : null;
  const visibleZones =
    zoneFilter === "all"
      ? floor.zones
      : floor.zones.filter((z) => z.id === zoneFilter);
  const canMerge = selectedTables.length >= 2;
  const canSplit =
    selectedTables.length === 1 && singleSelected?.shape === "rect";

  // Stats
  const stats = React.useMemo(() => {
    const total = floor.tables.length;
    const free = floor.tables.filter((t) => t.state === "free").length;
    const occupied = floor.tables.filter((t) => t.state === "occupied").length;
    const reserved = floor.tables.filter(
      (t) => t.state === "reserved" || t.state === "next_reservation"
    ).length;
    const seats = floor.tables.reduce((s, t) => s + t.seats, 0);
    return { total, free, occupied, reserved, seats };
  }, [floor.tables]);

  /* ----- Abrir panel móvil cuando hay selección ----- */
  React.useEffect(() => {
    if (selectedTables.length > 0) {
      // en móvil, abrir bottom sheet si hay selección
      if (window.matchMedia("(max-width: 1023px)").matches) {
        setMobilePanelOpen(true);
      }
    }
  }, [selectedTables.length]);

  /* ============================================================
   * Render
   * ============================================================ */
  return (
    <div className="flex flex-col gap-4 min-w-0">
      {/* Header del editor */}
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-xl sm:text-2xl tracking-tight">
              Plano de mesas
            </h1>
            <Badge
              variant="outline"
              className="border-[var(--gold)]/40 text-[var(--gold-soft)] bg-[var(--gold)]/10 text-[10px] uppercase tracking-[0.15em]"
            >
              Demo
            </Badge>
            <span className="text-[11px] text-muted-foreground font-mono">
              {floor.location ?? "Ramses Madrid"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Diseña y opera tu sala en tiempo real. Arrastra mesas dentro de una
            zona, <span className="text-[var(--gold-soft)]">traspasa mesas entre zonas</span>,
            fusiona, separa y controla el estado de cada mesa.
          </p>
        </div>

        {/* Stats rápidas */}
        <div className="flex items-center gap-2 flex-wrap">
          <MiniStat label="Mesas" value={stats.total} />
          <MiniStat label="Libres" value={stats.free} tone="emerald" />
          <MiniStat label="Ocupadas" value={stats.occupied} tone="red" />
          <MiniStat label="Reservadas" value={stats.reserved} tone="sky" />
          <MiniStat label="Comensales" value={stats.seats} tone="gold" />
        </div>
      </header>

      {/* Toolbar sticky */}
      <Toolbar
        editMode={floor.editMode}
        onToggleMode={setEditMode}
        onAdd={() => setAddDialogOpen(true)}
        onDelete={() => setDeleteDialogOpen(true)}
        canDelete={floor.selectedIds.length > 0}
        onMoveToZone={moveSelectedToZone}
        canMove={floor.selectedIds.length > 0}
        zones={floor.zones}
        onMerge={mergeSelected}
        canMerge={canMerge}
        onSplit={splitSelected}
        canSplit={canSplit}
        onRotate={() => rotateSelected(90)}
        canRotate={floor.selectedIds.length > 0}
        onUndo={undo}
        onRedo={redo}
        canUndo={floor.history.length > 0}
        canRedo={floor.future.length > 0}
        zoneFilter={zoneFilter}
        onZoneFilter={setZoneFilter}
        online={online}
        onToggleOnline={() => setOnline((v) => !v)}
        selectedCount={floor.selectedIds.length}
      />

      {/* Cuerpo: grid zonas + panel */}
      <div className="flex flex-col lg:flex-row gap-4 min-w-0">
        {/* Zonas */}
        <div className="flex-1 min-w-0">
          {/* Mobile: tabs */}
          <div className="lg:hidden">
            <Tabs value={mobileZone} onValueChange={setMobileZone}>
              <TabsList className="w-full justify-start overflow-x-auto rp-scroll-thin h-auto">
                {visibleZones.map((z) => (
                  <TabsTrigger
                    key={z.id}
                    value={z.id}
                    className="min-h-[40px] gap-1.5"
                  >
                    <z.icon className="h-3.5 w-3.5" />
                    <span className="text-xs">{z.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              {visibleZones.map((z) => (
                <TabsContent key={z.id} value={z.id}>
                  <ZoneCanvas
                    zone={z}
                    tables={floor.tables.filter((t) => t.zoneId === z.id)}
                    editMode={floor.editMode}
                    selectedIds={new Set(floor.selectedIds)}
                    boxPreview={boxPreview?.zoneId === z.id ? boxPreview : null}
                    onZonePointerDown={onZonePointerDown}
                    onZonePointerMove={onZonePointerMove}
                    onZonePointerUp={onZonePointerUp}
                    onTablePointerDown={onTablePointerDown}
                    onTablePointerMove={onTablePointerMove}
                    onTablePointerUp={onTablePointerUp}
                    onTableClick={onTableClick}
                    onResizePointerDown={onResizePointerDown}
                    onResizePointerMove={onResizePointerMove}
                    onResizePointerUp={onResizePointerUp}
                    reduceMotion={!!reduceMotion}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Desktop: grid */}
          <div
            className={cn(
              "hidden lg:grid gap-4",
              visibleZones.length >= 4
                ? "2xl:grid-cols-4 xl:grid-cols-2"
                : visibleZones.length === 3
                ? "xl:grid-cols-3"
                : visibleZones.length === 2
                ? "xl:grid-cols-2"
                : "grid-cols-1"
            )}
          >
            {visibleZones.map((z) => (
              <ZoneCanvas
                key={z.id}
                zone={z}
                tables={floor.tables.filter((t) => t.zoneId === z.id)}
                editMode={floor.editMode}
                selectedIds={new Set(floor.selectedIds)}
                boxPreview={boxPreview?.zoneId === z.id ? boxPreview : null}
                onZonePointerDown={onZonePointerDown}
                onZonePointerMove={onZonePointerMove}
                onZonePointerUp={onZonePointerUp}
                onTablePointerDown={onTablePointerDown}
                onTablePointerMove={onTablePointerMove}
                onTablePointerUp={onTablePointerUp}
                onTableClick={onTableClick}
                onResizePointerDown={onResizePointerDown}
                onResizePointerMove={onResizePointerMove}
                onResizePointerUp={onResizePointerUp}
                reduceMotion={!!reduceMotion}
              />
            ))}
          </div>

          {/* Leyenda */}
          <Legend />
        </div>

        {/* Panel lateral (desktop) */}
        <aside className="hidden lg:block w-80 xl:w-96 shrink-0">
          <PropertiesPanel
            tables={selectedTables}
            single={singleSelected}
            zones={floor.zones}
            editMode={floor.editMode}
            onUpdate={updateTable}
            onCycleState={cycleState}
            onClear={clearSelection}
          />
        </aside>
      </div>

      {/* Bottom sheet (mobile) */}
      <Sheet open={mobilePanelOpen} onOpenChange={setMobilePanelOpen}>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rp-scroll-thin">
          <SheetHeader>
            <SheetTitle className="text-base">
              {selectedTables.length === 0
                ? "Propiedades"
                : selectedTables.length === 1
                ? `Mesa ${singleSelected?.name}`
                : `${selectedTables.length} mesas seleccionadas`}
            </SheetTitle>
            <SheetDescription className="sr-only">
              Edita las propiedades de las mesas seleccionadas.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            <PropertiesPanel
              tables={selectedTables}
              single={singleSelected}
              zones={floor.zones}
              editMode={floor.editMode}
              onUpdate={updateTable}
              onCycleState={cycleState}
              onClear={() => {
                clearSelection();
                setMobilePanelOpen(false);
              }}
              embedded
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Diálogo: añadir mesa */}
      <AddTableDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        zones={floor.zones}
        defaultZoneId={mobileZone}
        suggestName={(zoneId) =>
          nextTableName(
            zoneId,
            floor.tables
          )
        }
        onConfirm={(input) => {
          addTable(input);
          setAddDialogOpen(false);
        }}
      />

      {/* Confirmar eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar mesas?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán {floor.selectedIds.length}{" "}
              {floor.selectedIds.length === 1 ? "mesa" : "mesas"}. Puedes
              deshacer con Ctrl+Z.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteSelected}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Botón flotante: abrir panel en móvil cuando hay selección */}
      {selectedTables.length > 0 && (
        <button
          onClick={() => setMobilePanelOpen(true)}
          className="lg:hidden fixed bottom-4 right-4 z-30 h-12 px-4 rounded-full bg-[var(--gold)] text-black font-medium text-sm shadow-lg flex items-center gap-2 active:scale-95 transition-transform"
          aria-label="Editar mesa seleccionada"
        >
          <Pencil className="h-4 w-4" />
          {selectedTables.length === 1
            ? `Editar ${singleSelected?.name}`
            : `${selectedTables.length} mesas`}
        </button>
      )}
    </div>
  );
}

/* ============================================================
 * Tipos internos (drag / resize / box)
 * ============================================================ */
interface DragState {
  tableId: string;
  pointerId: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  zoneW: number;
  zoneH: number;
  moved: boolean;
}

interface ResizeState {
  tableId: string;
  pointerId: number;
  startX: number;
  startY: number;
  origW: number;
  origH: number;
}

interface BoxState {
  zoneId: string;
  pointerId: number;
  startX: number;
  startY: number;
  curX: number;
  curY: number;
}

/* ============================================================
 * Toolbar
 * ============================================================ */
interface ToolbarProps {
  editMode: boolean;
  onToggleMode: (on: boolean) => void;
  onAdd: () => void;
  onDelete: () => void;
  canDelete: boolean;
  onMoveToZone: (zoneId: string) => void;
  canMove: boolean;
  zones: Zone[];
  onMerge: () => void;
  canMerge: boolean;
  onSplit: () => void;
  canSplit: boolean;
  onRotate: () => void;
  canRotate: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  zoneFilter: string;
  onZoneFilter: (v: string) => void;
  online: boolean;
  onToggleOnline: () => void;
  selectedCount: number;
}

function Toolbar(props: ToolbarProps) {
  return (
    <div className="sticky top-16 z-20 rp-glass-strong rounded-xl border border-border/60">
      {/* Fila 1: acciones principales */}
      <div className="flex items-center gap-2 p-2.5 overflow-x-auto rp-scroll-thin">
        {/* Mode toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-foreground/5 p-1 shrink-0">
          <button
            onClick={() => props.onToggleMode(true)}
            className={cn(
              "h-8 px-2.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors min-w-[44px] justify-center",
              props.editMode
                ? "bg-[var(--gold)] text-black"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={props.editMode}
            aria-label="Modo editar"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Editar</span>
          </button>
          <button
            onClick={() => props.onToggleMode(false)}
            className={cn(
              "h-8 px-2.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors min-w-[44px] justify-center",
              !props.editMode
                ? "bg-[var(--gold)] text-black"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={!props.editMode}
            aria-label="Modo operación"
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Operación</span>
          </button>
        </div>

        <ToolbarDivider />

        {/* Añadir */}
        <Button
          size="sm"
          onClick={props.onAdd}
          className="h-9 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">Añadir mesa</span>
          <span className="xs:hidden">Mesa</span>
        </Button>

        {/* Eliminar */}
        <Button
          size="sm"
          variant="outline"
          onClick={props.onDelete}
          disabled={!props.canDelete}
          className="h-9 shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10"
          aria-label="Eliminar mesas seleccionadas"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden md:inline">Eliminar</span>
        </Button>

        {/* Mover a zona — característica clave */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              disabled={!props.canMove}
              className="h-9 shrink-0 border-[var(--gold)]/40 text-[var(--gold-soft)] hover:bg-[var(--gold)]/10"
              aria-label="Traspasar mesa a otra zona"
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span className="hidden md:inline">Mover a zona</span>
              <span className="md:hidden">Zona</span>
              <ChevronRight className="h-3 w-3 -rotate-90 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
              Traspasar a zona
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {props.zones.map((z) => (
              <DropdownMenuItem
                key={z.id}
                onClick={() => props.onMoveToZone(z.id)}
                className="gap-2 cursor-pointer"
              >
                <z.icon className={cn("h-4 w-4", zoneAccentClass(z.color))} />
                <span>{z.name}</span>
                <ArrowRight className="h-3.5 w-3.5 ml-auto opacity-50" />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Fusionar */}
        <Button
          size="sm"
          variant="outline"
          onClick={props.onMerge}
          disabled={!props.canMerge}
          className="h-9 shrink-0"
          aria-label="Fusionar mesas seleccionadas"
        >
          <Combine className="h-4 w-4" />
          <span className="hidden md:inline">Fusionar</span>
        </Button>

        {/* Separar */}
        <Button
          size="sm"
          variant="outline"
          onClick={props.onSplit}
          disabled={!props.canSplit}
          className="h-9 shrink-0"
          aria-label="Separar mesa"
        >
          <Split className="h-4 w-4" />
          <span className="hidden md:inline">Separar</span>
        </Button>

        {/* Rotar */}
        <Button
          size="sm"
          variant="outline"
          onClick={props.onRotate}
          disabled={!props.canRotate}
          className="h-9 shrink-0"
          aria-label="Rotar mesa 90 grados"
        >
          <RotateCw className="h-4 w-4" />
          <span className="hidden md:inline">Rotar</span>
        </Button>

        <ToolbarDivider />

        {/* Undo / Redo */}
        <Button
          size="sm"
          variant="ghost"
          onClick={props.onUndo}
          disabled={!props.canUndo}
          className="h-9 shrink-0"
          aria-label="Deshacer (Ctrl+Z)"
          title="Deshacer (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
          <kbd className="hidden lg:inline text-[10px] font-mono opacity-60 ml-1">
            ⌃Z
          </kbd>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={props.onRedo}
          disabled={!props.canRedo}
          className="h-9 shrink-0"
          aria-label="Rehacer (Ctrl+Shift+Z)"
          title="Rehacer (Ctrl+Shift+Z)"
        >
          <Redo2 className="h-4 w-4" />
          <kbd className="hidden lg:inline text-[10px] font-mono opacity-60 ml-1">
            ⌃⇧Z
          </kbd>
        </Button>

        {/* Derecha: filter + connection */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          {/* Selection count */}
          {props.selectedCount > 0 && (
            <Badge
              variant="outline"
              className="border-[var(--gold)]/40 text-[var(--gold-soft)] bg-[var(--gold)]/10 h-7"
            >
              {props.selectedCount} sel.
            </Badge>
          )}

          {/* Zone filter */}
          <Select value={props.zoneFilter} onValueChange={props.onZoneFilter}>
            <SelectTrigger
              size="sm"
              className="h-9 w-[140px] hidden sm:flex"
              aria-label="Filtrar por zona"
            >
              <Filter className="h-3.5 w-3.5 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las zonas</SelectItem>
              {props.zones.map((z) => (
                <SelectItem key={z.id} value={z.id}>
                  {z.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Connection */}
          <button
            onClick={props.onToggleOnline}
            className={cn(
              "h-9 px-2.5 rounded-md border flex items-center gap-1.5 text-xs font-medium transition-colors shrink-0",
              props.online
                ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
                : "border-amber-400/40 bg-amber-500/10 text-amber-300"
            )}
            aria-label={
              props.online ? "Conectado (clic para modo offline)" : "Modo offline (clic para reconectar)"
            }
            title={props.online ? "Conectado" : "Modo offline"}
          >
            {props.online ? (
              <Wifi className="h-3.5 w-3.5" />
            ) : (
              <WifiOff className="h-3.5 w-3.5" />
            )}
            <span className="hidden md:inline">
              {props.online ? "Conectado" : "Offline"}
            </span>
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                props.online ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              )}
              aria-hidden
            />
          </button>
        </div>
      </div>

      {/* Fila 2: hint contextual */}
      <div className="px-3 pb-2 pt-0 text-[11px] text-muted-foreground flex items-center gap-3 flex-wrap">
        {props.editMode ? (
          <>
            <span className="flex items-center gap-1">
              <Hand className="h-3 w-3" /> Arrastra para mover
            </span>
            <span>·</span>
            <span>
              <kbd className="font-mono px-1 py-0.5 rounded border border-border/60">Shift</kbd>
              +clic multi-selección
            </span>
            <span>·</span>
            <span>Clic+arrastra en zona vacía para caja</span>
            <span>·</span>
            <span>
              <kbd className="font-mono px-1 py-0.5 rounded border border-border/60">↑↓←→</kbd>
              mueve · <kbd className="font-mono px-1 py-0.5 rounded border border-border/60">Supr</kbd>
              elimina
            </span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> Clic en mesa = ciclo de estado
            </span>
            <span>·</span>
            <span>Libre → Reservada → Ocupada → Limpieza → Bloqueada → Libre</span>
          </>
        )}
      </div>
    </div>
  );
}

function ToolbarDivider() {
  return <div className="h-6 w-px bg-border/60 shrink-0" aria-hidden />;
}

/* ============================================================
 * MiniStat
 * ============================================================ */
function MiniStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "emerald" | "red" | "sky" | "gold";
}) {
  const toneClass = {
    default: "text-foreground",
    emerald: "text-emerald-300",
    red: "text-red-300",
    sky: "text-sky-300",
    gold: "text-[var(--gold-soft)]",
  }[tone];
  return (
    <div className="flex items-baseline gap-1.5 rounded-lg border border-border/60 bg-card/50 px-2.5 py-1.5">
      <span className={cn("font-mono text-sm font-medium tabular-nums", toneClass)}>
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

/* ============================================================
 * Legend
 * ============================================================ */
function Legend() {
  return (
    <div className="mt-4 rounded-xl border border-border/60 bg-card/40 p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
          Leyenda · estados
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {STATE_ORDER.map((s) => {
          const meta = STATE_META[s];
          return (
            <div
              key={s}
              className="flex items-center gap-2 rounded-md bg-foreground/[0.03] px-2 py-1.5"
            >
              <span
                className={cn("h-2.5 w-2.5 rounded-full shrink-0", meta.dot)}
                aria-hidden
              />
              <meta.icon className={cn("h-3 w-3 shrink-0", meta.text)} aria-hidden />
              <span className="text-xs text-foreground/90 truncate">{meta.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
 * ZoneCanvas
 * ============================================================ */
interface ZoneCanvasProps {
  zone: Zone;
  tables: FloorTable[];
  editMode: boolean;
  selectedIds: Set<string>;
  boxPreview: { x1: number; y1: number; x2: number; y2: number } | null;
  onZonePointerDown: (zoneId: string, e: React.PointerEvent) => void;
  onZonePointerMove: (e: React.PointerEvent) => void;
  onZonePointerUp: (e: React.PointerEvent) => void;
  onTablePointerDown: (table: FloorTable, e: React.PointerEvent) => void;
  onTablePointerMove: (e: React.PointerEvent) => void;
  onTablePointerUp: (e: React.PointerEvent) => void;
  onTableClick: (table: FloorTable, e: React.MouseEvent) => void;
  onResizePointerDown: (table: FloorTable, e: React.PointerEvent) => void;
  onResizePointerMove: (e: React.PointerEvent) => void;
  onResizePointerUp: (e: React.PointerEvent) => void;
  reduceMotion: boolean;
}

function ZoneCanvas(props: ZoneCanvasProps) {
  const { zone, tables, editMode, selectedIds, boxPreview } = props;
  const Icon = zone.icon;
  const occupied = tables.filter((t) => t.state === "occupied").length;
  const totalSeats = tables.reduce((s, t) => s + t.seats, 0);

  return (
    <section
      className={cn(
        "rounded-xl border overflow-hidden flex flex-col",
        zoneBgClass(zone.color)
      )}
      aria-label={`Zona ${zone.name}`}
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/40 bg-background/30">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className={cn("h-4 w-4 shrink-0", zoneAccentClass(zone.color))} aria-hidden />
          <h3 className="text-sm font-medium truncate">{zone.name}</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono shrink-0">
          <span>{tables.length} mesas</span>
          <span aria-hidden>·</span>
          <span>{occupied} ocup.</span>
          <span aria-hidden>·</span>
          <span>{totalSeats} pers.</span>
        </div>
      </header>

      {/* Canvas */}
      <div
        data-zone-id={zone.id}
        data-zone-bg="true"
        className={cn(
          "relative rp-grid-bg min-h-[300px] flex-1",
          editMode ? "cursor-crosshair" : "cursor-default"
        )}
        style={{ touchAction: "none" }}
        onPointerDown={(e) => props.onZonePointerDown(zone.id, e)}
        onPointerMove={props.onZonePointerMove}
        onPointerUp={props.onZonePointerUp}
        onPointerCancel={props.onZonePointerUp}
      >
        {/* Empty state */}
        {tables.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
            <Icon className={cn("h-8 w-8 mb-2 opacity-30", zoneAccentClass(zone.color))} aria-hidden />
            <p className="text-sm text-muted-foreground">Sin mesas en esta zona</p>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
              Usa “Añadir mesa” o traspasa una mesa aquí
            </p>
          </div>
        )}

        {/* Tables */}
        {tables.map((t) => (
          <TableCard
            key={t.id}
            table={t}
            selected={selectedIds.has(t.id)}
            editMode={editMode}
            reduceMotion={props.reduceMotion}
            onPointerDown={(e) => props.onTablePointerDown(t, e)}
            onPointerMove={props.onTablePointerMove}
            onPointerUp={props.onTablePointerUp}
            onClick={(e) => props.onTableClick(t, e)}
            onResizePointerDown={(e) => props.onResizePointerDown(t, e)}
            onResizePointerMove={props.onResizePointerMove}
            onResizePointerUp={props.onResizePointerUp}
            zoneColor={zone.color}
          />
        ))}

        {/* Box-select preview */}
        {boxPreview && (
          <div
            className="absolute pointer-events-none border border-[var(--gold)] bg-[var(--gold)]/10 rounded"
            style={{
              left: Math.min(boxPreview.x1, boxPreview.x2),
              top: Math.min(boxPreview.y1, boxPreview.y2),
              width: Math.abs(boxPreview.x2 - boxPreview.x1),
              height: Math.abs(boxPreview.y2 - boxPreview.y1),
            }}
            aria-hidden
          />
        )}
      </div>
    </section>
  );
}

/* ============================================================
 * TableCard
 * ============================================================ */
interface TableCardProps {
  table: FloorTable;
  selected: boolean;
  editMode: boolean;
  reduceMotion: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  onResizePointerDown: (e: React.PointerEvent) => void;
  onResizePointerMove: (e: React.PointerEvent) => void;
  onResizePointerUp: (e: React.PointerEvent) => void;
  zoneColor: string;
}

function TableCard(props: TableCardProps) {
  const { table, selected, editMode, reduceMotion, zoneColor } = props;
  const meta = STATE_META[table.state];
  const StateIcon = meta.icon;
  const isRound = table.shape === "round" || table.shape === "oval";

  const ariaLabel = [
    `Mesa ${table.name}`,
    `${table.seats} comensales`,
    meta.label,
    table.customerName ? `cliente ${table.customerName}` : null,
    table.partySize ? `${table.partySize} personas` : null,
    table.reservationTime ? `reserva ${table.reservationTime}` : null,
    table.assignedTo ? `asignada a ${table.assignedTo}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <motion.button
      type="button"
      layout={!reduceMotion}
      initial={false}
      animate={
        reduceMotion
          ? {}
          : {
              scale: selected ? 1.04 : 1,
            }
      }
      transition={{ duration: 0.2, ease: "easeOut" }}
      whileHover={
        editMode && !reduceMotion ? { scale: selected ? 1.06 : 1.04 } : undefined
      }
      whileTap={!reduceMotion ? { scale: 0.96 } : undefined}
      onPointerDown={props.onPointerDown}
      onPointerMove={props.onTablePointerMove}
      onPointerUp={props.onTablePointerUp}
      onPointerCancel={props.onTablePointerUp}
      onClick={props.onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!editMode) props.onClick(e as unknown as React.MouseEvent);
        }
      }}
      tabIndex={0}
      aria-label={ariaLabel}
      aria-pressed={selected}
      data-state={table.state}
      className={cn(
        "absolute flex flex-col items-center justify-center text-center select-none",
        "border-2 backdrop-blur-sm transition-shadow",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        shapeClass(table.shape),
        meta.bg,
        meta.border,
        selected && "ring-2 ring-[var(--gold)] ring-offset-2 ring-offset-background z-10",
        editMode && "cursor-grab active:cursor-grabbing",
        !editMode && "cursor-pointer",
        table.mergedFrom && table.mergedFrom.length > 0 && "ring-1 ring-[var(--gold-soft)]/30"
      )}
      style={{
        left: table.x,
        top: table.y,
        width: table.w,
        height: table.h,
        transform: `rotate(${table.rotation}deg)`,
        touchAction: "none",
      }}
    >
      {/* Estado icon (top-left) */}
      <span
        className={cn(
          "absolute top-1 left-1 h-4 w-4 rounded-full flex items-center justify-center",
          meta.bg,
          meta.text
        )}
        aria-hidden
      >
        <StateIcon className="h-2.5 w-2.5" />
      </span>

      {/* VIP crown */}
      {table.state === "vip" && (
        <span
          className="absolute -top-2 left-1/2 -translate-x-1/2 text-[var(--gold)]"
          aria-hidden
        >
          <Crown className="h-3.5 w-3.5 fill-[var(--gold)]" />
        </span>
      )}

      {/* Nombre */}
      <span className="font-display text-sm font-semibold leading-tight text-foreground">
        {table.name}
      </span>

      {/* Comensales */}
      <span
        className={cn(
          "text-[10px] font-mono uppercase tracking-wider mt-0.5",
          meta.text
        )}
      >
        {table.seats}p
      </span>

      {/* Cliente (si ocupada/reservada) */}
      {table.customerName && table.shape !== "round" && (
        <span className="text-[9px] text-foreground/70 truncate max-w-full px-1 mt-0.5">
          {table.customerName}
        </span>
      )}

      {/* Tiempo ocupación */}
      {table.occupiedSince && table.state === "occupied" && (
        <span className="text-[9px] text-foreground/60 font-mono mt-0.5">
          {formatElapsed(table.occupiedSince)}
        </span>
      )}

      {/* Próxima reserva badge */}
      {table.nextReservation && (
        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[8px] font-mono px-1 py-0.5 rounded bg-amber-400/90 text-black whitespace-nowrap">
          {table.nextReservation.time}
        </span>
      )}

      {/* Cuenta solicitada badge */}
      {table.state === "bill_requested" && (
        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[8px] font-mono px-1 py-0.5 rounded bg-[var(--teal)] text-black whitespace-nowrap">
          €
        </span>
      )}

      {/* Resize handle (edit mode + selected) */}
      {editMode && selected && (
        <span
          role="separator"
          aria-label="Redimensionar mesa"
          onPointerDown={props.onResizePointerDown}
          onPointerMove={props.onResizePointerMove}
          onPointerUp={props.onResizePointerUp}
          onPointerCancel={props.onResizePointerUp}
          className={cn(
            "absolute -bottom-1 -right-1 h-3 w-3 bg-[var(--gold)] border border-background rounded-sm cursor-nwse-resize z-20",
            "hover:bg-[var(--gold-soft)]"
          )}
          style={{ touchAction: "none" }}
        />
      )}
    </motion.button>
  );
}

/* ============================================================
 * PropertiesPanel
 * ============================================================ */
interface PropertiesPanelProps {
  tables: FloorTable[];
  single: FloorTable | null;
  zones: Zone[];
  editMode: boolean;
  onUpdate: (id: string, patch: Partial<FloorTable>) => void;
  onCycleState: (id: string) => void;
  onClear: () => void;
  embedded?: boolean;
}

function PropertiesPanel(props: PropertiesPanelProps) {
  const { tables, single, zones, editMode, embedded } = props;

  if (tables.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-border/60 rp-glass p-4",
          !embedded && "sticky top-32"
        )}
      >
        <div className="flex flex-col items-center text-center py-8">
          <div className="h-12 w-12 rounded-full bg-foreground/5 flex items-center justify-center mb-3">
            <Hand className="h-5 w-5 text-muted-foreground" aria-hidden />
          </div>
          <p className="text-sm font-medium">Ninguna mesa seleccionada</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
            {editMode
              ? "Haz clic en una mesa para editarla. Shift+clic para multi-selección."
              : "Haz clic en una mesa para ver su información o cambiar su estado."}
          </p>
        </div>
      </div>
    );
  }

  if (tables.length > 1) {
    return (
      <div
        className={cn(
          "rounded-xl border border-border/60 rp-glass p-4",
          !embedded && "sticky top-32"
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium">{tables.length} mesas seleccionadas</p>
            <p className="text-[11px] text-muted-foreground">
              {tables.reduce((s, t) => s + t.seats, 0)} comensales en total
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={props.onClear} aria-label="Limpiar selección">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-1.5 max-h-64 overflow-y-auto rp-scroll-thin">
          {tables.map((t) => {
            const meta = STATE_META[t.state];
            const z = zones.find((x) => x.id === t.zoneId);
            return (
              <div
                key={t.id}
                className="flex items-center gap-2 rounded-md bg-foreground/[0.03] px-2 py-1.5"
              >
                <span className={cn("h-2 w-2 rounded-full", meta.dot)} aria-hidden />
                <span className="font-mono text-xs font-medium">{t.name}</span>
                <span className="text-[11px] text-muted-foreground">
                  {t.seats}p · {z?.name}
                </span>
                <span className={cn("ml-auto text-[10px]", meta.text)}>{meta.short}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-[11px] text-muted-foreground">
          Usa el toolbar para mover a zona, fusionar o rotar la selección.
        </div>
      </div>
    );
  }

  // single
  const t = single!;
  const meta = STATE_META[t.state];
  const z = zones.find((x) => x.id === t.zoneId);
  const StateIcon = meta.icon;

  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 rp-glass p-4 space-y-4",
        !embedded && "sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto rp-scroll-thin"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-semibold">{t.name}</span>
            <span
              className={cn(
                "text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded",
                meta.bg,
                meta.text
              )}
            >
              {meta.label}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {z?.name}
            <span aria-hidden>·</span>
            <Users className="h-3 w-3" />
            {t.seats} comensales
          </p>
        </div>
        <Button size="sm" variant="ghost" onClick={props.onClear} aria-label="Cerrar panel" className="shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Estado (clic para cambiar) */}
      <div>
        <Label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
          Estado
        </Label>
        <div className="grid grid-cols-4 gap-1.5">
          {STATE_ORDER.map((s) => {
            const m = STATE_META[s];
            const SIcon = m.icon;
            const active = t.state === s;
            return (
              <button
                key={s}
                onClick={() => props.onUpdate(t.id, { state: s })}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md border px-1 py-1.5 text-[9px] transition-colors min-h-[44px]",
                  active
                    ? cn(m.bg, m.border, m.text, "ring-1 ring-offset-1 ring-offset-background", m.ring ?? "")
                    : "border-border/60 hover:bg-foreground/5 text-muted-foreground"
                )}
                aria-pressed={active}
                aria-label={`Estado ${m.label}`}
              >
                <SIcon className="h-3.5 w-3.5" />
                <span className="truncate w-full text-center">{m.short}</span>
              </button>
            );
          })}
        </div>
        {!editMode && (
          <Button
            size="sm"
            variant="outline"
            className="w-full mt-2 h-9"
            onClick={() => props.onCycleState(t.id)}
          >
            <RotateCw className="h-3.5 w-3.5" />
            Ciclar estado
          </Button>
        )}
      </div>

      {/* Datos básicos */}
      <div className="space-y-2.5">
        <Field label="Nombre">
          <Input
            value={t.name}
            onChange={(e) => props.onUpdate(t.id, { name: e.target.value })}
            className="h-9"
            maxLength={12}
          />
        </Field>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Comensales">
            <Input
              type="number"
              min={1}
              max={20}
              value={t.seats}
              onChange={(e) =>
                props.onUpdate(t.id, { seats: clamp(parseInt(e.target.value || "1", 10), 1, 20) })
              }
              className="h-9"
            />
          </Field>
          <Field label="Zona">
            <Select
              value={t.zoneId}
              onValueChange={(v) => props.onUpdate(t.id, { zoneId: v })}
            >
              <SelectTrigger size="sm" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {zones.map((zz) => (
                  <SelectItem key={zz.id} value={zz.id}>
                    {zz.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Forma">
          <div className="grid grid-cols-4 gap-1.5">
            {SHAPE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = t.shape === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => props.onUpdate(t.id, { shape: opt.value })}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-md border px-1 py-1.5 text-[9px] transition-colors min-h-[44px]",
                    active
                      ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold-soft)]"
                      : "border-border/60 hover:bg-foreground/5 text-muted-foreground"
                  )}
                  aria-pressed={active}
                  aria-label={`Forma ${opt.label}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="truncate w-full text-center">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </Field>

        <Field label={`Rotación: ${t.rotation}°`}>
          <Slider
            min={0}
            max={359}
            step={15}
            value={[t.rotation]}
            onValueChange={(v) => props.onUpdate(t.id, { rotation: v[0] ?? 0 })}
            className="mt-2"
          />
        </Field>
      </div>

      {/* Datos operativos */}
      <div className="space-y-2.5 pt-2 border-t border-border/40">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Cliente">
            <Input
              value={t.customerName ?? ""}
              onChange={(e) =>
                props.onUpdate(t.id, {
                  customerName: e.target.value || undefined,
                })
              }
              placeholder="—"
              className="h-9"
            />
          </Field>
          <Field label="Tamaño grupo">
            <Input
              type="number"
              min={1}
              max={20}
              value={t.partySize ?? ""}
              onChange={(e) =>
                props.onUpdate(t.id, {
                  partySize: e.target.value ? parseInt(e.target.value, 10) : undefined,
                })
              }
              placeholder="—"
              className="h-9"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Hora reserva">
            <Input
              value={t.reservationTime ?? ""}
              onChange={(e) =>
                props.onUpdate(t.id, {
                  reservationTime: e.target.value || undefined,
                })
              }
              placeholder="13:30"
              className="h-9"
            />
          </Field>
          <Field label="Asignada a">
            <Input
              value={t.assignedTo ?? ""}
              onChange={(e) =>
                props.onUpdate(t.id, {
                  assignedTo: e.target.value || undefined,
                })
              }
              placeholder="—"
              className="h-9"
            />
          </Field>
        </div>

        {t.state === "vip" && (
          <Field label={`Nivel VIP: ${t.vipLevel ?? 1}`}>
            <Slider
              min={1}
              max={5}
              step={1}
              value={[t.vipLevel ?? 1]}
              onValueChange={(v) => props.onUpdate(t.id, { vipLevel: v[0] ?? 1 })}
              className="mt-2"
            />
          </Field>
        )}

        <Field label="Notas">
          <Textarea
            value={t.notes ?? ""}
            onChange={(e) => props.onUpdate(t.id, { notes: e.target.value || undefined })}
            placeholder="Alergias, preferencias, observaciones…"
            className="text-sm min-h-[60px] resize-y"
          />
        </Field>
      </div>

      {/* Próxima reserva */}
      {t.nextReservation && (
        <div className="rounded-md bg-amber-500/10 border border-amber-400/30 p-2.5 text-xs">
          <p className="font-medium text-amber-200 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            Próxima reserva · {t.nextReservation.time}
          </p>
          <p className="text-amber-200/80 mt-0.5">
            {t.nextReservation.name} · {t.nextReservation.party} pers.
          </p>
        </div>
      )}

      {/* Info operativa */}
      {t.occupiedSince && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-md bg-foreground/[0.03] p-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Ocupada desde
            </p>
            <p className="font-mono mt-0.5">{formatElapsed(t.occupiedSince)}</p>
          </div>
          {t.estimatedRemaining != null && (
            <div className="rounded-md bg-foreground/[0.03] p-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Tiempo restante
              </p>
              <p className="font-mono mt-0.5">~{t.estimatedRemaining} min</p>
            </div>
          )}
        </div>
      )}

      {/* Dimensiones / posición (solo edit mode) */}
      {editMode && (
        <div className="pt-2 border-t border-border/40">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
            Posición y tamaño
          </p>
          <div className="grid grid-cols-4 gap-1.5 text-[11px] font-mono">
            <KV label="X" value={Math.round(t.x)} />
            <KV label="Y" value={Math.round(t.y)} />
            <KV label="W" value={Math.round(t.w)} />
            <KV label="H" value={Math.round(t.h)} />
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 block">
        {label}
      </Label>
      {children}
    </div>
  );
}

function KV({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-foreground/[0.03] px-1.5 py-1 text-center">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="font-medium tabular-nums">{value}</div>
    </div>
  );
}

/* ============================================================
 * AddTableDialog
 * ============================================================ */
interface AddTableDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  zones: Zone[];
  defaultZoneId: string;
  suggestName: (zoneId: string) => string;
  onConfirm: (input: {
    name: string;
    seats: number;
    shape: TableShape;
    zoneId: string;
  }) => void;
}

function AddTableDialog(props: AddTableDialogProps) {
  const [name, setName] = React.useState("");
  const [seats, setSeats] = React.useState(4);
  const [shape, setShape] = React.useState<TableShape>("round");
  const [zoneId, setZoneId] = React.useState(props.defaultZoneId);

  // Reset + auto-suggest name on open / zone change
  React.useEffect(() => {
    if (props.open) {
      setZoneId(props.defaultZoneId);
      setName(props.suggestName(props.defaultZoneId));
      setSeats(4);
      setShape("round");
    }
  }, [props.open, props.defaultZoneId, props.suggestName]);

  React.useEffect(() => {
    if (props.open) setName(props.suggestName(zoneId));
  }, [zoneId, props.open, props.suggestName]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    props.onConfirm({
      name: name.trim(),
      seats: clamp(seats, 1, 20),
      shape,
      zoneId,
    });
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rp-scroll-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-[var(--gold)]" />
            Añadir mesa
          </DialogTitle>
          <DialogDescription>
            Crea una nueva mesa y colócala en una zona. Se añade al estado
            “Libre”.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={12}
                className="h-9 font-mono"
                required
              />
            </Field>
            <Field label="Comensales">
              <Input
                type="number"
                min={1}
                max={20}
                value={seats}
                onChange={(e) => setSeats(parseInt(e.target.value || "1", 10))}
                className="h-9"
                required
              />
            </Field>
          </div>

          <Field label="Zona">
            <Select value={zoneId} onValueChange={setZoneId}>
              <SelectTrigger size="sm" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {props.zones.map((z) => (
                  <SelectItem key={z.id} value={z.id}>
                    <span className="flex items-center gap-2">
                      <z.icon className={cn("h-3.5 w-3.5", zoneAccentClass(z.color))} />
                      {z.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Forma">
            <div className="grid grid-cols-4 gap-1.5">
              {SHAPE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = shape === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setShape(opt.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-md border px-1 py-2 text-[10px] transition-colors min-h-[48px]",
                      active
                        ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold-soft)]"
                        : "border-border/60 hover:bg-foreground/5 text-muted-foreground"
                    )}
                    aria-pressed={active}
                  >
                    <Icon className="h-4 w-4" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Preview */}
          <div className="rounded-md border border-border/60 bg-foreground/[0.03] p-3 flex items-center justify-center min-h-[88px]">
            <div
              className={cn(
                "border-2 border-[var(--gold)]/60 bg-[var(--gold)]/15 flex flex-col items-center justify-center text-center",
                shapeClass(shape)
              )}
              style={{
                width: shape === "rect" || shape === "oval" ? 110 : 70,
                height: 70,
              }}
            >
              <span className="font-display text-xs font-semibold">{name || "M?"}</span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--gold-soft)]">
                {seats}p
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => props.onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
            >
              <Plus className="h-4 w-4" />
              Añadir mesa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
