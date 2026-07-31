"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  CalendarDays, Users, Minus, Plus, Search, Clock, MapPin,
  Sun, UtensilsCrossed, Moon, Sparkles, CheckCircle2, XCircle,
  Hourglass, Armchair, ChevronRight, ShieldCheck, LayoutGrid,
  AlertCircle, Crown, TrendingUp, Lock, Timer,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type ServicePeriod = "desayuno" | "comida" | "cena" | "completo";
type SlotStatus = "available" | "limited" | "full" | "blocked";

interface AvailabilitySlot {
  time: string;
  service: Exclude<ServicePeriod, "completo">;
  available: number;
  total: number;
  status: SlotStatus;
  tablesAvailable: number;
  waitlistCount: number;
}

interface AvailabilitySearch {
  date: string;
  partySize: number;
  service: ServicePeriod;
  zonePreference?: string;
  durationMinutes: number;
}

/* =========================================================
 * Static config
 * =======================================================*/
const SERVICE_PERIODS: {
  id: Exclude<ServicePeriod, "completo">;
  label: string;
  icon: React.ElementType;
  start: string;
  end: string;
  capacity: number;
  tables: number;
  tone: "amber" | "gold" | "teal";
}[] = [
  { id: "desayuno", label: "Desayuno", icon: Sun, start: "08:00", end: "11:30", capacity: 40, tables: 12, tone: "amber" },
  { id: "comida", label: "Comida", icon: UtensilsCrossed, start: "13:00", end: "16:00", capacity: 80, tables: 24, tone: "gold" },
  { id: "cena", label: "Cena", icon: Moon, start: "20:00", end: "23:30", capacity: 80, tables: 24, tone: "teal" },
];

const ZONES = ["Todas", "Sala principal", "Terraza", "VIP", "Barra"] as const;
const DURATIONS = [60, 90, 120, 150] as const;
const INTERVALS = [5, 10, 15, 30] as const;

const SERVICE_TONE: Record<Exclude<ServicePeriod, "completo">, { text: string; bg: string; border: string; dot: string }> = {
  desayuno: { text: "text-amber-300", bg: "bg-amber-400/10", border: "border-amber-400/30", dot: "bg-amber-400" },
  comida: { text: "rp-gold-text", bg: "bg-[var(--gold)]/10", border: "border-[var(--gold)]/30", dot: "bg-[var(--gold)]" },
  cena: { text: "rp-teal-text", bg: "bg-[var(--teal)]/10", border: "border-[var(--teal)]/30", dot: "bg-[var(--teal)]" },
};

const STATUS_TONE: Record<SlotStatus, { text: string; border: string; bg: string; dot: string; label: string }> = {
  available: { text: "text-emerald-300", border: "border-emerald-400/40", bg: "bg-emerald-400/[0.06]", dot: "bg-emerald-400", label: "Disponible" },
  limited: { text: "text-amber-300", border: "border-amber-400/40", bg: "bg-amber-400/[0.06]", dot: "bg-amber-400", label: "Limitado" },
  full: { text: "text-rose-300", border: "border-rose-400/40", bg: "bg-rose-400/[0.06]", dot: "bg-rose-400", label: "Completo" },
  blocked: { text: "text-muted-foreground", border: "border-foreground/15", bg: "bg-foreground/[0.03]", dot: "bg-muted-foreground", label: "Bloqueado" },
};

/* =========================================================
 * Time helpers
 * =======================================================*/
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
function toHHMM(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function formatDateLabel(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
}

/* =========================================================
 * Demo slot generation (deterministic-ish, realistic)
 * =======================================================*/
function generateSlots(opts: {
  service: Exclude<ServicePeriod, "completo">;
  interval: number;
  partySize: number;
  durationMinutes: number;
}): AvailabilitySlot[] {
  const period = SERVICE_PERIODS.find((p) => p.id === opts.service)!;
  const start = toMinutes(period.start);
  const end = toMinutes(period.end);
  // last slot must leave room for durationMinutes; we still generate to end for demo
  const slots: AvailabilitySlot[] = [];
  const total = period.capacity;

  // Seed peaks: lunch peak ~14:00, dinner peak ~21:30, breakfast peak ~10:00
  const peakMin = opts.service === "desayuno" ? 10 * 60 : opts.service === "comida" ? 14 * 60 : 21 * 60 + 30;

  for (let t = start; t + 30 <= end; t += opts.interval) {
    const distance = Math.abs(t - peakMin);
    // demand factor: 1 at peak, falls off with distance
    const sigma = opts.service === "cena" ? 90 : 75;
    const demand = Math.exp(-(distance * distance) / (2 * sigma * sigma));
    // small deterministic pseudo-noise
    const noise = (Math.sin(t * 1.7) + Math.cos(t * 0.9)) * 0.08;
    const occupancy = Math.min(0.98, Math.max(0.04, demand * 0.92 + 0.05 + noise));
    let available = Math.round(total * (1 - occupancy));

    // small parties fit more easily
    if (opts.partySize <= 2) available = Math.min(total, available + 4);
    if (opts.partySize >= 7) available = Math.max(0, available - 6);

    // manual blocks at certain times
    const blockedTables = (t === toMinutes("13:25") && opts.service === "comida") ||
      (t === toMinutes("21:05") && opts.service === "cena") ||
      (t === toMinutes("10:15") && opts.service === "desayuno");

    let status: SlotStatus;
    if (blockedTables) status = "blocked";
    else if (available <= 0) status = "full";
    else if (available < opts.partySize || available < total * 0.18) status = "limited";
    else status = "available";

    const tablesTotal = period.tables;
    const tablesAvailable =
      status === "blocked" ? 0 : Math.max(0, Math.round((available / total) * tablesTotal));

    const waitlistCount =
      status === "full" ? 3 + (t % 4) : status === "limited" ? (t % 2 === 0 ? 1 : 0) : 0;

    slots.push({
      time: toHHMM(t),
      service: opts.service,
      available: status === "blocked" ? 0 : available,
      total,
      status,
      tablesAvailable,
      waitlistCount,
    });
  }
  return slots;
}

/* =========================================================
 * Capacity summary demo data
 * =======================================================*/
const CAPACITY_DEMO: Record<Exclude<ServicePeriod, "completo">, { capacity: number; occupied: number; peak: string }> = {
  desayuno: { capacity: 40, occupied: 11, peak: "10:00 — 10:30" },
  comida: { capacity: 80, occupied: 64, peak: "14:00 — 14:30" },
  cena: { capacity: 80, occupied: 72, peak: "21:30 — 22:00" },
};

const RULES = [
  { icon: Clock, label: "Duración mínima: 60 min" },
  { icon: Timer, label: "Tiempo de limpieza: 15 min entre servicios" },
  { icon: Users, label: "Máximo por mesa: 8 comensales" },
  { icon: Lock, label: "Bloqueos manuales: 2 mesas (M5, M12)" },
  { icon: Crown, label: "Eventos especiales: Noche de gala 20:00–23:00 (zona VIP bloqueada)" },
];

/* =========================================================
 * Component
 * =======================================================*/
export function AvailabilityEngine() {
  const reduce = useReducedMotion();
  const { toast } = useToast();

  const [date, setDate] = React.useState(todayISO());
  const [partySize, setPartySize] = React.useState(4);
  const [service, setService] = React.useState<ServicePeriod>("comida");
  const [zone, setZone] = React.useState<string>("Todas");
  const [duration, setDuration] = React.useState<number>(90);
  const [interval, setIntervalMin] = React.useState<number>(5);

  const [loading, setLoading] = React.useState(false);
  const [slots, setSlots] = React.useState<AvailabilitySlot[] | null>(null);
  const [selected, setSelected] = React.useState<AvailabilitySlot | null>(null);
  const [confirmed, setConfirmed] = React.useState<string | null>(null);
  const [rulesOpen, setRulesOpen] = React.useState(false);

  const servicesToShow = service === "completo"
    ? SERVICE_PERIODS.map((p) => p.id)
    : [service as Exclude<ServicePeriod, "completo">];

  function handleSearch() {
    setLoading(true);
    setSlots(null);
    setSelected(null);
    setConfirmed(null);
    setTimeout(() => {
      const period = service === "completo" ? "comida" : service;
      const generated = generateSlots({
        service: period,
        interval,
        partySize,
        durationMinutes: duration,
      });
      setSlots(generated);
      setLoading(false);
      toast({
        title: "Disponibilidad calculada",
        description: `${generated.length} slots · ${period} · cada ${interval} min`,
      });
    }, 1000);
  }

  function handleConfirm() {
    if (!selected) return;
    const code = `RES-2025-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setConfirmed(code);
    toast({
      title: "Reserva creada (demo)",
      description: `${code} · ${selected.time} · ${partySize} pax`,
    });
  }

  return (
    <div className="space-y-6">
      <Header />

      {/* Search panel */}
      <div className="rp-glass rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <Search className="h-4 w-4 rp-gold-text" />
          <h3 className="font-display text-lg sm:text-xl font-medium">Parámetros de búsqueda</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Date */}
          <div className="space-y-2">
            <Label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> Fecha
            </Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-background/60 font-mono"
            />
            <p className="text-[11px] text-muted-foreground capitalize">{formatDateLabel(date)}</p>
          </div>

          {/* Party size */}
          <div className="space-y-2">
            <Label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> Comensales
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                disabled={partySize <= 1}
                aria-label="Quitar comensal"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 h-10 rounded-md border border-input bg-background/60 flex items-center justify-center font-display text-xl tabular-nums">
                {partySize}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={() => setPartySize((p) => Math.min(20, p + 1))}
                disabled={partySize >= 20}
                aria-label="Añadir comensal"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">Entre 1 y 20 comensales</p>
          </div>

          {/* Zone */}
          <div className="space-y-2">
            <Label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Zona preferente
            </Label>
            <Select value={zone} onValueChange={setZone}>
              <SelectTrigger className="bg-background/60">
                <SelectValue placeholder="Zona" />
              </SelectTrigger>
              <SelectContent>
                {ZONES.map((z) => (
                  <SelectItem key={z} value={z}>{z}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">Filtra por zona si lo necesitas</p>
          </div>
        </div>

        {/* Service segmented control */}
        <div className="mt-5 space-y-2">
          <Label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Servicio
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["completo", "desayuno", "comida", "cena"] as ServicePeriod[]).map((s) => {
              const active = service === s;
              const label = s === "completo" ? "Día completo" : s.charAt(0).toUpperCase() + s.slice(1);
              const Icon = s === "completo" ? LayoutGrid : s === "desayuno" ? Sun : s === "comida" ? UtensilsCrossed : Moon;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setService(s)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all min-h-[44px]",
                    active
                      ? "border-[var(--gold)]/60 bg-[var(--gold)]/12 text-[var(--gold-soft)] rp-glow-gold"
                      : "border-border/60 bg-background/40 text-muted-foreground hover:text-foreground hover:border-foreground/30"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration + Interval */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Duración de la reserva
            </Label>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  aria-pressed={duration === d}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-sm font-mono transition-all min-h-[36px]",
                    duration === d
                      ? "border-[var(--gold)]/50 bg-[var(--gold)]/10 text-[var(--gold-soft)]"
                      : "border-border/60 bg-background/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5" /> Intervalo de slots
            </Label>
            <div className="flex flex-wrap gap-2">
              {INTERVALS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIntervalMin(i)}
                  aria-pressed={interval === i}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-sm font-mono transition-all min-h-[36px]",
                    interval === i
                      ? "border-[var(--teal)]/50 bg-[var(--teal)]/10 text-[var(--teal)]"
                      : "border-border/60 bg-background/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {i} min
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">Intervalo: cada {interval} minutos</p>
          </div>
        </div>

        {/* Search button */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <Button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="min-h-[44px] bg-[var(--gold)] text-[#1a1a1a] hover:bg-[var(--gold-soft)] font-medium shadow-[0_8px_30px_-12px_rgba(212,175,55,0.55)] sm:px-6"
          >
            {loading ? (
              <>
                <motion.span
                  animate={reduce ? {} : { rotate: 360 }}
                  transition={reduce ? {} : { repeat: Infinity, duration: 0.9, ease: "linear" }}
                  className="inline-block"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                </motion.span>
                Calculando disponibilidad…
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Buscar disponibilidad
              </>
            )}
          </Button>
          <p className="text-[11px] text-muted-foreground font-mono">
            Motor atómico · anti-overbooking · 1s
          </p>
        </div>
      </div>

      {/* Service periods info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SERVICE_PERIODS.map((p) => {
          const active = servicesToShow.includes(p.id);
          const Icon = p.icon;
          const tone = SERVICE_TONE[p.id];
          return (
            <motion.div
              key={p.id}
              animate={reduce ? {} : { opacity: active ? 1 : 0.5, scale: active ? 1 : 0.98 }}
              transition={{ duration: 0.25 }}
              className={cn(
                "rounded-2xl border p-5 transition-colors",
                active
                  ? cn(tone.border, tone.bg, "rp-glass")
                  : "border-border/40 bg-background/30"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", active ? tone.text : "text-muted-foreground")} />
                  <span className={cn("font-display text-lg font-medium", active ? tone.text : "text-foreground")}>
                    {p.label}
                  </span>
                </div>
                {active && (
                  <span className={cn("text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border", tone.border, tone.text)}>
                    Activo
                  </span>
                )}
              </div>
              <div className="mt-3 font-mono text-sm text-foreground/80">
                {p.start} — {p.end}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Capacidad</div>
                  <div className={cn("font-display text-xl mt-0.5", active ? tone.text : "")}>{p.capacity}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Mesas</div>
                  <div className={cn("font-display text-xl mt-0.5", active ? tone.text : "")}>{p.tables}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Results grid */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            className="rp-glass rounded-2xl p-8 text-center"
          >
            <div className="flex flex-col items-center gap-3">
              <motion.div
                animate={reduce ? {} : { rotate: 360 }}
                transition={reduce ? {} : { repeat: Infinity, duration: 1.1, ease: "linear" }}
                className="h-10 w-10 rounded-full border-2 border-[var(--gold)]/30 border-t-[var(--gold)]"
              />
              <p className="text-sm text-muted-foreground font-mono">
                Verificando capacidad · aplicando reglas…
              </p>
            </div>
          </motion.div>
        )}

        {!loading && slots && slots.length > 0 && (
          <motion.div
            key="results"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            className="rp-glass rounded-2xl p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 rp-gold-text" />
                <h3 className="font-display text-lg sm:text-xl font-medium">
                  Slots disponibles
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                <span>{slots.length} slots</span>
                <span className="opacity-40">·</span>
                <span>cada {interval} min</span>
                <span className="opacity-40">·</span>
                <span className="capitalize">{slots[0].service}</span>
              </div>
            </div>

            {/* Horizontal scrollable timeline */}
            <div className="overflow-x-auto rp-scroll-thin -mx-2 px-2 pb-3">
              <div className="flex gap-3 min-w-max">
                {slots.map((slot, idx) => {
                  const tone = SERVICE_TONE[slot.service];
                  const status = STATUS_TONE[slot.status];
                  const isSelected = selected?.time === slot.time;
                  const clickable = slot.status === "available" || slot.status === "limited";
                  return (
                    <motion.button
                      key={slot.time}
                      type="button"
                      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={reduce ? { duration: 0.001 } : { duration: 0.22, delay: Math.min(idx * 0.012, 0.4) }}
                      onClick={() => clickable && handleSelectSlot(slot)}
                      disabled={!clickable}
                      aria-label={`Slot ${slot.time} · ${STATUS_TONE[slot.status].label} · ${slot.available} plazas`}
                      className={cn(
                        "relative w-[164px] shrink-0 rounded-xl border p-3.5 text-left transition-all",
                        status.border, status.bg,
                        clickable && "hover:scale-[1.02] hover:shadow-lg cursor-pointer",
                        !clickable && "opacity-60 cursor-not-allowed",
                        isSelected && "ring-2 ring-[var(--gold)] ring-offset-2 ring-offset-background"
                      )}
                    >
                      {/* Time */}
                      <div className="flex items-baseline justify-between">
                        <span className="font-mono text-xl font-medium tabular-nums">{slot.time}</span>
                        <span className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider", tone.border, tone.text, tone.bg)}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
                          {slot.service}
                        </span>
                      </div>

                      {/* Status + available seats */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", status.dot)} />
                        <span className={cn("text-xs font-mono uppercase tracking-wider", status.text)}>
                          {status.label}
                        </span>
                      </div>
                      <div className="mt-1.5 font-display text-2xl tabular-nums">
                        {slot.available}
                        <span className="text-xs text-muted-foreground font-sans ml-1">/ {slot.total} plazas</span>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-2 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", status.dot)}
                          style={{ width: `${Math.min(100, (slot.available / slot.total) * 100)}%` }}
                        />
                      </div>

                      {/* Tables + waitlist */}
                      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Armchair className="h-3 w-3" />
                          {slot.tablesAvailable} mesas
                        </span>
                        {slot.waitlistCount > 0 ? (
                          <span className="flex items-center gap-1 text-amber-300">
                            <Hourglass className="h-3 w-3" />
                            {slot.waitlistCount} en espera
                          </span>
                        ) : (
                          <span className="opacity-0">·</span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-mono text-muted-foreground">
              {(["available", "limited", "full", "blocked"] as SlotStatus[]).map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5">
                  <span className={cn("h-2 w-2 rounded-full", STATUS_TONE[s].dot)} />
                  {STATUS_TONE[s].label}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {!loading && slots && slots.length === 0 && (
          <div className="rp-glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
            No hay slots disponibles para los criterios seleccionados.
          </div>
        )}
      </AnimatePresence>

      {/* Selected slot panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="selected"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
            className="rp-glass-strong rounded-2xl p-5 sm:p-6 border-l-2 border-[var(--gold)]"
          >
            {confirmed ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-400/15 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                      Reserva confirmada (demo)
                    </div>
                    <div className="font-display text-2xl rp-gold-text">{confirmed}</div>
                  </div>
                </div>
                <div className="sm:ml-auto text-sm text-muted-foreground">
                  {formatDateLabel(date)} · <span className="font-mono">{selected.time}</span> · {partySize} pax · {duration} min · {zone}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="h-4 w-4 rp-gold-text" />
                  <h3 className="font-display text-lg sm:text-xl font-medium">Crear reserva</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
                  <Detail label="Fecha" value={<span className="capitalize">{formatDateLabel(date)}</span>} />
                  <Detail label="Hora" value={<span className="font-mono text-lg">{selected.time}</span>} />
                  <Detail label="Servicio" value={<span className="capitalize">{selected.service}</span>} />
                  <Detail label="Comensales" value={`${partySize} pax`} />
                  <Detail label="Duración" value={`${duration} min`} />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <Button
                    type="button"
                    onClick={handleConfirm}
                    className="min-h-[44px] bg-[var(--gold)] text-[#1a1a1a] hover:bg-[var(--gold-soft)] font-medium sm:px-6"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirmar reserva
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-[44px] text-muted-foreground hover:text-foreground"
                  >
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Ver en plano
                  </Button>
                  <div className="sm:ml-auto flex items-center gap-2 text-[11px] font-mono text-emerald-300/90">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Reserva atómica verificada · Sin solapamientos · Capacidad garantizada</span>
                    <span className="sm:hidden">Verificada · Sin overbooking</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Capacity summary */}
      <div className="rp-glass rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="h-4 w-4 rp-teal-text" />
          <h3 className="font-display text-lg sm:text-xl font-medium">Resumen de capacidad</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SERVICE_PERIODS.map((p) => {
            const data = CAPACITY_DEMO[p.id];
            const pct = Math.round((data.occupied / data.capacity) * 100);
            const tone = SERVICE_TONE[p.id];
            const Icon = p.icon;
            const busy = pct > 75;
            return (
              <div key={p.id} className="rounded-xl border border-border/50 bg-background/40 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", tone.text)} />
                    <span className="font-medium">{p.label}</span>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {busy ? "Alta demanda" : "Operativo"}
                  </Badge>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-2xl">{data.occupied}</span>
                  <span className="text-xs text-muted-foreground">/ {data.capacity} plazas</span>
                  <span className={cn("ml-auto text-sm font-mono", busy ? "text-amber-300" : "text-emerald-300")}>
                    {pct}%
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-foreground/10 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", busy ? "bg-amber-400" : "bg-emerald-400")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Hora pico: <span className="font-mono text-foreground/80">{data.peak}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rules applied (collapsible) */}
      <Collapsible open={rulesOpen} onOpenChange={setRulesOpen} className="rp-glass rounded-2xl">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-5 sm:p-6 text-left">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 rp-gold-text" />
              <h3 className="font-display text-lg sm:text-xl font-medium">Reglas aplicadas</h3>
              <Badge variant="outline" className="ml-2 font-mono text-[10px]">{RULES.length} reglas</Badge>
            </div>
            <motion.div animate={reduce ? {} : { rotate: rulesOpen ? 90 : 0 }} className="text-muted-foreground">
              <ChevronRight className="h-5 w-5" />
            </motion.div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
            <div className="border-t border-border/40 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {RULES.map((r, i) => {
                const Icon = r.icon;
                return (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/30 px-3 py-2.5">
                    <div className="h-7 w-7 rounded-md bg-[var(--gold)]/10 flex items-center justify-center">
                      <Icon className="h-3.5 w-3.5 rp-gold-text" />
                    </div>
                    <span className="text-sm text-foreground/85">{r.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  function handleSelectSlot(slot: AvailabilitySlot) {
    setSelected(slot);
    setConfirmed(null);
  }
}

/* =========================================================
 * Subcomponents
 * =======================================================*/
function Header() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="font-display text-2xl sm:text-3xl font-light tracking-tight">
            Motor de disponibilidad
          </h2>
          <Badge className="bg-amber-400/15 text-amber-300 border-amber-400/30 font-mono text-[10px] uppercase tracking-wider">
            demo
          </Badge>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Cálculo atómico de slots en tiempo real · anti-overbooking · configurable por servicio, zona e intervalo.
        </p>
      </div>
      <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Motor en línea
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm text-foreground/90">{value}</div>
    </div>
  );
}
