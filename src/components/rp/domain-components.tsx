"use client";

/**
 * RestoPanel v5.0 — Domain-specific components
 * Single-file library of 20 composable, accessible components for the
 * restaurant operations surface. Dark theme, emerald accent, WCAG 2.2 AA.
 *
 * Color tokens (CSS vars, defined in globals.css):
 *   --rp-emerald / --rp-emerald-soft / --rp-emerald-deep  (success / primary)
 *   --rp-yellow  / --rp-yellow-soft                       (warning / reserved)
 *   --rp-blue    / --rp-blue-soft                         (info / cleaning)
 *   --rp-red     / --rp-red-soft                          (error / occupied)
 *   --rp-violet  / --rp-violet-soft                       (billed / enterprise)
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Users,
  Clock,
  Phone,
  Crown,
  MapPin,
  Plus,
  X,
  Sparkles,
  Armchair,
  Timer,
  RotateCcw,
  Bell,
  ListOrdered,
  Euro,
  Star,
  ChefHat,
  Flame,
  Snowflake,
  Wine,
  Coffee,
  CreditCard,
  Wallet,
  QrCode,
  Smartphone,
  Printer,
  Settings,
  Check,
  AlertTriangle,
  Package,
  Truck,
  CalendarClock,
  Fingerprint,
  ScanFace,
  Pencil,
  Trash2,
  Download,
  UserCog,
  Move,
  ZoomIn,
  ZoomOut,
  Maximize,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  Banknote,
  Receipt,
  MessageSquare,
  Send,
  Lightbulb,
  HeartPulse,
  Zap,
  Plug,
  AlertCircle,
  Gift,
  ArrowRight,
  Eye,
  Lock,
  Navigation,
  SplitSquareHorizontal,
  ArrowLeftRight,
  TrendingUp,
  Hash,
  type LucideIcon,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/

type TableShape = "circle" | "square" | "rectangle";
type TableStatus =
  | "free"
  | "reserved"
  | "occupied"
  | "billed"
  | "cleaning"
  | "blocked";

export interface Table {
  id: string;
  number: string;
  shape: TableShape;
  x: number;
  y: number;
  width: number;
  height: number;
  capacity: number;
  status: TableStatus;
  zoneId: string;
  reservationName?: string;
  reservationTime?: string;
  server?: string;
}

export interface Zone {
  id: string;
  name: string;
  color?: string;
  bounds: { x: number; y: number; width: number; height: number };
}

export interface Reservation {
  id: string;
  time: string;
  customerName: string;
  partySize: number;
  tableName?: string;
  zone: string;
  status: "pending" | "confirmed" | "seated" | "cancelled" | "no-show";
  vip?: boolean;
  phone?: string;
  notes?: string;
}

export interface Guest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  tags: string[];
  visits: number;
  totalSpend: number;
  avgTicket: number;
  frequency: string;
  ltv: number;
  preferences: string[];
  allergies: string[];
  favoriteTable?: string;
  lastVisit?: string;
  loyaltyStamps: number;
  loyaltyMax: number;
}

export interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  modifiers?: string[];
  course?: "entrante" | "principal" | "postre";
  notes?: string;
}

export interface Order {
  id: string;
  table: string;
  zone: string;
  server: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount?: number;
  tip?: number;
  total: number;
  notes?: string;
  createdAt: string;
}

export interface KdsTicketItem {
  name: string;
  qty: number;
  modifiers?: string[];
  station: string;
}

export interface KdsTicket {
  id: string;
  order: string;
  table: string;
  items: KdsTicketItem[];
  status: "new" | "preparing" | "ready" | "bumped";
  createdAt: string;
  bumpedAt?: string;
  priority?: "vip" | "reservation";
  reservationTime?: string;
}

export interface Station {
  id: string;
  name: string;
  icon?: "cold" | "hot" | "grill" | "dessert" | "bar";
}

export interface Payment {
  id: string;
  amount: number;
  method: "efectivo" | "tarjeta" | "qr" | "bizum" | "wallet";
  status: "paid" | "pending" | "failed" | "refunded";
  reference: string;
  date: string;
  customer?: string;
  table?: string;
}

export interface CashMovement {
  id: string;
  type: "in" | "out";
  amount: number;
  concept: string;
  time: string;
}

export interface CashSession {
  id: string;
  openingBalance: number;
  currentBalance: number;
  openedAt: string;
  movements: CashMovement[];
  cashier: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  tags?: string[];
  allergens?: string[];
  popular?: boolean;
}

export interface StockItem {
  id: string;
  name: string;
  current: number;
  minimum: number;
  unit: string;
  supplier: string;
  lastRestock?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  pin: string;
  status: "active" | "break" | "off" | "sick" | "vacation";
  avatar?: string;
  shift?: { start: string; end: string };
  nfcEnabled?: boolean;
}

export interface Shift {
  id: string;
  employee: string;
  start: string;
  end: string;
  type: "morning" | "afternoon" | "split" | "full";
  break?: { start: string; end: string };
}

export interface LoyaltyInfo {
  customerName: string;
  stamps: number;
  max: number;
  reward: string;
  qrUrl?: string;
}

export interface Review {
  id: string;
  source: "Google" | "TripAdvisor" | "TheFork";
  rating: number;
  date: string;
  customer?: string;
  text: string;
  sentiment: "positive" | "neutral" | "negative";
  aiResponse?: string;
}

export interface Integration {
  id: string;
  name: string;
  category: string;
  logo?: string;
  status: "connected" | "error" | "pending" | "disabled";
  lastSync?: string;
}

/* =========================================================
 * Helpers
 * =======================================================*/

function euro(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function minutesSince(iso: string, now: number): number {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

const TABLE_STATUS_META: Record<
  TableStatus,
  { color: string; soft: string; label: string }
> = {
  free: { color: "var(--rp-emerald)", soft: "var(--rp-emerald-soft)", label: "Libre" },
  reserved: { color: "var(--rp-yellow)", soft: "var(--rp-yellow-soft)", label: "Reservada" },
  occupied: { color: "var(--rp-red)", soft: "var(--rp-red-soft)", label: "Ocupada" },
  billed: { color: "var(--rp-violet)", soft: "var(--rp-violet-soft)", label: "Cuenta pedida" },
  cleaning: { color: "var(--rp-blue)", soft: "var(--rp-blue-soft)", label: "Limpieza" },
  blocked: { color: "#6B7280", soft: "#9CA3AF", label: "Bloqueada" },
};

type Tone = "emerald" | "yellow" | "red" | "violet" | "blue" | "gray";

const TONE_BADGE: Record<Tone, string> = {
  emerald:
    "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]",
  yellow:
    "border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow-soft)]",
  red: "border-[var(--rp-red)]/40 bg-[var(--rp-red)]/10 text-[var(--rp-red-soft)]",
  violet:
    "border-[var(--rp-violet)]/40 bg-[var(--rp-violet)]/10 text-[var(--rp-violet-soft)]",
  blue: "border-[var(--rp-blue)]/40 bg-[var(--rp-blue)]/10 text-[var(--rp-blue-soft)]",
  gray: "border-foreground/20 bg-foreground/5 text-muted-foreground",
};

const TONE_BORDER: Record<Tone, string> = {
  emerald: "var(--rp-emerald)",
  yellow: "var(--rp-yellow)",
  red: "var(--rp-red)",
  violet: "var(--rp-violet)",
  blue: "var(--rp-blue)",
  gray: "rgba(156,163,175,0.6)",
};

function ToneBadge({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 font-medium", TONE_BADGE[tone], className)}
    >
      {children}
    </Badge>
  );
}

/** Re-renders the host component on a fixed interval so that "time ago"
 * displays stay fresh. Returns the current epoch ms. */
function useTick(intervalMs = 1000): number {
  const [now, setNow] = React.useState<number>(() => Date.now());
  React.useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

/* =========================================================
 * 1. TableMap — Visual floor plan
 * =======================================================*/

export function TableMap({
  tables: tablesProp,
  zones,
  onTableClick,
  onTableDrag,
  className,
  height = 480,
}: {
  tables: Table[];
  zones: Zone[];
  onTableClick?: (table: Table) => void;
  onTableDrag?: (table: Table) => void;
  className?: string;
  height?: number;
}) {
  const [tables, setTables] = React.useState<Table[]>(tablesProp);
  React.useEffect(() => setTables(tablesProp), [tablesProp]);

  const [zoom, setZoom] = React.useState(1);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [dragId, setDragId] = React.useState<string | null>(null);
  const dragOffset = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  // Compute viewBox bounds from zones + tables (fallback to default).
  const vb = React.useMemo(() => {
    const all = [
      ...zones.map((z) => z.bounds),
      ...tables.map((t) => ({ x: t.x, y: t.y, width: t.width, height: t.height })),
    ];
    if (all.length === 0) return { x: 0, y: 0, width: 800, height: 500 };
    const minX = Math.min(...all.map((b) => b.x)) - 40;
    const minY = Math.min(...all.map((b) => b.y)) - 40;
    const maxX = Math.max(...all.map((b) => b.x + b.width)) + 40;
    const maxY = Math.max(...all.map((b) => b.y + b.height)) + 40;
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }, [tables, zones]);

  function svgCoords(clientX: number, clientY: number): { x: number; y: number } {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const out = pt.matrixTransform(ctm.inverse());
    return { x: out.x, y: out.y };
  }

  function startDrag(e: React.MouseEvent, table: Table) {
    if (table.status === "blocked") return;
    e.stopPropagation();
    const p = svgCoords(e.clientX, e.clientY);
    dragOffset.current = { x: p.x - table.x, y: p.y - table.y };
    setSelectedId(table.id);
    setDragId(table.id);
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragId) return;
    const p = svgCoords(e.clientX, e.clientY);
    const nx = Math.max(vb.x, Math.min(vb.x + vb.width, p.x - dragOffset.current.x));
    const ny = Math.max(vb.y, Math.min(vb.y + vb.height, p.y - dragOffset.current.y));
    setTables((prev) =>
      prev.map((t) => (t.id === dragId ? { ...t, x: nx, y: ny } : t)),
    );
  }

  function handleMouseUp() {
    if (!dragId) return;
    const t = tables.find((x) => x.id === dragId);
    if (t && onTableDrag) onTableDrag(t);
    setDragId(null);
  }

  function handleClick(table: Table) {
    setSelectedId(table.id);
    if (onTableClick) onTableClick(table);
  }

  function handleKeyDown(e: React.KeyboardEvent, table: Table) {
    const step = e.shiftKey ? 20 : 4;
    let nx = table.x;
    let ny = table.y;
    if (e.key === "ArrowLeft") nx -= step;
    else if (e.key === "ArrowRight") nx += step;
    else if (e.key === "ArrowUp") ny -= step;
    else if (e.key === "ArrowDown") ny += step;
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick(table);
      return;
    } else {
      return;
    }
    e.preventDefault();
    setTables((prev) =>
      prev.map((t) => (t.id === table.id ? { ...t, x: nx, y: ny } : t)),
    );
  }

  function handleWheel(e: React.WheelEvent) {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setZoom((z) => Math.max(0.5, Math.min(2, z - e.deltaY * 0.002)));
  }

  function zoomIn() {
    setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)));
  }
  function zoomOut() {
    setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)));
  }
  function zoomReset() {
    setZoom(1);
  }

  return (
    <Card
      className={cn(
        "rp-glass overflow-hidden border-border/50 p-0",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
          <Armchair className="size-3.5 text-[var(--rp-emerald-soft)]" />
          Plano de sala
          <span className="text-foreground/40">·</span>
          <span className="text-foreground/70">{tables.length} mesas</span>
        </div>
        <div className="flex items-center gap-1" role="group" aria-label="Controles de zoom">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={zoomOut}
            disabled={zoom <= 0.5}
            aria-label="Alejar"
          >
            <ZoomOut className="size-3.5" />
          </Button>
          <span className="w-12 text-center text-[11px] font-mono tabular-nums text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={zoomIn}
            disabled={zoom >= 2}
            aria-label="Acercar"
          >
            <ZoomIn className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={zoomReset}
            aria-label="Restablecer zoom"
          >
            <Maximize className="size-3.5" />
          </Button>
        </div>
      </div>

      <div
        className="relative rp-grid-bg"
        style={{ height }}
        role="application"
        aria-label="Mapa interactivo de mesas. Use las flechas para mover una mesa seleccionada, Enter para abrir su panel."
      >
        {tables.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <Armchair className="size-8 opacity-40" />
            <p className="text-sm">No hay mesas en este plano</p>
          </div>
        ) : (
          <svg
            ref={svgRef}
            viewBox={`${vb.x} ${vb.y} ${vb.width} ${vb.height}`}
            className={cn(
              "h-full w-full touch-none select-none",
              dragId ? "cursor-grabbing" : "cursor-default",
            )}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
            onClick={() => setSelectedId(null)}
          >
            <defs>
              {Object.entries(TABLE_STATUS_META).map(([key, meta]) => (
                <filter
                  key={key}
                  id={`glow-${key}`}
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feFlood floodColor={meta.color} floodOpacity="0.5" />
                  <feComposite in2="blur" operator="in" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
            </defs>

            {/* Zone backgrounds */}
            {zones.map((z) => (
              <g key={z.id} aria-label={`Zona ${z.name}`}>
                <rect
                  x={z.bounds.x}
                  y={z.bounds.y}
                  width={z.bounds.width}
                  height={z.bounds.height}
                  rx={12}
                  fill="rgba(255,255,255,0.015)"
                  stroke={z.color ?? "rgba(255,255,255,0.08)"}
                  strokeDasharray="6 6"
                  strokeWidth={1}
                />
                <text
                  x={z.bounds.x + 12}
                  y={z.bounds.y + 22}
                  fill="rgba(255,255,255,0.35)"
                  fontSize={12}
                  fontFamily="var(--font-mono)"
                  className="uppercase tracking-wider"
                >
                  {z.name}
                </text>
              </g>
            ))}

            {/* Tables */}
            {tables.map((t) => {
              const meta = TABLE_STATUS_META[t.status];
              const isSelected = selectedId === t.id;
              const isDragging = dragId === t.id;
              const fill = `${meta.color}26`; // 15% alpha
              const stroke = meta.color;
              const filter = isSelected || isDragging ? `url(#glow-${t.status})` : undefined;
              const commonProps = {
                fill,
                stroke,
                strokeWidth: isSelected ? 3 : 2,
                filter,
                className: cn(
                  "cursor-grab transition-[filter] outline-none active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-[var(--rp-emerald-soft)] focus-visible:outline-offset-2",
                  isDragging && "opacity-90",
                ),
                tabIndex: 0,
                role: "button",
                "aria-label": `Mesa ${t.number}, ${meta.label}, capacidad ${t.capacity} personas${t.reservationName ? `, reservada por ${t.reservationName}` : ""}`,
                onMouseDown: (e: React.MouseEvent) => startDrag(e, t),
                onClick: (e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleClick(t);
                },
                onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, t),
                onFocus: () => setSelectedId(t.id),
              };
              return (
                <g key={t.id} transform={`translate(${t.x} ${t.y})`}>
                  {t.shape === "circle" ? (
                    <circle cx={t.width / 2} cy={t.height / 2} r={t.width / 2} {...commonProps} />
                  ) : t.shape === "square" ? (
                    <rect width={t.width} height={t.height} rx={8} {...commonProps} />
                  ) : (
                    <rect width={t.width} height={t.height} rx={6} {...commonProps} />
                  )}
                  <text
                    x={t.width / 2}
                    y={t.height / 2 - 4}
                    textAnchor="middle"
                    fill={meta.soft}
                    fontSize={16}
                    fontFamily="var(--font-mono)"
                    fontWeight={700}
                    pointerEvents="none"
                  >
                    {t.number}
                  </text>
                  <text
                    x={t.width / 2}
                    y={t.height / 2 + 14}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.6)"
                    fontSize={10}
                    fontFamily="var(--font-mono)"
                    pointerEvents="none"
                  >
                    {t.capacity}p
                  </text>
                  {t.reservationName && (
                    <text
                      x={t.width / 2}
                      y={t.height + 16}
                      textAnchor="middle"
                      fill={meta.soft}
                      fontSize={10}
                      fontFamily="var(--font-sans)"
                      pointerEvents="none"
                    >
                      {t.reservationTime ? `${t.reservationTime} ` : ""}
                      {t.reservationName.length > 12
                        ? t.reservationName.slice(0, 11) + "…"
                        : t.reservationName}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border/50 px-4 py-2.5">
        {Object.entries(TABLE_STATUS_META).map(([key, meta]) => (
          <span key={key} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span
              className="inline-block size-2 rounded-sm"
              style={{ backgroundColor: meta.color }}
              aria-hidden
            />
            {meta.label}
          </span>
        ))}
      </div>
    </Card>
  );
}

/* =========================================================
 * 2. ReservationCard — Compact reservation display
 * =======================================================*/

const RESERVATION_TONE: Record<Reservation["status"], Tone> = {
  pending: "yellow",
  confirmed: "emerald",
  seated: "blue",
  cancelled: "gray",
  "no-show": "red",
};

const RESERVATION_LABEL: Record<Reservation["status"], string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  seated: "Sentado",
  cancelled: "Cancelada",
  "no-show": "No show",
};

export function ReservationCard({
  reservation,
  variant = "compact",
  onSeat,
  onConfirm,
  onCancel,
  onNoShow,
  onMove,
  className,
}: {
  reservation: Reservation;
  variant?: "compact" | "expanded";
  onSeat?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  onNoShow?: () => void;
  onMove?: () => void;
  className?: string;
}) {
  const tone = RESERVATION_TONE[reservation.status];
  const expanded = variant === "expanded";

  return (
    <Card
      className={cn(
        "rp-glass gap-3 overflow-hidden border-border/50 p-0 transition-colors focus-within:border-[var(--rp-emerald)]/50 hover:border-border/80",
        className,
      )}
      style={{ borderLeft: `3px solid ${TONE_BORDER[tone]}` }}
    >
      <div className={cn("flex items-start gap-3", expanded ? "p-4" : "p-3")}>
        <div
          className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg border font-mono text-xs"
          style={{
            borderColor: `${TONE_BORDER[tone]}55`,
            backgroundColor: `${TONE_BORDER[tone]}14`,
            color: TONE_BORDER[tone],
          }}
        >
          <Clock className="size-3 opacity-70" />
          <span className="mt-0.5 font-bold">{reservation.time}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-medium text-foreground">
                  {reservation.customerName}
                </p>
                {reservation.vip && (
                  <Crown
                    className="size-3.5 shrink-0 text-[var(--rp-yellow)]"
                    aria-label="Cliente VIP"
                  />
                )}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3" />
                  {reservation.partySize}
                </span>
                {reservation.tableName && (
                  <span className="inline-flex items-center gap-1">
                    <Hash className="size-3" />
                    {reservation.tableName}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3" />
                  {reservation.zone}
                </span>
              </div>
            </div>
            <ToneBadge tone={tone}>{RESERVATION_LABEL[reservation.status]}</ToneBadge>
          </div>

          {expanded && (reservation.phone || reservation.notes) && (
            <div className="mt-2 space-y-1 border-t border-border/40 pt-2 text-xs text-muted-foreground">
              {reservation.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="size-3" />
                  {reservation.phone}
                </div>
              )}
              {reservation.notes && <p className="italic text-foreground/70">“{reservation.notes}”</p>}
            </div>
          )}
        </div>
      </div>

      {expanded && reservation.status !== "seated" && reservation.status !== "cancelled" && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border/50 bg-foreground/[0.02] px-3 py-2">
          {reservation.status === "pending" && (
            <Button size="sm" variant="default" className="h-7 gap-1 text-xs" onClick={onConfirm} disabled={!onConfirm}>
              <Check className="size-3" /> Confirmar
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 text-xs"
            onClick={onSeat}
            disabled={!onSeat}
          >
            <Armchair className="size-3" /> Sentar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1 text-xs"
            onClick={onMove}
            disabled={!onMove}
          >
            <Move className="size-3" /> Mover
          </Button>
          <div className="ml-auto flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1 text-xs text-[var(--rp-yellow-soft)] hover:text-[var(--rp-yellow)]"
              onClick={onNoShow}
              disabled={!onNoShow}
            >
              <XCircle className="size-3" /> No-show
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1 text-xs text-[var(--rp-red-soft)] hover:text-[var(--rp-red)]"
              onClick={onCancel}
              disabled={!onCancel}
            >
              <X className="size-3" /> Cancelar
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

/* =========================================================
 * 3. GuestProfileCard — CRM customer card
 * =======================================================*/

export function GuestProfileCard({
  guest,
  onNewReservation,
  onEdit,
  onExport,
  onDelete,
  className,
}: {
  guest: Guest;
  onNewReservation?: () => void;
  onEdit?: () => void;
  onExport?: () => void;
  onDelete?: () => void;
  className?: string;
}) {
  return (
    <Card className={cn("rp-glass border-border/50", className)}>
      <CardHeader className="gap-3">
        <div className="flex items-start gap-3">
          <Avatar className="size-12 border border-border/60">
            {guest.avatar ? <AvatarImage src={guest.avatar} alt="" /> : null}
            <AvatarFallback className="bg-[var(--rp-emerald)]/15 text-[var(--rp-emerald-soft)]">
              {initials(guest.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base">{guest.name}</CardTitle>
            {guest.email && (
              <CardDescription className="truncate">{guest.email}</CardDescription>
            )}
            {guest.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {guest.tags.map((tag) => {
                  const tone: Tone =
                    tag === "VIP" ? "yellow" :
                    tag === "cumpleaños" || tag === "birthday" ? "violet" :
                    tag === "riesgo" || tag === "risk" ? "red" : "blue";
                  return (
                    <ToneBadge key={tag} tone={tone} className="text-[10px]">
                      {tag}
                    </ToneBadge>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Kpi label="Visitas" value={String(guest.visits)} icon={Users} />
          <Kpi label="Gasto total" value={euro(guest.totalSpend)} icon={Euro} />
          <Kpi label="Ticket medio" value={euro(guest.avgTicket)} icon={Receipt} />
          <Kpi label="Frecuencia" value={guest.frequency} icon={CalendarClock} />
          <Kpi label="LTV" value={euro(guest.ltv)} icon={TrendingUp} />
          <Kpi
            label="Mesa favorita"
            value={guest.favoriteTable ?? "—"}
            icon={Armchair}
          />
        </div>

        {/* Preferences & allergies */}
        <div className="space-y-2">
          {guest.preferences.length > 0 && (
            <Detail label="Preferencias" items={guest.preferences} tone="emerald" />
          )}
          {guest.allergies.length > 0 && (
            <Detail label="Alergias" items={guest.allergies} tone="red" />
          )}
          {guest.lastVisit && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Última visita</span>
              <span className="text-foreground/80">
                {new Date(guest.lastVisit).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
        </div>

        {/* Loyalty stamps */}
        {guest.loyaltyMax > 0 && (
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-mono uppercase tracking-wider text-muted-foreground">
                Fidelización
              </span>
              <span className="tabular-nums text-[var(--rp-emerald-soft)]">
                {guest.loyaltyStamps}/{guest.loyaltyMax}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: guest.loyaltyMax }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-md border transition-colors",
                    i < guest.loyaltyStamps
                      ? "border-[var(--rp-emerald)]/50 bg-[var(--rp-emerald)]/15 text-[var(--rp-emerald-soft)]"
                      : "border-border/50 bg-foreground/[0.02] text-muted-foreground/40",
                  )}
                >
                  <Star className="size-3.5" fill={i < guest.loyaltyStamps ? "currentColor" : "none"} />
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap items-center gap-1.5 border-t border-border/40 pt-3">
        <Button size="sm" className="h-8 gap-1.5" onClick={onNewReservation} disabled={!onNewReservation}>
          <Plus className="size-3.5" /> Reserva
        </Button>
        <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={onEdit} disabled={!onEdit}>
          <Pencil className="size-3.5" /> Editar
        </Button>
        <Button size="sm" variant="ghost" className="h-8 gap-1.5" onClick={onExport} disabled={!onExport}>
          <Download className="size-3.5" /> Exportar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto h-8 gap-1.5 text-[var(--rp-red-soft)] hover:text-[var(--rp-red)]"
          onClick={onDelete}
          disabled={!onDelete}
          aria-label="Eliminar (RGPD)"
        >
          <Trash2 className="size-3.5" /> Eliminar
        </Button>
      </CardFooter>
    </Card>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-foreground/[0.02] p-2.5">
      <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Detail({
  label,
  items,
  tone,
}: {
  label: string;
  items: string[];
  tone: Tone;
}) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {items.map((it) => (
          <ToneBadge key={it} tone={tone} className="text-[10px]">
            {it}
          </ToneBadge>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
 * 4. OrderTicket — TPV order display
 * =======================================================*/

const COURSE_META: Record<NonNullable<OrderItem["course"]>, { label: string; tone: Tone; icon: LucideIcon }> = {
  entrante: { label: "Entrantes", tone: "blue", icon: Snowflake },
  principal: { label: "Principales", tone: "emerald", icon: Flame },
  postre: { label: "Postres", tone: "violet", icon: Coffee },
};

export function OrderTicket({
  order,
  onSendKitchen,
  onSplit,
  onTransfer,
  onPay,
  onPrint,
  className,
}: {
  order: Order;
  onSendKitchen?: () => void;
  onSplit?: () => void;
  onTransfer?: () => void;
  onPay?: () => void;
  onPrint?: () => void;
  className?: string;
}) {
  const itemsByCourse = React.useMemo(() => {
    const map: Record<string, OrderItem[]> = { entrante: [], principal: [], postre: [] };
    for (const it of order.items) {
      const key = it.course ?? "principal";
      if (!map[key]) map[key] = [];
      map[key].push(it);
    }
    return map;
  }, [order.items]);

  const uncoursed = order.items.filter((i) => !i.course);

  return (
    <Card className={cn("rp-glass border-border/50", className)}>
      <CardHeader className="gap-2 border-b border-border/40 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Hash className="size-4 text-[var(--rp-emerald-soft)]" />
              {order.table}
              <span className="text-xs font-normal text-muted-foreground">· {order.zone}</span>
            </CardTitle>
            <CardDescription className="mt-0.5 flex items-center gap-2">
              <Users className="size-3" /> {order.server}
              <span>·</span>
              <Clock className="size-3" />
              {new Date(order.createdAt).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </CardDescription>
          </div>
          <Badge variant="outline" className="gap-1 border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]">
            <ListOrdered className="size-3" />
            {order.items.reduce((s, i) => s + i.qty, 0)} items
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Items grouped by course */}
        <div className="space-y-3">
          {(Object.keys(COURSE_META) as Array<keyof typeof COURSE_META>).map((course) => {
            const items = itemsByCourse[course] ?? [];
            if (items.length === 0) return null;
            const meta = COURSE_META[course];
            return (
              <div key={course}>
                <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  <meta.icon className="size-3" style={{ color: `var(--rp-${meta.tone === "emerald" ? "emerald" : meta.tone === "blue" ? "blue" : "violet"})` }} />
                  {meta.label}
                </div>
                <ul className="space-y-1">
                  {items.map((item) => (
                    <OrderLine key={item.id} item={item} />
                  ))}
                </ul>
              </div>
            );
          })}
          {uncoursed.length > 0 && (
            <ul className="space-y-1 border-t border-border/30 pt-2">
              {uncoursed.map((item) => (
                <OrderLine key={item.id} item={item} />
              ))}
            </ul>
          )}
        </div>

        {order.notes && (
          <div className="rounded-md border border-[var(--rp-yellow)]/30 bg-[var(--rp-yellow)]/5 p-2 text-xs italic text-foreground/80">
            {order.notes}
          </div>
        )}

        <Separator />

        {/* Totals */}
        <div className="space-y-1 text-sm">
          <TotalRow label="Subtotal" value={euro(order.subtotal)} />
          <TotalRow label="IVA" value={euro(order.tax)} muted />
          {order.discount ? (
            <TotalRow
              label="Descuento"
              value={`− ${euro(order.discount)}`}
              tone="emerald"
            />
          ) : null}
          {order.tip ? (
            <TotalRow label="Propina" value={euro(order.tip)} muted />
          ) : null}
          <div className="flex items-center justify-between border-t border-border/40 pt-2 text-base font-semibold">
            <span>Total</span>
            <span className="tabular-nums text-[var(--rp-emerald-soft)]">{euro(order.total)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap items-center gap-1.5 border-t border-border/40 pt-3">
        <Button size="sm" className="gap-1.5" onClick={onSendKitchen} disabled={!onSendKitchen}>
          <Send className="size-3.5" /> Cocina
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={onSplit} disabled={!onSplit}>
          <SplitSquareHorizontal className="size-3.5" /> Dividir
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={onTransfer} disabled={!onTransfer}>
          <ArrowLeftRight className="size-3.5" /> Transferir
        </Button>
        <Button size="sm" variant="ghost" className="gap-1.5" onClick={onPrint} disabled={!onPrint}>
          <Printer className="size-3.5" />
        </Button>
        <Button
          size="sm"
          variant="default"
          className="ml-auto gap-1.5 bg-[var(--rp-emerald)] text-[var(--rp-emerald-deep)] hover:bg-[var(--rp-emerald-soft)]"
          onClick={onPay}
          disabled={!onPay}
        >
          <Euro className="size-3.5" /> Cobrar
        </Button>
      </CardFooter>
    </Card>
  );
}

function OrderLine({ item }: { item: OrderItem }) {
  return (
    <li className="flex items-start justify-between gap-2 text-sm">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[var(--rp-emerald-soft)]">{item.qty}×</span>
          <span className="truncate text-foreground/90">{item.name}</span>
        </div>
        {item.modifiers && item.modifiers.length > 0 && (
          <ul className="ml-5 mt-0.5 text-[11px] text-muted-foreground">
            {item.modifiers.map((m, i) => (
              <li key={i}>+ {m}</li>
            ))}
          </ul>
        )}
        {item.notes && (
          <p className="ml-5 mt-0.5 text-[11px] italic text-[var(--rp-yellow-soft)]">
            {item.notes}
          </p>
        )}
      </div>
      <span className="shrink-0 tabular-nums text-muted-foreground">
        {euro(item.price * item.qty)}
      </span>
    </li>
  );
}

function TotalRow({
  label,
  value,
  muted,
  tone,
}: {
  label: string;
  value: string;
  muted?: boolean;
  tone?: Tone;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn("text-muted-foreground", muted && "text-xs")}>{label}</span>
      <span
        className={cn(
          "tabular-nums",
          tone === "emerald" && "text-[var(--rp-emerald-soft)]",
          muted && "text-xs text-muted-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

/* =========================================================
 * 5. KdsBoard — Kitchen Display System board
 * =======================================================*/

const STATION_ICON: Record<NonNullable<Station["icon"]>, LucideIcon> = {
  cold: Snowflake,
  hot: Flame,
  grill: Flame,
  dessert: Coffee,
  bar: Wine,
};

export function KdsBoard({
  tickets,
  stations,
  onBump,
  onRecall,
  className,
}: {
  tickets: KdsTicket[];
  stations: Station[];
  onBump?: (ticket: KdsTicket) => void;
  onRecall?: (ticket: KdsTicket) => void;
  className?: string;
}) {
  const now = useTick(30_000);

  if (stations.length === 0) {
    return (
      <Card className={cn("rp-glass border-border/50", className)}>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
          <ChefHat className="size-8 opacity-40" />
          <p className="text-sm">No hay estaciones configuradas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
        className,
      )}
      role="region"
      aria-label="Tablero de cocina"
    >
      {stations.map((station) => {
        const Icon = (station.icon ? STATION_ICON[station.icon] : null) ?? ChefHat;
        const stationTickets = tickets.filter(
          (t) =>
            t.status !== "bumped" &&
            t.items.some((it) => it.station === station.id),
        );
        return (
          <div
            key={station.id}
            className="flex flex-col rounded-xl border border-border/50 bg-foreground/[0.02]"
          >
            <div className="flex items-center justify-between border-b border-border/40 px-3 py-2">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-foreground/80">
                <Icon className="size-3.5 text-[var(--rp-emerald-soft)]" />
                {station.name}
              </div>
              <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                {stationTickets.length}
              </Badge>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto rp-scroll-thin p-2" style={{ maxHeight: 540 }}>
              {stationTickets.length === 0 ? (
                <div className="flex h-24 items-center justify-center text-[11px] text-muted-foreground/60">
                  Vacío
                </div>
              ) : (
                stationTickets.map((t) => (
                  <KdsTicketCard
                    key={t.id}
                    ticket={t}
                    stationId={station.id}
                    now={now}
                    onBump={onBump}
                    onRecall={onRecall}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KdsTicketCard({
  ticket,
  stationId,
  now,
  onBump,
  onRecall,
}: {
  ticket: KdsTicket;
  stationId: string;
  now: number;
  onBump?: (t: KdsTicket) => void;
  onRecall?: (t: KdsTicket) => void;
}) {
  const mins = minutesSince(ticket.createdAt, now);
  const tone: Tone = mins > 15 ? "red" : mins > 10 ? "yellow" : "emerald";
  const borderColor = TONE_BORDER[tone];
  const items = ticket.items.filter((i) => i.station === stationId);

  return (
    <div
      className="rounded-lg border bg-card/60 p-2.5 text-xs transition-colors hover:border-border"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="truncate">{ticket.table}</span>
            {ticket.priority === "vip" && (
              <Crown className="size-3 shrink-0 text-[var(--rp-yellow)]" aria-label="VIP" />
            )}
            {ticket.priority === "reservation" && ticket.reservationTime && (
              <span className="shrink-0 rounded-sm bg-[var(--rp-violet)]/15 px-1 font-mono text-[10px] text-[var(--rp-violet-soft)]">
                {ticket.reservationTime}
              </span>
            )}
          </div>
          <div className="text-[10px] text-muted-foreground">{ticket.order}</div>
        </div>
        <div
          className="flex shrink-0 items-center gap-1 font-mono text-[11px] tabular-nums"
          style={{ color: borderColor }}
        >
          <Timer className="size-3" />
          {mins}m
        </div>
      </div>
      <ul className="mt-2 space-y-0.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-1.5">
            <span className="font-mono text-[var(--rp-emerald-soft)]">{it.qty}×</span>
            <div className="min-w-0 flex-1">
              <span className="text-foreground/90">{it.name}</span>
              {it.modifiers && it.modifiers.length > 0 && (
                <ul className="ml-3 text-[10px] text-muted-foreground">
                  {it.modifiers.map((m, j) => (
                    <li key={j}>· {m}</li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-center gap-1 border-t border-border/30 pt-1.5">
        {ticket.status === "ready" ? (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 gap-1 px-2 text-[10px] text-[var(--rp-blue-soft)] hover:text-[var(--rp-blue)]"
            onClick={() => onRecall?.(ticket)}
            disabled={!onRecall}
          >
            <RotateCcw className="size-3" /> Recall
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 gap-1 px-2 text-[10px] text-[var(--rp-emerald-soft)] hover:text-[var(--rp-emerald)]"
            onClick={() => onBump?.(ticket)}
            disabled={!onBump}
          >
            <Check className="size-3" /> Bump
          </Button>
        )}
      </div>
    </div>
  );
}

/* =========================================================
 * 6. PaymentSummary — Payment display
 * =======================================================*/

const PAYMENT_METHOD_META: Record<
  Payment["method"],
  { label: string; icon: LucideIcon; tone: Tone }
> = {
  efectivo: { label: "Efectivo", icon: Banknote, tone: "emerald" },
  tarjeta: { label: "Tarjeta", icon: CreditCard, tone: "blue" },
  qr: { label: "QR", icon: QrCode, tone: "violet" },
  bizum: { label: "Bizum", icon: Smartphone, tone: "yellow" },
  wallet: { label: "Wallet", icon: Wallet, tone: "gray" },
};

const PAYMENT_STATUS_META: Record<
  Payment["status"],
  { label: string; tone: Tone; icon: LucideIcon }
> = {
  paid: { label: "Pagado", tone: "emerald", icon: CheckCircle2 },
  pending: { label: "Pendiente", tone: "yellow", icon: Clock },
  failed: { label: "Fallido", tone: "red", icon: XCircle },
  refunded: { label: "Reembolsado", tone: "violet", icon: RotateCcw },
};

export function PaymentSummary({
  payment,
  onPrint,
  onRefund,
  onViewDetail,
  className,
}: {
  payment: Payment;
  onPrint?: () => void;
  onRefund?: () => void;
  onViewDetail?: () => void;
  className?: string;
}) {
  const method = PAYMENT_METHOD_META[payment.method];
  const status = PAYMENT_STATUS_META[payment.status];

  return (
    <Card className={cn("rp-glass border-border/50", className)}>
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className="flex size-10 items-center justify-center rounded-lg border"
              style={{
                borderColor: `${TONE_BORDER[method.tone]}55`,
                backgroundColor: `${TONE_BORDER[method.tone]}14`,
                color: TONE_BORDER[method.tone],
              }}
            >
              <method.icon className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base">{method.label}</CardTitle>
              <CardDescription className="text-xs">
                {new Date(payment.date).toLocaleString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </CardDescription>
            </div>
          </div>
          <ToneBadge tone={status.tone} className="gap-1">
            <status.icon className="size-3" />
            {status.label}
          </ToneBadge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="text-2xl font-semibold tabular-nums">
          {euro(payment.amount)}
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
          <div className="text-muted-foreground">Referencia</div>
          <div className="truncate text-right font-mono text-foreground/80">
            {payment.reference}
          </div>
          {payment.customer && (
            <>
              <div className="text-muted-foreground">Cliente</div>
              <div className="truncate text-right text-foreground/80">{payment.customer}</div>
            </>
          )}
          {payment.table && (
            <>
              <div className="text-muted-foreground">Mesa</div>
              <div className="truncate text-right text-foreground/80">{payment.table}</div>
            </>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap items-center gap-1.5 border-t border-border/40 pt-3">
        <Button size="sm" variant="ghost" className="gap-1.5" onClick={onViewDetail} disabled={!onViewDetail}>
          <Eye className="size-3.5" /> Ver detalle
        </Button>
        <Button size="sm" variant="ghost" className="gap-1.5" onClick={onPrint} disabled={!onPrint}>
          <Printer className="size-3.5" /> Imprimir
        </Button>
        {payment.status === "paid" && (
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto gap-1.5 text-[var(--rp-red-soft)] hover:text-[var(--rp-red)]"
            onClick={onRefund}
            disabled={!onRefund}
          >
            <RotateCcw className="size-3.5" /> Reembolsar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

/* =========================================================
 * 7. CashSessionCard — Cash drawer session
 * =======================================================*/

export function CashSessionCard({
  session,
  onClose,
  className,
}: {
  session: CashSession;
  onClose?: (finalCount: number) => void;
  className?: string;
}) {
  const now = useTick(1000);
  const [blindCount, setBlindCount] = React.useState<string>("");
  const [showClose, setShowClose] = React.useState(false);
  const elapsed = now - new Date(session.openedAt).getTime();
  const expected = session.openingBalance + session.movements.reduce(
    (s, m) => s + (m.type === "in" ? m.amount : -m.amount),
    0,
  );
  const counted = Number(blindCount) || 0;
  const diff = counted - expected;

  return (
    <Card className={cn("rp-glass border-border/50", className)}>
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Banknote className="size-4 text-[var(--rp-emerald-soft)]" />
              Cajón de caja
            </CardTitle>
            <CardDescription className="text-xs">
              Cajero: {session.cashier}
            </CardDescription>
          </div>
          <ToneBadge tone="emerald" className="gap-1">
            <Clock className="size-3" />
            {formatDuration(elapsed)}
          </ToneBadge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border/40 bg-foreground/[0.02] p-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Apertura
            </div>
            <div className="mt-1 text-base font-semibold tabular-nums">
              {euro(session.openingBalance)}
            </div>
          </div>
          <div className="rounded-lg border border-border/40 bg-foreground/[0.02] p-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Balance actual
            </div>
            <div className="mt-1 text-base font-semibold tabular-nums text-[var(--rp-emerald-soft)]">
              {euro(session.currentBalance)}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            <span>Movimientos</span>
            <span>{session.movements.length}</span>
          </div>
          <div className="max-h-40 space-y-1 overflow-y-auto rp-scroll-thin">
            {session.movements.length === 0 ? (
              <div className="rounded-md border border-dashed border-border/40 py-3 text-center text-[11px] text-muted-foreground/60">
                Sin movimientos
              </div>
            ) : (
              session.movements.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-border/30 bg-foreground/[0.02] px-2 py-1.5 text-xs"
                >
                  <div className="min-w-0">
                    <div className="truncate text-foreground/80">{m.concept}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(m.time).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 font-mono tabular-nums",
                      m.type === "in"
                        ? "text-[var(--rp-emerald-soft)]"
                        : "text-[var(--rp-red-soft)]",
                    )}
                  >
                    {m.type === "in" ? "+" : "−"}
                    {euro(m.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {showClose && (
          <div className="space-y-2 rounded-lg border border-[var(--rp-yellow)]/30 bg-[var(--rp-yellow)]/5 p-3">
            <div className="text-xs font-medium">Conteo a ciegas (blind count)</div>
            <div className="flex items-center gap-2">
              <Euro className="size-4 text-muted-foreground" />
              <input
                type="number"
                inputMode="decimal"
                value={blindCount}
                onChange={(e) => setBlindCount(e.target.value)}
                placeholder="0.00"
                aria-label="Conteo final en efectivo"
                className="h-9 flex-1 rounded-md border border-border/50 bg-background/60 px-3 text-sm tabular-nums outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              />
            </div>
            {counted > 0 && (
              <div className="text-xs">
                <span className="text-muted-foreground">Diferencia: </span>
                <span
                  className={cn(
                    "font-mono tabular-nums",
                    diff === 0
                      ? "text-[var(--rp-emerald-soft)]"
                      : diff > 0
                        ? "text-[var(--rp-yellow-soft)]"
                        : "text-[var(--rp-red-soft)]",
                  )}
                >
                  {diff > 0 ? "+" : ""}
                  {euro(diff)}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t border-border/40 pt-3">
        {!showClose ? (
          <Button
            variant="outline"
            className="ml-auto gap-1.5"
            onClick={() => setShowClose(true)}
            disabled={!onClose}
          >
            <Lock className="size-3.5" /> Cerrar caja
          </Button>
        ) : (
          <div className="flex w-full items-center gap-1.5">
            <Button
              variant="ghost"
              className="gap-1.5"
              onClick={() => {
                setShowClose(false);
                setBlindCount("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              className="ml-auto gap-1.5"
              onClick={() => onClose?.(counted)}
              disabled={counted <= 0}
            >
              <Check className="size-3.5" /> Confirmar cierre
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

/* =========================================================
 * 8. MenuItemCard — Product display
 * =======================================================*/

const ITEM_TAG_TONE: Record<string, Tone> = {
  new: "emerald",
  popular: "yellow",
  "high-margin": "violet",
  veggie: "emerald",
  vegan: "emerald",
  spicy: "red",
};

export function MenuItemCard({
  item,
  onAdd,
  className,
}: {
  item: MenuItem;
  onAdd?: (item: MenuItem) => void;
  className?: string;
}) {
  const [available, setAvailable] = React.useState(item.available);
  React.useEffect(() => setAvailable(item.available), [item.available]);

  return (
    <Card
      className={cn(
        "rp-glass overflow-hidden border-border/50 p-0 transition-opacity",
        !available && "opacity-60",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-foreground/[0.04]">
        {item.image ? (
          <img
            src={item.image}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground/30">
            <ChefHat className="size-10" />
          </div>
        )}
        {item.popular && (
          <Badge
            variant="outline"
            className="absolute left-2 top-2 gap-1 border-[var(--rp-yellow)]/50 bg-[var(--rp-yellow)]/15 text-[var(--rp-yellow-soft)]"
          >
            <Star className="size-3" fill="currentColor" /> Popular
          </Badge>
        )}
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full border border-border/40 bg-background/80 px-1.5 py-0.5 backdrop-blur">
          <span className="text-[10px] font-mono uppercase text-muted-foreground">86</span>
          <Switch
            checked={available}
            onCheckedChange={setAvailable}
            aria-label={`Disponibilidad de ${item.name}`}
            className="data-[state=checked]:bg-[var(--rp-emerald)]"
          />
        </div>
      </div>

      <CardContent className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="truncate text-sm font-medium">{item.name}</h4>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {item.category}
            </p>
          </div>
          <div className="shrink-0 text-sm font-semibold tabular-nums text-[var(--rp-emerald-soft)]">
            {euro(item.price)}
          </div>
        </div>

        {(item.tags?.length || item.allergens?.length) && (
          <div className="flex flex-wrap gap-1">
            {item.tags?.map((t) => (
              <ToneBadge key={t} tone={ITEM_TAG_TONE[t] ?? "gray"} className="text-[10px]">
                {t}
              </ToneBadge>
            ))}
            {item.allergens?.map((a) => (
              <ToneBadge key={a} tone="red" className="text-[10px]">
                <AlertTriangle className="size-2.5" />
                {a}
              </ToneBadge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t border-border/40 p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full gap-1.5"
          onClick={() => onAdd?.(item)}
          disabled={!onAdd || !available}
        >
          <Plus className="size-3.5" /> Añadir
        </Button>
      </CardFooter>
    </Card>
  );
}

/* =========================================================
 * 9. StockAlertCard — Low stock alert
 * =======================================================*/

export function StockAlertCard({
  stock,
  onRestock,
  onAdjust,
  onCreateOrder,
  className,
}: {
  stock: StockItem;
  onRestock?: () => void;
  onAdjust?: () => void;
  onCreateOrder?: () => void;
  className?: string;
}) {
  const severity: "critical" | "low" | "ok" =
    stock.current === 0
      ? "critical"
      : stock.current < stock.minimum
        ? "low"
        : "ok";
  const tone: Tone =
    severity === "critical" ? "red" : severity === "low" ? "yellow" : "emerald";
  const ratio = stock.minimum > 0 ? Math.min(1, stock.current / (stock.minimum * 2)) : 1;

  return (
    <Card
      className={cn(
        "rp-glass border-border/50 p-0",
        severity === "critical" && "border-[var(--rp-red)]/40",
        className,
      )}
    >
      <CardContent className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Package className="size-3.5 shrink-0 text-muted-foreground" />
              <h4 className="truncate text-sm font-medium">{stock.name}</h4>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Truck className="size-3" />
              {stock.supplier}
            </div>
          </div>
          <ToneBadge tone={tone}>
            {severity === "critical" ? "Crítico" : severity === "low" ? "Bajo" : "OK"}
          </ToneBadge>
        </div>

        <div>
          <div className="flex items-center justify-between text-[11px] tabular-nums">
            <span className="text-muted-foreground">
              Actual: <span className="font-semibold text-foreground">{stock.current} {stock.unit}</span>
            </span>
            <span className="text-muted-foreground">
              Mín: <span className="font-semibold text-foreground">{stock.minimum} {stock.unit}</span>
            </span>
          </div>
          <Progress
            value={ratio * 100}
            className={cn(
              "mt-1 h-1.5",
              severity === "critical"
                ? "[&>[data-slot=progress-indicator]]:bg-[var(--rp-red)]"
                : severity === "low"
                  ? "[&>[data-slot=progress-indicator]]:bg-[var(--rp-yellow)]"
                  : "[&>[data-slot=progress-indicator]]:bg-[var(--rp-emerald)]",
            )}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-1 border-t border-border/40 p-2">
        <Button size="sm" variant="default" className="h-7 gap-1 text-xs" onClick={onRestock} disabled={!onRestock}>
          <Truck className="size-3" /> Reponer
        </Button>
        <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={onAdjust} disabled={!onAdjust}>
          <Pencil className="size-3" /> Ajustar
        </Button>
        <Button size="sm" variant="ghost" className="ml-auto h-7 gap-1 text-xs" onClick={onCreateOrder} disabled={!onCreateOrder}>
          <Plus className="size-3" /> Pedido
        </Button>
      </CardFooter>
    </Card>
  );
}

/* =========================================================
 * 10. EmployeeCard — Staff member display
 * =======================================================*/

const EMPLOYEE_STATUS_TONE: Record<Employee["status"], Tone> = {
  active: "emerald",
  break: "yellow",
  off: "gray",
  sick: "red",
  vacation: "blue",
};

const EMPLOYEE_STATUS_LABEL: Record<Employee["status"], string> = {
  active: "Activo",
  break: "En pausa",
  off: "Fuera",
  sick: "Baja",
  vacation: "Vacaciones",
};

export function EmployeeCard({
  employee,
  onViewProfile,
  onAssignShift,
  onToggleNfc,
  className,
}: {
  employee: Employee;
  onViewProfile?: () => void;
  onAssignShift?: () => void;
  onToggleNfc?: (enabled: boolean) => void;
  className?: string;
}) {
  const [nfc, setNfc] = React.useState(employee.nfcEnabled ?? false);
  React.useEffect(() => setNfc(employee.nfcEnabled ?? false), [employee.nfcEnabled]);
  const tone = EMPLOYEE_STATUS_TONE[employee.status];
  const maskedPin = employee.pin.replace(/./g, "•").replace(/(.{1})/g, "$1 ").trim();

  return (
    <Card className={cn("rp-glass border-border/50", className)}>
      <CardHeader className="gap-2">
        <div className="flex items-start gap-3">
          <Avatar className="size-11 border border-border/60">
            {employee.avatar ? <AvatarImage src={employee.avatar} alt="" /> : null}
            <AvatarFallback className="bg-[var(--rp-blue)]/15 text-[var(--rp-blue-soft)]">
              {initials(employee.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-sm">{employee.name}</CardTitle>
            <CardDescription className="text-xs">{employee.role}</CardDescription>
            <div className="mt-1.5 flex items-center gap-1.5">
              <ToneBadge tone={tone} className="text-[10px]">
                <span
                  className="inline-block size-1.5 rounded-full"
                  style={{ backgroundColor: TONE_BORDER[tone] }}
                />
                {EMPLOYEE_STATUS_LABEL[employee.status]}
              </ToneBadge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md border border-border/40 bg-foreground/[0.02] p-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              PIN
            </div>
            <div className="mt-0.5 font-mono text-sm tracking-widest">{maskedPin}</div>
          </div>
          <div className="rounded-md border border-border/40 bg-foreground/[0.02] p-2">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              NFC
              <Switch
                checked={nfc}
                onCheckedChange={(v) => {
                  setNfc(v);
                  onToggleNfc?.(v);
                }}
                aria-label="Activar NFC"
                className="data-[state=checked]:bg-[var(--rp-emerald)]"
              />
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-xs">
              <Smartphone className={cn("size-3", nfc ? "text-[var(--rp-emerald-soft)]" : "text-muted-foreground/50")} />
              {nfc ? "Activado" : "Desactivado"}
            </div>
          </div>
        </div>

        {/* Mini QR placeholder */}
        <div className="flex items-center gap-3 rounded-md border border-border/40 bg-foreground/[0.02] p-2">
          <div className="grid size-12 shrink-0 grid-cols-5 gap-px overflow-hidden rounded bg-foreground/10 p-1" aria-hidden>
            {Array.from({ length: 25 }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "aspect-square rounded-[1px]",
                  (i * 7 + 3) % 3 === 0 ? "bg-foreground/80" : "bg-transparent",
                )}
              />
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <QrCode className="size-3" /> Identificador
            </div>
            <div className="truncate font-mono text-[11px] text-foreground/70">
              RP-{employee.id.toUpperCase().slice(0, 8)}
            </div>
          </div>
        </div>

        {employee.shift && (
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="size-3" /> Turno actual
            </span>
            <span className="font-mono tabular-nums text-foreground/80">
              {employee.shift.start} – {employee.shift.end}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center gap-1.5 border-t border-border/40 pt-3">
        <Button size="sm" variant="outline" className="gap-1.5" onClick={onViewProfile} disabled={!onViewProfile}>
          <UserCog className="size-3.5" /> Perfil
        </Button>
        <Button size="sm" variant="ghost" className="ml-auto gap-1.5" onClick={onAssignShift} disabled={!onAssignShift}>
          <CalendarClock className="size-3.5" /> Asignar turno
        </Button>
      </CardFooter>
    </Card>
  );
}

/* =========================================================
 * 11. ShiftCard — Schedule shift block
 * =======================================================*/

const SHIFT_META: Record<Shift["type"], { tone: Tone; label: string; icon: LucideIcon }> = {
  morning: { tone: "yellow", label: "Mañana", icon: Coffee },
  afternoon: { tone: "blue", label: "Tarde", icon: Clock },
  split: { tone: "violet", label: "Partido", icon: SplitSquareHorizontal },
  full: { tone: "emerald", label: "Completo", icon: Timer },
};

export function ShiftCard({
  shift,
  className,
}: {
  shift: Shift;
  className?: string;
}) {
  const meta = SHIFT_META[shift.type];
  const borderColor = TONE_BORDER[meta.tone];

  return (
    <div
      role="listitem"
      tabIndex={0}
      className={cn(
        "group relative flex items-center gap-2 rounded-md border bg-card/60 p-2 text-xs transition-colors hover:border-border focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
        className,
      )}
      style={{ borderLeft: `3px solid ${borderColor}` }}
      aria-label={`Turno de ${shift.employee}, ${meta.label}, ${shift.start} a ${shift.end}`}
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground/50 transition-colors hover:text-foreground active:cursor-grabbing"
        aria-label="Arrastrar para reprogramar"
      >
        <Move className="size-3.5" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate font-medium text-foreground">{shift.employee}</span>
          <meta.icon className="size-3 shrink-0" style={{ color: borderColor }} aria-hidden />
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="font-mono tabular-nums">{shift.start}–{shift.end}</span>
          <span>·</span>
          <span style={{ color: borderColor }}>{meta.label}</span>
        </div>
      </div>
      {shift.break && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex shrink-0 items-center gap-0.5 rounded-sm bg-[var(--rp-yellow)]/15 px-1 py-0.5 text-[10px] text-[var(--rp-yellow-soft)]">
              <Pause className="size-2.5" />
              {shift.break.start}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            Pausa: {shift.break.start} – {shift.break.end}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

/* =========================================================
 * 12. TimeClockPanel — Fichaje panel
 * =======================================================*/

export function TimeClockPanel({
  employee,
  onClockIn,
  onClockOut,
  className,
}: {
  employee: Employee;
  onClockIn?: (method: string, pin?: string) => void;
  onClockOut?: () => void;
  className?: string;
}) {
  const [method, setMethod] = React.useState<"pin" | "qr" | "faceid" | "fingerprint">("pin");
  const [pin, setPin] = React.useState("");
  const [geo, setGeo] = React.useState(false);
  const [todayHours] = React.useState<number>(6.5);
  const [breaks] = React.useState<number>(1);
  const isActive = employee.status === "active";

  function press(d: string) {
    setPin((p) => (p.length >= 4 ? p : p + d));
  }
  function backspace() {
    setPin((p) => p.slice(0, -1));
  }
  function clear() {
    setPin("");
  }
  function submit() {
    if (method === "pin") {
      if (pin.length < 4) return;
      onClockIn?.("pin", pin);
      setPin("");
    } else {
      onClockIn?.(method);
    }
  }

  // Auto-submit when PIN is complete
  React.useEffect(() => {
    if (method === "pin" && pin.length === 4 && onClockIn) {
      onClockIn("pin", pin);
      const id = window.setTimeout(() => setPin(""), 100);
      return () => window.clearTimeout(id);
    }
    return;
  }, [pin, method, onClockIn]);

  const METHOD_TABS: Array<{ id: typeof method; label: string; icon: LucideIcon }> = [
    { id: "pin", label: "PIN", icon: Lock },
    { id: "qr", label: "QR", icon: QrCode },
    { id: "faceid", label: "FaceID", icon: ScanFace },
    { id: "fingerprint", label: "Huella", icon: Fingerprint },
  ];

  return (
    <Card className={cn("rp-glass border-border/50", className)}>
      <CardHeader className="gap-2">
        <div className="flex items-center gap-3">
          <Avatar className="size-12 border border-border/60">
            {employee.avatar ? <AvatarImage src={employee.avatar} alt="" /> : null}
            <AvatarFallback className="bg-[var(--rp-emerald)]/15 text-[var(--rp-emerald-soft)]">
              {initials(employee.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base">{employee.name}</CardTitle>
            <CardDescription className="text-xs">{employee.role}</CardDescription>
          </div>
          <StatusDot status={isActive ? "online" : "offline"} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Today summary */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border/40 bg-foreground/[0.02] p-2.5">
            <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <Clock className="size-3" /> Horas hoy
            </div>
            <div className="mt-1 text-lg font-semibold tabular-nums">
              {todayHours.toFixed(1)}h
            </div>
          </div>
          <div className="rounded-lg border border-border/40 bg-foreground/[0.02] p-2.5">
            <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <Pause className="size-3" /> Pausas
            </div>
            <div className="mt-1 text-lg font-semibold tabular-nums">{breaks}</div>
          </div>
        </div>

        <Tabs value={method} onValueChange={(v) => setMethod(v as typeof method)}>
          <TabsList className="grid w-full grid-cols-4">
            {METHOD_TABS.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="gap-1 text-[11px]">
                <t.icon className="size-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="pin" className="mt-3 space-y-3">
            <div className="flex items-center justify-center gap-2" aria-live="polite">
              {Array.from({ length: 4 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "size-3 rounded-full border-2 transition-colors",
                    i < pin.length
                      ? "border-[var(--rp-emerald)] bg-[var(--rp-emerald)]"
                      : "border-border/60 bg-transparent",
                  )}
                />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                <Button
                  key={d}
                  variant="outline"
                  className="h-12 font-mono text-lg tabular-nums"
                  onClick={() => press(d)}
                  disabled={pin.length >= 4}
                >
                  {d}
                </Button>
              ))}
              <Button variant="ghost" className="h-12" onClick={clear} aria-label="Limpiar">
                <X className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="h-12 font-mono text-lg tabular-nums"
                onClick={() => press("0")}
                disabled={pin.length >= 4}
              >
                0
              </Button>
              <Button variant="ghost" className="h-12" onClick={backspace} aria-label="Borrar">
                <RotateCcw className="size-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="qr" className="mt-3">
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/50 p-6 text-center">
              <QrCode className="size-12 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">
                Escanea el código QR del terminal para fichar
              </p>
            </div>
          </TabsContent>

          <TabsContent value="faceid" className="mt-3">
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/50 p-6 text-center">
              <ScanFace className="size-12 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">
                Mira a la cámara para verificar tu identidad
              </p>
            </div>
          </TabsContent>

          <TabsContent value="fingerprint" className="mt-3">
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/50 p-6 text-center">
              <Fingerprint className="size-12 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">
                Coloca el dedo sobre el sensor biométrico
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Geolocation */}
        <label className="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-border/40 bg-foreground/[0.02] px-3 py-2 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Navigation className="size-3.5" />
            Verificar ubicación
          </span>
          <Switch
            checked={geo}
            onCheckedChange={setGeo}
            aria-label="Verificar geolocalización al fichar"
            className="data-[state=checked]:bg-[var(--rp-emerald)]"
          />
        </label>
      </CardContent>

      <CardFooter className="border-t border-border/40 pt-3">
        {isActive ? (
          <Button
            variant="outline"
            className="ml-auto w-full gap-1.5 border-[var(--rp-red)]/40 text-[var(--rp-red-soft)] hover:bg-[var(--rp-red)]/10 hover:text-[var(--rp-red)]"
            onClick={onClockOut}
            disabled={!onClockOut}
          >
            <Pause className="size-3.5" /> Fichar salida
          </Button>
        ) : (
          <Button
            variant="default"
            className="ml-auto w-full gap-1.5 bg-[var(--rp-emerald)] text-[var(--rp-emerald-deep)] hover:bg-[var(--rp-emerald-soft)]"
            onClick={submit}
            disabled={method === "pin" && pin.length < 4}
          >
            <Play className="size-3.5" /> Fichar entrada
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

/* =========================================================
 * 13. LoyaltyStampCard — Fidelización stamps
 * =======================================================*/

export function LoyaltyStampCard({
  loyalty,
  className,
}: {
  loyalty: LoyaltyInfo;
  className?: string;
}) {
  const progress = loyalty.max > 0 ? (loyalty.stamps / loyalty.max) * 100 : 0;
  const complete = loyalty.stamps >= loyalty.max;

  return (
    <Card className={cn("rp-glass border-border/50", className)}>
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gift className="size-4 text-[var(--rp-emerald-soft)]" />
              {loyalty.customerName}
            </CardTitle>
            <CardDescription className="text-xs">Programa de fidelización</CardDescription>
          </div>
          <ToneBadge tone={complete ? "emerald" : "yellow"} className="gap-1">
            <Star className="size-3" fill={complete ? "currentColor" : "none"} />
            {loyalty.stamps}/{loyalty.max}
          </ToneBadge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Stamps grid */}
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${Math.min(loyalty.max, 6)}, minmax(0, 1fr))` }}
          role="progressbar"
          aria-valuenow={loyalty.stamps}
          aria-valuemin={0}
          aria-valuemax={loyalty.max}
          aria-label={`${loyalty.stamps} de ${loyalty.max} sellos`}
        >
          {Array.from({ length: loyalty.max }).map((_, i) => {
            const filled = i < loyalty.stamps;
            return (
              <div
                key={i}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-lg border-2 transition-all",
                  filled
                    ? "border-[var(--rp-emerald)] bg-[var(--rp-emerald)]/15 text-[var(--rp-emerald-soft)]"
                    : "border-dashed border-border/60 text-muted-foreground/30",
                )}
              >
                <Star className="size-4" fill={filled ? "currentColor" : "none"} />
              </div>
            );
          })}
        </div>

        <Progress
          value={progress}
          className="h-1.5 [&>[data-slot=progress-indicator]]:bg-[var(--rp-emerald)]"
        />

        {/* Reward preview */}
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border p-2.5 text-xs",
            complete
              ? "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]"
              : "border-border/40 bg-foreground/[0.02] text-muted-foreground",
          )}
        >
          <Sparkles className="size-3.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-foreground/90">Recompensa</div>
            <div className="truncate">{loyalty.reward}</div>
          </div>
          {complete && (
            <Badge className="bg-[var(--rp-emerald)] text-[var(--rp-emerald-deep)]">¡Listo!</Badge>
          )}
        </div>

        {/* Wallet QR */}
        <div className="flex items-center gap-2 rounded-md border border-border/40 bg-foreground/[0.02] p-2">
          <div className="grid size-9 shrink-0 grid-cols-4 gap-px overflow-hidden rounded bg-foreground/10 p-0.5" aria-hidden>
            {Array.from({ length: 16 }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "aspect-square rounded-[1px]",
                  (i * 5 + 2) % 3 === 0 ? "bg-foreground/80" : "bg-transparent",
                )}
              />
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Apple / Google Wallet
            </div>
            <div className="truncate text-[11px] text-foreground/70">
              {loyalty.qrUrl ?? "Añade tu tarjeta digital"}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="size-7" aria-label="Añadir a wallet">
            <QrCode className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* =========================================================
 * 14. ReviewCard — Review display
 * =======================================================*/

const REVIEW_SOURCE_TONE: Record<Review["source"], Tone> = {
  Google: "blue",
  TripAdvisor: "emerald",
  TheFork: "violet",
};

const REVIEW_SENTIMENT_TONE: Record<Review["sentiment"], Tone> = {
  positive: "emerald",
  neutral: "gray",
  negative: "red",
};

const REVIEW_SENTIMENT_LABEL: Record<Review["sentiment"], string> = {
  positive: "Positivo",
  neutral: "Neutral",
  negative: "Negativo",
};

export function ReviewCard({
  review,
  onApprove,
  onEdit,
  className,
}: {
  review: Review;
  onApprove?: (response: string) => void;
  onEdit?: () => void;
  className?: string;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(review.aiResponse ?? "");
  React.useEffect(() => setDraft(review.aiResponse ?? ""), [review.aiResponse]);

  function approve() {
    if (review.aiResponse) onApprove?.(review.aiResponse);
  }

  return (
    <Card className={cn("rp-glass border-border/50", className)}>
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <ToneBadge tone={REVIEW_SOURCE_TONE[review.source]}>{review.source}</ToneBadge>
            <div className="flex items-center gap-0.5" aria-label={`${review.rating} de 5 estrellas`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-3.5",
                    i < review.rating
                      ? "text-[var(--rp-yellow)]"
                      : "text-muted-foreground/30",
                  )}
                  fill={i < review.rating ? "currentColor" : "none"}
                />
              ))}
            </div>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {new Date(review.date).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {review.customer && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3" />
            {review.customer}
            <span>·</span>
            <ToneBadge tone={REVIEW_SENTIMENT_TONE[review.sentiment]} className="text-[10px]">
              {REVIEW_SENTIMENT_LABEL[review.sentiment]}
            </ToneBadge>
          </div>
        )}
        <p className="text-sm leading-relaxed text-foreground/85">“{review.text}”</p>

        {review.aiResponse && (
          <div className="rounded-lg border border-[var(--rp-emerald)]/30 bg-[var(--rp-emerald)]/5 p-2.5">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--rp-emerald-soft)]">
              <Lightbulb className="size-3" />
              Respuesta sugerida (IA)
            </div>
            {editing ? (
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-md border border-border/50 bg-background/60 p-2 text-xs text-foreground/90 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                aria-label="Editar respuesta sugerida"
              />
            ) : (
              <p className="text-xs italic leading-relaxed text-foreground/80">
                {draft}
              </p>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap items-center gap-1.5 border-t border-border/40 pt-3">
        {editing ? (
          <>
            <Button
              size="sm"
              variant="default"
              className="gap-1.5"
              onClick={() => {
                onApprove?.(draft);
                setEditing(false);
              }}
            >
              <Check className="size-3.5" /> Guardar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5"
              onClick={() => {
                setDraft(review.aiResponse ?? "");
                setEditing(false);
              }}
            >
              Cancelar
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="default" className="gap-1.5" onClick={approve} disabled={!onApprove}>
              <Check className="size-3.5" /> Aprobar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => {
                setEditing(true);
                onEdit?.();
              }}
            >
              <Pencil className="size-3.5" /> Editar
            </Button>
            <Button size="sm" variant="ghost" className="ml-auto gap-1.5">
              <MessageSquare className="size-3.5" /> Responder
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}

/* =========================================================
 * 15. HealthScore — Health score dial
 * =======================================================*/

export function HealthScore({
  score,
  diagnosis,
  className,
}: {
  score: number;
  diagnosis: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, score));
  const band: { color: string; label: string; tone: Tone } =
    clamped < 40
      ? { color: "var(--rp-red)", label: "Crítico", tone: "red" }
      : clamped < 60
        ? { color: "var(--rp-yellow)", label: "Regular", tone: "yellow" }
        : clamped < 80
          ? { color: "var(--rp-blue)", label: "Bueno", tone: "blue" }
          : { color: "var(--rp-emerald)", label: "Excelente", tone: "emerald" };

  const r = 60;
  const c = 2 * Math.PI * r;
  const arc = c * 0.75; // 270° arc
  const filled = (clamped / 100) * arc;

  return (
    <Card className={cn("rp-glass border-border/50", className)}>
      <CardHeader className="gap-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <HeartPulse className="size-4 text-[var(--rp-emerald-soft)]" />
          Salud del negocio
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          <svg viewBox="0 0 160 160" className="size-36" role="img" aria-label={`Puntuación ${clamped} de 100, ${band.label}`}>
            {/* Track */}
            <circle
              cx="80"
              cy="80"
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${arc} ${c}`}
              transform="rotate(135 80 80)"
            />
            {/* Filled */}
            <circle
              cx="80"
              cy="80"
              r={r}
              fill="none"
              stroke={band.color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${filled} ${c}`}
              transform="rotate(135 80 80)"
              style={{ transition: "stroke-dasharray 600ms cubic-bezier(0.4,0,0.2,1)" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-display text-3xl font-semibold tabular-nums"
              style={{ color: band.color }}
            >
              {clamped}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              / 100
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <ToneBadge tone={band.tone}>{band.label}</ToneBadge>
          <p className="text-sm leading-relaxed text-foreground/80">{diagnosis}</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Zap className="size-3 text-[var(--rp-emerald-soft)]" />
            <span className="font-mono uppercase tracking-wider">Recomendación</span>
          </div>
          <p className="text-xs text-foreground/70">
            {clamped < 60
              ? "Actúa esta semana para mejorar ingresos y ocupación."
              : clamped < 80
                ? "Mantén el ritmo y optimiza los puntos flojos."
                : "Estás en óptimas condiciones. Sigue así."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* =========================================================
 * 16. IntegrationCard — Integration status
 * =======================================================*/

const INTEGRATION_STATUS_META: Record<
  Integration["status"],
  { label: string; tone: Tone; icon: LucideIcon }
> = {
  connected: { label: "Conectado", tone: "emerald", icon: CheckCircle2 },
  error: { label: "Error", tone: "red", icon: AlertCircle },
  pending: { label: "Pendiente", tone: "yellow", icon: Clock },
  disabled: { label: "Desactivado", tone: "gray", icon: Pause },
};

export function IntegrationCard({
  integration,
  onConfigure,
  onDisconnect,
  className,
}: {
  integration: Integration;
  onConfigure?: () => void;
  onDisconnect?: () => void;
  className?: string;
}) {
  const status = INTEGRATION_STATUS_META[integration.status];
  const borderColor = TONE_BORDER[status.tone];

  return (
    <Card
      className={cn(
        "rp-glass border-border/50 p-0 transition-colors hover:border-border/80",
        className,
      )}
      style={{ borderTop: `2px solid ${borderColor}` }}
    >
      <CardContent className="space-y-2 p-3">
        <div className="flex items-start gap-2.5">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-foreground/[0.04] font-mono text-sm font-bold"
            aria-hidden
          >
            {integration.logo ? (
              <img src={integration.logo} alt="" className="size-full rounded-md object-cover" />
            ) : (
              integration.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="truncate text-sm font-medium">{integration.name}</h4>
              <ToneBadge tone={status.tone} className="shrink-0 gap-1 text-[10px]">
                <status.icon className="size-3" />
                {status.label}
              </ToneBadge>
            </div>
            <div className="text-[11px] text-muted-foreground">{integration.category}</div>
          </div>
        </div>

        {integration.lastSync && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="size-3" />
            Última sync:{" "}
            {new Date(integration.lastSync).toLocaleString("es-ES", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center gap-1.5 border-t border-border/40 p-2">
        <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={onConfigure} disabled={!onConfigure || integration.status === "disabled"}>
          <Settings className="size-3" /> Configurar
        </Button>
        {integration.status === "connected" && (
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto h-7 gap-1 text-xs text-[var(--rp-red-soft)] hover:text-[var(--rp-red)]"
            onClick={onDisconnect}
            disabled={!onDisconnect}
          >
            <X className="size-3" /> Desconectar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

/* =========================================================
 * 17. PlanBadge — Plan indicator
 * =======================================================*/

const PLAN_META: Record<
  "starter" | "professional" | "enterprise",
  { label: string; tone: Tone; icon: LucideIcon }
> = {
  starter: { label: "Starter", tone: "gray", icon: Sparkles },
  professional: { label: "Professional", tone: "emerald", icon: Star },
  enterprise: { label: "Enterprise", tone: "violet", icon: Crown },
};

export function PlanBadge({
  plan,
  className,
}: {
  plan: "starter" | "professional" | "enterprise";
  className?: string;
}) {
  const meta = PLAN_META[plan];
  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 font-medium", TONE_BADGE[meta.tone], className)}
    >
      <meta.icon className="size-3" />
      {meta.label}
    </Badge>
  );
}

/* =========================================================
 * 18. UsageMeter — Usage counter with limit
 * =======================================================*/

export function UsageMeter({
  used,
  limit,
  label,
  onUpgrade,
  className,
}: {
  used: number;
  limit: number;
  label: string;
  onUpgrade?: () => void;
  className?: string;
}) {
  const ratio = limit > 0 ? used / limit : 0;
  const pct = Math.min(100, Math.round(ratio * 100));
  const tone: Tone = ratio >= 1 ? "red" : ratio >= 0.8 ? "yellow" : "emerald";
  const atLimit = ratio >= 1;
  const nearLimit = ratio >= 0.8 && ratio < 1;

  return (
    <div
      className={cn(
        "rounded-lg border bg-card/40 p-3",
        atLimit
          ? "border-[var(--rp-red)]/40"
          : nearLimit
            ? "border-[var(--rp-yellow)]/40"
            : "border-border/50",
        className,
      )}
    >
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="tabular-nums">
          <span className={cn("font-semibold", atLimit && "text-[var(--rp-red-soft)]", nearLimit && "text-[var(--rp-yellow-soft)]")}>
            {used.toLocaleString("es-ES")}
          </span>
          <span className="text-muted-foreground"> / {limit.toLocaleString("es-ES")}</span>
        </span>
      </div>
      <Progress
        value={pct}
        className={cn(
          "mt-2 h-1.5",
          tone === "red"
            ? "[&>[data-slot=progress-indicator]]:bg-[var(--rp-red)]"
            : tone === "yellow"
              ? "[&>[data-slot=progress-indicator]]:bg-[var(--rp-yellow)]"
              : "[&>[data-slot=progress-indicator]]:bg-[var(--rp-emerald)]",
        )}
      />
      {atLimit && (
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 text-[11px] text-[var(--rp-red-soft)]">
            <AlertTriangle className="size-3" />
            Límite alcanzado
          </span>
          {onUpgrade && (
            <Button size="sm" variant="default" className="h-7 gap-1 text-xs" onClick={onUpgrade}>
              <ArrowRight className="size-3" /> Actualizar
            </Button>
          )}
        </div>
      )}
      {nearLimit && (
        <div className="mt-2 flex items-center gap-1 text-[11px] text-[var(--rp-yellow-soft)]">
          <AlertTriangle className="size-3" />
          Acercándote al límite ({pct}%)
        </div>
      )}
    </div>
  );
}

/* =========================================================
 * 19. UpgradePrompt — Contextual upgrade card
 * =======================================================*/

export function UpgradePrompt({
  feature,
  currentPlan,
  targetPlan,
  deltaPrice,
  benefit,
  onUpgrade,
  onDismiss,
  className,
}: {
  feature: string;
  currentPlan: string;
  targetPlan: string;
  deltaPrice: number;
  benefit: string;
  onUpgrade?: () => void;
  onDismiss?: () => void;
  className?: string;
}) {
  const [dismissed, setDismissed] = React.useState(false);
  if (dismissed) return null;

  const targetMeta = PLAN_META[targetPlan as keyof typeof PLAN_META] ?? PLAN_META.professional;

  function dismiss() {
    setDismissed(true);
    onDismiss?.();
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-[var(--rp-emerald)]/40 bg-gradient-to-br from-[var(--rp-emerald)]/10 to-transparent p-0",
        className,
      )}
    >
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-2 top-2 z-10 rounded-md p-1 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
        aria-label="Descartar sugerencia"
      >
        <X className="size-3.5" />
      </button>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--rp-emerald)]/15 text-[var(--rp-emerald-soft)]">
            <Sparkles className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <PlanBadge plan={targetPlan as "starter" | "professional" | "enterprise"} />
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                +{euro(deltaPrice)}/mes
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Desbloquea <span className="font-medium text-foreground/90">{feature}</span>
            </p>
          </div>
        </div>

        <div className="rounded-md border border-[var(--rp-emerald)]/20 bg-[var(--rp-emerald)]/5 p-2 text-xs">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--rp-emerald-soft)]">
            <TrendingUp className="size-3" />
            Beneficio estimado
          </div>
          <p className="mt-0.5 text-foreground/85">{benefit}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="default"
            className="gap-1.5 bg-[var(--rp-emerald)] text-[var(--rp-emerald-deep)] hover:bg-[var(--rp-emerald-soft)]"
            onClick={onUpgrade}
            disabled={!onUpgrade}
          >
            <ArrowRight className="size-3.5" />
            Actualizar a {targetMeta.label}
          </Button>
          <span className="text-[10px] text-muted-foreground">
            Desde {currentPlan}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/* =========================================================
 * 20. StatusDot — Colored status indicator
 * =======================================================*/

const STATUS_DOT_COLOR: Record<"online" | "offline" | "warning" | "error", string> = {
  online: "var(--rp-emerald)",
  offline: "rgba(156,163,175,0.6)",
  warning: "var(--rp-yellow)",
  error: "var(--rp-red)",
};

export function StatusDot({
  status,
  label,
  className,
}: {
  status: "online" | "offline" | "warning" | "error";
  label?: string;
  className?: string;
}) {
  const color = STATUS_DOT_COLOR[status];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      role="status"
      aria-label={label ?? status}
    >
      <span className="relative inline-flex size-2 shrink-0">
        <span
          className="inline-flex size-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        {status === "online" && (
          <span
            className="absolute inline-flex size-full animate-ping rounded-full opacity-60"
            style={{ backgroundColor: color }}
            aria-hidden
          />
        )}
      </span>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </span>
  );
}
