"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  BrainCircuit,
  Sparkles,
  ShieldAlert,
  Lock,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Eye,
  Clock3,
  AlertTriangle,
  Activity,
  Cpu,
  ServerCrash,
  TrendingUp,
  Users,
  Info,
  ShieldCheck,
  TimerReset,
  Zap,
  Gauge,
  Database,
  ArrowRight,
  UserCheck,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type RecommendationPriority = "critical" | "high" | "medium" | "low";
type RecommendationStatus = "pending" | "accepted" | "rejected" | "expired";

interface FloorRecommendation {
  id: string;
  action: string;
  reason: string;
  priority: RecommendationPriority;
  impactEstimate: string;
  confidence: number;
  dataUsed: string[];
  riskLevel: "none" | "low" | "medium" | "high";
  expiresAt: string;
  status: RecommendationStatus;
  modelVersion: string;
  fallbackAction: string;
  requiresApproval: boolean;
  approvedBy?: string;
  // Audit trail (optional, populated on decision)
  decidedAt?: string;
  decisionReason?: string;
  // Demo: when the recommendation was generated
  generatedAt: string;
  // Demo: latency in ms
  latencyMs: number;
}

/* =========================================================
 * Demo data
 * =======================================================*/
const NOW = Date.now();
const MIN = 60_000;

const INITIAL_RECS: FloorRecommendation[] = [
  {
    id: "REC-001",
    action: "Reforzar camarero en terraza",
    reason: "La terraza alcanzará 92% de ocupación en 30 minutos",
    priority: "critical",
    impactEstimate: "+€180 ingresos · −15% tiempo de espera",
    confidence: 88,
    dataUsed: ["Ocupación actual", "Reservas próximas", "Histórico viernes", "Carga personal"],
    riskLevel: "none",
    expiresAt: new Date(NOW + 25 * MIN).toISOString(),
    status: "pending",
    modelVersion: "glm-4-flash",
    fallbackAction:
      "Asignar 1 camarero adicional a Terraza si ocupación > 85% (regla estática por umbral)",
    requiresApproval: false,
    generatedAt: new Date(NOW - 1 * MIN).toISOString(),
    latencyMs: 1180,
  },
  {
    id: "REC-002",
    action: "Priorizar limpieza de mesa 8",
    reason: "Mesa 8 ocupada 145 min, próxima reserva 14:00",
    priority: "critical",
    impactEstimate: "Evitar retraso de reserva · +1 rotación",
    confidence: 92,
    dataUsed: ["Ocupación actual", "Reservas próximas", "Histórico mesa"],
    riskLevel: "low",
    expiresAt: new Date(NOW + 14 * MIN).toISOString(),
    status: "pending",
    modelVersion: "glm-4-flash",
    fallbackAction:
      "Notificar a personal de limpieza cuando mesa lleva > 120 min ocupada (cola FIFO)",
    requiresApproval: false,
    generatedAt: new Date(NOW - 2 * MIN).toISOString(),
    latencyMs: 940,
  },
  {
    id: "REC-003",
    action: "Mesa 14 acumula 18 min de retraso de cocina",
    reason: "Pedido enviado hace 38 min, media histórica 20 min",
    priority: "high",
    impactEstimate: "Evitar queja de cliente · −22% probabilidad reclamación",
    confidence: 85,
    dataUsed: ["Tiempo pedido", "Histórico cocina", "Carga cocina", "Reservas próximas"],
    riskLevel: "medium",
    expiresAt: new Date(NOW + 8 * MIN).toISOString(),
    status: "pending",
    modelVersion: "glm-4-flash",
    fallbackAction:
      "Alertar a cocina cuando tiempo de pedido > 30 min (umbral fijo) y notificar maître",
    requiresApproval: true,
    generatedAt: new Date(NOW - 3 * MIN).toISOString(),
    latencyMs: 1320,
  },
  {
    id: "REC-004",
    action: "Abrir zona VIP adicional",
    reason: "3 grupos en lista de espera compatibles con VIP",
    priority: "high",
    impactEstimate: "+€340 ingresos estimados · +3 mesas rotadas",
    confidence: 72,
    dataUsed: ["Lista de espera", "Capacidad VIP", "Histórico viernes", "Perfil cliente"],
    riskLevel: "low",
    expiresAt: new Date(NOW + 35 * MIN).toISOString(),
    status: "pending",
    modelVersion: "glm-4-flash",
    fallbackAction:
      "Abrir zona VIP si lista de espera > 5 grupos (regla de umbral simple)",
    requiresApproval: false,
    generatedAt: new Date(NOW - 4 * MIN).toISOString(),
    latencyMs: 1450,
  },
  {
    id: "REC-005",
    action: "Ofrecer postre en mesa 3",
    reason: "Clientes sentados 85 min, sin postre pedido",
    priority: "medium",
    impactEstimate: "+€24 ticket medio",
    confidence: 68,
    dataUsed: ["Tiempo de mesa", "Histórico ticket", "Estado pedido"],
    riskLevel: "none",
    expiresAt: new Date(NOW + 22 * MIN).toISOString(),
    status: "pending",
    modelVersion: "glm-4-flash",
    fallbackAction:
      "Sugerir postre al camarero cuando mesa lleva > 75 min sin postre (recordatorio)",
    requiresApproval: false,
    generatedAt: new Date(NOW - 5 * MIN).toISOString(),
    latencyMs: 870,
  },
  {
    id: "REC-006",
    action: "Trasladar reserva M7 a M5",
    reason: "M5 disponible, M7 necesita limpieza para próxima reserva",
    priority: "medium",
    impactEstimate: "Evitar conflicto de reservas · 0 retrasos",
    confidence: 80,
    dataUsed: ["Disponibilidad mesas", "Reservas próximas", "Estado limpieza"],
    riskLevel: "low",
    expiresAt: new Date(NOW + 18 * MIN).toISOString(),
    status: "pending",
    modelVersion: "glm-4-flash",
    fallbackAction:
      "Reasignar mesa si la mesa original no estará lista 15 min antes de la reserva",
    requiresApproval: false,
    generatedAt: new Date(NOW - 6 * MIN).toISOString(),
    latencyMs: 1090,
  },
  {
    id: "REC-007",
    action: "Preparar mesa 12 para cumpleaños",
    reason: "Reserva cumpleaños 21:30, necesita decoración",
    priority: "low",
    impactEstimate: "Mejorar experiencia · +NPS estimado",
    confidence: 95,
    dataUsed: ["Reservas próximas", "Etiquetas cliente", "Calendario eventos"],
    riskLevel: "none",
    expiresAt: new Date(NOW + 60 * MIN).toISOString(),
    status: "pending",
    modelVersion: "glm-4-flash",
    fallbackAction:
      "Crear tarea de decoración 30 min antes de toda reserva etiquetada 'cumpleaños'",
    requiresApproval: false,
    generatedAt: new Date(NOW - 7 * MIN).toISOString(),
    latencyMs: 760,
  },
];

/* =========================================================
 * Meta maps
 * =======================================================*/
const PRIORITY_META: Record<
  RecommendationPriority,
  {
    label: string;
    border: string;
    badge: string;
    accent: string;
    dot: string;
  }
> = {
  critical: {
    label: "Crítica",
    border: "bg-destructive",
    badge: "border-destructive/45 bg-destructive/10 text-destructive",
    accent: "text-destructive",
    dot: "bg-destructive",
  },
  high: {
    label: "Alta",
    border: "bg-amber-400",
    badge: "border-amber-400/45 bg-amber-400/10 text-amber-300",
    accent: "text-amber-300",
    dot: "bg-amber-400",
  },
  medium: {
    label: "Media",
    border: "bg-[var(--gold)]",
    badge: "border-[var(--gold)]/45 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
    accent: "rp-gold-text",
    dot: "bg-[var(--gold)]",
  },
  low: {
    label: "Baja",
    border: "bg-muted-foreground/50",
    badge: "border-border/60 bg-foreground/5 text-muted-foreground",
    accent: "text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
};

const RISK_META: Record<
  FloorRecommendation["riskLevel"],
  { label: string; badge: string }
> = {
  none: {
    label: "Ninguno",
    badge: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  },
  low: {
    label: "Bajo",
    badge: "border-[var(--teal)]/35 bg-[var(--teal)]/10 text-[var(--teal)]",
  },
  medium: {
    label: "Medio",
    badge: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  },
  high: {
    label: "Alto",
    badge: "border-destructive/45 bg-destructive/10 text-destructive",
  },
};

const STATUS_META: Record<
  RecommendationStatus,
  { label: string; badge: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pendiente",
    badge: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    icon: Clock3,
  },
  accepted: {
    label: "Aceptada",
    badge: "border-emerald-400/45 bg-emerald-400/10 text-emerald-300",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rechazada",
    badge: "border-destructive/40 bg-destructive/10 text-destructive",
    icon: XCircle,
  },
  expired: {
    label: "Expirada",
    badge: "border-border/60 bg-foreground/5 text-muted-foreground",
    icon: TimerReset,
  },
};

/* =========================================================
 * Helpers
 * =======================================================*/
function minutesUntil(iso: string): number {
  return Math.round((new Date(iso).getTime() - Date.now()) / 60000);
}

function formatExpiry(iso: string): { text: string; urgent: boolean; expired: boolean } {
  const m = minutesUntil(iso);
  if (m <= 0) return { text: "Expirada", urgent: false, expired: true };
  if (m < 60) {
    return { text: `Expira en ${m} min`, urgent: m < 10, expired: false };
  }
  const h = Math.floor(m / 60);
  const r = m % 60;
  return { text: `Expira en ${h}h ${r}min`, urgent: false, expired: false };
}

function confidenceMeta(c: number): { label: string; badge: string } {
  if (c >= 80)
    return {
      label: "Alta",
      badge: "border-emerald-400/35 bg-emerald-400/10 text-emerald-300",
    };
  if (c >= 60)
    return {
      label: "Media",
      badge: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    };
  return {
    label: "Baja",
    badge: "border-destructive/40 bg-destructive/10 text-destructive",
  };
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "ahora mismo";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  return `hace ${h} h`;
}

type Filter = "all" | RecommendationPriority;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "critical", label: "Críticas" },
  { id: "high", label: "Altas" },
  { id: "medium", label: "Medias" },
  { id: "low", label: "Bajas" },
];

/* =========================================================
 * Recommendation card
 * =======================================================*/
function RecommendationCard({
  rec,
  index,
  aiDown,
  onAccept,
  onReject,
  onDetail,
}: {
  rec: FloorRecommendation;
  index: number;
  aiDown: boolean;
  onAccept: () => void;
  onReject: () => void;
  onDetail: () => void;
}) {
  const reduce = useReducedMotion();
  const [fallbackOpen, setFallbackOpen] = React.useState(false);
  const pm = PRIORITY_META[rec.priority];
  const sm = STATUS_META[rec.status];
  const rm = RISK_META[rec.riskLevel];
  const cm = confidenceMeta(rec.confidence);
  const exp = formatExpiry(rec.expiresAt);
  const StatusIcon = sm.icon;
  const effectiveModel = aiDown ? "fallback-v1 (determinista)" : rec.modelVersion;

  const isPending = rec.status === "pending" && !exp.expired;
  const effectiveStatus: RecommendationStatus = exp.expired && rec.status === "pending"
    ? "expired"
    : rec.status;

  return (
    <motion.article
      layout={reduce ? false : true}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, x: -10 }}
      transition={{ duration: 0.28, delay: reduce ? 0 : index * 0.03 }}
      className={cn(
        "rp-glass relative overflow-hidden rounded-xl",
        effectiveStatus === "accepted" && "ring-1 ring-emerald-400/30",
        effectiveStatus === "rejected" && "opacity-70",
        effectiveStatus === "expired" && "opacity-60"
      )}
    >
      {/* Priority left border */}
      <span
        className={cn("absolute inset-y-0 left-0 w-1", pm.border)}
        aria-hidden="true"
      />

      <div className="p-4 pl-5 sm:p-5 sm:pl-6">
        {/* Header row: badges + status */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
              pm.badge
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", pm.dot)} />
            {pm.label}
          </span>

          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
              sm.badge
            )}
          >
            <StatusIcon className="h-3 w-3" />
            {sm.label}
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "inline-flex cursor-help items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                  cm.badge
                )}
              >
                <Gauge className="h-3 w-3" />
                Confianza {cm.label} · {rec.confidence}%
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-[220px]">
              Confianza del modelo en la recomendación. Alta ≥80% · Media ≥60% · Baja &lt;60%.
              {aiDown
                ? " IA en modo fallback: confianza = 100% (algoritmo determinista)."
                : ""}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "inline-flex cursor-help items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                  rm.badge
                )}
              >
                <ShieldAlert className="h-3 w-3" />
                Riesgo {rm.label}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-[220px]">
              Nivel de riesgo de ejecutar la acción recomendada. Evaluado por la IA sobre
              impacto operativo, financiero y de experiencia.
            </TooltipContent>
          </Tooltip>

          {/* Expiry */}
          {isPending && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                exp.urgent
                  ? "border-amber-400/50 bg-amber-400/15 text-amber-300"
                  : "border-border/40 bg-foreground/5 text-muted-foreground"
              )}
            >
              <Clock3 className="h-3 w-3" />
              {exp.text}
            </span>
          )}
        </div>

        {/* Action title + reason */}
        <h4 className="mt-3 text-base font-semibold leading-snug text-foreground sm:text-lg">
          {rec.action}
        </h4>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {rec.reason}
        </p>

        {/* Impact estimate */}
        <div className="mt-3 flex items-start gap-2">
          <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" />
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Impacto estimado
            </div>
            <div className="text-sm font-medium rp-gold-text">
              {rec.impactEstimate}
            </div>
          </div>
        </div>

        {/* Data used chips */}
        <div className="mt-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Datos analizados
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {rec.dataUsed.map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-foreground/[0.03] px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                <Database className="h-3 w-3 opacity-70" />
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* Approval note */}
        {rec.requiresApproval && isPending && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-[11px] text-amber-300">
            <Lock className="h-3 w-3" />
            Requiere aprobación de Manager
          </div>
        )}

        {/* Accepted by line */}
        {effectiveStatus === "accepted" && rec.approvedBy && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1 text-[11px] text-emerald-300">
            <UserCheck className="h-3 w-3" />
            Aceptada por <span className="font-medium">{rec.approvedBy}</span>
            {rec.decidedAt && (
              <span className="opacity-80">· {formatRelative(rec.decidedAt)}</span>
            )}
          </div>
        )}

        {/* Rejected reason */}
        {effectiveStatus === "rejected" && rec.decisionReason && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-1 text-[11px] text-destructive/90">
            <XCircle className="h-3 w-3" />
            Rechazada{rec.approvedBy && ` por ${rec.approvedBy}`}
            {rec.decisionReason && `: «${rec.decisionReason}»`}
          </div>
        )}

        {/* Fallback info — collapsible */}
        <Collapsible open={fallbackOpen} onOpenChange={setFallbackOpen} className="mt-3">
          <CollapsibleTrigger asChild>
            <button
              className={cn(
                "inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-border/40 bg-foreground/[0.02] px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
              )}
            >
              <ShieldCheck className="h-3 w-3 rp-teal-text" />
              Ver fallback determinista
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform",
                  fallbackOpen && "rotate-180"
                )}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="rounded-md border border-[var(--teal)]/25 bg-[var(--teal)]/[0.04] p-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]">
                Fallback determinista
              </div>
              <p className="mt-1 text-xs leading-relaxed text-foreground/85">
                Si la IA no responde, el sistema aplicaría:
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {rec.fallbackAction}
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {isPending && (
            <>
              <Button
                size="sm"
                onClick={onAccept}
                className="h-9 bg-[var(--gold)] text-[#1a1205] hover:bg-[var(--gold-soft)]"
              >
                <CheckCircle2 className="h-4 w-4" />
                Aceptar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onReject}
                className="h-9 text-muted-foreground hover:text-destructive"
              >
                <XCircle className="h-4 w-4" />
                Rechazar
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={onDetail}
            className="h-9 border-border/50 bg-transparent"
          >
            <Eye className="h-4 w-4" />
            Ver detalle
          </Button>

          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/80">
            <Cpu className="h-3 w-3" />
            {effectiveModel}
            <span aria-hidden>·</span>
            {rec.latencyMs}ms
          </span>
        </div>
      </div>
    </motion.article>
  );
}

/* =========================================================
 * Detail dialog
 * =======================================================*/
function DetailDialog({
  rec,
  aiDown,
  onClose,
}: {
  rec: FloorRecommendation | null;
  aiDown: boolean;
  onClose: () => void;
}) {
  if (!rec) return null;
  const pm = PRIORITY_META[rec.priority];
  const sm = STATUS_META[rec.status];
  const rm = RISK_META[rec.riskLevel];
  const cm = confidenceMeta(rec.confidence);
  const exp = formatExpiry(rec.expiresAt);

  return (
    <Dialog open={!!rec} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88vh] overflow-y-auto rp-scroll-thin sm:max-w-2xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                pm.badge
              )}
            >
              Prioridad {pm.label}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                sm.badge
              )}
            >
              {sm.label}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">{rec.id}</span>
          </div>
          <DialogTitle className="mt-2 font-display text-xl font-medium tracking-tight sm:text-2xl">
            {rec.action}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {rec.reason}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-5">
          {/* Impact */}
          <div className="rp-glass rounded-xl p-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Impacto estimado
            </div>
            <div className="mt-1 text-base font-medium rp-gold-text">
              {rec.impactEstimate}
            </div>
          </div>

          {/* Confidence + risk */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rp-glass rounded-xl p-4">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Confianza
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-2xl font-light tabular-nums">
                  {rec.confidence}%
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                    cm.badge
                  )}
                >
                  {cm.label}
                </span>
              </div>
            </div>
            <div className="rp-glass rounded-xl p-4">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Riesgo
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider",
                    rm.badge
                  )}
                >
                  <ShieldAlert className="h-3 w-3" />
                  {rm.label}
                </span>
              </div>
            </div>
          </div>

          {/* Data analysis breakdown */}
          <div className="rp-glass rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 rp-teal-text" />
              <h4 className="text-sm font-medium">Datos analizados</h4>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              La IA combinó estas fuentes para generar la recomendación:
            </p>
            <ul className="mt-2 space-y-1.5">
              {rec.dataUsed.map((d) => (
                <li key={d} className="flex items-start gap-2 text-xs text-foreground/85">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--teal)]" />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          {/* Fallback */}
          <div className="rounded-xl border border-[var(--teal)]/25 bg-[var(--teal)]/[0.04] p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 rp-teal-text" />
              <h4 className="text-sm font-medium">Acción determinista de fallback</h4>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Si la IA no está disponible, el sistema aplicaría automáticamente:
            </p>
            <p className="mt-1.5 rounded-md bg-background/40 p-2.5 font-mono text-xs text-foreground/90">
              {rec.fallbackAction}
            </p>
          </div>

          {/* Model + calculation time */}
          <div className="rp-glass rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 rp-gold-text" />
              <h4 className="text-sm font-medium">Modelo y cálculo</h4>
            </div>
            <dl className="mt-2 space-y-1.5 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Modelo</dt>
                <dd className="font-mono text-foreground/90">
                  {aiDown ? "fallback-v1 (determinista)" : rec.modelVersion}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Latencia</dt>
                <dd className="font-mono tabular-nums text-foreground/90">{rec.latencyMs} ms</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Generada</dt>
                <dd className="font-mono text-foreground/90">{formatRelative(rec.generatedAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Expira</dt>
                <dd className="font-mono text-foreground/90">{exp.text}</dd>
              </div>
            </dl>
          </div>

          {/* Audit trail */}
          {(rec.status === "accepted" || rec.status === "rejected") && (
            <div className="rp-glass rounded-xl p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 rp-gold-text" />
                <h4 className="text-sm font-medium">Pista de auditoría</h4>
              </div>
              <dl className="mt-2 space-y-1.5 text-xs">
                {rec.approvedBy && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Decidido por</dt>
                    <dd className="font-mono text-foreground/90">{rec.approvedBy}</dd>
                  </div>
                )}
                {rec.decidedAt && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Cuándo</dt>
                    <dd className="font-mono text-foreground/90">
                      {new Date(rec.decidedAt).toLocaleString("es-ES")}
                    </dd>
                  </div>
                )}
                {rec.decisionReason && (
                  <div className="flex flex-col gap-1">
                    <dt className="text-muted-foreground">Motivo</dt>
                    <dd className="rounded-md bg-background/40 p-2 text-foreground/85">
                      {rec.decisionReason}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Approval note */}
          {rec.requiresApproval && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-xs text-amber-300">
              <Lock className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Esta recomendación requiere aprobación explícita de Manager antes de
                ejecutarse. La acción no se aplica automáticamente.
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Reject dialog (with reason)
 * =======================================================*/
function RejectDialog({
  rec,
  onClose,
  onConfirm,
}: {
  rec: FloorRecommendation | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = React.useState("");
  React.useEffect(() => {
    if (rec) setReason("");
  }, [rec]);

  return (
    <Dialog open={!!rec} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-medium tracking-tight">
            Rechazar recomendación
          </DialogTitle>
          <DialogDescription>
            Indica el motivo del rechazo. Quedará registrado en la pista de auditoría.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej. El cliente prefiere esperar en barra · la acción no aplica hoy"
            className="min-h-[90px] resize-none rp-scroll-thin"
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} className="h-9">
            Cancelar
          </Button>
          <Button
            onClick={() => onConfirm(reason)}
            className="h-9 bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <XCircle className="h-4 w-4" />
            Confirmar rechazo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Main component
 * =======================================================*/
export function FloorAiOps() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [recs, setRecs] = React.useState<FloorRecommendation[]>(INITIAL_RECS);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [aiDown, setAiDown] = React.useState(false);
  const [detailRec, setDetailRec] = React.useState<FloorRecommendation | null>(null);
  const [rejectRec, setRejectRec] = React.useState<FloorRecommendation | null>(null);

  // Tick to refresh expiry countdowns
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // Counts
  const counts = React.useMemo(() => {
    const pending = recs.filter((r) => r.status === "pending");
    return {
      total: pending.length,
      critical: pending.filter((r) => r.priority === "critical").length,
      high: pending.filter((r) => r.priority === "high").length,
      medium: pending.filter((r) => r.priority === "medium").length,
      low: pending.filter((r) => r.priority === "low").length,
      expiringSoon: pending.filter((r) => {
        const m = minutesUntil(r.expiresAt);
        return m > 0 && m < 10;
      }).length,
    };
  }, [recs]);

  // Filtered view
  const visible = React.useMemo(() => {
    // Compute effective status (expired overrides pending)
    const withEff = recs.map((r) => {
      if (r.status === "pending" && minutesUntil(r.expiresAt) <= 0) {
        return { ...r, status: "expired" as RecommendationStatus };
      }
      return r;
    });
    if (filter === "all") return withEff;
    return withEff.filter((r) => r.priority === filter);
  }, [recs, filter]);

  // Auto-expire recs in state when they go past expiry
  React.useEffect(() => {
    const hasExpiredPending = recs.some(
      (r) => r.status === "pending" && minutesUntil(r.expiresAt) <= 0
    );
    if (!hasExpiredPending) return;
    setRecs((prev) =>
      prev.map((r) => {
        if (r.status === "pending" && minutesUntil(r.expiresAt) <= 0) {
          return { ...r, status: "expired" as RecommendationStatus };
        }
        return r;
      })
    );
  }, [recs, tick]);

  // Actions
  const accept = (id: string) => {
    setRecs((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "accepted",
              approvedBy: "Laura Pérez (Manager)",
              decidedAt: new Date().toISOString(),
              decisionReason: "Aceptada desde el panel de IA operativa",
            }
          : r
      )
    );
    const rec = recs.find((r) => r.id === id);
    toast({
      title: "Recomendación aceptada",
      description: rec
        ? `«${rec.action}» registrada. Aplicada por Laura Pérez.`
        : "Acción registrada.",
    });
  };

  const openReject = (rec: FloorRecommendation) => setRejectRec(rec);

  const confirmReject = (reason: string) => {
    if (!rejectRec) return;
    const id = rejectRec.id;
    setRecs((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "rejected",
              approvedBy: "Laura Pérez (Manager)",
              decidedAt: new Date().toISOString(),
              decisionReason: reason || "Sin motivo especificado",
            }
          : r
      )
    );
    toast({
      title: "Recomendación rechazada",
      description: `Quedará registrada en la pista de auditoría.`,
    });
    setRejectRec(null);
  };

  const toggleAi = (down: boolean) => {
    setAiDown(down);
    toast({
      title: down ? "IA en modo fallback" : "IA reactivada",
      description: down
        ? "Usando reglas deterministas. Las recomendaciones se basan en umbrales estáticos."
        : "Modelo glm-4-flash activo. Las recomendaciones se regeneran en tiempo real.",
    });
  };

  return (
    <TooltipProvider delayDuration={200}>
      <section aria-labelledby="floor-ai-ops-title" className="flex flex-col gap-5">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--gold)]/10 rp-gold-text">
                <BrainCircuit className="h-5 w-5" />
              </span>
              <h2
                id="floor-ai-ops-title"
                className="font-display text-xl sm:text-2xl font-medium tracking-tight"
              >
                IA Operativa
              </h2>
              <Badge
                variant="outline"
                className="border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)] font-mono text-[10px] uppercase tracking-wider"
              >
                demo
              </Badge>
              {/* Real-time indicator */}
              <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                <span className="relative flex h-2 w-2">
                  {!reduce && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  )}
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Tiempo real
              </span>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Recomendaciones operativas en vivo. La IA propone, el humano decide.
            </p>
          </div>
        </header>

        {/* AI status indicator + failover toggle */}
        <div className="rp-glass flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-mono uppercase tracking-wider">
            <span className="inline-flex items-center gap-1.5 text-emerald-300">
              <Activity className="h-3.5 w-3.5" />
              {aiDown ? "IA no disponible" : "IA activa"}
            </span>
            <span className="text-muted-foreground">
              Modelo: <span className="text-foreground/90">{aiDown ? "fallback-v1" : "glm-4-flash"}</span>
            </span>
            <span className="text-muted-foreground">
              Latencia: <span className="tabular-nums text-foreground/90">{aiDown ? "12ms" : "1.2s"}</span> media
            </span>
            <span className="text-muted-foreground">
              Caídas hoy: <span className="tabular-nums text-foreground/90">{aiDown ? "1" : "0"}</span>
            </span>
          </div>
          <label className="inline-flex items-center gap-2.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ServerCrash className="h-3.5 w-3.5 text-amber-300" />
              Simular caída de IA
            </span>
            <Switch checked={aiDown} onCheckedChange={toggleAi} aria-label="Simular caída de IA" />
          </label>
        </div>

        {/* AI down banner */}
        <AnimatePresence>
          {aiDown && (
            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <div className="font-medium">IA no disponible — usando reglas deterministas</div>
                  <p className="mt-0.5 text-xs text-amber-200/80">
                    Las recomendaciones se generan con fallback por umbrales estáticos. Confianza
                    fijada en 100% (algoritmo determinista). Toda acción sigue requiriendo aprobación humana.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary bar */}
        <div className="rp-glass flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl px-4 py-3 text-sm">
          <span className="font-medium text-foreground">
            <span className="tabular-nums rp-gold-text">{counts.total}</span>{" "}
            recomendaciones activas
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="inline-flex items-center gap-1.5 text-destructive">
            <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
            <span className="tabular-nums">{counts.critical}</span> críticas
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="inline-flex items-center gap-1.5 text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="tabular-nums">{counts.high}</span> altas
          </span>
          {counts.expiringSoon > 0 && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="inline-flex items-center gap-1.5 text-amber-300">
                <Clock3 className="h-3.5 w-3.5" />
                <span className="tabular-nums">{counts.expiringSoon}</span> expira en &lt;10 min
              </span>
            </>
          )}
        </div>

        {/* Priority filter */}
        <div
          role="tablist"
          aria-label="Filtrar recomendaciones por prioridad"
          className="flex flex-wrap gap-1.5"
        >
          {FILTERS.map((f) => {
            const active = filter === f.id;
            const count =
              f.id === "all"
                ? counts.total
                : f.id === "critical"
                ? counts.critical
                : f.id === "high"
                ? counts.high
                : f.id === "medium"
                ? counts.medium
                : counts.low;
            return (
              <button
                key={f.id}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "inline-flex min-h-[36px] items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]"
                    : "border-border/40 bg-foreground/[0.02] text-muted-foreground hover:bg-foreground/[0.05]"
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-mono tabular-nums",
                    active ? "bg-[var(--gold)]/20" : "bg-foreground/5"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Recommendation list */}
        <div className="flex flex-col gap-2.5">
          <AnimatePresence mode="popLayout">
            {visible.map((r, i) => (
              <RecommendationCard
                key={r.id}
                rec={r}
                index={i}
                aiDown={aiDown}
                onAccept={() => accept(r.id)}
                onReject={() => openReject(r)}
                onDetail={() => setDetailRec(r)}
              />
            ))}
          </AnimatePresence>

          {visible.length === 0 && (
            <div className="rp-glass rounded-xl p-8 text-center text-sm text-muted-foreground">
              <Sparkles className="mx-auto mb-2 h-5 w-5 text-[var(--gold)]" />
              No hay recomendaciones en esta categoría.
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2.5 rounded-xl border border-border/40 bg-foreground/[0.02] p-3.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 rp-teal-text" />
          <p className="leading-relaxed">
            <span className="font-medium text-foreground/85">
              La IA recomienda, el humano decide.
            </span>{" "}
            Las recomendaciones no ejecutan acciones automáticamente. Toda recomendación tiene
            fallback determinista y queda registrada en la pista de auditoría.
          </p>
        </div>
      </section>

      {/* Dialogs */}
      <DetailDialog rec={detailRec} aiDown={aiDown} onClose={() => setDetailRec(null)} />
      <RejectDialog
        rec={rejectRec}
        onClose={() => setRejectRec(null)}
        onConfirm={confirmReject}
      />
    </TooltipProvider>
  );
}
