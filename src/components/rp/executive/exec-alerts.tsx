"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  BellRing, Activity, ShieldAlert, Megaphone,
  Star, Plug, Gauge, Clock, CheckCircle2, ChevronDown,
  XCircle, Zap, Play, Pause, X,
  TrendingDown, Euro, Info, Eye, ListTodo,
  Sparkles,
} from "lucide-react";

/* ============================================================
   Types
============================================================ */

type AlertCategory =
  | "operational"
  | "financial"
  | "marketing"
  | "reputation"
  | "security"
  | "integration"
  | "performance";

type AlertSeverity = "critical" | "high" | "medium" | "low";
type AlertStatus = "active" | "acknowledged" | "resolved" | "snoozed";

interface AlertHistoryEntry {
  ts: string;
  status: AlertStatus;
  note?: string;
}

interface ExecutiveAlert {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  probableCause: string;
  impact: string;
  assignee?: string;
  dueDate?: string;
  dueInHours?: number;
  dueOverdue?: boolean;
  suggestedAction: string;
  createdAt: string;
  canConvertToTask: boolean;
  history: AlertHistoryEntry[];
  resolution?: string;
}

interface AiRecommendation {
  id: string;
  title: string;
  rationale: string;
  supportingData: string;
  expectedImpact: string;
  risk: "bajo" | "medio" | "alto";
  estimatedCost: string;
  priority: "alta" | "media" | "baja";
  confidence: number;
  actionLabel: string;
  status: "pending" | "executed" | "rejected" | "measured";
  measuredResult?: string;
}

/* ============================================================
   Meta maps
============================================================ */

const CATEGORY_META: Record<
  AlertCategory,
  { label: string; icon: React.ElementType; color: string; bg: string; border: string }
> = {
  operational: {
    label: "Operativa",
    icon: Activity,
    color: "text-[var(--teal)]",
    bg: "bg-[var(--teal)]/10",
    border: "border-[var(--teal)]/30",
  },
  financial: {
    label: "Financiera",
    icon: Euro,
    color: "rp-gold-text",
    bg: "bg-[var(--gold)]/10",
    border: "border-[var(--gold)]/30",
  },
  marketing: {
    label: "Marketing",
    icon: Megaphone,
    color: "text-fuchsia-300",
    bg: "bg-fuchsia-400/10",
    border: "border-fuchsia-400/30",
  },
  reputation: {
    label: "Reputación",
    icon: Star,
    color: "text-amber-300",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
  },
  security: {
    label: "Seguridad",
    icon: ShieldAlert,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
  integration: {
    label: "Integración",
    icon: Plug,
    color: "text-sky-300",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
  },
  performance: {
    label: "Rendimiento",
    icon: Gauge,
    color: "text-zinc-300",
    bg: "bg-zinc-400/10",
    border: "border-zinc-400/30",
  },
};

const SEVERITY_META: Record<
  AlertSeverity,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  critical: {
    label: "Crítica",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/40",
    dot: "bg-red-500",
  },
  high: {
    label: "Alta",
    color: "text-amber-300",
    bg: "bg-amber-400/10",
    border: "border-amber-400/40",
    dot: "bg-amber-400",
  },
  medium: {
    label: "Media",
    color: "rp-gold-text",
    bg: "bg-[var(--gold)]/10",
    border: "border-[var(--gold)]/40",
    dot: "bg-[var(--gold)]",
  },
  low: {
    label: "Baja",
    color: "text-zinc-400",
    bg: "bg-zinc-400/10",
    border: "border-zinc-400/40",
    dot: "bg-zinc-400",
  },
};

const STATUS_META: Record<AlertStatus, { label: string; color: string; bg: string; border: string }> = {
  active: {
    label: "Activa",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/40",
  },
  acknowledged: {
    label: "Reconocida",
    color: "text-amber-300",
    bg: "bg-amber-400/10",
    border: "border-amber-400/40",
  },
  resolved: {
    label: "Resuelta",
    color: "text-emerald-300",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/40",
  },
  snoozed: {
    label: "Pospuesta",
    color: "text-zinc-400",
    bg: "bg-zinc-400/10",
    border: "border-zinc-400/40",
  },
};

/* ============================================================
   Demo data — 12 alerts
============================================================ */

const INITIAL_ALERTS: ExecutiveAlert[] = [
  {
    id: "ALT-001",
    category: "financial",
    severity: "critical",
    status: "active",
    title: "Facturación -18% vs mismo día",
    description:
      "La facturación de hoy es un 18% inferior al mismo martes del mes pasado. Principal driver: caída en reservas procedentes de Instagram.",
    probableCause: "Caída reservas Instagram -31% (campaña pausada 8 ene)",
    impact: "-€840 ingresos estimados",
    suggestedAction: "Reactivar campaña Instagram 'Enero sin reservas'",
    dueDate: "Hoy 23:59",
    dueInHours: 8,
    createdAt: "hace 2 h",
    canConvertToTask: true,
    history: [
      { ts: "hace 2 h", status: "active", note: "Detectada por Analytics Engine" },
    ],
  },
  {
    id: "ALT-002",
    category: "operational",
    severity: "high",
    status: "active",
    title: "No-shows +27% esta semana",
    description:
      "El ratio de no-shows en el turno de noche ha subido al 14% (vs 11% media semanal). 3 reservas perdidas por día en promedio.",
    probableCause: "Sin depósito en turno noche · sin confirmación WhatsApp",
    impact: "3 reservas perdidas/día",
    suggestedAction: "Activar depósito noche + recordatorio WhatsApp automático",
    createdAt: "hace 3 h",
    canConvertToTask: true,
    history: [
      { ts: "hace 3 h", status: "active", note: "Umbral 12% superado" },
    ],
  },
  {
    id: "ALT-003",
    category: "reputation",
    severity: "high",
    status: "active",
    title: "Google Rating: 4.9 → 4.6",
    description:
      "El rating medio de Google ha bajado de 4.9 a 4.6 en los últimos 7 días. 2 reseñas negativas (1★ y 2★) sobre tiempo de espera en sala.",
    probableCause: "2 reseñas negativas por tiempo de espera en hora punta",
    impact: "Pérdida estimada 8 reservas/semana",
    suggestedAction: "Optimizar flujo sala hora punta + responder reseñas con IA",
    createdAt: "hace 5 h",
    canConvertToTask: true,
    history: [
      { ts: "hace 5 h", status: "active", note: "Caída detectada" },
    ],
  },
  {
    id: "ALT-004",
    category: "operational",
    severity: "medium",
    status: "active",
    title: "Ocupación prevista 62% (objetivo 75%)",
    description:
      "Para el próximo martes, la ocupación prevista es del 62% frente al objetivo del 75%. Margen de 13 puntos por cubrir.",
    probableCause: "Baja demanda histórica de los martes",
    impact: "-€340 ingresos vs objetivo",
    suggestedAction: "Crear campaña martes con promoción específica",
    createdAt: "hace 1 h",
    canConvertToTask: true,
    history: [
      { ts: "hace 1 h", status: "active", note: "Predicción IA" },
    ],
  },
  {
    id: "ALT-005",
    category: "financial",
    severity: "high",
    status: "active",
    title: "Coste personal +12% sobre presupuesto",
    description:
      "El coste de personal del mes supera el presupuesto en un 12%. Causa principal: horas extra no planificadas en los últimos 4 servicios.",
    probableCause: "Horas extra no planificadas (4 servicios)",
    impact: "+€420 sobre presupuesto",
    suggestedAction: "Revisar planificación de turnos con el responsable de sala",
    createdAt: "hace 6 h",
    canConvertToTask: true,
    assignee: "Carlos Pérez",
    history: [
      { ts: "hace 6 h", status: "active", note: "Umbral 10% superado" },
    ],
  },
  {
    id: "ALT-006",
    category: "integration",
    severity: "critical",
    status: "active",
    title: "Conexión Google Reserve desconectada",
    description:
      "La integración con Google Reserve está desconectada desde hace 47 minutos. Las nuevas reservas desde Google no se están sincronizando.",
    probableCause: "Token OAuth expirado",
    impact: "Pérdida de reservas desde Google Reserve",
    suggestedAction: "Reautorizar conexión OAuth",
    dueDate: "En 2 h",
    dueInHours: 2,
    createdAt: "hace 47 min",
    canConvertToTask: false,
    history: [
      { ts: "hace 47 min", status: "active", note: "Webhook fallido" },
    ],
  },
  {
    id: "ALT-007",
    category: "security",
    severity: "medium",
    status: "acknowledged",
    title: "3 intentos de login fallidos desde IP 84.124.x.x",
    description:
      "Se han registrado 3 intentos de login fallidos desde una IP no habitual en los últimos 10 minutos. Patrón sospechoso de fuerza bruta.",
    probableCause: "Posible ataque de fuerza bruta",
    impact: "Riesgo de compromiso de cuenta",
    suggestedAction: "Verificar actividad y bloquear IP si es necesario",
    createdAt: "hace 12 min",
    canConvertToTask: false,
    assignee: "Sistema (auto)",
    history: [
      { ts: "hace 12 min", status: "active", note: "Detectado por SIEM" },
      { ts: "hace 8 min", status: "acknowledged", note: "Revisando logs" },
    ],
  },
  {
    id: "ALT-008",
    category: "performance",
    severity: "low",
    status: "active",
    title: "Latencia API p99: 156ms (objetivo <100ms)",
    description:
      "La latencia p99 de la API ha superado el objetivo de 100ms durante los últimos 30 minutos. Afecta principalmente a queries de reservas.",
    probableCause: "Queries D1 lentas en /reservations/search",
    impact: "Experiencia lenta en panel de reservas",
    suggestedAction: "Revisar queries D1 lentas y añadir índices",
    createdAt: "hace 30 min",
    canConvertToTask: true,
    history: [
      { ts: "hace 30 min", status: "active", note: "Umbral 150ms superado" },
    ],
  },
  {
    id: "ALT-009",
    category: "marketing",
    severity: "medium",
    status: "active",
    title: "Consumo IA +15% sobre límite mensual",
    description:
      "El consumo de IA del mes supera el límite contratado en un 15%. Se proyecta un coste adicional de €38 al cierre del mes.",
    probableCause: "Aumento de consultas al asistente ejecutivo",
    impact: "+€38 coste adicional estimado",
    suggestedAction: "Ajustar límite o subir de plan",
    createdAt: "hace 4 h",
    canConvertToTask: false,
    history: [
      { ts: "hace 4 h", status: "active", note: "Umbral 110% superado" },
    ],
  },
  {
    id: "ALT-010",
    category: "operational",
    severity: "high",
    status: "active",
    title: "3 mesas en limpieza >15 min",
    description:
      "Las mesas 4, 9 y 12 llevan más de 15 minutos en estado de limpieza. Hay 2 reservas esperando mesa.",
    probableCause: "Personal de limpieza en pausa",
    impact: "2 reservas esperando · -€180 ingresos",
    suggestedAction: "Notificar al responsable de limpieza inmediatamente",
    createdAt: "hace 18 min",
    canConvertToTask: true,
    history: [
      { ts: "hace 18 min", status: "active", note: "Umbral 15 min superado" },
    ],
  },
  {
    id: "ALT-011",
    category: "financial",
    severity: "medium",
    status: "resolved",
    title: "Stripe webhook retrasado 8 min",
    description:
      "El webhook de Stripe llegó con 8 minutos de retraso. La factura #INV-2025-0142 no se actualizó a tiempo.",
    probableCause: "Latencia pico en endpoint webhook",
    impact: "Factura temporalmente sin actualizar",
    suggestedAction: "Reprocesar webhook manualmente",
    createdAt: "hace 1 h",
    canConvertToTask: false,
    resolution: "Reprocesado manualmente · webhook confirmado a las 11:47",
    history: [
      { ts: "hace 1 h", status: "active", note: "Webhook retrasado" },
      { ts: "hace 55 min", status: "acknowledged", note: "Investigando" },
      { ts: "hace 30 min", status: "resolved", note: "Reprocesado manualmente" },
    ],
  },
  {
    id: "ALT-012",
    category: "reputation",
    severity: "low",
    status: "active",
    title: "1 reseña sin responder >48h",
    description:
      "Hay una reseña de 3 estrellas en Google sin responder desde hace más de 48 horas. Política interna: responder en menos de 24h.",
    probableCause: "Sin responsable de reseñas asignado este fin de semana",
    impact: "Reducción de NPS y reputación",
    suggestedAction: "Responder con IA sugerida (revisar antes de enviar)",
    createdAt: "hace 49 h",
    canConvertToTask: true,
    history: [
      { ts: "hace 49 h", status: "active", note: "Nueva reseña recibida" },
    ],
  },
];

const INITIAL_RECS: AiRecommendation[] = [
  {
    id: "rec-1",
    title: "Recuperar 14 clientes VIP inactivos",
    rationale:
      "14 VIPs con LTV medio €3.840 sin visita en 60+ días. WhatsApp personalizado tiene 57% de recuperación histórica.",
    supportingData: "CRM + Billing · últimos 90 días",
    expectedImpact: "+€2.380 ingresos · +8 reservas",
    risk: "bajo",
    estimatedCost: "€0 (WhatsApp incluido en plan)",
    priority: "alta",
    confidence: 82,
    actionLabel: "Enviar WhatsApp a 14 VIPs",
    status: "pending",
  },
  {
    id: "rec-2",
    title: "Lanzar campaña para martes",
    rationale:
      "Ocupación prevista del martes 62% vs objetivo 75%. Promoción histórica de martes ha generado +18% reservas.",
    supportingData: "Heatmaps + histórico campañas",
    expectedImpact: "+€340 ingresos · +5 reservas",
    risk: "bajo",
    estimatedCost: "€45 (presupuesto Meta Ads)",
    priority: "media",
    confidence: 84,
    actionLabel: "Crear campaña martes",
    status: "pending",
  },
  {
    id: "rec-3",
    title: "Reactivar campaña Instagram",
    rationale:
      "La pausa de la campaña 'Enero sin reservas' el 8 ene explica el 68% de la caída de reservas. Reactivar coste cero.",
    supportingData: "Attribution + Instagram Ads API",
    expectedImpact: "+€840 ingresos · recupera -18%",
    risk: "bajo",
    estimatedCost: "€80 (presupuesto Instagram Ads)",
    priority: "alta",
    confidence: 88,
    actionLabel: "Reactivar campaña",
    status: "pending",
  },
  {
    id: "rec-4",
    title: "Activar depósito para turno noche",
    rationale:
      "El turno noche tiene 14% de no-shows vs 6% media. Depósito del 20% reduce no-shows un 60% según histórico.",
    supportingData: "No-show patterns · 6 meses",
    expectedImpact: "-3 no-shows/día · +€510/día",
    risk: "medio",
    estimatedCost: "€0 (configuración)",
    priority: "alta",
    confidence: 90,
    actionLabel: "Configurar depósito noche",
    status: "pending",
  },
  {
    id: "rec-5",
    title: "Revisar planificación turnos",
    rationale:
      "Coste personal +12% sobre presupuesto por horas extra. Replanificación podría reducir 8h extra/semana.",
    supportingData: "Staff + Budget · mes actual",
    expectedImpact: "-€420 coste · -8h extra/semana",
    risk: "bajo",
    estimatedCost: "€0",
    priority: "media",
    confidence: 75,
    actionLabel: "Abrir planificador",
    status: "pending",
  },
];

/* ============================================================
   Filter tabs
============================================================ */

type CategoryFilter = "all" | AlertCategory;
type SeverityFilter = "all" | AlertSeverity;

const CATEGORY_FILTERS: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "operational", label: "Operativas" },
  { id: "financial", label: "Financieras" },
  { id: "marketing", label: "Marketing" },
  { id: "reputation", label: "Reputación" },
  { id: "security", label: "Seguridad" },
  { id: "integration", label: "Integraciones" },
  { id: "performance", label: "Rendimiento" },
];

const SEVERITY_FILTERS: { id: SeverityFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "critical", label: "Críticas" },
  { id: "high", label: "Altas" },
  { id: "medium", label: "Medias" },
  { id: "low", label: "Bajas" },
];

/* ============================================================
   Summary bar
============================================================ */

function SummaryBar({ alerts }: { alerts: ExecutiveAlert[] }) {
  const active = alerts.filter((a) => a.status === "active");
  const critical = active.filter((a) => a.severity === "critical").length;
  const high = active.filter((a) => a.severity === "high").length;
  const medium = active.filter((a) => a.severity === "medium").length;
  const low = active.filter((a) => a.severity === "low").length;
  const dueToday = active.filter((a) => a.dueInHours !== undefined && a.dueInHours <= 24).length;

  const items = [
    { label: "activas", value: active.length, color: "text-red-400" },
    { label: "críticas", value: critical, color: "text-red-400" },
    { label: "altas", value: high, color: "text-amber-300" },
    { label: "medias", value: medium, color: "rp-gold-text" },
    { label: "bajas", value: low, color: "text-zinc-400" },
    { label: "vencen hoy", value: dueToday, color: "text-amber-300" },
  ];

  return (
    <div className="rp-glass rounded-xl px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className={cn("font-display text-2xl font-light", it.color)}>{it.value}</span>
          <span className="text-xs text-muted-foreground">{it.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Badge helpers
============================================================ */

function CategoryBadge({ category }: { category: AlertCategory }) {
  const m = CATEGORY_META[category];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider",
        m.bg,
        m.border,
        m.color
      )}
    >
      <m.icon className="h-3 w-3" aria-hidden />
      {m.label}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const m = SEVERITY_META[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider",
        m.bg,
        m.border,
        m.color
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}

function StatusBadge({ status }: { status: AlertStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider",
        m.bg,
        m.border,
        m.color
      )}
    >
      {m.label}
    </span>
  );
}

/* ============================================================
   Alert card
============================================================ */

function AlertCard({
  alert,
  onAction,
}: {
  alert: ExecutiveAlert;
  onAction: (alertId: string, action: string) => void;
}) {
  const { toast } = useToast();
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [resolveOpen, setResolveOpen] = React.useState(false);
  const [snoozeOpen, setSnoozeOpen] = React.useState(false);
  const [resolveText, setResolveText] = React.useState("");
  const [snoozeHours, setSnoozeHours] = React.useState("1");
  const [detailOpen, setDetailOpen] = React.useState(false);
  const reduceMotion = useReducedMotion();

  const catMeta = CATEGORY_META[alert.category];
  const dueSoon = alert.dueInHours !== undefined && alert.dueInHours <= 2 && !alert.dueOverdue;

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={cn(
        "rp-glass rounded-xl p-4 sm:p-5 flex flex-col gap-3 border-l-2",
        alert.severity === "critical"
          ? "border-l-red-500/60"
          : alert.severity === "high"
          ? "border-l-amber-400/60"
          : alert.severity === "medium"
          ? "border-l-[var(--gold)]/60"
          : "border-l-zinc-400/40"
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[11px] text-muted-foreground">{alert.id}</span>
          <CategoryBadge category={alert.category} />
          <SeverityBadge severity={alert.severity} />
          <StatusBadge status={alert.status} />
        </div>
        {alert.dueDate && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[11px] font-mono",
              alert.dueOverdue ? "text-red-400" : dueSoon ? "text-amber-300" : "text-muted-foreground"
            )}
          >
            <Clock className="h-3 w-3" aria-hidden />
            {alert.dueOverdue
              ? `Vencida -${Math.abs(alert.dueInHours ?? 0)}h`
              : alert.dueInHours !== undefined
              ? alert.dueInHours <= 24
                ? `Vence en ${alert.dueInHours}h`
                : `Vence ${alert.dueDate}`
              : alert.dueDate}
          </span>
        )}
      </div>

      {/* Title + description */}
      <div>
        <h3 className="font-medium text-[15px] leading-snug">{alert.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{alert.description}</p>
      </div>

      {/* Probable cause */}
      <div className="text-xs italic text-foreground/70 flex items-start gap-1.5">
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" aria-hidden />
        <span>
          <span className="text-muted-foreground">Posible causa:</span> {alert.probableCause}
        </span>
      </div>

      {/* Impact */}
      <div className="flex items-center gap-1.5 text-xs">
        <TrendingDown className="h-3.5 w-3.5 rp-gold-text" aria-hidden />
        <span className="text-muted-foreground">Impacto:</span>
        <span className="font-medium rp-gold-text">{alert.impact}</span>
      </div>

      {/* Suggested action — highlighted */}
      <div className="rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/[0.08] p-3">
        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)]">
          <Zap className="h-3 w-3" aria-hidden />
          Acción sugerida
        </div>
        <p className="mt-1 text-sm text-foreground">{alert.suggestedAction}</p>
      </div>

      {/* Assignee */}
      {alert.assignee && (
        <div className="flex items-center gap-2 text-xs">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[var(--teal)] to-[var(--teal-deep)] flex items-center justify-center text-black text-[10px] font-medium">
            {alert.assignee.split(" ").map((s) => s[0]).join("").slice(0, 2)}
          </div>
          <span className="text-muted-foreground">Responsable:</span>
          <span className="text-foreground/90">{alert.assignee}</span>
        </div>
      )}

      {/* Resolution note (if resolved) */}
      {alert.status === "resolved" && alert.resolution && (
        <div className="flex items-start gap-2 rounded-md border border-emerald-400/30 bg-emerald-400/[0.06] p-2.5">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-300" aria-hidden />
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-300">
              Resolución
            </div>
            <p className="mt-0.5 text-xs text-foreground/80">{alert.resolution}</p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {alert.status === "active" && (
          <button
            onClick={() => onAction(alert.id, "acknowledge")}
            className="min-h-[36px] inline-flex items-center gap-1 rounded-md border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-xs text-amber-300 hover:bg-amber-400/20 transition-colors"
          >
            <Eye className="h-3 w-3" aria-hidden />
            Reconocer
          </button>
        )}
        {alert.status !== "resolved" && (
          <button
            onClick={() => setResolveOpen((v) => !v)}
            className="min-h-[36px] inline-flex items-center gap-1 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300 hover:bg-emerald-400/20 transition-colors"
          >
            <CheckCircle2 className="h-3 w-3" aria-hidden />
            Resolver
          </button>
        )}
        {alert.status === "active" && (
          <button
            onClick={() => setSnoozeOpen((v) => !v)}
            className="min-h-[36px] inline-flex items-center gap-1 rounded-md border border-border/60 bg-foreground/[0.03] px-2.5 py-1 text-xs text-foreground/80 hover:border-foreground/30 transition-colors"
          >
            <Pause className="h-3 w-3" aria-hidden />
            Posponer
          </button>
        )}
        {alert.canConvertToTask && (
          <button
            onClick={() => onAction(alert.id, "convert")}
            className="min-h-[36px] inline-flex items-center gap-1 rounded-md border border-[var(--teal)]/40 bg-[var(--teal)]/10 px-2.5 py-1 text-xs text-[var(--teal)] hover:bg-[var(--teal)]/20 transition-colors"
          >
            <ListTodo className="h-3 w-3" aria-hidden />
            Convertir en tarea
          </button>
        )}
        <button
          onClick={() => setDetailOpen((v) => !v)}
          className="min-h-[36px] inline-flex items-center gap-1 rounded-md border border-border/60 bg-foreground/[0.03] px-2.5 py-1 text-xs text-foreground/80 hover:border-foreground/30 transition-colors"
        >
          <Eye className="h-3 w-3" aria-hidden />
          Ver detalle
        </button>
      </div>

      {/* Resolve inline form */}
      <AnimatePresence>
        {resolveOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-md border border-emerald-400/30 bg-emerald-400/[0.06] p-3 space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-emerald-300">
                Nota de resolución
              </label>
              <textarea
                value={resolveText}
                onChange={(e) => setResolveText(e.target.value)}
                placeholder="Describe cómo se resolvió…"
                rows={2}
                className="w-full rounded-md border border-border/60 bg-background/50 px-2.5 py-1.5 text-sm outline-none focus:border-emerald-400/40 resize-none rp-scroll-thin"
              />
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    onAction(alert.id, "resolve");
                    setResolveOpen(false);
                    setResolveText("");
                  }}
                  className="min-h-[36px] inline-flex items-center gap-1 rounded-md bg-emerald-500/80 px-2.5 py-1 text-xs font-medium text-black hover:bg-emerald-400 transition-colors"
                >
                  <CheckCircle2 className="h-3 w-3" aria-hidden />
                  Confirmar resolución
                </button>
                <button
                  onClick={() => setResolveOpen(false)}
                  className="min-h-[36px] inline-flex items-center px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Snooze inline form */}
      <AnimatePresence>
        {snoozeOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-md border border-border/60 bg-foreground/[0.03] p-3 space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Posponer durante
              </label>
              <div className="flex flex-wrap gap-1.5">
                {["1", "2", "4", "8", "24"].map((h) => (
                  <button
                    key={h}
                    onClick={() => setSnoozeHours(h)}
                    className={cn(
                      "min-h-[36px] rounded-md border px-3 py-1 text-xs transition-colors",
                      snoozeHours === h
                        ? "border-[var(--gold)]/50 bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                        : "border-border/60 bg-foreground/[0.02] text-foreground/80 hover:border-foreground/30"
                    )}
                  >
                    {h}h
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    onAction(alert.id, `snooze:${snoozeHours}`);
                    setSnoozeOpen(false);
                  }}
                  className="min-h-[36px] inline-flex items-center gap-1 rounded-md bg-foreground/15 px-2.5 py-1 text-xs font-medium hover:bg-foreground/25 transition-colors"
                >
                  <Pause className="h-3 w-3" aria-hidden />
                  Posponer {snoozeHours}h
                </button>
                <button
                  onClick={() => setSnoozeOpen(false)}
                  className="min-h-[36px] inline-flex items-center px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail inline (history) */}
      <AnimatePresence>
        {detailOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-md border border-border/60 bg-foreground/[0.03] p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  Historial de la alerta
                </div>
                <button
                  onClick={() => setHistoryOpen((v) => !v)}
                  className="text-[11px] text-[var(--teal)] hover:underline inline-flex items-center gap-1"
                >
                  {historyOpen ? "Ocultar" : "Expandir"}
                  <ChevronDown
                    className={cn("h-3 w-3 transition-transform", historyOpen && "rotate-180")}
                    aria-hidden
                  />
                </button>
              </div>
              <ol className="space-y-2 relative">
                {alert.history.map((h, i) => (
                  <li key={i} className="flex gap-2.5 text-xs">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full mt-1",
                          h.status === "active"
                            ? "bg-red-500"
                            : h.status === "acknowledged"
                            ? "bg-amber-400"
                            : h.status === "resolved"
                            ? "bg-emerald-400"
                            : "bg-zinc-400"
                        )}
                      />
                      {i < alert.history.length - 1 && (
                        <span className="flex-1 w-px bg-border/60 min-h-[12px]" />
                      )}
                    </div>
                    <div className="pb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-muted-foreground">{h.ts}</span>
                        <StatusBadge status={h.status} />
                      </div>
                      {h.note && (
                        <p className="mt-0.5 text-foreground/70 text-[11px]">{h.note}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

/* ============================================================
   AI Recommendation card
============================================================ */

function RecCard({
  rec,
  onAction,
}: {
  rec: AiRecommendation;
  onAction: (id: string, action: "execute" | "postpone" | "reject") => void;
}) {
  const reduceMotion = useReducedMotion();
  const riskStyles: Record<string, string> = {
    bajo: "text-emerald-300 border-emerald-400/40 bg-emerald-400/10",
    medio: "text-amber-300 border-amber-400/40 bg-amber-400/10",
    alto: "text-red-400 border-red-500/40 bg-red-500/10",
  };
  const prioStyles: Record<string, string> = {
    alta: "text-red-400 border-red-500/40 bg-red-500/10",
    media: "text-amber-300 border-amber-400/40 bg-amber-400/10",
    baja: "text-zinc-400 border-zinc-400/40 bg-zinc-400/10",
  };

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="rp-glass rounded-xl p-4 sm:p-5 flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Sparkles className="h-4 w-4 rp-gold-text" aria-hidden />
          <h3 className="font-medium text-[15px] leading-snug">{rec.title}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
              prioStyles[rec.priority]
            )}
          >
            Prioridad {rec.priority}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
              riskStyles[rec.risk]
            )}
          >
            Riesgo {rec.risk}
          </span>
        </div>
      </div>

      {/* Confidence + impact */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider",
            rec.confidence >= 80
              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
              : rec.confidence >= 60
              ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
              : "border-red-500/40 bg-red-500/10 text-red-400"
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          Confianza {rec.confidence}%
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-2 py-0.5 text-[11px] font-mono text-[var(--gold-soft)]">
          <TrendingDown className="h-3 w-3" aria-hidden />
          {rec.expectedImpact}
        </span>
      </div>

      {/* Rationale */}
      <p className="text-sm text-foreground/85 leading-relaxed">{rec.rationale}</p>

      {/* Supporting data */}
      <div className="flex flex-col gap-1 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Datos que respaldan:</span>
          <span className="text-[var(--teal)] font-mono">{rec.supportingData}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Coste estimado:</span>
          <span className="text-foreground/90">{rec.estimatedCost}</span>
        </div>
      </div>

      {/* Status / measured result */}
      {rec.status === "executed" && (
        <div className="rounded-md border border-[var(--teal)]/30 bg-[var(--teal)]/[0.06] p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]">
            <Clock className="h-3 w-3" aria-hidden />
            Resultado posterior
          </div>
          <p className="mt-0.5 text-xs text-foreground/80">
            {rec.measuredResult ?? "Pendiente de medición · se comparará con el impacto esperado en 24h"}
          </p>
        </div>
      )}
      {rec.status === "rejected" && (
        <div className="rounded-md border border-zinc-400/30 bg-zinc-400/[0.06] p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            <XCircle className="h-3 w-3" aria-hidden />
            Rechazada
          </div>
        </div>
      )}

      {/* Actions */}
      {rec.status === "pending" && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            onClick={() => onAction(rec.id, "execute")}
            className="min-h-[40px] inline-flex items-center gap-1.5 rounded-md bg-[var(--gold)] px-3 py-1.5 text-xs font-medium text-black hover:bg-[var(--gold-soft)] transition-colors"
          >
            <Play className="h-3.5 w-3.5" aria-hidden />
            {rec.actionLabel}
          </button>
          <button
            onClick={() => onAction(rec.id, "postpone")}
            className="min-h-[40px] inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-foreground/[0.03] px-3 py-1.5 text-xs text-foreground/80 hover:border-foreground/30 transition-colors"
          >
            <Pause className="h-3.5 w-3.5" aria-hidden />
            Posponer
          </button>
          <button
            onClick={() => onAction(rec.id, "reject")}
            className="min-h-[40px] inline-flex items-center gap-1.5 rounded-md border border-zinc-400/40 bg-zinc-400/10 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-400/20 transition-colors"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Rechazar
          </button>
        </div>
      )}
    </motion.article>
  );
}

/* ============================================================
   Main component
============================================================ */

export function ExecAlerts() {
  const { toast } = useToast();
  const [alerts, setAlerts] = React.useState<ExecutiveAlert[]>(INITIAL_ALERTS);
  const [recs, setRecs] = React.useState<AiRecommendation[]>(INITIAL_RECS);
  const [catFilter, setCatFilter] = React.useState<CategoryFilter>("all");
  const [sevFilter, setSevFilter] = React.useState<SeverityFilter>("all");

  const filteredAlerts = React.useMemo(() => {
    return alerts.filter((a) => {
      if (catFilter !== "all" && a.category !== catFilter) return false;
      if (sevFilter !== "all" && a.severity !== sevFilter) return false;
      return true;
    });
  }, [alerts, catFilter, sevFilter]);

  function handleAlertAction(alertId: string, action: string) {
    const alert = alerts.find((a) => a.id === alertId);
    if (!alert) return;

    const now = new Date();
    const ts = `hace ${Math.floor(Math.random() * 5) + 1} min`;
    let toastTitle = "";
    let toastDesc = "";
    let nextAlert: ExecutiveAlert = alert;
    let mutate = false;

    if (action === "acknowledge") {
      toastTitle = "Alerta reconocida";
      toastDesc = `${alertId} · esperando resolución`;
      nextAlert = {
        ...alert,
        status: "acknowledged",
        history: [
          ...alert.history,
          { ts, status: "acknowledged", note: "Reconocida por Ana Martínez" },
        ],
      };
      mutate = true;
    } else if (action === "resolve") {
      toastTitle = "Alerta resuelta";
      toastDesc = `${alertId} · marcada como resuelta`;
      nextAlert = {
        ...alert,
        status: "resolved",
        resolution: "Resuelta manualmente por Ana Martínez",
        history: [
          ...alert.history,
          { ts, status: "resolved", note: "Resuelta por Ana Martínez" },
        ],
      };
      mutate = true;
    } else if (action.startsWith("snooze")) {
      const hours = action.split(":")[1];
      toastTitle = "Alerta pospuesta";
      toastDesc = `${alertId} · ${hours}h`;
      nextAlert = {
        ...alert,
        status: "snoozed",
        history: [
          ...alert.history,
          { ts, status: "snoozed", note: `Pospuesta ${hours}h` },
        ],
      };
      mutate = true;
    } else if (action === "convert") {
      toastTitle = "Tarea creada";
      toastDesc = `${alertId} · convertida en tarea y asignada al equipo`;
    }

    // Apply state change with a PURE updater (no side effects inside).
    if (mutate) {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? nextAlert : a))
      );
    }

    // Fire the toast in the event handler body — never inside the updater.
    if (toastTitle) {
      toast({ title: toastTitle, description: toastDesc });
    }
  }

  function handleRecAction(id: string, action: "execute" | "postpone" | "reject") {
    const rec = recs.find((r) => r.id === id);
    if (!rec) return;

    let toastTitle = "";
    let toastDesc = "";
    let nextStatus: AiRecommendation["status"] | null = null;

    if (action === "execute") {
      toastTitle = "Recomendación ejecutada";
      toastDesc = rec.title;
      nextStatus = "executed";
    } else if (action === "reject") {
      toastTitle = "Recomendación rechazada";
      toastDesc = rec.title;
      nextStatus = "rejected";
    } else {
      // postpone: original code did not mutate status, only fired the toast.
      toastTitle = "Recomendación pospuesta";
      toastDesc = rec.title;
    }

    // Apply state change with a PURE updater (only when status changes).
    if (nextStatus) {
      setRecs((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: nextStatus } : r
        )
      );
    }

    // Fire the toast in the event handler body.
    if (toastTitle) {
      toast({ title: toastTitle, description: toastDesc });
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-black ring-1 ring-red-500/30 shrink-0">
            <BellRing className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base sm:text-lg font-medium tracking-tight truncate">
                Centro de Alertas
              </h2>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-amber-400/40 bg-amber-400/10 text-amber-300">
                demo
              </span>
            </div>
            <div className="text-[11px] font-mono text-muted-foreground">
              {alerts.filter((a) => a.status === "active").length} alertas activas · monitorización continua
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--teal)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--teal)] animate-pulse" />
          Tiempo real
        </div>
      </header>

      {/* Summary bar */}
      <SummaryBar alerts={alerts} />

      {/* Category filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto rp-scroll-thin -mx-1 px-1 pb-1">
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setCatFilter(f.id)}
            className={cn(
              "shrink-0 min-h-[40px] inline-flex items-center rounded-full border px-3 py-1.5 text-xs transition-colors",
              catFilter === f.id
                ? "border-[var(--gold)]/50 bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                : "border-border/60 bg-foreground/[0.02] text-muted-foreground hover:text-foreground hover:border-foreground/30"
            )}
            aria-pressed={catFilter === f.id}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Severity filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          Severidad:
        </span>
        <div className="flex gap-1.5">
          {SEVERITY_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setSevFilter(f.id)}
              className={cn(
                "min-h-[36px] inline-flex items-center rounded-md border px-2.5 py-1 text-xs transition-colors",
                sevFilter === f.id
                  ? "border-foreground/40 bg-foreground/10 text-foreground"
                  : "border-border/60 bg-transparent text-muted-foreground hover:text-foreground hover:border-foreground/30"
              )}
              aria-pressed={sevFilter === f.id}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[11px] font-mono text-muted-foreground">
          {filteredAlerts.length} de {alerts.length}
        </span>
      </div>

      {/* Alerts grid */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredAlerts.map((a) => (
            <motion.div
              key={a.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <AlertCard alert={a} onAction={handleAlertAction} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredAlerts.length === 0 && (
        <div className="rp-glass rounded-xl p-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-emerald-300" aria-hidden />
          No hay alertas que coincidan con los filtros seleccionados.
        </div>
      )}

      {/* AI Recommendations panel */}
      <section className="mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 rp-gold-text" aria-hidden />
          <h3 className="font-display text-lg font-medium tracking-tight">
            Recomendaciones de IA
          </h3>
          <span className="text-[11px] font-mono text-muted-foreground">
            basadas en {alerts.filter((a) => a.status === "active").length} alertas activas
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {recs.map((r) => (
            <RecCard key={r.id} rec={r} onAction={handleRecAction} />
          ))}
        </div>
      </section>
    </div>
  );
}
