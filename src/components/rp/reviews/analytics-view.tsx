"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ChevronDown,
  Activity,
  DollarSign,
  Ticket,
  CalendarDays,
  UserX,
  UserPlus,
  Filter,
} from "lucide-react";

/* =====================================================================
 * Types & demo data
 * ===================================================================== */

interface Kpi {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  positive: boolean; // whether the trend is good (green)
  icon: React.ElementType;
  spark: number[];
  accent: "gold" | "teal";
}

const KPIS: Kpi[] = [
  {
    id: "ocup",
    label: "Ocupación",
    value: "78%",
    trend: "+4.2pp",
    trendUp: true,
    positive: true,
    icon: Activity,
    spark: [62, 65, 68, 70, 72, 75, 76, 78],
    accent: "gold",
  },
  {
    id: "ing",
    label: "Ingresos",
    value: "142.580€",
    trend: "+8.3%",
    trendUp: true,
    positive: true,
    icon: DollarSign,
    spark: [98, 105, 112, 118, 125, 132, 138, 142],
    accent: "gold",
  },
  {
    id: "ticket",
    label: "Ticket medio",
    value: "38€",
    trend: "+1.2%",
    trendUp: true,
    positive: true,
    icon: Ticket,
    spark: [35, 35.5, 36, 36.5, 37, 37.2, 37.5, 38],
    accent: "teal",
  },
  {
    id: "res",
    label: "Reservas",
    value: "3.742",
    trend: "+12.5%",
    trendUp: true,
    positive: true,
    icon: CalendarDays,
    spark: [2400, 2600, 2800, 3000, 3200, 3400, 3600, 3742],
    accent: "teal",
  },
  {
    id: "noshow",
    label: "No-shows",
    value: "8.2%",
    trend: "-0.4pp",
    trendUp: false,
    positive: true,
    icon: UserX,
    spark: [9.6, 9.4, 9.1, 8.9, 8.7, 8.5, 8.3, 8.2],
    accent: "gold",
  },
  {
    id: "new",
    label: "Clientes nuevos",
    value: "412",
    trend: "+6.7%",
    trendUp: true,
    positive: true,
    icon: UserPlus,
    spark: [320, 340, 355, 370, 385, 395, 405, 412],
    accent: "teal",
  },
];

const PERIODOS = ["Hoy", "Semana", "Mes", "Trimestre", "Año"] as const;
const LOCALES = ["Todos los locales", "Ramses Madrid", "Ramses Barcelona", "Ramses Valencia"] as const;
const CANALES = ["Todos los canales", "Widget", "Dashboard", "WhatsApp", "Teléfono"] as const;
const SEGMENTOS = ["Todos los segmentos", "Nuevos", "Recurrentes", "VIP", "Corporativo"] as const;

/* Heatmap: 7 days × 24 hours, values 0..1 */
const HEAT_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function heatFor(dayIdx: number, hour: number): number {
  const dayBoost = [0.7, 0.75, 0.85, 0.95, 1.1, 1.25, 1.0][dayIdx];
  let base = 0;
  if (hour < 10) base = 0.05;
  else if (hour < 12) base = 0.2 + (hour - 10) * 0.15;
  else if (hour === 12) base = 0.6;
  else if (hour <= 15) base = 0.85 - (hour - 13) * 0.1;
  else if (hour <= 18) base = 0.35 + (hour - 16) * 0.05;
  else if (hour === 19) base = 0.6;
  else if (hour === 20) base = 0.85;
  else if (hour === 21) base = 0.92;
  else if (hour === 22) base = 0.7;
  else base = 0.2;
  return Math.min(1, base * dayBoost);
}

const CHANNELS = [
  { label: "Widget", pct: 38, color: "var(--gold)" },
  { label: "WhatsApp", pct: 28, color: "var(--teal)" },
  { label: "Dashboard", pct: 24, color: "var(--gold-soft)" },
  { label: "Teléfono", pct: 10, color: "var(--gold-deep)" },
] as const;

const REVENUE_30D = [
  4200, 4350, 4180, 4500, 5800, 6200, 5400,
  4300, 4400, 4250, 4600, 5950, 6400, 5600,
  4400, 4500, 4350, 4700, 6050, 6600, 5800,
  4500, 4600, 4450, 4800, 6200, 6800, 6000,
  4600, 4700,
];

const RESERVATIONS_30D = [
  118, 122, 116, 128, 158, 168, 145,
  120, 124, 118, 130, 162, 172, 148,
  122, 126, 120, 132, 165, 176, 152,
  124, 128, 122, 134, 168, 180, 156,
  126, 130,
];

const LOCALES_COMPARE = [
  { label: "Madrid", revenue: 68, reservations: 82, revenueLabel: "68.4k€", resLabel: "1.240" },
  { label: "Barcelona", revenue: 52, reservations: 64, revenueLabel: "52.1k€", resLabel: "980" },
  { label: "Valencia", revenue: 34, reservations: 48, revenueLabel: "34.0k€", resLabel: "640" },
] as const;

const FORECAST_7D = [
  { day: "L", predicted: 72, lower: 65, upper: 79 },
  { day: "M", predicted: 75, lower: 68, upper: 82 },
  { day: "X", predicted: 78, lower: 70, upper: 86 },
  { day: "J", predicted: 82, lower: 74, upper: 90 },
  { day: "V", predicted: 79, lower: 71, upper: 87 },
  { day: "S", predicted: 76, lower: 68, upper: 84 },
  { day: "D", predicted: 74, lower: 66, upper: 82 },
] as const;

/* =====================================================================
 * Helpers
 * ===================================================================== */

function linePath(points: Array<[number, number]>): string {
  if (!points.length) return "";
  return points.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
}

function areaPath(points: Array<[number, number]>, baseY: number): string {
  if (!points.length) return "";
  const top = points.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  const last = points[points.length - 1];
  const first = points[0];
  return `${top} L${last[0]},${baseY} L${first[0]},${baseY} Z`;
}

function bandPath(
  upper: Array<[number, number]>,
  lower: Array<[number, number]>
): string {
  if (!upper.length || !lower.length) return "";
  const top = upper.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  const bottom = lower
    .slice()
    .reverse()
    .map(([x, y]) => `L${x},${y}`)
    .join(" ");
  return `${top} ${bottom} Z`;
}

function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-amber-400/40 bg-amber-400/10 text-amber-300/90 font-mono text-[10px] uppercase tracking-wider",
        className
      )}
    >
      demo
    </Badge>
  );
}

/* =====================================================================
 * Main view
 * ===================================================================== */

export function AnalyticsView() {
  const [periodo, setPeriodo] = React.useState<string>("Mes");
  const [local, setLocal] = React.useState<string>("Todos los locales");
  const [canal, setCanal] = React.useState<string>("Todos los canales");
  const [segmento, setSegmento] = React.useState<string>("Todos los segmentos");

  const handleExport = (format: "CSV" | "PDF") => {
    toast({
      title: "Exportación en cola (demo)",
      description: `Generando informe ${format} con los filtros seleccionados…`,
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-light tracking-tight">
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Rendimiento operativo, ingresos y forecast por local, canal y segmento.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DemoBadge />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("CSV")}
            className="border-border/60"
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("PDF")}
            className="border-border/60"
          >
            <FileText className="h-3.5 w-3.5" aria-hidden />
            PDF
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <section
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3"
        aria-label="Indicadores clave de rendimiento"
      >
        {KPIS.map((k) => (
          <KpiCard key={k.id} kpi={k} />
        ))}
      </section>

      {/* Filters bar */}
      <section
        className="rp-glass rounded-xl p-3 flex items-center gap-2 flex-wrap"
        aria-label="Filtros de analytics"
      >
        <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground pr-2">
          <Filter className="h-3.5 w-3.5" aria-hidden />
          Filtros
        </div>
        <FilterSelect label="Periodo" value={periodo} options={PERIODOS} onChange={setPeriodo} />
        <FilterSelect label="Local" value={local} options={LOCALES} onChange={setLocal} />
        <FilterSelect label="Canal" value={canal} options={CANALES} onChange={setCanal} />
        <FilterSelect label="Segmento" value={segmento} options={SEGMENTOS} onChange={setSegmento} />
      </section>

      {/* Charts */}
      <OccupancyHeatmap />
      <div className="grid lg:grid-cols-2 gap-4">
        <ChannelDonut />
        <RevenueVsReservations />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <LocalesCompare />
        <ForecastChart />
      </div>
    </div>
  );
}

/* =====================================================================
 * KPI card with sparkline
 * ===================================================================== */

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon;
  const accentColor = kpi.accent === "gold" ? "var(--gold)" : "var(--teal)";
  const trendColor = kpi.positive
    ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
    : "border-rose-400/40 bg-rose-400/10 text-rose-300";

  return (
    <div className="rp-glass rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" style={{ color: accentColor }} aria-hidden />
          {kpi.label}
        </span>
        <DemoBadge />
      </div>
      <div className="font-display text-2xl sm:text-3xl font-light leading-none">
        {kpi.value}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] font-mono",
            trendColor
          )}
        >
          {kpi.trendUp ? (
            <TrendingUp className="h-3 w-3" aria-hidden />
          ) : (
            <TrendingDown className="h-3 w-3" aria-hidden />
          )}
          {kpi.trend}
        </span>
        <Sparkline values={kpi.spark} color={accentColor} />
      </div>
    </div>
  );
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const W = 80;
  const H = 24;
  const pad = 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts: Array<[number, number]> = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (W - 2 * pad);
    const y = pad + (1 - (v - min) / range) * (H - 2 * pad);
    return [x, y];
  });
  const baseY = H - pad;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-20 h-6"
      role="img"
      aria-label={`Tendencia ${values[0]} a ${values[values.length - 1]}`}
    >
      <defs>
        <linearGradient id={`spark-${color.replace(/[^a-z0-9]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath(pts, baseY)} fill={`url(#spark-${color.replace(/[^a-z0-9]/gi, "")})`} />
      <path d={linePath(pts)} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* =====================================================================
 * Filter select (custom dropdown)
 * ===================================================================== */

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-input/30 px-2.5 py-1.5 text-xs hover:border-[var(--gold)]/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/40"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="text-muted-foreground font-mono uppercase tracking-wider text-[10px]">
          {label}:
        </span>
        <span className="text-foreground truncate max-w-[140px]">{value}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
          <ul
            className="absolute z-20 mt-1 left-0 min-w-full w-max rp-glass-strong rounded-md border border-border/60 py-1 shadow-xl"
            role="listbox"
          >
            {options.map((o) => (
              <li key={o}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-1.5 text-xs hover:bg-foreground/5 focus-visible:outline-none focus-visible:bg-foreground/5 whitespace-nowrap",
                    o === value && "text-[var(--gold)]"
                  )}
                  role="option"
                  aria-selected={o === value}
                >
                  {o}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/* =====================================================================
 * Chart card wrapper
 * ===================================================================== */

function ChartCard({
  title,
  subtitle,
  badge,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="rp-glass rounded-2xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h3 className="font-display text-lg font-medium">{title}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {right}
          {badge ?? <DemoBadge />}
        </div>
      </div>
      {children}
    </section>
  );
}

/* =====================================================================
 * 1. Occupancy heatmap (24h × 7d)
 * ===================================================================== */

function OccupancyHeatmap() {
  const leftPad = 40;
  const topPad = 22;
  const rightPad = 12;
  const bottomPad = 28;
  const cell = 22;
  const gap = 2;
  const step = cell + gap;
  const W = leftPad + 24 * step + rightPad;
  const H = topPad + 7 * step + bottomPad;

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <ChartCard
      title="Ocupación por hora"
      subtitle="Intensidad de ocupación por franja horaria y día de la semana (0–100%)"
    >
      <div className="overflow-x-auto rp-scroll-thin -mx-1 px-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[640px] h-auto"
          role="img"
          aria-labelledby="heat-title heat-desc"
        >
          <title id="heat-title">Mapa de calor de ocupación por hora y día</title>
          <desc id="heat-desc">
            Matriz de 7 días por 24 horas. Mayor intensidad en franjas 13–15h y 20–22h,
            especialmente viernes y sábado.
          </desc>

          {/* Hour labels (top) — every 3h */}
          {hours.map((h) =>
            h % 3 === 0 ? (
              <text
                key={h}
                x={leftPad + h * step + cell / 2}
                y={topPad - 8}
                textAnchor="middle"
                className="fill-muted-foreground font-mono"
                fontSize="9"
              >
                {String(h).padStart(2, "0")}h
              </text>
            ) : null
          )}

          {/* Day labels (left) */}
          {HEAT_DAYS.map((d, i) => (
            <text
              key={d}
              x={leftPad - 8}
              y={topPad + i * step + cell / 2 + 3}
              textAnchor="end"
              className="fill-muted-foreground font-mono"
              fontSize="10"
            >
              {d}
            </text>
          ))}

          {/* Cells */}
          {HEAT_DAYS.map((_, di) =>
            hours.map((h) => {
              const v = heatFor(di, h);
              const x = leftPad + h * step;
              const y = topPad + di * step;
              return (
                <rect
                  key={`${di}-${h}`}
                  x={x}
                  y={y}
                  width={cell}
                  height={cell}
                  rx="2"
                  fill="var(--gold)"
                  fillOpacity={v}
                  stroke="var(--gold)"
                  strokeOpacity={0.08}
                >
                  <title>{`${HEAT_DAYS[di]} ${String(h).padStart(2, "0")}:00 — ${Math.round(v * 100)}%`}</title>
                </rect>
              );
            })
          )}

          {/* Legend */}
          <g transform={`translate(${leftPad}, ${H - 18})`}>
            <text x={0} y={9} className="fill-muted-foreground font-mono" fontSize="9">
              Bajo
            </text>
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((op, i) => (
              <rect
                key={i}
                x={28 + i * 16}
                y={2}
                width={12}
                height={10}
                rx="1"
                fill="var(--gold)"
                fillOpacity={op}
              />
            ))}
            <text x={120} y={9} className="fill-muted-foreground font-mono" fontSize="9">
              Alto
            </text>
          </g>
        </svg>
      </div>
    </ChartCard>
  );
}

/* =====================================================================
 * 2. Channel donut
 * ===================================================================== */

function ChannelDonut() {
  const size = 180;
  const r = 60;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const total = CHANNELS.reduce((s, c) => s + c.pct, 0);
  const segments: Array<{ label: string; pct: number; color: string; dash: number; offset: number }> =
    [];
  let cumulative = 0;
  for (const c of CHANNELS) {
    const dash = (c.pct / total) * circumference;
    segments.push({
      label: c.label,
      pct: c.pct,
      color: c.color,
      dash,
      offset: -cumulative,
    });
    cumulative += dash;
  }

  return (
    <ChartCard
      title="Reservas por canal"
      subtitle="Distribución de reservas según origen (últimos 30 días)"
    >
      <div className="flex items-center gap-5 flex-wrap">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-44 h-44 shrink-0"
          role="img"
          aria-labelledby="donut-title donut-desc"
        >
          <title id="donut-title">Reservas por canal (donut)</title>
          <desc id="donut-desc">
            Widget 38%, WhatsApp 28%, Dashboard 24%, Teléfono 10%.
          </desc>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeOpacity={0.08} strokeWidth="20" />
          {segments.map((s) => (
            <circle
              key={s.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="20"
              strokeDasharray={`${s.dash} ${circumference - s.dash}`}
              strokeDashoffset={s.offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              strokeLinecap="butt"
            >
              <title>{`${s.label}: ${s.pct}%`}</title>
            </circle>
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-foreground font-mono" fontSize="22" fontWeight="300">
            3.742
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" className="fill-muted-foreground font-mono" fontSize="9">
            reservas
          </text>
        </svg>
        <ul className="flex-1 min-w-0 space-y-2" role="list">
          {CHANNELS.map((c) => (
            <li key={c.label} className="flex items-center gap-2.5 text-sm">
              <span
                className="h-3 w-3 rounded-sm shrink-0"
                style={{ backgroundColor: c.color }}
                aria-hidden
              />
              <span className="text-foreground/80 flex-1 truncate">{c.label}</span>
              <span className="font-mono text-foreground tabular-nums">{c.pct}%</span>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  );
}

/* =====================================================================
 * 3. Revenue vs reservations (dual axis line, 30 days)
 * ===================================================================== */

function RevenueVsReservations() {
  const W = 720;
  const H = 280;
  const padL = 44;
  const padR = 44;
  const padT = 20;
  const padB = 36;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const revMin = 3800;
  const revMax = 7200;
  const resMin = 100;
  const resMax = 200;

  const n = REVENUE_30D.length;
  const xAt = (i: number) => padL + (i / (n - 1)) * plotW;
  const yRev = (v: number) => padT + (1 - (v - revMin) / (revMax - revMin)) * plotH;
  const yRes = (v: number) => padT + (1 - (v - resMin) / (resMax - resMin)) * plotH;

  const revPts: Array<[number, number]> = REVENUE_30D.map((v, i) => [xAt(i), yRev(v)]);
  const resPts: Array<[number, number]> = RESERVATIONS_30D.map((v, i) => [xAt(i), yRes(v)]);

  const revTicks = [4000, 5000, 6000, 7000];
  const resTicks = [120, 150, 180];

  return (
    <ChartCard
      title="Ingresos vs reservas"
      subtitle="Evolución diaria de ingresos (eje izq.) y reservas (eje der.) — últimos 30 días"
    >
      <div className="overflow-x-auto rp-scroll-thin -mx-1 px-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[640px] h-auto"
          role="img"
          aria-labelledby="rev-res-title rev-res-desc"
        >
          <title id="rev-res-title">Ingresos vs reservas, 30 días</title>
          <desc id="rev-res-desc">
            Doble eje: ingresos en euros (línea dorada) y reservas (línea turquesa).
            Picos los fines de semana.
          </desc>
          <defs>
            <linearGradient id="revArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y grid (revenue ticks) */}
          {revTicks.map((t) => {
            const y = yRev(t);
            return (
              <g key={t}>
                <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="currentColor" strokeOpacity={0.07} strokeDasharray="2 4" />
                <text x={padL - 8} y={y + 3} textAnchor="end" className="fill-[var(--gold-soft)] font-mono" fontSize="10">
                  {t / 1000}k
                </text>
              </g>
            );
          })}
          {/* Right axis (reservations) */}
          {resTicks.map((t) => {
            const y = yRes(t);
            return (
              <text key={t} x={W - padR + 8} y={y + 3} textAnchor="start" className="fill-[var(--teal)] font-mono" fontSize="10">
                {t}
              </text>
            );
          })}

          {/* X labels — every 5 days */}
          {REVENUE_30D.map((_, i) =>
            i % 5 === 0 || i === n - 1 ? (
              <text
                key={i}
                x={xAt(i)}
                y={H - 12}
                textAnchor="middle"
                className="fill-muted-foreground font-mono"
                fontSize="10"
              >
                D{i + 1}
              </text>
            ) : null
          )}

          {/* Revenue area + line */}
          <path d={areaPath(revPts, padT + plotH)} fill="url(#revArea)" />
          <path d={linePath(revPts)} fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Reservations line */}
          <path d={linePath(resPts)} fill="none" stroke="var(--teal)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3" />

          {/* Legend */}
          <g transform={`translate(${padL + 4}, ${padT + 4})`}>
            <line x1="0" y1="6" x2="14" y2="6" stroke="var(--gold)" strokeWidth="2" />
            <text x="18" y="9" className="fill-foreground/80 font-mono" fontSize="10">Ingresos (€)</text>
            <line x1="120" y1="6" x2="134" y2="6" stroke="var(--teal)" strokeWidth="1.75" strokeDasharray="4 3" />
            <text x="138" y="9" className="fill-foreground/80 font-mono" fontSize="10">Reservas</text>
          </g>
        </svg>
      </div>
    </ChartCard>
  );
}

/* =====================================================================
 * 4. Locales compare (grouped bar chart)
 * ===================================================================== */

function LocalesCompare() {
  const W = 720;
  const H = 280;
  const padL = 40;
  const padR = 16;
  const padT = 28;
  const padB = 44;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const groups = LOCALES_COMPARE.length;
  const groupW = plotW / groups;
  const barW = 26;
  const barGap = 6;
  const max = 100;

  return (
    <ChartCard
      title="Comparativa entre locales"
      subtitle="Ingresos (k€) y reservas (normalizado) por local — trimestre actual"
    >
      <div className="overflow-x-auto rp-scroll-thin -mx-1 px-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[640px] h-auto"
          role="img"
          aria-labelledby="cmp-title cmp-desc"
        >
          <title id="cmp-title">Comparativa entre locales</title>
          <desc id="cmp-desc">
            Tres locales comparados. Madrid lidera en ingresos (68.4k€) y reservas (1.240).
            Barcelona 52.1k€ / 980. Valencia 34.0k€ / 640.
          </desc>

          {/* Y grid */}
          {[0, 25, 50, 75, 100].map((t) => {
            const y = padT + (1 - t / max) * plotH;
            return (
              <g key={t}>
                <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="currentColor" strokeOpacity={0.07} strokeDasharray="2 4" />
                <text x={padL - 8} y={y + 3} textAnchor="end" className="fill-muted-foreground font-mono" fontSize="10">
                  {t}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {LOCALES_COMPARE.map((loc, gi) => {
            const gx = padL + gi * groupW;
            const groupCenter = gx + groupW / 2;
            const barX1 = groupCenter - barW - barGap / 2;
            const barX2 = groupCenter + barGap / 2;
            const revH = (loc.revenue / max) * plotH;
            const resH = (loc.reservations / max) * plotH;
            return (
              <g key={loc.label}>
                {/* Revenue bar */}
                <rect
                  x={barX1}
                  y={padT + plotH - revH}
                  width={barW}
                  height={revH}
                  rx="2"
                  fill="var(--gold)"
                >
                  <title>{`Ingresos ${loc.label}: ${loc.revenueLabel}`}</title>
                </rect>
                <text
                  x={barX1 + barW / 2}
                  y={padT + plotH - revH - 6}
                  textAnchor="middle"
                  className="fill-[var(--gold-soft)] font-mono"
                  fontSize="10"
                >
                  {loc.revenueLabel}
                </text>

                {/* Reservations bar */}
                <rect
                  x={barX2}
                  y={padT + plotH - resH}
                  width={barW}
                  height={resH}
                  rx="2"
                  fill="var(--teal)"
                >
                  <title>{`Reservas ${loc.label}: ${loc.resLabel}`}</title>
                </rect>
                <text
                  x={barX2 + barW / 2}
                  y={padT + plotH - resH - 6}
                  textAnchor="middle"
                  className="fill-[var(--teal)] font-mono"
                  fontSize="10"
                >
                  {loc.resLabel}
                </text>

                {/* X label */}
                <text
                  x={groupCenter}
                  y={H - 14}
                  textAnchor="middle"
                  className="fill-foreground/80 font-mono"
                  fontSize="11"
                >
                  {loc.label}
                </text>
              </g>
            );
          })}

          {/* Legend */}
          <g transform={`translate(${padL + 4}, ${padT - 16})`}>
            <rect x="0" y="0" width="10" height="10" rx="1" fill="var(--gold)" />
            <text x="14" y="9" className="fill-foreground/80 font-mono" fontSize="10">Ingresos (k€)</text>
            <rect x="120" y="0" width="10" height="10" rx="1" fill="var(--teal)" />
            <text x="134" y="9" className="fill-foreground/80 font-mono" fontSize="10">Reservas</text>
          </g>
        </svg>
      </div>
    </ChartCard>
  );
}

/* =====================================================================
 * 5. Forecast IA (line + confidence band, 7 days)
 * ===================================================================== */

function ForecastChart() {
  const W = 720;
  const H = 280;
  const padL = 40;
  const padR = 16;
  const padT = 28;
  const padB = 36;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const yMin = 50;
  const yMax = 100;

  const n = FORECAST_7D.length;
  const xAt = (i: number) => padL + (i / (n - 1)) * plotW;
  const yAt = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin)) * plotH;

  const predPts: Array<[number, number]> = FORECAST_7D.map((d, i) => [xAt(i), yAt(d.predicted)]);
  const lowerPts: Array<[number, number]> = FORECAST_7D.map((d, i) => [xAt(i), yAt(d.lower)]);
  const upperPts: Array<[number, number]> = FORECAST_7D.map((d, i) => [xAt(i), yAt(d.upper)]);

  const yTicks = [50, 60, 70, 80, 90, 100];

  return (
    <ChartCard
      title="Forecast IA · Ocupación"
      subtitle="Predicción de ocupación para los próximos 7 días con banda de confianza"
      right={
        <span className="inline-flex items-center gap-1 rounded-md border border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)] px-2 py-0.5 text-[11px] font-mono">
          <Sparkles className="h-3 w-3" aria-hidden />
          Confianza 78%
        </span>
      }
    >
      <div className="overflow-x-auto rp-scroll-thin -mx-1 px-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[640px] h-auto"
          role="img"
          aria-labelledby="fc-title fc-desc"
        >
          <title id="fc-title">Forecast IA de ocupación, 7 días</title>
          <desc id="fc-desc">
            Línea turquesa con la ocupación predicha (72–82%) y banda de confianza
            entre los límites inferior y superior.
          </desc>
          <defs>
            <linearGradient id="fcBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--teal)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--teal)" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Y grid */}
          {yTicks.map((t) => {
            const y = yAt(t);
            return (
              <g key={t}>
                <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="currentColor" strokeOpacity={0.07} strokeDasharray="2 4" />
                <text x={padL - 8} y={y + 3} textAnchor="end" className="fill-muted-foreground font-mono" fontSize="10">
                  {t}%
                </text>
              </g>
            );
          })}

          {/* X labels */}
          {FORECAST_7D.map((d, i) => (
            <text
              key={i}
              x={xAt(i)}
              y={H - 12}
              textAnchor="middle"
              className="fill-muted-foreground font-mono"
              fontSize="10"
            >
              {d.day}
            </text>
          ))}

          {/* Confidence band */}
          <path d={bandPath(upperPts, lowerPts)} fill="url(#fcBand)" stroke="none" />

          {/* Upper / lower dashed bounds */}
          <path d={linePath(upperPts)} fill="none" stroke="var(--teal)" strokeOpacity={0.45} strokeWidth="1" strokeDasharray="3 3" />
          <path d={linePath(lowerPts)} fill="none" stroke="var(--teal)" strokeOpacity={0.45} strokeWidth="1" strokeDasharray="3 3" />

          {/* Predicted line */}
          <path d={linePath(predPts)} fill="none" stroke="var(--teal)" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />

          {/* Predicted points + labels */}
          {predPts.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="3.5" fill="var(--teal)" />
              <circle cx={x} cy={y} r="6" fill="var(--teal)" fillOpacity="0.15" />
              <text x={x} y={y - 10} textAnchor="middle" className="fill-foreground font-mono" fontSize="10">
                {FORECAST_7D[i].predicted}%
              </text>
            </g>
          ))}

          {/* Legend */}
          <g transform={`translate(${padL + 4}, ${padT - 16})`}>
            <line x1="0" y1="6" x2="14" y2="6" stroke="var(--teal)" strokeWidth="2" />
            <text x="18" y="9" className="fill-foreground/80 font-mono" fontSize="10">Predicción</text>
            <rect x="100" y="2" width="14" height="8" fill="url(#fcBand)" />
            <text x="118" y="9" className="fill-foreground/80 font-mono" fontSize="10">Banda confianza</text>
          </g>
        </svg>
      </div>
    </ChartCard>
  );
}
