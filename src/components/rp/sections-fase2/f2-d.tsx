import * as React from "react";
import {
  Section,
  GlassCard,
  Risk,
  Stat,
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
    <code className="font-mono text-xs rp-gold-text whitespace-nowrap">{children}</code>
  );
}

/* ============================================================ */
/*  16 — SEGURIDAD, PRIVACIDAD Y CUMPLIMIENTO                   */
/* ============================================================ */
type ControlSeg = {
  id: string;
  control: string;
  impl: string;
  riesgo: "bajo" | "medio" | "alto" | "crítico";
};

const CONTROLES_SEG: ControlSeg[] = [
  { id: "tls", control: "Cifrado en tránsito", impl: "TLS en todo; HSTS", riesgo: "bajo" },
  { id: "rest", control: "Cifrado en reposo", impl: "R2 SSE; D1 cifrado gestionado; secretos en KV secrets", riesgo: "bajo" },
  { id: "sec", control: "Gestión de secretos", impl: "fuera de código/D1/KV-plain/frontend; rotación documentada", riesgo: "medio" },
  { id: "mfa", control: "MFA / Passkeys", impl: "WebAuthn default; TOTP fallback; recovery codes cifrados", riesgo: "alto" },
  { id: "ses", control: "Sesiones y dispositivos", impl: "tracking, revocación, device fingerprint", riesgo: "alto" },
  { id: "csrf", control: "CSRF", impl: "tokens anti-CSRF; SameSite cookies", riesgo: "medio" },
  { id: "xss", control: "XSS", impl: "escape + CSP con nonces", riesgo: "medio" },
  { id: "ssrf", control: "SSRF", impl: "allowlist de destinos en fetch saliente", riesgo: "alto" },
  { id: "sqli", control: "Inyección (SQLi)", impl: "consultas parametrizadas; sin SQL dinámico", riesgo: "medio" },
  { id: "rl", control: "Rate limiting", impl: "WAF + por org + por IP + por key", riesgo: "medio" },
  { id: "pwd", control: "Políticas de contraseñas", impl: "longitud, breach check, rotación solo si fugan", riesgo: "medio" },
  { id: "bkp", control: "Backups cifrados", impl: "exports R2 cifrados + versionados; pruebas de restauración", riesgo: "alto" },
  { id: "del", control: "Eliminación/anonimización", impl: "soft delete + anonimización; retención legal; purga", riesgo: "alto" },
  { id: "con", control: "Consentimiento", impl: "captura y versionado por canal/finalidad", riesgo: "medio" },
  { id: "ret", control: "Retención", impl: "por tipo de dato y jurisdicción", riesgo: "medio" },
  { id: "gdpr", control: "GDPR", impl: "derechos del titular; exportación; supresión; portabilidad", riesgo: "alto" },
  { id: "inc", control: "Respuesta a incidentes", impl: "runbooks; kill switches; postmortem sin culpa", riesgo: "alto" },
  { id: "imp", control: "Acceso temporal de soporte", impl: "impersonación lectura + MFA reciente + motivo + audit", riesgo: "crítico" },
];

export function Fase2Seguridad() {
  return (
    <Section
      id="f2-seguridad"
      index="16"
      eyebrow="Seguridad, privacidad y cumplimiento"
      title="Seguridad por defecto; GDPR como restricción, no como módulo."
      intro={
        <>
          Cifrado en tránsito y en reposo; gestión de secretos fuera del código, D1, KV plano y
          frontend. MFA con WebAuthn por defecto; sesiones y dispositivos rastreables y revocables.
          Protección CSRF, XSS, SSRF e inyección SQLi; rate limiting por organización, IP y clave;
          políticas de contraseñas con breach check; backups cifrados con pruebas de restauración.
          Eliminación y anonimización, consentimiento, retención, GDPR, exportación de datos,
          respuesta a incidentes y acceso temporal de soporte auditado son controles de primera
          clase, no extensiones posteriores.
        </>
      }
    >
      <H3 className="mb-4">Controles de seguridad</H3>
      <DataTable
        head={["Control", "Implementación", "Riesgo"]}
        rows={CONTROLES_SEG.map((c) => [
          <span key={`${c.id}-ctrl`}>
            <Mono>{c.control}</Mono>
          </span>,
          <span key={`${c.id}-impl`} className="text-foreground/80">
            {c.impl}
          </span>,
          <Risk key={`${c.id}-risk`} level={c.riesgo} />,
        ])}
      />

      <div className="mt-10 grid lg:grid-cols-2 gap-5">
        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">GDPR</Pill>
            <H3>GDPR como restricción</H3>
          </div>
          <GoldList
            items={[
              "Consentimiento capturado y versionado por canal y finalidad.",
              "Derechos del titular (acceso, rectificación, supresión, portabilidad) implementados como casos de uso.",
              "Exportación cifrada y auditable.",
              "Anonimización irreversible en purga.",
              "Retención por tipo de dato y jurisdicción.",
              "DPA con subprocesadores (Stripe, Resend, WhatsApp, Google).",
              "Registro de tratamientos.",
              "Notificación de brechas en plazo.",
            ]}
          />
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="teal">privacidad</Pill>
            <H3>Privacidad por diseño</H3>
          </div>
          <GoldList
            items={[
              "Minimización de PII: solo se almacena lo que el dominio necesita.",
              "Redacción en logs por allowlist (no por blocklist).",
              "Separación de datos sensibles (credenciales, financieros) del resto del modelo.",
              "Acceso a PII auditado en tabla append-only.",
              "No entrenamiento de IA con PII de clientes sin consentimiento explícito.",
              "Aislamiento entre organizaciones en IA: sin shared context, sin fuga cruzada.",
            ]}
          />
        </GlassCard>
      </div>

      <div className="mt-8">
        <Callout kind="warn" title="Sin RLS → disciplina de repos">
          D1/SQLite no tiene RLS. El control de inyección y aislamiento depende de consultas
          parametrizadas + <Mono>Tenant Enforcement Layer</Mono> + tests IDOR en CI. Es el riesgo
          n.º 1 de fuga entre organizaciones; mitigado por aplicación y por constraints compuestos,
          pero <strong className="text-foreground">no eliminado por el propio motor de base de datos</strong>.
          La disciplina de repositorios y los tests anti-fuga son obligatorios y bloqueantes en CI.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  17 — OBSERVABILIDAD Y ALTA DISPONIBILIDAD                   */
/* ============================================================ */
const HA_OBS_CHART = `flowchart LR
  W["Workers / DO / Queues"] --> L["Logs redactados"]
  W --> M["Métricas"]
  W --> T["Trazas (correlation_id)"]
  L --> WH[("Warehouse / R2")]
  M --> WH
  T --> WH
  WH --> DASH["Dashboards"]
  WH --> ALERT["Alertas (SLO burn)"]
  ALERT --> ONCALL["On-call / Incidentes"]
  ONCALL --> RUN["Runbooks"]
  RUN --> MIT["Mitigación: kill switch / rollback / degradar"]
  W --> HC["Health checks"]
  HC --> STATUS["Status page"]`;

type PilarObs = { id: string; pilar: string; impl: string; notas: string };
const PILARES_OBS: PilarObs[] = [
  { id: "logs", pilar: "Logs estructurados", impl: "JSON en Workers; redacción PII por allowlist", notas: "retención por entorno" },
  { id: "metr", pilar: "Métricas", impl: "counters, histograms, gauges por dominio", notas: "Cloudflare Analytics + warehouse" },
  { id: "traz", pilar: "Trazas distribuidas", impl: "correlation_id por request; propagado a queues/workflows/DO", notas: "end-to-end" },
  { id: "aud", pilar: "Audit logs", impl: "append-only en D1; archivo R2", notas: "retención larga" },
  { id: "alr", pilar: "Alertas", impl: "SLO burn rate, error rate, latencia, coste", notas: "routing por severidad" },
  { id: "hc", pilar: "Health checks", impl: "por servicio y por integración", notas: "status page pública" },
];

type MecHA = { id: string; mec: string; impl: string; riesgo: "bajo" | "medio" | "alto" | "crítico" };
const MEC_HA: MecHA[] = [
  { id: "wrk", mec: "Workers distribuidos", impl: "sin estado en Workers; estado en D1/DO", riesgo: "bajo" },
  { id: "q", mec: "Colas para tareas pesadas", impl: "Queues + Workflows; backpressure", riesgo: "medio" },
  { id: "ret", mec: "Reintentos automáticos", impl: "backoff + jitter; max_attempts → DLQ", riesgo: "medio" },
  { id: "bkp", mec: "Backups verificados", impl: "exports R2 cifrados; pruebas de restauración periódicas", riesgo: "alto" },
  { id: "cb", mec: "Circuit breakers", impl: "por dependencia externa", riesgo: "medio" },
  { id: "to", mec: "Timeouts", impl: "por operación y por dependencia", riesgo: "medio" },
  { id: "deg", mec: "Degradación controlada", impl: "si falla IA/comms/integración, la operación de sala continúa", riesgo: "alto" },
  { id: "can", mec: "Despliegues graduales", impl: "canary; rollback rápido", riesgo: "medio" },
  { id: "ff", mec: "Feature flags", impl: "desacoplar deploy de release; kill switches", riesgo: "bajo" },
];

export function Fase2Observabilidad() {
  return (
    <Section
      id="f2-observabilidad"
      index="17"
      eyebrow="Observabilidad y alta disponibilidad"
      title="Logs redactados, métricas, trazas, SLO y degradación controlada."
      intro={
        <>
          Minimizar puntos únicos de fallo mediante Workers distribuidos sin estado, colas para
          tareas pesadas, reintentos automáticos con backoff, backups verificados y health checks
          por servicio y por integración. Métricas, logs y trazas con correlation_id propagado a
          queues, workflows y Durable Objects. Alertas por SLO burn rate, error rate, latencia y
          coste. Despliegues graduales con rollback rápido, feature flags y kill switches, circuit
          breakers por dependencia, timeouts por operación y degradación controlada para que la
          operación de sala continúe aunque caiga una vía. SLO/SLA, RPO y RTO definidos y medidos.
        </>
      }
    >
      <H3 className="mb-4">Pilares de observabilidad</H3>
      <DataTable
        head={["Pilar", "Implementación", "Notas"]}
        rows={PILARES_OBS.map((p) => [
          <span key={`${p.id}-p`}>
            <Mono>{p.pilar}</Mono>
          </span>,
          <span key={`${p.id}-i`} className="text-foreground/80">
            {p.impl}
          </span>,
          <span key={`${p.id}-n`} className="text-muted-foreground text-xs">
            {p.notas}
          </span>,
        ])}
      />

      <div className="mt-10">
        <H3 className="mb-4">Alta disponibilidad</H3>
        <DataTable
          head={["Mecanismo", "Implementación", "Riesgo"]}
          rows={MEC_HA.map((m) => [
            <span key={`${m.id}-m`}>
              <Mono>{m.mec}</Mono>
            </span>,
            <span key={`${m.id}-i`} className="text-foreground/80">
              {m.impl}
            </span>,
            <Risk key={`${m.id}-r`} level={m.riesgo} />,
          ])}
        />
      </div>

      <div className="mt-10">
        <H3 className="mb-4">Bucle HA + observabilidad</H3>
        <Mermaid chart={HA_OBS_CHART} />
        <Lead className="mt-3">
          Workers, Durable Objects y colas emiten logs, métricas y trazas al warehouse; los
          dashboards y las alertas consumen; el equipo on-call aplica runbooks y mitiga con kill
          switch, rollback o degradación. Health checks alimentan la status page pública.
        </Lead>
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-5">
        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">resiliencia</Pill>
            <H3>Degradación controlada</H3>
          </div>
          <GoldList
            items={[
              "Si falla IA: fallback determinista (reglas estáticas) que no bloquea la operación.",
              "Si falla WhatsApp: fallback a email/SMS manteniendo idempotencia.",
              "Si falla Google reseñas: modo lectura parcial o diferida con reintento programado.",
              "Si falla una integración: la operación de sala continúa sin esa vía.",
              "Si una celda D1 degrada: tráfico redirigido a otra celda (post-Etapa B).",
              "Si un consumidor de eventos cae: la DLQ retiene, no bloquea al productor.",
            ]}
          />
        </GlassCard>

        <div className="grid grid-cols-2 gap-4 self-start">
          <Stat label="SLO núcleo" value="99.9%" sub="operaciones críticas de sala" accent="gold" />
          <Stat label="RPO" value="≤ 15min" sub="punto de recuperación" accent="teal" />
          <Stat label="RTO" value="≤ 2h" sub="recuperación objetivo" accent="fg" />
          <Stat label="Error budget" value="43m/mes" sub="ventana ~28 días" accent="gold" />
        </div>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  18 — MODELO DE DATOS ER                                     */
/* ============================================================ */
const ER_CORE_CHART = `erDiagram
  organizations ||--o{ restaurants : owns
  organizations ||--o{ organization_members : has
  organizations ||--|| subscriptions : billed
  subscriptions }o--|| subscription_plans : on
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
  restaurant_locations ||--o{ menus : offers
  menus ||--o{ menu_items : has
  restaurant_locations ||--o{ employees : employs
  employees ||--o{ shifts : assigned
  organizations ||--o{ campaigns : runs
  organizations ||--o{ automations : defines
  organizations ||--o{ ai_requests : consumes
  organizations ||--o{ audit_logs : records
  organizations ||--o{ notifications : receives`;

type Conv = { id: string; conv: string; regla: string };
const CONV_MODELO: Conv[] = [
  { id: "id", conv: "IDs", regla: "ULID opaco (TEXT); sin autoincrement exponible" },
  { id: "ts", conv: "Timestamps", regla: "UTC ISO-8601; tz IANA por org/local para presentación" },
  { id: "mon", conv: "Dinero", regla: "INTEGER minor units + ISO 4217" },
  { id: "ten", conv: "Tenancy", regla: "organization_id NOT NULL; location_id cuando aplique" },
  { id: "pk", conv: "PK", regla: "compuesta (organization_id, id) en tablas tenant" },
  { id: "fk", conv: "FK", regla: "compuestas refuerzan tenancy" },
  { id: "sd", conv: "Soft delete", regla: "deleted_at NULL; solo con justificación" },
  { id: "aud", conv: "Auditoría", regla: "created_at, updated_at, created_by, updated_by" },
  { id: "evt", conv: "Eventos", regla: "append-only en events_outbox; no se mutan" },
  { id: "pii", conv: "PII", regla: "clasificada, minimizada, redactada en logs" },
  { id: "idx", conv: "Índices", regla: "por consultas reales; compuestos lideran con organization_id" },
];

type DomTab = { id: string; dom: string; tablas: string };
const DOM_TABLAS: DomTab[] = [
  { id: "idn", dom: "Identity", tablas: "users, identities, sessions, devices, passkeys" },
  { id: "org", dom: "Organizations", tablas: "organizations, restaurants, restaurant_locations, organization_members, roles, permissions, role_permissions, member_roles" },
  { id: "bil", dom: "Billing", tablas: "subscription_plans, subscriptions, invoices, usage_records, entitlements" },
  { id: "res", dom: "Reservations", tablas: "reservations, reservation_history, reservation_slots, waitlist, reservation_tags, reservation_notes" },
  { id: "crm", dom: "CRM", tablas: "customers, customer_visits, customer_preferences, customer_tags, customer_notes, customer_allergies, segments" },
  { id: "tab", dom: "Tables", tablas: "floors, zones, tables, table_groups" },
  { id: "stf", dom: "Staff", tablas: "employees, schedules, shifts, attendance" },
  { id: "anl", dom: "Analytics", tablas: "analytics_events, analytics_daily, analytics_monthly, analytics_yearly" },
  { id: "rev", dom: "Reviews", tablas: "google_reviews, public_reviews, review_replies" },
  { id: "mkt", dom: "Marketing", tablas: "campaigns, automations, templates, automation_executions" },
  { id: "ai", dom: "AI", tablas: "ai_requests, ai_predictions, ai_logs, prompt_versions" },
  { id: "int", dom: "Integrations", tablas: "integrations, connections, webhook_deliveries, api_keys" },
  { id: "not", dom: "Notifications", tablas: "notifications, notification_logs, message_templates" },
  { id: "sua", dom: "Super Admin", tablas: "impersonation_sessions, incidents, platform_metrics" },
  { id: "trn", dom: "Transversal", tablas: "audit_logs, events_outbox, feature_flags" },
];

export function Fase2Datos() {
  return (
    <Section
      id="f2-datos"
      index="18"
      eyebrow="Modelo de datos ER"
      title="Entidades y relaciones por dominio; propietario de cada tabla."
      intro={
        <>
          Modelo de datos inicial con entidades y relaciones agrupadas por dominio. Normalizado,
          pero evitando la sobre-normalización que penaliza consultas críticas (reservas, sala,
          CRM). Cada tabla tiene un dominio propietario; no existe acceso directo a tablas de otro
          dominio: la lectura cruzada se hace por contrato o por read model.
        </>
      }
    >
      <H3 className="mb-4">ER — entidades centrales</H3>
      <Mermaid chart={ER_CORE_CHART} />
      <Lead className="mt-3">
        Organización es la frontera de tenancy; de ella cuelgan restaurantes, localizaciones,
        miembros, suscripción, campañas, automatizaciones, peticiones de IA, audit logs y
        notificaciones. Cada localización contiene su planta física, carta, empleados, turnos y
        reservas.
      </Lead>

      <div className="mt-10">
        <H3 className="mb-4">Convenciones del modelo</H3>
        <DataTable
          head={["Convención", "Regla"]}
          rows={CONV_MODELO.map((c) => [
            <span key={`${c.id}-c`}>
              <Mono>{c.conv}</Mono>
            </span>,
            <span key={`${c.id}-r`} className="text-foreground/80">
              {c.regla}
            </span>,
          ])}
        />
      </div>

      <div className="mt-10">
        <H3 className="mb-4">Propiedad de tablas por dominio</H3>
        <DataTable
          head={["Dominio", "Tablas principales (resumen)"]}
          rows={DOM_TABLAS.map((d) => [
            <span key={`${d.id}-d`}>
              <Mono>{d.dom}</Mono>
            </span>,
            <span key={`${d.id}-t`} className="font-mono text-xs text-foreground/75">
              {d.tablas}
            </span>,
          ])}
        />
      </div>

      <div className="mt-8">
        <Callout kind="info" title="Propiedad lógica, no física (MVP)">
          En el MVP todas las tablas comparten el mismo <Mono>shard D1</Mono> particionado por
          organización. La propiedad es <strong className="text-foreground">lógica</strong>: cada
          dominio solo lee o escribe sus tablas a través de su repositorio, nunca accediendo al
          esquema de otro dominio. La extracción a una base física por dominio requiere un ADR y
          justificación de carga o aislamiento; el contrato público de cada dominio se preserva.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  19 — CONTRATOS TYPESCRIPT REPRESENTATIVOS                   */
/* ============================================================ */
const CONTRATOS_TS = `import { z } from "zod";

// === OrgContext: contexto de tenant resuelto en servidor ===
export const OrgContext = z.object({
  organization_id: z.string(),
  location_id: z.string().optional(),
  actor_id: z.string(),
  actor_effective_id: z.string().nullable(),
  correlation_id: z.string(),
  cell_id: z.string(),
  plan: z.string(),
  tz: z.string(),
  currency: z.string(),
});
export type OrgContext = z.infer<typeof OrgContext>;

// === Reservations: comando CreateReservation ===
export const CreateReservationInput = z.object({
  location_id: z.string(),
  customer_id: z.string(),
  party_size: z.int().min(1).max(20),
  reserved_at: z.string().datetime(),
  source: z.enum(["widget", "dashboard", "api", "whatsapp"]),
  table_id: z.string().optional(),
  idem_key: z.string().max(128),
  notes: z.string().max(500).optional(),
});
export type CreateReservationInput = z.infer<typeof CreateReservationInput>;

export interface CreateReservation {
  (ctx: OrgContext, input: CreateReservationInput): Promise<{
    reservation_id: string;
    status: "confirmed" | "waitlist";
  }>;
}

// === Evento de dominio ===
export const ReservationCreatedEvent = z.object({
  event_id: z.string(),
  event_type: z.literal("ReservationCreated"),
  event_version: z.literal(1),
  occurred_at: z.string().datetime(),
  organization_id: z.string(),
  location_id: z.string(),
  actor_id: z.string(),
  correlation_id: z.string(),
  causation_id: z.string().nullable(),
  source: z.literal("reservations"),
  payload: z.object({
    reservation_id: z.string(),
    customer_id: z.string(),
    party_size: z.int(),
    reserved_at: z.string().datetime(),
  }),
  pii_redacted: z.boolean(),
});
export type ReservationCreatedEvent = z.infer<typeof ReservationCreatedEvent>;

// === Interfaz de adaptador (port) ===
export interface NotificationSender {
  send(ctx: OrgContext, msg: {
    channel: "email" | "whatsapp" | "sms" | "push" | "internal";
    to: string;
    template_id: string;
    template_version: number;
    variables: Record<string, unknown>;
    idem_key: string;
  }): Promise<{ message_id: string; status: "queued" | "sent" | "failed" }>;
}

// === Resultado de autorización ===
export type AuthzDecision =
  | { allow: true; reasons: string[] }
  | { allow: false; reasons: string[] };

export interface Authorizer {
  check(ctx: OrgContext, req: {
    resource: string;
    action: string;
    resource_id?: string;
    scope?: { location_id?: string };
  }): Promise<AuthzDecision>;
}`;

export function Fase2Contratos() {
  return (
    <Section
      id="f2-contratos"
      index="19"
      eyebrow="Contratos TypeScript representativos"
      title="Contratos tipados que CI hace valer entre dominios."
      intro={
        <>
          Contratos TypeScript representativos (Zod + tipos) para comandos, consultas, eventos e
          interfaces de adaptador. Son la API pública de cada paquete de dominio: los módulos
          internos no son importables desde fuera. CI valida que ningún dominio rompa su contrato
          ni importe internals ajenos.
        </>
      }
    >
      <H3 className="mb-4">Ejemplos canónicos</H3>
      <Code lang="typescript">{CONTRATOS_TS}</Code>

      <div className="mt-10">
        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">reglas</Pill>
            <H3>Reglas de contratos</H3>
          </div>
          <GoldList
            items={[
              "Cada paquete exporta solo vía index.ts su API pública: tipos, casos de uso y esquemas de eventos.",
              "Los esquemas Zod son la fuente de verdad; los tipos se derivan con z.infer.",
              "Los eventos se versionan con event_version como literal numérico inmutable.",
              "Los adaptadores se definen como interfaces (ports) en el dominio; se implementan en infrastructure.",
              "CI valida con eslint-plugin-boundaries y dependency-cruiser que ningún dominio importe internals de otro.",
            ]}
          />
        </GlassCard>
      </div>

      <div className="mt-8">
        <Callout kind="ok" title="Contratos = futura extracción sin reescritura">
          Mientras los dominios respeten los contratos públicos (comandos, consultas, eventos e
          interfaces), extraer uno a microservicio es <strong className="text-foreground">preservar
          el contrato y cambiar el transporte</strong>, no reescribir consumidores. El acoplamiento
          real entre dominios se mide por la superficie del contrato, no por la ubicación del
          proceso.
        </Callout>
      </div>
    </Section>
  );
}
