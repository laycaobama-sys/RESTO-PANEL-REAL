"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Plus, Search, Pencil, Users, Clock, Phone, MapPin, CheckCircle2,
  LogIn, XCircle, ChevronDown, Lock, Eraser, Hourglass, X, Armchair,
  Hand, CalendarPlus, StickyNote, CreditCard, Wallet, Globe, Star,
  MessageCircle, Instagram, Smartphone, UserRound, Filter, Calendar,
  CheckCheck, Armchair as ChairIcon, Sparkles, TrendingUp, UserX,
  Ban, CircleDot, Sliders, ArrowLeft, LayoutGrid,
  CalendarDays, BrainCircuit, BellRing,
} from "lucide-react";
import { FloorEditor } from "@/components/rp/reservas/floor-editor";
import { PredictionPanel } from "@/components/rp/reservas/prediction-panel";
import { YieldPanel } from "@/components/rp/reservas/yield-panel";
import { AlertsPanel } from "@/components/rp/reservas/alerts-panel";
import { WaitlistPanel } from "@/components/rp/reservas/waitlist-panel";

/* =========================================================
 * Types
 * =======================================================*/
export type TableStatus =
  | "free"
  | "reserved"
  | "occupied"
  | "cleaning"
  | "blocked";
export type Zone = "sala" | "terraza" | "barra" | "vip";
export type ReservationStatus =
  | "pendiente"
  | "confirmada"
  | "reconfirmada"
  | "sentada"
  | "espera"
  | "finalizada"
  | "cancelada"
  | "noshow";
export type Channel =
  | "web"
  | "google"
  | "whatsapp"
  | "instagram"
  | "telefono"
  | "walkin";
export type Guarantee = "tarjeta" | "prepago" | "ninguna";

export interface RpTable {
  id: string;
  name: string;
  seats: number;
  x: number;
  y: number;
  status: TableStatus;
  shape: "round" | "square" | "rect";
  w?: number;
  h?: number;
  zone: Zone;
  reservationId?: string;
}

export interface RpReservation {
  id: string;
  customerName: string;
  phone: string;
  partySize: number;
  time: string; // "HH:mm"
  durationMin: number;
  status: ReservationStatus;
  tableId?: string;
  notes?: string;
  zone: Zone;
  channel: Channel;
  guarantee: Guarantee;
  /** URL of customer photo. If absent, render initials avatar. */
  photo?: string;
  /** epoch ms — used to detect newly-added reservations for entry animation */
  createdAt: number;
}

interface NewReservationForm {
  customerName: string;
  phone: string;
  partySize: number;
  date: string;
  time: string;
  tableId?: string;
  zone: Zone;
  channel: Channel;
  guarantee: Guarantee;
  notes: string;
}

/* =========================================================
 * Constants & metadata
 * =======================================================*/
const STATUS_NEXT: Record<TableStatus, TableStatus> = {
  free: "reserved",
  reserved: "occupied",
  occupied: "cleaning",
  cleaning: "blocked",
  blocked: "free",
};

const STATUS_META: Record<
  TableStatus,
  { label: string; dot: string; border: string; bg: string; text: string; ring: string }
> = {
  free: {
    label: "Libre",
    dot: "bg-emerald-400",
    border: "border-emerald-400/55",
    bg: "bg-emerald-400/10",
    text: "text-emerald-300",
    ring: "ring-emerald-400/70",
  },
  reserved: {
    label: "Reservada",
    dot: "bg-[var(--gold)]",
    border: "border-[var(--gold)]/60",
    bg: "bg-[var(--gold)]/12",
    text: "text-[var(--gold-soft)]",
    ring: "ring-[var(--gold)]/80",
  },
  occupied: {
    label: "Ocupada",
    dot: "bg-[var(--teal)]",
    border: "border-[var(--teal)]/60",
    bg: "bg-[var(--teal)]/12",
    text: "text-[var(--teal)]",
    ring: "ring-[var(--teal)]/80",
  },
  cleaning: {
    label: "Limpieza",
    dot: "bg-amber-400",
    border: "border-amber-400/55",
    bg: "bg-amber-400/10",
    text: "text-amber-300",
    ring: "ring-amber-400/70",
  },
  blocked: {
    label: "Bloqueada",
    dot: "bg-zinc-500",
    border: "border-zinc-500/55",
    bg: "bg-zinc-500/10",
    text: "text-zinc-400",
    ring: "ring-zinc-500/70",
  },
};

const ZONES: { id: Zone; label: string; hint: string }[] = [
  { id: "sala", label: "Sala", hint: "Interior" },
  { id: "terraza", label: "Terraza", hint: "Exterior" },
  { id: "vip", label: "VIP", hint: "Reservado" },
  { id: "barra", label: "Barra", hint: "Mostrador" },
];

const ZONE_PILL: Record<Zone, string> = {
  sala: "border-border/60 bg-foreground/[0.04] text-muted-foreground",
  terraza: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
  vip: "border-[var(--gold)]/50 bg-[var(--gold)]/15 text-[var(--gold-soft)]",
  barra: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-300",
};

const RES_STATUS_META: Record<
  ReservationStatus,
  { label: string; cls: string; dot: string }
> = {
  pendiente: {
    label: "Pendiente",
    cls: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
  },
  confirmada: {
    label: "Confirmada",
    cls: "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
    dot: "bg-[var(--gold)]",
  },
  reconfirmada: {
    label: "Reconfirmada",
    cls: "border-[var(--gold)]/60 bg-[var(--gold)]/15 text-[var(--gold-soft)]",
    dot: "bg-[var(--gold-soft)]",
  },
  sentada: {
    label: "Sentada",
    cls: "border-[var(--teal)]/50 bg-[var(--teal)]/15 text-[var(--teal)]",
    dot: "bg-[var(--teal)]",
  },
  espera: {
    label: "En espera",
    cls: "border-orange-400/40 bg-orange-400/10 text-orange-300",
    dot: "bg-orange-400",
  },
  finalizada: {
    label: "Finalizada",
    cls: "border-zinc-500/40 bg-zinc-500/10 text-zinc-400",
    dot: "bg-zinc-500",
  },
  cancelada: {
    label: "Cancelada",
    cls: "border-destructive/40 bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
  noshow: {
    label: "No-show",
    cls: "border-rose-500/40 bg-rose-500/10 text-rose-300",
    dot: "bg-rose-500",
  },
};

const CHANNEL_META: Record<
  Channel,
  { label: string; icon: React.ElementType; cls: string }
> = {
  web: { label: "Web", icon: Globe, cls: "text-sky-300" },
  google: { label: "Google", icon: Star, cls: "text-amber-300" },
  whatsapp: { label: "WhatsApp", icon: MessageCircle, cls: "text-emerald-300" },
  instagram: { label: "Instagram", icon: Instagram, cls: "text-fuchsia-300" },
  telefono: { label: "Teléfono", icon: Smartphone, cls: "text-[var(--teal)]" },
  walkin: { label: "Walk-in", icon: UserRound, cls: "text-muted-foreground" },
};

const GUARANTEE_META: Record<
  Guarantee,
  { label: string; icon: React.ElementType; cls: string }
> = {
  tarjeta: { label: "Tarjeta", icon: CreditCard, cls: "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]" },
  prepago: { label: "Prepago", icon: Wallet, cls: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]" },
  ninguna: { label: "—", icon: CircleDot, cls: "border-border/40 bg-foreground/[0.04] text-muted-foreground" },
};

const STATUS_FILTERS: { id: "todas" | ReservationStatus; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "pendiente", label: "Pendiente" },
  { id: "confirmada", label: "Confirmada" },
  { id: "sentada", label: "Sentada" },
  { id: "noshow", label: "No-show" },
];

const ZONE_FILTERS: { id: "todas" | Zone; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "sala", label: "Sala" },
  { id: "terraza", label: "Terraza" },
  { id: "vip", label: "VIP" },
  { id: "barra", label: "Barra" },
];

const CHANNEL_FILTERS: { id: "todos" | Channel; label: string }[] = [
  { id: "todos", label: "Todos los canales" },
  { id: "web", label: "Web" },
  { id: "google", label: "Google" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "instagram", label: "Instagram" },
  { id: "telefono", label: "Teléfono" },
  { id: "walkin", label: "Walk-in" },
];

/* =========================================================
 * Demo data
 * =======================================================*/
const INITIAL_TABLES: RpTable[] = [
  // Sala principal
  { id: "M1", name: "M1", seats: 4, x: 60, y: 60, status: "reserved", shape: "round", zone: "sala", reservationId: "r1" },
  { id: "M2", name: "M2", seats: 4, x: 220, y: 60, status: "occupied", shape: "round", zone: "sala", reservationId: "r2" },
  { id: "M3", name: "M3", seats: 6, x: 380, y: 60, status: "free", shape: "rect", w: 150, h: 90, zone: "sala" },
  { id: "M4", name: "M4", seats: 2, x: 60, y: 240, status: "free", shape: "square", zone: "sala" },
  { id: "M5", name: "M5", seats: 4, x: 220, y: 240, status: "cleaning", shape: "round", zone: "sala" },
  { id: "M6", name: "M6", seats: 4, x: 380, y: 240, status: "blocked", shape: "square", zone: "sala" },
  // Terraza
  { id: "T1", name: "T1", seats: 4, x: 60, y: 60, status: "reserved", shape: "round", zone: "terraza", reservationId: "r3" },
  { id: "T2", name: "T2", seats: 2, x: 220, y: 70, status: "free", shape: "square", zone: "terraza" },
  { id: "T3", name: "T3", seats: 6, x: 60, y: 220, status: "occupied", shape: "rect", w: 150, h: 90, zone: "terraza", reservationId: "r4" },
  { id: "T4", name: "T4", seats: 4, x: 260, y: 230, status: "free", shape: "round", zone: "terraza" },
  // VIP
  { id: "V1", name: "V1", seats: 8, x: 80, y: 80, status: "reserved", shape: "round", zone: "vip", reservationId: "r6" },
  { id: "V2", name: "V2", seats: 6, x: 260, y: 100, status: "free", shape: "rect", w: 140, h: 90, zone: "vip" },
  // Barra
  { id: "B1", name: "B1", seats: 2, x: 50, y: 120, status: "occupied", shape: "square", zone: "barra", reservationId: "r7" },
  { id: "B2", name: "B2", seats: 2, x: 160, y: 120, status: "occupied", shape: "square", zone: "barra" },
  { id: "B3", name: "B3", seats: 2, x: 270, y: 120, status: "free", shape: "square", zone: "barra" },
];

const NOW = Date.now();
const INITIAL_RESERVATIONS: RpReservation[] = [
  { id: "r1", customerName: "Elena Vidal", phone: "+34 612 334 211", partySize: 4, time: "13:30", durationMin: 120, status: "confirmada", tableId: "M1", zone: "sala", channel: "web", guarantee: "tarjeta", notes: "Aniversario · mesa ventana", createdAt: NOW - 60000 },
  { id: "r2", customerName: "Marc Puig", phone: "+34 670 891 220", partySize: 4, time: "14:00", durationMin: 120, status: "sentada", tableId: "M2", zone: "sala", channel: "telefono", guarantee: "ninguna", notes: "", createdAt: NOW - 120000 },
  { id: "r3", customerName: "Sofía Ruiz", phone: "+34 655 220 119", partySize: 4, time: "14:30", durationMin: 90, status: "reconfirmada", tableId: "T1", zone: "terraza", channel: "google", guarantee: "tarjeta", notes: "Cliente VIP · alérgica al gluten", createdAt: NOW - 90000 },
  { id: "r4", customerName: "Jordi Soler", phone: "+34 622 119 887", partySize: 6, time: "13:45", durationMin: 150, status: "sentada", tableId: "T3", zone: "terraza", channel: "whatsapp", guarantee: "prepago", notes: "Cumpleaños, traen tarta", createdAt: NOW - 150000 },
  { id: "r5", customerName: "Núria Camps", phone: "+34 690 113 445", partySize: 2, time: "15:00", durationMin: 60, status: "espera", zone: "sala", channel: "walkin", guarantee: "ninguna", notes: "Sin asignar", createdAt: NOW - 30000 },
  { id: "r6", customerName: "Pau Riera", phone: "+34 644 332 100", partySize: 8, time: "20:30", durationMin: 180, status: "confirmada", tableId: "V1", zone: "vip", channel: "telefono", guarantee: "prepago", notes: "Cena de empresa · menú degustación", createdAt: NOW - 200000 },
  { id: "r7", customerName: "Laia Font", phone: "+34 633 445 998", partySize: 2, time: "21:00", durationMin: 90, status: "sentada", tableId: "B1", zone: "barra", channel: "instagram", guarantee: "ninguna", notes: "Cena rápida en barra", createdAt: NOW - 100000 },
  { id: "r8", customerName: "Arnau Bosch", phone: "+34 611 220 333", partySize: 5, time: "21:30", durationMin: 150, status: "pendiente", zone: "terraza", channel: "web", guarantee: "tarjeta", notes: "Prefiere terraza · 2 niños", createdAt: NOW - 45000 },
  { id: "r9", customerName: "Carla Vives", phone: "+34 699 001 223", partySize: 2, time: "13:00", durationMin: 60, status: "noshow", zone: "sala", channel: "web", guarantee: "tarjeta", notes: "No avisó · cargo aplicado", createdAt: NOW - 300000 },
  { id: "r10", customerName: "Bruno Serra", phone: "+34 688 220 110", partySize: 4, time: "22:00", durationMin: 120, status: "confirmada", zone: "sala", channel: "google", guarantee: "tarjeta", notes: "Cena tarde · ventana", createdAt: NOW - 80000 },
];

/* =========================================================
 * Helpers
 * =======================================================*/
function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function tableW(t: RpTable): number {
  if (t.shape === "round") return 92;
  if (t.shape === "square") return 80;
  return t.w ?? 150;
}
function tableH(t: RpTable): number {
  if (t.shape === "round") return 92;
  if (t.shape === "square") return 80;
  return t.h ?? 96;
}

function shapeLabel(s: RpTable["shape"]): string {
  if (s === "rect") return "rectangular";
  if (s === "round") return "redonda";
  return "cuadrada";
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-amber-400/40 bg-amber-400/10 text-amber-300 font-mono uppercase tracking-wider text-[10px]",
        className
      )}
    >
      demo
    </Badge>
  );
}

/** Animated number counter — uses requestAnimationFrame, transform/opacity only. */
function useAnimatedNumber(value: number, duration = 350) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = React.useState(value);
  const fromRef = React.useRef(value);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      fromRef.current = value;
    };
  }, [value, duration, reduce]);

  return display;
}

/* =========================================================
 * Main view
 * =======================================================*/
export function ReservasView() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [advancedEditor, setAdvancedEditor] = React.useState(false);
  const [resTab, setResTab] = React.useState<"reservas" | "prediccion" | "yield" | "alertas" | "waitlist">("reservas");
  const [tables, setTables] = React.useState<RpTable[]>(INITIAL_TABLES);
  const [reservations, setReservations] =
    React.useState<RpReservation[]>(INITIAL_RESERVATIONS);
  const [zone, setZone] = React.useState<Zone>("sala");
  const [editMode, setEditMode] = React.useState(false);
  const [selectedTableId, setSelectedTableId] = React.useState<string | null>(null);
  const [selectedReservationId, setSelectedReservationId] = React.useState<string | null>(null);
  const [assigningReservationId, setAssigningReservationId] = React.useState<string | null>(null);
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [newDialogOpen, setNewDialogOpen] = React.useState(false);
  const [timelineOpen, setTimelineOpen] = React.useState(true);

  // Quick filters
  const [datePreset, setDatePreset] = React.useState<"hoy" | "manana" | "fecha">("hoy");
  const [zoneFilter, setZoneFilter] = React.useState<"todas" | Zone>("todas");
  const [statusFilter, setStatusFilter] = React.useState<"todas" | ReservationStatus>("todas");
  const [channelFilter, setChannelFilter] = React.useState<"todos" | Channel>("todos");
  const [search, setSearch] = React.useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  const [confirmState, setConfirmState] = React.useState<
    null | { kind: "block-table" | "cancel-res" | "free-table"; id: string }
  >(null);
  const canvasRef = React.useRef<HTMLDivElement>(null);

  /* ----- derived ----- */
  const visibleTables = tables.filter((t) => t.zone === zone);
  const selectedTable = tables.find((t) => t.id === selectedTableId) ?? null;
  const selectedReservation =
    reservations.find((r) => r.id === selectedReservationId) ?? null;
  const assigningReservation =
    reservations.find((r) => r.id === assigningReservationId) ?? null;

  const filteredReservations = React.useMemo(() => {
    return reservations.filter((r) => {
      if (statusFilter !== "todas" && r.status !== statusFilter) return false;
      if (zoneFilter !== "todas" && r.zone !== zoneFilter) return false;
      if (channelFilter !== "todos" && r.channel !== channelFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (
          !r.customerName.toLowerCase().includes(q) &&
          !r.phone.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [reservations, statusFilter, zoneFilter, channelFilter, search]);

  const unassignedReservations = reservations.filter(
    (r) => !r.tableId && r.status !== "cancelada" && r.status !== "finalizada"
  );

  // KPIs for occupancy strip
  const totalTables = tables.length;
  const occupiedTables = tables.filter(
    (t) => t.status === "occupied" || t.status === "reserved"
  ).length;
  const occupancyPct = totalTables === 0 ? 0 : Math.round((occupiedTables / totalTables) * 100);
  const totalPax = reservations
    .filter((r) => r.status !== "cancelada" && r.status !== "noshow")
    .reduce((sum, r) => sum + r.partySize, 0);
  const noShowCount = reservations.filter((r) => r.status === "noshow").length;
  const confirmedToday = reservations.filter(
    (r) => r.status === "confirmada" || r.status === "reconfirmada" || r.status === "sentada"
  ).length;

  // Animated counters
  const animOccupancy = useAnimatedNumber(occupancyPct);
  const animPax = useAnimatedNumber(totalPax);
  const animConfirmed = useAnimatedNumber(confirmedToday);
  const animNoShow = useAnimatedNumber(noShowCount);

  // Active filter count for mobile badge
  const activeFilterCount =
    (statusFilter !== "todas" ? 1 : 0) +
    (zoneFilter !== "todas" ? 1 : 0) +
    (channelFilter !== "todos" ? 1 : 0) +
    (search.trim() ? 1 : 0);

  /* ----- table handlers ----- */
  function cycleTableStatus(t: RpTable) {
    const next = STATUS_NEXT[t.status];
    setTables((ts) =>
      ts.map((x) => (x.id === t.id ? { ...x, status: next } : x))
    );
    toast({
      title: `Mesa ${t.name}`,
      description: `${STATUS_META[t.status].label} → ${STATUS_META[next].label}`,
    });
  }

  function onTableClick(t: RpTable) {
    setSelectedTableId(t.id);
    setSelectedReservationId(null);
    if (assigningReservationId) {
      if (t.status === "free") {
        assignTableToReservation(t.id, assigningReservationId);
        setAssigningReservationId(null);
      } else {
        toast({
          title: "Mesa no disponible",
          description: "Elige una mesa libre (verde).",
          variant: "destructive",
        });
      }
      return;
    }
    if (editMode) return; // no cycling in edit mode
    cycleTableStatus(t);
  }

  function assignTableToReservation(tableId: string, reservationId: string) {
    const t = tables.find((x) => x.id === tableId);
    const r = reservations.find((x) => x.id === reservationId);
    if (!t || !r) return;
    setTables((ts) =>
      ts.map((x) =>
        x.id === tableId
          ? { ...x, status: "reserved", reservationId }
          : x
      )
    );
    setReservations((rs) =>
      rs.map((x) =>
        x.id === reservationId
          ? {
              ...x,
              tableId,
              status: x.status === "espera" || x.status === "pendiente" ? "confirmada" : x.status,
            }
          : x
      )
    );
    toast({
      title: "Mesa asignada",
      description: `${r.customerName} → ${t.name}`,
    });
  }

  function freeTable(tableId: string) {
    const t = tables.find((x) => x.id === tableId);
    if (!t) return;
    const prevResId = t.reservationId;
    setTables((ts) =>
      ts.map((x) =>
        x.id === tableId
          ? { ...x, status: "free", reservationId: undefined }
          : x
      )
    );
    if (prevResId) {
      setReservations((rs) =>
        rs.map((r) =>
          r.id === prevResId ? { ...r, tableId: undefined } : r
        )
      );
    }
    toast({ title: `Mesa ${t.name} liberada` });
  }

  function blockTable(tableId: string) {
    const t = tables.find((x) => x.id === tableId);
    if (!t) return;
    setTables((ts) =>
      ts.map((x) => (x.id === tableId ? { ...x, status: "blocked" } : x))
    );
    toast({ title: `Mesa ${t.name} bloqueada` });
  }

  /* ----- reservation handlers ----- */
  function setReservationStatus(resId: string, status: ReservationStatus) {
    setReservations((rs) =>
      rs.map((x) => (x.id === resId ? { ...x, status } : x))
    );
  }

  function confirmReservation(resId: string) {
    const r = reservations.find((x) => x.id === resId);
    if (!r) return;
    setReservationStatus(resId, "confirmada");
    toast({ title: "Reserva confirmada", description: r.customerName });
  }

  function reconfirmReservation(resId: string) {
    const r = reservations.find((x) => x.id === resId);
    if (!r) return;
    setReservationStatus(resId, "reconfirmada");
    toast({ title: "Reserva reconfirmada", description: r.customerName });
  }

  function seatReservation(resId: string) {
    const r = reservations.find((x) => x.id === resId);
    if (!r) return;
    setReservationStatus(resId, "sentada");
    if (r.tableId) {
      setTables((ts) =>
        ts.map((t) =>
          t.id === r.tableId
            ? { ...t, status: "occupied", reservationId: resId }
            : t
        )
      );
    }
    toast({
      title: "Cliente sentado",
      description: `${r.customerName} · ${r.partySize} comensales`,
    });
  }

  function finishReservation(resId: string) {
    const r = reservations.find((x) => x.id === resId);
    if (!r) return;
    setReservationStatus(resId, "finalizada");
    if (r.tableId) {
      setTables((ts) =>
        ts.map((t) =>
          t.id === r.tableId
            ? { ...t, status: "cleaning" }
            : t
        )
      );
    }
    toast({ title: "Servicio finalizado", description: r.customerName });
  }

  function noshowReservation(resId: string) {
    const r = reservations.find((x) => x.id === resId);
    if (!r) return;
    setReservationStatus(resId, "noshow");
    if (r.tableId) {
      setTables((ts) =>
        ts.map((t) =>
          t.id === r.tableId
            ? { ...t, status: "free", reservationId: undefined }
            : t
        )
      );
    }
    toast({
      title: "Marcar como No-show",
      description: r.customerName,
      variant: "destructive",
    });
  }

  function cancelReservation(resId: string) {
    const r = reservations.find((x) => x.id === resId);
    if (!r) return;
    setReservationStatus(resId, "cancelada");
    if (r.tableId) {
      setTables((ts) =>
        ts.map((t) =>
          t.id === r.tableId
            ? { ...t, status: "free", reservationId: undefined }
            : t
        )
      );
    }
    toast({
      title: "Reserva cancelada",
      description: r.customerName,
      variant: "destructive",
    });
  }

  function startAssign(resId: string) {
    const r = reservations.find((x) => x.id === resId);
    if (r) setZone(r.zone);
    setAssigningReservationId(resId);
  }

  /* ----- drag & drop (mouse) ----- */
  function onDragStart(e: React.DragEvent, t: RpTable) {
    if (!editMode) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", t.id);
    e.dataTransfer.effectAllowed = "move";
    setDraggedId(t.id);
  }

  function onDragEnd() {
    setDraggedId(null);
    setDragOver(false);
  }

  function onCanvasDragOver(e: React.DragEvent) {
    if (!editMode || !draggedId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!dragOver) setDragOver(true);
  }

  function onCanvasDragLeave(e: React.DragEvent) {
    if (e.currentTarget === e.target) setDragOver(false);
  }

  function onCanvasDrop(e: React.DragEvent) {
    if (!editMode || !draggedId) return;
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const t = tables.find((x) => x.id === draggedId);
    if (!t) return;
    const w = tableW(t);
    const h = tableH(t);
    const x = Math.max(
      4,
      Math.min(e.clientX - rect.left - w / 2, rect.width - w - 4)
    );
    const y = Math.max(
      4,
      Math.min(e.clientY - rect.top - h / 2, rect.height - h - 4)
    );
    const nx = Math.round(x);
    const ny = Math.round(y);
    setTables((ts) =>
      ts.map((x2) => (x2.id === draggedId ? { ...x2, x: nx, y: ny } : x2))
    );
    setDragOver(false);
    setDraggedId(null);
    toast({
      title: `${t.name} reposicionada`,
      description: `x ${nx} · y ${ny}`,
    });
  }

  /* ----- drag & drop (touch) ----- */
  const touchDragRef = React.useRef<
    | { id: string; offsetX: number; offsetY: number }
    | null
  >(null);

  function onTableTouchStart(e: React.TouchEvent, t: RpTable) {
    if (!editMode) return;
    if (e.touches.length !== 1) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches[0];
    touchDragRef.current = {
      id: t.id,
      offsetX: touch.clientX - rect.left - t.x,
      offsetY: touch.clientY - rect.top - t.y,
    };
    setDraggedId(t.id);
    setDragOver(true);
  }

  function onCanvasTouchMove(e: React.TouchEvent) {
    if (!editMode || !touchDragRef.current) return;
    if (e.touches.length !== 1) return;
    e.preventDefault(); // stop page scroll while dragging
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches[0];
    const drag = touchDragRef.current;
    const t = tables.find((x) => x.id === drag.id);
    if (!t) return;
    const w = tableW(t);
    const h = tableH(t);
    const x = Math.max(
      4,
      Math.min(touch.clientX - rect.left - drag.offsetX, rect.width - w - 4)
    );
    const y = Math.max(
      4,
      Math.min(touch.clientY - rect.top - drag.offsetY, rect.height - h - 4)
    );
    setTables((ts) =>
      ts.map((x2) => (x2.id === drag.id ? { ...x2, x: Math.round(x), y: Math.round(y) } : x2))
    );
  }

  function onCanvasTouchEnd() {
    if (!touchDragRef.current) return;
    const t = tables.find((x) => x.id === touchDragRef.current!.id);
    touchDragRef.current = null;
    setDraggedId(null);
    setDragOver(false);
    if (t) {
      toast({
        title: `${t.name} reposicionada`,
        description: `x ${t.x} · y ${t.y}`,
      });
    }
  }

  /* ----- new reservation ----- */
  function submitNewReservation(form: NewReservationForm) {
    const id = `r${reservations.length + 1}_${Date.now().toString(36).slice(-4)}`;
    const newRes: RpReservation = {
      id,
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      partySize: form.partySize,
      time: form.time,
      durationMin: 90,
      status: "pendiente",
      tableId: form.tableId,
      zone: form.zone,
      channel: form.channel,
      guarantee: form.guarantee,
      notes: form.notes.trim() || undefined,
      createdAt: Date.now(),
    };
    setReservations((rs) => [newRes, ...rs]);
    if (form.tableId) {
      setTables((ts) =>
        ts.map((t) =>
          t.id === form.tableId
            ? { ...t, status: "reserved", reservationId: id }
            : t
        )
      );
    }
    setNewDialogOpen(false);
    toast({
      title: "Reserva creada",
      description: `${newRes.customerName} · ${newRes.time} · ${newRes.partySize} pax`,
    });
  }

  function handleConfirm() {
    if (!confirmState) return;
    const { kind, id } = confirmState;
    if (kind === "block-table") blockTable(id);
    else if (kind === "cancel-res") cancelReservation(id);
    else if (kind === "free-table") freeTable(id);
    setConfirmState(null);
  }

  function clearFilters() {
    setStatusFilter("todas");
    setZoneFilter("todas");
    setChannelFilter("todos");
    setSearch("");
  }

  /* ----- render ----- */
  // Shared transition defaults that respect prefers-reduced-motion
  const t = reduce
    ? { duration: 0 }
    : { duration: 0.2, ease: "easeOut" as const };

  /* ----- Editor avanzado (FloorEditor) ----- */
  if (advancedEditor) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAdvancedEditor(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Reservas
          </Button>
          <Badge
            variant="outline"
            className="border-[var(--gold)]/40 text-[var(--gold-soft)] bg-[var(--gold)]/10 text-[10px] uppercase tracking-[0.15em]"
          >
            Editor avanzado
          </Badge>
        </div>
        <FloorEditor />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
              Reservas
            </h1>
            <DemoBadge />
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Plano de mesas interactivo, lista de reservas y línea de tiempo del
            servicio. Datos demo · navegable.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            onClick={() => setAdvancedEditor(true)}
            variant="outline"
            className="border-[var(--gold)]/40 text-[var(--gold-soft)] hover:bg-[var(--gold)]/10 min-h-11"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Editor avanzado</span>
            <span className="sm:hidden">Editor</span>
          </Button>
          <Button
            onClick={() => setNewDialogOpen(true)}
            className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] shrink-0 min-h-11"
          >
            <Plus className="h-4 w-4" /> Nueva reserva
          </Button>
        </div>
      </header>

      {/* Tab bar — switch between reservations, prediction, yield, alerts, waitlist */}
      <div className="flex items-center gap-1 overflow-x-auto rp-scroll-thin pb-1 -mb-2" role="tablist" aria-label="Vistas de reservas">
        {([
          { id: "reservas", label: "Reservas", icon: CalendarDays },
          { id: "prediccion", label: "Predicción IA", icon: BrainCircuit },
          { id: "yield", label: "Yield", icon: TrendingUp },
          { id: "alertas", label: "Alertas", icon: BellRing },
          { id: "waitlist", label: "Lista de espera", icon: Users },
        ] as const).map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={resTab === t.id}
            onClick={() => setResTab(t.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors min-h-[40px] ${
              resTab === t.id
                ? "bg-[var(--gold)]/10 text-[var(--gold-soft)] border border-[var(--gold)]/30"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/5 border border-transparent"
            }`}
          >
            <t.icon className="h-4 w-4" aria-hidden />
            {t.label}
          </button>
        ))}
      </div>

      {/* Conditional panel rendering */}
      {resTab === "prediccion" && <PredictionPanel />}
      {resTab === "yield" && <YieldPanel />}
      {resTab === "alertas" && <AlertsPanel />}
      {resTab === "waitlist" && <WaitlistPanel />}

      {resTab === "reservas" && (
        <>
      {/* KPI strip — occupancy counters animate on change */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          icon={Armchair}
          label="Ocupación"
          value={`${animOccupancy}%`}
          caption={`${occupiedTables}/${totalTables} mesas`}
          tone="gold"
        />
        <KpiCard
          icon={CalendarPlus}
          label="Confirmadas"
          value={String(animConfirmed)}
          caption="hoy + próximamente"
          tone="teal"
        />
        <KpiCard
          icon={Users}
          label="Comensales"
          value={String(animPax)}
          caption="pax totales"
          tone="gold"
        />
        <KpiCard
          icon={UserX}
          label="No-shows"
          value={String(animNoShow)}
          caption="últimos 7d"
          tone="muted"
        />
      </div>

      {/* Quick filters bar — desktop inline, mobile via Sheet */}
      <QuickFiltersBar
        datePreset={datePreset}
        onDatePreset={setDatePreset}
        zoneFilter={zoneFilter}
        onZoneFilter={setZoneFilter}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        channelFilter={channelFilter}
        onChannelFilter={setChannelFilter}
        search={search}
        onSearch={setSearch}
        onClear={clearFilters}
        activeCount={activeFilterCount}
        onOpenMobile={() => setMobileFiltersOpen(true)}
      />

      {/* Main grid: list first on mobile, floor plan + list side-by-side on lg+ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
        {/* LEFT (desktop) / BOTTOM (mobile): Floor plan (60%) */}
        <section
          className="space-y-4 order-2 lg:order-1"
          aria-label="Plano de mesas"
        >
          {/* Zone selector + edit toggle */}
          <div className="rp-glass rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
            <div
              className="flex flex-wrap items-center gap-1.5"
              role="tablist"
              aria-label="Zona del plano"
            >
              {ZONES.map((z) => (
                <button
                  key={z.id}
                  role="tab"
                  aria-selected={zone === z.id}
                  aria-controls="floor-plan-canvas"
                  onClick={() => setZone(z.id)}
                  className={cn(
                    "rounded-md px-3 py-2 min-h-11 text-sm font-medium border transition-colors",
                    zone === z.id
                      ? "border-[var(--gold)]/50 bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                      : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  )}
                >
                  <MapPin className="h-3.5 w-3.5 inline-block mr-1.5 -mt-0.5" />
                  {z.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
              <Switch
                checked={editMode}
                onCheckedChange={setEditMode}
                aria-label="Modo editar plano"
              />
              <span
                className={cn(
                  "flex items-center gap-1.5",
                  editMode ? "text-[var(--gold-soft)]" : "text-muted-foreground"
                )}
              >
                <Pencil className="h-3.5 w-3.5" />
                Modo editar plano
              </span>
            </label>
          </div>

          {/* Canvas card */}
          <div className="rp-glass rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Armchair className="h-4 w-4 text-[var(--gold)]" />
                <span className="text-sm font-medium">
                  {ZONES.find((z) => z.id === zone)?.label}
                </span>
                <DemoBadge />
              </div>
              <div className="text-[11px] font-mono text-muted-foreground tabular-nums">
                {visibleTables.length} mesas ·{" "}
                <span className="text-emerald-300">
                  {visibleTables.filter((t) => t.status === "free").length}{" "}
                  libres
                </span>
              </div>
            </div>

            {/* Assignment mode banner */}
            {assigningReservation && (
              <div className="px-4 py-2 bg-[var(--gold)]/10 border-b border-[var(--gold)]/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-[var(--gold-soft)] min-w-0">
                  <Hand className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    Modo asignación: haz clic en una mesa libre (verde) para{" "}
                    <strong className="font-medium">
                      {assigningReservation.customerName}
                    </strong>
                    .
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="shrink-0 h-8"
                  onClick={() => setAssigningReservationId(null)}
                >
                  <X className="h-3.5 w-3.5" /> Cancelar
                </Button>
              </div>
            )}

            {/* Edit mode banner */}
            {editMode && (
              <div className="px-4 py-2 bg-[var(--teal)]/10 border-b border-[var(--teal)]/30 flex items-center gap-2 text-sm text-[var(--teal)]">
                <Pencil className="h-4 w-4" />
                <span>
                  Arrastra las mesas para reposicionarlas. Los clics no cambian
                  el estado.
                </span>
              </div>
            )}

            <div className="overflow-x-auto rp-scroll-thin">
              <div
                ref={canvasRef}
                id="floor-plan-canvas"
                role="tabpanel"
                aria-label={`Plano de la zona ${
                  ZONES.find((z) => z.id === zone)?.label
                }`}
                onDragOver={onCanvasDragOver}
                onDragLeave={onCanvasDragLeave}
                onDrop={onCanvasDrop}
                onTouchMove={onCanvasTouchMove}
                onTouchEnd={onCanvasTouchEnd}
                onTouchCancel={onCanvasTouchEnd}
                className={cn(
                  "relative rp-grid-bg touch-pan-y",
                  dragOver && "ring-2 ring-inset ring-[var(--gold)]/60"
                )}
                style={{ minWidth: 680, height: 460 }}
              >
                <ZoneDecor zone={zone} />

                {/* Tables — motion.div for assignment pulse */}
                {visibleTables.map((tbl) => {
                  const meta = STATUS_META[tbl.status];
                  const w = tableW(tbl);
                  const h = tableH(tbl);
                  const isDragging = draggedId === tbl.id;
                  const isSelected = selectedTableId === tbl.id;
                  const isAssignTarget =
                    !!assigningReservationId && tbl.status === "free";
                  const linkedRes = tbl.reservationId
                    ? reservations.find((r) => r.id === tbl.reservationId)
                    : null;
                  return (
                    <motion.button
                      key={tbl.id}
                      type="button"
                      // animate pulse when freshly assigned (reservationId changes)
                      animate={
                        reduce
                          ? undefined
                          : isAssignTarget
                            ? { scale: [1, 1.06, 1] }
                            : { scale: 1 }
                      }
                      transition={
                        reduce
                          ? { duration: 0 }
                          : isAssignTarget
                            ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
                            : { duration: 0.18 }
                      }
                      draggable={editMode}
                      onDragStart={(e) => onDragStart(e, tbl)}
                      onDragEnd={onDragEnd}
                      onTouchStart={(e) => onTableTouchStart(e, tbl)}
                      onClick={() => onTableClick(tbl)}
                      aria-label={`Mesa ${tbl.name}, ${tbl.seats} comensales, estado ${meta.label}${
                        tbl.reservationId ? `, reserva ${tbl.reservationId}` : ""
                      }`}
                      aria-pressed={isSelected}
                      className={cn(
                        "absolute flex flex-col items-center justify-center gap-0.5 border-2 transition-[transform,color,background-color,border-color] select-none px-1.5",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-[var(--gold)]",
                        meta.border,
                        meta.bg,
                        meta.text,
                        tbl.shape === "round" ? "rounded-full" : "rounded-xl",
                        isSelected &&
                          "z-20 ring-2 ring-offset-2 ring-offset-background ring-[var(--gold)]",
                        !editMode &&
                          !assigningReservationId &&
                          "hover:scale-105 cursor-pointer",
                        editMode && "cursor-grab active:cursor-grabbing",
                        isDragging && "opacity-40",
                        assigningReservationId &&
                          !isAssignTarget &&
                          "opacity-60"
                      )}
                      style={{ left: tbl.x, top: tbl.y, width: w, height: h }}
                    >
                      <span className="font-mono text-xs font-semibold leading-none">
                        {tbl.name}
                      </span>
                      <span className="text-[10px] flex items-center gap-0.5 opacity-80 leading-none mt-0.5">
                        <Users className="h-2.5 w-2.5" />
                        {tbl.seats}
                      </span>
                      {/* Customer name on reserved/occupied tables */}
                      {linkedRes && (
                        <span className="text-[9px] font-medium truncate max-w-full px-0.5 mt-0.5 opacity-90 leading-tight">
                          {linkedRes.customerName.split(" ")[0]}
                        </span>
                      )}
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full mt-0.5",
                          meta.dot
                        )}
                      />
                    </motion.button>
                  );
                })}

                {/* Drop hint overlay */}
                {dragOver && (
                  <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-[var(--gold)]/60 rounded-2xl bg-[var(--gold)]/5 flex items-center justify-center">
                    <div className="text-xs font-mono uppercase tracking-wider text-[var(--gold-soft)] bg-background/80 px-3 py-1.5 rounded-md">
                      Suelta para reposicionar la mesa
                    </div>
                  </div>
                )}

                {/* Empty zone */}
                {visibleTables.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                    No hay mesas en esta zona.
                  </div>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="px-4 py-3 border-t border-border/40 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mr-1">
                Leyenda:
              </span>
              {(Object.keys(STATUS_META) as TableStatus[]).map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <span
                    className={cn("h-2.5 w-2.5 rounded-full", STATUS_META[s].dot)}
                  />
                  <span className="text-xs text-muted-foreground">
                    {STATUS_META[s].label}
                  </span>
                </div>
              ))}
              {!editMode && !assigningReservationId && (
                <span className="text-[11px] text-muted-foreground/70 ml-auto hidden sm:inline">
                  Clic en mesa = cambia estado
                </span>
              )}
            </div>
          </div>
        </section>

        {/* RIGHT (desktop) / TOP (mobile): Reservations list + details (40%) */}
        <section
          className="space-y-4 order-1 lg:order-2 min-w-0 overflow-hidden"
          aria-label="Lista de reservas y detalles"
        >
          {/* Reservations list */}
          <div className="rp-glass rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40">
              <div className="flex items-center gap-2">
                <CalendarPlus className="h-4 w-4 text-[var(--gold)]" />
                <span className="text-sm font-medium">Reservas</span>
                <DemoBadge />
              </div>
              <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
                {filteredReservations.length}
              </span>
            </div>

            {/* List — column header (desktop only) */}
            <div
              id="reservations-list"
              role="tabpanel"
              className="max-h-[560px] overflow-auto rp-scroll-thin"
            >
              {filteredReservations.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                  <Search className="h-5 w-5 opacity-40" />
                  No hay reservas con estos filtros.
                </div>
              ) : (
                <>
                  {/* Desktop column header */}
                  <div className="hidden lg:grid grid-cols-[68px_1fr_56px_72px_88px_96px_104px_36px_72px] min-w-[640px] gap-2 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border/40 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                    <span>Hora</span>
                    <span>Cliente</span>
                    <span className="text-right">Pax</span>
                    <span>Mesa</span>
                    <span>Zona</span>
                    <span>Canal</span>
                    <span>Estado</span>
                    <span className="text-center">Notas</span>
                    <span className="text-right">Garantía</span>
                  </div>
                  <ul className="divide-y divide-border/40">
                    <AnimatePresence initial={false}>
                      {filteredReservations.map((r, idx) => {
                        const table = tables.find((tt) => tt.id === r.tableId);
                        const isSelected = selectedReservationId === r.id;
                        const meta = RES_STATUS_META[r.status];
                        const channel = CHANNEL_META[r.channel];
                        const guarantee = GUARANTEE_META[r.guarantee];
                        const ChannelIcon = channel.icon;
                        const GuaranteeIcon = guarantee.icon;
                        const zoneLabel = ZONES.find((z) => z.id === r.zone)?.label ?? r.zone;
                        // Only animate entry for items created within last 3s
                        const isNew = Date.now() - r.createdAt < 3000;
                        return (
                          <motion.li
                            key={r.id}
                            initial={
                              reduce
                                ? false
                                : isNew
                                  ? { opacity: 0, y: -8 }
                                  : idx < 8
                                    ? { opacity: 0, y: -4 }
                                    : false
                            }
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduce ? undefined : { opacity: 0, y: -6 }}
                            transition={
                              reduce
                                ? { duration: 0 }
                                : { duration: 0.2, ease: "easeOut", delay: isNew ? 0 : Math.min(idx, 6) * 0.025 }
                            }
                          >
                            <ReservationRow
                              r={r}
                              table={table}
                              isSelected={isSelected}
                              meta={meta}
                              channelLabel={channel.label}
                              ChannelIcon={ChannelIcon}
                              channelCls={channel.cls}
                              guaranteeLabel={guarantee.label}
                              GuaranteeIcon={GuaranteeIcon}
                              guaranteeCls={guarantee.cls}
                              zoneLabel={zoneLabel}
                              reduce={!!reduce}
                              onSelect={() => {
                                setSelectedReservationId(r.id);
                                setSelectedTableId(null);
                              }}
                            />
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ul>
                </>
              )}
            </div>
          </div>

          {/* Details panel — slides in (desktop right, mobile bottom-sheet-like) */}
          <AnimatePresence mode="wait">
            {(selectedReservation || selectedTable || assigningReservation) && (
              <motion.div
                key={
                  assigningReservation
                    ? `assign-${assigningReservation.id}`
                    : selectedReservation
                      ? `res-${selectedReservation.id}`
                      : `tbl-${selectedTable?.id}`
                }
                initial={reduce ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: 20 }}
                transition={t}
              >
                <DetailsPanel
                  assigning={assigningReservation}
                  selectedTable={selectedTable}
                  selectedReservation={selectedReservation}
                  tableOfReservation={
                    selectedReservation
                      ? tables.find((tt) => tt.id === selectedReservation.tableId) ?? null
                      : null
                  }
                  reservationOfTable={
                    selectedTable
                      ? reservations.find(
                          (r) => r.id === selectedTable.reservationId
                        ) ?? null
                      : null
                  }
                  unassignedReservations={unassignedReservations}
                  onAssignTable={assignTableToReservation}
                  onFreeTable={(id) => setConfirmState({ kind: "free-table", id })}
                  onBlockTable={(id) => setConfirmState({ kind: "block-table", id })}
                  onConfirmRes={confirmReservation}
                  onReconfirmRes={reconfirmReservation}
                  onSeatRes={seatReservation}
                  onFinishRes={finishReservation}
                  onNoshowRes={noshowReservation}
                  onCancelRes={(id) => setConfirmState({ kind: "cancel-res", id })}
                  onStartAssign={startAssign}
                  onCancelAssign={() => setAssigningReservationId(null)}
                  onSelectReservation={(id) => {
                    setSelectedReservationId(id);
                    setSelectedTableId(null);
                  }}
                  reduce={!!reduce}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* Service timeline (collapsible) */}
      <Collapsible open={timelineOpen} onOpenChange={setTimelineOpen}>
        <div className="rp-glass rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40">
            <div className="flex items-center gap-2">
              <Hourglass className="h-4 w-4 text-[var(--teal)]" />
              <span className="text-sm font-medium">
                Línea de tiempo del servicio
              </span>
              <DemoBadge />
            </div>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label={timelineOpen ? "Contraer" : "Expandir"}
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    timelineOpen && "rotate-180"
                  )}
                />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="p-4">
              <TimelineContent
                reservations={reservations}
                tables={tables}
                selectedId={selectedReservationId}
                onSelect={(id) => {
                  setSelectedReservationId(id);
                  setSelectedTableId(null);
                }}
              />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* New reservation dialog */}
      <NewReservationDialog
        open={newDialogOpen}
        onOpenChange={setNewDialogOpen}
        tables={tables}
        onSubmit={submitNewReservation}
      />

      {/* Mobile filters Sheet */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rp-scroll-thin">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-[var(--gold)]" /> Filtros
            </SheetTitle>
            <SheetDescription>
              Refina la lista de reservas por fecha, zona, estado y canal.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6 space-y-5">
            <FilterGroup label="Fecha">
              <div className="flex gap-1.5 flex-wrap">
                {(["hoy", "manana", "fecha"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setDatePreset(p)}
                    className={cn(
                      "min-h-11 rounded-md px-3 py-2 text-sm border transition-colors capitalize",
                      datePreset === p
                        ? "border-[var(--gold)]/50 bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                        : "border-border/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {p === "hoy" ? "Hoy" : p === "manana" ? "Mañana" : "Elegir fecha"}
                  </button>
                ))}
              </div>
            </FilterGroup>
            <FilterGroup label="Zona">
              <div className="flex gap-1.5 flex-wrap">
                {ZONE_FILTERS.map((z) => (
                  <button
                    key={z.id}
                    onClick={() => setZoneFilter(z.id)}
                    className={cn(
                      "min-h-11 rounded-md px-3 py-2 text-sm border transition-colors",
                      zoneFilter === z.id
                        ? "border-[var(--gold)]/50 bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                        : "border-border/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {z.label}
                  </button>
                ))}
              </div>
            </FilterGroup>
            <FilterGroup label="Estado">
              <div className="flex gap-1.5 flex-wrap">
                {STATUS_FILTERS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStatusFilter(s.id)}
                    className={cn(
                      "min-h-11 rounded-md px-3 py-2 text-sm border transition-colors",
                      statusFilter === s.id
                        ? "border-[var(--gold)]/50 bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                        : "border-border/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </FilterGroup>
            <FilterGroup label="Canal">
              <div className="flex gap-1.5 flex-wrap">
                {CHANNEL_FILTERS.filter((c) => c.id !== "todos").map((c) => {
                  const Icon = CHANNEL_META[c.id as Channel].icon;
                  const isActive = channelFilter === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setChannelFilter(c.id as Channel)}
                      className={cn(
                        "min-h-11 rounded-md px-3 py-2 text-sm border transition-colors flex items-center gap-1.5",
                        isActive
                          ? "border-[var(--gold)]/50 bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                          : "border-border/60 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </FilterGroup>
            <FilterGroup label="Buscar">
              <div className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 min-h-11 bg-input/30">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nombre o teléfono…"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    aria-label="Limpiar"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </FilterGroup>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 min-h-11"
                onClick={clearFilters}
              >
                <Eraser className="h-4 w-4" /> Limpiar
              </Button>
              <Button
                className="flex-1 min-h-11 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Ver {filteredReservations.length} reservas
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirm dialog */}
      <AlertDialog
        open={!!confirmState}
        onOpenChange={(o) => !o && setConfirmState(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmState?.kind === "cancel-res" &&
                "¿Cancelar esta reserva?"}
              {confirmState?.kind === "block-table" &&
                "¿Bloquear esta mesa?"}
              {confirmState?.kind === "free-table" && "¿Liberar esta mesa?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmState?.kind === "cancel-res" &&
                "La reserva pasará a estado cancelada y su mesa quedará libre. Esta acción no se puede deshacer."}
              {confirmState?.kind === "block-table" &&
                "La mesa quedará fuera de servicio hasta que la restaures manualmente."}
              {confirmState?.kind === "free-table" &&
                "La mesa pasará a libre y se desvinculará de su reserva actual."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className={cn(
                confirmState?.kind !== "free-table" &&
                  "bg-destructive text-white hover:bg-destructive/90"
              )}
              onClick={handleConfirm}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </>
      )}
    </div>
  );
}

/* =========================================================
 * KPI card with animated number
 * =======================================================*/
function KpiCard({
  icon: Icon,
  label,
  value,
  caption,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  caption: string;
  tone: "gold" | "teal" | "muted";
}) {
  const toneCls =
    tone === "gold"
      ? "text-[var(--gold)]"
      : tone === "teal"
        ? "text-[var(--teal)]"
        : "text-muted-foreground";
  return (
    <div className="rp-glass rounded-xl p-4 flex items-center gap-3">
      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center bg-foreground/[0.04]", toneCls)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground truncate">
          {label}
        </div>
        <div className="text-xl font-display font-medium tabular-nums leading-tight">
          {value}
        </div>
        <div className="text-[11px] text-muted-foreground truncate">{caption}</div>
      </div>
    </div>
  );
}

/* =========================================================
 * Quick filters bar
 * =======================================================*/
function QuickFiltersBar(props: {
  datePreset: "hoy" | "manana" | "fecha";
  onDatePreset: (p: "hoy" | "manana" | "fecha") => void;
  zoneFilter: "todas" | Zone;
  onZoneFilter: (z: "todas" | Zone) => void;
  statusFilter: "todas" | ReservationStatus;
  onStatusFilter: (s: "todas" | ReservationStatus) => void;
  channelFilter: "todos" | Channel;
  onChannelFilter: (c: "todos" | Channel) => void;
  search: string;
  onSearch: (s: string) => void;
  onClear: () => void;
  activeCount: number;
  onOpenMobile: () => void;
}) {
  const {
    datePreset, onDatePreset,
    zoneFilter, onZoneFilter,
    statusFilter, onStatusFilter,
    channelFilter, onChannelFilter,
    search, onSearch, onClear, activeCount, onOpenMobile,
  } = props;

  return (
    <div className="rp-glass rounded-2xl p-3 space-y-3">
      {/* Top row: date segmented + search + mobile filters button */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Date segmented control */}
        <div className="flex items-center rounded-md border border-border/60 p-0.5 bg-input/20" role="radiogroup" aria-label="Fecha">
          {(["hoy", "manana", "fecha"] as const).map((p) => (
            <button
              key={p}
              role="radio"
              aria-checked={datePreset === p}
              onClick={() => onDatePreset(p)}
              className={cn(
                "min-h-9 rounded px-3 py-1 text-xs transition-colors flex items-center gap-1.5",
                datePreset === p
                  ? "bg-[var(--gold)] text-black font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Calendar className="h-3 w-3" />
              {p === "hoy" ? "Hoy" : p === "manana" ? "Mañana" : "Fecha"}
            </button>
          ))}
        </div>

        {/* Search (grows) */}
        <div className="flex-1 min-w-[180px] flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 min-h-11 bg-input/30">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar por cliente o teléfono…"
            aria-label="Buscar reservas"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground min-w-0"
          />
          {search && (
            <button
              onClick={() => onSearch("")}
              aria-label="Limpiar búsqueda"
              className="text-muted-foreground hover:text-foreground -mr-1 p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Channel dropdown (desktop) */}
        <div className="hidden sm:block">
          <Select
            value={channelFilter}
            onValueChange={(v) => onChannelFilter(v as "todos" | Channel)}
          >
            <SelectTrigger className="w-[170px] min-h-11" aria-label="Canal">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHANNEL_FILTERS.map((c) => {
                const Icon = c.id === "todos" ? Sliders : CHANNEL_META[c.id as Channel].icon;
                return (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5" />
                      {c.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Mobile: Filtros button */}
        <Button
          variant="outline"
          className="lg:hidden min-h-11 shrink-0 relative"
          onClick={onOpenMobile}
        >
          <Filter className="h-4 w-4" />
          Filtros
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 rounded-full bg-[var(--gold)] text-black text-[10px] font-mono flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </Button>

        {/* Clear all (desktop) */}
        {activeCount > 0 && (
          <Button
            variant="ghost"
            className="hidden lg:flex min-h-11 text-muted-foreground hover:text-foreground"
            onClick={onClear}
          >
            <Eraser className="h-3.5 w-3.5" /> Limpiar
          </Button>
        )}
      </div>

      {/* Bottom row: zone + status pills (desktop + tablet) */}
      <div className="hidden sm:flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Zona">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mr-1">Zona</span>
          {ZONE_FILTERS.map((z) => (
            <button
              key={z.id}
              role="tab"
              aria-selected={zoneFilter === z.id}
              onClick={() => onZoneFilter(z.id)}
              className={cn(
                "rounded-md px-2.5 py-1.5 min-h-9 text-xs font-medium border transition-colors",
                zoneFilter === z.id
                  ? "border-[var(--gold)]/40 bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                  : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              )}
            >
              {z.label}
            </button>
          ))}
        </div>
        <div className="h-5 w-px bg-border/60" />
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Estado">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mr-1">Estado</span>
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={statusFilter === s.id}
              onClick={() => onStatusFilter(s.id)}
              className={cn(
                "rounded-md px-2.5 py-1.5 min-h-9 text-xs font-medium border transition-colors",
                statusFilter === s.id
                  ? "border-[var(--gold)]/40 bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                  : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">{label}</div>
      {children}
    </div>
  );
}

/* =========================================================
 * Reservation row — desktop grid + mobile stacked card
 * Shows all 10 fields:
 *   Hora · Nombre · Fotografía · Personas · Mesa · Zona · Canal · Estado · Notas · Garantía
 * =======================================================*/
function ReservationRow(props: {
  r: RpReservation;
  table?: RpTable;
  isSelected: boolean;
  meta: typeof RES_STATUS_META[ReservationStatus];
  channelLabel: string;
  ChannelIcon: React.ElementType;
  channelCls: string;
  guaranteeLabel: string;
  GuaranteeIcon: React.ElementType;
  guaranteeCls: string;
  zoneLabel: string;
  reduce: boolean;
  onSelect: () => void;
}) {
  const {
    r, table, isSelected, meta,
    channelLabel, ChannelIcon, channelCls,
    guaranteeLabel, GuaranteeIcon, guaranteeCls,
    zoneLabel, reduce, onSelect,
  } = props;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-pressed={isSelected}
      className={cn(
        "w-full text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50 cursor-pointer",
        isSelected ? "bg-[var(--gold)]/10" : "hover:bg-foreground/[0.03]"
      )}
    >
      {/* ===== Desktop: grid row with all 10 columns ===== */}
      <div className="hidden lg:grid grid-cols-[68px_1fr_56px_72px_88px_96px_104px_36px_72px] min-w-[640px] gap-2 items-center px-4 py-2.5 text-sm">
        {/* Hora */}
        <span className="font-mono tabular-nums text-foreground/90 flex items-center gap-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          {r.time}
        </span>

        {/* Nombre + Fotografía (avatar) */}
        <span className="flex items-center gap-2 min-w-0">
          <Avatar name={r.customerName} photo={r.photo} />
          <span className="truncate font-medium">{r.customerName}</span>
        </span>

        {/* Personas */}
        <span className="text-right tabular-nums text-muted-foreground">
          {r.partySize}<span className="text-[10px] opacity-70 ml-0.5">pax</span>
        </span>

        {/* Mesa */}
        <span className="font-mono tabular-nums">
          {table ? (
            <span className="text-foreground">{table.name}</span>
          ) : (
            <span className="text-muted-foreground/70">—</span>
          )}
        </span>

        {/* Zona pill */}
        <span className={cn(
          "inline-flex items-center justify-center px-2 py-0.5 rounded border text-[11px] capitalize",
          ZONE_PILL[r.zone]
        )}>
          {zoneLabel}
        </span>

        {/* Canal */}
        <span className={cn("flex items-center gap-1.5 text-xs", channelCls)}>
          <ChannelIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{channelLabel}</span>
        </span>

        {/* Estado — animated badge (key=status remounts to pulse on change) */}
        <AnimatedStatusBadge meta={meta} reduce={reduce} />

        {/* Notas */}
        <span className="flex justify-center">
          {r.notes ? (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-[var(--gold)] hover:bg-foreground/5 transition-colors"
                  aria-label={`Ver notas de ${r.customerName}`}
                >
                  <StickyNote className="h-3.5 w-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="max-w-xs text-xs leading-relaxed"
                align="center"
              >
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Notas · {r.customerName}
                </div>
                {r.notes}
              </PopoverContent>
            </Popover>
          ) : (
            <span className="text-muted-foreground/50">—</span>
          )}
        </span>

        {/* Garantía */}
        <span className={cn(
          "inline-flex items-center justify-end gap-1 px-1.5 py-0.5 rounded border text-[10px] font-mono uppercase tracking-wider",
          guaranteeCls
        )}>
          <GuaranteeIcon className="h-3 w-3" />
          {guaranteeLabel}
        </span>
      </div>

      {/* ===== Mobile / tablet (< lg): stacked card ===== */}
      <div className="lg:hidden px-4 py-3 space-y-2.5">
        {/* Row 1: avatar + name + time + status */}
        <div className="flex items-center gap-2.5">
          <Avatar name={r.customerName} photo={r.photo} />
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate text-sm leading-tight">
              {r.customerName}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
              <Clock className="h-3 w-3" />
              <span className="font-mono tabular-nums">{r.time}</span>
              <span className="text-muted-foreground/40">·</span>
              <Users className="h-3 w-3" />
              <span className="tabular-nums">{r.partySize} pax</span>
            </div>
          </div>
          <AnimatedStatusBadge meta={meta} reduce={reduce} compact />
        </div>

        {/* Row 2: mesa / zona / canal */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded border border-border/60 bg-foreground/[0.04] font-mono tabular-nums">
            <ChairIcon className="h-3 w-3 text-muted-foreground" />
            {table ? table.name : "—"}
          </span>
          <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded border text-[11px]",
            ZONE_PILL[r.zone]
          )}>
            {zoneLabel}
          </span>
          <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded border border-border/60 bg-foreground/[0.04]", channelCls)}>
            <ChannelIcon className="h-3 w-3" />
            {channelLabel}
          </span>
        </div>

        {/* Row 3: garantía + notas */}
        <div className="flex items-center gap-2 justify-between">
          <span className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-mono uppercase tracking-wider",
            guaranteeCls
          )}>
            <GuaranteeIcon className="h-3 w-3" />
            {guaranteeLabel}
          </span>
          {r.notes ? (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-[var(--gold)] transition-colors"
                  aria-label={`Ver notas de ${r.customerName}`}
                >
                  <StickyNote className="h-3.5 w-3.5" />
                  Notas
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="max-w-xs text-xs leading-relaxed"
                align="end"
              >
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Notas · {r.customerName}
                </div>
                {r.notes}
              </PopoverContent>
            </Popover>
          ) : (
            <span className="text-[11px] text-muted-foreground/50">Sin notas</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Avatar — gradient gold circle with initials if no photo
 * =======================================================*/
function Avatar({ name, photo }: { name: string; photo?: string }) {
  if (photo) {
    return (
      <img
        src={photo}
        alt={`Foto de ${name}`}
        className="h-8 w-8 rounded-full object-cover shrink-0 ring-1 ring-border/60"
        loading="lazy"
      />
    );
  }
  return (
    <span
      className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] flex items-center justify-center text-black text-xs font-semibold shrink-0"
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

/* =========================================================
 * Animated status badge — pulses (scale) when status changes.
 * Uses key=status so motion remounts and replays the animation.
 * transform + opacity only.
 * =======================================================*/
function AnimatedStatusBadge({
  meta,
  reduce,
  compact,
}: {
  meta: typeof RES_STATUS_META[ReservationStatus];
  reduce: boolean;
  compact?: boolean;
}) {
  return (
    <motion.span
      key={meta.label}
      initial={reduce ? false : { scale: 1.1, opacity: 0.85 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={reduce ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded border font-mono uppercase tracking-wider",
        compact ? "text-[9px]" : "text-[10px]",
        meta.cls
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </motion.span>
  );
}

/* =========================================================
 * Zone decoration on the canvas
 * =======================================================*/
function ZoneDecor({ zone }: { zone: Zone }) {
  if (zone === "sala") {
    return (
      <>
        <span className="absolute top-3 right-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
          Ventana
        </span>
        <span className="absolute bottom-3 left-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
          Entrada
        </span>
        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-[var(--gold)]/15" />
      </>
    );
  }
  if (zone === "terraza") {
    return (
      <>
        <span className="absolute top-3 right-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
          Jardín
        </span>
        <span className="absolute bottom-3 left-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
          Acceso
        </span>
        <div className="absolute left-0 right-0 top-0 h-1.5 bg-[var(--teal)]/15" />
      </>
    );
  }
  if (zone === "vip") {
    return (
      <>
        <span className="absolute top-3 right-3 text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)]/80">
          Zona VIP
        </span>
        <span className="absolute bottom-3 left-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
          Acceso restringido
        </span>
        <div className="absolute left-0 right-0 top-0 h-1.5 bg-[var(--gold)]/30" />
        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-[var(--gold)]/30" />
      </>
    );
  }
  return (
    <>
      <span className="absolute top-3 right-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
        Servicio
      </span>
      <span className="absolute bottom-3 left-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
        Acceso
      </span>
      <div className="absolute left-0 right-0 bottom-0 h-1.5 bg-[var(--gold-soft)]/15" />
    </>
  );
}

/* =========================================================
 * Details panel (table or reservation)
 * =======================================================*/
function DetailsPanel(props: {
  assigning: RpReservation | null;
  selectedTable: RpTable | null;
  selectedReservation: RpReservation | null;
  tableOfReservation: RpTable | null;
  reservationOfTable: RpReservation | null;
  unassignedReservations: RpReservation[];
  onAssignTable: (tableId: string, reservationId: string) => void;
  onFreeTable: (id: string) => void;
  onBlockTable: (id: string) => void;
  onConfirmRes: (id: string) => void;
  onReconfirmRes: (id: string) => void;
  onSeatRes: (id: string) => void;
  onFinishRes: (id: string) => void;
  onNoshowRes: (id: string) => void;
  onCancelRes: (id: string) => void;
  onStartAssign: (id: string) => void;
  onCancelAssign: () => void;
  onSelectReservation: (id: string) => void;
  reduce: boolean;
}) {
  const {
    assigning, selectedTable, selectedReservation,
    tableOfReservation, reservationOfTable,
    unassignedReservations,
    onAssignTable, onFreeTable, onBlockTable,
    onConfirmRes, onReconfirmRes, onSeatRes, onFinishRes, onNoshowRes, onCancelRes,
    onStartAssign, onCancelAssign, onSelectReservation,
  } = props;

  /* --- Assignment mode banner --- */
  if (assigning) {
    return (
      <div className="rp-glass rounded-2xl p-5 rp-glow-gold">
        <div className="flex items-center gap-2 mb-3">
          <Hand className="h-4 w-4 text-[var(--gold)]" />
          <h3 className="font-medium">Asignando mesa</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          Reserva de{" "}
          <span className="text-foreground font-medium">
            {assigning.customerName}
          </span>{" "}
          ({assigning.partySize} pax · {assigning.time}).
        </div>
        <div className="mt-3 text-sm text-[var(--gold-soft)]">
          Haz clic en una mesa libre (verde) en el plano para confirmar.
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 w-full"
          onClick={onCancelAssign}
        >
          <X className="h-4 w-4" /> Cancelar asignación
        </Button>
      </div>
    );
  }

  /* --- Table details --- */
  if (selectedTable) {
    const meta = STATUS_META[selectedTable.status];
    return (
      <div className="rp-glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Armchair className="h-4 w-4 text-[var(--gold)]" />
            <h3 className="font-display text-xl font-medium">
              {selectedTable.name}
            </h3>
          </div>
          <AnimatedStatusBadge meta={meta} reduce={props.reduce} />
        </div>
        <dl className="space-y-0 text-sm">
          <Row k="Comensales" v={<span className="tabular-nums">{selectedTable.seats}</span>} />
          <Row k="Zona" v={ZONES.find((z) => z.id === selectedTable.zone)?.label ?? selectedTable.zone} />
          <Row k="Forma" v={shapeLabel(selectedTable.shape)} />
        </dl>

        {reservationOfTable && (
          <div className="mt-4 p-3 rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--gold-soft)] mb-1">
              Reserva actual
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">
                  {reservationOfTable.customerName}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                  <Clock className="h-3 w-3" />
                  {reservationOfTable.time}
                  <Users className="h-3 w-3" />
                  {reservationOfTable.partySize}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 h-8"
                onClick={() => onSelectReservation(reservationOfTable.id)}
              >
                Ver
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="min-h-11"
            onClick={() => onFreeTable(selectedTable.id)}
            disabled={selectedTable.status === "free"}
          >
            <Eraser className="h-3.5 w-3.5" /> Liberar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="min-h-11 text-destructive hover:text-destructive"
            onClick={() => onBlockTable(selectedTable.id)}
            disabled={selectedTable.status === "blocked"}
          >
            <Lock className="h-3.5 w-3.5" /> Bloquear
          </Button>
        </div>

        {/* Unassigned reservations to assign */}
        {selectedTable.status !== "occupied" &&
          unassignedReservations.length > 0 && (
            <div className="mt-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                Asignar reserva
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto rp-scroll-thin">
                {unassignedReservations.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onAssignTable(selectedTable.id, r.id)}
                    className="w-full flex items-center justify-between gap-2 rounded-md border border-border/60 px-2.5 py-1.5 text-left text-xs hover:bg-foreground/5 transition-colors"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="font-mono tabular-nums text-muted-foreground">
                        {r.time}
                      </span>
                      <span className="truncate">{r.customerName}</span>
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground shrink-0">
                      <Users className="h-3 w-3" />
                      {r.partySize}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
      </div>
    );
  }

  /* --- Reservation details --- */
  if (selectedReservation) {
    const meta = RES_STATUS_META[selectedReservation.status];
    const table = tableOfReservation;
    const channel = CHANNEL_META[selectedReservation.channel];
    const ChannelIcon = channel.icon;
    return (
      <div className="rp-glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={selectedReservation.customerName} photo={selectedReservation.photo} />
            <div className="min-w-0">
              <h3 className="font-display text-lg font-medium leading-tight truncate">
                {selectedReservation.customerName}
              </h3>
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                {selectedReservation.id.toUpperCase()}
              </div>
            </div>
          </div>
          <AnimatedStatusBadge meta={meta} reduce={props.reduce} />
        </div>
        <dl className="space-y-0 text-sm">
          <Row
            k={<span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Hora</span>}
            v={<span className="font-mono tabular-nums">{selectedReservation.time} · {selectedReservation.durationMin}min</span>}
          />
          <Row
            k={<span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Comensales</span>}
            v={<span className="tabular-nums">{selectedReservation.partySize}</span>}
          />
          <Row
            k={<span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Teléfono</span>}
            v={<span className="font-mono">{selectedReservation.phone}</span>}
          />
          <Row
            k={<span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Mesa</span>}
            v={table ? table.name : <span className="italic text-muted-foreground">sin asignar</span>}
          />
          <Row
            k={<span className="flex items-center gap-1.5"><ChannelIcon className="h-3.5 w-3.5" /> Canal</span>}
            v={<span className={channel.cls}>{channel.label}</span>}
          />
        </dl>
        {selectedReservation.notes && (
          <div className="mt-3 p-2.5 rounded-md bg-foreground/[0.04] border border-border/40 text-xs text-muted-foreground">
            <span className="font-mono uppercase text-[10px] tracking-wider mr-1.5">
              Notas
            </span>
            {selectedReservation.notes}
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          {selectedReservation.status === "pendiente" && (
            <Button
              size="sm"
              className="min-h-11 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
              onClick={() => onConfirmRes(selectedReservation.id)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Confirmar
            </Button>
          )}
          {selectedReservation.status === "confirmada" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="min-h-11"
                onClick={() => onReconfirmRes(selectedReservation.id)}
              >
                <CheckCheck className="h-3.5 w-3.5" /> Reconfirmar
              </Button>
              <Button
                size="sm"
                className="min-h-11 bg-[var(--teal)] text-black hover:bg-[var(--teal)]/80"
                onClick={() => onSeatRes(selectedReservation.id)}
              >
                <LogIn className="h-3.5 w-3.5" /> Sentar
              </Button>
            </>
          )}
          {selectedReservation.status === "reconfirmada" && (
            <Button
              size="sm"
              className="min-h-11 bg-[var(--teal)] text-black hover:bg-[var(--teal)]/80"
              onClick={() => onSeatRes(selectedReservation.id)}
            >
              <LogIn className="h-3.5 w-3.5" /> Sentar
            </Button>
          )}
          {selectedReservation.status === "sentada" && (
            <Button
              size="sm"
              variant="outline"
              className="min-h-11"
              onClick={() => onFinishRes(selectedReservation.id)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Finalizar
            </Button>
          )}
          {(selectedReservation.status === "pendiente" ||
            selectedReservation.status === "confirmada" ||
            selectedReservation.status === "reconfirmada" ||
            selectedReservation.status === "espera") && (
            <Button
              size="sm"
              variant="outline"
              className="min-h-11 text-rose-300 hover:text-rose-200 border-rose-500/30 hover:border-rose-500/50"
              onClick={() => onNoshowRes(selectedReservation.id)}
            >
              <UserX className="h-3.5 w-3.5" /> No-show
            </Button>
          )}
          {!selectedReservation.tableId &&
            selectedReservation.status !== "cancelada" &&
            selectedReservation.status !== "finalizada" &&
            selectedReservation.status !== "sentada" && (
              <Button
                size="sm"
                variant="outline"
                className="min-h-11"
                onClick={() => onStartAssign(selectedReservation.id)}
              >
                <MapPin className="h-3.5 w-3.5" /> Asignar mesa
              </Button>
            )}
          {selectedReservation.status !== "cancelada" &&
            selectedReservation.status !== "finalizada" && (
              <Button
                size="sm"
                variant="outline"
                className="min-h-11 text-destructive hover:text-destructive"
                onClick={() => onCancelRes(selectedReservation.id)}
              >
                <XCircle className="h-3.5 w-3.5" /> Cancelar
              </Button>
            )}
        </div>
      </div>
    );
  }

  /* --- Empty state --- */
  return (
    <div className="rp-glass rounded-2xl p-8 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-foreground/5 flex items-center justify-center mb-3">
        <Armchair className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="font-medium text-sm">
        Selecciona una mesa o reserva
      </h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
        Haz clic en una mesa del plano para ver detalles y acciones, o en una
        reserva de la lista.
      </p>
    </div>
  );
}

function Row({ k, v }: { k: React.ReactNode; v: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-border/40 last:border-0">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium text-right">{v}</dd>
    </div>
  );
}

/* =========================================================
 * Service timeline — smooth horizontal scroll with momentum
 * =======================================================*/
function TimelineContent({
  reservations,
  tables,
  selectedId,
  onSelect,
}: {
  reservations: RpReservation[];
  tables: RpTable[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const START = 13 * 60; // 13:00
  const END = 23 * 60; // 23:00
  const PX_PER_MIN = 1.5;
  const width = (END - START) * PX_PER_MIN;

  const hours: number[] = [];
  for (let h = 13; h <= 23; h++) hours.push(h);

  // greedy lane packing
  const lanesEnd: number[] = [];
  const placed = reservations
    .filter((r) => r.status !== "cancelada")
    .map((r) => {
      const start = timeToMin(r.time);
      const end = start + r.durationMin;
      let lane = lanesEnd.findIndex((l) => l <= start);
      if (lane === -1) {
        lane = lanesEnd.length;
        lanesEnd.push(end);
      } else {
        lanesEnd[lane] = end;
      }
      return { r, start, end, lane };
    })
    .sort((a, b) => a.start - b.start);

  const laneCount = Math.max(1, lanesEnd.length);
  const rowH = 38;
  const totalH = 26 + laneCount * rowH + 8;

  // mock "now" indicator at 14:45
  const nowMin = 14 * 60 + 45;
  const nowX = (nowMin - START) * PX_PER_MIN;
  const showNow = nowMin >= START && nowMin <= END;

  return (
    <div
      className="overflow-x-auto rp-scroll-thin -mx-1"
      style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch" }}
    >
      <div
        className="relative"
        style={{ width, minWidth: "100%", height: totalH }}
      >
        {/* hour grid */}
        {hours.map((h) => {
          const x = (h * 60 - START) * PX_PER_MIN;
          return (
            <div
              key={h}
              className="absolute top-0 bottom-0 border-l border-border/30"
              style={{ left: x }}
            >
              <span className="absolute top-0 left-1 text-[10px] font-mono text-muted-foreground">
                {String(h).padStart(2, "0")}:00
              </span>
            </div>
          );
        })}

        {/* now indicator */}
        {showNow && (
          <div
            className="absolute top-0 bottom-0 w-px bg-[var(--teal)] z-10"
            style={{ left: nowX }}
            aria-hidden
          >
            <div className="absolute top-0 -translate-x-1/2 h-2 w-2 rounded-full bg-[var(--teal)]" />
            <div className="absolute top-0 -translate-x-1/2 -translate-y-full text-[9px] font-mono text-[var(--teal)] whitespace-nowrap bg-background/80 px-1 rounded">
              AHORA
            </div>
          </div>
        )}

        {/* reservation blocks */}
        {placed.map(({ r, start, end, lane }) => {
          const x = (start - START) * PX_PER_MIN;
          const w = (end - start) * PX_PER_MIN;
          const y = 22 + lane * rowH;
          const table = tables.find((t) => t.id === r.tableId);
          const isSelected = selectedId === r.id;
          const meta = RES_STATUS_META[r.status];
          return (
            <button
              key={r.id}
              onClick={() => onSelect(r.id)}
              aria-pressed={isSelected}
              aria-label={`${r.customerName} · ${r.time} · ${r.partySize} comensales${
                table ? ` · mesa ${table.name}` : ""
              }`}
              className={cn(
                "absolute h-8 rounded-md border px-2 text-left text-[11px] flex items-center gap-1.5 overflow-hidden transition-[color,box-shadow,transform] hover:scale-[1.02]",
                meta.cls,
                isSelected
                  ? "ring-2 ring-[var(--gold)] z-10 brightness-110"
                  : "hover:brightness-125"
              )}
              style={{ left: x, width: Math.max(w - 2, 60), top: y }}
              title={`${r.customerName} · ${r.time} · ${r.partySize} pax${
                table ? ` · ${table.name}` : ""
              }`}
            >
              <span className="font-mono tabular-nums opacity-80 shrink-0">
                {r.time}
              </span>
              <span className="truncate font-medium">{r.customerName}</span>
              <span className="ml-auto flex items-center gap-1 opacity-80 shrink-0">
                <Users className="h-3 w-3" />
                {r.partySize}
                {table && (
                  <span className="font-mono ml-0.5">{table.name}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
 * New reservation dialog
 * =======================================================*/
function NewReservationDialog({
  open,
  onOpenChange,
  tables,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  tables: RpTable[];
  onSubmit: (form: NewReservationForm) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const empty: NewReservationForm = {
    customerName: "",
    phone: "",
    partySize: 2,
    date: today,
    time: "20:30",
    tableId: undefined,
    zone: "sala",
    channel: "web",
    guarantee: "ninguna",
    notes: "",
  };
  const [form, setForm] = React.useState<NewReservationForm>(empty);

  React.useEffect(() => {
    if (open) setForm(empty);
  }, [open]);

  const freeTables = tables.filter((t) => t.status === "free");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerName.trim()) return;
    onSubmit(form);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rp-scroll-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-[var(--gold)]" /> Nueva reserva
            <DemoBadge />
          </DialogTitle>
          <DialogDescription>
            Crea una reserva y, opcionalmente, asígnala a una mesa libre.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Cliente">
              <Input
                className="min-h-11"
                value={form.customerName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customerName: e.target.value }))
                }
                placeholder="Nombre y apellidos"
                required
                autoFocus
              />
            </Field>
            <Field label="Teléfono">
              <Input
                className="min-h-11"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="+34 600 000 000"
                type="tel"
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Comensales">
              <Input
                className="min-h-11"
                type="number"
                min={1}
                max={30}
                value={form.partySize}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    partySize: Math.max(1, Number(e.target.value) || 1),
                  }))
                }
              />
            </Field>
            <Field label="Fecha">
              <Input
                className="min-h-11"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </Field>
            <Field label="Hora">
              <Input
                className="min-h-11"
                type="time"
                value={form.time}
                onChange={(e) =>
                  setForm((f) => ({ ...f, time: e.target.value }))
                }
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Zona">
              <Select
                value={form.zone}
                onValueChange={(v) => setForm((f) => ({ ...f, zone: v as Zone }))}
              >
                <SelectTrigger className="w-full min-h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ZONES.map((z) => (
                    <SelectItem key={z.id} value={z.id}>
                      {z.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Mesa (opcional)">
              <Select
                value={form.tableId ?? "none"}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    tableId: v === "none" ? undefined : v,
                  }))
                }
              >
                <SelectTrigger className="w-full min-h-11">
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {freeTables.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} · {t.seats} pax ·{" "}
                      {ZONES.find((z) => z.id === t.zone)?.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Canal">
              <Select
                value={form.channel}
                onValueChange={(v) => setForm((f) => ({ ...f, channel: v as Channel }))}
              >
                <SelectTrigger className="w-full min-h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CHANNEL_META) as Channel[]).map((c) => {
                    const Icon = CHANNEL_META[c].icon;
                    return (
                      <SelectItem key={c} value={c}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5" />
                          {CHANNEL_META[c].label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Garantía">
              <Select
                value={form.guarantee}
                onValueChange={(v) => setForm((f) => ({ ...f, guarantee: v as Guarantee }))}
              >
                <SelectTrigger className="w-full min-h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(GUARANTEE_META) as Guarantee[]).map((g) => {
                    const Icon = GUARANTEE_META[g].icon;
                    return (
                      <SelectItem key={g} value={g}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5" />
                          {GUARANTEE_META[g].label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Notas">
            <Textarea
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Alergias, preferencias, ocasión especial…"
              rows={2}
            />
          </Field>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="min-h-11">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="min-h-11 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
              disabled={!form.customerName.trim()}
            >
              <CheckCircle2 className="h-4 w-4" /> Crear reserva
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
