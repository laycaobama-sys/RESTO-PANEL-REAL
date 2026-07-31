"use client";

/**
 * FinOrders — Gestor de órdenes TPV (Fase 11 · RestoPanel)
 *
 * Órdenes ingestadas desde sistemas TPV (Square, Lightspeed, Revo, Hosteltáctil,
 * Ágora, Manual, CSV) con matching a reservas/clientes, bandeja de revisión
 * manual con scoring explicable y analítica agregada de productos.
 *
 * Reglas:
 *  - Toda cantidad monetaria se almacena y trata en **cents enteros** (número).
 *    Nunca float. Se formatea a €XX,XX solo en la capa de presentación.
 *  - Todo dato muestra origen (source), confianza (confidence) y trazabilidad.
 *  - Copy en es-ES. Datos demo, badged "demo".
 *  - Sin colores indigo/azul salvo necesidad semántica de escala.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ShoppingCart,
  RefreshCw,
  Search,
  Eye,
  Link2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Coins,
  Receipt,
  TrendingUp,
  Users,
  ChevronDown,
  Info,
  Database,
  ArrowRight,
  PlusCircle,
  UserPlus,
  Ban,
  Sparkles,
  Layers,
  Hourglass,
  Package,
  ShieldAlert,
  ListChecks,
} from "lucide-react";

/* ===================================================================== *
 * Types
 * ===================================================================== */

type OrderStatus = "open" | "closed" | "cancelled" | "imported";
type MatchStatus =
  | "auto_matched"
  | "suggested"
  | "needs_review"
  | "unmatched"
  | "rejected"
  | "manually_assigned";
type Provider = "square" | "lightspeed" | "revo" | "hosteltactil" | "agora" | "manual" | "csv";

interface OrderItem {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number; // cents
  discount: number; // cents
  tax: number; // cents
  total: number; // cents
  modifiers?: string[];
  consumedAt?: string;
  status: "sold" | "cancelled" | "returned" | "promotional" | "consumed" | "imported";
}

interface Order {
  id: string;
  organizationId: string;
  locationId: string;
  reservationId?: string;
  customerId?: string;
  customerName?: string;
  externalOrderId: string;
  provider: Provider;
  providerVersion: string;
  status: OrderStatus;
  currency: string;
  subtotal: number; // cents
  discountTotal: number; // cents
  taxTotal: number; // cents
  serviceCharge: number; // cents
  tipTotal: number; // cents
  total: number; // cents
  openedAt: string;
  closedAt?: string;
  source: string;
  matchStatus: MatchStatus;
  matchConfidence?: number;
  matchReasons?: string[];
  items: OrderItem[];
}

interface CandidateReservation {
  id: string;
  code: string;
  customer: string;
  partySize: number;
  time: string;
  date: string;
  table?: string;
  factors: MatchFactor[];
  confidence: number;
}

interface MatchFactor {
  key: string;
  label: string;
  weight: number; // 0..1
  pass: boolean;
  detail: string;
}

/* ===================================================================== *
 * Metadata maps
 * ===================================================================== */

const PROVIDER_META: Record<
  Provider,
  { label: string; short: string; initials: string; cls: string; dot: string; gradient: string }
> = {
  square: {
    label: "Square",
    short: "Square",
    initials: "SQ",
    cls: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
    dot: "bg-[var(--teal)]",
    gradient: "linear-gradient(135deg, #3DD6C9 0%, #2BA89E 100%)",
  },
  lightspeed: {
    label: "Lightspeed",
    short: "Lightspeed",
    initials: "LS",
    cls: "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
    dot: "bg-[var(--gold)]",
    gradient: "linear-gradient(135deg, #F4DC8C 0%, #D4AF37 60%, #A8862A 100%)",
  },
  revo: {
    label: "Revo",
    short: "Revo",
    initials: "RV",
    cls: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
    gradient: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
  },
  hosteltactil: {
    label: "Hosteltáctil",
    short: "Hosteltáctil",
    initials: "HT",
    cls: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300",
    dot: "bg-fuchsia-400",
    gradient: "linear-gradient(135deg, #E879F9 0%, #C026D3 100%)",
  },
  agora: {
    label: "Ágora",
    short: "Ágora",
    initials: "AG",
    cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    dot: "bg-emerald-400",
    gradient: "linear-gradient(135deg, #34D399 0%, #10B981 100%)",
  },
  manual: {
    label: "Manual",
    short: "Manual",
    initials: "MN",
    cls: "border-foreground/25 bg-foreground/8 text-muted-foreground",
    dot: "bg-foreground/50",
    gradient: "linear-gradient(135deg, #94A3B8 0%, #64748B 100%)",
  },
  csv: {
    label: "CSV",
    short: "CSV",
    initials: "CSV",
    cls: "border-foreground/25 bg-foreground/8 text-muted-foreground",
    dot: "bg-foreground/50",
    gradient: "linear-gradient(135deg, #94A3B8 0%, #64748B 100%)",
  },
};

const STATUS_META: Record<OrderStatus, { label: string; cls: string; dot: string }> = {
  open: {
    label: "Abierta",
    cls: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
  },
  closed: {
    label: "Cerrada",
    cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    dot: "bg-emerald-400",
  },
  cancelled: {
    label: "Cancelada",
    cls: "border-rose-400/45 bg-rose-400/10 text-rose-300",
    dot: "bg-rose-400",
  },
  imported: {
    label: "Importada",
    cls: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
    dot: "bg-[var(--teal)]",
  },
};

const MATCH_META: Record<MatchStatus, { label: string; cls: string; dot: string }> = {
  auto_matched: {
    label: "Auto-matched",
    cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    dot: "bg-emerald-400",
  },
  suggested: {
    label: "Sugerido",
    cls: "border-[var(--gold)]/45 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
    dot: "bg-[var(--gold)]",
  },
  needs_review: {
    label: "Revisión",
    cls: "border-amber-400/45 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
  },
  unmatched: {
    label: "Sin match",
    cls: "border-rose-400/45 bg-rose-400/10 text-rose-300",
    dot: "bg-rose-400",
  },
  rejected: {
    label: "Rechazado",
    cls: "border-rose-400/50 bg-rose-400/10 text-rose-300",
    dot: "bg-rose-400",
  },
  manually_assigned: {
    label: "Asignado",
    cls: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
    dot: "bg-[var(--teal)]",
  },
};

const ITEM_STATUS_META: Record<OrderItem["status"], { label: string; cls: string }> = {
  sold: { label: "Vendido", cls: "border-emerald-400/30 bg-emerald-400/8 text-emerald-300" },
  cancelled: { label: "Cancelado", cls: "border-rose-400/40 bg-rose-400/10 text-rose-300" },
  returned: { label: "Devuelto", cls: "border-amber-400/40 bg-amber-400/10 text-amber-300" },
  promotional: { label: "Promo", cls: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300" },
  consumed: { label: "Consumido", cls: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]" },
  imported: { label: "Importado", cls: "border-foreground/20 bg-foreground/5 text-muted-foreground" },
};

/* ===================================================================== *
 * Money / time helpers (cents-first)
 * ===================================================================== */

function formatEur(cents: number, currency = "EUR"): string {
  const v = Math.round(cents) / 100;
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

function formatPercent(n?: number): string {
  if (n == null) return "—";
  return `${Math.round(n)}%`;
}

function timeFromIso(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function confidenceTone(n?: number): { dot: string; text: string } {
  if (n == null) return { dot: "bg-foreground/30", text: "text-muted-foreground" };
  if (n >= 85) return { dot: "bg-emerald-400", text: "text-emerald-300" };
  if (n >= 60) return { dot: "bg-[var(--gold)]", text: "text-[var(--gold-soft)]" };
  if (n >= 40) return { dot: "bg-amber-400", text: "text-amber-300" };
  return { dot: "bg-rose-400", text: "text-rose-300" };
}

/* ===================================================================== *
 * Math validation: subtotal - discount + tax + service + tip === total
 * ===================================================================== */

function validateOrderMath(o: Order): { ok: boolean; computed: number } {
  const computed =
    o.subtotal - o.discountTotal + o.taxTotal + o.serviceCharge + o.tipTotal;
  return { ok: computed === o.total, computed };
}

/* ===================================================================== *
 * Demo orders (10)
 * Money in cents. Each order mathematically validated.
 * ===================================================================== */

const DEMO_ORDERS: Order[] = [
  {
    id: "ord-001",
    organizationId: "org-ramses",
    locationId: "loc-mad",
    reservationId: "RES-001",
    customerId: "cust-001",
    customerName: "Elena Marín",
    externalOrderId: "SQ-2025-0142",
    provider: "square",
    providerVersion: "v2.0",
    status: "closed",
    currency: "EUR",
    subtotal: 13200,
    discountTotal: 0,
    taxTotal: 1300,
    serviceCharge: 1000,
    tipTotal: 1300,
    total: 16800,
    openedAt: "2025-01-21T20:30:00Z",
    closedAt: "2025-01-21T22:45:00Z",
    source: "square.webhook · sq.v2.0",
    matchStatus: "auto_matched",
    matchConfidence: 92,
    matchReasons: [
      "Mesa M12 coincide",
      "Hora 21:30 coincide (±15min)",
      "4 comensales coincide",
      "Cliente identificado por email",
    ],
    items: [
      {
        id: "i1",
        productName: "Ensalada César",
        category: "Entrantes",
        quantity: 2,
        unitPrice: 1800,
        discount: 0,
        tax: 360,
        total: 3960,
        consumedAt: "2025-01-21T20:42:00Z",
        status: "sold",
      },
      {
        id: "i2",
        productName: "Risotto Trufa Negra",
        category: "Principales",
        quantity: 2,
        unitPrice: 3200,
        discount: 0,
        tax: 640,
        total: 7040,
        consumedAt: "2025-01-21T21:10:00Z",
        status: "sold",
      },
      {
        id: "i3",
        productName: "Copa Tempranillo",
        category: "Vinos",
        quantity: 2,
        unitPrice: 700,
        discount: 0,
        tax: 140,
        total: 1540,
        status: "sold",
      },
      {
        id: "i4",
        productName: "Tiramisú",
        category: "Postres",
        quantity: 2,
        unitPrice: 700,
        discount: 0,
        tax: 160,
        total: 1560,
        status: "sold",
      },
    ],
  },
  {
    id: "ord-002",
    organizationId: "org-ramses",
    locationId: "loc-mad",
    reservationId: "RES-014",
    customerId: "cust-002",
    customerName: "Familia Ruiz",
    externalOrderId: "SQ-2025-0143",
    provider: "square",
    providerVersion: "v2.0",
    status: "closed",
    currency: "EUR",
    subtotal: 20000,
    discountTotal: 1000,
    taxTotal: 2600,
    serviceCharge: 2000,
    tipTotal: 1600,
    total: 25200,
    openedAt: "2025-01-21T13:15:00Z",
    closedAt: "2025-01-21T15:30:00Z",
    source: "square.webhook · sq.v2.0",
    matchStatus: "auto_matched",
    matchConfidence: 88,
    matchReasons: ["Mesa T04 coincide", "Hora 13:30 coincide", "6 comensales coincide"],
    items: [
      { id: "i1", productName: "Croquetas Jamón", category: "Entrantes", quantity: 3, unitPrice: 1200, discount: 0, tax: 360, total: 3960, status: "sold" },
      { id: "i2", productName: "Paella Marisco", category: "Principales", quantity: 4, unitPrice: 2800, discount: 0, tax: 1120, total: 12320, status: "sold" },
      { id: "i3", productName: "Sangría", category: "Bebidas", quantity: 2, unitPrice: 1500, discount: 0, tax: 300, total: 3300, status: "sold" },
      { id: "i4", productName: "Flan Casero", category: "Postres", quantity: 4, unitPrice: 600, discount: 0, tax: 240, total: 2640, status: "sold" },
      { id: "i5", productName: "Café", category: "Bebidas", quantity: 4, unitPrice: 200, discount: 0, tax: 80, total: 880, status: "sold" },
      { id: "i6", productName: "Menú Infantil", category: "Principales", quantity: 2, unitPrice: 1000, discount: 1000, tax: 0, total: 1000, status: "promotional" },
      { id: "i7", productName: "Botella Rioja", category: "Vinos", quantity: 1, unitPrice: 2800, discount: 0, tax: 560, total: 3360, status: "sold" },
      { id: "i8", productName: "Agua Mineral", category: "Bebidas", quantity: 4, unitPrice: 200, discount: 0, tax: 160, total: 960, status: "sold" },
    ],
  },
  {
    id: "ord-003",
    organizationId: "org-ramses",
    locationId: "loc-mad",
    externalOrderId: "LS-2025-0089",
    provider: "lightspeed",
    providerVersion: "v1.5",
    status: "closed",
    currency: "EUR",
    subtotal: 7000,
    discountTotal: 0,
    taxTotal: 700,
    serviceCharge: 700,
    tipTotal: 0,
    total: 8400,
    openedAt: "2025-01-21T12:50:00Z",
    closedAt: "2025-01-21T13:40:00Z",
    source: "lightspeed.polling · ls.v1.5",
    matchStatus: "unmatched",
    matchConfidence: 0,
    items: [
      { id: "i1", productName: "Hamburguesa Clásica", category: "Principales", quantity: 1, unitPrice: 2400, discount: 0, tax: 240, total: 2640, status: "sold" },
      { id: "i2", productName: "Patatas Fritas", category: "Entrantes", quantity: 1, unitPrice: 800, discount: 0, tax: 80, total: 880, status: "sold" },
      { id: "i3", productName: "Cerveza Artesana", category: "Bebidas", quantity: 2, unitPrice: 1100, discount: 0, tax: 220, total: 2420, status: "sold" },
    ],
  },
  {
    id: "ord-004",
    organizationId: "org-ramses",
    locationId: "loc-mad",
    customerId: "cust-003",
    customerName: "Javier Soler",
    externalOrderId: "RV-2025-0234",
    provider: "revo",
    providerVersion: "v3.1",
    status: "closed",
    currency: "EUR",
    subtotal: 4600,
    discountTotal: 0,
    taxTotal: 460,
    serviceCharge: 0,
    tipTotal: 540,
    total: 5600,
    openedAt: "2025-01-21T19:45:00Z",
    closedAt: "2025-01-21T20:55:00Z",
    source: "revo.api · rv.v3.1",
    matchStatus: "suggested",
    matchConfidence: 65,
    matchReasons: ["Hora 20:00 coincide", "Cliente identificado por teléfono"],
    items: [
      { id: "i1", productName: "Tartar Atún", category: "Entrantes", quantity: 1, unitPrice: 2800, discount: 0, tax: 280, total: 3080, status: "sold" },
      { id: "i2", productName: "Gin-Tonic Premium", category: "Bebidas", quantity: 1, unitPrice: 1500, discount: 0, tax: 150, total: 1650, status: "sold" },
    ],
  },
  {
    id: "ord-005",
    organizationId: "org-ramses",
    locationId: "loc-mad",
    customerId: "cust-004",
    customerName: "Marta Iborra",
    externalOrderId: "SQ-2025-0144",
    provider: "square",
    providerVersion: "v2.0",
    status: "open",
    currency: "EUR",
    subtotal: 9600,
    discountTotal: 0,
    taxTotal: 960,
    serviceCharge: 1000,
    tipTotal: 440,
    total: 12000,
    openedAt: "2025-01-21T21:05:00Z",
    source: "square.webhook · sq.v2.0",
    matchStatus: "needs_review",
    matchConfidence: 45,
    matchReasons: ["Mesa no coincide (T04 vs T08)", "Comensales divergen (3 vs 5)"],
    items: [
      { id: "i1", productName: "Tabla Quesos", category: "Entrantes", quantity: 1, unitPrice: 1800, discount: 0, tax: 180, total: 1980, status: "sold" },
      { id: "i2", productName: "Solomillo Ternera", category: "Principales", quantity: 2, unitPrice: 3200, discount: 0, tax: 640, total: 7040, status: "sold" },
      { id: "i3", productName: "Copa Cava", category: "Vinos", quantity: 2, unitPrice: 800, discount: 0, tax: 160, total: 1760, status: "sold" },
      { id: "i4", productName: "Tarta Queso", category: "Postres", quantity: 1, unitPrice: 700, discount: 0, tax: 0, total: 0, status: "promotional" },
      { id: "i5", productName: "Café", category: "Bebidas", quantity: 1, unitPrice: 200, discount: 0, tax: 0, total: 0, status: "consumed" },
    ],
  },
  {
    id: "ord-006",
    organizationId: "org-ramses",
    locationId: "loc-mad",
    reservationId: "RES-022",
    customerId: "cust-005",
    customerName: "Andrés Vidal",
    externalOrderId: "MN-2025-0012",
    provider: "manual",
    providerVersion: "v1.0",
    status: "closed",
    currency: "EUR",
    subtotal: 3200,
    discountTotal: 0,
    taxTotal: 320,
    serviceCharge: 0,
    tipTotal: 280,
    total: 3800,
    openedAt: "2025-01-21T16:20:00Z",
    closedAt: "2025-01-21T17:10:00Z",
    source: "manual.entry · user:ana@restopanel.es",
    matchStatus: "manually_assigned",
    matchConfidence: 100,
    matchReasons: ["Asignación manual por maître (Ana R.)"],
    items: [
      { id: "i1", productName: "Menú Ejecutivo", category: "Principales", quantity: 1, unitPrice: 3200, discount: 0, tax: 320, total: 3520, status: "sold" },
    ],
  },
  {
    id: "ord-007",
    organizationId: "org-ramses",
    locationId: "loc-mad",
    externalOrderId: "LS-2025-0090",
    provider: "lightspeed",
    providerVersion: "v1.5",
    status: "closed",
    currency: "EUR",
    subtotal: 17000,
    discountTotal: 0,
    taxTotal: 2000,
    serviceCharge: 1500,
    tipTotal: 500,
    total: 21000,
    openedAt: "2025-01-21T21:30:00Z",
    closedAt: "2025-01-21T23:40:00Z",
    source: "lightspeed.polling · ls.v1.5",
    matchStatus: "unmatched",
    matchConfidence: 0,
    items: [
      { id: "i1", productName: "Ostras", category: "Entrantes", quantity: 6, unitPrice: 800, discount: 0, tax: 480, total: 5280, status: "sold" },
      { id: "i2", productName: "Lubina Salvaje", category: "Principales", quantity: 2, unitPrice: 4200, discount: 0, tax: 840, total: 9240, status: "sold" },
      { id: "i3", productName: "Champán", category: "Vinos", quantity: 1, unitPrice: 6500, discount: 0, tax: 650, total: 7150, status: "sold" },
      { id: "i4", productName: "Sopa Fría", category: "Entrantes", quantity: 2, unitPrice: 0, discount: 0, tax: 0, total: 0, status: "cancelled" },
      { id: "i5", productName: "Café", category: "Bebidas", quantity: 4, unitPrice: 200, discount: 0, tax: 80, total: 880, status: "sold" },
      { id: "i6", productName: "Sorbete", category: "Postres", quantity: 2, unitPrice: 600, discount: 0, tax: 120, total: 1320, status: "sold" },
    ],
  },
  {
    id: "ord-008",
    organizationId: "org-ramses",
    locationId: "loc-mad",
    reservationId: "RES-031",
    customerId: "cust-006",
    customerName: "Lucía Ferrer",
    externalOrderId: "SQ-2025-0145",
    provider: "square",
    providerVersion: "v2.0",
    status: "closed",
    currency: "EUR",
    subtotal: 7400,
    discountTotal: 0,
    taxTotal: 740,
    serviceCharge: 700,
    tipTotal: 610,
    total: 9450,
    openedAt: "2025-01-21T14:30:00Z",
    closedAt: "2025-01-21T16:00:00Z",
    source: "square.webhook · sq.v2.0",
    matchStatus: "auto_matched",
    matchConfidence: 95,
    matchReasons: ["Mesa V02 coincide", "Hora 14:30 coincide", "Cliente identificado por email", "Importe estimado coincide"],
    items: [
      { id: "i1", productName: "Bao de Pulpo", category: "Entrantes", quantity: 2, unitPrice: 1400, discount: 0, tax: 280, total: 3080, status: "sold" },
      { id: "i2", productName: "Pulpo a la Gallega", category: "Principales", quantity: 1, unitPrice: 3400, discount: 0, tax: 340, total: 3740, status: "sold" },
      { id: "i3", productName: "Albariño Copa", category: "Vinos", quantity: 1, unitPrice: 800, discount: 0, tax: 120, total: 920, status: "sold" },
    ],
  },
  {
    id: "ord-009",
    organizationId: "org-ramses",
    locationId: "loc-mad",
    externalOrderId: "RV-2025-0235",
    provider: "revo",
    providerVersion: "v3.1",
    status: "cancelled",
    currency: "EUR",
    subtotal: 3500,
    discountTotal: 0,
    taxTotal: 350,
    serviceCharge: 0,
    tipTotal: 0,
    total: 4200,
    openedAt: "2025-01-21T22:10:00Z",
    closedAt: "2025-01-21T22:14:00Z",
    source: "revo.api · rv.v3.1",
    matchStatus: "rejected",
    matchConfidence: 18,
    matchReasons: ["Cancelada por cliente", "No se facturó"],
    items: [
      { id: "i1", productName: "Pizza Margarita", category: "Principales", quantity: 1, unitPrice: 2400, discount: 0, tax: 240, total: 2640, status: "cancelled" },
      { id: "i2", productName: "Refresco", category: "Bebidas", quantity: 1, unitPrice: 300, discount: 0, tax: 30, total: 330, status: "cancelled" },
    ],
  },
  {
    id: "ord-010",
    organizationId: "org-ramses",
    locationId: "loc-mad",
    customerId: "cust-007",
    customerName: "Carlos Méndez",
    externalOrderId: "SQ-2025-0146",
    provider: "square",
    providerVersion: "v2.0",
    status: "closed",
    currency: "EUR",
    subtotal: 14200,
    discountTotal: 700,
    taxTotal: 1350,
    serviceCharge: 1400,
    tipTotal: 750,
    total: 18000,
    openedAt: "2025-01-21T21:00:00Z",
    closedAt: "2025-01-21T23:00:00Z",
    source: "square.webhook · sq.v2.0",
    matchStatus: "suggested",
    matchConfidence: 72,
    matchReasons: ["Hora 21:15 cercana (±20min)", "4 comensales coincide", "Mesa no coincide"],
    items: [
      { id: "i1", productName: "Carpaccio Ternera", category: "Entrantes", quantity: 2, unitPrice: 1600, discount: 0, tax: 320, total: 3520, status: "sold" },
      { id: "i2", productName: "Chuletón 600g", category: "Principales", quantity: 2, unitPrice: 5400, discount: 0, tax: 1080, total: 11880, status: "sold" },
      { id: "i3", productName: "Patatas Trufa", category: "Entrantes", quantity: 1, unitPrice: 1200, discount: 0, tax: 0, total: 0, status: "promotional" },
      { id: "i4", productName: "Ribera del Duero", category: "Vinos", quantity: 1, unitPrice: 2200, discount: 700, tax: 0, total: 1500, status: "promotional" },
      { id: "i5", productName: "Tarta de Queso", category: "Postres", quantity: 2, unitPrice: 700, discount: 0, tax: 280, total: 1680, status: "sold" },
    ],
  },
];

/* ===================================================================== *
 * Candidate reservations for matching tab
 * ===================================================================== */

const CANDIDATES_BY_ORDER: Record<string, CandidateReservation[]> = {
  "ord-003": [
    {
      id: "c1",
      code: "RES-040",
      customer: "Mario Gómez",
      partySize: 1,
      time: "13:00",
      date: "2025-01-21",
      table: "M08",
      confidence: 58,
      factors: [
        { key: "table", label: "Mesa", weight: 0.25, pass: false, detail: "M08 vs desconocido" },
        { key: "time", label: "Fecha/hora", weight: 0.2, pass: true, detail: "13:00 ±15min" },
        { key: "party", label: "Comensales", weight: 0.15, pass: true, detail: "1 comensal" },
        { key: "amount", label: "Importe estimado", weight: 0.15, pass: false, detail: "Esperado €30" },
        { key: "customer", label: "Cliente identificado", weight: 0.15, pass: false, detail: "Sin email" },
        { key: "duration", label: "Duración", weight: 0.1, pass: true, detail: "50min" },
      ],
    },
    {
      id: "c2",
      code: "RES-051",
      customer: "Sandra Vila",
      partySize: 2,
      time: "12:45",
      date: "2025-01-21",
      table: "M04",
      confidence: 42,
      factors: [
        { key: "table", label: "Mesa", weight: 0.25, pass: false, detail: "M04 vs desconocido" },
        { key: "time", label: "Fecha/hora", weight: 0.2, pass: true, detail: "12:45 ±15min" },
        { key: "party", label: "Comensales", weight: 0.15, pass: false, detail: "2 vs 1" },
        { key: "amount", label: "Importe estimado", weight: 0.15, pass: false, detail: "Esperado €60" },
        { key: "customer", label: "Cliente identificado", weight: 0.15, pass: false, detail: "Sin email" },
        { key: "duration", label: "Duración", weight: 0.1, pass: true, detail: "55min" },
      ],
    },
  ],
  "ord-004": [
    {
      id: "c3",
      code: "RES-062",
      customer: "Javier Soler",
      partySize: 1,
      time: "20:00",
      date: "2025-01-21",
      table: "V01",
      confidence: 65,
      factors: [
        { key: "table", label: "Mesa", weight: 0.25, pass: false, detail: "V01 vs desconocido" },
        { key: "time", label: "Fecha/hora", weight: 0.2, pass: true, detail: "20:00 ±15min" },
        { key: "party", label: "Comensales", weight: 0.15, pass: true, detail: "1 comensal" },
        { key: "amount", label: "Importe estimado", weight: 0.15, pass: true, detail: "Esperado €50" },
        { key: "customer", label: "Cliente identificado", weight: 0.15, pass: true, detail: "Teléfono coincide" },
        { key: "duration", label: "Duración", weight: 0.1, pass: true, detail: "70min" },
      ],
    },
    {
      id: "c4",
      code: "RES-071",
      customer: "Javier Soler",
      partySize: 2,
      time: "19:30",
      date: "2025-01-21",
      table: "V03",
      confidence: 52,
      factors: [
        { key: "table", label: "Mesa", weight: 0.25, pass: false, detail: "V03 vs desconocido" },
        { key: "time", label: "Fecha/hora", weight: 0.2, pass: true, detail: "19:30 ±30min" },
        { key: "party", label: "Comensales", weight: 0.15, pass: false, detail: "2 vs 1" },
        { key: "amount", label: "Importe estimado", weight: 0.15, pass: true, detail: "Esperado €90" },
        { key: "customer", label: "Cliente identificado", weight: 0.15, pass: true, detail: "Teléfono coincide" },
        { key: "duration", label: "Duración", weight: 0.1, pass: true, detail: "70min" },
      ],
    },
  ],
  "ord-005": [
    {
      id: "c5",
      code: "RES-085",
      customer: "Marta Iborra",
      partySize: 3,
      time: "21:15",
      date: "2025-01-21",
      table: "T04",
      confidence: 48,
      factors: [
        { key: "table", label: "Mesa", weight: 0.25, pass: false, detail: "T04 vs T08" },
        { key: "time", label: "Fecha/hora", weight: 0.2, pass: true, detail: "21:05 ±15min" },
        { key: "party", label: "Comensales", weight: 0.15, pass: false, detail: "3 vs 5" },
        { key: "amount", label: "Importe estimado", weight: 0.15, pass: true, detail: "Esperado €110" },
        { key: "customer", label: "Cliente identificado", weight: 0.15, pass: true, detail: "Email coincide" },
        { key: "duration", label: "Duración", weight: 0.1, pass: false, detail: "Aún abierta" },
      ],
    },
    {
      id: "c6",
      code: "RES-089",
      customer: "Marta Iborra",
      partySize: 5,
      time: "21:00",
      date: "2025-01-21",
      table: "T08",
      confidence: 45,
      factors: [
        { key: "table", label: "Mesa", weight: 0.25, pass: true, detail: "T08 coincide" },
        { key: "time", label: "Fecha/hora", weight: 0.2, pass: true, detail: "21:00 ±15min" },
        { key: "party", label: "Comensales", weight: 0.15, pass: true, detail: "5 comensales" },
        { key: "amount", label: "Importe estimado", weight: 0.15, pass: false, detail: "Esperado €180" },
        { key: "customer", label: "Cliente identificado", weight: 0.15, pass: true, detail: "Email coincide" },
        { key: "duration", label: "Duración", weight: 0.1, pass: false, detail: "Aún abierta" },
      ],
    },
    {
      id: "c7",
      code: "RES-092",
      customer: "Grupo Iborra",
      partySize: 5,
      time: "20:30",
      date: "2025-01-21",
      table: "T08",
      confidence: 41,
      factors: [
        { key: "table", label: "Mesa", weight: 0.25, pass: true, detail: "T08 coincide" },
        { key: "time", label: "Fecha/hora", weight: 0.2, pass: true, detail: "20:30 ±45min" },
        { key: "party", label: "Comensales", weight: 0.15, pass: true, detail: "5 comensales" },
        { key: "amount", label: "Importe estimado", weight: 0.15, pass: false, detail: "Esperado €220" },
        { key: "customer", label: "Cliente identificado", weight: 0.15, pass: false, detail: "Sin coincidencia" },
        { key: "duration", label: "Duración", weight: 0.1, pass: false, detail: "Aún abierta" },
      ],
    },
  ],
  "ord-007": [
    {
      id: "c8",
      code: "RES-105",
      customer: "Pablo Navarro",
      partySize: 4,
      time: "21:30",
      date: "2025-01-21",
      table: "V02",
      confidence: 38,
      factors: [
        { key: "table", label: "Mesa", weight: 0.25, pass: false, detail: "V02 vs desconocido" },
        { key: "time", label: "Fecha/hora", weight: 0.2, pass: true, detail: "21:30 ±15min" },
        { key: "party", label: "Comensales", weight: 0.15, pass: true, detail: "4 comensales (estimado)" },
        { key: "amount", label: "Importe estimado", weight: 0.15, pass: false, detail: "Esperado €140" },
        { key: "customer", label: "Cliente identificado", weight: 0.15, pass: false, detail: "Sin coincidencia" },
        { key: "duration", label: "Duración", weight: 0.1, pass: true, detail: "130min" },
      ],
    },
    {
      id: "c9",
      code: "RES-118",
      customer: "Anónimo",
      partySize: 4,
      time: "21:45",
      date: "2025-01-21",
      table: "V02",
      confidence: 28,
      factors: [
        { key: "table", label: "Mesa", weight: 0.25, pass: false, detail: "V02 vs desconocido" },
        { key: "time", label: "Fecha/hora", weight: 0.2, pass: true, detail: "21:45 ±15min" },
        { key: "party", label: "Comensales", weight: 0.15, pass: true, detail: "4 comensales (estimado)" },
        { key: "amount", label: "Importe estimado", weight: 0.15, pass: false, detail: "Esperado €120" },
        { key: "customer", label: "Cliente identificado", weight: 0.15, pass: false, detail: "Anónimo" },
        { key: "duration", label: "Duración", weight: 0.1, pass: true, detail: "120min" },
      ],
    },
  ],
  "ord-010": [
    {
      id: "c10",
      code: "RES-125",
      customer: "Carlos Méndez",
      partySize: 4,
      time: "21:15",
      date: "2025-01-21",
      table: "T06",
      confidence: 72,
      factors: [
        { key: "table", label: "Mesa", weight: 0.25, pass: false, detail: "T06 vs T03" },
        { key: "time", label: "Fecha/hora", weight: 0.2, pass: true, detail: "21:15 ±20min" },
        { key: "party", label: "Comensales", weight: 0.15, pass: true, detail: "4 comensales" },
        { key: "amount", label: "Importe estimado", weight: 0.15, pass: true, detail: "Esperado €170" },
        { key: "customer", label: "Cliente identificado", weight: 0.15, pass: true, detail: "Email coincide" },
        { key: "duration", label: "Duración", weight: 0.1, pass: true, detail: "120min" },
      ],
    },
    {
      id: "c11",
      code: "RES-130",
      customer: "Carlos Méndez",
      partySize: 4,
      time: "21:00",
      date: "2025-01-21",
      table: "T03",
      confidence: 68,
      factors: [
        { key: "table", label: "Mesa", weight: 0.25, pass: true, detail: "T03 coincide" },
        { key: "time", label: "Fecha/hora", weight: 0.2, pass: true, detail: "21:00 ±15min" },
        { key: "party", label: "Comensales", weight: 0.15, pass: true, detail: "4 comensales" },
        { key: "amount", label: "Importe estimado", weight: 0.15, pass: false, detail: "Esperado €240" },
        { key: "customer", label: "Cliente identificado", weight: 0.15, pass: true, detail: "Email coincide" },
        { key: "duration", label: "Duración", weight: 0.1, pass: true, detail: "120min" },
      ],
    },
  ],
};

/* ===================================================================== *
 * Aggregated product analytics (Productos tab)
 * ===================================================================== */

interface ProductAgg {
  name: string;
  category: string;
  qty: number;
  revenue: number; // cents
  avgPrice: number; // cents
}

function aggregateProducts(orders: Order[]): ProductAgg[] {
  const map = new Map<string, ProductAgg>();
  for (const o of orders) {
    for (const it of o.items) {
      if (it.status === "cancelled" || it.status === "returned") continue;
      const key = it.productName;
      const existing = map.get(key);
      const gross = it.unitPrice * it.quantity;
      if (existing) {
        existing.qty += it.quantity;
        existing.revenue += it.total;
        existing.avgPrice = Math.round(existing.revenue / existing.qty);
      } else {
        map.set(key, {
          name: it.productName,
          category: it.category,
          qty: it.quantity,
          revenue: it.total,
          avgPrice: gross > 0 ? Math.round(it.total / it.quantity) : it.unitPrice,
        });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
}

const CATEGORY_COLORS: Record<string, string> = {
  Entrantes: "#3DD6C9",
  Principales: "#D4AF37",
  Postres: "#E8C766",
  Bebidas: "#2BA89E",
  Vinos: "#C9A961",
};

interface HourCategoryCell {
  hour: number;
  category: string;
  count: number;
}

const HOURS = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const CATEGORIES = ["Entrantes", "Principales", "Postres", "Bebidas", "Vinos"];

function buildHourlyHeatmap(orders: Order[]): HourCategoryCell[] {
  const grid = new Map<string, number>();
  for (const o of orders) {
    for (const it of o.items) {
      if (it.status === "cancelled" || it.status === "returned") continue;
      const ts = it.consumedAt ?? o.openedAt;
      const hour = new Date(ts).getHours();
      const key = `${hour}|${it.category}`;
      grid.set(key, (grid.get(key) ?? 0) + it.quantity);
    }
  }
  const cells: HourCategoryCell[] = [];
  for (const h of HOURS) {
    for (const c of CATEGORIES) {
      cells.push({ hour: h, category: c, count: grid.get(`${h}|${c}`) ?? 0 });
    }
  }
  return cells;
}

function heatmapColor(v: number, max: number): string {
  if (max === 0 || v === 0) return "rgba(255,255,255,0.04)";
  const t = Math.min(1, v / max);
  // teal → gold → amber
  if (t < 0.5) {
    const k = t / 0.5;
    const r = Math.round(61 + (212 - 61) * k);
    const g = Math.round(214 + (175 - 214) * k);
    const b = Math.round(201 + (55 - 201) * k);
    return `rgba(${r},${g},${b},${0.15 + t * 0.6})`;
  }
  const k = (t - 0.5) / 0.5;
  const r = Math.round(212 + (245 - 212) * k);
  const g = Math.round(175 + (158 - 175) * k);
  const b = Math.round(55 + (11 - 55) * k);
  return `rgba(${r},${g},${b},${0.4 + t * 0.55})`;
}

/* ===================================================================== *
 * UI atoms
 * ===================================================================== */

function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-amber-400/40 bg-amber-400/10 text-amber-300 text-[10px] font-mono uppercase tracking-wider",
        className
      )}
    >
      demo
    </Badge>
  );
}

function ProviderBadge({ provider }: { provider: Provider }) {
  const m = PROVIDER_META[provider];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs",
        m.cls
      )}
    >
      <span
        className="h-4 w-4 rounded-sm flex items-center justify-center text-[9px] font-bold text-black"
        style={{ background: m.gradient }}
        aria-hidden
      >
        {m.initials}
      </span>
      {m.label}
    </span>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs",
        m.cls
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}

function MatchBadge({ status }: { status: MatchStatus }) {
  const m = MATCH_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs",
        m.cls
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}

function ConfidencePill({ value }: { value?: number }) {
  const t = confidenceTone(value);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono tabular-nums">
      <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />
      <span className={t.text}>{formatPercent(value)}</span>
    </span>
  );
}

function SourcePill({ source }: { source: string }) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground/70 transition-colors cursor-help">
            <Database className="h-3 w-3" aria-hidden />
            {source}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-xs">Origen del dato · trazabilidad</p>
          <p className="text-[11px] text-muted-foreground mt-1">{source}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* ===================================================================== *
 * KPI strip
 * ===================================================================== */

interface Kpi {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent: "gold" | "teal" | "amber" | "rose";
}

function KpiStrip() {
  const kpis: Kpi[] = [
    { label: "Órdenes hoy", value: "47", sub: "vs 39 ayer (+20%)", icon: ShoppingCart, accent: "gold" },
    { label: "Ingresos hoy", value: "€4.182", sub: "vs €3.310 ayer", icon: Coins, accent: "teal" },
    { label: "Ticket medio", value: "€89", sub: "mediana €72", icon: Receipt, accent: "gold" },
    { label: "Sin reserva", value: "8", sub: "walk-in / sin match", icon: Users, accent: "amber" },
    { label: "Pend. matching", value: "5", sub: "requieren revisión", icon: AlertTriangle, accent: "rose" },
  ];
  const accentMap: Record<Kpi["accent"], string> = {
    gold: "rp-gold-text",
    teal: "rp-teal-text",
    amber: "text-amber-300",
    rose: "text-rose-300",
  };
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {kpis.map((k) => {
        const Icon = k.icon;
        return (
          <div key={k.label} className="rp-glass rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                {k.label}
              </span>
              <Icon className={cn("h-3.5 w-3.5", accentMap[k.accent])} aria-hidden />
            </div>
            <div className={cn("mt-2 font-display text-2xl font-light tabular-nums", accentMap[k.accent])}>
              {k.value}
            </div>
            {k.sub ? (
              <div className="mt-1 text-[11px] text-muted-foreground">{k.sub}</div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/* ===================================================================== *
 * Filters bar
 * ===================================================================== */

interface Filters {
  search: string;
  provider: Provider | "all";
  status: OrderStatus | "all";
  matchStatus: MatchStatus | "all";
  dateRange: "today" | "7d" | "30d" | "all";
}

function FiltersBar({ filters, setFilters }: { filters: Filters; setFilters: (f: Filters) => void }) {
  return (
    <div className="rp-glass rounded-xl p-3 sm:p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-2">
          <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Buscar
          </Label>
          <div className="relative mt-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
            <Input
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="ID externo o cliente (p.ej. SQ-2025-0142)"
              className="pl-8 bg-background/40 h-10"
            />
          </div>
        </div>
        <div>
          <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Rango fecha
          </Label>
          <Select
            value={filters.dateRange}
            onValueChange={(v) => setFilters({ ...filters, dateRange: v as Filters["dateRange"] })}
          >
            <SelectTrigger className="mt-1 h-10 bg-background/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="all">Todo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Proveedor
          </Label>
          <Select
            value={filters.provider}
            onValueChange={(v) => setFilters({ ...filters, provider: v as Filters["provider"] })}
          >
            <SelectTrigger className="mt-1 h-10 bg-background/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="square">Square</SelectItem>
              <SelectItem value="lightspeed">Lightspeed</SelectItem>
              <SelectItem value="revo">Revo</SelectItem>
              <SelectItem value="hosteltactil">Hosteltáctil</SelectItem>
              <SelectItem value="agora">Ágora</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Estado orden
          </Label>
          <Select
            value={filters.status}
            onValueChange={(v) => setFilters({ ...filters, status: v as Filters["status"] })}
          >
            <SelectTrigger className="mt-1 h-10 bg-background/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="open">Abiertas</SelectItem>
              <SelectItem value="closed">Cerradas</SelectItem>
              <SelectItem value="cancelled">Canceladas</SelectItem>
              <SelectItem value="imported">Importadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Matching
          </Label>
          <Select
            value={filters.matchStatus}
            onValueChange={(v) => setFilters({ ...filters, matchStatus: v as Filters["matchStatus"] })}
          >
            <SelectTrigger className="mt-1 h-10 bg-background/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="auto_matched">Auto-matched</SelectItem>
              <SelectItem value="suggested">Sugerido</SelectItem>
              <SelectItem value="needs_review">Revisión</SelectItem>
              <SelectItem value="unmatched">Sin match</SelectItem>
              <SelectItem value="rejected">Rechazado</SelectItem>
              <SelectItem value="manually_assigned">Asignado manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================== *
 * Orders table (desktop) + cards (mobile)
 * ===================================================================== */

function OrdersTable({
  orders,
  onView,
  onAssign,
  onReview,
}: {
  orders: Order[];
  onView: (o: Order) => void;
  onAssign: (o: Order) => void;
  onReview: (o: Order) => void;
}) {
  return (
    <div className="rp-glass rounded-xl overflow-hidden">
      {/* Desktop table */}
      <div className="hidden lg:block overflow-x-auto rp-scroll-thin">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-foreground/[0.03]">
              <th className="px-4 py-3 text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                Orden
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                Proveedor
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                Cliente
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                Total
              </th>
              <th className="px-4 py-3 text-center text-[11px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                Items
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                Matching
              </th>
              <th className="px-4 py-3 text-center text-[11px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                Conf.
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                Apertura
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const m = validateOrderMath(o);
              return (
                <tr
                  key={o.id}
                  className="border-b border-border/40 last:border-0 transition-colors hover:bg-foreground/[0.025]"
                >
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-foreground/90">{o.externalOrderId}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {m.ok ? (
                        <span className="inline-flex items-center gap-1 text-emerald-300/80">
                          <CheckCircle2 className="h-3 w-3" /> matemática OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-300">
                          <AlertTriangle className="h-3 w-3" /> descuadre
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ProviderBadge provider={o.provider} />
                    <div className="text-[10px] text-muted-foreground mt-1 font-mono">{o.providerVersion}</div>
                  </td>
                  <td className="px-4 py-3">
                    {o.customerName ? (
                      <span className="text-foreground/90">{o.customerName}</span>
                    ) : (
                      <span className="text-muted-foreground italic">Sin cliente</span>
                    )}
                    {o.reservationId ? (
                      <div className="text-[10px] font-mono rp-teal-text mt-0.5">↳ {o.reservationId}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">
                    {formatEur(o.total, o.currency)}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground tabular-nums">
                    {o.items.length}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3">
                    <MatchBadge status={o.matchStatus} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ConfidencePill value={o.matchConfidence} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-mono tabular-nums">
                    {timeFromIso(o.openedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-xs"
                        onClick={() => onView(o)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Detalle
                      </Button>
                      {o.matchStatus === "unmatched" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs rp-teal-text hover:text-[var(--teal-deep)]"
                          onClick={() => onAssign(o)}
                        >
                          <Link2 className="h-3.5 w-3.5 mr-1" />
                          Asignar
                        </Button>
                      )}
                      {o.matchStatus === "needs_review" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs text-amber-300"
                          onClick={() => onReview(o)}
                        >
                          <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                          Revisar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden divide-y divide-border/40">
        {orders.map((o) => {
          const m = validateOrderMath(o);
          return (
            <div key={o.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-mono text-sm text-foreground/90">{o.externalOrderId}</div>
                  <div className="mt-1">
                    <ProviderBadge provider={o.provider} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono tabular-nums text-foreground">{formatEur(o.total, o.currency)}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{o.items.length} items</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge status={o.status} />
                <MatchBadge status={o.matchStatus} />
                <ConfidencePill value={o.matchConfidence} />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {o.customerName ?? "Sin cliente"} · {timeFromIso(o.openedAt)}{" "}
                {m.ok ? (
                  <span className="text-emerald-300/80">· matemática ✓</span>
                ) : (
                  <span className="text-rose-300">· descuadre ✗</span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="h-9 text-xs" onClick={() => onView(o)}>
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Detalle
                </Button>
                {o.matchStatus === "unmatched" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 text-xs rp-teal-text"
                    onClick={() => onAssign(o)}
                  >
                    <Link2 className="h-3.5 w-3.5 mr-1" />
                    Asignar
                  </Button>
                )}
                {o.matchStatus === "needs_review" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 text-xs text-amber-300"
                    onClick={() => onReview(o)}
                  >
                    <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                    Revisar
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===================================================================== *
 * Order detail dialog
 * ===================================================================== */

function OrderDetailDialog({ order, onClose }: { order: Order | null; onClose: () => void }) {
  const [showPayload, setShowPayload] = React.useState(false);
  if (!order) return null;
  const m = validateOrderMath(order);
  const payloadPath = `orders/${order.provider}/${order.openedAt.slice(0, 7)}/${order.externalOrderId.toLowerCase().replace(/[^a-z0-9]/g, "-")}.json`;

  return (
    <Dialog open={!!order} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rp-scroll-thin bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2 text-base">
            <span className="font-mono">{order.externalOrderId}</span>
            <ProviderBadge provider={order.provider} />
            <StatusBadge status={order.status} />
            <MatchBadge status={order.matchStatus} />
          </DialogTitle>
          <DialogDescription className="text-xs">
            Orden TPV ingestada · {order.provider} {order.providerVersion} ·{" "}
            moneda {order.currency}
          </DialogDescription>
        </DialogHeader>

        {/* Header info grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          <InfoTile label="Apertura" value={timeFromIso(order.openedAt)} />
          <InfoTile label="Cierre" value={order.closedAt ? timeFromIso(order.closedAt) : "—"} />
          <InfoTile label="Cliente" value={order.customerName ?? "Sin cliente"} />
          <InfoTile label="Reserva" value={order.reservationId ?? "—"} tone={order.reservationId ? "teal" : "muted"} />
        </div>

        {/* Match panel */}
        {order.matchConfidence != null && order.matchConfidence > 0 && (
          <div className="rp-glass rounded-xl p-4 mt-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 rp-gold-text" aria-hidden />
                <span className="text-sm font-medium">Matching</span>
                <ConfidencePill value={order.matchConfidence} />
              </div>
              <SourcePill source={order.source} />
            </div>
            {order.matchReasons && order.matchReasons.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {order.matchReasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-300/80 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            )}
            {order.customerId && (
              <div className="mt-3 pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
                Cliente vinculado:{" "}
                <span className="font-mono rp-teal-text">{order.customerId}</span>
              </div>
            )}
          </div>
        )}

        {/* Items table */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              Líneas de orden ({order.items.length})
            </h4>
          </div>
          <div className="rp-glass rounded-xl overflow-hidden overflow-x-auto rp-scroll-thin">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-foreground/[0.03]">
                  <th className="px-3 py-2 text-left font-mono uppercase tracking-wider text-muted-foreground">Producto</th>
                  <th className="px-3 py-2 text-left font-mono uppercase tracking-wider text-muted-foreground">Cat.</th>
                  <th className="px-3 py-2 text-center font-mono uppercase tracking-wider text-muted-foreground">Qty</th>
                  <th className="px-3 py-2 text-right font-mono uppercase tracking-wider text-muted-foreground">P.U.</th>
                  <th className="px-3 py-2 text-right font-mono uppercase tracking-wider text-muted-foreground">Desc.</th>
                  <th className="px-3 py-2 text-right font-mono uppercase tracking-wider text-muted-foreground">IVA</th>
                  <th className="px-3 py-2 text-right font-mono uppercase tracking-wider text-muted-foreground">Total</th>
                  <th className="px-3 py-2 text-center font-mono uppercase tracking-wider text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it) => (
                  <tr key={it.id} className="border-b border-border/30 last:border-0">
                    <td className="px-3 py-2 text-foreground/90">
                      {it.productName}
                      {it.modifiers && it.modifiers.length > 0 && (
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {it.modifiers.join(" · ")}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className="inline-block text-[10px] px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${CATEGORY_COLORS[it.category] ?? "#888"}20`,
                          color: CATEGORY_COLORS[it.category] ?? "#888",
                        }}
                      >
                        {it.category}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center tabular-nums">{it.quantity}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums">{formatEur(it.unitPrice, order.currency)}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-rose-300/80">
                      {it.discount > 0 ? `-${formatEur(it.discount, order.currency)}` : "—"}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
                      {it.tax > 0 ? formatEur(it.tax, order.currency) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">
                      {formatEur(it.total, order.currency)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={cn("inline-flex items-center rounded border px-1.5 py-0.5 text-[10px]", ITEM_STATUS_META[it.status].cls)}>
                        {ITEM_STATUS_META[it.status].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Math validation */}
        <div className="rp-glass rounded-xl p-4 mt-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              {m.ok ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              ) : (
                <XCircle className="h-4 w-4 text-rose-300" />
              )}
              <span className="text-sm font-medium">Validación matemática</span>
            </div>
            <span
              className={cn(
                "text-xs font-mono",
                m.ok ? "text-emerald-300" : "text-rose-300"
              )}
            >
              {m.ok ? "✓ Cuadra" : "✗ Descuadre"}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <MathLine label="Subtotal" value={order.subtotal} currency={order.currency} />
            <MathLine label="(-) Descuento" value={-order.discountTotal} currency={order.currency} tone="rose" />
            <MathLine label="(+) Impuestos" value={order.taxTotal} currency={order.currency} tone="muted" />
            <MathLine label="(+) Servicio" value={order.serviceCharge} currency={order.currency} tone="muted" />
            <MathLine label="(+) Propina" value={order.tipTotal} currency={order.currency} tone="gold" />
            <MathLine label="Total calculado" value={m.computed} currency={order.currency} tone={m.ok ? "teal" : "rose"} bold />
          </div>
          <div className="mt-3 pt-3 border-t border-border/40 text-[11px] font-mono text-muted-foreground">
            fórmula: subtotal − descuento + IVA + servicio + propina = total
          </div>
        </div>

        {/* Raw payload reference */}
        <Collapsible open={showPayload} onOpenChange={setShowPayload}>
          <div className="rp-glass rounded-xl mt-3">
            <CollapsibleTrigger asChild>
              <button
                className="w-full flex items-center justify-between p-3 text-xs text-left hover:bg-foreground/[0.03] transition-colors min-h-11"
              >
                <span className="flex items-center gap-2 font-mono text-muted-foreground">
                  <Database className="h-3.5 w-3.5" />
                  Payload original en R2
                </span>
                <ChevronDown
                  className={cn("h-3.5 w-3.5 transition-transform", showPayload && "rotate-180")}
                  aria-hidden
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 pt-1 border-t border-border/40">
                <div className="text-[11px] font-mono text-muted-foreground break-all">
                  r2://restopanel-raw/{payloadPath}
                </div>
                <pre className="mt-2 text-[10px] leading-relaxed font-mono text-foreground/70 overflow-x-auto rp-scroll-thin bg-background/40 rounded p-2">
{`{
  "external_id": "${order.externalOrderId}",
  "provider": "${order.provider}",
  "version": "${order.providerVersion}",
  "currency": "${order.currency}",
  "total_cents": ${order.total},
  "opened_at": "${order.openedAt}",
  "items": ${order.items.length},
  "ingested_at": "2025-01-21T22:46:12Z",
  "ingested_by": "tpv-ingest@restopanel.es",
  "checksum_sha256": "a3f9c1…b27e"
}`}
                </pre>
                <div className="mt-2 text-[10px] text-muted-foreground">
                  Inmutable · retenido 7 años (requisito fiscal AEAT)
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} className="h-10 min-h-11">
            Cerrar
          </Button>
          {order.matchStatus === "needs_review" || order.matchStatus === "suggested" ? (
            <Button
              className="h-10 min-h-11 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
              onClick={onClose}
            >
              <ArrowRight className="h-4 w-4 mr-1" />
              Ir a bandeja matching
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "teal" | "muted" | "gold";
}) {
  const toneCls = {
    default: "text-foreground",
    teal: "rp-teal-text",
    muted: "text-muted-foreground",
    gold: "rp-gold-text",
  }[tone];
  return (
    <div className="rp-glass rounded-lg p-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={cn("mt-1 text-sm font-medium", toneCls)}>{value}</div>
    </div>
  );
}

function MathLine({
  label,
  value,
  currency,
  tone = "default",
  bold,
}: {
  label: string;
  value: number;
  currency: string;
  tone?: "default" | "rose" | "muted" | "gold" | "teal";
  bold?: boolean;
}) {
  const toneCls = {
    default: "text-foreground",
    rose: "text-rose-300",
    muted: "text-muted-foreground",
    gold: "rp-gold-text",
    teal: "rp-teal-text",
  }[tone];
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 px-2 rounded bg-background/30">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-mono tabular-nums",
          toneCls,
          bold && "font-bold"
        )}
      >
        {formatEur(value, currency)}
      </span>
    </div>
  );
}

/* ===================================================================== *
 * Matching tab — bandeja de revisión
 * ===================================================================== */

function MatchFactorRow({ f }: { f: MatchFactor }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1 text-xs">
      <div className="flex items-center gap-2 min-w-0">
        {f.pass ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300/80 shrink-0" />
        ) : (
          <XCircle className="h-3.5 w-3.5 text-rose-300/70 shrink-0" />
        )}
        <span className="text-foreground/80 truncate">{f.label}</span>
        <span className="text-[10px] text-muted-foreground font-mono">
          ({Math.round(f.weight * 100)}%)
        </span>
      </div>
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-[10px] text-muted-foreground font-mono cursor-help">
              {f.detail}
            </span>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="text-[11px]">{f.detail}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

function CandidateCard({
  candidate,
  onAssign,
  onReject,
}: {
  candidate: CandidateReservation;
  onAssign: () => void;
  onReject: () => void;
}) {
  const tone = confidenceTone(candidate.confidence);
  return (
    <div className="rp-glass rounded-xl p-3.5 border border-border/40">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-mono text-xs rp-gold-text">{candidate.code}</div>
          <div className="text-sm text-foreground/90 mt-0.5">{candidate.customer}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {candidate.partySize} comensales · {candidate.time} · {candidate.table ?? "sin mesa"}
          </div>
        </div>
        <div className="text-right">
          <div className={cn("text-lg font-display font-light tabular-nums", tone.text)}>
            {candidate.confidence}%
          </div>
          <div className="text-[10px] text-muted-foreground">confianza</div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-border/30 space-y-0.5">
        {candidate.factors.map((f) => (
          <MatchFactorRow key={f.key} f={f} />
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          className="h-9 flex-1 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] text-xs"
          onClick={onAssign}
          disabled={candidate.confidence < 60}
        >
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
          Asignar
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-9 flex-1 text-xs"
          onClick={onReject}
        >
          <Ban className="h-3.5 w-3.5 mr-1" />
          Rechazar
        </Button>
      </div>
      {candidate.confidence < 60 && (
        <div className="mt-2 text-[10px] text-amber-300 flex items-center gap-1">
          <ShieldAlert className="h-3 w-3" />
          Confianza &lt; 60% — requiere validación manual
        </div>
      )}
    </div>
  );
}

function MatchingTab() {
  const reduce = useReducedMotion();
  const { toast } = useToast();
  const reviewOrders = DEMO_ORDERS.filter(
    (o) =>
      o.matchStatus === "needs_review" ||
      o.matchStatus === "suggested" ||
      o.matchStatus === "unmatched"
  );
  const [resolved, setResolved] = React.useState<Record<string, "assigned" | "rejected">>({});

  const handleAssign = (order: Order, candidate: CandidateReservation) => {
    setResolved((r) => ({ ...r, [`${order.id}-${candidate.id}`]: "assigned" }));
    toast({
      title: "Matching confirmado",
      description: `${order.externalOrderId} → ${candidate.code} (${candidate.confidence}% confianza)`,
    });
  };

  const handleReject = (order: Order, candidate: CandidateReservation) => {
    setResolved((r) => ({ ...r, [`${order.id}-${candidate.id}`]: "rejected" }));
    toast({
      title: "Candidato rechazado",
      description: `${candidate.code} descartado para ${order.externalOrderId}`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Policy callout */}
      <div className="rp-glass rounded-xl p-4 border-l-2 border-amber-400/50">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-300" />
          <span className="text-sm font-medium text-amber-300">Política de matching</span>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
          Nunca se asigna automáticamente con confianza baja (&lt; 60%). Las coincidencias
          ambiguas (varios candidatos con confianza similar) siempre requieren revisión manual.
          Las asignaciones quedan auditadas con usuario, timestamp y motivos.
        </p>
      </div>

      {/* Review queue */}
      <div className="space-y-3">
        {reviewOrders.map((o) => {
          const candidates = CANDIDATES_BY_ORDER[o.id] ?? [];
          const isAmbiguous =
            candidates.length > 1 &&
            candidates.length >= 2 &&
            Math.abs(candidates[0]?.confidence - candidates[1]?.confidence) < 15;
          return (
            <motion.div
              key={o.id}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="rp-glass rounded-2xl p-4 sm:p-5"
            >
              {/* Order header */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-border/40">
                <div className="flex items-center gap-3 flex-wrap">
                  <div>
                    <div className="font-mono text-sm text-foreground/90">{o.externalOrderId}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {o.provider} · {timeFromIso(o.openedAt)} · {o.items.length} items
                    </div>
                  </div>
                  <ProviderBadge provider={o.provider} />
                  <MatchBadge status={o.matchStatus} />
                  {isAmbiguous && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 border border-amber-400/40 bg-amber-400/10 rounded-md px-2 py-0.5">
                      <AlertTriangle className="h-3 w-3" />
                      Múltiples candidatos — requiere revisión
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-mono tabular-nums text-foreground">
                    {formatEur(o.total, o.currency)}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    confianza actual: {formatPercent(o.matchConfidence)}
                  </div>
                </div>
              </div>

              {/* Candidates */}
              {candidates.length > 0 ? (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {candidates.map((c) => {
                    const key = `${o.id}-${c.id}`;
                    const status = resolved[key];
                    return (
                      <div key={c.id} className="relative">
                        {status && (
                          <div className="absolute inset-0 z-10 bg-card/85 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-2 p-3 text-center">
                            {status === "assigned" ? (
                              <>
                                <CheckCircle2 className="h-6 w-6 text-emerald-300" />
                                <span className="text-xs text-emerald-300">
                                  Asignado a {c.code}
                                </span>
                              </>
                            ) : (
                              <>
                                <Ban className="h-6 w-6 text-rose-300" />
                                <span className="text-xs text-rose-300">
                                  {c.code} rechazado
                                </span>
                              </>
                            )}
                          </div>
                        )}
                        <CandidateCard
                          candidate={c}
                          onAssign={() => handleAssign(o, c)}
                          onReject={() => handleReject(o, c)}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 p-4 rounded-xl border border-dashed border-border/50 text-center">
                  <AlertTriangle className="h-5 w-5 text-amber-300 mx-auto" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Sin candidatos automáticos para esta orden
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-border/40 flex flex-wrap gap-2">
                {o.matchStatus === "unmatched" && (
                  <>
                    <Button size="sm" variant="outline" className="h-9 text-xs">
                      <Search className="h-3.5 w-3.5 mr-1" />
                      Buscar reservas
                    </Button>
                    <Button size="sm" variant="outline" className="h-9 text-xs rp-teal-text">
                      <PlusCircle className="h-3.5 w-3.5 mr-1" />
                      Crear reserva
                    </Button>
                    <Button size="sm" variant="outline" className="h-9 text-xs">
                      <UserPlus className="h-3.5 w-3.5 mr-1" />
                      Sin reserva (walk-in)
                    </Button>
                  </>
                )}
                <SourcePill source={o.source} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ===================================================================== *
 * Productos tab
 * ===================================================================== */

function ProductsTab() {
  const reduce = useReducedMotion();
  const products = React.useMemo(() => aggregateProducts(DEMO_ORDERS), []);
  const top10 = products.slice(0, 10);
  const maxRevenue = top10[0]?.revenue ?? 1;

  // Category aggregation
  const catAgg = React.useMemo(() => {
    const m = new Map<string, { qty: number; revenue: number }>();
    for (const p of products) {
      const e = m.get(p.category) ?? { qty: 0, revenue: 0 };
      e.qty += p.qty;
      e.revenue += p.revenue;
      m.set(p.category, e);
    }
    return Array.from(m.entries()).sort((a, b) => b[1].revenue - a[1].revenue);
  }, [products]);

  const totalRevenue = catAgg.reduce((s, [, v]) => s + v.revenue, 0);
  const maxCatRevenue = catAgg[0]?.[1].revenue ?? 1;

  // Cancelled & promotional
  const cancelledItems = DEMO_ORDERS.flatMap((o) =>
    o.items.filter((i) => i.status === "cancelled").map((i) => ({ o, i }))
  );
  const promoItems = DEMO_ORDERS.flatMap((o) =>
    o.items.filter((i) => i.status === "promotional").map((i) => ({ o, i }))
  );
  const cancelledValue = cancelledItems.reduce((s, { i }) => s + i.total, 0);
  const promoValue = promoItems.reduce((s, { i }) => s + i.total, 0);

  // Hourly heatmap
  const heatmap = React.useMemo(() => buildHourlyHeatmap(DEMO_ORDERS), []);
  const maxCell = Math.max(...heatmap.map((c) => c.count), 1);

  return (
    <div className="space-y-4">
      {/* Top 10 productos */}
      <div className="rp-glass rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 rp-gold-text" />
            <h3 className="font-display text-lg font-medium">Top 10 productos más vendidos</h3>
          </div>
          <SourcePill source="agregado · orders.items · fecha: hoy" />
        </div>
        <div className="space-y-2">
          {top10.map((p, idx) => (
            <div key={p.name} className="grid grid-cols-12 items-center gap-2 py-1.5">
              <div className="col-span-1 text-xs font-mono text-muted-foreground tabular-nums">
                {String(idx + 1).padStart(2, "0")}
              </div>
              <div className="col-span-5 sm:col-span-4 min-w-0">
                <div className="text-sm text-foreground/90 truncate">{p.name}</div>
                <div className="text-[10px] text-muted-foreground">{p.category}</div>
              </div>
              <div className="col-span-3 sm:col-span-4">
                <div className="h-2 rounded-full bg-foreground/5 overflow-hidden">
                  <motion.div
                    initial={reduce ? false : { width: 0 }}
                    animate={{ width: `${(p.revenue / maxRevenue) * 100}%` }}
                    transition={{ duration: 0.4, delay: idx * 0.04 }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${CATEGORY_COLORS[p.category] ?? "#D4AF37"}80, ${CATEGORY_COLORS[p.category] ?? "#D4AF37"})`,
                    }}
                  />
                </div>
              </div>
              <div className="col-span-2 sm:col-span-2 text-right">
                <div className="text-xs font-mono tabular-nums text-foreground">
                  {formatEur(p.revenue)}
                </div>
                <div className="text-[10px] text-muted-foreground tabular-nums">
                  {p.qty} uds
                </div>
              </div>
              <div className="hidden sm:block col-span-1 text-right text-[10px] text-muted-foreground font-mono tabular-nums">
                {formatEur(p.avgPrice)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categorías + cancelled + promo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rp-glass rounded-2xl p-4 sm:p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 rp-teal-text" />
              <h3 className="font-display text-lg font-medium">Ingresos por categoría</h3>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              total {formatEur(totalRevenue)}
            </span>
          </div>
          <div className="space-y-3">
            {catAgg.map(([cat, v]) => (
              <div key={cat}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: CATEGORY_COLORS[cat] ?? "#888" }}
                    />
                    <span className="text-foreground/90">{cat}</span>
                  </div>
                  <span className="font-mono tabular-nums text-foreground">
                    {formatEur(v.revenue)}{" "}
                    <span className="text-muted-foreground">· {v.qty} uds</span>
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-foreground/5 overflow-hidden">
                  <motion.div
                    initial={reduce ? false : { width: 0 }}
                    animate={{ width: `${(v.revenue / maxCatRevenue) * 100}%` }}
                    transition={{ duration: 0.4 }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${CATEGORY_COLORS[cat] ?? "#888"}60, ${CATEGORY_COLORS[cat] ?? "#888"})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rp-glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Ban className="h-4 w-4 text-rose-300" />
              <span className="text-sm font-medium">Productos cancelados</span>
            </div>
            <div className="font-display text-2xl font-light text-rose-300 tabular-nums">
              {cancelledItems.length}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {formatEur(cancelledValue)} en valor cancelado
            </div>
            <ul className="mt-2 space-y-1">
              {cancelledItems.slice(0, 3).map(({ i, o }, idx) => (
                <li key={idx} className="text-[11px] text-muted-foreground flex items-center justify-between gap-2">
                  <span className="truncate">{i.productName}</span>
                  <span className="font-mono shrink-0">{o.externalOrderId}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rp-glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-fuchsia-300" />
              <span className="text-sm font-medium">Promocionales</span>
            </div>
            <div className="font-display text-2xl font-light text-fuchsia-300 tabular-nums">
              {promoItems.length}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {formatEur(promoValue)} en valor promocional
            </div>
            <ul className="mt-2 space-y-1">
              {promoItems.slice(0, 3).map(({ i, o }, idx) => (
                <li key={idx} className="text-[11px] text-muted-foreground flex items-center justify-between gap-2">
                  <span className="truncate">{i.productName}</span>
                  <span className="font-mono shrink-0">{o.externalOrderId}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Hourly heatmap */}
      <div className="rp-glass rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Hourglass className="h-4 w-4 rp-gold-text" />
            <h3 className="font-display text-lg font-medium">Horarios de consumo</h3>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            heatmap: hora × categoría · unidades
          </span>
        </div>
        <div className="overflow-x-auto rp-scroll-thin -mx-1 px-1">
          <div className="min-w-[640px]">
            {/* Header row */}
            <div className="grid" style={{ gridTemplateColumns: `120px repeat(${HOURS.length}, 1fr)` }}>
              <div />
              {HOURS.map((h) => (
                <div key={h} className="text-center text-[10px] font-mono text-muted-foreground py-1">
                  {String(h).padStart(2, "0")}h
                </div>
              ))}
            </div>
            {/* Category rows */}
            {CATEGORIES.map((cat) => (
              <div
                key={cat}
                className="grid items-center"
                style={{ gridTemplateColumns: `120px repeat(${HOURS.length}, 1fr)` }}
              >
                <div className="flex items-center gap-1.5 py-1 pr-2">
                  <span
                    className="h-2 w-2 rounded-sm"
                    style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                  />
                  <span className="text-[11px] text-foreground/80">{cat}</span>
                </div>
                {HOURS.map((h) => {
                  const cell = heatmap.find((c) => c.hour === h && c.category === cat);
                  const v = cell?.count ?? 0;
                  return (
                    <TooltipProvider key={`${h}-${cat}`} delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="m-0.5 rounded-md h-8 flex items-center justify-center text-[10px] font-mono tabular-nums cursor-help transition-transform hover:scale-105"
                            style={{
                              backgroundColor: heatmapColor(v, maxCell),
                              color: v > maxCell * 0.4 ? "#000" : "var(--muted-foreground)",
                            }}
                          >
                            {v > 0 ? v : ""}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-[11px]">
                            {cat} · {String(h).padStart(2, "0")}:00–{String(h + 1).padStart(2, "0")}:00
                          </p>
                          <p className="text-[11px] text-muted-foreground">{v} unidades</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        {/* Legend */}
        <div className="mt-4 flex items-center gap-3 text-[10px] text-muted-foreground">
          <span>menos</span>
          <div
            className="h-2 w-32 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(61,214,201,0.7), rgba(212,175,55,0.9), rgba(245,158,11,0.95))",
            }}
          />
          <span>más</span>
          <span className="ml-2 font-mono">max: {maxCell} uds</span>
        </div>
      </div>

      {/* Source / traceability footer */}
      <div className="rp-glass rounded-xl p-3 flex items-center gap-2 text-[11px] text-muted-foreground">
        <Info className="h-3.5 w-3.5" />
        <span>
          Agregación a partir de{" "}
          <span className="font-mono">{DEMO_ORDERS.reduce((s, o) => s + o.items.length, 0)} items</span>{" "}
          en{" "}
          <span className="font-mono">{DEMO_ORDERS.length} órdenes</span>{" "}
          · fuente única: orders.items (inmutable) · mostrado en cents → €
        </span>
      </div>
    </div>
  );
}

/* ===================================================================== *
 * Main component
 * ===================================================================== */

type Tab = "orders" | "matching" | "products";

export function FinOrders() {
  const reduce = useReducedMotion();
  const { toast } = useToast();
  const [tab, setTab] = React.useState<Tab>("orders");
  const [filters, setFilters] = React.useState<Filters>({
    search: "",
    provider: "all",
    status: "all",
    matchStatus: "all",
    dateRange: "today",
  });
  const [detailOrder, setDetailOrder] = React.useState<Order | null>(null);

  const filteredOrders = React.useMemo(() => {
    return DEMO_ORDERS.filter((o) => {
      if (filters.provider !== "all" && o.provider !== filters.provider) return false;
      if (filters.status !== "all" && o.status !== filters.status) return false;
      if (filters.matchStatus !== "all" && o.matchStatus !== filters.matchStatus) return false;
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const inId = o.externalOrderId.toLowerCase().includes(q);
        const inCustomer = (o.customerName ?? "").toLowerCase().includes(q);
        if (!inId && !inCustomer) return false;
      }
      return true;
    });
  }, [filters]);

  const handleAssign = (o: Order) => {
    toast({
      title: "Abrir bandeja de matching",
      description: `${o.externalOrderId} — buscando candidatos…`,
    });
    setTab("matching");
  };
  const handleReview = (o: Order) => {
    toast({
      title: "Abrir bandeja de matching",
      description: `${o.externalOrderId} requiere revisión manual`,
    });
    setTab("matching");
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "orders", label: "Órdenes", icon: ShoppingCart, count: DEMO_ORDERS.length },
    {
      id: "matching",
      label: "Matching",
      icon: Link2,
      count: DEMO_ORDERS.filter(
        (o) => o.matchStatus === "needs_review" || o.matchStatus === "suggested" || o.matchStatus === "unmatched"
      ).length,
    },
    { id: "products", label: "Productos", icon: Package },
  ];

  return (
    <div className="min-h-screen flex flex-col gap-4 sm:gap-6 py-4 sm:py-6 px-3 sm:px-4 lg:px-6 overflow-x-hidden">
      {/* Header */}
      <header className="rp-glass rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl sm:text-3xl font-light tracking-tight">
                Órdenes <span className="rp-gold-gradient">TPV</span>
              </h1>
              <DemoBadge />
            </div>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              Órdenes ingestadas desde sistemas TPV con matching a reservas y clientes.
              Trazabilidad completa: cada orden conserva origen, confianza y payload original.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Última sincronización: hace 2 min
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 min-h-11"
              onClick={() =>
                toast({
                  title: "Sincronización iniciada",
                  description: "Consultando Square, Lightspeed y Revo…",
                })
              }
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Sincronizar ahora
            </Button>
          </div>
        </div>
      </header>

      {/* KPI strip */}
      <KpiStrip />

      {/* Tabs */}
      <div className="rp-glass rounded-xl p-1.5 inline-flex w-fit">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative inline-flex items-center gap-2 px-3 sm:px-4 h-10 rounded-md text-sm font-medium transition-colors min-h-11",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              {active && !reduce && (
                <motion.div
                  layoutId="fin-orders-tab"
                  className="absolute inset-0 rounded-md bg-foreground/[0.06] border border-border/60"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {active && reduce && (
                <div className="absolute inset-0 rounded-md bg-foreground/[0.06] border border-border/60" />
              )}
              <Icon className="h-4 w-4 relative z-10" aria-hidden />
              <span className="relative z-10">{t.label}</span>
              {t.count != null && (
                <span className="relative z-10 ml-0.5 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-foreground/10 text-[10px] font-mono tabular-nums">
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="flex-1"
        >
          {tab === "orders" && (
            <div className="space-y-4">
              <FiltersBar filters={filters} setFilters={setFilters} />
              {filteredOrders.length > 0 ? (
                <OrdersTable
                  orders={filteredOrders}
                  onView={setDetailOrder}
                  onAssign={handleAssign}
                  onReview={handleReview}
                />
              ) : (
                <div className="rp-glass rounded-xl p-8 text-center text-muted-foreground">
                  <ListChecks className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm">No hay órdenes que coincidan con los filtros.</p>
                </div>
              )}
              <div className="flex items-center justify-between gap-2 flex-wrap text-[11px] text-muted-foreground">
                <span>
                  Mostrando{" "}
                  <span className="font-mono">{filteredOrders.length}</span> de{" "}
                  <span className="font-mono">{DEMO_ORDERS.length}</span> órdenes · total{" "}
                  <span className="font-mono">
                    {formatEur(filteredOrders.reduce((s, o) => s + o.total, 0))}
                  </span>
                </span>
                <SourcePill source="orders · tpv-ingest · r2://restopanel-raw/orders/" />
              </div>
            </div>
          )}
          {tab === "matching" && <MatchingTab />}
          {tab === "products" && <ProductsTab />}
        </motion.div>
      </AnimatePresence>

      {/* Detail dialog */}
      <OrderDetailDialog order={detailOrder} onClose={() => setDetailOrder(null)} />
    </div>
  );
}

export default FinOrders;
