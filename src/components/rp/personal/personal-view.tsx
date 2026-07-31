"use client";

/* ============================================================================
 * RestoPanel · Gestión de Personal
 * Tabs: Fichaje / Cuadrante / Rendimiento / Propinas
 * PIN pad · turnos · KPIs por camarero · reparto de propinas
 * ========================================================================== */

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Clock, CalendarDays, BarChart3, Coins, Fingerprint, QrCode,
  Lock, Delete, LogIn, LogOut, Play, Pause, Coffee, Crown,
  Plus, X, Pencil, ChevronLeft, ChevronRight, Sparkles,
  TrendingUp, TrendingDown, Star, CheckCircle2, AlertTriangle,
  ShieldCheck, Users, UserCheck, Timer, Award, Percent,
  HandCoins, Settings2, CalendarCheck, BellRing, BrainCircuit,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type PersonalTab = "fichaje" | "cuadrante" | "rendimiento" | "propinas";

type Role = "camarero" | "cocina" | "barra" | "maitre" | "gerente" | "ayudante";

type EmployeeStatus = "active" | "break" | "off" | "vacation" | "sick";

type ShiftType = "morning" | "afternoon" | "split" | "full" | "off";

interface Employee {
  id: string;
  nombre: string;
  rol: Role;
  pin: string;
  status: EmployeeStatus;
  horasContrato: number; // semanal
  horasSemana: number; // trabajadas
  ventas: number;
  ticketMedio: number;
  upsell: number;
  reseñas: number;
  propinas: number;
  salarioHora: number;
}

interface Fichaje {
  id: string;
  empleadoId: string;
  entrada: string; // ISO timestamp
  salida: string | null;
  pausas: { inicio: string; fin: string | null }[];
}

interface Shift {
  id: string;
  empleadoId: string;
  dia: number; // 0=lun .. 6=dom
  tipo: ShiftType;
  inicio: string; // HH:mm
  fin: string;
  nota?: string;
}

/* =========================================================
 * Static demo data
 * =======================================================*/
const EMPLOYEES_INIT: Employee[] = [
  { id: "e1", nombre: "Marta García", rol: "maitre", pin: "1234", status: "active", horasContrato: 40, horasSemana: 38, ventas: 4280, ticketMedio: 42.5, upsell: 18, reseñas: 4.8, propinas: 240, salarioHora: 14 },
  { id: "e2", nombre: "Pedro Sánchez", rol: "camarero", pin: "2345", status: "active", horasContrato: 40, horasSemana: 36, ventas: 3850, ticketMedio: 38.2, upsell: 14, reseñas: 4.6, propinas: 195, salarioHora: 11 },
  { id: "e3", nombre: "Lucía Romero", rol: "camarero", pin: "3456", status: "break", horasContrato: 35, horasSemana: 33, ventas: 4120, ticketMedio: 41.8, upsell: 22, reseñas: 4.9, propinas: 215, salarioHora: 11 },
  { id: "e4", nombre: "Andrés Vidal", rol: "cocina", pin: "4567", status: "active", horasContrato: 40, horasSemana: 40, ventas: 0, ticketMedio: 0, upsell: 0, reseñas: 0, propinas: 110, salarioHora: 12 },
  { id: "e5", nombre: "Sofía Mendoza", rol: "barra", pin: "5678", status: "active", horasContrato: 30, horasSemana: 28, ventas: 2980, ticketMedio: 14.2, upsell: 31, reseñas: 4.7, propinas: 165, salarioHora: 10 },
  { id: "e6", nombre: "Jorge López", rol: "cocina", pin: "6789", status: "off", horasContrato: 40, horasSemana: 40, ventas: 0, ticketMedio: 0, upsell: 0, reseñas: 0, propinas: 95, salarioHora: 12 },
  { id: "e7", nombre: "Elena Ruiz", rol: "camarero", pin: "7890", status: "active", horasContrato: 25, horasSemana: 22, ventas: 2480, ticketMedio: 36.5, upsell: 12, reseñas: 4.5, propinas: 135, salarioHora: 10 },
  { id: "e8", nombre: "Carlos Núñez", rol: "ayudante", pin: "8901", status: "vacation", horasContrato: 30, horasSemana: 0, ventas: 0, ticketMedio: 0, upsell: 0, reseñas: 0, propinas: 0, salarioHora: 9 },
  { id: "e9", nombre: "Carmen Díaz", rol: "gerente", pin: "9012", status: "active", horasContrato: 45, horasSemana: 44, ventas: 0, ticketMedio: 0, upsell: 0, reseñas: 0, propinas: 180, salarioHora: 18 },
];

const SHIFTS_INIT: Shift[] = [
  { id: "sh1", empleadoId: "e1", dia: 0, tipo: "full", inicio: "10:00", fin: "23:00" },
  { id: "sh2", empleadoId: "e2", dia: 0, tipo: "afternoon", inicio: "16:00", fin: "23:30" },
  { id: "sh3", empleadoId: "e3", dia: 0, tipo: "morning", inicio: "10:00", fin: "17:00" },
  { id: "sh4", empleadoId: "e4", dia: 0, tipo: "full", inicio: "09:00", fin: "23:00" },
  { id: "sh5", empleadoId: "e5", dia: 0, tipo: "afternoon", inicio: "17:00", fin: "00:00" },
  { id: "sh6", empleadoId: "e1", dia: 1, tipo: "full", inicio: "10:00", fin: "23:00" },
  { id: "sh7", empleadoId: "e2", dia: 1, tipo: "morning", inicio: "10:00", fin: "17:00" },
  { id: "sh8", empleadoId: "e3", dia: 1, tipo: "afternoon", inicio: "16:00", fin: "23:30" },
  { id: "sh9", empleadoId: "e7", dia: 1, tipo: "afternoon", inicio: "16:00", fin: "23:30" },
  { id: "sh10", empleadoId: "e4", dia: 1, tipo: "full", inicio: "09:00", fin: "23:00" },
  { id: "sh11", empleadoId: "e1", dia: 2, tipo: "full", inicio: "10:00", fin: "23:00" },
  { id: "sh12", empleadoId: "e3", dia: 2, tipo: "morning", inicio: "10:00", fin: "17:00" },
  { id: "sh13", empleadoId: "e7", dia: 2, tipo: "afternoon", inicio: "16:00", fin: "23:30" },
  { id: "sh14", empleadoId: "e5", dia: 2, tipo: "afternoon", inicio: "17:00", fin: "00:00" },
  { id: "sh15", empleadoId: "e9", dia: 3, tipo: "full", inicio: "11:00", fin: "23:30" },
  { id: "sh16", empleadoId: "e2", dia: 3, tipo: "afternoon", inicio: "16:00", fin: "23:30" },
  { id: "sh17", empleadoId: "e4", dia: 3, tipo: "full", inicio: "09:00", fin: "23:00" },
  { id: "sh18", empleadoId: "e1", dia: 4, tipo: "split", inicio: "10:00", fin: "23:00", nota: "Split 13-17" },
  { id: "sh19", empleadoId: "e3", dia: 4, tipo: "full", inicio: "10:00", fin: "23:00" },
  { id: "sh20", empleadoId: "e7", dia: 4, tipo: "morning", inicio: "10:00", fin: "17:00" },
  { id: "sh21", empleadoId: "e5", dia: 5, tipo: "afternoon", inicio: "17:00", fin: "00:00" },
  { id: "sh22", empleadoId: "e2", dia: 5, tipo: "full", inicio: "10:00", fin: "23:00" },
  { id: "sh23", empleadoId: "e9", dia: 5, tipo: "full", inicio: "11:00", fin: "23:30" },
  { id: "sh24", empleadoId: "e3", dia: 6, tipo: "afternoon", inicio: "16:00", fin: "23:30" },
  { id: "sh25", empleadoId: "e7", dia: 6, tipo: "afternoon", inicio: "16:00", fin: "23:30" },
];

const FICHAJES_INIT: Fichaje[] = [
  {
    id: "f1",
    empleadoId: "e1",
    entrada: "2025-04-11T10:02:00",
    salida: null,
    pausas: [{ inicio: "2025-04-11T14:30:00", fin: "2025-04-11T15:15:00" }],
  },
  {
    id: "f2",
    empleadoId: "e2",
    entrada: "2025-04-11T16:05:00",
    salida: null,
    pausas: [],
  },
  {
    id: "f3",
    empleadoId: "e3",
    entrada: "2025-04-11T10:00:00",
    salida: "2025-04-11T17:08:00",
    pausas: [{ inicio: "2025-04-11T13:00:00", fin: "2025-04-11T13:30:00" }],
  },
  {
    id: "f4",
    empleadoId: "e4",
    entrada: "2025-04-11T09:00:00",
    salida: null,
    pausas: [{ inicio: "2025-04-11T15:00:00", fin: null }],
  },
];

/* =========================================================
 * Constants & metadata
 * =======================================================*/
const ROLE_META: Record<
  Role,
  { label: string; cls: string; icon: React.ElementType }
> = {
  camarero: { label: "Camarero", cls: "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]", icon: Users },
  cocina: { label: "Cocina", cls: "border-[var(--rp-red)]/40 bg-[var(--rp-red)]/10 text-[var(--rp-red-soft)]", icon: Clock },
  barra: { label: "Barra", cls: "border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow-soft)]", icon: Coffee },
  maitre: { label: "Maitre", cls: "border-[var(--rp-violet)]/40 bg-[var(--rp-violet)]/10 text-[var(--rp-violet-soft)]", icon: Crown },
  gerente: { label: "Gerente", cls: "border-[var(--rp-blue)]/40 bg-[var(--rp-blue)]/10 text-[var(--rp-blue-soft)]", icon: ShieldCheck },
  ayudante: { label: "Ayudante", cls: "border-border/40 bg-foreground/[0.04] text-muted-foreground", icon: HandCoins },
};

const STATUS_META: Record<
  EmployeeStatus,
  { label: string; dot: string; cls: string }
> = {
  active: { label: "Activo", dot: "bg-[var(--rp-emerald)]", cls: "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]" },
  break: { label: "Pausa", dot: "bg-[var(--rp-yellow)]", cls: "border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow-soft)]" },
  off: { label: "Libre", dot: "bg-zinc-500", cls: "border-zinc-500/40 bg-zinc-500/10 text-zinc-400" },
  vacation: { label: "Vacaciones", dot: "bg-[var(--rp-blue)]", cls: "border-[var(--rp-blue)]/40 bg-[var(--rp-blue)]/10 text-[var(--rp-blue-soft)]" },
  sick: { label: "Baja", dot: "bg-[var(--rp-red)]", cls: "border-[var(--rp-red)]/40 bg-[var(--rp-red)]/10 text-[var(--rp-red-soft)]" },
};

const SHIFT_META: Record<
  ShiftType,
  { label: string; cls: string; border: string; icon: React.ElementType }
> = {
  morning: { label: "Mañana", cls: "bg-[var(--rp-yellow)]/15 text-[var(--rp-yellow-soft)]", border: "border-l-[var(--rp-yellow)]", icon: Clock },
  afternoon: { label: "Tarde", cls: "bg-[var(--rp-blue)]/15 text-[var(--rp-blue-soft)]", border: "border-l-[var(--rp-blue)]", icon: Clock },
  split: { label: "Split", cls: "bg-[var(--rp-violet)]/15 text-[var(--rp-violet-soft)]", border: "border-l-[var(--rp-violet)]", icon: Clock },
  full: { label: "Completo", cls: "bg-[var(--rp-emerald)]/15 text-[var(--rp-emerald-soft)]", border: "border-l-[var(--rp-emerald)]", icon: Clock },
  off: { label: "Libre", cls: "bg-foreground/[0.04] text-muted-foreground", border: "border-l-zinc-500", icon: X },
};

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const FRANJAS = [
  { id: "morning", label: "Mañana 10-17", start: 10, end: 17 },
  { id: "afternoon", label: "Tarde 16-23", start: 16, end: 23 },
  { id: "night", label: "Noche 22-00", start: 22, end: 24 },
];

/* =========================================================
 * Helpers
 * =======================================================*/
function euro(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function durationMin(inicio: string, fin: string): number {
  return Math.round((new Date(fin).getTime() - new Date(inicio).getTime()) / 60000);
}

function fmtDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/* =========================================================
 * DemoBadge + KPI card
 * =======================================================*/
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
  tone: "emerald" | "yellow" | "red" | "violet" | "blue";
}) {
  const toneCls = {
    emerald: "text-[var(--rp-emerald)]",
    yellow: "text-[var(--rp-yellow)]",
    red: "text-[var(--rp-red)]",
    violet: "text-[var(--rp-violet)]",
    blue: "text-[var(--rp-blue)]",
  }[tone];
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
 * Main view
 * =======================================================*/
export function PersonalView() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const t = reduce ? { duration: 0 } : { duration: 0.2, ease: "easeOut" as const };

  const [tab, setTab] = React.useState<PersonalTab>("fichaje");
  const [employees] = React.useState<Employee[]>(EMPLOYEES_INIT);
  const [shifts, setShifts] = React.useState<Shift[]>(SHIFTS_INIT);
  const [fichajes, setFichajes] = React.useState<Fichaje[]>(FICHAJES_INIT);
  const [semanaOffset, setSemanaOffset] = React.useState(0);

  // dialogs
  const [shiftDialog, setShiftDialog] = React.useState<{
    empleadoId?: string;
    dia?: number;
    shift?: Shift;
  } | null>(null);

  const [propinasConfigOpen, setPropinasConfigOpen] = React.useState(false);
  const [propinasConfig, setPropinasConfig] = React.useState<{
    modo: "horas" | "rol" | "ventas" | "mixto";
    pctCocina: number;
    pctSala: number;
    pctBarra: number;
  }>({ modo: "horas", pctCocina: 20, pctSala: 65, pctBarra: 15 });

  /* ----- derived ----- */
  const activeFichajes = fichajes.filter((f) => !f.salida);
  const fichadoresHoy = activeFichajes.length;
  const totalHorasHoy = fichajes.reduce((sum, f) => {
    const end = f.salida ?? new Date().toISOString();
    return sum + durationMin(f.entrada, end) / 60;
  }, 0);
  const totalPropinas = employees.reduce((sum, e) => sum + e.propinas, 0);
  const totalVentas = employees.reduce((sum, e) => sum + e.ventas, 0);
  const ticketMedioGlobal =
    employees.filter((e) => e.ventas > 0).reduce((s, e) => s + e.ticketMedio, 0) /
    Math.max(1, employees.filter((e) => e.ventas > 0).length);

  /* ----- handlers ----- */
  function fichar(empleadoId: string, tipo: "entrada" | "salida" | "pausa") {
    const emp = employees.find((e) => e.id === empleadoId);
    if (!emp) return;
    if (tipo === "entrada") {
      const nuevo: Fichaje = {
        id: `f${Date.now()}`,
        empleadoId,
        entrada: new Date().toISOString(),
        salida: null,
        pausas: [],
      };
      setFichajes((prev) => [...prev, nuevo]);
      toast({
        title: "Entrada fichada",
        description: `${emp.nombre} · ${fmtTime(nuevo.entrada)}`,
      });
    } else if (tipo === "salida") {
      setFichajes((prev) =>
        prev.map((f) =>
          f.empleadoId === empleadoId && !f.salida
            ? { ...f, salida: new Date().toISOString() }
            : f
        )
      );
      toast({
        title: "Salida fichada",
        description: emp.nombre,
      });
    } else if (tipo === "pausa") {
      setFichajes((prev) =>
        prev.map((f) => {
          if (f.empleadoId !== empleadoId || f.salida) return f;
          const pausaActiva = f.pausas.find((p) => !p.fin);
          if (pausaActiva) {
            return {
              ...f,
              pausas: f.pausas.map((p) =>
                p.inicio === pausaActiva.inicio
                  ? { ...p, fin: new Date().toISOString() }
                  : p
              ),
            };
          }
          return {
            ...f,
            pausas: [...f.pausas, { inicio: new Date().toISOString(), fin: null }],
          };
        })
      );
      toast({
        title: "Pausa toggled",
        description: emp.nombre,
      });
    }
  }

  function guardarShift(shift: Shift) {
    setShifts((prev) => {
      const exists = prev.some((s) => s.id === shift.id);
      return exists
        ? prev.map((s) => (s.id === shift.id ? shift : s))
        : [...prev, shift];
    });
    toast({
      title: "Turno guardado",
      description: `${employees.find((e) => e.id === shift.empleadoId)?.nombre} · ${DAYS[shift.dia]}`,
    });
    setShiftDialog(null);
  }

  function eliminarShift(id: string) {
    setShifts((prev) => prev.filter((s) => s.id !== id));
    toast({
      title: "Turno eliminado",
      variant: "destructive",
    });
  }

  /* ----- render ----- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
              Gestión de Personal
            </h1>
            <DemoBadge />
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Fichaje, cuadrante semanal, rendimiento por camarero y reparto de
            propinas. Datos demo · navegable.
          </p>
        </div>
      </header>

      {/* Tab bar */}
      <div className="relative">
        <div
          className="flex items-center gap-1 overflow-x-auto rp-scroll-thin pb-1 -mb-2"
          role="tablist"
          aria-label="Vistas de personal"
        >
          {([
            { id: "fichaje", label: "Fichaje", icon: Clock },
            { id: "cuadrante", label: "Cuadrante", icon: CalendarDays },
            { id: "rendimiento", label: "Rendimiento", icon: BarChart3 },
            { id: "propinas", label: "Propinas", icon: Coins },
          ] as const).map((tb) => (
            <button
              key={tb.id}
              role="tab"
              aria-selected={tab === tb.id}
              onClick={() => setTab(tb.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors min-h-[40px] border",
                tab === tb.id
                  ? "bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)] border-[var(--rp-emerald)]/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5 border-transparent"
              )}
            >
              <tb.icon className="h-4 w-4" aria-hidden />
              {tb.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          icon={UserCheck}
          label="Fichados ahora"
          value={String(fichadoresHoy)}
          caption={`de ${employees.length} empleados`}
          tone="emerald"
        />
        <KpiCard
          icon={Timer}
          label="Horas hoy"
          value={fmtDuration(Math.round(totalHorasHoy * 60))}
          caption="acumuladas en fichaje"
          tone="blue"
        />
        <KpiCard
          icon={Coins}
          label="Propinas"
          value={euro(totalPropinas)}
          caption="periodo en curso"
          tone="yellow"
        />
        <KpiCard
          icon={TrendingUp}
          label="Ticket medio"
          value={euro(ticketMedioGlobal)}
          caption="sala + barra"
          tone="violet"
        />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {tab === "fichaje" && (
          <motion.div
            key="fichaje"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={t}
          >
            <FichajePanel
              employees={employees}
              fichajes={fichajes}
              onFichar={fichar}
            />
          </motion.div>
        )}

        {tab === "cuadrante" && (
          <motion.div
            key="cuadrante"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={t}
          >
            <CuadrantePanel
              employees={employees}
              shifts={shifts}
              semanaOffset={semanaOffset}
              onSemanaOffset={setSemanaOffset}
              onShiftClick={(s) => setShiftDialog({ shift: s })}
              onCellClick={(empleadoId, dia) =>
                setShiftDialog({ empleadoId, dia })
              }
              onDeleteShift={eliminarShift}
            />
          </motion.div>
        )}

        {tab === "rendimiento" && (
          <motion.div
            key="rendimiento"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={t}
          >
            <RendimientoPanel employees={employees} totalVentas={totalVentas} />
          </motion.div>
        )}

        {tab === "propinas" && (
          <motion.div
            key="propinas"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={t}
          >
            <PropinasPanel
              employees={employees}
              totalPropinas={totalPropinas}
              config={propinasConfig}
              onConfig={() => setPropinasConfigOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialogs */}
      {shiftDialog && (
        <ShiftDialog
          open={!!shiftDialog}
          employees={employees}
          shift={shiftDialog.shift}
          empleadoId={shiftDialog.empleadoId}
          dia={shiftDialog.dia}
          onClose={() => setShiftDialog(null)}
          onSave={guardarShift}
          onDelete={(id) => {
            eliminarShift(id);
            setShiftDialog(null);
          }}
        />
      )}

      <PropinasConfigDialog
        open={propinasConfigOpen}
        onOpenChange={setPropinasConfigOpen}
        config={propinasConfig}
        onSave={(cfg) => {
          setPropinasConfig(cfg);
          setPropinasConfigOpen(false);
          toast({
            title: "Reparto actualizado",
            description: `Modo: ${cfg.modo} · Sala ${cfg.pctSala}% · Cocina ${cfg.pctCocina}% · Barra ${cfg.pctBarra}%`,
          });
        }}
      />
    </div>
  );
}

/* =========================================================
 * Fichaje panel — PIN pad + today's fichajes + normativa
 * =======================================================*/
function FichajePanel({
  employees,
  fichajes,
  onFichar,
}: {
  employees: Employee[];
  fichajes: Fichaje[];
  onFichar: (id: string, tipo: "entrada" | "salida" | "pausa") => void;
}) {
  const [selectedEmpId, setSelectedEmpId] = React.useState<string>(
    employees[0]?.id ?? ""
  );
  const [pinInput, setPinInput] = React.useState("");
  const [authMethod, setAuthMethod] = React.useState<"pin" | "qr" | "faceid" | "nfc">("pin");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selectedEmp = employees.find((e) => e.id === selectedEmpId);
  const fichajeActivo = fichajes.find(
    (f) => f.empleadoId === selectedEmpId && !f.salida
  );
  const enPausa = fichajeActivo?.pausas.some((p) => !p.fin) ?? false;

  React.useEffect(() => {
    if (authMethod === "pin") inputRef.current?.focus();
  }, [authMethod, selectedEmpId]);

  function handlePinSubmit() {
    if (!selectedEmp) return;
    if (pinInput !== selectedEmp.pin) {
      toastError("PIN incorrecto");
      setPinInput("");
      return;
    }
    if (fichajeActivo) {
      onFichar(selectedEmp.id, "salida");
    } else {
      onFichar(selectedEmp.id, "entrada");
    }
    setPinInput("");
  }

  // useToast inside component, but only in handlers — fine
  const { toast } = useToast();
  function toastError(msg: string) {
    toast({
      title: "Error",
      description: msg,
      variant: "destructive",
    });
  }

  function handlePadClick(d: string) {
    if (d === "del") {
      setPinInput((p) => p.slice(0, -1));
    } else if (d === "ok") {
      handlePinSubmit();
    } else if (pinInput.length < 4) {
      const next = pinInput + d;
      setPinInput(next);
      if (next.length === 4) {
        // auto-submit after a tick
        setTimeout(() => {
          if (selectedEmp && next === selectedEmp.pin) {
            if (fichajeActivo) onFichar(selectedEmp.id, "salida");
            else onFichar(selectedEmp.id, "entrada");
            setPinInput("");
          } else {
            toastError("PIN incorrecto");
            setPinInput("");
          }
        }, 120);
      }
    }
  }

  const fichajesHoy = fichajes
    .filter((f) => f.empleadoId === selectedEmpId)
    .sort((a, b) => b.entrada.localeCompare(a.entrada));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
      {/* Left: employee selector + PIN pad + actions */}
      <div className="space-y-4">
        {/* Employee selector */}
        <div className="rp-glass rounded-2xl p-4">
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Empleado
          </Label>
          <Select value={selectedEmpId} onValueChange={setSelectedEmpId}>
            <SelectTrigger className="bg-background/40 mt-1.5 h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {employees.map((e) => {
                const rm = ROLE_META[e.rol];
                return (
                  <SelectItem key={e.id} value={e.id}>
                    <span className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-foreground/[0.06]">
                          {initials(e.nombre)}
                        </AvatarFallback>
                      </Avatar>
                      {e.nombre}
                      <Badge variant="outline" className={cn("text-[9px] ml-1", rm.cls)}>
                        {rm.label}
                      </Badge>
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {selectedEmp && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/40">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-foreground/[0.06]">
                  {initials(selectedEmp.nombre)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{selectedEmp.nombre}</div>
                <div className="text-xs text-muted-foreground">
                  {ROLE_META[selectedEmp.rol].label} · {selectedEmp.horasContrato}h contrato
                </div>
              </div>
              <Badge variant="outline" className={cn("text-[10px]", STATUS_META[selectedEmp.status].cls)}>
                <span className={cn("h-1.5 w-1.5 rounded-full mr-1", STATUS_META[selectedEmp.status].dot)} />
                {STATUS_META[selectedEmp.status].label}
              </Badge>
            </div>
          )}
        </div>

        {/* Auth method tabs */}
        <div className="rp-glass rounded-2xl p-4">
          <div className="grid grid-cols-4 gap-1 mb-4" role="tablist" aria-label="Método de autenticación">
            {([
              { id: "pin", label: "PIN", icon: Lock },
              { id: "qr", label: "QR", icon: QrCode },
              { id: "faceid", label: "FaceID", icon: ShieldCheck },
              { id: "nfc", label: "NFC", icon: Fingerprint },
            ] as const).map((m) => (
              <button
                key={m.id}
                role="tab"
                aria-selected={authMethod === m.id}
                onClick={() => {
                  setAuthMethod(m.id);
                  setPinInput("");
                }}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 rounded-lg border text-[11px] font-medium transition-colors",
                  authMethod === m.id
                    ? "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]"
                    : "border-border/40 text-muted-foreground hover:bg-foreground/[0.04]"
                )}
              >
                <m.icon className="h-4 w-4" />
                {m.label}
              </button>
            ))}
          </div>

          {/* PIN pad */}
          {authMethod === "pin" && (
            <>
              <div className="flex items-center justify-center gap-2 mb-4 h-12">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-3 w-3 rounded-full border-2 transition-colors",
                      i < pinInput.length
                        ? "bg-[var(--rp-emerald)] border-[var(--rp-emerald)]"
                        : "border-border"
                    )}
                  />
                ))}
                <input
                  ref={inputRef}
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setPinInput(v);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handlePinSubmit();
                  }}
                  className="sr-only"
                  aria-label="PIN"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0", "ok"].map((d) => {
                  const isDel = d === "del";
                  const isOk = d === "ok";
                  return (
                    <button
                      key={d}
                      onClick={() => handlePadClick(d)}
                      className={cn(
                        "h-14 rounded-lg border font-display text-lg font-medium transition-colors",
                        isOk
                          ? "bg-[var(--rp-emerald)] text-black border-[var(--rp-emerald)] hover:bg-[var(--rp-emerald-soft)]"
                          : isDel
                            ? "border-[var(--rp-red)]/40 text-[var(--rp-red-soft)] hover:bg-[var(--rp-red)]/10"
                            : "border-border/40 hover:bg-foreground/[0.06]"
                      )}
                      aria-label={
                        isOk ? "Confirmar" : isDel ? "Borrar" : `Dígito ${d}`
                      }
                    >
                      {isOk ? (
                        <CheckCircle2 className="h-5 w-5 mx-auto" />
                      ) : isDel ? (
                        <Delete className="h-5 w-5 mx-auto" />
                      ) : (
                        d
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {authMethod !== "pin" && (
            <div className="text-center py-10">
              <div className="h-20 w-20 mx-auto rounded-2xl border-2 border-dashed border-border flex items-center justify-center mb-3 bg-foreground/[0.02]">
                {authMethod === "qr" && <QrCode className="h-8 w-8 text-muted-foreground" />}
                {authMethod === "faceid" && <ShieldCheck className="h-8 w-8 text-[var(--rp-emerald)]" />}
                {authMethod === "nfc" && <Fingerprint className="h-8 w-8 text-[var(--rp-blue)]" />}
              </div>
              <p className="text-sm text-muted-foreground">
                {authMethod === "qr" && "Escanea tu QR personal"}
                {authMethod === "faceid" && "Mira a la cámara"}
                {authMethod === "nfc" && "Acerca tu tarjeta NFC"}
              </p>
              <Button
                className="mt-4 bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
                onClick={() => {
                  if (!selectedEmp) return;
                  if (fichajeActivo) onFichar(selectedEmp.id, "salida");
                  else onFichar(selectedEmp.id, "entrada");
                }}
              >
                <LogIn className="h-4 w-4 mr-1" />
                {fichajeActivo ? "Fichar salida" : "Fichar entrada"}
              </Button>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="rp-glass rounded-2xl p-4 space-y-2">
          <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
            Acciones rápidas
          </div>
          <Button
            variant="outline"
            className="w-full border-[var(--rp-emerald)]/40 text-[var(--rp-emerald-soft)] hover:bg-[var(--rp-emerald)]/10"
            disabled={!fichajeActivo}
            onClick={() => selectedEmp && onFichar(selectedEmp.id, "pausa")}
          >
            {enPausa ? (
              <>
                <Play className="h-4 w-4 mr-1" /> Reanudar turno
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 mr-1" /> Iniciar pausa
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="w-full border-[var(--rp-red)]/40 text-[var(--rp-red-soft)] hover:bg-[var(--rp-red)]/10"
            disabled={!fichajeActivo}
            onClick={() => selectedEmp && onFichar(selectedEmp.id, "salida")}
          >
            <LogOut className="h-4 w-4 mr-1" /> Fichar salida
          </Button>
        </div>
      </div>

      {/* Right: today's fichajes + normativa */}
      <div className="space-y-4">
        {/* Current shift status */}
        <div className="rp-glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[var(--rp-emerald)]" />
              <h3 className="text-sm font-semibold">Estado actual</h3>
            </div>
            {fichajeActivo && (
              <Badge variant="outline" className="border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)] text-[10px]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--rp-emerald)] mr-1 animate-pulse" />
                En turno
              </Badge>
            )}
          </div>
          {fichajeActivo ? (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Entrada
                </div>
                <div className="text-lg font-display tabular-nums">
                  {fmtTime(fichajeActivo.entrada)}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Tiempo
                </div>
                <div className="text-lg font-display tabular-nums text-[var(--rp-emerald-soft)]">
                  {fmtDuration(durationMin(fichajeActivo.entrada, new Date().toISOString()))}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Pausas
                </div>
                <div className="text-lg font-display tabular-nums">
                  {fichajeActivo.pausas.length}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-3 text-center">
              Fuera de turno. Ficha entrada para empezar.
            </div>
          )}
        </div>

        {/* Today's fichajes */}
        <div className="rp-glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-[var(--rp-blue)]" />
              <h3 className="text-sm font-semibold">Fichajes de hoy</h3>
            </div>
            <Badge variant="outline" className="text-[10px]">
              {fichajesHoy.length}
            </Badge>
          </div>
          <Separator className="mb-3" />
          {fichajesHoy.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              Sin fichajes registrados hoy.
            </p>
          ) : (
            <div className="space-y-2">
              {fichajesHoy.map((f) => {
                const emp = employees.find((e) => e.id === f.empleadoId);
                const dur = durationMin(
                  f.entrada,
                  f.salida ?? new Date().toISOString()
                );
                const pausaMin = f.pausas.reduce((sum, p) => {
                  if (!p.fin) return sum;
                  return sum + durationMin(p.inicio, p.fin);
                }, 0);
                return (
                  <div
                    key={f.id}
                    className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-[10px] bg-foreground/[0.06]">
                        {emp ? initials(emp.nombre) : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {emp?.nombre}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {fmtTime(f.entrada)} → {f.salida ? fmtTime(f.salida) : "—"}
                        {f.pausas.length > 0 && ` · ${f.pausas.length} pausas`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono tabular-nums">
                        {fmtDuration(dur)}
                      </div>
                      {pausaMin > 0 && (
                        <div className="text-[10px] text-muted-foreground">
                          -{fmtDuration(pausaMin)} pausa
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cumplimiento normativa */}
        <div className="rp-glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-4 w-4 text-[var(--rp-violet)]" />
            <h3 className="text-sm font-semibold">Cumplimiento normativo</h3>
          </div>
          <Separator className="mb-3" />
          <div className="space-y-2 text-xs">
            <CumplimientoRow
              label="Jornada máxima diaria"
              value="9h"
              ok
              detail="Ningún empleado supera 9h/día"
            />
            <CumplimientoRow
              label="Descanso intradiario"
              value="15min"
              ok
              detail="Obligatorio a partir de 6h"
            />
            <CumplimientoRow
              label="Descanso entre jornadas"
              value="12h"
              ok
              detail="Cumplido en todos los turnos"
            />
            <CumplimientoRow
              label="Horas extra"
              value="+4h"
              warn
              detail="2 empleados esta semana"
            />
            <CumplimientoRow
              label="Descanso semanal"
              value="36h"
              ok
              detail="Todos tienen 1 día libre"
            />
            <CumplimientoRow
              label="Registro horario (RD 8/2019)"
              value="OK"
              ok
              detail="Fichaje obligatorio registrado"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CumplimientoRow({
  label,
  value,
  detail,
  ok,
  warn,
}: {
  label: string;
  value: string;
  detail: string;
  ok?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <div className="mt-0.5">
        {ok && <CheckCircle2 className="h-4 w-4 text-[var(--rp-emerald)]" />}
        {warn && <AlertTriangle className="h-4 w-4 text-[var(--rp-yellow)]" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-medium">{label}</span>
          <span
            className={cn(
              "font-mono text-[11px]",
              ok && "text-[var(--rp-emerald-soft)]",
              warn && "text-[var(--rp-yellow-soft)]"
            )}
          >
            {value}
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground">{detail}</div>
      </div>
    </div>
  );
}

/* =========================================================
 * Cuadrante panel — weekly grid × employees
 * =======================================================*/
function CuadrantePanel({
  employees,
  shifts,
  semanaOffset,
  onSemanaOffset,
  onShiftClick,
  onCellClick,
  onDeleteShift,
}: {
  employees: Employee[];
  shifts: Shift[];
  semanaOffset: number;
  onSemanaOffset: (n: number) => void;
  onShiftClick: (s: Shift) => void;
  onCellClick: (empleadoId: string, dia: number) => void;
  onDeleteShift: (id: string) => void;
}) {
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState<string | null>(null);

  function onDragStart(e: React.DragEvent, s: Shift) {
    e.dataTransfer.setData("text/plain", s.id);
    e.dataTransfer.effectAllowed = "move";
    setDragId(s.id);
  }
  function onDragEnd() {
    setDragId(null);
    setDragOver(null);
  }
  function onCellDragOver(e: React.DragEvent, empleadoId: string, dia: number) {
    if (!dragId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(`${empleadoId}-${dia}`);
  }
  function onCellDrop(e: React.DragEvent, empleadoId: string, dia: number) {
    if (!dragId) return;
    e.preventDefault();
    const shift = shifts.find((s) => s.id === dragId);
    if (!shift) return;
    // move shift to new cell — this calls onSave via parent
    if (shift.empleadoId !== empleadoId || shift.dia !== dia) {
      // We rely on parent's guardarShift; we trigger onShiftClick with the new shift
      onShiftClick({ ...shift, empleadoId, dia });
    }
    setDragId(null);
    setDragOver(null);
  }

  // Cobertura por franja y día
  const cobertura: Record<string, number[]> = {};
  for (const fr of FRANJAS) {
    cobertura[fr.id] = DAYS.map((_, diaIdx) => {
      return shifts.filter((s) => {
        if (s.dia !== diaIdx) return false;
        const startH = parseInt(s.inicio.split(":")[0], 10);
        const endH = parseInt(s.fin.split(":")[0], 10);
        return startH < fr.end && endH > fr.start;
      }).length;
    });
  }

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="rp-glass rounded-2xl p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onSemanaOffset(semanaOffset - 1)}
            aria-label="Semana anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium tabular-nums">
            Semana {semanaOffset === 0 ? "actual" : semanaOffset > 0 ? `+${semanaOffset}` : semanaOffset}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onSemanaOffset(semanaOffset + 1)}
            aria-label="Semana siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-[var(--rp-violet)]/40 bg-[var(--rp-violet)]/10 text-[var(--rp-violet-soft)] text-[10px]">
            <BrainCircuit className="h-3 w-3 mr-1" /> IA previsión
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {shifts.length} turnos
          </Badge>
        </div>
      </div>

      {/* Weekly grid — horizontal scroll on mobile */}
      <div className="rp-glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground bg-foreground/[0.03]">
              <tr>
                <th className="text-left px-3 py-2 sticky left-0 bg-[var(--card)]/95 backdrop-blur-sm z-10">
                  Empleado
                </th>
                {DAYS.map((d, i) => (
                  <th key={d} className="px-2 py-2 text-center min-w-[120px]">
                    {d}
                    <span className="block text-[10px] text-muted-foreground/70">
                      {new Date(2025, 3, 7 + i + semanaOffset * 7).toLocaleDateString("es-ES", { day: "2-digit" })}
                    </span>
                  </th>
                ))}
                <th className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const rm = ROLE_META[emp.rol];
                const totalHoras = shifts
                  .filter((s) => s.empleadoId === emp.id)
                  .reduce((sum, s) => {
                    const start = parseInt(s.inicio.split(":")[0], 10) * 60 + parseInt(s.inicio.split(":")[1], 10);
                    let end = parseInt(s.fin.split(":")[0], 10) * 60 + parseInt(s.fin.split(":")[1], 10);
                    if (end < start) end += 24 * 60;
                    return sum + (end - start) / 60;
                  }, 0);
                return (
                  <tr key={emp.id} className="border-t border-border/30">
                    <td className="px-3 py-2 sticky left-0 bg-[var(--card)]/95 backdrop-blur-sm z-10">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px] bg-foreground/[0.06]">
                            {initials(emp.nombre)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="text-xs font-medium truncate">{emp.nombre}</div>
                          <div className={cn("text-[10px]", rm.cls.replace(/border-[^ ]+ /, "").replace(/bg-[^ ]+ /, ""))}>
                            {rm.label}
                          </div>
                        </div>
                      </div>
                    </td>
                    {DAYS.map((_, dia) => {
                      const cellShifts = shifts.filter(
                        (s) => s.empleadoId === emp.id && s.dia === dia
                      );
                      const cellKey = `${emp.id}-${dia}`;
                      return (
                        <td
                          key={dia}
                          className={cn(
                            "px-1 py-1 align-top min-w-[120px]",
                            dragOver === cellKey && "bg-[var(--rp-emerald)]/10"
                          )}
                          onDragOver={(e) => onCellDragOver(e, emp.id, dia)}
                          onDragLeave={() => setDragOver(null)}
                          onDrop={(e) => onCellDrop(e, emp.id, dia)}
                        >
                          {cellShifts.length === 0 ? (
                            <button
                              onClick={() => onCellClick(emp.id, dia)}
                              className="w-full h-12 rounded-md border border-dashed border-border/40 text-[10px] text-muted-foreground hover:border-[var(--rp-emerald)]/40 hover:text-[var(--rp-emerald-soft)] hover:bg-[var(--rp-emerald)]/5 transition-colors"
                            >
                              <Plus className="h-3 w-3 mx-auto" />
                            </button>
                          ) : (
                            cellShifts.map((s) => {
                              const sm = SHIFT_META[s.tipo];
                              return (
                                <div
                                  key={s.id}
                                  draggable
                                  onDragStart={(e) => onDragStart(e, s)}
                                  onDragEnd={onDragEnd}
                                  onClick={() => onShiftClick(s)}
                                  className={cn(
                                    "rounded-md border border-l-2 p-1.5 mb-1 cursor-pointer hover:scale-[1.02] transition-transform",
                                    sm.border,
                                    sm.cls,
                                    dragId === s.id && "opacity-50"
                                  )}
                                >
                                  <div className="text-[10px] font-medium">
                                    {sm.label}
                                  </div>
                                  <div className="text-[10px] font-mono tabular-nums">
                                    {s.inicio}–{s.fin}
                                  </div>
                                  {s.nota && (
                                    <div className="text-[9px] text-muted-foreground italic truncate">
                                      {s.nota}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-right">
                      <div className="font-mono tabular-nums text-sm">
                        {totalHoras.toFixed(1)}h
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        /{emp.horasContrato}h
                      </div>
                      <div className="mt-1 w-12 ml-auto">
                        <Progress
                          value={(totalHoras / emp.horasContrato) * 100}
                          className="h-1"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-foreground/[0.03] text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              {FRANJAS.map((fr) => (
                <tr key={fr.id} className="border-t border-border/40">
                  <td className="px-3 py-2 sticky left-0 bg-[var(--card)]/95 backdrop-blur-sm">
                    {fr.label}
                  </td>
                  {cobertura[fr.id].map((count, dia) => {
                    const min = 3;
                    const tone =
                      count >= min
                        ? "text-[var(--rp-emerald-soft)]"
                        : count > 0
                          ? "text-[var(--rp-yellow-soft)]"
                          : "text-[var(--rp-red-soft)]";
                    return (
                      <td key={dia} className="px-2 py-2 text-center">
                        <span className={cn("font-medium tabular-nums", tone)}>
                          {count}
                        </span>
                        <span className="text-muted-foreground/60">/{min}</span>
                      </td>
                    );
                  })}
                  <td />
                </tr>
              ))}
            </tfoot>
          </table>
        </div>
      </div>

      {/* Cobertura alerts */}
      <div className="rp-glass rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <BellRing className="h-4 w-4 text-[var(--rp-yellow)]" />
          <h3 className="text-sm font-semibold">Cobertura por franja</h3>
        </div>
        <Separator className="mb-3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {FRANJAS.map((fr) => {
            const totalCobertura = cobertura[fr.id].reduce((s, n) => s + n, 0);
            const minTotal = FRANJAS.length * 3 * 7 / FRANJAS.length;
            const pct = Math.min(100, (totalCobertura / (minTotal * 7)) * 100);
            const tone =
              pct >= 80 ? "emerald" : pct >= 50 ? "yellow" : "red";
            const toneCls = {
              emerald: "text-[var(--rp-emerald-soft)]",
              yellow: "text-[var(--rp-yellow-soft)]",
              red: "text-[var(--rp-red-soft)]",
            }[tone];
            return (
              <div key={fr.id} className="rounded-lg border border-border/40 p-3">
                <div className="text-xs text-muted-foreground mb-1">{fr.label}</div>
                <div className="text-xl font-display font-medium tabular-nums">
                  {totalCobertura} turnos
                </div>
                <Progress value={pct} className="h-1.5 mt-2" />
                <div className={cn("text-[11px] mt-1", toneCls)}>
                  {pct.toFixed(0)}% cobertura
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hidden delete helper via shift dialog */}
      <span className="sr-only">
        <button onClick={() => onDeleteShift("")} />
      </span>
    </div>
  );
}

/* =========================================================
 * Rendimiento panel — table camarero × KPIs
 * =======================================================*/
function RendimientoPanel({
  employees,
  totalVentas,
}: {
  employees: Employee[];
  totalVentas: number;
}) {
  const vendedores = employees.filter((e) => e.ventas > 0);
  const maxVentas = Math.max(...vendedores.map((e) => e.ventas), 1);
  const maxUpsell = Math.max(...vendedores.map((e) => e.upsell), 1);

  return (
    <div className="space-y-4">
      {/* Top performers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {vendedores
          .slice()
          .sort((a, b) => b.ventas - a.ventas)
          .slice(0, 3)
          .map((emp, i) => {
            const tone = i === 0 ? "yellow" : i === 1 ? "violet" : "blue";
            const toneCls = {
              yellow: "text-[var(--rp-yellow)]",
              violet: "text-[var(--rp-violet)]",
              blue: "text-[var(--rp-blue)]",
            }[tone];
            return (
              <div key={emp.id} className="rp-glass rounded-2xl p-4 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                  <Award className={cn("h-4 w-4", toneCls)} />
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Top {i + 1}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-foreground/[0.06]">
                      {initials(emp.nombre)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{emp.nombre}</div>
                    <div className="text-xs text-muted-foreground">
                      {ROLE_META[emp.rol].label}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-display font-medium tabular-nums">
                  {euro(emp.ventas)}
                </div>
                <div className="text-xs text-muted-foreground">
                  ventas · ticket medio {euro(emp.ticketMedio)}
                </div>
              </div>
            );
          })}
      </div>

      {/* Detailed table */}
      <div className="rp-glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full text-sm">
            <thead className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground bg-foreground/[0.03]">
              <tr>
                <th className="text-left px-4 py-3">Camarero</th>
                <th className="text-right px-4 py-3">Ventas</th>
                <th className="text-right px-4 py-3 hidden sm:table-cell">Ticket medio</th>
                <th className="text-right px-4 py-3">Upsell</th>
                <th className="text-right px-4 py-3 hidden md:table-cell">Propinas</th>
                <th className="text-center px-4 py-3 hidden md:table-cell">Reseñas</th>
                <th className="text-right px-4 py-3">Rating</th>
              </tr>
            </thead>
            <tbody>
              {vendedores.map((emp) => (
                <tr key={emp.id} className="border-t border-border/40 hover:bg-foreground/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px] bg-foreground/[0.06]">
                          {initials(emp.nombre)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{emp.nombre}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {ROLE_META[emp.rol].label}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-mono tabular-nums font-medium">
                      {euro(emp.ventas)}
                    </div>
                    <div className="w-20 ml-auto mt-1">
                      <Progress value={(emp.ventas / maxVentas) * 100} className="h-1" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground hidden sm:table-cell">
                    {euro(emp.ticketMedio)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-mono tabular-nums">{emp.upsell}%</div>
                    <div className="w-20 ml-auto mt-1">
                      <Progress value={(emp.upsell / maxUpsell) * 100} className="h-1" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[var(--rp-yellow-soft)] hidden md:table-cell">
                    {euro(emp.propinas)}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground hidden md:table-cell">
                    {emp.reseñas > 0 ? `${emp.reseñas} reseñas` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-[var(--rp-yellow)]" />
                      <span className="font-mono tabular-nums font-medium">
                        {emp.reseñas > 0 ? emp.reseñas.toFixed(1) : "—"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-foreground/[0.03]">
              <tr className="border-t border-border/40 font-medium">
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">
                  {euro(totalVentas)}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground hidden sm:table-cell">
                  {euro(
                    vendedores.reduce((s, e) => s + e.ticketMedio, 0) / Math.max(1, vendedores.length)
                  )}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">
                  {Math.round(
                    vendedores.reduce((s, e) => s + e.upsell, 0) / Math.max(1, vendedores.length)
                  )}%
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-[var(--rp-yellow-soft)] hidden md:table-cell">
                  {euro(vendedores.reduce((s, e) => s + e.propinas, 0))}
                </td>
                <td className="px-4 py-3 hidden md:table-cell" />
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Propinas panel — total + config + reparto
 * =======================================================*/
function PropinasPanel({
  employees,
  totalPropinas,
  config,
  onConfig,
}: {
  employees: Employee[];
  totalPropinas: number;
  config: { modo: "horas" | "rol" | "ventas" | "mixto"; pctCocina: number; pctSala: number; pctBarra: number };
  onConfig: () => void;
}) {
  // Reparto según modo
  const reparto = React.useMemo(() => {
    if (config.modo === "horas") {
      const totalHoras = employees.reduce((s, e) => s + e.horasSemana, 0);
      return employees.map((e) => ({
        emp: e,
        monto: totalHoras > 0 ? (e.horasSemana / totalHoras) * totalPropinas : 0,
        base: e.horasSemana,
        baseLabel: `${e.horasSemana}h`,
      }));
    }
    if (config.modo === "ventas") {
      const totalVentas = employees.reduce((s, e) => s + e.ventas, 0);
      return employees.map((e) => ({
        emp: e,
        monto: totalVentas > 0 ? (e.ventas / totalVentas) * totalPropinas : 0,
        base: e.ventas,
        baseLabel: euro(e.ventas),
      }));
    }
    if (config.modo === "rol") {
      const rolePct: Record<Role, number> = {
        camarero: config.pctSala,
        maitre: config.pctSala,
        gerente: config.pctSala,
        cocina: config.pctCocina,
        barra: config.pctBarra,
        ayudante: config.pctCocina,
      };
      const totalPctRol = employees.reduce((s, e) => s + (rolePct[e.rol] || 0), 0);
      return employees.map((e) => ({
        emp: e,
        monto: totalPctRol > 0 ? ((rolePct[e.rol] || 0) / totalPctRol) * totalPropinas : 0,
        base: rolePct[e.rol] || 0,
        baseLabel: `${rolePct[e.rol] || 0}%`,
      }));
    }
    // mixto: 50% horas + 50% rol
    const totalHoras = employees.reduce((s, e) => s + e.horasSemana, 0);
    const rolePct: Record<Role, number> = {
      camarero: config.pctSala,
      maitre: config.pctSala,
      gerente: config.pctSala,
      cocina: config.pctCocina,
      barra: config.pctBarra,
      ayudante: config.pctCocina,
    };
    const totalPctRol = employees.reduce((s, e) => s + (rolePct[e.rol] || 0), 0);
    return employees.map((e) => ({
      emp: e,
      monto:
        (totalHoras > 0 ? (e.horasSemana / totalHoras) * (totalPropinas * 0.5) : 0) +
        (totalPctRol > 0 ? ((rolePct[e.rol] || 0) / totalPctRol) * (totalPropinas * 0.5) : 0),
      base: e.horasSemana,
      baseLabel: `${e.horasSemana}h + ${rolePct[e.rol] || 0}%`,
    }));
  }, [employees, totalPropinas, config]);

  return (
    <div className="space-y-4">
      {/* Total + config summary */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        <div className="rp-glass rounded-2xl p-5 flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-[var(--rp-yellow)]/15 text-[var(--rp-yellow-soft)] flex items-center justify-center">
            <Coins className="h-7 w-7" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Total propinas periodo
            </div>
            <div className="text-3xl font-display font-medium tabular-nums">
              {euro(totalPropinas)}
            </div>
            <div className="text-xs text-muted-foreground">
              {employees.length} empleados · {employees.filter((e) => e.propinas > 0).length} con reparto
            </div>
          </div>
        </div>
        <div className="rp-glass rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Modo de reparto
            </div>
            <div className="text-lg font-display font-medium capitalize mt-1">
              {config.modo}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full border-border/60"
            onClick={onConfig}
          >
            <Settings2 className="h-3.5 w-3.5 mr-1" /> Configurar reparto
          </Button>
        </div>
      </div>

      {/* Reparto table */}
      <div className="rp-glass rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HandCoins className="h-4 w-4 text-[var(--rp-yellow)]" />
            <h3 className="text-sm font-semibold">Reparto por empleado</h3>
          </div>
          <Badge variant="outline" className="text-[10px]">
            {config.modo}
          </Badge>
        </div>
        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full text-sm">
            <thead className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground bg-foreground/[0.03]">
              <tr>
                <th className="text-left px-4 py-2">Empleado</th>
                <th className="text-left px-4 py-2 hidden sm:table-cell">Rol</th>
                <th className="text-right px-4 py-2">
                  Base ({config.modo === "horas" ? "horas" : config.modo === "ventas" ? "€ ventas" : "% rol"})
                </th>
                <th className="text-right px-4 py-2">Reparto</th>
                <th className="text-right px-4 py-2 hidden md:table-cell">% total</th>
              </tr>
            </thead>
            <tbody>
              {reparto
                .sort((a, b) => b.monto - a.monto)
                .map(({ emp, monto, baseLabel }) => (
                  <tr key={emp.id} className="border-t border-border/40">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px] bg-foreground/[0.06]">
                            {initials(emp.nombre)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{emp.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 hidden sm:table-cell">
                      <Badge variant="outline" className={cn("text-[10px]", ROLE_META[emp.rol].cls)}>
                        {ROLE_META[emp.rol].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-muted-foreground tabular-nums">
                      {baseLabel}
                    </td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums text-[var(--rp-yellow-soft)] font-medium">
                      {euro(monto)}
                    </td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums text-muted-foreground hidden md:table-cell">
                      {totalPropinas > 0 ? ((monto / totalPropinas) * 100).toFixed(1) : "0.0"}%
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Shift dialog
 * =======================================================*/
function ShiftDialog({
  open,
  employees,
  shift,
  empleadoId,
  dia,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  employees: Employee[];
  shift?: Shift;
  empleadoId?: string;
  dia?: number;
  onClose: () => void;
  onSave: (shift: Shift) => void;
  onDelete: (id: string) => void;
}) {
  const [form, setForm] = React.useState<Shift>(() =>
    shift ?? {
      id: `sh${Date.now()}`,
      empleadoId: empleadoId ?? employees[0]?.id ?? "",
      dia: dia ?? 0,
      tipo: "morning",
      inicio: "10:00",
      fin: "17:00",
    }
  );

  React.useEffect(() => {
    if (shift) setForm(shift);
    else
      setForm({
        id: `sh${Date.now()}`,
        empleadoId: empleadoId ?? employees[0]?.id ?? "",
        dia: dia ?? 0,
        tipo: "morning",
        inicio: "10:00",
        fin: "17:00",
      });
  }, [shift, empleadoId, dia, employees]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rp-glass-strong">
        <DialogHeader>
          <DialogTitle>{shift ? "Editar turno" : "Nuevo turno"}</DialogTitle>
          <DialogDescription>
            Asigna empleado, día, tipo de turno y horario.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="col-span-2">
            <Label htmlFor="sh-emp">Empleado</Label>
            <Select
              value={form.empleadoId}
              onValueChange={(v) => setForm({ ...form, empleadoId: v })}
            >
              <SelectTrigger id="sh-emp" className="bg-background/40 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="sh-dia">Día</Label>
            <Select
              value={String(form.dia)}
              onValueChange={(v) => setForm({ ...form, dia: +v })}
            >
              <SelectTrigger id="sh-dia" className="bg-background/40 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((d, i) => (
                  <SelectItem key={d} value={String(i)}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="sh-tipo">Tipo</Label>
            <Select
              value={form.tipo}
              onValueChange={(v: ShiftType) => setForm({ ...form, tipo: v })}
            >
              <SelectTrigger id="sh-tipo" className="bg-background/40 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SHIFT_META) as ShiftType[]).map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {SHIFT_META[tipo].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="sh-inicio">Inicio</Label>
            <Input
              id="sh-inicio"
              type="time"
              value={form.inicio}
              onChange={(e) => setForm({ ...form, inicio: e.target.value })}
              className="bg-background/40 mt-1"
            />
          </div>
          <div>
            <Label htmlFor="sh-fin">Fin</Label>
            <Input
              id="sh-fin"
              type="time"
              value={form.fin}
              onChange={(e) => setForm({ ...form, fin: e.target.value })}
              className="bg-background/40 mt-1"
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="sh-nota">Nota</Label>
            <Input
              id="sh-nota"
              value={form.nota ?? ""}
              onChange={(e) => setForm({ ...form, nota: e.target.value })}
              className="bg-background/40 mt-1"
              placeholder="ej. Split 13-17"
            />
          </div>
        </div>
        <DialogFooter>
          {shift && (
            <Button
              variant="ghost"
              className="mr-auto text-[var(--rp-red-soft)] hover:text-[var(--rp-red)]"
              onClick={() => onDelete(shift.id)}
            >
              <X className="h-4 w-4 mr-1" /> Eliminar
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
            onClick={() => onSave(form)}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" /> Guardar turno
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Propinas config dialog
 * =======================================================*/
function PropinasConfigDialog({
  open,
  onOpenChange,
  config,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  config: { modo: "horas" | "rol" | "ventas" | "mixto"; pctCocina: number; pctSala: number; pctBarra: number };
  onSave: (cfg: { modo: "horas" | "rol" | "ventas" | "mixto"; pctCocina: number; pctSala: number; pctBarra: number }) => void;
}) {
  const [form, setForm] = React.useState(config);
  React.useEffect(() => setForm(config), [config]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rp-glass-strong">
        <DialogHeader>
          <DialogTitle>Configurar reparto de propinas</DialogTitle>
          <DialogDescription>
            Define el modo de reparto entre empleados.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label>Modo de reparto</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {([
                { id: "horas", label: "Por horas", desc: "Reparto proporcional a horas trabajadas" },
                { id: "rol", label: "Por rol", desc: "% fijo por rol: sala, cocina, barra" },
                { id: "ventas", label: "Por ventas", desc: "Reparto proporcional a ventas generadas" },
                { id: "mixto", label: "Mixto 50/50", desc: "Mitad por horas + mitad por rol" },
              ] as const).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setForm({ ...form, modo: m.id })}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors",
                    form.modo === m.id
                      ? "border-[var(--rp-emerald)]/50 bg-[var(--rp-emerald)]/10"
                      : "border-border/40 hover:bg-foreground/[0.04]"
                  )}
                >
                  <div className="text-sm font-medium">{m.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>
          {(form.modo === "rol" || form.modo === "mixto") && (
            <div className="space-y-3 pt-3 border-t border-border/40">
              <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Reparto por rol (%)
              </div>
              {([
                { key: "pctSala", label: "Sala", tone: "emerald" },
                { key: "pctCocina", label: "Cocina", tone: "red" },
                { key: "pctBarra", label: "Barra", tone: "yellow" },
              ] as const).map((row) => (
                <div key={row.key}>
                  <Label className="flex items-center justify-between">
                    <span>{row.label}</span>
                    <span className="font-mono tabular-nums">{form[row.key]}%</span>
                  </Label>
                  <Input
                    type="range"
                    min={0}
                    max={100}
                    value={form[row.key]}
                    onChange={(e) => setForm({ ...form, [row.key]: +e.target.value })}
                    className="mt-1"
                  />
                </div>
              ))}
              <div className="text-xs text-muted-foreground">
                Total: {form.pctSala + form.pctCocina + form.pctBarra}%
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
            onClick={() => onSave(form)}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" /> Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
