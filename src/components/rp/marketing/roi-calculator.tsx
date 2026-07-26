"use client";

/* ============================================================
 * RestoPanel · RoiCalculator — Calculadora de ROI
 * ------------------------------------------------------------
 * Sección de mayor conversión del landing.
 *  - Layout 2 columnas (entradas izquierda, salidas derecha sticky)
 *  - 5 inputs (slider + input numérico) reales
 *  - Outputs en tiempo real con counter animado (count-up)
 *  - Big number + 4-item breakdown + payback + ROI
 *  - "Ver fórmula" expandible (formulas + supuestos)
 *  - CTAs "Enviarme el informe" + "Descargar PDF" (toast)
 *  - Disclaimer + badge "demo"
 *  - Animaciones transform+opacity, respeta prefers-reduced-motion
 * ============================================================ */

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Calculator,
  Mail,
  FileDown,
  ChevronDown,
  CalendarClock,
  Percent,
  TrendingUp,
  Users,
  CalendarX,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

/* ---------- Inputs config ---------- */
interface InputSpec {
  id: string;
  label: string;
  icon: React.ElementType;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  suffix?: string;
  prefix?: string;
  hint?: string;
}

const INPUTS: InputSpec[] = [
  {
    id: "reservas",
    label: "Reservas al mes",
    icon: CalendarClock,
    min: 50,
    max: 2000,
    step: 10,
    defaultValue: 300,
    hint: "Reservas confirmadas al mes",
  },
  {
    id: "ticket",
    label: "Ticket medio",
    icon: TrendingUp,
    min: 15,
    max: 200,
    step: 1,
    defaultValue: 48,
    prefix: "€",
    hint: "Gasto medio por reserva",
  },
  {
    id: "noshow",
    label: "No-show actual",
    icon: CalendarX,
    min: 0,
    max: 40,
    step: 1,
    defaultValue: 18,
    suffix: "%",
    hint: "% de reservas que no se presentan",
  },
  {
    id: "personal",
    label: "Personas en sala",
    icon: Users,
    min: 1,
    max: 30,
    step: 1,
    defaultValue: 7,
    hint: "Empleados en sala en servicio punta",
  },
  {
    id: "horas",
    label: "Horas semanales gestión manual",
    icon: Clock,
    min: 2,
    max: 40,
    step: 1,
    defaultValue: 12,
    suffix: "h",
    hint: "Tiempo dedicado a agenda y confirmaciones",
  },
];

/* ---------- Output formulas ---------- */
const ANNUAL_PLAN_COST = 1788; // Professional plan €149/mes × 12
const ONBOARDING_COST = 400; // one-time setup
const INDIRECT_COST = 1411; // training + indirecto (constante para simplificar)

interface CalcResult {
  totalAnnual: number;
  noShowsEvitados: number;
  mesasRecuperadas: number;
  horasLiberadas: number;
  upliftCrm: number;
  paybackMonths: number;
  roiPct: number;
}

function compute(values: Record<string, number>): CalcResult {
  const reservas = values.reservas;
  const ticket = values.ticket;
  const noShowPct = values.noshow / 100;
  const horas = values.horas;

  // 1. No-shows evitados: 60% reducción × ~52% conversión a visita real (neto 31%)
  const noShowsEvitados = reservas * 12 * noShowPct * ticket * 0.3125;
  // 2. Mesas recuperadas vía waitlist (~13% del valor recuperable)
  const mesasRecuperadas = reservas * 12 * noShowPct * ticket * 0.1344;
  // 3. Horas liberadas (33% del tiempo manual liberado)
  const horasLiberadas = horas * 15 * 52 * 0.3312;
  // 4. Uplift ticket por CRM (~0,83% sobre facturación)
  const upliftCrm = reservas * 12 * ticket * 0.00827;

  const totalAnnual = noShowsEvitados + mesasRecuperadas + horasLiberadas + upliftCrm;

  const monthlySavings = totalAnnual / 12;
  const cashCost = ANNUAL_PLAN_COST + ONBOARDING_COST;
  const paybackMonths = monthlySavings > 0 ? cashCost / monthlySavings : 0;

  const effectiveCost = ANNUAL_PLAN_COST + ONBOARDING_COST + INDIRECT_COST;
  const roiPct = totalAnnual > 0 ? ((totalAnnual - effectiveCost) / effectiveCost) * 100 : 0;

  return {
    totalAnnual,
    noShowsEvitados,
    mesasRecuperadas,
    horasLiberadas,
    upliftCrm,
    paybackMonths,
    roiPct,
  };
}

/* ---------- Count-up hook (rAF) ---------- */
function useCountUp(target: number, durationMs = 600, reduce: boolean | null = false) {
  const [value, setValue] = React.useState(target);
  const fromRef = React.useRef(target);
  React.useEffect(() => {
    if (reduce) {
      setValue(target);
      return;
    }
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const v = from + (target - from) * eased;
      setValue(v);
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, reduce]);
  return value;
}

/* ---------- Helpers ---------- */
function fmtEuro(n: number) {
  return "€" + Math.round(n).toLocaleString("es-ES");
}
function fmtNum(n: number, digits = 0) {
  return n.toLocaleString("es-ES", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/* ============================================================
 * Component
 * ============================================================ */
export function RoiCalculator() {
  const reduce = useReducedMotion();
  const [values, setValues] = React.useState<Record<string, number>>(() =>
    Object.fromEntries(INPUTS.map((i) => [i.id, i.defaultValue]))
  );
  const [showFormula, setShowFormula] = React.useState(false);

  const result = React.useMemo(() => compute(values), [values]);

  // Animated counters
  const animTotal = useCountUp(result.totalAnnual, 600, reduce);
  const animNoShow = useCountUp(result.noShowsEvitados, 600, reduce);
  const animMesas = useCountUp(result.mesasRecuperadas, 600, reduce);
  const animHoras = useCountUp(result.horasLiberadas, 600, reduce);
  const animUplift = useCountUp(result.upliftCrm, 600, reduce);
  const animPayback = useCountUp(result.paybackMonths, 500, reduce);
  const animRoi = useCountUp(result.roiPct, 600, reduce);

  const setVal = (id: string, v: number) => {
    setValues((prev) => ({ ...prev, [id]: v }));
  };

  return (
    <div className="rp-glass-strong rounded-2xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)]">
          <Calculator className="h-4 w-4 text-background" />
        </div>
        <h3 className="font-display text-xl sm:text-2xl font-medium tracking-tight">
          Calcula tu retorno
        </h3>
        <Badge variant="outline" className="border-[var(--gold)]/40 text-[var(--gold-soft)]">
          demo
        </Badge>
      </div>
      <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
        Ajusta los sliders con tus números. Las estimaciones se actualizan al instante.
      </p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_380px]">
        {/* LEFT — Inputs */}
        <div className="space-y-4">
          {INPUTS.map((spec) => {
            const value = values[spec.id];
            const Icon = spec.icon;
            return (
              <div
                key={spec.id}
                className="rounded-xl border border-border/60 bg-foreground/[0.02] p-3.5 sm:p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <label className="text-sm font-medium">{spec.label}</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={value}
                      min={spec.min}
                      max={spec.max}
                      step={spec.step}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        if (!Number.isNaN(n))
                          setVal(spec.id, Math.max(spec.min, Math.min(spec.max, n)));
                      }}
                      className="h-9 w-20 text-right font-mono text-sm"
                      aria-label={spec.label}
                    />
                    {spec.suffix && (
                      <span className="text-sm text-muted-foreground">{spec.suffix}</span>
                    )}
                    {spec.prefix && (
                      <span className="absolute right-9 text-sm text-muted-foreground" />
                    )}
                  </div>
                </div>
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
              </div>
            );
          })}
        </div>

        {/* RIGHT — Outputs (sticky on desktop) */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-[var(--gold)]/40 bg-gradient-to-br from-[var(--gold)]/[0.08] via-foreground/[0.03] to-[var(--teal)]/[0.06] p-5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Puedes recuperar al año
            </div>
            <motion.div
              key={Math.round(animTotal)}
              initial={reduce ? false : { opacity: 0.7, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 font-display text-4xl sm:text-5xl font-light rp-gold-text"
            >
              {fmtEuro(animTotal)}
            </motion.div>
            <div className="mt-1 text-xs text-muted-foreground">
              Ahorro estimado recurrente anual
            </div>

            {/* Breakdown */}
            <div className="mt-4 space-y-2">
              <BreakdownRow
                icon={CalendarX}
                label="No-shows evitados"
                value={fmtEuro(animNoShow)}
              />
              <BreakdownRow
                icon={Users}
                label="Mesas vía waitlist"
                value={fmtEuro(animMesas)}
              />
              <BreakdownRow
                icon={Clock}
                label="Horas liberadas"
                value={fmtEuro(animHoras)}
              />
              <BreakdownRow
                icon={Sparkles}
                label="Uplift por CRM"
                value={fmtEuro(animUplift)}
                accent="teal"
              />
            </div>

            {/* Payback + ROI */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border/60 bg-foreground/[0.03] p-3">
                <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  <CalendarClock className="h-3 w-3" />
                  Payback
                </div>
                <div className="mt-1 font-display text-2xl font-light text-[var(--teal)]">
                  {fmtNum(animPayback, 1)} meses
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-foreground/[0.03] p-3">
                <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  <Percent className="h-3 w-3" />
                  ROI año 1
                </div>
                <div className="mt-1 font-display text-2xl font-light rp-gold-text">
                  {fmtNum(animRoi)}%
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-4 flex flex-col gap-2">
              <Button
                className="h-11 min-h-[44px] bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] text-background hover:opacity-90"
                onClick={() =>
                  toast({
                    title: "Informe solicitado",
                    description: "Te lo enviamos por email en menos de 2 minutos.",
                  })
                }
              >
                <Mail className="mr-2 h-4 w-4" />
                Enviarme el informe
              </Button>
              <Button
                variant="outline"
                className="h-11 min-h-[44px] border-border/60"
                onClick={() =>
                  toast({
                    title: "Descargando PDF",
                    description: "Informe personalizado generado.",
                  })
                }
              >
                <FileDown className="mr-2 h-4 w-4" />
                Descargar PDF
              </Button>
            </div>

            {/* Expand formula */}
            <button
              onClick={() => setShowFormula((s) => !s)}
              className="mt-3 flex w-full items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[36px]"
            >
              <Calculator className="h-3 w-3" />
              {showFormula ? "Ocultar fórmula" : "Ver fórmula"}
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform",
                  showFormula && "rotate-180"
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {showFormula && (
                <motion.div
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 space-y-2 rounded-lg border border-border/60 bg-foreground/[0.03] p-3 text-[11px] leading-relaxed text-muted-foreground">
                    <FormulaRow
                      label="No-shows evitados"
                      formula="reservas/mes × 12 × no-show% × ticket × 31% recuperado"
                      assumption="60% reducción de no-shows · ~52% conversión a visita real"
                    />
                    <FormulaRow
                      label="Mesas vía waitlist"
                      formula="reservas/mes × 12 × no-show% × ticket × 13,4% reconvertidas"
                      assumption="Lista de espera con notificación automática"
                    />
                    <FormulaRow
                      label="Horas liberadas"
                      formula="horas/semana × 15€/h × 52 semanas × 33% liberadas"
                      assumption="Automatización de confirmaciones y agenda"
                    />
                    <FormulaRow
                      label="Uplift CRM"
                      formula="reservas/mes × 12 × ticket × 0,83% uplift medio"
                      assumption="Personalización, recordatorios y campañas"
                    />
                    <FormulaRow
                      label="Payback"
                      formula="(plan anual + onboarding) / (ahorro anual / 12)"
                      assumption="Plan Professional €1.788/año + €400 onboarding"
                    />
                    <FormulaRow
                      label="ROI año 1"
                      formula="(ahorro anual − coste efectivo) / coste efectivo × 100"
                      assumption="Coste efectivo = €3.599 (plan + onboarding + formación)"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-3 flex items-start gap-1.5 text-[10px] text-muted-foreground">
              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-[var(--teal)]" />
              Estimaciones basadas en datos de la industria. No son garantías.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */
function BreakdownRow({
  icon: Icon,
  label,
  value,
  accent = "gold",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: "gold" | "teal";
}) {
  const colorClass = accent === "gold" ? "rp-gold-text" : "text-[var(--teal)]";
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-foreground/[0.03] px-3 py-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="flex-1 text-xs text-muted-foreground">{label}</span>
      <span className={cn("font-mono text-sm font-medium", colorClass)}>{value}</span>
    </div>
  );
}

function FormulaRow({
  label,
  formula,
  assumption,
}: {
  label: string;
  formula: string;
  assumption: string;
}) {
  return (
    <div className="border-b border-border/40 pb-2 last:border-0 last:pb-0">
      <div className="font-mono text-foreground/80">{label}</div>
      <div className="mt-0.5 font-mono text-[10px] text-[var(--teal)]">{formula}</div>
      <div className="mt-0.5 text-[10px] italic">{assumption}</div>
    </div>
  );
}

export default RoiCalculator;
