import * as React from "react";
import {
  Section,
  GlassCard,
  Stat,
  Pill,
  H3,
  Lead,
  Risk,
  DataTable,
  GoldList,
  KV,
  Callout,
} from "@/components/rp/primitives";
import { Mermaid } from "@/components/rp/mermaid";

/* ============================================================ */
/*  Helpers                                                      */
/* ============================================================ */
function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-xs rp-gold-text whitespace-nowrap">
      {children}
    </code>
  );
}

function Check() {
  return <span className="text-emerald-300 font-mono">✓ Sí</span>;
}

/* ============================================================ */
/*  18 — TESTING                                                 */
/* ============================================================ */
const TEST_PYRAMID = [
  {
    nivel: "Unit",
    cubre: "casos de uso, validación Zod, repositorios (mock)",
    cuando: "cada commit",
    tool: "vitest",
  },
  {
    nivel: "Integración",
    cubre: "dominio + D1 local (Miniflare), outbox, queues",
    cuando: "cada PR",
    tool: "vitest + miniflare",
  },
  {
    nivel: "Contrato",
    cubre: "esquemas de eventos/commands entre módulos",
    cuando: "cada PR",
    tool: "zod + consumer contract tests",
  },
  {
    nivel: "IDOR / tenant",
    cubre: "negativo: org A no alcanza recurso de org B",
    cuando: "cada PR (obligatorio)",
    tool: "vitest + fixtures multi-tenant",
  },
  {
    nivel: "E2E",
    cubre: "flujos críticos: alta, reserva, check-in, billing",
    cuando: "nocturno + pre-prod",
    tool: "playwright",
  },
  {
    nivel: "Carga",
    cubre: "reservas concurrentes, DO contención",
    cuando: "pre-escalado",
    tool: "k6",
  },
  {
    nivel: "Seguridad",
    cubre: "SAST, secret scan, DAST, dependencias",
    cuando: "CI + pre-prod",
    tool: "CodeQL, snyk, owasp",
  },
  {
    nivel: "Visuales/a11y",
    cubre: "componentes DS; contraste AA",
    cuando: "cada PR",
    tool: "storybook + axe",
  },
];

export function Fase1Testing() {
  return (
    <Section
      id="f1-testing"
      index="18"
      eyebrow="Estrategia de testing"
      title="Unit, integración, contrato, E2E y tests negativos de tenant."
      intro="La estrategia es risk-based: cada capa de tests existe para cubrir una clase de fallo distinta. Los tests negativos de IDOR y aislamiento cross-tenant no son opcionales ni se delegan a revisión manual: son obligatorios en CI y bloquean el merge si fallan. Una pirámide sana prioriza volumen en unit, integración con D1 local, contrato entre módulos, y E2E solo para flujos críticos."
    >
      <H3 className="mb-4">Pirámide de tests</H3>
      <DataTable
        head={["Nivel", "Qué cubre", "Cuándo", "Herramienta"]}
        rows={TEST_PYRAMID.map((t) => [
          <span key={`${t.nivel}-nivel`} className="font-medium">
            {t.nivel}
          </span>,
          <span key={`${t.nivel}-cubre`}>{t.cubre}</span>,
          <span
            key={`${t.nivel}-cuando`}
            className="font-mono text-xs text-muted-foreground"
          >
            {t.cuando}
          </span>,
          <span key={`${t.nivel}-tool`} className="font-mono text-xs rp-teal-text">
            {t.tool}
          </span>,
        ])}
      />

      <div className="mt-10 grid lg:grid-cols-2 gap-5">
        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">obligatorio</Pill>
            <H3>Tests anti-fuga obligatorios</H3>
          </div>
          <Lead className="mb-4">
            Por cada endpoint tenant: suite de tests negativos en CI. Rojo bloquea merge.
          </Lead>
          <GoldList
            items={[
              "Por cada endpoint tenant: test que usuario de org A recibe 404/403 al pedir recurso de org B.",
              "Test de mutación cross-tenant: intentar alterar recurso de org B desde sesión de org A devuelve error y no altera datos.",
              "Test de cache poisoning: mutar estado en org A no afecta cache de org B (claves con organization_id).",
              "Test de webhook falsificado: petición firmada con secreto incorrecto o rotado se rechaza y se audita.",
              "Fuzzer de tenant en staging periódico: tráfico aleatorio intentando acceder a recursos ajenos; cualquier 200 inesperado abre incidente.",
              "CI rojo bloquea merge: ningún PR entra a main con tests negativos de tenant en rojo.",
            ]}
          />
        </GlassCard>

        <Callout kind="ok" title="Definition of Done incluye tests">
          <p>Una iniciativa está Done cuando:</p>
          <ul className="mt-2 space-y-1.5 list-disc list-inside">
            <li>Tests unit + integration + contract + IDOR en verde.</li>
            <li>E2E para los flujos críticos afectados.</li>
            <li>a11y AA verificado en componentes nuevos.</li>
            <li>Performance budget cumplido (latencia p95, bundle size).</li>
            <li>Runbook actualizado si toca operatividad.</li>
            <li>Changelog redactado.</li>
          </ul>
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  19 — CI/CD Y ENTORNOS                                        */
/* ============================================================ */
const CICD_CHART = `flowchart LR
  DEV["Dev local<br/>Miniflare + D1 local"] --> PR["PR abierto"]
  PR --> CI["CI: lint + typecheck + tests + IDOR + SAST"]
  CI --> PREV["Preview deploy<br/>(por PR)"]
  PREV --> REV["Review + aprobación"]
  REV --> STG["Staging<br/>(datos sintéticos)"]
  STG --> E2E["E2E + carga + DAST"]
  E2E --> PROD["Production<br/>(migraciones + deploy canary)"]
  PROD --> OBS["Observabilidad + SLO"]`;

const ENTORNOS = [
  {
    env: "local",
    proposito: "desarrollo",
    datos: "sintéticos fixtures",
    secretos: ".dev.vars (no secretos reales)",
    risk: "bajo" as const,
  },
  {
    env: "preview",
    proposito: "revisión por PR",
    datos: "sintéticos",
    secretos: "sandbox (Stripe test, WhatsApp test)",
    risk: "medio" as const,
  },
  {
    env: "staging",
    proposito: "validación pre-prod",
    datos: "sintéticos + anonimizados",
    secretos: "sandbox aislados",
    risk: "medio" as const,
  },
  {
    env: "production",
    proposito: "real",
    datos: "reales",
    secretos: "rotativos, auditados, mínimos",
    risk: "crítico" as const,
  },
];

export function Fase1CICD() {
  return (
    <Section
      id="f1-cicd"
      index="19"
      eyebrow="CI/CD y entornos"
      title="Pipelines por paquete, preview deploys, merges solo en verde."
      intro="Cuatro entornos con propósito, datos y secretos distintos. Las migraciones D1 son forward-only: nunca se hace downgrade de esquema; un rollback es redeploy de la versión anterior más una migración correctiva. Cada PR genera un preview deploy aislado. Merge a main requiere verde completo (lint, typecheck, tests unit+integration+contract+IDOR, SAST) y revisión humana."
    >
      <H3 className="mb-4">Pipeline CI/CD</H3>
      <Mermaid chart={CICD_CHART} />

      <div className="mt-10">
        <H3 className="mb-4">Entornos</H3>
        <DataTable
          head={["Entorno", "Propósito", "Datos", "Secretos", "Riesgo"]}
          rows={ENTORNOS.map((e) => [
            <span key={`${e.env}-env`} className="font-medium">
              {e.env}
            </span>,
            <span key={`${e.env}-prop`}>{e.proposito}</span>,
            <span key={`${e.env}-datos`}>{e.datos}</span>,
            <span
              key={`${e.env}-sec`}
              className="font-mono text-xs text-muted-foreground"
            >
              {e.secretos}
            </span>,
            <Risk key={`${e.env}-risk`} level={e.risk} />,
          ])}
        />
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-5">
        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">reglas</Pill>
            <H3>Reglas de CI/CD</H3>
          </div>
          <GoldList
            items={[
              "Pipeline por paquete afectado (Turborepo cache).",
              "Lint + typecheck estricto en cada cambio.",
              "Tests unit + integration + contract + IDOR obligatorios.",
              "SAST + secret scan en cada PR.",
              "Preview deploy por PR aislado.",
              "Merge requiere verde completo + revisión humana.",
              "Migraciones forward-only aplicadas en deploy.",
              "Deploy canary/gradual en producción.",
              "Rollback = deploy anterior + migración correctiva (no downgrade de esquema).",
              "Feature flags para desacoplar deploy de release.",
            ]}
          />
        </GlassCard>

        <Callout kind="warn" title="Separación producción/test estricta">
          <ul className="space-y-1.5 list-disc list-inside">
            <li>Credenciales de producción nunca en entornos de test.</li>
            <li>Datos reales nunca en staging (anonimizados o sintéticos).</li>
            <li>Accesos a producción con MFA + just-in-time + audit log.</li>
            <li>Impersonación de producción solo con MFA reciente y motivo registrado.</li>
          </ul>
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  20 — ESCALABILIDAD POR ETAPAS                                */
/* ============================================================ */
type Etapa = {
  id: "A" | "B" | "C" | "D";
  rango: string;
  risk: "bajo" | "medio" | "alto" | "crítico";
  arquitectura: string;
  d1: string;
  particionado: string;
  cuellos: string;
  observabilidad: string;
  cambios: string;
  costes: string;
  senales: string;
};

const ETAPAS: Etapa[] = [
  {
    id: "A",
    rango: "1–100 restaurantes",
    risk: "bajo",
    arquitectura: "1 Tenant Cell compartida + Control Plane.",
    d1: "1 sola base D1 (shard-0) + control-plane-db.",
    particionado: "sin sharding; organization_id en todas las queries.",
    cuellos: "ninguno esperado.",
    observabilidad: "métricas básicas + audit.",
    cambios: "construir fundación.",
    costes: "Workers requests, D1 reads/writes, R2 storage (bajo).",
    senales:
      ">80 restaurantes O shard-0 > 6GB O escrituras D1 p95 degradando.",
  },
  {
    id: "B",
    rango: "100–1.000 restaurantes",
    risk: "medio",
    arquitectura:
      "múltiples Tenant Cells (shard-A, shard-B, ...); org→shard router.",
    d1: "sharding por organization_id; ~1 base D1 por celda; cada celda cientos de orgs.",
    particionado: "por organización (hash o rango).",
    cuellos: "contención de DO en picos de servicio; queues throughput.",
    observabilidad: "SLO por celda, burn rate, coste por org.",
    cambios:
      "router org→shard; migración entre shards; archival de eventos a R2.",
    costes: "D1 reads/writes escala, Queues, Workers AI.",
    senales:
      "alguna celda > 6GB O > 800 orgs O latencia p95 > objetivo.",
  },
  {
    id: "C",
    rango: "1.000–10.000 restaurantes",
    risk: "alto",
    arquitectura:
      "decenas de celdas; réplicas de lectura D1; DO por (location+date); dedicated cells para Enterprise.",
    d1: "muchas bases; balanceo de carga; archival agresivo; read replicas para analytics.",
    particionado: "por organización + archival por periodo.",
    cuellos:
      "analytics cross-cell; conciliación de facturación; Google/WhatsApp cuotas.",
    observabilidad:
      "trazas distribuidas cross-cell; warehouse de métricas; coste por org maduro.",
    cambios:
      "agregados reconstruibles; read replicas; migración dedicada Enterprise.",
    costes:
      "almacenamiento R2 (backups/archivo), Workers AI, Queues, egress.",
    senales:
      ">8.000 orgs O migración dedicada frecuente O coste por org subiendo.",
  },
  {
    id: "D",
    rango: "10.000–100.000+ restaurantes",
    risk: "crítico",
    arquitectura:
      "cientos de celdas; posiblemente regiones; control plane distribuido.",
    d1: "sharding maduro; celdas dedicadas comunes; archival por periodo a R2 + warehouse.",
    particionado: "por organización + región.",
    cuellos:
      "gobernanza multi-región; consistencia de control plane; coste.",
    observabilidad:
      "observabilidad multi-región; SLO por región; FinOps.",
    cambios:
      "multi-región opcional; API pública madura; marketplace.",
    costes: "escala total; FinOps obligatorio.",
    senales:
      "demanda de multi-región O partners vía API O celdas > umbral.",
  },
];

export function Fase1Escala() {
  return (
    <Section
      id="f1-escala"
      index="20"
      eyebrow="Escalabilidad por etapas"
      title="De 1 a 100.000 restaurantes sin reescrituras traumáticas."
      intro="Cuatro etapas evolutivas: cada una define arquitectura, estrategia D1, particionado, cuellos esperados, observabilidad, cambios requeridos, costes dominantes y señales que indican el paso a la siguiente. El sistema no se diseña para la Etapa D desde el día 1, pero tampoco se toman decisiones en la Etapa A que bloqueen el escalado posterior."
    >
      <div className="grid lg:grid-cols-2 gap-5">
        {ETAPAS.map((e) => (
          <GlassCard key={`etapa-${e.id}`} variant="gold">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xs rp-gold-text uppercase tracking-[0.2em]">
                  Etapa {e.id}
                </span>
                <H3>{e.rango}</H3>
              </div>
              <Risk level={e.risk} />
            </div>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-0">
              <KV k="Arquitectura" v={e.arquitectura} />
              <KV k="Estrategia D1" v={e.d1} />
              <KV k="Particionado" v={e.particionado} />
              <KV k="Cuellos de botella" v={e.cuellos} />
              <KV k="Observabilidad" v={e.observabilidad} />
              <KV k="Cambios requeridos" v={e.cambios} />
              <KV k="Costes dominantes" v={e.costes} />
              <KV k="Señales para avanzar" v={e.senales} />
            </dl>
          </GlassCard>
        ))}
      </div>

      <div className="mt-8">
        <Callout kind="adr" id="ADR-004" title="Crecimiento evolutivo, no big-bang">
          No se diseña infra innecesariamente compleja desde el inicio, pero se evitan
          decisiones que bloqueen el escalado: sharding por organization_id desde Etapa B,
          contratos estables entre módulos, archival planificado desde Etapa A. Cada
          transición de etapa abre ADRs específicos (sharding, archival, read replicas,
          multi-región) que documentan el contexto, la decisión y las consecuencias
          irreversibles asumidas.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  21 — COSTES Y FACTORES                                       */
/* ============================================================ */
const COST_FACTORS = [
  {
    factor: "Requests Workers",
    impacta: "por org, por etapa",
    notas: "crece con uso",
  },
  {
    factor: "Lecturas/escrituras D1",
    impacta: "por org",
    notas: "crece con reservas/eventos",
  },
  {
    factor: "Almacenamiento R2",
    impacta: "por org",
    notas: "crece con archivos + backups + archivo",
  },
  {
    factor: "Operaciones KV",
    impacta: "por org",
    notas: "bajo si se usa bien",
  },
  {
    factor: "Mensajes Queue",
    impacta: "por org",
    notas: "crece con eventos",
  },
  {
    factor: "DO + WebSockets",
    impacta: "por org",
    notas: "cuidado con conexiones; hibernación",
  },
  {
    factor: "Workers AI",
    impacta: "por org",
    notas: "medido por ai_request; presupuesto por plan",
  },
  {
    factor: "Stripe",
    impacta: "% transacción",
    notas: "sobre suscripción",
  },
  {
    factor: "Resend/WhatsApp/Google",
    impacta: "por uso",
    notas: "externos",
  },
];

export function Fase1Costes() {
  return (
    <Section
      id="f1-costes"
      index="21"
      eyebrow="Costes y factores"
      title="Modelo de coste dominante por etapa y por organización."
      intro="El coste de RestoPanel es usage-based: se compone de primitivas Cloudflare (Workers requests, D1 reads/writes, R2 storage, KV ops, Queues, DO, Workers AI) más proveedores externos (Stripe, Resend, WhatsApp, Google). La estimación es de orden de magnitud; el coste real se valida por etapa con usage_records etiquetados por organización y se compara contra revenue por org en Super Admin."
    >
      <H3 className="mb-4">Factores de coste</H3>
      <DataTable
        head={["Factor", "Impacta a", "Notas"]}
        rows={COST_FACTORS.map((c) => [
          <span key={`${c.factor}-f`} className="font-medium">
            {c.factor}
          </span>,
          <span
            key={`${c.factor}-imp`}
            className="font-mono text-xs rp-teal-text"
          >
            {c.impacta}
          </span>,
          <span key={`${c.factor}-notas`} className="text-muted-foreground">
            {c.notas}
          </span>,
        ])}
      />

      <div className="mt-10 grid lg:grid-cols-2 gap-5">
        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">por etapa</Pill>
            <H3>Coste dominante por etapa</H3>
          </div>
          <GoldList
            items={[
              <span key="cost-A">
                <Mono>Etapa A</Mono>: Workers + D1 (bajo).
              </span>,
              <span key="cost-B">
                <Mono>Etapa B</Mono>: D1 reads/writes + Queues + AI.
              </span>,
              <span key="cost-C">
                <Mono>Etapa C</Mono>: R2 storage (backups/archivo) + AI + Queues.
              </span>,
              <span key="cost-D">
                <Mono>Etapa D</Mono>: escala total; FinOps obligatorio; multi-región opcional.
              </span>,
            ]}
          />
        </GlassCard>

        <Callout kind="warn" title="Estimación inicial, no compromiso">
          Las cifras son de orden de magnitud; el coste real se valida por etapa con{" "}
          <Mono>usage_records</Mono> etiquetados por organización. El margen por org se
          monitorea en Super Admin; si coste/org &gt; revenue/org, se actúa (rate limit,
          presets, pricing). Workers AI tiene presupuesto por plan: un pico de uso de IA
          que supere el revenue metered de la org dispara rate limit y fallback
          determinista.
        </Callout>
      </div>

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Margen objetivo"
          value="> 70%"
          sub="Etapa A"
          accent="gold"
        />
        <Stat
          label="Coste por org"
          value="trackeado"
          sub="Super Admin"
          accent="teal"
        />
        <Stat
          label="FinOps"
          value="Etapa C+"
          sub="warehouse de métricas"
          accent="fg"
        />
        <Stat
          label="Presupuesto IA"
          value="por plan"
          sub="rate limit + fallback"
          accent="gold"
        />
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  22 — BACKLOG TÉCNICO PRIORIZADO                              */
/* ============================================================ */
type BacklogItem = {
  id: string;
  iniciativa: string;
  dominio: string;
  risk: "bajo" | "medio" | "alto" | "crítico";
  etapa: "A" | "B" | "C" | "D";
};

const BACKLOG: BacklogItem[] = [
  { id: "B1-001", iniciativa: "Tenant Enforcement Layer + tests IDOR", dominio: "tenancy", risk: "alto", etapa: "A" },
  { id: "B1-002", iniciativa: "Auth: MFA + passkeys + sesiones revocables", dominio: "identity", risk: "alto", etapa: "A" },
  { id: "B1-003", iniciativa: "Organizations + routing org→shard", dominio: "tenancy", risk: "alto", etapa: "A" },
  { id: "B1-004", iniciativa: "RBAC + ABAC + roles custom", dominio: "permissions", risk: "medio", etapa: "A" },
  { id: "B1-005", iniciativa: "Reservas + disponibilidad + slot holds (DO)", dominio: "reservations", risk: "alto", etapa: "A" },
  { id: "B1-006", iniciativa: "Plano de sala + mesas + sync tiempo real", dominio: "floor", risk: "alto", etapa: "A" },
  { id: "B1-007", iniciativa: "Outbox + Queues + DLQ + dispatcher idempotente", dominio: "events", risk: "alto", etapa: "A" },
  { id: "B1-008", iniciativa: "Audit log append-only + retención R2", dominio: "audit", risk: "medio", etapa: "A" },
  { id: "B1-009", iniciativa: "Impersonación segura + banner + kill switch", dominio: "super-admin", risk: "crítico", etapa: "A" },
  { id: "B1-010", iniciativa: "Billing + entitlements + Stripe sync", dominio: "billing", risk: "medio", etapa: "A" },
  { id: "B1-011", iniciativa: "Observabilidad: logs redact + correlation_id + SLO", dominio: "observability", risk: "medio", etapa: "A" },
  { id: "B1-012", iniciativa: "Backups cifrados R2 + pruebas restauración", dominio: "storage", risk: "alto", etapa: "A" },
  { id: "B1-013", iniciativa: "Migración entre shards (Etapa B)", dominio: "tenancy", risk: "alto", etapa: "B" },
  { id: "B1-014", iniciativa: "Archival de eventos a R2 por periodo", dominio: "analytics", risk: "medio", etapa: "B" },
  { id: "B1-015", iniciativa: "Read replicas D1 para analytics", dominio: "analytics", risk: "medio", etapa: "C" },
  { id: "B1-016", iniciativa: "Agregados reconstruibles cross-cell", dominio: "analytics", risk: "alto", etapa: "C" },
  { id: "B1-017", iniciativa: "Celdas dedicadas Enterprise", dominio: "tenancy", risk: "alto", etapa: "C" },
  { id: "B1-018", iniciativa: "API pública v1 + webhooks firmados", dominio: "integrations", risk: "alto", etapa: "D" },
];

export function Fase1Backlog() {
  return (
    <Section
      id="f1-backlog"
      index="22"
      eyebrow="Backlog técnico priorizado"
      title="Para comenzar la implementación sin decisiones críticas pendientes."
      intro="18 iniciativas priorizadas para la Etapa A con dependencias claras y riesgos explícitos. La Etapa A (B1-001 a B1-012) construye la fundación: tenancy, identidad, reservas, sala, eventos, audit, impersonación, billing, observabilidad y backups. Las iniciativas B1-013 a B1-018 preparan el escalado a Etapas B, C y D."
    >
      <H3 className="mb-4">Backlog técnico</H3>
      <DataTable
        head={["ID", "Iniciativa", "Dominio", "Riesgo", "Etapa"]}
        rows={BACKLOG.map((b) => [
          <span key={`${b.id}-id`} className="font-mono text-xs rp-gold-text">
            {b.id}
          </span>,
          <span key={`${b.id}-ini`}>{b.iniciativa}</span>,
          <span
            key={`${b.id}-dom`}
            className="font-mono text-xs text-muted-foreground"
          >
            {b.dominio}
          </span>,
          <Risk key={`${b.id}-risk`} level={b.risk} />,
          <span key={`${b.id}-etapa`}>
            <Pill tone="teal">{b.etapa}</Pill>
          </span>,
        ])}
      />

      <div className="mt-10">
        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <Pill tone="gold">DoR</Pill>
            <H3>Definition of Ready</H3>
          </div>
          <Lead className="mb-4">
            Una iniciativa entra a sprint solo cuando cumple:
          </Lead>
          <GoldList
            items={[
              "Owner asignado a la iniciativa.",
              "Contrato Zod definido (commands, queries, eventos) y revisado.",
              "Diseño aprobado y accesible en docs/adr o docs/design.",
              "Dependencias resueltas o explícitamente aplazadas con ADR.",
              "Métrica acordada (latencia, coste, SLO, adopción).",
              "Riesgos de seguridad y tenancy identificados y mitigan o aceptan.",
            ]}
          />
        </GlassCard>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  23 — CRITERIOS DE ACEPTACIÓN                                */
/* ============================================================ */
const CRITERIOS: { criterio: string; verificacion: string }[] = [
  {
    criterio: "Cada módulo tiene responsabilidad y límites definidos",
    verificacion: "secciones arq lógica + monorepo",
  },
  {
    criterio: "No existen dependencias circulares",
    verificacion: "eslint boundaries + dependency-cruiser en CI",
  },
  {
    criterio: "Todas las consultas protegidas por contexto de tenant",
    verificacion: "Tenant Enforcement Layer + tests IDOR",
  },
  {
    criterio: "Estrategia verificable contra fugas de datos",
    verificacion: "tests negativos cross-tenant + fuzzer",
  },
  {
    criterio: "Modelo D1 con claves, índices y migraciones",
    verificacion: "SQL inicial + migraciones forward-only",
  },
  {
    criterio: "Flujos críticos idempotentes",
    verificacion: "idem_key unique + dispatcher idempotente",
  },
  {
    criterio: "Prevención de dobles reservas definida",
    verificacion: "DO lock + D1 unique constraint",
  },
  {
    criterio: "RBAC y permisos personalizados documentados",
    verificacion: "sección auth + roles custom",
  },
  {
    criterio: "Impersonación temporal, visible y auditable",
    verificacion: "sección impersonación + state diagram",
  },
  {
    criterio: "Existe un threat model",
    verificacion: "STRIDE + controles",
  },
  {
    criterio: "Planes de backup y restauración probados",
    verificacion: "R2 cifrado + pruebas de restauración",
  },
  {
    criterio: "Estrategia concreta de escalado de D1",
    verificacion: "sharding por etapas A→D",
  },
  {
    criterio: "Observabilidad y control de costes definidos",
    verificacion: "sección observabilidad + costes",
  },
  {
    criterio: "Diagramas y decisiones coherentes",
    verificacion: "Mermaid + ADRs alineados",
  },
  {
    criterio: "Backlog permite iniciar implementación",
    verificacion: "sin decisiones críticas pendientes",
  },
];

export function Fase1Criterios() {
  return (
    <Section
      id="f1-criterios"
      index="23"
      eyebrow="Criterios de aceptación"
      title="La fase se considera completada cuando…"
      intro="Quince criterios verificables cierran la Fase 1.1. Cada uno tiene un estado (✓ Sí) y una verificación explícita que apunta a la sección, artefacto o control de CI que lo respalda. Ningún criterio queda implícito: todos tienen evidencia navegable."
    >
      <H3 className="mb-4">Criterios de aceptación</H3>
      <DataTable
        head={["Criterio", "Estado", "Verificación"]}
        rows={CRITERIOS.map((c, i) => [
          <span key={`crit-${i}-c`} className="font-medium">
            {c.criterio}
          </span>,
          <Check key={`crit-${i}-e`} />,
          <span
            key={`crit-${i}-v`}
            className="font-mono text-xs text-muted-foreground"
          >
            {c.verificacion}
          </span>,
        ])}
      />

      <div className="mt-8">
        <Callout kind="ok" title="Puerta de salida de Fase 1.1">
          Con los 15 criterios cumplidos y los ADRs iniciales (ADR-001 a ADR-008) firmados,
          la Fase 1.1 habilita el inicio de implementación del MVP (Fase 2) sin decisiones
          arquitectónicas críticas pendientes. Las preguntas bloqueantes restantes se
          convierten en hipótesis a validar durante la Etapa A, no en bloqueadores de
          implementación.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  24 — ADRS INICIALES                                          */
/* ============================================================ */
type ADRCard = {
  id: string;
  title: string;
  estado: string;
  contexto: string;
  decision: string;
  consecuencias: string;
  riesgo: "bajo" | "medio" | "alto" | "crítico";
};

const ADRS: ADRCard[] = [
  {
    id: "ADR-001",
    title: "IDs opacos ULID",
    estado: "Decidido",
    contexto:
      "IDs predecibles permiten enumeración y ataques de enumeración de recursos.",
    decision: "ULID (text) en todas las tablas; sin autoincrement exponible.",
    consecuencias:
      "joins por ULID; índices compuestos; generación en app.",
    riesgo: "bajo",
  },
  {
    id: "ADR-002",
    title: "Tenant Enforcement Layer (sin RLS)",
    estado: "Decidido",
    contexto:
      "D1/SQLite no tiene RLS nativa como PostgreSQL; no se puede delegar el aislamiento al motor.",
    decision:
      "aislamiento de aplicación: repositorios exigen org_id; constraints compuestos (org_id,id); FK compuestas; tests IDOR obligatorios.",
    consecuencias:
      "disciplina de repos estricta; CI bloquea; no confianza en el DB para aislar solo.",
    riesgo: "alto",
  },
  {
    id: "ADR-003",
    title: "Sharding D1 por celdas desde Etapa B",
    estado: "Decidido",
    contexto:
      "D1 ~10GB por base; 100k restaurantes no caben en una sola base.",
    decision:
      "sharding por organization_id en tenant cells; router org→shard; migración entre shards; celdas dedicadas Enterprise.",
    consecuencias:
      "queries cross-org globales via agregados/events; migración sin downtime requerida; archival planificado.",
    riesgo: "alto",
  },
  {
    id: "ADR-004",
    title: "Crecimiento evolutivo (modular monolith primero)",
    estado: "Decidido",
    contexto:
      "microservicios prematuros = coste y complejidad sin beneficio medido.",
    decision:
      "modular monolith sobre Workers con dominios aislados; extracción a servicio solo con cuello medido + ADR.",
    consecuencias:
      "velocidad alta; contratos ya definen futura extracción; observabilidad madura requerida antes de extraer.",
    riesgo: "medio",
  },
  {
    id: "ADR-005",
    title: "D1 canónico; DO coordinación, no persistencia canónica",
    estado: "Decidido",
    contexto:
      "DO es unidad de partición con almacenamiento, pero no debe ser la única copia de estado de negocio.",
    decision:
      "D1 conserva reservas/mesas/clientes; DO coordina concurrencia y estado efímero; DO reconstruye desde D1.",
    consecuencias:
      "doble escritura evitada via outbox; reconexión re-sync desde D1.",
    riesgo: "medio",
  },
  {
    id: "ADR-006",
    title: "Workers AI como motor primario, fallback determinista",
    estado: "Decidido",
    contexto:
      "soberanía de coste y latencia en el borde; sin dependencia de OpenAI/Anthropic por defecto.",
    decision:
      "Workers AI primario; proveedores intercambiables via interfaz; fallback determinista obligatorio; aprobación humana para acciones sensibles.",
    consecuencias:
      "prompts versionados; presupuesto por org; kill switch.",
    riesgo: "medio",
  },
  {
    id: "ADR-007",
    title: "Outbox transaccional para eventos",
    estado: "Decidido",
    contexto: "double-write (DB + publish) causa inconsistencia.",
    decision:
      "outbox en la misma transacción D1 que el estado; dispatcher idempotente publica a Queues; consumidores idempotentes con DLQ.",
    consecuencias:
      "at-least-once; idempotencia obligatoria; reproceso manual auditado.",
    riesgo: "medio",
  },
  {
    id: "ADR-008",
    title: "Stripe como fuente de verdad de facturación",
    estado: "Decidido",
    contexto: "billing complejo y sensible.",
    decision:
      "Stripe mantiene suscripciones/cobros; RestoPanel refleja entitlements y usage metered; reconciliación periódica.",
    consecuencias:
      "sync webhook-driven; entitlements en D1; disputes e impuestos en Stripe.",
    riesgo: "bajo",
  },
];

const PREGUNTAS_BLOQUEANTES = [
  "¿Cuál es la carga real esperada por restaurante (reservas/día, eventos, CRM) para dimensionar el shard size?",
  "¿Qué techo real de escrituras concurrentes por D1 observamos en Etapa A antes de requerir sharding?",
  "¿Workers AI cubre latencia p95 y calidad para los casos de IA del MVP?",
  "¿Cuotas y políticas de WhatsApp Cloud API por plantilla y mercado?",
  "¿Disponibilidad y permisos reales de Google Business Profile API por región?",
  "¿Jurisdicciones objetivo y retención legal aplicable (GDPR, LOPD, otras)?",
  "¿Modelo de pricing y límites por plan que sostienen el coste por org?",
  "¿SLA comercial comprometido con clientes Enterprise (RPO/RTO/SLO contractual)?",
  "¿Política de residencia de datos: multi-región obligatoria para algún segmento?",
  "¿Estrategia de adquisición de dominio propio y verificación de email/WhatsApp?",
];

export function Fase1ADRs() {
  return (
    <Section
      id="f1-adrs"
      index="24"
      eyebrow="ADRs iniciales"
      title="Decisiones irreversibles documentadas con contexto y consecuencias."
      intro="Ocho ADRs iniciales fijan las decisiones costosas de revertir. Cada uno registra contexto, decisión, consecuencias y riesgo. No son trofeos: son compromisos. Cualquier revisión futura requiere un ADR nuevo que explicite por qué cambia el contexto y qué consecuencias irreversibles adicionales se asumen."
    >
      <div className="grid lg:grid-cols-2 gap-5">
        {ADRS.map((a) => (
          <GlassCard key={a.id} variant="gold">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <Mono>{a.id}</Mono>
              <Risk level={a.riesgo} />
            </div>
            <H3 className="mb-1">{a.title}</H3>
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-4">
              Estado:{" "}
              <span className="rp-teal-text">{a.estado}</span>
            </div>
            <dl className="space-y-3">
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-[0.2em] rp-teal-text">
                  Contexto
                </dt>
                <dd className="text-sm text-foreground/85 mt-1 leading-relaxed">
                  {a.contexto}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-[0.2em] rp-teal-text">
                  Decisión
                </dt>
                <dd className="text-sm text-foreground/85 mt-1 leading-relaxed">
                  {a.decision}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-[0.2em] rp-teal-text">
                  Consecuencias
                </dt>
                <dd className="text-sm text-foreground/85 mt-1 leading-relaxed">
                  {a.consecuencias}
                </dd>
              </div>
            </dl>
          </GlassCard>
        ))}
      </div>

      <div className="mt-8">
        <Callout kind="info" title="Preguntas bloqueantes (máx. 10)">
          <p className="mb-3">
            Incógnitas que no bloquean el inicio de la implementación pero deben responderse
            durante la Etapa A. Cada respuesta se convierte en un ADR de revisión o en una
            hipótesis validada.
          </p>
          <ol className="space-y-2 list-decimal list-inside">
            {PREGUNTAS_BLOQUEANTES.map((p, i) => (
              <li
                key={`preg-${i}`}
                className="text-sm text-foreground/85 leading-relaxed"
              >
                {p}
              </li>
            ))}
          </ol>
        </Callout>
      </div>
    </Section>
  );
}
