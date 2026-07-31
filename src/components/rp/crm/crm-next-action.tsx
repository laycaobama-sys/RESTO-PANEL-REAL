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
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  Brain,
  ShieldCheck,
  Clock4,
  TrendingUp,
  Target,
  CalendarClock,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  Plus,
  Mail,
  MessageSquare,
  Star,
  Users,
  Gift,
  AlertTriangle,
  Store,
  RefreshCw,
  Info,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type ActionStatus = "pending" | "accepted" | "rejected" | "postponed" | "irrelevant";
type Priority = "high" | "medium" | "low";

interface NextBestAction {
  id: string;
  action: string;
  reason: string;
  estimatedImpact: string;
  confidence: number;
  dataUsed: string[];
  priority: Priority;
  expiresAt: string;
  status: ActionStatus;
  ruleOrModel: string;
}

/* =========================================================
 * Priority meta
 * =======================================================*/
const PRIORITY_META: Record<
  Priority,
  {
    label: string;
    border: string;
    dot: string;
    badge: string;
    tone: "destructive" | "gold" | "muted";
  }
> = {
  high: {
    label: "Alta",
    border: "border-l-destructive/70",
    dot: "bg-destructive",
    badge: "bg-destructive/10 text-destructive border-destructive/30",
    tone: "destructive",
  },
  medium: {
    label: "Media",
    border: "border-l-[var(--gold)]/70",
    dot: "bg-[var(--gold)]",
    badge: "bg-[var(--gold)]/10 text-[var(--gold-soft)] border-[var(--gold)]/30",
    tone: "gold",
  },
  low: {
    label: "Baja",
    border: "border-l-muted-foreground/40",
    dot: "bg-muted-foreground",
    badge: "bg-muted/40 text-muted-foreground border-muted-foreground/20",
    tone: "muted",
  },
};

const STATUS_META: Record<
  ActionStatus,
  { label: string; badge: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pendiente",
    badge: "bg-muted/40 text-muted-foreground border-muted-foreground/20",
    icon: Clock4,
  },
  accepted: {
    label: "Aceptada",
    badge: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rechazada",
    badge: "bg-muted/40 text-muted-foreground border-muted-foreground/20",
    icon: XCircle,
  },
  postponed: {
    label: "Pospuesta",
    badge: "bg-muted/40 text-muted-foreground border-muted-foreground/20",
    icon: Clock,
  },
  irrelevant: {
    label: "Irrelevante",
    badge: "bg-muted/30 text-muted-foreground/70 border-muted-foreground/15",
    icon: Ban,
  },
};

/* =========================================================
 * Demo data
 * =======================================================*/
const INITIAL_ACTIONS: NextBestAction[] = [
  {
    id: "nba-1",
    action: "Recuperar cliente inactivo",
    reason: "Elena Marín no visita desde hace 95 días",
    estimatedImpact: "+€180 ingresos estimados",
    confidence: 82,
    dataUsed: ["Historial visitas", "LTV", "Canal preferido"],
    priority: "high",
    expiresAt: addDaysIso(2),
    status: "pending",
    ruleOrModel: "Regla: inactividad 90d + LTV > 1000€",
  },
  {
    id: "nba-2",
    action: "Enviar oferta a VIP",
    reason: "Andrés Vidal cumple años en 5 días",
    estimatedImpact: "+€220 ingresos estimados",
    confidence: 90,
    dataUsed: ["Perfil VIP", "Cumpleaños", "Visitas previas"],
    priority: "high",
    expiresAt: addDaysIso(4),
    status: "pending",
    ruleOrModel: "Automatización: cumpleaños VIP",
  },
  {
    id: "nba-3",
    action: "Solicitar reseña",
    reason: "Familia Ruiz tuvo una visita excelente (5★ interno)",
    estimatedImpact: "+reputación en Google",
    confidence: 75,
    dataUsed: ["Valoración post-visita", "NPS", "Canal de reseñas"],
    priority: "medium",
    expiresAt: addDaysIso(5),
    status: "pending",
    ruleOrModel: "Modelo: satisfacción post-visita",
  },
  {
    id: "nba-4",
    action: "Cambiar canal de contacto",
    reason: "Marta Iborra no abre emails (3 campañas) y responde por WhatsApp",
    estimatedImpact: "+34% tasa de respuesta",
    confidence: 68,
    dataUsed: ["Apertura emails", "Respuestas WhatsApp", "Preferencias"],
    priority: "medium",
    expiresAt: addDaysIso(7),
    status: "pending",
    ruleOrModel: "Regla: 3 emails sin abrir",
  },
  {
    id: "nba-5",
    action: "Reducir frecuencia de contacto",
    reason: "Javier Soler recibió 5 emails en 7 días con baja interacción",
    estimatedImpact: "−riesgo de fatiga y baja",
    confidence: 60,
    dataUsed: ["Frecuencia envíos", "Tasa interacción", "Bajas email"],
    priority: "low",
    expiresAt: addDaysIso(10),
    status: "pending",
    ruleOrModel: "Regla: fatiga de contacto",
  },
  {
    id: "nba-6",
    action: "Invitar a evento",
    reason: "Lucía Ferrer es VIP Gold y hay un evento de gala próximo",
    estimatedImpact: "Recuperar VIP activa",
    confidence: 72,
    dataUsed: ["Segmento VIP", "Interacción campañas", "Eventos previos"],
    priority: "medium",
    expiresAt: addDaysIso(6),
    status: "pending",
    ruleOrModel: "Segmento: VIP Gold + interacción alta",
  },
  {
    id: "nba-7",
    action: "Revisar segmento en riesgo",
    reason: "19 clientes en riesgo de abandono sin acción asignada",
    estimatedImpact: "Retener €4.200 estimados en LTV",
    confidence: 70,
    dataUsed: ["Modelo churn", "Segmentos", "Historial"],
    priority: "medium",
    expiresAt: addDaysIso(8),
    status: "pending",
    ruleOrModel: "Modelo: churn-predictive-v2",
  },
  {
    id: "nba-8",
    action: "Atender local con baja conversión",
    reason: "Ramses Barcelona: conversión −15% vs mes anterior",
    estimatedImpact: "Recuperar 12 puntos de conversión",
    confidence: 85,
    dataUsed: ["Conversión por local", "Tendencia mensual", "Funnels"],
    priority: "high",
    expiresAt: addDaysIso(1),
    status: "pending",
    ruleOrModel: "Regla: variación conversión > 10%",
  },
];

const ACTION_ICON: Record<string, React.ElementType> = {
  "nba-1": Users,
  "nba-2": Gift,
  "nba-3": Star,
  "nba-4": MessageSquare,
  "nba-5": Mail,
  "nba-6": Plus,
  "nba-7": AlertTriangle,
  "nba-8": Store,
};

/* =========================================================
 * Helpers
 * =======================================================*/
function addDaysIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(23, 59, 0, 0);
  return d.toISOString();
}

function formatExpiry(iso: string): { label: string; urgent: boolean } {
  const target = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = target - now;
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: "Expirada", urgent: false };
  if (days === 0) return { label: "Expira hoy", urgent: true };
  if (days === 1) return { label: "Expira mañana", urgent: true };
  return { label: `Expira en ${days} días`, urgent: days <= 2 };
}

function confidenceTone(c: number): string {
  if (c >= 85) return "bg-emerald-400/10 text-emerald-300 border-emerald-400/30";
  if (c >= 70) return "bg-[var(--gold)]/10 text-[var(--gold-soft)] border-[var(--gold)]/30";
  if (c >= 60) return "bg-amber-400/10 text-amber-300 border-amber-400/30";
  return "bg-destructive/10 text-destructive border-destructive/30";
}

type FilterKey = "all" | Priority;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "high", label: "Alta" },
  { key: "medium", label: "Media" },
  { key: "low", label: "Baja" },
];

/* =========================================================
 * Component
 * =======================================================*/
export function CrmNextAction() {
  const reduceMotion = useReducedMotion();
  const { toast } = useToast();
  const [actions, setActions] = React.useState<NextBestAction[]>(INITIAL_ACTIONS);
  const [filter, setFilter] = React.useState<FilterKey>("all");
  const [regenerating, setRegenerating] = React.useState(false);

  const filtered = React.useMemo(() => {
    if (filter === "all") return actions;
    return actions.filter((a) => a.priority === filter);
  }, [actions, filter]);

  const summary = React.useMemo(() => {
    const pending = actions.filter((a) => a.status === "pending").length;
    const high = actions.filter((a) => a.priority === "high" && a.status === "pending").length;
    const today = actions.filter(
      (a) => a.status === "pending" && formatExpiry(a.expiresAt).label === "Expira hoy"
    ).length;
    return { pending, high, today };
  }, [actions]);

  const handleStatusChange = (id: string, status: ActionStatus) => {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    const meta = STATUS_META[status];
    const action = actions.find((a) => a.id === id);
    toast({
      title: `${meta.label}: ${action?.action ?? "Acción"}`,
      description:
        status === "accepted"
          ? "Acción marcada como aceptada. Se ejecutará desde el flujo correspondiente."
          : status === "rejected"
          ? "Acción rechazada. No se volverá a sugerir en esta ventana."
          : status === "postponed"
          ? "Acción pospuesta 7 días. Se reevaluará."
          : "Acción marcada como irrelevante. El modelo ajustará la segmentación.",
    });
  };

  const regenerate = () => {
    setRegenerating(true);
    setTimeout(() => {
      setRegenerating(false);
      toast({
        title: "Motor NBA reejecutado",
        description: "Recomendaciones recalculadas con datos actualizados (demo).",
      });
    }, 1400);
  };

  return (
    <TooltipProvider>
      <section
        aria-labelledby="nba-heading"
        className="space-y-5"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--gold)]/10 text-[var(--gold)] ring-1 ring-[var(--gold)]/20">
                <Target className="h-4.5 w-4.5" />
              </div>
              <h2
                id="nba-heading"
                className="font-display text-2xl sm:text-3xl tracking-tight text-foreground"
              >
                Próxima mejor acción
              </h2>
              <Badge className="border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)]">
                demo
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Motor de recomendaciones accionables basadas en reglas explicables y modelos
              predictivos. Cada acción incluye el impacto estimado, la confianza y los datos
              utilizados.
            </p>
          </div>
          <Button
            onClick={regenerate}
            disabled={regenerating}
            variant="outline"
            className="border-[var(--gold)]/30 text-[var(--gold-soft)] hover:bg-[var(--gold)]/10 hover:text-[var(--gold)] min-h-11"
          >
            <RefreshCw className={cn("h-4 w-4", regenerating && "animate-spin")} />
            {regenerating ? "Recalculando…" : "Recalcular"}
          </Button>
        </div>

        {/* Summary */}
        <div className="rp-glass rounded-xl px-4 py-3.5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Pendientes</span>
            <span className="font-mono text-base text-foreground">{summary.pending}</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Alta prioridad</span>
            <span className="font-mono text-base text-destructive">{summary.high}</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Expiran hoy</span>
            <span className="font-mono text-base text-[var(--gold-soft)]">{summary.today}</span>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
            <Brain className="h-3.5 w-3.5 rp-teal-text" />
            <span>Motor NBA · reglas + modelos</span>
          </div>
        </div>

        {/* Priority filter */}
        <div
          role="tablist"
          aria-label="Filtrar por prioridad"
          className="flex flex-wrap items-center gap-1.5 rp-glass rounded-xl p-1.5 w-fit"
        >
          {FILTERS.map((f) => {
            const active = filter === f.key;
            const count =
              f.key === "all"
                ? actions.length
                : actions.filter((a) => a.priority === f.key).length;
            return (
              <button
                key={f.key}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "relative inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors min-h-11",
                  active
                    ? "bg-foreground/5 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "font-mono text-xs px-1.5 py-0.5 rounded-md",
                    active
                      ? "bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                      : "bg-muted/40 text-muted-foreground"
                  )}
                >
                  {count}
                </span>
                {f.key === "high" && active && (
                  <span className="absolute left-0 top-0 h-full w-0.5 rounded-l bg-destructive" />
                )}
                {f.key === "medium" && active && (
                  <span className="absolute left-0 top-0 h-full w-0.5 rounded-l bg-[var(--gold)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Action list */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((action, idx) => (
              <ActionCard
                key={action.id}
                action={action}
                index={idx}
                reduceMotion={reduceMotion}
                onStatusChange={handleStatusChange}
              />
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="rp-glass rounded-xl p-10 text-center text-sm text-muted-foreground">
              No hay acciones para este filtro.
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2.5 text-xs text-muted-foreground rp-glass rounded-lg p-3.5">
          <Info className="h-4 w-4 mt-0.5 shrink-0 rp-teal-text" />
          <p>
            Las recomendaciones son sugerencias explicables. No ejecutan acciones
            automáticamente. Cada decisión queda registrada en el historial del cliente y alimenta
            el modelo para futuras iteraciones.
          </p>
        </div>
      </section>
    </TooltipProvider>
  );
}

/* =========================================================
 * Action card
 * =======================================================*/
interface ActionCardProps {
  action: NextBestAction;
  index: number;
  reduceMotion: boolean | null;
  onStatusChange: (id: string, status: ActionStatus) => void;
}

function ActionCard({ action, index, reduceMotion, onStatusChange }: ActionCardProps) {
  const pMeta = PRIORITY_META[action.priority];
  const sMeta = STATUS_META[action.status];
  const expiry = formatExpiry(action.expiresAt);
  const Icon = ACTION_ICON[action.id] ?? Target;
  const isClosed = action.status !== "pending";

  return (
    <motion.article
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
      transition={{ duration: 0.28, delay: reduceMotion ? 0 : Math.min(index * 0.04, 0.24) }}
      className={cn(
        "rp-glass rounded-xl border-l-2 overflow-hidden",
        pMeta.border,
        isClosed && "opacity-75"
      )}
    >
      <div className="p-4 sm:p-5">
        {/* Top row: icon + title + status badge */}
        <div className="flex items-start gap-3.5">
          <div
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-lg",
              pMeta.tone === "destructive"
                ? "bg-destructive/10 text-destructive"
                : pMeta.tone === "gold"
                ? "bg-[var(--gold)]/10 text-[var(--gold)]"
                : "bg-muted/40 text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-lg sm:text-xl text-foreground leading-tight">
                {action.action}
              </h3>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                  pMeta.badge
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", pMeta.dot)} />
                {pMeta.label} prioridad
              </span>
              {isClosed && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                    sMeta.badge
                  )}
                >
                  <sMeta.icon className="h-3 w-3" />
                  {sMeta.label}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{action.reason}</p>
          </div>
        </div>

        {/* Impact + confidence row */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 sm:gap-4 sm:items-center">
          <div className="flex items-center gap-2.5 flex-wrap">
            <TrendingUp className="h-4 w-4 rp-gold-text shrink-0" />
            <span className="font-display text-base sm:text-lg rp-gold-gradient font-semibold">
              {action.estimatedImpact}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium cursor-help",
                    confidenceTone(action.confidence)
                  )}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Confianza {action.confidence}%
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[240px]">
                Confianza del modelo en la recomendación. ≥85% alta · 70-84% media-alta · 60-69%
                media · &lt;60% baja.
              </TooltipContent>
            </Tooltip>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
                expiry.urgent
                  ? "bg-destructive/10 text-destructive border-destructive/30"
                  : "bg-muted/40 text-muted-foreground border-muted-foreground/20"
              )}
            >
              <CalendarClock className="h-3.5 w-3.5" />
              {expiry.label}
            </span>
          </div>
        </div>

        {/* Data used chips */}
        <div className="mt-3.5 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground/80">
            Datos usados
          </span>
          {action.dataUsed.map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] text-foreground/80"
            >
              <span className="h-1 w-1 rounded-full rp-teal-text bg-current opacity-70" />
              {d}
            </span>
          ))}
        </div>

        {/* Rule/model reference */}
        <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 rp-teal-text" />
          <span className="font-mono tracking-tight">{action.ruleOrModel}</span>
        </div>

        {/* Actions */}
        {!isClosed && (
          <div className="mt-4 flex flex-wrap gap-2 pt-3.5 border-t border-border/40">
            <Button
              size="sm"
              onClick={() => onStatusChange(action.id, "accepted")}
              className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] hover:text-black min-h-9"
            >
              <CheckCircle2 className="h-4 w-4" />
              Aceptar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(action.id, "postponed")}
              className="min-h-9"
            >
              <Clock className="h-4 w-4" />
              Posponer
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onStatusChange(action.id, "rejected")}
              className="text-muted-foreground hover:text-destructive min-h-9"
            >
              <XCircle className="h-4 w-4" />
              Rechazar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onStatusChange(action.id, "irrelevant")}
              className="text-muted-foreground hover:text-muted-foreground min-h-9"
            >
              <Ban className="h-4 w-4" />
              Irrelevante
            </Button>
          </div>
        )}
      </div>
    </motion.article>
  );
}

export default CrmNextAction;
