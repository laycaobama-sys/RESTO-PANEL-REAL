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
  Brain,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Clock,
  CalendarClock,
  Cpu,
  Wallet,
  Heart,
  Coins,
  MessageSquare,
  Repeat,
  XCircle,
  UserX,
  Star,
  ShieldCheck,
  ShieldAlert,
  Crown,
  Flame,
  Award,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type DataQuality = "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT";

interface ScoreFactor {
  variable: string;
  impact: string;
  detail: string;
}

interface Score {
  name: string;
  label: string;
  value: number;
  confidence: number;
  level: "alto" | "medio" | "bajo";
  dataQuality: DataQuality;
  factors: ScoreFactor[];
  modelVersion: string;
  calculatedAt: string;
  expiresAt: string;
  formula: string;
  limitations?: string;
  /** When true, a LOWER value is better (risk scores). Inverts color semantics. */
  isRisk?: boolean;
}

interface LtvBreakdown {
  type: "historical" | "estimated";
  value: number; // cents
  currency: string;
  method: string;
  confidence: number;
  horizon?: string;
  components: { label: string; value: string }[];
  calculatedAt: string;
  disclaimer: string;
}

interface Classification {
  label: string;
  rule: string;
  evaluatedAt: string; // ISO date
  tone: "gold" | "teal" | "emerald";
  icon: React.ElementType;
}

interface DemoCustomer {
  id: string;
  name: string;
  email: string;
  tier: string;
  visits: number;
  lastVisit: string;
  joinedAt: string;
  scores: Score[];
  ltv: LtvBreakdown[];
  classifications: Classification[];
}

/* =========================================================
 * Meta — data quality, levels, score icons
 * =======================================================*/
const DQ_META: Record<
  DataQuality,
  { label: string; short: string; className: string; dot: string; tooltip: string }
> = {
  HIGH: {
    label: "Datos: Alta",
    short: "HIGH",
    className: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
    dot: "bg-emerald-400",
    tooltip:
      "Histórico suficiente del cliente, contexto operativo y consentimiento confirmado. Score calculado con modelo ML.",
  },
  MEDIUM: {
    label: "Datos: Media",
    short: "MED",
    className: "bg-[var(--gold)]/10 text-[var(--gold-soft)] border-[var(--gold)]/30",
    dot: "bg-[var(--gold)]",
    tooltip:
      "Histórico parcial o faltan señales contextuales. Score con sesgo moderado, partly heuristic.",
  },
  LOW: {
    label: "Datos: Baja",
    short: "LOW",
    className: "bg-amber-400/10 text-amber-300 border-amber-400/30",
    dot: "bg-amber-400",
    tooltip:
      "Histórico limitado: cliente nuevo o sin señales suficientes. Score basado mayoritariamente en reglas deterministas.",
  },
  INSUFFICIENT: {
    label: "Datos: Insuficientes",
    short: "N/A",
    className: "bg-destructive/10 text-destructive border-destructive/30",
    dot: "bg-destructive",
    tooltip:
      "No se puede ejecutar el modelo ML. Score no calculado. Se requieren más datos o consentimiento explícito.",
  },
};

const LEVEL_META: Record<
  Score["level"],
  { label: string; className: string }
> = {
  alto: {
    label: "Alto",
    className:
      "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  },
  medio: {
    label: "Medio",
    className: "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
  },
  bajo: {
    label: "Bajo",
    className: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  },
};

const SCORE_ICON: Record<string, React.ElementType> = {
  LoyaltyScore: Heart,
  RevenueScore: Coins,
  EngagementScore: MessageSquare,
  RetentionScore: Repeat,
  CancellationRiskScore: XCircle,
  NoShowRiskScore: UserX,
  UpsellPotentialScore: TrendingUp,
  ReviewLikelihoodScore: Star,
};

/* =========================================================
 * Helpers
 * =======================================================*/
/** Returns color class for the BIG value, taking into account risk inversion.
 *  - Risk scores: lower value = better (green); ≥60 = critical (red).
 *  - Opportunity scores: higher = better (green); <50 = amber.
 */
function valueToneClass(score: Score): string {
  if (score.dataQuality === "INSUFFICIENT") return "text-muted-foreground";
  const v = score.value;
  if (score.isRisk) {
    if (v >= 60) return "text-destructive"; // critical risk
    if (v <= 25) return "text-emerald-300"; // low risk = good
    if (v <= 60) return "rp-gold-text"; // medium risk
    return "text-amber-300";
  }
  if (v >= 75) return "text-emerald-300";
  if (v >= 50) return "rp-gold-text";
  return "text-amber-300";
}

function confidenceTone(c: number): "emerald" | "gold" | "amber" {
  if (c >= 75) return "emerald";
  if (c >= 50) return "gold";
  return "amber";
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "hace instantes";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}

function formatExpires(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "expirado";
  const h = Math.floor(diff / 3600000);
  if (h < 1) {
    const min = Math.floor(diff / 60000);
    return `expira en ${min} min`;
  }
  if (h < 24) return `expira en ${h} h`;
  const d = Math.floor(h / 24);
  return `expira en ${d} d`;
}

function formatCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =========================================================
 * Demo data — 3 customers with different profiles
 * =======================================================*/
const now = Date.now();
const minutes = (m: number) => new Date(now - m * 60 * 1000).toISOString();
const hours = (h: number) => new Date(now - h * 60 * 60 * 1000).toISOString();
const daysAhead = (d: number) => new Date(now + d * 24 * 60 * 60 * 1000).toISOString();
const daysAgo = (d: number) => new Date(now - d * 24 * 60 * 60 * 1000).toISOString();

const SCORES_ELENA: Score[] = [
  {
    name: "LoyaltyScore",
    label: "Fidelidad",
    value: 89,
    confidence: 82,
    level: "alto",
    dataQuality: "HIGH",
    factors: [
      {
        variable: "Visitas 90d",
        impact: "+28 pts · impacto alto",
        detail: "6 visitas en 90d — frecuencia semanal estable, superior al percentil 80 del segmento.",
      },
      {
        variable: "Ticket vs media",
        impact: "+12 pts · impacto medio",
        detail: "Ticket superior a la media del segmento en +15%.",
      },
      {
        variable: "Recencia",
        impact: "+9 pts · impacto medio",
        detail: "Última visita hace 18d — dentro del ciclo esperado de fidelidad.",
      },
      {
        variable: "Interacción con campañas",
        impact: "+6 pts · impacto bajo",
        detail: "Interacción con campañas reciente (últimos 14d).",
      },
    ],
    modelVersion: "loyalty-xgb-v2.3",
    calculatedAt: minutes(8),
    expiresAt: daysAhead(7),
    formula: "visitas_90d × ticket_medio / frecuencia_esperada",
    limitations:
      "El modelo asume estabilidad estacional. En periodos festivos el score puede subestimar la fidelidad real.",
  },
  {
    name: "RevenueScore",
    label: "Rentabilidad",
    value: 76,
    confidence: 78,
    level: "alto",
    dataQuality: "HIGH",
    factors: [
      {
        variable: "LTV histórico",
        impact: "+24 pts · impacto alto",
        detail: "LTV €2.840 — superior al percentil 75 del segmento Oro.",
      },
      {
        variable: "Ticket medio",
        impact: "+14 pts · impacto medio",
        detail: "Ticket medio €42 (+15% vs media del segmento).",
      },
      {
        variable: "Margen estimado",
        impact: "+8 pts · impacto medio",
        detail: "Margen estimado 68% — platos de alta rentabilidad predominantes.",
      },
      {
        variable: "Upsell ratio",
        impact: "+5 pts · impacto bajo",
        detail: "Upsell en 3 de 15 visitas (20% — por encima del 12% medio).",
      },
    ],
    modelVersion: "revenue-prophet-v1.7",
    calculatedAt: minutes(12),
    expiresAt: daysAhead(7),
    formula: "(ltv − coste_adquisicion) / antiguedad_meses × margen",
    limitations: "El margen se estima por categoría de plato; puede variar ±5% con inventario real.",
  },
  {
    name: "EngagementScore",
    label: "Interacción",
    value: 84,
    confidence: 80,
    level: "alto",
    dataQuality: "HIGH",
    factors: [
      {
        variable: "Apertura emails",
        impact: "+30 pts · impacto alto",
        detail: "85% apertura emails — 3.2× la media del segmento.",
      },
      {
        variable: "Conversiones de campaña",
        impact: "+18 pts · impacto medio",
        detail: "3 campañas convertidas en últimos 90d.",
      },
      {
        variable: "Reviews",
        impact: "+10 pts · impacto bajo",
        detail: "2 reviews positivas (5★ y 4★) en últimos 6 meses.",
      },
      {
        variable: "WhatsApp",
        impact: "+9 pts · impacto bajo",
        detail: "WhatsApp respondido en 12min promedio.",
      },
    ],
    modelVersion: "engagement-rf-v1.2",
    calculatedAt: minutes(5),
    expiresAt: daysAhead(14),
    formula: "apertura_emails × 0.4 + clicks × 0.3 + respuestas × 0.3",
  },
  {
    name: "RetentionScore",
    label: "Retención",
    value: 89,
    confidence: 82,
    level: "alto",
    dataQuality: "HIGH",
    factors: [
      {
        variable: "Visitas completadas 90d",
        impact: "+32 pts · impacto alto",
        detail: "6 visitas completadas en 90d — 0 cancelaciones.",
      },
      {
        variable: "Ticket medio",
        impact: "+10 pts · impacto medio",
        detail: "Ticket medio superior a la media del segmento.",
      },
      {
        variable: "Recencia",
        impact: "+8 pts · impacto medio",
        detail: "Última visita hace 18d — dentro del ciclo de retención esperado.",
      },
      {
        variable: "Interacción reciente",
        impact: "+6 pts · impacto bajo",
        detail: "Interacción reciente con campañas y WhatsApp.",
      },
    ],
    modelVersion: "retention-xgb-v2.1",
    calculatedAt: minutes(9),
    expiresAt: daysAhead(3),
    formula: "visitas_completadas / visitas_esperadas_90d × 100",
    limitations:
      "Modelo entrenado con datos de 12 meses. Para clientes con <3 meses de histórico, el score es aproximado.",
  },
  {
    name: "CancellationRiskScore",
    label: "Riesgo cancelación",
    value: 12,
    confidence: 75,
    level: "bajo",
    dataQuality: "MEDIUM",
    isRisk: true,
    factors: [
      {
        variable: "Cancelaciones 90d",
        impact: "−40 pts · riesgo bajo",
        detail: "0 cancelaciones en 90d — patrón estable.",
      },
      {
        variable: "Frecuencia",
        impact: "−12 pts · riesgo bajo",
        detail: "Frecuencia estable sin caída estacional.",
      },
      {
        variable: "Quejas recientes",
        impact: "−8 pts · riesgo bajo",
        detail: "Sin quejas recientes registradas.",
      },
      {
        variable: "Confirmación",
        impact: "−5 pts · riesgo bajo",
        detail: "Confirmación rápida de reservas (mediana 4 min).",
      },
    ],
    modelVersion: "cancel-xgb-v1.4",
    calculatedAt: minutes(15),
    expiresAt: daysAhead(3),
    formula: "cancelaciones_90d / reservas_90d × 100",
    limitations:
      "Valor bajo = bajo riesgo. El modelo no captura eventos excepcionales (cambio de trabajo, mudanza) que requieren juicio humano.",
  },
  {
    name: "NoShowRiskScore",
    label: "Riesgo no-show",
    value: 8,
    confidence: 70,
    level: "bajo",
    dataQuality: "MEDIUM",
    isRisk: true,
    factors: [
      {
        variable: "No-shows históricos",
        impact: "−45 pts · riesgo bajo",
        detail: "0 no-shows históricos en 15 reservas.",
      },
      {
        variable: "Canal confirmación",
        impact: "−10 pts · riesgo bajo",
        detail: "Confirmación por WhatsApp en todas las reservas.",
      },
      {
        variable: "Recurrencia",
        impact: "−8 pts · riesgo bajo",
        detail: "Cliente recurrente con patrón de asistencia verificado.",
      },
      {
        variable: "Depósito",
        impact: "−5 pts · riesgo bajo",
        detail: "Depósito activo en reservas de fin de semana.",
      },
    ],
    modelVersion: "noshow-xgb-v1.1",
    calculatedAt: minutes(15),
    expiresAt: daysAhead(3),
    formula: "no_shows_historicos / reservas_historicas × 100",
    limitations: "Valor bajo = bajo riesgo. El riesgo sube en festivos y grupos grandes — revisar contexto.",
  },
  {
    name: "UpsellPotentialScore",
    label: "Potencial upsell",
    value: 72,
    confidence: 65,
    level: "medio",
    dataQuality: "MEDIUM",
    factors: [
      {
        variable: "Sugerencias de vino",
        impact: "+22 pts · impacto alto",
        detail: "Acepta sugerencias de vino en 60% de las visitas.",
      },
      {
        variable: "Postres",
        impact: "+14 pts · impacto medio",
        detail: "Pide postres en 60% de visitas — upsell receptivo.",
      },
      {
        variable: "Perfil VIP",
        impact: "+10 pts · impacto medio",
        detail: "VIP receptive a experiencias premium (degustación, maridaje).",
      },
      {
        variable: "Tendencia ticket",
        impact: "+8 pts · impacto bajo",
        detail: "Ticket creciente en últimos 3 meses (+8%).",
      },
    ],
    modelVersion: "upsell-xgb-v0.9",
    calculatedAt: minutes(20),
    expiresAt: daysAhead(7),
    formula: "upsell_aceptado / upsell_ofrecido × 100",
    limitations:
      "Requiere oferta contextual adecuada. El score no garantiza conversión — debe combinarse con inventario y margen disponibles.",
  },
  {
    name: "ReviewLikelihoodScore",
    label: "Probabilidad review",
    value: 68,
    confidence: 60,
    level: "medio",
    dataQuality: "LOW",
    factors: [
      {
        variable: "Reviews previas",
        impact: "+18 pts · impacto medio",
        detail: "2 reviews previas (1 Google, 1 TripAdvisor).",
      },
      {
        variable: "Satisfacción",
        impact: "+15 pts · impacto medio",
        detail: "Satisfacción alta (NPS 9) — predictor fuerte de review positivo.",
      },
      {
        variable: "Encuestas",
        impact: "+10 pts · impacto bajo",
        detail: "Suele responder encuestas post-cuenta (80%).",
      },
      {
        variable: "Canal preferido",
        impact: "+5 pts · impacto bajo",
        detail: "Canal: Google — coincidente con reviews previas.",
      },
    ],
    modelVersion: "review-rf-v0.8",
    calculatedAt: hours(2),
    expiresAt: daysAhead(5),
    formula: "reviews_previas × 0.4 + (nps − 5) / 5 × 0.4 + encuestas × 0.2",
    limitations:
      "Confianza baja por datos limitados. La probabilidad real depende de la experiencia de la próxima visita y de la invitación activa a review.",
  },
];

const SCORES_VIP: Score[] = [
  {
    name: "LoyaltyScore",
    label: "Fidelidad",
    value: 96,
    confidence: 91,
    level: "alto",
    dataQuality: "HIGH",
    factors: [
      { variable: "Visitas 90d", impact: "+38 pts · impacto alto", detail: "12 visitas en 90d — patrón semanal consolidado." },
      { variable: "Ticket vs media", impact: "+18 pts · impacto alto", detail: "Ticket €98 — 2.3× la media del segmento." },
      { variable: "Recencia", impact: "+12 pts · impacto medio", detail: "Última visita hace 2d — VIP activo." },
      { variable: "Campañas", impact: "+8 pts · impacto bajo", detail: "Conversión 4 de 5 campañas VIP." },
    ],
    modelVersion: "loyalty-xgb-v2.3",
    calculatedAt: minutes(4),
    expiresAt: daysAhead(7),
    formula: "visitas_90d × ticket_medio / frecuencia_esperada",
  },
  {
    name: "RevenueScore",
    label: "Rentabilidad",
    value: 94,
    confidence: 89,
    level: "alto",
    dataQuality: "HIGH",
    factors: [
      { variable: "LTV histórico", impact: "+34 pts · impacto alto", detail: "LTV €8.450 — top 5% del restaurante." },
      { variable: "Ticket medio", impact: "+20 pts · impacto alto", detail: "Ticket medio €98 (+240% vs media)." },
      { variable: "Margen estimado", impact: "+12 pts · impacto medio", detail: "Margen estimado 72% — degustaciones premium." },
      { variable: "Upsell ratio", impact: "+8 pts · impacto bajo", detail: "Upsell en 9 de 12 visitas (75%)." },
    ],
    modelVersion: "revenue-prophet-v1.7",
    calculatedAt: minutes(4),
    expiresAt: daysAhead(7),
    formula: "(ltv − coste_adquisicion) / antiguedad_meses × margen",
  },
  {
    name: "EngagementScore",
    label: "Interacción",
    value: 92,
    confidence: 88,
    level: "alto",
    dataQuality: "HIGH",
    factors: [
      { variable: "Apertura emails", impact: "+32 pts · impacto alto", detail: "98% apertura emails." },
      { variable: "Conversiones", impact: "+22 pts · impacto medio", detail: "5 campañas convertidas en 90d." },
      { variable: "Reviews", impact: "+14 pts · impacto bajo", detail: "6 reviews positivas en 12 meses." },
      { variable: "WhatsApp", impact: "+10 pts · impacto bajo", detail: "WhatsApp respondido en 4min promedio." },
    ],
    modelVersion: "engagement-rf-v1.2",
    calculatedAt: minutes(3),
    expiresAt: daysAhead(14),
    formula: "apertura_emails × 0.4 + clicks × 0.3 + respuestas × 0.3",
  },
  {
    name: "RetentionScore",
    label: "Retención",
    value: 95,
    confidence: 90,
    level: "alto",
    dataQuality: "HIGH",
    factors: [
      { variable: "Visitas completadas 90d", impact: "+36 pts · impacto alto", detail: "12 visitas completadas en 90d — 0 cancelaciones." },
      { variable: "Ticket medio", impact: "+14 pts · impacto medio", detail: "Ticket medio muy superior al segmento." },
      { variable: "Recencia", impact: "+10 pts · impacto medio", detail: "Última visita hace 2d." },
      { variable: "Interacción", impact: "+8 pts · impacto bajo", detail: "Interacción constante con CRM y WhatsApp." },
    ],
    modelVersion: "retention-xgb-v2.1",
    calculatedAt: minutes(4),
    expiresAt: daysAhead(3),
    formula: "visitas_completadas / visitas_esperadas_90d × 100",
  },
  {
    name: "CancellationRiskScore",
    label: "Riesgo cancelación",
    value: 3,
    confidence: 85,
    level: "bajo",
    dataQuality: "HIGH",
    isRisk: true,
    factors: [
      { variable: "Cancelaciones 12m", impact: "−50 pts · riesgo bajo", detail: "0 cancelaciones en 12 meses." },
      { variable: "Frecuencia", impact: "−15 pts · riesgo bajo", detail: "Patrón semanal estable." },
      { variable: "Quejas", impact: "−10 pts · riesgo bajo", detail: "Sin quejas registradas." },
      { variable: "Confirmación", impact: "−5 pts · riesgo bajo", detail: "Confirmación inmediata (mediana 2 min)." },
    ],
    modelVersion: "cancel-xgb-v1.4",
    calculatedAt: minutes(6),
    expiresAt: daysAhead(3),
    formula: "cancelaciones_90d / reservas_90d × 100",
  },
  {
    name: "NoShowRiskScore",
    label: "Riesgo no-show",
    value: 2,
    confidence: 82,
    level: "bajo",
    dataQuality: "HIGH",
    isRisk: true,
    factors: [
      { variable: "No-shows históricos", impact: "−52 pts · riesgo bajo", detail: "0 no-shows en 42 reservas." },
      { variable: "Confirmación", impact: "−10 pts · riesgo bajo", detail: "Confirmación por WhatsApp en 100%." },
      { variable: "Recurrencia", impact: "−8 pts · riesgo bajo", detail: "Cliente VIP con asistencia perfecta." },
      { variable: "Depósito", impact: "−4 pts · riesgo bajo", detail: "Depósito activo en grupos y festivos." },
    ],
    modelVersion: "noshow-xgb-v1.1",
    calculatedAt: minutes(6),
    expiresAt: daysAhead(3),
    formula: "no_shows_historicos / reservas_historicas × 100",
  },
  {
    name: "UpsellPotentialScore",
    label: "Potencial upsell",
    value: 88,
    confidence: 78,
    level: "alto",
    dataQuality: "HIGH",
    factors: [
      { variable: "Maridajes", impact: "+30 pts · impacto alto", detail: "Acepta maridajes en 80% de visitas." },
      { variable: "Degustación", impact: "+20 pts · impacto medio", detail: "Menu degustación en 1 de cada 3 visitas." },
      { variable: "VIP receptive", impact: "+14 pts · impacto medio", detail: "Solicita experiencias premium activamente." },
      { variable: "Tendencia", impact: "+10 pts · impacto bajo", detail: "Ticket creciente (+18% en 6m)." },
    ],
    modelVersion: "upsell-xgb-v0.9",
    calculatedAt: minutes(8),
    expiresAt: daysAhead(7),
    formula: "upsell_aceptado / upsell_ofrecido × 100",
  },
  {
    name: "ReviewLikelihoodScore",
    label: "Probabilidad review",
    value: 82,
    confidence: 75,
    level: "alto",
    dataQuality: "HIGH",
    factors: [
      { variable: "Reviews previas", impact: "+26 pts · impacto medio", detail: "6 reviews previas en 12 meses." },
      { variable: "Satisfacción", impact: "+20 pts · impacto medio", detail: "NPS 10 — embajador de marca." },
      { variable: "Encuestas", impact: "+12 pts · impacto bajo", detail: "Responde 95% de encuestas." },
      { variable: "Canal", impact: "+6 pts · impacto bajo", detail: "Canal preferido: Google + TripAdvisor." },
    ],
    modelVersion: "review-rf-v0.8",
    calculatedAt: minutes(10),
    expiresAt: daysAhead(5),
    formula: "reviews_previas × 0.4 + (nps − 5) / 5 × 0.4 + encuestas × 0.2",
  },
];

const SCORES_NEW: Score[] = [
  {
    name: "LoyaltyScore",
    label: "Fidelidad",
    value: 0,
    confidence: 0,
    level: "bajo",
    dataQuality: "INSUFFICIENT",
    factors: [],
    modelVersion: "loyalty-xgb-v2.3",
    calculatedAt: minutes(2),
    expiresAt: daysAhead(1),
    formula: "visitas_90d × ticket_medio / frecuencia_esperada",
    limitations: "Cliente nuevo: 1 visita registrada. Se requieren al menos 3 visitas para activar el modelo ML.",
  },
  {
    name: "RevenueScore",
    label: "Rentabilidad",
    value: 35,
    confidence: 25,
    level: "bajo",
    dataQuality: "LOW",
    factors: [
      { variable: "Ticket medio", impact: "+20 pts · impacto alto", detail: "Ticket €56 en única visita — por encima de la media." },
      { variable: "Margen estimado", impact: "+10 pts · impacto medio", detail: "Margen estimado 65% basado en platos pedidos." },
      { variable: "LTV histórico", impact: "−5 pts · impacto bajo", detail: "LTV €56 — cliente sin histórico." },
    ],
    modelVersion: "revenue-prophet-v1.7",
    calculatedAt: minutes(2),
    expiresAt: daysAhead(2),
    formula: "(ltv − coste_adquisicion) / antiguedad_meses × margen",
    limitations: "Score basado en única visita. Se actualizará tras 3 visitas.",
  },
  {
    name: "EngagementScore",
    label: "Interacción",
    value: 45,
    confidence: 30,
    level: "bajo",
    dataQuality: "LOW",
    factors: [
      { variable: "Apertura emails", impact: "+18 pts · impacto medio", detail: "1 de 2 emails abiertos (50%)." },
      { variable: "WhatsApp", impact: "+10 pts · impacto bajo", detail: "Confirmó reserva por WhatsApp." },
    ],
    modelVersion: "engagement-rf-v1.2",
    calculatedAt: minutes(3),
    expiresAt: daysAhead(7),
    formula: "apertura_emails × 0.4 + clicks × 0.3 + respuestas × 0.3",
    limitations: "Datos limitados: 2 emails enviados, 0 campañas completadas.",
  },
  {
    name: "RetentionScore",
    label: "Retención",
    value: 0,
    confidence: 0,
    level: "bajo",
    dataQuality: "INSUFFICIENT",
    factors: [],
    modelVersion: "retention-xgb-v2.1",
    calculatedAt: minutes(2),
    expiresAt: daysAhead(1),
    formula: "visitas_completadas / visitas_esperadas_90d × 100",
    limitations: "Cliente nuevo: no hay histórico de retención. El score se activará tras 90 días.",
  },
  {
    name: "CancellationRiskScore",
    label: "Riesgo cancelación",
    value: 0,
    confidence: 0,
    level: "bajo",
    dataQuality: "INSUFFICIENT",
    isRisk: true,
    factors: [],
    modelVersion: "cancel-xgb-v1.4",
    calculatedAt: minutes(2),
    expiresAt: daysAhead(1),
    formula: "cancelaciones_90d / reservas_90d × 100",
    limitations: "Sin histórico suficiente. Se aplica heurística: cliente nuevo = riesgo medio por defecto.",
  },
  {
    name: "NoShowRiskScore",
    label: "Riesgo no-show",
    value: 25,
    confidence: 35,
    level: "medio",
    dataQuality: "LOW",
    isRisk: true,
    factors: [
      { variable: "No-shows históricos", impact: "−15 pts · riesgo bajo", detail: "0 no-shows en 1 reserva." },
      { variable: "Confirmación", impact: "−5 pts · riesgo bajo", detail: "Confirmó por WhatsApp." },
      { variable: "Recurrencia", impact: "+10 pts · riesgo medio", detail: "Cliente nuevo — sin patrón verificable." },
    ],
    modelVersion: "noshow-xgb-v1.1",
    calculatedAt: minutes(3),
    expiresAt: daysAhead(3),
    formula: "no_shows_historicos / reservas_historicas × 100",
    limitations: "Heurística inicial: cliente nuevo sin depósito = riesgo medio. Requiere seguimiento.",
  },
  {
    name: "UpsellPotentialScore",
    label: "Potencial upsell",
    value: 55,
    confidence: 40,
    level: "medio",
    dataQuality: "LOW",
    factors: [
      { variable: "Sugerencias", impact: "+18 pts · impacto medio", detail: "Aceptó sugerencia de postre en única visita." },
      { variable: "Ticket", impact: "+10 pts · impacto bajo", detail: "Ticket €56 — incluye extras." },
      { variable: "Perfil demográfico", impact: "+8 pts · impacto bajo", detail: "Segmento con propensión media a upsell." },
    ],
    modelVersion: "upsell-xgb-v0.9",
    calculatedAt: minutes(4),
    expiresAt: daysAhead(7),
    formula: "upsell_aceptado / upsell_ofrecido × 100",
    limitations: "Score basado en única visita y segmento demográfico. Requiere validación con más visitas.",
  },
  {
    name: "ReviewLikelihoodScore",
    label: "Probabilidad review",
    value: 0,
    confidence: 0,
    level: "bajo",
    dataQuality: "INSUFFICIENT",
    factors: [],
    modelVersion: "review-rf-v0.8",
    calculatedAt: minutes(2),
    expiresAt: daysAhead(1),
    formula: "reviews_previas × 0.4 + (nps − 5) / 5 × 0.4 + encuestas × 0.2",
    limitations: "Sin NPS ni reviews previas. Se requiere invitación post-visita para recoger primera señal.",
  },
];

const DEMO_CUSTOMERS: DemoCustomer[] = [
  {
    id: "cust-1",
    name: "Elena Marín",
    email: "elena.marin@example.com",
    tier: "Oro",
    visits: 15,
    lastVisit: "hace 6 días",
    joinedAt: "2024-10-01",
    scores: SCORES_ELENA,
    ltv: [
      {
        type: "historical",
        value: 284000,
        currency: "EUR",
        method:
          "Ingresos netos acumulados − descuentos − reembolsos − cancelaciones no cobradas",
        confidence: 95,
        components: [
          { label: "Ingresos brutos", value: "€3.120" },
          { label: "Descuentos", value: "−€180" },
          { label: "Reembolsos", value: "−€60" },
          { label: "Cancelaciones no cobradas", value: "−€40" },
        ],
        calculatedAt: minutes(8),
        disclaimer: "Basado en transacciones verificadas en POS y reservas.",
      },
      {
        type: "estimated",
        value: 892000,
        currency: "EUR",
        method:
          "Ticket medio × frecuencia esperada × periodo retención × margen",
        confidence: 62,
        horizon: "24 meses",
        components: [
          { label: "Ticket medio", value: "€42" },
          { label: "Frecuencia esperada", value: "2.1 visitas/mes" },
          { label: "Retención estimada", value: "24 meses" },
          { label: "Margen", value: "68%" },
        ],
        calculatedAt: minutes(8),
        disclaimer:
          "Estimación basada en modelo predictivo. No es una garantía. Sujeto a cambios de comportamiento.",
      },
    ],
    classifications: [
      {
        label: "VIP",
        rule: "LTV > 2.000€ ∧ visitas totales > 10",
        evaluatedAt: "2025-01-15",
        tone: "gold",
        icon: Crown,
      },
      {
        label: "FrequentCustomer",
        rule: "visitas 90d ≥ 5",
        evaluatedAt: "2025-01-20",
        tone: "teal",
        icon: Flame,
      },
      {
        label: "Ambassador",
        rule: "reviews ≥ 2 ∧ NPS ≥ 9",
        evaluatedAt: "2025-01-18",
        tone: "emerald",
        icon: Award,
      },
    ],
  },
  {
    id: "cust-2",
    name: "Marco Bellini",
    email: "marco.bellini@example.com",
    tier: "Black",
    visits: 42,
    lastVisit: "hace 2 días",
    joinedAt: "2023-03-12",
    scores: SCORES_VIP,
    ltv: [
      {
        type: "historical",
        value: 845000,
        currency: "EUR",
        method:
          "Ingresos netos acumulados − descuentos − reembolsos − cancelaciones no cobradas",
        confidence: 98,
        components: [
          { label: "Ingresos brutos", value: "€9.180" },
          { label: "Descuentos", value: "−€520" },
          { label: "Reembolsos", value: "−€120" },
          { label: "Cancelaciones no cobradas", value: "−€90" },
        ],
        calculatedAt: minutes(5),
        disclaimer: "Basado en transacciones verificadas en POS y reservas.",
      },
      {
        type: "estimated",
        value: 2140000,
        currency: "EUR",
        method:
          "Ticket medio × frecuencia esperada × periodo retención × margen",
        confidence: 78,
        horizon: "24 meses",
        components: [
          { label: "Ticket medio", value: "€98" },
          { label: "Frecuencia esperada", value: "3.2 visitas/mes" },
          { label: "Retención estimada", value: "24 meses" },
          { label: "Margen", value: "72%" },
        ],
        calculatedAt: minutes(5),
        disclaimer:
          "Estimación basada en modelo predictivo. No es una garantía. Sujeto a cambios de comportamiento.",
      },
    ],
    classifications: [
      {
        label: "VIP",
        rule: "LTV > 2.000€ ∧ visitas totales > 10",
        evaluatedAt: "2025-01-12",
        tone: "gold",
        icon: Crown,
      },
      {
        label: "FrequentCustomer",
        rule: "visitas 90d ≥ 5",
        evaluatedAt: "2025-01-22",
        tone: "teal",
        icon: Flame,
      },
      {
        label: "Ambassador",
        rule: "reviews ≥ 2 ∧ NPS ≥ 9",
        evaluatedAt: "2025-01-10",
        tone: "emerald",
        icon: Award,
      },
    ],
  },
  {
    id: "cust-3",
    name: "Lucía Ferrer",
    email: "lucia.ferrer@example.com",
    tier: "Nuevo",
    visits: 1,
    lastVisit: "hace 3 días",
    joinedAt: "2025-01-19",
    scores: SCORES_NEW,
    ltv: [
      {
        type: "historical",
        value: 5600,
        currency: "EUR",
        method:
          "Ingresos netos acumulados − descuentos − reembolsos − cancelaciones no cobradas",
        confidence: 90,
        components: [
          { label: "Ingresos brutos", value: "€62" },
          { label: "Descuentos", value: "−€6" },
          { label: "Reembolsos", value: "€0" },
          { label: "Cancelaciones no cobradas", value: "€0" },
        ],
        calculatedAt: minutes(3),
        disclaimer: "Basado en única transacción verificada.",
      },
      {
        type: "estimated",
        value: 184000,
        currency: "EUR",
        method:
          "Ticket medio × frecuencia esperada × periodo retención × margen",
        confidence: 28,
        horizon: "12 meses",
        components: [
          { label: "Ticket medio", value: "€56" },
          { label: "Frecuencia esperada", value: "0.8 visitas/mes" },
          { label: "Retención estimada", value: "12 meses" },
          { label: "Margen", value: "65%" },
        ],
        calculatedAt: minutes(3),
        disclaimer:
          "Estimación con confianza baja por histórico insuficiente. No es una garantía. Sujeto a cambios de comportamiento.",
      },
    ],
    classifications: [
      {
        label: "NewCustomer",
        rule: "antiguedad < 30 días",
        evaluatedAt: "2025-01-22",
        tone: "teal",
        icon: Sparkles,
      },
    ],
  },
];

/* =========================================================
 * Sub-components
 * =======================================================*/
function CustomerHeader({ customer }: { customer: DemoCustomer }) {
  return (
    <motion.div
      key={customer.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rp-glass rounded-2xl p-4 sm:p-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/10 font-display text-lg font-medium rp-gold-text">
            {customer.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-lg sm:text-xl font-medium text-foreground truncate">
              {customer.name}
            </h3>
            <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 sm:ml-auto">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Tier</div>
            <div className="rp-gold-text font-display text-base mt-0.5">{customer.tier}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Visitas</div>
            <div className="font-display text-base mt-0.5 text-foreground">{customer.visits}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Alta</div>
            <div className="text-sm mt-0.5 text-foreground/80">
              {new Date(customer.joinedAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Última visita</div>
            <div className="text-sm mt-0.5 text-foreground/80">{customer.lastVisit}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ScoreCard({
  score,
  index,
  reduceMotion,
}: {
  score: Score;
  index: number;
  reduceMotion: boolean | null;
}) {
  const Icon = SCORE_ICON[score.name] ?? Brain;
  const isInsufficient = score.dataQuality === "INSUFFICIENT";
  const dq = DQ_META[score.dataQuality];
  const lvl = LEVEL_META[score.level];
  const cTone = confidenceTone(score.confidence);
  const riskHint = score.isRisk;

  return (
    <motion.article
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: reduceMotion ? 0 : Math.min(index * 0.04, 0.32) }}
      className={cn(
        "rp-glass rounded-2xl p-4 sm:p-5 flex flex-col gap-3 relative overflow-hidden",
        isInsufficient && "ring-1 ring-destructive/30"
      )}
      aria-labelledby={`score-name-${index}`}
    >
      {/* Top: name + icon + level badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-foreground/5">
            <Icon className={cn("h-4 w-4", riskHint ? "text-amber-300" : "rp-gold-text")} aria-hidden />
          </span>
          <div className="min-w-0">
            <div
              id={`score-name-${index}`}
              className="font-mono text-[11px] leading-tight text-foreground/90 truncate"
            >
              {score.name}
            </div>
            <div className="text-xs text-muted-foreground leading-tight">{score.label}</div>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider shrink-0",
            lvl.className
          )}
          title={riskHint ? `Riesgo ${score.level}` : `Nivel ${score.level}`}
        >
          {lvl.label}
        </span>
      </div>

      {/* Big value + data quality */}
      <div className="flex items-end justify-between gap-2">
        <div className="flex items-baseline gap-1">
          <span
            className={cn(
              "font-display text-4xl sm:text-5xl font-light leading-none tracking-tight",
              valueToneClass(score)
            )}
          >
            {isInsufficient ? "—" : score.value}
          </span>
          {!isInsufficient && (
            <span className="text-xs text-muted-foreground font-mono">/100</span>
          )}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider cursor-help",
                  dq.className
                )}
                aria-label={`Calidad de datos: ${dq.label}`}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", dq.dot)} aria-hidden />
                {dq.short}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[240px] text-xs leading-relaxed">
              {dq.tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Insufficient data warning */}
      {isInsufficient && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2.5">
          <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" aria-hidden />
          <p className="text-[11px] leading-relaxed text-destructive/90">
            Datos insuficientes — score no calculado.
          </p>
        </div>
      )}

      {/* Confidence bar */}
      {!isInsufficient && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" aria-hidden />
              Confianza
            </span>
            <span
              className={cn(
                cTone === "emerald" && "text-emerald-300",
                cTone === "gold" && "rp-gold-text",
                cTone === "amber" && "text-amber-300"
              )}
            >
              {score.confidence}%
            </span>
          </div>
          <div
            className="h-1.5 w-full rounded-full bg-foreground/10 overflow-hidden"
            role="progressbar"
            aria-valuenow={score.confidence}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Confianza ${score.confidence} por ciento`}
          >
            <motion.div
              className={cn(
                "h-full rounded-full",
                cTone === "emerald" && "bg-emerald-400",
                cTone === "gold" && "bg-[var(--gold)]",
                cTone === "amber" && "bg-amber-400"
              )}
              initial={reduceMotion ? false : { width: 0 }}
              animate={{ width: `${score.confidence}%` }}
              transition={{ duration: 0.7, delay: reduceMotion ? 0 : 0.15 + index * 0.04, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Factors list */}
      {!isInsufficient && score.factors.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Factores clave
          </div>
          <ul className="space-y-1.5 max-h-44 overflow-y-auto rp-scroll-thin pr-1">
            {score.factors.map((f, i) => (
              <li
                key={i}
                className="rounded-md border border-foreground/8 bg-foreground/[0.025] p-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-foreground/90">{f.variable}</span>
                  <span
                    className={cn(
                      "text-[10px] font-mono uppercase tracking-wider shrink-0",
                      f.impact.startsWith("−") || f.impact.startsWith("-")
                        ? "text-emerald-300/90"
                        : "rp-gold-text"
                    )}
                  >
                    {f.impact}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                  {f.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Formula */}
      {!isInsufficient && (
        <div className="rounded-md border border-foreground/8 bg-foreground/[0.025] px-2 py-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 mb-0.5">
            Fórmula
          </div>
          <code className="text-[11px] font-mono text-foreground/80 break-all leading-relaxed">
            {score.formula}
          </code>
        </div>
      )}

      {/* Model info */}
      <div className="mt-auto pt-2 border-t border-border/40 space-y-0.5">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/80">
          <Cpu className="h-3 w-3 shrink-0" aria-hidden />
          <span className="truncate">{score.modelVersion}</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-muted-foreground/70">
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-3 w-3" aria-hidden />
            {formatRelative(score.calculatedAt)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden />
            {formatExpires(score.expiresAt)}
          </span>
        </div>
      </div>

      {/* Limitations */}
      {score.limitations && (
        <div className="flex items-start gap-2 rounded-md border border-amber-400/25 bg-amber-400/5 p-2">
          <ShieldAlert className="h-3 w-3 text-amber-300 shrink-0 mt-0.5" aria-hidden />
          <p className="text-[11px] leading-relaxed text-amber-200/90">
            {score.limitations}
          </p>
        </div>
      )}
    </motion.article>
  );
}

function LtvCard({
  ltv,
  index,
  reduceMotion,
}: {
  ltv: LtvBreakdown;
  index: number;
  reduceMotion: boolean | null;
}) {
  const isHistorical = ltv.type === "historical";
  const cTone = confidenceTone(ltv.confidence);
  const Icon = isHistorical ? Wallet : TrendingUp;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.1 + index * 0.1 }}
      className={cn(
        "rp-glass rounded-2xl p-5 flex flex-col gap-4",
        isHistorical ? "rp-glow-gold" : "rp-glow-teal"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
              isHistorical
                ? "border-[var(--gold)]/30 bg-[var(--gold)]/10"
                : "border-[var(--teal)]/30 bg-[var(--teal)]/10"
            )}
          >
            <Icon
              className={cn("h-4 w-4", isHistorical ? "rp-gold-text" : "rp-teal-text")}
              aria-hidden
            />
          </span>
          <div className="min-w-0">
            <h3
              className={cn(
                "font-display text-base sm:text-lg font-medium",
                isHistorical ? "rp-gold-text" : "rp-teal-text"
              )}
            >
              LTV {isHistorical ? "Histórico" : "Estimado"}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {isHistorical ? "Ingresos verificados" : `Horizonte ${ltv.horizon ?? "—"}`}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider shrink-0",
            isHistorical
              ? "border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)]"
              : "border-[var(--teal)]/30 bg-[var(--teal)]/10 text-[var(--teal)]"
          )}
        >
          {isHistorical ? "Real" : "Predicción"}
        </span>
      </div>

      {/* Big value */}
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-display text-4xl sm:text-5xl font-light leading-none tracking-tight",
            isHistorical ? "rp-gold-text" : "rp-teal-text"
          )}
        >
          {formatCurrency(ltv.value, ltv.currency)}
        </span>
      </div>

      {/* Confidence bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" aria-hidden />
            Confianza
          </span>
          <span
            className={cn(
              cTone === "emerald" && "text-emerald-300",
              cTone === "gold" && "rp-gold-text",
              cTone === "amber" && "text-amber-300"
            )}
          >
            {ltv.confidence}%
          </span>
        </div>
        <div
          className="h-1.5 w-full rounded-full bg-foreground/10 overflow-hidden"
          role="progressbar"
          aria-valuenow={ltv.confidence}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Confianza LTV ${ltv.confidence} por ciento`}
        >
          <motion.div
            className={cn(
              "h-full rounded-full",
              cTone === "emerald" && "bg-emerald-400",
              cTone === "gold" && "bg-[var(--gold)]",
              cTone === "amber" && "bg-amber-400"
            )}
            initial={reduceMotion ? false : { width: 0 }}
            animate={{ width: `${ltv.confidence}%` }}
            transition={{ duration: 0.8, delay: reduceMotion ? 0 : 0.3 + index * 0.1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Method */}
      <div className="rounded-md border border-foreground/8 bg-foreground/[0.025] p-2.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 mb-1">
          Método
        </div>
        <p className="text-[12px] leading-relaxed text-foreground/85">{ltv.method}</p>
      </div>

      {/* Components */}
      <div className="space-y-1">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
          Componentes
        </div>
        <ul className="divide-y divide-border/40">
          {ltv.components.map((c, i) => (
            <li key={i} className="flex items-center justify-between py-1.5 text-sm">
              <span className="text-foreground/80">{c.label}</span>
              <span
                className={cn(
                  "font-mono",
                  c.value.startsWith("−") || c.value.startsWith("-")
                    ? "text-amber-300"
                    : "rp-gold-text"
                )}
              >
                {c.value}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Meta + disclaimer */}
      <div className="mt-auto pt-2 border-t border-border/40 space-y-2">
        <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-muted-foreground/70">
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-3 w-3" aria-hidden />
            {formatRelative(ltv.calculatedAt)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Cpu className="h-3 w-3" aria-hidden />
            {isHistorical ? "pos-ledger-v1" : "ltv-prophet-v1.3"}
          </span>
        </div>
        <div className="flex items-start gap-2">
          {isHistorical ? (
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300 shrink-0 mt-0.5" aria-hidden />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-amber-300 shrink-0 mt-0.5" aria-hidden />
          )}
          <p
            className={cn(
              "text-[11px] leading-relaxed",
              isHistorical ? "text-emerald-200/80" : "text-amber-200/90"
            )}
          >
            {ltv.disclaimer}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ClassificationChip({ c }: { c: Classification }) {
  const Icon = c.icon;
  const toneCls =
    c.tone === "gold"
      ? "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]"
      : c.tone === "teal"
      ? "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]"
      : "border-emerald-400/40 bg-emerald-400/10 text-emerald-300";
  return (
    <div
      className={cn(
        "rp-glass rounded-xl p-3 sm:p-4 flex flex-col gap-2 border-l-2",
        c.tone === "gold"
          ? "border-l-[var(--gold)]"
          : c.tone === "teal"
          ? "border-l-[var(--teal)]"
          : "border-l-emerald-400"
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
            toneCls
          )}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
        </span>
        <span className={cn("font-mono text-sm font-medium", toneCls.split(" ").find((s) => s.startsWith("text-")))}>
          {c.label}
        </span>
      </div>
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 mb-0.5">
          Regla
        </div>
        <code className="text-[11px] font-mono text-foreground/80 break-all leading-relaxed">
          {c.rule}
        </code>
      </div>
      <div className="text-[10px] font-mono text-muted-foreground/70">
        Evaluada: {new Date(c.evaluatedAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
      </div>
    </div>
  );
}

/* =========================================================
 * Main
 * =======================================================*/
export function CrmIntelligenceEngine() {
  const reduceMotion = useReducedMotion();
  const { toast } = useToast();
  const [customerId, setCustomerId] = React.useState<string>("cust-1");
  const [recalculating, setRecalculating] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const customer = React.useMemo(
    () => DEMO_CUSTOMERS.find((c) => c.id === customerId) ?? DEMO_CUSTOMERS[0],
    [customerId]
  );

  const handleRecalc = () => {
    setRecalculating(true);
    setTimeout(() => {
      setRecalculating(false);
      setRefreshKey((k) => k + 1);
      toast({
        title: "Scores recalculados",
        description: `8 scores + LTV dual actualizados para ${customer.name}.`,
      });
    }, 1100);
  };

  const insufficientCount = customer.scores.filter((s) => s.dataQuality === "INSUFFICIENT").length;

  return (
    <section
      className="space-y-5 sm:space-y-6"
      aria-labelledby="crm-engine-heading"
    >
      {/* Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/10">
            <Brain className="h-5 w-5 rp-gold-text" aria-hidden />
          </span>
          <div>
            <h2
              id="crm-engine-heading"
              className="font-display text-xl sm:text-2xl font-medium tracking-tight text-foreground"
            >
              Customer Intelligence Engine
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              8 scores explicables + LTV dual (histórico y estimado).
            </p>
          </div>
          <Badge
            variant="outline"
            className="ml-1 border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)] font-mono uppercase tracking-wider text-[10px]"
          >
            demo
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <label className="sr-only" htmlFor="engine-cust-select">
            Seleccionar cliente
          </label>
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger
              id="engine-cust-select"
              className="w-full sm:w-[280px] h-10 bg-background/40"
              aria-label="Seleccionar cliente"
            >
              <SelectValue placeholder="Selecciona un cliente" />
            </SelectTrigger>
            <SelectContent>
              {DEMO_CUSTOMERS.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-xs text-muted-foreground">· {c.tier} · {c.visits}v</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleRecalc}
            disabled={recalculating}
            className="h-10 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] font-medium"
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", recalculating && "animate-spin")}
              aria-hidden
            />
            {recalculating ? "Recalculando…" : "Recalcular scores"}
          </Button>
        </div>
      </header>

      {/* Customer context strip */}
      <CustomerHeader customer={customer} />

      {/* Insufficient data alert */}
      {insufficientCount > 0 && (
        <div className="rp-glass rounded-xl p-3 sm:p-4 flex items-start gap-3 border-l-2 border-amber-400/50">
          <AlertTriangle className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" aria-hidden />
          <div className="text-xs leading-relaxed text-foreground/80">
            <span className="font-medium text-amber-200">{insufficientCount} score{insufficientCount > 1 ? "s" : ""} no calculado{insufficientCount > 1 ? "s" : ""}</span>{" "}
            por datos insuficientes. El motor aplica heurísticas conservadoras y nunca infiere datos sensibles (alergias, salud).
          </div>
        </div>
      )}

      {/* Scores grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${customer.id}-${refreshKey}`}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5"
        >
          {customer.scores.map((s, i) => (
            <ScoreCard
              key={`${customer.id}-${s.name}-${refreshKey}`}
              score={s}
              index={i}
              reduceMotion={reduceMotion}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Dual LTV */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 rp-gold-text" aria-hidden />
          <h3 className="font-display text-base sm:text-lg font-medium text-foreground">
            Lifetime Value — dual
          </h3>
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            histórico vs estimado
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {customer.ltv.map((l, i) => (
            <LtvCard
              key={`${customer.id}-${l.type}-${refreshKey}`}
              ltv={l}
              index={i}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>

      {/* Classifications */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 rp-teal-text" aria-hidden />
          <h3 className="font-display text-base sm:text-lg font-medium text-foreground">
            Clasificación actual
          </h3>
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            {customer.classifications.length} activa{customer.classifications.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {customer.classifications.map((c, i) => (
            <motion.div
              key={`${customer.id}-${c.label}-${i}`}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: reduceMotion ? 0 : i * 0.06 }}
            >
              <ClassificationChip c={c} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <footer className="rp-glass rounded-xl p-4 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--teal)]/30 bg-[var(--teal)]/10">
          <Sparkles className="h-3.5 w-3.5 rp-teal-text" aria-hidden />
        </span>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Los scores son estimaciones basadas en datos históricos. No son garantías.{" "}
          <span className="text-foreground/80 font-medium">La IA recomienda, el humano decide.</span>{" "}
          Los datos sensibles (alergias, salud) nunca se infieren — solo se registran con consentimiento explícito.
        </p>
      </footer>
    </section>
  );
}
