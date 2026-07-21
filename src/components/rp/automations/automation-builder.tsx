"use client";

/* ============================================================================
 * RestoPanel · Automation Builder
 * Visual flow builder: Trigger → Conditions → Actions (with Wait / Branch).
 * PROD-AUTOMATIONS · demo-navegable · dark theme (gold #D4AF37 / teal #3DD6C9)
 * ========================================================================== */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { LucideIcon } from "lucide-react";
import {
  Zap,
  GitBranch,
  Send,
  Clock,
  Workflow,
  Plus,
  X,
  Play,
  Copy,
  Save,
  ChevronRight,
  History,
  MessageCircle,
  Mail,
  Tag,
  ListTodo,
  Star,
  Gift,
  BellRing,
  CalendarCheck,
  PhoneCall,
  Users,
  Info,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* --------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------ */

type NodeType = "trigger" | "condition" | "action" | "wait" | "branch";

type TriggerEvent =
  | "ReservationCreated"
  | "ReservationConfirmed"
  | "ReservationCancelled"
  | "CustomerVisited"
  | "CustomerNoShow"
  | "ReviewReceived"
  | "Birthday"
  | "CustomerInactive"
  | "LoyaltyTierUp"
  | "WaitlistSeat";

type ActionType =
  | "send_email"
  | "send_whatsapp"
  | "send_sms"
  | "add_tag"
  | "remove_tag"
  | "create_task"
  | "send_review_request"
  | "apply_loyalty_points"
  | "notify_staff"
  | "update_reservation_status";

type Operator =
  | "=="
  | "!="
  | ">"
  | "<"
  | ">="
  | "<="
  | "contains"
  | "not_contains"
  | "in"
  | "not_in";

type WaitUnit = "minutes" | "hours" | "days";
type WaitAnchor = "before_event" | "after_event" | "absolute";

interface NodeConfig {
  event?: TriggerEvent;
  field?: string;
  operator?: Operator;
  value?: string;
  actionType?: ActionType;
  template?: string;
  variables?: string;
  duration?: number;
  unit?: WaitUnit;
  anchor?: WaitAnchor;
  ifLabel?: string;
  elseLabel?: string;
  // action-type-specific extras
  assignee?: string;
  channel?: string;
  status?: string;
}

interface FlowNode {
  id: string;
  type: NodeType;
  title: string;
  config: NodeConfig;
}

interface SimLine {
  ts: string;
  level: "info" | "success" | "warn" | "error";
  msg: string;
}

interface Execution {
  id: string;
  flow: string;
  startedAt: string;
  duration: string;
  status: "success" | "failed" | "pending";
  triggeredBy: string;
}

/* --------------------------------------------------------------------------
 * Identity helper
 * ------------------------------------------------------------------------ */

let _idCounter = 0;
function uid(): string {
  _idCounter += 1;
  return `n_${_idCounter}_${Math.random().toString(36).slice(2, 7)}`;
}

/* --------------------------------------------------------------------------
 * Static catalog data
 * ------------------------------------------------------------------------ */

const TRIGGER_EVENTS: { value: TriggerEvent; label: string; hint: string }[] = [
  { value: "ReservationCreated", label: "Reserva creada", hint: "Nueva reserva en el libro" },
  { value: "ReservationConfirmed", label: "Reserva confirmada", hint: "Cliente confirma asistencia" },
  { value: "ReservationCancelled", label: "Reserva cancelada", hint: "Cliente cancela reserva" },
  { value: "CustomerVisited", label: "Cliente visitó el local", hint: "Servicio completado" },
  { value: "CustomerNoShow", label: "Cliente no-show", hint: "Reserva no atendida" },
  { value: "ReviewReceived", label: "Reseña recibida", hint: "Nueva reseña en Google" },
  { value: "Birthday", label: "Cumpleaños del cliente", hint: "Aniversario del cliente" },
  { value: "CustomerInactive", label: "Cliente inactivo", hint: "Sin visitas en 90 días" },
  { value: "LoyaltyTierUp", label: "Sube de nivel de fidelidad", hint: "Cambio de tier" },
  { value: "WaitlistSeat", label: "Mesa liberada en waitlist", hint: "Cancelación abre sitio" },
];

const CONDITION_FIELDS: { value: string; label: string }[] = [
  { value: "party_size", label: "Tamaño del grupo" },
  { value: "confirmed", label: "Confirmada" },
  { value: "reservation_status", label: "Estado de reserva" },
  { value: "customer_tags", label: "Etiquetas del cliente" },
  { value: "visit_count", label: "Nº de visitas" },
  { value: "avg_ticket", label: "Ticket medio (€)" },
  { value: "last_visit_days", label: "Días desde última visita" },
  { value: "reservation_channel", label: "Canal de reserva" },
  { value: "time_of_day", label: "Franja horaria" },
  { value: "loyalty_tier", label: "Nivel de fidelidad" },
];

const OPERATORS: { value: Operator; label: string }[] = [
  { value: "==", label: "es igual a" },
  { value: "!=", label: "es distinto de" },
  { value: ">", label: "mayor que" },
  { value: "<", label: "menor que" },
  { value: ">=", label: "mayor o igual que" },
  { value: "<=", label: "menor o igual que" },
  { value: "contains", label: "contiene" },
  { value: "not_contains", label: "no contiene" },
  { value: "in", label: "está en (lista)" },
  { value: "not_in", label: "no está en (lista)" },
];

const WAIT_UNITS: { value: WaitUnit; label: string; short: string }[] = [
  { value: "minutes", label: "minutos", short: "min" },
  { value: "hours", label: "horas", short: "h" },
  { value: "days", label: "días", short: "d" },
];

const WAIT_ANCHORS: { value: WaitAnchor; label: string }[] = [
  { value: "before_event", label: "antes del evento" },
  { value: "after_event", label: "después del evento" },
  { value: "absolute", label: "fecha/hora absoluta" },
];

const ACTION_TEMPLATES: Partial<Record<ActionType, { value: string; label: string }[]>> = {
  send_whatsapp: [
    { value: "recordatorio_reserva_v2", label: "Recordatorio de reserva v2" },
    { value: "reconfirmacion_t2h", label: "Reconfirmación T-2h" },
    { value: "cumpleanos_felicitacion", label: "Felicitación de cumpleaños" },
    { value: "winback_90d", label: "Winback 90 días" },
  ],
  send_email: [
    { value: "newsletter_semanal", label: "Newsletter semanal" },
    { value: "oferta_cumpleanos", label: "Oferta de cumpleaños" },
    { value: "winback_email", label: "Email de winback" },
    { value: "confirmacion_reserva", label: "Confirmación de reserva" },
  ],
  send_sms: [
    { value: "recordatorio_sms", label: "Recordatorio SMS" },
    { value: "confirmacion_sms", label: "Confirmación SMS" },
  ],
  send_review_request: [
    { value: "review_postvisita", label: "Post-visita estándar" },
    { value: "review_targeted", label: "Dirigida a clientes VIP" },
  ],
};

const STAFF_CHANNELS: { value: string; label: string }[] = [
  { value: "slack", label: "Slack" },
  { value: "whatsapp_internal", label: "WhatsApp interno" },
  { value: "dashboard", label: "Dashboard (app)" },
  { value: "tablet_maitre", label: "Tablet maître" },
];

const RES_STATUSES: { value: string; label: string }[] = [
  { value: "confirmed", label: "Confirmada" },
  { value: "cancelled", label: "Cancelada" },
  { value: "seated", label: "Sentados" },
  { value: "no_show", label: "No-show" },
  { value: "finished", label: "Finalizada" },
];

/* --------------------------------------------------------------------------
 * Node-type metadata + accent system
 * ------------------------------------------------------------------------ */

type Accent = "gold" | "teal" | "emerald" | "amber" | "fuchsia";

const NODE_TYPE_META: Record<
  NodeType,
  { label: string; icon: LucideIcon; accent: Accent; description: string; defaultTitle: string }
> = {
  trigger: { label: "Disparador", icon: Zap, accent: "gold", description: "Evento que inicia el flujo", defaultTitle: "Nuevo disparador" },
  condition: { label: "Condición", icon: GitBranch, accent: "teal", description: "Lógica if/then", defaultTitle: "Nueva condición" },
  action: { label: "Acción", icon: Send, accent: "emerald", description: "Ejecuta un resultado", defaultTitle: "Nueva acción" },
  wait: { label: "Espera", icon: Clock, accent: "amber", description: "Retrasa la ejecución", defaultTitle: "Nueva espera" },
  branch: { label: "Bifurcación", icon: Workflow, accent: "fuchsia", description: "Camino si/no", defaultTitle: "Nueva bifurcación" },
};

const ACCENT: Record<
  Accent,
  { chip: string; ring: string; text: string; dot: string }
> = {
  gold: {
    chip: "bg-[var(--gold)]/15 text-[var(--gold)] border-[var(--gold)]/30",
    ring: "ring-2 ring-[var(--gold)]/70 rp-glow-gold",
    text: "text-[var(--gold)]",
    dot: "bg-[var(--gold)]",
  },
  teal: {
    chip: "bg-[var(--teal)]/15 text-[var(--teal)] border-[var(--teal)]/30",
    ring: "ring-2 ring-[var(--teal)]/70 rp-glow-teal",
    text: "text-[var(--teal)]",
    dot: "bg-[var(--teal)]",
  },
  emerald: {
    chip: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
    ring: "ring-2 ring-emerald-400/60",
    text: "text-emerald-300",
    dot: "bg-emerald-400",
  },
  amber: {
    chip: "bg-amber-400/15 text-amber-300 border-amber-400/30",
    ring: "ring-2 ring-amber-400/60",
    text: "text-amber-300",
    dot: "bg-amber-400",
  },
  fuchsia: {
    chip: "bg-fuchsia-400/15 text-fuchsia-300 border-fuchsia-400/30",
    ring: "ring-2 ring-fuchsia-400/60",
    text: "text-fuchsia-300",
    dot: "bg-fuchsia-400",
  },
};

const ACTION_META: Record<
  ActionType,
  {
    label: string;
    icon: LucideIcon;
    verb: (c: NodeConfig) => string;
    successMsg: string;
  }
> = {
  send_whatsapp: {
    label: "Enviar WhatsApp",
    icon: MessageCircle,
    verb: () => "enviar WhatsApp",
    successMsg: "Mensaje entregado a +34 612 88 21 04 (wamid.6AB3f0…)",
  },
  send_email: {
    label: "Enviar email",
    icon: Mail,
    verb: () => "enviar email",
    successMsg: "Email encolado a SES (msg_id 0102019…)",
  },
  send_sms: {
    label: "Enviar SMS",
    icon: Send,
    verb: () => "enviar SMS",
    successMsg: "SMS entregado (twilio SM9f3…)",
  },
  add_tag: {
    label: "Añadir etiqueta",
    icon: Tag,
    verb: (c) => `añadir etiqueta "${c.value || "VIP"}"`,
    successMsg: "Etiqueta aplicada al perfil del cliente",
  },
  remove_tag: {
    label: "Quitar etiqueta",
    icon: Tag,
    verb: (c) => `quitar etiqueta "${c.value || "VIP"}"`,
    successMsg: "Etiqueta retirada del perfil",
  },
  create_task: {
    label: "Crear tarea",
    icon: ListTodo,
    verb: (c) => `crear tarea "${c.value || "Sin título"}"`,
    successMsg: "Tarea creada y asignada (TASK-204)",
  },
  send_review_request: {
    label: "Solicitar reseña",
    icon: Star,
    verb: () => "solicitar reseña",
    successMsg: "Formulario de reseña enviado (conversión histórica 12%)",
  },
  apply_loyalty_points: {
    label: "Sumar puntos",
    icon: Gift,
    verb: (c) => `sumar ${c.value || "0"} puntos`,
    successMsg: "Puntos abonados al saldo de fidelidad",
  },
  notify_staff: {
    label: "Notificar equipo",
    icon: BellRing,
    verb: (c) => `notificar equipo (${c.channel || "slack"})`,
    successMsg: "Notificación entregada al canal #servicio",
  },
  update_reservation_status: {
    label: "Actualizar reserva",
    icon: CalendarCheck,
    verb: (c) => `marcar reserva ${c.status || "confirmed"}`,
    successMsg: "Estado de reserva actualizado en D1",
  },
};

const DEFAULT_CONFIG: Record<NodeType, NodeConfig> = {
  trigger: { event: "ReservationCreated" },
  condition: { field: "party_size", operator: ">", value: "4" },
  action: { actionType: "send_whatsapp", template: "recordatorio_reserva_v2", variables: "{{customer.first_name}}" },
  wait: { duration: 1, unit: "hours", anchor: "before_event" },
  branch: { ifLabel: "Confirmada", elseLabel: "Pendiente" },
};

const NODE_TYPE_ORDER: NodeType[] = ["trigger", "condition", "action", "wait", "branch"];

/* --------------------------------------------------------------------------
 * Templates
 * ------------------------------------------------------------------------ */

interface Template {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  accent: Accent;
  build: () => FlowNode[];
}

const TEMPLATES: Template[] = [
  {
    id: "recordatorio",
    name: "Recordatorio de reserva",
    description: "WhatsApp 24h antes si la reserva está confirmada.",
    icon: CalendarCheck,
    accent: "gold",
    build: () => [
      { id: uid(), type: "trigger", title: "Reserva creada", config: { event: "ReservationCreated" } },
      { id: uid(), type: "wait", title: "Esperar 24h antes", config: { duration: 24, unit: "hours", anchor: "before_event" } },
      { id: uid(), type: "condition", title: "¿Confirmada?", config: { field: "confirmed", operator: "==", value: "true" } },
      { id: uid(), type: "action", title: "Recordatorio WhatsApp", config: { actionType: "send_whatsapp", template: "recordatorio_reserva_v2", variables: "{{customer.first_name}}, {{reservation.date}}" } },
    ],
  },
  {
    id: "reconfirmacion",
    name: "Reconfirmación T-2h",
    description: "Pide reconfirmación 2h antes del servicio.",
    icon: PhoneCall,
    accent: "teal",
    build: () => [
      { id: uid(), type: "trigger", title: "Reserva confirmada", config: { event: "ReservationConfirmed" } },
      { id: uid(), type: "wait", title: "Esperar 2h antes", config: { duration: 2, unit: "hours", anchor: "before_event" } },
      { id: uid(), type: "action", title: "Reconfirmación WhatsApp", config: { actionType: "send_whatsapp", template: "reconfirmacion_t2h", variables: "{{customer.first_name}}" } },
    ],
  },
  {
    id: "cumpleanos",
    name: "Cumpleaños",
    description: "Felicitación + oferta el día del cumpleaños.",
    icon: Gift,
    accent: "amber",
    build: () => [
      { id: uid(), type: "trigger", title: "Cumpleaños", config: { event: "Birthday" } },
      { id: uid(), type: "condition", title: "¿Cliente válido?", config: { field: "loyalty_tier", operator: "!=", value: "menor" } },
      { id: uid(), type: "action", title: "Email felicitación", config: { actionType: "send_email", template: "oferta_cumpleanos", variables: "{{customer.first_name}}" } },
      { id: uid(), type: "action", title: "Etiqueta cumpleaños", config: { actionType: "add_tag", value: "cumpleanos" } },
    ],
  },
  {
    id: "winback",
    name: "Recuperación inactivos 90d",
    description: "Winback por email a clientes sin visitar en 90 días.",
    icon: Users,
    accent: "fuchsia",
    build: () => [
      { id: uid(), type: "trigger", title: "Cliente inactivo", config: { event: "CustomerInactive" } },
      { id: uid(), type: "condition", title: "¿Visitas previas ≥ 2?", config: { field: "visit_count", operator: ">=", value: "2" } },
      { id: uid(), type: "action", title: "Email winback", config: { actionType: "send_email", template: "winback_email", variables: "{{customer.first_name}}" } },
      { id: uid(), type: "branch", title: "¿Abrió el email?", config: { ifLabel: "Abrió", elseLabel: "No abrió" } },
      { id: uid(), type: "action", title: "SMS follow-up", config: { actionType: "send_sms", template: "recordatorio_sms", variables: "{{customer.first_name}}" } },
    ],
  },
  {
    id: "review",
    name: "Solicitud de reseña post-servicio",
    description: "Pide reseña 2h después de la visita.",
    icon: Star,
    accent: "teal",
    build: () => [
      { id: uid(), type: "trigger", title: "Cliente visitó", config: { event: "CustomerVisited" } },
      { id: uid(), type: "wait", title: "Esperar 2h después", config: { duration: 2, unit: "hours", anchor: "after_event" } },
      { id: uid(), type: "condition", title: "¿Ticket medio alto?", config: { field: "avg_ticket", operator: ">=", value: "60" } },
      { id: uid(), type: "action", title: "Solicitar reseña", config: { actionType: "send_review_request", template: "review_postvisita", variables: "{{customer.first_name}}" } },
    ],
  },
];

/* --------------------------------------------------------------------------
 * Execution history (demo)
 * ------------------------------------------------------------------------ */

const HISTORY: Execution[] = [
  { id: "RUN-2841", flow: "Recordatorio de reserva", startedAt: "Hoy · 10:32", duration: "1.2s", status: "success", triggeredBy: "ReservationCreated · RES-9182" },
  { id: "RUN-2840", flow: "Reconfirmación T-2h", startedAt: "Hoy · 09:15", duration: "0.8s", status: "success", triggeredBy: "ReservationConfirmed · RES-9177" },
  { id: "RUN-2839", flow: "Solicitud de reseña post-servicio", startedAt: "Ayer · 22:14", duration: "2.1s", status: "failed", triggeredBy: "CustomerVisited · VIS-4402" },
  { id: "RUN-2838", flow: "Cumpleaños", startedAt: "Ayer · 08:00", duration: "1.5s", status: "success", triggeredBy: "Birthday · cust_8821" },
  { id: "RUN-2837", flow: "Recordatorio de reserva", startedAt: "Ayer · 10:30", duration: "—", status: "pending", triggeredBy: "Wait programado · RES-9165" },
];

/* --------------------------------------------------------------------------
 * Pure helpers: summaries + simulation log
 * ------------------------------------------------------------------------ */

function nodeSummary(node: FlowNode): string {
  switch (node.type) {
    case "trigger": {
      const e = TRIGGER_EVENTS.find((t) => t.value === node.config.event);
      return `Cuando: ${e?.label ?? node.config.event ?? "—"}`;
    }
    case "condition":
      return `Si: ${node.config.field ?? "—"} ${node.config.operator ?? "=="} ${node.config.value ?? "—"}`;
    case "action": {
      const a = ACTION_META[node.config.actionType ?? "send_whatsapp"];
      return `Entonces: ${a.verb(node.config)}`;
    }
    case "wait": {
      const u = WAIT_UNITS.find((x) => x.value === node.config.unit);
      const anchor = WAIT_ANCHORS.find((x) => x.value === node.config.anchor);
      return `Esperar: ${node.config.duration ?? 0}${u?.short ?? "h"}${anchor ? ` · ${anchor.label}` : ""}`;
    }
    case "branch":
      return `Si: ${node.config.ifLabel ?? "—"} · Si no: ${node.config.elseLabel ?? "—"}`;
    default:
      return "";
  }
}

function nodeDetail(node: FlowNode): string | null {
  if (node.type === "action") {
    const at = node.config.actionType;
    if (at && ACTION_TEMPLATES[at] && node.config.template) {
      return `plantilla: ${node.config.template}`;
    }
    if (at === "add_tag" || at === "remove_tag" || at === "create_task" || at === "apply_loyalty_points") {
      return `valor: ${node.config.value ?? "—"}`;
    }
    if (at === "notify_staff") return `canal: ${node.config.channel ?? "—"}`;
    if (at === "update_reservation_status") return `estado: ${node.config.status ?? "—"}`;
  }
  return null;
}

function buildSimLog(nodes: FlowNode[], active: boolean, flowName: string): { runId: string; lines: SimLine[] } {
  const lines: SimLine[] = [];
  const start = new Date();
  const at = (sec: number) => {
    const d = new Date(start.getTime() + sec * 1000);
    return d.toTimeString().slice(0, 8);
  };
  const runId = `RUN-${2000 + Math.floor(Math.random() * 7000)}`;
  lines.push({ ts: at(0), level: "info", msg: `Ejecución iniciada — flujo "${flowName}" (#${runId})` });
  lines.push({ ts: at(0), level: "info", msg: `Modo: dry-run · ${nodes.length} pasos en cola · datos demo` });
  if (!active) {
    lines.push({ ts: at(0), level: "warn", msg: "El flujo está pausado en producción — la simulación recorre los pasos igualmente." });
  }
  let t = 0.2;
  for (const n of nodes) {
    t += 0.05;
    const ts = at(Math.floor(t));
    switch (n.type) {
      case "trigger": {
        const e = TRIGGER_EVENTS.find((x) => x.value === n.config.event);
        lines.push({ ts, level: "info", msg: `▸ Trigger: ${e?.label ?? n.config.event} — coincidencia encontrada (RES-9182, mesa 14, 4 pax)` });
        lines.push({ ts, level: "info", msg: `  Cliente resuelto: Marta Ruiz (cust_8821, +34 612 88 21 04)` });
        break;
      }
      case "wait": {
        const u = WAIT_UNITS.find((x) => x.value === n.config.unit);
        const anchor = WAIT_ANCHORS.find((x) => x.value === n.config.anchor);
        lines.push({ ts, level: "info", msg: `▸ Wait: programando ${n.config.duration ?? 0}${u?.short ?? "h"} ${anchor?.label ?? ""}` });
        lines.push({ ts, level: "info", msg: `  Ejecución pausada — reanudará al alcanzar el ancla` });
        t += 1;
        lines.push({ ts: at(Math.floor(t)), level: "info", msg: `  ── salto simulado al instante de reanudación ──` });
        break;
      }
      case "condition": {
        const v = n.config.value ?? "";
        const result = v === "true" || v === "4" || v === "60" || v === "2" ? true : Math.floor(t * 13) % 2 === 0;
        lines.push({
          ts,
          level: result ? "success" : "warn",
          msg: `▸ Condition: ${n.config.field} ${n.config.operator} ${n.config.value} → ${result ? "TRUE" : "FALSE"}`,
        });
        if (!result) {
          lines.push({ ts, level: "warn", msg: "  Condición no cumplida — el flujo continuaría por la rama alternativa (si existe)." });
        }
        break;
      }
      case "action": {
        const a = ACTION_META[n.config.actionType ?? "send_whatsapp"];
        const tpl = n.config.template ? ` · plantilla "${n.config.template}"` : "";
        lines.push({ ts, level: "info", msg: `▸ Action: ${a.label}${tpl}` });
        lines.push({ ts, level: "success", msg: `  ${a.successMsg} (latencia ${Math.floor(80 + Math.random() * 140)}ms)` });
        break;
      }
      case "branch": {
        lines.push({ ts, level: "info", msg: `▸ Branch: evaluando condición interna — rama "${n.config.ifLabel}" seleccionada` });
        break;
      }
    }
    t += 0.1;
  }
  const total = t.toFixed(2);
  lines.push({ ts: at(Math.ceil(t)), level: "success", msg: `Ejecución finalizada — estado: success · duración total: ${total}s` });
  return { runId, lines };
}

function buildHistoryLog(ex: Execution): SimLine[] {
  const base: SimLine[] = [
    { ts: "10:32:01", level: "info", msg: `Ejecución iniciada — flujo "${ex.flow}" (#${ex.id})` },
    { ts: "10:32:01", level: "info", msg: `Disparador: ${ex.triggeredBy}` },
    { ts: "10:32:01", level: "info", msg: "Contexto cargado: cliente, reserva y plantillas resueltas" },
  ];
  if (ex.status === "pending") {
    base.push({ ts: "10:32:02", level: "warn", msg: "Ejecución en espera (Wait) — pendiente de reanudación" });
    base.push({ ts: "—", level: "warn", msg: `Reanudación programada · duración acumulada: ${ex.duration}` });
    return base;
  }
  if (ex.status === "failed") {
    base.push({ ts: "10:32:03", level: "info", msg: "Pasos previos completados correctamente" });
    base.push({ ts: "10:32:04", level: "error", msg: "Error en Action: send_review_request — proveedor devolvió 429 (rate limit)" });
    base.push({ ts: "10:32:05", level: "error", msg: "Reintento 1/3 (backoff 30s) — 2/3 — 3/3 agotados" });
    base.push({ ts: "10:32:06", level: "error", msg: `Ejecución finalizada — estado: failed · duración: ${ex.duration}` });
    return base;
  }
  base.push({ ts: "10:32:02", level: "info", msg: "Pasos evaluados en orden (trigger → wait → condition → action)" });
  base.push({ ts: "10:32:03", level: "success", msg: "Action ejecutada: entrega confirmada (wamid.6AB3f0…)" });
  base.push({ ts: "10:32:03", level: "success", msg: `Ejecución finalizada — estado: success · duración: ${ex.duration}` });
  return base;
}

/* --------------------------------------------------------------------------
 * Small shared UI
 * ------------------------------------------------------------------------ */

function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-amber-300",
        className
      )}
    >
      <span className="h-1 w-1 rounded-full bg-amber-400" aria-hidden />
      demo
    </span>
  );
}

const LEVEL_META: Record<SimLine["level"], { color: string; tag: string }> = {
  info: { color: "text-[var(--teal)]", tag: "INFO" },
  success: { color: "text-emerald-300", tag: " OK " },
  warn: { color: "text-amber-300", tag: "WARN" },
  error: { color: "text-rose-300", tag: " ERR" },
};

function LogView({ lines }: { lines: SimLine[] }) {
  return (
    <div className="rounded-lg border border-border/60 bg-black/40 p-4 font-mono text-xs rp-scroll-thin overflow-y-auto max-h-[50vh]">
      {lines.map((l, i) => (
        <div key={i} className="flex gap-2 py-0.5 leading-relaxed">
          <span className="text-muted-foreground/50 shrink-0 tabular-nums">{l.ts}</span>
          <span className={cn("shrink-0 font-semibold", LEVEL_META[l.level].color)}>[{LEVEL_META[l.level].tag}]</span>
          <span className="text-foreground/80">{l.msg}</span>
        </div>
      ))}
    </div>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-mono uppercase tracking-wider",
        active
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
          : "border-amber-400/30 bg-amber-400/10 text-amber-300"
      )}
      aria-label={active ? "Flujo activo" : "Flujo pausado"}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-emerald-400 animate-pulse" : "bg-amber-400")} aria-hidden />
      {active ? "Activo" : "Pausado"}
    </span>
  );
}

function StatusBadge({ status }: { status: Execution["status"] }) {
  const map: Record<Execution["status"], { color: string; dot: string; label: string }> = {
    success: { color: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300", dot: "bg-emerald-400", label: "Éxito" },
    failed: { color: "border-rose-400/40 bg-rose-400/10 text-rose-300", dot: "bg-rose-400", label: "Fallido" },
    pending: { color: "border-amber-400/40 bg-amber-400/10 text-amber-300", dot: "bg-amber-400", label: "Pendiente" },
  };
  const s = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider", s.color)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} aria-hidden />
      {s.label}
    </span>
  );
}

/* --------------------------------------------------------------------------
 * Palette + canvas + node card
 * ------------------------------------------------------------------------ */

function PaletteCard({ type, onAdd }: { type: NodeType; onAdd: () => void }) {
  const meta = NODE_TYPE_META[type];
  const a = ACCENT[meta.accent];
  return (
    <button
      type="button"
      onClick={onAdd}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg border border-border/60 bg-card/40 px-3 py-2.5 text-left transition-all hover:border-foreground/30 hover:bg-card/70 shrink-0 lg:w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60"
      )}
      aria-label={`Añadir nodo ${meta.label}: ${meta.description}`}
    >
      <span className={cn("flex h-8 w-8 items-center justify-center rounded-md border", a.chip)}>
        <meta.icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium">{meta.label}</span>
        <span className="hidden lg:block text-[11px] text-muted-foreground truncate">{meta.description}</span>
      </span>
      <Plus className="h-3.5 w-3.5 text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />
    </button>
  );
}

function Connector() {
  return (
    <div className="flex items-center px-1 shrink-0 self-center" aria-hidden>
      <div className="h-px w-6 bg-gradient-to-r from-[var(--gold)]/40 via-foreground/20 to-[var(--teal)]/40" />
      <ChevronRight className="h-3.5 w-3.5 -ml-1 text-muted-foreground/50" />
    </div>
  );
}

function NodeCard({
  node,
  index,
  selected,
  onSelect,
  onDelete,
}: {
  node: FlowNode;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const meta = NODE_TYPE_META[node.type];
  const a = ACCENT[meta.accent];
  const summary = nodeSummary(node);
  const detail = nodeDetail(node);
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`Paso ${index}: ${meta.label} — ${node.title}. ${summary}. ${selected ? "Seleccionado." : "Pulsa para seleccionar."}`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group relative flex w-[230px] shrink-0 flex-col gap-2 rounded-xl border bg-card/60 p-3.5 backdrop-blur transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60",
        selected ? cn("border-transparent", a.ring) : "border-border/60 hover:border-foreground/30"
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn("flex h-7 w-7 items-center justify-center rounded-md border", a.chip)}>
          <meta.icon className="h-3.5 w-3.5" aria-hidden />
        </span>
        <span className={cn("text-[10px] font-mono uppercase tracking-wider", a.text)}>{meta.label}</span>
        <span className="ml-auto text-[10px] font-mono text-muted-foreground/60">#{index}</span>
      </div>
      <div className="text-sm font-medium leading-tight line-clamp-2">{node.title}</div>
      <div className="text-[11px] font-mono text-muted-foreground leading-relaxed line-clamp-3">{summary}</div>
      {detail ? (
        <div className="text-[10px] font-mono text-muted-foreground/60 truncate">{detail}</div>
      ) : null}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label={`Eliminar nodo ${node.title}`}
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full border border-border/60 bg-background/90 flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-rose-300 hover:border-rose-400/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}

function TemplateCard({
  tpl,
  active,
  onLoad,
}: {
  tpl: Template;
  active: boolean;
  onLoad: () => void;
}) {
  const a = ACCENT[tpl.accent];
  return (
    <button
      type="button"
      onClick={onLoad}
      aria-label={`Cargar plantilla ${tpl.name}: ${tpl.description}`}
      className={cn(
        "group flex flex-col gap-2 rounded-xl border p-3.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60",
        active ? "border-[var(--gold)]/50 bg-[var(--gold)]/5 rp-glow-gold" : "border-border/60 rp-glass hover:border-foreground/30"
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn("flex h-7 w-7 items-center justify-center rounded-md border", a.chip)}>
          <tpl.icon className="h-3.5 w-3.5" aria-hidden />
        </span>
        {active ? (
          <span className="ml-auto text-[10px] font-mono uppercase tracking-wider text-[var(--gold)]">cargada</span>
        ) : null}
      </div>
      <div className="text-sm font-medium leading-tight">{tpl.name}</div>
      <div className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{tpl.description}</div>
    </button>
  );
}

/* --------------------------------------------------------------------------
 * Config panel (right)
 * ------------------------------------------------------------------------ */

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{children}</Label>;
}

function ConfigPanel({
  node,
  onUpdateConfig,
  onUpdateTitle,
  onClose,
}: {
  node: FlowNode | null;
  onUpdateConfig: (id: string, patch: NodeConfig) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onClose: () => void;
}) {
  if (!node) {
    return (
      <div className="rp-glass rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[320px]">
        <div className="h-10 w-10 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground/60 mb-3">
          <Sparkles className="h-5 w-5" aria-hidden />
        </div>
        <p className="text-sm font-medium">Ningún nodo seleccionado</p>
        <p className="mt-1 text-xs text-muted-foreground max-w-[220px]">
          Pulsa un nodo del flujo para editar su configuración, o añade uno desde la paleta.
        </p>
      </div>
    );
  }

  const meta = NODE_TYPE_META[node.type];
  const a = ACCENT[meta.accent];
  const c = node.config;

  return (
    <div className="rp-glass rounded-xl flex flex-col min-h-[320px]">
      <header className="flex items-center gap-2 px-4 py-3 border-b border-border/60">
        <span className={cn("flex h-7 w-7 items-center justify-center rounded-md border", a.chip)}>
          <meta.icon className="h-3.5 w-3.5" aria-hidden />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium leading-tight">Configuración</div>
          <div className={cn("text-[10px] font-mono uppercase tracking-wider", a.text)}>{meta.label}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel de configuración"
          className="h-7 w-7 rounded-md border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </header>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto rp-scroll-thin">
        {/* Title — common to all */}
        <div className="space-y-1.5">
          <FieldLabel>Título del nodo</FieldLabel>
          <Input
            value={node.title}
            onChange={(e) => onUpdateTitle(node.id, e.target.value)}
            aria-label="Título del nodo"
            className="bg-input/30"
          />
        </div>

        {/* Type-specific */}
        {node.type === "trigger" && (
          <div className="space-y-1.5">
            <FieldLabel>Evento</FieldLabel>
            <Select value={c.event} onValueChange={(v) => onUpdateConfig(node.id, { event: v as TriggerEvent })}>
              <SelectTrigger className="w-full bg-input/30">
                <SelectValue placeholder="Selecciona un evento" />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_EVENTS.map((e) => (
                  <SelectItem key={e.value} value={e.value}>
                    <div className="flex flex-col">
                      <span>{e.label}</span>
                      <span className="text-[10px] text-muted-foreground">{e.hint}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {node.type === "condition" && (
          <>
            <div className="space-y-1.5">
              <FieldLabel>Campo</FieldLabel>
              <Select value={c.field} onValueChange={(v) => onUpdateConfig(node.id, { field: v })}>
                <SelectTrigger className="w-full bg-input/30">
                  <SelectValue placeholder="Selecciona un campo" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITION_FIELDS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Operador</FieldLabel>
              <Select value={c.operator} onValueChange={(v) => onUpdateConfig(node.id, { operator: v as Operator })}>
                <SelectTrigger className="w-full bg-input/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPERATORS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      <span className="font-mono text-xs text-muted-foreground mr-2">{o.value}</span>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Valor</FieldLabel>
              <Input
                value={c.value ?? ""}
                onChange={(e) => onUpdateConfig(node.id, { value: e.target.value })}
                placeholder="ej. 4, true, VIP"
                aria-label="Valor de la condición"
                className="bg-input/30"
              />
            </div>
          </>
        )}

        {node.type === "action" && (
          <>
            <div className="space-y-1.5">
              <FieldLabel>Tipo de acción</FieldLabel>
              <Select value={c.actionType} onValueChange={(v) => onUpdateConfig(node.id, { actionType: v as ActionType })}>
                <SelectTrigger className="w-full bg-input/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ACTION_META) as ActionType[]).map((k) => {
                    const m = ACTION_META[k];
                    return (
                      <SelectItem key={k} value={k}>
                        <m.icon className="h-3.5 w-3.5 mr-1" aria-hidden />
                        {m.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Action-specific primary field */}
            {c.actionType &&
              ["send_email", "send_whatsapp", "send_sms", "send_review_request"].includes(c.actionType) && (
                <>
                  <div className="space-y-1.5">
                    <FieldLabel>Plantilla</FieldLabel>
                    <Select value={c.template} onValueChange={(v) => onUpdateConfig(node.id, { template: v })}>
                      <SelectTrigger className="w-full bg-input/30">
                        <SelectValue placeholder="Selecciona una plantilla" />
                      </SelectTrigger>
                      <SelectContent>
                        {(ACTION_TEMPLATES[c.actionType as ActionType] ?? []).map((tpl) => (
                          <SelectItem key={tpl.value} value={tpl.value}>
                            {tpl.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel>Variables</FieldLabel>
                    <Textarea
                      value={c.variables ?? ""}
                      onChange={(e) => onUpdateConfig(node.id, { variables: e.target.value })}
                      placeholder="{{customer.first_name}}, {{reservation.date}}"
                      aria-label="Variables de la plantilla"
                      className="bg-input/30 font-mono text-xs min-h-[72px]"
                    />
                  </div>
                </>
              )}

            {(c.actionType === "add_tag" || c.actionType === "remove_tag") && (
              <div className="space-y-1.5">
                <FieldLabel>Etiqueta</FieldLabel>
                <Input
                  value={c.value ?? ""}
                  onChange={(e) => onUpdateConfig(node.id, { value: e.target.value })}
                  placeholder="VIP, cumpleanos, winback…"
                  aria-label="Etiqueta"
                  className="bg-input/30"
                />
              </div>
            )}

            {c.actionType === "create_task" && (
              <>
                <div className="space-y-1.5">
                  <FieldLabel>Título de la tarea</FieldLabel>
                  <Input
                    value={c.value ?? ""}
                    onChange={(e) => onUpdateConfig(node.id, { value: e.target.value })}
                    placeholder="Llamar para reconfirmar"
                    aria-label="Título de la tarea"
                    className="bg-input/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel>Asignar a</FieldLabel>
                  <Input
                    value={c.assignee ?? ""}
                    onChange={(e) => onUpdateConfig(node.id, { assignee: e.target.value })}
                    placeholder="maître · Ana / equipo @recepcion"
                    aria-label="Asignatario"
                    className="bg-input/30"
                  />
                </div>
              </>
            )}

            {c.actionType === "apply_loyalty_points" && (
              <div className="space-y-1.5">
                <FieldLabel>Puntos a sumar</FieldLabel>
                <Input
                  type="number"
                  value={c.value ?? ""}
                  onChange={(e) => onUpdateConfig(node.id, { value: e.target.value })}
                  placeholder="50"
                  aria-label="Puntos a sumar"
                  className="bg-input/30"
                />
              </div>
            )}

            {c.actionType === "notify_staff" && (
              <div className="space-y-1.5">
                <FieldLabel>Canal</FieldLabel>
                <Select value={c.channel} onValueChange={(v) => onUpdateConfig(node.id, { channel: v })}>
                  <SelectTrigger className="w-full bg-input/30">
                    <SelectValue placeholder="Selecciona un canal" />
                  </SelectTrigger>
                  <SelectContent>
                    {STAFF_CHANNELS.map((ch) => (
                      <SelectItem key={ch.value} value={ch.value}>
                        {ch.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {c.actionType === "update_reservation_status" && (
              <div className="space-y-1.5">
                <FieldLabel>Nuevo estado</FieldLabel>
                <Select value={c.status} onValueChange={(v) => onUpdateConfig(node.id, { status: v })}>
                  <SelectTrigger className="w-full bg-input/30">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {RES_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}

        {node.type === "wait" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <FieldLabel>Duración</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  value={c.duration ?? 1}
                  onChange={(e) => onUpdateConfig(node.id, { duration: Number(e.target.value) || 0 })}
                  aria-label="Duración"
                  className="bg-input/30"
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Unidad</FieldLabel>
                <Select value={c.unit} onValueChange={(v) => onUpdateConfig(node.id, { unit: v as WaitUnit })}>
                  <SelectTrigger className="w-full bg-input/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WAIT_UNITS.map((u) => (
                      <SelectItem key={u.value} value={u.value}>
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Referencia temporal</FieldLabel>
              <Select value={c.anchor} onValueChange={(v) => onUpdateConfig(node.id, { anchor: v as WaitAnchor })}>
                <SelectTrigger className="w-full bg-input/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WAIT_ANCHORS.map((an) => (
                    <SelectItem key={an.value} value={an.value}>
                      {an.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {node.type === "branch" && (
          <>
            <div className="space-y-1.5">
              <FieldLabel>Rama «Si» (cumple)</FieldLabel>
              <Input
                value={c.ifLabel ?? ""}
                onChange={(e) => onUpdateConfig(node.id, { ifLabel: e.target.value })}
                placeholder="Confirmada"
                aria-label="Etiqueta rama si"
                className="bg-input/30"
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Rama «Si no» (no cumple)</FieldLabel>
              <Input
                value={c.elseLabel ?? ""}
                onChange={(e) => onUpdateConfig(node.id, { elseLabel: e.target.value })}
                placeholder="Pendiente"
                aria-label="Etiqueta rama si no"
                className="bg-input/30"
              />
            </div>
          </>
        )}

        <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground leading-relaxed">
          <Info className="h-3 w-3 inline mr-1 -mt-0.5" aria-hidden />
          ID: <span className="font-mono">{node.id}</span>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Main component
 * ------------------------------------------------------------------------ */

export function AutomationBuilder() {
  const { toast } = useToast();
  const [nodes, setNodes] = React.useState<FlowNode[]>(() => TEMPLATES[0].build());
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [active, setActive] = React.useState(true);
  const [currentTemplateId, setCurrentTemplateId] = React.useState<string>(TEMPLATES[0].id);
  const [simResult, setSimResult] = React.useState<{ runId: string; lines: SimLine[] } | null>(null);
  const [historyOpen, setHistoryOpen] = React.useState<Execution | null>(null);

  const selected = React.useMemo(
    () => nodes.find((n) => n.id === selectedId) ?? null,
    [nodes, selectedId]
  );
  const currentTemplateName =
    TEMPLATES.find((t) => t.id === currentTemplateId)?.name ?? "Flujo sin título";

  /* ---- mutations ---- */
  const addNode = React.useCallback(
    (type: NodeType) => {
      const meta = NODE_TYPE_META[type];
      const node: FlowNode = {
        id: uid(),
        type,
        title: meta.defaultTitle,
        config: { ...DEFAULT_CONFIG[type] },
      };
      setNodes((prev) => {
        if (selectedId) {
          const idx = prev.findIndex((n) => n.id === selectedId);
          if (idx >= 0) {
            const copy = [...prev];
            copy.splice(idx + 1, 0, node);
            return copy;
          }
        }
        return [...prev, node];
      });
      setSelectedId(node.id);
      toast({
        title: `${meta.label} añadido`,
        description: "Se ha insertado en el flujo. Edita su configuración a la derecha.",
      });
    },
    [selectedId, toast]
  );

  const deleteNode = React.useCallback(
    (id: string) => {
      setNodes((prev) => prev.filter((n) => n.id !== id));
      setSelectedId((cur) => (cur === id ? null : cur));
    },
    []
  );

  const updateConfig = React.useCallback((id: string, patch: NodeConfig) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, config: { ...n.config, ...patch } } : n))
    );
  }, []);

  const updateTitle = React.useCallback((id: string, title: string) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, title } : n)));
  }, []);

  const loadTemplate = React.useCallback(
    (tpl: Template) => {
      setNodes(tpl.build());
      setCurrentTemplateId(tpl.id);
      setSelectedId(null);
      toast({
        title: `Plantilla cargada: ${tpl.name}`,
        description: "Puedes editarla y guardarla como nuevo flujo.",
      });
    },
    [toast]
  );

  const duplicate = React.useCallback(() => {
    toast({
      title: "Flujo duplicado",
      description: `"${currentTemplateName}" copiado a borrador.`,
    });
  }, [currentTemplateName, toast]);

  const save = React.useCallback(() => {
    toast({
      title: "Flujo guardado",
      description: `${nodes.length} nodos · estado ${active ? "activo" : "pausado"}.`,
    });
  }, [nodes.length, active, toast]);

  const simulate = React.useCallback(() => {
    const res = buildSimLog(nodes, active, currentTemplateName);
    setSimResult(res);
  }, [nodes, active, currentTemplateName]);

  /* ---- render ---- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
            <span className="rp-gold-text">Relación</span>
            <span className="h-px w-8 bg-gradient-to-r from-[var(--gold)]/60 to-transparent" />
            <span>Automatizaciones</span>
          </div>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-light tracking-tight">
            Builder visual de flujos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Diseña automatizaciones tipo <span className="rp-gold-text">trigger → condición → acción</span> con
            esperas y bifurcaciones. Datos demo navegable.
          </p>
        </div>
        <DemoBadge />
      </header>

      {/* Controls bar */}
      <div className="rp-glass rounded-xl p-3 sm:p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2.5">
          <Switch
            checked={active}
            onCheckedChange={setActive}
            id="flow-active-toggle"
            aria-label={active ? "Pausar flujo" : "Activar flujo"}
          />
          <Label htmlFor="flow-active-toggle" className="text-sm cursor-pointer select-none">
            {active ? "Activo" : "Pausado"}
          </Label>
        </div>
        <div className="h-5 w-px bg-border/60 hidden sm:block" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-[var(--gold)]" aria-hidden />
          <span className="font-mono">{currentTemplateName}</span>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={duplicate} className="bg-input/20">
            <Copy className="h-4 w-4" aria-hidden />
            Duplicar
          </Button>
          <Button variant="outline" size="sm" onClick={simulate} className="bg-input/20">
            <Play className="h-4 w-4" aria-hidden />
            Simular
          </Button>
          <Button
            size="sm"
            onClick={save}
            className="bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90 font-medium"
          >
            <Save className="h-4 w-4" aria-hidden />
            Guardar
          </Button>
        </div>
      </div>

      {/* Templates */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium">Plantillas</h2>
          <DemoBadge />
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Carga un flujo preconfigurado para empezar
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {TEMPLATES.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              tpl={tpl}
              active={tpl.id === currentTemplateId}
              onLoad={() => loadTemplate(tpl)}
            />
          ))}
        </div>
      </section>

      {/* Three-area grid: palette | canvas | config */}
      <section
        className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_340px]"
        aria-label="Editor de flujo"
      >
        {/* Palette */}
        <aside
          className="rp-glass rounded-xl p-3 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible"
          aria-label="Paleta de nodos"
        >
          <div className="hidden lg:block px-1 mb-1 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            Paleta
          </div>
          {NODE_TYPE_ORDER.map((t) => (
            <PaletteCard key={t} type={t} onAdd={() => addNode(t)} />
          ))}
          <div className="hidden lg:block mt-2 px-1 text-[10px] text-muted-foreground/70 leading-relaxed">
            Click para añadir tras el nodo seleccionado (o al final).
          </div>
        </aside>

        {/* Canvas */}
        <div className="rp-glass rounded-xl overflow-hidden flex flex-col min-h-[340px]">
          <header className="flex items-center gap-2 px-4 py-3 border-b border-border/60">
            <Workflow className="h-4 w-4 text-[var(--gold)]" aria-hidden />
            <h3 className="text-sm font-medium">Flujo de automatización</h3>
            <span className="text-xs text-muted-foreground">{nodes.length} nodos</span>
            <div className="ml-auto">
              <StatusPill active={active} />
            </div>
          </header>
          <div className="flex-1 overflow-x-auto rp-scroll-thin p-4">
            {nodes.length === 0 ? (
              <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-center text-muted-foreground">
                <Workflow className="h-8 w-8 mb-3 opacity-40" aria-hidden />
                <p className="text-sm">El flujo está vacío</p>
                <p className="text-xs mt-1">Añade un disparador desde la paleta para empezar.</p>
              </div>
            ) : (
              <div className="flex items-stretch gap-0 min-w-min">
                {nodes.map((n, i) => (
                  <React.Fragment key={n.id}>
                    <NodeCard
                      node={n}
                      index={i + 1}
                      selected={n.id === selectedId}
                      onSelect={() => setSelectedId(n.id)}
                      onDelete={() => deleteNode(n.id)}
                    />
                    {i < nodes.length - 1 ? <Connector /> : null}
                  </React.Fragment>
                ))}
                {/* trailing add affordance */}
                <div className="flex items-center pl-2 shrink-0 self-center" aria-hidden>
                  <button
                    type="button"
                    onClick={() => addNode("action")}
                    aria-label="Añadir acción al final del flujo"
                    className="h-9 w-9 rounded-full border border-dashed border-border/60 flex items-center justify-center text-muted-foreground/70 hover:text-[var(--gold)] hover:border-[var(--gold)]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Config */}
        <ConfigPanel
          node={selected}
          onUpdateConfig={updateConfig}
          onUpdateTitle={updateTitle}
          onClose={() => setSelectedId(null)}
        />
      </section>

      {/* Execution history */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" aria-hidden />
          <h2 className="text-sm font-medium">Historial de ejecuciones</h2>
          <DemoBadge />
          <span className="text-xs text-muted-foreground hidden sm:inline">Últimas 5 ejecuciones del flujo activo</span>
        </div>
        <div className="rp-glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto rp-scroll-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-foreground/[0.03] text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 whitespace-nowrap">Run</th>
                  <th className="px-4 py-2.5 whitespace-nowrap">Flujo</th>
                  <th className="px-4 py-2.5 whitespace-nowrap">Iniciado</th>
                  <th className="px-4 py-2.5 whitespace-nowrap">Duración</th>
                  <th className="px-4 py-2.5 whitespace-nowrap">Estado</th>
                  <th className="px-4 py-2.5 whitespace-nowrap">Disparado por</th>
                  <th className="px-4 py-2.5 text-right whitespace-nowrap"><span className="sr-only">Ver log</span></th>
                </tr>
              </thead>
              <tbody>
                {HISTORY.map((ex) => (
                  <tr
                    key={ex.id}
                    className="border-b border-border/40 last:border-0 hover:bg-foreground/[0.025] transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{ex.id}</td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{ex.flow}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{ex.startedAt}</td>
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{ex.duration}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={ex.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{ex.triggeredBy}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setHistoryOpen(ex)}
                        className="h-7 text-xs hover:text-[var(--gold)]"
                      >
                        <FileText className="h-3.5 w-3.5" aria-hidden />
                        Ver log
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Simulate dialog */}
      <Dialog open={simResult !== null} onOpenChange={(o) => !o && setSimResult(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--teal)]/15 text-[var(--teal)] border border-[var(--teal)]/30">
                <Play className="h-4 w-4" aria-hidden />
              </div>
              <div className="flex-1">
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  Simulación de flujo
                  <DemoBadge />
                </DialogTitle>
                <DialogDescription>
                  Dry-run del flujo “{currentTemplateName}” con datos demo. No se envían mensajes reales.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {simResult ? (
            <>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-md border border-border/60 px-2 py-1 font-mono text-muted-foreground">
                  {nodes.length} pasos
                </span>
                <span className="rounded-md border border-border/60 px-2 py-1 font-mono text-muted-foreground">
                  {simResult.runId}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 font-mono text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" aria-hidden />
                  estado: success
                </span>
                <span className="rounded-md border border-border/60 px-2 py-1 font-mono text-muted-foreground">
                  dry-run
                </span>
              </div>
              <LogView lines={simResult.lines} />
            </>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSimResult(null)}>
              Cerrar
            </Button>
            <Button
              onClick={() => {
                setSimResult(null);
                toast({
                  title: "Simulación completada",
                  description: "El flujo se ejecutaría correctamente en producción.",
                });
              }}
              className="bg-[var(--teal)] text-black hover:bg-[var(--teal)]/90"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History log dialog */}
      <Dialog open={historyOpen !== null} onOpenChange={(o) => !o && setHistoryOpen(null)}>
        <DialogContent className="sm:max-w-2xl">
          {historyOpen ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  Log de ejecución
                  <DemoBadge />
                </DialogTitle>
                <DialogDescription>
                  <span className="font-mono">{historyOpen.id}</span> · {historyOpen.flow}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="rp-glass rounded-lg p-2.5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Iniciado</div>
                  <div className="text-xs mt-1">{historyOpen.startedAt}</div>
                </div>
                <div className="rp-glass rounded-lg p-2.5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Duración</div>
                  <div className="text-xs mt-1 font-mono">{historyOpen.duration}</div>
                </div>
                <div className="rp-glass rounded-lg p-2.5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Estado</div>
                  <div className="mt-1"><StatusBadge status={historyOpen.status} /></div>
                </div>
                <div className="rp-glass rounded-lg p-2.5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Disparado</div>
                  <div className="text-xs mt-1 truncate" title={historyOpen.triggeredBy}>{historyOpen.triggeredBy}</div>
                </div>
              </div>

              {historyOpen.status === "failed" ? (
                <div className="flex items-start gap-2 rounded-lg border border-rose-400/30 bg-rose-400/5 p-3 text-xs text-rose-200">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                  <div>
                    <div className="font-medium">Ejecución fallida</div>
                    <div className="text-rose-200/80 mt-0.5">
                      El proveedor de reseñas devolvió 429 tras 3 reintentos. Revisa las cuotas o el backoff.
                    </div>
                  </div>
                </div>
              ) : null}

              <LogView lines={buildHistoryLog(historyOpen)} />

              <DialogFooter>
                <Button variant="outline" onClick={() => setHistoryOpen(null)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
