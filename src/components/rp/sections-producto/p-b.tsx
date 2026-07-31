import * as React from "react";
import {
  Section,
  GlassCard,
  Pill,
  H3,
  Lead,
  DataTable,
  GoldList,
  Callout,
  Code,
} from "@/components/rp/primitives";

/* ============================================================ */
/*  Helper: texto monoespaciado dorado                          */
/* ============================================================ */
function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[12px] rp-gold-text whitespace-nowrap">
      {children}
    </code>
  );
}

/* ============================================================ */
/*  06 — COMPONENTES PRINCIPALES                                */
/* ============================================================ */
type CompRow = {
  componente: string;
  variantes: string;
  estados: string;
};

const COMP_ROWS: CompRow[] = [
  { componente: "Button", variantes: "primary/secondary/ghost/destructive", estados: "hover/focus/active/disabled/loading" },
  { componente: "Input", variantes: "default/error/with-icon", estados: "focus/disabled/error" },
  { componente: "DataTable", variantes: "default/dense", estados: "hover/sorted/paginated/empty/loading" },
  { componente: "Card", variantes: "default/gold/teal", estados: "hover/elevated" },
  { componente: "Badge/Pill/Tag", variantes: "gold/teal/outline/destructive", estados: "—" },
  { componente: "Modal/Drawer", variantes: "sm/md/lg", estados: "open/closing/backdrop" },
  { componente: "Toast", variantes: "success/error/warning/info", estados: "auto-dismiss/manual" },
  { componente: "Skeleton", variantes: "text/card/table", estados: "pulse" },
  { componente: "Tabs", variantes: "underline/pills", estados: "active/disabled" },
  { componente: "ReservationCard", variantes: "confirmed/waitlist/no-show", estados: "hover/click" },
  { componente: "TableNode", variantes: "free/reserved/occupied/blocked", estados: "drag/drop" },
  { componente: "CustomerCard", variantes: "vip/standard/risk", estados: "hover" },
  { componente: "KpiWidget", variantes: "up/down/flat", estados: "trend/sparkline" },
  { componente: "AutomationNode", variantes: "trigger/condition/action", estados: "selected/error" },
  { componente: "ReviewCard", variantes: "positive/neutral/negative", estados: "replied/pending" },
  { componente: "CommandPalette", variantes: "—", estados: "open/empty/results" },
];

const BUTTON_CODE = `// packages/ui/src/button.tsx
import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]",
        secondary: "border border-border/70 hover:border-[var(--gold)]/50",
        ghost: "text-muted-foreground hover:text-foreground hover:bg-foreground/5",
        destructive: "border border-destructive/40 text-destructive hover:bg-destructive/10",
      },
      size: { sm: "h-8 px-3 text-xs", md: "h-10 px-4 text-sm", lg: "h-12 px-6 text-base" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? <span className="h-4 w-4 animate-pulse rounded-full bg-current/40" aria-hidden /> : null}
      {children}
    </button>
  )
);
Button.displayName = "Button";`;

export function ProductoComponentes() {
  return (
    <Section
      id="p-componentes"
      index="06"
      eyebrow="Componentes principales"
      title="Componentes reutilizables con estados completos."
      intro={
        <>
          Cada componente de RestoPanel se construye una sola vez con variantes, tamaños y
          estados terminales. Nada queda a medias: loading con skeleton, error accionable,
          vacío con CTA, success con feedback, focus visible, ARIA y responsive real. Un
          botón es siempre un botón; nunca un div con onClick.
        </>
      }
    >
      {/* Catálogo de componentes */}
      <div className="mb-12">
        <H3 className="mb-3">Catálogo de componentes</H3>
        <Lead className="mb-4">
          Dieciséis familias cubren el 95 % de la superficie del producto. Cada fila declara
          variantes y estados que <span className="text-foreground">deben existir</span> antes
          de marcar el componente como done.
        </Lead>
        <DataTable
          head={["Componente", "Variantes", "Estados"]}
          rows={COMP_ROWS.map((r) => [
            <span key="c" className="font-mono text-[12px] rp-gold-text">
              {r.componente}
            </span>,
            <span key="v" className="text-foreground/85">
              {r.variantes}
            </span>,
            <span key="e" className="text-foreground/85">
              {r.estados}
            </span>,
          ])}
        />
      </div>

      {/* Reglas de componentes */}
      <GlassCard variant="gold" className="mb-12">
        <H3>Reglas de componentes</H3>
        <Lead className="mt-2">
          Siete invariantes no negociables. Sirven como definición de done en code review y
          como gate de CI.
        </Lead>
        <div className="mt-5">
          <GoldList
            items={[
              <>
                Ningún botón puramente decorativo: todo CTA tiene acción o estado{" "}
                <Mono>disabled</Mono> con <Mono>reason</Mono> visible (tooltip o aria-label).
              </>,
              <>
                Skeletons en vez de spinners genéricos: el placeholder respetar layout final
                (mismas dimensiones y huecos) para evitar saltos visuales.
              </>,
              <>
                <Mono>focus-visible</Mono> en todos los interactivos con anillo dorado y{" "}
                <Mono>ring-offset</Mono> sobre fondo. Nunca <Mono>outline: none</Mono> sin
                reemplazo.
              </>,
              <>
                Estados completos: <Mono>loading</Mono>, <Mono>error</Mono>, <Mono>empty</Mono>{" "}
                y <Mono>success</Mono> definidos por contrato; sin ellos, el componente no se
                publica.
              </>,
              <>
                Responsive real (no desktop encogido): breakpoints mobile-first, touch targets
                <Mono> ≥ 44px</Mono>, layouts que se rearma por breakpoint.
              </>,
              <>
                Accesibilidad ARIA: roles semánticos, <Mono>aria-busy</Mono>,{" "}
                <Mono>aria-disabled</Mono>, <Mono>aria-live</Mono> para toasts, etiquetas
                asociadas por <Mono>htmlFor</Mono>/<Mono>id</Mono>.
              </>,
              <>
                Microinteracciones discretas: <Mono>transition-all</Mono> 150-200ms, sin rebotes
                llamativos, respeto a <Mono>prefers-reduced-motion</Mono>.
              </>,
            ]}
          />
        </div>
      </GlassCard>

      {/* Button.tsx representativo */}
      <div className="mb-12">
        <H3 className="mb-3">Ejemplo canónico: <Mono>packages/ui/src/button.tsx</Mono></H3>
        <Lead className="mb-4">
          Variante, tamaño, <Mono>loading</Mono>, <Mono>disabled</Mono>, ARIA y focus visible
          en menos de 40 líneas. Sirve de patrón para todos los componentes interactivos.
        </Lead>
        <Code lang="typescript">{BUTTON_CODE}</Code>
      </div>

      {/* Estados completos */}
      <Callout kind="ok" title="Estados completos">
        Todo componente expone <Mono>loading</Mono>, <Mono>error</Mono>, <Mono>empty</Mono> y{" "}
        <Mono>success</Mono>. Ningún botón queda sin feedback. Los skeletons respetan el
        layout final (no saltos visuales) y los estados de error incluyen acción recuperable
        (reintentar, contacto, documentación), no solo un mensaje rojo.
      </Callout>
    </Section>
  );
}

/* ============================================================ */
/*  07 — FLUJOS CRÍTICOS                                        */
/* ============================================================ */
type FlowCard = {
  n: string;
  titulo: string;
  actor: string;
  objetivo: string;
  pasos: string[];
  estados: string;
  excepciones: string[];
  automatizaciones: string[];
  metrica: string;
};

const FLOW_CARDS: FlowCard[] = [
  {
    n: "01",
    titulo: "Alta de restaurante",
    actor: "Owner",
    objetivo: "Llevar un nuevo local de cero a primer servicio activo.",
    pasos: [
      "Email de bienvenida con enlace de activación.",
      "Creación de organización y primer local.",
      "Configuración de horario, mesas y carta mínima.",
      "Verificación de WhatsApp Business y dominio.",
      "Activación del widget de reservas y primer reserva.",
    ],
    estados: "borrador → configurado → listo",
    excepciones: [
      "Dominio ya existente en otra organización.",
      "WhatsApp no verificado en 72h.",
      "Pago del plan fallido (grace period 7 días).",
    ],
    automatizaciones: [
      "Email de bienvenida con checklist.",
      "Checklist guiado de onboarding.",
      "Recordatorios a T+24h y T+72h.",
    ],
    metrica: "Tiempo a primer servicio < 48h.",
  },
  {
    n: "02",
    titulo: "Reserva de cliente",
    actor: "Cliente final",
    objetivo: "Reservar una mesa en menos de 60 segundos desde el widget.",
    pasos: [
      "Selección de fecha, hora y tamaño de partido.",
      "Introducción de datos del cliente.",
      "Validación de disponibilidad en tiempo real.",
      "Confirmación y recepción de comprobante.",
    ],
    estados: "solicitada → confirmada → check-in → completada",
    excepciones: [
      "Sin disponibilidad para el slot solicitado.",
      "Fuera de horario operativo.",
      "Cliente bloqueado por no-shows previos.",
    ],
    automatizaciones: [
      "Validación de slot vía Durable Object.",
      "Upsert en CRM con deduplicación.",
      "Confirmación por email + WhatsApp.",
    ],
    metrica: "Conversión del widget > 35%.",
  },
  {
    n: "03",
    titulo: "Confirmación y recordatorio",
    actor: "Sistema",
    objetivo: "Reducir el no-show con recordatorios y reconfirmación.",
    pasos: [
      "Reserva confirmada al crear.",
      "Recordatorio automático a T-24h.",
      "Reconfirmación opcional por canal.",
      "Check-in o marca de no-show.",
    ],
    estados: "confirmada → reconfirmada → check-in | no-show",
    excepciones: [
      "Sin respuesta al recordatorio.",
      "Cliente cancela dentro de política.",
      "Canal caído (email o WhatsApp).",
    ],
    automatizaciones: [
      "Recordatorio T-24h.",
      "Fallback de canal (email ↔ WhatsApp).",
      "Marca automática de no-show tras gracia.",
    ],
    metrica: "No-show < 8%.",
  },
  {
    n: "04",
    titulo: "Operación de sala",
    actor: "Host",
    objetivo: "Cubrir un servicio completo sin dobles reservas ni mesas huérfanas.",
    pasos: [
      "Visualización del plano en tiempo real.",
      "Check-in de reserva a la llegada.",
      "Asignación de mesa y movimiento de nodos.",
      "Gestión de walk-ins y overbooking controlado.",
      "Cierre de mesa y liberación tras limpieza.",
    ],
    estados: "libre → reservada → ocupada → por limpiar → libre",
    excepciones: [
      "Overbooking detectado por conflicto de slot.",
      "Conflicto de mesa ya asignada.",
      "Caída de sincronización DO ↔ D1.",
    ],
    automatizaciones: [
      "Sincronización DO → D1 → clientes.",
      "Detección automática de conflictos.",
      "Notificación al maitre ante excepción.",
    ],
    metrica: "Latencia de sync < 500ms.",
  },
  {
    n: "05",
    titulo: "Solicitud de reseña",
    actor: "Cliente / Manager",
    objetivo: "Convertir cada servicio en una reseña pública gestionada.",
    pasos: [
      "Petición post-servicio por email o WhatsApp.",
      "El cliente valora y deja comentario.",
      "La reseña ingresa al panel.",
      "La IA propone respuesta (borrador).",
      "Aprobación humana y publicación.",
    ],
    estados: "solicitada → recibida → respondida → publicada",
    excepciones: [
      "Cliente deja reseña negativa.",
      "Google Business Profile API caída.",
      "Contenido sensible detectado por IA.",
    ],
    automatizaciones: [
      "Análisis de sentimiento automático.",
      "Borrador de respuesta por IA.",
      "Escalado a manager si sentimiento ≤ 2★.",
    ],
    metrica: "Tiempo medio de respuesta < 24h.",
  },
  {
    n: "06",
    titulo: "Segmentación y campaña",
    actor: "Marketing",
    objetivo: "Lanzar campañas segmentadas medibles y consentidas.",
    pasos: [
      "Definición de segmento con filtros CRM.",
      "Diseño de journey multicanal.",
      "Aprobación de plantillas (WhatsApp/Email).",
      "Lanzamiento programado.",
      "Medición de CTR, conversión y fatiga.",
    ],
    estados: "borrador → aprobado → activo → pausado | finalizado",
    excepciones: [
      "Límite de envíos por plan excedido.",
      "Plantilla rechazada por el proveedor.",
      "Fatiga de cliente detectada (cooling).",
    ],
    automatizaciones: [
      "Cálculo de segmento en background.",
      "Envío programado con rate limit por canal.",
      "Límites de consentimiento y baja automática.",
    ],
    metrica: "CTR > 12%.",
  },
  {
    n: "07",
    titulo: "Suscripción y billing",
    actor: "Owner",
    objetivo: "Gestionar plan, pago y uso medido sin fricción.",
    pasos: [
      "Elección de plan y locales incluidos.",
      "Pago vía Stripe ( SetupIntent o PaymentElement).",
      "Entitlements aplicados al contexto tenant.",
      "Uso medido (mensajes SMS, IA, almacenamiento).",
      "Renovación, cambio de plan o cancelación.",
    ],
    estados: "activa → renovada | cancelada | impagada",
    excepciones: [
      "Pago fallido (3 intentos con dunning).",
      "Límite de uso excedido (grace o hard block).",
      "Cancelación dentro de política de reembolso.",
    ],
    automatizaciones: [
      "Sync Stripe webhook → entitlements.",
      "Aplicación de entitlements en middleware.",
      "Bloqueo gracioso con banner y retry.",
    ],
    metrica: "MRR por local estable o creciente.",
  },
  {
    n: "08",
    titulo: "Soporte e impersonación",
    actor: "Soporte",
    objetivo: "Diagnosticar y resolver con trazabilidad dual sin perder control.",
    pasos: [
      "Apertura de ticket con contexto.",
      "Diagnóstico con logs y métricas.",
      "Impersonación de solo lectura (con motivo).",
      "Acción asistida con actor dual.",
      "Cierre auditable del caso.",
    ],
    estados: "abierto → investigación → resuelto → cerrado",
    excepciones: [
      "Impersonación denegada por policy.",
      "Incidente de seguridad detectado.",
      "Rol del actor no autorizado para la acción.",
    ],
    automatizaciones: [
      "Banner de impersonación visible.",
      "Actor dual (real + efectivo) en cada mutación.",
      "Kill switch global para revocar sesiones.",
    ],
    metrica: "MTTR < 4h.",
  },
];

export function ProductoFlujos() {
  return (
    <Section
      id="p-flujos"
      index="07"
      eyebrow="Flujos críticos"
      title="Journeys de extremo a extremo con estados y excepciones."
      intro={
        <>
          Ocho flujos cubren la operación completa del restaurante y de la plataforma. Cada
          uno declara actor, objetivo, pasos numerados, estados, excepciones, automatizaciones
          y métrica de éxito. No se entrega un flujo sin su tratamiento de errores y su
          automatización asociada.
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        {FLOW_CARDS.map((f) => (
          <GlassCard key={f.n} className="flex flex-col">
            <div className="flex items-start gap-3 mb-3">
              <span className="font-mono text-xs rp-gold-text mt-0.5">{f.n}</span>
              <div className="flex-1">
                <H3 className="text-lg sm:text-xl">{f.titulo}</H3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  <span>Actor</span>
                  <span className="rp-gold-text">{f.actor}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{f.objetivo}</p>

            <ol className="space-y-1.5 mb-4">
              {f.pasos.map((p, i) => (
                <li key={i} className="flex gap-2.5 text-sm">
                  <span className="font-mono text-[11px] text-muted-foreground/80 mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-foreground/85">{p}</span>
                </li>
              ))}
            </ol>

            <div className="mb-3 text-sm">
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                Estados
              </div>
              <code className="font-mono text-[12px] rp-teal-text">{f.estados}</code>
            </div>

            <div className="mb-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                Excepciones
              </div>
              <ul className="space-y-1">
                {f.excepciones.map((e, i) => (
                  <li key={i} className="flex gap-2 text-xs text-foreground/75">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                Automatizaciones
              </div>
              <ul className="space-y-1">
                {f.automatizaciones.map((a, i) => (
                  <li key={i} className="flex gap-2 text-xs text-foreground/75">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--teal)]" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto pt-3 border-t border-border/40 flex items-center gap-2">
              <Pill tone="gold">Métrica</Pill>
              <span className="text-sm text-foreground/90">{f.metrica}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="mt-10">
        <Callout kind="warn" title="Acciones destructivas requieren confirmación">
          Ninguna acción destructiva (eliminar, cancelar, purgar) se ejecuta sin confirmación
          explícita del actor. Las acciones sensibles (precio, campaña pública, respuesta a
          reseña, pago) requieren permiso específico y, si la salida es generada por IA,
          aprobación humana previa a la publicación. El sistema nunca ejecuta un borrador de
          IA sobre una superficie pública sin checkpoint humano.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  08 — LANDING INTERACTIVA                                    */
/* ============================================================ */

/* --- Mockup: datos demo estáticos pero realistas --- */
const DEMO_KPIS = [
  { label: "Reservas hoy", value: "84", delta: "+12%", tone: "gold" as const },
  { label: "Ocupación", value: "78%", delta: "+5pp", tone: "teal" as const },
  { label: "No-shows", value: "3", delta: "-42%", tone: "fg" as const },
  { label: "Ticket medio", value: "38€", delta: "+2€", tone: "gold" as const },
];

const DEMO_RESERVATIONS = [
  { name: "Laura M.", time: "13:30", size: 4, status: "confirmed", tone: "gold" as const },
  { name: "Bruno C.", time: "14:00", size: 2, status: "waitlist", tone: "teal" as const },
  { name: "Familia Ortega", time: "14:15", size: 6, status: "confirmed", tone: "gold" as const },
  { name: "Sara V.", time: "14:30", size: 2, status: "confirmed", tone: "gold" as const },
];

const DEMO_TABLES = [
  { id: "T1", state: "occupied", label: "Ocupada" },
  { id: "T2", state: "reserved", label: "Reservada" },
  { id: "T3", state: "free", label: "Libre" },
  { id: "T4", state: "free", label: "Libre" },
  { id: "T5", state: "occupied", label: "Ocupada" },
  { id: "T6", state: "blocked", label: "Bloqueada" },
];

const DEMO_ACTIVITY = [
  { t: "13:32", txt: "Reserva confirmada · Laura M. (4 pax)", tone: "gold" as const },
  { t: "13:28", txt: "Mesa T1 ocupada · ticket abierto", tone: "fg" as const },
  { t: "13:21", txt: "Reseña 5★ respondida por IA y aprobada", tone: "teal" as const },
  { t: "13:15", txt: "Walk-in en T4 · asignado por host", tone: "fg" as const },
  { t: "13:02", txt: "Campaña VIP · 48 envíos (CTR 14%)", tone: "gold" as const },
];

const TABLE_TONE: Record<string, string> = {
  free: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  reserved: "border-[var(--gold)]/45 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
  occupied: "border-rose-400/45 bg-rose-400/10 text-rose-300",
  blocked: "border-foreground/25 bg-foreground/5 text-muted-foreground",
};

const STATUS_TONE: Record<string, string> = {
  confirmed: "bg-[var(--gold)]/15 text-[var(--gold-soft)] border-[var(--gold)]/30",
  waitlist: "bg-[var(--teal)]/15 text-[var(--teal)] border-[var(--teal)]/30",
};

const PROBLEMS = [
  {
    icon: "📅",
    title: "Reservas dispersas",
    desc: "WhatsApp, teléfono, Google, la web. Cada canal en su sitio.",
    sol: "Reservas inteligentes",
    href: "#p-reservas",
  },
  {
    icon: "🪑",
    title: "Mesas vacías",
    desc: "Capacidad mal aprovechada por falta de visibilidad de sala.",
    sol: "Plano de mesas",
    href: "#p-reservas",
  },
  {
    icon: "❌",
    title: "No-shows",
    desc: "Reservas que no se presentan y dejan huecos sin cubrir.",
    sol: "Recordatorios + waitlist",
    href: "#p-automatizaciones",
  },
  {
    icon: "👤",
    title: "Datos de clientes perdidos",
    desc: "Sin historial, sin preferencias, sin segmentos accionables.",
    sol: "CRM",
    href: "#p-crm",
  },
  {
    icon: "⭐",
    title: "Reseñas sin responder",
    desc: "Cada reseña negativa tarda días. La reputación se erosiona.",
    sol: "Google Reviews + IA",
    href: "#p-reputacion",
  },
  {
    icon: "📝",
    title: "Procesos manuales",
    desc: "Turnos, listas, recordatorios: todo a mano, todo propenso a error.",
    sol: "Automatizaciones",
    href: "#p-automatizaciones",
  },
  {
    icon: "🧩",
    title: "Herramientas desconectadas",
    desc: "Cinco SaaS que no hablan entre sí y cinco facturas mensuales.",
    sol: "Plataforma conectada",
    href: "#p-landing",
  },
  {
    icon: "📊",
    title: "Falta de visibilidad de rentabilidad",
    desc: "No sabes qué servicio, qué mesa o qué campaña realmente genera ingreso.",
    sol: "Analytics + IA",
    href: "#p-reputacion",
  },
];

const MODULES = [
  { name: "Reservas inteligentes", benefit: "Más reservas, menos huecos, un solo widget.", estado: "Disponible", tone: "gold" as const, cta: "Ver widget" },
  { name: "Plano de mesas", benefit: "Sala visible en tiempo real con drag & drop.", estado: "Disponible", tone: "gold" as const, cta: "Ver plano" },
  { name: "CRM", benefit: "Clientes, segmentos, VIP y preferencias en un sitio.", estado: "Disponible", tone: "gold" as const, cta: "Abrir CRM" },
  { name: "Marketing", benefit: "Campañas multicanal consentidas y medibles.", estado: "Disponible", tone: "gold" as const, cta: "Crear campaña" },
  { name: "Automatizaciones", benefit: "Recordatorios, reconfirmaciones y escalados.", estado: "Disponible", tone: "gold" as const, cta: "Builder" },
  { name: "Google Reviews", benefit: "Borradores de IA con aprobación humana.", estado: "Disponible", tone: "gold" as const, cta: "Bandeja" },
  { name: "Analytics", benefit: "Ocupación, ticket medio, rentabilidad por servicio.", estado: "Disponible", tone: "gold" as const, cta: "Ver reportes" },
  { name: "IA Copilot", benefit: "Pregunta al SO del restaurante y actúa.", estado: "Beta", tone: "teal" as const, cta: "Probar" },
  { name: "Lista de espera", benefit: "Walk-ins en cola inteligente con notificación.", estado: "Disponible", tone: "gold" as const, cta: "Ver lista" },
  { name: "Marketplace", benefit: "Integraciones certificadas con pago unificado.", estado: "Próximamente", tone: "outline" as const, cta: "Explorar" },
  { name: "Integraciones", benefit: "POS, pagos, delivery y contabilidad conectados.", estado: "Parcial", tone: "teal" as const, cta: "Conectar" },
];

export function ProductoLanding() {
  return (
    <Section
      id="p-landing"
      index="08"
      eyebrow="Landing interactiva"
      title="Una experiencia de producto, no una página corporativa."
      intro={
        <>
          La landing no vende funcionalidades: vende la experiencia de usar el producto. El
          hero muestra un dashboard real (etiquetado como demo) con reservas llegando, mesas
          cambiando de estado y KPIs actualizados. La prueba social está etiquetada, los
          problemas del sector enlazan con soluciones concretas y los once módulos muestran el
          beneficio que consiguen para el restaurante.
        </>
      }
    >
      {/* ---------- HERO MOCKUP ---------- */}
      <div className="mb-16">
        <div className="rp-glass-strong rounded-2xl overflow-hidden">
          {/* Top bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-border/40 bg-foreground/[0.03]">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Vista previa · datos demo
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Pill tone="gold">Servicio en curso</Pill>
              <Pill tone="outline">Local: Demo · Centro</Pill>
            </div>
          </div>

          {/* Hero text block */}
          <div className="px-5 sm:px-8 py-8 sm:py-12 border-b border-border/40">
            <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8 items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Pill tone="gold">RestoPanel</Pill>
                  <Pill tone="teal">SaaS Enterprise</Pill>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-light tracking-tight leading-tight">
                  Software para restaurantes que convierte cada servicio en{" "}
                  <span className="rp-gold-gradient">más ingresos</span>.
                </h3>
                <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Gestiona reservas, mesas, clientes, marketing, reputación y rendimiento desde
                  una sola plataforma. Sin hojas de cálculo, sin herramientas sueltas, sin
                  horas perdidas en tareas manuales.
                </p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  <span className="inline-flex items-center gap-2 rounded-lg bg-[var(--gold)] px-4 py-2 text-sm font-medium text-black">
                    Crear cuenta <span aria-hidden>→</span>
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-lg border border-border/70 px-4 py-2 text-sm">
                    Solicitar demo
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-lg border border-border/70 px-4 py-2 text-sm">
                    Ver cómo funciona
                  </span>
                </div>
              </div>

              {/* Mini KPI row */}
              <div className="grid grid-cols-2 gap-3">
                {DEMO_KPIS.map((k) => (
                  <div
                    key={k.label}
                    className="rp-glass rounded-xl p-4 relative"
                  >
                    <span className="absolute top-3 right-3 text-[9px] font-mono uppercase tracking-wider text-muted-foreground/70">
                      demo
                    </span>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      {k.label}
                    </div>
                    <div
                      className={
                        "mt-1 font-display text-2xl font-light " +
                        (k.tone === "gold" ? "rp-gold-text" : k.tone === "teal" ? "rp-teal-text" : "text-foreground")
                      }
                    >
                      {k.value}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{k.delta}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Two columns: reservations + floor plan */}
          <div className="grid lg:grid-cols-[1.2fr_1fr] border-b border-border/40">
            {/* Reservations list */}
            <div className="p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-border/40">
              <div className="flex items-center justify-between mb-4">
                <H3 className="text-base">Reservas entrantes</H3>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
                  demo
                </span>
              </div>
              <div className="space-y-2">
                {DEMO_RESERVATIONS.map((r) => (
                  <div
                    key={r.time + r.name}
                    className="flex items-center justify-between gap-3 rp-glass rounded-lg px-3 py-2.5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs rp-gold-text">{r.time}</span>
                      <div className="min-w-0">
                        <div className="text-sm text-foreground truncate">{r.name}</div>
                        <div className="text-[11px] text-muted-foreground">{r.size} pax</div>
                      </div>
                    </div>
                    <span
                      className={
                        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider " +
                        (STATUS_TONE[r.status] || STATUS_TONE.confirmed)
                      }
                    >
                      {r.status === "confirmed" ? "Confirmada" : "En espera"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floor plan */}
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <H3 className="text-base">Plano de sala</H3>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
                  demo
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {DEMO_TABLES.map((t) => (
                  <div
                    key={t.id}
                    className={
                      "rounded-lg border px-3 py-4 text-center transition-transform hover:scale-[1.03] cursor-default " +
                      (TABLE_TONE[t.state] || TABLE_TONE.free)
                    }
                  >
                    <div className="font-display text-lg">{t.id}</div>
                    <div className="text-[10px] font-mono uppercase tracking-wider mt-0.5">
                      {t.label}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Libre
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[var(--gold)]" /> Reservada
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-400" /> Ocupada
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-foreground/40" /> Bloqueada
                </span>
              </div>
            </div>
          </div>

          {/* Activity feed */}
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <H3 className="text-base">Actividad reciente</H3>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
                demo
              </span>
            </div>
            <ul className="space-y-2">
              {DEMO_ACTIVITY.map((a, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm"
                >
                  <span className="font-mono text-[11px] text-muted-foreground/80 mt-0.5">
                    {a.t}
                  </span>
                  <span
                    className={
                      "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full " +
                      (a.tone === "gold" ? "bg-[var(--gold)]" : a.tone === "teal" ? "bg-[var(--teal)]" : "bg-foreground/40")
                    }
                  />
                  <span className="text-foreground/85">{a.txt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground text-center">
          Composición estática con datos demo · no es un sistema en vivo
        </p>
      </div>

      {/* ---------- PRUEBA SOCIAL ---------- */}
      <div className="mb-16">
        <H3 className="mb-3">Prueba social (métricas demo etiquetadas)</H3>
        <Lead className="mb-4">
          Cada cifra lleva etiqueta <Mono>demo</Mono> explícita. No se hace pasar ningún dato
          agregado por una métrica real de la plataforma: las cifras reales se publican en el
          panel de Super Admin una vez en producción.
        </Lead>
        <DataTable
          head={["Métrica", "Valor (demo)", "Etiqueta"]}
          rows={[
            [<span key="m" className="text-foreground">Reservas gestionadas</span>, <span key="v" className="font-display text-lg rp-gold-text">1.2M</span>, <Pill key="t" tone="outline">demo</Pill>],
            [<span key="m" className="text-foreground">Restaurantes activos</span>, <span key="v" className="font-display text-lg rp-gold-text">3.400</span>, <Pill key="t" tone="outline">demo</Pill>],
            [<span key="m" className="text-foreground">No-shows reducidos</span>, <span key="v" className="font-display text-lg rp-gold-text">-42%</span>, <Pill key="t" tone="outline">demo</Pill>],
            [<span key="m" className="text-foreground">Horas ahorradas</span>, <span key="v" className="font-display text-lg rp-gold-text">180k/mes</span>, <Pill key="t" tone="outline">demo</Pill>],
            [<span key="m" className="text-foreground">Clientes fidelizados</span>, <span key="v" className="font-display text-lg rp-gold-text">2.1M</span>, <Pill key="t" tone="outline">demo</Pill>],
            [<span key="m" className="text-foreground">Mejora media valoración</span>, <span key="v" className="font-display text-lg rp-gold-text">+0.6★</span>, <Pill key="t" tone="outline">demo</Pill>],
          ]}
        />
      </div>

      {/* ---------- PROBLEMAS DEL SECTOR ---------- */}
      <div className="mb-16">
        <H3 className="mb-3">Problemas del sector</H3>
        <Lead className="mb-5">
          Ocho dolores reales que el restaurante vive cada día. Cada problema enlaza con la
          solución concreta dentro de la plataforma.
        </Lead>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROBLEMS.map((p) => (
            <GlassCard key={p.title} className="flex flex-col h-full">
              <div className="text-2xl mb-3" aria-hidden>{p.icon}</div>
              <div className="font-display text-base font-medium mb-1.5">{p.title}</div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{p.desc}</p>
              <a
                href={p.href}
                className="mt-auto inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider rp-gold-text hover:underline"
              >
                → Solución: {p.sol}
              </a>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* ---------- PLATAFORMA CONECTADA ---------- */}
      <div className="mb-16">
        <H3 className="mb-3">Plataforma conectada</H3>
        <Lead className="mb-5">
          Once módulos que comparten datos, identidad y reglas. No es una colección de
          herramientas: es un sistema operativo de restaurante.
        </Lead>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((m) => (
            <GlassCard key={m.name} className="flex flex-col h-full">
              <div className="flex items-start justify-between gap-2 mb-2">
                <H3 className="text-base">{m.name}</H3>
                <Pill tone={m.tone}>{m.estado}</Pill>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{m.benefit}</p>
              <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider rp-gold-text hover:underline cursor-default">
                {m.cta} →
              </span>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* ---------- COPY ORIENTADO A BENEFICIO ---------- */}
      <GlassCard variant="gold" className="mb-12">
        <H3>Copy orientado a beneficio</H3>
        <Lead className="mt-2">
          El hero comunica beneficio económico y operativo, no una lista de funcionalidades.
          Cada módulo muestra qué consigue el restaurante, no qué botones tiene.
        </Lead>
        <div className="mt-5">
          <GoldList
            items={[
              <>
                Hero con promesa económica explícita: <Mono>más reservas</Mono>,{" "}
                <Mono>menos no-shows</Mono>, <Mono>más ticket</Mono>, <Mono>menos tiempo</Mono>.
              </>,
              <>
                Cada módulo declara su beneficio en una línea (ej. CRM → “clientes, segmentos y
                VIP en un sitio”, no “campos personalizados y filtros avanzados”).
              </>,
              <>
                CTAs claros y diferenciados: <Mono>Crear cuenta</Mono> (alta),{" "}
                <Mono>Solicitar demo</Mono> (calificado), <Mono>Ver cómo funciona</Mono>{" "}
                (educación). Ningún botón genérico tipo <Mono>Saber más</Mono>.
              </>,
              <>
                Prueba social etiquetada como demo: honestidad por defecto, sin inflar cifras
                ni prometer posicionamiento.
              </>,
              <>
                Secciones orientadas a caso de uso ( problema → solución → módulo) en vez de a
                feature list plana.
              </>,
              <>
                Tono operativo y concreto: el restaurante entiende “menos no-shows” mejor que
                “motor de reconfirmación multicanal”.
              </>,
            ]}
          />
        </div>
      </GlassCard>

      {/* ---------- SEO Y AEO ---------- */}
      <Callout kind="info" title="SEO y AEO">
        Title y meta únicos por URL, canonical absoluto, Open Graph y Twitter Cards, sitemap
        XML, robots.txt con reglas por ruta, Schema.org (<Mono>SoftwareApplication</Mono>,{" "}
        <Mono>FAQPage</Mono>, <Mono>Organization</Mono>), breadcrumbs estructurados, URLs
        limpias, páginas dedicadas por funcionalidad y caso de uso, comparativas honestas y
        documentación rastreable. Sin keyword stuffing ni promesas de posicionamiento: la
        optimización se mide por clics cualificados, no por vanity metrics.
      </Callout>
    </Section>
  );
}
