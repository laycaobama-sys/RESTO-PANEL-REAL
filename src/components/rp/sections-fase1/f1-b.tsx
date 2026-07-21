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
} from "@/components/rp/primitives";
import { Mermaid } from "@/components/rp/mermaid";

/* ============================================================ */
/* 04 — ARQUITECTURA LÓGICA                                      */
/* ============================================================ */
const LOGICA_CHART = `flowchart TB
  subgraph Apps["Apps (componen, no deciden)"]
    A1[landing]
    A2[dashboard]
    A3[super-admin]
    A4[docs]
    A5[status]
  end
  subgraph Domain["Capa de dominio (casos de uso + contratos)"]
    D1[identity]
    D2[tenancy]
    D3[permissions]
    D4[billing]
    D5[reservations]
    D6[floor]
    D7[crm]
    D8[menu]
    D9[workforce]
    D10[reputation]
    D11[comms]
    D12[automation]
    D13[analytics]
    D14[ai]
    D15[audit]
    D16[integrations]
    D17[super-admin-ops]
  end
  subgraph Infra["Capa de infra (adaptadores)"]
    I1[(D1)]
    I2[(R2)]
    I3[(KV)]
    I4[(DO)]
    I5[Queues]
    I6[Workflows]
    I7[Workers AI]
    I8[Stripe]
    I9[Resend]
    I10[WhatsApp]
  end
  Apps --> Domain
  Domain --> Infra`;

type DomainDep = {
  id: string;
  dep: string;
  exp: string;
  note?: string;
};

const DOMAIN_DEPS: DomainDep[] = [
  { id: "identity", dep: "(ninguno)", exp: "tenancy, permissions, audit" },
  { id: "tenancy", dep: "identity", exp: "permissions, billing, todos los tenant-scoped" },
  { id: "permissions", dep: "tenancy", exp: "todos (middleware)" },
  { id: "billing", dep: "tenancy", exp: "subscriptions, entitlements", note: "integra Stripe (adaptador)" },
  { id: "reservations", dep: "tenancy, floor, crm", exp: "comms, automation, analytics" },
  { id: "floor", dep: "tenancy", exp: "reservations (DO coord), analytics" },
  { id: "crm", dep: "tenancy, reservations", exp: "automation, ai, comms" },
  { id: "comms", dep: "tenancy", exp: "notifications, audit", note: "adaptadores email/whatsapp" },
  { id: "automation", dep: "crm, comms, reservations", exp: "analytics, audit" },
  { id: "reputation", dep: "crm, comms", exp: "ai, audit", note: "adaptador Google" },
  { id: "analytics", dep: "(todos via eventos)", exp: "super-admin-ops" },
  { id: "ai", dep: "crm, reputation, reservations", exp: "audit", note: "adaptador Workers AI" },
  { id: "audit", dep: "(todos via eventos)", exp: "super-admin-ops" },
  { id: "integrations", dep: "tenancy, reservations", exp: "webhooks, api-keys" },
  { id: "super-admin-ops", dep: "tenancy, billing, audit, analytics", exp: "(plataforma)" },
];

export function Fase1Logica() {
  return (
    <Section
      id="f1-logica"
      index="04"
      eyebrow="Arquitectura lógica"
      title="Dominios con frontera, contratos y sin dependencias circulares."
      intro="17 dominios con ownership explícito y frontera de módulo. La comunicación entre dominios se hace exclusivamente por comandos, queries, eventos o interfaces; jamás por acceso directo a tablas ajenas. La inversión de dependencias aísla al dominio de los adaptadores externos (Stripe, WhatsApp, Workers AI) mediante puertos que el dominio define y la infra implementa."
    >
      {/* Diagrama de capas */}
      <div className="mb-12">
        <H3 className="mb-3">Capas y dirección de dependencias</H3>
        <Lead className="mb-4">
          Tres capas con una sola dirección: Apps → Dominio → Infra. La flecha nunca se invierte.
          Las apps componen casos de uso; el dominio los define; la infra los sirve.
        </Lead>
        <Mermaid chart={LOGICA_CHART} />
      </div>

      {/* Tabla de dependencias */}
      <div className="mb-12">
        <H3 className="mb-3">Dominios y dependencias permitidas</H3>
        <Lead className="mb-4">
          La frontera que el CI hace cumplir. Un dominio solo puede depender de los que figuran
          en la columna &ldquo;Depende de&rdquo;; cualquier otro import es un error de build.
        </Lead>
        <DataTable
          head={["Dominio", "Depende de (permitido)", "Expuesto a"]}
          rows={DOMAIN_DEPS.map((d) => [
            <span key={`${d.id}-name`} className="font-mono text-[13px] rp-gold-text">
              {d.id}
            </span>,
            <span key={`${d.id}-dep`} className="text-foreground/80">
              {d.dep}
            </span>,
            <div key={`${d.id}-exp`} className="space-y-1.5">
              <div className="flex flex-wrap gap-1">
                {d.exp.split(",").map((e) => (
                  <Pill key={`${d.id}-exp-${e.trim()}`} tone="teal">
                    {e.trim()}
                  </Pill>
                ))}
              </div>
              {d.note ? (
                <div className="text-[11px] font-mono text-muted-foreground">{d.note}</div>
              ) : null}
            </div>,
          ])}
        />
      </div>

      {/* Regla de inversión de dependencias */}
      <GlassCard variant="gold">
        <H3>Regla de inversión de dependencias</H3>
        <Lead className="mt-2">
          El dominio define interfaces (puertos); los adaptadores las implementan en infra.
          El dominio nunca importa un binding de Cloudflare directamente.
        </Lead>
        <div className="mt-5 grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider rp-gold-text mb-3">
              Principio
            </div>
            <GoldList
              items={[
                "El dominio declara interfaces (ports) como contratos estables.",
                "D1, R2, KV, DO, Queues y Workflows son detalles de infra detrás de un puerto.",
                "Stripe, Resend, WhatsApp BSP y Workers AI son adaptadores intercambiables.",
                "Los tests del dominio no necesitan bindings reales: se usan dobles sobre los puertos.",
                "CI bloquea imports de infra desde paquetes de dominio (eslint boundaries).",
              ]}
            />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider rp-teal-text mb-3">
              Casos de swap reales
            </div>
            <GoldList
              items={[
                <span key="swap-wa">
                  <code className="font-mono text-[12px] text-foreground/90">NotificationSender</code>{" "}
                  — WhatsApp Cloud API vs BSP propietario, mismo contrato.
                </span>,
                <span key="swap-stripe">
                  <code className="font-mono text-[12px] text-foreground/90">PaymentGateway</code>{" "}
                  — Stripe vs proveedor regional, mismo contrato.
                </span>,
                <span key="swap-ai">
                  <code className="font-mono text-[12px] text-foreground/90">ChatModel</code> /{" "}
                  <code className="font-mono text-[12px] text-foreground/90">EmbeddingModel</code> —
                  Workers AI vs OpenAI, mismo contrato.
                </span>,
                <span key="swap-storage">
                  <code className="font-mono text-[12px] text-foreground/90">ObjectStore</code> — R2
                  vs S3-compatible, mismo contrato.
                </span>,
                <span key="swap-result">
                  Cambiar de proveedor = cambiar adaptador, sin tocar reglas de negocio.
                </span>,
              ]}
            />
          </div>
        </div>
      </GlassCard>
    </Section>
  );
}

/* ============================================================ */
/* 05 — ARQUITECTURA FÍSICA SOBRE CLOUDFLARE                     */
/* ============================================================ */
const FISICA_CHART = `flowchart TB
  CP["Control Plane (global)<br/>Identity · Orgs · Routing · Billing · Entitlements<br/>Feature flags · Audit · Impersonation · Super Admin"]
  CP -->|route org→cell| RTR{"Org → Shard Router"}
  RTR --> CA["Tenant Cell A<br/>D1-shard-A · DO · Queues"]
  RTR --> CB["Tenant Cell B<br/>D1-shard-B · DO · Queues"]
  RTR --> CC["Tenant Cell C<br/>D1-shard-C · DO · Queues"]
  RTR --> CD["Dedicated Cell (Enterprise)<br/>D1-dedicado · SLA"]
  CA --> W1["Workers (API)"]
  CB --> W1
  CC --> W1
  CD --> W1
  W1 --> R2[(R2<br/>archivos/backups)]
  W1 --> KV[(KV<br/>caché no crítica)]
  W1 --> AI["Workers AI"]
  W1 --> Q["Queues → Workflows"]`;

type CfService = {
  svc: string;
  rol: string;
  lim: string;
  risk: "bajo" | "medio" | "alto" | "crítico";
};

const CF_SERVICES: CfService[] = [
  { svc: "Workers", rol: "API, webhooks, cron, queues consumers", lim: "CPU time por request; subrequests", risk: "medio" },
  { svc: "D1", rol: "BD transaccional canónica por shard", lim: "~10GB por base; réplicas de lectura; sin RLS", risk: "alto" },
  { svc: "R2", rol: "Objetos, backups cifrados", lim: "almacenamiento; egress gratuito", risk: "bajo" },
  { svc: "KV", rol: "Caché y config no crítica", lim: "consistencia eventual; TTL; 1MB por valor", risk: "medio" },
  { svc: "Durable Objects", rol: "Coordinación consistente, WS, locks", lim: "1 DO = unidad de partición; almacenamiento por DO", risk: "alto" },
  { svc: "Queues", rol: "Eventos, reintentos, DLQ", lim: "throughput; retención; consumidores", risk: "medio" },
  { svc: "Workflows", rol: "Procesos largos reanudables", lim: "pasos durables; reintentos", risk: "bajo" },
  { svc: "Workers AI", rol: "Inferencia primaria", lim: "cuotas; latencia; modelos disponibles", risk: "medio" },
  { svc: "Turnstile", rol: "Anti-bot", lim: "—", risk: "bajo" },
  { svc: "WAF + Rate Limiting", rol: "Perímetro", lim: "reglas managed", risk: "bajo" },
];

export function Fase1Fisica() {
  return (
    <Section
      id="f1-fisica"
      index="05"
      eyebrow="Arquitectura física sobre Cloudflare"
      title="Control Plane + Tenant Cells: cada org, un shard D1."
      intro="El Control Plane concentra identidad global, organizaciones, routing de tenant, billing y entitlements. Cada Tenant Cell es una unidad operativa con su propio D1 (shard), Durable Objects y Queues. Las organizaciones Enterprise pueden migrar a una celda dedicada sin cambiar los contratos de aplicación: solo cambia la tabla de routing que maps org_id → shard."
    >
      {/* Diagrama de topología */}
      <div className="mb-12">
        <H3 className="mb-3">Topología: Control Plane + Tenant Cells</H3>
        <Lead className="mb-4">
          El Control Plane es global y único. Las Tenant Cells son intercambiables y escalan
          horizontalmente. El router elige la celda por org_id; los Workers son stateless y
          se adaptan a cualquier celda.
        </Lead>
        <Mermaid chart={FISICA_CHART} />
      </div>

      {/* Tabla de servicios */}
      <div className="mb-10">
        <H3 className="mb-3">Servicio Cloudflare → rol y límites</H3>
        <Lead className="mb-4">
          Cada primitiva tiene un rol asignado y un límite honesto. Lo que se usa como canónico
          (D1) se trata con más disciplina que lo que se usa como caché (KV).
        </Lead>
        <DataTable
          head={["Servicio", "Rol", "Límite relevante", "Riesgo"]}
          rows={CF_SERVICES.map((s) => [
            <span key={`${s.svc}-name`} className="font-mono text-[13px] rp-gold-text">
              {s.svc}
            </span>,
            <span key={`${s.svc}-rol`} className="text-foreground/80">
              {s.rol}
            </span>,
            <span key={`${s.svc}-lim`} className="text-foreground/70">
              {s.lim}
            </span>,
            <Risk key={`${s.svc}-risk`} level={s.risk} />,
          ])}
        />
      </div>

      {/* Callout D1 no es infinito */}
      <div className="mb-10">
        <Callout kind="warn" title="D1 no es infinito">
          Una sola base D1 tops out alrededor de <strong>10GB</strong> y tiene escrituras
          concurrentes limitadas. Llegar a 100.000 restaurantes exige{" "}
          <strong>sharding</strong> a través de muchas bases D1 organizadas como Tenant Cells,
          con routing org→shard. <strong>Time Travel</strong> es recuperación point-in-time (no
          backup de largo plazo): el backup durable vive en R2 con retención y cifrado. Quien
          planee meter 100k orgs en una sola D1 está diseñando un fallo garantizado.
        </Callout>
      </div>

      {/* Convenciones físicas */}
      <GlassCard>
        <H3>Convenciones físicas</H3>
        <Lead className="mt-2">
          Reglas que hacen que cada recurso sea localizable, nombrable y operable sin ambigüedad.
        </Lead>
        <div className="mt-5 grid md:grid-cols-2 gap-6">
          <GoldList
            items={[
              "Control Plane vive en un D1 propio (control-plane-db), separado de toda celda de tenant.",
              "Cada Tenant Cell = 1 D1 + 1 DO namespace + colas dedicadas; la celda es la unidad de escalado.",
              "R2 usa prefijo obligatorio orgs/{org_id}/... para todo objeto de tenant.",
              "KV separa namespaces por propósito: config, cache, flags — nunca mezclados.",
            ]}
          />
          <GoldList
            items={[
              "DO nombrados con org_id + location_id en el nombre para afinidad geográfica estable.",
              "Workers son stateless: el estado vive en D1, DO o R2, nunca en memoria del Worker.",
              "Queues nombradas con convención {cell}-{dominio}-{propósito} para trazabilidad.",
              "Workflows identifican cada ejecución por correlation id derivado del outbox original.",
            ]}
          />
        </div>
      </GlassCard>
    </Section>
  );
}

/* ============================================================ */
/* 06 — DIAGRAMA GENERAL                                         */
/* ============================================================ */
const DIAGRAMA_CHART = `flowchart LR
  U["Usuario / Cliente"] --> WAF["WAF + Turnstile + Rate Limit"]
  WAF --> WRK["Worker API"]
  WRK --> AUTH["Auth Middleware<br/>sesión + MFA"]
  AUTH --> TENANT["Tenant Resolver<br/>org_id desde servidor<br/>(NO del cliente)"]
  TENANT --> RBAC["RBAC + ABAC<br/>permisos + scope"]
  RBAC --> ENT["Entitlements<br/>plan + límites"]
  ENT --> UC["Caso de uso de dominio"]
  UC --> REPO["Repositorio<br/>con org_id obligatorio"]
  REPO --> D1[("D1 shard<br/>tenant cell")]
  UC -->|"transacción: estado + outbox"| OBX["Outbox"]
  OBX --> Q["Queues"]
  Q --> C1["Consumidor: comms"]
  Q --> C2["Consumidor: analytics"]
  Q --> C3["Consumidor: integrations"]
  Q --> C4["Consumidor: audit"]
  UC --> DO["Durable Object<br/>(coordinación)"]
  DO --> D1
  UC --> R2[("R2")]
  UC --> KV[("KV caché")]
  UC --> AI["Workers AI"]`;

export function Fase1Diagrama() {
  return (
    <Section
      id="f1-diagrama"
      index="06"
      eyebrow="Diagrama general"
      title="Visión de conjunto: request, tenant, datos, eventos."
      intro="Una sola imagen que integra las cuatro dimensiones que definen cada request en RestoPanel: el flujo de petición, la resolución de tenant, el acceso a datos y la propagación de eventos. Es el mapa que cualquier ingeniero debe poder dibujar de memoria antes de tocar código de producto."
    >
      <div className="mb-10">
        <Mermaid chart={DIAGRAMA_CHART} />
      </div>

      {/* Leyenda de flujo */}
      <GlassCard variant="teal" className="mb-10">
        <H3>Leyenda de flujo</H3>
        <Lead className="mt-2">
          Cinco invariantes que el diagrama codifica y que el runtime hace cumplir.
        </Lead>
        <div className="mt-5">
          <GoldList
            items={[
              <span key="flow-1">
                Todo request pasa por{" "}
                <span className="font-mono text-[12px] rp-gold-text">
                  WAF → Auth → Tenant → RBAC → Entitlement
                </span>{" "}
                antes de tocar dominio. Ningún caso de uso se ejecuta sin verificar los cinco.
              </span>,
              <span key="flow-2">
                <code className="font-mono text-[12px] text-foreground/90">organization_id</code> se
                resuelve en servidor por sesión, dominio o token de API; el valor enviado por el
                cliente se ignora y se audita si difiere del resuelto.
              </span>,
              <span key="flow-3">
                Toda mutación es una transacción D1 que escribe{" "}
                <strong>estado + outbox</strong> atómicamente; el outbox alimenta Queues y garantiza
                entrega sin 2PC ni inconsistent reads.
              </span>,
              <span key="flow-4">
                Los consumidores son idempotentes por{" "}
                <code className="font-mono text-[12px] text-foreground/90">event_id</code>, con
                backoff exponencial, DLQ y reproceso auditado. Un evento roto no pierde datos.
              </span>,
              <span key="flow-5">
                El Durable Object coordina concurrencia (slots, mesas, locks) pero{" "}
                <strong>D1 conserva el canónico</strong>: el DO es autoridad efímera, D1 es verdad
                durable.
              </span>,
            ]}
          />
        </div>
      </GlassCard>

      {/* Stats SLO */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Latencia p95" value="< 300ms" sub="objetivo núcleo" accent="gold" />
        <Stat label="SLO núcleo" value="99.9%" sub="disponibilidad API" accent="teal" />
        <Stat label="RPO" value="≤ 15 min" sub="pérdida máxima admisible" accent="fg" />
        <Stat label="RTO" value="≤ 2 h" sub="recuperación ante incidente" accent="fg" />
      </div>
    </Section>
  );
}
