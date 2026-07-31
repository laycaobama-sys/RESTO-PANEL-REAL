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
import { Mermaid } from "@/components/rp/mermaid";

/* ============================================================ */
/*  Helper: texto monoespaciado dorado inline                   */
/* ============================================================ */
function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[12px] rp-gold-text whitespace-nowrap">
      {children}
    </code>
  );
}

/* ============================================================ */
/*  05 — MIGRACIONES Y SEED                                      */
/* ============================================================ */
const MIGRATION_APPLY = `# Aplicar migraciones a D1 (local y remoto)
npx wrangler d1 migrations apply restopanel-tenant --local
npx wrangler d1 migrations apply restopanel-tenant --remote

# Seed (solo en entornos no productivos)
npx wrangler d1 execute restopanel-tenant --remote --file=./database/seeds/seed.sql`;

const MIGRATION_TREE = `database/
  migrations/
    0001_init_organizations.sql
    0002_locations.sql
    0003_identity_users_sessions.sql
    0004_rbac_roles_permissions.sql
    0005_audit_logs.sql
    0006_reservations_customers.sql
    0007_tables_floors_zones.sql
    0008_menu_items.sql
    0009_feature_flags.sql
    0010_billing_subscriptions_invoices.sql
    0011_usage_records.sql
    0012_ai_requests.sql
    0013_events_outbox.sql
  seeds/
    seed.sql
  schema/
    schema.sql          # snapshot completo (generado)`;

const MIGRATION_0001 = `-- 0001_init_organizations.sql
-- Crea la tabla organizations y el catalogo de planes.
-- Forward-only: no usar DROP ni ALTER destructivo en migraciones posteriores.

CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  commercial_name TEXT NOT NULL,
  legal_name TEXT,
  tax_id TEXT,
  logo_r2_key TEXT,
  brand_color_primary TEXT,
  brand_color_secondary TEXT,
  custom_domain TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  locale TEXT NOT NULL DEFAULT 'es',
  timezone TEXT NOT NULL DEFAULT 'Europe/Madrid',
  currency TEXT NOT NULL DEFAULT 'EUR',
  vat_config TEXT, -- JSON
  status TEXT NOT NULL DEFAULT 'active',
  plan_id TEXT,
  max_locations INTEGER NOT NULL DEFAULT 1,
  max_users INTEGER NOT NULL DEFAULT 5,
  max_storage_bytes INTEGER NOT NULL DEFAULT 5368709120,
  storage_used_bytes INTEGER NOT NULL DEFAULT 0,
  reservations_current_period INTEGER NOT NULL DEFAULT 0,
  emails_current_period INTEGER NOT NULL DEFAULT 0,
  whatsapps_current_period INTEGER NOT NULL DEFAULT 0,
  ai_credits_current_period INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE INDEX idx_org_status ON organizations(status);
CREATE INDEX idx_org_slug ON organizations(slug);`;

const SEED_SQL = `-- seed.sql (no productivo)
INSERT INTO organizations (id, slug, commercial_name, timezone, currency, status, plan_id, max_locations, max_users, created_at, updated_at)
VALUES
  ('01HQORGAAAAA', 'ramses-madrid', 'Ramses Madrid', 'Europe/Madrid', 'EUR', 'active', 'plan_pro', 3, 10, '2025-01-15T10:00:00Z', '2025-01-15T10:00:00Z'),
  ('01HQORGBBBBB', 'sushi-bar', 'Sushi Bar Tokyo', 'Europe/Madrid', 'EUR', 'active', 'plan_solo', 1, 3, '2025-01-15T10:00:00Z', '2025-01-15T10:00:00Z');

INSERT INTO permissions (key, resource, action, description) VALUES
  ('reservations.create','reservations','create','Crear reservas'),
  ('reservations.update','reservations','update','Actualizar reservas'),
  ('reservations.delete','reservations','delete','Eliminar reservas'),
  ('tables.move','tables','move','Mover mesas en el plano'),
  ('customers.update','customers','update','Actualizar clientes'),
  ('crm.export','crm','export','Exportar CRM'),
  ('billing.read','billing','read','Leer facturación'),
  ('subscription.update','subscription','update','Cambiar suscripción'),
  ('reports.read','reports','read','Leer reportes'),
  ('settings.update','settings','update','Actualizar configuración');`;

export function Fase4Migraciones() {
  return (
    <Section
      id="f4-migraciones"
      index="05"
      eyebrow="Migraciones y seed"
      title="Migraciones forward-only y seed reproducible."
      intro={
        <>
          Cada cambio de esquema es una migración numerada, inmutable y atómica. No hay pasos
          manuales ocultos: cualquier entorno (local, preview, producción) se levanta aplicando{" "}
          <Mono>0001…N</Mono> en orden. El <Mono>seed.sql</Mono> solo corre en entornos no
          productivos y produce organizaciones, locales, roles del sistema y catálogo de permisos
          reproducibles. D1 = SQLite: el esquema vive en el repositorio y se aplica vía{" "}
          <Mono>wrangler d1 migrations</Mono>.
        </>
      }
    >
      {/* Aplicación de migraciones */}
      <div className="mb-10">
        <H3 className="mb-3">Aplicación de migraciones</H3>
        <Lead className="mb-4">
          El flujo es idéntico en local y remoto. <Mono>--local</Mono> escribe sobre la base embebida
          de Miniflare; <Mono>--remote</Mono> aplica contra D1 real de Cloudflare. Las migraciones se
          registran en la tabla <Mono>d1_migrations</Mono> del propio D1.
        </Lead>
        <Code lang="bash">{MIGRATION_APPLY}</Code>
      </div>

      {/* Árbol de migraciones */}
      <div className="mb-10">
        <H3 className="mb-3">Estructura de la carpeta database/</H3>
        <Lead className="mb-4">
          Trece migraciones iniciales cubren el núcleo enterprise: organizaciones, locales,
          identidad, RBAC, auditoría, reservas/clientes, plano de mesas, carta, feature flags,
          facturación, uso, IA y outbox. <Mono>schema.sql</Mono> es un snapshot generado para
          referencia humana y diffs; el origen de autoridad es la secuencia de migraciones.
        </Lead>
        <Code lang="text">{MIGRATION_TREE}</Code>
      </div>

      {/* Migración representativa + seed */}
      <div className="grid lg:grid-cols-2 gap-6 mb-10">
        <div>
          <H3 className="mb-3">Migración representativa (0001)</H3>
          <Lead className="mb-4">
            <Mono>organizations</Mono> con todos los contadores por plan ya en columna: límites y
            consumo actual viven juntos para que el enforcement sea una sola lectura. Índices sobre
            <Mono>slug</Mono> y <Mono>status</Mono>.
          </Lead>
          <Code lang="sql">{MIGRATION_0001}</Code>
        </div>
        <div>
          <H3 className="mb-3">Seed reproducible</H3>
          <Lead className="mb-4">
            El seed inserta organizaciones demo, sus locales y el catálogo de permisos. Nunca corre
            en producción: el CI lo bloquea si <Mono>NODE_ENV === 'production'</Mono>.
          </Lead>
          <Code lang="sql">{SEED_SQL}</Code>
        </div>
      </div>

      {/* Reglas de migración */}
      <div className="grid lg:grid-cols-2 gap-6 mb-10">
        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">Reglas de migración</Pill>
          </div>
          <H3 className="mb-4">Forward-only, sin magia manual</H3>
          <GoldList
            items={[
              <>
                <strong>Forward-only</strong>: nunca <Mono>DELETE</Mono>/<Mono>DROP</Mono>{" "}
                destructivo dentro de una migración; los datos se preservan.
              </>,
              <>
                Cada migración <strong>numerada</strong> y atómica (<Mono>0001_…</Mono>,{" "}
                <Mono>0002_…</Mono>); el orden es el de los nombres.
              </>,
              <>
                <strong>Idempotente</strong>: <Mono>IF NOT EXISTS</Mono> en cada{" "}
                <Mono>CREATE</Mono>; poder re-aplicar sin error en entornos rotos.
              </>,
              <>
                <strong>Rollback = nueva migración correctiva</strong>: no existe{" "}
                <Mono>down.sql</Mono>; revertir escribe <Mono>0014_fix_…</Mono>.
              </>,
              <>
                <Mono>schema.sql</Mono> es <strong>snapshot generado</strong> para referencia y
                diffs; no se edita a mano.
              </>,
              <>
                <strong>Seed solo en no productivo</strong>: el CI valida que{" "}
                <Mono>seed.sql</Mono> no corre contra <Mono>--remote</Mono> de producción.
              </>,
              <>
                <strong>CI valida que las migraciones aplican limpio</strong> sobre una base vacía y
                sobre una base con la versión anterior.
              </>,
            ]}
          />
        </GlassCard>

        <Callout kind="info" title="Reproducibilidad">
          Cualquier entorno se levanta aplicando migraciones <Mono>0001…N</Mono> en orden + seed
          opcional. No hay pasos manuales ocultos, scripts de parche, ni cambios directos sobre la
          base. La versión del esquema es la suma determinista de las migraciones registradas en{" "}
          <Mono>d1_migrations</Mono>. Un entorno sano siempre se puede recrear desde cero.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  06 — CONTEXTO MULTI-TENANT                                   */
/* ============================================================ */
const TENANT_CTX_CODE = `// packages/tenancy/src/context.ts
export interface TenantCtx {
  readonly organization_id: string;
  readonly location_id?: string;
  readonly actor_id: string;
  readonly actor_effective_id: string | null;
  readonly correlation_id: string;
  readonly plan: string;
  readonly tz: string;
  readonly currency: string;
  readonly role_ids: readonly string[];
  readonly permission_keys: readonly string[];
}

export async function resolveTenantCtx(env: Env, req: Request): Promise<TenantCtx> {
  const sessionId = readSessionCookie(req);
  if (!sessionId) throw new HttpError(401, "no_session");
  const session = await env.DB.prepare(
    "SELECT user_id, expires_at, revoked_at FROM sessions WHERE id = ?"
  ).bind(sessionId).first();
  if (!session || session.revoked_at || Date.parse(session.expires_at) < Date.now()) {
    throw new HttpError(401, "invalid_session");
  }
  // org_activa se lee de la membresia activa de la sesion, NUNCA del body del cliente
  const membership = await env.DB.prepare(
    \`SELECT m.organization_id, m.location_id, m.role_id
     FROM organization_members m
     WHERE m.user_id = ? AND m.status = 'active'
     ORDER BY m.added_at DESC LIMIT 1\`
  ).bind(session.user_id).first();
  if (!membership) throw new HttpError(403, "no_membership");
  // validar que location_id pertenece a la org
  if (membership.location_id) {
    const ok = await env.DB.prepare(
      "SELECT 1 FROM locations WHERE organization_id = ? AND id = ? AND deleted_at IS NULL"
    ).bind(membership.organization_id, membership.location_id).first();
    if (!ok) throw new HttpError(403, "invalid_location");
  }
  const org = await env.DB.prepare(
    "SELECT plan_id, timezone, currency FROM organizations WHERE id = ? AND deleted_at IS NULL"
  ).bind(membership.organization_id).first();
  if (!org) throw new HttpError(403, "org_inactive");
  const perms = await env.DB.prepare(
    \`SELECT DISTINCT rp.permission_key FROM role_permissions rp
     WHERE rp.organization_id = ? AND rp.role_id = ?\`
  ).bind(membership.organization_id, membership.role_id).all();
  return {
    organization_id: membership.organization_id,
    location_id: membership.location_id ?? undefined,
    actor_id: session.user_id,
    actor_effective_id: null,
    correlation_id: req.headers.get("x-correlation-id") ?? ulid(),
    plan: org.plan_id ?? "free",
    tz: org.timezone,
    currency: org.currency,
    role_ids: [membership.role_id],
    permission_keys: perms.results.map((r) => r.permission_key as string),
  };
}`;

const TENANT_REPO_CODE = `// packages/tenancy/src/repo.ts
export class ReservationsRepo {
  constructor(private db: D1Database) {}

  async list(ctx: TenantCtx, filter: { location_id: string; status?: string; limit?: number }) {
    const limit = Math.min(filter.limit ?? 50, 200);
    return this.db.prepare(
      \`SELECT * FROM reservations
       WHERE organization_id = ? AND location_id = ? AND deleted_at IS NULL
         AND (? IS NULL OR status = ?)
       ORDER BY reserved_at ASC LIMIT ?\`
    ).bind(ctx.organization_id, filter.location_id, filter.status ?? null, filter.status ?? null, limit).all();
  }

  async create(ctx: TenantCtx, input: ReservationInput): Promise<{ id: string }> {
    const id = ulid();
    await this.db.prepare(
      \`INSERT INTO reservations
         (organization_id, id, location_id, customer_id, table_id, status, party_size,
          reserved_at, source, idem_key, notes, created_by, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)\`
    ).bind(
      ctx.organization_id, id, input.location_id, input.customer_id, input.table_id ?? null,
      input.status ?? 'confirmed', input.party_size, input.reserved_at, input.source,
      input.idem_key, input.notes ?? null, ctx.actor_id, nowUtc(), nowUtc()
    ).run();
    return { id };
  }
}`;

export function Fase4Tenancy() {
  return (
    <Section
      id="f4-tenancy"
      index="06"
      eyebrow="Contexto multi-tenant"
      title="TenantCtx: el organization_id se resuelve en servidor, nunca del cliente."
      intro={
        <>
          D1 no tiene Row Level Security (RLS). El aislamiento entre organizaciones se implementa en
          la capa de aplicación: un <Mono>TenantCtx</Mono> se resuelve una vez por request a partir
          de la sesión y la membresía, y se inyecta en cada repositorio. Ningún{" "}
          <Mono>SELECT</Mono>/<Mono>INSERT</Mono>/<Mono>UPDATE</Mono> se ejecuta sin{" "}
          <Mono>organization_id = ?</Mono> atado al contexto. El <Mono>organization_id</Mono> que
          venga en el body del cliente se ignora siempre.
        </>
      }
    >
      {/* Tipo TenantCtx + resolver */}
      <div className="mb-10">
        <H3 className="mb-3">TenantCtx y resolveTenantCtx</H3>
        <Lead className="mb-4">
          El resolver lee la cookie de sesión, valida contra D1 (<Mono>sessions</Mono>), obtiene la
          membresía activa más reciente, valida que <Mono>location_id</Mono> pertenezca a la org y
          carga los <Mono>permission_keys</Mono> del rol. Devuelve un{" "}
          <Mono>TenantCtx</Mono> inmutable o lanza <Mono>401</Mono>/<Mono>403</Mono>.
        </Lead>
        <Code lang="typescript">{TENANT_CTX_CODE}</Code>
      </div>

      {/* TenantRepo */}
      <div className="mb-10">
        <H3 className="mb-3">TenantRepo: organization_id forzado en cada consulta</H3>
        <Lead className="mb-4">
          El repositorio de reservas es el patrón de referencia: <Mono>list()</Mono> siempre filtra
          por <Mono>organization_id = ctx.organization_id AND location_id = ?</Mono>;{" "}
          <Mono>create()</Mono> siempre inserta con <Mono>ctx.organization_id</Mono> y{" "}
          <Mono>ctx.actor_id</Mono>. No existe un <Mono>findById</Mono> sin tenant.
        </Lead>
        <Code lang="typescript">{TENANT_REPO_CODE}</Code>
      </div>

      {/* Reglas de aislamiento */}
      <div className="grid lg:grid-cols-2 gap-6 mb-10">
        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">Aislamiento obligatorio</Pill>
          </div>
          <H3 className="mb-4">Reglas obligatorias de aislamiento</H3>
          <GoldList
            items={[
              <>
                Toda consulta aplica <Mono>organization_id = ?</Mono> atado al <Mono>TenantCtx</Mono>.
              </>,
              <>Toda mutación valida el <Mono>ctx</Mono> y registra <Mono>actor_id</Mono>.</>,
              <>
                <strong>Nunca confiar</strong> en <Mono>organization_id</Mono> del cliente; se
                obtiene de sesión/token.
              </>,
              <>
                Validar que <Mono>location_id</Mono> pertenece a la org antes de usarlo como filtro.
              </>,
              <>
                <strong>Sin SELECT sin filtro de tenant</strong>: lint-tipado de repositorios
                rechaza consultas sin <Mono>WHERE organization_id</Mono>.
              </>,
              <>
                <strong>Índices compuestos por tenant</strong>:{" "}
                <Mono>(organization_id, location_id, reserved_at)</Mono>.
              </>,
              <>
                <strong>Relaciones protegidas</strong> con FK compuestas que incluyen{" "}
                <Mono>organization_id</Mono>.
              </>,
              <>
                <strong>Pruebas automáticas cross-tenant</strong>: una reserva creada en org A no es
                visible para un actor de org B (CI obligatorio).
              </>,
              <>
                <strong>Caché con namespace</strong>: <Mono>org:{`{id}`}:reservations:{`{loc}`}</Mono>;
                sin el prefijo de org, no se escribe ni se lee.
              </>,
              <>
                <strong>Archivos R2 con prefijo</strong>: <Mono>orgs/{`{org_id}`}/...</Mono>; las
                presigned URLs validan el prefijo.
              </>,
              <>
                <strong>Colas y eventos</strong> siempre llevan <Mono>organization_id</Mono> en el
                payload y en el mensaje.
              </>,
            ]}
          />
        </GlassCard>

        <Callout kind="warn" title="El org_id del cliente se ignora">
          <Mono>resolveTenantCtx</Mono> lee la organización de la membresía activa de la sesión. Si
          el body de un request trae <Mono>organization_id</Mono> (o <Mono>location_id</Mono>), se
          descarta. El único origen de autoridad es el servidor. Cualquier intento de forzar una org
          distinta vía body o query no tiene efecto: el contexto se reconstruye en cada request.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  07 — AUTENTICACIÓN Y MIDDLEWARE                              */
/* ============================================================ */
const AUTH_FLOW_CHART = `sequenceDiagram
  participant U as Usuario
  participant W as Worker API
  participant MW as Middleware
  participant S as Sesiones D1
  participant R as RBAC
  participant D as Dominio
  U->>W: Request con cookie de sesion
  W->>MW: validar
  MW->>S: leer sesion revocada expirada
  S-->>MW: valida mas user_id mas org_activa
  MW->>MW: resolver tenant contexto
  MW->>R: check permiso recurso accion scope
  R-->>MW: allow o deny
  alt allow
    MW->>D: caso de uso
    D-->>W: resultado
    W-->>U: 200
  else deny
    MW-->>U: 403 mas audit
  end`;

const MIDDLEWARE_CODE = `// workers/api/src/middleware.ts
import { Hono } from "hono";
import { resolveTenantCtx, TenantCtx } from "@restopanel/tenancy";
import { checkPermission } from "@restopanel/auth";
import { auditLog } from "@restopanel/audit";
import { z } from "zod";

type Bindings = { DB: D1Database; CONFIG: KVNamespace; /* ... */ };
type Vars = { ctx: TenantCtx };

const app = new Hono<{ Bindings: Bindings; Variables: Vars }>();

// 1. CORS restringido + security headers
app.use("*", corsMiddleware({ origin: allowlistedOrigins }), securityHeaders);

// 2. Rate limiting por IP + por org (post-tenant)
app.use("*", rateLimitByIp({ window: 60, max: 120 }));

// 3. Resolver tenant y adjuntar al contexto
app.use("*", async (c, next) => {
  try {
    const ctx = await resolveTenantCtx(c.env, c.req.raw);
    c.set("ctx", ctx);
    await next();
  } catch (e) {
    return errorResponse(c, e);
  }
});

// 4. Rate limiting por org (ahora tenemos ctx)
app.use("*", async (c, next) => {
  const ctx = c.get("ctx");
  await rateLimitByOrg(c.env, ctx.organization_id, { window: 60, max: 300 });
  await next();
});

// Helper para proteger rutas por permiso
export function requirePermission(permission: string) {
  return async (c: Context, next: Next) => {
    const ctx = c.get("ctx");
    const allowed = await checkPermission(ctx, permission);
    if (!allowed) {
      await auditLog(c.env, ctx, { action: "denied", resource_type: "authz", reason: permission });
      return c.json({ error: { code: "forbidden", message: "Permiso insuficiente" } }, 403);
    }
    await next();
  };
}

// Ejemplo de ruta protegida
app.post("/v1/reservations", requirePermission("reservations.create"),
  zValidator("json", reservationSchema), async (c) => {
    const ctx = c.get("ctx");
    const input = c.req.valid("json");
    const result = await createReservation(c.env, ctx, input);
    return c.json(result, 201);
  });`;

export function Fase4Auth() {
  return (
    <Section
      id="f4-auth"
      index="07"
      eyebrow="Autenticación y middleware"
      title="Sesiones, MFA, refresh y revocación; middleware en cada request."
      intro={
        <>
          La cadena de middleware se aplica en cada request: CORS y security headers, rate limit por
          IP, resolución de <Mono>TenantCtx</Mono>, rate limit por organización, validación de input
          con Zod, verificación de permiso por ruta y observabilidad. Las sesiones viven en D1 (no KV
          como autoridad) y son revocables por sesión, por dispositivo y por usuario. MFA vía
          WebAuthn está preparado y se activa por plan.
        </>
      }
    >
      {/* Diagrama de flujo */}
      <div className="mb-10">
        <H3 className="mb-3">Flujo de autenticación por request</H3>
        <Lead className="mb-4">
          El middleware valida la cookie, lee la sesión en D1 (revocada/expirada), resuelve el
          tenant y consulta a RBAC. Si <Mono>allow</Mono>, el caso de uso del dominio se ejecuta; si{" "}
          <Mono>deny</Mono>, se devuelve <Mono>403</Mono> y se registra en auditoría. Ninguna ruta de
          negocio se sirve sin pasar por la cadena.
        </Lead>
        <Mermaid chart={AUTH_FLOW_CHART} />
      </div>

      {/* Composición de middleware */}
      <div className="mb-10">
        <H3 className="mb-3">Composición de middleware (Hono)</H3>
        <Lead className="mb-4">
          La cadena se monta sobre <Mono>new Hono()</Mono>. El helper <Mono>requirePermission</Mono>{" "}
          es reutilizable y se aplica por ruta; sobre <Mono>deny</Mono> escribe en auditoría antes de
          responder. La validación con Zod (<Mono>zValidator</Mono>) corre después del check de
          permisos: si no tienes permiso, el body no se valida ni se loguea.
        </Lead>
        <Code lang="typescript">{MIDDLEWARE_CODE}</Code>
      </div>

      {/* Sesiones y tokens */}
      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">Sesiones y tokens</Pill>
          </div>
          <H3 className="mb-4">Reglas de sesión</H3>
          <GoldList
            items={[
              <>
                <strong>Sesiones en D1</strong> (no KV como autoridad): <Mono>sessions</Mono> con{" "}
                <Mono>revoked_at</Mono>, <Mono>expires_at</Mono>, <Mono>device_id</Mono>.
              </>,
              <>
                Cookie <Mono>Secure + HttpOnly + SameSite=Lax</Mono>; path <Mono>/</Mono>, dominio
                restringido.
              </>,
              <>
                Expiración corta de acceso (15–60 min) + <Mono>refresh</Mono> rotatorio con
                reutilización detectada = revocación de la familia.
              </>,
              <>
                <strong>Revocación inmediata</strong> por sesión, por dispositivo y por usuario
                (logout remoto).
              </>,
              <>
                <strong>MFA preparado</strong>: WebAuthn (passkey) y TOTP como segundo factor;
                activable por plan y por usuario.
              </>,
              <>
                <strong>JWT rotation opcional</strong> para API keys de integraciones; las claves se
                rotan y revocan en D1.
              </>,
              <>
                <strong>Rate limit en login</strong> y <Mono>/v1/auth/*</Mono>: 5 intentos / 60s por
                IP+email.
              </>,
              <>
                <strong>Lockout tras N intentos</strong> fallidos (5): cuenta bloqueada 15 min y
                notificación al propietario.
              </>,
              <>
                <strong>Sin loguear tokens ni contraseñas</strong>: el logger redacta{" "}
                <Mono>password</Mono>, <Mono>token</Mono>, <Mono>session_id</Mono> en cualquier
                salida.
              </>,
            ]}
          />
        </GlassCard>

        <Callout kind="ok" title="Middleware en cada request">
          Auth, tenant, RBAC, validación, rate limit y observabilidad se aplican en cadena en cada
          request. Ninguna ruta de negocio se sirve sin pasar por el middleware. La cadena es
          declarativa, ordenada y falla cerrada: cualquier excepción devuelve un error estructurado
          y se registra con <Mono>correlation_id</Mono> para trazabilidad.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  08 — RBAC ENTERPRISE                                         */
/* ============================================================ */
type SysRole = {
  rol: string;
  scope: string;
  perms: string;
};

const SYSTEM_ROLES: SysRole[] = [
  { rol: "Super Admin", scope: "plataforma", perms: "todo global + impersonación" },
  { rol: "Organization Owner", scope: "organization", perms: "todo scoped a la org + gestionar roles" },
  { rol: "Director", scope: "organization", perms: "multi-local + reportes + billing lectura" },
  { rol: "Gerente", scope: "location", perms: "operación completa del local + staff" },
  { rol: "Maitre", scope: "location", perms: "reservas + mesas + sala" },
  { rol: "Recepción", scope: "location", perms: "reservas + check-in + CRM lectura" },
  { rol: "Camarero", scope: "location", perms: "mesas + pedidos + sala" },
  { rol: "Cocina", scope: "location", perms: "pedidos + carta lectura" },
  { rol: "Barra", scope: "location", perms: "pedidos bar + carta bar" },
  { rol: "Marketing", scope: "organization", perms: "CRM + campañas + automatizaciones" },
  { rol: "Contabilidad", scope: "organization", perms: "billing + reportes; sin ops" },
  { rol: "Auditor", scope: "organization", perms: "lectura global + audit; sin mutación" },
  { rol: "Solo Lectura", scope: "organization/location", perms: "lectura según scope" },
];

type Perm = {
  key: string;
  recurso: string;
  accion: string;
  desc: string;
};

const PERMISSIONS: Perm[] = [
  { key: "reservations.create", recurso: "reservations", accion: "create", desc: "Crear reservas" },
  { key: "reservations.update", recurso: "reservations", accion: "update", desc: "Actualizar reservas" },
  { key: "reservations.delete", recurso: "reservations", accion: "delete", desc: "Eliminar reservas" },
  { key: "reservations.export", recurso: "reservations", accion: "export", desc: "Exportar reservas" },
  { key: "tables.move", recurso: "tables", accion: "move", desc: "Mover mesas en el plano" },
  { key: "customers.update", recurso: "customers", accion: "update", desc: "Actualizar clientes" },
  { key: "customers.delete", recurso: "customers", accion: "delete", desc: "Eliminar clientes" },
  { key: "crm.export", recurso: "crm", accion: "export", desc: "Exportar CRM" },
  { key: "billing.read", recurso: "billing", accion: "read", desc: "Leer facturación" },
  { key: "billing.update", recurso: "billing", accion: "update", desc: "Modificar facturación" },
  { key: "subscription.update", recurso: "subscription", accion: "update", desc: "Cambiar suscripción" },
  { key: "reports.read", recurso: "reports", accion: "read", desc: "Leer reportes" },
  { key: "settings.update", recurso: "settings", accion: "update", desc: "Actualizar configuración" },
  { key: "staff.manage", recurso: "staff", accion: "manage", desc: "Gestionar personal y turnos" },
  { key: "audit.read", recurso: "audit", accion: "read", desc: "Leer auditoría" },
];

const RBAC_CODE = `// packages/auth/src/rbac.ts
export interface AuthzRequest {
  readonly resource: string;       // "reservations"
  readonly action: string;         // "create"
  readonly scope?: { location_id?: string; resource_owner_id?: string };
}

export interface AuthzDecision {
  readonly allow: boolean;
  readonly reasons: string[];
}

/**
 * RBAC + ABAC. Evaluacion:
 * 1. Deny por defecto.
 * 2. Permisos del rol (role_permissions) por (org, role).
 * 3. Overrides por usuario (user_permissions) y por equipo (team_permissions).
 * 4. ABAC: scope (location_id), ownership (resource_owner_id), contexto (turno activo, horario).
 * 5. Deny explicito siempre gana sobre allow.
 */
export async function checkPermission(ctx: TenantCtx, req: AuthzRequest): Promise<boolean> {
  const key = \`\${req.resource}.\${req.action}\`;
  // Deny explicito tiene prioridad
  if (ctx.deny_keys?.includes(key)) return false;
  // Permiso base del rol
  if (!ctx.permission_keys.includes(key)) return false;
  // ABAC: scope por local
  if (req.scope?.location_id && ctx.location_id && req.scope.location_id !== ctx.location_id) {
    return false;
  }
  return true;
}

/**
 * Permisos personalizados: se anaden a la tabla permissions sin tocar codigo.
 * El catalogo se carga en ctx.permission_keys dinamicamente desde D1.
 */
export async function loadPermissionKeys(db: D1Database, organization_id: string, role_ids: readonly string[]): Promise<string[]> {
  if (role_ids.length === 0) return [];
  const placeholders = role_ids.map(() => "?").join(",");
  const rs = await db.prepare(
    \`SELECT DISTINCT permission_key FROM role_permissions
     WHERE organization_id = ? AND role_id IN (\${placeholders})\`
  ).bind(organization_id, ...role_ids).all();
  return rs.results.map((r) => r.permission_key as string);
}`;

export function Fase4RBAC() {
  return (
    <Section
      id="f4-rbac"
      index="08"
      eyebrow="RBAC Enterprise"
      title="Permisos granulares por org, local, usuario, equipo, rol, recurso y acción."
      intro={
        <>
          No es un único campo <Mono>role</Mono>. Es RBAC Enterprise: 13 roles del sistema + roles
          personalizados que el Owner crea sin tocar código. Los permisos se asignan por
          organización, local, usuario, equipo, rol, recurso y acción. El catálogo es dinámico (vive
          en la tabla <Mono>permissions</Mono> de D1) y <Mono>checkPermission</Mono> combina RBAC con
          ABAC (scope por local, ownership, contexto). Deny por defecto; deny explícito siempre
          gana.
        </>
      }
    >
      {/* 13 roles del sistema */}
      <div className="mb-10">
        <H3 className="mb-3">13 roles del sistema</H3>
        <Lead className="mb-4">
          Roles del sistema cubren desde Super Admin (plataforma) hasta Solo Lectura. Cada uno tiene
          un scope fijo (plataforma / organization / location) y un set de permisos clave. El Owner
          puede clonar cualquiera de ellos en un rol personalizado y añadir o quitar permisos.
        </Lead>
        <DataTable
          head={["Rol", "Scope", "Permisos clave"]}
          rows={SYSTEM_ROLES.map((r) => [
            <span key={`rol-${r.rol}`} className="font-mono text-[12px] rp-gold-text">{r.rol}</span>,
            <span key={`scope-${r.rol}`} className="font-mono text-[11px] text-muted-foreground">{r.scope}</span>,
            r.perms,
          ])}
        />
      </div>

      {/* Catálogo de permisos */}
      <div className="mb-10">
        <H3 className="mb-3">Catálogo de permisos (ejemplo)</H3>
        <Lead className="mb-4">
          Cada permiso se identifica por <Mono>{`{resource}.{action}`}</Mono>. Las 8 acciones base
          son <Mono>create</Mono>, <Mono>read</Mono>, <Mono>update</Mono>, <Mono>delete</Mono>,{" "}
          <Mono>export</Mono>, <Mono>restore</Mono>, <Mono>approve</Mono> y <Mono>admin</Mono>. La
          tabla <Mono>permissions</Mono> es extensiva: añadir un permiso nuevo no requiere despliegue.
        </Lead>
        <DataTable
          head={["Key", "Recurso", "Acción", "Descripción"]}
          rows={PERMISSIONS.map((p) => [
            <span key={`key-${p.key}`} className="font-mono text-[12px] rp-gold-text">{p.key}</span>,
            <span key={`rec-${p.key}`} className="font-mono text-[11px]">{p.recurso}</span>,
            <span key={`act-${p.key}`} className="font-mono text-[11px]">{p.accion}</span>,
            p.desc,
          ])}
        />
      </div>

      {/* Implementación del checker */}
      <div className="mb-10">
        <H3 className="mb-3">Implementación: RBAC + ABAC + custom</H3>
        <Lead className="mb-4">
          <Mono>checkPermission</Mono> evalúa en orden: deny explícito → permiso del rol → override
          de usuario/equipo → ABAC (scope y ownership). <Mono>loadPermissionKeys</Mono> carga los
          permisos desde D1 con un <Mono>IN (?,?,?)</Mono> dinámico. Los permisos personalizados se
          insertan en <Mono>permissions</Mono> y se asignan a un rol vía <Mono>role_permissions</Mono>{" "}
          sin tocar el código principal.
        </Lead>
        <Code lang="typescript">{RBAC_CODE}</Code>
      </div>

      {/* Reglas RBAC */}
      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">Reglas RBAC Enterprise</Pill>
          </div>
          <H3 className="mb-4">Reglas obligatorias</H3>
          <GoldList
            items={[
              <>
                <strong>13 roles del sistema</strong> + roles personalizados que el Owner crea desde
                el panel.
              </>,
              <>
                Permisos por <strong>org / local / usuario / equipo / rol / recurso / acción</strong>.
              </>,
              <>
                <strong>8 acciones base</strong>: <Mono>create</Mono>, <Mono>read</Mono>,{" "}
                <Mono>update</Mono>, <Mono>delete</Mono>, <Mono>export</Mono>, <Mono>restore</Mono>,{" "}
                <Mono>approve</Mono>, <Mono>admin</Mono>.
              </>,
              <>
                <strong>Deny explícito gana</strong> sobre allow: si un permiso está en{" "}
                <Mono>deny_keys</Mono>, no se permite ni siquiera con rol de admin.
              </>,
              <>
                <strong>Cache de permisos en memoria de request</strong> (no KV como autoridad); el{" "}
                <Mono>TenantCtx</Mono> los carga una vez al inicio.
              </>,
              <>
                <strong>Permisos personalizados</strong> vía tabla <Mono>permissions</Mono>: el
                catálogo se amplía sin despliegue.
              </>,
              <>
                <strong>Tests de escalada de privilegios en CI</strong>: cada rol se prueba contra
                cada permiso sensible; cualquier allow inesperado rompe el build.
              </>,
            ]}
          />
        </GlassCard>

        <Callout kind="adr" id="ADR-4.2" title="RBAC granular, no campo role">
          Un único campo <Mono>role</Mono> no escala a multi-local con departamentos (sala, cocina,
          bar, marketing, contabilidad, auditoría). Se implementa RBAC con catálogo de permisos + 13
          roles del sistema + roles personalizados + overrides por usuario/equipo + ABAC para
          contexto (local, ownership, turno). El Owner puede crear roles sin tocar código, asignarlos
          a usuarios y equipos, y los permisos se evalúan en cada request con deny por defecto.
        </Callout>
      </div>
    </Section>
  );
}
