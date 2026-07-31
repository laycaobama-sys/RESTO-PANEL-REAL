"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Cpu, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { AiOsDashboard } from "./ai-os-dashboard";
import { AiOsAgents } from "./ai-os-agents";

type AiOsView = "dashboard" | "agents";

export function AiOsView() {
  const reduceMotion = useReducedMotion();
  const [view, setView] = React.useState<AiOsView>("dashboard");

  const TABS: { id: AiOsView; label: string; icon: React.ElementType; description: string }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Cpu,
      description: "Sistema operativo de IA — qué pasa ahora, qué riesgo gestionar, qué acción tomar",
    },
    {
      id: "agents",
      label: "Sistema Multi-Agente",
      icon: Users,
      description: "Vista detallada de los 6 agentes especializados + Executive Agent coordinador",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* View switcher */}
      <div className="flex gap-1.5 overflow-x-auto rp-scroll-thin -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className={cn(
              "shrink-0 min-h-[44px] inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors",
              view === t.id
                ? "border-[var(--gold)]/50 bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                : "border-border/60 bg-foreground/[0.02] text-muted-foreground hover:text-foreground hover:border-foreground/30"
            )}
            aria-pressed={view === t.id}
          >
            <t.icon className="h-4 w-4" aria-hidden />
            <span className="font-medium">{t.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {view === "dashboard" ? <AiOsDashboard /> : <AiOsAgents />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
