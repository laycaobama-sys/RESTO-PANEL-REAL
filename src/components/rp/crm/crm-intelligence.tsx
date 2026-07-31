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
  TrendingDown,
  Sparkles,
  Clock,
  CalendarClock,
  Cpu,
  Wallet,
  RotateCcw,
  MessageCircle,
  Megaphone,
  ShieldCheck,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type DataQuality = "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT";

interface Prediction {
  label: string;
  value: string;
  confidence: number;
  factors: string[];
  dataQuality: DataQuality;
  modelVersion: string;
  calculatedAt: string;
  expiresAt: string;
}

interface DemoCustomer {
  id: string;
  name: string;
  email: string;
  tier: string;
  visits: number;
  ltv: number;
  lastVisit: string;
  predictions: Prediction[];
}

/* =========================================================
 * Meta
 * =======================================================*/
const DQ_META: Record<
  DataQuality,
  { label: string; className: string; dot: string; tooltip: string }
> = {
  HIGH: {
    label: "Datos: Alta",
    className: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
    dot: "bg-emerald-400",
    tooltip:
      "Datos suficientes: histórico del cliente, contexto operativo y consentimiento confirmado. Predicción basada en modelo ML.",
  },
  MEDIUM: {
    label: "Datos: Media",
    className: "bg-[var(--gold)]/10 text-[var(--gold-soft)] border-[var(--gold)]/30",
    dot: "bg-[var(--gold)]",
    tooltip:
      "Datos parciales: histórico limitado o faltan señales contextuales. Predicción con sesgo moderado.",
  },
  LOW: {
    label: "Datos: Baja",
    className: "bg-amber-400/10 text-amber-300 border-amber-400/30",
    dot: "bg-amber-400",
    tooltip:
      "Datos limitados: cliente nuevo o sin histórico suficiente. Predicción basada mayoritariamente en reglas deterministas.",
  },
  INSUFFICIENT: {
    label: "Datos: Insuficientes",
    className: "bg-destructive/10 text-destructive border-destructive/30",
    dot: "bg-destructive",
    tooltip:
      "Datos insuficientes: no se puede ejecutar el modelo ML. Se aplican reglas deterministas configurables como fallback.",
  },
};

type PredictionKey =
  | "ltv"
  | "return"
  | "churn"
  | "channel"
  | "timing"
  | "campaign";

const PRED_META: Record<
  PredictionKey,
  { icon: React.ElementType; tone: "gold" | "teal" | "emerald" | "amber" | "fuchsia" }
> = {
  ltv: { icon: Wallet, tone: "gold" },
  return: { icon: RotateCcw, tone: "teal" },
  churn: { icon: ShieldCheck, tone: "emerald" },
  channel: { icon: MessageCircle, tone: "teal" },
  timing: { icon: Clock, tone: "amber" },
  campaign: { icon: Megaphone, tone: "fuchsia" },
};

const TONE_VALUE: Record<string, string> = {
  gold: "rp-gold-text",
  teal: "rp-teal-text",
  emerald: "text-emerald-300",
  amber: "text-amber-300",
  fuchsia: "text-fuchsia-300",
};

const TONE_BAR: Record<string, string> = {
  gold: "bg-[var(--gold)]",
  teal: "bg-[var(--teal)]",
  emerald: "bg-emerald-400",
  amber: "bg-amber-400",
  fuchsia: "bg-fuchsia-400",
};

/* =========================================================
 * Helpers
 * =======================================================*/
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
  if (diff <= 0) return "expirada";
  const h = Math.floor(diff / 3600000);
  if (h < 1) {
    const min = Math.floor(diff / 60000);
    return `expira en ${min} min`;
  }
  if (h < 24) return `expira en ${h} h`;
  const d = Math.floor(h / 24);
  return `expira en ${d} d`;
}

/* =========================================================
 * Demo data — 3 customers with different profiles
 * =======================================================*/
const now = Date.now();

const DEMO_CUSTOMERS: DemoCustomer[] = [
  {
    id: "cust-1",
    name: "Elena Marín",
    email: "elena.marin@example.com",
    tier: "Oro",
    visits: 15,
    ltv: 2840,
    lastVisit: "hace 6 días",
    predictions: [
      {
        label: "Lifetime Value (12m)",
        value: "€2.840",
        confidence: 82,
        factors: ["15 visitas en 12 meses", "Ticket medio €42", "Tendencia alcista"],
        dataQuality: "HIGH",
        modelVersion: "ltv-prophet-v1.3",
        calculatedAt: new Date(now - 1000 * 60 * 12).toISOString(),
        expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 7).toISOString(),
      },
      {
        label: "Probabilidad de volver",
        value: "78%",
        confidence: 75,
        factors: ["Cliente recurrente", "Última visita hace 6 días", "3 reservas futuras"],
        dataQuality: "HIGH",
        modelVersion: "retention-xgb-v2.1",
        calculatedAt: new Date(now - 1000 * 60 * 12).toISOString(),
        expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 3).toISOString(),
      },
      {
        label: "Riesgo de abandono",
        value: "Bajo (12%)",
        confidence: 80,
        factors: ["Frecuencia estable", "Sin cancelaciones recientes", "LTV creciente"],
        dataQuality: "HIGH",
        modelVersion: "churn-xgb-v3.0",
        calculatedAt: new Date(now - 1000 * 60 * 12).toISOString(),
        expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 3).toISOString(),
      },
      {
        label: "Canal recomendado",
        value: "WhatsApp",
        confidence: 88,
        factors: ["85% apertura en WhatsApp", "Responde en 12min promedio", "Consentimiento activo"],
        dataQuality: "HIGH",
        modelVersion: "channel-rf-v0.9",
        calculatedAt: new Date(now - 1000 * 60 * 12).toISOString(),
        expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 14).toISOString(),
      },
      {
        label: "Mejor momento de contacto",
        value: "Martes 11:00",
        confidence: 70,
        factors: ["Reservas históricas en martes", "Activa a media mañana", "Evitar fines de semana"],
        dataQuality: "MEDIUM",
        modelVersion: "timing-arima-v1.4",
        calculatedAt: new Date(now - 1000 * 60 * 12).toISOString(),
        expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 5).toISOString(),
      },
      {
        label: "Respuesta a campaña",
        value: "64%",
        confidence: 65,
        factors: ["Respondió 3 de 5 campañas", "Usa cupones regularmente", "Alta interacción"],
        dataQuality: "MEDIUM",
        modelVersion: "campaign-xgb-v1.2",
        calculatedAt: new Date(now - 1000 * 60 * 12).toISOString(),
        expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 7).toISOString(),
      },
    ],
  },
  {
    id: "cust-2",
    name: "Marco Bellini",
    email: "marco.bellini@example.com",
    tier: "Black",
    visits: 42,
    ltv: 8450,
    lastVisit: "hace 2 días",
    predictions: [
      {
        label: "Lifetime Value (12m)",
        value: "€8.450",
        confidence: 91,
        factors: ["42 visitas en 12 meses", "Ticket medio €98", "Cliente VIP consolidado"],
        dataQuality: "HIGH",
        modelVersion: "ltv-prophet-v1.3",
        calculatedAt: new Date(now - 1000 * 60 * 8).toISOString(),
        expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 7).toISOString(),
      },
      {
        label: "Probabilidad de volver",
        value: "94%",
        confidence: 89,
        factors: ["Cliente VIP recurrente", "Última visita hace 2 días", "5 reservas futuras"],
        dataQuality: "HIGH",
        modelVersion: "retention-xgb-v2.1",
        calculatedAt: new Date(now - 1000 * 60 * 8).toISOString(),
        expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 3).toISOString(),
      },
      {
        label: "Riesgo de abandono",
        value: "Muy bajo (3%)",
        confidence: 92,
        factors: ["Patrón semanal estable", "Cero cancelaciones en 12m", "LTV en crecimiento"],
        dataQuality: "HIGH",
        modelVersion: "churn-xgb-v3.0",
        calculatedAt: new Date(now - 1000 * 60 * 8).toISOString(),
        expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 3).toISOString(),
      },
      {
        label: "Canal recomendado",
        value: "WhatsApp",
        confidence: 94,
        factors: ["98% apertura en WhatsApp", "Responde en 4min promedio", "Consentimiento activo"],
        dataQuality: "HIGH",
        modelVersion: "channel-rf-v0.9",
        calculatedAt: new Date(now - 1000 * 60 * 8).toISOString(),
        expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 14).toISOString(),
      },
      {
        label: "Mejor momento de contacto",
        value: "Miércoles 10:30",
        confidence: 78,
        factors: ["Reservas regulares en miércoles", "Prefiere media mañana", "Disponible días laborables"],
        dataQuality: "HIGH",
        modelVersion: "timing-arima-v1.4",
        calculatedAt: new Date(now - 1000 * 60 * 8).toISOString(),
        expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 5).toISOString(),
      },
      {
        label: "Respuesta a campaña",
        value: "81%",
        confidence: 74,
        factors: ["Respondió 7 de 8 campañas", "Cupón VIP canjeado", "Refiere a otros clientes"],
        dataQuality: "HIGH",
        modelVersion: "campaign-xgb-v1.2",
        calculatedAt: new Date(now - 1000 * 60 * 8).toISOString(),
        expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 7).toISOString(),
      },
    ],
  },
  {
    id: "cust-3",
    name: "Paula Nieva",
    email: "paula.nieva@example.com",
    tier: "Nuevo",
    visits: 2,
    ltv: 84,
    lastVisit: "hace 41 días",
    predictions: [
      {
        label: "Lifetime Value (12m)",
        value: "€610",
        confidence: 38,
        factors: ["2 visitas registradas", "Ticket medio €42", "Sin tendencia clara"],
        dataQuality: "LOW",
        modelVersion: "ltv-prophet-v1.3",
        calculatedAt: new Date(now - 1000 * 60 * 3).toISOString(),
        expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 2).toISOString(),
      },
      {
        label: "Probabilidad de volver",
        value: "31%",
        confidence: 44,
        factors: ["Cliente nuevo", "Última visita hace 41 días", "Sin reservas futuras"],
        dataQuality: "LOW",
        modelVersion: "retention-xgb-v2.1",
        calculatedAt: new Date(now - 1000 * 60 * 3).toISOString(),
        expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 2).toISOString(),
      },
      {
        label: "Riesgo de abandono",
        value: "Alto (62%)",
        confidence: 52,
        factors: ["Recencia elevada", "Sin interacción tras 2ª visita", "Canal no capturado"],
        dataQuality: "LOW",
        modelVersion: "churn-xgb-v3.0",
        calculatedAt: new Date(now - 1000 * 60 * 3).toISOString(),
        expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 2).toISOString(),
      },
      {
        label: "Canal recomendado",
        value: "Email",
        confidence: 22,
        factors: ["Sin consentimiento WhatsApp", "Email disponible", "Falta histórico de respuesta"],
        dataQuality: "INSUFFICIENT",
        modelVersion: "rules-det-v1.0",
        calculatedAt: new Date(now - 1000 * 60 * 3).toISOString(),
        expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 1).toISOString(),
      },
      {
        label: "Mejor momento de contacto",
        value: "—",
        confidence: 12,
        factors: ["Datos insuficientes", "Sin patrón temporal detectado"],
        dataQuality: "INSUFFICIENT",
        modelVersion: "rules-det-v1.0",
        calculatedAt: new Date(now - 1000 * 60 * 3).toISOString(),
        expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 1).toISOString(),
      },
      {
        label: "Respuesta a campaña",
        value: "—",
        confidence: 8,
        factors: ["Sin campañas previas", "Sin interacciones registradas"],
        dataQuality: "INSUFFICIENT",
        modelVersion: "rules-det-v1.0",
        calculatedAt: new Date(now - 1000 * 60 * 3).toISOString(),
        expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 1).toISOString(),
      },
    ],
  },
];

/* =========================================================
 * Sub-components
 * =======================================================*/
function PredictionCard({
  prediction,
  index,
  reduceMotion,
}: {
  prediction: Prediction;
  index: number;
  reduceMotion: boolean | null;
}) {
  const meta = PRED_META[
    Object.keys(PRED_META)[index] as PredictionKey
  ] ?? { icon: Brain, tone: "gold" as const };
  const Icon = meta.icon;
  const cTone = confidenceTone(prediction.confidence);
  const dq = DQ_META[prediction.dataQuality];
  const isInsufficient = prediction.dataQuality === "INSUFFICIENT";

  return (
    <motion.article
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: reduceMotion ? 0 : Math.min(index * 0.05, 0.35) }}
      className={cn(
        "rp-glass rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden",
        isInsufficient && "ring-1 ring-destructive/30"
      )}
      aria-labelledby={`pred-label-${index}`}
    >
      {/* Top: label + icon */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
            "border-foreground/10 bg-foreground/5"
          )}>
            <Icon className={cn("h-4 w-4", TONE_VALUE[meta.tone])} />
          </span>
          <h3
            id={`pred-label-${index}`}
            className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground leading-tight"
          >
            {prediction.label}
          </h3>
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
                <span className={cn("h-1.5 w-1.5 rounded-full", dq.dot)} />
                {dq.label}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px] text-xs leading-relaxed">
              {dq.tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Big value */}
      <div className="flex items-baseline gap-2">
        <span className={cn(
          "font-display text-3xl sm:text-4xl font-light leading-none tracking-tight",
          TONE_VALUE[meta.tone]
        )}>
          {prediction.value}
        </span>
        {prediction.label.includes("abandono") && (
          <TrendingDown className="h-4 w-4 text-emerald-300" aria-hidden />
        )}
        {prediction.label.includes("Lifetime") && (
          <TrendingUp className="h-4 w-4 text-emerald-300" aria-hidden />
        )}
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
            {prediction.confidence}%
          </span>
        </div>
        <div
          className="h-1.5 w-full rounded-full bg-foreground/10 overflow-hidden"
          role="progressbar"
          aria-valuenow={prediction.confidence}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Confianza ${prediction.confidence} por ciento`}
        >
          <motion.div
            className={cn(
              "h-full rounded-full",
              cTone === "emerald" && "bg-emerald-400",
              cTone === "gold" && "bg-[var(--gold)]",
              cTone === "amber" && "bg-amber-400"
            )}
            initial={reduceMotion ? false : { width: 0 }}
            animate={{ width: `${prediction.confidence}%` }}
            transition={{ duration: 0.7, delay: reduceMotion ? 0 : 0.15 + index * 0.05, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Insufficient data warning */}
      {isInsufficient && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2.5">
          <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" aria-hidden />
          <p className="text-[11px] leading-relaxed text-destructive/90">
            Datos insuficientes — usando reglas deterministas.
          </p>
        </div>
      )}

      {/* Factors chips */}
      <div className="flex flex-wrap gap-1.5">
        {prediction.factors.map((f, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-md border border-foreground/10 bg-foreground/5 px-2 py-0.5 text-[11px] text-foreground/75"
          >
            <span className="h-1 w-1 rounded-full bg-[var(--gold)]" aria-hidden />
            {f}
          </span>
        ))}
      </div>

      {/* Model info */}
      <div className="mt-auto pt-3 border-t border-border/40 space-y-0.5">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/80">
          <Cpu className="h-3 w-3" aria-hidden />
          <span className="truncate">{prediction.modelVersion}</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-muted-foreground/70">
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-3 w-3" aria-hidden />
            {formatRelative(prediction.calculatedAt)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden />
            {formatExpires(prediction.expiresAt)}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

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
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">LTV</div>
            <div className="font-display text-base mt-0.5 rp-teal-text">€{customer.ltv.toLocaleString("es-ES")}</div>
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

/* =========================================================
 * Main
 * =======================================================*/
export function CrmIntelligence() {
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
        title: "Predicciones recalculadas",
        description: `Modelos ejecutados para ${customer.name}. 6 predicciones actualizadas.`,
      });
    }, 1000);
  };

  return (
    <section
      className="space-y-5 sm:space-y-6"
      aria-labelledby="crm-intel-heading"
    >
      {/* Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/10">
            <Brain className="h-5 w-5 rp-gold-text" aria-hidden />
          </span>
          <div>
            <h2
              id="crm-intel-heading"
              className="font-display text-xl sm:text-2xl font-medium tracking-tight text-foreground"
            >
              Inteligencia de cliente
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Predicciones accionables y explicables para cada cliente.
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
          <label className="sr-only" htmlFor="cust-select">
            Seleccionar cliente
          </label>
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger
              id="cust-select"
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
            {recalculating ? "Recalculando…" : "Recalcular predicciones"}
          </Button>
        </div>
      </header>

      {/* Customer context strip */}
      <CustomerHeader customer={customer} />

      {/* Predictions grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${customer.id}-${refreshKey}`}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5"
        >
          {customer.predictions.map((p, i) => (
            <PredictionCard
              key={`${customer.id}-${i}-${refreshKey}`}
              prediction={p}
              index={i}
              reduceMotion={reduceMotion}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Disclaimer */}
      <footer className="rp-glass rounded-xl p-4 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--teal)]/30 bg-[var(--teal)]/10">
          <Sparkles className="h-3.5 w-3.5 rp-teal-text" aria-hidden />
        </span>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Las predicciones son estimaciones basadas en datos históricos. No son garantías.{" "}
          <span className="text-foreground/80 font-medium">La IA recomienda, el humano decide.</span>
        </p>
      </footer>
    </section>
  );
}
