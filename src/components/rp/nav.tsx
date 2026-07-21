"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { usePhase, type Phase } from "./phase-store";

export const NAV_FASE0 = [
  { id: "inicio", label: "Inicio", n: "00" },
  { id: "resumen", label: "Resumen ejecutivo", n: "01" },
  { id: "supuestos", label: "Supuestos y decisiones", n: "02" },
  { id: "vision", label: "Visión estratégica", n: "03" },
  { id: "marca", label: "Arquitectura de marca", n: "04" },
  { id: "design-system", label: "Design System", n: "05" },
  { id: "arq-funcional", label: "Arquitectura funcional", n: "06" },
  { id: "arq-tecnica", label: "Arquitectura técnica", n: "07" },
  { id: "datos", label: "Modelo de datos", n: "08" },
  { id: "ux", label: "Flujos UX", n: "09" },
  { id: "seguridad", label: "Seguridad y cumplimiento", n: "10" },
  { id: "roadmap", label: "Roadmap", n: "11" },
  { id: "backlog", label: "Backlog priorizado", n: "12" },
  { id: "riesgos", label: "Riesgos y decisiones", n: "13" },
  { id: "recomendaciones", label: "Recomendaciones finales", n: "14" },
];

export const NAV_FASE1 = [
  { id: "f1-inicio", label: "Inicio", n: "00" },
  { id: "f1-resumen", label: "Resumen ejecutivo", n: "01" },
  { id: "f1-supuestos", label: "Supuestos y validación", n: "02" },
  { id: "f1-riesgos", label: "Riesgos y contradicciones", n: "03" },
  { id: "f1-logica", label: "Arquitectura lógica", n: "04" },
  { id: "f1-fisica", label: "Arquitectura física (CF)", n: "05" },
  { id: "f1-diagrama", label: "Diagrama general", n: "06" },
  { id: "f1-monorepo", label: "Monorepo y dependencias", n: "07" },
  { id: "f1-tenancy", label: "Modelo multi-tenant", n: "08" },
  { id: "f1-er", label: "Modelo ER", n: "09" },
  { id: "f1-diccionario", label: "Diccionario de datos", n: "10" },
  { id: "f1-sql", label: "SQL inicial (D1)", n: "11" },
  { id: "f1-auth", label: "Autenticación y permisos", n: "12" },
  { id: "f1-impersonation", label: "Impersonación segura", n: "13" },
  { id: "f1-realtime", label: "Estrategia tiempo real", n: "14" },
  { id: "f1-eventos", label: "Eventos, colas, webhooks", n: "15" },
  { id: "f1-threat", label: "Seguridad y threat model", n: "16" },
  { id: "f1-observabilidad", label: "Observabilidad", n: "17" },
  { id: "f1-testing", label: "Estrategia de testing", n: "18" },
  { id: "f1-cicd", label: "CI/CD y entornos", n: "19" },
  { id: "f1-escala", label: "Escalabilidad A→D", n: "20" },
  { id: "f1-costes", label: "Costes y factores", n: "21" },
  { id: "f1-backlog", label: "Backlog técnico", n: "22" },
  { id: "f1-criterios", label: "Criterios de aceptación", n: "23" },
  { id: "f1-adrs", label: "ADRs iniciales", n: "24" },
];

export const NAV_FASE2 = [
  { id: "f2-inicio", label: "Inicio", n: "00" },
  { id: "f2-resumen", label: "Resumen y decisiones", n: "01" },
  { id: "f2-contexto", label: "Contexto y contenedores", n: "02" },
  { id: "f2-dominios", label: "Mapa de dominios", n: "03" },
  { id: "f2-dependencias", label: "Matriz de dependencias", n: "04" },
  { id: "f2-repo", label: "Estructura del repositorio", n: "05" },
  { id: "f2-tenancy", label: "Modelo multiempresa", n: "06" },
  { id: "f2-eventos", label: "Sistema de eventos", n: "07" },
  { id: "f2-automatizaciones", label: "Motor de automatizaciones", n: "08" },
  { id: "f2-integraciones", label: "Integraciones y webhooks", n: "09" },
  { id: "f2-api", label: "API pública", n: "10" },
  { id: "f2-permisos", label: "Diseño de permisos", n: "11" },
  { id: "f2-auditoria", label: "Auditoría", n: "12" },
  { id: "f2-notificaciones", label: "Centro de notificaciones", n: "13" },
  { id: "f2-ia", label: "Centro de IA", n: "14" },
  { id: "f2-analitica", label: "Analítica y métricas", n: "15" },
  { id: "f2-seguridad", label: "Seguridad y cumplimiento", n: "16" },
  { id: "f2-observabilidad", label: "Observabilidad y HA", n: "17" },
  { id: "f2-datos", label: "Modelo de datos ER", n: "18" },
  { id: "f2-contratos", label: "Contratos TypeScript", n: "19" },
  { id: "f2-adrs", label: "ADRs críticos", n: "20" },
  { id: "f2-riesgos", label: "Riesgos y trade-offs", n: "21" },
  { id: "f2-roadmap", label: "Roadmap por iteraciones", n: "22" },
  { id: "f2-criterios", label: "Criterios de aceptación", n: "23" },
];

export const NAV_FASE4 = [
  { id: "f4-inicio", label: "Inicio", n: "00" },
  { id: "f4-resumen", label: "Resumen y arquitectura", n: "01" },
  { id: "f4-carpetas", label: "Arquitectura de carpetas", n: "02" },
  { id: "f4-cloudflare", label: "Servicios Cloudflare", n: "03" },
  { id: "f4-sql", label: "Esquema D1 completo (SQL)", n: "04" },
  { id: "f4-migraciones", label: "Migraciones y seed", n: "05" },
  { id: "f4-tenancy", label: "Contexto multi-tenant", n: "06" },
  { id: "f4-auth", label: "Autenticación y middleware", n: "07" },
  { id: "f4-rbac", label: "RBAC Enterprise", n: "08" },
  { id: "f4-auditoria", label: "Auditoría y soft delete", n: "09" },
  { id: "f4-repositorios", label: "Reservas, clientes, mesas", n: "10" },
  { id: "f4-do", label: "Durable Objects (plano)", n: "11" },
  { id: "f4-queues", label: "Queues y consumers", n: "12" },
  { id: "f4-r2-ai", label: "R2 y AI Gateway", n: "13" },
  { id: "f4-cache", label: "Caché namespaced", n: "14" },
  { id: "f4-billing", label: "Facturación (Stripe)", n: "15" },
  { id: "f4-crm", label: "CRM y reputación", n: "16" },
  { id: "f4-dashboard", label: "Dashboard, hooks y widgets", n: "17" },
  { id: "f4-tests", label: "Tests (aislamiento, RBAC, concurrencia)", n: "18" },
  { id: "f4-seguridad", label: "Seguridad avanzada", n: "19" },
  { id: "f4-observabilidad", label: "Observabilidad", n: "20" },
  { id: "f4-deploy", label: "Despliegue y variables de entorno", n: "21" },
  { id: "f4-migracion", label: "Migración y rollback", n: "22" },
  { id: "f4-criterios", label: "Criterios de aceptación", n: "23" },
];

export function SideNav() {
  const { phase, setPhase } = usePhase();
  const items =
    phase === "fase0" ? NAV_FASE0 : phase === "fase1" ? NAV_FASE1 : phase === "fase2" ? NAV_FASE2 : NAV_FASE4;
  const [active, setActive] = React.useState(items[0].id);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items, phase]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 rp-glass-strong border-b border-border/60">
        <div className="flex items-center justify-between px-4 h-14">
          <a href={phase === "fase0" ? "#inicio" : phase === "fase1" ? "#f1-inicio" : phase === "fase2" ? "#f2-inicio" : "#f4-inicio"} className="flex items-center gap-2">
            <BrandMark className="h-7 w-7" />
            <span className="font-display text-lg tracking-tight">RestoPanel</span>
          </a>
          <div className="flex items-center gap-2">
            <PhaseToggle compact />
            <button
              onClick={() => setOpen((v) => !v)}
              className="rounded-md border border-border/60 px-3 py-1.5 text-xs font-mono uppercase tracking-wider"
              aria-expanded={open}
              aria-label="Abrir índice"
            >
              {open ? "Cerrar" : "Índice"}
            </button>
          </div>
        </div>
        {open ? (
          <nav className="max-h-[70vh] overflow-y-auto rp-scroll-thin border-t border-border/60 px-4 py-3">
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors",
                      active === item.id
                        ? "bg-[var(--gold)]/10 text-[var(--gold-soft)]"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                    )}
                  >
                    <span className="font-mono text-[10px] opacity-60">{item.n}</span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 z-40 h-screen w-72 flex-col border-r border-border/60 rp-glass-strong">
        <a href={phase === "fase0" ? "#inicio" : phase === "fase1" ? "#f1-inicio" : phase === "fase2" ? "#f2-inicio" : "#f4-inicio"} className="flex items-center gap-3 px-6 h-16 border-b border-border/60">
          <BrandMark className="h-8 w-8" />
          <div className="leading-tight">
            <div className="font-display text-lg tracking-tight">RestoPanel</div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              {phase === "fase0" ? "Fase 0 · Fundación" : phase === "fase1" ? "Fase 1.1 · Arquitectura" : phase === "fase2" ? "Fase 1.2 · Core Platform" : "Fase 4 · Motor Enterprise"}
            </div>
          </div>
        </a>

        <div className="px-4 py-3">
          <PhaseToggle />
        </div>

        <div className="px-4 pb-1 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
          Índice del entregable
        </div>
        <nav className="flex-1 overflow-y-auto rp-scroll-thin px-3 pb-6">
          <ul className="space-y-0.5">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    active === item.id
                      ? "bg-[var(--gold)]/10 text-[var(--gold-soft)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-[10px] tabular-nums transition-colors",
                      active === item.id ? "text-[var(--gold)]" : "opacity-50"
                    )}
                  >
                    {item.n}
                  </span>
                  <span className="truncate">{item.label}</span>
                  {active === item.id ? (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-border/60 px-6 py-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            Estado del documento
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--teal)] animate-pulse" />
            <span className="text-foreground/80">
              {phase === "fase0" ? "Borrador V0.1 · ADR pendiente" : phase === "fase1" ? "Spec V1.1 · implementable" : phase === "fase2" ? "Spec V1.2 · core design" : "Spec V4 · motor enterprise"}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

function PhaseToggle({ compact = false }: { compact?: boolean }) {
  const { phase, setPhase } = usePhase();
  const btn = (p: Phase, label: string) => (
    <button
      onClick={() => setPhase(p)}
      className={cn(
        "rounded-md px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider transition-colors",
        phase === p ? "bg-[var(--gold)] text-black" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
  return (
    <div className={cn("inline-flex rounded-lg border border-border/60 p-0.5 bg-background/40", compact && "scale-90")}>
      {btn("fase0", "F0")}
      {btn("fase1", "F1.1")}
      {btn("fase2", "F1.2")}
      {btn("fase4", "F4")}
    </div>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-lg overflow-hidden",
        className
      )}
      style={{
        background: "radial-gradient(circle at 30% 25%, #1a1815 0%, #0c0b0a 70%)",
        boxShadow:
          "inset 0 0 0 1px color-mix(in oklab, var(--gold) 35%, transparent), 0 2px 12px -2px color-mix(in oklab, var(--gold) 40%, transparent)",
      }}
    >
      <svg viewBox="0 0 32 32" fill="none" className="h-[78%] w-[78%]">
        <rect x="6" y="6" width="20" height="20" rx="3" stroke="#D4AF37" strokeWidth="1.5" opacity="0.55" />
        <path
          d="M11 22V10h5.2c2.1 0 3.6 1.2 3.6 3.2 0 1.5-.9 2.5-2.3 2.9L20.5 22h-2.4l-2.6-5.6H13V22h-2z"
          fill="#D4AF37"
        />
        <circle cx="22.5" cy="9.5" r="1.2" fill="#3DD6C9" />
      </svg>
    </span>
  );
}
