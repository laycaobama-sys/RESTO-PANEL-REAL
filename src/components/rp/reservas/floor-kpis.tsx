"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Activity,
  Armchair,
  RotateCw,
  Timer,
  Euro,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Users,
  Sparkles,
  Info,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Gauge,
  Receipt,
  CalendarClock,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
interface KpiMetric {
  label: string;
  value: string;
  trend?: { direction: "up" | "down" | "flat"; value: string };
  source: string;
  frequency: "real-time" | "aggregated";
  formula?: string;
  goodDirection?: "up" | "down";
  isRealTime: boolean;
  lastUpdated: string;
}

/* =========================================================
 * Frequency meta
 * =======================================================*/
const FREQ_META: Record<
  "real-time" | "aggregated",
  { label: string; cls: string; dot: string; short: string }
> = {
  "real-time": {
    label: "Tiempo real (<5s)",
    cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    dot: "bg-emerald-400",
    short: "RT",
  },
  aggregated: {
    label: "Agregado (diario)",
    cls: "border-foreground/20 bg-foreground/5 text-muted-foreground",
    dot: "bg-foreground/40",
    short: "AGG",
  },
};

/* =========================================================
 * Trend icon
 * =======================================================*/
function TrendIcon({
  direction,
  good,
}: {
  direction: "up" | "down" | "flat";
  good: boolean | null;
}) {
  const Icon =
    direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus;
  const cls =
    good === true
      ? "text-emerald-300"
      : good === false
      ? "text-destructive"
      : "text-muted-foreground";
  return <Icon className={cn("h-3 w-3", cls)} />;
}

/* =========================================================
 * KPI categories (demo data)
 * =======================================================*/
const RT_KPIS: (KpiMetric & { goodDirection?: "up" | "down" })[] = [
  {
    label: "Mesas ocupadas",
    value: "18/24",
    trend: { direction: "up", value: "+2" },
    source: "Digital Order",
    frequency: "real-time",
    isRealTime: true,
    goodDirection: "up",
    lastUpdated: "14:38:02",
  },
  {
    label: "Mesas disponibles",
    value: "4",
    trend: { direction: "down", value: "-2" },
    source: "Digital Order",
    frequency: "real-time",
    isRealTime: true,
    goodDirection: "down",
    lastUpdated: "14:38:02",
  },
  {
    label: "Mesas en limpieza",
    value: "2",
    trend: { direction: "flat", value: "0" },
    source: "Staff Engine",
    frequency: "real-time",
    isRealTime: true,
    goodDirection: "down",
    lastUpdated: "14:38:02",
  },
  {
    label: "Lista de espera",
    value: "7 pax",
    trend: { direction: "up", value: "+2" },
    source: "Waitlist",
    frequency: "real-time",
    isRealTime: true,
    goodDirection: "down",
    lastUpdated: "14:38:02",
  },
  {
    label: "Tiempo medio hasta disp.",
    value: "18min",
    trend: { direction: "up", value: "+3min" },
    source: "Availability Engine",
    frequency: "real-time",
    isRealTime: true,
    goodDirection: "down",
    formula: "media(tiempo_estimado_liberación)",
    lastUpdated: "14:38:02",
  },
  {
    label: "Camareros en servicio",
    value: "6",
    trend: { direction: "flat", value: "0" },
    source: "Staff Engine",
    frequency: "real-time",
    isRealTime: true,
    goodDirection: "up",
    lastUpdated: "14:38:02",
  },
];

const ROTATION_KPIS: (KpiMetric & { goodDirection?: "up" | "down" })[] = [
  {
    label: "Rotación media",
    value: "2.3 turnos",
    trend: { direction: "up", value: "+0.1" },
    source: "Analytics Engine",
    frequency: "aggregated",
    isRealTime: false,
    goodDirection: "up",
    formula: "reservas / mesas / día",
    lastUpdated: "14:30:00",
  },
  {
    label: "Tiempo medio por mesa",
    value: "92min",
    trend: { direction: "down", value: "-3min" },
    source: "Analytics Engine",
    frequency: "aggregated",
    isRealTime: false,
    goodDirection: "down",
    formula: "media(salida − entrada)",
    lastUpdated: "14:30:00",
  },
  {
    label: "Tiempo de limpieza medio",
    value: "14min",
    trend: { direction: "down", value: "-1min" },
    source: "Staff Engine",
    frequency: "aggregated",
    isRealTime: false,
    goodDirection: "down",
    lastUpdated: "14:30:00",
  },
  {
    label: "Capacidad desperdiciada",
    value: "8.2%",
    trend: { direction: "down", value: "-0.4%" },
    source: "Analytics Engine",
    frequency: "aggregated",
    isRealTime: false,
    goodDirection: "down",
    formula: "huecos_sin_reserva / capacidad_total",
    lastUpdated: "14:30:00",
  },
];

const REVENUE_KPIS: (KpiMetric & { goodDirection?: "up" | "down" })[] = [
  {
    label: "Ingreso por mesa",
    value: "€168",
    trend: { direction: "up", value: "+€6" },
    source: "POS",
    frequency: "aggregated",
    isRealTime: false,
    goodDirection: "up",
    formula: "ingresos / mesas ocupadas",
    lastUpdated: "14:30:00",
  },
  {
    label: "Ingreso por hora",
    value: "€842",
    trend: { direction: "up", value: "+€48" },
    source: "POS",
    frequency: "aggregated",
    isRealTime: false,
    goodDirection: "up",
    formula: "ingresos / horas_servicio",
    lastUpdated: "14:30:00",
  },
  {
    label: "Ingreso estimado servicio",
    value: "€4.100",
    trend: { direction: "up", value: "+€220" },
    source: "Analytics Engine",
    frequency: "aggregated",
    isRealTime: false,
    goodDirection: "up",
    formula: "Σ(mesas × ticket_esperado)",
    lastUpdated: "14:30:00",
  },
  {
    label: "Ticket medio",
    value: "€38",
    trend: { direction: "up", value: "+€2" },
    source: "POS",
    frequency: "aggregated",
    isRealTime: false,
    goodDirection: "up",
    lastUpdated: "14:30:00",
  },
];

const EFFICIENCY_KPIS: (KpiMetric & { goodDirection?: "up" | "down" })[] = [
  {
    label: "Retrasos hoy",
    value: "3 mesas",
    trend: { direction: "up", value: "+1" },
    source: "KDS",
    frequency: "aggregated",
    isRealTime: false,
    goodDirection: "down",
    formula: "count(salida_real > estimada + 5min)",
    lastUpdated: "14:30:00",
  },
  {
    label: "Retraso medio",
    value: "+12min",
    trend: { direction: "up", value: "+2min" },
    source: "KDS",
    frequency: "aggregated",
    isRealTime: false,
    goodDirection: "down",
    lastUpdated: "14:30:00",
  },
  {
    label: "Incidencias abiertas",
    value: "2",
    trend: { direction: "down", value: "-1" },
    source: "Incident Tracker",
    frequency: "aggregated",
    isRealTime: false,
    goodDirection: "down",
    lastUpdated: "14:30:00",
  },
  {
    label: "No-shows hoy",
    value: "3 (8.2%)",
    trend: { direction: "up", value: "+1" },
    source: "Reservations",
    frequency: "aggregated",
    isRealTime: false,
    goodDirection: "down",
    formula: "no_shows / reservas × 100",
    lastUpdated: "14:30:00",
  },
  {
    label: "Conversiones lista espera",
    value: "4/7 (57%)",
    trend: { direction: "up", value: "+1" },
    source: "Waitlist",
    frequency: "aggregated",
    isRealTime: false,
    goodDirection: "up",
    lastUpdated: "14:30:00",
  },
  {
    label: "Tiempo medio de espera",
    value: "22min",
    trend: { direction: "down", value: "-1min" },
    source: "Waitlist",
    frequency: "aggregated",
    isRealTime: false,
    goodDirection: "down",
    lastUpdated: "14:30:00",
  },
  {
    label: "Ocupación media",
    value: "78%",
    trend: { direction: "up", value: "+4%" },
    source: "Analytics Engine",
    frequency: "aggregated",
    isRealTime: false,
    goodDirection: "up",
    formula: "Σ(ocupado) / Σ(capacidad)",
    lastUpdated: "14:30:00",
  },
];

/* =========================================================
 * Per-zone and per-franja breakdowns (rendered as inline lists)
 * =======================================================*/
const ZONE_ROTATION = [
  { zone: "Sala", value: "2.1", color: "var(--gold)" },
  { zone: "Terraza", value: "2.8", color: "var(--teal)" },
  { zone: "VIP", value: "1.4", color: "#C084FC" },
  { zone: "Barra", value: "3.2", color: "#F59E0B" },
];

const ZONE_REVENUE = [
  { zone: "Sala", value: 1840, color: "var(--gold)" },
  { zone: "Terraza", value: 1420, color: "var(--teal)" },
  { zone: "VIP", value: 640, color: "#C084FC" },
  { zone: "Barra", value: 200, color: "#F59E0B" },
];

const FRANJA_REVENUE = [
  { franja: "13-14h", value: 420 },
  { franja: "14-15h", value: 680 },
  { franja: "20-21h", value: 890 },
  { franja: "21-22h", value: 1100 },
  { franja: "22-23h", value: 480 },
];

/* =========================================================
 * Zone comparison chart data (3 metrics × 4 zones)
 * =======================================================*/
const ZONE_COMPARISON = [
  { zone: "Sala", occupancy: 82, rotation: 2.1, revenue: 1840 },
  { zone: "Terraza", occupancy: 91, rotation: 2.8, revenue: 1420 },
  { zone: "VIP", occupancy: 45, rotation: 1.4, revenue: 640 },
  { zone: "Barra", occupancy: 67, rotation: 3.2, revenue: 200 },
];

/* =========================================================
 * Capacity breakdown (donut)
 * =======================================================*/
const CAPACITY_BREAKDOWN = [
  { label: "Ocupadas", value: 18, color: "#D4AF37" },
  { label: "Limpieza", value: 2, color: "#F59E0B" },
  { label: "Disponibles", value: 4, color: "#3DD6C9" },
  { label: "Bloqueadas", value: 0, color: "#6B7280" },
];

/* =========================================================
 * KPI card
 * =======================================================*/
function KpiCard({
  metric,
  index,
}: {
  metric: KpiMetric & { goodDirection?: "up" | "down" };
  index: number;
}) {
  const reduce = useReducedMotion();
  const freq = FREQ_META[metric.frequency];
  const isGood =
    metric.trend && metric.goodDirection
      ? metric.trend.direction === metric.goodDirection
        ? true
        : metric.trend.direction === "flat"
        ? null
        : false
      : null;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: reduce ? 0 : index * 0.04 }}
      className="rp-glass flex flex-col rounded-xl p-4 transition-colors hover:bg-foreground/[0.03]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {metric.label}
          </div>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider",
            freq.cls,
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", freq.dot, metric.frequency === "real-time" && "animate-pulse")} />
          {freq.short}
        </span>
      </div>

      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="font-display text-2xl font-light tabular-nums text-foreground sm:text-3xl">
          {metric.value}
        </div>
        {metric.trend && (
          <div
            className={cn(
              "inline-flex items-center gap-1 text-[11px] font-mono tabular-nums",
              isGood === true
                ? "text-emerald-300"
                : isGood === false
                ? "text-destructive"
                : "text-muted-foreground",
            )}
          >
            <TrendIcon direction={metric.trend.direction} good={isGood} />
            {metric.trend.value}
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-muted-foreground">
            {metric.source}
          </span>
          {metric.formula && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="grid h-5 w-5 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={`Fórmula: ${metric.formula}`}
                >
                  <Info className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[240px] font-mono text-xs">
                {metric.formula}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
          {metric.lastUpdated}
        </span>
      </div>
    </motion.div>
  );
}

/* =========================================================
 * KPI section
 * =======================================================*/
function KpiSection({
  title,
  icon: Icon,
  kpis,
  accent,
  extra,
}: {
  title: string;
  icon: React.ElementType;
  kpis: (KpiMetric & { goodDirection?: "up" | "down" })[];
  accent: "emerald" | "teal" | "gold" | "amber";
  extra?: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const accentCls: Record<string, string> = {
    emerald: "text-emerald-300 border-emerald-400/40 bg-emerald-400/10",
    teal: "rp-teal-text border-[var(--teal)]/40 bg-[var(--teal)]/10",
    gold: "rp-gold-text border-[var(--gold)]/40 bg-[var(--gold)]/10",
    amber: "text-amber-300 border-amber-400/40 bg-amber-400/10",
  };

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rp-glass rounded-2xl p-4 sm:p-5"
    >
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className={cn("grid h-8 w-8 place-items-center rounded-lg border", accentCls[accent])}>
            <Icon className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-medium text-foreground sm:text-base">{title}</h3>
        </div>
        {extra}
      </header>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <KpiCard key={k.label} metric={k} index={i} />
        ))}
      </div>
    </motion.section>
  );
}

/* =========================================================
 * Inline zone breakdown (rotation)
 * =======================================================*/
function ZoneRotationRow({ reduce }: { reduce: boolean }) {
  const max = Math.max(...ZONE_ROTATION.map((z) => parseFloat(z.value)));
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {ZONE_ROTATION.map((z, i) => {
        const w = (parseFloat(z.value) / max) * 100;
        return (
          <div key={z.zone} className="rp-glass rounded-lg p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {z.zone}
              </span>
              <span className="font-mono text-xs tabular-nums text-foreground">
                {z.value}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
              <motion.div
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${w}%` }}
                transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.05, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: z.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
 * Inline franja revenue bars
 * =======================================================*/
function FranjaBars({ reduce }: { reduce: boolean }) {
  const max = Math.max(...FRANJA_REVENUE.map((f) => f.value));
  return (
    <div className="mt-3">
      <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        Ingreso por franja horaria
      </div>
      <div className="flex h-32 items-end gap-2 sm:gap-3">
        {FRANJA_REVENUE.map((f, i) => {
          const h = (f.value / max) * 100;
          return (
            <div key={f.franja} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full flex-1 items-end">
                <motion.div
                  initial={reduce ? false : { height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 0.6, delay: reduce ? 0 : i * 0.06, ease: "easeOut" }}
                  className={cn(
                    "w-full rounded-t-md",
                    f.value === max
                      ? "bg-gradient-to-t from-[var(--gold)]/40 to-[var(--gold)]"
                      : "bg-gradient-to-t from-[var(--teal)]/40 to-[var(--teal)]/80",
                  )}
                >
                  <div className="px-1 py-1 text-center text-[10px] font-mono tabular-nums text-foreground/80">
                    €{f.value}
                  </div>
                </motion.div>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground">{f.franja}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
 * Inline zone revenue bars
 * =======================================================*/
function ZoneRevenueBars({ reduce }: { reduce: boolean }) {
  const max = Math.max(...ZONE_REVENUE.map((z) => z.value));
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {ZONE_REVENUE.map((z, i) => {
        const w = (z.value / max) * 100;
        return (
          <div key={z.zone} className="rp-glass rounded-lg p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {z.zone}
              </span>
              <span className="font-mono text-xs tabular-nums text-foreground">
                €{z.value}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
              <motion.div
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${w}%` }}
                transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.05, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: z.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
 * Zone comparison chart (grouped bars: occupancy / rotation / revenue)
 * =======================================================*/
function ZoneComparisonChart({ reduce }: { reduce: boolean }) {
  // Normalize each metric to 0-100
  const maxOcc = Math.max(...ZONE_COMPARISON.map((z) => z.occupancy));
  const maxRot = Math.max(...ZONE_COMPARISON.map((z) => z.rotation));
  const maxRev = Math.max(...ZONE_COMPARISON.map((z) => z.revenue));

  const metrics = [
    { key: "occupancy" as const, label: "Ocupación", color: "var(--gold)", format: (v: number) => `${v}%`, max: maxOcc },
    { key: "rotation" as const, label: "Rotación", color: "var(--teal)", format: (v: number) => v.toFixed(1), max: maxRot },
    { key: "revenue" as const, label: "Ingresos", color: "#C084FC", format: (v: number) => `€${v}`, max: maxRev },
  ];

  return (
    <div className="rp-glass rounded-2xl p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--gold)]/40 bg-[var(--gold)]/10 rp-gold-text">
            <BarChart3Icon />
          </span>
          <h3 className="text-sm font-medium text-foreground sm:text-base">
            Comparativa por zona
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {metrics.map((m) => (
            <span key={m.key} className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ background: m.color }} />
              {m.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ZONE_COMPARISON.map((z, zi) => (
          <motion.div
            key={z.zone}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: reduce ? 0 : zi * 0.05 }}
            className="rp-glass rounded-xl p-3"
          >
            <div className="mb-2 text-[11px] font-mono uppercase tracking-wider text-foreground">
              {z.zone}
            </div>
            <div className="flex items-end gap-2">
              {metrics.map((m, mi) => {
                const raw = z[m.key];
                const h = (raw / m.max) * 100;
                return (
                  <div key={m.key} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex w-full flex-1 items-end">
                      <motion.div
                        initial={reduce ? false : { height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{
                          duration: 0.5,
                          delay: reduce ? 0 : zi * 0.05 + mi * 0.04,
                          ease: "easeOut",
                        }}
                        className="w-full rounded-t-md"
                        style={{
                          background: `linear-gradient(to top, ${m.color}40, ${m.color})`,
                          minHeight: 4,
                        }}
                      />
                    </div>
                    <span className="text-[9px] font-mono tabular-nums text-muted-foreground">
                      {m.format(raw)}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function BarChart3Icon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <line x1="3" y1="21" x2="21" y2="21" />
      <rect x="5" y="11" width="3" height="8" />
      <rect x="11" y="7" width="3" height="12" />
      <rect x="17" y="14" width="3" height="5" />
    </svg>
  );
}

/* =========================================================
 * Capacity utilization donut
 * =======================================================*/
function CapacityDonut({ reduce }: { reduce: boolean }) {
  const total = CAPACITY_BREAKDOWN.reduce((a, b) => a + b.value, 0);
  const size = 200;
  const stroke = 28;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  // Precompute offsets per segment (no mutation — pure reduction)
  const segments = CAPACITY_BREAKDOWN.reduce<
    Array<{ label: string; value: number; color: string; dash: number; offset: number }>
  >((list, seg) => {
    const prevOffset = list.length > 0 ? list[list.length - 1].offset + list[list.length - 1].dash : 0;
    const frac = total === 0 ? 0 : seg.value / total;
    const dash = frac * c;
    const offset = prevOffset;
    return [...list, { ...seg, dash, offset }];
  }, []);

  return (
    <div className="rp-glass rounded-2xl p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--teal)]/40 bg-[var(--teal)]/10 rp-teal-text">
          <Gauge className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-medium text-foreground sm:text-base">
          Utilización de capacidad
        </h3>
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            {/* Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth={stroke}
              className="text-foreground/[0.06]"
            />
            {/* Segments */}
            {segments.map((seg, i) => {
              return (
                <motion.circle
                  key={seg.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={stroke}
                  strokeLinecap="butt"
                  strokeDasharray={`${seg.dash} ${c - seg.dash}`}
                  initial={reduce ? false : { strokeDashoffset: c }}
                  animate={{ strokeDashoffset: -seg.offset }}
                  transition={{ duration: 0.6, delay: reduce ? 0 : i * 0.1, ease: "easeOut" }}
                />
              );
            })}
          </svg>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Total mesas
            </div>
            <div className="font-display text-3xl font-light tabular-nums text-foreground">
              {total}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground">24 cap.</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {CAPACITY_BREAKDOWN.map((seg) => {
            const pct = total === 0 ? 0 : Math.round((seg.value / total) * 100);
            return (
              <div key={seg.label} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: seg.color }}
                  />
                  {seg.label}
                </span>
                <span className="font-mono text-xs tabular-nums text-foreground">
                  {seg.value} · {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Frequency legend
 * =======================================================*/
function FrequencyLegend() {
  return (
    <div className="rp-glass inline-flex flex-wrap items-center gap-3 rounded-xl px-3 py-2">
      <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-emerald-300">Tiempo real</span>
      </span>
      <span className="h-3 w-px bg-border/40" />
      <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider">
        <span className="h-1.5 w-1.5 rounded-full bg-foreground/40" />
        <span className="text-muted-foreground">Agregado</span>
      </span>
    </div>
  );
}

/* =========================================================
 * Main component
 * =======================================================*/
export function FloorKpis() {
  const reduce = useReducedMotion();

  return (
    <TooltipProvider delayDuration={150}>
      <section aria-labelledby="floor-kpis-title" className="flex flex-col gap-5">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2
                id="floor-kpis-title"
                className="font-display text-2xl font-light tracking-tight text-foreground sm:text-3xl"
              >
                KPIs de sala
              </h2>
              <Badge
                variant="outline"
                className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] text-[10px] font-mono uppercase tracking-wider"
              >
                demo
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Métricas en tiempo real y agregadas del salón.
            </p>
          </div>
          <FrequencyLegend />
        </header>

        {/* Real-time KPIs */}
        <KpiSection
          title="Tiempo real"
          icon={Activity}
          kpis={RT_KPIS}
          accent="emerald"
          extra={
            <Badge
              variant="outline"
              className="border-emerald-400/40 bg-emerald-400/10 text-emerald-300 text-[10px] font-mono uppercase tracking-wider"
            >
              <span className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              &lt;5s
            </Badge>
          }
        />

        {/* Rotation KPIs + per-zone rotation */}
        <KpiSection
          title="Rotación"
          icon={RotateCw}
          kpis={ROTATION_KPIS}
          accent="gold"
          extra={
            <Badge
              variant="outline"
              className="border-border/40 bg-foreground/[0.04] text-muted-foreground text-[10px] font-mono uppercase tracking-wider"
            >
              <CalendarClock className="mr-1 h-2.5 w-2.5" />
              agregado diario
            </Badge>
          }
        />
        <div className="-mt-3 px-1">
          <ZoneRotationRow reduce={reduce} />
        </div>

        {/* Revenue KPIs + per-zone + per-franja */}
        <KpiSection
          title="Ingresos"
          icon={Euro}
          kpis={REVENUE_KPIS}
          accent="gold"
          extra={
            <Badge
              variant="outline"
              className="border-border/40 bg-foreground/[0.04] text-muted-foreground text-[10px] font-mono uppercase tracking-wider"
            >
              <Receipt className="mr-1 h-2.5 w-2.5" />
              agregado diario
            </Badge>
          }
        />
        <div className="-mt-3 flex flex-col gap-3 px-1">
          <ZoneRevenueBars reduce={reduce} />
          <FranjaBars reduce={reduce} />
        </div>

        {/* Efficiency KPIs */}
        <KpiSection
          title="Eficiencia"
          icon={Gauge}
          kpis={EFFICIENCY_KPIS}
          accent="amber"
          extra={
            <Badge
              variant="outline"
              className="border-border/40 bg-foreground/[0.04] text-muted-foreground text-[10px] font-mono uppercase tracking-wider"
            >
              <AlertTriangle className="mr-1 h-2.5 w-2.5" />
              agregado diario
            </Badge>
          }
        />

        {/* Zone comparison chart + Capacity donut */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ZoneComparisonChart reduce={reduce} />
          <CapacityDonut reduce={reduce} />
        </div>
      </section>
    </TooltipProvider>
  );
}
