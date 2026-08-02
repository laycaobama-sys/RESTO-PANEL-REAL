"use client";

/* ============================================================================
 * RestoPanel · Centro de Canales unificado
 * 9 canales de venta (sala, barra, QR, web, take away, delivery propio,
 * Glovo, Uber Eats, Just Eat) con toggle en tiempo real, comparativa,
 * modo Dark Kitchen multi-marca y ajustes por canal.
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
  Armchair, Wine, QrCode, Globe, ShoppingBag, Bike, Store,
  Activity, Zap, ChevronRight, X, Settings2, Clock, MapPin,
  Truck, Coins, TrendingUp, Percent, ChefHat, Boxes,
  LayoutGrid, AlertCircle, CheckCircle2, Radio,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type ChannelId =
  | "sala"
  | "barra"
  | "qr"
  | "web"
  | "takeaway"
  | "delivery"
  | "glovo"
  | "uber"
  | "justeat";

interface ChannelDef {
  id: ChannelId;
  label: string;
  icon: React.ElementType;
  tone: "emerald" | "yellow" | "blue" | "violet" | "red";
  pedidosHoy: number;
  ticketMedio: number;
  comisionPct: number; // 0 si no aplica
  margenReal: number; // € tras comisión
  esAgregador: boolean;
  settings: ChannelSettings;
}

interface ChannelSettings {
  horarios: string;
  zonas: string;
  pedidoMinimo: number;
  costeEnvio: number;
  tiempoEstimado: string;
}

interface Brand {
  id: string;
  name: string;
  catalogo: string;
  pedidosHoy: number;
  ticketMedio: number;
  tone: "emerald" | "yellow" | "violet";
}

/* =========================================================
 * Static data
 * =======================================================*/
const TONE_CLS: Record<
  ChannelDef["tone"],
  { text: string; border: string; bg: string; chip: string; stroke: string }
> = {
  emerald: {
    text: "text-[var(--rp-emerald-soft)]",
    border: "border-[var(--rp-emerald)]/40",
    bg: "bg-[var(--rp-emerald)]/10",
    chip: "border-[var(--rp-emerald)]/30 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]",
    stroke: "var(--rp-emerald)",
  },
  yellow: {
    text: "text-[var(--rp-yellow-soft)]",
    border: "border-[var(--rp-yellow)]/40",
    bg: "bg-[var(--rp-yellow)]/10",
    chip: "border-[var(--rp-yellow)]/30 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow-soft)]",
    stroke: "var(--rp-yellow)",
  },
  blue: {
    text: "text-[var(--rp-blue-soft)]",
    border: "border-[var(--rp-blue)]/40",
    bg: "bg-[var(--rp-blue)]/10",
    chip: "border-[var(--rp-blue)]/30 bg-[var(--rp-blue)]/10 text-[var(--rp-blue-soft)]",
    stroke: "var(--rp-blue)",
  },
  violet: {
    text: "text-[var(--rp-violet-soft)]",
    border: "border-[var(--rp-violet)]/40",
    bg: "bg-[var(--rp-violet)]/10",
    chip: "border-[var(--rp-violet)]/30 bg-[var(--rp-violet)]/10 text-[var(--rp-violet-soft)]",
    stroke: "var(--rp-violet)",
  },
  red: {
    text: "text-[var(--rp-red-soft)]",
    border: "border-[var(--rp-red)]/40",
    bg: "bg-[var(--rp-red)]/10",
    chip: "border-[var(--rp-red)]/30 bg-[var(--rp-red)]/10 text-[var(--rp-red-soft)]",
    stroke: "var(--rp-red)",
  },
};

const CHANNELS_INIT: ChannelDef[] = [
  {
    id: "sala",
    label: "Sala",
    icon: Armchair,
    tone: "emerald",
    pedidosHoy: 142,
    ticketMedio: 38.5,
    comisionPct: 0,
    margenReal: 38.5,
    esAgregador: false,
    settings: { horarios: "13:00–16:00 · 20:00–23:30", zonas: "Comedor, Terraza, VIP", pedidoMinimo: 0, costeEnvio: 0, tiempoEstimado: "En mesa" },
  },
  {
    id: "barra",
    label: "Barra",
    icon: Wine,
    tone: "yellow",
    pedidosHoy: 38,
    ticketMedio: 9.20,
    comisionPct: 0,
    margenReal: 9.20,
    esAgregador: false,
    settings: { horarios: "08:00–23:30", zonas: "Barra", pedidoMinimo: 0, costeEnvio: 0, tiempoEstimado: "Inmediato" },
  },
  {
    id: "qr",
    label: "QR · Order & Pay",
    icon: QrCode,
    tone: "blue",
    pedidosHoy: 23,
    ticketMedio: 22.10,
    comisionPct: 0,
    margenReal: 22.10,
    esAgregador: false,
    settings: { horarios: "13:00–23:30", zonas: "Mesas con QR", pedidoMinimo: 0, costeEnvio: 0, tiempoEstimado: "Pago en mesa" },
  },
  {
    id: "web",
    label: "Tienda online",
    icon: Globe,
    tone: "violet",
    pedidosHoy: 12,
    ticketMedio: 28.90,
    comisionPct: 0,
    margenReal: 28.90,
    esAgregador: false,
    settings: { horarios: "12:00–22:30", zonas: "Toda la ciudad", pedidoMinimo: 15, costeEnvio: 1.95, tiempoEstimado: "30–45 min" },
  },
  {
    id: "takeaway",
    label: "Take away",
    icon: ShoppingBag,
    tone: "emerald",
    pedidosHoy: 8,
    ticketMedio: 14.50,
    comisionPct: 0,
    margenReal: 14.50,
    esAgregador: false,
    settings: { horarios: "12:00–22:00", zonas: "Recogida en local", pedidoMinimo: 8, costeEnvio: 0, tiempoEstimado: "15–20 min" },
  },
  {
    id: "delivery",
    label: "Delivery propio",
    icon: Bike,
    tone: "blue",
    pedidosHoy: 28,
    ticketMedio: 26.30,
    comisionPct: 0,
    margenReal: 26.30,
    esAgregador: false,
    settings: { horarios: "13:00–22:30", zonas: "3 km alrededor", pedidoMinimo: 18, costeEnvio: 2.50, tiempoEstimado: "35–50 min" },
  },
  {
    id: "glovo",
    label: "Glovo",
    icon: Store,
    tone: "yellow",
    pedidosHoy: 15,
    ticketMedio: 24.00,
    comisionPct: 30,
    margenReal: 16.80,
    esAgregador: true,
    settings: { horarios: "13:00–22:30", zonas: "Zona Glovo", pedidoMinimo: 10, costeEnvio: 1.99, tiempoEstimado: "30–45 min" },
  },
  {
    id: "uber",
    label: "Uber Eats",
    icon: Store,
    tone: "violet",
    pedidosHoy: 11,
    ticketMedio: 25.50,
    comisionPct: 28,
    margenReal: 18.36,
    esAgregador: true,
    settings: { horarios: "13:00–23:00", zonas: "Zona Uber Eats", pedidoMinimo: 12, costeEnvio: 2.20, tiempoEstimado: "30–45 min" },
  },
  {
    id: "justeat",
    label: "Just Eat",
    icon: Store,
    tone: "red",
    pedidosHoy: 7,
    ticketMedio: 23.80,
    comisionPct: 25,
    margenReal: 17.85,
    esAgregador: true,
    settings: { horarios: "13:00–22:00", zonas: "Zona Just Eat", pedidoMinimo: 10, costeEnvio: 1.80, tiempoEstimado: "30–45 min" },
  },
];

const BRANDS_INIT: Brand[] = [
  { id: "b1", name: "Burger Lab",   catalogo: "Hamburguesas, patatas, bebidas", pedidosHoy: 18, ticketMedio: 16.50, tone: "yellow" },
  { id: "b2", name: "Sushi Go",     catalogo: "Sushi, ramen, gyozas",           pedidosHoy: 12, ticketMedio: 22.90, tone: "violet" },
  { id: "b3", name: "Pizza Express",catalogo: "Pizzas, pastas, postres",       pedidosHoy: 9,  ticketMedio: 18.20, tone: "emerald" },
];

/* =========================================================
 * Helpers
 * =======================================================*/


function euro(n: number): string {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

/* =========================================================
 * Main view
 * =======================================================*/
export function ChannelsView() {
  const { toast } = useToast();
  const [channels, setChannels] = React.useState<ChannelDef[]>(CHANNELS_INIT);
  const [darkKitchen, setDarkKitchen] = React.useState(false);
  const [settingsFor, setSettingsFor] = React.useState<ChannelDef | null>(null);

  const totalPedidos = channels.reduce((s, c) => s + c.pedidosHoy, 0);
  const activeChannels = channels.filter((c) => c.pedidosHoy > 0).length;

  function toggleChannel(id: ChannelId, value: boolean) {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pedidosHoy: value ? c.pedidosHoy : 0 } : c))
    );
    const ch = channels.find((c) => c.id === id);
    toast({
      title: `${ch?.label ?? "Canal"} ${value ? "activado" : "pausado"}`,
      description: value
        ? "El canal empezará a recibir pedidos en tiempo real."
        : "Se detienen nuevos pedidos. Los en curso se completan.",
    });
  }

  function saveSettings(updated: ChannelDef) {
    setChannels((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSettingsFor(null);
    toast({
      title: `Ajustes guardados: ${updated.label}`,
      description: "Los cambios se aplican en tiempo real a los nuevos pedidos.",
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
              Canales
            </h1>
            
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Centro unificado de canales de venta. Activa o pausa canales en
            tiempo real. Todo converge en un solo TPV, KDS, inventario y CRM.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Badge variant="outline" className="border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)] text-[10px] uppercase tracking-[0.15em]">
            <Radio className="h-3 w-3 mr-1.5 animate-pulse" />
            En vivo
          </Badge>
          <Badge variant="outline" className="border-border/60 text-muted-foreground font-mono tabular-nums">
            {activeChannels}/{channels.length} activos
          </Badge>
        </div>
      </header>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          icon={Activity}
          tone="emerald"
          label="Pedidos hoy"
          value={String(totalPedidos)}
          caption="todos los canales"
        />
        <KpiCard
          icon={Coins}
          tone="yellow"
          label="Ticket medio"
          value={euro(
            totalPedidos > 0
              ? channels.reduce((s, c) => s + c.pedidosHoy * c.ticketMedio, 0) / totalPedidos
              : 0
          )}
          caption="ponderado"
        />
        <KpiCard
          icon={Percent}
          tone="red"
          label="Comisión agregadores"
          value={`${Math.round(
            (channels
              .filter((c) => c.esAgregador)
              .reduce((s, c) => s + c.pedidosHoy * c.ticketMedio * (c.comisionPct / 100), 0) /
              Math.max(
                1,
                channels.filter((c) => c.esAgregador).reduce((s, c) => s + c.pedidosHoy * c.ticketMedio, 0)
              )) * 100
          )}%`}
          caption="media ponderada"
        />
        <KpiCard
          icon={LayoutGrid}
          tone="violet"
          label="Canales activos"
          value={`${activeChannels}/${channels.length}`}
          caption="salud general"
        />
      </div>

      {/* Dark Kitchen toggle */}
      <div className="rp-glass rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[var(--rp-violet)]/15 border border-[var(--rp-violet)]/30 flex items-center justify-center">
            <ChefHat className="h-5 w-5 text-[var(--rp-violet-soft)]" />
          </div>
          <div>
            <div className="text-sm font-medium">Modo Dark Kitchen</div>
            <div className="text-[11px] text-muted-foreground">
              Varias marcas virtuales compartiendo cocina, KDS y stock.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn("text-xs", darkKitchen ? "text-[var(--rp-violet-soft)]" : "text-muted-foreground")}>
            {darkKitchen ? "Activado" : "Desactivado"}
          </span>
          <Switch checked={darkKitchen} onCheckedChange={setDarkKitchen} aria-label="Modo Dark Kitchen" />
        </div>
      </div>

      {/* Dark Kitchen panel */}
      <AnimatePresence>
        {darkKitchen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <DarkKitchenPanel />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Channel grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg tracking-tight">Canales de venta</h2>
          <span className="text-[11px] font-mono text-muted-foreground">
            Activar y desactivar en tiempo real
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {channels.map((c) => (
            <ChannelCard
              key={c.id}
              channel={c}
              onToggle={(v) => toggleChannel(c.id, v)}
              onSettings={() => setSettingsFor(c)}
            />
          ))}
        </div>
      </div>

      {/* Unified flow diagram */}
      <UnifiedFlowDiagram channels={channels} />

      {/* Comparison table */}
      <ComparisonTable channels={channels} />

      {/* Settings dialog (desktop) / Sheet (mobile) */}
      <ChannelSettingsDialog
        channel={settingsFor}
        onClose={() => setSettingsFor(null)}
        onSave={saveSettings}
      />
    </div>
  );
}

/* =========================================================
 * KPI card
 * =======================================================*/
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
  tone: "emerald" | "yellow" | "blue" | "violet" | "red";
}) {
  const toneCls =
    tone === "emerald" ? "text-[var(--rp-emerald-soft)]" :
    tone === "yellow"  ? "text-[var(--rp-yellow-soft)]" :
    tone === "blue"    ? "text-[var(--rp-blue-soft)]" :
    tone === "violet"  ? "text-[var(--rp-violet-soft)]" :
    "text-[var(--rp-red-soft)]";
  return (
    <div className="rp-glass rounded-xl p-4 flex items-center gap-3">
      <div className={cn("h-10 w-10 rounded-lg bg-foreground/[0.04] flex items-center justify-center", toneCls)}>
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
 * Channel card
 * =======================================================*/
function ChannelCard({
  channel,
  onToggle,
  onSettings,
}: {
  channel: ChannelDef;
  onToggle: (v: boolean) => void;
  onSettings: () => void;
}) {
  const reduce = useReducedMotion();
  const tone = TONE_CLS[channel.tone];
  const Icon = channel.icon;
  const isActive = channel.pedidosHoy > 0;

  return (
    <motion.div
      layout={!reduce}
      className={cn(
        "rp-glass rounded-2xl p-4 border flex flex-col gap-3 transition-colors",
        isActive ? tone.border : "border-border/40 opacity-70"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn("h-10 w-10 rounded-lg bg-foreground/[0.04] flex items-center justify-center", tone.text)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-sm truncate">{channel.label}</div>
            <div className="text-[11px] text-muted-foreground">
              {channel.esAgregador ? "Agregador" : "Canal propio"}
            </div>
          </div>
        </div>
        <Switch
          checked={isActive}
          onCheckedChange={onToggle}
          aria-label={`Activar ${channel.label}`}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md bg-foreground/[0.03] border border-border/40 p-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Pedidos hoy
          </div>
          <div className="text-lg font-display font-medium tabular-nums">
            {channel.pedidosHoy}
          </div>
        </div>
        <div className="rounded-md bg-foreground/[0.03] border border-border/40 p-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Ticket medio
          </div>
          <div className="text-lg font-display font-medium tabular-nums">
            {euro(channel.ticketMedio)}
          </div>
        </div>
      </div>

      {channel.esAgregador && (
        <div className={cn("rounded-md border p-2 text-xs flex items-center justify-between", tone.chip)}>
          <span className="flex items-center gap-1.5">
            <Percent className="h-3 w-3" />
            Comisión {channel.comisionPct}%
          </span>
          <span className="font-mono tabular-nums">
            Margen: {euro(channel.margenReal)}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-1">
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", isActive ? tone.chip : "border-border/60 text-muted-foreground")}>
          {isActive ? (
            <>
              <span className={cn("h-1.5 w-1.5 rounded-full mr-1", tone.bg)} />
              Activo
            </>
          ) : (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 mr-1" />
              Pausado
            </>
          )}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
          onClick={onSettings}
        >
          <Settings2 className="h-3.5 w-3.5" /> Ajustes
        </Button>
      </div>
    </motion.div>
  );
}

/* =========================================================
 * Unified flow diagram (SVG)
 * =======================================================*/
function UnifiedFlowDiagram({ channels }: { channels: ChannelDef[] }) {
  const activeChannels = channels.filter((c) => c.pedidosHoy > 0);
  const reduce = useReducedMotion();

  const W = 760;
  const H = 280;
  const channelCount = activeChannels.length;
  const padTop = 16;
  const padBottom = 16;
  const availableH = H - padTop - padBottom;
  const step = channelCount > 1 ? availableH / (channelCount - 1) : 0;
  const startX = 60;
  const hubX = 380;
  const endX = 700;

  return (
    <div className="rp-glass rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-[var(--rp-emerald-soft)]" />
          <h2 className="font-display text-lg tracking-tight">Flujo unificado</h2>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground">
          Todos los canales → un solo núcleo
        </span>
      </div>

      <div className="overflow-x-auto rp-scroll-thin">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ minWidth: 640, height: "auto" }}
          role="img"
          aria-label="Diagrama del flujo unificado de canales hacia un único TPV, KDS, inventario y CRM"
        >
          <defs>
            <linearGradient id="rp-flow-bg" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="var(--rp-emerald)" stopOpacity="0" />
              <stop offset="50%" stopColor="var(--rp-emerald)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--rp-emerald)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Channels (left) */}
          {activeChannels.map((c, i) => {
            const tone = TONE_CLS[c.tone];
            const y = padTop + i * step;
            const Icon = c.icon;
            return (
              <g key={c.id}>
                <rect
                  x={startX - 50}
                  y={y - 14}
                  width={100}
                  height={28}
                  rx={6}
                  fill="rgba(255,255,255,0.03)"
                  stroke={tone.stroke}
                  strokeWidth={1}
                  opacity={0.9}
                />
                <text
                  x={startX}
                  y={y + 4}
                  textAnchor="middle"
                  fontSize={11}
                  fill="currentColor"
                  className="font-mono"
                >
                  {c.label.length > 12 ? c.label.slice(0, 11) + "…" : c.label}
                </text>
                {/* Line to hub */}
                <motion.path
                  d={`M ${startX + 50} ${y} C ${(startX + hubX) / 2} ${y}, ${(startX + hubX) / 2} ${H / 2}, ${hubX - 60} ${H / 2}`}
                  fill="none"
                  stroke={tone.stroke}
                  strokeWidth={1.5}
                  strokeOpacity={0.5}
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: i * 0.04 }}
                />
                {/* Tiny moving dot to indicate live flow */}
                {!reduce && (
                  <motion.circle
                    r={2.5}
                    fill={tone.stroke}
                    initial={{ offsetDistance: "0%" }}
                    animate={{ cx: [startX + 50, hubX - 60], cy: [y, H / 2] }}
                    transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                  />
                )}
                <Icon className="hidden" />
              </g>
            );
          })}

          {/* Hub (center) */}
          <rect
            x={hubX - 60}
            y={H / 2 - 50}
            width={120}
            height={100}
            rx={12}
            fill="url(#rp-flow-bg)"
            stroke="var(--rp-emerald)"
            strokeWidth={1.5}
            strokeOpacity={0.6}
          />
          <text x={hubX} y={H / 2 - 22} textAnchor="middle" fontSize={10} className="font-mono" fill="var(--rp-emerald-soft)">
            NÚCLEO
          </text>
          <text x={hubX} y={H / 2 - 4} textAnchor="middle" fontSize={13} className="font-display" fill="currentColor" fontWeight={500}>
            TPV
          </text>
          <text x={hubX} y={H / 2 + 14} textAnchor="middle" fontSize={11} className="font-mono" fill="currentColor" opacity={0.7}>
            KDS · Stock
          </text>
          <text x={hubX} y={H / 2 + 30} textAnchor="middle" fontSize={11} className="font-mono" fill="currentColor" opacity={0.7}>
            CRM
          </text>

          {/* Lines from hub to outputs (right) */}
          {[
            { y: padTop, label: "Ventas" },
            { y: H / 2, label: "Cocina" },
            { y: H - padBottom, label: "Inventario" },
          ].map((o, i) => (
            <g key={o.label}>
              <motion.path
                d={`M ${hubX + 60} ${H / 2} C ${(hubX + endX) / 2} ${H / 2}, ${(hubX + endX) / 2} ${o.y}, ${endX - 50} ${o.y}`}
                fill="none"
                stroke="var(--rp-emerald)"
                strokeWidth={1.5}
                strokeOpacity={0.5}
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.06 }}
              />
              <rect
                x={endX - 50}
                y={o.y - 14}
                width={100}
                height={28}
                rx={6}
                fill="rgba(255,255,255,0.03)"
                stroke="var(--rp-emerald)"
                strokeWidth={1}
                strokeOpacity={0.5}
              />
              <text x={endX} y={o.y + 4} textAnchor="middle" fontSize={11} className="font-mono" fill="currentColor">
                {o.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
        {[
          { label: "Un solo TPV",     icon: Coins },
          { label: "Un solo KDS",     icon: ChefHat },
          { label: "Un solo inventario", icon: Boxes },
          { label: "Un solo CRM",     icon: Activity },
        ].map((b) => {
          const Icon = b.icon;
          return (
            <div key={b.label} className="rounded-md border border-[var(--rp-emerald)]/30 bg-[var(--rp-emerald)]/[0.06] p-2 flex items-center justify-center gap-2 text-xs text-[var(--rp-emerald-soft)]">
              <Icon className="h-3.5 w-3.5" />
              {b.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
 * Comparison table
 * =======================================================*/
function ComparisonTable({ channels }: { channels: ChannelDef[] }) {
  const total = channels.reduce((s, c) => s + c.pedidosHoy, 0);
  const sorted = [...channels].sort((a, b) => b.pedidosHoy - a.pedidosHoy);

  return (
    <div className="rp-glass rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--rp-emerald-soft)]" />
          <h2 className="font-display text-lg tracking-tight">Comparativa por canal</h2>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground">Hoy · {total} pedidos</span>
      </div>
      <div className="overflow-x-auto rp-scroll-thin">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-foreground/[0.03] text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-3 py-2">Canal</th>
              <th className="text-right px-3 py-2">Pedidos hoy</th>
              <th className="text-right px-3 py-2">Ticket medio</th>
              <th className="text-right px-3 py-2">% del total</th>
              <th className="text-right px-3 py-2">Margen real</th>
              <th className="text-center px-3 py-2">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {sorted.map((c) => {
              const tone = TONE_CLS[c.tone];
              const Icon = c.icon;
              const pct = total > 0 ? (c.pedidosHoy / total) * 100 : 0;
              return (
                <tr key={c.id} className="hover:bg-foreground/[0.02]">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-7 w-7 rounded-md bg-foreground/[0.04] flex items-center justify-center", tone.text)}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="font-medium">{c.label}</span>
                      {c.esAgregador && (
                        <span className="text-[10px] font-mono px-1 py-0.5 rounded border border-border/60 text-muted-foreground">
                          {c.comisionPct}%
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{c.pedidosHoy}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{euro(c.ticketMedio)}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                        <div className={cn("h-full", tone.bg)} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="font-mono tabular-nums text-xs w-10 text-right">{pct.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">
                    {c.esAgregador ? (
                      <span className="text-[var(--rp-yellow-soft)]">{euro(c.margenReal)}</span>
                    ) : (
                      <span>{euro(c.margenReal)}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", c.pedidosHoy > 0 ? tone.chip : "border-border/60 text-muted-foreground")}>
                      {c.pedidosHoy > 0 ? "Activo" : "Pausado"}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-foreground/[0.02] text-xs font-mono">
            <tr>
              <td className="px-3 py-2">Total</td>
              <td className="px-3 py-2 text-right tabular-nums">{total}</td>
              <td className="px-3 py-2 text-right tabular-nums">
                {euro(total > 0 ? channels.reduce((s, c) => s + c.pedidosHoy * c.ticketMedio, 0) / total : 0)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums">100%</td>
              <td className="px-3 py-2 text-right tabular-nums text-[var(--rp-emerald-soft)]">
                {euro(channels.reduce((s, c) => s + c.pedidosHoy * c.margenReal, 0))}
              </td>
              <td className="px-3 py-2" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

/* =========================================================
 * Dark Kitchen panel
 * =======================================================*/
function DarkKitchenPanel() {
  const totalPedidos = BRANDS_INIT.reduce((s, b) => s + b.pedidosHoy, 0);
  const toneCls: Record<Brand["tone"], { text: string; border: string; bg: string }> = {
    emerald: { text: "text-[var(--rp-emerald-soft)]", border: "border-[var(--rp-emerald)]/40", bg: "bg-[var(--rp-emerald)]/10" },
    yellow:  { text: "text-[var(--rp-yellow-soft)]",  border: "border-[var(--rp-yellow)]/40",  bg: "bg-[var(--rp-yellow)]/10" },
    violet:  { text: "text-[var(--rp-violet-soft)]",  border: "border-[var(--rp-violet)]/40",  bg: "bg-[var(--rp-violet)]/10" },
  };

  return (
    <div className="rp-glass rounded-2xl p-4 sm:p-5 border-l-2 border-l-[var(--rp-violet)]/60">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ChefHat className="h-4 w-4 text-[var(--rp-violet-soft)]" />
          <h2 className="font-display text-lg tracking-tight">Multi-marca virtual</h2>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground">
          1 KDS compartido · 1 stock · rentabilidad por marca
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {BRANDS_INIT.map((b) => {
          const t = toneCls[b.tone];
          const pct = totalPedidos > 0 ? (b.pedidosHoy / totalPedidos) * 100 : 0;
          return (
            <div key={b.id} className={cn("rounded-xl border p-4 flex flex-col gap-2", t.border, t.bg)}>
              <div className="flex items-center justify-between gap-2">
                <div className="font-display text-base">{b.name}</div>
                <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded border", t.border, t.text)}>
                  Marca
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground">{b.catalogo}</div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Pedidos hoy</div>
                  <div className="font-display text-lg tabular-nums">{b.pedidosHoy}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Ticket medio</div>
                  <div className="font-display text-lg tabular-nums">{euro(b.ticketMedio)}</div>
                </div>
              </div>
              <div className="mt-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mb-1">
                  <span>% del total</span>
                  <span className="tabular-nums">{pct.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                  <div className={cn("h-full", t.bg)} style={{ width: `${pct}%`, backgroundColor: "currentColor" }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
        <div className="rounded-md border border-border/40 bg-foreground/[0.02] p-3 flex items-center gap-2">
          <ChefHat className="h-4 w-4 text-[var(--rp-violet-soft)]" />
          <div>
            <div className="font-medium">1 KDS compartido</div>
            <div className="text-[11px] text-muted-foreground">Todas las marcas cocinan en el mismo KDS</div>
          </div>
        </div>
        <div className="rounded-md border border-border/40 bg-foreground/[0.02] p-3 flex items-center gap-2">
          <Boxes className="h-4 w-4 text-[var(--rp-violet-soft)]" />
          <div>
            <div className="font-medium">1 stock compartido</div>
            <div className="text-[11px] text-muted-foreground">Inventario único para todas las marcas</div>
          </div>
        </div>
        <div className="rounded-md border border-border/40 bg-foreground/[0.02] p-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--rp-violet-soft)]" />
          <div>
            <div className="font-medium">Rentabilidad por marca</div>
            <div className="text-[11px] text-muted-foreground">Costes imputados a cada marca</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Channel settings dialog
 * =======================================================*/
function ChannelSettingsDialog({
  channel,
  onClose,
  onSave,
}: {
  channel: ChannelDef | null;
  onClose: () => void;
  onSave: (c: ChannelDef) => void;
}) {
  const [draft, setDraft] = React.useState<ChannelSettings | null>(null);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (channel) {
      setDraft({ ...channel.settings });
    } else {
      setDraft(null);
    }
  }, [channel]);

  if (!channel || !draft) return null;

  const tone = TONE_CLS[channel.tone];
  const Icon = channel.icon;

  const content = (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={cn("h-11 w-11 rounded-lg bg-foreground/[0.04] flex items-center justify-center", tone.text)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="font-display text-base">{channel.label}</div>
          <div className="text-[11px] text-muted-foreground">
            {channel.esAgregador ? `Agregador · comisión ${channel.comisionPct}%` : "Canal propio"}
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SettingField label="Horarios" icon={Clock}>
          <Input
            value={draft.horarios}
            onChange={(e) => setDraft({ ...draft, horarios: e.target.value })}
            className="bg-input/30 min-h-11 font-mono"
          />
        </SettingField>
        <SettingField label="Zonas" icon={MapPin}>
          <Input
            value={draft.zonas}
            onChange={(e) => setDraft({ ...draft, zonas: e.target.value })}
            className="bg-input/30 min-h-11"
          />
        </SettingField>
        <SettingField label="Pedido mínimo (€)" icon={Coins}>
          <Input
            type="number"
            value={draft.pedidoMinimo}
            onChange={(e) => setDraft({ ...draft, pedidoMinimo: Number(e.target.value) || 0 })}
            className="bg-input/30 min-h-11 tabular-nums font-mono"
          />
        </SettingField>
        <SettingField label="Coste de envío (€)" icon={Truck}>
          <Input
            type="number"
            step="0.05"
            value={draft.costeEnvio}
            onChange={(e) => setDraft({ ...draft, costeEnvio: Number(e.target.value) || 0 })}
            className="bg-input/30 min-h-11 tabular-nums font-mono"
          />
        </SettingField>
        <SettingField label="Tiempo estimado" icon={Clock}>
          <Input
            value={draft.tiempoEstimado}
            onChange={(e) => setDraft({ ...draft, tiempoEstimado: e.target.value })}
            className="bg-input/30 min-h-11"
          />
        </SettingField>
      </div>

      <div className="rounded-md border border-[var(--rp-emerald)]/30 bg-[var(--rp-emerald)]/[0.06] p-3 text-xs text-[var(--rp-emerald-soft)] flex items-start gap-2">
        <Zap className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          Los cambios se aplican <strong>en tiempo real</strong> a los nuevos pedidos. Los pedidos en curso conservan la configuración anterior.
        </span>
      </div>
    </div>
  );

  const footer = (
    <>
      <Button variant="outline" className="min-h-11" onClick={onClose}>
        <X className="h-4 w-4" /> Cancelar
      </Button>
      <Button
        className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)] min-h-11"
        onClick={() => onSave({ ...channel, settings: draft })}
      >
        <CheckCircle2 className="h-4 w-4" /> Guardar
      </Button>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={!!channel} onOpenChange={(o) => !o && onClose()}>
        <SheetContent side="bottom" className="rp-glass-strong max-h-[88vh] overflow-y-auto rp-scroll-thin">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-[var(--rp-emerald-soft)]" />
              Ajustes del canal
            </SheetTitle>
            <SheetDescription>
              Configura horarios, zonas, pedido mínimo, coste de envío y tiempo estimado.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6 space-y-4">
            {content}
            <div className="flex gap-2 pt-2">{footer}</div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={!!channel} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-[var(--rp-emerald-soft)]" />
            Ajustes del canal
          </DialogTitle>
          <DialogDescription>
            Configura horarios, zonas, pedido mínimo, coste de envío y tiempo estimado.
          </DialogDescription>
        </DialogHeader>
        {content}
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SettingField({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Icon className="h-3 w-3" />
        {label}
      </Label>
      {children}
    </div>
  );
}

/* =========================================================
 * useIsMobile hook (matches shadcn convention)
 * =======================================================*/
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
