"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
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

export function SideNav() {
  const [active, setActive] = React.useState("inicio");
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
    NAV_ITEMS.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 rp-glass-strong border-b border-border/60">
        <div className="flex items-center justify-between px-4 h-14">
          <a href="#inicio" className="flex items-center gap-2">
            <BrandMark className="h-7 w-7" />
            <span className="font-display text-lg tracking-tight">RestoPanel</span>
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-md border border-border/60 px-3 py-1.5 text-xs font-mono uppercase tracking-wider"
            aria-expanded={open}
            aria-label="Abrir índice"
          >
            {open ? "Cerrar" : "Índice"}
          </button>
        </div>
        {open ? (
          <nav className="max-h-[70vh] overflow-y-auto rp-scroll-thin border-t border-border/60 px-4 py-3">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => (
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
        <a href="#inicio" className="flex items-center gap-3 px-6 h-16 border-b border-border/60">
          <BrandMark className="h-8 w-8" />
          <div className="leading-tight">
            <div className="font-display text-lg tracking-tight">RestoPanel</div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Fase 0 · Fundación
            </div>
          </div>
        </a>
        <div className="px-4 py-3 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
          Índice del entregable
        </div>
        <nav className="flex-1 overflow-y-auto rp-scroll-thin px-3 pb-6">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
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
            <span className="text-foreground/80">Borrador V0.1 · ADR pendiente</span>
          </div>
        </div>
      </aside>
    </>
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
        background:
          "radial-gradient(circle at 30% 25%, #1a1815 0%, #0c0b0a 70%)",
        boxShadow:
          "inset 0 0 0 1px color-mix(in oklab, var(--gold) 35%, transparent), 0 2px 12px -2px color-mix(in oklab, var(--gold) 40%, transparent)",
      }}
    >
      {/* Stylized "R" panel mark rendered as inline SVG to avoid asset dependency */}
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
