"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Banknote, Wallet, ArrowLeftRight, Building2, Lock, ShieldAlert,
  RefreshCw, ExternalLink, Eye, Download, Search, CheckCircle2, XCircle,
  Clock, AlertTriangle, Coins, Scale, Gavel, ShieldCheck, Settings2,
  ChevronDown, Code2, AlertCircle, Pencil, Percent, Receipt, Layers,
  KeyRound, Webhook, Repeat, ArrowDownRight, ArrowUpRight, Info,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type PaymentStatus =
  | "pending" | "authorized" | "captured" | "partially_refunded"
  | "refunded" | "failed" | "cancelled" | "disputed";

type PaymentMethod = "card" | "cash" | "transfer" | "offline" | "wallet";
type PaymentProvider = "stripe" | "cash" | "manual";

interface Payment {
  id: string;
  orderId?: string;
  reservationId?: string;
  customerId?: string;
  customerName?: string;
  provider: PaymentProvider;
  externalRef?: string;
  status: PaymentStatus;
  method: PaymentMethod;
  amount: number;
  capturedAmount: number;
  refundedAmount: number;
  currency: string;
  authorizedAt?: string;
  capturedAt?: string;
  idempotencyKey: string;
  errorCode?: string;
  disputeStatus?: "open" | "won" | "lost" | "under_review";
}

interface LedgerEntry {
  id: string;
  type: "charge" | "credit" | "payment" | "refund" | "adjustment" | "penalty" | "commission" | "reconciliation_diff";
  description: string;
  amount: number;
  balanceAfter: number;
  reference: string;
  reason?: string;
  idempotencyKey: string;
  createdAt: string;
  createdBy: string;
}

interface Dispute {
  id: string;
  paymentRef: string;
  customerName: string;
  amount: number;
  reason: "fraudulent" | "product_unacceptable" | "subscription_cancelled" | "credit_not_processed";
  status: "open" | "won" | "lost" | "under_review";
  openedAt: string;
  dueDate: string;
  evidenceStatus: "missing" | "partial" | "submitted";
  orderId?: string;
}

interface NoShowPolicy {
  id: string;
  name: string;
  type: "none" | "fixed" | "percentage";
  amount: number;
  appliesTo: string;
  cancellationWindowHours: number;
  active: boolean;
}

/* =========================================================
 * Helpers — money in integer cents (never float)
 * =======================================================*/
const EUR = (c: number) =>
  (Math.abs(c) / 100).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtCents = (c: number) => {
  const sign = c < 0 ? "−" : "";
  return `${sign}${EUR(c)}\u00A0€`;
};

const fmtSigned = (c: number) => {
  const sign = c < 0 ? "−" : "+";
  return `${sign}${EUR(c)}\u00A0€`;
};

const fmtMoney = (c: number) => `${EUR(c)}\u00A0€`;

const NOW_ISO = "2025-07-15T19:30:00Z";
const relativeTime = (iso: string) => {
  const now = new Date(NOW_ISO).getTime();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now - then);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "hace instantes";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
};

const fmtDate = (iso?: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge variant="outline" className={cn(
      "border-amber-400/40 bg-amber-400/10 text-amber-300 text-[10px] font-mono uppercase tracking-wider",
      className,
    )}>
      demo
    </Badge>
  );
}

/* =========================================================
 * Badges & meta
 * =======================================================*/
const STATUS_META: Record<PaymentStatus, { label: string; cls: string; dot: string }> = {
  pending: { label: "Pendiente", cls: "border-amber-400/40 bg-amber-400/10 text-amber-300", dot: "bg-amber-400" },
  authorized: { label: "Autorizado", cls: "border-sky-400/40 bg-sky-400/10 text-sky-300", dot: "bg-sky-400" },
  captured: { label: "Capturado", cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300", dot: "bg-emerald-400" },
  partially_refunded: { label: "Reembolso parcial", cls: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]", dot: "bg-[var(--teal)]" },
  refunded: { label: "Reembolsado", cls: "border-foreground/20 bg-foreground/5 text-muted-foreground", dot: "bg-muted-foreground" },
  failed: { label: "Fallido", cls: "border-rose-400/50 bg-rose-400/10 text-rose-300", dot: "bg-rose-400" },
  cancelled: { label: "Cancelado", cls: "border-foreground/20 bg-foreground/5 text-muted-foreground", dot: "bg-muted-foreground" },
  disputed: { label: "Disputado", cls: "border-rose-500/50 bg-rose-500/10 text-rose-300", dot: "bg-rose-500" },
};

function StatusBadge({ status }: { status: PaymentStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap", m.cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} aria-hidden />
      {m.label}
    </span>
  );
}

const PROVIDER_META: Record<PaymentProvider, { label: string; cls: string; icon: React.ElementType }> = {
  stripe: { label: "Stripe", cls: "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]", icon: CreditCard },
  cash: { label: "Efectivo", cls: "border-foreground/20 bg-foreground/5 text-muted-foreground", icon: Banknote },
  manual: { label: "Manual", cls: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]", icon: Building2 },
};

function ProviderBadge({ provider }: { provider: PaymentProvider }) {
  const m = PROVIDER_META[provider];
  const Icon = m.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] whitespace-nowrap", m.cls)}>
      <Icon className="h-3 w-3" aria-hidden /> {m.label}
    </span>
  );
}

const METHOD_META: Record<PaymentMethod, { label: string; icon: React.ElementType }> = {
  card: { label: "Tarjeta", icon: CreditCard },
  cash: { label: "Efectivo", icon: Banknote },
  transfer: { label: "Transferencia", icon: ArrowLeftRight },
  offline: { label: "Offline", icon: Building2 },
  wallet: { label: "Wallet", icon: Wallet },
};

function MethodBadge({ method }: { method: PaymentMethod }) {
  const m = METHOD_META[method];
  const Icon = m.icon;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-foreground/15 bg-foreground/[0.04] px-2 py-0.5 text-[11px] text-foreground/80 whitespace-nowrap">
      <Icon className="h-3 w-3" aria-hidden /> {m.label}
    </span>
  );
}

const LEDGER_TYPE_META: Record<LedgerEntry["type"], { label: string; cls: string }> = {
  charge: { label: "Cargo", cls: "border-rose-400/40 bg-rose-400/10 text-rose-300" },
  credit: { label: "Abono", cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
  payment: { label: "Pago", cls: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]" },
  refund: { label: "Reembolso", cls: "border-amber-400/40 bg-amber-400/10 text-amber-300" },
  adjustment: { label: "Ajuste", cls: "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]" },
  penalty: { label: "Penalización", cls: "border-rose-500/40 bg-rose-500/10 text-rose-300" },
  commission: { label: "Comisión", cls: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300" },
  reconciliation_diff: { label: "Dif. conciliación", cls: "border-amber-400/40 bg-amber-400/10 text-amber-300" },
};

function LedgerTypeBadge({ type }: { type: LedgerEntry["type"] }) {
  const m = LEDGER_TYPE_META[type];
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider whitespace-nowrap", m.cls)}>
      {m.label}
    </span>
  );
}

/* =========================================================
 * Demo data — payments (10)
 * =======================================================*/
const PAYMENTS: Payment[] = [
  {
    id: "p1", externalRef: "pi_01HZXA", customerName: "Elena Marín",
    provider: "stripe", status: "captured", method: "card",
    amount: 16800, capturedAmount: 16800, refundedAmount: 0, currency: "EUR",
    authorizedAt: "2025-07-15T13:42:00Z", capturedAt: "2025-07-15T13:42:08Z",
    idempotencyKey: "idem_8f3a2c71", orderId: "SQ-2025-0142",
  },
  {
    id: "p2", externalRef: "pi_01HZXB", customerName: "Familia Ruiz",
    provider: "stripe", status: "captured", method: "card",
    amount: 25200, capturedAmount: 25200, refundedAmount: 0, currency: "EUR",
    authorizedAt: "2025-07-15T14:05:00Z", capturedAt: "2025-07-15T14:05:12Z",
    idempotencyKey: "idem_2c71b9d4", orderId: "SQ-2025-0148",
  },
  {
    id: "p3", externalRef: "pi_01HZXC", customerName: "Javier Soler",
    provider: "stripe", status: "authorized", method: "card",
    amount: 5600, capturedAmount: 0, refundedAmount: 0, currency: "EUR",
    authorizedAt: "2025-07-15T14:30:00Z",
    idempotencyKey: "idem_4e2901a8", reservationId: "RES-2025-0143",
  },
  {
    id: "p4", customerName: "Marta Iborra",
    provider: "cash", status: "captured", method: "cash",
    amount: 12000, capturedAmount: 12000, refundedAmount: 0, currency: "EUR",
    authorizedAt: "2025-07-15T14:18:00Z", capturedAt: "2025-07-15T14:18:00Z",
    idempotencyKey: "idem_9d4477b1", orderId: "SQ-2025-0150",
  },
  {
    id: "p5", externalRef: "pi_01HZXD", customerName: "Andrés Vidal",
    provider: "stripe", status: "refunded", method: "card",
    amount: 3800, capturedAmount: 3800, refundedAmount: 3800, currency: "EUR",
    authorizedAt: "2025-07-15T14:31:00Z", capturedAt: "2025-07-15T14:31:10Z",
    idempotencyKey: "idem_1a8c5d12", orderId: "SQ-2025-0151",
  },
  {
    id: "p6", externalRef: "pi_01HZXE", customerName: "Lucía Ferrer",
    provider: "stripe", status: "partially_refunded", method: "wallet",
    amount: 9450, capturedAmount: 9450, refundedAmount: 2000, currency: "EUR",
    authorizedAt: "2025-07-15T14:55:00Z", capturedAt: "2025-07-15T14:55:09Z",
    idempotencyKey: "idem_7b5f3f88", orderId: "SQ-2025-0152",
  },
  {
    id: "p7", externalRef: "pi_01HZXF", customerName: "Carlos Méndez",
    provider: "stripe", status: "disputed", method: "card",
    amount: 18000, capturedAmount: 18000, refundedAmount: 0, currency: "EUR",
    authorizedAt: "2025-07-14T21:10:00Z", capturedAt: "2025-07-14T21:10:14Z",
    idempotencyKey: "idem_3f886c2e", orderId: "SQ-2025-0144",
    disputeStatus: "under_review",
  },
  {
    id: "p8", customerName: "Grupo Gastrolateral",
    provider: "manual", status: "captured", method: "transfer",
    amount: 150000, capturedAmount: 150000, refundedAmount: 0, currency: "EUR",
    authorizedAt: "2025-07-15T15:02:00Z", capturedAt: "2025-07-15T15:02:40Z",
    idempotencyKey: "idem_5d12e9c5", orderId: "SQ-2025-0153",
  },
  {
    id: "p9", externalRef: "pi_01HZXG", customerName: "Sin cliente",
    provider: "stripe", status: "failed", method: "card",
    amount: 4200, capturedAmount: 0, refundedAmount: 0, currency: "EUR",
    authorizedAt: "2025-07-15T16:40:00Z",
    idempotencyKey: "idem_b4d10a73", errorCode: "insufficient_funds",
  },
  {
    id: "p10", externalRef: "pi_01HZXH", customerName: "Ana López",
    provider: "stripe", status: "cancelled", method: "card",
    amount: 6800, capturedAmount: 0, refundedAmount: 0, currency: "EUR",
    authorizedAt: "2025-07-15T12:20:00Z",
    idempotencyKey: "idem_e9c58e1f", reservationId: "RES-2025-0145",
  },
];

/* =========================================================
 * Demo data — immutable ledger (14 entries)
 * Signed amounts sum to +384000 cents (€3.840) = final balance.
 * Cobrado (charge+payment) = 384000 | Reembolsado = 12000 | Ajustes (net) = 12000
 * 384000 − 12000 + 12000 = 384000 ✓
 * =======================================================*/
const LEDGER: LedgerEntry[] = [
  { id: "LED-0001", type: "charge", description: "Cargo orden SQ-2025-0142 (Elena Marín)", amount: 16800, balanceAfter: 16800, reference: "SQ-2025-0142", idempotencyKey: "idem_8f3a2c71", createdAt: "2025-07-15T13:42:11Z", createdBy: "sistema" },
  { id: "LED-0002", type: "charge", description: "Cargo orden SQ-2025-0148 (Familia Ruiz)", amount: 25200, balanceAfter: 42000, reference: "SQ-2025-0148", idempotencyKey: "idem_2c71b9d4", createdAt: "2025-07-15T14:05:33Z", createdBy: "sistema" },
  { id: "LED-0003", type: "payment", description: "Pago efectivo SQ-2025-0150 (Marta Iborra)", amount: 12000, balanceAfter: 54000, reference: "SQ-2025-0150", idempotencyKey: "idem_9d4477b1", createdAt: "2025-07-15T14:18:00Z", createdBy: "Marta (caja)" },
  { id: "LED-0004", type: "charge", description: "Cargo orden SQ-2025-0151 (Andrés Vidal)", amount: 3800, balanceAfter: 57800, reference: "SQ-2025-0151", idempotencyKey: "idem_1a8c5d12", createdAt: "2025-07-15T14:31:22Z", createdBy: "sistema" },
  { id: "LED-0005", type: "charge", description: "Cargo orden SQ-2025-0152 (Lucía Ferrer)", amount: 9450, balanceAfter: 67250, reference: "SQ-2025-0152", idempotencyKey: "idem_7b5f3f88", createdAt: "2025-07-15T14:55:08Z", createdBy: "sistema" },
  { id: "LED-0006", type: "payment", description: "Pago transferencia Grupo Gastrolateral", amount: 150000, balanceAfter: 217250, reference: "SQ-2025-0153", idempotencyKey: "idem_5d12e9c5", createdAt: "2025-07-15T15:02:40Z", createdBy: "Carlos Méndez" },
  { id: "LED-0007", type: "charge", description: "Cargo evento EVT-2025-018 (banquete)", amount: 166750, balanceAfter: 384000, reference: "EVT-2025-018", idempotencyKey: "idem_6c2e0a73", createdAt: "2025-07-15T15:30:00Z", createdBy: "sistema" },
  { id: "LED-0008", type: "refund", description: "Reembolso pi_01HZXD (Andrés Vidal)", amount: -3800, balanceAfter: 380200, reference: "pi_01HZXD", reason: "Anulación por cancelación", idempotencyKey: "idem_3f886c2e", createdAt: "2025-07-15T16:10:15Z", createdBy: "Lucía Ferrer" },
  { id: "LED-0009", type: "refund", description: "Reembolso parcial pi_01HZXE", amount: -2000, balanceAfter: 378200, reference: "pi_01HZXE", reason: "Plato no servido", idempotencyKey: "idem_b4d1e9c5", createdAt: "2025-07-15T16:24:00Z", createdBy: "Lucía Ferrer" },
  { id: "LED-0010", type: "refund", description: "Reembolso cancelación evento pi_01HZXJ", amount: -6200, balanceAfter: 372000, reference: "pi_01HZXJ", reason: "Cancelación parcial evento", idempotencyKey: "idem_2f8ab4d1", createdAt: "2025-07-15T16:48:00Z", createdBy: "sistema" },
  { id: "LED-0011", type: "penalty", description: "Penalización no-show RES-005", amount: 1000, balanceAfter: 373000, reference: "RES-005", reason: "Cliente no compareció (depósito fijo)", idempotencyKey: "idem_8e1f0a73", createdAt: "2025-07-15T17:00:00Z", createdBy: "sistema" },
  { id: "LED-0012", type: "commission", description: "Comisión Stripe (procesadores del día)", amount: -855, balanceAfter: 372145, reference: "STRIPE-FEE-20250715", reason: "Comisiones agregadas 2.9% + 0.30", idempotencyKey: "idem_4e29b4d1", createdAt: "2025-07-15T23:59:00Z", createdBy: "sistema" },
  { id: "LED-0013", type: "credit", description: "Abono goodwill cliente VIP (Familia Ruiz)", amount: 6500, balanceAfter: 378645, reference: "SQ-2025-0148", reason: "Compensación por espera", idempotencyKey: "idem_9d44e9c5", createdAt: "2025-07-15T18:30:00Z", createdBy: "Carlos Méndez" },
  { id: "LED-0014", type: "adjustment", description: "Ajuste conciliación EXC-002", amount: 5500, balanceAfter: 384145, reference: "EXC-002", reason: "Diferencia €4 en orden SQ-2025-0143 + reagrupación", idempotencyKey: "idem_1a8c8e1f", createdAt: "2025-07-15T18:45:00Z", createdBy: "Carlos Méndez" },
  { id: "LED-0015", type: "reconciliation_diff", description: "Diferencia redondeo conciliación webhook", amount: -145, balanceAfter: 384000, reference: "EXC-008", reason: "Reconciliación webhook Stripe", idempotencyKey: "idem_7b5f2f8a", createdAt: "2025-07-15T19:00:00Z", createdBy: "sistema" },
];

/* =========================================================
 * Demo data — disputes (2)
 * =======================================================*/
const DISPUTES: Dispute[] = [
  {
    id: "dp_001", paymentRef: "pi_01HZXF", customerName: "Carlos Méndez",
    amount: 18000, reason: "fraudulent", status: "under_review",
    openedAt: "2025-07-15T11:20:00Z", dueDate: "2025-07-25T23:59:00Z",
    evidenceStatus: "partial", orderId: "SQ-2025-0144",
  },
  {
    id: "dp_002", paymentRef: "pi_01HZXA", customerName: "Elena Marín",
    amount: 16800, reason: "product_unacceptable", status: "won",
    openedAt: "2025-06-28T09:00:00Z", dueDate: "2025-07-08T23:59:00Z",
    evidenceStatus: "submitted", orderId: "SQ-2025-0142",
  },
];

const DISPUTE_REASON_LABEL: Record<Dispute["reason"], string> = {
  fraudulent: "Fraude alegado",
  product_unacceptable: "Producto/servicio inaceptable",
  subscription_cancelled: "Suscripción cancelada",
  credit_not_processed: "Abono no procesado",
};

const DISPUTE_STATUS_META: Record<Dispute["status"], { label: string; cls: string; dot: string }> = {
  open: { label: "Abierta", cls: "border-rose-400/50 bg-rose-400/10 text-rose-300", dot: "bg-rose-400" },
  under_review: { label: "En revisión", cls: "border-amber-400/40 bg-amber-400/10 text-amber-300", dot: "bg-amber-400" },
  won: { label: "Ganada", cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300", dot: "bg-emerald-400" },
  lost: { label: "Perdida", cls: "border-foreground/20 bg-foreground/5 text-muted-foreground", dot: "bg-muted-foreground" },
};

/* =========================================================
 * Demo data — no-show policies
 * =======================================================*/
const POLICIES: NoShowPolicy[] = [
  { id: "pol1", name: "Sin depósito", type: "none", amount: 0, appliesTo: "Reservas estándar", cancellationWindowHours: 0, active: true },
  { id: "pol2", name: "Depósito 10€ fijo", type: "fixed", amount: 1000, appliesTo: "Riesgo alto", cancellationWindowHours: 24, active: true },
  { id: "pol3", name: "Depósito 30%", type: "percentage", amount: 30, appliesTo: "Grupos grandes (≥6)", cancellationWindowHours: 48, active: true },
  { id: "pol4", name: "Depósito 100% eventos", type: "percentage", amount: 100, appliesTo: "Eventos y banquete", cancellationWindowHours: 72, active: true },
];

const NOSHOW_FLOW = [
  { step: 1, title: "Verificar política aplicable", desc: "Identificar la política de no-show según tipo de reserva, tamaño del grupo y horario." },
  { step: 2, title: "Verificar aceptación del cliente", desc: "Confirmar que el cliente aceptó explícitamente las condiciones al reservar." },
  { step: 3, title: "Verificar condiciones de la reserva", desc: "Comprobar fecha, hora, número de comensales y estado de la reserva." },
  { step: 4, title: "Verificar vigencia de la autorización", desc: "Comprobar que la autorización del PaymentIntent sigue activa (≤7 días)." },
  { step: 5, title: "Registrar el motivo", desc: "Documentar el motivo de la penalización (no-show, cancelación tardía, etc.)." },
  { step: 6, title: "Ejecutar captura con idempotencia", desc: "Capturar el importe usando la idempotency key original para evitar dobles cargos." },
  { step: 7, title: "Informar del resultado", desc: "Notificar al cliente y al equipo el resultado de la captura." },
  { step: 8, title: "Registrar auditoría", desc: "Crear movimiento en el ledger inmutable con referencia, motivo y autor." },
  { step: 9, title: "Permitir revisión manual", desc: "Habilitar revisión por un supervisor y, si procede, movimiento compensatorio." },
];

const PROVIDER_SNIPPET = `interface PaymentProvider {
  authorize(input: AuthorizeInput): Promise<PaymentResult>;
  capture(input: CaptureInput): Promise<PaymentResult>;
  refund(input: RefundInput): Promise<PaymentResult>;
  getStatus(input: StatusInput): Promise<PaymentResult>;
  handleWebhook(input: WebhookInput): Promise<WebhookResult>;
}

// Implementaciones: StripeProvider, CashProvider, ManualProvider
// Todas las operaciones son idempotentes (idempotencyKey obligatoria).`;

/* =========================================================
 * KPI strip
 * =======================================================*/
function KpiStrip() {
  const kpis = [
    { label: "Cobrado hoy", value: "€3.840,00", icon: Coins, accent: "gold" as const, sub: "234 pagos capturados" },
    { label: "Autorizado pendiente", value: "€340,00", icon: Clock, accent: "teal" as const, sub: "3 autorizaciones" },
    { label: "Reembolsado", value: "€120,00", icon: RefreshCw, accent: "fg" as const, sub: "2 reembolsos" },
    { label: "Disputas abiertas", value: "1", icon: Gavel, accent: "fg" as const, sub: "1 en revisión" },
    { label: "Tasa fallos", value: "0,3%", icon: AlertTriangle, accent: "fg" as const, sub: "1 de 320" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {kpis.map((k) => {
        const Icon = k.icon;
        const color = k.accent === "gold" ? "rp-gold-text" : k.accent === "teal" ? "rp-teal-text" : "text-foreground";
        return (
          <div key={k.label} className="rp-glass rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{k.label}</span>
              <Icon className={cn("h-3.5 w-3.5", color)} aria-hidden />
            </div>
            <div className={cn("mt-2 font-display text-xl sm:text-2xl font-light tabular-nums", color)}>
              {k.value}
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground">{k.sub}</div>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
 * Payments table (desktop) + cards (mobile)
 * =======================================================*/
function ExternalRefCell({ p }: { p: Payment }) {
  if (p.provider === "stripe" && p.externalRef) {
    return (
      <span className="font-mono text-xs text-foreground/85">
        <span className="text-muted-foreground">pi_</span>{p.externalRef.replace("pi_", "")}
      </span>
    );
  }
  if (p.provider === "cash") return <span className="font-mono text-xs text-foreground/85">Efectivo</span>;
  return <span className="font-mono text-xs text-foreground/85">Transferencia</span>;
}

function PaymentRowActions({
  p, onView, onCapture, onRefund,
}: {
  p: Payment;
  onView: (p: Payment) => void;
  onCapture: (p: Payment) => void;
  onRefund: (p: Payment) => void;
}) {
  const { toast } = useToast();
  return (
    <div className="flex items-center justify-end gap-1 flex-wrap">
      <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => onView(p)}>
        <Eye className="h-3.5 w-3.5 mr-1" aria-hidden /> Detalle
      </Button>
      {p.status === "authorized" && (
        <Button size="sm" variant="outline" className="h-8 px-2 border-[var(--teal)]/40 text-[var(--teal)] hover:bg-[var(--teal)]/10" onClick={() => onCapture(p)}>
          <Lock className="h-3.5 w-3.5 mr-1" aria-hidden /> Capturar
        </Button>
      )}
      {(p.status === "captured" || p.status === "partially_refunded") && (
        <Button size="sm" variant="outline" className="h-8 px-2 border-amber-400/40 text-amber-300 hover:bg-amber-400/10" onClick={() => onRefund(p)}>
          <RefreshCw className="h-3.5 w-3.5 mr-1" aria-hidden /> Reembolsar
        </Button>
      )}
      {p.provider === "stripe" && p.externalRef && (
        <Button size="sm" variant="ghost" className="h-8 px-2 text-muted-foreground" onClick={() => toast({ title: "Abriendo Stripe (demo)", description: `Dashboard → ${p.externalRef}` })}>
          <ExternalLink className="h-3.5 w-3.5 mr-1" aria-hidden /> Stripe
        </Button>
      )}
    </div>
  );
}

function PaymentsTable({
  payments, onView, onCapture, onRefund,
}: {
  payments: Payment[];
  onView: (p: Payment) => void;
  onCapture: (p: Payment) => void;
  onRefund: (p: Payment) => void;
}) {
  const [expanded, setExpanded] = React.useState<string | null>(null);
  return (
    <div className="rp-glass rounded-xl overflow-hidden hidden lg:block">
      <div className="overflow-x-auto rp-scroll-thin">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-foreground/[0.03]">
              {["Ref. externa", "Cliente", "Proveedor", "Método", "Importe", "Capturado", "Reembolsado", "Estado", "Acciones"].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  {h === "Importe" || h === "Capturado" || h === "Reembolsado" ? <span className="float-right">{h}</span> : h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">No hay pagos que coincidan con los filtros.</td></tr>
            )}
            {payments.map((p) => (
              <React.Fragment key={p.id}>
                <tr className="border-b border-border/40 last:border-0 hover:bg-foreground/[0.03] transition-colors">
                  <td className="px-3 py-3"><ExternalRefCell p={p} /></td>
                  <td className="px-3 py-3 text-foreground/90">{p.customerName}</td>
                  <td className="px-3 py-3"><ProviderBadge provider={p.provider} /></td>
                  <td className="px-3 py-3"><MethodBadge method={p.method} /></td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums">{fmtMoney(p.amount)}</td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums">{p.capturedAmount > 0 ? fmtMoney(p.capturedAmount) : <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums">{p.refundedAmount > 0 ? <span className="text-amber-300">{fmtMoney(p.refundedAmount)}</span> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-3 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-3 py-3">
                    <PaymentRowActions p={p} onView={onView} onCapture={onCapture} onRefund={onRefund} />
                  </td>
                </tr>
                <tr>
                  <td colSpan={9} className="p-0">
                    <Collapsible open={expanded === p.id} onOpenChange={(o) => setExpanded(o ? p.id : null)}>
                      <CollapsibleContent>
                        <div className="px-3 py-2 bg-foreground/[0.02] border-t border-border/30 flex flex-wrap items-center gap-x-6 gap-y-1 text-[11px] font-mono text-muted-foreground">
                          <span><span className="text-foreground/60">idempotency:</span> {p.idempotencyKey}</span>
                          <span><span className="text-foreground/60">order:</span> {p.orderId ?? p.reservationId ?? "—"}</span>
                          <span><span className="text-foreground/60">autorizado:</span> {fmtDate(p.authorizedAt)}</span>
                          {p.errorCode && <span className="text-rose-300"><span className="text-foreground/60">error:</span> {p.errorCode}</span>}
                          {p.disputeStatus && <span className="text-rose-300"><span className="text-foreground/60">disputa:</span> {p.disputeStatus}</span>}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-3 py-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
        <button
          className="inline-flex items-center gap-1 hover:text-foreground"
          onClick={() => setExpanded(expanded ? null : "all")}
        >
          <ChevronDown className={cn("h-3 w-3 transition-transform", expanded ? "rotate-180" : "")} aria-hidden />
          {expanded ? "Contraer claves" : "Expandir claves de idempotencia"}
        </button>
        <span className="font-mono">{payments.length} pagos · demo</span>
      </div>
    </div>
  );
}

function PaymentsCards({
  payments, onView, onCapture, onRefund,
}: {
  payments: Payment[];
  onView: (p: Payment) => void;
  onCapture: (p: Payment) => void;
  onRefund: (p: Payment) => void;
}) {
  return (
    <div className="lg:hidden space-y-3">
      {payments.length === 0 && (
        <div className="rp-glass rounded-xl p-8 text-center text-muted-foreground text-sm">
          No hay pagos que coincidan con los filtros.
        </div>
      )}
      {payments.map((p) => (
        <div key={p.id} className="rp-glass rounded-xl p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <ExternalRefCell p={p} />
              <div className="mt-1 font-medium text-foreground truncate">{p.customerName}</div>
            </div>
            <StatusBadge status={p.status} />
          </div>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <ProviderBadge provider={p.provider} />
            <MethodBadge method={p.method} />
          </div>
          <Separator className="my-3 bg-border/40" />
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="text-[10px] font-mono uppercase text-muted-foreground">Importe</div>
              <div className="font-mono tabular-nums mt-0.5">{fmtMoney(p.amount)}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-muted-foreground">Capturado</div>
              <div className="font-mono tabular-nums mt-0.5">{p.capturedAmount > 0 ? fmtMoney(p.capturedAmount) : "—"}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-muted-foreground">Reembolsado</div>
              <div className="font-mono tabular-nums mt-0.5">{p.refundedAmount > 0 ? <span className="text-amber-300">{fmtMoney(p.refundedAmount)}</span> : "—"}</div>
            </div>
          </div>
          <div className="mt-3 text-[10px] font-mono text-muted-foreground truncate">
            <span className="text-foreground/60">idem:</span> {p.idempotencyKey}
          </div>
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            <Button size="sm" variant="outline" className="h-9 flex-1 min-w-[110px]" onClick={() => onView(p)}>
              <Eye className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Detalle
            </Button>
            {p.status === "authorized" && (
              <Button size="sm" variant="outline" className="h-9 border-[var(--teal)]/40 text-[var(--teal)]" onClick={() => onCapture(p)}>
                <Lock className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Capturar
              </Button>
            )}
            {(p.status === "captured" || p.status === "partially_refunded") && (
              <Button size="sm" variant="outline" className="h-9 border-amber-400/40 text-amber-300" onClick={() => onRefund(p)}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Reembolsar
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
 * Payment detail dialog
 * =======================================================*/
function PaymentDetailDialog({ payment, onClose }: { payment: Payment | null; onClose: () => void }) {
  const { toast } = useToast();
  if (!payment) return null;
  const timeline: { label: string; at?: string; tone: "ok" | "warn" | "info" | "err" }[] = [];
  if (payment.authorizedAt) timeline.push({ label: "Autorización creada", at: payment.authorizedAt, tone: "info" });
  if (payment.status === "authorized" || payment.capturedAt || payment.refundedAmount > 0 || payment.status === "refunded" || payment.status === "disputed") {
    if (payment.capturedAt) timeline.push({ label: "Cargo capturado", at: payment.capturedAt, tone: "ok" });
    else if (payment.status === "authorized") timeline.push({ label: "Pendiente de captura", tone: "warn" });
  }
  if (payment.refundedAmount > 0) {
    timeline.push({
      label: payment.status === "refunded" ? "Reembolso completo" : "Reembolso parcial",
      at: "2025-07-15T16:24:00Z",
      tone: "warn",
    });
  }
  if (payment.status === "failed") timeline.push({ label: "Pago fallido", at: payment.authorizedAt, tone: "err" });
  if (payment.status === "cancelled") timeline.push({ label: "Autorización cancelada", at: "2025-07-15T12:25:00Z", tone: "err" });
  if (payment.status === "disputed") timeline.push({ label: "Disputa abierta", at: "2025-07-15T11:20:00Z", tone: "err" });

  return (
    <Dialog open={!!payment} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 rp-gold-text" aria-hidden /> Detalle de pago <DemoBadge />
          </DialogTitle>
          <DialogDescription>
            Ref. externa: <span className="font-mono">{payment.externalRef ?? "—"}</span> · {payment.customerName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rp-glass rounded-lg p-3">
            <div className="text-[10px] font-mono uppercase text-muted-foreground">Importe</div>
            <div className="font-mono tabular-nums text-lg mt-1">{fmtMoney(payment.amount)}</div>
          </div>
          <div className="rp-glass rounded-lg p-3">
            <div className="text-[10px] font-mono uppercase text-muted-foreground">Capturado</div>
            <div className="font-mono tabular-nums text-lg mt-1 text-emerald-300">{payment.capturedAmount > 0 ? fmtMoney(payment.capturedAmount) : "—"}</div>
          </div>
          <div className="rp-glass rounded-lg p-3">
            <div className="text-[10px] font-mono uppercase text-muted-foreground">Reembolsado</div>
            <div className="font-mono tabular-nums text-lg mt-1 text-amber-300">{payment.refundedAmount > 0 ? fmtMoney(payment.refundedAmount) : "—"}</div>
          </div>
          <div className="rp-glass rounded-lg p-3">
            <div className="text-[10px] font-mono uppercase text-muted-foreground">Neto</div>
            <div className="font-mono tabular-nums text-lg mt-1">{fmtMoney(payment.capturedAmount - payment.refundedAmount)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2"><span className="text-[11px] font-mono uppercase text-muted-foreground w-20">Proveedor</span><ProviderBadge provider={payment.provider} /></div>
          <div className="flex items-center gap-2"><span className="text-[11px] font-mono uppercase text-muted-foreground w-20">Método</span><MethodBadge method={payment.method} /></div>
          <div className="flex items-center gap-2"><span className="text-[11px] font-mono uppercase text-muted-foreground w-20">Estado</span><StatusBadge status={payment.status} /></div>
          <div className="flex items-center gap-2"><span className="text-[11px] font-mono uppercase text-muted-foreground w-20">Orden</span><span className="font-mono text-xs">{payment.orderId ?? payment.reservationId ?? "—"}</span></div>
          <div className="flex items-center gap-2 col-span-2"><span className="text-[11px] font-mono uppercase text-muted-foreground w-20">Idempotencia</span><span className="font-mono text-xs text-muted-foreground">{payment.idempotencyKey}</span></div>
        </div>

        {/* Timeline */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Cronología</div>
          <ol className="space-y-2.5">
            {timeline.map((t, i) => {
              const tone = t.tone === "ok" ? "bg-emerald-400" : t.tone === "warn" ? "bg-amber-400" : t.tone === "err" ? "bg-rose-400" : "bg-[var(--teal)]";
              return (
                <li key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={cn("h-2 w-2 rounded-full mt-1.5", tone)} />
                    {i < timeline.length - 1 && <span className="w-px flex-1 bg-border/60" />}
                  </div>
                  <div className="pb-1">
                    <div className="text-sm text-foreground">{t.label}</div>
                    {t.at && <div className="text-[11px] font-mono text-muted-foreground">{fmtDate(t.at)}</div>}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {payment.errorCode && (
          <div className="rounded-md border border-rose-400/40 bg-rose-400/10 p-3 text-xs text-rose-200 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
            <div>
              <div className="font-medium">Error: {payment.errorCode}</div>
              <div className="text-rose-200/80 mt-0.5">El pago fue rechazado por el proveedor. No se ha realizado cargo alguno. Se requiere nuevo intento con método distinto.</div>
            </div>
          </div>
        )}

        {payment.status === "disputed" && (
          <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200 flex items-start gap-2">
            <Gavel className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
            <div>
              <div className="font-medium">Disputa {payment.disputeStatus}</div>
              <div className="text-rose-200/80 mt-0.5">El cliente ha reclamado este cargo. Reúne evidencia (ticket, política aceptada, registro de servicio) y envíala antes de la fecha límite.</div>
            </div>
          </div>
        )}

        <DialogFooter>
          {payment.provider === "stripe" && payment.externalRef && (
            <Button variant="outline" onClick={() => toast({ title: "Abriendo Stripe (demo)", description: `Dashboard → ${payment.externalRef}` })}>
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Ver en Stripe
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Refund dialog
 * =======================================================*/
function RefundDialog({
  payment, onClose,
}: {
  payment: Payment | null;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [mode, setMode] = React.useState<"full" | "partial">("full");
  const [amountInput, setAmountInput] = React.useState<string>("");
  const [reason, setReason] = React.useState<string>("");

  React.useEffect(() => {
    if (payment) {
      setMode("full");
      setAmountInput("");
      setReason("");
    }
  }, [payment]);

  if (!payment) return null;
  const refundable = payment.capturedAmount - payment.refundedAmount;

  const submit = () => {
    let amt = 0;
    if (mode === "full") amt = refundable;
    else {
      const euros = parseFloat(amountInput.replace(",", "."));
      if (isNaN(euros) || euros <= 0) {
        toast({ title: "Importe no válido", variant: "destructive" });
        return;
      }
      amt = Math.round(euros * 100);
      if (amt > refundable) {
        toast({ title: `El importe supera el reembolsable (${fmtMoney(refundable)})`, variant: "destructive" });
        return;
      }
    }
    if (!reason.trim()) {
      toast({ title: "Indica el motivo del reembolso", variant: "destructive" });
      return;
    }
    toast({
      title: "Reembolso registrado (demo)",
      description: `${fmtMoney(amt)} · ${payment.externalRef ?? "pago"} · motivo: ${reason}`,
    });
    onClose();
  };

  return (
    <Dialog open={!!payment} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-amber-300" aria-hidden /> Reembolsar pago <DemoBadge />
          </DialogTitle>
          <DialogDescription>
            {payment.customerName} · <span className="font-mono">{payment.externalRef ?? payment.id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rp-glass rounded-lg p-3 grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-[10px] font-mono uppercase text-muted-foreground">Capturado</div>
              <div className="font-mono tabular-nums">{fmtMoney(payment.capturedAmount)}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-muted-foreground">Ya reemb.</div>
              <div className="font-mono tabular-nums text-amber-300">{fmtMoney(payment.refundedAmount)}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-muted-foreground">Reembolsable</div>
              <div className="font-mono tabular-nums text-emerald-300">{fmtMoney(refundable)}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("full")}
              className={cn(
                "flex-1 rounded-md border px-3 py-2.5 text-sm text-left transition-colors",
                mode === "full" ? "border-amber-400/50 bg-amber-400/10 text-amber-200" : "border-border/60 hover:bg-foreground/5",
              )}
            >
              <div className="font-medium">Reembolso completo</div>
              <div className="text-[11px] text-muted-foreground font-mono">{fmtMoney(refundable)}</div>
            </button>
            <button
              type="button"
              onClick={() => setMode("partial")}
              className={cn(
                "flex-1 rounded-md border px-3 py-2.5 text-sm text-left transition-colors",
                mode === "partial" ? "border-amber-400/50 bg-amber-400/10 text-amber-200" : "border-border/60 hover:bg-foreground/5",
              )}
            >
              <div className="font-medium">Reembolso parcial</div>
              <div className="text-[11px] text-muted-foreground">Importe personalizado</div>
            </button>
          </div>

          {mode === "partial" && (
            <div>
              <Label htmlFor="refund-amount" className="text-xs">Importe a reembolsar (€)</Label>
              <Input
                id="refund-amount"
                inputMode="decimal"
                placeholder="0,00"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value.replace(/[^\d,\.]/g, ""))}
                className="mt-1.5 font-mono"
              />
              <div className="mt-1 text-[10px] text-muted-foreground font-mono">Máx: {fmtMoney(refundable)}</div>
            </div>
          )}

          <div>
            <Label htmlFor="refund-reason" className="text-xs">Motivo del reembolso</Label>
            <Input
              id="refund-reason"
              placeholder="Ej. Plato no servido, cancelación cliente…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div className="rounded-md border border-border/40 p-2.5 text-[11px] text-muted-foreground flex items-start gap-2">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 rp-teal-text" aria-hidden />
            <span>El reembolso es idempotente (clave <span className="font-mono">{payment.idempotencyKey}</span>). Se registra como movimiento compensatorio en el ledger inmutable.</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} className="bg-amber-500/90 hover:bg-amber-500 text-black">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Confirmar reembolso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Pagos tab
 * =======================================================*/
function PagosTab() {
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [providerFilter, setProviderFilter] = React.useState<string>("all");
  const [methodFilter, setMethodFilter] = React.useState<string>("all");
  const [search, setSearch] = React.useState<string>("");
  const [detail, setDetail] = React.useState<Payment | null>(null);
  const [refund, setRefund] = React.useState<Payment | null>(null);
  const { toast } = useToast();

  const filtered = PAYMENTS.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (providerFilter !== "all" && p.provider !== providerFilter) return false;
    if (methodFilter !== "all" && p.method !== methodFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const hay = `${p.externalRef ?? ""} ${p.customerName ?? ""} ${p.idempotencyKey} ${p.orderId ?? ""} ${p.reservationId ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const capture = (p: Payment) => {
    toast({
      title: "Captura ejecutada (demo)",
      description: `${fmtMoney(p.amount)} · ${p.externalRef} · idem ${p.idempotencyKey}`,
    });
  };

  return (
    <div className="space-y-5">
      <KpiStrip />

      {/* Filters */}
      <div className="rp-glass rounded-xl p-3 sm:p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
            <Input
              placeholder="Buscar por ref. externa, cliente, idempotencia u orden…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-3 gap-2 lg:flex">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[150px]"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="authorized">Autorizado</SelectItem>
                <SelectItem value="captured">Capturado</SelectItem>
                <SelectItem value="partially_refunded">Reembolso parcial</SelectItem>
                <SelectItem value="refunded">Reembolsado</SelectItem>
                <SelectItem value="failed">Fallido</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="disputed">Disputado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-full lg:w-[130px]"><SelectValue placeholder="Proveedor" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los proveedores</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full lg:w-[130px]"><SelectValue placeholder="Método" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los métodos</SelectItem>
                <SelectItem value="card">Tarjeta</SelectItem>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="wallet">Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <PaymentsTable payments={filtered} onView={setDetail} onCapture={capture} onRefund={setRefund} />
      <PaymentsCards payments={filtered} onView={setDetail} onCapture={capture} onRefund={setRefund} />

      <PaymentDetailDialog payment={detail} onClose={() => setDetail(null)} />
      <RefundDialog payment={refund} onClose={() => setRefund(null)} />
    </div>
  );
}

/* =========================================================
 * Ledger tab
 * =======================================================*/
function LedgerTab() {
  const { toast } = useToast();
  const cobrado = LEDGER.filter((e) => e.type === "charge" || e.type === "payment").reduce((s, e) => s + e.amount, 0);
  const reembolsado = -LEDGER.filter((e) => e.type === "refund").reduce((s, e) => s + e.amount, 0);
  const ajustes = LEDGER.filter((e) => ["penalty", "commission", "adjustment", "reconciliation_diff", "credit"].includes(e.type)).reduce((s, e) => s + e.amount, 0);
  const suma = cobrado - reembolsado + ajustes;
  const finalBalance = LEDGER.length ? LEDGER[LEDGER.length - 1].balanceAfter : 0;
  const balanced = suma === finalBalance;

  const exportCsv = () => {
    const header = ["ID", "Tipo", "Descripcion", "Importe(cents)", "Balance(cents)", "Referencia", "Motivo", "IdempotencyKey", "Creado", "CreadoPor"];
    const rows = LEDGER.map((e) => [e.id, e.type, e.description, e.amount, e.balanceAfter, e.reference, e.reason ?? "", e.idempotencyKey, e.createdAt, e.createdBy]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ledger-restopanel-20250715.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Ledger exportado (demo)", description: "ledger-restopanel-20250715.csv" });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-medium tracking-tight flex items-center gap-2">
            <Layers className="h-4 w-4 rp-gold-text" aria-hidden /> Ledger financiero inmutable
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Apéndice contable de solo adición — 15 movimientos · demo</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Exportar ledger (CSV)
        </Button>
      </div>

      {/* Math validation banner */}
      <div className={cn(
        "rp-glass rounded-xl p-4 border-l-2",
        balanced ? "border-l-emerald-400/60" : "border-l-rose-400/60",
      )}>
        <div className="flex items-center gap-2 flex-wrap">
          <CheckCircle2 className={cn("h-4 w-4", balanced ? "text-emerald-300" : "text-rose-300")} aria-hidden />
          <span className="text-sm font-medium">Suma de movimientos:</span>
          <span className="font-mono tabular-nums rp-gold-text">{fmtMoney(suma)}</span>
          <span className="text-muted-foreground">=</span>
          <span className="text-sm text-muted-foreground">Cobrado</span>
          <span className="font-mono tabular-nums text-emerald-300">{fmtMoney(cobrado)}</span>
          <span className="text-muted-foreground">−</span>
          <span className="text-sm text-muted-foreground">Reembolsado</span>
          <span className="font-mono tabular-nums text-amber-300">{fmtMoney(reembolsado)}</span>
          <span className="text-muted-foreground">+</span>
          <span className="text-sm text-muted-foreground">Ajustes</span>
          <span className="font-mono tabular-nums text-[var(--gold-soft)]">{fmtMoney(ajustes)}</span>
          <span className={cn("font-mono", balanced ? "text-emerald-300" : "text-rose-300")}>{balanced ? "✓" : "✗"}</span>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground flex items-start gap-2">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 rp-teal-text" aria-hidden />
          <span>
            El ledger es inmutable. Las correcciones se realizan mediante movimientos compensatorios.
            Nunca se sobrescribe un movimiento. Balance final: <span className="font-mono">{fmtMoney(finalBalance)}</span>.
          </span>
        </div>
      </div>

      {/* Desktop table */}
      <div className="rp-glass rounded-xl overflow-hidden hidden lg:block">
        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-foreground/[0.03]">
                {["ID", "Tipo", "Descripción", "Importe", "Balance", "Referencia", "Motivo", "Idempotencia", "Creado", "Por"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    {h === "Importe" || h === "Balance" ? <span className="float-right">{h}</span> : h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LEDGER.map((e) => (
                <tr key={e.id} className="border-b border-border/40 last:border-0 hover:bg-foreground/[0.03] transition-colors">
                  <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground">{e.id}</td>
                  <td className="px-3 py-2.5"><LedgerTypeBadge type={e.type} /></td>
                  <td className="px-3 py-2.5 text-foreground/90">{e.description}</td>
                  <td className={cn("px-3 py-2.5 text-right font-mono tabular-nums", e.amount >= 0 ? "text-emerald-300" : "text-rose-300")}>
                    {fmtSigned(e.amount)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-foreground/85">{fmtMoney(e.balanceAfter)}</td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground">{e.reference}</td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground max-w-[200px] truncate" title={e.reason}>{e.reason ?? "—"}</td>
                  <td className="px-3 py-2.5 font-mono text-[10px] text-muted-foreground">{e.idempotencyKey}</td>
                  <td className="px-3 py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">{fmtDate(e.createdAt)}</td>
                  <td className="px-3 py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">{e.createdBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-2.5">
        {LEDGER.map((e) => (
          <div key={e.id} className="rp-glass rounded-xl p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground">{e.id}</span>
                  <LedgerTypeBadge type={e.type} />
                </div>
                <div className="mt-1 text-sm text-foreground/90">{e.description}</div>
              </div>
              <div className={cn("font-mono tabular-nums text-sm shrink-0", e.amount >= 0 ? "text-emerald-300" : "text-rose-300")}>
                {fmtSigned(e.amount)}
              </div>
            </div>
            <Separator className="my-2.5 bg-border/40" />
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
              <div><span className="text-muted-foreground">Balance: </span><span className="font-mono tabular-nums">{fmtMoney(e.balanceAfter)}</span></div>
              <div><span className="text-muted-foreground">Ref: </span><span className="font-mono">{e.reference}</span></div>
              {e.reason && <div className="col-span-2"><span className="text-muted-foreground">Motivo: </span>{e.reason}</div>}
              <div className="col-span-2"><span className="text-muted-foreground">Idem: </span><span className="font-mono text-[10px]">{e.idempotencyKey}</span></div>
              <div><span className="text-muted-foreground">Por: </span>{e.createdBy}</div>
              <div className="text-right text-muted-foreground">{fmtDate(e.createdAt)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
 * Disputas tab
 * =======================================================*/
function DisputasTab() {
  const { toast } = useToast();
  const [evidenceFor, setEvidenceFor] = React.useState<Dispute | null>(null);
  const [acceptFor, setAcceptFor] = React.useState<Dispute | null>(null);
  const [evidenceText, setEvidenceText] = React.useState("");

  const submitEvidence = () => {
    if (!evidenceFor) return;
    if (!evidenceText.trim()) {
      toast({ title: "Añade la evidencia", variant: "destructive" });
      return;
    }
    toast({
      title: "Evidencia enviada a Stripe (demo)",
      description: `${evidenceFor.id} · ${evidenceFor.paymentRef}`,
    });
    setEvidenceFor(null);
    setEvidenceText("");
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg sm:text-xl font-medium tracking-tight flex items-center gap-2">
          <Gavel className="h-4 w-4 rp-gold-text" aria-hidden /> Disputas y contracargos
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Gestión de chargebacks desde el proveedor de pago · demo</p>
      </div>

      <div className="rounded-md border border-border/40 bg-foreground/[0.02] p-3 text-xs text-muted-foreground flex items-start gap-2">
        <Info className="h-4 w-4 mt-0.5 shrink-0 rp-teal-text" aria-hidden />
        <span>
          Las disputas se gestionan dentro de los plazos del proveedor. Reúne evidencia (ticket firmado, política aceptada, registro de servicio, comunicación con el cliente) y súrela antes de la fecha límite. Aceptar una disputa cierra el caso sin poder recurrir.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {DISPUTES.map((d) => {
          const sm = DISPUTE_STATUS_META[d.status];
          const overdue = new Date(d.dueDate).getTime() < new Date(NOW_ISO).getTime();
          return (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rp-glass rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">{d.id}</span>
                    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px]", sm.cls)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", sm.dot)} />{sm.label}
                    </span>
                  </div>
                  <div className="mt-1.5 font-medium text-foreground">{d.customerName}</div>
                  <div className="text-[11px] font-mono text-muted-foreground">{d.paymentRef} · {d.orderId}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono tabular-nums text-lg rp-gold-text">{fmtMoney(d.amount)}</div>
                  <div className="text-[10px] text-muted-foreground">en disputa</div>
                </div>
              </div>

              <Separator className="my-3 bg-border/40" />

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[10px] font-mono uppercase text-muted-foreground">Motivo</div>
                  <div className="mt-0.5">{DISPUTE_REASON_LABEL[d.reason]}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-muted-foreground">Evidencia</div>
                  <div className="mt-0.5">
                    {d.evidenceStatus === "submitted" && <span className="text-emerald-300">Enviada</span>}
                    {d.evidenceStatus === "partial" && <span className="text-amber-300">Parcial</span>}
                    {d.evidenceStatus === "missing" && <span className="text-rose-300">Pendiente</span>}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-muted-foreground">Abierta</div>
                  <div className="mt-0.5">{fmtDate(d.openedAt)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-muted-foreground">Vence</div>
                  <div className={cn("mt-0.5", overdue ? "text-rose-300" : "")}>{fmtDate(d.dueDate)}</div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                <Button size="sm" variant="outline" className="h-9" onClick={() => toast({ title: "Abriendo detalle (demo)", description: d.id })}>
                  <Eye className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Ver detalle
                </Button>
                {d.status !== "won" && d.status !== "lost" && (
                  <>
                    <Button size="sm" variant="outline" className="h-9 border-[var(--teal)]/40 text-[var(--teal)]" onClick={() => { setEvidenceFor(d); setEvidenceText(""); }}>
                      <ShieldAlert className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Enviar evidencia
                    </Button>
                    <Button size="sm" variant="ghost" className="h-9 text-rose-300 hover:bg-rose-400/10" onClick={() => setAcceptFor(d)}>
                      <XCircle className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Aceptar disputa
                    </Button>
                  </>
                )}
                {d.status === "won" && (
                  <Badge className="border-emerald-400/40 bg-emerald-400/10 text-emerald-300 text-[10px]">resuelta a tu favor</Badge>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Evidence dialog */}
      <Dialog open={!!evidenceFor} onOpenChange={(o) => !o && setEvidenceFor(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 rp-teal-text" aria-hidden /> Enviar evidencia <DemoBadge />
            </DialogTitle>
            <DialogDescription>
              {evidenceFor?.id} · {evidenceFor?.paymentRef} · vence {fmtDate(evidenceFor?.dueDate)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="evidence-text" className="text-xs">Resumen de evidencia</Label>
              <textarea
                id="evidence-text"
                rows={5}
                placeholder="Describe la evidencia: ticket firmado, política de no-show aceptada, registro de servicio, emails…"
                value={evidenceText}
                onChange={(e) => setEvidenceText(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="rounded-md border border-dashed border-border/50 p-3 text-center text-xs text-muted-foreground">
              <Receipt className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground" aria-hidden />
              Arrastra o selecciona adjuntos (PDF, imágenes). Demo: no se sube ningún archivo.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEvidenceFor(null)}>Cancelar</Button>
            <Button onClick={submitEvidence} className="bg-[var(--teal)]/90 hover:bg-[var(--teal)] text-black">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Enviar a Stripe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Accept dispute confirm */}
      <AlertDialog open={!!acceptFor} onOpenChange={(o) => !o && setAcceptFor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-300" aria-hidden /> ¿Aceptar la disputa?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Aceptar la disputa {acceptFor?.id} cierra el caso a favor del cliente. El importe {acceptFor ? fmtMoney(acceptFor.amount) : ""} se devolverá y no podrás recurrir. Esta acción queda registrada en el ledger como movimiento compensatorio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-500/90 hover:bg-rose-500 text-white"
              onClick={() => {
                toast({ title: "Disputa aceptada (demo)", description: `${acceptFor?.id} · ${acceptFor ? fmtMoney(acceptFor.amount) : ""} devueltos` });
                setAcceptFor(null);
              }}
            >
              Aceptar disputa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* =========================================================
 * Políticas tab
 * =======================================================*/
function PoliticasTab() {
  const { toast } = useToast();
  const [stripeOpen, setStripeOpen] = React.useState(false);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-medium tracking-tight flex items-center gap-2">
            <Scale className="h-4 w-4 rp-gold-text" aria-hidden /> Políticas de penalización y proveedores
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Reglas de no-show, flujo de captura y abstracción de proveedor · demo</p>
        </div>
        <Button size="sm" onClick={() => setStripeOpen(true)}>
          <Settings2 className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Configurar Stripe
        </Button>
      </div>

      {/* No-show policies */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-medium text-sm">Políticas de depósito y no-show</h3>
          <DemoBadge />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {POLICIES.map((p) => (
            <div key={p.id} className="rp-glass rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium text-foreground">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Aplica a: {p.appliesTo}</div>
                </div>
                <Switch checked={p.active} aria-label={`Activar ${p.name}`} />
              </div>
              <Separator className="my-3 bg-border/40" />
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-[10px] font-mono uppercase text-muted-foreground">Tipo</div>
                  <div className="mt-0.5 flex items-center gap-1">
                    {p.type === "none" && <XCircle className="h-3 w-3 text-muted-foreground" />}
                    {p.type === "fixed" && <Coins className="h-3 w-3 rp-gold-text" />}
                    {p.type === "percentage" && <Percent className="h-3 w-3 rp-teal-text" />}
                    {p.type === "none" ? "Sin depósito" : p.type === "fixed" ? "Fijo" : "Porcentaje"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-muted-foreground">Importe</div>
                  <div className="mt-0.5 font-mono tabular-nums">
                    {p.type === "none" ? "—" : p.type === "fixed" ? fmtMoney(p.amount) : `${p.amount}%`}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-muted-foreground">Cancelación</div>
                  <div className="mt-0.5">{p.cancellationWindowHours > 0 ? `${p.cancellationWindowHours}h antes` : "—"}</div>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Button size="sm" variant="ghost" className="h-8" onClick={() => toast({ title: "Editando política (demo)", description: p.name })}>
                  <Pencil className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Editar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* No-show penalty flow */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-medium text-sm">Flujo de penalización por no-show</h3>
          <DemoBadge />
        </div>
        <div className="rp-glass rounded-xl p-4 sm:p-5">
          <ol className="space-y-0">
            {NOSHOW_FLOW.map((s, i) => {
              const last = i === NOSHOW_FLOW.length - 1;
              return (
                <li key={s.step} className="flex gap-3 sm:gap-4">
                  <div className="flex flex-col items-center">
                    <span className="h-8 w-8 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] flex items-center justify-center font-mono text-sm shrink-0">
                      {s.step}
                    </span>
                    {!last && <span className="w-px flex-1 bg-gradient-to-b from-[var(--gold)]/40 to-border/40 my-1" />}
                  </div>
                  <div className="pb-4">
                    <div className="font-medium text-sm text-foreground">{s.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Payment provider abstraction */}
      <section>
        <Collapsible>
          <div className="rp-glass rounded-xl overflow-hidden">
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-foreground/[0.03] transition-colors">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Code2 className="h-4 w-4 rp-teal-text" aria-hidden /> Abstracción de proveedor de pago
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border-t border-border/40 p-4">
                <pre className="overflow-x-auto rp-scroll-thin text-xs leading-relaxed font-mono text-foreground/85 bg-background/40 rounded-md p-3">
{PROVIDER_SNIPPET}
                </pre>
                <div className="mt-2 text-[11px] text-muted-foreground flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 rp-teal-text" aria-hidden />
                  <span>Toda operación de pago pasa por esta interfaz. Esto permite cambiar de Stripe a otro proveedor (o coexistir) sin tocar la lógica de negocio.</span>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </section>

      <StripeConfigDialog open={stripeOpen} onOpenChange={setStripeOpen} />
    </div>
  );
}

function StripeConfigDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { toast } = useToast();
  const [mode, setMode] = React.useState<"test" | "live">("test");
  const [keys, setKeys] = React.useState({ pk: "pk_test_51Hzx••••••", sk: "sk_test_51Hzx••••••", webhook: "whsec_DEMO_REPLACE_ME" });
  const [idempotencyRetries, setIdempotencyRetries] = React.useState("3");

  const save = () => {
    toast({ title: "Configuración de Stripe guardada (demo)", description: `Modo ${mode} · reintentos idempotencia: ${idempotencyRetries}` });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 rp-gold-text" aria-hidden /> Configurar Stripe <DemoBadge />
          </DialogTitle>
          <DialogDescription>Claves, secreto de webhook y reintentos idempotentes.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("test")}
              className={cn(
                "flex-1 rounded-md border px-3 py-2 text-sm transition-colors",
                mode === "test" ? "border-[var(--teal)]/50 bg-[var(--teal)]/10 text-[var(--teal)]" : "border-border/60 hover:bg-foreground/5",
              )}
            >
              Test
            </button>
            <button
              type="button"
              onClick={() => setMode("live")}
              className={cn(
                "flex-1 rounded-md border px-3 py-2 text-sm transition-colors",
                mode === "live" ? "border-[var(--gold)]/50 bg-[var(--gold)]/10 text-[var(--gold-soft)]" : "border-border/60 hover:bg-foreground/5",
              )}
            >
              Live
            </button>
          </div>

          <div>
            <Label htmlFor="pk" className="text-xs flex items-center gap-1.5"><KeyRound className="h-3 w-3" aria-hidden /> Publishable key</Label>
            <Input id="pk" value={keys.pk} onChange={(e) => setKeys({ ...keys, pk: e.target.value })} className="mt-1.5 font-mono text-xs" />
          </div>
          <div>
            <Label htmlFor="sk" className="text-xs flex items-center gap-1.5"><Lock className="h-3 w-3" aria-hidden /> Secret key</Label>
            <Input id="sk" type="password" value={keys.sk} onChange={(e) => setKeys({ ...keys, sk: e.target.value })} className="mt-1.5 font-mono text-xs" />
          </div>
          <div>
            <Label htmlFor="wh" className="text-xs flex items-center gap-1.5"><Webhook className="h-3 w-3" aria-hidden /> Webhook signing secret</Label>
            <Input id="wh" type="password" value={keys.webhook} onChange={(e) => setKeys({ ...keys, webhook: e.target.value })} className="mt-1.5 font-mono text-xs" />
          </div>
          <div>
            <Label htmlFor="retries" className="text-xs flex items-center gap-1.5"><Repeat className="h-3 w-3" aria-hidden /> Reintentos idempotentes</Label>
            <Input id="retries" inputMode="numeric" value={idempotencyRetries} onChange={(e) => setIdempotencyRetries(e.target.value.replace(/\D/g, ""))} className="mt-1.5 font-mono" />
          </div>

          <div className="rounded-md border border-border/40 p-2.5 text-[11px] text-muted-foreground flex items-start gap-2">
            <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0 rp-teal-text" aria-hidden />
            <span>Las claves se cifran en reposo. La secret key nunca se expone al cliente. Demo: no se guarda ninguna clave real.</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save}>Guardar configuración</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Main component
 * =======================================================*/
export function FinPayments() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <header className="space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-md bg-[var(--gold)]/10 border border-[var(--gold)]/30 flex items-center justify-center">
            <CreditCard className="h-5 w-5 rp-gold-text" aria-hidden />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-light tracking-tight">Centro de pagos</h1>
          <DemoBadge />
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Autorizaciones, capturas, reembolsos y disputas sobre el proveedor de pago. Ledger inmutable con movimientos compensatorios. Todos los datos son demostrativos.
        </p>
      </header>

      <Tabs defaultValue="pagos" className="w-full">
        <TabsList className="bg-foreground/[0.04] border border-border/40 h-auto p-1 flex flex-wrap gap-1">
          <TabsTrigger value="pagos" className="data-[state=active]:bg-[var(--gold)]/10 data-[state=active]:text-[var(--gold-soft)]">Pagos</TabsTrigger>
          <TabsTrigger value="ledger" className="data-[state=active]:bg-[var(--gold)]/10 data-[state=active]:text-[var(--gold-soft)]">Ledger</TabsTrigger>
          <TabsTrigger value="disputas" className="data-[state=active]:bg-[var(--gold)]/10 data-[state=active]:text-[var(--gold-soft)]">Disputas</TabsTrigger>
          <TabsTrigger value="politicas" className="data-[state=active]:bg-[var(--gold)]/10 data-[state=active]:text-[var(--gold-soft)]">Políticas</TabsTrigger>
        </TabsList>
        <TabsContent value="pagos" className="mt-5 focus-visible:outline-none">
          <PagosTab />
        </TabsContent>
        <TabsContent value="ledger" className="mt-5 focus-visible:outline-none">
          <LedgerTab />
        </TabsContent>
        <TabsContent value="disputas" className="mt-5 focus-visible:outline-none">
          <DisputasTab />
        </TabsContent>
        <TabsContent value="politicas" className="mt-5 focus-visible:outline-none">
          <PoliticasTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
