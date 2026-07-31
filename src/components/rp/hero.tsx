import { BrandMark } from "./nav";
import { Pill } from "./primitives";
import Image from "next/image";

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden scroll-mt-24">
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
              <Pill tone="gold">Fase 0 · Fundación Enterprise</Pill>
              <Pill tone="teal">Borrador V0.1</Pill>
              <Pill tone="outline">Pre-código</Pill>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-light tracking-tight leading-[0.95] text-balance">
              RestoPanel
              <span className="block rp-gold-gradient mt-2">el sistema operativo</span>
              <span className="block text-foreground/90">del restaurante moderno.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground">
              Plataforma SaaS multiempresa para hostelería que centraliza reservas, sala, CRM,
              personal, comunicaciones, reputación, automatización e IA. Diseñada para crecer de un
              restaurante independiente a miles de locales sin reconstruir tenancy, seguridad,
              billing ni contratos entre módulos.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#resumen"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--gold)] px-5 py-2.5 text-sm font-medium text-black hover:bg-[var(--gold-soft)] transition-colors"
              >
                Leer el resumen ejecutivo
                <span aria-hidden>→</span>
              </a>
              <a
                href="#roadmap"
                className="inline-flex items-center gap-2 rounded-lg border border-border/70 px-5 py-2.5 text-sm hover:border-[var(--gold)]/50 transition-colors"
              >
                Ver roadmap por fases
              </a>
            </div>

            <dl className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/40">
              {[
                ["Dominios", "17", "ownership claro"],
                ["Apps", "6", "experiencias"],
                ["Packages", "21", "contratos"],
                ["Fases", "5", "0 → 4"],
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

          {/* Brand mark showcase */}
          <div className="relative">
            <div className="rp-glass-strong rounded-3xl p-8 rp-glow-gold">
              <div className="aspect-square rounded-2xl overflow-hidden relative flex items-center justify-center"
                style={{ background: "radial-gradient(circle at 50% 35%, #1c1a16, #0a0a0b)" }}>
                <Image
                  src="/brand/isotipo.png"
                  alt="Isotipo de RestoPanel — marca dorada sobre fondo oscuro"
                  fill
                  className="object-contain p-6"
                  priority
                  sizes="(max-width: 1024px) 80vw, 30vw"
                />
              </div>
              <div className="mt-5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                    Isotipo · v0.1
                  </div>
                  <div className="font-display text-lg">RestoPanel Mark</div>
                </div>
                <BrandMark className="h-10 w-10" />
              </div>
            </div>
            <div className="absolute -z-10 -inset-4 rounded-[2rem] bg-[var(--gold)]/5 blur-2xl" />
          </div>
        </div>

        {/* Principles strip */}
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
    t: "organization es la frontera",
    d: "Aislamiento y facturación se anclan en la organización. location existe desde el día uno aunque se empiece con un solo restaurante.",
  },
  {
    n: "02",
    t: "D1 canónico, cachés no deciden",
    d: "D1 es la fuente de verdad transaccional. KV, R2, Durable Objects y cachés nunca sustituyen el registro canónico.",
  },
  {
    n: "03",
    t: "El navegador no decide el tenant",
    d: "Toda request resuelve organización, celda, membresía, permisos y entitlement en servidor. El organization_id del cliente no es autoridad.",
  },
  {
    n: "04",
    t: "Contratos entre dominios",
    d: "Los módulos se comunican mediante comandos, queries, eventos e interfaces explícitas. Ninguno accede a tablas internas ajenas.",
  },
  {
    n: "05",
    t: "Idempotencia y degradación elegante",
    d: "Toda operación externa es idempotente. Si falla IA, WhatsApp o email, la operación de sala continúa.",
  },
  {
    n: "06",
    t: "Medir antes de optimizar",
    d: "Se modulariza antes de distribuir. Cada decisión costosa o irreversible se documenta con un ADR.",
  },
];
