"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, BellRing, Crown, LayoutDashboard } from "lucide-react";
import { ExecAi } from "./exec-ai";
import { ExecAlerts } from "./exec-alerts";
import { ExecCockpit } from "./exec-cockpit";

type ExecTab = "cockpit" | "ai" | "alerts";

const TABS: { id: ExecTab; label: string; icon: React.ElementType; description: string }[] = [
  {
    id: "cockpit",
    label: "Cockpit",
    icon: LayoutDashboard,
    description: "Dashboard ejecutivo con widgets, KPIs, forecast, comparativas y heatmaps",
  },
  {
    id: "ai",
    label: "IA Ejecutiva",
    icon: Sparkles,
    description: "Asistente conversacional con citas, razonamiento y profundización",
  },
  {
    id: "alerts",
    label: "Centro de Alertas",
    icon: BellRing,
    description: "Alertas inteligentes con acciones y recomendaciones de IA",
  },
];

export function ExecutiveView() {
  const reduceMotion = useReducedMotion();
  const [tab, setTab] = React.useState<ExecTab>("cockpit");

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] flex items-center justify-center text-black ring-1 ring-[var(--gold)]/40 shrink-0">
            <Crown className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-medium tracking-tight truncate">
                Centro de Control Ejecutivo
              </h1>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-amber-400/40 bg-amber-400/10 text-amber-300">
                demo
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              IA Ejecutiva + Alertas Inteligentes · ana.martinez@ramsesgroup.com
            </p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto rp-scroll-thin -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "shrink-0 min-h-[44px] inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors",
              tab === t.id
                ? "border-[var(--gold)]/50 bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                : "border-border/60 bg-foreground/[0.02] text-muted-foreground hover:text-foreground hover:border-foreground/30"
            )}
            aria-pressed={tab === t.id}
          >
            <t.icon className="h-4 w-4" aria-hidden />
            <span className="font-medium">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "cockpit" ? <ExecCockpit /> : tab === "ai" ? <ExecAi /> : <ExecAlerts />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
