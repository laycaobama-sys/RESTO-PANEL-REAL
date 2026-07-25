"use client";

/**
 * WhyBento — asymmetric bento grid of 9 benefit cells.
 * - 9 benefits, each with title + backing metric + micro-animation
 * - responsive: 3 cols desktop, 2 tablet, 1 mobile
 * - hover: scale 1.02 + glow
 * - prefers-reduced-motion: static
 */

import * as React from "react";
import { motion, useReducedMotion, type Transition } from "framer-motion";
import {
  TrendingUp,
  CalendarX2,
  Star,
  Ticket,
  HeartHandshake,
  Clock,
  Bot,
  LineChart,
  Building2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Benefit {
  id: string;
  title: string;
  metric: string;
  metricLabel: string;
  icon: LucideIcon;
  /** cell sizing on lg grid: col span / row span */
  span?: "sm" | "md" | "lg";
  accent?: "gold" | "teal";
}

const BENEFITS: Benefit[] = [
  { id: "b1", title: "Más reservas",          metric: "+12%",  metricLabel: "promedio",   icon: TrendingUp,    span: "lg", accent: "gold" },
  { id: "b2", title: "Menos cancelaciones",   metric: "-71%",  metricLabel: "no-shows",    icon: CalendarX2,    span: "md", accent: "teal" },
  { id: "b3", title: "Mejor reputación",      metric: "4.9★",  metricLabel: "media",       icon: Star,         span: "sm", accent: "gold" },
  { id: "b4", title: "Mayor ticket",          metric: "+18%",  metricLabel: "con CRM",     icon: Ticket,       span: "sm", accent: "gold" },
  { id: "b5", title: "Clientes fidelizados",  metric: "65%",   metricLabel: "recurrencia", icon: HeartHandshake, span: "md", accent: "teal" },
  { id: "b6", title: "Menos trabajo manual", metric: "47h",   metricLabel: "/mes ahorradas", icon: Clock,     span: "lg", accent: "gold" },
  { id: "b7", title: "IA que trabaja sola",   metric: "24/7",  metricLabel: "predicciones", icon: Bot,          span: "md", accent: "teal" },
  { id: "b8", title: "Decisiones con datos",  metric: "85%",   metricLabel: "precisión",   icon: LineChart,     span: "sm", accent: "gold" },
  { id: "b9", title: "Plataforma que escala", metric: "1→100+", metricLabel: "locales",   icon: Building2,    span: "sm", accent: "teal" },
];

const SPAN_LG: Record<Benefit["span"] | "default", string> = {
  sm: "lg:col-span-3 lg:row-span-1",
  md: "lg:col-span-4 lg:row-span-1",
  lg: "lg:col-span-5 lg:row-span-2",
  default: "lg:col-span-3 lg:row-span-1",
};

const ACCENT_TEXT = {
  gold: "text-[var(--gold)]",
  teal: "text-[var(--teal)]",
} as const;

const ACCENT_GLOW = {
  gold: "hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--gold)_30%,transparent),0_18px_60px_-22px_color-mix(in_oklab,var(--gold)_45%,transparent)]",
  teal: "hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--teal)_30%,transparent),0_18px_60px_-22px_color-mix(in_oklab,var(--teal)_45%,transparent)]",
} as const;

const ACCENT_BG = {
  gold: "bg-[color-mix(in_oklab,var(--gold)_14%,transparent)]",
  teal: "bg-[color-mix(in_oklab,var(--teal)_14%,transparent)]",
} as const;

function BentoCell({
  benefit,
  index,
}: {
  benefit: Benefit;
  index: number;
}) {
  const reduced = useReducedMotion();
  const Icon = benefit.icon;
  const spanCls = SPAN_LG[benefit.span ?? "default"];

  // Micro animations vary by cell to keep grid lively
  const t: Transition = reduced
    ? { duration: 0 }
    : { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: (index % 9) * 0.05 };

  // Big-card pulsing metric; small-card shimmer underline
  const bigPulse = benefit.span === "lg" && !reduced;
  const shimmer = benefit.span !== "lg" && !reduced;

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 18, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={t}
      whileHover={reduced ? undefined : { scale: 1.02 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/[0.06]",
        "bg-white/[0.025] p-5",
        "transition-shadow duration-300",
        ACCENT_GLOW[benefit.accent ?? "gold"],
        spanCls,
      )}
    >
      {/* Decorative gradient blob */}
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-25 blur-3xl transition-opacity duration-500 group-hover:opacity-50",
          ACCENT_BG[benefit.accent ?? "gold"],
        )}
        aria-hidden
      />

      {/* Icon */}
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg",
          ACCENT_BG[benefit.accent ?? "gold"],
          ACCENT_TEXT[benefit.accent ?? "gold"],
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Title */}
      <h3 className="mt-3 text-sm font-medium text-white/85">
        {benefit.title}
      </h3>

      {/* Metric + label */}
      <div className="mt-2 flex items-baseline gap-1.5">
        <motion.span
          className={cn(
            "font-display text-2xl sm:text-3xl font-semibold tracking-tight",
            ACCENT_TEXT[benefit.accent ?? "gold"],
            bigPulse && "tabular-nums",
          )}
          animate={
            bigPulse
              ? { opacity: [0.85, 1, 0.85] }
              : undefined
          }
          transition={
            bigPulse
              ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
              : undefined
          }
        >
          {benefit.metric}
        </motion.span>
        <span className="text-[11px] text-white/40">{benefit.metricLabel}</span>
      </div>

      {/* Shimmer underline for non-lg cells */}
      {shimmer ? (
        <div className="mt-3 h-px w-full overflow-hidden">
          <motion.div
            className={cn(
              "block h-full w-1/3",
              ACCENT_BG[benefit.accent ?? "gold"],
            )}
            style={{ filter: "brightness(1.4)" }}
            animate={{ x: ["-110%", "320%"] }}
            transition={{
              duration: 2.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: (index % 5) * 0.4,
            }}
          />
        </div>
      ) : null}

      {/* Big-card mini progress bar */}
      {bigPulse ? (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
          <motion.div
            className={cn(
              "block h-full rounded-full",
              ACCENT_BG[benefit.accent ?? "gold"],
            )}
            style={{ filter: "brightness(1.3)" }}
            initial={{ width: "0%" }}
            whileInView={{ width: "78%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      ) : null}
    </motion.div>
  );
}

export function WhyBento({ className }: { className?: string }) {
  return (
    <section className={cn("w-full", className)} aria-labelledby="why-bento-heading">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/55">
          Por qué RestoPanel
        </span>
        <h2
          id="why-bento-heading"
          className="mt-4 font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white"
        >
          9 razones que cambian tu{" "}
          <span className="rp-gold-text">cuenta de resultados</span>
        </h2>
        <p className="mt-3 text-sm text-white/55">
          Métricas reales agregadas de 1.200+ restaurantes en España.
        </p>
      </div>

      {/* Asymmetric grid */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 lg:grid-rows-2 gap-3 sm:gap-4">
        {BENEFITS.map((b, i) => (
          <BentoCell key={b.id} benefit={b} index={i} />
        ))}
      </div>
    </section>
  );
}

export default WhyBento;
