"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "@/hooks/use-toast";
import {
  Activity,
  ScrollText,
  GitBranch,
  BarChart3,
  Bell,
  AlertTriangle,
  AlertOctagon,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Database,
  Cpu,
  Brain,
  Server,
  Layers,
  Zap,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Eye,
  FileJson,
  Radio,
  Play,
  RefreshCw,
  Plus,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  MapPin,
  Gauge,
  Cloud,
  ShieldAlert,
  Flame,
  CircleAlert,
  Sparkles,
  ArrowLeft,
  ClipboardList,
  Cog,
} from "lucide-react";

/* =====================================================================
 * Tipos compartidos
 * ===================================================================== */

type LogLevel = "INFO" | "WARN" | "ERROR";
type LogService =
  | "API"
  | "D1"
  | "Queues"
  | "AI"
  | "CRM"
  | "Billing"
  | "Webhooks";

interface LogEntry {
  ts: string;
  level: LogLevel;
  service: LogService;
  correlationId: string;
  message: string;
  durationMs: number;
  json: Record<string, unknown>;
}

type SpanKind = "sync-gold" | "sync-teal" | "sync-amber" | "sync-green" | "async-green";
type SpanStatus = "success" | "error";

interface TraceSpan {
  id: string;
  name: string;
  service: string;
  startMs: number;
  durMs: number;
  kind: SpanKind;
  status: SpanStatus;
  kindLabel: string;
  attributes: Record<string, string | number>;
  events: string[];
  asyncViaQueue?: boolean;
}

interface TraceSummary {
  correlationId: string;
  endpoint: string;
  method: string;
  durationMs: number;
  status: SpanStatus;
  spans: number;
  when: string;
}

type AlertSeverity = "critical" | "high" | "medium" | "low";
type AlertStatus = "firing" | "acknowledged" | "resolved" | "monitoring";

interface Alert {
  id: string;
  severity: AlertSeverity;
  rule: string;
  description: string;
  currentValue: string;
  threshold: string;
  triggeredAt: string;
  status: AlertStatus;
  assignee: string;
}

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: string;
  threshold: string;
  window: string;
  severity: AlertSeverity;
  enabled: boolean;
  cooldown: string;
  lastTriggered: string;
}

type IncidentStatus =
  | "investigating"
  | "identified"
  | "monitoring"
  | "resolved";

interface Incident {
  id: string;
  severity: AlertSeverity;
  title: string;
  status: IncidentStatus;
  impact: string;
  services: string[];
  orgs: number;
  createdAt: string;
  timeline: { ts: string; label: string; done: boolean }[];
  assignee: string;
  aiSummary: string;
}

/* =====================================================================
 * Utilidades
 * ===================================================================== */

const LEVEL_STYLES: Record<LogLevel, string> = {
  INFO: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  WARN: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  ERROR: "border-red-400/50 bg-red-400/10 text-red-300",
};

const LEVEL_DOT: Record<LogLevel, string> = {
  INFO: "bg-sky-400",
  WARN: "bg-amber-400",
  ERROR: "bg-red-400",
};

const SERVICE_STYLES: Record<LogService, string> = {
  API: "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
  D1: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
  Queues: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300",
  AI: "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
  CRM: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
  Billing: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  Webhooks: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
};

const SEVERITY_STYLES: Record<AlertSeverity, string> = {
  critical: "border-red-500/50 bg-red-500/10 text-red-300",
  high: "border-orange-400/50 bg-orange-400/10 text-orange-300",
  medium: "border-amber-400/50 bg-amber-400/10 text-amber-300",
  low: "border-sky-400/40 bg-sky-400/10 text-sky-300",
};

const SEVERITY_DOT: Record<AlertSeverity, string> = {
  critical: "bg-red-500",
  high: "bg-orange-400",
  medium: "bg-amber-400",
  low: "bg-sky-400",
};

const ALERT_STATUS_STYLES: Record<AlertStatus, string> = {
  firing: "border-red-400/50 bg-red-400/10 text-red-300",
  acknowledged: "border-amber-400/50 bg-amber-400/10 text-amber-300",
  monitoring: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  resolved: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
};

const INCIDENT_STATUS_STYLES: Record<IncidentStatus, string> = {
  investigating: "border-amber-400/50 bg-amber-400/10 text-amber-300",
  identified: "border-orange-400/50 bg-orange-400/10 text-orange-300",
  monitoring: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  resolved: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
};

const SPAN_COLOR: Record<SpanKind, string> = {
  "sync-gold": "#D4AF37",
  "sync-teal": "#3DD6C9",
  "sync-amber": "#E8C766",
  "sync-green": "#34D399",
  "async-green": "#10B981",
};

function MaskPII(text: string): string {
  // Demo: enmascara posibles emails y tokens sensibles
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "***@***.***")
    .replace(/(Bearer\s+)[A-Za-z0-9._-]+/gi, "$1***")
    .replace(/(token=)[A-Za-z0-9]+/gi, "$1***");
}

/* =====================================================================
 * Datos demo — Logs
 * ===================================================================== */

const LOGS: LogEntry[] = [
  {
    ts: "12:42:13.124",
    level: "INFO",
    service: "API",
    correlationId: "req_01HZXABC",
    message: "POST /v1/reservations → 201 Created",
    durationMs: 42,
    json: {
      method: "POST",
      path: "/v1/reservations",
      status: 201,
      duration_ms: 42,
      tenant_id: "org_01HZX8K7Y9",
      user_id: "usr_***REDACTED***",
      ip: "***.***.***.42",
    },
  },
  {
    ts: "12:42:13.126",
    level: "INFO",
    service: "D1",
    correlationId: "req_01HZXABC",
    message: "INSERT INTO reservations (8ms) · 1 row",
    durationMs: 8,
    json: {
      query: "INSERT INTO reservations (...) VALUES (...) RETURNING *",
      duration_ms: 8,
      rows: 1,
      d1_database: "restopanel-prod",
    },
  },
  {
    ts: "12:42:13.128",
    level: "INFO",
    service: "Queues",
    correlationId: "req_01HZXABC",
    message: "Enqueued 3 messages → crm-updates, analytics, audit",
    durationMs: 1,
    json: {
      queues: ["crm-updates", "analytics", "audit"],
      batch_id: "bch_01HZXABC",
    },
  },
  {
    ts: "12:42:14.001",
    level: "INFO",
    service: "CRM",
    correlationId: "req_01HZXABC",
    message: "Cliente actualizado · tag 'VIP' añadido",
    durationMs: 5,
    json: {
      customer_id: "cus_***REDACTED***",
      action: "tag_added",
      tag: "VIP",
      via: "queue:crm-updates",
    },
  },
  {
    ts: "12:42:14.012",
    level: "WARN",
    service: "AI",
    correlationId: "req_01HZXABC",
    message: "Fallback de modelo gpt-4o → gpt-4o-mini (rate limit)",
    durationMs: 312,
    json: {
      primary_model: "gpt-4o",
      fallback_model: "gpt-4o-mini",
      reason: "rate_limit_429",
      tokens_in: 1240,
      tokens_out: 280,
      cost_usd: 0.0042,
    },
  },
  {
    ts: "12:42:14.250",
    level: "INFO",
    service: "Webhooks",
    correlationId: "req_01HZXABC",
    message: "Webhook reservation.created entregado a 2 endpoints",
    durationMs: 95,
    json: {
      event: "reservation.created",
      endpoints: 2,
      success: 2,
      retries: 0,
    },
  },
  {
    ts: "12:42:18.771",
    level: "ERROR",
    service: "Billing",
    correlationId: "req_01HZXBILL",
    message: "Stripe charge failed · card_declined",
    durationMs: 218,
    json: {
      provider: "stripe",
      error_code: "card_declined",
      decline_code: "insufficient_funds",
      customer_id: "cus_***REDACTED***",
      amount_cents: 12500,
      currency: "EUR",
    },
  },
  {
    ts: "12:42:19.002",
    level: "INFO",
    service: "API",
    correlationId: "req_01HZXBILL",
    message: "POST /v1/billing/charge → 402 Payment Required",
    durationMs: 220,
    json: {
      method: "POST",
      path: "/v1/billing/charge",
      status: 402,
      duration_ms: 220,
    },
  },
  {
    ts: "12:42:21.445",
    level: "WARN",
    service: "Queues",
    correlationId: "req_01HZXQUEUE",
    message: "DLQ depth en 'email-send' = 4 (> umbral 3)",
    durationMs: 1,
    json: {
      queue: "email-send",
      dlq_depth: 4,
      threshold: 3,
      oldest_message_age_s: 184,
    },
  },
  {
    ts: "12:42:25.118",
    level: "INFO",
    service: "API",
    correlationId: "req_01HZXLOOK",
    message: "GET /v1/reservations?date=2025-01-21 → 200 OK",
    durationMs: 28,
    json: {
      method: "GET",
      path: "/v1/reservations",
      status: 200,
      duration_ms: 28,
      cache: "MISS",
    },
  },
  {
    ts: "12:42:25.119",
    level: "INFO",
    service: "D1",
    correlationId: "req_01HZXLOOK",
    message: "SELECT FROM reservations WHERE date = ? (6ms) · 14 rows",
    durationMs: 6,
    json: {
      query: "SELECT * FROM reservations WHERE date = ?",
      duration_ms: 6,
      rows: 14,
      cache: "MISS",
    },
  },
  {
    ts: "12:42:30.871",
    level: "ERROR",
    service: "AI",
    correlationId: "req_01HZXAIMenu",
    message: "OpenAI timeout tras 30s · retrying (2/3)",
    durationMs: 30000,
    json: {
      provider: "openai",
      model: "gpt-4o",
      timeout_ms: 30000,
      attempt: 2,
      max_attempts: 3,
    },
  },
  {
    ts: "12:42:31.002",
    level: "INFO",
    service: "CRM",
    correlationId: "req_01HZXCRM1",
    message: "GET /v1/customers/cus_***REDACTED*** → 200 OK",
    durationMs: 14,
    json: {
      method: "GET",
      path: "/v1/customers/cus_***REDACTED***",
      status: 200,
      duration_ms: 14,
      cache: "HIT",
    },
  },
  {
    ts: "12:42:34.118",
    level: "WARN",
    service: "API",
    correlationId: "req_01HZXAUT1",
    message: "Auth retry: token expirado, refrescando (1/1)",
    durationMs: 88,
    json: {
      reason: "token_expired",
      refresh_attempts: 1,
      max_attempts: 1,
    },
  },
  {
    ts: "12:42:38.445",
    level: "INFO",
    service: "Webhooks",
    correlationId: "req_01HZXWHK1",
    message: "Webhook customer.updated entregado (3 intents, éxito final)",
    durationMs: 412,
    json: {
      event: "customer.updated",
      attempts: 3,
      final_status: "success",
      target: "https://partner-***.***",
    },
  },
  {
    ts: "12:42:42.001",
    level: "INFO",
    service: "Queues",
    correlationId: "req_01HZXBULK1",
    message: "Bulk enqueue 248 eventos reservation.created (batch)",
    durationMs: 18,
    json: {
      batch_size: 248,
      queue: "reservation-events",
      duration_ms: 18,
    },
  },
  {
    ts: "12:42:48.225",
    level: "ERROR",
    service: "D1",
    correlationId: "req_01HZXD1ERR",
    message: "Query timeout (10s) · SELECT FROM audit_logs JOIN …",
    durationMs: 10000,
    json: {
      query: "SELECT * FROM audit_logs JOIN ...",
      duration_ms: 10000,
      timeout_ms: 10000,
      d1_database: "restopanel-prod",
    },
  },
  {
    ts: "12:42:52.667",
    level: "INFO",
    service: "Billing",
    correlationId: "req_01HZXBIL2",
    message: "Invoice generado · INV-2025-0142 · €1,250.00",
    durationMs: 56,
    json: {
      invoice_id: "INV-2025-0142",
      amount_cents: 125000,
      currency: "EUR",
      customer_id: "cus_***REDACTED***",
    },
  },
];

const LOG_VOLUME_HOURS: { hour: string; volume: number; errors: number }[] = [
  { hour: "00", volume: 420, errors: 1 },
  { hour: "01", volume: 380, errors: 0 },
  { hour: "02", volume: 320, errors: 0 },
  { hour: "03", volume: 290, errors: 1 },
  { hour: "04", volume: 350, errors: 0 },
  { hour: "05", volume: 410, errors: 1 },
  { hour: "06", volume: 520, errors: 2 },
  { hour: "07", volume: 680, errors: 3 },
  { hour: "08", volume: 820, errors: 2 },
  { hour: "09", volume: 940, errors: 4 },
  { hour: "10", volume: 1120, errors: 5 },
  { hour: "11", volume: 1340, errors: 6 },
  { hour: "12", volume: 1480, errors: 8 },
  { hour: "13", volume: 1420, errors: 7 },
  { hour: "14", volume: 1380, errors: 12 },
  { hour: "15", volume: 1260, errors: 9 },
  { hour: "16", volume: 1180, errors: 5 },
  { hour: "17", volume: 1080, errors: 4 },
  { hour: "18", volume: 940, errors: 3 },
  { hour: "19", volume: 820, errors: 2 },
  { hour: "20", volume: 720, errors: 1 },
  { hour: "21", volume: 580, errors: 1 },
  { hour: "22", volume: 460, errors: 0 },
  { hour: "23", volume: 420, errors: 0 },
];

/* =====================================================================
 * Datos demo — Tracing
 * ===================================================================== */

const DEMO_TRACE: TraceSpan[] = [
  {
    id: "span-01",
    name: "API Gateway",
    service: "API",
    startMs: 0,
    durMs: 2,
    kind: "sync-gold",
    status: "success",
    kindLabel: "Sync · Gateway",
    attributes: {
      handler: "reservation.create",
      runtime: "cloudflare-workers",
      region: "eu-west-1",
    },
    events: ["request.received"],
  },
  {
    id: "span-02",
    name: "Auth Middleware",
    service: "API",
    startMs: 2,
    durMs: 4,
    kind: "sync-teal",
    status: "success",
    kindLabel: "Sync · Middleware",
    attributes: {
      provider: "jwt",
      token_kind: "refresh",
      rotations: 1,
    },
    events: ["jwt.verified", "token.refreshed"],
  },
  {
    id: "span-03",
    name: "Tenant Resolver",
    service: "API",
    startMs: 6,
    durMs: 3,
    kind: "sync-teal",
    status: "success",
    kindLabel: "Sync · Middleware",
    attributes: {
      tenant_id: "org_01HZX8K7Y9",
      strategy: "subdomain",
      cache: "HIT",
    },
    events: ["tenant.resolved"],
  },
  {
    id: "span-04",
    name: "RBAC Check",
    service: "API",
    startMs: 9,
    durMs: 2,
    kind: "sync-teal",
    status: "success",
    kindLabel: "Sync · Authorization",
    attributes: {
      role: "owner",
      permissions_required: "reservations:write",
      permissions_granted: "reservations:write",
    },
    events: ["rbac.pass"],
  },
  {
    id: "span-05",
    name: "Reservation Service",
    service: "API",
    startMs: 11,
    durMs: 12,
    kind: "sync-gold",
    status: "success",
    kindLabel: "Sync · Business Logic",
    attributes: {
      handler: "ReservationService.create",
      validation: "passed",
      conflicts_detected: 0,
    },
    events: ["validation.passed", "reservation.created"],
  },
  {
    id: "span-06",
    name: "D1 Query",
    service: "D1",
    startMs: 23,
    durMs: 8,
    kind: "sync-amber",
    status: "success",
    kindLabel: "Sync · Database",
    attributes: {
      query_kind: "INSERT … RETURNING",
      rows: 1,
      database: "restopanel-prod",
      binding_count: 12,
    },
    events: ["d1.execute", "d1.commit"],
  },
  {
    id: "span-07",
    name: "KV Cache Check",
    service: "API",
    startMs: 31,
    durMs: 1,
    kind: "sync-green",
    status: "success",
    kindLabel: "Sync · Cache",
    attributes: {
      namespace: "AVAILABILITY",
      key: "avail:rest_01HZX7:2025-01-21",
      result: "HIT",
    },
    events: ["kv.read"],
  },
  {
    id: "span-08",
    name: "CRM Update",
    service: "CRM",
    startMs: 32,
    durMs: 5,
    kind: "async-green",
    status: "success",
    kindLabel: "Async · via Queue",
    attributes: {
      queue: "crm-updates",
      consumer: "crm-worker",
      action: "tag_added",
    },
    events: ["queue.enqueued", "consumer.processed"],
    asyncViaQueue: true,
  },
  {
    id: "span-09",
    name: "Analytics Event",
    service: "Queues",
    startMs: 32,
    durMs: 1,
    kind: "async-green",
    status: "success",
    kindLabel: "Async · via Queue",
    attributes: {
      queue: "analytics",
      event: "reservation_created",
      sink: "workers-analytics",
    },
    events: ["queue.enqueued"],
    asyncViaQueue: true,
  },
  {
    id: "span-10",
    name: "Audit Log",
    service: "Queues",
    startMs: 32,
    durMs: 1,
    kind: "async-green",
    status: "success",
    kindLabel: "Async · via Queue",
    attributes: {
      queue: "audit",
      actor: "usr_***REDACTED***",
      action: "reservation.create",
    },
    events: ["queue.enqueued", "audit.persisted"],
    asyncViaQueue: true,
  },
  {
    id: "span-11",
    name: "Response Serialization",
    service: "API",
    startMs: 37,
    durMs: 2,
    kind: "sync-gold",
    status: "success",
    kindLabel: "Sync · Serialization",
    attributes: {
      serializer: "json",
      bytes: 1842,
      content_type: "application/json",
    },
    events: ["response.sent"],
  },
];

const DEMO_TRACE_TOTAL_MS = 42; // wall time (incluye async background)

const RECENT_TRACES: TraceSummary[] = [
  {
    correlationId: "req_01HZXABC",
    endpoint: "POST /v1/reservations",
    method: "POST",
    durationMs: 42,
    status: "success",
    spans: 11,
    when: "hace 8 min",
  },
  {
    correlationId: "req_01HZXBIL2",
    endpoint: "POST /v1/billing/invoices",
    method: "POST",
    durationMs: 56,
    status: "success",
    spans: 9,
    when: "hace 3 min",
  },
  {
    correlationId: "req_01HZXLOOK",
    endpoint: "GET /v1/reservations",
    method: "GET",
    durationMs: 28,
    status: "success",
    spans: 6,
    when: "hace 12 min",
  },
  {
    correlationId: "req_01HZXAIMenu",
    endpoint: "POST /v1/ai/menu/suggest",
    method: "POST",
    durationMs: 31200,
    status: "error",
    spans: 8,
    when: "hace 18 min",
  },
  {
    correlationId: "req_01HZXBILL",
    endpoint: "POST /v1/billing/charge",
    method: "POST",
    durationMs: 220,
    status: "error",
    spans: 7,
    when: "hace 22 min",
  },
  {
    correlationId: "req_01HZXCRM1",
    endpoint: "GET /v1/customers/cus_***",
    method: "GET",
    durationMs: 14,
    status: "success",
    spans: 5,
    when: "hace 31 min",
  },
  {
    correlationId: "req_01HZXWHK1",
    endpoint: "POST /v1/webhooks/dispatch",
    method: "POST",
    durationMs: 412,
    status: "success",
    spans: 8,
    when: "hace 38 min",
  },
  {
    correlationId: "req_01HZXBULK1",
    endpoint: "POST /v1/bulk/reservations",
    method: "POST",
    durationMs: 184,
    status: "success",
    spans: 13,
    when: "hace 44 min",
  },
  {
    correlationId: "req_01HZXD1ERR",
    endpoint: "GET /v1/audit/logs",
    method: "GET",
    durationMs: 10000,
    status: "error",
    spans: 6,
    when: "hace 51 min",
  },
  {
    correlationId: "req_01HZXAUT1",
    endpoint: "POST /v1/auth/refresh",
    method: "POST",
    durationMs: 88,
    status: "success",
    spans: 5,
    when: "hace 1 h",
  },
];

/* =====================================================================
 * Datos demo — Alertas
 * ===================================================================== */

const ACTIVE_ALERTS: Alert[] = [
  {
    id: "ALT-001",
    severity: "high",
    rule: "API p95 > 200ms",
    description: "Latencia p95 de la API por encima del umbral durante 5 min.",
    currentValue: "234ms",
    threshold: "200ms",
    triggeredAt: "hace 2 min",
    status: "firing",
    assignee: "Sistema",
  },
  {
    id: "ALT-002",
    severity: "medium",
    rule: "Queue email depth > 100",
    description: "Profundidad de la cola 'email-send' por encima del umbral.",
    currentValue: "127 msg",
    threshold: "100 msg",
    triggeredAt: "hace 5 min",
    status: "firing",
    assignee: "Sin asignar",
  },
  {
    id: "ALT-003",
    severity: "critical",
    rule: "D1 error rate > 1%",
    description: "Tasa de error en D1 superó el 1% durante la ventana.",
    currentValue: "0.3%",
    threshold: "1%",
    triggeredAt: "hace 15 min",
    status: "resolved",
    assignee: "P. Núñez",
  },
  {
    id: "ALT-004",
    severity: "low",
    rule: "Cache hit ratio < 80%",
    description: "Hit ratio de cache KV por debajo del umbral (monitorización).",
    currentValue: "94%",
    threshold: "80%",
    triggeredAt: "hace 25 min",
    status: "monitoring",
    assignee: "Sistema",
  },
  {
    id: "ALT-005",
    severity: "high",
    rule: "AI cost > €50/day",
    description: "Coste diario de IA acercándose al umbral (monitorización).",
    currentValue: "€42",
    threshold: "€50",
    triggeredAt: "hace 32 min",
    status: "monitoring",
    assignee: "Sistema",
  },
  {
    id: "ALT-006",
    severity: "medium",
    rule: "Webhook delivery failure > 5%",
    description: "Tasa de fallo en entrega de webhooks (monitorización).",
    currentValue: "2.1%",
    threshold: "5%",
    triggeredAt: "hace 41 min",
    status: "monitoring",
    assignee: "Sistema",
  },
];

const ALERT_RULES: AlertRule[] = [
  {
    id: "rule-1",
    name: "API p95 latency",
    metric: "api.latency.p95",
    condition: ">",
    threshold: "200ms",
    window: "5m",
    severity: "high",
    enabled: true,
    cooldown: "10m",
    lastTriggered: "hace 2 min",
  },
  {
    id: "rule-2",
    name: "Queue email depth",
    metric: "queue.email.depth",
    condition: ">",
    threshold: "100 msg",
    window: "1m",
    severity: "medium",
    enabled: true,
    cooldown: "5m",
    lastTriggered: "hace 5 min",
  },
  {
    id: "rule-3",
    name: "D1 error rate",
    metric: "d1.error_rate",
    condition: ">",
    threshold: "1%",
    window: "5m",
    severity: "critical",
    enabled: true,
    cooldown: "30m",
    lastTriggered: "hace 15 min",
  },
  {
    id: "rule-4",
    name: "Cache hit ratio",
    metric: "kv.hit_ratio",
    condition: "<",
    threshold: "80%",
    window: "10m",
    severity: "low",
    enabled: true,
    cooldown: "15m",
    lastTriggered: "hace 25 min",
  },
  {
    id: "rule-5",
    name: "AI daily cost",
    metric: "ai.cost.daily",
    condition: ">",
    threshold: "€50",
    window: "24h",
    severity: "high",
    enabled: true,
    cooldown: "1h",
    lastTriggered: "hace 32 min",
  },
  {
    id: "rule-6",
    name: "Webhook failure rate",
    metric: "webhooks.failure_rate",
    condition: ">",
    threshold: "5%",
    window: "5m",
    severity: "medium",
    enabled: true,
    cooldown: "15m",
    lastTriggered: "hace 41 min",
  },
  {
    id: "rule-7",
    name: "Worker CPU time",
    metric: "workers.cpu_ms",
    condition: ">",
    threshold: "50ms",
    window: "5m",
    severity: "medium",
    enabled: false,
    cooldown: "10m",
    lastTriggered: "hace 2 días",
  },
  {
    id: "rule-8",
    name: "R2 5xx rate",
    metric: "r2.5xx_rate",
    condition: ">",
    threshold: "1%",
    window: "5m",
    severity: "high",
    enabled: true,
    cooldown: "30m",
    lastTriggered: "hace 6 días",
  },
];

const ALERT_HISTORY: {
  ts: string;
  rule: string;
  severity: AlertSeverity;
  duration: string;
  resolvedBy: string;
}[] = [
  {
    ts: "hoy 12:18",
    rule: "API p95 > 200ms",
    severity: "high",
    duration: "8 min",
    resolvedBy: "Auto-remediación",
  },
  {
    ts: "hoy 11:42",
    rule: "Queue email depth > 100",
    severity: "medium",
    duration: "14 min",
    resolvedBy: "A. Martínez",
  },
  {
    ts: "hoy 10:55",
    rule: "D1 error rate > 1%",
    severity: "critical",
    duration: "23 min",
    resolvedBy: "P. Núñez",
  },
  {
    ts: "hoy 09:14",
    rule: "Cache hit ratio < 80%",
    severity: "low",
    duration: "31 min",
    resolvedBy: "Auto-remediación",
  },
  {
    ts: "ayer 22:38",
    rule: "Webhook delivery failure > 5%",
    severity: "medium",
    duration: "47 min",
    resolvedBy: "A. Martínez",
  },
  {
    ts: "ayer 19:02",
    rule: "AI cost > €50/day",
    severity: "high",
    duration: "1 h 12 min",
    resolvedBy: "P. Núñez",
  },
  {
    ts: "ayer 14:48",
    rule: "Worker CPU time > 50ms",
    severity: "medium",
    duration: "9 min",
    resolvedBy: "Auto-remediación",
  },
  {
    ts: "ayer 11:20",
    rule: "R2 5xx rate > 1%",
    severity: "high",
    duration: "17 min",
    resolvedBy: "Sistema",
  },
  {
    ts: "ayer 08:55",
    rule: "Queue email depth > 100",
    severity: "medium",
    duration: "6 min",
    resolvedBy: "Auto-remediación",
  },
  {
    ts: "anteayer 23:12",
    rule: "API p95 > 200ms",
    severity: "high",
    duration: "12 min",
    resolvedBy: "A. Martínez",
  },
];

/* =====================================================================
 * Datos demo — Incidentes
 * ===================================================================== */

const ACTIVE_INCIDENTS: Incident[] = [
  {
    id: "INC-2025-001",
    severity: "high",
    title: "Degradación de latencia en API (p95 elevado)",
    status: "investigating",
    impact: "Reservas lentas en EU · 14 organizaciones afectadas",
    services: ["API", "D1"],
    orgs: 14,
    createdAt: "hoy 12:18",
    timeline: [
      { ts: "12:18", label: "Creado · alerta ALT-001 disparada", done: true },
      { ts: "12:20", label: "Investigando · equipo SRE notificado", done: true },
      { ts: "12:25", label: "Identificado · hot-spot en D1 audit_logs JOIN", done: true },
      { ts: "12:32", label: "Monitorizando · índice añadido", done: false },
      { ts: "—", label: "Resuelto · pendiente", done: false },
    ],
    assignee: "P. Núñez (SRE Lead)",
    aiSummary:
      "El p95 subió a 234ms tras un pico de lecturas en audit_logs. Se identificó un query sin índice tras despliegue 14:00. Recomendación: añadir índice en (tenant_id, created_at) y degradar la consulta de auditoría a una réplica lectura-only. La tendencia ya revirtió tras el fix (p95 = 198ms).",
  },
];

const RECENT_INCIDENTS: {
  id: string;
  title: string;
  severity: AlertSeverity;
  duration: string;
  impact: string;
  resolution: string;
  postmortem: boolean;
}[] = [
  {
    id: "INC-2024-118",
    title: "Caída de entrega de webhooks (15 min)",
    severity: "medium",
    duration: "47 min",
    impact: "Webhooks de reservas retrasados en 9 orgs",
    resolution: "Reintentos automáticos + escalado de consumer",
    postmortem: true,
  },
  {
    id: "INC-2024-117",
    title: "D1 read timeout en hora pico",
    severity: "high",
    duration: "23 min",
    impact: "Lecturas lentas en 22 orgs",
    resolution: "Pool de conexiones reconfigurado + cache KV",
    postmortem: true,
  },
  {
    id: "INC-2024-116",
    title: "OpenAI rate-limit sostenido (8 min)",
    severity: "medium",
    duration: "12 min",
    impact: "IA Menú degradada, fallback a gpt-4o-mini",
    resolution: "Circuit breaker + cooldown automático",
    postmortem: true,
  },
  {
    id: "INC-2024-115",
    title: "Facturación Stripe 502 (4 min)",
    severity: "critical",
    duration: "9 min",
    impact: "Cobros fallidos en 3 orgs",
    resolution: "Rollback de integración + reintento",
    postmortem: true,
  },
  {
    id: "INC-2024-114",
    title: "KV namespace hot-key",
    severity: "low",
    duration: "31 min",
    impact: "Cache misses incrementados",
    resolution: "Sharding de claves + TTL adaptativo",
    postmortem: false,
  },
  {
    id: "INC-2024-113",
    title: "R2 5xx en región EU",
    severity: "high",
    duration: "17 min",
    impact: "Uploads de branding fallidos en 6 orgs",
    resolution: "Failover a región US · re-sincronización R2",
    postmortem: true,
  },
];

/* =====================================================================
 * Sub-componentes UI
 * ===================================================================== */

function GlassPanel({
  children,
  className,
  strong,
}: {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
}) {
  return (
    <div
      className={cn(
        strong ? "rp-glass-strong" : "rp-glass",
        "rounded-2xl p-4 sm:p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

function MiniStat({
  label,
  value,
  sub,
  trend,
  accent = "gold",
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  trend?: "up" | "down" | "flat";
  accent?: "gold" | "teal" | "fg" | "red" | "green" | "amber";
}) {
  const colorMap: Record<string, string> = {
    gold: "rp-gold-text",
    teal: "rp-teal-text",
    fg: "text-foreground",
    red: "text-red-300",
    green: "text-emerald-300",
    amber: "text-amber-300",
  };
  const trendIcon =
    trend === "up" ? (
      <ArrowUpRight className="h-3 w-3 text-emerald-400" aria-hidden />
    ) : trend === "down" ? (
      <ArrowDownRight className="h-3 w-3 text-red-400" aria-hidden />
    ) : trend === "flat" ? (
      <Minus className="h-3 w-3 text-muted-foreground" aria-hidden />
    ) : null;
  return (
    <GlassPanel className="p-3 sm:p-4">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className={cn("font-display text-xl sm:text-2xl font-light", colorMap[accent])}>
          {value}
        </span>
        {trendIcon}
      </div>
      {sub ? <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div> : null}
    </GlassPanel>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </div>
  );
}

/* =====================================================================
 * SVG Charts
 * ===================================================================== */

function LogVolumeChart() {
  const W = 760;
  const H = 160;
  const padL = 28;
  const padB = 22;
  const padT = 12;
  const padR = 8;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const max = Math.max(...LOG_VOLUME_HOURS.map((h) => h.volume));
  const barW = innerW / LOG_VOLUME_HOURS.length;

  function colorFor(errorRatio: number) {
    if (errorRatio > 0.005) return "#ef4444";
    if (errorRatio > 0.002) return "#f59e0b";
    return "#3DD6C9";
  }

  return (
    <div className="overflow-x-auto rp-scroll-thin">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full min-w-[560px] h-auto"
        role="img"
        aria-label="Volumen de logs por hora (24h) · coloreado por ratio de error"
      >
        {/* axis */}
        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} className="stroke-border" strokeWidth={1} />
        <line x1={padL} y1={padT} x2={padL} y2={H - padB} className="stroke-border" strokeWidth={1} />
        {/* grid */}
        {[0.25, 0.5, 0.75, 1].map((p) => (
          <line
            key={p}
            x1={padL}
            x2={W - padR}
            y1={padT + innerH * (1 - p)}
            y2={padT + innerH * (1 - p)}
            className="stroke-border/40"
            strokeWidth={1}
            strokeDasharray="2 4"
          />
        ))}
        {/* bars */}
        {LOG_VOLUME_HOURS.map((h, i) => {
          const x = padL + i * barW + 2;
          const bw = barW - 4;
          const bh = (h.volume / max) * innerH;
          const y = padT + innerH - bh;
          const errRatio = h.errors / Math.max(h.volume, 1);
          return (
            <g key={h.hour}>
              <rect
                x={x}
                y={y}
                width={bw}
                height={bh}
                rx={1.5}
                fill={colorFor(errRatio)}
                opacity={0.85}
              />
              <title>{`${h.hour}:00 · ${h.volume} logs · ${h.errors} errores`}</title>
            </g>
          );
        })}
        {/* hour labels (every 3) */}
        {LOG_VOLUME_HOURS.map((h, i) =>
          i % 3 === 0 ? (
            <text
              key={`lbl-${h.hour}`}
              x={padL + i * barW + barW / 2}
              y={H - padB + 12}
              className="fill-muted-foreground"
              fontSize={9}
              textAnchor="middle"
            >
              {h.hour}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}

function LineChart({
  series,
  unit,
  height = 140,
  yMax,
  formatY,
}: {
  series: { label: string; color: string; values: number[] }[];
  unit: string;
  height?: number;
  yMax?: number;
  formatY?: (n: number) => string;
}) {
  const W = 480;
  const H = height;
  const padL = 32;
  const padB = 22;
  const padT = 10;
  const padR = 10;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const n = series[0]?.values.length ?? 0;
  const allVals = series.flatMap((s) => s.values);
  const max = yMax ?? Math.max(...allVals, 1);
  const stepX = n > 1 ? innerW / (n - 1) : innerW;

  return (
    <div className="overflow-x-auto rp-scroll-thin">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full min-w-[420px] h-auto"
        role="img"
        aria-label={`Línea temporal · ${series.map((s) => s.label).join(", ")}`}
      >
        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} className="stroke-border" strokeWidth={1} />
        <line x1={padL} y1={padT} x2={padL} y2={H - padB} className="stroke-border" strokeWidth={1} />
        {/* y labels */}
        {[0, 0.5, 1].map((p) => (
          <text
            key={p}
            x={padL - 4}
            y={padT + innerH * (1 - p) + 3}
            textAnchor="end"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {formatY ? formatY(max * p) : Math.round(max * p)}
          </text>
        ))}
        {/* grid */}
        {[0.5, 1].map((p) => (
          <line
            key={p}
            x1={padL}
            x2={W - padR}
            y1={padT + innerH * (1 - p)}
            y2={padT + innerH * (1 - p)}
            className="stroke-border/40"
            strokeWidth={1}
            strokeDasharray="2 4"
          />
        ))}
        {/* lines */}
        {series.map((s) => {
          const pts = s.values.map((v, i) => {
            const x = padL + i * stepX;
            const y = padT + innerH * (1 - Math.min(v / max, 1));
            return `${x},${y}`;
          });
          return (
            <g key={s.label}>
              <polyline
                points={pts.join(" ")}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {/* end dot */}
              <circle
                cx={padL + (n - 1) * stepX}
                cy={padT + innerH * (1 - Math.min(s.values[n - 1] / max, 1))}
                r={3}
                fill={s.color}
              />
            </g>
          );
        })}
        {/* x labels */}
        {[0, Math.floor(n / 2), n - 1].map((i) => (
          <text
            key={i}
            x={padL + i * stepX}
            y={H - padB + 12}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {`-${(n - 1 - i) * 5}m`}
          </text>
        ))}
        <text x={W - padR} y={padT + 8} textAnchor="end" className="fill-muted-foreground" fontSize={9}>
          {unit}
        </text>
      </svg>
      {/* legend */}
      <div className="mt-2 flex items-center gap-3 flex-wrap text-[10px] text-muted-foreground">
        {series.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} aria-hidden />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function BarChartMini({
  data,
  unit,
  height = 140,
}: {
  data: { label: string; value: number; color?: string }[];
  unit: string;
  height?: number;
}) {
  const W = 480;
  const H = height;
  const padL = 32;
  const padB = 22;
  const padT = 10;
  const padR = 10;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const max = Math.max(...data.map((d) => d.value), 1);
  const barW = innerW / data.length;

  return (
    <div className="overflow-x-auto rp-scroll-thin">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[420px] h-auto" role="img" aria-label="Gráfico de barras">
        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} className="stroke-border" strokeWidth={1} />
        <line x1={padL} y1={padT} x2={padL} y2={H - padB} className="stroke-border" strokeWidth={1} />
        {[0, 0.5, 1].map((p) => (
          <text key={p} x={padL - 4} y={padT + innerH * (1 - p) + 3} textAnchor="end" className="fill-muted-foreground" fontSize={9}>
            {(max * p).toFixed(1)}
          </text>
        ))}
        {data.map((d, i) => {
          const x = padL + i * barW + 4;
          const bw = barW - 8;
          const bh = (d.value / max) * innerH;
          const y = padT + innerH - bh;
          return (
            <g key={d.label}>
              <rect x={x} y={y} width={bw} height={bh} rx={2} fill={d.color ?? "#3DD6C9"} opacity={0.85}>
                <title>{`${d.label} · ${d.value}${unit}`}</title>
              </rect>
              <text x={x + bw / 2} y={H - padB + 12} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
                {d.label}
              </text>
            </g>
          );
        })}
        <text x={W - padR} y={padT + 8} textAnchor="end" className="fill-muted-foreground" fontSize={9}>
          {unit}
        </text>
      </svg>
    </div>
  );
}

function DonutChart({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const R = 56;
  const C = 2 * Math.PI * R;
  // Pre-compute cumulative offset per segment (avoid mutating during render)
  // offsets[i] = sum of fractions for segments[0..i-1]
  const fracs = segments.map((s) => s.value / total);
  const offsets = fracs.map((_, i) =>
    fracs.slice(0, i).reduce((sum, f) => sum + f, 0),
  );
  const viewBox = 160;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <svg viewBox={`0 0 ${viewBox} ${viewBox}`} className="h-32 w-32 shrink-0" role="img" aria-label="Distribución de códigos de estado HTTP">
        <g transform={`translate(${viewBox / 2}, ${viewBox / 2}) rotate(-90)`}>
          <circle r={R} cx={0} cy={0} fill="none" className="stroke-border/60" strokeWidth={14} />
          {segments.map((s, i) => {
            const frac = s.value / total;
            const dash = frac * C;
            return (
              <circle
                key={s.label}
                r={R}
                cx={0}
                cy={0}
                fill="none"
                stroke={s.color}
                strokeWidth={14}
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={-offsets[i] * C}
                strokeLinecap="butt"
              />
            );
          })}
        </g>
        <text x={viewBox / 2} y={viewBox / 2} textAnchor="middle" className="fill-foreground" fontSize={14} fontWeight={500}>
          {total.toLocaleString("es-ES")}
        </text>
        <text x={viewBox / 2} y={viewBox / 2 + 14} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
          total
        </text>
      </svg>
      <ul className="space-y-1.5 text-xs w-full">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded" style={{ background: s.color }} aria-hidden />
              {s.label}
            </span>
            <span className="font-mono">
              {s.value.toLocaleString("es-ES")}
              <span className="text-muted-foreground ml-1">
                ({Math.round((s.value / total) * 100)}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TraceWaterfall({
  spans,
  totalMs,
}: {
  spans: TraceSpan[];
  totalMs: number;
}) {
  const reduce = useReducedMotion();
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const W = 760;
  const rowH = 34;
  const padL = 200;
  const padR = 12;
  const padT = 22;
  const innerW = W - padL - padR;
  const H = padT + spans.length * rowH + 14;

  return (
    <div className="overflow-x-auto rp-scroll-thin">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full min-w-[640px] h-auto"
        role="img"
        aria-label={`Trazas distribuidas · waterfall con ${spans.length} spans · total ${totalMs}ms`}
      >
        <defs>
          <linearGradient id="span-gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A8862A" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
          <linearGradient id="span-teal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2BA89E" />
            <stop offset="100%" stopColor="#3DD6C9" />
          </linearGradient>
          <linearGradient id="span-amber" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#E8C766" />
          </linearGradient>
          <linearGradient id="span-green" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
        </defs>
        {/* axis */}
        <line x1={padL} y1={padT - 6} x2={W - padR} y2={padT - 6} className="stroke-border" strokeWidth={1} />
        {/* time ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <g key={p}>
            <line
              x1={padL + innerW * p}
              x2={padL + innerW * p}
              y1={padT - 6}
              y2={H - 6}
              className="stroke-border/30"
              strokeWidth={1}
              strokeDasharray="2 4"
            />
            <text
              x={padL + innerW * p}
              y={padT - 10}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={9}
            >
              {Math.round(p * totalMs)}ms
            </text>
          </g>
        ))}
        {/* spans */}
        {spans.map((s, i) => {
          const y = padT + i * rowH;
          const x = padL + (s.startMs / totalMs) * innerW;
          const w = Math.max((s.durMs / totalMs) * innerW, 2);
          const grad =
            s.kind === "sync-gold"
              ? "url(#span-gold)"
              : s.kind === "sync-teal"
              ? "url(#span-teal)"
              : s.kind === "sync-amber"
              ? "url(#span-amber)"
              : "url(#span-green)";
          const isOpen = expanded === s.id;
          return (
            <g
              key={s.id}
              transform={`translate(0, ${y})`}
              className="cursor-pointer"
              onClick={() => setExpanded(isOpen ? null : s.id)}
              role="button"
              aria-label={`Span ${s.name} · ${s.durMs}ms · ${s.status}`}
            >
              {/* row bg */}
              <rect x={0} y={0} width={W} height={rowH - 2} className="fill-transparent" />
              {/* label */}
              <text x={padL - 8} y={14} textAnchor="end" className="fill-foreground" fontSize={11} fontWeight={500}>
                {s.name}
              </text>
              <text x={padL - 8} y={26} textAnchor="end" className="fill-muted-foreground" fontSize={9}>
                {s.kindLabel}
              </text>
              {/* async queue marker */}
              {s.asyncViaQueue && (
                <text x={padL - 8} y={36} textAnchor="end" className="fill-emerald-300" fontSize={8} fontStyle="italic">
                  ↳ queue
                </text>
              )}
              {/* bar */}
              <rect
                x={x}
                y={6}
                width={w}
                height={rowH - 14}
                rx={3}
                fill={grad}
                opacity={0.9}
                stroke={s.status === "error" ? "#ef4444" : "none"}
                strokeWidth={s.status === "error" ? 1.5 : 0}
              >
                {!reduce && (
                  <animate
                    attributeName="opacity"
                    values="0.9;0.6;0.9"
                    dur="2.4s"
                    begin={`${i * 0.15}s`}
                    repeatCount="indefinite"
                  />
                )}
                <title>{`${s.name} · ${s.startMs}→${s.startMs + s.durMs}ms · ${s.durMs}ms · ${s.status}`}</title>
              </rect>
              {/* duration label */}
              {w > 30 && (
                <text
                  x={x + w / 2}
                  y={rowH / 2 + 3}
                  textAnchor="middle"
                  className="fill-black"
                  fontSize={10}
                  fontWeight={600}
                >
                  {s.durMs}ms
                </text>
              )}
              {/* expand arrow */}
              <text x={padL + innerW + 4} y={rowH / 2 + 3} className="fill-muted-foreground" fontSize={9}>
                {isOpen ? "▾" : "▸"}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Expanded span detail */}
      <AnimatePresence initial={false}>
        {expanded && (() => {
          const s = spans.find((x) => x.id === expanded);
          if (!s) return null;
          return (
            <motion.div
              key={`det-${s.id}`}
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduce ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 rp-glass rounded-xl p-4 overflow-hidden"
            >
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className="font-mono text-xs text-[var(--gold)]">{s.id}</span>
                <span className="text-sm font-medium text-foreground">{s.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded border border-border/60 bg-foreground/5 text-muted-foreground">
                  {s.kindLabel}
                </span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded border",
                    s.status === "success"
                      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                      : "border-red-400/50 bg-red-400/10 text-red-300",
                  )}
                >
                  {s.status === "success" ? "OK" : "ERROR"}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded border border-border/60 bg-foreground/5 text-muted-foreground font-mono">
                  {s.startMs}→{s.startMs + s.durMs}ms ({s.durMs}ms)
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded border border-border/60 bg-foreground/5 text-muted-foreground font-mono">
                  service: {s.service}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                    Attributes (OpenTelemetry)
                  </div>
                  <dl className="space-y-1 text-xs">
                    {Object.entries(s.attributes).map(([k, v]) => (
                      <div key={k} className="flex items-start justify-between gap-3 py-0.5 border-b border-border/30">
                        <dt className="font-mono text-muted-foreground">{k}</dt>
                        <dd className="font-mono text-foreground text-right break-all">{String(v)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                    Events
                  </div>
                  <ul className="space-y-1 text-xs">
                    {s.events.map((e, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--teal)]" />
                        <span className="font-mono">{e}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

/* =====================================================================
 * TAB: Logs
 * ===================================================================== */

function LogsTab({
  onGoTrace,
}: {
  onGoTrace: (corrId: string) => void;
}) {
  const reduce = useReducedMotion();
  const [levelFilter, setLevelFilter] = React.useState<"all" | LogLevel>("all");
  const [serviceFilter, setServiceFilter] = React.useState<"all" | LogService>("all");
  const [search, setSearch] = React.useState("");
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    return LOGS.filter((l) => {
      if (levelFilter !== "all" && l.level !== levelFilter) return false;
      if (serviceFilter !== "all" && l.service !== serviceFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!l.correlationId.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [levelFilter, serviceFilter, search]);

  const counts = React.useMemo(() => {
    return {
      total: LOGS.length,
      info: LOGS.filter((l) => l.level === "INFO").length,
      warn: LOGS.filter((l) => l.level === "WARN").length,
      error: LOGS.filter((l) => l.level === "ERROR").length,
    };
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat label="Logs (24h)" value={counts.total.toLocaleString("es-ES")} sub="demo · 18 visibles" trend="flat" accent="fg" />
        <MiniStat label="INFO" value={counts.info} sub="traza normal" trend="up" accent="teal" />
        <MiniStat label="WARN" value={counts.warn} sub="atención requerida" trend="up" accent="amber" />
        <MiniStat label="ERROR" value={counts.error} sub="investigar" trend="up" accent="red" />
      </div>

      {/* Log volume chart */}
      <GlassPanel>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <div>
            <SectionLabel>Volumen de logs · 24h</SectionLabel>
            <p className="text-xs text-muted-foreground">Coloreado por ratio de error por hora.</p>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-[var(--teal)]" aria-hidden /> Bajo error
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-amber-400" aria-hidden /> Medio
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-red-500" aria-hidden /> Alto error
            </span>
          </div>
        </div>
        <LogVolumeChart />
      </GlassPanel>

      {/* Filters */}
      <GlassPanel>
        <SectionLabel>Filtros · log stream en tiempo real</SectionLabel>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {/* Level filter */}
          <div className="flex items-center rounded-md border border-border/60 p-0.5 overflow-x-auto rp-scroll-thin">
            {(["all", "INFO", "WARN", "ERROR"] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={cn(
                  "min-h-[36px] px-3 py-1.5 rounded text-xs transition-colors shrink-0",
                  levelFilter === lvl
                    ? "bg-[var(--gold)] text-black font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-pressed={levelFilter === lvl}
              >
                {lvl === "all" ? "Todos" : lvl}
              </button>
            ))}
          </div>
          {/* Service filter */}
          <Select value={serviceFilter} onValueChange={(v) => setServiceFilter(v as "all" | LogService)}>
            <SelectTrigger className="h-9 w-full sm:w-[180px] text-xs" aria-label="Filtrar por servicio">
              <SelectValue placeholder="Servicio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los servicios</SelectItem>
              {(["API", "D1", "Queues", "AI", "CRM", "Billing", "Webhooks"] as const).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Search by correlation_id */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por correlation_id…"
              className="h-9 pl-8 text-xs font-mono"
              aria-label="Buscar por correlation_id"
            />
          </div>
          <span className="text-[11px] text-muted-foreground font-mono shrink-0">
            {filtered.length}/{LOGS.length} entradas
          </span>
        </div>
      </GlassPanel>

      {/* Log stream */}
      <GlassPanel className="p-0 sm:p-0">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 pt-4 pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
            <span className="text-xs font-medium text-foreground">Log stream en vivo</span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">tail -f</span>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">UTC+1 · 2025-01-21</span>
        </div>
        <ul className="divide-y divide-border/40 max-h-[640px] overflow-y-auto rp-scroll-thin">
          <AnimatePresence initial={false}>
            {filtered.map((l, i) => {
              const isOpen = expanded === `${i}`;
              return (
                <motion.li
                  key={`${l.ts}-${i}`}
                  layout={reduce ? false : true}
                  initial={reduce ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs"
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : `${i}`)}
                    className="w-full text-left p-3 sm:p-4 hover:bg-foreground/[0.025] transition-colors flex items-start gap-3"
                    aria-expanded={isOpen}
                  >
                    <span className="font-mono text-[11px] text-muted-foreground shrink-0 mt-0.5 hidden sm:inline">
                      {l.ts}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase shrink-0",
                        LEVEL_STYLES[l.level],
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", LEVEL_DOT[l.level])} aria-hidden />
                      {l.level}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-mono shrink-0",
                        SERVICE_STYLES[l.service],
                      )}
                    >
                      {l.service}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-foreground text-xs sm:text-[13px] break-words">
                        {l.message}
                      </div>
                      <div className="mt-1 flex items-center gap-2 flex-wrap text-[10px] text-muted-foreground">
                        <code className="font-mono">{l.correlationId}</code>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden />
                          {l.durationMs}ms
                        </span>
                        <span className="text-muted-foreground/60">·</span>
                        <span className="inline-flex items-center gap-1 text-[var(--teal)] hover:text-[var(--gold-soft)] transition-colors" onClick={(e) => { e.stopPropagation(); onGoTrace(l.correlationId); }}>
                          <GitBranch className="h-3 w-3" aria-hidden />
                          Ver traza
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform mt-0.5", isOpen && "rotate-90")} aria-hidden />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={reduce ? false : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={reduce ? undefined : { opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 sm:px-5 pb-4">
                          <div className="rounded-lg border border-border/40 bg-black/40 p-3 overflow-x-auto rp-scroll-thin">
                            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                              <FileJson className="h-3 w-3" aria-hidden />
                              JSON estructurado · PII redactada
                            </div>
                            <pre className="text-[11px] font-mono text-foreground/85 leading-relaxed">
{MaskPII(JSON.stringify(l.json, null, 2))}
                            </pre>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && (
            <li className="p-10 text-center text-xs text-muted-foreground">
              No hay logs que coincidan con los filtros.
            </li>
          )}
        </ul>
      </GlassPanel>

      <p className="text-[11px] text-muted-foreground">
        Logs estructurados JSON · PII redactada por allowlist · Retención 30 días · correlation_id propagado end-to-end.
      </p>
    </div>
  );
}

/* =====================================================================
 * TAB: Tracing
 * ===================================================================== */

function TracingTab({
  presetCorrelation,
}: {
  presetCorrelation: string;
}) {
  const reduce = useReducedMotion();
  const [query, setQuery] = React.useState(presetCorrelation);
  const [activeCorr, setActiveCorr] = React.useState(presetCorrelation);

  React.useEffect(() => {
    setQuery(presetCorrelation);
    setActiveCorr(presetCorrelation);
  }, [presetCorrelation]);

  const slowest = React.useMemo(() => {
    return [...RECENT_TRACES].sort((a, b) => b.durationMs - a.durationMs).slice(0, 5);
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat label="Spans / trace (avg)" value="8.4" sub="instrumentación completa" trend="flat" accent="gold" />
        <MiniStat label="Latencia trace (p50)" value="42ms" sub="correlation_id propagado" trend="down" accent="teal" />
        <MiniStat label="Latencia trace (p95)" value="312ms" sub="objetivo <200ms" trend="up" accent="amber" />
        <MiniStat label="Traces / min" value="64" sub="última hora" trend="up" accent="fg" />
      </div>

      {/* Trace search */}
      <GlassPanel>
        <SectionLabel>Buscador de trazas distribuidas</SectionLabel>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="correlation_id o request_id… (ej: req_01HZXABC)"
              className="h-9 pl-8 font-mono text-xs"
              aria-label="Buscar traza por correlation_id"
            />
          </div>
          <Button
            onClick={() => setActiveCorr(query.trim() || presetCorrelation)}
            className="h-9 shrink-0"
            size="sm"
          >
            <GitBranch className="h-3.5 w-3.5 mr-1.5" aria-hidden />
            Cargar traza
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Traza activa: <code className="font-mono text-[var(--gold)]">{activeCorr}</code> · 11 spans · total wall 42ms
        </p>
      </GlassPanel>

      {/* Waterfall */}
      <GlassPanel>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <div>
            <SectionLabel>Waterfall · traza distribuida</SectionLabel>
            <p className="text-xs text-muted-foreground">
              POST <code className="font-mono">/v1/reservations</code> → 201 Created · spans secuenciales y async (Queue)
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-3 rounded-sm" style={{ background: "#D4AF37" }} aria-hidden /> Sync · gateway/lógica
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-3 rounded-sm" style={{ background: "#3DD6C9" }} aria-hidden /> Sync · middleware
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-3 rounded-sm" style={{ background: "#E8C766" }} aria-hidden /> Sync · D1
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-3 rounded-sm" style={{ background: "#34D399" }} aria-hidden /> Async · via Queue
            </span>
          </div>
        </div>
        <TraceWaterfall spans={DEMO_TRACE} totalMs={DEMO_TRACE_TOTAL_MS} />
        <div className="mt-3 flex items-center justify-between gap-3 flex-wrap text-xs">
          <span className="text-muted-foreground">
            Total: <span className="font-mono text-foreground">{DEMO_TRACE_TOTAL_MS}ms</span> ·{" "}
            <span className="text-emerald-300">sync path 34ms</span> ·{" "}
            <span className="text-emerald-300">async background +8ms</span>
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => toast({ title: "Trazas exportadas (demo)", description: "OTLP JSON · 11 spans" })}
          >
            <ExternalLink className="h-3 w-3 mr-1.5" aria-hidden />
            Exportar OTLP
          </Button>
        </div>
      </GlassPanel>

      <p className="text-[11px] text-muted-foreground">
        OpenTelemetry instrumentado en cada Worker, API, Queue y llamada IA · Correlation IDs propagados end-to-end.
      </p>

      {/* Trace list + slowest */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassPanel>
          <SectionLabel>Traces recientes</SectionLabel>
          <ul className="divide-y divide-border/40 max-h-[420px] overflow-y-auto rp-scroll-thin">
            {RECENT_TRACES.map((t) => (
              <li key={t.correlationId} className="p-2.5 hover:bg-foreground/[0.025] transition-colors">
                <button
                  onClick={() => { setQuery(t.correlationId); setActiveCorr(t.correlationId); }}
                  className="w-full text-left flex items-center gap-3"
                  aria-label={`Cargar traza ${t.correlationId}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="font-mono text-[11px] text-[var(--gold)]">{t.correlationId}</code>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border/60 bg-foreground/5 text-muted-foreground">
                        {t.method}
                      </span>
                      <span className="text-xs text-foreground/80 truncate">{t.endpoint}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{t.when}</span>
                      <span>·</span>
                      <span>{t.spans} spans</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        t.status === "success" ? "bg-emerald-400" : "bg-red-400",
                      )}
                      aria-hidden
                    />
                    <span className="font-mono text-xs text-foreground">{t.durationMs}ms</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </GlassPanel>

        <GlassPanel>
          <SectionLabel>Traces más lentas (top 5)</SectionLabel>
          <ul className="space-y-2">
            {slowest.map((t, i) => (
              <li
                key={t.correlationId}
                className="rp-glass rounded-lg p-3 flex items-start gap-3"
              >
                <div className="flex items-center justify-center h-7 w-7 rounded-md bg-red-500/15 text-red-300 text-[11px] font-mono font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="font-mono text-[11px] text-[var(--gold)]">{t.correlationId}</code>
                    <span className="text-xs text-foreground/80 truncate">{t.endpoint}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    Bottleneck:{" "}
                    <span className="text-amber-300">
                      {t.durationMs > 5000
                        ? "AI timeout (OpenAI)"
                        : t.durationMs > 200
                        ? "D1 Query (audit_logs)"
                        : "Webhook delivery (3 retries)"}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-sm text-red-300">{t.durationMs}ms</div>
                  <div className="text-[10px] text-muted-foreground">{t.spans} spans</div>
                </div>
              </li>
            ))}
          </ul>
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 rp-glass rounded-lg p-3 border-l-2 border-[var(--gold)]/50"
          >
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)] mb-1">
              Insight IA
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              El bottleneck principal es OpenAI (timeout 30s). Recomendación: aumentar cooldown del circuit breaker a 60s y promover fallback a gpt-4o-mini antes de reintentar.
            </p>
          </motion.div>
        </GlassPanel>
      </div>
    </div>
  );
}

/* =====================================================================
 * TAB: Métricas
 * ===================================================================== */

type MetricCategory = "API" | "D1" | "Workers" | "Queues" | "KV" | "R2" | "AI" | "Billing";

const METRIC_CATEGORIES: MetricCategory[] = ["API", "D1", "Workers", "Queues", "KV", "R2", "AI", "Billing"];

function MetricRow({
  label,
  value,
  unit,
  trend,
  trendValue,
  source,
  accent = "fg",
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  trend?: "up" | "down" | "flat";
  trendValue?: string;
  source: string;
  accent?: "gold" | "teal" | "fg" | "red" | "green" | "amber";
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border/40 last:border-0">
      <div className="min-w-0">
        <div className="text-xs font-medium text-foreground">{label}</div>
        <div className="text-[10px] font-mono text-muted-foreground mt-0.5">fuente: {source}</div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <span className="font-mono text-sm text-foreground">
            {value}
            {unit ? <span className="text-muted-foreground ml-0.5 text-[11px]">{unit}</span> : null}
          </span>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 justify-end text-[10px] mt-0.5",
                trend === "up"
                  ? "text-emerald-300"
                  : trend === "down"
                  ? "text-red-300"
                  : "text-muted-foreground",
              )}
            >
              {trend === "up" ? (
                <ArrowUpRight className="h-3 w-3" aria-hidden />
              ) : trend === "down" ? (
                <ArrowDownRight className="h-3 w-3" aria-hidden />
              ) : (
                <Minus className="h-3 w-3" aria-hidden />
              )}
              {trendValue}
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-[11px] hidden sm:inline-flex"
          onClick={() => toast({ title: `Alerta creada para ${label} (demo)`, description: "Configura umbral y canal" })}
        >
          <Bell className="h-3 w-3 mr-1" aria-hidden />
          Set alert
        </Button>
      </div>
    </div>
  );
}

function MetricsTab() {
  const [category, setCategory] = React.useState<MetricCategory>("API");
  const [dashboardOpen, setDashboardOpen] = React.useState(false);
  const [dashboardName, setDashboardName] = React.useState("");

  return (
    <div className="flex flex-col gap-5">
      {/* Category selector */}
      <GlassPanel>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <SectionLabel>Explorador de métricas</SectionLabel>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setDashboardOpen(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" aria-hidden />
            Crear dashboard
          </Button>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto rp-scroll-thin -mx-1 px-1 pb-1">
          {METRIC_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "shrink-0 min-h-[36px] inline-flex items-center rounded-lg border px-3 py-1.5 text-xs transition-colors",
                category === c
                  ? "border-[var(--gold)]/50 bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                  : "border-border/60 bg-foreground/[0.02] text-muted-foreground hover:text-foreground hover:border-foreground/30",
              )}
              aria-pressed={category === c}
            >
              {c}
            </button>
          ))}
        </div>
      </GlassPanel>

      {/* Content per category */}
      {category === "API" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <GlassPanel>
            <SectionLabel>Request rate (req/s) · 1h</SectionLabel>
            <LineChart
              series={[
                {
                  label: "req/s",
                  color: "#D4AF37",
                  values: [42, 48, 55, 61, 78, 92, 110, 124, 138, 142, 128, 118, 102],
                },
              ]}
              unit="req/s"
            />
          </GlassPanel>
          <GlassPanel>
            <SectionLabel>Latencia percentiles (p50/p95/p99) · 1h</SectionLabel>
            <LineChart
              series={[
                { label: "p50", color: "#3DD6C9", values: [12, 14, 13, 15, 18, 20, 22, 24, 26, 24, 22, 20, 18] },
                { label: "p95", color: "#E8C766", values: [82, 96, 102, 118, 142, 168, 188, 210, 234, 226, 214, 198, 184] },
                { label: "p99", color: "#ef4444", values: [142, 168, 178, 198, 234, 268, 296, 348, 372, 358, 332, 312, 286] },
              ]}
              unit="ms"
            />
          </GlassPanel>
          <GlassPanel>
            <SectionLabel>Error rate (%) · 1h</SectionLabel>
            <BarChartMini
              data={[
                { label: "-60m", value: 0.4 },
                { label: "-55m", value: 0.6 },
                { label: "-50m", value: 0.5 },
                { label: "-45m", value: 0.8 },
                { label: "-40m", value: 1.2, color: "#f59e0b" },
                { label: "-35m", value: 1.8, color: "#f59e0b" },
                { label: "-30m", value: 2.4, color: "#ef4444" },
                { label: "-25m", value: 1.6, color: "#f59e0b" },
                { label: "-20m", value: 0.9 },
                { label: "-15m", value: 0.6 },
                { label: "-10m", value: 0.4 },
                { label: "-5m", value: 0.3 },
              ]}
              unit="%"
            />
          </GlassPanel>
          <GlassPanel>
            <SectionLabel>Distribución de códigos HTTP · 1h</SectionLabel>
            <DonutChart
              segments={[
                { label: "2xx", value: 48200, color: "#3DD6C9" },
                { label: "3xx", value: 312, color: "#E8C766" },
                { label: "4xx", value: 842, color: "#f59e0b" },
                { label: "5xx", value: 18, color: "#ef4444" },
              ]}
            />
          </GlassPanel>
          <GlassPanel className="lg:col-span-2">
            <SectionLabel>Métricas API · detalle</SectionLabel>
            <MetricRow label="Request rate (1h avg)" value="92.4" unit="req/s" trend="up" trendValue="+12% vs ayer" source="workers.metrics" accent="gold" />
            <MetricRow label="Latencia p50" value="18" unit="ms" trend="flat" trendValue="estable" source="workers.metrics" accent="teal" />
            <MetricRow label="Latencia p95" value="234" unit="ms" trend="up" trendValue="+18% vs umbral" source="workers.metrics" accent="amber" />
            <MetricRow label="Latencia p99" value="372" unit="ms" trend="up" trendValue="+24% vs ayer" source="workers.metrics" accent="red" />
            <MetricRow label="Error rate (5xx)" value="0.04" unit="%" trend="down" trendValue="-22%" source="workers.metrics" accent="green" />
            <MetricRow label="Requests 4xx" value="842" unit="req" trend="up" trendValue="+8%" source="workers.metrics" />
          </GlassPanel>
        </div>
      )}

      {category === "D1" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <GlassPanel>
            <SectionLabel>D1 reads/s vs writes/s · 1h</SectionLabel>
            <LineChart
              series={[
                { label: "reads/s", color: "#3DD6C9", values: [120, 142, 168, 184, 220, 246, 282, 312, 348, 332, 318, 296, 268] },
                { label: "writes/s", color: "#D4AF37", values: [18, 22, 28, 32, 38, 42, 48, 56, 62, 58, 54, 48, 42] },
              ]}
              unit="op/s"
            />
          </GlassPanel>
          <GlassPanel>
            <SectionLabel>D1 query latency (p50/p95) · 1h</SectionLabel>
            <LineChart
              series={[
                { label: "p50", color: "#3DD6C9", values: [4, 5, 4, 6, 5, 7, 6, 8, 7, 6, 5, 6, 5] },
                { label: "p95", color: "#E8C766", values: [12, 14, 16, 18, 22, 24, 28, 32, 28, 26, 24, 22, 18] },
              ]}
              unit="ms"
            />
          </GlassPanel>
          <GlassPanel className="lg:col-span-2">
            <SectionLabel>Métricas D1 · detalle</SectionLabel>
            <MetricRow label="Reads/s (1h avg)" value="268" unit="reads/s" trend="up" trendValue="+8%" source="d1.metrics" accent="teal" />
            <MetricRow label="Writes/s (1h avg)" value="42" unit="writes/s" trend="up" trendValue="+12%" source="d1.metrics" accent="gold" />
            <MetricRow label="Storage used" value="3.2" unit="GB" trend="up" trendValue="+1.2% / semana" source="d1.metrics" />
            <MetricRow label="Query latency p50" value="5" unit="ms" trend="flat" trendValue="estable" source="d1.metrics" accent="green" />
            <MetricRow label="Query latency p95" value="32" unit="ms" trend="up" trendValue="+6%" source="d1.metrics" accent="amber" />
            <MetricRow label="Slow queries (>100ms)" value="3" unit="queries" trend="up" trendValue="audit_logs JOIN" source="d1.metrics" accent="red" />
          </GlassPanel>
        </div>
      )}

      {category === "Queues" && (
        <GlassPanel>
          <SectionLabel>Métricas por cola · throughput, DLQ, lag, retries</SectionLabel>
          <div className="overflow-x-auto rp-scroll-thin">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/60">
                  {["Cola", "Throughput", "DLQ depth", "Consumer lag", "Retry rate", "Trend"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { q: "email-send", tp: "8.2 msg/s", dlq: 4, lag: "120 ms", retry: "1.8%", trend: "up" as const },
                  { q: "crm-updates", tp: "12.4 msg/s", dlq: 0, lag: "45 ms", retry: "0.2%", trend: "flat" as const },
                  { q: "analytics", tp: "42.6 msg/s", dlq: 0, lag: "18 ms", retry: "0.0%", trend: "up" as const },
                  { q: "audit", tp: "18.2 msg/s", dlq: 0, lag: "32 ms", retry: "0.1%", trend: "flat" as const },
                  { q: "webhooks", tp: "3.8 msg/s", dlq: 2, lag: "210 ms", retry: "2.4%", trend: "down" as const },
                  { q: "ai-tasks", tp: "1.2 msg/s", dlq: 0, lag: "8 ms", retry: "0.4%", trend: "up" as const },
                ].map((r) => (
                  <tr key={r.q} className="border-b border-border/40 last:border-0 hover:bg-foreground/[0.025]">
                    <td className="px-3 py-2.5 font-mono text-[var(--gold)]">{r.q}</td>
                    <td className="px-3 py-2.5 font-mono">{r.tp}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn("font-mono", r.dlq > 0 ? "text-amber-300" : "text-emerald-300")}>{r.dlq}</span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-muted-foreground">{r.lag}</td>
                    <td className="px-3 py-2.5 font-mono">{r.retry}</td>
                    <td className="px-3 py-2.5">
                      {r.trend === "up" ? (
                        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
                      ) : r.trend === "down" ? (
                        <ArrowDownRight className="h-3.5 w-3.5 text-red-400" aria-hidden />
                      ) : (
                        <Minus className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>
      )}

      {category === "AI" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <GlassPanel>
            <SectionLabel>Requests/min · IA · 1h</SectionLabel>
            <LineChart
              series={[{ label: "req/min", color: "#D4AF37", values: [12, 14, 18, 22, 28, 34, 42, 48, 52, 48, 44, 38, 32] }]}
              unit="req/min"
            />
          </GlassPanel>
          <GlassPanel>
            <SectionLabel>Tokens/min · IA · 1h</SectionLabel>
            <LineChart
              series={[
                { label: "tokens_in", color: "#3DD6C9", values: [12000, 14000, 18000, 22000, 28000, 34000, 42000, 48000, 52000, 48000, 44000, 38000, 32000] },
                { label: "tokens_out", color: "#D4AF37", values: [2400, 2800, 3600, 4400, 5600, 6800, 8400, 9600, 10400, 9600, 8800, 7600, 6400] },
              ]}
              unit="tok/min"
            />
          </GlassPanel>
          <GlassPanel className="lg:col-span-2">
            <SectionLabel>Métricas IA · detalle</SectionLabel>
            <MetricRow label="Requests/min" value="38" unit="req/min" trend="up" trendValue="+14%" source="ai.metrics" accent="gold" />
            <MetricRow label="Tokens/min (in/out)" value="32K / 6.4K" trend="up" trendValue="+18%" source="ai.metrics" accent="teal" />
            <MetricRow label="Cost/min" value="€0.085" trend="up" trendValue="+12%" source="ai.metrics" accent="amber" />
            <MetricRow label="Latencia p50" value="312" unit="ms" trend="flat" trendValue="estable" source="ai.metrics" accent="teal" />
            <MetricRow label="Latencia p95" value="1.4" unit="s" trend="up" trendValue="+22%" source="ai.metrics" accent="amber" />
            <MetricRow label="Fallback rate (gpt-4o → mini)" value="4.2" unit="%" trend="up" trendValue="rate limit OpenAI" source="ai.metrics" accent="red" />
            <MetricRow label="Error rate" value="0.8" unit="%" trend="down" trendValue="-0.3pp" source="ai.metrics" accent="green" />
          </GlassPanel>
        </div>
      )}

      {category === "KV" && (
        <GlassPanel>
          <SectionLabel>Métricas KV · Workers KV</SectionLabel>
          <MetricRow label="Ops/s (reads)" value="428" unit="ops/s" trend="up" trendValue="+9%" source="kv.metrics" accent="teal" />
          <MetricRow label="Ops/s (writes)" value="42" unit="ops/s" trend="up" trendValue="+6%" source="kv.metrics" accent="gold" />
          <MetricRow label="Hit ratio" value="94" unit="%" trend="up" trendValue="+2pp" source="kv.metrics" accent="green" />
          <MetricRow label="Storage used" value="128" unit="MB" trend="up" trendValue="+0.4%" source="kv.metrics" />
          <MetricRow label="Hot keys (>1K ops/s)" value="2" unit="keys" trend="flat" trendValue="monitor" source="kv.metrics" accent="amber" />
        </GlassPanel>
      )}

      {category === "R2" && (
        <GlassPanel>
          <SectionLabel>Métricas R2 · object storage</SectionLabel>
          <MetricRow label="Class A ops (writes)" value="4.2" unit="K/day" trend="up" trendValue="+8%" source="r2.metrics" accent="gold" />
          <MetricRow label="Class B ops (reads)" value="42.8" unit="K/day" trend="up" trendValue="+12%" source="r2.metrics" accent="teal" />
          <MetricRow label="Storage used" value="12.4" unit="GB" trend="up" trendValue="+2.1% / mes" source="r2.metrics" />
          <MetricRow label="Egress" value="2.1" unit="GB/day" trend="flat" trendValue="estable" source="r2.metrics" accent="green" />
          <MetricRow label="5xx rate" value="0.01" unit="%" trend="flat" trendValue="estable" source="r2.metrics" accent="green" />
        </GlassPanel>
      )}

      {category === "Workers" && (
        <GlassPanel>
          <SectionLabel>Métricas Workers · Cloudflare</SectionLabel>
          <MetricRow label="Invocations / s" value="248" unit="inv/s" trend="up" trendValue="+11%" source="workers.metrics" accent="gold" />
          <MetricRow label="CPU time (p50)" value="3.2" unit="ms" trend="flat" trendValue="estable" source="workers.metrics" accent="teal" />
          <MetricRow label="CPU time (p95)" value="14.8" unit="ms" trend="up" trendValue="+6%" source="workers.metrics" accent="amber" />
          <MetricRow label="Memory (p50)" value="42" unit="MB" trend="flat" trendValue="estable" source="workers.metrics" />
          <MetricRow label="Wall time (p95)" value="22" unit="ms" trend="up" trendValue="+4%" source="workers.metrics" accent="amber" />
          <MetricRow label="Subrequests / invocation (max)" value="6" unit="req" trend="flat" trendValue="<50 límite" source="workers.metrics" accent="green" />
        </GlassPanel>
      )}

      {category === "Billing" && (
        <GlassPanel>
          <SectionLabel>Métricas Billing · Stripe + invoices</SectionLabel>
          <MetricRow label="Cobros / día" value="312" unit="cobros" trend="up" trendValue="+8%" source="billing.metrics" accent="gold" />
          <MetricRow label="Volumen / día" value="€42K" trend="up" trendValue="+12%" source="billing.metrics" accent="teal" />
          <MetricRow label="Tasa de rechazo" value="2.4" unit="%" trend="down" trendValue="-0.6pp" source="billing.metrics" accent="green" />
          <MetricRow label="Refunds / día" value="4" unit="refunds" trend="flat" trendValue="estable" source="billing.metrics" />
          <MetricRow label="Disputas abiertas" value="2" unit="disputas" trend="flat" trendValue="monitor" source="billing.metrics" accent="amber" />
        </GlassPanel>
      )}

      {/* Create dashboard dialog */}
      <Dialog open={dashboardOpen} onOpenChange={setDashboardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear dashboard personalizado</DialogTitle>
            <DialogDescription>
              Selecciona las métricas a incluir y un layout. El dashboard se guardará en tu espacio personal.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Nombre del dashboard
              </label>
              <Input
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                placeholder="ej: SRE Daily · EU region"
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Métricas a incluir
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto rp-scroll-thin">
                {["API req/s", "API p95", "API errors", "D1 reads/s", "D1 p95", "Queue depth", "Cache hit", "AI cost", "Webhook fail", "R2 5xx"].map((m) => (
                  <label key={m} className="flex items-center gap-2 text-xs px-2 py-1.5 rounded hover:bg-foreground/[0.025]">
                    <input type="checkbox" defaultChecked={["API p95", "D1 p95", "Queue depth"].includes(m)} className="h-3.5 w-3.5" />
                    <span>{m}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Layout
              </label>
              <div className="flex items-center gap-2">
                {["Grid 2×2", "Grid 3×2", "Stack"].map((l, i) => (
                  <button
                    key={l}
                    className={cn(
                      "h-9 px-3 rounded-md border text-xs",
                      i === 0
                        ? "border-[var(--gold)]/50 bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                        : "border-border/60 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDashboardOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setDashboardOpen(false);
                setDashboardName("");
                toast({ title: "Dashboard creado (demo)", description: "Disponible en tu espacio personal" });
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" aria-hidden />
              Crear dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =====================================================================
 * TAB: Alertas
 * ===================================================================== */

function AlertsTab() {
  const [alerts, setAlerts] = React.useState<Alert[]>(ACTIVE_ALERTS);
  const [rules, setRules] = React.useState<AlertRule[]>(ALERT_RULES);
  const [runbookFor, setRunbookFor] = React.useState<Alert | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);

  function ack(id: string) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "acknowledged" as AlertStatus } : a)));
    toast({ title: `Alerta ${id} reconocida (demo)`, description: "Asignada a A. Martínez" });
  }
  function resolve(id: string) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "resolved" as AlertStatus } : a)));
    toast({ title: `Alerta ${id} resuelta (demo)`, description: "Marcada como resuelta" });
  }
  function createIncident(a: Alert) {
    toast({
      title: `Incidente creado desde ${a.id} (demo)`,
      description: `INC-2025-00${Math.floor(Math.random() * 9) + 2} · ${a.rule}`,
    });
  }
  function toggleRule(id: string) {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat label="Activas" value={alerts.filter((a) => a.status === "firing").length} sub="disparadas ahora" accent="red" trend="up" />
        <MiniStat label="Reconocidas" value={alerts.filter((a) => a.status === "acknowledged").length} sub="en investigación" accent="amber" trend="flat" />
        <MiniStat label="Monitorizando" value={alerts.filter((a) => a.status === "monitoring").length} sub="umbral cercano" accent="teal" trend="flat" />
        <MiniStat label="Reglas activas" value={rules.filter((r) => r.enabled).length} sub={`de ${rules.length} totales`} accent="gold" trend="flat" />
      </div>

      {/* Active alerts */}
      <GlassPanel>
        <div className="flex items-center justify-between gap-3 mb-3">
          <SectionLabel>Alertas activas</SectionLabel>
          <Button variant="outline" size="sm" className="h-8" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" aria-hidden />
            Crear regla
          </Button>
        </div>
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {alerts.map((a) => (
              <motion.li
                key={a.id}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rp-glass rounded-xl p-4 border-l-2"
                style={{
                  borderLeftColor:
                    a.severity === "critical"
                      ? "#ef4444"
                      : a.severity === "high"
                      ? "#fb923c"
                      : a.severity === "medium"
                      ? "#f59e0b"
                      : "#38bdf8",
                }}
              >
                <div className="flex items-start gap-3 flex-wrap">
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                        SEVERITY_STYLES[a.severity],
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", SEVERITY_DOT[a.severity])} aria-hidden />
                      {a.severity}
                    </span>
                    <code className="font-mono text-[11px] text-[var(--gold)]">{a.id}</code>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground">{a.rule}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{a.description}</div>
                    <div className="mt-2 flex items-center gap-3 flex-wrap text-[11px] text-muted-foreground">
                      <span>
                        Actual: <span className="font-mono text-foreground">{a.currentValue}</span>
                      </span>
                      <span>
                        Umbral: <span className="font-mono text-foreground">{a.threshold}</span>
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden />
                        {a.triggeredAt}
                      </span>
                      <span>·</span>
                      <span>Asignada: {a.assignee}</span>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider shrink-0",
                      ALERT_STATUS_STYLES[a.status],
                    )}
                  >
                    {a.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  {a.status !== "resolved" && (
                    <>
                      {a.status === "firing" && (
                        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => ack(a.id)}>
                          <ShieldAlert className="h-3 w-3 mr-1" aria-hidden />
                          Acknowledge
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => resolve(a.id)}>
                        <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden />
                        Resolve
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => createIncident(a)}>
                        <Flame className="h-3 w-3 mr-1" aria-hidden />
                        Crear incidente
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => setRunbookFor(a)}>
                    <ClipboardList className="h-3 w-3 mr-1" aria-hidden />
                    View runbook
                  </Button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </GlassPanel>

      {/* Alert rules */}
      <GlassPanel>
        <SectionLabel>Reglas de alerta ({rules.length})</SectionLabel>
        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/60">
                {["Regla", "Métrica", "Condición", "Umbral", "Ventana", "Severidad", "Cooldown", "Última", "Activa"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} className="border-b border-border/40 last:border-0 hover:bg-foreground/[0.025]">
                  <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">{r.name}</td>
                  <td className="px-3 py-2.5 font-mono text-[var(--teal)] whitespace-nowrap">{r.metric}</td>
                  <td className="px-3 py-2.5 font-mono">{r.condition}</td>
                  <td className="px-3 py-2.5 font-mono text-foreground">{r.threshold}</td>
                  <td className="px-3 py-2.5 font-mono text-muted-foreground">{r.window}</td>
                  <td className="px-3 py-2.5">
                    <span className={cn("inline-flex items-center rounded border px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider", SEVERITY_STYLES[r.severity])}>
                      {r.severity}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-muted-foreground whitespace-nowrap">{r.cooldown}</td>
                  <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{r.lastTriggered}</td>
                  <td className="px-3 py-2.5">
                    <Switch checked={r.enabled} onCheckedChange={() => toggleRule(r.id)} aria-label={`Activar regla ${r.name}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>

      {/* Alert history */}
      <GlassPanel>
        <SectionLabel>Historial de alertas resueltas (últimas 10)</SectionLabel>
        <ul className="divide-y divide-border/40">
          {ALERT_HISTORY.map((h, i) => (
            <li key={i} className="py-2.5 flex items-center gap-3 flex-wrap text-xs">
              <span className="font-mono text-muted-foreground w-32 shrink-0">{h.ts}</span>
              <span
                className={cn(
                  "inline-flex items-center rounded border px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider shrink-0",
                  SEVERITY_STYLES[h.severity],
                )}
              >
                {h.severity}
              </span>
              <span className="flex-1 min-w-0 text-foreground/85 truncate">{h.rule}</span>
              <span className="font-mono text-muted-foreground whitespace-nowrap">duración: {h.duration}</span>
              <span className="text-muted-foreground whitespace-nowrap hidden sm:inline">por {h.resolvedBy}</span>
            </li>
          ))}
        </ul>
      </GlassPanel>

      {/* Runbook dialog */}
      <Dialog open={!!runbookFor} onOpenChange={(o) => !o && setRunbookFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-[var(--gold)]" aria-hidden />
              Runbook · {runbookFor?.id}
            </DialogTitle>
            <DialogDescription>
              Pasos de resolución sugeridos por SRE. Esta guía es automática y se actualiza con cada incidente.
            </DialogDescription>
          </DialogHeader>
          {runbookFor && (
            <div className="space-y-3 py-2">
              <div className="rp-glass rounded-lg p-3 border-l-2 border-[var(--gold)]/50">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)] mb-1">
                  {runbookFor.rule}
                </div>
                <p className="text-xs text-muted-foreground">{runbookFor.description}</p>
              </div>
              <ol className="space-y-2">
                {[
                  "Confirmar el impacto en el dashboard de métricas (p95, error rate).",
                  "Identificar el servicio o cola afectado en Logs (filtrar por correlation_id).",
                  "Revisar si hay despliegues recientes que puedan correlacionar.",
                  "Si el origen es D1: revisar slow queries y añadir índice si aplica.",
                  "Si el origen es IA: activar circuit breaker y fallback a modelo secundario.",
                  "Comunicar en #incidencias y crear incidente si severity >= high.",
                  "Tras resolver: documentar en postmortem y actualizar runbook.",
                ].map((step, idx) => (
                  <li key={idx} className="flex gap-3 text-xs">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[var(--gold)]/15 text-[var(--gold-soft)] text-[10px] font-mono shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-foreground/85 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRunbookFor(null)}>Cerrar</Button>
            <Button onClick={() => { setRunbookFor(null); toast({ title: "Runbook ejecutado (demo)", description: "Pasos marcados como completados" }); }}>
              Marcar como ejecutado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create alert rule dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear regla de alerta</DialogTitle>
            <DialogDescription>
              Define la métrica, condición, umbral, ventana y severidad. Las notificaciones se envían a los canales seleccionados.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Nombre</label>
              <Input placeholder="ej: API p99 > 500ms" className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Métrica</label>
              <Select defaultValue="api.latency.p95">
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["api.latency.p50", "api.latency.p95", "api.latency.p99", "api.error_rate", "d1.error_rate", "kv.hit_ratio", "ai.cost.daily", "queue.depth"].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Condición</label>
              <Select defaultValue=">">
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value=">">&gt; mayor que</SelectItem>
                  <SelectItem value="<">&lt; menor que</SelectItem>
                  <SelectItem value=">=">&gt;= mayor o igual</SelectItem>
                  <SelectItem value="<=">&lt;= menor o igual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Umbral</label>
              <Input placeholder="200" className="h-9 text-sm font-mono" />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Ventana</label>
              <Select defaultValue="5m">
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["1m", "5m", "10m", "30m", "1h", "24h"].map((w) => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Severidad</label>
              <Select defaultValue="high">
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["critical", "high", "medium", "low"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Canales de notificación</label>
              <div className="flex items-center gap-2 flex-wrap">
                {["Email", "Slack #incidencias", "PagerDuty", "Webhook"].map((c, i) => (
                  <label key={c} className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded border border-border/60">
                    <input type="checkbox" defaultChecked={i < 2} className="h-3.5 w-3.5" />
                    {c}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={() => { setCreateOpen(false); toast({ title: "Regla creada (demo)", description: "Activada inmediatamente" }); }}>
              <Plus className="h-3.5 w-3.5 mr-1.5" aria-hidden />
              Crear regla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =====================================================================
 * TAB: Incidentes
 * ===================================================================== */

function IncidentsTab() {
  const [createOpen, setCreateOpen] = React.useState(false);
  const [postmortemFor, setPostmortemFor] = React.useState<Incident | null>(null);

  return (
    <div className="flex flex-col gap-5">
      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat label="MTTR" value="4.2h" sub="mean time to resolution" trend="down" accent="green" />
        <MiniStat label="Frecuencia" value="2" sub="incidentes este mes" trend="down" accent="teal" />
        <MiniStat label="Orgs afectadas (avg)" value="8.4" sub="por incidente" trend="flat" accent="fg" />
        <MiniStat label="Postmortems" value="6" sub="de 8 incidentes" trend="up" accent="gold" />
      </div>

      {/* Active incidents */}
      <GlassPanel strong>
        <div className="flex items-center justify-between gap-3 mb-3">
          <SectionLabel>Incidentes activos</SectionLabel>
          <Button variant="outline" size="sm" className="h-8" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" aria-hidden />
            Crear incidente
          </Button>
        </div>
        <div className="space-y-4">
          {ACTIVE_INCIDENTS.map((inc) => (
            <div
              key={inc.id}
              className="rp-glass rounded-xl p-4 border-l-2"
              style={{
                borderLeftColor: inc.severity === "critical" ? "#ef4444" : inc.severity === "high" ? "#fb923c" : "#f59e0b",
              }}
            >
              <div className="flex items-start gap-3 flex-wrap">
                <code className="font-mono text-[11px] text-[var(--gold)] shrink-0">{inc.id}</code>
                <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider", SEVERITY_STYLES[inc.severity])}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", SEVERITY_DOT[inc.severity])} aria-hidden />
                  {inc.severity}
                </span>
                <span className={cn("inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider", INCIDENT_STATUS_STYLES[inc.status])}>
                  {inc.status}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground">{inc.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{inc.impact}</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Servicios</div>
                  <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                    {inc.services.map((s) => (
                      <span key={s} className="inline-flex items-center rounded border border-border/60 bg-foreground/5 px-1.5 py-0.5 text-[10px] font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Orgs afectadas</div>
                  <div className="mt-0.5 font-mono text-foreground">{inc.orgs}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Creado</div>
                  <div className="mt-0.5 font-mono text-foreground">{inc.createdAt}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Asignado</div>
                  <div className="mt-0.5 text-foreground">{inc.assignee}</div>
                </div>
              </div>

              {/* Timeline */}
              <div className="mt-4">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Timeline</div>
                <ol className="space-y-2">
                  {inc.timeline.map((t, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs">
                      <span
                        className={cn(
                          "flex items-center justify-center h-5 w-5 rounded-full shrink-0",
                          t.done ? "bg-emerald-400/15 text-emerald-300" : "bg-foreground/10 text-muted-foreground",
                        )}
                      >
                        {t.done ? <CheckCircle2 className="h-3 w-3" aria-hidden /> : <Clock className="h-3 w-3" aria-hidden />}
                      </span>
                      <span className="font-mono text-muted-foreground w-12 shrink-0">{t.ts}</span>
                      <span className={cn(t.done ? "text-foreground/80" : "text-muted-foreground")}>{t.label}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* AI summary */}
              <div className="mt-4 rp-glass rounded-lg p-3 border-l-2 border-[var(--teal)]/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--teal)]" aria-hidden />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]">AI Summary</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{inc.aiSummary}</p>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setPostmortemFor(inc)}>
                  <FileJson className="h-3 w-3 mr-1" aria-hidden />
                  Postmortem
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-[11px]">
                  <ExternalLink className="h-3 w-3 mr-1" aria-hidden />
                  Abrir en Slack
                </Button>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* Recent incidents */}
      <GlassPanel>
        <SectionLabel>Incidentes recientes resueltos</SectionLabel>
        <ul className="divide-y divide-border/40">
          {RECENT_INCIDENTS.map((inc) => (
            <li key={inc.id} className="py-3 flex items-center gap-3 flex-wrap text-xs">
              <code className="font-mono text-[11px] text-[var(--gold)] w-28 shrink-0">{inc.id}</code>
              <span className={cn("inline-flex items-center rounded border px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider shrink-0", SEVERITY_STYLES[inc.severity])}>
                {inc.severity}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-foreground/85 truncate">{inc.title}</div>
                <div className="text-[10px] text-muted-foreground truncate">Impacto: {inc.impact}</div>
              </div>
              <span className="font-mono text-muted-foreground whitespace-nowrap hidden sm:inline">{inc.duration}</span>
              {inc.postmortem ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-[11px] text-[var(--teal)]"
                  onClick={() => toast({ title: `Postmortem ${inc.id} abierto (demo)`, description: inc.resolution })}
                >
                  Postmortem
                  <ArrowRight className="h-3 w-3 ml-1" aria-hidden />
                </Button>
              ) : (
                <span className="text-[10px] text-muted-foreground italic">sin postmortem</span>
              )}
            </li>
          ))}
        </ul>
      </GlassPanel>

      {/* Postmortem dialog */}
      <Dialog open={!!postmortemFor} onOpenChange={(o) => !o && setPostmortemFor(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileJson className="h-4 w-4 text-[var(--gold)]" aria-hidden />
              Postmortem · {postmortemFor?.id}
            </DialogTitle>
            <DialogDescription>
              Análisis post-incidente · blameless · enfocado en aprendizaje y mejora del sistema.
            </DialogDescription>
          </DialogHeader>
          {postmortemFor && (
            <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto rp-scroll-thin">
              <div className="rp-glass rounded-lg p-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Resumen</div>
                <p className="text-xs text-foreground/85">{postmortemFor.title}. {postmortemFor.impact}.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rp-glass rounded-lg p-3 border-l-2 border-red-400/50">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-red-300 mb-1">Impacto</div>
                  <p className="text-xs text-muted-foreground">{postmortemFor.orgs} organizaciones afectadas. Tiempo de detección: 2 min. Tiempo de mitigación: 12 min.</p>
                </div>
                <div className="rp-glass rounded-lg p-3 border-l-2 border-emerald-400/50">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 mb-1">Resolución</div>
                  <p className="text-xs text-muted-foreground">{postmortemFor.aiSummary}</p>
                </div>
              </div>
              <div className="rp-glass rounded-lg p-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Causa raíz</div>
                <p className="text-xs text-foreground/85 leading-relaxed">
                  Hot-spot en D1 tras despliegue a las 14:00 que introdujo un query sin índice en audit_logs. El p95 subió de 84ms a 234ms en 8 minutos.
                </p>
              </div>
              <div className="rp-glass rounded-lg p-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Acciones de mejora</div>
                <ul className="space-y-1.5 text-xs">
                  <li className="flex gap-2"><span className="text-[var(--gold)]">●</span><span>Añadir índice en (tenant_id, created_at) en audit_logs — hecho en 14:35.</span></li>
                  <li className="flex gap-2"><span className="text-[var(--gold)]">●</span><span>Añadir regla CI que detecte queries sin índice en migraciones D1.</span></li>
                  <li className="flex gap-2"><span className="text-[var(--gold)]">●</span><span>Degradar consultas de auditoría a réplica read-only en horario pico.</span></li>
                  <li className="flex gap-2"><span className="text-[var(--gold)]">●</span><span>Añadir alerta de p99 con cooldown 5 min para detectar antes.</span></li>
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPostmortemFor(null)}>Cerrar</Button>
            <Button onClick={() => { setPostmortemFor(null); toast({ title: "Postmortem publicado (demo)", description: "Compartido con el equipo SRE" }); }}>
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" aria-hidden />
              Publicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create incident dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear incidente</DialogTitle>
            <DialogDescription>
              Inicia un incidente formal. Se notificará al canal de SRE y se abrirá el timeline automáticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Título</label>
              <Input placeholder="ej: Degradación de webhook delivery" className="h-9 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Severidad</label>
                <Select defaultValue="medium">
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["critical", "high", "medium", "low"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Asignado</label>
                <Select defaultValue="auto">
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-asignar (SRE on-call)</SelectItem>
                    <SelectItem value="pnunez">P. Núñez</SelectItem>
                    <SelectItem value="amartinez">A. Martínez</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Servicios afectados</label>
              <div className="flex items-center gap-2 flex-wrap">
                {["API", "D1", "Queues", "AI", "CRM", "Webhooks"].map((s, i) => (
                  <label key={s} className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded border border-border/60">
                    <input type="checkbox" defaultChecked={i < 2} className="h-3.5 w-3.5" />
                    {s}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Descripción</label>
              <textarea
                className="w-full rounded-md border border-border/60 bg-transparent px-3 py-2 text-sm min-h-[80px] resize-y"
                placeholder="Describe síntomas, impacto y contexto…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={() => { setCreateOpen(false); toast({ title: "Incidente creado (demo)", description: "Notificado a #incidencias · timeline abierto" }); }}>
              <Flame className="h-3.5 w-3.5 mr-1.5" aria-hidden />
              Crear incidente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =====================================================================
 * Componente principal
 * ===================================================================== */

type ObsTab = "logs" | "tracing" | "metrics" | "alerts" | "incidents";

const TABS: { id: ObsTab; label: string; icon: React.ElementType; description: string }[] = [
  { id: "logs", label: "Logs", icon: ScrollText, description: "Stream en vivo, filtros, JSON estructurado y volumen 24h" },
  { id: "tracing", label: "Tracing", icon: GitBranch, description: "Trazas distribuidas OpenTelemetry · waterfall con spans sync y async" },
  { id: "metrics", label: "Métricas", icon: BarChart3, description: "Explorador de métricas por servicio · API, D1, Queues, IA, etc." },
  { id: "alerts", label: "Alertas", icon: Bell, description: "Alertas activas, reglas configurables e historial" },
  { id: "incidents", label: "Incidentes", icon: AlertOctagon, description: "Gestión de incidentes con timeline, AI summary y postmortems" },
];

export function CloudOpsObservability() {
  const reduce = useReducedMotion();
  const [tab, setTab] = React.useState<ObsTab>("logs");
  const [traceCorrelation, setTraceCorrelation] = React.useState("req_01HZXABC");

  function goTrace(corrId: string) {
    setTraceCorrelation(corrId);
    setTab("tracing");
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[var(--teal)] to-[var(--teal-deep)] flex items-center justify-center text-black ring-1 ring-[var(--teal)]/40 shrink-0">
            <Activity className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-xl sm:text-2xl font-medium tracking-tight truncate">
                Centro de Observabilidad
              </h1>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-amber-400/40 bg-amber-400/10 text-amber-300">
                demo
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-emerald-400/40 bg-emerald-400/10 text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
                live
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Logs · Tracing distribuido · Métricas · Alertas · Incidentes ·{" "}
              <span className="text-[var(--teal)]">OpenTelemetry end-to-end</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => toast({ title: "Refresh (demo)", description: "Métricas re-cargadas desde origen" })}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" aria-hidden />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto rp-scroll-thin -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "shrink-0 min-h-[44px] inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors",
              tab === t.id
                ? "border-[var(--teal)]/50 bg-[var(--teal)]/15 text-[var(--teal)]"
                : "border-border/60 bg-foreground/[0.02] text-muted-foreground hover:text-foreground hover:border-foreground/30",
            )}
            aria-pressed={tab === t.id}
          >
            <t.icon className="h-4 w-4" aria-hidden />
            <span className="font-medium">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab description */}
      <div className="text-xs text-muted-foreground -mt-2">
        {TABS.find((t) => t.id === tab)?.description}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "logs" && <LogsTab onGoTrace={goTrace} />}
          {tab === "tracing" && <TracingTab presetCorrelation={traceCorrelation} />}
          {tab === "metrics" && <MetricsTab />}
          {tab === "alerts" && <AlertsTab />}
          {tab === "incidents" && <IncidentsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
