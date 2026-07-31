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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Armchair,
  RotateCw,
  Timer,
  Crown,
  Euro,
  CalendarClock,
  Globe,
  Phone,
  MessageCircle,
  Info,
  Download,
  FileText,
  Zap,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
interface KpiMetric {
  label: string;
  value: string;
  trend?: { direction: "up" | "down" | "flat"; value: string };
  source: string;
  frequency: "real-time" | "near-real-time" | "aggregated";
  formula?: string;
  isRealTime: boolean;
}

/* =========================================================
 * Frequency meta
 * =======================================================*/
type Frequency = KpiMetric["frequency"];

const FREQ_META: Record<
  Frequency,
  { label: string; cls: string; dot: string; short: string }
> = {
  "real-time": {
    label: "Tiempo real (<5s)",
    cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    dot: "bg-emerald-400",
    short: "RT",
  },
  "near-real-time": {
    label: "Casi tiempo real (15-60s)",
    cls: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
    dot: "bg-[var(--teal)]",
    short: "NRT",
  },
  aggregated: {
    label: "Agregado (5min/hora/día)",
    cls: "border-foreground/20 bg-foreground/5 text-muted-foreground",
    dot: "bg-foreground/40",
    short: "AGG",
  },
};

/* =========================================================
 * Trend — context-dependent "good/bad"
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
  // good=true → green; good=false → red; good=null → muted
  const cls =
    good === true
      ? "text-emerald-300"
      : good === false
      ? "text-destructive"
      : "text-muted-foreground";
  return <Icon className={cn("h-3 w-3", cls)} />;
}

/* =========================================================
 * KPI definitions (demo data)
 * =======================================================*/
const RT_KPIS: (KpiMetric & { goodDirection?: "up" | "down" })[] = [
  {
    label: "Reservas activas hoy",
    value: "47",
    trend: { direction: "up", value: "+6" },
    source: "D1",
    frequency: "real-time",
    isRealTime: true,
    goodDirection: "up",
  },
  {
    label: "Ocupación actual",
    value: "78%",
    trend: { direction: "up", value: "+4%" },
    source: "DO + D1",
    frequency: "real-time",
    isRealTime: true,
    goodDirection: "up",
  },
  {
    label: "Mesas ocupadas",
    value: "18/24",
    trend: { direction: "up", value: "+2" },
    source: "DO",
    frequency: "real-time",
    isRealTime: true,
    goodDirection: "up",
  },
  {
    label: "Lista de espera",
    value: "7",
    trend: { direction: "up", value: "+2" },
    source: "D1",
    frequency: "real-time",
    isRealTime: true,
    goodDirection: "down",
  },
  {
    label: "Usuarios en sala",
    value: "87",
    trend: { direction: "up", value: "+12" },
    source: "DO",
    frequency: "real-time",
    isRealTime: true,
    goodDirection: "up",
  },
];

const NRT_KPIS: (KpiMetric & { goodDirection?: "up" | "down" })[] = [
  {
    label: "Reservas creadas (1h)",
    value: "12",
    trend: { direction: "up", value: "+3" },
    source: "Analytics Engine",
    frequency: "near-real-time",
    isRealTime: false,
    goodDirection: "up",
  },
  {
    label: "Cancelaciones (1h)",
    value: "2",
    trend: { direction: "up", value: "+1" },
    source: "D1",
    frequency: "near-real-time",
    isRealTime: false,
    goodDirection: "down",
  },
  {
    label: "Check-ins (1h)",
    value: "8",
    trend: { direction: "up", value: "+2" },
    source: "D1",
    frequency: "near-real-time",
    isRealTime: false,
    goodDirection: "up",
  },
  {
    label: "No-shows hoy",
    value: "3",
    trend: { direction: "up", value: "+1" },
    source: "D1",
    frequency: "near-real-time",
    isRealTime: false,
    goodDirection: "down",
  },
];

const AGG_KPIS: (KpiMetric & { goodDirection?: "up" | "down" })[] = [
  {
    label: "Ocupación media",
    value: "74%",
    trend: { direction: "up", value: "+2%" },
    source: "Analytics Engine",
    frequency: "aggregated",
    formula: "sum(ocupado) / sum(capacidad)",
    isRealTime: false,
    goodDirection: "up",
  },
  {
    label: "Rotación media",
    value: "2.3",
    trend: { direction: "up", value: "+0.1" },
    source: "Analytics",
    frequency: "aggregated",
    formula: "reservas / mesas / día",
    isRealTime: false,
    goodDirection: "up",
  },
  {
    label: "Ticket medio",
    value: "€38",
    trend: { direction: "up", value: "+€2" },
    source: "D1 + POS",
    frequency: "aggregated",
    isRealTime: false,
    goodDirection: "up",
  },
  {
    label: "Tiempo medio por mesa",
    value: "92min",
    trend: { direction: "down", value: "-3min" },
    source: "Analytics",
    frequency: "aggregated",
    isRealTime: false,
    goodDirection: "down",
  },
  {
    label: "Tiempo de limpieza medio",
    value: "14min",
    trend: { direction: "down", value: "-1min" },
    source: "Analytics",
    frequency: "aggregated",
    isRealTime: false,
    goodDirection: "down",
  },
  {
    label: "Conversión widget→reserva",
    value: "34%",
    trend: { direction: "up", value: "+3%" },
    source: "Analytics",
    frequency: "aggregated",
    isRealTime: false,
    goodDirection: "up",
  },
  {
    label: "No-show rate",
    value: "8.2%",
    trend: { direction: "down", value: "-0.4%" },
    source: "D1",
    frequency: "aggregated",
    isRealTime: false,
    goodDirection: "down",
  },
  {
    label: "Cancelación rate",
    value: "5.1%",
    trend: { direction: "down", value: "-0.2%" },
    source: "D1",
    frequency: "aggregated",
    isRealTime: false,
    goodDirection: "down",
  },
];

/* =========================================================
 * Historical aggregations
 * =======================================================*/
const HIST_KPIS: (KpiMetric & { goodDirection?: "up" | "down" })[] = [
  {
    label: "Clientes nuevos (mes)",
    value: "412",
    trend: { direction: "up", value: "+38" },
    source: "CRM",
    frequency: "aggregated",
    isRealTime: false,
    goodDirection: "up",
  },
  {
    label: "Clientes recurrentes (mes)",
    value: "847",
    trend: { direction: "up", value: "+52" },
    source: "CRM",
    frequency: "aggregated",
    isRealTime: false,
    goodDirection: "up",
  },
  {
    label: "LTV medio",
    value: "€3.840",
    trend: { direction: "up", value: "+€120" },
    source: "CRM + Billing",
    frequency: "aggregated",
    isRealTime: false,
    goodDirection: "up",
  },
  {
    label: "Ingresos estimados (mes)",
    value: "€98.540",
    trend: { direction: "up", value: "+4.2%" },
    source: "D1 + POS",
    frequency: "aggregated",
    isRealTime: false,
    goodDirection: "up",
  },
];

const CHANNEL_DATA = [
  { name: "Web", pct: 42, icon: Globe, color: "bg-[var(--gold)]" },
  { name: "Google", pct: 28, icon: Globe, color: "bg-[var(--teal)]" },
  { name: "WhatsApp", pct: 18, icon: MessageCircle, color: "bg-emerald-400" },
  { name: "Phone", pct: 12, icon: Phone, color: "bg-amber-400" },
];

const WAITER_DATA = [
  { name: "Carlos", rating: 4.6, services: 142 },
  { name: "María", rating: 4.8, services: 168 },
  { name: "Juan", rating: 4.2, services: 96 },
];

const ZONE_DATA = [
  { name: "Sala", pct: 82 },
  { name: "Terraza", pct: 91 },
  { name: "VIP", pct: 45 },
  { name: "Barra", pct: 67 },
];

const FRANJA_DATA = [
  { name: "13:00", value: 320 },
  { name: "14:00", value: 580 },
  { name: "20:00", value: 480 },
  { name: "21:00", value: 720 },
  { name: "22:00", value: 410 },
];

/* =========================================================
 * Period comparison
 * =======================================================*/
const PERIOD_COMPARISON = [
  { metric: "Reservas totales", before: "312", after: "347", delta: "+11.2%", good: true },
  { metric: "Ocupación media", before: "72%", after: "74%", delta: "+2pp", good: true },
  { metric: "No-show rate", before: "8.6%", after: "8.2%", delta: "-0.4pp", good: true },
  { metric: "Ticket medio", before: "€36", after: "€38", delta: "+5.6%", good: true },
  { metric: "Cancelación rate", before: "5.3%", after: "5.1%", delta: "-0.2pp", good: true },
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

  // Determine if trend is good: direction matches goodDirection
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
      className="rp-glass rounded-xl p-4 transition-colors hover:bg-foreground/[0.03]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground truncate">
            {metric.label}
          </div>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider",
            freq.cls
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", freq.dot)} />
          {freq.short}
        </span>
      </div>

      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="font-display text-2xl font-light tabular-nums sm:text-3xl text-foreground">
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
                : "text-muted-foreground"
            )}
          >
            <TrendIcon direction={metric.trend.direction} good={isGood} />
            {metric.trend.value}
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono text-muted-foreground">
          {metric.source}
        </span>
        {metric.formula && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="grid h-5 w-5 place-items-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
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
}: {
  title: string;
  icon: React.ElementType;
  kpis: (KpiMetric & { goodDirection?: "up" | "down" })[];
  accent: "emerald" | "teal" | "gold";
}) {
  const reduce = useReducedMotion();
  const accentCls: Record<string, string> = {
    emerald: "text-emerald-300 border-emerald-400/40",
    teal: "rp-teal-text border-[var(--teal)]/40",
    gold: "rp-gold-text border-[var(--gold)]/40",
  };

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rp-glass rounded-2xl p-4 sm:p-5"
    >
      <header className="mb-4 flex items-center gap-2.5">
        <span
          className={cn(
            "grid h-8 w-8 place-items-center rounded-lg border",
            accentCls[accent]
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-medium text-foreground sm:text-base">{title}</h3>
      </header>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {kpis.map((k, i) => (
          <KpiCard key={k.label} metric={k} index={i} />
        ))}
      </div>
    </motion.section>
  );
}

/* =========================================================
 * Channel performance bar
 * =======================================================*/
function ChannelBars() {
  const reduce = useReducedMotion();
  return (
    <div className="space-y-3">
      {CHANNEL_DATA.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={c.name}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-foreground">
                <Icon className="h-3 w-3 text-muted-foreground" />
                {c.name}
              </span>
              <span className="font-mono tabular-nums text-muted-foreground">{c.pct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
              <motion.div
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${c.pct}%` }}
                transition={{ duration: 0.6, delay: reduce ? 0 : i * 0.05, ease: "easeOut" }}
                className={cn("h-full rounded-full", c.color)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
 * Zone utilization bars
 * =======================================================*/
function ZoneBars() {
  const reduce = useReducedMotion();
  const maxPct = Math.max(...ZONE_DATA.map((z) => z.pct));
  return (
    <div className="space-y-3">
      {ZONE_DATA.map((z, i) => (
        <div key={z.name}>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-foreground">{z.name}</span>
            <span
              className={cn(
                "font-mono tabular-nums",
                z.pct >= 85 ? "rp-gold-text" : z.pct >= 60 ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {z.pct}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
            <motion.div
              initial={reduce ? false : { width: 0 }}
              animate={{ width: `${(z.pct / maxPct) * 100}%` }}
              transition={{ duration: 0.6, delay: reduce ? 0 : i * 0.05, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full",
                z.pct >= 85
                  ? "bg-gradient-to-r from-[var(--gold)]/60 to-[var(--gold)]"
                  : z.pct >= 60
                  ? "bg-gradient-to-r from-[var(--teal)]/60 to-[var(--teal)]"
                  : "bg-foreground/40"
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
 * Revenue per franja bar chart
 * =======================================================*/
function FranjaChart() {
  const reduce = useReducedMotion();
  const max = Math.max(...FRANJA_DATA.map((f) => f.value));
  return (
    <div className="flex h-44 items-end gap-3 sm:gap-4">
      {FRANJA_DATA.map((f, i) => {
        const h = (f.value / max) * 100;
        return (
          <div key={f.name} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-1 items-end">
              <motion.div
                initial={reduce ? false : { height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.6, delay: reduce ? 0 : i * 0.06, ease: "easeOut" }}
                className={cn(
                  "w-full rounded-t-md",
                  f.value === max
                    ? "bg-gradient-to-t from-[var(--gold)]/40 to-[var(--gold)]"
                    : "bg-gradient-to-t from-[var(--teal)]/40 to-[var(--teal)]/80"
                )}
              >
                <div className="px-1 py-1 text-center text-[10px] font-mono tabular-nums text-foreground/80">
                  €{f.value}
                </div>
              </motion.div>
            </div>
            <div className="text-[10px] font-mono text-muted-foreground">{f.name}</div>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
 * Waiter table
 * =======================================================*/
function WaiterTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/40">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-foreground/[0.04] text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            <th className="px-3 py-2 text-left">Camarero</th>
            <th className="px-3 py-2 text-right">Rating</th>
            <th className="px-3 py-2 text-right">Servicios</th>
          </tr>
        </thead>
        <tbody>
          {WAITER_DATA.map((w) => (
            <tr key={w.name} className="border-t border-border/40">
              <td className="px-3 py-2 text-foreground">{w.name}</td>
              <td className="px-3 py-2 text-right">
                <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                  <Star className="h-3 w-3 text-[var(--gold)]" />
                  {w.rating.toFixed(1)}
                </span>
              </td>
              <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
                {w.services}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2l2.39 7.36H22l-6.18 4.49L18.21 22 12 17.27 5.79 22l2.39-8.15L2 9.36h7.61z" />
    </svg>
  );
}

/* =========================================================
 * Period comparison row
 * =======================================================*/
function PeriodRow({
  metric,
  before,
  after,
  delta,
  good,
  index,
}: {
  metric: string;
  before: string;
  after: string;
  delta: string;
  good: boolean;
  index: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: reduce ? 0 : index * 0.04 }}
      className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-foreground/[0.02] p-3"
    >
      <div className="min-w-0 flex-1">
        <div className="text-sm text-foreground">{metric}</div>
        <div className="mt-1 flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
          <span>{before}</span>
          <span className="text-foreground/40">→</span>
          <span className="text-foreground">{after}</span>
        </div>
      </div>
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-mono tabular-nums",
          good
            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
            : "border-destructive/30 bg-destructive/10 text-destructive"
        )}
      >
        {good ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {delta}
      </span>
    </motion.div>
  );
}

/* =========================================================
 * Live indicator (pulse)
 * =========================================================*/
function LiveDot({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  return (
    <span className="relative inline-flex h-2 w-2">
      {active && !reduce && (
        <motion.span
          className="absolute inset-0 rounded-full bg-emerald-400"
          animate={{ opacity: [0.6, 0, 0], scale: [1, 2.4, 2.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <span
        className={cn(
          "relative inline-flex h-2 w-2 rounded-full",
          active ? "bg-emerald-400" : "bg-foreground/40"
        )}
      />
    </span>
  );
}

/* =========================================================
 * Main component
 * =======================================================*/
export function ReservationKpis() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [period, setPeriod] = React.useState<"week" | "month">("week");
  const [lastUpdated, setLastUpdated] = React.useState<string>(
    new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  );
  const [liveTick, setLiveTick] = React.useState(0);

  // Simulate real-time updates
  React.useEffect(() => {
    const id = window.setInterval(() => {
      setLastUpdated(
        new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
      setLiveTick((t) => t + 1);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  const handleExport = (format: "csv" | "pdf") => {
    toast({
      title: `Exportando (${format.toUpperCase()})`,
      description: `Generando informe de KPIs · demo`,
    });
  };

  return (
    <TooltipProvider delayDuration={150}>
      <section aria-labelledby="kpis-title" className="flex flex-col gap-5">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--gold)]/10 text-[var(--gold)]">
                <Activity className="h-5 w-5" />
              </span>
              <h2
                id="kpis-title"
                className="font-display text-xl sm:text-2xl font-medium tracking-tight"
              >
                KPIs de reservas
              </h2>
              <Badge
                variant="outline"
                className="border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)] font-mono text-[10px] uppercase tracking-wider"
              >
                demo
              </Badge>
            </div>
            <p className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
              <LiveDot active />
              Última actualización: <span className="font-mono text-foreground">{lastUpdated}</span>
              {liveTick > 0 && (
                <span className="text-[11px] text-emerald-300/80">· live</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9" onClick={() => handleExport("csv")}>
              <Download className="h-3.5 w-3.5" />
              CSV
            </Button>
            <Button variant="outline" size="sm" className="h-9" onClick={() => handleExport("pdf")}>
              <FileText className="h-3.5 w-3.5" />
              PDF
            </Button>
          </div>
        </header>

        {/* Frequency legend */}
        <div className="rp-glass flex flex-wrap items-center gap-3 rounded-xl p-3.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Frecuencia:
          </span>
          {(["real-time", "near-real-time", "aggregated"] as Frequency[]).map((f) => (
            <span
              key={f}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-mono",
                FREQ_META[f].cls
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", FREQ_META[f].dot)} />
              {FREQ_META[f].label}
            </span>
          ))}
        </div>

        {/* KPI grid: 4 sections */}
        <KpiSection
          title="Tiempo real"
          icon={Zap}
          kpis={RT_KPIS}
          accent="emerald"
        />

        <KpiSection
          title="Casi tiempo real · 30s"
          icon={Timer}
          kpis={NRT_KPIS}
          accent="teal"
        />

        <KpiSection
          title="Agregado · diario"
          icon={CalendarClock}
          kpis={AGG_KPIS}
          accent="gold"
        />

        {/* Aggregated historical — richer */}
        <motion.section
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rp-glass rounded-2xl p-4 sm:p-5"
        >
          <header className="mb-4 flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--gold)]/40 rp-gold-text">
              <Crown className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-medium text-foreground sm:text-base">
              Agregado histórico · semanal/mensual
            </h3>
          </header>

          {/* 4 KPI cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-5">
            {HIST_KPIS.map((k, i) => (
              <KpiCard key={k.label} metric={k} index={i} />
            ))}
          </div>

          {/* 3-up grid: channel + zone + franja */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Channel performance */}
            <div className="rounded-xl border border-border/40 bg-foreground/[0.02] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 rp-teal-text" />
                <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Rendimiento por canal
                </h4>
              </div>
              <ChannelBars />
            </div>

            {/* Zone utilization */}
            <div className="rounded-xl border border-border/40 bg-foreground/[0.02] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Armchair className="h-3.5 w-3.5 rp-gold-text" />
                <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Utilización por zona
                </h4>
              </div>
              <ZoneBars />
            </div>

            {/* Revenue per franja */}
            <div className="rounded-xl border border-border/40 bg-foreground/[0.02] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Euro className="h-3.5 w-3.5 text-emerald-300" />
                <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Ingresos por franja
                </h4>
              </div>
              <FranjaChart />
            </div>
          </div>

          {/* Waiter performance */}
          <div className="mt-4">
            <div className="mb-2.5 flex items-center gap-2">
              <Star className="h-3.5 w-3.5 text-[var(--gold)]" />
              <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Rendimiento por camarero
              </h4>
            </div>
            <WaiterTable />
          </div>
        </motion.section>

        {/* Period comparison */}
        <motion.section
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rp-glass rounded-2xl p-4 sm:p-5"
        >
          <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--teal)]/40 rp-teal-text">
                <RotateCw className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-medium text-foreground sm:text-base">
                Comparar periodos
              </h3>
            </div>
            <Select value={period} onValueChange={(v) => setPeriod(v as "week" | "month")}>
              <SelectTrigger className="h-9 w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Esta semana vs anterior</SelectItem>
                <SelectItem value="month">Este mes vs anterior</SelectItem>
              </SelectContent>
            </Select>
          </header>

          <div className="grid gap-2.5 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {PERIOD_COMPARISON.map((p, i) => (
                <PeriodRow
                  key={p.metric + period}
                  metric={p.metric}
                  before={p.before}
                  after={p.after}
                  delta={p.delta}
                  good={p.good}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Data quality note */}
        <div className="rp-glass flex items-start gap-3 rounded-xl border-l-2 border-[var(--teal)]/60 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 rp-teal-text" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Las métricas marcadas como <span className="text-foreground">'Agregado'</span> pueden
            tener un retraso de hasta <span className="text-foreground">5 minutos</span>. Las
            métricas <span className="text-foreground">'Tiempo real'</span> se actualizan en
            menos de <span className="text-foreground">5 segundos</span>. El ticket medio requiere
            integración con TPV.
          </p>
        </div>
      </section>
    </TooltipProvider>
  );
}
