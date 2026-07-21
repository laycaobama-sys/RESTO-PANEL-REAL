import { SideNav, BrandMark } from "@/components/rp/nav";
import { Hero } from "@/components/rp/hero";
import { ResumenEjecutivo, SupuestosDecisiones, VisionEstrategica } from "@/components/rp/sections/sections-a";
import { ArquitecturaMarca, DesignSystem } from "@/components/rp/sections/sections-brand";
import { ArquitecturaFuncional, ArquitecturaTecnica, ModeloDatos } from "@/components/rp/sections/sections-arch";
import { FlujosUX, SeguridadCumplimiento } from "@/components/rp/sections/sections-ux";
import { Roadmap, Backlog, Riesgos, Recomendaciones } from "@/components/rp/sections/sections-plan";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SideNav />

      <main className="flex-1 lg:ml-72">
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
      </main>

      <Footer />
    </div>
  );
}

function Footer() {
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
                  Fase 0 · Fundación Enterprise
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Documento estratégico-arquitectónico. Borrador V0.1. Pensado para revisión crítica
              antes de iniciar desarrollo de producto.
            </p>
          </div>

          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
              Entregables de la Fase 0
            </div>
            <ul className="space-y-1.5 text-sm text-foreground/80">
              <li>Product & Brand Brief</li>
              <li>Mapa de dominios + contratos</li>
              <li>Control Plane + Tenant Cells</li>
              <li>Modelo de datos nuclear</li>
              <li>Design System base</li>
              <li>Roadmap y backlog priorizado</li>
            </ul>
          </div>

          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
              Estado
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--teal)]" />
                <span className="text-foreground/80">Borrador V0.1</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
                <span className="text-foreground/80">ADRs críticos pendientes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                <span className="text-foreground/80">Puerta de salida no aprobada</span>
              </div>
            </div>
            <a
              href="#inicio"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border/70 px-3 py-1.5 text-xs hover:border-[var(--gold)]/50 transition-colors"
            >
              Volver arriba <span aria-hidden>↑</span>
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>
            RestoPanel · El sistema operativo del restaurante moderno. Documento interno de
            arquitectura, no publicidad.
          </div>
          <div className="font-mono">
            14 secciones · 17 dominios · 5 fases · ADR-001/002
          </div>
        </div>
      </div>
    </footer>
  );
}
