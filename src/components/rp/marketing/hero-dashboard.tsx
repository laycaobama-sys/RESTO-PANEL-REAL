"use client";

/**
 * HeroDashboard — live, animated mini-dashboard rendered in DOM.
 * - Glass card (rp-glass-strong) on 3D perspective with mouse parallax
 * - Top bar with live clock + "EN SERVICIO" pulsing indicator
 * - 4 horizontal KPIs
 * - Mini reservations list (entry fades+slides in every 5s)
 * - Mini floor plan (3×2 grid; one table morphs reserved→occupied every 7s)
 * - SVG sparkline (stroke-dashoffset animation on view)
 * - AI toast (fade-in from right at 15s)
 * - Respects prefers-reduced-motion
 * - ~24s auto-loop
 */

import * as React from "react";
import { motion, useReducedMotion, type Transition } from "framer-motion";
import { Sparkles, Activity, Users, Ticket, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { RESTAURANT } from "@/lib/mock-data/restaurant";

/* ----------------------------- types & data ----------------------------- */

type TableState = "free" | "reserved" | "occupied";

interface FloorTable {
  id: string;
  label: string;
  state: TableState;
}

interface ResvItem {
  id: string;
  time: string;
  name: string;
  party: number;
  status: "confirmed" | "pending" | "seated";
  vip?: boolean;
}

const KPI_DATA = [
  { id: "res",  label: "Reservas",  value: 47, hint: "+12%", icon: Users },
  { id: "occ",  label: "Ocupación", value: 78, hint: "%",     icon: Activity, suffix: "%" },
  { id: "tk",   label: "Ticket",    value: 89, hint: "€",    icon: Ticket,  prefix: "€" },
  { id: "ns",   label: "No-shows",  value: 3,  hint: "hoy",   icon: AlertTriangle },
] as const;

const RESV_QUEUE: ResvItem[] = [
  { id: "r1", time: "20:30", name: "Sofía Montero",  party: 6, status: "confirmed" },
  { id: "r2", time: "20:45", name: "Mateo Rivas",   party: 2, status: "confirmed" },
  { id: "r3", time: "21:00", name: "Elena Carrasco", party: 4, status: "confirmed", vip: true },
  { id: "r4", time: "21:15", name: "Hugo Bermúdez", party: 2, status: "pending" },
  { id: "r5", time: "21:30", name: "Paula Iglesias", party: 6, status: "pending" },
  { id: "r6", time: "22:00", name: "Sergio Bravo",  party: 8, status: "confirmed", vip: true },
  { id: "r7", time: "22:30", name: "Celia Navarro", party: 4, status: "confirmed" },
  { id: "r8", time: "23:00", name: "Beatriz Ortega", party: 6, status: "pending" },
];

const SPARK_DATA = [22, 35, 58, 72, 64, 41, 38, 55, 76, 88, 95, 78, 60, 45];

const STATE_COLOR: Record<TableState, string> = {
  free: "#3DD6C9",     // turquoise
  reserved: "#D4AF37", // gold
  occupied: "#F2726A", // warm red
};

const STATUS_META = {
  confirmed: { label: "Confirmada", cls: "text-[var(--gold)] bg-[color-mix(in_oklab,var(--gold)_18%,transparent)] border-[color-mix(in_oklab,var(--gold)_35%,transparent)]" },
  pending:   { label: "Pendiente",  cls: "text-[var(--teal)] bg-[color-mix(in_oklab,var(--teal)_16%,transparent)] border-[color-mix(in_oklab,var(--teal)_32%,transparent)]" },
  seated:    { label: "Sentado",    cls: "text-emerald-300 bg-emerald-500/15 border-emerald-500/30" },
} as const;

/* ----------------------------- helpers ----------------------------- */

function useLiveClock() {
  const [now, setNow] = React.useState<Date | null>(null);
  React.useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function formatClock(d: Date) {
  return d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/* ----------------------------- subcomponents ----------------------------- */

function MiniKpi({
  icon: Icon,
  label,
  value,
  hint,
  prefix,
  suffix,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  hint?: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-2.5 py-2">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-white/45">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-mono text-base font-semibold text-white tabular-nums">
          {prefix}
          {value}
          {suffix}
        </span>
        {hint ? (
          <span className="text-[10px] text-[var(--gold)] font-medium">
            {hint}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ResvItem["status"] }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "rounded-md border px-1.5 py-[2px] text-[9px] font-medium leading-none",
        meta.cls,
      )}
    >
      {meta.label}
    </span>
  );
}

function ReservationsList({
  visibleCount,
  reduced,
}: {
  visibleCount: number;
  reduced: boolean;
}) {
  const items = RESV_QUEUE.slice(0, Math.min(visibleCount, 4));
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((it, i) => {
        const isLast = i === items.length - 1 && visibleCount > 1;
        return (
          <motion.div
            key={it.id}
            initial={reduced ? false : { opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: isLast ? 0.02 : 0 }
            }
            className="flex items-center gap-2 rounded-md bg-white/[0.03] border border-white/[0.06] px-2 py-1.5"
          >
            <span className="font-mono text-[11px] text-white/70 tabular-nums">
              {it.time}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="truncate text-[12px] font-medium text-white/90">
                  {it.name}
                </span>
                {it.vip ? (
                  <span className="rounded-sm bg-[color-mix(in_oklab,var(--gold)_22%,transparent)] px-1 text-[8px] font-semibold text-[var(--gold)] uppercase tracking-wide">
                    VIP
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] text-white/45">
                {it.party} pers.
              </span>
            </div>
            <StatusBadge status={it.status} />
          </motion.div>
        );
      })}
    </div>
  );
}

function FloorPlan({
  tables,
  reduced,
}: {
  tables: FloorTable[];
  reduced: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {tables.map((t) => (
        <div
          key={t.id}
          className="relative flex flex-col items-center gap-1 rounded-md bg-white/[0.03] border border-white/[0.06] px-1 py-1.5"
        >
          <span className="text-[9px] text-white/45">{t.label}</span>
          <motion.span
            className="block h-3 w-3 rounded-full"
            style={{
              backgroundColor: STATE_COLOR[t.state],
              boxShadow: `0 0 8px ${STATE_COLOR[t.state]}`,
            }}
            animate={
              reduced
                ? undefined
                : t.state === "occupied"
                  ? { scale: [1, 1.18, 1] }
                  : { opacity: [0.7, 1, 0.7] }
            }
            transition={
              reduced
                ? { duration: 0 }
                : t.state === "occupied"
                  ? { duration: 1.2, repeat: 1 }
                  : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
            }
          />
        </div>
      ))}
    </div>
  );
}

function Sparkline({ data, reduced }: { data: number[]; reduced: boolean }) {
  const w = 100;
  const h = 36;
  const pad = 4;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(max - min, 1);

  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });

  const d = pts
    .map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`))
    .join(" ");
  const area = `${d} L ${pts[pts.length - 1][0]} ${h} L ${pts[0][0]} ${h} Z`;

  const totalLen = 240; // approximate path length
  const motionProps = reduced
    ? {}
    : {
        initial: { strokeDashoffset: totalLen },
        whileInView: { strokeDashoffset: 0 },
        viewport: { once: true, margin: "-15% 0px" },
        transition: { duration: 1.6, ease: [0.22, 1, 0.36, 1] } as Transition,
      };

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-9" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path d={area} fill="url(#sparkFill)" opacity={0.85} />
      <motion.path
        d={d}
        fill="none"
        stroke="#D4AF37"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ strokeDasharray: totalLen }}
        {...motionProps}
      />
      {/* last point marker */}
      <circle
        cx={pts[pts.length - 1][0]}
        cy={pts[pts.length - 1][1]}
        r="1.8"
        fill="#F4DC8C"
      />
    </svg>
  );
}

function AiToast({ visible, reduced }: { visible: boolean; reduced: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute right-3 bottom-3 z-20 flex items-center gap-2 rounded-lg border border-[color-mix(in_oklab,var(--gold)_45%,transparent)] bg-[color-mix(in_oklab,var(--gold)_14%,#0b0b0c)] px-3 py-2 shadow-[0_8px_40px_-12px_color-mix(in_oklab,var(--gold)_55%,transparent)]"
      initial={reduced ? false : { opacity: 0, x: 60, y: 8 }}
      animate={
        visible
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, x: 60, y: 8 }
      }
      transition={
        reduced
          ? { duration: 0 }
          : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
      }
      aria-hidden={!visible}
    >
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--gold)_22%,transparent)]">
        <Sparkles className="h-3.5 w-3.5 text-[var(--gold)]" />
      </div>
      <div className="text-[11px] leading-snug text-white/85">
        <span className="font-semibold text-[var(--gold)]">IA:</span>{" "}
        3 mesas con riesgo de no-show.{" "}
        <span className="text-white/70">Recomiendo reconfirmar.</span>
      </div>
    </motion.div>
  );
}

/* ----------------------------- main component ----------------------------- */

export function HeroDashboard({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const now = useLiveClock();

  // ─── State cycling ─────────────────────────────────────────────────────
  // Loop period ~24s. Sequence:
  //   t=0s   : list shows 3 entries, tables {1 free→reserved, rest stable}
  //   t=5s   : +1 reservation entry (fade+slide)
  //   t=7s   : one reserved table → occupied (color morph + pulse)
  //   t=10s  : +1 reservation entry
  //   t=15s  : AI toast fades in from right
  //   t=20s  : another table reserved→occupied
  //   t=24s  : reset (loop)
  const [visibleCount, setVisibleCount] = React.useState(3);
  const [tables, setTables] = React.useState<FloorTable[]>([
    { id: "t1", label: "T2",  state: "free" },
    { id: "t2", label: "T4",  state: "occupied" },
    { id: "t3", label: "T6",  state: "reserved" },
    { id: "t4", label: "T9",  state: "free" },
    { id: "t5", label: "T11", state: "reserved" },
    { id: "t6", label: "T15", state: "occupied" },
  ]);
  const [toastVisible, setToastVisible] = React.useState(false);

  // Master loop
  React.useEffect(() => {
    if (reduced) {
      setVisibleCount(4);
      setToastVisible(true);
      return;
    }
    let t1: number, t2: number, t3: number, t4: number, t5: number;

    // +1 entry at 5s
    t1 = window.setTimeout(() => setVisibleCount(4), 5000);
    // first reserved→occupied at 7s
    t2 = window.setTimeout(() => {
      setTables((prev) =>
        prev.map((t) =>
          t.id === "t5" ? { ...t, state: "occupied" as TableState } : t,
        ),
      );
    }, 7000);
    // toast at 15s
    t3 = window.setTimeout(() => setToastVisible(true), 15000);
    // second reserved→occupied at 20s
    t4 = window.setTimeout(() => {
      setTables((prev) =>
        prev.map((t) =>
          t.id === "t3" ? { ...t, state: "occupied" as TableState } : t,
        ),
      );
    }, 20000);
    // reset at 24s
    t5 = window.setTimeout(() => {
      setVisibleCount(3);
      setToastVisible(false);
      setTables([
        { id: "t1", label: "T2",  state: "free" },
        { id: "t2", label: "T4",  state: "occupied" },
        { id: "t3", label: "T6",  state: "reserved" },
        { id: "t4", label: "T9",  state: "free" },
        { id: "t5", label: "T11", state: "reserved" },
        { id: "t6", label: "T15", state: "occupied" },
      ]);
    }, 24000);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
      window.clearTimeout(t5);
    };
  }, [reduced]);

  // ─── 3D mouse parallax (±4° max, damped) ─────────────────────────────────
  const [rot, setRot] = React.useState({ x: 6, y: -8 });
  const target = React.useRef({ x: 6, y: -8 });
  const raf = React.useRef(0);

  React.useEffect(() => {
    if (reduced) return;
    const node = cardRef.current;
    if (!node) return;

    const onMove = (e: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      // base tilt 6°/−8° + parallax ±4°
      target.current = {
        x: 6 + py * 8,    // ±4°
        y: -8 + px * -8,
      };
    };
    const onLeave = () => {
      target.current = { x: 6, y: -8 };
    };

    const loop = () => {
      setRot((prev) => {
        const nx = prev.x + (target.current.x - prev.x) * 0.08;
        const ny = prev.y + (target.current.y - prev.y) * 0.08;
        return { x: nx, y: ny };
      });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    const parent = node.parentElement;
    parent?.addEventListener("mousemove", onMove);
    parent?.addEventListener("mouseleave", onLeave);
    return () => {
      parent?.removeEventListener("mousemove", onMove);
      parent?.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, [reduced]);

  return (
    <div
      className={cn(
        "relative w-full max-w-[560px] select-none",
        className,
      )}
    >
      {/* Demo badge */}
      <div className="pointer-events-none absolute -top-2.5 -right-2.5 z-30">
        <span className="rounded-full border border-[color-mix(in_oklab,var(--gold)_45%,transparent)] bg-[color-mix(in_oklab,var(--gold)_22%,#0b0b0c)] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-[var(--gold)]">
          Demo
        </span>
      </div>

      {/* Glow under card */}
      <div
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] opacity-60 blur-2xl"
        style={{
          background:
            "radial-gradient(60% 60% at 30% 30%, color-mix(in oklab, var(--gold) 18%, transparent), transparent), radial-gradient(50% 60% at 80% 80%, color-mix(in oklab, var(--teal) 14%, transparent), transparent)",
        }}
        aria-hidden
      />

      <motion.div
        ref={cardRef}
        className={cn(
          "rp-glass-strong relative overflow-hidden rounded-2xl p-3.5 sm:p-4",
          "shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85)]",
        )}
        style={{
          transform: reduced
            ? "perspective(1200px) rotateX(6deg) rotateY(-8deg)"
            : `perspective(1200px) rotateX(${rot.x.toFixed(2)}deg) rotateY(${rot.y.toFixed(2)}deg)`,
          transformStyle: "preserve-3d",
          transition: reduced ? undefined : "transform 0.08s linear",
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2 border-b border-white/[0.07] pb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#F4DC8C] via-[#D4AF37] to-[#A8862A] text-[10px] font-bold text-black">
              CM
            </div>
            <div className="min-w-0">
              <div className="truncate text-[12px] font-semibold text-white/90">
                {RESTAURANT.name} <span className="text-white/40">·</span>{" "}
                <span className="text-white/55">{RESTAURANT.city}</span>
              </div>
              <div className="text-[9px] uppercase tracking-wider text-white/35">
                {RESTAURANT.type}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="font-mono text-[12px] text-white/65 tabular-nums">
              {now ? formatClock(now) : "--:--:--"}
            </div>
            <div className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-[3px]">
              <motion.span
                className="block h-1.5 w-1.5 rounded-full bg-emerald-400"
                animate={reduced ? undefined : { opacity: [1, 0.3, 1] }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                }
              />
              <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-300">
                En servicio
              </span>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {KPI_DATA.map((k) => (
            <MiniKpi
              key={k.id}
              icon={k.icon}
              label={k.label}
              value={k.value}
              hint={"hint" in k ? k.hint : undefined}
              prefix={"prefix" in k ? k.prefix : undefined}
              suffix={"suffix" in k ? k.suffix : undefined}
            />
          ))}
        </div>

        {/* Two-column body: reservations + floor plan */}
        <div className="mt-3 grid grid-cols-5 gap-2.5">
          <div className="col-span-3 min-w-0">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-white/40">
                Próximas reservas
              </span>
              <span className="text-[10px] text-white/30">hoy</span>
            </div>
            <ReservationsList visibleCount={visibleCount} reduced={!!reduced} />
          </div>
          <div className="col-span-2 min-w-0">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-white/40">
                Sala
              </span>
              <span className="text-[10px] text-white/30">6 mesas</span>
            </div>
            <FloorPlan tables={tables} reduced={!!reduced} />
          </div>
        </div>

        {/* Sparkline footer */}
        <div className="mt-3 flex items-center gap-3 border-t border-white/[0.07] pt-2.5">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-white/40">
              Ocupación hoy
            </div>
            <div className="font-mono text-[14px] font-semibold text-[var(--gold)] tabular-nums">
              78%
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <Sparkline data={SPARK_DATA} reduced={!!reduced} />
          </div>
          <div className="hidden sm:flex flex-col items-end gap-0.5">
            <span className="text-[9px] text-white/35">Pico</span>
            <span className="font-mono text-[11px] text-white/65 tabular-nums">
              95%
            </span>
          </div>
        </div>

        {/* AI toast */}
        <AiToast visible={toastVisible} reduced={!!reduced} />
      </motion.div>

      {/* Floor-plan legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-white/45">
        <span className="flex items-center gap-1.5">
          <span
            className="block h-2 w-2 rounded-full"
            style={{ background: STATE_COLOR.free }}
          />
          Libre
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="block h-2 w-2 rounded-full"
            style={{ background: STATE_COLOR.reserved }}
          />
          Reservada
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="block h-2 w-2 rounded-full"
            style={{ background: STATE_COLOR.occupied }}
          />
          Ocupada
        </span>
      </div>
    </div>
  );
}

export default HeroDashboard;
