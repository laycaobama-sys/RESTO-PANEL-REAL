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
/*  Helper: monospace dorado inline                              */
/* ============================================================ */
function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-xs rp-gold-text whitespace-nowrap">
      {children}
    </code>
  );
}

/* ============================================================ */
/*  01 — RESUMEN Y ARQUITECTURA                                  */
/* ============================================================ */
const PERF_ROWS: { op: string; obj: string; notas: string }[] = [
  {
    op: "Dashboard (consultas habituales)",
    obj: "< 1000 ms",
    notas: "índices compuestos + caché namespaced en KV",
  },
  {
    op: "Creación de reserva",
    obj: "< 300 ms",
    notas: "excluye procesos asíncronos (Queues)",
  },
  {
    op: "Cambio de mesa",
    obj: "tiempo real",
    notas: "Durable Objects + WebSocket",
  },
  {
    op: "Login",
    obj: "< 500 ms",
    notas: "sesión + verificación MFA",
  },
  {
    op: "API habitual",
    obj: "< 100 ms",
    notas: "cuando sea viable",
  },
];

const STAGES: { n: string; etapa: string; capa: string; detiene: string }[] = [
  { n: "01", etapa: "Fundaciones del proyecto", capa: "repo + tooling + CI", detiene: "sin base funcional" },
  { n: "02", etapa: "Base de datos y migraciones", capa: "D1 schema + migraciones", detiene: "sin migraciones reproducibles" },
  { n: "03", etapa: "Organizaciones y locales", capa: "entidades core", detiene: "sin aislamiento" },
  { n: "04", etapa: "Autenticación", capa: "Identity + sesiones", detiene: "sin auth operativa" },
  { n: "05", etapa: "Contexto multi-tenant", capa: "TenantCtx + middleware", detiene: "sin aislamiento en cada request" },
  { n: "06", etapa: "Usuarios, equipos, roles y permisos", capa: "RBAC Enterprise", detiene: "sin autorización granular" },
  { n: "07", etapa: "Auditoría y soft delete", capa: "audit log + papelera", detiene: "sin trazabilidad" },
  { n: "08", etapa: "Reservas, clientes, mesas y planos", capa: "operación de sala", detiene: "sin concurrencia real" },
  { n: "09", etapa: "Configuración", capa: "settings por org/local", detiene: "sin config operativa" },
  { n: "10", etapa: "Facturación", capa: "Stripe + entitlements", detiene: "sin monetización" },
  { n: "11", etapa: "CRM y reputación", capa: "CRM + integraciones", detiene: "sin memoria de cliente" },
  { n: "12", etapa: "IA", capa: "AI Gateway + casos", detiene: "sin IA con límites" },
  { n: "13", etapa: "Caché, colas y tiempo real", capa: "KV namespaced + Queues + DO", detiene: "sin rendimiento" },
  { n: "14", etapa: "Dashboard", capa: "widgets + hooks", detiene: "sin UX" },
  { n: "15", etapa: "Seguridad avanzada", capa: "headers + rate limit + hardening", detiene: "sin seguridad" },
  { n: "16", etapa: "Tests", capa: "aislamiento + RBAC + concurrencia", detiene: "sin verificación" },
  { n: "17", etapa: "Observabilidad", capa: "logs + métricas + trazas", detiene: "sin visibilidad" },
  { n: "18", etapa: "Documentación", capa: "técnica + deploy", detiene: "sin handoff" },
  { n: "19", etapa: "Despliegue", capa: "wrangler + env + rollback", detiene: "sin deploy reproducible" },
];

export function Fase4Resumen() {
  return (
    <Section
      id="f4-resumen"
      index="01"
      eyebrow="Resumen y arquitectura"
      title="De web a SaaS Enterprise multi-tenant para restaurantes."
      intro={
        <>
          Cada restaurante recibe una <strong className="text-foreground">organización aislada</strong> con
          base de datos lógica multi-tenant, usuarios y equipos, RBAC configurable, branding propio, uno o
          más locales, reservas, mesas y planos, clientes y CRM, reputación, facturación, auditoría
          completa, y métricas de consumo y límites por plan. Todo sobre Cloudflare Workers, D1, R2, KV,
          Queues, Durable Objects y AI Gateway.
        </>
      }
    >
      <GlassCard variant="gold" className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="font-mono text-xs uppercase tracking-[0.2em] rp-gold-text">Tesis arquitectónica</span>
          <span className="h-px flex-1 bg-[var(--gold)]/30" />
        </div>
        <p className="text-base sm:text-lg leading-relaxed text-foreground/90">
          La fundación debe garantizar <strong className="text-foreground">aislamiento estricto entre
          organizaciones</strong>, <strong className="text-foreground">escalabilidad desde un restaurante
          independiente hasta cadenas con cientos de locales</strong>,{" "}
          <strong className="text-foreground">trazabilidad completa de cada mutación</strong> y{" "}
          <strong className="text-foreground">alto rendimiento en cada operación de sala</strong>. No se
          permite la mezcla de datos en <strong className="text-foreground">ninguna capa</strong>: ni en
          middleware, ni en servicios, ni en repositorios, ni en base de datos, ni en caché, ni en
          almacenamiento, ni en colas, ni en pruebas.
        </p>
      </GlassCard>

      {/* Objetivos de rendimiento */}
      <div className="mb-6 flex items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Objetivos de rendimiento (p95)
        </span>
        <span className="h-px flex-1 bg-border/60" />
      </div>
      <DataTable
        head={["Operación", "Objetivo", "Notas"]}
        rows={PERF_ROWS.map((r) => [
          <span key={`perf-${r.op}-op`} className="font-medium text-foreground">
            {r.op}
          </span>,
          <span key={`perf-${r.op}-obj`} className="rp-gold-text font-mono">
            {r.obj}
          </span>,
          <span key={`perf-${r.op}-notas`} className="text-muted-foreground text-xs">
            {r.notas}
          </span>,
        ])}
      />

      {/* Orden de implementación */}
      <div className="mt-12 mb-6 flex items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Orden de implementación (19 etapas)
        </span>
        <span className="h-px flex-1 bg-border/60" />
      </div>
      <DataTable
        head={["Etapa", "Capa", "Detiene si"]}
        rows={STAGES.map((s) => [
          <span key={`stage-${s.n}-etapa`} className="font-medium text-foreground">
            <span className="rp-gold-text font-mono mr-2">{s.n}</span>
            {s.etapa}
          </span>,
          <span key={`stage-${s.n}-capa`} className="text-foreground/85">
            {s.capa}
          </span>,
          <span key={`stage-${s.n}-detiene`} className="text-muted-foreground text-xs">
            {s.detiene}
          </span>,
        ])}
      />

      <div className="mt-8">
        <Callout id="ADR-4.1" kind="adr" title="Aislamiento en cada capa">
          El <Mono>organization_id</Mono> que envía el cliente <strong className="text-foreground">nunca es
          autoridad</strong>. El aislamiento existe y se hace respetar en{" "}
          <strong className="text-foreground">middleware</strong> (resolución de sesión → org activa),{" "}
          <strong className="text-foreground">servicios</strong> (casos de uso que reciben{" "}
          <Mono>TenantCtx</Mono>), <strong className="text-foreground">repositorios</strong> (queries con{" "}
          <Mono>WHERE organization_id = ?</Mono> obligatorio), <strong className="text-foreground">base de
          datos</strong> (PK compuestas <Mono>(organization_id, id)</Mono> + FKs compuestas),{" "}
          <strong className="text-foreground">caché</strong> (claves namespaced{" "}
          <Mono>org:&#123;id&#125;:...</Mono>), <strong className="text-foreground">almacenamiento</strong>{" "}
          (prefijos R2 <Mono>orgs/&#123;org_id&#125;/...</Mono>), <strong className="text-foreground">colas</strong>{" "}
          (routing y dedupe por org) y <strong className="text-foreground">tests</strong> (cobertura IDOR +
          cross-tenant en CI perpetuo).
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  02 — ARQUITECTURA DE CARPETAS                                */
/* ============================================================ */
const MONOREPO_TREE = `restopanel/
├── apps/
│   ├── dashboard/              # app interna (manejo de sala, back-office)
│   ├── booking/                # widget de reservas embebible
│   ├── super-admin/            # panel de plataforma (staff RestoPanel)
│   ├── landing/                # marketing y comercial
│   ├── docs/                   # documentación pública
│   └── status/                 # status page
│
├── packages/
│   ├── contracts/              # tipos + esquemas zod compartidos
│   ├── ui/                     # design system (componentes shadcn-based)
│   ├── design-tokens/          # tokens de marca (color, tipografía, motion)
│   ├── config/                 # eslint, tsconfig, tailwind preset, boundaries
│   ├── auth/                   # sesiones, MFA, identity, refresh
│   ├── tenancy/                # TenantCtx + middleware + enforcement
│   ├── audit/                  # logger append-only + outbox de auditoría
│   ├── observability/          # logs estructurados, métricas, trazas
│   ├── storage/                # R2 wrappers + URLs firmadas + validación
│   ├── ai-gateway/             # wrapper AI Gateway (límites, redacción, costes)
│   ├── billing/                # Stripe + entitlements + uso medido
│   ├── crm/                    # clientes, preferencias, segmentos, consent
│   ├── reservations/           # reservas, slots, waitlist, idempotencia
│   ├── tables/                 # planos, zonas, mesas, estados
│   ├── staff/                  # equipos, turnos, asignación de mesa
│   ├── reviews/                # reputación (Google, TripAdvisor, Meta)
│   ├── marketing/              # campañas, promos, audiencias
│   ├── notifications/          # email + WhatsApp + push templates
│   ├── integrations/           # Stripe, Google, Meta, WhatsApp Cloud, Resend
│   └── super-admin/            # gestión platform (orgs, planes, soporte)
│
├── workers/
│   ├── api/                    # worker API principal (REST + WS)
│   ├── webhooks/               # receptor de webhooks firmados
│   ├── cron/                   # tareas programadas (Triggers)
│   ├── queues/                 # consumers (email, whatsapp, ai, export)
│   ├── workflows/              # Durable Object workflows
│   └── realtime/               # WebSocket Gateway (plano en vivo)
│
├── database/
│   ├── migrations/             # forward-only SQL (YYYYMMDDHHMMSS_name.sql)
│   ├── seeds/                  # fixtures por entorno (dev, staging, e2e)
│   └── schema/                 # esquema canon + diagramas ER
│
├── infra/
│   ├── cloudflare/             # wrangler.toml por worker y entorno
│   ├── environments/           # dev · staging · prod (vars, secrets)
│   ├── policies/               # catálogo de permisos, IAM CF, runbooks
│   └── runbooks/               # operación: incidentes, rotación, rollback
│
└── docs/
    ├── adr/                    # arquitecture decision records (numerados)
    ├── api/                    # OpenAPI 3.1 + ejemplos + postman
    ├── deploy/                 # runbooks de despliegue por entorno
    └── runbooks/               # operación diurna y nocturna

# Estructura interna obligatoria de un paquete de dominio
# (ejemplo: packages/reservations)
packages/reservations/
├── domain/                     # entidades, value objects, invariantes
├── application/                # casos de uso (CreateReservation, ...)
├── infrastructure/             # repositorios D1, proyecciones, outbox
├── events/                     # eventos tipados del dominio (ReservationCreated)
├── api/                        # handlers HTTP + validación zod + serialización
├── tests/                      # unit + integración + IDOR + concurrencia
└── index.ts                    # ÚNICA API pública del paquete`;

const WRANGLER_TOML = `name = "restopanel-api"
main = "workers/api/src/index.ts"
compatibility_date = "2025-01-15"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "restopanel-tenant"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

[[r2_buckets]]
binding = "MEDIA"
bucket_name = "restopanel-media"

[[kv_namespaces]]
binding = "CONFIG"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

[[durable_objects.bindings]]
name = "FLOOR"
class_name = "FloorObject"

[[queues.producers]]
binding = "EMAIL_QUEUE"
queue = "restopanel-email"

[[queues.producers]]
binding = "WHATSAPP_QUEUE"
queue = "restopanel-whatsapp"

[[queues.producers]]
binding = "AI_QUEUE"
queue = "restopanel-ai"

[[queues.consumers]]
queue = "restopanel-email"
max_batch_size = 25
max_concurrency = 4

[ai]
binding = "AI"

[vars]
ENV = "production"
APP_VERSION = "4.0.0"`;

export function Fase4Carpetas() {
  return (
    <Section
      id="f4-carpetas"
      index="02"
      eyebrow="Arquitectura de carpetas"
      title="Monorepo orientado a dominios sobre Cloudflare Workers."
      intro={
        <>
          Un único repositorio, múltiples apps y paquetes de dominio. Cada paquete expone su API pública
          vía <Mono>index.ts</Mono>; los workers consumen casos de uso, nunca infraestructura ajena. La
          disciplina de fronteras se valida en CI con <Mono>eslint-plugin-boundaries</Mono> y{" "}
          <Mono>dependency-cruiser</Mono>.
        </>
      }
    >
      <Code lang="text">{MONOREPO_TREE}</Code>

      <div className="mt-10">
        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            <H3>Convenciones</H3>
          </div>
          <GoldList
            items={[
              <>
                Cada paquete exporta <strong className="text-foreground">solo vía</strong>{" "}
                <Mono>index.ts</Mono>. Nada importable fuera de esa puerta.
              </>,
              <>
                El dominio <strong className="text-foreground">A no importa</strong>{" "}
                <Mono>infrastructure</Mono> de otro dominio B. La comunicación es vía interfaces, eventos
                tipados o casos de uso públicos.
              </>,
              <>
                Los <strong className="text-foreground">workers llaman casos de uso</strong>, no
                repositorios directos. La validación de entrada vive en <Mono>api/</Mono>.
              </>,
              <>
                La carpeta <Mono>database/</Mono> contiene <strong className="text-foreground">solo
                migraciones y esquemas</strong>. Ninguna lógica de aplicación.
              </>,
              <>
                <strong className="text-foreground">Sin utils ni services sin owner</strong>. Toda
                utilidad pertenece a un paquete (config, ui, observability, etc.).
              </>,
              <>
                <strong className="text-foreground">CI bloquea dependencias prohibidas</strong> con{" "}
                <Mono>eslint-plugin-boundaries</Mono> y <Mono>dependency-cruiser</Mono>. Una regla
                violada rompe el pipeline.
              </>,
            ]}
          />
        </GlassCard>
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            wrangler.toml · worker API
          </span>
          <span className="h-px flex-1 bg-border/60" />
        </div>
        <Code lang="toml">{WRANGLER_TOML}</Code>
      </div>

      <div className="mt-8">
        <Callout kind="info" title="Un worker, múltiples bindings">
          En la Fase 4 el worker API <strong className="text-foreground">concentra</strong> D1, R2, KV,
          Durable Objects, Queues y AI en un solo despliegue. La separación física (workers dedicados por
          dominio o por servicio) llega <strong className="text-foreground">solo cuando un cuello medido lo
          justifique</strong>, y siempre con un ADR que registre el motivo, el coste y el camino de
          vuelta. Premature physical split = complejidad operativa sin beneficio.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  03 — SERVICIOS CLOUDFLARE                                    */
/* ============================================================ */
const CF_TOPOLOGY = `flowchart TB
  CLI["Cliente / Dashboard / Widget"] --> WAF["WAF + Rate Limit + Turnstile"]
  WAF --> WRK["Worker API (auth + tenant + RBAC + validación)"]
  WRK --> D1[("D1 · transaccional canónico")]
  WRK --> KV[("KV · config + caché namespaced")]
  WRK --> R2[("R2 · archivos por org")]
  WRK --> DO["Durable Objects · plano + locks"]
  WRK --> Q["Queues"]
  Q --> C1["email consumer"]
  Q --> C2["whatsapp consumer"]
  Q --> C3["ai consumer"]
  WRK --> AI["AI Gateway"]
  DO --> D1`;

type CFService = {
  id: string;
  servicio: string;
  resp: string;
  regla: string;
  riesgo: "bajo" | "medio" | "alto" | "crítico";
};

const CF_SERVICES: CFService[] = [
  {
    id: "d1",
    servicio: "D1",
    resp: "Datos transaccionales: orgs, locales, usuarios, roles, permisos, reservas, clientes, mesas, billing, auditoría.",
    regla: "organization_id NOT NULL; PK compuesta; sin RLS nativa → Tenant Enforcement Layer.",
    riesgo: "alto",
  },
  {
    id: "kv",
    servicio: "KV",
    resp: "Config de lectura frecuente, feature flags, caché namespaced.",
    regla: "NUNCA fuente principal de verdad; claves con prefijo org:{id}:...; TTL.",
    riesgo: "medio",
  },
  {
    id: "r2",
    servicio: "R2",
    resp: "Logos, imágenes, PDFs, cartas, vídeos, exportaciones.",
    regla: "prefijo orgs/{org_id}/...; URLs firmadas; validación de tipo.",
    riesgo: "bajo",
  },
  {
    id: "do",
    servicio: "Durable Objects",
    resp: "Plano de mesas, locks de concurrencia, actualizaciones en vivo.",
    regla: "1 DO por (location_id + date); D1 canónico; DO reconstruye.",
    riesgo: "alto",
  },
  {
    id: "q",
    servicio: "Queues",
    resp: "Emails, WhatsApp, IA, exportaciones, webhooks, tareas asíncronas.",
    regla: "idempotencia; reintentos con backoff; DLQ.",
    riesgo: "medio",
  },
  {
    id: "wrk",
    servicio: "Workers",
    resp: "API REST, middleware, auth, autorización, validación, rate limit, observabilidad, errores.",
    regla: "sin estado; estado en D1/DO.",
    riesgo: "medio",
  },
  {
    id: "ai",
    servicio: "AI Gateway",
    resp: "Todas las llamadas a modelos de IA.",
    regla: "control de costes; límites por org; logs; reintentos; fallbacks; redacción PII.",
    riesgo: "alto",
  },
];

export function Fase4Cloudflare() {
  return (
    <Section
      id="f4-cloudflare"
      index="03"
      eyebrow="Servicios Cloudflare"
      title="Responsabilidad de cada servicio Cloudflare."
      intro={
        <>
          Siete servicios con responsabilidades no superpuestas. Cada uno tiene una regla de aislamiento
          explícita y un nivel de riesgo asociado. La topología runtime se articula alrededor del worker
          API, que es el único punto que toca D1, KV, R2, DO, Queues y AI.
        </>
      }
    >
      <div className="mb-6 flex items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Topología runtime
        </span>
        <span className="h-px flex-1 bg-border/60" />
      </div>
      <Mermaid chart={CF_TOPOLOGY} />

      <div className="mt-12 mb-6 flex items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Servicios Cloudflare → responsabilidad y reglas
        </span>
        <span className="h-px flex-1 bg-border/60" />
      </div>
      <DataTable
        head={["Servicio", "Responsabilidad", "Regla clave", "Riesgo"]}
        rows={CF_SERVICES.map((s) => [
          <span key={`cf-${s.id}-srv`} className="font-medium text-foreground">
            <Mono>{s.servicio}</Mono>
          </span>,
          <span key={`cf-${s.id}-resp`} className="text-foreground/85 text-xs leading-relaxed">
            {s.resp}
          </span>,
          <span key={`cf-${s.id}-regla`} className="text-muted-foreground text-xs leading-relaxed">
            {s.regla}
          </span>,
          <Risk key={`cf-${s.id}-risk`} level={s.riesgo} />,
        ])}
      />

      <div className="mt-10">
        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            <H3>Reglas de aislamiento por servicio</H3>
          </div>
          <GoldList
            items={[
              <>
                <strong className="text-foreground">D1</strong>: toda query lleva{" "}
                <Mono>organization_id</Mono> en WHERE; PK compuesta; FKs compuestas.
              </>,
              <>
                <strong className="text-foreground">KV</strong>: namespace{" "}
                <Mono>org:&#123;id&#125;:...</Mono> con TTL; nunca fuente de verdad.
              </>,
              <>
                <strong className="text-foreground">R2</strong>: prefijo{" "}
                <Mono>orgs/&#123;org_id&#125;/...</Mono> + URLs firmadas + validación de tipo MIME.
              </>,
              <>
                <strong className="text-foreground">Durable Objects</strong>: nombre con{" "}
                <Mono>org_id + location_id</Mono>; D1 canónico; DO reconstruye estado al reiniciar.
              </>,
              <>
                <strong className="text-foreground">Queues</strong>: mensaje con{" "}
                <Mono>organization_id</Mono>; consumer con dedupe; idempotencia obligatoria.
              </>,
              <>
                <strong className="text-foreground">AI Gateway</strong>: prompt sin PII cruda; scopes por
                org; límites por plan; logs con latencia y coste.
              </>,
            ]}
          />
        </GlassCard>
      </div>

      <div className="mt-8">
        <Callout kind="warn" title="D1 sin RLS">
          SQLite/D1 <strong className="text-foreground">no tiene Row-Level Security</strong>. El
          aislamiento es de aplicación: <strong className="text-foreground">Tenant Enforcement Layer</strong>{" "}
          en repositorios (queries que exigen <Mono>organization_id</Mono>),{" "}
          <strong className="text-foreground">constraints compuestos</strong> en PK/FK que rompen joins
          cross-tenant, y <strong className="text-foreground">tests IDOR perpetuos</strong> en CI. No se
          simula RLS: se garantiza a nivel de código + constraints + tests.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  04 — ESQUEMA D1 COMPLETO (SQL)                               */
/* ============================================================ */
const SQL_SCHEMA = `-- ============================================================
-- RestoPanel · D1/SQLite · Esquema Fase 4 (Enterprise multi-tenant)
-- ------------------------------------------------------------
-- Convenciones:
--   · ULID como TEXT (generado en aplicación, sin autoincrement exponible)
--   · Timestamps en UTC ISO-8601 (TEXT)
--   · Money como INTEGER minor units + ISO 4217 (currency TEXT)
--   · Booleanos como INTEGER (0/1)
--   · JSON como TEXT (validación en aplicación)
--   · organization_id NOT NULL en toda tabla tenant
--   · PK compuesta (organization_id, id) → impide físicamente cross-tenant en JOINs
--   · FKs compuestas → refuerzan tenancy a nivel de constraint
--   · idem_key UNIQUE parcial → idempotencia por organización
--   · Soft delete con deleted_at + deleted_by
--   · audit_logs append-only (sin rutas UPDATE/DELETE en aplicación)
--   · Sin RLS nativa → Tenant Enforcement Layer + tests IDOR en CI
-- ============================================================

-- ---------- ORGANIZACIONES (raíz del tenant) ----------
CREATE TABLE organizations (
  id                              TEXT    PRIMARY KEY,
  slug                            TEXT    NOT NULL UNIQUE,
  commercial_name                 TEXT    NOT NULL,
  legal_name                      TEXT,
  tax_id                          TEXT,
  logo_r2_key                     TEXT,
  brand_color_primary             TEXT,
  brand_color_secondary           TEXT,
  custom_domain                   TEXT,
  email                           TEXT    NOT NULL,
  phone                           TEXT,
  whatsapp                        TEXT,
  locale                          TEXT    NOT NULL DEFAULT 'es',
  timezone                        TEXT    NOT NULL DEFAULT 'Europe/Madrid',
  currency                        TEXT    NOT NULL DEFAULT 'EUR',
  vat_config                      TEXT    NOT NULL DEFAULT '{}',
  status                          TEXT    NOT NULL DEFAULT 'active',
  plan_id                         TEXT,
  max_locations                   INTEGER NOT NULL DEFAULT 1,
  max_users                       INTEGER NOT NULL DEFAULT 5,
  max_storage_bytes               INTEGER NOT NULL DEFAULT 1073741824,
  storage_used_bytes              INTEGER NOT NULL DEFAULT 0,
  reservations_current_period     INTEGER NOT NULL DEFAULT 0,
  emails_current_period           INTEGER NOT NULL DEFAULT 0,
  whatsapps_current_period        INTEGER NOT NULL DEFAULT 0,
  ai_credits_current_period       INTEGER NOT NULL DEFAULT 0,
  created_at                      TEXT    NOT NULL,
  updated_at                      TEXT    NOT NULL,
  deleted_at                      TEXT
);

-- ---------- LOCALES (restaurantes físicos por org) ----------
CREATE TABLE locations (
  organization_id   TEXT    NOT NULL,
  id                TEXT    NOT NULL,
  name              TEXT    NOT NULL,
  address           TEXT,
  lat               REAL,
  lng               REAL,
  phone             TEXT,
  opening_hours     TEXT    NOT NULL DEFAULT '{}',
  holidays          TEXT    NOT NULL DEFAULT '[]',
  capacity          INTEGER NOT NULL DEFAULT 0,
  active            INTEGER NOT NULL DEFAULT 1,
  created_at        TEXT    NOT NULL,
  updated_at        TEXT    NOT NULL,
  deleted_at        TEXT,
  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- ---------- USUARIOS (identidad global, multi-org) ----------
CREATE TABLE users (
  id            TEXT    PRIMARY KEY,
  email         TEXT    NOT NULL UNIQUE,
  status        TEXT    NOT NULL DEFAULT 'active',
  mfa_enrolled  INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT    NOT NULL,
  updated_at    TEXT    NOT NULL,
  deleted_at    TEXT
);

-- ---------- MEMBRESÍAS ORG ↔ USUARIO (multi-org, multi-local, multi-rol) ----------
CREATE TABLE organization_members (
  organization_id   TEXT    NOT NULL,
  user_id           TEXT    NOT NULL,
  location_id       TEXT,
  role_id           TEXT    NOT NULL,
  status            TEXT    NOT NULL DEFAULT 'active',
  added_at          TEXT    NOT NULL,
  PRIMARY KEY (organization_id, user_id, location_id, role_id),
  FOREIGN KEY (organization_id)            REFERENCES organizations(id),
  FOREIGN KEY (user_id)                    REFERENCES users(id),
  FOREIGN KEY (organization_id, location_id) REFERENCES locations(organization_id, id)
);

-- ---------- ROLES (por organización, personalizables) ----------
CREATE TABLE roles (
  organization_id   TEXT    NOT NULL,
  id                TEXT    NOT NULL,
  name              TEXT    NOT NULL,
  scope             TEXT    NOT NULL,  -- 'org' | 'location' | 'team'
  is_system         INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT    NOT NULL,
  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- ---------- PERMISOS (catálogo global, p.ej. 'reservations.create') ----------
CREATE TABLE permissions (
  key          TEXT    PRIMARY KEY,
  resource     TEXT    NOT NULL,
  action       TEXT    NOT NULL,
  description  TEXT
);

-- ---------- ROL ↔ PERMISO ----------
CREATE TABLE role_permissions (
  organization_id  TEXT    NOT NULL,
  role_id          TEXT    NOT NULL,
  permission_key   TEXT    NOT NULL,
  PRIMARY KEY (organization_id, role_id, permission_key),
  FOREIGN KEY (organization_id, role_id) REFERENCES roles(organization_id, id),
  FOREIGN KEY (permission_key)           REFERENCES permissions(key)
);

-- ---------- EQUIPOS ----------
CREATE TABLE teams (
  organization_id  TEXT    NOT NULL,
  id               TEXT    NOT NULL,
  name             TEXT    NOT NULL,
  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE team_members (
  organization_id  TEXT    NOT NULL,
  team_id          TEXT    NOT NULL,
  user_id          TEXT    NOT NULL,
  PRIMARY KEY (organization_id, team_id, user_id),
  FOREIGN KEY (organization_id, team_id) REFERENCES teams(organization_id, id),
  FOREIGN KEY (user_id)                   REFERENCES users(id)
);

-- ---------- SESIONES (globales, sin org_id) ----------
CREATE TABLE sessions (
  id            TEXT    PRIMARY KEY,
  user_id       TEXT    NOT NULL,
  device_id     TEXT,
  issued_at     TEXT    NOT NULL,
  expires_at    TEXT    NOT NULL,
  revoked_at    TEXT,
  ip_redacted   TEXT,
  user_agent    TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ---------- AUDITORÍA (append-only · PK compuesta) ----------
CREATE TABLE audit_logs (
  id                  TEXT    NOT NULL,
  organization_id     TEXT    NOT NULL,
  location_id         TEXT,
  actor_id            TEXT    NOT NULL,
  actor_effective_id  TEXT,
  action              TEXT    NOT NULL,
  resource_type       TEXT    NOT NULL,
  resource_id         TEXT,
  before              TEXT,    -- JSON del estado anterior
  after               TEXT,    -- JSON del estado posterior
  result              TEXT    NOT NULL,  -- 'success' | 'failure' | 'denied'
  duration_ms         INTEGER,
  ip_redacted         TEXT,
  user_agent          TEXT,
  correlation_id      TEXT,
  reason              TEXT,
  origin              TEXT,    -- 'web' | 'api' | 'widget' | 'system' | 'impersonation'
  occurred_at         TEXT    NOT NULL,
  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- ---------- CLIENTES (CRM por org) ----------
CREATE TABLE customers (
  organization_id        TEXT    NOT NULL,
  id                     TEXT    NOT NULL,
  name                   TEXT,
  email                  TEXT,
  phone                  TEXT,
  locale                 TEXT,
  consent                TEXT    NOT NULL DEFAULT '{}',
  tags                   TEXT    NOT NULL DEFAULT '[]',
  is_vip                 INTEGER NOT NULL DEFAULT 0,
  lifetime_value_minor   INTEGER NOT NULL DEFAULT 0,
  created_at             TEXT    NOT NULL,
  updated_at             TEXT    NOT NULL,
  deleted_at             TEXT,
  deleted_by             TEXT,
  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE customer_preferences (
  organization_id  TEXT    NOT NULL,
  customer_id      TEXT    NOT NULL,
  key              TEXT    NOT NULL,
  value            TEXT    NOT NULL,
  PRIMARY KEY (organization_id, customer_id, key),
  FOREIGN KEY (organization_id, customer_id) REFERENCES customers(organization_id, id)
);

-- ---------- RESERVAS ----------
CREATE TABLE reservations (
  organization_id  TEXT    NOT NULL,
  id               TEXT    NOT NULL,
  location_id      TEXT    NOT NULL,
  customer_id      TEXT    NOT NULL,
  table_id         TEXT,
  status           TEXT    NOT NULL DEFAULT 'pending',
  party_size       INTEGER NOT NULL,
  reserved_at      TEXT    NOT NULL,
  source           TEXT    NOT NULL,   -- 'widget' | 'phone' | 'walk-in' | 'integration'
  idem_key         TEXT,               -- idempotencia por org
  notes            TEXT,
  created_by       TEXT    NOT NULL,
  created_at       TEXT    NOT NULL,
  updated_at       TEXT    NOT NULL,
  deleted_at       TEXT,
  deleted_by       TEXT,
  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id, location_id)  REFERENCES locations(organization_id, id),
  FOREIGN KEY (organization_id, customer_id)  REFERENCES customers(organization_id, id)
);

CREATE TABLE reservation_history (
  organization_id  TEXT    NOT NULL,
  id               TEXT    NOT NULL,
  reservation_id   TEXT    NOT NULL,
  action           TEXT    NOT NULL,
  before           TEXT,
  after            TEXT,
  actor_id         TEXT    NOT NULL,
  occurred_at      TEXT    NOT NULL,
  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id, reservation_id) REFERENCES reservations(organization_id, id)
);

-- ---------- PLANO DE SALA ----------
CREATE TABLE floors (
  organization_id  TEXT    NOT NULL,
  id               TEXT    NOT NULL,
  location_id      TEXT    NOT NULL,
  name             TEXT    NOT NULL,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id, location_id) REFERENCES locations(organization_id, id)
);

CREATE TABLE zones (
  organization_id  TEXT    NOT NULL,
  id               TEXT    NOT NULL,
  floor_id         TEXT    NOT NULL,
  name             TEXT    NOT NULL,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id, floor_id) REFERENCES floors(organization_id, id)
);

CREATE TABLE tables (
  organization_id  TEXT    NOT NULL,
  id               TEXT    NOT NULL,
  location_id      TEXT    NOT NULL,
  zone_id          TEXT    NOT NULL,
  name             TEXT    NOT NULL,
  seats            INTEGER NOT NULL DEFAULT 1,
  status           TEXT    NOT NULL DEFAULT 'available',
  pos_x            REAL    NOT NULL DEFAULT 0,
  pos_y            REAL    NOT NULL DEFAULT 0,
  shape            TEXT    NOT NULL DEFAULT 'circle',
  created_at       TEXT    NOT NULL,
  updated_at       TEXT    NOT NULL,
  deleted_at       TEXT,
  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id, location_id) REFERENCES locations(organization_id, id),
  FOREIGN KEY (organization_id, zone_id)    REFERENCES zones(organization_id, id)
);

-- ---------- CARTA ----------
CREATE TABLE menu_items (
  organization_id  TEXT    NOT NULL,
  id               TEXT    NOT NULL,
  location_id      TEXT,
  name             TEXT    NOT NULL,
  description      TEXT,
  price_minor      INTEGER NOT NULL DEFAULT 0,
  currency         TEXT    NOT NULL DEFAULT 'EUR',
  available        INTEGER NOT NULL DEFAULT 1,
  allergens        TEXT    NOT NULL DEFAULT '[]',
  created_at       TEXT    NOT NULL,
  updated_at       TEXT    NOT NULL,
  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id, location_id) REFERENCES locations(organization_id, id)
);

-- ---------- FEATURE FLAGS (global · org · location) ----------
CREATE TABLE feature_flags (
  key              TEXT    NOT NULL,
  organization_id  TEXT,
  location_id      TEXT,
  value            TEXT    NOT NULL DEFAULT '{}',
  PRIMARY KEY (key, organization_id, location_id)
);

-- ---------- BILLING ----------
CREATE TABLE subscriptions (
  organization_id        TEXT    NOT NULL,
  id                     TEXT    NOT NULL,
  plan_id                TEXT    NOT NULL,
  stripe_sub_ref         TEXT,
  status                 TEXT    NOT NULL,
  current_period_start   TEXT    NOT NULL,
  current_period_end     TEXT    NOT NULL,
  created_at             TEXT    NOT NULL,
  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE invoices (
  organization_id     TEXT    NOT NULL,
  id                  TEXT    NOT NULL,
  subscription_id     TEXT    NOT NULL,
  stripe_invoice_ref  TEXT,
  amount_minor        INTEGER NOT NULL,
  currency            TEXT    NOT NULL,
  tax_minor           INTEGER NOT NULL DEFAULT 0,
  status              TEXT    NOT NULL,
  issued_at           TEXT    NOT NULL,
  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id, subscription_id) REFERENCES subscriptions(organization_id, id)
);

CREATE TABLE usage_records (
  organization_id  TEXT    NOT NULL,
  id               TEXT    NOT NULL,
  metric           TEXT    NOT NULL,   -- 'reservations' | 'emails' | 'whatsapps' | 'ai_credits' | 'storage'
  quantity         INTEGER NOT NULL,
  period_start     TEXT    NOT NULL,
  period_end       TEXT    NOT NULL,
  recorded_at      TEXT    NOT NULL,
  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- ---------- IA (AI Gateway) ----------
CREATE TABLE ai_requests (
  organization_id  TEXT    NOT NULL,
  id               TEXT    NOT NULL,
  model            TEXT    NOT NULL,
  prompt_version   TEXT    NOT NULL,
  scope            TEXT    NOT NULL,   -- 'reviews.reply' | 'crm.summary' | ...
  input_redacted   TEXT,               -- JSON sin PII cruda
  output           TEXT,               -- JSON
  cost_minor       INTEGER NOT NULL DEFAULT 0,
  latency_ms       INTEGER,
  result           TEXT    NOT NULL,   -- 'success' | 'error' | 'denied'
  approved_by      TEXT,
  created_at       TEXT    NOT NULL,
  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- ---------- OUTBOX (eventos transaccionales) ----------
CREATE TABLE events_outbox (
  organization_id  TEXT    NOT NULL,
  id               TEXT    NOT NULL,
  event_type       TEXT    NOT NULL,
  event_version    TEXT    NOT NULL,
  payload          TEXT    NOT NULL,   -- JSON
  status           TEXT    NOT NULL DEFAULT 'pending',  -- 'pending' | 'published' | 'failed'
  attempts         INTEGER NOT NULL DEFAULT 0,
  occurred_at      TEXT    NOT NULL,
  published_at     TEXT,
  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- ============================================================
-- ÍNDICES (composite · leading con organization_id)
-- ============================================================

-- Reservas: listados por local + estado + fecha
CREATE INDEX idx_res_org_loc_status
  ON reservations(organization_id, location_id, status);
CREATE INDEX idx_res_org_reserved
  ON reservations(organization_id, location_id, reserved_at);
CREATE UNIQUE INDEX idx_res_idem
  ON reservations(organization_id, idem_key)
  WHERE idem_key IS NOT NULL AND deleted_at IS NULL;

-- Clientes: búsqueda por email dentro de la org
CREATE INDEX idx_cust_org_email
  ON customers(organization_id, email);

-- Auditoría: timeline por org + histórico por actor
CREATE INDEX idx_audit_org_occurred
  ON audit_logs(organization_id, occurred_at);
CREATE INDEX idx_audit_actor
  ON audit_logs(organization_id, actor_id, occurred_at);

-- Outbox: poller por estado + antigüedad
CREATE INDEX idx_outbox_status
  ON events_outbox(status, occurred_at);

-- Locales activos por org
CREATE INDEX idx_locations_org_active
  ON locations(organization_id, active);

-- Membresías: listar miembros de una org y resolver acceso de un usuario
CREATE INDEX idx_members_org_user
  ON organization_members(organization_id, user_id);

-- Mesas: plano por zona + estado
CREATE INDEX idx_tables_org_zone
  ON tables(organization_id, zone_id, status);

-- Suscripciones: estado por org
CREATE INDEX idx_subs_org_status
  ON subscriptions(organization_id, status);

-- Uso medido: serie por métrica y periodo
CREATE INDEX idx_usage_org_metric
  ON usage_records(organization_id, metric, period_start);

-- IA: costes y volumen por scope
CREATE INDEX idx_ai_org_scope
  ON ai_requests(organization_id, scope, created_at);

-- Historial de reserva: reconstrucción cronológica
CREATE INDEX idx_res_history_org
  ON reservation_history(organization_id, reservation_id, occurred_at);`;

export function Fase4SQL() {
  return (
    <Section
      id="f4-sql"
      index="04"
      eyebrow="Esquema D1 completo (SQL)"
      title="SQL D1/SQLite: claves compuestas, índices por tenant y constraints anti cross-tenant."
      intro={
        <>
          Esquema D1 completo, listo para migraciones forward-only. ULID como <Mono>TEXT</Mono>. Timestamps
          UTC ISO-8601. Dinero como <Mono>INTEGER</Mono> minor units + ISO 4217.{" "}
          <Mono>organization_id</Mono> <strong className="text-foreground">NOT NULL</strong> en toda tabla
          tenant. PK compuesta <Mono>(organization_id, id)</Mono>. FKs compuestas. Idempotencia vía índice
          unique parcial sobre <Mono>idem_key</Mono>.
        </>
      }
    >
      <Code lang="sql">{SQL_SCHEMA}</Code>

      <div className="mt-10">
        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            <H3>Patrones clave del SQL</H3>
          </div>
          <GoldList
            items={[
              <>
                <strong className="text-foreground">PK compuesta</strong>{" "}
                <Mono>(organization_id, id)</Mono> → impide físicamente cross-tenant en JOINs ygroupBy.
              </>,
              <>
                <strong className="text-foreground">FKs compuestas</strong> → refuerzan tenancy a nivel de
                constraint: no se puede insertar una reserva con <Mono>location_id</Mono> de otra org.
              </>,
              <>
                <strong className="text-foreground">idem_key UNIQUE parcial</strong> → idempotencia por
                organización; el cliente puede reintentar sin duplicar.
              </>,
              <>
                <strong className="text-foreground">Soft delete</strong> con <Mono>deleted_at</Mono> +{" "}
                <Mono>deleted_by</Mono>; filtrado en repositorios y restauración auditable.
              </>,
              <>
                <strong className="text-foreground">audit_logs append-only</strong>: PK compuesta y sin
                rutas UPDATE/DELETE en el código de aplicación.
              </>,
              <>
                <strong className="text-foreground">ULID generado en aplicación</strong>, sin autoincrement
                exponible (no se filtra cardinalidad ni orden real).
              </>,
              <>
                <strong className="text-foreground">Dinero en minor units</strong> <Mono>INTEGER</Mono>{" "}
                + <Mono>currency</Mono> ISO 4217 → sin errores de coma flotante.
              </>,
              <>
                <strong className="text-foreground">Timestamps UTC ISO-8601</strong> <Mono>TEXT</Mono> →
                comparables y ordenables lexicográficamente.
              </>,
            ]}
          />
        </GlassCard>
      </div>

      <div className="mt-8">
        <Callout kind="warn" title="Sin RLS, sin triggers complejos">
          D1/SQLite <strong className="text-foreground">no tiene RLS</strong> y los triggers complejos
          añaden riesgo operativo (debug, migraciones, rendimiento). El aislamiento y la auditoría se
          garantizan en <strong className="text-foreground">aplicación</strong>: Tenant Enforcement Layer
          en repositorios que exigen <Mono>organization_id</Mono>, constraints compuestos que rompen joins
          inválidos, y tests IDOR en CI perpetuo. La auditoría append-only se garantiza con{" "}
          <strong className="text-foreground">disciplina de código</strong>: ninguna ruta expone UPDATE o
          DELETE sobre <Mono>audit_logs</Mono>, y un lint rule lo verifica en cada PR.
        </Callout>
      </div>
    </Section>
  );
}
