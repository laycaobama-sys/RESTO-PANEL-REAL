"use client";

/* ============================================================================
 * RestoPanel · Inventario y Escandallos
 * Tabs: Stock / Escandallos / Proveedores / Recuentos
 * KPIs · alertas · caducidades · mermas · sugerencia de pedido
 * ========================================================================== */

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Package, Boxes, BookOpen, Truck, ClipboardList, AlertTriangle,
  CalendarClock, TrendingDown, Sparkles, Plus, Search, Filter,
  ShoppingCart, Phone, Mail, Globe, ChevronRight, X, Pencil,
  CheckCircle2, Trash2, Download, Upload, History, Coins,
  Percent, Leaf, Ban, ArrowUpRight, ArrowDownRight, ChefHat,
  AlertCircle, Clock, FileText, Send,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type InvTab = "stock" | "escandallos" | "proveedores" | "recuentos";

type StockStatus = "ok" | "bajo" | "critico";

interface StockItem {
  id: string;
  nombre: string;
  categoria: string;
  stock: number;
  minimo: number;
  unidad: string;
  proveedorId: string;
  coste: number; // €/unidad
}

interface Lote {
  id: string;
  itemId: string;
  lote: string;
  fechaCaducidad: string; // ISO yyyy-mm-dd
  cantidad: number;
}

interface Proveedor {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  web: string;
  catalogo: number; // nº de artículos
  ultimoPedido: string; // ISO
  proximoPedido: string; // ISO
  estado: "activo" | "pausado" | "nuevo";
}

interface EscandalloIngredient {
  nombre: string;
  cantidad: number;
  unidad: string;
  coste: number; // €
}

interface Escandallo {
  id: string;
  plato: string;
  precioVenta: number;
  ingredientes: EscandalloIngredient[];
  raciones: number; // raciones teóricas por semana
  activo: boolean;
}

interface RecuentoLinea {
  itemId: string;
  nombre: string;
  teorico: number;
  real: number;
  unidad: string;
  coste: number;
}

interface Recuento {
  id: string;
  fecha: string; // ISO
  responsable: string;
  estado: "borrador" | "cerrado";
  lineas: RecuentoLinea[];
}

/* =========================================================
 * Static data — demo, editable via state
 * =======================================================*/
const PROVEEDORES_INIT: Proveedor[] = [
  {
    id: "p1",
    nombre: "Makro Premium",
    contacto: "Lucía Fernández",
    telefono: "+34 91 555 0101",
    email: "lucia@makropremium.es",
    web: "makropremium.es",
    catalogo: 312,
    ultimoPedido: "2025-04-08",
    proximoPedido: "2025-04-22",
    estado: "activo",
  },
  {
    id: "p2",
    nombre: "Pescados Mar Atlántico",
    contacto: "Andrés Vidal",
    telefono: "+34 986 222 334",
    email: "pedidos@maratlantico.gal",
    web: "maratlantico.gal",
    catalogo: 84,
    ultimoPedido: "2025-04-09",
    proximoPedido: "2025-04-16",
    estado: "activo",
  },
  {
    id: "p3",
    nombre: "Carnes Sierra Norte",
    contacto: "Marta Ruiz",
    telefono: "+34 91 866 7788",
    email: "marta@sierranorte.com",
    web: "sierranorte.com",
    catalogo: 56,
    ultimoPedido: "2025-04-07",
    proximoPedido: "2025-04-21",
    estado: "activo",
  },
  {
    id: "p4",
    nombre: "Verduras Huerta Sur",
    contacto: "Jorge Mendoza",
    telefono: "+34 952 110 220",
    email: "huerta@huertasur.es",
    web: "huertasur.es",
    catalogo: 128,
    ultimoPedido: "2025-04-10",
    proximoPedido: "2025-04-17",
    estado: "activo",
  },
  {
    id: "p5",
    nombre: "Bodegas Rioja Alta",
    contacto: "Carlos Ibañez",
    telefono: "+34 941 223 344",
    email: "horeca@riojaalta.es",
    web: "riojaalta.es",
    catalogo: 42,
    ultimoPedido: "2025-03-30",
    proximoPedido: "2025-04-30",
    estado: "pausado",
  },
  {
    id: "p6",
    nombre: "Panadería Artesana López",
    contacto: "Esperanza López",
    telefono: "+34 91 444 5566",
    email: "pan@lopezartesana.es",
    web: "lopezartesana.es",
    catalogo: 24,
    ultimoPedido: "2025-04-10",
    proximoPedido: "2025-04-12",
    estado: "nuevo",
  },
];

const STOCK_INIT: StockItem[] = [
  { id: "s1", nombre: "Arroz Bomba", categoria: "Cereales", stock: 18, minimo: 10, unidad: "kg", proveedorId: "p1", coste: 3.10 },
  { id: "s2", nombre: "Azafrón en hebras", categoria: "Especias", stock: 0.08, minimo: 0.1, unidad: "kg", proveedorId: "p1", coste: 145.00 },
  { id: "s3", nombre: "Gambón rojo", categoria: "Pescado", stock: 4.5, minimo: 6, unidad: "kg", proveedorId: "p2", coste: 38.50 },
  { id: "s4", nombre: "Merluza de pincho", categoria: "Pescado", stock: 12, minimo: 8, unidad: "kg", proveedorId: "p2", coste: 28.90 },
  { id: "s5", nombre: "Solomillo de ternera", categoria: "Carne", stock: 6.2, minimo: 8, unidad: "kg", proveedorId: "p3", coste: 42.00 },
  { id: "s6", nombre: "Pechuga de pollo", categoria: "Carne", stock: 14, minimo: 10, unidad: "kg", proveedorId: "p3", coste: 7.20 },
  { id: "s7", nombre: "Tomate pera", categoria: "Verdura", stock: 22, minimo: 15, unidad: "kg", proveedorId: "p4", coste: 1.85 },
  { id: "s8", nombre: "Albahaca fresca", categoria: "Verdura", stock: 0.4, minimo: 0.5, unidad: "kg", proveedorId: "p4", coste: 12.00 },
  { id: "s9", nombre: "Queso Parmesano", categoria: "Lácteos", stock: 2.1, minimo: 2, unidad: "kg", proveedorId: "p1", coste: 24.50 },
  { id: "s10", nombre: "Mantequilla francesa", categoria: "Lácteos", stock: 1.2, minimo: 2, unidad: "kg", proveedorId: "p1", coste: 9.80 },
  { id: "s11", nombre: "Pan brioche", categoria: "Panadería", stock: 28, minimo: 20, unidad: "ud", proveedorId: "p6", coste: 0.85 },
  { id: "s12", nombre: "Aceite de oliva virgen extra", categoria: "Aceites", stock: 8, minimo: 6, unidad: "L", proveedorId: "p1", coste: 9.20 },
  { id: "s13", nombre: "Vino blanco Rioja", categoria: "Bebidas", stock: 14, minimo: 12, unidad: "ud", proveedorId: "p5", coste: 8.40 },
  { id: "s14", nombre: "Harina de fuerza", categoria: "Cereales", stock: 5, minimo: 12, unidad: "kg", proveedorId: "p1", coste: 1.10 },
  { id: "s15", nombre: "Lechuga romana", categoria: "Verdura", stock: 3, minimo: 6, unidad: "ud", proveedorId: "p4", coste: 0.95 },
  { id: "s16", nombre: "Huevos camperos", categoria: "Lácteos", stock: 96, minimo: 60, unidad: "ud", proveedorId: "p1", coste: 0.18 },
  { id: "s17", nombre: "Patata nueva", categoria: "Verdura", stock: 25, minimo: 20, unidad: "kg", proveedorId: "p4", coste: 1.05 },
  { id: "s18", nombre: "Chocolate 70%", categoria: "Repostería", stock: 1.5, minimo: 2, unidad: "kg", proveedorId: "p1", coste: 18.50 },
];

const LOTES_INIT: Lote[] = [
  { id: "l1", itemId: "s3", lote: "P-2025-099", fechaCaducidad: "2025-04-13", cantidad: 2.5 },
  { id: "l2", itemId: "s3", lote: "P-2025-101", fechaCaducidad: "2025-04-15", cantidad: 2.0 },
  { id: "l3", itemId: "s4", lote: "P-2025-098", fechaCaducidad: "2025-04-17", cantidad: 6.0 },
  { id: "l4", itemId: "s4", lote: "P-2025-102", fechaCaducidad: "2025-04-18", cantidad: 6.0 },
  { id: "l5", itemId: "s5", lote: "C-2025-045", fechaCaducidad: "2025-04-25", cantidad: 3.2 },
  { id: "l6", itemId: "s6", lote: "C-2025-046", fechaCaducidad: "2025-04-14", cantidad: 4.0 },
  { id: "l7", itemId: "s7", lote: "V-2025-088", fechaCaducidad: "2025-04-19", cantidad: 12.0 },
  { id: "l8", itemId: "s7", lote: "V-2025-090", fechaCaducidad: "2025-04-12", cantidad: 10.0 },
  { id: "l9", itemId: "s8", lote: "V-2025-091", fechaCaducidad: "2025-04-13", cantidad: 0.4 },
  { id: "l10", itemId: "s11", lote: "PA-2025-031", fechaCaducidad: "2025-04-12", cantidad: 18 },
  { id: "l11", itemId: "s11", lote: "PA-2025-032", fechaCaducidad: "2025-04-13", cantidad: 10 },
  { id: "l12", itemId: "s15", lote: "V-2025-092", fechaCaducidad: "2025-04-12", cantidad: 3 },
];

const ESCANDALLOS_INIT: Escandallo[] = [
  {
    id: "e1",
    plato: "Paella de marisco",
    precioVenta: 24.50,
    raciones: 38,
    activo: true,
    ingredientes: [
      { nombre: "Arroz Bomba", cantidad: 0.08, unidad: "kg", coste: 0.25 },
      { nombre: "Gambón rojo", cantidad: 0.08, unidad: "kg", coste: 3.08 },
      { nombre: "Merluza", cantidad: 0.05, unidad: "kg", coste: 1.45 },
      { nombre: "Azafrón", cantidad: 0.0002, unidad: "kg", coste: 0.029 },
      { nombre: "Aceite oliva", cantidad: 0.015, unidad: "L", coste: 0.14 },
      { nombre: "Tomate pera", cantidad: 0.04, unidad: "kg", coste: 0.07 },
    ],
  },
  {
    id: "e2",
    plato: "Risotto de parmesano",
    precioVenta: 16.90,
    raciones: 52,
    activo: true,
    ingredientes: [
      { nombre: "Arroz Carnaroli", cantidad: 0.09, unidad: "kg", coste: 0.28 },
      { nombre: "Queso Parmesano", cantidad: 0.03, unidad: "kg", coste: 0.74 },
      { nombre: "Mantequilla", cantidad: 0.02, unidad: "kg", coste: 0.20 },
      { nombre: "Vino blanco", cantidad: 0.05, unidad: "L", coste: 0.42 },
      { nombre: "Cebolla", cantidad: 0.04, unidad: "kg", coste: 0.05 },
      { nombre: "Aceite oliva", cantidad: 0.01, unidad: "L", coste: 0.09 },
    ],
  },
  {
    id: "e3",
    plato: "Hamburguesa premium",
    precioVenta: 14.90,
    raciones: 96,
    activo: true,
    ingredientes: [
      { nombre: "Solomillo ternera", cantidad: 0.16, unidad: "kg", coste: 6.72 },
      { nombre: "Pan brioche", cantidad: 1, unidad: "ud", coste: 0.85 },
      { nombre: "Queso cheddar", cantidad: 0.025, unidad: "kg", coste: 0.50 },
      { nombre: "Lechuga romana", cantidad: 0.02, unidad: "ud", coste: 0.02 },
      { nombre: "Tomate pera", cantidad: 0.03, unidad: "kg", coste: 0.06 },
      { nombre: "Patata nueva", cantidad: 0.15, unidad: "kg", coste: 0.16 },
    ],
  },
  {
    id: "e4",
    plato: "Ensalada César",
    precioVenta: 11.50,
    raciones: 41,
    activo: true,
    ingredientes: [
      { nombre: "Lechuga romana", cantidad: 0.5, unidad: "ud", coste: 0.48 },
      { nombre: "Pechuga de pollo", cantidad: 0.1, unidad: "kg", coste: 0.72 },
      { nombre: "Pan brioche", cantidad: 0.5, unidad: "ud", coste: 0.43 },
      { nombre: "Queso Parmesano", cantidad: 0.015, unidad: "kg", coste: 0.37 },
      { nombre: "Aceite oliva", cantidad: 0.02, unidad: "L", coste: 0.18 },
    ],
  },
  {
    id: "e5",
    plato: "Tarta de chocolate",
    precioVenta: 7.90,
    raciones: 28,
    activo: true,
    ingredientes: [
      { nombre: "Chocolate 70%", cantidad: 0.05, unidad: "kg", coste: 0.93 },
      { nombre: "Mantequilla", cantidad: 0.04, unidad: "kg", coste: 0.39 },
      { nombre: "Huevos camperos", cantidad: 2, unidad: "ud", coste: 0.36 },
      { nombre: "Harina de fuerza", cantidad: 0.03, unidad: "kg", coste: 0.03 },
      { nombre: "Azúcar", cantidad: 0.04, unidad: "kg", coste: 0.04 },
    ],
  },
];

const RECUENTOS_INIT: Recuento[] = [
  {
    id: "r1",
    fecha: "2025-04-01",
    responsable: "Marta García",
    estado: "cerrado",
    lineas: [
      { itemId: "s1", nombre: "Arroz Bomba", teorico: 22, real: 20, unidad: "kg", coste: 3.10 },
      { itemId: "s3", nombre: "Gambón rojo", teorico: 8, real: 6.5, unidad: "kg", coste: 38.50 },
      { itemId: "s5", nombre: "Solomillo de ternera", teorico: 10, real: 9.2, unidad: "kg", coste: 42.00 },
      { itemId: "s7", nombre: "Tomate pera", teorico: 25, real: 22, unidad: "kg", coste: 1.85 },
      { itemId: "s9", nombre: "Queso Parmesano", teorico: 3, real: 2.7, unidad: "kg", coste: 24.50 },
      { itemId: "s11", nombre: "Pan brioche", teorico: 35, real: 32, unidad: "ud", coste: 0.85 },
    ],
  },
  {
    id: "r2",
    fecha: "2025-03-15",
    responsable: "Pedro Sánchez",
    estado: "cerrado",
    lineas: [
      { itemId: "s1", nombre: "Arroz Bomba", teorico: 18, real: 16.5, unidad: "kg", coste: 3.10 },
      { itemId: "s4", nombre: "Merluza de pincho", teorico: 10, real: 8.8, unidad: "kg", coste: 28.90 },
      { itemId: "s6", nombre: "Pechuga de pollo", teorico: 12, real: 11, unidad: "kg", coste: 7.20 },
      { itemId: "s12", nombre: "Aceite de oliva virgen extra", teorico: 10, real: 9.4, unidad: "L", coste: 9.20 },
    ],
  },
];

/* =========================================================
 * Helpers
 * =======================================================*/
function euro(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtNum(n: number, dec = 2): string {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: dec,
  }).format(n);
}

function daysTo(iso: string): number {
  const today = new Date("2025-04-11T00:00:00");
  const target = new Date(iso + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function stockStatus(item: StockItem): StockStatus {
  if (item.stock <= item.minimo * 0.5) return "critico";
  if (item.stock <= item.minimo) return "bajo";
  return "ok";
}

const STATUS_META: Record<
  StockStatus,
  { label: string; dot: string; text: string; border: string; bg: string }
> = {
  ok: {
    label: "OK",
    dot: "bg-[var(--rp-emerald)]",
    text: "text-[var(--rp-emerald-soft)]",
    border: "border-[var(--rp-emerald)]/40",
    bg: "bg-[var(--rp-emerald)]/10",
  },
  bajo: {
    label: "Bajo",
    dot: "bg-[var(--rp-yellow)]",
    text: "text-[var(--rp-yellow-soft)]",
    border: "border-[var(--rp-yellow)]/40",
    bg: "bg-[var(--rp-yellow)]/10",
  },
  critico: {
    label: "Crítico",
    dot: "bg-[var(--rp-red)]",
    text: "text-[var(--rp-red-soft)]",
    border: "border-[var(--rp-red)]/40",
    bg: "bg-[var(--rp-red)]/10",
  },
};

function loteEstado(iso: string): "fresco" | "proximo" | "caducado" {
  const d = daysTo(iso);
  if (d < 0) return "caducado";
  if (d <= 2) return "proximo";
  return "fresco";
}

const LOTE_META: Record<
  "fresco" | "proximo" | "caducado",
  { label: string; cls: string; dot: string }
> = {
  fresco: {
    label: "Fresco",
    dot: "bg-[var(--rp-emerald)]",
    cls: "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]",
  },
  proximo: {
    label: "Próximo",
    dot: "bg-[var(--rp-yellow)]",
    cls: "border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow-soft)]",
  },
  caducado: {
    label: "Caducado",
    dot: "bg-[var(--rp-red)]",
    cls: "border-[var(--rp-red)]/40 bg-[var(--rp-red)]/10 text-[var(--rp-red-soft)]",
  },
};

function estadoProveedor(e: "activo" | "pausado" | "nuevo") {
  switch (e) {
    case "activo":
      return {
        label: "Activo",
        cls: "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]",
      };
    case "pausado":
      return {
        label: "Pausado",
        cls: "border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow-soft)]",
      };
    case "nuevo":
      return {
        label: "Nuevo",
        cls: "border-[var(--rp-violet)]/40 bg-[var(--rp-violet)]/10 text-[var(--rp-violet-soft)]",
      };
  }
}

function escandalloCoste(esc: Escandallo): number {
  return esc.ingredientes.reduce((sum, i) => sum + i.coste, 0);
}
function escandalloFoodCost(esc: Escandallo): number {
  const c = escandalloCoste(esc);
  return esc.precioVenta === 0 ? 0 : (c / esc.precioVenta) * 100;
}
function escandalloMargen(esc: Escandallo): number {
  const c = escandalloCoste(esc);
  return esc.precioVenta === 0 ? 0 : ((esc.precioVenta - c) / esc.precioVenta) * 100;
}

/* =========================================================
 * DemoBadge + KPI card
 * =======================================================*/
function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-amber-400/40 bg-amber-400/10 text-amber-300 font-mono uppercase tracking-wider text-[10px]",
        className
      )}
    >
      demo
    </Badge>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  caption,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  caption: string;
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
    <div className="rp-glass rounded-xl p-4 flex items-center gap-3">
      <div
        className={cn(
          "h-10 w-10 rounded-lg flex items-center justify-center bg-foreground/[0.04]",
          toneCls
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground truncate">
          {label}
        </div>
        <div className="text-xl font-display font-medium tabular-nums leading-tight">
          {value}
        </div>
        <div className="text-[11px] text-muted-foreground truncate">{caption}</div>
      </div>
    </div>
  );
}

/* =========================================================
 * Main view
 * =======================================================*/
export function InventarioView() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const t = reduce ? { duration: 0 } : { duration: 0.2, ease: "easeOut" as const };

  const [tab, setTab] = React.useState<InvTab>("stock");
  const [stock, setStock] = React.useState<StockItem[]>(STOCK_INIT);
  const [proveedores] = React.useState<Proveedor[]>(PROVEEDORES_INIT);
  const [escandallos, setEscandallos] = React.useState<Escandallo[]>(ESCANDALLOS_INIT);
  const [recuentos, setRecuentos] = React.useState<Recuento[]>(RECUENTOS_INIT);
  const [lotes, setLotes] = React.useState<Lote[]>(LOTES_INIT);

  const [search, setSearch] = React.useState("");
  const [catFilter, setCatFilter] = React.useState<string>("todas");
  const [showOnlyLow, setShowOnlyLow] = React.useState(false);

  // dialogs
  const [newItemOpen, setNewItemOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<StockItem | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);
  const [pedidoOpen, setPedidoOpen] = React.useState(false);
  const [newRecuentoOpen, setNewRecuentoOpen] = React.useState(false);
  const [editEscandallo, setEditEscandallo] = React.useState<Escandallo | null>(null);
  const [proveedorDetalle, setProveedorDetalle] = React.useState<Proveedor | null>(null);

  // mobile filter sheet
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  /* ----- derived ----- */
  const categorias = React.useMemo(
    () => Array.from(new Set(stock.map((s) => s.categoria))).sort(),
    [stock]
  );

  const filteredStock = React.useMemo(() => {
    return stock.filter((s) => {
      if (catFilter !== "todas" && s.categoria !== catFilter) return false;
      if (showOnlyLow && stockStatus(s) === "ok") return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (
          !s.nombre.toLowerCase().includes(q) &&
          !s.categoria.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [stock, catFilter, showOnlyLow, search]);

  const alertas = stock
    .filter((s) => stockStatus(s) !== "ok")
    .sort((a, b) => {
      const sa = stockStatus(a);
      const sb = stockStatus(b);
      const order: Record<StockStatus, number> = { critico: 0, bajo: 1, ok: 2 };
      return order[sa] - order[sb];
    });

  const sugerenciaPedido = stock
    .filter((s) => stockStatus(s) !== "ok")
    .map((s) => {
      const prov = proveedores.find((p) => p.id === s.proveedorId);
      const suggested = Math.ceil(s.minimo * 2 - s.stock);
      return {
        item: s,
        proveedor: prov,
        cantidad: suggested,
        coste: suggested * s.coste,
      };
    });

  const caducidadesCriticas = lotes
    .map((l) => ({ lote: l, estado: loteEstado(l.fechaCaducidad) }))
    .filter((x) => x.estado !== "fresco")
    .sort((a, b) => daysTo(a.lote.fechaCaducidad) - daysTo(b.lote.fechaCaducidad));

  // KPIs
  const valorInventario = stock.reduce((sum, s) => sum + s.stock * s.coste, 0);
  const mermasPeriodo = recuentos
    .filter((r) => r.estado === "cerrado")
    .reduce(
      (sum, r) =>
        sum +
        r.lineas.reduce(
          (ls, l) => ls + Math.max(0, l.teorico - l.real) * l.coste,
          0
        ),
      0
    );
  const costeMateriaPrimaPct = 32.4; // KPI demo
  const platosMenosRentables = [...escandallos]
    .sort((a, b) => escandalloFoodCost(a) - escandalloFoodCost(b))
    .slice(0, 3)
    .reverse();

  /* ----- handlers ----- */
  function handleSaveItem(item: StockItem) {
    setStock((prev) => {
      const exists = prev.some((s) => s.id === item.id);
      if (exists) {
        toast({
          title: "Artículo actualizado",
          description: item.nombre,
        });
        return prev.map((s) => (s.id === item.id ? item : s));
      }
      toast({
        title: "Artículo creado",
        description: `${item.nombre} · ${item.categoria}`,
      });
      return [...prev, item];
    });
    setEditItem(null);
    setNewItemOpen(false);
  }

  function handleDelete(id: string) {
    const item = stock.find((s) => s.id === id);
    setStock((prev) => prev.filter((s) => s.id !== id));
    setLotes((prev) => prev.filter((l) => l.itemId !== id));
    setConfirmDelete(null);
    toast({
      title: "Artículo eliminado",
      description: item?.nombre,
      variant: "destructive",
    });
  }

  function ajustarStock(id: string, delta: number) {
    setStock((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, stock: Math.max(0, +(s.stock + delta).toFixed(2)) } : s
      )
    );
  }

  function toggleEscandallo(id: string) {
    setEscandallos((prev) =>
      prev.map((e) => (e.id === id ? { ...e, activo: !e.activo } : e))
    );
    const esc = escandallos.find((e) => e.id === id);
    toast({
      title: esc?.activo ? "Escandallo desactivado" : "Escandallo activado",
      description: esc?.plato,
    });
  }

  function crearPedido() {
    const total = sugerenciaPedido.reduce((sum, s) => sum + s.coste, 0);
    toast({
      title: "Pedido generado",
      description: `${sugerenciaPedido.length} líneas · ${euro(total)}`,
    });
    setPedidoOpen(false);
  }

  function crearRecuento(responsable: string) {
    const id = `r${recuentos.length + 1}`;
    const nuevo: Recuento = {
      id,
      fecha: new Date().toISOString().slice(0, 10),
      responsable,
      estado: "borrador",
      lineas: stock.map((s) => ({
        itemId: s.id,
        nombre: s.nombre,
        teorico: s.stock,
        real: s.stock,
        unidad: s.unidad,
        coste: s.coste,
      })),
    };
    setRecuentos((prev) => [nuevo, ...prev]);
    setNewRecuentoOpen(false);
    toast({
      title: "Recuento iniciado",
      description: `${nuevo.lineas.length} artículos a contar`,
    });
  }

  function cerrarRecuento(id: string) {
    setRecuentos((prev) =>
      prev.map((r) => (r.id === id ? { ...r, estado: "cerrado" } : r))
    );
    const r = recuentos.find((x) => x.id === id);
    const merma = r
      ? r.lineas.reduce(
          (sum, l) => sum + Math.max(0, l.teorico - l.real) * l.coste,
          0
        )
      : 0;
    toast({
      title: "Recuento cerrado",
      description: `Merma detectada: ${euro(merma)}`,
    });
  }

  /* ----- render ----- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
              Inventario y Escandallos
            </h1>
            <DemoBadge />
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Control de stock, escandallos, proveedores, recuentos y caducidades.
            Datos demo · navegable.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setPedidoOpen(true)}
            className="border-[var(--rp-emerald)]/40 text-[var(--rp-emerald-soft)] hover:bg-[var(--rp-emerald)]/10 min-h-11"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Sugerencia de pedido</span>
            <span className="sm:hidden">Pedido</span>
            {sugerenciaPedido.length > 0 && (
              <Badge
                variant="outline"
                className="ml-1 border-[var(--rp-red)]/40 bg-[var(--rp-red)]/10 text-[var(--rp-red-soft)] text-[10px]"
              >
                {sugerenciaPedido.length}
              </Badge>
            )}
          </Button>
          {tab === "stock" && (
            <Button
              onClick={() => setNewItemOpen(true)}
              className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)] shrink-0 min-h-11"
            >
              <Plus className="h-4 w-4" /> Nuevo artículo
            </Button>
          )}
          {tab === "recuentos" && (
            <Button
              onClick={() => setNewRecuentoOpen(true)}
              className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)] shrink-0 min-h-11"
            >
              <Plus className="h-4 w-4" /> Nuevo recuento
            </Button>
          )}
        </div>
      </header>

      {/* Tab bar */}
      <div className="relative">
        <div
          className="flex items-center gap-1 overflow-x-auto rp-scroll-thin pb-1 -mb-2"
          role="tablist"
          aria-label="Vistas de inventario"
        >
          {([
            { id: "stock", label: "Stock", icon: Boxes },
            { id: "escandallos", label: "Escandallos", icon: BookOpen },
            { id: "proveedores", label: "Proveedores", icon: Truck },
            { id: "recuentos", label: "Recuentos", icon: ClipboardList },
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

      {/* KPIs row — always visible */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          icon={Coins}
          label="Valor inventario"
          value={euro(valorInventario)}
          caption="coste de existencias"
          tone="emerald"
        />
        <KpiCard
          icon={TrendingDown}
          label="Mermas periodo"
          value={euro(mermasPeriodo)}
          caption="teórico vs real"
          tone="red"
        />
        <KpiCard
          icon={Percent}
          label="Coste MP"
          value={`${costeMateriaPrimaPct}%`}
          caption="sobre ventas"
          tone="yellow"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Alertas stock"
          value={String(alertas.length)}
          caption="artículos bajo mínimo"
          tone="violet"
        />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {tab === "stock" && (
          <motion.div
            key="stock"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={t}
            className="grid grid-cols-1 xl:grid-cols-[3fr_1fr] gap-6"
          >
            {/* Stock table + filters */}
            <section className="space-y-4">
              {/* Filters */}
              <div className="rp-glass rounded-2xl p-3 flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar artículo..."
                    className="pl-9 bg-background/40"
                  />
                </div>
                <Select value={catFilter} onValueChange={setCatFilter}>
                  <SelectTrigger className="w-[160px] bg-background/40">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {categorias.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <label className="flex items-center gap-2 text-xs cursor-pointer select-none px-2">
                  <Switch
                    checked={showOnlyLow}
                    onCheckedChange={setShowOnlyLow}
                    aria-label="Solo stock bajo"
                  />
                  <span className="text-muted-foreground">Solo bajo mínimo</span>
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              {/* Table */}
              <div className="rp-glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto rp-scroll-thin">
                  <table className="w-full text-sm">
                    <thead className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground bg-foreground/[0.03]">
                      <tr>
                        <th className="text-left px-4 py-3">Artículo</th>
                        <th className="text-left px-4 py-3 hidden sm:table-cell">Categoría</th>
                        <th className="text-right px-4 py-3">Stock</th>
                        <th className="text-right px-4 py-3 hidden md:table-cell">Mínimo</th>
                        <th className="text-left px-4 py-3 hidden lg:table-cell">Proveedor</th>
                        <th className="text-right px-4 py-3 hidden lg:table-cell">Valor</th>
                        <th className="text-center px-4 py-3">Estado</th>
                        <th className="text-right px-4 py-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStock.length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-center py-10 text-muted-foreground">
                            No hay artículos que coincidan.
                          </td>
                        </tr>
                      )}
                      {filteredStock.map((s) => {
                        const st = stockStatus(s);
                        const prov = proveedores.find((p) => p.id === s.proveedorId);
                        return (
                          <tr
                            key={s.id}
                            className="border-t border-border/40 hover:bg-foreground/[0.02]"
                          >
                            <td className="px-4 py-3 font-medium">{s.nombre}</td>
                            <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                              {s.categoria}
                            </td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums">
                              {fmtNum(s.stock, 3)} <span className="text-muted-foreground text-xs">{s.unidad}</span>
                            </td>
                            <td className="px-4 py-3 text-right hidden md:table-cell font-mono text-muted-foreground tabular-nums">
                              {fmtNum(s.minimo, 1)} {s.unidad}
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                              {prov?.nombre ?? "—"}
                            </td>
                            <td className="px-4 py-3 text-right hidden lg:table-cell font-mono text-muted-foreground tabular-nums">
                              {euro(s.stock * s.coste)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
                                  STATUS_META[st].border,
                                  STATUS_META[st].bg,
                                  STATUS_META[st].text
                                )}
                              >
                                <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_META[st].dot)} />
                                {STATUS_META[st].label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => ajustarStock(s.id, -1)}
                                  aria-label={`Quitar 1 ${s.unidad} de ${s.nombre}`}
                                >
                                  <ArrowDownRight className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => ajustarStock(s.id, 1)}
                                  aria-label={`Añadir 1 ${s.unidad} de ${s.nombre}`}
                                >
                                  <ArrowUpRight className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => setEditItem(s)}
                                  aria-label={`Editar ${s.nombre}`}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-[var(--rp-red-soft)] hover:text-[var(--rp-red)]"
                                  onClick={() => setConfirmDelete(s.id)}
                                  aria-label={`Eliminar ${s.nombre}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Sidebar: alertas + caducidades */}
            <aside className="space-y-4">
              <AlertasSidebar
                alertas={alertas}
                proveedores={proveedores}
                onPedido={() => setPedidoOpen(true)}
              />
              <CaducidadesCard
                lotes={lotes}
                stock={stock}
                onMarcarCaducado={(id) => {
                  setLotes((prev) => prev.filter((l) => l.id !== id));
                  toast({
                    title: "Lote retirado",
                    description: "Marcado como merma y retirado del inventario",
                    variant: "destructive",
                  });
                }}
              />
              <PlatosMenosRentablesCard platos={platosMenosRentables} />
            </aside>
          </motion.div>
        )}

        {tab === "escandallos" && (
          <motion.div
            key="escandallos"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={t}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {escandallos.map((esc) => (
                <EscandalloCard
                  key={esc.id}
                  escandallo={esc}
                  onToggle={() => toggleEscandallo(esc.id)}
                  onEdit={() => setEditEscandallo(esc)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {tab === "proveedores" && (
          <motion.div
            key="proveedores"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={t}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {proveedores.map((p) => (
                <ProveedorCard
                  key={p.id}
                  proveedor={p}
                  itemCount={stock.filter((s) => s.proveedorId === p.id).length}
                  onClick={() => setProveedorDetalle(p)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {tab === "recuentos" && (
          <motion.div
            key="recuentos"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={t}
            className="space-y-4"
          >
            {recuentos.map((r) => (
              <RecuentoCard
                key={r.id}
                recuento={r}
                onCerrar={() => cerrarRecuento(r.id)}
              />
            ))}
            {recuentos.length === 0 && (
              <div className="rp-glass rounded-2xl p-12 text-center text-muted-foreground">
                <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Aún no hay recuentos. Crea uno para empezar.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialogs */}
      {(newItemOpen || editItem) && (
        <ItemDialog
          open={newItemOpen || !!editItem}
          item={editItem}
          proveedores={proveedores}
          onClose={() => {
            setNewItemOpen(false);
            setEditItem(null);
          }}
          onSave={handleSaveItem}
        />
      )}

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar artículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el artículo y todos sus lotes asociados. Esta acción
              no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[var(--rp-red)] text-white hover:bg-[var(--rp-red-soft)]"
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PedidoDialog
        open={pedidoOpen}
        onOpenChange={setPedidoOpen}
        sugerencia={sugerenciaPedido}
        onConfirm={crearPedido}
      />

      <NewRecuentoDialog
        open={newRecuentoOpen}
        onOpenChange={setNewRecuentoOpen}
        onConfirm={crearRecuento}
      />

      <EscandalloDialog
        escandallo={editEscandallo}
        onClose={() => setEditEscandallo(null)}
        onSave={(esc) => {
          setEscandallos((prev) => {
            const exists = prev.some((e) => e.id === esc.id);
            return exists
              ? prev.map((e) => (e.id === esc.id ? esc : e))
              : [...prev, esc];
          });
          toast({ title: "Escandallo guardado", description: esc.plato });
          setEditEscandallo(null);
        }}
      />

      <ProveedorDetalleSheet
        proveedor={proveedorDetalle}
        onOpenChange={(o) => !o && setProveedorDetalle(null)}
        stock={stock.filter(
          (s) => proveedorDetalle && s.proveedorId === proveedorDetalle.id
        )}
      />

      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="bottom" className="rp-glass-strong">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
            <SheetDescription>
              Afina la lista de artículos de stock.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-3 py-4">
            <Label>Categoría</Label>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="bg-background/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {categorias.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="flex items-center gap-2 text-sm cursor-pointer pt-2">
              <Switch
                checked={showOnlyLow}
                onCheckedChange={setShowOnlyLow}
                aria-label="Solo stock bajo"
              />
              Solo stock bajo mínimo
            </label>
            <Button
              className="w-full bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
              onClick={() => setMobileFiltersOpen(false)}
            >
              Aplicar filtros
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* =========================================================
 * Alertas sidebar
 * =======================================================*/
function AlertasSidebar({
  alertas,
  proveedores,
  onPedido,
}: {
  alertas: StockItem[];
  proveedores: Proveedor[];
  onPedido: () => void;
}) {
  return (
    <div className="rp-glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-[var(--rp-yellow)]" />
          <h3 className="text-sm font-semibold">Alertas de stock</h3>
        </div>
        <Badge variant="outline" className="text-xs border-border">
          {alertas.length}
        </Badge>
      </div>
      <Separator className="mb-3" />
      <div className="space-y-2 max-h-[280px] overflow-y-auto rp-scroll-thin">
        {alertas.length === 0 && (
          <p className="text-xs text-muted-foreground py-4 text-center">
            Sin alertas. Todo el stock está por encima del mínimo.
          </p>
        )}
        {alertas.map((s) => {
          const st = stockStatus(s);
          const prov = proveedores.find((p) => p.id === s.proveedorId);
          const suggested = Math.ceil(s.minimo * 2 - s.stock);
          return (
            <div
              key={s.id}
              className={cn(
                "rounded-lg border p-2.5",
                STATUS_META[st].border,
                STATUS_META[st].bg
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{s.nombre}</div>
                  <div className="text-[11px] text-muted-foreground">
                    Stock {fmtNum(s.stock, 2)} / mín {fmtNum(s.minimo, 1)} {s.unidad}
                  </div>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium",
                    STATUS_META[st].text
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_META[st].dot)} />
                  {STATUS_META[st].label}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
                <div className="text-[11px] text-muted-foreground">
                  Sugerir: <span className="text-foreground font-medium">{suggested} {s.unidad}</span>
                  {" · "}
                  {prov?.nombre ?? "—"}
                </div>
                <div className="text-[11px] font-mono text-[var(--rp-emerald-soft)]">
                  {euro(suggested * s.coste)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {alertas.length > 0 && (
        <Button
          size="sm"
          className="w-full mt-3 bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
          onClick={onPedido}
        >
          <ShoppingCart className="h-3.5 w-3.5" /> Generar pedido sugerido
        </Button>
      )}
    </div>
  );
}

/* =========================================================
 * Caducidades card
 * =======================================================*/
function CaducidadesCard({
  lotes,
  stock,
  onMarcarCaducado,
}: {
  lotes: Lote[];
  stock: StockItem[];
  onMarcarCaducado: (id: string) => void;
}) {
  const items = lotes
    .map((l) => {
      const item = stock.find((s) => s.id === l.itemId);
      const estado = loteEstado(l.fechaCaducidad);
      return { lote: l, item, estado };
    })
    .filter((x) => x.estado !== "fresco" && x.item)
    .sort((a, b) => daysTo(a.lote.fechaCaducidad) - daysTo(b.lote.fechaCaducidad))
    .slice(0, 6);

  return (
    <div className="rp-glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-[var(--rp-red)]" />
          <h3 className="text-sm font-semibold">Caducidades</h3>
        </div>
        <Badge variant="outline" className="text-xs border-border">
          {items.length}
        </Badge>
      </div>
      <Separator className="mb-3" />
      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground py-3 text-center">
            Sin lotes próximos a caducar.
          </p>
        )}
        {items.map(({ lote, item, estado }) => {
          const meta = LOTE_META[estado];
          const d = daysTo(lote.fechaCaducidad);
          return (
            <div
              key={lote.id}
              className={cn("rounded-lg border p-2.5", meta.cls)}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {item?.nombre}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Lote {lote.lote} · {fmtNum(lote.cantidad, 2)} {item?.unidad}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn("text-[10px] font-medium", meta.cls)}
                >
                  {meta.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <div className="text-[11px] text-muted-foreground">
                  {d < 0
                    ? `Caducado hace ${Math.abs(d)}d`
                    : d === 0
                      ? "Caduca hoy"
                      : `Caduca en ${d}d`}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[var(--rp-red-soft)] hover:text-[var(--rp-red)] text-[11px]"
                  onClick={() => onMarcarCaducado(lote.id)}
                >
                  <Ban className="h-3 w-3 mr-1" /> Retirar
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
 * Platos menos rentables card
 * =======================================================*/
function PlatosMenosRentablesCard({ platos }: { platos: Escandallo[] }) {
  return (
    <div className="rp-glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-[var(--rp-violet)]" />
          <h3 className="text-sm font-semibold">Menos rentables</h3>
        </div>
        <Badge variant="outline" className="text-xs border-border">
          {platos.length}
        </Badge>
      </div>
      <Separator className="mb-3" />
      <div className="space-y-2">
        {platos.map((esc, idx) => {
          const fc = escandalloFoodCost(esc);
          return (
            <div
              key={esc.id}
              className="flex items-center justify-between gap-2 py-1.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[11px] font-mono text-muted-foreground w-4">
                  {idx + 1}.
                </span>
                <ChefHat className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm truncate">{esc.plato}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs font-mono font-medium",
                    fc > 40
                      ? "text-[var(--rp-red-soft)]"
                      : fc > 30
                        ? "text-[var(--rp-yellow-soft)]"
                        : "text-[var(--rp-emerald-soft)]"
                  )}
                >
                  {fc.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
 * Escandallo card
 * =======================================================*/
function EscandalloCard({
  escandallo,
  onToggle,
  onEdit,
}: {
  escandallo: Escandallo;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const coste = escandalloCoste(escandallo);
  const fc = escandalloFoodCost(escandallo);
  const margen = escandalloMargen(escandallo);
  const fcTone =
    fc > 40
      ? "text-[var(--rp-red-soft)]"
      : fc > 30
        ? "text-[var(--rp-yellow-soft)]"
        : "text-[var(--rp-emerald-soft)]";

  return (
    <div
      className={cn(
        "rp-glass rounded-2xl p-4 transition-opacity",
        !escandallo.activo && "opacity-50"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ChefHat className="h-4 w-4 text-[var(--rp-emerald)] shrink-0" />
            <h3 className="font-display text-base truncate">{escandallo.plato}</h3>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {escandallo.raciones} raciones/sem · {euro(escandallo.precioVenta)} venta
          </div>
        </div>
        <Switch
          checked={escandallo.activo}
          onCheckedChange={onToggle}
          aria-label={`Activar escandallo ${escandallo.plato}`}
        />
      </div>

      <Separator className="my-3" />

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Coste
          </div>
          <div className="text-sm font-display font-medium tabular-nums">
            {euro(coste)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Food cost
          </div>
          <div className={cn("text-sm font-display font-medium tabular-nums", fcTone)}>
            {fc.toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Margen
          </div>
          <div className="text-sm font-display font-medium tabular-nums text-[var(--rp-emerald-soft)]">
            {margen.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="space-y-1 mb-3 max-h-[140px] overflow-y-auto rp-scroll-thin">
        {escandallo.ingredientes.map((ing, i) => (
          <div key={`${escandallo.id}-ing-${i}`} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground truncate">{ing.nombre}</span>
            <span className="font-mono tabular-nums">
              {fmtNum(ing.cantidad, 3)} {ing.unidad} · {euro(ing.coste)}
            </span>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full border-border/60"
        onClick={onEdit}
      >
        <Pencil className="h-3.5 w-3.5 mr-1" /> Editar escandallo
      </Button>
    </div>
  );
}

/* =========================================================
 * Proveedor card
 * =======================================================*/
function ProveedorCard({
  proveedor,
  itemCount,
  onClick,
}: {
  proveedor: Proveedor;
  itemCount: number;
  onClick: () => void;
}) {
  const est = estadoProveedor(proveedor.estado);
  return (
    <button
      onClick={onClick}
      className="rp-glass rounded-2xl p-4 text-left hover:border-[var(--rp-emerald)]/30 transition-colors w-full"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-lg bg-[var(--rp-emerald)]/15 text-[var(--rp-emerald-soft)] flex items-center justify-center font-display font-medium shrink-0">
            {proveedor.nombre.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{proveedor.nombre}</div>
            <div className="text-xs text-muted-foreground truncate">
              {proveedor.contacto}
            </div>
          </div>
        </div>
        <Badge variant="outline" className={cn("text-[10px] shrink-0", est.cls)}>
          {est.label}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Package className="h-3.5 w-3.5" />
          {itemCount} artículos
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <FileText className="h-3.5 w-3.5" />
          {proveedor.catalogo} en catálogo
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <History className="h-3.5 w-3.5" />
          Último: {proveedor.ultimoPedido.slice(5)}
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <CalendarClock className="h-3.5 w-3.5" />
          Próximo: {proveedor.proximoPedido.slice(5)}
        </div>
      </div>
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-2 border-t border-border/40">
        <span className="flex items-center gap-1">
          <Phone className="h-3 w-3" /> {proveedor.telefono}
        </span>
        <ChevronRight className="h-3 w-3 ml-auto text-[var(--rp-emerald-soft)]" />
      </div>
    </button>
  );
}

/* =========================================================
 * Recuento card
 * =======================================================*/
function RecuentoCard({
  recuento,
  onCerrar,
}: {
  recuento: Recuento;
  onCerrar: () => void;
}) {
  const merma = recuento.lineas.reduce(
    (sum, l) => sum + Math.max(0, l.teorico - l.real) * l.coste,
    0
  );
  const sobra = recuento.lineas.reduce(
    (sum, l) => sum + Math.max(0, l.real - l.teorico) * l.coste,
    0
  );
  const desviacion = merma - sobra;
  const cerrado = recuento.estado === "cerrado";

  return (
    <div className="rp-glass rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-foreground/[0.04] flex items-center justify-center">
            <ClipboardList className="h-4 w-4 text-[var(--rp-emerald)]" />
          </div>
          <div>
            <div className="font-medium text-sm">
              Recuento · {recuento.fecha}
            </div>
            <div className="text-xs text-muted-foreground">
              {recuento.responsable} · {recuento.lineas.length} líneas
            </div>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-[10px]",
            cerrado
              ? "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]"
              : "border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow-soft)]"
          )}
        >
          {cerrado ? "Cerrado" : "Borrador"}
        </Badge>
      </div>
      <div className="overflow-x-auto rp-scroll-thin">
        <table className="w-full text-sm">
          <thead className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground bg-foreground/[0.03]">
            <tr>
              <th className="text-left px-4 py-2">Artículo</th>
              <th className="text-right px-4 py-2">Teórico</th>
              <th className="text-right px-4 py-2">Real</th>
              <th className="text-right px-4 py-2">Desv.</th>
              <th className="text-right px-4 py-2">Coste</th>
            </tr>
          </thead>
          <tbody>
            {recuento.lineas.map((l) => {
              const diff = l.real - l.teorico;
              const diffCls =
                diff < 0
                  ? "text-[var(--rp-red-soft)]"
                  : diff > 0
                    ? "text-[var(--rp-yellow-soft)]"
                    : "text-muted-foreground";
              return (
                <tr key={l.itemId} className="border-t border-border/30">
                  <td className="px-4 py-2">{l.nombre}</td>
                  <td className="px-4 py-2 text-right font-mono tabular-nums text-muted-foreground">
                    {fmtNum(l.teorico, 2)} {l.unidad}
                  </td>
                  <td className="px-4 py-2 text-right font-mono tabular-nums">
                    {fmtNum(l.real, 2)} {l.unidad}
                  </td>
                  <td className={cn("px-4 py-2 text-right font-mono tabular-nums", diffCls)}>
                    {diff > 0 ? "+" : ""}{fmtNum(diff, 2)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono tabular-nums text-muted-foreground">
                    {euro(Math.abs(diff) * l.coste)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-foreground/[0.03]">
            <tr className="border-t border-border/40">
              <td colSpan={3} className="px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Merma / desviación total
              </td>
              <td colSpan={2} className="px-4 py-3 text-right">
                <span
                  className={cn(
                    "font-display font-medium tabular-nums",
                    desviacion > 0
                      ? "text-[var(--rp-red-soft)]"
                      : "text-[var(--rp-emerald-soft)]"
                  )}
                >
                  {euro(desviacion)}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      {!cerrado && (
        <div className="px-4 py-3 border-t border-border/40 flex items-center justify-end gap-2">
          <Button
            size="sm"
            className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
            onClick={onCerrar}
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Cerrar recuento
          </Button>
        </div>
      )}
    </div>
  );
}

/* =========================================================
 * Item dialog (create / edit)
 * =======================================================*/
function ItemDialog({
  open,
  item,
  proveedores,
  onClose,
  onSave,
}: {
  open: boolean;
  item: StockItem | null;
  proveedores: Proveedor[];
  onClose: () => void;
  onSave: (item: StockItem) => void;
}) {
  const [form, setForm] = React.useState<StockItem>(() =>
    item ?? {
      id: `s${Date.now().toString(36)}`,
      nombre: "",
      categoria: "",
      stock: 0,
      minimo: 0,
      unidad: "kg",
      proveedorId: proveedores[0]?.id ?? "",
      coste: 0,
    }
  );

  React.useEffect(() => {
    if (item) setForm(item);
    else
      setForm({
        id: `s${Date.now().toString(36)}`,
        nombre: "",
        categoria: "",
        stock: 0,
        minimo: 0,
        unidad: "kg",
        proveedorId: proveedores[0]?.id ?? "",
        coste: 0,
      });
  }, [item, proveedores]);

  function submit() {
    if (!form.nombre.trim() || !form.categoria.trim()) return;
    onSave(form);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rp-glass-strong">
        <DialogHeader>
          <DialogTitle>{item ? "Editar artículo" : "Nuevo artículo"}</DialogTitle>
          <DialogDescription>
            Define nombre, categoría, stock mínimo, unidad, proveedor y coste.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="col-span-2">
            <Label htmlFor="it-nombre">Nombre</Label>
            <Input
              id="it-nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="bg-background/40 mt-1"
              placeholder="ej. Aceite de oliva virgen extra"
            />
          </div>
          <div>
            <Label htmlFor="it-cat">Categoría</Label>
            <Input
              id="it-cat"
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="bg-background/40 mt-1"
              placeholder="ej. Aceites"
            />
          </div>
          <div>
            <Label htmlFor="it-uni">Unidad</Label>
            <Select value={form.unidad} onValueChange={(v) => setForm({ ...form, unidad: v })}>
              <SelectTrigger id="it-uni" className="bg-background/40 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["kg", "g", "L", "ml", "ud"].map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="it-stock">Stock actual</Label>
            <Input
              id="it-stock"
              type="number"
              step="0.001"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: +e.target.value })}
              className="bg-background/40 mt-1"
            />
          </div>
          <div>
            <Label htmlFor="it-min">Stock mínimo</Label>
            <Input
              id="it-min"
              type="number"
              step="0.001"
              value={form.minimo}
              onChange={(e) => setForm({ ...form, minimo: +e.target.value })}
              className="bg-background/40 mt-1"
            />
          </div>
          <div>
            <Label htmlFor="it-coste">Coste €/unidad</Label>
            <Input
              id="it-coste"
              type="number"
              step="0.01"
              value={form.coste}
              onChange={(e) => setForm({ ...form, coste: +e.target.value })}
              className="bg-background/40 mt-1"
            />
          </div>
          <div>
            <Label htmlFor="it-prov">Proveedor</Label>
            <Select
              value={form.proveedorId}
              onValueChange={(v) => setForm({ ...form, proveedorId: v })}
            >
              <SelectTrigger id="it-prov" className="bg-background/40 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {proveedores.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
            onClick={submit}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" /> Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Pedido dialog (sugerencia de pedido)
 * =======================================================*/
function PedidoDialog({
  open,
  onOpenChange,
  sugerencia,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  sugerencia: {
    item: StockItem;
    proveedor: Proveedor | undefined;
    cantidad: number;
    coste: number;
  }[];
  onConfirm: () => void;
}) {
  const total = sugerencia.reduce((sum, s) => sum + s.coste, 0);
  const porProveedor = new Map<string, { prov: Proveedor | undefined; total: number; lineas: number }>();
  for (const s of sugerencia) {
    const key = s.proveedor?.id ?? "—";
    const prev = porProveedor.get(key);
    if (prev) {
      prev.total += s.coste;
      prev.lineas += 1;
    } else {
      porProveedor.set(key, { prov: s.proveedor, total: s.coste, lineas: 1 });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rp-glass-strong max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sugerencia de pedido</DialogTitle>
          <DialogDescription>
            Basada en stock mínimo y rotación. Genera un pedido por proveedor.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[420px] overflow-y-auto rp-scroll-thin space-y-3 py-2">
          {sugerencia.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-[var(--rp-emerald)]" />
              No hay artículos para pedir. Todo el stock está por encima del mínimo.
            </div>
          )}
          {Array.from(porProveedor.entries()).map(([key, group]) => (
            <div key={key} className="border border-border/40 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">
                  {group.prov?.nombre ?? "Sin proveedor"}
                </div>
                <div className="text-sm font-mono text-[var(--rp-emerald-soft)]">
                  {euro(group.total)}
                </div>
              </div>
              <div className="space-y-1">
                {sugerencia
                  .filter((s) => (s.proveedor?.id ?? "—") === key)
                  .map((s) => (
                    <div
                      key={s.item.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-muted-foreground">
                        {s.item.nombre}
                      </span>
                      <span className="font-mono tabular-nums">
                        {s.cantidad} {s.item.unidad} · {euro(s.coste)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <div className="text-sm mr-auto">
            <span className="text-muted-foreground">Total:</span>{" "}
            <span className="font-display font-medium tabular-nums">
              {euro(total)}
            </span>
          </div>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
            onClick={onConfirm}
            disabled={sugerencia.length === 0}
          >
            <Send className="h-4 w-4 mr-1" /> Generar pedidos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * New recuento dialog
 * =======================================================*/
function NewRecuentoDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: (responsable: string) => void;
}) {
  const [responsable, setResponsable] = React.useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rp-glass-strong">
        <DialogHeader>
          <DialogTitle>Nuevo recuento de inventario</DialogTitle>
          <DialogDescription>
            Se creará un recuento en borrador con todos los artículos actuales.
            El responsable debe firmar al cerrar.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Label htmlFor="rc-resp">Responsable</Label>
          <Input
            id="rc-resp"
            value={responsable}
            onChange={(e) => setResponsable(e.target.value)}
            className="bg-background/40 mt-1"
            placeholder="Nombre del responsable"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
            onClick={() => {
              if (!responsable.trim()) return;
              onConfirm(responsable.trim());
              setResponsable("");
            }}
            disabled={!responsable.trim()}
          >
            <Plus className="h-4 w-4 mr-1" /> Iniciar recuento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Escandallo dialog
 * =======================================================*/
function EscandalloDialog({
  escandallo,
  onClose,
  onSave,
}: {
  escandallo: Escandallo | null;
  onClose: () => void;
  onSave: (esc: Escandallo) => void;
}) {
  const [form, setForm] = React.useState<Escandallo | null>(escandallo);

  React.useEffect(() => {
    setForm(escandallo);
  }, [escandallo]);

  if (!form) return null;

  function updateIng(idx: number, patch: Partial<EscandalloIngredient>) {
    setForm((f) =>
      f
        ? {
            ...f,
            ingredientes: f.ingredientes.map((ing, i) =>
              i === idx ? { ...ing, ...patch } : ing
            ),
          }
        : f
    );
  }
  function addIng() {
    setForm((f) =>
      f
        ? {
            ...f,
            ingredientes: [
              ...f.ingredientes,
              { nombre: "", cantidad: 0, unidad: "kg", coste: 0 },
            ],
          }
        : f
    );
  }
  function removeIng(idx: number) {
    setForm((f) =>
      f
        ? {
            ...f,
            ingredientes: f.ingredientes.filter((_, i) => i !== idx),
          }
        : f
    );
  }

  const coste = form.ingredientes.reduce((sum, i) => sum + i.coste, 0);

  return (
    <Dialog open={!!escandallo} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rp-glass-strong max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar escandallo</DialogTitle>
          <DialogDescription>
            Define los ingredientes y cantidades por ración. El coste total
            determina el food cost y margen.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="col-span-2">
            <Label htmlFor="es-plato">Plato</Label>
            <Input
              id="es-plato"
              value={form.plato}
              onChange={(e) => setForm({ ...form, plato: e.target.value })}
              className="bg-background/40 mt-1"
            />
          </div>
          <div>
            <Label htmlFor="es-precio">Precio de venta (€)</Label>
            <Input
              id="es-precio"
              type="number"
              step="0.10"
              value={form.precioVenta}
              onChange={(e) =>
                setForm({ ...form, precioVenta: +e.target.value })
              }
              className="bg-background/40 mt-1"
            />
          </div>
          <div>
            <Label htmlFor="es-raciones">Raciones/sem</Label>
            <Input
              id="es-raciones"
              type="number"
              value={form.raciones}
              onChange={(e) => setForm({ ...form, raciones: +e.target.value })}
              className="bg-background/40 mt-1"
            />
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Ingredientes</span>
          <Button variant="outline" size="sm" onClick={addIng}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Añadir
          </Button>
        </div>
        <div className="space-y-2 max-h-[260px] overflow-y-auto rp-scroll-thin">
          {form.ingredientes.map((ing, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <Input
                value={ing.nombre}
                onChange={(e) => updateIng(idx, { nombre: e.target.value })}
                className="bg-background/40 col-span-5"
                placeholder="Ingrediente"
              />
              <Input
                type="number"
                step="0.001"
                value={ing.cantidad}
                onChange={(e) =>
                  updateIng(idx, { cantidad: +e.target.value })
                }
                className="bg-background/40 col-span-2"
                placeholder="Cant."
              />
              <Input
                value={ing.unidad}
                onChange={(e) => updateIng(idx, { unidad: e.target.value })}
                className="bg-background/40 col-span-2"
                placeholder="Unidad"
              />
              <Input
                type="number"
                step="0.01"
                value={ing.coste}
                onChange={(e) => updateIng(idx, { coste: +e.target.value })}
                className="bg-background/40 col-span-2"
                placeholder="Coste €"
              />
              <Button
                variant="ghost"
                size="sm"
                className="col-span-1 h-8 w-8 p-0 text-[var(--rp-red-soft)]"
                onClick={() => removeIng(idx)}
                aria-label="Quitar ingrediente"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <span className="text-sm text-muted-foreground">Coste total:</span>
          <span className="font-display font-medium tabular-nums">
            {euro(coste)}
          </span>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
            onClick={() => form && onSave(form)}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" /> Guardar escandallo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Proveedor detalle sheet
 * =======================================================*/
function ProveedorDetalleSheet({
  proveedor,
  onOpenChange,
  stock,
}: {
  proveedor: Proveedor | null;
  onOpenChange: (o: boolean) => void;
  stock: StockItem[];
}) {
  if (!proveedor) return null;
  return (
    <Sheet open={!!proveedor} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="rp-glass-strong w-full sm:max-w-md overflow-y-auto rp-scroll-thin">
        <SheetHeader>
          <SheetTitle>{proveedor.nombre}</SheetTitle>
          <SheetDescription>
            {proveedor.contacto} · {stock.length} artículos suministrados
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rp-glass rounded-lg p-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Teléfono
              </div>
              <a
                href={`tel:${proveedor.telefono}`}
                className="text-sm flex items-center gap-1.5 text-[var(--rp-emerald-soft)] mt-1"
              >
                <Phone className="h-3.5 w-3.5" /> {proveedor.telefono}
              </a>
            </div>
            <div className="rp-glass rounded-lg p-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Email
              </div>
              <a
                href={`mailto:${proveedor.email}`}
                className="text-sm flex items-center gap-1.5 text-[var(--rp-emerald-soft)] mt-1 truncate"
              >
                <Mail className="h-3.5 w-3.5" /> {proveedor.email}
              </a>
            </div>
            <div className="rp-glass rounded-lg p-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Web
              </div>
              <span className="text-sm flex items-center gap-1.5 mt-1 truncate">
                <Globe className="h-3.5 w-3.5" /> {proveedor.web}
              </span>
            </div>
            <div className="rp-glass rounded-lg p-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Catálogo
              </div>
              <span className="text-sm flex items-center gap-1.5 mt-1">
                <FileText className="h-3.5 w-3.5" /> {proveedor.catalogo} referencias
              </span>
            </div>
            <div className="rp-glass rounded-lg p-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Último pedido
              </div>
              <span className="text-sm flex items-center gap-1.5 mt-1">
                <History className="h-3.5 w-3.5" /> {proveedor.ultimoPedido}
              </span>
            </div>
            <div className="rp-glass rounded-lg p-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Próximo pedido
              </div>
              <span className="text-sm flex items-center gap-1.5 mt-1">
                <CalendarClock className="h-3.5 w-3.5" /> {proveedor.proximoPedido}
              </span>
            </div>
          </div>
          <Separator />
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
              Artículos suministrados
            </div>
            <div className="space-y-1 max-h-[280px] overflow-y-auto rp-scroll-thin">
              {stock.length === 0 && (
                <p className="text-xs text-muted-foreground py-3 text-center">
                  Sin artículos asignados a este proveedor.
                </p>
              )}
              {stock.map((s) => {
                const st = stockStatus(s);
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between text-xs py-1.5 px-2 rounded hover:bg-foreground/[0.03]"
                  >
                    <span className="truncate">{s.nombre}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-muted-foreground">
                        {fmtNum(s.stock, 2)} {s.unidad}
                      </span>
                      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_META[st].dot)} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
              onClick={() => onOpenChange(false)}
            >
              <Phone className="h-4 w-4 mr-1" /> Llamar
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              <Mail className="h-4 w-4 mr-1" /> Email
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
