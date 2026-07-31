import { Section, GlassCard, Tag, DataTable, GoldList, H3, Lead, Pill } from "../primitives";

/* ============================================================ */
/* 06 — ARQUITECTURA FUNCIONAL                                  */
/* ============================================================ */
const DOMAINS = [
  { n: "01", name: "Identity & Sessions", prio: "Imprescindible", obj: "Identidad global, MFA, passkeys, sesiones y dispositivos.", users: "Todos", deps: "—", risk: "Fuga de sesión = compromiso multi-tenant", mvp: "Sí" },
  { n: "02", name: "Organizations & Tenancy", prio: "Imprescindible", obj: "Organización, locations, celda, routing de tenant.", users: "Plataforma + owner", deps: "Identity", risk: "Aislamiento mal resuelto es catastrófico", mvp: "Sí" },
  { n: "03", name: "Authorization (RBAC+ABAC)", prio: "Imprescindible", obj: "Roles, permisos, scoped por organización/local.", users: "Todos", deps: "Organizations", risk: "IDOR, escalada de privilegios", mvp: "Sí" },
  { n: "04", name: "Billing & Entitlements", prio: "Imprescindible", obj: "Planes, suscripciones, límites, metered.", users: "Owner + Plataforma", deps: "Organizations", risk: "Cobro mal medido o eludido", mvp: "Sí (básico)" },
  { n: "05", name: "Reservations & Availability", prio: "Imprescindible", obj: "Reservas, disponibilidad, conflictos, no-show.", users: "Host, cliente", deps: "Floor, CRM", risk: "Overbooking, pérdida de datos", mvp: "Sí" },
  { n: "06", name: "Tables & Floor Operations", prio: "Imprescindible", obj: "Plano de sala, mesas, ocupación, turnos.", users: "Host, manager", deps: "Reservations", risk: "Estado inconsistente entre dispositivos", mvp: "Sí" },
  { n: "07", name: "CRM & Customer Data", prio: "Importante", obj: "Clientes, preferencias, VIP, historial, segmentos.", users: "Host, manager, marketing", deps: "Reservations", risk: "PII mal gestionada", mvp: "Parcial" },
  { n: "08", name: "Workforce", prio: "Importante", obj: "Personal, turnos, roles de sala, asistencia.", users: "Manager", deps: "Authorization", risk: "Conflictos de turno", mvp: "No" },
  { n: "09", name: "Menu & Orders", prio: "Posterior", obj: "Carta, productos, pedidos (no POS completo).", users: "Manager, staff", deps: "Floor", risk: "Conflicto con POS existente", mvp: "No" },
  { n: "10", name: "Reviews & Reputation", prio: "Importante", obj: "Reseñas, sentimiento, respuestas sugeridas.", users: "Manager", deps: "CRM, Comms", risk: "Dependencia de Google API", mvp: "No" },
  { n: "11", name: "Communications & Notifications", prio: "Imprescindible", obj: "Email, WhatsApp, SMS, plantillas, entrega.", users: "Sistema + cliente", deps: "Reservations", risk: "Spam, coste, deliverability", mvp: "Sí (básico)" },
  { n: "12", name: "Marketing & Automations", prio: "Importante", obj: "Campañas, segmentación, reglas, journeys.", users: "Marketing", deps: "CRM, Comms", risk: "Abuso, coste, fatiga", mvp: "No" },
  { n: "13", name: "Integrations & Public API", prio: "Posterior", obj: "Conectores, webhooks, API pública versionada.", users: "Partners, dev", deps: "Todos", risk: "Superficie de ataque, versionado", mvp: "No" },
  { n: "14", name: "Analytics & Usage", prio: "Importante", obj: "Agregados operativos, uso, costes.", users: "Manager, Plataforma", deps: "Todos", risk: "Agregados no reconstruibles", mvp: "Parcial" },
  { n: "15", name: "AI Platform", prio: "Importante", obj: "Sugerencias, clasificación, predicción, resúmenes.", users: "Sistema + humano", deps: "CRM, Reputation", risk: "Alucinación, coste, PII", mvp: "No" },
  { n: "16", name: "Audit & Security Ops", prio: "Imprescindible", obj: "Auditoría, incidentes, impersonación, kill switches.", users: "Plataforma, Sec", deps: "Identity", risk: "Acceso privilegiado sin trazabilidad", mvp: "Sí (básico)" },
  { n: "17", name: "Super Admin Operations", prio: "Importante", obj: "Operación de la plataforma: orgs, celdas, salud.", users: "Plataforma", deps: "Todos", risk: "Convertirse en panel decorativo", mvp: "Mínimo" },
];

const APPS = [
  ["landing", "Adquisición y SEO", "Público", "Imprescindible"],
  ["booking", "Widget de reserva pública", "Cliente final", "Imprescindible"],
  ["dashboard", "Operación del restaurante", "Host/manager/owner", "Imprescindible"],
  ["super-admin", "Centro de control de plataforma", "Plataforma", "Importante"],
  ["docs", "Documentación pública y API", "Dev + usuarios", "Importante"],
  ["status", "Estado de servicio", "Público + clientes", "Importante"],
];

export function ArquitecturaFuncional() {
  return (
    <Section
      id="arq-funcional"
      index="06"
      eyebrow="Arquitectura funcional"
      title="17 dominios con ownership, contratos y frontera clara."
      intro="Cada dominio expone casos de uso y contratos públicos. Los módulos no acceden a tablas ajenas: se comunican mediante comandos, queries, eventos o interfaces explícitas. Las apps componen módulos, pero no contienen reglas de negocio críticas."
    >
      {/* Apps */}
      <H3 className="mb-4">Experiencias (apps)</H3>
      <DataTable
        className="mb-12"
        head={["App", "Propósito", "Usuario", "Prioridad"]}
        rows={APPS.map((r) => [r[0], r[1], r[2], <Tag key={r[0]}>{r[3]}</Tag>])}
      />

      {/* Domains grid */}
      <H3 className="mb-4">Mapa de dominios</H3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {DOMAINS.map((d) => (
          <GlassCard key={d.n} className="flex flex-col">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs rp-gold-text">{d.n}</span>
              <Tag kind={d.prio}>{d.prio}</Tag>
            </div>
            <div className="mt-2 font-display text-lg font-medium">{d.name}</div>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed flex-1">{d.obj}</p>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Usuarios</span><span className="text-foreground/80">{d.users}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Depende de</span><span className="text-foreground/80">{d.deps}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Riesgo</span><span className="text-foreground/80 text-right">{d.risk}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">MVP</span><span className={d.mvp.startsWith("Sí") ? "rp-teal-text" : "text-muted-foreground"}>{d.mvp}</span></div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Contratos */}
      <GlassCard variant="gold">
        <H3>Contratos entre dominios</H3>
        <Lead className="mt-2">La frontera que impide el acoplamiento estructural.</Lead>
        <div className="mt-4 grid md:grid-cols-2 gap-5">
          <GoldList
            items={[
              "Comando: petición mutable con input tipado (Zod), idempotency key y actor.",
              "Query: lectura inmutable, cacheable, con scopes de permiso.",
              "Evento: append-only en outbox, versionado, con correlation/causation.",
              "Interfaz: contrato explícito para adaptadores (email, WhatsApp, IA, pagos).",
            ]}
          />
          <GoldList
            items={[
              "CI bloquea imports prohibidos entre paquetes (eslint boundaries).",
              "database no contiene reglas de negocio.",
              "ui no importa auth, billing ni base de datos.",
              "workers llaman casos de uso; no escriben SQL improvisado.",
              "Sin carpetas genéricas utils/services/helpers sin owner.",
            ]}
          />
        </div>
      </GlassCard>
    </Section>
  );
}

/* ============================================================ */
/* 07 — ARQUITECTURA TÉCNICA                                    */
/* ============================================================ */
const CF_STACK = [
  ["Workers", "Ejecución web, APIs y servicios", "Imprescindible"],
  ["OpenNext", "Despliegue de Next.js en Workers", "Imprescindible"],
  ["D1", "Persistencia SQL transaccional canónica", "Imprescindible"],
  ["R2", "Objetos, archivos, backups cifrados", "Imprescindible"],
  ["KV", "Caché y config no crítica solo", "Imprescindible"],
  ["Durable Objects", "Concurrencia, locks, presencia, tiempo real", "Imprescindible"],
  ["Queues", "Eventos, trabajos asíncronos, reintentos", "Imprescindible"],
  ["Workflows", "Procesos largos, durables, reanudables", "Importante"],
  ["Images", "Transformación y entrega de imágenes", "Importante"],
  ["Browser Rendering", "PDFs, capturas, automatizaciones permitidas", "Posterior"],
  ["Workers AI", "Inferencia y funciones de IA (proveedor primario)", "Importante"],
  ["Turnstile", "Protección contra bots", "Imprescindible"],
  ["WAF + Rate Limiting", "Defensa perimetral", "Imprescindible"],
  ["Realtime", "Solo tras validar madurez, coste y compatibilidad", "Experimental"],
];

const MONO_REPO = `restopanel/
  apps/         landing · booking · dashboard · super-admin · docs · status
  packages/     contracts · ui · design-tokens · auth · tenancy · permissions
                database · billing · reservations · floor · crm · menu · workforce
                reputation · communications · automation · analytics · ai
                notifications · storage · audit · observability · config
  workers/      api · webhooks · queues · workflows · cron · realtime
  database/     migrations/{control-plane,tenant-cell} · seeds · fixtures
  design-system/ tokens · foundations · components · patterns · docs · tests
  infra/        cloudflare · environments · policies · runbooks
  docs/         adr · threat-models · data-dictionary · event-catalog`;

export function ArquitecturaTecnica() {
  return (
    <Section
      id="arq-tecnica"
      index="07"
      eyebrow="Arquitectura técnica"
      title="Control Plane + Tenant Cells sobre Cloudflare."
      intro="Una arquitectura de plan de control global y celdas de tenant operativas. El plan de control guarda identidad, organizaciones, routing y billing; las celdas guardan la operación transaccional. Las organizaciones Enterprise pueden migrar a celda dedicada sin cambiar contratos de aplicación."
    >
      {/* Diagrama */}
      <GlassCard variant="gold" className="mb-12">
        <H3>Topología de despliegue</H3>
        <div className="mt-5 font-mono text-[11px] sm:text-xs leading-relaxed overflow-x-auto rp-scroll-thin">
          <pre className="text-foreground/80">{`┌─────────────────────────────────────────────────────────────────┐
│                      CONTROL PLANE (global)                      │
│  Identity · Organizations · Routing · Billing · Entitlements    │
│  Feature flags · Health · Audit · Impersonation · Super Admin   │
└───────────────┬─────────────────────────┬───────────────────────┘
                │                         │
        ┌───────▼────────┐       ┌────────▼───────┐
        │  Tenant Cell A │       │  Tenant Cell B │  …  │ Dedicated Cell (Enterprise)
        │  D1 · DO · Q    │       │  D1 · DO · Q    │     │  D1 dedicado · SLA
        │  org_01…org_N   │       │  org_K…org_M    │     │  org_enterprise
        └───────┬────────┘       └────────┬───────┘     └──────────┬──────────┘
                │                         │                        │
        ┌───────▼─────────────────────────▼────────────────────────▼──────┐
        │   Módulos de dominio: reservations · floor · crm · reputation …  │
        │   Apps: booking · dashboard · super-admin                        │
        └──────────────────────────────────────────────────────────────────┘`}</pre>
        </div>
      </GlassCard>

      {/* Stack Cloudflare */}
      <H3 className="mb-4">Stack Cloudflare</H3>
      <DataTable
        className="mb-12"
        head={["Servicio", "Uso", "Prioridad"]}
        rows={CF_STACK.map((r) => [r[0], r[1], <Tag key={r[0]}>{r[2]}</Tag>])}
      />

      {/* Monorepo */}
      <div className="grid lg:grid-cols-2 gap-5 mb-12">
        <GlassCard>
          <H3>Monorepo (pnpm + Turborepo)</H3>
          <div className="mt-4 font-mono text-[11px] leading-relaxed text-foreground/75 overflow-x-auto rp-scroll-thin">
            <pre>{MONO_REPO}</pre>
          </div>
        </GlassCard>
        <GlassCard>
          <H3>Reglas de dependencias</H3>
          <GoldList
            className="mt-3"
            items={[
              "Apps componen módulos; no contienen reglas de negocio críticas.",
              "Módulos exponen casos de uso y contratos públicos.",
              "Workers llaman casos de uso; no escriben SQL improvisado.",
              "database no contiene reglas de negocio.",
              "ui no importa auth, billing ni base de datos.",
              "Módulos no acceden a tablas ajenas.",
              "Dominios se comunican por comandos/queries/eventos/interfaces.",
              "CI bloquea dependencias prohibidas y ciclos.",
            ]}
          />
        </GlassCard>
      </div>

      {/* Comparativa de estilo */}
      <div className="grid lg:grid-cols-3 gap-5 mb-12">
        <GlassCard>
          <H3>Monolito modular</H3>
          <Pill tone="gold" className="mb-3">Decisión Fase 0–3</Pill>
          <GoldList
            items={[
              "Un despliegue, múltiples dominios aislados.",
              "Velocidad de iteración máxima.",
              "Contratos internos ya definen futura extracción.",
              "Aislamiento lógico, no físico.",
            ]}
          />
        </GlassCard>
        <GlassCard>
          <H3>Modular monolith (matiz)</H3>
          <Pill tone="outline" className="mb-3">Posterior</Pill>
          <GoldList
            items={[
              "Mismos módulos, pero con tablas y colas físicamente separadas.",
              "Útil cuando un dominio crece en carga o ritmo de cambio.",
              "Migración incremental sin reescribir contratos.",
            ]}
          />
        </GlassCard>
        <GlassCard>
          <H3>Microservicios</H3>
          <Pill tone="outline" className="mb-3">Solo con evidencia</Pill>
          <GoldList
            items={[
              "Solo cuando un cuello medido lo exija.",
              "Coste operativo y de coherencia alto.",
              "Requiere observabilidad madura previa.",
              "No por aparentar madurez Enterprise.",
            ]}
          />
        </GlassCard>
      </div>

      {/* Cross-cutting */}
      <H3 className="mb-4">Transversales</H3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          ["API versioning", "/v1 explícito. Versionado de contrato por paquete. Deprecación con ventana."],
          ["Feature flags", "Globales en control plane, replicados a KV. Por plan, por org, por local."],
          ["Migrations", "Forward-only, versionadas por celda. Rollback = nueva migración correctiva."],
          ["Testing", "Unit + integración + contrato + E2E por riesgo. Tests negativos de IDOR obligatorios."],
          ["Observabilidad", "Métricas, logs redactados, trazas, structured events. SLO por dominio."],
          ["CI/CD", "Pipelines por paquete. Preview deploys. Bloqueo de merges sin verde."],
          ["Entornos", "dev · staging · production. Datos sintéticos en no-prod."],
          ["Secretos", "Fuera de código, D1, KV, R2 y frontend. Rotación documentada."],
          ["Backup/RTO", "Exports cifrados a R2 versionados. Time Travel no sustituye conservación larga."],
        ].map(([k, v]) => (
          <GlassCard key={k}>
            <div className="text-[11px] font-mono uppercase tracking-wider rp-gold-text">{k}</div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v}</p>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}

/* ============================================================ */
/* 08 — MODELO DE DATOS                                         */
/* ============================================================ */
const DATA_CONVENTIONS = [
  ["IDs", "ULID opacos, no predecibles. No autoincrement exponible."],
  ["Timestamps", "UTC en base. IANA timezone por organización y local."],
  ["Dinero", "Minor units + ISO 4217. Nunca float."],
  ["Tenancy", "organization_id NOT NULL en toda tabla tenant. location_id cuando aplique."],
  ["Constraints", "Claves compuestas (organization_id, id) para impedir cross-tenant."],
  ["Soft delete", "Solo con justificación documentada._deleted_at nulo por defecto."],
  ["Eventos", "Append-only en outbox. No se mutan."],
  ["PII", "Clasificada, minimizada, redactada en logs."],
  ["Índices", "Derivados de consultas reales, no especulativos."],
  ["Migraciones", "Forward-only, versionadas."],
];

const ENTITY_GROUPS = [
  {
    group: "Core / Tenancy",
    mvp: "Sí",
    entities: [
      ["organizations", "id, slug, name, default_tz, default_currency, status, plan_id, cell_id"],
      ["locations", "id, org_id, name, tz, currency, address_ref, status"],
      ["tenant_cells", "id, region, capacity, state, thresholds"],
      ["feature_flags", "id, key, scope, value, org_id?, plan?"],
    ],
  },
  {
    group: "Identity & Access",
    mvp: "Sí",
    entities: [
      ["users", "id, email, status, mfa_enrolled, created_at"],
      ["identities", "id, user_id, provider, subject, credentials_ref"],
      ["sessions", "id, user_id, device_id, issued_at, expires_at, revoked_at"],
      ["memberships", "id, user_id, org_id, location_id?, role_id, status"],
      ["roles", "id, org_id, name, scope, permissions[]"],
      ["permissions", "id, key, resource, action, constraints"],
    ],
  },
  {
    group: "Reservations & Floor",
    mvp: "Sí",
    entities: [
      ["reservation_slots", "id, location_id, date, time, party_size_max, hold_seconds"],
      ["reservations", "id, org_id, location_id, customer_id, table_id?, status, party_size, time, source, idem_key"],
      ["tables", "id, location_id, name, seats, zone_id, status"],
      ["floor_zones", "id, location_id, name, order"],
      ["shifts", "id, location_id, name, open, close, days[]"],
    ],
  },
  {
    group: "CRM & Customers",
    mvp: "Parcial",
    entities: [
      ["customers", "id, org_id, name, email, phone, tz, consent, tags[]"],
      ["customer_attributes", "id, customer_id, key, value, source, sensitive"],
      ["customer_events", "id, customer_id, type, payload, occurred_at"],
      ["segments", "id, org_id, name, rule_def, version"],
    ],
  },
  {
    group: "Communications & Notifications",
    mvp: "Sí (básico)",
    entities: [
      ["messages", "id, org_id, channel, to, template, status, idem_key"],
      ["templates", "id, org_id, channel, key, locale, version, body_ref"],
      ["deliveries", "id, message_id, attempt, status, provider_ref, cost_minor"],
    ],
  },
  {
    group: "Billing & Entitlements",
    mvp: "Sí (básico)",
    entities: [
      ["plans", "id, name, price_minor, currency, interval, entitlements"],
      ["subscriptions", "id, org_id, plan_id, stripe_sub_ref, status, current_period"],
      ["usage_records", "id, org_id, metric, qty, period, metered_at"],
      ["entitlements", "id, org_id, key, limit, consumed, period"],
    ],
  },
  {
    group: "Audit & Events",
    mvp: "Sí",
    entities: [
      ["audit_log", "id, org_id, actor_id, actor_effective_id?, action, target, meta, at, ip_redacted"],
      ["events_outbox", "id, org_id, type, version, payload, status, attempts, at"],
      ["incident_records", "id, org_id?, severity, status, summary, runbook_ref"],
    ],
  },
  {
    group: "Reputation, Workforce, Menu, AI, Analytics",
    mvp: "No / Parcial",
    entities: [
      ["reviews", "id, org_id, location_id, source, rating, body, sentiment, reply_id?"],
      ["staff", "id, org_id, location_id, user_id?, role, status"],
      ["staff_shifts", "id, location_id, staff_id, start, end, status"],
      ["menu_items", "id, location_id, name, price_minor, available, allergens[]"],
      ["ai_runs", "id, org_id, model, prompt_version, scope, cost, latency, result_ref, approved_by?"],
      ["analytics_snapshots", "id, org_id, location_id, metric, dims, value, period, built_at"],
    ],
  },
];

export function ModeloDatos() {
  return (
    <Section
      id="datos"
      index="08"
      eyebrow="Modelo de datos"
      title="D1 canónico, convenciones estrictas, tenancy en cada tabla."
      intro="D1 es la fuente de verdad transaccional por control plane y tenant cell. No existe RLS nativa equivalente a PostgreSQL: el aislamiento se garantiza con una Tenant Enforcement Layer en los repositorios, constraints compuestos y tests negativos de IDOR."
    >
      {/* Convenciones */}
      <GlassCard variant="gold" className="mb-12">
        <H3>Convenciones nucleares</H3>
        <div className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-2">
          {DATA_CONVENTIONS.map(([k, v]) => (
            <div key={k} className="flex gap-3 py-1.5 border-b border-border/30">
              <span className="font-mono text-xs rp-gold-text w-28 shrink-0">{k}</span>
              <span className="text-sm text-foreground/85">{v}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Tenant enforcement */}
      <GlassCard className="mb-12">
        <H3>Tenant Enforcement Layer</H3>
        <Lead className="mt-2">D1 no ofrece RLS nativa; no simularla. El aislamiento es de aplicación, verificado.</Lead>
        <div className="mt-4 grid md:grid-cols-2 gap-5">
          <GoldList
            items={[
              "Contexto tenant resuelto en servidor por cada request.",
              "Repositorios exigen organizationId en todas las queries tenant.",
              "Consultas siempre filtradas por tenant; sin SELECT * sin scope.",
              "Foreign keys y claves compuestas contra relaciones cruzadas.",
              "Validación de ownership del recurso antes de mutar.",
            ]}
          />
          <GoldList
            items={[
              "Tests negativos de aislamiento entre organizaciones.",
              "Pruebas IDOR: usuario A no alcanza recurso de org B.",
              "Cache poisoning: invalidación por tenant al mutar.",
              "Webhooks falsificados: verificación de firma y origen.",
              "Auditoría de accesos privilegiados e impersonación.",
            ]}
          />
        </div>
      </GlassCard>

      {/* Entidades */}
      <H3 className="mb-4">Entidades por dominio</H3>
      <div className="space-y-6">
        {ENTITY_GROUPS.map((g) => (
          <div key={g.group}>
            <div className="flex items-center gap-3 mb-3">
              <H3 className="text-lg">{g.group}</H3>
              <Tag kind={g.mvp.startsWith("Sí") ? "Imprescindible" : g.mvp === "Parcial" ? "Importante" : "Posterior"}>
                MVP · {g.mvp}
              </Tag>
            </div>
            <DataTable
              head={["Tabla", "Campos principales (resumen)"]}
              rows={g.entities.map((e) => [
                <span key="name" className="font-mono text-[var(--gold)]">{e[0]}</span>,
                <span key="fields" className="font-mono text-xs text-muted-foreground">{e[1]}</span>,
              ])}
            />
          </div>
        ))}
      </div>

      <div className="mt-8 rp-glass rounded-xl p-5 border-l-2 border-[var(--teal)]/50">
        <div className="flex items-start gap-3">
          <span className="font-mono text-xs rp-teal-text mt-0.5">ADR-002</span>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span className="text-foreground font-medium">No crear tablas por volumen.</span> Cada
            entidad debe justificar necesidad, dependencia, coste y prioridad. Las entidades
            marcadas como posterior se modelan conceptualmente pero no se migran hasta su fase, para
            no acumular superficie muerta ni deuda de mantenimiento.
          </p>
        </div>
      </div>
    </Section>
  );
}
