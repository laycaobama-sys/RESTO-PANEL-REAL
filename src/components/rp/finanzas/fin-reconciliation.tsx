"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale, AlertTriangle, AlertOctagon, CheckCircle2, XCircle, Eye, Download,
  Search, FileText, Plus, Ban, ShieldCheck, Clock, ArrowLeftRight, Copy,
  TrendingUp, TrendingDown, Receipt, Percent, Building2, User, Wallet,
  Webhook, Split, HelpCircle, Info, Check, RefreshCw, Coins, Layers,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type ExceptionType =
  | "order_without_payment" | "payment_without_order" | "duplicate_ticket"
  | "amount_mismatch" | "invalid_tax" | "unsupported_currency"
  | "invoice_failed" | "webhook_lost" | "incomplete_refund"
  | "ticket_without_reservation" | "ambiguous_customer";

type ExceptionStatus = "open" | "investigating" | "resolved" | "ignored";
type ExceptionSeverity = "critical" | "high" | "medium" | "low";

interface ReconciliationException {
  id: string;
  type: ExceptionType;
  severity: ExceptionSeverity;
  status: ExceptionStatus;
  title: string;
  description: string;
  orderId?: string;
  paymentId?: string;
  invoiceId?: string;
  amount?: number;
  expectedAmount?: number;
  actualAmount?: number;
  detectedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  ignoreReason?: string;
}

type InvoiceStatus = "issued" | "paid" | "void" | "draft";

interface Invoice {
  id: string;
  number: string;
  customerName: string;
  taxId: string;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  issuedAt: string;
  paidAt?: string;
  externalRef?: string;
  orderId?: string;
}

/* =========================================================
 * Helpers — money in integer cents
 * =======================================================*/
const EUR = (c: number) =>
  (Math.abs(c) / 100).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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


/* =========================================================
 * Exception meta
 * =======================================================*/
const SEVERITY_META: Record<ExceptionSeverity, { label: string; cls: string; dot: string }> = {
  critical: { label: "Crítica", cls: "border-rose-500/50 bg-rose-500/10 text-rose-300", dot: "bg-rose-500" },
  high: { label: "Alta", cls: "border-amber-400/50 bg-amber-400/10 text-amber-300", dot: "bg-amber-400" },
  medium: { label: "Media", cls: "border-[var(--gold)]/45 bg-[var(--gold)]/10 text-[var(--gold-soft)]", dot: "bg-[var(--gold)]" },
  low: { label: "Baja", cls: "border-foreground/20 bg-foreground/5 text-muted-foreground", dot: "bg-muted-foreground" },
};

function SeverityBadge({ severity }: { severity: ExceptionSeverity }) {
  const m = SEVERITY_META[severity];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap", m.cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} aria-hidden />
      {m.label}
    </span>
  );
}

const TYPE_META: Record<ExceptionType, { label: string; icon: React.ElementType }> = {
  order_without_payment: { label: "Orden sin pago", icon: Receipt },
  payment_without_order: { label: "Pago sin orden", icon: Wallet },
  duplicate_ticket: { label: "Ticket duplicado", icon: Copy },
  amount_mismatch: { label: "Importe discrepante", icon: ArrowLeftRight },
  invalid_tax: { label: "IVA inválido", icon: Percent },
  unsupported_currency: { label: "Divisa no soportada", icon: Coins },
  invoice_failed: { label: "Factura fallida", icon: FileText },
  webhook_lost: { label: "Webhook perdido", icon: Webhook },
  incomplete_refund: { label: "Reembolso incompleto", icon: RefreshCw },
  ticket_without_reservation: { label: "Ticket sin reserva", icon: Receipt },
  ambiguous_customer: { label: "Cliente ambiguo", icon: User },
};

function TypeBadge({ type }: { type: ExceptionType }) {
  const m = TYPE_META[type];
  const Icon = m.icon;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-foreground/15 bg-foreground/[0.04] px-2 py-0.5 text-[11px] text-foreground/80 whitespace-nowrap">
      <Icon className="h-3 w-3" aria-hidden /> {m.label}
    </span>
  );
}

const STATUS_META: Record<ExceptionStatus, { label: string; cls: string; dot: string }> = {
  open: { label: "Abierta", cls: "border-rose-400/50 bg-rose-400/10 text-rose-300", dot: "bg-rose-400" },
  investigating: { label: "Investigando", cls: "border-amber-400/50 bg-amber-400/10 text-amber-300", dot: "bg-amber-400" },
  resolved: { label: "Resuelta", cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300", dot: "bg-emerald-400" },
  ignored: { label: "Ignorada", cls: "border-foreground/20 bg-foreground/5 text-muted-foreground", dot: "bg-muted-foreground" },
};

function StatusBadge({ status }: { status: ExceptionStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap", m.cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} aria-hidden />
      {m.label}
    </span>
  );
}

/* =========================================================
 * Demo data — exceptions (8)
 * 5 resolved + 3 pending (2 open + 1 investigating) → matches summary 8/5/3
 * =======================================================*/
const EXCEPTIONS: ReconciliationException[] = [
  {
    id: "EXC-001", type: "order_without_payment", severity: "high", status: "open",
    title: "Orden SQ-2025-0143 sin pago registrado",
    description: "La orden se cerró hace 2 h pero no consta ningún pago capturado ni autorizado asociado. Posible cierre en limpio o pérdida de webhook.",
    orderId: "SQ-2025-0143", amount: 25200, detectedAt: "2025-07-15T17:30:00Z",
  },
  {
    id: "EXC-002", type: "amount_mismatch", severity: "medium", status: "open",
    title: "Diferencia entre orden y pago: €168 vs €164",
    description: "El importe del pago capturado no coincide con el total de la orden. Descuadre de €4 sin justificar.",
    orderId: "SQ-2025-0146", paymentId: "pi_01HZXA", expectedAmount: 16800, actualAmount: 16400,
    detectedAt: "2025-07-15T16:45:00Z",
  },
  {
    id: "EXC-003", type: "duplicate_ticket", severity: "critical", status: "resolved",
    title: "Ticket duplicado: SQ-2025-0144 aparece 2 veces",
    description: "Se detectaron dos tickets con el mismo número de orden en el cierre de caja. Riesgo de doble facturación.",
    orderId: "SQ-2025-0144", amount: 18000, detectedAt: "2025-07-15T15:10:00Z",
    resolvedAt: "2025-07-15T15:40:00Z", resolvedBy: "Lucía Ferrer",
    resolution: "Verificado: reimpresión de ticket por fallo de impresora, no doble cargo. Marcado como falsa alarma y consolidado.",
  },
  {
    id: "EXC-004", type: "payment_without_order", severity: "high", status: "resolved",
    title: "Pago pi_01HZXF sin orden asociada",
    description: "El PaymentIntent no tiene orderId en nuestros registros. Posible sincronización incompleta o eliminación de orden.",
    paymentId: "pi_01HZXF", amount: 18000, detectedAt: "2025-07-15T14:20:00Z",
    resolvedAt: "2025-07-15T14:55:00Z", resolvedBy: "Carlos Méndez",
    resolution: "Pago vinculado manualmente a orden SQ-2025-0144 (disputa en curso). Reconciliación completada.",
  },
  {
    id: "EXC-005", type: "incomplete_refund", severity: "medium", status: "resolved",
    title: "Reembolso parcial sin motivo registrado",
    description: "Se procesó un reembolso parcial de €20 sin campo motivo. Impide traza auditora completa.",
    paymentId: "pi_01HZXE", amount: 2000, detectedAt: "2025-07-15T16:25:00Z",
    resolvedAt: "2025-07-15T16:50:00Z", resolvedBy: "Lucía Ferrer",
    resolution: "Motivo añadido: plato no servido. Movimiento compensatorio registrado en ledger. Cerrado.",
  },
  {
    id: "EXC-006", type: "ticket_without_reservation", severity: "low", status: "resolved",
    title: "Orden LS-2025-0089 sin reserva (walk-in)",
    description: "Ticket de bar sin reserva vinculada. Común en walk-ins pero requiere clasificación para reporting.",
    orderId: "LS-2025-0089", amount: 3800, detectedAt: "2025-07-15T13:05:00Z",
    resolvedAt: "2025-07-15T13:15:00Z", resolvedBy: "Marta (caja)",
    resolution: "Confirmado walk-in en barra, sin necesidad de reserva. Etiquetado como 'bar-walkin' para reporting.",
  },
  {
    id: "EXC-007", type: "ambiguous_customer", severity: "medium", status: "resolved",
    title: "Cliente ambiguo en orden RV-2025-0234",
    description: "Dos clientes coinciden por nombre y teléfono parcial. Riesgo de atribuir la orden al CRM equivocado.",
    orderId: "RV-2025-0234", detectedAt: "2025-07-15T12:30:00Z",
    resolvedAt: "2025-07-15T13:00:00Z", resolvedBy: "Carlos Méndez",
    resolution: "Cliente identificado por email confirmado. Fusionado en CRM (cliente principal preservado).",
  },
  {
    id: "EXC-008", type: "webhook_lost", severity: "high", status: "investigating",
    title: "Webhook de Stripe no recibido (pi_01HZXG)",
    description: "El evento payment_intent.payment_failed no llegó. El pago figura como pendiente en RestoPanel pero fallido en Stripe. Reconciliación en curso.",
    paymentId: "pi_01HZXG", amount: 4200, detectedAt: "2025-07-15T16:42:00Z",
  },
];

/* =========================================================
 * Demo data — invoices (8)
 * =======================================================*/
const INVOICES: Invoice[] = [
  { id: "iv1", number: "FAC-2025-0142", customerName: "Elena Marín", taxId: "X1234567Y", subtotal: 15273, tax: 1527, total: 16800, currency: "EUR", status: "paid", issuedAt: "2025-07-15T13:42:00Z", paidAt: "2025-07-15T13:42:08Z", orderId: "SQ-2025-0142" },
  { id: "iv2", number: "FAC-2025-0148", customerName: "Familia Ruiz", taxId: "X2345678Z", subtotal: 22909, tax: 2291, total: 25200, currency: "EUR", status: "paid", issuedAt: "2025-07-15T14:05:00Z", paidAt: "2025-07-15T14:05:12Z", orderId: "SQ-2025-0148" },
  { id: "iv3", number: "FAC-2025-0150", customerName: "Marta Iborra", taxId: "X3456789A", subtotal: 10909, tax: 1091, total: 12000, currency: "EUR", status: "paid", issuedAt: "2025-07-15T14:18:00Z", paidAt: "2025-07-15T14:18:00Z", orderId: "SQ-2025-0150" },
  { id: "iv4", number: "FAC-2025-0151", customerName: "Andrés Vidal", taxId: "X4567890B", subtotal: 3455, tax: 345, total: 3800, currency: "EUR", status: "void", issuedAt: "2025-07-15T14:31:00Z", orderId: "SQ-2025-0151" },
  { id: "iv5", number: "FAC-2025-0152", customerName: "Lucía Ferrer", taxId: "X5678901C", subtotal: 8591, tax: 859, total: 9450, currency: "EUR", status: "paid", issuedAt: "2025-07-15T14:55:00Z", paidAt: "2025-07-15T14:55:09Z", orderId: "SQ-2025-0152" },
  { id: "iv6", number: "FAC-2025-0153", customerName: "Grupo Gastrolateral", taxId: "B98765432", subtotal: 136364, tax: 13636, total: 150000, currency: "EUR", status: "issued", issuedAt: "2025-07-15T15:02:00Z", externalRef: "ERP-GASTRO-8842", orderId: "SQ-2025-0153" },
  { id: "iv7", number: "FAC-2025-0144", customerName: "Carlos Méndez", taxId: "X6789012D", subtotal: 16364, tax: 1636, total: 18000, currency: "EUR", status: "issued", issuedAt: "2025-07-14T21:10:00Z", orderId: "SQ-2025-0144" },
  { id: "iv8", number: "FAC-2025-0155", customerName: "Evento Banquete (EVT-2025-018)", taxId: "B12345678", subtotal: 151591, tax: 15159, total: 166750, currency: "EUR", status: "draft", issuedAt: "2025-07-15T15:30:00Z", orderId: "EVT-2025-018" },
];

const INVOICE_STATUS_META: Record<InvoiceStatus, { label: string; cls: string; dot: string }> = {
  issued: { label: "Emitida", cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300", dot: "bg-emerald-400" },
  paid: { label: "Pagada", cls: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]", dot: "bg-[var(--teal)]" },
  void: { label: "Anulada", cls: "border-rose-400/50 bg-rose-400/10 text-rose-300", dot: "bg-rose-400" },
  draft: { label: "Borrador", cls: "border-foreground/20 bg-foreground/5 text-muted-foreground", dot: "bg-muted-foreground" },
};

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const m = INVOICE_STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap", m.cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} aria-hidden />
      {m.label}
    </span>
  );
}

/* =========================================================
 * Reconciliation timeline (last 5 runs)
 * =======================================================*/
const RUNS = [
  { id: "run1", at: "2025-07-15T19:00:00Z", orders: 247, discrepancies: 1, status: "balanced" as const },
  { id: "run2", at: "2025-07-15T15:00:00Z", orders: 198, discrepancies: 3, status: "balanced" as const },
  { id: "run3", at: "2025-07-15T12:00:00Z", orders: 142, discrepancies: 2, status: "balanced" as const },
  { id: "run4", at: "2025-07-15T09:00:00Z", orders: 64, discrepancies: 0, status: "balanced" as const },
  { id: "run5", at: "2025-07-14T23:00:00Z", orders: 312, discrepancies: 4, status: "discrepancy" as const, delta: 1800 },
];

/* =========================================================
 * Resumen tab
 * =======================================================*/
function ResumenTab() {
  const summary = [
    { label: "Órdenes verificadas", value: "247", icon: Receipt, accent: "gold" as const },
    { label: "Pagos verificados", value: "234", icon: Wallet, accent: "teal" as const },
    { label: "Facturas emitidas", value: "189", icon: FileText, accent: "gold" as const },
    { label: "Discrepancias detectadas", value: "8", icon: AlertTriangle, accent: "fg" as const },
    { label: "Discrepancias resueltas", value: "5", icon: CheckCircle2, accent: "teal" as const },
    { label: "Discrepancias pendientes", value: "3", icon: Clock, accent: "fg" as const },
  ];

  const ordersTotal = 418200;     // €4.182
  const capturedTotal = 405000;   // €4.050
  const pendingTotal = 13200;     // €132
  const refundsTotal = 12000;     // €120
  const neto = capturedTotal - refundsTotal; // €3.930
  const balanced = ordersTotal === capturedTotal + pendingTotal;

  return (
    <div className="space-y-5">
      {/* Summary card */}
      <div className="rp-glass rp-glow-gold rounded-xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Scale className="h-4 w-4 rp-gold-text" aria-hidden />
          <h2 className="font-display text-lg font-medium tracking-tight">Resumen de conciliación</h2>
          
          <span className="text-[11px] font-mono text-muted-foreground ml-auto">15 jul 2025 · 19:30</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {summary.map((s) => {
            const Icon = s.icon;
            const color = s.accent === "gold" ? "rp-gold-text" : s.accent === "teal" ? "rp-teal-text" : "text-foreground";
            return (
              <div key={s.label} className="rounded-lg border border-border/40 bg-background/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{s.label}</span>
                  <Icon className={cn("h-3.5 w-3.5", color)} aria-hidden />
                </div>
                <div className={cn("mt-1.5 font-display text-2xl font-light tabular-nums", color)}>{s.value}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cuadre + status */}
      <div className={cn(
        "rp-glass rounded-xl p-4 sm:p-5 border-l-2",
        balanced ? "border-l-emerald-400/60" : "border-l-rose-400/60",
      )}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
              balanced ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300",
            )}>
              {balanced ? <CheckCircle2 className="h-5 w-5" /> : <AlertOctagon className="h-5 w-5" />}
            </span>
            <div>
              <div className="text-sm font-medium">
                {balanced ? "Conciliación cuadrada" : "Descuadre detectado"}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                {balanced
                  ? `${fmtMoney(ordersTotal)} órdenes = ${fmtMoney(capturedTotal)} pagos + ${fmtMoney(pendingTotal)} pendientes`
                  : `Descuadre de ${fmtMoney(Math.abs(ordersTotal - capturedTotal - pendingTotal))}`}
                {" "}
                <span className={balanced ? "text-emerald-300" : "text-rose-300"}>{balanced ? "✓" : "✗"}</span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="self-start sm:self-auto">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Ejecutar reconciliación
          </Button>
        </div>
      </div>

      {/* Math validation */}
      <div className="rp-glass rounded-xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="h-4 w-4 rp-teal-text" aria-hidden />
          <h3 className="font-medium text-sm">Validación matemática</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ValidationItem label="Suma de órdenes" value={fmtMoney(ordersTotal)} tone="gold" />
          <ValidationItem label="Pagos capturados" value={fmtMoney(capturedTotal)} tone="teal" />
          <ValidationItem label="Pagos pendientes (auth.)" value={fmtMoney(pendingTotal)} tone="fg" />
          <ValidationItem label="Reembolsos" value={fmtMoney(refundsTotal)} tone="amber" />
        </div>
        <Separator className="my-3 bg-border/40" />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="text-muted-foreground">Neto:</span>
          <span className="font-mono tabular-nums rp-gold-text text-base">{fmtMoney(neto)}</span>
          <span className="text-muted-foreground">=</span>
          <span className="text-muted-foreground text-xs">capturado − reembolsos</span>
          <span className="text-emerald-300 ml-auto text-xs font-mono">€3.930 ✓</span>
        </div>
        <div className="mt-3 rounded-md border border-emerald-400/30 bg-emerald-400/[0.06] p-2.5 text-[11px] text-emerald-200/90 flex items-start gap-2">
          <Check className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden />
          <span className="font-mono">Validación: subtotal + tax + service − discount + tip = total ✓</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="rp-glass rounded-xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 rp-gold-text" aria-hidden />
          <h3 className="font-medium text-sm">Últimas ejecuciones de reconciliación</h3>
        </div>
        <div className="space-y-2">
          {RUNS.map((r) => {
            const ok = r.status === "balanced";
            return (
              <div key={r.id} className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/30 px-3 py-2.5">
                <span className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  ok ? "bg-emerald-400" : "bg-rose-400",
                )} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm">{fmtDate(r.at)}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    {r.orders} órdenes · {r.discrepancies} discrepancias
                    {!ok && r.delta ? ` · descuadre ${fmtMoney(r.delta)}` : ""}
                  </div>
                </div>
                <span className={cn(
                  "text-[11px] font-mono uppercase tracking-wider shrink-0",
                  ok ? "text-emerald-300" : "text-rose-300",
                )}>
                  {ok ? "cuadrado" : "descuadre"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ValidationItem({ label, value, tone }: { label: string; value: string; tone: "gold" | "teal" | "fg" | "amber" }) {
  const color = tone === "gold" ? "rp-gold-text" : tone === "teal" ? "rp-teal-text" : tone === "amber" ? "text-amber-300" : "text-foreground";
  return (
    <div className="rounded-lg border border-border/40 bg-background/30 p-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-mono tabular-nums text-lg", color)}>{value}</div>
    </div>
  );
}

/* =========================================================
 * Excepciones tab
 * =======================================================*/
function ExcepcionesTab() {
  const { toast } = useToast();
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [sevFilter, setSevFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [resolveFor, setResolveFor] = React.useState<ReconciliationException | null>(null);
  const [ignoreFor, setIgnoreFor] = React.useState<ReconciliationException | null>(null);
  const [resolution, setResolution] = React.useState("");
  const [ignoreReason, setIgnoreReason] = React.useState("");

  const filtered = EXCEPTIONS.filter((e) => {
    if (typeFilter !== "all" && e.type !== typeFilter) return false;
    if (sevFilter !== "all" && e.severity !== sevFilter) return false;
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    return true;
  });

  const submitResolution = () => {
    if (!resolveFor) return;
    if (!resolution.trim()) {
      toast({ title: "Escribe la resolución", variant: "destructive" });
      return;
    }
    toast({ title: "Excepción resuelta (demo)", description: `${resolveFor.id} · marcada como resuelta` });
    setResolveFor(null);
    setResolution("");
  };

  const submitIgnore = () => {
    if (!ignoreFor) return;
    if (!ignoreReason.trim()) {
      toast({ title: "Indica el motivo para ignorar", variant: "destructive" });
      return;
    }
    toast({ title: "Excepción ignorada (demo)", description: `${ignoreFor.id} · ${ignoreReason}` });
    setIgnoreFor(null);
    setIgnoreReason("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-medium tracking-tight flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 rp-gold-text" aria-hidden /> Cola de excepciones
          </h2>
          <p className="text-xs text-muted-foreground mt-1">{filtered.length} de {EXCEPTIONS.length} excepciones · demo</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rp-glass rounded-xl p-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {(Object.keys(TYPE_META) as ExceptionType[]).map((t) => (
                <SelectItem key={t} value={t}>{TYPE_META[t].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sevFilter} onValueChange={setSevFilter}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Severidad" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toda severidad</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="low">Baja</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="open">Abierta</SelectItem>
              <SelectItem value="investigating">Investigando</SelectItem>
              <SelectItem value="resolved">Resuelta</SelectItem>
              <SelectItem value="ignored">Ignorada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Exception cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <AnimatePresence>
          {filtered.map((e) => (
            <motion.div
              key={e.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="rp-glass rounded-xl p-4 flex flex-col"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] text-muted-foreground">{e.id}</span>
                  <TypeBadge type={e.type} />
                  <SeverityBadge severity={e.severity} />
                </div>
                <StatusBadge status={e.status} />
              </div>

              <div className="mt-2.5">
                <div className="text-sm font-medium text-foreground">{e.title}</div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{e.description}</p>
              </div>

              {/* Context */}
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                {e.orderId && (
                  <div><span className="text-muted-foreground">Orden: </span><span className="font-mono">{e.orderId}</span></div>
                )}
                {e.paymentId && (
                  <div><span className="text-muted-foreground">Pago: </span><span className="font-mono">{e.paymentId}</span></div>
                )}
                {e.invoiceId && (
                  <div><span className="text-muted-foreground">Factura: </span><span className="font-mono">{e.invoiceId}</span></div>
                )}
                {typeof e.amount === "number" && (
                  <div><span className="text-muted-foreground">Importe: </span><span className="font-mono tabular-nums">{fmtMoney(e.amount)}</span></div>
                )}
                {typeof e.expectedAmount === "number" && (
                  <div className="text-emerald-300"><span className="text-muted-foreground">Esperado: </span><span className="font-mono tabular-nums">{fmtMoney(e.expectedAmount)}</span></div>
                )}
                {typeof e.actualAmount === "number" && (
                  <div className="text-rose-300"><span className="text-muted-foreground">Real: </span><span className="font-mono tabular-nums">{fmtMoney(e.actualAmount)}</span></div>
                )}
                <div className="col-span-2"><span className="text-muted-foreground">Detectada: </span>{relativeTime(e.detectedAt)}</div>
              </div>

              {/* Resolution (if resolved/ignored) */}
              {(e.status === "resolved" || e.status === "ignored") && e.resolution && (
                <div className="mt-3 rounded-md border border-emerald-400/30 bg-emerald-400/[0.06] p-2.5 text-[11px] flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-300" aria-hidden />
                  <div>
                    <div className="text-emerald-200/90">{e.resolution}</div>
                    <div className="text-muted-foreground mt-1 font-mono text-[10px]">
                      {e.resolvedBy ?? "sistema"} · {fmtDate(e.resolvedAt)}
                    </div>
                  </div>
                </div>
              )}
              {e.status === "ignored" && e.ignoreReason && (
                <div className="mt-2 rounded-md border border-foreground/20 bg-foreground/[0.04] p-2.5 text-[11px] text-muted-foreground flex items-start gap-2">
                  <Ban className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden />
                  <span>Ignorada: {e.ignoreReason}</span>
                </div>
              )}

              {/* Actions */}
              <div className="mt-auto pt-3 flex items-center gap-1.5 flex-wrap">
                {e.status === "open" || e.status === "investigating" ? (
                  <>
                    <Button size="sm" variant="outline" className="h-9"
                      onClick={() => toast({ title: "Abriendo investigación (demo)", description: e.id })}>
                      <Eye className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Investigar
                    </Button>
                    <Button size="sm" variant="outline" className="h-9 border-emerald-400/40 text-emerald-300 hover:bg-emerald-400/10"
                      onClick={() => { setResolveFor(e); setResolution(""); }}>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Resolver
                    </Button>
                    <Button size="sm" variant="ghost" className="h-9 text-muted-foreground"
                      onClick={() => { setIgnoreFor(e); setIgnoreReason(""); }}>
                      <Ban className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Ignorar
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="ghost" className="h-9 text-muted-foreground"
                    onClick={() => toast({ title: "Reabriendo excepción (demo)", description: e.id })}>
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Reabrir
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="lg:col-span-2 rp-glass rounded-xl p-8 text-center text-muted-foreground text-sm">
            No hay excepciones que coincidan con los filtros.
          </div>
        )}
      </div>

      {/* Note */}
      <div className="rounded-md border border-[var(--teal)]/30 bg-[var(--teal)]/[0.06] p-3 text-xs text-foreground/80 flex items-start gap-2">
        <Info className="h-4 w-4 mt-0.5 shrink-0 rp-teal-text" aria-hidden />
        <span>
          Nunca se ocultan descuadres. Toda discrepancia se muestra, clasifica y registra con su resolución.
          Las excepciones resueltas permanecen en el historial para auditoría.
        </span>
      </div>

      {/* Resolve dialog */}
      <Dialog open={!!resolveFor} onOpenChange={(o) => !o && setResolveFor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden /> Resolver excepción 
            </DialogTitle>
            <DialogDescription>
              {resolveFor?.id} · {resolveFor ? TYPE_META[resolveFor.type].label : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="resolution" className="text-xs">Resolución aplicada</Label>
              <textarea
                id="resolution" rows={4}
                placeholder="Describe cómo se resolvió la discrepancia…"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="rounded-md border border-border/40 p-2.5 text-[11px] text-muted-foreground flex items-start gap-2">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 rp-teal-text" aria-hidden />
              <span>La resolución queda registrada con tu usuario y marca de tiempo. Si implica dinero, se generará un movimiento compensatorio en el ledger inmutable.</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveFor(null)}>Cancelar</Button>
            <Button onClick={submitResolution} className="bg-emerald-500/90 hover:bg-emerald-500 text-black">
              <Check className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Marcar como resuelta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ignore confirm */}
      <AlertDialog open={!!ignoreFor} onOpenChange={(o) => !o && setIgnoreFor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-muted-foreground" aria-hidden /> Ignorar excepción
            </AlertDialogTitle>
            <AlertDialogDescription>
              Ignorar {ignoreFor?.id} la oculta de las colas activas pero permanece en el historial de auditoría con el motivo indicado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="ignore-reason" className="text-xs">Motivo</Label>
            <Input
              id="ignore-reason"
              placeholder="Ej. falsa alarma, fuera de ámbito, duplicado…"
              value={ignoreReason}
              onChange={(e) => setIgnoreReason(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={submitIgnore}>Ignorar excepción</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* =========================================================
 * Facturas tab
 * =======================================================*/
function FacturasTab() {
  const { toast } = useToast();
  const [generateOpen, setGenerateOpen] = React.useState(false);
  const [voidFor, setVoidFor] = React.useState<Invoice | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const filtered = INVOICES.filter((i) => statusFilter === "all" || i.status === statusFilter);

  const taxSummary = [
    { label: "IVA repercutido (10%)", value: 84000, tone: "gold" as const, icon: TrendingUp },
    { label: "IVA soportado", value: 0, tone: "fg" as const, icon: TrendingDown },
    { label: "IRPF retención", value: 0, tone: "fg" as const, icon: Percent },
    { label: "Total facturado", value: 418200, tone: "teal" as const, icon: Receipt },
  ];

  const downloadPdf = (n: string) => {
    toast({ title: "Descargando factura (demo)", description: `${n}.pdf — generando…` });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-medium tracking-tight flex items-center gap-2">
            <FileText className="h-4 w-4 rp-gold-text" aria-hidden /> Facturas
          </h2>
          <p className="text-xs text-muted-foreground mt-1">{filtered.length} facturas · demo</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="issued">Emitidas</SelectItem>
              <SelectItem value="paid">Pagadas</SelectItem>
              <SelectItem value="void">Anuladas</SelectItem>
              <SelectItem value="draft">Borrador</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => setGenerateOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Generar factura
          </Button>
        </div>
      </div>

      {/* Tax summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {taxSummary.map((t) => {
          const Icon = t.icon;
          const color = t.tone === "gold" ? "rp-gold-text" : t.tone === "teal" ? "rp-teal-text" : "text-foreground";
          return (
            <div key={t.label} className="rp-glass rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{t.label}</span>
                <Icon className={cn("h-3.5 w-3.5", color)} aria-hidden />
              </div>
              <div className={cn("mt-1.5 font-mono tabular-nums text-xl", color)}>{fmtMoney(t.value)}</div>
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="rp-glass rounded-xl overflow-hidden hidden lg:block">
        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-foreground/[0.03]">
                {["Nº factura", "Cliente", "CIF/NIF", "Subtotal", "IVA", "Total", "Estado", "Emitida", "Acciones"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    {h === "Subtotal" || h === "IVA" || h === "Total" ? <span className="float-right">{h}</span> : h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} className="border-b border-border/40 last:border-0 hover:bg-foreground/[0.03] transition-colors">
                  <td className="px-3 py-3 font-mono text-xs">{inv.number}</td>
                  <td className="px-3 py-3 text-foreground/90">{inv.customerName}</td>
                  <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{inv.taxId}</td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums">{fmtMoney(inv.subtotal)}</td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums text-muted-foreground">{fmtMoney(inv.tax)}</td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums font-medium rp-gold-text">{fmtMoney(inv.total)}</td>
                  <td className="px-3 py-3"><InvoiceStatusBadge status={inv.status} /></td>
                  <td className="px-3 py-3 text-[11px] text-muted-foreground whitespace-nowrap">{fmtDate(inv.issuedAt)}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => downloadPdf(inv.number)}>
                        <Download className="h-3.5 w-3.5" aria-hidden /> PDF
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => toast({ title: "Detalle de factura (demo)", description: inv.number })}>
                        <Eye className="h-3.5 w-3.5" aria-hidden />
                      </Button>
                      {(inv.status === "issued" || inv.status === "paid") && (
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-rose-300 hover:bg-rose-400/10" onClick={() => setVoidFor(inv)}>
                          <Ban className="h-3.5 w-3.5" aria-hidden />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-2.5">
        {filtered.map((inv) => (
          <div key={inv.id} className="rp-glass rounded-xl p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-mono text-xs">{inv.number}</div>
                <div className="mt-0.5 font-medium text-foreground truncate">{inv.customerName}</div>
                <div className="font-mono text-[11px] text-muted-foreground">{inv.taxId}</div>
              </div>
              <InvoiceStatusBadge status={inv.status} />
            </div>
            <Separator className="my-2.5 bg-border/40" />
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-[10px] font-mono uppercase text-muted-foreground">Subtotal</div>
                <div className="font-mono tabular-nums mt-0.5">{fmtMoney(inv.subtotal)}</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-muted-foreground">IVA</div>
                <div className="font-mono tabular-nums mt-0.5 text-muted-foreground">{fmtMoney(inv.tax)}</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-muted-foreground">Total</div>
                <div className="font-mono tabular-nums mt-0.5 rp-gold-text">{fmtMoney(inv.total)}</div>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">Emitida: {fmtDate(inv.issuedAt)}{inv.externalRef ? ` · ${inv.externalRef}` : ""}</div>
            <div className="mt-3 flex items-center gap-1.5">
              <Button size="sm" variant="outline" className="h-9 flex-1" onClick={() => downloadPdf(inv.number)}>
                <Download className="h-3.5 w-3.5 mr-1.5" aria-hidden /> PDF
              </Button>
              <Button size="sm" variant="outline" className="h-9" onClick={() => toast({ title: "Detalle (demo)", description: inv.number })}>
                <Eye className="h-3.5 w-3.5" aria-hidden />
              </Button>
              {(inv.status === "issued" || inv.status === "paid") && (
                <Button size="sm" variant="outline" className="h-9 border-rose-400/40 text-rose-300" onClick={() => setVoidFor(inv)}>
                  <Ban className="h-3.5 w-3.5" aria-hidden />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-border/40 bg-foreground/[0.02] p-3 text-xs text-muted-foreground flex items-start gap-2">
        <Info className="h-4 w-4 mt-0.5 shrink-0 rp-teal-text" aria-hidden />
        <span>
          Las facturas se generan o sincronizan desde el sistema fiscal. Los datos fiscales dependen del proveedor fiscal configurado.
        </span>
      </div>

      <GenerateInvoiceDialog open={generateOpen} onOpenChange={setGenerateOpen} />
      <VoidInvoiceDialog invoice={voidFor} onClose={() => setVoidFor(null)} />
    </div>
  );
}

function GenerateInvoiceDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { toast } = useToast();
  const [orderId, setOrderId] = React.useState("");
  const [entity, setEntity] = React.useState({ name: "", taxId: "", address: "" });
  const [taxRate, setTaxRate] = React.useState("10");

  const submit = () => {
    if (!orderId.trim()) { toast({ title: "Selecciona una orden", variant: "destructive" }); return; }
    if (!entity.name.trim() || !entity.taxId.trim()) { toast({ title: "Datos fiscales incompletos", variant: "destructive" }); return; }
    toast({ title: "Factura generada (demo)", description: `Orden ${orderId} · IVA ${taxRate}%` });
    onOpenChange(false);
    setOrderId("");
    setEntity({ name: "", taxId: "", address: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4 rp-gold-text" aria-hidden /> Generar factura 
          </DialogTitle>
          <DialogDescription>Crea una factura a partir de una orden existente.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="order-id" className="text-xs">Orden de origen</Label>
            <Input id="order-id" placeholder="SQ-2025-0142" value={orderId} onChange={(e) => setOrderId(e.target.value)} className="mt-1.5 font-mono" />
          </div>
          <Separator className="bg-border/40" />
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="entity-name" className="text-xs flex items-center gap-1.5"><Building2 className="h-3 w-3" aria-hidden /> Razón social / nombre</Label>
              <Input id="entity-name" placeholder="Restaurante Ramses S.L." value={entity.name} onChange={(e) => setEntity({ ...entity, name: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="entity-taxid" className="text-xs flex items-center gap-1.5"><FileText className="h-3 w-3" aria-hidden /> CIF / NIF</Label>
              <Input id="entity-taxid" placeholder="B12345678" value={entity.taxId} onChange={(e) => setEntity({ ...entity, taxId: e.target.value })} className="mt-1.5 font-mono" />
            </div>
            <div>
              <Label htmlFor="tax-rate" className="text-xs flex items-center gap-1.5"><Percent className="h-3 w-3" aria-hidden /> Tipo de IVA</Label>
              <Select value={taxRate} onValueChange={setTaxRate}>
                <SelectTrigger id="tax-rate" className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10% (hostelería)</SelectItem>
                  <SelectItem value="21">21% (general)</SelectItem>
                  <SelectItem value="4">4% (reducido)</SelectItem>
                  <SelectItem value="0">0% (exento)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="entity-addr" className="text-xs">Dirección fiscal (opcional)</Label>
              <Input id="entity-addr" placeholder="Calle, número, CP, ciudad" value={entity.address} onChange={(e) => setEntity({ ...entity, address: e.target.value })} className="mt-1.5" />
            </div>
          </div>
          <div className="rounded-md border border-border/40 p-2.5 text-[11px] text-muted-foreground flex items-start gap-2">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 rp-teal-text" aria-hidden />
            <span>La factura se numera automáticamente según la serie configurada. Se envía al sistema fiscal si hay proveedor conectado.</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit}><FileText className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Generar factura</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VoidInvoiceDialog({ invoice, onClose }: { invoice: Invoice | null; onClose: () => void }) {
  const { toast } = useToast();
  return (
    <AlertDialog open={!!invoice} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Ban className="h-4 w-4 text-rose-300" aria-hidden /> Anular factura
          </AlertDialogTitle>
          <AlertDialogDescription>
            Vas a anular la factura {invoice?.number} ({invoice ? fmtMoney(invoice.total) : ""}).
            Se emite un abono rectificativo y se notifica al sistema fiscal. La acción queda registrada en auditoría.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-rose-500/90 hover:bg-rose-500 text-white"
            onClick={() => {
              toast({ title: "Factura anulada (demo)", description: `${invoice?.number} · abono rectificativo emitido` });
              onClose();
            }}
          >
            Anular factura
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* =========================================================
 * Main component
 * =======================================================*/
export function FinReconciliation() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <header className="space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-md bg-[var(--teal)]/10 border border-[var(--teal)]/30 flex items-center justify-center">
            <Scale className="h-5 w-5 rp-teal-text" aria-hidden />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-light tracking-tight">Conciliación y excepciones</h1>
          
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Cuadre de órdenes, pagos y facturas. Toda discrepancia se clasifica, se resuelve y queda registrada para auditoría. Datos demostrativos.
        </p>
      </header>

      <Tabs defaultValue="resumen" className="w-full">
        <TabsList className="bg-foreground/[0.04] border border-border/40 h-auto p-1 flex flex-wrap gap-1">
          <TabsTrigger value="resumen" className="data-[state=active]:bg-[var(--teal)]/10 data-[state=active]:text-[var(--teal)]">Resumen</TabsTrigger>
          <TabsTrigger value="excepciones" className="data-[state=active]:bg-[var(--teal)]/10 data-[state=active]:text-[var(--teal)]">
            Excepciones
            <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-400/20 text-rose-300 text-[10px] font-mono">3</span>
          </TabsTrigger>
          <TabsTrigger value="facturas" className="data-[state=active]:bg-[var(--teal)]/10 data-[state=active]:text-[var(--teal)]">Facturas</TabsTrigger>
        </TabsList>
        <TabsContent value="resumen" className="mt-5 focus-visible:outline-none">
          <ResumenTab />
        </TabsContent>
        <TabsContent value="excepciones" className="mt-5 focus-visible:outline-none">
          <ExcepcionesTab />
        </TabsContent>
        <TabsContent value="facturas" className="mt-5 focus-visible:outline-none">
          <FacturasTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
