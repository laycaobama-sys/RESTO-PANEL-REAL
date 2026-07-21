import * as React from "react";
import {
  Section,
  GlassCard,
  Tag,
  Risk,
  Stat,
  Pill,
  H3,
  Lead,
  DataTable,
  GoldList,
  Callout,
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
/*  11 — DISEÑO DE PERMISOS (RBAC + ABAC)                        */
/* ============================================================ */
const AUTHZ_FLOW_CHART = `sequenceDiagram
  participant U as Usuario
  participant W as Worker API
  participant MW as Auth Middleware
  participant R as RBAC y ABAC
  participant D as Dominio
  U->>W: Request con cookie
  W->>MW: validar sesion y resolver tenant
  MW->>R: check recurso accion scope contexto plan
  R->>R: deny por defecto evaluar roles y ABAC
  alt allow
    R-->>MW: allow
    MW->>D: caso de uso
    D-->>W: resultado
  else deny
    R-->>MW: deny
    MW-->>U: 403 y audit
  end`;

type AuthzDim = {
  dim: string;
  desc: string;
  ej: string;
};

const AUTHZ_DIMENSIONS: AuthzDim[] = [
  { dim: "Recurso", desc: "sobre qué actúa", ej: "reservation, customer, menu_item" },
  { dim: "Acción", desc: "qué hace", ej: "read, write, delete, export, approve" },
  { dim: "Organización", desc: "tenant", ej: "org_01HZ..." },
  { dim: "Sede", desc: "location scope", ej: "location_01HZ..." },
  { dim: "Departamento", desc: "área", ej: "sala, cocina, bar, marketing" },
  { dim: "Propiedad", desc: "ownership del recurso", ej: "created_by == actor" },
  { dim: "Contexto", desc: "condiciones", ej: "turno activo, horario, zona asignada" },
  { dim: "Plan", desc: "entitlements", ej: "plan.pro.max_automations" },
  { dim: "Estado de cuenta", desc: "activa/impagada", ej: "billing_status == 'active'" },
];

type PredRole = {
  rol: string;
  scope: string;
  perms: string;
};

const PRED_ROLES: PredRole[] = [
  { rol: "Super Admin", scope: "plataforma", perms: "todo global + impersonación" },
  { rol: "Platform Admin", scope: "plataforma", perms: "gestión operativa de plataforma" },
  { rol: "Support", scope: "plataforma", perms: "soporte lectura + impersonación lectura" },
  { rol: "Owner", scope: "organization", perms: "todo scoped a la org" },
  { rol: "Manager", scope: "restaurant/location", perms: "operación + staff + reportes" },
  { rol: "Reception", scope: "location", perms: "reservas + check-in + CRM lectura" },
  { rol: "Waiter", scope: "location", perms: "sala + mesas + pedidos" },
  { rol: "Kitchen", scope: "location", perms: "pedidos + carta lectura" },
  { rol: "Bar", scope: "location", perms: "pedidos bar + carta bar" },
  { rol: "Accountant", scope: "organization", perms: "billing + reportes; sin ops" },
  { rol: "Marketing", scope: "organization", perms: "CRM + campañas + automatizaciones" },
];

export function Fase2Permisos() {
  return (
    <Section
      id="f2-permisos"
      index="11"
      eyebrow="Diseño de permisos"
      title="RBAC + ABAC: recurso, acción, scope, contexto y plan."
      intro={
        <>
          Autorización híbrida: cada verificación considera recurso, acción, organización, sede,
          departamento, propiedad del recurso, condiciones contextuales, plan de suscripción y
          estado de cuenta. RBAC estructura la matriz; ABAC decide por request. Por ejemplo, el rol{" "}
          <Mono>Reception</Mono> puede editar reservas de su sede, pero no eliminar clientes ni
          exportar datos; las condiciones de turno, horario y zona asignada refuerzan el least
          privilege en cada invocación.
        </>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Stat label="Roles predeterminados" value="11" sub="más custom por org" accent="gold" />
        <Stat label="Dimensiones ABAC" value="9" sub="recurso → estado de cuenta" accent="teal" />
        <Stat label="Política de cache" value="Por request" sub="no KV como autoridad" accent="fg" />
        <Stat label="Default" value="Deny" sub="ausencia ≠ allow" accent="fg" />
      </div>

      {/* Dimensiones de autorización */}
      <div className="mb-12">
        <H3 className="mb-3">Dimensiones de autorización</H3>
        <Lead className="mb-4">
          Cada check combina las nueve dimensiones. RBAC aporta la matriz (rol → permisos); ABAC
          acota por organización, sede, departamento, propiedad del recurso, contexto y entitlements
          del plan. Sin las nueve dimensiones, no hay <Mono>allow</Mono>.
        </Lead>
        <DataTable
          head={["Dimensión", "Descripción", "Ejemplo"]}
          rows={AUTHZ_DIMENSIONS.map((d) => [
            <span key="dim" className="font-mono text-[13px] rp-gold-text">
              {d.dim}
            </span>,
            <span key="desc" className="text-foreground/80">
              {d.desc}
            </span>,
            <span key="ej" className="font-mono text-[12px] text-foreground/85">
              {d.ej}
            </span>,
          ])}
        />
      </div>

      {/* Roles predeterminados */}
      <div className="mb-12">
        <H3 className="mb-3">Roles predeterminados</H3>
        <Lead className="mb-4">
          Once roles base cubren el espectro operativo. Cada rol fija un scope máximo y un set
          cerrado de permisos; ningún rol escapa de su scope por construcción.
        </Lead>
        <DataTable
          head={["Rol", "Scope", "Permisos clave"]}
          rows={PRED_ROLES.map((r) => [
            <span key="rol" className="font-mono text-[13px] rp-gold-text">
              {r.rol}
            </span>,
            <Pill key="scope" tone="teal">
              {r.scope}
            </Pill>,
            <span key="perms" className="text-foreground/85">
              {r.perms}
            </span>,
          ])}
        />
      </div>

      {/* Roles personalizados */}
      <GlassCard variant="gold" className="mb-12">
        <H3>Roles personalizados</H3>
        <Lead className="mt-2">
          El Owner compone roles a la medida del negocio, sin escapar de las constraints del
          sistema. La regla rectora: un rol custom nunca puede más que quien lo crea.
        </Lead>
        <div className="mt-5">
          <GoldList
            items={[
              "Owner crea roles con un subconjunto de permisos de los roles base.",
              "Heredan las constraints de scope del rol padre: un custom sobre location no escapa a organization.",
              "Nunca más privilegio que el creador: el sistema compara el set y rechaza la creación si excede.",
              "Auditados: toda creación, edición y asignación queda en audit_log con actor, motivo y diff de permisos.",
              "Versionados: cada cambio crea una nueva versión del rol; las sesiones activas conservan la versión vigente al emitirse.",
              "Aplicables por organización, restaurante o local: el scope de asignación define dónde es válido.",
              "Deny explícito tiene prioridad sobre allow: un permiso negado a nivel custom bloquea herencias.",
            ]}
          />
        </div>
      </GlassCard>

      {/* Caché e invalidación */}
      <GlassCard className="mb-12">
        <H3>Caché e invalidación</H3>
        <Lead className="mt-2">
          La autoridad de permisos vive en D1, no en caché. La caché es una optimización de request
          con invalidación determinista; ningún allow se sirve desde KV sin pass por la matriz
          vigente.
        </Lead>
        <div className="mt-5">
          <GoldList
            items={[
              "Permisos cacheados en memoria de request (no en KV como autoridad).",
              "Invalidación al cambiar rol o membership: el cambio propagates vía evento y aborta sesiones afectadas.",
              "Evaluación centralizada en middleware de auth: ningún caso de uso decide permisos por su cuenta.",
              "Deny por defecto: ausencia de permiso explícito se interpreta como denegación.",
              "Tests automáticos en CI para evitar escalada de privilegios y regresiones IDOR cross-tenant.",
            ]}
          />
        </div>
      </GlassCard>

      {/* Diagrama de autorización */}
      <div className="mb-12">
        <H3 className="mb-3">Flujo de autorización</H3>
        <Lead className="mb-4">
          Cada request atraviesa el middleware de auth: valida sesión, resuelve tenant, invoca el
          motor RBAC+ABAC con las nueve dimensiones y solo delega al dominio si recibe{" "}
          <Mono>allow</Mono>. Cualquier <Mono>deny</Mono> se registra en auditoría.
        </Lead>
        <Mermaid chart={AUTHZ_FLOW_CHART} />
      </div>

      {/* Callout deny por defecto */}
      <Callout kind="warn" title="Deny por defecto">
        Toda acción no explícitamente permitida se deniega. La ausencia de permiso no es{" "}
        <Mono>allow</Mono>. Los tests de escalada de privilegios son obligatorios en CI: cualquier
        PR que relaje una constraint sin justificación y ADR bloquea el merge.
      </Callout>
    </Section>
  );
}

/* ============================================================ */
/*  12 — AUDITORÍA INMUTABLE                                     */
/* ============================================================ */
type AuditField = {
  campo: string;
  tipo: string;
  notas: string;
};

const AUDIT_FIELDS: AuditField[] = [
  { campo: "audit_id", tipo: "ULID", notas: "PK" },
  { campo: "occurred_at", tipo: "TEXT ISO UTC", notas: "timestamp" },
  { campo: "actor_id", tipo: "TEXT", notas: "usuario o sistema" },
  { campo: "actor_effective_id", tipo: "TEXT?", notas: "si impersonación" },
  { campo: "organization_id", tipo: "TEXT", notas: "tenant" },
  { campo: "location_id", tipo: "TEXT?", notas: "sede" },
  { campo: "action", tipo: "TEXT", notas: "verb (create/update/delete/export/impersonate)" },
  { campo: "resource_type", tipo: "TEXT", notas: "reservation/customer/role" },
  { campo: "resource_id", tipo: "TEXT", notas: "id del recurso" },
  { campo: "before", tipo: "TEXT (JSON)", notas: "valores previos (si seguro)" },
  { campo: "after", tipo: "TEXT (JSON)", notas: "valores nuevos (si seguro)" },
  { campo: "result", tipo: "TEXT", notas: "success/denied/error" },
  { campo: "duration_ms", tipo: "INTEGER", notas: "duración" },
  { campo: "ip", tipo: "TEXT", notas: "redactada/truncada" },
  { campo: "user_agent", tipo: "TEXT", notas: "dispositivo/navegador" },
  { campo: "correlation_id", tipo: "TEXT", notas: "traza end-to-end" },
  { campo: "reason", tipo: "TEXT?", notas: "motivo acceso admin" },
  { campo: "origin", tipo: "TEXT", notas: "ui/api/webhook/automation/ai" },
];

export function Fase2Auditoria() {
  return (
    <Section
      id="f2-auditoria"
      index="12"
      eyebrow="Auditoría"
      title="Registro inmutable de operaciones sensibles."
      intro={
        <>
          Log de auditoría append-only para operaciones sensibles: crear o modificar reservas,
          eliminar o anonimizar clientes, cambiar permisos, cambiar de plan, exportar datos,
          accesos de soporte, ejecución de automatizaciones y modificación de integraciones. El
          registro es canónico, inmutable y consultable; las correcciones se hacen con registros
          compensatorios, nunca con <Mono>UPDATE</Mono> o <Mono>DELETE</Mono>.
        </>
      }
    >
      {/* Campos del registro */}
      <div className="mb-12">
        <H3 className="mb-3">Campos del registro de auditoría</H3>
        <Lead className="mb-4">
          Cada entrada es una tupla autoexplicativa: quién (real y efectivo), dónde (org y sede),
          qué (acción sobre recurso), cuándo (timestamp UTC), por qué (motivo si aplica), cómo
          (origen, IP, user_agent, correlation_id) y resultado. <Mono>before</Mono> y{" "}
          <Mono>after</Mono> capturan diff seguro; la PII sensible se enmascara antes de persistir.
        </Lead>
        <DataTable
          head={["Campo", "Tipo", "Notas"]}
          rows={AUDIT_FIELDS.map((f) => [
            <span key="campo" className="font-mono text-[12px] rp-gold-text">
              {f.campo}
            </span>,
            <span key="tipo" className="font-mono text-[12px] text-foreground/85">
              {f.tipo}
            </span>,
            <span key="notas" className="text-foreground/80">
              {f.notas}
            </span>,
          ])}
        />
      </div>

      {/* Retención y protección */}
      <GlassCard variant="gold" className="mb-12">
        <H3>Retención y protección</H3>
        <Lead className="mt-2">
          El log es la columna vertebral de la trazabilidad y del cumplimiento GDPR/ISO. Su
          inmutabilidad no es una promesa de UI: es una combinación de constraint (sin rutas de
          mutación en la app) y de proceso (acceso restringido, archivo cifrado y hash chain
          opcional para detectar manipulación).
        </Lead>
        <div className="mt-5">
          <GoldList
            items={[
              "Append-only: no hay rutas UPDATE/DELETE en la app; las correcciones se hacen con registros compensatorios.",
              "Retención 1 año en D1 + archivo en R2 cifrado (SSE) para retención larga.",
              "Acceso restringido: Super Admin y Support con motivo obligatorio; lectura auditada.",
              "Búsqueda por organización, actor, acción y rango temporal; índices liderando con organization_id.",
              "Exportación cifrada y auditada: toda exportación genera a su vez un registro de auditoría.",
              "Enmascaramiento de PII sensible: secretos, credenciales y datos financieros completos nunca se persisten.",
              "Protección frente a modificación vía constraints y auditoría de la propia auditoría (meta-log).",
              "Hash chain opcional: encadenamiento criptográfico de entradas para detectar manipulación a posteriori.",
            ]}
          />
        </div>
      </GlassCard>

      {/* Operaciones sensibles auditadas */}
      <GlassCard className="mb-12">
        <H3>Operaciones sensibles auditadas</H3>
        <Lead className="mt-2">
          Lista cerrada y revisada por seguridad. Cualquier operación nueva que cumpla los criterios
          de sensibilidad (PII, dinero, permisos, eliminación, acceso admin) debe añadirse
          explícitamente al catálogo.
        </Lead>
        <div className="mt-5">
          <GoldList
            items={[
              "Crear, modificar o eliminar reservas (incluida cancelación y reasignación de mesa).",
              "Eliminar o anonimizar clientes; merge de perfiles; exportación de CRM.",
              "Cambiar permisos o roles: creación/edición/asignación de roles custom y memberships.",
              "Cambiar de plan o billing: upgrade/downgrade, métodos de pago, facturación.",
              "Exportar datos: cualquier exportación de agregados o raw a CSV/Excel/BI.",
              "Acceder como soporte (impersonación): inicio, elevación, fin y revocación.",
              "Ejecutar automatizaciones sensibles: campañas masivas, kill switches, migraciones.",
              "Modificar integraciones o credenciales: rotación de API keys, secretos de terceros.",
              "Activar kill switches: globales o por tenant, con motivo y autor.",
              "Aprobar o rechazar acciones de IA: respuestas a reseñas, campañas, eliminaciones.",
            ]}
          />
        </div>
      </GlassCard>

      {/* Callout inmutabilidad */}
      <Callout kind="info" title="Inmutabilidad = constraint + proceso">
        La tabla <Mono>audit_logs</Mono> no tiene rutas <Mono>UPDATE</Mono>/<Mono>DELETE</Mono> en
        la app; las correcciones se hacen con registros compensatorios (acción{" "}
        <Mono>compensate</Mono> que referencia el <Mono>audit_id</Mono> original). El acceso de
        escritura directa a la tabla está restringido a un canal único auditado, empleado solo en
        procedimientos de break-glass con motivo, aprobador y revisión posterior.
      </Callout>
    </Section>
  );
}

/* ============================================================ */
/*  13 — CENTRO DE NOTIFICACIONES                                */
/* ============================================================ */
const NOTIFICATION_PIPELINE_CHART = `flowchart LR
  TRG["Trigger (evento/automatización/caso de uso)"] --> COMP["Compose (template + variables + i18n)"]
  COMP --> CHECK{"Consent + preferencias + horario silencioso?"}
  CHECK -->|ok| Q["Cola por canal + prioridad"]
  CHECK -->|no| SKIP["No-op o reprogramar"]
  Q --> PROV["Adaptador de proveedor"]
  PROV --> DLV["Entrega"]
  DLV --> LOG["Log + tracking"]
  DLV -.fallo.-> RETRY["Reintentos con backoff"]
  RETRY -.max.-> DLQ["Dead Letter"]
  DLV -.bounce.-> BOUNCE["Rebote/baja → actualizar preferencias"]`;

type Channel = {
  canal: string;
  estado: React.ReactNode;
  proveedor: string;
  notas: string;
};

const CHANNELS: Channel[] = [
  {
    canal: "Email",
    estado: <Tag kind="Imprescindible">Imprescindible</Tag>,
    proveedor: "Resend",
    notas: "transaccional + marketing",
  },
  {
    canal: "WhatsApp",
    estado: <Tag kind="Imprescindible">Imprescindible</Tag>,
    proveedor: "WhatsApp Cloud API",
    notas: "plantillas aprobadas",
  },
  {
    canal: "SMS",
    estado: <Tag kind="Posterior">Posterior</Tag>,
    proveedor: "TBD",
    notas: "futuro",
  },
  {
    canal: "Push web",
    estado: <Tag kind="Importante">Importante</Tag>,
    proveedor: "propio (Web Push)",
    notas: "dashboard",
  },
  {
    canal: "Internas",
    estado: <Tag kind="Imprescindible">Imprescindible</Tag>,
    proveedor: "propio (D1 + WS)",
    notas: "in-app",
  },
];

export function Fase2Notificaciones() {
  return (
    <Section
      id="f2-notificaciones"
      index="13"
      eyebrow="Centro de notificaciones"
      title="Email, WhatsApp, SMS futuro, push web e internas; unificado."
      intro={
        <>
          Servicio unificado de notificaciones con colas, prioridades, programación, reintentos,
          proveedores intercambiables, plantillas versionadas, variables, i18n, preferencias de
          usuario, consentimiento, horario silencioso, deduplicación, historial, seguimiento de
          entrega, rebotes/bajas y límites por plan. Un solo contrato <Mono>NotificationSender</Mono>{" "}
          abstrae los proveedores; añadir un canal nuevo no acopla dominios.
        </>
      }
    >
      {/* Canales */}
      <div className="mb-12">
        <H3 className="mb-3">Canales</H3>
        <Lead className="mb-4">
          Cinco canales, tres prioritarios en MVP. Cada canal declara su proveedor inicial y un
          estado de prioridad que alinea roadmap y expectativas.
        </Lead>
        <DataTable
          head={["Canal", "Estado", "Proveedor inicial", "Notas"]}
          rows={CHANNELS.map((c) => [
            <span key="canal" className="font-mono text-[13px] rp-gold-text">
              {c.canal}
            </span>,
            c.estado,
            <span key="prov" className="font-mono text-[12px] text-foreground/85">
              {c.proveedor}
            </span>,
            <span key="notas" className="text-foreground/80">
              {c.notas}
            </span>,
          ])}
        />
      </div>

      {/* Diagrama de pipeline */}
      <div className="mb-12">
        <H3 className="mb-3">Pipeline de notificación</H3>
        <Lead className="mb-4">
          Cada notificación atraviesa trigger, composición con plantilla versionada, chequeo de
          consentimiento/preferencias/horario silencioso, cola por canal y prioridad, adaptador de
          proveedor, entrega con tracking, reintentos con backoff y DLQ. Rebotes y bajas
          retroalimentan preferencias en tiempo real.
        </Lead>
        <Mermaid chart={NOTIFICATION_PIPELINE_CHART} />
      </div>

      {/* Características obligatorias */}
      <GlassCard variant="gold" className="mb-12">
        <H3>Características obligatorias</H3>
        <Lead className="mt-2">
          El centro de notificaciones no es un wrapper sobre Resend. Es un servicio transversal con
          las mismas garantías que el dominio de reservas: idempotencia, observabilidad,
          auditabilidad y degradación elegante.
        </Lead>
        <div className="mt-5">
          <GoldList
            items={[
              "Colas por canal y prioridad: Cloudflare Queues con un queue por canal y prioridad.",
              "Programación con horario silencioso por zona horaria IANA del receptor.",
              "Reintentos con backoff exponencial y DLQ (Dead Letter Queue) para envíos fallidos.",
              "Proveedores intercambiables: interfaz NotificationSender; swap sin tocar dominios.",
              "Plantillas versionadas: (template_id, version) inmutable; rollback a versión anterior.",
              "Variables tipadas y saneadas: esquema Zod por plantilla; sin interpolación cruda.",
              "i18n por locale del receptor: plantillas traducidas con fallback al locale por defecto.",
              "Preferencias del usuario: canal y frecuencia configurables por destinatario.",
              "Consentimiento por canal y finalidad (GDPR): sin opt-in válido, no se envía.",
              "Deduplicación por (org, template, recipient, dedup_key): evita dobles envíos en retries.",
              "Historial consultable: notifications table con estado final y trazas por intento.",
              "Seguimiento de entrega: sent / delivered / failed / bounced con timestamps.",
              "Gestión de rebotes y bajas: actualiza preferencias inmediatamente; respeta suppressions.",
              "Límites por plan y organización: throughput diario, destinatarios únicos, plantillas activas.",
            ]}
          />
        </div>
      </GlassCard>

      {/* Callout consentimiento */}
      <Callout kind="warn" title="Consentimiento y horario silencioso">
        Nada se envía sin consentimiento válido por canal y finalidad. El horario silencioso
        (configurable por organización) reprograma los envíos no urgentes a la próxima ventana
        permitida en la tz del receptor. Las bajas y rebotes actualizan preferencias
        inmediatamente: un destinatario en suppression list no recibe nuevos envíos hasta
        reopt-in explícito.
      </Callout>
    </Section>
  );
}

/* ============================================================ */
/*  14 — CENTRO DE IA                                            */
/* ============================================================ */
const AI_REQUEST_CHART = `flowchart LR
  TRG["Trigger (dominio/automatización)"] --> PREP["Preparar inputs (minimizar + redactar PII)"]
  PREP --> RATE{"Rate limit + presupuesto?"}
  RATE -->|ok| MODEL["Modelo versionado (prompt_id+v)"]
  RATE -->|no| FALLBACK["Fallback determinista"]
  MODEL --> EVAL{"Confianza + sensible?"}
  EVAL -->|sensible| APPROV["Cola de aprobación humana"]
  EVAL -->|no sensible| RES["Resultado"]
  APPROV -->|aprobado| RES
  APPROV -->|rechazado| LOG["Log + notificar"]
  RES --> LOGRUN["ai_requests (coste, latencia)"]
  RES --> CONSUME["Consumidor (dominio/automatización)"]
  MODEL -.fallo.-> FALLBACK`;

type AICapability = {
  dominio: string;
  capacidad: string;
  entradas: string;
  salida: string;
  validacion: string;
};

const AI_CAPABILITIES: AICapability[] = [
  {
    dominio: "Reservations",
    capacidad: "Detectar conflictos",
    entradas: "slots, reservas existentes",
    salida: "conflicto sí/no + alternativas",
    validacion: "no (informativo)",
  },
  {
    dominio: "Reservations",
    capacidad: "Recomendar mesas",
    entradas: "party_size, preferencias, plano",
    salida: "mesa sugerida",
    validacion: "no",
  },
  {
    dominio: "Reservations",
    capacidad: "Predecir no-show",
    entradas: "historial cliente, reserva",
    salida: "probabilidad + confianza",
    validacion: "no (marca riesgo)",
  },
  {
    dominio: "CRM",
    capacidad: "Resumir historial",
    entradas: "eventos del cliente",
    salida: "resumen estructurado",
    validacion: "no",
  },
  {
    dominio: "CRM",
    capacidad: "Detectar VIP",
    entradas: "recurrencia, gasto, tags",
    salida: "VIP sí/no + razones",
    validacion: "aprobación para etiquetar",
  },
  {
    dominio: "CRM",
    capacidad: "Crear segmentos",
    entradas: "clientes + reglas",
    salida: "segmento sugerido",
    validacion: "aprobación",
  },
  {
    dominio: "Marketing",
    capacidad: "Generar campaña",
    entradas: "objetivo, audiencia",
    salida: "borrador de campaña",
    validacion: "aprobación",
  },
  {
    dominio: "Marketing",
    capacidad: "Sugerir promociones",
    entradas: "ocupación, histórico",
    salida: "promoción + impacto estimado",
    validacion: "aprobación",
  },
  {
    dominio: "Reviews",
    capacidad: "Analizar reseña",
    entradas: "texto, rating",
    salida: "sentimiento + temas",
    validacion: "no",
  },
  {
    dominio: "Reviews",
    capacidad: "Proponer respuesta",
    entradas: "reseña, tono marca",
    salida: "borrador de respuesta",
    validacion: "aprobación obligatoria",
  },
  {
    dominio: "Reviews",
    capacidad: "Detectar tendencias",
    entradas: "reseñas agregadas",
    salida: "temas emergentes",
    validacion: "no",
  },
  {
    dominio: "Operations",
    capacidad: "Predecir ocupación",
    entradas: "histórico, eventos",
    salida: "predicción + confianza",
    validacion: "no",
  },
  {
    dominio: "Operations",
    capacidad: "Recomendar personal",
    entradas: "ocupación prevista, plantilla",
    salida: "sugerencia de turnos",
    validacion: "aprobación",
  },
  {
    dominio: "Operations",
    capacidad: "Detectar horas punta",
    entradas: "histórico agregado",
    salida: "franjas críticas",
    validacion: "no",
  },
];

export function Fase2IA() {
  return (
    <Section
      id="f2-ia"
      index="14"
      eyebrow="Centro de IA"
      title="Asistentes especializados por dominio, no un chatbot genérico."
      intro={
        <>
          IA compuesta por asistentes especializados por dominio: Reservations (detección de
          conflictos, recomendación de mesas, predicción de no-show), CRM (resumen de historial,
          detección de VIP, segmentos), Marketing (generación de campañas, promociones, optimización
          de calendario), Reviews (análisis, propuestas de respuesta, detección de tendencias) y
          Operations (predicción de ocupación, personal, detección de horas punta). Workers AI es
          el proveedor primario; el fallback determinista garantiza operación aunque el proveedor
          falle.
        </>
      }
    >
      {/* Tabla de capacidades */}
      <div className="mb-12">
        <H3 className="mb-3">Capacidades de IA por dominio</H3>
        <Lead className="mb-4">
          Cinco dominios, catorce capacidades iniciales. Cada capacidad declara entradas
          minimizadas, salida esperada, nivel de confianza y si requiere validación humana. La
          columna Validación humana es inapelable: si dice <Mono>aprobación</Mono>, la acción no se
          ejecuta sin un humano que la firme.
        </Lead>
        <DataTable
          head={["Dominio", "Capacidad", "Entradas", "Salida", "Validación humana"]}
          rows={AI_CAPABILITIES.map((c, i) => [
            <span key={`dom-${i}`} className="font-mono text-[12px] rp-gold-text">
              {c.dominio}
            </span>,
            <span key={`cap-${i}`} className="font-medium text-foreground">
              {c.capacidad}
            </span>,
            <span key={`ent-${i}`} className="font-mono text-[11px] text-foreground/85">
              {c.entradas}
            </span>,
            <span key={`sal-${i}`} className="text-foreground/85">
              {c.salida}
            </span>,
            <span key={`val-${i}`} className="text-foreground/75">
              {c.validacion}
            </span>,
          ])}
        />
      </div>

      {/* Reglas del Centro de IA */}
      <GlassCard variant="gold" className="mb-12">
        <H3>Reglas del Centro de IA</H3>
        <Lead className="mt-2">
          El Centro de IA es un servicio transversal con las mismas garantías que cualquier dominio:
          observabilidad, idempotencia, control de coste, kill switch, aislamiento multi-tenant y
          fallback determinista. No es una caja negra; cada salida es explicable y trazable.
        </Lead>
        <div className="mt-5">
          <GoldList
            items={[
              "Datos de entrada minimizados y PII redactada antes de llegar al modelo.",
              "Nivel de confianza y explicabilidad en cada salida: el consumidor sabe por qué la IA propone.",
              "El modelo nunca accede directamente a tablas: solo vía contratos del dominio (queries/events).",
              "Prompts y modelos versionados: (prompt_id, version) inmutable; rollback auditable.",
              "Registro de uso en ai_requests: coste, latencia, versión, resultado, correlation_id.",
              "Evaluación offline periódica + feedback humano explícito (humano corrige la salida).",
              "Presupuesto y rate limit por organización: sin crédito, se degrada a fallback determinista.",
              "Kill switch global y por tenant: desactiva IA sin tocar código ni desplegar.",
              "Fallback determinista obligatorio cuando el proveedor no esté disponible o la confianza sea baja.",
              "Prevención de filtraciones entre organizaciones: contexto scoped por org, sin memoria cross-tenant.",
              "Acciones sensibles (precio, campaña, respuesta pública, eliminación) requieren aprobación humana explícita.",
            ]}
          />
        </div>
      </GlassCard>

      {/* Diagrama de flujo de IA */}
      <div className="mb-12">
        <H3 className="mb-3">Flujo de solicitud de IA</H3>
        <Lead className="mb-4">
          Cada invocación atraviesa preparación de inputs (minimización + redacción), rate limit y
          presupuesto, modelo versionado, evaluación de confianza y sensibilidad, y opcional cola
          de aprobación humana. El fallback determinista cubre fallos de proveedor y presupuestos
          agotados.
        </Lead>
        <Mermaid chart={AI_REQUEST_CHART} />
      </div>

      {/* Callout IA propone */}
      <Callout kind="warn" title="La IA propone, el humano decide lo sensible">
        La IA nunca ejecuta acciones sensibles sin autorización explícita de un humano. Sensible
        incluye: precios, campañas públicas, respuestas a reseñas, eliminación de datos y ejecución
        de pagos. El fallback determinista garantiza operación aunque el proveedor de IA falle:
        cuando el modelo no responde, el dominio continúa con reglas deterministas (plantillas,
        heurísticas) y lo registra en <Mono>ai_requests</Mono> con resultado <Mono>fallback</Mono>.
      </Callout>
    </Section>
  );
}

/* ============================================================ */
/*  15 — ANALÍTICA Y MÉTRICAS                                    */
/* ============================================================ */
const ANALYTICS_PIPELINE_CHART = `flowchart LR
  DOM["Dominios"] --> EVT["Eventos (outbox)"]
  EVT --> Q["Queue de analítica"]
  Q --> ING["Ingesta + validación"]
  ING --> RT["Tiempo real (proyecciones)"]
  ING --> AGG["Agregación batch (daily/monthly/yearly)"]
  AGG --> WH[("Warehouse / R2")]
  RT --> DASH["Dashboards operativos"]
  AGG --> DASH2["Dashboards estratégicos"]
  WH --> EXP["Exportaciones"]
  ING -.calidad.-> QA["Calidad de datos + reprocesamiento"]`;

type AnalyticsLayer = {
  capa: string;
  proposito: string;
  latencia: string;
  fuente: string;
};

const ANALYTICS_LAYERS: AnalyticsLayer[] = [
  { capa: "Operativa tiempo real", proposito: "dashboard de sala, ocupación live", latencia: "< 1s", fuente: "DO + D1" },
  { capa: "Transaccional", proposito: "reportes del día, turnos", latencia: "segundos-min", fuente: "D1" },
  { capa: "Agregados precalculados", proposito: "KPIs diarios/mensuales", latencia: "batch (horaria/diaria)", fuente: "events → aggregate" },
  { capa: "Histórica", proposito: "tendencias, comparativas", latencia: "consulta", fuente: "warehouse (R2/D1 read replica)" },
  { capa: "Exportaciones", proposito: "CSV/Excel/BI", latencia: "bajo demanda", fuente: "aggregate + raw" },
];

export function Fase2Analitica() {
  return (
    <Section
      id="f2-analitica"
      index="15"
      eyebrow="Analítica y métricas"
      title="Pipeline de datos alimentado por eventos; agregados reconstruibles."
      intro={
        <>
          Pipeline de datos orientado a eventos que computa métricas: reservas por hora y canal,
          ocupación, duración media del servicio, ticket medio, cancelaciones, no-shows, clientes
          nuevos vs recurrentes, conversión, ROI de campañas y rendimiento del personal. Se
          diferencian cinco capas: métricas operativas en tiempo real, reportes transaccionales,
          analítica histórica, agregados precomputados y exportaciones.
        </>
      }
    >
      {/* Capas de analítica */}
      <div className="mb-12">
        <H3 className="mb-3">Capas de analítica</H3>
        <Lead className="mb-4">
          Cinco capas con propósitos, latencias y fuentes distintas. Mezclarlas es el origen de los
          dashboards que nunca cuadran: cada capa se alimenta de la fuente correcta y se reconcilia
          periódicamente con las demás.
        </Lead>
        <DataTable
          head={["Capa", "Propósito", "Latencia", "Fuente"]}
          rows={ANALYTICS_LAYERS.map((l, i) => [
            <span key={`capa-${i}`} className="font-mono text-[12px] rp-gold-text">
              {l.capa}
            </span>,
            <span key={`prop-${i}`} className="text-foreground/85">
              {l.proposito}
            </span>,
            <span key={`lat-${i}`} className="font-mono text-[11px] text-foreground/85">
              {l.latencia}
            </span>,
            <span key={`fue-${i}`} className="font-mono text-[11px] text-foreground/85">
              {l.fuente}
            </span>,
          ])}
        />
      </div>

      {/* Diagrama de pipeline */}
      <div className="mb-12">
        <H3 className="mb-3">Pipeline de analítica</H3>
        <Lead className="mb-4">
          Los dominios publican eventos vía outbox transaccional; una queue de analítica los
          ingiere, valida y bifurca en proyecciones de tiempo real y agregación batch. El warehouse
          (R2/D1 read replica) sirve consultas históricas y exportaciones. Un canal paralelo de
          calidad detecta duplicados, nulos y dispara reprocesamiento.
        </Lead>
        <Mermaid chart={ANALYTICS_PIPELINE_CHART} />
      </div>

      {/* Métricas iniciales */}
      <GlassCard variant="gold" className="mb-12">
        <H3>Métricas iniciales</H3>
        <Lead className="mt-2">
          Nueve métricas núcleo cubren las preguntas operativas y estratégicas del restaurante. El
          ticket medio requiere POS integrado; sin POS, se omite con un aviso en el dashboard.
        </Lead>
        <div className="mt-5">
          <GoldList
            items={[
              "Reservas por hora y por canal (widget, app, walk-in, phone).",
              "Ocupación por turno y por día (mesas, cubiertos, ratio de uso).",
              "Duración media del servicio (turno completo por mesa).",
              "Ticket medio (si hay POS integrado; opcional).",
              "Cancelaciones y No-shows (absoluto y tasa relativa).",
              "Clientes nuevos vs recurrentes (cohortes semanales/mensuales).",
              "Conversión widget → reserva (embudo completo).",
              "ROI de campañas (atribución por canal y audiencia).",
              "Rendimiento del personal (tiempos de servicio, cobertura de turnos).",
            ]}
          />
        </div>
      </GlassCard>

      {/* Calidad y consistencia */}
      <GlassCard className="mb-12">
        <H3>Calidad y consistencia</H3>
        <Lead className="mt-2">
          Los agregados son una proyección de los eventos. Si los eventos son fieles, los agregados
          cuadran. La regla rectora: toda métrica agregada debe poder reconstruirse desde el log de
          eventos.
        </Lead>
        <div className="mt-5">
          <GoldList
            items={[
              "Zona horaria IANA por local: no se presenta en UTC en dashboards operativos.",
              "Moneda ISO 4217 en minor units: enteros, no floats; conversión al presentar.",
              "Anonimización de PII en agregados: ningún agregado expone PII a nivel individual.",
              "Agregados reconstruibles desde eventos: reprocesamiento si se corrige un evento o la lógica.",
              "Calidad de datos: conteos, nulos, duplicados monitorizados por canal de ingesta.",
              "Consistencia eventual entre tiempo real y agregados: reconciliación periódica programada.",
            ]}
          />
        </div>
      </GlassCard>

      {/* Callout reprocesamiento */}
      <Callout kind="info" title="Reprocesamiento obligatorio">
        Los agregados deben poder reconstruirse desde el log de eventos. Si se detecta un error en
        un evento o en la lógica de agregación, se reprocesa el rango afectado y se reescriben los
        agregados afectados (operación idempotente por <Mono>(aggregate_id, period)</Mono>). No hay
        agregados mágicos que no se puedan rebuild; todo aggregate store es derivado, no
        autoritativo.
      </Callout>
    </Section>
  );
}
