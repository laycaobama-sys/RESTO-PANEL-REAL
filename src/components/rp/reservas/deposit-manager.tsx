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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  CreditCard,
  Wallet,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Lock,
  Banknote,
  Percent,
  Ban,
  Filter,
  Zap,
  Info,
  RotateCcw,
  Coins,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type DepositType = "none" | "fixed" | "percentage";
type DepositStatus =
  | "not_required"
  | "pending"
  | "preauthorized"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

interface DepositPolicy {
  id: string;
  name: string;
  type: DepositType;
  amount: number;
  currency: string;
  appliesTo: "all" | "vip" | "high_risk" | "weekends" | "events" | "large_groups";
  minPartySize: number;
  cancellationWindowHours: number;
  isDefault: boolean;
  active: boolean;
}

interface DepositTransaction {
  id: string;
  reservationCode: string;
  customerName: string;
  policy: string;
  amount: number;
  status: DepositStatus;
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
  refundAmount?: number;
  error?: string;
}

/* =========================================================
 * Demo policies
 * =======================================================*/
const INITIAL_POLICIES: DepositPolicy[] = [
  {
    id: "p1",
    name: "Sin depósito",
    type: "none",
    amount: 0,
    currency: "EUR",
    appliesTo: "all",
    minPartySize: 1,
    cancellationWindowHours: 0,
    isDefault: true,
    active: true,
  },
  {
    id: "p2",
    name: "Depósito fijo 10€",
    type: "fixed",
    amount: 1000,
    currency: "EUR",
    appliesTo: "high_risk",
    minPartySize: 1,
    cancellationWindowHours: 24,
    isDefault: false,
    active: true,
  },
  {
    id: "p3",
    name: "Depósito 30%",
    type: "percentage",
    amount: 30,
    currency: "EUR",
    appliesTo: "large_groups",
    minPartySize: 6,
    cancellationWindowHours: 48,
    isDefault: false,
    active: true,
  },
  {
    id: "p4",
    name: "Depósito 50%",
    type: "percentage",
    amount: 50,
    currency: "EUR",
    appliesTo: "weekends",
    minPartySize: 4,
    cancellationWindowHours: 24,
    isDefault: false,
    active: true,
  },
  {
    id: "p5",
    name: "Depósito 100%",
    type: "percentage",
    amount: 100,
    currency: "EUR",
    appliesTo: "events",
    minPartySize: 1,
    cancellationWindowHours: 72,
    isDefault: false,
    active: false,
  },
];

/* =========================================================
 * Demo transactions
 * =======================================================*/
const INITIAL_TX: DepositTransaction[] = [
  {
    id: "t1",
    reservationCode: "RES-2025-0142",
    customerName: "Elena Marín",
    policy: "Depósito fijo 10€",
    amount: 1000,
    status: "paid",
    stripePaymentIntentId: "pi_3Pq8Xm2eZvKYlo2C0wJ1aBcD",
    createdAt: "2025-06-10T18:42:00Z",
    updatedAt: "2025-06-10T18:42:48Z",
  },
  {
    id: "t2",
    reservationCode: "RES-2025-0143",
    customerName: "Marco Bianchi",
    policy: "Depósito 30%",
    amount: 5400,
    status: "preauthorized",
    stripePaymentIntentId: "pi_3Pq8Yn3fWqXLop3D1xK2cDeF",
    createdAt: "2025-06-10T19:05:12Z",
    updatedAt: "2025-06-10T19:05:51Z",
  },
  {
    id: "t3",
    reservationCode: "RES-2025-0144",
    customerName: "Andrea Rossi",
    policy: "Depósito 50%",
    amount: 7600,
    status: "pending",
    createdAt: "2025-06-10T19:14:33Z",
    updatedAt: "2025-06-10T19:14:33Z",
  },
  {
    id: "t4",
    reservationCode: "RES-2025-0138",
    customerName: "Lucas Fernández",
    policy: "Sin depósito",
    amount: 0,
    status: "not_required",
    createdAt: "2025-06-10T16:20:00Z",
    updatedAt: "2025-06-10T16:20:00Z",
  },
  {
    id: "t5",
    reservationCode: "RES-2025-0136",
    customerName: "Sophie Laurent",
    policy: "Depósito fijo 10€",
    amount: 1000,
    status: "failed",
    stripePaymentIntentId: "pi_3Pq8Zp4gXrYMnq4E2yL3eGhI",
    createdAt: "2025-06-10T15:48:21Z",
    updatedAt: "2025-06-10T15:49:02Z",
    error: "Tarjeta declinada (insufficient_funds)",
  },
  {
    id: "t6",
    reservationCode: "RES-2025-0130",
    customerName: "Carla Mendoza",
    policy: "Depósito 30%",
    amount: 3600,
    status: "refunded",
    stripePaymentIntentId: "pi_3Pq8Wq5hYsZNnr5F3zM4fIjK",
    createdAt: "2025-06-09T20:11:00Z",
    updatedAt: "2025-06-10T11:24:10Z",
    refundAmount: 3600,
  },
  {
    id: "t7",
    reservationCode: "RES-2025-0128",
    customerName: "Pablo Castaño",
    policy: "Depósito 100%",
    amount: 9800,
    status: "partially_refunded",
    stripePaymentIntentId: "pi_3Pq8Vr6iZtXOos6G4zN5gJkL",
    createdAt: "2025-06-09T17:33:00Z",
    updatedAt: "2025-06-10T09:48:55Z",
    refundAmount: 2000,
  },
  {
    id: "t8",
    reservationCode: "RES-2025-0145",
    customerName: "Nora Becker",
    policy: "Depósito fijo 10€",
    amount: 1000,
    status: "paid",
    stripePaymentIntentId: "pi_3Pq9Xs7jYuYPpt7H5aO6hKlM",
    createdAt: "2025-06-10T19:55:00Z",
    updatedAt: "2025-06-10T19:55:32Z",
  },
  {
    id: "t9",
    reservationCode: "RES-2025-0146",
    customerName: "Tomás Iglesias",
    policy: "Depósito 50%",
    amount: 5400,
    status: "paid",
    stripePaymentIntentId: "pi_3Pq9Yt8kZvZQqu8I6bP7iLmN",
    createdAt: "2025-06-10T20:02:11Z",
    updatedAt: "2025-06-10T20:02:44Z",
  },
  {
    id: "t10",
    reservationCode: "RES-2025-0147",
    customerName: "Marta Klein",
    policy: "Sin depósito",
    amount: 0,
    status: "not_required",
    createdAt: "2025-06-10T20:18:09Z",
    updatedAt: "2025-06-10T20:18:09Z",
  },
];

/* =========================================================
 * Reconciliation items
 * =======================================================*/
interface ReconciliationItem {
  id: string;
  reservationCode: string;
  stripeId: string;
  stripeAmount: number;
  d1Amount: number;
  delta: number;
  status: "mismatch" | "missing_stripe" | "missing_d1";
  lastChecked: string;
}

const RECON_ITEMS: ReconciliationItem[] = [
  {
    id: "r1",
    reservationCode: "RES-2025-0143",
    stripeId: "pi_3Pq8Yn3fWqXLop3D1xK2cDeF",
    stripeAmount: 5400,
    d1Amount: 0,
    delta: 5400,
    status: "missing_d1",
    lastChecked: "2025-06-10T20:15:00Z",
  },
  {
    id: "r2",
    reservationCode: "RES-2025-0128",
    stripeId: "pi_3Pq8Vr6iZtXOos6G4zN5gJkL",
    stripeAmount: 9800,
    d1Amount: 7800,
    delta: -2000,
    status: "mismatch",
    lastChecked: "2025-06-10T20:15:00Z",
  },
];

/* =========================================================
 * Helpers
 * =======================================================*/
function formatEuro(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function maskStripeId(id?: string) {
  if (!id) return "—";
  return `${id.slice(0, 3)}••••••`;
}

const STATUS_META: Record<
  DepositStatus,
  { label: string; cls: string; icon: React.ElementType }
> = {
  not_required: {
    label: "No requerido",
    cls: "border-foreground/20 bg-foreground/5 text-muted-foreground",
    icon: Ban,
  },
  pending: {
    label: "Pendiente",
    cls: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    icon: Clock,
  },
  preauthorized: {
    label: "Preautorizado",
    cls: "border-sky-400/40 bg-sky-400/10 text-sky-300",
    icon: Lock,
  },
  paid: {
    label: "Pagado",
    cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    icon: CheckCircle2,
  },
  failed: {
    label: "Fallido",
    cls: "border-destructive/40 bg-destructive/10 text-destructive",
    icon: XCircle,
  },
  refunded: {
    label: "Reembolsado",
    cls: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
    icon: RotateCcw,
  },
  partially_refunded: {
    label: "Reembolso parcial",
    cls: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
    icon: RotateCcw,
  },
};

const TYPE_META: Record<
  DepositType,
  { label: string; icon: React.ElementType; cls: string }
> = {
  none: {
    label: "Sin depósito",
    icon: Ban,
    cls: "border-foreground/20 bg-foreground/5 text-muted-foreground",
  },
  fixed: {
    label: "Fijo",
    icon: Banknote,
    cls: "border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
  },
  percentage: {
    label: "Porcentaje",
    icon: Percent,
    cls: "border-[var(--teal)]/30 bg-[var(--teal)]/10 text-[var(--teal)]",
  },
};

const APPLIES_TO_LABEL: Record<DepositPolicy["appliesTo"], string> = {
  all: "Todas las reservas",
  vip: "Clientes VIP",
  high_risk: "Riesgo alto (no-show)",
  weekends: "Fines de semana",
  events: "Eventos",
  large_groups: "Grupos grandes",
};

/* =========================================================
 * Policy card
 * =======================================================*/
function PolicyCard({
  policy,
  onToggle,
  onEdit,
  onDelete,
  index,
}: {
  policy: DepositPolicy;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}) {
  const reduce = useReducedMotion();
  const TypeIcon = TYPE_META[policy.type].icon;

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: reduce ? 0 : index * 0.05 }}
      className={cn(
        "rp-glass rounded-2xl p-4 sm:p-5",
        !policy.active && "opacity-60"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                TYPE_META[policy.type].cls
              )}
            >
              <TypeIcon className="h-3 w-3" />
              {TYPE_META[policy.type].label}
            </span>
            {policy.isDefault && (
              <span className="inline-flex items-center gap-1 rounded-md border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)]">
                <Star className="h-3 w-3" />
                Por defecto
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-foreground/[0.04] px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {APPLIES_TO_LABEL[policy.appliesTo]}
            </span>
          </div>
          <h4 className="mt-2 text-base font-medium text-foreground">{policy.name}</h4>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={policy.active}
            onCheckedChange={onToggle}
            aria-label={`Activar política ${policy.name}`}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <PolicyCell
          label="Importe"
          value={
            policy.type === "none"
              ? "—"
              : policy.type === "fixed"
              ? formatEuro(policy.amount)
              : `${policy.amount}%`
          }
        />
        <PolicyCell
          label="Min. comensales"
          value={`${policy.minPartySize}`}
        />
        <PolicyCell
          label="Cancelación"
          value={
            policy.cancellationWindowHours > 0
              ? `${policy.cancellationWindowHours}h`
              : "—"
          }
        />
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" className="h-9 min-h-11 px-3 text-xs" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 min-h-11 px-3 text-xs text-muted-foreground hover:text-destructive"
          onClick={onDelete}
          disabled={policy.isDefault}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Eliminar
        </Button>
      </div>
    </motion.article>
  );
}

function PolicyCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-foreground/[0.025] p-2.5">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-foreground tabular-nums">{value}</div>
    </div>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2l2.39 7.36H22l-6.18 4.49L18.21 22 12 17.27 5.79 22l2.39-8.15L2 9.36h7.61z" />
    </svg>
  );
}

/* =========================================================
 * Status badge
 * =======================================================*/
function StatusBadge({ status }: { status: DepositStatus }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
        meta.cls
      )}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

/* =========================================================
 * Main component
 * =======================================================*/
export function DepositManager() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [policies, setPolicies] = React.useState<DepositPolicy[]>(INITIAL_POLICIES);
  const [tx, setTx] = React.useState<DepositTransaction[]>(INITIAL_TX);
  const [statusFilter, setStatusFilter] = React.useState<DepositStatus | "all">("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<DepositPolicy | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<DepositPolicy | null>(null);
  const [refundTarget, setRefundTarget] = React.useState<DepositTransaction | null>(null);
  const [refundMode, setRefundMode] = React.useState<"full" | "partial">("full");
  const [refundAmount, setRefundAmount] = React.useState<string>("");
  const [detailTarget, setDetailTarget] = React.useState<DepositTransaction | null>(null);
  const [reconciling, setReconciling] = React.useState(false);
  const [reconcileDone, setReconcileDone] = React.useState(false);

  /* -------- Policy ops -------- */
  const togglePolicy = (id: string) => {
    setPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
    const p = policies.find((x) => x.id === id);
    toast({
      title: p?.active ? "Política desactivada" : "Política activada",
      description: p ? `${p.name} (demo)` : "",
    });
  };

  const handleSavePolicy = (p: DepositPolicy) => {
    setPolicies((prev) => {
      const exists = prev.some((x) => x.id === p.id);
      if (exists) return prev.map((x) => (x.id === p.id ? p : x));
      return [...prev, p];
    });
    setDialogOpen(false);
    setEditing(null);
    toast({
      title: "Política guardada",
      description: `${p.name} (demo)`,
    });
  };

  const handleDeletePolicy = (id: string) => {
    const p = policies.find((x) => x.id === id);
    setPolicies((prev) => prev.filter((x) => x.id !== id));
    setDeleteTarget(null);
    toast({
      title: "Política eliminada",
      description: p ? `${p.name} (demo)` : "",
    });
  };

  /* -------- Transaction ops -------- */
  const filteredTx =
    statusFilter === "all" ? tx : tx.filter((t) => t.status === statusFilter);

  const handleRefund = () => {
    if (!refundTarget) return;
    const amount =
      refundMode === "full"
        ? refundTarget.amount
        : Math.round(parseFloat(refundAmount || "0") * 100);
    const newStatus: DepositStatus =
      amount >= refundTarget.amount ? "refunded" : "partially_refunded";
    setTx((prev) =>
      prev.map((t) =>
        t.id === refundTarget.id
          ? {
              ...t,
              status: newStatus,
              refundAmount: (t.refundAmount || 0) + amount,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
    toast({
      title: "Reembolso emitido",
      description: `${formatEuro(amount)} a ${refundTarget.customerName} (demo)`,
    });
    setRefundTarget(null);
    setRefundAmount("");
    setRefundMode("full");
  };

  const handleExport = () => {
    toast({
      title: "Exportando transacciones",
      description: `${filteredTx.length} transacciones · CSV (demo)`,
    });
  };

  const handleReconcile = () => {
    setReconciling(true);
    window.setTimeout(() => {
      setReconciling(false);
      setReconcileDone(true);
      toast({
        title: "Conciliación completada",
        description: "0 discrepancias tras reconciliación automática (demo)",
      });
    }, 1800);
  };

  /* -------- Reconciliation summary -------- */
  const todayCobrado = tx
    .filter((t) => t.status === "paid")
    .reduce((s, t) => s + t.amount, 0);
  const todayReembolsado = tx.reduce((s, t) => s + (t.refundAmount || 0), 0);
  const pendienteConciliar = RECON_ITEMS.length;

  return (
    <TooltipProvider delayDuration={150}>
      <section aria-labelledby="deposit-title" className="flex flex-col gap-5">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--gold)]/10 text-[var(--gold)]">
                <Wallet className="h-5 w-5" />
              </span>
              <h2
                id="deposit-title"
                className="font-display text-xl sm:text-2xl font-medium tracking-tight"
              >
                Gestor de depósitos y pagos
              </h2>
              <Badge
                variant="outline"
                className="border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)] font-mono text-[10px] uppercase tracking-wider"
              >
                demo
              </Badge>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Políticas configurables con integración Stripe (Payment Intents). Estados de pago separados de estados de reserva.
            </p>
          </div>
        </header>

        <Tabs defaultValue="policies" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="policies" className="text-xs sm:text-sm">
              Políticas
            </TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs sm:text-sm">
              Transacciones
            </TabsTrigger>
            <TabsTrigger value="reconciliation" className="text-xs sm:text-sm">
              Conciliación
            </TabsTrigger>
          </TabsList>

          {/* =========================
           * Políticas tab
           * =========================*/}
          <TabsContent value="policies" className="mt-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                Los depósitos se procesan mediante <span className="font-mono text-foreground">Stripe Payment Intents</span>.
                El estado de pago está separado del estado de reserva.
              </p>
              <Button
                onClick={() => {
                  setEditing(null);
                  setDialogOpen(true);
                }}
                className="h-10 bg-[var(--gold)] text-[#0a0a0a] hover:bg-[var(--gold-soft)]"
              >
                <Plus className="h-4 w-4" />
                Nueva política
              </Button>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {policies.map((p, i) => (
                  <PolicyCard
                    key={p.id}
                    policy={p}
                    index={i}
                    onToggle={() => togglePolicy(p.id)}
                    onEdit={() => {
                      setEditing(p);
                      setDialogOpen(true);
                    }}
                    onDelete={() => setDeleteTarget(p)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* =========================
           * Transacciones tab
           * =========================*/}
          <TabsContent value="transactions" className="mt-5">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Label>Filtrar estado</Label>
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as DepositStatus | "all")}>
                <SelectTrigger className="h-9 w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="not_required">No requerido</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="preauthorized">Preautorizado</SelectItem>
                  <SelectItem value="paid">Pagado</SelectItem>
                  <SelectItem value="failed">Fallido</SelectItem>
                  <SelectItem value="refunded">Reembolsado</SelectItem>
                  <SelectItem value="partially_refunded">Reembolso parcial</SelectItem>
                </SelectContent>
              </Select>
              <div className="ml-auto">
                <Button variant="outline" className="h-9" onClick={handleExport}>
                  <Download className="h-3.5 w-3.5" />
                  Exportar
                </Button>
              </div>
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block">
              <div className="rp-glass overflow-hidden rounded-xl">
                <div className="overflow-x-auto rp-scroll-thin">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border/60 bg-foreground/[0.03]">
                        <Th>Código</Th>
                        <Th>Cliente</Th>
                        <Th>Política</Th>
                        <Th>Importe</Th>
                        <Th>Estado</Th>
                        <Th>Stripe PI</Th>
                        <Th>Actualizado</Th>
                        <Th className="text-right">Acciones</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTx.map((t, i) => (
                        <motion.tr
                          key={t.id}
                          initial={reduce ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2, delay: reduce ? 0 : i * 0.02 }}
                          className="border-b border-border/40 last:border-0 transition-colors hover:bg-foreground/[0.025]"
                        >
                          <Td>
                            <code className="font-mono text-xs text-foreground">{t.reservationCode}</code>
                          </Td>
                          <Td>{t.customerName}</Td>
                          <Td className="text-muted-foreground text-xs">{t.policy}</Td>
                          <Td className="tabular-nums">
                            {t.amount === 0 ? "—" : formatEuro(t.amount)}
                          </Td>
                          <Td><StatusBadge status={t.status} /></Td>
                          <Td>
                            <code className="font-mono text-xs text-muted-foreground">
                              {maskStripeId(t.stripePaymentIntentId)}
                            </code>
                          </Td>
                          <Td className="text-xs text-muted-foreground">{formatTime(t.updatedAt)}</Td>
                          <Td className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {t.status === "paid" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 text-xs"
                                  onClick={() => setRefundTarget(t)}
                                >
                                  <RotateCcw className="h-3 w-3" />
                                  Reembolsar
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs"
                                onClick={() => setDetailTarget(t)}
                              >
                                <Eye className="h-3 w-3" />
                                Detalle
                              </Button>
                            </div>
                          </Td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden grid gap-3">
              {filteredTx.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: reduce ? 0 : i * 0.02 }}
                  className="rp-glass rounded-xl p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <code className="font-mono text-xs text-foreground">{t.reservationCode}</code>
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="mt-2 font-medium text-foreground">{t.customerName}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{t.policy}</div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Importe</div>
                      <div className="mt-0.5 tabular-nums text-foreground">
                        {t.amount === 0 ? "—" : formatEuro(t.amount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Stripe PI</div>
                      <div className="mt-0.5 font-mono text-muted-foreground">{maskStripeId(t.stripePaymentIntentId)}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {t.status === "paid" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 min-h-11 flex-1 text-xs"
                        onClick={() => setRefundTarget(t)}
                      >
                        <RotateCcw className="h-3 w-3" />
                        Reembolsar
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 min-h-11 flex-1 text-xs"
                      onClick={() => setDetailTarget(t)}
                    >
                      <Eye className="h-3 w-3" />
                      Detalle
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* =========================
           * Conciliación tab
           * =========================*/}
          <TabsContent value="reconciliation" className="mt-5">
            {/* Summary */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-4">
              <SummaryCell
                icon={Coins}
                label="Cobrado hoy"
                value={formatEuro(todayCobrado)}
                tone="gold"
              />
              <SummaryCell
                icon={RotateCcw}
                label="Reembolsado hoy"
                value={formatEuro(todayReembolsado)}
                tone="teal"
              />
              <SummaryCell
                icon={AlertTriangle}
                label="Pendiente de conciliar"
                value={`${pendienteConciliar} transacciones`}
                tone="amber"
              />
            </div>

            {/* Items */}
            <div className="rp-glass rounded-2xl p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-300" />
                  <h3 className="text-sm font-medium text-foreground">
                    Discrepancias pendientes
                  </h3>
                </div>
                <Button
                  onClick={handleReconcile}
                  disabled={reconciling || reconcileDone}
                  className="h-9 bg-[var(--gold)] text-[#0a0a0a] hover:bg-[var(--gold-soft)]"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", reconciling && "animate-spin")} />
                  {reconciling
                    ? "Conciliando…"
                    : reconcileDone
                    ? "Conciliación completada"
                    : "Ejecutar conciliación"}
                </Button>
              </div>

              <AnimatePresence mode="wait">
                {reconcileDone ? (
                  <motion.div
                    key="done"
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-emerald-400/30 bg-emerald-400/[0.06] p-4 text-center"
                  >
                    <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-300" />
                    <div className="mt-2 text-sm font-medium text-foreground">
                      Conciliación completada · 0 discrepancias
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Todas las transacciones coinciden entre Stripe y D1 (demo)
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="items"
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduce ? undefined : { opacity: 0 }}
                    className="space-y-3"
                  >
                    {RECON_ITEMS.map((r, i) => (
                      <motion.div
                        key={r.id}
                        initial={reduce ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: reduce ? 0 : i * 0.05 }}
                        className="rounded-xl border border-amber-400/25 bg-amber-400/[0.04] p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <code className="font-mono text-xs text-foreground">{r.reservationCode}</code>
                              <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/40 bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-amber-300">
                                {r.status === "mismatch"
                                  ? "Importe mismatch"
                                  : r.status === "missing_stripe"
                                  ? "Falta en Stripe"
                                  : "Falta en D1"}
                              </span>
                            </div>
                            <div className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                              {maskStripeId(r.stripeId)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                                  Stripe
                                </div>
                                <div className="mt-0.5 font-mono tabular-nums text-foreground">
                                  {formatEuro(r.stripeAmount)}
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                                  D1
                                </div>
                                <div className="mt-0.5 font-mono tabular-nums text-foreground">
                                  {formatEuro(r.d1Amount)}
                                </div>
                              </div>
                            </div>
                            <div
                              className={cn(
                                "mt-2 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono",
                                r.delta > 0
                                  ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                                  : "border-destructive/40 bg-destructive/10 text-destructive"
                              )}
                            >
                              Δ {r.delta > 0 ? "+" : ""}
                              {formatEuro(Math.abs(r.delta))} {r.delta > 0 ? "más en Stripe" : "más en D1"}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-4 flex items-start gap-2 rounded-lg bg-foreground/[0.03] p-3 text-xs leading-relaxed text-muted-foreground">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 rp-teal-text" />
                Conciliación automática cada hora. Webhooks de Stripe verificados criptográficamente.
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Security note */}
        <div className="rp-glass flex items-start gap-3 rounded-xl border-l-2 border-[var(--teal)]/60 p-4">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 rp-teal-text" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Los pagos nunca se confirman únicamente desde el frontend. <span className="text-foreground">Stripe webhooks idempotentes</span> verifican cada transacción.
            Estados de pago separados de estados de reserva.
          </p>
        </div>
      </section>

      {/* =========================
       * Policy create/edit dialog
       * =========================*/}
      <PolicyDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
        policy={editing}
        onSave={handleSavePolicy}
      />

      {/* =========================
       * Refund dialog
       * =========================*/}
      <Dialog open={!!refundTarget} onOpenChange={(o) => !o && setRefundTarget(null)}>
        <DialogContent className="max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Emitir reembolso</DialogTitle>
            <DialogDescription>
              {refundTarget
                ? `${refundTarget.customerName} · ${refundTarget.reservationCode} · Pagado ${formatEuro(refundTarget.amount)}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setRefundMode("full")}
                className={cn(
                  "rounded-xl border p-3 text-left transition-colors",
                  refundMode === "full"
                    ? "border-[var(--teal)]/60 bg-[var(--teal)]/10"
                    : "border-border/40 bg-foreground/[0.025] hover:bg-foreground/[0.05]"
                )}
              >
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  Total
                </div>
                <div className="mt-1 text-sm font-medium text-foreground">
                  {refundTarget ? formatEuro(refundTarget.amount) : "—"}
                </div>
              </button>
              <button
                onClick={() => setRefundMode("partial")}
                className={cn(
                  "rounded-xl border p-3 text-left transition-colors",
                  refundMode === "partial"
                    ? "border-[var(--teal)]/60 bg-[var(--teal)]/10"
                    : "border-border/40 bg-foreground/[0.025] hover:bg-foreground/[0.05]"
                )}
              >
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  Parcial
                </div>
                <div className="mt-1 text-sm font-medium text-foreground">Importe personalizado</div>
              </button>
            </div>

            {refundMode === "partial" && (
              <div>
                <Label>Importe a reembolsar (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max={refundTarget ? (refundTarget.amount / 100).toFixed(2) : undefined}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="mt-1.5"
                  placeholder="0.00"
                />
                {refundTarget && (
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    Máximo reembolsable: {formatEuro(refundTarget.amount)}
                  </div>
                )}
              </div>
            )}

            <div className="rounded-lg bg-foreground/[0.03] p-3 text-xs leading-relaxed text-muted-foreground">
              <Info className="inline h-3 w-3 mr-1 -mt-0.5" />
              El reembolso se procesa vía Stripe Refunds API. Idempotente.
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setRefundTarget(null)}>
              Cancelar
            </Button>
            <Button
              className="bg-[var(--teal)] text-[#0a0a0a] hover:bg-[var(--teal)]/80"
              onClick={handleRefund}
              disabled={refundMode === "partial" && (!refundAmount || parseFloat(refundAmount) <= 0)}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Confirmar reembolso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================
       * Delete confirm
       * =========================*/}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar política?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `Se eliminará "${deleteTarget.name}". Esta acción no se puede deshacer.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && handleDeletePolicy(deleteTarget.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* =========================
       * Transaction detail dialog
       * =========================*/}
      <TransactionDetailDialog
        tx={detailTarget}
        open={!!detailTarget}
        onClose={() => setDetailTarget(null)}
      />
    </TooltipProvider>
  );
}

/* =========================================================
 * Table helpers
 * =======================================================*/
function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap",
        className
      )}
    >
      {children}
    </th>
  );
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 align-top text-sm", className)}>{children}</td>;
}

/* =========================================================
 * Summary cell
 * =======================================================*/
function SummaryCell({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone: "gold" | "teal" | "amber";
}) {
  const colorMap: Record<string, string> = {
    gold: "rp-gold-text",
    teal: "rp-teal-text",
    amber: "text-amber-300",
  };
  return (
    <div className="rp-glass rounded-xl p-4">
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        <Icon className={cn("h-3 w-3", colorMap[tone])} />
        {label}
      </div>
      <div className={cn("mt-1.5 font-display text-xl font-light tabular-nums sm:text-2xl", colorMap[tone])}>
        {value}
      </div>
    </div>
  );
}

/* =========================================================
 * Policy dialog (create / edit)
 * =======================================================*/
function PolicyDialog({
  open,
  onOpenChange,
  policy,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  policy: DepositPolicy | null;
  onSave: (p: DepositPolicy) => void;
}) {
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<DepositType>("fixed");
  const [amount, setAmount] = React.useState<string>("10");
  const [appliesTo, setAppliesTo] = React.useState<DepositPolicy["appliesTo"]>("all");
  const [minPartySize, setMinPartySize] = React.useState<string>("1");
  const [cancelWindow, setCancelWindow] = React.useState<string>("24");

  React.useEffect(() => {
    if (policy) {
      setName(policy.name);
      setType(policy.type);
      setAmount(policy.type === "fixed" ? (policy.amount / 100).toString() : policy.amount.toString());
      setAppliesTo(policy.appliesTo);
      setMinPartySize(policy.minPartySize.toString());
      setCancelWindow(policy.cancellationWindowHours.toString());
    } else {
      setName("");
      setType("fixed");
      setAmount("10");
      setAppliesTo("all");
      setMinPartySize("1");
      setCancelWindow("24");
    }
  }, [policy, open]);

  const handleSave = () => {
    const amt =
      type === "fixed" ? Math.round(parseFloat(amount || "0") * 100) : parseInt(amount || "0", 10);
    const newPolicy: DepositPolicy = {
      id: policy?.id || `p${Date.now()}`,
      name: name || "Nueva política",
      type,
      amount: amt,
      currency: "EUR",
      appliesTo,
      minPartySize: parseInt(minPartySize || "1", 10),
      cancellationWindowHours: parseInt(cancelWindow || "0", 10),
      isDefault: policy?.isDefault || false,
      active: policy?.active ?? true,
    };
    onSave(newPolicy);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{policy ? "Editar política" : "Nueva política de depósito"}</DialogTitle>
          <DialogDescription>
            Define cuándo y cuánto cobrar como depósito. Procesado vía Stripe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Nombre</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="p. ej. Depósito fin de semana"
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as DepositType)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin depósito</SelectItem>
                  <SelectItem value="fixed">Fijo (€)</SelectItem>
                  <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{type === "percentage" ? "Porcentaje (%)" : type === "fixed" ? "Importe (€)" : "—"}</Label>
              <Input
                type="number"
                step={type === "fixed" ? "0.01" : "1"}
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={type === "none"}
                className="mt-1.5"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label>Aplica a</Label>
            <Select value={appliesTo} onValueChange={(v) => setAppliesTo(v as DepositPolicy["appliesTo"])}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las reservas</SelectItem>
                <SelectItem value="vip">Clientes VIP</SelectItem>
                <SelectItem value="high_risk">Riesgo alto (no-show)</SelectItem>
                <SelectItem value="weekends">Fines de semana</SelectItem>
                <SelectItem value="events">Eventos</SelectItem>
                <SelectItem value="large_groups">Grupos grandes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Min. comensales</Label>
              <Input
                type="number"
                min="1"
                value={minPartySize}
                onChange={(e) => setMinPartySize(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Cancelación gratuita (h)</Label>
              <Input
                type="number"
                min="0"
                value={cancelWindow}
                onChange={(e) => setCancelWindow(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-[var(--gold)] text-[#0a0a0a] hover:bg-[var(--gold-soft)]"
            onClick={handleSave}
          >
            <Zap className="h-3.5 w-3.5" />
            Guardar política
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Transaction detail dialog (timeline)
 * =======================================================*/
function TransactionDetailDialog({
  tx,
  open,
  onClose,
}: {
  tx: DepositTransaction | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!tx) return null;
  const meta = STATUS_META[tx.status];

  const timeline = [
    {
      label: "Reserva creada",
      time: tx.createdAt,
      icon: CreditCard,
      tone: "default" as const,
    },
    {
      label: "Payment Intent creado",
      time: tx.createdAt,
      icon: Lock,
      tone: "default" as const,
    },
    {
      label: meta.label,
      time: tx.updatedAt,
      icon: meta.icon,
      tone: tx.status === "paid" ? ("ok" as const) : tx.status === "failed" ? ("err" as const) : ("default" as const),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Detalle de transacción</DialogTitle>
          <DialogDescription>
            <code className="font-mono">{tx.reservationCode}</code> · {tx.customerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rp-glass rounded-xl p-4">
            <div className="grid grid-cols-2 gap-3">
              <DetailCell label="Política" value={tx.policy} />
              <DetailCell label="Importe" value={tx.amount === 0 ? "—" : formatEuro(tx.amount)} />
              <DetailCell
                label="Stripe PI"
                value={
                  <code className="font-mono text-xs">
                    {tx.stripePaymentIntentId || "—"}
                  </code>
                }
              />
              <DetailCell label="Estado" value={<StatusBadge status={tx.status} />} />
              {tx.refundAmount ? (
                <DetailCell label="Reembolsado" value={formatEuro(tx.refundAmount)} />
              ) : null}
            </div>
            {tx.error && (
              <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/[0.06] p-2.5 text-xs text-destructive">
                <AlertTriangle className="inline h-3 w-3 mr-1 -mt-0.5" />
                {tx.error}
              </div>
            )}
          </div>

          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
              Cronología
            </div>
            <ol className="space-y-3">
              {timeline.map((step, i) => {
                const Icon = step.icon;
                return (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className={cn(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-full",
                        step.tone === "ok"
                          ? "bg-emerald-400/12 text-emerald-300"
                          : step.tone === "err"
                          ? "bg-destructive/12 text-destructive"
                          : "bg-foreground/[0.06] text-muted-foreground"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="text-sm text-foreground">{step.label}</div>
                      <div className="text-[11px] font-mono text-muted-foreground">
                        {formatTime(step.time)}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <DialogFooter>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mr-auto">
            <ShieldCheck className="h-3.5 w-3.5 rp-teal-text" />
            Verificado por webhook Stripe
          </div>
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm text-foreground">{value}</div>
    </div>
  );
}
