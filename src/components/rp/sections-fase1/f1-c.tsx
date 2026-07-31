import * as React from "react";
import {
  Section,
  GlassCard,
  Tag,
  DataTable,
  GoldList,
  H3,
  Lead,
  Callout,
  Code,
  Pill,
} from "@/components/rp/primitives";
import { Mermaid } from "@/components/rp/mermaid";

/* ============================================================ */
/*  Helper: tabla-name en mono dorado                           */
/* ============================================================ */
function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-xs rp-gold-text whitespace-nowrap">{children}</code>
  );
}

/* ============================================================ */
/*  07 — MONOREPO Y DEPENDENCIAS                                */
/* ============================================================ */
const MONOREPO_TREE = `restopanel/
  apps/         landing · booking · dashboard · super-admin · docs · status
  packages/     contracts · ui · design-tokens · auth · tenancy · permissions
                database · billing · reservations · floor · crm · menu · workforce
                reputation · communications · automation · analytics · ai
                notifications · storage · audit · observability · config
                logger · seo · whatsapp · email
  workers/      api · webhooks · cron · queues · workflows · realtime
  database/     migrations/{control-plane,tenant-cell} · seeds · schema · fixtures
  design-system/ colors · typography · icons · animations · components · patterns · docs
  assets/       logos · banners · illustrations · videos
  infra/        cloudflare · environments · policies · runbooks
  docs/         adr · threat-models · data-dictionary · event-catalog
  scripts/`;

export function Fase1Monorepo() {
  return (
    <Section
      id="f1-monorepo"
      index="07"
      eyebrow="Monorepo y dependencias"
      title="Estructura definitiva y reglas de dependencia que CI hace valer."
      intro="El monorepo está particionado por responsabilidades, no por capas técnicas. Las apps son composición; los packages son dominio + contratos; los workers son tiempo de ejecución. La frontera entre paquetes es un contrato explícito que CI valida con eslint-plugin-boundaries y dependency-cruiser antes de cualquier merge."
    >
      <H3 className="mb-4">Estructura del monorepo</H3>
      <Code lang="text" >
        {MONOREPO_TREE}
      </Code>

      <div className="mt-10 grid lg:grid-cols-2 gap-5">
        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">permitido</Pill>
            <H3>Reglas de dependencia PERMITIDAS</H3>
          </div>
          <GoldList
            items={[
              "apps → packages (dominio + ui + contracts).",
              "packages/dominio → packages/contracts + packages/database (interfaces) + packages/observability.",
              "packages/dominio → adaptadores vía interfaces (inversión de dependencias).",
              "workers → packages (casos de uso). El worker es transporte, no lógica.",
              "packages/database → solo migraciones y esquemas; nada de reglas de negocio.",
            ]}
          />
        </GlassCard>

        <GlassCard className="border-l-2 border-destructive/50">
          <div className="flex items-center gap-2 mb-4">
            <Pill className="border-destructive/40 bg-destructive/10 text-destructive">prohibido</Pill>
            <H3>Reglas PROHIBIDAS</H3>
          </div>
          <GoldList
            items={[
              "apps no contienen reglas de negocio críticas.",
              "ui NO importa auth/billing/database.",
              "packages/dominio no importan otro dominio directamente (solo vía contracts/eventos).",
              "workers no escriben SQL improvisado.",
              "database no contiene reglas de negocio.",
              "sin carpetas utils/services/helpers sin owner.",
              "sin dependencias circulares.",
            ]}
          />
        </GlassCard>
      </div>

      <div className="mt-10">
        <H3 className="mb-4">Contratos entre módulos</H3>
        <DataTable
          head={["Tipo", "Dirección", "Ejemplo"]}
          rows={[
            [
              <span key="ct-tipo">Comando</span>,
              <span key="ct-dir">app → dominio</span>,
              <code key="ct-ej" className="font-mono text-xs text-foreground/80">
                CreateReservation(input, actor, idem_key)
              </code>,
            ],
            [
              <span key="q-tipo">Query</span>,
              <span key="q-dir">app → dominio</span>,
              <code key="q-ej" className="font-mono text-xs text-foreground/80">
                GetAvailability(location_id, date)
              </code>,
            ],
            [
              <span key="ev-tipo">Evento</span>,
              <span key="ev-dir">dominio → dominio (async)</span>,
              <code key="ev-ej" className="font-mono text-xs text-foreground/80">
                {"ReservationCreated{org_id, loc_id, res_id, customer_id}"}
              </code>,
            ],
            [
              <span key="if-tipo">Interfaz (port)</span>,
              <span key="if-dir">dominio → infra</span>,
              <code key="if-ej" className="font-mono text-xs text-foreground/80">
                WhatsAppSender.send(to, template, vars)
              </code>,
            ],
            [
              <span key="rm-tipo">Read model</span>,
              <span key="rm-dir">dominio → analytics</span>,
              <code key="rm-ej" className="font-mono text-xs text-foreground/80">
                DailyOccupancySnapshot
              </code>,
            ],
          ]}
        />
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-5">
        <GlassCard variant="gold">
          <H3 className="mb-4">Eventos de dominio (catálogo inicial)</H3>
          <GoldList
            items={[
              "ReservationCreated",
              "ReservationUpdated",
              "ReservationCancelled",
              "ReservationCheckedIn",
              "NoShowDetected",
              "TableOccupied",
              "TableReleased",
              "CustomerCreated",
              "CustomerTagged",
              "ReviewReceived",
              "ReviewReplied",
              "MessageDelivered",
              "MessageFailed",
              "AutomationTriggered",
              "SubscriptionActivated",
              "SubscriptionCancelled",
              "ImpersonationStarted",
              "ImpersonationEnded",
              "AiRunCompleted",
              "BackupCompleted",
            ]}
          />
        </GlassCard>

        <GlassCard>
          <H3 className="mb-4">Versionado</H3>
          <GoldList
            items={[
              "Paquetes SemVer estricto.",
              "Contratos con schema_version en cada evento.",
              "Migraciones forward-only numeradas.",
              "API pública /v1 explícito.",
              "Prompts de IA versionados (prompt_id + version).",
              "Deprecación con ventana mínima documentada.",
            ]}
          />
        </GlassCard>
      </div>

      <div className="mt-10">
        <Callout kind="ok" title="CI hace valer las reglas">
          <code className="font-mono text-xs rp-gold-text">eslint-plugin-boundaries</code> y{" "}
          <code className="font-mono text-xs rp-gold-text">dependency-cruiser</code> bloquean imports
          prohibidos y dependencias circulares en PR. CI rojo bloquea merge: la frontera entre
          paquetes no es aspiracional, es código que falla el pipeline.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  08 — MODELO MULTI-TENANT                                    */
/* ============================================================ */
const TENANCY_DIAGRAM = `flowchart TB
  O["Organization<br/>(tenant raíz · facturación)"]
  O --> R1["Restaurant"]
  R1 --> L1["Restaurant Location"]
  L1 --> U["Users & Employees<br/>(membresías scoped)"]
  L1 --> RV["Reservations"]
  L1 --> C["Customers (CRM)"]
  L1 --> M["Menus"]
  L1 --> AN["Analytics"]
  O --> R2["Restaurant 2..."]
  U -.puede pertenecer a varias orgs.-> O2["Organization B"]`;

export function Fase1Tenancy() {
  return (
    <Section
      id="f1-tenancy"
      index="08"
      eyebrow="Modelo multi-tenant"
      title="organization es la frontera; el navegador nunca la decide."
      intro="La jerarquía es Organization → Restaurant → Restaurant Location → (users, reservations, customers, menus, analytics). La organización es la unidad facturable, la raíz de aislamiento y el prefijo de toda clave de caché. El tenant se resuelve siempre en el servidor a partir de la sesión; lo que envíe el cliente se ignora y se re-resuelve."
    >
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div>
          <H3 className="mb-4">Jerarquía de tenancy</H3>
          <Lead>
            Una organización agrupa uno o más restaurantes; cada restaurante puede operar varios
            locales (locations). Los usuarios, reservas, clientes y menús cuelgan del location, pero
            el aislamiento de seguridad está anclado en <code className="font-mono rp-gold-text">organization_id</code>.
            Un usuario puede pertenecer a varias organizaciones: la membresía es una tabla aparte y
            el selector de org activa vive en la sesión del servidor.
          </Lead>
        </div>
        <Mermaid chart={TENANCY_DIAGRAM} />
      </div>

      <div className="mt-10">
        <H3 className="mb-4">Aislamiento multi-tenant</H3>
        <DataTable
          head={["Mecanismo", "Implementación", "Riesgo"]}
          rows={[
            [
              <span key="m1">Tenant raíz</span>,
              <span key="m1-imp">
                <code className="font-mono text-xs rp-gold-text">organization_id NOT NULL</code> en
                toda tabla tenant.
              </span>,
              <Tag key="m1-risk" kind="Imprescindible">crítico si falla</Tag>,
            ],
            [
              <span key="m2">Resolución de tenant</span>,
              <span key="m2-imp">
                servidor: sesión válida → org activa → shard → membership.
              </span>,
              <Tag key="m2-risk" kind="Importante">alto</Tag>,
            ],
            [
              <span key="m3">organization_id del cliente</span>,
              <span key="m3-imp">
                NUNCA autoridad; se ignora y se re-resuelve desde la sesión.
              </span>,
              <Tag key="m3-risk" kind="Imprescindible">crítico</Tag>,
            ],
            [
              <span key="m4">Middleware obligatorio</span>,
              <span key="m4-imp">
                todo request pasa por <code className="font-mono text-xs rp-gold-text">TenantResolver</code> antes del dominio.
              </span>,
              <Tag key="m4-risk" kind="Importante">alto</Tag>,
            ],
            [
              <span key="m5">Repositorios</span>,
              <span key="m5-imp">exigen org_id; queries siempre filtradas por tenant.</span>,
              <Tag key="m5-risk" kind="Imprescindible">crítico</Tag>,
            ],
            [
              <span key="m6">Constraints</span>,
              <span key="m6-imp">PK compuestas (org_id, id); FK con org_id.</span>,
              <Tag key="m6-risk" kind="Importante">alto</Tag>,
            ],
            [
              <span key="m7">Prevención IDOR</span>,
              <span key="m7-imp">ownership del recurso verificado antes de mutar.</span>,
              <Tag key="m7-risk" kind="Imprescindible">crítico</Tag>,
            ],
            [
              <span key="m8">Caché</span>,
              <span key="m8-imp">keys con prefijo org_id; invalidación por tenant.</span>,
              <Tag key="m8-risk">medio</Tag>,
            ],
            [
              <span key="m9">Usuarios multi-org</span>,
              <span key="m9-imp">membership table; selector de org activa en sesión.</span>,
              <Tag key="m9-risk">medio</Tag>,
            ],
            [
              <span key="m10">Roles</span>,
              <span key="m10-imp">scoped por org/restaurant/location.</span>,
              <Tag key="m10-risk" kind="Importante">alto</Tag>,
            ],
            [
              <span key="m11">Auditoría</span>,
              <span key="m11-imp">todo acceso privilegiado e impersonación registrada.</span>,
              <Tag key="m11-risk" kind="Importante">alto</Tag>,
            ],
          ]}
        />
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-5">
        <GlassCard variant="gold">
          <H3 className="mb-4">Pruebas automáticas anti-fuga</H3>
          <GoldList
            items={[
              "Test de aislamiento: usuario de org A no puede leer/escribir recurso de org B (negativo, obligatorio en CI).",
              "Test IDOR por endpoint crítico.",
              "Test de cache poisoning: mutar org A no afecta cache de org B.",
              "Test webhook falsificado: firma inválida rechazada.",
              "Fuzzer de tenant en staging.",
            ]}
          />
        </GlassCard>

        <div className="self-stretch">
          <Callout kind="warn" title="D1 sin RLS nativa">
            SQLite/D1 <strong>no tiene</strong> Row-Level Security como PostgreSQL. El aislamiento es
            de aplicación: <strong>Tenant Enforcement Layer</strong> en repositorios + constraints
            compuestos + tests IDOR obligatorios. <strong>NO simular RLS</strong>: las PK compuestas{" "}
            <code className="font-mono text-xs rp-gold-text">(organization_id, id)</code> son el
            respaldo físico, pero la garantía operativa la da la capa de aplicación verificada por CI.
          </Callout>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  09 — MODELO ER                                              */
/* ============================================================ */
const ER_DIAGRAM = `erDiagram
  organizations ||--o{ restaurants : owns
  organizations ||--o{ organization_members : has
  restaurants ||--o{ restaurant_locations : operates
  restaurant_locations ||--o{ floors : contains
  floors ||--o{ zones : has
  zones ||--o{ tables : has
  restaurant_locations ||--o{ reservations : receives
  customers ||--o{ reservations : makes
  reservations ||--o{ reservation_history : tracks
  customers ||--o{ customer_preferences : has
  customers ||--o{ customer_tags : tagged
  users ||--o{ organization_members : is
  roles ||--o{ role_permissions : grants
  organizations ||--|| subscriptions : billed
  subscriptions }o--|| subscription_plans : on
  restaurant_locations ||--o{ menus : offers
  menus ||--o{ menu_items : has
  organizations ||--o{ ai_requests : consumes
  organizations ||--o{ audit_logs : records`;

export function Fase1ER() {
  return (
    <Section
      id="f1-er"
      index="09"
      eyebrow="Modelo ER"
      title="Modelo normalizado sin sobre-normalizar consultas críticas."
      intro="El modelo sigue 3FN para la mayoría de entidades, pero desnormaliza de forma intencional aquellas consultas que definen la experiencia operativa (disponibilidad, ocupación de mesa, snapshots analíticos). Las FK compuestas refuerzan el aislamiento multi-tenant a nivel físico."
    >
      <H3 className="mb-4">Diagrama entidad-relación (núcleo)</H3>
      <Mermaid chart={ER_DIAGRAM} />

      <div className="mt-10">
        <H3 className="mb-4">Convenciones de modelo</H3>
        <DataTable
          head={["Convención", "Regla"]}
          rows={[
            [
              <span key="c-id">IDs</span>,
              <span key="c-id-r">ULID opaco (TEXT), no autoincrement exponible.</span>,
            ],
            [
              <span key="c-ts">Timestamps</span>,
              <span key="c-ts-r">UTC ISO-8601; IANA tz por org y location.</span>,
            ],
            [
              <span key="c-mon">Dinero</span>,
              <span key="c-mon-r">
                <code className="font-mono text-xs rp-gold-text">INTEGER</code> minor units + ISO 4217.
              </span>,
            ],
            [
              <span key="c-ten">Tenancy</span>,
              <span key="c-ten-r">
                <code className="font-mono text-xs rp-gold-text">organization_id NOT NULL</code> +{" "}
                <code className="font-mono text-xs rp-gold-text">location_id</code> cuando aplique.
              </span>,
            ],
            [
              <span key="c-sd">Soft delete</span>,
              <span key="c-sd-r">
                <code className="font-mono text-xs rp-gold-text">deleted_at NULL</code> por defecto;
                solo con justificación.
              </span>,
            ],
            [
              <span key="c-au">Auditoría</span>,
              <span key="c-au-r">
                <code className="font-mono text-xs rp-gold-text">created_at, updated_at, created_by, updated_by</code>.
              </span>,
            ],
            [
              <span key="c-ev">Eventos</span>,
              <span key="c-ev-r">append-only en outbox; no se mutan.</span>,
            ],
            [
              <span key="c-pii">PII</span>,
              <span key="c-pii-r">clasificada, minimizada, redactada en logs.</span>,
            ],
            [
              <span key="c-idx">Índices</span>,
              <span key="c-idx-r">por consultas reales; compuestos (org_id, ...).</span>,
            ],
          ]}
        />
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  10 — DICCIONARIO DE DATOS                                   */
/* ============================================================ */
type DictRow = [
  tabla: string,
  proposito: string,
  pkidx: string,
  tenant: string,
  sensible: string,
  volumen: string,
];

const DICT_GROUPS: Array<{ group: string; rows: DictRow[] }> = [
  {
    group: "Plataforma · Billing",
    rows: [
      ["organizations", "Tenant raíz; facturación, plan, celda.", "PK(id) · idx(slug)", "global", "no", "bajo"],
      ["organization_settings", "Configuración por organización (JSON).", "PK(org_id)", "global", "no", "bajo"],
      ["subscriptions", "Suscripción activa de la organización.", "PK(id) · idx(org_id)", "global", "no", "bajo"],
      ["subscription_plans", "Catálogo de planes disponibles.", "PK(id) · idx(code)", "global", "no", "bajo"],
      ["invoices", "Facturas emitidas por suscripción.", "PK(id) · idx(org_id,issued_at)", "global", "no", "medio"],
    ],
  },
  {
    group: "Identidad",
    rows: [
      ["users", "Identidad global (email, MFA, passkeys).", "PK(id) · idx(email)", "global", "PII alta", "medio"],
      ["user_profiles", "Perfil (display, avatar, locale, tz).", "PK(user_id)", "global", "PII media", "medio"],
      ["organization_members", "Membresía usuario↔org.", "PK(id) · idx(org_id) · idx(user_id) · uniq(org,user)", "global", "PII media", "medio"],
      ["roles", "Roles scoped (org/restaurant/location).", "PK(id) · idx(org_id,scope)", "org", "no", "bajo"],
      ["permissions", "Catálogo de permisos (código único).", "PK(id) · idx(code)", "global", "no", "bajo"],
      ["role_permissions", "Grant rol↔permiso.", "PK(role_id,perm_id)", "org", "no", "bajo"],
      ["member_roles", "Asignación member↔rol.", "PK(member_id,role_id)", "org", "no", "bajo"],
      ["sessions", "Sesiones y refresh tokens.", "PK(id) · idx(user_id,expires_at)", "global", "PII media", "alto (por servicio)"],
      ["audit_logs", "Trazas de acceso e impersonación.", "PK(id) · idx(org_id,created_at)", "global", "PII media", "muy alto (eventos)"],
    ],
  },
  {
    group: "Restaurantes",
    rows: [
      ["restaurants", "Unidad de marca dentro de la org.", "PK(org_id,id) · idx(org_id)", "org", "no", "bajo"],
      ["restaurant_locations", "Local físico (tz, dirección, geo).", "PK(org_id,id) · idx(org_id,restaurant_id)", "org+loc", "PII media", "bajo"],
      ["floors", "Plantillas de sala dentro del local.", "PK(org_id,id) · idx(org_id,location_id)", "org+loc", "no", "bajo"],
      ["zones", "Zonas dentro de una planta.", "PK(org_id,id) · idx(org_id,floor_id)", "org+loc", "no", "bajo"],
      ["tables", "Mesas físicas (código, capacidad, estado).", "PK(org_id,id) · idx(org_id,zone_id,status)", "org+loc", "no", "bajo"],
      ["table_groups", "Agrupaciones de mesas (eventos).", "PK(org_id,id) · idx(org_id,location_id)", "org+loc", "no", "bajo"],
    ],
  },
  {
    group: "Reservas",
    rows: [
      ["reservations", "Reserva (estado, party_size, source).", "PK(org_id,id) · idx(org_id,loc_id,status) · uniq(org,idem_key)", "org+loc", "PII media", "alto (por servicio)"],
      ["reservation_history", "Historial append-only de cambios.", "PK(org_id,id) · idx(org_id,res_id,created_at)", "org+loc", "no", "muy alto (eventos)"],
      ["waitlist", "Lista de espera sin mesa asignada.", "PK(org_id,id) · idx(org_id,loc_id,status)", "org+loc", "PII media", "medio"],
      ["reservation_tags", "Etiquetas aplicables a reservas.", "PK(org_id,id) · uniq(org_id,name)", "org", "no", "bajo"],
      ["reservation_notes", "Notas internas/visibles por reserva.", "PK(org_id,id) · idx(org_id,res_id)", "org+loc", "PII media", "medio"],
    ],
  },
  {
    group: "CRM",
    rows: [
      ["customers", "Cliente (email, phone, vip, tags).", "PK(org_id,id) · idx(org_id,email) · idx(org_id,phone)", "org", "PII alta", "alto (por servicio)"],
      ["customer_visits", "Visit histórico (mesa, gasto, fecha).", "PK(org_id,id) · idx(org_id,customer_id)", "org", "PII media", "muy alto (eventos)"],
      ["customer_preferences", "Prefs clave-valor por cliente.", "PK(org_id,id) · uniq(org_id,cust_id,key)", "org", "PII media", "medio"],
      ["customer_tags", "Catálogo de tags de cliente.", "PK(org_id,id) · uniq(org_id,name)", "org", "no", "bajo"],
      ["customer_notes", "Notas internas sobre cliente.", "PK(org_id,id) · idx(org_id,customer_id)", "org", "PII alta", "medio"],
      ["customer_allergies", "Alergias y restricciones.", "PK(org_id,id) · idx(org_id,customer_id)", "org", "PII alta", "bajo"],
    ],
  },
  {
    group: "Carta",
    rows: [
      ["menus", "Cartas (almuerzo, cena, eventos).", "PK(org_id,id) · idx(org_id,location_id)", "org+loc", "no", "bajo"],
      ["categories", "Categorías dentro de la carta.", "PK(org_id,id) · idx(org_id,menu_id)", "org+loc", "no", "bajo"],
      ["menu_items", "Plato/producto con precio (minor units).", "PK(org_id,id) · idx(org_id,location_id,active)", "org+loc", "no", "bajo"],
      ["modifier_groups", "Grupos de modificadores.", "PK(org_id,id) · idx(org_id,menu_item_id)", "org+loc", "no", "bajo"],
      ["modifiers", "Opciones con delta de precio.", "PK(org_id,id) · idx(org_id,group_id)", "org+loc", "no", "bajo"],
    ],
  },
  {
    group: "Personal",
    rows: [
      ["employees", "Empleado (vinculado a user opcional).", "PK(org_id,id) · idx(org_id,location_id)", "org+loc", "PII alta", "medio"],
      ["schedules", "Plantilla semanal de turnos.", "PK(org_id,id) · idx(org_id,location_id)", "org+loc", "no", "bajo"],
      ["attendance", "Fichaje real (entrada/salida).", "PK(org_id,id) · idx(org_id,employee_id,date)", "org+loc", "PII media", "alto (por servicio)"],
      ["shifts", "Turno concreto asignado a empleado.", "PK(org_id,id) · idx(org_id,location_id,starts_at)", "org+loc", "no", "medio"],
    ],
  },
  {
    group: "Analítica",
    rows: [
      ["analytics_events", "Evento crudo operacional.", "PK(org_id,id) · idx(org_id,created_at)", "org", "no", "muy alto (eventos)"],
      ["analytics_daily", "Snapshot diario por location.", "PK(org_id,loc_id,date)", "org+loc", "no", "alto (por servicio)"],
      ["analytics_monthly", "Agregado mensual.", "PK(org_id,loc_id,month)", "org+loc", "no", "medio"],
      ["analytics_yearly", "Agregado anual.", "PK(org_id,loc_id,year)", "org+loc", "no", "bajo"],
    ],
  },
  {
    group: "IA",
    rows: [
      ["ai_requests", "Petición IA (prompt_id, version, cost).", "PK(org_id,id) · idx(org_id,created_at)", "org", "PII media", "alto (por servicio)"],
      ["ai_predictions", "Predicción persistida (no-show, etc).", "PK(org_id,id) · idx(org_id,target_type,target_id)", "org", "no", "medio"],
      ["ai_logs", "Trazas de ejecución IA (redactadas).", "PK(org_id,id) · idx(org_id,created_at)", "org", "PII media", "muy alto (eventos)"],
    ],
  },
  {
    group: "Marketing",
    rows: [
      ["campaigns", "Campaña (canal, audiencia, ventana).", "PK(org_id,id) · idx(org_id,status)", "org", "no", "bajo"],
      ["automations", "Regla trigger→acción (journey).", "PK(org_id,id) · idx(org_id,status)", "org", "no", "bajo"],
      ["templates", "Plantillas (email, WA, SMS).", "PK(org_id,id) · idx(org_id,channel)", "org", "no", "bajo"],
    ],
  },
  {
    group: "Reputación",
    rows: [
      ["google_reviews", "Reseña sincronizada de Google.", "PK(org_id,id) · idx(org_id,location_id)", "org+loc", "PII media", "medio"],
      ["public_reviews", "Reseña de otras fuentes.", "PK(org_id,id) · idx(org_id,location_id)", "org+loc", "PII media", "medio"],
      ["review_replies", "Respuesta (manual o IA).", "PK(org_id,id) · idx(org_id,review_id)", "org+loc", "no", "bajo"],
    ],
  },
  {
    group: "Mensajería",
    rows: [
      ["conversations", "Hilo de conversación por canal.", "PK(org_id,id) · idx(org_id,location_id)", "org+loc", "PII media", "alto (por servicio)"],
      ["conversation_participants", "Participantes (cliente, staff).", "PK(org_id,id) · idx(org_id,conv_id)", "org+loc", "PII media", "alto (por servicio)"],
      ["messages", "Mensaje individual (in/out, status).", "PK(org_id,id) · idx(org_id,conv_id,created_at)", "org+loc", "PII media", "muy alto (eventos)"],
      ["message_templates", "Plantillas pre-aprobadas (WA).", "PK(org_id,id) · idx(org_id,channel)", "org", "no", "bajo"],
    ],
  },
  {
    group: "Notificaciones",
    rows: [
      ["notifications", "Notificación a usuario (canal, estado).", "PK(org_id,id) · idx(org_id,user_id,status)", "org", "PII media", "alto (por servicio)"],
      ["notification_logs", "Log de entrega por canal.", "PK(org_id,id) · idx(org_id,notif_id)", "org", "no", "muy alto (eventos)"],
    ],
  },
  {
    group: "Integraciones",
    rows: [
      ["feature_flags", "Flags globales y rollout por org.", "PK(id) · idx(key)", "global", "no", "bajo"],
      ["webhooks", "Endpoint registrado por la org.", "PK(org_id,id) · idx(org_id)", "org", "no", "bajo"],
      ["webhook_deliveries", "Intento de entrega (attempts, retry).", "PK(org_id,id) · idx(org_id,status,next_retry_at)", "org", "PII media", "alto (por servicio)"],
      ["integrations", "Conector externo (POS, calendar, etc).", "PK(org_id,id) · idx(org_id,provider)", "org", "PII media", "bajo"],
      ["api_keys", "Claves API públicas de la org (hashed).", "PK(org_id,id) · idx(org_id)", "org", "secreto", "bajo"],
    ],
  },
];

export function Fase1Diccionario() {
  return (
    <Section
      id="f1-diccionario"
      index="10"
      eyebrow="Diccionario de datos"
      title="Propósito, columnas, claves, índices y volumen por tabla."
      intro="Diccionario inicial de las tablas, agrupadas por dominio. Cada tabla declara propósito, PK / índices, scope de tenant, sensibilidad PII y volumen estimado. Es la fuente de verdad que alimenta el modelo ER, las migraciones y los tests de aislamiento."
    >
      {DICT_GROUPS.map((g) => (
        <div key={g.group} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-6 bg-gradient-to-r from-[var(--gold)]/60 to-transparent" />
            <H3>{g.group}</H3>
          </div>
          <DataTable
            head={["Tabla", "Propósito", "PK / Índices", "Tenant", "Sensible", "Volumen"]}
            rows={g.rows.map((r) => [
              <Mono key="t">{r[0]}</Mono>,
              <span key="p">{r[1]}</span>,
              <code key="k" className="font-mono text-xs text-foreground/80 whitespace-nowrap">{r[2]}</code>,
              <span key="ten">{r[3]}</span>,
              <span key="s">{r[4]}</span>,
              <span key="v">{r[5]}</span>,
            ])}
          />
        </div>
      ))}

      <div className="mt-8">
        <Callout kind="info" title="Volumen y particionado">
          Las tablas de alto volumen —{" "}
          <code className="font-mono text-xs rp-teal-text">analytics_events</code>,{" "}
          <code className="font-mono text-xs rp-teal-text">audit_logs</code>,{" "}
          <code className="font-mono text-xs rp-teal-text">ai_logs</code>,{" "}
          <code className="font-mono text-xs rp-teal-text">messages</code> — se archivan y
          particionan por periodo a R2 y se shardean por <code className="font-mono text-xs rp-teal-text">org_id</code>.
          La consulta operativa vive en D1; el histórico consultable vive en un read-model derivado.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  11 — SQL INICIAL (D1/SQLite)                                */
/* ============================================================ */
const SQL_SCHEMA = `-- ============================================================
-- RestoPanel · D1/SQLite · Esquema inicial
-- Forward-only migrations · ULID (TEXT) · UTC ISO-8601
-- Money: INTEGER minor units + ISO 4217
-- ============================================================

-- ---------- CONTROL PLANE ----------

CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  default_tz TEXT NOT NULL,
  default_currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  plan_id TEXT,
  cell_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE organization_settings (
  organization_id TEXT PRIMARY KEY,
  settings_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE subscription_plans (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price_minor INTEGER NOT NULL,
  currency TEXT NOT NULL,
  interval TEXT NOT NULL,
  features_json TEXT NOT NULL DEFAULT '{}',
  limits_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL UNIQUE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TEXT NOT NULL,
  current_period_end TEXT NOT NULL,
  cancel_at_period_end INTEGER NOT NULL DEFAULT 0,
  stripe_subscription_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);

CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  subscription_id TEXT NOT NULL,
  amount_minor INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  issued_at TEXT NOT NULL,
  paid_at TEXT,
  stripe_invoice_id TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);
CREATE INDEX idx_invoices_org ON invoices(organization_id, issued_at);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  mfa_enabled INTEGER NOT NULL DEFAULT 0,
  password_hash TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE user_profiles (
  user_id TEXT PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  locale TEXT NOT NULL DEFAULT 'es',
  tz TEXT NOT NULL DEFAULT 'UTC',
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE organization_members (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  invited_at TEXT,
  joined_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (organization_id, user_id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX idx_members_org ON organization_members(organization_id);
CREATE INDEX idx_members_user ON organization_members(user_id);

CREATE TABLE roles (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  scope TEXT NOT NULL,
  scope_id TEXT,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_system INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_roles_org_scope ON roles(organization_id, scope);

CREATE TABLE permissions (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE role_permissions (
  role_id TEXT NOT NULL,
  permission_id TEXT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id)
);

CREATE TABLE member_roles (
  member_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  PRIMARY KEY (member_id, role_id),
  FOREIGN KEY (member_id) REFERENCES organization_members(id),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  organization_id TEXT,
  refresh_token_hash TEXT,
  user_agent TEXT,
  ip TEXT,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);
CREATE INDEX idx_sessions_user ON sessions(user_id, expires_at);

CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  actor_id TEXT,
  actor_type TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  ip TEXT,
  user_agent TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_audit_org_time ON audit_logs(organization_id, created_at);

CREATE TABLE tenant_cells (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  region TEXT NOT NULL,
  d1_database_id TEXT NOT NULL,
  r2_bucket_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE org_shard_routing (
  organization_id TEXT PRIMARY KEY,
  cell_id TEXT NOT NULL,
  shard_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  migrated_at TEXT,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (cell_id) REFERENCES tenant_cells(id)
);

CREATE TABLE feature_flags (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  description TEXT,
  enabled_global INTEGER NOT NULL DEFAULT 0,
  rollout_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- ---------- TENANT TABLES (organization_id NOT NULL) ----------

CREATE TABLE restaurants (
  id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  name TEXT NOT NULL,
  brand_color TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);
CREATE INDEX idx_restaurants_org ON restaurants(organization_id);

CREATE TABLE restaurant_locations (
  id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  restaurant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  timezone TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address_json TEXT,
  latitude REAL,
  longitude REAL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id, restaurant_id) REFERENCES restaurants(organization_id, id)
);
CREATE INDEX idx_locations_restaurant ON restaurant_locations(organization_id, restaurant_id);

CREATE TABLE floors (
  id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  location_id TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id, location_id) REFERENCES restaurant_locations(organization_id, id)
);

CREATE TABLE zones (
  id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  floor_id TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id, floor_id) REFERENCES floors(organization_id, id)
);

CREATE TABLE tables (
  id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  zone_id TEXT NOT NULL,
  code TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  shape TEXT,
  x INTEGER,
  y INTEGER,
  status TEXT NOT NULL DEFAULT 'available',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id, zone_id) REFERENCES zones(organization_id, id)
);
CREATE INDEX idx_tables_zone_status ON tables(organization_id, zone_id, status);
CREATE UNIQUE INDEX idx_tables_code ON tables(organization_id, code);

CREATE TABLE reservations (
  id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  location_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  table_id TEXT,
  status TEXT NOT NULL,
  party_size INTEGER NOT NULL,
  reserved_at TEXT NOT NULL,
  source TEXT,
  idem_key TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id, location_id) REFERENCES restaurant_locations(organization_id, id)
);
CREATE INDEX idx_res_org_loc_status ON reservations(organization_id, location_id, status);
CREATE UNIQUE INDEX idx_res_idem ON reservations(organization_id, idem_key) WHERE idem_key IS NOT NULL;

CREATE TABLE reservation_history (
  id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  reservation_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_id TEXT,
  actor_type TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id, reservation_id) REFERENCES reservations(organization_id, id)
);
CREATE INDEX idx_reshist_res ON reservation_history(organization_id, reservation_id, created_at);

CREATE TABLE customers (
  id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  full_name TEXT,
  locale TEXT,
  tags_json TEXT,
  is_vip INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  deleted_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (organization_id, id)
);
CREATE INDEX idx_customers_org_email ON customers(organization_id, email);
CREATE INDEX idx_customers_org_phone ON customers(organization_id, phone);

CREATE TABLE customer_preferences (
  id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value_json TEXT,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (organization_id, id),
  UNIQUE (organization_id, customer_id, key),
  FOREIGN KEY (organization_id, customer_id) REFERENCES customers(organization_id, id)
);

CREATE TABLE customer_tags (
  id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (organization_id, id),
  UNIQUE (organization_id, name)
);

CREATE TABLE menu_items (
  id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  location_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  price_minor INTEGER NOT NULL,
  currency TEXT NOT NULL,
  category TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (organization_id, id)
);
CREATE INDEX idx_menu_org_loc ON menu_items(organization_id, location_id, is_active);

CREATE TABLE employees (
  id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  location_id TEXT,
  user_id TEXT,
  full_name TEXT NOT NULL,
  role TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  hired_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (organization_id, id)
);
CREATE INDEX idx_employees_org_loc ON employees(organization_id, location_id);

CREATE TABLE shifts (
  id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  location_id TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  role TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id, location_id) REFERENCES restaurant_locations(organization_id, id)
);
CREATE INDEX idx_shifts_org_loc_date ON shifts(organization_id, location_id, starts_at);

CREATE TABLE ai_requests (
  id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  prompt_id TEXT NOT NULL,
  prompt_version INTEGER NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_minor INTEGER,
  status TEXT NOT NULL,
  input_redacted_json TEXT,
  output_redacted_json TEXT,
  latency_ms INTEGER,
  created_at TEXT NOT NULL,
  PRIMARY KEY (organization_id, id)
);
CREATE INDEX idx_ai_org_time ON ai_requests(organization_id, created_at);

CREATE TABLE messages (
  id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  direction TEXT NOT NULL,
  body TEXT,
  status TEXT NOT NULL,
  external_id TEXT,
  created_at TEXT NOT NULL,
  PRIMARY KEY (organization_id, id)
);
CREATE INDEX idx_messages_conv ON messages(organization_id, conversation_id, created_at);

CREATE TABLE notifications (
  id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  user_id TEXT,
  channel TEXT NOT NULL,
  template_id TEXT,
  payload_json TEXT,
  status TEXT NOT NULL,
  scheduled_at TEXT,
  sent_at TEXT,
  created_at TEXT NOT NULL,
  PRIMARY KEY (organization_id, id)
);
CREATE INDEX idx_notif_org_user ON notifications(organization_id, user_id, status);

CREATE TABLE webhook_deliveries (
  id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  webhook_id TEXT NOT NULL,
  url TEXT NOT NULL,
  payload_json TEXT,
  status TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  response_code INTEGER,
  next_retry_at TEXT,
  created_at TEXT NOT NULL,
  PRIMARY KEY (organization_id, id)
);
CREATE INDEX idx_webhook_org_status ON webhook_deliveries(organization_id, status, next_retry_at);

-- ---------- OUTBOX (eventos append-only) ----------

CREATE TABLE events_outbox (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  schema_version INTEGER NOT NULL,
  payload_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  next_retry_at TEXT,
  created_at TEXT NOT NULL,
  delivered_at TEXT
);
CREATE INDEX idx_outbox_status ON events_outbox(status, next_retry_at);
CREATE INDEX idx_outbox_org_type ON events_outbox(organization_id, event_type, created_at);`;

export function Fase1SQL() {
  return (
    <Section
      id="f1-sql"
      index="11"
      eyebrow="SQL inicial (D1)"
      title="Esquema D1/SQLite: claves compuestas, índices y constraints anti cross-tenant."
      intro="Esquema SQL inicial compatible con Cloudflare D1 (dialecto SQLite). Migraciones forward-only. Incluye tablas de plataforma (control plane) y las tablas tenant del núcleo. El patrón es uniforme: PK compuesta (organization_id, id), FK compuestas refuerzan aislamiento, idem_key UNIQUE por org garantiza idempotencia, sin secuencias autoincrement exponibles (se usa ULID generado en la app)."
    >
      <Code lang="sql">{SQL_SCHEMA}</Code>

      <div className="mt-10 grid lg:grid-cols-2 gap-5">
        <GlassCard variant="gold">
          <H3 className="mb-4">Patrones clave del SQL</H3>
          <GoldList
            items={[
              "PK compuesta (organization_id, id) impide físicamente cross-tenant en joins.",
              "FK compuestas refuerzan el aislamiento entre tablas tenant.",
              "idem_key UNIQUE por org → idempotencia de comandos.",
              "Índices compuestos lideran con organization_id.",
              "Soft delete con deleted_at NULL por defecto.",
              "outbox append-only; audit_logs append-only.",
              "Sin secuencias autoincrement exponibles (usar ULID generado en app).",
            ]}
          />
        </GlassCard>

        <div className="self-stretch">
          <Callout kind="warn" title="Sin RLS, sin GENERATED always complejas">
            D1/SQLite tiene límites importantes: <strong>no hay Row-Level Security</strong> (el
            aislamiento es de aplicación con la Tenant Enforcement Layer + PK compuestas). Se evitan
            triggers pesados y columnas GENERATED always complejas. Las columnas JSON se almacenan
            como <code className="font-mono text-xs rp-gold-text">TEXT</code> y se validan con Zod
            en la aplicación antes de escribir.
          </Callout>
        </div>
      </div>
    </Section>
  );
}
