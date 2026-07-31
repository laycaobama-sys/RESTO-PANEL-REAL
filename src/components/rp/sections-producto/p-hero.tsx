import { BrandMark } from "@/components/rp/nav";
import { Pill } from "@/components/rp/primitives";

export function ProductoHero() {
  return (
    <section id="p-inicio" className="relative overflow-hidden scroll-mt-24">
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
              <Pill tone="gold">Producto · SaaS Enterprise</Pill>
              <Pill tone="teal">Componentes interactivos</Pill>
              <Pill tone="outline">Datos demo claramente identificados</Pill>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-light tracking-tight leading-[0.95] text-balance">
              Software para
              <span className="block rp-gold-gradient mt-2">restaurantes que</span>
              <span className="block text-foreground/90">convierte cada servicio en más ingresos.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground">
              RestoPanel como producto vivo: landing de conversión, dashboard con widgets reales,
              calculadora de pricing funcional, builder de automatizaciones visual, plano de mesas,
              CRM y reputación. Todo navegable, con estados de carga/error/vacío y datos demo
              etiquetados. No hay pantallas vacías ni botones decorativos.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#p-dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--gold)] px-5 py-2.5 text-sm font-medium text-black hover:bg-[var(--gold-soft)] transition-colors"
              >
                Ver el dashboard en vivo
                <span aria-hidden>→</span>
              </a>
              <a
                href="#p-pricing"
                className="inline-flex items-center gap-2 rounded-lg border border-border/70 px-5 py-2.5 text-sm hover:border-[var(--gold)]/50 transition-colors"
              >
                Probar la calculadora de precios
              </a>
              <a
                href="#p-automatizaciones"
                className="inline-flex items-center gap-2 rounded-lg border border-border/70 px-5 py-2.5 text-sm hover:border-[var(--gold)]/50 transition-colors"
              >
                Builder de automatizaciones
              </a>
            </div>

            <dl className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/40">
              {[
                ["Entregables", "14", "del master prompt"],
                ["Componentes", "30+", "interactivos"],
                ["Planes", "3", "Starter·Pro·Enterprise"],
                ["Módulos", "11", "reservas→marketplace"],
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
                    Producto
                  </div>
                  <div className="font-display text-lg">El SO del restaurante</div>
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  "Reservas inteligentes + plano en tiempo real",
                  "CRM accionable con segmentos y VIP",
                  "Marketing y automatizaciones visuales",
                  "Google Reviews con IA y aprobación",
                  "Analytics + IA Copilot ejecutivo",
                  "Billing Stripe + marketplace de integraciones",
                  "Super Admin con métricas de plataforma",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-2.5 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span className="text-foreground/85">{t}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-border/40 flex items-center gap-2 text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span className="text-amber-300/90 font-mono uppercase tracking-wider">
                  Datos demo · claramente identificados
                </span>
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
    t: "Producto, no pantallas sueltas",
    d: "Landing, dashboard y super admin comparten design system, navegación y tono. La experiencia es coherente de extremo a extremo.",
  },
  {
    n: "02",
    t: "Componentes interactivos reales",
    d: "Calculadora de pricing, widgets de dashboard, builder de automatizaciones y plano de mesas funcionan con estado real, no maquetas estáticas.",
  },
  {
    n: "03",
    t: "Datos demo etiquetados",
    d: "Toda cifra o registro de ejemplo lleva badge 'demo'. Ningún dato simulado se hace pasar por real. Integraciones no conectadas se indican claramente.",
  },
  {
    n: "04",
    t: "Estados completos",
    d: "Loading (skeletons), error accionable, vacío con CTA, permisos insuficientes y degradación elegante. Ningún botón es puramente decorativo.",
  },
  {
    n: "05",
    t: "Accesibilidad WCAG 2.2 AA",
    d: "Foco visible, teclado, ARIA, contraste, touch targets. Responsive real en mobile, tablet y desktop, no desktop encogido.",
  },
  {
    n: "06",
    t: "Rendimiento y Core Web Vitals",
    d: "Server Components por defecto, JS mínimo, skeletons en vez de spinners, imágenes optimizadas, fuentes con display swap.",
  },
];
