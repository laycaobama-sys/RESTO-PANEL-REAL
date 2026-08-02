"use client";

/* ============================================================================
 * RestoPanel · Automatizaciones preinstaladas
 * 20 automatizaciones listas para usar. Toggle activar/desactivar, métricas
 * de impacto, historial y detalle con condiciones, plantilla y auditoría.
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  CalendarPlus, BellRing, UserX, AlertTriangle, Star, RefreshCw,
  Gift, Award, PackageX, Boxes, CreditCard, MessageCircle, Truck,
  ChefHat, CalendarDays, Clock, AlertCircle, TrendingDown, Moon,
  Zap, History, ChevronRight, X, Activity, Sparkles, Brain,
  CheckCircle2, XCircle, Filter, Search, Settings2, Mail,
  Timer, Target, ShieldCheck, FileText,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type AutoCategory =
  | "reservas"
  | "crm"
  | "fidelizacion"
  | "inventario"
  | "operativa"
  | "personal"
  | "pagos"
  | "reputacion"
  | "marketing"
  | "cierre";

interface Automation {
  id: string;
  title: string;
  trigger: string;
  action: string;
  category: AutoCategory;
  icon: React.ElementType;
  tone: "emerald" | "yellow" | "blue" | "violet" | "red";
  active: boolean;
  executions: number;
  impactEuros: number;
  conditions: string[];
  template: string;
  history: AutomationExecution[];
  errors: number;
  retries: number;
}

interface AutomationExecution {
  id: string;
  ts: string; // ISO time
  status: "success" | "failed" | "pending";
  durationMs: number;
  detail: string;
}

/* =========================================================
 * Static data
 * =======================================================*/
const TONE_CLS: Record<
  Automation["tone"],
  { text: string; border: string; bg: string; chip: string }
> = {
  emerald: {
    text: "text-[var(--rp-emerald-soft)]",
    border: "border-[var(--rp-emerald)]/40",
    bg: "bg-[var(--rp-emerald)]/10",
    chip: "border-[var(--rp-emerald)]/30 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]",
  },
  yellow: {
    text: "text-[var(--rp-yellow-soft)]",
    border: "border-[var(--rp-yellow)]/40",
    bg: "bg-[var(--rp-yellow)]/10",
    chip: "border-[var(--rp-yellow)]/30 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow-soft)]",
  },
  blue: {
    text: "text-[var(--rp-blue-soft)]",
    border: "border-[var(--rp-blue)]/40",
    bg: "bg-[var(--rp-blue)]/10",
    chip: "border-[var(--rp-blue)]/30 bg-[var(--rp-blue)]/10 text-[var(--rp-blue-soft)]",
  },
  violet: {
    text: "text-[var(--rp-violet-soft)]",
    border: "border-[var(--rp-violet)]/40",
    bg: "bg-[var(--rp-violet)]/10",
    chip: "border-[var(--rp-violet)]/30 bg-[var(--rp-violet)]/10 text-[var(--rp-violet-soft)]",
  },
  red: {
    text: "text-[var(--rp-red-soft)]",
    border: "border-[var(--rp-red)]/40",
    bg: "bg-[var(--rp-red)]/10",
    chip: "border-[var(--rp-red)]/30 bg-[var(--rp-red)]/10 text-[var(--rp-red-soft)]",
  },
};

const CATEGORY_META: Record<AutoCategory, { label: string; tone: string }> = {
  reservas:     { label: "Reservas",     tone: "text-[var(--rp-emerald-soft)]" },
  crm:          { label: "CRM",          tone: "text-[var(--rp-blue-soft)]" },
  fidelizacion: { label: "Fidelización", tone: "text-[var(--rp-violet-soft)]" },
  inventario:   { label: "Inventario",   tone: "text-[var(--rp-yellow-soft)]" },
  operativa:    { label: "Operativa",    tone: "text-[var(--rp-emerald-soft)]" },
  personal:     { label: "Personal",     tone: "text-[var(--rp-blue-soft)]" },
  pagos:        { label: "Pagos",        tone: "text-[var(--rp-yellow-soft)]" },
  reputacion:   { label: "Reputación",   tone: "text-[var(--rp-red-soft)]" },
  marketing:    { label: "Marketing",    tone: "text-[var(--rp-violet-soft)]" },
  cierre:       { label: "Cierre",       tone: "text-[var(--rp-emerald-soft)]" },
};

const AUTOMATIONS_INIT: Automation[] = [
  {
    id: "a01",
    title: "Reserva creada",
    trigger: "Nueva reserva en cualquier canal",
    action: "Enviar confirmación automática por email y WhatsApp",
    category: "reservas",
    icon: CalendarPlus,
    tone: "emerald",
    active: true,
    executions: 312,
    impactEuros: 0,
    conditions: ["Reserva con estado «pendiente»", "Cliente con email o teléfono", "Canal ≠ walk-in"],
    template: "Hola {nombre}, tu reserva para {pax} el {fecha} a las {hora} está confirmada. Mesa {mesa}.",
    history: [
      { id: "h1", ts: "13:42", status: "success", durationMs: 412, detail: "Reserva #4821 · Elena Vidal" },
      { id: "h2", ts: "13:18", status: "success", durationMs: 388, detail: "Reserva #4820 · Marc Puig" },
      { id: "h3", ts: "12:55", status: "success", durationMs: 401, detail: "Reserva #4819 · Sofía Ruiz" },
    ],
    errors: 0,
    retries: 0,
  },
  {
    id: "a02",
    title: "Reserva próxima",
    trigger: "Reserva confirmada T-24h",
    action: "Recordatorio automático al cliente",
    category: "reservas",
    icon: BellRing,
    tone: "yellow",
    active: true,
    executions: 187,
    impactEuros: 0,
    conditions: ["Reserva confirmada", "Faltan 24h ± 30min", "Cliente no ha cancelado"],
    template: "Te recordamos tu reserva mañana a las {hora}. Responde «Sí» para confirmar o «Cancelar».",
    history: [
      { id: "h1", ts: "11:00", status: "success", durationMs: 290, detail: "Recordatorio a 14 clientes" },
      { id: "h2", ts: "10:00", status: "success", durationMs: 312, detail: "Recordatorio a 9 clientes" },
    ],
    errors: 1,
    retries: 1,
  },
  {
    id: "a03",
    title: "Reserva cancelada",
    trigger: "Reserva cancelada con waitlist activa",
    action: "Avisar a la lista de espera por orden",
    category: "reservas",
    icon: UserX,
    tone: "red",
    active: true,
    executions: 42,
    impactEuros: 1240,
    conditions: ["Reserva cancelada", "Hay clientes en waitlist para esa franja", "Capacidad libre"],
    template: "¡Se ha liberado una mesa para {fecha} {hora}! Reserva ahora: {link}",
    history: [
      { id: "h1", ts: "21:14", status: "success", durationMs: 510, detail: "Aviso a 3 en espera · 1 aceptó" },
      { id: "h2", ts: "20:32", status: "success", durationMs: 480, detail: "Aviso a 2 en espera · 1 aceptó" },
    ],
    errors: 0,
    retries: 0,
  },
  {
    id: "a04",
    title: "No-show",
    trigger: "Cliente no llega 15 min después de la hora",
    action: "Marcar riesgo del cliente y registrar cargo",
    category: "reservas",
    icon: AlertTriangle,
    tone: "red",
    active: true,
    executions: 18,
    impactEuros: 540,
    conditions: ["Reserva en estado «confirmada»", "Hora actual > hora + 15min", "Garantía = tarjeta o prepago"],
    template: "Cliente marcado como no-show. Cargo de {cargo} aplicado según política.",
    history: [
      { id: "h1", ts: "21:45", status: "success", durationMs: 220, detail: "Cliente Carla Vives · cargo 10€" },
      { id: "h2", ts: "20:15", status: "success", durationMs: 198, detail: "Cliente Jordi Soler · aviso (sin cargo)" },
    ],
    errors: 0,
    retries: 0,
  },
  {
    id: "a05",
    title: "Cliente satisfecho",
    trigger: "Ticket cerrado con valoración ≥ 4★",
    action: "Solicitar reseña en Google",
    category: "reputacion",
    icon: Star,
    tone: "yellow",
    active: true,
    executions: 142,
    impactEuros: 340,
    conditions: ["Ticket cerrado", "Cliente con email", "Sin reseña previa en 30 días"],
    template: "¡Gracias por tu visita! ¿Nos dejas una reseña? {link_google} ⭐",
    history: [
      { id: "h1", ts: "16:20", status: "success", durationMs: 305, detail: "Solicitud a 8 clientes" },
      { id: "h2", ts: "15:45", status: "success", durationMs: 282, detail: "Solicitud a 5 clientes" },
    ],
    errors: 0,
    retries: 0,
  },
  {
    id: "a06",
    title: "Cliente inactivo 30 días",
    trigger: "Sin visitas en 30 días",
    action: "Campaña de reactivación por email",
    category: "marketing",
    icon: RefreshCw,
    tone: "violet",
    active: true,
    executions: 56,
    impactEuros: 890,
    conditions: ["Cliente sin visita 30 días", "Opt-in marketing", "Sin campaña previa en 60 días"],
    template: "Te echamos de menos, {nombre}. Vuelve y llévate un {recompensa}.",
    history: [
      { id: "h1", ts: "10:00", status: "success", durationMs: 1240, detail: "Email a 56 clientes" },
    ],
    errors: 2,
    retries: 1,
  },
  {
    id: "a07",
    title: "Cumpleaños",
    trigger: "Cumpleaños del cliente en 7 días",
    action: "Recompensa automática de cumpleaños",
    category: "fidelizacion",
    icon: Gift,
    tone: "violet",
    active: true,
    executions: 23,
    impactEuros: 460,
    conditions: ["Cliente con fecha de cumpleaños", "Opt-in marketing", "Sin recompensa previa este año"],
    template: "¡Feliz cumpleaños, {nombre}! 🎂 Tienes un postre gratis reservado para ti.",
    history: [
      { id: "h1", ts: "09:00", status: "success", durationMs: 410, detail: "Recompensa a 3 clientes" },
    ],
    errors: 0,
    retries: 0,
  },
  {
    id: "a08",
    title: "Sello conseguido",
    trigger: "Cliente a 1 sello del premio",
    action: "Notificación «te falta 1 sello»",
    category: "fidelizacion",
    icon: Award,
    tone: "yellow",
    active: true,
    executions: 89,
    impactEuros: 720,
    conditions: ["Cliente con programa sellos activo", "Sellos actuales = total - 1", "Sin notificación previa esta semana"],
    template: "¡Ya casi! Te falta 1 sello para tu recompensa. 🎁",
    history: [
      { id: "h1", ts: "17:30", status: "success", durationMs: 198, detail: "Notificación a 6 clientes" },
    ],
    errors: 0,
    retries: 0,
  },
  {
    id: "a09",
    title: "Producto agotado",
    trigger: "Stock de producto llega a 0",
    action: "Ocultar de todos los canales automáticamente",
    category: "inventario",
    icon: PackageX,
    tone: "red",
    active: true,
    executions: 14,
    impactEuros: 0,
    conditions: ["Stock actual = 0", "Producto vendible en ≥1 canal", "Sin reaprovisionamiento programado"],
    template: "Producto «{producto}» ocultado en TPV, PDA, KDS, carta QR, web y agregadores.",
    history: [
      { id: "h1", ts: "19:45", status: "success", durationMs: 320, detail: "Gambón rojo ocultado en 9 canales" },
      { id: "h2", ts: "14:12", status: "success", durationMs: 280, detail: "Solomillo ocultado en 9 canales" },
    ],
    errors: 0,
    retries: 0,
  },
  {
    id: "a10",
    title: "Stock bajo",
    trigger: "Stock por debajo del mínimo",
    action: "Aviso al gerente por push y email",
    category: "inventario",
    icon: Boxes,
    tone: "yellow",
    active: true,
    executions: 38,
    impactEuros: 0,
    conditions: ["Stock actual < mínimo", "Producto con seguimiento activo"],
    template: "Stock bajo: {producto} ({stock} {unidad}). Mínimo: {minimo}.",
    history: [
      { id: "h1", ts: "11:30", status: "success", durationMs: 180, detail: "Aviso: Albahaca, Harina, Mantequilla" },
    ],
    errors: 0,
    retries: 0,
  },
  {
    id: "a11",
    title: "Ticket pagado",
    trigger: "Ticket cerrado y cobrado",
    action: "Añadir sello de fidelización al cliente",
    category: "fidelizacion",
    icon: CreditCard,
    tone: "violet",
    active: true,
    executions: 286,
    impactEuros: 0,
    conditions: ["Ticket cobrado", "Cliente identificado", "Programa sellos activo"],
    template: "Has ganado 1 sello. Llevas {n} de {total}.",
    history: [
      { id: "h1", ts: "16:40", status: "success", durationMs: 95, detail: "Sellos a 12 clientes" },
    ],
    errors: 0,
    retries: 0,
  },
  {
    id: "a12",
    title: "Pedido listo",
    trigger: "KDS marca pedido como listo",
    action: "Avisar al cliente por WhatsApp",
    category: "operativa",
    icon: MessageCircle,
    tone: "emerald",
    active: true,
    executions: 124,
    impactEuros: 0,
    conditions: ["Pedido con estado «listo»", "Canal = delivery o takeaway", "Cliente con WhatsApp"],
    template: "Tu pedido está listo. {accion_recogida_o_seguimiento}",
    history: [
      { id: "h1", ts: "14:25", status: "success", durationMs: 410, detail: "WhatsApp a 8 clientes" },
    ],
    errors: 1,
    retries: 0,
  },
  {
    id: "a13",
    title: "Delivery en ruta",
    trigger: "Repartidor marca pedido «en ruta»",
    action: "Enviar seguimiento con link en vivo",
    category: "operativa",
    icon: Truck,
    tone: "blue",
    active: true,
    executions: 67,
    impactEuros: 0,
    conditions: ["Pedido delivery propio", "Repartidor asignado", "Estado = en ruta"],
    template: "Tu repartidor {nombre} está en ruta. Sigue tu pedido: {link}",
    history: [
      { id: "h1", ts: "13:50", status: "success", durationMs: 380, detail: "Link enviado a 6 clientes" },
    ],
    errors: 0,
    retries: 0,
  },
  {
    id: "a14",
    title: "Incidencia de cocina",
    trigger: "KDS registra incidencia (retraso/rotura)",
    action: "Avisar al encargado por push",
    category: "operativa",
    icon: ChefHat,
    tone: "red",
    active: true,
    executions: 9,
    impactEuros: 0,
    conditions: ["Incidencia en KDS", "Severidad > baja"],
    template: "Incidencia cocina: {tipo} en pedido #{id}. Cliente: {cliente}.",
    history: [
      { id: "h1", ts: "21:10", status: "success", durationMs: 120, detail: "Retraso pedido #4825" },
    ],
    errors: 0,
    retries: 0,
  },
  {
    id: "a15",
    title: "Turno publicado",
    trigger: "Cuadrante semanal publicado",
    action: "Avisar al equipo por app y email",
    category: "personal",
    icon: CalendarDays,
    tone: "blue",
    active: true,
    executions: 4,
    impactEuros: 0,
    conditions: ["Cuadrante publicado", "Empleados con app activa"],
    template: "Tu cuadrante de la semana ya está disponible. Revisa tus turnos: {link}",
    history: [
      { id: "h1", ts: "Lun 10:00", status: "success", durationMs: 540, detail: "Aviso a 12 empleados" },
    ],
    errors: 0,
    retries: 0,
  },
  {
    id: "a16",
    title: "Fichaje olvidado",
    trigger: "Empleado sin fichar a las 11:00",
    action: "Crear incidencia y avisar al encargado",
    category: "personal",
    icon: Clock,
    tone: "yellow",
    active: true,
    executions: 11,
    impactEuros: 0,
    conditions: ["Empleado con turno mañana", "Sin fichaje de entrada", "Hora actual ≥ 11:00"],
    template: "Incidencia: {empleado} no ha fichado. Turno {turno} a las {hora}.",
    history: [
      { id: "h1", ts: "11:00", status: "success", durationMs: 220, detail: "Incidencia creada" },
    ],
    errors: 0,
    retries: 0,
  },
  {
    id: "a17",
    title: "Pago fallido",
    trigger: "Cargo de tarjeta rechazado",
    action: "Reintentar (3 intentos) y notificar",
    category: "pagos",
    icon: AlertCircle,
    tone: "red",
    active: false,
    executions: 6,
    impactEuros: 180,
    conditions: ["Cargo rechazado", "Intento < 3", "Cliente con tarjeta válida"],
    template: "No pudimos cobrar tu reserva. Reintenta: {link}",
    history: [
      { id: "h1", ts: "20:30", status: "failed", durationMs: 980, detail: "Cargo rechazado · 3 reintentos" },
    ],
    errors: 3,
    retries: 3,
  },
  {
    id: "a18",
    title: "Review negativa",
    trigger: "Reseña ≤ 2★ en cualquier plataforma",
    action: "Alertar al gerente inmediatamente",
    category: "reputacion",
    icon: AlertTriangle,
    tone: "red",
    active: true,
    executions: 7,
    impactEuros: 0,
    conditions: ["Reseña publicada", "Valoración ≤ 2★", "Últimas 24h"],
    template: "🚨 Reseña negativa: {plataforma} · {valoracion}★. Cliente: {cliente}. Responde cuanto antes.",
    history: [
      { id: "h1", ts: "18:20", status: "success", durationMs: 150, detail: "Alerta push al gerente" },
    ],
    errors: 0,
    retries: 0,
  },
  {
    id: "a19",
    title: "Horas valle",
    trigger: "Predicción de ocupación < 30%",
    action: "Sugerir campaña de relleno",
    category: "marketing",
    icon: TrendingDown,
    tone: "yellow",
    active: false,
    executions: 12,
    impactEuros: 320,
    conditions: ["Predicción IA < 30% ocupación", "Franja de horas valle", "Sin campaña activa"],
    template: "Sugerencia: lanza campaña «-20% en menú mediodía» para {fecha}.",
    history: [
      { id: "h1", ts: "10:00", status: "success", durationMs: 620, detail: "Sugerencia para 3 franjas" },
    ],
    errors: 0,
    retries: 0,
  },
  {
    id: "a20",
    title: "Cierre diario",
    trigger: "Cierre de caja a las 00:30",
    action: "Generar resumen IA automático",
    category: "cierre",
    icon: Moon,
    tone: "violet",
    active: true,
    executions: 30,
    impactEuros: 0,
    conditions: ["Caja cerrada", "Todos los tickets cuadrados", "Hora ≥ 00:00"],
    template: "Resumen del día: {ventas}€ · {tickets} tickets · ticket medio {tm}€ · occupancy {occ}%. Top: {top}. Mejoras sugeridas: {ai}.",
    history: [
      { id: "h1", ts: "00:30", status: "success", durationMs: 1240, detail: "Resumen generado y enviado" },
    ],
    errors: 0,
    retries: 0,
  },
];

/* =========================================================
 * Helpers
 * =========================================================*/


function euro(n: number): string {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

/* =========================================================
 * Main view
 * =======================================================*/
export function PreinstalledAutomationsView() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [automations, setAutomations] = React.useState<Automation[]>(AUTOMATIONS_INIT);
  const [detail, setDetail] = React.useState<Automation | null>(null);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<"todas" | "activas" | "pausadas">("todas");
  const [catFilter, setCatFilter] = React.useState<AutoCategory | "todas">("todas");

  function toggle(id: string, value: boolean) {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: value } : a))
    );
    const a = automations.find((x) => x.id === id);
    toast({
      title: `${a?.title ?? "Automatización"} ${value ? "activada" : "pausada"}`,
      description: value
        ? "Se ejecutará cuando se cumplan las condiciones."
        : "No se ejecutará hasta que la reactives.",
    });
  }

  function openDetail(a: Automation) {
    // Always pull fresh from state
    const fresh = automations.find((x) => x.id === a.id) ?? a;
    setDetail(fresh);
  }

  const activeCount = automations.filter((a) => a.active).length;
  const pausedCount = automations.length - activeCount;
  const totalExec = automations.reduce((s, a) => s + a.executions, 0);
  const totalErrors = automations.reduce((s, a) => s + a.errors, 0);
  const successRate = totalExec > 0 ? ((totalExec - totalErrors) / totalExec) * 100 : 0;
  const totalImpact = automations.reduce((s, a) => s + a.impactEuros, 0);

  const filtered = automations.filter((a) => {
    if (filter === "activas" && !a.active) return false;
    if (filter === "pausadas" && a.active) return false;
    if (catFilter !== "todas" && a.category !== catFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!a.title.toLowerCase().includes(q) && !a.trigger.toLowerCase().includes(q) && !a.action.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
              Automatizaciones
            </h1>
            
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            20 automatizaciones preinstaladas, listas para activar. Cada una se
            ejecuta cuando se cumplen sus condiciones. Métricas de impacto e
            historial completo.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)] text-[10px] uppercase tracking-[0.15em]">
            <Sparkles className="h-3 w-3 mr-1.5" />
            20 preinstaladas
          </Badge>
        </div>
      </header>

      {/* Metrics panel */}
      <MetricsPanel
        activeCount={activeCount}
        pausedCount={pausedCount}
        totalExec={totalExec}
        successRate={successRate}
        totalImpact={totalImpact}
      />

      {/* Filters */}
      <div className="rp-glass rounded-2xl p-3 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[180px] flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 min-h-11 bg-input/30">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, disparador o acción…"
              aria-label="Buscar automatizaciones"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground min-w-0"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Limpiar búsqueda"
                className="text-muted-foreground hover:text-foreground -mr-1 p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* State filter */}
          <div className="flex items-center rounded-md border border-border/60 p-0.5 bg-input/20" role="radiogroup" aria-label="Estado">
            {([
              { id: "todas",    label: "Todas" },
              { id: "activas",   label: "Activas" },
              { id: "pausadas",  label: "Pausadas" },
            ] as const).map((s) => (
              <button
                key={s.id}
                role="radio"
                aria-checked={filter === s.id}
                onClick={() => setFilter(s.id)}
                className={cn(
                  "min-h-9 rounded px-3 py-1 text-xs transition-colors",
                  filter === s.id
                    ? "bg-[var(--rp-emerald)] text-black font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto rp-scroll-thin pb-1">
          <button
            onClick={() => setCatFilter("todas")}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-mono whitespace-nowrap border transition-colors",
              catFilter === "todas"
                ? "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]"
                : "border-border/60 text-muted-foreground hover:text-foreground"
            )}
          >
            <Filter className="h-3 w-3 inline-block mr-1 -mt-0.5" />
            Todas
          </button>
          {(Object.keys(CATEGORY_META) as AutoCategory[]).map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-mono whitespace-nowrap border transition-colors",
                catFilter === c
                  ? "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]"
                  : "border-border/60 text-muted-foreground hover:text-foreground"
              )}
            >
              {CATEGORY_META[c].label}
            </button>
          ))}
        </div>
      </div>

      {/* Automation grid */}
      {filtered.length === 0 ? (
        <div className="rp-glass rounded-2xl p-12 text-center text-muted-foreground">
          <Search className="h-6 w-6 opacity-40 mx-auto mb-2" />
          No hay automatizaciones con estos filtros.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <AnimatePresence>
            {filtered.map((a, idx) => (
              <motion.div
                key={a.id}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, delay: Math.min(idx, 8) * 0.02 }}
              >
                <AutomationCard
                  a={a}
                  onToggle={(v) => toggle(a.id, v)}
                  onOpen={() => openDetail(a)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Detail dialog/sheet */}
      <DetailDialog
        automation={detail}
        onClose={() => setDetail(null)}
        onToggle={(v) => {
          if (detail) {
            toggle(detail.id, v);
            setDetail((prev) => (prev ? { ...prev, active: v } : prev));
          }
        }}
      />
    </div>
  );
}

/* =========================================================
 * Metrics panel
 * =======================================================*/
function MetricsPanel({
  activeCount,
  pausedCount,
  totalExec,
  successRate,
  totalImpact,
}: {
  activeCount: number;
  pausedCount: number;
  totalExec: number;
  successRate: number;
  totalImpact: number;
}) {
  return (
    <div className="rp-glass rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-4 w-4 text-[var(--rp-emerald-soft)]" />
        <h2 className="font-display text-lg tracking-tight">Métricas del mes</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Metric
          label="Activas"
          value={String(activeCount)}
          tone="emerald"
          icon={Zap}
        />
        <Metric
          label="Pausadas"
          value={String(pausedCount)}
          tone="yellow"
          icon={Clock}
        />
        <Metric
          label="Ejecuciones"
          value={totalExec.toLocaleString("es-ES")}
          tone="blue"
          icon={History}
        />
        <Metric
          label="% éxito"
          value={`${successRate.toFixed(0)}%`}
          tone="emerald"
          icon={CheckCircle2}
        />
        <Metric
          label="Impacto estimado"
          value={euro(totalImpact)}
          tone="violet"
          icon={Target}
        />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  tone: "emerald" | "yellow" | "blue" | "violet" | "red";
  icon: React.ElementType;
}) {
  const toneCls =
    tone === "emerald" ? "text-[var(--rp-emerald-soft)]" :
    tone === "yellow"  ? "text-[var(--rp-yellow-soft)]" :
    tone === "blue"    ? "text-[var(--rp-blue-soft)]" :
    tone === "violet"  ? "text-[var(--rp-violet-soft)]" :
    "text-[var(--rp-red-soft)]";
  return (
    <div className="rounded-xl border border-border/40 bg-foreground/[0.02] p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={cn("h-3.5 w-3.5", toneCls)} />
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div className={cn("font-display text-xl sm:text-2xl font-medium tabular-nums leading-tight", toneCls)}>
        {value}
      </div>
    </div>
  );
}

/* =========================================================
 * Automation card
 * =========================================================*/
function AutomationCard({
  a,
  onToggle,
  onOpen,
}: {
  a: Automation;
  onToggle: (v: boolean) => void;
  onOpen: () => void;
}) {
  const tone = TONE_CLS[a.tone];
  const Icon = a.icon;
  const catMeta = CATEGORY_META[a.category];

  return (
    <div
      className={cn(
        "rp-glass rounded-2xl p-4 border flex flex-col gap-3 h-full transition-colors",
        a.active ? tone.border : "border-border/40 opacity-80"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn("h-10 w-10 rounded-lg bg-foreground/[0.04] flex items-center justify-center shrink-0", tone.text)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono text-muted-foreground tabular-nums">#{a.id}</span>
              <span className={cn("text-[10px] font-mono uppercase tracking-wider", catMeta.tone)}>
                {catMeta.label}
              </span>
            </div>
            <div className="font-medium text-sm leading-tight truncate">{a.title}</div>
          </div>
        </div>
        <Switch checked={a.active} onCheckedChange={onToggle} aria-label={`Activar ${a.title}`} />
      </div>

      {/* Trigger + Action */}
      <div className="space-y-1.5">
        <div className="text-[11px]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Cuando</span>
          <span className="ml-1.5 text-foreground">{a.trigger}</span>
        </div>
        <div className="text-[11px]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Entonces</span>
          <span className="ml-1.5 text-muted-foreground">{a.action}</span>
        </div>
      </div>

      {/* Impact */}
      <div className="grid grid-cols-2 gap-2 mt-auto">
        <div className="rounded-md bg-foreground/[0.03] border border-border/40 p-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Ejecuciones
          </div>
          <div className="text-sm font-display font-medium tabular-nums">
            {a.executions}
          </div>
        </div>
        <div className="rounded-md bg-foreground/[0.03] border border-border/40 p-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Impacto
          </div>
          <div className={cn("text-sm font-display font-medium tabular-nums", a.impactEuros > 0 ? tone.text : "text-muted-foreground")}>
            {a.impactEuros > 0 ? `+${euro(a.impactEuros)}` : "—"}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", a.active ? tone.chip : "border-border/60 text-muted-foreground")}>
          {a.active ? (
            <>
              <span className={cn("h-1.5 w-1.5 rounded-full mr-1", tone.bg)} />
              Activa
            </>
          ) : (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 mr-1" />
              Pausada
            </>
          )}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
          onClick={onOpen}
        >
          <History className="h-3.5 w-3.5" /> Ver historial
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

/* =========================================================
 * Detail dialog (with conditions, template, history, audit)
 * =========================================================*/
function DetailDialog({
  automation,
  onClose,
  onToggle,
}: {
  automation: Automation | null;
  onClose: () => void;
  onToggle: (v: boolean) => void;
}) {
  const isMobile = useIsMobile();
  if (!automation) return null;

  const tone = TONE_CLS[automation.tone];
  const Icon = automation.icon;
  const catMeta = CATEGORY_META[automation.category];

  const content = (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn("h-11 w-11 rounded-lg bg-foreground/[0.04] flex items-center justify-center shrink-0", tone.text)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono text-muted-foreground tabular-nums">#{automation.id}</span>
              <span className={cn("text-[10px] font-mono uppercase tracking-wider", catMeta.tone)}>
                {catMeta.label}
              </span>
            </div>
            <h3 className="font-display text-lg tracking-tight truncate">{automation.title}</h3>
          </div>
        </div>
        <Switch checked={automation.active} onCheckedChange={onToggle} aria-label={`Activar ${automation.title}`} />
      </div>

      {/* Trigger + Action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="rounded-md border border-border/40 bg-foreground/[0.02] p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
            Disparador
          </div>
          <div className="text-sm">{automation.trigger}</div>
        </div>
        <div className="rounded-md border border-border/40 bg-foreground/[0.02] p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
            Acción
          </div>
          <div className="text-sm text-muted-foreground">{automation.action}</div>
        </div>
      </div>

      {/* Conditions */}
      <section>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3" />
          Condiciones
        </div>
        <ul className="space-y-1.5">
          {automation.conditions.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--rp-emerald-soft)] mt-0.5 shrink-0" />
              <span className="text-muted-foreground">{c}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Template */}
      <section>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
          <FileText className="h-3 w-3" />
          Plantilla
        </div>
        <div className="rounded-md border border-border/40 bg-foreground/[0.03] p-3 text-sm font-mono text-muted-foreground">
          {automation.template}
        </div>
      </section>

      {/* History */}
      <section>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <History className="h-3 w-3" />
            Historial (últimas {automation.history.length} ejecuciones)
          </span>
          <span className="tabular-nums">{automation.history.length}</span>
        </div>
        <ul className="space-y-1.5">
          {automation.history.length === 0 && (
            <li className="text-xs text-muted-foreground italic">Sin ejecuciones todavía.</li>
          )}
          {automation.history.map((h) => {
            const statusMeta = {
              success: { icon: CheckCircle2, cls: "text-[var(--rp-emerald-soft)]" },
              failed:  { icon: XCircle,       cls: "text-[var(--rp-red-soft)]" },
              pending: { icon: Timer,         cls: "text-[var(--rp-yellow-soft)]" },
            }[h.status];
            const StatusIcon = statusMeta.icon;
            return (
              <li
                key={h.id}
                className="flex items-center gap-2 rounded-md border border-border/40 bg-foreground/[0.02] px-3 py-2 text-xs"
              >
                <StatusIcon className={cn("h-3.5 w-3.5 shrink-0", statusMeta.cls)} />
                <span className="font-mono text-muted-foreground tabular-nums w-16 shrink-0">{h.ts}</span>
                <span className="flex-1 min-w-0 truncate">{h.detail}</span>
                <span className="font-mono text-muted-foreground tabular-nums">{h.durationMs}ms</span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Audit */}
      <section>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
          <Brain className="h-3 w-3" />
          Auditoría
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <AuditCell label="Ejecuciones" value={String(automation.executions)} />
          <AuditCell label="Errores" value={String(automation.errors)} tone={automation.errors > 0 ? "red" : "muted"} />
          <AuditCell label="Reintentos" value={String(automation.retries)} tone={automation.retries > 0 ? "yellow" : "muted"} />
          <AuditCell
            label="% éxito"
            value={`${automation.executions > 0 ? (((automation.executions - automation.errors) / automation.executions) * 100).toFixed(0) : 0}%`}
            tone="emerald"
          />
        </div>
      </section>

      <Separator />
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <Mail className="h-3 w-3" />
        Notificaciones al gerente en cada error o reintento.
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={!!automation} onOpenChange={(o) => !o && onClose()}>
        <SheetContent side="bottom" className="rp-glass-strong max-h-[92vh] overflow-y-auto rp-scroll-thin">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-[var(--rp-emerald-soft)]" />
              Detalle de automatización
            </SheetTitle>
            <SheetDescription>
              Condiciones, plantilla, historial y auditoría.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6 space-y-5">
            {content}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="min-h-11 flex-1" onClick={onClose}>
                Cerrar
              </Button>
              <Button
                className={cn(
                  "min-h-11 flex-1",
                  automation.active
                    ? "border border-[var(--rp-red)]/40 bg-[var(--rp-red)]/10 text-[var(--rp-red-soft)] hover:bg-[var(--rp-red)]/15"
                    : "bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
                )}
                onClick={() => onToggle(!automation.active)}
              >
                {automation.active ? "Pausar" : "Activar"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={!!automation} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-[var(--rp-emerald-soft)]" />
            Detalle de automatización
          </DialogTitle>
          <DialogDescription>
            Condiciones, plantilla, historial y auditoría.
          </DialogDescription>
        </DialogHeader>
        {content}
        <DialogFooter>
          <Button variant="outline" className="min-h-11" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            className={cn(
              "min-h-11",
              automation.active
                ? "bg-[var(--rp-red)]/10 text-[var(--rp-red-soft)] border border-[var(--rp-red)]/40 hover:bg-[var(--rp-red)]/15"
                : "bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
            )}
            onClick={() => onToggle(!automation.active)}
          >
            {automation.active ? (
              <>
                <Clock className="h-4 w-4" /> Pausar
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" /> Activar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AuditCell({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: string;
  tone?: "emerald" | "yellow" | "red" | "muted";
}) {
  const toneCls =
    tone === "emerald" ? "text-[var(--rp-emerald-soft)]" :
    tone === "yellow"  ? "text-[var(--rp-yellow-soft)]" :
    tone === "red"     ? "text-[var(--rp-red-soft)]" :
    "text-muted-foreground";
  return (
    <div className="rounded-md border border-border/40 bg-foreground/[0.02] p-2">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={cn("font-display text-sm font-medium tabular-nums", toneCls)}>
        {value}
      </div>
    </div>
  );
}

/* =========================================================
 * useIsMobile hook
 * =========================================================*/
function useIsMobile() {
  const [m, setM] = React.useState(false);
  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const handler = () => setM(mql.matches);
    handler();
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return m;
}
