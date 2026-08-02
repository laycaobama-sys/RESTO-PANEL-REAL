"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  CreditCard, Crown, Sparkles, Zap, Check, X, RefreshCw,
  CalendarClock, Download, FileText, TrendingUp, AlertTriangle,
  Ban, ArrowUpRight, ChevronDown, Lightbulb,
  Gift, Webhook, Clock, Mail, MessageCircle, BrainCircuit,
  HardDrive, Cpu, Server, ShieldCheck, Lock, Terminal,
  CircleCheck, Euro, Infinity as InfinityIcon,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/

export type PlanId = "starter" | "professional" | "enterprise";
export type BillingCycle = "monthly" | "yearly";
export type InvoiceStatus = "paid" | "failed" | "pending";

export interface Plan {
  id: PlanId;
  name: string;
  monthly: number; // €/mes
  yearly: number; // €/año (already discounted)
  accent: "muted" | "gold" | "teal";
  icon: React.ElementType;
  tagline: string;
  features: string[];
}

export interface Invoice {
  id: string;
  date: string;
  number: string;
  amount: number;
  status: InvoiceStatus;
}

export interface WebhookEvent {
  id: string;
  type: string;
  newStatus: string;
  ts: string;
}

export interface UsageMetric {
  id: string;
  label: string;
  icon: React.ElementType;
  current: number;
  limit: number; // -1 = unlimited, 0 = blocked
  unit: string;
}

/* =========================================================
 * Mock data
 * =======================================================*/

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    monthly: 49,
    yearly: 470,
    accent: "muted",
    icon: Sparkles,
    tagline: "1 local · arranque",
    features: ["TPV + KDS", "Carta QR", "1 local", "10 usuarios", "API lectura"],
  },
  {
    id: "professional",
    name: "Professional",
    monthly: 99,
    yearly: 950,
    accent: "gold",
    icon: Zap,
    tagline: "Multi-local · crecimiento",
    features: ["5 locales", "Usuarios ilimitados", "Delivery propio", "CRM avanzado", "Copiloto IA"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthly: 249,
    yearly: 2390,
    accent: "teal",
    icon: Crown,
    tagline: "Cadena · sin límites",
    features: ["Locales ilimitados", "Multi-local consolidado", "API escritura", "WhatsApp Business", "Yield pricing"],
  },
];

const INVOICES: Invoice[] = [
  { id: "inv1", date: "15 jul 2025", number: "RP-2025-0712", amount: 950, status: "paid" },
  { id: "inv2", date: "15 jun 2025", number: "RP-2025-0611", amount: 950, status: "paid" },
  { id: "inv3", date: "15 may 2025", number: "RP-2025-0510", amount: 950, status: "paid" },
  { id: "inv4", date: "15 abr 2025", number: "RP-2025-0409", amount: 950, status: "paid" },
  { id: "inv5", date: "15 mar 2025", number: "RP-2025-0308", amount: 49, status: "paid" },
  { id: "inv6", date: "15 feb 2025", number: "RP-2025-0207", amount: 49, status: "failed" },
  { id: "inv7", date: "15 ago 2025", number: "RP-2025-0813", amount: 950, status: "pending" },
];

const WEBHOOK_EVENTS: WebhookEvent[] = [
  { id: "w1", type: "checkout.session.completed", newStatus: "active", ts: "hace 2 min" },
  { id: "w2", type: "invoice.paid", newStatus: "active", ts: "hace 14 días" },
  { id: "w3", type: "invoice.payment_failed", newStatus: "past_due", ts: "hace 14 días" },
  { id: "w4", type: "customer.subscription.updated", newStatus: "active", ts: "hace 21 días" },
  { id: "w5", type: "customer.subscription.created", newStatus: "trialing", ts: "hace 28 días" },
];

const USAGE_METRICS: UsageMetric[] = [
  { id: "emails", label: "Emails", icon: Mail, current: 320, limit: 500, unit: "envíos/mes" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, current: 89, limit: 0, unit: "mensajes/mes" },
  { id: "ia", label: "IA tokens", icon: BrainCircuit, current: 4287, limit: 10000, unit: "tokens/mes" },
  { id: "storage", label: "Storage", icon: HardDrive, current: 1.2, limit: 50, unit: "GB" },
  { id: "api", label: "API calls", icon: Cpu, current: 0, limit: 0, unit: "llamadas/mes" },
];

/* =========================================================
 * Helpers
 * =======================================================*/

function planAccentCls(plan: Plan): {
  border: string;
  bg: string;
  text: string;
  ring: string;
} {
  switch (plan.accent) {
    case "gold":
      return {
        border: "border-[var(--gold)]/60",
        bg: "bg-[var(--gold)]/10",
        text: "text-[var(--gold-soft)]",
        ring: "ring-[var(--gold)]/40",
      };
    case "teal":
      return {
        border: "border-[var(--teal)]/55",
        bg: "bg-[var(--teal)]/10",
        text: "text-[var(--teal)]",
        ring: "ring-[var(--teal)]/40",
      };
    default:
      return {
        border: "border-border/60",
        bg: "bg-foreground/[0.04]",
        text: "text-muted-foreground",
        ring: "ring-foreground/15",
      };
  }
}

function fmtEuro(v: number): string {
  return `${v.toLocaleString("es-ES")}€`;
}

function fmtNum(v: number, digits = 0): string {
  if (digits === 0) return v.toLocaleString("es-ES");
  return v.toLocaleString("es-ES", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** Compute prorrateo when switching between plans or cycles. */
function computeProrrateo(
  fromMonthly: number,
  toMonthly: number,
  daysRemaining: number
): { deltaPerMonth: number; prorrateo: number; sign: "+" | "-" | "=" } {
  const deltaPerMonth = toMonthly - fromMonthly;
  const prorrateo = (deltaPerMonth / 30) * daysRemaining;
  const sign: "+" | "-" | "=" = deltaPerMonth > 0 ? "+" : deltaPerMonth < 0 ? "-" : "=";
  return { deltaPerMonth, prorrateo, sign };
}

/* =========================================================
 * Shared atoms
 * =======================================================*/


function SectionCard({
  title,
  desc,
  icon: Icon,
  action,
  children,
  className,
}: {
  title: string;
  desc?: string;
  icon: React.ElementType;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rp-glass rounded-2xl overflow-hidden flex flex-col min-w-0", className)}>
      <div className="flex items-center justify-between gap-3 p-4 border-b border-border/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-foreground/[0.05] text-[var(--gold)] shrink-0">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-base sm:text-lg leading-tight truncate">{title}</h2>
            {desc && <p className="text-[11px] text-muted-foreground truncate">{desc}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-4 flex-1 min-w-0">{children}</div>
    </section>
  );
}

function CodeBlock({
  code,
  label,
  icon: Icon = Terminal,
}: {
  code: string;
  label: string;
  icon?: React.ElementType;
}) {
  const [open, setOpen] = React.useState(true);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-xl border border-border/40 overflow-hidden">
      <CollapsibleTrigger asChild>
        <button
          className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-foreground/[0.03] hover:bg-foreground/[0.05] transition-colors min-h-9"
          aria-expanded={open}
        >
          <span className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <Icon className="h-3.5 w-3.5 text-[var(--gold)]" />
            {label}
          </span>
          <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open ? "" : "-rotate-90")} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre className="overflow-x-auto rp-scroll-thin p-3 text-[11px] leading-relaxed font-mono text-foreground/85 bg-foreground/[0.02]">
          <code>{code}</code>
        </pre>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* =========================================================
 * Cycle toggle (Mensual / Anual) with prorrateo
 * =======================================================*/

function CycleToggle({
  cycle,
  onChange,
}: {
  cycle: BillingCycle;
  onChange: (c: BillingCycle) => void;
}) {
  const discount = Math.round((1 - 950 / (99 * 12)) * 100); // ~20%
  return (
    <div className="inline-flex items-center rounded-full border border-border/50 bg-foreground/[0.03] p-1 gap-1">
      <button
        onClick={() => onChange("monthly")}
        className={cn(
          "px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider transition-colors min-h-8",
          cycle === "monthly"
            ? "bg-[var(--gold)] text-black"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-pressed={cycle === "monthly"}
      >
        Mensual
      </button>
      <button
        onClick={() => onChange("yearly")}
        className={cn(
          "px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 min-h-8",
          cycle === "yearly"
            ? "bg-[var(--gold)] text-black"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-pressed={cycle === "yearly"}
      >
        Anual
        <span className="text-[10px] bg-emerald-400/15 text-emerald-300 px-1.5 py-0.5 rounded-full">
          -{discount}%
        </span>
      </button>
    </div>
  );
}

/* =========================================================
 * Current plan card
 * =======================================================*/

function CurrentPlanCard({
  plan,
  cycle,
  onToggleCycle,
  isTrial,
  isCanceled,
  onReactivate,
}: {
  plan: Plan;
  cycle: BillingCycle;
  onToggleCycle: (c: BillingCycle) => void;
  isTrial: boolean;
  isCanceled: boolean;
  onReactivate: () => void;
}) {
  const accent = planAccentCls(plan);
  const Icon = plan.icon;
  const reduce = useReducedMotion();

  const monthlyAmount = cycle === "monthly" ? plan.monthly : Math.round(plan.yearly / 12);
  const periodLabel = cycle === "monthly" ? "/mes" : "/mes · facturado anual";

  return (
    <div
      className={cn(
        "rp-glass rounded-2xl border p-5 sm:p-6 flex flex-col gap-4 min-w-0",
        accent.border,
        "ring-1",
        accent.ring
      )}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center border shrink-0", accent.border, accent.bg)}>
            <Icon className={cn("h-6 w-6", accent.text)} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-xl sm:text-2xl leading-tight">Plan {plan.name}</h2>
              {isTrial ? (
                <Badge className="border-sky-500/40 bg-sky-500/10 text-sky-300 text-[10px] uppercase tracking-wider font-mono">
                  <Clock className="h-3 w-3 mr-1" /> Trialing
                </Badge>
              ) : isCanceled ? (
                <Badge className="border-rose-500/40 bg-rose-500/10 text-rose-300 text-[10px] uppercase tracking-wider font-mono">
                  <Ban className="h-3 w-3 mr-1" /> Cancelada
                </Badge>
              ) : (
                <Badge className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-[10px] uppercase tracking-wider font-mono">
                  <CircleCheck className="h-3 w-3 mr-1" /> Activo
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{plan.tagline}</p>
          </div>
        </div>
        <CycleToggle cycle={cycle} onChange={onToggleCycle} />
      </div>

      <div className="flex items-baseline gap-3 flex-wrap">
        <motion.div
          key={`${plan.id}-${cycle}`}
          initial={reduce ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-baseline gap-1"
        >
          <span className="font-display text-3xl sm:text-4xl tabular-nums">
            {fmtEuro(monthlyAmount)}
          </span>
          <span className="text-xs text-muted-foreground">{periodLabel}</span>
        </motion.div>
        {cycle === "yearly" && (
          <span className="text-[11px] font-mono text-muted-foreground">
            ({fmtEuro(plan.yearly)}/año · ahorro {fmtEuro(plan.monthly * 12 - plan.yearly)})
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-border/40 pt-3">
        <InfoTile label="Próxima renovación" value="15 ago 2025" icon={CalendarClock} />
        <InfoTile label="Método de pago" value="•••• 4242" icon={CreditCard} />
        <InfoTile label="Facturación" value={cycle === "yearly" ? "Anual" : "Mensual"} icon={FileText} />
      </div>

      {isCanceled && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/[0.06] p-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-[12px] text-rose-300 flex items-center gap-2 min-w-0">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Suscripción cancelada · datos conservados hasta 13 nov 2025</span>
          </div>
          <Button
            size="sm"
            className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] min-h-8 shrink-0"
            onClick={onReactivate}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reactivar
          </Button>
        </div>
      )}
    </div>
  );
}

function InfoTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-foreground/[0.03] p-2.5 min-w-0">
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon className="h-3 w-3 text-muted-foreground shrink-0" />
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground truncate">{label}</div>
      </div>
      <div className="text-sm font-medium truncate">{value}</div>
    </div>
  );
}

/* =========================================================
 * Plan comparison columns
 * =======================================================*/

function PlanComparison({
  currentPlan,
  cycle,
  onSwitch,
}: {
  currentPlan: PlanId;
  cycle: BillingCycle;
  onSwitch: (p: PlanId) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {PLANS.map((p) => (
        <PlanComparisonCard
          key={p.id}
          plan={p}
          current={p.id === currentPlan}
          cycle={cycle}
          onSwitch={() => onSwitch(p.id)}
        />
      ))}
    </div>
  );
}

function PlanComparisonCard({
  plan,
  current,
  cycle,
  onSwitch,
}: {
  plan: Plan;
  current: boolean;
  cycle: BillingCycle;
  onSwitch: () => void;
}) {
  const accent = planAccentCls(plan);
  const Icon = plan.icon;
  const reduce = useReducedMotion();
  const price = cycle === "monthly" ? plan.monthly : Math.round(plan.yearly / 12);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rp-glass rounded-2xl border p-5 flex flex-col gap-4 min-w-0",
        accent.border,
        current && "ring-1",
        accent.ring
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className={cn("h-4 w-4", accent.text)} />
          <h3 className="font-display text-lg truncate">{plan.name}</h3>
        </div>
        {current && (
          <Badge
            variant="outline"
            className="border-[var(--gold)]/50 bg-[var(--gold)]/15 text-[var(--gold-soft)] text-[10px] uppercase tracking-wider"
          >
            Plan actual
          </Badge>
        )}
      </div>

      <div className="flex items-baseline gap-1">
        <span className="font-display text-2xl tabular-nums">{fmtEuro(price)}</span>
        <span className="text-[11px] text-muted-foreground">/mes</span>
      </div>

      <ul className="space-y-1.5 text-[12px] min-h-[100px]">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="h-3.5 w-3.5 text-emerald-300 shrink-0 mt-0.5" />
            <span className="text-foreground/90">{f}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={current ? "outline" : "default"}
        disabled={current}
        onClick={onSwitch}
        className={cn(
          "mt-auto min-h-10",
          !current && plan.accent === "gold" && "bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]",
          !current && plan.accent === "teal" && "bg-[var(--teal)] text-black hover:bg-[var(--teal)]/80",
          !current && plan.accent === "muted" && "bg-foreground/[0.08] text-foreground hover:bg-foreground/[0.14]",
          current && "text-muted-foreground"
        )}
      >
        {current ? (
          <>
            <Check className="h-4 w-4" /> Plan actual
          </>
        ) : (
          <>
            <ArrowUpRight className="h-4 w-4" /> Cambiar a {plan.name}
          </>
        )}
      </Button>
    </motion.div>
  );
}

/* =========================================================
 * Lifecycle actions + modals
 * =======================================================*/

function LifecycleActions({
  currentPlan,
  isCanceled,
  onPlanChange,
  onPaymentMethod,
  onCancel,
  onReactivate,
}: {
  currentPlan: PlanId;
  isCanceled: boolean;
  onPlanChange: (p: PlanId) => void;
  onPaymentMethod: () => void;
  onCancel: (reason: string) => void;
  onReactivate: () => void;
}) {
  const [planModalOpen, setPlanModalOpen] = React.useState(false);
  const [targetPlan, setTargetPlan] = React.useState<PlanId>(currentPlan === "starter" ? "professional" : currentPlan === "professional" ? "enterprise" : "starter");
  const [paymentModalOpen, setPaymentModalOpen] = React.useState(false);
  const [cancelModalOpen, setCancelModalOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState<string>("");
  const { toast } = useToast();

  function handleConfirmPlanChange() {
    setPlanModalOpen(false);
    onPlanChange(targetPlan);
    toast({
      title: `Cambio a ${PLANS.find((p) => p.id === targetPlan)!.name} solicitado`,
      description: "Prorrateo aplicado · Stripe redirige para confirmar.",
    });
  }

  function handleConfirmPaymentMethod() {
    setPaymentModalOpen(false);
    onPaymentMethod();
    toast({
      title: "Método de pago actualizado",
      description: "Nueva tarjeta •••• 8841 · se usará en la próxima renovación.",
    });
  }

  function handleConfirmCancel() {
    setCancelModalOpen(false);
    onCancel(cancelReason || "Sin motivo");
    toast({
      title: "Suscripción cancelada",
      description: "Se cancela al final del periodo · 13 nov 2025.",
    });
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <LifecycleTile
          icon={ArrowUpRight}
          tone="gold"
          label="Cambiar de plan"
          desc="Con prorrateo automático"
          onClick={() => setPlanModalOpen(true)}
          disabled={isCanceled}
        />
        <LifecycleTile
          icon={CreditCard}
          tone="teal"
          label="Cambiar método de pago"
          desc="Tarjeta · Stripe"
          onClick={() => setPaymentModalOpen(true)}
        />
        <LifecycleTile
          icon={Ban}
          tone="red"
          label="Cancelar suscripción"
          desc="Al final del periodo"
          onClick={() => setCancelModalOpen(true)}
          disabled={isCanceled}
        />
        <LifecycleTile
          icon={RefreshCw}
          tone="gold"
          label="Reactivar"
          desc={isCanceled ? "Restaurar acceso" : "Solo si cancelada"}
          onClick={onReactivate}
          disabled={!isCanceled}
        />
      </div>

      {/* Change plan modal */}
      <Dialog open={planModalOpen} onOpenChange={setPlanModalOpen}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Cambiar de plan</DialogTitle>
            <DialogDescription>
              El cambio se aplica al instante con prorrateo por los días restantes del periodo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Nuevo plan
              </Label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {PLANS.map((p) => {
                  const active = p.id === targetPlan;
                  const accent = planAccentCls(p);
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setTargetPlan(p.id)}
                      className={cn(
                        "rounded-lg border p-2 flex flex-col items-center gap-1 transition-all min-h-[64px] justify-center",
                        active
                          ? cn(accent.border, accent.bg, "ring-1", accent.ring)
                          : "border-border/40 hover:bg-foreground/[0.04]"
                      )}
                      aria-pressed={active}
                    >
                      <Icon className={cn("h-4 w-4", active ? accent.text : "text-muted-foreground")} />
                      <span className={cn("text-xs font-medium", active && accent.text)}>{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <ProrrateoBreakdown currentPlan={currentPlan} targetPlan={targetPlan} daysRemaining={18} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanModalOpen(false)}>Cancelar</Button>
            <Button
              className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
              onClick={handleConfirmPlanChange}
            >
              Confirmar cambio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment method modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Cambiar método de pago</DialogTitle>
            <DialogDescription>
              Introduce la nueva tarjeta. Se validará con un cargo temporal de 0€.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="card-number" className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Número de tarjeta
              </Label>
              <Input id="card-number" placeholder="4242 4242 4242 4242" className="font-mono mt-1.5" inputMode="numeric" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="card-exp" className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  Caducidad
                </Label>
                <Input id="card-exp" placeholder="12/27" className="font-mono mt-1.5" inputMode="numeric" />
              </div>
              <div>
                <Label htmlFor="card-cvc" className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  CVC
                </Label>
                <Input id="card-cvc" placeholder="123" className="font-mono mt-1.5" inputMode="numeric" />
              </div>
            </div>
            <div className="rounded-lg border border-[var(--teal)]/30 bg-[var(--teal)]/[0.06] p-2.5 flex items-start gap-2">
              <Lock className="h-3.5 w-3.5 text-[var(--teal)] shrink-0 mt-0.5" />
              <span className="text-[11px] text-muted-foreground leading-relaxed">
                Procesado por Stripe · nunca tocamos los datos de la tarjeta.
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>Cancelar</Button>
            <Button
              className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
              onClick={handleConfirmPaymentMethod}
            >
              Guardar tarjeta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel subscription modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Cancelar suscripción</DialogTitle>
            <DialogDescription>
              La suscripción se cancela al final del periodo (13 nov 2025). Tus datos se conservan 90 días.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                ¿Por qué cancelas? (opcional)
              </Label>
              <div className="space-y-1.5 mt-1.5">
                {[
                  "Muy caro para mi volumen",
                  "No lo uso lo suficiente",
                  "Me cambio a otra solución",
                  "Problemas técnicos",
                  "Otro motivo",
                ].map((r) => (
                  <label
                    key={r}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border p-2 cursor-pointer transition-colors",
                      cancelReason === r
                        ? "border-rose-500/50 bg-rose-500/[0.08]"
                        : "border-border/40 hover:bg-foreground/[0.04]"
                    )}
                  >
                    <input
                      type="radio"
                      name="cancel-reason"
                      checked={cancelReason === r}
                      onChange={() => setCancelReason(r)}
                      className="accent-rose-400"
                    />
                    <span className="text-[12px]">{r}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-2.5 flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-300 shrink-0 mt-0.5" />
              <span className="text-[11px] text-muted-foreground leading-relaxed">
                Si cancelas ahora, mantienes acceso hasta el 13 nov 2025. Después, restricción parcial (política B.5).
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelModalOpen(false)}>Mantener suscripción</Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
            >
              <Ban className="h-4 w-4" /> Cancelar suscripción
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function LifecycleTile({
  icon: Icon,
  tone,
  label,
  desc,
  onClick,
  disabled,
}: {
  icon: React.ElementType;
  tone: "gold" | "teal" | "red";
  label: string;
  desc: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  const toneCls =
    tone === "gold"
      ? "text-[var(--gold-soft)] bg-[var(--gold)]/10 border-[var(--gold)]/30"
      : tone === "teal"
        ? "text-[var(--teal)] bg-[var(--teal)]/10 border-[var(--teal)]/30"
        : "text-rose-300 bg-rose-500/10 border-rose-500/30";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rp-glass rounded-xl border border-border/40 p-3 text-left flex flex-col gap-2 transition-all min-h-[88px] justify-start",
        disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-foreground/[0.04] hover:border-border/60"
      )}
    >
      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center border", toneCls)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{label}</div>
        <div className="text-[11px] text-muted-foreground truncate">{desc}</div>
      </div>
    </button>
  );
}

function ProrrateoBreakdown({
  currentPlan,
  targetPlan,
  daysRemaining,
}: {
  currentPlan: PlanId;
  targetPlan: PlanId;
  daysRemaining: number;
}) {
  const from = PLANS.find((p) => p.id === currentPlan)!;
  const to = PLANS.find((p) => p.id === targetPlan)!;
  const { deltaPerMonth, prorrateo, sign } = computeProrrateo(from.monthly, to.monthly, daysRemaining);

  const isUpgrade = deltaPerMonth > 0;
  const isSame = deltaPerMonth === 0;

  return (
    <div className="rounded-xl border border-border/40 bg-foreground/[0.02] p-3 space-y-2">
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-muted-foreground">Plan actual</span>
        <span className="font-medium">{from.name} · {fmtEuro(from.monthly)}/mes</span>
      </div>
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-muted-foreground">Plan nuevo</span>
        <span className="font-medium">{to.name} · {fmtEuro(to.monthly)}/mes</span>
      </div>
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-muted-foreground">Días restantes del periodo</span>
        <span className="font-mono tabular-nums">{daysRemaining} días</span>
      </div>
      <div className="border-t border-border/40 pt-2 flex items-center justify-between">
        <span className="text-[12px] text-muted-foreground">Prorrateo a cobrar hoy</span>
        <span className={cn(
          "font-display text-lg tabular-nums",
          isSame ? "text-muted-foreground" : isUpgrade ? "text-[var(--gold-soft)]" : "text-emerald-300"
        )}>
          {sign}{fmtEuro(Math.abs(Math.round(prorrateo)))}
        </span>
      </div>
      <div className="text-[10px] text-muted-foreground font-mono">
        Cálculo: ({fmtEuro(to.monthly)} - {fmtEuro(from.monthly)}) ÷ 30 × {daysRemaining} = {sign}{fmtEuro(Math.abs(Math.round(prorrateo)))}
      </div>
    </div>
  );
}

/* =========================================================
 * Invoice history table
 * =======================================================*/

function InvoiceHistory() {
  const { toast } = useToast();
  return (
    <div className="overflow-x-auto rp-scroll-thin -mx-1 px-1">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <th className="py-2 pr-3 font-normal">Fecha</th>
            <th className="py-2 px-2 font-normal">Nº factura</th>
            <th className="py-2 px-2 font-normal text-right">Importe</th>
            <th className="py-2 px-2 font-normal text-center">Estado</th>
            <th className="py-2 pl-2 font-normal text-right">PDF</th>
          </tr>
        </thead>
        <tbody>
          {INVOICES.map((inv) => {
            const statusCls =
              inv.status === "paid"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : inv.status === "failed"
                  ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-300";
            const statusLabel =
              inv.status === "paid" ? "Pagada" : inv.status === "failed" ? "Fallida" : "Pendiente";
            return (
              <tr key={inv.id} className="border-t border-border/30 hover:bg-foreground/[0.02]">
                <td className="py-2.5 pr-3 text-foreground/90">{inv.date}</td>
                <td className="py-2.5 px-2 font-mono text-xs text-[var(--gold-soft)]">{inv.number}</td>
                <td className="py-2.5 px-2 text-right font-mono tabular-nums">{fmtEuro(inv.amount)}</td>
                <td className="py-2.5 px-2 text-center">
                  <Badge className={cn("text-[10px] uppercase tracking-wider font-mono border", statusCls)}>
                    {statusLabel}
                  </Badge>
                </td>
                <td className="py-2.5 pl-2 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="min-h-8 h-8 px-2"
                    onClick={() =>
                      toast({
                        title: "Factura descargada",
                        description: `${inv.number}.pdf · ${fmtEuro(inv.amount)}`,
                      })
                    }
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
 * Usage panel
 * =======================================================*/

function UsagePanel() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {USAGE_METRICS.map((m) => (
        <UsageMetricCard key={m.id} m={m} />
      ))}
    </div>
  );
}

function UsageMetricCard({ m }: { m: UsageMetric }) {
  const reduce = useReducedMotion();
  const Icon = m.icon;

  const isUnlimited = m.limit === -1;
  const isBlocked = m.limit === 0;
  const pct = isUnlimited || isBlocked ? 0 : Math.min(100, Math.round((m.current / m.limit) * 100));
  const tone: "ok" | "warn" | "danger" | "blocked" | "unlimited" =
    isUnlimited ? "unlimited" : isBlocked ? "blocked" : pct >= 100 ? "danger" : pct >= 80 ? "warn" : "ok";

  const barCls =
    tone === "danger"
      ? "bg-rose-500"
      : tone === "warn"
        ? "bg-amber-400"
        : tone === "unlimited"
          ? "bg-[var(--teal)]"
          : "bg-[var(--gold)]";
  const textCls =
    tone === "danger"
      ? "text-rose-300"
      : tone === "warn"
        ? "text-amber-300"
        : tone === "unlimited"
          ? "text-[var(--teal)]"
          : tone === "blocked"
            ? "text-rose-300"
            : "text-[var(--gold-soft)]";

  return (
    <div className="rp-glass rounded-xl p-4 min-w-0">
      <div className="flex items-start gap-3 mb-3">
        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center bg-foreground/[0.04] shrink-0", textCls)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium truncate">{m.label}</span>
            {tone === "warn" && (
              <Badge className="border-amber-400/40 bg-amber-400/10 text-amber-300 text-[10px] uppercase tracking-wider font-mono shrink-0">
                <AlertTriangle className="h-3 w-3 mr-1" /> {pct}%
              </Badge>
            )}
            {tone === "blocked" && (
              <Badge className="border-rose-500/40 bg-rose-500/10 text-rose-300 text-[10px] uppercase tracking-wider font-mono shrink-0">
                <Ban className="h-3 w-3 mr-1" /> Bloqueado
              </Badge>
            )}
            {tone === "unlimited" && (
              <Badge className="border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)] text-[10px] uppercase tracking-wider font-mono shrink-0">
                <InfinityIcon className="h-3 w-3 mr-1" /> Sin límite
              </Badge>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground truncate">{m.unit}</div>
        </div>
      </div>

      {isBlocked ? (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
          No disponible en plan Starter. <span className="font-mono tabular-nums">{m.current}</span> intentos registrados.
        </div>
      ) : isUnlimited ? (
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-display text-xl tabular-nums text-[var(--teal)]">
            {Number.isInteger(m.current) ? m.current.toLocaleString("es-ES") : fmtNum(m.current, 1)}
          </span>
          <span className="text-xs text-muted-foreground font-mono">∞ {m.unit}</span>
        </div>
      ) : (
        <>
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <span className="font-display text-lg tabular-nums">
              <span className={textCls}>
                {Number.isInteger(m.current) ? m.current.toLocaleString("es-ES") : fmtNum(m.current, 1)}
              </span>
              <span className="text-muted-foreground mx-1">/</span>
              <span className="text-muted-foreground">
                {Number.isInteger(m.limit) ? m.limit.toLocaleString("es-ES") : fmtNum(m.limit, 1)}
              </span>
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">{m.unit}</span>
          </div>
          <div className="h-1.5 rounded-full bg-foreground/[0.08] overflow-hidden">
            <motion.div
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ duration: reduce ? 0 : 0.5, ease: "easeOut" }}
              className={cn("h-full rounded-full", barCls)}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5 text-[11px] text-muted-foreground">
            <span className="font-mono tabular-nums">{pct}% usado</span>
            <span className="font-mono tabular-nums">
              {Math.max(0, m.limit - m.current).toLocaleString("es-ES")} restantes
            </span>
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================
 * Coupons
 * =======================================================*/

function CouponsCard() {
  const [code, setCode] = React.useState("");
  const [applied, setApplied] = React.useState<string | null>(null);
  const { toast } = useToast();

  function applyCoupon() {
    if (!code.trim()) {
      toast({
        title: "Cupón vacío",
        description: "Introduce un código de cupón válido.",
      });
      return;
    }
    const upper = code.trim().toUpperCase();
    // Mock validation
    if (upper === "BIENVENIDA20") {
      setApplied(upper);
      toast({
        title: "Cupón aplicado",
        description: "BIENVENIDA20 · 20% de descuento durante 3 meses.",
      });
    } else if (upper === "RESTO50") {
      setApplied(upper);
      toast({
        title: "Cupón aplicado",
        description: "RESTO50 · 50% de descuento el primer mes.",
      });
    } else {
      toast({
        title: "Cupón inválido",
        description: `${upper} no existe o ha caducado.`,
      });
    }
    setCode("");
  }

  function removeCoupon() {
    if (applied) {
      toast({
        title: "Cupón eliminado",
        description: `${applied} removido · el precio vuelve a tarifa estándar.`,
      });
    }
    setApplied(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="ej. BIENVENIDA20"
          className="font-mono min-h-10"
          aria-label="Código de cupón"
          onKeyDown={(e) => {
            if (e.key === "Enter") applyCoupon();
          }}
        />
        <Button
          onClick={applyCoupon}
          className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] min-h-10"
        >
          <Gift className="h-4 w-4" /> Aplicar
        </Button>
      </div>
      {applied && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <CircleCheck className="h-4 w-4 text-emerald-300 shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-emerald-300 truncate">{applied}</div>
              <div className="text-[11px] text-muted-foreground">Cupón aplicado correctamente</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="min-h-8 h-8 px-2 shrink-0" onClick={removeCoupon}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
      <div className="text-[11px] text-muted-foreground leading-relaxed">
        <span className="text-foreground font-medium">Cupones de prueba:</span>{" "}
        <code className="font-mono text-[var(--gold-soft)]">BIENVENIDA20</code> (20% / 3 meses) ·{" "}
        <code className="font-mono text-[var(--gold-soft)]">RESTO50</code> (50% / 1 mes).
      </div>
    </div>
  );
}

/* =========================================================
 * Trial info banner
 * =======================================================*/

function TrialBanner({ active, daysRemaining }: { active: boolean; daysRemaining: number }) {
  if (!active) return null;
  return (
    <div className="rounded-2xl border border-sky-500/40 bg-sky-500/[0.08] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-sky-500/15 border border-sky-500/30 shrink-0">
        <Clock className="h-5 w-5 text-sky-300" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-display text-base sm:text-lg">
          Periodo de prueba · {daysRemaining} días restantes
        </div>
        <div className="text-[12px] text-muted-foreground mt-0.5">
          Sin tarjeta configurada · Al final del trial se degrada a plan Starter
        </div>
      </div>
      <Badge className="border-sky-500/40 bg-sky-500/10 text-sky-300 text-[10px] uppercase tracking-wider font-mono shrink-0">
        <Sparkles className="h-3 w-3 mr-1" /> Trial
      </Badge>
    </div>
  );
}

/* =========================================================
 * Webhook events log
 * =======================================================*/

function WebhookLog() {
  const reduce = useReducedMotion();
  const { toast } = useToast();
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] text-muted-foreground">
          Últimos eventos recibidos del webhook de Stripe · actualización en tiempo real
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="min-h-8 h-8"
          onClick={() =>
            toast({
              title: "Webhook simulado",
              description: "Evento customer.subscription.updated → active",
            })
          }
        >
          <RefreshCw className="h-3.5 w-3.5" /> Simular evento
        </Button>
      </div>
      <div className="space-y-1.5">
        {WEBHOOK_EVENTS.map((ev, i) => (
          <motion.div
            key={ev.id}
            initial={reduce ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: reduce ? 0 : i * 0.04 }}
            className="flex items-center gap-3 rounded-lg border border-border/40 bg-foreground/[0.02] p-2.5 min-w-0"
          >
            <Webhook className="h-3.5 w-3.5 text-[var(--gold)] shrink-0" />
            <code className="text-[11px] font-mono text-foreground/90 truncate flex-1 min-w-0">
              {ev.type}
            </code>
            <ArrowUpRight className="h-3 w-3 text-muted-foreground shrink-0" />
            <Badge
              className={cn(
                "text-[10px] uppercase tracking-wider font-mono border shrink-0",
                ev.newStatus === "active" && "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
                ev.newStatus === "trialing" && "border-sky-500/40 bg-sky-500/10 text-sky-300",
                ev.newStatus === "past_due" && "border-amber-500/40 bg-amber-500/10 text-amber-300"
              )}
            >
              {ev.newStatus}
            </Badge>
            <span className="text-[10px] font-mono text-muted-foreground shrink-0 hidden sm:inline">
              {ev.ts}
            </span>
          </motion.div>
        ))}
      </div>
      <CodeBlock
        code={WEBHOOK_SNIPPET}
        label="app/api/stripe/webhook/route.ts"
        icon={Server}
      />
    </div>
  );
}

const WEBHOOK_SNIPPET = `// app/api/stripe/webhook/route.ts — eventos en tiempo real
import Stripe from "stripe";
import { updateSubscription, flushEntitlementsCache } from "@/lib/billing";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();
  const event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);

  switch (event.type) {
    case "checkout.session.completed":
    case "invoice.paid":
    case "invoice.payment_failed":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      await updateSubscription(sub);
      // Cache flush → re-eval entitlements en caliente
      await flushEntitlementsCache(sub.metadata.org_id);
      break;
    }
  }
  return new Response(null, { status: 200 });
}`;

/* =========================================================
 * Main view
 * =======================================================*/

export function BillingPortalView() {
  const { toast } = useToast();
  const reduce = useReducedMotion();

  // Current plan state
  const [currentPlanId, setCurrentPlanId] = React.useState<PlanId>("professional");
  const [cycle, setCycle] = React.useState<BillingCycle>("yearly");
  const [isCanceled, setIsCanceled] = React.useState(false);
  const [isTrial, setIsTrial] = React.useState(false);

  const currentPlan = PLANS.find((p) => p.id === currentPlanId)!;

  function handleCycleChange(c: BillingCycle) {
    if (c === cycle) return;
    const fromMonthly = cycle === "monthly" ? currentPlan.monthly : Math.round(currentPlan.yearly / 12);
    const toMonthly = c === "monthly" ? currentPlan.monthly : Math.round(currentPlan.yearly / 12);
    const delta = toMonthly - fromMonthly;
    setCycle(c);
    toast({
      title: c === "yearly" ? "Ciclo cambiado a Anual" : "Ciclo cambiado a Mensual",
      description: `Prorrateo aplicado: ${delta > 0 ? "+" : ""}${fmtEuro(delta)}/mes · Aplica al instante.`,
    });
  }

  function handlePlanChange(p: PlanId) {
    setCurrentPlanId(p);
    setIsCanceled(false);
  }

  function handleCancel(reason: string) {
    setIsCanceled(true);
    toast({
      title: "Suscripción cancelada",
      description: `Motivo: ${reason} · Cancela al final del periodo (13 nov 2025).`,
    });
  }

  function handleReactivate() {
    setIsCanceled(false);
    toast({
      title: "Suscripción reactivada",
      description: `Plan ${currentPlan.name} activo de nuevo · Sin cargos extra.`,
    });
  }

  return (
    <div className="space-y-5 overflow-x-hidden">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
              Billing Portal
            </h1>
            
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Fase 5 · Pricing y Stripe completo. Gestiona plan, facturación, ciclo
            mensual/anual, método de pago, facturas y cupones. Webhooks en tiempo real.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            variant="outline"
            onClick={() =>
              toast({
                title: "Descargando todas las facturas",
                description: "ZIP con 7 facturas · ~242 KB.",
              })
            }
            className="min-h-11"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Descargar todas</span>
            <span className="sm:hidden">ZIP</span>
          </Button>
          <Button
            onClick={() =>
              toast({
                title: "Soporte de facturación",
                description: "Un agente de billing te contactará en menos de 4h.",
              })
            }
            className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] min-h-11"
          >
            <CreditCard className="h-4 w-4" /> Soporte billing
          </Button>
        </div>
      </header>

      {/* Trial simulator switch */}
      <div className="rp-glass rounded-2xl p-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Lightbulb className="h-4 w-4 text-[var(--gold)] shrink-0" />
          <span className="text-[12px] text-muted-foreground">
            <span className="text-foreground font-medium">Simulador:</span> activa trial o cancelación para ver las pantallas correspondientes
          </span>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <label className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground cursor-pointer">
            <Switch checked={isTrial} onCheckedChange={(v) => {
              setIsTrial(v);
              if (v) setIsCanceled(false);
            }} aria-label="Simular trial" />
            Trial
          </label>
          <label className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground cursor-pointer">
            <Switch checked={isCanceled} onCheckedChange={(v) => {
              setIsCanceled(v);
              if (v) setIsTrial(false);
            }} aria-label="Simular cancelación" />
            Cancelada
          </label>
        </div>
      </div>

      {/* Trial banner (conditional) */}
      <AnimatePresence>
        {isTrial && (
          <motion.div
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduce ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <TrialBanner active={isTrial} daysRemaining={14} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current plan card */}
      <CurrentPlanCard
        plan={currentPlan}
        cycle={cycle}
        onToggleCycle={handleCycleChange}
        isTrial={isTrial}
        isCanceled={isCanceled}
        onReactivate={handleReactivate}
      />

      {/* Lifecycle actions */}
      <SectionCard
        title="Acciones del ciclo de vida"
        desc="Cambiar plan · método de pago · cancelar · reactivar"
        icon={RefreshCw}
      >
        <LifecycleActions
          currentPlan={currentPlanId}
          isCanceled={isCanceled}
          onPlanChange={handlePlanChange}
          onPaymentMethod={() => {
            // Toast is fired from inside the modal handler
          }}
          onCancel={handleCancel}
          onReactivate={handleReactivate}
        />
      </SectionCard>

      {/* Plan comparison */}
      <SectionCard
        title="Comparativa de planes"
        desc="Cambia de plan con prorrateo automático"
        icon={Crown}
        action={<CycleToggle cycle={cycle} onChange={setCycle} />}
      >
        <PlanComparison
          currentPlan={currentPlanId}
          cycle={cycle}
          onSwitch={(p) => {
            handlePlanChange(p);
            toast({
              title: `Cambio a ${PLANS.find((x) => x.id === p)!.name}`,
              description: "Prorrateo aplicado · acceso inmediato al nuevo plan.",
            });
          }}
        />
      </SectionCard>

      {/* Invoice history + Usage panel (2 col on lg) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard
          title="Historial de facturas"
          desc="7 facturas · descarga PDF individual"
          icon={FileText}
        >
          <InvoiceHistory />
        </SectionCard>

        <SectionCard
          title="Consumo del periodo"
          desc="5 métricas · emails, WhatsApp, IA, storage, API"
          icon={TrendingUp}
        >
          <UsagePanel />
        </SectionCard>
      </div>

      {/* Coupons + Webhook log (2 col on lg) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard
          title="Cupones y descuentos"
          desc="Aplica códigos promocionales · validación mock"
          icon={Gift}
        >
          <CouponsCard />
        </SectionCard>

        <SectionCard
          title="Log de webhooks Stripe"
          desc="Eventos en tiempo real · sincronización de estado"
          icon={Webhook}
        >
          <WebhookLog />
        </SectionCard>
      </div>

      {/* Security / privacy note */}
      <div className="rp-glass rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-[var(--gold)] shrink-0 mt-0.5" />
        <div className="text-[12px] text-muted-foreground leading-relaxed">
          <span className="text-foreground font-medium">Seguridad y privacidad:</span> todos
          los cobros se procesan vía <span className="text-[var(--gold-soft)]">Stripe</span>.
          RestoPanel nunca almacena datos de tarjeta. Los webhooks se verifican con
          firma HMAC y se idempotencian por <code className="font-mono text-foreground/80">event.id</code>.
          Las facturas se guardan 7 años para cumplimiento fiscal.
        </div>
      </div>

      {/* Footer note */}
      <div className="rp-glass rounded-2xl p-4 flex items-start gap-3">
        <Euro className="h-5 w-5 text-[var(--gold)] shrink-0 mt-0.5" />
        <div className="text-[12px] text-muted-foreground leading-relaxed">
          <span className="text-foreground font-medium">Dato demo:</span> esta vista
          reproduce el portal de cliente de Stripe embebido en RestoPanel. En producción,
          cada acción (cambiar plan, cancelar, reactivar) dispara una sesión de{" "}
          <code className="font-mono text-foreground/80">Stripe Billing Portal</code> o{" "}
          <code className="font-mono text-foreground/80">Checkout</code> y el webhook
          resultante actualiza el estado en <code className="font-mono text-foreground/80">subscriptions</code>.
        </div>
      </div>
    </div>
  );
}

export default BillingPortalView;
