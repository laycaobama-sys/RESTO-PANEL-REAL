import * as React from "react";
import {
  Section,
  GlassCard,
  Risk,
  Pill,
  H3,
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
/*  15 — BILLING, MARKETPLACE E INTEGRACIONES                   */
/* ============================================================ */
const BILLING_CAPS: { id: string; cap: string; impl: string; estado: string }[] = [
  { id: "subs", cap: "Suscripciones", impl: "Stripe Subscriptions + webhook sync", estado: "adaptador" },
  { id: "checkout", cap: "Checkout", impl: "Stripe Checkout (hosted)", estado: "adaptador" },
  { id: "portal", cap: "Customer Portal", impl: "Stripe Customer Portal", estado: "adaptador" },
  { id: "inv", cap: "Facturas", impl: "stripe_invoice_ref en D1", estado: "adaptador" },
  { id: "fail", cap: "Pagos fallidos", impl: "webhook invoice.payment_failed + dunning", estado: "adaptador" },
  { id: "pror", cap: "Prorrateos", impl: "Stripe proration", estado: "adaptador" },
  { id: "up", cap: "Upgrades/Downgrades", impl: "Stripe subscription update", estado: "adaptador" },
  { id: "cup", cap: "Cupones", impl: "Stripe Coupons/Promotion Codes", estado: "adaptador" },
  { id: "lim", cap: "Límites por plan", impl: "entitlements en D1, enforced en servidor", estado: "propio" },
  { id: "wh", cap: "Webhooks", impl: "idempotentes (event_id dedup) + firma HMAC", estado: "propio" },
  { id: "retry", cap: "Reintentos", impl: "backoff + DLQ", estado: "propio" },
  { id: "status", cap: "Estado de pago", impl: "reflejado en subscription.status", estado: "propio" },
];

const MARKETPLACE: { id: string; integ: string; bene: string; estado: string }[] = [
  { id: "stripe", integ: "Stripe", bene: "cobros y suscripciones", estado: "adaptador" },
  { id: "wa", integ: "WhatsApp Cloud", bene: "mensajería", estado: "adaptador" },
  { id: "meta", integ: "Meta / Instagram", bene: "contenido (futuro)", estado: "pendiente" },
  { id: "gbp", integ: "Google Business Profile", bene: "reseñas", estado: "adaptador" },
  { id: "gcal", integ: "Google Calendar", bene: "sync reservas", estado: "adaptador" },
  { id: "hub", integ: "HubSpot", bene: "CRM sync (futuro)", estado: "pendiente" },
  { id: "sf", integ: "Salesforce", bene: "CRM enterprise (futuro)", estado: "pendiente" },
  { id: "zap", integ: "Zapier / Make", bene: "automatización genérica", estado: "adaptador" },
  { id: "slack", integ: "Slack", bene: "alertas internas", estado: "adaptador" },
  { id: "erp", integ: "ERP", bene: "sincronización (futuro)", estado: "pendiente" },
  { id: "tpv", integ: "TPV", bene: "sync pedidos (futuro)", estado: "pendiente" },
];

export function ProductoBilling() {
  return (
    <Section
      id="p-billing"
      index="15"
      eyebrow="Billing, marketplace e integraciones"
      title="Stripe desacoplado, marketplace y adaptadores."
      intro={
        <>
          Arquitectura desacoplada para suscripciones, checkout, customer portal, facturas, pagos
          fallidos, prorrateos, upgrades/downgrades, cupones, límites por plan, webhooks,
          reintentos, idempotencia y estado de pago. Marketplace con Stripe, WhatsApp, Meta,
          Google, HubSpot, Salesforce, Zapier, Make, Slack, ERP y TPV. Cada integración es un
          adaptador swapeable con estado honesto: conectado, demo o pendiente.
        </>
      }
    >
      <div className="space-y-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">billing</Pill>
            <H3>Capacidades de billing</H3>
          </div>
          <DataTable
            head={["Capacidad", "Implementación", "Estado"]}
            rows={BILLING_CAPS.map((c) => [
              <span key={`cap-${c.id}`}>
                <Mono>{c.cap}</Mono>
              </span>,
              <span key={`impl-${c.id}`} className="text-foreground/80">
                {c.impl}
              </span>,
              <span
                key={`est-${c.id}`}
                className={
                  "font-mono text-xs " +
                  (c.estado === "adaptador"
                    ? "text-[var(--teal)]"
                    : "text-[var(--gold-soft)]")
                }
              >
                {c.estado}
              </span>,
            ])}
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="teal">marketplace</Pill>
            <H3>Marketplace de integraciones</H3>
          </div>
          <DataTable
            head={["Integración", "Beneficio", "Estado demo"]}
            rows={MARKETPLACE.map((m) => [
              <span key={`integ-${m.id}`}>
                <Mono>{m.integ}</Mono>
              </span>,
              <span key={`bene-${m.id}`} className="text-foreground/80">
                {m.bene}
              </span>,
              <span
                key={`estd-${m.id}`}
                className={
                  "font-mono text-xs " +
                  (m.estado === "adaptador"
                    ? "text-[var(--teal)]"
                    : "text-amber-300")
                }
              >
                {m.estado}
              </span>,
            ])}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-5 items-start">
          <GlassCard variant="gold">
            <div className="flex items-center gap-2 mb-4">
              <Pill tone="gold">transparencia</Pill>
              <H3>Cada integración muestra</H3>
            </div>
            <GoldList
              items={[
                <><strong className="text-foreground">Descripción</strong> clara del propósito.</>,
                <><strong className="text-foreground">Beneficio</strong> concreto para el restaurante.</>,
                <><strong className="text-foreground">Estado</strong> conectado · demo · pendiente.</>,
                <><strong className="text-foreground">Versión</strong> del adaptador en uso.</>,
                <><strong className="text-foreground">Permisos</strong> que solicita (scopes OAuth).</>,
                <><strong className="text-foreground">Última sincronización</strong> con timestamp.</>,
                <><strong className="text-foreground">Logs</strong> recientes visibles para el owner.</>,
                <><strong className="text-foreground">Instalar / desconectar / reautenticar</strong> como acciones explícitas.</>,
                <><strong className="text-foreground">Documentación</strong> enlazada por integración.</>,
                <>NUNCA mostrar <em className="text-foreground">“conectado”</em> sin conexión real o modo demo claramente indicado.</>,
              ]}
            />
          </GlassCard>

          <Callout kind="warn" title="No simular conexiones reales">
            Una integración muestra <strong className="text-foreground">“conectado”</strong> solo cuando hay
            credenciales válidas o un modo demo explícito. El estado{" "}
            <strong className="text-foreground">“pendiente”</strong> es honesto: la integración existe como
            adaptador pero no está configurada para esta org. No se inventan datos de terceros para aparentar
            una conexión que no existe.
          </Callout>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  16 — SUPER ADMIN                                            */
/* ============================================================ */
const PLATFORM_METRICS: { id: string; metric: string; def: string; freq: string }[] = [
  { id: "mrr", metric: "MRR", def: "monthly recurring revenue", freq: "tiempo real" },
  { id: "arr", metric: "ARR", def: "annual recurring revenue", freq: "batch" },
  { id: "ltv", metric: "LTV", def: "lifetime value", freq: "batch" },
  { id: "cac", metric: "CAC", def: "customer acquisition cost", freq: "batch" },
  { id: "arpu", metric: "ARPU", def: "average revenue per user", freq: "batch" },
  { id: "churn", metric: "churn", def: "tasa de baja", freq: "mensual" },
  { id: "conv", metric: "conversión", def: "trial → paid", freq: "batch" },
  { id: "orgs", metric: "orgs activas", def: "counter", freq: "real" },
  { id: "locs", metric: "locales activos", def: "counter", freq: "real" },
  { id: "res", metric: "reservas totales", def: "counter", freq: "real" },
  { id: "ai", metric: "uso IA", def: "credits consumidos", freq: "real" },
  { id: "api", metric: "uso API", def: "requests", freq: "real" },
  { id: "cost", metric: "coste infra", def: "Workers + D1 + R2 + KV + Queues", freq: "batch" },
];

const IMPERSONATION: { id: string; req: string; impl: string }[] = [
  { id: "consent", req: "consentimiento / autorización", impl: "configurable por org" },
  { id: "dur", req: "duración limitada", impl: "minutos, con expiración automática" },
  { id: "motivo", req: "motivo obligatorio", impl: "campo free-text con validación" },
  { id: "staff", req: "usuario de soporte identificado", impl: "staff_id vinculado a la sesión" },
  { id: "ts", req: "inicio / fin timestamp", impl: "audit inmutable con started_at / ended_at" },
  { id: "actions", req: "acciones realizadas", impl: "audit de mutaciones durante la sesión" },
  { id: "read", req: "recursos consultados", impl: "audit de lecturas sensibles" },
  { id: "ip", req: "IP y dispositivo", impl: "fingerprint + user-agent" },
  { id: "revoke", req: "revocación inmediata", impl: "kill switch por sesión o global" },
  { id: "audit", req: "registro inmutable", impl: "append-only, sin edición ni borrado" },
  { id: "vis", req: "visibilidad para el cliente", impl: "notificación al owner + panel de accesos" },
  { id: "alert", req: "alertas de seguridad", impl: "trigger en patrones anómalos" },
  { id: "deny", req: "prohibición de datos no necesarios", impl: "scope mínimo por motivo" },
];

const SUPER_ADMIN_RULES = `stateDiagram-v2
  [*] --> Solicitada: staff + motivo
  Solicitada --> Verificada: MFA reciente OK
  Verificada --> ActivaLectura: sesion read_only
  ActivaLectura --> ActivaEscritura: elevacion + MFA + motivo
  ActivaLectura --> Revocada: expira o kill switch
  ActivaEscritura --> Revocada: expira o kill switch
  Revocada --> [*]: audit cerrado`;

export function ProductoSuperAdmin() {
  return (
    <Section
      id="p-super-admin"
      index="16"
      eyebrow="Super Admin"
      title="Aplicación independiente con métricas de plataforma."
      intro={
        <>
          Aplicación independiente del panel de cliente. Muestra MRR, ARR, LTV, CAC, ARPU, churn,
          conversión, clientes, organizaciones, locales, usuarios, reservas, billing, revenue,
          pagos fallidos, uso de IA, uso de API, costes de infra (Workers, D1, R2, KV, Queues),
          logs, alertas, incidentes, mapa mundial, heatmap de actividad, ranking de clientes,
          ranking de revenue, ranking de reservas, estado de infra, backups, health checks y
          estado de integraciones.
        </>
      }
    >
      <div className="space-y-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">plataforma</Pill>
            <H3>Métricas de plataforma</H3>
          </div>
          <DataTable
            head={["Métrica", "Definición", "Frecuencia"]}
            rows={PLATFORM_METRICS.map((m) => [
              <span key={`met-${m.id}`}>
                <Mono>{m.metric}</Mono>
              </span>,
              <span key={`def-${m.id}`} className="text-foreground/80">
                {m.def}
              </span>,
              <span
                key={`freq-${m.id}`}
                className={
                  "font-mono text-xs " +
                  (m.freq === "tiempo real" || m.freq === "real"
                    ? "text-[var(--teal)]"
                    : "text-muted-foreground")
                }
              >
                {m.freq}
              </span>,
            ])}
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">soporte</Pill>
            <H3>Acceso de soporte (impersonación)</H3>
          </div>
          <DataTable
            head={["Requisito", "Implementación"]}
            rows={IMPERSONATION.map((r) => [
              <span key={`req-${r.id}`} className="text-foreground/90">
                {r.req}
              </span>,
              <span key={`imp-${r.id}`} className="text-foreground/70">
                {r.impl}
              </span>,
            ])}
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="teal">state machine</Pill>
            <H3>Ciclo de vida del acceso de soporte</H3>
          </div>
          <Mermaid chart={SUPER_ADMIN_RULES} />
        </div>

        <div className="grid lg:grid-cols-2 gap-5 items-start">
          <GlassCard variant="gold">
            <div className="flex items-center gap-2 mb-4">
              <Pill tone="gold">reglas</Pill>
              <H3>Reglas de Super Admin</H3>
            </div>
            <GoldList
              items={[
                <><strong className="text-foreground">App independiente</strong> — frontera de auth separada del panel de cliente.</>,
                <><strong className="text-foreground">Métricas globales</strong> alimentadas por eventos y agregados, no escaneando tenant cells en tiempo real por cada métrica.</>,
                <><strong className="text-foreground">Impersonación temporal</strong>, visible y auditable.</>,
                <><strong className="text-foreground">Kill switch</strong> global y por tenant.</>,
                <>Acceso a datos sensibles con <strong className="text-foreground">motivo y MFA reciente</strong>.</>,
                <>Mapas y rankings con <strong className="text-foreground">datos agregados</strong>, no PII individual sin auditoría.</>,
              ]}
            />
          </GlassCard>

          <Callout kind="warn" title="Nunca acceso silencioso">
            El acceso de soporte es siempre <strong className="text-foreground">temporal</strong>,{" "}
            <strong className="text-foreground">motivado</strong>,{" "}
            <strong className="text-foreground">visible para el cliente</strong>,{" "}
            <strong className="text-foreground">auditado</strong> y{" "}
            <strong className="text-foreground">revocable</strong>. Ningún acceso indefinido o sin
            auditoría. El owner recibe notificación de cada sesión de impersonación y puede
            revocarla en cualquier momento.
          </Callout>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  17 — DATOS DEMO E INTEGRACIONES DESCADOLADAS                 */
/* ============================================================ */
const DATA_TYPES: { id: string; tipo: string; marca: string; regla: string }[] = [
  { id: "demo", tipo: "Datos demo", marca: "badge “demo”", regla: "siempre etiquetados; no se hacen pasar por reales" },
  { id: "real", tipo: "Datos reales", marca: "sin badge", regla: "solo tras login con org real" },
  { id: "iconn", tipo: "Integración conectada", marca: "“conectado”", regla: "solo con credenciales válidas" },
  { id: "idemo", tipo: "Integración demo", marca: "“demo”", regla: "adaptador devuelve datos de ejemplo" },
  { id: "ipend", tipo: "Integración pendiente", marca: "“pendiente”", regla: "adaptador existe, no configurado" },
  { id: "noda", tipo: "Funcionalidad no disponible", marca: "“no disponible”", regla: "claramente indicado, no oculto" },
];

const ADAPTER_CODE = `// packages/integrations/src/types.ts
export interface ReviewsAdapter {
  readonly provider: string;
  listReviews(ctx: TenantCtx, locationId: string): Promise<Review[]>;
  reply(ctx: TenantCtx, reviewId: string, text: string): Promise<void>;
  health(ctx: TenantCtx): Promise<"connected" | "demo" | "pending">;
}

// packages/integrations/src/adapters/demo-reviews.ts
export class DemoReviewsAdapter implements ReviewsAdapter {
  readonly provider = "demo";
  async listReviews() {
    return DEMO_REVIEWS; // datos de ejemplo claramente etiquetados
  }
  async reply() { /* no-op en demo */ }
  async health() { return "demo" as const; }
}

// packages/integrations/src/adapters/google-reviews.ts
export class GoogleReviewsAdapter implements ReviewsAdapter {
  readonly provider = "google";
  async listReviews(ctx, locationId) {
    if (!await hasCredentials(ctx)) throw new NotConfiguredError("google");
    // llamada real a Google Business Profile API
  }
  async health(ctx) {
    return (await hasCredentials(ctx)) ? "connected" : "pending";
  }
}`;

export function ProductoDemo() {
  return (
    <Section
      id="p-demo"
      index="17"
      eyebrow="Datos demo e integraciones"
      title="Datos demo realistas, claramente identificados; integraciones desacopladas."
      intro={
        <>
          El producto distingue explícitamente datos demo de datos reales. Toda cifra de ejemplo
          lleva un badge “demo”. Las integraciones son adaptadores swapeables con tres estados
          honestos: conectado (credenciales válidas), demo (datos de ejemplo) y pendiente
          (adaptador existe pero no configurado). El usuario siempre sabe qué está viendo.
        </>
      }
    >
      <div className="space-y-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="teal">datos</Pill>
            <H3>Tipos de datos en el producto</H3>
          </div>
          <DataTable
            head={["Tipo", "Marca", "Regla"]}
            rows={DATA_TYPES.map((d) => [
              <span key={`tipo-${d.id}`}>
                <Mono>{d.tipo}</Mono>
              </span>,
              <span key={`marca-${d.id}`} className="text-[var(--gold-soft)] font-mono text-xs">
                {d.marca}
              </span>,
              <span key={`regla-${d.id}`} className="text-foreground/80">
                {d.regla}
              </span>,
            ])}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-5 items-start">
          <GlassCard variant="gold">
            <div className="flex items-center gap-2 mb-4">
              <Pill tone="gold">reglas</Pill>
              <H3>Reglas de datos demo</H3>
            </div>
            <GoldList
              items={[
                <>Toda cifra de ejemplo lleva <strong className="text-foreground">badge “demo”</strong>.</>,
                <>Todo cliente / reserva de ejemplo lleva <strong className="text-foreground">badge</strong>.</>,
                <>Las métricas de la landing son <strong className="text-foreground">demo</strong> hasta que haya datos reales agregados.</>,
                <>Las integraciones no muestran <em className="text-foreground">“conectado”</em> sin conexión real.</>,
                <>El modo demo no bloquea la experiencia — <strong className="text-foreground">degradación elegante</strong>.</>,
                <>El usuario siempre sabe si ve <strong className="text-foreground">demo o real</strong>.</>,
              ]}
            />
          </GlassCard>

          <Callout kind="ok" title="Desacoplado = degradable">
            Si una integración no está configurada, el adaptador demo mantiene la experiencia. El
            usuario ve “demo” y puede probar el flujo completo. Al conectar credenciales reales, el
            adaptador real toma el control sin cambiar la UI. No hay ramas{" "}
            <code className="font-mono text-xs rp-gold-text">if (demo)</code> esparcidas por la app:
            el contrato <code className="font-mono text-xs rp-gold-text">ReviewsAdapter</code> es el mismo.
          </Callout>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">contrato</Pill>
            <H3>Interfaz de servicio + patrón de adaptador demo</H3>
          </div>
          <Code lang="typescript">{ADAPTER_CODE}</Code>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  18 — TESTS Y CHECKLIST QA                                   */
/* ============================================================ */
const TEST_STRATEGY: { id: string; nivel: string; cubre: string; cuando: string }[] = [
  { id: "unit", nivel: "unit", cubre: "lógica, validación Zod", cuando: "cada commit" },
  { id: "integ", nivel: "integración", cubre: "D1 local", cuando: "cada PR" },
  { id: "iso", nivel: "aislamiento", cubre: "cross-tenant negativo", cuando: "cada PR" },
  { id: "idor", nivel: "IDOR", cubre: "por endpoint", cuando: "cada PR" },
  { id: "rbac", nivel: "RBAC", cubre: "escalada de privilegios", cuando: "cada PR" },
  { id: "conc", nivel: "concurrencia", cubre: "DO doble reserva", cuando: "cada PR" },
  { id: "e2e", nivel: "e2e", cubre: "login, reservas, billing, permisos", cuando: "nocturno" },
  { id: "load", nivel: "carga", cubre: "k6", cuando: "pre-deploy" },
  { id: "sec", nivel: "seguridad", cubre: "SAST / DAST / dependencias", cuando: "CI + pre-prod" },
];

const QA_CHECKLIST: { id: string; item: string; verif: string }[] = [
  { id: "q1", item: "Ninguna pantalla importante vacía", verif: "revisión visual" },
  { id: "q2", item: "Ningún botón puramente decorativo", verif: "todo CTA con acción o disabled + reason" },
  { id: "q3", item: "Acciones destructivas con confirmación", verif: "dialog antes de delete / cancel" },
  { id: "q4", item: "Operaciones sensibles con permisos", verif: "RBAC check" },
  { id: "q5", item: "Datos demo no se confunden con reales", verif: "badge “demo”" },
  { id: "q6", item: "Estados de éxito y error", verif: "toast / inline" },
  { id: "q7", item: "Coherencia landing / dashboard / super-admin", verif: "design system" },
  { id: "q8", item: "Responsive mobile / tablet / desktop", verif: "breakpoints reales" },
  { id: "q9", item: "Teclado navegable", verif: "tab order + focus visible" },
  { id: "q10", item: "Lectores de pantalla", verif: "ARIA roles / labels" },
  { id: "q11", item: "Focus states visibles", verif: "ring dorado 2px" },
  { id: "q12", item: "Contraste WCAG AA", verif: "≥ 4.5:1 texto" },
  { id: "q13", item: "Labels accesibles", verif: "form labels reales" },
  { id: "q14", item: "Estados loading / error / empty / success", verif: "skeletons" },
  { id: "q15", item: "Formularios validados", verif: "Zod + mensajes" },
  { id: "q16", item: "Permisos verificados", verif: "RBAC + IDOR" },
  { id: "q17", item: "Aislamiento entre tenants", verif: "tests cross-tenant" },
  { id: "q18", item: "Logs de auditoría", verif: "audit en mutaciones" },
  { id: "q19", item: "Core Web Vitals", verif: "LCP / CLS / INP medidos" },
  { id: "q20", item: "JS mínimo", verif: "RSC por defecto" },
  { id: "q21", item: "Imágenes optimizadas", verif: "next/image + formatos" },
  { id: "q22", item: "Skeletons no spinners", verif: "skeleton preserva layout" },
];

const E2E_CODE = `// e2e/reservations.spec.ts
import { test, expect } from "@playwright/test";

test("login y crear reserva", async ({ page }) => {
  await page.goto("/login");
  await page.fill("[name=email]", "owner@ramses.com");
  await page.fill("[name=password]", process.env.E2E_PASSWORD!);
  await page.click("button[type=submit]");
  await expect(page).toHaveURL(/\\/dashboard/);

  await page.click("text=Reservas");
  await page.click("text=Nueva reserva");
  await page.fill("[name=customer_name]", "Ana García");
  await page.fill("[name=party_size]", "4");
  await page.click("button[type=submit]");
  await expect(page.locator("text=Reserva confirmada")).toBeVisible();
});

test("usuario sin permisos no puede exportar CRM", async ({ page }) => {
  await loginAs(page, "recepcion@ramses.com");
  await page.goto("/clientes");
  await expect(page.locator("text=Exportar")).toBeDisabled();
});`;

export function ProductoTests() {
  return (
    <Section
      id="p-tests"
      index="18"
      eyebrow="Tests y checklist QA"
      title="Tests automatizados y checklist de calidad."
      intro={
        <>
          La calidad no se asume: se prueba. Tests unitarios, de integración, de aislamiento
          cross-tenant, IDOR por endpoint, RBAC, concurrencia vía Durable Objects, e2e con
          Playwright, carga con k6 y seguridad con SAST/DAST. Una checklist QA de 22 ítems
          verifica que ninguna pantalla quede vacía, ningún botón sea decorativo y ninguna acción
          destructiva ocurra sin confirmación.
        </>
      }
    >
      <div className="space-y-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">estrategia</Pill>
            <H3>Estrategia de testing</H3>
          </div>
          <DataTable
            head={["Nivel", "Qué cubre", "Cuándo"]}
            rows={TEST_STRATEGY.map((t) => [
              <span key={`nivel-${t.id}`}>
                <Mono>{t.nivel}</Mono>
              </span>,
              <span key={`cubre-${t.id}`} className="text-foreground/80">
                {t.cubre}
              </span>,
              <span key={`cuando-${t.id}`} className="text-foreground/70">
                {t.cuando}
              </span>,
            ])}
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="teal">e2e</Pill>
            <H3>Test e2e (Playwright) — login + reserva</H3>
          </div>
          <Code lang="typescript">{E2E_CODE}</Code>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">QA</Pill>
            <H3>Checklist QA</H3>
          </div>
          <DataTable
            head={["Item", "Verificación"]}
            rows={QA_CHECKLIST.map((q) => [
              <span key={`item-${q.id}`} className="text-foreground/90">
                {q.item}
              </span>,
              <span key={`verif-${q.id}`} className="font-mono text-xs text-foreground/70">
                {q.verif}
              </span>,
            ])}
          />
        </div>

        <Callout kind="ok" title="Criterios mínimos de aceptación">
          Ninguna pantalla vacía, ningún botón decorativo, ninguna acción destructiva sin
          confirmación, ninguna operación sensible sin permisos, ningún dato demo confundido con
          real. Toda funcionalidad con éxito y error. Experiencia coherente, rápida, mantenible,
          escalable y preparada para producción.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  19 — RIESGOS Y PENDIENTES                                   */
/* ============================================================ */
const TECH_RISKS: {
  id: string;
  riesgo: string;
  impacto: React.ReactNode;
  mit: string;
}[] = [
  {
    id: "rls",
    riesgo: "D1 sin RLS nativa → fuga entre tenants",
    impacto: <Risk level="crítico" />,
    mit: "Tenant Enforcement Layer + constraints + tests IDOR",
  },
  {
    id: "prov",
    riesgo: "Dependencia de proveedores externos (Stripe, WhatsApp, Google)",
    impacto: <Risk level="medio" />,
    mit: "adaptadores swapeables + fallback",
  },
  {
    id: "ai",
    riesgo: "Coste de IA excede revenue metered",
    impacto: <Risk level="alto" />,
    mit: "presupuesto por org + rate limit + fallback determinista",
  },
  {
    id: "floor",
    riesgo: "Concurrencia de plano de mesas",
    impacto: <Risk level="alto" />,
    mit: "DO locks + D1 unique constraint",
  },
  {
    id: "load",
    riesgo: "Carga real por restaurante desconocida",
    impacto: <Risk level="medio" />,
    mit: "medir en piloto antes de escalar",
  },
  {
    id: "pend",
    riesgo: "Integraciones pendientes (Meta, Salesforce, ERP, TPV)",
    impacto: <Risk level="medio" />,
    mit: "adaptador demo + roadmap honesto",
  },
  {
    id: "fiscal",
    riesgo: "Cumplimiento fiscal por país",
    impacto: <Risk level="alto" />,
    mit: "asesoramiento legal; no prometer features fiscales",
  },
  {
    id: "deuda",
    riesgo: "Deuda técnica por rapidez",
    impacto: <Risk level="medio" />,
    mit: "DoD estricto + refactor programado",
  },
];

const PENDING_FEATURES: { id: string; feat: string; estado: string; cuando: string }[] = [
  { id: "wa", feat: "WhatsApp Cloud API", estado: "adaptador listo, requiere verificación", cuando: "piloto" },
  { id: "gbp", feat: "Google Business Profile", estado: "adaptador listo, requiere OAuth scopes", cuando: "piloto" },
  { id: "meta", feat: "Meta / Instagram", estado: "adaptador pendiente", cuando: "fase posterior" },
  { id: "crm", feat: "Salesforce / HubSpot", estado: "adaptador pendiente", cuando: "fase posterior" },
  { id: "erp", feat: "ERP / TPV", estado: "adaptador pendiente", cuando: "fase posterior" },
  { id: "sms", feat: "SMS", estado: "futuro", cuando: "post-validación" },
  { id: "sso", feat: "SSO / White label", estado: "Enterprise, requiere implementación", cuando: "Enterprise" },
  { id: "sla", feat: "SLA / Cloudflare Enterprise", estado: "requiere contrato Enterprise", cuando: "Enterprise" },
  { id: "mkt", feat: "Marketplace completo", estado: "MVP de adaptadores primero", cuando: "fase posterior" },
  { id: "api", feat: "API pública v1", estado: "diseño listo, implementación posterior", cuando: "fase posterior" },
];

export function ProductoRiesgos() {
  return (
    <Section
      id="p-riesgos"
      index="19"
      eyebrow="Riesgos y pendientes"
      title="Riesgos técnicos y funcionalidades pendientes declaradas."
      intro={
        <>
          Se declaran abiertamente los riesgos técnicos y las funcionalidades pendientes. No se
          ocultan las limitaciones: D1 no tiene RLS nativa (mitigado con Tenant Enforcement Layer),
          las integraciones de terceros dependen de proveedores externos, el coste de IA puede
          exceder el revenue metered y el cumplimiento fiscal varía por país. Los riesgos
          críticos (aislamiento) se mantienen siempre mitigados con tests.
        </>
      }
    >
      <div className="space-y-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">riesgos</Pill>
            <H3>Riesgos técnicos</H3>
          </div>
          <DataTable
            head={["Riesgo", "Impacto", "Mitigación"]}
            rows={TECH_RISKS.map((r) => [
              <span key={`riesgo-${r.id}`} className="text-foreground/90">
                {r.riesgo}
              </span>,
              <span key={`imp-${r.id}`}>{r.impacto}</span>,
              <span key={`mit-${r.id}`} className="text-foreground/70">
                {r.mit}
              </span>,
            ])}
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="teal">pendientes</Pill>
            <H3>Funcionalidades pendientes (declaradas)</H3>
          </div>
          <DataTable
            head={["Funcionalidad", "Estado", "Cuándo"]}
            rows={PENDING_FEATURES.map((f) => [
              <span key={`feat-${f.id}`}>
                <Mono>{f.feat}</Mono>
              </span>,
              <span key={`est-${f.id}`} className="text-foreground/80">
                {f.estado}
              </span>,
              <span
                key={`cuando-${f.id}`}
                className={
                  "font-mono text-xs " +
                  (f.cuando === "piloto"
                    ? "text-[var(--teal)]"
                    : f.cuando === "Enterprise"
                    ? "text-[var(--gold-soft)]"
                    : "text-muted-foreground")
                }
              >
                {f.cuando}
              </span>,
            ])}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-5 items-start">
          <GlassCard variant="gold">
            <div className="flex items-center gap-2 mb-4">
              <Pill tone="gold">honestidad</Pill>
              <H3>Honestidad</H3>
            </div>
            <GoldList
              items={[
                <>No marcar como <em className="text-foreground">“production-ready”</em> algo no validado.</>,
                <>No prometer features legales / fiscales / soporte no implementadas.</>,
                <>Las integraciones pendientes se declaran <strong className="text-foreground">abiertamente</strong>.</>,
                <>El modo demo es <strong className="text-foreground">explícito</strong>, nunca disfrazado de real.</>,
                <>Los riesgos críticos (aislamiento) se mantienen siempre mitigados con <strong className="text-foreground">tests</strong>.</>,
              ]}
            />
          </GlassCard>

          <Callout kind="warn" title="Piloto antes de escala">
            Antes de escalar a miles de restaurantes, validar con un <strong className="text-foreground">piloto real</strong>:
            carga, costes, adopción, integraciones. Los supuestos no validados se declaran. No se
            promete escala sin evidencia; no se proyecta revenue sin medir CAC y churn reales.
          </Callout>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  20 — EJECUCIÓN Y DESPLIEGUE                                  */
/* ============================================================ */
const DEPLOY_CODE = `# 1. Instalar dependencias
bun install

# 2. Variables de entorno (copiar y rellenar)
cp .env.example .env
# - STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
# - RESEND_API_KEY, WHATSAPP_TOKEN, WHATSAPP_VERIFY_TOKEN
# - GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET
# - SESSION_SECRET, AI_GATEWAY_KEY

# 3. Base de datos (D1 local para desarrollo)
npx wrangler d1 create restopanel-tenant
npx wrangler d1 migrations apply restopanel-tenant --local
npx wrangler d1 execute restopanel-tenant --local --file=./database/seeds/seed.sql

# 4. Desarrollo
bun run dev  # http://localhost:3000

# 5. Tests
bun run lint
bun run test         # vitest unit + integración
bun run test:e2e     # playwright

# 6. Despliegue producción
npx wrangler d1 migrations apply restopanel-tenant --remote
npx wrangler secret put STRIPE_SECRET_KEY --env production
# ... resto de secrets
npx wrangler deploy --env production
bun run scripts/smoke-prod.ts`;

const ENVIRONMENTS: { id: string; ent: string; prop: string; datos: string; secrets: string }[] = [
  { id: "local", ent: "local", prop: "desarrollo", datos: "sintéticos", secrets: ".dev.vars" },
  { id: "preview", ent: "preview", prop: "revisión PR", datos: "sintéticos", secrets: "sandbox" },
  { id: "staging", ent: "staging", prop: "validación", datos: "anonimizados", secrets: "sandbox aislados" },
  { id: "prod", ent: "production", prop: "real", datos: "reales", secrets: "rotativos auditados" },
];

export function ProductoDeploy() {
  return (
    <Section
      id="p-deploy"
      index="20"
      eyebrow="Ejecución y despliegue"
      title="Instrucciones de ejecución y despliegue."
      intro={
        <>
          Despliegue Cloudflare-native con wrangler: migraciones D1, secrets por entorno, deploy
          gradual con canary, rollback vía redeploy y smoke test post-deploy. Cuatro entornos
          (local, preview, staging, production) con propósitos, datos y secrets claramente
          separados. Sin pasos manuales ocultos: cada release queda taggeado en git.
        </>
      }
    >
      <div className="space-y-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">ejecución</Pill>
            <H3>De cero a producción</H3>
          </div>
          <Code lang="bash">{DEPLOY_CODE}</Code>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="teal">entornos</Pill>
            <H3>Entornos</H3>
          </div>
          <DataTable
            head={["Entorno", "Propósito", "Datos", "Secrets"]}
            rows={ENVIRONMENTS.map((e) => [
              <span key={`ent-${e.id}`}>
                <Mono>{e.ent}</Mono>
              </span>,
              <span key={`prop-${e.id}`} className="text-foreground/80">
                {e.prop}
              </span>,
              <span key={`datos-${e.id}`} className="text-foreground/70">
                {e.datos}
              </span>,
              <span key={`secrets-${e.id}`} className="font-mono text-xs text-foreground/70">
                {e.secrets}
              </span>,
            ])}
          />
        </div>

        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">reglas</Pill>
            <H3>Reglas de despliegue</H3>
          </div>
          <GoldList
            items={[
              <><strong className="text-foreground">Migraciones antes de deploy</strong> — nunca al revés.</>,
              <><strong className="text-foreground">Secrets por entorno</strong> — nunca en código ni en git.</>,
              <><strong className="text-foreground">Deploy gradual</strong> con canary antes de alcanzar el 100% del tráfico.</>,
              <><strong className="text-foreground">Rollback</strong> = redeploy anterior + migración correctiva si aplica.</>,
              <><strong className="text-foreground">Feature flags</strong> desacoplan deploy de release.</>,
              <><strong className="text-foreground">Smoke test</strong> post-deploy antes de cerrar el release.</>,
              <>Sin pasos manuales ocultos — cada release <strong className="text-foreground">taggeado en git</strong>.</>,
            ]}
          />
        </GlassCard>

        <GlassCard variant="strong">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] rp-gold-text">
              Cierre · RestoPanel
            </span>
          </div>
          <p className="font-display text-xl sm:text-2xl font-light leading-snug text-foreground/95 text-balance">
            RestoPanel es un producto coherente, navegable, medible y preparado para evolucionar.
            No es una colección de pantallas bonitas: es un sistema operativo digital para
            restaurantes, con aislamiento real, componentes interactivos, datos demo honestos y un
            camino claro de piloto a escala.
          </p>
        </GlassCard>
      </div>
    </Section>
  );
}
