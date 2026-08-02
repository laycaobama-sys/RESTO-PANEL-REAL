"use client";

/* =========================================================
 * RestoPanel · ROI Calculator
 * ---------------------------------------------------------
 * Fase 3 · Entregable 3.6
 * Calculadora de ROI con sliders en vivo, recomendación de
 * plan, gráfico comparativo SVG y tabla de desglose.
 * Claims discipline (spec B.12): "Resultados estimados
 * basados en modelo de impacto. Media observada en 47
 * locales. Resultados variables."
 * =======================================================*/

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Calculator,
  Mail,
  FileDown,
  TrendingUp,
  CalendarX,
  Clock,
  Bike,
  Users,
  Store,
  Target,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Info,
  Percent,
  Euro,
  ChevronDown,
  Lightbulb,
  Gauge,
  Receipt,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/

interface RoiInputs {
  reservasMes: number;
  ticketMedio: number;
  noShowPct: number;
  personal: number;
  locales: number;
  recuperacionPct: number;
  deliveryMes: number;
  comisionAgregadores: number;
}

interface RoiResult {
  noShowsMes: number;
  noShowsEvitados: number;
  ingresosNoShows: number;
  tiempoAhorradoHoras: number;
  tiempoAhorradoEuros: number;
  ahorroDelivery: number;
  roiTotal: number;
  inversion: number;
  retorno: number;
  breakdown: {
    id: string;
    label: string;
    detail: string;
    value: number;
    icon: React.ElementType;
  }[];
}

type RecommendedPlan = "starter" | "professional" | "enterprise";

/* =========================================================
 * Constants
 * =======================================================*/

const PLAN_PRICE: Record<RecommendedPlan, number> = {
  starter: 49,
  professional: 99,
  enterprise: 0, // hablar con ventas
};

const DEFAULT_INPUTS: RoiInputs = {
  reservasMes: 350,
  ticketMedio: 38,
  noShowPct: 18,
  personal: 8,
  locales: 1,
  recuperacionPct: 55,
  deliveryMes: 120,
  comisionAgregadores: 28,
};

/* Sliders & fields config */
interface FieldSpec {
  id: keyof RoiInputs;
  label: string;
  icon: React.ElementType;
  type: "slider" | "number";
  min: number;
  max: number;
  step: number;
  suffix?: string;
  prefix?: string;
  hint?: string;
}

const FIELDS: FieldSpec[] = [
  {
    id: "reservasMes",
    label: "Reservas al mes",
    icon: CalendarX,
    type: "number",
    min: 20,
    max: 3000,
    step: 5,
    hint: "Reservas confirmadas al mes",
  },
  {
    id: "ticketMedio",
    label: "Ticket medio",
    icon: TrendingUp,
    type: "number",
    min: 8,
    max: 250,
    step: 1,
    prefix: "€",
    hint: "Gasto medio por reserva",
  },
  {
    id: "noShowPct",
    label: "% no-show actual",
    icon: Percent,
    type: "slider",
    min: 5,
    max: 30,
    step: 1,
    suffix: "%",
    hint: "Reservas que no se presentan",
  },
  {
    id: "personal",
    label: "Personal en sala+cocina",
    icon: Users,
    type: "number",
    min: 1,
    max: 60,
    step: 1,
    hint: "Equipo total",
  },
  {
    id: "locales",
    label: "Nº de locales",
    icon: Store,
    type: "number",
    min: 1,
    max: 50,
    step: 1,
    hint: "Locales del grupo",
  },
  {
    id: "recuperacionPct",
    label: "% de recuperación estimado",
    icon: Target,
    type: "slider",
    min: 20,
    max: 80,
    step: 1,
    suffix: "%",
    hint: "Cuánto reduces tus no-shows con confirmación +24h y reconfirmación",
  },
  {
    id: "deliveryMes",
    label: "Pedidos delivery al mes",
    icon: Bike,
    type: "number",
    min: 0,
    max: 2000,
    step: 5,
    hint: "Total pedidos delivery (todos los canales)",
  },
  {
    id: "comisionAgregadores",
    label: "Comisión agregadores actual",
    icon: Receipt,
    type: "slider",
    min: 20,
    max: 35,
    step: 1,
    suffix: "%",
    hint: "Glovo, Uber Eats, Just Eat (media ponderada)",
  },
];

/* =========================================================
 * Helpers
 * =======================================================*/

function fmtEuro(n: number): string {
  return "€" + Math.round(n).toLocaleString("es-ES");
}

function fmtNum(n: number, digits = 0): string {
  return n.toLocaleString("es-ES", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function fmtTimes(n: number): string {
  if (!isFinite(n) || n <= 0) return "0x";
  if (n >= 100) return `${Math.round(n)}x`;
  if (n >= 10) return `${n.toFixed(0)}x`;
  return `${n.toFixed(1)}x`;
}


/* =========================================================
 * Core calculation
 * =======================================================*/

function computeRoi(inputs: RoiInputs): RoiResult {
  const {
    reservasMes,
    ticketMedio,
    noShowPct,
    personal,
    locales,
    recuperacionPct,
    deliveryMes,
    comisionAgregadores,
  } = inputs;

  // 1. No-shows al mes (estado actual)
  const noShowsMes = reservasMes * (noShowPct / 100);

  // 2. No-shows evitados por confirmación +24h + reconfirmación IA
  const noShowsEvitados = noShowsMes * (recuperacionPct / 100);

  // 3. Ingresos recuperables por no-shows evitados (reapertura de mesa + waitlist)
  const ingresosNoShows = noShowsEvitados * ticketMedio;

  // 4. Tiempo ahorrado (horas/mes): gestión manual → automatizada.
  //    Baseline: personal * 5h/semana * 4 semanas * 33% eficiencia liberada.
  //    + 0.04h por reserva gestionada automáticamente (confirmación, agenda).
  const tiempoAhorradoHoras =
    (personal * 5 * 4 + reservasMes * 0.04) * 0.33;

  // 5. Valor económico del tiempo ahorrado (coste interno 15€/h)
  const tiempoAhorradoEuros = tiempoAhorradoHoras * 15;

  // 6. Ahorro en comisiones de delivery.
  //    Con RestoPanel, ~50% de los pedidos migran al canal propio (0% comisión).
  //    El 50% restante sigue en agregadores con la misma comisión.
  const deliveryPropioPct = 0.5;
  const ahorroDelivery =
    deliveryMes * ticketMedio * (comisionAgregadores / 100) * deliveryPropioPct;

  // 7. ROI total = suma de los tres drivers
  const roiTotal =
    ingresosNoShows + tiempoAhorradoEuros + ahorroDelivery;

  // 8. Inversión RestoPanel (Professional) — escalado por locales
  //    1 local = 99€; +50€ por local adicional (descuento por grupo).
  const inversion =
    PLAN_PRICE.professional + Math.max(0, locales - 1) * 50;

  // 9. Retorno múltiplo
  const retorno = roiTotal / inversion;

  return {
    noShowsMes,
    noShowsEvitados,
    ingresosNoShows,
    tiempoAhorradoHoras,
    tiempoAhorradoEuros,
    ahorroDelivery,
    roiTotal,
    inversion,
    retorno,
    breakdown: [
      {
        id: "no-shows",
        label: "Ingresos recuperables por no-shows",
        detail: `${fmtNum(noShowsEvitados, 1)} reservas/mes · ${fmtEuro(
          ticketMedio
        )} ticket`,
        value: ingresosNoShows,
        icon: CalendarX,
      },
      {
        id: "delivery",
        label: "Ahorro en comisiones de delivery",
        detail: `${deliveryMes} pedidos/mes · ${comisionAgregadores}% → 0% en canal propio`,
        value: ahorroDelivery,
        icon: Bike,
      },
      {
        id: "tiempo",
        label: "Tiempo ahorrado (valorado)",
        detail: `${fmtNum(tiempoAhorradoHoras, 1)} horas/mes · 15€/h`,
        value: tiempoAhorradoEuros,
        icon: Clock,
      },
    ],
  };
}

/* =========================================================
 * Plan recommendation
 * =======================================================*/

function recommendPlan(inputs: RoiInputs, result: RoiResult): {
  plan: RecommendedPlan;
  reasoning: string;
  detail: string;
} {
  // Enterprise: grupo (3+ locales) o ROI muy alto (>3000€/mes) o delivery alto (>400/mes)
  if (inputs.locales >= 3 || result.roiTotal >= 3000 || inputs.deliveryMes > 400) {
    const ahorroFmt = fmtEuro(result.ahorroDelivery);
    return {
      plan: "enterprise",
      reasoning: `Por tu volumen (${inputs.locales} locales · ${inputs.deliveryMes} delivery/mes), necesitas consolidación y permisos por grupo.`,
      detail: `El ahorro en comisiones (${ahorroFmt}/mes) y la consolidación de ${inputs.locales} locales justifican Enterprise.`,
    };
  }

  // Professional: ROI > 600€/mes o delivery > 50/mes o reservas altas
  if (result.roiTotal >= 600 || inputs.deliveryMes > 50 || inputs.reservasMes > 250) {
    const multiple = (result.ahorroDelivery / PLAN_PRICE.professional).toFixed(1);
    return {
      plan: "professional",
      reasoning: `Por tu volumen de delivery (${inputs.deliveryMes} pedidos/mes), el ahorro en comisiones (${fmtEuro(
        result.ahorroDelivery
      )}/mes) paga el plan ${multiple}x.`,
      detail: `Professional (${PLAN_PRICE.professional}€/mes) · retorno ${fmtTimes(
        result.retorno
      )} sobre inversión.`,
    };
  }

  // Starter: ROI modesto, 1 local, delivery bajo
  return {
    plan: "starter",
    reasoning: `Tu volumen se cubre con Starter. Cuando el delivery o las reservas crezcan, te aviso para subir a Professional.`,
    detail: `Starter (${PLAN_PRICE.starter}€/mes) · retorno estimado ${fmtTimes(
      result.retorno
    )}.`,
  };
}

/* =========================================================
 * Main view
 * =======================================================*/
export function RoiCalculatorView() {
  const { toast } = useToast();

  const [inputs, setInputs] = React.useState<RoiInputs>(DEFAULT_INPUTS);
  const [showBreakdown, setShowBreakdown] = React.useState(false);

  const result = React.useMemo(() => computeRoi(inputs), [inputs]);
  const recommendation = React.useMemo(
    () => recommendPlan(inputs, result),
    [inputs, result]
  );

  const setVal = <K extends keyof RoiInputs>(id: K, v: number) => {
    setInputs((prev) => ({ ...prev, [id]: v }));
  };

  const handleSendReport = () => {
    toast({
      title: "Informe ROI solicitado",
      description: `Te lo enviamos por email. Retorno estimado: ${fmtTimes(
        result.retorno
      )} sobre ${fmtEuro(result.inversion)}/mes.`,
    });
  };

  const handleDownloadPdf = () => {
    toast({
      title: "Descargando informe PDF",
      description: "Informe personalizado con tus inputs y supuestos del modelo.",
    });
  };

  const handleReset = () => {
    setInputs(DEFAULT_INPUTS);
    toast({
      title: "Valores restablecidos",
      description: "Calculadora vuelta a los valores por defecto.",
    });
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
              Calculadora ROI
            </h1>
            
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Ajusta tus números. El ROI se recalcula en vivo. Al final te
            recomiendo un plan con su reasoning.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleReset}
          className="border-border/60 min-h-11 shrink-0"
        >
          <ChevronDown className="h-4 w-4 rotate-90" />
          <span className="hidden sm:inline">Valores por defecto</span>
          <span className="sm:hidden">Reset</span>
        </Button>
      </header>

      {/* Main grid: inputs left, results right */}
      <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
        {/* LEFT — inputs + chart + breakdown */}
        <div className="space-y-5">
          <InputsCard inputs={inputs} setVal={setVal} />

          <ComparisonChartCard inputs={inputs} result={result} />

          <BreakdownCard
            result={result}
            show={showBreakdown}
            onToggle={() => setShowBreakdown((s) => !s)}
          />

          <ClaimsDisciplineCard />
        </div>

        {/* RIGHT — results + recommendation (sticky) */}
        <div className="lg:sticky lg:top-6 lg:self-start space-y-4">
          <ResultsCard result={result} />

          <PlanRecommendationCard
            recommendation={recommendation}
            onCta={() => {
              const planName =
                recommendation.plan === "enterprise"
                  ? "Enterprise"
                  : recommendation.plan === "professional"
                    ? "Professional"
                    : "Starter";
              if (recommendation.plan === "enterprise") {
                toast({
                  title: "Solicitud enviada a ventas",
                  description: "Te contactamos en menos de 24h con una demo del grupo.",
                });
              } else {
                toast({
                  title: `Cuenta ${planName} creada`,
                  description: `Empezamos el onboarding IA. Retorno estimado ${fmtTimes(
                    result.retorno
                  )}.`,
                });
              }
            }}
          />

          <CtaCard
            onSendReport={handleSendReport}
            onDownloadPdf={handleDownloadPdf}
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Inputs card
 * =======================================================*/
function InputsCard({
  inputs,
  setVal,
}: {
  inputs: RoiInputs;
  setVal: <K extends keyof RoiInputs>(id: K, v: number) => void;
}) {
  return (
    <section className="rp-glass rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-border/40">
        <Calculator className="h-4 w-4 text-[var(--gold-soft)]" />
        <h3 className="font-display text-base font-medium">Tus números</h3>
        <span className="text-[11px] text-muted-foreground ml-auto font-mono">
          {FIELDS.length} inputs
        </span>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FIELDS.map((spec) => {
          const value = inputs[spec.id];
          const Icon = spec.icon;
          return (
            <div
              key={spec.id}
              className={cn(
                "rounded-xl border border-border/60 bg-foreground/[0.02] p-3.5",
                spec.type === "slider" && "sm:col-span-2"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <label className="text-sm font-medium truncate" htmlFor={`roi-${spec.id}`}>
                    {spec.label}
                  </label>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Input
                    id={`roi-${spec.id}`}
                    type="number"
                    value={value}
                    min={spec.min}
                    max={spec.max}
                    step={spec.step}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (!Number.isNaN(n)) {
                        setVal(
                          spec.id,
                          Math.max(spec.min, Math.min(spec.max, n))
                        );
                      }
                    }}
                    className="h-9 w-24 text-right font-mono text-sm"
                    aria-label={spec.label}
                  />
                  {spec.suffix && (
                    <span className="text-sm text-muted-foreground w-4">
                      {spec.suffix}
                    </span>
                  )}
                  {spec.prefix && !spec.suffix && (
                    <span className="text-sm text-muted-foreground w-4">
                      {spec.prefix}
                    </span>
                  )}
                </div>
              </div>
              {spec.type === "slider" && (
                <div className="mt-3">
                  <Slider
                    value={[value]}
                    min={spec.min}
                    max={spec.max}
                    step={spec.step}
                    onValueChange={(arr) => setVal(spec.id, arr[0])}
                    className="cursor-pointer"
                  />
                  <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                    <span>
                      {spec.prefix || ""}
                      {spec.min}
                      {spec.suffix || ""}
                    </span>
                    <span>
                      {spec.prefix || ""}
                      {spec.max}
                      {spec.suffix || ""}
                    </span>
                  </div>
                </div>
              )}
              {spec.hint && (
                <div className="mt-1 text-[10px] text-muted-foreground italic">
                  {spec.hint}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* =========================================================
 * Comparison chart card (SVG bars)
 * =======================================================*/
function ComparisonChartCard({
  inputs,
  result,
}: {
  inputs: RoiInputs;
  result: RoiResult;
}) {
  const reduce = useReducedMotion();
  // Sin RestoPanel: pérdida por no-shows + comisiones de delivery (todo)
  const perdidoNoShows = result.noShowsMes * inputs.ticketMedio;
  const perdidoDelivery =
    inputs.deliveryMes * inputs.ticketMedio * (inputs.comisionAgregadores / 100);
  const perdidoTotal = perdidoNoShows + perdidoDelivery;

  // Con RestoPanel: solo la parte no recuperada
  const recuperadoNoShows = result.ingresosNoShows;
  const recuperadoDelivery = result.ahorroDelivery;
  const recuperadoTotal = recuperadoNoShows + recuperadoDelivery;

  // Bars: 2 categorías (No-shows, Delivery) × 2 series (Sin RP, Con RP)
  const categories = [
    {
      id: "no-shows",
      label: "No-shows",
      sin: perdidoNoShows,
      con: recuperadoNoShows,
    },
    {
      id: "delivery",
      label: "Delivery comisiones",
      sin: perdidoDelivery,
      con: recuperadoDelivery,
    },
  ];

  const maxValue = Math.max(perdidoTotal, recuperadoTotal, 1);

  return (
    <section className="rp-glass rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-border/40">
        <TrendingUp className="h-4 w-4 text-[var(--gold-soft)]" />
        <h3 className="font-display text-base font-medium">
          Sin RestoPanel vs Con RestoPanel
        </h3>
        <span className="text-[11px] text-muted-foreground ml-auto font-mono">
          €/mes
        </span>
      </div>
      <div className="p-4">
        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-rose-400/60" />
            <span className="text-muted-foreground">Sin RestoPanel (pérdida)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[var(--gold)]" />
            <span className="text-muted-foreground">Con RestoPanel (recuperado)</span>
          </div>
        </div>

        {/* SVG bar chart */}
        <div className="overflow-x-auto rp-scroll-thin">
          <div className="min-w-[420px]">
            <div className="grid grid-cols-2 gap-6">
              {categories.map((cat) => {
                const sinPct = (cat.sin / maxValue) * 100;
                const conPct = (cat.con / maxValue) * 100;
                return (
                  <div key={cat.id} className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
                      {cat.label}
                    </div>
                    {/* Sin RP */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Sin RP</span>
                        <span className="font-mono text-rose-300">
                          −{fmtEuro(cat.sin)}
                        </span>
                      </div>
                      <div className="h-6 rounded-md bg-foreground/[0.04] overflow-hidden">
                        <motion.div
                          className="h-full rounded-md bg-rose-400/60"
                          initial={reduce ? false : { width: 0 }}
                          animate={{ width: `${sinPct}%` }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                    {/* Con RP */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Con RP</span>
                        <span className="font-mono text-[var(--gold-soft)]">
                          +{fmtEuro(cat.con)}
                        </span>
                      </div>
                      <div className="h-6 rounded-md bg-foreground/[0.04] overflow-hidden">
                        <motion.div
                          className="h-full rounded-md bg-gradient-to-r from-[var(--gold-deep)] to-[var(--gold)]"
                          initial={reduce ? false : { width: 0 }}
                          animate={{ width: `${conPct}%` }}
                          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator className="my-4" />

            {/* Totals row */}
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                  Total sin RP
                </div>
                <div className="font-display text-xl font-medium text-rose-300">
                  −{fmtEuro(perdidoTotal)}
                </div>
                <div className="text-[10px] text-muted-foreground">pérdida/mes</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                  Total recuperado
                </div>
                <div className="font-display text-xl font-medium rp-gold-text">
                  +{fmtEuro(recuperadoTotal)}
                </div>
                <div className="text-[10px] text-muted-foreground">recuperado/mes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
 * Breakdown table
 * =======================================================*/
function BreakdownCard({
  result,
  show,
  onToggle,
}: {
  result: RoiResult;
  show: boolean;
  onToggle: () => void;
}) {
  const reduce = useReducedMotion();
  return (
    <section className="rp-glass rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 p-4 text-left hover:bg-foreground/[0.02] transition-colors min-h-[56px]"
        aria-expanded={show}
      >
        <Receipt className="h-4 w-4 text-[var(--gold-soft)]" />
        <h3 className="font-display text-base font-medium">Desglose por mejora</h3>
        <span className="text-[11px] text-muted-foreground ml-auto font-mono">
          {result.breakdown.length} ítems · {fmtEuro(result.roiTotal)}/mes
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            show && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {show && (
          <motion.div
            initial={reduce || false ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">
              <div className="overflow-x-auto rp-scroll-thin">
                <table className="w-full text-sm min-w-[460px]">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/40">
                      <th className="text-left p-2 font-medium">Mejora</th>
                      <th className="text-left p-2 font-medium hidden sm:table-cell">Detalle</th>
                      <th className="text-right p-2 font-medium">€/mes</th>
                      <th className="text-right p-2 font-medium w-16">% total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.breakdown.map((b) => {
                      const Icon = b.icon;
                      const pct =
                        result.roiTotal > 0 ? (b.value / result.roiTotal) * 100 : 0;
                      return (
                        <tr
                          key={b.id}
                          className="border-b border-border/30 hover:bg-foreground/[0.02]"
                        >
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <Icon className="h-3.5 w-3.5 text-[var(--gold-soft)] shrink-0" />
                              <span className="text-foreground/90">{b.label}</span>
                            </div>
                          </td>
                          <td className="p-2 text-[11px] text-muted-foreground hidden sm:table-cell">
                            {b.detail}
                          </td>
                          <td className="p-2 text-right font-mono font-medium text-[var(--gold-soft)]">
                            +{fmtEuro(b.value)}
                          </td>
                          <td className="p-2 text-right font-mono text-[11px] text-muted-foreground">
                            {fmtNum(pct)}%
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-foreground/[0.03] font-medium">
                      <td className="p-2" colSpan={2}>
                        ROI total
                      </td>
                      <td className="p-2 text-right font-mono rp-gold-text">
                        +{fmtEuro(result.roiTotal)}
                      </td>
                      <td className="p-2 text-right font-mono text-[11px] text-muted-foreground">
                        100%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* =========================================================
 * Claims discipline card (spec B.12)
 * =======================================================*/
function ClaimsDisciplineCard() {
  return (
    <section className="rp-glass rounded-xl p-3 flex items-start gap-2.5">
      <Info className="h-4 w-4 text-[var(--teal)] shrink-0 mt-0.5" />
      <div className="text-[11px] text-muted-foreground leading-relaxed">
        <span className="text-foreground font-medium">Claims discipline.</span>{" "}
        Resultados estimados basados en modelo de impacto. Media observada en 47
        locales. Resultados variables según operación, mercado y adopción del
        equipo.
      </div>
    </section>
  );
}

/* =========================================================
 * Results card (right column)
 * =======================================================*/
function ResultsCard({ result }: { result: RoiResult }) {
  const reduce = useReducedMotion();
  return (
    <section className="rp-glass rounded-2xl overflow-hidden rp-glow-gold">
      <div className="p-4 border-b border-border/40 bg-gradient-to-br from-[var(--gold)]/[0.08] via-transparent to-[var(--teal)]/[0.05]">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-[var(--gold-soft)]" />
          <h3 className="font-display text-base font-medium">Resultado</h3>
          <span className="text-[11px] text-muted-foreground ml-auto font-mono">
            €/mes
          </span>
        </div>
      </div>
      <div className="p-5">
        {/* Big ROI number */}
        <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          ROI total estimado
        </div>
        <motion.div
          key={Math.round(result.roiTotal)}
          initial={reduce ? false : { opacity: 0.7, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 font-display text-4xl sm:text-5xl font-light rp-gold-text"
        >
          {fmtEuro(result.roiTotal)}
          <span className="text-base text-muted-foreground font-sans">/mes</span>
        </motion.div>

        {/* Breakdown mini */}
        <div className="mt-4 space-y-1.5">
          <ResultRow
            icon={CalendarX}
            label="Ingresos recuperables por no-shows"
            value={fmtEuro(result.ingresosNoShows)}
          />
          <ResultRow
            icon={Bike}
            label="Ahorro en comisiones de delivery"
            value={fmtEuro(result.ahorroDelivery)}
          />
          <ResultRow
            icon={Clock}
            label="Tiempo ahorrado (valorado)"
            value={fmtEuro(result.tiempoAhorradoEuros)}
            caption={`${fmtNum(result.tiempoAhorradoHoras, 1)} h/mes`}
            accent="teal"
          />
        </div>

        <Separator className="my-4" />

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <ResultStat
            label="No-shows evitados"
            value={fmtNum(result.noShowsEvitados, 1)}
            caption={`de ${fmtNum(result.noShowsMes, 1)}/mes`}
            icon={CalendarX}
          />
          <ResultStat
            label="Tiempo ahorrado"
            value={`${fmtNum(result.tiempoAhorradoHoras, 0)}h`}
            caption="horas/mes"
            icon={Clock}
          />
        </div>

        <Separator className="my-4" />

        {/* Investment + return */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/60 bg-foreground/[0.03] p-3">
            <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <Euro className="h-3 w-3" />
              Inversión RestoPanel
            </div>
            <div className="mt-1 font-display text-2xl font-light text-foreground">
              {fmtEuro(result.inversion)}
              <span className="text-xs text-muted-foreground font-sans">/mes</span>
            </div>
          </div>
          <div className="rounded-lg border border-[var(--gold)]/40 bg-[var(--gold)]/[0.06] p-3">
            <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <ArrowUpRight className="h-3 w-3" />
              Retorno
            </div>
            <div className="mt-1 font-display text-2xl font-light rp-gold-text">
              {fmtTimes(result.retorno)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultRow({
  icon: Icon,
  label,
  value,
  caption,
  accent = "gold",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  caption?: string;
  accent?: "gold" | "teal";
}) {
  const colorClass = accent === "gold" ? "rp-gold-text" : "text-[var(--teal)]";
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-foreground/[0.03] px-3 py-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="flex-1 text-xs text-muted-foreground truncate">{label}</span>
      {caption && (
        <span className="text-[10px] text-muted-foreground font-mono">{caption}</span>
      )}
      <span className={cn("font-mono text-sm font-medium", colorClass)}>{value}</span>
    </div>
  );
}

function ResultStat({
  label,
  value,
  caption,
  icon: Icon,
}: {
  label: string;
  value: string;
  caption: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-foreground/[0.03] p-3">
      <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-1 font-display text-xl font-light text-[var(--teal)]">
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground">{caption}</div>
    </div>
  );
}

/* =========================================================
 * Plan recommendation card
 * =======================================================*/
function PlanRecommendationCard({
  recommendation,
  onCta,
}: {
  recommendation: ReturnType<typeof recommendPlan>;
  onCta: () => void;
}) {
  const planConfig: Record<
    RecommendedPlan,
    { name: string; price: string; accent: string; glow: string; text: string; cta: string }
  > = {
    starter: {
      name: "Starter",
      price: "49€/mes",
      accent: "border-[var(--teal)]/50",
      glow: "rp-glow-teal",
      text: "text-[var(--teal)]",
      cta: "Crear cuenta Starter",
    },
    professional: {
      name: "Professional",
      price: "99€/mes",
      accent: "border-[var(--gold)]/50",
      glow: "rp-glow-gold",
      text: "rp-gold-text",
      cta: "Crear cuenta Professional",
    },
    enterprise: {
      name: "Enterprise",
      price: "Hablar con ventas",
      accent: "border-[#A78BFA]/50",
      glow: "",
      text: "text-[#C4B5FD]",
      cta: "Hablar con ventas",
    },
  };
  const pc = planConfig[recommendation.plan];

  return (
    <section className={cn("rp-glass rounded-2xl overflow-hidden", pc.glow)}>
      <div className="p-4 border-b border-border/40 bg-foreground/[0.02]">
        <div className="flex items-center gap-2">
          <Lightbulb className={cn("h-4 w-4", pc.text)} />
          <h3 className="font-display text-base font-medium">Plan recomendado</h3>
          <Badge
            variant="outline"
            className={cn("border-current/40 text-[10px] uppercase ml-auto", pc.text)}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            IA
          </Badge>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-muted-foreground">Recomendado:</span>
          <span className={cn("font-display text-2xl font-medium", pc.text)}>
            {pc.name}
          </span>
          <span className="text-sm text-muted-foreground ml-auto">{pc.price}</span>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed">
          {recommendation.reasoning}
        </p>
        <div className="text-[11px] text-muted-foreground italic border-l-2 border-current/30 pl-2">
          {recommendation.detail}
        </div>
        <Button
          onClick={onCta}
          className={cn(
            "w-full min-h-11 h-11",
            recommendation.plan === "starter" && "bg-[var(--teal)] text-black hover:bg-[var(--teal-deep)] hover:text-white",
            recommendation.plan === "professional" && "bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]",
            recommendation.plan === "enterprise" && "bg-[#A78BFA] text-black hover:bg-[#C4B5FD]"
          )}
        >
          {pc.cta}
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}

/* =========================================================
 * CTA card (email + PDF)
 * =======================================================*/
function CtaCard({
  onSendReport,
  onDownloadPdf,
}: {
  onSendReport: () => void;
  onDownloadPdf: () => void;
}) {
  return (
    <section className="rp-glass rounded-2xl p-4 space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <Mail className="h-4 w-4 text-[var(--teal)]" />
        <h3 className="font-display text-sm font-medium">Informe personalizado</h3>
      </div>
      <Button
        onClick={onSendReport}
        className="w-full min-h-11 h-11 bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] text-background hover:opacity-90"
      >
        <Mail className="h-4 w-4" />
        Enviarme el informe
      </Button>
      <Button
        variant="outline"
        onClick={onDownloadPdf}
        className="w-full min-h-11 h-11 border-border/60"
      >
        <FileDown className="h-4 w-4" />
        Descargar PDF
      </Button>
      <div className="flex items-start gap-1.5 text-[10px] text-muted-foreground pt-1">
        <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-[var(--teal)]" />
        <span>
          Sin compromiso. El informe incluye el desglose, los supuestos del
          modelo y la recomendación de plan.
        </span>
      </div>
    </section>
  );
}
