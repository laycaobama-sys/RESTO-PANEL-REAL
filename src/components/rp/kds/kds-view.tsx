"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Snowflake, Flame, CookingPot, IceCream, Wine,
  Clock, ArrowRight, RotateCcw, Volume2, VolumeX,
  AlertTriangle, CheckCircle2, Star, Bell, ChevronRight,
  Hash, UtensilsCrossed, ChefHat, Gauge, TrendingUp,
  CalendarPlus, Sparkles, Ban, Plus, Minus, Eye,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type Partida = "frios" | "calientes" | "plancha" | "postres" | "barra";
type TicketStatus = "nuevo" | "preparando" | "listo" | "bumped";

interface KdsItem {
  id: string;
  name: string;
  qty: number;
  modifiers?: string[];
  note?: string;
}

interface KdsTicket {
  id: string;
  mesa: string;
  pax: number;
  partida: Partida;
  items: KdsItem[];
  status: TicketStatus;
  createdAt: number;
  startedAt?: number;
  readyAt?: number;
  hasReservation?: boolean;
  serverName?: string;
}

/* =========================================================
 * Constants
 * =======================================================*/
const PARTIDA_META: Record<
  Partida,
  { label: string; icon: React.ElementType; cls: string; ring: string }
> = {
  frios: {
    label: "Fríos",
    icon: Snowflake,
    cls: "text-[var(--rp-blue-soft)]",
    ring: "border-t-[var(--rp-blue)]/60",
  },
  calientes: {
    label: "Calientes",
    icon: CookingPot,
    cls: "text-[var(--rp-yellow-soft)]",
    ring: "border-t-[var(--rp-yellow)]/60",
  },
  plancha: {
    label: "Plancha",
    icon: Flame,
    cls: "text-[var(--rp-red-soft)]",
    ring: "border-t-[var(--rp-red)]/60",
  },
  postres: {
    label: "Postres",
    icon: IceCream,
    cls: "text-[var(--rp-violet-soft)]",
    ring: "border-t-[var(--rp-violet)]/60",
  },
  barra: {
    label: "Barra",
    icon: Wine,
    cls: "text-[var(--rp-emerald-soft)]",
    ring: "border-t-[var(--rp-emerald)]/60",
  },
};

const PARTIDAS: Partida[] = ["frios", "calientes", "plancha", "postres", "barra"];

const NOW = Date.now();
const MIN = 60 * 1000;

const INITIAL_TICKETS: KdsTicket[] = [
  {
    id: "t1",
    mesa: "Mesa 5",
    pax: 6,
    partida: "frios",
    status: "preparando",
    createdAt: NOW - 8 * MIN,
    startedAt: NOW - 7 * MIN,
    hasReservation: true,
    serverName: "Marc",
    items: [
      { id: "i1", name: "Ensalada César", qty: 2, modifiers: ["sin picatosto"] },
      { id: "i2", name: "Tartar de atún", qty: 2, note: "una sin aguacate" },
      { id: "i3", name: "Croquetas jamón", qty: 6 },
    ],
  },
  {
    id: "t2",
    mesa: "Mesa 3",
    pax: 4,
    partida: "calientes",
    status: "nuevo",
    createdAt: NOW - 1 * MIN,
    hasReservation: true,
    serverName: "Anna",
    items: [
      { id: "i4", name: "Risotto setas", qty: 2, modifiers: ["extra parmesano"] },
      { id: "i5", name: "Paella valenciana", qty: 1 },
      { id: "i6", name: "Bacalao confitado", qty: 1, note: "alérgico tomate" },
    ],
  },
  {
    id: "t3",
    mesa: "Mesa 2",
    pax: 2,
    partida: "plancha",
    status: "preparando",
    createdAt: NOW - 12 * MIN,
    startedAt: NOW - 11 * MIN,
    serverName: "Marc",
    items: [
      { id: "i7", name: "Secreto ibérico", qty: 1, modifiers: ["poco hecho"] },
      { id: "i8", name: "Entrecot 400g", qty: 1, modifiers: ["al punto"], note: "salsa pimienta aparte" },
    ],
  },
  {
    id: "t4",
    mesa: "Mesa 9",
    pax: 5,
    partida: "plancha",
    status: "nuevo",
    createdAt: NOW - 2 * MIN,
    serverName: "Laia",
    items: [
      { id: "i9", name: "Hamburguesa madurada", qty: 2, modifiers: ["poco hecha"] },
      { id: "i10", name: "Pollo al ast", qty: 1 },
      { id: "i11", name: "Secreto ibérico", qty: 2, modifiers: ["al punto"] },
    ],
  },
  {
    id: "t5",
    mesa: "Mesa 1",
    pax: 2,
    partida: "postres",
    status: "listo",
    createdAt: NOW - 6 * MIN,
    startedAt: NOW - 5 * MIN,
    readyAt: NOW - 30 * 1000,
    serverName: "Anna",
    items: [
      { id: "i12", name: "Tarta de queso", qty: 1 },
      { id: "i13", name: "Brownie helado", qty: 1, modifiers: ["helado de fresa"] },
    ],
  },
  {
    id: "t6",
    mesa: "Mesa 8",
    pax: 3,
    partida: "barra",
    status: "nuevo",
    createdAt: NOW - 30 * 1000,
    serverName: "Pau",
    items: [
      { id: "i14", name: "Gintonic premium", qty: 2 },
      { id: "i15", name: "Copa de vino", qty: 1, modifiers: ["tinto"] },
    ],
  },
  {
    id: "t7",
    mesa: "Mesa 7",
    pax: 4,
    partida: "calientes",
    status: "preparando",
    createdAt: NOW - 18 * MIN,
    startedAt: NOW - 17 * MIN,
    serverName: "Marc",
    items: [
      { id: "i16", name: "Pizza margarita", qty: 2 },
      { id: "i17", name: "Risotto setas", qty: 1 },
      { id: "i18", name: "Paella valenciana", qty: 1 },
    ],
  },
  {
    id: "t8",
    mesa: "Mesa 4",
    pax: 2,
    partida: "frios",
    status: "nuevo",
    createdAt: NOW - 4 * MIN,
    serverName: "Anna",
    items: [
      { id: "i19", name: "Ensalada César", qty: 1 },
      { id: "i20", name: "Croquetas jamón", qty: 2, modifiers: ["media ración"] },
    ],
  },
];

/* =========================================================
 * Helpers
 * =======================================================*/
function fmtTimer(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${String(sec).padStart(2, "0")}`;
}

function timerTone(ms: number): { color: string; label: string } {
  const min = ms / 60000;
  if (min < 10) return { color: "text-[var(--rp-emerald-soft)]", label: "A tiempo" };
  if (min < 15) return { color: "text-[var(--rp-yellow-soft)]", label: "Atención" };
  return { color: "text-[var(--rp-red-soft)]", label: "Retrasado" };
}

function timerDot(ms: number): string {
  const min = ms / 60000;
  if (min < 10) return "bg-[var(--rp-emerald)]";
  if (min < 15) return "bg-[var(--rp-yellow)]";
  return "bg-[var(--rp-red)] animate-pulse";
}

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

/* =========================================================
 * Stats bar
 * =======================================================*/
function StatChip({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone: "emerald" | "yellow" | "red" | "blue";
}) {
  const toneMap: Record<typeof tone, string> = {
    emerald: "text-[var(--rp-emerald-soft)]",
    yellow: "text-[var(--rp-yellow-soft)]",
    red: "text-[var(--rp-red-soft)]",
    blue: "text-[var(--rp-blue-soft)]",
  };
  return (
    <div className="rp-glass rounded-xl px-3 py-2 flex items-center gap-2">
      <Icon className={cn("h-4 w-4", toneMap[tone])} />
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{label}</div>
        <div className="font-display text-base leading-none mt-0.5">{value}</div>
      </div>
    </div>
  );
}

/* =========================================================
 * Ticket card
 * =======================================================*/
function TicketCard({
  ticket,
  onBump,
  onRecall,
}: {
  ticket: KdsTicket;
  onBump: (id: string) => void;
  onRecall: (id: string) => void;
}) {
  const reduce = useReducedMotion();
  const [elapsed, setElapsed] = React.useState(Date.now() - ticket.createdAt);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setElapsed(Date.now() - ticket.createdAt);
    }, 1000);
    return () => window.clearInterval(id);
  }, [ticket.createdAt]);

  const tone = timerTone(elapsed);
  const meta = PARTIDA_META[ticket.partida];
  const isListo = ticket.status === "listo";
  const isBumped = ticket.status === "bumped";

  return (
    <motion.div
      layout
      initial={reduce ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
      transition={{ duration: reduce ? 0 : 0.2, ease: "easeOut" }}
      className={cn(
        "rp-glass rounded-xl border-t-2 p-3 space-y-2.5",
        meta.ring,
        isListo && "ring-2 ring-[var(--rp-emerald)]/50",
        isBumped && "opacity-50"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-display text-base">{ticket.mesa}</span>
            {ticket.hasReservation && (
              <span title="Con reserva">
                <Star className="h-3 w-3 text-[var(--rp-yellow-soft)] fill-[var(--rp-yellow)]" />
              </span>
            )}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mt-0.5">
            {ticket.pax} pax · {ticket.serverName ?? "—"}
          </div>
        </div>
        <div className="text-right">
          <div className={cn("font-mono text-lg font-semibold tabular-nums", tone.color)}>
            {fmtTimer(elapsed)}
          </div>
          <div className={cn("text-[10px] uppercase tracking-wider font-mono flex items-center gap-1 justify-end", tone.color)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", timerDot(elapsed))} />
            {tone.label}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1.5">
        {ticket.items.map((item) => (
          <div key={item.id} className="rounded-md bg-foreground/[0.04] p-2 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-[var(--rp-emerald-soft)] font-medium">{item.qty}×</span>
                <span className="font-medium">{item.name}</span>
              </div>
            </div>
            {item.modifiers && item.modifiers.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {item.modifiers.map((m) => (
                  <Badge key={m} variant="outline" className="text-[9px] px-1 py-0 h-4 font-mono border-[var(--rp-yellow)]/40 text-[var(--rp-yellow-soft)] bg-[var(--rp-yellow)]/10">
                    {m}
                  </Badge>
                ))}
              </div>
            )}
            {item.note && (
              <div className="text-[11px] text-[var(--rp-red-soft)] italic mt-1 flex items-center gap-1">
                <AlertTriangle className="h-2.5 w-2.5" /> {item.note}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        {!isBumped && !isListo && (
          <Button
            size="sm"
            variant={ticket.status === "nuevo" ? "outline" : "default"}
            onClick={() => onBump(ticket.id)}
            className={cn(
              "flex-1 h-8",
              ticket.status === "nuevo"
                ? "border-[var(--rp-yellow)]/40 text-[var(--rp-yellow-soft)] hover:bg-[var(--rp-yellow)]/10"
                : "bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
            )}
          >
            {ticket.status === "nuevo" ? (
              <>
                <ChefHat className="h-3.5 w-3.5" /> Empezar
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" /> Listo · Bump
              </>
            )}
          </Button>
        )}
        {isListo && (
          <Button
            size="sm"
            onClick={() => onBump(ticket.id)}
            className="flex-1 h-8 bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Bump
          </Button>
        )}
        {isBumped && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRecall(ticket.id)}
            className="flex-1 h-8 border-[var(--rp-blue)]/40 text-[var(--rp-blue-soft)] hover:bg-[var(--rp-blue)]/10"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Recall
          </Button>
        )}
      </div>
    </motion.div>
  );
}

/* =========================================================
 * Main view
 * =======================================================*/
export function KdsView() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [tickets, setTickets] = React.useState<KdsTicket[]>(INITIAL_TICKETS);
  const [soundOn, setSoundOn] = React.useState(true);
  const [recalledIds, setRecalledIds] = React.useState<Set<string>>(new Set());

  // Global clock tick to re-render timers every second
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Sound a "ready" notification when a ticket transitions to listo
  const previousReady = React.useRef<Set<string>>(new Set());
  React.useEffect(() => {
    const currentReady = new Set(tickets.filter((t) => t.status === "listo").map((t) => t.id));
    const newlyReady = [...currentReady].filter((id) => !previousReady.current.has(id));
    previousReady.current = currentReady;
    if (newlyReady.length > 0 && soundOn) {
      const t = tickets.find((x) => x.id === newlyReady[0]);
      if (t) {
        toast({
          title: "Plato listo",
          description: `${t.mesa} · avisa a sala`,
        });
      }
    }
  }, [tickets, soundOn, toast]);

  // Derived stats
  const activeTickets = tickets.filter((t) => t.status !== "bumped").length;
  const retrasados = tickets.filter(
    (t) => t.status !== "bumped" && Date.now() - t.createdAt > 15 * MIN
  ).length;
  const avgTime = React.useMemo(() => {
    const finished = tickets.filter((t) => t.readyAt);
    if (finished.length === 0) return 0;
    const sum = finished.reduce((s, t) => s + ((t.readyAt ?? 0) - t.createdAt), 0);
    return Math.round(sum / finished.length / MIN);
  }, [tickets]);

  function bumpTicket(id: string) {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.status === "nuevo") {
          return { ...t, status: "preparando", startedAt: Date.now() };
        }
        if (t.status === "preparando") {
          return { ...t, status: "listo", readyAt: Date.now() };
        }
        // listo → bumped
        return { ...t, status: "bumped" };
      })
    );
    const t = tickets.find((x) => x.id === id);
    if (t) {
      const wasListo = t.status === "listo";
      toast({
        title: wasListo ? "Ticket bumped" : t.status === "nuevo" ? "En preparación" : "Listo para servir",
        description: `${t.mesa} · ${t.items.length} platos`,
      });
    }
  }

  function recallTicket(id: string) {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: "preparando", readyAt: undefined, startedAt: Date.now() }
          : t
      )
    );
    setRecalledIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    toast({ title: "Recall", description: `Ticket reabierto en preparación` });
  }

  function clearBumped() {
    setTickets((prev) => prev.filter((t) => t.status !== "bumped"));
    toast({ title: "Histórico limpiado" });
  }

  const t = reduce ? { duration: 0 } : { duration: 0.2, ease: "easeOut" as const };

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight">KDS · Cocina</h1>
            <DemoBadge />
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Display de cocina por partida. Bump, recall y semáforo de tiempos.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setSoundOn((v) => !v)}>
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {soundOn ? "Sonido on" : "Silencio"}
          </Button>
          <Button variant="outline" size="sm" onClick={clearBumped}>
            <RotateCcw className="h-4 w-4" /> Limpiar bumped
          </Button>
        </div>
      </header>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatChip icon={UtensilsCrossed} label="Tickets activos" value={`${activeTickets}`} tone="emerald" />
        <StatChip icon={Gauge} label="Tiempo medio" value={`${avgTime} min`} tone="blue" />
        <StatChip icon={AlertTriangle} label="Retrasados" value={`${retrasados}`} tone="red" />
        <StatChip icon={TrendingUp} label="Bumped hoy" value={`${tickets.filter((x) => x.status === "bumped").length}`} tone="yellow" />
      </div>

      {/* Priorización hint */}
      {tickets.some((t) => t.hasReservation && t.status !== "bumped") && (
        <div className="rp-glass rounded-xl p-3 flex items-center gap-3 border-l-4 border-l-[var(--rp-yellow)]/60">
          <Star className="h-4 w-4 text-[var(--rp-yellow-soft)] fill-[var(--rp-yellow)]" />
          <div className="text-sm flex-1">
            <span className="font-medium">Priorización activa</span>
            <span className="text-muted-foreground ml-2">
              Tickets con reserva resaltados · alta rotación necesaria
            </span>
          </div>
        </div>
      )}

      {/* Columns by partida */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {PARTIDAS.map((p) => {
          const meta = PARTIDA_META[p];
          const colTickets = tickets.filter((t) => t.partida === p && t.status !== "bumped");
          const bumpedTickets = tickets.filter((t) => t.partida === p && t.status === "bumped");
          return (
            <div key={p} className="space-y-2.5">
              {/* Column header */}
              <div className={cn("rp-glass rounded-xl p-3 border-t-2 sticky top-0 z-10", meta.ring)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <meta.icon className={cn("h-4 w-4", meta.cls)} />
                    <span className="font-display text-sm font-medium">{meta.label}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono h-5">
                    {colTickets.length}
                  </Badge>
                </div>
              </div>

              {/* Ticket cards */}
              <div className="space-y-2.5">
                <AnimatePresence>
                  {colTickets
                    .slice()
                    .sort((a, b) => {
                      // Reservation first, then by createdAt asc
                      if (a.hasReservation && !b.hasReservation) return -1;
                      if (!a.hasReservation && b.hasReservation) return 1;
                      return a.createdAt - b.createdAt;
                    })
                    .map((ticket) => (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        onBump={bumpTicket}
                        onRecall={recallTicket}
                      />
                    ))}
                </AnimatePresence>
                {colTickets.length === 0 && (
                  <div className="rp-glass rounded-xl p-4 text-center text-xs text-muted-foreground">
                    Sin tickets
                  </div>
                )}
              </div>

              {/* Bumped history */}
              {bumpedTickets.length > 0 && (
                <details className="rp-glass rounded-xl p-2 text-xs">
                  <summary className="cursor-pointer text-muted-foreground font-mono uppercase tracking-wider text-[10px]">
                    Bumped ({bumpedTickets.length})
                  </summary>
                  <div className="mt-2 space-y-1">
                    {bumpedTickets.map((b) => (
                      <div key={b.id} className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">{b.mesa}</span>
                        <Button size="sm" variant="ghost" className="h-5 text-[10px] px-1" onClick={() => recallTicket(b.id)}>
                          <RotateCcw className="h-2.5 w-2.5" /> recall
                        </Button>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default KdsView;
