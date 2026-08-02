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
  Ticket,
  Gift,
  Users,
  Crown,
  Plus,
  Copy,
  Trash2,
  Eye,
  Ban,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Settings2,
  Sparkles,
  TrendingUp,
  DollarSign,
  Percent,
  Euro,
  Wine,
  UtensilsCrossed,
  Star,
  Award,
  Medal,
  ShieldCheck,
  AlertTriangle,
  Check,
  X,
  Heart,
  ShoppingBag,
  Calendar,
} from "lucide-react";

/* =====================================================================
 * Types
 * ===================================================================== */

type CouponType = "percent" | "fixed" | "free_item" | "experience" | "first_visit";
type CouponStatus = "active" | "scheduled" | "paused" | "expired";

interface Coupon {
  id: string;
  code: string;
  desc: string;
  type: CouponType;
  value: string;
  validFrom: string;
  validTo: string;
  validDays: string;
  validHours: string;
  minOrder: number;
  segment: string;
  used: number;
  limit: number;
  perCustomer: number;
  status: CouponStatus;
}

interface GiftCard {
  id: string;
  code: string;
  amount: number;
  balance: number;
  purchaser: string;
  recipient: string;
  date: string;
  expiry: string;
  status: "active" | "redeemed" | "expired" | "blocked";
  history: { date: string; desc: string; amount: number }[];
}

interface Referrer {
  id: string;
  name: string;
  code: string;
  invites: number;
  converted: number;
  revenue: number;
  rewards: string;
}

interface Referral {
  id: string;
  inviter: string;
  invitee: string;
  date: string;
  status: "pending" | "converted" | "expired";
  reward: string;
}

interface Tier {
  id: string;
  name: string;
  icon: React.ElementType;
  minVisits: number;
  minSpend: number;
  benefits: string[];
  members: number;
  color: string;
  bg: string;
  border: string;
  text: string;
}

/* =====================================================================
 * Demo data
 * ===================================================================== */

const COUPONS: Coupon[] = [
  {
    id: "cp1",
    code: "BLACKFRIDAY",
    desc: "2x1 en menú completo",
    type: "percent",
    value: "50%",
    validFrom: "2025-11-28",
    validTo: "2025-11-30",
    validDays: "Lun-Dom",
    validHours: "12:00-23:00",
    minOrder: 0,
    segment: "Todos",
    used: 89,
    limit: 100,
    perCustomer: 1,
    status: "active",
  },
  {
    id: "cp2",
    code: "CUMPLE15",
    desc: "15% descuento cumpleaños",
    type: "percent",
    value: "15%",
    validFrom: "2025-01-01",
    validTo: "2025-12-31",
    validDays: "Lun-Dom",
    validHours: "Todo el día",
    minOrder: 30,
    segment: "Cumpleañeros",
    used: 47,
    limit: 200,
    perCustomer: 1,
    status: "active",
  },
  {
    id: "cp3",
    code: "MEDIO14",
    desc: "Menú mediodía €14,50",
    type: "fixed",
    value: "€5",
    validFrom: "2025-09-01",
    validTo: "2025-12-31",
    validDays: "Lun-Jue",
    validHours: "13:00-16:00",
    minOrder: 20,
    segment: "Locales",
    used: 62,
    limit: 100,
    perCustomer: 4,
    status: "active",
  },
  {
    id: "cp4",
    code: "BOTELLAREGALO",
    desc: "Botella de vino gratis",
    type: "free_item",
    value: "Vino",
    validFrom: "2025-10-15",
    validTo: "2025-12-31",
    validDays: "Vie-Sáb",
    validHours: "20:00-23:30",
    minOrder: 80,
    segment: "VIP",
    used: 18,
    limit: 30,
    perCustomer: 1,
    status: "active",
  },
  {
    id: "cp5",
    code: "CENAVIP",
    desc: "Cena VIP para 2 personas",
    type: "experience",
    value: "Cena",
    validFrom: "2025-11-01",
    validTo: "2026-01-31",
    validDays: "Lun-Dom",
    validHours: "20:00-22:00",
    minOrder: 0,
    segment: "Diamond",
    used: 3,
    limit: 10,
    perCustomer: 1,
    status: "active",
  },
  {
    id: "cp6",
    code: "PRIMERAVEZ",
    desc: "10% en tu primera visita",
    type: "first_visit",
    value: "10%",
    validFrom: "2025-01-01",
    validTo: "2025-12-31",
    validDays: "Lun-Dom",
    validHours: "Todo el día",
    minOrder: 25,
    segment: "Nuevos",
    used: 28,
    limit: 500,
    perCustomer: 1,
    status: "active",
  },
  {
    id: "cp7",
    code: "VERANO25",
    desc: "Promo terraza verano",
    type: "percent",
    value: "25%",
    validFrom: "2025-06-01",
    validTo: "2025-08-31",
    validDays: "Lun-Dom",
    validHours: "13:00-18:00",
    minOrder: 0,
    segment: "Todos",
    used: 0,
    limit: 100,
    perCustomer: 2,
    status: "expired",
  },
  {
    id: "cp8",
    code: "REYES20",
    desc: "20% Reyes Magos",
    type: "percent",
    value: "20%",
    validFrom: "2026-01-05",
    validTo: "2026-01-06",
    validDays: "Lun-Dom",
    validHours: "13:00-23:00",
    minOrder: 0,
    segment: "Todos",
    used: 0,
    limit: 100,
    perCustomer: 1,
    status: "scheduled",
  },
];

const COUPON_TYPE_META: Record<CouponType, { label: string; icon: React.ElementType; cls: string }> = {
  percent: { label: "% Descuento", icon: Percent, cls: "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]" },
  fixed: { label: "Importe fijo", icon: Euro, cls: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]" },
  free_item: { label: "Artículo gratis", icon: Gift, cls: "border-rose-400/40 bg-rose-400/10 text-rose-300" },
  experience: { label: "Experiencia", icon: Star, cls: "border-violet-400/40 bg-violet-400/10 text-violet-300" },
  first_visit: { label: "1ª visita", icon: Sparkles, cls: "border-amber-400/40 bg-amber-400/10 text-amber-300" },
};

const COUPON_STATUS_META: Record<CouponStatus, { label: string; cls: string; dot: string }> = {
  active: { label: "Activo", cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300", dot: "bg-emerald-400" },
  scheduled: { label: "Programado", cls: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]", dot: "bg-[var(--teal)]" },
  paused: { label: "Pausado", cls: "border-amber-400/40 bg-amber-400/10 text-amber-300", dot: "bg-amber-400" },
  expired: { label: "Expirado", cls: "border-foreground/20 bg-foreground/5 text-muted-foreground", dot: "bg-foreground/40" },
};

const GIFT_CARDS: GiftCard[] = [
  {
    id: "gc1",
    code: "GC-2025-0142",
    amount: 100,
    balance: 65,
    purchaser: "María García",
    recipient: "Carlos Ruiz",
    date: "2025-10-15",
    expiry: "2026-10-15",
    status: "active",
    history: [
      { date: "2025-10-15", desc: "Compra gift card", amount: 100 },
      { date: "2025-10-22", desc: "Cena 2 personas", amount: -35 },
    ],
  },
  {
    id: "gc2",
    code: "GC-2025-0143",
    amount: 200,
    balance: 0,
    purchaser: "Ana López",
    recipient: "Pedro Martín",
    date: "2025-09-30",
    expiry: "2026-09-30",
    status: "redeemed",
    history: [
      { date: "2025-09-30", desc: "Compra gift card", amount: 200 },
      { date: "2025-10-05", desc: "Cena aniversario", amount: -180 },
      { date: "2025-10-12", desc: "Resto saldo", amount: -20 },
    ],
  },
  {
    id: "gc3",
    code: "GC-2025-0144",
    amount: 50,
    balance: 50,
    purchaser: "Luis Fernández",
    recipient: "Lucía Díaz",
    date: "2025-11-10",
    expiry: "2026-11-10",
    status: "active",
    history: [{ date: "2025-11-10", desc: "Compra gift card", amount: 50 }],
  },
  {
    id: "gc4",
    code: "GC-2024-0089",
    amount: 100,
    balance: 100,
    purchaser: "Elena Sanz",
    recipient: "Javier Molina",
    date: "2024-11-20",
    expiry: "2025-11-20",
    status: "expired",
    history: [{ date: "2024-11-20", desc: "Compra gift card", amount: 100 }],
  },
  {
    id: "gc5",
    code: "GC-2025-0145",
    amount: 150,
    balance: 150,
    purchaser: "Marta Vega",
    recipient: "Roberto Gil",
    date: "2025-11-18",
    expiry: "2026-11-18",
    status: "blocked",
    history: [
      { date: "2025-11-18", desc: "Compra gift card", amount: 150 },
      { date: "2025-11-22", desc: "Bloqueada por fraude sospechoso", amount: 0 },
    ],
  },
];

const GIFT_STATUS_META: Record<GiftCard["status"], { label: string; cls: string }> = {
  active: { label: "Activa", cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
  redeemed: { label: "Canjeada", cls: "border-foreground/20 bg-foreground/5 text-muted-foreground" },
  expired: { label: "Expirada", cls: "border-amber-400/40 bg-amber-400/10 text-amber-300" },
  blocked: { label: "Bloqueada", cls: "border-rose-400/40 bg-rose-400/10 text-rose-300" },
};

const TOP_REFERRERS: Referrer[] = [
  { id: "r1", name: "María García", code: "MARIA20", invites: 18, converted: 12, revenue: 1240, rewards: "€120" },
  { id: "r2", name: "Carlos Ruiz", code: "CARLOS10", invites: 14, converted: 9, revenue: 980, rewards: "€90" },
  { id: "r3", name: "Ana López", code: "ANA15", invites: 11, converted: 7, revenue: 720, rewards: "€70" },
  { id: "r4", name: "Pedro Martín", code: "PEDRO20", invites: 9, converted: 6, revenue: 620, rewards: "€60" },
  { id: "r5", name: "Lucía Díaz", code: "LUCIA25", invites: 7, converted: 5, revenue: 540, rewards: "€50" },
  { id: "r6", name: "Luis Fernández", code: "LUIS10", invites: 5, converted: 3, revenue: 320, rewards: "€30" },
  { id: "r7", name: "Elena Sanz", code: "ELENA20", invites: 4, converted: 2, revenue: 180, rewards: "€20" },
];

const RECENT_REFERRALS: Referral[] = [
  { id: "rf1", inviter: "María García", invitee: "Sofía M.", date: "Hace 2 días", status: "converted", reward: "€10 + 10%" },
  { id: "rf2", inviter: "Carlos Ruiz", invitee: "Diego F.", date: "Hace 4 días", status: "pending", reward: "— (pendiente)" },
  { id: "rf3", inviter: "Ana López", invitee: "Pablo R.", date: "Hace 6 días", status: "converted", reward: "€10 + 10%" },
  { id: "rf4", inviter: "Pedro Martín", invitee: "Nuria V.", date: "Hace 8 días", status: "expired", reward: "—" },
  { id: "rf5", inviter: "Lucía Díaz", invitee: "Iván S.", date: "Hace 10 días", status: "converted", reward: "€10 + 10%" },
];

const TIERS: Tier[] = [
  {
    id: "bronze",
    name: "Bronze",
    icon: Medal,
    minVisits: 0,
    minSpend: 0,
    benefits: ["1 punto por cada €10", "Ofertas mensuales"],
    members: 412,
    color: "#cd7f32",
    bg: "bg-orange-500/10",
    border: "border-orange-500/40",
    text: "text-orange-300",
  },
  {
    id: "silver",
    name: "Silver",
    icon: Award,
    minVisits: 5,
    minSpend: 250,
    benefits: ["1.5 puntos por €10", "Prioridad en reservas", "Cumpleaños 15%"],
    members: 234,
    color: "#c0c0c0",
    bg: "bg-slate-400/10",
    border: "border-slate-400/40",
    text: "text-slate-300",
  },
  {
    id: "gold",
    name: "Gold",
    icon: Crown,
    minVisits: 15,
    minSpend: 800,
    benefits: ["2 puntos por €10", "Terraza privada", "Cumpleaños postre gratis", "Invitado VIP"],
    members: 142,
    color: "#D4AF37",
    bg: "bg-[var(--gold)]/10",
    border: "border-[var(--gold)]/40",
    text: "text-[var(--gold-soft)]",
  },
  {
    id: "platinum",
    name: "Platinum",
    icon: Sparkles,
    minVisits: 30,
    minSpend: 2000,
    benefits: ["3 puntos por €10", "Maitre dedicado", "Acceso evento privado", "Cena anual gratis"],
    members: 47,
    color: "#3DD6C9",
    bg: "bg-[var(--teal)]/10",
    border: "border-[var(--teal)]/40",
    text: "text-[var(--teal)]",
  },
  {
    id: "diamond",
    name: "Diamond",
    icon: Star,
    minVisits: 50,
    minSpend: 5000,
    benefits: ["5 puntos por €10", "Mesa reservada 24/7", "Chef a domicilio", "Experiencias exclusivas"],
    members: 12,
    color: "#a78bfa",
    bg: "bg-violet-500/10",
    border: "border-violet-500/40",
    text: "text-violet-300",
  },
];

const POINTS_RULES = [
  { id: "pr1", spend: "100€", points: "10 pts", icon: DollarSign },
  { id: "pr2", points: "100 pts", reward: "Botella de vino", icon: Wine },
  { id: "pr3", points: "300 pts", reward: "Cena para 2", icon: UtensilsCrossed },
  { id: "pr4", points: "500 pts", reward: "Experiencia VIP", icon: Star },
];

const MILESTONES = [
  { id: "m1", points: 10, reward: "Descuento 5%", icon: Percent },
  { id: "m2", points: 50, reward: "Botella de vino", icon: Wine },
  { id: "m3", points: 100, reward: "Cena VIP para 2", icon: UtensilsCrossed },
  { id: "m4", points: 200, reward: "Experiencia chef", icon: Sparkles },
];

const REFERRAL_STATUS_META: Record<Referral["status"], { label: string; cls: string }> = {
  pending: { label: "Pendiente", cls: "border-amber-400/40 bg-amber-400/10 text-amber-300" },
  converted: { label: "Convertido", cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
  expired: { label: "Expirado", cls: "border-foreground/20 bg-foreground/5 text-muted-foreground" },
};

/* =====================================================================
 * Helpers
 * ===================================================================== */

function fmtEUR(n: number): string {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/* =====================================================================
 * Shared atoms
 * ===================================================================== */



function HeaderBar({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-light tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{desc}</p>
      </div>
      
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
  tone?: "default" | "amber" | "destructive" | "teal";
}) {
  const cls =
    tone === "amber"
      ? "text-amber-300 hover:bg-amber-400/10 border-amber-400/30"
      : tone === "destructive"
      ? "text-rose-300 hover:bg-rose-500/10 border-rose-500/30"
      : tone === "teal"
      ? "text-[var(--teal)] hover:bg-[var(--teal)]/10 border-[var(--teal)]/30"
      : "text-muted-foreground hover:bg-foreground/5 border-border/40";
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            aria-label={label}
            className={cn("inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors", cls)}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* =====================================================================
 * Main component
 * ===================================================================== */

export function GrowthPromotions() {
  const [tab, setTab] = React.useState("cupones");

  return (
    <div className="space-y-5 overflow-x-hidden">
      <HeaderBar
        title="Promociones"
        desc="Cupones, gift cards, programa de referidos y fidelización con tiers y gamificación."
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-foreground/[0.04] border border-border/60">
          <TabsTrigger value="cupones" className="data-[state=active]:bg-[var(--gold)]/10 data-[state=active]:text-[var(--gold-soft)] min-h-[40px]">
            <Ticket className="h-4 w-4 mr-1.5" /> Cupones
          </TabsTrigger>
          <TabsTrigger value="giftcards" className="data-[state=active]:bg-[var(--gold)]/10 data-[state=active]:text-[var(--gold-soft)] min-h-[40px]">
            <Gift className="h-4 w-4 mr-1.5" /> Gift Cards
          </TabsTrigger>
          <TabsTrigger value="referidos" className="data-[state=active]:bg-[var(--gold)]/10 data-[state=active]:text-[var(--gold-soft)] min-h-[40px]">
            <Users className="h-4 w-4 mr-1.5" /> Referidos
          </TabsTrigger>
          <TabsTrigger value="fidelizacion" className="data-[state=active]:bg-[var(--gold)]/10 data-[state=active]:text-[var(--gold-soft)] min-h-[40px]">
            <Crown className="h-4 w-4 mr-1.5" /> Fidelización
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cupones" className="mt-5">
          <CouponsTab />
        </TabsContent>
        <TabsContent value="giftcards" className="mt-5">
          <GiftCardsTab />
        </TabsContent>
        <TabsContent value="referidos" className="mt-5">
          <ReferralsTab />
        </TabsContent>
        <TabsContent value="fidelizacion" className="mt-5">
          <LoyaltyTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* =====================================================================
 * Tab 1 — Cupones
 * ===================================================================== */

function CouponsTab() {
  const reduce = useReducedMotion();
  const [items, setItems] = React.useState<Coupon[]>(COUPONS);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [deactivateId, setDeactivateId] = React.useState<string | null>(null);

  const analytics = [
    { id: "a1", label: "Redimidos", value: "247", tone: "default" as const, icon: Ticket },
    { id: "a2", label: "Ingresos", value: fmtEUR(4820), tone: "gold" as const, icon: DollarSign },
    { id: "a3", label: "Más popular", value: "BLACKFRIDAY (89)", tone: "teal" as const, icon: TrendingUp },
    { id: "a4", label: "ROI", value: "380%", tone: "gold" as const, icon: Sparkles },
  ];

  function deactivate() {
    if (!deactivateId) return;
    setItems((prev) => prev.map((c) => (c.id === deactivateId ? { ...c, status: "paused" } : c)));
    toast({ title: "Cupón desactivado", description: items.find((c) => c.id === deactivateId)?.code });
    setDeactivateId(null);
  }

  return (
    <div className="space-y-5">
      {/* Analytics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {analytics.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.div
              key={a.id}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
              className="rp-glass rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{a.label}</span>
                <Icon
                  className={cn(
                    "h-3.5 w-3.5",
                    a.tone === "gold" && "text-[var(--gold)]",
                    a.tone === "teal" && "text-[var(--teal)]",
                    a.tone === "default" && "text-muted-foreground"
                  )}
                />
              </div>
              <div className={cn(
                "mt-1.5 font-display text-xl font-light tabular-nums",
                a.tone === "gold" && "rp-gold-text",
                a.tone === "teal" && "rp-teal-text",
                a.tone === "default" && "text-foreground"
              )}>
                {a.value}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Coupons table */}
      <div className="rp-glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-border/60">
          <div>
            <h2 className="font-display text-lg">Cupones</h2>
            <p className="text-xs text-muted-foreground">{items.length} cupones · {items.filter((c) => c.status === "active").length} activos</p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] min-h-[40px]">
            <Plus className="h-4 w-4 mr-1.5" /> Crear cupón
          </Button>
        </div>
        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border/60">
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-3 py-3 font-medium">Tipo</th>
                <th className="px-3 py-3 font-medium hidden md:table-cell">Validez</th>
                <th className="px-3 py-3 font-medium hidden lg:table-cell">Días/Horas</th>
                <th className="px-3 py-3 font-medium text-right hidden xl:table-cell">Mín.</th>
                <th className="px-3 py-3 font-medium hidden md:table-cell">Segmento</th>
                <th className="px-3 py-3 font-medium text-right">Uso</th>
                <th className="px-3 py-3 font-medium text-right hidden lg:table-cell">Límite/cliente</th>
                <th className="px-3 py-3 font-medium">Estado</th>
                <th className="px-3 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => {
                const tMeta = COUPON_TYPE_META[c.type];
                const TIcon = tMeta.icon;
                const sMeta = COUPON_STATUS_META[c.status];
                const usagePct = c.limit > 0 ? Math.round((c.used / c.limit) * 100) : 0;
                return (
                  <tr key={c.id} className="border-b border-border/40 hover:bg-foreground/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { navigator.clipboard?.writeText(c.code); toast({ title: "Código copiado", description: c.code }); }}
                        className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground hover:text-[var(--gold)] transition-colors"
                      >
                        <Copy className="h-3 w-3 text-muted-foreground" />
                        {c.code}
                      </button>
                      <div className="text-[11px] text-muted-foreground mt-0.5 max-w-[180px] truncate">{c.desc}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono", tMeta.cls)}>
                        <TIcon className="h-3 w-3" />
                        {c.value}
                      </span>
                      <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">{tMeta.label}</div>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <div className="text-xs font-mono">{c.validFrom}</div>
                      <div className="text-[10px] text-muted-foreground">→ {c.validTo}</div>
                    </td>
                    <td className="px-3 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                      <div>{c.validDays}</div>
                      <div className="text-[10px]">{c.validHours}</div>
                    </td>
                    <td className="px-3 py-3 text-right hidden xl:table-cell font-mono tabular-nums">
                      {c.minOrder > 0 ? fmtEUR(c.minOrder) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell text-muted-foreground">{c.segment}</td>
                    <td className="px-3 py-3 text-right">
                      <div className="font-mono tabular-nums text-sm">{c.used}/{c.limit}</div>
                      <div className="mt-1 h-1 w-16 ml-auto rounded-full bg-foreground/10 overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", usagePct >= 80 ? "bg-rose-400" : usagePct >= 50 ? "bg-[var(--gold)]" : "bg-[var(--teal)]")}
                          style={{ width: `${Math.min(usagePct, 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right hidden lg:table-cell font-mono tabular-nums text-muted-foreground">{c.perCustomer}</td>
                    <td className="px-3 py-3">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider", sMeta.cls)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", sMeta.dot)} />
                        {sMeta.label}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconBtn icon={Eye} label="Ver uso" onClick={() => toast({ title: "Uso del cupón", description: `${c.code} · ${c.used} redenciones` })} />
                        <IconBtn icon={Copy} label="Duplicar" onClick={() => toast({ title: "Cupón duplicado", description: c.code })} />
                        {c.status === "active" ? (
                          <IconBtn icon={Ban} label="Desactivar" tone="amber" onClick={() => setDeactivateId(c.id)} />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <CreateCouponDialog open={createOpen} onOpenChange={setCreateOpen} />
      <AlertDialog open={!!deactivateId} onOpenChange={(o) => !o && setDeactivateId(null)}>
        <AlertDialogContent className="rp-glass-strong">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar cupón?</AlertDialogTitle>
            <AlertDialogDescription>
              El cupón dejará de ser canjeable inmediatamente. Podrás reactivarlo más tarde.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deactivate} className="bg-amber-500 text-black hover:bg-amber-400 min-h-[44px]">
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CreateCouponDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [code, setCode] = React.useState("");
  const [type, setType] = React.useState<CouponType>("percent");
  const [value, setValue] = React.useState("15");
  const [limit, setLimit] = React.useState("100");
  const [validFrom, setValidFrom] = React.useState("2025-12-01");
  const [validTo, setValidTo] = React.useState("2025-12-31");
  const [segment, setSegment] = React.useState("Todos");

  function submit() {
    if (!code.trim() || !value.trim()) {
      toast({ title: "Faltan campos", description: "Código y valor son obligatorios.", variant: "destructive" });
      return;
    }
    toast({ title: "Cupón creado", description: `${code} · ${value}${type === "percent" ? "%" : ""}` });
    setCode(""); setValue("15"); setLimit("100");
    onOpenChange(false);
  }

  const tMeta = COUPON_TYPE_META[type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rp-glass-strong sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear cupón</DialogTitle>
          <DialogDescription>Configura el cupón y previsualiza cómo lo verán los clientes.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-1">
          {/* Form */}
          <div className="space-y-3 max-h-[60vh] overflow-y-auto rp-scroll-thin pr-1">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Código</label>
              <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Ej. NAVIDAD20" className="bg-foreground/[0.04] font-mono min-h-[44px]" maxLength={20} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Tipo</label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(COUPON_TYPE_META) as CouponType[]).map((t) => {
                  const M = COUPON_TYPE_META[t];
                  const I = M.icon;
                  const active = type === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      aria-pressed={active}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-2 text-xs transition-colors min-h-[40px]",
                        active ? cn(M.cls, "ring-1") : "border-border/40 bg-foreground/[0.03] text-muted-foreground hover:border-foreground/30"
                      )}
                    >
                      <I className="h-3 w-3" /> {M.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Valor</label>
                <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="15" className="bg-foreground/[0.04] min-h-[44px]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Uso total</label>
                <Input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} className="bg-foreground/[0.04] min-h-[44px]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Desde</label>
                <Input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} className="bg-foreground/[0.04] min-h-[44px]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Hasta</label>
                <Input type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} className="bg-foreground/[0.04] min-h-[44px]" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Segmento</label>
              <select value={segment} onChange={(e) => setSegment(e.target.value)} className="bg-foreground/[0.04] border border-border/40 rounded-md px-2 py-2 text-xs w-full min-h-[44px]">
                <option>Todos</option>
                <option>VIP</option>
                <option>Frecuentes</option>
                <option>Nuevos</option>
                <option>Dormidos</option>
                <option>Cumpleañeros</option>
              </select>
            </div>
          </div>

          {/* Live preview */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Previsualización</span>
            <div className="rounded-2xl border border-[var(--gold)]/40 bg-gradient-to-br from-[var(--gold)]/[0.08] to-transparent p-5 text-center">
              <div className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider mb-3", tMeta.cls)}>
                <tMeta.icon className="h-3 w-3" />
                {tMeta.label}
              </div>
              <div className="font-display text-4xl font-light rp-gold-text tabular-nums">
                {value || "0"}{type === "percent" && "%"}
              </div>
              <div className="mt-2 font-mono text-sm tracking-widest text-foreground/80">
                {code || "TU-CODIGO"}
              </div>
              <div className="mt-3 text-[11px] text-muted-foreground">
                Válido {validFrom || "—"} → {validTo || "—"}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {segment} · {limit || "∞"} usos totales
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="min-h-[44px]">Cancelar</Button>
          <Button onClick={submit} className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] min-h-[44px]">Crear cupón</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =====================================================================
 * Tab 2 — Gift Cards
 * ===================================================================== */

function GiftCardsTab() {
  const reduce = useReducedMotion();
  const [sellOpen, setSellOpen] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState<string | null>("gc1");
  const [blockId, setBlockId] = React.useState<string | null>(null);

  const analytics = [
    { id: "a1", label: "Vendidas", value: "47", tone: "default" as const, icon: Gift },
    { id: "a2", label: "Saldo activo", value: fmtEUR(3200), tone: "gold" as const, icon: DollarSign },
    { id: "a3", label: "Canjeadas", value: fmtEUR(1840), tone: "teal" as const, icon: Check },
    { id: "a4", label: "Caducan 30d", value: "3", tone: "default" as const, icon: Calendar },
  ];

  function block() {
    if (!blockId) return;
    toast({ title: "Gift card bloqueada", description: GIFT_CARDS.find((g) => g.id === blockId)?.code });
    setBlockId(null);
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {analytics.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.div
              key={a.id}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
              className="rp-glass rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{a.label}</span>
                <Icon
                  className={cn(
                    "h-3.5 w-3.5",
                    a.tone === "gold" && "text-[var(--gold)]",
                    a.tone === "teal" && "text-[var(--teal)]",
                    a.tone === "default" && "text-muted-foreground"
                  )}
                />
              </div>
              <div className={cn(
                "mt-1.5 font-display text-xl font-light tabular-nums",
                a.tone === "gold" && "rp-gold-text",
                a.tone === "teal" && "rp-teal-text",
                a.tone === "default" && "text-foreground"
              )}>
                {a.value}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="rp-glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-border/60">
          <div>
            <h2 className="font-display text-lg">Gift cards</h2>
            <p className="text-xs text-muted-foreground">{GIFT_CARDS.length} tarjetas · {GIFT_CARDS.filter((g) => g.status === "active").length} activas</p>
          </div>
          <Button onClick={() => setSellOpen(true)} className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] min-h-[40px]">
            <Plus className="h-4 w-4 mr-1.5" /> Vender gift card
          </Button>
        </div>
        <ul>
          {GIFT_CARDS.map((g) => {
            const sMeta = GIFT_STATUS_META[g.status];
            const expanded = expandedId === g.id;
            const usagePct = g.amount > 0 ? Math.round(((g.amount - g.balance) / g.amount) * 100) : 0;
            return (
              <li key={g.id} className="border-b border-border/40 last:border-b-0">
                <div className="p-4 hover:bg-foreground/[0.02] transition-colors">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Card visual */}
                    <div className="rounded-lg border border-[var(--gold)]/40 bg-gradient-to-br from-[var(--gold)]/[0.1] to-transparent p-3 w-full sm:w-40 shrink-0">
                      <div className="flex items-center justify-between">
                        <Gift className="h-4 w-4 text-[var(--gold)]" />
                        <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">RestoPanel</span>
                      </div>
                      <div className="mt-2 font-display text-xl rp-gold-text tabular-nums">{fmtEUR(g.balance)}</div>
                      <div className="font-mono text-[10px] text-foreground/70 tracking-wider mt-1">{g.code}</div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <KV label="Comprador" value={g.purchaser} />
                      <KV label="Destinatario" value={g.recipient} />
                      <KV label="Compra" value={g.date} />
                      <KV label="Caduca" value={g.expiry} />
                    </div>

                    {/* Balance bar */}
                    <div className="w-full sm:w-32 shrink-0">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Saldo</div>
                      <div className="font-display text-lg tabular-nums">{fmtEUR(g.balance)}</div>
                      <div className="text-[10px] text-muted-foreground">de {fmtEUR(g.amount)}</div>
                      <div className="mt-1 h-1 w-full rounded-full bg-foreground/10 overflow-hidden">
                        <div className="h-full bg-[var(--teal)] rounded-full" style={{ width: `${100 - usagePct}%` }} />
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider", sMeta.cls)}>
                        {sMeta.label}
                      </span>
                      <div className="flex items-center gap-1">
                        <IconBtn icon={ChevronDown} label="Ver historial" onClick={() => setExpandedId(expanded ? null : g.id)} />
                        <IconBtn icon={Ban} label="Bloquear" tone="destructive" onClick={() => setBlockId(g.id)} />
                        <IconBtn icon={RotateCcw} label="Reembolsar" tone="teal" onClick={() => toast({ title: "Reembolso solicitado", description: g.code })} />
                      </div>
                    </div>
                  </div>
                </div>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={reduce ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={reduce ? undefined : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 bg-foreground/[0.02]">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Historial de uso</div>
                        <ul className="space-y-1.5">
                          {g.history.map((h, idx) => (
                            <li key={idx} className="flex items-center justify-between gap-2 text-xs">
                              <span className="font-mono text-muted-foreground shrink-0 w-24">{h.date}</span>
                              <span className="flex-1 truncate">{h.desc}</span>
                              <span className={cn("font-mono tabular-nums shrink-0", h.amount > 0 ? "text-[var(--teal)]" : h.amount < 0 ? "text-foreground" : "text-muted-foreground")}>
                                {h.amount > 0 ? "+" : ""}{fmtEUR(h.amount)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>

      <SellGiftCardDialog open={sellOpen} onOpenChange={setSellOpen} />
      <AlertDialog open={!!blockId} onOpenChange={(o) => !o && setBlockId(null)}>
        <AlertDialogContent className="rp-glass-strong">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Bloquear gift card?</AlertDialogTitle>
            <AlertDialogDescription>
              La tarjeta quedará bloqueada y no podrá canjearse. El saldo quedará retenido para revisión.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={block} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-h-[44px]">
              Bloquear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-medium truncate">{value}</div>
    </div>
  );
}

function SellGiftCardDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [amount, setAmount] = React.useState<number>(100);
  const [custom, setCustom] = React.useState("");
  const [purchaser, setPurchaser] = React.useState("");
  const [recipient, setRecipient] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [expiry, setExpiry] = React.useState("12");

  function submit() {
    if (!purchaser.trim() || !recipient.trim()) {
      toast({ title: "Faltan campos", description: "Comprador y destinatario son obligatorios.", variant: "destructive" });
      return;
    }
    const finalAmount = amount === 0 && custom ? Number(custom) : amount;
    toast({ title: "Gift card vendida", description: `${fmtEUR(finalAmount)} · ${recipient}` });
    setPurchaser(""); setRecipient(""); setMessage(""); setCustom("");
    onOpenChange(false);
  }

  const displayAmount = amount === 0 && custom ? (Number(custom) || 0) : amount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rp-glass-strong sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Vender gift card</DialogTitle>
          <DialogDescription>Genera una gift card y envíala al destinatario.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-1 max-h-[60vh] overflow-y-auto rp-scroll-thin pr-1">
          {/* Amount preset */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Importe</label>
            <div className="flex flex-wrap gap-1.5">
              {[50, 100, 200].map((a) => (
                <button
                  key={a}
                  onClick={() => { setAmount(a); setCustom(""); }}
                  aria-pressed={amount === a && !custom}
                  className={cn(
                    "inline-flex items-center rounded-md border px-3 py-2 text-sm font-mono transition-colors min-h-[40px]",
                    amount === a && !custom
                      ? "border-[var(--gold)]/50 bg-[var(--gold)]/10 text-[var(--gold-soft)]"
                      : "border-border/40 bg-foreground/[0.03] text-muted-foreground hover:border-foreground/30"
                  )}
                >
                  {fmtEUR(a)}
                </button>
              ))}
              <div className={cn(
                "inline-flex items-center rounded-md border overflow-hidden",
                amount === 0 ? "border-[var(--gold)]/50 bg-[var(--gold)]/10" : "border-border/40"
              )}>
                <input
                  type="number"
                  value={custom}
                  onChange={(e) => { setCustom(e.target.value); setAmount(0); }}
                  placeholder="Otro"
                  className="w-20 bg-transparent px-3 py-2 text-sm font-mono outline-none min-h-[40px]"
                  aria-label="Importe personalizado"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Comprador</label>
              <Input value={purchaser} onChange={(e) => setPurchaser(e.target.value)} placeholder="Nombre" className="bg-foreground/[0.04] min-h-[44px]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Destinatario</label>
              <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Nombre / email" className="bg-foreground/[0.04] min-h-[44px]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Mensaje</label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} placeholder="Mensaje opcional para el destinatario" className="bg-foreground/[0.04] min-h-[60px] resize-none" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Validez (meses)</label>
            <select value={expiry} onChange={(e) => setExpiry(e.target.value)} className="bg-foreground/[0.04] border border-border/40 rounded-md px-2 py-2 text-xs w-full min-h-[44px]">
              <option value="6">6 meses</option>
              <option value="12">12 meses</option>
              <option value="24">24 meses</option>
            </select>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-[var(--gold)]/40 bg-gradient-to-br from-[var(--gold)]/[0.08] to-transparent p-4 text-center">
            <Gift className="h-5 w-5 text-[var(--gold)] mx-auto mb-1" />
            <div className="font-display text-3xl font-light rp-gold-text tabular-nums">{fmtEUR(displayAmount)}</div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {recipient ? `Para ${recipient}` : "Para: —"} · {expiry} meses
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="min-h-[44px]">Cancelar</Button>
          <Button onClick={submit} className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] min-h-[44px]">Vender gift card</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =====================================================================
 * Tab 3 — Referidos
 * ===================================================================== */

function ReferralsTab() {
  const reduce = useReducedMotion();
  const [configOpen, setConfigOpen] = React.useState(false);

  const analytics = [
    { id: "a1", label: "Activos", value: "34", tone: "gold" as const, icon: Users },
    { id: "a2", label: "Total referidos", value: "89", tone: "default" as const, icon: Ticket },
    { id: "a3", label: "Convertidos", value: "52 (58%)", tone: "teal" as const, icon: Check },
    { id: "a4", label: "Ingresos", value: fmtEUR(4680), tone: "gold" as const, icon: DollarSign },
    { id: "a5", label: "Coste", value: fmtEUR(520), tone: "default" as const, icon: TrendingUp },
    { id: "a6", label: "ROI", value: "900%", tone: "teal" as const, icon: Sparkles },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {analytics.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.div
              key={a.id}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
              className="rp-glass rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{a.label}</span>
                <Icon
                  className={cn(
                    "h-3.5 w-3.5",
                    a.tone === "gold" && "text-[var(--gold)]",
                    a.tone === "teal" && "text-[var(--teal)]",
                    a.tone === "default" && "text-muted-foreground"
                  )}
                />
              </div>
              <div className={cn(
                "mt-1.5 font-display text-xl font-light tabular-nums",
                a.tone === "gold" && "rp-gold-text",
                a.tone === "teal" && "rp-teal-text",
                a.tone === "default" && "text-foreground"
              )}>
                {a.value}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Program overview */}
      <div className="rp-glass rounded-2xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display text-lg">Programa de referidos</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Configuración actual del programa</p>
          </div>
          <Button variant="outline" onClick={() => setConfigOpen(true)} className="min-h-[40px] border-[var(--gold)]/40 text-[var(--gold-soft)] hover:bg-[var(--gold)]/10">
            <Settings2 className="h-3.5 w-3.5 mr-1.5" /> Configurar programa
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/[0.06] p-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)]">Formato del código</div>
            <div className="font-display text-2xl mt-1">MARIA20</div>
            <div className="text-[11px] text-muted-foreground mt-1">Nombre + descuento</div>
          </div>
          <div className="rounded-xl border border-[var(--teal)]/30 bg-[var(--teal)]/[0.06] p-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]">Invitador recibe</div>
            <div className="font-display text-2xl mt-1 rp-teal-text tabular-nums">€10</div>
            <div className="text-[11px] text-muted-foreground mt-1">Por cada referido convertido</div>
          </div>
          <div className="rounded-xl border border-foreground/15 bg-foreground/[0.03] p-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Invitado recibe</div>
            <div className="font-display text-2xl mt-1">10%</div>
            <div className="text-[11px] text-muted-foreground mt-1">Descuento en primera visita</div>
          </div>
        </div>

        {/* Anti-fraud note */}
        <div className="mt-4 rounded-md border border-amber-400/30 bg-amber-400/[0.06] p-3 flex gap-2.5">
          <ShieldCheck className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" />
          <div className="text-xs text-foreground/80 leading-relaxed">
            <strong className="text-amber-300">Protección anti-fraude:</strong> previene auto-referidos (valida email + teléfono), valida primer consumo antes de liberar beneficios, y revierte beneficios automáticamente ante detección de fraude.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top referrers */}
        <div className="rp-glass rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border/60">
            <h3 className="font-display text-base">Top referrers</h3>
            <p className="text-xs text-muted-foreground">Los 7 clientes que más refieren</p>
          </div>
          <div className="overflow-x-auto rp-scroll-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border/40">
                  <th className="px-4 py-2.5 font-medium">#</th>
                  <th className="px-3 py-2.5 font-medium">Cliente</th>
                  <th className="px-3 py-2.5 font-medium">Código</th>
                  <th className="px-3 py-2.5 font-medium text-right">Inv.</th>
                  <th className="px-3 py-2.5 font-medium text-right">Conv.</th>
                  <th className="px-3 py-2.5 font-medium text-right hidden sm:table-cell">Ingresos</th>
                  <th className="px-3 py-2.5 font-medium text-right">Premio</th>
                </tr>
              </thead>
              <tbody>
                {TOP_REFERRERS.map((r, idx) => (
                  <tr key={r.id} className="border-b border-border/30 last:border-b-0 hover:bg-foreground/[0.02] transition-colors">
                    <td className="px-4 py-2.5">
                      <span className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-mono",
                        idx === 0 ? "bg-[var(--gold)]/20 text-[var(--gold-soft)]" : "bg-foreground/5 text-muted-foreground"
                      )}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-medium">{r.name}</td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => { navigator.clipboard?.writeText(r.code); toast({ title: "Código copiado", description: r.code }); }}
                        className="inline-flex items-center gap-1 font-mono text-xs text-[var(--teal)] hover:underline"
                      >
                        <Copy className="h-3 w-3" />{r.code}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{r.invites}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{r.converted}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums hidden sm:table-cell font-mono">{fmtEUR(r.revenue)}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-[var(--gold-soft)] tabular-nums">{r.rewards}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent referrals */}
        <div className="rp-glass rounded-2xl p-4">
          <h3 className="font-display text-base mb-1">Referidos recientes</h3>
          <p className="text-xs text-muted-foreground mb-3">Últimos 7 días</p>
          <ul className="space-y-2 max-h-96 overflow-y-auto rp-scroll-thin pr-1">
            {RECENT_REFERRALS.map((r) => {
              const sMeta = REFERRAL_STATUS_META[r.status];
              return (
                <li key={r.id} className="rounded-md border border-border/40 bg-foreground/[0.02] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm">
                        <span className="font-medium">{r.inviter}</span>
                        <ChevronRight className="inline h-3 w-3 mx-1 text-muted-foreground" />
                        <span className="text-muted-foreground">{r.invitee}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{r.date}</div>
                    </div>
                    <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider shrink-0", sMeta.cls)}>
                      {sMeta.label}
                    </span>
                  </div>
                  {r.status === "converted" && (
                    <div className="mt-1.5 text-[11px] text-[var(--teal)] flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Beneficio otorgado: {r.reward}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <ReferralConfigDialog open={configOpen} onOpenChange={setConfigOpen} />
    </div>
  );
}

function ReferralConfigDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [inviterReward, setInviterReward] = React.useState("10");
  const [inviteeReward, setInviteeReward] = React.useState("10");
  const [autoRevert, setAutoRevert] = React.useState(true);

  function submit() {
    toast({ title: "Programa actualizado", description: `Invitador €${inviterReward} · Invitado ${inviteeReward}%` });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rp-glass-strong sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar programa de referidos</DialogTitle>
          <DialogDescription>Define los beneficios y las reglas anti-fraude.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Invitador (€)</label>
              <Input type="number" value={inviterReward} onChange={(e) => setInviterReward(e.target.value)} className="bg-foreground/[0.04] min-h-[44px]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Invitado (%)</label>
              <Input type="number" value={inviteeReward} onChange={(e) => setInviteeReward(e.target.value)} className="bg-foreground/[0.04] min-h-[44px]" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-md border border-border/40 bg-foreground/[0.02] p-3">
            <div className="min-w-0">
              <div className="text-sm font-medium">Reversión automática anti-fraude</div>
              <div className="text-[11px] text-muted-foreground">Revierte beneficios si se detecta auto-referido o cancelación antes de consumo.</div>
            </div>
            <Switch checked={autoRevert} onCheckedChange={setAutoRevert} aria-label="Reversión automática" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="min-h-[44px]">Cancelar</Button>
          <Button onClick={submit} className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] min-h-[44px]">Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =====================================================================
 * Tab 4 — Fidelización
 * ===================================================================== */

function LoyaltyTab() {
  const reduce = useReducedMotion();

  const analytics = [
    { id: "a1", label: "Miembros", value: "847", tone: "gold" as const, icon: Users },
    { id: "a2", label: "Activos 30d", value: "412", tone: "teal" as const, icon: Check },
    { id: "a3", label: "Pts media", value: "14.6", tone: "default" as const, icon: Sparkles },
    { id: "a4", label: "Redención", value: "66%", tone: "teal" as const, icon: RotateCcw },
    { id: "a5", label: "Tier top", value: "Gold (89)", tone: "gold" as const, icon: Crown },
  ];

  return (
    <div className="space-y-5">
      {/* Analytics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {analytics.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.div
              key={a.id}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
              className="rp-glass rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{a.label}</span>
                <Icon
                  className={cn(
                    "h-3.5 w-3.5",
                    a.tone === "gold" && "text-[var(--gold)]",
                    a.tone === "teal" && "text-[var(--teal)]",
                    a.tone === "default" && "text-muted-foreground"
                  )}
                />
              </div>
              <div className={cn(
                "mt-1.5 font-display text-xl font-light tabular-nums",
                a.tone === "gold" && "rp-gold-text",
                a.tone === "teal" && "rp-teal-text",
                a.tone === "default" && "text-foreground"
              )}>
                {a.value}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tiers */}
      <div className="rp-glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg">Niveles de fidelización</h2>
            <p className="text-xs text-muted-foreground mt-0.5">5 tiers escalonados · del Bronze al Diamond</p>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto rp-scroll-thin pb-2 -mx-1 px-1">
          {TIERS.map((t, idx) => {
            const I = t.icon;
            return (
              <motion.div
                key={t.id}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.06, 0.4) }}
                className={cn(
                  "min-w-[220px] shrink-0 rounded-2xl border p-4 flex flex-col",
                  t.bg, t.border
                )}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center border"
                    style={{ borderColor: t.color, background: `${t.color}20` }}
                  >
                    <I className="h-5 w-5" style={{ color: t.color }} />
                  </div>
                  <span className={cn("font-display text-lg", t.text)}>{t.name}</span>
                </div>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Visitas mín.</span>
                    <span className="font-mono tabular-nums">{t.minVisits}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Gasto mín.</span>
                    <span className="font-mono tabular-nums">{fmtEUR(t.minSpend)}</span>
                  </div>
                </div>
                <ul className="mt-3 space-y-1 text-[11px] text-foreground/80 flex-1">
                  {t.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Check className="h-3 w-3 mt-0.5 shrink-0" style={{ color: t.color }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 pt-3 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Miembros</span>
                    <span className={cn("font-display text-lg tabular-nums", t.text)}>{t.members}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 min-h-[36px] border-border/40"
                  onClick={() => toast({ title: "Configurar tier", description: t.name })}
                >
                  <Settings2 className="h-3 w-3 mr-1.5" /> Configurar
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Points system + Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Points system */}
        <div className="rp-glass rounded-2xl p-5">
          <h3 className="font-display text-base mb-1">Sistema de puntos</h3>
          <p className="text-xs text-muted-foreground mb-4">Acumula y canjea puntos</p>
          <ul className="space-y-2">
            {POINTS_RULES.map((r) => {
              const I = r.icon;
              return (
                <li key={r.id} className="flex items-center gap-3 rounded-md border border-border/40 bg-foreground/[0.02] p-3">
                  <div className="h-9 w-9 rounded-md bg-[var(--gold)]/15 flex items-center justify-center shrink-0">
                    <I className="h-4 w-4 text-[var(--gold)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">
                      {"spend" in r ? r.spend : r.points}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {"reward" in r ? `→ ${r.reward}` : `→ ${r.points}`}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </li>
              );
            })}
          </ul>
        </div>

        {/* Gamification milestones */}
        <div className="rp-glass rounded-2xl p-5">
          <h3 className="font-display text-base mb-1">Hitos de gamificación</h3>
          <p className="text-xs text-muted-foreground mb-4">Recompensas al alcanzar puntos</p>
          <div className="space-y-3">
            {MILESTONES.map((m, idx) => {
              const I = m.icon;
              const pct = Math.min((m.points / 200) * 100, 100);
              return (
                <div key={m.id}>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-[var(--teal)]/15 flex items-center justify-center shrink-0">
                      <I className="h-4 w-4 text-[var(--teal)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{m.reward}</span>
                        <span className="font-mono text-xs text-muted-foreground tabular-nums">{m.points} pts</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full rounded-full bg-foreground/10 overflow-hidden">
                        <motion.div
                          initial={reduce ? false : { width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
                          className="h-full bg-gradient-to-r from-[var(--gold)] to-[var(--teal)] rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
