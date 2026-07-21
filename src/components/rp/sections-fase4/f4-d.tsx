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
/*  Helper: texto monoespaciado dorado                          */
/* ============================================================ */
function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-xs rp-gold-text whitespace-nowrap">
      {children}
    </code>
  );
}

/* ============================================================ */
/*  14 — CACHÉ NAMESPACED (KV)                                  */
/* ============================================================ */
const CACHE_CODE = `// packages/tenancy/src/cache.ts
import type { TenantCtx } from "@restopanel/tenancy";

export class OrgCache {
  constructor(private kv: KVNamespace) {}

  private key(ctx: TenantCtx, suffix: string): string {
    return \`org:\${ctx.organization_id}:\${suffix}\`;
  }

  async get<T>(ctx: TenantCtx, suffix: string): Promise<T | null> {
    const raw = await this.kv.get(this.key(ctx, suffix), "json");
    return (raw as T) ?? null;
  }

  async set<T>(ctx: TenantCtx, suffix: string, value: T, ttlSeconds = 60): Promise<void> {
    await this.kv.put(this.key(ctx, suffix), JSON.stringify(value), { expirationTtl: ttlSeconds });
  }

  async invalidate(ctx: TenantCtx, suffix: string): Promise<void> {
    await this.kv.delete(this.key(ctx, suffix));
  }

  /** Invalidación masiva por prefijo de org (para purge al desactivar org) */
  async invalidateOrg(ctx: TenantCtx): Promise<void> {
    const list = await this.kv.list({ prefix: \`org:\${ctx.organization_id}:\` });
    await Promise.all(list.keys.map((k) => this.kv.delete(k.name)));
  }
}

// Uso: caché de disponibilidad de un local (TTL corto)
export async function getAvailability(ctx: TenantCtx, env: Env, locationId: string, date: string) {
  const cache = new OrgCache(env.CONFIG);
  const cached = await cache.get(ctx, \`avail:\${locationId}:\${date}\`);
  if (cached) return cached;
  const result = await computeAvailability(env, ctx, locationId, date);
  await cache.set(ctx, \`avail:\${locationId}:\${date}\`, result, 30); // 30s
  return result;
}`;

type CacheRule = {
  id: string;
  tipo: string;
  kv: string;
  ttl: string;
  notas: string;
};

const CACHE_RULES: CacheRule[] = [
  { id: "settings", tipo: "Configuración por org (settings)", kv: "Sí", ttl: "300s", notas: "invalidar al actualizar" },
  { id: "flags", tipo: "Feature flags", kv: "Sí", ttl: "60s", notas: "replicados desde D1" },
  { id: "avail", tipo: "Disponibilidad de local", kv: "Sí", ttl: "30s", notas: "invalidar al crear/cancelar reserva" },
  { id: "layout", tipo: "Planos de mesa (layout)", kv: "Sí", ttl: "600s", notas: "invalidar al mover/crear mesa" },
  { id: "perms", tipo: "Catálogo de permisos", kv: "No (memoria request)", ttl: "—", notas: "autoridad en D1" },
  { id: "sessions", tipo: "Sesiones", kv: "No", ttl: "—", notas: "autoridad en D1" },
  { id: "entitlements", tipo: "Entitlements", kv: "No", ttl: "—", notas: "autoridad en D1 + Stripe" },
  { id: "txn", tipo: "Datos transaccionales", kv: "No", ttl: "—", notas: "autoridad en D1" },
  { id: "tokens", tipo: "Tokens sensibles", kv: "No", ttl: "—", notas: "nunca en KV" },
];

export function Fase4Cache() {
  return (
    <Section
      id="f4-cache"
      index="14"
      eyebrow="Caché namespaced"
      title="KV con namespace por organización e invalidación por tenant."
      intro={
        <>
          KV se usa solo para datos de lectura frecuente: configuración, feature flags y caché
          namespaced. <strong className="text-foreground">Nunca es fuente de verdad</strong> para
          datos transaccionales. Todas las claves llevan prefijo <Mono>org:{`{id}`}:</Mono> con TTL
          explícito y invalidación por organización. Mutar la configuración de la organización A
          nunca afecta a la caché de la organización B (prevención de cache poisoning cross-tenant).
        </>
      }
    >
      <H3 className="mb-4">Servicio de caché namespaced</H3>
      <Code lang="typescript">{CACHE_CODE}</Code>
      <Lead className="mt-3">
        <Mono>OrgCache</Mono> encapsula el prefijo <Mono>org:{`{id}`}:</Mono> en cada clave.
        Invalidación granular por sufijo y purge masivo por organización al desactivar.
      </Lead>

      <div className="mt-10">
        <H3 className="mb-4">Qué cachear y qué no</H3>
        <DataTable
          head={["Tipo", "¿KV?", "TTL", "Notas"]}
          rows={CACHE_RULES.map((r) => [
            <span key={`cache-${r.id}-tipo`}>
              <Mono>{r.tipo}</Mono>
            </span>,
            <span key={`cache-${r.id}-kv`} className="text-foreground/80">
              {r.kv}
            </span>,
            <span key={`cache-${r.id}-ttl`} className="font-mono text-xs text-foreground/80">
              {r.ttl}
            </span>,
            <span key={`cache-${r.id}-notas`} className="text-muted-foreground text-xs">
              {r.notas}
            </span>,
          ])}
        />
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-5 items-start">
        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">reglas</Pill>
            <H3>Reglas de caché</H3>
          </div>
          <GoldList
            items={[
              "Claves con prefijo org:{id}:…, nunca claves globales con datos tenant.",
              "TTL siempre: no existe caché infinita en KV.",
              "Invalidar al mutar el recurso subyacente (write-through).",
              "Cache poisoning prevenido: mutar org A no afecta a cache de org B.",
              "Purge por organización al desactivar o suspender.",
              "KV nunca es autoridad para permisos, sesiones ni entitlements.",
              "Lectura cacheada + escritura canónica en D1 (single source of truth).",
            ]}
          />
        </GlassCard>

        <Callout kind="warn" title="KV no es fuente de verdad">
          KV ofrece consistencia eventual. Cualquier dato que requiera consistencia fuerte
          (permisos, sesiones, entitlements, facturación) vive en D1. KV solo refleja derivados
          cacheados con TTL corto. Si la caché se pierde, el sistema sigue funcionando
          correctamente: simplemente más lento durante el calentamiento.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  15 — FACTURACIÓN (STRIPE)                                   */
/* ============================================================ */
const BILLING_SEQ_CHART = `sequenceDiagram
  participant U as Owner
  participant W as Worker API
  participant Stripe as Stripe
  participant D1 as D1
  participant Q as WebhookQueue
  U->>W: cambiar plan
  W->>Stripe: crear suscripcion
  Stripe-->>W: subscription id
  W->>D1: INSERT subscriptions
  Stripe-->>Q: webhook invoice.paid
  Q->>W: consumer
  W->>D1: INSERT invoice update entitlements
  W-->>U: plan activo`;

const STRIPE_WEBHOOK_CODE = `// workers/webhooks/src/stripe.ts
import Stripe from "stripe";

export async function handleStripeWebhook(env: Env, req: Request): Promise<Response> {
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig!, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return new Response("invalid signature", { status: 400 });
  }

  // Idempotencia: cada evento Stripe tiene id único
  const seen = await env.DB.prepare(
    "SELECT 1 FROM stripe_events WHERE event_id = ?"
  ).bind(event.id).first();
  if (seen) return new Response("ok", { status: 200 });

  switch (event.type) {
    case "invoice.paid": {
      const inv = event.data.object as Stripe.Invoice;
      await env.DB.prepare(
        \`INSERT INTO invoices (organization_id, id, subscription_id, stripe_invoice_ref,
                               amount_minor, currency, tax_minor, status, issued_at)
         VALUES (?,?,?,?,?,?,?,?,?)\`
      ).bind(inv.metadata.organization_id, ulid(), inv.subscription ?? null, inv.id,
             inv.total, inv.currency.toUpperCase(), inv.tax ?? 0, "paid", nowUtc()).run();
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      await env.DB.prepare(
        \`UPDATE subscriptions SET status = ?, current_period_start = ?, current_period_end = ?
         WHERE organization_id = ? AND stripe_sub_ref = ?\`
      ).bind(sub.status, new Date(sub.current_period_start * 1000).toISOString(),
             new Date(sub.current_period_end * 1000).toISOString(),
             sub.metadata.organization_id, sub.id).run();
      break;
    }
  }

  await env.DB.prepare("INSERT INTO stripe_events (event_id, type, at) VALUES (?,?,?)")
    .bind(event.id, event.type, nowUtc()).run();
  return new Response("ok", { status: 200 });
}`;

type PlanLimit = {
  id: string;
  plan: string;
  locales: string;
  usuarios: string;
  almacenamiento: string;
  reservas: string;
  ia: string;
};

const PLAN_LIMITS: PlanLimit[] = [
  { id: "solo", plan: "solo", locales: "1", usuarios: "3", almacenamiento: "5 GB", reservas: "500", ia: "100" },
  { id: "pro", plan: "pro", locales: "5", usuarios: "15", almacenamiento: "50 GB", reservas: "5.000", ia: "2.000" },
  { id: "group", plan: "group", locales: "25", usuarios: "50", almacenamiento: "250 GB", reservas: "50.000", ia: "20.000" },
  { id: "enterprise", plan: "enterprise", locales: "ilimitado*", usuarios: "ilimitado*", almacenamiento: "1 TB+", reservas: "ilimitado*", ia: "personalizado" },
];

export function Fase4Billing() {
  return (
    <Section
      id="f4-billing"
      index="15"
      eyebrow="Facturación (Stripe)"
      title="Stripe como fuente de cobro; entitlements reflejados en D1."
      intro={
        <>
          Planes, suscripciones, facturas, IVA, pagos, límites por plan, webhooks idempotentes e
          historial consultable. Stripe es la <strong className="text-foreground">fuente de
          cobro</strong>: D1 refleja suscripciones y entitlements derivados de los webhooks. Los
          límites por plan (locales, usuarios, almacenamiento, reservas, emails, WhatsApps, IA) se
          aplican en servidor en cada operación que consume recurso.
        </>
      }
    >
      <H3 className="mb-4">Suscripción + webhook idempotente</H3>
      <Mermaid chart={BILLING_SEQ_CHART} />
      <Lead className="mt-3">
        El Owner solicita cambio de plan → Worker crea la suscripción en Stripe → D1 persiste el
        estado local → Stripe emite <Mono>invoice.paid</Mono> → la cola entrega el webhook → el
        Worker inserta la factura y actualiza entitlements → el plan queda activo.
      </Lead>

      <div className="mt-10">
        <H3 className="mb-4">Handler de webhook Stripe (idempotente)</H3>
        <Code lang="typescript">{STRIPE_WEBHOOK_CODE}</Code>
      </div>

      <div className="mt-10">
        <H3 className="mb-4">Límites por plan (ejemplo)</H3>
        <DataTable
          head={["Plan", "Locales", "Usuarios", "Almacenamiento", "Reservas/mes", "IA/mes"]}
          rows={PLAN_LIMITS.map((p) => [
            <span key={`plan-${p.id}-name`}>
              <Mono>{p.plan}</Mono>
            </span>,
            <span key={`plan-${p.id}-loc`} className="text-foreground/80">
              {p.locales}
            </span>,
            <span key={`plan-${p.id}-usr`} className="text-foreground/80">
              {p.usuarios}
            </span>,
            <span key={`plan-${p.id}-sto`} className="text-foreground/80">
              {p.almacenamiento}
            </span>,
            <span key={`plan-${p.id}-res`} className="font-mono text-xs text-foreground/80">
              {p.reservas}
            </span>,
            <span key={`plan-${p.id}-ia`} className="font-mono text-xs text-foreground/80">
              {p.ia}
            </span>,
          ])}
        />
        <Lead className="mt-3">
          <Mono>*</Mono> ilimitado sujeto a uso razonable y acuerdos enterprise. Los límites se
          comprueban en servidor en cada mutación (crear local, invitar usuario, subir archivo,
          confirmar reserva, enviar mensaje, llamar a IA).
        </Lead>
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-5 items-start">
        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">reglas</Pill>
            <H3>Reglas de billing</H3>
          </div>
          <GoldList
            items={[
              "Stripe es la fuente de cobro; D1 refleja suscripciones y entitlements.",
              "Webhooks idempotentes: cada event_id se deduplica en stripe_events.",
              "Límites por plan enforced en servidor (locales, usuarios, almacenamiento, reservas, emails, WhatsApps, IA).",
              "Impuestos (IVA) gestionados en Stripe Tax.",
              "Historial de facturas consultable por el Owner y por Contabilidad.",
              "Prorrata automática al cambiar de plan a mitad de ciclo.",
              "Cancelación con degradación graciosa: no borrado inmediato de datos.",
            ]}
          />
        </GlassCard>

        <Callout kind="ok" title="Webhooks idempotentes">
          Cada evento Stripe tiene un <Mono>event_id</Mono> único. Se persiste en{" "}
          <Mono>stripe_events</Mono> para dedup. Si Stripe reenvía el mismo evento (y lo hace), el
          handler lo ignora tras la primera vez. La inserción del evento se hace{" "}
          <strong className="text-foreground">después</strong> del procesamiento, dentro de la misma
          transacción lógica, para garantizar exactly-once efectivo sobre D1.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  16 — CRM Y REPUTACIÓN                                       */
/* ============================================================ */
const CRM_ENTITIES: { id: string; entidad: string; proposito: string; sensible: string }[] = [
  { id: "customers", entidad: "customers", proposito: "cliente maestro", sensible: "PII alta" },
  { id: "preferences", entidad: "customer_preferences", proposito: "preferencias (alérgenos, mesa)", sensible: "medio" },
  { id: "tags", entidad: "customer_tags", proposito: "etiquetas (VIP, riesgo)", sensible: "bajo" },
  { id: "visits", entidad: "customer_visits", proposito: "historial de visitas", sensible: "medio" },
  { id: "notes", entidad: "customer_notes", proposito: "notas internas", sensible: "medio" },
  { id: "segments", entidad: "segments", proposito: "segmentos dinámicos", sensible: "bajo" },
  { id: "campaigns", entidad: "campaigns", proposito: "campañas de marketing", sensible: "bajo" },
  { id: "consents", entidad: "consents", proposito: "consentimientos por canal/finalidad", sensible: "alto (legal)" },
];

const CRM_SERVICE_CODE = `// packages/crm/src/application/crm-service.ts
export async function evaluateSegment(env: Env, ctx: TenantCtx, segmentId: string) {
  // Ejecuta la regla del segmento sobre customers, SIEMPRE con org_id
  const seg = await env.DB.prepare(
    "SELECT rule_def FROM segments WHERE organization_id = ? AND id = ?"
  ).bind(ctx.organization_id, segmentId).first();
  if (!seg) throw new HttpError(404, "segment_not_found");
  // rule_def se compila a SQL seguro con org_id forzado
  const sql = compileSegmentRule(seg.rule_def as string, ctx.organization_id);
  return env.DB.prepare(sql.sql).bind(...sql.params).all();
}

export async function exportCrm(env: Env, ctx: TenantCtx, filter: ExportFilter) {
  // 1. Permiso
  if (!ctx.permission_keys.includes("crm.export")) throw new HttpError(403, "forbidden");
  // 2. Encolar exportación pesada
  await env.EXPORT_QUEUE.send({
    export_id: ulid(), organization_id: ctx.organization_id, type: "crm", filter, actor_id: ctx.actor_id,
  });
  // 3. Auditoría
  await audit(env, ctx, { action: "export", resource_type: "crm", resource_id: "all", result: "success", duration_ms: 0 });
}

export async function hasConsent(env: Env, ctx: TenantCtx, customerId: string, channel: "email" | "whatsapp" | "sms", purpose: string): Promise<boolean> {
  const c = await env.DB.prepare(
    \`SELECT 1 FROM consents WHERE organization_id = ? AND customer_id = ? AND channel = ? AND purpose = ? AND granted = 1\`
  ).bind(ctx.organization_id, customerId, channel, purpose).first();
  return !!c;
}`;

type RepIntegration = {
  id: string;
  proveedor: string;
  datos: string;
  auth: string;
  sync: string;
};

const REP_INTEGRATIONS: RepIntegration[] = [
  { id: "google", proveedor: "Google Business Profile", datos: "reseñas, rating, respuestas", auth: "OAuth scopes", sync: "incremental por cursor" },
  { id: "tripadvisor", proveedor: "Tripadvisor", datos: "reseñas (futuro)", auth: "API partner", sync: "incremental" },
  { id: "thefork", proveedor: "TheFork", datos: "reseñas (futuro)", auth: "API partner", sync: "incremental" },
  { id: "facebook", proveedor: "Facebook", datos: "reseñas de página (futuro)", auth: "OAuth", sync: "incremental" },
  { id: "instagram", proveedor: "Instagram", datos: "comentarios a publicaciones (futuro)", auth: "OAuth", sync: "incremental" },
];

export function Fase4CRM() {
  return (
    <Section
      id="f4-crm"
      index="16"
      eyebrow="CRM y reputación"
      title="Memoria del cliente y reputación conectada."
      intro={
        <>
          Tags, segmentos, VIP, historial, campañas, preferencias, consentimientos, exportaciones y
          valor del cliente. Reputación integrada con Google Business Profile (presente) y
          Tripadvisor, TheFork, Facebook e Instagram (futuro). Toda comunicación respeta
          consentimiento por canal y finalidad, horario silencioso y cuota por plan.
        </>
      }
    >
      <H3 className="mb-4">Entidades CRM</H3>
      <DataTable
        head={["Entidad", "Propósito", "Sensible"]}
        rows={CRM_ENTITIES.map((e) => [
          <span key={`crm-${e.id}-ent`}>
            <Mono>{e.entidad}</Mono>
          </span>,
          <span key={`crm-${e.id}-pro`} className="text-foreground/80">
            {e.proposito}
          </span>,
          <span key={`crm-${e.id}-sen`} className="text-xs text-muted-foreground">
            {e.sensible}
          </span>,
        ])}
      />

      <div className="mt-10">
        <H3 className="mb-4">Servicio CRM: segmentos, exportación y consentimiento</H3>
        <Code lang="typescript">{CRM_SERVICE_CODE}</Code>
        <Lead className="mt-3">
          <Mono>evaluateSegment</Mono> fuerza <Mono>organization_id</Mono> en la SQL compilada.{" "}
          <Mono>exportCrm</Mono> exige el permiso <Mono>crm.export</Mono>, encola la exportación y
          audita. <Mono>hasConsent</Mono> comprueba el consentimiento vigente por canal y finalidad
          antes de cualquier envío.
        </Lead>
      </div>

      <div className="mt-10">
        <H3 className="mb-4">Integraciones de reputación</H3>
        <DataTable
          head={["Proveedor", "Datos", "Auth", "Sync"]}
          rows={REP_INTEGRATIONS.map((p) => [
            <span key={`rep-${p.id}-prov`}>
              <Mono>{p.proveedor}</Mono>
            </span>,
            <span key={`rep-${p.id}-datos`} className="text-foreground/80">
              {p.datos}
            </span>,
            <span key={`rep-${p.id}-auth`} className="text-xs text-muted-foreground">
              {p.auth}
            </span>,
            <span key={`rep-${p.id}-sync`} className="text-xs text-muted-foreground">
              {p.sync}
            </span>,
          ])}
        />
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-5 items-start">
        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">reglas</Pill>
            <H3>Reglas de CRM y reputación</H3>
          </div>
          <GoldList
            items={[
              "PII alta: consentimiento capturado y versionado por canal y finalidad.",
              "Exportación requiere permiso crm.export y se audita.",
              "Segmentos evaluados con org_id forzado en SQL.",
              "Campañas respetan consentimiento + horario silencioso + cuota por plan.",
              "Reseñas: la IA propone respuesta, aprobación humana obligatoria antes de publicar.",
              "Tags VIP / risk alimentados por eventos (recurrencia, no-show).",
            ]}
          />
        </GlassCard>

        <Callout kind="warn" title="Consentimiento obligatorio">
          Nada se envía sin consentimiento válido por canal y finalidad. Los consentimientos se
          versionan (cuándo, qué versión de política). La retirada actualiza <Mono>consents</Mono>{" "}
          inmediatamente y bloquea envíos futuros. Las campañas y automatizaciones comprueban{" "}
          <Mono>hasConsent()</Mono> en el momento del envío, no solo al crear la campaña.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  17 — DASHBOARD, HOOKS Y WIDGETS                             */
/* ============================================================ */
const DASHBOARD_KPIS: { id: string; kpi: string; fuente: string; frecuencia: string }[] = [
  { id: "revenue", kpi: "Ingresos", fuente: "billing + POS (si integrado)", frecuencia: "batch diario" },
  { id: "reservations", kpi: "Reservas", fuente: "reservations", frecuencia: "tiempo real" },
  { id: "occupancy", kpi: "Ocupación", fuente: "reservations + mesas", frecuencia: "tiempo real" },
  { id: "avg_ticket", kpi: "Ticket medio", fuente: "POS / billing", frecuencia: "batch" },
  { id: "no_shows", kpi: "No-shows", fuente: "reservations (status)", frecuencia: "tiempo real" },
  { id: "cancellations", kpi: "Cancelaciones", fuente: "reservations (status)", frecuencia: "tiempo real" },
  { id: "new_customers", kpi: "Clientes nuevos", fuente: "customers", frecuencia: "tiempo real" },
  { id: "recurring", kpi: "Clientes recurrentes", fuente: "customer_visits", frecuencia: "batch" },
  { id: "ltv", kpi: "Valor del cliente", fuente: "customers (lifetime_value)", frecuencia: "batch" },
  { id: "stay", kpi: "Tiempo medio de estancia", fuente: "reservations (checkin/checkout)", frecuencia: "batch" },
  { id: "compare", kpi: "Comparativa periodos", fuente: "analytics_daily", frecuencia: "batch" },
];

const RESERVATIONS_HOOK_CODE = `// apps/dashboard/src/hooks/use-reservations.ts
import { useQuery } from "@tanstack/react-query";

export interface Reservation {
  id: string;
  location_id: string;
  customer_id: string;
  status: string;
  party_size: number;
  reserved_at: string;
}

export function useReservations(locationId: string, date: string) {
  return useQuery<Reservation[]>({
    queryKey: ["reservations", locationId, date],
    queryFn: async () => {
      const res = await fetch(\`/api/v1/reservations?location_id=\${locationId}&date=\${date}\`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("fetch_failed");
      return res.json();
    },
    staleTime: 15_000, // 15s
    retry: 2,
  });
}

// Widget configurable
export function ReservationsWidget({ locationId, date }: { locationId: string; date: string }) {
  const { data, isLoading, error } = useReservations(locationId, date);
  if (isLoading) return <WidgetSkeleton />;
  if (error) return <WidgetError message="No se pudieron cargar las reservas" />;
  return (
    <div role="region" aria-label="Reservas del día">
      <ul>{data?.map((r) => <li key={r.id}>{r.reserved_at} · {r.party_size} pax</li>)}</ul>
    </div>
  );
}`;

const WIDGET_REGISTRY_CODE = `// apps/dashboard/src/widgets/registry.ts
export interface WidgetDef {
  id: string;
  title: string;
  requiredPermission: string;
  render: () => React.ReactNode;
  defaultSize: "sm" | "md" | "lg";
}

export const WIDGETS: WidgetDef[] = [
  { id: "reservations_today", title: "Reservas de hoy", requiredPermission: "reservations.read", render: () => <ReservationsWidget />, defaultSize: "md" },
  { id: "occupancy", title: "Ocupación", requiredPermission: "reports.read", render: () => <OccupancyWidget />, defaultSize: "md" },
  { id: "no_shows", title: "No-shows", requiredPermission: "reports.read", render: () => <NoShowsWidget />, defaultSize: "sm" },
  { id: "revenue", title: "Ingresos", requiredPermission: "billing.read", render: () => <RevenueWidget />, defaultSize: "lg" },
  { id: "ai_forecast", title: "Forecast IA", requiredPermission: "reports.read", render: () => <ForecastWidget />, defaultSize: "lg" },
];

// Filtrar widgets por permisos del rol
export function visibleWidgets(ctx: { permission_keys: readonly string[] }): WidgetDef[] {
  return WIDGETS.filter((w) => ctx.permission_keys.includes(w.requiredPermission));
}`;

export function Fase4Dashboard() {
  return (
    <Section
      id="f4-dashboard"
      index="17"
      eyebrow="Dashboard, hooks y widgets"
      title="Dashboard configurable tipo Stripe: widgets, hooks y tiempo real."
      intro={
        <>
          Dashboard configurable con KPIs (ingresos, reservas, ocupación, ticket medio, no-shows,
          cancelaciones, nuevos vs recurrentes, valor del cliente, tiempo medio de estancia,
          comparativa de periodos), datos en tiempo real, mapas de calor, horas punta, evolución
          mensual, comparativa multi-local, forecast IA, alertas operativas y anomalías. Los
          widgets son movibles, ocultables y restaurables, y la configuración se guarda por usuario
          y por organización con dashboards por rol.
        </>
      }
    >
      <H3 className="mb-4">KPIs del dashboard</H3>
      <DataTable
        head={["KPI", "Fuente", "Frecuencia"]}
        rows={DASHBOARD_KPIS.map((k) => [
          <span key={`kpi-${k.id}-name`}>
            <Mono>{k.kpi}</Mono>
          </span>,
          <span key={`kpi-${k.id}-src`} className="text-foreground/80">
            {k.fuente}
          </span>,
          <span key={`kpi-${k.id}-freq`} className="text-xs text-muted-foreground">
            {k.frecuencia}
          </span>,
        ])}
      />

      <div className="mt-10 grid lg:grid-cols-2 gap-5">
        <div>
          <H3 className="mb-4">Hook de datos: useReservations</H3>
          <Code lang="typescript">{RESERVATIONS_HOOK_CODE}</Code>
        </div>
        <div>
          <H3 className="mb-4">Registro de widgets y filtros por rol</H3>
          <Code lang="typescript">{WIDGET_REGISTRY_CODE}</Code>
        </div>
      </div>
      <Lead className="mt-3">
        El hook usa TanStack Query con <Mono>staleTime: 15s</Mono> y <Mono>retry: 2</Mono>. La API
        es la que aplica el contexto de tenant: el hook solo la llama con credenciales. El registro
        de widgets expone <Mono>requiredPermission</Mono> y <Mono>visibleWidgets()</Mono> filtra por
        los permisos efectivos del rol del usuario.
      </Lead>

      <div className="mt-10 grid lg:grid-cols-2 gap-5 items-start">
        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">sistema</Pill>
            <H3>Sistema de widgets</H3>
          </div>
          <GoldList
            items={[
              "Widgets movibles, ocultables y restaurables a la configuración por defecto.",
              "Configuración guardada por usuario y por organización.",
              "Dashboards diferentes por rol vía requiredPermission.",
              "Tiempo real vía WebSocket (Durable Object por floor) para ocupación y mesas.",
              "KPIs batch desde analytics_daily (precalculados).",
              "Forecast IA con badge de confianza visible.",
              "Alertas operativas y detección de anomalías.",
              "Responsive y accesible: roles ARIA, foco visible, navegación por teclado.",
            ]}
          />
        </GlassCard>

        <Callout kind="ok" title="Dashboard por rol">
          El dashboard no es una pantalla única: cada rol ve los widgets para los que tiene
          permiso. Recepción ve reservas y check-in; Marketing ve CRM y campañas; Contabilidad ve
          ingresos; el Owner ve todo. La configuración de widgets se guarda por usuario dentro del
          rol, de modo que dos Manager del mismo restaurante pueden tener layouts distintos.
        </Callout>
      </div>
    </Section>
  );
}
