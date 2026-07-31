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
import { toast } from "@/hooks/use-toast";
import {
  Search, ShieldCheck, BadgeCheck, Star, Download, Settings2, Trash2,
  Package, Plus, Eye, Send, Copy, Check, RotateCcw, Webhook, KeyRound,
  TrendingUp, CreditCard, FileDown, ChevronRight, ChevronDown,
  Sparkles, Store, Code2, DollarSign, Clock, CheckCircle2, AlertCircle,
  Loader2, ArrowUpRight, ArrowRight, Activity, Boxes, FlaskConical,
  Wallet, Banknote, Calendar, ExternalLink, Lock, Zap, Users,
  BarChart3, MessageSquare, Mail, Smartphone, Bot, Truck, Brain,
  Receipt, Gift, LayoutGrid, Cpu, Globe, RefreshCw, Pause, Play,
  FileText, Stethoscope, Building2, Image as ImageIcon,
} from "lucide-react";

/* =====================================================================
 * Tipos
 * ===================================================================== */

type Verification = "oficial" | "verificado" | "no-verificado";
type PricingModel = "free" | "subscription" | "one-time" | "usage";
type AppStatus = "published" | "review" | "draft" | "paused";
type DevPlan = "starter" | "professional" | "enterprise";

interface DevApp {
  id: string;
  name: string;
  developer: string;
  verification: Verification;
  category: string;
  rating: number;
  reviews: number;
  price: string;
  pricingModel: PricingModel;
  installs: string;
  description: string;
  longDescription: string;
  version: string;
  scopes: string[];
  iconColor: string;
  iconInitials: string;
  changelog: { version: string; date: string; notes: string[] }[];
  screenshots: number;
}

interface OwnedApp {
  id: string;
  name: string;
  category: string;
  status: AppStatus;
  version: string;
  installs: number;
  revenue: number;
  rating: number;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending";
}

interface SandboxLog {
  ts: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  status: number;
  latency: number;
}

/* =====================================================================
 * Datos demo
 * ===================================================================== */

const CATEGORIES = [
  "Widgets", "Dashboards", "Analytics", "TPV", "ERP", "Marketing",
  "Contabilidad", "WhatsApp", "SMS", "Email", "Loyalty", "IoT",
  "Robots", "Delivery", "POS", "BI", "RRHH", "Finanzas", "IA",
];

const SCOPES = [
  "read:reservations",
  "write:reservations",
  "read:customers",
  "write:customers",
  "read:menu",
  "write:menu",
  "read:billing",
  "send:messages",
  "read:reviews",
  "manage:tables",
  "read:analytics",
  "read:staff",
];

const APPS: DevApp[] = [
  {
    id: "app_google_reviews_ai",
    name: "Google Reviews AI Pro",
    developer: "Google · Oficial",
    verification: "oficial",
    category: "IA",
    rating: 4.7,
    reviews: 89,
    price: "Gratis",
    pricingModel: "free",
    installs: "3.4k instalaciones",
    description: "Respuestas automáticas avanzadas con IA + sentimiento + traducción",
    longDescription:
      "Respuestas automáticas a reseñas de Google Business Profile con análisis de sentimiento, detección de urgencia, traducción multilingüe y firma personalizable. Integra tu Voz de Marca y mide el impacto en reputación. Incluye panel de control y alertas para reseñas negativas.",
    version: "v2.4.1",
    scopes: ["read:reviews", "send:messages"],
    iconColor: "from-amber-400 to-yellow-600",
    iconInitials: "GR",
    changelog: [
      { version: "v2.4.1", date: "12 ene 2025", notes: ["Detección de urgencia mejorada", "Soporte para 24 idiomas"] },
      { version: "v2.4.0", date: "28 dic 2024", notes: ["Análisis de sentimiento con Transformers", "Plantillas personalizables"] },
      { version: "v2.3.0", date: "10 nov 2024", notes: ["Lanzamiento inicial en marketplace"] },
    ],
    screenshots: 3,
  },
  {
    id: "app_whatsapp_business",
    name: "WhatsApp Business Suite",
    developer: "Meta · Verificado",
    verification: "verificado",
    category: "WhatsApp",
    rating: 4.5,
    reviews: 127,
    price: "€29/mes",
    pricingModel: "subscription",
    installs: "5.1k instalaciones",
    description: "Plantillas, sesiones, catálogo, pagos por WhatsApp",
    longDescription:
      "Suite completa para WhatsApp Business Cloud API: plantillas HSM aprobadas, sesiones de 24h, catálogo de productos, pagos integrados con Stripe, alias de mesa y respuestas automáticas con IA. Cumple con políticas de Meta y GDPR.",
    version: "v3.1.2",
    scopes: ["read:reservations", "write:reservations", "read:customers", "send:messages"],
    iconColor: "from-emerald-400 to-teal-600",
    iconInitials: "WA",
    changelog: [
      { version: "v3.1.2", date: "8 ene 2025", notes: ["Pagos integrados con Stripe", "Sesiones con expiración automática"] },
      { version: "v3.1.0", date: "20 dic 2024", notes: ["Plantillas HSM con variables dinámicas"] },
    ],
    screenshots: 4,
  },
  {
    id: "app_lightspeed_pos",
    name: "Lightspeed POS Bridge",
    developer: "Lightspeed · Verificado",
    verification: "verificado",
    category: "TPV",
    rating: 4.3,
    reviews: 45,
    price: "€39/mes",
    pricingModel: "subscription",
    installs: "1.8k instalaciones",
    description: "Sincronización bidireccional con Lightspeed POS",
    longDescription:
      "Conector bidireccional con Lightspeed Restaurant POS. Sincroniza comandas, pagos, modificadores, familias de producto y cierre de caja en tiempo real. Soporta multi-local y conciliación automática de propinas.",
    version: "v1.8.0",
    scopes: ["read:menu", "read:billing", "manage:tables"],
    iconColor: "from-orange-400 to-rose-600",
    iconInitials: "LP",
    changelog: [
      { version: "v1.8.0", date: "5 ene 2025", notes: ["Sincronización de propinas", "Multi-local concurrente"] },
      { version: "v1.7.0", date: "15 dic 2024", notes: ["Webhooks de cierre de caja"] },
    ],
    screenshots: 3,
  },
  {
    id: "app_stripe_sync",
    name: "Stripe Sync",
    developer: "Stripe · Oficial",
    verification: "oficial",
    category: "Finanzas",
    rating: 4.8,
    reviews: 212,
    price: "Desde €19/mes",
    pricingModel: "subscription",
    installs: "8.2k instalaciones",
    description: "Sincroniza cobros, reembolsos y conciliación bancaria",
    longDescription:
      "Integración nativa con Stripe: sincronización de cobros, reembolsos, disputas y conciliación bancaria automática. Soporta Stripe Connect para plataformas multi-local y reportes fiscales por jurisdicción.",
    version: "v4.0.2",
    scopes: ["read:billing", "read:customers"],
    iconColor: "from-violet-400 to-purple-600",
    iconInitials: "ST",
    changelog: [
      { version: "v4.0.2", date: "10 ene 2025", notes: ["Stripe Connect multi-local", "Reportes fiscales UE"] },
    ],
    screenshots: 4,
  },
  {
    id: "app_uber_eats",
    name: "Uber Eats Hub",
    developer: "Uber · Verificado",
    verification: "verificado",
    category: "Delivery",
    rating: 4.2,
    reviews: 78,
    price: "€25/mes",
    pricingModel: "subscription",
    installs: "2.3k instalaciones",
    description: "Sincroniza menú, pedidos y estado de delivery",
    longDescription:
      "Conector con Uber Eats API: sincronización de catálogo, pedidos entrantes, estado de delivery en tiempo real, auto-aceptación configurable y consolidación de cobros.",
    version: "v2.0.1",
    scopes: ["read:menu", "write:menu", "read:billing"],
    iconColor: "from-lime-400 to-emerald-600",
    iconInitials: "UE",
    changelog: [
      { version: "v2.0.1", date: "3 ene 2025", notes: ["Auto-aceptación configurable"] },
    ],
    screenshots: 3,
  },
  {
    id: "app_forecast_ia",
    name: "Forecast IA",
    developer: "RestoPanel Labs",
    verification: "oficial",
    category: "IA",
    rating: 4.6,
    reviews: 56,
    price: "€49/mes",
    pricingModel: "subscription",
    installs: "1.1k instalaciones",
    description: "Predicción de demanda y ocupación con modelos ML",
    longDescription:
      "Predicción de demanda por hora, día y servicio usando modelos de gradient boosting con datos históricos, eventos locales, clima y estacionalidad. Incluye panel de precisión y bandas de confianza.",
    version: "v1.5.0",
    scopes: ["read:analytics", "read:reservations"],
    iconColor: "from-cyan-400 to-teal-600",
    iconInitials: "FC",
    changelog: [
      { version: "v1.5.0", date: "9 ene 2025", notes: ["Modelo con clima integrado", "Bandas de confianza P10-P90"] },
    ],
    screenshots: 4,
  },
  {
    id: "app_gift_cards_pro",
    name: "Gift Cards Pro",
    developer: "Giftery",
    verification: "verificado",
    category: "Loyalty",
    rating: 4.4,
    reviews: 92,
    price: "€15/mes",
    pricingModel: "subscription",
    installs: "2.7k instalaciones",
    description: "Tarjetas regalo digitales con QR y control de saldo",
    longDescription:
      "Emisión y canje de tarjetas regalo digitales con QR único, control de saldo en tiempo real, caducidad configurable y reportes fiscales. Compatible con Apple Wallet y Google Wallet.",
    version: "v2.2.0",
    scopes: ["read:customers", "read:billing"],
    iconColor: "from-pink-400 to-rose-600",
    iconInitials: "GC",
    changelog: [
      { version: "v2.2.0", date: "7 ene 2025", notes: ["Apple Wallet y Google Wallet", "QR con firma HMAC"] },
    ],
    screenshots: 3,
  },
  {
    id: "app_kitchen_display",
    name: "Kitchen Display",
    developer: "ChefTech",
    verification: "verificado",
    category: "POS",
    rating: 4.5,
    reviews: 134,
    price: "€35/mes",
    pricingModel: "subscription",
    installs: "3.2k instalaciones",
    description: "Pantallas de cocina con priorización y tiempos",
    longDescription:
      "Sistema KDS para cocina: pantallas con priorización automática, tiempos estimados por estación, alertas de retraso y estadísticas de desempeño del personal. Compatible con tablets y pantallas industriales.",
    version: "v3.0.0",
    scopes: ["read:menu", "manage:tables", "read:staff"],
    iconColor: "from-orange-400 to-amber-600",
    iconInitials: "KD",
    changelog: [
      { version: "v3.0.0", date: "2 ene 2025", notes: ["Estaciones múltiples", "Métricas de desempeño"] },
    ],
    screenshots: 4,
  },
  {
    id: "app_mailchimp_sync",
    name: "Mailchimp Sync",
    developer: "Intuit · Verificado",
    verification: "verificado",
    category: "Email",
    rating: 4.1,
    reviews: 67,
    price: "Gratis",
    pricingModel: "free",
    installs: "4.0k instalaciones",
    description: "Sincroniza segmentos de clientes con Mailchimp",
    longDescription:
      "Sincronización bidireccional de segmentos de clientes, historial de reservas y comportamiento con Mailchimp. Crea audiencias segmentadas y dispara campañas automatizadas basadas en eventos.",
    version: "v1.9.3",
    scopes: ["read:customers"],
    iconColor: "from-yellow-400 to-amber-600",
    iconInitials: "MC",
    changelog: [
      { version: "v1.9.3", date: "30 dic 2024", notes: ["Sincronización de tags bidireccional"] },
    ],
    screenshots: 3,
  },
  {
    id: "app_holded_erp",
    name: "Holded ERP",
    developer: "Holded · Verificado",
    verification: "verificado",
    category: "ERP",
    rating: 4.0,
    reviews: 38,
    price: "€45/mes",
    pricingModel: "subscription",
    installs: "920 instalaciones",
    description: "ERP integral: contabilidad, facturación, inventario",
    longDescription:
      "Integración con Holded ERP: contabilidad, facturación electrónica, gestión de inventario, órdenes de compra y conciliación bancaria. Soporta SII y regímenes de IVA españoles.",
    version: "v2.1.0",
    scopes: ["read:billing", "read:menu", "read:customers"],
    iconColor: "from-blue-400 to-indigo-600",
    iconInitials: "HD",
    changelog: [
      { version: "v2.1.0", date: "27 dic 2024", notes: ["SII para España", "Factura electrónica"] },
    ],
    screenshots: 4,
  },
  {
    id: "app_tiktok_booking",
    name: "TikTok Booking",
    developer: "ByteDance · Verificado",
    verification: "verificado",
    category: "Marketing",
    rating: 4.3,
    reviews: 51,
    price: "€22/mes",
    pricingModel: "subscription",
    installs: "1.6k instalaciones",
    description: "Reservas directas desde TikTok Business Profile",
    longDescription:
      "Botón de reserva directa en TikTok Business Profile, sincronización de disponibilidad en tiempo real y atribución de conversiones por contenido. Soporta multi-local y análisis por creador.",
    version: "v1.2.0",
    scopes: ["read:reservations", "write:reservations"],
    iconColor: "from-fuchsia-400 to-pink-600",
    iconInitials: "TT",
    changelog: [
      { version: "v1.2.0", date: "4 ene 2025", notes: ["Atribución por creador", "Multi-local"] },
    ],
    screenshots: 3,
  },
  {
    id: "app_revo_pos",
    name: "Revo POS Connector",
    developer: "Revo",
    verification: "no-verificado",
    category: "POS",
    rating: 3.9,
    reviews: 29,
    price: "Por uso",
    pricingModel: "usage",
    installs: "740 instalaciones",
    description: "Conector para Revo POS con sync de comandas",
    longDescription:
      "Conector para Revo POS: sincronización de comandas, familias, modificadores y cierres de caja. Tarifación por uso según número de transacciones sincronizadas. No oficial, pendiente de verificación.",
    version: "v0.9.2",
    scopes: ["read:menu", "read:billing"],
    iconColor: "from-slate-400 to-zinc-600",
    iconInitials: "RV",
    changelog: [
      { version: "v0.9.2", date: "22 dic 2024", notes: ["Beta pública"] },
    ],
    screenshots: 2,
  },
];

const FEATURED_APPS = APPS.slice(0, 3);

const OWNED_APPS: OwnedApp[] = [
  {
    id: "own_forecast",
    name: "Forecast IA",
    category: "IA",
    status: "published",
    version: "v1.5.0",
    installs: 1100,
    revenue: 1840,
    rating: 4.6,
  },
  {
    id: "own_waitlist_bot",
    name: "Waitlist Bot AI",
    category: "WhatsApp",
    status: "review",
    version: "v0.4.0",
    installs: 0,
    revenue: 0,
    rating: 0,
  },
  {
    id: "own_revenue_dna",
    name: "Revenue DNA",
    category: "Analytics",
    status: "published",
    version: "v2.0.1",
    installs: 540,
    revenue: 980,
    rating: 4.4,
  },
  {
    id: "own_churn_guard",
    name: "Churn Guard",
    category: "Analytics",
    status: "paused",
    version: "v1.0.0",
    installs: 210,
    revenue: 320,
    rating: 4.1,
  },
];

const SANDBOX_LOGS: SandboxLog[] = [
  { ts: "12:34:21", method: "POST", path: "/v1/reservations", status: 201, latency: 142 },
  { ts: "12:34:18", method: "GET", path: "/v1/customers?limit=10", status: 200, latency: 89 },
  { ts: "12:34:12", method: "GET", path: "/v1/menu", status: 200, latency: 56 },
  { ts: "12:34:05", method: "PATCH", path: "/v1/reservations/res_01HZX", status: 200, latency: 118 },
  { ts: "12:33:58", method: "GET", path: "/v1/tables/floor", status: 200, latency: 67 },
  { ts: "12:33:51", method: "POST", path: "/v1/webhooks/test", status: 204, latency: 95 },
  { ts: "12:33:44", method: "DELETE", path: "/v1/customers/cus_01HZAB", status: 204, latency: 71 },
  { ts: "12:33:32", method: "GET", path: "/v1/billing/invoices", status: 200, latency: 124 },
  { ts: "12:33:20", method: "POST", path: "/v1/reservations", status: 422, latency: 88 },
  { ts: "12:33:08", method: "GET", path: "/v1/staff", status: 200, latency: 49 },
];

const REVENUE_BY_APP = [
  { name: "Forecast IA", installs: 1100, revenue: 1840, devShare: 1564, platformFee: 276, growth: "+12%" },
  { name: "Revenue DNA", installs: 540, revenue: 980, devShare: 833, platformFee: 147, growth: "+8%" },
  { name: "Churn Guard", installs: 210, revenue: 320, devShare: 272, platformFee: 48, growth: "-4%" },
  { name: "Waitlist Bot AI", installs: 0, revenue: 0, devShare: 0, platformFee: 0, growth: "—" },
  { name: "TableIQ", installs: 380, revenue: 620, devShare: 527, platformFee: 93, growth: "+15%" },
];

const PAYOUT_HISTORY = [
  { month: "Ene 2025", total: 8420, devShare: 7157, platformFee: 1263, status: "Pending", payoutDate: "1 feb 2025" },
  { month: "Dic 2024", total: 7890, devShare: 6707, platformFee: 1183, status: "Paid", payoutDate: "1 ene 2025" },
  { month: "Nov 2024", total: 7240, devShare: 6154, platformFee: 1086, status: "Paid", payoutDate: "1 dic 2024" },
  { month: "Oct 2024", total: 6830, devShare: 5806, platformFee: 1024, status: "Paid", payoutDate: "1 nov 2024" },
  { month: "Sep 2024", total: 6540, devShare: 5559, platformFee: 981, status: "Paid", payoutDate: "1 oct 2024" },
  { month: "Ago 2024", total: 5980, devShare: 5083, platformFee: 897, status: "Paid", payoutDate: "1 sep 2024" },
];

const INVOICES: Invoice[] = [
  { id: "INV-2025-001", date: "1 ene 2025", amount: 99, status: "paid" },
  { id: "INV-2024-012", date: "1 dic 2024", amount: 99, status: "paid" },
  { id: "INV-2024-011", date: "1 nov 2024", amount: 99, status: "paid" },
  { id: "INV-2024-010", date: "1 oct 2024", amount: 99, status: "paid" },
  { id: "INV-2024-009", date: "1 sep 2024", amount: 99, status: "paid" },
  { id: "INV-2024-008", date: "1 ago 2024", amount: 99, status: "pending" },
];

/* =====================================================================
 * Helpers
 * ===================================================================== */

function money(v: number) {
  return `€${v.toLocaleString("es-ES")}`;
}

function formatEs(v: number) {
  return v.toLocaleString("es-ES");
}

function ratingStars(rating: number) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const half = i === Math.floor(rating) && rating % 1 >= 0.5;
          return (
            <Star
              key={i}
              className={cn(
                "h-3 w-3",
                filled || half
                  ? "fill-[var(--gold)] text-[var(--gold)]"
                  : "fill-muted-foreground/30 text-muted-foreground/30"
              )}
            />
          );
        })}
      </div>
      <span className="text-xs font-medium text-foreground">{rating.toFixed(1)}</span>
    </div>
  );
}

/* =====================================================================
 * Sub-componentes UI
 * ===================================================================== */

function DemoBadge() {
  return (
    <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/15">
      <Sparkles className="h-3 w-3 mr-1" aria-hidden /> demo
    </Badge>
  );
}

function VerificationBadge({ v }: { v: Verification }) {
  if (v === "oficial") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--gold)]">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Oficial
          </span>
        </TooltipTrigger>
        <TooltipContent>App oficial verificada por RestoPanel</TooltipContent>
      </Tooltip>
    );
  }
  if (v === "verificado") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--teal)]">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> Verificado
          </span>
        </TooltipTrigger>
        <TooltipContent>Desarrollador verificado por RestoPanel</TooltipContent>
      </Tooltip>
    );
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> No verificado
        </span>
      </TooltipTrigger>
      <TooltipContent>Desarrollador no verificado — instalar con cautela</TooltipContent>
    </Tooltip>
  );
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide border border-border/60 bg-foreground/5 text-muted-foreground">
      {category}
    </span>
  );
}

function PriceBadge({ price, model }: { price: string; model: PricingModel }) {
  const color =
    model === "free"
      ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/30"
      : model === "usage"
      ? "text-amber-300 bg-amber-500/10 border-amber-500/30"
      : "text-foreground bg-foreground/5 border-border/60";
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium", color)}>
      {price}
    </span>
  );
}

function AppIcon({ initials, color, size = "md" }: { initials: string; color: string; size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "h-14 w-14 text-lg" : size === "sm" ? "h-9 w-9 text-xs" : "h-11 w-11 text-sm";
  return (
    <div
      className={cn(
        "rounded-xl bg-gradient-to-br flex items-center justify-center font-semibold text-black shrink-0",
        dim,
        color
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}

/* =====================================================================
 * App Card (grid)
 * ===================================================================== */

function AppCard({
  app,
  installed,
  onInstall,
  onDetail,
}: {
  app: DevApp;
  installed: boolean;
  onInstall: (app: DevApp) => void;
  onDetail: (app: DevApp) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className="rp-glass rounded-xl p-4 flex flex-col gap-3 hover:border-[var(--gold)]/30 transition-colors"
    >
      <div className="flex items-start gap-3">
        <AppIcon initials={app.iconInitials} color={app.iconColor} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium truncate">{app.name}</h4>
            {installed && (
              <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/15 text-[10px] py-0 px-1.5">
                Instalada
              </Badge>
            )}
          </div>
          <div className="mt-0.5">
            <VerificationBadge v={app.verification} />
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">{app.description}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <CategoryBadge category={app.category} />
        <PriceBadge price={app.price} model={app.pricingModel} />
      </div>
      <div className="flex items-center justify-between">
        {ratingStars(app.rating)}
        <span className="text-[11px] text-muted-foreground">({app.reviews})</span>
      </div>
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
        <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
          <Download className="h-3 w-3" aria-hidden /> {app.installs}
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDetail(app)}
            className="h-8 px-2 text-xs"
          >
            <Eye className="h-3.5 w-3.5 mr-1" aria-hidden /> Detalle
          </Button>
          {installed ? (
            <Button variant="outline" size="sm" disabled className="h-8 px-2 text-xs">
              <Check className="h-3.5 w-3.5 mr-1" aria-hidden /> Instalada
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => onInstall(app)}
              className="h-8 px-3 text-xs bg-[var(--gold)] hover:bg-[var(--gold-deep)] text-black"
            >
              <Download className="h-3.5 w-3.5 mr-1" aria-hidden /> Instalar
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* =====================================================================
 * Featured App Card (large)
 * ===================================================================== */

function FeaturedAppCard({
  app,
  installed,
  onInstall,
  onDetail,
}: {
  app: DevApp;
  installed: boolean;
  onInstall: (app: DevApp) => void;
  onDetail: (app: DevApp) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="rp-glass rounded-2xl overflow-hidden flex flex-col hover:border-[var(--gold)]/30 transition-colors"
    >
      <div className="h-28 bg-gradient-to-br from-[var(--gold)]/15 via-card to-[var(--teal)]/15 rp-grid-bg relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            Vista previa · demo
          </span>
        </div>
        <Badge className="absolute top-3 left-3 bg-[var(--gold)]/15 text-[var(--gold)] border-[var(--gold)]/30 hover:bg-[var(--gold)]/15">
          <Sparkles className="h-3 w-3 mr-1" aria-hidden /> Destacada
        </Badge>
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start gap-3">
          <AppIcon initials={app.iconInitials} color={app.iconColor} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-lg leading-tight">{app.name}</h3>
              <VerificationBadge v={app.verification} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{app.developer}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">{app.description}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge category={app.category} />
          <PriceBadge price={app.price} model={app.pricingModel} />
          <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
            <Download className="h-3 w-3" aria-hidden /> {app.installs}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 pt-2 mt-auto border-t border-border/40">
          {ratingStars(app.rating)}
          <span className="text-[11px] text-muted-foreground">({app.reviews} reseñas)</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDetail(app)}
            className="h-9 px-3 text-xs"
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Ver detalle
          </Button>
          {installed ? (
            <Button variant="outline" size="sm" disabled className="h-9 px-3 text-xs">
              <Check className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Instalada
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => onInstall(app)}
              className="h-9 px-4 text-xs bg-[var(--gold)] hover:bg-[var(--gold-deep)] text-black"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Instalar
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* =====================================================================
 * Install Consent Dialog (OAuth-style)
 * ===================================================================== */

function InstallConsentDialog({
  app,
  open,
  onOpenChange,
  onConfirm,
}: {
  app: DevApp | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: (app: DevApp) => void;
}) {
  if (!app) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[var(--gold)]" aria-hidden />
            Autorizar instalación
          </DialogTitle>
          <DialogDescription>
            {app.name} solicita los siguientes permisos en tu organización.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-foreground/5">
            <AppIcon initials={app.iconInitials} color={app.iconColor} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{app.name}</div>
              <div className="text-[11px] text-muted-foreground">{app.developer}</div>
            </div>
            <VerificationBadge v={app.verification} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Permisos solicitados
            </p>
            <ul className="space-y-1.5">
              {app.scopes.map((s) => (
                <li key={s} className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-amber-500/15 text-amber-300">
                    <ShieldCheck className="h-3 w-3" aria-hidden />
                  </span>
                  <code className="font-mono text-foreground">{s}</code>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 text-xs text-amber-200/90 flex gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
            <span>
              Al instalar, autorizas el acceso a los recursos indicados. Puedes revocar el acceso
              en cualquier momento desde <strong>Mis Apps</strong>.
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-10">
            Cancelar
          </Button>
          <Button
            onClick={() => onConfirm(app)}
            className="h-10 bg-[var(--gold)] hover:bg-[var(--gold-deep)] text-black"
          >
            <Lock className="h-4 w-4 mr-1.5" aria-hidden /> Autorizar e instalar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =====================================================================
 * App Detail Dialog
 * ===================================================================== */

function AppDetailDialog({
  app,
  open,
  onOpenChange,
  installed,
  onInstall,
}: {
  app: DevApp | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  installed: boolean;
  onInstall: (app: DevApp) => void;
}) {
  if (!app) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto rp-scroll-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <AppIcon initials={app.iconInitials} color={app.iconColor} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display text-lg">{app.name}</span>
                <VerificationBadge v={app.verification} />
              </div>
              <p className="text-xs text-muted-foreground">{app.developer} · {app.version}</p>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detalle completo de la aplicación {app.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rp-glass rounded-lg p-3 text-center">
              <div className="text-[10px] uppercase text-muted-foreground">Rating</div>
              <div className="text-lg font-medium mt-1">{app.rating.toFixed(1)}★</div>
              <div className="text-[10px] text-muted-foreground">{app.reviews} reseñas</div>
            </div>
            <div className="rp-glass rounded-lg p-3 text-center">
              <div className="text-[10px] uppercase text-muted-foreground">Instalaciones</div>
              <div className="text-lg font-medium mt-1">{app.installs.split(" ")[0]}</div>
              <div className="text-[10px] text-muted-foreground">activas</div>
            </div>
            <div className="rp-glass rounded-lg p-3 text-center">
              <div className="text-[10px] uppercase text-muted-foreground">Precio</div>
              <div className="text-lg font-medium mt-1">{app.price}</div>
              <div className="text-[10px] text-muted-foreground capitalize">{app.pricingModel}</div>
            </div>
            <div className="rp-glass rounded-lg p-3 text-center">
              <div className="text-[10px] uppercase text-muted-foreground">Categoría</div>
              <div className="text-lg font-medium mt-1">{app.category}</div>
              <div className="text-[10px] text-muted-foreground">tipo</div>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Descripción
            </h5>
            <p className="text-sm text-foreground/90 leading-relaxed">{app.longDescription}</p>
          </div>

          <div>
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Capturas
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Array.from({ length: app.screenshots }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-video rounded-lg bg-gradient-to-br from-foreground/10 to-foreground/5 border border-border/40 flex items-center justify-center"
                >
                  <ImageIcon className="h-5 w-5 text-muted-foreground/40" aria-hidden />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Permisos
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {app.scopes.map((s) => (
                <code
                  key={s}
                  className="font-mono text-[11px] px-2 py-1 rounded border border-border/60 bg-foreground/5"
                >
                  {s}
                </code>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Historial de versiones
            </h5>
            <div className="space-y-2">
              {app.changelog.map((c) => (
                <div key={c.version} className="rp-glass rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs text-[var(--gold)]">{c.version}</span>
                    <span className="text-[11px] text-muted-foreground">{c.date}</span>
                  </div>
                  <ul className="space-y-0.5">
                    {c.notes.map((n, i) => (
                      <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                        <span className="text-[var(--teal)] mt-0.5">•</span>
                        <span>{n}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => toast({ title: "Documentación abierta (demo)", description: "https://docs.restopanel.com/apps/" + app.id })}
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Documentación
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => toast({ title: "Soporte contactado (demo)", description: "Te responderemos en menos de 24h" })}
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Soporte
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => toast({ title: "Reseñas cargadas (demo)" })}
            >
              <Star className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Ver reseñas
            </Button>
            <div className="flex-1" />
            {installed ? (
              <Button variant="outline" size="sm" disabled className="h-9">
                <Check className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Instalada
              </Button>
            ) : (
              <Button
                size="sm"
                className="h-9 bg-[var(--gold)] hover:bg-[var(--gold-deep)] text-black"
                onClick={() => {
                  onInstall(app);
                  onOpenChange(false);
                }}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Instalar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* =====================================================================
 * Publish App Dialog
 * ===================================================================== */

function PublishAppDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [name, setName] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [pricing, setPricing] = React.useState<PricingModel>("free");
  const [price, setPrice] = React.useState("");
  const [selectedScopes, setSelectedScopes] = React.useState<string[]>([]);
  const [docUrl, setDocUrl] = React.useState("");
  const [supportUrl, setSupportUrl] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  function toggleScope(s: string) {
    setSelectedScopes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function reset() {
    setName("");
    setDesc("");
    setCategory("");
    setPricing("free");
    setPrice("");
    setSelectedScopes([]);
    setDocUrl("");
    setSupportUrl("");
  }

  function submit() {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onOpenChange(false);
      reset();
      toast({
        title: "App enviada para revisión",
        description: "Te notificaremos en 48-72h.",
      });
    }, 900);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto rp-scroll-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-4 w-4 text-[var(--gold)]" aria-hidden />
            Publicar aplicación
          </DialogTitle>
          <DialogDescription>
            Completa los datos de tu app. Pasará a revisión antes de publicarse en el marketplace.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Nombre de la app</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mi App RestoPanel" className="h-10" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Descripción</label>
            <Textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Describe qué hace tu app y qué problema resuelve…"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Categoría</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecciona…" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Modelo de precio</label>
              <Select
                value={pricing}
                onValueChange={(v) => setPricing(v as PricingModel)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Gratis</SelectItem>
                  <SelectItem value="subscription">Suscripción</SelectItem>
                  <SelectItem value="one-time">Pago único</SelectItem>
                  <SelectItem value="usage">Por uso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {pricing !== "free" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Precio (EUR)</label>
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={pricing === "usage" ? "0.05 por uso" : "29"}
                className="h-10"
                inputMode="decimal"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Permisos (scopes) solicitados
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto rp-scroll-thin p-2 rounded-lg bg-foreground/5">
              {SCOPES.map((s) => {
                const active = selectedScopes.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleScope(s)}
                    className={cn(
                      "text-[11px] font-mono px-2 py-1 rounded border transition-colors",
                      active
                        ? "border-[var(--gold)]/40 bg-[var(--gold)]/15 text-[var(--gold)]"
                        : "border-border/60 bg-foreground/5 text-muted-foreground hover:border-border"
                    )}
                    aria-pressed={active}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" aria-hidden /> Capturas de pantalla
            </label>
            <div className="border-2 border-dashed border-border/60 rounded-lg p-4 text-center text-xs text-muted-foreground">
              Arrastra imágenes o haz clic para subir (mock)
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">URL documentación</label>
              <Input value={docUrl} onChange={(e) => setDocUrl(e.target.value)} placeholder="https://docs…" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">URL soporte</label>
              <Input value={supportUrl} onChange={(e) => setSupportUrl(e.target.value)} placeholder="https://soporte…" className="h-10" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-10">
            Cancelar
          </Button>
          <Button
            onClick={submit}
            disabled={submitting || !name || !desc || !category}
            className="h-10 bg-[var(--gold)] hover:bg-[var(--gold-deep)] text-black"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden />
            ) : (
              <Send className="h-4 w-4 mr-1.5" aria-hidden />
            )}
            Enviar para revisión
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =====================================================================
 * Explorar Tab
 * ===================================================================== */

function ExplorarTab({
  installedIds,
  onInstall,
  onDetail,
  onPublish,
}: {
  installedIds: Set<string>;
  onInstall: (app: DevApp) => void;
  onDetail: (app: DevApp) => void;
  onPublish: () => void;
}) {
  const [query, setQuery] = React.useState("");
  const [activeCat, setActiveCat] = React.useState<string>("Todas");

  const filtered = React.useMemo(() => {
    return APPS.filter((a) => {
      const matchCat = activeCat === "Todas" || a.category === activeCat;
      const matchQuery =
        !query ||
        a.name.toLowerCase().includes(query.toLowerCase()) ||
        a.developer.toLowerCase().includes(query.toLowerCase()) ||
        a.description.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [query, activeCat]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar apps, desarrolladores, categorías…"
            className="pl-9 h-10"
          />
        </div>
        <Button onClick={onPublish} className="h-10 bg-[var(--gold)] hover:bg-[var(--gold-deep)] text-black">
          <Plus className="h-4 w-4 mr-1.5" aria-hidden /> Publicar app
        </Button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto rp-scroll-thin pb-1 -mx-1 px-1">
        {["Todas", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setActiveCat(c)}
            className={cn(
              "shrink-0 min-h-[36px] px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
              activeCat === c
                ? "bg-[var(--gold)]/15 text-[var(--gold)] border-[var(--gold)]/40"
                : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
            )}
            aria-pressed={activeCat === c}
          >
            {c}
          </button>
        ))}
      </div>

      <section aria-labelledby="featured-heading">
        <div className="flex items-center justify-between mb-3">
          <h3 id="featured-heading" className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--gold)]" aria-hidden /> Apps destacadas
          </h3>
          <span className="text-[11px] text-muted-foreground">{FEATURED_APPS.length} apps</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {FEATURED_APPS.map((app) => (
              <FeaturedAppCard
                key={app.id}
                app={app}
                installed={installedIds.has(app.id)}
                onInstall={onInstall}
                onDetail={onDetail}
              />
            ))}
          </AnimatePresence>
        </div>
      </section>

      <section aria-labelledby="all-heading">
        <div className="flex items-center justify-between mb-3">
          <h3 id="all-heading" className="text-sm font-medium flex items-center gap-2">
            <Store className="h-4 w-4 text-[var(--teal)]" aria-hidden /> Todas las apps
          </h3>
          <span className="text-[11px] text-muted-foreground">{filtered.length} de {APPS.length}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                installed={installedIds.has(app.id)}
                onInstall={onInstall}
                onDetail={onDetail}
              />
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-sm text-muted-foreground">
              No se encontraron apps con esos criterios.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* =====================================================================
 * Mis Apps Tab
 * ===================================================================== */

const STATUS_META: Record<AppStatus, { label: string; color: string }> = {
  published: { label: "Publicada", color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30" },
  review: { label: "En revisión", color: "text-amber-300 bg-amber-500/10 border-amber-500/30" },
  draft: { label: "Borrador", color: "text-muted-foreground bg-foreground/5 border-border/60" },
  paused: { label: "Pausada", color: "text-rose-300 bg-rose-500/10 border-rose-500/30" },
};

function MyAppsTab({ onPublish }: { onPublish: () => void }) {
  const [editApp, setEditApp] = React.useState<OwnedApp | null>(null);
  const [analyticsApp, setAnalyticsApp] = React.useState<OwnedApp | null>(null);
  const [versionApp, setVersionApp] = React.useState<OwnedApp | null>(null);
  const [pauseApp, setPauseApp] = React.useState<OwnedApp | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Tus aplicaciones</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gestiona el ciclo de vida de las apps que has publicado en el marketplace.
          </p>
        </div>
        <Button onClick={onPublish} className="h-10 bg-[var(--gold)] hover:bg-[var(--gold-deep)] text-black">
          <Plus className="h-4 w-4 mr-1.5" aria-hidden /> Crear nueva app
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {OWNED_APPS.map((app) => (
          <motion.div
            key={app.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rp-glass rounded-xl p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">{app.name}</h4>
                  <span
                    className={cn(
                      "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] border",
                      STATUS_META[app.status].color
                    )}
                  >
                    {STATUS_META[app.status].label}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {app.category} · <span className="font-mono">{app.version}</span>
                </p>
              </div>
              {app.rating > 0 && ratingStars(app.rating)}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-foreground/5 p-2.5">
                <div className="text-[10px] uppercase text-muted-foreground">Instalaciones</div>
                <div className="text-base font-medium mt-0.5">{formatEs(app.installs)}</div>
              </div>
              <div className="rounded-lg bg-foreground/5 p-2.5">
                <div className="text-[10px] uppercase text-muted-foreground">Ingresos (mes)</div>
                <div className="text-base font-medium mt-0.5 text-[var(--gold)]">{money(app.revenue)}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/40">
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setEditApp(app)}>
                <Settings2 className="h-3.5 w-3.5 mr-1" aria-hidden /> Editar
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setAnalyticsApp(app)}>
                <BarChart3 className="h-3.5 w-3.5 mr-1" aria-hidden /> Analítica
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setVersionApp(app)}>
                <Plus className="h-3.5 w-3.5 mr-1" aria-hidden /> Nueva versión
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-amber-300 hover:text-amber-200" onClick={() => setPauseApp(app)}>
                {app.status === "paused" ? <Play className="h-3.5 w-3.5 mr-1" aria-hidden /> : <Pause className="h-3.5 w-3.5 mr-1" aria-hidden />}
                {app.status === "paused" ? "Reactivar" : "Pausar"}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <EditAppDialog app={editApp} open={!!editApp} onOpenChange={(o) => !o && setEditApp(null)} />
      <AppAnalyticsDialog app={analyticsApp} open={!!analyticsApp} onOpenChange={(o) => !o && setAnalyticsApp(null)} />
      <NewVersionDialog app={versionApp} open={!!versionApp} onOpenChange={(o) => !o && setVersionApp(null)} />
      <PauseConfirmDialog app={pauseApp} open={!!pauseApp} onOpenChange={(o) => !o && setPauseApp(null)} />
    </div>
  );
}

function EditAppDialog({ app, open, onOpenChange }: { app: OwnedApp | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  if (!app) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar · {app.name}</DialogTitle>
          <DialogDescription>Actualiza los metadatos de tu aplicación.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Nombre</label>
            <Input defaultValue={app.name} className="h-10" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Categoría</label>
              <Select defaultValue={app.category}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Estado</label>
              <Select defaultValue={app.status}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Publicada</SelectItem>
                  <SelectItem value="paused">Pausada</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Descripción breve</label>
            <Textarea defaultValue="Descripción de la app…" rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-10">Cancelar</Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              toast({ title: "Cambios guardados (demo)" });
            }}
            className="h-10 bg-[var(--gold)] hover:bg-[var(--gold-deep)] text-black"
          >
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AppAnalyticsDialog({ app, open, onOpenChange }: { app: OwnedApp | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  if (!app) return null;
  const installsData = [820, 940, 1050, 980, 1100];
  const revenueData = [1240, 1480, 1620, 1390, 1840];
  const maxInstalls = Math.max(...installsData);
  const maxRevenue = Math.max(...revenueData);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto rp-scroll-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[var(--teal)]" aria-hidden /> Analítica · {app.name}
          </DialogTitle>
          <DialogDescription>Rendimiento de los últimos 5 meses.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rp-glass rounded-lg p-3 text-center">
              <div className="text-[10px] uppercase text-muted-foreground">Instalaciones</div>
              <div className="text-lg font-medium mt-1 text-[var(--gold)]">{formatEs(app.installs)}</div>
            </div>
            <div className="rp-glass rounded-lg p-3 text-center">
              <div className="text-[10px] uppercase text-muted-foreground">Ingresos mes</div>
              <div className="text-lg font-medium mt-1">{money(app.revenue)}</div>
            </div>
            <div className="rp-glass rounded-lg p-3 text-center">
              <div className="text-[10px] uppercase text-muted-foreground">Tasa error</div>
              <div className="text-lg font-medium mt-1 text-emerald-300">0.3%</div>
            </div>
            <div className="rp-glass rounded-lg p-3 text-center">
              <div className="text-[10px] uppercase text-muted-foreground">Uso API</div>
              <div className="text-lg font-medium mt-1">12.4k</div>
              <div className="text-[10px] text-muted-foreground">llamadas/día</div>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Instalaciones (5 meses)</h5>
            <div className="flex items-end gap-2 h-32 p-3 rounded-lg bg-foreground/5">
              {installsData.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-[var(--gold-deep)] to-[var(--gold)] rounded-t"
                    style={{ height: `${(v / maxInstalls) * 100}%`, minHeight: "4px" }}
                  />
                  <span className="text-[10px] text-muted-foreground">M{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Ingresos (5 meses)</h5>
            <div className="flex items-end gap-2 h-32 p-3 rounded-lg bg-foreground/5">
              {revenueData.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-[var(--teal-deep)] to-[var(--teal)] rounded-t"
                    style={{ height: `${(v / maxRevenue) * 100}%`, minHeight: "4px" }}
                  />
                  <span className="text-[10px] text-muted-foreground">M{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="h-10 bg-[var(--gold)] hover:bg-[var(--gold-deep)] text-black">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewVersionDialog({ app, open, onOpenChange }: { app: OwnedApp | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [breaking, setBreaking] = React.useState(false);
  if (!app) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-[var(--gold)]" aria-hidden /> Nueva versión · {app.name}
          </DialogTitle>
          <DialogDescription>Publica una nueva versión de tu aplicación.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Número de versión</label>
            <Input defaultValue={app.version.replace("v", "")} className="h-10 font-mono" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Changelog</label>
            <Textarea placeholder="Novedades de esta versión…" rows={4} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <Switch checked={breaking} onCheckedChange={setBreaking} />
            <span className="text-sm">Incluye cambios breaking</span>
          </label>
          {breaking && (
            <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/5 text-xs text-rose-200/90 flex gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
              <span>
                Los cambios breaking requieren bump de versión major y migración obligatoria para
                los usuarios existentes. RestoPanel realizará una revisión adicional (48-72h extra).
              </span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-10">Cancelar</Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              setBreaking(false);
              toast({ title: "Versión enviada (demo)", description: "Pasarán 48-72h de revisión" });
            }}
            className="h-10 bg-[var(--gold)] hover:bg-[var(--gold-deep)] text-black"
          >
            Publicar versión
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PauseConfirmDialog({ app, open, onOpenChange }: { app: OwnedApp | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  if (!app) return null;
  const isPaused = app.status === "paused";
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isPaused ? "Reactivar aplicación" : "Pausar aplicación"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isPaused
              ? "Tu app volverá a estar disponible en el marketplace."
              : "La app se ocultará del marketplace y no recibirá nuevas instalaciones. Los usuarios existentes conservarán el acceso."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => toast({ title: isPaused ? "App reactivada (demo)" : "App pausada (demo)" })}
            className={isPaused ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"}
          >
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* =====================================================================
 * Sandbox Tab
 * ===================================================================== */

function SandboxTab() {
  const [resetOpen, setResetOpen] = React.useState(false);
  const [testEvent, setTestEvent] = React.useState<string>("reservation.created");
  const [deliveryResult, setDeliveryResult] = React.useState<null | { ok: boolean; status: number; latency: number }>(null);
  const [sending, setSending] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  function sendTest() {
    setSending(true);
    setDeliveryResult(null);
    setTimeout(() => {
      setSending(false);
      setDeliveryResult({ ok: true, status: 204, latency: 124 });
      toast({ title: "Evento de prueba enviado (demo)", description: `Tipo: ${testEvent}` });
    }, 700);
  }

  function copyKey() {
    navigator.clipboard?.writeText("sk_test_DEMO_KEY_REPLACE_ME").catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/15">
          <FlaskConical className="h-3 w-3 mr-1" aria-hidden /> Modo sandbox · Los datos no afectan producción
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rp-glass rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-[var(--teal)]" aria-hidden />
            <h4 className="text-sm font-medium">Entorno sandbox</h4>
          </div>
          <div className="space-y-2">
            <KV label="Base URL" value="https://api.sandbox.restopanel.com/v1" mono />
            <div className="text-xs text-muted-foreground">
              Datos de prueba: <span className="text-foreground">3 restaurantes · 50 reservas · 100 clientes · 24 mesas · 5 usuarios</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Tarjeta Stripe de prueba: <code className="font-mono text-foreground bg-foreground/5 px-1.5 py-0.5 rounded">4242 4242 4242 4242</code>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-9" onClick={() => setResetOpen(true)}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Resetear sandbox
          </Button>
        </div>

        <div className="rp-glass rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Webhook className="h-4 w-4 text-[var(--gold)]" aria-hidden />
            <h4 className="text-sm font-medium">Endpoint de webhook de prueba</h4>
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">URL: </span>
            <code className="font-mono text-foreground bg-foreground/5 px-1.5 py-0.5 rounded break-all">
              https://sandbox.restopanel.com/webhooks/dev-001
            </code>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={testEvent} onValueChange={setTestEvent}>
              <SelectTrigger className="h-9 flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="reservation.created">reservation.created</SelectItem>
                <SelectItem value="reservation.cancelled">reservation.cancelled</SelectItem>
                <SelectItem value="customer.updated">customer.updated</SelectItem>
                <SelectItem value="payment.completed">payment.completed</SelectItem>
                <SelectItem value="review.received">review.received</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={sendTest} disabled={sending} className="h-9 bg-[var(--gold)] hover:bg-[var(--gold-deep)] text-black">
              {sending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" aria-hidden /> : <Send className="h-3.5 w-3.5 mr-1.5" aria-hidden />}
              Enviar evento
            </Button>
          </div>
          {deliveryResult && (
            <div className="text-xs p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden />
              <span>
                Entregado · <span className="font-mono">HTTP {deliveryResult.status}</span> · {deliveryResult.latency}ms
              </span>
            </div>
          )}
        </div>

        <div className="rp-glass rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-[var(--gold)]" aria-hidden />
            <h4 className="text-sm font-medium">API Key de test</h4>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-xs px-3 py-2 rounded-lg bg-foreground/5 border border-border/60">
              sk_test_DEMO_KEY_REPLACE_ME
            </code>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 w-9 p-0" onClick={copyKey} aria-label="Copiar API key">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{copied ? "Copiado" : "Copiar"}</TooltipContent>
            </Tooltip>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Usa esta clave solo en el entorno sandbox. No la expongas en el cliente.
          </p>
        </div>

        <div className="rp-glass rounded-xl p-5 space-y-3 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[var(--teal)]" aria-hidden />
            <h4 className="text-sm font-medium">Logs del sandbox</h4>
            <span className="text-[11px] text-muted-foreground ml-auto">{SANDBOX_LOGS.length} llamadas recientes</span>
          </div>
          <div className="max-h-64 overflow-y-auto rp-scroll-thin rounded-lg border border-border/40 divide-y divide-border/30">
            {SANDBOX_LOGS.map((log, i) => (
              <div key={i} className="grid grid-cols-[80px_70px_1fr_60px_70px] sm:grid-cols-[100px_70px_1fr_60px_70px] gap-2 items-center px-3 py-2 text-xs hover:bg-foreground/5">
                <span className="font-mono text-muted-foreground">{log.ts}</span>
                <span className={cn(
                  "font-mono font-medium",
                  log.method === "GET" ? "text-[var(--teal)]" :
                  log.method === "POST" ? "text-[var(--gold)]" :
                  log.method === "PATCH" ? "text-amber-300" :
                  "text-rose-300"
                )}>{log.method}</span>
                <code className="font-mono truncate text-foreground/80">{log.path}</code>
                <span className={cn(
                  "font-mono",
                  log.status < 300 ? "text-emerald-300" : log.status < 500 ? "text-amber-300" : "text-rose-300"
                )}>{log.status}</span>
                <span className="text-muted-foreground text-right">{log.latency}ms</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resetear sandbox</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán todos los datos de prueba y se restaurarán los datos iniciales (3 restaurantes, 50 reservas, 100 clientes). Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => toast({ title: "Sandbox reseteado a datos iniciales (demo)" })}
            >
              Resetear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="text-xs">
      <span className="text-muted-foreground">{label}: </span>
      <span className={cn("text-foreground", mono && "font-mono bg-foreground/5 px-1.5 py-0.5 rounded break-all")}>
        {value}
      </span>
    </div>
  );
}

/* =====================================================================
 * Revenue Share Tab
 * ===================================================================== */

function RevenueShareTab() {
  const [payMethodOpen, setPayMethodOpen] = React.useState(false);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rp-glass rounded-xl p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-[var(--gold)]" aria-hidden />
            <h4 className="text-sm font-medium">Modelo de revenue share</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg p-4 bg-gradient-to-br from-[var(--gold)]/15 to-transparent border border-[var(--gold)]/30">
              <div className="text-[10px] uppercase text-muted-foreground">Desarrollador</div>
              <div className="text-3xl font-display rp-gold-gradient">85%</div>
              <div className="text-[11px] text-muted-foreground mt-1">Por defecto</div>
            </div>
            <div className="rounded-lg p-4 bg-gradient-to-br from-[var(--teal)]/15 to-transparent border border-[var(--teal)]/30">
              <div className="text-[10px] uppercase text-muted-foreground">RestoPanel (fee)</div>
              <div className="text-3xl font-display text-[var(--teal)]">15%</div>
              <div className="text-[11px] text-muted-foreground mt-1">Comisión de plataforma</div>
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground flex items-start gap-2">
            <Sparkles className="h-3.5 w-3.5 mt-0.5 text-[var(--gold)]" aria-hidden />
            <span>Configurable para partners Enterprise. Contacta con <strong>partners@restopanel.com</strong>.</span>
          </div>
        </div>

        <div className="rp-glass rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[var(--teal)]" aria-hidden />
            <h4 className="text-sm font-medium">Resumen de ingresos</h4>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-[10px] uppercase text-muted-foreground">Este mes</div>
              <div className="text-2xl font-display">{money(8420)}</div>
              <div className="text-[11px] text-muted-foreground">
                <span className="text-[var(--gold)]">{money(7157)}</span> dev · <span className="text-[var(--teal)]">{money(1263)}</span> plataforma
              </div>
            </div>
            <div className="pt-2 border-t border-border/40">
              <div className="text-[10px] uppercase text-muted-foreground">Mes anterior</div>
              <div className="text-lg font-medium">{money(7890)}</div>
              <div className="text-[11px] text-muted-foreground">
                {money(6707)} dev · {money(1183)} plataforma
              </div>
            </div>
            <div className="pt-2 border-t border-border/40 flex items-center gap-2">
              <span className="inline-flex items-center text-xs font-medium text-emerald-300">
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /> +6.7%
              </span>
              <span className="text-[11px] text-muted-foreground">vs mes anterior</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rp-glass rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between">
          <h4 className="text-sm font-medium">Revenue por app</h4>
          <span className="text-[11px] text-muted-foreground">{REVENUE_BY_APP.length} apps</span>
        </div>
        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full text-xs min-w-[640px]">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border/40">
                <th className="px-5 py-2 font-medium">App</th>
                <th className="px-3 py-2 font-medium text-right">Instalaciones</th>
                <th className="px-3 py-2 font-medium text-right">Ingresos mes</th>
                <th className="px-3 py-2 font-medium text-right">Share dev (85%)</th>
                <th className="px-3 py-2 font-medium text-right">Fee plataforma</th>
                <th className="px-5 py-2 font-medium text-right">Crecimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {REVENUE_BY_APP.map((r) => (
                <tr key={r.name} className="hover:bg-foreground/5">
                  <td className="px-5 py-2.5 font-medium">{r.name}</td>
                  <td className="px-3 py-2.5 text-right font-mono">{formatEs(r.installs)}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-[var(--gold)]">{money(r.revenue)}</td>
                  <td className="px-3 py-2.5 text-right font-mono">{money(r.devShare)}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-muted-foreground">{money(r.platformFee)}</td>
                  <td className={cn(
                    "px-5 py-2.5 text-right font-mono",
                    r.growth.startsWith("+") ? "text-emerald-300" :
                    r.growth.startsWith("-") ? "text-rose-300" :
                    "text-muted-foreground"
                  )}>{r.growth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rp-glass rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-[var(--gold)]" aria-hidden />
            <h4 className="text-sm font-medium">Calendario de pagos</h4>
          </div>
          <div className="space-y-2 text-xs">
            <KV label="Frecuencia" value="Pagos mensuales" />
            <KV label="Próximo pago" value="1 feb 2025" />
            <KV label="Método" value="Transferencia bancaria" />
          </div>
          <Button variant="outline" size="sm" className="h-9 w-full" onClick={() => setPayMethodOpen(true)}>
            <CreditCard className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Configurar método de pago
          </Button>
        </div>

        <div className="rp-glass rounded-xl p-5 lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[var(--teal)]" aria-hidden />
            <h4 className="text-sm font-medium">Historial de pagos</h4>
            <span className="text-[11px] text-muted-foreground ml-auto">últimos 6 meses</span>
          </div>
          <div className="overflow-x-auto rp-scroll-thin">
            <table className="w-full text-xs min-w-[480px]">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border/40">
                  <th className="px-2 py-2 font-medium">Mes</th>
                  <th className="px-2 py-2 font-medium text-right">Total</th>
                  <th className="px-2 py-2 font-medium text-right">Dev (85%)</th>
                  <th className="px-2 py-2 font-medium text-right">Fee</th>
                  <th className="px-2 py-2 font-medium">Estado</th>
                  <th className="px-2 py-2 font-medium">Fecha pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {PAYOUT_HISTORY.map((p) => (
                  <tr key={p.month} className="hover:bg-foreground/5">
                    <td className="px-2 py-2 font-medium">{p.month}</td>
                    <td className="px-2 py-2 text-right font-mono">{money(p.total)}</td>
                    <td className="px-2 py-2 text-right font-mono text-[var(--gold)]">{money(p.devShare)}</td>
                    <td className="px-2 py-2 text-right font-mono text-muted-foreground">{money(p.platformFee)}</td>
                    <td className="px-2 py-2">
                      <span className={cn(
                        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] border",
                        p.status === "Paid"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                      )}>
                        {p.status === "Paid" ? "Pagado" : "Pendiente"}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-muted-foreground">{p.payoutDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PaymentMethodDialog open={payMethodOpen} onOpenChange={setPayMethodOpen} />
    </div>
  );
}

function PaymentMethodDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-[var(--gold)]" aria-hidden /> Configurar método de pago
          </DialogTitle>
          <DialogDescription>Datos bancarios y fiscales para recibir tus pagos.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">IBAN</label>
            <Input placeholder="ES00 0000 0000 0000 0000 0000" className="h-10 font-mono" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Titular de la cuenta</label>
            <Input placeholder="Tu nombre o empresa" className="h-10" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">NIF / CIF</label>
              <Input placeholder="B12345678" className="h-10 font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">País fiscal</label>
              <Select defaultValue="es">
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">España</SelectItem>
                  <SelectItem value="pt">Portugal</SelectItem>
                  <SelectItem value="fr">Francia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-10">Cancelar</Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              toast({ title: "Método de pago guardado (demo)" });
            }}
            className="h-10 bg-[var(--gold)] hover:bg-[var(--gold-deep)] text-black"
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =====================================================================
 * Billing Tab
 * ===================================================================== */

const PLANS: { id: DevPlan; name: string; price: string; features: string[]; highlighted?: boolean }[] = [
  {
    id: "starter",
    name: "Starter",
    price: "Gratis",
    features: ["10.000 llamadas/mes", "2 API Keys", "5 webhooks", "Marketplace solo como usuario"],
  },
  {
    id: "professional",
    name: "Professional",
    price: "€99/mes",
    features: ["500.000 llamadas/mes", "API Keys ilimitadas", "SDK completos", "OAuth 2.1", "Sandbox", "Publicación de apps"],
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Desde €499/mes",
    features: ["Ilimitado", "SLA 99.95%", "mTLS", "Infra dedicada", "Revenue share personalizado"],
  },
];

function BillingTab() {
  const [changePlanOpen, setChangePlanOpen] = React.useState(false);
  const usage = 34580;
  const quota = 500000;
  const usagePct = (usage / quota) * 100;

  return (
    <div className="space-y-5">
      <div className="rp-glass rounded-xl p-5 space-y-4 rp-glow-gold">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-[var(--gold)]" aria-hidden />
              <h4 className="text-base font-medium">Plan actual · Professional</h4>
              <Badge className="bg-[var(--gold)]/15 text-[var(--gold)] border-[var(--gold)]/30 hover:bg-[var(--gold)]/15">Activo</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              €99/mes · 500.000 llamadas/mes · API Keys ilimitadas · SDK · OAuth 2.1 · Sandbox · Publicación
            </p>
          </div>
          <Button variant="outline" size="sm" className="h-9" onClick={() => setChangePlanOpen(true)}>
            Cambiar de plan <ArrowRight className="h-3.5 w-3.5 ml-1.5" aria-hidden />
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">Uso este mes</span>
            <span className="text-xs font-mono">
              <span className="text-[var(--gold)]">{formatEs(usage)}</span> / {formatEs(quota)} ({usagePct.toFixed(1)}%)
            </span>
          </div>
          <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--gold-deep)] via-[var(--gold)] to-[var(--gold-soft)]"
              style={{ width: `${usagePct}%` }}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Comparativa de planes</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={cn(
                "rp-glass rounded-xl p-5 flex flex-col gap-3 relative",
                p.highlighted && "border-[var(--gold)]/40 rp-glow-gold"
              )}
            >
              {p.highlighted && (
                <Badge className="absolute -top-2 left-5 bg-[var(--gold)] text-black hover:bg-[var(--gold)]">
                  Recomendado
                </Badge>
              )}
              <div>
                <h5 className="text-sm font-medium">{p.name}</h5>
                <div className="text-2xl font-display mt-1">{p.price}</div>
              </div>
              <ul className="space-y-1.5 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="text-xs flex items-start gap-1.5 text-foreground/80">
                    <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-[var(--teal)] shrink-0" aria-hidden />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={p.highlighted ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-9",
                  p.highlighted && "bg-[var(--gold)] hover:bg-[var(--gold-deep)] text-black"
                )}
                onClick={() => {
                  if (p.id === "professional") {
                    toast({ title: "Ya estás en este plan (demo)" });
                  } else {
                    setChangePlanOpen(false);
                    toast({ title: `Cambio a ${p.name} solicitado (demo)`, description: "Se aplicará en el próximo ciclo" });
                  }
                }}
              >
                {p.id === "professional" ? "Plan actual" : `Elegir ${p.name}`}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rp-glass rounded-xl p-5 lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-[var(--teal)]" aria-hidden />
            <h4 className="text-sm font-medium">Facturas recientes</h4>
          </div>
          <div className="divide-y divide-border/30 rounded-lg border border-border/40 overflow-hidden">
            {INVOICES.map((inv) => (
              <div key={inv.id} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_100px_120px] gap-2 items-center px-3 py-2.5 text-xs hover:bg-foreground/5">
                <div>
                  <div className="font-mono text-foreground">{inv.id}</div>
                  <div className="text-[11px] text-muted-foreground">{inv.date}</div>
                </div>
                <span className="text-right font-mono hidden sm:inline">{money(inv.amount)}</span>
                <span className="hidden sm:inline">
                  <span className={cn(
                    "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] border",
                    inv.status === "paid"
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                  )}>
                    {inv.status === "paid" ? "Pagada" : "Pendiente"}
                  </span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] justify-self-end"
                  onClick={() => toast({ title: `Descargando ${inv.id}.pdf (demo)` })}
                >
                  <FileDown className="h-3 w-3 mr-1" aria-hidden /> PDF
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="rp-glass rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[var(--gold)]" aria-hidden />
            <h4 className="text-sm font-medium">Método de pago</h4>
          </div>
          <div className="p-3 rounded-lg bg-foreground/5 border border-border/40">
            <div className="text-[10px] uppercase text-muted-foreground">Tarjeta</div>
            <div className="text-sm font-mono mt-1">•••• •••• •••• 4242</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Caduca 12/27</div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-full"
            onClick={() => toast({ title: "Editor de tarjeta abierto (demo)" })}
          >
            Actualizar tarjeta
          </Button>
        </div>
      </div>

      <ChangePlanDialog open={changePlanOpen} onOpenChange={setChangePlanOpen} />
    </div>
  );
}

function ChangePlanDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cambiar de plan</DialogTitle>
          <DialogDescription>Compara los planes y elige el que más te convenga.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={cn(
                "rounded-xl p-4 flex flex-col gap-2 border",
                p.highlighted ? "border-[var(--gold)]/40 bg-[var(--gold)]/5" : "border-border/60 bg-foreground/5"
              )}
            >
              <div>
                <h5 className="text-sm font-medium">{p.name}</h5>
                <div className="text-xl font-display mt-0.5">{p.price}</div>
              </div>
              <ul className="space-y-1 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="text-[11px] flex items-start gap-1.5">
                    <CheckCircle2 className="h-3 w-3 mt-0.5 text-[var(--teal)] shrink-0" aria-hidden />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                size="sm"
                variant={p.id === "professional" ? "default" : "outline"}
                className={cn("h-8 text-xs", p.id === "professional" && "bg-[var(--gold)] hover:bg-[var(--gold-deep)] text-black")}
                onClick={() => {
                  onOpenChange(false);
                  if (p.id !== "professional") {
                    toast({ title: `Cambio a ${p.name} solicitado (demo)`, description: "Se aplicará en el próximo ciclo" });
                  } else {
                    toast({ title: "Ya estás en Professional (demo)" });
                  }
                }}
              >
                {p.id === "professional" ? "Plan actual" : "Elegir"}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* =====================================================================
 * Componente principal
 * ===================================================================== */

export function DevMarketplaceV2() {
  const reduce = useReducedMotion();
  const [tab, setTab] = React.useState("explorar");
  const [installedIds, setInstalledIds] = React.useState<Set<string>>(new Set(["app_stripe_sync", "app_mailchimp_sync"]));
  const [installApp, setInstallApp] = React.useState<DevApp | null>(null);
  const [detailApp, setDetailApp] = React.useState<DevApp | null>(null);
  const [publishOpen, setPublishOpen] = React.useState(false);

  function handleInstall(app: DevApp) {
    setInstallApp(app);
  }

  function confirmInstall(app: DevApp) {
    setInstalledIds((prev) => new Set(prev).add(app.id));
    setInstallApp(null);
    toast({
      title: `${app.name} instalada (demo)`,
      description: "Puedes configurarla desde Mis Apps.",
    });
  }

  function uninstall(app: DevApp) {
    setInstalledIds((prev) => {
      const n = new Set(prev);
      n.delete(app.id);
      return n;
    });
    toast({ title: `${app.name} desinstalada (demo)` });
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-[var(--gold)]" aria-hidden />
              <h1 className="font-display text-2xl tracking-tight">Marketplace</h1>
              <DemoBadge />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Apps e integraciones verificadas para RestoPanel · Sandbox, revenue share y billing integrado.
            </p>
          </div>
        </header>

        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList className="bg-foreground/5 p-1 h-auto flex flex-wrap gap-1">
            <TabsTrigger value="explorar" className="min-h-[40px] data-[state=active]:bg-[var(--gold)] data-[state=active]:text-black">
              <Store className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Explorar
            </TabsTrigger>
            <TabsTrigger value="mis-apps" className="min-h-[40px] data-[state=active]:bg-[var(--gold)] data-[state=active]:text-black">
              <Package className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Mis Apps
            </TabsTrigger>
            <TabsTrigger value="sandbox" className="min-h-[40px] data-[state=active]:bg-[var(--gold)] data-[state=active]:text-black">
              <FlaskConical className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Sandbox
            </TabsTrigger>
            <TabsTrigger value="revenue" className="min-h-[40px] data-[state=active]:bg-[var(--gold)] data-[state=active]:text-black">
              <Wallet className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Revenue Share
            </TabsTrigger>
            <TabsTrigger value="billing" className="min-h-[40px] data-[state=active]:bg-[var(--gold)] data-[state=active]:text-black">
              <CreditCard className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Billing
            </TabsTrigger>
          </TabsList>

          <motion.div
            key={tab}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <TabsContent value="explorar" className="mt-0 focus-visible:outline-none">
              <ExplorarTab
                installedIds={installedIds}
                onInstall={handleInstall}
                onDetail={setDetailApp}
                onPublish={() => setPublishOpen(true)}
              />
            </TabsContent>
            <TabsContent value="mis-apps" className="mt-0 focus-visible:outline-none">
              <MyAppsTab onPublish={() => setPublishOpen(true)} />
            </TabsContent>
            <TabsContent value="sandbox" className="mt-0 focus-visible:outline-none">
              <SandboxTab />
            </TabsContent>
            <TabsContent value="revenue" className="mt-0 focus-visible:outline-none">
              <RevenueShareTab />
            </TabsContent>
            <TabsContent value="billing" className="mt-0 focus-visible:outline-none">
              <BillingTab />
            </TabsContent>
          </motion.div>
        </Tabs>

        <InstallConsentDialog
          app={installApp}
          open={!!installApp}
          onOpenChange={(o) => !o && setInstallApp(null)}
          onConfirm={confirmInstall}
        />
        <AppDetailDialog
          app={detailApp}
          open={!!detailApp}
          onOpenChange={(o) => !o && setDetailApp(null)}
          installed={detailApp ? installedIds.has(detailApp.id) : false}
          onInstall={confirmInstall}
        />
        <PublishAppDialog open={publishOpen} onOpenChange={setPublishOpen} />
      </div>
    </TooltipProvider>
  );
}

export default DevMarketplaceV2;
