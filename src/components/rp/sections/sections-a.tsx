import { Section, GlassCard, Tag, DataTable, GoldList, H3, Lead, Stat, Pill } from "../primitives";

/* ============================================================ */
/* 01 — RESUMEN EJECUTIVO                                       */
/* ============================================================ */
export function ResumenEjecutivo() {
  return (
    <Section
      id="resumen"
      index="01"
      eyebrow="Resumen ejecutivo"
      title="Una plataforma, no una colección de pantallas."
      intro="RestoPanel es un sistema operativo SaaS para hostelería que compite progresivamente con SevenRooms, OpenTable, CoverManager, Zenchef, ResDiary y Quandoo. La Fase 0 no construye producto: fija los cimientos de tenancy, seguridad, datos, contratos y marca para que cada módulo posterior se sostenga sin rearchitectura."
    >
      <div className="grid lg:grid-cols-3 gap-5">
        <GlassCard className="lg:col-span-2" variant="gold">
          <div className="text-[11px] font-mono uppercase tracking-wider rp-gold-text">Tesis</div>
          <p className="mt-3 font-display text-2xl sm:text-3xl font-light leading-snug text-balance">
            El restaurante no necesita otra app aislada. Necesita un panel unificado donde
            reservas, sala, clientes y reputación operen sobre los mismos datos, con IA que asista
            sin reemplazar el criterio humano y con aislamiento real entre empresas.
          </p>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            La diferenciación no viene de copiar funciones, sino de un CRM accionable,
            automatización medible, reputación conectada, analítica operativa y un Super Admin que
            opere la plataforma de verdad.
          </p>
        </GlassCard>

        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
          <Stat label="Fase actual" value="0 · Fundación" sub="estrategia + arquitectura + marca" accent="gold" />
          <Stat label="Horizonte MVP" value="Fase 1" sub="operación validable de 1 local" accent="teal" />
          <Stat label="Plataforma" value="Fase 4" sub="API pública + marketplace + IA" accent="fg" />
        </div>
      </div>

      <div className="mt-10 grid md:grid-cols-2 gap-5">
        <GlassCard>
          <H3>Qué entrega la Fase 0</H3>
          <Lead className="mt-2">
            Decisiones que cuesta mucho revertir, tomadas antes de escribir código de producto.
          </Lead>
          <div className="mt-5">
            <GoldList
              items={[
                "Product Brief, Brand Brief y registro de riesgos y decisiones.",
                "Mapa de dominios con ownership y contratos entre módulos.",
                "Arquitectura Control Plane + Tenant Cells sobre Cloudflare.",
                "Modelo de tenancy y Tenant Enforcement Layer (D1 sin RLS nativa).",
                "Modelo de datos nuclear y diccionario de datos.",
                "Matriz RBAC/ABAC, entitlements, threat model y catálogo de eventos.",
                "Design System base con tokens, foundations y componentes críticos.",
                "Roadmap por fases y backlog priorizado con Definition of Ready.",
              ]}
            />
          </div>
        </GlassCard>

        <GlassCard>
          <H3>Qué NO hace la Fase 0</H3>
          <Lead className="mt-2">Autodisciplina para no sobrediseñar ni prometer sin validar.</Lead>
          <div className="mt-5">
            <GoldList
              items={[
                "No implementa módulos de producto completos (reservas, CRM, IA…).",
                "No crea tablas, microservicios ni integraciones sin justificación de uso.",
                "No asume Realtime, marketplace ni API pública hasta medir madurez y coste.",
                "No promete D1 único e ilimitado: Time Travel no sustituye backups de conservación.",
                "No utiliza OpenAI/Anthropic como proveedores principales de IA.",
                "No acepta la organización enviada por el cliente como autoridad de tenant.",
              ]}
            />
          </div>
        </GlassCard>
      </div>

      <div className="mt-10">
        <H3 className="mb-4">Decisiones de partida</H3>
        <DataTable
          head={["Decisión", "Postura", "Prioridad", "Justificación"]}
          rows={[
            [
              "Cloudflare como plataforma completa",
              "Workers + D1 + R2 + KV + DO + Queues + Workflows",
              <Tag key="1">Imprescindible</Tag>,
              "Ejecución, persistencia e infraestructura controlable en un mismo borde. Reduce latencia, coste y superficie de ataque.",
            ],
            [
              "Multi-tenant por organización, no por base de datos dedicada",
              "Tenant cells compartidas hasta umbrales",
              <Tag key="2">Imprescindible</Tag>,
              "D1 no escala a una base por cliente desde el inicio. Celdas compartidas con migración dedicada para Enterprise.",
            ],
            [
              "Módulo monolito desplegable, dominios aislados",
              "Modular monolith sobre Workers",
              <Tag key="3">Imprescindible</Tag>,
              "Velocidad de iteración sin acoplar dominios. Microservicios solo cuando un cuello lo exija y se mida.",
            ],
            [
              "Sin prueba gratuita",
              "Trial solo bajo invitación controlada",
              <Tag key="4">Importante</Tag>,
              "B2B hostelero con onboarding asistido. Evita abuso y ruido en métricas de activación.",
            ],
            [
              "Stripe para suscripciones",
              "Mensual y anual, metered para IA",
              <Tag key="5">Imprescindible</Tag>,
              "Stripe mantiene la fuente de verdad de facturación; RestoPanel refleja entitlements.",
            ],
            [
              "Workers AI como motor primario",
              "Sin OpenAI/Anthropic por defecto",
              <Tag key="6">Importante</Tag>,
              "Soberanía de coste y latencia en el borde. Fallback determinista obligatorio en toda función de IA.",
            ],
          ]}
        />
      </div>
    </Section>
  );
}

/* ============================================================ */
/* 02 — SUPUESTOS Y DECISIONES CLAVE                            */
/* ============================================================ */
export function SupuestosDecisiones() {
  return (
    <Section
      id="supuestos"
      index="02"
      eyebrow="Supuestos y decisiones clave"
      title="Lo que damos por cierto y lo que decidimos blindar."
      intro="Los supuestos son hipótesis que, si fallan, cambian la arquitectura. Las decisiones clave son compromisos que fijamos ahora porque revertirlos después es caro. Ambos quedan registrados para revisión."
    >
      <div className="grid lg:grid-cols-2 gap-5">
        <GlassCard>
          <H3>Supuestos operativos</H3>
          <Lead className="mt-2">Si alguno se rompe, se abre un ADR de revisión.</Lead>
          <DataTable
            className="mt-4"
            head={["Supuesto", "Riesgo si falla"]}
            rows={[
              ["D1 cubre la carga transaccional esperada por celda (< umbral definido).", "Migración a arquitectura dedicada antes de lo previsto."],
              ["Workers AI es suficiente para los casos de IA del MVP.", "Introducir un proveedor externo con costo y soberanía distintos."],
              ["WhatsApp Cloud API cubre volumen y plantillas requeridas.", "Recurrir a un BSP aprobado con coste y dependencia adicionales."],
              ["Google Business Profile concede acceso a reseñas dentro de cuotas.", "Reputación opera en modo lectura parcial o diferida."],
              ["Los restaurantes aceptan onboarding asistido sin trial libre.", "Replantar adquisición y pricing."],
              ["Stripe soporta multi-divisa y fiscalidad de los mercados objetivo.", "Añadir pasarelas locales por país."],
            ]}
          />
        </GlassCard>

        <GlassCard>
          <H3>Decisiones clave blindadas</H3>
          <Lead className="mt-2">Compromisos arquitectónicos de la Fase 0.</Lead>
          <DataTable
            className="mt-4"
            head={["Decisión", "Estado"]}
            rows={[
              ["IDs opacos (ULID) en tablas transaccionales.", <Tag key="a">Imprescindible</Tag>],
              ["UTC en base de datos; IANA timezone por organización y local.", <Tag key="b">Imprescindible</Tag>],
              ["Dinero en minor units + ISO 4217.", <Tag key="c">Imprescindible</Tag>],
              ["Eventos críticos append-only + outbox transaccional.", <Tag key="d">Imprescindible</Tag>],
              ["Soft delete solo con justificación documentada.", <Tag key="e">Importante</Tag>],
              ["Migraciones forward-only, versionadas por celda.", <Tag key="f">Imprescindible</Tag>],
              ["Constraints compuestos (organization_id, …) para impedir cross-tenant.", <Tag key="g">Imprescindible</Tag>],
              ["Sin RLS simulada: Tenant Enforcement Layer en repositorios.", <Tag key="h">Imprescindible</Tag>],
              ["PII clasificada y minimizada; redacción en logs.", <Tag key="i">Imprescindible</Tag>],
              ["Realtime sobre Durable Objects, no Cloudflare Realtime por ahora.", <Tag key="j">Importante</Tag>],
            ]}
          />
        </GlassCard>
      </div>

      <div className="mt-10 grid md:grid-cols-4 gap-4">
        <Stat label="ADRs previstos" value="14" sub="decisiones irreversibles documentadas" accent="gold" />
        <Stat label="Supuestos" value="6" sub="hipótesis activas a validar" accent="teal" />
        <Stat label="Entregables Fase 0" value="28" sub="definidos en el brief" accent="fg" />
        <Stat label="DoD checklist" value="29" sub="criterios de completitud" accent="gold" />
      </div>

      <div className="mt-8 rp-glass rounded-xl p-5 border-l-2 border-[var(--gold)]/50">
        <div className="flex items-start gap-3">
          <span className="font-mono text-xs rp-gold-text mt-0.5">ADR-001</span>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span className="text-foreground font-medium">Decision record obligatorio.</span> Toda
            decisión costosa o irreversible (elección de motor de IA, particionado de celdas,
            modelo de facturación metered, política de retención, estrategia de Realtime) debe
            quedar en un ADR con contexto, alternativas, decisión y consecuencias antes de
            implementarse.
          </p>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================ */
/* 03 — VISIÓN ESTRATÉGICA                                      */
/* ============================================================ */
export function VisionEstrategica() {
  return (
    <Section
      id="vision"
      index="03"
      eyebrow="Visión estratégica"
      title="Producto, mercado, diferenciación y métricas."
      intro="RestoPanel se posiciona como panel operativo premium con CRM accionable, IA con revisión humana y un Super Admin Enterprise real. No compite por precio: compite por densidad operativa y degradación elegante."
    >
      {/* Problemas */}
      <H3 className="mb-4">Problemas que resuelve</H3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {PROBLEMS.map((p) => (
          <GlassCard key={p.t}>
            <div className="text-[var(--gold)] font-mono text-xs">{p.n}</div>
            <div className="mt-2 font-display text-lg font-medium">{p.t}</div>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{p.d}</p>
          </GlassCard>
        ))}
      </div>

      {/* Segmentos */}
      <div className="grid lg:grid-cols-2 gap-5 mb-12">
        <GlassCard>
          <H3>Perfiles de cliente objetivo</H3>
          <Lead className="mt-2">De independiente premium a grupo y franquicia.</Lead>
          <DataTable
            className="mt-4"
            head={["Segmento", "Tamaño", "Entrada"]}
            rows={[
              ["Restaurante independiente premium", "1 local", <Tag key="1">Fase 1</Tag>],
              ["Grupo pequeño (2–10 locales)", "Multi-location", <Tag key="2">Fase 2</Tag>],
              ["Cadena / grupo medio (10–50)", "Multi-location + roles", <Tag key="3">Fase 3</Tag>],
              ["Franquicia (50+)", "Red + governance", <Tag key="4">Fase 3</Tag>],
              ["Enterprise hotelero / multi-concepto", "Dedicated cell", <Tag key="5">Fase 4</Tag>],
            ]}
          />
        </GlassCard>

        <GlassCard>
          <H3>Diferenciadores frente a competidores</H3>
          <Lead className="mt-2">No por más funciones, por mejor tejido conectivo.</Lead>
          <DataTable
            className="mt-4"
            head={["Eje", "RestoPanel", "Competidores típicos"]}
            rows={[
              ["CRM accionable", "Eventos + IA + segmentación nativa", "CRM adjunto o ausente"],
              ["IA con revisión humana", "Sugerir, clasificar, resumir; aprobar lo sensible", "Automatismos ciegos o nada"],
              ["Reputación conectada", "Reseñas → CRM → automatización", "Widget aislado"],
              ["Analítica operativa", "Agregados reconstruibles por eventos", "Dashboards estáticos"],
              ["Super Admin real", "Operaciones, no decorativo", "Inexistente o limitado"],
              ["Degradación elegante", "Sala opera si falla IA/comms", "Cascada de fallos"],
              ["Tenancy verificable", "Tenant Enforcement Layer + tests IDOR", "Aislamiento implícito"],
            ]}
          />
        </GlassCard>
      </div>

      {/* Modelo y planes */}
      <div className="grid lg:grid-cols-3 gap-5 mb-12">
        <GlassCard className="lg:col-span-2" variant="teal">
          <H3>Modelo de negocio</H3>
          <Lead className="mt-2">Suscripción B2B sin trial libre, con metered para IA y comunicaciones.</Lead>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                Fuentes de ingreso
              </div>
              <GoldList
                items={[
                  "Suscripción mensual/anual por local y plan.",
                  "Consumo metered: IA, WhatsApp, SMS, email más allá del incluido.",
                  "Integraciones premium y API pública (fase posterior).",
                  "Onboarding y migración asistida facturable.",
                ]}
              />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                Principios de pricing
              </div>
              <GoldList
                items={[
                  "Local como unidad de facturación, no usuario.",
                  "Entitlements acoplados al plan, verificados en servidor.",
                  "Límites por consumo medidos, no estimados a ojo.",
                  "Sin prueba gratuita; demo y onboarding asistido.",
                ]}
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <H3>Planes previstos</H3>
          <div className="mt-3 space-y-3">
            {[
              ["Solo", "1 local · operación esencial", "Fase 1"],
              ["Pro", "1–5 locales · CRM + automatización", "Fase 2"],
              ["Group", "multi-location · roles avanzados", "Fase 3"],
              ["Enterprise", "celda dedicada · SLA · API", "Fase 4"],
            ].map(([n, d, f]) => (
              <div key={n} className="flex items-start justify-between gap-3 border-b border-border/40 pb-3 last:border-0">
                <div>
                  <div className="font-medium">{n}</div>
                  <div className="text-xs text-muted-foreground">{d}</div>
                </div>
                <Pill tone="outline">{f}</Pill>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Métricas */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <GlassCard variant="gold">
          <div className="text-[11px] font-mono uppercase tracking-wider rp-gold-text">North Star</div>
          <div className="mt-2 font-display text-2xl font-light">Servicios activos semana</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Número de locales con al menos un servicio operado end-to-end en la última semana.
            Mide valor real entregado, no registros.
          </p>
        </GlassCard>
        <GlassCard>
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">KPIs de producto</div>
          <GoldList
            className="mt-3"
            items={[
              "Activación: configuración inicial completa en < 48h.",
              "Retención D30 / D90 por local.",
              "Reservas confirmadas vs. no-show.",
              "Adopción de CRM y automatización.",
            ]}
          />
        </GlassCard>
        <GlassCard>
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">KPIs de negocio</div>
          <GoldList
            className="mt-3"
            items={[
              "ARR y ARR por local.",
              "Net Revenue Retention.",
              "Churn por local y por grupo.",
              "CAC payback < 12 meses.",
            ]}
          />
        </GlassCard>
      </div>

      {/* Hipótesis */}
      <GlassCard>
        <H3>Hipótesis a validar antes de escalar</H3>
        <Lead className="mt-2">
          No construir amplitud hasta confirmar que el núcleo genera valor medible.
        </Lead>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <GoldList
            items={[
              "Un restaurante opera su sala completa con RestoPanel sin herramientas paralelas.",
              "El CRM accionable reduce no-show y aumenta recurrencia medible.",
              "La IA con revisión humana se usa y aprueba, no se ignora.",
              "El onboarding asistido escala sin equipo de soporte por cliente.",
            ]}
          />
          <GoldList
            items={[
              "La reputación conectada mueve métricas operativas, no solo vanity.",
              "Multi-location se demanda antes que features de un solo local.",
              "El coste por celda de D1 + Workers es sostenible bajo el pricing previsto.",
              "El Super Admin se usa para operar, no solo para mirar.",
            ]}
          />
        </div>
      </GlassCard>
    </Section>
  );
}

const PROBLEMS = [
  { n: "01", t: "Reservas dispersas", d: "Telefono, WhatsApp, redes y widgets sin visibilidad única ni control de disponibilidad." },
  { n: "02", t: "Sala opaca", d: "Mesas, turnos y ocupación se gestionan en papel o apps no conectadas al CRM." },
  { n: "03", t: "CRM inexistente", d: "Cliente recurrente sin memoria: alergias, preferencias, VIP y historial perdido." },
  { n: "04", t: "Reputación desconectada", d: "Reseñas que no alimentan CRM ni automatización; respuestas lentas o genéricas." },
  { n: "05", t: "Comunicaciones reactivas", d: "Confirmaciones, recordatorios y campañas manuales o sin trazabilidad." },
  { n: "06", t: "Sin analítica operativa", d: "Decisiones sin datos: picos, no-show, ocupación, rentabilidad por turno." },
];
