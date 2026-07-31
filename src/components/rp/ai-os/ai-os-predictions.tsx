"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sparkles, Minus, Activity, Gauge,
  Euro, Users, Boxes, RefreshCw,
  AlertTriangle, ChevronRight, Eye, ArrowUpRight, ArrowDownRight,
  Info, Zap, Brain, Layers, Target,
  CalendarClock, Coins,
} from "lucide-react";

/* ============================================================
   Types
============================================================ */

type PredictionCategory =
  | "reservations"
  | "revenue"
  | "operations"
  | "customers"
  | "staff"
  | "inventory";

type TrendDir = "up" | "down" | "stable";

interface Prediction {
  id: string;
  category: PredictionCategory;
  label: string;
  value: string;
  confidence: number;
  horizon: string;
  dataUsed: string[];
  modelVersion: string;
  calculatedAt: string;
  limitations?: string;
  trend: TrendDir;
  trendPositive: boolean; // whether trend is good news
  recommendation?: string;
  // For detail dialog
  variables?: { name: string; weight: number }[];
  historicalAccuracy?: number;
  comparison?: { period: string; predicted: string; actual: string }[];
}

/* ============================================================
   Helpers
============================================================ */

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "hace unos segundos";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}

function isoMinusMin(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString();
}

/* ============================================================
   Category metadata
============================================================ */

const CATEGORY_META: Record<
  PredictionCategory,
  { label: string; icon: React.ElementType; cls: string; dot: string; text: string }
> = {
  reservations: {
    label: "Reservas",
    icon: CalendarClock,
    cls: "border-[var(--gold)]/40 bg-[var(--gold)]/10",
    dot: "bg-[var(--gold)]",
    text: "text-[var(--gold-soft)]",
  },
  revenue: {
    label: "Ingresos",
    icon: Euro,
    cls: "border-emerald-400/40 bg-emerald-400/10",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
  },
  operations: {
    label: "Operaciones",
    icon: Activity,
    cls: "border-[var(--teal)]/40 bg-[var(--teal)]/10",
    dot: "bg-[var(--teal)]",
    text: "text-[var(--teal)]",
  },
  customers: {
    label: "Clientes",
    icon: Users,
    cls: "border-purple-400/40 bg-purple-400/10",
    dot: "bg-purple-400",
    text: "text-purple-300",
  },
  staff: {
    label: "Personal",
    icon: Users,
    cls: "border-sky-400/40 bg-sky-400/10",
    dot: "bg-sky-400",
    text: "text-sky-300",
  },
  inventory: {
    label: "Inventario",
    icon: Boxes,
    cls: "border-amber-400/40 bg-amber-400/10",
    dot: "bg-amber-400",
    text: "text-amber-300",
  },
};

/* ============================================================
   Demo predictions
============================================================ */

const PREDICTIONS: Prediction[] = [
  {
    id: "PRD-001",
    category: "reservations",
    label: "Reservas previstas mañana",
    value: "186",
    confidence: 82,
    horizon: "Próximas 24h",
    dataUsed: ["Histórico 30d", "Reservas actuales", "Estacionalidad", "Clima"],
    modelVersion: "forecast-v2.1",
    calculatedAt: isoMinusMin(8),
    trend: "up",
    trendPositive: true,
    recommendation: "Activar waitlist automática para gestionar la demanda",
    variables: [
      { name: "Histórico mismo día semana", weight: 0.42 },
      { name: "Reservas actuales confirmadas", weight: 0.31 },
      { name: "Factor estacional", weight: 0.18 },
      { name: "Pronóstico meteorológico", weight: 0.09 },
    ],
    historicalAccuracy: 87,
    comparison: [
      { period: "Lun 13", predicted: "178", actual: "182" },
      { period: "Mar 14", predicted: "165", actual: "159" },
      { period: "Mié 15", predicted: "191", actual: "188" },
      { period: "Jue 16", predicted: "172", actual: "180" },
    ],
  },
  {
    id: "PRD-002",
    category: "revenue",
    label: "Facturación prevista mañana",
    value: "€10.250",
    confidence: 78,
    horizon: "Próximas 24h",
    dataUsed: ["Histórico 30d", "Reservas previstas", "Ticket medio", "Promociones activas"],
    modelVersion: "revenue-v1.4",
    calculatedAt: isoMinusMin(8),
    trend: "up",
    trendPositive: true,
    recommendation: "Reforzar stock de vinos (alta correlación con facturación prevista)",
    variables: [
      { name: "Reservas previstas × ticket medio", weight: 0.58 },
      { name: "Promociones activas", weight: 0.22 },
      { name: "Estacionalidad", weight: 0.14 },
      { name: "Tendencia semanal", weight: 0.06 },
    ],
    historicalAccuracy: 81,
    comparison: [
      { period: "Lun 13", predicted: "€9.640", actual: "€9.820" },
      { period: "Mar 14", predicted: "€9.120", actual: "€8.710" },
      { period: "Mié 15", predicted: "€10.480", actual: "€10.610" },
      { period: "Jue 16", predicted: "€9.350", actual: "€9.910" },
    ],
  },
  {
    id: "PRD-003",
    category: "operations",
    label: "Ocupación prevista 22:00",
    value: "92%",
    confidence: 85,
    horizon: "Próximas 6h",
    dataUsed: ["Reservas confirmadas", "Walk-ins históricos", "Eventos locales"],
    modelVersion: "occupancy-v2.0",
    calculatedAt: isoMinusMin(5),
    trend: "up",
    trendPositive: true,
    recommendation: "Activar zona auxiliar y reforzar sala a las 21:30",
    variables: [
      { name: "Reservas confirmadas 21-23h", weight: 0.61 },
      { name: "Walk-ins históricos mismo día", weight: 0.24 },
      { name: "Eventos locales detectados", weight: 0.15 },
    ],
    historicalAccuracy: 89,
    comparison: [
      { period: "Ayer 22:00", predicted: "88%", actual: "91%" },
      { period: "Anteayer 22:00", predicted: "84%", actual: "82%" },
      { period: "Hace 3d 22:00", predicted: "79%", actual: "81%" },
    ],
  },
  {
    id: "PRD-004",
    category: "operations",
    label: "Retrasos de cocina previstos",
    value: "3 mesas",
    confidence: 70,
    horizon: "Próximas 4h",
    dataUsed: ["Histórico cocina", "Reservas pico", "Personal de cocina", "Ticket medio"],
    modelVersion: "kitchen-delay-v1.2",
    calculatedAt: isoMinusMin(12),
    trend: "stable",
    trendPositive: false,
    recommendation: "Anticipar mise-en-place en franja 21:00-22:00",
    variables: [
      { name: "Histórico retrasos cocina", weight: 0.46 },
      { name: "Volumen reservas franja", weight: 0.34 },
      { name: "Ratio personal/reservas", weight: 0.20 },
    ],
    historicalAccuracy: 73,
    comparison: [
      { period: "Ayer", predicted: "2 mesas", actual: "3 mesas" },
      { period: "Anteayer", predicted: "4 mesas", actual: "5 mesas" },
      { period: "Hace 3d", predicted: "1 mesa", actual: "1 mesa" },
    ],
  },
  {
    id: "PRD-005",
    category: "customers",
    label: "No-shows previstos hoy",
    value: "3 mesas (8.2%)",
    confidence: 82,
    horizon: "Próximas 8h",
    dataUsed: ["Histórico no-shows", "Confianza de confirmación", "Canal de reserva"],
    modelVersion: "noshow-v1.6",
    calculatedAt: isoMinusMin(9),
    trend: "down",
    trendPositive: true,
    recommendation: "Enviar recordatorio WhatsApp 2h antes a las 3 reservas de mayor riesgo",
    variables: [
      { name: "Histórico no-show cliente", weight: 0.49 },
      { name: "Canal de reserva", weight: 0.26 },
      { name: "Tiempo hasta reserva", weight: 0.15 },
      { name: "Tamaño del grupo", weight: 0.10 },
    ],
    historicalAccuracy: 78,
    comparison: [
      { period: "Ayer", predicted: "4", actual: "3" },
      { period: "Anteayer", predicted: "5", actual: "6" },
      { period: "Hace 3d", predicted: "2", actual: "2" },
    ],
  },
  {
    id: "PRD-006",
    category: "customers",
    label: "Cancelaciones previstas semana",
    value: "8",
    confidence: 75,
    horizon: "Próximos 7 días",
    dataUsed: ["Histórico cancelaciones", "Estacionalidad", "Eventos locales"],
    modelVersion: "cancellation-v1.3",
    calculatedAt: isoMinusMin(15),
    trend: "stable",
    trendPositive: false,
    variables: [
      { name: "Histórico cancelaciones semana", weight: 0.55 },
      { name: "Eventos locales detectados", weight: 0.28 },
      { name: "Estacionalidad", weight: 0.17 },
    ],
    historicalAccuracy: 79,
    comparison: [
      { period: "Sem 11", predicted: "9", actual: "10" },
      { period: "Sem 10", predicted: "7", actual: "6" },
      { period: "Sem 9", predicted: "8", actual: "9" },
    ],
  },
  {
    id: "PRD-007",
    category: "customers",
    label: "Clientes en riesgo de abandón",
    value: "12",
    confidence: 68,
    horizon: "Próximos 30 días",
    dataUsed: ["Frecuencia visitas", "Ticket histórico", "Última visita", "NPS"],
    modelVersion: "churn-v2.2",
    calculatedAt: isoMinusMin(20),
    trend: "stable",
    trendPositive: false,
    recommendation: "Campaña de reactivación WhatsApp para top-5 clientes de mayor valor histórico",
    variables: [
      { name: "Días desde última visita", weight: 0.38 },
      { name: "Caída en frecuencia", weight: 0.31 },
      { name: "NPS últimos 6m", weight: 0.18 },
      { name: "Ticket histórico", weight: 0.13 },
    ],
    historicalAccuracy: 71,
    comparison: [
      { period: "Ene", predicted: "14", actual: "13" },
      { period: "Dic", predicted: "16", actual: "18" },
      { period: "Nov", predicted: "12", actual: "11" },
    ],
  },
  {
    id: "PRD-008",
    category: "customers",
    label: "VIPs que visitarán esta semana",
    value: "23",
    confidence: 72,
    horizon: "Próximos 7 días",
    dataUsed: ["Patrones visita VIP", "Reservas confirmadas", "Estacionalidad"],
    modelVersion: "vip-visit-v1.1",
    calculatedAt: isoMinusMin(11),
    trend: "up",
    trendPositive: true,
    recommendation: "Preparar greeting personalizado para 8 VIPs con reserva ya confirmada",
    variables: [
      { name: "Patrón visitas VIP (90d)", weight: 0.51 },
      { name: "Reservas VIP confirmadas", weight: 0.34 },
      { name: "Estacionalidad", weight: 0.15 },
    ],
    historicalAccuracy: 76,
    comparison: [
      { period: "Sem 11", predicted: "21", actual: "23" },
      { period: "Sem 10", predicted: "19", actual: "18" },
      { period: "Sem 9", predicted: "22", actual: "25" },
    ],
  },
  {
    id: "PRD-009",
    category: "staff",
    label: "Camareros recomendados mañana",
    value: "9",
    confidence: 85,
    horizon: "Próximas 24h",
    dataUsed: ["Reservas previstas", "Histórico ratio mesas/camarero", "Disponibilidad"],
    modelVersion: "staffing-v1.5",
    calculatedAt: isoMinusMin(7),
    trend: "stable",
    trendPositive: true,
    recommendation: "Cubrir 9 turnos · 4 cena + 3 comida + 2 apoyo 22:00",
    variables: [
      { name: "Reservas previstas × ratio", weight: 0.62 },
      { name: "Histórico mismo día", weight: 0.24 },
      { name: "Disponibilidad declarada", weight: 0.14 },
    ],
    historicalAccuracy: 88,
    comparison: [
      { period: "Ayer", predicted: "8", actual: "9" },
      { period: "Anteayer", predicted: "7", actual: "7" },
      { period: "Hace 3d", predicted: "9", actual: "10" },
    ],
  },
  {
    id: "PRD-010",
    category: "staff",
    label: "Rotación empleados (90d)",
    value: "2",
    confidence: 65,
    horizon: "Próximos 90 días",
    dataUsed: ["Histórico altas/bajas", "Antigüedad", "Encuestas clima"],
    modelVersion: "turnover-v1.0",
    calculatedAt: isoMinusMin(45),
    trend: "stable",
    trendPositive: true,
    limitations: "Modelo nuevo · precisa más datos históricos para validar",
    variables: [
      { name: "Histórico altas/bajas 12m", weight: 0.48 },
      { name: "Antigüedad media equipo", weight: 0.32 },
      { name: "Encuestas de clima", weight: 0.20 },
    ],
    historicalAccuracy: 62,
    comparison: [
      { period: "Q4 2024", predicted: "3", actual: "2" },
      { period: "Q3 2024", predicted: "2", actual: "4" },
      { period: "Q2 2024", predicted: "2", actual: "1" },
    ],
  },
  {
    id: "PRD-011",
    category: "inventory",
    label: "Rotura de stock prevista",
    value: "3 productos",
    confidence: 70,
    horizon: "Próximos 3 días",
    dataUsed: ["Inventario actual", "Velocidad venta", "Pedidos en tránsito", "Reservas previstas"],
    modelVersion: "stockout-v1.4",
    calculatedAt: isoMinusMin(14),
    trend: "up",
    trendPositive: false,
    recommendation: "Revisar stock de vino tinto Rioja, gamba roja y trufa negra",
    variables: [
      { name: "Velocidad venta 7d", weight: 0.46 },
      { name: "Stock actual", weight: 0.32 },
      { name: "Pedidos en tránsito", weight: 0.22 },
    ],
    historicalAccuracy: 74,
    comparison: [
      { period: "Sem 11", predicted: "2 productos", actual: "2 productos" },
      { period: "Sem 10", predicted: "4 productos", actual: "5 productos" },
      { period: "Sem 9", predicted: "1 producto", actual: "1 producto" },
    ],
  },
  {
    id: "PRD-012",
    category: "revenue",
    label: "Beneficio neto estimado mes",
    value: "€35.300",
    confidence: 62,
    horizon: "Próximos 30 días",
    dataUsed: ["Facturación prevista", "Costes históricos", "Margen histórico"],
    modelVersion: "profit-v1.2",
    calculatedAt: isoMinusMin(35),
    trend: "up",
    trendPositive: true,
    limitations: "Costes reales parciales · atribución incompleta para Q4 2024",
    variables: [
      { name: "Facturación prevista", weight: 0.54 },
      { name: "Costes históricos (COGS)", weight: 0.31 },
      { name: "Margen histórico", weight: 0.15 },
    ],
    historicalAccuracy: 68,
    comparison: [
      { period: "Ene", predicted: "€33.800", actual: "€34.120" },
      { period: "Dic", predicted: "€38.200", actual: "€39.840" },
      { period: "Nov", predicted: "€36.100", actual: "€35.050" },
    ],
  },
];

/* ============================================================
   UI primitives
============================================================ */

function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.15em] text-amber-300",
        className
      )}
    >
      <span className="h-1 w-1 rounded-full bg-amber-400" />
      demo
    </span>
  );
}

function CategoryBadge({ category }: { category: PredictionCategory }) {
  const m = CATEGORY_META[category];
  const Icon = m.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
        m.cls,
        m.text
      )}
    >
      <Icon className="h-3 w-3" />
      {m.label}
    </span>
  );
}

function ConfidenceGauge({ value, size = 56 }: { value: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.max(0, Math.min(100, value)) / 100);
  const tone =
    value >= 80
      ? "#34d399"
      : value >= 60
      ? "#D4AF37"
      : value >= 40
      ? "#fbbf24"
      : "#fb7185";
  const label = value >= 80 ? "Alta" : value >= 60 ? "Media" : "Baja";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          className="text-foreground/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-[11px] font-semibold leading-none" style={{ color: tone }}>
          {value}%
        </span>
        <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">
          {label}
        </span>
      </div>
    </div>
  );
}

function TrendIndicator({
  trend,
  positive,
}: {
  trend: TrendDir;
  positive: boolean;
}) {
  if (trend === "stable") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-foreground/[0.04] px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        <Minus className="h-3 w-3" />
        Estable
      </span>
    );
  }
  const isGood = (trend === "up" && positive) || (trend === "down" && !positive);
  const Icon = trend === "up" ? ArrowUpRight : ArrowDownRight;
  const cls = isGood
    ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
    : "border-rose-400/40 bg-rose-400/10 text-rose-300";
  const label = trend === "up" ? "Sube" : "Baja";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
        cls
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function DataChips({ data }: { data: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {data.map((d) => (
        <span
          key={d}
          className="inline-flex items-center gap-1 rounded-md border border-[var(--teal)]/30 bg-[var(--teal)]/[0.07] px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]"
        >
          <span className="h-1 w-1 rounded-full bg-[var(--teal)]" />
          {d}
        </span>
      ))}
    </div>
  );
}

/* ============================================================
   Prediction card
============================================================ */

function PredictionCard({
  p,
  onDetail,
  index,
}: {
  p: Prediction;
  onDetail: () => void;
  index: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      layout={reduce ? false : true}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.18) }}
      className="rp-glass rounded-xl p-4 sm:p-5 space-y-3 flex flex-col"
    >
      {/* Top: category + calculated at */}
      <div className="flex items-center gap-2">
        <CategoryBadge category={p.category} />
        <span className="ml-auto text-[11px] text-muted-foreground">
          {relativeTime(p.calculatedAt)}
        </span>
      </div>

      {/* Value + gauge */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] text-muted-foreground leading-tight">{p.label}</div>
          <div className="font-display text-3xl sm:text-4xl tracking-tight leading-none mt-1 rp-gold-text">
            {p.value}
          </div>
          <div className="mt-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {p.horizon}
          </div>
        </div>
        <ConfidenceGauge value={p.confidence} size={64} />
      </div>

      {/* Trend */}
      <div className="flex flex-wrap items-center gap-1.5">
        <TrendIndicator trend={p.trend} positive={p.trendPositive} />
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {p.modelVersion}
        </span>
      </div>

      {/* Data used */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
          Datos utilizados
        </div>
        <DataChips data={p.dataUsed} />
      </div>

      {/* Limitations */}
      {p.limitations && (
        <div className="flex items-start gap-1.5 text-[11px] text-amber-300 rounded-md border border-amber-400/30 bg-amber-400/[0.06] p-2">
          <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
          <span>{p.limitations}</span>
        </div>
      )}

      {/* Recommendation */}
      {p.recommendation && (
        <div className="rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/[0.06] p-2.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)] mb-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Recomendación
          </div>
          <div className="text-[11px] text-foreground/90 leading-relaxed">
            {p.recommendation}
          </div>
        </div>
      )}

      {/* Detail button */}
      <Button
        onClick={onDetail}
        size="sm"
        variant="outline"
        className="h-8 mt-auto text-[11px] min-h-[40px] border-border/60"
      >
        <Eye className="h-3 w-3" />
        Ver detalle
        <ChevronRight className="h-3 w-3 opacity-60" />
      </Button>
    </motion.div>
  );
}

/* ============================================================
   Prediction detail dialog
============================================================ */

function PredictionDetailDialog({
  p,
  open,
  onOpenChange,
}: {
  p: Prediction | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  if (!p) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rp-scroll-thin">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="rounded-md bg-foreground/5 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
              {p.id}
            </span>
            <CategoryBadge category={p.category} />
            <TrendIndicator trend={p.trend} positive={p.trendPositive} />
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {p.modelVersion}
            </span>
          </div>
          <DialogTitle className="font-display text-xl tracking-tight">{p.label}</DialogTitle>
          <DialogDescription className="text-sm">
            Predicción con horizonte de <span className="text-foreground/80">{p.horizon}</span> ·
            calculada {relativeTime(p.calculatedAt)}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Value + confidence */}
          <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-center rounded-md border border-border/60 bg-foreground/[0.02] p-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Valor previsto
              </div>
              <div className="font-display text-4xl tracking-tight rp-gold-text leading-none mt-1">
                {p.value}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">{p.horizon}</div>
            </div>
            <ConfidenceGauge value={p.confidence} size={80} />
          </div>

          {/* Variables + weights */}
          {p.variables && p.variables.length > 0 && (
            <div className="rounded-md border border-border/60 bg-foreground/[0.02] p-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2 flex items-center gap-1">
                <Layers className="h-3 w-3" />
                Variables del modelo
              </div>
              <div className="space-y-2">
                {p.variables.map((v) => (
                  <div key={v.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground/90">{v.name}</span>
                      <span className="font-mono text-[var(--gold-soft)]">
                        {Math.round(v.weight * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--gold-deep)] to-[var(--gold)]"
                        style={{ width: `${Math.round(v.weight * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historical accuracy */}
          {p.historicalAccuracy != null && (
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-md border border-border/60 bg-foreground/[0.02] p-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Precisión histórica (30d)
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl text-emerald-300">
                    {p.historicalAccuracy}%
                  </span>
                  <span className="text-[11px] text-muted-foreground">aciertos</span>
                </div>
              </div>
              <div className="rounded-md border border-border/60 bg-foreground/[0.02] p-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Confianza actual
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl rp-gold-text">{p.confidence}%</span>
                  <span className="text-[11px] text-muted-foreground">calidad datos</span>
                </div>
              </div>
            </div>
          )}

          {/* Comparison table */}
          {p.comparison && p.comparison.length > 0 && (
            <div className="rounded-md border border-border/60 bg-foreground/[0.02] p-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2 flex items-center gap-1">
                <Target className="h-3 w-3" />
                Predicho vs real (últimos periodos)
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {p.comparison.map((c) => (
                  <div
                    key={c.period}
                    className="rounded-md border border-border/40 bg-foreground/[0.02] p-2 text-center"
                  >
                    <div className="text-[10px] font-mono uppercase text-muted-foreground">
                      {c.period}
                    </div>
                    <div className="mt-1 text-[var(--gold-soft)] font-mono text-[11px]">
                      {c.predicted}
                    </div>
                    <div className="text-[10px] text-muted-foreground">vs</div>
                    <div className="text-foreground/90 font-mono text-[11px]">{c.actual}</div>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <span className="text-[var(--gold-soft)]">■ Predicho</span>
                <span>■ Real</span>
              </div>
            </div>
          )}

          {/* Data used */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
              Datos utilizados
            </div>
            <DataChips data={p.dataUsed} />
          </div>

          {/* Limitations */}
          {p.limitations && (
            <div className="flex items-start gap-1.5 text-[11px] text-amber-300 rounded-md border border-amber-400/30 bg-amber-400/[0.06] p-2.5">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>{p.limitations}</span>
            </div>
          )}

          {/* Recommendation */}
          {p.recommendation && (
            <div className="rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/[0.06] p-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)] mb-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Recomendación
              </div>
              <div className="text-xs text-foreground/90 leading-relaxed">
                {p.recommendation}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-2 rounded-md border border-border/60 bg-foreground/[0.02] p-3 text-[11px] text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>
              Las predicciones son estimaciones basadas en datos históricos y actuales. No son garantías.
              La confianza refleja la calidad y cantidad de datos disponibles.
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================
   Category filter
============================================================ */

type FilterCat = "all" | PredictionCategory;

const FILTERS_CAT: { id: FilterCat; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "reservations", label: "Reservas" },
  { id: "revenue", label: "Ingresos" },
  { id: "operations", label: "Operaciones" },
  { id: "customers", label: "Clientes" },
  { id: "staff", label: "Personal" },
  { id: "inventory", label: "Inventario" },
];

/* ============================================================
   Main export
============================================================ */

export function AiOsPredictions() {
  const reduce = useReducedMotion();
  const { toast } = useToast();
  const [filter, setFilter] = React.useState<FilterCat>("all");
  const [detail, setDetail] = React.useState<Prediction | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [recalc, setRecalc] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState<string>(isoMinusMin(8));

  const avgConfidence = Math.round(
    PREDICTIONS.reduce((s, p) => s + p.confidence, 0) / PREDICTIONS.length
  );
  const totalPredictionsToday = 47;

  function recalcNow() {
    if (recalc) return;
    setRecalc(true);
    window.setTimeout(() => {
      setRecalc(false);
      setLastUpdated(new Date().toISOString());
      toast({
        title: "12 predicciones actualizadas",
        description: "Modelos recalculados con datos en tiempo real (demo)",
      });
    }, 2000);
  }

  function openDetail(p: Prediction) {
    setDetail(p);
    setDetailOpen(true);
  }

  const filtered = React.useMemo(() => {
    if (filter === "all") return PREDICTIONS;
    return PREDICTIONS.filter((p) => p.category === filter);
  }, [filter]);

  return (
    <div className="space-y-5 overflow-x-hidden">
      {/* Header */}
      <motion.header
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rp-glass-strong rounded-xl p-4 sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-[var(--teal)] to-[var(--teal-deep)] text-black">
                <Brain className="h-4 w-4" />
              </span>
              <h1 className="font-display text-2xl sm:text-3xl tracking-tight">Predicciones IA</h1>
              <DemoBadge />
            </div>
            <p className="text-sm text-muted-foreground">
              Modelos de forecast con confianza, fuentes de datos y limitaciones declaradas.
            </p>
            <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
              <span className="text-[var(--gold-soft)] font-mono uppercase tracking-wider">
                12 modelos activos
              </span>
              <span className="opacity-50">·</span>
              <span>Última actualización: {relativeTime(lastUpdated)}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-lg border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-3 py-2 text-right">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)]">
                Confianza media
              </div>
              <div className="font-display text-2xl text-[var(--gold-soft)] leading-none mt-0.5">
                {avgConfidence}%
              </div>
            </div>
            <div className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-right">
              <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                Precisión 30d
              </div>
              <div className="font-display text-2xl text-emerald-300 leading-none mt-0.5">84%</div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Category filter + grid */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterCat)}>
        <div className="rp-glass rounded-xl p-1 inline-flex max-w-full overflow-x-auto rp-scroll-thin mb-4">
          <TabsList className="bg-transparent h-auto p-0">
            {FILTERS_CAT.map((f) => (
              <TabsTrigger
                key={f.id}
                value={f.id}
                className="data-[state=active]:bg-[var(--gold)]/15 data-[state=active]:text-[var(--gold-soft)] min-h-[40px] whitespace-nowrap"
              >
                {f.label}
                {f.id !== "all" && (
                  <span className="ml-1.5 text-[10px] font-mono opacity-70">
                    {PREDICTIONS.filter((p) => p.category === f.id).length}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={filter} className="mt-0">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <PredictionCard
                  key={p.id}
                  p={p}
                  index={i}
                  onDetail={() => openDetail(p)}
                />
              ))}
            </AnimatePresence>
          </div>
          {filtered.length === 0 && (
            <div className="rp-glass rounded-xl p-8 text-center text-sm text-muted-foreground">
              No hay predicciones en esta categoría.
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Model performance panel */}
      <motion.section
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rp-glass rounded-xl p-4 sm:p-6"
      >
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-foreground/5 text-[var(--teal)]">
            <Gauge className="h-4 w-4" />
          </span>
          <h2 className="font-display text-lg tracking-tight">Rendimiento de modelos</h2>
          <DemoBadge className="ml-auto" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Metric
            icon={Activity}
            label="Confianza media"
            value={`${avgConfidence}%`}
            tone="gold"
          />
          <Metric
            icon={Target}
            label="Precisión (30d)"
            value="84%"
            tone="emerald"
          />
          <Metric
            icon={Zap}
            label="Predicciones hoy"
            value={`${totalPredictionsToday}`}
            tone="teal"
          />
          <Metric
            icon={Coins}
            label="Coste hoy"
            value="€0,18"
            tone="amber"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-muted-foreground flex items-start gap-1.5 max-w-xl">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>
              Las predicciones son estimaciones basadas en datos históricos y actuales. No son garantías.
              La confianza refleja la calidad y cantidad de datos disponibles.
            </span>
          </div>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={recalcNow}
                  disabled={recalc}
                  size="sm"
                  className="h-9 bg-gradient-to-br from-[var(--teal)] to-[var(--teal-deep)] text-black hover:opacity-90 min-h-[44px]"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", recalc && "animate-spin")} />
                  {recalc ? "Recalculando…" : "Recalcular predicciones"}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Recalcula los 12 modelos con datos en tiempo real (demo)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </motion.section>

      <PredictionDetailDialog
        p={detail}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone: "gold" | "emerald" | "teal" | "amber";
}) {
  const toneCls =
    tone === "gold"
      ? "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]"
      : tone === "emerald"
      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
      : tone === "teal"
      ? "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]"
      : "border-amber-400/40 bg-amber-400/10 text-amber-300";
  return (
    <div className={cn("rounded-lg border p-3", toneCls)}>
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider opacity-80">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="font-display text-2xl leading-none mt-1.5">{value}</div>
    </div>
  );
}
