import {
  Section,
  GlassCard,
  Stat,
  DataTable,
  GoldList,
  H3,
  Lead,
  Risk,
  Callout,
} from "@/components/rp/primitives";

/* ============================================================ */
/* 01 — RESUMEN EJECUTIVO (FASE 1.1)                            */
/* ============================================================ */
export function Fase1Resumen() {
  return (
    <Section
      id="f1-resumen"
      index="01"
      eyebrow="Resumen ejecutivo"
      title="Una especificación, no una colección de supuestos."
      intro="La Fase 1.1 produce una especificación técnica implementable y verificable antes de escribir la aplicación completa. Aquí no se promete escala: se diseña el camino honesto de 1 a 100.000 restaurantes sobre Cloudflare, documentando cada compromiso irreversible con ADRs y cada hipótesis con un plan de validación."
    >
      <div className="grid lg:grid-cols-3 gap-5">
        <GlassCard className="lg:col-span-2" variant="gold">
          <div className="text-[11px] font-mono uppercase tracking-wider rp-gold-text">Tesis</div>
          <p className="mt-3 font-display text-2xl sm:text-3xl font-light leading-snug text-balance">
            La fundación de RestoPanel debe escalar de 1 a más de 100.000 restaurantes mediante
            sharding evolutivo por celdas, aislamiento estricto de tenant, modular monolith y
            primitivas Cloudflare-nativas — sin microservicios prematuros ni RLS simulada.
          </p>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            No se promete que D1 solo escale a 100k. No se asume aislamiento por base de datos
            dedicada desde el día 1. No se delega el tenant al navegador. No se elige OpenAI ni
            Anthropic como motor primario de IA. Cada una de estas decisiones se justifica y se
            invalida aquí mismo.
          </p>
        </GlassCard>

        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
          <Stat label="Fase" value="1.1" sub="arquitectura enterprise" accent="gold" />
          <Stat label="Spec" value="V1.1" sub="implementable y verificable" accent="teal" />
          <Stat label="Horizonte" value="A→D" sub="4 etapas de escala" accent="fg" />
        </div>
      </div>

      <div className="mt-10 grid md:grid-cols-2 gap-5">
        <GlassCard>
          <H3>Qué entrega la Fase 1.1</H3>
          <Lead className="mt-2">
            24 entregables que fijan lo costoso de revertir antes de escribir producto.
          </Lead>
          <div className="mt-5">
            <GoldList
              items={[
                "Especificación completa de arquitectura lógica y física sobre Cloudflare.",
                "Modelo ER, diccionario de datos y SQL inicial sobre D1.",
                "Threat model STRIDE y matriz RBAC/ABAC con impersonación segura.",
                "ADRs iniciales (8) y registro de riesgos con estrategias de respuesta.",
                "Etapas de escalabilidad A→D con umbrales y triggers de migración.",
                "Modelo de costes por etapa y backlog técnico priorizado con DoR/DoD.",
              ]}
            />
          </div>
        </GlassCard>

        <GlassCard>
          <H3>Qué NO asume</H3>
          <Lead className="mt-2">Autodisciplina para no prometer sin validar.</Lead>
          <div className="mt-5">
            <GoldList
              items={[
                "No asume que D1 solo escala a 100.000 restaurantes en una sola base.",
                "No usa microservicios desde el día 1; modular monolith con ADR para extraer.",
                "No confía en el organization_id enviado por el cliente como autoridad de tenant.",
                "No usa OpenAI/Anthropic como proveedores primarios de IA.",
                "No simula RLS: D1/SQLite no la tiene; se aplica Tenant Enforcement Layer real.",
                "No trata Time Travel como backup de conservación: backup cifrado a R2 versionado.",
              ]}
            />
          </div>
        </GlassCard>
      </div>

      <div className="mt-10">
        <H3 className="mb-4">Decisiones técnicas de partida</H3>
        <DataTable
          head={["Decisión", "Postura", "Riesgo", "Justificación"]}
          rows={[
            [
              "Cloudflare como plataforma completa",
              "Workers + D1 + R2 + KV + DO + Queues + AI",
              <Risk key="riesgo" level="medio" />,
              "Borde unificado; coste y latencia; superficie controlable.",
            ],
            [
              "Multi-tenant compartido por celdas",
              "shards D1 por célula",
              <Risk key="riesgo" level="alto" />,
              "D1 no escala a 100k en una sola base; sharding obligatorio.",
            ],
            [
              "Modular monolith sobre Workers",
              "dominios aislados, un despliegue",
              <Risk key="riesgo" level="medio" />,
              "Velocidad de iteración; microservicios solo con cuello medido.",
            ],
            [
              "Tenant Enforcement Layer en repos",
              "sin RLS simulada",
              <Risk key="riesgo" level="alto" />,
              "D1/SQLite no tiene RLS nativa; aislamiento de aplicación + tests IDOR.",
            ],
            [
              "Workers AI como motor primario",
              "proveedores intercambiables",
              <Risk key="riesgo" level="medio" />,
              "Soberanía de coste; fallback determinista obligatorio.",
            ],
            [
              "Stripe para billing",
              "fuente de verdad de cobro",
              <Risk key="riesgo" level="bajo" />,
              "Estándar B2B; entitlements reflejados en D1.",
            ],
            [
              "Sin trial libre",
              "onboarding asistido",
              <Risk key="riesgo" level="bajo" />,
              "B2B hostelero; evita abuso y ruido.",
            ],
          ]}
        />
      </div>
    </Section>
  );
}

/* ============================================================ */
/* 02 — SUPUESTOS Y VALIDACIÓN PENDIENTE                        */
/* ============================================================ */
export function Fase1Supuestos() {
  return (
    <Section
      id="f1-supuestos"
      index="02"
      eyebrow="Supuestos y validación pendiente"
      title="Lo que damos por cierto y lo que hay que demostrar."
      intro="Los supuestos son hipótesis operativas que, si fallan, cambian la arquitectura. Cada uno tiene un riesgo asociado y un plan de validación en Etapa A. Los requisitos pendientes son las incógnitas que deben medirse antes de comprometer la estrategia de sharding."
    >
      <div className="grid lg:grid-cols-2 gap-5">
        <GlassCard>
          <H3>Supuestos operativos</H3>
          <Lead className="mt-2">Si alguno se rompe, se abre un ADR de revisión.</Lead>
          <DataTable
            className="mt-4"
            head={["Supuesto", "Riesgo si falla"]}
            rows={[
              [
                "D1 cubre carga transaccional esperada por shard (Etapa A-B < umbral)",
                "Migración a sharding dedicado antes de lo previsto.",
              ],
              [
                "Workers AI suficiente para IA del MVP",
                "Proveedor externo con coste/soberanía distintos.",
              ],
              [
                "WhatsApp Cloud API cubre volumen/plantillas",
                "Recurso a BSP con coste y dependencia.",
              ],
              [
                "Google Business Profile concede reseñas dentro de cuotas",
                "Reputación en modo lectura parcial/diferida.",
              ],
              [
                "D1 límite 10GB por base suficiente por shard en Etapa A-C",
                "Rebalanceo de shards y archival a R2 más frecuente.",
              ],
              [
                "Stripe soporta multi-divisa y fiscalidad objetivo",
                "Pasarelas locales por país.",
              ],
            ]}
          />
        </GlassCard>

        <GlassCard>
          <H3>Requisitos pendientes de validación</H3>
          <Lead className="mt-2">
            Incertidumbres a medir en Etapa A antes de blindar la estrategia.
          </Lead>
          <div className="mt-5">
            <GoldList
              items={[
                "Carga real por restaurante (reservas/día, CRM, eventos) para dimensionar shard size.",
                "Techo real de D1 en escrituras concurrentes por shard.",
                "Latencia p95 de Workers AI por caso de uso.",
                "Coste efectivo por org de Workers + Queues + AI.",
                "Política de retención legal por jurisdicción.",
                "Disponibilidad real de Google Business Profile API.",
                "Cuotas de WhatsApp Cloud API por plantilla.",
                "Viabilidad de migrar orgs entre shards sin downtime.",
              ]}
            />
          </div>
        </GlassCard>
      </div>

      <div className="mt-8">
        <Callout kind="warn" title="Validación obligatoria">
          Los supuestos marcados deben validarse en Etapa A antes de comprometer la estrategia de
          sharding. Cada supuesto fallido abre un ADR de revisión. No se promueve una org a Etapa B
          (celda compartida multi-shard) sin evidencia de que el techo de D1 por shard es conocido y
          reversible. Medir es preferible a suponer; los límites de D1 (~10GB por base, sin RLS
          nativa, Time Travel como punto-en-tiempo) no se negocian con marketing.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/* 03 — RIESGOS Y CONTRADICCIONES DETECTADAS                    */
/* ============================================================ */
export function Fase1Riesgos() {
  return (
    <Section
      id="f1-riesgos"
      index="03"
      eyebrow="Riesgos y contradicciones detectadas"
      title="Riesgos, contradicciones y decisiones para resolverlos."
      intro="Análisis crítico, no victoria. Aquí se registran los riesgos que pueden romper la plataforma, las contradicciones detectadas entre ambición de escala y límites reales de Cloudflare, y las decisiones (ADRs) que los resuelven. Cada riesgo tiene una estrategia de respuesta explícita."
    >
      <H3 className="mb-4">Registro de riesgos</H3>
      <DataTable
        head={["Riesgo", "Impacto", "Estrategia", "Respuesta"]}
        rows={[
          [
            "D1 no soporta 100k restaurantes en una sola base",
            <Risk key="impacto" level="crítico" />,
            "Mitigar",
            "Sharding por celdas desde Etapa B; enrutamiento org→shard; migración dedicada para Enterprise. Ver sección escalabilidad.",
          ],
          [
            "D1/SQLite sin RLS nativa → fuga entre tenants por bug de repos",
            <Risk key="impacto" level="crítico" />,
            "Prevenir",
            "Tenant Enforcement Layer; organization_id obligatorio; constraints compuestos; tests IDOR en CI; revisión de PR enfocada.",
          ],
          [
            "Durable Objects como única copia de estado de sala",
            <Risk key="impacto" level="alto" />,
            "Mitigar",
            "D1 canónico; DO reconstruye desde D1; DO para coordinación, no persistencia canónica.",
          ],
          [
            "Coste de IA/Queues excede revenue metered",
            <Risk key="impacto" level="alto" />,
            "Mitigar",
            "Presupuesto por org; rate limit; fallback determinista; registro de coste por ai_request.",
          ],
          [
            "WhatsApp Cloud API cambia términos/cuotas",
            <Risk key="impacto" level="medio" />,
            "Contemplar",
            "Abstracción de proveedor (BSP); fallback email/SMS; plantillas auditadas.",
          ],
          [
            "Microservicios prematuros por aparentar Enterprise",
            <Risk key="impacto" level="medio" />,
            "Evitar",
            "Modular monolith primero; ADR obligatorio para extraer un servicio.",
          ],
          [
            "Dependencia excesiva de Time Travel como backup",
            <Risk key="impacto" level="alto" />,
            "Prevenir",
            "Backups cifrados a R2 versionados; pruebas de restauración; RPO≤15min.",
          ],
          [
            "KV usado como fuente autoritativa de permisos/entitlements",
            <Risk key="impacto" level="crítico" />,
            "Prevenir",
            "KV solo para no crítico; permisos y entitlements en D1; invalidación por tenant.",
          ],
        ]}
      />

      <div className="mt-8 grid md:grid-cols-2 gap-5">
        <Callout kind="warn" title="Contradicción detectada">
          Existe tensión entre{" "}
          <span className="text-foreground font-medium">
            “Cloudflare D1 será la base inicial”
          </span>{" "}
          y{" "}
          <span className="text-foreground font-medium">“escalar a 100k restaurantes”</span>. D1
          tiene ~10GB por base y un techo de escrituras concurrentes que no se ha validado. La
          resolución no es afirmar que D1 es ilimitado: es shard por celdas de organizaciones, con
          límites honestos y migración dedicada para Enterprise. La escala se gana por sharding, no
          por negar límites.
        </Callout>
        <Callout kind="adr" id="ADR-003" title="Sharding obligatorio desde Etapa B">
          D1 se partirá por celdas de organizaciones antes de alcanzar el límite de 10GB por base o
          el techo de escrituras concurrentes por shard. Cada organización se enruta a su celda
          mediante un mapa org→shard gestionado desde el Control Plane. Enterprise puede migrar a
          celda dedicada con downtime planificado. Esta decisión se revisa si D1 eleva sus límites
          de forma verificable.
        </Callout>
      </div>
    </Section>
  );
}
