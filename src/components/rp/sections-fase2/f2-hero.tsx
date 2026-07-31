import { BrandMark } from "@/components/rp/nav";
import { Pill } from "@/components/rp/primitives";

export function Fase2Hero() {
  return (
    <section id="f2-inicio" className="relative overflow-hidden scroll-mt-24">
      <div className="absolute inset-0 rp-grid-bg opacity-[0.5] pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 78% 8%, color-mix(in oklab, var(--gold) 18%, transparent), transparent 70%), radial-gradient(50% 40% at 12% 92%, color-mix(in oklab, var(--teal) 14%, transparent), transparent 70%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, var(--background))" }}
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 pt-24 pb-20 sm:pt-32 sm:pb-28 lg:ml-72">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-12 items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <Pill tone="gold">Fase 1.2 · Core Platform</Pill>
              <Pill tone="teal">Spec V1.2</Pill>
              <Pill tone="outline">14 dominios · 23 entregables</Pill>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-light tracking-tight leading-[0.95] text-balance">
              El núcleo del que
              <span className="block rp-gold-gradient mt-2">dependen todos</span>
              <span className="block text-foreground/90">los módulos.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground">
              Diseño del Core Platform de RestoPanel: un monolito modular orientado a dominios,
              preparado para extraer módulos como servicios cuando el volumen, el equipo o el
              aislamiento operativo lo justifiquen. Eventos, automatizaciones, integraciones, IA y
              analítica sobre una base multiempresa segura, auditable y trazable.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#f2-resumen"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--gold)] px-5 py-2.5 text-sm font-medium text-black hover:bg-[var(--gold-soft)] transition-colors"
              >
                Leer el resumen ejecutivo
                <span aria-hidden>→</span>
              </a>
              <a
                href="#f2-roadmap"
                className="inline-flex items-center gap-2 rounded-lg border border-border/70 px-5 py-2.5 text-sm hover:border-[var(--gold)]/50 transition-colors"
              >
                Ver roadmap por iteraciones
              </a>
            </div>

            <dl className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/40">
              {[
                ["Dominios", "14", "ownership claro"],
                ["Entregables", "23", "core platform"],
                ["ADRs", "10", "decisiones críticas"],
                ["Iteraciones", "8", "roadmap MVP"],
              ].map(([k, v, s]) => (
                <div key={k} className="bg-background p-4">
                  <dt className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {k}
                  </dt>
                  <dd className="mt-1 font-display text-2xl font-light rp-gold-text">{v}</dd>
                  <div className="text-[10px] text-muted-foreground">{s}</div>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="rp-glass-strong rounded-3xl p-8 rp-glow-gold">
              <div className="flex items-center gap-3 mb-5">
                <BrandMark className="h-10 w-10" />
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                    Núcleo
                  </div>
                  <div className="font-display text-lg">Core Platform</div>
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  "Aislamiento multiempresa por diseño",
                  "Monolito modular orientado a dominios",
                  "Eventos + outbox transaccional",
                  "Motor de automatizaciones trigger→acción",
                  "Capa común de integraciones",
                  "RBAC + ABAC y auditoría inmutable",
                  "Centro de IA con asistentes especializados",
                  "Analítica alimentada por eventos",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-2.5 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span className="text-foreground/85">{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -z-10 -inset-4 rounded-[2rem] bg-[var(--gold)]/5 blur-2xl" />
          </div>
        </div>

        <div className="mt-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRINCIPLES.map((p) => (
            <div key={p.t} className="rp-glass rounded-xl p-5">
              <div className="flex items-center gap-2 text-[var(--gold)]">
                <span className="font-mono text-xs">{p.n}</span>
                <span className="h-px flex-1 bg-[var(--gold)]/30" />
              </div>
              <div className="mt-3 font-display text-base font-medium">{p.t}</div>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{p.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const PRINCIPLES = [
  {
    n: "01",
    t: "Dominios, no capas globales",
    d: "El sistema se organiza por dominios de negocio con ownership y persistencia propia, no por capas técnicas transversales.",
  },
  {
    n: "02",
    t: "Propiedad de datos separada",
    d: "Cada dominio posee sus tablas. No hay base de datos física por dominio en el MVP, pero el aislamiento lógico existe desde el inicio.",
  },
  {
    n: "03",
    t: "Bajo acoplamiento por contratos",
    d: "Comunicación síncrona vía interfaces y asíncrona vía eventos tipados. Sin acceso directo a tablas ajenas.",
  },
  {
    n: "04",
    t: "Eventos como tejido conectivo",
    d: "Toda acción relevante publica eventos. Outbox transaccional garantiza consistencia sin double-write.",
  },
  {
    n: "05",
    t: "Pragmatismo sobre microservicios",
    d: "Monolito modular primero. Extracción a servicio solo con cuello medido, equipo suficiente y ADR.",
  },
  {
    n: "06",
    t: "Trazabilidad y degradación elegante",
    d: "Auditoría inmutable, correlation_id end-to-end y degradación controlada si falla IA, comms o integraciones.",
  },
];
