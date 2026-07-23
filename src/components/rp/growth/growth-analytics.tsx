"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import {
  TrendingUp,
  TrendingDown,
  Info,
  Sparkles,
  Send,
  ArrowRight,
  Check,
  X,
  Mail,
  MessageSquare,
  Smartphone,
  Bell,
  Share2,
  Users,
  Star,
  Target,
  DollarSign,
  MousePointerClick,
  MailOpen,
  UserCheck,
  Gauge,
  RefreshCw,
  ChevronRight,
  Activity,
} from "lucide-react";

/* =====================================================================
 * Types
 * ===================================================================== */

interface Kpi {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  positive: boolean;
  source: string;
  period: string;
  definition: string;
  icon: React.ElementType;
  accent: "gold" | "teal";
}

interface Campaign {
  id: string;
  name: string;
  revenue: number;
  cost: number;
}

interface AIInsight {
  id: string;
  text: string;
  confidence: number;
  impact?: string;
  category: "ocupacion" | "best_campaign" | "vip" | "channel" | "upsell";
}

interface ChannelPerf {
  id: string;
  name: string;
  icon: React.ElementType;
  sent: number;
  opened: number;
  ctr: number;
  conversions: number;
  revenue: number;
  roi: number;
  cost: number;
}

interface SegmentPerf {
  id: string;
  name: string;
  size: number;
  campaigns: number;
  conversions: number;
  revenue: number;
  avgTicket: number;
}

interface FunnelStage {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface ChatTurn {
  id: string;
  role: "user" | "ai";
  text: string;
  data?: { label: string; value: string }[];
  action?: string;
  confidence?: number;
  source?: string;
}

/* =====================================================================
 * Demo data
 * ===================================================================== */

const KPIS: Kpi[] = [
  {
    id: "roi",
    label: "ROI medio campañas",
    value: "340%",
    trend: "+45%",
    trendUp: true,
    positive: true,
    source: "Billing + Reservations",
    period: "Últimos 30 días",
    definition:
      "Retorno sobre inversión publicitaria. (Ingresos atribuidos − Coste) / Coste × 100.",
    icon: Gauge,
    accent: "gold",
  },
  {
    id: "reservas",
    label: "Reservas generadas",
    value: "127",
    trend: "+18",
    trendUp: true,
    positive: true,
    source: "Campaigns attribution",
    period: "Últimos 30 días",
    definition:
      "Reservas con código de campaña o atribuidas por modelo last-touch.",
    icon: Target,
    accent: "teal",
  },
  {
    id: "ingresos",
    label: "Ingresos atribuidos",
    value: "€8.420",
    trend: "+€1.200",
    trendUp: true,
    positive: true,
    source: "Billing + Campaigns",
    period: "Últimos 30 días",
    definition:
      "Ingresos facturados asociados a reservas atribuidas a campañas.",
    icon: DollarSign,
    accent: "gold",
  },
  {
    id: "cpa",
    label: "Coste por adquisición",
    value: "€4.12",
    trend: "−€0.80",
    trendUp: false,
    positive: true,
    source: "Billing / new customers",
    period: "Últimos 30 días",
    definition:
      "Coste total de campañas dividido por número de nuevos clientes adquiridos.",
    icon: UserCheck,
    accent: "teal",
  },
  {
    id: "ctr",
    label: "CTR medio",
    value: "12.4%",
    trend: "+2.1%",
    trendUp: true,
    positive: true,
    source: "Email + WhatsApp",
    period: "Últimos 30 días",
    definition: "Tasa de clics = clics / entregados, agregada por canal.",
    icon: MousePointerClick,
    accent: "gold",
  },
  {
    id: "open",
    label: "Tasa apertura email",
    value: "38%",
    trend: "+5%",
    trendUp: true,
    positive: true,
    source: "Email provider",
    period: "Últimos 30 días",
    definition: "Aperturas únicas / emails entregados.",
    icon: MailOpen,
    accent: "teal",
  },
  {
    id: "react",
    label: "Clientes recuperados",
    value: "23",
    trend: "+8",
    trendUp: true,
    positive: true,
    source: "CRM reactivation campaigns",
    period: "Últimos 30 días",
    definition:
      "Clientes inactivos +90 días que reservaron tras campaña de reactivación.",
    icon: RefreshCw,
    accent: "gold",
  },
  {
    id: "nps",
    label: "NPS",
    value: "72",
    trend: "+4",
    trendUp: true,
    positive: true,
    source: "Surveys",
    period: "Últimos 30 días",
    definition: "Net Promoter Score = % Promotores − % Detractores.",
    icon: Star,
    accent: "teal",
  },
];

const CAMPAIGNS: Campaign[] = [
  { id: "c1", name: "Cumpleaños Marzo", revenue: 1840, cost: 0 },
  { id: "c2", name: "Menú Mediodía", revenue: 1620, cost: 180 },
  { id: "c3", name: "VIP Vuelve Pronto", revenue: 1340, cost: 95 },
  { id: "c4", name: "WhatsApp Flash", revenue: 1180, cost: 60 },
  { id: "c5", name: "Reactivación 60d", revenue: 980, cost: 120 },
  { id: "c6", name: "Promo Terraza", revenue: 460, cost: 140 },
];

const AI_INSIGHTS: AIInsight[] = [
  {
    id: "ai1",
    category: "ocupacion",
    text:
      "El martes tienes 45% de ocupación. Crea una campaña para clientes inactivos +60 días con menú especial para dos. Impacto estimado: +€340 ingresos.",
    confidence: 84,
    impact: "+€340",
  },
  {
    id: "ai2",
    category: "best_campaign",
    text:
      "La campaña 'Cumpleaños Marzo' generó €1.840 con €0 coste. Es tu mejor campaña. Escala a abril.",
    confidence: 92,
    impact: "Escala → +€1.840 esperados",
  },
  {
    id: "ai3",
    category: "vip",
    text:
      "3 clientes VIP no han vuelto en 90 días. Envía oferta personalizada por WhatsApp. Impacto: +€680.",
    confidence: 88,
    impact: "+€680",
  },
  {
    id: "ai4",
    category: "channel",
    text:
      "El canal WhatsApp tiene 85% apertura vs 38% email. Prioriza WhatsApp para campañas urgentes.",
    confidence: 95,
    impact: "+47pp apertura",
  },
  {
    id: "ai5",
    category: "upsell",
    text:
      "El ticket medio bajó 4%. Sugiere upselling de postres en mesas de 4+. Impacto: +€2/reserva.",
    confidence: 72,
    impact: "+€2/reserva",
  },
];

const CHANNELS: ChannelPerf[] = [
  {
    id: "wa",
    name: "WhatsApp",
    icon: MessageSquare,
    sent: 1240,
    opened: 1054,
    ctr: 18.2,
    conversions: 42,
    revenue: 3120,
    roi: 410,
    cost: 60,
  },
  {
    id: "em",
    name: "Email",
    icon: Mail,
    sent: 3480,
    opened: 1322,
    ctr: 9.8,
    conversions: 38,
    revenue: 2680,
    roi: 245,
    cost: 110,
  },
  {
    id: "sm",
    name: "SMS",
    icon: Smartphone,
    sent: 920,
    opened: 874,
    ctr: 14.1,
    conversions: 21,
    revenue: 1480,
    roi: 290,
    cost: 55,
  },
  {
    id: "ps",
    name: "Push",
    icon: Bell,
    sent: 540,
    opened: 312,
    ctr: 7.4,
    conversions: 12,
    revenue: 740,
    roi: 185,
    cost: 30,
  },
  {
    id: "so",
    name: "Social",
    icon: Share2,
    sent: 8800,
    opened: 2640,
    ctr: 6.2,
    conversions: 14,
    revenue: 400,
    roi: 80,
    cost: 220,
  },
];

const SEGMENTS: SegmentPerf[] = [
  { id: "vip", name: "VIP", size: 48, campaigns: 3, conversions: 18, revenue: 2980, avgTicket: 64 },
  { id: "freq", name: "Frecuentes", size: 312, campaigns: 5, conversions: 41, revenue: 3180, avgTicket: 41 },
  { id: "dorm", name: "Dormidos", size: 540, campaigns: 2, conversions: 23, revenue: 1640, avgTicket: 38 },
  { id: "new", name: "Nuevos", size: 184, campaigns: 4, conversions: 28, revenue: 1620, avgTicket: 39 },
  { id: "risk", name: "En riesgo", size: 96, campaigns: 1, conversions: 17, revenue: 1180, avgTicket: 36 },
];

const FUNNEL: FunnelStage[] = [
  { id: "f1", label: "Visitantes", value: 12480, color: "var(--gold-soft)" },
  { id: "f2", label: "Leads", value: 4180, color: "var(--gold)" },
  { id: "f3", label: "Reservas", value: 1270, color: "var(--teal)" },
  { id: "f4", label: "Asistencias", value: 1164, color: "var(--teal-deep)" },
  { id: "f5", label: "Recurrentes", value: 412, color: "var(--gold-deep)" },
  { id: "f6", label: "VIP", value: 48, color: "var(--gold)" },
];

const CHAT_SUGGESTIONS = [
  "¿Qué campaña generó más ingresos?",
  "¿Qué clientes debería recuperar?",
  "¿Qué promoción funcionó mejor?",
  "¿Qué canal tiene mejor retorno?",
  "¿Por qué bajó el ticket medio?",
  "¿Qué día tendrá menor ocupación?",
];

const AI_RESPONSES: Record<
  string,
  { text: string; data: { label: string; value: string }[]; action: string; confidence: number; source: string }
> = {
  "¿Qué campaña generó más ingresos?": {
    text:
      "La campaña 'Cumpleaños Marzo' generó €1.840 con coste cero — es la más rentable del mes. La segunda es 'Menú Mediodía' con €1.620 (ROI 800%).",
    data: [
      { label: "Top campaña", value: "Cumpleaños Marzo" },
      { label: "Ingresos", value: "€1.840" },
      { label: "Coste", value: "€0" },
      { label: "ROI", value: "∞ (sin coste)" },
    ],
    action: "Escalar 'Cumpleaños Marzo' a abril replicando segmento y oferta.",
    confidence: 92,
    source: "Campaigns attribution · Billing",
  },
  "¿Qué clientes debería recuperar?": {
    text:
      "Detecté 23 clientes dormidos (+90 días) con ticket medio superior a €50. De ellos, 3 son VIP. El mejor canal para reactivación es WhatsApp (85% apertura).",
    data: [
      { label: "Dormidos +90d", value: "23" },
      { label: "De ellos VIP", value: "3" },
      { label: "Ticket medio histórico", value: "€52" },
      { label: "Canal recomendado", value: "WhatsApp" },
    ],
    action: "Lanzar campaña 'VIP Vuelve Pronto' por WhatsApp con oferta personalizada.",
    confidence: 88,
    source: "CRM · Campaigns",
  },
  "¿Qué promoción funcionó mejor?": {
    text:
      "La promo 'Menú para dos entre semana' tuvo el CTR más alto (22%) y convirtió 38 reservas en 7 días. La 'Promo Terraza' fue la peor: €460 ingresos con €140 coste.",
    data: [
      { label: "Mejor promo", value: "Menú para dos" },
      { label: "CTR", value: "22%" },
      { label: "Conversiones", value: "38" },
      { label: "ROI", value: "800%" },
    ],
    action: "Repetir 'Menú para dos' en abril. Pausar 'Promo Terraza'.",
    confidence: 86,
    source: "Campaigns attribution",
  },
  "¿Qué canal tiene mejor retorno?": {
    text:
      "WhatsApp tiene el mejor ROI (410%) y la mejor tasa de apertura (85%). Email genera más volumen pero con ROI 245%. Social es el menos eficiente (ROI 80%).",
    data: [
      { label: "Mejor ROI", value: "WhatsApp · 410%" },
      { label: "Mayor volumen", value: "Email · 3.480 envíos" },
      { label: "Menor ROI", value: "Social · 80%" },
      { label: "Recomendado", value: "WhatsApp prioritario" },
    ],
    action: "Priorizar WhatsApp para campañas urgentes y segmentos VIP.",
    confidence: 95,
    source: "Channel attribution · Billing",
  },
  "¿Por qué bajó el ticket medio?": {
    text:
      "El ticket medio bajó 4% (de €42 a €40). Causas: ↑ reservas de mesas de 2 (+12%), ↓ venta de postres (−18%), mayor proporción de menú mediodía (ticket €28).",
    data: [
      { label: "Ticket actual", value: "€40" },
      { label: "Variación", value: "−4%" },
      { label: "Postres (venta)", value: "−18%" },
      { label: "Mesas de 2", value: "+12%" },
    ],
    action: "Activar upselling de postres en mesas de 4+ con formación de sala.",
    confidence: 72,
    source: "Billing · Reservations",
  },
  "¿Qué día tendrá menor ocupación?": {
    text:
      "El próximo martes se proyecta 45% de ocupación (vs 78% media). El martes histórico es el día más flojo. Miércoles 52%. Recomiendo campaña focalizada en esos dos días.",
    data: [
      { label: "Día más flojo", value: "Martes · 45%" },
      { label: "Segundo peor", value: "Miércoles · 52%" },
      { label: "Capacidad libre", value: "~55 cubiertos" },
      { label: "Segmento óptimo", value: "Dormidos +60d" },
    ],
    action: "Crear campaña 'Martes para dos' con menú especial para clientes inactivos.",
    confidence: 84,
    source: "Predictions · Reservations history",
  },
};

/* =====================================================================
 * Helpers
 * ===================================================================== */

function fmtEUR(n: number): string {
  return "€" + n.toLocaleString("es-ES");
}

function confidenceColor(c: number): string {
  if (c >= 90) return "text-emerald-300";
  if (c >= 80) return "rp-teal-text";
  if (c >= 70) return "text-amber-300";
  return "text-destructive";
}

function confidenceRing(c: number): string {
  if (c >= 90) return "border-emerald-400/40 bg-emerald-400/10";
  if (c >= 80) return "border-[var(--teal)]/40 bg-[var(--teal)]/10";
  if (c >= 70) return "border-amber-400/40 bg-amber-400/10";
  return "border-destructive/40 bg-destructive/10";
}

/* =====================================================================
 * Shared UI atoms
 * ===================================================================== */

function InfoDot({ text }: { text: string }) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Definición de métrica"
            className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-foreground/20 text-muted-foreground transition-colors hover:border-[var(--gold)]/50 hover:text-[var(--gold)]"
          >
            <Info className="h-2.5 w-2.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs text-xs leading-relaxed border-border/60"
        >
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function TrendBadge({
  trend,
  trendUp,
  positive,
}: {
  trend: string;
  trendUp: boolean;
  positive: boolean;
}) {
  const good = positive;
  const Icon = trendUp ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-mono",
        good
          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
          : "border-destructive/40 bg-destructive/10 text-destructive"
      )}
    >
      <Icon className="h-3 w-3" />
      {trend}
    </span>
  );
}

function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-amber-300">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      demo
    </span>
  );
}

function MiniBadge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "gold" | "teal";
}) {
  const tones: Record<string, string> = {
    default: "border-foreground/15 bg-foreground/5 text-muted-foreground",
    gold: "border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
    teal: "border-[var(--teal)]/30 bg-[var(--teal)]/10 text-[var(--teal)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

/* =====================================================================
 * KPI strip
 * ===================================================================== */

function KpiCard({ kpi, index }: { kpi: Kpi; index: number }) {
  const reduce = useReducedMotion();
  const Icon = kpi.icon;
  const accentColor =
    kpi.accent === "gold" ? "var(--gold)" : "var(--teal)";
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4), ease: "easeOut" }}
      className="rp-glass rounded-xl p-4 transition-colors hover:border-foreground/15"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span
            className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
            style={{ color: accentColor }}
          >
            <Icon className="inline h-3 w-3 mr-1" />
            {kpi.label}
          </span>
        </div>
        <InfoDot text={kpi.definition} />
      </div>
      <div className="mt-3 font-display text-2xl sm:text-3xl font-light text-foreground">
        {kpi.value}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <TrendBadge trend={kpi.trend} trendUp={kpi.trendUp} positive={kpi.positive} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <MiniBadge>{kpi.source}</MiniBadge>
        <MiniBadge tone={kpi.accent}>{kpi.period}</MiniBadge>
      </div>
    </motion.div>
  );
}

function KpiStrip() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {KPIS.map((kpi, i) => (
        <KpiCard key={kpi.id} kpi={kpi} index={i} />
      ))}
    </div>
  );
}

/* =====================================================================
 * Campaign ROI chart (SVG bars)
 * ===================================================================== */

function CampaignRoiChart() {
  const reduce = useReducedMotion();
  const width = 720;
  const height = 280;
  const padL = 40;
  const padR = 16;
  const padT = 32;
  const padB = 56;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const maxV = Math.max(...CAMPAIGNS.map((c) => Math.max(c.revenue, c.cost))) * 1.1;
  const groupW = innerW / CAMPAIGNS.length;
  const barW = Math.min(18, groupW / 3.4);

  const yTicks = [0, 500, 1000, 1500, 2000];
  return (
    <div className="rp-glass rounded-2xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-display text-lg font-medium">ROI por campaña</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ingresos vs coste por campaña · 6 campañas activas
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--gold)" }} />
            <span className="text-muted-foreground">Ingresos</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "#ef4444" }} />
            <span className="text-muted-foreground">Coste</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--teal)" }} />
            <span className="text-muted-foreground">ROI</span>
          </span>
        </div>
      </div>
      <div className="overflow-x-auto rp-scroll-thin -mx-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[640px]"
          role="img"
          aria-label="Gráfico de barras de ROI por campaña"
        >
          {/* y grid */}
          {yTicks.map((t, i) => {
            const y = padT + innerH - (t / maxV) * innerH;
            return (
              <g key={i}>
                <line
                  x1={padL}
                  x2={width - padR}
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
                  €{t}
                </text>
              </g>
            );
          })}
          {/* bars */}
          {CAMPAIGNS.map((c, i) => {
            const x0 = padL + i * groupW + (groupW - barW * 2 - 6) / 2;
            const revenueH = (c.revenue / maxV) * innerH;
            const costH = (c.cost / maxV) * innerH;
            const revenueY = padT + innerH - revenueH;
            const costY = padT + innerH - costH;
            const roi = c.cost === 0 ? Infinity : Math.round(((c.revenue - c.cost) / c.cost) * 100);
            const roiLabel = c.cost === 0 ? "∞" : `${roi}%`;
            return (
              <g key={c.id}>
                <motion.rect
                  x={x0}
                  y={reduce ? revenueY : padT + innerH}
                  width={barW}
                  height={reduce ? revenueH : 0}
                  fill="var(--gold)"
                  rx={2}
                  initial={false}
                  animate={
                    reduce
                      ? {}
                      : { y: revenueY, height: revenueH }
                  }
                  transition={{ duration: 0.6, delay: i * 0.06, ease: "easeOut" }}
                />
                <motion.rect
                  x={x0 + barW + 6}
                  y={reduce ? costY : padT + innerH}
                  width={barW}
                  height={reduce ? costH : 0}
                  fill="#ef4444"
                  rx={2}
                  initial={false}
                  animate={reduce ? {} : { y: costY, height: costH }}
                  transition={{ duration: 0.6, delay: i * 0.06 + 0.1, ease: "easeOut" }}
                />
                {/* ROI label on top */}
                <motion.text
                  x={x0 + barW + 3}
                  y={revenueY - 6}
                  textAnchor="middle"
                  className="fill-[var(--teal)] font-mono"
                  fontSize="10"
                  fontWeight="600"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.06 + 0.5 }}
                >
                  {roiLabel}
                </motion.text>
                {/* x label */}
                <text
                  x={x0 + barW + 3}
                  y={padT + innerH + 16}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  fontSize="9.5"
                >
                  {c.name.length > 16 ? c.name.slice(0, 15) + "…" : c.name}
                </text>
                <text
                  x={x0 + barW + 3}
                  y={padT + innerH + 28}
                  textAnchor="middle"
                  className="fill-foreground/50 font-mono"
                  fontSize="8.5"
                >
                  {fmtEUR(c.revenue)} · {fmtEUR(c.cost)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/* =====================================================================
 * AI Marketing Insights panel
 * ===================================================================== */

const CATEGORY_META: Record<
  AIInsight["category"],
  { label: string; icon: React.ElementType; tone: "gold" | "teal" }
> = {
  ocupacion: { label: "Ocupación", icon: Activity, tone: "gold" },
  best_campaign: { label: "Mejor campaña", icon: Target, tone: "gold" },
  vip: { label: "VIP", icon: Users, tone: "teal" },
  channel: { label: "Canal", icon: Share2, tone: "teal" },
  upsell: { label: "Upsell", icon: TrendingUp, tone: "gold" },
};

function AIInsightsPanel() {
  const reduce = useReducedMotion();
  const [active, setActive] = React.useState<Set<string>>(new Set());
  const [rejected, setRejected] = React.useState<Set<string>>(new Set());

  const visible = AI_INSIGHTS.filter((i) => !rejected.has(i.id));
  const activeCount = visible.length;

  function accept(id: string) {
    setActive((s) => new Set(s).add(id));
    toast({
      title: "Campaña creada",
      description: "La IA ha preparado el borrador de campaña. Revisa y programa.",
    });
  }
  function reject(id: string) {
    setRejected((s) => new Set(s).add(id));
    toast({ title: "Recomendación descartada", description: "La IA registrará el feedback." });
  }

  return (
    <div className="rp-glass rp-glow-teal rounded-2xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--teal)]/12 border border-[var(--teal)]/40">
            <Sparkles className="h-4.5 w-4.5 text-[var(--teal)]" />
          </span>
          <div>
            <h3 className="font-display text-lg font-medium">IA Marketing</h3>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              Modelo: glm-4-flash · {activeCount} recomendaciones activas
            </p>
          </div>
        </div>
        <MiniBadge tone="teal">Autoanalítica</MiniBadge>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {visible.map((ins, i) => {
            const meta = CATEGORY_META[ins.category];
            const Icon = meta.icon;
            const isActive = active.has(ins.id);
            return (
              <motion.div
                key={ins.id}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.2) }}
                className={cn(
                  "rounded-xl border p-4 transition-colors",
                  isActive
                    ? "border-emerald-400/40 bg-emerald-400/[0.06]"
                    : "border-foreground/10 bg-foreground/[0.025] hover:border-[var(--teal)]/30"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span
                      className={cn(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
                        meta.tone === "gold"
                          ? "border-[var(--gold)]/35 bg-[var(--gold)]/10 text-[var(--gold-soft)]"
                          : "border-[var(--teal)]/35 bg-[var(--teal)]/10 text-[var(--teal)]"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <MiniBadge tone={meta.tone}>{meta.label}</MiniBadge>
                        {ins.impact && (
                          <MiniBadge tone="gold">Impacto {ins.impact}</MiniBadge>
                        )}
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono",
                            confidenceRing(ins.confidence)
                          )}
                        >
                          <span className={confidenceColor(ins.confidence)}>●</span>
                          <span className={confidenceColor(ins.confidence)}>
                            Confianza {ins.confidence}%
                          </span>
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/90">{ins.text}</p>
                    </div>
                  </div>
                </div>
                {isActive ? (
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-300">
                    <Check className="h-3.5 w-3.5" />
                    Campaña creada · revisa el borrador en Campaigns Builder
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => accept(ins.id)}
                      className="h-8 bg-[var(--gold)] text-[var(--primary-foreground)] hover:bg-[var(--gold-deep)]"
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1" />
                      Crear campaña
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => reject(ins.id)}
                      className="h-8 border-foreground/15 hover:text-destructive hover:border-destructive/40"
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Rechazar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-muted-foreground hover:text-foreground"
                    >
                      Ver detalle
                      <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                    </Button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {visible.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No hay recomendaciones activas. La IA analizará nuevos datos pronto.
          </div>
        )}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-foreground/10 bg-foreground/[0.02] p-3">
        <Info className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          La IA analiza datos históricos y actuales. No garantiza resultados. El humano decide.
        </p>
      </div>
    </div>
  );
}

/* =====================================================================
 * Channel performance table
 * ===================================================================== */

function ChannelTable() {
  return (
    <div className="rp-glass rounded-2xl p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-medium">Rendimiento por canal</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Envíos, apertura, CTR, conversiones, ROI · últimos 30 días
          </p>
        </div>
        <MiniBadge>5 canales</MiniBadge>
      </div>
      <div className="overflow-x-auto rp-scroll-thin">
        <table className="w-full border-collapse text-sm min-w-[760px]">
          <thead>
            <tr className="border-b border-border/60 text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              <th className="px-3 py-2.5">Canal</th>
              <th className="px-3 py-2.5 text-right">Enviados</th>
              <th className="px-3 py-2.5 text-right">Apertura</th>
              <th className="px-3 py-2.5 text-right">CTR</th>
              <th className="px-3 py-2.5 text-right">Conv.</th>
              <th className="px-3 py-2.5 text-right">Ingresos</th>
              <th className="px-3 py-2.5 text-right">Coste</th>
              <th className="px-3 py-2.5 text-right">ROI</th>
            </tr>
          </thead>
          <tbody>
            {CHANNELS.map((c) => {
              const Icon = c.icon;
              const openPct = ((c.opened / c.sent) * 100).toFixed(0);
              return (
                <tr
                  key={c.id}
                  className="border-b border-border/40 last:border-0 transition-colors hover:bg-foreground/[0.025]"
                >
                  <td className="px-3 py-2.5 font-medium">
                    <span className="inline-flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground/5 text-muted-foreground">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      {c.name}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-foreground/80">{c.sent.toLocaleString("es-ES")}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-foreground/80">{c.opened.toLocaleString("es-ES")} ({openPct}%)</td>
                  <td className="px-3 py-2.5 text-right font-mono text-foreground/80">{c.ctr}%</td>
                  <td className="px-3 py-2.5 text-right font-mono text-foreground/80">{c.conversions}</td>
                  <td className="px-3 py-2.5 text-right font-mono rp-gold-text">{fmtEUR(c.revenue)}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-destructive/80">{fmtEUR(c.cost)}</td>
                  <td className="px-3 py-2.5 text-right font-mono rp-teal-text">{c.roi}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =====================================================================
 * Segment performance table
 * ===================================================================== */

function SegmentTable() {
  return (
    <div className="rp-glass rounded-2xl p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-medium">Rendimiento por segmento</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tamaño, campañas, conversiones, ingresos, ticket medio
          </p>
        </div>
        <MiniBadge>5 segmentos</MiniBadge>
      </div>
      <div className="overflow-x-auto rp-scroll-thin">
        <table className="w-full border-collapse text-sm min-w-[680px]">
          <thead>
            <tr className="border-b border-border/60 text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              <th className="px-3 py-2.5">Segmento</th>
              <th className="px-3 py-2.5 text-right">Tamaño</th>
              <th className="px-3 py-2.5 text-right">Camp.</th>
              <th className="px-3 py-2.5 text-right">Conv.</th>
              <th className="px-3 py-2.5 text-right">Ingresos</th>
              <th className="px-3 py-2.5 text-right">Ticket medio</th>
            </tr>
          </thead>
          <tbody>
            {SEGMENTS.map((s) => (
              <tr
                key={s.id}
                className="border-b border-border/40 last:border-0 transition-colors hover:bg-foreground/[0.025]"
              >
                <td className="px-3 py-2.5 font-medium">{s.name}</td>
                <td className="px-3 py-2.5 text-right font-mono text-foreground/80">{s.size}</td>
                <td className="px-3 py-2.5 text-right font-mono text-foreground/80">{s.campaigns}</td>
                <td className="px-3 py-2.5 text-right font-mono text-foreground/80">{s.conversions}</td>
                <td className="px-3 py-2.5 text-right font-mono rp-gold-text">{fmtEUR(s.revenue)}</td>
                <td className="px-3 py-2.5 text-right font-mono rp-teal-text">€{s.avgTicket}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =====================================================================
 * Funnel visualization
 * ===================================================================== */

function FunnelChart() {
  const reduce = useReducedMotion();
  const width = 720;
  const height = 280;
  const padT = 16;
  const padB = 36;
  const innerH = height - padT - padB;
  const maxV = FUNNEL[0].value;
  const stageW = width / FUNNEL.length;

  return (
    <div className="rp-glass rounded-2xl p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-medium">Embudo de conversión</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visitantes → Leads → Reservas → Asistencias → Recurrentes → VIP
          </p>
        </div>
        <MiniBadge tone="gold">6 etapas</MiniBadge>
      </div>
      <div className="overflow-x-auto rp-scroll-thin -mx-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[640px]"
          role="img"
          aria-label="Embudo de conversión de marketing"
        >
          {FUNNEL.map((stage, i) => {
            const ratio = stage.value / maxV;
            const w = stageW * 0.86 * ratio + stageW * 0.08;
            const x = i * stageW + (stageW - w) / 2;
            const h = innerH * 0.72;
            const y = padT + (innerH - h) / 2;
            const prevValue = i > 0 ? FUNNEL[i - 1].value : null;
            const conv = prevValue ? ((stage.value / prevValue) * 100).toFixed(1) : null;
            return (
              <g key={stage.id}>
                {conv && (
                  <motion.g
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.08 + 0.3, duration: 0.3 }}
                  >
                    <line
                      x1={i * stageW - 4}
                      x2={i * stageW + 4}
                      y1={y + h / 2}
                      y2={y + h / 2}
                      stroke="var(--teal)"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={i * stageW}
                      y={y + h / 2 - 8}
                      textAnchor="middle"
                      className="fill-[var(--teal)] font-mono"
                      fontSize="10"
                      fontWeight="600"
                    >
                      {conv}%
                    </text>
                  </motion.g>
                )}
                <motion.rect
                  x={x}
                  y={reduce ? y : y + h}
                  width={w}
                  height={reduce ? h : 0}
                  rx={6}
                  fill={stage.color}
                  opacity={0.92}
                  initial={false}
                  animate={reduce ? {} : { y, height: h }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                />
                <text
                  x={i * stageW + stageW / 2}
                  y={y + h / 2 - 4}
                  textAnchor="middle"
                  className="fill-background font-display"
                  fontSize="13"
                  fontWeight="600"
                >
                  {stage.value.toLocaleString("es-ES")}
                </text>
                <text
                  x={i * stageW + stageW / 2}
                  y={y + h / 2 + 12}
                  textAnchor="middle"
                  className="fill-background/80 font-mono"
                  fontSize="9"
                >
                  {stage.label}
                </text>
              </g>
            );
          })}
          {/* baseline */}
          <line
            x1={0}
            x2={width}
            y1={height - padB + 8}
            y2={height - padB + 8}
            stroke="currentColor"
            className="text-foreground/8"
          />
        </svg>
      </div>
    </div>
  );
}

/* =====================================================================
 * AI Chat (mini)
 * ===================================================================== */

function AIChat() {
  const reduce = useReducedMotion();
  const [turns, setTurns] = React.useState<ChatTurn[]>([]);
  const [input, setInput] = React.useState("");
  const [thinking, setThinking] = React.useState(false);
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
  }, [turns, thinking, reduce]);

  function ask(question: string) {
    if (!question.trim()) return;
    const userTurn: ChatTurn = { id: `u-${Date.now()}`, role: "user", text: question };
    setTurns((t) => [...t, userTurn]);
    setInput("");
    setThinking(true);

    setTimeout(() => {
      const match =
        AI_RESPONSES[question] ||
        Object.values(AI_RESPONSES).find((r) =>
          question.toLowerCase().includes(question.toLowerCase().split(" ")[0])
        );
      const r = match || AI_RESPONSES["¿Qué campaña generó más ingresos?"];
      const aiTurn: ChatTurn = {
        id: `a-${Date.now()}`,
        role: "ai",
        text: r.text,
        data: r.data,
        action: r.action,
        confidence: r.confidence,
        source: r.source,
      };
      setTurns((t) => [...t, aiTurn]);
      setThinking(false);
    }, 850);
  }

  return (
    <div className="rp-glass rounded-2xl p-5 sm:p-6 flex flex-col">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--teal)]/12 border border-[var(--teal)]/40">
            <Sparkles className="h-4 w-4 text-[var(--teal)]" />
          </span>
          <div>
            <h3 className="font-display text-lg font-medium">Habla con tu marketing</h3>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              glm-4-flash · contexto en vivo
            </p>
          </div>
        </div>
        <MiniBadge tone="teal">IA</MiniBadge>
      </div>

      <div className="flex-1 min-h-[220px] max-h-[360px] overflow-y-auto rp-scroll-thin rounded-xl border border-foreground/10 bg-foreground/[0.02] p-3 mb-3">
        {turns.length === 0 && !thinking && (
          <div className="h-full flex flex-col items-center justify-center text-center text-sm text-muted-foreground py-8">
            <Sparkles className="h-6 w-6 mb-2 text-[var(--teal)]/60" />
            Pregúntale a la IA sobre tu marketing…
          </div>
        )}
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {turns.map((t) => (
              <motion.div
                key={t.id}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex",
                  t.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
                    t.role === "user"
                      ? "bg-[var(--gold)]/15 border border-[var(--gold)]/30 text-foreground"
                      : "bg-foreground/[0.04] border border-foreground/10 text-foreground"
                  )}
                >
                  {t.role === "ai" && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Sparkles className="h-3 w-3 text-[var(--teal)]" />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]">
                        IA Marketing
                      </span>
                    </div>
                  )}
                  <p>{t.text}</p>
                  {t.role === "ai" && t.data && (
                    <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                      {t.data.map((d, i) => (
                        <div
                          key={i}
                          className="rounded-md border border-foreground/10 bg-foreground/[0.03] px-2 py-1.5"
                        >
                          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                            {d.label}
                          </div>
                          <div className="text-xs font-medium mt-0.5">{d.value}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {t.role === "ai" && t.action && (
                    <div className="mt-2.5 flex items-start gap-1.5 rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/[0.06] px-2.5 py-1.5">
                      <ArrowRight className="h-3 w-3 mt-0.5 text-[var(--gold)] shrink-0" />
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)]">
                          Acción recomendada
                        </div>
                        <div className="text-xs mt-0.5">{t.action}</div>
                      </div>
                    </div>
                  )}
                  {t.role === "ai" && t.confidence != null && (
                    <div className="mt-2 flex items-center gap-2 text-[10px] font-mono">
                      <span className={cn("inline-flex items-center gap-1", confidenceColor(t.confidence))}>
                        ● Confianza {t.confidence}%
                      </span>
                      {t.source && (
                        <span className="text-muted-foreground">· {t.source}</span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {thinking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="rounded-xl bg-foreground/[0.04] border border-foreground/10 px-3.5 py-2.5">
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-[var(--teal)]"
                        animate={reduce ? {} : { opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div ref={endRef} />
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {CHAT_SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => ask(s)}
            className="inline-flex items-center rounded-full border border-foreground/15 bg-foreground/[0.03] px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-[var(--teal)]/40 hover:text-[var(--teal)] min-h-[28px]"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="flex items-center gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregúntale a la IA sobre tu marketing…"
          className="h-10 bg-foreground/[0.03] border-foreground/15"
          aria-label="Pregunta a la IA"
        />
        <Button
          type="submit"
          size="icon"
          className="h-10 w-10 bg-[var(--teal)] text-background hover:bg-[var(--teal-deep)] shrink-0"
          aria-label="Enviar pregunta"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

/* =====================================================================
 * Main component
 * ===================================================================== */

export function GrowthAnalytics() {
  const reduce = useReducedMotion();
  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <motion.header
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-display text-2xl sm:text-3xl font-light tracking-tight">
              Growth Analytics
            </h2>
            <DemoBadge />
            <MiniBadge tone="teal">
              <Sparkles className="h-3 w-3" />
              IA Marketing
            </MiniBadge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            ROI, conversiones, insights y predicciones para tu marketing.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <MiniBadge>Últimos 30 días</MiniBadge>
          <MiniBadge tone="gold">8 KPIs</MiniBadge>
        </div>
      </motion.header>

      {/* KPI strip */}
      <KpiStrip />

      {/* Chart + AI insights */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CampaignRoiChart />
        <AIInsightsPanel />
      </div>

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChannelTable />
        <SegmentTable />
      </div>

      {/* Funnel + Chat */}
      <div className="grid gap-6 lg:grid-cols-2">
        <FunnelChart />
        <AIChat />
      </div>
    </div>
  );
}

export default GrowthAnalytics;
