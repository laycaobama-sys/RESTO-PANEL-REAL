"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sparkles, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Clock,
  RotateCcw, AlertTriangle, Lock, Bot,
  Download, Filter, ChevronRight, Ban, Tag, MessageSquare,
  CalendarClock, Send, Megaphone, CalendarX, Users2, Table2,
  CalendarPlus, UtensilsCrossed, FileBarChart, AlertOctagon,
  KeyRound, Eye, Zap, ArrowLeftRight, ShieldOff,
  ListChecks, FilePlus2, Info,
} from "lucide-react";

/* ============================================================
   Types
============================================================ */

type ActionRisk = "low" | "medium" | "high" | "critical";
type ActionStatus =
  | "pending_approval"
  | "approved"
  | "executing"
  | "completed"
  | "rejected"
  | "failed"
  | "rolled_back";
type ActionType =
  | "move_reservation"
  | "create_reservation"
  | "cancel_reservation"
  | "send_campaign"
  | "create_promotion"
  | "change_schedule"
  | "close_reservations"
  | "activate_waitlist"
  | "reassign_tables"
  | "create_shift"
  | "update_menu"
  | "reply_review"
  | "generate_report"
  | "create_incident"
  | "update_crm"
  | "add_tag"
  | "create_draft";

interface AIAction {
  id: string;
  type: ActionType;
  risk: ActionRisk;
  status: ActionStatus;
  title: string;
  description: string;
  requestedBy: string;
  affects: string;
  dataUsed: string[];
  impactEstimate: string;
  confidence: number;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  executedAt?: string;
  result?: string;
  error?: string;
  canUndo: boolean;
  undoDeadline?: string;
  requiresApproval: boolean;
  rollbackPlan?: string[];
}

/* ============================================================
   Helpers
============================================================ */

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "hace unos segundos";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dateLabel(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isoMinusMin(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString();
}
function isoPlusMin(min: number): string {
  return new Date(Date.now() + min * 60_000).toISOString();
}

/* ============================================================
   Risk / Status / Type metadata
============================================================ */

const RISK_META: Record<
  ActionRisk,
  { label: string; cls: string; dot: string; icon: React.ElementType }
> = {
  low: {
    label: "Riesgo bajo",
    cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    dot: "bg-emerald-400",
    icon: CheckCircle2,
  },
  medium: {
    label: "Riesgo medio",
    cls: "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
    dot: "bg-[var(--gold)]",
    icon: ShieldCheck,
  },
  high: {
    label: "Riesgo alto",
    cls: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
    icon: AlertTriangle,
  },
  critical: {
    label: "Riesgo crítico",
    cls: "border-rose-400/40 bg-rose-400/10 text-rose-300",
    dot: "bg-rose-400",
    icon: ShieldAlert,
  },
};

const STATUS_META: Record<
  ActionStatus,
  { label: string; cls: string; dot: string; icon: React.ElementType }
> = {
  pending_approval: {
    label: "Pendiente de aprobación",
    cls: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
    icon: Clock,
  },
  approved: {
    label: "Aprobada",
    cls: "border-sky-400/40 bg-sky-400/10 text-sky-300",
    dot: "bg-sky-400",
    icon: CheckCircle2,
  },
  executing: {
    label: "Ejecutando",
    cls: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
    dot: "bg-[var(--teal)]",
    icon: Zap,
  },
  completed: {
    label: "Completada",
    cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    dot: "bg-emerald-400",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rechazada",
    cls: "border-border/60 bg-foreground/5 text-muted-foreground",
    dot: "bg-muted-foreground",
    icon: XCircle,
  },
  failed: {
    label: "Fallida",
    cls: "border-rose-400/40 bg-rose-400/10 text-rose-300",
    dot: "bg-rose-400",
    icon: AlertOctagon,
  },
  rolled_back: {
    label: "Revertida",
    cls: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
    dot: "bg-[var(--teal)]",
    icon: RotateCcw,
  },
};

const TYPE_META: Record<
  ActionType,
  { label: string; icon: React.ElementType }
> = {
  move_reservation: { label: "Mover reserva", icon: ArrowLeftRight },
  create_reservation: { label: "Crear reserva", icon: CalendarPlus },
  cancel_reservation: { label: "Cancelar reserva", icon: CalendarX },
  send_campaign: { label: "Enviar campaña", icon: Send },
  create_promotion: { label: "Crear promoción", icon: Megaphone },
  change_schedule: { label: "Cambiar horario", icon: CalendarClock },
  close_reservations: { label: "Cerrar reservas", icon: CalendarX },
  activate_waitlist: { label: "Activar waitlist", icon: ListChecks },
  reassign_tables: { label: "Reasignar mesas", icon: Table2 },
  create_shift: { label: "Crear turno", icon: Users2 },
  update_menu: { label: "Actualizar menú", icon: UtensilsCrossed },
  reply_review: { label: "Responder reseña", icon: MessageSquare },
  generate_report: { label: "Generar informe", icon: FileBarChart },
  create_incident: { label: "Crear incidencia", icon: AlertOctagon },
  update_crm: { label: "Actualizar CRM", icon: Users2 },
  add_tag: { label: "Añadir etiqueta", icon: Tag },
  create_draft: { label: "Crear borrador", icon: FilePlus2 },
};

/* ============================================================
   Demo data — pending actions
============================================================ */

const INITIAL_PENDING: AIAction[] = [
  {
    id: "ACT-001",
    type: "move_reservation",
    risk: "medium",
    status: "pending_approval",
    title: "Mover reserva RES-0142 de M7 a M5",
    description:
      "Mesa M7 requiere preparación para grupo de 8 a las 22:00. Mover a Elena Marín (reserva para 2, 21:30) a M5 (mesa contigua disponible). Sin impacto en otras reservas.",
    requestedBy: "Revenue Agent",
    affects: "Elena Marín · M7 → M5",
    dataUsed: ["Reservations", "Table availability", "CRM"],
    impactEstimate: "Evitar retraso, preparar próxima reserva",
    confidence: 88,
    createdAt: isoMinusMin(4),
    canUndo: true,
    undoDeadline: isoPlusMin(15),
    requiresApproval: true,
    rollbackPlan: [
      "Restaurar asignación original M7 a través del log de reservas",
      "Notificar a Elena Marín por SMS del cambio revertido",
      "Liberar M5 si ha sido preparada para la nueva reserva",
    ],
  },
  {
    id: "ACT-002",
    type: "send_campaign",
    risk: "high",
    status: "pending_approval",
    title: "Enviar WhatsApp a 14 VIPs inactivos",
    description:
      "Segmento de 14 clientes VIP sin visita en >90 días. Mensaje personalizado con invitación a menú degustación exclusivo (+15% descuento). Coste estimado €18, ingresos esperados €2.380.",
    requestedBy: "Marketing Agent",
    affects: "14 clientes VIP",
    dataUsed: ["CRM", "Campaign Attribution", "Consent log"],
    impactEstimate: "+€2.380 estimado",
    confidence: 82,
    createdAt: isoMinusMin(11),
    canUndo: false,
    requiresApproval: true,
    rollbackPlan: [
      "No reversible tras envío (entrega inmediata)",
      "Posible enviar mensaje de rectificación en 24h si error de contenido",
      "Auditar consentimiento GDPR antes de cada reenvío",
    ],
  },
  {
    id: "ACT-003",
    type: "reply_review",
    risk: "low",
    status: "pending_approval",
    title: "Publicar respuesta a reseña de Google",
    description:
      "Reseña 3★ de 'María G.' menciona tiempo de espera en barra. Respuesta propuesta: disculpa + invitación a volver con prioridad de mesa. Tono empático, conforme a guía de marca.",
    requestedBy: "Reputation Agent",
    affects: "Google Review · 3★",
    dataUsed: ["Google Reviews", "Brand voice guide"],
    impactEstimate: "Mejorar reputación",
    confidence: 95,
    createdAt: isoMinusMin(2),
    canUndo: true,
    undoDeadline: isoPlusMin(30),
    requiresApproval: false,
    rollbackPlan: [
      "Editar respuesta en Google My Business en 30 min tras publicación",
      "Notificar al equipo de reputación del cambio",
    ],
  },
  {
    id: "ACT-004",
    type: "close_reservations",
    risk: "high",
    status: "pending_approval",
    title: "Cerrar reservas del 25 ene (evento privado)",
    description:
      "Evento privado confirmado para el 25 de enero (cierre del local al público). Cerrar disponibilidad online en todos los canales (web, Google, WhatsApp) y notificar a reservas existentes.",
    requestedBy: "Operations Agent",
    affects: "Público general · 25 ene",
    dataUsed: ["Calendar", "Channel sync", "Bookings"],
    impactEstimate: "Evitar overbooking",
    confidence: 100,
    createdAt: isoMinusMin(18),
    canUndo: true,
    undoDeadline: isoPlusMin(45),
    requiresApproval: true,
    rollbackPlan: [
      "Reabrir disponibilidad en canales online",
      "Contactar a reservas ya canceladas para reprogramar",
      "Sync con Google Reservations en hasta 15 min",
    ],
  },
];

/* ============================================================
   Demo data — history
============================================================ */

const INITIAL_HISTORY: AIAction[] = [
  {
    id: "ACT-099",
    type: "send_campaign",
    risk: "high",
    status: "completed",
    title: "Campaña 'Cumpleaños Marzo' a 38 clientes",
    description: "Envío WhatsApp segmentado a cumpleañeros de marzo con oferta de menú especial.",
    requestedBy: "Marketing Agent",
    affects: "38 clientes · Cumpleaños Marzo",
    dataUsed: ["CRM", "Campaign Attribution"],
    impactEstimate: "+€1.840 ingresos",
    confidence: 90,
    createdAt: isoMinusMin(360),
    approvedBy: "Ana Martínez",
    approvedAt: isoMinusMin(355),
    executedAt: isoMinusMin(354),
    result: "38 envíos correctos · 12 reservas confirmadas · €1.840 ingresos atribuidos",
    canUndo: false,
    requiresApproval: true,
  },
  {
    id: "ACT-098",
    type: "move_reservation",
    risk: "medium",
    status: "completed",
    title: "Mover reserva RES-0138 a terraza",
    description: "Reubicación por solicitud de cliente y disponibilidad en terraza.",
    requestedBy: "Revenue Agent",
    affects: "Familia Ruiz · Sala → Terraza",
    dataUsed: ["Reservations", "Table availability"],
    impactEstimate: "+€0 (satisfacción cliente)",
    confidence: 92,
    createdAt: isoMinusMin(240),
    approvedBy: "Auto (riesgo medio)",
    approvedAt: isoMinusMin(239),
    executedAt: isoMinusMin(238),
    result: "Cliente notificado, mesa asignada correctamente",
    canUndo: false,
    requiresApproval: true,
  },
  {
    id: "ACT-097",
    type: "reply_review",
    risk: "low",
    status: "completed",
    title: "Respuesta a reseña 5★ de Google",
    description: "Agradecimiento público a cliente recurrente.",
    requestedBy: "Reputation Agent",
    affects: "Google Review · 5★",
    dataUsed: ["Google Reviews"],
    impactEstimate: "Refuerzo reputacional",
    confidence: 97,
    createdAt: isoMinusMin(120),
    approvedBy: "Auto (riesgo bajo)",
    approvedAt: isoMinusMin(120),
    executedAt: isoMinusMin(120),
    result: "Respuesta publicada · 3 likes · 1 nueva visita",
    canUndo: false,
    requiresApproval: false,
  },
  {
    id: "ACT-096",
    type: "generate_report",
    risk: "low",
    status: "completed",
    title: "Informe semanal de ocupación y facturación",
    description: "Generación automática del informe de la semana para el equipo directivo.",
    requestedBy: "Ops Agent",
    affects: "Equipo directivo",
    dataUsed: ["D1", "Billing", "Reservations"],
    impactEstimate: "Visibilidad operativa",
    confidence: 100,
    createdAt: isoMinusMin(95),
    approvedBy: "Auto (riesgo bajo)",
    approvedAt: isoMinusMin(95),
    executedAt: isoMinusMin(94),
    result: "PDF generado y enviado a 4 destinatarios",
    canUndo: false,
    requiresApproval: false,
  },
  {
    id: "ACT-095",
    type: "cancel_reservation",
    risk: "high",
    status: "completed",
    title: "Cancelar reserva RES-0119 (no-show reincidente)",
    description: "Cliente reincidente en no-show sin confirmación. Cancelación preventiva según política.",
    requestedBy: "Ops Agent",
    affects: "Carlos M. · Reserva 22:30",
    dataUsed: ["Reservations", "No-show log"],
    impactEstimate: "Liberar mesa para waitlist",
    confidence: 85,
    createdAt: isoMinusMin(180),
    approvedBy: "Manager (L. Pérez)",
    approvedAt: isoMinusMin(178),
    executedAt: isoMinusMin(177),
    result: "Mesa liberada y reasignada a waitlist",
    canUndo: false,
    requiresApproval: true,
  },
  {
    id: "ACT-094",
    type: "send_campaign",
    risk: "high",
    status: "failed",
    title: "Campaña 'Promo Terraza' a 220 clientes",
    description: "Envío masivo de promo de terraza con descuento del 20%.",
    requestedBy: "Marketing Agent",
    affects: "220 clientes segmento 'terraza'",
    dataUsed: ["CRM"],
    impactEstimate: "+€460 ingresos esperados",
    confidence: 70,
    createdAt: isoMinusMin(540),
    approvedBy: "Manager (L. Pérez)",
    approvedAt: isoMinusMin(535),
    executedAt: isoMinusMin(534),
    error: "Rate limit de WhatsApp provider. 47/220 envíos completados antes del timeout.",
    canUndo: false,
    requiresApproval: true,
    rollbackPlan: [
      "Reintentar 173 envíos pendientes con backoff exponencial",
      "Verificar cuota del provider antes de reenvío",
    ],
  },
  {
    id: "ACT-093",
    type: "create_promotion",
    risk: "medium",
    status: "completed",
    title: "Crear promoción 'Menú Mediodía'",
    description: "Promoción válida de lunes a jueves en franja 13:00-15:30.",
    requestedBy: "Revenue Agent",
    affects: "Público general · L-J 13-15:30",
    dataUsed: ["Reservations", "Pricing rules"],
    impactEstimate: "+€1.620 ingresos esperados",
    confidence: 84,
    createdAt: isoMinusMin(780),
    approvedBy: "Ana Martínez",
    approvedAt: isoMinusMin(775),
    executedAt: isoMinusMin(774),
    result: "Promoción activa · 38 reservas convertidas en 7 días",
    canUndo: true,
    undoDeadline: isoMinusMin(60),
    requiresApproval: true,
    rollbackPlan: ["Desactivar promoción", "Notificar a reservas ya confirmadas bajo la promo"],
  },
  {
    id: "ACT-092",
    type: "change_schedule",
    risk: "high",
    status: "rejected",
    title: "Cerrar cocina 30 min antes (cortes de personal)",
    description: "Propuesta de cierre anticipado de cocina por falta de personal de sala.",
    requestedBy: "Ops Agent",
    affects: "Reservas 23:00-23:30 (4 reservas)",
    dataUsed: ["Staff schedule", "Reservations"],
    impactEstimate: "Ahorro €180 coste personal",
    confidence: 60,
    createdAt: isoMinusMin(720),
    canUndo: false,
    requiresApproval: true,
  },
  {
    id: "ACT-091",
    type: "activate_waitlist",
    risk: "medium",
    status: "completed",
    title: "Activar waitlist para viernes 21:00-22:30",
    description: "Activación automática al detectar ocupación prevista >90% en franja pico.",
    requestedBy: "Revenue Agent",
    affects: "Público general · Viernes 21-22:30",
    dataUsed: ["Forecast v2.1", "Reservations"],
    impactEstimate: "Capturar 8-12 reservas adicionales",
    confidence: 88,
    createdAt: isoMinusMin(900),
    approvedBy: "Auto (umbral 90%)",
    approvedAt: isoMinusMin(900),
    executedAt: isoMinusMin(899),
    result: "11 clientes en waitlist · 7 acabaron reservando",
    canUndo: false,
    requiresApproval: false,
  },
  {
    id: "ACT-090",
    type: "update_menu",
    risk: "medium",
    status: "rolled_back",
    title: "Marcar plato 'Risotto trufa' como agotado",
    description: "Detección de stock insuficiente para servicio del mediodía.",
    requestedBy: "Inventory Agent",
    affects: "Carta digital · Mediodía",
    dataUsed: ["Inventory", "POS"],
    impactEstimate: "Evitar pedidos no servibles",
    confidence: 92,
    createdAt: isoMinusMin(510),
    approvedBy: "Auto (riesgo medio)",
    approvedAt: isoMinusMin(510),
    executedAt: isoMinusMin(509),
    result: "Plato marcado como agotado en carta digital durante 1h",
    canUndo: true,
    undoDeadline: isoMinusMin(50),
    requiresApproval: false,
    rollbackPlan: ["Reactivar plato en carta", "Notificar a cocina del restock"],
  },
  {
    id: "ACT-089",
    type: "reassign_tables",
    risk: "medium",
    status: "completed",
    title: "Reasignar 3 mesas por mantenimiento M3",
    description: "M3 requiere reparación. Reasignación de reservas a M2, M4 y M9.",
    requestedBy: "Ops Agent",
    affects: "3 reservas · M3 → M2/M4/M9",
    dataUsed: ["Reservations", "Table status"],
    impactEstimate: "Evitar incidencia en servicio",
    confidence: 95,
    createdAt: isoMinusMin(660),
    approvedBy: "Manager (L. Pérez)",
    approvedAt: isoMinusMin(658),
    executedAt: isoMinusMin(657),
    result: "3 reservas notificadas y reasignadas",
    canUndo: false,
    requiresApproval: true,
  },
  {
    id: "ACT-088",
    type: "add_tag",
    risk: "low",
    status: "completed",
    title: "Etiquetar 14 clientes como 'fans de la carta de vinos'",
    description: "Segmentación automática por historial de pedidos.",
    requestedBy: "CRM Agent",
    affects: "14 clientes · CRM",
    dataUsed: ["CRM", "POS"],
    impactEstimate: "Segmentación para futuras campañas",
    confidence: 90,
    createdAt: isoMinusMin(1020),
    approvedBy: "Auto (riesgo bajo)",
    approvedAt: isoMinusMin(1020),
    executedAt: isoMinusMin(1020),
    result: "14 etiquetas añadidas correctamente",
    canUndo: false,
    requiresApproval: false,
  },
];

/* ============================================================
   Demo data — action types catalog
============================================================ */

interface CatalogItem {
  type: ActionType;
  description: string;
  example: string;
  risk: ActionRisk;
  approver?: "Manager" | "Owner" | "Owner + Support HQ";
  mfa?: boolean;
}

const AUTOMATIC_ACTIONS: CatalogItem[] = [
  {
    type: "create_draft",
    description: "Crear borradores de mensajes, campañas o respuestas.",
    example: "Borrador de respuesta a 6 reseñas pendientes",
    risk: "low",
  },
  {
    type: "generate_report",
    description: "Generar informes operativos y de negocio.",
    example: "Informe semanal de ocupación y facturación",
    risk: "low",
  },
  {
    type: "add_tag",
    description: "Añadir etiquetas internas al CRM.",
    example: "Etiquetar 14 clientes como 'fans de vinos'",
    risk: "low",
  },
  {
    type: "update_crm",
    description: "Actualizar datos no sensibles del CRM.",
    example: "Marcar preferencia 'ventana interior' en 3 fichas",
    risk: "low",
  },
  {
    type: "create_incident",
    description: "Crear recomendaciones internas sin impacto externo.",
    example: "Recomendar activación de waitlist para viernes 21:00",
    risk: "low",
  },
];

const CONFIRMATION_ACTIONS: CatalogItem[] = [
  {
    type: "send_campaign",
    description: "Enviar comunicaciones a clientes por cualquier canal.",
    example: "WhatsApp a 14 VIPs inactivos",
    risk: "high",
    approver: "Manager",
    mfa: true,
  },
  {
    type: "change_schedule",
    description: "Cambiar horarios públicos del local.",
    example: "Cerrar cocina 30 min antes",
    risk: "high",
    approver: "Manager",
    mfa: true,
  },
  {
    type: "cancel_reservation",
    description: "Cancelar o mover reservas existentes.",
    example: "Cancelar reserva RES-0119 (no-show)",
    risk: "high",
    approver: "Manager",
    mfa: true,
  },
  {
    type: "move_reservation",
    description: "Mover reservas entre mesas o franjas.",
    example: "Mover RES-0142 de M7 a M5",
    risk: "medium",
    approver: "Manager",
  },
  {
    type: "create_promotion",
    description: "Crear descuentos y promociones públicas.",
    example: "Promo 'Menú Mediodía' L-J 13-15:30",
    risk: "medium",
    approver: "Manager",
  },
  {
    type: "close_reservations",
    description: "Cerrar reservas en una franja o día.",
    example: "Cerrar reservas del 25 ene (evento privado)",
    risk: "high",
    approver: "Manager",
    mfa: true,
  },
  {
    type: "reply_review",
    description: "Responder reseñas públicas en Google, TripAdvisor u otros.",
    example: "Respuesta a reseña 3★ de María G.",
    risk: "low",
    approver: "Manager",
  },
];

const PROHIBITED_ACTIONS: CatalogItem[] = [
  {
    type: "create_shift",
    description: "Borrar datos permanentemente (no soft-delete).",
    example: "Eliminar cliente del CRM definitivamente",
    risk: "critical",
    approver: "Owner + Support HQ",
  },
  {
    type: "create_shift",
    description: "Realizar pagos o mover fondos.",
    example: "Abonar €50 a tarjeta de cliente",
    risk: "critical",
    approver: "Owner + Support HQ",
  },
  {
    type: "create_shift",
    description: "Modificar permisos administrativos.",
    example: "Conceder rol de Owner a un usuario",
    risk: "critical",
    approver: "Owner + Support HQ",
  },
  {
    type: "create_shift",
    description: "Exportar datos sensibles (PII, financieros).",
    example: "Exportar CSV con IBAN de clientes",
    risk: "critical",
    approver: "Owner + Support HQ",
  },
  {
    type: "create_shift",
    description: "Campañas masivas sin consentimiento explícito.",
    example: "Email a 1.200 contactos sin opt-in verificado",
    risk: "critical",
    approver: "Owner + Support HQ",
  },
];

/* ============================================================
   UI primitives
============================================================ */


function RiskBadge({ risk }: { risk: ActionRisk }) {
  const m = RISK_META[risk];
  const Icon = m.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
        m.cls
      )}
    >
      <Icon className="h-3 w-3" />
      {m.label}
    </span>
  );
}

function StatusBadge({ status }: { status: ActionStatus }) {
  const m = STATUS_META[status];
  const Icon = m.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
        m.cls
      )}
    >
      <Icon className="h-3 w-3" />
      {m.label}
    </span>
  );
}

function TypeBadge({ type }: { type: ActionType }) {
  const m = TYPE_META[type];
  const Icon = m.icon;
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-foreground/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-foreground/80">
      <Icon className="h-3 w-3 text-muted-foreground" />
      {m.label}
    </span>
  );
}

function ConfidenceBadge({ value }: { value: number }) {
  const tone =
    value >= 80
      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
      : value >= 60
      ? "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]"
      : "border-amber-400/40 bg-amber-400/10 text-amber-300";
  const label = value >= 80 ? "Alta" : value >= 60 ? "Media" : "Baja";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
        tone
      )}
    >
      <span className="h-1 w-1 rounded-full bg-current" />
      {label} {value}%
    </span>
  );
}

function DataChips({ data }: { data: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {data.map((d) => (
        <span
          key={d}
          className="inline-flex items-center gap-1 rounded-md border border-[var(--teal)]/30 bg-[var(--teal)]/[0.07] px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]"
        >
          <span className="h-1 w-1 rounded-full bg-[var(--teal)]" />
          {d}
        </span>
      ))}
    </div>
  );
}

function ImpactPill({ estimate }: { estimate: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/[0.06] px-2 py-1 text-[11px] text-[var(--gold-soft)]">
      <Zap className="h-3 w-3" />
      <span className="font-medium">{estimate}</span>
    </div>
  );
}

function AgentPill({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] text-black">
        <Bot className="h-2.5 w-2.5" />
      </span>
      {name}
    </span>
  );
}

/* ============================================================
   Action detail dialog
============================================================ */

function ActionDetailDialog({
  action,
  open,
  onOpenChange,
}: {
  action: AIAction | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const reduce = useReducedMotion();
  if (!action) return null;
  const typeMeta = TYPE_META[action.type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rp-scroll-thin">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="rounded-md bg-foreground/5 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
              {action.id}
            </span>
            <TypeBadge type={action.type} />
            <RiskBadge risk={action.risk} />
            <StatusBadge status={action.status} />
            {!action.requiresApproval && (
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                Auto-elegible
              </span>
            )}
          </div>
          <DialogTitle className="font-display text-xl tracking-tight">
            {action.title}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {action.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Affected */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
              Afecta a
            </div>
            <div className="text-sm text-foreground/90">{action.affects}</div>
          </div>

          {/* Impact + confidence */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-md border border-border/60 bg-foreground/[0.02] p-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                Impacto estimado
              </div>
              <ImpactPill estimate={action.impactEstimate} />
            </div>
            <div className="rounded-md border border-border/60 bg-foreground/[0.02] p-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                Confianza del modelo
              </div>
              <ConfidenceBadge value={action.confidence} />
            </div>
          </div>

          {/* Data used */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
              Datos utilizados
            </div>
            <DataChips data={action.dataUsed} />
          </div>

          {/* Requested / approved / executed */}
          <div className="rounded-md border border-border/60 bg-foreground/[0.02] p-3 space-y-2 text-xs">
            <div className="flex items-start justify-between gap-2">
              <span className="text-muted-foreground">Solicitada por</span>
              <AgentPill name={action.requestedBy} />
            </div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-muted-foreground">Creada</span>
              <span className="text-foreground/80">{dateLabel(action.createdAt)} · {relativeTime(action.createdAt)}</span>
            </div>
            {action.approvedBy && (
              <div className="flex items-start justify-between gap-2">
                <span className="text-muted-foreground">Aprobada por</span>
                <span className="text-foreground/80">
                  {action.approvedBy}
                  {action.approvedAt && (
                    <span className="text-muted-foreground"> · {dateLabel(action.approvedAt)}</span>
                  )}
                </span>
              </div>
            )}
            {action.executedAt && (
              <div className="flex items-start justify-between gap-2">
                <span className="text-muted-foreground">Ejecutada</span>
                <span className="text-foreground/80">{dateLabel(action.executedAt)}</span>
              </div>
            )}
            {action.result && (
              <div className="pt-2 mt-2 border-t border-border/40">
                <div className="text-muted-foreground mb-1">Resultado</div>
                <div className="text-emerald-300">{action.result}</div>
              </div>
            )}
            {action.error && (
              <div className="pt-2 mt-2 border-t border-border/40">
                <div className="text-muted-foreground mb-1 flex items-center gap-1">
                  <AlertOctagon className="h-3 w-3" />
                  Error
                </div>
                <div className="text-rose-300">{action.error}</div>
              </div>
            )}
          </div>

          {/* Undo + rollback */}
          <div className="rounded-md border border-[var(--teal)]/30 bg-[var(--teal)]/[0.05] p-3 space-y-2">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-3.5 w-3.5 text-[var(--teal)]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--teal)]">
                Reversibilidad
              </span>
            </div>
            <div className="text-xs text-foreground/80">
              {action.canUndo ? (
                <>
                  Acción reversible
                  {action.undoDeadline && new Date(action.undoDeadline).getTime() > Date.now() && (
                    <span className="text-[var(--teal)]">
                      {" "}hasta las {timeLabel(action.undoDeadline)}
                    </span>
                  )}
                  {action.undoDeadline && new Date(action.undoDeadline).getTime() <= Date.now() && (
                    <span className="text-muted-foreground">
                      {" "}(plazo expirado: {timeLabel(action.undoDeadline)})
                    </span>
                  )}
                </>
              ) : (
                <span className="text-amber-300">Acción no reversible</span>
              )}
            </div>
            {action.rollbackPlan && action.rollbackPlan.length > 0 && (
              <div className="pt-2 mt-1 border-t border-[var(--teal)]/20">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                  Plan de reversión
                </div>
                <ol className="space-y-1 text-xs text-foreground/80">
                  {action.rollbackPlan.map((step, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-mono text-[var(--teal)] shrink-0">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Audit note */}
          <div className="flex items-start gap-2 rounded-md border border-border/60 bg-foreground/[0.02] p-3 text-[11px] text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>
              Toda acción queda registrada en auditoría inmutable. Las acciones reversibles muestran el plazo para deshacer.
              Datos demostrativos sin impacto real.
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================
   Pending action card
============================================================ */

function PendingActionCard({
  action,
  onApprove,
  onReject,
  onDetail,
  index,
}: {
  action: AIAction;
  onApprove: () => void;
  onReject: () => void;
  onDetail: () => void;
  index: number;
}) {
  const reduce = useReducedMotion();
  const typeMeta = TYPE_META[action.type];
  const needsMfa = action.risk === "high" || action.risk === "critical";

  return (
    <motion.div
      layout={reduce ? false : true}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.2) }}
      className="rp-glass rounded-xl p-4 sm:p-5 space-y-3"
    >
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
          {action.id}
        </span>
        <TypeBadge type={action.type} />
        <RiskBadge risk={action.risk} />
        <ConfidenceBadge value={action.confidence} />
        {!action.requiresApproval && (
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            Auto-elegible
          </span>
        )}
        <span className="ml-auto text-[11px] text-muted-foreground">
          {relativeTime(action.createdAt)}
        </span>
      </div>

      {/* Title + description */}
      <div>
        <h3 className="font-display text-base sm:text-lg tracking-tight leading-tight">
          {action.title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed mt-1 line-clamp-3">
          {action.description}
        </p>
      </div>

      {/* Affected + impact */}
      <div className="grid sm:grid-cols-2 gap-2.5">
        <div className="rounded-md border border-border/60 bg-foreground/[0.02] p-2.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
            Afecta a
          </div>
          <div className="text-xs text-foreground/90">{action.affects}</div>
        </div>
        <div className="rounded-md border border-border/60 bg-foreground/[0.02] p-2.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
            Impacto estimado
          </div>
          <ImpactPill estimate={action.impactEstimate} />
        </div>
      </div>

      {/* Data used */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
          Datos utilizados
        </div>
        <DataChips data={action.dataUsed} />
      </div>

      {/* Requested by + undo */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <AgentPill name={action.requestedBy} />
        {action.canUndo && action.undoDeadline && new Date(action.undoDeadline).getTime() > Date.now() && (
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--teal)]">
            <RotateCcw className="h-3 w-3" />
            Reversible hasta las {timeLabel(action.undoDeadline)}
          </span>
        )}
        {!action.canUndo && (
          <span className="inline-flex items-center gap-1 text-[11px] text-amber-300">
            <Lock className="h-3 w-3" />
            No reversible
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
        <TooltipProvider delayDuration={200}>
          {needsMfa ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onApprove}
                  size="sm"
                  className="h-9 bg-gradient-to-br from-[var(--gold-soft)] via-[var(--gold)] to-[var(--gold-deep)] text-black hover:opacity-90 min-h-[44px]"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Confirmar con MFA
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Requiere MFA reciente (≤2 min)
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              onClick={onApprove}
              size="sm"
              className="h-9 bg-emerald-500/90 text-black hover:bg-emerald-500 min-h-[44px]"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Confirmar
            </Button>
          )}
        </TooltipProvider>

        <Button
          onClick={onReject}
          size="sm"
          variant="ghost"
          className="h-9 min-h-[44px] text-muted-foreground hover:text-foreground hover:bg-foreground/5"
        >
          <XCircle className="h-3.5 w-3.5" />
          Rechazar
        </Button>

        <Button
          onClick={onDetail}
          size="sm"
          variant="outline"
          className="h-9 ml-auto min-h-[44px] border-border/60"
        >
          <Eye className="h-3.5 w-3.5" />
          Ver detalle
          <ChevronRight className="h-3 w-3 opacity-60" />
        </Button>
      </div>
    </motion.div>
  );
}

/* ============================================================
   History row
============================================================ */

function HistoryRow({
  action,
  onDetail,
  onUndo,
  index,
}: {
  action: AIAction;
  onDetail: () => void;
  onUndo: () => void;
  index: number;
}) {
  const reduce = useReducedMotion();
  const canRollback =
    action.canUndo &&
    action.undoDeadline &&
    new Date(action.undoDeadline).getTime() > Date.now() &&
    action.status === "completed";

  return (
    <motion.div
      layout={reduce ? false : true}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.15) }}
      className="rp-glass rounded-lg p-3 sm:p-4 space-y-2.5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
          {action.id}
        </span>
        <TypeBadge type={action.type} />
        <RiskBadge risk={action.risk} />
        <StatusBadge status={action.status} />
        <span className="ml-auto text-[11px] text-muted-foreground">
          {action.executedAt ? relativeTime(action.executedAt) : relativeTime(action.createdAt)}
        </span>
      </div>

      <div className="text-sm font-medium text-foreground/90 leading-snug">{action.title}</div>

      {action.result && (
        <div className="flex items-start gap-1.5 text-[11px] text-emerald-300">
          <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0" />
          <span>{action.result}</span>
        </div>
      )}
      {action.error && (
        <div className="flex items-start gap-1.5 text-[11px] text-rose-300">
          <AlertOctagon className="h-3 w-3 mt-0.5 shrink-0" />
          <span>{action.error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Bot className="h-3 w-3" />
          {action.requestedBy}
        </span>
        {action.approvedBy && (
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            {action.approvedBy}
          </span>
        )}
        {action.executedAt && (
          <span className="inline-flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {dateLabel(action.executedAt)}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1.5 border-t border-border/40">
        <Button
          onClick={onDetail}
          size="sm"
          variant="ghost"
          className="h-8 text-[11px] min-h-[36px] text-muted-foreground hover:text-foreground"
        >
          <Eye className="h-3 w-3" />
          Ver detalle
        </Button>
        {canRollback && (
          <Button
            onClick={onUndo}
            size="sm"
            variant="outline"
            className="h-8 text-[11px] min-h-[36px] border-[var(--teal)]/40 text-[var(--teal)] hover:bg-[var(--teal)]/10"
          >
            <RotateCcw className="h-3 w-3" />
            Deshacer
          </Button>
        )}
        {action.status === "rolled_back" && (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]">
            <RotateCcw className="h-3 w-3" />
            Revertida · {action.undoDeadline ? relativeTime(action.undoDeadline) : ""}
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* ============================================================
   History filter
============================================================ */

type FilterKey = "all" | "completed" | "rejected" | "failed" | "rolled_back";

const FILTERS: { id: FilterKey; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "completed", label: "Completadas" },
  { id: "rejected", label: "Rechazadas" },
  { id: "failed", label: "Fallidas" },
  { id: "rolled_back", label: "Revertidas" },
];

/* ============================================================
   Action types catalog tab
============================================================ */

function CatalogSection({
  title,
  subtitle,
  items,
  tone,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  items: CatalogItem[];
  tone: "green" | "amber" | "red";
  icon: React.ElementType;
}) {
  const toneCls =
    tone === "green"
      ? "border-emerald-400/30 bg-emerald-400/[0.04]"
      : tone === "amber"
      ? "border-amber-400/30 bg-amber-400/[0.04]"
      : "border-rose-400/30 bg-rose-400/[0.04]";
  const headCls =
    tone === "green"
      ? "text-emerald-300"
      : tone === "amber"
      ? "text-amber-300"
      : "text-rose-300";
  return (
    <section className={cn("rounded-xl border p-4 sm:p-5", toneCls)}>
      <div className="flex items-center gap-2 mb-1">
        <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-md bg-foreground/5", headCls)}>
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="font-display text-lg tracking-tight">{title}</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4 ml-9">{subtitle}</p>
      <div className="grid sm:grid-cols-2 gap-2.5">
        {items.map((it, i) => {
          const m = TYPE_META[it.type];
          const Icon = m.icon;
          return (
            <div
              key={i}
              className="rounded-lg border border-border/60 bg-foreground/[0.02] p-3 space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium">{it.description}</span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                <span className="font-mono uppercase tracking-wider">Ejemplo:</span>{" "}
                <span className="text-foreground/80">{it.example}</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <RiskBadge risk={it.risk} />
                {it.approver && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-foreground/[0.04] px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-foreground/70">
                    <ShieldCheck className="h-3 w-3" />
                    {it.approver}
                  </span>
                )}
                {it.mfa && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)]">
                    <KeyRound className="h-3 w-3" />
                    MFA
                  </span>
                )}
                {tone === "green" && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" />
                    Auto-ejecutada
                  </span>
                )}
                {tone === "red" && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-rose-400/40 bg-rose-400/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-rose-300">
                    <Ban className="h-3 w-3" />
                    Bloqueada por defecto
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================
   Undo confirmation dialog
============================================================ */

function UndoDialog({
  open,
  onOpenChange,
  action,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  action: AIAction | null;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-[var(--teal)]" />
            Revertir acción
          </AlertDialogTitle>
          <AlertDialogDescription>
            {action && (
              <>
                Vas a revertir <span className="font-mono text-foreground/90">{action.id}</span>:
                <span className="block mt-1 text-foreground/90">{action.title}</span>
                <span className="block mt-2 text-xs text-muted-foreground">
                  La acción pasará a estado <span className="text-[var(--teal)]">Revertida</span> y se
                  ejecutará el plan de reversión. Esta operación queda registrada en auditoría.
                </span>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="min-h-[44px]">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-[var(--teal)] text-black hover:bg-[var(--teal)]/90 min-h-[44px]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Confirmar reversión
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ============================================================
   Main export
============================================================ */

export function AiOsActions() {
  const reduce = useReducedMotion();
  const { toast } = useToast();
  const [tab, setTab] = React.useState<"pending" | "history" | "types">("pending");
  const [pending, setPending] = React.useState<AIAction[]>(INITIAL_PENDING);
  const [history, setHistory] = React.useState<AIAction[]>(INITIAL_HISTORY);
  const [filter, setFilter] = React.useState<FilterKey>("all");
  const [detailAction, setDetailAction] = React.useState<AIAction | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [undoTarget, setUndoTarget] = React.useState<AIAction | null>(null);
  const [undoOpen, setUndoOpen] = React.useState(false);

  function approve(a: AIAction) {
    const nowIso = new Date().toISOString();
    const executed: AIAction = {
      ...a,
      status: "completed",
      approvedBy: a.risk === "high" || a.risk === "critical" ? "Ana Martínez (MFA)" : "Ana Martínez",
      approvedAt: nowIso,
      executedAt: nowIso,
      result: a.type === "reply_review"
        ? "Respuesta publicada · notificación enviada"
        : a.type === "send_campaign"
        ? `${a.dataUsed.length} fuentes verificadas · envíos completados (demo)`
        : a.type === "close_reservations"
        ? "Disponibilidad cerrada en canales online (demo)"
        : "Acción ejecutada correctamente (demo)",
    };
    setPending((cur) => cur.filter((x) => x.id !== a.id));
    setHistory((cur) => [executed, ...cur]);
    toast({
      title: "Acción ejecutada (demo)",
      description: `${a.id} · ${a.title}`,
    });
  }

  function reject(a: AIAction) {
    const nowIso = new Date().toISOString();
    const rejected: AIAction = {
      ...a,
      status: "rejected",
      approvedBy: "Ana Martínez",
      approvedAt: nowIso,
    };
    setPending((cur) => cur.filter((x) => x.id !== a.id));
    setHistory((cur) => [rejected, ...cur]);
    toast({
      title: "Acción rechazada",
      description: `${a.id} · ${a.title}`,
    });
  }

  function openDetail(a: AIAction) {
    setDetailAction(a);
    setDetailOpen(true);
  }

  function openUndo(a: AIAction) {
    setUndoTarget(a);
    setUndoOpen(true);
  }

  function confirmUndo() {
    if (!undoTarget) return;
    const nowIso = new Date().toISOString();
    const rolled: AIAction = {
      ...undoTarget,
      status: "rolled_back",
      undoDeadline: nowIso,
      result: `Revertida · ${undoTarget.result ?? "Plan de reversión ejecutado (demo)"}`,
    };
    setHistory((cur) => cur.map((x) => (x.id === rolled.id ? rolled : x)));
    toast({
      title: "Acción revertida (demo)",
      description: `${rolled.id} · ${rolled.title}`,
    });
    setUndoOpen(false);
    setUndoTarget(null);
  }

  function exportHistory() {
    toast({
      title: "Exportando historial (demo)",
      description: `${history.length} acciones · formato CSV`,
    });
  }

  const pendingCount = pending.length;

  const filteredHistory = React.useMemo(() => {
    if (filter === "all") return history;
    return history.filter((h) => h.status === filter);
  }, [filter, history]);

  return (
    <div className="space-y-5 overflow-x-hidden">
      {/* Header */}
      <motion.header
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rp-glass-strong rounded-xl p-4 sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] text-black">
                <Sparkles className="h-4 w-4" />
              </span>
              <h1 className="font-display text-2xl sm:text-3xl tracking-tight">Acciones de IA</h1>
              
            </div>
            <p className="text-sm text-muted-foreground">
              Motor de acciones con flujo de aprobación, tipos clasificados y log inmutable.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-right">
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300">
                Pendientes
              </div>
              <div className="font-display text-2xl text-amber-300 leading-none mt-0.5">
                {pendingCount}
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-foreground/[0.03] px-3 py-2 text-right">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Hoy ejecutadas
              </div>
              <div className="font-display text-2xl leading-none mt-0.5">23</div>
            </div>
            <div className="rounded-lg border border-border/60 bg-foreground/[0.03] px-3 py-2 text-right">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Revertidas 24h
              </div>
              <div className="font-display text-2xl leading-none mt-0.5">2</div>
            </div>
          </div>
        </div>
        {pendingCount > 0 && (
          <div className="mt-3 text-[11px] text-amber-300 flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>{pendingCount} pendientes de aprobación</span>
          </div>
        )}
      </motion.header>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <div className="rp-glass rounded-xl p-1 inline-flex">
          <TabsList className="bg-transparent h-auto p-0">
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-[var(--gold)]/15 data-[state=active]:text-[var(--gold-soft)] min-h-[40px]"
            >
              Pendientes
              {pendingCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-amber-400/30 px-1.5 text-[10px] font-mono text-amber-300">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-[var(--gold)]/15 data-[state=active]:text-[var(--gold-soft)] min-h-[40px]"
            >
              Historial
            </TabsTrigger>
            <TabsTrigger
              value="types"
              className="data-[state=active]:bg-[var(--gold)]/15 data-[state=active]:text-[var(--gold-soft)] min-h-[40px]"
            >
              Tipos de acción
            </TabsTrigger>
          </TabsList>
        </div>

        {/* PENDIENTES */}
        <TabsContent value="pending" className="mt-4">
          {pending.length === 0 ? (
            <div className="rp-glass rounded-xl p-10 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300 mb-3">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg">Sin acciones pendientes</h3>
              <p className="text-sm text-muted-foreground mt-1">
                No hay acciones esperando aprobación. Las nuevas propuestas aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {pending.map((a, i) => (
                  <PendingActionCard
                    key={a.id}
                    action={a}
                    index={i}
                    onApprove={() => approve(a)}
                    onReject={() => reject(a)}
                    onDetail={() => openDetail(a)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        {/* HISTORIAL */}
        <TabsContent value="history" className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rp-glass rounded-lg p-1 overflow-x-auto rp-scroll-thin max-w-full">
              <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-1.5" />
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "h-8 rounded-md px-2.5 text-[11px] font-medium transition-colors whitespace-nowrap min-h-[36px]",
                    filter === f.id
                      ? "bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  )}
                  aria-pressed={filter === f.id}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <Button
              onClick={exportHistory}
              size="sm"
              variant="outline"
              className="h-9 ml-auto min-h-[44px] border-border/60"
            >
              <Download className="h-3.5 w-3.5" />
              Exportar historial
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredHistory.map((h, i) => (
                <HistoryRow
                  key={h.id}
                  action={h}
                  index={i}
                  onDetail={() => openDetail(h)}
                  onUndo={() => openUndo(h)}
                />
              ))}
            </AnimatePresence>
          </div>
          {filteredHistory.length === 0 && (
            <div className="rp-glass rounded-xl p-8 text-center text-sm text-muted-foreground">
              No hay acciones en este filtro.
            </div>
          )}
        </TabsContent>

        {/* TIPOS */}
        <TabsContent value="types" className="mt-4 space-y-4">
          <CatalogSection
            title="Acciones automáticas"
            subtitle="Riesgo bajo · sin aprobación requerida · ejecución inmediata."
            items={AUTOMATIC_ACTIONS}
            tone="green"
            icon={Zap}
          />
          <CatalogSection
            title="Acciones con confirmación"
            subtitle="Riesgo medio/alto · requieren aprobación de Manager u Owner · MFA opcional para alto riesgo."
            items={CONFIRMATION_ACTIONS}
            tone="amber"
            icon={ShieldCheck}
          />
          <CatalogSection
            title="Acciones prohibidas"
            subtitle="Riesgo crítico · bloqueadas por defecto · requieren autorización Owner + Support HQ."
            items={PROHIBITED_ACTIONS}
            tone="red"
            icon={ShieldOff}
          />
          <div className="flex items-start gap-2 rounded-md border border-border/60 bg-foreground/[0.02] p-3 text-[11px] text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>
              Toda acción queda registrada en auditoría inmutable. Las acciones reversibles muestran el plazo para deshacer.
              Catálogo demostrativo.
            </span>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ActionDetailDialog
        action={detailAction}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
      <UndoDialog
        open={undoOpen}
        onOpenChange={setUndoOpen}
        action={undoTarget}
        onConfirm={confirmUndo}
      />
    </div>
  );
}
