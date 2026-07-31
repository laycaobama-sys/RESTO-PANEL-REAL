"use client";

/* ============================================================================
 * RestoPanel · Flow Builder visual
 * Canvas + paleta de nodos (trigger/condition/action/wait/branch)
 * 25+ plantillas · historial · webhooks · métricas
 * ========================================================================== */

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Zap, GitBranch, Send, Clock, Workflow, Plus, X, Play, Copy,
  Save, ChevronRight, History, MessageCircle, Mail, Tag,
  ListTodo, Star, Gift, BellRing, CalendarCheck, PhoneCall, Users,
  Sparkles, CheckCircle2, AlertTriangle, Trash2, Pencil,
  Webhook, ArrowRight, Search, Filter, LayoutGrid, Settings2,
  TrendingUp, Activity, Cpu, Database, ShieldCheck, Crown,
  UserPlus, UserMinus, Heart, ThumbsUp, RotateCcw, FileText,
  Bot, Megaphone, Smartphone, CreditCard, Package, AlertCircle,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type NodeType = "trigger" | "condition" | "action" | "wait" | "branch";
type FlowTab = "canvas" | "templates" | "history" | "webhooks";

interface FlowNode {
  id: string;
  type: NodeType;
  kind: string; // specific kind, e.g. "ReservationCreated"
  title: string;
  x: number;
  y: number;
  config: Record<string, string | number | boolean>;
}

interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

interface Template {
  id: string;
  nombre: string;
  desc: string;
  categoria: string;
  nodos: number;
  popular?: boolean;
  instalado?: boolean;
}

interface Execution {
  id: string;
  flow: string;
  startedAt: string;
  duration: string;
  status: "success" | "failed" | "pending";
  triggeredBy: string;
}

interface Webhook {
  id: string;
  url: string;
  evento: string;
  estado: "active" | "paused" | "error";
  ultimoFire: string;
  deliveries: number;
  failures: number;
}

/* =========================================================
 * Node catalog
 * =======================================================*/
const TRIGGER_CATALOG: { kind: string; label: string; icon: React.ElementType; desc: string }[] = [
  { kind: "ReservationCreated", label: "Reserva creada", icon: CalendarCheck, desc: "Nueva reserva en el libro" },
  { kind: "ReservationConfirmed", label: "Reserva confirmada", icon: CheckCircle2, desc: "Cliente confirma asistencia" },
  { kind: "ReservationCancelled", label: "Reserva cancelada", icon: X, desc: "Cliente cancela" },
  { kind: "ReservationNoShow", label: "Reserva no-show", icon: AlertTriangle, desc: "Reserva no atendida" },
  { kind: "CustomerVisited", label: "Cliente visitó", icon: Users, desc: "Servicio completado" },
  { kind: "ReviewReceived", label: "Reseña recibida", icon: Star, desc: "Google/TripAdvisor/TheFork" },
  { kind: "ReviewNegative", label: "Reseña negativa", icon: ThumbsUp, desc: "< 3 estrellas" },
  { kind: "Birthday", label: "Cumpleaños cliente", icon: Gift, desc: "Aniversario" },
  { kind: "CustomerInactive", label: "Cliente inactivo", icon: Clock, desc: "Sin visitas 90d" },
  { kind: "LoyaltyTierUp", label: "Sube de tier", icon: Crown, desc: "Cambio de nivel fidelidad" },
  { kind: "WaitlistSeat", label: "Mesa liberada", icon: Users, desc: "Waitlist disponible" },
  { kind: "PaymentReceived", label: "Pago recibido", icon: CreditCard, desc: "Cobro confirmado" },
  { kind: "WebhookIncoming", label: "Webhook entrante", icon: Webhook, desc: "POST externo" },
];

const CONDITION_CATALOG: { kind: string; label: string; icon: React.ElementType; desc: string }[] = [
  { kind: "party_size", label: "Tamaño grupo", icon: Users, desc: "≥ / ≤ / = pax" },
  { kind: "reservation_status", label: "Estado reserva", icon: CheckCircle2, desc: "Confirmada / pendiente..." },
  { kind: "customer_tags", label: "Etiquetas cliente", icon: Tag, desc: "VIP / alergias / preferencias" },
  { kind: "visit_count", label: "Nº visitas", icon: History, desc: "Histórico del cliente" },
  { kind: "loyalty_tier", label: "Nivel fidelidad", icon: Crown, desc: "Bronze / Silver / Gold" },
];

const ACTION_CATALOG: { kind: string; label: string; icon: React.ElementType; desc: string }[] = [
  { kind: "send_email", label: "Enviar email", icon: Mail, desc: "Plantilla + variables" },
  { kind: "send_whatsapp", label: "Enviar WhatsApp", icon: MessageCircle, desc: "Plantilla WAPP" },
  { kind: "send_sms", label: "Enviar SMS", icon: Smartphone, desc: "SMS corto" },
  { kind: "add_tag", label: "Añadir etiqueta", icon: Tag, desc: "Tag al cliente" },
  { kind: "remove_tag", label: "Quitar etiqueta", icon: Tag, desc: "Quitar tag" },
  { kind: "create_task", label: "Crear tarea", icon: ListTodo, desc: "Asignar a staff" },
  { kind: "send_review_request", label: "Pedir reseña", icon: Star, desc: "Solicitar valoración" },
  { kind: "apply_loyalty_points", label: "Puntos fidelidad", icon: Gift, desc: "Sumar puntos" },
  { kind: "notify_staff", label: "Notificar staff", icon: BellRing, desc: "Push al equipo" },
  { kind: "update_reservation_status", label: "Actualizar reserva", icon: CalendarCheck, desc: "Cambiar estado" },
  { kind: "call_webhook", label: "Llamar webhook", icon: Webhook, desc: "POST saliente" },
];

const NODE_META: Record<
  NodeType,
  { label: string; icon: React.ElementType; tone: "emerald" | "blue" | "yellow" | "violet" | "red" }
> = {
  trigger: { label: "Trigger", icon: Zap, tone: "yellow" },
  condition: { label: "Condición", icon: GitBranch, tone: "blue" },
  action: { label: "Acción", icon: Send, tone: "emerald" },
  wait: { label: "Espera", icon: Clock, tone: "violet" },
  branch: { label: "Bifurcación", icon: GitBranch, tone: "red" },
};

const TONE_CLS: Record<string, { border: string; bg: string; text: string; ring: string }> = {
  emerald: {
    border: "border-[var(--rp-emerald)]/50",
    bg: "bg-[var(--rp-emerald)]/10",
    text: "text-[var(--rp-emerald-soft)]",
    ring: "ring-[var(--rp-emerald)]/40",
  },
  yellow: {
    border: "border-[var(--rp-yellow)]/50",
    bg: "bg-[var(--rp-yellow)]/10",
    text: "text-[var(--rp-yellow-soft)]",
    ring: "ring-[var(--rp-yellow)]/40",
  },
  blue: {
    border: "border-[var(--rp-blue)]/50",
    bg: "bg-[var(--rp-blue)]/10",
    text: "text-[var(--rp-blue-soft)]",
    ring: "ring-[var(--rp-blue)]/40",
  },
  violet: {
    border: "border-[var(--rp-violet)]/50",
    bg: "bg-[var(--rp-violet)]/10",
    text: "text-[var(--rp-violet-soft)]",
    ring: "ring-[var(--rp-violet)]/40",
  },
  red: {
    border: "border-[var(--rp-red)]/50",
    bg: "bg-[var(--rp-red)]/10",
    text: "text-[var(--rp-red-soft)]",
    ring: "ring-[var(--rp-red)]/40",
  },
};

/* =========================================================
 * Templates (25+)
 * =======================================================*/
const TEMPLATES: Template[] = [
  { id: "t1", nombre: "Recordatorio 24h reserva", desc: "Email + WhatsApp 24h antes", categoria: "Reservas", nodos: 3, popular: true },
  { id: "t2", nombre: "Reconfirmación 2h antes", desc: "SMS corto 2h antes del servicio", categoria: "Reservas", nodos: 3 },
  { id: "t3", nombre: "Cumpleaños cliente", desc: "Email + descuento 7 días antes", categoria: "CRM", nodos: 4, popular: true },
  { id: "t4", nombre: "Cliente inactivo 60d", desc: "WhatsApp con oferta de retorno", categoria: "CRM", nodos: 4 },
  { id: "t5", nombre: "Cliente inactivo 90d", desc: "Email + SMS campaña winback", categoria: "CRM", nodos: 5 },
  { id: "t6", nombre: "Reseña positiva → gracias", desc: "Email + puntos fidelidad", categoria: "Reputación", nodos: 4, popular: true },
  { id: "t7", nombre: "Reseña negativa → alerta", desc: "Notificar staff + tarea seguimiento", categoria: "Reputación", nodos: 5 },
  { id: "t8", nombre: "Solicitar reseña post-visita", desc: "Email 24h tras visita", categoria: "Reputación", nodos: 3, popular: true },
  { id: "t9", nombre: "No-show → cargo garantía", desc: "Cargo automático + tag no-show", categoria: "Reservas", nodos: 4 },
  { id: "t10", nombre: "VIP detectado → maitre", desc: "Notificar maitre en llegada", categoria: "CRM", nodos: 3 },
  { id: "t11", nombre: "Sube a Gold → regalo", desc: "Email + postre gratis", categoria: "Fidelidad", nodos: 4 },
  { id: "t12", nombre: "Sube a Platinum → call", desc: "Llamada personal gerente", categoria: "Fidelidad", nodos: 3 },
  { id: "t13", nombre: "Mesa liberada waitlist", desc: "WhatsApp automático a siguiente", categoria: "Reservas", nodos: 4 },
  { id: "t14", nombre: "Pago recibido → recibo", desc: "Email recibo + tag facturado", categoria: "Pagos", nodos: 3 },
  { id: "t15", nombre: "CumpleVIP (5 años)", desc: "Cena invitación + champagne", categoria: "Fidelidad", nodos: 5, popular: true },
  { id: "t16", nombre: "Aniversario 1ª visita", desc: "Email + 10% descuento", categoria: "CRM", nodos: 3 },
  { id: "t17", nombre: "Reserva cancelada → waitlist", desc: "Auto-ofrecer a siguientes en waitlist", categoria: "Reservas", nodos: 4 },
  { id: "t18", nombre: "Reserva > 8 pax → depósito", desc: "Pedir prepago 30%", categoria: "Reservas", nodos: 4, popular: true },
  { id: "t19", nombre: "Cliente alérgeno detectado", desc: "Tag + notificar cocina", categoria: "CRM", nodos: 3 },
  { id: "t20", nombre: "Webhook → Slack", desc: "POST a Slack canal reservas", categoria: "Integraciones", nodos: 2 },
  { id: "t21", nombre: "Webhook → Zapier", desc: "POST a Zapier para 3rd party", categoria: "Integraciones", nodos: 2 },
  { id: "t22", nombre: "Reserva online nueva → staff", desc: "Push al equipo en turno", categoria: "Reservas", nodos: 3 },
  { id: "t23", nombre: "Reseña 5★ → destacar", desc: "Auto-publicar en web widget", categoria: "Reputación", nodos: 3 },
  { id: "t24", nombre: "Cliente repite en 7d → bonus", desc: "Puntos extra por recurrencia", categoria: "Fidelidad", nodos: 4 },
  { id: "t25", nombre: "Ticket > €100 → postre", desc: "Invitar postre en siguiente visita", categoria: "Ventas", nodos: 4, popular: true },
  { id: "t26", nombre: "Menu degustación booked", desc: "Confirmar 48h antes con menu", categoria: "Reservas", nodos: 4 },
  { id: "t27", nombre: "Cumpleaños staff → recordatorio", desc: "Notificar gerente 7d antes", categoria: "Personal", nodos: 2 },
];

/* =========================================================
 * Initial nodes + edges
 * =======================================================*/
let _idCounter = 0;
function uid(): string {
  _idCounter += 1;
  return `n_${_idCounter}_${Math.random().toString(36).slice(2, 6)}`;
}

const INITIAL_NODES: FlowNode[] = [
  { id: "n1", type: "trigger", kind: "ReservationCreated", title: "Reserva creada", x: 60, y: 80, config: {} },
  { id: "n2", type: "condition", kind: "party_size", title: "¿Grupo ≥ 8?", x: 320, y: 80, config: { operator: ">=", value: "8" } },
  { id: "n3", type: "action", kind: "send_email", title: "Pedir prepago", x: 600, y: 30, config: { template: "deposit_request" } },
  { id: "n4", type: "action", kind: "send_whatsapp", title: "WhatsApp confirm", x: 600, y: 140, config: { template: "confirm_standard" } },
];

const INITIAL_EDGES: FlowEdge[] = [
  { from: "n1", to: "n2" },
  { from: "n2", to: "n3", label: "Sí" },
  { from: "n2", to: "n4", label: "No" },
];

/* =========================================================
 * Static execution history + webhooks
 * =======================================================*/
const EXECUTIONS_INIT: Execution[] = [
  { id: "ex1", flow: "Recordatorio 24h", startedAt: "2025-04-11T09:00:00", duration: "1.2s", status: "success", triggeredBy: "schedule" },
  { id: "ex2", flow: "Cumpleaños cliente", startedAt: "2025-04-11T08:30:00", duration: "0.8s", status: "success", triggeredBy: "schedule" },
  { id: "ex3", flow: "Reseña positiva → gracias", startedAt: "2025-04-11T11:14:00", duration: "2.1s", status: "success", triggeredBy: "ReviewReceived" },
  { id: "ex4", flow: "No-show → cargo", startedAt: "2025-04-11T13:00:00", duration: "3.4s", status: "failed", triggeredBy: "ReservationNoShow" },
  { id: "ex5", flow: "VIP detectado", startedAt: "2025-04-11T14:22:00", duration: "0.6s", status: "success", triggeredBy: "CustomerVisited" },
  { id: "ex6", flow: "Recordatorio 24h", startedAt: "2025-04-11T09:01:00", duration: "1.0s", status: "pending", triggeredBy: "schedule" },
  { id: "ex7", flow: "Solicitar reseña", startedAt: "2025-04-11T10:05:00", duration: "1.8s", status: "success", triggeredBy: "schedule" },
  { id: "ex8", flow: "Cliente inactivo 60d", startedAt: "2025-04-11T07:00:00", duration: "12.4s", status: "success", triggeredBy: "schedule" },
];

const WEBHOOKS_INIT: Webhook[] = [
  { id: "w1", url: "https://hooks.slack.com/services/T0/B0/xxx", evento: "ReservationCreated", estado: "active", ultimoFire: "2025-04-11T11:14", deliveries: 1247, failures: 3 },
  { id: "w2", url: "https://hooks.zapier.com/hooks/catch/123/abc", evento: "ReviewReceived", estado: "active", ultimoFire: "2025-04-11T10:32", deliveries: 318, failures: 0 },
  { id: "w3", url: "https://api.partner.com/wh/reservas", evento: "ReservationConfirmed", estado: "error", ultimoFire: "2025-04-11T09:45", deliveries: 562, failures: 47 },
  { id: "w4", url: "https://crm.tercero.com/api/events", evento: "CustomerVisited", estado: "active", ultimoFire: "2025-04-10T22:30", deliveries: 1894, failures: 12 },
  { id: "w5", url: "https://analytics.ext.com/ingest", evento: "PaymentReceived", estado: "paused", ultimoFire: "2025-04-09T18:00", deliveries: 2104, failures: 0 },
];

/* =========================================================
 * Helpers
 * =======================================================*/
function findNode(kind: string, type: NodeType) {
  if (type === "trigger") return TRIGGER_CATALOG.find((t) => t.kind === kind);
  if (type === "condition") return CONDITION_CATALOG.find((t) => t.kind === kind);
  if (type === "action") return ACTION_CATALOG.find((t) => t.kind === kind);
  return undefined;
}

/* =========================================================
 * Main view
 * =======================================================*/
export function FlowBuilderView() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const t = reduce ? { duration: 0 } : { duration: 0.2, ease: "easeOut" as const };

  const [tab, setTab] = React.useState<FlowTab>("canvas");
  const [nodes, setNodes] = React.useState<FlowNode[]>(INITIAL_NODES);
  const [edges] = React.useState<FlowEdge[]>(INITIAL_EDGES);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [executions, setExecutions] = React.useState<Execution[]>(EXECUTIONS_INIT);
  const [webhooks, setWebhooks] = React.useState<Webhook[]>(WEBHOOKS_INIT);
  const [installedTemplates, setInstalledTemplates] = React.useState<Set<string>>(new Set());
  const [webhookDialogOpen, setWebhookDialogOpen] = React.useState(false);
  const [templateFilter, setTemplateFilter] = React.useState("todas");
  const [templateSearch, setTemplateSearch] = React.useState("");

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;
  const flujosActivos = 18;
  const flujosLimite = 25;
  const ejecucionesHoy = executions.length;
  const tasaExito = Math.round(
    (executions.filter((e) => e.status === "success").length / Math.max(1, executions.length)) * 100
  );

  /* ----- handlers ----- */
  function addNode(type: NodeType, kind: string) {
    const cat = type === "trigger"
      ? TRIGGER_CATALOG
      : type === "condition"
        ? CONDITION_CATALOG
        : ACTION_CATALOG;
    const meta = cat.find((c) => c.kind === kind);
    if (!meta) return;
    const newNode: FlowNode = {
      id: uid(),
      type,
      kind,
      title: meta.label,
      x: 60 + Math.random() * 80,
      y: 60 + Math.random() * 200,
      config: {},
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedId(newNode.id);
    toast({
      title: "Nodo añadido",
      description: `${NODE_META[type].label}: ${meta.label}`,
    });
  }

  function addWaitOrBranch(type: "wait" | "branch") {
    const newNode: FlowNode = {
      id: uid(),
      type,
      kind: type === "wait" ? "wait" : "branch",
      title: type === "wait" ? "Esperar" : "Bifurcar",
      x: 60 + Math.random() * 80,
      y: 60 + Math.random() * 200,
      config: type === "wait" ? { duration: "30", unit: "minutes" } : {},
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedId(newNode.id);
    toast({
      title: "Nodo añadido",
      description: NODE_META[type].label,
    });
  }

  function updateNode(id: string, patch: Partial<FlowNode>) {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  }

  function deleteNode(id: string) {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) setSelectedId(null);
    toast({
      title: "Nodo eliminado",
      variant: "destructive",
    });
  }

  function duplicateNode(id: string) {
    const n = nodes.find((x) => x.id === id);
    if (!n) return;
    const copy: FlowNode = {
      ...n,
      id: uid(),
      x: n.x + 30,
      y: n.y + 30,
    };
    setNodes((prev) => [...prev, copy]);
    setSelectedId(copy.id);
    toast({
      title: "Nodo duplicado",
      description: n.title,
    });
  }

  function installTemplate(tpl: Template) {
    setInstalledTemplates((prev) => new Set(prev).add(tpl.id));
    toast({
      title: "Plantilla instalada",
      description: `${tpl.nombre} · ${tpl.nodos} nodos`,
    });
  }

  function runFlow() {
    const newEx: Execution = {
      id: `ex${Date.now()}`,
      flow: "Flujo actual",
      startedAt: new Date().toISOString(),
      duration: "0.0s",
      status: "pending",
      triggeredBy: "manual",
    };
    setExecutions((prev) => [newEx, ...prev]);
    toast({
      title: "Ejecución iniciada",
      description: `${nodes.length} nodos · ejecutando...`,
    });
    // simulate completion
    setTimeout(() => {
      setExecutions((prev) =>
        prev.map((e) =>
          e.id === newEx.id
            ? { ...e, status: "success", duration: `${(Math.random() * 2 + 0.5).toFixed(1)}s` }
            : e
        )
      );
      toast({
        title: "Ejecución completada",
        description: "Éxito",
      });
    }, 1500);
  }

  function toggleWebhook(id: string) {
    setWebhooks((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, estado: w.estado === "active" ? "paused" : "active" }
          : w
      )
    );
    toast({
      title: "Webhook actualizado",
    });
  }

  function deleteWebhook(id: string) {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
    toast({
      title: "Webhook eliminado",
      variant: "destructive",
    });
  }

  function addWebhook(url: string, evento: string) {
    const nuevo: Webhook = {
      id: `w${Date.now()}`,
      url,
      evento,
      estado: "active",
      ultimoFire: new Date().toISOString().slice(0, 16),
      deliveries: 0,
      failures: 0,
    };
    setWebhooks((prev) => [...prev, nuevo]);
    setWebhookDialogOpen(false);
    toast({ title: "Webhook creado", description: evento });
  }

  /* ----- render ----- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
              Flow Builder
            </h1>
            <Badge
              variant="outline"
              className="border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)] font-mono uppercase tracking-wider text-[10px]"
            >
              visual
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Automatizaciones visuales: triggers, condiciones, acciones, esperas
            y bifurcaciones.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button variant="outline" onClick={runFlow} className="min-h-11">
            <Play className="h-4 w-4" /> <span className="hidden sm:inline">Ejecutar</span>
          </Button>
          <Button variant="outline" className="min-h-11">
            <Save className="h-4 w-4" /> <span className="hidden sm:inline">Guardar</span>
          </Button>
        </div>
      </header>

      {/* Metrics strip */}
      <div className="rp-glass rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6 flex-wrap">
          <MetricChip
            icon={Zap}
            label="Flujos activos"
            value={`${flujosActivos}/${flujosLimite}`}
            tone="emerald"
          />
          <MetricChip
            icon={Activity}
            label="Ejecuciones hoy"
            value={String(ejecucionesHoy)}
            tone="blue"
          />
          <MetricChip
            icon={TrendingUp}
            label="Tasa éxito"
            value={`${tasaExito}%`}
            tone={tasaExito >= 95 ? "emerald" : tasaExito >= 80 ? "yellow" : "red"}
          />
          <MetricChip
            icon={Webhook}
            label="Webhooks"
            value={String(webhooks.length)}
            tone="violet"
          />
        </div>
        <div className="flex-1 max-w-xs">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
            Capacidad de flujos
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-foreground/[0.06] overflow-hidden">
              <div
                className="h-full bg-[var(--rp-emerald)]"
                style={{ width: `${(flujosActivos / flujosLimite) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono tabular-nums">
              {flujosActivos}/{flujosLimite}
            </span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="relative">
        <div
          className="flex items-center gap-1 overflow-x-auto rp-scroll-thin pb-1 -mb-2"
          role="tablist"
          aria-label="Vistas de flow builder"
        >
          {([
            { id: "canvas", label: "Canvas", icon: Workflow },
            { id: "templates", label: "Plantillas", icon: LayoutGrid },
            { id: "history", label: "Historial", icon: History },
            { id: "webhooks", label: "Webhooks", icon: Webhook },
          ] as const).map((tb) => (
            <button
              key={tb.id}
              role="tab"
              aria-selected={tab === tb.id}
              onClick={() => setTab(tb.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors min-h-[40px] border",
                tab === tb.id
                  ? "bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)] border-[var(--rp-emerald)]/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5 border-transparent"
              )}
            >
              <tb.icon className="h-4 w-4" aria-hidden />
              {tb.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {tab === "canvas" && (
          <motion.div
            key="canvas"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={t}
            className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4"
          >
            {/* Canvas + palette */}
            <div className="space-y-4">
              <NodePalette onAdd={addNode} onAddWaitOrBranch={addWaitOrBranch} />
              <Canvas
                nodes={nodes}
                edges={edges}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onMove={updateNode}
                onDuplicate={duplicateNode}
                onDelete={deleteNode}
              />
            </div>
            {/* Properties panel */}
            <PropertiesPanel
              node={selectedNode}
              onUpdate={(patch) => selectedId && updateNode(selectedId, patch)}
              onDelete={() => selectedId && deleteNode(selectedId)}
              onDuplicate={() => selectedId && duplicateNode(selectedId)}
            />
          </motion.div>
        )}

        {tab === "templates" && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={t}
          >
            <TemplatesPanel
              templates={TEMPLATES}
              installed={installedTemplates}
              onInstall={installTemplate}
              filter={templateFilter}
              onFilter={setTemplateFilter}
              search={templateSearch}
              onSearch={setTemplateSearch}
            />
          </motion.div>
        )}

        {tab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={t}
          >
            <HistoryPanel executions={executions} />
          </motion.div>
        )}

        {tab === "webhooks" && (
          <motion.div
            key="webhooks"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={t}
          >
            <WebhooksPanel
              webhooks={webhooks}
              onToggle={toggleWebhook}
              onDelete={deleteWebhook}
              onNew={() => setWebhookDialogOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Webhook dialog */}
      <WebhookDialog
        open={webhookDialogOpen}
        onOpenChange={setWebhookDialogOpen}
        onConfirm={addWebhook}
      />
    </div>
  );
}

/* =========================================================
 * Metric chip
 * =======================================================*/
function MetricChip({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone: "emerald" | "yellow" | "red" | "violet" | "blue";
}) {
  const toneCls = {
    emerald: "text-[var(--rp-emerald)]",
    yellow: "text-[var(--rp-yellow)]",
    red: "text-[var(--rp-red)]",
    violet: "text-[var(--rp-violet)]",
    blue: "text-[var(--rp-blue)]",
  }[tone];
  return (
    <div className="flex items-center gap-2">
      <Icon className={cn("h-4 w-4", toneCls)} />
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="text-sm font-display font-medium tabular-nums">{value}</div>
      </div>
    </div>
  );
}

/* =========================================================
 * Node palette
 * =======================================================*/
function NodePalette({
  onAdd,
  onAddWaitOrBranch,
}: {
  onAdd: (type: NodeType, kind: string) => void;
  onAddWaitOrBranch: (type: "wait" | "branch") => void;
}) {
  const [active, setActive] = React.useState<NodeType>("trigger");

  const cat = active === "trigger"
    ? TRIGGER_CATALOG
    : active === "condition"
      ? CONDITION_CATALOG
      : active === "action"
        ? ACTION_CATALOG
        : [];

  return (
    <div className="rp-glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-[var(--rp-emerald)]" />
          <h3 className="text-sm font-semibold">Paleta de nodos</h3>
        </div>
        <div className="flex items-center gap-1">
          {(Object.keys(NODE_META) as NodeType[]).map((nt) => {
            const meta = NODE_META[nt];
            const Icon = meta.icon;
            const toneCls = TONE_CLS[meta.tone];
            return (
              <button
                key={nt}
                onClick={() => {
                  if (nt === "wait" || nt === "branch") {
                    onAddWaitOrBranch(nt);
                  } else {
                    setActive(nt);
                  }
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium border transition-colors",
                  active === nt && nt !== "wait" && nt !== "branch"
                    ? cn(toneCls.border, toneCls.bg, toneCls.text)
                    : cn("border-border/40 text-muted-foreground hover:bg-foreground/[0.04]")
                )}
                title={meta.label}
              >
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{meta.label}</span>
                <Badge variant="outline" className="text-[9px] ml-1">
                  {nt === "trigger" ? TRIGGER_CATALOG.length : nt === "condition" ? CONDITION_CATALOG.length : nt === "action" ? ACTION_CATALOG.length : ""}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>
      <Separator className="mb-3" />
      <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto rp-scroll-thin">
        {cat.map((item) => {
          const Icon = item.icon;
          const meta = NODE_META[active];
          const toneCls = TONE_CLS[meta.tone];
          return (
            <button
              key={item.kind}
              onClick={() => onAdd(active, item.kind)}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs border transition-colors",
                "border-border/40 bg-foreground/[0.02] hover:bg-foreground/[0.06]"
              )}
              title={item.desc}
            >
              <Icon className={cn("h-3.5 w-3.5", toneCls.text)} />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
 * Canvas
 * =======================================================*/
function Canvas({
  nodes,
  edges,
  selectedId,
  onSelect,
  onMove,
  onDuplicate,
  onDelete,
}: {
  nodes: FlowNode[];
  edges: FlowEdge[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, patch: Partial<FlowNode>) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  function onNodeMouseDown(e: React.MouseEvent, node: FlowNode) {
    e.stopPropagation();
    onSelect(node.id);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = {
      id: node.id,
      offsetX: e.clientX - rect.left - node.x,
      offsetY: e.clientY - rect.top - node.y,
    };
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragRef.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(e.clientX - rect.left - dragRef.current.offsetX, rect.width - 160));
    const y = Math.max(0, Math.min(e.clientY - rect.top - dragRef.current.offsetY, rect.height - 80));
    onMove(dragRef.current.id, { x, y });
  }
  function onMouseUp() {
    dragRef.current = null;
  }

  return (
    <div
      ref={canvasRef}
      onClick={() => onSelect(null)}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      className="rp-glass rp-grid-bg rounded-2xl relative overflow-hidden min-h-[500px] cursor-default"
      role="application"
      aria-label="Canvas del flow builder"
    >
      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          <div className="text-center">
            <Workflow className="h-8 w-8 mx-auto mb-2 opacity-50" />
            Añade nodos desde la paleta para empezar
          </div>
        </div>
      )}

      {/* SVG edges */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
        {edges.map((edge, i) => {
          const from = nodes.find((n) => n.id === edge.from);
          const to = nodes.find((n) => n.id === edge.to);
          if (!from || !to) return null;
          const x1 = from.x + 150;
          const y1 = from.y + 36;
          const x2 = to.x;
          const y2 = to.y + 36;
          const midX = (x1 + x2) / 2;
          return (
            <g key={`edge-${i}`}>
              <path
                d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                stroke="var(--rp-emerald)"
                strokeWidth={2}
                fill="none"
                opacity={0.6}
                strokeDasharray="4 4"
              />
              {edge.label && (
                <text
                  x={midX}
                  y={(y1 + y2) / 2 - 4}
                  fill="var(--rp-emerald-soft)"
                  fontSize={10}
                  fontFamily="var(--font-jetbrains)"
                  textAnchor="middle"
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => {
        const meta = NODE_META[node.type];
        const Icon = meta.icon;
        const cat = findNode(node.kind, node.type);
        const NodeIcon = cat?.icon ?? Icon;
        const toneCls = TONE_CLS[meta.tone];
        const selected = selectedId === node.id;
        return (
          <div
            key={node.id}
            onMouseDown={(e) => onNodeMouseDown(e, node)}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "absolute w-[150px] rounded-lg border p-2 cursor-move select-none backdrop-blur-md transition-shadow",
              toneCls.border,
              toneCls.bg,
              selected && cn("ring-2", toneCls.ring, "shadow-lg")
            )}
            style={{ left: node.x, top: node.y }}
            role="button"
            tabIndex={0}
            aria-label={`${meta.label}: ${node.title}`}
          >
            <div className="flex items-center gap-1.5">
              <div className={cn("h-6 w-6 rounded flex items-center justify-center bg-foreground/[0.04]", toneCls.text)}>
                <NodeIcon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className={cn("text-[9px] font-mono uppercase tracking-wider", toneCls.text)}>
                  {meta.label}
                </div>
                <div className="text-xs font-medium truncate">{node.title}</div>
              </div>
            </div>
            {selected && (
              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/40">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(node.id);
                  }}
                  className="text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-foreground/10"
                  aria-label="Duplicar"
                >
                  <Copy className="h-2.5 w-2.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(node.id);
                  }}
                  className="text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[var(--rp-red)]/15 text-[var(--rp-red-soft)]"
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
 * Properties panel
 * =======================================================*/
function PropertiesPanel({
  node,
  onUpdate,
  onDelete,
  onDuplicate,
}: {
  node: FlowNode | null;
  onUpdate: (patch: Partial<FlowNode>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  if (!node) {
    return (
      <div className="rp-glass rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Propiedades</h3>
        </div>
        <Separator className="mb-3" />
        <div className="text-center text-xs text-muted-foreground py-8">
          Selecciona un nodo del canvas para editar sus propiedades.
        </div>
      </div>
    );
  }

  const meta = NODE_META[node.type];
  const Icon = meta.icon;
  const cat = findNode(node.kind, node.type);
  const toneCls = TONE_CLS[meta.tone];

  return (
    <div className="rp-glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", toneCls.text)} />
          <h3 className="text-sm font-semibold">Propiedades</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onDuplicate} aria-label="Duplicar">
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-[var(--rp-red-soft)] hover:text-[var(--rp-red)]"
            onClick={onDelete}
            aria-label="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <Separator className="mb-3" />

      <div className="space-y-3">
        <div>
          <Label htmlFor="pp-tipo" className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Tipo
          </Label>
          <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border mt-1", toneCls.border, toneCls.bg, toneCls.text)}>
            <Icon className="h-3 w-3" />
            {meta.label}
          </div>
        </div>
        <div>
          <Label htmlFor="pp-titulo">Título</Label>
          <Input
            id="pp-titulo"
            value={node.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="bg-background/40 mt-1"
          />
        </div>
        {cat && (
          <div>
            <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {cat.desc}
            </Label>
          </div>
        )}

        {/* Type-specific config */}
        {node.type === "condition" && (
          <>
            <div>
              <Label htmlFor="pp-op">Operador</Label>
              <Select
                value={(node.config.operator as string) ?? "=="}
                onValueChange={(v) => onUpdate({ config: { ...node.config, operator: v } })}
              >
                <SelectTrigger id="pp-op" className="bg-background/40 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["==", "!=", ">", "<", ">=", "<=", "contains"].map((o) => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="pp-val">Valor</Label>
              <Input
                id="pp-val"
                value={(node.config.value as string) ?? ""}
                onChange={(e) => onUpdate({ config: { ...node.config, value: e.target.value } })}
                className="bg-background/40 mt-1"
                placeholder="ej. 8"
              />
            </div>
          </>
        )}

        {node.type === "action" && (
          <>
            <div>
              <Label htmlFor="pp-tpl">Plantilla</Label>
              <Select
                value={(node.config.template as string) ?? ""}
                onValueChange={(v) => onUpdate({ config: { ...node.config, template: v } })}
              >
                <SelectTrigger id="pp-tpl" className="bg-background/40 mt-1">
                  <SelectValue placeholder="Selecciona plantilla" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirm_standard">Confirmación estándar</SelectItem>
                  <SelectItem value="reminder_24h">Recordatorio 24h</SelectItem>
                  <SelectItem value="birthday_cumple">Cumpleaños</SelectItem>
                  <SelectItem value="deposit_request">Solicitud depósito</SelectItem>
                  <SelectItem value="review_request">Petición reseña</SelectItem>
                  <SelectItem value="winback_offer">Oferta winback</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="pp-vars">Variables</Label>
              <Textarea
                id="pp-vars"
                value={(node.config.variables as string) ?? ""}
                onChange={(e) => onUpdate({ config: { ...node.config, variables: e.target.value } })}
                className="bg-background/40 mt-1 font-mono text-xs"
                placeholder="{{nombre}}, {{fecha}}, {{mesa}}"
                rows={2}
              />
            </div>
          </>
        )}

        {node.type === "wait" && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="pp-dur">Duración</Label>
              <Input
                id="pp-dur"
                type="number"
                value={(node.config.duration as string) ?? "30"}
                onChange={(e) => onUpdate({ config: { ...node.config, duration: e.target.value } })}
                className="bg-background/40 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="pp-unit">Unidad</Label>
              <Select
                value={(node.config.unit as string) ?? "minutes"}
                onValueChange={(v) => onUpdate({ config: { ...node.config, unit: v } })}
              >
                <SelectTrigger id="pp-unit" className="bg-background/40 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutos</SelectItem>
                  <SelectItem value="hours">Horas</SelectItem>
                  <SelectItem value="days">Días</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {node.type === "branch" && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="pp-if">Etiqueta "Sí"</Label>
              <Input
                id="pp-if"
                value={(node.config.ifLabel as string) ?? "Sí"}
                onChange={(e) => onUpdate({ config: { ...node.config, ifLabel: e.target.value } })}
                className="bg-background/40 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="pp-else">Etiqueta "No"</Label>
              <Input
                id="pp-else"
                value={(node.config.elseLabel as string) ?? "No"}
                onChange={(e) => onUpdate({ config: { ...node.config, elseLabel: e.target.value } })}
                className="bg-background/40 mt-1"
              />
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-border/40 text-[10px] font-mono text-muted-foreground">
          ID: {node.id} · Pos: ({Math.round(node.x)}, {Math.round(node.y)})
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Templates panel
 * =======================================================*/
function TemplatesPanel({
  templates,
  installed,
  onInstall,
  filter,
  onFilter,
  search,
  onSearch,
}: {
  templates: Template[];
  installed: Set<string>;
  onInstall: (t: Template) => void;
  filter: string;
  onFilter: (f: string) => void;
  search: string;
  onSearch: (s: string) => void;
}) {
  const categorias = Array.from(new Set(templates.map((t) => t.categoria)));
  const filtered = templates.filter((t) => {
    if (filter !== "todas" && t.categoria !== filter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      if (!t.nombre.toLowerCase().includes(q) && !t.desc.toLowerCase().includes(q))
        return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="rp-glass rounded-2xl p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar plantillas..."
            className="pl-9 bg-background/40"
          />
        </div>
        <Select value={filter} onValueChange={onFilter}>
          <SelectTrigger className="w-[180px] bg-background/40">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs">
          {filtered.length}/{templates.length}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((tpl) => {
          const isInstalled = installed.has(tpl.id);
          return (
            <div
              key={tpl.id}
              className="rp-glass rounded-2xl p-4 flex flex-col"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-medium">{tpl.nombre}</h3>
                    {tpl.popular && (
                      <Badge variant="outline" className="text-[9px] border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow-soft)]">
                        <Star className="h-2.5 w-2.5 mr-0.5" /> Popular
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{tpl.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 mb-3">
                <Badge variant="outline" className="text-[10px]">{tpl.categoria}</Badge>
                <Badge variant="outline" className="text-[10px]">{tpl.nodos} nodos</Badge>
              </div>
              <Button
                size="sm"
                variant={isInstalled ? "outline" : "default"}
                className={cn(
                  "mt-auto",
                  !isInstalled && "bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
                )}
                onClick={() => onInstall(tpl)}
                disabled={isInstalled}
              >
                {isInstalled ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Instalada
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Instalar
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
 * History panel
 * =======================================================*/
function HistoryPanel({ executions }: { executions: Execution[] }) {
  return (
    <div className="rp-glass rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-[var(--rp-emerald)]" />
          <h3 className="text-sm font-semibold">Historial de ejecuciones</h3>
        </div>
        <Badge variant="outline" className="text-[10px]">{executions.length}</Badge>
      </div>
      <div className="overflow-x-auto rp-scroll-thin">
        <table className="w-full text-sm">
          <thead className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground bg-foreground/[0.03]">
            <tr>
              <th className="text-left px-4 py-2">Flujo</th>
              <th className="text-left px-4 py-2 hidden sm:table-cell">Iniciado</th>
              <th className="text-right px-4 py-2">Duración</th>
              <th className="text-left px-4 py-2 hidden md:table-cell">Trigger</th>
              <th className="text-center px-4 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {executions.map((ex) => {
              const statusMeta = {
                success: { label: "Éxito", cls: "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]", dot: "bg-[var(--rp-emerald)]" },
                failed: { label: "Fallo", cls: "border-[var(--rp-red)]/40 bg-[var(--rp-red)]/10 text-[var(--rp-red-soft)]", dot: "bg-[var(--rp-red)]" },
                pending: { label: "Pendiente", cls: "border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow-soft)]", dot: "bg-[var(--rp-yellow)]" },
              }[ex.status];
              return (
                <tr key={ex.id} className="border-t border-border/40 hover:bg-foreground/[0.02]">
                  <td className="px-4 py-3 font-medium">{ex.flow}</td>
                  <td className="px-4 py-3 hidden sm:table-cell font-mono text-xs text-muted-foreground">
                    {new Date(ex.startedAt).toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-xs">
                    {ex.duration}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground font-mono">
                    {ex.triggeredBy}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium", statusMeta.cls)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", statusMeta.dot)} />
                      {statusMeta.label}
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

/* =========================================================
 * Webhooks panel
 * =========================================================*/
function WebhooksPanel({
  webhooks,
  onToggle,
  onDelete,
  onNew,
}: {
  webhooks: Webhook[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Webhooks salientes: notifica a sistemas externos cuando ocurre un evento.
        </p>
        <Button
          onClick={onNew}
          className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
        >
          <Plus className="h-4 w-4 mr-1" /> Nuevo webhook
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {webhooks.map((w) => {
          const estadoMeta = {
            active: { label: "Activo", cls: "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]", dot: "bg-[var(--rp-emerald)]" },
            paused: { label: "Pausado", cls: "border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow-soft)]", dot: "bg-[var(--rp-yellow)]" },
            error: { label: "Error", cls: "border-[var(--rp-red)]/40 bg-[var(--rp-red)]/10 text-[var(--rp-red-soft)]", dot: "bg-[var(--rp-red)]" },
          }[w.estado];
          return (
            <div key={w.id} className="rp-glass rounded-2xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Webhook className="h-4 w-4 text-[var(--rp-violet)] shrink-0" />
                    <span className="text-sm font-medium truncate">{w.evento}</span>
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground truncate mt-1">
                    {w.url}
                  </div>
                </div>
                <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-medium shrink-0", estadoMeta.cls)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", estadoMeta.dot)} />
                  {estadoMeta.label}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 my-3 text-xs">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Último
                  </div>
                  <div className="font-mono">{w.ultimoFire.replace("T", " ").slice(5, 16)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Envíos
                  </div>
                  <div className="font-mono tabular-nums text-[var(--rp-emerald-soft)]">{w.deliveries}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Fallos
                  </div>
                  <div className={cn("font-mono tabular-nums", w.failures > 0 ? "text-[var(--rp-red-soft)]" : "text-muted-foreground")}>
                    {w.failures}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onToggle(w.id)}
                >
                  {w.estado === "active" ? "Pausar" : "Activar"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[var(--rp-red-soft)] hover:text-[var(--rp-red)]"
                  onClick={() => onDelete(w.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
 * Webhook dialog
 * =======================================================*/
function WebhookDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: (url: string, evento: string) => void;
}) {
  const [url, setUrl] = React.useState("");
  const [evento, setEvento] = React.useState("ReservationCreated");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rp-glass-strong">
        <DialogHeader>
          <DialogTitle>Nuevo webhook</DialogTitle>
          <DialogDescription>
            Configura una URL destino y el evento que lo dispara.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label htmlFor="wh-url">URL destino</Label>
            <Input
              id="wh-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.tucuenta.com/webhook"
              className="bg-background/40 mt-1"
            />
          </div>
          <div>
            <Label htmlFor="wh-evento">Evento</Label>
            <Select value={evento} onValueChange={setEvento}>
              <SelectTrigger id="wh-evento" className="bg-background/40 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_CATALOG.map((tr) => (
                  <SelectItem key={tr.kind} value={tr.kind}>
                    {tr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-lg border border-[var(--rp-violet)]/30 bg-[var(--rp-violet)]/5 p-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-3 w-3 text-[var(--rp-violet-soft)]" />
              <span className="font-medium text-[var(--rp-violet-soft)]">Seguridad</span>
            </div>
            HMAC-SHA256 con rotación, anti-replay 5min, backoff exponencial,
            at-least-once delivery.
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
            onClick={() => {
              if (!url.trim()) return;
              onConfirm(url.trim(), evento);
              setUrl("");
              setEvento("ReservationCreated");
            }}
            disabled={!url.trim()}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" /> Crear webhook
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
