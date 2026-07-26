"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useNav } from "@/components/rp/app/nav-store";
import {
  useInView,
  useEntranceProgress,
  usePathLength,
  drawDash,
  CursorTooltip,
  ClickableLegend,
  TimeRangeSelector,
  Crosshair,
  seriesOpacity,
  type TimeRange,
  type LegendItem,
} from "@/components/rp/charts";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  CalendarCheck,
  Banknote,
  Percent,
  ReceiptText,
  UserX,
  Star,
  Sparkles,
  BellRing,
  CalendarClock,
  Plug,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Users,
  ChevronRight,
  Crown,
  Megaphone,
  MessageSquare,
  RefreshCw,
  Settings2,
  CheckCircle2,
  Hourglass,
  Zap,
  TrendingUp,
  ShieldAlert,
  Star as StarIcon,
} from "lucide-react";

/* ============================================================
   Types
============================================================ */

type Trend = "up" | "down";
type ResStatus = "confirmed" | "waitlist" | "checked-in";

interface Kpi {
  id: "reservas" | "ingresos" | "ocupacion" | "ticket" | "noshows" | "rating";
  label: string;
  value: string;
  delta: string;
  trend: Trend;
  goodDown?: boolean;
  color: "gold" | "teal";
  spark: number[];
  icon: React.ElementType;
  caption: string;
}

interface Reservation {
  id: string;
  time: string;
  customer: string;
  pax: number;
  status: ResStatus;
  vip?: boolean;
  table?: string;
}

interface TimelineEvent {
  id: string;
  time: string;
  label: string;
  note?: string;
  tone: "default" | "gold" | "teal";
}

interface ChartPoint {
  day: string;
  date: string;
  v: number;
  today?: boolean;
}

interface AiRec {
  id: string;
  title: string;
  action: string;
  confidence: number;
  rationale: string;
  icon: React.ElementType;
}

interface ActivityEvent {
  id: string;
  type: "reserva" | "vip" | "resena" | "campana" | "mesa";
  text: string;
  ago: string;
  icon: React.ElementType;
  tone: "gold" | "teal" | "default";
}

interface Upcoming {
  id: string;
  time: string;
  customer: string;
  pax: number;
  vip?: boolean;
  inMin: number;
}

interface Integration {
  id: string;
  name: string;
  status: "conectado" | "pendiente";
  detail: string;
  icon: React.ElementType;
}

interface DemoAlert {
  id: string;
  text: string;
  action: string;
  tone: "amber" | "red";
}

/* ============================================================
   Demo data
============================================================ */

const KPIS: Kpi[] = [
  {
    id: "reservas",
    label: "Reservas hoy",
    value: "47",
    delta: "+12% vs ayer",
    trend: "up",
    color: "teal",
    spark: [33, 38, 35, 41, 39, 44, 47],
    icon: CalendarCheck,
    caption: "Comida 21 · Cena 26",
  },
  {
    id: "ingresos",
    label: "Ingresos hoy",
    value: "1.842€",
    delta: "+8%",
    trend: "up",
    color: "gold",
    spark: [1480, 1560, 1450, 1690, 1730, 1810, 1842],
    icon: Banknote,
    caption: "Proyección cierre 4.100€",
  },
  {
    id: "ocupacion",
    label: "Ocupación",
    value: "78%",
    delta: "+5pp",
    trend: "up",
    color: "teal",
    spark: [62, 66, 70, 71, 74, 76, 78],
    icon: Percent,
    caption: "52 de 66 cubiertos",
  },
  {
    id: "ticket",
    label: "Ticket medio",
    value: "38€",
    delta: "+2€",
    trend: "up",
    color: "gold",
    spark: [34, 35, 36, 35, 37, 37, 38],
    icon: ReceiptText,
    caption: "Meta 40€ · 95%",
  },
  {
    id: "noshows",
    label: "No-shows",
    value: "3",
    delta: "−1",
    trend: "down",
    goodDown: true,
    color: "teal",
    spark: [6, 5, 6, 4, 5, 4, 3],
    icon: UserX,
    caption: "Tasa 6.4% · meta <8%",
  },
  {
    id: "rating",
    label: "Google Rating",
    value: "4.6★",
    delta: "+0.1",
    trend: "up",
    color: "gold",
    spark: [4.3, 4.4, 4.4, 4.5, 4.5, 4.6, 4.6],
    icon: Star,
    caption: "412 reseñas · 30 días",
  },
];

const RESERVATIONS: Reservation[] = [
  { id: "r1", time: "13:30", customer: "Familia Marín", pax: 4, status: "checked-in", table: "Mesa 12" },
  { id: "r2", time: "14:00", customer: "Javier Soler", pax: 2, status: "checked-in", table: "Mesa 4" },
  { id: "r3", time: "14:15", customer: "Marta Iborra", pax: 3, status: "confirmed", table: "Mesa 9" },
  { id: "r4", time: "14:30", customer: "David Puig", pax: 6, status: "waitlist", vip: true },
  { id: "r5", time: "20:30", customer: "Elena Marín", pax: 2, status: "confirmed", vip: true, table: "Mesa 7" },
  { id: "r6", time: "21:00", customer: "Andrés Vidal", pax: 5, status: "confirmed", table: "Mesa 14" },
  { id: "r7", time: "21:15", customer: "Lucía Ferrer", pax: 4, status: "waitlist" },
];

const TIMELINE: TimelineEvent[] = [
  { id: "t1", time: "10:00", label: "Apertura", note: "Equipo de mañana · 4 personas", tone: "default" },
  { id: "t2", time: "13:00", label: "Primer servicio", note: "Comida abierta al público", tone: "teal" },
  { id: "t3", time: "14:30", label: "Pico comida", note: "Ocupación 92% · 6 mesas activas", tone: "gold" },
  { id: "t4", time: "20:30", label: "Pico cena", note: "Pico previsto · 18 reservas simultáneas", tone: "gold" },
  { id: "t5", time: "23:30", label: "Cierre", note: "Última mesa · cuadre de caja", tone: "default" },
];

const CHART: ChartPoint[] = [
  { day: "Mar", date: "21 ene", v: 38 },
  { day: "Mié", date: "22 ene", v: 42 },
  { day: "Jue", date: "23 ene", v: 35 },
  { day: "Vie", date: "24 ene", v: 56 },
  { day: "Sáb", date: "25 ene", v: 67 },
  { day: "Dom", date: "26 ene", v: 51 },
  { day: "Lun", date: "27 ene", v: 47, today: true },
];

/**
 * Time-range datasets for the performance chart.
 * Each range produces a different number of points/labels, but the chart
 * layout adapts gracefully (the SVG uses an x-axis step based on the data
 * length). All values are deterministic (no flicker on re-render).
 */
const CHART_RANGES: Record<TimeRange, ChartPoint[]> = {
  "7d": CHART,
  "30d": [
    { day: "S1", date: "01 ene", v: 31 },
    { day: "S2", date: "04 ene", v: 35 },
    { day: "S3", date: "07 ene", v: 33 },
    { day: "S4", date: "10 ene", v: 41 },
    { day: "S5", date: "13 ene", v: 44 },
    { day: "S6", date: "16 ene", v: 39 },
    { day: "S7", date: "19 ene", v: 52 },
    { day: "S8", date: "22 ene", v: 48 },
    { day: "S9", date: "25 ene", v: 56 },
    { day: "Lun", date: "27 ene", v: 47, today: true },
  ],
  "90d": [
    { day: "Nov", date: "Q4 2024", v: 312 },
    { day: "Dic", date: "Q4 2024", v: 348 },
    { day: "Ene", date: "Q1 2025", v: 326 },
    { day: "Sem1", date: "Ene", v: 184 },
    { day: "Sem2", date: "Ene", v: 211 },
    { day: "Sem3", date: "Ene", v: 198 },
    { day: "Sem4", date: "Ene", v: 232, today: true },
  ],
  año: [
    { day: "Ene", date: "2024", v: 412 },
    { day: "Feb", date: "2024", v: 388 },
    { day: "Mar", date: "2024", v: 456 },
    { day: "Abr", date: "2024", v: 421 },
    { day: "May", date: "2024", v: 498 },
    { day: "Jun", date: "2024", v: 512 },
    { day: "Jul", date: "2024", v: 538 },
    { day: "Ago", date: "2024", v: 472 },
    { day: "Sep", date: "2024", v: 456 },
    { day: "Oct", date: "2024", v: 524 },
    { day: "Nov", date: "2024", v: 561 },
    { day: "Dic", date: "2024", v: 612, today: true },
  ],
};

const AI_RECS: AiRec[] = [
  {
    id: "ai1",
    title: "Ofrece 10% en postres a mesas de 2+ para subir el ticket medio",
    action: "Crear oferta",
    confidence: 82,
    rationale: "Mesas de 2+ pax piden postre solo en el 31% de los servicios.",
    icon: ReceiptText,
  },
  {
    id: "ai2",
    title: "3 clientes VIP no reservan hace 60 días · lanza campaña de reactivación",
    action: "Lanzar campaña",
    confidence: 91,
    rationale: "Patrón de inactividad detectado en segmento VIP.",
    icon: Crown,
  },
  {
    id: "ai3",
    title: "Sobredemanda el sábado 20:30 · activa lista de espera automática",
    action: "Activar lista",
    confidence: 74,
    rationale: "Previsión 113% de capacidad con 9 reservas pendientes.",
    icon: CalendarClock,
  },
];

const ACTIVITY: ActivityEvent[] = [
  {
    id: "a1",
    type: "reserva",
    text: "Nueva reserva · Elena Marín, 2 pax, hoy 20:30",
    ago: "hace 3 min",
    icon: CalendarCheck,
    tone: "teal",
  },
  {
    id: "a2",
    type: "vip",
    text: "Cliente VIP check-in · David Puig",
    ago: "hace 12 min",
    icon: Crown,
    tone: "gold",
  },
  {
    id: "a3",
    type: "resena",
    text: "Reseña recibida · 5★ de Carlos M.",
    ago: "hace 28 min",
    icon: StarIcon,
    tone: "gold",
  },
  {
    id: "a4",
    type: "campana",
    text: "Campaña enviada · «Cena de San Valentín» a 248 clientes",
    ago: "hace 1 h",
    icon: Megaphone,
    tone: "default",
  },
  {
    id: "a5",
    type: "mesa",
    text: "Mesa reasignada · Mesa 14 → Mesa 9 (familia Marín)",
    ago: "hace 2 h",
    icon: RefreshCw,
    tone: "default",
  },
];

const UPCOMING: Upcoming[] = [
  { id: "u1", time: "20:30", customer: "Elena Marín", pax: 2, vip: true, inMin: 18 },
  { id: "u2", time: "20:45", customer: "Marc Puig", pax: 3, inMin: 33 },
  { id: "u3", time: "21:00", customer: "Andrés Vidal", pax: 5, inMin: 48 },
  { id: "u4", time: "21:15", customer: "Lucía Ferrer", pax: 4, inMin: 63 },
];

const INTEGRATIONS: Integration[] = [
  { id: "i1", name: "Stripe", status: "conectado", detail: "Pagos y depósitos · ✓", icon: Banknote },
  { id: "i2", name: "WhatsApp", status: "conectado", detail: "Recordatorios · ✓", icon: MessageSquare },
  { id: "i3", name: "Google", status: "pendiente", detail: "Reseñas · OAuth pendiente", icon: StarIcon },
  { id: "i4", name: "Resend", status: "conectado", detail: "Email transaccional · ✓", icon: Megaphone },
];

const ALERTS: DemoAlert[] = [
  { id: "al1", text: "3 reservas sin confirmar para esta noche", action: "Revisar", tone: "amber" },
  { id: "al2", text: "Reseña negativa recibida en Ramses Barcelona (2★)", action: "Responder", tone: "red" },
];

/* ============================================================
   Main Home component
============================================================ */

export function Home() {
  const [showRating, setShowRating] = React.useState(true);
  const [showNoShows, setShowNoShows] = React.useState(true);
  const [showAI, setShowAI] = React.useState(true);

  const visibleKpis = KPIS.filter((k) => {
    if (k.id === "rating" && !showRating) return false;
    if (k.id === "noshows" && !showNoShows) return false;
    return true;
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--teal)] animate-pulse" aria-hidden />
            <span className="rp-teal-text">En servicio</span>
            <span className="text-muted-foreground/60">·</span>
            <span>martes 27 ene 2025</span>
          </div>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-light tracking-tight">
            Buenas tardes, <span className="rp-gold-text">Ana</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Resumen operativo de Ramses Madrid · Servicio de cena empieza en 3h 12min.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => useNav.getState().go("reservas")}
            className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-foreground/5 px-3 py-2.5 min-h-[44px] text-sm hover:border-[var(--gold)]/40 hover:bg-[var(--gold)]/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/40"
          >
            <CalendarCheck className="h-4 w-4" aria-hidden />
            <span>Ver reservas</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          </button>
        </div>
      </header>

      {/* Alerts strip */}
      <AlertsStrip />

      {/* Widget visibility toggles */}
      <WidgetSettings
        showRating={showRating}
        setShowRating={setShowRating}
        showNoShows={showNoShows}
        setShowNoShows={setShowNoShows}
        showAI={showAI}
        setShowAI={setShowAI}
      />

      {/* KPI grid */}
      <section aria-label="Indicadores clave del día" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base sm:text-lg font-medium tracking-tight">
            Indicadores del día
          </h2>
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            {visibleKpis.length} de {KPIS.length} widgets
          </span>
        </div>
        {visibleKpis.length === 0 ? (
          <EmptyState message="Todos los KPIs están ocultos. Activa alguno para ver métricas." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {visibleKpis.map((k) => (
              <KpiCard key={k.id} kpi={k} />
            ))}
          </div>
        )}
      </section>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
        {/* Main column */}
        <main className="lg:col-span-2 space-y-5">
          <ReservasHoyWidget />
          <TimelineWidget />
          <PerformanceWidget />
        </main>

        {/* Sidebar column */}
        <aside className="space-y-5">
          {showAI ? <AiRecommendationsWidget /> : null}
          <ActivityWidget />
          <UpcomingReservationsWidget />
          <IntegrationsWidget />
        </aside>
      </div>
    </div>
  );
}

/* ============================================================
   Sub-components
============================================================ */

function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-[0.15em] text-amber-300/90",
        className
      )}
      title="Datos de demostración"
    >
      demo
    </span>
  );
}

function WidgetShell({
  title,
  icon: Icon,
  iconColor = "gold",
  action,
  children,
  ariaLabel,
  className,
}: {
  title: string;
  icon: React.ElementType;
  iconColor?: "gold" | "teal";
  action?: React.ReactNode;
  children: React.ReactNode;
  ariaLabel: string;
  className?: string;
}) {
  const iconBg = iconColor === "gold" ? "bg-[var(--gold)]/10" : "bg-[var(--teal)]/10";
  const iconColorCls = iconColor === "gold" ? "text-[var(--gold-soft)]" : "text-[var(--teal)]";
  return (
    <section
      aria-label={ariaLabel}
      className={cn("rp-glass rounded-xl p-4 sm:p-5 relative", className)}
    >
      <header className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={cn("h-8 w-8 rounded-md flex items-center justify-center shrink-0", iconBg)}>
            <Icon className={cn("h-4 w-4", iconColorCls)} aria-hidden />
          </div>
          <h3 className="font-display text-base sm:text-lg font-medium tracking-tight truncate">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {action}
          <DemoBadge />
        </div>
      </header>
      {children}
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rp-glass rounded-xl p-8 text-center" role="status">
      <div className="mx-auto h-10 w-10 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground">
        <Clock className="h-4 w-4" aria-hidden />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/* ---------- Sparkline ---------- */

function Sparkline({ data, color }: { data: number[]; color: "gold" | "teal" }) {
  const rawId = React.useId();
  const id = rawId.replace(/[:]/g, "");
  const w = 76;
  const h = 28;
  const pad = 3;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - pad * 2) + pad;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y] as [number, number];
  });
  const linePts = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaPath = `M${pts[0][0].toFixed(1)},${(h - pad).toFixed(1)} L${pts
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" L")} L${pts[pts.length - 1][0].toFixed(1)},${(h - pad).toFixed(1)} Z`;
  const stroke = color === "gold" ? "var(--gold)" : "var(--teal)";
  const lastPt = pts[pts.length - 1];

  // Entrance animation: viewport-triggered, once-only, reduced-motion respected.
  const { ref: viewRef, inView } = useInView<SVGSVGElement>({ threshold: 0.2 });
  const progress = useEntranceProgress(inView, 700);
  const { ref: lineRef, length } = usePathLength<SVGPolylineElement>();
  const { dasharray, dashoffset } = drawDash(length, progress);

  return (
    <svg
      ref={viewRef}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
      focusable="false"
      className="shrink-0 overflow-visible max-w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.32" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-${id})`} style={{ opacity: progress }} />
      <polyline
        ref={lineRef}
        points={linePts}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray={dasharray}
        strokeDashoffset={dashoffset}
      />
      <circle
        cx={lastPt[0]}
        cy={lastPt[1]}
        r="2"
        fill={stroke}
        style={{ opacity: progress, transition: "opacity 200ms ease-out" }}
      />
    </svg>
  );
}

/* ---------- KPI card ---------- */

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon;
  const isGood = kpi.trend === "up" || kpi.goodDown === true;
  const valueColor =
    kpi.color === "gold" ? "text-[var(--gold-soft)]" : "text-[var(--teal)]";
  const pillCls = isGood
    ? kpi.color === "gold"
      ? "bg-[var(--gold)]/10 text-[var(--gold-soft)] border-[var(--gold)]/25"
      : "bg-[var(--teal)]/10 text-[var(--teal)] border-[var(--teal)]/25"
    : "bg-destructive/10 text-destructive border-destructive/30";
  const iconBg = kpi.color === "gold" ? "bg-[var(--gold)]/10" : "bg-[var(--teal)]/10";
  const iconColorCls = kpi.color === "gold" ? "text-[var(--gold-soft)]" : "text-[var(--teal)]";

  return (
    <article
      className="rp-glass rounded-xl p-4 relative group transition-all hover:border-[var(--gold)]/30 hover:shadow-[0_8px_40px_-12px_color-mix(in_oklab,var(--gold)_30%,transparent)]"
      aria-label={`KPI ${kpi.label}: ${kpi.value}, ${kpi.delta}`}
    >
      <div className="absolute top-3 right-3">
        <DemoBadge />
      </div>
      <div className="flex items-start gap-3 pr-12">
        <div className={cn("h-9 w-9 rounded-md flex items-center justify-center shrink-0", iconBg)}>
          <Icon className={cn("h-4 w-4", iconColorCls)} aria-hidden />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground truncate">
            {kpi.label}
          </div>
          <div className={cn("mt-1 font-display text-2xl sm:text-3xl font-light tabular-nums leading-none", valueColor)}>
            {kpi.value}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-mono",
              pillCls
            )}
          >
            {kpi.trend === "up" ? (
              <ArrowUpRight className="h-3 w-3" aria-hidden />
            ) : (
              <ArrowDownRight className="h-3 w-3" aria-hidden />
            )}
            <span className="tabular-nums">{kpi.delta}</span>
          </span>
          <div className="mt-1.5 text-[11px] text-muted-foreground truncate">{kpi.caption}</div>
        </div>
        <Sparkline data={kpi.spark} color={kpi.color} />
      </div>
    </article>
  );
}

/* ---------- Widget settings (toggles) ---------- */

function WidgetSettings({
  showRating,
  setShowRating,
  showNoShows,
  setShowNoShows,
  showAI,
  setShowAI,
}: {
  showRating: boolean;
  setShowRating: (v: boolean) => void;
  showNoShows: boolean;
  setShowNoShows: (v: boolean) => void;
  showAI: boolean;
  setShowAI: (v: boolean) => void;
}) {
  return (
    <section
      aria-label="Personalizar widgets del dashboard"
      className="rp-glass rounded-xl p-3 sm:p-4 flex flex-wrap items-center gap-x-5 gap-y-3"
    >
      <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
        <Settings2 className="h-3.5 w-3.5" aria-hidden />
        <span>Personalizar widgets</span>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <label
          htmlFor="tg-rating"
          className="flex items-center gap-2 text-sm cursor-pointer select-none min-h-[40px] py-1.5 px-1 -mx-1 rounded-md hover:text-[var(--gold-soft)] transition-colors focus-within:text-[var(--gold-soft)]"
        >
          <Checkbox
            id="tg-rating"
            checked={showRating}
            onCheckedChange={(v) => setShowRating(v === true)}
            aria-label="Mostrar Google Rating"
          />
          <span>Mostrar Google Rating</span>
        </label>
        <label
          htmlFor="tg-noshows"
          className="flex items-center gap-2 text-sm cursor-pointer select-none min-h-[40px] py-1.5 px-1 -mx-1 rounded-md hover:text-[var(--gold-soft)] transition-colors"
        >
          <Checkbox
            id="tg-noshows"
            checked={showNoShows}
            onCheckedChange={(v) => setShowNoShows(v === true)}
            aria-label="Mostrar No-shows"
          />
          <span>Mostrar No-shows</span>
        </label>
        <label
          htmlFor="tg-ai"
          className="flex items-center gap-2 text-sm cursor-pointer select-none min-h-[40px] py-1.5 px-1 -mx-1 rounded-md hover:text-[var(--gold-soft)] transition-colors"
        >
          <Checkbox
            id="tg-ai"
            checked={showAI}
            onCheckedChange={(v) => setShowAI(v === true)}
            aria-label="Mostrar Recomendaciones IA"
          />
          <span>Mostrar Recomendaciones IA</span>
        </label>
      </div>
    </section>
  );
}

/* ---------- Alerts strip ---------- */

function AlertsStrip() {
  return (
    <section aria-label="Alertas operativas" className="space-y-2">
      {ALERTS.map((a) => {
        const isRed = a.tone === "red";
        const Icon = isRed ? ShieldAlert : AlertTriangle;
        const cls = isRed
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-amber-400/40 bg-amber-400/10 text-amber-300";
        const btnCls = isRed
          ? "border-destructive/40 hover:bg-destructive/15 hover:border-destructive/60"
          : "border-amber-400/40 hover:bg-amber-400/15 hover:border-amber-400/60";
        return (
          <div
            key={a.id}
            className={cn(
              "rp-glass rounded-lg border-l-2 px-3 sm:px-4 py-2.5 flex items-center gap-3 flex-wrap",
              cls
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <p className="text-sm flex-1 min-w-0">{a.text}</p>
            <button
              className={cn(
                "inline-flex items-center gap-1 rounded-md border bg-foreground/5 px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/40 min-h-[40px]",
                btnCls
              )}
            >
              {a.action}
              <ChevronRight className="h-3 w-3" aria-hidden />
            </button>
            <DemoBadge />
          </div>
        );
      })}
    </section>
  );
}

/* ---------- Reservations today widget ---------- */

const STATUS_STYLES: Record<ResStatus, { label: string; cls: string }> = {
  confirmed: {
    label: "Confirmada",
    cls: "bg-[var(--gold)]/10 text-[var(--gold-soft)] border-[var(--gold)]/25",
  },
  waitlist: {
    label: "Lista de espera",
    cls: "bg-foreground/5 text-muted-foreground border-foreground/15",
  },
  "checked-in": {
    label: "Check-in",
    cls: "bg-[var(--teal)]/10 text-[var(--teal)] border-[var(--teal)]/25",
  },
};

function ReservasHoyWidget() {
  const [selected, setSelected] = React.useState<string | null>(RESERVATIONS[0]?.id ?? null);
  const go = useNav((s) => s.go);

  return (
    <WidgetShell
      title="Reservas de hoy"
      icon={CalendarCheck}
      iconColor="gold"
      ariaLabel="Reservas de hoy"
      action={
        <button
          onClick={() => go("reservas")}
          className="text-xs text-muted-foreground hover:text-[var(--gold)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/40 rounded px-1"
        >
          Ver todo
        </button>
      }
    >
      {RESERVATIONS.length === 0 ? (
        <EmptyState message="No hay reservas para hoy." />
      ) : (
        <ul className="divide-y divide-border/40 -mx-1" role="list">
          {RESERVATIONS.map((r) => {
            const isSel = selected === r.id;
            const st = STATUS_STYLES[r.status];
            return (
              <li key={r.id}>
                <button
                  onClick={() => setSelected(r.id)}
                  aria-pressed={isSel}
                  aria-label={`Reserva ${r.time} ${r.customer}, ${r.pax} personas, ${st.label}`}
                  className={cn(
                    "w-full min-h-[44px] flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2.5 text-left rounded-md transition-colors",
                    isSel
                      ? "bg-[var(--gold)]/8 ring-1 ring-[var(--gold)]/25"
                      : "hover:bg-foreground/[0.04] focus-visible:bg-foreground/[0.04]"
                  )}
                >
                  <div className="font-mono text-sm tabular-nums w-11 shrink-0 text-[var(--gold-soft)]">
                    {r.time}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm font-medium truncate">{r.customer}</span>
                      {r.vip ? (
                        <Crown
                          className="h-3.5 w-3.5 text-[var(--gold)] shrink-0"
                          aria-label="Cliente VIP"
                        />
                      ) : null}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {r.table ?? "Mesa por asignar"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                    <Users className="h-3.5 w-3.5" aria-hidden />
                    <span className="tabular-nums">{r.pax}</span>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md border px-1.5 sm:px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider shrink-0",
                      st.cls
                    )}
                  >
                    {st.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </WidgetShell>
  );
}

/* ---------- Timeline widget ---------- */

function TimelineWidget() {
  return (
    <WidgetShell
      title="Timeline del día"
      icon={Clock}
      iconColor="teal"
      ariaLabel="Timeline del día"
    >
      <ol className="relative pl-6" role="list">
        {/* vertical line */}
        <div
          className="absolute left-[7px] top-1 bottom-1 w-px bg-gradient-to-b from-[var(--teal)]/40 via-foreground/15 to-transparent"
          aria-hidden
        />
        {TIMELINE.map((e) => {
          const dotCls =
            e.tone === "gold"
              ? "bg-[var(--gold)] ring-[var(--gold)]/30"
              : e.tone === "teal"
              ? "bg-[var(--teal)] ring-[var(--teal)]/30"
              : "bg-foreground/60 ring-foreground/20";
          return (
            <li key={e.id} className="relative pb-5 last:pb-0">
              <span
                className={cn(
                  "absolute -left-6 top-1 h-3 w-3 rounded-full ring-4 ring-background",
                  dotCls
                )}
                aria-hidden
              />
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-mono text-sm tabular-nums text-[var(--gold-soft)]">
                  {e.time}
                </span>
                <span className="text-sm font-medium">{e.label}</span>
              </div>
              {e.note ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{e.note}</p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </WidgetShell>
  );
}

/* ---------- Performance chart widget ---------- */

function PerformanceWidget() {
  const reduce = useReducedMotion();
  const [range, setRange] = React.useState<TimeRange>("7d");
  const [hidden, setHidden] = React.useState<Set<string>>(new Set());
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const [mousePx, setMousePx] = React.useState<{ x: number; y: number } | null>(null);
  const svgWrapRef = React.useRef<HTMLDivElement>(null);

  const data = CHART_RANGES[range];
  const w = 560;
  const h = 200;
  const padT = 14;
  const padB = 38;
  const padL = 30;
  const padR = 8;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const max = Math.max(...data.map((d) => d.v));
  const niceMax = Math.ceil(max / 20) * 20 || 20;
  const stepX = chartW / data.length;
  const barW = stepX * 0.5;
  const gridLevels = [0, 0.25, 0.5, 0.75, 1];

  const legendItems: LegendItem[] = [
    { id: "reservas", label: "Reservas", color: "var(--gold)" },
    { id: "hoy", label: "Hoy", color: "var(--teal)" },
  ];

  function toggle(id: string) {
    setHidden((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  const total = data.reduce((s, d) => s + d.v, 0);
  const media = total / data.length;
  const rangeLabel =
    range === "7d"
      ? "últimos 7 días"
      : range === "30d"
      ? "últimos 30 días"
      : range === "90d"
      ? "últimos 90 días"
      : "último año";

  const hoveredPoint = hoverIdx != null ? data[hoverIdx] : null;
  const prevPoint = hoverIdx != null && hoverIdx > 0 ? data[hoverIdx - 1] : null;
  const delta =
    prevPoint && hoveredPoint ? hoveredPoint.v - prevPoint.v : null;

  return (
    <WidgetShell
      title="Gráfico de rendimiento"
      icon={TrendingUp}
      iconColor="gold"
      ariaLabel="Gráfico de rendimiento de reservas por día"
      action={<TimeRangeSelector value={range} onChange={setRange} />}
    >
      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <p className="text-sm text-muted-foreground">
            Reservas por día · {rangeLabel}
          </p>
          <p className="text-[11px] font-mono text-muted-foreground">
            Media{" "}
            <span className="text-[var(--gold-soft)] tabular-nums">
              {media.toFixed(1)}
            </span>{" "}
            · Total{" "}
            <span className="text-[var(--gold-soft)] tabular-nums">{total}</span>
          </p>
        </div>
        <div
          ref={svgWrapRef}
          className="relative"
          style={{ aspectRatio: `${w} / ${h}` }}
        >
          <svg
            viewBox={`0 0 ${w} ${h}`}
            width="100%"
            height="100%"
            className="block rp-scroll-thin"
            preserveAspectRatio="none"
            role="img"
            aria-label="Barras de reservas por día"
            onMouseMove={(e) => {
              const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
              const px = e.clientX - rect.left;
              const py = e.clientY - rect.top;
              const svgX = (px / rect.width) * w;
              const i = Math.floor((svgX - padL) / stepX);
              if (i >= 0 && i < data.length) {
                setHoverIdx(i);
                setMousePx({ x: px, y: py });
              } else {
                setHoverIdx(null);
                setMousePx(null);
              }
            }}
            onMouseLeave={() => {
              setHoverIdx(null);
              setMousePx(null);
            }}
          >
            {/* Y axis labels + gridlines */}
            {gridLevels.map((lvl) => {
              const y = padT + chartH - lvl * chartH;
              const val = Math.round(niceMax * lvl);
              return (
                <g key={`g-${lvl}`}>
                  <line
                    x1={padL}
                    x2={w - padR}
                    y1={y}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity={lvl === 0 ? 0.25 : 0.08}
                    strokeWidth={1}
                  />
                  <text
                    x={padL - 6}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="9"
                    fontFamily="var(--font-jetbrains), monospace"
                    fill="currentColor"
                    fillOpacity={0.5}
                  >
                    {val}
                  </text>
                </g>
              );
            })}
            {/* Bars (crossfade between ranges via AnimatePresence) */}
            <AnimatePresence initial={false}>
              <motion.g
                key={range}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {data.map((d, i) => {
                  const isHidden = d.today
                    ? hidden.has("hoy")
                    : hidden.has("reservas");
                  if (isHidden) return null;
                  const barH = (d.v / niceMax) * chartH;
                  const x = padL + i * stepX + (stepX - barW) / 2;
                  const y = padT + chartH - barH;
                  const fill = d.today ? "var(--teal)" : "var(--gold)";
                  const baseOpacity = d.today ? 1 : 0.85;
                  const dimmed =
                    hoverIdx != null && hoverIdx !== i ? 0.35 : baseOpacity;
                  const delay = Math.min(i * 0.05, 0.4);
                  return (
                    <g key={`b-${range}-${d.day}-${i}`}>
                      <motion.rect
                        x={x}
                        y={y}
                        width={barW}
                        height={barH}
                        rx={2}
                        fill={fill}
                        fillOpacity={dimmed}
                        initial={reduce ? false : { scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={
                          reduce
                            ? { duration: 0 }
                            : { duration: 0.7, delay, ease: "easeOut" }
                        }
                        style={{
                          transformOrigin: `${x + barW / 2}px ${padT + chartH}px`,
                          transformBox: "view-box",
                        } as React.CSSProperties}
                      />
                      <motion.text
                        x={x + barW / 2}
                        y={y - 5}
                        textAnchor="middle"
                        fontSize="9"
                        fontFamily="var(--font-jetbrains), monospace"
                        fill={d.today ? "var(--teal)" : "var(--gold-soft)"}
                        initial={reduce ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={
                          reduce
                            ? { duration: 0 }
                            : { duration: 0.3, delay: delay + 0.45 }
                        }
                      >
                        {d.v}
                      </motion.text>
                      <text
                        x={x + barW / 2}
                        y={padT + chartH + 14}
                        textAnchor="middle"
                        fontSize="10"
                        fontFamily="var(--font-inter), sans-serif"
                        fill="currentColor"
                        fillOpacity={d.today ? 0.95 : 0.55}
                        fontWeight={d.today ? 600 : 400}
                      >
                        {d.day}
                      </text>
                      <text
                        x={x + barW / 2}
                        y={padT + chartH + 26}
                        textAnchor="middle"
                        fontSize="8"
                        fontFamily="var(--font-jetbrains), monospace"
                        fill="currentColor"
                        fillOpacity={0.35}
                      >
                        {d.date}
                      </text>
                    </g>
                  );
                })}
              </motion.g>
            </AnimatePresence>
            {/* Crosshair */}
            {hoverIdx != null && (
              <Crosshair
                x={padL + hoverIdx * stepX + stepX / 2}
                y1={padT}
                y2={padT + chartH}
              />
            )}
          </svg>
          <CursorTooltip
            position={{ x: mousePx?.x ?? null, y: mousePx?.y ?? null }}
            containerRef={svgWrapRef}
            estimatedSize={{ width: 180, height: 88 }}
          >
            {hoveredPoint ? (
              <div className="space-y-0.5">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {hoveredPoint.day} · {hoveredPoint.date}
                </div>
                <div className="font-display text-base text-foreground">
                  {hoveredPoint.v}{" "}
                  <span className="text-[10px] text-muted-foreground">reservas</span>
                </div>
                {delta != null ? (
                  <div
                    className={cn(
                      "text-[10px] font-mono",
                      delta >= 0 ? "text-emerald-300" : "text-rose-300"
                    )}
                  >
                    {delta >= 0 ? "+" : ""}
                    {delta} vs anterior
                  </div>
                ) : null}
              </div>
            ) : null}
          </CursorTooltip>
        </div>
        <ClickableLegend
          items={legendItems}
          hidden={hidden}
          onToggle={toggle}
        />
      </div>
    </WidgetShell>
  );
}

/* ---------- AI recommendations widget ---------- */

function AiRecommendationsWidget() {
  return (
    <WidgetShell
      title="Recomendaciones de IA"
      icon={Sparkles}
      iconColor="gold"
      ariaLabel="Recomendaciones de IA"
      className="rp-glow-gold"
    >
      {AI_RECS.length === 0 ? (
        <EmptyState message="No hay recomendaciones disponibles en este momento." />
      ) : (
        <ul className="space-y-3" role="list">
          {AI_RECS.map((r) => {
            const Icon = r.icon;
            const confCls =
              r.confidence >= 85
                ? "bg-emerald-400/10 text-emerald-300 border-emerald-400/30"
                : r.confidence >= 75
                ? "bg-[var(--gold)]/10 text-[var(--gold-soft)] border-[var(--gold)]/30"
                : "bg-foreground/5 text-muted-foreground border-foreground/20";
            return (
              <li
                key={r.id}
                className="rounded-lg border border-border/60 bg-foreground/[0.02] p-3 hover:border-[var(--gold)]/30 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded-md bg-[var(--gold)]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-3.5 w-3.5 text-[var(--gold-soft)]" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">{r.title}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                      {r.rationale}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                          confCls
                        )}
                      >
                        <Sparkles className="h-3 w-3" aria-hidden />
                        Confianza {r.confidence}%
                      </span>
                      <button
                        className="inline-flex items-center gap-1 rounded-md border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-2.5 py-1.5 min-h-[36px] text-[11px] font-medium text-[var(--gold-soft)] hover:bg-[var(--gold)]/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/40"
                        aria-label={`Revisar antes de ejecutar: ${r.action}`}
                      >
                        <Zap className="h-3 w-3" aria-hidden />
                        <span>Revisar antes de ejecutar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-3 text-[11px] text-muted-foreground/80 italic">
        IA propone, humano decide. Toda acción sensible requiere aprobación explícita.
      </p>
    </WidgetShell>
  );
}

/* ---------- Activity feed widget ---------- */

function ActivityWidget() {
  return (
    <WidgetShell
      title="Actividad reciente"
      icon={BellRing}
      iconColor="teal"
      ariaLabel="Actividad reciente"
    >
      {ACTIVITY.length === 0 ? (
        <EmptyState message="Sin actividad reciente." />
      ) : (
        <ul className="space-y-1 -mx-1" role="list">
          {ACTIVITY.map((a) => {
            const Icon = a.icon;
            const iconBg =
              a.tone === "gold"
                ? "bg-[var(--gold)]/10 text-[var(--gold-soft)]"
                : a.tone === "teal"
                ? "bg-[var(--teal)]/10 text-[var(--teal)]"
                : "bg-foreground/5 text-muted-foreground";
            return (
              <li key={a.id}>
                <div className="flex items-start gap-2.5 px-2 py-2 rounded-md hover:bg-foreground/[0.03]">
                  <div
                    className={cn(
                      "h-7 w-7 rounded-md flex items-center justify-center shrink-0",
                      iconBg
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">{a.text}</p>
                    <p className="mt-0.5 text-[11px] font-mono text-muted-foreground tabular-nums">
                      {a.ago}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </WidgetShell>
  );
}

/* ---------- Upcoming reservations widget ---------- */

function UpcomingReservationsWidget() {
  return (
    <WidgetShell
      title="Próximas reservas"
      icon={CalendarClock}
      iconColor="gold"
      ariaLabel="Próximas reservas en las próximas 2 horas"
    >
      {UPCOMING.length === 0 ? (
        <EmptyState message="No hay reservas en las próximas 2 horas." />
      ) : (
        <ul className="space-y-2" role="list">
          {UPCOMING.map((u) => (
            <li
              key={u.id}
              className="flex items-center gap-3 rounded-md border border-border/60 bg-foreground/[0.02] px-3 py-2 hover:border-[var(--gold)]/30 transition-colors"
            >
              <div className="font-mono text-sm tabular-nums text-[var(--gold-soft)] w-12 shrink-0">
                {u.time}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm font-medium truncate">{u.customer}</span>
                  {u.vip ? (
                    <Crown className="h-3.5 w-3.5 text-[var(--gold)] shrink-0" aria-label="VIP" />
                  ) : null}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" aria-hidden />
                    <span className="tabular-nums">{u.pax}</span>
                  </span>
                  <span className="text-muted-foreground/60">·</span>
                  <span className="font-mono tabular-nums">en {u.inMin} min</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </WidgetShell>
  );
}

/* ---------- Integrations widget ---------- */

function IntegrationsWidget() {
  return (
    <WidgetShell
      title="Estado de integraciones"
      icon={Plug}
      iconColor="teal"
      ariaLabel="Estado de integraciones"
    >
      <ul className="space-y-2" role="list">
        {INTEGRATIONS.map((it) => {
          const Icon = it.icon;
          const connected = it.status === "conectado";
          return (
            <li
              key={it.id}
              className="flex items-center gap-3 rounded-md border border-border/60 bg-foreground/[0.02] px-3 py-2"
            >
              <div className="h-8 w-8 rounded-md bg-foreground/5 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{it.name}</div>
                <div className="text-[11px] text-muted-foreground truncate">{it.detail}</div>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider shrink-0",
                  connected
                    ? "bg-[var(--teal)]/10 text-[var(--teal)] border-[var(--teal)]/25"
                    : "bg-amber-400/10 text-amber-300 border-amber-400/30"
                )}
              >
                {connected ? (
                  <CheckCircle2 className="h-3 w-3" aria-hidden />
                ) : (
                  <Hourglass className="h-3 w-3" aria-hidden />
                )}
                {it.status}
              </span>
            </li>
          );
        })}
      </ul>
    </WidgetShell>
  );
}
