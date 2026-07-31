import { BrandMark } from "@/components/rp/nav";
import { Pill } from "@/components/rp/primitives";

const ARCH_FACTS = [
  "Multi-tenant desde el día 1",
  "D1 canónico con sharding por celdas",
  "Tenant Enforcement Layer (sin RLS simulada)",
  "Modular monolith sobre Workers",
  "4 etapas de escala A→D",
];

const PRINCIPLES_F1 = [
  {
    n: "01",
    t: "Aislamiento estricto de datos por organización",
    d: "Ningún acceso cross-tenant: constraints compuestos, repositorios con organization_id obligatorio y tests IDOR en CI.",
  },
  {
    n: "02",
    t: "El navegador nunca decide el tenant",
    d: "Toda request resuelve organización, celda, membresía y permisos en servidor. El org_id del cliente no es autoridad.",
  },
  {
    n: "03",
    t: "D1 canónico; cachés no deciden",
    d: "D1 es la fuente de verdad transaccional. KV, R2, Durable Objects y cachés nunca sustituyen el registro canónico.",
  },
  {
    n: "04",
    t: "Contratos públicos entre módulos; sin dependencias circulares",
    d: "Comandos, queries, eventos e interfaces explícitas. Ningún módulo accede a tablas internas ajenas.",
  },
  {
    n: "05",
    t: "Idempotencia y degradación elegante",
    d: "Toda operación externa es idempotente. Si falla IA, WhatsApp o email, la operación de sala continúa.",
  },
  {
    n: "06",
    t: "Medir antes de optimizar; ADR para lo irreversible",
    d: "Se modulariza antes de distribuir. Cada decisión costosa o irreversible se documenta con un ADR.",
  },
];

export function Fase1Hero() {
  return (
    <section id="f1-inicio" className="relative overflow-hidden scroll-mt-24">
      {/* ambient layers */}
      <div className="absolute inset-0 rp-grid-bg opacity-[0.5] pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 75% 10%, color-mix(in oklab, var(--gold) 16%, transparent), transparent 70%), radial-gradient(50% 40% at 15% 90%, color-mix(in oklab, var(--teal) 12%, transparent), transparent 70%)",
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
              <Pill tone="gold">Fase 1.1 · Arquitectura Enterprise</Pill>
              <Pill tone="teal">Spec V1.1</Pill>
              <Pill tone="outline">Implementable</Pill>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-light tracking-tight leading-[0.95] text-balance">
              <span className="rp-gold-gradient">Arquitectura fundacional</span>
              <span className="block text-foreground/90">multi-tenant</span>
              <span className="block text-foreground/90">sobre Cloudflare.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground">
              Especificación técnica implementable y verificable de RestoPanel: plataforma SaaS
              para gestionar restaurantes, grupos y múltiples ubicaciones, diseñada para escalar de
              1 a más de 100.000 restaurantes sin reescrituras traumáticas.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#f1-resumen"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--gold)] px-5 py-2.5 text-sm font-medium text-black hover:bg-[var(--gold-soft)] transition-colors"
              >
                Leer el resumen ejecutivo
                <span aria-hidden>→</span>
              </a>
              <a
                href="#f1-escala"
                className="inline-flex items-center gap-2 rounded-lg border border-border/70 px-5 py-2.5 text-sm hover:border-[var(--gold)]/50 transition-colors"
              >
                Ver escalabilidad A→D
              </a>
            </div>

            <dl className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/40">
              {[
                ["Entregables", "24", "spec V1.1"],
                ["Dominios", "17", "ownership claro"],
                ["Etapa objetivo", "100k+", "restaurantes"],
                ["ADRs iniciales", "8", "decisiones blindadas"],
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

          {/* Architectural facts glass card */}
          <div className="relative">
            <div className="rp-glass-strong rounded-3xl p-8 rp-glow-teal">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                    Hechos arquitectónicos
                  </div>
                  <div className="font-display text-lg">Cimientos RestoPanel</div>
                </div>
                <BrandMark className="h-10 w-10" />
              </div>
              <ul className="space-y-3">
                {ARCH_FACTS.map((fact, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gold)]" />
                    <span className="text-foreground/90">{fact}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-5 border-t border-border/40 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--teal)] animate-pulse" />
                Spec V1.1 · implementable
              </div>
            </div>
            <div className="absolute -z-10 -inset-4 rounded-[2rem] bg-[var(--teal)]/5 blur-2xl" />
          </div>
        </div>

        {/* Principles strip — 6 non-negotiables */}
        <div className="mt-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRINCIPLES_F1.map((p) => (
            <div key={p.n} className="rp-glass rounded-xl p-5">
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
