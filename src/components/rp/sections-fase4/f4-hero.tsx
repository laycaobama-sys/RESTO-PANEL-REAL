import { BrandMark } from "@/components/rp/nav";
import { Pill } from "@/components/rp/primitives";

export function Fase4Hero() {
  return (
    <section id="f4-inicio" className="relative overflow-hidden scroll-mt-24">
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
              <Pill tone="gold">Fase 4 · Núcleo Enterprise</Pill>
              <Pill tone="teal">Motor de Restaurantes</Pill>
              <Pill tone="outline">Código ejecutable · Cloudflare</Pill>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-light tracking-tight leading-[0.95] text-balance">
              De web a SaaS
              <span className="block rp-gold-gradient mt-2">multi-tenant</span>
              <span className="block text-foreground/90">para cientos de locales.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground">
              Núcleo operativo, técnico y de seguridad de RestoPanel: cada restaurante recibe una
              organización aislada con base de datos lógica multi-tenant, RBAC Enterprise,
              reservas/mesas/CRM con concurrencia real, auditoría inmutable y límites por plan.
              Implementación completa sobre Cloudflare Workers, D1, R2, KV, Queues, Durable Objects
              y AI Gateway.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#f4-resumen"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--gold)] px-5 py-2.5 text-sm font-medium text-black hover:bg-[var(--gold-soft)] transition-colors"
              >
                Ver la arquitectura
                <span aria-hidden>→</span>
              </a>
              <a
                href="#f4-sql"
                className="inline-flex items-center gap-2 rounded-lg border border-border/70 px-5 py-2.5 text-sm hover:border-[var(--gold)]/50 transition-colors"
              >
                Esquema D1 completo
              </a>
            </div>

            <dl className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/40">
              {[
                ["Secciones", "24", "implementación"],
                ["Servicios CF", "7", "Workers·D1·R2·KV·DO·Q·AI"],
                ["Roles sistema", "13", "RBAC granular"],
                ["Objetivos p95", "<300ms", "reserva·API·login"],
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
                    Jerarquía
                  </div>
                  <div className="font-display text-lg">Motor Enterprise</div>
                </div>
              </div>
              <div className="font-mono text-xs leading-relaxed text-foreground/80 space-y-1">
                <div className="rp-gold-text">Super Admin</div>
                <div className="pl-3">└── Organizaciones</div>
                <div className="pl-6">└── <span className="rp-teal-text">Organización</span> <span className="text-muted-foreground">(aislada)</span></div>
                <div className="pl-9">└── Locales</div>
                <div className="pl-12 text-muted-foreground">├── Usuarios · Reservas · Clientes</div>
                <div className="pl-12 text-muted-foreground">├── Mesas · Caja · Eventos · CRM</div>
                <div className="pl-12 text-muted-foreground">├── Reputación · Facturación</div>
                <div className="pl-12 text-muted-foreground">└── Auditoría · Métricas de plan</div>
              </div>
              <div className="mt-5 pt-4 border-t border-border/40 text-[11px] text-muted-foreground">
                Ningún dato, usuario, reserva, cliente, archivo o configuración puede mezclarse entre organizaciones.
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
    t: "Aislamiento en cada capa",
    d: "organization_id en middleware, servicios, repositorios, base de datos, caché, almacenamiento y pruebas. El del cliente nunca es autoridad.",
  },
  {
    n: "02",
    t: "RBAC granular, no campo role",
    d: "Permisos por organización, local, usuario, equipo, rol, recurso y acción. Roles personalizados sin tocar el código principal.",
  },
  {
    n: "03",
    t: "Concurrencia real en sala",
    d: "Durable Objects para el plano de mesas y bloqueos de slots. Doble reserva imposible vía DO + constraint D1.",
  },
  {
    n: "04",
    t: "Auditoría inmutable + papelera",
    d: "Toda mutación auditada con estado anterior y posterior. Soft delete, restauración y retención configurable.",
  },
  {
    n: "05",
    t: "Límites por plan aplicados",
    d: "Locales, usuarios, almacenamiento, reservas, emails, WhatsApps y consumo de IA medidos y enforced en servidor.",
  },
  {
    n: "06",
    t: "Despliegue sin pasos ocultos",
    d: "Migraciones reproducibles, wrangler declarativo, variables documentadas y rollback planificado. Sin magia manual.",
  },
];
