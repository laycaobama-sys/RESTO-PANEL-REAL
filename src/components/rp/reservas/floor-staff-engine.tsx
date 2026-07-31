"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Armchair,
  ArrowRightLeft,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Crown,
  Gauge,
  Info,
  Layers,
  MapPin,
  Sparkles,
  TriangleAlert,
  Users,
  Utensils,
  Wine,
  Receipt,
  BrushCleaning,
  XCircle,
  Zap,
  TrendingUp,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type LoadState = "IDLE" | "OPTIMAL" | "HEAVY" | "OVERLOADED";

type TableState =
  | "ordering"
  | "dining"
  | "dessert"
  | "drinks"
  | "paying"
  | "cleaning";

interface TableLoad {
  tableId: string;
  tableName: string;
  zone: string;
  partySize: number;
  state: TableState;
  basePoints: number;
  sizeMultiplier: number;
  incidentMultiplier: number;
  vipMultiplier: number;
  distancePenalty: number;
  totalPoints: number;
  hasIncident: boolean;
  isVIP: boolean;
  incidentType?: string;
}

interface StaffLoadV2 {
  id: string;
  name: string;
  avatar: string;
  role: string;
  zone: string;
  assignedTables: TableLoad[];
  totalLoadPoints: number;
  loadState: LoadState;
  capacity: number;
  utilizationPct: number;
  recommendations: string[];
}

/* =========================================================
 * Constants — base points by table state
 * =======================================================*/
const STATE_BASE_POINTS: Record<TableState, number> = {
  ordering: 3,
  drinks: 2,
  dining: 2,
  dessert: 1,
  paying: 1,
  cleaning: 0.5,
};

const STATE_META: Record<
  TableState,
  { label: string; icon: React.ElementType; tone: string }
> = {
  ordering: { label: "Pidiendo", icon: Utensils, tone: "text-amber-300" },
  drinks: { label: "Bebidas", icon: Wine, tone: "rp-teal-text" },
  dining: { label: "Comiendo", icon: Utensils, tone: "text-emerald-300" },
  dessert: { label: "Postre", icon: Utensils, tone: "text-purple-300" },
  paying: { label: "Pagando", icon: Receipt, tone: "text-sky-300" },
  cleaning: { label: "Limpiando", icon: BrushCleaning, tone: "text-zinc-300" },
};

function sizeMultiplierFor(party: number): number {
  if (party <= 2) return 1;
  if (party <= 4) return 1.3;
  if (party <= 6) return 1.6;
  return 2;
}

function incidentMultiplierFor(incidentType?: string): number {
  if (!incidentType) return 1;
  switch (incidentType) {
    case "KitchenDelay":
      return 3;
    case "CustomerIssue":
      return 2;
    case "BrokenTable":
      return 1.5;
    default:
      return 1;
  }
}

function loadStateFor(total: number): LoadState {
  if (total < 15) return "IDLE";
  if (total <= 35) return "OPTIMAL";
  if (total <= 60) return "HEAVY";
  return "OVERLOADED";
}

/* =========================================================
 * Load state meta
 * =======================================================*/
const LOAD_STATE_META: Record<
  LoadState,
  {
    label: string;
    dot: string;
    text: string;
    border: string;
    bg: string;
    gauge: string;
    ring: string;
    description: string;
  }
> = {
  IDLE: {
    label: "IDLE",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    border: "border-emerald-400/40",
    bg: "bg-emerald-400/10",
    gauge: "text-emerald-400",
    ring: "ring-emerald-400/30",
    description: "Disponible · capacidad sobrada",
  },
  OPTIMAL: {
    label: "OPTIMAL",
    dot: "bg-[var(--teal)]",
    text: "rp-teal-text",
    border: "border-[var(--teal)]/40",
    bg: "bg-[var(--teal)]/10",
    gauge: "text-[var(--teal)]",
    ring: "ring-[var(--teal)]/30",
    description: "Rendimiento óptimo",
  },
  HEAVY: {
    label: "HEAVY",
    dot: "bg-[var(--gold)]",
    text: "rp-gold-text",
    border: "border-[var(--gold)]/40",
    bg: "bg-[var(--gold)]/10",
    gauge: "text-[var(--gold)]",
    ring: "ring-[var(--gold)]/30",
    description: "Carga alta · monitorizar",
  },
  OVERLOADED: {
    label: "OVERLOADED",
    dot: "bg-red-400",
    text: "text-red-300",
    border: "border-red-400/50",
    bg: "bg-red-400/10",
    gauge: "text-red-400",
    ring: "ring-red-400/40",
    description: "Saturado · reasignar urgente",
  },
};

/* =========================================================
 * Zone meta
 * =======================================================*/
const ZONE_META: Record<
  string,
  { label: string; color: string; bg: string; border: string; text: string }
> = {
  Sala: {
    label: "Sala",
    color: "var(--gold)",
    bg: "bg-[var(--gold)]/10",
    border: "border-[var(--gold)]/40",
    text: "text-[var(--gold-soft)]",
  },
  Terraza: {
    label: "Terraza",
    color: "var(--teal)",
    bg: "bg-[var(--teal)]/10",
    border: "border-[var(--teal)]/40",
    text: "rp-teal-text",
  },
  VIP: {
    label: "VIP",
    color: "#C084FC",
    bg: "bg-purple-400/10",
    border: "border-purple-400/40",
    text: "text-purple-300",
  },
  Barra: {
    label: "Barra",
    color: "#F59E0B",
    bg: "bg-amber-400/10",
    border: "border-amber-400/40",
    text: "text-amber-300",
  },
  Todas: {
    label: "Todas",
    color: "var(--gold)",
    bg: "bg-foreground/[0.06]",
    border: "border-border/50",
    text: "text-muted-foreground",
  },
};

/* =========================================================
 * Helpers
 * =======================================================*/
function initials(name: string): string {
  const parts = name.split(" ");
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

function avatarGradient(name: string): string {
  const grads = [
    "from-amber-400/80 to-[var(--gold-deep)]",
    "from-[var(--teal)]/80 to-[var(--teal-deep)]",
    "from-purple-400/80 to-purple-700",
    "from-rose-400/80 to-rose-700",
    "from-sky-400/80 to-sky-700",
    "from-emerald-400/80 to-emerald-700",
  ];
  const idx = name.charCodeAt(0) % grads.length;
  return grads[idx];
}

function formatPoints(n: number): string {
  return n.toFixed(n % 1 === 0 ? 0 : 1);
}

function makeTable(
  tableId: string,
  tableName: string,
  zone: string,
  partySize: number,
  state: TableState,
  incidentType?: string,
  isVIP: boolean = false,
  distancePenalty: number = 0,
): TableLoad {
  const basePoints = STATE_BASE_POINTS[state];
  const sizeMultiplier = sizeMultiplierFor(partySize);
  const incidentMultiplier = incidentMultiplierFor(incidentType);
  const vipMultiplier = isVIP ? 1.5 : 1;
  const hasIncident = !!incidentType;
  const totalPoints =
    basePoints * sizeMultiplier * incidentMultiplier * vipMultiplier +
    distancePenalty;
  return {
    tableId,
    tableName,
    zone,
    partySize,
    state,
    basePoints,
    sizeMultiplier,
    incidentMultiplier,
    vipMultiplier,
    distancePenalty,
    totalPoints: Math.round(totalPoints * 100) / 100,
    hasIncident,
    isVIP,
    incidentType,
  };
}

function makeStaff(
  id: string,
  name: string,
  role: string,
  zone: string,
  assignedTables: TableLoad[],
  recommendations: string[] = [],
  capacity: number = 60,
  totalLoadPointsOverride?: number,
): StaffLoadV2 {
  const sum = assignedTables.reduce((a, t) => a + t.totalPoints, 0);
  const total = totalLoadPointsOverride ?? Math.round(sum * 100) / 100;
  const loadState = loadStateFor(total);
  const utilizationPct = Math.round((total / capacity) * 100);
  return {
    id,
    name,
    avatar: initials(name),
    role,
    zone,
    assignedTables,
    totalLoadPoints: total,
    loadState,
    capacity,
    utilizationPct: Math.min(150, utilizationPct),
    recommendations,
  };
}

/* =========================================================
 * Demo data — staff with cognitive load
 * =======================================================*/
const DEMO_STAFF_V2: StaffLoadV2[] = [
  makeStaff(
    "ST1",
    "Carlos Mendoza",
    "Camarero",
    "Terraza",
    [
      makeTable("M3", "Mesa M3", "Terraza", 4, "ordering", "KitchenDelay"),
      makeTable("M5", "Mesa M5", "Terraza", 6, "ordering", "KitchenDelay"),
      makeTable("M9", "Mesa M9", "Terraza", 4, "ordering", "KitchenDelay"),
      makeTable("M12", "Mesa M12", "Terraza", 6, "drinks", "KitchenDelay"),
      makeTable("M15", "Mesa M15", "Terraza", 6, "ordering", "KitchenDelay"),
      makeTable("T2", "Mesa T2", "Terraza", 4, "paying"),
    ],
    [
      "Reasignar M9 a María (mismo turno, misma zona adyacente)",
      "Pedir refuerzo a Laura para M15 durante el rush",
    ],
  ),
  makeStaff(
    "ST2",
    "María García",
    "Camarero",
    "Sala",
    [
      makeTable("M5", "Mesa M5", "Sala", 2, "dessert"),
      makeTable("M8", "Mesa M8", "Sala", 4, "cleaning"),
      makeTable("M10", "Mesa M10", "Sala", 2, "ordering"),
    ],
    [],
  ),
  makeStaff(
    "ST3",
    "Juan Ruiz",
    "Camarero",
    "VIP",
    [
      makeTable("V1", "Mesa V1", "VIP", 4, "dining", undefined, true),
      makeTable("V3", "Mesa V3", "VIP", 2, "drinks", undefined, true),
      makeTable("V5", "Mesa V5", "VIP", 2, "ordering", undefined, true),
      makeTable("V7", "Mesa V7", "VIP", 4, "ordering", undefined, true),
    ],
    ["Mantener asignación — VIP requiere experiencia"],
  ),
  makeStaff(
    "ST4",
    "Laura Torres",
    "Maître",
    "Sala",
    [],
    [
      "Disponible para supervisión y refuerzo puntual",
      "Puede absorber 1-2 mesas de Terraza si necesario",
    ],
  ),
  // Pedro is a Runner — his load is computed from deliveries, not tables.
  makeStaff(
    "ST5",
    "Pedro Sánchez",
    "Runner",
    "Todas",
    [],
    ["Logística estable — 5 entregas activas (22pts)"],
    60,
    22,
  ),
  makeStaff(
    "ST6",
    "Ana López",
    "Camarero",
    "Barra",
    [
      makeTable("B1", "Barra B1", "Barra", 2, "ordering"),
      makeTable("B2", "Barra B2", "Barra", 3, "drinks", "KitchenDelay"),
      makeTable("B3", "Barra B3", "Barra", 2, "dining", undefined, false, 2),
      makeTable(
        "B5",
        "Barra B5",
        "Barra",
        4,
        "ordering",
        "KitchenDelay",
        false,
        1.5,
      ),
    ],
    ["Reducir B5 distance penalty reasignando a runner temporal"],
  ),
];

/* =========================================================
 * Demo zone summaries
 * =======================================================*/
interface ZoneLoadSummary {
  zone: string;
  totalPoints: number;
  staffCount: number;
  avgLoad: number;
  capacity: number;
  demand: number;
}

function computeZoneSummaries(staff: StaffLoadV2[]): ZoneLoadSummary[] {
  const zones = ["Terraza", "Sala", "VIP", "Barra"];
  return zones.map((zone) => {
    const inZone = staff.filter(
      (s) => s.zone === zone || (zone === "Sala" && s.zone === "Todas"),
    );
    const total = inZone.reduce((a, s) => a + s.totalLoadPoints, 0);
    const capacity = inZone.reduce((a, s) => a + s.capacity, 0);
    const avg =
      inZone.length > 0
        ? Math.round((total / (inZone.length * 60)) * 100)
        : 0;
    return {
      zone,
      totalPoints: Math.round(total * 10) / 10,
      staffCount: inZone.length,
      avgLoad: avg,
      capacity,
      demand: Math.round(total),
    };
  });
}

/* =========================================================
 * Imbalance detector
 * =======================================================*/
interface ImbalanceAlert {
  id: string;
  fromStaffId: string;
  fromStaffName: string;
  fromLoadState: LoadState;
  fromPoints: number;
  toStaffId: string;
  toStaffName: string;
  toLoadState: LoadState;
  toPoints: number;
  tableId: string;
  tablePoints: number;
  projectedFromPoints: number;
  projectedToPoints: number;
  projectedFromState: LoadState;
  projectedToState: LoadState;
  confidence: number;
  algorithmNote: string;
}

const DEMO_IMBALANCE: ImbalanceAlert = {
  id: "IMB1",
  fromStaffId: "ST1",
  fromStaffName: "Carlos Mendoza",
  fromLoadState: "OVERLOADED",
  fromPoints: 63.1,
  toStaffId: "ST2",
  toStaffName: "María García",
  toLoadState: "IDLE",
  toPoints: 4.65,
  tableId: "M9",
  tablePoints: 11.7,
  projectedFromPoints: 51.4,
  projectedToPoints: 16.35,
  projectedFromState: "HEAVY",
  projectedToState: "OPTIMAL",
  confidence: 92,
  algorithmNote:
    "Algoritmo determinista: reasignar mesa con más puntos del camarero con mayor carga al camarero con menor carga de zona adyacente. Misma zona no disponible (María está en Sala), pero Sala es adyacente a Terraza.",
};

/* =========================================================
 * Optimization suggestions
 * =======================================================*/
interface OptimizationSuggestion {
  id: string;
  title: string;
  rationale: string;
  impact: string;
  tone: "gold" | "teal" | "amber";
}

const OPTIMIZATION_SUGGESTIONS: OptimizationSuggestion[] = [
  {
    id: "OS1",
    title: "Abrir zona VIP adicional",
    rationale:
      "La zona VIP está al 30% con 1 camarero. Hay 3 llegadas VIP previstas en los próximos 45 min.",
    impact: "+2 mesas disponibles · evita cuello en Sala",
    tone: "gold",
  },
  {
    id: "OS2",
    title: "Pedir refuerzo para Terraza",
    rationale:
      "Terraza al 105% de capacidad con 5 KitchenDelay activos. Laura está disponible.",
    impact: "Carlos: 63pts → ~40pts (HEAVY bajo)",
    tone: "amber",
  },
  {
    id: "OS3",
    title: "Activar runner secundario en Barra",
    rationale:
      "Ana acumula 2 KitchenDelay. Un runner secundario reduciría el distance penalty +3.5pts.",
    impact: "Ana: 28pts → ~22pts (OPTIMAL bajo)",
    tone: "teal",
  },
];

/* =========================================================
 * Circular load gauge
 * =======================================================*/
function LoadGauge({
  points,
  capacity,
  state,
  size = 110,
  reduce,
}: {
  points: number;
  capacity: number;
  state: LoadState;
  size?: number;
  reduce: boolean;
}) {
  const stroke = 8;
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, (points / capacity) * 100);
  const offset = c - (pct / 100) * c;
  const meta = LOAD_STATE_META[state];

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-foreground/10"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={reduce ? false : { strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={meta.gauge}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "font-display text-2xl font-light tabular-nums",
            meta.text,
          )}
        >
          {formatPoints(points)}
        </span>
        <span className="mt-0.5 text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
          pts · {pct.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

/* =========================================================
 * Capacity bar
 * =======================================================*/
function CapacityBar({
  points,
  capacity,
  state,
  reduce,
}: {
  points: number;
  capacity: number;
  state: LoadState;
  reduce: boolean;
}) {
  const pct = Math.min(100, (points / capacity) * 100);
  const meta = LOAD_STATE_META[state];
  const over = points > capacity;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
        <span className="text-muted-foreground">
          {formatPoints(points)} / {capacity} pts
        </span>
        <span className={cn(meta.text, over && "text-red-300")}>
          {pct.toFixed(0)}%{over ? " · excedido" : ""}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
        <motion.div
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className={cn("h-full rounded-full", meta.dot)}
        />
      </div>
    </div>
  );
}

/* =========================================================
 * Table load breakdown row
 * =======================================================*/
function TableLoadRow({ table, reduce }: { table: TableLoad; reduce: boolean }) {
  const stateMeta = STATE_META[table.state];
  const StateIcon = stateMeta.icon;
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-border/40 bg-foreground/[0.025] p-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-foreground">
              {table.tableName}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded border px-1 py-0.5 text-[9px] font-mono uppercase tracking-wider",
                "border-border/50 bg-foreground/[0.04] text-muted-foreground",
              )}
            >
              <StateIcon className={cn("h-2.5 w-2.5", stateMeta.tone)} />
              {stateMeta.label}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <span>{table.partySize} pax</span>
            <span className="text-border">·</span>
            <span>{table.zone}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-base font-light tabular-nums text-foreground">
            {formatPoints(table.totalPoints)}
            <span className="ml-0.5 text-[10px] text-muted-foreground">pts</span>
          </div>
        </div>
      </div>

      {/* Calculation visible */}
      <div className="mt-2 rounded-md bg-foreground/[0.03] px-2 py-1.5 font-mono text-[10px] leading-relaxed text-muted-foreground">
        <span className="text-foreground/80">
          {formatPoints(table.basePoints)}pts
        </span>{" "}
        × <span className="text-foreground/80">{table.sizeMultiplier}x</span>{" "}
        <span className="text-muted-foreground/70">(pax)</span>
        {table.incidentMultiplier > 1 && (
          <>
            {" "}
            ×{" "}
            <span className="text-red-300">
              {table.incidentMultiplier}x ({table.incidentType})
            </span>
          </>
        )}
        {table.vipMultiplier > 1 && (
          <>
            {" "}
            × <span className="rp-gold-text">{table.vipMultiplier}x (VIP)</span>
          </>
        )}
        {table.distancePenalty > 0 && (
          <>
            {" "}
            +{" "}
            <span className="text-amber-300">
              {formatPoints(table.distancePenalty)}pts (distancia)
            </span>
          </>
        )}
        <span className="text-foreground/60"> = </span>
        <span className="text-foreground">
          {formatPoints(table.totalPoints)}pts
        </span>
      </div>

      {/* Badges */}
      {(table.hasIncident || table.isVIP) && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {table.hasIncident && (
            <span className="inline-flex items-center gap-1 rounded-md border border-red-400/40 bg-red-400/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-red-300">
              <AlertTriangle className="h-2.5 w-2.5" />
              {table.incidentType} ×{table.incidentMultiplier}
            </span>
          )}
          {table.isVIP && (
            <span className="inline-flex items-center gap-1 rounded-md border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)]">
              <Crown className="h-2.5 w-2.5" />
              VIP ×{table.vipMultiplier}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* =========================================================
 * Staff card
 * =======================================================*/
function StaffCardV2({
  staff,
  index,
  reduce,
}: {
  staff: StaffLoadV2;
  index: number;
  reduce: boolean;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const meta = LOAD_STATE_META[staff.loadState];
  const zone = ZONE_META[staff.zone] ?? ZONE_META.Todas;

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: reduce ? 0 : index * 0.05 }}
      className={cn(
        "rp-glass flex flex-col rounded-2xl p-4 sm:p-5 ring-1",
        meta.ring,
        staff.loadState === "OVERLOADED" && "rp-glow-gold",
      )}
    >
      {/* Header: avatar + name + role + zone */}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br font-display text-lg font-medium text-[#0a0a0a]",
            avatarGradient(staff.name),
          )}
          aria-label={`Avatar de ${staff.name}`}
        >
          {staff.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground">
            {staff.name}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-foreground/[0.04] px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <Users className="h-2.5 w-2.5" />
              {staff.role}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                zone.border,
                zone.bg,
                zone.text,
              )}
            >
              <MapPin className="h-2.5 w-2.5" />
              {zone.label}
            </span>
          </div>
        </div>
        {/* Load state badge */}
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-mono uppercase tracking-wider",
            meta.border,
            meta.bg,
            meta.text,
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              meta.dot,
              staff.loadState === "OVERLOADED" && "animate-pulse",
            )}
          />
          {meta.label}
        </span>
      </div>

      {/* Gauge + total + capacity */}
      <div className="mt-4 flex items-center gap-4">
        <LoadGauge
          points={staff.totalLoadPoints}
          capacity={staff.capacity}
          state={staff.loadState}
          reduce={reduce}
        />
        <div className="flex-1 space-y-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Carga total
            </div>
            <div className="font-display text-2xl font-light tabular-nums text-foreground">
              {formatPoints(staff.totalLoadPoints)}
              <span className="ml-1 text-sm text-muted-foreground">pts</span>
            </div>
            <div className={cn("text-[11px] font-mono", meta.text)}>
              {meta.description}
            </div>
          </div>
          <CapacityBar
            points={staff.totalLoadPoints}
            capacity={staff.capacity}
            state={staff.loadState}
            reduce={reduce}
          />
        </div>
      </div>

      {/* Table count + utilization */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-foreground/[0.03] px-2 py-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Mesas
          </div>
          <div className="mt-0.5 font-display text-base font-light tabular-nums text-foreground">
            {staff.assignedTables.length}
          </div>
        </div>
        <div className="rounded-lg bg-foreground/[0.03] px-2 py-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Incidencias
          </div>
          <div className="mt-0.5 font-display text-base font-light tabular-nums text-red-300">
            {staff.assignedTables.filter((t) => t.hasIncident).length}
          </div>
        </div>
        <div className="rounded-lg bg-foreground/[0.03] px-2 py-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Utilización
          </div>
          <div
            className={cn(
              "mt-0.5 font-display text-base font-light tabular-nums",
              meta.text,
            )}
          >
            {staff.utilizationPct}%
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {staff.recommendations.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {staff.recommendations.map((rec, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/5 px-2 py-1.5 text-[11px] leading-relaxed text-[var(--gold-soft)]"
            >
              <Sparkles className="mt-0.5 h-3 w-3 shrink-0" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      )}

      {/* Expandable table breakdown */}
      {staff.assignedTables.length > 0 && (
        <Collapsible open={expanded} onOpenChange={setExpanded} className="mt-3">
          <CollapsibleTrigger asChild>
            <button
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-border/40 bg-foreground/[0.03] px-3 py-2 text-left transition-colors hover:bg-foreground/[0.06] min-h-11"
              aria-expanded={expanded}
            >
              <span className="flex items-center gap-2 text-xs font-medium text-foreground">
                <Armchair className="h-3.5 w-3.5 text-muted-foreground" />
                Desglose de mesas ({staff.assignedTables.length})
              </span>
              <ChevronRight
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  expanded && "rotate-90",
                )}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={reduce ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={reduce ? undefined : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 max-h-80 space-y-2 overflow-y-auto rp-scroll-thin pr-1">
                    {staff.assignedTables.map((t) => (
                      <TableLoadRow key={t.tableId} table={t} reduce={reduce} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CollapsibleContent>
        </Collapsible>
      )}

      {staff.assignedTables.length === 0 && (
        <div className="mt-3 rounded-lg border border-dashed border-border/40 bg-foreground/[0.02] px-3 py-3 text-center text-xs text-muted-foreground">
          {staff.role === "Maître"
            ? "Sin mesas asignadas — supervisión"
            : staff.role === "Runner"
              ? "Sin mesas — logística y entregas"
              : "Sin mesas asignadas"}
        </div>
      )}
    </motion.article>
  );
}

/* =========================================================
 * Imbalance detector panel
 * =======================================================*/
function ImbalanceDetector({
  alert,
  onApply,
  onReject,
  applied,
  reduce,
}: {
  alert: ImbalanceAlert;
  onApply: () => void;
  onReject: () => void;
  applied: boolean;
  reduce: boolean;
}) {
  const fromMeta = LOAD_STATE_META[alert.fromLoadState];
  const toMeta = LOAD_STATE_META[alert.toLoadState];
  const projFromMeta = LOAD_STATE_META[alert.projectedFromState];
  const projToMeta = LOAD_STATE_META[alert.projectedToState];

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rp-glass rounded-2xl border-l-2 border-[var(--gold)] p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--gold)]/40 bg-[var(--gold)]/10">
            <TriangleAlert className="h-4 w-4 rp-gold-text" />
          </span>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider rp-gold-text">
              Detector de desequilibrio
            </div>
            <div className="font-display text-base font-medium text-foreground sm:text-lg">
              DESEQUILIBRIO EXTREMO detectado
            </div>
          </div>
        </div>
        {!applied && (
          <Badge
            variant="outline"
            className="border-red-400/40 bg-red-400/10 text-red-300 text-[10px] font-mono uppercase tracking-wider"
          >
            Acción requerida
          </Badge>
        )}
        {applied && (
          <Badge
            variant="outline"
            className="border-emerald-400/40 bg-emerald-400/10 text-emerald-300 text-[10px] font-mono uppercase tracking-wider"
          >
            Reasignación aplicada
          </Badge>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* From staff */}
        <div className="rounded-xl border border-red-400/30 bg-red-400/[0.06] p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Camarero sobrecargado
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-2">
            <span className="text-sm font-medium text-foreground">
              {alert.fromStaffName}
            </span>
            <span
              className={cn(
                "font-display text-2xl font-light tabular-nums",
                fromMeta.text,
              )}
            >
              {formatPoints(alert.fromPoints)}pts
            </span>
          </div>
          <div className="mt-1">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                fromMeta.border,
                fromMeta.bg,
                fromMeta.text,
              )}
            >
              {fromMeta.label}
            </span>
          </div>
        </div>

        {/* To staff */}
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/[0.06] p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Camarero disponible
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-2">
            <span className="text-sm font-medium text-foreground">
              {alert.toStaffName}
            </span>
            <span
              className={cn(
                "font-display text-2xl font-light tabular-nums",
                toMeta.text,
              )}
            >
              {formatPoints(alert.toPoints)}pts
            </span>
          </div>
          <div className="mt-1">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                toMeta.border,
                toMeta.bg,
                toMeta.text,
              )}
            >
              {toMeta.label}
            </span>
          </div>
        </div>
      </div>

      {/* Reassignment proposal */}
      <div className="mt-4 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/[0.06] p-3">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 rp-gold-text" />
          <span className="text-[11px] font-mono uppercase tracking-wider rp-gold-text">
            Recomendación IA
          </span>
          <Badge
            variant="outline"
            className="border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)] text-[10px] font-mono"
          >
            Confianza {alert.confidence}%
          </Badge>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-foreground/85">
          Reasignar mesa{" "}
          <span className="font-medium rp-gold-text">{alert.tableId}</span>{" "}
          ({formatPoints(alert.tablePoints)}pts) de{" "}
          <span className="font-medium">{alert.fromStaffName}</span> a{" "}
          <span className="font-medium">{alert.toStaffName}</span>.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-foreground/[0.04] px-2.5 py-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {alert.fromStaffName} tras reasignar
            </div>
            <div
              className={cn(
                "mt-0.5 font-display text-base font-light tabular-nums",
                projFromMeta.text,
              )}
            >
              {formatPoints(alert.projectedFromPoints)}pts ·{" "}
              {projFromMeta.label}
            </div>
          </div>
          <div className="rounded-lg bg-foreground/[0.04] px-2.5 py-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {alert.toStaffName} tras reasignar
            </div>
            <div
              className={cn(
                "mt-0.5 font-display text-base font-light tabular-nums",
                projToMeta.text,
              )}
            >
              {formatPoints(alert.projectedToPoints)}pts · {projToMeta.label}
            </div>
          </div>
        </div>
        <div className="mt-3 rounded-md border border-border/40 bg-foreground/[0.02] px-2.5 py-1.5 text-[11px] leading-relaxed text-muted-foreground">
          <Info className="mr-1 inline h-3 w-3" />
          {alert.algorithmNote}
        </div>
      </div>

      {/* Actions */}
      {!applied && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={onApply}
            className="min-h-11 border border-[var(--gold)]/40 bg-[var(--gold)]/15 text-[var(--gold-soft)] hover:bg-[var(--gold)]/25 hover:text-[var(--gold-soft)]"
          >
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Aplicar reasignación
          </Button>
          <Button
            variant="outline"
            onClick={onReject}
            className="min-h-11"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Rechazar
          </Button>
        </div>
      )}
      {applied && (
        <div className="mt-4 flex items-center gap-2 text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          Reasignación aplicada · Mesa {alert.tableId} ahora asignada a{" "}
          {alert.toStaffName}
        </div>
      )}
    </motion.div>
  );
}

/* =========================================================
 * Zone load card
 * =======================================================*/
function ZoneLoadCard({ zone, reduce }: { zone: ZoneLoadSummary; reduce: boolean }) {
  const meta = ZONE_META[zone.zone] ?? ZONE_META.Todas;
  const loadState = loadStateFor(zone.avgLoad * 0.6);
  const stateMeta = LOAD_STATE_META[loadState];
  const capacityPct = Math.min(100, (zone.demand / zone.capacity) * 100);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rp-glass rounded-xl p-4"
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
            meta.border,
            meta.bg,
            meta.text,
          )}
        >
          <MapPin className="h-2.5 w-2.5" />
          {meta.label}
        </span>
        <span
          className={cn(
            "text-[10px] font-mono uppercase tracking-wider",
            stateMeta.text,
          )}
        >
          {stateMeta.label}
        </span>
      </div>
      <div className="mt-3 font-display text-2xl font-light tabular-nums text-foreground">
        {formatPoints(zone.totalPoints)}
        <span className="ml-1 text-xs text-muted-foreground">pts totales</span>
      </div>
      <div className="mt-2 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <span>Capacidad vs demanda</span>
          <span className="tabular-nums">
            {zone.demand}/{zone.capacity}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
          <motion.div
            initial={reduce ? false : { width: 0 }}
            animate={{ width: `${capacityPct}%` }}
            transition={{ duration: 0.6 }}
            className={cn("h-full rounded-full", meta.color === "var(--gold)" ? "bg-[var(--gold)]" : meta.color === "var(--teal)" ? "bg-[var(--teal)]" : "bg-current")}
            style={{ backgroundColor: meta.color }}
          />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[11px]">
        <div className="rounded-md bg-foreground/[0.03] py-1">
          <div className="font-mono uppercase tracking-wider text-muted-foreground">
            Staff
          </div>
          <div className="font-display text-sm tabular-nums text-foreground">
            {zone.staffCount}
          </div>
        </div>
        <div className="rounded-md bg-foreground/[0.03] py-1">
          <div className="font-mono uppercase tracking-wider text-muted-foreground">
            Media
          </div>
          <div className={cn("font-display text-sm tabular-nums", stateMeta.text)}>
            {zone.avgLoad}%
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
 * Optimization suggestion card
 * =======================================================*/
function OptimizationCard({
  suggestion,
  reduce,
}: {
  suggestion: OptimizationSuggestion;
  reduce: boolean;
}) {
  const toneClasses = {
    gold: "border-[var(--gold)]/40 bg-[var(--gold)]/[0.06] text-[var(--gold-soft)]",
    teal: "border-[var(--teal)]/40 bg-[var(--teal)]/[0.06] text-[var(--teal)]",
    amber: "border-amber-400/40 bg-amber-400/[0.06] text-amber-300",
  };
  const tone = toneClasses[suggestion.tone];
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("rp-glass rounded-xl border-l-2 p-4", tone)}
    >
      <div className="flex items-start gap-2">
        <Zap className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-foreground">
            {suggestion.title}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {suggestion.rationale}
          </p>
          <div className="mt-2 inline-flex items-center gap-1 rounded-md border border-border/40 bg-foreground/[0.03] px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            <TrendingUp className="h-2.5 w-2.5" />
            {suggestion.impact}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
 * Summary bar (overview stats)
 * =======================================================*/
function SummaryBarV2({ staff }: { staff: StaffLoadV2[] }) {
  const reduce = useReducedMotion();
  const overloaded = staff.filter((s) => s.loadState === "OVERLOADED").length;
  const heavy = staff.filter((s) => s.loadState === "HEAVY").length;
  const optimal = staff.filter((s) => s.loadState === "OPTIMAL").length;
  const idle = staff.filter((s) => s.loadState === "IDLE").length;
  const totalIncidents = staff.reduce(
    (a, s) => a + s.assignedTables.filter((t) => t.hasIncident).length,
    0,
  );
  const totalTables = staff.reduce((a, s) => a + s.assignedTables.length, 0);
  const avgUtil = Math.round(
    staff.reduce((a, s) => a + s.utilizationPct, 0) / staff.length,
  );

  const items = [
    {
      label: "OVERLOADED",
      value: `${overloaded}`,
      icon: TriangleAlert,
      accent: "text-red-300",
    },
    {
      label: "HEAVY",
      value: `${heavy}`,
      icon: Activity,
      accent: "rp-gold-text",
    },
    {
      label: "OPTIMAL",
      value: `${optimal}`,
      icon: CheckCircle2,
      accent: "rp-teal-text",
    },
    {
      label: "IDLE",
      value: `${idle}`,
      icon: Gauge,
      accent: "text-emerald-300",
    },
    {
      label: "Mesas asignadas",
      value: `${totalTables}`,
      icon: Armchair,
      accent: "text-foreground",
    },
    {
      label: "Incidencias activas",
      value: `${totalIncidents}`,
      icon: AlertTriangle,
      accent: "text-red-300",
    },
    {
      label: "Utilización media",
      value: `${avgUtil}%`,
      icon: BarIcon,
      accent: avgUtil > 80 ? "text-red-300" : "rp-gold-text",
    },
  ];

  return (
    <div className="rp-glass grid grid-cols-2 gap-2 rounded-2xl p-3 sm:grid-cols-4 sm:gap-3 sm:p-4 lg:grid-cols-7">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <motion.div
            key={it.label}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: reduce ? 0 : i * 0.03 }}
            className="flex items-center gap-2.5 rounded-xl bg-foreground/[0.03] px-3 py-2"
          >
            <Icon className={cn("h-4 w-4 shrink-0", it.accent)} />
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground truncate">
                {it.label}
              </div>
              <div
                className={cn(
                  "font-display text-lg font-light tabular-nums sm:text-xl",
                  it.accent,
                )}
              >
                {it.value}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Local bar icon (avoid naming conflict)
function BarIcon({ className }: { className?: string }) {
  return <Activity className={className} />;
}

/* =========================================================
 * Explanation card (collapsible)
 * =======================================================*/
function ExplanationCard({ reduce }: { reduce: boolean }) {
  const [open, setOpen] = React.useState(false);

  const basePointRows: { state: TableState; pts: number }[] = [
    { state: "ordering", pts: 3 },
    { state: "drinks", pts: 2 },
    { state: "dining", pts: 2 },
    { state: "dessert", pts: 1 },
    { state: "paying", pts: 1 },
    { state: "cleaning", pts: 0.5 },
  ];

  const multiplierRows = [
    { label: "Party size ≤2", value: "×1" },
    { label: "Party size 3-4", value: "×1.3" },
    { label: "Party size 5-6", value: "×1.6" },
    { label: "Party size 7+", value: "×2" },
    { label: "KitchenDelay (incident)", value: "×3" },
    { label: "CustomerIssue (incident)", value: "×2" },
    { label: "BrokenTable (incident)", value: "×1.5" },
    { label: "VIP table", value: "×1.5" },
    { label: "Distance per zone boundary", value: "+0.5pts" },
  ];

  const stateRows: { state: LoadState; range: string; color: string }[] = [
    { state: "IDLE", range: "<15pts", color: "text-emerald-300" },
    { state: "OPTIMAL", range: "15-35pts", color: "rp-teal-text" },
    { state: "HEAVY", range: "35-60pts", color: "rp-gold-text" },
    { state: "OVERLOADED", range: ">60pts", color: "text-red-300" },
  ];

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rp-glass rounded-2xl p-4 sm:p-5">
        <CollapsibleTrigger asChild>
          <button
            className="flex w-full items-center justify-between gap-2 text-left"
            aria-expanded={open}
          >
            <span className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--teal)]/40 bg-[var(--teal)]/10">
                <Info className="h-4 w-4 rp-teal-text" />
              </span>
              <span className="text-sm font-medium text-foreground">
                ¿Cómo calculamos la carga?
              </span>
            </span>
            <ChevronRight
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                open && "rotate-90",
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={reduce ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={reduce ? undefined : { opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <p className="mt-4 text-sm leading-relaxed text-foreground/85">
                  No evaluamos <span className="rp-gold-text">“mesas”</span>,
                  evaluamos <span className="rp-gold-text">esfuerzo cognitivo y físico</span>.
                  El Motor v2 calcula puntos de carga por mesa y los suma por
                  camarero, aplicando multiplicadores contextuales. Una mesa con
                  KitchenDelay y 6 comensales pesa 6× más que una mesa de 2
                  pagando.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {/* Base points */}
                  <div>
                    <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      Puntos base por estado
                    </div>
                    <div className="rp-glass rounded-lg p-2">
                      {basePointRows.map((r) => {
                        const sm = STATE_META[r.state];
                        const Icon = sm.icon;
                        return (
                          <div
                            key={r.state}
                            className="flex items-center justify-between border-b border-border/30 py-1.5 last:border-0"
                          >
                            <span className="flex items-center gap-1.5 text-xs text-foreground/85">
                              <Icon className={cn("h-3 w-3", sm.tone)} />
                              {sm.label}
                            </span>
                            <span className="font-mono text-xs tabular-nums text-foreground">
                              {r.pts}pts
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Multipliers */}
                  <div>
                    <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      Multiplicadores
                    </div>
                    <div className="rp-glass rounded-lg p-2">
                      {multiplierRows.map((r) => (
                        <div
                          key={r.label}
                          className="flex items-center justify-between border-b border-border/30 py-1.5 last:border-0"
                        >
                          <span className="text-xs text-foreground/85">
                            {r.label}
                          </span>
                          <span className="font-mono text-xs tabular-nums rp-gold-text">
                            {r.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Load states */}
                  <div>
                    <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      Estados de carga
                    </div>
                    <div className="rp-glass rounded-lg p-2">
                      {stateRows.map((r) => (
                        <div
                          key={r.state}
                          className="flex items-center justify-between border-b border-border/30 py-1.5 last:border-0"
                        >
                          <span
                            className={cn(
                              "text-xs font-mono uppercase tracking-wider",
                              r.color,
                            )}
                          >
                            {r.state}
                          </span>
                          <span className="font-mono text-xs tabular-nums text-muted-foreground">
                            {r.range}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-md border border-border/40 bg-foreground/[0.02] px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                  <Info className="mr-1 inline h-3 w-3" />
                  Fórmula por mesa:{" "}
                  <span className="font-mono text-foreground/80">
                    basePoints × sizeMultiplier × incidentMultiplier ×
                    vipMultiplier + distancePenalty
                  </span>
                  . La capacidad por defecto es 60pts (umbral OVERLOADED).
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

/* =========================================================
 * Main component
 * =======================================================*/
export function FloorStaffEngine() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [staff] = React.useState<StaffLoadV2[]>(DEMO_STAFF_V2);
  const [imbalanceApplied, setImbalanceApplied] = React.useState(false);
  const zoneSummaries = React.useMemo(
    () => computeZoneSummaries(staff),
    [staff],
  );

  const handleApplyImbalance = () => {
    setImbalanceApplied(true);
    toast({
      title: "Reasignación aplicada",
      description: `Mesa M9: Carlos Mendoza → María García · Confianza 92% (demo)`,
    });
  };

  const handleRejectImbalance = () => {
    setImbalanceApplied(true);
    toast({
      title: "Sugerencia rechazada",
      description: "El desequilibrio permanece — el maître debe decidir manualmente (demo)",
    });
  };

  return (
    <TooltipProvider delayDuration={150}>
      <section
        aria-labelledby="floor-staff-engine-title"
        className="flex flex-col gap-5"
      >
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2
                id="floor-staff-engine-title"
                className="font-display text-2xl font-light tracking-tight text-foreground sm:text-3xl"
              >
                Motor de Carga de Personal v2
              </h2>
              <Badge
                variant="outline"
                className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] text-[10px] font-mono uppercase tracking-wider"
              >
                demo
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Cálculo de carga por esfuerzo cognitivo, no por número de mesas.
              Puntos base × multiplicadores contextuales.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300">
              En servicio
            </span>
          </div>
        </header>

        {/* Summary bar */}
        <SummaryBarV2 staff={staff} />

        {/* Explanation */}
        <ExplanationCard reduce={reduce} />

        {/* Imbalance detector */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 rp-gold-text" />
            <h3 className="text-sm font-medium text-foreground sm:text-base">
              Detector de desequilibrio
            </h3>
            <Badge
              variant="outline"
              className="border-red-400/40 bg-red-400/10 text-red-300 text-[10px] font-mono uppercase tracking-wider"
            >
              1 crítico
            </Badge>
          </div>
          <ImbalanceDetector
            alert={DEMO_IMBALANCE}
            onApply={handleApplyImbalance}
            onReject={handleRejectImbalance}
            applied={imbalanceApplied}
            reduce={reduce}
          />
        </div>

        {/* Staff grid */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground sm:text-base">
              Carga por camarero
            </h3>
            <Badge
              variant="outline"
              className="border-border/40 bg-foreground/[0.04] text-muted-foreground text-[10px] font-mono uppercase tracking-wider"
            >
              {staff.length} activos
            </Badge>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {staff.map((s, i) => (
              <StaffCardV2 key={s.id} staff={s} index={i} reduce={reduce} />
            ))}
          </div>
        </div>

        {/* Zone load summary */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground sm:text-base">
              Carga por zona
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {zoneSummaries.map((z) => (
              <ZoneLoadCard key={z.zone} zone={z} reduce={reduce} />
            ))}
          </div>
        </div>

        {/* Optimization suggestions */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--gold-soft)]" />
            <h3 className="text-sm font-medium text-foreground sm:text-base">
              Sugerencias de optimización
            </h3>
            <Badge
              variant="outline"
              className="border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)] text-[10px] font-mono uppercase tracking-wider"
            >
              {OPTIMIZATION_SUGGESTIONS.length} IA
            </Badge>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {OPTIMIZATION_SUGGESTIONS.map((sg) => (
              <OptimizationCard key={sg.id} suggestion={sg} reduce={reduce} />
            ))}
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}
