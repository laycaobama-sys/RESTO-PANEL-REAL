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
/* 15 — EVENTOS, COLAS Y WEBHOOKS                               */
/* ============================================================ */
const EVENT_PIPELINE_CHART = `flowchart LR
  UC["Caso de uso"] --> TX["Transacción D1<br/>estado + outbox"]
  TX --> DB[("D1")]
  DB --> DSP["Dispatcher idempotente"]
  DSP --> Q["Cloudflare Queue"]
  Q --> C1["comms"]
  Q --> C2["audit"]
  Q --> C3["analytics"]
  Q --> C4["integrations"]
  Q --> C5["automation"]
  C4 --> WH["Webhook saliente<br/>firma HMAC"]
  Q -.fallo.-> DLQ["Dead-letter queue"]
  DLQ --> REP["Reproceso manual auditado"]`;

const EVENT_ENVELOPE = `{
  "event_id": "01HZX...ULID",
  "event_type": "ReservationCreated",
  "event_version": 1,
  "occurred_at": "2025-01-21T19:32:01Z",
  "organization_id": "01HZORG...",
  "location_id": "01HZLOC...",
  "cell_id": "cell-a",
  "actor_id": "01HZUSR...",
  "actor_effective_id": null,
  "correlation_id": "req_01HZ...",
  "causation_id": null,
  "source": "reservations",
  "payload": { "reservation_id": "01HZRES...", "party_size": 4 }
}`;

type ConsumidorGarantia = {
  id: string;
  garantia: string;
  impl: string;
  riesgo: "bajo" | "medio" | "alto" | "crítico";
};

const CONSUMIDOR_GARANTIAS: ConsumidorGarantia[] = [
  {
    id: "idem",
    garantia: "Idempotencia",
    impl: "event_id + consumer dedup table",
    riesgo: "alto",
  },
  {
    id: "dupes",
    garantia: "Tolerancia a duplicados",
    impl: "operaciones idempotentes por design",
    riesgo: "alto",
  },
  {
    id: "orden",
    garantia: "Fuera de orden",
    impl: "consumidor reconcilia por occurred_at",
    riesgo: "medio",
  },
  {
    id: "backoff",
    garantia: "Backoff + jitter",
    impl: "reintentos exponenciales con jitter",
    riesgo: "medio",
  },
  {
    id: "maxattempts",
    garantia: "Límite de reintentos",
    impl: "max_attempts → DLQ",
    riesgo: "alto",
  },
  {
    id: "breaker",
    garantia: "Circuit breaker",
    impl: "por consumidor y por dependencia",
    riesgo: "alto",
  },
  {
    id: "dlq",
    garantia: "Dead-letter queue",
    impl: "DLQ + reproceso manual auditado",
    riesgo: "alto",
  },
  {
    id: "trace",
    garantia: "Trazabilidad",
    impl: "correlation_id end-to-end",
    riesgo: "medio",
  },
];

export function Fase1Eventos() {
  return (
    <Section
      id="f1-eventos"
      index="15"
      eyebrow="Eventos, colas y webhooks"
      title="Outbox transaccional, consumidores idempotentes, webhooks firmados."
      intro={
        <>
          El pipeline de eventos es el sistema nervioso de la plataforma: cada caso de uso escribe
          en la <span className="text-foreground">misma transacción D1</span> el nuevo estado de
          negocio y una fila en <code className="font-mono text-[12px] rp-gold-text">events_outbox</code>;
          un dispatcher idempotente lee el outbox y publica a Cloudflare Queues; los consumidores
          (notificaciones, auditoría, analítica, integraciones, automatización) procesan de forma
          idempotente, con reintentos, circuit breaker y DLQ. Los webhooks salientes se firman con
          HMAC y se entregan al menos una vez.
        </>
      }
    >
      {/* Diagrama del pipeline */}
      <div className="mb-12">
        <H3 className="mb-3">Pipeline de eventos end-to-end</H3>
        <Lead className="mb-4">
          El outbox rompe el anti-patrón del double-write: nunca se publica a la cola sin haber
          persistido el estado, y nunca se persiste el estado sin haber encolado el evento. El
          dispatcher es el único proceso autorizado a publicar; los consumidores compiten por la
          cola sin acoplarse entre sí.
        </Lead>
        <Mermaid chart={EVENT_PIPELINE_CHART} />
      </div>

      {/* Envelope canónico */}
      <div className="mb-12">
        <H3 className="mb-3">Envelope canónico de evento</H3>
        <Lead className="mb-4">
          Todo evento que sale del outbox lleva esta forma. El <code className="font-mono text-[12px] rp-gold-text">correlation_id</code>{" "}
          viaja de la request original al evento y, desde ahí, a cada consumidor y a cada webhook
          saliente, permitiendo reconstruir el journey completo. El <code className="font-mono text-[12px] rp-gold-text">actor_effective_id</code>{" "}
          cubre impersonación; el <code className="font-mono text-[12px] rp-gold-text">causation_id</code>{" "}
          distingue causación de correlación.
        </Lead>
        <Code lang="json">{EVENT_ENVELOPE}</Code>
      </div>

      {/* Garantías obligatorias */}
      <div className="mb-12">
        <H3 className="mb-3">Consumidores: garantías obligatorias</H3>
        <Lead className="mb-4">
          Ningún consumidor puede salir a producción sin implementar estas garantías. La
          idempotencia no es opcional: la cola entrega <span className="text-foreground">at-least-once</span>,
          nunca exactly-once; el consumidor debe ser seguro ante duplicados.
        </Lead>
        <DataTable
          head={["Garantía", "Implementación", "Riesgo"]}
          rows={CONSUMIDOR_GARANTIAS.map((g) => [
            <span key={`${g.id}-gar`} className="font-mono text-[13px] rp-gold-text">
              {g.garantia}
            </span>,
            <span key={`${g.id}-impl`} className="text-foreground/80">
              {g.impl}
            </span>,
            <Risk key={`${g.id}-risk`} level={g.riesgo} />,
          ])}
        />
      </div>

      {/* Webhooks salientes */}
      <div className="mb-12 grid gap-6 md:grid-cols-2">
        <GlassCard variant="gold">
          <H3>Webhooks salientes</H3>
          <Lead className="mt-2">
            Entrega fiable y auditable a sistemas externos. El receptor debe ser idempotente:
            entregamos al menos una vez, no exactamente una.
          </Lead>
          <div className="mt-5">
            <GoldList
              items={[
                <span key="wh-hmac">
                  Firma <code className="font-mono text-[12px] text-foreground/90">HMAC-SHA256</code> con
                  secreto rotativo por organización.
                </span>,
                <span key="wh-replay">
                  <code className="font-mono text-[12px] text-foreground/90">timestamp</code> anti
                  replay con ventana de 5 minutos.
                </span>,
                <span key="wh-backoff">
                  Reintentos con backoff exponencial y jitter.
                </span>,
                <span key="wh-aload">
                  Entrega <span className="text-foreground">at-least-once</span>; el receptor
                  implementa idempotencia por <code className="font-mono text-[12px] text-foreground/90">event_id</code>.
                </span>,
                <span key="wh-reg">
                  Registro de cada intento en{" "}
                  <code className="font-mono text-[12px] text-foreground/90">webhook_deliveries</code>{" "}
                  (status, latency, response).
                </span>,
                <span key="wh-pause">
                  Pausa / kill switch por organización sin afectar a otras.
                </span>,
                <span key="wh-sel">
                  Eventos seleccionables por suscriptor (suscripción explícita, no firehose).
                </span>,
                <span key="wh-scope">
                  Scope por organización: un webhook nunca ve eventos ajenos.
                </span>,
              ]}
            />
          </div>
        </GlassCard>

        <GlassCard>
          <H3>Workflows para procesos largos</H3>
          <Lead className="mt-2">
            Cloudflare Workflows orquesta procesos multi-paso durables y reanudables. No
            reemplazan a Queues para fan-out; los usamos cuando hay estado de orquestación y
            reanudabilidad.
          </Lead>
          <div className="mt-5">
            <GoldList
              items={[
                <span key="wf-onb">Onboarding de organización (provisionamiento multi-paso).</span>,
                <span key="wf-imp">Importaciones masivas (carta, clientes, reservas).</span>,
                <span key="wf-exp">Exportaciones (reportes, backups lógicos por tenant).</span>,
                <span key="wf-camp">Campañas (envíos segmentados, throttling).</span>,
                <span key="wf-conc">Conciliaciones (billing, facturación, payout).</span>,
                <span key="wf-mig">Migración entre shards (etapa B en adelante).</span>,
                <span key="wf-restore">Restauración de backup lógico por tenant.</span>,
              ]}
            />
          </div>
        </GlassCard>
      </div>

      {/* Callout atomicidad */}
      <Callout kind="ok" title="Outbox = atomicidad">
        El outbox se escribe en la <span className="text-foreground">misma transacción D1</span> que
        el estado de negocio. El dispatcher lee las filas no publicadas, las envía a Queues y las
        marca como publicadas. Esto garantiza entrega <span className="text-foreground">at-least-once</span>{" "}
        sin sufrir <span className="text-foreground">double-write inconsistency</span>: nunca hay
        estado sin evento, ni evento sin estado. La idempotencia final la garantiza el consumidor
        con <code className="font-mono text-[12px] rp-gold-text">event_id</code> en su tabla de
        deduplicación.
      </Callout>
    </Section>
  );
}

/* ============================================================ */
/* 16 — SEGURIDAD Y THREAT MODEL                                */
/* ============================================================ */
type StrideRow = {
  id: string;
  cat: string;
  amenaza: string;
  preventivo: string;
  detectivo: string;
  recuperacion: string;
};

const STRIDE_ROWS: StrideRow[] = [
  {
    id: "spoof",
    cat: "Spoofing",
    amenaza: "Robo de sesión/identidad",
    preventivo: "MFA, passkeys WebAuthn, cookies Secure+HttpOnly+SameSite",
    detectivo: "Detección de anomalía de sesión, device fingerprint",
    recuperacion: "Revocación de sesiones, rotación de tokens",
  },
  {
    id: "tamper",
    cat: "Tampering",
    amenaza: "Modificación de datos entre tenants",
    preventivo: "Tenant Enforcement Layer, constraints compuestos, Zod",
    detectivo: "Audit log inmutable, reconciliación",
    recuperacion: "Restore from backup, reproceso desde outbox",
  },
  {
    id: "repud",
    cat: "Repudiation",
    amenaza: "Negar una acción",
    preventivo: "Audit log append-only con actor+timestamp+correlation",
    detectivo: "Alertas de inconsistencia",
    recuperacion: "Reconstrucción desde eventos",
  },
  {
    id: "disclo",
    cat: "Information Disclosure",
    amenaza: "Fuga entre tenants / PII",
    preventivo: "RBAC+ABAC, IDOR checks, redacción PII en logs",
    detectivo: "Tests IDOR en CI, anomaly detection",
    recuperacion: "Notificación de incidente, rotación, GDPR",
  },
  {
    id: "dos",
    cat: "Denial of Service",
    amenaza: "Abuso de API/IA/WhatsApp",
    preventivo: "Rate limiting, Turnstile, WAF, quotas por plan",
    detectivo: "SLO burn rate, alertas",
    recuperacion: "Throttling, kill switch por tenant",
  },
  {
    id: "elev",
    cat: "Elevation of Privilege",
    amenaza: "Escalada de rol o scope",
    preventivo: "Least privilege, deny por defecto, roles custom < creador",
    detectivo: "Audit de permisos, revisión de roles",
    recuperacion: "Revocación inmediata, MFA re-required",
  },
];

type SuperficieRow = {
  id: string;
  sup: string;
  controles: string;
  riesgo: "bajo" | "medio" | "alto" | "crítico";
};

const SUPERFICIE_ROWS: SuperficieRow[] = [
  {
    id: "api",
    sup: "API pública",
    controles: "rate limit, API keys scoped, firma webhooks",
    riesgo: "alto",
  },
  {
    id: "widget",
    sup: "Widget de reserva",
    controles: "Turnstile, rate limit, sin auth sensible",
    riesgo: "medio",
  },
  {
    id: "dash",
    sup: "Dashboard",
    controles: "MFA, sesión revocable, RBAC+ABAC",
    riesgo: "alto",
  },
  {
    id: "sadmin",
    sup: "Super Admin",
    controles: "MFA reciente, impersonación acotada, kill switch",
    riesgo: "crítico",
  },
  {
    id: "whin",
    sup: "Webhooks entrantes",
    controles: "verificación firma origen, allowlist",
    riesgo: "alto",
  },
  {
    id: "integ",
    sup: "Integraciones (Google/WhatsApp/Stripe)",
    controles: "OAuth scoped, rotación, audit",
    riesgo: "alto",
  },
  {
    id: "ia",
    sup: "IA",
    controles: "kill switch, presupuesto, redacción PII, aprobación humana",
    riesgo: "alto",
  },
];

export function Fase1Threat() {
  return (
    <Section
      id="f1-threat"
      index="16"
      eyebrow="Seguridad y threat model"
      title="STRIDE: controles preventivos, detectivos y de recuperación."
      intro={
        <>
          Threat model inicial usando el marco STRIDE. Para cada categoría identificamos amenazas
          concretas y trios de controles: <span className="text-foreground">preventivos</span> (que
          evitan el incidente), <span className="text-foreground">detectivos</span> (que lo
          descubren si ocurre) y <span className="text-foreground">de recuperación</span> (que lo
          contienen y reparan). La defensa en profundidad asume que ningún control es suficiente
          por sí solo.
        </>
      }
    >
      {/* Tabla STRIDE */}
      <div className="mb-12">
        <H3 className="mb-3">Threat model (STRIDE)</H3>
        <Lead className="mb-4">
          Cada fila describe una amenaza y su cadena de controles. La columna &ldquo;Recuperación&rdquo;
          no es opcional: si el control preventivo falla, el sistema debe poder volver a un estado
          conocido y auditable.
        </Lead>
        <DataTable
          head={["Categoría STRIDE", "Amenaza", "Control preventivo", "Detectivo", "Recuperación"]}
          rows={STRIDE_ROWS.map((r) => [
            <span key={`${r.id}-cat`} className="font-mono text-[12px] rp-gold-text">
              {r.cat}
            </span>,
            <span key={`${r.id}-amen`} className="text-foreground/90">
              {r.amenaza}
            </span>,
            <span key={`${r.id}-prev`} className="text-foreground/75">
              {r.preventivo}
            </span>,
            <span key={`${r.id}-det`} className="text-foreground/75">
              {r.detectivo}
            </span>,
            <span key={`${r.id}-rec`} className="text-foreground/75">
              {r.recuperacion}
            </span>,
          ])}
        />
      </div>

      {/* Controles transversales */}
      <div className="mb-12">
        <GlassCard variant="gold">
          <H3>Controles transversales de seguridad</H3>
          <Lead className="mt-2">
            Aplican a todas las superficies, sin excepción. Su ausencia es bloqueante para salir a
            producción.
          </Lead>
          <div className="mt-5">
            <GoldList
              items={[
                <span key="sec-csp">
                  <span className="text-foreground">CSP con nonces</span> por request; sin
                  <code className="font-mono text-[12px] text-foreground/90"> unsafe-inline</code>.
                </span>,
                <span key="sec-hsts">
                  <span className="text-foreground">HSTS</span> con preload y subdomains.
                </span>,
                <span key="sec-csrf">
                  <span className="text-foreground">CSRF tokens</span> para mutaciones vía cookie.
                </span>,
                <span key="sec-xss">
                  Escape <span className="text-foreground">XSS</span> en outputs; sin
                  <code className="font-mono text-[12px] text-foreground/90"> dangerouslySetInnerHTML</code>{" "}
                  sin sanitizar.
                </span>,
                <span key="sec-sqli">
                  Consultas parametrizadas (anti <span className="text-foreground">SQLi</span>);
                  Prisma con binding, sin string interpolation en SQL.
                </span>,
                <span key="sec-ssrf">
                  <span className="text-foreground">Allowlist de destinos</span> para cualquier
                  fetch servidor-side (anti SSRF).
                </span>,
                <span key="sec-zod">
                  Validación <span className="text-foreground">Zod</span> en la frontera de cada
                  endpoint (request body, query, params).
                </span>,
                <span key="sec-secrets">
                  Secretos fuera de código, D1, KV, R2 y frontend; solo en Workers Secrets.
                </span>,
                <span key="sec-tls">
                  Cifrado en tránsito (<span className="text-foreground">TLS</span>) y reposo
                  (<span className="text-foreground">R2 SSE</span>).
                </span>,
                <span key="sec-sast">
                  <span className="text-foreground">SAST + secret scanning + DAST</span> en CI,
                  obligatorios antes de merge a main.
                </span>,
                <span key="sec-supply">
                  Análisis de dependencias (<span className="text-foreground">supply chain</span>);
                  bloqueo de versiones con vulnerabilidades conocidas.
                </span>,
                <span key="sec-pentest">
                  <span className="text-foreground">Pentest pre-producción</span> antes del primer
                  despliegue a entorno productivo.
                </span>,
                <span key="sec-sep">
                  Separación estricta producción vs test: sin datos reales en entornos no productivos.
                </span>,
              ]}
            />
          </div>
        </GlassCard>
      </div>

      {/* Controles por superficie */}
      <div className="mb-12">
        <H3 className="mb-3">Controles por superficie</H3>
        <Lead className="mb-4">
          Cada superficie expuesta tiene un perfil de controles propio. El Super Admin concentra el
          riesgo más alto y recibe controles adicionales: MFA reciente, impersonación acotada en el
          tiempo y kill switch global.
        </Lead>
        <DataTable
          head={["Superficie", "Controles", "Riesgo"]}
          rows={SUPERFICIE_ROWS.map((s) => [
            <span key={`${s.id}-sup`} className="font-mono text-[13px] rp-gold-text">
              {s.sup}
            </span>,
            <span key={`${s.id}-ctrl`} className="text-foreground/80">
              {s.controles}
            </span>,
            <Risk key={`${s.id}-risk`} level={s.riesgo} />,
          ])}
        />
      </div>

      {/* Respuesta a incidentes */}
      <div className="mb-12">
        <GlassCard>
          <H3>Respuesta a incidentes</H3>
          <Lead className="mt-2">
            Ciclo cerrado Detectar → Contener → Erradicar → Recuperar → Aprender. Cada incidente
            termina en postmortem sin culpa y en runbook versionado.
          </Lead>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider rp-gold-text mb-3">
                Detectar
              </div>
              <GoldList
                items={[
                  <span key="inc-alerts-slo">Alertas de SLO burn rate.</span>,
                  <span key="inc-anom">Anomalías de seguridad.</span>,
                  <span key="inc-sec">Señales SIEM (cuando aplique).</span>,
                ]}
              />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider rp-gold-text mb-3">
                Contener
              </div>
              <GoldList
                items={[
                  <span key="inc-kill-tenant">Kill switch por tenant.</span>,
                  <span key="inc-kill-glob">Kill switch global.</span>,
                  <span key="inc-revoke">Revocación de sesiones/tokens.</span>,
                ]}
              />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider rp-gold-text mb-3">
                Erradicar
              </div>
              <GoldList
                items={[
                  <span key="inc-rotate">Rotación de credenciales.</span>,
                  <span key="inc-patch">Parcheo de la causa raíz.</span>,
                  <span key="inc-disable">Desactivar integración comprometida.</span>,
                ]}
              />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider rp-gold-text mb-3">
                Recuperar
              </div>
              <GoldList
                items={[
                  <span key="inc-restore">Restore desde backup.</span>,
                  <span key="inc-replay">Reproceso desde outbox.</span>,
                  <span key="inc-verify">Verificación de integridad.</span>,
                ]}
              />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider rp-gold-text mb-3">
                Aprender
              </div>
              <GoldList
                items={[
                  <span key="inc-pm">Postmortem sin culpa.</span>,
                  <span key="inc-adr">ADR de la lección aprendida.</span>,
                  <span key="inc-runbook">Runbook actualizado.</span>,
                ]}
              />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Callout sin RLS */}
      <div className="mb-12">
        <Callout kind="warn" title="Sin RLS nativa">
          SQLite/D1 <span className="text-foreground">no tiene Row-Level Security</span>. El
          aislamiento entre tenants vive en la capa de aplicación:{" "}
          <span className="text-foreground">Tenant Enforcement Layer</span>, constraints
          compuestos <code className="font-mono text-[12px] rp-gold-text">(organization_id, id)</code>{" "}
          en cada PK, y tests IDOR automáticos en CI. Esto es el riesgo #1 de information
          disclosure y queda mitigado, no eliminado, por features de la base de datos. Cada nuevo
          endpoint que toca datos tenant-scoped debe pasar el gate de tests IDOR antes de merge.
        </Callout>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="RPO" value="≤ 15min" sub="Recovery Point Objective" accent="gold" />
        <Stat label="RTO" value="≤ 2h" sub="Recovery Time Objective" accent="gold" />
        <Stat label="SLO núcleo" value="99.9%" sub="reservas + floor ops por local" accent="teal" />
        <Stat
          label="Pentest"
          value="pre-prod"
          sub="obligatorio antes de producción"
          accent="fg"
        />
      </div>
    </Section>
  );
}

/* ============================================================ */
/* 17 — OBSERVABILIDAD                                           */
/* ============================================================ */
const OBS_CHART = `flowchart LR
  W["Workers / DO / Queues"] --> L["Logs estructurados (PII redact)"]
  W --> M["Métricas"]
  W --> T["Trazas (correlation_id)"]
  L --> WH[("Warehouse / R2")]
  M --> WH
  T --> WH
  WH --> DASH["Dashboards"]
  WH --> ALERT["Alertas (SLO burn)"]
  ALERT --> ONCALL["On-call / Incidentes"]
  W --> AUD[("Audit log D1 (append-only)")]
  AUD --> R2L[("R2 retención larga")]`;

type PilarRow = {
  id: string;
  pilar: string;
  impl: string;
  notas: string;
};

const PILAR_ROWS: PilarRow[] = [
  {
    id: "logs",
    pilar: "Logs estructurados",
    impl: "JSON en Workers; redacción PII por allowlist",
    notas: "retención por entorno",
  },
  {
    id: "metrics",
    pilar: "Métricas",
    impl: "counters, histograms, gauges por dominio",
    notas: "exportadas a Cloudflare Analytics + warehouse",
  },
  {
    id: "traces",
    pilar: "Trazas distribuidas",
    impl: "correlation_id por request; propagado a queues/workflows",
    notas: "end-to-end",
  },
  {
    id: "audit",
    pilar: "Audit logs",
    impl: "append-only en D1; inmutable",
    notas: "retención larga en R2",
  },
  {
    id: "alerts",
    pilar: "Alertas",
    impl: "SLO burn rate, error rate, latencia, coste",
    notas: "routing por severidad",
  },
  {
    id: "slo",
    pilar: "SLO/SLA",
    impl: "99.9% núcleo; error budget",
    notas: "ventana 28 días",
  },
  {
    id: "status",
    pilar: "Status page",
    impl: "pública (app status)",
    notas: "incidentes comunicados",
  },
  {
    id: "inc",
    pilar: "Gestión de incidentes",
    impl: "runbooks, on-call, postmortem",
    notas: "sin culpa",
  },
  {
    id: "pii",
    pilar: "Redacción PII",
    impl: "allowlist de campos seguros; hash de IDs",
    notas: "nunca loggear secretos",
  },
  {
    id: "ret",
    pilar: "Retención",
    impl: "logs 30d, audit 1y+ R2, métricas agregadas",
    notas: "por jurisdicción",
  },
  {
    id: "cost",
    pilar: "Coste por org",
    impl: "taggeo de requests, IA, queues, almacenamiento",
    notas: "para billing y margen",
  },
];

export function Fase1Observabilidad() {
  return (
    <Section
      id="f1-observabilidad"
      index="17"
      eyebrow="Observabilidad"
      title="Logs redactados, métricas, trazas y coste por organización."
      intro={
        <>
          Observabilidad sin franquicias: logs estructurados con redacción PII, métricas por
          dominio, trazas distribuidas vía <span className="text-foreground">correlation_id</span>,
          audit log append-only, alertas sobre SLO burn rate, status page pública y gestión de
          incidentes con postmortem sin culpa. Cada request, evento e inferencia IA se etiqueta
          con <code className="font-mono text-[12px] rp-gold-text">organization_id</code> para
          atribuir coste y construir el feed de billing metered.
        </>
      }
    >
      {/* Pilares */}
      <div className="mb-12">
        <H3 className="mb-3">Pilares de observabilidad</H3>
        <Lead className="mb-4">
          Once pilares cubren desde el log individual hasta el coste por organización. La
          honestidad sobre límites es parte del contrato: Workers Logs tiene retención acotada y
          Analytics Engine tiene límites de cardinalidad, por eso exportamos a warehouse para
          retención larga y consultas ad-hoc.
        </Lead>
        <DataTable
          head={["Pilar", "Implementación", "Notas"]}
          rows={PILAR_ROWS.map((p) => [
            <span key={`${p.id}-p`} className="font-mono text-[13px] rp-gold-text">
              {p.pilar}
            </span>,
            <span key={`${p.id}-i`} className="text-foreground/80">
              {p.impl}
            </span>,
            <span key={`${p.id}-n`} className="text-foreground/65">
              {p.notas}
            </span>,
          ])}
        />
      </div>

      {/* Diagrama */}
      <div className="mb-12">
        <H3 className="mb-3">Pipeline de observabilidad</H3>
        <Lead className="mb-4">
          Workers, Durable Objects y Queues emiten los tres pilares en paralelo. Los logs, métricas
          y trazas aterrizan en un warehouse (con R2 como capa de retención larga); el audit log
          es una vía separada y append-only en D1, archivada a R2 para cumplimiento.
        </Lead>
        <Mermaid chart={OBS_CHART} />
      </div>

      {/* Correlation ID */}
      <div className="mb-12 grid gap-6 md:grid-cols-2">
        <GlassCard variant="gold">
          <H3>Correlation ID obligatorio</H3>
          <Lead className="mt-2">
            Sin correlation_id no hay observabilidad end-to-end. Es la única forma de seguir un
            journey a través de Workers, Queues, Workflows, DO y webhooks salientes.
          </Lead>
          <div className="mt-5">
            <GoldList
              items={[
                <span key="cid-gen">
                  Todo request genera un{" "}
                  <code className="font-mono text-[12px] text-foreground/90">correlation_id</code> en
                  la frontera.
                </span>,
                <span key="cid-prop">
                  Se propaga a Queues, Workflows, DO y webhooks salientes como header y como campo
                  del envelope.
                </span>,
                <span key="cid-audit">
                  Se incluye en cada entrada del audit log.
                </span>,
                <span key="cid-ai">
                  Se incluye en <code className="font-mono text-[12px] text-foreground/90">ai_requests</code>{" "}
                  para auditar inferencias.
                </span>,
                <span key="cid-journey">
                  Permite reconstruir el journey completo de una acción de negocio.
                </span>,
                <span key="cid-client">
                  El cliente puede recibirlo en mensajes de error para soporte (sin PII).
                </span>,
              ]}
            />
          </div>
        </GlassCard>

        <GlassCard>
          <H3>Control de costes por organización</H3>
          <Lead className="mt-2">
            Cada unidad de cómputo se atribuye a una organización. Sin esto no hay billing metered
            ni defensa de margen.
          </Lead>
          <div className="mt-5">
            <GoldList
              items={[
                <span key="cost-tag">
                  Taggeo de cada request/event con{" "}
                  <code className="font-mono text-[12px] text-foreground/90">organization_id</code>.
                </span>,
                <span key="cost-workers">Medición de requests Workers.</span>,
                <span key="cost-d1">Lecturas/escrituras D1.</span>,
                <span key="cost-r2">Almacenamiento R2 (por objeto y egress).</span>,
                <span key="cost-kv">Operaciones KV.</span>,
                <span key="cost-queue">Mensajes Queue.</span>,
                <span key="cost-ia">Inferencias IA (tokens, modelo, latencia).</span>,
                <span key="cost-agg">
                  Agregación diaria →{" "}
                  <code className="font-mono text-[12px] text-foreground/90">usage_records</code>.
                </span>,
                <span key="cost-ent">
                  Comparación con entitlements del plan; alertas de overrun.
                </span>,
                <span key="cost-feed">
                  Feed a billing metered y al dashboard de Super Admin.
                </span>,
              ]}
            />
          </div>
        </GlassCard>
      </div>

      {/* Callout SLO */}
      <Callout kind="info" title="SLO y error budget">
        SLO <span className="text-foreground">99.9%</span> para servicios núcleo (reservas y floor
        ops por local). El error budget mensual son{" "}
        <span className="text-foreground">~43 minutos</span> de fallo permitido. Si el presupuesto
        se consume más del <span className="text-foreground">50%</span>, se congela el despliegue
        de features no esenciales hasta restaurar la holgura. El SLO mide{" "}
        <span className="text-foreground">éxito visible para el usuario</span> (reserva confirmada,
        mesa asignada, mensaje enviado), no solo uptime del endpoint. Las ventanas son de 28 días
        para alinearse con ritmos de despliegue y on-call.
      </Callout>
    </Section>
  );
}
