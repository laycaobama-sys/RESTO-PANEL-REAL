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
/*  12 — AUTENTICACIÓN Y PERMISOS                                */
/* ============================================================ */
const AUTH_FLOW_CHART = `sequenceDiagram
  participant U as Usuario
  participant W as Worker (API)
  participant A as Auth Middleware
  participant S as Sesiones (D1)
  participant R as RBAC/ABAC
  participant D as Dominio
  U->>W: Request + cookie sesión
  W->>A: validar sesión
  A->>S: leer sesión (revocada? expirada? dispositivo?)
  S-->>A: sesión válida + user_id + org_activa
  A->>A: resolver tenant (servidor)
  A->>R: verificar permiso (recurso, acción, scope)
  R-->>A: allow/deny
  A->>D: allow → caso de uso
  D-->>W: respuesta
  W-->>U: 200 / 403`;

type SystemRole = {
  rol: string;
  scope: "plataforma" | "organization" | "restaurant/location" | "location";
  desc: string;
  prio: "Imprescindible" | "Importante";
};

const SYSTEM_ROLES: SystemRole[] = [
  { rol: "Super Admin", scope: "plataforma", desc: "Operación global de la plataforma", prio: "Imprescindible" },
  { rol: "Platform Admin", scope: "plataforma", desc: "Gestión operativa de plataforma", prio: "Imprescindible" },
  { rol: "Support", scope: "plataforma", desc: "Soporte con impersonación lectura", prio: "Imprescindible" },
  { rol: "Sales", scope: "plataforma", desc: "Comercial; sin acceso a datos operativos", prio: "Importante" },
  { rol: "Owner", scope: "organization", desc: "Propietario de la organización; todo scope", prio: "Imprescindible" },
  { rol: "Manager", scope: "restaurant/location", desc: "Gestión operativa del local", prio: "Imprescindible" },
  { rol: "Reception", scope: "location", desc: "Host / recepción de reservas", prio: "Imprescindible" },
  { rol: "Waiter", scope: "location", desc: "Servicio de sala", prio: "Importante" },
  { rol: "Kitchen", scope: "location", desc: "Cocina; scope restringido", prio: "Importante" },
  { rol: "Bar", scope: "location", desc: "Bar; scope restringido", prio: "Importante" },
  { rol: "Accountant", scope: "organization", desc: "Facturación y reportes; sin ops", prio: "Importante" },
  { rol: "Marketing", scope: "organization", desc: "CRM, campañas, automatizaciones", prio: "Importante" },
];

type Permission = {
  recurso: string;
  accion: string;
  scope: string;
  notas: string;
};

const PERMISSIONS: Permission[] = [
  { recurso: "reservations", accion: "create/read/update/cancel", scope: "location", notas: "idem_key obligatorio." },
  { recurso: "tables", accion: "assign/release", scope: "location", notas: "coordinado por DO." },
  { recurso: "customers", accion: "read/write/merge/export", scope: "organization", notas: "PII alta." },
  { recurso: "menu", accion: "CRUD", scope: "location", notas: "—" },
  { recurso: "staff", accion: "manage", scope: "location", notas: "no acceso a billing." },
  { recurso: "billing", accion: "read/manage", scope: "organization", notas: "solo Owner/Accountant." },
  { recurso: "reviews", accion: "reply/ai-suggest", scope: "location", notas: "aprobación humana." },
  { recurso: "automations", accion: "CRUD/execute", scope: "organization", notas: "kill switch." },
  { recurso: "api_keys", accion: "manage", scope: "organization", notas: "scoped + rotación." },
  { recurso: "impersonation", accion: "start", scope: "plataforma", notas: "MFA reciente + motivo." },
];

export function Fase1Auth() {
  return (
    <Section
      id="f1-auth"
      index="12"
      eyebrow="Autenticación y permisos"
      title="RBAC + ABAC, MFA, passkeys y sesiones revocables."
      intro={
        <>
          12 roles de sistema más roles personalizados definen quién puede hacer qué en RestoPanel.
          Los permisos son granulares y se acotan por organización, restaurante y local (least privilege).
          La separación entre personal interno y clientes finales es estricta: scopes distintos,
          sesiones distintas, superficies de ataque distintas. RBAC es la base; ABAC añade reglas
          contextuales (turno activo, zona asignada, sensibilidad del recurso, horario) evaluadas
          siempre en servidor, con deny por defecto.
        </>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Stat label="Roles de sistema" value="12" sub="más custom por org" accent="gold" />
        <Stat label="Scopes" value="4" sub="plataforma · org · restaurant · location" accent="teal" />
        <Stat label="Factor por defecto" value="Passkey" sub="WebAuthn; TOTP fallback" accent="fg" />
        <Stat label="Política de cache" value="Por request" sub="no KV como autoridad" accent="fg" />
      </div>

      {/* Tabla de roles */}
      <div className="mb-12">
        <H3 className="mb-3">Roles del sistema</H3>
        <Lead className="mb-4">
          Los 12 roles base cubren el espectro operativo completo. Cada rol fija un scope máximo y
          un conjunto de permisos cerrado; ningún rol puede escapar de su scope por construcción.
        </Lead>
        <DataTable
          head={["Rol", "Scope", "Descripción", "Prioridad"]}
          rows={SYSTEM_ROLES.map((r) => [
            <span key="rol" className="font-mono text-[13px] rp-gold-text">
              {r.rol}
            </span>,
            <Pill key="scope" tone="teal">
              {r.scope}
            </Pill>,
            <span key="desc" className="text-foreground/80">
              {r.desc}
            </span>,
            <Tag key="prio" kind={r.prio}>
              {r.prio}
            </Tag>,
          ])}
        />
      </div>

      {/* Roles personalizados */}
      <GlassCard variant="gold" className="mb-12">
        <H3>Roles personalizados</H3>
        <Lead className="mt-2">
          El Owner compone roles a la medida del negocio, sin escapar de las constraints del
          sistema. Un rol custom nunca puede más que quien lo crea; el resto son garantías
          operativas.
        </Lead>
        <div className="mt-5">
          <GoldList
            items={[
              "Owner puede crear roles con un subconjunto de permisos de los roles base.",
              "Heredan las constraints de scope del rol padre: un rol custom sobre location nunca escapa a organization.",
              "Nunca más privilegio que el creador: el sistema compara el set de permisos y rechaza la creación si excede.",
              "Auditados: toda creación, edición y asignación de roles custom queda en audit_log con actor, motivo y diff de permisos.",
              "Versionados: cada cambio crea una nueva versión del rol; las sesiones activas conservan la versión vigente al emitirse.",
              "Aplicables por org, restaurant o location: el scope de asignación define dónde es válido el rol custom.",
            ]}
          />
        </div>
      </GlassCard>

      {/* Tabla de permisos granulares */}
      <div className="mb-12">
        <H3 className="mb-3">Permisos granulares (ejemplos)</H3>
        <Lead className="mb-4">
          Cada permiso es un par (recurso, acción) acotado por scope. La columna Notas captura la
          invariante de negocio que el permiso hace cumplir en runtime.
        </Lead>
        <DataTable
          head={["Recurso", "Acción", "Scope", "Notas"]}
          rows={PERMISSIONS.map((p) => [
            <span key="recurso" className="font-mono text-[13px] rp-gold-text">
              {p.recurso}
            </span>,
            <span key="accion" className="font-mono text-[12px] text-foreground/85">
              {p.accion}
            </span>,
            <Pill key="scope" tone="teal">
              {p.scope}
            </Pill>,
            <span key="notas" className="text-foreground/75">
              {p.notas}
            </span>,
          ])}
        />
      </div>

      {/* Modelo RBAC + ABAC */}
      <GlassCard className="mb-12">
        <H3>Modelo RBAC + ABAC</H3>
        <Lead className="mt-2">
          RBAC estructura el espacio de permisos; ABAC decide por request en función del contexto.
          La combinación evita tanto el exceso de roles planos como la explosión combinatoria de
          reglas.
        </Lead>
        <div className="mt-5">
          <GoldList
            items={[
              <span key="rbac">
                <strong>RBAC base</strong>: rol → conjunto de permisos. Es la matriz que se cachea y
                la que el Owner edita vía roles custom.
              </span>,
              <span key="abac">
                <strong>ABAC contextual</strong>: reglas por turno activo, zona asignada al staffer,
                sensibilidad del recurso (PII, billing, secrets) y horario.
              </span>,
              <span key="server">
                <strong>Evaluación en servidor por request</strong>: el Worker (middleware de auth)
                resuelve identidad, tenant y permisos antes de invocar el caso de uso.
              </span>,
              <span key="deny">
                <strong>Deny por defecto</strong>: ausencia de permiso explícito = denegación. No hay
                permisos implícitos por rol admin salvo los declarados en la matriz.
              </span>,
              <span key="cache">
                <strong>Cache de permisos en memoria de request</strong>: la matriz resuelta vive en
                el contexto del request; <Mono>KV</Mono> solo cachea config, no es autoridad de
                permisos.
              </span>,
            ]}
          />
        </div>
      </GlassCard>

      {/* Diagrama de flujo de auth */}
      <div className="mb-12">
        <H3 className="mb-3">Flujo de autenticación y autorización</H3>
        <Lead className="mb-4">
          Cada request pasa por la misma cadena: validar sesión, resolver tenant, verificar permiso.
          El dominio solo se ejecuta si todos los pasos previos devuelven allow.
        </Lead>
        <Mermaid chart={AUTH_FLOW_CHART} />
      </div>

      {/* MFA, Passkeys, recuperación */}
      <GlassCard variant="gold">
        <H3>MFA, Passkeys, recuperación</H3>
        <Lead className="mt-2">
          El factor por defecto es WebAuthn (passkeys). TOTP es fallback controlado. La recuperación
          de cuenta es escalonada y rate-limited. Toda sesión y dispositivo es revocable.
        </Lead>
        <div className="mt-5">
          <GoldList
            items={[
              "WebAuthn/passkeys como default: resistente a phishing, sin OTP por SMS.",
              "TOTP fallback controlado: disponible pero desincentivado en UI; exige verificación adicional.",
              "Recovery codes cifrados: generados en setup, almacenados cifrados, nunca logueados ni visualizables dos veces.",
              "Recuperación de cuenta con verificación escalonada (factor + código + grace period) y rate limit estricto.",
              "Revocación de sesiones y dispositivos: el usuario ve su lista de sesiones activas y puede cerrar cualquiera individualmente.",
              "Rotación de tokens: refresh tokens rotan en cada uso; detección de reuso invalida la cadena.",
              "API keys scoped con expiración obligatoria y rotación programada; permisos mínimos por key.",
              "Cuentas de servicio separadas de personas: sin login interactivo, sin MFA personal, scoped a un dominio.",
              "Separación estricta entre personal interno y clientes finales: sesiones, scopes y cookies distintos por tipo de identidad.",
            ]}
          />
        </div>
      </GlassCard>
    </Section>
  );
}

/* ============================================================ */
/*  13 — IMPERSONACIÓN SEGURA                                    */
/* ============================================================ */
const IMPERSONATION_STATE_CHART = `stateDiagram-v2
  [*] --> Solicitada: "staff con permiso + motivo"
  Solicitada --> Verificada: "MFA reciente OK"
  Verificada --> ActivaLectura: "sesión read_only creada"
  ActivaLectura --> ActivaEscritura: "elevación + MFA + motivo"
  ActivaLectura --> Revocada: "expira / kill switch / revocación"
  ActivaEscritura --> Revocada: "expira / kill switch / revocación"
  ActivaEscritura --> ActivaLectura: "fin elevación"
  Revocada --> [*]: "audit cerrado"`;

type ImpersonationReq = {
  req: string;
  impl: string;
  risk: "bajo" | "medio" | "alto" | "crítico";
};

const IMPERSONATION_REQS: ImpersonationReq[] = [
  { req: "Solo personal autorizado", impl: "roles Super Admin/Support con flag impersonation_granted", risk: "alto" },
  { req: "Motivo obligatorio", impl: "texto + ticket opcional; registrado", risk: "medio" },
  { req: "Duración limitada", impl: "expira en minutos; renovación con MFA", risk: "alto" },
  { req: "Solo lectura por defecto", impl: "flag read_only=true; escritura requiere elevación", risk: "alto" },
  { req: "Elevación de escritura", impl: "MFA reciente (<5min) + motivo + scope", risk: "crítico" },
  { req: "Banner permanente", impl: "UI no ocultable en toda la sesión", risk: "alto" },
  { req: "Identidad no ocultable", impl: "actor_real + actor_efectivo en cada acción", risk: "crítico" },
  { req: "Registro íntegro", impl: "audit_log con ambos actores; inmutable", risk: "crítico" },
  { req: "Notificación al propietario", impl: "opcional, configurable por org", risk: "medio" },
  { req: "Historial consultable", impl: "Super Admin ve sesiones de impersonación", risk: "medio" },
  { req: "Revocación inmediata", impl: "kill switch global + por sesión", risk: "crítico" },
  { req: "Protección sensible", impl: "bloqueo de secrets, billing, eliminación", risk: "crítico" },
];

export function Fase1Impersonation() {
  return (
    <Section
      id="f1-impersonation"
      index="13"
      eyebrow="Impersonación segura"
      title="Entrar como… temporal, visible, auditable y revocable."
      intro={
        <>
          El comando <Mono>entrar como…</Mono> existe solo para que el personal autorizado de la
          plataforma pueda asistir a un cliente sin pedirle credenciales. Es una herramienta
          poderosa y por eso está cercada: explícita, temporal, visible, auditable y revocable de
          inmediato. La regla rectora es que ninguna acción durante una impersonación pueda confundirse
          con una acción del propio usuario.
        </>
      }
    >
      {/* Tabla de requisitos */}
      <div className="mb-12">
        <H3 className="mb-3">Requisitos de impersonación</H3>
        <Lead className="mb-4">
          Cada requisito es una garantía operativa. Si falta uno, la impersonación no se inicia; si
          se viola uno en curso, se revoca de inmediato.
        </Lead>
        <DataTable
          head={["Requisito", "Implementación", "Riesgo"]}
          rows={IMPERSONATION_REQS.map((r) => [
            <span key="req" className="font-medium text-foreground">
              {r.req}
            </span>,
            <span key="impl" className="text-foreground/80">
              {r.impl}
            </span>,
            <Risk key="risk" level={r.risk} />,
          ])}
        />
      </div>

      {/* Diagrama de estados */}
      <div className="mb-12">
        <H3 className="mb-3">Ciclo de vida de una sesión de impersonación</H3>
        <Lead className="mb-4">
          Una sesión de impersonación nace como solo lectura y solo asciende a escritura con MFA
          reciente y motivo. Cualquier expiración, kill switch o revocación manual cierra el ciclo y
          sella el audit.
        </Lead>
        <Mermaid chart={IMPERSONATION_STATE_CHART} />
      </div>

      {/* Lo que NUNCA permite */}
      <GlassCard variant="gold" className="mb-12">
        <H3>Lo que la impersonación NUNCA permite</H3>
        <Lead className="mt-2">
          Lista exhaustiva y bloqueada por construcción. Aunque la sesión se eleve a escritura,
          estas acciones siguen prohibidas: la elevación no desbloquea esta lista.
        </Lead>
        <div className="mt-5">
          <GoldList
            items={[
              "Acceder a secretos o claves (API keys, credenciales de integraciones, signing keys).",
              "Modificar billing, planes, facturación o métodos de pago del tenant.",
              "Eliminar organizaciones, restaurantes o datos de clientes (soft delete incluido).",
              "Crear API keys nuevas en nombre del usuario o de la organización.",
              "Desactivar o resetear el MFA del usuario real que se está impersonando.",
              "Ocultar, minimizar o silenciar el banner permanente de impersonación en la UI.",
              "Durar más del límite configurado sin re-MFA explícito del staff que impersona.",
            ]}
          />
        </div>
      </GlassCard>

      {/* Trazabilidad dual */}
      <Callout kind="ok" title="Trazabilidad dual">
        Toda mutación durante una impersonación registra{" "}
        <strong>dos actores</strong>: <Mono>actor_real</Mono> (el miembro del staff que impersona) y{" "}
        <Mono>actor_efectivo</Mono> (el usuario impersonado). El <Mono>audit_log</Mono> es
        append-only e inmutable: ni el staff ni el usuario impersonado pueden alterar el registro a
        posteriori. La sesión propia del usuario impersonado no se ve afectada: la impersonación
        corre en paralelo, sin invalidar ni leer sus cookies personales.
      </Callout>
    </Section>
  );
}

/* ============================================================ */
/*  14 — ESTRATEGIA TIEMPO REAL                                  */
/* ============================================================ */
const DOUBLE_BOOKING_CHART = `sequenceDiagram
  participant C1 as Cliente 1
  participant C2 as Cliente 2
  participant DO as DO (slot lock)
  participant D1 as D1
  participant Q as Queues
  C1->>DO: reservar slot S
  DO->>DO: adquirir lock S
  DO->>D1: INSERT reservation (idem_key)
  D1-->>DO: OK (unique ok)
  DO->>Q: ReservationCreated
  DO-->>C1: confirmada
  C2->>DO: reservar slot S
  DO->>DO: lock S ocupado (o D1 unique violada)
  DO-->>C2: conflicto → alternativa`;

type RealtimeCase = {
  caso: string;
  particion: string;
  canon: string;
  risk: "bajo" | "medio" | "alto" | "crítico";
};

const REALTIME_CASES: RealtimeCase[] = [
  {
    caso: "Plano de mesas / estado de mesas",
    particion: "DO por (location_id + date)",
    canon: "D1 (tables.status, reservations)",
    risk: "alto",
  },
  {
    caso: "Disponibilidad y conflictos de reserva",
    particion: "DO por (location_id + date + shift)",
    canon: "D1 (reservations, slots)",
    risk: "alto",
  },
  {
    caso: "Prevención de doble reserva",
    particion: "DO lock por (location_id + time slot)",
    canon: "D1 unique constraint + DO",
    risk: "crítico",
  },
  {
    caso: "Sincronización entre dispositivos",
    particion: "DO por (location_id + date)",
    canon: "D1",
    risk: "medio",
  },
  {
    caso: "Chat interno",
    particion: "DO por (location_id + conversation)",
    canon: "D1 (messages) append-only",
    risk: "medio",
  },
  {
    caso: "Notificaciones en vivo",
    particion: "DO por user_id",
    canon: "D1 (notifications)",
    risk: "bajo",
  },
  {
    caso: "Presencia (quién está en sala)",
    particion: "DO por location_id",
    canon: "efímero (sin canónico)",
    risk: "bajo",
  },
];

export function Fase1Realtime() {
  return (
    <Section
      id="f1-realtime"
      index="14"
      eyebrow="Estrategia tiempo real"
      title="Durable Objects coordinan; D1 conserva el canónico."
      intro={
        <>
          El tiempo real en RestoPanel sirve al piso de sala (plano de mesas, reservas en vivo,
          estado de mesas), a la sincronización entre dispositivos del local, al chat interno y a
          las notificaciones. Los <strong>Durable Objects</strong> son la unidad de partición y
          coordinación; <strong>D1</strong> conserva el estado canónico del negocio. Un DO puede
          reconstruirse desde D1 tras una desconexión; D1 no depende del DO para ser verdad.
        </>
      }
    >
      {/* Tabla de casos */}
      <div className="mb-12">
        <H3 className="mb-3">Casos de tiempo real</H3>
        <Lead className="mb-4">
          Cada caso declara su unidad de partición (qué DO lo coordina), dónde vive el canónico y
          el riesgo asociado a una pérdida de sincronía. La presencia es el único caso efímero sin
          canónico.
        </Lead>
        <DataTable
          head={["Caso", "Unidad de partición (DO)", "Estado canónico", "Riesgo"]}
          rows={REALTIME_CASES.map((c) => [
            <span key="caso" className="font-medium text-foreground">
              {c.caso}
            </span>,
            <span key="particion" className="font-mono text-[12px] text-foreground/85">
              {c.particion}
            </span>,
            <span key="canon" className="font-mono text-[12px] rp-gold-text">
              {c.canon}
            </span>,
            <Risk key="risk" level={c.risk} />,
          ])}
        />
      </div>

      {/* Relación DO ↔ D1 */}
      <GlassCard variant="gold" className="mb-12">
        <H3>Relación DO ↔ D1</H3>
        <Lead className="mt-2">
          El DO es autoridad efímera de concurrencia y presencia; D1 es verdad durable. La regla es
          que toda mutación de negocio se persista en D1 en la misma operación lógica que la
          coordina el DO.
        </Lead>
        <div className="mt-5">
          <GoldList
            items={[
              "DO coordina concurrencia y mantiene estado efímero de sesión (locks, presencia, pendientes).",
              "Toda mutación de negocio se persiste en D1 en la misma operación lógica (estado + outbox).",
              "DO puede reconstruirse desde D1 tras desconexión: al arrancar, hidrata su estado desde el canónico.",
              "DO NO es la única copia de reservas/mesas: si el DO se pierde, D1 sigue siendo la verdad.",
              "WebSockets vía DO con hibernación: el DO duerme entre eventos para reducir coste.",
              "Reconexión con re-sync desde D1 + delta de eventos: el cliente no pierde estado aunque el DO reinicie.",
            ]}
          />
        </div>
      </GlassCard>

      {/* Prevención de doble reserva */}
      <div className="mb-12">
        <H3 className="mb-3">Prevención de doble reserva</H3>
        <Lead className="mb-4">
          Doble-book es el fallo más caro en un restaurante. La defensa opera en dos capas: el DO
          toma un lock por slot y D1 hace valer un <Mono>UNIQUE</Mono> sobre{" "}
          <Mono>(org_id, location_id, slot, idem_key)</Mono>. Si una capa falla, la otra atrapa el
          conflicto.
        </Lead>
        <Mermaid chart={DOUBLE_BOOKING_CHART} />
      </div>

      {/* Cloudflare Realtime post-validación */}
      <div className="mb-12">
        <Callout kind="warn" title="Cloudflare Realtime, post-validación">
          <strong>Cloudflare Realtime</strong> (WebRTC / SGS) es un producto separado y solo se
          evalúa tras medir madurez, coste y compatibilidad con nuestro stack. La base inicial de
          RestoPanel es <strong>Durable Objects + WebSockets</strong>: probada, alineada con la
          topología de Tenant Cells y suficiente para los siete casos de tiempo real del dominio.
          No asumir Cloudflare Realtime para el MVP; usarlo solo si una fase posterior demuestra
          valor neto.
        </Callout>
      </div>

      {/* Recuperación tras desconexión */}
      <GlassCard>
        <H3>Recuperación tras desconexión</H3>
        <Lead className="mt-2">
          La red de un local real es inestable. El cliente mantiene el último{" "}
          <Mono>event_id</Mono> y al reconectar pide solo el delta; el DO responde desde su log
          efímero o reconstituye desde D1 si hace falta.
        </Lead>
        <div className="mt-5">
          <GoldList
            items={[
              "El cliente mantiene el último event_id recibido en memoria (y opcionalmente en localStorage).",
              "Al reconectar, pide delta desde ese event_id al DO responsable de la unidad de partición.",
              "El DO responde desde su log efímero si los eventos siguen en memoria, o reconstituye desde D1 si se cayeron.",
              "Los conflictos de estado se resuelven siempre por D1 (canónico), nunca por la copia efímera del DO.",
              "Feedback visual de sincronización: el componente SyncStatus muestra conectado / re-sincronizando / offline.",
              "Backoff exponencial en cliente para no inundar al DO durante caídas largas de red.",
            ]}
          />
        </div>
      </GlassCard>
    </Section>
  );
}
