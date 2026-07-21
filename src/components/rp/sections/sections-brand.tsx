import { Section, GlassCard, Tag, DataTable, GoldList, H3, Lead, Pill } from "../primitives";
import { BrandMark } from "../nav";

/* ============================================================ */
/* 04 — ARQUITECTURA DE MARCA                                   */
/* ============================================================ */
const PALETTE = [
  { name: "Obsidiana", hex: "#0A0A0B", role: "Fondo primario (dark mode)", text: "light" },
  { name: "Grafití Profundo", hex: "#161513", role: "Superficies elevadas", text: "light" },
  { name: "Dorado Marca", hex: "#D4AF37", role: "Acento de marca, CTAs", text: "dark" },
  { name: "Dorado Claro", hex: "#E8C766", role: "Hover, highlights", text: "dark" },
  { name: "Dorado Hondo", hex: "#A8862A", role: "Bordes y profundidad", text: "light" },
  { name: "Turquesa Info", hex: "#3DD6C9", role: "Actividad e información", text: "dark" },
  { name: "Turquesa Hondo", hex: "#2BA89E", role: "Estados activos", text: "light" },
  { name: "Marfil", hex: "#F5F4F0", role: "Texto principal sobre oscuro", text: "dark" },
  { name: "Gris Niebla", hex: "#A1A1AA", role: "Texto secundario", text: "dark" },
  { name: "Carmesí Alerta", hex: "#E5484D", role: "Peligro / destructivo", text: "light" },
  { name: "Ámbar Guardián", hex: "#F5A623", role: "Advertencia", text: "dark" },
  { name: "Esmeralda OK", hex: "#3DD68C", role: "Éxito / confirmación", text: "dark" },
];

const MODULE_NAMING = [
  ["Reservas", "Reservations"],
  ["Sala y mesas", "Floor"],
  ["Clientes", "CRM"],
  ["Personal y turnos", "Workforce"],
  ["Carta", "Menu"],
  ["Reputación", "Reputation"],
  ["Comunicaciones", "Comms"],
  ["Automatización", "Automations"],
  ["Analítica", "Analytics"],
  ["Inteligencia", "Intelligence"],
  ["Facturación", "Billing"],
  ["Centro de Control", "Super Admin"],
];

export function ArquitecturaMarca() {
  return (
    <Section
      id="marca"
      index="04"
      eyebrow="Arquitectura de marca"
      title="Una marca premium, operativa, no decorativa."
      intro="Dirección visual: dark mode como tema principal, glassmorphism sutil y funcional, dorado como acento de marca (no como color universal), turquesa para información y actividad. Alta densidad informativa sin ruido. Diseñada para que un gestor de sala lea rápido y decida mejor."
    >
      {/* Posicionamiento y voz */}
      <div className="grid lg:grid-cols-3 gap-5 mb-12">
        <GlassCard variant="gold" className="lg:col-span-2">
          <div className="text-[11px] font-mono uppercase tracking-wider rp-gold-text">Posicionamiento</div>
          <p className="mt-3 font-display text-2xl font-light leading-snug">
            Para restaurantes que toman la operación en serio, RestoPanel es el panel que convierte
            reservas, sala y clientes en decisiones — porque une los datos que otras herramientas
            mantienen separados y asiste sin reemplazar el criterio del anfitrión.
          </p>
          <div className="mt-5 grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Personalidad</div>
              <p className="mt-1 text-foreground/85">Precisa, serena, autoritativa sin arrogancia. Cercana al operador, respetuosa con el cliente final.</p>
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Voz y tono</div>
              <p className="mt-1 text-foreground/85">Directa, sin jerga innecesaria. Confirma, no presume. En errores, dice qué pasó y qué hacer.</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Naming de módulos</div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {MODULE_NAMING.map(([es, en]) => (
              <div key={es} className="flex items-center justify-between rounded-md border border-border/50 px-2.5 py-1.5">
                <span>{es}</span>
                <span className="font-mono text-[11px] text-muted-foreground">{en}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Logo variations */}
      <H3 className="mb-4">Sistema de logo</H3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <LogoCard label="Isotipo" desc="Marca sola. Uso en favicon, app icon, avatar." variant="mark" />
        <LogoCard label="Principal" desc="Isotipo + wordmark apilado. Uso default." variant="stacked" />
        <LogoCard label="Horizontal" desc="Isotipo + wordmark en línea. Barras y headers." variant="horizontal" />
        <LogoCard label="Cuadrado" desc="Contenedor seguro para redes y locks." variant="square" />
      </div>

      {/* App icons */}
      <div className="grid lg:grid-cols-2 gap-5 mb-12">
        <GlassCard>
          <H3>Iconos de aplicación</H3>
          <Lead className="mt-2">iOS, Android y dashboard. Mismo isotipo sobre fondo de marca.</Lead>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              ["iOS", "rounded-[22%]"],
              ["Android", "rounded-[18%]"],
              ["Dashboard", "rounded-xl"],
              ["Favicon", "rounded-md"],
            ].map(([l, r]) => (
              <div key={l} className="flex flex-col items-center gap-2">
                <div
                  className={`${r} h-20 w-20 flex items-center justify-center`}
                  style={{
                    background:
                      "radial-gradient(circle at 30% 25%, #1a1815 0%, #0c0b0a 70%)",
                    boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--gold) 35%, transparent)",
                  }}
                >
                  <BrandMark className="h-12 w-12" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{l}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <H3>Usos prohibidos</H3>
          <Lead className="mt-2">Protegen la legibilidad y la jerarquía de marca.</Lead>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              "No estirar ni deformar el isotipo.",
              "No usar dorado como fondo universal.",
              "No colocar sobre fondos sin contraste suficiente (AA).",
              "No añadir sombras, brillos o efectos ajenos al sistema.",
              "No recrear el wordmark con otra tipografía.",
              "No invertir colores fuera de las variantes aprobadas.",
            ].map((t) => (
              <div key={t} className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-foreground/80">
                <span className="mt-0.5 text-destructive">✕</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Paleta */}
      <H3 className="mb-4">Paleta oficial</H3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-12">
        {PALETTE.map((c) => (
          <div key={c.name} className="rp-glass rounded-xl overflow-hidden">
            <div
              className="h-20 flex items-end p-3"
              style={{ background: c.hex, color: c.text === "dark" ? "#0A0A0B" : "#F5F4F0" }}
            >
              <span className="font-mono text-[11px]">{c.hex}</span>
            </div>
            <div className="p-3">
              <div className="font-medium text-sm">{c.name}</div>
              <div className="text-[11px] text-muted-foreground">{c.role}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tipografía */}
      <H3 className="mb-4">Tipografía</H3>
      <div className="grid lg:grid-cols-3 gap-5 mb-12">
        <GlassCard>
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Display · Fraunces</div>
          <div className="mt-2 font-display text-5xl font-light">Aa</div>
          <div className="mt-1 font-display text-lg">Reserva, mesa, cliente.</div>
          <p className="mt-3 text-xs text-muted-foreground">Serif editorial premium para titulares y momentos de marca. Nunca en cuerpos largos.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill>Light 300</Pill><Pill>Regular 400</Pill><Pill>Medium 500</Pill>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">UI · Inter</div>
          <div className="mt-2 text-5xl font-light">Aa</div>
          <div className="mt-1 text-lg">Interfaz, cuerpos, etiquetas.</div>
          <p className="mt-3 text-xs text-muted-foreground">Sans neutra de altísima legibilidad para toda la UI operativa. Variable, optimizada.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill>400</Pill><Pill>500</Pill><Pill>600</Pill>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Mono · JetBrains</div>
          <div className="mt-2 font-mono text-5xl font-light">Aa</div>
          <div className="mt-1 font-mono text-lg">datos · IDs · métricas</div>
          <p className="mt-3 text-xs text-muted-foreground">Datos tabulares, IDs opacos, timestamps, métricas. Refuerza precisión y technicalidad.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill>400</Pill><Pill>500</Pill>
          </div>
        </GlassCard>
      </div>

      {/* Escala tipográfica */}
      <GlassCard className="mb-12">
        <H3>Escala tipográfica</H3>
        <DataTable
          className="mt-4"
          head={["Token", "Tamaño / línea", "Peso", "Uso"]}
          rows={[
            ["display-2xl", "72 / 78", "300", "Hero, titulares de landing"],
            ["display-xl", "56 / 60", "300", "Titulares de sección"],
            ["display-lg", "40 / 46", "300/500", "Encabezados de módulo"],
            ["heading", "24 / 32", "500", "Subsecciones, títulos de card"],
            ["body-lg", "18 / 28", "400", "Intros, lead"],
            ["body", "15 / 24", "400", "Texto default"],
            ["body-sm", "13 / 20", "400", "Densidad operativa"],
            ["caption", "11 / 16", "500 mono", "Eyebrows, métricas, IDs"],
          ]}
        />
      </GlassCard>

      {/* Asset kit */}
      <div className="grid lg:grid-cols-2 gap-5">
        <GlassCard>
          <H3>Kit de marca completo</H3>
          <GoldList
            className="mt-3"
            items={[
              "Logo principal, horizontal, cuadrado e isotipo (SVG + PNG + ICO).",
              "Favicon multi-tamaño (16, 32, 48, 180, 192, 512).",
              "App icons iOS y Android con safe area.",
              "Paleta en tokens Figma, CSS y TypeScript.",
              "Tipografías con licencia documentada.",
              "Iconografía base (Lucide) + isotipo propio.",
              "Sistema de ilustraciones: líneas finas, dorado, sin figuras humanas genéricas.",
              "Fondos: grid sutil, gradientes radiales dorado/turquesa, ruido opcional.",
            ]}
          />
        </GlassCard>
        <GlassCard>
          <H3>Plantillas y media kit</H3>
          <GoldList
            className="mt-3"
            items={[
              "Mockups: dashboard, widget de reserva, móvil.",
              "Plantillas publicitarias (social, display).",
              "Firma de correo con isotipo y datos legales.",
              "Presentación comercial (pitch deck 12 láminas).",
              "Media kit: hechos, métricas, logos, capturas.",
              "Plantilla de blog y documentación pública.",
              "Guía de uso de marca con reglas claras y ejemplos.",
              "Changelog de marca y política de deprecación.",
            ]}
          />
        </GlassCard>
      </div>
    </Section>
  );
}

function LogoCard({
  label,
  desc,
  variant,
}: {
  label: string;
  desc: string;
  variant: "mark" | "stacked" | "horizontal" | "square";
}) {
  return (
    <div className="rp-glass rounded-2xl p-5">
      <div
        className="aspect-[4/3] rounded-xl flex items-center justify-center relative overflow-hidden"
        style={{ background: "radial-gradient(circle at 50% 30%, #1a1815, #0a0a0b)" }}
      >
        <div className="rp-grid-bg absolute inset-0 opacity-30" />
        <div className="relative flex flex-col items-center gap-2">
          {variant === "horizontal" ? (
            <div className="flex items-center gap-2">
              <BrandMark className="h-8 w-8" />
              <span className="font-display text-2xl tracking-tight">RestoPanel</span>
            </div>
          ) : variant === "stacked" ? (
            <div className="flex flex-col items-center gap-1.5">
              <BrandMark className="h-10 w-10" />
              <span className="font-display text-xl tracking-tight">RestoPanel</span>
            </div>
          ) : variant === "square" ? (
            <div className="h-16 w-16 rounded-lg rp-glow-gold flex items-center justify-center" style={{ background: "#0c0b0a" }}>
              <BrandMark className="h-12 w-12" />
            </div>
          ) : (
            <BrandMark className="h-12 w-12" />
          )}
        </div>
      </div>
      <div className="mt-3">
        <div className="font-medium text-sm">{label}</div>
        <div className="text-[11px] text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}

/* ============================================================ */
/* 05 — DESIGN SYSTEM                                           */
/* ============================================================ */
const TOKENS = [
  { group: "Color", items: ["background", "foreground", "card", "muted", "border", "primary", "gold", "teal", "destructive", "success", "warning"] },
  { group: "Tipografía", items: ["font-display", "font-sans", "font-mono", "display-*", "heading", "body*", "caption"] },
  { group: "Espaciado", items: ["space-0 → 20", "4px base scale", "gap-px para grids"] },
  { group: "Radios", items: ["radius-sm 8", "radius-md 10", "radius-lg 12", "radius-xl 16", "radius-2xl 22"] },
  { group: "Bordes", items: ["border-subtle /60", "border-strong", "hairline 1px"] },
  { group: "Elevación", items: ["glass", "glass-strong", "glow-gold", "glow-teal", "no shadow por defecto"] },
  { group: "Motion", items: ["120ms default", "200ms emphasis", "prefers-reduced-motion: 0ms"] },
  { group: "Grid", items: ["12 col desktop", "4 col mobile", "max-w-6xl content", "sidebar 288px"] },
];

const BREAKPOINTS = [
  ["xs", "0px", "Mobile first base", "4 col"],
  ["sm", "640px", "Teléfono grande", "4 col"],
  ["md", "768px", "Tablet", "8 col"],
  ["lg", "1024px", "Desktop con sidebar", "12 col"],
  ["xl", "1280px", "Desktop ancho", "12 col"],
  ["2xl", "1536px", "Pantalla grande", "12 col + gutter"],
];

const COMPONENTS_BASE = [
  "Button", "Input", "Textarea", "Select", "Checkbox", "Switch", "RadioGroup",
  "Label", "Badge", "Tag", "Pill", "Avatar", "Tooltip", "Popover", "Dropdown",
  "Dialog", "Sheet", "Drawer", "Tabs", "Accordion", "Progress", "Slider", "Calendar",
];

const COMPONENTS_DOMAIN = [
  "ReservationCard", "TableNode", "FloorPlan", "CustomerProfile", "AuditEntry",
  "PermissionMatrix", "ImpersonationBanner", "UsageMeter", "IncidentPanel",
  "AIApproval", "SyncStatus", "ConflictNotice", "CommandMenu", "ReservationTimeline",
];

export function DesignSystem() {
  return (
    <Section
      id="design-system"
      index="05"
      eyebrow="Design System"
      title="Tokens, foundations y componentes con owner y contrato."
      intro="El Design System existe antes que las pantallas a escala. Cada componente resuelve una necesidad real, tiene owner, contrato, estados, accesibilidad documentada y pruebas. No se crea por volumen."
    >
      {/* Tokens */}
      <div className="grid lg:grid-cols-2 gap-5 mb-12">
        <GlassCard>
          <H3>Tokens de diseño</H3>
          <Lead className="mt-2">Una sola fuente de verdad: Figma → CSS → TypeScript.</Lead>
          <div className="mt-4 space-y-3">
            {TOKENS.map((t) => (
              <div key={t.group} className="border-b border-border/40 pb-3 last:border-0">
                <div className="text-[11px] font-mono uppercase tracking-wider rp-gold-text">{t.group}</div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {t.items.map((i) => (
                    <span key={i} className="rounded-md border border-border/50 bg-foreground/5 px-2 py-0.5 font-mono text-[11px] text-foreground/80">
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="space-y-5">
          <GlassCard>
            <H3>Breakpoints y grid</H3>
            <DataTable
              className="mt-3"
              head={["Token", "Min", "Uso", "Cols"]}
              rows={BREAKPOINTS.map((b) => b.map((v, i) => (i === 0 ? <span key={v} className="font-mono text-[var(--gold)]">{v}</span> : v)))}
            />
          </GlassCard>
          <GlassCard>
            <H3>Estados de interacción</H3>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              {["default", "hover", "focus-visible", "active", "disabled", "loading", "error", "success"].map((s) => (
                <div key={s} className="rounded-md border border-border/50 bg-foreground/5 px-2 py-2 font-mono">{s}</div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Foco visible con ring dorado a 2px. Estados de carga con skeleton, nunca spinner infinito sin texto.
            </p>
          </GlassCard>
        </div>
      </div>

      {/* Motion + a11y */}
      <div className="grid md:grid-cols-2 gap-5 mb-12">
        <GlassCard variant="teal">
          <H3>Motion funcional</H3>
          <GoldList
            className="mt-3"
            items={[
              "Transiciones cortas (120–200ms) con curvas suaves, no elásticas.",
              "Animación al servicio de causa-efecto: abrir, confirmar, sincronizar.",
              "prefers-reduced-motion: duración a 0ms, sin animaciones decorativas.",
              "Sin loaders perpetuos: timeout + mensaje accionable.",
            ]}
          />
        </GlassCard>
        <GlassCard>
          <H3>Accesibilidad WCAG 2.2 AA</H3>
          <GoldList
            className="mt-3"
            items={[
              "Contraste ≥ 4.5:1 en texto, ≥ 3:1 en UI grande y gráficos.",
              "Teclado completo: tab order lógico, focus visible, sin trampas.",
              "Lectores de pantalla: roles, labels, sr-only, live regions.",
              "Touch: objetivos ≥ 44px, gestos no exclusivos.",
              "No depende solo del color para transmitir estado.",
            ]}
          />
        </GlassCard>
      </div>

      {/* Componentes */}
      <H3 className="mb-4">Catálogo de componentes</H3>
      <div className="grid lg:grid-cols-2 gap-5 mb-8">
        <GlassCard>
          <div className="flex items-center justify-between">
            <H3>Componentes base</H3>
            <Pill tone="gold">{COMPONENTS_BASE.length}</Pill>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Primitivos de UI con variantes y estados. shadcn/ui como base, theme RestoPanel.</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {COMPONENTS_BASE.map((c) => (
              <span key={c} className="rounded-md border border-border/50 bg-foreground/5 px-2 py-1 font-mono text-[11px]">{c}</span>
            ))}
          </div>
        </GlassCard>
        <GlassCard variant="gold">
          <div className="flex items-center justify-between">
            <H3>Componentes de dominio</H3>
            <Pill tone="gold">{COMPONENTS_DOMAIN.length}</Pill>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Específicos del producto. Cada uno con owner, contrato Zod y tests de estados.</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {COMPONENTS_DOMAIN.map((c) => (
              <span key={c} className="rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-2 py-1 font-mono text-[11px] text-[var(--gold-soft)]">{c}</span>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Showcase live */}
      <GlassCard className="mb-8">
        <H3>Showcase en vivo</H3>
        <Lead className="mt-2">Componentes renderizados con el theme de marca.</Lead>
        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Buttons */}
          <div className="rounded-xl border border-border/50 p-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-3">Buttons</div>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-lg bg-[var(--gold)] px-3 py-1.5 text-sm font-medium text-black hover:bg-[var(--gold-soft)] transition-colors">Primary</button>
              <button className="rounded-lg border border-border/70 px-3 py-1.5 text-sm hover:border-[var(--gold)]/50 transition-colors">Secondary</button>
              <button className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">Ghost</button>
              <button className="rounded-lg border border-destructive/40 text-destructive px-3 py-1.5 text-sm hover:bg-destructive/10 transition-colors">Destructive</button>
            </div>
          </div>
          {/* Input */}
          <div className="rounded-xl border border-border/50 p-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-3">Input</div>
            <label className="text-xs text-muted-foreground">Email del operador</label>
            <input
              type="email"
              placeholder="ana@restaurante.com"
              className="mt-1 w-full rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-sm outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/30 transition"
            />
          </div>
          {/* Badge / tag */}
          <div className="rounded-xl border border-border/50 p-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-3">Tags & badges</div>
            <div className="flex flex-wrap gap-2">
              <Tag kind="Imprescindible">Imprescindible</Tag>
              <Tag kind="Importante">Importante</Tag>
              <Tag kind="Posterior">Posterior</Tag>
              <Tag kind="Experimental">Experimental</Tag>
            </div>
          </div>
          {/* Reservation card */}
          <div className="rounded-xl border border-border/50 p-4 sm:col-span-2 lg:col-span-1">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-3">ReservationCard</div>
            <div className="rp-glass rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Mesa 12 · 4 pax</span>
                <span className="h-2 w-2 rounded-full bg-[var(--teal)]" />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Hoy · 21:30 · Sala principal</div>
              <div className="mt-2 flex items-center gap-2">
                <Pill tone="gold">VIP</Pill>
                <Pill tone="outline">Confirmada</Pill>
              </div>
            </div>
          </div>
          {/* Audit entry */}
          <div className="rounded-xl border border-border/50 p-4 sm:col-span-2 lg:col-span-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-3">AuditEntry</div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2"><span className="rp-teal-text">[OK]</span><span className="text-muted-foreground">14:32:01</span><span>reservations.create</span><span className="text-muted-foreground ml-auto">org_01H…·usr_01H…</span></div>
              <div className="flex items-center gap-2"><span className="rp-gold-text">[WARN]</span><span className="text-muted-foreground">14:31:48</span><span>ai.suggest_review_reply</span><span className="text-muted-foreground ml-auto">approval required</span></div>
              <div className="flex items-center gap-2"><span className="text-destructive">[ERR]</span><span className="text-muted-foreground">14:30:22</span><span>whatsapp.send</span><span className="text-muted-foreground ml-auto">fallback → email</span></div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Gobierno */}
      <GlassCard>
        <H3>Gobierno del Design System</H3>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          {[
            ["Owner", "Un Design System Lead con autoridad de merge."],
            ["Contrato", "Cada componente expone props tipadas + variantes Zod."],
            ["Documentación", "Uso, estados, accesibilidad, do/don't."],
            ["Tests", "Visuales + a11y + de contrato por componente."],
            ["Versión", "SemVer; changelog obligatorio en cada release."],
            ["Deprecación", "Aviso previo, migración documentada, kill date."],
            ["Contribución", "RFC corto para componentes nuevos; no por volumen."],
            ["Densidad", "Preferencia por alta densidad informativa sin ruido."],
          ].map(([k, v]) => (
            <div key={k} className="border-l-2 border-[var(--gold)]/40 pl-3">
              <div className="text-[11px] font-mono uppercase tracking-wider rp-gold-text">{k}</div>
              <p className="mt-1 text-muted-foreground text-xs leading-relaxed">{v}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </Section>
  );
}
