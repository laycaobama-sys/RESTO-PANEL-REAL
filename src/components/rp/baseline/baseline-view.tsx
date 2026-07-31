"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarClock, TrendingUp, TrendingDown, Sparkles, Gauge,
  Clock, RefreshCw, Repeat, Euro, UserX, ArrowUpRight,
  Target, Database, FileText, CircleDollarSign, Lightbulb,
  CheckCircle2, BarChart3, Zap,
} from "lucide-react";
import {
  useInView,
  useEntranceProgress,
  CursorTooltip,
  type LegendItem,
  ClickableLegend,
} from "@/components/rp/charts";

/* =========================================================
 * Types
 * =======================================================*/

export type KpiDirection = "up" | "down";

export interface KpiRow {
  id: string;
  label: string;
  icon: React.ElementType;
  antes: number;
  despues: number;
  unit: string;
  direction: KpiDirection; // up = higher is better, down = lower is better
  decimals?: number;
  // 90-day series, value for each day
  series: number[];
}

/* =========================================================
 * Mock data
 * =======================================================*/

/** Deterministic pseudo-random in [0,1) for series generation. */
function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

/**
 * Build a 90-day series with 3 phases:
 *   - Days 1-30: baseline (mean `baseline`, noise)
 *   - Days 31-60: ramp (linear transition baseline → after)
 *   - Days 61-90: post-activation (mean `after`, noise)
 */
function buildSeries(baseline: number, after: number, seed: number): number[] {
  const rand = seeded(seed);
  const out: number[] = [];
  for (let i = 0; i < 90; i++) {
    let target: number;
    if (i < 30) target = baseline;
    else if (i < 60) target = baseline + ((after - baseline) * (i - 30)) / 30;
    else target = after;
    const noise = (rand() - 0.5) * Math.abs(after - baseline) * 0.25;
    out.push(Math.max(0, target + noise));
  }
  return out;
}

const KPIS: KpiRow[] = [
  {
    id: "ciclo",
    label: "Ciclo de mesa",
    icon: Clock,
    antes: 92,
    despues: 78,
    unit: "min",
    direction: "down",
    decimals: 0,
    series: buildSeries(92, 78, 11),
  },
  {
    id: "rotaciones",
    label: "Rotaciones por servicio",
    icon: Repeat,
    antes: 2.1,
    despues: 2.8,
    unit: "x",
    direction: "up",
    decimals: 1,
    series: buildSeries(2.1, 2.8, 22),
  },
  {
    id: "primera_comanda",
    label: "Tiempo hasta 1ª comanda",
    icon: Zap,
    antes: 8,
    despues: 5,
    unit: "min",
    direction: "down",
    decimals: 0,
    series: buildSeries(8, 5, 33),
  },
  {
    id: "ticket",
    label: "Ticket medio",
    icon: Euro,
    antes: 28,
    despues: 34,
    unit: "€",
    direction: "up",
    decimals: 0,
    series: buildSeries(28, 34, 44),
  },
  {
    id: "noshow",
    label: "Tasa no-show",
    icon: UserX,
    antes: 12,
    despues: 5,
    unit: "%",
    direction: "down",
    decimals: 0,
    series: buildSeries(12, 5, 55),
  },
  {
    id: "retorno",
    label: "Frecuencia de retorno",
    icon: RefreshCw,
    antes: 18,
    despues: 14,
    unit: "días",
    direction: "down",
    decimals: 0,
    series: buildSeries(18, 14, 66),
  },
  {
    id: "upsell",
    label: "Tasa upsell",
    icon: TrendingUp,
    antes: 8,
    despues: 19,
    unit: "%",
    direction: "up",
    decimals: 0,
    series: buildSeries(8, 19, 77),
  },
  {
    id: "waitlist",
    label: "Reservas recuperadas (waitlist)",
    icon: ArrowUpRight,
    antes: 0,
    despues: 47,
    unit: "/mes",
    direction: "up",
    decimals: 0,
    series: buildSeries(0, 47, 88),
  },
];

const BASELINE_DAYS = 30;
const BASELINE_COMPLETED = 18;

/* =========================================================
 * Helpers
 * =======================================================*/

function fmtVal(n: number, decimals: number, unit: string): string {
  const v = n.toLocaleString("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${v}${unit === "%" ? unit : unit === "/mes" ? "/mes" : ` ${unit}`}`.trim();
}

function deltaPct(row: KpiRow): number {
  if (row.antes === 0) return Infinity;
  return ((row.despues - row.antes) / row.antes) * 100;
}

function isImprovement(row: KpiRow): boolean {
  const d = deltaPct(row);
  if (row.direction === "up") return d > 0;
  return d < 0;
}

function improvementLabel(row: KpiRow): string {
  const d = deltaPct(row);
  const absD = Math.abs(d);
  if (d === Infinity) return "∞";
  const sign = d > 0 ? "+" : "−";
  return `${sign}${absD.toFixed(0)}%`;
}

/* =========================================================
 * Shared atoms
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

function SectionCard({
  title,
  desc,
  icon: Icon,
  action,
  children,
  className,
}: {
  title: string;
  desc?: string;
  icon: React.ElementType;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rp-glass rounded-2xl overflow-hidden flex flex-col min-w-0", className)}>
      <div className="flex items-center justify-between gap-3 p-4 border-b border-border/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-foreground/[0.05] text-[var(--gold)] shrink-0">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-base sm:text-lg leading-tight truncate">{title}</h2>
            {desc && <p className="text-[11px] text-muted-foreground truncate">{desc}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-4 flex-1 min-w-0">{children}</div>
    </section>
  );
}

/* =========================================================
 * Baseline status card
 * =======================================================*/

function BaselineStatus() {
  const pct = Math.round((BASELINE_COMPLETED / BASELINE_DAYS) * 100);
  return (
    <div className="rp-glass rounded-2xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-[var(--gold)]/15 text-[var(--gold)] shrink-0">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-lg leading-tight">Baseline automático</h2>
            <p className="text-[11px] text-muted-foreground">
              Días 1–30 · {BASELINE_COMPLETED} días completados de {BASELINE_DAYS}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant="outline"
            className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] text-[10px] uppercase tracking-wider font-mono"
          >
            En curso
          </Badge>
          <Badge
            variant="outline"
            className="border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)] text-[10px] uppercase tracking-wider font-mono"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" /> Auto-detección
          </Badge>
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          Progreso del baseline
        </span>
        <span className="font-display text-lg tabular-nums">
          <span className="text-[var(--gold-soft)]">{BASELINE_COMPLETED}</span>
          <span className="text-muted-foreground mx-1">/</span>
          <span className="text-muted-foreground">{BASELINE_DAYS} días</span>
          <span className="text-[11px] text-muted-foreground ml-2 font-mono">{pct}%</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-foreground/[0.08] overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-soft)]"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-border/40 bg-foreground/[0.03] p-2.5 text-center">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Inicio
          </div>
          <div className="font-display text-sm tabular-nums">1 Ene 25</div>
        </div>
        <div className="rounded-lg border border-border/40 bg-foreground/[0.03] p-2.5 text-center">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Activación
          </div>
          <div className="font-display text-sm tabular-nums text-[var(--gold-soft)]">31 Ene 25</div>
        </div>
        <div className="rounded-lg border border-border/40 bg-foreground/[0.03] p-2.5 text-center">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Cierre medición
          </div>
          <div className="font-display text-sm tabular-nums">31 Mar 25</div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * KPI comparison table
 * =======================================================*/

function KpiComparisonTable() {
  return (
    <div className="overflow-x-auto rp-scroll-thin -mx-1 px-1">
      <table className="w-full min-w-[720px] text-sm border-separate border-spacing-0">
        <thead>
          <tr className="text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <th className="py-2 pr-3 font-normal">KPI</th>
            <th className="py-2 px-2 font-normal text-right">Antes</th>
            <th className="py-2 px-2 font-normal text-right">Después</th>
            <th className="py-2 px-2 font-normal text-right">Δ</th>
            <th className="py-2 pl-2 font-normal">Sentido</th>
          </tr>
        </thead>
        <tbody>
          {KPIS.map((row, i) => {
            const Icon = row.icon;
            const improved = isImprovement(row);
            const delta = deltaPct(row);
            const absDelta = Math.abs(delta);
            const toneCls = improved ? "text-emerald-300" : "text-rose-300";
            const arrowCls = improved
              ? row.direction === "up"
                ? "text-emerald-300"
                : "text-emerald-300"
              : "text-rose-300";
            return (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                className="border-t border-border/30 hover:bg-foreground/[0.02]"
              >
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-7 w-7 rounded-lg flex items-center justify-center bg-foreground/[0.04] text-[var(--gold)] shrink-0">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-medium truncate">{row.label}</span>
                  </div>
                </td>
                <td className="py-2.5 px-2 text-right font-mono tabular-nums text-muted-foreground">
                  {fmtVal(row.antes, row.decimals ?? 0, row.unit)}
                </td>
                <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                  <span className={cn("font-medium", improved ? "text-[var(--gold-soft)]" : "text-foreground")}>
                    {fmtVal(row.despues, row.decimals ?? 0, row.unit)}
                  </span>
                </td>
                <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                  <span className={cn("inline-flex items-center gap-1", toneCls)}>
                    {improved ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {improvementLabel(row)}
                  </span>
                </td>
                <td className="py-2.5 pl-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] uppercase tracking-wider font-mono gap-1",
                      improved
                        ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                        : "border-rose-500/40 bg-rose-500/10 text-rose-300"
                    )}
                  >
                    <span className={arrowCls}>
                      {absDelta >= 100 ? "≥100%" : `${absDelta.toFixed(0)}%`}
                    </span>
                    {improved ? "mejora" : "regresión"}
                  </Badge>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
 * Trend chart (90 days, baseline gray vs post-activation gold)
 * =======================================================*/

function TrendChart() {
  const reduce = useReducedMotion();
  const svgWrapRef = React.useRef<HTMLDivElement>(null);
  const { ref: viewRef, inView } = useInView<SVGSVGElement>({ threshold: 0.2 });
  const progress = useEntranceProgress(inView, 800);

  const [selectedKpi, setSelectedKpi] = React.useState<string>("ticket");
  const row = KPIS.find((k) => k.id === selectedKpi) ?? KPIS[0];

  const width = 760;
  const height = 320;
  const padL = 52;
  const padR = 24;
  const padT = 28;
  const padB = 40;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const series = row.series;
  const minV = Math.min(...series) * 0.9;
  const maxV = Math.max(...series) * 1.1;
  const range = Math.max(0.001, maxV - minV);

  function xAt(i: number) {
    return padL + (i / (series.length - 1)) * innerW;
  }
  function yAt(v: number) {
    return padT + innerH - ((v - minV) / range) * innerH;
  }

  // Baseline phase path (days 0-29)
  const baselinePath = series
    .slice(0, 30)
    .map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(v)}`)
    .join(" ");
  // Ramp + post-activation path (days 30-89)
  const afterPath = series
    .slice(29)
    .map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(29 + i)} ${yAt(v)}`)
    .join(" ");
  // Area under afterPath
  const afterArea = `${afterPath} L ${xAt(series.length - 1)} ${padT + innerH} L ${xAt(29)} ${padT + innerH} Z`;

  // Hover state
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const [mousePx, setMousePx] = React.useState<{ x: number; y: number } | null>(null);

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const svgX = (px / rect.width) * width;
    const i = Math.round(((svgX - padL) / innerW) * (series.length - 1));
    if (i >= 0 && i < series.length) {
      setHoverIdx(i);
      setMousePx({ x: px, y: py });
    } else {
      setHoverIdx(null);
      setMousePx(null);
    }
  }

  const xMid = xAt(29);
  const xMidRampEnd = xAt(59);

  // Y ticks
  const yTicks: number[] = [];
  const niceStep = range > 50 ? 20 : range > 20 ? 10 : range > 10 ? 5 : range > 5 ? 2 : range > 1 ? 1 : 0.5;
  for (let t = Math.ceil(minV / niceStep) * niceStep; t <= maxV; t += niceStep) {
    yTicks.push(t);
  }

  const legendItems: LegendItem[] = [
    { id: "baseline", label: "Baseline (días 1-30)", color: "#71717a" },
    { id: "ramp", label: "Ramp-up (31-60)", color: "var(--gold-soft)", dashed: true },
    { id: "after", label: "Post-activación (61-90)", color: "var(--gold)" },
  ];
  const [hidden, setHidden] = React.useState<Set<string>>(new Set());
  function toggle(id: string) {
    setHidden((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  const hovered = hoverIdx != null ? series[hoverIdx] : null;
  const phaseLabel =
    hoverIdx == null
      ? null
      : hoverIdx < 30
        ? "Baseline"
        : hoverIdx < 60
          ? "Ramp-up"
          : "Post-activación";
  const dayLabel = hoverIdx == null ? null : `Día ${hoverIdx + 1}`;

  return (
    <div className="rp-glass rounded-2xl p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="font-display text-base sm:text-lg">Tendencia 90 días</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Baseline (gris) → ramp-up → post-activación (oro) · 1 local · Casa Marena
          </p>
        </div>
        <div className="shrink-0">
          <Select value={selectedKpi} onValueChange={setSelectedKpi}>
            <SelectTrigger className="h-9 w-[200px] text-xs" aria-label="KPI">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KPIS.map((k) => (
                <SelectItem key={k.id} value={k.id}>
                  {k.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-3">
        <ClickableLegend items={legendItems} hidden={hidden} onToggle={toggle} />
      </div>

      <div
        ref={svgWrapRef}
        className="relative overflow-x-auto rp-scroll-thin -mx-1"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <svg
          ref={viewRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[680px]"
          role="img"
          aria-label={`Tendencia 90 días de ${row.label}`}
          onMouseMove={onMove}
          onMouseLeave={() => {
            setHoverIdx(null);
            setMousePx(null);
          }}
        >
          {/* Phase backgrounds */}
          <rect
            x={padL}
            y={padT}
            width={xMid - padL}
            height={innerH}
            fill="#71717a"
            fillOpacity={0.04}
          />
          <rect
            x={xMid}
            y={padT}
            width={xMidRampEnd - xMid}
            height={innerH}
            fill="var(--gold-soft)"
            fillOpacity={0.04}
          />
          <rect
            x={xMidRampEnd}
            y={padT}
            width={padL + innerW - xMidRampEnd}
            height={innerH}
            fill="var(--gold)"
            fillOpacity={0.06}
          />

          {/* Phase labels */}
          <text x={padL + 8} y={padT + 16} className="fill-muted-foreground font-mono" fontSize="9">
            BASELINE
          </text>
          <text x={xMid + 8} y={padT + 16} className="fill-[var(--gold-soft)] font-mono" fontSize="9">
            RAMP-UP
          </text>
          <text x={xMidRampEnd + 8} y={padT + 16} className="fill-[var(--gold-soft)] font-mono" fontSize="9">
            POST-ACTIVACIÓN
          </text>

          {/* Phase boundaries */}
          <line x1={xMid} x2={xMid} y1={padT} y2={padT + innerH} stroke="var(--gold)" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
          <line x1={xMidRampEnd} x2={xMidRampEnd} y1={padT} y2={padT + innerH} stroke="var(--gold)" strokeWidth={1} strokeDasharray="4 3" opacity={0.7} />

          {/* Y grid */}
          {yTicks.map((t, i) => {
            const y = yAt(t);
            return (
              <g key={i}>
                <line
                  x1={padL}
                  x2={padL + innerW}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  className="text-foreground/8"
                  strokeDasharray="2 4"
                />
                <text
                  x={padL - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-muted-foreground font-mono"
                  fontSize="9"
                >
                  {t.toFixed(row.decimals ?? 0)}
                </text>
              </g>
            );
          })}

          {/* Area under after-path */}
          {!hidden.has("after") && (
            <motion.path
              d={afterArea}
              fill="url(#baselineGrad)"
              fillOpacity={0.2 * progress}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            />
          )}

          {/* Baseline line */}
          {!hidden.has("baseline") && (
            <motion.path
              d={baselinePath}
              fill="none"
              stroke="#71717a"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray="0"
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: progress }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          )}

          {/* Ramp-up line (dashed gold-soft) */}
          {!hidden.has("ramp") && (
            <motion.path
              d={`${series.slice(29, 60).map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(29 + i)} ${yAt(v)}`).join(" ")}`}
              fill="none"
              stroke="var(--gold-soft)"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray="5 4"
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: progress }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
            />
          )}

          {/* Post-activation line */}
          {!hidden.has("after") && (
            <motion.path
              d={`${series.slice(59).map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(59 + i)} ${yAt(v)}`).join(" ")}`}
              fill="none"
              stroke="var(--gold)"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: progress }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.4 }}
            />
          )}

          {/* Crosshair on hover */}
          {hoverIdx != null && (
            <line
              x1={xAt(hoverIdx)}
              x2={xAt(hoverIdx)}
              y1={padT}
              y2={padT + innerH}
              stroke="var(--gold)"
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.7}
              pointerEvents="none"
            />
          )}

          {/* Hover dot */}
          {hoverIdx != null && (
            <circle
              cx={xAt(hoverIdx)}
              cy={yAt(series[hoverIdx])}
              r={4}
              fill="var(--gold)"
              stroke="rgba(0,0,0,0.5)"
              strokeWidth={1}
              pointerEvents="none"
            />
          )}

          {/* X axis labels */}
          {[0, 30, 60, 89].map((d) => (
            <text
              key={d}
              x={xAt(d)}
              y={height - 12}
              textAnchor={d === 0 ? "start" : d === 89 ? "end" : "middle"}
              className="fill-muted-foreground font-mono"
              fontSize="9"
            >
              Día {d + 1}
            </text>
          ))}

          <defs>
            <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.6} />
              <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
            </linearGradient>
          </defs>
        </svg>

        {hovered != null && mousePx && (
          <CursorTooltip
            position={{ x: mousePx.x, y: mousePx.y }}
            containerRef={svgWrapRef}
            estimatedSize={{ width: 180, height: 90 }}
          >
            <div className="min-w-[150px] space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {phaseLabel} · {dayLabel}
              </div>
              <div className="font-display text-lg tabular-nums text-[var(--gold-soft)]">
                {fmtVal(hovered, row.decimals ?? 0, row.unit)}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {row.label}
              </div>
            </div>
          </CursorTooltip>
        )}
      </div>
    </div>
  );
}

/* =========================================================
 * ROI realized + Impact attribution + Claims generator
 * =======================================================*/

function RoiCard() {
  return (
    <div className="rp-glass rounded-2xl p-5 border border-[var(--gold)]/30">
      <div className="flex items-center gap-2 mb-3">
        <CircleDollarSign className="h-4 w-4 text-[var(--gold)]" />
        <h3 className="font-display text-lg">ROI realizado</h3>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="rounded-lg border border-border/40 bg-foreground/[0.03] p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Inversión
          </div>
          <div className="font-display text-lg tabular-nums">99€<span className="text-[11px] text-muted-foreground">/mes</span></div>
        </div>
        <div className="rounded-lg border border-[var(--teal)]/40 bg-[var(--teal)]/[0.06] p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]">
            Retorno
          </div>
          <div className="font-display text-lg tabular-nums text-[var(--teal)]">+2.840€<span className="text-[11px] text-muted-foreground">/mes</span></div>
        </div>
        <div className="rounded-lg border border-[var(--gold)]/40 bg-[var(--gold)]/[0.06] p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)]">
            ROI
          </div>
          <div className="font-display text-lg tabular-nums text-[var(--gold-soft)]">28,6x</div>
        </div>
      </div>
      <div className="rounded-lg border border-border/40 p-3 text-[11px] text-muted-foreground leading-relaxed">
        <span className="text-foreground font-medium">Desglose del retorno:</span> +1.490€ por
        mayor rotación de mesas · +880€ por ticket medio superior · +470€ por upsell y
        reservas recuperadas. Sin contar ahorro de horas de gestión (~12h/mes × 15€/h).
      </div>
    </div>
  );
}

function ImpactAttribution() {
  return (
    <div className="rp-glass rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Target className="h-4 w-4 text-[var(--teal)]" />
        <h3 className="font-display text-lg">Atribución de impacto</h3>
      </div>
      <div className="rounded-lg border border-border/40 bg-foreground/[0.02] p-3 text-[12px] text-muted-foreground leading-relaxed">
        Resultados medidos en <span className="text-foreground font-medium">Casa Marena</span>{" "}
        entre <span className="text-foreground font-medium">Ene – Mar 2025</span>. 1 local,
        90 días. Resultados variables — dependen de volumen, margen y disciplina operativa.
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="rounded-md border border-border/40 bg-foreground/[0.03] p-2.5 text-center">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Local</div>
          <div className="font-display text-sm">Casa Marena</div>
        </div>
        <div className="rounded-md border border-border/40 bg-foreground/[0.03] p-2.5 text-center">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Periodo</div>
          <div className="font-display text-sm">90 días</div>
        </div>
        <div className="rounded-md border border-border/40 bg-foreground/[0.03] p-2.5 text-center">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Cobertura</div>
          <div className="font-display text-sm text-[var(--gold-soft)]">94%</div>
        </div>
      </div>
    </div>
  );
}

function ClaimsGenerator({ onContribute }: { onContribute: () => void }) {
  const [agreed, setAgreed] = React.useState(true);
  return (
    <div className="rp-glass rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Database className="h-4 w-4 text-[var(--gold)]" />
        <h3 className="font-display text-lg">Generador de claims</h3>
      </div>
      <p className="text-[12px] text-muted-foreground mb-3 leading-relaxed">
        Tus datos alimentan el benchmark colectivo anónimo. Cuando contribuyes, el sistema
        genera claims verificables que se usan en la web pública y en presentaciones.
      </p>

      <div className="rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/[0.06] p-3 mb-3">
        <div className="flex items-start gap-2.5">
          <Lightbulb className="h-4 w-4 text-[var(--gold)] shrink-0 mt-0.5" />
          <div className="text-[12px] text-foreground/90 leading-relaxed">
            <span className="text-[var(--gold-soft)] font-medium">Claim generado:</span>{" "}
            &quot;Restaurantes con Order &amp; Pay registran{" "}
            <span className="font-mono">+21% ticket medio</span> (media de{" "}
            <span className="font-mono">47 locales Q1 2025</span>).&quot;
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/40 p-3 mb-3">
        <div className="min-w-0">
          <div className="text-sm font-medium">Contribuir al benchmark</div>
          <div className="text-[11px] text-muted-foreground">
            Datos anonimizados · sin PII · GDPR compliant
          </div>
        </div>
        <Switch
          checked={agreed}
          onCheckedChange={(v) => setAgreed(v)}
          aria-label="Contribuir al benchmark"
        />
      </div>

      <Button
        className="w-full bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] min-h-11"
        disabled={!agreed}
        onClick={onContribute}
      >
        <FileText className="h-4 w-4" /> Enviar al benchmark colectivo
      </Button>
    </div>
  );
}

/* =========================================================
 * Main view
 * =======================================================*/

export function BaselineView() {
  const { toast } = useToast();
  const reduce = useReducedMotion();

  const improvedCount = KPIS.filter(isImprovement).length;

  return (
    <div className="space-y-5 overflow-x-hidden">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
              Baseline y Antes/Después
            </h1>
            <DemoBadge />
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Medición honesta del impacto: 30 días de baseline automático, 60 días de
            post-activación. Sin baseline no hay claim — solo hipótesis.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            variant="outline"
            onClick={() =>
              toast({
                title: "Informe generado",
                description: "PDF con tabla KPI, tendencias y atribución de impacto.",
              })
            }
            className="min-h-11"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Descargar informe</span>
            <span className="sm:hidden">Informe</span>
          </Button>
          <Button
            onClick={() =>
              toast({
                title: "Baseline reiniciado",
                description: "Iniciando nuevo periodo de 30 días de medición automática.",
              })
            }
            className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] min-h-11"
          >
            <RefreshCw className="h-4 w-4" /> Reiniciar baseline
          </Button>
        </div>
      </header>

      {/* Baseline status + impact attribution (2-col) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BaselineStatus />
        <ImpactAttribution />
      </div>

      {/* KPI summary strip */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="rp-glass rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-emerald-400/15 text-emerald-300 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="font-display text-lg leading-tight">
              {improvedCount} de {KPIS.length} KPIs mejoraron
            </div>
            <div className="text-[11px] text-muted-foreground">
              tras 60 días de activación · {KPIS.length - improvedCount} sin cambio o regresión
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Badge variant="outline" className="border-emerald-400/40 bg-emerald-400/10 text-emerald-300 text-[10px] uppercase tracking-wider font-mono">
            <TrendingUp className="h-3 w-3 mr-1" /> +137% upsell
          </Badge>
          <Badge variant="outline" className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] text-[10px] uppercase tracking-wider font-mono">
            <Euro className="h-3 w-3 mr-1" /> +21% ticket
          </Badge>
          <Badge variant="outline" className="border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)] text-[10px] uppercase tracking-wider font-mono">
            <UserX className="h-3 w-3 mr-1" /> -58% no-show
          </Badge>
        </div>
      </motion.div>

      {/* KPI comparison table */}
      <SectionCard
        title="KPI antes / después"
        desc="8 KPIs medidos · baseline vs post-activación · 90 días"
        icon={BarChart3}
        action={
          <Badge
            variant="outline"
            className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] text-[10px] uppercase tracking-wider font-mono"
          >
            Casa Marena · Ene-Mar 25
          </Badge>
        }
      >
        <KpiComparisonTable />
      </SectionCard>

      {/* Trend chart */}
      <TrendChart />

      {/* ROI + Claims (2-col) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RoiCard />
        <ClaimsGenerator
          onContribute={() =>
            toast({
              title: "Datos enviados al benchmark",
              description: "Tu medición de Casa Marena alimentará el claim colectivo (anónimo).",
            })
          }
        />
      </div>

      {/* Footer note */}
      <div className="rp-glass rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-[var(--gold)] shrink-0 mt-0.5" />
        <div className="text-[12px] text-muted-foreground leading-relaxed">
          <span className="text-foreground font-medium">Filosofía:</span> sin baseline no hay
          claim. El sistema mide 30 días antes de activar nada, y solo entonces declara
          mejoras verificables. Los resultados se atribuyen al conjunto de módulos activados
          (no a uno solo) y se reportan con su intervalo de confianza.
        </div>
      </div>
    </div>
  );
}
