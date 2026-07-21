"use client";

import { SideNav } from "@/components/rp/nav";
import { usePhase } from "@/components/rp/phase-store";
import { Hero } from "@/components/rp/hero";
import {
  ResumenEjecutivo,
  SupuestosDecisiones,
  VisionEstrategica,
} from "@/components/rp/sections/sections-a";
import {
  ArquitecturaMarca,
  DesignSystem,
} from "@/components/rp/sections/sections-brand";
import {
  ArquitecturaFuncional,
  ArquitecturaTecnica,
  ModeloDatos,
} from "@/components/rp/sections/sections-arch";
import { FlujosUX, SeguridadCumplimiento } from "@/components/rp/sections/sections-ux";
import {
  Roadmap,
  Backlog,
  Riesgos,
  Recomendaciones,
} from "@/components/rp/sections/sections-plan";
import { Fase1Hero } from "@/components/rp/sections-fase1/f1-hero";
import { Fase1Resumen, Fase1Supuestos, Fase1Riesgos } from "@/components/rp/sections-fase1/f1-a";
import { Fase1Logica, Fase1Fisica, Fase1Diagrama } from "@/components/rp/sections-fase1/f1-b";
import { Fase1Monorepo, Fase1Tenancy, Fase1ER, Fase1Diccionario, Fase1SQL } from "@/components/rp/sections-fase1/f1-c";
import { Fase1Auth, Fase1Impersonation, Fase1Realtime } from "@/components/rp/sections-fase1/f1-d";
import { Fase1Eventos, Fase1Threat, Fase1Observabilidad } from "@/components/rp/sections-fase1/f1-e";
import { Fase1Testing, Fase1CICD, Fase1Escala, Fase1Costes, Fase1Backlog, Fase1Criterios, Fase1ADRs } from "@/components/rp/sections-fase1/f1-f";
import { BrandMark } from "@/components/rp/nav";

export default function Page() {
  const { phase } = usePhase();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SideNav />

      <main className="flex-1 lg:ml-72">
        {phase === "fase0" ? <Fase0 /> : <Fase1 />}
      </main>

      <Footer phase={phase} />
    </div>
  );
}

function Fase0() {
  return (
    <>
      <Hero />
      <ResumenEjecutivo />
      <SupuestosDecisiones />
      <VisionEstrategica />
      <ArquitecturaMarca />
      <DesignSystem />
      <ArquitecturaFuncional />
      <ArquitecturaTecnica />
      <ModeloDatos />
      <FlujosUX />
      <SeguridadCumplimiento />
      <Roadmap />
      <Backlog />
      <Riesgos />
      <Recomendaciones />
    </>
  );
}

function Fase1() {
  return (
    <>
      <Fase1Hero />
      <Fase1Resumen />
      <Fase1Supuestos />
      <Fase1Riesgos />
      <Fase1Logica />
      <Fase1Fisica />
      <Fase1Diagrama />
      <Fase1Monorepo />
      <Fase1Tenancy />
      <Fase1ER />
      <Fase1Diccionario />
      <Fase1SQL />
      <Fase1Auth />
      <Fase1Impersonation />
      <Fase1Realtime />
      <Fase1Eventos />
      <Fase1Threat />
      <Fase1Observabilidad />
      <Fase1Testing />
      <Fase1CICD />
      <Fase1Escala />
      <Fase1Costes />
      <Fase1Backlog />
      <Fase1Criterios />
      <Fase1ADRs />
    </>
  );
}

function Footer({ phase }: { phase: "fase0" | "fase1" }) {
  return (
    <footer className="mt-auto lg:ml-72 border-t border-border/60 rp-glass-strong">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2.5">
              <BrandMark className="h-8 w-8" />
              <div className="leading-tight">
                <div className="font-display text-lg tracking-tight">RestoPanel</div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                  {phase === "fase0"
                    ? "Fase 0 · Fundación Enterprise"
                    : "Fase 1.1 · Arquitectura Enterprise"}
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
              {phase === "fase0"
                ? "Documento estratégico-arquitectónico. Borrador V0.1. Pensado para revisión crítica antes de iniciar desarrollo de producto."
                : "Especificación técnica implementable y verificable. Spec V1.1. Diseña la fundación arquitectónica multi-tenant sobre Cloudflare antes de escribir la aplicación completa."}
            </p>
          </div>

          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
              {phase === "fase0" ? "Entregables de la Fase 0" : "Entregables de la Fase 1.1"}
            </div>
            <ul className="space-y-1.5 text-sm text-foreground/80">
              {phase === "fase0" ? (
                <>
                  <li>Product & Brand Brief</li>
                  <li>Mapa de dominios + contratos</li>
                  <li>Control Plane + Tenant Cells</li>
                  <li>Modelo de datos nuclear</li>
                  <li>Design System base</li>
                  <li>Roadmap y backlog priorizado</li>
                </>
              ) : (
                <>
                  <li>Arquitectura lógica + física Cloudflare</li>
                  <li>Monorepo y reglas de dependencia</li>
                  <li>Modelo ER + SQL D1 + diccionario</li>
                  <li>RBAC, impersonación y threat model STRIDE</li>
                  <li>Escalabilidad por etapas A→D</li>
                  <li>ADRs iniciales + backlog técnico</li>
                </>
              )}
            </ul>
          </div>

          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
              Estado
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--teal)]" />
                <span className="text-foreground/80">
                  {phase === "fase0" ? "Borrador V0.1" : "Spec V1.1 implementable"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
                <span className="text-foreground/80">
                  {phase === "fase0" ? "ADRs críticos pendientes" : "ADRs iniciales registrados"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                <span className="text-foreground/80">
                  {phase === "fase0" ? "Puerta de salida no aprobada" : "Listo para implementación"}
                </span>
              </div>
            </div>
            <a
              href={phase === "fase0" ? "#inicio" : "#f1-inicio"}
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border/70 px-3 py-1.5 text-xs hover:border-[var(--gold)]/50 transition-colors"
            >
              Volver arriba <span aria-hidden>↑</span>
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>
            RestoPanel · La plataforma inteligente para gestionar restaurantes sin límites.
            Documento interno de arquitectura, no publicidad.
          </div>
          <div className="font-mono">
            {phase === "fase0"
              ? "14 secciones · 17 dominios · 5 fases · ADR-001/002"
              : "24 secciones · 4 etapas de escala · STRIDE · ADR-001…008"}
          </div>
        </div>
      </div>
    </footer>
  );
}
