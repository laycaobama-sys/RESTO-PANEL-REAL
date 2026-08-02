"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  ChefHat,
  Flame,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Timer,
  Utensils,
  Pizza,
  IceCream,
  GlassWater,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Zap,
  ChevronRight,
  Eye,
  Send,
  Play,
  Pause,
  XCircle,
  CircleDashed,
  AlertCircle,
  Wine,
  Salad,
  CreditCard,
  ArrowRight,
  Gauge,
  Bot,
  ListChecks,
  Bell,
  HandCoins,
  ChevronDown,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type TicketStatus = "new" | "preparing" | "ready" | "served" | "cancelled" | "delayed";
type TicketPriority = "normal" | "high" | "urgent";

interface KitchenTicket {
  id: string;
  tableId: string;
  tableName: string;
  zone: string;
  orderItems: {
    name: string;
    qty: number;
    modifiers?: string[];
    status: "pending" | "preparing" | "ready";
  }[];
  status: TicketStatus;
  priority: TicketPriority;
  sentAt: string;
  elapsedMin: number;
  targetMin: number;
  delayMin: number;
  waiter: string;
  course: "starter" | "main" | "dessert" | "all";
  specialNotes?: string;
  allergens?: string[];
}

interface ServiceFlowMetric {
  tableId: string;
  tableName: string;
  zone: string;
  partySize: number;
  phase: string;
  phaseStart: string;
  phaseDuration: number;
  expectedDuration: number;
  isDelayed: boolean;
  delayMin: number;
  flowScore: number;
  totalServiceMin: number;
}

/* =========================================================
 * Static metadata
 * =======================================================*/
const STATUS_META: Record<
  TicketStatus,
  { label: string; color: string; bg: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  new: {
    label: "Nuevos",
    color: "text-foreground/85",
    bg: "bg-foreground/[0.04]",
    border: "border-foreground/15",
    icon: CircleDashed,
  },
  preparing: {
    label: "Preparando",
    color: "text-[var(--teal)]",
    bg: "bg-[var(--teal)]/10",
    border: "border-[var(--teal)]/40",
    icon: Flame,
  },
  ready: {
    label: "Listos",
    color: "text-emerald-300",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/40",
    icon: CheckCircle2,
  },
  delayed: {
    label: "Retrasados",
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/55",
    icon: AlertTriangle,
  },
  served: {
    label: "Servidos",
    color: "text-muted-foreground",
    bg: "bg-foreground/[0.02]",
    border: "border-foreground/10",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelados",
    color: "text-muted-foreground",
    bg: "bg-foreground/[0.02]",
    border: "border-foreground/10",
    icon: XCircle,
  },
};

const PRIORITY_META: Record<
  TicketPriority,
  { label: string; color: string; bg: string; border: string }
> = {
  normal: {
    label: "Normal",
    color: "text-muted-foreground",
    bg: "bg-foreground/[0.04]",
    border: "border-foreground/15",
  },
  high: {
    label: "Alta",
    color: "text-[var(--gold-soft)]",
    bg: "bg-[var(--gold)]/10",
    border: "border-[var(--gold)]/45",
  },
  urgent: {
    label: "Urgente",
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/55",
  },
};

const COURSE_META: Record<
  KitchenTicket["course"],
  { label: string; icon: React.ComponentType<{ className?: string }>; tone: string }
> = {
  starter: { label: "Entrante", icon: Salad, tone: "text-[var(--teal)]" },
  main: { label: "Principal", icon: Utensils, tone: "text-[var(--gold-soft)]" },
  dessert: { label: "Postre", icon: IceCream, tone: "text-fuchsia-300" },
  all: { label: "Todo", icon: Pizza, tone: "text-foreground/85" },
};

const PHASE_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; tone: string; next?: string }
> = {
  seated: { label: "Sentado", icon: Users, tone: "text-foreground/70", next: "drinks" },
  drinks: { label: "Bebidas", icon: GlassWater, tone: "text-[var(--teal)]", next: "starters" },
  starters: { label: "Entrantes", icon: Salad, tone: "text-[var(--gold-soft)]", next: "main" },
  main: { label: "Principal", icon: Utensils, tone: "text-amber-300", next: "dessert" },
  dessert: { label: "Postre", icon: IceCream, tone: "text-fuchsia-300", next: "paying" },
  paying: { label: "Pagando", icon: CreditCard, tone: "text-emerald-300" },
};

const ITEM_STATUS_ICON: Record<
  KitchenTicket["orderItems"][number]["status"],
  { icon: React.ComponentType<{ className?: string }>; tone: string; label: string }
> = {
  pending: { icon: Clock, tone: "text-muted-foreground", label: "Pendiente" },
  preparing: { icon: Flame, tone: "text-[var(--teal)]", label: "Preparando" },
  ready: { icon: CheckCircle2, tone: "text-emerald-300", label: "Listo" },
};

/* =========================================================
 * Demo data — KDS tickets (12)
 * =======================================================*/
const KDS_TICKETS: KitchenTicket[] = [
  // Nuevos
  {
    id: "TK-2401",
    tableId: "M3",
    tableName: "M3",
    zone: "Interior",
    orderItems: [
      { name: "Croquetas jamón", qty: 2, status: "pending" },
      { name: "Ensaladilla", qty: 1, status: "pending" },
      { name: "Calamares", qty: 1, status: "pending", modifiers: ["Sin alioli"] },
      { name: "Tinto de verano", qty: 4, status: "pending" },
    ],
    status: "new",
    priority: "normal",
    sentAt: "21:13",
    elapsedMin: 2,
    targetMin: 15,
    delayMin: 0,
    waiter: "Lucía",
    course: "starter",
  },
  {
    id: "TK-2402",
    tableId: "T7",
    tableName: "T7",
    zone: "Terraza",
    orderItems: [
      { name: "Gambas al ajillo", qty: 1, status: "pending" },
      { name: "Pan", qty: 2, status: "pending" },
      { name: "Vino blanco", qty: 1, status: "pending" },
    ],
    status: "new",
    priority: "high",
    sentAt: "21:14",
    elapsedMin: 1,
    targetMin: 15,
    delayMin: 0,
    waiter: "Carlos",
    course: "starter",
  },
  {
    id: "TK-2403",
    tableId: "V1",
    tableName: "V1",
    zone: "VIP",
    orderItems: [
      { name: "Jamón ibérico", qty: 1, status: "pending" },
      { name: "Champagne", qty: 2, status: "pending" },
    ],
    status: "new",
    priority: "urgent",
    sentAt: "21:15",
    elapsedMin: 0,
    targetMin: 10,
    delayMin: 0,
    waiter: "María",
    course: "starter",
    specialNotes: "VIP — servicio prioritario",
  },
  // Preparando
  {
    id: "TK-2390",
    tableId: "M12",
    tableName: "M12",
    zone: "Interior",
    orderItems: [
      { name: "Paella valenciana", qty: 2, status: "preparing", modifiers: ["Sin guisantes"] },
      { name: "Croquetas", qty: 1, status: "ready" },
      { name: "Ensalada mixta", qty: 1, status: "preparing" },
      { name: "Vino tinto", qty: 1, status: "ready" },
      { name: "Agua", qty: 2, status: "ready" },
    ],
    status: "preparing",
    priority: "normal",
    sentAt: "20:59",
    elapsedMin: 14,
    targetMin: 20,
    delayMin: 0,
    waiter: "Lucía",
    course: "main",
    allergens: ["Gluten"],
  },
  {
    id: "TK-2391",
    tableId: "M8",
    tableName: "M8",
    zone: "Interior",
    orderItems: [
      { name: "Hamburguesa", qty: 2, status: "preparing", modifiers: ["Poco hecha"] },
      { name: "Patatas fritas", qty: 2, status: "preparing" },
      { name: "Cerveza", qty: 2, status: "ready" },
    ],
    status: "preparing",
    priority: "high",
    sentAt: "21:05",
    elapsedMin: 8,
    targetMin: 15,
    delayMin: 0,
    waiter: "Pedro",
    course: "main",
    allergens: ["Gluten"],
  },
  {
    id: "TK-2392",
    tableId: "B1",
    tableName: "B1",
    zone: "Barra",
    orderItems: [
      { name: "Tapa calamares", qty: 1, status: "preparing" },
      { name: "Caña", qty: 1, status: "ready" },
    ],
    status: "preparing",
    priority: "normal",
    sentAt: "21:08",
    elapsedMin: 5,
    targetMin: 10,
    delayMin: 0,
    waiter: "Pedro",
    course: "all",
  },
  {
    id: "TK-2393",
    tableId: "V3",
    tableName: "V3",
    zone: "VIP",
    orderItems: [
      { name: "Solomillo", qty: 2, status: "preparing", modifiers: ["Poco hecho"] },
      { name: "Foie", qty: 1, status: "ready" },
      { name: "Vino Ribera", qty: 1, status: "ready" },
      { name: "Agua", qty: 2, status: "ready" },
    ],
    status: "preparing",
    priority: "urgent",
    sentAt: "21:02",
    elapsedMin: 11,
    targetMin: 15,
    delayMin: 0,
    waiter: "María",
    course: "main",
    specialNotes: "VIP — emplatado especial",
    allergens: ["Frutos secos"],
  },
  // Listos
  {
    id: "TK-2380",
    tableId: "M5",
    tableName: "M5",
    zone: "Interior",
    orderItems: [
      { name: "Risotto", qty: 2, status: "ready" },
      { name: "Agua", qty: 2, status: "ready" },
    ],
    status: "ready",
    priority: "normal",
    sentAt: "20:55",
    elapsedMin: 20,
    targetMin: 18,
    delayMin: 0,
    waiter: "Lucía",
    course: "main",
    allergens: ["Gluten", "Lácteos"],
  },
  {
    id: "TK-2381",
    tableId: "T2",
    tableName: "T2",
    zone: "Terraza",
    orderItems: [
      { name: "Pulpo a la gallega", qty: 1, status: "ready" },
      { name: "Pimientos padrón", qty: 1, status: "ready" },
      { name: "Vino albariño", qty: 1, status: "ready" },
    ],
    status: "ready",
    priority: "normal",
    sentAt: "21:00",
    elapsedMin: 15,
    targetMin: 15,
    delayMin: 0,
    waiter: "Carlos",
    course: "starter",
  },
  {
    id: "TK-2382",
    tableId: "B3",
    tableName: "B3",
    zone: "Barra",
    orderItems: [{ name: "Tortilla", qty: 1, status: "ready" }],
    status: "ready",
    priority: "normal",
    sentAt: "21:09",
    elapsedMin: 6,
    targetMin: 8,
    delayMin: 0,
    waiter: "Pedro",
    course: "all",
    allergens: ["Huevo"],
  },
  // Retrasados
  {
    id: "TK-2370",
    tableId: "M14",
    tableName: "M14",
    zone: "Interior",
    orderItems: [
      { name: "Chuletón", qty: 2, status: "preparing", modifiers: ["Muy hecho"] },
      { name: "Patatas", qty: 2, status: "preparing" },
      { name: "Pimientos", qty: 1, status: "ready" },
      { name: "Vino tinto", qty: 1, status: "ready" },
    ],
    status: "delayed",
    priority: "urgent",
    sentAt: "20:45",
    elapsedMin: 28,
    targetMin: 20,
    delayMin: 8,
    waiter: "Lucía",
    course: "main",
    specialNotes: "Mesa quejándose — prioridad máxima",
    allergens: ["Gluten"],
  },
  {
    id: "TK-2371",
    tableId: "M7",
    tableName: "M7",
    zone: "Interior",
    orderItems: [
      { name: "Paella", qty: 2, status: "preparing" },
      { name: "Ensalada", qty: 1, status: "ready" },
      { name: "Agua", qty: 2, status: "ready" },
    ],
    status: "delayed",
    priority: "high",
    sentAt: "20:51",
    elapsedMin: 22,
    targetMin: 18,
    delayMin: 4,
    waiter: "Pedro",
    course: "main",
    allergens: ["Gluten"],
  },
];

/* =========================================================
 * Demo data — Service flow metrics (12 occupied tables)
 * =======================================================*/
const FLOW_METRICS: ServiceFlowMetric[] = [
  {
    tableId: "M3",
    tableName: "M3",
    zone: "Interior",
    partySize: 4,
    phase: "seated",
    phaseStart: "21:13",
    phaseDuration: 2,
    expectedDuration: 5,
    isDelayed: false,
    delayMin: 0,
    flowScore: 95,
    totalServiceMin: 2,
  },
  {
    tableId: "M12",
    tableName: "M12",
    zone: "Interior",
    partySize: 5,
    phase: "main",
    phaseStart: "20:50",
    phaseDuration: 23,
    expectedDuration: 22,
    isDelayed: true,
    delayMin: 1,
    flowScore: 78,
    totalServiceMin: 70,
  },
  {
    tableId: "M14",
    tableName: "M14",
    zone: "Interior",
    partySize: 4,
    phase: "main",
    phaseStart: "20:30",
    phaseDuration: 45,
    expectedDuration: 22,
    isDelayed: true,
    delayMin: 23,
    flowScore: 42,
    totalServiceMin: 90,
  },
  {
    tableId: "M7",
    tableName: "M7",
    zone: "Interior",
    partySize: 3,
    phase: "main",
    phaseStart: "20:40",
    phaseDuration: 35,
    expectedDuration: 22,
    isDelayed: true,
    delayMin: 13,
    flowScore: 55,
    totalServiceMin: 80,
  },
  {
    tableId: "M5",
    tableName: "M5",
    zone: "Interior",
    partySize: 2,
    phase: "dessert",
    phaseStart: "21:00",
    phaseDuration: 5,
    expectedDuration: 12,
    isDelayed: false,
    delayMin: 0,
    flowScore: 88,
    totalServiceMin: 75,
  },
  {
    tableId: "T2",
    tableName: "T2",
    zone: "Terraza",
    partySize: 3,
    phase: "starters",
    phaseStart: "20:55",
    phaseDuration: 20,
    expectedDuration: 18,
    isDelayed: true,
    delayMin: 2,
    flowScore: 72,
    totalServiceMin: 40,
  },
  {
    tableId: "T7",
    tableName: "T7",
    zone: "Terraza",
    partySize: 4,
    phase: "seated",
    phaseStart: "21:14",
    phaseDuration: 1,
    expectedDuration: 5,
    isDelayed: false,
    delayMin: 0,
    flowScore: 96,
    totalServiceMin: 1,
  },
  {
    tableId: "V1",
    tableName: "V1",
    zone: "VIP",
    partySize: 2,
    phase: "seated",
    phaseStart: "21:15",
    phaseDuration: 0,
    expectedDuration: 4,
    isDelayed: false,
    delayMin: 0,
    flowScore: 98,
    totalServiceMin: 0,
  },
  {
    tableId: "V3",
    tableName: "V3",
    zone: "VIP",
    partySize: 4,
    phase: "main",
    phaseStart: "20:55",
    phaseDuration: 20,
    expectedDuration: 22,
    isDelayed: false,
    delayMin: 0,
    flowScore: 90,
    totalServiceMin: 65,
  },
  {
    tableId: "B1",
    tableName: "B1",
    zone: "Barra",
    partySize: 1,
    phase: "drinks",
    phaseStart: "21:08",
    phaseDuration: 7,
    expectedDuration: 8,
    isDelayed: false,
    delayMin: 0,
    flowScore: 85,
    totalServiceMin: 7,
  },
  {
    tableId: "B3",
    tableName: "B3",
    zone: "Barra",
    partySize: 1,
    phase: "paying",
    phaseStart: "21:09",
    phaseDuration: 6,
    expectedDuration: 10,
    isDelayed: false,
    delayMin: 0,
    flowScore: 92,
    totalServiceMin: 30,
  },
  {
    tableId: "M8",
    tableName: "M8",
    zone: "Interior",
    partySize: 2,
    phase: "main",
    phaseStart: "21:00",
    phaseDuration: 15,
    expectedDuration: 22,
    isDelayed: false,
    delayMin: 0,
    flowScore: 80,
    totalServiceMin: 35,
  },
];

interface PhaseAvg {
  phase: string;
  avgMin: number;
  targetMin: number;
}
const PHASE_AVGS: PhaseAvg[] = [
  { phase: "seated", avgMin: 4, targetMin: 5 },
  { phase: "drinks", avgMin: 8, targetMin: 8 },
  { phase: "starters", avgMin: 18, targetMin: 15 },
  { phase: "main", avgMin: 22, targetMin: 18 },
  { phase: "dessert", avgMin: 12, targetMin: 12 },
];

interface AIRec {
  id: string;
  title: string;
  reason: string;
  impact: string;
  confidence: number;
}
const OPTIMIZER_RECS: AIRec[] = [
  {
    id: "opt-1",
    title: "Mesa 14 acumula 8min de retraso en cocina",
    reason: "Priorizar ticket M14 en KDS. Impacto: evitar queja + mantener flow.",
    impact: "Evitar queja + mantener flow",
    confidence: 92,
  },
  {
    id: "opt-2",
    title: "Mesa 3 lleva 35min en Starters — posible olvido",
    reason: "Verificar con camarero si faltan platos. Impacto: evitar retraso en Main.",
    impact: "Evitar retraso en Main",
    confidence: 78,
  },
  {
    id: "opt-3",
    title: "5 mesas pasarán a Dessert simultáneamente en 10min",
    reason: "Preparar postres con antelación. Impacto: -5min espera media.",
    impact: "-5min espera media",
    confidence: 85,
  },
  {
    id: "opt-4",
    title: "Mesa 7 y M14 tienen retrasos — considerar compensación",
    reason: "Sugerir cortesía (cafe gratis). Impacto: mantener satisfacción.",
    impact: "Mantener satisfacción",
    confidence: 70,
  },
];

interface AutomationRule {
  id: string;
  cond: string;
  action: string;
  active: boolean;
}
const AUTOMATION_RULES: AutomationRule[] = [
  {
    id: "rule-1",
    cond: "Main → Dessert en 25min",
    action: "Alerta al camarero",
    active: true,
  },
  {
    id: "rule-2",
    cond: "Dessert → Paying en 15min",
    action: "Sugerir cuenta",
    active: true,
  },
  {
    id: "rule-3",
    cond: "Paying > 10min",
    action: "Notificar limpieza",
    active: true,
  },
];

/* =========================================================
 * Helpers
 * =======================================================*/
function fmtElapsed(min: number): string {
  const m = Math.floor(min);
  const s = Math.round((min - m) * 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function elapsedColor(min: number, target: number): string {
  if (min < target * 0.8) return "text-emerald-300";
  if (min <= target) return "text-[var(--gold-soft)]";
  return "text-destructive";
}

function flowScoreColor(s: number): string {
  if (s >= 80) return "text-emerald-300";
  if (s >= 60) return "text-[var(--gold-soft)]";
  return "text-destructive";
}

function flowScoreStroke(s: number): string {
  if (s >= 80) return "#10b981";
  if (s >= 60) return "#D4AF37";
  return "#ef4444";
}

function confidenceTone(c: number): string {
  if (c >= 85) return "text-emerald-300";
  if (c >= 70) return "text-[var(--gold-soft)]";
  return "text-amber-300";
}

/* =========================================================
 * Demo badge
 * =======================================================*/


/* =========================================================
 * Main component
 * =======================================================*/
export function FloorKds() {
  const reduce = useReducedMotion();
  const { toast } = useToast();

  const [tickets, setTickets] = React.useState<KitchenTicket[]>(KDS_TICKETS);
  const [tab, setTab] = React.useState<"kds" | "flow" | "optimizer">("kds");
  const [historyTable, setHistoryTable] = React.useState<ServiceFlowMetric | null>(null);

  // KPIs derived
  const active = tickets.filter((t) => t.status !== "served" && t.status !== "cancelled");
  const delayed = tickets.filter((t) => t.status === "delayed");
  const ready = tickets.filter((t) => t.status === "ready");
  const avgElapsed = active.length
    ? Math.round(active.reduce((s, t) => s + t.elapsedMin, 0) / active.length)
    : 0;

  function advance(id: string) {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next: Record<TicketStatus, TicketStatus> = {
          new: "preparing",
          preparing: "ready",
          ready: "served",
          served: "served",
          cancelled: "cancelled",
          delayed: "ready",
        };
        const ns = next[t.status];
        // mark all items ready when going to ready/served
        const items = t.orderItems.map((it) =>
          ns === "ready" || ns === "served" ? { ...it, status: "ready" as const } : it
        );
        return { ...t, status: ns, orderItems: items };
      })
    );
    const t = tickets.find((x) => x.id === id);
    toast({
      title: "Ticket actualizado",
      description: `${t?.tableName} → ${STATUS_META[
        ((): TicketStatus => {
          const cur = t?.status ?? "new";
          const nextMap: Record<TicketStatus, TicketStatus> = {
            new: "preparing",
            preparing: "ready",
            ready: "served",
            served: "served",
            cancelled: "cancelled",
            delayed: "ready",
          };
          return nextMap[cur];
        })()
      ].label}`,
    });
  }

  function cancel(id: string) {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: "cancelled" } : t)));
    const t = tickets.find((x) => x.id === id);
    toast({
      title: "Ticket cancelado",
      description: `${t?.tableName} — cancelado por cocina`,
      variant: "destructive",
    });
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rp-glass rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--teal)]/12 border border-[var(--teal)]/35 text-[var(--teal)]">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-2xl sm:text-3xl font-light tracking-tight">
                  Kitchen Display System
                </h2>
                
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Conecta sala con cocina · Optimiza el flujo de servicio en tiempo real
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mt-5">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="kds" className="min-h-11">
              <ChefHat className="h-4 w-4 mr-1.5" /> KDS
            </TabsTrigger>
            <TabsTrigger value="flow" className="min-h-11">
              <Activity className="h-4 w-4 mr-1.5" /> Service Flow
            </TabsTrigger>
            <TabsTrigger value="optimizer" className="min-h-11">
              <Sparkles className="h-4 w-4 mr-1.5" /> Optimizer
            </TabsTrigger>
          </TabsList>

          {/* ============================================================
              KDS TAB
          ============================================================ */}
          <TabsContent value="kds" className="mt-5 space-y-5">
            {/* KPI strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiTile
                icon={Utensils}
                label="Tickets activos"
                value={active.length}
                sub={`${tickets.length} total`}
                tone="teal"
              />
              <KpiTile
                icon={AlertTriangle}
                label="Retrasados"
                value={delayed.length}
                sub={delayed.length > 0 ? "Atención requerida" : "OK"}
                tone={delayed.length > 0 ? "destructive" : "emerald"}
              />
              <KpiTile
                icon={Timer}
                label="Tiempo medio"
                value={`${avgElapsed}min`}
                sub="target ≤20min"
                tone="gold"
              />
              <KpiTile
                icon={CheckCircle2}
                label="Listos servir"
                value={ready.length}
                sub="Esperando camarero"
                tone="emerald"
              />
            </div>

            {/* Kanban columns */}
            <div className="grid gap-4 lg:grid-cols-4 md:grid-cols-2 grid-cols-1">
              {(["new", "preparing", "ready", "delayed"] as TicketStatus[]).map((col) => {
                const cm = STATUS_META[col];
                const colTickets = tickets.filter((t) => t.status === col);
                return (
                  <div
                    key={col}
                    className={cn(
                      "rounded-2xl border p-3 flex flex-col gap-3",
                      col === "delayed"
                        ? "border-destructive/40 bg-destructive/[0.04]"
                        : "border-border/60 bg-foreground/[0.02]"
                    )}
                  >
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <cm.icon className={cn("h-4 w-4", cm.color)} />
                        <span className="text-sm font-medium">{cm.label}</span>
                      </div>
                      <span
                        className={cn(
                          "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-mono",
                          cm.bg,
                          cm.color
                        )}
                      >
                        {colTickets.length}
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[640px] overflow-y-auto rp-scroll-thin pr-1">
                      <AnimatePresence mode="popLayout">
                        {colTickets.length === 0 ? (
                          <motion.div
                            key="empty"
                            initial={reduce ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={reduce ? undefined : { opacity: 0 }}
                            className="rounded-lg border border-dashed border-border/40 p-4 text-center text-xs text-muted-foreground"
                          >
                            Sin tickets
                          </motion.div>
                        ) : (
                          colTickets.map((t) => (
                            <TicketCard
                              key={t.id}
                              ticket={t}
                              onAdvance={() => advance(t.id)}
                              onCancel={() => cancel(t.id)}
                            />
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* ============================================================
              SERVICE FLOW TAB
          ============================================================ */}
          <TabsContent value="flow" className="mt-5 space-y-5">
            {/* Flow analytics */}
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2 rp-glass rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-[var(--teal)]" />
                  <h3 className="font-display text-lg font-medium">Tiempo medio por fase</h3>
                </div>
                <div className="space-y-3">
                  {PHASE_AVGS.map((p) => {
                    const pm = PHASE_META[p.phase];
                    const over = p.avgMin > p.targetMin;
                    return (
                      <div key={p.phase} className="flex items-center gap-3">
                        <div className="w-24 flex items-center gap-1.5 shrink-0">
                          <pm.icon className={cn("h-3.5 w-3.5", pm.tone)} />
                          <span className="text-xs text-foreground/85">{pm.label}</span>
                        </div>
                        <div className="flex-1 h-2 rounded-full bg-foreground/8 overflow-hidden">
                          <motion.div
                            initial={reduce ? false : { width: 0 }}
                            animate={{ width: `${Math.min(100, (p.avgMin / 30) * 100)}%` }}
                            transition={{ duration: 0.6 }}
                            className={cn(
                              "h-full rounded-full",
                              over
                                ? "bg-gradient-to-r from-amber-500 to-destructive"
                                : "bg-gradient-to-r from-[var(--teal-deep)] to-[var(--teal)]"
                            )}
                          />
                        </div>
                        <div className="w-24 text-right shrink-0">
                          <span className={cn("font-mono text-sm", over ? "text-amber-300" : "text-emerald-300")}>
                            {p.avgMin}min
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-1 font-mono">
                            / {p.targetMin}min
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-xl border border-amber-400/30 bg-amber-400/[0.05] p-3 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="text-amber-300 font-medium">Cuello de botella detectado:</span>{" "}
                    Main → Dessert (22min, +4min vs objetivo). Considerar refuerzo en cocina caliente.
                  </p>
                </div>
              </div>

              <div className="rp-glass rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Gauge className="h-5 w-5 text-[var(--gold)]" />
                  <h3 className="font-display text-lg font-medium">Ritmo del servicio</h3>
                </div>
                <div className="flex flex-col items-center justify-center py-3">
                  <div
                    className="inline-flex items-center gap-2 rounded-full border border-amber-400/45 bg-amber-400/10 px-4 py-2"
                  >
                    <Activity className="h-4 w-4 text-amber-300" />
                    <span className="font-mono text-sm text-amber-300 uppercase tracking-wider">
                      Normal
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground text-center">
                    8/12 mesas con flow óptimo · 2 con retraso · 2 próximas a umbral
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2 w-full">
                    <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/5 p-2 text-center">
                      <div className="text-[10px] font-mono uppercase text-muted-foreground">Óptimo</div>
                      <div className="font-display text-xl text-emerald-300">8</div>
                    </div>
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-center">
                      <div className="text-[10px] font-mono uppercase text-muted-foreground">Retraso</div>
                      <div className="font-display text-xl text-destructive">2</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase timeline (visual) */}
            <div className="rp-glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-5 w-5 text-[var(--teal)]" />
                <h3 className="font-display text-lg font-medium">Timeline de fases por mesa</h3>
              </div>
              <div className="space-y-2 overflow-x-auto rp-scroll-thin">
                {FLOW_METRICS.slice(0, 6).map((m) => (
                  <PhaseTimelineRow key={m.tableId} metric={m} reduce={reduce} />
                ))}
              </div>
            </div>

            {/* Flow table */}
            <div className="rp-glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[var(--gold)]" />
                  <h3 className="font-display text-lg font-medium">Estado de mesas ocupadas</h3>
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {FLOW_METRICS.length} mesas
                </Badge>
              </div>

              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto rp-scroll-thin">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-foreground/[0.03]">
                      <Th>Mesa</Th>
                      <Th>Fase actual</Th>
                      <Th>Duración fase</Th>
                      <Th>Flow score</Th>
                      <Th>Retraso</Th>
                      <Th>Total servicio</Th>
                      <Th>Acciones</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {FLOW_METRICS.map((m) => (
                      <FlowRow
                        key={m.tableId}
                        m={m}
                        reduce={reduce}
                        onHistory={() => setHistoryTable(m)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile / tablet cards */}
              <div className="lg:hidden space-y-3">
                {FLOW_METRICS.map((m) => (
                  <FlowCard key={m.tableId} m={m} onHistory={() => setHistoryTable(m)} />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ============================================================
              OPTIMIZER TAB
          ============================================================ */}
          <TabsContent value="optimizer" className="mt-5 space-y-5">
            {/* Optimization metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <OptMetric label="Flow score medio" value="74/100" tone="gold" icon={Gauge} />
              <OptMetric label="Mesas óptimas" value="8/12" tone="emerald" icon={CheckCircle2} />
              <OptMetric label="Mesas retraso" value="2/12" tone="destructive" icon={AlertTriangle} />
              <OptMetric label="Tiempo medio servicio" value="82min" sub="objetivo 90min ✓" tone="emerald" icon={Timer} />
              <OptMetric label="Rotación estimada" value="2.3 turnos/mesa" tone="teal" icon={TrendingUp} />
            </div>

            {/* AI Recs + Automation rules */}
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2 rp-glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-[var(--gold)]" />
                    <h3 className="font-display text-lg font-medium">
                      Recomendaciones AI Service Flow
                    </h3>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {OPTIMIZER_RECS.length} activas
                  </Badge>
                </div>
                <div className="space-y-3">
                  {OPTIMIZER_RECS.map((rec) => (
                    <OptimizerRec key={rec.id} rec={rec} reduce={reduce} />
                  ))}
                </div>
              </div>

              <div className="rp-glass rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ListChecks className="h-5 w-5 text-[var(--teal)]" />
                  <h3 className="font-display text-lg font-medium">Reglas de automatización</h3>
                </div>
                <div className="space-y-3">
                  {AUTOMATION_RULES.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-xl border border-border/60 bg-foreground/[0.02] p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                          Regla {r.id.replace("rule-", "#")}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Activa
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono text-foreground/85">{r.cond}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[var(--teal)]">{r.action}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg border border-[var(--teal)]/25 bg-[var(--teal)]/5 p-3">
                  <div className="flex items-start gap-2">
                    <Bell className="h-3.5 w-3.5 text-[var(--teal)] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Las reglas se evalúan cada 30s y disparan notificaciones push al zone leader correspondiente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* History dialog */}
      <Dialog open={!!historyTable} onOpenChange={(o) => !o && setHistoryTable(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Histórico de servicio · {historyTable?.tableName}</DialogTitle>
            <DialogDescription>
              {historyTable?.zone} · {historyTable?.partySize} comensales · Flujo completo
            </DialogDescription>
          </DialogHeader>
          {historyTable ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-border/60 bg-foreground/[0.02] p-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Total servicio
                  </div>
                  <div className="font-display text-xl text-[var(--gold-soft)]">
                    {historyTable.totalServiceMin}min
                  </div>
                </div>
                <div className="rounded-lg border border-border/60 bg-foreground/[0.02] p-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Flow score
                  </div>
                  <div className={cn("font-display text-xl", flowScoreColor(historyTable.flowScore))}>
                    {historyTable.flowScore}/100
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-foreground/[0.02] p-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Fase actual
                </div>
                <div className="flex items-center gap-2">
                  {(() => {
                    const pm = PHASE_META[historyTable.phase];
                    return (
                      <>
                        <pm.icon className={cn("h-4 w-4", pm.tone)} />
                        <span className="font-medium text-foreground/90">{pm.label}</span>
                        <span className="ml-auto font-mono text-sm text-foreground/80">
                          {historyTable.phaseDuration}min
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-foreground/[0.02] p-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Fases completadas
                </div>
                <ol className="space-y-1.5">
                  {Object.keys(PHASE_META)
                    .filter((p) => {
                      const order = ["seated", "drinks", "starters", "main", "dessert", "paying"];
                      return order.indexOf(p) < order.indexOf(historyTable.phase);
                    })
                    .map((p) => {
                      const pm = PHASE_META[p];
                      return (
                        <li key={p} className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className="h-3 w-3 text-emerald-300" />
                          <pm.icon className={cn("h-3 w-3", pm.tone)} />
                          <span className="text-foreground/85">{pm.label}</span>
                        </li>
                      );
                    })}
                  {Object.keys(PHASE_META).filter((p) => {
                    const order = ["seated", "drinks", "starters", "main", "dessert", "paying"];
                    return order.indexOf(p) < order.indexOf(historyTable.phase);
                  }).length === 0 ? (
                    <li className="text-xs text-muted-foreground italic">
                      Primera fase — sin histórico todavía
                    </li>
                  ) : null}
                </ol>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" className="min-h-11" onClick={() => setHistoryTable(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =========================================================
 * Sub-components
 * =======================================================*/
function KpiTile({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  tone: "teal" | "destructive" | "gold" | "emerald";
}) {
  const c =
    tone === "teal"
      ? "text-[var(--teal)]"
      : tone === "destructive"
      ? "text-destructive"
      : tone === "gold"
      ? "text-[var(--gold-soft)]"
      : "text-emerald-300";
  return (
    <div className="rp-glass rounded-xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon className={cn("h-4 w-4", c)} />
      </div>
      <div className={cn("mt-1.5 font-display text-2xl sm:text-3xl font-light tabular-nums", c)}>
        {value}
      </div>
      {sub ? <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div> : null}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
      {children}
    </th>
  );
}

function TicketCard({
  ticket,
  onAdvance,
  onCancel,
}: {
  ticket: KitchenTicket;
  onAdvance: () => void;
  onCancel: () => void;
}) {
  const pm = PRIORITY_META[ticket.priority];
  const sm = STATUS_META[ticket.status];
  const cm = COURSE_META[ticket.course];
  const nextLabel: Record<TicketStatus, string | null> = {
    new: "Iniciar",
    preparing: "Marcar listo",
    ready: "Servir",
    delayed: "Marcar listo",
    served: null,
    cancelled: null,
  };
  const nextAction = nextLabel[ticket.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22 }}
      className={cn(
        "rounded-xl border p-3 flex flex-col gap-2.5",
        ticket.status === "delayed"
          ? "border-destructive/55 bg-destructive/[0.06]"
          : ticket.priority === "urgent"
          ? "border-destructive/40 bg-foreground/[0.03]"
          : ticket.priority === "high"
          ? "border-[var(--gold)]/35 bg-foreground/[0.03]"
          : "border-border/55 bg-foreground/[0.02]"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-display text-lg font-medium text-foreground">{ticket.tableName}</span>
            <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0 text-[9px] font-mono uppercase tracking-wider", pm.bg, pm.border, pm.color)}>
              {pm.label}
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
            {ticket.zone} · {ticket.waiter}
          </div>
        </div>
        <div className="text-right">
          <div
            className={cn(
              "font-mono text-base font-medium tabular-nums",
              elapsedColor(ticket.elapsedMin, ticket.targetMin)
            )}
          >
            {fmtElapsed(ticket.elapsedMin)}
          </div>
          <div className="text-[9px] text-muted-foreground font-mono">/ {ticket.targetMin}min</div>
        </div>
      </div>

      {/* Delay badge */}
      {ticket.delayMin > 0 ? (
        <div className="flex items-center gap-1.5 rounded-md border border-destructive/55 bg-destructive/10 px-2 py-1">
          <AlertTriangle className="h-3 w-3 text-destructive" />
          <span className="text-[10px] font-mono font-medium text-destructive uppercase tracking-wider">
            Retraso +{ticket.delayMin}min
          </span>
        </div>
      ) : null}

      {/* Course + special notes */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-foreground/[0.04] px-1.5 py-0.5 text-[10px]">
          <cm.icon className={cn("h-3 w-3", cm.tone)} />
          <span className="text-foreground/85">{cm.label}</span>
        </span>
        {ticket.specialNotes ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/40 bg-amber-400/10 px-1.5 py-0.5 text-[10px] text-amber-300">
            <AlertCircle className="h-3 w-3" />
            {ticket.specialNotes}
          </span>
        ) : null}
      </div>

      {/* Items */}
      <ul className="space-y-1 border-t border-border/40 pt-2">
        {ticket.orderItems.map((it, i) => {
          const ism = ITEM_STATUS_ICON[it.status];
          return (
            <li key={i} className="flex items-start gap-1.5 text-xs">
              <ism.icon className={cn("h-3 w-3 mt-0.5 shrink-0", ism.tone)} />
              <span className="font-mono text-[var(--gold-soft)] shrink-0">{it.qty}×</span>
              <span className="text-foreground/85 flex-1">{it.name}</span>
              {it.modifiers && it.modifiers.length > 0 ? (
                <span className="text-[10px] text-muted-foreground italic">
                  ({it.modifiers.join(", ")})
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>

      {/* Allergens */}
      {ticket.allergens && ticket.allergens.length > 0 ? (
        <div className="flex items-center gap-1 flex-wrap">
          {ticket.allergens.map((a) => (
            <span
              key={a}
              className="inline-flex items-center gap-1 rounded-md border border-destructive/45 bg-destructive/10 px-1.5 py-0 text-[10px] font-mono text-destructive"
            >
              <AlertCircle className="h-2.5 w-2.5" />
              {a}
            </span>
          ))}
        </div>
      ) : null}

      {/* Actions */}
      <div className="flex items-center gap-1.5 pt-1">
        {nextAction ? (
          <Button
            size="sm"
            className={cn(
              "min-h-9 flex-1 h-9 text-xs",
              ticket.status === "delayed"
                ? "bg-destructive text-white hover:bg-destructive/90"
                : ticket.status === "ready"
                ? "bg-emerald-500 text-black hover:bg-emerald-400"
                : "bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
            )}
            onClick={onAdvance}
          >
            {ticket.status === "new" ? <Play className="h-3.5 w-3.5 mr-1" /> : null}
            {ticket.status === "preparing" || ticket.status === "delayed" ? (
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            ) : null}
            {ticket.status === "ready" ? <Send className="h-3.5 w-3.5 mr-1" /> : null}
            {nextAction}
          </Button>
        ) : null}
        <AlertDialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="min-h-9 h-9 px-2"
                  aria-label="Cancelar ticket"
                >
                  <XCircle className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
            </TooltipTrigger>
            <TooltipContent>Cancelar ticket</TooltipContent>
          </Tooltip>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Cancelar ticket {ticket.tableName}?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción cancelará el ticket {ticket.id} ({ticket.tableName} · {ticket.zone}).
                El proceso de cocina se detendrá inmediatamente. La acción queda registrada en auditoría.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="min-h-11">Mantener ticket</AlertDialogCancel>
              <AlertDialogAction
                className="min-h-11 bg-destructive text-white hover:bg-destructive/90"
                onClick={onCancel}
              >
                Sí, cancelar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
}

function FlowRow({
  m,
  reduce,
  onHistory,
}: {
  m: ServiceFlowMetric;
  reduce: boolean | null;
  onHistory: () => void;
}) {
  const pm = PHASE_META[m.phase];
  const over = m.phaseDuration > m.expectedDuration;
  const near = m.phaseDuration > m.expectedDuration * 0.8 && !over;
  const barColor = over
    ? "bg-gradient-to-r from-amber-500 to-destructive"
    : near
    ? "bg-gradient-to-r from-[var(--gold-deep)] to-[var(--gold-soft)]"
    : "bg-gradient-to-r from-[var(--teal-deep)] to-[var(--teal)]";

  return (
    <tr className="border-b border-border/40 last:border-0 transition-colors hover:bg-foreground/[0.025]">
      <td className="px-3 py-3 align-top whitespace-nowrap">
        <div className="font-display text-base font-medium text-foreground">{m.tableName}</div>
        <div className="text-[10px] text-muted-foreground font-mono">
          {m.zone} · {m.partySize}pax
        </div>
      </td>
      <td className="px-3 py-3 align-top">
        <div className="flex items-center gap-1.5">
          <pm.icon className={cn("h-3.5 w-3.5", pm.tone)} />
          <span className="text-sm text-foreground/90">{pm.label}</span>
        </div>
        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
          desde {m.phaseStart}
        </div>
      </td>
      <td className="px-3 py-3 align-top w-48">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-foreground/8 overflow-hidden">
            <motion.div
              initial={reduce ? false : { width: 0 }}
              animate={{ width: `${Math.min(100, (m.phaseDuration / (m.expectedDuration * 1.5)) * 100)}%` }}
              transition={{ duration: 0.5 }}
              className={cn("h-full rounded-full", barColor)}
            />
          </div>
          <span className={cn("font-mono text-xs whitespace-nowrap", over ? "text-destructive" : "text-foreground/85")}>
            {m.phaseDuration}min
          </span>
        </div>
        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
          objetivo {m.expectedDuration}min
        </div>
      </td>
      <td className="px-3 py-3 align-top">
        <FlowScoreRing score={m.flowScore} />
      </td>
      <td className="px-3 py-3 align-top">
        {m.delayMin > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-destructive/55 bg-destructive/10 px-1.5 py-0.5 text-[10px] font-mono text-destructive">
            <AlertTriangle className="h-3 w-3" />+{m.delayMin}min
          </span>
        ) : (
          <span className="text-[10px] text-muted-foreground italic">—</span>
        )}
      </td>
      <td className="px-3 py-3 align-top">
        <span className="font-mono text-sm text-foreground/85">{m.totalServiceMin}min</span>
      </td>
      <td className="px-3 py-3 align-top whitespace-nowrap">
        <Button size="sm" variant="outline" className="min-h-9 h-9 text-xs" onClick={onHistory}>
          <Eye className="h-3.5 w-3.5 mr-1" />
          Histórico
        </Button>
      </td>
    </tr>
  );
}

function FlowCard({
  m,
  onHistory,
}: {
  m: ServiceFlowMetric;
  onHistory: () => void;
}) {
  const pm = PHASE_META[m.phase];
  const over = m.phaseDuration > m.expectedDuration;
  return (
    <div className="rounded-xl border border-border/60 bg-foreground/[0.02] p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-display text-base font-medium text-foreground">{m.tableName}</div>
          <div className="text-[10px] text-muted-foreground font-mono">
            {m.zone} · {m.partySize}pax
          </div>
        </div>
        <FlowScoreRing score={m.flowScore} />
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        <pm.icon className={cn("h-3.5 w-3.5", pm.tone)} />
        <span className="text-sm text-foreground/90">{pm.label}</span>
        <span className="ml-auto font-mono text-xs">
          <span className={over ? "text-destructive" : "text-foreground/85"}>
            {m.phaseDuration}min
          </span>
          <span className="text-muted-foreground"> / {m.expectedDuration}min</span>
        </span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-foreground/8 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full",
            over
              ? "bg-gradient-to-r from-amber-500 to-destructive"
              : "bg-gradient-to-r from-[var(--teal-deep)] to-[var(--teal)]"
          )}
          style={{ width: `${Math.min(100, (m.phaseDuration / (m.expectedDuration * 1.5)) * 100)}%` }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground font-mono">
          Total servicio: {m.totalServiceMin}min
        </span>
        <Button size="sm" variant="outline" className="min-h-9 h-9 text-xs" onClick={onHistory}>
          <Eye className="h-3.5 w-3.5 mr-1" />
          Histórico
        </Button>
      </div>
    </div>
  );
}

function FlowScoreRing({ score }: { score: number }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: 40, height: 40 }}>
      <svg width={40} height={40} viewBox="0 0 40 40" className="-rotate-90">
        <circle
          cx={20}
          cy={20}
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-foreground/10"
          strokeWidth={3}
        />
        <motion.circle
          cx={20}
          cy={20}
          r={r}
          fill="none"
          stroke={flowScoreStroke(score)}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.6 }}
        />
      </svg>
      <span
        className={cn(
          "absolute font-mono text-[10px] font-medium tabular-nums",
          flowScoreColor(score)
        )}
      >
        {score}
      </span>
    </div>
  );
}

function PhaseTimelineRow({
  metric,
  reduce,
}: {
  metric: ServiceFlowMetric;
  reduce: boolean | null;
}) {
  const phases = ["seated", "drinks", "starters", "main", "dessert", "paying"];
  const currentIdx = phases.indexOf(metric.phase);
  return (
    <div className="flex items-center gap-2 min-w-max">
      <div className="w-12 shrink-0">
        <div className="font-display text-sm font-medium text-foreground">{metric.tableName}</div>
      </div>
      <div className="flex items-center gap-1">
        {phases.map((p, i) => {
          const pm = PHASE_META[p];
          const done = i < currentIdx;
          const current = i === currentIdx;
          const future = i > currentIdx;
          return (
            <React.Fragment key={p}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "flex items-center justify-center h-7 px-2 rounded-md border text-[10px] font-mono",
                      done && "border-emerald-400/35 bg-emerald-400/10 text-emerald-300",
                      current && "border-[var(--gold)]/55 bg-[var(--gold)]/12 text-[var(--gold-soft)]",
                      future && "border-border/40 bg-foreground/[0.02] text-muted-foreground/40"
                    )}
                  >
                    <pm.icon className="h-3 w-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex items-center gap-1.5">
                    <pm.icon className={cn("h-3 w-3", pm.tone)} />
                    <span>{pm.label}</span>
                  </div>
                  {current ? (
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {metric.phaseDuration}min en esta fase
                    </div>
                  ) : null}
                </TooltipContent>
              </Tooltip>
              {i < phases.length - 1 ? (
                <div
                  className={cn(
                    "h-0.5 w-4",
                    done ? "bg-emerald-400/40" : "bg-foreground/10"
                  )}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
      <div className="ml-2 shrink-0">
        <FlowScoreRing score={metric.flowScore} />
      </div>
    </div>
  );
}

function OptMetric({
  label,
  value,
  sub,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  tone: "teal" | "gold" | "emerald" | "destructive";
  icon: React.ComponentType<{ className?: string }>;
}) {
  const c =
    tone === "teal"
      ? "text-[var(--teal)]"
      : tone === "gold"
      ? "text-[var(--gold-soft)]"
      : tone === "emerald"
      ? "text-emerald-300"
      : "text-destructive";
  return (
    <div className="rp-glass rounded-xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon className={cn("h-4 w-4", c)} />
      </div>
      <div className={cn("mt-1.5 font-display text-xl sm:text-2xl font-light tabular-nums", c)}>
        {value}
      </div>
      {sub ? <div className="mt-0.5 text-[10px] text-muted-foreground">{sub}</div> : null}
    </div>
  );
}

function OptimizerRec({
  rec,
  reduce,
}: {
  rec: AIRec;
  reduce: boolean | null;
}) {
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const { toast } = useToast();

  function apply() {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setDone(true);
      toast({
        title: "Recomendación aplicada",
        description: rec.title,
      });
    }, 600);
  }

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-400/40 bg-emerald-400/5 p-3 flex items-center gap-2.5">
        <CheckCircle2 className="h-5 w-5 text-emerald-300" />
        <div className="flex-1 min-w-0">
          <div className="text-sm text-foreground/90">{rec.title}</div>
          <div className="text-[10px] text-emerald-300 font-mono">Aplicada</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/60 bg-foreground/[0.02] p-3"
    >
      <div className="flex items-start gap-2">
        <Bot className="h-4 w-4 text-[var(--gold)] shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground leading-tight">{rec.title}</h4>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{rec.reason}</p>
          <div className="mt-2 flex items-center gap-3 text-[11px] font-mono">
            <span className="text-muted-foreground">Confianza</span>
            <span className={confidenceTone(rec.confidence)}>{rec.confidence}%</span>
            <span className="text-muted-foreground ml-auto">Impacto</span>
            <span className="text-[var(--teal)]">{rec.impact}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <Button
          size="sm"
          className="min-h-9 h-9 text-xs bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
          onClick={apply}
          disabled={busy}
        >
          {busy ? (
            <ChevronDown className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : (
            <Zap className="h-3.5 w-3.5 mr-1" />
          )}
          Aplicar
        </Button>
      </div>
    </motion.div>
  );
}
