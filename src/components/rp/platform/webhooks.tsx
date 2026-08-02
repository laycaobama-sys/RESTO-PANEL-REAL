"use client";

/* ============================================================================
 * RestoPanel · Webhook Manager (Plataforma Abierta · Fase 8)
 * Endpoints HMAC, retries, DLQ, replay. Tabs: Endpoints | Entregas |
 * Eventos | Logs. Demo-navegable. dark theme (gold #D4AF37 / teal #3DD6C9).
 * FASE8-MKT-WH-AI
 * ========================================================================== */

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Webhook,
  Link2,
  Plus,
  Copy,
  Check,
  Eye,
  EyeOff,
  Pause,
  Play,
  Pencil,
  Trash2,
  Send,
  RefreshCw,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  ChevronDown,
  ChevronRight,
  Hash,
  Server,
  ListChecks,
  Terminal,
  Code2,
  ShieldCheck,
  Zap,
  Filter,
  CalendarCheck,
  Users,
  Star,
  CreditCard,
  Repeat,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* --------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------ */

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  secret: string;
  status: "active" | "paused" | "failing";
  createdAt: string;
  lastDelivery?: { status: number; at: string; latencyMs: number };
  successRate: number;
  totalDelivered: number;
  totalFailed: number;
}

interface WebhookDelivery {
  id: string;
  eventId: string;
  eventType: string;
  endpointUrl: string;
  status: number;
  attempt: number;
  deliveredAt: string;
  latencyMs: number;
  payload: string;
  response: string;
}

interface WebhookLog {
  id: string;
  ts: string;
  level: "INFO" | "WARN" | "ERROR";
  eventId?: string;
  endpoint?: string;
  message: string;
  correlationId: string;
}

/* --------------------------------------------------------------------------
 * Catalog of events
 * ------------------------------------------------------------------------ */

interface EventDef {
  name: string;
  description: string;
  payload: Record<string, unknown>;
}

const EVENT_GROUPS: { group: string; icon: typeof Zap; events: EventDef[] }[] = [
  {
    group: "Reservas",
    icon: CalendarCheck,
    events: [
      {
        name: "reservation.created",
        description: "Se crea una nueva reserva en el libro.",
        payload: {
          id: "res_01HZX",
          customer_id: "cus_4821",
          party_size: 4,
          date: "2025-03-14T20:00:00Z",
          channel: "widget",
        },
      },
      {
        name: "reservation.updated",
        description: "Se modifica una reserva existente.",
        payload: { id: "res_01HZX", changes: { party_size: 6 } },
      },
      {
        name: "reservation.deleted",
        description: "Se elimina una reserva.",
        payload: { id: "res_01HZX", reason: "customer_request" },
      },
      {
        name: "reservation.checked_in",
        description: "El cliente se sienta en la mesa.",
        payload: { id: "res_01HZX", table: "T-12", at: "2025-03-14T19:58:00Z" },
      },
      {
        name: "reservation.no_show",
        description: "Cliente no se presenta en su reserva.",
        payload: { id: "res_01HZX", penalty: 0 },
      },
    ],
  },
  {
    group: "Clientes",
    icon: Users,
    events: [
      { name: "customer.created", description: "Nuevo cliente en el CRM.", payload: { id: "cus_4821", name: "María G.", tags: ["vip"] } },
      { name: "customer.updated", description: "Actualización de ficha de cliente.", payload: { id: "cus_4821", changes: { avg_ticket: 48.5 } } },
      { name: "customer.deleted", description: "Borrado de cliente (RGPD).", payload: { id: "cus_4821", requested_by: "gdpr" } },
    ],
  },
  {
    group: "Reseñas",
    icon: Star,
    events: [
      { name: "review.received", description: "Nueva reseña publicada.", payload: { id: "rev_9921", source: "google", rating: 5, text: "..." } },
      { name: "review.replied", description: "El restaurante responde a una reseña.", payload: { id: "rev_9921", reply: "Gracias por tu visita..." } },
    ],
  },
  {
    group: "Pagos",
    icon: CreditCard,
    events: [
      { name: "payment.completed", description: "Cobro completado correctamente.", payload: { id: "pay_7711", amount: 128.5, currency: "EUR" } },
      { name: "payment.failed", description: "Fallo en el cobro.", payload: { id: "pay_7711", reason: "card_declined" } },
      { name: "payment.refunded", description: "Devolución emitida al cliente.", payload: { id: "pay_7711", amount: 32.0 } },
    ],
  },
  {
    group: "Suscripciones",
    icon: Repeat,
    events: [
      { name: "subscription.updated", description: "Cambio de plan de suscripción.", payload: { org_id: "org_3", plan: "enterprise" } },
      { name: "subscription.cancelled", description: "Cancelación de suscripción.", payload: { org_id: "org_3", reason: "churn" } },
    ],
  },
];

const ALL_EVENT_NAMES = EVENT_GROUPS.flatMap((g) => g.events.map((e) => e.name));

/* --------------------------------------------------------------------------
 * Demo data
 * ------------------------------------------------------------------------ */

const DEMO_ENDPOINTS: WebhookEndpoint[] = [
  {
    id: "wh_001",
    url: "https://api.midominio.com/webhooks/restopanel",
    events: ["reservation.created", "reservation.cancelled", "customer.created"],
    secret: "whsec_9f2a4c1b8e7d6053",
    status: "active",
    createdAt: "2024-11-12T09:14:00Z",
    lastDelivery: { status: 200, at: "hace 4 min", latencyMs: 142 },
    successRate: 98.5,
    totalDelivered: 4821,
    totalFailed: 73,
  },
  {
    id: "wh_002",
    url: "https://crm.empresa.io/hooks/reservas",
    events: ["reservation.created", "reservation.checked_in", "review.received"],
    secret: "whsec_3d8c1a9b6f4e2075",
    status: "failing",
    createdAt: "2024-12-01T17:22:00Z",
    lastDelivery: { status: 504, at: "hace 12 min", latencyMs: 5000 },
    successRate: 76.4,
    totalDelivered: 1208,
    totalFailed: 372,
  },
  {
    id: "wh_003",
    url: "https://hooks.slack.com/services/T0/B0/XYZ",
    events: ["payment.failed", "subscription.cancelled"],
    secret: "whsec_7a2b9c4d1e8f3056",
    status: "paused",
    createdAt: "2025-01-08T11:00:00Z",
    lastDelivery: { status: 200, at: "hace 2 días", latencyMs: 88 },
    successRate: 100,
    totalDelivered: 245,
    totalFailed: 0,
  },
];

function genDeliveries(): WebhookDelivery[] {
  const now = Date.now();
  const rows: WebhookDelivery[] = [];
  const statuses = [200, 200, 200, 200, 200, 200, 422, 200, 504, 200, 200, 408];
  const events = [
    "reservation.created",
    "reservation.created",
    "customer.updated",
    "reservation.checked_in",
    "review.received",
    "payment.completed",
    "reservation.cancelled",
    "customer.created",
    "reservation.updated",
    "payment.failed",
    "review.replied",
    "reservation.no_show",
  ];
  const attempts = [1, 1, 1, 1, 1, 2, 1, 1, 3, 1, 1, 1];
  for (let i = 0; i < 12; i++) {
    const status = statuses[i];
    const evt = events[i];
    const evtId = `evt_01HZX${(i + 4221).toString(36).toUpperCase()}`;
    const ok = status >= 200 && status < 300;
    rows.push({
      id: `dlv_${(i + 1).toString().padStart(4, "0")}`,
      eventId: evtId,
      eventType: evt,
      endpointUrl: DEMO_ENDPOINTS[i % 3].url,
      status,
      attempt: attempts[i],
      deliveredAt: `hace ${(i + 1) * 7} min`,
      latencyMs: ok ? 80 + ((i * 37) % 400) : 5000,
      payload: JSON.stringify(
        {
          id: evtId,
          type: evt,
          created_at: new Date(now - i * 7 * 60_000).toISOString(),
          data: {
            reservation_id: "res_01HZX",
            customer_id: "cus_4821",
            party_size: 4,
            table: "T-12",
            amount: 128.5,
            currency: "EUR",
          },
        },
        null,
        2
      ),
      response: ok
        ? JSON.stringify({ ok: true, received_at: new Date().toISOString() }, null, 2)
        : status === 504
        ? JSON.stringify({ error: "timeout", detail: "endpoint did not respond within 5000ms" }, null, 2)
        : status === 422
        ? JSON.stringify({ error: "validation", detail: "missing required field: party_size" }, null, 2)
        : JSON.stringify({ error: "request_timeout" }, null, 2),
    });
  }
  return rows;
}

const DEMO_DELIVERIES = genDeliveries();

const DEMO_LOGS: WebhookLog[] = [
  { id: "log_01", ts: "2025-03-14T20:04:18.421Z", level: "INFO", eventId: "evt_01HZX4221", endpoint: "https://api.midominio.com/webhooks/restopanel", message: "Entrega completada (200) en 142ms", correlationId: "corr_a1b2c3" },
  { id: "log_02", ts: "2025-03-14T20:03:51.012Z", level: "INFO", eventId: "evt_01HZX4222", endpoint: "https://api.midominio.com/webhooks/restopanel", message: "Entrega completada (200) en 188ms", correlationId: "corr_d4e5f6" },
  { id: "log_03", ts: "2025-03-14T20:02:14.873Z", level: "WARN", eventId: "evt_01HZX4223", endpoint: "https://crm.empresa.io/hooks/reservas", message: "Reintento #2 programado (backoff 8s)", correlationId: "corr_g7h8i9" },
  { id: "log_04", ts: "2025-03-14T20:01:42.301Z", level: "ERROR", eventId: "evt_01HZX4223", endpoint: "https://crm.empresa.io/hooks/reservas", message: "HTTP 504 Gateway Timeout después de 5000ms", correlationId: "corr_g7h8i9" },
  { id: "log_05", ts: "2025-03-14T20:01:33.018Z", level: "INFO", eventId: "evt_01HZX4224", endpoint: "https://api.midominio.com/webhooks/restopanel", message: "Entrega completada (200) en 121ms", correlationId: "corr_j1k2l3" },
  { id: "log_06", ts: "2025-03-14T20:00:09.742Z", level: "WARN", eventId: "evt_01HZX4225", endpoint: "https://crm.empresa.io/hooks/reservas", message: "HMAC verificada · intento 1", correlationId: "corr_m4n5o6" },
  { id: "log_07", ts: "2025-03-14T19:59:50.110Z", level: "ERROR", eventId: "evt_01HZX4226", endpoint: "https://crm.empresa.io/hooks/reservas", message: "HTTP 422 Unprocessable Entity — campo requerido ausente", correlationId: "corr_p7q8r9" },
  { id: "log_08", ts: "2025-03-14T19:58:21.530Z", level: "INFO", eventId: "evt_01HZX4227", endpoint: "https://hooks.slack.com/services/T0/B0/XYZ", message: "Endpoint pausado · entrega omitida", correlationId: "corr_s0t1u2" },
  { id: "log_09", ts: "2025-03-14T19:57:18.990Z", level: "INFO", eventId: "evt_01HZX4228", endpoint: "https://api.midominio.com/webhooks/restopanel", message: "Entrega completada (200) en 95ms", correlationId: "corr_v3w4x5" },
  { id: "log_10", ts: "2025-03-14T19:55:44.221Z", level: "WARN", eventId: "evt_01HZX4229", endpoint: "https://api.midominio.com/webhooks/restopanel", message: "Latencia p95 elevada: 1240ms", correlationId: "corr_y6z7a8" },
  { id: "log_11", ts: "2025-03-14T19:54:01.780Z", level: "INFO", eventId: "evt_01HZX4230", endpoint: "https://api.midominio.com/webhooks/restopanel", message: "Entrega completada (200) en 88ms", correlationId: "corr_b9c0d1" },
  { id: "log_12", ts: "2025-03-14T19:52:39.105Z", level: "INFO", eventId: "evt_01HZX4231", endpoint: "https://hooks.slack.com/services/T0/B0/XYZ", message: "Endpoint pausado · entrega omitida", correlationId: "corr_e2f3g4" },
  { id: "log_13", ts: "2025-03-14T19:51:11.442Z", level: "ERROR", eventId: "evt_01HZX4232", endpoint: "https://crm.empresa.io/hooks/reservas", message: "DLQ: 3 intentos fallidos · movido a dead-letter-queue", correlationId: "corr_h5i6j7" },
  { id: "log_14", ts: "2025-03-14T19:50:02.001Z", level: "INFO", eventId: "evt_01HZX4233", endpoint: "https://api.midominio.com/webhooks/restopanel", message: "Entrega completada (200) en 152ms", correlationId: "corr_k8l9m0" },
  { id: "log_15", ts: "2025-03-14T19:48:33.870Z", level: "WARN", eventId: "evt_01HZX4234", endpoint: "https://api.midominio.com/webhooks/restopanel", message: "Rate limit cercano: 90/100 req/min", correlationId: "corr_n1o2p3" },
  { id: "log_16", ts: "2025-03-14T19:47:12.220Z", level: "INFO", eventId: "evt_01HZX4235", endpoint: "https://api.midominio.com/webhooks/restopanel", message: "Entrega completada (200) en 134ms", correlationId: "corr_q4r5s6" },
  { id: "log_17", ts: "2025-03-14T19:46:50.510Z", level: "ERROR", eventId: "evt_01HZX4236", endpoint: "https://crm.empresa.io/hooks/reservas", message: "Conexión rechazada (ECONNREFUSED)", correlationId: "corr_t7u8v9" },
  { id: "log_18", ts: "2025-03-14T19:45:30.990Z", level: "INFO", eventId: "evt_01HZX4237", endpoint: "https://api.midominio.com/webhooks/restopanel", message: "Entrega completada (200) en 110ms", correlationId: "corr_w0x1y2" },
];

/* --------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------ */

function statusTone(status: "active" | "paused" | "failing"): {
  dot: string;
  label: string;
  chip: string;
} {
  if (status === "active")
    return {
      dot: "bg-emerald-400",
      label: "Activo",
      chip: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    };
  if (status === "paused")
    return {
      dot: "bg-amber-400",
      label: "Pausado",
      chip: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    };
  return {
    dot: "bg-rose-500",
    label: "Fallando",
    chip: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  };
}

function httpTone(status: number): { chip: string; label: string } {
  if (status >= 200 && status < 300)
    return { chip: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300", label: `${status} OK` };
  if (status >= 400 && status < 500)
    return { chip: "border-amber-400/30 bg-amber-400/10 text-amber-300", label: `${status}` };
  if (status === 408) return { chip: "border-rose-500/30 bg-rose-500/10 text-rose-300", label: "timeout" };
  if (status >= 500)
    return { chip: "border-rose-500/30 bg-rose-500/10 text-rose-300", label: `${status}` };
  return { chip: "border-foreground/15 bg-foreground/5 text-foreground/70", label: `${status}` };
}

function maskSecret(secret: string): string {
  const prefix = secret.slice(0, 6);
  return `${prefix}${"•".repeat(12)}`;
}

function genSecret(): string {
  const chars = "abcdef0123456789";
  let s = "whsec_";
  for (let i = 0; i < 16; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + "…";
}

function eventTone(name: string): string {
  if (name.startsWith("reservation.")) return "border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)]";
  if (name.startsWith("customer.")) return "border-[var(--teal)]/30 bg-[var(--teal)]/10 text-[var(--teal)]";
  if (name.startsWith("payment.") || name.startsWith("subscription.")) return "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-300";
  if (name.startsWith("review.")) return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  return "border-foreground/15 bg-foreground/5 text-foreground/70";
}

function logLevelTone(level: "INFO" | "WARN" | "ERROR"): string {
  if (level === "INFO") return "border-[var(--teal)]/30 bg-[var(--teal)]/10 text-[var(--teal)]";
  if (level === "WARN") return "border-amber-400/30 bg-amber-400/10 text-amber-300";
  return "border-rose-500/30 bg-rose-500/10 text-rose-300";
}

function logLevelIcon(level: "INFO" | "WARN" | "ERROR") {
  if (level === "INFO") return CheckCircle2;
  if (level === "WARN") return AlertTriangle;
  return XCircle;
}

/* --------------------------------------------------------------------------
 * Demo badge
 * ------------------------------------------------------------------------ */


/* --------------------------------------------------------------------------
 * Main component
 * ------------------------------------------------------------------------ */
export function Webhooks() {
  const prefersReduced = useReducedMotion();
  const fade = prefersReduced
    ? {}
    : { initial: { opacity: 0, y: 8 } as const, animate: { opacity: 1, y: 0 } as const };

  const [endpoints, setEndpoints] = React.useState<WebhookEndpoint[]>(DEMO_ENDPOINTS);
  const [deliveries] = React.useState<WebhookDelivery[]>(DEMO_DELIVERIES);
  const [logs] = React.useState<WebhookLog[]>(DEMO_LOGS);

  const [tab, setTab] = React.useState("endpoints");
  const [endpointEditor, setEndpointEditor] = React.useState<{ open: boolean; endpoint?: WebhookEndpoint }>({ open: false });
  const [uninstallTarget, setUninstallTarget] = React.useState<WebhookEndpoint | null>(null);
  const [payloadDelivery, setPayloadDelivery] = React.useState<WebhookDelivery | null>(null);
  const [replayTarget, setReplayTarget] = React.useState<WebhookDelivery | null>(null);

  /* deliveries filters */
  const [deliveryFilter, setDeliveryFilter] = React.useState<"all" | "success" | "failed" | "retries">("all");
  const [deliveryEventFilter, setDeliveryEventFilter] = React.useState<string>("all");

  /* logs filters */
  const [logLevel, setLogLevel] = React.useState<"all" | "INFO" | "WARN" | "ERROR">("all");
  const [logSearch, setLogSearch] = React.useState("");

  const { toast } = useToast();

  function togglePause(ep: WebhookEndpoint) {
    setEndpoints((s) =>
      s.map((e) =>
        e.id === ep.id ? { ...e, status: e.status === "paused" ? "active" : "paused" } : e
      )
    );
    toast({
      title: ep.status === "paused" ? "Endpoint activado (demo)" : "Endpoint pausado (demo)",
      description: truncate(ep.url, 60),
    });
  }

  function handleDelete() {
    if (!uninstallTarget) return;
    setEndpoints((s) => s.filter((e) => e.id !== uninstallTarget.id));
    toast({
      title: "Endpoint eliminado (demo)",
      description: truncate(uninstallTarget.url, 60),
      variant: "destructive",
    });
    setUninstallTarget(null);
  }

  function handleSaveEndpoint(ep: WebhookEndpoint, isNew: boolean) {
    setEndpoints((s) => (isNew ? [...s, ep] : s.map((e) => (e.id === ep.id ? ep : e))));
    toast({
      title: isNew ? "Endpoint creado (demo)" : "Endpoint actualizado (demo)",
      description: truncate(ep.url, 60),
    });
    setEndpointEditor({ open: false });
  }

  function handleReplay() {
    if (!replayTarget) return;
    toast({
      title: "Reenvío programado (demo)",
      description: `${replayTarget.eventId} → ${truncate(replayTarget.endpointUrl, 40)}`,
    });
    setReplayTarget(null);
  }

  function viewEndpointDeliveries(ep: WebhookEndpoint) {
    setTab("deliveries");
    setDeliveryEventFilter("all");
    toast({
      title: "Filtrando entregas",
      description: `Mostrando entregas de ${truncate(ep.url, 50)}`,
    });
  }

  /* filtered deliveries */
  const filteredDeliveries = React.useMemo(() => {
    return deliveries.filter((d) => {
      if (deliveryFilter === "success" && !(d.status >= 200 && d.status < 300)) return false;
      if (deliveryFilter === "failed" && d.status < 400) return false;
      if (deliveryFilter === "retries" && d.attempt < 2) return false;
      if (deliveryEventFilter !== "all" && d.eventType !== deliveryEventFilter) return false;
      return true;
    });
  }, [deliveries, deliveryFilter, deliveryEventFilter]);

  /* filtered logs */
  const filteredLogs = React.useMemo(() => {
    return logs.filter((l) => {
      if (logLevel !== "all" && l.level !== logLevel) return false;
      if (logSearch.trim()) {
        const q = logSearch.trim().toLowerCase();
        return (
          (l.eventId?.toLowerCase().includes(q) ?? false) ||
          (l.endpoint?.toLowerCase().includes(q) ?? false) ||
          l.message.toLowerCase().includes(q) ||
          l.correlationId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [logs, logLevel, logSearch]);

  return (
    <TooltipProvider delayDuration={200}>
      <motion.div {...fade} className="space-y-5">
        {/* ---------------- Header ---------------- */}
        <div className="rp-glass-strong rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--teal)]/15 text-[var(--teal)] ring-1 ring-[var(--teal)]/30">
                <Webhook className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-2xl sm:text-3xl font-light tracking-tight">
                    Webhooks
                  </h2>
                  
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Suscripciones a eventos con firma HMAC, reintentos automáticos, DLQ y replay. Datos demo.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="border-foreground/15 bg-transparent"
                onClick={() => setEndpointEditor({ open: true })}
              >
                <Plus className="mr-1.5 h-4 w-4" /> Añadir endpoint
              </Button>
            </div>
          </div>

          {/* stats summary */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryStat label="Endpoints" value={endpoints.length} icon={Link2} tone="gold" />
            <SummaryStat
              label="Activos"
              value={endpoints.filter((e) => e.status === "active").length}
              icon={CheckCircle2}
              tone="emerald"
            />
            <SummaryStat
              label="Fallando"
              value={endpoints.filter((e) => e.status === "failing").length}
              icon={AlertTriangle}
              tone="rose"
            />
            <SummaryStat
              label="Entregas (24h)"
              value={deliveries.length}
              icon={Send}
              tone="teal"
            />
          </div>
        </div>

        {/* ---------------- Tabs ---------------- */}
        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <div className="rp-glass rounded-xl p-1.5">
            <TabsList className="flex h-auto w-full gap-1 bg-transparent p-0">
              <TabsTrigger
                value="endpoints"
                className="flex-1 data-[state=active]:bg-[var(--gold)]/15 data-[state=active]:text-[var(--gold-soft)] min-h-[40px]"
              >
                <Link2 className="mr-1.5 h-4 w-4" /> Endpoints
              </TabsTrigger>
              <TabsTrigger
                value="deliveries"
                className="flex-1 data-[state=active]:bg-[var(--gold)]/15 data-[state=active]:text-[var(--gold-soft)] min-h-[40px]"
              >
                <Send className="mr-1.5 h-4 w-4" /> Entregas
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="flex-1 data-[state=active]:bg-[var(--gold)]/15 data-[state=active]:text-[var(--gold-soft)] min-h-[40px]"
              >
                <ListChecks className="mr-1.5 h-4 w-4" /> Eventos
              </TabsTrigger>
              <TabsTrigger
                value="logs"
                className="flex-1 data-[state=active]:bg-[var(--gold)]/15 data-[state=active]:text-[var(--gold-soft)] min-h-[40px]"
              >
                <Terminal className="mr-1.5 h-4 w-4" /> Logs
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ---------------- Endpoints tab ---------------- */}
          <TabsContent value="endpoints" className="space-y-3">
            <div className="space-y-3">
              {endpoints.map((ep, idx) => (
                <EndpointRow
                  key={ep.id}
                  endpoint={ep}
                  delay={idx * 0.04}
                  onTogglePause={() => togglePause(ep)}
                  onEdit={() => setEndpointEditor({ open: true, endpoint: ep })}
                  onDelete={() => setUninstallTarget(ep)}
                  onViewDeliveries={() => viewEndpointDeliveries(ep)}
                />
              ))}
              {endpoints.length === 0 && (
                <div className="rp-glass rounded-2xl p-10 text-center">
                  <Link2 className="mx-auto h-8 w-8 text-muted-foreground/60" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Aún no tienes endpoints. Crea el primero para empezar a recibir eventos.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ---------------- Deliveries tab ---------------- */}
          <TabsContent value="deliveries" className="space-y-3">
            {/* filters */}
            <div className="rp-glass rounded-xl p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 overflow-x-auto rp-scroll-thin">
                  <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {(["all", "success", "failed", "retries"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setDeliveryFilter(f)}
                      aria-pressed={deliveryFilter === f}
                      className={cn(
                        "shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors min-h-[32px]",
                        deliveryFilter === f
                          ? "border-[var(--gold)]/40 bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                          : "border-foreground/10 bg-foreground/[0.03] text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {f === "all" ? "Todas" : f === "success" ? "Éxito" : f === "failed" ? "Fallidas" : "Reintentos"}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Select value={deliveryEventFilter} onValueChange={setDeliveryEventFilter}>
                    <SelectTrigger className="h-9 w-[220px] text-xs">
                      <SelectValue placeholder="Tipo de evento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los eventos</SelectItem>
                      {ALL_EVENT_NAMES.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* table */}
            <div className="rp-glass rounded-2xl overflow-hidden">
              <div className="overflow-x-auto rp-scroll-thin">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-foreground/[0.03]">
                      <th className="px-3 py-2.5 text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">Event ID</th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">Tipo</th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">Endpoint</th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">Estado</th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">Intento</th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">Latencia</th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">Entregado</th>
                      <th className="px-3 py-2.5 text-right text-[11px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeliveries.map((d, idx) => (
                      <DeliveryRow
                        key={d.id}
                        delivery={d}
                        delay={idx * 0.02}
                        onViewPayload={() => setPayloadDelivery(d)}
                        onReplay={() => setReplayTarget(d)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredDeliveries.length === 0 && (
                <div className="p-10 text-center">
                  <Send className="mx-auto h-7 w-7 text-muted-foreground/60" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No hay entregas que coincidan con los filtros.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ---------------- Events tab ---------------- */}
          <TabsContent value="events" className="space-y-3">
            <div className="rp-glass rounded-xl p-3 text-xs text-muted-foreground">
              <ListChecks className="mr-1.5 inline-block h-4 w-4 align-text-bottom text-[var(--teal)]" />
              Catálogo de eventos disponibles. Suscribe un endpoint para recibirlos en tiempo real. Todos los payloads incluyen firma HMAC-SHA256.
            </div>
            <div className="space-y-3">
              {EVENT_GROUPS.map((g, idx) => (
                <EventGroupCard
                  key={g.group}
                  group={g}
                  delay={idx * 0.04}
                  endpoints={endpoints}
                  onSubscribe={(epId) => {
                    setEndpoints((s) =>
                      s.map((e) =>
                        e.id === epId
                          ? { ...e, events: Array.from(new Set([...e.events, ...g.events.map((ev) => ev.name)])) }
                          : e
                      )
                    );
                    toast({
                      title: "Eventos suscritos (demo)",
                      description: `Añadidos ${g.events.length} eventos del grupo "${g.group}" al endpoint.`,
                    });
                  }}
                />
              ))}
            </div>
          </TabsContent>

          {/* ---------------- Logs tab ---------------- */}
          <TabsContent value="logs" className="space-y-3">
            <div className="rp-glass rounded-xl p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 overflow-x-auto rp-scroll-thin">
                  <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {(["all", "INFO", "WARN", "ERROR"] as const).map((lv) => (
                    <button
                      key={lv}
                      type="button"
                      onClick={() => setLogLevel(lv)}
                      aria-pressed={logLevel === lv}
                      className={cn(
                        "shrink-0 rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors min-h-[32px]",
                        logLevel === lv
                          ? "border-[var(--gold)]/40 bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                          : "border-foreground/10 bg-foreground/[0.03] text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {lv === "all" ? "Todos" : lv}
                    </button>
                  ))}
                </div>
                <div className="relative w-full sm:w-80">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Buscar por event ID, URL, correlation…"
                    className="h-9 pl-9 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="rp-glass rounded-2xl overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto rp-scroll-thin">
                <table className="w-full border-collapse font-mono text-xs">
                  <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur">
                    <tr className="border-b border-border/60 bg-foreground/[0.04]">
                      <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Timestamp</th>
                      <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Nivel</th>
                      <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Event ID</th>
                      <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Endpoint</th>
                      <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Mensaje</th>
                      <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Corr ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((l) => {
                      const LvIcon = logLevelIcon(l.level);
                      return (
                        <tr
                          key={l.id}
                          className="border-b border-border/30 last:border-0 hover:bg-foreground/[0.025]"
                        >
                          <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                            {l.ts.replace("T", " ").replace(/\.\d+Z$/, "Z")}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-bold",
                                logLevelTone(l.level)
                              )}
                            >
                              <LvIcon className="h-3 w-3" /> {l.level}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-[var(--gold-soft)]">
                            {l.eventId ?? "—"}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {l.endpoint ? (
                              <span className="truncate" title={l.endpoint}>
                                {truncate(l.endpoint, 50)}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-3 py-2 text-foreground/85">{l.message}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-[var(--teal)]/80">
                            {l.correlationId}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredLogs.length === 0 && (
                  <div className="p-10 text-center">
                    <Terminal className="mx-auto h-7 w-7 text-muted-foreground/60" />
                    <p className="mt-2 text-sm text-muted-foreground">Sin logs para los filtros aplicados.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* ---------------- Endpoint editor ---------------- */}
      <EndpointEditorDialog
        open={endpointEditor.open}
        endpoint={endpointEditor.endpoint}
        onOpenChange={(o) => setEndpointEditor({ open: o })}
        onSave={handleSaveEndpoint}
      />

      {/* ---------------- Delete confirm ---------------- */}
      <AlertDialog open={!!uninstallTarget} onOpenChange={(o) => !o && setUninstallTarget(null)}>
        <AlertDialogContent className="border-border/60 bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Eliminar endpoint
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el endpoint y dejarás de recibir eventos en{" "}
              <span className="font-mono text-xs">{uninstallTarget?.url}</span>. Esta acción no se puede deshacer. (demo)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ---------------- Payload viewer ---------------- */}
      <Dialog open={!!payloadDelivery} onOpenChange={(o) => !o && setPayloadDelivery(null)}>
        <DialogContent className="max-w-2xl border-border/60 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Code2 className="h-5 w-5 text-[var(--teal)]" />
              Payload de entrega
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              {payloadDelivery?.eventId} · {payloadDelivery?.eventType}
            </DialogDescription>
          </DialogHeader>
          {payloadDelivery && (
            <div className="space-y-3 py-1">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
                <KV label="Estado" value={payloadDelivery.status} tone={httpTone(payloadDelivery.status).chip} />
                <KV label="Intento" value={`#${payloadDelivery.attempt}`} />
                <KV label="Latencia" value={`${payloadDelivery.latencyMs} ms`} />
                <KV label="Entregado" value={payloadDelivery.deliveredAt} />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    Request payload (JSON)
                  </span>
                  <Badge variant="outline" className="border-[var(--gold)]/30 font-mono text-[10px] text-[var(--gold-soft)]">
                    HMAC ✓
                  </Badge>
                </div>
                <pre className="max-h-48 overflow-auto rp-scroll-thin rounded-lg border border-border/50 bg-black/40 p-3 text-xs leading-relaxed font-mono text-foreground/85">
                  {payloadDelivery.payload}
                </pre>
              </div>
              <div>
                <div className="mb-1.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  Respuesta del endpoint
                </div>
                <pre className="max-h-40 overflow-auto rp-scroll-thin rounded-lg border border-border/50 bg-black/40 p-3 text-xs leading-relaxed font-mono text-foreground/85">
                  {payloadDelivery.response}
                </pre>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPayloadDelivery(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- Replay confirm ---------------- */}
      <AlertDialog open={!!replayTarget} onOpenChange={(o) => !o && setReplayTarget(null)}>
        <AlertDialogContent className="border-border/60 bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-[var(--gold)]" />
              Reenviar entrega
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se volverá a entregar el evento{" "}
              <span className="font-mono text-xs text-[var(--gold-soft)]">{replayTarget?.eventId}</span>{" "}
              al endpoint{" "}
              <span className="font-mono text-xs">{replayTarget?.endpointUrl}</span>. El endpoint recibirá una nueva entrega con la misma firma HMAC. (demo)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReplay}
              className="bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90"
            >
              <RefreshCw className="mr-1.5 h-4 w-4" /> Reenviar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}

/* --------------------------------------------------------------------------
 * Summary stat
 * ------------------------------------------------------------------------ */
function SummaryStat({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | string;
  icon: typeof Zap;
  tone: "gold" | "teal" | "emerald" | "rose";
}) {
  const tones = {
    gold: "text-[var(--gold)]",
    teal: "text-[var(--teal)]",
    emerald: "text-emerald-300",
    rose: "text-rose-300",
  };
  return (
    <div className="rp-glass rounded-xl p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon className={cn("h-3.5 w-3.5", tones[tone])} />
      </div>
      <div className={cn("mt-1 font-display text-2xl font-light", tones[tone])}>{value}</div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * KV cell
 * ------------------------------------------------------------------------ */
function KV({ label, value, tone }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div className="rp-glass rounded-md p-2">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={cn("mt-0.5 font-mono text-xs", tone)}>{value}</div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Endpoint row
 * ------------------------------------------------------------------------ */
function EndpointRow({
  endpoint,
  delay,
  onTogglePause,
  onEdit,
  onDelete,
  onViewDeliveries,
}: {
  endpoint: WebhookEndpoint;
  delay: number;
  onTogglePause: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewDeliveries: () => void;
}) {
  const prefersReduced = useReducedMotion();
  const [revealed, setRevealed] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const st = statusTone(endpoint.status);

  function copySecret() {
    navigator.clipboard?.writeText(endpoint.secret).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="rp-glass rounded-2xl p-4 sm:p-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        {/* left: url + events */}
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground/[0.04] text-foreground/80 ring-1 ring-border/40">
              <Server className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <code className="truncate font-mono text-sm text-foreground">{endpoint.url}</code>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                    st.chip
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", st.dot, endpoint.status !== "paused" && "animate-pulse")} />
                  {st.label}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Creado {endpoint.createdAt.slice(0, 10)}
                </span>
                {endpoint.lastDelivery && (
                  <span className="inline-flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Última entrega:{" "}
                    <span
                      className={cn(
                        "font-mono",
                        endpoint.lastDelivery.status >= 200 && endpoint.lastDelivery.status < 300
                          ? "text-emerald-300"
                          : "text-rose-300"
                      )}
                    >
                      {endpoint.lastDelivery.status}
                    </span>{" "}
                    · {endpoint.lastDelivery.at} · {endpoint.lastDelivery.latencyMs}ms
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* events */}
          <div>
            <div className="mb-1.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Eventos suscritos ({endpoint.events.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {endpoint.events.map((e) => (
                <span
                  key={e}
                  className={cn(
                    "inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px]",
                    eventTone(e)
                  )}
                >
                  {e}
                </span>
              ))}
            </div>
          </div>

          {/* secret */}
          <div className="flex items-center gap-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Secret:
            </div>
            <code className="rounded-md border border-border/50 bg-black/40 px-2 py-1 font-mono text-xs text-foreground/85">
              {revealed ? endpoint.secret : maskSecret(endpoint.secret)}
            </code>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2"
                  onClick={() => setRevealed((v) => !v)}
                >
                  {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{revealed ? "Ocultar" : "Mostrar"}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={copySecret}>
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{copied ? "Copiado" : "Copiar"}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* right: metrics + actions */}
        <div className="flex shrink-0 flex-col gap-3 lg:w-72">
          <div className="grid grid-cols-3 gap-2">
            <div className="rp-glass rounded-lg p-2 text-center">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Éxito
              </div>
              <div
                className={cn(
                  "mt-0.5 font-display text-lg font-light",
                  endpoint.successRate >= 95
                    ? "text-emerald-300"
                    : endpoint.successRate >= 80
                    ? "text-amber-300"
                    : "text-rose-300"
                )}
              >
                {endpoint.successRate.toFixed(1)}%
              </div>
            </div>
            <div className="rp-glass rounded-lg p-2 text-center">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Entregas
              </div>
              <div className="mt-0.5 font-display text-lg font-light text-[var(--teal)]">
                {endpoint.totalDelivered.toLocaleString("es-ES")}
              </div>
            </div>
            <div className="rp-glass rounded-lg p-2 text-center">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Fallos
              </div>
              <div
                className={cn(
                  "mt-0.5 font-display text-lg font-light",
                  endpoint.totalFailed > 0 ? "text-rose-300" : "text-muted-foreground"
                )}
              >
                {endpoint.totalFailed}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Button size="sm" variant="outline" onClick={onTogglePause} className="h-8">
              {endpoint.status === "paused" ? (
                <>
                  <Play className="mr-1 h-3.5 w-3.5 text-emerald-300" /> Activar
                </>
              ) : (
                <>
                  <Pause className="mr-1 h-3.5 w-3.5 text-amber-300" /> Pausar
                </>
              )}
            </Button>
            <Button size="sm" variant="ghost" onClick={onEdit} className="h-8">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onViewDeliveries} className="h-8">
              <Send className="mr-1 h-3.5 w-3.5 text-[var(--teal)]" /> Entregas
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* --------------------------------------------------------------------------
 * Delivery row
 * ------------------------------------------------------------------------ */
function DeliveryRow({
  delivery,
  delay,
  onViewPayload,
  onReplay,
}: {
  delivery: WebhookDelivery;
  delay: number;
  onViewPayload: () => void;
  onReplay: () => void;
}) {
  const prefersReduced = useReducedMotion();
  const ht = httpTone(delivery.status);
  return (
    <motion.tr
      initial={prefersReduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.2 }}
      className="border-b border-border/30 last:border-0 transition-colors hover:bg-foreground/[0.025]"
    >
      <td className="px-3 py-2.5 font-mono text-xs text-[var(--gold-soft)] whitespace-nowrap">
        {delivery.eventId}
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap">
        <span
          className={cn(
            "inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px]",
            eventTone(delivery.eventType)
          )}
        >
          {delivery.eventType}
        </span>
      </td>
      <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground" title={delivery.endpointUrl}>
        {truncate(delivery.endpointUrl.replace(/^https?:\/\//, ""), 32)}
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap">
        <span
          className={cn(
            "inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold",
            ht.chip
          )}
        >
          {ht.label}
        </span>
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap">
        <div className="flex items-center gap-1">
          <span className="font-mono text-xs text-foreground/80">#{delivery.attempt}</span>
          {delivery.attempt > 1 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <RefreshCw className="h-3 w-3 text-amber-300" />
              </TooltipTrigger>
              <TooltipContent>Reintento automático</TooltipContent>
            </Tooltip>
          )}
        </div>
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap font-mono text-xs text-muted-foreground">
        {delivery.latencyMs} ms
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap font-mono text-xs text-muted-foreground">
        {delivery.deliveredAt}
      </td>
      <td className="px-3 py-2.5 text-right whitespace-nowrap">
        <div className="inline-flex items-center gap-1">
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onViewPayload}>
            <Eye className="h-3.5 w-3.5" /> Payload
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-[var(--gold-soft)] hover:bg-[var(--gold)]/10"
            onClick={onReplay}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reenviar
          </Button>
        </div>
      </td>
    </motion.tr>
  );
}

/* --------------------------------------------------------------------------
 * Event group card
 * ------------------------------------------------------------------------ */
function EventGroupCard({
  group,
  delay,
  endpoints,
  onSubscribe,
}: {
  group: { group: string; icon: typeof Zap; events: EventDef[] };
  delay: number;
  endpoints: WebhookEndpoint[];
  onSubscribe: (epId: string) => void;
}) {
  const prefersReduced = useReducedMotion();
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [selectedEp, setSelectedEp] = React.useState<string>(endpoints[0]?.id ?? "");
  const GroupIcon = group.icon;

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="rp-glass rounded-2xl p-4 sm:p-5"
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--teal)]/15 text-[var(--teal)] ring-1 ring-[var(--teal)]/30">
          <GroupIcon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h4 className="font-display text-base font-medium">{group.group}</h4>
          <p className="text-xs text-muted-foreground">
            {group.events.length} eventos disponibles
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {group.events.map((ev) => {
          const isOpen = expanded === ev.name;
          return (
            <div
              key={ev.name}
              className="rounded-lg border border-border/40 bg-foreground/[0.02] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : ev.name)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-foreground/[0.04]"
                aria-expanded={isOpen}
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <code
                  className={cn(
                    "inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[11px]",
                    eventTone(ev.name)
                  )}
                >
                  {ev.name}
                </code>
                <span className="ml-1 truncate text-xs text-muted-foreground">{ev.description}</span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={prefersReduced ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={prefersReduced ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border/30 px-3 py-3">
                      <div className="mb-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        Ejemplo de payload
                      </div>
                      <pre className="overflow-x-auto rp-scroll-thin rounded-md bg-black/40 p-3 text-[11px] leading-relaxed font-mono text-foreground/85">
                        {JSON.stringify(ev.payload, null, 2)}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* subscribe footer */}
      <div className="mt-3 flex flex-col gap-2 border-t border-border/30 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-[var(--teal)]" />
          Todos los eventos incluyen cabecera <code className="font-mono text-[var(--gold-soft)]">X-RP-Signature</code> HMAC-SHA256.
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedEp} onValueChange={setSelectedEp}>
            <SelectTrigger className="h-8 w-[220px] text-xs">
              <SelectValue placeholder="Endpoint" />
            </SelectTrigger>
            <SelectContent>
              {endpoints.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {truncate(e.url.replace(/^https?:\/\//, ""), 30)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            className="h-8 bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90"
            onClick={() => selectedEp && onSubscribe(selectedEp)}
            disabled={!selectedEp}
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Suscribir
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/* --------------------------------------------------------------------------
 * Endpoint editor dialog
 * ------------------------------------------------------------------------ */
function EndpointEditorDialog({
  open,
  endpoint,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  endpoint?: WebhookEndpoint;
  onOpenChange: (o: boolean) => void;
  onSave: (ep: WebhookEndpoint, isNew: boolean) => void;
}) {
  const isNew = !endpoint;
  const [url, setUrl] = React.useState("");
  const [events, setEvents] = React.useState<string[]>([]);
  const [secret, setSecret] = React.useState("");
  const [autoSecret, setAutoSecret] = React.useState(true);

  React.useEffect(() => {
    if (open) {
      setUrl(endpoint?.url ?? "");
      setEvents(endpoint?.events ?? []);
      setSecret(endpoint?.secret ?? genSecret());
      setAutoSecret(true);
    }
  }, [open, endpoint]);

  function toggleEvent(name: string) {
    setEvents((s) => (s.includes(name) ? s.filter((x) => x !== name) : [...s, name]));
  }

  function handleSave() {
    if (!url.trim()) return;
    const ep: WebhookEndpoint = {
      id: endpoint?.id ?? `wh_${Date.now().toString(36)}`,
      url: url.trim(),
      events,
      secret: autoSecret ? secret || genSecret() : secret,
      status: endpoint?.status ?? "active",
      createdAt: endpoint?.createdAt ?? new Date().toISOString(),
      lastDelivery: endpoint?.lastDelivery,
      successRate: endpoint?.successRate ?? 100,
      totalDelivered: endpoint?.totalDelivered ?? 0,
      totalFailed: endpoint?.totalFailed ?? 0,
    };
    onSave(ep, isNew);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border/60 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Link2 className="h-5 w-5 text-[var(--teal)]" />
            {isNew ? "Nuevo endpoint" : "Editar endpoint"}
            
          </DialogTitle>
          <DialogDescription>
            Configura la URL destino y los eventos a suscribir. RestoPanel enviará un POST firmado con HMAC-SHA256 por cada evento.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto rp-scroll-thin py-2 pr-1">
          <div className="space-y-1.5">
            <Label htmlFor="ep-url">URL del endpoint</Label>
            <Input
              id="ep-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.tudominio.com/webhooks/restopanel"
              className="h-10 font-mono text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              Debe ser HTTPS. Se aceptarán únicamente puertos 443 y 8443.
            </p>
          </div>

          <div className="space-y-2">
            <Label>
              Eventos{" "}
              <span className="font-mono text-[11px] text-muted-foreground">
                ({events.length} seleccionados)
              </span>
            </Label>
            <div className="max-h-52 overflow-y-auto rp-scroll-thin rounded-lg border border-border/40 p-2">
              {EVENT_GROUPS.map((g) => (
                <div key={g.group} className="mb-2 last:mb-0">
                  <div className="px-1 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {g.group}
                  </div>
                  <div className="space-y-0.5">
                    {g.events.map((ev) => (
                      <label
                        key={ev.name}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-foreground/[0.04]"
                      >
                        <Checkbox
                          checked={events.includes(ev.name)}
                          onCheckedChange={() => toggleEvent(ev.name)}
                        />
                        <span className="font-mono text-xs text-foreground/85">{ev.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Secret (HMAC)</Label>
              <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Checkbox
                  checked={autoSecret}
                  onCheckedChange={(v) => setAutoSecret(v === true)}
                />
                Generar automáticamente
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={autoSecret ? maskSecret(secret) : secret}
                onChange={(e) => {
                  setAutoSecret(false);
                  setSecret(e.target.value);
                }}
                className="h-10 font-mono text-sm"
                readOnly={autoSecret}
              />
              {!autoSecret && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSecret(genSecret());
                    setAutoSecret(true);
                  }}
                >
                  <Hash className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              El secret se usa para verificar la firma. Guárdalo de forma segura — no se vuelve a mostrar.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!url.trim()}
            className="bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90"
          >
            <ShieldCheck className="mr-1.5 h-4 w-4" /> {isNew ? "Crear endpoint" : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* Code2 imported directly from lucide-react */

export default Webhooks;
