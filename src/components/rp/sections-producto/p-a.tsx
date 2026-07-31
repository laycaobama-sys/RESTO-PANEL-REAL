import * as React from "react";
import {
  Section,
  GlassCard,
  Stat,
  DataTable,
  GoldList,
  H3,
  Lead,
  Pill,
  Callout,
} from "@/components/rp/primitives";
import { Mermaid } from "@/components/rp/mermaid";

/* ============================================================ */
/* Helper: small color swatch                                   */
/* ============================================================ */
function Swatch({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-3.5 w-3.5 rounded-full border border-foreground/20 align-middle"
      style={{ background: color }}
      aria-hidden
    />
  );
}

/* ============================================================ */
/* 01 — RESUMEN Y ENTREGABLES                                    */
/* ============================================================ */
export function ProductoResumen() {
  return (
    <Section
      id="p-resumen"
      index="01"
      eyebrow="Resumen y entregables"
      title="El sistema operativo digital del restaurante."
      intro="RestoPanel centraliza reservas, plano de mesas inteligente, CRM, marketing, automatizaciones, reputación, Google Reviews, BI, analytics, IA Copilot, lista de espera, personal, facturación, integraciones, marketplace, administración multi-restaurante y seguridad. El objetivo es directo: aumentar reservas, reducir no-shows, mejorar ocupación, elevar el ticket medio, recuperar clientes, automatizar el trabajo operativo, mejorar reseñas, ahorrar tiempo y tomar decisiones con datos."
    >
      <div className="grid lg:grid-cols-3 gap-5">
        <GlassCard className="lg:col-span-2" variant="gold">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider rp-gold-text">
              Tesis de producto
            </span>
            <Pill tone="outline">demo</Pill>
          </div>
          <p className="mt-3 font-display text-2xl sm:text-3xl font-light leading-snug text-balance">
            Un SaaS de cientos de millones debe ser preciso, rápido, fiable,
            elegante y operativo. No ornamentación: cada pantalla resuelve un
            problema medible del restaurante y cada componente funciona.
          </p>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Estudiamos CoverManager, SevenRooms, OpenTable y Toast para extraer
            principios — no para copiar interfaces. De Shopify tomamos la
            claridad del setup. De HubSpot, el CRM accionable. De Stripe, la
            precisión del billing. De Linear y Vercel, la calidad de
            interacción. De Notion, la composición. Lo que aquí se construye
            aprende de todos sin imitar a ninguno.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              "CoverManager",
              "SevenRooms",
              "OpenTable",
              "Toast",
              "Shopify",
              "HubSpot",
              "Stripe",
              "Linear",
              "Vercel",
              "Notion",
            ].map((b) => (
              <Pill key={b} tone="outline">
                {b}
              </Pill>
            ))}
          </div>
        </GlassCard>

        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
          <Stat label="Entregables" value="14" sub="del master prompt" accent="gold" />
          <Stat label="Componentes" value="30+" sub="interactivos" accent="teal" />
          <Stat label="Módulos" value="11" sub="reservas → marketplace" accent="fg" />
        </div>
      </div>

      <div className="mt-10">
        <H3 className="mb-4">Los 14 entregables del master prompt</H3>
        <DataTable
          head={["#", "Entregable", "Estado"]}
          rows={[
            ["1", "Arquitectura propuesta", <Pill key="e1" tone="gold">definida</Pill>],
            ["2", "Sistema de diseño", <Pill key="e2" tone="gold">tokens + componentes</Pill>],
            ["3", "Mapa de rutas", <Pill key="e3" tone="gold">9 fases</Pill>],
            ["4", "Modelo de datos", <Pill key="e4" tone="gold">ER + SQL</Pill>],
            ["5", "Componentes principales", <Pill key="e5" tone="teal">30+</Pill>],
            ["6", "Flujos críticos", <Pill key="e6" tone="teal">8 journeys</Pill>],
            ["7", "Código funcional", <Pill key="e7" tone="teal">TS ejecutable</Pill>],
            ["8", "Datos demo realistas", <Pill key="e8" tone="outline">etiquetados</Pill>],
            ["9", "Integraciones desacopladas", <Pill key="e9" tone="teal">adaptadores</Pill>],
            ["10", "Tests", <Pill key="e10" tone="outline">unit + e2e</Pill>],
            ["11", "Checklist QA", <Pill key="e11" tone="outline">20+ items</Pill>],
            ["12", "Riesgos técnicos", <Pill key="e12" tone="outline">registrados</Pill>],
            ["13", "Funcionalidades pendientes", <Pill key="e13" tone="outline">declaradas</Pill>],
            ["14", "Instrucciones de ejecución", <Pill key="e14" tone="outline">documentadas</Pill>],
          ]}
        />
      </div>

      <div className="mt-10">
        <H3 className="mb-4">Reglas de ejecución</H3>
        <DataTable
          head={["Regla", "Aplicación"]}
          rows={[
            ["Inspeccionar repo existente", "Reutilizar shadcn/ui + patrones establecidos del monorepo."],
            ["Stack actual", "Next.js 16 + TypeScript + Tailwind + shadcn/ui. No cambiar sin justificar."],
            ["Separar demo / real / integraciones", "Badge “demo” en todo dato de ejemplo; “no conectado” en integraciones sin configurar."],
            ["Interfaz desacoplada si falta API", "Adaptador demo con contrato Zod idéntico al real; swap sin tocar UI."],
            ["No bloquear por integraciones no configuradas", "Degradación elegante: estado visible y camino de activación claro."],
            ["Estados completos", "Loading (skeleton), error, vacío, éxito, permisos, offline. Nunca spinner genérico."],
            ["Feedback visual", "Toda acción importante confirma con toast, badge o transición de estado."],
          ]}
        />
      </div>

      <div className="mt-8">
        <Callout kind="warn" title="Datos demo claramente identificados">
          Toda cifra, cliente, reserva o métrica de ejemplo lleva badge{" "}
          <span className="font-mono text-foreground">demo</span>. Ningún dato
          simulado se hace pasar por real. Las integraciones no conectadas se
          muestran con estado{" "}
          <span className="font-mono text-foreground">no conectado</span> y un
          camino de activación. Esta honestidad es contrato de producto, no
          decoración.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/* 02 — ARQUITECTURA PROPUESTA                                   */
/* ============================================================ */
const ARCH_CHART = `flowchart TB
  subgraph Frontend["Frontend (Next.js 16)"]
    LANDING["Landing (SSG/ISR)"]
    DASH["Dashboard (RSC + Client)"]
    SUPER["Super Admin"]
    WIDGET["Booking widget"]
  end
  subgraph Edge["Cloudflare Edge"]
    WAF["WAF + Rate Limit + Turnstile"]
    WORKERS["Workers (API + middleware)"]
  end
  subgraph Data["Datos"]
    D1[("D1 · transaccional")]
    R2[("R2 · archivos")]
    KV[("KV · caché namespaced")]
    DO["Durable Objects · realtime"]
  end
  subgraph Async["Asíncrono"]
    Q["Queues"]
    WF["Workflows"]
  end
  subgraph External["Externos"]
    STRIPE["Stripe"]
    WA["WhatsApp"]
    GOOGLE["Google"]
    AI["AI Gateway"]
  end
  Frontend --> WAF --> WORKERS
  WORKERS --> D1
  WORKERS --> R2
  WORKERS --> KV
  WORKERS --> DO
  WORKERS --> Q --> WF
  WORKERS --> STRIPE
  WORKERS --> WA
  WORKERS --> GOOGLE
  WORKERS --> AI`;

export function ProductoArquitectura() {
  return (
    <Section
      id="p-arquitectura"
      index="02"
      eyebrow="Arquitectura propuesta"
      title="Multi-tenant sobre Cloudflare, preparado para miles de restaurantes."
      intro="Frontend Next.js 16 (SSG/ISR para landing, RSC + Client para dashboard, super admin y widget de reservas) tras un borde Cloudflare con WAF, rate limiting y Turnstile. Workers sin estado sirven API, middleware, webhooks y consumers; el estado vive en D1 (canónico), R2 (archivos), KV (caché y feature flags) y Durable Objects (realtime por sala). Lo asíncrono va por Queues y Workflows. Los externos (Stripe, WhatsApp, Google, AI Gateway) se abstraen detrás de adaptadores."
    >
      <Mermaid chart={ARCH_CHART} />

      <div className="mt-10">
        <H3 className="mb-4">Servicios Cloudflare → responsabilidad</H3>
        <DataTable
          head={["Servicio", "Uso", "Límite / Regla"]}
          rows={[
            ["Workers", "API, middleware, webhooks, queue consumers", "Sin estado; el estado vive en D1/DO."],
            ["D1", "Transaccional canónico", "~10GB por shard; sin RLS nativa → Tenant Enforcement Layer."],
            ["R2", "Logos, cartas, PDFs, exportaciones", "Prefijo orgs/{org_id}/; URLs firmadas y temporales."],
            ["KV", "Config + caché + feature flags", "Nunca autoridad; namespace por org:{id}:."],
            ["Durable Objects", "Plano de mesas, locks, realtime", "1 DO por (loc+date); D1 canónico, DO efímero."],
            ["Queues", "Email, WhatsApp, IA, exportaciones", "Idempotencia; DLQ; backoff exponencial."],
            ["AI Gateway", "Todas las llamadas IA", "Límites por plan; redacción de PII; fallback determinista."],
          ]}
        />
      </div>

      <div className="mt-10 grid lg:grid-cols-3 gap-5">
        <GlassCard className="lg:col-span-2" variant="gold">
          <H3>Principios arquitectónicos</H3>
          <Lead className="mt-2">
            Reglas no negociables para que el sistema crezca sin reescribirse.
          </Lead>
          <div className="mt-5">
            <GoldList
              items={[
                "Aislamiento por tenant en cada capa: borde, worker, repositorio, caché y logs.",
                "API contracts con Zod: validez en entrada y salida, tipos derivados del schema.",
                "Idempotencia en operaciones críticas: reservas, pagos, webhooks y mensajes.",
                "Observabilidad con correlation_id propagado de extremo a extremo.",
                "Feature flags en KV namespaced; evaluación servidor, nunca cliente.",
                "Entornos separados: dev, preview, prod con secretos fuera del código.",
                "Secret management: Workers Secrets; nada en D1/KV/R2/frontend.",
                "Migraciones forward-only con tabla de control de versión por shard.",
                "Rate limiting por IP, org y usuario; backpressure explícito en colas.",
                "Caching namespaced por org: invalidación precisa, nunca global salvo deploy.",
              ]}
            />
          </div>
        </GlassCard>

        <div className="flex flex-col gap-4">
          <Stat label="Edge runtime" value="Workers" sub="sin estado" accent="gold" />
          <Stat label="Realtime" value="Durable Objects" sub="1 DO por sala/día" accent="teal" />
          <Stat label="Canónico" value="D1" sub="~10GB / shard" accent="fg" />
        </div>
      </div>

      <div className="mt-8">
        <Callout kind="info" title="Evolución sin reescritura">
          La arquitectura permite crecer de 1 a miles de restaurantes vía sharding
          de D1 por celdas de organizaciones, sin cambiar los contratos de
          aplicación. El enrutamiento org→shard vive en el Control Plane; los
          repositorios consumen la celda asignada y Enterprise puede migrar a
          celda dedicada con downtime planificado. Cuando D1 eleve sus límites
          de forma verificable, esta decisión se revisa; hasta entonces, no se
          promete escala ilimitada en una sola base.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/* 03 — SISTEMA DE DISEÑO                                        */
/* ============================================================ */
type ColorRow = { token: string; hex: string; uso: string };

const COLOR_TOKENS: ColorRow[] = [
  { token: "--gold", hex: "#D4AF37", uso: "Acento de marca, CTAs primarios" },
  { token: "--gold-soft", hex: "#E8C766", uso: "Hover, highlights" },
  { token: "--gold-deep", hex: "#A8862A", uso: "Bordes, profundidad" },
  { token: "--teal", hex: "#3DD6C9", uso: "Información, actividad" },
  { token: "--teal-deep", hex: "#2BA89E", uso: "Estados activos" },
  { token: "background (dark)", hex: "oklch(0.135 0.004 90)", uso: "Fondo primario (no negro puro)" },
  { token: "card", hex: "oklch(0.175 0.005 90)", uso: "Superficies elevadas" },
  { token: "foreground", hex: "oklch(0.965 0.003 95)", uso: "Texto principal (no blanco puro)" },
  { token: "muted-foreground", hex: "oklch(0.68 0.008 90)", uso: "Texto secundario" },
  { token: "success", hex: "#3DD68C", uso: "Éxito" },
  { token: "warning", hex: "#F5A623", uso: "Advertencia" },
  { token: "destructive", hex: "#E5484D", uso: "Peligro / error" },
];

export function ProductoDesignSystem() {
  return (
    <Section
      id="p-design-system"
      index="03"
      eyebrow="Sistema de diseño"
      title="Premium, sobrio, distintivo. Alta densidad sin saturación."
      intro="Design tokens para color, tipografía, espaciado, radios, sombras y elevaciones. Estados semánticos coherentes. Componentes reutilizables con foco visible, breakpoints responsive reales y tokens de motion. Paleta tintada con neutral cálido, jamás negro puro ni blanco puro: el sistema respira sobre un fondo casi negro y deja que el dorado y el turquesa trabajen como acentos."
    >
      <div className="mt-2">
        <H3 className="mb-4">Tokens de color (paleta premium)</H3>
        <DataTable
          head={["Token", "Hex", "Muestra", "Uso"]}
          rows={COLOR_TOKENS.map((c) => [
            <span key={`t-${c.token}`} className="font-mono text-[var(--gold-soft)]">{c.token}</span>,
            <span key={`h-${c.token}`} className="font-mono text-xs">{c.hex}</span>,
            <Swatch key={`s-${c.token}`} color={c.hex.startsWith("oklch") ? c.hex : c.hex} />,
            c.uso,
          ])}
        />
      </div>

      <div className="mt-10">
        <H3 className="mb-4">Escala tipográfica y espaciado</H3>
        <DataTable
          head={["Token", "Valor", "Uso"]}
          rows={[
            [<span key="t1" className="font-mono text-[var(--gold-soft)]">display-2xl</span>, "72/78 light", "Hero"],
            [<span key="t2" className="font-mono text-[var(--gold-soft)]">display-xl</span>, "56/60 light", "Titulares de sección"],
            [<span key="t3" className="font-mono text-[var(--gold-soft)]">heading</span>, "24/32 medium", "Subsecciones"],
            [<span key="t4" className="font-mono text-[var(--gold-soft)]">body</span>, "15/24 regular", "Texto por defecto"],
            [<span key="t5" className="font-mono text-[var(--gold-soft)]">caption</span>, "11/16 mono", "Eyebrows, métricas"],
            [<span key="t6" className="font-mono text-[var(--gold-soft)]">space</span>, "4px base", "Escala 0–20"],
            [<span key="t7" className="font-mono text-[var(--gold-soft)]">radius</span>, "0.75rem base", "sm 8 / md 10 / lg 12 / xl 16 / 2xl 22"],
          ]}
        />
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-5">
        <div>
          <H3 className="mb-4">Breakpoints responsive</H3>
          <DataTable
            head={["Token", "Min", "Uso"]}
            rows={[
              [<span key="b1" className="font-mono text-[var(--gold-soft)]">xs</span>, "0", "Mobile-first base"],
              [<span key="b2" className="font-mono text-[var(--gold-soft)]">sm</span>, "640", "Mobile amplio"],
              [<span key="b3" className="font-mono text-[var(--gold-soft)]">md</span>, "768", "Tablet"],
              [<span key="b4" className="font-mono text-[var(--gold-soft)]">lg</span>, "1024", "Desktop + sidebar"],
              [<span key="b5" className="font-mono text-[var(--gold-soft)]">xl</span>, "1280", "Desktop amplio"],
              [<span key="b6" className="font-mono text-[var(--gold-soft)]">2xl</span>, "1536", "Pantallas grandes"],
            ]}
          />
        </div>
        <div>
          <H3 className="mb-4">Estados semánticos</H3>
          <DataTable
            head={["Estado", "Color", "Uso"]}
            rows={[
              [<span key="s1" className="font-mono text-[var(--gold-soft)]">default</span>, "foreground", "Reposo"],
              [<span key="s2" className="font-mono text-[var(--gold-soft)]">hover</span>, "gold-soft", "Realce suave"],
              [<span key="s3" className="font-mono text-[var(--gold-soft)]">focus-visible</span>, "gold (ring 2px)", "Foco visible, teclado"],
              [<span key="s4" className="font-mono text-[var(--gold-soft)]">active</span>, "gold-deep", "Pulsado"],
              [<span key="s5" className="font-mono text-[var(--gold-soft)]">disabled</span>, "muted-foreground", "No interactivo"],
              [<span key="s6" className="font-mono text-[var(--gold-soft)]">loading</span>, "skeleton", "Carga estructural"],
              [<span key="s7" className="font-mono text-[var(--gold-soft)]">error</span>, "destructive", "Error accionable"],
              [<span key="s8" className="font-mono text-[var(--gold-soft)]">success</span>, "success", "Confirmación"],
              [<span key="s9" className="font-mono text-[var(--gold-soft)]">warning</span>, "warning", "Atención"],
            ]}
          />
        </div>
      </div>

      <div className="mt-10">
        <GlassCard variant="gold">
          <H3>Componentes base reutilizables</H3>
          <Lead className="mt-2">
            Catálogo mínimo que compone todo el producto. Variantes y estados
            explícitos, sin excepciones ocultas.
          </Lead>
          <div className="mt-5">
            <GoldList
              items={[
                "Button — variantes: primary gold, secondary outline, ghost, destructive. Estados: hover, focus, active, disabled, loading.",
                "Input / Textarea / Select — con label, hint y error; focus ring dorado 2px.",
                "DataTable — headers mono, números tabulares, hover de fila, paginación y estados vacío/error.",
                "Card — padding consistente (p-4 / p-6), glassmorphism funcional, sin sombras pesadas.",
                "Badge / Pill / Tag — jerarquía visual clara para estado, prioridad y categoría.",
                "Modal / Drawer — foco trapado, ESC para cerrar, scroll lock y restore al cerrar.",
                "Toast — feedback de acción; cola; auto-dismiss configurable; acción inline.",
                "Skeleton — estructura del contenido real, no spinner genérico.",
                "Tabs — accesibles, teclado completo, persistencia de selección por URL.",
                "Accordion — colapsable, accesible, animación respeta prefers-reduced-motion.",
                "CommandPalette — búsqueda global, atajos y navegación rápida (⌘K).",
              ]}
            />
          </div>
        </GlassCard>
      </div>

      <div className="mt-8">
        <Callout kind="ok" title="WCAG 2.2 AA">
          Contraste ≥ 4.5:1 en texto y ≥ 3:1 en UI grande. Foco visible con
          ring dorado. Navegación completa por teclado. Roles y labels ARIA en
          cada componente interactivo. Touch targets ≥ 44px. El estado nunca
          depende solo del color: siempre hay texto o icono. Se respeta{" "}
          <span className="font-mono text-foreground">prefers-reduced-motion</span>{" "}
          y se ofrecen alternativas a animaciones no esenciales.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/* 04 — MAPA DE RUTAS                                            */
/* ============================================================ */
const ROUTES_CHART = `flowchart LR
  LANDING["/ Landing"] --> LOGIN["/login"]
  LOGIN --> DASH["/dashboard"]
  DASH --> RES["/reservas"]
  DASH --> FLOOR["/plano"]
  DASH --> CRM["/clientes"]
  DASH --> MKT["/marketing"]
  DASH --> REP["/reviews"]
  DASH --> ANA["/analytics"]
  DASH --> AUTO["/automatizaciones"]
  DASH --> INT["/integraciones"]
  DASH --> BILL["/facturacion"]
  DASH --> TEAM["/equipo"]
  DASH --> SET["/configuracion"]
  SUPER["/super-admin (app independiente)"]`;

export function ProductoRutas() {
  return (
    <Section
      id="p-rutas"
      index="04"
      eyebrow="Mapa de rutas"
      title="9 fases de construcción, ninguna con pantallas vacías."
      intro="Cada fase entrega algo navegable y útil. El criterio de paso no es “compila”: es que un usuario real pueda completar una tarea end-to-end. Las fases se acumulan; nada se demuestra con maquetas estáticas."
    >
      <H3 className="mb-4">Fases de construcción</H3>
      <DataTable
        head={["Fase", "Alcance", "Criterio de paso"]}
        rows={[
          [<span key="f1" className="font-mono text-[var(--gold-soft)]">Fase 1</span>, "Sistema visual, shell, navegación", "Shell navegable sin rutas rotas."],
          [<span key="f2" className="font-mono text-[var(--gold-soft)]">Fase 2</span>, "Landing y conversión", "Hero + pricing + FAQ + SEO/AEO medibles."],
          [<span key="f3" className="font-mono text-[var(--gold-soft)]">Fase 3</span>, "Dashboard principal", "Widgets reales + KPIs que reflejan datos."],
          [<span key="f4" className="font-mono text-[var(--gold-soft)]">Fase 4</span>, "Reservas y plano de mesas", "Drag & drop + concurrencia sin doble booking."],
          [<span key="f5" className="font-mono text-[var(--gold-soft)]">Fase 5</span>, "CRM, marketing, automatizaciones", "Builder visual + segmentos accionables."],
          [<span key="f6" className="font-mono text-[var(--gold-soft)]">Fase 6</span>, "Reputación, analytics, IA", "Reviews tray + Copilot con respuestas medibles."],
          [<span key="f7" className="font-mono text-[var(--gold-soft)]">Fase 7</span>, "Billing, marketplace, integraciones", "Stripe + adaptadores conectables por org."],
          [<span key="f8" className="font-mono text-[var(--gold-soft)]">Fase 8</span>, "Super admin, seguridad, auditoría", "Métricas de plataforma + impersonación segura."],
          [<span key="f9" className="font-mono text-[var(--gold-soft)]">Fase 9</span>, "QA, a11y, responsive, rendimiento", "Core Web Vitals en verde + e2e estables."],
        ]}
      />

      <div className="mt-10">
        <H3 className="mb-4">Mapa de rutas del producto</H3>
        <Mermaid chart={ROUTES_CHART} />
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          <span className="font-mono text-foreground">/super-admin</span> es una
          app independiente: comparte design system y contratos, pero vive en
          su propio dominio y despliegue, con acceso restringido a personal
          interno. El resto de rutas conviven bajo la misma aplicación Next.js.
        </p>
      </div>

      <div className="mt-10 grid lg:grid-cols-3 gap-5">
        <GlassCard className="lg:col-span-2" variant="gold">
          <H3>Navegación del dashboard</H3>
          <Lead className="mt-2">
            Lo que un usuario ve cada vez que entra. Nada decorativo.
          </Lead>
          <div className="mt-5">
            <GoldList
              items={[
                "Sidebar configurable por rol: secciones permitidas según permisos.",
                "Selector de organización (multi-restaurante) con cambio sin recargar.",
                "Selector de restaurante (location) con estado persistente por sesión.",
                "Selector de periodo (hoy, semana, mes, rango) que afecta a widgets.",
                "Búsqueda global con acceso a clientes, reservas, mesas y ajustes.",
                "Centro de notificaciones con badges y preferencias por canal.",
                "Ayuda contextual: tooltips, tours opcionales y docs incrustados.",
                "Perfil con cuenta, MFA, sesiones activas y cierre remoto.",
                "Breadcrumbs dinámicos que reflejan la jerarquía real de la URL.",
                "Command palette (⌘K) para navegación y acciones frecuentes.",
                "Atajos de teclado documentados y descubribles en la UI.",
              ]}
            />
          </div>
        </GlassCard>

        <GlassCard>
          <H3>Restricción de este entorno</H3>
          <Lead className="mt-2">
            En este documento solo la ruta <span className="font-mono text-foreground">/</span> es
            visible.
          </Lead>
          <p className="mt-4 text-sm text-foreground/85 leading-relaxed">
            Las secciones siguientes renderizan las experiencias (landing,
            dashboard, pricing, builder) como componentes interactivos dentro de
            la página, para que el producto sea navegable sin multi-ruta. El
            mapa de rutas de arriba es la arquitectura objetivo del producto
            real.
          </p>
        </GlassCard>
      </div>

      <div className="mt-8">
        <Callout kind="info" title="Restricción de este entorno">
          El sandbox actual solo expone la ruta <span className="font-mono text-foreground">/</span>.
          El mapa de rutas describe la arquitectura objetivo del producto real;
          aquí se compone como secciones interactivas dentro de la misma página,
          con estados completos y datos demo etiquetados, para que la
          experiencia sea demostrable sin desplegar multi-ruta.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/* 05 — MODELO DE DATOS                                          */
/* ============================================================ */
const ER_CHART = `erDiagram
  organizations ||--o{ locations : has
  organizations ||--|| subscriptions : billed
  locations ||--o{ floors : contains
  floors ||--o{ zones : has
  zones ||--o{ tables : has
  locations ||--o{ reservations : receives
  customers ||--o{ reservations : makes
  customers ||--o{ customer_tags : tagged
  users ||--o{ memberships : has
  memberships }o--|| roles : on
  roles ||--o{ permissions : grants
  organizations ||--o{ campaigns : runs
  organizations ||--o{ automations : defines
  organizations ||--o{ reviews : receives
  organizations ||--o{ invoices : billed`;

export function ProductoDatos() {
  return (
    <Section
      id="p-datos"
      index="05"
      eyebrow="Modelo de datos"
      title="Entidades normalizadas con aislamiento por tenant."
      intro="El modelo separa identidad (users) de pertenencia (memberships) y de permisos (roles/permissions). El tenant raíz es la organización; cada restaurante físico es una location con su plano de mesas (floors/zones/tables). Las reservas conectan clientes y mesas; el CRM vive a nivel de organización; el billing y la auditoría son transversales."
    >
      <Mermaid chart={ER_CHART} />

      <div className="mt-10">
        <H3 className="mb-4">Entidades principales</H3>
        <DataTable
          head={["Entidad", "Propósito", "Tenant scope"]}
          rows={[
            [<span key="e1" className="font-mono text-[var(--gold-soft)]">organizations</span>, "Tenant raíz, facturación", <Pill key="p1" tone="gold">global (con org_id)</Pill>],
            [<span key="e2" className="font-mono text-[var(--gold-soft)]">locations</span>, "Restaurante físico", <Pill key="p2" tone="teal">org</Pill>],
            [<span key="e3" className="font-mono text-[var(--gold-soft)]">floors / zones / tables</span>, "Plano de mesas", <Pill key="p3" tone="teal">org + loc</Pill>],
            [<span key="e4" className="font-mono text-[var(--gold-soft)]">reservations</span>, "Reservas", <Pill key="p4" tone="teal">org + loc</Pill>],
            [<span key="e5" className="font-mono text-[var(--gold-soft)]">customers</span>, "CRM", <Pill key="p5" tone="teal">org</Pill>],
            [<span key="e6" className="font-mono text-[var(--gold-soft)]">users</span>, "Identidad global", <Pill key="p6" tone="gold">global</Pill>],
            [<span key="e7" className="font-mono text-[var(--gold-soft)]">memberships</span>, "Usuario ↔ org ↔ rol", <Pill key="p7" tone="teal">org</Pill>],
            [<span key="e8" className="font-mono text-[var(--gold-soft)]">roles / permissions</span>, "RBAC", <Pill key="p8" tone="teal">org</Pill>],
            [<span key="e9" className="font-mono text-[var(--gold-soft)]">campaigns / automations</span>, "Marketing", <Pill key="p9" tone="teal">org</Pill>],
            [<span key="e10" className="font-mono text-[var(--gold-soft)]">reviews</span>, "Reputación", <Pill key="p10" tone="teal">org + loc</Pill>],
            [<span key="e11" className="font-mono text-[var(--gold-soft)]">invoices / subscriptions</span>, "Billing", <Pill key="p11" tone="teal">org</Pill>],
            [<span key="e12" className="font-mono text-[var(--gold-soft)]">audit_logs</span>, "Auditoría append-only", <Pill key="p12" tone="teal">org</Pill>],
          ]}
        />
      </div>

      <div className="mt-10">
        <GlassCard variant="gold">
          <H3>Convenciones</H3>
          <Lead className="mt-2">
            Reglas del modelo que se aplican en todas las tablas, sin excepción.
          </Lead>
          <div className="mt-5">
            <GoldList
              items={[
                "ULID opacos como identificadores; nunca autoincrementales expuestos.",
                "UTC ISO-8601 con zona horaria IANA explícita en el campo correspondiente.",
                "Dinero en minor units (integer) + moneda ISO 4217; nunca floats.",
                "organization_id NOT NULL en toda tabla de tenant; cero excepciones.",
                "Clave primaria compuesta (org_id, id) para forzar aislamiento por índice.",
                "idem_key unique parcial (WHERE idem_key IS NOT NULL) para idempotencia.",
                "Soft delete con deleted_at + deleted_by; nunca DELETE físico en tenant.",
                "Audit log append-only: inserción únicamente, jamás UPDATE ni DELETE.",
              ]}
            />
          </div>
        </GlassCard>
      </div>

      <div className="mt-8">
        <Callout kind="warn" title="D1 sin RLS nativa">
          D1/SQLite no tiene Row Level Security. El aislamiento es de
          aplicación: los repositorios exigen{" "}
          <span className="font-mono text-foreground">organization_id</span>,
          usan constraints compuestos (org_id, id) y se cubren con tests IDOR
          automatizados en CI. No se simula RLS: se aplica un Tenant
          Enforcement Layer real y se audita. Cualquier repositorio que omita
          el filtro de tenant es un bug crítico bloqueante de merge.
        </Callout>
      </div>
    </Section>
  );
}
