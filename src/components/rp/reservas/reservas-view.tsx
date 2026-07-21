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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Pencil,
  Users,
  Clock,
  Phone,
  MapPin,
  CheckCircle2,
  LogIn,
  XCircle,
  ChevronDown,
  Lock,
  Eraser,
  Hourglass,
  X,
  Armchair,
  Hand,
  CalendarPlus,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
export type TableStatus =
  | "free"
  | "reserved"
  | "occupied"
  | "cleaning"
  | "blocked";
export type Zone = "sala" | "terraza" | "barra";
export type ReservationStatus =
  | "confirmada"
  | "espera"
  | "checkin"
  | "noshow"
  | "cancelada";

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
}

interface NewReservationForm {
  customerName: string;
  phone: string;
  partySize: number;
  date: string;
  time: string;
  tableId?: string;
  zone: Zone;
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
  { id: "sala", label: "Sala principal", hint: "Interior" },
  { id: "terraza", label: "Terraza", hint: "Exterior" },
  { id: "barra", label: "Barra", hint: "Mostrador" },
];

const RES_STATUS_META: Record<ReservationStatus, { label: string; cls: string }> = {
  confirmada: {
    label: "Confirmada",
    cls: "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
  },
  espera: {
    label: "Lista de espera",
    cls: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  },
  checkin: {
    label: "Check-in",
    cls: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
  },
  noshow: {
    label: "No-show",
    cls: "border-destructive/40 bg-destructive/10 text-destructive",
  },
  cancelada: {
    label: "Cancelada",
    cls: "border-zinc-500/40 bg-zinc-500/10 text-zinc-400",
  },
};

const FILTERS: { id: "todas" | ReservationStatus; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "confirmada", label: "Confirmadas" },
  { id: "espera", label: "Lista de espera" },
  { id: "checkin", label: "Check-in" },
  { id: "noshow", label: "No-show" },
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
  // Barra
  { id: "B1", name: "B1", seats: 2, x: 50, y: 120, status: "occupied", shape: "square", zone: "barra", reservationId: "r7" },
  { id: "B2", name: "B2", seats: 2, x: 160, y: 120, status: "occupied", shape: "square", zone: "barra" },
  { id: "B3", name: "B3", seats: 2, x: 270, y: 120, status: "free", shape: "square", zone: "barra" },
];

const INITIAL_RESERVATIONS: RpReservation[] = [
  { id: "r1", customerName: "Elena Vidal", phone: "+34 612 334 211", partySize: 4, time: "13:30", durationMin: 120, status: "confirmada", tableId: "M1", zone: "sala", notes: "Aniversario · mesa ventana" },
  { id: "r2", customerName: "Marc Puig", phone: "+34 670 891 220", partySize: 4, time: "14:00", durationMin: 120, status: "checkin", tableId: "M2", zone: "sala", notes: "" },
  { id: "r3", customerName: "Sofía Ruiz", phone: "+34 655 220 119", partySize: 4, time: "14:30", durationMin: 90, status: "confirmada", tableId: "T1", zone: "terraza", notes: "Cliente VIP" },
  { id: "r4", customerName: "Jordi Soler", phone: "+34 622 119 887", partySize: 6, time: "13:45", durationMin: 150, status: "checkin", tableId: "T3", zone: "terraza", notes: "Cumpleaños, traen tarta" },
  { id: "r5", customerName: "Núria Camps", phone: "+34 690 113 445", partySize: 2, time: "15:00", durationMin: 60, status: "espera", zone: "sala", notes: "Sin asignar" },
  { id: "r6", customerName: "Pau Riera", phone: "+34 644 332 100", partySize: 3, time: "20:30", durationMin: 120, status: "confirmada", zone: "sala", notes: "" },
  { id: "r7", customerName: "Laia Font", phone: "+34 633 445 998", partySize: 2, time: "21:00", durationMin: 90, status: "checkin", tableId: "B1", zone: "barra", notes: "Cena rápida en barra" },
  { id: "r8", customerName: "Arnau Bosch", phone: "+34 611 220 333", partySize: 5, time: "21:30", durationMin: 150, status: "espera", zone: "terraza", notes: "Prefiere terraza" },
  { id: "r9", customerName: "Carla Vives", phone: "+34 699 001 223", partySize: 2, time: "13:00", durationMin: 60, status: "noshow", zone: "sala", notes: "No avisó" },
  { id: "r10", customerName: "Bruno Serra", phone: "+34 688 220 110", partySize: 4, time: "22:00", durationMin: 120, status: "confirmada", zone: "sala", notes: "Cena tarde" },
];

/* =========================================================
 * Helpers
 * =======================================================*/
function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function tableW(t: RpTable): number {
  if (t.shape === "round") return 84;
  if (t.shape === "square") return 76;
  return t.w ?? 140;
}
function tableH(t: RpTable): number {
  if (t.shape === "round") return 84;
  if (t.shape === "square") return 76;
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

/* =========================================================
 * Main view
 * =======================================================*/
export function ReservasView() {
  const { toast } = useToast();
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
  const [resFilter, setResFilter] = React.useState<"todas" | ReservationStatus>("todas");
  const [search, setSearch] = React.useState("");
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
  const filteredReservations = reservations.filter((r) => {
    if (resFilter !== "todas" && r.status !== resFilter) return false;
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
  const unassignedReservations = reservations.filter(
    (r) => !r.tableId && r.status !== "cancelada"
  );

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
              status: x.status === "espera" ? "confirmada" : x.status,
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
  function confirmReservation(resId: string) {
    const r = reservations.find((x) => x.id === resId);
    if (!r) return;
    setReservations((rs) =>
      rs.map((x) =>
        x.id === resId && x.status === "espera"
          ? { ...x, status: "confirmada" }
          : x
      )
    );
    toast({ title: "Reserva confirmada", description: r.customerName });
  }

  function checkinReservation(resId: string) {
    const r = reservations.find((x) => x.id === resId);
    if (!r) return;
    setReservations((rs) =>
      rs.map((x) => (x.id === resId ? { ...x, status: "checkin" } : x))
    );
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
      title: "Check-in realizado",
      description: `${r.customerName} · ${r.partySize} comensales`,
    });
  }

  function cancelReservation(resId: string) {
    const r = reservations.find((x) => x.id === resId);
    if (!r) return;
    setReservations((rs) =>
      rs.map((x) =>
        x.id === resId ? { ...x, status: "cancelada" } : x
      )
    );
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

  /* ----- drag & drop ----- */
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
      status: "confirmada",
      tableId: form.tableId,
      zone: form.zone,
      notes: form.notes.trim() || undefined,
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

  /* ----- render ----- */
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
        <Button
          onClick={() => setNewDialogOpen(true)}
          className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] shrink-0"
        >
          <Plus className="h-4 w-4" /> Nueva reserva
        </Button>
      </header>

      {/* Main grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* LEFT: Floor plan (60%) */}
        <section className="lg:col-span-3 space-y-4" aria-label="Plano de mesas">
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
                    "rounded-md px-3 py-1.5 text-sm font-medium border transition-colors",
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
                className={cn(
                  "relative rp-grid-bg",
                  dragOver && "ring-2 ring-inset ring-[var(--gold)]/60"
                )}
                style={{ minWidth: 680, height: 460 }}
              >
                <ZoneDecor zone={zone} />

                {/* Tables */}
                {visibleTables.map((t) => {
                  const meta = STATUS_META[t.status];
                  const w = tableW(t);
                  const h = tableH(t);
                  const isDragging = draggedId === t.id;
                  const isSelected = selectedTableId === t.id;
                  const isAssignTarget =
                    !!assigningReservationId && t.status === "free";
                  return (
                    <button
                      key={t.id}
                      type="button"
                      draggable={editMode}
                      onDragStart={(e) => onDragStart(e, t)}
                      onDragEnd={onDragEnd}
                      onClick={() => onTableClick(t)}
                      aria-label={`Mesa ${t.name}, ${t.seats} comensales, estado ${meta.label}${
                        t.reservationId ? `, reserva ${t.reservationId}` : ""
                      }`}
                      aria-pressed={isSelected}
                      className={cn(
                        "absolute flex flex-col items-center justify-center gap-0.5 border-2 transition-all select-none",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-[var(--gold)]",
                        meta.border,
                        meta.bg,
                        meta.text,
                        t.shape === "round" ? "rounded-full" : "rounded-xl",
                        isSelected &&
                          "scale-110 z-20 ring-2 ring-offset-2 ring-offset-background " +
                            meta.ring,
                        !editMode &&
                          !assigningReservationId &&
                          "hover:scale-105 cursor-pointer",
                        editMode && "cursor-grab active:cursor-grabbing",
                        isDragging && "opacity-40",
                        isAssignTarget &&
                          "animate-pulse ring-2 ring-[var(--gold)] cursor-pointer",
                        assigningReservationId &&
                          !isAssignTarget &&
                          "opacity-60"
                      )}
                      style={{ left: t.x, top: t.y, width: w, height: h }}
                    >
                      <span className="font-mono text-xs font-semibold">
                        {t.name}
                      </span>
                      <span className="text-[10px] flex items-center gap-0.5 opacity-80">
                        <Users className="h-2.5 w-2.5" />
                        {t.seats}
                      </span>
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full mt-0.5",
                          meta.dot
                        )}
                      />
                    </button>
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

        {/* RIGHT: Reservations list + details (40%) */}
        <section
          className="lg:col-span-2 space-y-4"
          aria-label="Lista de reservas y detalles"
        >
          {/* Reservations list */}
          <div className="rp-glass rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40">
              <div className="flex items-center gap-2">
                <CalendarPlus className="h-4 w-4 text-[var(--gold)]" />
                <span className="text-sm font-medium">Reservas de hoy</span>
                <DemoBadge />
              </div>
              <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
                {filteredReservations.length}
              </span>
            </div>

            {/* Search + filters */}
            <div className="p-3 space-y-2.5 border-b border-border/40">
              <div className="flex items-center gap-2 rounded-md border border-border/60 px-2.5 py-1.5 bg-input/30">
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por cliente o teléfono…"
                  aria-label="Buscar reservas"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    aria-label="Limpiar búsqueda"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div
                className="flex flex-wrap gap-1.5"
                role="tablist"
                aria-label="Filtrar reservas por estado"
              >
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    role="tab"
                    aria-selected={resFilter === f.id}
                    aria-controls="reservations-list"
                    onClick={() => setResFilter(f.id)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium border transition-colors",
                      resFilter === f.id
                        ? "border-[var(--gold)]/40 bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                        : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div
              id="reservations-list"
              role="tabpanel"
              className="max-h-[420px] overflow-y-auto rp-scroll-thin divide-y divide-border/40"
            >
              {filteredReservations.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No hay reservas con estos filtros.
                </div>
              ) : (
                filteredReservations.map((r) => {
                  const table = tables.find((t) => t.id === r.tableId);
                  const isSelected = selectedReservationId === r.id;
                  const meta = RES_STATUS_META[r.status];
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        setSelectedReservationId(r.id);
                        setSelectedTableId(null);
                      }}
                      aria-pressed={isSelected}
                      className={cn(
                        "w-full text-left px-4 py-3 transition-colors",
                        isSelected ? "bg-[var(--gold)]/10" : "hover:bg-foreground/[0.03]"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex items-center gap-1 text-sm font-medium shrink-0">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-mono tabular-nums">
                              {r.time}
                            </span>
                          </div>
                          <span className="truncate">{r.customerName}</span>
                        </div>
                        <span
                          className={cn(
                            "text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0",
                            meta.cls
                          )}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {r.partySize}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {table ? (
                            table.name
                          ) : (
                            <span className="italic opacity-80">
                              sin asignar
                            </span>
                          )}
                        </span>
                        {r.notes && (
                          <span className="ml-auto truncate opacity-70 hidden sm:inline">
                            {r.notes}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Details panel */}
          <DetailsPanel
            assigning={assigningReservation}
            selectedTable={selectedTable}
            selectedReservation={selectedReservation}
            tableOfReservation={
              selectedReservation
                ? tables.find((t) => t.id === selectedReservation.tableId) ?? null
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
            onCheckinRes={checkinReservation}
            onCancelRes={(id) => setConfirmState({ kind: "cancel-res", id })}
            onStartAssign={startAssign}
            onCancelAssign={() => setAssigningReservationId(null)}
            onSelectReservation={(id) => {
              setSelectedReservationId(id);
              setSelectedTableId(null);
            }}
          />
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
    </div>
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
  onCheckinRes: (id: string) => void;
  onCancelRes: (id: string) => void;
  onStartAssign: (id: string) => void;
  onCancelAssign: () => void;
  onSelectReservation: (id: string) => void;
}) {
  const {
    assigning,
    selectedTable,
    selectedReservation,
    tableOfReservation,
    reservationOfTable,
    unassignedReservations,
    onAssignTable,
    onFreeTable,
    onBlockTable,
    onConfirmRes,
    onCheckinRes,
    onCancelRes,
    onStartAssign,
    onCancelAssign,
    onSelectReservation,
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
          <span
            className={cn(
              "text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border",
              meta.border,
              meta.bg,
              meta.text
            )}
          >
            {meta.label}
          </span>
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
            onClick={() => onFreeTable(selectedTable.id)}
            disabled={selectedTable.status === "free"}
          >
            <Eraser className="h-3.5 w-3.5" /> Liberar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onBlockTable(selectedTable.id)}
            disabled={selectedTable.status === "blocked"}
            className="text-destructive hover:text-destructive"
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
    return (
      <div className="rp-glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] flex items-center justify-center text-black text-xs font-medium shrink-0">
              {initials(selectedReservation.customerName)}
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-lg font-medium leading-tight truncate">
                {selectedReservation.customerName}
              </h3>
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                {selectedReservation.id.toUpperCase()}
              </div>
            </div>
          </div>
          <span
            className={cn(
              "text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border shrink-0",
              meta.cls
            )}
          >
            {meta.label}
          </span>
        </div>
        <dl className="space-y-0 text-sm">
          <Row
            k={
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Hora
              </span>
            }
            v={
              <span className="font-mono tabular-nums">
                {selectedReservation.time} · {selectedReservation.durationMin}min
              </span>
            }
          />
          <Row
            k={
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Comensales
              </span>
            }
            v={<span className="tabular-nums">{selectedReservation.partySize}</span>}
          />
          <Row
            k={
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> Teléfono
              </span>
            }
            v={<span className="font-mono">{selectedReservation.phone}</span>}
          />
          <Row
            k={
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Mesa
              </span>
            }
            v={
              table ? (
                table.name
              ) : (
                <span className="italic text-muted-foreground">sin asignar</span>
              )
            }
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
          {selectedReservation.status === "espera" && (
            <Button
              size="sm"
              className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
              onClick={() => onConfirmRes(selectedReservation.id)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Confirmar
            </Button>
          )}
          {selectedReservation.status === "confirmada" && (
            <Button
              size="sm"
              className="bg-[var(--teal)] text-black hover:bg-[var(--teal)]/80"
              onClick={() => onCheckinRes(selectedReservation.id)}
            >
              <LogIn className="h-3.5 w-3.5" /> Check-in
            </Button>
          )}
          {!selectedReservation.tableId &&
            selectedReservation.status !== "cancelada" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStartAssign(selectedReservation.id)}
              >
                <MapPin className="h-3.5 w-3.5" /> Asignar mesa
              </Button>
            )}
          {selectedReservation.status !== "cancelada" && (
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
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
 * Service timeline
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
    <div className="overflow-x-auto rp-scroll-thin -mx-1">
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
                "absolute h-8 rounded-md border px-2 text-left text-[11px] flex items-center gap-1.5 overflow-hidden transition-all",
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
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cliente">
              <Input
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
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="+34 600 000 000"
                type="tel"
              />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Comensales">
              <Input
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
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </Field>
            <Field label="Hora">
              <Input
                type="time"
                value={form.time}
                onChange={(e) =>
                  setForm((f) => ({ ...f, time: e.target.value }))
                }
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Zona">
              <Select
                value={form.zone}
                onValueChange={(v) => setForm((f) => ({ ...f, zone: v as Zone }))}
              >
                <SelectTrigger className="w-full">
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
                <SelectTrigger className="w-full">
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
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
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
