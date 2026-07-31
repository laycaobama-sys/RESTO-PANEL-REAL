"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
  Delete,
  Fingerprint,
  QrCode,
  ScanLine,
  MapPin,
  CheckCircle2,
  Bell,
  BellRing,
  Clock,
  Users,
  Wallet,
  ChevronRight,
  Plus,
  Minus,
  X,
  Check,
  Send,
  ChefHat,
  Soup,
  Beef,
  IceCream,
  Wine,
  Coffee,
  Croissant,
  Fish,
  Salad,
  Sandwich,
  Pizza,
  Cake,
  Martini,
  GlassWater,
  ClipboardList,
  User,
  LogOut,
  Volume2,
  VolumeX,
  Signal,
  Wifi,
  Battery,
  RefreshCw,
  Sparkles,
  TrendingUp,
  CalendarDays,
  Moon,
  Languages,
  AlertCircle,
  Utensils,
  ArrowLeft,
  Flame,
  Eye,
  EyeOff,
  Vibrate,
  CreditCard,
  ShoppingBag,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type Screen = "login" | "mesas" | "carta" | "comanda" | "perfil";
type FichajeMode = "entrada" | "salida";
type MesaStatus = "libre" | "ocupada" | "reservada";
type Category = "entrantes" | "principales" | "postres" | "bebidas";
type ItemStatus = "enviado" | "preparacion" | "listo" | "servido";
type Ronda = "entrante" | "principal" | "postre";
type ProductTag = "popular" | "nuevo" | "vegano";

interface Employee {
  id: string;
  pin: string;
  name: string;
  role: string;
  shift: string;
  zone: string;
  avatarColor: string;
  initials: string;
  salesToday: number;
  avgTicket: number;
  tipsToday: number;
  tablesToday: number;
}

interface Mesa {
  id: string;
  num: number;
  seats: number;
  status: MesaStatus;
  openedMin?: number;
  guestName?: string;
  pax?: number;
}

interface Modifier {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  icon: React.ElementType;
  tags?: ProductTag[];
  modifiers?: Modifier[];
}

interface OrderItem {
  id: string;
  productId: string;
  mesaId: string;
  mesaNum: number;
  name: string;
  price: number;
  qty: number;
  status: ItemStatus;
  ronda: Ronda;
  note?: string;
  modifiers: string[];
  sentAt: number;
}

interface KitchenNotification {
  id: string;
  mesaNum: number;
  message: string;
  type: "listo" | "recordatorio" | "alerta";
  createdAt: number;
}

interface ShiftDay {
  day: string;
  label: string;
  hours: string;
  role: string;
  isToday?: boolean;
}

/* =========================================================
 * Constants
 * =======================================================*/
const EMPLOYEES: Employee[] = [
  {
    id: "e1",
    pin: "1234",
    name: "Marc Vidal",
    role: "Camarero · Sala",
    shift: "16:00 - 00:00",
    zone: "Sala",
    avatarColor: "var(--rp-emerald)",
    initials: "MV",
    salesToday: 480,
    avgTicket: 32,
    tipsToday: 18,
    tablesToday: 6,
  },
  {
    id: "e2",
    pin: "5678",
    name: "Laura Pérez",
    role: "Camarera · Barra",
    shift: "12:00 - 20:00",
    zone: "Barra",
    avatarColor: "var(--rp-violet)",
    initials: "LP",
    salesToday: 312,
    avgTicket: 18,
    tipsToday: 11,
    tablesToday: 4,
  },
  {
    id: "e3",
    pin: "9999",
    name: "Javi Ruiz",
    role: "Camarero · Sala",
    shift: "16:00 - 00:00",
    zone: "Sala",
    avatarColor: "var(--rp-blue)",
    initials: "JR",
    salesToday: 205,
    avgTicket: 26,
    tipsToday: 9,
    tablesToday: 3,
  },
];

const EMPLOYEE_BY_PIN = new Map(EMPLOYEES.map((e) => [e.pin, e]));

const INITIAL_MESAS: Mesa[] = [
  { id: "m1", num: 1, seats: 4, status: "ocupada", openedMin: 45, pax: 4 },
  { id: "m2", num: 2, seats: 2, status: "libre" },
  { id: "m3", num: 3, seats: 4, status: "ocupada", openedMin: 18, pax: 3 },
  { id: "m4", num: 4, seats: 6, status: "reservada", guestName: "Familia Ruiz" },
  { id: "m5", num: 5, seats: 4, status: "libre" },
  { id: "m6", num: 6, seats: 2, status: "ocupada", openedMin: 67, pax: 2 },
];

const CATEGORIES: { id: Category; label: string; icon: React.ElementType; ronda: Ronda }[] = [
  { id: "entrantes", label: "Entrantes", icon: Soup, ronda: "entrante" },
  { id: "principales", label: "Principales", icon: Beef, ronda: "principal" },
  { id: "postres", label: "Postres", icon: IceCream, ronda: "postre" },
  { id: "bebidas", label: "Bebidas", icon: Wine, ronda: "principal" },
];

const POINT_MODIFIERS: Modifier[] = [
  { id: "punto-1", name: "Poco hecho" },
  { id: "punto-2", name: "Al punto" },
  { id: "punto-3", name: "Hecho" },
];

const EXTRAS_MODIFIERS: Modifier[] = [
  { id: "ex-1", name: "Sin cebolla" },
  { id: "ex-2", name: "Salsa aparte" },
  { id: "ex-3", name: "Extra pan" },
];

const PRODUCTS: Product[] = [
  { id: "p1", name: "Croquetas jamón", price: 9.5, category: "entrantes", icon: Croissant, tags: ["popular"] },
  { id: "p2", name: "Patatas bravas", price: 8.0, category: "entrantes", icon: Salad, tags: ["vegano"] },
  { id: "p3", name: "Calamares a la andaluza", price: 12.5, category: "entrantes", icon: Fish },
  { id: "p4", name: "Ensalada César", price: 9.0, category: "entrantes", icon: Salad },
  { id: "p5", name: "Tartar de atún", price: 14.0, category: "entrantes", icon: Fish, tags: ["nuevo"] },
  { id: "p6", name: "Pan artesano", price: 2.5, category: "entrantes", icon: Sandwich, modifiers: EXTRAS_MODIFIERS },
  { id: "p7", name: "Secreto ibérico", price: 16.5, category: "principales", icon: Beef, tags: ["popular"], modifiers: POINT_MODIFIERS },
  { id: "p8", name: "Entrecot 400g", price: 22.0, category: "principales", icon: Beef, modifiers: POINT_MODIFIERS },
  { id: "p9", name: "Bacalao confitado", price: 18.0, category: "principales", icon: Fish, modifiers: EXTRAS_MODIFIERS },
  { id: "p10", name: "Risotto de setas", price: 13.5, category: "principales", icon: Salad, tags: ["vegano"] },
  { id: "p11", name: "Hamburguesa madurada", price: 15.0, category: "principales", icon: Beef, modifiers: POINT_MODIFIERS },
  { id: "p12", name: "Pizza margarita", price: 11.0, category: "principales", icon: Pizza, tags: ["vegano"] },
  { id: "p13", name: "Tarta de queso", price: 6.5, category: "postres", icon: Cake, tags: ["popular"] },
  { id: "p14", name: "Brownie helado", price: 7.0, category: "postres", icon: Cake },
  { id: "p15", name: "Helado artesano", price: 5.0, category: "postres", icon: IceCream, modifiers: EXTRAS_MODIFIERS },
  { id: "p16", name: "Café espresso", price: 1.6, category: "bebidas", icon: Coffee },
  { id: "p17", name: "Copa de vino", price: 4.0, category: "bebidas", icon: Wine },
  { id: "p18", name: "Gintonic premium", price: 9.0, category: "bebidas", icon: Martini, tags: ["nuevo"] },
  { id: "p19", name: "Refresco", price: 2.5, category: "bebidas", icon: GlassWater },
  { id: "p20", name: "Agua mineral", price: 1.8, category: "bebidas", icon: GlassWater },
];

const SHIFTS_WEEK: ShiftDay[] = [
  { day: "Lun", label: "L", hours: "16:00 - 00:00", role: "Sala" },
  { day: "Mar", label: "M", hours: "16:00 - 00:00", role: "Sala" },
  { day: "Mié", label: "X", hours: "—", role: "Libre" },
  { day: "Jue", label: "J", hours: "16:00 - 00:00", role: "Sala", isToday: true },
  { day: "Vie", label: "V", hours: "12:00 - 00:00", role: "Sala" },
  { day: "Sáb", label: "S", hours: "12:00 - 00:00", role: "Sala" },
  { day: "Dom", label: "D", hours: "—", role: "Libre" },
];

const ITEM_STATUS_META: Record<
  ItemStatus,
  { label: string; cls: string; dot: string; icon: React.ElementType }
> = {
  enviado: {
    label: "Enviado",
    cls: "border-[var(--rp-blue)]/40 bg-[var(--rp-blue)]/10 text-[var(--rp-blue-soft)]",
    dot: "bg-[var(--rp-blue)]",
    icon: Send,
  },
  preparacion: {
    label: "En preparación",
    cls: "border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow-soft)]",
    dot: "bg-[var(--rp-yellow)]",
    icon: Flame,
  },
  listo: {
    label: "Listo",
    cls: "border-[var(--rp-emerald)]/50 bg-[var(--rp-emerald)]/12 text-[var(--rp-emerald-soft)]",
    dot: "bg-[var(--rp-emerald)]",
    icon: CheckCircle2,
  },
  servido: {
    label: "Servido",
    cls: "border-zinc-500/40 bg-zinc-500/10 text-zinc-300",
    dot: "bg-zinc-500",
    icon: Check,
  },
};

const RONDA_META: Record<
  Ronda,
  { label: string; icon: React.ElementType; cls: string }
> = {
  entrante: {
    label: "Entrante",
    icon: Soup,
    cls: "text-[var(--rp-blue-soft)] border-[var(--rp-blue)]/40 bg-[var(--rp-blue)]/10",
  },
  principal: {
    label: "Principal",
    icon: Beef,
    cls: "text-[var(--rp-yellow-soft)] border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10",
  },
  postre: {
    label: "Postre",
    icon: IceCream,
    cls: "text-[var(--rp-violet-soft)] border-[var(--rp-violet)]/40 bg-[var(--rp-violet)]/10",
  },
};

const MESA_STATUS_META: Record<
  MesaStatus,
  { label: string; dot: string; border: string; text: string; bg: string }
> = {
  libre: {
    label: "Libre",
    dot: "bg-[var(--rp-emerald)]",
    border: "border-[var(--rp-emerald)]/40",
    text: "text-[var(--rp-emerald-soft)]",
    bg: "bg-[var(--rp-emerald)]/8",
  },
  ocupada: {
    label: "Ocupada",
    dot: "bg-[var(--rp-red)]",
    border: "border-[var(--rp-red)]/40",
    text: "text-[var(--rp-red-soft)]",
    bg: "bg-[var(--rp-red)]/8",
  },
  reservada: {
    label: "Reservada",
    dot: "bg-[var(--rp-yellow)]",
    border: "border-[var(--rp-yellow)]/40",
    text: "text-[var(--rp-yellow-soft)]",
    bg: "bg-[var(--rp-yellow)]/8",
  },
};

const TAG_META: Record<
  ProductTag,
  { label: string; cls: string; dot: string }
> = {
  popular: {
    label: "Popular",
    cls: "border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow-soft)]",
    dot: "bg-[var(--rp-yellow)]",
  },
  nuevo: {
    label: "Nuevo",
    cls: "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]",
    dot: "bg-[var(--rp-emerald)]",
  },
  vegano: {
    label: "Vegano",
    cls: "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/15 text-[var(--rp-emerald-soft)]",
    dot: "bg-[var(--rp-emerald)]",
  },
};

/* =========================================================
 * Helpers
 * =======================================================*/
function eur(n: number): string {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

function uid(prefix = "i"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

function fmtClock(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function fmtShiftDuration(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

function fmtRelative(ts: number, now: number): string {
  const sec = Math.max(0, Math.floor((now - ts) / 1000));
  if (sec < 60) return "ahora";
  const min = Math.floor(sec / 60);
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  return `hace ${h}h`;
}

function maskPin(pin: string): string {
  return "•".repeat(Math.max(0, pin.length));
}

/* =========================================================
 * Phone shell — mobile-first container with desktop chrome
 * =======================================================*/
function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="relative min-h-[640px] md:min-h-[760px] md:rounded-[2rem] md:border md:border-white/10 md:shadow-2xl overflow-hidden bg-[#0A0F0E]">
        {/* Status bar mock (desktop only — on mobile the native bar is visible) */}
        <div className="hidden md:flex absolute top-0 inset-x-0 z-30 items-center justify-between px-6 pt-2 pb-1 text-[10px] text-white/60 font-mono pointer-events-none">
          <span className="tabular-nums">14:32</span>
          <div className="flex items-center gap-1">
            <Signal className="h-3 w-3" />
            <Wifi className="h-3 w-3" />
            <Battery className="h-3 w-3" />
            <span className="tabular-nums">87%</span>
          </div>
        </div>
        <div className="md:pt-6 min-h-[640px] md:min-h-[760px] flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Haptic button — visual tap feedback (scale + flash)
 * =======================================================*/
function HapticButton({
  children,
  onClick,
  className,
  disabled,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      whileTap={reduce ? undefined : { scale: 0.94 }}
      transition={reduce ? undefined : { duration: 0.08 }}
      className={cn(
        "select-none active:transition-none disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
    >
      {children}
    </motion.button>
  );
}

/* =========================================================
 * PIN pad — 4 dots + 12 number buttons (60px) + backspace
 * =======================================================*/
function PinDots({ pin }: { pin: string }) {
  return (
    <div className="flex items-center justify-center gap-3" aria-live="polite">
      {[0, 1, 2, 3].map((i) => {
        const filled = i < pin.length;
        return (
          <motion.div
            key={i}
            initial={false}
            animate={filled ? { scale: [1, 1.25, 1] } : { scale: 1 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "h-3.5 w-3.5 rounded-full border transition-colors",
              filled
                ? "bg-[var(--rp-emerald)] border-[var(--rp-emerald)]"
                : "bg-white/5 border-white/20"
            )}
          />
        );
      })}
    </div>
  );
}

function PinPad({
  onKey,
  onBackspace,
  disabled,
}: {
  onKey: (k: string) => void;
  onBackspace: () => void;
  disabled?: boolean;
}) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  return (
    <div className="grid grid-cols-3 gap-3">
      {keys.map((k) => (
        <HapticButton
          key={k}
          ariaLabel={`PIN ${k}`}
          disabled={disabled}
          onClick={() => onKey(k)}
          className="h-[60px] rounded-2xl bg-white/5 border border-white/10 text-white text-2xl font-display tabular-nums hover:bg-white/10 active:bg-[var(--rp-emerald)]/20"
        >
          {k}
        </HapticButton>
      ))}
      <HapticButton
        ariaLabel="Borrar"
        disabled={disabled}
        onClick={onBackspace}
        className="h-[60px] rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 flex items-center justify-center"
      >
        <Delete className="h-5 w-5" />
      </HapticButton>
      <HapticButton
        ariaLabel="Cero"
        disabled={disabled}
        onClick={() => onKey("0")}
        className="h-[60px] rounded-2xl bg-white/5 border border-white/10 text-white text-2xl font-display tabular-nums hover:bg-white/10 active:bg-[var(--rp-emerald)]/20"
      >
        0
      </HapticButton>
      <div className="h-[60px]" aria-hidden />
    </div>
  );
}

/* =========================================================
 * Brand mark — RestoPanel inline logo
 * =======================================================*/
function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-[var(--rp-emerald)] to-[var(--rp-emerald-deep)] flex items-center justify-center shadow-lg shadow-[var(--rp-emerald)]/30">
        <Utensils className="h-4 w-4 text-black" />
      </div>
      <div className="leading-tight">
        <div className="font-display text-lg tracking-tight text-white">
          Resto<span className="text-[var(--rp-emerald-soft)]">Panel</span>
        </div>
        <div className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-mono">
          PDA · Fichaje
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Hero overlay — restaurant ambient background
 * =======================================================*/
function HeroOverlay() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Deep gradient base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F0E] via-[#0E1816] to-[#0A0F0E]" />
      {/* Emerald glow top-right */}
      <div
        className="absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--rp-emerald), transparent 70%)" }}
      />
      {/* Amber glow bottom-left */}
      <div
        className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--rp-yellow), transparent 70%)" }}
      />
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.05] rp-grid-bg" />
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)]" />
    </div>
  );
}

/* =========================================================
 * Login / Fichaje screen
 * =======================================================*/
function LoginScreen({
  pin,
  fichajeMode,
  recognizedEmployee,
  onKey,
  onBackspace,
  onClearPin,
  onSetFichajeMode,
  onConfirmFichaje,
  onQrScan,
  onFaceId,
  lastError,
  ficherando,
}: {
  pin: string;
  fichajeMode: FichajeMode;
  recognizedEmployee: Employee | null;
  onKey: (k: string) => void;
  onBackspace: () => void;
  onClearPin: () => void;
  onSetFichajeMode: (m: FichajeMode) => void;
  onConfirmFichaje: () => void;
  onQrScan: () => void;
  onFaceId: () => void;
  lastError: string | null;
  ficherando: boolean;
}) {
  const reduce = useReducedMotion();
  const pinComplete = pin.length === 4;

  return (
    <motion.div
      key="login"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="relative flex-1 flex flex-col px-6 py-8 overflow-y-auto rp-scroll-thin"
    >
      <HeroOverlay />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Brand */}
        <div className="pt-2">
          <BrandMark />
        </div>

        {/* Welcome */}
        <div className="mt-10 text-center">
          <h1 className="font-display text-3xl text-white tracking-tight">Bienvenido</h1>
          <p className="text-sm text-white/50 mt-1.5">
            Introduce tu PIN de 4 dígitos para fichar
          </p>
        </div>

        {/* Employee recognition card */}
        <AnimatePresence mode="wait">
          {recognizedEmployee ? (
            <motion.div
              key="emp"
              initial={reduce ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="mt-6 mx-auto w-full max-w-xs rounded-2xl border border-[var(--rp-emerald)]/30 bg-[var(--rp-emerald)]/8 p-3 flex items-center gap-3"
            >
              <div
                className="h-11 w-11 rounded-full flex items-center justify-center font-display text-sm text-black"
                style={{ background: recognizedEmployee.avatarColor }}
              >
                {recognizedEmployee.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-white truncate">
                  {recognizedEmployee.name}
                </div>
                <div className="text-[11px] text-white/50 truncate">
                  {recognizedEmployee.role}
                </div>
              </div>
              <CheckCircle2 className="h-4 w-4 text-[var(--rp-emerald-soft)] shrink-0" />
            </motion.div>
          ) : lastError ? (
            <motion.div
              key="err"
              initial={reduce ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0 }}
              className="mt-6 mx-auto w-full max-w-xs rounded-2xl border border-[var(--rp-red)]/30 bg-[var(--rp-red)]/10 p-3 flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4 text-[var(--rp-red-soft)] shrink-0" />
              <div className="text-xs text-[var(--rp-red-soft)]">{lastError}</div>
            </motion.div>
          ) : (
            <motion.div
              key="hint"
              initial={false}
              className="mt-6 mx-auto w-full max-w-xs rounded-2xl border border-white/8 bg-white/[0.03] p-3 flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-white/40 shrink-0" />
              <div className="text-[11px] text-white/50">
                Prueba PIN <span className="font-mono text-[var(--rp-emerald-soft)]">1234</span> ·{" "}
                <span className="font-mono text-[var(--rp-emerald-soft)]">5678</span> ·{" "}
                <span className="font-mono text-[var(--rp-emerald-soft)]">9999</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PIN dots */}
        <div className="mt-7">
          <PinDots pin={pin} />
        </div>

        {/* PIN pad */}
        <div className="mt-5">
          <PinPad onKey={onKey} onBackspace={onBackspace} disabled={pin.length >= 4 || ficherando} />
        </div>

        {/* Fichaje mode toggle */}
        <div className="mt-5 grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/5 border border-white/10">
          {(["entrada", "salida"] as const).map((m) => {
            const active = fichajeMode === m;
            return (
              <HapticButton
                key={m}
                onClick={() => onSetFichajeMode(m)}
                className={cn(
                  "h-12 rounded-xl text-sm font-medium capitalize transition-colors",
                  active
                    ? m === "entrada"
                      ? "bg-[var(--rp-emerald)] text-black shadow-lg shadow-[var(--rp-emerald)]/30"
                      : "bg-[var(--rp-red)] text-white shadow-lg shadow-[var(--rp-red)]/30"
                    : "text-white/70 hover:text-white"
                )}
              >
                {m === "entrada" ? "Fichar entrada" : "Fichar salida"}
              </HapticButton>
            );
          })}
        </div>

        {/* Confirm button */}
        <HapticButton
          disabled={!pinComplete || !recognizedEmployee || ficherando}
          onClick={onConfirmFichaje}
          className={cn(
            "mt-3 w-full h-14 rounded-2xl font-display text-base font-medium flex items-center justify-center gap-2 transition-colors",
            fichajeMode === "entrada"
              ? "bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)] shadow-lg shadow-[var(--rp-emerald)]/30"
              : "bg-[var(--rp-red)] text-white hover:bg-[var(--rp-red-soft)] shadow-lg shadow-[var(--rp-red)]/30",
            (!pinComplete || !recognizedEmployee) && "opacity-50 pointer-events-none"
          )}
        >
          {ficherando ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              Fichando…
            </>
          ) : fichajeMode === "entrada" ? (
            <>
              <CheckCircle2 className="h-5 w-5" />
              Fichar entrada
            </>
          ) : (
            <>
              <LogOut className="h-5 w-5" />
              Fichar salida
            </>
          )}
        </HapticButton>

        {/* Alt auth methods */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <HapticButton
            onClick={onQrScan}
            className="h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-medium flex items-center justify-center gap-1.5"
          >
            <QrCode className="h-4 w-4 text-[var(--rp-emerald-soft)]" />
            Escanear QR
          </HapticButton>
          <HapticButton
            onClick={onFaceId}
            className="h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-medium flex items-center justify-center gap-1.5"
          >
            <Fingerprint className="h-4 w-4 text-[var(--rp-blue-soft)]" />
            Face ID
          </HapticButton>
        </div>

        {/* Shift info */}
        <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.03] p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Clock className="h-3.5 w-3.5 text-[var(--rp-emerald-soft)]" />
            <span className="font-mono">
              Turno: 16:00 - 00:00 · Sala
            </span>
          </div>
          <Separator className="bg-white/8" />
          <div className="flex items-center gap-2 text-xs text-white/60">
            <MapPin className="h-3.5 w-3.5 text-[var(--rp-emerald-soft)]" />
            <span>Estás en el restaurante</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-[var(--rp-emerald-soft)] ml-auto" />
          </div>
        </div>

        {/* Reset PIN link */}
        <div className="mt-3 text-center">
          <HapticButton
            onClick={onClearPin}
            className="text-[11px] text-white/40 hover:text-white/60 underline-offset-2 hover:underline"
          >
            ¿Olvidaste tu PIN? Pide uno nuevo al encargado
          </HapticButton>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
 * Dashboard top bar
 * =======================================================*/
function TopBar({
  employee,
  now,
  shiftStartedAt,
  notifCount,
  onBell,
  soundOn,
  onToggleSound,
}: {
  employee: Employee;
  now: number;
  shiftStartedAt: number | null;
  notifCount: number;
  onBell: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
}) {
  const shiftDuration = shiftStartedAt ? now - shiftStartedAt : 0;
  return (
    <div className="px-4 pt-4 pb-3 flex items-center gap-3 border-b border-white/8 bg-[#0A0F0E]/80 backdrop-blur sticky top-0 z-20">
      <div
        className="h-10 w-10 rounded-full flex items-center justify-center font-display text-xs text-black shrink-0"
        style={{ background: employee.avatarColor }}
      >
        {employee.initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-white truncate">
          Hola, {employee.name.split(" ")[0]}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-white/50">
          <Clock className="h-3 w-3" />
          <span className="font-mono tabular-nums">{fmtClock(new Date(now))}</span>
          {shiftStartedAt && (
            <>
              <span className="text-white/20">·</span>
              <span className="font-mono tabular-nums text-[var(--rp-emerald-soft)]">
                {fmtShiftDuration(shiftDuration)}
              </span>
            </>
          )}
        </div>
      </div>
      <HapticButton
        onClick={onToggleSound}
        ariaLabel={soundOn ? "Silenciar" : "Activar sonido"}
        className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70"
      >
        {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      </HapticButton>
      <HapticButton
        onClick={onBell}
        ariaLabel="Notificaciones"
        className="relative h-10 w-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70"
      >
        {notifCount > 0 ? <BellRing className="h-4 w-4 text-[var(--rp-yellow-soft)]" /> : <Bell className="h-4 w-4" />}
        {notifCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--rp-red)] text-[10px] font-bold text-white flex items-center justify-center">
            {notifCount > 9 ? "9+" : notifCount}
          </span>
        )}
      </HapticButton>
    </div>
  );
}

/* =========================================================
 * Quick stats strip
 * =======================================================*/
function QuickStats({
  tables,
  pending,
  tips,
}: {
  tables: number;
  pending: number;
  tips: number;
}) {
  return (
    <div className="px-4 pt-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/40 font-mono">
            <ClipboardList className="h-3 w-3" /> Mis mesas
          </div>
          <div className="mt-1 text-2xl font-display tabular-nums text-white">
            {tables}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--rp-yellow)]/20 bg-[var(--rp-yellow)]/8 p-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--rp-yellow-soft)]/80 font-mono">
            <Clock className="h-3 w-3" /> Pendientes
          </div>
          <div className="mt-1 text-2xl font-display tabular-nums text-[var(--rp-yellow-soft)]">
            {pending}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--rp-emerald)]/20 bg-[var(--rp-emerald)]/8 p-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--rp-emerald-soft)]/80 font-mono">
            <Wallet className="h-3 w-3" /> Propinas
          </div>
          <div className="mt-1 text-2xl font-display tabular-nums text-[var(--rp-emerald-soft)]">
            {eur(tips)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Mesa card
 * =======================================================*/
function MesaCard({
  mesa,
  onOpen,
  onAction,
}: {
  mesa: Mesa;
  onOpen: () => void;
  onAction: (action: "comanda" | "cuenta" | "cocina") => void;
}) {
  const reduce = useReducedMotion();
  const meta = MESA_STATUS_META[mesa.status];

  // Long-press detection
  const pressTimer = React.useRef<number | null>(null);
  const [quickActions, setQuickActions] = React.useState(false);

  function startPress() {
    if (reduce) return;
    pressTimer.current = window.setTimeout(() => {
      setQuickActions(true);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          (navigator as Navigator & { vibrate: (p: number | number[]) => boolean }).vibrate(30);
        } catch {
          /* no-op */
        }
      }
    }, 500);
  }
  function cancelPress() {
    if (pressTimer.current) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "relative rounded-2xl border p-3 transition-colors",
        meta.border,
        meta.bg
      )}
    >
      <button
        type="button"
        onClick={() => {
          if (quickActions) {
            setQuickActions(false);
            return;
          }
          onOpen();
        }}
        onPointerDown={startPress}
        onPointerUp={cancelPress}
        onPointerLeave={cancelPress}
        onPointerCancel={cancelPress}
        className="w-full text-left touch-manipulation"
        aria-label={`Abrir ${mesa.num}`}
      >
        <div className="flex items-center justify-between">
          <div className="font-display text-lg text-white tabular-nums">
            {mesa.num}
          </div>
          <span className={cn("h-2.5 w-2.5 rounded-full", meta.dot)} />
        </div>
        <div className={cn("text-[10px] uppercase tracking-wider font-mono mt-1", meta.text)}>
          {meta.label}
        </div>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-white/60">
          <Users className="h-3 w-3" />
          <span className="tabular-nums">
            {mesa.pax ?? mesa.seats} pax
          </span>
          <span className="text-white/20">·</span>
          <span className="tabular-nums">{mesa.seats} seats</span>
        </div>
        {mesa.status === "ocupada" && typeof mesa.openedMin === "number" && (
          <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-[var(--rp-red)]/12 px-1.5 py-0.5 text-[10px] text-[var(--rp-red-soft)] font-mono">
            <Clock className="h-2.5 w-2.5" />
            <span className="tabular-nums">{mesa.openedMin} min</span>
          </div>
        )}
        {mesa.status === "reservada" && mesa.guestName && (
          <div className="mt-1 truncate text-[11px] text-[var(--rp-yellow-soft)] font-medium">
            {mesa.guestName}
          </div>
        )}
      </button>

      <AnimatePresence>
        {quickActions && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="mt-2 pt-2 border-t border-white/10 grid grid-cols-3 gap-1"
          >
            <HapticButton
              onClick={() => {
                setQuickActions(false);
                onAction("comanda");
              }}
              className="rounded-lg bg-white/5 hover:bg-white/10 py-2 text-[10px] text-white/80 flex flex-col items-center gap-0.5"
            >
              <ClipboardList className="h-3.5 w-3.5" />
              Comanda
            </HapticButton>
            <HapticButton
              onClick={() => {
                setQuickActions(false);
                onAction("cuenta");
              }}
              className="rounded-lg bg-white/5 hover:bg-white/10 py-2 text-[10px] text-white/80 flex flex-col items-center gap-0.5"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Cuenta
            </HapticButton>
            <HapticButton
              onClick={() => {
                setQuickActions(false);
                onAction("cocina");
              }}
              className="rounded-lg bg-white/5 hover:bg-white/10 py-2 text-[10px] text-white/80 flex flex-col items-center gap-0.5"
            >
              <ChefHat className="h-3.5 w-3.5" />
              Cocina
            </HapticButton>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* =========================================================
 * Dashboard screen (Mesas)
 * =======================================================*/
function DashboardScreen({
  employee,
  now,
  shiftStartedAt,
  mesas,
  notifCount,
  soundOn,
  onToggleSound,
  onBell,
  onOpenMesa,
  onMesaAction,
  onRefresh,
  refreshing,
}: {
  employee: Employee;
  now: number;
  shiftStartedAt: number | null;
  mesas: Mesa[];
  notifCount: number;
  soundOn: boolean;
  onToggleSound: () => void;
  onBell: () => void;
  onOpenMesa: (m: Mesa) => void;
  onMesaAction: (m: Mesa, action: "comanda" | "cuenta" | "cocina") => void;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const reduce = useReducedMotion();
  const occupied = mesas.filter((m) => m.status === "ocupada").length;
  const pending = mesas.filter((m) => m.status === "ocupada" && (m.openedMin ?? 0) > 60).length;

  return (
    <motion.div
      key="mesas"
      initial={reduce ? false : { opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduce ? undefined : { opacity: 0, x: -12 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex-1 flex flex-col"
    >
      <TopBar
        employee={employee}
        now={now}
        shiftStartedAt={shiftStartedAt}
        notifCount={notifCount}
        onBell={onBell}
        soundOn={soundOn}
        onToggleSound={onToggleSound}
      />

      <QuickStats tables={occupied} pending={pending} tips={employee.tipsToday} />

      {/* Mesas grid with pull-to-refresh hint */}
      <div className="flex-1 px-4 pt-4 pb-28 overflow-y-auto rp-scroll-thin">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-base text-white">Mis mesas</h2>
          <HapticButton
            onClick={onRefresh}
            className="flex items-center gap-1 text-[11px] text-white/50 hover:text-white/80"
          >
            <RefreshCw className={cn("h-3 w-3", refreshing && "animate-spin")} />
            {refreshing ? "Actualizando…" : "Actualizar"}
          </HapticButton>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {mesas.map((m) => (
            <MesaCard
              key={m.id}
              mesa={m}
              onOpen={() => onOpenMesa(m)}
              onAction={(action) => onMesaAction(m, action)}
            />
          ))}
        </div>

        {/* Tip card */}
        <div className="mt-4 rounded-2xl border border-[var(--rp-emerald)]/20 bg-gradient-to-br from-[var(--rp-emerald)]/8 to-transparent p-3">
          <div className="flex items-center gap-2 text-xs text-[var(--rp-emerald-soft)]">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="font-medium">Consejo del día</span>
          </div>
          <div className="mt-1 text-[11px] text-white/60 leading-snug">
            La mesa 4 cumple años hoy. Ofrece un digestivo de la casa al cierre de la cuenta.
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
 * Carta screen (3-touch flow: category → product → ticket)
 * =======================================================*/
function CartaScreen({
  category,
  onCategory,
  selectedMesa,
  items,
  onPickProduct,
  onOpenTicket,
  onBack,
}: {
  category: Category;
  onCategory: (c: Category) => void;
  selectedMesa: Mesa | null;
  items: OrderItem[];
  onPickProduct: (p: Product) => void;
  onOpenTicket: () => void;
  onBack: () => void;
}) {
  const reduce = useReducedMotion();
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      if (p.category !== category) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [category, search]);

  const pendingItems = items.filter((i) => i.status === "enviado" || i.status === "preparacion").length;
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <motion.div
      key="carta"
      initial={reduce ? false : { opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduce ? undefined : { opacity: 0, x: -12 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex-1 flex flex-col"
    >
      {/* Carta header */}
      <div className="px-4 pt-4 pb-3 sticky top-0 z-20 bg-[#0A0F0E]/80 backdrop-blur border-b border-white/8">
        <div className="flex items-center gap-2 mb-3">
          <HapticButton
            onClick={onBack}
            ariaLabel="Volver"
            className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70"
          >
            <ArrowLeft className="h-4 w-4" />
          </HapticButton>
          <div className="min-w-0 flex-1">
            <div className="font-display text-base text-white">Carta</div>
            <div className="text-[11px] text-white/50 truncate">
              {selectedMesa
                ? `Mesa ${selectedMesa.num} · ${selectedMesa.pax ?? selectedMesa.seats} pax`
                : "Sin mesa seleccionada"}
            </div>
          </div>
        </div>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto…"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-10"
        />
      </div>

      {/* Category chips */}
      <div className="px-4 pt-3 pb-1 overflow-x-auto rp-scroll-thin flex gap-2">
        {CATEGORIES.map((c) => {
          const active = c.id === category;
          return (
            <HapticButton
              key={c.id}
              onClick={() => onCategory(c.id)}
              className={cn(
                "shrink-0 h-10 px-3.5 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-colors",
                active
                  ? "border-[var(--rp-emerald)] bg-[var(--rp-emerald)] text-black"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
              )}
            >
              <c.icon className="h-3.5 w-3.5" />
              {c.label}
            </HapticButton>
          );
        })}
      </div>

      {/* Product grid */}
      <div className="flex-1 px-4 pt-3 pb-32 overflow-y-auto rp-scroll-thin">
        {filtered.length === 0 ? (
          <div className="mt-12 text-center text-white/40 text-sm">
            No hay productos que coincidan.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onPick={() => onPickProduct(p)} />
            ))}
          </div>
        )}
      </div>

      {/* Ticket bar (sticky CTA) */}
      {items.length > 0 && (
        <div className="absolute bottom-16 inset-x-0 z-30 px-4 pb-2">
          <HapticButton
            onClick={onOpenTicket}
            className="w-full h-14 rounded-2xl bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)] shadow-lg shadow-[var(--rp-emerald)]/30 flex items-center justify-between px-4"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="text-sm font-medium">
                Ver ticket
              </span>
              {pendingItems > 0 && (
                <Badge className="bg-black/20 text-black border-0 tabular-nums">
                  {pendingItems}
                </Badge>
              )}
            </div>
            <span className="font-display tabular-nums">{eur(total)}</span>
          </HapticButton>
        </div>
      )}
    </motion.div>
  );
}

function ProductCard({ product, onPick }: { product: Product; onPick: () => void }) {
  const reduce = useReducedMotion();
  const Icon = product.icon;
  return (
    <motion.button
      type="button"
      onClick={onPick}
      whileTap={reduce ? undefined : { scale: 0.95 }}
      transition={reduce ? undefined : { duration: 0.1 }}
      className="relative rounded-2xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 text-left overflow-hidden transition-colors"
    >
      {/* Image placeholder (gradient + icon) */}
      <div className="aspect-[4/3] bg-gradient-to-br from-white/8 to-white/[0.02] flex items-center justify-center relative">
        <Icon className="h-9 w-9 text-white/30" />
        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
            {product.tags.map((t) => {
              const tm = TAG_META[t];
              return (
                <span
                  key={t}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-medium",
                    tm.cls
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", tm.dot)} />
                  {tm.label}
                </span>
              );
            })}
          </div>
        )}
      </div>
      <div className="p-2.5">
        <div className="text-sm text-white font-medium leading-tight line-clamp-2 min-h-[2.2em]">
          {product.name}
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="font-display text-base text-[var(--rp-emerald-soft)] tabular-nums">
            {eur(product.price)}
          </span>
          <div className="h-6 w-6 rounded-full bg-[var(--rp-emerald)]/15 border border-[var(--rp-emerald)]/30 flex items-center justify-center">
            <Plus className="h-3.5 w-3.5 text-[var(--rp-emerald-soft)]" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/* =========================================================
 * Modifier dialog (for products with modifiers)
 * =======================================================*/
function ModifierDialog({
  open,
  product,
  onClose,
  onConfirm,
}: {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirm: (selected: string[], note: string) => void;
}) {
  const [selected, setSelected] = React.useState<string[]>([]);
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setSelected([]);
      setNote("");
    }
  }, [open, product]);

  if (!product || !product.modifiers || product.modifiers.length === 0) return null;

  const modifiers = product.modifiers;
  const isPoint = modifiers === POINT_MODIFIERS;
  // Treat POINT_MODIFIERS as radio (single), EXTRAS as multi
  const obligatorioSelected = !isPoint || selected.length > 0;

  function toggle(id: string) {
    if (isPoint) {
      setSelected((prev) => (prev.includes(id) ? [] : [id]));
    } else {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#0E1816] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <product.icon className="h-5 w-5 text-[var(--rp-emerald-soft)]" />
            {product.name}
          </DialogTitle>
          <DialogDescription className="text-white/50">
            {isPoint
              ? "Selecciona el punto de cocción (obligatorio)."
              : "Personaliza el plato (opcional)."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {modifiers.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => toggle(m.id)}
                className={cn(
                  "rounded-lg border p-2.5 text-sm font-medium transition-colors",
                  selected.includes(m.id)
                    ? "border-[var(--rp-emerald)]/60 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]"
                    : "border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
                )}
              >
                {m.name}
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note" className="text-xs uppercase tracking-wider text-white/50">
              Nota de cocina
            </Label>
            <Textarea
              id="note"
              placeholder="Ej. sin sal, alergia frutos secos…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-white/70 hover:text-white">
            Cancelar
          </Button>
          <Button
            onClick={() => onConfirm(selected, note.trim() || "")}
            disabled={!obligatorioSelected}
            className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
          >
            <Plus className="h-4 w-4" /> Añadir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Order ticket bottom sheet
 * =======================================================*/
function OrderTicketSheet({
  open,
  onClose,
  items,
  mesa,
  onChangeQty,
  onRemove,
  onSetRonda,
  onSend,
  onServe,
}: {
  open: boolean;
  onClose: () => void;
  items: OrderItem[];
  mesa: Mesa | null;
  onChangeQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onSetRonda: (id: string, ronda: Ronda) => void;
  onSend: () => void;
  onServe: (id: string) => void;
}) {
  const reduce = useReducedMotion();
  const [activeRonda, setActiveRonda] = React.useState<Ronda>("principal");

  const grouped = React.useMemo(() => {
    const order: Ronda[] = ["entrante", "principal", "postre"];
    return order
      .map((r) => ({ ronda: r, items: items.filter((i) => i.ronda === r) }))
      .filter((g) => g.items.length > 0);
  }, [items]);

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const unsent = items.filter((i) => i.status === "enviado").length;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
          {/* Sheet */}
          <motion.div
            initial={reduce ? false : { y: "100%" }}
            animate={{ y: 0 }}
            exit={reduce ? undefined : { y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="absolute inset-x-0 bottom-0 z-50 max-h-[85%] rounded-t-3xl border-t border-white/10 bg-[#0E1816] flex flex-col"
          >
            {/* Handle */}
            <div className="pt-2 pb-1 flex justify-center">
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="px-4 py-2 flex items-center justify-between border-b border-white/8">
              <div className="min-w-0">
                <div className="font-display text-base text-white">
                  Ticket {mesa ? `· Mesa ${mesa.num}` : ""}
                </div>
                <div className="text-[11px] text-white/50">
                  {items.length} líneas · {items.reduce((s, i) => s + i.qty, 0)} uds
                </div>
              </div>
              <HapticButton
                onClick={onClose}
                ariaLabel="Cerrar ticket"
                className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70"
              >
                <X className="h-4 w-4" />
              </HapticButton>
            </div>

            {/* Course selector (new items ronda) */}
            <div className="px-4 pt-3">
              <Label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">
                Próxima ronda
              </Label>
              <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                {(["entrante", "principal", "postre"] as const).map((r) => {
                  const m = RONDA_META[r];
                  const active = activeRonda === r;
                  return (
                    <HapticButton
                      key={r}
                      onClick={() => setActiveRonda(r)}
                      className={cn(
                        "h-9 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors",
                        active ? m.cls : "border-white/10 bg-white/5 text-white/60"
                      )}
                    >
                      <m.icon className="h-3 w-3" />
                      {m.label}
                    </HapticButton>
                  );
                })}
              </div>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto rp-scroll-thin px-4 py-3 space-y-3">
              {grouped.length === 0 ? (
                <div className="py-12 text-center text-white/40 text-sm">
                  Añade productos desde la carta para empezar la comanda.
                </div>
              ) : (
                grouped.map((g) => {
                  const rm = RONDA_META[g.ronda];
                  return (
                    <div key={g.ronda}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <rm.icon className="h-3 w-3 text-white/40" />
                        <span className="text-[10px] uppercase tracking-wider text-white/50 font-mono">
                          {rm.label}
                        </span>
                        <Separator className="flex-1 bg-white/8" />
                      </div>
                      <div className="space-y-1.5">
                        {g.items.map((item) => (
                          <TicketRow
                            key={item.id}
                            item={item}
                            onChangeQty={onChangeQty}
                            onRemove={onRemove}
                            onSetRonda={onSetRonda}
                            onServe={onServe}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer: total + send */}
            <div className="px-4 py-3 border-t border-white/8 bg-[#0A0F0E]/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/60">Total</span>
                <span className="font-display text-xl text-white tabular-nums">
                  {eur(total)}
                </span>
              </div>
              <HapticButton
                onClick={onSend}
                disabled={unsent === 0}
                className={cn(
                  "w-full h-14 rounded-2xl font-display text-base font-medium flex items-center justify-center gap-2 transition-colors",
                  unsent > 0
                    ? "bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)] shadow-lg shadow-[var(--rp-emerald)]/30"
                    : "bg-white/5 text-white/40 cursor-not-allowed"
                )}
              >
                <Send className="h-4 w-4" />
                {unsent > 0
                  ? `Enviar a cocina · ${unsent} ${unsent === 1 ? "línea" : "líneas"}`
                  : "Todo enviado a cocina"}
              </HapticButton>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function TicketRow({
  item,
  onChangeQty,
  onRemove,
  onSetRonda,
  onServe,
}: {
  item: OrderItem;
  onChangeQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onSetRonda: (id: string, ronda: Ronda) => void;
  onServe: (id: string) => void;
}) {
  const reduce = useReducedMotion();
  const statusMeta = ITEM_STATUS_META[item.status];
  const StatusIcon = statusMeta.icon;
  const canChange = item.status === "enviado";
  const canServe = item.status === "listo";

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-2.5">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-sm text-white font-medium leading-tight">
            {item.name}
          </div>
          {item.modifiers.length > 0 && (
            <div className="mt-0.5 text-[11px] text-white/50">
              {item.modifiers.join(" · ")}
            </div>
          )}
          {item.note && (
            <div className="mt-0.5 text-[11px] text-[var(--rp-yellow-soft)] italic">
              “{item.note}”
            </div>
          )}
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-medium",
                statusMeta.cls
              )}
            >
              <StatusIcon className="h-2.5 w-2.5" />
              {statusMeta.label}
            </span>
            <span className="text-[10px] text-white/40 font-mono tabular-nums">
              {eur(item.price * item.qty)}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            <HapticButton
              onClick={() => canChange && onChangeQty(item.id, -1)}
              disabled={!canChange}
              className={cn(
                "h-7 w-7 rounded-md border flex items-center justify-center",
                canChange
                  ? "border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
                  : "border-white/5 bg-white/5 text-white/20 cursor-not-allowed"
              )}
            >
              <Minus className="h-3 w-3" />
            </HapticButton>
            <span className="w-6 text-center font-display text-sm text-white tabular-nums">
              {item.qty}
            </span>
            <HapticButton
              onClick={() => canChange && onChangeQty(item.id, 1)}
              disabled={!canChange}
              className={cn(
                "h-7 w-7 rounded-md border flex items-center justify-center",
                canChange
                  ? "border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
                  : "border-white/5 bg-white/5 text-white/20 cursor-not-allowed"
              )}
            >
              <Plus className="h-3 w-3" />
            </HapticButton>
          </div>
          {canChange && (
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="text-[10px] text-[var(--rp-red-soft)] hover:underline"
            >
              Anular
            </button>
          )}
          {canServe && (
            <HapticButton
              onClick={() => onServe(item.id)}
              className="text-[10px] rounded-md bg-[var(--rp-emerald)]/15 border border-[var(--rp-emerald)]/30 text-[var(--rp-emerald-soft)] px-2 py-1 font-medium"
            >
              Servir
            </HapticButton>
          )}
        </div>
      </div>
      {/* Ronda quick-change (only for enviado) */}
      {canChange && (
        <div className="mt-2 pt-2 border-t border-white/8 flex items-center gap-1">
          <span className="text-[9px] uppercase tracking-wider text-white/40 font-mono mr-1">
            Ronda:
          </span>
          {(["entrante", "principal", "postre"] as const).map((r) => {
            const active = item.ronda === r;
            const m = RONDA_META[r];
            return (
              <button
                key={r}
                type="button"
                onClick={() => onSetRonda(item.id, r)}
                className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] border transition-colors",
                  active
                    ? m.cls
                    : "border-white/8 bg-transparent text-white/40 hover:text-white/60"
                )}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================
 * Comanda / Kitchen notifications screen
 * =======================================================*/
function ComandaScreen({
  notifications,
  items,
  now,
  onAckNotification,
  onServe,
  onBack,
}: {
  notifications: KitchenNotification[];
  items: OrderItem[];
  now: number;
  onAckNotification: (id: string) => void;
  onServe: (id: string) => void;
  onBack: () => void;
}) {
  const reduce = useReducedMotion();

  const activeItems = items.filter((i) => i.status !== "servido");
  const groupedByMesa = React.useMemo(() => {
    const map = new Map<number, OrderItem[]>();
    for (const it of activeItems) {
      const list = map.get(it.mesaNum) ?? [];
      list.push(it);
      map.set(it.mesaNum, list);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [activeItems]);

  return (
    <motion.div
      key="comanda"
      initial={reduce ? false : { opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduce ? undefined : { opacity: 0, x: -12 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex-1 flex flex-col"
    >
      <div className="px-4 pt-4 pb-3 sticky top-0 z-20 bg-[#0A0F0E]/80 backdrop-blur border-b border-white/8 flex items-center gap-2">
        <HapticButton
          onClick={onBack}
          ariaLabel="Volver"
          className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70"
        >
          <ArrowLeft className="h-4 w-4" />
        </HapticButton>
        <div className="min-w-0 flex-1">
          <div className="font-display text-base text-white">Comanda</div>
          <div className="text-[11px] text-white/50">
            {notifications.length} avisos · {activeItems.length} líneas activas
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rp-scroll-thin px-4 py-3 pb-28 space-y-4">
        {/* Push notifications */}
        <section>
          <h3 className="text-[10px] uppercase tracking-wider text-white/40 font-mono mb-2">
            Avisos de cocina
          </h3>
          {notifications.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 text-center text-white/40 text-sm">
              <ChefHat className="h-6 w-6 mx-auto mb-2 opacity-50" />
              Sin avisos pendientes
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {notifications.map((n) => (
                  <NotificationCard
                    key={n.id}
                    n={n}
                    now={now}
                    onAck={() => onAckNotification(n.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Active orders grouped by mesa */}
        <section>
          <h3 className="text-[10px] uppercase tracking-wider text-white/40 font-mono mb-2">
            Comandas activas
          </h3>
          {groupedByMesa.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 text-center text-white/40 text-sm">
              <ClipboardList className="h-6 w-6 mx-auto mb-2 opacity-50" />
              No hay comandas activas
            </div>
          ) : (
            <div className="space-y-2.5">
              {groupedByMesa.map(([mesaNum, list]) => (
                <div
                  key={mesaNum}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-display text-sm text-white">
                      Mesa <span className="tabular-nums">{mesaNum}</span>
                    </div>
                    <Badge variant="outline" className="border-white/10 text-white/60 text-[10px]">
                      {list.length} líneas
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    {list.map((item) => {
                      const sm = ITEM_STATUS_META[item.status];
                      const SIcon = sm.icon;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 text-xs"
                        >
                          <SIcon className="h-3.5 w-3.5 text-white/60" />
                          <span className="text-white/80 flex-1 truncate">
                            {item.qty}× {item.name}
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-medium",
                              sm.cls
                            )}
                          >
                            {sm.label}
                          </span>
                          {item.status === "listo" && (
                            <HapticButton
                              onClick={() => onServe(item.id)}
                              className="rounded-md bg-[var(--rp-emerald)]/15 border border-[var(--rp-emerald)]/30 text-[var(--rp-emerald-soft)] px-1.5 py-0.5 text-[10px] font-medium"
                            >
                              Servir
                            </HapticButton>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
}

function NotificationCard({
  n,
  now,
  onAck,
}: {
  n: KitchenNotification;
  now: number;
  onAck: () => void;
}) {
  const reduce = useReducedMotion();
  const tone =
    n.type === "listo"
      ? "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/8"
      : n.type === "alerta"
      ? "border-[var(--rp-red)]/40 bg-[var(--rp-red)]/8"
      : "border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/8";
  const Icon = n.type === "listo" ? CheckCircle2 : n.type === "alerta" ? AlertCircle : BellRing;
  const iconColor =
    n.type === "listo"
      ? "text-[var(--rp-emerald-soft)]"
      : n.type === "alerta"
      ? "text-[var(--rp-red-soft)]"
      : "text-[var(--rp-yellow-soft)]";

  return (
    <motion.div
      layout
      initial={reduce ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, x: 60 }}
      transition={{ duration: 0.18 }}
      className={cn("rounded-2xl border p-3 flex items-start gap-2.5", tone)}
    >
      <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", iconColor)} />
      <div className="min-w-0 flex-1">
        <div className="text-sm text-white font-medium leading-tight">
          Mesa {n.mesaNum}: {n.message}
        </div>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-white/50">
          <span>{fmtRelative(n.createdAt, now)}</span>
          <span className="text-white/20">·</span>
          <Vibrate className="h-2.5 w-2.5" />
          <span>Vibración</span>
        </div>
      </div>
      <HapticButton
        onClick={onAck}
        className="shrink-0 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 px-2.5 py-1.5 text-[11px] text-white font-medium"
      >
        Recoger
      </HapticButton>
    </motion.div>
  );
}

/* =========================================================
 * Profile screen
 * =======================================================*/
function ProfileScreen({
  employee,
  shiftStartedAt,
  now,
  onFicharSalida,
  settings,
  onToggleSetting,
  onBack,
}: {
  employee: Employee;
  shiftStartedAt: number | null;
  now: number;
  onFicharSalida: () => void;
  settings: { sound: boolean; notifications: boolean; darkTheme: boolean };
  onToggleSetting: (k: "sound" | "notifications" | "darkTheme") => void;
  onBack: () => void;
}) {
  const reduce = useReducedMotion();
  const shiftDuration = shiftStartedAt ? now - shiftStartedAt : 0;
  const [showPin, setShowPin] = React.useState(false);

  return (
    <motion.div
      key="perfil"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -12 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex-1 flex flex-col"
    >
      <div className="px-4 pt-4 pb-3 sticky top-0 z-20 bg-[#0A0F0E]/80 backdrop-blur border-b border-white/8 flex items-center gap-2">
        <HapticButton
          onClick={onBack}
          ariaLabel="Volver"
          className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70"
        >
          <ArrowLeft className="h-4 w-4" />
        </HapticButton>
        <div className="min-w-0 flex-1">
          <div className="font-display text-base text-white">Perfil</div>
          <div className="text-[11px] text-white/50">{employee.role}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rp-scroll-thin px-4 py-4 pb-28 space-y-4">
        {/* Employee card */}
        <div className="rounded-2xl border border-white/8 bg-gradient-to-br from-white/[0.05] to-transparent p-4">
          <div className="flex items-center gap-3">
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center font-display text-lg text-black"
              style={{ background: employee.avatarColor }}
            >
              {employee.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-lg text-white truncate">
                {employee.name}
              </div>
              <div className="text-xs text-white/50">{employee.role}</div>
              <div className="text-[11px] text-white/40 font-mono">
                ID {employee.id.toUpperCase()} · {employee.zone}
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-2.5">
              <div className="text-[10px] uppercase tracking-wider text-white/40 font-mono">
                PIN
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-sm text-white tabular-nums">
                  {showPin ? employee.pin : maskPin(employee.pin)}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPin((v) => !v)}
                  className="text-white/40 hover:text-white/70"
                  aria-label={showPin ? "Ocultar PIN" : "Mostrar PIN"}
                >
                  {showPin ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-2.5 flex items-center justify-center">
              <div className="grid grid-cols-7 grid-rows-3 gap-px">
                {Array.from({ length: 21 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 w-1 rounded-sm",
                      // Pseudo-QR pattern
                      (i * 7 + 3) % 5 === 0 || (i * 13 + 1) % 7 === 0
                        ? "bg-white"
                        : "bg-white/15"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Today's hours */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/40 font-mono">
            <Clock className="h-3 w-3" /> Jornada de hoy
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] text-white/50">Entrada</div>
              <div className="font-display text-lg text-white tabular-nums">
                16:02
              </div>
            </div>
            <div>
              <div className="text-[11px] text-white/50">Horas</div>
              <div className="font-display text-lg text-[var(--rp-emerald-soft)] tabular-nums">
                {fmtShiftDuration(shiftDuration)}
              </div>
            </div>
          </div>
        </div>

        {/* Shift week mini calendar */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/40 font-mono mb-3">
            <CalendarDays className="h-3 w-3" /> Mis turnos esta semana
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {SHIFTS_WEEK.map((s) => {
              const off = s.role === "Libre";
              return (
                <div
                  key={s.day}
                  className={cn(
                    "rounded-lg border p-1.5 text-center",
                    s.isToday
                      ? "border-[var(--rp-emerald)]/50 bg-[var(--rp-emerald)]/8"
                      : off
                      ? "border-white/5 bg-transparent opacity-50"
                      : "border-white/10 bg-white/[0.02]"
                  )}
                >
                  <div className="text-[9px] uppercase text-white/40 font-mono">
                    {s.label}
                  </div>
                  <div
                    className={cn(
                      "mt-1 text-[10px] font-medium tabular-nums",
                      s.isToday
                        ? "text-[var(--rp-emerald-soft)]"
                        : off
                        ? "text-white/30"
                        : "text-white/80"
                    )}
                  >
                    {s.hours === "—" ? "—" : s.hours.split(" - ")[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance */}
        <div className="rounded-2xl border border-[var(--rp-emerald)]/20 bg-gradient-to-br from-[var(--rp-emerald)]/8 to-transparent p-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--rp-emerald-soft)]/80 font-mono mb-3">
            <TrendingUp className="h-3 w-3" /> Mi rendimiento hoy
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="text-[10px] text-white/50">Ventas</div>
              <div className="font-display text-base text-white tabular-nums">
                {eur(employee.salesToday)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-white/50">Ticket medio</div>
              <div className="font-display text-base text-white tabular-nums">
                {eur(employee.avgTicket)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-white/50">Propinas</div>
              <div className="font-display text-base text-[var(--rp-emerald-soft)] tabular-nums">
                {eur(employee.tipsToday)}
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] divide-y divide-white/8">
          <SettingRow
            icon={Languages}
            label="Idioma"
            value="Español"
            onClick={() => undefined}
          />
          <SettingToggle
            icon={Bell}
            label="Notificaciones push"
            checked={settings.notifications}
            onChange={() => onToggleSetting("notifications")}
          />
          <SettingToggle
            icon={Volume2}
            label="Sonido de avisos"
            checked={settings.sound}
            onChange={() => onToggleSetting("sound")}
          />
          <SettingToggle
            icon={Moon}
            label="Tema oscuro"
            checked={settings.darkTheme}
            onChange={() => onToggleSetting("darkTheme")}
          />
        </div>

        {/* Fichar salida */}
        <HapticButton
          onClick={onFicharSalida}
          className="w-full h-14 rounded-2xl bg-[var(--rp-red)] text-white hover:bg-[var(--rp-red-soft)] shadow-lg shadow-[var(--rp-red)]/30 font-display text-base font-medium flex items-center justify-center gap-2"
        >
          <LogOut className="h-5 w-5" />
          Fichar salida
        </HapticButton>
      </div>
    </motion.div>
  );
}

function SettingRow({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full px-3 py-3 flex items-center gap-3 hover:bg-white/[0.03] transition-colors text-left"
    >
      <Icon className="h-4 w-4 text-white/50 shrink-0" />
      <span className="flex-1 text-sm text-white">{label}</span>
      <span className="text-xs text-white/40">{value}</span>
      <ChevronRight className="h-3.5 w-3.5 text-white/30" />
    </button>
  );
}

function SettingToggle({
  icon: Icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="px-3 py-3 flex items-center gap-3">
      <Icon className="h-4 w-4 text-white/50 shrink-0" />
      <span className="flex-1 text-sm text-white">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

/* =========================================================
 * Bottom navigation
 * =======================================================*/
function BottomNav({
  current,
  onNavigate,
  notifCount,
}: {
  current: Screen;
  onNavigate: (s: Screen) => void;
  notifCount: number;
}) {
  const items: { id: Screen; label: string; icon: React.ElementType }[] = [
    { id: "mesas", label: "Mesas", icon: ClipboardList },
    { id: "carta", label: "Carta", icon: Utensils },
    { id: "comanda", label: "Comanda", icon: ChefHat },
    { id: "perfil", label: "Perfil", icon: User },
  ];

  return (
    <div className="absolute bottom-0 inset-x-0 z-30 border-t border-white/8 bg-[#0A0F0E]/95 backdrop-blur-md">
      <div className="grid grid-cols-4 px-2 py-1.5">
        {items.map((it) => {
          const active = current === it.id;
          const Icon = it.icon;
          return (
            <HapticButton
              key={it.id}
              onClick={() => onNavigate(it.id)}
              className={cn(
                "relative py-2 flex flex-col items-center gap-0.5 rounded-xl transition-colors",
                active
                  ? "text-[var(--rp-emerald-soft)]"
                  : "text-white/50 hover:text-white/80"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {it.id === "comanda" && notifCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[var(--rp-red)] text-[9px] font-bold text-white flex items-center justify-center">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{it.label}</span>
              {active && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute -top-1.5 h-1 w-8 rounded-full bg-[var(--rp-emerald)]"
                />
              )}
            </HapticButton>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
 * QR scan mock dialog
 * =======================================================*/
function QrScanDialog({
  open,
  onClose,
  onScan,
}: {
  open: boolean;
  onClose: () => void;
  onScan: () => void;
}) {
  const reduce = useReducedMotion();
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm bg-[#0E1816] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <QrCode className="h-5 w-5 text-[var(--rp-emerald-soft)]" />
            Escanear QR
          </DialogTitle>
          <DialogDescription className="text-white/50">
            Apunta la cámara al código QR de tu tarjeta de empleado.
          </DialogDescription>
        </DialogHeader>
        <div className="relative aspect-square rounded-2xl border border-white/10 bg-black overflow-hidden">
          {/* Scan viewport */}
          <div className="absolute inset-0 flex items-center justify-center">
            <ScanLine className="h-16 w-16 text-white/20" />
          </div>
          {/* Animated scan line */}
          {!reduce && (
            <motion.div
              initial={{ top: "10%" }}
              animate={{ top: ["10%", "90%", "10%"] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-x-4 h-0.5 bg-[var(--rp-emerald)] shadow-[0_0_8px_var(--rp-emerald)]"
            />
          )}
          {/* Corner brackets */}
          <div className="absolute top-4 left-4 h-6 w-6 border-t-2 border-l-2 border-[var(--rp-emerald)]" />
          <div className="absolute top-4 right-4 h-6 w-6 border-t-2 border-r-2 border-[var(--rp-emerald)]" />
          <div className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-[var(--rp-emerald)]" />
          <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-[var(--rp-emerald)]" />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-white/70 hover:text-white">
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onScan();
              onClose();
            }}
            className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
          >
            Simular lectura
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Face ID mock dialog
 * =======================================================*/
function FaceIdDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const reduce = useReducedMotion();
  const [scanning, setScanning] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setScanning(true);
    setSuccess(false);
    const id = window.setTimeout(() => {
      setScanning(false);
      setSuccess(true);
    }, 1400);
    return () => window.clearTimeout(id);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm bg-[#0E1816] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Fingerprint className="h-5 w-5 text-[var(--rp-blue-soft)]" />
            Face ID
          </DialogTitle>
          <DialogDescription className="text-white/50">
            Mira a la cámara para autenticarte.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 flex flex-col items-center gap-4">
          <motion.div
            animate={
              reduce
                ? undefined
                : scanning
                ? { scale: [1, 1.05, 1] }
                : success
                ? { scale: 1 }
                : undefined
            }
            transition={
              reduce ? undefined : { duration: 1, repeat: scanning ? Infinity : 0 }
            }
            className={cn(
              "relative h-24 w-24 rounded-3xl border-2 flex items-center justify-center transition-colors",
              success
                ? "border-[var(--rp-emerald)] bg-[var(--rp-emerald)]/10"
                : "border-[var(--rp-blue)]/50 bg-[var(--rp-blue)]/8"
            )}
          >
            {success ? (
              <CheckCircle2 className="h-12 w-12 text-[var(--rp-emerald-soft)]" />
            ) : (
              <Fingerprint
                className={cn(
                  "h-12 w-12 text-[var(--rp-blue-soft)]",
                  scanning && !reduce && "animate-pulse"
                )}
              />
            )}
          </motion.div>
          <div className="text-sm text-white/60">
            {scanning ? "Escaneando rostro…" : success ? "Identidad verificada" : ""}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-white/70 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            disabled={!success}
            onClick={() => {
              onSuccess();
              onClose();
            }}
            className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
          >
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Fichaje confirmation dialog
 * =======================================================*/
function FichajeConfirmDialog({
  open,
  mode,
  employee,
  onClose,
  onConfirm,
}: {
  open: boolean;
  mode: FichajeMode;
  employee: Employee | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm bg-[#0E1816] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            {mode === "entrada" ? (
              <CheckCircle2 className="h-5 w-5 text-[var(--rp-emerald-soft)]" />
            ) : (
              <LogOut className="h-5 w-5 text-[var(--rp-red-soft)]" />
            )}
            {mode === "entrada" ? "Fichar entrada" : "Fichar salida"}
          </DialogTitle>
          <DialogDescription className="text-white/50">
            {employee
              ? `Confirmas el fichaje para ${employee.name}.`
              : "Selecciona un empleado primero."}
          </DialogDescription>
        </DialogHeader>
        {employee && (
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3 flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center font-display text-xs text-black"
              style={{ background: employee.avatarColor }}
            >
              {employee.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm text-white font-medium truncate">
                {employee.name}
              </div>
              <div className="text-[11px] text-white/50 font-mono">
                Turno {employee.shift} · {employee.zone}
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-white/70 hover:text-white">
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!employee}
            className={
              mode === "entrada"
                ? "bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
                : "bg-[var(--rp-red)] text-white hover:bg-[var(--rp-red-soft)]"
            }
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Main view
 * =======================================================*/
export function MobilePdaView() {
  const { toast } = useToast();
  const reduce = useReducedMotion();

  // Auth / fichaje state
  const [screen, setScreen] = React.useState<Screen>("login");
  const [fichajeMode, setFichajeMode] = React.useState<FichajeMode>("entrada");
  const [pin, setPin] = React.useState("");
  const [employee, setEmployee] = React.useState<Employee | null>(null);
  const [recognizedEmployee, setRecognizedEmployee] = React.useState<Employee | null>(null);
  const [lastError, setLastError] = React.useState<string | null>(null);
  const [ficherando, setFicherando] = React.useState(false);
  const [shiftStartedAt, setShiftStartedAt] = React.useState<number | null>(null);
  const [fichajeDialogOpen, setFichajeDialogOpen] = React.useState(false);

  // Alt auth dialogs
  const [qrOpen, setQrOpen] = React.useState(false);
  const [faceIdOpen, setFaceIdOpen] = React.useState(false);

  // Mesa state
  const [mesas, setMesas] = React.useState<Mesa[]>(INITIAL_MESAS);
  const [selectedMesaId, setSelectedMesaId] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  // Carta state
  const [category, setCategory] = React.useState<Category>("entrantes");
  const [items, setItems] = React.useState<OrderItem[]>([]);
  const [pendingProduct, setPendingProduct] = React.useState<Product | null>(null);
  const [modifierOpen, setModifierOpen] = React.useState(false);
  const [ticketOpen, setTicketOpen] = React.useState(false);

  // Notifications
  const [notifications, setNotifications] = React.useState<KitchenNotification[]>([]);

  // Settings
  const [soundOn, setSoundOn] = React.useState(true);
  const [settings, setSettings] = React.useState({
    sound: true,
    notifications: true,
    darkTheme: true,
  });

  // Clock
  const [now, setNow] = React.useState<number>(Date.now());
  React.useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(id);
  }, []);

  /* ---------- PIN logic ---------- */
  React.useEffect(() => {
    if (pin.length === 4) {
      const emp = EMPLOYEE_BY_PIN.get(pin) ?? null;
      if (emp) {
        setRecognizedEmployee(emp);
        setLastError(null);
      } else {
        setRecognizedEmployee(null);
        setLastError("PIN no reconocido. Inténtalo de nuevo.");
        window.setTimeout(() => setPin(""), 800);
      }
    } else {
      setRecognizedEmployee(null);
      setLastError(null);
    }
  }, [pin]);

  function handlePinKey(k: string) {
    if (pin.length >= 4) return;
    setPin((p) => p + k);
  }
  function handleBackspace() {
    setPin((p) => p.slice(0, -1));
  }
  function handleClearPin() {
    setPin("");
    setRecognizedEmployee(null);
    setLastError(null);
  }

  /* ---------- Fichaje ---------- */
  function handleConfirmFichaje() {
    if (!recognizedEmployee) return;
    setFichajeDialogOpen(true);
  }

  function executeFichaje() {
    if (!recognizedEmployee) return;
    setFicherando(true);
    setFichajeDialogOpen(false);
    window.setTimeout(() => {
      setFicherando(false);
      setEmployee(recognizedEmployee);
      const ts = Date.now();
      if (fichajeMode === "entrada") {
        setShiftStartedAt(ts);
        toast({
          title: "Entrada fichada",
          description: `${recognizedEmployee.name} · ${fmtClock(new Date(ts))}`,
        });
        setScreen("mesas");
      } else {
        const duration = shiftStartedAt ? ts - shiftStartedAt : 0;
        toast({
          title: "Salida fichada",
          description: `${recognizedEmployee.name} · ${fmtShiftDuration(duration)} trabajadas`,
        });
        // Reset session
        setShiftStartedAt(null);
        setPin("");
        setRecognizedEmployee(null);
        setEmployee(null);
        setItems([]);
        setNotifications([]);
        setScreen("login");
      }
    }, 700);
  }

  /* ---------- QR / Face ID ---------- */
  function handleQrScan() {
    // Simulate: pick first employee
    const emp = EMPLOYEES[0];
    setPin(emp.pin);
    setQrOpen(false);
    toast({ title: "QR leído", description: emp.name, duration: 1500 });
  }
  function handleFaceIdSuccess() {
    // Simulate: pick first employee
    const emp = EMPLOYEES[0];
    setPin(emp.pin);
    toast({ title: "Face ID OK", description: emp.name, duration: 1500 });
  }

  /* ---------- Mesas ---------- */
  function openMesa(m: Mesa) {
    setSelectedMesaId(m.id);
    if (m.status === "libre") {
      setMesas((ms) =>
        ms.map((x) =>
          x.id === m.id ? { ...x, status: "ocupada", openedMin: 0, pax: m.seats } : x
        )
      );
      toast({ title: "Mesa abierta", description: `Mesa ${m.num} · ${m.seats} pax` });
    }
    setScreen("carta");
  }

  function mesaAction(m: Mesa, action: "comanda" | "cuenta" | "cocina") {
    if (action === "comanda") {
      setSelectedMesaId(m.id);
      setScreen("carta");
      setTicketOpen(true);
    } else if (action === "cuenta") {
      const total = items
        .filter((i) => i.mesaId === m.id)
        .reduce((s, i) => s + i.price * i.qty, 0);
      toast({
        title: "Cuenta solicitada",
        description: `Mesa ${m.num} · ${eur(total)}`,
      });
    } else {
      toast({
        title: "Cocina notificada",
        description: `Camarero llama a cocina · Mesa ${m.num}`,
      });
    }
  }

  function refreshMesas() {
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
      // Bump occupied timers
      setMesas((ms) =>
        ms.map((m) =>
          m.status === "ocupada" && typeof m.openedMin === "number"
            ? { ...m, openedMin: m.openedMin + 1 }
            : m
        )
      );
      toast({ title: "Mesas actualizadas", duration: 1200 });
    }, 800);
  }

  /* ---------- Carta ---------- */
  const selectedMesa = mesas.find((m) => m.id === selectedMesaId) ?? null;

  function pickProduct(p: Product) {
    if (!selectedMesa) {
      toast({
        title: "Selecciona una mesa",
        description: "Abre una mesa antes de añadir productos.",
        variant: "destructive",
      });
      return;
    }
    if (p.modifiers && p.modifiers.length > 0) {
      setPendingProduct(p);
      setModifierOpen(true);
      return;
    }
    addItem(p, []);
  }

  function addItem(p: Product, modifiers: string[], note?: string) {
    const ronda =
      CATEGORIES.find((c) => c.id === p.category)?.ronda ?? "principal";
    const existing = items.find(
      (i) =>
        i.productId === p.id &&
        i.mesaId === selectedMesa?.id &&
        i.status === "enviado" &&
        i.note === (note ?? undefined) &&
        JSON.stringify(i.modifiers) === JSON.stringify(modifiers)
    );
    if (existing) {
      setItems((prev) =>
        prev.map((i) => (i.id === existing.id ? { ...i, qty: i.qty + 1 } : i))
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: uid(),
          productId: p.id,
          mesaId: selectedMesa?.id ?? "unknown",
          mesaNum: selectedMesa?.num ?? 0,
          name: p.name,
          price: p.price,
          qty: 1,
          status: "enviado",
          ronda,
          note: note,
          modifiers,
          sentAt: Date.now(),
        },
      ]);
    }
    if (pendingProduct) {
      setPendingProduct(null);
      setModifierOpen(false);
    }
    toast({
      title: "Añadido al ticket",
      description: p.name,
      duration: 1200,
    });
  }

  function changeQty(itemId: string, delta: number) {
    setItems((prev) =>
      prev
        .map((i) =>
          i.id === itemId && i.status === "enviado"
            ? { ...i, qty: Math.max(0, i.qty + delta) }
            : i
        )
        .filter((i) => i.qty > 0)
    );
  }

  function removeItem(itemId: string) {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  function setRonda(itemId: string, ronda: Ronda) {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, ronda } : i))
    );
  }

  function sendOrder() {
    const unsent = items.filter((i) => i.status === "enviado");
    if (unsent.length === 0) {
      toast({ title: "Nada pendiente de envío", variant: "destructive" });
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.status === "enviado"
          ? { ...i, status: "preparacion" as ItemStatus, sentAt: Date.now() }
          : i
      )
    );
    toast({
      title: "Comanda enviada a cocina",
      description: `${unsent.length} líneas · Mesa ${selectedMesa?.num ?? ""}`,
    });

    // Simulate cocina marking items "listo" after a delay + push notification
    const mesaNum = selectedMesa?.num ?? 0;
    const firstUnsent = unsent[0];
    window.setTimeout(() => {
      setItems((prev) =>
        prev.map((i) =>
          i.id === firstUnsent.id ? { ...i, status: "listo" as ItemStatus } : i
        )
      );
      if (settings.notifications) {
        const n: KitchenNotification = {
          id: uid("n"),
          mesaNum,
          message: `${firstUnsent.name} listo`,
          type: "listo",
          createdAt: Date.now(),
        };
        setNotifications((prev) => [n, ...prev]);
        if (soundOn && typeof navigator !== "undefined" && "vibrate" in navigator) {
          try {
            (navigator as Navigator & { vibrate: (p: number | number[]) => boolean }).vibrate([
              80, 40, 80,
            ]);
          } catch {
            /* no-op */
          }
        }
      }
    }, 6000);
  }

  function serveItem(itemId: string) {
    const item = items.find((i) => i.id === itemId);
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, status: "servido" as ItemStatus } : i))
    );
    if (item) {
      toast({
        title: "Servido",
        description: `${item.name} · Mesa ${item.mesaNum}`,
        duration: 1200,
      });
    }
  }

  /* ---------- Notifications ---------- */
  function ackNotification(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast({ title: "Aviso atendido", duration: 1200 });
  }

  // Auto-dismiss notifications after 10s
  React.useEffect(() => {
    if (notifications.length === 0) return;
    const timers = notifications.map((n) =>
      window.setTimeout(() => {
        setNotifications((prev) => prev.filter((x) => x.id !== n.id));
      }, 10000)
    );
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [notifications]);

  // Seed an initial demo notification after login
  React.useEffect(() => {
    if (screen === "mesas" && employee && notifications.length === 0) {
      const id = window.setTimeout(() => {
        setNotifications((prev) => [
          {
            id: uid("n"),
            mesaNum: 3,
            message: "Entrante listo",
            type: "listo",
            createdAt: Date.now(),
          },
          ...prev,
        ]);
      }, 5000);
      return () => window.clearTimeout(id);
    }
    return;
  }, [screen, employee, notifications.length]);

  /* ---------- Bell ---------- */
  function handleBell() {
    if (notifications.length === 0) {
      toast({ title: "Sin avisos", description: "Todo en orden.", duration: 1200 });
      return;
    }
    setScreen("comanda");
  }

  /* ---------- Settings ---------- */
  function toggleSetting(k: "sound" | "notifications" | "darkTheme") {
    setSettings((prev) => {
      const next = { ...prev, [k]: !prev[k] };
      if (k === "sound") setSoundOn(next.sound);
      return next;
    });
    toast({
      title: "Preferencia actualizada",
      duration: 1000,
    });
  }

  /* ---------- Fichar salida ---------- */
  function ficharSalida() {
    setFichajeMode("salida");
    setFichajeDialogOpen(true);
  }

  /* ---------- Navigation ---------- */
  function navigate(s: Screen) {
    if (s === "carta" && !selectedMesa) {
      // Auto-select first occupied mesa
      const firstOccupied = mesas.find((m) => m.status === "ocupada");
      if (firstOccupied) {
        setSelectedMesaId(firstOccupied.id);
      }
    }
    setScreen(s);
  }

  const t = reduce
    ? { duration: 0 }
    : { duration: 0.22, ease: "easeOut" as const };

  const notifCount = notifications.length;

  return (
    <div className="min-h-screen bg-[#0A0F0E] py-4 md:py-8 px-3 md:px-6">
      <PhoneShell>
        <AnimatePresence mode="wait">
          {screen === "login" && (
            <LoginScreen
              key="login"
              pin={pin}
              fichajeMode={fichajeMode}
              recognizedEmployee={recognizedEmployee}
              onKey={handlePinKey}
              onBackspace={handleBackspace}
              onClearPin={handleClearPin}
              onSetFichajeMode={setFichajeMode}
              onConfirmFichaje={handleConfirmFichaje}
              onQrScan={() => setQrOpen(true)}
              onFaceId={() => setFaceIdOpen(true)}
              lastError={lastError}
              ficherando={ficherando}
            />
          )}

          {screen === "mesas" && employee && (
            <DashboardScreen
              key="mesas"
              employee={employee}
              now={now}
              shiftStartedAt={shiftStartedAt}
              mesas={mesas}
              notifCount={notifCount}
              soundOn={soundOn}
              onToggleSound={() => setSoundOn((v) => !v)}
              onBell={handleBell}
              onOpenMesa={openMesa}
              onMesaAction={mesaAction}
              onRefresh={refreshMesas}
              refreshing={refreshing}
            />
          )}

          {screen === "carta" && employee && (
            <CartaScreen
              key="carta"
              category={category}
              onCategory={setCategory}
              selectedMesa={selectedMesa}
              items={selectedMesa ? items.filter((i) => i.mesaId === selectedMesa.id) : items}
              onPickProduct={pickProduct}
              onOpenTicket={() => setTicketOpen(true)}
              onBack={() => setScreen("mesas")}
            />
          )}

          {screen === "comanda" && employee && (
            <ComandaScreen
              key="comanda"
              notifications={notifications}
              items={items}
              now={now}
              onAckNotification={ackNotification}
              onServe={serveItem}
              onBack={() => setScreen("mesas")}
            />
          )}

          {screen === "perfil" && employee && (
            <ProfileScreen
              key="perfil"
              employee={employee}
              shiftStartedAt={shiftStartedAt}
              now={now}
              onFicharSalida={ficharSalida}
              settings={settings}
              onToggleSetting={toggleSetting}
              onBack={() => setScreen("mesas")}
            />
          )}
        </AnimatePresence>

        {/* Bottom nav (hidden on login) */}
        {screen !== "login" && employee && (
          <BottomNav current={screen} onNavigate={navigate} notifCount={notifCount} />
        )}

        {/* Order ticket sheet */}
        <OrderTicketSheet
          open={ticketOpen}
          onClose={() => setTicketOpen(false)}
          items={selectedMesa ? items.filter((i) => i.mesaId === selectedMesa.id) : items}
          mesa={selectedMesa}
          onChangeQty={changeQty}
          onRemove={removeItem}
          onSetRonda={setRonda}
          onSend={sendOrder}
          onServe={serveItem}
        />

        {/* Modifier dialog */}
        <ModifierDialog
          open={modifierOpen}
          product={pendingProduct}
          onClose={() => {
            setModifierOpen(false);
            setPendingProduct(null);
          }}
          onConfirm={(selected, note) =>
            pendingProduct && addItem(pendingProduct, selected, note)
          }
        />

        {/* QR scan dialog */}
        <QrScanDialog
          open={qrOpen}
          onClose={() => setQrOpen(false)}
          onScan={handleQrScan}
        />

        {/* Face ID dialog */}
        <FaceIdDialog
          open={faceIdOpen}
          onClose={() => setFaceIdOpen(false)}
          onSuccess={handleFaceIdSuccess}
        />

        {/* Fichaje confirmation */}
        <FichajeConfirmDialog
          open={fichajeDialogOpen}
          mode={fichajeMode}
          employee={recognizedEmployee ?? employee}
          onClose={() => setFichajeDialogOpen(false)}
          onConfirm={executeFichaje}
        />
      </PhoneShell>
    </div>
  );
}
