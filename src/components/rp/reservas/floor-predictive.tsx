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
  BrainCircuit,
  Sparkles,
  Activity,
  Users,
  Clock,
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronRight,
  Info,
  CheckCircle2,
  XCircle,
  Zap,
  Pause,
  Play,
  RefreshCw,
  Timer,
  Gauge,
  Layers,
  Cpu,
  Database,
  Flame,
  Coffee,
  Wind,
  Armchair,
  ServerCrash,
  CircleAlert,
  Calendar,
  ArrowRight,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type PredictionLevel = "safe" | "moderate" | "high" | "critical" | "collapse";
type RecommendationAction =
  | "pause_reservations"
  | "open_extra_zone"
  | "request_reinforcement"
  | "expedite_cleaning"
  | "prioritize_seating"
  | "accept_walkins"
  | "normal_operations";

interface ForecastSlot {
  time: string;
  minutesFromNow: number;
  predictedOccupancy: number;
  predictedWaitlist: number;
  predictedLoad: number;
  level: PredictionLevel;
  factors: string[];
  recommendation?: {
    action: RecommendationAction;
    reason: string;
    confidence: number;
    impactEstimate: string;
  };
}

interface PredictiveModel {
  version: string;
  factors: { name: string; weight: number; description: string }[];
  historicalAccuracy: number;
  lastTrainedAt: string;
  dataQuality: "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT";
}

/* =========================================================
 * Static metadata
 * =======================================================*/
const LEVEL_META: Record<
  PredictionLevel,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  safe: {
    label: "Safe",
    color: "text-emerald-300",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/40",
    dot: "#10b981",
  },
  moderate: {
    label: "Moderate",
    color: "text-[var(--teal)]",
    bg: "bg-[var(--teal)]/10",
    border: "border-[var(--teal)]/40",
    dot: "#3DD6C9",
  },
  high: {
    label: "High",
    color: "text-[var(--gold-soft)]",
    bg: "bg-[var(--gold)]/10",
    border: "border-[var(--gold)]/45",
    dot: "#D4AF37",
  },
  critical: {
    label: "Critical",
    color: "text-amber-300",
    bg: "bg-amber-400/10",
    border: "border-amber-400/50",
    dot: "#f59e0b",
  },
  collapse: {
    label: "Collapse",
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/55",
    dot: "#ef4444",
  },
};

const ACTION_META: Record<
  RecommendationAction,
  { label: string; icon: React.ComponentType<{ className?: string }>; tone: string }
> = {
  pause_reservations: { label: "Pausar reservas", icon: Pause, tone: "text-destructive" },
  open_extra_zone: { label: "Abrir zona extra", icon: Layers, tone: "text-[var(--teal)]" },
  request_reinforcement: { label: "Solicitar refuerzo", icon: Users, tone: "text-[var(--gold-soft)]" },
  expedite_cleaning: { label: "Acelerar limpieza", icon: Wind, tone: "text-[var(--teal)]" },
  prioritize_seating: { label: "Priorizar sentado", icon: Armchair, tone: "text-[var(--gold-soft)]" },
  accept_walkins: { label: "Aceptar walk-ins", icon: Coffee, tone: "text-emerald-300" },
  normal_operations: { label: "Operación normal", icon: CheckCircle2, tone: "text-emerald-300" },
};

/* =========================================================
 * Demo data — current snapshot at 21:00
 * =======================================================*/
const CURRENT = {
  time: "21:00",
  occupancy: 78,
  upcomingReservations120: 14,
  waitlist: 7,
  staffLoad: 67,
  level60Min: "high" as PredictionLevel,
  occupancy60Min: 85,
};

const FORECAST_SLOTS: ForecastSlot[] = [
  {
    time: "21:15",
    minutesFromNow: 15,
    predictedOccupancy: 82,
    predictedWaitlist: 7,
    predictedLoad: 71,
    level: "moderate",
    factors: ["3 reservas entrantes", "Histórico viernes 21h", "2 mesas en limpieza"],
  },
  {
    time: "21:30",
    minutesFromNow: 30,
    predictedOccupancy: 86,
    predictedWaitlist: 8,
    predictedLoad: 76,
    level: "high",
    factors: ["5 reservas entrantes", "Histórico viernes 21h", "3 mesas en limpieza", "Barra al 70%"],
    recommendation: {
      action: "expedite_cleaning",
      reason: "3 grupos en lista de espera compatibles con mesas en limpieza.",
      confidence: 88,
      impactEstimate: "Sentar 3 grupos en 10min",
    },
  },
  {
    time: "21:45",
    minutesFromNow: 45,
    predictedOccupancy: 90,
    predictedWaitlist: 9,
    predictedLoad: 82,
    level: "high",
    factors: ["Terraza al 92%", "7 reservas entrantes", "Histórico viernes 21h"],
    recommendation: {
      action: "request_reinforcement",
      reason: "Terraza alcanzará 92% en 45min. Carlos estará OVERLOADED.",
      confidence: 82,
      impactEstimate: "Reducir tiempo de espera 15%",
    },
  },
  {
    time: "22:00",
    minutesFromNow: 60,
    predictedOccupancy: 92,
    predictedWaitlist: 11,
    predictedLoad: 88,
    level: "high",
    factors: ["10 reservas entrantes", "Histórico viernes 22h", "Cocina al 85%"],
  },
  {
    time: "22:15",
    minutesFromNow: 75,
    predictedOccupancy: 95,
    predictedWaitlist: 13,
    predictedLoad: 92,
    level: "critical",
    factors: ["12 reservas entrantes", "Histórico viernes 22h", "Cocina al 92%"],
    recommendation: {
      action: "pause_reservations",
      reason: "Ocupación predicha 95% a las 22:15. Pausar entrada de reservas de última hora por web.",
      confidence: 88,
      impactEstimate: "Evitar overbooking y colapso operativo",
    },
  },
  {
    time: "22:30",
    minutesFromNow: 90,
    predictedOccupancy: 97,
    predictedWaitlist: 14,
    predictedLoad: 96,
    level: "critical",
    factors: ["14 reservas entrantes", "Pico histórico viernes", "Cocina al 96%", "Carga personal 96%"],
    recommendation: {
      action: "pause_reservations",
      reason: "Pico predicho 97% — riesgo de colapso operativo. Pausar reservas y walk-ins.",
      confidence: 91,
      impactEstimate: "Evitar colapso operativo y pérdida de calidad",
    },
  },
  {
    time: "22:45",
    minutesFromNow: 105,
    predictedOccupancy: 91,
    predictedWaitlist: 9,
    predictedLoad: 84,
    level: "high",
    factors: ["Inicio de bajada", "Histórico viernes 22:45", "6 reservas activas"],
    recommendation: {
      action: "accept_walkins",
      reason: "Ocupación inicia descenso. Barra al 58% con capacidad para 4 más.",
      confidence: 75,
      impactEstimate: "+€68 ingresos estimados",
    },
  },
  {
    time: "23:00",
    minutesFromNow: 120,
    predictedOccupancy: 78,
    predictedWaitlist: 5,
    predictedLoad: 72,
    level: "moderate",
    factors: ["Tendencia bajada", "Histórico viernes 23h", "4 reservas activas"],
  },
];

interface AIRecommendation {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  action: RecommendationAction;
  title: string;
  reason: string;
  confidence: number;
  impact: string;
  eta?: string;
}

const AI_RECS: AIRecommendation[] = [
  {
    id: "rec-1",
    severity: "critical",
    action: "pause_reservations",
    title: "Pausar reservas web en 60 min",
    reason:
      "Ocupación predicha 95% a las 22:00. Pausar entrada de reservas de última hora por web.",
    confidence: 88,
    impact: "Evitar overbooking y colapso operativo",
    eta: "+60min",
  },
  {
    id: "rec-2",
    severity: "high",
    action: "request_reinforcement",
    title: "Reforzar terraza en 45 min",
    reason: "Terraza alcanzará 92% en 45min. Carlos estará OVERLOADED.",
    confidence: 82,
    impact: "Reducir tiempo de espera 15%",
    eta: "+45min",
  },
  {
    id: "rec-3",
    severity: "medium",
    action: "prioritize_seating",
    title: "Priorizar limpieza mesas 4 y 5",
    reason:
      "3 grupos en lista de espera compatibles con mesas 4-5 en limpieza",
    confidence: 90,
    impact: "Sentar 3 grupos en 10min",
    eta: "ahora",
  },
  {
    id: "rec-4",
    severity: "low",
    action: "accept_walkins",
    title: "Aceptar walk-ins en barra",
    reason: "Barra al 58% con capacidad para 4 más",
    confidence: 75,
    impact: "+€68 ingresos estimados",
    eta: "ahora",
  },
];

const PREDICTIVE_MODEL: PredictiveModel = {
  version: "predictive-v2.1",
  factors: [
    {
      name: "Ocupación actual",
      weight: 25,
      description: "Ratio de mesas ocupadas / disponibles en tiempo real",
    },
    {
      name: "Reservas entrantes",
      weight: 30,
      description: "Confirmadas + pendientes en ventana de 120min",
    },
    {
      name: "Histórico horario",
      weight: 20,
      description: "Patrón por día de semana, hora y estacionalidad (90 días)",
    },
    {
      name: "Estado mesas",
      weight: 15,
      description: "Mesas en limpieza, reservadas, bloqueadas, disponibles",
    },
    {
      name: "Carga personal",
      weight: 10,
      description: "Puntos cognitivos acumulados por zone leader",
    },
  ],
  historicalAccuracy: 84,
  lastTrainedAt: "2025-01-20",
  dataQuality: "HIGH",
};

/* =========================================================
 * Helpers
 * =======================================================*/
function occupancyColor(p: number): string {
  if (p < 70) return "text-emerald-300";
  if (p < 85) return "text-[var(--gold-soft)]";
  if (p < 95) return "text-amber-300";
  return "text-destructive";
}

function confidenceTone(c: number): string {
  if (c >= 85) return "text-emerald-300";
  if (c >= 70) return "text-[var(--gold-soft)]";
  return "text-amber-300";
}

const SEVERITY_META: Record<
  AIRecommendation["severity"],
  { label: string; color: string; bg: string; border: string }
> = {
  critical: {
    label: "CRITICAL",
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/55",
  },
  high: {
    label: "HIGH",
    color: "text-amber-300",
    bg: "bg-amber-400/10",
    border: "border-amber-400/50",
  },
  medium: {
    label: "MEDIUM",
    color: "text-[var(--gold-soft)]",
    bg: "bg-[var(--gold)]/10",
    border: "border-[var(--gold)]/45",
  },
  low: {
    label: "LOW",
    color: "text-[var(--teal)]",
    bg: "bg-[var(--teal)]/10",
    border: "border-[var(--teal)]/40",
  },
};

/* =========================================================
 * Forecast SVG chart
 * =======================================================*/
function ForecastChart({
  slots,
  reduceMotion,
}: {
  slots: ForecastSlot[];
  reduceMotion: boolean | null;
}) {
  // Chart dims
  const W = 920;
  const H = 320;
  const padL = 48;
  const padR = 24;
  const padT = 24;
  const padB = 44;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const xFor = (i: number) => padL + (i / (slots.length - 1)) * innerW;
  const yFor = (v: number) => padT + innerH - (v / 100) * innerH;

  // Build occupancy line path
  const occPath = slots
    .map((s, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(1)} ${yFor(s.predictedOccupancy).toFixed(1)}`)
    .join(" ");

  // Build staff load line path
  const loadPath = slots
    .map((s, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(1)} ${yFor(s.predictedLoad).toFixed(1)}`)
    .join(" ");

  // Build confidence band (±6% on each side)
  const bandUpper = slots.map((s, i) => ({ x: xFor(i), y: yFor(Math.min(100, s.predictedOccupancy + 6)) }));
  const bandLower = slots.map((s, i) => ({ x: xFor(i), y: yFor(Math.max(0, s.predictedOccupancy - 6)) }));
  const bandPath =
    bandUpper.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") +
    " " +
    bandLower
      .slice()
      .reverse()
      .map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ") +
    " Z";

  // Annotations: dot index, label, color
  type Annotation = {
    slotIdx: number;
    text: string;
    color: string;
    side: "top" | "bottom";
  };
  const annotations: Annotation[] = [
    { slotIdx: 2, text: "+45min: Terraza 92% — Reforzar", color: "#D4AF37", side: "top" },
    { slotIdx: 4, text: "+75min: 95% ocupación — Pausar reservas", color: "#f59e0b", side: "top" },
    { slotIdx: 5, text: "+90min: Pico 97% — Riesgo colapso", color: "#ef4444", side: "bottom" },
    { slotIdx: 6, text: "+105min: Inicio bajada — Reanudar", color: "#10b981", side: "top" },
  ];

  // Thresholds
  const yHigh = yFor(85);
  const yCrit = yFor(95);

  return (
    <div className="w-full overflow-x-auto rp-scroll-thin">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ minWidth: 720 }}
        role="img"
        aria-label="Forecast de ocupación próximos 120 minutos"
      >
        <defs>
          <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3DD6C9" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#3DD6C9" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {/* Grid lines (Y) */}
        {[0, 25, 50, 75, 100].map((g) => (
          <g key={g}>
            <line
              x1={padL}
              x2={W - padR}
              y1={yFor(g)}
              y2={yFor(g)}
              stroke="currentColor"
              className="text-foreground/8"
              strokeWidth={1}
              strokeDasharray="2 4"
            />
            <text
              x={padL - 8}
              y={yFor(g) + 4}
              textAnchor="end"
              className="fill-muted-foreground"
              style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
            >
              {g}%
            </text>
          </g>
        ))}

        {/* Threshold: HIGH 85% (amber dashed) */}
        <line
          x1={padL}
          x2={W - padR}
          y1={yHigh}
          y2={yHigh}
          stroke="#f59e0b"
          strokeWidth={1.5}
          strokeDasharray="6 4"
          opacity={0.7}
        />
        <text
          x={W - padR}
          y={yHigh - 6}
          textAnchor="end"
          className="fill-amber-300"
          style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
        >
          Umbral HIGH 85%
        </text>

        {/* Threshold: CRITICAL 95% (red dashed) */}
        <line
          x1={padL}
          x2={W - padR}
          y1={yCrit}
          y2={yCrit}
          stroke="#ef4444"
          strokeWidth={1.5}
          strokeDasharray="6 4"
          opacity={0.7}
        />
        <text
          x={W - padR}
          y={yCrit - 6}
          textAnchor="end"
          className="fill-destructive"
          style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
        >
          Umbral CRITICAL 95%
        </text>

        {/* Confidence band */}
        <motion.path
          d={bandPath}
          fill="url(#bandGrad)"
          stroke="none"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />

        {/* Occupancy area gradient */}
        <motion.path
          d={`${occPath} L ${xFor(slots.length - 1).toFixed(1)} ${yFor(0).toFixed(1)} L ${xFor(0).toFixed(1)} ${yFor(0).toFixed(1)} Z`}
          fill="url(#occGrad)"
          stroke="none"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        />

        {/* Staff load line (teal, secondary) */}
        <motion.path
          d={loadPath}
          fill="none"
          stroke="#3DD6C9"
          strokeWidth={2}
          strokeDasharray="4 3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />

        {/* Occupancy line (gold) */}
        <motion.path
          d={occPath}
          fill="none"
          stroke="#D4AF37"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {/* Slot points + labels (X) */}
        {slots.map((s, i) => {
          const cx = xFor(i);
          const cy = yFor(s.predictedOccupancy);
          const lm = LEVEL_META[s.level];
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={3.5} fill={lm.dot} stroke="#0b0b0d" strokeWidth={1.5} />
              <text
                x={cx}
                y={H - padB + 18}
                textAnchor="middle"
                className="fill-muted-foreground"
                style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
              >
                +{s.minutesFromNow}
              </text>
              <text
                x={cx}
                y={H - padB + 32}
                textAnchor="middle"
                className="fill-foreground/50"
                style={{ fontSize: 9, fontFamily: "var(--font-mono)" }}
              >
                {s.time}
              </text>
            </g>
          );
        })}

        {/* Annotations */}
        {annotations.map((a, i) => {
          const cx = xFor(a.slotIdx);
          const cy = yFor(slots[a.slotIdx].predictedOccupancy);
          const labelY = a.side === "top" ? cy - 30 : cy + 28;
          return (
            <g key={`ann-${i}`}>
              <line
                x1={cx}
                x2={cx}
                y1={cy}
                y2={labelY + (a.side === "top" ? 6 : -6)}
                stroke={a.color}
                strokeWidth={1}
                opacity={0.6}
              />
              <circle cx={cx} cy={cy} r={5} fill="none" stroke={a.color} strokeWidth={2} />
              <circle cx={cx} cy={cy} r={2} fill={a.color} />
              <rect
                x={cx - 88}
                y={a.side === "top" ? labelY - 12 : labelY - 2}
                width={176}
                height={18}
                rx={4}
                fill="#0b0b0d"
                stroke={a.color}
                strokeWidth={0.8}
                opacity={0.95}
              />
              <text
                x={cx}
                y={a.side === "top" ? labelY : labelY + 11}
                textAnchor="middle"
                fill={a.color}
                style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
              >
                {a.text}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* =========================================================
 * Demo badge
 * =======================================================*/
function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.15em] text-[var(--gold-soft)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
      demo
    </span>
  );
}

/* =========================================================
 * Main component
 * =======================================================*/
export function FloorPredictive() {
  const reduce = useReducedMotion();
  const { toast } = useToast();

  const [modelOpen, setModelOpen] = React.useState(false);
  const [recs, setRecs] = React.useState<AIRecommendation[]>(AI_RECS);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [recomputeTick, setRecomputeTick] = React.useState(0);
  const [recomputing, setRecomputing] = React.useState(false);

  function handleApply(rec: AIRecommendation) {
    setBusy(rec.id);
    setTimeout(() => {
      setRecs((prev) => prev.filter((r) => r.id !== rec.id));
      setBusy(null);
      const meta = ACTION_META[rec.action];
      toast({
        title: "Recomendación aplicada",
        description: `${meta.label}: ${rec.title}`,
      });
    }, 700);
  }

  function handleReject(rec: AIRecommendation) {
    setBusy(rec.id);
    setTimeout(() => {
      setRecs((prev) => prev.filter((r) => r.id !== rec.id));
      setBusy(null);
      toast({
        title: "Recomendación rechazada",
        description: `${rec.title} — archivada.`,
      });
    }, 500);
  }

  function recompute() {
    setRecomputing(true);
    setTimeout(() => {
      setRecomputing(false);
      setRecomputeTick((t) => t + 1);
      toast({
        title: "Forecast recalculado",
        description: "Modelo predictive-v2.1 ejecutado con datos en vivo.",
      });
    }, 900);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rp-glass rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--gold)]/12 border border-[var(--gold)]/35 text-[var(--gold)]">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-2xl sm:text-3xl font-light tracking-tight">
                  Motor Predictivo
                </h2>
                <DemoBadge />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Forecast 120 min · Predicción de saturación + recomendaciones automáticas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border/60 bg-foreground/[0.03] px-3 py-2">
              <Clock className="h-4 w-4 text-[var(--teal)]" />
              <div className="text-xs">
                <div className="font-mono text-foreground/90">Forecast 120 min</div>
                <div className="text-muted-foreground">Actualizado {CURRENT.time}</div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={recompute}
              disabled={recomputing}
              className="min-h-11"
            >
              <RefreshCw className={cn("h-4 w-4 mr-1.5", recomputing && "animate-spin")} />
              {recomputing ? "Recalculando…" : "Recalcular"}
            </Button>
          </div>
        </div>
      </div>

      {/* Current state summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <CurrentStat
          icon={Gauge}
          label="Ocupación actual"
          value={`${CURRENT.occupancy}%`}
          tone="gold"
          sub="78/100 mesas"
        />
        <CurrentStat
          icon={Calendar}
          label="Reservas próximas"
          value={`${CURRENT.upcomingReservations120}`}
          tone="teal"
          sub="próximos 120 min"
        />
        <CurrentStat
          icon={Users}
          label="Lista de espera"
          value={`${CURRENT.waitlist}`}
          tone="amber"
          sub="7 grupos"
        />
        <CurrentStat
          icon={Activity}
          label="Carga personal"
          value={`${CURRENT.staffLoad}%`}
          tone="gold"
          sub="6 zone leaders"
        />
        <CurrentStat
          icon={Flame}
          label="Nivel en +60min"
          value={LEVEL_META[CURRENT.level60Min].label}
          tone="amber"
          sub={`${CURRENT.occupancy60Min}% ocupación`}
        />
      </div>

      {/* Forecast chart */}
      <div className="rp-glass rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div>
            <h3 className="font-display text-lg sm:text-xl font-medium">
              Forecast de ocupación · próximos 120 min
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Intervalos de 15 min · Banda de confianza ±6% · Model predictive-v2.1
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap text-xs">
            <LegendDot color="#D4AF37" label="Ocupación predicha" />
            <LegendDot color="#3DD6C9" label="Banda de confianza" dashed />
            <LegendDot color="#3DD6C9" label="Carga personal" dashed solid />
            <LegendDot color="#f59e0b" label="Umbral HIGH" line />
            <LegendDot color="#ef4444" label="Umbral CRITICAL" line />
          </div>
        </div>
        <ForecastChart slots={FORECAST_SLOTS} reduceMotion={reduce} />
      </div>

      {/* Forecast slots table */}
      <div className="rp-glass rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg sm:text-xl font-medium">
            Detalle por intervalo
          </h3>
          <Badge variant="outline" className="font-mono text-[10px]">
            {FORECAST_SLOTS.length} slots
          </Badge>
        </div>

        {/* Desktop: table; Mobile: cards */}
        <div className="hidden md:block overflow-x-auto rp-scroll-thin">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-foreground/[0.03]">
                <Th>Hora</Th>
                <Th>Ocupación</Th>
                <Th>Waitlist</Th>
                <Th>Load</Th>
                <Th>Nivel</Th>
                <Th>Factores</Th>
                <Th>Recomendación</Th>
              </tr>
            </thead>
            <tbody>
              {FORECAST_SLOTS.map((s, i) => {
                const lm = LEVEL_META[s.level];
                return (
                  <tr
                    key={i}
                    className="border-b border-border/40 last:border-0 transition-colors hover:bg-foreground/[0.025]"
                  >
                    <td className="px-4 py-3 align-top whitespace-nowrap">
                      <div className="font-mono text-foreground/90">{s.time}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">+{s.minutesFromNow}min</div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className={cn("font-display text-2xl font-light tabular-nums", occupancyColor(s.predictedOccupancy))}>
                        {s.predictedOccupancy}%
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="font-mono text-foreground/85">{s.predictedWaitlist}</span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="font-mono text-[var(--teal)]">{s.predictedLoad} pts</span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider", lm.bg, lm.border, lm.color)}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: lm.dot }} />
                        {lm.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {s.factors.map((f, fi) => (
                          <span
                            key={fi}
                            className="inline-flex items-center rounded-md border border-border/60 bg-foreground/[0.04] px-1.5 py-0.5 text-[10px] text-muted-foreground"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      {s.recommendation ? (
                        <div className="max-w-xs">
                          <div className="flex items-center gap-1.5 text-xs">
                            {React.createElement(ACTION_META[s.recommendation.action].icon, { className: cn("h-3.5 w-3.5", ACTION_META[s.recommendation.action].tone) })}
                            <span className={cn("font-medium", ACTION_META[s.recommendation.action].tone)}>
                              {ACTION_META[s.recommendation.action].label}
                            </span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-muted-foreground font-mono text-[10px]">
                              {s.recommendation.confidence}%
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                            {s.recommendation.reason}
                          </p>
                          <p className="mt-1 text-[10px] text-[var(--teal)] font-mono">
                            Impacto: {s.recommendation.impactEstimate}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {FORECAST_SLOTS.map((s, i) => {
            const lm = LEVEL_META[s.level];
            return (
              <div
                key={i}
                className="rounded-xl border border-border/60 bg-foreground/[0.02] p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono text-sm text-foreground/90">{s.time}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">+{s.minutesFromNow}min</div>
                  </div>
                  <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider", lm.bg, lm.border, lm.color)}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: lm.dot }} />
                    {lm.label}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Ocup.</div>
                    <div className={cn("font-display text-xl font-light tabular-nums", occupancyColor(s.predictedOccupancy))}>
                      {s.predictedOccupancy}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Wait</div>
                    <div className="font-mono text-foreground/85">{s.predictedWaitlist}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Load</div>
                    <div className="font-mono text-[var(--teal)]">{s.predictedLoad}</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {s.factors.map((f, fi) => (
                    <span
                      key={fi}
                      className="inline-flex items-center rounded-md border border-border/60 bg-foreground/[0.04] px-1.5 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {f}
                    </span>
                  ))}
                </div>
                {s.recommendation ? (
                  <div className="mt-3 rounded-lg border border-[var(--gold)]/25 bg-[var(--gold)]/5 p-2.5">
                    <div className="flex items-center gap-1.5 text-xs">
                      {React.createElement(ACTION_META[s.recommendation.action].icon, { className: cn("h-3.5 w-3.5", ACTION_META[s.recommendation.action].tone) })}
                      <span className={cn("font-medium", ACTION_META[s.recommendation.action].tone)}>
                        {ACTION_META[s.recommendation.action].label}
                      </span>
                      <span className="text-muted-foreground ml-auto font-mono text-[10px]">
                        {s.recommendation.confidence}%
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {s.recommendation.reason}
                    </p>
                    <p className="mt-1 text-[10px] text-[var(--teal)] font-mono">
                      Impacto: {s.recommendation.impactEstimate}
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Recommendations panel */}
      <div className="rp-glass rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[var(--gold)]" />
            <h3 className="font-display text-lg sm:text-xl font-medium">
              Recomendaciones automáticas
            </h3>
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
            {recs.length} activas
          </Badge>
        </div>

        <AnimatePresence mode="popLayout">
          {recs.length === 0 ? (
            <motion.div
              key="empty"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              className="rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-6 text-center"
            >
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-300" />
              <p className="mt-2 text-sm text-foreground/85">
                No hay recomendaciones pendientes. Operación dentro de parámetros.
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {recs.map((rec) => {
                const sm = SEVERITY_META[rec.severity];
                const am = ACTION_META[rec.action];
                return (
                  <motion.div
                    key={rec.id}
                    layout={!reduce}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className={cn(
                      "rounded-xl border p-4 flex flex-col gap-3",
                      sm.border,
                      sm.bg
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider shrink-0", sm.border, sm.color)}>
                        {sm.label}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm leading-tight">
                          {rec.title}
                        </h4>
                        {rec.eta ? (
                          <div className="mt-0.5 text-[10px] font-mono text-muted-foreground">
                            ETA {rec.eta}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {rec.reason}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] font-mono">
                      <span className="text-muted-foreground">Confianza</span>
                      <span className={confidenceTone(rec.confidence)}>{rec.confidence}%</span>
                      <span className="text-muted-foreground ml-auto">Impacto</span>
                      <span className="text-[var(--teal)]">{rec.impact}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <am.icon className={cn("h-3 w-3", am.tone)} />
                      <span className={am.tone}>{am.label}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        className="min-h-11 flex-1 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
                        onClick={() => handleApply(rec)}
                        disabled={busy === rec.id}
                      >
                        {busy === rec.id ? (
                          <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        )}
                        Aplicar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="min-h-11"
                        onClick={() => handleReject(rec)}
                        disabled={busy === rec.id}
                      >
                        <XCircle className="h-4 w-4 mr-1.5" />
                        Rechazar
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Model info + Fallback notice */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Collapsible open={modelOpen} onOpenChange={setModelOpen}>
            <div className="rp-glass rounded-2xl overflow-hidden">
              <CollapsibleTrigger asChild>
                <button
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-foreground/[0.025] transition-colors"
                  aria-expanded={modelOpen}
                >
                  <div className="flex items-center gap-3">
                    <Cpu className="h-5 w-5 text-[var(--teal)]" />
                    <div>
                      <h3 className="font-display text-lg font-medium">Modelo predictivo</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                        {PREDICTIVE_MODEL.version} · accuracy {PREDICTIVE_MODEL.historicalAccuracy}%
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={cn("h-5 w-5 text-muted-foreground transition-transform", modelOpen && "rotate-180")}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 space-y-5">
                  <div className="grid sm:grid-cols-3 gap-3">
                    <ModelStat icon={Calendar} label="Último entrenamiento" value={PREDICTIVE_MODEL.lastTrainedAt} />
                    <ModelStat
                      icon={Gauge}
                      label="Precisión histórica"
                      value={`${PREDICTIVE_MODEL.historicalAccuracy}%`}
                      tone="gold"
                    />
                    <ModelStat
                      icon={Database}
                      label="Calidad de datos"
                      value={PREDICTIVE_MODEL.dataQuality}
                      tone={PREDICTIVE_MODEL.dataQuality === "HIGH" ? "teal" : "amber"}
                    />
                  </div>

                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
                      Factores y pesos
                    </h4>
                    <div className="space-y-2.5">
                      {PREDICTIVE_MODEL.factors.map((f, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-foreground/90">{f.name}</span>
                            <span className="font-mono text-[var(--gold-soft)]">{f.weight}%</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 rounded-full bg-foreground/8 overflow-hidden">
                              <motion.div
                                initial={reduce ? false : { width: 0 }}
                                animate={{ width: `${f.weight}%` }}
                                transition={{ duration: 0.5, delay: i * 0.05 }}
                                className="h-full bg-gradient-to-r from-[var(--gold-deep)] via-[var(--gold)] to-[var(--gold-soft)]"
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground max-w-xs">{f.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-400/30 bg-amber-400/[0.04] p-4">
                    <div className="flex items-start gap-2.5">
                      <CircleAlert className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <span className="text-amber-300 font-medium">Aviso:</span> Las predicciones son
                        estimaciones basadas en datos históricos y actuales. No son garantías. El modelo
                        tiene fallback determinista si los datos son insuficientes.
                      </p>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>

        <div className="rp-glass rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <ServerCrash className="h-5 w-5 text-amber-300" />
            <h3 className="font-display text-base font-medium">Fallback determinista</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            Si el modelo predictivo no responde, el sistema usa reglas deterministas:
          </p>
          <ol className="space-y-2.5">
            <FallbackRule
              n={1}
              cond="Ocupación > 90%"
              action="Pausar reservas web"
            />
            <FallbackRule
              n={2}
              cond="Waitlist > 5"
              action="Priorizar limpieza"
            />
            <FallbackRule
              n={3}
              cond="Carga personal > 80%"
              action="Sugerir refuerzo"
            />
          </ol>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/5 px-3 py-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
            <span className="text-[11px] text-muted-foreground">
              Fallback probado en{" "}
              <span className="text-emerald-300 font-mono">99.97%</span> uptime
            </span>
          </div>
        </div>
      </div>

      {/* Hidden state to trigger recomputes */}
      <span aria-hidden className="hidden" data-tick={recomputeTick} />
    </div>
  );
}

/* =========================================================
 * Sub-components
 * =======================================================*/
function CurrentStat({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  tone: "gold" | "teal" | "amber" | "emerald";
}) {
  const toneClass =
    tone === "gold"
      ? "text-[var(--gold-soft)] border-[var(--gold)]/35 bg-[var(--gold)]/8"
      : tone === "teal"
      ? "text-[var(--teal)] border-[var(--teal)]/35 bg-[var(--teal)]/8"
      : tone === "amber"
      ? "text-amber-300 border-amber-400/35 bg-amber-400/8"
      : "text-emerald-300 border-emerald-400/35 bg-emerald-400/8";
  return (
    <div className="rp-glass rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon className={cn("h-4 w-4", toneClass.split(" ")[0])} />
      </div>
      <div className={cn("font-display text-2xl sm:text-3xl font-light tabular-nums", toneClass.split(" ")[0])}>
        {value}
      </div>
      {sub ? <div className="text-[11px] text-muted-foreground">{sub}</div> : null}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
      {children}
    </th>
  );
}

function LegendDot({
  color,
  label,
  dashed,
  line,
  solid,
}: {
  color: string;
  label: string;
  dashed?: boolean;
  line?: boolean;
  solid?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {line ? (
        <span
          className="h-0 w-4 border-t-2"
          style={{ borderColor: color, borderStyle: "dashed" }}
        />
      ) : (
        <span
          className={cn("h-2 w-4 rounded-full", !solid && "opacity-50")}
          style={{
            background: dashed ? `repeating-linear-gradient(90deg, ${color} 0 3px, transparent 3px 6px)` : color,
          }}
        />
      )}
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}

function ModelStat({
  icon: Icon,
  label,
  value,
  tone = "fg",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone?: "fg" | "gold" | "teal" | "amber";
}) {
  const c =
    tone === "gold"
      ? "text-[var(--gold-soft)]"
      : tone === "teal"
      ? "text-[var(--teal)]"
      : tone === "amber"
      ? "text-amber-300"
      : "text-foreground/90";
  return (
    <div className="rounded-lg border border-border/60 bg-foreground/[0.02] p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className={cn("mt-1 font-mono text-sm font-medium", c)}>{value}</div>
    </div>
  );
}

function FallbackRule({
  n,
  cond,
  action,
}: {
  n: number;
  cond: string;
  action: string;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-[10px] font-mono text-amber-300">
        {n}
      </span>
      <div className="text-xs">
        <span className="text-foreground/85 font-mono">{cond}</span>
        <span className="text-muted-foreground mx-1">→</span>
        <span className="text-amber-300">{action}</span>
      </div>
    </li>
  );
}
