"use client";

/**
 * BeforeAfter — split-screen scroll-driven comparison.
 * - Left side ("antes"): friction points, desaturates + blurs on scroll
 * - Right side ("después"): solutions, gains color on scroll
 * - 5 pairs revealed via Framer Motion useScroll + useTransform
 * - Each pair: lucide icon, friction text (muted) → solution text (gold accent)
 * - respects prefers-reduced-motion (renders static, no scroll transforms)
 */

import * as React from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  MessageSquare,
  CalendarX,
  UserX,
  Star,
  BarChart3,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Pair {
  id: string;
  friction: string;
  solution: string;
  iconBefore: LucideIcon;
  iconAfter: LucideIcon;
}

const PAIRS: Pair[] = [
  {
    id: "p1",
    friction: "Reservas dispersas en WhatsApp y libreta",
    solution: "Todas en un panel unificado",
    iconBefore: MessageSquare,
    iconAfter: CheckCircle2,
  },
  {
    id: "p2",
    friction: "Mesas vacías por no-shows",
    solution: "Confirmación automática + depósito",
    iconBefore: CalendarX,
    iconAfter: CheckCircle2,
  },
  {
    id: "p3",
    friction: "Clientes sin historial",
    solution: "CRM 360° con preferencias y alergias",
    iconBefore: UserX,
    iconAfter: CheckCircle2,
  },
  {
    id: "p4",
    friction: "Reseñas sin responder",
    solution: "IA redacta respuestas en segundos",
    iconBefore: Star,
    iconAfter: CheckCircle2,
  },
  {
    id: "p5",
    friction: "Decisiones a ciegas",
    solution: "BI con predicciones y forecast",
    iconBefore: BarChart3,
    iconAfter: CheckCircle2,
  },
];

function PairRow({ pair, index }: { pair: Pair; index: number }) {
  const reduced = useReducedMotion();
  const rowRef = React.useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start 85%", "end 30%"],
  });

  // ─── Left: desaturate + blur as it scrolls out ───────────────────────
  const leftOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.55, 0.9, 0.35]);
  const leftFilter = useTransform(scrollYProgress, [0, 0.5, 1], (p) => {
    // peak clarity at 0.5; blur & grayscale rise at edges
    const blur = p < 0.5 ? 4 - (p / 0.5) * 2.5 : 1.5 + ((p - 0.5) / 0.5) * 5.5;
    const sat = p < 0.5 ? 0.5 + (p / 0.5) * 0.4 : 0.9 - ((p - 0.5) / 0.5) * 0.4;
    const gray = p < 0.5 ? 1 - (p / 0.5) * 0.4 : 0.6 + ((p - 0.5) / 0.5) * 0.4;
    return `blur(${blur.toFixed(2)}px) saturate(${sat.toFixed(2)}) grayscale(${gray.toFixed(2)})`;
  });

  // ─── Right: gain color / rise as it enters ───────────────────────────
  const rightY = useTransform(scrollYProgress, [0, 0.5, 1], [16, 0, -8]);
  const rightOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 1]);
  const rightScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.98, 1, 1]);

  // Connecting arrow opacity
  const arrowOpacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0.3, 1, 0.6]);

  const Before = pair.iconBefore;
  const After = pair.iconAfter;

  return (
    <div
      ref={rowRef}
      className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-stretch gap-4 md:gap-6 py-6"
    >
      {/* LEFT — antes (friction) */}
      <motion.div
        className="rp-glass relative flex items-start gap-3 rounded-xl border border-white/[0.06] p-5"
        style={
          reduced
            ? undefined
            : {
                opacity: leftOpacity,
                filter: leftFilter,
              }
        }
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-white/40">
          <Before className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-white/35">
            Antes
          </div>
          <p className="text-sm leading-relaxed text-white/55 line-through decoration-white/15">
            {pair.friction}
          </p>
        </div>
        {/* Caos watermark */}
        <span
          className="pointer-events-none absolute -right-1 -top-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-400/30"
          aria-hidden
        >
          Caos
        </span>
      </motion.div>

      {/* Connecting arrow */}
      <motion.div
        className="hidden md:flex items-center justify-center"
        style={reduced ? undefined : { opacity: arrowOpacity }}
        aria-hidden
      >
        <svg
          width="28"
          height="14"
          viewBox="0 0 28 14"
          fill="none"
          className="text-[var(--gold)]"
        >
          <path
            d="M1 7h24m0 0l-6-5m6 5l-6 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      {/* RIGHT — después (solution) */}
      <motion.div
        className="rp-glass-strong relative flex items-start gap-3 rounded-xl border border-[color-mix(in_oklab,var(--gold)_30%,transparent)] p-5"
        style={
          reduced
            ? undefined
            : { y: rightY, opacity: rightOpacity, scale: rightScale }
        }
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--gold)_18%,transparent)] text-[var(--gold)]">
          <After className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]/70">
            Con RestoPanel
          </div>
          <p className="text-sm font-medium leading-relaxed text-white">
            <span className="rp-gold-text font-semibold">{pair.solution}</span>
          </p>
        </div>
        {/* Index pill */}
        <span className="pointer-events-none absolute -right-1 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--gold)_45%,transparent)] bg-[color-mix(in_oklab,var(--gold)_18%,#0b0b0c)] text-[10px] font-semibold text-[var(--gold)]">
          {index + 1}
        </span>
      </motion.div>
    </div>
  );
}

export function BeforeAfter({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const sectionRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <section
      ref={sectionRef}
      className={cn("relative w-full", className)}
      aria-labelledby="before-after-heading"
    >
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/55">
          Antes / Después
        </span>
        <h2
          id="before-after-heading"
          className="mt-4 font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white"
        >
          Del caos al control en{" "}
          <span className="rp-gold-text">5 movimientos</span>
        </h2>
        <p className="mt-3 text-sm text-white/55">
          Cada fricción diaria tiene su solución dentro de RestoPanel.
          {reduced ? "" : " Desliza para ver la transformación."}
        </p>
      </div>

      {/* Column headers (desktop) */}
      <div className="mt-8 hidden md:grid grid-cols-[1fr_auto_1fr] gap-6 px-1">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-rose-400/50">
          <span className="block h-px flex-1 bg-rose-400/15" />
          Sin RestoPanel
        </div>
        <div className="w-7" />
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]/70">
          <span className="block h-px flex-1 bg-[color-mix(in_oklab,var(--gold)_20%,transparent)]" />
          Con RestoPanel
        </div>
      </div>

      {/* Pairs */}
      <div className="mt-2 md:mt-4">
        {PAIRS.map((pair, i) => (
          <PairRow key={pair.id} pair={pair} index={i} />
        ))}
      </div>
    </section>
  );
}

export default BeforeAfter;
