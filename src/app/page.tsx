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
import { Fase2Hero } from "@/components/rp/sections-fase2/f2-hero";
import { Fase2Resumen, Fase2Contexto, Fase2Dominios, Fase2Dependencias, Fase2Repo } from "@/components/rp/sections-fase2/f2-a";
import { Fase2Tenancy, Fase2Eventos, Fase2Automatizaciones, Fase2Integraciones, Fase2API } from "@/components/rp/sections-fase2/f2-b";
import { Fase2Permisos, Fase2Auditoria, Fase2Notificaciones, Fase2IA, Fase2Analitica } from "@/components/rp/sections-fase2/f2-c";
import { Fase2Seguridad, Fase2Observabilidad, Fase2Datos, Fase2Contratos } from "@/components/rp/sections-fase2/f2-d";
import { Fase2ADRs, Fase2Riesgos, Fase2Roadmap, Fase2Criterios } from "@/components/rp/sections-fase2/f2-e";
import { BrandMark } from "@/components/rp/nav";

export default function Page() {
  const { phase } = usePhase();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SideNav />

      <main className="flex-1 lg:ml-72">
        {phase === "fase0" ? <Fase0 /> : phase === "fase1" ? <Fase1 /> : <Fase2 />}
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

function Fase2() {
  return (
    <>
      <Fase2Hero />
      <Fase2Resumen />
      <Fase2Contexto />
      <Fase2Dominios />
      <Fase2Dependencias />
      <Fase2Repo />
      <Fase2Tenancy />
      <Fase2Eventos />
      <Fase2Automatizaciones />
      <Fase2Integraciones />
      <Fase2API />
      <Fase2Permisos />
      <Fase2Auditoria />
      <Fase2Notificaciones />
      <Fase2IA />
      <Fase2Analitica />
      <Fase2Seguridad />
      <Fase2Observabilidad />
      <Fase2Datos />
      <Fase2Contratos />
      <Fase2ADRs />
      <Fase2Riesgos />
      <Fase2Roadmap />
      <Fase2Criterios />
    </>
  );
}

function Footer({ phase }: { phase: "fase0" | "fase1" | "fase2" }) {
  const subtitle =
    phase === "fase0"
      ? "Fase 0 · Fundación Enterprise"
      : phase === "fase1"
      ? "Fase 1.1 · Arquitectura Enterprise"
      : "Fase 1.2 · Core Platform";
  const desc =
    phase === "fase0"
      ? "Documento estratégico-arquitectónico. Borrador V0.1. Pensado para revisión crítica antes de iniciar desarrollo de producto."
      : phase === "fase1"
      ? "Especificación técnica implementable y verificable. Spec V1.1. Diseña la fundación arquitectónica multi-tenant sobre Cloudflare antes de escribir la aplicación completa."
      : "Diseño del núcleo funcional y técnico de RestoPanel. Spec V1.2. Monolito modular orientado a dominios, con eventos, automatizaciones, integraciones, IA y analítica.";
  const deliverables =
    phase === "fase0"
      ? ["Product & Brand Brief", "Mapa de dominios + contratos", "Control Plane + Tenant Cells", "Modelo de datos nuclear", "Design System base", "Roadmap y backlog priorizado"]
      : phase === "fase1"
      ? ["Arquitectura lógica + física Cloudflare", "Monorepo y reglas de dependencia", "Modelo ER + SQL D1 + diccionario", "RBAC, impersonación y threat model STRIDE", "Escalabilidad por etapas A→D", "ADRs iniciales + backlog técnico"]
      : ["14 dominios con ownership y límites", "Sistema de eventos + outbox", "Motor de automatizaciones trigger→acción", "Capa común de integraciones y API pública", "Centro de IA + analítica por eventos", "10 ADRs + roadmap por iteraciones"];
  const status1 =
    phase === "fase0" ? "Borrador V0.1" : phase === "fase1" ? "Spec V1.1 implementable" : "Spec V1.2 core design";
  const status2 =
    phase === "fase0" ? "ADRs críticos pendientes" : phase === "fase1" ? "ADRs iniciales registrados" : "10 ADRs críticos documentados";
  const status3 =
    phase === "fase0" ? "Puerta de salida no aprobada" : phase === "fase1" ? "Listo para implementación" : "Listo para implementación del core";
  const hash = phase === "fase0" ? "#inicio" : phase === "fase1" ? "#f1-inicio" : "#f2-inicio";
  const stat =
    phase === "fase0"
      ? "14 secciones · 17 dominios · 5 fases · ADR-001/002"
      : phase === "fase1"
      ? "24 secciones · 4 etapas de escala · STRIDE · ADR-001…008"
      : "23 secciones · 14 dominios · outbox + automatizaciones · ADR-001…010";
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
                  {subtitle}
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">{desc}</p>
          </div>

          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
              Entregables
            </div>
            <ul className="space-y-1.5 text-sm text-foreground/80">
              {deliverables.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
              Estado
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--teal)]" />
                <span className="text-foreground/80">{status1}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
                <span className="text-foreground/80">{status2}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                <span className="text-foreground/80">{status3}</span>
              </div>
            </div>
            <a
              href={hash}
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
          <div className="font-mono">{stat}</div>
        </div>
      </div>
    </footer>
  );
}
