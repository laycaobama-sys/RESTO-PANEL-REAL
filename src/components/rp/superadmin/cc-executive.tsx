"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Activity,
  Info,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Server,
  Database,
  Cloud,
  Cpu,
  Globe2,
  Zap,
  Users,
  CalendarDays,
  DollarSign,
  CreditCard,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  ChevronRight,
  CircleDollarSign,
  Crown,
  Building2,
} from "lucide-react";

/* ============================================================
   Tipos y constantes
   ============================================================ */

type Frequency = "realtime" | "near" | "aggregated";
type TrendDir = "up" | "down" | "flat";
type Tone = "positive" | "negative" | "neutral";

interface Kpi {
  label: string;
  value: string;
  /** Variación absoluta (+€1.200) */
  deltaAbs?: string;
  /** Variación porcentual (+2.5%) */
  deltaPct?: string;
  trend: TrendDir;
  /** "vs mes anterior", "vs ayer"... */
  period: string;
  /** "Stripe", "D1", "Workers"... */
  source: string;
  /** "hace 2 min" */
  updated: string;
  frequency: Frequency;
  /** Tooltip: definición métrica */
  definition: string;
  /** Tooltip: fórmula opcional */
  formula?: string;
  /** 7 puntos para sparkline */
  spark: number[];
  tone: Tone;
}

interface KpiCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  accent: "gold" | "teal" | "fg";
  /** Frecuencia de actualización de toda la categoría */
  categoryFrequency: Frequency;
  /** Etiqueta de frecuencia a mostrar en cabecera */
  categoryFrequencyLabel: string;
  /** Fuente predominante */
  categorySource: string;
  /** Última sincronización */
  synced: string;
  kpis: Kpi[];
}

/* ============================================================
   Shared bits
   ============================================================ */


const FREQ_META: Record<
  Frequency,
  { label: string; dot: string; text: string; border: string; bg: string }
> = {
  realtime: {
    label: "Tiempo real",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    border: "border-emerald-400/30",
    bg: "bg-emerald-400/10",
  },
  near: {
    label: "Casi tiempo real",
    dot: "bg-[var(--teal)]",
    text: "text-[var(--teal)]",
    border: "border-[var(--teal)]/30",
    bg: "bg-[var(--teal)]/10",
  },
  aggregated: {
    label: "Agregado",
    dot: "bg-zinc-400",
    text: "text-zinc-300",
    border: "border-zinc-400/30",
    bg: "bg-zinc-400/10",
  },
};

function FrequencyBadge({ frequency }: { frequency: Frequency }) {
  const m = FREQ_META[frequency];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
        m.border,
        m.bg,
        m.text
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot, frequency === "realtime" && "animate-pulse")} />
      {m.label}
    </span>
  );
}

const SOURCE_TONES: Record<string, string> = {
  Stripe: "border-[var(--gold)]/30 bg-[var(--gold)]/8 text-[var(--gold-soft)]",
  "D1": "border-[var(--teal)]/30 bg-[var(--teal)]/8 text-[var(--teal)]",
  "Analytics Engine": "border-fuchsia-400/30 bg-fuchsia-400/8 text-fuchsia-300",
  Workers: "border-orange-400/30 bg-orange-400/8 text-orange-300",
  R2: "border-sky-400/30 bg-sky-400/8 text-sky-300",
  KV: "border-violet-400/30 bg-violet-400/8 text-violet-300",
  Queues: "border-amber-400/30 bg-amber-400/8 text-amber-300",
};

function SourceBadge({ source }: { source: string }) {
  const tone = SOURCE_TONES[source] || "border-border/60 bg-foreground/5 text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
        tone
      )}
    >
      <Database className="h-2.5 w-2.5" aria-hidden />
      {source}
    </span>
  );
}

function InfoDot({ definition, formula }: { definition: string; formula?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Definición de la métrica"
          className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-border/60 bg-foreground/5 text-muted-foreground transition-colors hover:border-[var(--gold)]/40 hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/40"
        >
          <Info className="h-2.5 w-2.5" aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-[260px] border-border/60 bg-popover/95 text-popover-foreground shadow-xl"
      >
        <div className="space-y-1.5">
          <div className="text-xs leading-relaxed text-foreground/90">{definition}</div>
          {formula && (
            <div className="rounded border border-border/40 bg-foreground/[0.04] px-2 py-1 text-[10px] font-mono text-muted-foreground">
              {formula}
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/* Sparkline SVG (7 puntos) */
function Sparkline({
  values,
  tone,
  width = 64,
  height = 22,
}: {
  values: number[];
  tone: Tone;
  width?: number;
  height?: number;
}) {
  if (!values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 2;
  const stepX = (width - pad * 2) / (values.length - 1);
  const pts = values.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return [x, y] as const;
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0]},${height} L${pts[0][0]},${height} Z`;

  const stroke =
    tone === "positive" ? "var(--teal)" : tone === "negative" ? "#fb7185" : "var(--gold)";
  const fillId = `spark-${tone}-${Math.round(values[0] * 13 + values[values.length - 1] * 7)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      aria-hidden
    >
      <defs>
        <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${fillId})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="1.6" fill={stroke} />
    </svg>
  );
}

function TrendArrow({ dir, tone }: { dir: TrendDir; tone: Tone }) {
  const Icon =
    dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : ArrowRight;
  const color =
    tone === "positive" ? "text-emerald-300"
    : tone === "negative" ? "text-rose-300"
    : "text-muted-foreground";
  return <Icon className={cn("h-3 w-3", color)} aria-hidden />;
}

/* ============================================================
   KPI card
   ============================================================ */

function KpiCard({ kpi }: { kpi: Kpi }) {
  const valueColor =
    kpi.tone === "positive" ? "text-emerald-300"
    : kpi.tone === "negative" ? "text-rose-300"
    : "rp-gold-text";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "group relative flex flex-col gap-2 rounded-xl border border-border/50 bg-foreground/[0.02] p-3.5 transition-colors",
        "hover:border-[var(--gold)]/30 hover:bg-foreground/[0.04]"
      )}
    >
      {/* Header: label + InfoDot */}
      <div className="flex items-start justify-between gap-2">
        <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground leading-tight">
          {kpi.label}
        </div>
        <InfoDot definition={kpi.definition} formula={kpi.formula} />
      </div>

      {/* Value */}
      <div className="flex items-end justify-between gap-2">
        <div className={cn("font-display text-2xl sm:text-[1.65rem] leading-none font-light", valueColor)}>
          {kpi.value}
        </div>
        <div className="opacity-80">
          <Sparkline values={kpi.spark} tone={kpi.tone} />
        </div>
      </div>

      {/* Variation + period */}
      <div className="flex flex-wrap items-center gap-1.5">
        {kpi.deltaAbs && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[11px] font-mono",
              kpi.tone === "positive" ? "text-emerald-300"
              : kpi.tone === "negative" ? "text-rose-300"
              : "text-foreground/80"
            )}
          >
            <TrendArrow dir={kpi.trend} tone={kpi.tone} />
            {kpi.deltaAbs}
          </span>
        )}
        {kpi.deltaPct && (
          <span
            className={cn(
              "inline-flex items-center text-[11px] font-mono",
              kpi.tone === "positive" ? "text-emerald-300/80"
              : kpi.tone === "negative" ? "text-rose-300/80"
              : "text-muted-foreground"
            )}
          >
            ({kpi.deltaPct})
          </span>
        )}
        <span className="text-[10px] text-muted-foreground/80">· {kpi.period}</span>
      </div>

      {/* Footer: source + freq + updated */}
      <div className="mt-1 flex items-center justify-between gap-2 border-t border-border/40 pt-2">
        <SourceBadge source={kpi.source} />
        <div className="flex items-center gap-1.5">
          <FrequencyBadge frequency={kpi.frequency} />
        </div>
      </div>
      <div className="text-[10px] font-mono text-muted-foreground/70">
        Actualizado {kpi.updated}
      </div>
    </motion.div>
  );
}

/* ============================================================
   KPI Category card (contiene grid de KpiCard)
   ============================================================ */

function KpiCategoryCard({ cat }: { cat: KpiCategory }) {
  const Icon = cat.icon;
  const accentColor =
    cat.accent === "gold" ? "rp-gold-text"
    : cat.accent === "teal" ? "rp-teal-text"
    : "text-foreground";
  return (
    <section
      aria-label={cat.title}
      className="rp-glass rounded-2xl p-4 sm:p-5"
    >
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "h-8 w-8 rounded-lg border flex items-center justify-center",
              cat.accent === "gold" ? "border-[var(--gold)]/30 bg-[var(--gold)]/8"
              : cat.accent === "teal" ? "border-[var(--teal)]/30 bg-[var(--teal)]/8"
              : "border-border/60 bg-foreground/5"
            )}
          >
            <Icon className={cn("h-4 w-4", accentColor)} aria-hidden />
          </div>
          <div>
            <h3 className="font-display text-base sm:text-lg font-medium tracking-tight">
              {cat.title}
            </h3>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Fuente: {cat.categorySource} · Sincronizado {cat.synced}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FrequencyBadge frequency={cat.categoryFrequency} />
          
        </div>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {cat.kpis.map((k) => (
          <KpiCard key={k.label} kpi={k} />
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   MRR Forecast Chart (12 meses reales + 3 meses forecast)
   ============================================================ */

function MrrForecastChart() {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic", "Ene+", "Feb+", "Mar+"];
  // 12 meses reales + 3 forecast
  const actual = [28500, 30200, 32800, 35100, 37400, 39200, 41800, 43200, 44600, 45900, 47100, 48250];
  const forecast = [48250, 49800, 51700, 54200]; // incluye punto pivote
  const confLow = [48250, 48600, 49600, 51800];
  const confHigh = [48250, 51000, 53800, 56600];

  const all = [...actual, ...forecast.slice(1)];
  const min = Math.min(...all) * 0.94;
  const max = Math.max(...all) * 1.04;

  const W = 760, H = 320, padL = 48, padR = 24, padT = 24, padB = 36;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const n = months.length;
  const x = (i: number) => padL + (i * innerW) / (n - 1);
  const y = (v: number) => padT + (1 - (v - min) / (max - min)) * innerH;

  const actualPath = actual.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ");
  const forecastPath = forecast.map((v, i) => `${i === 0 ? "M" : "L"}${x(i + 11)},${y(v)}`).join(" ");
  const bandPath =
    confHigh.map((v, i) => `${i === 0 ? "M" : "L"}${x(i + 11)},${y(v)}`).join(" ") +
    " " +
    confLow
      .slice()
      .reverse()
      .map((v, i) => `L${x(confLow.length - 1 - i + 11)},${y(v)}`)
      .join(" ") +
    " Z";

  // Gridlines
  const gridY = [min, min + (max - min) * 0.25, min + (max - min) * 0.5, min + (max - min) * 0.75, max];

  // Event annotations
  const events = [
    { i: 7, label: "Lanzamiento Pro", side: "top" as const },
    { i: 10, label: "Black Friday", side: "bottom" as const },
  ];

  return (
    <div className="overflow-x-auto rp-scroll-thin -mx-1 px-1">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto min-w-[560px]"
        role="img"
        aria-label="Evolución MRR últimos 12 meses con forecast de 3 meses"
      >
        <defs>
          <linearGradient id="mrr-actual-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="mrr-actual-line" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--gold-soft)" />
            <stop offset="100%" stopColor="var(--gold)" />
          </linearGradient>
        </defs>

        {/* Grid horizontal */}
        {gridY.map((v, i) => (
          <g key={i}>
            <line
              x1={padL}
              x2={W - padR}
              y1={y(v)}
              y2={y(v)}
              stroke="currentColor"
              strokeOpacity="0.06"
              strokeDasharray="2 4"
            />
            <text
              x={padL - 8}
              y={y(v) + 3}
              fontSize="9"
              fill="currentColor"
              fillOpacity="0.5"
              textAnchor="end"
              fontFamily="var(--font-jetbrains)"
            >
              {Math.round(v / 1000)}k
            </text>
          </g>
        ))}

        {/* Confidence band */}
        <path d={bandPath} fill="var(--teal)" fillOpacity="0.12" stroke="none" />

        {/* Actual area + line */}
        <path d={`${actualPath} L${x(actual.length - 1)},${padT + innerH} L${x(0)},${padT + innerH} Z`} fill="url(#mrr-actual-fill)" />
        <path d={actualPath} fill="none" stroke="url(#mrr-actual-line)" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />

        {/* Forecast line (dashed) */}
        <path
          d={forecastPath}
          fill="none"
          stroke="var(--teal)"
          strokeWidth="2.2"
          strokeDasharray="5 4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Divisor forecast */}
        <line
          x1={x(actual.length - 1)}
          x2={x(actual.length - 1)}
          y1={padT}
          y2={padT + innerH}
          stroke="currentColor"
          strokeOpacity="0.18"
          strokeDasharray="3 3"
        />
        <text
          x={x(actual.length - 1) + 4}
          y={padT + 10}
          fontSize="9"
          fill="var(--teal)"
          fillOpacity="0.9"
          fontFamily="var(--font-jetbrains)"
        >
          forecast
        </text>

        {/* Event annotations */}
        {events.map((e) => (
          <g key={e.label}>
            <line
              x1={x(e.i)}
              x2={x(e.i)}
              y1={e.side === "top" ? padT : y(actual[e.i])}
              y2={e.side === "top" ? y(actual[e.i]) - 6 : padT + innerH}
              stroke="var(--teal)"
              strokeOpacity="0.45"
              strokeDasharray="2 2"
            />
            <circle cx={x(e.i)} cy={y(actual[e.i])} r="3" fill="var(--background)" stroke="var(--gold)" strokeWidth="1.6" />
            <text
              x={x(e.i)}
              y={e.side === "top" ? padT - 4 : padT + innerH + 12}
              fontSize="9"
              fill="var(--teal)"
              fillOpacity="0.85"
              textAnchor="middle"
              fontFamily="var(--font-jetbrains)"
            >
              {e.label}
            </text>
          </g>
        ))}

        {/* Data points (actual) with native title */}
        {actual.map((v, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(v)} r="2.4" fill="var(--background)" stroke="var(--gold)" strokeWidth="1.4">
              <title>{`${months[i]}: ${v.toLocaleString("es-ES")}€`}</title>
            </circle>
            <text
              x={x(i)}
              y={padT + innerH + 18}
              fontSize="9"
              fill="currentColor"
              fillOpacity="0.55"
              textAnchor="middle"
              fontFamily="var(--font-jetbrains)"
            >
              {months[i]}
            </text>
          </g>
        ))}

        {/* Forecast points */}
        {forecast.slice(1).map((v, i) => (
          <circle key={i} cx={x(i + 12)} cy={y(v)} r="2.2" fill="var(--teal)">
            <title>{`${months[i + 12]} (forecast): ${v.toLocaleString("es-ES")}€`}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}

/* ============================================================
   Reservas Heatmap (24h × 7d)
   ============================================================ */

function ReservasHeatmap() {
  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  // Generar matriz 7×24 con patrones realistas (picos en comida/cena, fines de semana)
  const seed = (d: number, h: number) => {
    let base = 5;
    // Picos de comida (13-15h) y cena (20-22h)
    if (h >= 13 && h <= 15) base += 35;
    if (h >= 20 && h <= 22) base += 55;
    if (h >= 18 && h <= 19) base += 20;
    // Fines de semana (5=Vie, 6=Sáb) más reservas
    if (d === 5) base *= 1.25;
    if (d === 6) base *= 1.4;
    if (d === 0) base *= 1.1;
    // Nocturno/madrugada bajo
    if (h < 8 || h > 23) base = Math.max(2, base * 0.15);
    // Variación pseudoaleatoria estable
    const noise = ((d * 31 + h * 17) % 13) / 13;
    return Math.round(base * (0.85 + noise * 0.3));
  };

  const matrix = days.map((_, d) => Array.from({ length: 24 }, (_, h) => seed(d, h)));
  const max = Math.max(...matrix.flat());

  const W = 760, H = 240, padL = 36, padT = 18, padB = 24, padR = 12;
  const cellW = (W - padL - padR) / 24;
  const cellH = (H - padT - padB) / 7;

  const colorFor = (v: number) => {
    const t = v / max;
    // Gold gradient: 0 → transparent, 1 → gold fuerte
    const opacity = 0.08 + t * 0.92;
    return `var(--gold)`;
  };

  return (
    <div className="overflow-x-auto rp-scroll-thin -mx-1 px-1">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto min-w-[560px]"
        role="img"
        aria-label="Mapa de calor de reservas por hora y día de la semana"
      >
        {/* Hour labels (every 3h) */}
        {Array.from({ length: 24 }, (_, h) => (
          h % 3 === 0 ? (
            <text
              key={h}
              x={padL + h * cellW + cellW / 2}
              y={padT - 6}
              fontSize="8.5"
              fill="currentColor"
              fillOpacity="0.5"
              textAnchor="middle"
              fontFamily="var(--font-jetbrains)"
            >
              {`${h}h`}
            </text>
          ) : null
        ))}

        {/* Day labels + cells */}
        {matrix.map((row, d) => (
          <g key={d}>
            <text
              x={padL - 6}
              y={padT + d * cellH + cellH / 2 + 3}
              fontSize="9"
              fill="currentColor"
              fillOpacity="0.6"
              textAnchor="end"
              fontFamily="var(--font-jetbrains)"
            >
              {days[d]}
            </text>
            {row.map((v, h) => {
              const t = v / max;
              const op = 0.06 + t * 0.94;
              return (
                <rect
                  key={h}
                  x={padL + h * cellW + 1}
                  y={padT + d * cellH + 1}
                  width={cellW - 2}
                  height={cellH - 2}
                  rx="2"
                  fill={colorFor(v)}
                  fillOpacity={op}
                  stroke="var(--gold)"
                  strokeOpacity={t > 0.75 ? 0.4 : 0}
                  strokeWidth="0.5"
                >
                  <title>{`${days[d]} · ${h}:00–${(h + 1) % 24}:00 · ${v} reservas`}</title>
                </rect>
              );
            })}
          </g>
        ))}

        {/* Legend */}
        <g transform={`translate(${padL}, ${H - 10})`}>
          <text x="0" y="3" fontSize="8" fill="currentColor" fillOpacity="0.5" fontFamily="var(--font-jetbrains)">menos</text>
          {Array.from({ length: 8 }, (_, i) => (
            <rect
              key={i}
              x={36 + i * 10}
              y={-3}
              width="9"
              height="6"
              rx="1"
              fill="var(--gold)"
              fillOpacity={0.06 + (i / 7) * 0.94}
            />
          ))}
          <text x="124" y="3" fontSize="8" fill="currentColor" fillOpacity="0.5" fontFamily="var(--font-jetbrains)">más</text>
        </g>
      </svg>
    </div>
  );
}

/* ============================================================
   AI Recommendations
   ============================================================ */

interface AIRec {
  id: string;
  title: string;
  insight: string;
  confidence: number;
  severity: "info" | "warning" | "critical" | "opportunity";
  icon: React.ElementType;
}

const AI_RECS: AIRec[] = [
  {
    id: "r1",
    title: "3 organizaciones muestran riesgo de churn",
    insight: "Reducción de actividad +24% en usuarios activos y caída de reservas del 18% en los últimos 14 días.",
    confidence: 86,
    severity: "warning",
    icon: AlertTriangle,
  },
  {
    id: "r2",
    title: "MRR forecast +8% próximo trimestre",
    insight: "Modelo ARIMA(1,1,1)+estacionalidad proyecta €52.1k MRR en 90 días con intervalo de confianza [€50.4k, €53.9k].",
    confidence: 78,
    severity: "opportunity",
    icon: TrendingUp,
  },
  {
    id: "r3",
    title: "Consumo de IA +15% en Ramses Group",
    insight: "Créditos IA en 92% del límite del plan Enterprise. Recomendado: revisar upgrade a IA Pro o ajustar cuota.",
    confidence: 91,
    severity: "info",
    icon: Sparkles,
  },
  {
    id: "r4",
    title: "Latencia p99 elevada en región EU-West",
    insight: "p99 = 156ms (objetivo <120ms). Posible causa: D1 read replica lag durante pico. Considerar warm-up de caché KV.",
    confidence: 73,
    severity: "critical",
    icon: Zap,
  },
];

const SEVERITY_STYLES: Record<AIRec["severity"], { ring: string; text: string; bg: string; label: string }> = {
  info: { ring: "border-[var(--teal)]/30", text: "text-[var(--teal)]", bg: "bg-[var(--teal)]/8", label: "Info" },
  warning: { ring: "border-amber-400/30", text: "text-amber-300", bg: "bg-amber-400/8", label: "Atención" },
  critical: { ring: "border-rose-400/40", text: "text-rose-300", bg: "bg-rose-400/8", label: "Crítico" },
  opportunity: { ring: "border-emerald-400/30", text: "text-emerald-300", bg: "bg-emerald-400/8", label: "Oportunidad" },
};

function ConfidenceBar({ value }: { value: number }) {
  const tone = value >= 80 ? "var(--teal)" : value >= 65 ? "var(--gold)" : "#fb7185";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-16 overflow-hidden rounded-full bg-foreground/10">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, background: tone }}
        />
      </div>
      <span className="font-mono text-[10px] text-muted-foreground">{value}%</span>
    </div>
  );
}

function AIRecommendations() {
  return (
    <div className="rp-glass rounded-2xl p-4 sm:p-5 h-full border-l-2 border-[var(--teal)]/40">
      <header className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg border border-[var(--teal)]/30 bg-[var(--teal)]/8 flex items-center justify-center">
            <Sparkles className="h-4 w-4 rp-teal-text" aria-hidden />
          </div>
          <div>
            <h3 className="font-display text-base sm:text-lg font-medium tracking-tight">
              Recomendaciones IA
            </h3>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Modelo: rp-forecaster-v3 · hace 4 min
            </div>
          </div>
        </div>
        
      </header>
      <ul className="space-y-2.5">
        {AI_RECS.map((r) => {
          const s = SEVERITY_STYLES[r.severity];
          const Icon = r.icon;
          return (
            <li
              key={r.id}
              className={cn(
                "rounded-xl border bg-foreground/[0.02] p-3 transition-colors hover:bg-foreground/[0.04]",
                s.ring
              )}
            >
              <div className="flex items-start gap-2.5">
                <div className={cn("mt-0.5 h-6 w-6 shrink-0 rounded-md flex items-center justify-center", s.bg, s.text)}>
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium text-foreground/90 leading-snug">{r.title}</h4>
                    <span className={cn("shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider", s.ring, s.bg, s.text)}>
                      {s.label}
                    </span>
                  </div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{r.insight}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">Confianza</span>
                      <ConfidenceBar value={r.confidence} />
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-md border border-border/50 px-2 py-1 text-[11px] text-foreground/80 transition-colors hover:border-[var(--teal)]/40 hover:text-[var(--teal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--teal)]/40 min-h-[36px]"
                    >
                      Ver detalle
                      <ChevronRight className="h-3 w-3" aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ============================================================
   Services status (compact)
   ============================================================ */

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  uptime: string;
  icon: React.ElementType;
}

const SERVICES: ServiceStatus[] = [
  { name: "API Gateway", status: "operational", uptime: "99.97%", icon: Globe2 },
  { name: "D1 (Base de datos)", status: "operational", uptime: "100%", icon: Database },
  { name: "R2 (Object Store)", status: "operational", uptime: "100%", icon: Cloud },
  { name: "Queues", status: "degraded", uptime: "99.95%", icon: Activity },
  { name: "AI Gateway", status: "operational", uptime: "99.8%", icon: Cpu },
  { name: "Stripe webhook", status: "operational", uptime: "100%", icon: CreditCard },
];

function ServicesStatus() {
  return (
    <div className="rp-glass rounded-2xl p-4 sm:p-5 h-full">
      <header className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg border border-border/60 bg-foreground/5 flex items-center justify-center">
            <Server className="h-4 w-4 text-foreground/80" aria-hidden />
          </div>
          <div>
            <h3 className="font-display text-base sm:text-lg font-medium tracking-tight">
              Estado de servicios
            </h3>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              90 días rolling · hace 30 s
            </div>
          </div>
        </div>
        
      </header>
      <ul className="space-y-1.5">
        {SERVICES.map((s) => {
          const Icon = s.icon;
          const dot =
            s.status === "operational" ? "bg-emerald-400"
            : s.status === "degraded" ? "bg-amber-400"
            : "bg-rose-400";
          const text =
            s.status === "operational" ? "text-emerald-300"
            : s.status === "degraded" ? "text-amber-300"
            : "text-rose-300";
          const label =
            s.status === "operational" ? "Operativo"
            : s.status === "degraded" ? "Degradado"
            : "Caído";
          return (
            <li
              key={s.name}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-foreground/[0.02] px-3 py-2.5 transition-colors hover:bg-foreground/[0.04] min-h-[44px]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden />
                <span className="text-sm text-foreground/85 truncate">{s.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-xs text-muted-foreground">{s.uptime}</span>
                <span className={cn("inline-flex items-center gap-1.5 text-xs", text)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", dot, s.status === "operational" && "animate-pulse")} />
                  {label}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-amber-400/25 bg-amber-400/[0.04] px-3 py-2 text-[11px] text-amber-200/90">
        <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden />
        1 servicio degradado: latencia p99 elevada en Queues (EU-West).
      </div>
    </div>
  );
}

/* ============================================================
   Orgs needing attention
   ============================================================ */

interface AttentionOrg {
  id: string;
  name: string;
  plan: "Starter" | "Professional" | "Enterprise";
  issue: string;
  issueType: "churn" | "payment" | "errors" | "usage";
  priority: "alta" | "media" | "baja";
  initials: string;
}

const ATTENTION_ORGS: AttentionOrg[] = [
  { id: "o1", name: "Parrilla Sur", plan: "Starter", issue: "Riesgo de churn · 12 días inactiva", issueType: "churn", priority: "alta", initials: "PS" },
  { id: "o2", name: "Trattoria Bellini", plan: "Starter", issue: "Pago fallido · factura #INV-2231", issueType: "payment", priority: "alta", initials: "TB" },
  { id: "o3", name: "El Club del Chef", plan: "Professional", issue: "Spike de errores 0.8% en /reservas", issueType: "errors", priority: "media", initials: "EC" },
  { id: "o4", name: "Café Central Lisboa", plan: "Starter", issue: "Trial expira en 2 días · sin conversión", issueType: "churn", priority: "media", initials: "CL" },
];

const ISSUE_STYLES: Record<AttentionOrg["issueType"], { color: string; icon: React.ElementType }> = {
  churn: { color: "text-rose-300", icon: TrendingDown },
  payment: { color: "text-amber-300", icon: CreditCard },
  errors: { color: "text-orange-300", icon: AlertTriangle },
  usage: { color: "text-[var(--teal)]", icon: Activity },
};

const PRIORITY_STYLES: Record<AttentionOrg["priority"], string> = {
  alta: "border-rose-400/40 bg-rose-400/10 text-rose-300",
  media: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  baja: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
};

function OrgsAttention() {
  return (
    <div className="rp-glass rounded-2xl p-4 sm:p-5 h-full">
      <header className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/8 flex items-center justify-center">
            <Building2 className="h-4 w-4 rp-gold-text" aria-hidden />
          </div>
          <div>
            <h3 className="font-display text-base sm:text-lg font-medium tracking-tight">
              Organizaciones con atención
            </h3>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Score de salud · hace 5 min
            </div>
          </div>
        </div>
        
      </header>
      <ul className="space-y-2">
        {ATTENTION_ORGS.map((o) => {
          const s = ISSUE_STYLES[o.issueType];
          const IssueIcon = s.icon;
          return (
            <li
              key={o.id}
              className="rounded-xl border border-border/40 bg-foreground/[0.02] p-3 transition-colors hover:bg-foreground/[0.04] min-h-[44px]"
            >
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 shrink-0 rounded-md border border-[var(--gold)]/25 bg-gradient-to-br from-[var(--gold)]/20 to-[var(--teal)]/15 flex items-center justify-center text-[11px] font-mono text-[var(--gold-soft)]">
                  {o.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-medium text-foreground/90 truncate">{o.name}</h4>
                    <span className={cn("shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider", PRIORITY_STYLES[o.priority])}>
                      {o.priority}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Badge variant="outline" className="border-border/60 bg-foreground/5 text-muted-foreground text-[9px] px-1.5 py-0">
                      {o.plan}
                    </Badge>
                    <span className={cn("inline-flex items-center gap-1", s.color)}>
                      <IssueIcon className="h-3 w-3" aria-hidden />
                      {o.issue}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="mt-2.5 inline-flex w-full items-center justify-center gap-1 rounded-md border border-border/50 py-1.5 text-[11px] text-foreground/80 transition-colors hover:border-[var(--gold)]/40 hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/40 min-h-[36px]"
              >
                Ver ficha
                <ChevronRight className="h-3 w-3" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ============================================================
   Datos demo de KPIs
   ============================================================ */

const FINANCE_KPIS: Kpi[] = [
  {
    label: "MRR",
    value: "48.250€",
    deltaAbs: "+1.200€",
    deltaPct: "+2.5%",
    trend: "up",
    period: "vs mes anterior",
    source: "Stripe",
    updated: "hace 2 min",
    frequency: "aggregated",
    definition: "Monthly Recurring Revenue: suma de todos los ingresos recurrentes mensuales de suscripciones activas a final del mes.",
    formula: "Σ(suscripción_activa.monto_mensual)",
    spark: [46.0, 46.4, 46.9, 47.1, 47.5, 47.9, 48.25],
    tone: "positive",
  },
  {
    label: "ARR",
    value: "579.000€",
    deltaAbs: "+14.400€",
    deltaPct: "+2.5%",
    trend: "up",
    period: "vs mes anterior",
    source: "Stripe",
    updated: "hace 2 min",
    frequency: "aggregated",
    definition: "Annual Recurring Revenue: ingresos recurrentes anualizados. MRR × 12.",
    formula: "MRR × 12",
    spark: [552, 558, 562, 566, 570, 574, 579],
    tone: "positive",
  },
  {
    label: "Ingresos hoy",
    value: "4.182€",
    deltaAbs: "+230€",
    deltaPct: "+5.8%",
    trend: "up",
    period: "vs ayer",
    source: "Stripe",
    updated: "hace 5 min",
    frequency: "near",
    definition: "Ingresos totales (recurrentes + no recurrentes) facturados en el día actual.",
    formula: "Σ(cargo_del_dia)",
    spark: [3.4, 3.6, 3.7, 3.85, 4.0, 4.08, 4.18],
    tone: "positive",
  },
  {
    label: "Ingresos mes",
    value: "98.540€",
    deltaAbs: "+2.450€",
    deltaPct: "+2.5%",
    trend: "up",
    period: "vs mes anterior",
    source: "Stripe",
    updated: "hace 10 min",
    frequency: "aggregated",
    definition: "Ingresos acumulados del mes en curso a fecha de hoy.",
    formula: "Σ(cargo_desde_1º_del_mes)",
    spark: [94.0, 95.1, 96.2, 96.9, 97.4, 98.0, 98.5],
    tone: "positive",
  },
  {
    label: "MRR Growth",
    value: "+2.5%",
    deltaAbs: "+0.3pp",
    deltaPct: "",
    trend: "up",
    period: "vs mes anterior",
    source: "Analytics Engine",
    updated: "hace 30 min",
    frequency: "aggregated",
    definition: "Crecimiento porcentual del MRR respecto al mes anterior.",
    formula: "(MRR_actual − MRR_anterior) / MRR_anterior × 100",
    spark: [1.8, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5],
    tone: "positive",
  },
  {
    label: "Expansion MRR",
    value: "+800€",
    deltaAbs: "+120€",
    deltaPct: "+17.6%",
    trend: "up",
    period: "vs mes anterior",
    source: "Stripe",
    updated: "hace 1 h",
    frequency: "aggregated",
    definition: "MRR adicional generado por upgrades y expansión dentro de cuentas existentes.",
    formula: "Σ(nuevo_monto − monto_anterior) para upgrades",
    spark: [560, 600, 640, 680, 720, 760, 800],
    tone: "positive",
  },
  {
    label: "Contraction MRR",
    value: "-300€",
    deltaAbs: "-50€",
    deltaPct: "-14.3%",
    trend: "down",
    period: "vs mes anterior",
    source: "Stripe",
    updated: "hace 1 h",
    frequency: "aggregated",
    definition: "MRR perdido por downgrades y reducción de asientos en cuentas existentes.",
    formula: "Σ(monto_anterior − nuevo_monto) para downgrades",
    spark: [450, 420, 390, 360, 340, 320, 300],
    tone: "positive",
  },
  {
    label: "Refunds",
    value: "-120€",
    deltaAbs: "-30€",
    deltaPct: "-20%",
    trend: "down",
    period: "vs mes anterior",
    source: "Stripe",
    updated: "hace 1 h",
    frequency: "aggregated",
    definition: "Importe total reembolsado en el mes actual.",
    formula: "Σ(refund.monto)",
    spark: [220, 190, 170, 160, 150, 140, 120],
    tone: "negative",
  },
  {
    label: "ARPU",
    value: "149€",
    deltaAbs: "+3€",
    deltaPct: "+2.1%",
    trend: "up",
    period: "vs mes anterior",
    source: "Analytics Engine",
    updated: "hace 30 min",
    frequency: "aggregated",
    definition: "Average Revenue Per User: ingreso medio mensual por organización activa.",
    formula: "MRR / organizaciones_activas",
    spark: [142, 143, 145, 146, 147, 148, 149],
    tone: "positive",
  },
  {
    label: "LTV",
    value: "3.840€",
    deltaAbs: "+120€",
    deltaPct: "+3.2%",
    trend: "up",
    period: "vs trimestre anterior",
    source: "Analytics Engine",
    updated: "hace 1 día",
    frequency: "aggregated",
    definition: "Customer Lifetime Value: valor estimado total de un cliente durante su vida útil.",
    formula: "ARPU × margen × (1 / churn_rate)",
    spark: [3520, 3580, 3640, 3700, 3750, 3790, 3840],
    tone: "positive",
  },
  {
    label: "CAC",
    value: "412€",
    deltaAbs: "-35€",
    deltaPct: "-7.8%",
    trend: "down",
    period: "vs trimestre anterior",
    source: "Analytics Engine",
    updated: "hace 1 día",
    frequency: "aggregated",
    definition: "Customer Acquisition Cost: coste medio de adquirir un nuevo cliente.",
    formula: "Σ(gastos_marketing + ventas) / nuevos_clientes",
    spark: [510, 490, 470, 455, 440, 425, 412],
    tone: "positive",
  },
  {
    label: "Margen estimado",
    value: "72%",
    deltaAbs: "+1.2pp",
    deltaPct: "",
    trend: "up",
    period: "vs trimestre anterior",
    source: "Analytics Engine",
    updated: "hace 1 día",
    frequency: "aggregated",
    definition: "Margen bruto estimado sobre ingresos tras descontar costes directos de infraestructura y soporte.",
    formula: "(ingresos − costes_infra − costes_soporte) / ingresos × 100",
    spark: [68, 69, 70, 70.5, 71, 71.5, 72],
    tone: "positive",
  },
  {
    label: "Beneficio estimado",
    value: "35.300€",
    deltaAbs: "+1.200€",
    deltaPct: "+3.5%",
    trend: "up",
    period: "vs mes anterior",
    source: "Analytics Engine",
    updated: "hace 1 día",
    frequency: "aggregated",
    definition: "Beneficio operativo estimado del mes tras aplicar margen a ingresos recurrentes.",
    formula: "MRR × margen_estimado",
    spark: [31.5, 32.2, 32.9, 33.6, 34.2, 34.8, 35.3],
    tone: "positive",
  },
];

const CUSTOMER_KPIS: Kpi[] = [
  {
    label: "Clientes activos",
    value: "324",
    deltaAbs: "+8",
    deltaPct: "+2.5%",
    trend: "up",
    period: "vs mes anterior",
    source: "D1",
    updated: "hace 5 min",
    frequency: "aggregated",
    definition: "Organizaciones con suscripción activa y al menos un usuario con acceso en los últimos 30 días.",
    formula: "COUNT(org WHERE estado='activa' AND last_login ≤ 30d)",
    spark: [310, 313, 315, 318, 320, 322, 324],
    tone: "positive",
  },
  {
    label: "Nuevos",
    value: "8",
    deltaAbs: "+2",
    deltaPct: "+33%",
    trend: "up",
    period: "vs ayer",
    source: "Analytics Engine",
    updated: "hace 1 h",
    frequency: "aggregated",
    definition: "Altas de nuevas organizaciones en el día actual.",
    formula: "COUNT(org WHERE created_at = today)",
    spark: [4, 5, 6, 6, 7, 7, 8],
    tone: "positive",
  },
  {
    label: "Trials",
    value: "12",
    deltaAbs: "+1",
    deltaPct: "+9%",
    trend: "up",
    period: "vs semana anterior",
    source: "D1",
    updated: "hace 1 h",
    frequency: "aggregated",
    definition: "Organizaciones en periodo de prueba gratuito pendientes de conversión.",
    formula: "COUNT(org WHERE plan='trial' AND trial_ends_at > now)",
    spark: [9, 9, 10, 10, 11, 11, 12],
    tone: "neutral",
  },
  {
    label: "Renovaciones",
    value: "15",
    deltaAbs: "+3",
    deltaPct: "+25%",
    trend: "up",
    period: "vs mes anterior",
    source: "Stripe",
    updated: "hace 1 h",
    frequency: "aggregated",
    definition: "Suscripciones renovadas automáticamente en el mes actual.",
    formula: "COUNT(subscription WHERE renewed_at IS in current_month)",
    spark: [11, 12, 12, 13, 14, 14, 15],
    tone: "positive",
  },
  {
    label: "Impagos",
    value: "3",
    deltaAbs: "+1",
    deltaPct: "+50%",
    trend: "up",
    period: "vs mes anterior",
    source: "Stripe",
    updated: "hace 1 h",
    frequency: "aggregated",
    definition: "Suscripciones con cobro fallido en los últimos 7 días pendientes de reintentos.",
    formula: "COUNT(invoice WHERE status='open' AND due_date < now − 7d)",
    spark: [2, 2, 2, 2, 3, 3, 3],
    tone: "negative",
  },
  {
    label: "Upgrades",
    value: "2",
    deltaAbs: "+1",
    deltaPct: "+100%",
    trend: "up",
    period: "vs mes anterior",
    source: "Stripe",
    updated: "hace 1 h",
    frequency: "aggregated",
    definition: "Organizaciones que han mejorado de plan en el mes actual.",
    formula: "COUNT(subscription WHERE plan_changed_to > plan_changed_from)",
    spark: [1, 1, 1, 1, 2, 2, 2],
    tone: "positive",
  },
  {
    label: "Downgrades",
    value: "1",
    deltaAbs: "0",
    deltaPct: "0%",
    trend: "flat",
    period: "vs mes anterior",
    source: "Stripe",
    updated: "hace 1 h",
    frequency: "aggregated",
    definition: "Organizaciones que han reducido de plan en el mes actual.",
    formula: "COUNT(subscription WHERE plan_changed_to < plan_changed_from)",
    spark: [1, 1, 1, 1, 1, 1, 1],
    tone: "negative",
  },
  {
    label: "Cancelaciones",
    value: "4",
    deltaAbs: "-1",
    deltaPct: "-20%",
    trend: "down",
    period: "vs mes anterior",
    source: "Analytics Engine",
    updated: "hace 1 h",
    frequency: "aggregated",
    definition: "Bajas voluntarias de suscripción en el mes actual.",
    formula: "COUNT(subscription WHERE canceled_at IS in current_month)",
    spark: [6, 5, 5, 4, 4, 4, 4],
    tone: "positive",
  },
  {
    label: "Churn Rate",
    value: "2.1%",
    deltaAbs: "-0.3pp",
    deltaPct: "",
    trend: "down",
    period: "vs mes anterior",
    source: "Analytics Engine",
    updated: "hace 1 día",
    frequency: "aggregated",
    definition: "Tasa de cancelación mensual: porcentaje de MRR perdido por bajas en el mes.",
    formula: "(MRR_perdido_por_churn / MRR_inicio_mes) × 100",
    spark: [2.7, 2.6, 2.5, 2.4, 2.3, 2.2, 2.1],
    tone: "positive",
  },
];

const OPS_KPIS: Kpi[] = [
  {
    label: "Reservas creadas",
    value: "1.247",
    deltaAbs: "+87",
    deltaPct: "+7.5%",
    trend: "up",
    period: "vs ayer",
    source: "Workers",
    updated: "hace 30 s",
    frequency: "near",
    definition: "Reservas creadas en todas las organizaciones en las últimas 24h.",
    formula: "COUNT(reservation WHERE created_at > now − 24h)",
    spark: [1080, 1120, 1150, 1180, 1200, 1220, 1247],
    tone: "positive",
  },
  {
    label: "Completadas",
    value: "1.189",
    deltaAbs: "+74",
    deltaPct: "+6.6%",
    trend: "up",
    period: "vs ayer",
    source: "Workers",
    updated: "hace 30 s",
    frequency: "near",
    definition: "Reservas marcadas como completadas (cliente asistió) en las últimas 24h.",
    formula: "COUNT(reservation WHERE status='completed' AND completed_at > now − 24h)",
    spark: [1040, 1075, 1105, 1130, 1155, 1175, 1189],
    tone: "positive",
  },
  {
    label: "Cancelaciones",
    value: "58",
    deltaAbs: "+6",
    deltaPct: "+11.5%",
    trend: "up",
    period: "vs ayer",
    source: "Workers",
    updated: "hace 30 s",
    frequency: "near",
    definition: "Reservas canceladas por el cliente o por el local en las últimas 24h.",
    formula: "COUNT(reservation WHERE status='canceled' AND canceled_at > now − 24h)",
    spark: [42, 46, 48, 51, 54, 56, 58],
    tone: "negative",
  },
  {
    label: "No-shows",
    value: "42",
    deltaAbs: "+5",
    deltaPct: "+13.5%",
    trend: "up",
    period: "vs ayer",
    source: "Workers",
    updated: "hace 30 s",
    frequency: "near",
    definition: "Reservas donde el cliente no se presentó en las últimas 24h.",
    formula: "COUNT(reservation WHERE status='no_show' AND scheduled_at > now − 24h)",
    spark: [30, 33, 35, 37, 39, 40, 42],
    tone: "negative",
  },
  {
    label: "Usuarios conectados",
    value: "87",
    deltaAbs: "+12",
    deltaPct: "+16%",
    trend: "up",
    period: "vs ayer",
    source: "D1",
    updated: "hace 5 s",
    frequency: "realtime",
    definition: "Usuarios activos con sesión abierta en los últimos 5 minutos.",
    formula: "COUNT(session WHERE last_activity > now − 5min)",
    spark: [60, 68, 72, 78, 82, 84, 87],
    tone: "positive",
  },
  {
    label: "Emails enviados",
    value: "320",
    deltaAbs: "+45",
    deltaPct: "+16.4%",
    trend: "up",
    period: "vs ayer",
    source: "Workers",
    updated: "hace 1 min",
    frequency: "near",
    definition: "Emails transaccionales y de campaña enviados en las últimas 24h.",
    formula: "COUNT(email WHERE sent_at > now − 24h)",
    spark: [240, 260, 275, 290, 305, 312, 320],
    tone: "neutral",
  },
  {
    label: "WhatsApps enviados",
    value: "89",
    deltaAbs: "+12",
    deltaPct: "+15.6%",
    trend: "up",
    period: "vs ayer",
    source: "Workers",
    updated: "hace 1 min",
    frequency: "near",
    definition: "Mensajes WhatsApp enviados (confirmaciones, recordatorios, campañas) en las últimas 24h.",
    formula: "COUNT(whatsapp WHERE sent_at > now − 24h)",
    spark: [60, 68, 72, 78, 82, 85, 89],
    tone: "neutral",
  },
];

const INFRA_KPIS: Kpi[] = [
  {
    label: "Disponibilidad",
    value: "99.97%",
    deltaAbs: "+0.02pp",
    deltaPct: "",
    trend: "up",
    period: "vs mes anterior",
    source: "Workers",
    updated: "hace 30 s",
    frequency: "near",
    definition: "Porcentaje de tiempo en que la plataforma ha estado operativa en los últimos 30 días.",
    formula: "(tiempo_operativo / tiempo_total) × 100 (ventana 30d)",
    spark: [99.91, 99.93, 99.94, 99.95, 99.96, 99.96, 99.97],
    tone: "positive",
  },
  {
    label: "Uptime",
    value: "99.97%",
    deltaAbs: "+0.02pp",
    deltaPct: "",
    trend: "up",
    period: "vs mes anterior",
    source: "Workers",
    updated: "hace 30 s",
    frequency: "near",
    definition: "Tiempo de actividad del servicio principal medido por healthchecks externos.",
    formula: "(checks_ok / total_checks) × 100",
    spark: [99.90, 99.92, 99.93, 99.94, 99.95, 99.96, 99.97],
    tone: "positive",
  },
  {
    label: "Latencia API p50",
    value: "42ms",
    deltaAbs: "-3ms",
    deltaPct: "-6.7%",
    trend: "down",
    period: "vs ayer",
    source: "Workers",
    updated: "hace 30 s",
    frequency: "near",
    definition: "Latencia mediana (percentil 50) de las respuestas de la API en las últimas 24h.",
    formula: "PERCENTILE(latency, 50) WHERE timestamp > now − 24h",
    spark: [50, 48, 46, 45, 44, 43, 42],
    tone: "positive",
  },
  {
    label: "Latencia API p95",
    value: "89ms",
    deltaAbs: "-8ms",
    deltaPct: "-8.2%",
    trend: "down",
    period: "vs ayer",
    source: "Workers",
    updated: "hace 30 s",
    frequency: "near",
    definition: "Latencia percentil 95 de la API: el 95% de las peticiones se completan en este tiempo o menos.",
    formula: "PERCENTILE(latency, 95) WHERE timestamp > now − 24h",
    spark: [108, 104, 100, 96, 92, 90, 89],
    tone: "positive",
  },
  {
    label: "Latencia API p99",
    value: "156ms",
    deltaAbs: "+12ms",
    deltaPct: "+8.3%",
    trend: "up",
    period: "vs ayer",
    source: "Workers",
    updated: "hace 30 s",
    frequency: "near",
    definition: "Latencia percentil 99 de la API: el 99% de las peticiones se completan en este tiempo o menos.",
    formula: "PERCENTILE(latency, 99) WHERE timestamp > now − 24h",
    spark: [128, 134, 138, 144, 148, 152, 156],
    tone: "negative",
  },
  {
    label: "Tasa errores",
    value: "0.03%",
    deltaAbs: "-0.01pp",
    deltaPct: "",
    trend: "down",
    period: "vs ayer",
    source: "Workers",
    updated: "hace 30 s",
    frequency: "near",
    definition: "Porcentaje de peticiones con respuesta 5xx en las últimas 24h.",
    formula: "(peticiones_5xx / total_peticiones) × 100",
    spark: [0.06, 0.05, 0.05, 0.04, 0.04, 0.035, 0.03],
    tone: "positive",
  },
  {
    label: "Incidencias abiertas",
    value: "1",
    deltaAbs: "-1",
    deltaPct: "-50%",
    trend: "down",
    period: "vs ayer",
    source: "Workers",
    updated: "hace 30 s",
    frequency: "near",
    definition: "Incidencias activas sin resolver en el sistema de monitorización.",
    formula: "COUNT(incident WHERE status != 'resolved')",
    spark: [3, 3, 2, 2, 2, 1, 1],
    tone: "positive",
  },
  {
    label: "Workers (req/día)",
    value: "2.4M",
    deltaAbs: "+120K",
    deltaPct: "+5.2%",
    trend: "up",
    period: "vs ayer",
    source: "Workers",
    updated: "hace 30 s",
    frequency: "near",
    definition: "Total de peticiones procesadas por Workers en las últimas 24h.",
    formula: "COUNT(request WHERE timestamp > now − 24h)",
    spark: [2.0, 2.1, 2.2, 2.25, 2.32, 2.36, 2.4],
    tone: "neutral",
  },
  {
    label: "D1 (almacenamiento)",
    value: "412MB",
    deltaAbs: "+18MB",
    deltaPct: "+4.6%",
    trend: "up",
    period: "vs semana anterior",
    source: "D1",
    updated: "hace 5 min",
    frequency: "near",
    definition: "Tamaño total de la base de datos D1 principal.",
    formula: "SUM(database.size_bytes) / 1024 / 1024",
    spark: [380, 388, 394, 400, 405, 409, 412],
    tone: "neutral",
  },
  {
    label: "R2 (storage)",
    value: "8.2GB",
    deltaAbs: "+0.3GB",
    deltaPct: "+3.8%",
    trend: "up",
    period: "vs semana anterior",
    source: "R2",
    updated: "hace 5 min",
    frequency: "near",
    definition: "Datos almacenados en buckets R2 (imágenes, documentos, exports).",
    formula: "SUM(bucket.size_bytes) / 1024^3",
    spark: [7.4, 7.6, 7.8, 7.9, 8.0, 8.1, 8.2],
    tone: "neutral",
  },
  {
    label: "KV (ops)",
    value: "1.2M",
    deltaAbs: "+85K",
    deltaPct: "+7.6%",
    trend: "up",
    period: "vs ayer",
    source: "KV",
    updated: "hace 30 s",
    frequency: "near",
    definition: "Operaciones de lectura/escritura en KV en las últimas 24h.",
    formula: "COUNT(kv_op WHERE timestamp > now − 24h)",
    spark: [980, 1040, 1080, 1120, 1150, 1180, 1200],
    tone: "neutral",
  },
  {
    label: "Queues activas",
    value: "4",
    deltaAbs: "0",
    deltaPct: "0%",
    trend: "flat",
    period: "vs ayer",
    source: "Queues",
    updated: "hace 30 s",
    frequency: "near",
    definition: "Colas de mensajes activas con consumidores conectados.",
    formula: "COUNT(queue WHERE consumers > 0)",
    spark: [4, 4, 4, 4, 4, 4, 4],
    tone: "neutral",
  },
  {
    label: "DO activos",
    value: "47",
    deltaAbs: "+2",
    deltaPct: "+4.4%",
    trend: "up",
    period: "vs ayer",
    source: "Workers",
    updated: "hace 30 s",
    frequency: "near",
    definition: "Durable Objects activos en memoria (sesiones, websockets, estado).",
    formula: "COUNT(durable_object WHERE state = 'active')",
    spark: [38, 40, 42, 43, 45, 46, 47],
    tone: "neutral",
  },
];

const CATEGORIES: KpiCategory[] = [
  {
    id: "finanzas",
    title: "Finanzas",
    icon: CircleDollarSign,
    accent: "gold",
    categoryFrequency: "aggregated",
    categoryFrequencyLabel: "Agregado diario",
    categorySource: "Stripe + Analytics Engine",
    synced: "hace 2 min",
    kpis: FINANCE_KPIS,
  },
  {
    id: "clientes",
    title: "Clientes y suscripciones",
    icon: Users,
    accent: "teal",
    categoryFrequency: "aggregated",
    categoryFrequencyLabel: "Agregado diario",
    categorySource: "D1 + Stripe",
    synced: "hace 5 min",
    kpis: CUSTOMER_KPIS,
  },
  {
    id: "operaciones",
    title: "Operaciones",
    icon: Activity,
    accent: "gold",
    categoryFrequency: "near",
    categoryFrequencyLabel: "Casi tiempo real · 30s",
    categorySource: "Workers + D1",
    synced: "hace 30 s",
    kpis: OPS_KPIS,
  },
  {
    id: "infra",
    title: "Infraestructura",
    icon: Server,
    accent: "fg",
    categoryFrequency: "near",
    categoryFrequencyLabel: "Casi tiempo real · 30s",
    categorySource: "Workers + R2 + KV",
    synced: "hace 30 s",
    kpis: INFRA_KPIS,
  },
];

/* ============================================================
   Header
   ============================================================ */

function ExecutiveHeader() {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-lg bg-[var(--gold)]/10 border border-[var(--gold)]/30 flex items-center justify-center rp-glow-gold">
              <ShieldCheck className="h-5 w-5 rp-gold-text" aria-hidden />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-light tracking-tight">
              Command <span className="rp-gold-text">Center</span>
            </h1>
          </div>
          
          <Badge
            variant="outline"
            className="border-rose-400/40 bg-rose-400/10 text-rose-300 text-[10px] font-mono uppercase tracking-wider"
          >
            <Crown className="h-3 w-3 mr-1" aria-hidden />
            Nivel plataforma
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Panel ejecutivo RestoPanel. Respuestas en menos de 10 segundos: estado del negocio,
          incidencias críticas, cambios recientes, organizaciones que requieren atención y
          servicios degradados. Todos los datos son demostrativos.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-muted-foreground">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-emerald-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Tiempo real
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-foreground/5 px-3 py-1.5">
          <RefreshCw className="h-3 w-3" aria-hidden />
          Última sincronización: hace 12 s
        </div>
      </div>
    </header>
  );
}

/* ============================================================
   Main export
   ============================================================ */

export function CcExecutive() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-1">
      <ExecutiveHeader />

      {/* Section 1: KPI grid */}
      <div className="space-y-5">
        {CATEGORIES.map((cat) => (
          <KpiCategoryCard key={cat.id} cat={cat} />
        ))}
      </div>

      {/* Section 2: Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="rp-glass rounded-2xl p-4 sm:p-5" aria-label="Evolución de MRR">
          <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base sm:text-lg font-medium tracking-tight">
                  Evolución MRR · 12 meses
                </h3>
                
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                MRR real (12m) + forecast (3m) con intervalo de confianza. Source: Stripe + D1 agregado diariamente.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-foreground/80">
                <span className="h-2 w-3 rounded-sm bg-[var(--gold)]" /> MRR real
              </span>
              <span className="inline-flex items-center gap-1.5 text-foreground/80">
                <span className="h-2 w-3 rounded-sm border-t-2 border-dashed border-[var(--teal)]" /> Forecast
              </span>
              <span className="inline-flex items-center gap-1.5 text-foreground/80">
                <span className="h-2 w-3 rounded-sm bg-[var(--teal)]/30" /> Intervalo confianza
              </span>
            </div>
          </header>
          <MrrForecastChart />
          <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-muted-foreground/70">
            <span>Actualizado hace 2 min · aggregated daily</span>
            <span>Eje Y en miles de €</span>
          </div>
        </section>

        <section className="rp-glass rounded-2xl p-4 sm:p-5" aria-label="Mapa de calor de reservas">
          <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base sm:text-lg font-medium tracking-tight">
                  Reservas por hora y día
                </h3>
                
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Volumen de reservas en grid 24h × 7d. Source: Analytics Engine, últimos 30 días.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              Ventana: 30 días
            </div>
          </header>
          <ReservasHeatmap />
          <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-muted-foreground/70">
            <span>Actualizado hace 5 min · aggregated hourly</span>
            <span>Pasa el cursor sobre una celda para ver el detalle</span>
          </div>
        </section>
      </div>

      {/* Section 3: Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <AIRecommendations />
        <ServicesStatus />
        <OrgsAttention />
      </div>

      {/* Footer note */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-4 border-t border-border/40 text-[11px] font-mono text-muted-foreground">
        <span>Command Center · RestoPanel · datos demostrativos · acceso restringido</span>
        <span>Latencia total del dashboard: <span className="rp-teal-text">312 ms</span></span>
      </div>
    </div>
  );
}
