"use client";

/* ============================================================
 * RestoPanel · DemoFloor — Plano de mesas interactivo
 * ------------------------------------------------------------
 * Demo en vivo para el landing (sección).
 *  - 12 mesas (4 redondas, 4 cuadradas, 4 rectangulares)
 *  - 2 zonas: Sala + Terraza
 *  - Draggable (pointer events, sin librerías externas)
 *  - Click → cicla estado (free→reserved→occupied→cleaning→free)
 *  - Timeline de servicio 13:00–23:00 con bloques de reserva
 *  - Toggle "Tiempo real" (servicio de viernes ×60, cambios 2-3s)
 *  - Leyenda, badge "demo", responsive (scroll horizontal en móvil)
 *  - Animaciones transform+opacity, respeta prefers-reduced-motion
 * ============================================================ */

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Radio,
  Square,
  RectangleHorizontal,
  Clock,
  Activity,
  RotateCcw,
  Move,
  Sparkles,
} from "lucide-react";

/* ---------- Types ---------- */
type TableState = "free" | "reserved" | "occupied" | "cleaning";
type Shape = "round" | "square" | "rect";
type ZoneId = "sala" | "terraza";

interface FloorTable {
  id: string;
  name: string;
  seats: number;
  shape: Shape;
  zone: ZoneId;
  x: number; // % within zone container
  y: number;
  state: TableState;
}

/* ---------- Demo data ---------- */
const INITIAL_TABLES: FloorTable[] = [
  // Sala — 6 mesas (2 redondas, 2 cuadradas, 2 rect)
  { id: "m1", name: "M1", seats: 4, shape: "round", zone: "sala", x: 12, y: 22, state: "occupied" },
  { id: "m2", name: "M2", seats: 4, shape: "round", zone: "sala", x: 38, y: 18, state: "reserved" },
  { id: "m3", name: "M3", seats: 2, shape: "square", zone: "sala", x: 64, y: 24, state: "free" },
  { id: "m4", name: "M4", seats: 2, shape: "square", zone: "sala", x: 82, y: 22, state: "occupied" },
  { id: "m5", name: "M5", seats: 6, shape: "rect", zone: "sala", x: 18, y: 66, state: "reserved" },
  { id: "m6", name: "M6", seats: 6, shape: "rect", zone: "sala", x: 58, y: 68, state: "cleaning" },
  // Terraza — 6 mesas (2 redondas, 2 cuadradas, 2 rect)
  { id: "m7", name: "M7", seats: 4, shape: "round", zone: "terraza", x: 14, y: 24, state: "free" },
  { id: "m8", name: "M8", seats: 4, shape: "round", zone: "terraza", x: 40, y: 20, state: "occupied" },
  { id: "m9", name: "M9", seats: 2, shape: "square", zone: "terraza", x: 66, y: 26, state: "reserved" },
  { id: "m10", name: "M10", seats: 2, shape: "square", zone: "terraza", x: 84, y: 22, state: "free" },
  { id: "m11", name: "M11", seats: 6, shape: "rect", zone: "terraza", x: 22, y: 68, state: "occupied" },
  { id: "m12", name: "M12", seats: 8, shape: "rect", zone: "terraza", x: 62, y: 66, state: "reserved" },
];

const STATE_META: Record<
  TableState,
  { label: string; bg: string; border: string; text: string; ring: string; dot: string }
> = {
  free: {
    label: "Libre",
    bg: "bg-emerald-500/12",
    border: "border-emerald-400/55",
    text: "text-emerald-200",
    ring: "ring-emerald-400/40",
    dot: "bg-emerald-400",
  },
  reserved: {
    label: "Reservada",
    bg: "bg-[var(--gold)]/12",
    border: "border-[var(--gold)]/55",
    text: "rp-gold-text",
    ring: "ring-[var(--gold)]/40",
    dot: "bg-[var(--gold)]",
  },
  occupied: {
    label: "Ocupada",
    bg: "bg-rose-500/12",
    border: "border-rose-400/55",
    text: "text-rose-200",
    ring: "ring-rose-400/40",
    dot: "bg-rose-400",
  },
  cleaning: {
    label: "Limpieza",
    bg: "bg-amber-500/12",
    border: "border-amber-400/55",
    text: "text-amber-200",
    ring: "ring-amber-400/40",
    dot: "bg-amber-400",
  },
};

const STATE_CYCLE: TableState[] = ["free", "reserved", "occupied", "cleaning"];

/* Timeline 13:00 → 23:00 (10 horas) */
const SERVICE_START = 13 * 60; // minutes from 00:00
const SERVICE_END = 23 * 60;
const SERVICE_SPAN = SERVICE_END - SERVICE_START; // 600 min

interface ReservationBlock {
  tableId: string;
  startMin: number; // absolute minutes from 00:00
  endMin: number;
  state: TableState;
}

const INITIAL_RESERVATIONS: ReservationBlock[] = [
  { tableId: "m1", startMin: 13 * 60 + 30, endMin: 15 * 60 + 30, state: "occupied" },
  { tableId: "m2", startMin: 14 * 60, endMin: 16 * 60, state: "reserved" },
  { tableId: "m5", startMin: 13 * 60, endMin: 15 * 60, state: "reserved" },
  { tableId: "m5", startMin: 20 * 60 + 30, endMin: 22 * 60, state: "reserved" },
  { tableId: "m6", startMin: 14 * 60 + 30, endMin: 16 * 60, state: "reserved" },
  { tableId: "m8", startMin: 13 * 60 + 30, endMin: 15 * 60, state: "occupied" },
  { tableId: "m9", startMin: 21 * 60, endMin: 22 * 60 + 30, state: "reserved" },
  { tableId: "m11", startMin: 13 * 60 + 30, endMin: 15 * 60 + 30, state: "occupied" },
  { tableId: "m12", startMin: 14 * 60, endMin: 16 * 60, state: "reserved" },
  { tableId: "m12", startMin: 20 * 60, endMin: 22 * 60 + 30, state: "reserved" },
  { tableId: "m4", startMin: 21 * 60 + 30, endMin: 23 * 60, state: "reserved" },
];

/* ---------- Helpers ---------- */
function fmtHour(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/* ============================================================
 * Component
 * ============================================================ */
export function DemoFloor() {
  const reduce = useReducedMotion();
  const [tables, setTables] = React.useState<FloorTable[]>(INITIAL_TABLES);
  const [reservations, setReservations] = React.useState<ReservationBlock[]>(INITIAL_RESERVATIONS);
  const [liveMode, setLiveMode] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  // Drag state (pointer-based)
  const dragRef = React.useRef<{
    id: string;
    startX: number;
    startY: number;
    containerRect: DOMRect;
  } | null>(null);

  const cycleState = React.useCallback((id: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, state: STATE_CYCLE[(STATE_CYCLE.indexOf(t.state) + 1) % STATE_CYCLE.length] }
          : t
      )
    );
  }, []);

  // Live mode: simulate a busy Friday service ×60
  React.useEffect(() => {
    if (!liveMode) return;
    const interval = setInterval(() => {
      // Pick 1-2 random tables and cycle state, weighted toward busy states
      setTables((prev) => {
        const next = [...prev];
        const n = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < n; i++) {
          const idx = Math.floor(Math.random() * next.length);
          const t = next[idx];
          next[idx] = {
            ...t,
            state: STATE_CYCLE[(STATE_CYCLE.indexOf(t.state) + 1) % STATE_CYCLE.length],
          };
        }
        return next;
      });
    }, 2400);
    return () => clearInterval(interval);
  }, [liveMode]);

  // Pointer handlers for drag
  const onPointerDown = (e: React.PointerEvent, t: FloorTable) => {
    if (liveMode) return; // no drag in live mode
    const container = (e.currentTarget.parentElement as HTMLElement)?.getBoundingClientRect();
    if (!container) return;
    dragRef.current = {
      id: t.id,
      startX: e.clientX,
      startY: e.clientY,
      containerRect: container,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setSelectedId(t.id);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    const newX = Math.max(4, Math.min(92, ((d.startX - d.containerRect.left + dx) / d.containerRect.width) * 100));
    const newY = Math.max(8, Math.min(86, ((d.startY - d.containerRect.top + dy) / d.containerRect.height) * 100));
    setTables((prev) => prev.map((t) => (t.id === d.id ? { ...t, x: newX, y: newY } : t)));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragRef.current) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    }
    dragRef.current = null;
  };

  const reset = () => {
    setTables(INITIAL_TABLES);
    setReservations(INITIAL_RESERVATIONS);
    setSelectedId(null);
  };

  const stats = React.useMemo(() => {
    const c = { free: 0, reserved: 0, occupied: 0, cleaning: 0 };
    tables.forEach((t) => (c[t.state] += 1));
    return c;
  }, [tables]);

  return (
    <div className="rp-glass-strong rounded-2xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-xl sm:text-2xl font-medium tracking-tight">
              Plano de mesas en vivo
            </h3>
            <Badge variant="outline" className="border-[var(--gold)]/40 text-[var(--gold-soft)]">
              demo
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Viernes 19:42 · 12 mesas · 2 zonas · servicio 13:00–23:00
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-foreground/[0.03] px-3 py-1.5">
            <Activity className={cn("h-3.5 w-3.5", liveMode ? "text-[var(--gold)]" : "text-muted-foreground")} />
            <span className="text-xs font-medium">Tiempo real</span>
            <Switch checked={liveMode} onCheckedChange={setLiveMode} aria-label="Activar modo tiempo real" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="h-9 min-h-[44px] px-3 text-xs"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reiniciar
          </Button>
        </div>
      </div>

      {/* Floor + Sidebar stats */}
      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_220px]">
        {/* Floor plan */}
        <div className="overflow-x-auto rp-scroll-thin">
          <div className="min-w-[640px] space-y-3">
            {(["sala", "terraza"] as ZoneId[]).map((zoneId) => (
              <ZoneBlock
                key={zoneId}
                zoneId={zoneId}
                tables={tables.filter((t) => t.zone === zoneId)}
                selectedId={selectedId}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onCycle={cycleState}
                liveMode={liveMode}
                reduce={reduce}
              />
            ))}
          </div>
        </div>

        {/* Side stats */}
        <div className="space-y-3">
          <div className="rounded-xl border border-border/60 bg-foreground/[0.03] p-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Ocupación actual
            </div>
            <div className="mt-2 font-display text-3xl font-light">
              <span className="rp-gold-text">
                {Math.round(((stats.occupied + stats.reserved) / 12) * 100)}%
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {stats.occupied + stats.reserved}/12 mesas activas
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-foreground/[0.03] p-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Próximas reservas
            </div>
            <div className="mt-2 space-y-1.5">
              {reservations
                .filter((r) => r.state === "reserved")
                .slice(0, 3)
                .map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="font-mono text-foreground/80">
                      {tables.find((t) => t.id === r.tableId)?.name}
                    </span>
                    <span className="text-muted-foreground">
                      {fmtHour(r.startMin)} – {fmtHour(r.endMin)}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-foreground/[0.03] p-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Leyenda
            </div>
            <div className="mt-2 space-y-1.5">
              {STATE_CYCLE.map((s) => (
                <div key={s} className="flex items-center gap-2 text-xs">
                  <span className={cn("h-2.5 w-2.5 rounded-full", STATE_META[s].dot)} />
                  <span className="text-foreground/80">{STATE_META[s].label}</span>
                  <span className="ml-auto font-mono text-muted-foreground">{stats[s]}</span>
                </div>
              ))}
            </div>
          </div>

          {!liveMode && (
            <div className="rounded-xl border border-[var(--teal)]/30 bg-[var(--teal)]/[0.06] p-3 text-xs text-[var(--teal)]">
              <div className="flex items-center gap-1.5 font-medium">
                <Move className="h-3.5 w-3.5" />
                Arrastra las mesas
              </div>
              <p className="mt-1 text-muted-foreground">
                Click en una mesa para cambiar su estado.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Línea de servicio · hoy
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-3 rounded-sm bg-[var(--gold)]/70" /> reservada
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-3 rounded-sm bg-rose-400/70" /> ocupada
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-3 rounded-sm bg-amber-400/70" /> limpieza
            </span>
          </div>
        </div>
        <div className="mt-3 overflow-x-auto rp-scroll-thin">
          <div className="min-w-[560px]">
            <div className="relative h-20 rounded-lg border border-border/60 bg-foreground/[0.02]">
              {/* Hour ticks */}
              {Array.from({ length: 11 }, (_, i) => {
                const min = SERVICE_START + i * 60;
                const pct = ((min - SERVICE_START) / SERVICE_SPAN) * 100;
                return (
                  <div
                    key={i}
                    className="absolute top-0 h-full border-l border-border/40"
                    style={{ left: `${pct}%` }}
                  >
                    <span className="absolute top-1 left-1 text-[10px] font-mono text-muted-foreground">
                      {fmtHour(min)}
                    </span>
                  </div>
                );
              })}
              {/* Reservation blocks */}
              <div className="absolute inset-x-1 top-7 bottom-3 space-y-1">
                {reservations.map((r, i) => {
                  const left = ((r.startMin - SERVICE_START) / SERVICE_SPAN) * 100;
                  const width = ((r.endMin - r.startMin) / SERVICE_SPAN) * 100;
                  const table = tables.find((t) => t.id === r.tableId);
                  const meta = STATE_META[r.state];
                  return (
                    <motion.div
                      key={i}
                      initial={reduce ? false : { opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ delay: i * 0.04, duration: 0.4 }}
                      style={{ left: `${left}%`, width: `${width}%`, transformOrigin: "left" }}
                      className={cn(
                        "absolute flex h-3 items-center rounded-sm border px-1 text-[9px] font-mono leading-none",
                        meta.bg,
                        meta.border,
                        meta.text
                      )}
                      title={`${table?.name} · ${fmtHour(r.startMin)}–${fmtHour(r.endMin)}`}
                    >
                      <span className="truncate">{table?.name}</span>
                    </motion.div>
                  );
                })}
              </div>
              {/* Now marker (19:42) */}
              <div
                className="absolute top-0 bottom-0 w-px bg-[var(--teal)]"
                style={{ left: `${((19 * 60 + 42 - SERVICE_START) / SERVICE_SPAN) * 100}%` }}
              >
                <div className="absolute -top-0 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-[var(--teal)] shadow-[0_0_8px_var(--teal)]" />
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-mono text-[var(--teal)]">
                  ahora
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground">
        Datos de demostración. El plano real se sincroniza con reservas, lista de espera y TPV.
      </p>
    </div>
  );
}

/* ---------- Zone sub-component ---------- */
function ZoneBlock({
  zoneId,
  tables,
  selectedId,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onCycle,
  liveMode,
  reduce,
}: {
  zoneId: ZoneId;
  tables: FloorTable[];
  selectedId: string | null;
  onPointerDown: (e: React.PointerEvent, t: FloorTable) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onCycle: (id: string) => void;
  liveMode: boolean;
  reduce: boolean | null;
}) {
  const zoneLabel = zoneId === "sala" ? "Sala principal" : "Terraza";
  const accent = zoneId === "sala" ? "var(--gold)" : "var(--teal)";
  return (
    <div
      className="relative h-44 rounded-xl border bg-foreground/[0.02]"
      style={{
        borderColor: `color-mix(in oklab, ${accent} 30%, transparent)`,
      }}
    >
      <div className="absolute left-3 top-2 z-10 flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: accent }}
        />
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          {zoneLabel}
        </span>
      </div>
      <div
        className="absolute inset-0 rounded-xl rp-grid-bg opacity-30"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {tables.map((t) => {
          const meta = STATE_META[t.state];
          const ShapeIcon =
            t.shape === "round" ? Radio : t.shape === "square" ? Square : RectangleHorizontal;
          const shapeClass =
            t.shape === "round"
              ? "rounded-full"
              : t.shape === "square"
              ? "rounded-md aspect-square"
              : "rounded-md aspect-[1.6/1]";
          return (
            <motion.button
              key={t.id}
              initial={reduce ? false : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              whileHover={reduce ? undefined : { scale: 1.05 }}
              whileTap={reduce ? undefined : { scale: 0.95 }}
              onPointerDown={(e) => onPointerDown(e, t)}
              onPointerUp={onPointerUp}
              onClick={() => onCycle(t.id)}
              className={cn(
                "absolute flex flex-col items-center justify-center border cursor-pointer touch-none select-none",
                "h-12 w-12 sm:h-14 sm:w-14",
                shapeClass,
                meta.bg,
                meta.border,
                meta.text,
                selectedId === t.id && cn("ring-2", meta.ring),
                liveMode && "cursor-default"
              )}
              style={{
                left: `${t.x}%`,
                top: `${t.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              title={`${t.name} · ${t.seats} pax · ${meta.label}`}
            >
              <span className="font-mono text-[10px] sm:text-xs font-semibold">{t.name}</span>
              <span className="flex items-center gap-0.5 text-[9px] sm:text-[10px] opacity-80">
                <ShapeIcon className="h-2.5 w-2.5" />
                {t.seats}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default DemoFloor;
