import { Section, GlassCard, Tag, DataTable, GoldList, H3, Lead, Pill } from "../primitives";

/* ============================================================ */
/* 11 — ROADMAP                                                 */
/* ============================================================ */
const PHASES = [
  {
    n: "0",
    name: "Estrategia y fundamentos",
    prio: "Imprescindible",
    obj: "Fijar marca, producto, UX, arquitectura, datos y decisiones técnicas antes de codear producto.",
    scope: ["Product & Brand Brief", "Mapa de dominios + contratos", "Control Plane + Tenant Cells", "Modelo de datos nuclear", "Design System base", "Roadmap y backlog"],
    deps: "—",
    deliverables: "28 entregables de Fase 0 + ADRs",
    done: "Puertas de arquitectura, seguridad, tenancy, datos, contratos y Design System aprobadas.",
    risks: "Parálisis por análisis; sobrediseño prematuro.",
    metrics: "Decisiones blindadas; ADRs firmados; Design System utilizable.",
    out: "Implementación de módulos de producto.",
  },
  {
    n: "1",
    name: "MVP validable",
    prio: "Imprescindible",
    obj: "Un restaurante opera y mide valor real end-to-end.",
    scope: ["Auth + MFA + sesiones", "Organización + 1 local", "Reservas + disponibilidad", "Sala y mesas (tiempo real)", "CRM mínimo", "Email/WhatsApp básico", "Billing básico", "Auditoría + observabilidad", "Super Admin mínimo"],
    deps: "Fase 0 aprobada",
    deliverables: "Dashboard + booking widget operativos",
    done: "Un local completa un servicio real con RestoPanel y sin herramientas paralelas.",
    risks: "D1 bajo carga real; WhatsApp deliverability; adopción de host.",
    metrics: "Tiempo a primer servicio < 48h; no-show < 8%; activación D30.",
    out: "Marketing automation, IA, multi-location, API pública.",
  },
  {
    n: "2",
    name: "Automatización y crecimiento",
    prio: "Importante",
    obj: "CRM accionable, comunicaciones, reputación y analítica conectada.",
    scope: ["CRM completo + segmentos", "Marketing & automatizaciones", "Reputación + reseñas + IA sugerida", "Analítica operativa", "Comunicaciones avanzadas", "Predicción de no-show (IA)"],
    deps: "Fase 1 con datos reales",
    deliverables: "Módulos CRM, Comms, Reputation, Analytics, AI",
    done: "Automatización mueve métricas medibles (no-show, recurrencia).",
    risks: "Coste de IA y comms; abuso; fatiga de cliente.",
    metrics: "Recurrencia VIP; CTR campañas; NRR.",
    out: "Multi-location avanzada, franquicias, API pública.",
  },
  {
    n: "3",
    name: "Escalabilidad",
    prio: "Importante",
    obj: "Multi-ubicación, grupos, franquicias y billing avanzado.",
    scope: ["Multi-location + roles avanzados", "Panel de grupo y franquicia", "Billing metered + multi-currency", "Workforce y turnos", "Integraciones clave", "Migración a celda dedicada (Enterprise)"],
    deps: "Fase 2 estable",
    deliverables: "Experiencia de grupo + governance",
    done: "Grupo de 10+ locales opera con roles y billing avanzado.",
    risks: "Complejidad de permisos; fiscalidad por país; migración de celda.",
    metrics: "Locales por grupo; ARR por grupo; churn por grupo.",
    out: "API pública, marketplace.",
  },
  {
    n: "4",
    name: "Plataforma",
    prio: "Posterior",
    obj: "Ecosistema: API pública, marketplace y IA avanzada.",
    scope: ["API pública versionada", "Webhooks y marketplace de partners", "IA avanzada (ocupación, pricing, SEO)", "Realtime evaluado", "Celdas dedicadas Enterprise"],
    deps: "Demanda validada de partners",
    deliverables: "API pública + dev portal + marketplace",
    done: "Partners integran y generan volumen medible vía API.",
    risks: "Superficie de ataque; versionado; soporte a partners.",
    metrics: "Integraciones activas; volumen API; revenue por integración.",
    out: "Lo que no se haya validado demanda real.",
  },
];

export function Roadmap() {
  return (
    <Section
      id="roadmap"
      index="11"
      eyebrow="Roadmap por fases"
      title="De la fundación al ecosistema, sin saltarse validaciones."
      intro="Cada fase tiene objetivo, alcance, dependencias, entregables, criterios de finalización, riesgos, métricas y lo que queda explícitamente fuera. No se amplitud antes de confirmar que el núcleo genera valor."
    >
      {/* Timeline */}
      <div className="relative mb-12">
        <div className="absolute left-0 right-0 top-[2.25rem] h-px rp-divider hidden md:block" />
        <div className="grid md:grid-cols-5 gap-4">
          {PHASES.map((p) => (
            <div key={p.n} className="relative">
              <div className="flex items-center gap-3 md:flex-col md:items-start">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full font-display text-lg font-light ${
                    p.n === "0" ? "bg-[var(--gold)] text-black rp-glow-gold" : "rp-glass border border-border/60"
                  }`}
                >
                  {p.n}
                </div>
                <div className="md:mt-2">
                  <div className="font-medium text-sm leading-tight">{p.name}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase cards */}
      <div className="space-y-5">
        {PHASES.map((p) => (
          <GlassCard key={p.n} variant={p.n === "0" ? "gold" : "default"}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-display text-3xl font-light rp-gold-text">Fase {p.n}</span>
                <H3 className="text-xl">{p.name}</H3>
              </div>
              <Tag kind={p.prio}>{p.prio}</Tag>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{p.obj}</p>

            <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Alcance</div>
                <GoldList items={p.scope} />
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Depende de</div>
                  <div className="text-sm text-foreground/85">{p.deps}</div>
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Entregables</div>
                  <div className="text-sm text-foreground/85">{p.deliverables}</div>
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Métricas de éxito</div>
                  <div className="text-sm rp-teal-text">{p.metrics}</div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Criterio de finalización</div>
                  <div className="text-sm text-foreground/85">{p.done}</div>
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Riesgos</div>
                  <div className="text-sm text-foreground/85">{p.risks}</div>
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Fuera de fase</div>
                  <div className="text-sm text-muted-foreground">{p.out}</div>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}

/* ============================================================ */
/* 12 — BACKLOG PRIORIZADO                                      */
/* ============================================================ */
const BACKLOG = [
  ["B-001", "Tenant Enforcement Layer + tests IDOR", "Plataforma", "Imprescindible", "F1"],
  ["B-002", "Auth: MFA + passkeys + sesiones revocables", "Identity", "Imprescindible", "F1"],
  ["B-003", "Organizaciones, locations y routing de celda", "Tenancy", "Imprescindible", "F1"],
  ["B-004", "RBAC + ABAC + matriz de permisos", "Authorization", "Imprescindible", "F1"],
  ["B-005", "Reservas + disponibilidad + slot holds (DO)", "Reservations", "Imprescindible", "F1"],
  ["B-006", "Plano de sala + mesas + sync tiempo real", "Floor", "Imprescindible", "F1"],
  ["B-007", "CRM mínimo: cliente, preferencias, tags", "CRM", "Imprescindible", "F1"],
  ["B-008", "Comms: email + WhatsApp con fallback", "Communications", "Imprescindible", "F1"],
  ["B-009", "Billing básico + entitlements", "Billing", "Imprescindible", "F1"],
  ["B-010", "Auditoría + outbox + colas", "Audit", "Imprescindible", "F1"],
  ["B-011", "Observabilidad: métricas, logs redactados, SLO", "Observability", "Imprescindible", "F1"],
  ["B-012", "Super Admin mínimo (orgs, salud, impersonación)", "Super Admin", "Imprescindible", "F1"],
  ["B-013", "Widget de reserva pública (booking app)", "Booking", "Imprescindible", "F1"],
  ["B-014", "Recordatorios y reconfirmación anti-no-show", "Automations", "Importante", "F2"],
  ["B-015", "CRM completo + segmentos", "CRM", "Importante", "F2"],
  ["B-016", "Reputación + reseñas + sentimiento", "Reputation", "Importante", "F2"],
  ["B-017", "Respuestas sugeridas por IA (aprobación humana)", "AI", "Importante", "F2"],
  ["B-018", "Analítica operativa (agregados reconstruibles)", "Analytics", "Importante", "F2"],
  ["B-019", "Predicción de no-show", "AI", "Importante", "F2"],
  ["B-020", "Multi-location + roles avanzados", "Tenancy", "Importante", "F3"],
  ["B-021", "Workforce + turnos", "Workforce", "Importante", "F3"],
  ["B-022", "Billing metered + multi-currency", "Billing", "Importante", "F3"],
  ["B-023", "API pública v1 + webhooks", "Integrations", "Posterior", "F4"],
  ["B-024", "Marketplace de partners", "Integrations", "Posterior", "F4"],
  ["B-025", "IA avanzada (ocupación, pricing, SEO)", "AI", "Posterior", "F4"],
];

export function Backlog() {
  return (
    <Section
      id="backlog"
      index="12"
      eyebrow="Backlog inicial priorizado"
      title="Definition of Ready antes que Definition of Done."
      intro="Backlog priorizado con criterios de aceptación implícitos en el Definition of Done. Cada ítem entra en sprint solo cuando tiene owner, contrato, diseño, métrica y dependencias resueltas."
    >
      <DataTable
        head={["ID", "Iniciativa", "Dominio", "Prioridad", "Fase"]}
        rows={BACKLOG.map((r) => [
          <span key={r[0]} className="font-mono text-xs rp-gold-text">{r[0]}</span>,
          r[1],
          r[2],
          <Tag key="prio" kind={r[3]}>{r[3]}</Tag>,
          <span key="fase" className="font-mono text-xs text-muted-foreground">{r[4]}</span>,
        ])}
      />

      <div className="mt-8 grid md:grid-cols-2 gap-5">
        <GlassCard variant="gold">
          <H3>Definition of Ready (DoR)</H3>
          <GoldList
            className="mt-3"
            items={[
              "Owner de dominio asignado.",
              "Contrato Zod de inputs y outputs definido.",
              "Diseño aprobado y accesible.",
              "Dependencias resueltas o explicitadas.",
              "Métrica de éxito acordada.",
              "Criterios de aceptación escritos.",
              "Riesgos de seguridad/tenancy identificados.",
            ]}
          />
        </GlassCard>
        <GlassCard>
          <H3>Definition of Done (DoD, extracto)</H3>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[
              "TS estricto","Contratos Zod","RBAC+ABAC","Entitlement","Aislamiento",
              "Tests IDOR","Auditoría","PII","Idempotencia","Reintentos","Errores",
              "i18n","Timezone","Moneda","WCAG 2.2 AA","Responsive","Observabilidad",
              "Logs redactados","Unit","Integración","Contrato","E2E","Rendimiento",
              "Migración","Runbook","Changelog","Docs",
            ].map((c) => (
              <span key={c} className="rounded-md border border-border/50 bg-foreground/5 px-2 py-0.5 font-mono text-[11px] text-foreground/80">
                {c}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">27 criterios; una funcionalidad no termina hasta cumplirlos todos o justificar excepción documentada.</p>
        </GlassCard>
      </div>
    </Section>
  );
}

/* ============================================================ */
/* 13 — RIESGOS Y DECISIONES PENDIENTES                         */
/* ============================================================ */
const RISKS = [
  ["D1 no escala como se espera bajo celda compartida", "Alto", "Mitigar", "Umbrales de migración antes del límite duro; celda dedicada Enterprise; medición temprana de carga real."],
  ["Aislamiento multi-tenant roto por bug de repositorio", "Crítico", "Prevenir", "Tenant Enforcement Layer; tests IDOR obligatorios en CI; constraints compuestos; revisión de PR enfocada."],
  ["WhatsApp Cloud API cambia términos o cuotas", "Medio", "Contemplar", "Abstracción de BSP; fallback a email/SMS; plantillas auditadas."],
  ["Coste de IA y comunicaciones supera revenue metered", "Alto", "Mitigar", "Presupuesto por org; rate limit; fallback determinista; medición de coste por ejecución."],
  ["Google Business Profile restringe acceso a reseñas", "Medio", "Contemplar", "Reputación en modo lectura parcial/diferida; no bloquear operación."],
  ["Sobreingeniería prematura (microservicios, Realtime)", "Medio", "Evitar", "Modular monolith primero; Realtime solo tras medir; ADR obligatorio."],
  ["Adopción del host baja por curva de aprendizaje", "Alto", "Mitigar", "Onboarding asistido; densidad operativa; atajos; UX probada con personal real."],
  ["Pérdida de datos por dependencia de Time Travel", "Alto", "Prevenir", "Backups cifrados a R2 versionados; pruebas de restauración; RPO definido."],
];

const PENDING = [
  ["ADP-001", "Particionado de celdas por región o por carga", "Pendiente de medir carga real en F1"],
  ["ADP-002", "Proveedor de IA: solo Workers AI o híbrido con fallback", "Pendiente de evaluación offline"],
  ["ADP-003", "Estrategia Realtime: DO vs Cloudflare Realtime", "Pendiente de madurez y coste"],
  ["ADP-004", "Modelo de billing metered: por evento o por consumo agregado", "Pendiente de pricing final"],
  ["ADP-005", "Política de retención por tipo de dato y jurisdicción", "Pendiente de asesoramiento legal"],
  ["ADP-006", "Dominio propio y verificación de email/WhatsApp", "Pendiente de adquisición"],
  ["ADP-007", "API pública: scope y modelo de cuotas", "Pendiente de demanda de partners"],
  ["ADP-008", "Menu & Orders: ¿construir o integrar con POS?", "Pendiente de validación de mercado"],
];

export function Riesgos() {
  return (
    <Section
      id="riesgos"
      index="13"
      eyebrow="Riesgos y decisiones pendientes"
      title="Lo que puede romper la tesis y lo que aún no decidimos."
      intro="Los riesgos se registran con impacto y estrategia. Las decisiones pendientes se dejan explícitas: no se resuelven por inercia ni por aparentar certeza. Cada una tiene un detonante que activará su ADR."
    >
      <H3 className="mb-4">Registro de riesgos</H3>
      <DataTable
        className="mb-12"
        head={["Riesgo", "Impacto", "Estrategia", "Respuesta"]}
        rows={RISKS.map((r) => [
          r[0],
          <Tag key="impacto" kind={r[1] === "Crítico" ? "Imprescindible" : r[1] === "Alto" ? "Importante" : "Posterior"}>{r[1]}</Tag>,
          r[2],
          <span key="resp" className="text-muted-foreground">{r[3]}</span>,
        ])}
      />

      <H3 className="mb-4">Decisiones pendientes</H3>
      <DataTable
        head={["ID", "Decisión", "Detonante"]}
        rows={PENDING.map((r) => [
          <span key="id" className="font-mono text-xs rp-gold-text">{r[0]}</span>,
          r[1],
          <span key="det" className="text-muted-foreground">{r[2]}</span>,
        ])}
      />
    </Section>
  );
}

/* ============================================================ */
/* 14 — RECOMENDACIONES FINALES                                 */
/* ============================================================ */
export function Recomendaciones() {
  return (
    <Section
      id="recomendaciones"
      index="14"
      eyebrow="Recomendaciones finales"
      title="Validar el núcleo antes de construir la amplitud."
      intro="La Fase 0 no busca tener razón en todo: busca que las decisiones caras estén tomadas con contexto y que las hipótesis estén marcadas para validarse. Estas son las recomendaciones que dan por cerrado el entregable."
    >
      <div className="grid lg:grid-cols-2 gap-5">
        {RECS.map((r, i) => (
          <GlassCard key={i} variant={r.tone === "gold" ? "gold" : r.tone === "teal" ? "teal" : "default"}>
            <div className="flex items-center gap-3">
              <span className="font-display text-2xl font-light rp-gold-text">{String(i + 1).padStart(2, "0")}</span>
              <H3 className="text-lg">{r.t}</H3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.d}</p>
            <div className="mt-3"><Tag kind={r.prio}>{r.prio}</Tag></div>
          </GlassCard>
        ))}
      </div>

      {/* Cierre */}
      <GlassCard variant="strong" className="mt-10 text-center">
        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
          Puerta de salida · Fase 0
        </div>
        <p className="mt-4 font-display text-2xl sm:text-3xl font-light max-w-3xl mx-auto leading-snug text-balance">
          No iniciar desarrollo amplio hasta aprobar las puertas de arquitectura, seguridad,
          tenancy, datos, contratos y Design System.
        </p>
        <p className="mt-4 text-sm text-muted-foreground max-w-2xl mx-auto">
          Con esta fundación, RestoPanel puede crecer de un restaurante independiente a miles de
          locales sin reconstruir lo que más cuesta cambiar.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Pill tone="gold">Fundación blindada</Pill>
          <Pill tone="teal">Hipótesis marcadas</Pill>
          <Pill tone="outline">ADRs pendientes registrados</Pill>
        </div>
      </GlassCard>
    </Section>
  );
}

const RECS = [
  { t: "Cerrar ADRs críticos antes de Fase 1", d: "ULID vs UUID, particionado de celdas, motor de IA y billing metered son decisiones que cuesta revertir. Documentarlas con alternativas y consecuencias antes de implementar.", prio: "Imprescindible", tone: "gold" },
  { t: "Construir el MVP con un solo restaurante real", d: "Nada de amplitud sin un local operando y midiendo valor. El primer cliente es un socio de validación, no un caso de ventas.", prio: "Imprescindible", tone: "gold" },
  { t: "Tests de aislamiento en CI desde el primer commit", d: "Tests IDOR y cross-tenant no son opción: son parte del DoD. CI rojo bloquea merge.", prio: "Imprescindible", tone: "default" },
  { t: "Medir coste de IA y comms por ejecución", d: "Sin visibilidad de coste no hay pricing sostenible. Cada ai_run y delivery registra coste y latencia.", prio: "Importante", tone: "teal" },
  { t: "Degradación elegante probada", d: "Simular caída de WhatsApp, email e IA y verificar que la sala sigue operando. Es un test de resiliencia, no un ejercicio teórico.", prio: "Imprescindible", tone: "default" },
  { t: "Design System con owner y autoridad", d: "Un Lead con potestad de merge. Componentes por necesidad, no por volumen. RFC corto para nuevos.", prio: "Importante", tone: "default" },
  { t: "Backups cifrados y pruebas de restauración", d: "Time Travel no es backup. Exports versionados a R2 y restauración probada periódicamente.", prio: "Imprescindible", tone: "gold" },
  { t: "Onboarding asistido, no trial libre", d: "B2B hostelero: la activación real requiere acompañamiento. Mide tiempo a primer servicio, no registros.", prio: "Importante", tone: "teal" },
];
