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
/* Helper: monospace dorado inline                              */
/* ============================================================ */
function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-xs rp-gold-text whitespace-nowrap">
      {children}
    </code>
  );
}

/* ============================================================ */
/* 06 — MODELO MULTIEMPRESA                                     */
/* ============================================================ */
const TENANCY_CHART = `flowchart TB
  U["Usuario (cookie sesión)"] --> MW["Tenant Resolver (middleware)"]
  MW --> SES{"Sesión válida?"}
  SES -->|sí| ORG["org_activa desde sesión"]
  SES -->|no| REJ["401"]
  ORG --> MEM{"Membresía vigente?"}
  MEM -->|sí| SHARD["resolver org → shard D1"]
  MEM -->|no| REJ2["403"]
  SHARD --> RBAC["RBAC + ABAC"]
  RBAC --> ENT["Entitlements (plan)"]
  ENT --> UC["Caso de uso de dominio"]
  UC --> REPO["Repositorio con org_id OBLIGATORIO"]
  REPO --> D1[("D1 shard")]`;

type TenancyRow = {
  id: string;
  mecanismo: string;
  impl: string;
  riesgo: "bajo" | "medio" | "alto" | "crítico";
};

const TENANCY_ROWS: TenancyRow[] = [
  {
    id: "tid",
    mecanismo: "Tenant ID obligatorio",
    impl: "organization_id NOT NULL en toda tabla tenant; PK compuesta (org_id, id)",
    riesgo: "crítico",
  },
  {
    id: "srv",
    mecanismo: "Resolución en servidor",
    impl: "sesión → org_activa → shard → membership; org_id del cliente ignorado",
    riesgo: "alto",
  },
  {
    id: "iso",
    mecanismo: "Aislamiento de consultas",
    impl: "repositorios exigen org_id; queries filtradas; sin SELECT * sin scope",
    riesgo: "crítico",
  },
  {
    id: "idor",
    mecanismo: "Prevención de acceso cruzado",
    impl: "ownership del recurso verificado antes de mutar (anti-IDOR)",
    riesgo: "crítico",
  },
  {
    id: "multiorg",
    mecanismo: "Usuarios multi-org",
    impl: "tabla organization_members; selector de org activa en sesión",
    riesgo: "medio",
  },
  {
    id: "multiloc",
    mecanismo: "Multi-location",
    impl: "organization → restaurants → locations; roles scoped por level",
    riesgo: "medio",
  },
  {
    id: "inh",
    mecanismo: "Config heredada",
    impl: "defaults de org sobrescribibles por location; precedencia location > org > platform",
    riesgo: "bajo",
  },
  {
    id: "quota",
    mecanismo: "Cuotas y límites",
    impl: "entitlements por plan; rate limit por org; uso medido",
    riesgo: "medio",
  },
  {
    id: "custom",
    mecanismo: "Personalización",
    impl: "settings por org (tz, currency, locale, branding)",
    riesgo: "bajo",
  },
  {
    id: "exp",
    mecanismo: "Exportación",
    impl: "export cifrada por org; auditable; GDPR",
    riesgo: "medio",
  },
  {
    id: "del",
    mecanismo: "Eliminación",
    impl: "soft delete + anonimización; retención legal; job de purga",
    riesgo: "alto",
  },
  {
    id: "mig",
    mecanismo: "Migraciones",
    impl: "forward-only; por shard; sin downtime",
    riesgo: "medio",
  },
  {
    id: "tests",
    mecanismo: "Tests de aislamiento",
    impl: "negativos cross-tenant + IDOR en CI obligatorios",
    riesgo: "alto",
  },
];

export function Fase2Tenancy() {
  return (
    <Section
      id="f2-tenancy"
      index="06"
      eyebrow="Modelo multiempresa"
      title="organization_id obligatorio; el navegador nunca decide el tenant."
      intro={
        <>
          La estrategia de multi-tenancy descansa sobre una regla no negociable:
          el <span className="text-foreground">tenant se resuelve siempre en el servidor</span> a
          partir de la sesión, nunca se confía en un <code className="font-mono text-[12px] rp-gold-text">org_id</code>{" "}
          enviado por el cliente. Toda tabla de dominio lleva{" "}
          <Mono>(organization_id, id)</Mono> como clave compuesta; los repositorios no
          aceptan consultas sin scope de organización; el acceso cruzado entre
          tenants se previene con verificación de ownership antes de cada
          mutación. El modelo cubre además usuarios multi-org, organizaciones
          multi-location, configuración heredada, cuotas por plan,
          personalización, exportación y eliminación GDPR, migraciones por shard
          y tests automáticos de aislamiento en CI.
        </>
      }
    >
      {/* Diagrama de resolución */}
      <div className="mb-12">
        <H3 className="mb-3">Resolución de tenant, de cookie a D1</H3>
        <Lead className="mb-4">
          El middleware autentica la sesión, recupera la <Mono>org_activa</Mono>,
          valida la membresía, resuelve el shard D1 correspondiente y aplica RBAC
          + ABAC y entitlements del plan antes de despachar el caso de uso. El
          repositorio sólo entonces ejecuta contra D1, siempre filtrando por{" "}
          <Mono>organization_id</Mono>.
        </Lead>
        <Mermaid chart={TENANCY_CHART} />
      </div>

      {/* Estrategia de aislamiento */}
      <div className="mb-12">
        <H3 className="mb-3">Estrategia de aislamiento</H3>
        <Lead className="mb-4">
          Cada mecanismo está respaldado por constraints compuestos en D1 y por
          tests negativos en CI. Los marcados como <span className="text-foreground">crítico</span>{" "}
          bloquean el merge si fallan.
        </Lead>
        <DataTable
          head={["Mecanismo", "Implementación", "Riesgo"]}
          rows={TENANCY_ROWS.map((r) => [
            <span key={`mec-${r.id}-name`} className="font-medium text-foreground">
              {r.mecanismo}
            </span>,
            <span key={`mec-${r.id}-impl`} className="text-foreground/80">
              {r.impl}
            </span>,
            <Risk key={`mec-${r.id}-risk`} level={r.riesgo} />,
          ])}
        />
      </div>

      {/* Tests automáticos */}
      <div className="mb-12">
        <GlassCard variant="gold">
          <H3>Tests automáticos de aislamiento</H3>
          <Lead className="mt-2">
            El aislamiento no se declara, se demuestra. Estas pruebas viven en
            CI y deben pasar en cada PR; un rojo bloquea el merge.
          </Lead>
          <div className="mt-5">
            <GoldList
              items={[
                <span key="t-404">
                  Por cada endpoint tenant: usuario de org A recibe{" "}
                  <span className="text-foreground">404/403</span> al pedir
                  recurso de org B.
                </span>,
                <span key="t-mut">
                  Test de mutación cross-tenant: ningún payload altera datos de
                  otra organización.
                </span>,
                <span key="t-cache">
                  Test de cache poisoning: mutar A no afecta cache de B; las
                  claves incluyen <Mono>organization_id</Mono>.
                </span>,
                <span key="t-fuzz">
                  Fuzzer de tenant en staging: intercambio masivo de IDs para
                  descubrir fugas no previstas.
                </span>,
                <span key="t-ci">
                  CI rojo bloquea merge; sin override salvo bypass manual
                  auditado y revertible, nunca como parte del flujo normal.
                </span>,
              ]}
            />
          </div>
        </GlassCard>
      </div>

      {/* Callout RLS */}
      <Callout kind="warn" title="Sin RLS nativa">
        D1/SQLite no tiene Row-Level Security nativa. El aislamiento es
        estrictamente de <span className="text-foreground">aplicación</span>:
        Tenant Enforcement Layer + constraints compuestos <Mono>(org_id, id)</Mono>{" "}
        + tests IDOR obligatorios en CI. No se simula RLS con triggers ni con
        vistas que eluden el scope; el filtro por <Mono>organization_id</Mono>{" "}
        se exige en el repositorio y se verifica con tests negativos.
      </Callout>
    </Section>
  );
}

/* ============================================================ */
/* 07 — SISTEMA DE EVENTOS                                      */
/* ============================================================ */
const EVENT_PIPELINE_CHART = `flowchart LR
  UC["Caso de uso"] --> TX["Transacción D1<br/>estado + outbox"]
  TX --> DB[("D1")]
  DB --> DSP["Dispatcher idempotente"]
  DSP --> Q["Cloudflare Queue"]
  Q --> C1["comms"]
  Q --> C2["audit"]
  Q --> C3["analytics"]
  Q --> C4["integrations"]
  Q --> C5["automation"]
  C4 --> WH["Webhook saliente (HMAC)"]
  Q -.fallo.-> DLQ["Dead Letter Queue"]
  DLQ --> REP["Reproceso manual auditado"]`;

const EVENT_ENVELOPE = `{
  "event_id": "01HZX...ULID",
  "event_type": "ReservationCreated",
  "event_kind": "domain",
  "event_version": 1,
  "occurred_at": "2025-01-21T19:32:01Z",
  "organization_id": "01HZORG...",
  "location_id": "01HZLOC...",
  "actor_id": "01HZUSR...",
  "actor_effective_id": null,
  "correlation_id": "req_01HZ...",
  "causation_id": null,
  "source": "reservations",
  "payload": { "reservation_id": "01HZRES...", "party_size": 4 },
  "pii_redacted": true
}`;

type MensajeRow = {
  id: string;
  tipo: string;
  proposito: string;
  direccion: string;
  ejemplo: string;
};

const MENSAJE_ROWS: MensajeRow[] = [
  {
    id: "domain",
    tipo: "Evento de dominio",
    proposito: "algo pasó en el dominio",
    direccion: "async, pub/sub",
    ejemplo: "ReservationCreated",
  },
  {
    id: "integration",
    tipo: "Evento de integración",
    proposito: "notificar a sistema externo",
    direccion: "async, hacia afuera",
    ejemplo: "WebhookDelivered",
  },
  {
    id: "command",
    tipo: "Comando",
    proposito: "petición de mutación",
    direccion: "síncrono o async",
    ejemplo: "CreateReservation(input, actor, idem_key)",
  },
  {
    id: "query",
    tipo: "Query",
    proposito: "lectura inmutable",
    direccion: "síncrono",
    ejemplo: "GetAvailability(loc_id, date)",
  },
  {
    id: "task",
    tipo: "Tarea asíncrona",
    proposito: "trabajo pesado programado",
    direccion: "async, queue",
    ejemplo: "GenerateDailySummary",
  },
];

type CatalogoRow = {
  id: string;
  evento: string;
  dominio: string;
  consumidores: string;
};

const CATALOGO_ROWS: CatalogoRow[] = [
  { id: "rescreated", evento: "ReservationCreated", dominio: "Reservations", consumidores: "Notifications, Analytics, Marketing, CRM" },
  { id: "resconf", evento: "ReservationConfirmed", dominio: "Reservations", consumidores: "Notifications, Analytics" },
  { id: "rescanc", evento: "ReservationCancelled", dominio: "Reservations", consumidores: "Notifications, Analytics, CRM(no-show)" },
  { id: "rescheckin", evento: "ReservationCheckedIn", dominio: "Reservations", consumidores: "Analytics, Tables" },
  { id: "noshow", evento: "NoShowDetected", dominio: "Reservations", consumidores: "CRM(risk), Marketing, Analytics" },
  { id: "custcreated", evento: "CustomerCreated", dominio: "CRM", consumidores: "Analytics, Marketing" },
  { id: "custvisit", evento: "CustomerVisited", dominio: "CRM", consumidores: "Analytics, Marketing, AI(VIP)" },
  { id: "custtag", evento: "CustomerTagged", dominio: "CRM", consumidores: "Marketing, AI" },
  { id: "reviewrecv", evento: "ReviewReceived", dominio: "Reviews", consumidores: "AI, Notifications, Marketing" },
  { id: "reviewrep", evento: "ReviewReplied", dominio: "Reviews", consumidores: "Analytics" },
  { id: "subrenew", evento: "SubscriptionRenewed", dominio: "Billing", consumidores: "Analytics, Super Admin" },
  { id: "paysuc", evento: "PaymentSucceeded", dominio: "Billing", consumidores: "Billing(invoice), Notifications" },
  { id: "tablemoved", evento: "TableMoved", dominio: "Tables", consumidores: "Realtime, Analytics" },
  { id: "empcheckin", evento: "EmployeeCheckedIn", dominio: "Staff", consumidores: "Analytics, Payroll(integration)" },
  { id: "airun", evento: "AiRunCompleted", dominio: "AI", consumidores: "Audit, Analytics(cost)" },
];

export function Fase2Eventos() {
  return (
    <Section
      id="f2-eventos"
      index="07"
      eyebrow="Sistema de eventos"
      title="Eventos de dominio vs integración; outbox transaccional; consumidores idempotentes."
      intro={
        <>
          Cada acción relevante publica un evento de dominio o de integración.
          Se distingue con claridad entre <span className="text-foreground">evento de dominio</span>{" "}
          (algo ya pasó, inmutable, async pub/sub),{" "}
          <span className="text-foreground">evento de integración</span>{" "}
          (notifica al exterior), <span className="text-foreground">comando</span>{" "}
          (petición de mutación con <Mono>idem_key</Mono>),{" "}
          <span className="text-foreground">query</span> (lectura síncrona
          inmutable) y <span className="text-foreground">tarea asíncrona</span>{" "}
          (trabajo pesado encolado). El outbox transaccional garantiza
          atomicidad: estado y evento se escriben juntos en D1; el dispatcher
          publica a Cloudflare Queues; los consumidores procesan de forma
          idempotente.
        </>
      }
    >
      {/* Tipos de mensajes */}
      <div className="mb-12">
        <H3 className="mb-3">Tipos de mensajes</H3>
        <Lead className="mb-4">
          Confundir comando con evento, o evento de dominio con evento de
          integración, es la causa nº 1 de acoplamiento accidental. La taxonomía
          es obligatoria en contratos Zod y en naming.
        </Lead>
        <DataTable
          head={["Tipo", "Propósito", "Dirección", "Ejemplo"]}
          rows={MENSAJE_ROWS.map((r) => [
            <span key={`tipo-${r.id}-t`} className="font-mono text-[13px] rp-gold-text">
              {r.tipo}
            </span>,
            <span key={`tipo-${r.id}-p`} className="text-foreground/80">
              {r.proposito}
            </span>,
            <span key={`tipo-${r.id}-d`} className="text-muted-foreground">
              {r.direccion}
            </span>,
            <span key={`tipo-${r.id}-e`} className="font-mono text-[12px] text-foreground/90">
              {r.ejemplo}
            </span>,
          ])}
        />
      </div>

      {/* Envelope canónico */}
      <div className="mb-12">
        <H3 className="mb-3">Envelope canónico de evento</H3>
        <Lead className="mb-4">
          Toda salida del outbox usa esta forma. <Mono>event_kind</Mono>{" "}
          distingue <span className="text-foreground">domain</span> de{" "}
          <span className="text-foreground">integration</span>;{" "}
          <Mono>actor_effective_id</Mono> cubre impersonación;{" "}
          <Mono>correlation_id</Mono> viaja end-to-end hasta los webhooks
          salientes; <Mono>causation_id</Mono> distingue causación de
          correlación; <Mono>pii_redacted</Mono> garantiza que el payload sólo
          expone PII por allowlist explícita.
        </Lead>
        <Code lang="json">{EVENT_ENVELOPE}</Code>
      </div>

      {/* Catálogo inicial de eventos */}
      <div className="mb-12">
        <H3 className="mb-3">Catálogo inicial de eventos</H3>
        <Lead className="mb-4">
          No es una lista cerrada: cada dominio puede proponer eventos nuevos
          mediante ADR. La regla es <span className="text-foreground">publicar
          lo mínimo estable</span>: un evento publicado es un contrato y romperlo
          cuesta caro.
        </Lead>
        <DataTable
          head={["Evento", "Dominio emisor", "Consumidores"]}
          rows={CATALOGO_ROWS.map((r) => [
            <span key={`cat-${r.id}-e`} className="font-mono text-[13px] rp-gold-text">
              {r.evento}
            </span>,
            <span key={`cat-${r.id}-d`} className="text-foreground/80">
              {r.dominio}
            </span>,
            <span key={`cat-${r.id}-c`} className="text-muted-foreground">
              {r.consumidores}
            </span>,
          ])}
        />
      </div>

      {/* Diagrama del pipeline */}
      <div className="mb-12">
        <H3 className="mb-3">Pipeline de eventos con outbox</H3>
        <Lead className="mb-4">
          El caso de uso escribe estado + outbox en la misma transacción D1. El
          dispatcher lee, publica a Queues y marca como publicado. Cada cola
          tiene un consumidor especializado; los fallos persistentes caen al DLQ
          para reproceso manual auditado.
        </Lead>
        <Mermaid chart={EVENT_PIPELINE_CHART} />
      </div>

      {/* Garantías del sistema */}
      <div className="mb-12">
        <GlassCard variant="gold">
          <H3>Garantías del sistema de eventos</H3>
          <Lead className="mt-2">
            Estas garantías son requisitos de Definition of Done para cualquier
            consumidor nuevo. La entrega es <span className="text-foreground">at-least-once</span>;
            la idempotencia final es responsabilidad del consumidor.
          </Lead>
          <div className="mt-5">
            <GoldList
              items={[
                <span key="g-idem">
                  Idempotencia por <Mono>event_id</Mono> + dedup en consumidor
                  (tabla <Mono>processed_events</Mono>).
                </span>,
                <span key="g-dupes">
                  Tolerancia a duplicados y a entregas fuera de orden;
                  reconciliación por <Mono>occurred_at</Mono>.
                </span>,
                <span key="g-backoff">
                  Backoff exponencial con jitter en reintentos.
                </span>,
                <span key="g-max">
                  <Mono>max_attempts</Mono> → DLQ; nunca retry infinito.
                </span>,
                <span key="g-breaker">
                  Circuit breaker por consumidor y por dependencia externa.
                </span>,
                <span key="g-replay">
                  Reproceso manual auditado desde DLQ, con idempotencia
                  preservada.
                </span>,
                <span key="g-ret">
                  Retención por tipo: eventos 30–90 días en D1, audit 1 año+ en
                  R2.
                </span>,
                <span key="g-trace">
                  Observabilidad con <Mono>correlation_id</Mono> end-to-end
                  (request → caso de uso → outbox → queue → consumidor → webhook).
                </span>,
                <span key="g-pii">
                  PII redactada por allowlist; el payload nunca incluye datos
                  sensibles sin marcado explícito.
                </span>,
                <span key="g-ord">
                  Orden solo cuando el dominio lo exija: partition key ={" "}
                  <Mono>org_id + aggregate_id</Mono>, nunca global.
                </span>,
              ]}
            />
          </div>
        </GlassCard>
      </div>

      {/* Callout atomicidad */}
      <Callout kind="ok" title="Outbox = atomicidad">
        El outbox se escribe en la <span className="text-foreground">misma
        transacción D1</span> que el estado de negocio; el dispatcher lee,
        publica y marca como publicado. Garantiza entrega{" "}
        <span className="text-foreground">at-least-once</span> sin{" "}
        <span className="text-foreground">double-write inconsistency</span>: no
        existe estado sin evento ni evento sin estado. La idempotencia final la
        garantiza el consumidor con <Mono>event_id</Mono> en su tabla de
        deduplicación.
      </Callout>
    </Section>
  );
}

/* ============================================================ */
/* 08 — MOTOR DE AUTOMATIZACIONES                               */
/* ============================================================ */
const AUTOMATION_CHART = `flowchart TB
  EVT["Evento de dominio"] --> MATCH["Matching de reglas (org/loc/trigger)"]
  MATCH --> COND{"Evaluar condiciones"}
  COND -->|true| IDEN["Generar execution_id (idempotencia)"]
  COND -->|false| SKIP["No-op"]
  IDEN --> SENS{"Acción sensible?"}
  SENS -->|no| EXEC["Ejecutar acción"]
  SENS -->|sí| APPROV["Cola de aprobación humana"]
  APPROV -->|aprobada| EXEC
  APPROV -->|rechazada| LOG2["Log + notificar"]
  EXEC --> ANTI{"Anti-bucle?"}
  ANTI -->|ok| RES["Resultado + log"]
  ANTI -->|loop| ABORT["Abortar + alerta"]
  RES --> HIST["Historial de ejecuciones"]
  EXEC -.fallo.-> RETRY["Reintentar con backoff"]
  RETRY -.max.-> DLQ["Dead Letter"]`;

type ComponenteRow = {
  id: string;
  componente: string;
  descripcion: string;
  notas: string;
};

const COMPONENTE_ROWS: ComponenteRow[] = [
  { id: "trig", componente: "Trigger", descripcion: "evento de dominio, horario, condición de datos", notas: "por org/location" },
  { id: "cond", componente: "Condición", descripcion: "simple (campo op valor) o compuesta (AND/OR/NOT)", notas: "variables dinámicas" },
  { id: "act", componente: "Acción", descripcion: "síncrona (tag, nota) o asíncrona (envío, campaña, IA)", notas: "con delay opcional" },
  { id: "tpl", componente: "Plantilla", descripcion: "receta reutilizable por rubro", notas: "parametrizable" },
  { id: "var", componente: "Variable dinámica", descripcion: "{{customer.first_name}}, {{reservation.time}}", notas: "tipado y saneado" },
  { id: "sched", componente: "Programación", descripcion: "inmediata, delay, cron", notas: "con horario silencioso" },
  { id: "limit", componente: "Límite por plan", descripcion: "max reglas, ejecuciones/mes", notas: "enforce en servidor" },
  { id: "idem", componente: "Idempotencia", descripcion: "execution_id + dedup", notas: "anti doble disparo" },
  { id: "antiloop", componente: "Anti-bucle", descripcion: "depth limit + visited set", notas: "detecta ciclos trigger→acción→trigger" },
  { id: "ver", componente: "Versionado", descripcion: "rule_version + draft/published", notas: "sin mutar activas" },
  { id: "sim", componente: "Simulación", descripcion: "dry-run con eventos históricos", notas: "antes de activar" },
  { id: "pause", componente: "Pausa/Reactivación", descripcion: "per-rule y global kill switch", notas: "auditoría" },
  { id: "hist", componente: "Historial", descripcion: "execution log + resultado + errores", notas: "retención configurable" },
  { id: "appr", componente: "Aprobación humana", descripcion: "acciones sensibles (precio, campaña, respuesta pública)", notas: "cola de aprobación" },
];

export function Fase2Automatizaciones() {
  return (
    <Section
      id="f2-automatizaciones"
      index="08"
      eyebrow="Motor de automatizaciones"
      title="Trigger + condiciones + acciones, con aprobación humana para lo sensible."
      intro={
        <>
          Motor visual y extensible. Reglas por organización y por location;
          condiciones simples y compuestas; plantillas por rubro; variables
          dinámicas tipadas; acciones síncronas y asíncronas con delay;
          programación inmediata, diferida o cron; límites por plan; idempotencia
          por <Mono>execution_id</Mono>; anti-bucle con depth limit y visited
          set; versionado draft/published; simulación antes de activar;
          pausa/reactivación; historial y logs; reintentos con DLQ; y{" "}
          <span className="text-foreground">aprobación humana obligatoria</span>{" "}
          para acciones sensibles.
        </>
      }
    >
      {/* Diagrama de ejecución */}
      <div className="mb-12">
        <H3 className="mb-3">Flujo de ejecución de una regla</H3>
        <Lead className="mb-4">
          El evento entra, se hace matching de reglas activas para esa org/loc,
          se evalúan condiciones y, si pasan, se genera un{" "}
          <Mono>execution_id</Mono> que evita el doble disparo. Las acciones
          sensibles van a cola de aprobación humana; las no sensibles se
          ejecutan y se registran en el historial. El anti-bucle aborta si
          detecta ciclos.
        </Lead>
        <Mermaid chart={AUTOMATION_CHART} />
      </div>

      {/* Componentes del motor */}
      <div className="mb-12">
        <H3 className="mb-3">Componentes del motor</H3>
        <Lead className="mb-4">
          Cada componente está versionado y se puede testear de forma aislada.
          Las reglas publicadas son inmutables; cualquier cambio pasa por draft
          → simulación → publish.
        </Lead>
        <DataTable
          head={["Componente", "Descripción", "Notas"]}
          rows={COMPONENTE_ROWS.map((r) => [
            <span key={`comp-${r.id}-c`} className="font-mono text-[13px] rp-gold-text">
              {r.componente}
            </span>,
            <span key={`comp-${r.id}-d`} className="text-foreground/80">
              {r.descripcion}
            </span>,
            <span key={`comp-${r.id}-n`} className="text-muted-foreground">
              {r.notas}
            </span>,
          ])}
        />
      </div>

      {/* Ejemplos de automatizaciones */}
      <div className="mb-12">
        <GlassCard variant="gold">
          <H3>Ejemplos de automatizaciones</H3>
          <Lead className="mt-2">
            Recetas listas para parametrizar. Cada una declara trigger,
            condición, acción, sensibilidad y canal; las marcadas como sensibles
            requieren aprobación humana explícita.
          </Lead>
          <div className="mt-5">
            <GoldList
              items={[
                <span key="ex-noshow">
                  Si cliente acumula <span className="text-foreground">2 No
                  Shows</span> → marcar como riesgo (CRM tag).
                </span>,
                <span key="ex-bday">
                  Si es cumpleaños del cliente → enviar cupón (Marketing) con
                  consentimiento GDPR.
                </span>,
                <span key="ex-vip">
                  Si se reserva mesa VIP → avisar al encargado (Notification) en
                  tiempo real.
                </span>,
                <span key="ex-neg">
                  Si llega reseña negativa → crear incidencia (Super Admin) +
                  sugerir respuesta (IA), con aprobación antes de publicar.
                </span>,
                <span key="ex-occ">
                  Si ocupación prevista <span className="text-foreground">&gt;
                  85%</span> → recomendar personal (IA, aprobación).
                </span>,
                <span key="ex-react">
                  Si cliente no visitó en <span className="text-foreground">90
                  días</span> → campaña de reactivación (Marketing,
                  consentimiento).
                </span>,
              ]}
            />
          </div>
        </GlassCard>
      </div>

      {/* Callout sensible */}
      <Callout kind="warn" title="Lo sensible siempre requiere humano">
        Las acciones que afectan <span className="text-foreground">pricing</span>,
        campañas públicas, respuestas a reseñas, eliminación de datos o
        ejecución de pagos <span className="text-foreground">NUNCA</span> se
        ejecutan sin aprobación humana explícita, aunque la IA las proponga. La
        aprobación queda en cola, se audita y se notifica al actor; el rechazo
        se registra con motivo.
      </Callout>
    </Section>
  );
}

/* ============================================================ */
/* 09 — INTEGRACIONES Y WEBHOOKS                                */
/* ============================================================ */
type ProviderRow = {
  id: string;
  proveedor: string;
  capacidades: string;
  auth: string;
};

const PROVIDER_ROWS: ProviderRow[] = [
  { id: "stripe", proveedor: "Stripe", capacidades: "suscripciones, facturas, cobros", auth: "OAuth + API keys" },
  { id: "wa", proveedor: "WhatsApp Cloud", capacidades: "plantillas, mensajes, sesión", auth: "API token + verify" },
  { id: "gbp", proveedor: "Google Business Profile", capacidades: "reseñas, respuestas, local", auth: "OAuth scopes" },
  { id: "gcal", proveedor: "Google Calendar", capacidades: "sincronización de reservas", auth: "OAuth" },
  { id: "gmaps", proveedor: "Google Maps", capacidades: "geocoding, place", auth: "API key" },
  { id: "meta", proveedor: "Meta / Instagram", capacidades: "contenido, mensajes (futuro)", auth: "OAuth" },
  { id: "tiktok", proveedor: "TikTok", capacidades: "contenido (futuro)", auth: "OAuth" },
  { id: "tg", proveedor: "Telegram", capacidades: "notificaciones bot", auth: "bot token" },
  { id: "slack", proveedor: "Slack", capacidades: "alertas internas", auth: "OAuth/bot" },
  { id: "discord", proveedor: "Discord", capacidades: "alertas internas", auth: "bot" },
  { id: "zapier", proveedor: "Zapier / Make", capacidades: "genérico via webhooks", auth: "API key" },
  { id: "mail", proveedor: "Mailchimp / Brevo", capacidades: "email marketing", auth: "API key" },
  { id: "resend", proveedor: "Resend", capacidades: "email transaccional", auth: "API key" },
];

const ADAPTER_INTERFACE = `interface IntegrationAdapter {
  readonly provider: string;
  readonly capabilities: readonly IntegrationCapability[];
  connect(ctx: OrgContext, credentials: Credentials): Promise<Connection>;
  refresh(connection: Connection): Promise<Connection>;
  disconnect(connection: Connection): Promise<void>;
  health(connection: Connection): Promise<HealthStatus>;
  call(connection: Connection, op: string, input: unknown): Promise<AdapterResult>;
  handleWebhook(raw: WebhookRequest, verify: VerifyFn): Promise<WebhookEvent>;
}`;

export function Fase2Integraciones() {
  return (
    <Section
      id="f2-integraciones"
      index="09"
      eyebrow="Integraciones y webhooks"
      title="Capa común de adaptadores sin ocultar capacidades específicas."
      intro={
        <>
          Una capa común normaliza el ciclo de vida de Stripe, WhatsApp, Google
          (Calendar, Business Profile, Maps), Meta, Instagram, TikTok, Telegram,
          Slack, Discord, Zapier, Make, Mailchimp, Brevo y Resend. Todas
          comparten estado de conexión, credenciales cifradas, OAuth, rotación y
          revocación de tokens, scopes mínimos, logs sanitizados, webhooks
          firmados, reintentos, rate limiting, health, sincronización
          incremental, dedup, manejo de errores, DLQ, reconexión, auditoría y
          límites por plan.
        </>
      }
    >
      {/* Proveedores y capacidades */}
      <div className="mb-12">
        <H3 className="mb-3">Proveedores y capacidades</H3>
        <Lead className="mb-4">
          Cada adaptador expone sus operaciones propias sin perder features. La
          columna <span className="text-foreground">Auth</span> indica el
          mecanismo canónico de conexión; los marcados como{" "}
          <span className="text-foreground">futuro</span> se planifican pero no
          bloquean el lanzamiento.
        </Lead>
        <DataTable
          head={["Proveedor", "Capacidades expuestas", "Auth"]}
          rows={PROVIDER_ROWS.map((r) => [
            <span key={`prov-${r.id}-p`} className="font-mono text-[13px] rp-gold-text">
              {r.proveedor}
            </span>,
            <span key={`prov-${r.id}-c`} className="text-foreground/80">
              {r.capacidades}
            </span>,
            <span key={`prov-${r.id}-a`} className="text-muted-foreground">
              {r.auth}
            </span>,
          ])}
        />
      </div>

      {/* Interfaz común */}
      <div className="mb-12">
        <GlassCard variant="gold">
          <H3>Interfaz común de adaptador</H3>
          <Lead className="mt-2">
            Todos los adaptadores implementan este contrato. <Mono>op</Mono> es
            un <span className="text-foreground">string tipado por proveedor</span>:
            normaliza el ciclo de vida (connect, refresh, health, call, webhook)
            sin forzar un modelo mínimo que pierda features propias.
          </Lead>
          <div className="mt-5">
            <Code lang="typescript">{ADAPTER_INTERFACE}</Code>
          </div>
        </GlassCard>
      </div>

      {/* Compartido por todas las integraciones */}
      <div className="mb-12">
        <GlassCard>
          <H3>Compartido por todas las integraciones</H3>
          <Lead className="mt-2">
            Estas garantías son cross-provider. No se publica un adaptador sin
            cumplirlas; el contrato común las exige por composición, no por
            herencia frágil.
          </Lead>
          <div className="mt-5">
            <GoldList
              items={[
                <span key="s-state">
                  Estado de conexión por org; <Mono>connection</Mono> persistida
                  con status y metadata.
                </span>,
                <span key="s-cred">
                  Credenciales cifradas en reposo (R2/KV secrets); nunca en D1
                  en claro ni en logs.
                </span>,
                <span key="s-oauth">
                  OAuth con scopes mínimos; revisión periódica de permisos
                  concedidos.
                </span>,
                <span key="s-rot">
                  Rotación y revocación de tokens; revocación inmediata por
                  incidente.
                </span>,
                <span key="s-log">
                  Logs sanitizados: sin secretos, sin PII, con redacción por
                  allowlist.
                </span>,
                <span key="s-wh">
                  Webhooks firmados (HMAC + timestamp anti replay con ventana
                  de 5 min).
                </span>,
                <span key="s-retry">
                  Reintentos con backoff exponencial y jitter; sin retry
                  infinito.
                </span>,
                <span key="s-rl">
                  Rate limiting por proveedor y por org; 429 respetado y
                  propagado.
                </span>,
                <span key="s-health">
                  Health status y reconexión automática con circuit breaker.
                </span>,
                <span key="s-sync">
                  Sincronización incremental con cursor; no full pull salvo
                  repara.
                </span>,
                <span key="s-dedup">
                  Deduplicación por id externo; idempotencia por evento.
                </span>,
                <span key="s-dlq">
                  DLQ para fallos persistentes; reproceso manual auditado.
                </span>,
                <span key="s-aud">
                  Auditoría de cada operación (provider, op, actor, correlation_id).
                </span>,
                <span key="s-plan">
                  Límites por plan: integraciones activas, llamadas/mes,
                  webhooks/mes.
                </span>,
              ]}
            />
          </div>
        </GlassCard>
      </div>

      {/* Callout info */}
      <Callout kind="info" title="No ocultar capacidades específicas">
        La interfaz común normaliza el ciclo de vida, pero cada adaptador
        expone sus operaciones propias (<Mono>op: string</Mono> tipado por
        proveedor). No se fuerza un modelo mínimo que pierda features; se
        expone lo común y se tipa lo específico. Esto evita el anti-patrón de
        adaptador genérico que pierde features del proveedor tras una abstracción
        prematura.
      </Callout>
    </Section>
  );
}

/* ============================================================ */
/* 10 — API PÚBLICA                                             */
/* ============================================================ */
type ApiRow = {
  id: string;
  caracteristica: string;
  impl: string;
};

const API_ROWS: ApiRow[] = [
  { id: "ver", caracteristica: "Versionado", impl: "/v1 explícito; política de compatibilidad y deprecación con ventana" },
  { id: "openapi", caracteristica: "OpenAPI", impl: "spec generada desde contratos Zod; portal dev con try-it" },
  { id: "auth", caracteristica: "Autenticación", impl: "API keys scoped (read/write/admin/webhooks) + Bearer" },
  { id: "env", caracteristica: "Entornos", impl: "test (sandbox) y production por org" },
  { id: "perm", caracteristica: "Permisos", impl: "scopes granulares por recurso/acción" },
  { id: "meta", caracteristica: "Metadatos de key", impl: "creada, último uso, caducidad, IP allowlist" },
  { id: "rot", caracteristica: "Rotación/Revocación", impl: "rotación sin downtime; revocación inmediata" },
  { id: "rl", caracteristica: "Rate limiting", impl: "por key y por org; 429 con Retry-After" },
  { id: "idem", caracteristica: "Idempotencia", impl: "header Idempotency-Key; dedup por (key, idem) 24h" },
  { id: "page", caracteristica: "Paginación", impl: "cursor-based; límites por plan" },
  { id: "filt", caracteristica: "Filtros", impl: "query params tipados; validación Zod" },
  { id: "err", caracteristica: "Errores", impl: "formato normalizado {error: {code, message, details, request_id}}" },
  { id: "wh", caracteristica: "Webhooks", impl: "salientes firmados (HMAC + timestamp); reintentos; DLQ; selector de eventos" },
  { id: "sdk", caracteristica: "SDKs", impl: "futuros (TS, Python); generados desde OpenAPI" },
  { id: "portal", caracteristica: "Portal dev", impl: "docs, spec, try-it, logs de key, gestión de webhooks" },
];

const ERROR_RESPONSE = `{
  "error": {
    "code": "reservation_conflict",
    "message": "El horario solicitado no está disponible.",
    "details": { "location_id": "01HZLOC...", "time": "2025-01-21T21:30:00Z" },
    "request_id": "req_01HZ..."
  }
}`;

export function Fase2API() {
  return (
    <Section
      id="f2-api"
      index="10"
      eyebrow="API pública"
      title="/v1, OpenAPI, idempotencia, webhooks firmados y portal para desarrolladores."
      intro={
        <>
          Cada organización puede crear API keys para read, write, limited
          admin y webhook management, con entornos test y production. Las keys
          tienen permisos/scopes granulares, fecha de creación, último uso,
          caducidad, rotación, revocación, IP allowlist opcional, rate limits y
          log de actividad. La spec OpenAPI se genera desde los mismos contratos
          Zod que validan la entrada, evitando drift entre docs y runtime.
        </>
      }
    >
      {/* Características */}
      <div className="mb-12">
        <H3 className="mb-3">Características de la API pública</H3>
        <Lead className="mb-4">
          La API pública es un producto, no un subproducto. Cada característica
          está respaldada por tooling y por docs vivos; el portal dev permite
          probar endpoints sin abandonar la plataforma.
        </Lead>
        <DataTable
          head={["Característica", "Implementación"]}
          rows={API_ROWS.map((r) => [
            <span key={`api-${r.id}-c`} className="font-mono text-[13px] rp-gold-text">
              {r.caracteristica}
            </span>,
            <span key={`api-${r.id}-i`} className="text-foreground/80">
              {r.impl}
            </span>,
          ])}
        />
      </div>

      {/* Errores normalizados */}
      <div className="mb-12">
        <H3 className="mb-3">Errores normalizados</H3>
        <Lead className="mb-4">
          Todo error sigue el mismo formato: <Mono>code</Mono> estable y
          versionado, <Mono>message</Mono> localizable, <Mono>details</Mono>{" "}
          opcional con contexto útil y <Mono>request_id</Mono> para soporte y
          trazabilidad. No se exponen stack traces ni internos.
        </Lead>
        <Code lang="json">{ERROR_RESPONSE}</Code>
      </div>

      {/* Webhooks salientes */}
      <div className="mb-12">
        <GlassCard variant="gold">
          <H3>Webhooks salientes</H3>
          <Lead className="mt-2">
            La API pública no sólo recibe: también emite. Los webhooks salientes
            son entregables, firmados y reintentables; el receptor debe ser
            idempotente porque entregamos al menos una vez.
          </Lead>
          <div className="mt-5">
            <GoldList
              items={[
                <span key="w-hmac">
                  Firma <Mono>HMAC-SHA256</Mono> con secreto rotativo por org.
                </span>,
                <span key="w-headers">
                  Headers <Mono>X-Restopanel-Signature</Mono> y{" "}
                  <Mono>X-Restopanel-Timestamp</Mono>.
                </span>,
                <span key="w-replay">
                  Ventana anti replay de <span className="text-foreground">5
                  min</span>; fuera de ventana → 401 al receptor.
                </span>,
                <span key="w-backoff">
                  Reintentos con backoff exponencial y jitter; sin reintentar
                  4xx definitivos.
                </span>,
                <span key="w-alo">
                  Entrega <span className="text-foreground">at-least-once</span>;
                  el receptor implementa idempotencia por{" "}
                  <Mono>event_id</Mono>.
                </span>,
                <span key="w-reg">
                  Registro completo en <Mono>webhook_deliveries</Mono>{" "}
                  (status, latency, response, attempts).
                </span>,
                <span key="w-kill">
                  Pausa / kill switch por org sin afectar a otras.
                </span>,
                <span key="w-sel">
                  Eventos seleccionables por suscriptor; scope estricto por org.
                </span>,
              ]}
            />
          </div>
        </GlassCard>
      </div>

      {/* Callout compatibilidad */}
      <Callout kind="ok" title="Compatibilidad y deprecación">
        Los cambios breaking requieren bump de versión (<Mono>/v2</Mono>) con
        ventana de coexistencia mínima de <span className="text-foreground">6–12
        meses</span>. Los cambios no-breaking sólo añaden campos opcionales;
        nunca eliminan ni renombran campos existentes en la misma versión. Las
        deprecaciones se anuncian en el portal dev y por header{" "}
        <Mono>Deprecation</Mono> con fecha de sunset.
      </Callout>
    </Section>
  );
}
