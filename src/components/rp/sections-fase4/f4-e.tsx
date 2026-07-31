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

/* ============================================================ */
/*  Helper: texto monoespaciado dorado                          */
/* ============================================================ */
function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-xs rp-gold-text whitespace-nowrap">{children}</code>
  );
}

/* ============================================================ */
/*  18 — TESTS DE AISLAMIENTO, RBAC Y CONCURRENCIA              */
/* ============================================================ */
const TESTING_STRATEGY: { nivel: string; cubre: string; cuando: string; tool: string }[] = [
  { nivel: "Unit", cubre: "casos de uso, validación Zod, repositorios (mock D1)", cuando: "cada commit", tool: "vitest" },
  { nivel: "Integración", cubre: "dominio + D1 (Miniflare/cloudflare:test)", cuando: "cada PR", tool: "vitest + cloudflare:test" },
  { nivel: "Aislamiento", cubre: "cross-tenant negativos (A no ve B)", cuando: "cada PR (obligatorio)", tool: "vitest" },
  { nivel: "IDOR", cubre: "por endpoint crítico", cuando: "cada PR", tool: "vitest" },
  { nivel: "RBAC", cubre: "escalada de privilegios", cuando: "cada PR", tool: "vitest" },
  { nivel: "Concurrencia", cubre: "doble reserva via DO", cuando: "cada PR", tool: "vitest + DO" },
  { nivel: "E2E", cubre: "flujos críticos (alta, reserva, check-in, billing)", cuando: "nocturno", tool: "playwright" },
  { nivel: "Carga", cubre: "reservas concurrentes, DO contención", cuando: "pre-deploy", tool: "k6" },
  { nivel: "Seguridad", cubre: "SAST, secret scan, DAST, dependencias", cuando: "CI + pre-prod", tool: "CodeQL, snyk, owasp" },
];

const ISOLATION_TEST = `// packages/reservations/tests/isolation.test.ts
import { env } from "cloudflare:test";
import { describe, it, expect, beforeAll } from "vitest";

describe("aislamiento multi-tenant (reservations)", () => {
  beforeAll(async () => {
    // Seed: dos organizaciones con una reserva cada una
    await env.DB.prepare(
      \`INSERT INTO organizations (id, slug, commercial_name, timezone, currency, status, max_locations, max_users, created_at, updated_at)
       VALUES ('01HQTESTORG1','test-org-1','Test 1','Europe/Madrid','EUR','active',1,3,'2025-01-01T00:00:00Z','2025-01-01T00:00:00Z'),
              ('01HQTESTORG2','test-org-2','Test 2','Europe/Madrid','EUR','active',1,3,'2025-01-01T00:00:00Z','2025-01-01T00:00:00Z')\`
    ).run();
    await env.DB.prepare(
      \`INSERT INTO reservations (organization_id, id, location_id, customer_id, status, party_size, reserved_at, source, idem_key, created_by, created_at, updated_at)
       VALUES ('01HQTESTORG1','01HQRESAAAA','loc1','cust1','confirmed',4,'2025-02-01T20:00:00Z','dashboard','k1','u1','2025-01-01T00:00:00Z','2025-01-01T00:00:00Z')\`
    ).run();
  });

  it("org A no puede leer reserva de org B", async () => {
    const repo = new ReservationsRepo(env.DB);
    const ctxA = makeCtx({ organization_id: "01HQTESTORG1" });
    const ctxB = makeCtx({ organization_id: "01HQTESTORG2" });

    const fromA = await repo.findById(ctxA, "01HQRESAAAA");
    const fromB = await repo.findById(ctxB, "01HQRESAAAA");

    expect(fromA).not.toBeNull();      // A ve la suya
    expect(fromB).toBeNull();          // B NO ve la de A
  });

  it("org B no puede mutar reserva de org A", async () => {
    const repo = new ReservationsRepo(env.DB);
    const ctxB = makeCtx({ organization_id: "01HQTESTORG2" });
    await repo.softDelete(ctxB, "01HQRESAAAA"); // intenta borrar la de A
    const stillThere = await repo.findById(makeCtx({ organization_id: "01HQTESTORG1" }), "01HQRESAAAA");
    expect(stillThere?.deleted_at).toBeNull(); // no se borró
  });
});`;

const RBAC_TEST = `// packages/auth/tests/rbac.test.ts
describe("RBAC: prevención de escalada de privilegios", () => {
  it("recepción no puede exportar CRM", async () => {
    const ctx = makeCtx({
      organization_id: "01HQTESTORG1",
      role_id: "role_reception",
      permission_keys: ["reservations.create", "reservations.update", "customers.read"],
    });
    const allowed = await checkPermission(ctx, { resource: "crm", action: "export" });
    expect(allowed).toBe(false);
  });

  it("gerente de local A no puede operar local B", async () => {
    const ctx = makeCtx({
      organization_id: "01HQTESTORG1",
      location_id: "locA",
      permission_keys: ["reservations.create"],
    });
    const allowed = await checkPermission(ctx, {
      resource: "reservations", action: "create", scope: { location_id: "locB" },
    });
    expect(allowed).toBe(false);
  });

  it("rol personalizado no supera privilegios del creador", async () => {
    // Owner crea rol custom con subset de permisos; nunca más privilegio que Owner
    const custom = await createCustomRole(env, ownerCtx, { name: "Host Senior", perms: ["reservations.create"] });
    const customCtx = makeCtx({ organization_id: ownerCtx.organization_id, role_id: custom.id, permission_keys: ["reservations.create"] });
    expect(await checkPermission(customCtx, { resource: "billing", action: "update" })).toBe(false);
  });
});`;

const CONCURRENCY_TEST = `// workers/realtime/tests/concurrency.test.ts
describe("concurrencia: doble reserva imposible", () => {
  it("dos clientes no reservan el mismo slot simultáneamente", async () => {
    const doId = env.FLOOR.idFromName("01HQTESTORG1:loc1:2025-02-01");
    const stub = env.FLOOR.get(doId);

    const slot = "2025-02-01T20:00:00Z";
    const [r1, r2] = await Promise.all([
      stub.fetch(\`http://x/lock-slot\`, { method: "POST", body: JSON.stringify({ slot, hold_seconds: 30 }) }),
      stub.fetch(\`http://x/lock-slot\`, { method: "POST", body: JSON.stringify({ slot, hold_seconds: 30 }) }),
    ]);

    const j1 = await r1.json();
    const j2 = await r2.json();
    // Exactamente uno de los dos gana el lock
    expect([j1.ok, j2.ok].filter(Boolean).length).toBe(1);
  });
});`;

export function Fase4Tests() {
  return (
    <Section
      id="f4-tests"
      index="18"
      eyebrow="Tests de aislamiento, RBAC y concurrencia"
      title="Tests automatizados que prueban aislamiento, permisos y concurrencia."
      intro={
        <>
          Los tests son obligatorios en CI y bloquean el merge si fallan. Cada endpoint tenant
          tiene un test cross-tenant negativo; cada repositorio un test IDOR; cada ruta protegida
          un test de permiso (allow + deny); cada operación concurrente un test de contención. No
          se asume el aislamiento: se prueba activamente intentando acceder a datos de otro tenant,
          escalar privilegios y doble-reservar el mismo slot.
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Pill tone="gold">aislamiento</Pill>
            <H3>Cross-tenant: org A no ve ni muta org B</H3>
          </div>
          <Code lang="typescript">{ISOLATION_TEST}</Code>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Pill tone="gold">RBAC</Pill>
            <H3>Escalada de privilegios imposibilitada</H3>
          </div>
          <Code lang="typescript">{RBAC_TEST}</Code>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Pill tone="teal">concurrencia</Pill>
            <H3>Doble reserva imposible vía Durable Object</H3>
          </div>
          <Code lang="typescript">{CONCURRENCY_TEST}</Code>
        </div>
      </div>

      <div className="mt-12">
        <H3 className="mb-4">Estrategia de testing</H3>
        <DataTable
          head={["Nivel", "Qué cubre", "Cuándo", "Tooling"]}
          rows={TESTING_STRATEGY.map((t) => [
            <span key={`nivel-${t.nivel}`}>
              <Mono>{t.nivel}</Mono>
            </span>,
            <span key={`cubre-${t.nivel}`} className="text-foreground/80">
              {t.cubre}
            </span>,
            <span key={`cuando-${t.nivel}`} className="text-foreground/70">
              {t.cuando}
            </span>,
            <span key={`tool-${t.nivel}`} className="font-mono text-xs text-foreground/80">
              {t.tool}
            </span>,
          ])}
        />
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-5 items-start">
        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">CI gate</Pill>
            <H3>Tests obligatorios en CI</H3>
          </div>
          <GoldList
            items={[
              "Por cada endpoint tenant: test cross-tenant negativo.",
              "Por cada repositorio: test IDOR (no access por id de otro tenant).",
              "Por cada ruta protegida: test de permiso (allow + deny).",
              "Por cada operación concurrente: test de contención (DO lock + unique constraint).",
              "CI rojo bloquea merge: ningún bypass manual por revisor.",
              "Cobertura mínima en dominios críticos (reservas, billing, auth, tenancy).",
            ]}
          />
        </GlassCard>

        <Callout kind="ok" title="Aislamiento verificado por test, no por fe">
          El aislamiento multi-tenant se prueba con tests que intentan activamente acceder a datos
          de otro tenant. Si el test pasa, el aislamiento funciona. Si falla, CI bloquea. No se
          asume: se demuestra con un caso negativo que ejercita el repositorio con un contexto
          forzado de otra organización y verifica que devuelve <Mono>null</Mono> o lanza
          <Mono> not_found</Mono>.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  19 — SEGURIDAD AVANZADA                                     */
/* ============================================================ */
type ControlF4 = {
  id: string;
  control: string;
  impl: string;
  riesgo: "bajo" | "medio" | "alto" | "crítico";
};

const CONTROLES_F4: ControlF4[] = [
  { id: "zod", control: "Validación estricta", impl: "Zod en frontera de API; sin trust en cliente", riesgo: "medio" },
  { id: "sqli", control: "SQL Injection", impl: "consultas parametrizadas; sin SQL dinámico", riesgo: "medio" },
  { id: "xss", control: "XSS", impl: "escape + CSP con nonces", riesgo: "medio" },
  { id: "csrf", control: "CSRF", impl: "tokens anti-CSRF; SameSite=Lax", riesgo: "medio" },
  { id: "rl", control: "Rate limiting", impl: "WAF + por IP + por org; 429 con Retry-After", riesgo: "medio" },
  { id: "bot", control: "Bot protection", impl: "Turnstile en widget y login", riesgo: "bajo" },
  { id: "jwt", control: "JWT rotation", impl: "access corto + refresh rotativo", riesgo: "medio" },
  { id: "refresh", control: "Refresh tokens", impl: "almacenados hash; rotación; revocación", riesgo: "alto" },
  { id: "revoke", control: "Revocación de sesiones", impl: "por sesión y por dispositivo", riesgo: "alto" },
  { id: "mfa", control: "MFA", impl: "WebAuthn/TPP preparado", riesgo: "alto" },
  { id: "csp", control: "CSP", impl: "nonces por request; sin unsafe-inline", riesgo: "medio" },
  { id: "hdr", control: "Security headers", impl: "HSTS, X-Content-Type-Options, Referrer-Policy", riesgo: "bajo" },
  { id: "sec", control: "Secretos", impl: "fuera de código; wrangler secrets; rotación", riesgo: "alto" },
  { id: "enc", control: "Cifrado sensible", impl: "R2 SSE; secretos en KV secrets", riesgo: "bajo" },
  { id: "idor", control: "Control por recurso", impl: "ownership verificado (anti-IDOR)", riesgo: "crítico" },
  { id: "logs", control: "Logs de seguridad", impl: "sin tokens/contraseñas; redacción PII", riesgo: "medio" },
  { id: "idem", control: "Idempotencia", impl: "idem_key en operaciones críticas", riesgo: "medio" },
  { id: "wh", control: "Webhooks", impl: "firma HMAC + timestamp anti replay", riesgo: "alto" },
  { id: "replay", control: "Anti replay", impl: "ventana 5 min; nonce dedup", riesgo: "medio" },
  { id: "esc", control: "Anti escalada", impl: "RBAC + ABAC; deny por defecto", riesgo: "crítico" },
  { id: "cors", control: "CORS", impl: "allowlist de orígenes; no wildcard", riesgo: "medio" },
  { id: "pii", control: "Datos públicos/privados", impl: "separación clara; sin PII en público", riesgo: "alto" },
];

const SECURITY_HEADERS = `// workers/api/src/middleware/security.ts
import { v4 as uuid } from "uuid";

export function securityHeaders(c: Context, next: Next) {
  const nonce = uuid();
  c.header("Content-Security-Policy",
    \`default-src 'self'; script-src 'self' 'nonce-\${nonce}'; \` +
    \`style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; \` +
    \`connect-src 'self' https://api.stripe.com; frame-ancestors 'none'; base-uri 'self'\`);
  c.header("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  c.set("cspNonce", nonce);
  return next();
}`;

export function Fase4Seguridad() {
  return (
    <Section
      id="f4-seguridad"
      index="19"
      eyebrow="Seguridad avanzada"
      title="Hardening, headers, rate limiting y prevención de ataques comunes."
      intro={
        <>
          La seguridad se aplica en capas: validación estricta en la frontera de la API con Zod,
          consultas parametrizadas en D1 (nunca SQL dinámico), CSP con nonces por request,
          rate limiting por IP y por organización, JWT de acceso corto con refresh rotativo y
          revocable, y verificación de ownership en cada recurso para impedir IDOR. La regla
          operativa es deny por defecto: si no hay permiso explícito, se rechaza.
        </>
      }
    >
      <div className="mb-10">
        <H3 className="mb-4">Controles de seguridad</H3>
        <DataTable
          head={["Control", "Implementación", "Riesgo"]}
          rows={CONTROLES_F4.map((c) => [
            <span key={`ctrl-${c.id}`}>
              <Mono>{c.control}</Mono>
            </span>,
            <span key={`impl-${c.id}`} className="text-foreground/80">
              {c.impl}
            </span>,
            <Risk key={`risk-${c.id}`} level={c.riesgo} />,
          ])}
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Pill tone="gold">middleware</Pill>
          <H3>Security headers + CSP con nonce por request</H3>
        </div>
        <Code lang="typescript">{SECURITY_HEADERS}</Code>
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-5 items-start">
        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">reglas</Pill>
            <H3>Reglas de seguridad</H3>
          </div>
          <GoldList
            items={[
              "Deny por defecto en autorización: sin permiso explícito, se rechaza.",
              "Validación Zod en cada endpoint; el cliente nunca se considera confiable.",
              "Consultas parametrizadas en D1: nunca concatenar SQL con input.",
              "CSP con nonces por request; sin 'unsafe-inline' en script-src.",
              "CORS allowlist de orígenes; nunca wildcard en producción.",
              "Secretos en wrangler secrets: nunca en código, KV plano ni frontend.",
              "Logs sin tokens, contraseñas ni PII cruda; redacción por allowlist.",
              "Rate limit por IP y por org; 429 con Retry-After.",
              "Turnstile en superficies públicas (widget de reservas, login).",
              "Webhooks firmados con HMAC + ventana anti replay de 5 min.",
            ]}
          />
        </GlassCard>

        <Callout kind="warn" title="Errores no exponen info sensible">
          Las respuestas de error usan un formato normalizado{" "}
          <Mono>{`{error:{code,message,details,request_id}}`}</Mono> sin stack traces, sin nombres
          de tabla, sin valores internos. Los 500 se loguean con correlation_id; el cliente recibe
          solo el request_id para que soporte pueda cruzarlo con los logs internos. Nunca se filtra
          estructura de base de datos ni rutas de código en respuestas públicas.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  20 — OBSERVABILIDAD                                          */
/* ============================================================ */
type PilarObs = { id: string; pilar: string; impl: string; notas: string };

const PILARES_OBS: PilarObs[] = [
  { id: "logs", pilar: "Logs estructurados", impl: "JSON en Workers; redacción PII por allowlist", notas: "retención por entorno" },
  { id: "metrics", pilar: "Métricas", impl: "counters, histograms por dominio", notas: "Cloudflare Analytics + warehouse" },
  { id: "traces", pilar: "Trazas", impl: "correlation_id por request; propagado a queues/DO", notas: "end-to-end" },
  { id: "audit", pilar: "Audit logs", impl: "append-only D1 + archivo R2", notas: "retención larga" },
  { id: "alerts", pilar: "Alertas", impl: "SLO burn, error rate, latencia, coste", notas: "routing por severidad" },
  { id: "health", pilar: "Health checks", impl: "por servicio y por integración", notas: "status page" },
];

const LOGGER_CODE = `// packages/observability/src/logger.ts
const ALLOWED_KEYS = new Set(["organization_id", "location_id", "action", "result", "duration_ms", "model", "scope"]);

export function log(level: "info" | "warn" | "error", msg: string, meta: Record<string, unknown> = {}) {
  const redacted: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    redacted[k] = ALLOWED_KEYS.has(k) ? v : "[redacted]";
  }
  console.log(JSON.stringify({
    level, msg, ts: new Date().toISOString(), ...redacted,
  }));
}

export function withCorrelation(headers: Headers): string {
  return headers.get("x-correlation-id") ?? ulid();
}`;

export function Fase4Observabilidad() {
  return (
    <Section
      id="f4-observabilidad"
      index="20"
      eyebrow="Observabilidad"
      title="Logs redactados, métricas, trazas y health checks."
      intro={
        <>
          Cada request genera un correlation_id que se propaga a colas, Durable Objects y
          integraciones externas. Los logs son JSON estructurado con redacción por allowlist: las
          claves no listadas se reemplazan por <Mono>[redacted]</Mono>. Las métricas se emiten por
          dominio y por organización para facturación y margen. El SLO del núcleo es 99.9% con
          error budget explícito y alertas por burn rate.
        </>
      }
    >
      <div className="mb-10">
        <H3 className="mb-4">Pilares de observabilidad</H3>
        <DataTable
          head={["Pilar", "Implementación", "Notas"]}
          rows={PILARES_OBS.map((p) => [
            <span key={`pilar-${p.id}`}>
              <Mono>{p.pilar}</Mono>
            </span>,
            <span key={`impl-${p.id}`} className="text-foreground/80">
              {p.impl}
            </span>,
            <span key={`notas-${p.id}`} className="text-foreground/70">
              {p.notas}
            </span>,
          ])}
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Pill tone="teal">logger</Pill>
          <H3>Log estructurado + correlation_id por request</H3>
        </div>
        <Code lang="typescript">{LOGGER_CODE}</Code>
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-5 items-start">
        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">reglas</Pill>
            <H3>Reglas de observabilidad</H3>
          </div>
          <GoldList
            items={[
              "Todo request genera correlation_id y se propaga a queues, DO y webhooks.",
              "Logs en JSON con redacción por allowlist (nunca tokens, contraseñas, PII cruda).",
              "Métricas por dominio y por org (throughput, latencia, errores).",
              "SLO 99.9% en núcleo con error budget explícito y revisión semanal.",
              "Alertas por SLO burn rate, error rate, latencia p95 y coste.",
              "Health checks por servicio y por integración (Stripe, Resend, WhatsApp, Google).",
              "Status page pública para incidentes y mantenimiento programado.",
              "Coste por org trackeado: alimenta billing y márgenes de plataforma.",
            ]}
          />
        </GlassCard>

        <div className="grid grid-cols-2 gap-3 self-stretch">
          <Stat label="SLO núcleo" value="99.9%" sub="error budget explícito" accent="gold" />
          <Stat label="RPO" value="≤ 15 min" sub="snapshot + outbox" accent="teal" />
          <Stat label="RTO" value="≤ 2 h" sub="restore + redeploy" accent="gold" />
          <Stat label="Logs" value="Sin PII" sub="redacción por allowlist" accent="fg" />
        </div>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  21 — DESPLIEGUE Y VARIABLES DE ENTORNO                      */
/* ============================================================ */
const DEPLOY_SEQ = `# 1. Aplicar migraciones a D1 (remoto)
npx wrangler d1 migrations apply restopanel-tenant --remote

# 2. Subir secrets (una vez por entorno; rotación documentada)
npx wrangler secret put STRIPE_SECRET_KEY --env production
npx wrangler secret put STRIPE_WEBHOOK_SECRET --env production
npx wrangler secret put SESSION_SECRET --env production
npx wrangler secret put AI_GATEWAY_KEY --env production

# 3. Publicar workers
npx wrangler deploy --env production

# 4. Smoke test post-deploy
bun run scripts/smoke-prod.ts`;

type EnvVar = { id: string; variable: string; proposito: string; donde: string };

const ENV_VARS: EnvVar[] = [
  { id: "stripe-sk", variable: "STRIPE_SECRET_KEY", proposito: "cobros", donde: "wrangler secret" },
  { id: "stripe-wh", variable: "STRIPE_WEBHOOK_SECRET", proposito: "verificar webhooks", donde: "wrangler secret" },
  { id: "session", variable: "SESSION_SECRET", proposito: "firmar cookies", donde: "wrangler secret" },
  { id: "aigw", variable: "AI_GATEWAY_KEY", proposito: "AI Gateway", donde: "wrangler secret" },
  { id: "resend", variable: "RESEND_API_KEY", proposito: "email transaccional", donde: "wrangler secret" },
  { id: "wa-tok", variable: "WHATSAPP_TOKEN", proposito: "WhatsApp Cloud API", donde: "wrangler secret" },
  { id: "wa-vt", variable: "WHATSAPP_VERIFY_TOKEN", proposito: "verificación webhook", donde: "wrangler secret" },
  { id: "gcid", variable: "GOOGLE_OAUTH_CLIENT_ID", proposito: "Google integrations", donde: "wrangler secret" },
  { id: "gsec", variable: "GOOGLE_OAUTH_CLIENT_SECRET", proposito: "Google integrations", donde: "wrangler secret" },
  { id: "env", variable: "ENV", proposito: "dev/staging/production", donde: "wrangler.toml [vars]" },
  { id: "ver", variable: "APP_VERSION", proposito: "versionado", donde: "wrangler.toml [vars]" },
];

export function Fase4Deploy() {
  return (
    <Section
      id="f4-deploy"
      index="21"
      eyebrow="Despliegue y variables de entorno"
      title="Despliegue reproducible sin pasos manuales ocultos."
      intro={
        <>
          El despliegue es una secuencia explícita y reproducible: migraciones a D1 primero, luego
          secrets por entorno, luego <Mono>wrangler deploy</Mono>, y por último un smoke test que
          verifica los endpoints críticos. Cualquier entorno (dev, staging, prod) se levanta con
          la misma receta. No hay configuración manual fuera de código ni pasos secretos
          transmitidos por chat.
        </>
      }
    >
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Pill tone="gold">secuencia</Pill>
          <H3>Deploy de producción</H3>
        </div>
        <Code lang="bash">{DEPLOY_SEQ}</Code>
      </div>

      <div className="mt-10">
        <H3 className="mb-4">Variables de entorno requeridas</H3>
        <DataTable
          head={["Variable", "Propósito", "Dónde"]}
          rows={ENV_VARS.map((v) => [
            <span key={`var-${v.id}`}>
              <Mono>{v.variable}</Mono>
            </span>,
            <span key={`prop-${v.id}`} className="text-foreground/80">
              {v.proposito}
            </span>,
            <span key={`donde-${v.id}`} className="font-mono text-xs text-foreground/70">
              {v.donde}
            </span>,
          ])}
        />
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-5 items-start">
        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">reglas</Pill>
            <H3>Reglas de despliegue</H3>
          </div>
          <GoldList
            items={[
              "Migraciones antes de deploy: schema consistente con el código publicado.",
              "Secrets por entorno; nunca en código ni en wrangler.toml.",
              "Deploy gradual con canary: primero 5% del tráfico, luego 100%.",
              "Rollback = deploy anterior + migración correctiva (no downgrade destructivo).",
              "Feature flags para desacoplar deploy de release.",
              "Smoke test post-deploy: alta org, login, crear reserva, webhook Stripe de prueba.",
              "Sin pasos manuales ocultos: todo en CI/CD o en scripts versionados.",
              "Cada release taggeado en git con changelog semántico.",
            ]}
          />
        </GlassCard>

        <Callout kind="ok" title="Reproducible">
          Cualquier entorno se levanta con cuatro pasos: aplicar migraciones, setear secrets,
          <Mono> wrangler deploy</Mono> y smoke test. No hay configuración manual fuera de código.
          Un ingeniero nuevo puede recrear staging desde cero en menos de 30 minutos siguiendo el
          runbook; producción aplica la misma receta con gate de aprobación y ventana de canary.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  22 — MIGRACIÓN Y ROLLBACK                                   */
/* ============================================================ */
type PlanMR = { id: string; escenario: string; estrategia: string };

const PLAN_MR: PlanMR[] = [
  { id: "rutina", escenario: "Migración rutinaria", estrategia: "forward-only; aplicar antes de deploy; idempotente con IF NOT EXISTS" },
  { id: "rbcode", escenario: "Rollback de código", estrategia: "deploy de la versión anterior (git tag)" },
  { id: "rbschema", escenario: "Rollback de schema", estrategia: "nueva migración correctiva (no downgrade destructivo)" },
  { id: "failprod", escenario: "Migración fallida en prod", estrategia: "detener deploy; restaurar D1 desde snapshot Time Travel; postmortem" },
  { id: "backup", escenario: "Backup", estrategia: "exports cifrados a R2 versionados; pruebas de restauración periódicas" },
  { id: "rpo", escenario: "RPO", estrategia: "≤ 15 min (snapshot + outbox)" },
  { id: "rto", escenario: "RTO", estrategia: "≤ 2 h (restore + redeploy)" },
];

const ROLLBACK_PROC = `# Rollback de código: deploy del tag anterior
git checkout v4.0.0-prev
npx wrangler deploy --env production

# Rollback de schema: nueva migración correctiva
# NUNCA hacer DROP/DELETE destructivo; crear 00NN_rollback_XXXX.sql
npx wrangler d1 migrations apply restopanel-tenant --remote

# Restaurar D1 desde snapshot Time Travel (solo incidente grave)
npx wrangler d1 time-travel restore restopanel-tenant --timestamp=2025-01-21T12:00:00Z`;

export function Fase4Migracion() {
  return (
    <Section
      id="f4-migracion"
      index="22"
      eyebrow="Migración y rollback"
      title="Migraciones forward-only y rollback planificado."
      intro={
        <>
          Las migraciones de D1 son forward-only: cada una numerada, idempotente y aplicada antes
          del deploy del código que la requiere. El rollback de código es redeploy del tag anterior;
          el rollback de schema es una nueva migración correctiva, nunca un downgrade destructivo.
          Time Travel de D1 existe para incidentes graves, pero no sustituye a los backups cifrados
          y versionados en R2 con pruebas de restauración periódicas.
        </>
      }
    >
      <div className="mb-10">
        <H3 className="mb-4">Plan de migración y rollback</H3>
        <DataTable
          head={["Escenario", "Estrategia"]}
          rows={PLAN_MR.map((p) => [
            <span key={`esc-${p.id}`}>
              <Mono>{p.escenario}</Mono>
            </span>,
            <span key={`est-${p.id}`} className="text-foreground/80">
              {p.estrategia}
            </span>,
          ])}
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Pill tone="gold">runbook</Pill>
          <H3>Procedimiento de rollback</H3>
        </div>
        <Code lang="bash">{ROLLBACK_PROC}</Code>
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-5 items-start">
        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">reglas</Pill>
            <H3>Reglas de migración</H3>
          </div>
          <GoldList
            items={[
              "Forward-only: nunca downgrade destructivo en producción.",
              "Cada migración numerada e idempotente (IF NOT EXISTS / guardas).",
              "Rollback de código = redeploy de la versión anterior (git tag).",
              "Rollback de schema = nueva migración correctiva, reversión lógica.",
              "Backup cifrado a R2 + pruebas de restauración al menos mensuales.",
              "Time Travel solo para incidentes graves; no es backup de conservación larga.",
              "Postmortem tras cada rollback: causa, detección, mitigación, acción preventiva.",
            ]}
          />
        </GlassCard>

        <Callout kind="warn" title="Time Travel ≠ backup">
          Time Travel de D1 es recuperación puntual (point-in-time), no backup de conservación
          larga: su ventana está limitada y no cubre retención legal ni compliance. Los backups
          cifrados y versionados en R2 son obligatorios; las pruebas de restauración periódicas
          verifican que el proceso funciona cuando se necesita, no solo en teoría.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  23 — CRITERIOS DE ACEPTACIÓN                                */
/* ============================================================ */
type CriterioF4 = { id: string; criterio: string; verificacion: string };

const CRITERIOS_F4: CriterioF4[] = [
  { id: "iso", criterio: "Dos organizaciones no pueden acceder a los datos de la otra", verificacion: "tests cross-tenant en CI verde" },
  { id: "loc", criterio: "Un usuario solo puede operar en los locales autorizados", verificacion: "tests RBAC + scope por local" },
  { id: "aud", criterio: "Todas las mutaciones quedan auditadas", verificacion: "audit_log en cada mutación + tests" },
  { id: "del", criterio: "Los datos eliminados pueden restaurarse", verificacion: "soft delete + restore + tests" },
  { id: "conc", criterio: "Reservas y mesas soportan concurrencia", verificacion: "tests DO + unique constraint" },
  { id: "q", criterio: "Las colas tienen reintentos e idempotencia", verificacion: "tests de consumer + DLQ" },
  { id: "cache", criterio: "Las cachés están aisladas por organización", verificacion: "namespace org:{id}: + tests de cache poisoning" },
  { id: "api", criterio: "Las APIs validan autenticación, autorización y entrada", verificacion: "middleware en cadena + tests" },
  { id: "mig", criterio: "Existen migraciones reproducibles", verificacion: "wrangler d1 migrations apply limpio" },
  { id: "sec", criterio: "Existen tests automatizados de seguridad y aislamiento", verificacion: "vitest + cloudflare:test en CI" },
  { id: "dash", criterio: "El dashboard funciona con datos reales", verificacion: "E2E con datos reales" },
  { id: "plan", criterio: "Los límites del plan se aplican", verificacion: "entitlements enforced + tests" },
  { id: "err", criterio: "Los errores no exponen información sensible", verificacion: "formato normalizado + revisión" },
  { id: "dep", criterio: "Despliegue en Cloudflare sin pasos manuales ocultos", verificacion: "deploy script + smoke test" },
  { id: "docs", criterio: "La documentación permite instalar, probar y desplegar", verificacion: "docs técnica + deploy" },
];

export function Fase4Criterios() {
  return (
    <Section
      id="f4-criterios"
      index="23"
      eyebrow="Criterios de aceptación"
      title="La fase 4 se considera completada solo si…"
      intro={
        <>
          Quince criterios verificables cierran la fase 4. Cada uno tiene una verificación
          concreta (test, script, revisión) que debe estar en verde antes de declarar el núcleo
          Enterprise listo. No se admiten criterios subjetivos: o hay prueba automatizada o hay
          evidencia documentada revisada por par.
        </>
      }
    >
      <div className="mb-10">
        <H3 className="mb-4">Criterios de aceptación</H3>
        <DataTable
          head={["Criterio", "Verificación"]}
          rows={CRITERIOS_F4.map((c) => [
            <span key={`cri-${c.id}`} className="flex items-start gap-2">
              <span className="text-emerald-300 font-mono shrink-0">✓</span>
              <span className="text-foreground/90">{c.criterio}</span>
            </span>,
            <span key={`ver-${c.id}`} className="text-foreground/80">
              {c.verificacion}
            </span>,
          ])}
        />
      </div>

      <div className="space-y-5">
        <Callout kind="ok" title="Puerta de salida de Fase 4">
          Con los 15 criterios cumplidos, el núcleo Enterprise está listo: aislamiento verificado,
          RBAC granular, concurrencia real, auditoría inmutable, límites por plan aplicados y
          despliegue reproducible. Lo que sigue es escalar (Fase 5+): más locales, más
          organizaciones, celdas dedicadas para inquilinos grandes y API pública versionada para
          integraciones de terceros.
        </Callout>

        <GlassCard variant="strong">
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">cierre</Pill>
            <H3>El motor Enterprise está construido</H3>
          </div>
          <Lead>
            Cada restaurante es una organización aislada con su base de datos lógica, su RBAC, sus
            reservas, su CRM y su facturación — sin que nada se mezcle. Lo que crece a partir de
            aquí es superficie, no reescritura.
          </Lead>
        </GlassCard>
      </div>
    </Section>
  );
}
