"use client";

/**
 * FinTpv — Conectores TPV (Fase 11 · RestoPanel)
 *
 * Gestión de integraciones con sistemas POS (Square, Lightspeed, Revo,
 * Hosteltáctil, Ágora, Manual) con matriz de capacidades, estado de sync,
 * cola de eventos, dead-letter queue y logs.
 *
 * Reglas:
 *  - Money y conteos siempre en enteros (cents o unidades, nunca float).
 *  - Todo dato muestra origen (source), estado y trazabilidad.
 *  - Copy en es-ES. Datos demo, badged "demo".
 *  - Sin colores indigo/azul.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  RefreshCw,
  Settings2,
  Unplug,
  FileText,
  PlusCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Database,
  Activity,
  Clock,
  Webhook,
  Radio,
  FileSpreadsheet,
  Code2,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  RotateCw,
  ChevronDown,
  ChevronRight,
  Info,
  Server,
  Gauge,
  CircleDot,
  Layers,
} from "lucide-react";

/* ===================================================================== *
 * Types
 * ===================================================================== */

type ConnectorStatus = "connected" | "disconnected" | "error" | "pending" | "sandbox";
type SyncMethod = "webhook" | "polling" | "csv" | "api";

type Provider =
  | "square"
  | "lightspeed"
  | "revo"
  | "hosteltactil"
  | "agora"
  | "manual"
  | "csv";

interface TpvConnector {
  id: string;
  provider: Provider;
  name: string;
  version: string;
  status: ConnectorStatus;
  syncMethod: SyncMethod;
  lastSync: string;
  ordersToday: number;
  ordersTotal: number;
  errorsToday: number;
  capabilities: {
    orders: boolean;
    payments: boolean;
    refunds: boolean;
    menuSync: boolean;
    realTime: boolean;
    multiLocation: boolean;
    sandbox: boolean;
  };
  webhookUrl?: string;
  credentialsStatus: "valid" | "expiring" | "invalid";
}

interface DlqItem {
  id: string;
  connectorId: string;
  externalOrderId: string;
  error: string;
  attempts: number;
  lastAttempt: string;
  payloadRef: string;
}

interface SyncLogEntry {
  ts: string;
  level: "info" | "warn" | "error";
  connectorId: string;
  message: string;
}

/* ===================================================================== *
 * Metadata maps
 * ===================================================================== */

const PROVIDER_META: Record<
  Provider,
  { label: string; initials: string; gradient: string }
> = {
  square: {
    label: "Square",
    initials: "SQ",
    gradient: "linear-gradient(135deg, #3DD6C9 0%, #2BA89E 100%)",
  },
  lightspeed: {
    label: "Lightspeed",
    initials: "LS",
    gradient: "linear-gradient(135deg, #F4DC8C 0%, #D4AF37 60%, #A8862A 100%)",
  },
  revo: {
    label: "Revo",
    initials: "RV",
    gradient: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
  },
  hosteltactil: {
    label: "Hosteltáctil",
    initials: "HT",
    gradient: "linear-gradient(135deg, #E879F9 0%, #C026D3 100%)",
  },
  agora: {
    label: "Ágora",
    initials: "AG",
    gradient: "linear-gradient(135deg, #34D399 0%, #10B981 100%)",
  },
  manual: {
    label: "Manual",
    initials: "MN",
    gradient: "linear-gradient(135deg, #94A3B8 0%, #64748B 100%)",
  },
  csv: {
    label: "CSV",
    initials: "CSV",
    gradient: "linear-gradient(135deg, #94A3B8 0%, #64748B 100%)",
  },
};

const STATUS_META: Record<
  ConnectorStatus,
  { label: string; cls: string; dot: string; pulse?: boolean }
> = {
  connected: {
    label: "Conectado",
    cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    dot: "bg-emerald-400",
    pulse: true,
  },
  disconnected: {
    label: "Desconectado",
    cls: "border-foreground/25 bg-foreground/8 text-muted-foreground",
    dot: "bg-foreground/40",
  },
  error: {
    label: "Error",
    cls: "border-rose-400/45 bg-rose-400/10 text-rose-300",
    dot: "bg-rose-400",
    pulse: true,
  },
  pending: {
    label: "Pendiente",
    cls: "border-amber-400/45 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
  },
  sandbox: {
    label: "Sandbox",
    cls: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
    dot: "bg-[var(--teal)]",
  },
};

const SYNC_METHOD_META: Record<
  SyncMethod,
  { label: string; icon: React.ElementType; cls: string }
> = {
  webhook: { label: "Webhook", icon: Webhook, cls: "border-[var(--teal)]/30 bg-[var(--teal)]/8 text-[var(--teal)]" },
  polling: { label: "Polling", icon: Radio, cls: "border-[var(--gold)]/30 bg-[var(--gold)]/8 text-[var(--gold-soft)]" },
  csv: { label: "CSV", icon: FileSpreadsheet, cls: "border-foreground/25 bg-foreground/8 text-muted-foreground" },
  api: { label: "API", icon: Code2, cls: "border-fuchsia-400/30 bg-fuchsia-400/8 text-fuchsia-300" },
};

const CRED_META: Record<
  TpvConnector["credentialsStatus"],
  { label: string; cls: string; dot: string }
> = {
  valid: { label: "Válido", cls: "text-emerald-300", dot: "bg-emerald-400" },
  expiring: { label: "Expira", cls: "text-amber-300", dot: "bg-amber-400" },
  invalid: { label: "Inválido", cls: "text-rose-300", dot: "bg-rose-400" },
};

const CAPABILITY_LABELS: { key: keyof TpvConnector["capabilities"]; label: string }[] = [
  { key: "orders", label: "Órdenes" },
  { key: "payments", label: "Pagos" },
  { key: "refunds", label: "Reembolsos" },
  { key: "menuSync", label: "Menu sync" },
  { key: "realTime", label: "Tiempo real" },
  { key: "multiLocation", label: "Multi-local" },
  { key: "sandbox", label: "Sandbox" },
];

/* ===================================================================== *
 * Demo connectors (6)
 * ===================================================================== */

const DEMO_CONNECTORS: TpvConnector[] = [
  {
    id: "conn-sq",
    provider: "square",
    name: "Square Production",
    version: "v2.0",
    status: "connected",
    syncMethod: "webhook",
    lastSync: "2025-01-21T22:46:00Z",
    ordersToday: 28,
    ordersTotal: 8421,
    errorsToday: 0,
    capabilities: {
      orders: true,
      payments: true,
      refunds: true,
      menuSync: true,
      realTime: true,
      multiLocation: true,
      sandbox: true,
    },
    webhookUrl: "https://api.restopanel.es/hooks/tpv/sq/9f2a",
    credentialsStatus: "valid",
  },
  {
    id: "conn-ls",
    provider: "lightspeed",
    name: "Lightspeed Restaurant",
    version: "v1.5",
    status: "connected",
    syncMethod: "polling",
    lastSync: "2025-01-21T22:43:00Z",
    ordersToday: 12,
    ordersTotal: 3287,
    errorsToday: 2,
    capabilities: {
      orders: true,
      payments: true,
      refunds: false,
      menuSync: true,
      realTime: false,
      multiLocation: true,
      sandbox: true,
    },
    credentialsStatus: "expiring",
  },
  {
    id: "conn-rv",
    provider: "revo",
    name: "Revo Stream",
    version: "v3.1",
    status: "connected",
    syncMethod: "api",
    lastSync: "2025-01-21T22:45:00Z",
    ordersToday: 7,
    ordersTotal: 1198,
    errorsToday: 0,
    capabilities: {
      orders: true,
      payments: true,
      refunds: true,
      menuSync: false,
      realTime: true,
      multiLocation: false,
      sandbox: true,
    },
    webhookUrl: "https://api.restopanel.es/hooks/tpv/rv/3c7d",
    credentialsStatus: "valid",
  },
  {
    id: "conn-ht",
    provider: "hosteltactil",
    name: "Hosteltáctil Import",
    version: "v1.0",
    status: "pending",
    syncMethod: "csv",
    lastSync: "2025-01-21T08:00:00Z",
    ordersToday: 0,
    ordersTotal: 0,
    errorsToday: 0,
    capabilities: {
      orders: true,
      payments: false,
      refunds: false,
      menuSync: false,
      realTime: false,
      multiLocation: false,
      sandbox: false,
    },
    credentialsStatus: "valid",
  },
  {
    id: "conn-ag",
    provider: "agora",
    name: "Ágora Beta",
    version: "v0.9",
    status: "sandbox",
    syncMethod: "api",
    lastSync: "2025-01-21T22:30:00Z",
    ordersToday: 3,
    ordersTotal: 47,
    errorsToday: 0,
    capabilities: {
      orders: true,
      payments: true,
      refunds: false,
      menuSync: false,
      realTime: false,
      multiLocation: false,
      sandbox: true,
    },
    webhookUrl: "https://api.restopanel.es/hooks/tpv/ag/b8e1",
    credentialsStatus: "valid",
  },
  {
    id: "conn-mn",
    provider: "manual",
    name: "Carga manual",
    version: "v1.0",
    status: "connected",
    syncMethod: "csv",
    lastSync: "2025-01-21T17:10:00Z",
    ordersToday: 1,
    ordersTotal: 312,
    errorsToday: 0,
    capabilities: {
      orders: true,
      payments: false,
      refunds: false,
      menuSync: false,
      realTime: false,
      multiLocation: false,
      sandbox: false,
    },
    credentialsStatus: "valid",
  },
];

/* ===================================================================== *
 * DLQ items (2)
 * ===================================================================== */

const DEMO_DLQ: DlqItem[] = [
  {
    id: "dlq-1",
    connectorId: "conn-ls",
    externalOrderId: "LS-2025-0088",
    error: "schema_validation_failed: missing field 'closed_at' on closed order",
    attempts: 3,
    lastAttempt: "2025-01-21T22:31:14Z",
    payloadRef: "r2://restopanel-dlq/ls/2025-01/LS-2025-0088.json",
  },
  {
    id: "dlq-2",
    connectorId: "conn-ls",
    externalOrderId: "LS-2025-0087",
    error: "duplicate_external_id: order already ingested at 2025-01-21T20:14:02Z",
    attempts: 5,
    lastAttempt: "2025-01-21T22:14:33Z",
    payloadRef: "r2://restopanel-dlq/ls/2025-01/LS-2025-0087.json",
  },
];

/* ===================================================================== *
 * Sync logs (demo, per-connector)
 * ===================================================================== */

const DEMO_LOGS: SyncLogEntry[] = [
  { ts: "2025-01-21T22:46:01Z", level: "info", connectorId: "conn-sq", message: "Webhook recibido · order SQ-2025-0146 ingestada" },
  { ts: "2025-01-21T22:45:32Z", level: "info", connectorId: "conn-rv", message: "API poll OK · 1 orden nueva" },
  { ts: "2025-01-21T22:43:55Z", level: "warn", connectorId: "conn-ls", message: "Polling OK · 1 orden con advertencia de schema" },
  { ts: "2025-01-21T22:31:14Z", level: "error", connectorId: "conn-ls", message: "LS-2025-0088 → DLQ (3 intentos fallidos)" },
  { ts: "2025-01-21T22:14:33Z", level: "error", connectorId: "conn-ls", message: "LS-2025-0087 → DLQ (duplicado)" },
  { ts: "2025-01-21T22:00:00Z", level: "info", connectorId: "conn-sq", message: "Checkpoint guardado: sq-cp-2025-01-21T22-00-00Z" },
  { ts: "2025-01-21T17:10:14Z", level: "info", connectorId: "conn-mn", message: "CSV manual importado · 1 orden · usuario ana@restopanel.es" },
  { ts: "2025-01-21T08:00:00Z", level: "info", connectorId: "conn-ht", message: "Programado CSV diario · pendiente de subida" },
];

/* ===================================================================== *
 * Helpers
 * ===================================================================== */

function timeAgo(iso: string): string {
  try {
    const diffMs = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diffMs / 60000);
    if (min < 1) return "hace <1 min";
    if (min < 60) return `hace ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `hace ${h} h`;
    const d = Math.floor(h / 24);
    return `hace ${d} d`;
  } catch {
    return iso;
  }
}

function timeShort(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/* ===================================================================== *
 * UI atoms
 * ===================================================================== */


function ProviderAvatar({ provider, size = 44 }: { provider: Provider; size?: number }) {
  const m = PROVIDER_META[provider];
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-black shrink-0"
      style={{ width: size, height: size, background: m.gradient, fontSize: size * 0.32 }}
      aria-hidden
    >
      {m.initials}
    </div>
  );
}

function StatusBadge({ status }: { status: ConnectorStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs",
        m.cls
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", m.dot, m.pulse && "animate-pulse")}
      />
      {m.label}
    </span>
  );
}

function SyncMethodBadge({ method }: { method: SyncMethod }) {
  const m = SYNC_METHOD_META[method];
  const Icon = m.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px]",
        m.cls
      )}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {m.label}
    </span>
  );
}

function CredentialsPill({ status }: { status: TpvConnector["credentialsStatus"] }) {
  const m = CRED_META[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px]">
      <KeyRound className="h-3 w-3 text-muted-foreground" aria-hidden />
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      <span className={m.cls}>{m.label}</span>
    </span>
  );
}

function SourcePill({ source }: { source: string }) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground/70 transition-colors cursor-help">
            <Database className="h-3 w-3" aria-hidden />
            {source}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-xs">Origen del dato · trazabilidad</p>
          <p className="text-[11px] text-muted-foreground mt-1">{source}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function CapCell({ on, label }: { on: boolean; label?: string }) {
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center justify-center rounded-md h-7 w-7 text-xs",
              on
                ? "bg-emerald-400/15 text-emerald-300"
                : "bg-foreground/5 text-muted-foreground/50"
            )}
          >
            {on ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-[11px]">{label ?? (on ? "Soportado" : "No soportado")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* ===================================================================== *
 * Connector card
 * ===================================================================== */

function ConnectorCard({
  c,
  onConfigure,
  onSync,
  onDisconnect,
  onLogs,
  syncing,
}: {
  c: TpvConnector;
  onConfigure: () => void;
  onSync: () => void;
  onDisconnect: () => void;
  onLogs: () => void;
  syncing: boolean;
}) {
  return (
    <div
      className={cn(
        "rp-glass rounded-2xl p-4 sm:p-5 flex flex-col gap-3",
        c.status === "error" && "border-l-2 border-rose-400/60",
        c.status === "pending" && "border-l-2 border-amber-400/60"
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <ProviderAvatar provider={c.provider} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display text-base font-medium truncate">{c.name}</h3>
            <span className="text-[10px] font-mono text-muted-foreground">{c.version}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <StatusBadge status={c.status} />
            <SyncMethodBadge method={c.syncMethod} />
          </div>
        </div>
      </div>

      {/* Last sync + credentials */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="rp-glass rounded-lg p-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Última sync
          </div>
          <div className="mt-0.5 text-foreground/90 font-mono">{timeAgo(c.lastSync)}</div>
        </div>
        <div className="rp-glass rounded-lg p-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Credenciales
          </div>
          <div className="mt-0.5">
            <CredentialsPill status={c.credentialsStatus} />
          </div>
        </div>
      </div>

      {/* Counts */}
      <div className="grid grid-cols-3 gap-2">
        <CountTile label="Órdenes hoy" value={c.ordersToday} tone="teal" />
        <CountTile label="Total" value={c.ordersTotal} tone="gold" />
        <CountTile
          label="Errores hoy"
          value={c.errorsToday}
          tone={c.errorsToday > 0 ? "rose" : "muted"}
        />
      </div>

      {/* Capability matrix */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
          Matriz de capacidades
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {CAPABILITY_LABELS.map((cap) => (
            <div key={cap.key} className="flex flex-col items-center gap-1">
              <CapCell on={c.capabilities[cap.key]} label={`${cap.label}: ${c.capabilities[cap.key] ? "soportado" : "no soportado"}`} />
              <span className="text-[9px] text-muted-foreground text-center leading-tight hidden sm:block">
                {cap.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button
          size="sm"
          variant="outline"
          className="h-10 min-h-11 text-xs"
          onClick={onConfigure}
        >
          <Settings2 className="h-3.5 w-3.5 mr-1" />
          Configurar
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-10 min-h-11 text-xs"
          onClick={onLogs}
        >
          <FileText className="h-3.5 w-3.5 mr-1" />
          Ver logs
        </Button>
        <Button
          size="sm"
          className="h-10 min-h-11 text-xs bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
          onClick={onSync}
          disabled={syncing || c.status === "pending"}
        >
          {syncing ? (
            <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
          )}
          {syncing ? "Sincronizando…" : "Sincronizar"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-10 min-h-11 text-xs text-rose-300 hover:text-rose-200 hover:border-rose-400/50"
          onClick={onDisconnect}
          disabled={c.status === "disconnected"}
        >
          <Unplug className="h-3.5 w-3.5 mr-1" />
          Desconectar
        </Button>
      </div>
    </div>
  );
}

function CountTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "teal" | "gold" | "rose" | "muted";
}) {
  const toneCls = {
    teal: "rp-teal-text",
    gold: "rp-gold-text",
    rose: "text-rose-300",
    muted: "text-muted-foreground",
  }[tone];
  return (
    <div className="rp-glass rounded-lg p-2">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={cn("mt-0.5 font-display text-lg font-light tabular-nums", toneCls)}>
        {value.toLocaleString("es-ES")}
      </div>
    </div>
  );
}

/* ===================================================================== *
 * Connector config dialog
 * ===================================================================== */

function ConnectorConfigDialog({
  connector,
  onClose,
}: {
  connector: TpvConnector | null;
  onClose: () => void;
}) {
  const { toast } = useToast();
  if (!connector) return null;
  const m = PROVIDER_META[connector.provider];

  return (
    <Dialog open={!!connector} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rp-scroll-thin bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <ProviderAvatar provider={connector.provider} size={32} />
            {connector.name}
            <span className="text-[10px] font-mono text-muted-foreground">{connector.version}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Configuración del conector · {m.label}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Status row */}
          <div className="rp-glass rounded-xl p-3 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <StatusBadge status={connector.status} />
              <SyncMethodBadge method={connector.syncMethod} />
            </div>
            <CredentialsPill status={connector.credentialsStatus} />
          </div>

          {/* Webhook URL */}
          {connector.webhookUrl && (
            <div>
              <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                URL del webhook (entrada)
              </Label>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  readOnly
                  value={connector.webhookUrl}
                  className="font-mono text-xs bg-background/40 h-10"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10 shrink-0"
                  onClick={() => {
                    navigator.clipboard?.writeText(connector.webhookUrl ?? "");
                    toast({ title: "URL copiada", description: "Webhook URL en portapapeles" });
                  }}
                >
                  Copiar
                </Button>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Registra esta URL en el panel de desarrollador de {m.label}.
              </p>
            </div>
          )}

          {/* Credentials */}
          <div className="rp-glass rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="h-3.5 w-3.5 rp-gold-text" />
              <span className="text-sm font-medium">Credenciales</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  API Key
                </Label>
                <Input
                  readOnly
                  type="password"
                  value="sk_live_••••••••••••••••9f2a"
                  className="font-mono text-xs bg-background/40 h-9 mt-1"
                />
              </div>
              <div>
                <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Location ID
                </Label>
                <Input
                  readOnly
                  value="loc-mad-001"
                  className="font-mono text-xs bg-background/40 h-9 mt-1"
                />
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-9 mt-3 text-xs"
              onClick={() => toast({ title: "Rotación iniciada", description: "Nuevas credenciales solicitadas (expira en 90 días)" })}
            >
              <RotateCw className="h-3.5 w-3.5 mr-1" />
              Rotar credenciales
            </Button>
          </div>

          {/* Sync settings */}
          <div className="rp-glass rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-3.5 w-3.5 rp-teal-text" />
              <span className="text-sm font-medium">Sincronización</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <KVRow k="Método" v={SYNC_METHOD_META[connector.syncMethod].label} />
              <KVRow k="Intervalo polling" v={connector.syncMethod === "polling" ? "60s" : "n/a"} />
              <KVRow k="Reintentos máx." v="5 con backoff exponencial" />
              <KVRow k="DLQ umbral" v="3 fallos → DLQ" />
              <KVRow k="Última sync" v={timeAgo(connector.lastSync)} />
              <KVRow k="Checkpoint" v="sq-cp-2025-01-21T22-00-00Z" mono />
            </div>
          </div>

          {/* Webhook events subscribed */}
          {connector.syncMethod === "webhook" && (
            <div className="rp-glass rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Webhook className="h-3.5 w-3.5 rp-teal-text" />
                <span className="text-sm font-medium">Eventos suscritos</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["order.opened", "order.closed", "order.cancelled", "order.refunded", "payment.captured", "menu.updated"].map((e) => (
                  <span
                    key={e}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[var(--teal)]/30 bg-[var(--teal)]/8 text-[var(--teal)]"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} className="h-10 min-h-11">
            Cancelar
          </Button>
          <Button
            className="h-10 min-h-11 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
            onClick={() => {
              toast({ title: "Configuración guardada", description: `${connector.name} actualizado` });
              onClose();
            }}
          >
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function KVRow({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1 border-b border-border/30 last:border-0">
      <span className="text-[11px] text-muted-foreground">{k}</span>
      <span className={cn("text-xs text-foreground/90 text-right", mono && "font-mono")}>{v}</span>
    </div>
  );
}

/* ===================================================================== *
 * Connector logs dialog
 * ===================================================================== */

function ConnectorLogsDialog({
  connector,
  onClose,
}: {
  connector: TpvConnector | null;
  onClose: () => void;
}) {
  if (!connector) return null;
  const logs = DEMO_LOGS.filter((l) => l.connectorId === connector.id);
  const allLogs = logs.length > 0 ? logs : DEMO_LOGS;
  return (
    <Dialog open={!!connector} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rp-scroll-thin bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Logs de sincronización
            <span className="font-mono text-xs text-muted-foreground">· {connector.name}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Últimos eventos · retention 30 días · inmutable
          </DialogDescription>
        </DialogHeader>

        <div className="rp-glass rounded-xl overflow-hidden mt-2">
          <div className="max-h-[60vh] overflow-y-auto rp-scroll-thin divide-y divide-border/30">
            {allLogs.map((l, i) => {
              const toneCls =
                l.level === "error"
                  ? "text-rose-300"
                  : l.level === "warn"
                  ? "text-amber-300"
                  : "text-emerald-300/80";
              const Icon =
                l.level === "error"
                  ? XCircle
                  : l.level === "warn"
                  ? AlertTriangle
                  : CheckCircle2;
              return (
                <div key={i} className="px-3 py-2 flex items-start gap-3 text-xs">
                  <span className="font-mono text-[10px] text-muted-foreground tabular-nums shrink-0 mt-0.5">
                    {timeShort(l.ts)}
                  </span>
                  <Icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", toneCls)} />
                  <span className="text-foreground/80">{l.message}</span>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            className="h-10 min-h-11"
            onClick={() => toast({ title: "Logs exportados", description: "CSV descargado (30 días)" })}
          >
            <FileText className="h-4 w-4 mr-1" />
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={onClose} className="h-10 min-h-11">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ===================================================================== *
 * Add connector dialog
 * ===================================================================== */

function AddConnectorDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [provider, setProvider] = React.useState<Provider>("square");
  const [syncMethod, setSyncMethod] = React.useState<SyncMethod>("webhook");
  const [apiKey, setApiKey] = React.useState("");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <PlusCircle className="h-4 w-4 rp-gold-text" />
            Añadir conector TPV
          </DialogTitle>
          <DialogDescription className="text-xs">
            Configura una nueva integración POS. Se iniciará en modo sandbox hasta
            verificación de credenciales.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <div>
            <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Proveedor
            </Label>
            <Select value={provider} onValueChange={(v) => setProvider(v as Provider)}>
              <SelectTrigger className="mt-1 h-10 bg-background/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="lightspeed">Lightspeed</SelectItem>
                <SelectItem value="revo">Revo</SelectItem>
                <SelectItem value="hosteltactil">Hosteltáctil</SelectItem>
                <SelectItem value="agora">Ágora</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Método de sync
            </Label>
            <Select value={syncMethod} onValueChange={(v) => setSyncMethod(v as SyncMethod)}>
              <SelectTrigger className="mt-1 h-10 bg-background/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="webhook">Webhook (recomendado)</SelectItem>
                <SelectItem value="polling">Polling</SelectItem>
                <SelectItem value="api">API (push/pull)</SelectItem>
                <SelectItem value="csv">CSV import</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              API Key / Token
            </Label>
            <Input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk_live_…"
              type="password"
              className="mt-1 h-10 bg-background/40 font-mono text-xs"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">
              Se encripta en reposo (AES-256) · nunca se loguea
            </p>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} className="h-10 min-h-11">
            Cancelar
          </Button>
          <Button
            className="h-10 min-h-11 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
            onClick={() => {
              toast({
                title: "Conector creado en sandbox",
                description: `${PROVIDER_META[provider].label} · ${SYNC_METHOD_META[syncMethod].label} · verificando credenciales…`,
              });
              setApiKey("");
              onClose();
            }}
          >
            Crear conector
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ===================================================================== *
 * Capability comparison table
 * ===================================================================== */

function CapabilityComparisonTable() {
  return (
    <div className="rp-glass rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 rp-gold-text" />
          <h3 className="font-display text-lg font-medium">Comparativa de capacidades</h3>
        </div>
        <SourcePill source="connectors.capabilities · snapshot estático v1" />
      </div>
      <div className="overflow-x-auto rp-scroll-thin -mx-1 px-1">
        <table className="w-full text-xs min-w-[680px]">
          <thead>
            <tr className="border-b border-border/60">
              <th className="px-3 py-2 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Proveedor
              </th>
              {CAPABILITY_LABELS.map((cap) => (
                <th
                  key={cap.key}
                  className="px-2 py-2 text-center text-[10px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                >
                  {cap.label}
                </th>
              ))}
              <th className="px-3 py-2 text-center text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Score
              </th>
            </tr>
          </thead>
          <tbody>
            {DEMO_CONNECTORS.map((c) => {
              const score = CAPABILITY_LABELS.filter((cap) => c.capabilities[cap.key]).length;
              return (
                <tr
                  key={c.id}
                  className="border-b border-border/30 last:border-0 hover:bg-foreground/[0.025] transition-colors"
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <ProviderAvatar provider={c.provider} size={24} />
                      <span className="text-foreground/90">{PROVIDER_META[c.provider].label}</span>
                    </div>
                  </td>
                  {CAPABILITY_LABELS.map((cap) => (
                    <td key={cap.key} className="px-2 py-2 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center h-5 w-5 rounded",
                          c.capabilities[cap.key]
                            ? "bg-emerald-400/15 text-emerald-300"
                            : "bg-foreground/5 text-muted-foreground/40"
                        )}
                      >
                        {c.capabilities[cap.key] ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                      </span>
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center">
                    <span
                      className={cn(
                        "font-mono tabular-nums text-xs",
                        score >= 6 ? "rp-gold-text" : score >= 3 ? "rp-teal-text" : "text-muted-foreground"
                      )}
                    >
                      {score}/{CAPABILITY_LABELS.length}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===================================================================== *
 * Sync queue status panel
 * ===================================================================== */

function SyncQueuePanel() {
  const stats = [
    { label: "Eventos pendientes", value: "3", icon: Clock, tone: "amber", sub: "en cola · ~5s ETA" },
    { label: "Procesados hoy", value: "247", icon: CheckCircle2, tone: "teal", sub: "ingestados OK" },
    { label: "DLQ (dead-letter)", value: "2", icon: ShieldAlert, tone: "rose", sub: "requieren reproceso" },
    { label: "Throughput", value: "89", icon: Gauge, tone: "gold", sub: "events/min · p95" },
  ];
  const toneCls: Record<string, string> = {
    amber: "text-amber-300",
    teal: "rp-teal-text",
    rose: "text-rose-300",
    gold: "rp-gold-text",
  };
  return (
    <div className="rp-glass rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 rp-teal-text" />
          <h3 className="font-display text-lg font-medium">Estado de la cola de sync</h3>
        </div>
        <SourcePill source="tpv-ingest.queue · realtime · p95 89 ev/min" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rp-glass rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </span>
                <Icon className={cn("h-3.5 w-3.5", toneCls[s.tone])} aria-hidden />
              </div>
              <div className={cn("mt-1.5 font-display text-2xl font-light tabular-nums", toneCls[s.tone])}>
                {s.value}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between gap-2 flex-wrap text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CircleDot className="h-3 w-3 rp-teal-text" />
          Último checkpoint: <span className="font-mono">2025-01-21T14:32:01Z</span>
        </span>
        <span className="font-mono">stream: tpv-ingest-v3 · consumidor: ingest-worker-7</span>
      </div>
    </div>
  );
}

/* ===================================================================== *
 * DLQ panel
 * ===================================================================== */

function DlqPanel() {
  const { toast } = useToast();
  const [items, setItems] = React.useState(DEMO_DLQ);
  const [open, setOpen] = React.useState<Record<string, boolean>>({});

  const handleReprocess = (item: DlqItem) => {
    toast({
      title: "Reprocesando evento",
      description: `${item.externalOrderId} reenviado a la cola de ingestión`,
    });
    setItems((arr) => arr.filter((i) => i.id !== item.id));
  };

  if (items.length === 0) {
    return (
      <div className="rp-glass rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="h-4 w-4 text-emerald-300" />
          <h3 className="font-display text-lg font-medium">Dead-letter queue</h3>
        </div>
        <p className="text-sm text-emerald-300/80">
          ✓ Sin eventos en DLQ. Todos los fallos resueltos.
        </p>
      </div>
    );
  }

  return (
    <div className="rp-glass rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-rose-300" />
          <h3 className="font-display text-lg font-medium">Dead-letter queue ({items.length})</h3>
        </div>
        <SourcePill source="tpv-ingest.dlq · retention 14 días" />
      </div>
      <div className="space-y-2">
        {items.map((item) => {
          const conn = DEMO_CONNECTORS.find((c) => c.id === item.connectorId);
          const isOpen = open[item.id] ?? false;
          return (
            <div key={item.id} className="rp-glass rounded-xl overflow-hidden border border-rose-400/30">
              <Collapsible open={isOpen} onOpenChange={(v) => setOpen((o) => ({ ...o, [item.id]: v }))}>
                <div className="p-3 flex items-start gap-3">
                  <XCircle className="h-4 w-4 text-rose-300 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-foreground/90">{item.externalOrderId}</span>
                      {conn && <ProviderAvatar provider={conn.provider} size={20} />}
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {conn?.name}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-rose-300/90 font-mono break-all">
                      {item.error}
                    </p>
                    <div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                      <span>{item.attempts} intentos</span>
                      <span>·</span>
                      <span>último: {timeShort(item.lastAttempt)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => handleReprocess(item)}
                    >
                      <RotateCw className="h-3 w-3 mr-1" />
                      Reprocesar
                    </Button>
                    <CollapsibleTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-8 text-xs w-full">
                        {isOpen ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                        Detalle
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent>
                  <div className="px-3 pb-3 pt-1 border-t border-border/40">
                    <div className="text-[10px] font-mono text-muted-foreground mb-1">
                      Payload original:
                    </div>
                    <div className="text-[11px] font-mono text-foreground/70 break-all bg-background/40 rounded p-2">
                      {item.payloadRef}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===================================================================== *
 * Disconnect confirm dialog
 * ===================================================================== */

function DisconnectDialog({
  connector,
  onClose,
  onConfirm,
}: {
  connector: TpvConnector | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={!!connector} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent className="bg-card/95 backdrop-blur-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Unplug className="h-4 w-4 text-rose-300" />
            Desconectar {connector?.name}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            Se detendrá la sincronización de nuevas órdenes. Las órdenes ya ingestadas
            permanecen en la base de datos (inmutables). El conector puede reconectarse
            más tarde manteniendo el checkpoint. Esta acción queda auditada.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-10 min-h-11">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="h-10 min-h-11 bg-rose-500/90 hover:bg-rose-500 text-white"
            onClick={onConfirm}
          >
            <Unplug className="h-4 w-4 mr-1" />
            Desconectar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ===================================================================== *
 * Main component
 * ===================================================================== */

export function FinTpv() {
  const reduce = useReducedMotion();
  const { toast } = useToast();
  const [configConn, setConfigConn] = React.useState<TpvConnector | null>(null);
  const [logsConn, setLogsConn] = React.useState<TpvConnector | null>(null);
  const [disconnectConn, setDisconnectConn] = React.useState<TpvConnector | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [syncingId, setSyncingId] = React.useState<string | null>(null);
  const [connectors, setConnectors] = React.useState(DEMO_CONNECTORS);

  const handleSync = (c: TpvConnector) => {
    setSyncingId(c.id);
    setTimeout(() => {
      setSyncingId(null);
      setConnectors((arr) =>
        arr.map((x) =>
          x.id === c.id
            ? { ...x, lastSync: new Date().toISOString(), ordersToday: x.ordersToday + 1 }
            : x
        )
      );
      toast({
        title: "Sincronización completa",
        description: `${c.name} · 1 nueva orden ingestada · 0 errores`,
      });
    }, 1400);
  };

  const handleDisconnectConfirm = () => {
    if (!disconnectConn) return;
    setConnectors((arr) =>
      arr.map((x) =>
        x.id === disconnectConn.id ? { ...x, status: "disconnected" as ConnectorStatus } : x
      )
    );
    toast({
      title: "Conector desconectado",
      description: `${disconnectConn.name} detenido · checkpoint preservado`,
    });
    setDisconnectConn(null);
  };

  const connected = connectors.filter((c) => c.status === "connected").length;
  const totalOrdersToday = connectors.reduce((s, c) => s + c.ordersToday, 0);
  const totalErrorsToday = connectors.reduce((s, c) => s + c.errorsToday, 0);

  return (
    <div className="min-h-screen flex flex-col gap-4 sm:gap-6 py-4 sm:py-6 px-3 sm:px-4 lg:px-6 overflow-x-hidden">
      {/* Header */}
      <header className="rp-glass rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl sm:text-3xl font-light tracking-tight">
                Conectores <span className="rp-gold-gradient">TPV</span>
              </h1>
              
            </div>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              Gestiona integraciones con sistemas POS. Matriz de capacidades, sync en tiempo
              real, cola de eventos, dead-letter queue y trazabilidad completa de credenciales.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {connected} activos
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{totalOrdersToday} órdenes hoy</span>
              <span className="text-muted-foreground">·</span>
              <span className={totalErrorsToday > 0 ? "text-rose-300" : "text-muted-foreground"}>
                {totalErrorsToday} errores
              </span>
            </div>
            <Button
              className="h-9 min-h-11 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
              size="sm"
              onClick={() => setAddOpen(true)}
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1" />
              Añadir conector
            </Button>
          </div>
        </div>
      </header>

      {/* Connector grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        <AnimatePresence>
          {connectors.map((c) => (
            <motion.div
              key={c.id}
              layout
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25 }}
            >
              <ConnectorCard
                c={c}
                onConfigure={() => setConfigConn(c)}
                onSync={() => handleSync(c)}
                onDisconnect={() => setDisconnectConn(c)}
                onLogs={() => setLogsConn(c)}
                syncing={syncingId === c.id}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Capability comparison table */}
      <CapabilityComparisonTable />

      {/* Sync queue + DLQ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <SyncQueuePanel />
        <DlqPanel />
      </div>

      {/* Footer / traceability */}
      <div className="rp-glass rounded-xl p-3 flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
        <Info className="h-3.5 w-3.5" />
        <span>
          Conectores: <span className="font-mono">{connectors.length}</span> · proveedores
          soportados: Square, Lightspeed, Revo, Hosteltáctil, Ágora, Manual, CSV · ingestión
          idempotente (dedup por external_id + provider) · retention payload 7 años
        </span>
        <SourcePill source="connectors.snapshot · ts: 2025-01-21T22:46:00Z" />
      </div>

      {/* Dialogs */}
      <ConnectorConfigDialog connector={configConn} onClose={() => setConfigConn(null)} />
      <ConnectorLogsDialog connector={logsConn} onClose={() => setLogsConn(null)} />
      <DisconnectDialog
        connector={disconnectConn}
        onClose={() => setDisconnectConn(null)}
        onConfirm={handleDisconnectConfirm}
      />
      <AddConnectorDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

export default FinTpv;
