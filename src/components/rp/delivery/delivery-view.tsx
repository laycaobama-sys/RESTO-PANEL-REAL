"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
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
  Bike, MapPin, Clock, DollarSign, TrendingUp, TrendingDown,
  Package, Store, ShoppingCart, Check, X, Plus, Minus,
  Navigation, Phone, MessageSquare, Star, Zap, Calculator,
  CircleDot, ChevronRight, AlertTriangle, Sparkles, Route,
  Timer, Wallet, Percent, Eye, EyeOff, Globe, Crown, Gauge,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type DeliveryStatus =
  | "recibido"
  | "aceptado"
  | "encocina"
  | "listo"
  | "asignado"
  | "enruta"
  | "entregado";

type Agregador = "glovo" | "ubereats" | "justeat";

interface DeliveryPedido {
  id: string;
  cliente: string;
  direccion: string;
  zona: string;
  items: number;
  total: number;
  envio: number;
  status: DeliveryStatus;
  repartidor?: string;
  canal: "propio" | Agregador;
  createdAt: number;
  ETA?: number; // minutes
}

interface Repartidor {
  id: string;
  nombre: string;
  activos: number;
  liquidacion: number;
  zona: string;
  rating: number;
  online: boolean;
  position?: { x: number; y: number };
}

interface Zona {
  id: string;
  nombre: string;
  tipo: "poligono" | "radio";
  minimo: number;
  envio: number;
  horario: string;
  pedidosHoy: number;
}

interface AgregadorMeta {
  id: Agregador;
  label: string;
  comision: number;
  activo: boolean;
  pedidosHoy: number;
  margenReal: number;
  color: string;
}

/* =========================================================
 * Constants
 * =======================================================*/
const STATUS_FLOW: DeliveryStatus[] = [
  "recibido", "aceptado", "encocina", "listo", "asignado", "enruta", "entregado",
];

const STATUS_META: Record<DeliveryStatus, { label: string; cls: string; dot: string }> = {
  recibido: { label: "Recibido", cls: "border-[var(--rp-blue)]/40 bg-[var(--rp-blue)]/10 text-[var(--rp-blue-soft)]", dot: "bg-[var(--rp-blue)]" },
  aceptado: { label: "Aceptado", cls: "border-[var(--rp-blue)]/40 bg-[var(--rp-blue)]/12 text-[var(--rp-blue-soft)]", dot: "bg-[var(--rp-blue-soft)]" },
  encocina: { label: "En cocina", cls: "border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow-soft)]", dot: "bg-[var(--rp-yellow)]" },
  listo: { label: "Listo", cls: "border-[var(--rp-emerald)]/50 bg-[var(--rp-emerald)]/12 text-[var(--rp-emerald-soft)]", dot: "bg-[var(--rp-emerald)]" },
  asignado: { label: "Asignado", cls: "border-[var(--rp-violet)]/40 bg-[var(--rp-violet)]/10 text-[var(--rp-violet-soft)]", dot: "bg-[var(--rp-violet)]" },
  enruta: { label: "En ruta", cls: "border-[var(--rp-violet)]/50 bg-[var(--rp-violet)]/12 text-[var(--rp-violet-soft)]", dot: "bg-[var(--rp-violet-soft)]" },
  entregado: { label: "Entregado", cls: "border-zinc-500/40 bg-zinc-500/10 text-zinc-400", dot: "bg-zinc-500" },
};

const NOW = Date.now();
const MIN = 60 * 1000;

const INITIAL_PEDIDOS: DeliveryPedido[] = [
  { id: "d1", cliente: "Laura Pérez", direccion: "C/ Mallorca 234", zona: "Eixample", items: 3, total: 28.5, envio: 2.5, status: "enruta", repartidor: "Diego", canal: "propio", createdAt: NOW - 18 * MIN, ETA: 4 },
  { id: "d2", cliente: "Marc Soler", direccion: "Av. Diagonal 405", zona: "Eixample", items: 2, total: 18.0, envio: 0, status: "encocina", canal: "glovo", createdAt: NOW - 6 * MIN },
  { id: "d3", cliente: "Anna Vidal", direccion: "C/ Verdi 12", zona: "Gràcia", items: 4, total: 42.5, envio: 3.0, status: "listo", repartidor: "Sara", canal: "propio", createdAt: NOW - 12 * MIN },
  { id: "d4", cliente: "Pau Riera", direccion: "C/ Sants 88", zona: "Sants", items: 1, total: 12.5, envio: 2.0, status: "asignado", repartidor: "Diego", canal: "propio", createdAt: NOW - 8 * MIN, ETA: 15 },
  { id: "d5", cliente: "Núria Camps", direccion: "Pg. Gràcia 56", zona: "Eixample", items: 5, total: 56.0, envio: 0, status: "recibido", canal: "ubereats", createdAt: NOW - 2 * MIN },
  { id: "d6", cliente: "Jordi Font", direccion: "C/ Casp 45", zona: "Eixample", items: 2, total: 22.0, envio: 2.5, status: "aceptado", canal: "propio", createdAt: NOW - 3 * MIN },
  { id: "d7", cliente: "Berta Llop", direccion: "C/ Pi i Margall 9", zona: "Gràcia", items: 3, total: 31.5, envio: 3.0, status: "entregado", repartidor: "Sara", canal: "propio", createdAt: NOW - 45 * MIN },
  { id: "d8", cliente: "Quim Bosch", direccion: "C/ Creu Coberta 101", zona: "Sants", items: 2, total: 19.0, envio: 2.0, status: "enruta", repartidor: "Sara", canal: "propio", createdAt: NOW - 14 * MIN, ETA: 6 },
];

const REPARTIDORES: Repartidor[] = [
  { id: "r1", nombre: "Diego Ruiz", activos: 2, liquidacion: 86.5, zona: "Eixample", rating: 4.8, online: true, position: { x: 55, y: 38 } },
  { id: "r2", nombre: "Sara Mora", activos: 2, liquidacion: 92.0, zona: "Gràcia", rating: 4.9, online: true, position: { x: 38, y: 28 } },
  { id: "r3", nombre: "Ivan Piñol", activos: 0, liquidacion: 45.0, zona: "Sants", rating: 4.7, online: true, position: { x: 22, y: 70 } },
  { id: "r4", nombre: "Marta Vela", activos: 1, liquidacion: 38.5, zona: "Eixample", rating: 4.6, online: false, position: { x: 62, y: 50 } },
];

const ZONAS: Zona[] = [
  { id: "z1", nombre: "Eixample", tipo: "poligono", minimo: 15, envio: 2.5, horario: "13:00–23:00", pedidosHoy: 18 },
  { id: "z2", nombre: "Gràcia", tipo: "radio", minimo: 18, envio: 3.0, horario: "13:00–22:30", pedidosHoy: 7 },
  { id: "z3", nombre: "Sants", tipo: "poligono", minimo: 20, envio: 2.0, horario: "13:00–23:00", pedidosHoy: 3 },
];

const AGREGADORES: AgregadorMeta[] = [
  { id: "glovo", label: "Glovo", comision: 30, activo: true, pedidosHoy: 9, margenReal: 70, color: "var(--rp-yellow)" },
  { id: "ubereats", label: "Uber Eats", comision: 28, activo: true, pedidosHoy: 7, margenReal: 72, color: "var(--rp-emerald)" },
  { id: "justeat", label: "Just Eat", comision: 25, activo: false, pedidosHoy: 0, margenReal: 75, color: "var(--rp-orange, #F97316)" },
];

/* =========================================================
 * Helpers
 * =======================================================*/
function eur(n: number): string {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

function fmtTime(ms: number): string {
  const min = Math.max(0, Math.floor(ms / 60000));
  return `${min} min`;
}


/* =========================================================
 * ROI Calculator
 * =======================================================*/
function RoiCalculator() {
  const [pedidosMes, setPedidosMes] = React.useState(450);
  const [ticketMedio, setTicketMedio] = React.useState(24);
  const [comisionAgregador, setComisionAgregador] = React.useState(30);

  const facturacionMes = pedidosMes * ticketMedio;
  const comisionAgregadorTotal = (facturacionMes * comisionAgregador) / 100;
  const ahorroPropio = comisionAgregadorTotal; // 0% propio = 100% ahorro
  const anual = ahorroPropio * 12;

  return (
    <div className="rp-glass rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="rounded-lg p-2 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]">
          <Calculator className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-display text-base">ROI · Delivery propio vs agregadores</h3>
          <p className="text-[11px] text-muted-foreground">0% comisión propia vs {comisionAgregador}% agregadores</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Slider 1: pedidos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Pedidos / mes</Label>
            <span className="font-display text-sm">{pedidosMes}</span>
          </div>
          <Slider
            value={[pedidosMes]}
            min={100}
            max={2000}
            step={25}
            onValueChange={(v) => setPedidosMes(v[0])}
          />
        </div>
        {/* Slider 2: ticket */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Ticket medio</Label>
            <span className="font-display text-sm">{eur(ticketMedio)}</span>
          </div>
          <Slider
            value={[ticketMedio]}
            min={10}
            max={60}
            step={1}
            onValueChange={(v) => setTicketMedio(v[0])}
          />
        </div>
        {/* Slider 3: comisión */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Comisión agregador</Label>
            <span className="font-display text-sm">{comisionAgregador}%</span>
          </div>
          <Slider
            value={[comisionAgregador]}
            min={15}
            max={35}
            step={1}
            onValueChange={(v) => setComisionAgregador(v[0])}
          />
        </div>
      </div>

      <Separator />

      {/* Result */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-foreground/[0.03] p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Facturación / mes</div>
          <div className="font-display text-xl mt-1">{eur(facturacionMes)}</div>
          <div className="text-[11px] text-muted-foreground">{pedidosMes} × {eur(ticketMedio)}</div>
        </div>
        <div className="rounded-lg border border-[var(--rp-red)]/40 bg-[var(--rp-red)]/8 p-3">
          <div className="text-[10px] uppercase tracking-wider text-[var(--rp-red-soft)] font-mono">Comisión agregador / mes</div>
          <div className="font-display text-xl mt-1 text-[var(--rp-red-soft)]">−{eur(comisionAgregadorTotal)}</div>
          <div className="text-[11px] text-muted-foreground">{comisionAgregador}% de {eur(facturacionMes)}</div>
        </div>
        <div className="rounded-lg border border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/8 p-3 rp-glow-teal">
          <div className="text-[10px] uppercase tracking-wider text-[var(--rp-emerald-soft)] font-mono">Ahorro propio / mes</div>
          <div className="font-display text-xl mt-1 text-[var(--rp-emerald-soft)]">+{eur(ahorroPropio)}</div>
          <div className="text-[11px] text-muted-foreground">{eur(anual)} / año</div>
        </div>
      </div>
    </div>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <label className={cn("block", className)}>{children}</label>;
}

/* =========================================================
 * Comparativa rentabilidad SVG bar chart
 * =======================================================*/
function ComparativaRentabilidad() {
  const data: { label: string; pct: number; color: string; cls: string }[] = [
    { label: "Propio", pct: 100, color: "var(--rp-emerald)", cls: "text-[var(--rp-emerald-soft)]" },
    { label: "Glovo", pct: 70, color: "var(--rp-yellow)", cls: "text-[var(--rp-yellow-soft)]" },
    { label: "Uber Eats", pct: 72, color: "var(--rp-emerald-soft)", cls: "text-[var(--rp-emerald-soft)]" },
    { label: "Just Eat", pct: 75, color: "var(--rp-orange, #F97316)", cls: "text-orange-300" },
  ];
  return (
    <div className="rp-glass rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="rounded-lg p-2 bg-foreground/[0.04] text-[var(--rp-emerald-soft)]">
          <TrendingUp className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-display text-base">Comparativa de rentabilidad</h3>
          <p className="text-[11px] text-muted-foreground">% margen real sobre venta · mismo ticket</p>
        </div>
      </div>
      <div className="space-y-2.5">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-3">
            <div className="w-20 text-sm font-medium">{d.label}</div>
            <div className="flex-1 h-7 rounded-md bg-foreground/[0.04] overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${d.pct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full rounded-md flex items-center justify-end pr-2"
                style={{ background: `color-mix(in oklab, ${d.color} 35%, transparent)` }}
              >
                <span className={cn("text-xs font-mono font-semibold", d.cls)}>{d.pct}%</span>
              </motion.div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Sobre un ticket de {eur(24)}: propio ingresa {eur(24)} · Glovo {eur(16.8)} · Uber Eats {eur(17.28)} · Just Eat {eur(18)}
      </p>
    </div>
  );
}

/* =========================================================
 * Live map mock
 * =======================================================*/
function LiveMap({ pedidos }: { pedidos: DeliveryPedido[] }) {
  const enruta = pedidos.filter((p) => p.status === "enruta" || p.status === "asignado");
  return (
    <div className="rp-glass rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg p-2 bg-foreground/[0.04] text-[var(--rp-violet-soft)]">
            <Navigation className="h-4 w-4" />
          </div>
          <h3 className="font-display text-base">Mapa en vivo</h3>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono">
          {REPARTIDORES.filter((r) => r.online).length} activos
        </Badge>
      </div>
      <div
        className="relative w-full rounded-lg overflow-hidden border border-border rp-grid-bg"
        style={{ aspectRatio: "16/10", background: "color-mix(in oklab, var(--card) 80%, transparent)" }}
      >
        {/* Mock streets */}
        <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 100 60">
          <path d="M 0 30 L 100 30" stroke="currentColor" strokeWidth="0.4" className="text-muted-foreground" />
          <path d="M 0 15 L 100 15" stroke="currentColor" strokeWidth="0.3" className="text-muted-foreground" />
          <path d="M 0 45 L 100 45" stroke="currentColor" strokeWidth="0.3" className="text-muted-foreground" />
          <path d="M 30 0 L 30 60" stroke="currentColor" strokeWidth="0.4" className="text-muted-foreground" />
          <path d="M 60 0 L 60 60" stroke="currentColor" strokeWidth="0.3" className="text-muted-foreground" />
          <path d="M 80 0 L 80 60" stroke="currentColor" strokeWidth="0.3" className="text-muted-foreground" />
        </svg>

        {/* Restaurant pin (center) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative">
            <div className="rounded-full bg-[var(--rp-emerald)] p-1.5 rp-glow-gold">
              <Store className="h-3.5 w-3.5 text-black" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--rp-emerald)] rotate-45" />
          </div>
        </div>

        {/* Repartidor pins */}
        {REPARTIDORES.filter((r) => r.online && r.position).map((r) => (
          <div
            key={r.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
            style={{ left: `${r.position!.x}%`, top: `${r.position!.y}%` }}
          >
            <div className="relative">
              <div className="rounded-full bg-[var(--rp-violet)] p-1 ring-2 ring-[var(--rp-violet-soft)]/50">
                <Bike className="h-3 w-3 text-white" />
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-popover text-popover-foreground text-[10px] px-1.5 py-0.5 rounded border border-border">
                {r.nombre} · {r.activos} ped.
              </div>
              {r.activos > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--rp-emerald)] text-black text-[8px] font-bold rounded-full h-3.5 min-w-3.5 px-0.5 flex items-center justify-center">
                  {r.activos}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Destination pins for active orders */}
        {enruta.slice(0, 4).map((p, i) => {
          const angle = (i * Math.PI * 2) / 4;
          const x = 50 + Math.cos(angle) * 35;
          const y = 50 + Math.sin(angle) * 22;
          return (
            <div
              key={p.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <MapPin className="h-4 w-4 text-[var(--rp-yellow-soft)] fill-[var(--rp-yellow)]/30" />
            </div>
          );
        })}

        {/* Stats overlay */}
        <div className="absolute top-2 left-2 bg-background/80 backdrop-blur px-2 py-1 rounded-md text-[10px] font-mono text-muted-foreground">
          Zona Eixample · Gràcia · Sants
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">
        {enruta.length} pedidos en ruta · ETA media {enruta.length > 0 ? "5 min" : "—"}
      </p>
    </div>
  );
}

/* =========================================================
 * Main view
 * =======================================================*/
export function DeliveryView() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [pedidos, setPedidos] = React.useState<DeliveryPedido[]>(INITIAL_PEDIDOS);
  const [agregadores, setAgregadores] = React.useState<AgregadorMeta[]>(AGREGADORES);
  const [selectedPedidoId, setSelectedPedidoId] = React.useState<string | null>(null);
  const [filterCanal, setFilterCanal] = React.useState<"todos" | "propio" | Agregador>("todos");
  const [filterStatus, setFilterStatus] = React.useState<DeliveryStatus | "todos">("todos");

  const stats = React.useMemo(() => {
    const hoy = pedidos;
    const propio = hoy.filter((p) => p.canal === "propio").length;
    const ag = hoy.filter((p) => p.canal !== "propio").length;
    const factPropio = hoy.filter((p) => p.canal === "propio").reduce((s, p) => s + p.total, 0);
    const comisionAhorro = hoy
      .filter((p) => p.canal === "propio")
      .reduce((s, p) => s + (p.total * 0.3), 0);
    return { total: hoy.length, propio, ag, factPropio, comisionAhorro };
  }, [pedidos]);

  const filteredPedidos = React.useMemo(() => {
    return pedidos.filter((p) => {
      if (filterCanal !== "todos" && p.canal !== filterCanal) return false;
      if (filterStatus !== "todos" && p.status !== filterStatus) return false;
      return true;
    });
  }, [pedidos, filterCanal, filterStatus]);

  function advanceStatus(id: string) {
    setPedidos((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const idx = STATUS_FLOW.indexOf(p.status);
        const next = STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)];
        return { ...p, status: next };
      })
    );
    const p = pedidos.find((x) => x.id === id);
    if (p) {
      const idx = STATUS_FLOW.indexOf(p.status);
      const next = STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)];
      toast({ title: "Estado actualizado", description: `${p.id} · ${STATUS_META[next].label}` });
    }
  }

  function toggleAgregador(id: Agregador) {
    setAgregadores((prev) =>
      prev.map((a) => (a.id === id ? { ...a, activo: !a.activo } : a))
    );
    const a = agregadores.find((x) => x.id === id);
    if (a) {
      toast({
        title: a.activo ? "Agregador pausado" : "Agregador activado",
        description: `${a.label} · ${a.activo ? "no recibirás pedidos" : "sincronizando menú"}`,
      });
    }
  }

  function assignRepartidor(pedidoId: string, repartidorNombre: string) {
    setPedidos((prev) =>
      prev.map((p) =>
        p.id === pedidoId ? { ...p, repartidor: repartidorNombre, status: "asignado" } : p
      )
    );
    toast({
      title: "Repartidor asignado",
      description: `${pedidoId} → ${repartidorNombre}`,
    });
    setSelectedPedidoId(null);
  }

  const selectedPedido = pedidos.find((p) => p.id === selectedPedidoId) ?? null;

  const t = reduce ? { duration: 0 } : { duration: 0.2, ease: "easeOut" as const };

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight">Delivery propio</h1>
            
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Reparto propio sin comisiones · 0% vs 30% agregadores · mapa en vivo, zonas y liquidación.
          </p>
        </div>
        <Badge variant="outline" className="border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)] font-mono text-[10px] uppercase tracking-wider">
          <Zap className="h-3 w-3" /> Pedidos hoy: {stats.total} · Propio: {stats.propio} · Agregadores: {stats.ag} · Ahorro: {eur(stats.comisionAhorro)}
        </Badge>
      </header>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rp-glass rounded-xl p-3 sm:p-4 flex items-start gap-3">
          <div className="rounded-lg p-2 bg-foreground/[0.04] text-[var(--rp-emerald-soft)]">
            <Bike className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">Pedidos propios</div>
            <div className="font-display text-xl">{stats.propio}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{eur(stats.factPropio)} facturado</div>
          </div>
        </div>
        <div className="rp-glass rounded-xl p-3 sm:p-4 flex items-start gap-3">
          <div className="rounded-lg p-2 bg-foreground/[0.04] text-[var(--rp-yellow-soft)]">
            <ShoppingCart className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">Pedidos agregadores</div>
            <div className="font-display text-xl">{stats.ag}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Glovo · Uber Eats</div>
          </div>
        </div>
        <div className="rp-glass rounded-xl p-3 sm:p-4 flex items-start gap-3">
          <div className="rounded-lg p-2 bg-foreground/[0.04] text-[var(--rp-violet-soft)]">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">Ahorro estimado</div>
            <div className="font-display text-xl text-[var(--rp-emerald-soft)]">{eur(stats.comisionAhorro)}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">vs agregadores (30%)</div>
          </div>
        </div>
        <div className="rp-glass rounded-xl p-3 sm:p-4 flex items-start gap-3">
          <div className="rounded-lg p-2 bg-foreground/[0.04] text-[var(--rp-blue-soft)]">
            <Timer className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">ETA media</div>
            <div className="font-display text-xl">28 min</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">−6 min vs agregadores</div>
          </div>
        </div>
      </div>

      {/* ROI Calculator */}
      <RoiCalculator />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5">
        {/* Pedidos panel */}
        <div className="space-y-3">
          <div className="rp-glass rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-[var(--rp-emerald-soft)]" />
                <h3 className="font-display text-base">Pedidos en curso</h3>
              </div>
              <div className="flex items-center gap-1">
                <select
                  value={filterCanal}
                  onChange={(e) => setFilterCanal(e.target.value as "todos" | "propio" | Agregador)}
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                >
                  <option value="todos">Todos los canales</option>
                  <option value="propio">Propio</option>
                  <option value="glovo">Glovo</option>
                  <option value="ubereats">Uber Eats</option>
                  <option value="justeat">Just Eat</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as DeliveryStatus | "todos")}
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                >
                  <option value="todos">Todos</option>
                  {STATUS_FLOW.map((s) => (
                    <option key={s} value={s}>{STATUS_META[s].label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5 max-h-[520px] overflow-y-auto rp-scroll-thin pr-1">
              <AnimatePresence>
                {filteredPedidos.map((p) => {
                  const meta = STATUS_META[p.status];
                  const stepIndex = STATUS_FLOW.indexOf(p.status);
                  return (
                    <motion.div
                      key={p.id}
                      layout
                      initial={reduce ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                      transition={t}
                      className="rounded-lg border border-border bg-foreground/[0.03] p-3 hover:bg-foreground/[0.05] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs text-muted-foreground">#{p.id}</span>
                            <span className="text-sm font-medium truncate">{p.cliente}</span>
                            {p.canal === "propio" ? (
                              <Badge variant="outline" className="text-[9px] font-mono uppercase tracking-wider border-[var(--rp-emerald)]/40 text-[var(--rp-emerald-soft)] bg-[var(--rp-emerald)]/10">
                                Propio
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[9px] font-mono uppercase tracking-wider border-[var(--rp-yellow)]/40 text-[var(--rp-yellow-soft)] bg-[var(--rp-yellow)]/10">
                                {p.canal === "glovo" ? "Glovo" : p.canal === "ubereats" ? "Uber Eats" : "Just Eat"}
                              </Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
                            <MapPin className="h-3 w-3" /> {p.direccion} · {p.zona}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {p.items} artículos · {eur(p.total)} {p.envio > 0 ? `+ ${eur(p.envio)} envío` : "· envío gratis"}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <Badge variant="outline" className={cn("text-[10px] font-mono", meta.cls)}>
                            <span className={cn("h-1.5 w-1.5 rounded-full mr-1", meta.dot)} />
                            {meta.label}
                          </Badge>
                          {p.ETA && (
                            <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-0.5 justify-end">
                              <Clock className="h-2.5 w-2.5" /> {p.ETA} min
                            </div>
                          )}
                          {p.repartidor && (
                            <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-0.5 justify-end">
                              <Bike className="h-2.5 w-2.5" /> {p.repartidor}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-2 flex items-center gap-0.5">
                        {STATUS_FLOW.map((s, i) => (
                          <div
                            key={s}
                            className={cn(
                              "h-1 flex-1 rounded-full transition-colors",
                              i <= stepIndex ? meta.dot : "bg-foreground/10"
                            )}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-muted-foreground font-mono">
                          hace {fmtTime(NOW - p.createdAt)}
                        </span>
                        <div className="flex items-center gap-1">
                          {p.status !== "entregado" && (
                            <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => setSelectedPedidoId(p.id)} disabled={p.canal !== "propio"}>
                              <Bike className="h-3 w-3" /> Asignar
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => advanceStatus(p.id)} disabled={p.status === "entregado"}>
                            <ChevronRight className="h-3 w-3" /> Avanzar
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {filteredPedidos.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-6">
                  Sin pedidos con estos filtros
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map + repartidores + zonas */}
        <div className="space-y-3">
          <LiveMap pedidos={pedidos} />

          {/* Repartidores */}
          <div className="rp-glass rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bike className="h-4 w-4 text-[var(--rp-violet-soft)]" />
                <h3 className="font-display text-base">Repartidores</h3>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                {REPARTIDORES.filter((r) => r.online).length} online · {REPARTIDORES.length} total
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REPARTIDORES.map((r) => (
                <div key={r.id} className={cn(
                  "rounded-lg border p-2.5",
                  r.online ? "border-border bg-foreground/[0.03]" : "border-border/50 bg-foreground/[0.02] opacity-70"
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className={cn(
                        "h-2 w-2 rounded-full shrink-0",
                        r.online ? "bg-[var(--rp-emerald)]" : "bg-zinc-500"
                      )} />
                      <span className="text-sm font-medium truncate">{r.nombre}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                      <Star className="h-2.5 w-2.5 text-[var(--rp-yellow-soft)] fill-[var(--rp-yellow)]" />
                      {r.rating}
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{r.zona}</span>
                    <span>{r.activos} pedidos</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Liquidación</span>
                    <span className="text-sm font-display text-[var(--rp-emerald-soft)]">{eur(r.liquidacion)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zonas */}
          <div className="rp-glass rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 text-[var(--rp-blue-soft)]" />
              <h3 className="font-display text-base">Zonas de reparto</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ZONAS.map((z) => (
                <div key={z.id} className="rounded-lg border border-border bg-foreground/[0.03] p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{z.nombre}</span>
                    <Badge variant="outline" className="text-[9px] font-mono uppercase tracking-wider">
                      {z.tipo}
                    </Badge>
                  </div>
                  <div className="mt-1.5 space-y-1 text-[11px] text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Mínimo</span><span className="font-mono text-foreground">{eur(z.minimo)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Envío</span><span className="font-mono text-foreground">{eur(z.envio)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Horario</span><span className="font-mono text-foreground">{z.horario}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border/50">
                      <span>Pedidos hoy</span><span className="font-mono text-[var(--rp-emerald-soft)]">{z.pedidosHoy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Agregadores + comparativa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rp-glass rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-[var(--rp-yellow-soft)]" />
            <h3 className="font-display text-base">Agregadores</h3>
          </div>
          <div className="space-y-2">
            {agregadores.map((a) => (
              <div
                key={a.id}
                className={cn(
                  "rounded-lg border p-3 flex items-center justify-between gap-3",
                  a.activo ? "border-border bg-foreground/[0.03]" : "border-border/50 bg-foreground/[0.02] opacity-70"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="rounded-lg p-2"
                    style={{ background: `color-mix(in oklab, ${a.color} 12%, transparent)`, color: a.color }}
                  >
                    <Store className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{a.label}</div>
                    <div className="text-[11px] text-muted-foreground">
                      Comisión {a.comision}% · {a.pedidosHoy} pedidos hoy
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Margen real</div>
                    <div className="font-display text-sm" style={{ color: a.color }}>{a.margenReal}%</div>
                  </div>
                  <Switch
                    checked={a.activo}
                    onCheckedChange={() => toggleAgregador(a.id)}
                    aria-label={`Activar ${a.label}`}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Sincronización de menú bidireccional · stocks y precios en tiempo real · agenda unificada de pedidos.
          </p>
        </div>

        <ComparativaRentabilidad />
      </div>

      {/* Assign repartidor dialog */}
      <Dialog open={!!selectedPedidoId} onOpenChange={(o) => !o && setSelectedPedidoId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Bike className="h-5 w-5 text-[var(--rp-violet-soft)]" />
              Asignar repartidor
            </DialogTitle>
            <DialogDescription>
              {selectedPedido ? `Pedido #${selectedPedido.id} · ${selectedPedido.cliente} · ${selectedPedido.direccion}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {REPARTIDORES.filter((r) => r.online).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => assignRepartidor(selectedPedidoId!, r.nombre)}
                className="w-full rounded-lg border border-border bg-foreground/[0.03] p-3 text-left hover:bg-foreground/[0.06] transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-[var(--rp-violet)]/15 p-1.5 text-[var(--rp-violet-soft)]">
                    <Bike className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{r.nombre}</div>
                    <div className="text-[11px] text-muted-foreground">{r.zona} · {r.rating}★</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {r.activos} activos
                </Badge>
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedPedidoId(null)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DeliveryView;
