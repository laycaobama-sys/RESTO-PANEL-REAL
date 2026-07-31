"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Wallet,
  Crown,
  Gift,
  Plus,
  Minus,
  Clock,
  Undo2,
  Percent,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  TrendingUp,
  CalendarDays,
  Hash,
  Copy,
  Star,
  Award,
  AlertTriangle,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type WalletType = "earned" | "spent" | "expired" | "bonus" | "refund" | "cashback";

interface WalletEntry {
  id: string;
  type: WalletType;
  description: string;
  points: number;
  balance: number;
  date: string;
  source: string;
  idempotencyKey: string;
}

type CouponType = "percentage" | "fixed" | "gift" | "experience";

interface Coupon {
  id: string;
  code: string;
  description: string;
  type: CouponType;
  value: string;
  expiresAt: string;
  used: boolean;
  usedAt?: string;
}

/* =========================================================
 * Wallet type meta
 * =======================================================*/
const WALLET_META: Record<
  WalletType,
  { label: string; icon: React.ElementType; iconBg: string; pointColor: string }
> = {
  earned: {
    label: "Ganado",
    icon: Plus,
    iconBg: "bg-emerald-400/10 text-emerald-300",
    pointColor: "text-emerald-300",
  },
  spent: {
    label: "Canjeado",
    icon: Minus,
    iconBg: "bg-destructive/10 text-destructive",
    pointColor: "text-destructive",
  },
  expired: {
    label: "Expirado",
    icon: Clock,
    iconBg: "bg-amber-400/10 text-amber-300",
    pointColor: "text-amber-300",
  },
  bonus: {
    label: "Bonus",
    icon: Gift,
    iconBg: "bg-[var(--gold)]/10 text-[var(--gold)]",
    pointColor: "text-[var(--gold-soft)]",
  },
  refund: {
    label: "Reembolso",
    icon: Undo2,
    iconBg: "bg-sky-400/10 text-sky-300",
    pointColor: "text-sky-300",
  },
  cashback: {
    label: "Cashback",
    icon: Percent,
    iconBg: "bg-[var(--teal)]/10 text-[var(--teal)]",
    pointColor: "text-[var(--teal)]",
  },
};

const COUPON_TYPE_META: Record<
  CouponType,
  { label: string; badge: string; icon: React.ElementType }
> = {
  percentage: {
    label: "Porcentaje",
    badge: "border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
    icon: Percent,
  },
  fixed: {
    label: "Importe fijo",
    badge: "border-[var(--teal)]/30 bg-[var(--teal)]/10 text-[var(--teal)]",
    icon: TrendingUp,
  },
  gift: {
    label: "Regalo",
    badge: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-300",
    icon: Gift,
  },
  experience: {
    label: "Experiencia",
    badge: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    icon: Star,
  },
};

/* =========================================================
 * Demo data
 * =======================================================*/
const DEMO_WALLET: WalletEntry[] = [
  {
    id: "w1",
    type: "earned",
    description: "Reserva #1234 — 4 pax",
    points: 120,
    balance: 120,
    date: "2024-09-12T20:30:00.000Z",
    source: "Reserva #1234",
    idempotencyKey: "txn_a8f3k4m2",
  },
  {
    id: "w2",
    type: "bonus",
    description: "Campaña cumpleaños +100",
    points: 100,
    balance: 220,
    date: "2024-10-03T10:00:00.000Z",
    source: "Campaña cumpleaños",
    idempotencyKey: "txn_b9e4l5n3",
  },
  {
    id: "w3",
    type: "spent",
    description: "Canjeado: botella de vino",
    points: -200,
    balance: 20,
    date: "2024-10-19T21:15:00.000Z",
    source: "Canje #4451",
    idempotencyKey: "txn_c1f5m6o4",
  },
  {
    id: "w4",
    type: "earned",
    description: "Cena familia — 6 pax",
    points: 500,
    balance: 520,
    date: "2024-11-02T21:00:00.000Z",
    source: "Reserva #1289",
    idempotencyKey: "txn_d2g6n7p5",
  },
  {
    id: "w5",
    type: "earned",
    description: "Almuerzo empresa — 5 pax",
    points: 340,
    balance: 860,
    date: "2024-11-22T14:30:00.000Z",
    source: "Reserva #1312",
    idempotencyKey: "txn_e3h7o8q6",
  },
  {
    id: "w6",
    type: "expired",
    description: "Expiración puntos enero",
    points: -50,
    balance: 810,
    date: "2025-01-31T23:59:00.000Z",
    source: "Política expiración",
    idempotencyKey: "txn_f4i8p9r7",
  },
  {
    id: "w7",
    type: "earned",
    description: "Evento gala — mesa 8 pax",
    points: 1200,
    balance: 2010,
    date: "2025-02-08T22:00:00.000Z",
    source: "Reserva #1356",
    idempotencyKey: "txn_g5j9q0s8",
  },
  {
    id: "w8",
    type: "cashback",
    description: "Cashback 5% diciembre",
    points: 250,
    balance: 2260,
    date: "2025-02-15T12:00:00.000Z",
    source: "Cashback mensual",
    idempotencyKey: "txn_h6k0r1t9",
  },
  {
    id: "w9",
    type: "spent",
    description: "Canjeado: botella de vino",
    points: -200,
    balance: 2060,
    date: "2025-03-04T20:45:00.000Z",
    source: "Canje #4502",
    idempotencyKey: "txn_i7l1s2u0",
  },
  {
    id: "w10",
    type: "spent",
    description: "Canjeado: menú degustación para 2",
    points: -220,
    balance: 1840,
    date: "2025-04-18T22:30:00.000Z",
    source: "Canje #4531",
    idempotencyKey: "txn_j8m2t3v1",
  },
];

const DEMO_COUPONS: Coupon[] = [
  {
    id: "cp1",
    code: "WELCOME10",
    description: "Bienvenida: 10% en tu primera reserva",
    type: "percentage",
    value: "10%",
    expiresAt: "2025-03-31T23:59:00.000Z",
    used: false,
  },
  {
    id: "cp2",
    code: "BDAY25",
    description: "Regalo de cumpleaños: €25 de descuento",
    type: "fixed",
    value: "€25",
    expiresAt: "2025-03-15T23:59:00.000Z",
    used: false,
  },
  {
    id: "cp3",
    code: "TASTING2",
    description: "Menú degustación para 2 personas",
    type: "experience",
    value: "2 pax",
    expiresAt: "2025-04-30T23:59:00.000Z",
    used: false,
  },
  {
    id: "cp4",
    code: "WINEBOTTLE",
    description: "Botella de vino de regalo en tu próxima reserva",
    type: "gift",
    value: "1 botella",
    expiresAt: "2025-01-31T23:59:00.000Z",
    used: true,
    usedAt: "2025-01-12T20:30:00.000Z",
  },
];

const TIER_BENEFITS = [
  "Prioridad en reservas",
  "Descuento 10% en menú degustación",
  "Mesa preferente",
  "Acceso anticipado a eventos",
];

/* =========================================================
 * Helpers
 * =======================================================*/
function formatWalletDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatExpiryShort(iso: string): string {
  const target = new Date(iso).getTime();
  const now = Date.now();
  const diff = target - now;
  if (diff < 0) return "Expirado";
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Expira hoy";
  if (days === 1) return "Expira mañana";
  if (days <= 30) return `Expira en ${days} días`;
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function generateCouponCode(): string {
  const prefixes = ["VIP", "GOLD", "SUMMER", "FEST", "MENU", "TREAT"];
  const p = prefixes[Math.floor(Math.random() * prefixes.length)];
  const n = Math.floor(Math.random() * 90 + 10);
  return `${p}${n}`;
}

function formatPoints(p: number): string {
  return (p > 0 ? "+" : "") + p.toLocaleString("es-ES");
}

/* =========================================================
 * Component
 * =======================================================*/
export function CrmLoyalty() {
  const reduceMotion = useReducedMotion();
  const { toast } = useToast();
  const [coupons, setCoupons] = React.useState<Coupon[]>(DEMO_COUPONS);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // New coupon form state
  const [formCode, setFormCode] = React.useState(generateCouponCode());
  const [formType, setFormType] = React.useState<CouponType>("percentage");
  const [formValue, setFormValue] = React.useState("");
  const [formDesc, setFormDesc] = React.useState("");
  const [formExpiry, setFormExpiry] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);

  const currentBalance = 1840;
  const nextTierThreshold = 2500;
  const progress = Math.min(100, Math.round((currentBalance / nextTierThreshold) * 100));
  const pointsToNext = nextTierThreshold - currentBalance;

  const refreshCode = () => setFormCode(generateCouponCode());

  const resetForm = () => {
    setFormCode(generateCouponCode());
    setFormType("percentage");
    setFormValue("");
    setFormDesc("");
    setFormExpiry("");
    setFormError(null);
  };

  const openDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formValue.trim()) {
      setFormError("El valor es obligatorio.");
      return;
    }
    if (!formDesc.trim()) {
      setFormError("La descripción es obligatoria.");
      return;
    }
    if (!formExpiry) {
      setFormError("La fecha de caducidad es obligatoria.");
      return;
    }
    const newCoupon: Coupon = {
      id: `cp-${Date.now()}`,
      code: formCode.toUpperCase(),
      description: formDesc,
      type: formType,
      value: formValue,
      expiresAt: new Date(formExpiry + "T23:59:00").toISOString(),
      used: false,
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    setDialogOpen(false);
    toast({
      title: "Cupón generado",
      description: `${newCoupon.code} creado correctamente (demo).`,
    });
  };

  const copyCode = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => undefined);
    }
    toast({
      title: "Código copiado",
      description: `${code} copiado al portapapeles.`,
    });
  };

  return (
    <TooltipProvider>
      <section aria-labelledby="loy-heading" className="space-y-5">
        {/* Header */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--gold)]/10 text-[var(--gold)] ring-1 ring-[var(--gold)]/20">
              <Wallet className="h-4.5 w-4.5" />
            </div>
            <h2
              id="loy-heading"
              className="font-display text-2xl sm:text-3xl tracking-tight text-foreground"
            >
              Fidelización y wallet
            </h2>
            <Badge className="border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)]">
              demo
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Programa de puntos, cupones y ledger inmutable. Cada movimiento es trazable e
            idempotente.
          </p>
        </div>

        {/* Tier status + Wallet summary grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-4">
          {/* Tier status card */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className="rp-glass rounded-xl p-5 sm:p-6 relative overflow-hidden"
          >
            <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-[var(--gold)]/10 blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--gold)]/15 text-[var(--gold)] ring-1 ring-[var(--gold)]/30 rp-glow-gold">
                    <Crown className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">
                      Cliente demo
                    </div>
                    <div className="font-display text-lg text-foreground">Elena Marín</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-3 py-1 text-sm font-semibold text-[var(--gold-soft)]">
                  <Crown className="h-3.5 w-3.5" />
                  Tier Oro
                </span>
              </div>

              {/* Points balance */}
              <div className="mt-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Saldo de puntos
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-5xl sm:text-6xl rp-gold-gradient font-semibold leading-none">
                    {currentBalance.toLocaleString("es-ES")}
                  </span>
                  <span className="text-sm text-muted-foreground">puntos</span>
                </div>
              </div>

              {/* Progress to next tier */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-muted-foreground">
                    Progreso hacia <span className="text-foreground font-medium">Black</span>
                  </span>
                  <span className="font-mono text-foreground">
                    {currentBalance.toLocaleString("es-ES")} / {nextTierThreshold.toLocaleString("es-ES")}
                  </span>
                </div>
                <div className="relative h-2.5 w-full rounded-full bg-muted/40 overflow-hidden">
                  <motion.div
                    initial={reduceMotion ? false : { width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 rounded-full rp-glow-gold"
                    style={{
                      background:
                        "linear-gradient(90deg, var(--gold-deep), var(--gold) 60%, var(--gold-soft))",
                    }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-[var(--gold-soft)] font-medium">
                    Faltan {pointsToNext} puntos para Black
                  </span>
                  <span className="font-mono text-muted-foreground">{progress}%</span>
                </div>
              </div>

              {/* Tier meta + benefits */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Miembro desde
                  </div>
                  <div className="font-mono text-sm text-foreground">12 sep 2023</div>
                </div>
                <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Award className="h-3.5 w-3.5 rp-gold-text" />
                    Próximo tier
                  </div>
                  <div className="font-mono text-sm text-foreground">
                    Black · 2.500+ pts
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  Beneficios activos
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {TIER_BENEFITS.map((b) => (
                    <li
                      key={b}
                      className="flex items-center gap-2 text-sm text-foreground/90"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Wallet ledger */}
          <div className="rp-glass rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 border-b border-border/40 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--teal)]/10 text-[var(--teal)] ring-1 ring-[var(--teal)]/20">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-foreground">Ledger de wallet</h3>
                  <p className="text-xs text-muted-foreground">
                    Registro inmutable · {DEMO_WALLET.length} movimientos
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                <ShieldCheck className="h-3 w-3" />
                Idempotente
              </span>
            </div>

            {/* Ledger header (desktop) */}
            <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 px-5 py-2.5 text-[10px] uppercase tracking-wide text-muted-foreground border-b border-border/40 bg-muted/10">
              <span className="w-9">Tipo</span>
              <span>Descripción</span>
              <span className="text-right w-20">Puntos</span>
              <span className="text-right w-24">Saldo</span>
              <span className="text-right w-24">Fecha</span>
            </div>

            <div className="max-h-[400px] overflow-y-auto rp-scroll-thin">
              <AnimatePresence initial={false}>
                {DEMO_WALLET.map((entry, idx) => (
                  <WalletRow key={entry.id} entry={entry} index={idx} reduceMotion={reduceMotion} />
                ))}
              </AnimatePresence>
            </div>

            <div className="p-3.5 border-t border-border/40 flex items-start gap-2 text-[11px] text-muted-foreground bg-muted/10">
              <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0 rp-teal-text" />
              <p>
                Ledger inmutable · Cada movimiento es trazable e idempotente. Las claves
                idempotentes evitan duplicados por reintentos.
              </p>
            </div>
          </div>
        </div>

        {/* Active coupons */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Gift className="h-4.5 w-4.5 rp-gold-text" />
              <h3 className="font-display text-xl text-foreground">Cupones activos</h3>
              <span className="text-xs text-muted-foreground">
                · {coupons.filter((c) => !c.used).length} disponibles
              </span>
            </div>
            <Button
              onClick={openDialog}
              className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] hover:text-black min-h-11"
            >
              <Plus className="h-4 w-4" />
              Generar cupón
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {coupons.map((c, idx) => (
                <CouponCard
                  key={c.id}
                  coupon={c}
                  index={idx}
                  reduceMotion={reduceMotion}
                  onCopy={copyCode}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Fraud prevention note */}
        <div className="rp-glass rounded-xl p-4 flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--teal)]/10 text-[var(--teal)] ring-1 ring-[var(--teal)]/20">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1">
            <h4 className="font-display text-sm text-foreground">Prevención de fraude</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Detección de uso anómalo · Límites por organización · Reembolsos auditables. Cada
              canje se valida contra el ledger inmutable y los límites de tasa configurados.
            </p>
          </div>
        </div>
      </section>

      {/* Generate coupon dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Generar cupón</DialogTitle>
            <DialogDescription>
              Crea un nuevo cupón para el cliente. El código se genera automáticamente y puede
              editarse.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Code + refresh */}
            <div className="space-y-1.5">
              <Label htmlFor="cpn-code" className="text-xs">
                Código
              </Label>
              <div className="flex gap-2">
                <Input
                  id="cpn-code"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  className="font-mono flex-1"
                  maxLength={16}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={refreshCode}
                  aria-label="Generar nuevo código"
                  className="h-10 w-10"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo</Label>
              <Select value={formType} onValueChange={(v) => setFormType(v as CouponType)}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Porcentaje</SelectItem>
                  <SelectItem value="fixed">Importe fijo</SelectItem>
                  <SelectItem value="gift">Regalo</SelectItem>
                  <SelectItem value="experience">Experiencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Value */}
            <div className="space-y-1.5">
              <Label htmlFor="cpn-value" className="text-xs">
                Valor
              </Label>
              <Input
                id="cpn-value"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                placeholder={formType === "percentage" ? "10%" : formType === "fixed" ? "€25" : "1 botella"}
                className="h-10"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="cpn-desc" className="text-xs">
                Descripción
              </Label>
              <Input
                id="cpn-desc"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Descripción del cupón"
                className="h-10"
              />
            </div>

            {/* Expiry */}
            <div className="space-y-1.5">
              <Label htmlFor="cpn-expiry" className="text-xs">
                Caducidad
              </Label>
              <Input
                id="cpn-expiry"
                type="date"
                value={formExpiry}
                onChange={(e) => setFormExpiry(e.target.value)}
                className="h-10"
              />
            </div>

            {formError && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                {formError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="min-h-10">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] hover:text-black min-h-10"
            >
              <CheckCircle2 className="h-4 w-4" />
              Generar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

/* =========================================================
 * Wallet row (table on desktop, card on mobile)
 * =======================================================*/
interface WalletRowProps {
  entry: WalletEntry;
  index: number;
  reduceMotion: boolean | null;
}

function WalletRow({ entry, index, reduceMotion }: WalletRowProps) {
  const meta = WALLET_META[entry.type];

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: reduceMotion ? 0 : Math.min(index * 0.03, 0.2) }}
      className="border-b border-border/30 last:border-b-0"
    >
      {/* Desktop table row */}
      <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 px-5 py-3 items-center hover:bg-foreground/[0.02]">
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "grid h-8 w-8 place-items-center rounded-lg cursor-help",
                meta.iconBg
              )}
            >
              <meta.icon className="h-4 w-4" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">{meta.label}</TooltipContent>
        </Tooltip>

        <div className="min-w-0">
          <div className="text-sm text-foreground truncate">{entry.description}</div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
            <span className="inline-flex items-center gap-1">
              <Hash className="h-2.5 w-2.5" />
              <span className="font-mono">{entry.source}</span>
            </span>
            <span className="text-muted-foreground/50">·</span>
            <span className="font-mono opacity-70">{entry.idempotencyKey}</span>
          </div>
        </div>

        <div className={cn("text-right font-mono text-sm font-medium w-20", meta.pointColor)}>
          {formatPoints(entry.points)}
        </div>
        <div className="text-right font-mono text-sm text-foreground w-24">
          {entry.balance.toLocaleString("es-ES")}
        </div>
        <div className="text-right text-xs text-muted-foreground w-24">
          {formatWalletDate(entry.date)}
        </div>
      </div>

      {/* Mobile card */}
      <div className="md:hidden p-3.5 flex items-start gap-3">
        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", meta.iconBg)}>
          <meta.icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="text-sm text-foreground font-medium">{entry.description}</div>
            <div className={cn("font-mono text-sm font-semibold shrink-0", meta.pointColor)}>
              {formatPoints(entry.points)}
            </div>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 truncate">
              <Hash className="h-2.5 w-2.5" />
              <span className="font-mono truncate">{entry.source}</span>
            </span>
            <span>{formatWalletDate(entry.date)}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground">
              Saldo: <span className="font-mono text-foreground">{entry.balance.toLocaleString("es-ES")}</span>
            </span>
            <span className="font-mono text-muted-foreground/70">{entry.idempotencyKey}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
 * Coupon card
 * =======================================================*/
interface CouponCardProps {
  coupon: Coupon;
  index: number;
  reduceMotion: boolean | null;
  onCopy: (code: string) => void;
}

function CouponCard({ coupon, index, reduceMotion, onCopy }: CouponCardProps) {
  const meta = COUPON_TYPE_META[coupon.type];
  const expiry = formatExpiryShort(coupon.expiresAt);
  const isExpired = expiry === "Expirado";
  const isUsed = coupon.used;

  return (
    <motion.article
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
      transition={{ duration: 0.26, delay: reduceMotion ? 0 : Math.min(index * 0.04, 0.2) }}
      className={cn(
        "rp-glass rounded-xl overflow-hidden relative",
        (isUsed || isExpired) && "opacity-70"
      )}
    >
      {/* Top accent */}
      <div
        className={cn(
          "h-1 w-full",
          isUsed
            ? "bg-muted-foreground/30"
            : isExpired
            ? "bg-destructive/40"
            : coupon.type === "percentage"
            ? "bg-[var(--gold)]"
            : coupon.type === "fixed"
            ? "bg-[var(--teal)]"
            : coupon.type === "gift"
            ? "bg-fuchsia-400"
            : "bg-amber-400"
        )}
      />
      <div className="p-4">
        {/* Code */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Código</div>
            <div className="font-mono text-lg font-semibold text-foreground tracking-wider truncate">
              {coupon.code}
            </div>
          </div>
          <button
            onClick={() => onCopy(coupon.code)}
            aria-label={`Copiar código ${coupon.code}`}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border/50 bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Description */}
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {coupon.description}
        </p>

        {/* Type + value */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
              meta.badge
            )}
          >
            <meta.icon className="h-3 w-3" />
            {meta.label}
          </span>
          <span className="font-display text-base rp-gold-text font-semibold">{coupon.value}</span>
        </div>

        {/* Expiry / used */}
        <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-[11px]">
          {isUsed ? (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <CheckCircle2 className="h-3 w-3" />
              Usado · {coupon.usedAt ? formatWalletDate(coupon.usedAt) : "—"}
            </span>
          ) : (
            <span
              className={cn(
                "inline-flex items-center gap-1",
                isExpired ? "text-destructive" : "text-muted-foreground"
              )}
            >
              <Clock className="h-3 w-3" />
              {expiry}
            </span>
          )}
          {isUsed && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
              <Lock className="h-2.5 w-2.5" />
              Bloqueado
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default CrmLoyalty;
