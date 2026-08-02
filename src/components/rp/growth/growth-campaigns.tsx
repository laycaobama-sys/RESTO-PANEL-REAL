"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  Megaphone,
  Calendar as CalendarIcon,
  Workflow,
  FileText,
  Plus,
  Play,
  Save,
  Copy,
  Trash2,
  Pause,
  ChevronRight,
  ChevronLeft,
  Mail,
  MessageSquare,
  Smartphone,
  Bell,
  Users,
  Target,
  DollarSign,
  Sparkles,
  Zap,
  Clock,
  GitBranch,
  Gift,
  Cake,
  RefreshCw,
  Send,
  Check,
  X,
  Eye,
  Tag,
  ArrowRight,
  Crown,
  PartyPopper,
  Heart,
  ShoppingBag,
  UtensilsCrossed,
  Star,
  Filter,
  Share2,
  TrendingUp,
} from "lucide-react";

/* =====================================================================
 * Types
 * ===================================================================== */

type CampaignStatus = "activa" | "programada" | "completada" | "borrador";
type Channel = "Email" | "WhatsApp" | "SMS" | "Push" | "Multi";

interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  channel: Channel;
  segment: string;
  audience: number;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;
  cost: number;
  date: string; // ISO yyyy-mm-dd
}

type NodeType = "trigger" | "action" | "wait" | "condition" | "branch";

interface FlowNode {
  id: string;
  type: NodeType;
  subtype: string;
  title: string;
  summary: string;
}

interface Template {
  id: string;
  name: string;
  category: string;
  channel: Channel;
  subject: string;
  preview: string;
  lastUsed: string;
  openRate: number;
  ctr: number;
}

interface AutomationPreset {
  id: string;
  name: string;
  desc: string;
  nodes: number;
  icon: React.ElementType;
}

/* =====================================================================
 * Demo data
 * ===================================================================== */

const CAMPAIGNS: Campaign[] = [
  {
    id: "cm1",
    name: "Black Friday — 2x1 menú",
    status: "activa",
    channel: "Multi",
    segment: "Todos",
    audience: 1248,
    sent: 1248,
    opened: 892,
    clicked: 312,
    converted: 87,
    revenue: 2640,
    cost: 320,
    date: "2025-11-28",
  },
  {
    id: "cm2",
    name: "Cumpleaños Noviembre",
    status: "activa",
    channel: "WhatsApp",
    segment: "Cumpleañeros",
    audience: 142,
    sent: 142,
    opened: 131,
    clicked: 64,
    converted: 38,
    revenue: 1840,
    cost: 28,
    date: "2025-11-12",
  },
  {
    id: "cm3",
    name: "VIP — Vuelve pronto",
    status: "activa",
    channel: "Email",
    segment: "VIP",
    audience: 89,
    sent: 89,
    opened: 71,
    clicked: 28,
    converted: 14,
    revenue: 1340,
    cost: 12,
    date: "2025-11-08",
  },
  {
    id: "cm4",
    name: "Reactivación inactivos 90d",
    status: "activa",
    channel: "Multi",
    segment: "Dormidos",
    audience: 412,
    sent: 408,
    opened: 244,
    clicked: 81,
    converted: 23,
    revenue: 980,
    cost: 120,
    date: "2025-11-20",
  },
  {
    id: "cm5",
    name: "Menú mediodía lunes-jueves",
    status: "programada",
    channel: "SMS",
    segment: "Frecuentes",
    audience: 320,
    sent: 0,
    opened: 0,
    clicked: 0,
    converted: 0,
    revenue: 0,
    cost: 0,
    date: "2025-12-02",
  },
  {
    id: "cm6",
    name: "Navidad — Reserva tu mesa",
    status: "programada",
    channel: "Email",
    segment: "Todos",
    audience: 1248,
    sent: 0,
    opened: 0,
    clicked: 0,
    converted: 0,
    revenue: 0,
    cost: 0,
    date: "2025-12-10",
  },
  {
    id: "cm7",
    name: "San Valentín — Menú pareja",
    status: "completada",
    channel: "Multi",
    segment: "Parejas",
    audience: 280,
    sent: 280,
    opened: 198,
    clicked: 92,
    converted: 41,
    revenue: 1980,
    cost: 80,
    date: "2025-02-08",
  },
  {
    id: "cm8",
    name: "Promo terraza verano",
    status: "borrador",
    channel: "Push",
    segment: "Locales",
    audience: 540,
    sent: 0,
    opened: 0,
    clicked: 0,
    converted: 0,
    revenue: 0,
    cost: 0,
    date: "2025-12-15",
  },
];

const KPI_STRIP = [
  { id: "k1", label: "Activas", value: "4", tone: "gold" as const, icon: Zap },
  { id: "k2", label: "Programadas", value: "2", tone: "teal" as const, icon: Clock },
  { id: "k3", label: "Completadas", value: "18", tone: "default" as const, icon: Check },
  { id: "k4", label: "ROI medio", value: "340%", tone: "gold" as const, icon: TrendingUp },
  { id: "k5", label: "Ingresos", value: "€8.420", tone: "teal" as const, icon: DollarSign },
];

const STATUS_META: Record<CampaignStatus, { label: string; cls: string; dot: string }> = {
  activa: { label: "Activa", cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300", dot: "bg-emerald-400" },
  programada: { label: "Programada", cls: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]", dot: "bg-[var(--teal)]" },
  completada: { label: "Completada", cls: "border-foreground/20 bg-foreground/5 text-muted-foreground", dot: "bg-foreground/40" },
  borrador: { label: "Borrador", cls: "border-amber-400/40 bg-amber-400/10 text-amber-300", dot: "bg-amber-400" },
};

const CHANNEL_META: Record<Channel, { icon: React.ElementType; cls: string }> = {
  Email: { icon: Mail, cls: "border-foreground/20 bg-foreground/5 text-foreground/80" },
  WhatsApp: { icon: MessageSquare, cls: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" },
  SMS: { icon: Smartphone, cls: "border-[var(--teal)]/30 bg-[var(--teal)]/10 text-[var(--teal)]" },
  Push: { icon: Bell, cls: "border-amber-400/30 bg-amber-400/10 text-amber-300" },
  Multi: { icon: Share2, cls: "border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)]" },
};

/* Builder flow — pre-loaded "Recuperación inactivos" example (6 nodes) */
const FLOW_NODES: FlowNode[] = [
  { id: "n1", type: "trigger", subtype: "inactividad", title: "Inactividad 90d", summary: "Sin reserva en 90 días" },
  { id: "n2", type: "wait", subtype: "horas", title: "Esperar 2 horas", summary: "Antes de primer contacto" },
  { id: "n3", type: "condition", subtype: "consentimiento", title: "¿Consentimiento email?", summary: "Verifica RGPD" },
  { id: "n4", type: "action", subtype: "email", title: "Enviar email", summary: "Te echamos de menos (15%)" },
  { id: "n5", type: "wait", subtype: "dias", title: "Esperar 5 días", summary: "Sin apertura → WhatsApp" },
  { id: "n6", type: "action", subtype: "whatsapp", title: "WhatsApp oferta", summary: "Cupón 15% · 48h" },
];

const NODE_TYPE_META: Record<NodeType, { label: string; icon: React.ElementType; color: string; bg: string; border: string; text: string }> = {
  trigger: { label: "Trigger", icon: Zap, color: "var(--gold)", bg: "bg-[var(--gold)]/10", border: "border-[var(--gold)]/40", text: "text-[var(--gold-soft)]" },
  action: { label: "Action", icon: Send, color: "var(--teal)", bg: "bg-[var(--teal)]/10", border: "border-[var(--teal)]/40", text: "text-[var(--teal)]" },
  wait: { label: "Wait", icon: Clock, color: "#a78bfa", bg: "bg-violet-500/10", border: "border-violet-500/40", text: "text-violet-300" },
  condition: { label: "Condition", icon: Filter, color: "#fbbf24", bg: "bg-amber-500/10", border: "border-amber-500/40", text: "text-amber-300" },
  branch: { label: "Branch", icon: GitBranch, color: "#fb7185", bg: "bg-rose-500/10", border: "border-rose-500/40", text: "text-rose-300" },
};

const PALETTE: { type: NodeType; items: { subtype: string; title: string; icon: React.ElementType }[] }[] = [
  {
    type: "trigger",
    items: [
      { subtype: "reserva", title: "Reserva creada", icon: CalendarIcon },
      { subtype: "visita", title: "Visita completada", icon: Check },
      { subtype: "cancelacion", title: "Cancelación", icon: X },
      { subtype: "noshow", title: "No-show", icon: Users },
      { subtype: "cumple", title: "Cumpleaños", icon: Cake },
      { subtype: "inactividad", title: "Inactividad 90d", icon: RefreshCw },
    ],
  },
  {
    type: "action",
    items: [
      { subtype: "email", title: "Enviar email", icon: Mail },
      { subtype: "whatsapp", title: "Enviar WhatsApp", icon: MessageSquare },
      { subtype: "sms", title: "Enviar SMS", icon: Smartphone },
      { subtype: "push", title: "Enviar push", icon: Bell },
      { subtype: "cupon", title: "Crear cupón", icon: Tag },
      { subtype: "puntos", title: "Añadir puntos", icon: Gift },
    ],
  },
  {
    type: "wait",
    items: [
      { subtype: "horas", title: "Esperar horas", icon: Clock },
      { subtype: "dias", title: "Esperar días", icon: Clock },
    ],
  },
  {
    type: "condition",
    items: [
      { subtype: "consentimiento", title: "Consentimiento", icon: Check },
      { subtype: "canal", title: "Canal preferido", icon: MessageSquare },
      { subtype: "ltv", title: "LTV mínimo", icon: DollarSign },
    ],
  },
  {
    type: "branch",
    items: [
      { subtype: "ifelse", title: "If / Else", icon: GitBranch },
    ],
  },
];

const AUTOMATION_PRESETS: AutomationPreset[] = [
  { id: "p1", name: "Recuperación inactivos", desc: "Reactiva clientes +90 días con email + WhatsApp", nodes: 6, icon: RefreshCw },
  { id: "p2", name: "Cumpleaños automático", desc: "Cupón + felicitación 7 días antes", nodes: 4, icon: Cake },
  { id: "p3", name: "Bienvenida nuevo cliente", desc: "Email de bienvenida + puntos regalo", nodes: 3, icon: Sparkles },
  { id: "p4", name: "Post-visita NPS", desc: "Encuesta 2h tras visita, score → acción", nodes: 5, icon: Star },
  { id: "p5", name: "Recordatorio reserva", desc: "Recordatorio 24h antes por WhatsApp", nodes: 2, icon: Bell },
  { id: "p6", name: "No-show follow-up", desc: "Tras no-show: email + cupón disculpa", nodes: 4, icon: Users },
  { id: "p7", name: "Cancelación win-back", desc: "Canceló → oferta exclusiva 48h", nodes: 3, icon: RefreshCw },
  { id: "p8", name: "VIP upgrade", desc: "Cliente frecuente → upgrade a VIP", nodes: 4, icon: Crown },
  { id: "p9", name: "Reseña positiva", desc: "5★ → pide reseña en Google", nodes: 3, icon: Star },
  { id: "p10", name: "Reseña negativa", desc: "≤3★ → escalar a gerente", nodes: 4, icon: RefreshCw },
  { id: "p11", name: "Menú del día", desc: "Push a locales a las 11:00", nodes: 2, icon: UtensilsCrossed },
  { id: "p12", name: "Aniversario cliente", desc: "1 año → cena gratis para 2", nodes: 5, icon: PartyPopper },
];

const TEMPLATES: Template[] = [
  { id: "t1", name: "Bienvenida nuevo socio", category: "Bienvenida", channel: "Email", subject: "¡Bienvenido a la familia!", preview: "Tu cupón de bienvenida te espera", lastUsed: "Hace 2 días", openRate: 72, ctr: 28 },
  { id: "t2", name: "Feliz cumpleaños 🎂", category: "Cumpleaños", channel: "WhatsApp", subject: "¡Feliz cumpleaños!", preview: "Postre gratis en tu visita de hoy", lastUsed: "Hace 5 días", openRate: 92, ctr: 64 },
  { id: "t3", name: "Menú especial Navidad", category: "Navidad", channel: "Email", subject: "Reserva tu mesa de Navidad", preview: "Menú exclusivo hasta 23 dic", lastUsed: "Hace 1 mes", openRate: 58, ctr: 22 },
  { id: "t4", name: "San Valentín — Pareja", category: "San Valentín", channel: "Multi", subject: "Cena para dos este San Valentín", preview: "Menú pareja + copa de cava", lastUsed: "Hace 9 meses", openRate: 71, ctr: 33 },
  { id: "t5", name: "Black Friday 2x1", category: "Black Friday", channel: "Multi", subject: "2x1 solo 48 horas", preview: "Reserva antes del viernes negro", lastUsed: "Hace 3 días", openRate: 68, ctr: 41 },
  { id: "t6", name: "Menú mediodía", category: "Menú especial", channel: "SMS", subject: "Menú del día €14,50", preview: "Lun-Jue hasta las 16h", lastUsed: "Hace 1 semana", openRate: 85, ctr: 38 },
  { id: "t7", name: "Evento cata de vinos", category: "Eventos", channel: "Email", subject: "Cata exclusiva de vinos", preview: "Plazas limitadas · 12 dic", lastUsed: "Hace 2 semanas", openRate: 64, ctr: 31 },
  { id: "t8", name: "Te echamos de menos", category: "Recuperación", channel: "Email", subject: "Hace 90 días que no vienes", preview: "Cupón 15% en tu próxima visita", lastUsed: "Hace 4 días", openRate: 47, ctr: 19 },
  { id: "t9", name: "Sube de nivel VIP", category: "Fidelización", channel: "WhatsApp", subject: "¡Ahora eres VIP!", preview: "Acceso a terraza privada", lastUsed: "Hace 3 semanas", openRate: 88, ctr: 52 },
  { id: "t10", name: "Cuéntanos tu experiencia", category: "Solicitud reseña", channel: "Email", subject: "¿Nos dejas tu reseña?", preview: "Tu opinión vale un postre gratis", lastUsed: "Hace 6 días", openRate: 41, ctr: 24 },
];

const TEMPLATE_CATEGORIES = ["Todas", "Bienvenida", "Cumpleaños", "Navidad", "San Valentín", "Black Friday", "Menú especial", "Eventos", "Recuperación", "Fidelización", "Solicitud reseña"];

/* Calendar data — Nov 2025 (Sat=1) */
const CALENDAR_MONTH = "Noviembre 2025";
const CALENDAR_WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
// Day-of-month cells (35 cells: 0=empty leading, then 1..30, then empty trailing)
const CALENDAR_DAYS: (number | null)[] = [
  null, null, // Sat=1 — but our grid starts Monday, so Nov 1 (Sat) = position 6
  ...Array.from({ length: 30 }, (_, i) => i + 1),
  null, null, null, // trailing
];

/* =====================================================================
 * Helpers
 * ===================================================================== */

function roiColor(roi: number): string {
  if (roi >= 200) return "text-emerald-300";
  if (roi >= 100) return "text-[var(--gold-soft)]";
  return "text-rose-300";
}

function roiOf(c: Campaign): number {
  if (c.cost === 0) return c.revenue > 0 ? 999 : 0;
  return Math.round(((c.revenue - c.cost) / c.cost) * 100);
}

function pct(n: number, d: number): string {
  if (d === 0) return "—";
  return `${((n / d) * 100).toFixed(0)}%`;
}

function fmtEUR(n: number): string {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function campaignsForDay(day: number | null): Campaign[] {
  if (day === null) return [];
  // Demo: map a few days to campaigns
  const iso = `2025-11-${String(day).padStart(2, "0")}`;
  return CAMPAIGNS.filter((c) => c.date === iso);
}

/* =====================================================================
 * Shared atoms
 * ===================================================================== */



function HeaderBar({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-light tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{desc}</p>
      </div>
      
    </div>
  );
}

/* =====================================================================
 * Main component
 * ===================================================================== */

export function GrowthCampaigns() {
  const reduce = useReducedMotion();
  const [tab, setTab] = React.useState("campanas");

  return (
    <div className="space-y-5 overflow-x-hidden">
      <HeaderBar
        title="Campañas & Automatización"
        desc="Builder visual de campañas, calendario editorial, A/B testing y plantillas multicanal."
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-foreground/[0.04] border border-border/60">
          <TabsTrigger value="campanas" className="data-[state=active]:bg-[var(--gold)]/10 data-[state=active]:text-[var(--gold-soft)] min-h-[40px]">
            <Megaphone className="h-4 w-4 mr-1.5" /> Campañas
          </TabsTrigger>
          <TabsTrigger value="calendario" className="data-[state=active]:bg-[var(--gold)]/10 data-[state=active]:text-[var(--gold-soft)] min-h-[40px]">
            <CalendarIcon className="h-4 w-4 mr-1.5" /> Calendario
          </TabsTrigger>
          <TabsTrigger value="builder" className="data-[state=active]:bg-[var(--gold)]/10 data-[state=active]:text-[var(--gold-soft)] min-h-[40px]">
            <Workflow className="h-4 w-4 mr-1.5" /> Builder
          </TabsTrigger>
          <TabsTrigger value="plantillas" className="data-[state=active]:bg-[var(--gold)]/10 data-[state=active]:text-[var(--gold-soft)] min-h-[40px]">
            <FileText className="h-4 w-4 mr-1.5" /> Plantillas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campanas" className="mt-5">
          <CampaignsTab reduce={reduce} />
        </TabsContent>
        <TabsContent value="calendario" className="mt-5">
          <CalendarTab reduce={reduce} />
        </TabsContent>
        <TabsContent value="builder" className="mt-5">
          <BuilderTab reduce={reduce} />
        </TabsContent>
        <TabsContent value="plantillas" className="mt-5">
          <TemplatesTab reduce={reduce} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* =====================================================================
 * Tab 1 — Campañas (table + KPI strip)
 * ===================================================================== */

function CampaignsTab({ reduce }: { reduce: boolean | null }) {
  const [newOpen, setNewOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<Campaign[]>(CAMPAIGNS);

  function onDelete() {
    if (!deleteId) return;
    setItems((prev) => prev.filter((c) => c.id !== deleteId));
    toast({ title: "Campaña eliminada", description: "La campaña se ha eliminado del listado." });
    setDeleteId(null);
  }

  return (
    <div className="space-y-5">
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {KPI_STRIP.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div
              key={k.id}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
              className="rp-glass rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  {k.label}
                </span>
                <Icon
                  className={cn(
                    "h-3.5 w-3.5",
                    k.tone === "gold" && "text-[var(--gold)]",
                    k.tone === "teal" && "text-[var(--teal)]",
                    k.tone === "default" && "text-muted-foreground"
                  )}
                />
              </div>
              <div
                className={cn(
                  "mt-1.5 font-display text-2xl font-light tabular-nums",
                  k.tone === "gold" && "rp-gold-text",
                  k.tone === "teal" && "rp-teal-text",
                  k.tone === "default" && "text-foreground"
                )}
              >
                {k.value}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Table */}
      <div className="rp-glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-border/60">
          <div>
            <h2 className="font-display text-lg">Todas las campañas</h2>
            <p className="text-xs text-muted-foreground">{items.length} campañas · últimos 30 días</p>
          </div>
          <Button
            onClick={() => setNewOpen(true)}
            className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] min-h-[40px]"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Nueva campaña
          </Button>
        </div>

        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border/60">
                <th className="px-4 py-3 font-medium">Campaña</th>
                <th className="px-3 py-3 font-medium">Estado</th>
                <th className="px-3 py-3 font-medium">Canal</th>
                <th className="px-3 py-3 font-medium hidden md:table-cell">Segmento</th>
                <th className="px-3 py-3 font-medium text-right hidden lg:table-cell">Audiencia</th>
                <th className="px-3 py-3 font-medium text-right hidden lg:table-cell">Enviados</th>
                <th className="px-3 py-3 font-medium text-right hidden xl:table-cell">Abiertos</th>
                <th className="px-3 py-3 font-medium text-right hidden xl:table-cell">Clics</th>
                <th className="px-3 py-3 font-medium text-right">Conv.</th>
                <th className="px-3 py-3 font-medium text-right hidden md:table-cell">Ingresos</th>
                <th className="px-3 py-3 font-medium text-right">ROI</th>
                <th className="px-3 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => {
                const sMeta = STATUS_META[c.status];
                const cMeta = CHANNEL_META[c.channel];
                const CIcon = cMeta.icon;
                const roi = roiOf(c);
                return (
                  <tr key={c.id} className="border-b border-border/40 hover:bg-foreground/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{c.name}</div>
                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{c.id.toUpperCase()}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider", sMeta.cls)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", sMeta.dot)} />
                        {sMeta.label}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono", cMeta.cls)}>
                        <CIcon className="h-3 w-3" />
                        {c.channel}
                      </span>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell text-muted-foreground">{c.segment}</td>
                    <td className="px-3 py-3 text-right hidden lg:table-cell tabular-nums">{c.audience.toLocaleString("es-ES")}</td>
                    <td className="px-3 py-3 text-right hidden lg:table-cell tabular-nums">{c.sent.toLocaleString("es-ES")}</td>
                    <td className="px-3 py-3 text-right hidden xl:table-cell tabular-nums">
                      <div>{c.opened.toLocaleString("es-ES")}</div>
                      <div className="text-[10px] text-muted-foreground">{pct(c.opened, c.sent)}</div>
                    </td>
                    <td className="px-3 py-3 text-right hidden xl:table-cell tabular-nums">
                      <div>{c.clicked.toLocaleString("es-ES")}</div>
                      <div className="text-[10px] text-muted-foreground">{pct(c.clicked, c.opened)}</div>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      <div className="font-medium">{c.converted.toLocaleString("es-ES")}</div>
                      <div className="text-[10px] text-[var(--teal)]">{pct(c.converted, c.sent)}</div>
                    </td>
                    <td className="px-3 py-3 text-right hidden md:table-cell font-mono tabular-nums">
                      {c.revenue > 0 ? fmtEUR(c.revenue) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className={cn("px-3 py-3 text-right font-mono tabular-nums font-medium", roiColor(roi))}>
                      {roi >= 999 ? "∞" : `${roi}%`}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconBtn icon={Eye} label="Ver detalle" onClick={() => toast({ title: "Detalle campaña", description: c.name })} />
                        {c.status === "activa" ? (
                          <IconBtn icon={Pause} label="Pausar" tone="amber" onClick={() => toast({ title: "Campaña pausada", description: c.name })} />
                        ) : null}
                        <IconBtn icon={Copy} label="Duplicar" onClick={() => toast({ title: "Campaña duplicada", description: c.name })} />
                        <IconBtn icon={Trash2} label="Eliminar" tone="destructive" onClick={() => setDeleteId(c.id)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <NewCampaignDialog open={newOpen} onOpenChange={setNewOpen} />
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="rp-glass-strong">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar campaña?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La campaña se eliminará permanentemente del listado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-h-[44px]"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function IconBtn({
  icon: Icon,
  label,
  onClick,
  tone = "default",
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  tone?: "default" | "amber" | "destructive";
}) {
  const cls =
    tone === "amber"
      ? "text-amber-300 hover:bg-amber-400/10 border-amber-400/30"
      : tone === "destructive"
      ? "text-rose-300 hover:bg-rose-500/10 border-rose-500/30"
      : "text-muted-foreground hover:bg-foreground/5 border-border/40";
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            aria-label={label}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors",
              cls
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function NewCampaignDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [name, setName] = React.useState("");
  const [channel, setChannel] = React.useState<Channel>("Email");
  function submit() {
    if (!name.trim()) {
      toast({ title: "Falta el nombre", description: "Asigna un nombre a la campaña.", variant: "destructive" });
      return;
    }
    toast({ title: "Campaña creada", description: `${name} (${channel}) · borrador guardado.` });
    setName("");
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rp-glass-strong sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva campaña</DialogTitle>
          <DialogDescription>Crea una campaña en estado borrador. Podrás editarla y programarla después.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label htmlFor="nc-name" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Nombre</label>
            <Input
              id="nc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Menú Navidad 2025"
              className="bg-foreground/[0.04] min-h-[44px]"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Canal</span>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(CHANNEL_META) as Channel[]).map((ch) => {
                const M = CHANNEL_META[ch];
                const I = M.icon;
                const active = channel === ch;
                return (
                  <button
                    key={ch}
                    onClick={() => setChannel(ch)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs transition-colors min-h-[40px]",
                      active ? cn(M.cls, "ring-1 ring-offset-0") : "border-border/40 bg-foreground/[0.03] text-muted-foreground hover:border-foreground/30"
                    )}
                  >
                    <I className="h-3.5 w-3.5" /> {ch}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="min-h-[44px]">Cancelar</Button>
          <Button onClick={submit} className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] min-h-[44px]">
            Crear borrador
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =====================================================================
 * Tab 2 — Calendario
 * ===================================================================== */

function CalendarTab({ reduce }: { reduce: boolean | null }) {
  const [selectedDay, setSelectedDay] = React.useState<number | null>(12);

  const upcoming = CAMPAIGNS.filter((c) => c.status === "programada" || c.status === "activa")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  const selectedCampaigns = campaignsForDay(selectedDay);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
      {/* Calendar */}
      <div className="rp-glass rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg">{CALENDAR_MONTH}</h2>
            <p className="text-xs text-muted-foreground">Campañas programadas y activas</p>
          </div>
          <div className="flex items-center gap-1">
            <button aria-label="Mes anterior" className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-border/40 text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button aria-label="Mes siguiente" className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-border/40 text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {CALENDAR_WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-mono uppercase tracking-wider text-muted-foreground py-1.5">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {CALENDAR_DAYS.map((day, idx) => {
            const dayCampaigns = campaignsForDay(day);
            const isSelected = selectedDay === day;
            const isToday = day === 12;
            return (
              <button
                key={idx}
                onClick={() => day !== null && setSelectedDay(day)}
                disabled={day === null}
                aria-label={day !== null ? `${day} de noviembre — ${dayCampaigns.length} campañas` : "Celda vacía"}
                className={cn(
                  "aspect-square min-h-[44px] sm:min-h-[64px] rounded-md border p-1 sm:p-1.5 text-left transition-colors flex flex-col",
                  day === null
                    ? "border-transparent bg-foreground/[0.015] cursor-default"
                    : isSelected
                    ? "border-[var(--gold)]/60 bg-[var(--gold)]/10"
                    : "border-border/40 bg-foreground/[0.02] hover:border-foreground/30 hover:bg-foreground/[0.04]"
                )}
              >
                {day !== null && (
                  <>
                    <span
                      className={cn(
                        "text-xs font-mono",
                        isToday ? "text-[var(--gold)] font-medium" : "text-muted-foreground"
                      )}
                    >
                      {day}
                    </span>
                    <div className="mt-auto flex flex-wrap gap-0.5">
                      {dayCampaigns.slice(0, 4).map((c) => {
                        const dot = STATUS_META[c.status].dot;
                        return <span key={c.id} className={cn("h-1.5 w-1.5 rounded-full", dot)} />;
                      })}
                      {dayCampaigns.length > 4 && (
                        <span className="text-[8px] font-mono text-muted-foreground">+{dayCampaigns.length - 4}</span>
                      )}
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-border/40">
          {(Object.keys(STATUS_META) as CampaignStatus[]).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <span className={cn("h-2 w-2 rounded-full", STATUS_META[s].dot)} />
              {STATUS_META[s].label}
            </span>
          ))}
        </div>
      </div>

      {/* Side panel: selected day + upcoming + AI suggestion */}
      <div className="space-y-4">
        <div className="rp-glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-base">
              {selectedDay !== null ? `Día ${selectedDay} nov` : "Selecciona un día"}
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {selectedCampaigns.length} campaña(s)
            </span>
          </div>
          {selectedCampaigns.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center">
              No hay campañas este día.
            </div>
          ) : (
            <ul className="space-y-2">
              {selectedCampaigns.map((c) => {
                const M = STATUS_META[c.status];
                return (
                  <li key={c.id} className="rounded-md border border-border/40 bg-foreground/[0.02] p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">{c.name}</span>
                      <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider shrink-0", M.cls)}>
                        <span className={cn("h-1 w-1 rounded-full", M.dot)} />
                        {M.label}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="font-mono">{c.channel}</span>
                      <span>·</span>
                      <span>{c.segment}</span>
                      <span>·</span>
                      <span>{c.audience.toLocaleString("es-ES")} contactos</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* AI suggestion */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl p-4 border border-[var(--teal)]/40 bg-[var(--teal)]/[0.06]"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="h-4 w-4 text-[var(--teal)]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]">IA · mejor momento</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            Mejor momento para enviar: <strong className="text-[var(--teal)]">WhatsApp · martes 11:00</strong>. Histórico de apertura del 85% en esa franja.
          </p>
        </motion.div>

        {/* Upcoming */}
        <div className="rp-glass rounded-2xl p-4">
          <h3 className="font-display text-base mb-3">Próximas campañas (30 días)</h3>
          <ul className="space-y-2 max-h-72 overflow-y-auto rp-scroll-thin pr-1">
            {upcoming.map((c) => {
              const M = STATUS_META[c.status];
              return (
                <li key={c.id} className="flex items-center gap-3 rounded-md border border-border/40 bg-foreground/[0.02] p-2.5">
                  <div className="h-9 w-9 rounded-md bg-foreground/[0.04] flex flex-col items-center justify-center shrink-0">
                    <span className="text-[8px] font-mono uppercase text-muted-foreground leading-none">{c.date.slice(5, 7)}</span>
                    <span className="text-sm font-display leading-none">{c.date.slice(8, 10)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground">{c.channel} · {c.segment}</div>
                  </div>
                  <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider shrink-0", M.cls)}>
                    <span className={cn("h-1 w-1 rounded-full", M.dot)} />
                    {M.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
 * Tab 3 — Builder (visual flow editor)
 * ===================================================================== */

function BuilderTab({ reduce }: { reduce: boolean | null }) {
  const [nodes, setNodes] = React.useState<FlowNode[]>(FLOW_NODES);
  const [selectedId, setSelectedId] = React.useState<string>("n1");
  const [testOpen, setTestOpen] = React.useState(false);
  const [publishOpen, setPublishOpen] = React.useState(false);
  const [abActive, setAbActive] = React.useState(false);
  const [abMetric, setAbMetric] = React.useState("open_rate");
  const [abDist, setAbDist] = React.useState(50);

  const selected = nodes.find((n) => n.id === selectedId);

  function addNode(type: NodeType, subtype: string, title: string) {
    const id = `n${Date.now()}`;
    setNodes((prev) => [...prev, { id, type, subtype, title, summary: "Configurar…" }]);
    setSelectedId(id);
    toast({ title: "Nodo añadido", description: title });
  }

  function deleteNode(id: string) {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) setSelectedId(nodes[0]?.id ?? "");
    toast({ title: "Nodo eliminado" });
  }

  function updateNode(id: string, patch: Partial<FlowNode>) {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  }

  function loadPreset(p: AutomationPreset) {
    setNodes(FLOW_NODES);
    setSelectedId(FLOW_NODES[0].id);
    toast({ title: "Plantilla cargada", description: `${p.name} (${p.nodes} nodos)` });
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="rp-glass rounded-2xl p-3 flex flex-wrap items-center gap-2 sticky top-16 z-20">
        <div className="flex items-center gap-2 mr-auto">
          <Workflow className="h-4 w-4 text-[var(--gold)]" />
          <span className="font-display text-base">Recuperación inactivos</span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground border border-border/40 rounded px-1.5 py-0.5">borrador</span>
        </div>
        <Button variant="outline" onClick={() => toast({ title: "Borrador guardado" })} className="min-h-[40px]">
          <Save className="h-3.5 w-3.5 mr-1.5" /> Guardar
        </Button>
        <Button variant="outline" onClick={() => setTestOpen(true)} className="min-h-[40px]">
          <Play className="h-3.5 w-3.5 mr-1.5" /> Probar
        </Button>
        <Button variant="outline" onClick={() => toast({ title: "Flujo duplicado" })} className="min-h-[40px]">
          <Copy className="h-3.5 w-3.5 mr-1.5" /> Duplicar
        </Button>
        <Button onClick={() => setPublishOpen(true)} className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] min-h-[40px]">
          <Zap className="h-3.5 w-3.5 mr-1.5" /> Publicar
        </Button>
      </div>

      {/* A/B testing strip */}
      <div className="rp-glass rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-[var(--gold)]" />
            <span className="font-display text-sm">Test A/B</span>
            <Switch checked={abActive} onCheckedChange={setAbActive} aria-label="Activar test A/B" />
          </div>
          {abActive && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Variante</span>
                <span className="rounded-md border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-2 py-0.5 text-xs font-mono text-[var(--gold-soft)]">A 50%</span>
                <span className="rounded-md border border-[var(--teal)]/40 bg-[var(--teal)]/10 px-2 py-0.5 text-xs font-mono text-[var(--teal)]">B 50%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Distribución</span>
                <input
                  type="range"
                  min={10}
                  max={90}
                  step={5}
                  value={abDist}
                  onChange={(e) => setAbDist(Number(e.target.value))}
                  className="w-24 accent-[var(--gold)]"
                  aria-label="Distribución A/B"
                />
                <span className="text-xs font-mono tabular-nums">{abDist}/{100 - abDist}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Métrica</span>
                <select
                  value={abMetric}
                  onChange={(e) => setAbMetric(e.target.value)}
                  className="bg-foreground/[0.04] border border-border/40 rounded-md px-2 py-1 text-xs min-h-[36px]"
                  aria-label="Métrica primaria"
                >
                  <option value="open_rate">Tasa de apertura</option>
                  <option value="ctr">CTR</option>
                  <option value="conversion">Conversión</option>
                  <option value="revenue">Ingresos</option>
                </select>
              </div>
              <Button size="sm" className="bg-[var(--teal)] text-black hover:bg-[var(--teal)]/80 min-h-[36px]" onClick={() => toast({ title: "Test A/B iniciado", description: "Reparto 50/50 entre variantes" })}>
                Iniciar test
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 3-panel builder: palette | canvas | config */}
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_260px] gap-4">
        {/* Palette */}
        <div className="rp-glass rounded-2xl p-3 lg:max-h-[600px] lg:overflow-y-auto rp-scroll-thin">
          <h3 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 px-1">Nodos</h3>
          <div className="flex lg:flex-col gap-2 overflow-x-auto rp-scroll-thin pb-1 lg:pb-0">
            {PALETTE.map((group) => {
              const meta = NODE_TYPE_META[group.type];
              const GIcon = meta.icon;
              return (
                <div key={group.type} className="min-w-[180px] lg:min-w-0 shrink-0">
                  <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider", meta.bg, meta.text)}>
                    <GIcon className="h-3 w-3" />
                    {meta.label}
                  </div>
                  <ul className="mt-1 space-y-0.5">
                    {group.items.map((it) => {
                      const I = it.icon;
                      return (
                        <li key={it.subtype}>
                          <button
                            onClick={() => addNode(group.type, it.subtype, it.title)}
                            className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-left text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04] transition-colors min-h-[36px]"
                          >
                            <I className="h-3 w-3 shrink-0" style={{ color: meta.color }} />
                            <span className="truncate">{it.title}</span>
                            <Plus className="h-3 w-3 ml-auto shrink-0 opacity-50" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Canvas */}
        <div className="rp-glass rounded-2xl p-4 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-sm">Flujo de automatización</h3>
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{nodes.length} nodos</span>
          </div>
          <div className="overflow-x-auto rp-scroll-thin pb-2">
            <div className="flex items-stretch gap-2 min-w-max">
              {nodes.map((node, idx) => {
                const meta = NODE_TYPE_META[node.type];
                const Icon = meta.icon;
                const isSelected = selectedId === node.id;
                return (
                  <React.Fragment key={node.id}>
                    <motion.button
                      layout={!reduce}
                      initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setSelectedId(node.id)}
                      className={cn(
                        "w-[180px] shrink-0 rounded-xl border p-3 text-left transition-colors",
                        isSelected ? cn(meta.border, meta.bg, "ring-1 ring-offset-0") : "border-border/40 bg-foreground/[0.02] hover:bg-foreground/[0.04]"
                      )}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider", meta.bg, meta.text, meta.border, "border")}>
                          <Icon className="h-2.5 w-2.5" />
                          {meta.label}
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); deleteNode(node.id); } }}
                          aria-label="Eliminar nodo"
                          className="h-5 w-5 inline-flex items-center justify-center rounded text-muted-foreground hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </span>
                      </div>
                      <div className="mt-2 font-medium text-sm leading-snug">{node.title}</div>
                      <div className="mt-1 text-[11px] text-muted-foreground line-clamp-2">{node.summary}</div>
                    </motion.button>
                    {idx < nodes.length - 1 && (
                      <div className="flex items-center shrink-0" aria-hidden>
                        <ArrowRight className="h-4 w-4 text-muted-foreground/60" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              <button
                onClick={() => addNode("action", "email", "Nuevo paso")}
                className="w-[120px] shrink-0 rounded-xl border border-dashed border-border/60 flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/50 transition-colors min-h-[100px]"
                aria-label="Añadir nodo"
              >
                <Plus className="h-5 w-5" />
                <span className="text-xs">Añadir nodo</span>
              </button>
            </div>
          </div>

          {/* Templates strip */}
          <div className="mt-5 pt-4 border-t border-border/40">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Plantillas de automatización</h3>
              <span className="text-[10px] text-muted-foreground">{AUTOMATION_PRESETS.length} disponibles</span>
            </div>
            <div className="flex gap-2 overflow-x-auto rp-scroll-thin pb-1">
              {AUTOMATION_PRESETS.map((p) => {
                const I = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => loadPreset(p)}
                    className="min-w-[200px] shrink-0 rounded-lg border border-border/40 bg-foreground/[0.02] p-3 text-left hover:border-[var(--gold)]/40 hover:bg-foreground/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <I className="h-3.5 w-3.5 text-[var(--gold)]" />
                      <span className="text-xs font-medium truncate">{p.name}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">{p.desc}</p>
                    <div className="mt-1.5 text-[9px] font-mono uppercase tracking-wider text-muted-foreground">{p.nodes} nodos</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Config panel */}
        <div className="rp-glass rounded-2xl p-4">
          <h3 className="font-display text-sm mb-3">Configuración</h3>
          {selected ? (
            <NodeConfig key={selected.id} node={selected} onChange={(patch) => updateNode(selected.id, patch)} />
          ) : (
            <div className="text-sm text-muted-foreground py-6 text-center">
              Selecciona un nodo para configurarlo.
            </div>
          )}
        </div>
      </div>

      <TestDialog open={testOpen} onOpenChange={setTestOpen} />
      <AlertDialog open={publishOpen} onOpenChange={setPublishOpen}>
        <AlertDialogContent className="rp-glass-strong">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Publicar automatización?</AlertDialogTitle>
            <AlertDialogDescription>
              La automatización “Recuperación inactivos” quedará activa y se ejecutará automáticamente cuando un cliente cumpla el trigger.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { toast({ title: "Automatización publicada", description: "Activa y lista para ejecutarse." }); setPublishOpen(false); }}
              className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] min-h-[44px]"
            >
              Publicar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function NodeConfig({ node, onChange }: { node: FlowNode; onChange: (patch: Partial<FlowNode>) => void }) {
  const meta = NODE_TYPE_META[node.type];
  const Icon = meta.icon;
  return (
    <div className="space-y-3">
      <div className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider", meta.bg, meta.text, meta.border, "border")}>
        <Icon className="h-3 w-3" />
        {meta.label}
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Título</label>
        <Input
          value={node.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="bg-foreground/[0.04] min-h-[40px]"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Resumen / Config</label>
        <Textarea
          value={node.summary}
          onChange={(e) => onChange({ summary: e.target.value })}
          rows={3}
          className="bg-foreground/[0.04] min-h-[80px] resize-none"
        />
      </div>
      {node.type === "wait" && (
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Duración</label>
          <div className="flex items-center gap-2">
            <Input type="number" defaultValue={node.subtype === "horas" ? 2 : 5} className="bg-foreground/[0.04] min-h-[40px]" />
            <select className="bg-foreground/[0.04] border border-border/40 rounded-md px-2 py-2 text-xs min-h-[40px]" defaultValue={node.subtype === "horas" ? "horas" : "dias"}>
              <option value="horas">horas</option>
              <option value="dias">días</option>
            </select>
          </div>
        </div>
      )}
      {node.type === "action" && (node.subtype === "email" || node.subtype === "whatsapp" || node.subtype === "sms") && (
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Plantilla</label>
          <select className="bg-foreground/[0.04] border border-border/40 rounded-md px-2 py-2 text-xs w-full min-h-[40px]">
            <option>Te echamos de menos</option>
            <option>Feliz cumpleaños</option>
            <option>Oferta exclusiva 15%</option>
            <option>Reserva tu mesa</option>
          </select>
        </div>
      )}
      {node.type === "condition" && (
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Regla</label>
          <select className="bg-foreground/[0.04] border border-border/40 rounded-md px-2 py-2 text-xs w-full min-h-[40px]" defaultValue={node.subtype}>
            <option value="consentimiento">Consentimiento RGPD</option>
            <option value="canal">Canal preferido</option>
            <option value="ltv">LTV mínimo</option>
          </select>
        </div>
      )}
      <div className="pt-2 border-t border-border/40 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        ID: {node.id}
      </div>
    </div>
  );
}

function TestDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [logs, setLogs] = React.useState<{ t: string; msg: string; tone: "info" | "ok" | "warn" }[]>([]);
  const [running, setRunning] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setLogs([]);
      setRunning(false);
      return;
    }
    setRunning(true);
    const steps: { msg: string; tone: "info" | "ok" | "warn"; delay: number }[] = [
      { msg: "Cliente #1184 cumple trigger: inactividad 90d", tone: "info", delay: 0 },
      { msg: "Esperando 2 horas…", tone: "info", delay: 400 },
      { msg: "Verificando consentimiento email ✓", tone: "ok", delay: 900 },
      { msg: "Enviando email 'Te echamos de menos'", tone: "info", delay: 1300 },
      { msg: "Email entregado a maria@example.com ✓", tone: "ok", delay: 1700 },
      { msg: "Esperando 5 días…", tone: "info", delay: 2100 },
      { msg: "Sin apertura detectada — activando WhatsApp", tone: "warn", delay: 2600 },
      { msg: "WhatsApp enviado a +34 6XX XXX XXX ✓", tone: "ok", delay: 3000 },
      { msg: "Test completado · duración simulada: 5 días 2h", tone: "ok", delay: 3400 },
    ];
    const timers = steps.map((s) => setTimeout(() => {
      setLogs((prev) => [...prev, { t: new Date().toLocaleTimeString("es-ES"), msg: s.msg, tone: s.tone }]);
    }, s.delay));
    const endTimer = setTimeout(() => setRunning(false), 3600);
    return () => { timers.forEach(clearTimeout); clearTimeout(endTimer); };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rp-glass-strong sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Probar automatización</DialogTitle>
          <DialogDescription>
            Ejecuta el flujo con un cliente demo y revisa el log de ejecución.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border border-border/40 bg-black/40 p-3 font-mono text-xs max-h-72 overflow-y-auto rp-scroll-thin">
          {logs.length === 0 ? (
            <div className="text-muted-foreground">Iniciando test…</div>
          ) : (
            <ul className="space-y-1">
              {logs.map((l, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-muted-foreground shrink-0">[{l.t}]</span>
                  <span className={cn(
                    l.tone === "ok" && "text-[var(--teal)]",
                    l.tone === "warn" && "text-amber-300",
                    l.tone === "info" && "text-foreground/80"
                  )}>{l.msg}</span>
                </li>
              ))}
              {running && <li className="text-muted-foreground animate-pulse">▌</li>}
            </ul>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="min-h-[44px]">Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =====================================================================
 * Tab 4 — Plantillas
 * ===================================================================== */

function TemplatesTab({ reduce }: { reduce: boolean | null }) {
  const [cat, setCat] = React.useState("Todas");
  const [newOpen, setNewOpen] = React.useState(false);

  const filtered = cat === "Todas" ? TEMPLATES : TEMPLATES.filter((t) => t.category === cat);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {TEMPLATE_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={cn(
                "inline-flex items-center rounded-md border px-2.5 py-1 text-xs transition-colors min-h-[32px]",
                cat === c
                  ? "border-[var(--gold)]/50 bg-[var(--gold)]/10 text-[var(--gold-soft)]"
                  : "border-foreground/15 bg-foreground/[0.03] text-muted-foreground hover:border-foreground/30"
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <Button onClick={() => setNewOpen(true)} className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] min-h-[40px]">
          <Plus className="h-4 w-4 mr-1.5" /> Nueva plantilla
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((t, i) => {
          const M = CHANNEL_META[t.channel];
          const I = M.icon;
          return (
            <motion.div
              key={t.id}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
              className="rp-glass rounded-2xl p-4 flex flex-col"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono", M.cls)}>
                  <I className="h-3 w-3" /> {t.channel}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{t.category}</span>
              </div>
              <h3 className="font-display text-base leading-tight">{t.name}</h3>
              <div className="mt-2 rounded-md border border-border/40 bg-foreground/[0.02] p-2.5 text-xs">
                <div className="font-medium text-foreground/90 truncate">{t.subject}</div>
                <div className="text-muted-foreground mt-0.5 truncate">{t.preview}</div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md border border-border/40 bg-foreground/[0.02] p-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Apertura</div>
                  <div className="font-display text-lg text-[var(--gold-soft)] tabular-nums">{t.openRate}%</div>
                </div>
                <div className="rounded-md border border-border/40 bg-foreground/[0.02] p-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">CTR</div>
                  <div className="font-display text-lg text-[var(--teal)] tabular-nums">{t.ctr}%</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground">Último uso: {t.lastUsed}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="min-h-[36px] border-[var(--gold)]/40 text-[var(--gold-soft)] hover:bg-[var(--gold)]/10"
                  onClick={() => toast({ title: "Plantilla cargada", description: t.name })}
                >
                  Usar plantilla
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <NewTemplateDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  );
}

function NewTemplateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [name, setName] = React.useState("");
  const [channel, setChannel] = React.useState<Channel>("Email");
  const [subject, setSubject] = React.useState("");
  const [preview, setPreview] = React.useState("");

  function submit() {
    if (!name.trim() || !subject.trim()) {
      toast({ title: "Faltan campos", description: "Nombre y asunto son obligatorios.", variant: "destructive" });
      return;
    }
    toast({ title: "Plantilla creada", description: `${name} (${channel})` });
    setName(""); setSubject(""); setPreview("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rp-glass-strong sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva plantilla</DialogTitle>
          <DialogDescription>Crea una plantilla reutilizable para email o WhatsApp.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-1 max-h-[60vh] overflow-y-auto rp-scroll-thin pr-1">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Nombre</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Oferta flash 24h" className="bg-foreground/[0.04] min-h-[44px]" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Canal</label>
            <div className="flex flex-wrap gap-1.5">
              {(["Email", "WhatsApp", "SMS", "Push"] as Channel[]).map((ch) => {
                const M = CHANNEL_META[ch];
                const I = M.icon;
                const active = channel === ch;
                return (
                  <button
                    key={ch}
                    onClick={() => setChannel(ch)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs transition-colors min-h-[40px]",
                      active ? cn(M.cls, "ring-1") : "border-border/40 bg-foreground/[0.03] text-muted-foreground hover:border-foreground/30"
                    )}
                  >
                    <I className="h-3.5 w-3.5" /> {ch}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Asunto</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Asunto del mensaje" className="bg-foreground/[0.04] min-h-[44px]" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Previsualización</label>
            <Textarea value={preview} onChange={(e) => setPreview(e.target.value)} rows={3} placeholder="Primeras palabras del mensaje…" className="bg-foreground/[0.04] min-h-[80px] resize-none" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="min-h-[44px]">Cancelar</Button>
          <Button onClick={submit} className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] min-h-[44px]">Crear plantilla</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
