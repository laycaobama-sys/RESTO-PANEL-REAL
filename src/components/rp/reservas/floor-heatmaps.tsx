"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Grid3x3,
  TrendingUp,
  RefreshCw,
  Users,
  Clock,
  AlertTriangle,
  Info,
  MapPin,
  Activity,
  Sparkles,
  ChevronRight,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type HeatmapType =
  | "occupation"
  | "profitability"
  | "rotation"
  | "staff_load"
  | "kitchen_delay"
  | "incidents";

interface HeatmapConfig {
  type: HeatmapType;
  label: string;
  shortLabel: string;
  description: string;
  metric: string;
  source: string;
  period: string;
  formula: string;
  meaning: string;
  colorScale: { min: string; mid: string; max: string; meaning: string };
}

interface FloorTable {
  id: string;
  name: string;
  zone: string;
  cx: number;
  cy: number;
  r: number;
  shape: "circle" | "rect";
  occupation: number; // %
  profitability: number; // €/h
  rotation: number; // turns
  staffLoad: number; // %
  kitchenDelay: number; // minutes
  incidents: number; // count
}

/* =========================================================
 * Heatmap configs
 * =======================================================*/
const HEATMAP_CONFIGS: Record<HeatmapType, HeatmapConfig> = {
  occupation: {
    type: "occupation",
    label: "Ocupación",
    shortLabel: "Ocupación",
    description: "Porcentaje de ocupación por mesa durante el servicio actual.",
    metric: "% ocupación",
    source: "Digital Order (POS)",
    period: "Tiempo real · servicio actual",
    formula: "(comensales actuales / capacidad mesa) × 100",
    meaning: "Saturación alta = posible congestión de servicio.",
    colorScale: {
      min: "#3DD6C9",
      mid: "#D4AF37",
      max: "#EF4444",
      meaning: "Verde baja · Dorada media · Roja saturada",
    },
  },
  profitability: {
    type: "profitability",
    label: "Rentabilidad",
    shortLabel: "Rentabilidad",
    description: "Ingresos por hora generados por cada mesa ocupada.",
    metric: "€ / hora",
    source: "POS + Analytics Engine",
    period: "Agregado · servicio actual",
    formula: "ticket / duración ocupación (h)",
    meaning: "Verde = alta rentabilidad. Azul = baja.",
    colorScale: {
      min: "#3B82F6",
      mid: "#D4AF37",
      max: "#10B981",
      meaning: "Azul baja · Dorada media · Verde alta",
    },
  },
  rotation: {
    type: "rotation",
    label: "Rotación",
    shortLabel: "Rotación",
    description: "Número de turnos por mesa durante el servicio.",
    metric: "turnos / mesa",
    source: "Analytics Engine",
    period: "Agregado · servicio actual",
    formula: "reservas atendidas / mesas",
    meaning: "Verde = rotación óptima (2-3). Ámbar = lenta. Roja = excesiva.",
    colorScale: {
      min: "#F59E0B",
      mid: "#10B981",
      max: "#EF4444",
      meaning: "Ámbar lenta · Verde óptima · Roja excesiva",
    },
  },
  staff_load: {
    type: "staff_load",
    label: "Carga personal",
    shortLabel: "Carga",
    description: "Carga del camarero asignado a cada mesa.",
    metric: "% carga camarero",
    source: "Staff Engine",
    period: "Tiempo real · servicio actual",
    formula: "Σ(mesas 30% + personas 25% + pedidos 20% + complejidad 15% + incidencias 10%)",
    meaning: "Verde equilibrada · Dorada moderada · Roja sobrecargada.",
    colorScale: {
      min: "#10B981",
      mid: "#D4AF37",
      max: "#EF4444",
      meaning: "Verde equilibrada · Dorada moderada · Roja sobrecargada",
    },
  },
  kitchen_delay: {
    type: "kitchen_delay",
    label: "Retrasos cocina",
    shortLabel: "Retrasos",
    description: "Minutos de retraso medio en la salida de pedidos por mesa.",
    metric: "min retraso",
    source: "KDS (Kitchen Display)",
    period: "Tiempo real · servicio actual",
    formula: "media(salida_real − salida_estimada)",
    meaning: "Verde a tiempo · Ámbar leve retraso · Roja retraso grave.",
    colorScale: {
      min: "#10B981",
      mid: "#F59E0B",
      max: "#EF4444",
      meaning: "Verde a tiempo · Ámbar leve · Roja grave",
    },
  },
  incidents: {
    type: "incidents",
    label: "Incidencias",
    shortLabel: "Incidencias",
    description: "Número de incidencias registradas en cada mesa o zona.",
    metric: "nº incidencias",
    source: "Incident Tracker",
    period: "Agregado · servicio actual",
    formula: "count(incidencias abiertas por mesa)",
    meaning: "Verde ninguna · Ámbar menor · Roja crítica.",
    colorScale: {
      min: "#10B981",
      mid: "#F59E0B",
      max: "#EF4444",
      meaning: "Verde ninguna · Ámbar menor · Roja crítica",
    },
  },
};

const HEATMAP_ORDER: HeatmapType[] = [
  "occupation",
  "profitability",
  "rotation",
  "staff_load",
  "kitchen_delay",
  "incidents",
];

/* =========================================================
 * Demo floor tables (14 tables across 4 zones)
 * =======================================================*/
const FLOOR_TABLES: FloorTable[] = [
  // Sala (5 tables)
  { id: "S1", name: "S1", zone: "Sala", cx: 90, cy: 95, r: 26, shape: "circle", occupation: 100, profitability: 42, rotation: 2.1, staffLoad: 45, kitchenDelay: 4, incidents: 0 },
  { id: "S2", name: "S2", zone: "Sala", cx: 175, cy: 95, r: 26, shape: "circle", occupation: 75, profitability: 36, rotation: 2.3, staffLoad: 45, kitchenDelay: 0, incidents: 0 },
  { id: "S3", name: "S3", zone: "Sala", cx: 255, cy: 95, r: 26, shape: "circle", occupation: 100, profitability: 48, rotation: 2.0, staffLoad: 45, kitchenDelay: 8, incidents: 1 },
  { id: "S4", name: "S4", zone: "Sala", cx: 105, cy: 175, r: 30, shape: "circle", occupation: 50, profitability: 22, rotation: 1.8, staffLoad: 30, kitchenDelay: 0, incidents: 0 },
  { id: "S5", name: "S5", zone: "Sala", cx: 210, cy: 175, r: 32, shape: "circle", occupation: 100, profitability: 55, rotation: 2.4, staffLoad: 30, kitchenDelay: 12, incidents: 0 },
  // Terraza (4 tables)
  { id: "T1", name: "T1", zone: "Terraza", cx: 365, cy: 95, r: 28, shape: "circle", occupation: 100, profitability: 38, rotation: 2.8, staffLoad: 85, kitchenDelay: 6, incidents: 0 },
  { id: "T2", name: "T2", zone: "Terraza", cx: 460, cy: 95, r: 28, shape: "circle", occupation: 100, profitability: 44, rotation: 3.0, staffLoad: 85, kitchenDelay: 18, incidents: 1 },
  { id: "T3", name: "T3", zone: "Terraza", cx: 365, cy: 175, r: 28, shape: "circle", occupation: 100, profitability: 50, rotation: 3.2, staffLoad: 85, kitchenDelay: 0, incidents: 0 },
  { id: "T4", name: "T4", zone: "Terraza", cx: 475, cy: 175, r: 32, shape: "circle", occupation: 100, profitability: 62, rotation: 3.5, staffLoad: 85, kitchenDelay: 22, incidents: 2 },
  // VIP (2 tables)
  { id: "V1", name: "V1", zone: "VIP", cx: 90, cy: 320, r: 30, shape: "circle", occupation: 100, profitability: 96, rotation: 1.2, staffLoad: 52, kitchenDelay: 0, incidents: 0 },
  { id: "V2", name: "V2", zone: "VIP", cx: 170, cy: 320, r: 30, shape: "circle", occupation: 0, profitability: 0, rotation: 0, staffLoad: 52, kitchenDelay: 0, incidents: 0 },
  // Barra (3 tables)
  { id: "B1", name: "B1", zone: "Barra", cx: 270, cy: 320, r: 22, shape: "circle", occupation: 100, profitability: 24, rotation: 3.2, staffLoad: 58, kitchenDelay: 0, incidents: 0 },
  { id: "B2", name: "B2", zone: "Barra", cx: 360, cy: 320, r: 22, shape: "circle", occupation: 75, profitability: 18, rotation: 3.4, staffLoad: 58, kitchenDelay: 0, incidents: 0 },
  { id: "B3", name: "B3", zone: "Barra", cx: 460, cy: 320, r: 22, shape: "circle", occupation: 100, profitability: 22, rotation: 3.0, staffLoad: 58, kitchenDelay: 4, incidents: 0 },
];

/* =========================================================
 * Color helpers
 * =======================================================*/
function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  return [
    parseInt(m.slice(0, 2), 16),
    parseInt(m.slice(2, 4), 16),
    parseInt(m.slice(4, 6), 16),
  ];
}

function lerp2(t: number, c1: string, c2: string): string {
  const tt = Math.max(0, Math.min(1, t));
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);
  const r = Math.round(r1 + (r2 - r1) * tt);
  const g = Math.round(g1 + (g2 - g1) * tt);
  const b = Math.round(b1 + (b2 - b1) * tt);
  return `rgb(${r}, ${g}, ${b})`;
}

function lerp3(t: number, c1: string, c2: string, c3: string): string {
  if (t <= 0.5) return lerp2(t / 0.5, c1, c2);
  return lerp2((t - 0.5) / 0.5, c2, c3);
}

/* =========================================================
 * Get cell color + label for a table and heatmap type
 * =======================================================*/
function getCell(table: FloorTable, type: HeatmapType): { color: string; label: string; intensity: number } {
  const cfg = HEATMAP_CONFIGS[type];
  switch (type) {
    case "occupation": {
      const v = table.occupation;
      const intensity = v / 100;
      const color = lerp3(intensity, cfg.colorScale.min, cfg.colorScale.mid, cfg.colorScale.max);
      return { color, label: `${v}%`, intensity };
    }
    case "profitability": {
      const v = table.profitability;
      const intensity = Math.min(v / 80, 1);
      const color = lerp3(intensity, cfg.colorScale.min, cfg.colorScale.mid, cfg.colorScale.max);
      return { color, label: v === 0 ? "—" : `€${v}/h`, intensity };
    }
    case "rotation": {
      const v = table.rotation;
      let color: string;
      if (v <= 2.5) {
        color = lerp2(v / 2.5, cfg.colorScale.min, cfg.colorScale.mid);
      } else {
        color = lerp2(Math.min((v - 2.5) / 2, 1), cfg.colorScale.mid, cfg.colorScale.max);
      }
      const intensity = Math.min(v / 4, 1);
      return { color, label: v === 0 ? "—" : v.toFixed(1), intensity };
    }
    case "staff_load": {
      const v = table.staffLoad;
      const intensity = v / 100;
      const color = lerp3(intensity, cfg.colorScale.min, cfg.colorScale.mid, cfg.colorScale.max);
      return { color, label: `${v}%`, intensity };
    }
    case "kitchen_delay": {
      const v = table.kitchenDelay;
      const intensity = Math.min(v / 25, 1);
      const color = lerp3(intensity, cfg.colorScale.min, cfg.colorScale.mid, cfg.colorScale.max);
      return { color, label: v === 0 ? "0'" : `+${v}'`, intensity };
    }
    case "incidents": {
      const v = table.incidents;
      const intensity = Math.min(v / 3, 1);
      const color = lerp3(intensity, cfg.colorScale.min, cfg.colorScale.mid, cfg.colorScale.max);
      return { color, label: `${v}`, intensity };
    }
  }
}

/* =========================================================
 * Heatmap selector
 * =======================================================*/
function HeatmapSelector({
  value,
  onChange,
}: {
  value: HeatmapType;
  onChange: (v: HeatmapType) => void;
}) {
  const icons: Record<HeatmapType, React.ElementType> = {
    occupation: Grid3x3,
    profitability: TrendingUp,
    rotation: RefreshCw,
    staff_load: Users,
    kitchen_delay: Clock,
    incidents: AlertTriangle,
  };

  return (
    <div
      role="tablist"
      aria-label="Tipo de heatmap"
      className="rp-scroll-thin flex w-full gap-1 overflow-x-auto rounded-xl border border-border/40 bg-foreground/[0.03] p-1"
    >
      {HEATMAP_ORDER.map((type) => {
        const cfg = HEATMAP_CONFIGS[type];
        const Icon = icons[type];
        const active = type === value;
        return (
          <button
            key={type}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(type)}
            className={cn(
              "relative flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors min-h-11",
              active
                ? "bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{cfg.shortLabel}</span>
            {active && (
              <motion.span
                layoutId="heatmap-active"
                className="absolute inset-0 -z-10 rounded-lg ring-1 ring-[var(--gold)]/40"
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
 * Floor plan SVG
 * =======================================================*/
const ZONES = [
  { id: "Sala", x: 20, y: 20, w: 270, h: 200, color: "var(--gold)" },
  { id: "Terraza", x: 310, y: 20, w: 270, h: 200, color: "var(--teal)" },
  { id: "VIP", x: 20, y: 240, w: 180, h: 160, color: "#C084FC" },
  { id: "Barra", x: 220, y: 240, w: 360, h: 160, color: "#F59E0B" },
];

function FloorPlan({
  type,
  reduce,
}: {
  type: HeatmapType;
  reduce: boolean;
}) {
  const [hovered, setHovered] = React.useState<string | null>(null);
  const cfg = HEATMAP_CONFIGS[type];

  return (
    <div className="relative">
      <svg
        viewBox="0 0 600 420"
        className="w-full"
        role="img"
        aria-label={`Mapa de calor de ${cfg.label}`}
      >
        <defs>
          <radialGradient id="floorBg" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="rgba(212, 175, 55, 0.05)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>
        </defs>

        {/* Background */}
        <rect x="0" y="0" width="600" height="420" fill="url(#floorBg)" />

        {/* Zone rectangles */}
        {ZONES.map((z) => (
          <g key={z.id}>
            <rect
              x={z.x}
              y={z.y}
              width={z.w}
              height={z.h}
              rx="12"
              fill={z.color}
              fillOpacity="0.04"
              stroke={z.color}
              strokeOpacity="0.25"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text
              x={z.x + 12}
              y={z.y + 22}
              className="font-mono"
              fontSize="10"
              fill="currentColor"
              fillOpacity="0.6"
              style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}
            >
              {z.id}
            </text>
          </g>
        ))}

        {/* Tables */}
        {FLOOR_TABLES.map((t, i) => {
          const cell = getCell(t, type);
          const isHovered = hovered === t.id;
          return (
            <motion.g
              key={t.id}
              initial={reduce ? false : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: reduce ? 0 : i * 0.025 }}
              onMouseEnter={() => setHovered(t.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer", transformOrigin: `${t.cx}px ${t.cy}px` }}
            >
              <circle
                cx={t.cx}
                cy={t.cy}
                r={t.r}
                fill={cell.color}
                fillOpacity={isHovered ? 0.95 : 0.78}
                stroke={cell.color}
                strokeWidth={isHovered ? 2.5 : 1.5}
                strokeOpacity="1"
              />
              {/* Table name */}
              <text
                x={t.cx}
                y={t.cy - 4}
                textAnchor="middle"
                fontSize="9"
                fill="#0a0a0a"
                fillOpacity="0.85"
                className="font-mono"
                fontWeight="600"
              >
                {t.name}
              </text>
              {/* Value */}
              <text
                x={t.cx}
                y={t.cy + 8}
                textAnchor="middle"
                fontSize="10"
                fill="#0a0a0a"
                fillOpacity="0.95"
                className="font-mono"
                fontWeight="700"
              >
                {cell.label}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hovered && (
          <HoverTooltip
            table={FLOOR_TABLES.find((t) => t.id === hovered)!}
            type={type}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function HoverTooltip({
  table,
  type,
}: {
  table: FloorTable;
  type: HeatmapType;
}) {
  const cell = getCell(table, type);
  const cfg = HEATMAP_CONFIGS[type];
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15 }}
      className="rp-glass-strong pointer-events-none absolute right-3 top-3 z-10 rounded-xl p-3 text-xs"
      style={{ minWidth: 180 }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-display text-base font-medium text-foreground">
          {table.name}
        </span>
        <span
          className="inline-flex items-center gap-1 rounded-md border border-border/40 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground"
        >
          <MapPin className="h-2.5 w-2.5" />
          {table.zone}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-full"
          style={{ background: cell.color }}
        />
        <span className="text-muted-foreground">{cfg.metric}:</span>
        <span className="font-mono text-foreground">{cell.label}</span>
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground">
        {cfg.meaning}
      </div>
    </motion.div>
  );
}

/* =========================================================
 * Color scale legend
 * =======================================================*/
function ColorScale({ type }: { type: HeatmapType }) {
  const cfg = HEATMAP_CONFIGS[type];
  const stops = [0, 0.5, 1].map((t) =>
    lerp3(t, cfg.colorScale.min, cfg.colorScale.mid, cfg.colorScale.max),
  );
  const gradient = `linear-gradient(to right, ${stops[0]}, ${stops[1]}, ${stops[2]})`;

  return (
    <div className="rp-glass rounded-xl p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          Escala de color
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">
          {cfg.metric}
        </span>
      </div>
      <div
        className="h-3 w-full rounded-full"
        style={{ background: gradient }}
      />
      <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <span>{cfg.colorScale.meaning.split(" · ")[0]}</span>
        <span>{cfg.colorScale.meaning.split(" · ")[1] ?? ""}</span>
        <span>{cfg.colorScale.meaning.split(" · ")[2] ?? ""}</span>
      </div>
    </div>
  );
}

/* =========================================================
 * Global color meaning legend (always visible)
 * =======================================================*/
const GLOBAL_LEGEND = [
  { color: "#EF4444", label: "Rojo", meaning: "Saturación o riesgo" },
  { color: "#10B981", label: "Verde", meaning: "Rendimiento saludable" },
  { color: "#3B82F6", label: "Azul", meaning: "Baja ocupación" },
  { color: "#F59E0B", label: "Amarillo", meaning: "Rotación lenta" },
  { color: "#C084FC", label: "Morado", meaning: "Actividad VIP o evento" },
];

function GlobalLegend() {
  return (
    <div className="rp-glass rounded-xl p-3">
      <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        Significado global de colores
      </div>
      <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {GLOBAL_LEGEND.map((l) => (
          <li key={l.label} className="flex items-center gap-2 text-xs">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ background: l.color }}
            />
            <span className="font-mono text-foreground">{l.label}:</span>
            <span className="text-muted-foreground">{l.meaning}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* =========================================================
 * Metric details panel
 * =======================================================*/
function MetricDetails({ type }: { type: HeatmapType }) {
  const reduce = useReducedMotion();
  const cfg = HEATMAP_CONFIGS[type];

  // Compute top 5 best and worst tables
  const sorted = [...FLOOR_TABLES].map((t) => ({
    table: t,
    cell: getCell(t, type),
  }));

  // For "best/worst" we interpret by intensity:
  // - occupation, staff_load, kitchen_delay, incidents: higher intensity = worse
  // - profitability: higher intensity = better
  // - rotation: distance from optimal (2.5) = worse
  const scorer = (t: FloorTable): number => {
    switch (type) {
      case "occupation":
      case "staff_load":
      case "kitchen_delay":
      case "incidents":
        return -getCell(t, type).intensity; // higher intensity = worse score
      case "profitability":
        return getCell(t, type).intensity; // higher = better
      case "rotation":
        return -Math.abs(t.rotation - 2.5); // closer to 2.5 = better
    }
  };

  const ranked = [...FLOOR_TABLES].sort((a, b) => scorer(b) - scorer(a));
  const best = ranked.slice(0, 5);
  const worst = [...ranked].reverse().slice(0, 5);

  // Zone averages
  const zoneAverages = ZONES.map((z) => {
    const tables = FLOOR_TABLES.filter((t) => t.zone === z.id);
    if (tables.length === 0) return { zone: z.id, avg: 0, count: 0, raw: 0 };
    let total = 0;
    for (const t of tables) {
      switch (type) {
        case "occupation": total += t.occupation; break;
        case "profitability": total += t.profitability; break;
        case "rotation": total += t.rotation; break;
        case "staff_load": total += t.staffLoad; break;
        case "kitchen_delay": total += t.kitchenDelay; break;
        case "incidents": total += t.incidents; break;
      }
    }
    const raw = total / tables.length;
    let label: string;
    switch (type) {
      case "occupation":
      case "staff_load": label = `${Math.round(raw)}%`; break;
      case "profitability": label = `€${Math.round(raw)}/h`; break;
      case "rotation": label = raw.toFixed(1); break;
      case "kitchen_delay": label = `${Math.round(raw)}min`; break;
      case "incidents": label = raw.toFixed(1); break;
    }
    return { zone: z.id, avg: raw, count: tables.length, label };
  });

  return (
    <motion.div
      key={type}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rp-glass rounded-2xl p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-foreground sm:text-base">
              {cfg.label}
            </h3>
            <Badge
              variant="outline"
              className="border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)] text-[10px] font-mono uppercase tracking-wider"
            >
              {cfg.metric}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {cfg.description}
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Última actualización
          </div>
          <div className="font-mono text-xs text-foreground">14:38:02</div>
        </div>
      </div>

      {/* Definition + formula + source */}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <InfoBox label="Definición" value={cfg.meaning} />
        <InfoBox label="Fórmula" value={cfg.formula} mono />
        <InfoBox label="Fuente" value={cfg.source} />
      </div>
      <div className="mt-2">
        <InfoBox label="Periodo" value={cfg.period} />
      </div>

      {/* Top 5 best and worst */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RankedTable
          title={`Top 5 mejores mesas · ${cfg.label}`}
          tables={best.map((t) => ({ table: t, cell: getCell(t, type) }))}
          accent="text-emerald-300"
          icon={TrendingUp}
        />
        <RankedTable
          title={`Top 5 peores mesas · ${cfg.label}`}
          tables={worst.map((t) => ({ table: t, cell: getCell(t, type) }))}
          accent="text-destructive"
          icon={AlertTriangle}
        />
      </div>

      {/* Zone averages */}
      <div className="mt-5">
        <div className="mb-2 flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Media por zona
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {zoneAverages.map((z) => (
            <div key={z.zone} className="rp-glass rounded-lg p-3">
              <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <MapPin className="h-2.5 w-2.5" />
                {z.zone}
              </div>
              <div className="mt-1 font-display text-xl font-light tabular-nums text-foreground">
                {z.label}
              </div>
              <div className="mt-0.5 text-[10px] font-mono text-muted-foreground">
                {z.count} {z.count === 1 ? "mesa" : "mesas"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function InfoBox({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rp-glass rounded-lg p-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={cn("mt-1 text-xs text-foreground", mono && "font-mono")}>
        {value}
      </div>
    </div>
  );
}

function RankedTable({
  title,
  tables,
  accent,
  icon: Icon,
}: {
  title: string;
  tables: { table: FloorTable; cell: { color: string; label: string } }[];
  accent: string;
  icon: React.ElementType;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
        <Icon className={cn("h-3 w-3", accent)} />
        {title}
      </div>
      <div className="overflow-hidden rounded-xl border border-border/40">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-foreground/[0.04] text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <th className="px-3 py-2 text-left">Mesa</th>
              <th className="px-3 py-2 text-left">Zona</th>
              <th className="px-3 py-2 text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {tables.map(({ table, cell }, i) => (
              <tr key={`${table.id}-${i}`} className="border-t border-border/30">
                <td className="px-3 py-2 text-foreground font-mono">{table.name}</td>
                <td className="px-3 py-2 text-muted-foreground">{table.zone}</td>
                <td className="px-3 py-2 text-right">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: cell.color }}
                    />
                    <span className="font-mono tabular-nums text-foreground">
                      {cell.label}
                    </span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================
 * Source / period badge row
 * =======================================================*/
function SourceRow({ type }: { type: HeatmapType }) {
  const cfg = HEATMAP_CONFIGS[type];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge
        variant="outline"
        className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] text-[10px] font-mono uppercase tracking-wider"
      >
        <Sparkles className="mr-1 h-2.5 w-2.5" />
        {cfg.source}
      </Badge>
      <Badge
        variant="outline"
        className="border-border/40 bg-foreground/[0.04] text-muted-foreground text-[10px] font-mono uppercase tracking-wider"
      >
        <Clock className="mr-1 h-2.5 w-2.5" />
        {cfg.period}
      </Badge>
      <Badge
        variant="outline"
        className="border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)] text-[10px] font-mono uppercase tracking-wider"
      >
        <Info className="mr-1 h-2.5 w-2.5" />
        Actualizado 14:38:02
      </Badge>
    </div>
  );
}

/* =========================================================
 * Main component
 * =======================================================*/
export function FloorHeatmaps() {
  const reduce = useReducedMotion();
  const [type, setType] = React.useState<HeatmapType>("occupation");
  const cfg = HEATMAP_CONFIGS[type];

  return (
    <TooltipProvider delayDuration={150}>
      <section aria-labelledby="floor-heatmaps-title" className="flex flex-col gap-5 overflow-x-hidden">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2
                id="floor-heatmaps-title"
                className="font-display text-2xl font-light tracking-tight text-foreground sm:text-3xl"
              >
                Heatmaps operativos
              </h2>
              <Badge
                variant="outline"
                className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] text-[10px] font-mono uppercase tracking-wider"
              >
                demo
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              6 mapas de calor configurables para visualizar el rendimiento del salón.
            </p>
          </div>
          <SourceRow type={type} />
        </header>

        {/* Heatmap selector */}
        <HeatmapSelector value={type} onChange={setType} />

        {/* Floor plan + legend */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={type}
                initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="rp-glass-strong rounded-2xl p-4 sm:p-5"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      Plano de sala
                    </div>
                    <div className="font-display text-base text-foreground">
                      {cfg.label} · {cfg.metric}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    <ChevronRight className="h-3 w-3" />
                    Pasa el cursor sobre una mesa
                  </span>
                </div>
                <FloorPlan type={type} reduce={reduce} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-4">
            <ColorScale type={type} />
            <GlobalLegend />
          </div>
        </div>

        {/* Metric details */}
        <AnimatePresence mode="wait">
          <MetricDetails key={type} type={type} />
        </AnimatePresence>
      </section>
    </TooltipProvider>
  );
}
