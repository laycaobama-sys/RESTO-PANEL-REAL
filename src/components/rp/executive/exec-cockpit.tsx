"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
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
  type LegendItem,
  type TimeRange,
} from "@/components/rp/charts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowRight,
  Award,
  Banknote,
  BarChart3,
  BellRing,
  Brain,
  Calendar,
  CalendarClock,
  CalendarDays,
  ChefHat,
  ChevronDown,
  ChevronRight,
  Cloud,
  ConciergeBell,
  Crown,
  Database,
  DollarSign,
  ExternalLink,
  Filter,
  Flame,
  Gauge as GaugeIcon,
  Globe,
  Info,
  Layers,
  Mail,
  MailOpen,
  MapPin,
  Megaphone,
  MessageSquare,
  Minus,
  MousePointerClick,
  Percent,
  Phone,
  PieChart,
  Plus,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  Save,
  Settings2,
  ShieldAlert,
  Sliders,
  Sparkles,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserX,
  Users,
  Zap,
} from "lucide-react";

/* =====================================================================
 * Types
 * ===================================================================== */

type Freq = "realtime" | "near" | "aggregated";
type Accent = "gold" | "teal";
type TrendDir = "up" | "down" | "flat";
type KpiCategory = "Operación" | "Clientes" | "Marketing" | "Reputación" | "Finanzas";

interface KpiItem {
  id: string;
  name: string;
  value: string;
  trendAbs: string;
  trendPct: string;
  trendDir: TrendDir;
  positive: boolean;
  definition: string;
  formula: string;
  source: string;
  freq: Freq;
  period: string;
  limitations?: string;
  accent: Accent;
  updated: string;
}

interface WidgetDef {
  id: string;
  title: string;
  icon: React.ElementType;
  accent: Accent;
  freq: Freq;
  source: string;
  definition: string;
  updated: string;
}

/* =====================================================================
 * Demo data — constant catalogue
 * ===================================================================== */

const PERIODS = ["Hoy", "Ayer", "Semana", "Mes", "Trimestre", "Año"] as const;
type Period = (typeof PERIODS)[number];

const RESTAURANTS = ["Todos", "Ramses Madrid", "Ramses Barcelona", "Ramses Valencia"];
const ZONAS = ["Todas", "Sala", "Terraza", "VIP", "Barra"];
const TURNOS = ["Todos", "Comida", "Cena"];
const CANALES = ["Todos", "Web", "Google", "WhatsApp", "Phone"];

const WIDGETS: WidgetDef[] = [
  { id: "facturacion", title: "Facturación", icon: Banknote, accent: "gold", freq: "near", source: "Billing + Reservations", definition: "Ingresos previstos para hoy a partir de reservas confirmadas y walk-ins estimados.", updated: "hace 2 min" },
  { id: "reservas", title: "Reservas", icon: CalendarDays, accent: "gold", freq: "realtime", source: "D1 · Reservations", definition: "Reservas confirmadas para el día actual, con desglose por canal de origen.", updated: "hace 30 s" },
  { id: "ocupacion", title: "Ocupación", icon: PieChart, accent: "teal", freq: "realtime", source: "DO + D1", definition: "Porcentaje de mesas ocupadas en tiempo real sobre el total disponible.", updated: "hace 30 s" },
  { id: "ticket", title: "Ticket medio", icon: ReceiptText, accent: "gold", freq: "near", source: "D1 + POS", definition: "Facturación media por cubierto durante el servicio.", updated: "hace 5 min" },
  { id: "noshows", title: "No-shows", icon: UserX, accent: "teal", freq: "near", source: "D1", definition: "Reservas confirmadas que no se presentaron, en valor absoluto y tasa.", updated: "hace 5 min" },
  { id: "vip", title: "Clientes VIP", icon: Crown, accent: "gold", freq: "aggregated", source: "CRM", definition: "Clientes etiquetados como VIP con reserva para hoy.", updated: "hace 1 h" },
  { id: "alertas", title: "Alertas", icon: BellRing, accent: "teal", freq: "realtime", source: "Alert engine", definition: "Avisos operativos y financieros activos, clasificados por severidad.", updated: "hace 30 s" },
  { id: "forecast", title: "Forecast IA", icon: Brain, accent: "teal", freq: "aggregated", source: "AI Gateway", definition: "Predicción de reservas, facturación y personal recomendado para mañana.", updated: "hace 15 min" },
  { id: "recs", title: "Recomendaciones IA", icon: Sparkles, accent: "gold", freq: "aggregated", source: "AI Gateway", definition: "Top 3 recomendaciones priorizadas por impacto estimado y confianza del modelo.", updated: "hace 15 min" },
  { id: "rent", title: "Rentabilidad", icon: Percent, accent: "gold", freq: "aggregated", source: "Financial ledger", definition: "Margen y beneficio estimados con costes reales parciales más proyección.", updated: "hace 1 h" },
  { id: "rep", title: "Reputación", icon: Star, accent: "teal", freq: "aggregated", source: "Reviews + Surveys", definition: "Calificaciones agregadas y NPS de los últimos 30 días.", updated: "hace 2 h" },
  { id: "staff", title: "Personal recomendado", icon: ConciergeBell, accent: "gold", freq: "aggregated", source: "Forecast + Staff load", definition: "Plantilla recomendada para mañana en base a ocupación y carga de trabajo prevista.", updated: "hace 15 min" },
];

const KPI_CATALOG: Record<KpiCategory, KpiItem[]> = {
  "Operación": [
    { id: "op-ocup", name: "Ocupación media", value: "78%", trendAbs: "+5pp", trendPct: "+6.8%", trendDir: "up", positive: true, definition: "Porcentaje de mesas ocupadas durante el servicio.", formula: "mesas_ocupadas / mesas_totales × 100", source: "D1 · Analytics Engine", freq: "realtime", period: "Hoy", limitations: "No incluye walk-ins no registrados en POS.", accent: "teal", updated: "hace 30 s" },
    { id: "op-rot", name: "Rotación de mesas", value: "2.3", trendAbs: "+0.1", trendPct: "+4.5%", trendDir: "up", positive: true, definition: "Veces que cada mesa se ocupa en un servicio.", formula: "cubiertos_servidos / mesas_disponibles", source: "D1", freq: "near", period: "Hoy", accent: "gold", updated: "hace 5 min" },
    { id: "op-tiempo", name: "Tiempo medio de mesa", value: "92 min", trendAbs: "−3 min", trendPct: "−3.2%", trendDir: "down", positive: true, definition: "Duración media desde el check-in hasta el cobro.", formula: "avg(cobro_ts − checkin_ts)", source: "POS", freq: "near", period: "Hoy", accent: "teal", updated: "hace 5 min" },
    { id: "op-espera", name: "Tiempo de espera", value: "18 min", trendAbs: "−2 min", trendPct: "−10%", trendDir: "down", positive: true, definition: "Tiempo medio entre llegada y sentada.", formula: "avg(sentada_ts − llegada_ts)", source: "Host app", freq: "realtime", period: "Hoy", limitations: "Solo mesas en lista de espera registradas.", accent: "gold", updated: "hace 30 s" },
    { id: "op-cancel", name: "Cancelaciones", value: "5.1%", trendAbs: "−0.4pp", trendPct: "−7.3%", trendDir: "down", positive: true, definition: "Tasa de reservas canceladas sobre el total.", formula: "canceladas / reservas × 100", source: "D1", freq: "near", period: "Últimos 7 días", accent: "teal", updated: "hace 5 min" },
    { id: "op-noshow", name: "No-shows", value: "8.2%", trendAbs: "−1.1pp", trendPct: "−11.8%", trendDir: "down", positive: true, definition: "Tasa de reservas no presentadas.", formula: "no_shows / reservas × 100", source: "D1", freq: "near", period: "Últimos 7 días", accent: "gold", updated: "hace 5 min" },
    { id: "op-checkin", name: "Check-ins", value: "38", trendAbs: "+4", trendPct: "+11.8%", trendDir: "up", positive: true, definition: "Clientes que han completado check-in hoy.", formula: "count(checkin_ts ≥ 00:00)", source: "Host app", freq: "realtime", period: "Hoy", accent: "teal", updated: "hace 30 s" },
    { id: "op-cap", name: "Capacidad utilizada", value: "78%", trendAbs: "+5pp", trendPct: "+6.8%", trendDir: "up", positive: true, definition: "Cubiertos servidos sobre capacidad máxima autorizada.", formula: "cubiertos / capacidad × 100", source: "D1 + Config", freq: "realtime", period: "Hoy", accent: "gold", updated: "hace 30 s" },
    { id: "op-prod", name: "Productividad", value: "4.2 mesas/camarero", trendAbs: "+0.3", trendPct: "+7.7%", trendDir: "up", positive: true, definition: "Mesas atendidas por camarero en servicio.", formula: "mesas_activas / camareros_en_turno", source: "Team module", freq: "near", period: "Hoy", accent: "teal", updated: "hace 5 min" },
    { id: "op-web", name: "Reservas Web", value: "42%", trendAbs: "+3pp", trendPct: "+7.7%", trendDir: "up", positive: true, definition: "Cuota de reservas originadas en la web del restaurante.", formula: "reservas_web / total × 100", source: "Booking widget", freq: "aggregated", period: "Mes", accent: "gold", updated: "hace 1 h" },
  ],
  "Clientes": [
    { id: "cl-new", name: "Clientes nuevos", value: "412", trendAbs: "+28", trendPct: "+7.3%", trendDir: "up", positive: true, definition: "Clientes que reservan por primera vez.", formula: "count(first_reservation_ts ≥ start_period)", source: "CRM", freq: "aggregated", period: "Mes", accent: "gold", updated: "hace 1 h" },
    { id: "cl-rec", name: "Clientes recurrentes", value: "847", trendAbs: "+54", trendPct: "+6.8%", trendDir: "up", positive: true, definition: "Clientes con más de una reserva.", formula: "count(reservas ≥ 2)", source: "CRM", freq: "aggregated", period: "Mes", accent: "teal", updated: "hace 1 h" },
    { id: "cl-vip", name: "Clientes VIP", value: "89", trendAbs: "+6", trendPct: "+7.2%", trendDir: "up", positive: true, definition: "Clientes con etiqueta VIP activa.", formula: "count(tag = 'VIP')", source: "CRM", freq: "aggregated", period: "Mes", accent: "gold", updated: "hace 1 h" },
    { id: "cl-recover", name: "Recuperados", value: "23", trendAbs: "+8", trendPct: "+53.3%", trendDir: "up", positive: true, definition: "Clientes inactivos +90d que volvieron a reservar.", formula: "count(last_visit ≥ 90d AND new_reservation)", source: "CRM reactivation", freq: "aggregated", period: "Mes", accent: "teal", updated: "hace 1 h" },
    { id: "cl-lost", name: "Perdidos", value: "8", trendAbs: "−2", trendPct: "−20%", trendDir: "down", positive: true, definition: "Clientes que pidieron baja o no volvieron tras 180d.", formula: "count(churned OR opt-out)", source: "CRM", freq: "aggregated", period: "Mes", accent: "gold", updated: "hace 1 h" },
    { id: "cl-churn", name: "Churn", value: "2.1%", trendAbs: "−0.3pp", trendPct: "−12.5%", trendDir: "down", positive: true, definition: "Tasa de clientes perdidos sobre activos.", formula: "perdidos / activos × 100", source: "CRM", freq: "aggregated", period: "Mes", accent: "teal", updated: "hace 1 h" },
    { id: "cl-ltv", name: "LTV", value: "€3.840", trendAbs: "+€210", trendPct: "+5.8%", trendDir: "up", positive: true, definition: "Valor estimado del cliente durante su ciclo de vida.", formula: "ticket_medio × frecuencia × duración_media", source: "Billing + CRM", freq: "aggregated", period: "12 meses", accent: "gold", updated: "hace 1 día" },
    { id: "cl-freq", name: "Frecuencia", value: "2.1 / mes", trendAbs: "+0.1", trendPct: "+5%", trendDir: "up", positive: true, definition: "Reservas medias por cliente activo al mes.", formula: "reservas / clientes_activos", source: "CRM", freq: "aggregated", period: "Mes", accent: "teal", updated: "hace 1 h" },
    { id: "cl-ticket", name: "Ticket medio cliente", value: "€38", trendAbs: "+€2", trendPct: "+5.6%", trendDir: "up", positive: true, definition: "Gasto medio por cubierto.", formula: "facturación / cubiertos", source: "POS", freq: "near", period: "Mes", accent: "gold", updated: "hace 5 min" },
    { id: "cl-risk", name: "Riesgo de abandono", value: "12 clientes", trendAbs: "−3", trendPct: "−20%", trendDir: "down", positive: true, definition: "Clientes con probabilidad de abandono > 0.6.", formula: "count(churn_score > 0.6)", source: "AI Gateway", freq: "near", period: "Mes", limitations: "Modelo supervisado, reentrenado semanalmente.", accent: "teal", updated: "hace 1 h" },
  ],
  "Marketing": [
    { id: "mk-roi", name: "ROI campañas", value: "340%", trendAbs: "+45pp", trendPct: "+15.2%", trendDir: "up", positive: true, definition: "Retorno sobre inversión publicitaria.", formula: "(ingresos_atrib − coste) / coste × 100", source: "Billing + Campaigns", freq: "aggregated", period: "Últimos 30 días", accent: "gold", updated: "hace 1 h" },
    { id: "mk-cac", name: "CAC", value: "€4.12", trendAbs: "−€0.80", trendPct: "−16.3%", trendDir: "down", positive: true, definition: "Coste de adquisición por nuevo cliente.", formula: "coste_total / nuevos_clientes", source: "Billing / new customers", freq: "aggregated", period: "Últimos 30 días", accent: "teal", updated: "hace 1 h" },
    { id: "mk-ctr", name: "CTR medio", value: "12.4%", trendAbs: "+2.1pp", trendPct: "+20.4%", trendDir: "up", positive: true, definition: "Tasa de clics agregada por canal.", formula: "clics / entregados × 100", source: "Email + WhatsApp", freq: "aggregated", period: "Últimos 30 días", accent: "gold", updated: "hace 1 h" },
    { id: "mk-open", name: "Apertura email", value: "38%", trendAbs: "+5pp", trendPct: "+15.2%", trendDir: "up", positive: true, definition: "Aperturas únicas sobre emails entregados.", formula: "aperturas / entregados × 100", source: "Email provider", freq: "aggregated", period: "Últimos 30 días", accent: "teal", updated: "hace 1 h" },
    { id: "mk-conv", name: "Conversión", value: "34%", trendAbs: "+3pp", trendPct: "+9.7%", trendDir: "up", positive: true, definition: "Reservas sobre clics en campaña.", formula: "reservas / clics × 100", source: "Campaigns attribution", freq: "aggregated", period: "Últimos 30 días", accent: "gold", updated: "hace 1 h" },
    { id: "mk-cupones", name: "Cupones canjeados", value: "247", trendAbs: "+38", trendPct: "+18.2%", trendDir: "up", positive: true, definition: "Cupones promocionales validados en POS.", formula: "count(coupon_redeemed = true)", source: "POS + Promotions", freq: "near", period: "Mes", accent: "teal", updated: "hace 5 min" },
    { id: "mk-ing", name: "Ingresos atribuidos", value: "€8.420", trendAbs: "+€1.200", trendPct: "+16.6%", trendDir: "up", positive: true, definition: "Ingresos facturados asociados a reservas atribuidas a campañas.", formula: "sum(revenue WHERE campaign_id IS NOT NULL)", source: "Billing + Campaigns", freq: "aggregated", period: "Últimos 30 días", accent: "gold", updated: "hace 1 h" },
    { id: "mk-cpr", name: "Coste por reserva", value: "€1.20", trendAbs: "−€0.15", trendPct: "−11.1%", trendDir: "down", positive: true, definition: "Coste de campaña dividido entre reservas generadas.", formula: "coste / reservas_generadas", source: "Campaigns", freq: "aggregated", period: "Últimos 30 días", accent: "teal", updated: "hace 1 h" },
  ],
  "Reputación": [
    { id: "rp-google", name: "Google rating", value: "4.6 ★", trendAbs: "+0.1", trendPct: "+2.2%", trendDir: "up", positive: true, definition: "Media ponderada de reseñas en Google.", formula: "avg(google_rating)", source: "Google Business", freq: "near", period: "Últimos 30 días", accent: "gold", updated: "hace 2 h" },
    { id: "rp-ta", name: "TripAdvisor rating", value: "4.4 ★", trendAbs: "+0.1", trendPct: "+2.3%", trendDir: "up", positive: true, definition: "Media de reseñas en TripAdvisor.", formula: "avg(ta_rating)", source: "TripAdvisor", freq: "aggregated", period: "Últimos 30 días", accent: "teal", updated: "hace 4 h" },
    { id: "rp-vol", name: "Volumen reseñas", value: "1.247", trendAbs: "+98", trendPct: "+8.5%", trendDir: "up", positive: true, definition: "Reseñas agregadas en todos los canales.", formula: "count(reviews)", source: "Reviews aggregator", freq: "aggregated", period: "Últimos 30 días", accent: "gold", updated: "hace 2 h" },
    { id: "rp-sent", name: "Sentimiento", value: "89% positivo", trendAbs: "+2pp", trendPct: "+2.3%", trendDir: "up", positive: true, definition: "Proporción de reseñas con sentimiento positivo.", formula: "positive / total × 100", source: "AI Sentiment", freq: "near", period: "Últimos 30 días", accent: "teal", updated: "hace 1 h" },
    { id: "rp-resp", name: "Tiempo respuesta", value: "4.2 h", trendAbs: "−0.6 h", trendPct: "−12.5%", trendDir: "down", positive: true, definition: "Tiempo medio de respuesta a reseñas.", formula: "avg(response_ts − review_ts)", source: "Reviews inbox", freq: "near", period: "Últimos 30 días", accent: "gold", updated: "hace 1 h" },
    { id: "rp-nps", name: "NPS", value: "72", trendAbs: "+4", trendPct: "+5.9%", trendDir: "up", positive: true, definition: "Net Promoter Score = % Promotores − % Detractores.", formula: "%promoters − %detractors", source: "Surveys", freq: "aggregated", period: "Últimos 30 días", accent: "teal", updated: "hace 4 h" },
    { id: "rp-risk", name: "Riesgo reputacional", value: "Bajo", trendAbs: "—", trendPct: "—", trendDir: "flat", positive: true, definition: "Nivel de riesgo reputacional calculado por el motor de sentimiento.", formula: "score(volumen_negativo, sentimiento, tiempo_respuesta)", source: "AI Risk engine", freq: "near", period: "Tiempo real", accent: "gold", updated: "hace 30 min" },
  ],
  "Finanzas": [
    { id: "fn-fact", name: "Facturación", value: "€98.540", trendAbs: "+€4.200", trendPct: "+4.5%", trendDir: "up", positive: true, definition: "Ingresos facturados en el periodo.", formula: "sum(invoice_total)", source: "Billing", freq: "aggregated", period: "Mes", accent: "gold", updated: "hace 1 h" },
    { id: "fn-benef", name: "Beneficio bruto", value: "€70.950", trendAbs: "+€3.100", trendPct: "+4.6%", trendDir: "up", positive: true, definition: "Facturación menos coste de ventas.", formula: "facturación − coste_ventas", source: "Financial ledger", freq: "aggregated", period: "Mes", accent: "teal", updated: "hace 1 h" },
    { id: "fn-marg", name: "Margen", value: "72%", trendAbs: "+0.5pp", trendPct: "+0.7%", trendDir: "up", positive: true, definition: "Beneficio bruto sobre facturación.", formula: "beneficio / facturación × 100", source: "Financial ledger", freq: "aggregated", period: "Mes", accent: "gold", updated: "hace 1 h" },
    { id: "fn-personal", name: "Coste personal", value: "€18.200", trendAbs: "+€600", trendPct: "+3.4%", trendDir: "up", positive: false, definition: "Coste total de personal del periodo.", formula: "sum(salaries + social_charges)", source: "HR + Payroll", freq: "aggregated", period: "Mes", accent: "teal", updated: "hace 1 día" },
    { id: "fn-mesa", name: "Rentabilidad / mesa", value: "€168", trendAbs: "+€8", trendPct: "+5%", trendDir: "up", positive: true, definition: "Beneficio bruto por mesa activa.", formula: "beneficio / mesas_activas", source: "Financial ledger + D1", freq: "aggregated", period: "Mes", accent: "gold", updated: "hace 1 h" },
    { id: "fn-roic", name: "ROI campañas", value: "340%", trendAbs: "+45pp", trendPct: "+15.2%", trendDir: "up", positive: true, definition: "Retorno sobre inversión publicitaria.", formula: "(ingresos_atrib − coste) / coste × 100", source: "Billing + Campaigns", freq: "aggregated", period: "Últimos 30 días", accent: "teal", updated: "hace 1 h" },
    { id: "fn-payback", name: "Payback", value: "3.2 meses", trendAbs: "−0.4 m", trendPct: "−11.1%", trendDir: "down", positive: true, definition: "Tiempo medio de recuperación de la inversión en adquisición.", formula: "CAC / (LTV / 12)", source: "CRM + Billing", freq: "aggregated", period: "12 meses", accent: "gold", updated: "hace 1 día" },
    { id: "fn-breakeven", name: "Punto de equilibrio", value: "€42.000", trendAbs: "+€1.000", trendPct: "+2.4%", trendDir: "up", positive: false, definition: "Facturación mínima para cubrir costes fijos.", formula: "costes_fijos / margen_contribución", source: "Financial ledger", freq: "aggregated", period: "Mes", accent: "teal", updated: "hace 1 día" },
    { id: "fn-desv", name: "Desviación presupuesto", value: "+2.3%", trendAbs: "+0.8pp", trendPct: "—", trendDir: "up", positive: true, definition: "Desviación de la facturación real sobre el presupuesto.", formula: "(real − presupuesto) / presupuesto × 100", source: "Budget + Billing", freq: "aggregated", period: "Mes", accent: "gold", updated: "hace 1 h" },
  ],
};

const COMPARISON_TYPES = [
  { id: "hoy-ayer", label: "Hoy vs Ayer", a: "Hoy", b: "Ayer" },
  { id: "hoy-mismodia", label: "Hoy vs mismo día semana", a: "Hoy (martes)", b: "Martes anterior" },
  { id: "sem-act-ant", label: "Semana actual vs anterior", a: "Semana actual", b: "Semana anterior" },
  { id: "mes-act-ant", label: "Mes actual vs anterior", a: "Mes actual", b: "Mes anterior" },
  { id: "anio-act-ant", label: "Año actual vs anterior", a: "Año actual", b: "Año anterior" },
  { id: "rest-grupo", label: "Restaurante vs grupo", a: "Ramses Madrid", b: "Grupo" },
  { id: "rest-bench", label: "Restaurante vs benchmark", a: "Ramses Madrid", b: "Benchmark sector" },
  { id: "turno-turno", label: "Turno vs turno", a: "Comida", b: "Cena" },
  { id: "canal-canal", label: "Canal vs canal", a: "Web", b: "WhatsApp" },
];

interface ComparisonRow {
  metric: string;
  a: string;
  b: string;
  varAbs: string;
  varPct: string;
  trendDir: TrendDir;
  positive: boolean;
  context: string;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  { metric: "Reservas", a: "47", b: "42", varAbs: "+5", varPct: "+12%", trendDir: "up", positive: true, context: "Mayor afluencia laboral" },
  { metric: "Facturación", a: "€4.100", b: "€3.660", varAbs: "+€440", varPct: "+12%", trendDir: "up", positive: true, context: "Ticket medio estable" },
  { metric: "Ocupación", a: "78%", b: "73%", varAbs: "+5pp", varPct: "+6.8%", trendDir: "up", positive: true, context: "Terraza operativa" },
  { metric: "Ticket medio", a: "€89", b: "€87", varAbs: "+€2", varPct: "+2.3%", trendDir: "up", positive: true, context: "Upsell de postres" },
  { metric: "No-shows", a: "3", b: "4", varAbs: "−1", varPct: "−25%", trendDir: "down", positive: true, context: "Recordatorio WhatsApp" },
  { metric: "Cancelaciones", a: "2", b: "3", varAbs: "−1", varPct: "−33%", trendDir: "down", positive: true, context: "Política de depósito" },
  { metric: "Clientes nuevos", a: "14", b: "11", varAbs: "+3", varPct: "+27%", trendDir: "up", positive: true, context: "Campaña Instagram" },
  { metric: "Clientes recurrentes", a: "28", b: "26", varAbs: "+2", varPct: "+7.7%", trendDir: "up", positive: true, context: "Programa fidelización" },
  { metric: "NPS", a: "72", b: "70", varAbs: "+2", varPct: "+2.9%", trendDir: "up", positive: true, context: "Mejora en tiempos de espera" },
  { metric: "ROI campañas", a: "340%", b: "295%", varAbs: "+45pp", varPct: "+15.2%", trendDir: "up", positive: true, context: "Campaña cumpleaños" },
  { metric: "Coste personal", a: "€620", b: "€580", varAbs: "+€40", varPct: "+6.9%", trendDir: "up", positive: false, context: "Refuerzo terraza" },
  { metric: "Margen", a: "72%", b: "71%", varAbs: "+1pp", varPct: "+1.4%", trendDir: "up", positive: true, context: "Mejor mix de carta" },
];

const HEATMAP_TYPES = [
  { id: "ocupacion", label: "Ocupación", polarity: "good" as const, unit: "%" },
  { id: "ingresos", label: "Ingresos", polarity: "good" as const, unit: "€" },
  { id: "noshows", label: "No-shows", polarity: "bad" as const, unit: "" },
  { id: "ticket", label: "Ticket medio", polarity: "good" as const, unit: "€" },
  { id: "cancelaciones", label: "Cancelaciones", polarity: "bad" as const, unit: "" },
  { id: "vip", label: "Clientes VIP", polarity: "good" as const, unit: "" },
  { id: "rotacion", label: "Rotación", polarity: "good" as const, unit: "×" },
];

const PATTERNS = [
  {
    id: "p1",
    description: "Las reservas caen todos los martes",
    evidence: "−18% vs media semanal · 6 semanas consecutivas",
    action: "Crear campaña para martes",
    icon: TrendingDown,
    accent: "teal" as Accent,
    confidence: 88,
  },
  {
    id: "p2",
    description: "Los jueves la terraza alcanza máxima ocupación",
    evidence: "97% ocupación media · 18:00–22:00",
    action: "Considerar ampliar terraza",
    icon: Flame,
    accent: "gold" as Accent,
    confidence: 91,
  },
  {
    id: "p3",
    description: "Los domingos disminuye el ticket medio",
    evidence: "−€6 vs media · grupos familiares con menú corto",
    action: "Promocionar postres/vinos",
    icon: ReceiptText,
    accent: "teal" as Accent,
    confidence: 79,
  },
  {
    id: "p4",
    description: "El turno de noche tiene más no-shows",
    evidence: "11.4% vs 6.1% en comida · reservas ≥ 20:30",
    action: "Activar depósito para noche",
    icon: UserX,
    accent: "gold" as Accent,
    confidence: 84,
  },
  {
    id: "p5",
    description: "La campaña 'Cumpleaños' genera clientes de mayor LTV",
    evidence: "LTV +€420 vs media · 12 meses",
    action: "Escalar campaña",
    icon: Sparkles,
    accent: "teal" as Accent,
    confidence: 92,
  },
  {
    id: "p6",
    description: "Las reservas de WhatsApp convierten un 28% más que las de teléfono",
    evidence: "Conv. 42% vs 33% · 90 días",
    action: "Priorizar WhatsApp",
    icon: MessageSquare,
    accent: "gold" as Accent,
    confidence: 86,
  },
];

/* =====================================================================
 * Shared helpers
 * ===================================================================== */

function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-amber-300">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      demo
    </span>
  );
}

function InfoDot({ text }: { text: string }) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Definición"
            className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-foreground/20 text-muted-foreground transition-colors hover:border-[var(--gold)]/50 hover:text-[var(--gold)]"
          >
            <Info className="h-2.5 w-2.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed border-border/60">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function TrendPill({
  abs,
  pct,
  dir,
  positive,
}: {
  abs: string;
  pct: string;
  dir: TrendDir;
  positive: boolean;
}) {
  const Icon = dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : Minus;
  const good = positive;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-mono",
        dir === "flat"
          ? "border-foreground/20 bg-foreground/5 text-muted-foreground"
          : good
            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
            : "border-rose-400/40 bg-rose-400/10 text-rose-300"
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{abs}</span>
      <span className="opacity-70">·</span>
      <span>{pct}</span>
    </span>
  );
}

function FreqBadge({ freq }: { freq: Freq }) {
  const map: Record<Freq, { label: string; cls: string; dot: string }> = {
    realtime: {
      label: "Tiempo real",
      cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
      dot: "bg-emerald-400",
    },
    near: {
      label: "Cuasi-real",
      cls: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
      dot: "bg-[var(--teal)]",
    },
    aggregated: {
      label: "Agregado",
      cls: "border-foreground/20 bg-foreground/5 text-muted-foreground",
      dot: "bg-muted-foreground",
    },
  };
  const v = map[freq];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
        v.cls
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", v.dot)} />
      {v.label}
    </span>
  );
}

function SourceBadge({ source, accent = "gold" }: { source: string; accent?: Accent }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
        accent === "gold"
          ? "border-[var(--gold)]/30 bg-[var(--gold)]/8 text-[var(--gold-soft)]"
          : "border-[var(--teal)]/30 bg-[var(--teal)]/8 text-[var(--teal)]"
      )}
    >
      <Database className="h-2.5 w-2.5" />
      {source}
    </span>
  );
}

function MiniBadge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "gold" | "teal" | "amber" | "rose" | "emerald";
}) {
  const tones: Record<string, string> = {
    default: "border-foreground/15 bg-foreground/5 text-muted-foreground",
    gold: "border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
    teal: "border-[var(--teal)]/30 bg-[var(--teal)]/10 text-[var(--teal)]",
    amber: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    rose: "border-rose-400/40 bg-rose-400/10 text-rose-300",
    emerald: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
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
 * SVG mini charts
 * ===================================================================== */

function Sparkline({
  data,
  color = "var(--gold)",
  width = 96,
  height = 28,
  fill = true,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  fill?: boolean;
}) {
  const reduce = useReducedMotion();
  const id = React.useId();
  const { ref: viewRef, inView } = useInView<SVGSVGElement>({ threshold: 0.2 });
  const progress = useEntranceProgress(inView, 700);
  const { ref: lineRef, length } = usePathLength<SVGPathElement>();
  const { dasharray, dashoffset } = drawDash(length, reduce ? 1 : progress);
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1 || 1);
  const pts = data.map((d, i) => {
    const x = i * step;
    const y = height - 2 - ((d - min) / range) * (height - 4);
    return [x, y] as const;
  });
  const linePath = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;
  return (
    <svg
      ref={viewRef}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      {fill && (
        <>
          <defs>
            <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#spark-${id})`} style={{ opacity: reduce ? 1 : progress }} />
        </>
      )}
      <path
        ref={lineRef}
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dasharray}
        strokeDashoffset={dashoffset}
      />
      <circle
        cx={pts[pts.length - 1][0]}
        cy={pts[pts.length - 1][1]}
        r="1.6"
        fill={color}
        style={{ opacity: reduce ? 1 : progress }}
      />
    </svg>
  );
}

function Gauge({ value, max = 100 }: { value: number; max?: number }) {
  const reduce = useReducedMotion();
  const pct = Math.max(0, Math.min(1, value / max));
  const r = 38;
  const cx = 48;
  const cy = 48;
  const circ = Math.PI * r; // half circle
  const dash = circ * pct;
  const { ref: viewRef, inView } = useInView<SVGSVGElement>({ threshold: 0.3 });
  const progress = useEntranceProgress(inView, 700);
  const visibleDash = reduce ? dash : dash * progress;
  return (
    <svg
      ref={viewRef}
      viewBox="0 0 96 60"
      className="w-full max-w-[140px]"
      role="img"
      aria-label={`Ocupación ${value}%`}
    >
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="currentColor"
        className="text-foreground/10"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="url(#gauge-grad)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${visibleDash} ${circ}`}
      />
      <defs>
        <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--teal-deep)" />
          <stop offset="60%" stopColor="var(--teal)" />
          <stop offset="100%" stopColor="var(--gold)" />
        </linearGradient>
      </defs>
      <text x={cx} y={cy - 4} textAnchor="middle" className="fill-foreground font-display" fontSize="18" fontWeight="500">
        {value}%
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" className="fill-muted-foreground font-mono" fontSize="8" letterSpacing="1">
        OCUPACIÓN
      </text>
    </svg>
  );
}

function Donut({
  segments,
  size = 80,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const reduce = useReducedMotion();
  const r = 14;
  const cx = 16;
  const cy = 16;
  const circ = 2 * Math.PI * r;
  const lens = segments.map((s) => (s.value / 100) * circ);
  // Cumulative lengths (start position of each segment along the ring).
  const cumLens: number[] = [];
  let acc = 0;
  for (const l of lens) {
    cumLens.push(acc);
    acc += l;
  }
  const { ref: viewRef, inView } = useInView<SVGSVGElement>({ threshold: 0.3 });
  const progress = useEntranceProgress(inView, 700);
  const p = reduce ? 1 : progress;
  return (
    <svg
      ref={viewRef}
      viewBox="0 0 32 32"
      width={size}
      height={size}
      role="img"
      aria-label="Distribución por canal"
    >
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" className="text-foreground/8" strokeWidth="6" />
      {segments.map((s, i) => {
        const segStart = cumLens[i] / circ; // 0..1
        const segEnd = (cumLens[i] + lens[i]) / circ; // 0..1
        let visibleLen: number;
        if (p >= segEnd) visibleLen = lens[i];
        else if (p <= segStart) visibleLen = 0;
        else visibleLen = (p - segStart) * circ;
        const offset = -cumLens[i];
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="6"
            strokeDasharray={`${visibleLen} ${circ - visibleLen}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="butt"
          />
        );
      })}
    </svg>
  );
}

/* =====================================================================
 * Cockpit tab — welcome, toolbar, filters, widget grid
 * ===================================================================== */

function FilterSelect({
  label,
  value,
  options,
  onChange,
  icon: Icon,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  icon?: React.ElementType;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-border/60 bg-card/40 px-2.5 py-1 text-xs hover:border-[var(--gold)]/40 transition-colors"
        aria-expanded={open}
        aria-label={`${label}: ${value}`}
      >
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}</span>
        <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute z-40 mt-1 min-w-[180px] rp-glass-strong rounded-md border border-border/60 py-1 max-h-[60vh] overflow-y-auto rp-scroll-thin"
            >
              {options.map((o) => (
                <button
                  key={o}
                  onClick={() => {
                    onChange(o);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full min-h-[36px] text-left px-3 py-1.5 text-sm hover:bg-foreground/5 transition-colors",
                    o === value && "text-[var(--gold-soft)] bg-[var(--gold)]/8"
                  )}
                >
                  {o}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function WidgetShell({
  def,
  children,
  visible,
}: {
  def: WidgetDef;
  children: React.ReactNode;
  visible: boolean;
}) {
  const reduce = useReducedMotion();
  const Icon = def.icon;
  const accentColor = def.accent === "gold" ? "var(--gold)" : "var(--teal)";
  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.section
          initial={reduce ? false : { opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="rp-glass rounded-xl p-4 sm:p-5 flex flex-col gap-3 hover:border-foreground/15 transition-colors"
          aria-label={`Widget ${def.title}`}
        >
          <header className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: accentColor }} />
              <span
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground truncate"
                style={{ color: accentColor }}
              >
                {def.title}
              </span>
            </div>
            <InfoDot text={def.definition} />
          </header>
          {children}
          <footer className="flex flex-wrap items-center justify-between gap-2 pt-2 mt-auto border-t border-border/40">
            <div className="flex flex-wrap items-center gap-1.5">
              <FreqBadge freq={def.freq} />
              <SourceBadge source={def.source} accent={def.accent} />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-0.5 text-[11px] text-[var(--gold-soft)] hover:underline"
            >
              Ver detalle
              <ChevronRight className="h-3 w-3" />
            </button>
          </footer>
          <div className="text-[10px] text-muted-foreground/70 font-mono">Actualizado: {def.updated}</div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

function WidgetContent({ id }: { id: string }) {
  switch (id) {
    case "facturacion":
      return (
        <div className="space-y-2">
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="font-display text-3xl sm:text-4xl font-light text-foreground">€4.100</div>
              <div className="text-[11px] text-muted-foreground">previsto hoy</div>
            </div>
            <TrendPill abs="+€440" pct="+12%" dir="up" positive />
          </div>
          <div className="h-8">
            <Sparkline data={[2800, 3100, 2900, 3400, 3600, 3700, 4100]} color="var(--gold)" />
          </div>
          <div className="flex items-center gap-1.5">
            <MiniBadge tone="gold">vs Ayer +12%</MiniBadge>
            <MiniBadge>7 días</MiniBadge>
          </div>
        </div>
      );
    case "reservas":
      return (
        <div className="space-y-2">
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="font-display text-3xl sm:text-4xl font-light text-foreground">47</div>
              <div className="text-[11px] text-muted-foreground">reservas hoy</div>
            </div>
            <TrendPill abs="+5" pct="+12%" dir="up" positive />
          </div>
          <div className="flex items-center gap-3">
            <Donut
              size={64}
              segments={[
                { label: "Web", value: 42, color: "var(--gold)" },
                { label: "Google", value: 28, color: "var(--teal)" },
                { label: "WhatsApp", value: 18, color: "#E8C766" },
                { label: "Phone", value: 12, color: "#2BA89E" },
              ]}
            />
            <ul className="flex-1 space-y-1 text-[11px]">
              {[
                { l: "Web", v: "42%", c: "var(--gold)" },
                { l: "Google", v: "28%", c: "var(--teal)" },
                { l: "WhatsApp", v: "18%", c: "#E8C766" },
                { l: "Phone", v: "12%", c: "#2BA89E" },
              ].map((s) => (
                <li key={s.l} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm" style={{ background: s.c }} />
                  <span className="text-muted-foreground flex-1">{s.l}</span>
                  <span className="font-mono">{s.v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    case "ocupacion":
      return (
        <div className="space-y-1">
          <div className="flex items-center justify-center py-1">
            <Gauge value={78} />
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Mesas ocupadas</span>
            <span className="font-mono text-foreground">
              18<span className="text-muted-foreground">/24</span>
            </span>
          </div>
          <TrendPill abs="+5pp" pct="+6.8%" dir="up" positive />
        </div>
      );
    case "ticket":
      return (
        <div className="space-y-2">
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="font-display text-3xl sm:text-4xl font-light text-foreground">€89</div>
              <div className="text-[11px] text-muted-foreground">por cubierto</div>
            </div>
            <TrendPill abs="+€2" pct="+2.3%" dir="up" positive />
          </div>
          <div className="h-8">
            <Sparkline data={[82, 84, 85, 86, 87, 88, 89]} color="var(--gold)" />
          </div>
          <MiniBadge tone="gold">Upsell postres +8%</MiniBadge>
        </div>
      );
    case "noshows":
      return (
        <div className="space-y-2">
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="font-display text-3xl sm:text-4xl font-light text-foreground">
                3<span className="text-muted-foreground text-base ml-1">(8.2%)</span>
              </div>
              <div className="text-[11px] text-muted-foreground">no-shows hoy</div>
            </div>
            <TrendPill abs="−1" pct="−25%" dir="down" positive />
          </div>
          <div className="h-8">
            <Sparkline data={[5, 4, 6, 4, 3, 4, 3]} color="var(--teal)" />
          </div>
          <MiniBadge tone="emerald">Recordatorio WA activo</MiniBadge>
        </div>
      );
    case "vip":
      return (
        <div className="space-y-2">
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="font-display text-3xl sm:text-4xl font-light text-foreground">8</div>
              <div className="text-[11px] text-muted-foreground">VIP hoy</div>
            </div>
            <MiniBadge tone="gold">
              <Crown className="h-2.5 w-2.5" /> VIP
            </MiniBadge>
          </div>
          <ul className="space-y-1 max-h-32 overflow-y-auto rp-scroll-thin">
            {[
              { n: "Elena Vidal", t: "13:30", m: "Mesa 4" },
              { n: "Carlos Ortiz", t: "14:00", m: "Mesa 12" },
              { n: "Marta Gil", t: "14:15", m: "Mesa 7" },
              { n: "Jordi Soler", t: "20:30", m: "Mesa VIP 1" },
              { n: "Anna Pons", t: "21:00", m: "Mesa VIP 2" },
              { n: "Pau Riera", t: "21:30", m: "Mesa 9" },
              { n: "Núria Mas", t: "22:00", m: "Mesa 14" },
              { n: "Marc Vidal", t: "22:15", m: "Mesa 3" },
            ].map((v, i) => (
              <li key={i} className="flex items-center gap-2 text-[11px] py-0.5">
                <Crown className="h-2.5 w-2.5 text-[var(--gold)] shrink-0" />
                <span className="flex-1 truncate text-foreground">{v.n}</span>
                <span className="font-mono text-muted-foreground">{v.t}</span>
                <span className="font-mono text-muted-foreground/70">{v.m}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case "alertas":
      return (
        <div className="space-y-2">
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="font-display text-3xl sm:text-4xl font-light text-foreground">3</div>
              <div className="text-[11px] text-muted-foreground">alertas activas</div>
            </div>
            <MiniBadge tone="rose">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
              Live
            </MiniBadge>
          </div>
          <ul className="space-y-1.5">
            {[
              { sev: "alta", text: "Cocina: ticket medio cae 8% en cena", tone: "rose" as const, icon: Flame },
              { sev: "media", text: "Inventario: stock de vino tinto bajo", tone: "amber" as const, icon: Database },
              { sev: "media", text: "Finance: desviación presupuesto +2.3%", tone: "amber" as const, icon: ShieldAlert },
            ].map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px]">
                <a.icon className={cn(
                  "h-3 w-3 mt-0.5 shrink-0",
                  a.tone === "rose" ? "text-rose-400" : "text-amber-300"
                )} />
                <span className="flex-1 text-foreground/90">{a.text}</span>
                <MiniBadge tone={a.tone}>{a.sev}</MiniBadge>
              </li>
            ))}
          </ul>
        </div>
      );
    case "forecast":
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <MiniBadge tone="teal">
              <Brain className="h-2.5 w-2.5" /> Predicción
            </MiniBadge>
            <span className="text-[11px] text-muted-foreground font-mono">Confianza 82%</span>
          </div>
          <div className="font-display text-2xl font-light text-foreground">Mañana</div>
          <ul className="space-y-1 text-[11px]">
            <li className="flex justify-between">
              <span className="text-muted-foreground">Reservas</span>
              <span className="font-mono text-foreground">186 <span className="text-muted-foreground">±18</span></span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Facturación</span>
              <span className="font-mono text-foreground">€10.250 <span className="text-muted-foreground">±€1.200</span></span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Camareros</span>
              <span className="font-mono text-foreground">9</span>
            </li>
          </ul>
          <MiniBadge tone="gold">Modelo forecast-v2.1</MiniBadge>
        </div>
      );
    case "recs":
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <MiniBadge tone="gold">
              <Sparkles className="h-2.5 w-2.5" /> Top 3
            </MiniBadge>
            <span className="text-[11px] text-muted-foreground font-mono">vía AI Gateway</span>
          </div>
          <ul className="space-y-2">
            {[
              { t: "Campaña martes para inactivos +60d", imp: "+€340", c: 84 },
              { t: "Upsell de postres en mesas de 4+", imp: "+€2/reserva", c: 72 },
              { t: "Confirmar reservas noche por WhatsApp", imp: "−2 no-shows", c: 88 },
            ].map((r, i) => (
              <li key={i} className="rounded-md border border-border/40 bg-card/30 p-2">
                <div className="flex items-start gap-1.5">
                  <span className="font-mono text-[10px] text-[var(--gold)] mt-0.5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-foreground leading-snug">{r.t}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[var(--teal)]">{r.imp}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">conf. {r.c}%</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      );
    case "rent":
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <MiniBadge tone="amber">Estimado</MiniBadge>
            <span className="text-[11px] text-muted-foreground font-mono">costes reales parciales</span>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="font-display text-3xl sm:text-4xl font-light text-foreground">€2.952</div>
              <div className="text-[11px] text-muted-foreground">beneficio estimado</div>
            </div>
            <TrendPill abs="+€210" pct="+7.7%" dir="up" positive />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Margen</span>
              <span className="font-mono text-[var(--gold-soft)]">72%</span>
            </div>
            <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[var(--teal)] to-[var(--gold)]" style={{ width: "72%" }} />
            </div>
          </div>
        </div>
      );
    case "rep":
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md border border-border/40 bg-card/30 p-2">
              <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <Globe className="h-2.5 w-2.5" /> Google
              </div>
              <div className="mt-1 font-display text-2xl font-light text-foreground">
                4.6<span className="text-[var(--gold)] text-sm"> ★</span>
              </div>
              <div className="text-[10px] text-muted-foreground">1.247 reseñas</div>
            </div>
            <div className="rounded-md border border-border/40 bg-card/30 p-2">
              <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <Award className="h-2.5 w-2.5" /> NPS
              </div>
              <div className="mt-1 font-display text-2xl font-light text-foreground">72</div>
              <div className="text-[10px] text-muted-foreground">+4 vs mes ant.</div>
            </div>
          </div>
          <TrendPill abs="+2" pct="+2.9%" dir="up" positive />
        </div>
      );
    case "staff":
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground">Para mañana</span>
            <MiniBadge tone="gold">Forecast</MiniBadge>
          </div>
          <ul className="space-y-1.5">
            {[
              { role: "Camareros", n: 9, icon: ConciergeBell, c: "var(--gold)" },
              { role: "Cocineros", n: 2, icon: ChefHat, c: "var(--teal)" },
              { role: "Recepcionista", n: 1, icon: UserCheck, c: "var(--gold)" },
            ].map((s) => (
              <li key={s.role} className="flex items-center gap-2 text-[11px]">
                <s.icon className="h-3 w-3 shrink-0" style={{ color: s.c }} />
                <span className="flex-1 text-muted-foreground">{s.role}</span>
                <span className="font-mono text-foreground text-sm">{s.n}</span>
              </li>
            ))}
          </ul>
          <div className="text-[10px] text-muted-foreground font-mono">
            Base: ocupación 85% · 186 reservas
          </div>
        </div>
      );
    default:
      return null;
  }
}

function WelcomeHeader({ period }: { period: Period }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rp-glass rounded-xl p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl sm:text-2xl font-medium text-foreground">
              Buenos días, Ana.
            </h2>
            <DemoBadge />
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            Hoy tienes: <span className="text-foreground font-medium">47 reservas</span> ·{" "}
            <span className="text-foreground font-medium">78% ocupación prevista</span> ·{" "}
            <span className="text-[var(--gold-soft)] font-medium">8 VIP</span> · 2 cumpleaños ·{" "}
            <span className="text-rose-300 font-medium">3 riesgo cancelación</span> ·{" "}
            <span className="text-foreground font-medium">€4.100 facturación prevista</span>.
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            Comparativas:{" "}
            <span className="text-emerald-300 font-mono">+12% vs ayer</span> ·{" "}
            <span className="text-emerald-300 font-mono">+8% vs semana</span> ·{" "}
            <span className="text-emerald-300 font-mono">+15% vs año anterior</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Periodo
          </div>
          <div className="font-display text-lg text-foreground">{period}</div>
          <div className="text-[10px] font-mono text-muted-foreground">
            {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CustomizePanel({
  layout,
  setLayout,
  onClose,
}: {
  layout: Record<string, boolean>;
  setLayout: (v: Record<string, boolean>) => void;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="overflow-hidden"
    >
      <div className="rp-glass rounded-xl p-4 sm:p-5 mt-3 border border-[var(--gold)]/20">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-[var(--gold)]" />
            <h3 className="font-display text-sm font-medium">Personalizar widgets</h3>
            <span className="text-[11px] text-muted-foreground font-mono">
              {Object.values(layout).filter(Boolean).length}/{WIDGETS.length} visibles
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                const all: Record<string, boolean> = {};
                WIDGETS.forEach((w) => (all[w.id] = true));
                setLayout(all);
              }}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Restaurar layout
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
              onClick={onClose}
            >
              <Save className="h-3 w-3 mr-1" />
              Guardar layout
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {WIDGETS.map((w) => (
            <label
              key={w.id}
              className="flex items-center gap-2 rounded-md border border-border/40 bg-card/30 p-2 cursor-pointer hover:border-foreground/20 transition-colors min-h-[44px]"
            >
              <Switch
                checked={!!layout[w.id]}
                onCheckedChange={(checked) =>
                  setLayout({ ...layout, [w.id]: checked })
                }
                aria-label={`Mostrar widget ${w.title}`}
              />
              <w.icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs flex-1">{w.title}</span>
              <span className="text-[10px] font-mono text-muted-foreground uppercase">
                {w.freq === "realtime" ? "RT" : w.freq === "near" ? "NRT" : "AGG"}
              </span>
            </label>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function CockpitTab({
  period,
  setPeriod,
  restaurant,
  setRestaurant,
  zona,
  setZona,
  turno,
  setTurno,
  canal,
  setCanal,
}: {
  period: Period;
  setPeriod: (p: Period) => void;
  restaurant: string;
  setRestaurant: (v: string) => void;
  zona: string;
  setZona: (v: string) => void;
  turno: string;
  setTurno: (v: string) => void;
  canal: string;
  setCanal: (v: string) => void;
}) {
  const [customizing, setCustomizing] = React.useState(false);
  const [layout, setLayout] = React.useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    WIDGETS.forEach((w) => (init[w.id] = true));
    return init;
  });

  return (
    <div className="space-y-4">
      <WelcomeHeader period={period} />

      {/* Toolbar: period selector + filters + customize */}
      <div className="flex flex-wrap items-center gap-2 rp-glass rounded-xl p-2.5">
        <div className="flex items-center rounded-md border border-border/60 p-0.5 overflow-x-auto rp-scroll-thin max-w-full">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "min-h-[32px] rounded px-2.5 py-1 text-xs transition-colors whitespace-nowrap",
                period === p
                  ? "bg-[var(--gold)] text-black font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="hidden sm:block h-6 w-px bg-border/60" />

        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          <FilterSelect label="Restaurante" value={restaurant} options={RESTAURANTS} onChange={setRestaurant} icon={MapPin} />
          <FilterSelect label="Zona" value={zona} options={ZONAS} onChange={setZona} icon={Layers} />
          <FilterSelect label="Turno" value={turno} options={TURNOS} onChange={setTurno} icon={CalendarClock} />
          <FilterSelect label="Canal" value={canal} options={CANALES} onChange={setCanal} icon={Globe} />
        </div>

        <Button
          variant={customizing ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-9 text-xs shrink-0",
            customizing && "bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
          )}
          onClick={() => setCustomizing((v) => !v)}
        >
          <Settings2 className="h-3.5 w-3.5 mr-1.5" />
          Personalizar
        </Button>
      </div>

      <AnimatePresence>
        {customizing && (
          <CustomizePanel
            layout={layout}
            setLayout={setLayout}
            onClose={() => setCustomizing(false)}
          />
        )}
      </AnimatePresence>

      {/* Widget grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 auto-rows-fr">
        {WIDGETS.map((w) => (
          <WidgetShell key={w.id} def={w} visible={!!layout[w.id]}>
            <WidgetContent id={w.id} />
          </WidgetShell>
        ))}
      </div>
    </div>
  );
}

/* =====================================================================
 * KPIs tab — catalog
 * ===================================================================== */

function KpiCard({ kpi, index }: { kpi: KpiItem; index: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3), ease: "easeOut" }}
      className="rp-glass rounded-xl p-4 flex flex-col gap-2.5 hover:border-foreground/15 transition-colors"
    >
      <header className="flex items-start justify-between gap-2">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
          style={{ color: kpi.accent === "gold" ? "var(--gold)" : "var(--teal)" }}
        >
          {kpi.name}
        </span>
        <InfoDot text={kpi.definition} />
      </header>

      <div className="font-display text-2xl sm:text-3xl font-light text-foreground">{kpi.value}</div>

      <TrendPill abs={kpi.trendAbs} pct={kpi.trendPct} dir={kpi.trendDir} positive={kpi.positive} />

      <div className="text-[10px] font-mono text-muted-foreground/80 bg-foreground/5 rounded px-2 py-1 break-all">
        {kpi.formula}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <FreqBadge freq={kpi.freq} />
        <SourceBadge source={kpi.source} accent={kpi.accent} />
      </div>

      <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-muted-foreground">
        <span>Periodo: {kpi.period}</span>
        <span>{kpi.updated}</span>
      </div>

      {kpi.limitations && (
        <div className="flex items-start gap-1 text-[10px] text-amber-300/90 border border-amber-400/20 bg-amber-400/5 rounded px-2 py-1">
          <Info className="h-2.5 w-2.5 mt-0.5 shrink-0" />
          <span>{kpi.limitations}</span>
        </div>
      )}

      <button
        type="button"
        className="mt-auto inline-flex items-center gap-0.5 text-[11px] text-[var(--gold-soft)] hover:underline self-start pt-1"
      >
        Ver desglose
        <ChevronRight className="h-3 w-3" />
      </button>
    </motion.div>
  );
}

function KpisTab() {
  const [category, setCategory] = React.useState<KpiCategory>("Operación");
  const items = KPI_CATALOG[category];
  const cats = Object.keys(KPI_CATALOG) as KpiCategory[];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rp-glass rounded-xl p-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Categoría
          </span>
          <div className="flex items-center rounded-md border border-border/60 p-0.5 overflow-x-auto rp-scroll-thin max-w-full">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "min-h-[32px] rounded px-2.5 py-1 text-xs transition-colors whitespace-nowrap",
                  category === c
                    ? "bg-[var(--gold)] text-black font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <DemoBadge />
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
        <span>
          {items.length} KPIs · catálogo de 150+ métricas
        </span>
        <span>{category} · datos demo</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {items.map((kpi, i) => (
          <KpiCard key={kpi.id} kpi={kpi} index={i} />
        ))}
      </div>
    </div>
  );
}

/* =====================================================================
 * Forecast tab
 * ===================================================================== */

interface ForecastRangeData {
  labels: string[];
  actual: number[];
  /** Previous-period actual values (same length as actual) for comparison tooltip. */
  prevActual: number[];
  forecastLabel: string;
  forecastValue: number;
  bandLo: number;
  bandHi: number;
  /** Previous-period forecast (for tooltip comparison). */
  prevForecast: number;
}

const FORECAST_RANGES: Record<TimeRange, ForecastRangeData> = {
  "7d": {
    labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    actual: [142, 138, 158, 172, 188, 196, 184],
    prevActual: [131, 128, 145, 158, 173, 180, 169],
    forecastLabel: "Mañana",
    forecastValue: 186,
    bandLo: 168,
    bandHi: 204,
    prevForecast: 172,
  },
  "30d": {
    labels: ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10"],
    actual: [980, 1015, 992, 1085, 1120, 1075, 1240, 1185, 1310, 1280],
    prevActual: [902, 945, 920, 1010, 1055, 1010, 1170, 1110, 1225, 1200],
    forecastLabel: "Próx. 3d",
    forecastValue: 1342,
    bandLo: 1180,
    bandHi: 1505,
    prevForecast: 1245,
  },
  "90d": {
    labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12", "W13"],
    actual: [4180, 4320, 4105, 4510, 4720, 4610, 4980, 5240, 5180, 5420, 5510, 5680, 5470],
    prevActual: [3920, 4060, 3870, 4245, 4450, 4340, 4695, 4945, 4880, 5105, 5190, 5355, 5155],
    forecastLabel: "Próx. sem",
    forecastValue: 5840,
    bandLo: 5380,
    bandHi: 6300,
    prevForecast: 5520,
  },
  año: {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
    actual: [18200, 16800, 19500, 21400, 22800, 24100, 26200, 23500, 21800, 25400, 27800, 30100],
    prevActual: [16900, 15600, 18100, 19800, 21100, 22300, 24300, 21800, 20200, 23500, 25700, 27900],
    forecastLabel: "Ene+1",
    forecastValue: 31420,
    bandLo: 28600,
    bandHi: 34200,
    prevForecast: 29050,
  },
};

function ForecastChart() {
  const reduce = useReducedMotion();
  const [range, setRange] = React.useState<TimeRange>("7d");
  const [hidden, setHidden] = React.useState<Set<string>>(new Set());
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const [mousePx, setMousePx] = React.useState<{ x: number; y: number } | null>(null);
  const svgWrapRef = React.useRef<HTMLDivElement>(null);

  const { ref: viewRef, inView } = useInView<SVGSVGElement>({ threshold: 0.2 });
  const progress = useEntranceProgress(inView, 700);
  const { ref: actualPathRef, length: actualLength } = usePathLength<SVGPathElement>();
  const { ref: forecastPathRef, length: forecastLength } = usePathLength<SVGPathElement>();

  const data = FORECAST_RANGES[range];
  const width = 720;
  const height = 280;
  const padL = 44;
  const padR = 16;
  const padT = 24;
  const padB = 36;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const allVals = [...data.actual, data.forecastValue, data.bandLo, data.bandHi];
  const maxV = Math.max(...allVals) * 1.05;
  const minV = Math.min(...allVals) * 0.9;

  // Layout: history occupies first N slots, forecast occupies one extra slot to the right edge.
  const n = data.actual.length;
  const step = innerW / (n - 1);
  const forecastX = width - padR;

  const yOf = (v: number) => padT + innerH - ((v - minV) / (maxV - minV)) * innerH;
  const xOf = (i: number) => padL + i * step;

  const actualPts = data.actual.map((v, i) => [xOf(i), yOf(v)] as const);
  const actualPath = actualPts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const forecastY = yOf(data.forecastValue);
  const forecastPath = `M${actualPts[n - 1][0]},${actualPts[n - 1][1]} L${forecastX},${forecastY}`;
  // Confidence band: triangle from last actual point expanding
  const bandPath = `M${actualPts[n - 1][0]},${actualPts[n - 1][1]} L${forecastX},${yOf(data.bandLo)} L${forecastX},${yOf(data.bandHi)} Z`;

  const yTicks = [minV, (minV + maxV) / 2, maxV];

  const legendItems: LegendItem[] = [
    { id: "actual", label: "Actual", color: "var(--gold)" },
    { id: "forecast", label: "Predicción", color: "var(--teal)", dashed: true },
    { id: "band", label: "Banda confianza", color: "color-mix(in oklab, var(--teal) 30%, transparent)" },
  ];

  function toggle(id: string) {
    setHidden((s) => {
      const n2 = new Set(s);
      if (n2.has(id)) n2.delete(id);
      else n2.add(id);
      return n2;
    });
  }

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const svgX = (px / rect.width) * width;
    // Map svgX to nearest index, considering the forecast point at forecastX
    const distToLast = Math.abs(svgX - actualPts[n - 1][0]);
    const distToForecast = Math.abs(svgX - forecastX);
    if (distToForecast < distToLast && distToForecast < step / 2) {
      setHoverIdx(n); // forecast point index = n
    } else {
      const i = Math.round((svgX - padL) / step);
      if (i >= 0 && i < n) {
        setHoverIdx(i);
      } else {
        setHoverIdx(null);
      }
    }
    setMousePx({ x: px, y: py });
  }

  const { dasharray: actualDash, dashoffset: actualOff } = drawDash(actualLength, reduce ? 1 : progress);
  const { dasharray: forecastDash, dashoffset: forecastOff } = drawDash(forecastLength, reduce ? 1 : progress);

  // Hover dim: if hovering actual, dim forecast/band; if hovering forecast, dim actual/band.
  const hoverKey: "actual" | "forecast" | null = hoverIdx == null ? null : hoverIdx >= n ? "forecast" : "actual";
  const actualOpacity = seriesOpacity(hoverKey, "actual") * (hidden.has("actual") ? 0 : 1);
  const forecastOpacity = seriesOpacity(hoverKey, "forecast") * (hidden.has("forecast") ? 0 : 1);
  // Band is dimmed when hovering either actual or forecast point (it's a contextual fill).
  const bandOpacity = (hoverKey == null ? 1 : 0.5) * (hidden.has("band") ? 0 : 1);

  // Tooltip data
  const hoveredActual = hoverIdx != null && hoverIdx < n ? data.actual[hoverIdx] : null;
  const hoveredActualPrev = hoverIdx != null && hoverIdx < n ? data.prevActual[hoverIdx] : null;
  const hoveredLabel = hoverIdx != null ? (hoverIdx >= n ? data.forecastLabel : data.labels[hoverIdx]) : null;
  const actualDelta =
    hoveredActual != null && hoveredActualPrev != null ? hoveredActual - hoveredActualPrev : null;
  const forecastDelta =
    hoverIdx === n ? data.forecastValue - data.prevForecast : null;

  return (
    <div className="rp-glass rounded-xl p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="font-display text-base font-medium">Forecast · reservas</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Línea dorada = actual · Línea turquesa discontinua = predicción · Banda = confianza
          </p>
        </div>
        <TimeRangeSelector value={range} onChange={setRange} />
      </div>
      <div className="mb-3">
        <ClickableLegend items={legendItems} hidden={hidden} onToggle={toggle} />
      </div>
      <div
        ref={svgWrapRef}
        className="relative overflow-x-auto rp-scroll-thin"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <svg
          ref={viewRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[640px]"
          role="img"
          aria-label={`Forecast ${range === "año" ? "anual" : range} con banda de confianza`}
          onMouseMove={onMove}
          onMouseLeave={() => {
            setHoverIdx(null);
            setMousePx(null);
          }}
        >
          {/* y grid */}
          {yTicks.map((t, i) => {
            const y = yOf(t);
            return (
              <g key={i}>
                <line x1={padL} x2={width - padR} y1={y} y2={y} stroke="currentColor" className="text-foreground/8" strokeDasharray="2 4" />
                <text x={padL - 8} y={y + 3} textAnchor="end" className="fill-muted-foreground font-mono" fontSize="9">
                  {Math.round(t).toLocaleString("es-ES")}
                </text>
              </g>
            );
          })}
          {/* x labels (history) */}
          <AnimatePresence initial={false}>
            <motion.g
              key={`${range}-xaxis`}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {data.labels.map((d, i) => (
                <text
                  key={`${range}-${d}-${i}`}
                  x={xOf(i)}
                  y={height - 12}
                  textAnchor="middle"
                  className="fill-muted-foreground font-mono"
                  fontSize="9"
                >
                  {d}
                </text>
              ))}
              <text x={forecastX} y={height - 12} textAnchor="middle" className="fill-[var(--teal)] font-mono" fontSize="9" fontWeight="600">
                {data.forecastLabel}
              </text>
            </motion.g>
          </AnimatePresence>

          {/* Confidence band */}
          {!hidden.has("band") && (
            <motion.path
              key={`${range}-band`}
              d={bandPath}
              fill="var(--teal)"
              fillOpacity={0.12 * bandOpacity}
              stroke="none"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: bandOpacity * progress }}
              transition={{ duration: 0.4, delay: 0.1 }}
            />
          )}

          {/* Actual line (gold, draw-in via strokeDasharray) */}
          {!hidden.has("actual") && (
            <>
              <motion.path
                key={`${range}-actual`}
                ref={actualPathRef}
                d={actualPath}
                fill="none"
                stroke="var(--gold)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={actualDash}
                strokeDashoffset={actualOff}
                opacity={actualOpacity}
                initial={false}
                animate={{ opacity: actualOpacity }}
                transition={{ duration: 0.2 }}
              />
              {actualPts.map((p, i) => (
                <motion.circle
                  key={`${range}-a${i}`}
                  cx={p[0]}
                  cy={p[1]}
                  r="3"
                  fill="var(--gold)"
                  stroke="var(--background)"
                  strokeWidth="1.5"
                  initial={reduce ? false : { opacity: 0, scale: 0 }}
                  animate={{ opacity: actualOpacity, scale: 1 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.05, 0.5) }}
                  style={{ transformOrigin: `${p[0]}px ${p[1]}px`, transformBox: "view-box" } as React.CSSProperties}
                />
              ))}
            </>
          )}

          {/* Forecast line (dashed teal) */}
          {!hidden.has("forecast") && (
            <>
              <motion.path
                key={`${range}-forecast`}
                ref={forecastPathRef}
                d={forecastPath}
                fill="none"
                stroke="var(--teal)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeDasharray={forecastDash === "" ? "5 4" : forecastDash}
                strokeDashoffset={forecastOff}
                opacity={forecastOpacity}
                initial={false}
                animate={{ opacity: forecastOpacity }}
                transition={{ duration: 0.2 }}
              />
              <motion.circle
                cx={forecastX}
                cy={forecastY}
                r="4"
                fill="var(--teal)"
                stroke="var(--background)"
                strokeWidth="1.5"
                initial={reduce ? false : { opacity: 0, scale: 0 }}
                animate={{ opacity: forecastOpacity, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                style={{ transformOrigin: `${forecastX}px ${forecastY}px`, transformBox: "view-box" } as React.CSSProperties}
              />
              <motion.text
                x={forecastX}
                y={forecastY - 10}
                textAnchor="middle"
                className="fill-[var(--teal)] font-mono"
                fontSize="10"
                fontWeight="600"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: forecastOpacity * progress }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                {data.forecastValue.toLocaleString("es-ES")}
              </motion.text>
            </>
          )}

          {/* Crosshair */}
          {hoverIdx != null && (
            <Crosshair
              x={hoverIdx >= n ? forecastX : xOf(hoverIdx)}
              y1={padT}
              y2={height - padB}
              color={hoverIdx >= n ? "var(--teal)" : "var(--gold)"}
            />
          )}
        </svg>
        <CursorTooltip
          position={{ x: mousePx?.x ?? null, y: mousePx?.y ?? null }}
          containerRef={svgWrapRef}
          estimatedSize={{ width: 200, height: 100 }}
        >
          {hoveredLabel ? (
            <div className="space-y-0.5">
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {hoverIdx != null && hoverIdx >= n ? "Predicción · " : "Actual · "}
                {hoveredLabel}
              </div>
              {hoveredActual != null ? (
                <div className="font-display text-base text-foreground">
                  <span className="text-[var(--gold-soft)]">{hoveredActual.toLocaleString("es-ES")}</span>
                  <span className="text-[10px] text-muted-foreground"> reservas</span>
                </div>
              ) : hoverIdx === n ? (
                <div className="font-display text-base text-foreground">
                  <span className="text-[var(--teal)]">{data.forecastValue.toLocaleString("es-ES")}</span>
                  <span className="text-[10px] text-muted-foreground"> reservas previstas</span>
                </div>
              ) : null}
              {actualDelta != null ? (
                <div className={cn("text-[10px] font-mono", actualDelta >= 0 ? "text-emerald-300" : "text-rose-300")}>
                  {actualDelta >= 0 ? "+" : ""}
                  {actualDelta.toLocaleString("es-ES")} vs período anterior
                </div>
              ) : null}
              {forecastDelta != null ? (
                <div className={cn("text-[10px] font-mono", forecastDelta >= 0 ? "text-emerald-300" : "text-rose-300")}>
                  {forecastDelta >= 0 ? "+" : ""}
                  {forecastDelta.toLocaleString("es-ES")} vs forecast anterior
                </div>
              ) : null}
              {hoverIdx === n && (
                <div className="text-[10px] font-mono text-muted-foreground">
                  Banda: {data.bandLo.toLocaleString("es-ES")}–{data.bandHi.toLocaleString("es-ES")}
                </div>
              )}
            </div>
          ) : null}
        </CursorTooltip>
      </div>
    </div>
  );
}

function ForecastSummaryCard({
  label,
  value,
  confidence,
  margin,
  icon: Icon,
  accent,
  extra,
}: {
  label: string;
  value: string;
  confidence: number;
  margin?: string;
  icon: React.ElementType;
  accent: Accent;
  extra?: string;
}) {
  return (
    <div className="rp-glass rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <Icon className="inline h-3 w-3 mr-1" style={{ color: accent === "gold" ? "var(--gold)" : "var(--teal)" }} />
          {label}
        </span>
        <InfoDot text={`Confianza ${confidence}%`} />
      </div>
      <div className="font-display text-2xl font-light text-foreground">{value}</div>
      {margin && <div className="text-[11px] font-mono text-muted-foreground">±{margin}</div>}
      {extra && <div className="text-[11px] text-muted-foreground">{extra}</div>}
      <div className="mt-1 flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full bg-foreground/10 overflow-hidden">
          <div
            className="h-full"
            style={{
              width: `${confidence}%`,
              background: accent === "gold" ? "var(--gold)" : "var(--teal)",
            }}
          />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">{confidence}%</span>
      </div>
    </div>
  );
}

function ForecastTab() {
  const reduce = useReducedMotion();
  const [recalc, setRecalc] = React.useState(false);

  const variables = [
    "Histórico 30 días",
    "Reservas actuales",
    "Estacionalidad",
    "Clima: 18°C soleado",
    "Eventos: Concierto WiZink",
  ];

  const factors = [
    { label: "Histórico 30 días", pct: 35 },
    { label: "Reservas actuales", pct: 25 },
    { label: "Estacionalidad", pct: 20 },
    { label: "Clima", pct: 10 },
    { label: "Eventos", pct: 10 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rp-glass rounded-xl p-2.5">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-[var(--teal)]" />
          <h3 className="font-display text-sm font-medium">Forecast mañana</h3>
          <MiniBadge tone="teal">forecast-v2.1</MiniBadge>
          <MiniBadge tone="emerald">Accuracy 84%</MiniBadge>
          <MiniBadge tone="gold">Data quality: HIGH</MiniBadge>
        </div>
        <Button
          size="sm"
          className="h-9 text-xs bg-[var(--teal)] text-black hover:bg-[var(--teal-deep)] hover:text-white"
          onClick={() => {
            setRecalc(true);
            setTimeout(() => setRecalc(false), 1500);
          }}
          disabled={recalc}
        >
          <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", recalc && "animate-spin")} />
          {recalc ? "Recalculando…" : "Recalcular"}
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <ForecastSummaryCard label="Reservas previstas" value="186" confidence={82} margin="18" icon={CalendarDays} accent="teal" />
        <ForecastSummaryCard label="Facturación prevista" value="€10.250" confidence={78} margin="€1.200" icon={Banknote} accent="gold" />
        <ForecastSummaryCard label="Ocupación prevista" value="85%" confidence={85} icon={PieChart} accent="teal" />
        <ForecastSummaryCard label="Personal recomendado" value="9 · 2 · 1" confidence={85} icon={ConciergeBell} accent="gold" extra="9 camareros · 2 cocineros · 1 recepcionista" />
        <ForecastSummaryCard label="No-shows previstos" value="12" confidence={70} icon={UserX} accent="gold" />
        <ForecastSummaryCard label="Cancelaciones previstas" value="8" confidence={75} icon={CalendarClock} accent="teal" />
      </div>

      {/* Chart */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <ForecastChart />
      </motion.div>

      {/* Model info + variables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="rp-glass rounded-xl p-4 sm:p-5">
          <h3 className="font-display text-base font-medium mb-3">Factores del modelo</h3>
          <ul className="space-y-2">
            {factors.map((f) => (
              <li key={f.label}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-muted-foreground">{f.label}</span>
                  <span className="font-mono text-foreground">{f.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--teal-deep)] to-[var(--gold)]"
                    style={{ width: `${f.pct * 2.5}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="rp-glass rounded-xl p-4 sm:p-5">
          <h3 className="font-display text-base font-medium mb-3">Variables utilizadas</h3>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {variables.map((v) => (
              <MiniBadge key={v} tone="teal">
                {v}
              </MiniBadge>
            ))}
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Versión modelo</span>
              <span className="font-mono text-foreground">forecast-v2.1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Accuracy histórica</span>
              <span className="font-mono text-[var(--teal)]">84%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Calidad de datos</span>
              <span className="font-mono text-[var(--gold-soft)]">HIGH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Última predicción</span>
              <span className="font-mono text-foreground">hace 15 min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rp-glass rounded-xl p-4 border border-amber-400/20">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-amber-300 mt-0.5 shrink-0" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <span className="text-amber-300 font-medium">Aviso:</span> Las predicciones son
            estimaciones. No son garantías. La confianza refleja la calidad de los datos
            disponibles. Las decisiones de personal y compras deben validar el forecast con
            otros puntos de datos operativos.
          </p>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
 * Comparativas tab
 * ===================================================================== */

function ComparisonChart() {
  const reduce = useReducedMotion();
  const [range, setRange] = React.useState<TimeRange>("30d");
  const [hidden, setHidden] = React.useState<Set<string>>(new Set());
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const [mousePx, setMousePx] = React.useState<{ x: number; y: number } | null>(null);
  const svgWrapRef = React.useRef<HTMLDivElement>(null);

  const { ref: viewRef, inView } = useInView<SVGSVGElement>({ threshold: 0.2 });
  const progress = useEntranceProgress(inView, 700);
  const { ref: aPathRef, length: aLength } = usePathLength<SVGPathElement>();
  const { ref: bPathRef, length: bLength } = usePathLength<SVGPathElement>();

  const width = 720;
  const height = 240;
  const padL = 40;
  const padR = 16;
  const padT = 20;
  const padB = 32;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  // Per-range comparison data — period A vs period B with labels.
  const cmpData: Record<TimeRange, { labels: string[]; a: number[]; b: number[] }> = {
    "7d": {
      labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
      a: [42, 45, 47, 44, 50, 52, 49],
      b: [40, 41, 42, 43, 44, 46, 45],
    },
    "30d": {
      labels: ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11", "S12"],
      a: [42, 45, 47, 44, 50, 52, 49, 53, 55, 51, 54, 47],
      b: [40, 41, 42, 43, 44, 46, 45, 48, 50, 47, 49, 42],
    },
    "90d": {
      labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12", "W13"],
      a: [310, 325, 340, 305, 360, 380, 355, 405, 420, 395, 415, 430, 380],
      b: [290, 305, 315, 290, 340, 355, 335, 380, 395, 375, 390, 405, 360],
    },
    año: {
      labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
      a: [1240, 1180, 1320, 1410, 1520, 1620, 1750, 1580, 1460, 1680, 1820, 1960],
      b: [1180, 1120, 1240, 1340, 1440, 1540, 1660, 1500, 1380, 1590, 1720, 1850],
    },
  };

  const data = cmpData[range];
  const points = data.a.length;
  const maxV = Math.max(...data.a, ...data.b) * 1.1;
  const minV = Math.min(...data.a, ...data.b) * 0.85;
  const step = innerW / (points - 1);
  const yOf = (v: number) => padT + innerH - ((v - minV) / (maxV - minV)) * innerH;
  const xOf = (i: number) => padL + i * step;
  const aPath = data.a.map((v, i) => `${i === 0 ? "M" : "L"}${xOf(i)},${yOf(v)}`).join(" ");
  const bPath = data.b.map((v, i) => `${i === 0 ? "M" : "L"}${xOf(i)},${yOf(v)}`).join(" ");
  const ticks = [minV, (minV + maxV) / 2, maxV];

  const legendItems: LegendItem[] = [
    { id: "a", label: "Periodo actual", color: "var(--gold)" },
    { id: "b", label: "Periodo anterior", color: "var(--teal)" },
  ];

  function toggle(id: string) {
    setHidden((s) => {
      const n2 = new Set(s);
      if (n2.has(id)) n2.delete(id);
      else n2.add(id);
      return n2;
    });
  }

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const svgX = (px / rect.width) * width;
    const i = Math.round((svgX - padL) / step);
    if (i >= 0 && i < points) {
      setHoverIdx(i);
      setMousePx({ x: px, y: py });
    } else {
      setHoverIdx(null);
      setMousePx(null);
    }
  }

  const { dasharray: aDash, dashoffset: aOff } = drawDash(aLength, reduce ? 1 : progress);
  const { dasharray: bDash, dashoffset: bOff } = drawDash(bLength, reduce ? 1 : progress);

  // Legend-controlled visibility (1 = visible, 0 = hidden via toggle).
  const aOpacity = hidden.has("a") ? 0 : 1;
  const bOpacity = hidden.has("b") ? 0 : 1;

  const hoveredA = hoverIdx != null ? data.a[hoverIdx] : null;
  const hoveredB = hoverIdx != null ? data.b[hoverIdx] : null;
  const hoveredLabel = hoverIdx != null ? data.labels[hoverIdx] : null;
  const delta = hoveredA != null && hoveredB != null ? hoveredA - hoveredB : null;
  const deltaPct =
    hoveredA != null && hoveredB != null && hoveredB !== 0
      ? ((hoveredA - hoveredB) / hoveredB) * 100
      : null;

  return (
    <div className="rp-glass rounded-xl p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="font-display text-base font-medium">Evolución comparativa</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Periodo actual vs anterior · {points} puntos
          </p>
        </div>
        <TimeRangeSelector value={range} onChange={setRange} />
      </div>
      <div className="mb-3">
        <ClickableLegend items={legendItems} hidden={hidden} onToggle={toggle} />
      </div>
      <div
        ref={svgWrapRef}
        className="relative overflow-x-auto rp-scroll-thin"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <svg
          ref={viewRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[640px]"
          role="img"
          aria-label="Comparativa Periodo A vs Periodo B"
          onMouseMove={onMove}
          onMouseLeave={() => {
            setHoverIdx(null);
            setMousePx(null);
          }}
        >
          {ticks.map((t, i) => {
            const y = yOf(t);
            return (
              <g key={i}>
                <line x1={padL} x2={width - padR} y1={y} y2={y} stroke="currentColor" className="text-foreground/8" strokeDasharray="2 4" />
                <text x={padL - 8} y={y + 3} textAnchor="end" className="fill-muted-foreground font-mono" fontSize="9">
                  {Math.round(t).toLocaleString("es-ES")}
                </text>
              </g>
            );
          })}
          <AnimatePresence initial={false}>
            <motion.g
              key={`${range}-xaxis`}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {data.labels.map((lab, i) => (
                <text
                  key={`${range}-${lab}-${i}`}
                  x={xOf(i)}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-muted-foreground font-mono"
                  fontSize="9"
                >
                  {lab}
                </text>
              ))}
            </motion.g>
          </AnimatePresence>

          {!hidden.has("b") && (
            <>
              <motion.path
                key={`${range}-b`}
                ref={bPathRef}
                d={bPath}
                fill="none"
                stroke="var(--teal)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={bDash}
                strokeDashoffset={bOff}
                opacity={bOpacity}
                initial={false}
                animate={{ opacity: bOpacity }}
                transition={{ duration: 0.2 }}
              />
              {data.b.map((v, i) => (
                <motion.circle
                  key={`${range}-b-${i}`}
                  cx={xOf(i)}
                  cy={yOf(v)}
                  r="2.5"
                  fill="var(--teal)"
                  opacity={bOpacity}
                  initial={reduce ? false : { opacity: 0, scale: 0 }}
                  animate={{ opacity: bOpacity, scale: 1 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.4) }}
                  style={{ transformOrigin: `${xOf(i)}px ${yOf(v)}px`, transformBox: "view-box" } as React.CSSProperties}
                />
              ))}
            </>
          )}

          {!hidden.has("a") && (
            <>
              <motion.path
                key={`${range}-a`}
                ref={aPathRef}
                d={aPath}
                fill="none"
                stroke="var(--gold)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={aDash}
                strokeDashoffset={aOff}
                opacity={aOpacity}
                initial={false}
                animate={{ opacity: aOpacity }}
                transition={{ duration: 0.2 }}
              />
              {data.a.map((v, i) => (
                <motion.circle
                  key={`${range}-a-${i}`}
                  cx={xOf(i)}
                  cy={yOf(v)}
                  r="2.5"
                  fill="var(--gold)"
                  opacity={aOpacity}
                  initial={reduce ? false : { opacity: 0, scale: 0 }}
                  animate={{ opacity: aOpacity, scale: 1 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.4) }}
                  style={{ transformOrigin: `${xOf(i)}px ${yOf(v)}px`, transformBox: "view-box" } as React.CSSProperties}
                />
              ))}
            </>
          )}

          {hoverIdx != null && (
            <Crosshair x={xOf(hoverIdx)} y1={padT} y2={height - padB} color="var(--gold)" />
          )}
        </svg>
        <CursorTooltip
          position={{ x: mousePx?.x ?? null, y: mousePx?.y ?? null }}
          containerRef={svgWrapRef}
          estimatedSize={{ width: 200, height: 100 }}
        >
          {hoveredLabel && hoveredA != null && hoveredB != null ? (
            <div className="space-y-0.5">
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {hoveredLabel}
              </div>
              <div className="font-display text-sm text-foreground">
                <span className="text-[var(--gold-soft)]">{hoveredA.toLocaleString("es-ES")}</span>
                <span className="text-[10px] text-muted-foreground"> actual</span>
              </div>
              <div className="font-display text-sm text-foreground">
                <span className="text-[var(--teal)]">{hoveredB.toLocaleString("es-ES")}</span>
                <span className="text-[10px] text-muted-foreground"> anterior</span>
              </div>
              {delta != null && (
                <div className={cn("text-[10px] font-mono", delta >= 0 ? "text-emerald-300" : "text-rose-300")}>
                  {delta >= 0 ? "+" : ""}
                  {delta.toLocaleString("es-ES")} ({deltaPct != null ? deltaPct.toFixed(1) : "—"}%)
                </div>
              )}
            </div>
          ) : null}
        </CursorTooltip>
      </div>
    </div>
  );
}

function ComparativasTab() {
  const [typeId, setTypeId] = React.useState(COMPARISON_TYPES[0].id);
  const cmp = COMPARISON_TYPES.find((c) => c.id === typeId) ?? COMPARISON_TYPES[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rp-glass rounded-xl p-2.5">
        <BarChart3 className="h-4 w-4 text-[var(--gold)]" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          Tipo comparativa
        </span>
        <div className="flex items-center rounded-md border border-border/60 p-0.5 overflow-x-auto rp-scroll-thin max-w-full">
          {COMPARISON_TYPES.map((c) => (
            <button
              key={c.id}
              onClick={() => setTypeId(c.id)}
              className={cn(
                "min-h-[32px] rounded px-2.5 py-1 text-xs transition-colors whitespace-nowrap",
                typeId === c.id
                  ? "bg-[var(--gold)] text-black font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI explanation */}
      <div className="rp-glass rounded-xl p-4 border border-[var(--teal)]/20">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-md bg-[var(--teal)]/15 flex items-center justify-center shrink-0">
            <Brain className="h-4 w-4 text-[var(--teal)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--teal)]">
                Explicación IA
              </span>
              <MiniBadge tone="teal">Confianza media</MiniBadge>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">
              Las reservas han caído <span className="text-rose-300 font-medium">18%</span> frente
              al mismo martes del mes anterior. Principal causa: reducción del{" "}
              <span className="text-rose-300 font-medium">31%</span> en reservas de Instagram.
              Recomendación: revisar campaña activa.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Button size="sm" className="h-8 text-xs bg-[var(--teal)] text-black hover:bg-[var(--teal-deep)] hover:text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                Crear acción
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Ver detalles
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison chart */}
      <ComparisonChart />

      {/* Comparison table */}
      <div className="rp-glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-foreground/5">
                <th className="text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-3 py-2.5 min-w-[140px]">Métrica</th>
                <th className="text-right font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-3 py-2.5">{cmp.a}</th>
                <th className="text-right font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-3 py-2.5">{cmp.b}</th>
                <th className="text-right font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-3 py-2.5 min-w-[100px]">Var. abs.</th>
                <th className="text-right font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-3 py-2.5">Var. %</th>
                <th className="text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-3 py-2.5">Tendencia</th>
                <th className="text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-3 py-2.5 min-w-[160px]">Contexto</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((r, i) => (
                <tr key={r.metric} className={cn("border-b border-border/40 hover:bg-foreground/[0.02]", i % 2 === 1 && "bg-foreground/[0.015]")}>
                  <td className="px-3 py-2.5 font-medium text-foreground">{r.metric}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-foreground">{r.a}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-muted-foreground">{r.b}</td>
                  <td className={cn("px-3 py-2.5 text-right font-mono", r.positive ? "text-emerald-300" : "text-rose-300")}>{r.varAbs}</td>
                  <td className={cn("px-3 py-2.5 text-right font-mono", r.positive ? "text-emerald-300" : "text-rose-300")}>{r.varPct}</td>
                  <td className="px-3 py-2.5 text-center">
                    {r.trendDir === "up" ? (
                      <ArrowUpRight className={cn("h-4 w-4 inline", r.positive ? "text-emerald-300" : "text-rose-300")} />
                    ) : r.trendDir === "down" ? (
                      <ArrowDownRight className={cn("h-4 w-4 inline", r.positive ? "text-emerald-300" : "text-rose-300")} />
                    ) : (
                      <Minus className="h-4 w-4 inline text-muted-foreground" />
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-[11px] text-muted-foreground">{r.context}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
 * Heatmaps tab
 * ===================================================================== */

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function heatValue(metricId: string, day: number, hour: number): number {
  let v = 0;
  // Lunch peak 13-15
  v += Math.exp(-Math.pow(hour - 14, 2) / 6) * 0.8;
  // Dinner peak 20-22
  v += Math.exp(-Math.pow(hour - 21, 2) / 5) * 0.95;
  // Late night / early morning floor
  if (hour < 11) v *= 0.15;
  if (hour >= 0 && hour <= 5) v = 0.04 + Math.random() * 0.02;
  // Weekend bonus
  const weekend = day >= 5 ? 0.18 : 0;
  // Tuesday dip
  const tueDip = day === 1 ? -0.28 : 0;
  // Thursday terraza peak
  const thuPeak = day === 3 ? 0.12 : 0;
  // Sunday ticket dip
  const sunDip = day === 6 ? -0.05 : 0;
  v = v + weekend + tueDip + thuPeak + sunDip;

  if (metricId === "noshows" || metricId === "cancelaciones") {
    v = v * 0.5 + (hour >= 19 ? 0.55 : 0.12) + (day >= 5 ? 0.12 : 0) + Math.sin(day * 0.7) * 0.06;
  }
  if (metricId === "ticket") {
    v = v * 0.55 + (hour >= 19 ? 0.32 : 0.15) + (day === 6 ? -0.1 : 0.05);
  }
  if (metricId === "vip") {
    v = v * 0.35 + (hour >= 20 ? 0.45 : 0.06) + (day >= 5 ? 0.15 : 0);
  }
  if (metricId === "rotacion") {
    v = v * 1.1;
  }
  if (metricId === "ingresos") {
    v = v * 0.9 + (hour >= 19 ? 0.2 : 0.05);
  }

  return Math.max(0, Math.min(1, v));
}

function heatColor(v: number, polarity: "good" | "bad"): string {
  const a = 0.06 + v * 0.92;
  if (polarity === "bad") return `rgba(248, 113, 113, ${a})`;
  // mix teal→gold gradient by intensity
  if (v < 0.55) {
    // teal to gold blend
    const t = v / 0.55;
    const r = Math.round(61 + (212 - 61) * t);
    const g = Math.round(214 + (175 - 214) * t);
    const b = Math.round(201 + (55 - 201) * t);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return `rgba(212, 175, 55, ${a})`;
}

function Heatmap({ metricId, polarity, unit }: { metricId: string; polarity: "good" | "bad"; unit: string }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = React.useState<{ d: number; h: number; v: number } | null>(null);
  const { ref: viewRef, inView } = useInView<SVGSVGElement>({ threshold: 0.15 });
  const progress = useEntranceProgress(inView, 600);
  const cellW = 26;
  const cellH = 24;
  const labelW = 44;
  const totalW = labelW + 24 * cellW + 8;

  return (
    <div className="rp-glass rounded-xl p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="font-display text-base font-medium">Heatmap 7 días × 24 horas</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Intensidad según valor del métrico · pasa el ratón para detalle
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
          <span>Bajo</span>
          <div className="h-2 w-24 rounded-full overflow-hidden flex">
            {[0.05, 0.2, 0.4, 0.6, 0.8, 1].map((v) => (
              <div key={v} className="flex-1" style={{ background: heatColor(v, polarity) }} />
            ))}
          </div>
          <span>Alto</span>
        </div>
      </div>

      <div className="relative overflow-x-auto rp-scroll-thin">
        <svg
          ref={viewRef}
          width={totalW}
          height={28 + 7 * cellH + 16}
          viewBox={`0 0 ${totalW} ${28 + 7 * cellH + 16}`}
          role="img"
          aria-label={`Heatmap de ${metricId}`}
        >
          {/* Hour labels (top) */}
          {Array.from({ length: 24 }).map((_, h) => (
            <text
              key={h}
              x={labelW + h * cellW + cellW / 2}
              y={18}
              textAnchor="middle"
              className="fill-muted-foreground font-mono"
              fontSize="8"
              opacity={reduce ? 1 : progress}
            >
              {h % 3 === 0 ? `${h}h` : ""}
            </text>
          ))}

          {/* Day rows */}
          {DAYS.map((d, di) => {
            // Row-by-row staggered entrance via opacity (transform/opacity only).
            const rowDelay = di * 0.06;
            const rowProgress = reduce ? 1 : Math.max(0, Math.min(1, (progress - rowDelay) / Math.max(0.0001, 1 - rowDelay)));
            return (
              <g key={d} style={{ opacity: rowProgress, transition: reduce ? undefined : "opacity 400ms ease-out" }}>
                <text
                  x={labelW - 6}
                  y={28 + di * cellH + cellH / 2 + 3}
                  textAnchor="end"
                  className="fill-muted-foreground font-mono"
                  fontSize="9"
                >
                  {d}
                </text>
                {Array.from({ length: 24 }).map((_, h) => {
                  const v = heatValue(metricId, di, h);
                  const x = labelW + h * cellW + 1;
                  const y = 28 + di * cellH + 1;
                  const isHover = hover?.d === di && hover?.h === h;
                  const dimmed = hover != null && (hover.d !== di || hover.h !== h) ? 0.55 : 1;
                  return (
                    <rect
                      key={h}
                      x={x}
                      y={y}
                      width={cellW - 2}
                      height={cellH - 2}
                      rx="2"
                      fill={heatColor(v, polarity)}
                      stroke={isHover ? "var(--gold)" : "transparent"}
                      strokeWidth={isHover ? 1.5 : 0}
                      className="cursor-pointer transition-[stroke,opacity]"
                      style={{ opacity: dimmed, transitionDuration: "150ms" }}
                      onMouseEnter={() => setHover({ d: di, h, v })}
                      onMouseLeave={() => setHover(null)}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip */}
        {hover && (
          <div
            className="absolute pointer-events-none rp-glass-strong rounded-md border border-[var(--gold)]/40 px-2.5 py-1.5 text-[11px] z-10"
            style={{
              left: Math.min(labelW + hover.h * cellW + cellW, totalW - 100),
              top: 28 + hover.d * cellH - 28,
            }}
          >
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {DAYS[hover.d]} · {hover.h}:00–{hover.h + 1}:00
            </div>
            <div className="font-display text-sm text-foreground">
              {unit === "€" && "€"}
              {Math.round(hover.v * (metricId === "ocupacion" ? 100 : metricId === "ticket" ? 95 : metricId === "ingresos" ? 480 : metricId === "rotacion" ? 4 : 8))}
              {unit === "%" && "%"}
              {unit === "×" && "×"}
              {unit === "" && " casos"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HeatmapsTab() {
  const [typeId, setTypeId] = React.useState(HEATMAP_TYPES[0].id);
  const t = HEATMAP_TYPES.find((x) => x.id === typeId) ?? HEATMAP_TYPES[0];
  const reduce = useReducedMotion();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rp-glass rounded-xl p-2.5">
        <Flame className="h-4 w-4 text-[var(--gold)]" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          Tipo heatmap
        </span>
        <div className="flex items-center rounded-md border border-border/60 p-0.5 overflow-x-auto rp-scroll-thin max-w-full">
          {HEATMAP_TYPES.map((h) => (
            <button
              key={h.id}
              onClick={() => setTypeId(h.id)}
              className={cn(
                "min-h-[32px] rounded px-2.5 py-1 text-xs transition-colors whitespace-nowrap",
                typeId === h.id
                  ? "bg-[var(--gold)] text-black font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      <Heatmap metricId={t.id} polarity={t.polarity} unit={t.unit} />

      {/* Pattern detection */}
      <div className="rp-glass rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-[var(--teal)]" />
            <h3 className="font-display text-base font-medium">Detección de patrones (IA)</h3>
            <MiniBadge tone="teal">6 patrones</MiniBadge>
          </div>
          <DemoBadge />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PATTERNS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.06, 0.4), ease: "easeOut" }}
              className="rounded-lg border border-border/40 bg-card/30 p-3 flex flex-col gap-2"
            >
              <div className="flex items-start gap-2">
                <div
                  className="h-7 w-7 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    background: p.accent === "gold" ? "color-mix(in oklab, var(--gold) 15%, transparent)" : "color-mix(in oklab, var(--teal) 15%, transparent)",
                  }}
                >
                  <p.icon
                    className="h-3.5 w-3.5"
                    style={{ color: p.accent === "gold" ? "var(--gold)" : "var(--teal)" }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug font-medium">{p.description}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{p.evidence}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-border/40">
                <span className="text-[10px] font-mono text-muted-foreground">
                  Confianza <span className="text-foreground">{p.confidence}%</span>
                </span>
                <Button
                  size="sm"
                  className={cn(
                    "h-7 text-[11px]",
                    p.accent === "gold"
                      ? "bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
                      : "bg-[var(--teal)] text-black hover:bg-[var(--teal-deep)] hover:text-white"
                  )}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Crear acción
                </Button>
              </div>
              <div className="text-[11px] text-[var(--gold-soft)] flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {p.action}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
 * Main export — ExecCockpit
 * ===================================================================== */

export function ExecCockpit() {
  const [tab, setTab] = React.useState<string>("cockpit");
  const [period, setPeriod] = React.useState<Period>("Hoy");
  const [restaurant, setRestaurant] = React.useState(RESTAURANTS[0]);
  const [zona, setZona] = React.useState(ZONAS[0]);
  const [turno, setTurno] = React.useState(TURNOS[0]);
  const [canal, setCanal] = React.useState(CANALES[0]);
  const reduce = useReducedMotion();

  const tabs = [
    { id: "cockpit", label: "Cockpit", icon: GaugeIcon },
    { id: "kpis", label: "KPIs", icon: BarChart3 },
    { id: "forecast", label: "Forecast", icon: Brain },
    { id: "comparativas", label: "Comparativas", icon: TrendingUp },
    { id: "heatmaps", label: "Heatmaps", icon: Flame },
  ] as const;

  return (
    <div className="min-h-screen rp-grid-bg">
      <div className="mx-auto max-w-[1600px] p-3 sm:p-4 lg:p-6 space-y-4">
        {/* Header */}
        <motion.header
          initial={reduce ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-between gap-3 rp-glass-strong rounded-2xl p-4 sm:p-5"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] flex items-center justify-center shrink-0 rp-glow-gold">
              <GaugeIcon className="h-5 w-5 text-black" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-xl sm:text-2xl font-medium text-foreground truncate">
                  Executive Control Center
                </h1>
                <DemoBadge />
                <MiniBadge tone="gold">RestoPanel</MiniBadge>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                Centro de inteligencia ejecutivo · BI · KPIs · Forecast · Comparativas · Heatmaps
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live sync
            </div>
            <Button variant="outline" size="sm" className="h-9 text-xs">
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
            <Button variant="outline" size="sm" className="h-9 text-xs">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </div>
        </motion.header>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <div className="overflow-x-auto rp-scroll-thin -mx-1 px-1">
            <TabsList className="h-auto bg-card/40 border border-border/60 p-1 inline-flex w-max min-w-full">
              {tabs.map((t) => (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className="min-h-[40px] px-3 sm:px-4 py-2 text-xs sm:text-sm"
                >
                  <t.icon className="h-3.5 w-3.5 sm:mr-1.5" />
                  <span className="hidden xs:inline sm:inline">{t.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="cockpit" className="mt-4">
            <CockpitTab
              period={period}
              setPeriod={setPeriod}
              restaurant={restaurant}
              setRestaurant={setRestaurant}
              zona={zona}
              setZona={setZona}
              turno={turno}
              setTurno={setTurno}
              canal={canal}
              setCanal={setCanal}
            />
          </TabsContent>

          <TabsContent value="kpis" className="mt-4">
            <KpisTab />
          </TabsContent>

          <TabsContent value="forecast" className="mt-4">
            <ForecastTab />
          </TabsContent>

          <TabsContent value="comparativas" className="mt-4">
            <ComparativasTab />
          </TabsContent>

          <TabsContent value="heatmaps" className="mt-4">
            <HeatmapsTab />
          </TabsContent>
        </Tabs>

        {/* Footer status bar */}
        <footer className="rp-glass rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-muted-foreground">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Tiempo real
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--teal)]" />
              Cuasi-real
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              Agregado
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>Sincronizado: hace 30 s</span>
            <span>·</span>
            <span>Periodo: {period}</span>
            <span>·</span>
            <span>RestoPanel Executive · demo</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
