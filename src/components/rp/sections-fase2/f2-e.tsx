import * as React from "react";
import {
  Section,
  GlassCard,
  H3,
  Lead,
  Risk,
  DataTable,
  GoldList,
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
/*  20 — ADRS CRÍTICOS                                           */
/* ============================================================ */
type ADR = {
  id: string;
  title: string;
  problema: string;
  alternativas: string;
  decision: string;
  motivo: string;
  coste: string;
  revisar: string;
  riesgo: "bajo" | "medio" | "alto" | "crítico";
};

const ADRS: ADR[] = [
  {
    id: "ADR-001",
    title: "Monolito modular primero, extracción por justificación",
    problema: "Cómo escalar sin microservicios prematuros.",
    alternativas: "Microservicios desde el inicio / monolito sin fronteras.",
    decision:
      "Monolito modular orientado a dominios con contratos públicos; extracción a servicio solo con ADR + cuello medido + equipo suficiente.",
    motivo:
      "Velocidad de iteración + path de extracción definido por contratos.",
    coste: "Disciplina de fronteras.",
    revisar: "Cuello de escala medido o equipo > 3 squads.",
    riesgo: "medio",
  },
  {
    id: "ADR-002",
    title: "Eventos como tejido conectivo + outbox transaccional",
    problema: "Consistencia entre dominios sin acoplamiento.",
    alternativas: "Llamadas síncronas encadenadas / 2PC.",
    decision:
      "Eventos de dominio + outbox en la misma transacción D1; consumidores idempotentes con DLQ.",
    motivo:
      "At-least-once sin double-write inconsistency; bajo acoplamiento.",
    coste: "Idempotencia obligatoria; complejidad de consumidores.",
    revisar: "Volumen de eventos supere umbral de throughput.",
    riesgo: "medio",
  },
  {
    id: "ADR-003",
    title: "Tenant Enforcement Layer (sin RLS)",
    problema: "D1/SQLite sin RLS nativa.",
    alternativas: "Base por tenant / simular RLS.",
    decision:
      "Aislamiento de aplicación (repos exigen org_id) + constraints compuestos + tests IDOR.",
    motivo: "D1 no tiene RLS; el aislamiento real se logra en app.",
    coste: "Disciplina estricta; riesgo de bug de aislamiento.",
    revisar: "Nunca (mantener tests IDOR siempre).",
    riesgo: "crítico",
  },
  {
    id: "ADR-004",
    title: "RBAC + ABAC híbrido, deny por defecto",
    problema: "Permisos granulares con contexto.",
    alternativas: "Solo RBAC / solo ABAC.",
    decision:
      "RBAC base + ABAC para reglas contextuales; deny por defecto; evaluación centralizada.",
    motivo: "Flexibilidad sin perder simplicidad.",
    coste: "Complejidad de evaluación; tests de escalada.",
    revisar: "Reglas ABAC superen complejidad mantenible.",
    riesgo: "alto",
  },
  {
    id: "ADR-005",
    title: "Auditoría inmutable append-only",
    problema: "Trazabilidad sin manipulación.",
    alternativas: "Logs mutables / sin auditoría.",
    decision:
      "audit_logs append-only; sin rutas UPDATE/DELETE; archivo R2; hash chain opcional.",
    motivo: "Evidencia no repudiable.",
    coste: "Correcciones via registros compensatorios.",
    revisar: "Requisitos legales exijan WORM adicional.",
    riesgo: "alto",
  },
  {
    id: "ADR-006",
    title: "IA con asistentes especializados + aprobación humana",
    problema: "IA útil sin riesgo.",
    alternativas: "Chatbot genérico / IA autónoma.",
    decision:
      "Asistentes por dominio; prompts versionados; aprobación humana para sensible; fallback determinista.",
    motivo: "Utilidad + control.",
    coste: "Más ingeniería de prompts; UX de aprobación.",
    revisar: "Cambio de proveedor o coste/latencia.",
    riesgo: "medio",
  },
  {
    id: "ADR-007",
    title: "Capa común de integraciones con interfaces (ports)",
    problema: "Integraciones múltiples sin acoplamiento.",
    alternativas:
      "Un cliente por proveedor acoplado / abstracción genérica que pierde features.",
    decision:
      "Interfaz común de ciclo de vida + operaciones tipadas por proveedor.",
    motivo: "Ciclo de vida uniforme + capacidades específicas.",
    coste: "Mantenimiento de N adaptadores.",
    revisar: "Un proveedor requiera modelo radicalmente distinto.",
    riesgo: "medio",
  },
  {
    id: "ADR-008",
    title: "API pública /v1 + OpenAPI + webhooks firmados",
    problema: "Integración externa estable.",
    alternativas: "RPC privado / GraphQL.",
    decision:
      "REST /v1 con OpenAPI generado desde Zod; idempotencia; webhooks HMAC; portal dev.",
    motivo: "Adopción amplia + estándar.",
    coste: "Mantener compatibilidad.",
    revisar: "Demanda de GraphQL o streaming.",
    riesgo: "medio",
  },
  {
    id: "ADR-009",
    title: "Motor de automatizaciones con aprobación humana para sensible",
    problema: "Automatizar sin perder control.",
    alternativas: "Solo manual / IA autónoma.",
    decision:
      "Trigger→condición→acción; idempotencia; anti-bucle; simulación; aprobación humana para sensible.",
    motivo: "Escala operativa + seguridad.",
    coste: "Complejidad del motor; UX de aprobación.",
    revisar: "Reglas superen complejidad mantenible.",
    riesgo: "medio",
  },
  {
    id: "ADR-010",
    title: "Analítica por eventos con agregados reconstruibles",
    problema: "Métricas fiables.",
    alternativas: "Consultas síncronas a D1 en tiempo real / ETL opaco.",
    decision:
      "Pipeline de eventos → agregados batch; reprocesamiento obligatorio; calidad de datos.",
    motivo: "Consistencia + auditabilidad.",
    coste: "Pipeline + warehouse.",
    revisar: "Volumen de eventos o necesidad de OLAP dedicado.",
    riesgo: "medio",
  },
];

export function Fase2ADRs() {
  return (
    <Section
      id="f2-adrs"
      index="20"
      eyebrow="ADRs críticos"
      title="Decisiones irreversibles con problema, alternativas, decisión, coste y revisión."
      intro="Diez ADRs cubren las decisiones arquitectónicas críticas del Core Platform. Cada uno registra Problema, Alternativas, Decisión, Motivo, Coste/desventaja y Revisar cuando. No son trofeos: son compromisos. Cualquier revisión futura requiere un ADR nuevo que explicite por qué cambia el contexto y qué consecuencias irreversibles adicionales se asumen."
    >
      <div className="grid lg:grid-cols-2 gap-5">
        {ADRS.map((a) => (
          <GlassCard key={a.id} variant="gold">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <Mono>{a.id}</Mono>
              <Risk level={a.riesgo} />
            </div>
            <H3 className="mb-4">{a.title}</H3>
            <dl className="space-y-0">
              <div className="flex flex-col gap-1 py-2 border-b border-border/40">
                <dt className="text-[10px] font-mono uppercase tracking-[0.2em] rp-teal-text">
                  Problema
                </dt>
                <dd className="text-sm text-foreground/90 leading-relaxed">
                  {a.problema}
                </dd>
              </div>
              <div className="flex flex-col gap-1 py-2 border-b border-border/40">
                <dt className="text-[10px] font-mono uppercase tracking-[0.2em] rp-teal-text">
                  Alternativas
                </dt>
                <dd className="text-sm text-foreground/90 leading-relaxed">
                  {a.alternativas}
                </dd>
              </div>
              <div className="flex flex-col gap-1 py-2 border-b border-border/40">
                <dt className="text-[10px] font-mono uppercase tracking-[0.2em] rp-gold-text">
                  Decisión
                </dt>
                <dd className="text-sm text-foreground/95 leading-relaxed">
                  {a.decision}
                </dd>
              </div>
              <div className="flex flex-col gap-1 py-2 border-b border-border/40">
                <dt className="text-[10px] font-mono uppercase tracking-[0.2em] rp-teal-text">
                  Motivo
                </dt>
                <dd className="text-sm text-foreground/90 leading-relaxed">
                  {a.motivo}
                </dd>
              </div>
              <div className="flex flex-col gap-1 py-2 border-b border-border/40">
                <dt className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-300">
                  Coste / desventaja
                </dt>
                <dd className="text-sm text-foreground/90 leading-relaxed">
                  {a.coste}
                </dd>
              </div>
              <div className="flex flex-col gap-1 py-2">
                <dt className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                  Revisar cuando
                </dt>
                <dd className="text-sm text-foreground/90 leading-relaxed">
                  {a.revisar}
                </dd>
              </div>
            </dl>
          </GlassCard>
        ))}
      </div>

      <div className="mt-8">
        <Callout kind="info" title="ADRs vivos, no dogmas">
          Los diez ADRs cubren las decisiones costosas de revertir del Core Platform. El
          monolito modular con contratos públicos (ADR-001) y el Tenant Enforcement Layer
          sin RLS (ADR-003) son los dos compromisos más cargantes: el primero exige
          disciplina de fronteras, el segundo exige tests IDOR perpetuos. Cualquier
          revisión se registra como ADR nuevo referenciando el original.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  21 — RIESGOS, TRADE-OFFS Y MITIGACIONES                      */
/* ============================================================ */
type Riesgo = {
  id: string;
  riesgo: string;
  impacto: "bajo" | "medio" | "alto" | "crítico";
  mitigacion: string;
  revisar: string;
};

const RIESGOS: Riesgo[] = [
  {
    id: "R-01",
    riesgo: "Sin RLS nativa → bug de aislamiento",
    impacto: "crítico",
    mitigacion: "Tenant Enforcement Layer + constraints + tests IDOR en CI",
    revisar: "continuo",
  },
  {
    id: "R-02",
    riesgo: "Monolito modular puede derivar en monolito sin fronteras",
    impacto: "alto",
    mitigacion: "eslint-plugin-boundaries + dependency-cruiser + contratos públicos",
    revisar: "cada sprint",
  },
  {
    id: "R-03",
    riesgo: "Outbox + eventos añade latencia eventual",
    impacto: "medio",
    mitigacion: "Proyecciones tiempo real + reconciliación",
    revisar: "si latencia p95 > objetivo",
  },
  {
    id: "R-04",
    riesgo: "Extracción prematura a microservicios",
    impacto: "alto",
    mitigacion: "ADR obligatorio + cuello medido + equipo",
    revisar: "cada propuesta de extracción",
  },
  {
    id: "R-05",
    riesgo: "Coste de IA/comms excede revenue metered",
    impacto: "alto",
    mitigacion:
      "Presupuesto por org + rate limit + fallback + medición de coste",
    revisar: "mensual",
  },
  {
    id: "R-06",
    riesgo: "Dependencia de proveedores externos (Stripe, WhatsApp, Google)",
    impacto: "medio",
    mitigacion: "Adaptadores swapeables + fallback + auditoría",
    revisar: "cambio de términos",
  },
  {
    id: "R-07",
    riesgo: "Complejidad del motor de automatizaciones",
    impacto: "medio",
    mitigacion:
      "Simulación + anti-bucle + límites por plan + kill switch",
    revisar: "por uso real",
  },
  {
    id: "R-08",
    riesgo: "PII en logs por error",
    impacto: "alto",
    mitigacion: "Redacción por allowlist + tests + revisión",
    revisar: "continuo",
  },
  {
    id: "R-09",
    riesgo: "Crecimiento de events_outbox y analytics",
    impacto: "medio",
    mitigacion: "Archival a R2 por periodo + retención",
    revisar: "por volumen",
  },
  {
    id: "R-10",
    riesgo: "Deuda técnica por rapidez",
    impacto: "medio",
    mitigacion: "DoD estricto + tests + refactor programado",
    revisar: "retrospectivas",
  },
  {
    id: "R-11",
    riesgo: "Falta de validación con clientes reales",
    impacto: "alto",
    mitigacion: "Fase 2 con un restaurante piloto",
    revisar: "antes de escalar",
  },
];

const TRADEOFFS = [
  "Velocidad de iteración (monolito) sobre aislamiento operativo (microservicios) en MVP.",
  "Consistencia eventual (eventos) sobre consistencia fuerte en cross-dominio.",
  "Complejidad de outbox sobre double-write inconsistency.",
  "Disciplina de contratos sobre simplicidad de shared state.",
];

export function Fase2Riesgos() {
  return (
    <Section
      id="f2-riesgos"
      index="21"
      eyebrow="Riesgos, trade-offs y mitigaciones"
      title="Riesgos honestos y mitigaciones concretas."
      intro="Riesgos críticos y trade-offs del diseño del Core Platform, con mitigaciones verificables y cadencia de revisión. Cada riesgo se nombra sin eufemismos: la honestidad sobre D1 sin RLS, el coste de IA/comms y la falta de validación con clientes reales es parte del compromiso operativo, no un subproducto."
    >
      <H3 className="mb-4">Riesgos y trade-offs</H3>
      <DataTable
        head={["Riesgo / Trade-off", "Impacto", "Mitigación", "Revisar"]}
        rows={RIESGOS.map((r) => [
          <span key={`${r.id}-riesgo`} className="font-medium text-foreground">
            {r.riesgo}
          </span>,
          <Risk key={`${r.id}-impacto`} level={r.impacto} />,
          <span
            key={`${r.id}-mit`}
            className="text-sm text-muted-foreground leading-relaxed"
          >
            {r.mitigacion}
          </span>,
          <span
            key={`${r.id}-rev`}
            className="font-mono text-xs rp-teal-text whitespace-nowrap"
          >
            {r.revisar}
          </span>,
        ])}
      />

      <div className="mt-8 grid lg:grid-cols-2 gap-5">
        <GlassCard variant="gold">
          <div className="flex items-center gap-2 mb-4">
            <H3>Trade-offs asumidos</H3>
          </div>
          <Lead className="mb-4">
            Cuatro equilibrios conscientes, no accidentes:
          </Lead>
          <GoldList items={TRADEOFFS} />
        </GlassCard>

        <Callout kind="warn" title="Riesgo #1: aislamiento">
          <p className="mb-2">
            El mayor riesgo es una fuga entre tenants por bug de repositorio. D1/SQLite
            no tiene RLS nativa, por lo que el aislamiento real se logra en la capa de
            aplicación.
          </p>
          <p className="mb-2 font-medium text-foreground/90">Mitigación:</p>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>Tests IDOR obligatorios en CI para cada PR.</li>
            <li>Constraints compuestos (org_id, id) en cada tabla de tenant.</li>
            <li>Revisión de PR enfocada en tenancy.</li>
            <li>Fuzzer en staging que intenta leer/escribir cross-tenant.</li>
          </ul>
          <p className="mt-3 text-amber-300/90">
            No se elimina; se controla. Es un riesgo perpetuo, no una deuda temporal.
          </p>
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  22 — ROADMAP POR ITERACIONES                                 */
/* ============================================================ */
type Iteracion = {
  id: string;
  n: string;
  nombre: string;
  riesgo: "bajo" | "medio" | "alto" | "crítico";
  objetivo: string;
  alcance: string;
  entregables: string;
  salida: string;
};

const ITERACIONES: Iteracion[] = [
  {
    id: "it-1",
    n: "1",
    nombre: "Fundaciones y tenancy",
    riesgo: "alto",
    objetivo: "Base multiempresa segura y desplegable.",
    alcance:
      "Identity (auth, MFA, sesiones), Organizations (org, locations, members), Tenant Enforcement Layer, audit log append-only.",
    entregables:
      "Auth operativa, repos con org_id obligatorio, tests IDOR en CI.",
    salida:
      "Usuario de org A no puede leer org B; sesión revocable; audit inmutable.",
  },
  {
    id: "it-2",
    n: "2",
    nombre: "Reservas y sala",
    riesgo: "alto",
    objetivo: "Operación de reserva y plano de sala.",
    alcance:
      "Reservations (slots, conflictos, idem_key), Tables (floors, zones), DO para coordinación de slots, doble reserva imposible.",
    entregables:
      "Widget de reserva, dashboard de sala, sincronización tiempo real.",
    salida: "Reserva end-to-end; doble reserva bloqueada; sync < 500ms.",
  },
  {
    id: "it-3",
    n: "3",
    nombre: "CRM y eventos",
    riesgo: "medio",
    objetivo: "Memoria del cliente y tejido de eventos.",
    alcance:
      "CRM (customers, preferences, tags), outbox + Queues + dispatcher idempotente, catálogo de eventos inicial.",
    entregables:
      "Perfil de cliente, pipeline de eventos, consumidores (audit, analytics básico).",
    salida:
      "Evento publicado → consumido idempotente; CRM con historial.",
  },
  {
    id: "it-4",
    n: "4",
    nombre: "Billing y permisos avanzados",
    riesgo: "medio",
    objetivo: "Monetización y autorización granular.",
    alcance:
      "Billing (Stripe sync, entitlements, usage metered), RBAC+ABAC con roles custom, deny por defecto.",
    entregables:
      "Suscripción activa, entitlements aplicados, roles custom del Owner.",
    salida:
      "Plan limita funciones; permisos evaluados centralmente; deny por defecto.",
  },
  {
    id: "it-5",
    n: "5",
    nombre: "Notificaciones y automatizaciones",
    riesgo: "medio",
    objetivo: "Comunicaciones y reglas operativas.",
    alcance:
      "Notifications (email+WhatsApp, plantillas, consentimiento, horario silencioso), Motor de automatizaciones (trigger→condición→acción, anti-bucle, simulación, aprobación).",
    entregables:
      "Recordatorios anti-no-show, automatizaciones por org/location, historial.",
    salida:
      "Envío con consentimiento; automatización ejecuta o pide aprobación.",
  },
  {
    id: "it-6",
    n: "6",
    nombre: "Integraciones y API pública",
    riesgo: "medio",
    objetivo: "Conexión con el ecosistema.",
    alcance:
      "Capa común de adaptadores (Stripe, WhatsApp, Google), webhooks firmados, API pública /v1 con OpenAPI, portal dev, API keys scoped.",
    entregables:
      "Integraciones activables, API usable, webhooks salientes.",
    salida:
      "Integración con ciclo de vida completo; API con idempotencia y errores normalizados.",
  },
  {
    id: "it-7",
    n: "7",
    nombre: "IA y analítica",
    riesgo: "medio",
    objetivo: "Asistentes y métricas.",
    alcance:
      "Centro de IA (asistentes por dominio, prompts versionados, aprobación, fallback), Analytics (pipeline de eventos, agregados reconstruibles, dashboards).",
    entregables:
      "Asistentes de reservas/CRM/reviews, dashboards operativos y estratégicos.",
    salida: "IA con aprobación humana; agregados reprocesables.",
  },
  {
    id: "it-8",
    n: "8",
    nombre: "Super Admin, impersonación y HA",
    riesgo: "alto",
    objetivo: "Operación de plataforma y resiliencia.",
    alcance:
      "Super Admin (salud, métricas, gestión), impersonación segura, observabilidad madura (SLO, alertas), degradación controlada, backups verificados.",
    entregables:
      "Panel de plataforma, impersonación acotada, status page.",
    salida:
      "Impersonación visible y auditable; SLO medido; backup restaurado en prueba.",
  },
];

const ROADMAP_CHART = `flowchart LR
  I1["1·Fundaciones"] --> I2["2·Reservas+Sala"]
  I2 --> I3["3·CRM+Eventos"]
  I3 --> I4["4·Billing+Permisos"]
  I4 --> I5["5·Notif+Automat."]
  I5 --> I6["6·Integr+API"]
  I6 --> I7["7·IA+Analítica"]
  I7 --> I8["8·SuperAdmin+HA"]`;

export function Fase2Roadmap() {
  return (
    <Section
      id="f2-roadmap"
      index="22"
      eyebrow="Roadmap por iteraciones"
      title="8 iteraciones para entregar el núcleo sin rearchitectura."
      intro="Roadmap de implementación por iteraciones. Cada iteración tiene objetivo, alcance, entregables y criterio de salida verificables. El orden prioriza fundaciones (tenancy, reservas, eventos) antes que monetización y ecosistema; la resiliencia y el Super Admin cierran el MVP. Ninguna iteración requiere rearchitectura de las anteriores: los contratos públicos del monolito modular lo garantizan."
    >
      <div className="grid lg:grid-cols-2 gap-5">
        {ITERACIONES.map((it) => (
          <GlassCard key={it.id} variant="default">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm rp-gold-text">
                  Iteración {it.n}
                </span>
                <span className="h-px w-6 bg-[var(--gold)]/40" />
                <span className="font-display text-base sm:text-lg font-medium">
                  {it.nombre}
                </span>
              </div>
              <Risk level={it.riesgo} />
            </div>
            <dl className="grid sm:grid-cols-2 gap-x-5 gap-y-0">
              <div className="flex flex-col gap-1 py-2 border-b border-border/40 sm:border-r sm:pr-4">
                <dt className="text-[10px] font-mono uppercase tracking-[0.2em] rp-teal-text">
                  Objetivo
                </dt>
                <dd className="text-sm text-foreground/90 leading-relaxed">
                  {it.objetivo}
                </dd>
              </div>
              <div className="flex flex-col gap-1 py-2 border-b border-border/40 sm:pl-4">
                <dt className="text-[10px] font-mono uppercase tracking-[0.2em] rp-teal-text">
                  Alcance
                </dt>
                <dd className="text-sm text-foreground/90 leading-relaxed">
                  {it.alcance}
                </dd>
              </div>
              <div className="flex flex-col gap-1 py-2 border-b border-border/40 sm:border-r sm:pr-4 sm:border-b-0">
                <dt className="text-[10px] font-mono uppercase tracking-[0.2em] rp-gold-text">
                  Entregables
                </dt>
                <dd className="text-sm text-foreground/90 leading-relaxed">
                  {it.entregables}
                </dd>
              </div>
              <div className="flex flex-col gap-1 py-2 sm:pl-4 sm:border-b-0">
                <dt className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-300">
                  Criterio de salida
                </dt>
                <dd className="text-sm text-foreground/90 leading-relaxed">
                  {it.salida}
                </dd>
              </div>
            </dl>
          </GlassCard>
        ))}
      </div>

      <div className="mt-10">
        <H3 className="mb-4">Secuencia de iteraciones</H3>
        <Mermaid chart={ROADMAP_CHART} />
        <Lead className="mt-4">
          Las iteraciones 1 y 2 concentran el riesgo técnico (tenancy y reservas con
          doble reserva imposible). Las iteraciones 3 a 7 entregan capacidades
          acumulativas sobre esa base. La iteración 8 cierra con resiliencia,
          observabilidad madura y operación de plataforma.
        </Lead>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  23 — CRITERIOS DE ACEPTACIÓN                                 */
/* ============================================================ */
type Criterio = { criterio: string; verificacion: string };

const CRITERIOS: Criterio[] = [
  {
    criterio: "Cada módulo tiene responsabilidad y límites definidos",
    verificacion: "mapa de dominios + matriz de dependencias",
  },
  {
    criterio: "No existen dependencias circulares",
    verificacion: "eslint boundaries + dependency-cruiser en CI verde",
  },
  {
    criterio: "Toda consulta protegida por contexto de tenant",
    verificacion: "Tenant Enforcement Layer + tests IDOR",
  },
  {
    criterio: "Estrategia verificable contra fugas de datos",
    verificacion: "tests negativos cross-tenant + fuzzer en staging",
  },
  {
    criterio: "Modelo D1 con claves, índices y migraciones",
    verificacion: "ER + SQL + migraciones forward-only",
  },
  {
    criterio: "Flujos críticos idempotentes",
    verificacion: "idem_key + dispatcher idempotente",
  },
  {
    criterio: "Prevención de dobles reservas definida",
    verificacion: "DO lock + D1 unique constraint",
  },
  {
    criterio: "RBAC y permisos personalizados documentados",
    verificacion: "sección permisos + roles custom",
  },
  {
    criterio: "Auditoría inmutable y accesible",
    verificacion: "audit append-only + archivo R2 + acceso restringido",
  },
  {
    criterio: "Sistema de eventos con outbox y DLQ",
    verificacion: "pipeline + consumidores idempotentes",
  },
  {
    criterio: "Motor de automatizaciones con aprobación humana",
    verificacion: "trigger→acción + anti-bucle + simulación",
  },
  {
    criterio: "Capa común de integraciones",
    verificacion: "interfaz adapter + N adaptadores",
  },
  {
    criterio: "API pública versionada con webhooks firmados",
    verificacion: "/v1 + OpenAPI + HMAC",
  },
  {
    criterio: "Centro de IA con aprobación y fallback",
    verificacion: "asistentes por dominio + fallback determinista",
  },
  {
    criterio: "Analítica con agregados reconstruibles",
    verificacion: "pipeline + reprocesamiento",
  },
  {
    criterio: "Observabilidad y SLO definidos",
    verificacion: "logs redact + correlation + SLO 99.9%",
  },
  {
    criterio: "ADRs críticos documentados",
    verificacion: "10 ADRs con problema/alternativas/decisión/coste",
  },
  {
    criterio: "Backlog permite iniciar implementación",
    verificacion: "8 iteraciones sin decisiones críticas pendientes",
  },
];

export function Fase2Criterios() {
  return (
    <Section
      id="f2-criterios"
      index="23"
      eyebrow="Criterios de aceptación"
      title="La fase 1.2 se considera completada cuando…"
      intro="Dieciocho criterios verificables cierran la Fase 1.2. Cada uno tiene un estado (✓ Sí) y una verificación explícita que apunta al artefacto o control que lo respalda. Ningún criterio queda implícito: todos tienen evidencia navegable dentro del documento."
    >
      <H3 className="mb-4">Criterios de aceptación verificables</H3>
      <DataTable
        head={["Criterio", "Verificación"]}
        rows={CRITERIOS.map((c, i) => [
          <span key={`crit-${i}-c`} className="font-medium text-foreground">
            {c.criterio}
          </span>,
          <span
            key={`crit-${i}-v`}
            className="font-mono text-xs text-muted-foreground"
          >
            {c.verificacion}
          </span>,
        ])}
      />

      <div className="mt-8">
        <Callout kind="ok" title="Puerta de salida de Fase 1.2">
          Con los 18 criterios cumplidos y los 10 ADRs firmados, la fase habilita la
          implementación del núcleo (Fase 2 MVP) sin decisiones arquitectónicas
          críticas pendientes. El monolito modular con contratos públicos permite
          extraer dominios a microservicios cuando el volumen, el equipo o el
          aislamiento lo justifiquen, sin reescribir consumidores.
        </Callout>
      </div>

      <div className="mt-8">
        <GlassCard variant="strong" className="text-center">
          <div className="mx-auto max-w-3xl">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] rp-gold-text mb-3">
              Cierre de fase
            </div>
            <p className="font-display text-xl sm:text-2xl md:text-3xl font-light leading-snug text-balance">
              El núcleo está diseñado. Lo que sigue es construirlo iteración a
              iteración, midiendo siempre antes de optimizar y documentando cada
              decisión irreversible con un ADR.
            </p>
          </div>
        </GlassCard>
      </div>
    </Section>
  );
}
