"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ShieldCheck, ShieldAlert, ArrowRight, History, Download,
  Clock, CheckCircle2, XCircle, AlertTriangle, UserX, Ban,
  Pencil, LogIn, Armchair, UtensilsCrossed, IceCreamBowl,
  CreditCard, Flag, Share2, Crown, Cake, Accessibility,
  AlertCircle, Star, Bell, UserRound, Move, Check, Lock,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type CommercialState =
  | "pending"
  | "confirmed"
  | "modified"
  | "cancelled"
  | "no_show"
  | "completed";

type OperationalState =
  | "expected"
  | "checked_in"
  | "seated"
  | "ordering"
  | "dining"
  | "dessert"
  | "payment"
  | "finished"
  | "transferred";

interface StateTransition {
  from: CommercialState | OperationalState;
  to: CommercialState | OperationalState;
  label: string;
  requiresPermission: boolean;
  auditRequired: boolean;
}

interface HistoryEntry {
  at: string;
  action: string;
  from: string;
  to: string;
  by: string;
  reason?: string;
}

interface ReservationWithState {
  id: string;
  code: string;
  customerName: string;
  partySize: number;
  date: string;
  time: string;
  commercialState: CommercialState;
  operationalState: OperationalState;
  tags: string[];
  assignedTable?: string;
  assignedZone?: string;
  history: HistoryEntry[];
}

/* =========================================================
 * State meta
 * =======================================================*/
const COMMERCIAL_META: Record<CommercialState, { label: string; short: string; tone: string; dot: string }> = {
  pending: { label: "Pendiente", short: "Pend", tone: "text-amber-300", dot: "#fbbf24" },
  confirmed: { label: "Confirmada", short: "Conf", tone: "rp-gold-text", dot: "#D4AF37" },
  modified: { label: "Modificada", short: "Mod", tone: "rp-teal-text", dot: "#3DD6C9" },
  cancelled: { label: "Cancelada", short: "Canc", tone: "text-rose-300", dot: "#fb7185" },
  no_show: { label: "No show", short: "NoShow", tone: "text-rose-300", dot: "#f43f5e" },
  completed: { label: "Completada", short: "Comp", tone: "text-emerald-300", dot: "#34d399" },
};

const OPERATIONAL_META: Record<OperationalState, { label: string; short: string; tone: string; dot: string }> = {
  expected: { label: "Esperada", short: "Esperada", tone: "text-amber-300", dot: "#fbbf24" },
  checked_in: { label: "Check-in", short: "Check-in", tone: "text-amber-300", dot: "#fbbf24" },
  seated: { label: "Sentada", short: "Sentada", tone: "rp-teal-text", dot: "#3DD6C9" },
  ordering: { label: "Pidiendo", short: "Pidiendo", tone: "rp-teal-text", dot: "#3DD6C9" },
  dining: { label: "Comiendo", short: "Comiendo", tone: "rp-teal-text", dot: "#3DD6C9" },
  dessert: { label: "Postre", short: "Postre", tone: "rp-teal-text", dot: "#3DD6C9" },
  payment: { label: "Pago", short: "Pago", tone: "rp-gold-text", dot: "#D4AF37" },
  finished: { label: "Finalizada", short: "Final", tone: "text-emerald-300", dot: "#34d399" },
  transferred: { label: "Transferida", short: "Transf", tone: "text-fuchsia-300", dot: "#e879f9" },
};

/* =========================================================
 * Graph layout
 * =======================================================*/
const COMMERCIAL_NODES: { id: CommercialState; x: number; y: number }[] = [
  { id: "pending", x: 70, y: 120 },
  { id: "confirmed", x: 240, y: 120 },
  { id: "modified", x: 410, y: 120 },
  { id: "completed", x: 580, y: 120 },
  { id: "cancelled", x: 470, y: 36 },
  { id: "no_show", x: 470, y: 204 },
];

const COMMERCIAL_TRANSITIONS: { from: CommercialState; to: CommercialState; label: string; requiresPermission: boolean }[] = [
  { from: "pending", to: "confirmed", label: "Confirmar", requiresPermission: false },
  { from: "confirmed", to: "modified", label: "Modificar", requiresPermission: false },
  { from: "modified", to: "confirmed", label: "Reconfirmar", requiresPermission: false },
  { from: "confirmed", to: "completed", label: "Completar", requiresPermission: false },
  { from: "modified", to: "completed", label: "Completar", requiresPermission: false },
  { from: "confirmed", to: "cancelled", label: "Cancelar", requiresPermission: true },
  { from: "modified", to: "cancelled", label: "Cancelar", requiresPermission: true },
  { from: "confirmed", to: "no_show", label: "Marcar no show", requiresPermission: true },
];

const OPERATIONAL_NODES: { id: OperationalState; x: number; y: number }[] = [
  { id: "expected", x: 80, y: 60 },
  { id: "checked_in", x: 270, y: 60 },
  { id: "seated", x: 460, y: 60 },
  { id: "ordering", x: 80, y: 165 },
  { id: "dining", x: 270, y: 165 },
  { id: "dessert", x: 460, y: 165 },
  { id: "payment", x: 80, y: 270 },
  { id: "finished", x: 270, y: 270 },
  { id: "transferred", x: 460, y: 270 },
];

const OPERATIONAL_TRANSITIONS: { from: OperationalState; to: OperationalState; label: string; requiresPermission: boolean }[] = [
  { from: "expected", to: "checked_in", label: "Check-in", requiresPermission: false },
  { from: "checked_in", to: "seated", label: "Sentar", requiresPermission: false },
  { from: "seated", to: "ordering", label: "Tomar carta", requiresPermission: false },
  { from: "ordering", to: "dining", label: "Servir", requiresPermission: false },
  { from: "dining", to: "dessert", label: "Postre", requiresPermission: false },
  { from: "dessert", to: "payment", label: "Facturar", requiresPermission: false },
  { from: "payment", to: "finished", label: "Cobrar", requiresPermission: false },
];

/* =========================================================
 * Tags
 * =======================================================*/
const ALL_TAGS: { id: string; label: string; icon: React.ElementType }[] = [
  { id: "VIP", label: "VIP", icon: Crown },
  { id: "Late", label: "Late", icon: Clock },
  { id: "Accessibility", label: "Accesibilidad", icon: Accessibility },
  { id: "Birthday", label: "Cumpleaños", icon: Cake },
  { id: "Allergy", label: "Alergia", icon: AlertCircle },
  { id: "PreferredTable", label: "Mesa preferente", icon: Armchair },
  { id: "PreferredWaiter", label: "Camarero preferente", icon: UserRound },
];

const TAG_TONES: Record<string, string> = {
  VIP: "bg-[var(--gold)]/12 text-[var(--gold-soft)] border-[var(--gold)]/30",
  Late: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  Accessibility: "bg-[var(--teal)]/10 text-[var(--teal)] border-[var(--teal)]/30",
  Birthday: "bg-fuchsia-400/10 text-fuchsia-300 border-fuchsia-400/30",
  Allergy: "bg-rose-400/10 text-rose-300 border-rose-400/30",
  PreferredTable: "bg-[var(--gold)]/10 text-[var(--gold-soft)] border-[var(--gold)]/25",
  PreferredWaiter: "bg-[var(--teal)]/10 text-[var(--teal)] border-[var(--teal)]/25",
};

/* =========================================================
 * Demo reservations
 * =======================================================*/
const INITIAL_RESERVATIONS: ReservationWithState[] = [
  {
    id: "r1",
    code: "RES-001",
    customerName: "Elena Marín",
    partySize: 4,
    date: "2025-12-12",
    time: "21:30",
    commercialState: "pending",
    operationalState: "expected",
    tags: ["VIP"],
    assignedTable: "M7",
    assignedZone: "VIP",
    history: [
      { at: "2025-12-08T10:14:00", action: "create", from: "—", to: "pending", by: "sistema", reason: "Reserva web" },
    ],
  },
  {
    id: "r2",
    code: "RES-002",
    customerName: "Familia Ruiz",
    partySize: 6,
    date: "2025-12-12",
    time: "14:00",
    commercialState: "confirmed",
    operationalState: "seated",
    tags: ["Birthday"],
    assignedTable: "M14",
    assignedZone: "Sala",
    history: [
      { at: "2025-12-05T12:00:00", action: "create", from: "—", to: "pending", by: "sistema" },
      { at: "2025-12-06T09:30:00", action: "confirm", from: "pending", to: "confirmed", by: "L. García" },
      { at: "2025-12-12T13:58:00", action: "check_in", from: "expected", to: "checked_in", by: "hostess" },
      { at: "2025-12-12T14:02:00", action: "seat", from: "checked_in", to: "seated", by: "M. Pérez", reason: "Mesa M14 lista" },
    ],
  },
  {
    id: "r3",
    code: "RES-003",
    customerName: "Javier Soler",
    partySize: 2,
    date: "2025-12-12",
    time: "13:30",
    commercialState: "confirmed",
    operationalState: "expected",
    tags: [],
    assignedTable: "M3",
    assignedZone: "Sala",
    history: [
      { at: "2025-12-10T18:22:00", action: "create", from: "—", to: "pending", by: "sistema" },
      { at: "2025-12-11T11:10:00", action: "confirm", from: "pending", to: "confirmed", by: "L. García" },
    ],
  },
  {
    id: "r4",
    code: "RES-004",
    customerName: "Marta Iborra",
    partySize: 3,
    date: "2025-12-11",
    time: "20:00",
    commercialState: "completed",
    operationalState: "finished",
    tags: ["VIP", "Allergy"],
    assignedTable: "M21",
    assignedZone: "VIP",
    history: [
      { at: "2025-12-04T20:00:00", action: "create", from: "—", to: "pending", by: "sistema" },
      { at: "2025-12-05T10:00:00", action: "confirm", from: "pending", to: "confirmed", by: "sistema" },
      { at: "2025-12-11T19:58:00", action: "check_in", from: "expected", to: "checked_in", by: "hostess" },
      { at: "2025-12-11T20:05:00", action: "seat", from: "checked_in", to: "seated", by: "M. Pérez" },
      { at: "2025-12-11T20:18:00", action: "order", from: "seated", to: "ordering", by: "A. Ruiz" },
      { at: "2025-12-11T21:00:00", action: "dining", from: "ordering", to: "dining", by: "A. Ruiz" },
      { at: "2025-12-11T21:40:00", action: "dessert", from: "dining", to: "dessert", by: "A. Ruiz" },
      { at: "2025-12-11T22:00:00", action: "payment", from: "dessert", to: "payment", by: "A. Ruiz" },
      { at: "2025-12-11T22:08:00", action: "finish", from: "payment", to: "finished", by: "L. García" },
      { at: "2025-12-11T22:08:00", action: "complete", from: "confirmed", to: "completed", by: "sistema" },
    ],
  },
  {
    id: "r5",
    code: "RES-005",
    customerName: "Andrés Vidal",
    partySize: 2,
    date: "2025-12-12",
    time: "22:00",
    commercialState: "cancelled",
    operationalState: "expected",
    tags: ["Late"],
    assignedTable: undefined,
    assignedZone: undefined,
    history: [
      { at: "2025-12-09T11:00:00", action: "create", from: "—", to: "pending", by: "sistema" },
      { at: "2025-12-09T11:30:00", action: "confirm", from: "pending", to: "confirmed", by: "L. García" },
      { at: "2025-12-12T22:18:00", action: "cancel", from: "confirmed", to: "cancelled", by: "L. García", reason: "Cliente retrasado > 20 min" },
    ],
  },
];

/* =========================================================
 * Reachability + tone helpers
 * =======================================================*/
function reachableCommercial(current: CommercialState): CommercialState[] {
  return COMMERCIAL_TRANSITIONS
    .filter((t) => t.from === current)
    .map((t) => t.to);
}
function reachableOperational(current: OperationalState): OperationalState[] {
  const ops = OPERATIONAL_TRANSITIONS.filter((t) => t.from === current).map((t) => t.to);
  // any state -> transferred (permission)
  if (current !== "transferred" && current !== "finished") ops.push("transferred");
  return ops;
}

function transitionLabelCommercial(from: CommercialState, to: CommercialState): { label: string; requiresPermission: boolean } {
  const t = COMMERCIAL_TRANSITIONS.find((tt) => tt.from === from && tt.to === to);
  if (t) return { label: t.label, requiresPermission: t.requiresPermission };
  // transferred-like defaults
  return { label: "Transición", requiresPermission: false };
}
function transitionLabelOperational(from: OperationalState, to: OperationalState): { label: string; requiresPermission: boolean } {
  if (to === "transferred") return { label: "Transferir", requiresPermission: true };
  const t = OPERATIONAL_TRANSITIONS.find((tt) => tt.from === from && tt.to === to);
  if (t) return { label: t.label, requiresPermission: t.requiresPermission };
  return { label: "Transición", requiresPermission: false };
}

/* =========================================================
 * History action tone
 * =======================================================*/
const HISTORY_TONE: Record<string, { text: string; bg: string; border: string; icon: React.ElementType; label: string }> = {
  create: { text: "text-emerald-300", bg: "bg-emerald-400/10", border: "border-emerald-400/30", icon: CheckCircle2, label: "Creada" },
  confirm: { text: "rp-gold-text", bg: "bg-[var(--gold)]/10", border: "border-[var(--gold)]/30", icon: ShieldCheck, label: "Confirmada" },
  modify: { text: "rp-teal-text", bg: "bg-[var(--teal)]/10", border: "border-[var(--teal)]/30", icon: Pencil, label: "Modificada" },
  cancel: { text: "text-rose-300", bg: "bg-rose-400/10", border: "border-rose-400/30", icon: Ban, label: "Cancelada" },
  no_show: { text: "text-rose-300", bg: "bg-rose-400/10", border: "border-rose-400/30", icon: UserX, label: "No show" },
  complete: { text: "text-emerald-300", bg: "bg-emerald-400/10", border: "border-emerald-400/30", icon: Flag, label: "Completada" },
  check_in: { text: "rp-teal-text", bg: "bg-[var(--teal)]/10", border: "border-[var(--teal)]/30", icon: LogIn, label: "Check-in" },
  seat: { text: "rp-teal-text", bg: "bg-[var(--teal)]/10", border: "border-[var(--teal)]/30", icon: Armchair, label: "Sentada" },
  order: { text: "rp-teal-text", bg: "bg-[var(--teal)]/10", border: "border-[var(--teal)]/30", icon: UtensilsCrossed, label: "Pidiendo" },
  dining: { text: "rp-teal-text", bg: "bg-[var(--teal)]/10", border: "border-[var(--teal)]/30", icon: UtensilsCrossed, label: "Comiendo" },
  dessert: { text: "rp-teal-text", bg: "bg-[var(--teal)]/10", border: "border-[var(--teal)]/30", icon: IceCreamBowl, label: "Postre" },
  payment: { text: "rp-gold-text", bg: "bg-[var(--gold)]/10", border: "border-[var(--gold)]/30", icon: CreditCard, label: "Pago" },
  finish: { text: "text-emerald-300", bg: "bg-emerald-400/10", border: "border-emerald-400/30", icon: CheckCircle2, label: "Finalizada" },
  transfer: { text: "text-fuchsia-300", bg: "bg-fuchsia-400/10", border: "border-fuchsia-400/30", icon: Share2, label: "Transferida" },
  move: { text: "rp-gold-text", bg: "bg-[var(--gold)]/10", border: "border-[var(--gold)]/30", icon: Move, label: "Movida" },
  tag: { text: "text-muted-foreground", bg: "bg-foreground/5", border: "border-foreground/15", icon: Star, label: "Etiqueta" },
};

function formatHistoryDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-ES", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

/* =========================================================
 * Component
 * =======================================================*/
export function StateMachine() {
  const reduce = useReducedMotion();
  const { toast } = useToast();

  const [reservations, setReservations] = React.useState<ReservationWithState[]>(INITIAL_RESERVATIONS);
  const [currentId, setCurrentId] = React.useState<string>(INITIAL_RESERVATIONS[1].id);
  const current = reservations.find((r) => r.id === currentId)!;

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogTarget, setDialogTarget] = React.useState<{ kind: "commercial" | "operational"; to: CommercialState | OperationalState; label: string; requiresPermission: boolean } | null>(null);
  const [reason, setReason] = React.useState("");
  const [managerApproved, setManagerApproved] = React.useState(false);

  // Drag & drop state
  const [dragZone, setDragZone] = React.useState<string | null>(null);
  const [dropTarget, setDropTarget] = React.useState<string | null>(null);
  const [revalidating, setRevalidating] = React.useState<string | null>(null);
  const [revalidation, setRevalidation] = React.useState<{ target: string; ok: boolean } | null>(null);

  const reachableComm = reachableCommercial(current.commercialState);
  const reachableOps = reachableOperational(current.operationalState);

  function openTransitionDialog(kind: "commercial" | "operational", to: CommercialState | OperationalState) {
    const meta = kind === "commercial"
      ? transitionLabelCommercial(current.commercialState, to as CommercialState)
      : transitionLabelOperational(current.operationalState, to as OperationalState);
    setDialogTarget({ kind, to, label: meta.label, requiresPermission: meta.requiresPermission });
    setReason("");
    setManagerApproved(false);
    setDialogOpen(true);
  }

  function confirmTransition() {
    if (!dialogTarget) return;
    if (dialogTarget.requiresPermission && !managerApproved) {
      toast({ title: "Permiso requerido", description: "Debes autorizar como Manager." });
      return;
    }
    const requiresReason =
      dialogTarget.to === "cancelled" || dialogTarget.to === "no_show" || dialogTarget.to === "transferred";
    if (requiresReason && !reason.trim()) {
      toast({ title: "Motivo requerido", description: "Añade un motivo para esta transición." });
      return;
    }

    const entry: HistoryEntry = {
      at: new Date().toISOString(),
      action: actionFor(dialogTarget),
      from: dialogTarget.kind === "commercial" ? current.commercialState : current.operationalState,
      to: dialogTarget.to,
      by: "Tú (demo)",
      reason: reason.trim() || undefined,
    };

    setReservations((prev) =>
      prev.map((r) =>
        r.id === current.id
          ? {
              ...r,
              commercialState: dialogTarget.kind === "commercial" ? (dialogTarget.to as CommercialState) : r.commercialState,
              operationalState: dialogTarget.kind === "operational" ? (dialogTarget.to as OperationalState) : r.operationalState,
              history: [...r.history, entry],
            }
          : r
      )
    );

    toast({
      title: "Transición registrada (demo)",
      description: `${dialogTarget.label}: ${entry.from} → ${entry.to}`,
    });
    setDialogOpen(false);
    setDialogTarget(null);
  }

  function toggleTag(tagId: string) {
    const has = current.tags.includes(tagId);
    const entry: HistoryEntry = {
      at: new Date().toISOString(),
      action: "tag",
      from: has ? tagId : "—",
      to: has ? "—" : tagId,
      by: "Tú (demo)",
      reason: has ? "Etiqueta retirada" : "Etiqueta añadida",
    };
    setReservations((prev) =>
      prev.map((r) =>
        r.id === current.id
          ? {
              ...r,
              tags: has ? r.tags.filter((t) => t !== tagId) : [...r.tags, tagId],
              history: [...r.history, entry],
            }
          : r
      )
    );
    toast({
      title: has ? "Etiqueta retirada (demo)" : "Etiqueta añadida (demo)",
      description: `${tagId} · entrada de auditoría registrada`,
    });
  }

  function exportHistory() {
    toast({ title: "Exportando historial (demo)", description: `${current.code} · ${current.history.length} entradas` });
  }

  /* ----- Drag & drop ----- */
  function onDragStart(e: React.DragEvent, res: ReservationWithState) {
    e.dataTransfer.setData("text/plain", res.id);
    e.dataTransfer.effectAllowed = "move";
    setDragZone(res.assignedZone || "Sala");
  }
  function onDragEnd() {
    setDragZone(null);
    setDropTarget(null);
  }
  function onDragOverSlot(e: React.DragEvent, slotKey: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(slotKey);
  }
  function onDropSlot(e: React.DragEvent, slotKey: string) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id !== current.id) return;
    setDropTarget(null);
    setRevalidating(slotKey);
    setRevalidation(null);
    setTimeout(() => {
      // simple deterministic "availability" check
      const ok = !slotKey.includes("VIP-21:30"); // demo block
      setRevalidation({ target: slotKey, ok });
      setRevalidating(null);
    }, 1000);
  }
  function confirmMove() {
    if (!revalidation || !revalidation.ok) return;
    const [newZone, newTime] = revalidation.target.split("-");
    const entry: HistoryEntry = {
      at: new Date().toISOString(),
      action: "move",
      from: `${current.assignedZone || "—"} · ${current.time}`,
      to: `${newZone} · ${newTime}`,
      by: "Tú (demo)",
      reason: "Reubicación tras revalidación de disponibilidad",
    };
    setReservations((prev) =>
      prev.map((r) =>
        r.id === current.id
          ? { ...r, assignedZone: newZone, time: newTime, history: [...r.history, entry] }
          : r
      )
    );
    toast({ title: "Reserva movida (demo)", description: `${current.code} → ${newZone} · ${newTime}` });
    setRevalidation(null);
  }
  function cancelMove() {
    setRevalidation(null);
    setRevalidating(null);
  }

  return (
    <div className="space-y-6">
      <Header />

      {/* Reservation selector */}
      <div className="rp-glass rounded-2xl p-5 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-5 items-end">
          <div className="space-y-2">
            <Label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Reserva seleccionada
            </Label>
            <Select value={currentId} onValueChange={setCurrentId}>
              <SelectTrigger className="bg-background/60 h-12">
                <SelectValue placeholder="Selecciona una reserva" />
              </SelectTrigger>
              <SelectContent>
                {reservations.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    <span className="font-mono">{r.code}</span> · {r.customerName} · {r.partySize} pax · {r.time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            <StateChip label="Comercial" value={COMMERCIAL_META[current.commercialState].label} dot={COMMERCIAL_META[current.commercialState].dot} />
            <StateChip label="Operativo" value={OPERATIONAL_META[current.operationalState].label} dot={OPERATIONAL_META[current.operationalState].dot} />
          </div>
        </div>

        {/* Reservation meta */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <KV label="Cliente" value={current.customerName} />
          <KV label="Comensales" value={`${current.partySize} pax`} />
          <KV label="Fecha" value={<span className="capitalize">{new Date(current.date + "T00:00:00").toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}</span>} />
          <KV label="Hora" value={<span className="font-mono">{current.time}</span>} />
          <KV label="Mesa" value={current.assignedTable || "—"} />
          <KV label="Zona" value={current.assignedZone || "—"} />
          <KV label="Etiquetas" value={current.tags.length ? current.tags.join(", ") : "—"} />
          <KV label="Historial" value={`${current.history.length} entradas`} />
        </div>
      </div>

      {/* Two-column state machines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <StateMachineCard
          title="Estado comercial"
          subtitle="pending → confirmed → modified → completed · branches to cancelled, no_show"
          tone="gold"
        >
          <StateMachineSVG
            nodes={COMMERCIAL_NODES}
            transitions={COMMERCIAL_TRANSITIONS.map((t) => ({ from: t.from, to: t.to, requiresPermission: t.requiresPermission }))}
            current={current.commercialState}
            reachable={reachableComm as (CommercialState | OperationalState)[]}
            meta={(s) => COMMERCIAL_META[s as CommercialState]}
            onNodeClick={(s) => openTransitionDialog("commercial", s as CommercialState)}
            reduce={reduce}
            viewBox="0 0 650 240"
            anyToTransferred={false}
          />
        </StateMachineCard>

        <StateMachineCard
          title="Estado operativo"
          subtitle="expected → checked_in → seated → ordering → dining → dessert → payment → finished · branch to transferred"
          tone="teal"
        >
          <StateMachineSVG
            nodes={OPERATIONAL_NODES}
            transitions={OPERATIONAL_TRANSITIONS.map((t) => ({ from: t.from, to: t.to, requiresPermission: t.requiresPermission }))}
            current={current.operationalState}
            reachable={reachableOps as (CommercialState | OperationalState)[]}
            meta={(s) => OPERATIONAL_META[s as OperationalState]}
            onNodeClick={(s) => openTransitionDialog("operational", s as OperationalState)}
            reduce={reduce}
            viewBox="0 0 540 330"
            anyToTransferred
          />
        </StateMachineCard>
      </div>

      {/* Tags */}
      <div className="rp-glass rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-4 w-4 rp-gold-text" />
          <h3 className="font-display text-lg sm:text-xl font-medium">Etiquetas y atributos</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map((t) => {
            const active = current.tags.includes(t.id);
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTag(t.id)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all min-h-[36px]",
                  active
                    ? TAG_TONES[t.id] || "border-foreground/30 bg-foreground/10"
                    : "border-border/50 bg-background/30 text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
                {active && <Check className="h-3 w-3 ml-0.5" />}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
          <span>
            Las etiquetas son atributos que coexisten con el estado. Una reserva VIP puede estar confirmada, sentada o comiendo simultáneamente.
          </span>
        </p>
      </div>

      {/* History timeline */}
      <div className="rp-glass rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 rp-teal-text" />
            <h3 className="font-display text-lg sm:text-xl font-medium">Historial inmutable</h3>
            <Badge variant="outline" className="font-mono text-[10px]">{current.history.length}</Badge>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={exportHistory}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Exportar historial
          </Button>
        </div>

        <div className="max-h-96 overflow-y-auto rp-scroll-thin pr-2">
          <ol className="relative space-y-3 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-border/60">
            {[...current.history].reverse().map((h, idx) => {
              const tone = HISTORY_TONE[h.action] || HISTORY_TONE.tag;
              const Icon = tone.icon;
              return (
                <motion.li
                  key={current.history.length - idx}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={reduce ? { duration: 0.001 } : { duration: 0.22, delay: Math.min(idx * 0.015, 0.3) }}
                  className="relative pl-7"
                >
                  <span className={cn("absolute left-0 top-2.5 h-3.5 w-3.5 rounded-full border-2", tone.border, tone.bg)}>
                    <span className={cn("absolute inset-0.5 rounded-full", tone.bg)} />
                  </span>
                  <div className="rounded-lg border border-border/40 bg-background/30 px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider", tone.border, tone.text, tone.bg)}>
                        <Icon className="h-3 w-3" />
                        {tone.label}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">{formatHistoryDate(h.at)}</span>
                      <span className="ml-auto text-[11px] font-mono text-muted-foreground">por {h.by}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm">
                      <span className="text-foreground/80">{h.from}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-foreground font-medium">{h.to}</span>
                    </div>
                    {h.reason && (
                      <div className="mt-1 text-xs text-muted-foreground italic">"{h.reason}"</div>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Drag & drop move */}
      <div className="rp-glass rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-1">
          <Move className="h-4 w-4 rp-gold-text" />
          <h3 className="font-display text-lg sm:text-xl font-medium">Mover reserva (drag &amp; drop)</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Arrastra la reserva a otra zona u horario. El motor revalida disponibilidad antes de aplicar el movimiento.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DRAG_COLUMNS.map((col) => (
            <div
              key={col.zone}
              className="rounded-xl border border-border/40 bg-background/30 p-3"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <col.icon className="h-3.5 w-3.5 rp-gold-text" />
                  <span className="font-medium text-sm">{col.zone}</span>
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">{col.slots.length} slots</Badge>
              </div>
              <div className="space-y-2">
                {col.slots.map((slot) => {
                  const slotKey = `${col.zone}-${slot.time}`;
                  const isCurrent = (current.assignedZone === col.zone || (!current.assignedZone && col.zone === "Sala")) && current.time === slot.time;
                  const isDropTarget = dropTarget === slotKey;
                  const isRevalidating = revalidating === slotKey;
                  const isRevalidated = revalidation?.target === slotKey;
                  const blockedHere = slot.blocked;
                  return (
                    <div
                      key={slot.time}
                      onDragOver={(e) => !blockedHere && onDragOverSlot(e, slotKey)}
                      onDrop={(e) => onDropSlot(e, slotKey)}
                      className={cn(
                        "rounded-lg border min-h-[64px] p-2.5 transition-colors",
                        blockedHere ? "border-foreground/10 bg-foreground/[0.02] opacity-50" : "border-border/40 bg-background/40",
                        isDropTarget && !blockedHere && "border-[var(--gold)]/60 bg-[var(--gold)]/5 ring-1 ring-[var(--gold)]/40",
                        isRevalidating && "border-[var(--teal)]/60 bg-[var(--teal)]/5"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-muted-foreground">{slot.time}</span>
                        {blockedHere ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-rose-300">
                            <Lock className="h-3 w-3" /> bloqueado
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-muted-foreground">{slot.cap} plazas</span>
                        )}
                      </div>

                      {/* Current reservation card */}
                      {isCurrent && current.commercialState !== "cancelled" && (
                        <motion.div
                          layout={reduce ? false : true}
                          draggable
                          onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, current)}
                          onDragEnd={onDragEnd}
                          className={cn(
                            "mt-2 cursor-grab active:cursor-grabbing rounded-md border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-2.5 py-2",
                            dragZone && dragZone !== col.zone && "opacity-60"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Move className="h-3 w-3 rp-gold-text" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium truncate">{current.customerName}</div>
                              <div className="text-[10px] font-mono text-muted-foreground">{current.code} · {current.partySize} pax</div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Revalidation status */}
                      <AnimatePresence>
                        {isRevalidating && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mt-2 flex items-center gap-2 text-[11px] text-[var(--teal)]"
                          >
                            <motion.span
                              animate={reduce ? {} : { rotate: 360 }}
                              transition={reduce ? {} : { repeat: Infinity, duration: 0.9, ease: "linear" }}
                              className="inline-block h-3 w-3 rounded-full border border-[var(--teal)]/30 border-t-[var(--teal)]"
                            />
                            Revalidando disponibilidad…
                          </motion.div>
                        )}
                        {isRevalidated && revalidation && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 space-y-2"
                          >
                            <div className={cn(
                              "flex items-center gap-1.5 text-[11px] font-mono",
                              revalidation.ok ? "text-emerald-300" : "text-rose-300"
                            )}>
                              {revalidation.ok ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              {revalidation.ok ? "Disponible" : "No disponible en ese horario"}
                            </div>
                            {revalidation.ok && (
                              <div className="flex gap-1.5">
                                <Button size="sm" className="h-7 text-[11px] bg-[var(--gold)] text-[#1a1a1a] hover:bg-[var(--gold-soft)]" onClick={confirmMove}>
                                  Confirmar
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={cancelMove}>
                                  Cancelar
                                </Button>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {current.commercialState === "cancelled" && (
          <div className="mt-3 flex items-center gap-2 text-xs text-rose-300">
            <Ban className="h-3.5 w-3.5" />
            Esta reserva está cancelada y no puede moverse.
          </div>
        )}
      </div>

      {/* Transition dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dialogTarget?.requiresPermission ? (
                <ShieldAlert className="h-4 w-4 text-amber-300" />
              ) : (
                <ArrowRight className="h-4 w-4 rp-gold-text" />
              )}
              Confirmar transición
            </DialogTitle>
            <DialogDescription>
              {dialogTarget?.kind === "commercial" ? "Estado comercial" : "Estado operativo"} · acción auditada
            </DialogDescription>
          </DialogHeader>

          {dialogTarget && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-center gap-3 rounded-lg border border-border/50 bg-background/40 px-4 py-3">
                <div className="text-center">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Desde</div>
                  <div className="mt-0.5 text-sm font-medium">
                    {dialogTarget.kind === "commercial"
                      ? COMMERCIAL_META[current.commercialState].label
                      : OPERATIONAL_META[current.operationalState].label}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="text-center">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Hacia</div>
                  <div className="mt-0.5 text-sm font-medium rp-gold-text">
                    {dialogTarget.kind === "commercial"
                      ? COMMERCIAL_META[dialogTarget.to as CommercialState].label
                      : OPERATIONAL_META[dialogTarget.to as OperationalState].label}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                  Acción
                </div>
                <div className="text-sm">{dialogTarget.label}</div>
              </div>

              {(dialogTarget.to === "cancelled" || dialogTarget.to === "no_show" || dialogTarget.to === "transferred") && (
                <div className="space-y-1.5">
                  <Label htmlFor="reason" className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    Motivo <span className="text-rose-300">*</span>
                  </Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Explica el motivo de esta transición (obligatorio)"
                    className="bg-background/60 min-h-[70px]"
                  />
                </div>
              )}

              {dialogTarget.requiresPermission && (
                <div className="rounded-lg border border-amber-400/30 bg-amber-400/[0.06] p-3">
                  <div className="flex items-center gap-2 text-amber-300 text-sm font-medium">
                    <ShieldAlert className="h-4 w-4" />
                    Esta acción requiere permiso de Manager
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Autorizar como Manager</span>
                    <button
                      type="button"
                      onClick={() => setManagerApproved((v) => !v)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors",
                        managerApproved
                          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                          : "border-border/50 bg-background/40 text-muted-foreground"
                      )}
                    >
                      {managerApproved ? <Check className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {managerApproved ? "Autorizado" : "Denegado"}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground pt-1">
                <ShieldCheck className="h-3 w-3" />
                Entrada de auditoría inmutable registrada
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmTransition}
              className="bg-[var(--gold)] text-[#1a1a1a] hover:bg-[var(--gold-soft)]"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirmar transición
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =========================================================
 * Subcomponents
 * =======================================================*/
function Header() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="font-display text-2xl sm:text-3xl font-light tracking-tight">
            Máquina de estados
          </h2>
          <Badge className="bg-amber-400/15 text-amber-300 border-amber-400/30 font-mono text-[10px] uppercase tracking-wider">
            demo
          </Badge>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Estados comercial y operativo · transiciones auditadas · permisos por rol · mover con revalidación.
        </p>
      </div>
      <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Auditoría activa
      </div>
    </div>
  );
}

function StateChip({ label, value, dot }: { label: string; value: string; dot: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-background/40 px-3 py-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: dot }} />
      <div className="leading-tight">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-xs font-medium">{value}</div>
      </div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/40 bg-background/30 px-3 py-2">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm text-foreground/90">{value}</div>
    </div>
  );
}

function StateMachineCard({
  title, subtitle, tone, children,
}: {
  title: string;
  subtitle: string;
  tone: "gold" | "teal";
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rp-glass rounded-2xl p-5 sm:p-6", tone === "gold" ? "rp-glow-gold" : "rp-glow-teal")}>
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className={cn("h-1.5 w-1.5 rounded-full", tone === "gold" ? "bg-[var(--gold)]" : "bg-[var(--teal)]")} />
          <h3 className="font-display text-lg sm:text-xl font-medium">{title}</h3>
        </div>
        <p className="mt-1 text-[11px] font-mono text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

/* =========================================================
 * StateMachineSVG — generic graph renderer
 * =======================================================*/
type AnyState = CommercialState | OperationalState;

interface SMNode { id: AnyState; x: number; y: number }
interface SMTransition { from: AnyState; to: AnyState; requiresPermission: boolean }

function StateMachineSVG({
  nodes, transitions, current, reachable, meta, onNodeClick, reduce, viewBox, anyToTransferred,
}: {
  nodes: SMNode[];
  transitions: SMTransition[];
  current: AnyState;
  reachable: AnyState[];
  meta: (s: AnyState) => { label: string; short: string; tone: string; dot: string };
  onNodeClick: (s: AnyState) => void;
  reduce: boolean | null;
  viewBox: string;
  anyToTransferred: boolean;
}) {
  const nodeMap = React.useMemo(() => {
    const m = new Map<AnyState, SMNode>();
    nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [nodes]);

  const NODE_R = 30;

  function isReachable(id: AnyState) {
    return reachable.includes(id);
  }
  function isCurrent(id: AnyState) {
    return id === current;
  }

  // arrow rendering
  function lineCoords(from: SMNode, to: SMNode) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    return {
      x1: from.x + ux * NODE_R,
      y1: from.y + uy * NODE_R,
      x2: to.x - ux * (NODE_R + 6),
      y2: to.y - uy * (NODE_R + 6),
    };
  }

  // For bidirectional pairs, offset the two arrows
  function getOffset(from: AnyState, to: AnyState): number {
    const hasReverse = transitions.some((t) => t.from === to && t.to === from);
    if (!hasReverse) return 0;
    // Offset perpendicular to line; sign based on order
    return from < to ? 4 : -4;
  }

  return (
    <div className="overflow-x-auto rp-scroll-thin -mx-2 px-2">
      <svg viewBox={viewBox} className="w-full min-w-[520px] h-auto" role="img" aria-label="Diagrama de estados">
        <defs>
          <marker id="arrow-default" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="currentColor" className="text-muted-foreground/60" />
          </marker>
          <marker id="arrow-reachable" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#D4AF37" />
          </marker>
          <marker id="arrow-permission" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#fbbf24" />
          </marker>
        </defs>

        {/* Transitions */}
        {transitions.map((t, i) => {
          const from = nodeMap.get(t.from)!;
          const to = nodeMap.get(t.to)!;
          if (!from || !to) return null;
          const c = lineCoords(from, to);
          const off = getOffset(t.from, t.to);
          // perpendicular vector
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const px = -dy / len;
          const py = dx / len;
          const mx = (c.x1 + c.x2) / 2 + px * off;
          const my = (c.y1 + c.y2) / 2 + py * off;

          const isReachableTransition =
            t.from === current && reachable.includes(t.to);

          const marker = t.requiresPermission
            ? "url(#arrow-permission)"
            : isReachableTransition
            ? "url(#arrow-reachable)"
            : "url(#arrow-default)";
          const stroke = t.requiresPermission
            ? "#fbbf24"
            : isReachableTransition
            ? "#D4AF37"
            : "color-mix(in oklab, var(--foreground) 22%, transparent)";

          return (
            <path
              key={i}
              d={`M ${c.x1} ${c.y1} Q ${mx} ${my} ${c.x2} ${c.y2}`}
              fill="none"
              stroke={stroke}
              strokeWidth={isReachableTransition ? 1.8 : 1.2}
              strokeDasharray={t.requiresPermission ? "4 3" : undefined}
              markerEnd={marker}
              opacity={isReachableTransition ? 1 : 0.6}
            />
          );
        })}

        {/* Any → transferred indicator */}
        {anyToTransferred && (
          <text
            x={nodeMap.get("transferred")?.x || 0}
            y={(nodeMap.get("transferred")?.y || 0) - NODE_R - 8}
            textAnchor="middle"
            className="fill-muted-foreground"
            style={{ fontSize: 9, fontFamily: "var(--font-mono)" }}
          >
            desde cualquier estado
          </text>
        )}

        {/* Nodes */}
        {nodes.map((n) => {
          const m = meta(n.id);
          const current = isCurrent(n.id);
          const reachableNode = isReachable(n.id);
          return (
            <g
              key={n.id}
              onClick={() => reachableNode && onNodeClick(n.id)}
              style={{ cursor: reachableNode ? "pointer" : "default" }}
              tabIndex={reachableNode ? 0 : -1}
              role={reachableNode ? "button" : undefined}
              aria-label={`${m.label}${reachableNode ? " — transición disponible" : ""}`}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && reachableNode) {
                  e.preventDefault();
                  onNodeClick(n.id);
                }
              }}
            >
              {/* glow ring for current */}
              {current && (
                <motion.circle
                  cx={n.x}
                  cy={n.y}
                  r={NODE_R + 6}
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth={1.5}
                  initial={reduce ? false : { opacity: 0.4, scale: 0.95 }}
                  animate={reduce ? { opacity: 0.8 } : { opacity: [0.4, 0.85, 0.4], scale: 1 }}
                  transition={reduce ? { duration: 0.001 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                />
              )}
              {/* reachable pulse */}
              {!current && reachableNode && (
                <motion.circle
                  cx={n.x}
                  cy={n.y}
                  r={NODE_R + 3}
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth={1}
                  strokeDasharray="3 2"
                  initial={reduce ? false : { opacity: 0.3 }}
                  animate={reduce ? { opacity: 0.6 } : { opacity: [0.3, 0.7, 0.3] }}
                  transition={reduce ? { duration: 0.001 } : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              {/* main circle */}
              <circle
                cx={n.x}
                cy={n.y}
                r={NODE_R}
                fill={current ? "color-mix(in oklab, #D4AF37 18%, transparent)" : reachableNode ? "color-mix(in oklab, var(--card) 80%, transparent)" : "color-mix(in oklab, var(--card) 50%, transparent)"}
                stroke={current ? "#D4AF37" : reachableNode ? "color-mix(in oklab, #D4AF37 60%, transparent)" : "color-mix(in oklab, var(--foreground) 18%, transparent)"}
                strokeWidth={current ? 2.5 : reachableNode ? 1.5 : 1}
                opacity={current || reachableNode ? 1 : 0.55}
              />
              {/* dot */}
              <circle cx={n.x} cy={n.y - 8} r={2.5} fill={m.dot} opacity={current || reachableNode ? 1 : 0.5} />
              {/* label */}
              <text
                x={n.x}
                y={n.y + 6}
                textAnchor="middle"
                className="fill-foreground"
                style={{ fontSize: 10, fontWeight: 500, fontFamily: "var(--font-sans)", opacity: current || reachableNode ? 1 : 0.6 }}
              >
                {m.short}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-mono text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-[var(--gold)] bg-[var(--gold)]/20" />
          Estado actual
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-dashed border-[var(--gold)]/70" />
          Transición disponible
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-amber-400/70" />
          Requiere permiso
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-foreground/20 bg-foreground/5" />
          No disponible
        </span>
      </div>
    </div>
  );
}

/* =========================================================
 * Drag & drop columns
 * =======================================================*/
const DRAG_COLUMNS: {
  zone: string;
  icon: React.ElementType;
  slots: { time: string; cap: number; blocked?: boolean }[];
}[] = [
  {
    zone: "Sala",
    icon: Armchair,
    slots: [
      { time: "13:00", cap: 12 },
      { time: "14:00", cap: 8 },
      { time: "15:00", cap: 14 },
    ],
  },
  {
    zone: "Terraza",
    icon: UtensilsCrossed,
    slots: [
      { time: "13:00", cap: 6 },
      { time: "14:00", cap: 0, blocked: true },
      { time: "15:00", cap: 6 },
    ],
  },
  {
    zone: "VIP",
    icon: Crown,
    slots: [
      { time: "20:00", cap: 4 },
      { time: "21:30", cap: 0, blocked: true },
      { time: "22:00", cap: 4 },
    ],
  },
];

/* =========================================================
 * Action label helper
 * =======================================================*/
function actionFor(target: { kind: "commercial" | "operational"; to: CommercialState | OperationalState }): string {
  if (target.kind === "commercial") {
    const s = target.to as CommercialState;
    if (s === "confirmed") return "confirm";
    if (s === "modified") return "modify";
    if (s === "cancelled") return "cancel";
    if (s === "no_show") return "no_show";
    if (s === "completed") return "complete";
    return "modify";
  }
  const s = target.to as OperationalState;
  if (s === "checked_in") return "check_in";
  if (s === "seated") return "seat";
  if (s === "ordering") return "order";
  if (s === "dining") return "dining";
  if (s === "dessert") return "dessert";
  if (s === "payment") return "payment";
  if (s === "finished") return "finish";
  if (s === "transferred") return "transfer";
  return "modify";
}
