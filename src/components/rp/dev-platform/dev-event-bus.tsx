"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "@/hooks/use-toast";
import {
  Radio, Zap, Activity, Clock, CheckCircle2, AlertTriangle, AlertCircle,
  RotateCcw, ChevronDown, ChevronRight, Copy, Webhook, ShieldCheck,
  Database, Cpu, Brain, Bell, ScrollText, Server, Layers, Boxes,
  RefreshCw, ExternalLink, AlertOctagon, TrendingUp, Hash,
  GitBranch, FileJson, Eye, Send, ArrowRight, Workflow,
} from "lucide-react";

/* =====================================================================
 * Tipos
 * ===================================================================== */

type EventStatus = "published" | "processing" | "completed" | "failed" | "dlq";
type ConsumerStatus = "pending" | "processing" | "completed" | "failed";

interface Consumer {
  name: string;
  status: ConsumerStatus;
  latencyMs?: number;
  attempts: number;
  errorMsg?: string;
}

interface BusEvent {
  id: string;
  type: string;
  version: number;
  organizationId: string;
  source: string;
  payload: Record<string, unknown>;
  publishedAt: string;
  status: EventStatus;
  consumers: Consumer[];
  partitionKey: string;
  correlationId: string;
  error?: string;
}

/* =====================================================================
 * Datos demo
 * ===================================================================== */

const CONSUMERS = [
  { name: "CRM", icon: "crm" },
  { name: "Analytics", icon: "analytics" },
  { name: "AI", icon: "ai" },
  { name: "Notifications", icon: "notifications" },
  { name: "Webhooks", icon: "webhooks" },
  { name: "Audit", icon: "audit" },
];

const EVENTS: BusEvent[] = [
  {
    id: "evt_01HZXA",
    type: "ReservationCreated",
    version: 1,
    organizationId: "org_01HZX8K7Y9P3M2NQR5S8T6V4W",
    source: "reservations",
    publishedAt: "12:34:21",
    status: "completed",
    consumers: [
      { name: "CRM", status: "completed", latencyMs: 42, attempts: 1 },
      { name: "Analytics", status: "completed", latencyMs: 58, attempts: 1 },
      { name: "AI", status: "completed", latencyMs: 124, attempts: 1 },
      { name: "Notifications", status: "completed", latencyMs: 86, attempts: 1 },
      { name: "Webhooks", status: "completed", latencyMs: 95, attempts: 1 },
      { name: "Audit", status: "completed", latencyMs: 31, attempts: 1 },
    ],
    partitionKey: "reservations:org_01HZX8K",
    correlationId: "corr_9f3a2b8e1c",
    payload: {
      reservation_id: "res_01HZXAB9K2M3N4P5Q6R7S8T9V0",
      restaurant_id: "rest_01HZX7Y8K9P0",
      customer_id: "cus_01HZX9Y2K3L4",
      pax: 4,
      datetime: "2025-01-25T21:00:00Z",
      status: "confirmed",
    },
  },
  {
    id: "evt_01HZXB",
    type: "CustomerUpdated",
    version: 1,
    organizationId: "org_01HZX8K7Y9P3M2NQR5S8T6V4W",
    source: "crm",
    publishedAt: "12:34:18",
    status: "completed",
    consumers: [
      { name: "Analytics", status: "completed", latencyMs: 51, attempts: 1 },
      { name: "AI", status: "completed", latencyMs: 89, attempts: 1 },
      { name: "Notifications", status: "completed", latencyMs: 42, attempts: 1 },
      { name: "Audit", status: "completed", latencyMs: 28, attempts: 1 },
    ],
    partitionKey: "customers:org_01HZX8K",
    correlationId: "corr_8e2b1a7d0c",
    payload: {
      customer_id: "cus_01HZX9Y2K3L4",
      changes: {
        email: "carlos.garcia@example.com",
        tags: ["vip", "frequent"],
      },
      actor_id: "usr_01HZX3Y4",
    },
  },
  {
    id: "evt_01HZXC",
    type: "PaymentCompleted",
    version: 1,
    organizationId: "org_01HZX8K7Y9P3M2NQR5S8T6V4W",
    source: "billing",
    publishedAt: "12:34:12",
    status: "completed",
    consumers: [
      { name: "CRM", status: "completed", latencyMs: 38, attempts: 1 },
      { name: "Analytics", status: "completed", latencyMs: 62, attempts: 1 },
      { name: "Notifications", status: "completed", latencyMs: 71, attempts: 1 },
      { name: "Webhooks", status: "completed", latencyMs: 84, attempts: 1 },
      { name: "Audit", status: "completed", latencyMs: 25, attempts: 1 },
    ],
    partitionKey: "billing:org_01HZX8K",
    correlationId: "corr_7d1c0b6e9f",
    payload: {
      payment_id: "pay_01HZXCDEF12",
      reservation_id: "res_01HZXAB9K2M",
      amount_minor: 8900,
      currency: "EUR",
      method: "card",
      stripe_charge_id: "ch_3PqXy2ABC",
    },
  },
  {
    id: "evt_01HZXD",
    type: "ReservationCancelled",
    version: 1,
    organizationId: "org_01HZX8K7Y9P3M2NQR5S8T6V4W",
    source: "reservations",
    publishedAt: "12:34:05",
    status: "processing",
    consumers: [
      { name: "CRM", status: "completed", latencyMs: 41, attempts: 1 },
      { name: "Analytics", status: "completed", latencyMs: 55, attempts: 1 },
      { name: "AI", status: "processing", attempts: 1 },
      { name: "Notifications", status: "pending", attempts: 0 },
      { name: "Webhooks", status: "pending", attempts: 0 },
      { name: "Audit", status: "pending", attempts: 0 },
    ],
    partitionKey: "reservations:org_01HZX8K",
    correlationId: "corr_6c0b9a5d8e",
    payload: {
      reservation_id: "res_01HZXAB9K2M",
      cancelled_by: "usr_01HZX3Y4",
      reason: "customer_request",
      refund_minor: 8900,
    },
  },
  {
    id: "evt_01HZXE",
    type: "ReviewReceived",
    version: 1,
    organizationId: "org_01HZX8K7Y9P3M2NQR5S8T6V4W",
    source: "reviews",
    publishedAt: "12:33:58",
    status: "completed",
    consumers: [
      { name: "CRM", status: "completed", latencyMs: 47, attempts: 1 },
      { name: "AI", status: "completed", latencyMs: 142, attempts: 1 },
      { name: "Notifications", status: "completed", latencyMs: 88, attempts: 1 },
      { name: "Audit", status: "completed", latencyMs: 29, attempts: 1 },
    ],
    partitionKey: "reviews:org_01HZX8K",
    correlationId: "corr_5b8a7c4d3e",
    payload: {
      review_id: "rev_01HZXE12AB",
      platform: "google",
      rating: 5,
      text: "Experiencia excepcional. El servicio fue impecable.",
      author_redacted: "[REDACTED]",
    },
  },
  {
    id: "evt_01HZXF",
    type: "NoShowDetected",
    version: 1,
    organizationId: "org_01HZX8K7Y9P3M2NQR5S8T6V4W",
    source: "reservations",
    publishedAt: "12:33:51",
    status: "completed",
    consumers: [
      { name: "CRM", status: "completed", latencyMs: 39, attempts: 1 },
      { name: "Analytics", status: "completed", latencyMs: 56, attempts: 1 },
      { name: "AI", status: "completed", latencyMs: 118, attempts: 1 },
      { name: "Notifications", status: "completed", latencyMs: 79, attempts: 1 },
      { name: "Webhooks", status: "failed", attempts: 3, errorMsg: "HTTP 502 Bad Gateway from webhook endpoint after 3 retries" },
      { name: "Audit", status: "completed", latencyMs: 32, attempts: 1 },
    ],
    partitionKey: "reservations:org_01HZX8K",
    correlationId: "corr_4a7b6c2d1e",
    payload: {
      reservation_id: "res_01HZXAB9K2M",
      customer_id: "cus_01HZX9Y2K3L4",
      detected_at: "2025-01-25T20:30:00Z",
      policy_applied: "no_show_fee",
      fee_minor: 1500,
    },
  },
  {
    id: "evt_01HZXG",
    type: "CampaignSent",
    version: 1,
    organizationId: "org_01HZX8K7Y9P3M2NQR5S8T6V4W",
    source: "marketing",
    publishedAt: "12:33:44",
    status: "completed",
    consumers: [
      { name: "Analytics", status: "completed", latencyMs: 64, attempts: 1 },
      { name: "Notifications", status: "completed", latencyMs: 72, attempts: 1 },
      { name: "Audit", status: "completed", latencyMs: 27, attempts: 1 },
    ],
    partitionKey: "marketing:org_01HZX8K",
    correlationId: "corr_3c6b5a1d0e",
    payload: {
      campaign_id: "cmp_01HZXG34AB",
      channel: "whatsapp",
      recipients: 124,
      delivered: 121,
      failed: 3,
    },
  },
  {
    id: "evt_01HZXH",
    type: "TableOccupied",
    version: 1,
    organizationId: "org_01HZX8K7Y9P3M2NQR5S8T6V4W",
    source: "floor",
    publishedAt: "12:33:32",
    status: "completed",
    consumers: [
      { name: "Analytics", status: "completed", latencyMs: 48, attempts: 1 },
      { name: "AI", status: "completed", latencyMs: 95, attempts: 1 },
      { name: "Notifications", status: "completed", latencyMs: 61, attempts: 1 },
      { name: "Audit", status: "completed", latencyMs: 24, attempts: 1 },
    ],
    partitionKey: "floor:org_01HZX8K:table_5",
    correlationId: "corr_2d5c4b0a9e",
    payload: {
      table_id: "tbl_01HZXH56AB",
      floor_id: "flr_01HZX7Y8",
      occupied_at: "2025-01-25T20:15:00Z",
      party_size: 4,
    },
  },
  {
    id: "evt_01HZXI",
    type: "SubscriptionRenewed",
    version: 1,
    organizationId: "org_01HZX8K7Y9P3M2NQR5S8T6V4W",
    source: "billing",
    publishedAt: "12:33:20",
    status: "completed",
    consumers: [
      { name: "CRM", status: "completed", latencyMs: 35, attempts: 1 },
      { name: "Notifications", status: "completed", latencyMs: 68, attempts: 1 },
      { name: "Audit", status: "completed", latencyMs: 22, attempts: 1 },
    ],
    partitionKey: "billing:org_01HZX8K",
    correlationId: "corr_1c4b3a0e8d",
    payload: {
      subscription_id: "sub_01HZXI78AB",
      plan: "professional",
      amount_minor: 9900,
      currency: "EUR",
      renewal_date: "2025-02-25",
    },
  },
  {
    id: "evt_01HZXJ",
    type: "ReservationCreated",
    version: 1,
    organizationId: "org_01HZX8K7Y9P3M2NQR5S8T6V4W",
    source: "reservations",
    publishedAt: "12:33:08",
    status: "dlq",
    consumers: [
      { name: "CRM", status: "completed", latencyMs: 44, attempts: 1 },
      { name: "Analytics", status: "completed", latencyMs: 59, attempts: 1 },
      { name: "AI", status: "failed", attempts: 5, errorMsg: "AI worker timeout after 5000ms — model @cf/meta/llama-3.1-8b-instruct not responding" },
      { name: "Notifications", status: "completed", latencyMs: 71, attempts: 1 },
      { name: "Webhooks", status: "completed", latencyMs: 88, attempts: 1 },
      { name: "Audit", status: "completed", latencyMs: 26, attempts: 1 },
    ],
    partitionKey: "reservations:org_01HZX8K",
    correlationId: "corr_0b3a2c1d7e",
    payload: {
      reservation_id: "res_01HZXAB9K2M3N4P5Q6R7S8T9V1",
      restaurant_id: "rest_01HZX7Y8K9P0",
      customer_id: "cus_01HZX9Y2K3L4",
      pax: 2,
      datetime: "2025-01-25T22:00:00Z",
      status: "confirmed",
    },
    error: "Consumer 'AI' failed after 5 attempts — moved to DLQ",
  },
];

const EVENT_CATALOG: { type: string; version: number; desc: string; consumers: string[]; payloadExample: Record<string, unknown> }[] = [
  { type: "ReservationCreated", version: 1, desc: "Nueva reserva creada en el sistema", consumers: ["CRM", "Analytics", "AI", "Notifications", "Webhooks", "Audit"], payloadExample: { reservation_id: "res_01HZ", pax: 4, datetime: "2025-01-25T21:00:00Z" } },
  { type: "ReservationUpdated", version: 1, desc: "Reserva existente modificada", consumers: ["CRM", "Analytics", "Notifications", "Audit"], payloadExample: { reservation_id: "res_01HZ", changes: { pax: 6 } } },
  { type: "ReservationCancelled", version: 1, desc: "Reserva cancelada", consumers: ["CRM", "Analytics", "AI", "Notifications", "Webhooks", "Audit"], payloadExample: { reservation_id: "res_01HZ", reason: "customer_request" } },
  { type: "ReservationConfirmed", version: 1, desc: "Reserva confirmada al cliente", consumers: ["Notifications", "Audit"], payloadExample: { reservation_id: "res_01HZ", confirmed_via: "sms" } },
  { type: "NoShowDetected", version: 1, desc: "Cliente no se presentó", consumers: ["CRM", "Analytics", "AI", "Notifications", "Webhooks", "Audit"], payloadExample: { reservation_id: "res_01HZ", fee_minor: 1500 } },
  { type: "CustomerCreated", version: 1, desc: "Nuevo cliente registrado", consumers: ["CRM", "Analytics", "AI", "Audit"], payloadExample: { customer_id: "cus_01HZ", email: "[REDACTED]" } },
  { type: "CustomerUpdated", version: 1, desc: "Datos del cliente actualizados", consumers: ["Analytics", "AI", "Notifications", "Audit"], payloadExample: { customer_id: "cus_01HZ", changes: { tags: ["vip"] } } },
  { type: "CustomerMerged", version: 1, desc: "Dos clientes consolidados en uno", consumers: ["CRM", "Analytics", "Audit"], payloadExample: { source_id: "cus_01HZ", target_id: "cus_01HX" } },
  { type: "PaymentCompleted", version: 1, desc: "Pago completado correctamente", consumers: ["CRM", "Analytics", "Notifications", "Webhooks", "Audit"], payloadExample: { payment_id: "pay_01HZ", amount_minor: 8900 } },
  { type: "PaymentRefunded", version: 1, desc: "Reembolso procesado", consumers: ["CRM", "Analytics", "Webhooks", "Audit"], payloadExample: { payment_id: "pay_01HZ", amount_minor: 8900 } },
  { type: "PaymentFailed", version: 1, desc: "Pago fallido", consumers: ["CRM", "Notifications", "Audit"], payloadExample: { payment_id: "pay_01HZ", error: "card_declined" } },
  { type: "SubscriptionRenewed", version: 1, desc: "Suscripción renovada", consumers: ["CRM", "Notifications", "Audit"], payloadExample: { subscription_id: "sub_01HZ", plan: "professional" } },
  { type: "SubscriptionCancelled", version: 1, desc: "Suscripción cancelada", consumers: ["CRM", "Notifications", "Audit"], payloadExample: { subscription_id: "sub_01HZ", reason: "user_request" } },
  { type: "TableOccupied", version: 1, desc: "Mesa ocupada por clientes", consumers: ["Analytics", "AI", "Notifications", "Audit"], payloadExample: { table_id: "tbl_01HZ", party_size: 4 } },
  { type: "TableFreed", version: 1, desc: "Mesa liberada y disponible", consumers: ["Analytics", "Audit"], payloadExample: { table_id: "tbl_01HZ", occupied_duration_min: 92 } },
  { type: "ReviewReceived", version: 1, desc: "Nueva reseña recibida", consumers: ["CRM", "AI", "Notifications", "Audit"], payloadExample: { review_id: "rev_01HZ", platform: "google", rating: 5 } },
  { type: "ReviewReplied", version: 1, desc: "Respuesta enviada a reseña", consumers: ["Audit"], payloadExample: { review_id: "rev_01HZ", replied_by: "ai_agent" } },
  { type: "CampaignSent", version: 1, desc: "Campaña enviada", consumers: ["Analytics", "Notifications", "Audit"], payloadExample: { campaign_id: "cmp_01HZ", channel: "whatsapp" } },
  { type: "CampaignCompleted", version: 1, desc: "Campaña completada", consumers: ["Analytics", "Audit"], payloadExample: { campaign_id: "cmp_01HZ", delivered: 121 } },
  { type: "WaitlistEntryAdded", version: 1, desc: "Cliente añadido a lista de espera", consumers: ["CRM", "Notifications", "Audit"], payloadExample: { waitlist_id: "wl_01HZ", party_size: 3 } },
  { type: "WaitlistSeatOffered", version: 1, desc: "Mesa ofrecida a cliente en espera", consumers: ["Notifications", "Audit"], payloadExample: { waitlist_id: "wl_01HZ", table_id: "tbl_01HZ" } },
  { type: "MenuUpdated", version: 1, desc: "Carta o menú modificado", consumers: ["Webhooks", "Audit"], payloadExample: { menu_id: "menu_01HZ", changes: { items_added: 3 } } },
  { type: "MenuItemPriceChanged", version: 1, desc: "Precio de plato actualizado", consumers: ["Analytics", "Webhooks", "Audit"], payloadExample: { item_id: "itm_01HZ", old_price: 1200, new_price: 1400 } },
  { type: "StaffShiftStarted", version: 1, desc: "Turno de personal iniciado", consumers: ["Analytics", "Audit"], payloadExample: { staff_id: "stf_01HZ", shift: "evening" } },
  { type: "StaffShiftEnded", version: 1, desc: "Turno de personal finalizado", consumers: ["Analytics", "Audit"], payloadExample: { staff_id: "stf_01HZ", duration_min: 480 } },
  { type: "InventoryItemLow", version: 1, desc: "Stock de inventario bajo", consumers: ["Notifications", "Audit"], payloadExample: { item_id: "inv_01HZ", remaining: 2 } },
];

const GUARANTEES = [
  { label: "At-least-once delivery", icon: CheckCircle2 },
  { label: "Orden por partition key", icon: Hash },
  { label: "Consumers idempotentes", icon: RefreshCw },
  { label: "Dead Letter Queue", icon: AlertOctagon },
  { label: "Replay capability", icon: RotateCcw },
  { label: "Correlation IDs", icon: GitBranch },
  { label: "Audit trail", icon: ScrollText },
];

/* =====================================================================
 * Helpers
 * ===================================================================== */

function maskOrg(id: string) {
  if (id.length <= 12) return id;
  return id.slice(0, 8) + "••••" + id.slice(-4);
}

function relativeTime(ts: string) {
  return `hace ${Math.floor(Math.random() * 8) + 1} min`;
}

function getEventTypeColor(type: string): string {
  if (type.startsWith("Reservation")) return "text-[var(--gold)] bg-[var(--gold)]/10 border-[var(--gold)]/30";
  if (type.startsWith("Customer") || type.startsWith("Review")) return "text-[var(--teal)] bg-[var(--teal)]/10 border-[var(--teal)]/30";
  if (type.startsWith("Payment") || type.startsWith("Subscription")) return "text-emerald-300 bg-emerald-500/10 border-emerald-500/30";
  if (type.startsWith("Campaign") || type.startsWith("Waitlist")) return "text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-500/30";
  if (type.startsWith("Table") || type.startsWith("Inventory") || type.startsWith("Staff") || type.startsWith("Menu")) return "text-amber-300 bg-amber-500/10 border-amber-500/30";
  return "text-muted-foreground bg-foreground/5 border-border/60";
}

function getStatusMeta(s: EventStatus): { label: string; color: string; dot: string } {
  switch (s) {
    case "published":
      return { label: "Publicado", color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30", dot: "bg-emerald-400" };
    case "processing":
      return { label: "Procesando", color: "text-amber-300 bg-amber-500/10 border-amber-500/30", dot: "bg-amber-400" };
    case "completed":
      return { label: "Completado", color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30", dot: "bg-emerald-400" };
    case "failed":
      return { label: "Fallido", color: "text-rose-300 bg-rose-500/10 border-rose-500/30", dot: "bg-rose-400" };
    case "dlq":
      return { label: "DLQ", color: "text-rose-300 bg-rose-500/10 border-rose-500/30", dot: "bg-rose-500" };
  }
}

function getConsumerStatusMeta(s: ConsumerStatus): { label: string; color: string; dot: string } {
  switch (s) {
    case "pending":
      return { label: "Pendiente", color: "text-muted-foreground bg-foreground/5 border-border/60", dot: "bg-muted-foreground" };
    case "processing":
      return { label: "Procesando", color: "text-amber-300 bg-amber-500/10 border-amber-500/30", dot: "bg-amber-400 animate-pulse" };
    case "completed":
      return { label: "OK", color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30", dot: "bg-emerald-400" };
    case "failed":
      return { label: "Falló", color: "text-rose-300 bg-rose-500/10 border-rose-500/30", dot: "bg-rose-400" };
  }
}

function getSourceIcon(source: string) {
  switch (source) {
    case "reservations":
      return <CalendarIcon className="h-3.5 w-3.5" />;
    case "crm":
      return <Users className="h-3.5 w-3.5" />;
    case "billing":
      return <CreditCardIcon className="h-3.5 w-3.5" />;
    case "reviews":
      return <Star className="h-3.5 w-3.5" />;
    case "marketing":
      return <Megaphone className="h-3.5 w-3.5" />;
    case "floor":
      return <MapIcon className="h-3.5 w-3.5" />;
    default:
      return <Layers className="h-3.5 w-3.5" />;
  }
}

/* Inline icon set to avoid name collisions with lucide-react */
function CalendarIcon(p: { className?: string }) {
  return (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
function Users(p: { className?: string }) {
  return (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function CreditCardIcon(p: { className?: string }) {
  return (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}
function Star(p: { className?: string }) {
  return (
    <svg className={p.className} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
function Megaphone(p: { className?: string }) {
  return (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 11l18-8v18l-18-8v-2z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}
function MapIcon(p: { className?: string }) {
  return (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3z" />
      <path d="M9 3v15M15 6v15" />
    </svg>
  );
}

/* =====================================================================
 * Sub-componentes
 * ===================================================================== */

function DemoBadge() {
  return (
    <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/15">
      <Zap className="h-3 w-3 mr-1" aria-hidden /> demo
    </Badge>
  );
}

function ConsumerIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "CRM":
      return <Users className={className} aria-hidden />;
    case "Analytics":
      return <Activity className={className} aria-hidden />;
    case "AI":
      return <Brain className={className} aria-hidden />;
    case "Notifications":
      return <Bell className={className} aria-hidden />;
    case "Webhooks":
      return <Webhook className={className} aria-hidden />;
    case "Audit":
      return <ScrollText className={className} aria-hidden />;
    default:
      return <Boxes className={className} aria-hidden />;
  }
}

/* =====================================================================
 * Stats Bar
 * ===================================================================== */

function StatsBar() {
  const stats = [
    { label: "Eventos publicados hoy", value: "2.847", icon: Send, color: "text-[var(--gold)]" },
    { label: "Tiempo medio procesado", value: "89ms", icon: Clock, color: "text-[var(--teal)]" },
    { label: "Tasa de éxito", value: "99.8%", icon: CheckCircle2, color: "text-emerald-300" },
    { label: "Eventos fallidos", value: "3", icon: AlertTriangle, color: "text-amber-300" },
    { label: "DLQ count", value: "1", icon: AlertOctagon, color: "text-rose-300" },
    { label: "Throughput", value: "89 ev/min", icon: TrendingUp, color: "text-[var(--gold-soft)]" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="rp-glass rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase text-muted-foreground">
            <s.icon className={cn("h-3 w-3", s.color)} aria-hidden />
            <span>{s.label}</span>
          </div>
          <div className={cn("text-xl font-display mt-1", s.color)}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}

/* =====================================================================
 * Flow Diagram (SVG with animated dots)
 * ===================================================================== */

function FlowDiagram() {
  const reduce = useReducedMotion();
  const [active, setActive] = React.useState(true);

  const consumers = CONSUMERS;

  // Geometry — desktop layout
  const W = 880;
  const H = 360;
  const sourceX = 60;
  const busX = 280;
  const consumerX = 620;
  const consumerYStart = 30;
  const consumerYStep = 50;
  const sourceY = H / 2;
  const busY = H / 2;

  return (
    <div className="rp-glass rounded-xl p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Workflow className="h-4 w-4 text-[var(--gold)]" aria-hidden />
          <h4 className="text-sm font-medium">Pipeline de eventos</h4>
          <Badge variant="outline" className="text-[10px] border-border/60">
            {consumers.length} consumers
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => setActive((v) => !v)}
        >
          {active ? (
            <>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
              <span className="ml-1.5">Tiempo real</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-muted-foreground" aria-hidden />
              <span className="ml-1.5">Inactivo</span>
            </>
          )}
        </Button>
      </div>

      <div className="overflow-x-auto rp-scroll-thin -mx-2 px-2">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[640px] h-auto"
          role="img"
          aria-label="Diagrama de flujo de eventos: módulo fuente, event bus y 6 consumidores"
        >
          <defs>
            <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A8862A" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#E8C766" />
            </linearGradient>
            <linearGradient id="teal-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2BA89E" />
              <stop offset="100%" stopColor="#3DD6C9" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Source node */}
          <g transform={`translate(${sourceX - 50}, ${sourceY - 30})`}>
            <rect width="100" height="60" rx="10" className="fill-card stroke-[var(--gold)]/40" strokeWidth="1.5" />
            <g transform="translate(12, 18)">
              <rect width="20" height="20" rx="4" className="fill-[var(--gold)]/15" />
              <path d="M5 10 L9 14 L15 6" stroke="#D4AF37" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <text x="40" y="26" className="fill-foreground text-[11px] font-medium">Source</text>
            <text x="40" y="42" className="fill-muted-foreground text-[9px] font-mono">module</text>
          </g>

          {/* Bus (queue) node */}
          <g transform={`translate(${busX - 50}, ${busY - 40})`}>
            <rect width="100" height="80" rx="10" className="fill-card stroke-[var(--teal)]/40" strokeWidth="1.5" filter="url(#glow)" />
            <g transform="translate(40, 12)">
              <rect width="20" height="20" rx="4" className="fill-[var(--teal)]/15" />
              <path d="M4 7 H16 M4 10 H16 M4 13 H12" stroke="#3DD6C9" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </g>
            <text x="50" y="52" textAnchor="middle" className="fill-foreground text-[11px] font-medium">Event Bus</text>
            <text x="50" y="66" textAnchor="middle" className="fill-muted-foreground text-[9px] font-mono">Cloudflare Queues</text>
          </g>

          {/* Line from source to bus */}
          <line
            x1={sourceX + 50}
            y1={sourceY}
            x2={busX - 50}
            y2={busY}
            stroke="url(#gold-grad)"
            strokeWidth="2"
            strokeDasharray="6 4"
          />

          {/* Animated dot from source → bus */}
          {active && !reduce && (
            <>
              <circle r="4" fill="#D4AF37">
                <animateMotion dur="1.4s" repeatCount="indefinite" path={`M ${sourceX + 50} ${sourceY} L ${busX - 50} ${busY}`} />
              </circle>
              <circle r="3" fill="#E8C766" opacity="0.6">
                <animateMotion dur="1.4s" begin="0.5s" repeatCount="indefinite" path={`M ${sourceX + 50} ${sourceY} L ${busX - 50} ${busY}`} />
              </circle>
            </>
          )}

          {/* Consumer nodes */}
          {consumers.map((c, i) => {
            const cy = consumerYStart + i * consumerYStep;
            return (
              <g key={c.name} transform={`translate(${consumerX - 70}, ${cy - 14})`}>
                <rect width="180" height="36" rx="8" className="fill-card stroke-border" strokeWidth="1" />
                <circle cx="16" cy="18" r="4" className={active ? "fill-emerald-400" : "fill-muted-foreground"} >
                  {active && !reduce && (
                    <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite" begin={`${i * 0.18}s`} />
                  )}
                </circle>
                <text x="30" y="22" className="fill-foreground text-[11px] font-medium">{c.name}</text>
                <text x="170" y="22" textAnchor="end" className="fill-muted-foreground text-[9px] font-mono">consumer {i + 1}</text>
              </g>
            );
          })}

          {/* Lines from bus to each consumer */}
          {consumers.map((c, i) => {
            const cy = consumerYStart + i * consumerYStep + 4;
            return (
              <g key={`line-${c.name}`}>
                <path
                  d={`M ${busX + 50} ${busY} C ${(busX + consumerX) / 2} ${busY}, ${(busX + consumerX) / 2} ${cy}, ${consumerX - 70} ${cy}`}
                  fill="none"
                  stroke="url(#teal-grad)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.7"
                />
                {active && !reduce && (
                  <circle r="3" fill="#3DD6C9">
                    <animateMotion
                      dur="1.6s"
                      begin={`${i * 0.22}s`}
                      repeatCount="indefinite"
                      path={`M ${busX + 50} ${busY} C ${(busX + consumerX) / 2} ${busY}, ${(busX + consumerX) / 2} ${cy}, ${consumerX - 70} ${cy}`}
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden /> Consumer activo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[var(--gold)]" aria-hidden /> Flujo evento
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[var(--teal)]" aria-hidden /> Entrega consumer
        </span>
        {reduce && (
          <span className="text-amber-300">Animaciones pausadas (prefers-reduced-motion)</span>
        )}
      </div>
    </div>
  );
}

/* =====================================================================
 * Event Card
 * ===================================================================== */

function EventCard({ event }: { event: BusEvent }) {
  const [expanded, setExpanded] = React.useState(false);
  const [payloadOpen, setPayloadOpen] = React.useState(false);
  const reduce = useReducedMotion();
  const statusMeta = getStatusMeta(event.status);

  return (
    <motion.div
      layout
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rp-glass rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full p-3 sm:p-4 flex items-start gap-3 text-left hover:bg-foreground/[0.02] transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <code className="font-mono text-xs text-[var(--gold)]">{event.id}</code>
            <span className={cn(
              "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium border",
              getEventTypeColor(event.type)
            )}>
              {event.type}
            </span>
            <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] border border-border/60 bg-foreground/5 text-muted-foreground font-mono">
              v{event.version}
            </span>
            <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] border border-border/60 bg-foreground/5 text-muted-foreground">
              {getSourceIcon(event.source)}
              <span className="font-mono">{event.source}</span>
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
            <span className="font-mono">org: {maskOrg(event.organizationId)}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden /> {event.publishedAt} · {relativeTime(event.publishedAt)}
            </span>
            <span className="font-mono">partition: <span className="text-foreground/80">{event.partitionKey}</span></span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn(
            "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium border",
            statusMeta.color
          )}>
            <span className={cn("h-1.5 w-1.5 rounded-full", statusMeta.dot)} aria-hidden />
            {statusMeta.label}
          </span>
          {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden /> : <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/40"
          >
            <div className="p-4 space-y-4">
              {/* Consumer pipeline */}
              <div>
                <h5 className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Layers className="h-3 w-3" aria-hidden /> Pipeline de consumers ({event.consumers.length})
                </h5>
                <div className="space-y-1.5">
                  {event.consumers.map((c) => {
                    const cmeta = getConsumerStatusMeta(c.status);
                    return (
                      <div
                        key={c.name}
                        className={cn(
                          "flex items-center gap-3 rounded-lg p-2.5 border",
                          c.status === "failed" ? "border-rose-500/30 bg-rose-500/5" : "border-border/40 bg-foreground/[0.02]"
                        )}
                      >
                        <ConsumerIcon name={c.name} className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{c.name}</span>
                            <span className={cn(
                              "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] border",
                              cmeta.color
                            )}>
                              <span className={cn("h-1.5 w-1.5 rounded-full", cmeta.dot)} aria-hidden />
                              {cmeta.label}
                            </span>
                          </div>
                          {c.errorMsg && (
                            <p className="text-[11px] text-rose-300/90 mt-1 leading-snug">{c.errorMsg}</p>
                          )}
                          {c.latencyMs !== undefined && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                              {c.latencyMs}ms · {c.attempts} intento{c.attempts !== 1 ? "s" : ""}
                            </p>
                          )}
                          {c.latencyMs === undefined && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                              {c.attempts} intento{c.attempts !== 1 ? "s" : ""}
                            </p>
                          )}
                        </div>
                        {c.status === "failed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px] shrink-0"
                            onClick={() => toast({ title: `Reintentando consumer ${c.name} (demo)`, description: "Evento reencolado" })}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" aria-hidden /> Reintentar
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg bg-foreground/5 p-2.5">
                  <div className="text-[10px] uppercase text-muted-foreground">Correlation ID</div>
                  <code className="font-mono text-xs text-foreground mt-0.5 block break-all">{event.correlationId}</code>
                </div>
                <div className="rounded-lg bg-foreground/5 p-2.5">
                  <div className="text-[10px] uppercase text-muted-foreground">Partition key</div>
                  <code className="font-mono text-xs text-foreground mt-0.5 block break-all">{event.partitionKey}</code>
                </div>
              </div>

              {/* Payload (collapsible JSON) */}
              <Collapsible open={payloadOpen} onOpenChange={setPayloadOpen}>
                <div className="flex items-center justify-between">
                  <h5 className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                    <FileJson className="h-3 w-3" aria-hidden /> Payload (PII redacted)
                  </h5>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 text-[11px]">
                      {payloadOpen ? "Ocultar" : "Ver"}
                      {payloadOpen ? <ChevronDown className="h-3 w-3 ml-1" aria-hidden /> : <ChevronRight className="h-3 w-3 ml-1" aria-hidden />}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <pre className="mt-2 p-3 rounded-lg bg-black/30 border border-border/40 text-[11px] font-mono text-foreground/80 overflow-x-auto rp-scroll-thin max-h-64">
                    {JSON.stringify(event.payload, null, 2)}
                  </pre>
                </CollapsibleContent>
              </Collapsible>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
                {(event.status === "failed" || event.status === "dlq") && (
                  <Button
                    size="sm"
                    className="h-8 bg-[var(--gold)] hover:bg-[var(--gold-deep)] text-black"
                    onClick={() => toast({ title: "Evento reprocesado (demo)", description: `${event.id} reencolado al event bus` })}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Replay
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    navigator.clipboard?.writeText(event.id).catch(() => {});
                    toast({ title: "ID copiado (demo)" });
                  }}
                >
                  <Copy className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Copiar ID
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => toast({ title: "Trazas abiertas (demo)", description: `Buscando ${event.correlationId}` })}
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Ver trazas
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* =====================================================================
 * DLQ Panel
 * ===================================================================== */

function DLQPanel() {
  const [reprocessApp, setReprocessApp] = React.useState<BusEvent | null>(null);
  const [detailApp, setDetailApp] = React.useState<BusEvent | null>(null);
  const dlqEvents = EVENTS.filter((e) => e.status === "dlq");

  return (
    <div className="rp-glass rounded-xl p-4 border border-rose-500/30">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <AlertOctagon className="h-4 w-4 text-rose-300" aria-hidden />
          <h4 className="text-sm font-medium">Dead Letter Queue (DLQ)</h4>
          <Badge className="bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/15">
            {dlqEvents.length} eventos
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => toast({ title: "Reprocesando todos los eventos DLQ (demo)" })}
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Reprocesar todos
        </Button>
      </div>

      {dlqEvents.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-400" aria-hidden />
          No hay eventos en DLQ
        </div>
      ) : (
        <div className="space-y-3">
          {dlqEvents.map((e) => {
            const failedConsumer = e.consumers.find((c) => c.status === "failed");
            return (
              <div key={e.id} className="rounded-lg border border-rose-500/30 bg-rose-500/[0.04] p-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="font-mono text-xs text-rose-300">{e.id}</code>
                      <span className={cn(
                        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium border",
                        getEventTypeColor(e.type)
                      )}>
                        {e.type}
                      </span>
                      <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] border border-border/60 bg-foreground/5 text-muted-foreground font-mono">
                        v{e.version}
                      </span>
                    </div>
                    {e.error && (
                      <p className="text-xs text-rose-200/90 mt-1.5">{e.error}</p>
                    )}
                    {failedConsumer && (
                      <div className="mt-2 text-[11px] text-muted-foreground">
                        <span className="text-rose-300 font-medium">Consumer fallido:</span>{" "}
                        <span className="font-mono text-foreground">{failedConsumer.name}</span>
                        {" · "}
                        <span>{failedConsumer.attempts} intentos</span>
                        {" · "}
                        <span>último: hace 4 min</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px]"
                      onClick={() => setDetailApp(e)}
                    >
                      <Eye className="h-3 w-3 mr-1" aria-hidden /> Detalle
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 text-[11px] bg-[var(--gold)] hover:bg-[var(--gold-deep)] text-black"
                      onClick={() => setReprocessApp(e)}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" aria-hidden /> Reprocesar
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!reprocessApp} onOpenChange={(o) => !o && setReprocessApp(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reprocesar evento</AlertDialogTitle>
            <AlertDialogDescription>
              El evento <span className="font-mono text-rose-300">{reprocessApp?.id}</span> volverá a la cola
              principal y se reintentará en todos los consumers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => toast({ title: "Evento reprocesado (demo)", description: "Movido de DLQ a cola principal" })}
            >
              Reprocesar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!detailApp} onOpenChange={(o) => !o && setDetailApp(null)}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto rp-scroll-thin">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-rose-300" aria-hidden /> Detalle DLQ
            </DialogTitle>
            <DialogDescription>
              Información completa del evento fallido.
            </DialogDescription>
          </DialogHeader>
          {detailApp && (
            <div className="space-y-3 py-2">
              <div className="rounded-lg bg-rose-500/5 border border-rose-500/30 p-3">
                <div className="text-[10px] uppercase text-muted-foreground">Error</div>
                <p className="text-xs text-rose-200/90 mt-1">{detailApp.error}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-foreground/5 p-2.5">
                  <div className="text-[10px] uppercase text-muted-foreground">Event ID</div>
                  <code className="font-mono text-xs">{detailApp.id}</code>
                </div>
                <div className="rounded-lg bg-foreground/5 p-2.5">
                  <div className="text-[10px] uppercase text-muted-foreground">Tipo</div>
                  <div className="text-xs">{detailApp.type}</div>
                </div>
                <div className="rounded-lg bg-foreground/5 p-2.5">
                  <div className="text-[10px] uppercase text-muted-foreground">Partition</div>
                  <code className="font-mono text-[10px] break-all">{detailApp.partitionKey}</code>
                </div>
                <div className="rounded-lg bg-foreground/5 p-2.5">
                  <div className="text-[10px] uppercase text-muted-foreground">Correlation</div>
                  <code className="font-mono text-[10px] break-all">{detailApp.correlationId}</code>
                </div>
              </div>
              <div>
                <h5 className="text-[10px] uppercase text-muted-foreground mb-2">Historial de reintentos</h5>
                <div className="space-y-1.5">
                  {detailApp.consumers.filter((c) => c.status === "failed").map((c) => (
                    <div key={c.name} className="rounded-lg border border-rose-500/30 bg-rose-500/[0.04] p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">{c.name}</span>
                        <span className="text-[10px] text-rose-300">{c.attempts} intentos</span>
                      </div>
                      <p className="text-[11px] text-rose-200/80 mt-1">{c.errorMsg}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-[10px] uppercase text-muted-foreground mb-2">Payload</h5>
                <pre className="p-3 rounded-lg bg-black/30 border border-border/40 text-[11px] font-mono text-foreground/80 overflow-x-auto rp-scroll-thin max-h-40">
                  {JSON.stringify(detailApp.payload, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =====================================================================
 * Event Catalog (collapsible)
 * ===================================================================== */

function EventCatalog() {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<string | null>(null);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rp-glass rounded-xl overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-foreground/[0.02] transition-colors min-h-[44px]">
            <div className="flex items-center gap-2">
              <Boxes className="h-4 w-4 text-[var(--teal)]" aria-hidden />
              <h4 className="text-sm font-medium">Catálogo de eventos</h4>
              <Badge variant="outline" className="text-[10px] border-border/60">
                {EVENT_CATALOG.length} tipos
              </Badge>
            </div>
            {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden /> : <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-border/40 p-3 space-y-2 max-h-[28rem] overflow-y-auto rp-scroll-thin">
            {EVENT_CATALOG.map((ev) => {
              const isActive = active === ev.type;
              return (
                <div key={ev.type} className="rounded-lg border border-border/40 bg-foreground/[0.02] overflow-hidden">
                  <button
                    onClick={() => setActive(isActive ? null : ev.type)}
                    className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-foreground/[0.02] min-h-[44px]"
                    aria-expanded={isActive}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn(
                        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium border",
                        getEventTypeColor(ev.type)
                      )}>
                        {ev.type}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">v{ev.version}</span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">{ev.desc}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground hidden md:inline">{ev.consumers.length} consumers</span>
                      {isActive ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />}
                    </div>
                  </button>
                  {isActive && (
                    <div className="px-3 pb-3 space-y-3 border-t border-border/30 pt-3">
                      <p className="text-xs text-muted-foreground sm:hidden">{ev.desc}</p>
                      <div>
                        <h6 className="text-[10px] uppercase text-muted-foreground mb-1.5">Consumers suscritos</h6>
                        <div className="flex flex-wrap gap-1.5">
                          {ev.consumers.map((c) => (
                            <span key={c} className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] border border-border/60 bg-foreground/5 text-muted-foreground">
                              <ConsumerIcon name={c} className="h-2.5 w-2.5" />
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h6 className="text-[10px] uppercase text-muted-foreground mb-1.5">Esquema de payload (ejemplo)</h6>
                        <pre className="p-2.5 rounded-lg bg-black/30 border border-border/40 text-[11px] font-mono text-foreground/80 overflow-x-auto rp-scroll-thin">
                          {JSON.stringify(ev.payloadExample, null, 2)}
                        </pre>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => toast({ title: `Webhook suscrito a ${ev.type} (demo)` })}
                      >
                        <Webhook className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Suscribir webhook
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

/* =====================================================================
 * Guarantees Panel
 * ===================================================================== */

function GuaranteesPanel() {
  return (
    <div className="rp-glass rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="h-4 w-4 text-[var(--teal)]" aria-hidden />
        <h4 className="text-sm font-medium">Garantías del event bus</h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {GUARANTEES.map((g) => (
          <div key={g.label} className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-2.5">
            <span className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-emerald-500/10">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
            </span>
            <span className="text-xs text-foreground/90">{g.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =====================================================================
 * Componente principal
 * ===================================================================== */

export function DevEventBus() {
  const reduce = useReducedMotion();
  const [filter, setFilter] = React.useState<"all" | "active" | "failed">("all");

  const filtered = React.useMemo(() => {
    if (filter === "failed") return EVENTS.filter((e) => e.status === "failed" || e.status === "dlq");
    if (filter === "active") return EVENTS.filter((e) => e.status === "processing" || e.status === "published");
    return EVENTS;
  }, [filter]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Radio className="h-5 w-5 text-[var(--gold)]" aria-hidden />
              <h1 className="font-display text-2xl tracking-tight">Event Bus</h1>
              <DemoBadge />
              <Badge className="bg-[var(--teal)]/10 text-[var(--teal)] border-[var(--teal)]/30 hover:bg-[var(--teal)]/10">
                <Server className="h-3 w-3 mr-1" aria-hidden /> Cloudflare Queues
              </Badge>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Tiempo real
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Visualización del flujo de eventos en tiempo real · Source → Bus → Consumers · con DLQ y garantías.
            </p>
          </div>
        </header>

        <StatsBar />

        <FlowDiagram />

        <section aria-labelledby="stream-heading" className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 id="stream-heading" className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-[var(--teal)]" aria-hidden /> Stream de eventos
            </h3>
            <div className="flex items-center gap-1 bg-foreground/5 p-0.5 rounded-md">
              {(["all", "active", "failed"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "min-h-[32px] px-3 py-1 text-xs rounded transition-colors",
                    filter === f ? "bg-[var(--gold)] text-black" : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-pressed={filter === f}
                >
                  {f === "all" ? "Todos" : f === "active" ? "Activos" : "Fallidos"}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-10 text-sm text-muted-foreground">
                No hay eventos en este filtro.
              </div>
            )}
          </div>
        </section>

        <section aria-labelledby="dlq-heading" className="space-y-3">
          <h3 id="dlq-heading" className="text-sm font-medium flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-rose-300" aria-hidden /> Dead Letter Queue
          </h3>
          <DLQPanel />
        </section>

        <section aria-labelledby="catalog-heading">
          <h3 id="catalog-heading" className="sr-only">Catálogo de eventos</h3>
          <EventCatalog />
        </section>

        <section aria-labelledby="guarantees-heading">
          <h3 id="guarantees-heading" className="sr-only">Garantías del event bus</h3>
          <GuaranteesPanel />
        </section>

        <footer className="text-[11px] text-muted-foreground text-center pt-2">
          <ShieldCheck className="h-3 w-3 inline mr-1" aria-hidden />
          Event Bus respaldado por Cloudflare Queues · At-least-once delivery · idempotencia obligatoria en consumers ·
          audit trail inmutable.
        </footer>
      </div>
    </TooltipProvider>
  );
}

export default DevEventBus;
