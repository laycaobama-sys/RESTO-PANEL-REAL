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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Brain, RefreshCw, AlertTriangle, ShieldCheck, Info, ChevronDown,
  TrendingUp, TrendingDown, Sparkles, CalendarClock, Cpu, ListChecks,
  CircleDot, UserX, CreditCard, Clock4, MessageCircle, CalendarDays,
  Hash, Phone,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type DataQuality = "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT";

interface NoShowScore {
  score: number;
  riskLevel: RiskLevel;
  confidence: number;
  factors: { label: string; impact: number; detail: string }[];
  recommendedAction: string;
  modelVersion: string;
  calculatedAt: string;
  dataQuality: DataQuality;
}

interface DemoReservation {
  id: string;
  label: string;
  customerName: string;
  partySize: number;
  time: string;
  dateLabel: string;
  phone?: string;
  channel: string;
  score: NoShowScore;
}

/* =========================================================
 * Color / risk meta
 * =======================================================*/
const RISK_META: Record<
  RiskLevel,
  { color: string; ring: string; softBg: string; label: string; dot: string }
> = {
  LOW: {
    color: "#34D399",
    ring: "ring-emerald-400/40",
    softBg: "bg-emerald-400/10 border-emerald-400/40 text-emerald-300",
    label: "Bajo",
    dot: "bg-emerald-400",
  },
  MEDIUM: {
    color: "#FBBF24",
    ring: "ring-amber-400/40",
    softBg: "bg-amber-400/10 border-amber-400/40 text-amber-300",
    label: "Medio",
    dot: "bg-amber-400",
  },
  HIGH: {
    color: "#FB923C",
    ring: "ring-orange-400/40",
    softBg: "bg-orange-400/10 border-orange-400/40 text-orange-300",
    label: "Alto",
    dot: "bg-orange-400",
  },
  CRITICAL: {
    color: "#F87171",
    ring: "ring-destructive/50",
    softBg: "bg-destructive/10 border-destructive/50 text-destructive",
    label: "Crítico",
    dot: "bg-destructive",
  },
};

const DQ_META: Record<
  DataQuality,
  { label: string; className: string; tooltip: string }
> = {
  HIGH: {
    label: "Alta",
    className: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
    tooltip:
      "Datos suficientes: histórico de cliente + contexto operativo + confirmación. Score basado en modelo ML.",
  },
  MEDIUM: {
    label: "Media",
    className: "bg-amber-400/10 text-amber-300 border-amber-400/30",
    tooltip:
      "Datos parciales: el cliente tiene algo de histórico pero faltan señales contextuales. Score con sesgo moderado.",
  },
  LOW: {
    label: "Baja",
    className: "bg-orange-400/10 text-orange-300 border-orange-400/30",
    tooltip:
      "Datos limitados: cliente nuevo o sin suficiente histórico. Score basado mayoritariamente en reglas deterministas.",
  },
  INSUFFICIENT: {
    label: "Insuficiente",
    className: "bg-destructive/10 text-destructive border-destructive/30",
    tooltip:
      "Datos insuficientes: no se puede ejecutar el modelo ML. Se aplica un set de reglas deterministas configurables como fallback.",
  },
};

const CHANNEL_ICON: Record<string, React.ElementType> = {
  WhatsApp: MessageCircle,
  Web: Globe2,
  Teléfono: Phone,
  Google: Globe2,
  Instagram: Sparkles,
};

function Globe2(props: React.ComponentProps<"svg">) {
  // Reuse a simple globe fallback if not available in lucide
  return <CircleDot {...props} />;
}

/* =========================================================
 * Demo data
 * =======================================================*/
const DEMO_RESERVATIONS: DemoReservation[] = [
  {
    id: "res-low",
    label: "Carlos Méndez · Vie 21:00 · 2p",
    customerName: "Carlos Méndez",
    partySize: 2,
    time: "21:00",
    dateLabel: "Viernes 24 ene",
    phone: "+34 612 33 11 22",
    channel: "WhatsApp",
    score: {
      score: 14,
      riskLevel: "LOW",
      confidence: 88,
      dataQuality: "HIGH",
      modelVersion: "ns-xgb-v2.4.1",
      calculatedAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
      recommendedAction:
        "Mantener reserva sin acciones adicionales. Enviar recordatorio estándar por WhatsApp 3h antes del servicio.",
      factors: [
        {
          label: "Cliente recurrente",
          impact: -15,
          detail: "15 visitas en el último año, ticket medio 78€.",
        },
        {
          label: "Confirmado por WhatsApp",
          impact: -10,
          detail: "Confirmación activa registrada hace 2h.",
        },
        {
          label: "Sin no-shows previos",
          impact: -12,
          detail: "0 faltas en los últimos 12 meses.",
        },
        {
          label: "Hora punta viernes",
          impact: +12,
          detail:
            "Las reservas de viernes 21:00 presentan mayor tasa de no-show histórica (+8% sobre la media).",
        },
        {
          label: "Sin depósito",
          impact: +5,
          detail: "No se ha requerido garantía para esta reserva.",
        },
      ],
    },
  },
  {
    id: "res-med",
    label: "Lucía Romero · Sáb 14:30 · 4p",
    customerName: "Lucía Romero",
    partySize: 4,
    time: "14:30",
    dateLabel: "Sábado 25 ene",
    phone: "+34 699 11 50 03",
    channel: "Web",
    score: {
      score: 38,
      riskLevel: "MEDIUM",
      confidence: 71,
      dataQuality: "MEDIUM",
      modelVersion: "ns-xgb-v2.4.1",
      calculatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      recommendedAction:
        "Solicitar reconfirmación por WhatsApp 4h antes del servicio. Considerar activar garantía si no responde.",
      factors: [
        {
          label: "1 no-show previo",
          impact: +18,
          detail: "El cliente ha faltado 1 vez en los últimos 6 meses.",
        },
        {
          label: "Sin depósito",
          impact: +20,
          detail: "No se ha requerido garantía para esta reserva.",
        },
        {
          label: "Canal web",
          impact: +6,
          detail: "Las reservas web tienen +3% de no-show frente a WhatsApp.",
        },
        {
          label: "Grupo de 4",
          impact: -8,
          detail: "Grupos de 4 tienen mejor tasa de asistencia que parejas.",
        },
        {
          label: "Cliente conocido",
          impact: -8,
          detail: "6 visitas previas registradas en el último año.",
        },
      ],
    },
  },
  {
    id: "res-high",
    label: "Marco Bellini · Vie 22:30 · 6p",
    customerName: "Marco Bellini",
    partySize: 6,
    time: "22:30",
    dateLabel: "Viernes 24 ene",
    phone: "+34 655 87 09 14",
    channel: "Google",
    score: {
      score: 82,
      riskLevel: "CRITICAL",
      confidence: 64,
      dataQuality: "LOW",
      modelVersion: "ns-xgb-v2.4.1",
      calculatedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      recommendedAction:
        "Requerir depósito de 30€/persona para mantener la reserva. Si rechaza, ofrecer reprogramar a horario de menor riesgo o liberar la mesa.",
      factors: [
        {
          label: "2 no-shows previos",
          impact: +35,
          detail: "El cliente ha faltado 2 veces en los últimos 6 meses.",
        },
        {
          label: "Sin depósito",
          impact: +20,
          detail: "No se ha requerido garantía para esta reserva.",
        },
        {
          label: "Reserva de última hora",
          impact: +14,
          detail: "Reserva creada hace menos de 6h para servicio de hoy.",
        },
        {
          label: "Hora punta viernes tarde",
          impact: +16,
          detail:
            "Viernes 22:30 con grupos ≥6: tasa histórica de no-show del 27%.",
        },
        {
          label: "Canal Google",
          impact: +8,
          detail: "Reservas Google tienen tasa de no-show +5% sobre la media.",
        },
        {
          label: "Grupo numeroso",
          impact: -6,
          detail: "Grupos grandes suelen avisar antes de faltar (señal débil).",
        },
      ],
    },
  },
];

const INSUFFICIENT_SCORE: NoShowScore = {
  score: 52,
  riskLevel: "HIGH",
  confidence: 30,
  dataQuality: "INSUFFICIENT",
  modelVersion: "rules-fallback-v1.0",
  calculatedAt: new Date().toISOString(),
  recommendedAction:
    "Datos insuficientes para ejecutar el modelo ML. Aplicar regla determinista: solicitar reconfirmación telefónica 4h antes del servicio.",
  factors: [
    {
      label: "Cliente sin histórico",
      impact: +25,
      detail:
        "Cliente nuevo (0 visitas previas). Sin datos suficientes para clasificación ML.",
    },
    {
      label: "Sin canal de confirmación",
      impact: +15,
      detail: "No se dispone de WhatsApp ni email verificados.",
    },
    {
      label: "Reserva de última hora",
      impact: +12,
      detail: "Creada hace 3h para servicio de esta noche.",
    },
  ],
};

/* =========================================================
 * Helpers
 * =======================================================*/
function riskFromScore(score: number): RiskLevel {
  if (score <= 24) return "LOW";
  if (score <= 49) return "MEDIUM";
  if (score <= 74) return "HIGH";
  return "CRITICAL";
}

function colorForScore(score: number): string {
  return RISK_META[riskFromScore(score)].color;
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "hace unos segundos";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}

/* =========================================================
 * Circular gauge
 * =======================================================*/
function ScoreGauge({
  score,
  color,
  regenerating,
}: {
  score: number;
  color: string;
  regenerating: boolean;
}) {
  const reduce = useReducedMotion();
  const R = 76;
  const C = 2 * Math.PI * R;
  const animatedScore = React.useRef(0);
  const [displayScore, setDisplayScore] = React.useState(0);

  React.useEffect(() => {
    if (reduce) {
      setDisplayScore(score);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const from = animatedScore.current;
    const duration = 850;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(from + (score - from) * eased);
      setDisplayScore(val);
      if (t < 1) raf = requestAnimationFrame(tick);
      else animatedScore.current = score;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score, reduce]);

  const progress = displayScore / 100;

  return (
    <div className="relative grid place-items-center" style={{ width: 200, height: 200 }}>
      <svg
        width={200}
        height={200}
        viewBox="0 0 200 200"
        className="-rotate-90"
        role="img"
        aria-label={`Puntuación de riesgo de no-show: ${score} sobre 100`}
      >
        <circle
          cx={100}
          cy={100}
          r={R}
          fill="none"
          stroke="color-mix(in oklab, var(--foreground) 12%, transparent)"
          strokeWidth={12}
        />
        <motion.circle
          cx={100}
          cy={100}
          r={R}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C * (1 - progress) }}
          transition={{ duration: reduce ? 0 : 0.85, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 10px ${color}66)` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div
            className={cn(
              "font-display text-5xl font-light tabular-nums",
              regenerating && "opacity-50"
            )}
            style={{ color }}
          >
            {displayScore}
          </div>
          <div className="mt-0.5 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            riesgo · /100
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Impact bar (factor row)
 * =======================================================*/
function FactorRow({
  label,
  impact,
  detail,
  index,
}: {
  label: string;
  impact: number;
  detail: string;
  index: number;
}) {
  const reduce = useReducedMotion();
  const positive = impact >= 0;
  const max = 40;
  const width = Math.min(100, (Math.abs(impact) / max) * 100);
  const color = positive
    ? "var(--destructive)"
    : "var(--teal)";

  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: reduce ? 0 : index * 0.04 }}
      className="rounded-xl border border-border/40 bg-foreground/[0.025] p-3.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{label}</span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-mono",
                positive
                  ? "bg-destructive/10 text-destructive"
                  : "bg-[var(--teal)]/10 text-[var(--teal)]"
              )}
            >
              {positive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {positive ? "+" : ""}
              {impact}
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {detail}
          </p>
        </div>
      </div>
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-foreground/5">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.6, delay: reduce ? 0 : 0.1 + index * 0.04 }}
        />
      </div>
    </motion.li>
  );
}

/* =========================================================
 * Rules expandable
 * =======================================================*/
const DEMO_RULES = [
  {
    id: "r1",
    name: "no_show_history",
    desc: "Suma +15 por cada no-show en los últimos 6 meses (máx 3).",
    active: true,
  },
  {
    id: "r2",
    name: "no_deposit",
    desc: "Suma +20 si la reserva no tiene garantía (tarjeta o prepago).",
    active: true,
  },
  {
    id: "r3",
    name: "last_minute_booking",
    desc: "Suma +14 si la reserva se creó con menos de 6h de antelación.",
    active: true,
  },
  {
    id: "r4",
    name: "peak_slot",
    desc: "Suma +12 si el horario está en el top 25% de no-shows históricos.",
    active: true,
  },
  {
    id: "r5",
    name: "confirmed_recently",
    desc: "Resta -10 si hay confirmación activa del cliente en las últimas 6h.",
    active: true,
  },
  {
    id: "r6",
    name: "vip_status",
    desc: "Resta -12 si el cliente es VIP (≥12 visitas y avgRating ≥4.2).",
    active: false,
  },
  {
    id: "r7",
    name: "channel_web",
    desc: "Suma +6 si el canal es Web o Google (vs. WhatsApp -2).",
    active: true,
  },
  {
    id: "r8",
    name: "returning_customer",
    desc: "Resta -15 si el cliente tiene ≥10 visitas en el último año.",
    active: true,
  },
];

/* =========================================================
 * Main component
 * =======================================================*/
export function PredictionPanel() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [selectedId, setSelectedId] = useStateDemo("res-high");
  const [showInsufficient, setShowInsufficient] = React.useState(false);
  const [regenerating, setRegenerating] = React.useState(false);
  const [rulesOpen, setRulesOpen] = React.useState(false);

  const selected = DEMO_RESERVATIONS.find((r) => r.id === selectedId)!;
  const score = showInsufficient ? INSUFFICIENT_SCORE : selected.score;
  const riskColor = colorForScore(score.score);
  const riskMeta = RISK_META[score.riskLevel];
  const dqMeta = DQ_META[score.dataQuality];

  const handleRegenerate = () => {
    setRegenerating(true);
    window.setTimeout(() => {
      setRegenerating(false);
      toast({
        title: "Predicción regenerada",
        description: `Score actualizado: ${score.score}/100 · ${riskMeta.label}.`,
      });
    }, 1200);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <section
        aria-labelledby="prediction-title"
        className="flex flex-col gap-5"
      >
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--gold)]/10 text-[var(--gold)]">
                <Brain className="h-5 w-5" />
              </span>
              <h2
                id="prediction-title"
                className="font-display text-xl sm:text-2xl font-medium tracking-tight"
              >
                Predicción de no-show
              </h2>
              <Badge
                variant="outline"
                className="border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)] font-mono text-[10px] uppercase tracking-wider"
              >
                demo
              </Badge>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Scoring explicable por reserva. Combina modelo ML y reglas deterministas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="h-10 w-[260px] text-sm">
                <SelectValue placeholder="Seleccionar reserva" />
              </SelectTrigger>
              <SelectContent>
                {DEMO_RESERVATIONS.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          {/* LEFT: Gauge + key badges */}
          <div className="rp-glass rounded-2xl p-5 sm:p-6">
            <div className="flex flex-col items-center gap-5">
              <ScoreGauge
                score={score.score}
                color={riskColor}
                regenerating={regenerating}
              />

              <div className="flex flex-wrap items-center justify-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-mono uppercase tracking-wider",
                    riskMeta.softBg
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", riskMeta.dot)} />
                  Riesgo {riskMeta.label}
                </span>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border/40 bg-foreground/[0.04] px-2.5 py-1 text-xs">
                      <ShieldCheck className="h-3.5 w-3.5 text-[var(--teal)]" />
                      Confianza{" "}
                      <span className="font-mono tabular-nums text-foreground">
                        {score.confidence}%
                      </span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[220px]">
                    Confianza del modelo en la predicción. Mayor % = más señales disponibles.
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className={cn(
                        "inline-flex cursor-help items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs",
                        dqMeta.className
                      )}
                    >
                      <Info className="h-3.5 w-3.5" />
                      Datos: {dqMeta.label}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[260px]">
                    {dqMeta.tooltip}
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Reservation context */}
              <div className="mt-1 w-full rounded-xl border border-border/40 bg-foreground/[0.025] p-3.5">
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-sm sm:grid-cols-3">
                  <ContextItem
                    icon={UserX}
                    label="Cliente"
                    value={selected.customerName}
                  />
                  <ContextItem
                    icon={Hash}
                    label="Comensales"
                    value={`${selected.partySize} pax`}
                  />
                  <ContextItem
                    icon={CalendarClock}
                    label="Servicio"
                    value={`${selected.dateLabel} · ${selected.time}`}
                  />
                  <ContextItem
                    icon={Phone}
                    label="Teléfono"
                    value={selected.phone ?? "—"}
                  />
                  <ContextItem
                    icon={CalendarDays}
                    label="Canal"
                    value={selected.channel}
                  />
                  <ContextItem
                    icon={CreditCard}
                    label="Garantía"
                    value="Ninguna"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                className="h-10 w-full sm:w-auto"
                onClick={handleRegenerate}
                disabled={regenerating}
              >
                <RefreshCw
                  className={cn("h-4 w-4", regenerating && "animate-spin")}
                />
                {regenerating ? "Regenerando…" : "Regenerar predicción"}
              </Button>
            </div>
          </div>

          {/* RIGHT: factors + action */}
          <div className="flex flex-col gap-4">
            <div className="rp-glass rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
                  Factores aplicados · {score.factors.length}
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  Impacto neto:{" "}
                  <span
                    className={cn(
                      "font-mono tabular-nums",
                      score.factors.reduce((a, f) => a + f.impact, 0) >= 0
                        ? "text-destructive"
                        : "text-[var(--teal)]"
                    )}
                  >
                    {score.factors.reduce((a, f) => a + f.impact, 0) > 0 ? "+" : ""}
                    {score.factors.reduce((a, f) => a + f.impact, 0)}
                  </span>
                </span>
              </div>
              <ul className="mt-3 space-y-2.5">
                {score.factors.map((f, i) => (
                  <FactorRow
                    key={f.label}
                    label={f.label}
                    impact={f.impact}
                    detail={f.detail}
                    index={i}
                  />
                ))}
              </ul>
            </div>

            {/* Recommended action */}
            <motion.div
              key={score.recommendedAction}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rp-glass rounded-2xl border-l-2 border-[var(--gold)] p-5"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--gold)]" />
                <span className="text-xs font-mono uppercase tracking-wider rp-gold-text">
                  Acción recomendada
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                {score.recommendedAction}
              </p>
            </motion.div>

            {/* Fallback notice */}
            {score.dataQuality === "INSUFFICIENT" && (
              <div className="rp-glass flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <div className="text-sm">
                  <p className="font-medium text-destructive">
                    Datos insuficientes — usando reglas deterministas configurables
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    El modelo ML no se ejecuta con &lt;5 señales. Se aplica el set de
                    reglas del restaurante hasta acumular histórico suficiente.
                  </p>
                </div>
              </div>
            )}

            {/* Model info */}
            <div className="rp-glass flex flex-wrap items-center justify-between gap-3 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Cpu className="h-3.5 w-3.5 rp-teal-text" />
                <span className="font-mono">model: {score.modelVersion}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock4 className="h-3.5 w-3.5" />
                <span>Calculado {formatRelative(score.calculatedAt)}</span>
              </div>
            </div>

            {/* Rules expandable */}
            <Collapsible open={rulesOpen} onOpenChange={setRulesOpen}>
              <div className="rp-glass rounded-xl">
                <CollapsibleTrigger asChild>
                  <button
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                    aria-expanded={rulesOpen}
                  >
                    <span className="flex items-center gap-2 text-sm">
                      <ListChecks className="h-4 w-4 text-[var(--gold)]" />
                      Ver reglas aplicadas
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        rulesOpen && "rotate-180"
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t border-border/40 p-4">
                    <p className="mb-3 text-xs text-muted-foreground">
                      Reglas deterministas aplicables cuando el modelo ML no está
                      disponible o los datos son insuficientes. Configurables desde{" "}
                      <span className="rp-gold-text">Operación · Reglas de scoring</span>.
                    </p>
                    <ul className="space-y-2 rp-scroll-thin max-h-[260px] overflow-y-auto pr-1">
                      {DEMO_RULES.map((r) => (
                        <li
                          key={r.id}
                          className="flex items-start justify-between gap-3 rounded-lg border border-border/30 bg-foreground/[0.025] p-2.5"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <code className="font-mono text-xs rp-gold-text">
                                {r.name}
                              </code>
                              <span
                                className={cn(
                                  "rounded px-1.5 py-0.5 text-[10px] font-mono uppercase",
                                  r.active
                                    ? "bg-emerald-400/10 text-emerald-300"
                                    : "bg-foreground/5 text-muted-foreground"
                                )}
                              >
                                {r.active ? "activa" : "inactiva"}
                              </span>
                            </div>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                              {r.desc}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 h-8 text-xs"
                      onClick={() =>
                        setShowInsufficient((v) => {
                          toast({
                            title: v
                              ? "Vista modelo ML"
                              : "Vista fallback · reglas deterministas",
                            description: v
                              ? "Mostrando score con datos suficientes."
                              : "Mostrando score con datos insuficientes.",
                          });
                          return !v;
                        })
                      }
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {showInsufficient
                        ? "Ver perfil con datos suficientes"
                        : "Simular datos insuficientes"}
                    </Button>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}

/* =========================================================
 * Small context cell
 * =======================================================*/
function ContextItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-0.5 truncate text-sm text-foreground/90">{value}</div>
    </div>
  );
}

/* =========================================================
 * Local state hook (keeps selectedId stable across rerenders)
 * =======================================================*/
function useStateDemo(initial: string) {
  return React.useState<string>(initial);
}
