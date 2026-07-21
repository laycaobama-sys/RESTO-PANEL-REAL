import * as React from "react";
import {
  Section,
  GlassCard,
  Risk,
  Pill,
  H3,
  Lead,
  DataTable,
  GoldList,
  Callout,
  Code,
} from "@/components/rp/primitives";
import { Mermaid } from "@/components/rp/mermaid";

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
/*  01 — RESUMEN Y DECISIONES PRINCIPALES                        */
/* ============================================================ */
type Decision = {
  id: string;
  decision: string;
  recomendacion: string;
  riesgo: "bajo" | "medio" | "alto" | "crítico";
  revisar: string;
};

const DECISIONES: Decision[] = [
  {
    id: "dec-estilo",
    decision: "Estilo arquitectónico",
    recomendacion: "Monolito modular orientado a dominios",
    riesgo: "medio",
    revisar: "Cuello de escala medido o equipo > 3 squads",
  },
  {
    id: "dec-comm",
    decision: "Comunicación entre dominios",
    recomendacion: "Síncrona vía interfaces + asíncrona vía eventos tipados",
    riesgo: "bajo",
    revisar: "Latencia cross-dominio > objetivo",
  },
  {
    id: "dec-datos",
    decision: "Propiedad de datos",
    recomendacion: "Lógica por dominio; BD física compartida en MVP",
    riesgo: "medio",
    revisar: "Un dominio supere cuotas de carga/aislamiento",
  },
  {
    id: "dec-consistencia",
    decision: "Consistencia",
    recomendacion: "Outbox transaccional + idempotencia en consumidores",
    riesgo: "medio",
    revisar: "Volumen de eventos > umbral",
  },
  {
    id: "dec-extraccion",
    decision: "Extracción a microservicio",
    recomendacion: "Solo con ADR + cuello medido + equipo suficiente",
    riesgo: "alto",
    revisar: "Cada nuevo caso de extracción",
  },
  {
    id: "dec-ia",
    decision: "IA",
    recomendacion: "Asistentes especializados por dominio; aprobación humana lo sensible",
    riesgo: "medio",
    revisar: "Cambio de proveedor o coste",
  },
  {
    id: "dec-api",
    decision: "API pública",
    recomendacion: "/v1, OpenAPI, idempotencia, webhooks firmados",
    riesgo: "bajo",
    revisar: "Primer partner externo",
  },
];

export function Fase2Resumen() {
  return (
    <Section
      id="f2-resumen"
      index="01"
      eyebrow="Resumen y decisiones principales"
      title="Un núcleo pragmático, orientado a dominios, listo para evolucionar."
      intro={
        <>
          Fase 1.2 diseña el <strong className="text-foreground">Core Platform</strong> de RestoPanel: la
          fundación de la que dependen todos los módulos. Pragmático: monolito modular primero; la
          extracción a servicios solo cuando lo justifiquen cuellos medidos, tamaño de equipo o
          necesidades de aislamiento operativo.
        </>
      }
    >
      {/* Tesis */}
      <GlassCard variant="gold" className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="font-mono text-xs uppercase tracking-[0.2em] rp-gold-text">Tesis</span>
          <span className="h-px flex-1 bg-[var(--gold)]/30" />
        </div>
        <p className="text-base sm:text-lg leading-relaxed text-foreground/90">
          El núcleo debe garantizar <strong className="text-foreground">aislamiento multiempresa</strong>,
          <strong className="text-foreground"> seguridad por defecto</strong>,
          <strong className="text-foreground"> modularidad de dominio</strong>,
          <strong className="text-foreground"> bajo acoplamiento</strong>,
          <strong className="text-foreground"> escalabilidad horizontal</strong>,
          <strong className="text-foreground"> trazabilidad completa</strong>,
          <strong className="text-foreground"> extensibilidad vía eventos, automatizaciones e integraciones</strong>,
          <strong className="text-foreground"> compatibilidad con planes y límites</strong>, y
          <strong className="text-foreground"> migración progresiva</strong> de monolito modular a servicios
          independientes cuando esté justificado.
        </p>
      </GlassCard>

      {/* Qué entrega / Qué no hace */}
      <div className="grid lg:grid-cols-2 gap-5 mb-10">
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            <H3>Qué entrega la Fase 1.2</H3>
          </div>
          <GoldList
            items={[
              "14 dominios con ownership y límites",
              "Mapa de dominios + matriz de dependencias",
              "Sistema de eventos con outbox transaccional",
              "Motor de automatizaciones trigger → acción",
              "Capa común de integraciones",
              "API pública versionada",
              "RBAC + ABAC y auditoría inmutable",
              "Centro de notificaciones e IA",
              "Analítica por eventos",
              "Modelo de datos ER",
              "Contratos TypeScript",
              "10 ADRs",
              "Roadmap por iteraciones",
            ]}
          />
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--teal)]" />
            <H3>Qué NO hace</H3>
          </div>
          <GoldList
            items={[
              "No implementa todos los módulos completos",
              "No crea microservicios sin justificación medida",
              "No asume base de datos física por dominio en el MVP",
              "No permite acceso directo a tablas ajenas",
              "No deja que la IA ejecute acciones sensibles sin aprobación humana",
              "No acopla dominios vía shared state",
            ]}
          />
        </GlassCard>
      </div>

      {/* Decisiones principales */}
      <div className="mb-6 flex items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Decisiones principales
        </span>
        <span className="h-px flex-1 bg-border/60" />
      </div>
      <DataTable
        head={["Decisión", "Recomendación", "Riesgo", "Revisar cuando"]}
        rows={DECISIONES.map((d) => [
          <span key={`${d.id}-dec`} className="font-medium text-foreground">
            {d.decision}
          </span>,
          <span key={`${d.id}-rec`}>{d.recomendacion}</span>,
          <Risk key={`${d.id}-risk`} level={d.riesgo} />,
          <span key={`${d.id}-rev`} className="text-muted-foreground text-xs">
            {d.revisar}
          </span>,
        ])}
      />

      <div className="mt-8">
        <Callout id="ADR-001" kind="adr" title="Monolito modular primero">
          Se arranca con un <strong className="text-foreground">monolito modular orientado a dominios</strong>:
          un único desplegable con múltiples módulos de dominio y fronteras estrictas. La extracción a
          microservicios solo se considera con un ADR que justifique un cuello de botella medido, equipo
          suficiente y un caso de aislamiento operativo real.
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Coste
              </div>
              <div className="text-sm text-foreground/85">
                Disciplina de contratos, prohibición de importar <Mono>infrastructure</Mono> ajeno y
                validación en CI.
              </div>
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Beneficio
              </div>
              <div className="text-sm text-foreground/85">
                Velocidad de entrega inicial + camino de extracción futura definido y reversible.
              </div>
            </div>
          </div>
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  02 — CONTEXTO Y CONTENEDORES                                */
/* ============================================================ */
const CONTEXT_CHART = `flowchart TB
  subgraph Usuarios["Usuarios"]
    OWNER["Owner / Manager"]
    STAFF["Recepción / Sala / Cocina"]
    CLIENTE["Cliente final (widget)"]
    PLATFORM["Super Admin / Soporte"]
  end
  subgraph Core["RestoPanel Core Platform"]
    APIGW["API Gateway (Workers)"]
    DOM["Dominios (Identity, Reservations, CRM, ...)"]
    EVT["Eventos + Outbox + Queues"]
    AUTO["Motor de automatizaciones"]
    INT["Capa de integraciones"]
    NOTIF["Centro de notificaciones"]
    AI["Centro de IA"]
    ANA["Analítica"]
  end
  subgraph Externos["Sistemas externos"]
    STRIPE["Stripe"]
    WA["WhatsApp Cloud"]
    GOOGLE["Google (GBP/Maps/Calendar)"]
    RESEND["Resend (email)"]
    META["Meta / Instagram"]
  end
  OWNER --> APIGW
  STAFF --> APIGW
  CLIENTE --> APIGW
  PLATFORM --> APIGW
  APIGW --> DOM
  DOM --> EVT
  EVT --> AUTO
  EVT --> ANA
  EVT --> NOTIF
  DOM --> AI
  DOM --> INT
  INT <--> STRIPE
  INT <--> WA
  INT <--> GOOGLE
  INT <--> RESEND
  INT <--> META`;

const CONTAINER_CHART = `flowchart LR
  subgraph Apps["Apps"]
    A1[dashboard]
    A2[booking widget]
    A3[super-admin]
    A4[landing/docs/status]
  end
  subgraph CorePlatform["Core Platform (Workers)"]
    API[API + Auth + Tenant + RBAC]
    DOMS["Dominios de negocio"]
    EVS["Event bus (outbox + queues)"]
  end
  subgraph Datos["Persistencia"]
    D1[(D1 shard)]
    D2[(R2)]
    D3[(KV)]
    D4[(DO)]
  end
  Apps --> API
  API --> DOMS
  DOMS --> EVS
  DOMS --> D1
  DOMS --> D2
  API --> D3
  DOMS --> D4`;

export function Fase2Contexto() {
  return (
    <Section
      id="f2-contexto"
      index="02"
      eyebrow="Diagrama de contexto y contenedores"
      title="Contexto y contenedores: quién interactúa con el núcleo."
      intro={
        <>
          Vista C4 de nivel 1 (contexto) y nivel 2 (contenedores). Cuatro tipos de usuarios, una
          plataforma central desplegada en Workers y cinco familias de proveedores externos. Toda
          interacción pasa por el API Gateway; ningún dominio contacta proveedores externos directamente.
        </>
      }
    >
      <div className="mb-6 flex items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Nivel 1 · Contexto
        </span>
        <span className="h-px flex-1 bg-border/60" />
      </div>
      <Mermaid chart={CONTEXT_CHART} className="mb-10" />

      <div className="mb-6 flex items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Nivel 2 · Contenedores
        </span>
        <span className="h-px flex-1 bg-border/60" />
      </div>
      <Mermaid chart={CONTAINER_CHART} className="mb-10" />

      <GlassCard variant="gold">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
          <H3>Leyenda</H3>
        </div>
        <GoldList
          items={[
            "Los usuarios interactúan solo vía API Gateway con Auth + Tenant + RBAC; no existen vías alternativas a los dominios.",
            "Los dominios nunca se llaman por tablas ajenas, solo vía contratos (interfaces) o eventos (async).",
            "La capa de integraciones aísla a los proveedores externos (Stripe, WhatsApp, Google, Resend, Meta); el resto del sistema no conoce sus SDKs.",
            "La analítica y las automatizaciones consumen eventos, no consultan dominios directamente.",
          ]}
        />
      </GlassCard>
    </Section>
  );
}

/* ============================================================ */
/*  03 — MAPA DE DOMINIOS                                        */
/* ============================================================ */
type Domain = {
  id: string;
  name: string;
  purpose: string;
  responsibilities: string[];
  events: string[];
  persists: string;
};

const DOMAINS: Domain[] = [
  {
    id: "identity",
    name: "Identity",
    purpose: "Autenticación, sesiones y dispositivos de usuario.",
    responsibilities: [
      "Alta/baja de usuarios y credenciales",
      "Sesiones, MFA y passkeys",
      "Gestión de dispositivos confiables",
      "Revocación de sesión",
    ],
    events: ["UserCreated", "SessionRevoked", "MfaEnrolled"],
    persists: "users, sessions, identities, devices",
  },
  {
    id: "organizations",
    name: "Organizations",
    purpose: "Organizaciones, locales, membresía y routing de tenant.",
    responsibilities: [
      "Multi-local y membresía",
      "Routing por organización/local",
      "Ciclo de vida de organización",
      "Resolución de tenant (servidor)",
    ],
    events: ["OrganizationCreated", "LocationAdded", "MemberAdded"],
    persists: "organizations, locations, organization_members",
  },
  {
    id: "billing",
    name: "Billing",
    purpose: "Planes, suscripciones, facturas y uso medido.",
    responsibilities: [
      "Activación y renovación de suscripción",
      "Entitlements y límites por plan",
      "Registro de uso medido",
      "Emisión de facturas",
    ],
    events: [
      "SubscriptionActivated",
      "SubscriptionRenewed",
      "PaymentSucceeded",
      "EntitlementExceeded",
    ],
    persists: "subscriptions, invoices, usage_records, entitlements",
  },
  {
    id: "reservations",
    name: "Reservations",
    purpose: "Reservas, disponibilidad, slots, lista de espera y no-show.",
    responsibilities: [
      "Creación y confirmación de reservas",
      "Slots y disponibilidad por mesa/zona",
      "Lista de espera y reasignación",
      "Detección de no-show",
    ],
    events: [
      "ReservationCreated",
      "ReservationConfirmed",
      "ReservationCancelled",
      "ReservationCheckedIn",
      "NoShowDetected",
    ],
    persists: "reservations, reservation_history, waitlist, reservation_slots",
  },
  {
    id: "crm",
    name: "CRM",
    purpose: "Clientes, preferencias, etiquetas, visitas y alergias.",
    responsibilities: [
      "Ficha única de cliente",
      "Preferencias, alergias y tags",
      "Historial de visitas",
      "Fusión de duplicados",
    ],
    events: ["CustomerCreated", "CustomerVisited", "CustomerTagged", "CustomerMerged"],
    persists: "customers, customer_preferences, customer_tags, customer_visits",
  },
  {
    id: "tables",
    name: "Tables",
    purpose: "Salas, zonas, mesas, grupos y ocupación.",
    responsibilities: [
      "Mapa de salas y zonas",
      "Mesas y grupos de mesas",
      "Ocupación y liberación",
      "Reubicación de mesas",
    ],
    events: ["TableOccupied", "TableReleased", "TableMoved", "FloorUpdated"],
    persists: "floors, zones, tables, table_groups",
  },
  {
    id: "staff",
    name: "Staff",
    purpose: "Empleados, turnos, horarios y asistencia.",
    responsibilities: [
      "Alta de empleados y roles de staff",
      "Turnos y horarios",
      "Check-in/out de personal",
      "Cálculo de horas",
    ],
    events: ["EmployeeCheckedIn", "ShiftAssigned", "ScheduleUpdated"],
    persists: "employees, schedules, shifts, attendance",
  },
  {
    id: "analytics",
    name: "Analytics",
    purpose: "Pipeline de eventos, agregados y exportaciones.",
    responsibilities: [
      "Ingesta de eventos del bus",
      "Agregados diarios/mensuales/anuales",
      "Exportaciones bajo demanda",
      "Recomputación de agregados",
    ],
    events: ["AggregateRecomputed", "ExportRequested"],
    persists: "analytics_events, analytics_daily/monthly/yearly",
  },
  {
    id: "reviews",
    name: "Reviews",
    purpose: "Reseñas públicas y de Google, respuestas y sentimiento.",
    responsibilities: [
      "Captura de reseñas externas",
      "Respuestas (con aprobación)",
      "Análisis de sentimiento",
      "Alertas de reputación",
    ],
    events: ["ReviewReceived", "ReviewReplied", "SentimentUpdated"],
    persists: "google_reviews, public_reviews, review_replies",
  },
  {
    id: "marketing",
    name: "Marketing",
    purpose: "Campañas, automatizaciones y plantillas.",
    responsibilities: [
      "Diseño de campañas",
      "Automatizaciones de marketing",
      "Plantillas aprobadas",
      "Cuotas y consentimiento",
    ],
    events: ["CampaignLaunched", "AutomationTriggered", "TemplateApproved"],
    persists: "campaigns, automations, templates",
  },
  {
    id: "ai",
    name: "AI",
    purpose: "Asistentes especializados, prompts, runs y evaluaciones.",
    responsibilities: [
      "Asistentes por dominio",
      "Gestión de prompts y runs",
      "Solicitudes de aprobación humana",
      "Fallbacks controlados",
    ],
    events: ["AiRunCompleted", "AiApprovalRequested", "AiFallbackUsed"],
    persists: "ai_requests, ai_predictions, ai_logs",
  },
  {
    id: "integrations",
    name: "Integrations",
    purpose: "Adaptadores, conexiones, webhooks y API keys.",
    responsibilities: [
      "Conexiones con proveedores externos",
      "Webhooks entrantes y salientes",
      "Almacenamiento seguro de API keys",
      "Reintentos y reenvíos",
    ],
    events: [
      "IntegrationConnected",
      "IntegrationDisconnected",
      "WebhookReceived",
      "WebhookDelivered",
    ],
    persists: "integrations, webhook_deliveries, api_keys",
  },
  {
    id: "notifications",
    name: "Notifications",
    purpose: "Email, WhatsApp, SMS, push e internas; plantillas y envíos.",
    responsibilities: [
      "Cola y entrega multi-canal",
      "Plantillas y consentimiento",
      "Logs de entrega y bounce",
      "Horario silencioso",
    ],
    events: ["MessageQueued", "MessageDelivered", "MessageFailed", "BounceDetected"],
    persists: "notifications, notification_logs, message_templates",
  },
  {
    id: "super-admin",
    name: "Super Admin",
    purpose: "Operación de plataforma, salud, impersonación e incidentes.",
    responsibilities: [
      "Métricas de plataforma",
      "Sesiones de impersonación",
      "Gestión de incidentes",
      "Kill switch global",
    ],
    events: [
      "ImpersonationStarted",
      "ImpersonationEnded",
      "IncidentOpened",
      "KillSwitchActivated",
    ],
    persists: "platform_metrics, impersonation_sessions, incidents",
  },
];

export function Fase2Dominios() {
  return (
    <Section
      id="f2-dominios"
      index="03"
      eyebrow="Mapa de dominios"
      title="14 dominios con responsabilidad, límites y persistencia propia."
      intro={
        <>
          Cada dominio posee sus entidades, agregados, casos de uso, tablas de persistencia, eventos y
          permisos. La <strong className="text-foreground">propiedad de datos</strong> está separada
          lógicamente desde el día 1; la separación física llega solo con una extracción justificada.
        </>
      }
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {DOMAINS.map((d, idx) => (
          <GlassCard key={d.id} className="flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-2">
              <H3>{d.name}</H3>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {String(idx + 1).padStart(2, "0")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{d.purpose}</p>

            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
              Responsabilidades
            </div>
            <GoldList items={d.responsibilities} className="mb-4" />

            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
              Eventos publicados
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {d.events.map((ev, i) => (
                <Pill key={`ev-${d.id}-${i}`} tone="teal">
                  {ev}
                </Pill>
              ))}
            </div>

            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
              Persistencia
            </div>
            <div className="mt-auto">
              <Mono>{d.persists}</Mono>
            </div>
          </GlassCard>
        ))}
      </div>

      <Callout kind="info" title="Propiedad de datos separada lógicamente">
        En el MVP <strong className="text-foreground">no hay base de datos física por dominio</strong>;
        todos los dominios comparten el mismo shard de D1 (fragmentado por organización). Pero cada
        dominio es dueño de sus tablas y ningún otro dominio las lee o escribe directamente. La
        extracción a una BD dedicada requiere un ADR y una justificación medida (cuota de carga, aislamiento
        operativo o límite de tamaños por tabla).
      </Callout>
    </Section>
  );
}

/* ============================================================ */
/*  04 — MATRIZ DE DEPENDENCIAS                                  */
/* ============================================================ */
type Dep = {
  id: string;
  domain: string;
  depends: string;
  exposed: string[];
  forbidden: string;
};

const DEPENDENCIAS: Dep[] = [
  {
    id: "dep-identity",
    domain: "Identity",
    depends: "(ninguno)",
    exposed: ["Organizations", "todos (auth)"],
    forbidden: "acceder a tablas de negocio",
  },
  {
    id: "dep-organizations",
    domain: "Organizations",
    depends: "Identity",
    exposed: ["Billing", "todos los tenant-scoped"],
    forbidden: "saltarse Tenant Resolver",
  },
  {
    id: "dep-billing",
    domain: "Billing",
    depends: "Organizations",
    exposed: ["Super Admin (métricas)"],
    forbidden: "mutar reservas/clientes",
  },
  {
    id: "dep-reservations",
    domain: "Reservations",
    depends: "Organizations, Tables, CRM",
    exposed: ["Notifications", "Analytics", "Marketing"],
    forbidden: "escribir en tables directamente",
  },
  {
    id: "dep-crm",
    domain: "CRM",
    depends: "Organizations, Reservations",
    exposed: ["Marketing", "AI", "Notifications"],
    forbidden: "acceder a billing",
  },
  {
    id: "dep-tables",
    domain: "Tables",
    depends: "Organizations",
    exposed: ["Reservations (vía contrato)", "Analytics"],
    forbidden: "mutar reservas",
  },
  {
    id: "dep-staff",
    domain: "Staff",
    depends: "Organizations",
    exposed: ["Analytics"],
    forbidden: "acceder a CRM de clientes",
  },
  {
    id: "dep-analytics",
    domain: "Analytics",
    depends: "(todos vía eventos)",
    exposed: ["Super Admin"],
    forbidden: "consultar dominios síncrono en tiempo real masivo",
  },
  {
    id: "dep-reviews",
    domain: "Reviews",
    depends: "CRM, Organizations",
    exposed: ["AI", "Notifications"],
    forbidden: "escribir respuestas sin aprobación",
  },
  {
    id: "dep-marketing",
    domain: "Marketing",
    depends: "CRM, Notifications, Organizations",
    exposed: ["Analytics"],
    forbidden: "enviar sin consentimiento/cuota",
  },
  {
    id: "dep-ai",
    domain: "AI",
    depends: "CRM, Reviews, Reservations (vía contrato)",
    exposed: ["Audit"],
    forbidden: "ejecutar acciones sensibles sin aprobación",
  },
  {
    id: "dep-integrations",
    domain: "Integrations",
    depends: "Organizations",
    exposed: ["Reservations", "Reviews", "Notifications"],
    forbidden: "almacenar secretos en claro",
  },
  {
    id: "dep-notifications",
    domain: "Notifications",
    depends: "Organizations",
    exposed: ["Audit"],
    forbidden: "saltarse consentimiento/horario silencioso",
  },
  {
    id: "dep-super-admin",
    domain: "Super Admin",
    depends: "Organizations, Billing, Audit, Analytics",
    exposed: ["(plataforma)"],
    forbidden: "acceder a secretos o PII sin auditoría",
  },
];

const DEPENDENCY_GRAPH = `flowchart TB
  ID[Identity] --> ORG[Organizations]
  ORG --> BILL[Billing]
  ORG --> RES[Reservations]
  ORG --> CRM[CRM]
  ORG --> TBL[Tables]
  ORG --> STF[Staff]
  ORG --> INT[Integrations]
  RES --> TBL
  RES --> CRM
  CRM --> MKT[Marketing]
  CRM --> AI[AI]
  REV[Reviews] --> CRM
  REV --> AI
  NOTIF[Notifications]
  MKT --> NOTIF
  RES -.events.-> NOTIF
  RES -.events.-> ANA[Analytics]
  CRM -.events.-> ANA
  STF -.events.-> ANA
  AI -.events.-> AUD[Audit]
  INT -.events.-> AUD
  ANA --> SA[Super Admin]
  BILL --> SA
  ID -.events.-> AUD`;

export function Fase2Dependencias() {
  return (
    <Section
      id="f2-dependencias"
      index="04"
      eyebrow="Matriz de dependencias"
      title="Quién puede depender de quién; sin ciclos."
      intro={
        <>
          Las dependencias permitidas se documentan y se validan en CI. Ningún dominio puede importar el
          repositorio de otro; solo consume vía contratos (interfaces síncronas) o vía eventos (async). El
          grafo resultante es acíclico.
        </>
      }
    >
      <div className="mb-6 flex items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Matriz de dependencias permitidas
        </span>
        <span className="h-px flex-1 bg-border/60" />
      </div>
      <DataTable
        head={["Dominio", "Depende de (permitido)", "Expuesto a", "Prohibido"]}
        rows={DEPENDENCIAS.map((d) => [
          <span key={`${d.id}-dom`} className="font-medium text-foreground">
            {d.domain}
          </span>,
          <span key={`${d.id}-dep`} className="text-sm">
            {d.depends}
          </span>,
          <span key={`${d.id}-exp`} className="flex flex-wrap gap-1.5">
            {d.exposed.map((e, i) => (
              <Pill key={`exp-${d.id}-${i}`} tone="gold">
                {e}
              </Pill>
            ))}
          </span>,
          <span key={`${d.id}-forb`} className="text-xs text-muted-foreground">
            {d.forbidden}
          </span>,
        ])}
        className="mb-10"
      />

      <div className="grid lg:grid-cols-2 gap-5 mb-10">
        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            <H3>Reglas de dependencia</H3>
          </div>
          <GoldList
            items={[
              "Los dominios se comunican vía comandos/queries (interfaces) o eventos (async).",
              "Ningún dominio importa directamente el repositorio de otro.",
              "Las dependencias se validan en CI (eslint-plugin-boundaries + dependency-cruiser).",
              "La inversión de dependencias (ports/adapters) permite swapear proveedores.",
              "Un dominio puede consumir eventos de otro sin acoplarse a su esquema interno.",
            ]}
          />
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--teal)]" />
            <H3>Grafo de dependencias</H3>
          </div>
          <Mermaid chart={DEPENDENCY_GRAPH} className="!p-2" />
        </GlassCard>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  05 — ESTRUCTURA DEL REPOSITORIO                             */
/* ============================================================ */
const REPO_STRUCTURE = `restopanel/
  apps/
    landing/          adquisición + SEO
    dashboard/        operación del restaurante
    super-admin/      centro de control de plataforma
    booking/          widget de reserva pública
    docs/             documentación + portal dev
    status/           estado de servicio
  packages/
    contracts/        esquemas Zod + tipos de eventos/commands compartidos
    ui/               design system
    design-tokens/    tokens de marca
    config/           eslint, tsconfig, tailwind preset
    # dominios (cada uno con domain/ + application/ + infrastructure/ + events/)
    identity/
    organizations/
    billing/
    reservations/
    crm/
    tables/
    staff/
    analytics/
    reviews/
    marketing/
    ai/
    integrations/
    notifications/
    super-admin/
    # shared transversal (mínimo)
    auth/             middleware de sesión + tenant + rbac
    tenancy/          tenant enforcement layer
    audit/            audit log append-only
    observability/    logs, métricas, correlation
    storage/          adaptadores R2/KV
  workers/
    api/              API gateway + routing
    webhooks/         webhooks entrantes/salientes
    queues/           consumers de colas
    workflows/        procesos largos
    cron/             tareas programadas
    realtime/         Durable Objects + WS
  database/
    migrations/       forward-only, por shard
    seeds/            datos sintéticos
    schema/           esquemas referencia
  design-system/
  infra/
  docs/
    adr/
    event-catalog/
    data-dictionary/`;

const DOMAIN_INTERNAL = `packages/reservations/
  domain/          entidades, agregados, value objects, eventos
  application/     casos de uso (commands + queries)
  infrastructure/  repositorios (D1), adaptadores, proyecciones
  events/          esquemas de eventos publicados/consumidos
  api/             contratos HTTP/RPC internos
  tests/           unit, integración, contrato, IDOR
  index.ts         exports públicos (lo único importable desde fuera)`;

export function Fase2Repo() {
  return (
    <Section
      id="f2-repo"
      index="05"
      eyebrow="Estructura del repositorio"
      title="Monorepo orientado a dominios con fronteras que CI hace valer."
      intro={
        <>
          Un único monorepo con apps, paquetes de dominio, paquetes transversales mínimos y workers. La
          frontera entre dominios no es un acuerdo caballeroso: la impone CI con reglas que rompen el build
          si alguien cruza la línea.
        </>
      }
    >
      <div className="mb-6 flex items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Árbol del monorepo
        </span>
        <span className="h-px flex-1 bg-border/60" />
      </div>
      <Code lang="text" >
{REPO_STRUCTURE}
      </Code>

      <div className="mt-8 grid lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            <H3>Estructura interna de un dominio</H3>
          </div>
          <Code lang="text">
{DOMAIN_INTERNAL}
          </Code>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--teal)]" />
            <H3>Reglas de dependencia (CI)</H3>
          </div>
          <GoldList
            items={[
              "apps → packages (dominio + ui + contracts).",
              "dominio A → dominio B solo vía contracts (interfaces) o eventos.",
              "dominio → auth/tenancy/audit/observability (transversales permitidos).",
              "workers → dominios (casos de uso).",
              "NINGÚN dominio importa infrastructure de otro.",
              "NINGÚN dominio importa ui.",
              "database solo migraciones/esquemas.",
              "sin utils/services/helpers sin owner.",
              "dependency-cruiser + eslint-plugin-boundaries bloquean violaciones y ciclos.",
            ]}
          />
        </GlassCard>
      </div>

      <div className="mt-8">
        <Callout kind="ok" title="Contratos públicos = index.ts">
          Cada paquete exporta <strong className="text-foreground">únicamente</strong> vía su{" "}
          <Mono>index.ts</Mono> una API pública curada: tipos, casos de uso y esquemas de eventos. Los
          módulos internos no son importables. Esto convierte una futura extracción a servicio separado en
          un movimiento que preserva contratos, no en un rewrite.
        </Callout>
      </div>
    </Section>
  );
}
