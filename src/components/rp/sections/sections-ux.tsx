import { Section, GlassCard, Tag, DataTable, GoldList, H3, Lead, Pill } from "../primitives";

/* ============================================================ */
/* 09 — FLUJOS UX CRÍTICOS                                      */
/* ============================================================ */
const FLOWS = [
  {
    id: "onboarding",
    actor: "Owner",
    goal: "Dar de alta el restaurante y operar el primer servicio.",
    steps: ["Alta con email + MFA", "Crear organización y local", "Configurar sala y turnos", "Importar/crear clientes iniciales", "Conectar WhatsApp/email", "Primer reserva de prueba"],
    states: "borrador → configurado → listo",
    exceptions: ["Dominio ya existente", "WhatsApp no verificado", "Pago fallido"],
    auto: ["Email de bienvenida", "Checklist guiado", "Validación de configuración"],
    data: "organization, location, user, membership, floor, shifts",
    metric: "Tiempo a primer servicio < 48h",
    prio: "Imprescindible",
  },
  {
    id: "reserve",
    actor: "Cliente final",
    goal: "Reservar una mesa en segundos.",
    steps: ["Elegir fecha/hora", "Party size", "Datos del cliente", "Confirmar", "Recibir confirmación"],
    states: "solicitada → confirmada → check-in → completada",
    exceptions: ["Sin disponibilidad", "Fuera de horario", "Cliente bloqueado"],
    auto: ["Validación de slot", "Creación/actualización de cliente CRM", "Confirmación email+WhatsApp"],
    data: "reservation, customer, slot hold, message",
    metric: "Conversión de widget > 35%",
    prio: "Imprescindible",
  },
  {
    id: "confirm-remind",
    actor: "Sistema",
    goal: "Reducir no-show con confirmación y recordatorio.",
    steps: ["Reserva confirmada", "Recordatorio T-24h", "Reconfirmación opcional", "Check-in en sala"],
    states: "confirmada → reconfirmada → check-in | no-show",
    exceptions: ["Sin respuesta", "Cliente cancela", "Canal caído"],
    auto: ["Recordatorio programado", "Fallback de canal", "Marca de no-show tras ventana"],
    data: "message, delivery, reservation.status",
    metric: "No-show < 8%",
    prio: "Imprescindible",
  },
  {
    id: "service",
    actor: "Host / Staff",
    goal: "Operar el servicio en tiempo real.",
    steps: ["Ver plano de sala", "Check-in de reservas", "Asignar/reasignar mesas", "Gestionar walk-ins", "Cerrar mesa"],
    states: "libre → reservada → ocupada → por limpiar → libre",
    exceptions: ["Overbooking detectado", "Conflicto de mesa", "Caída de DO sync"],
    auto: ["Sincronización por DO", "Detección de conflictos", "Notificación a host"],
    data: "table.status, reservation.status, floor_event",
    metric: "Latencia de sync < 500ms",
    prio: "Imprescindible",
  },
  {
    id: "review",
    actor: "Cliente / Manager",
    goal: "Pedir y gestionar reseñas.",
    steps: ["Post-servicio: petición de review", "Cliente valora", "Reseña ingresa", "Respuesta sugerida por IA", "Aprobación humana", "Publicación"],
    states: "solicitada → recibida → respondida → publicada",
    exceptions: ["Review negativa", "Google API caída", "Respuesta sensible"],
    auto: ["Clasificación de sentimiento", "Borrador de respuesta", "Escalado a manager si negativa"],
    data: "review, ai_run, message, customer.tag",
    metric: "Tasa de respuesta < 24h",
    prio: "Importante",
  },
  {
    id: "segment-automate",
    actor: "Marketing",
    goal: "Segmentar y automatizar campañas.",
    steps: ["Definir segmento", "Crear journey", "Aprobar plantillas", "Lanzar", "Medir"],
    states: "borrador → aprobado → activo → pausado | finalizado",
    exceptions: ["Límite de envío", "Plantilla rechazada", "Fatiga de cliente"],
    auto: ["Cálculo de segmento", "Envío programado", "Límites por consentimiento y frecuencia"],
    data: "segment, automation, message, usage_record",
    metric: "CTR campañas > 12%",
    prio: "Importante",
  },
  {
    id: "vip",
    actor: "Host / CRM",
    goal: "Convertir recurrente en VIP y tratarlo distinto.",
    steps: ["Detección de recurrencia", "Propuesta de VIP (IA o regla)", "Aprobación", "Etiqueta + preferencias", "Tratamiento prioritario en reserva"],
    states: "cliente → recurrente → VIP",
    exceptions: ["Cliente rechaza", "Datos sensibles sin consentimiento"],
    auto: ["Regla de recurrencia", "Sugerencia IA", "Aplicación de preferencias en booking"],
    data: "customer.tags, customer_attributes, ai_run",
    metric: "Recurrencia VIP > 40%",
    prio: "Importante",
  },
  {
    id: "subscription",
    actor: "Owner",
    goal: "Suscribir, cambiar plan o cancelar.",
    steps: ["Elegir plan", "Pagar en Stripe", "Entitlements activados", "Uso medido", "Renovación / cambio / cancelación"],
    states: "trial(—) → activa → renovada | cancelada | impagada",
    exceptions: ["Pago fallido", "Límite excedido", "Cancelación con datos"],
    auto: ["Sync con Stripe", "Aplicación de entitlements", "Bloqueo gracioso al impago"],
    data: "subscription, usage_record, entitlement",
    metric: "MRR por local",
    prio: "Imprescindible",
  },
  {
    id: "support",
    actor: "Soporte / Plataforma",
    goal: "Resolver incidencias con traza y, si hace falta, impersonación.",
    steps: ["Ticket", "Diagnóstico en Super Admin", "Impersonación lectura (si procede)", "Acción", "Cierre con auditoría"],
    states: "abierto → en investigación → resuelto → cerrado",
    exceptions: ["Impersonación denegada", "Incidente de seguridad", "Rol no autorizado"],
    auto: ["Banner de impersonación", "Registro actor real/efectivo", "Kill switch global"],
    data: "incident_record, audit_log, impersonation_session",
    metric: "MTTR < 4h",
    prio: "Importante",
  },
];

export function FlujosUX() {
  return (
    <Section
      id="ux"
      index="09"
      eyebrow="Flujos UX críticos"
      title="Journeys que prueban la plataforma de extremo a extremo."
      intro="Cada flujo define actor, objetivo, pasos, estados, excepciones, automatizaciones, datos generados, métrica y requisitos de accesibilidad. No se diseña pantalla sin saber qué flujo sirve y cómo se degrada si falla un canal."
    >
      <div className="space-y-5">
        {FLOWS.map((f, i) => (
          <GlassCard key={f.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs rp-gold-text">{String(i + 1).padStart(2, "0")}</span>
                <H3 className="text-lg">{f.goal}</H3>
              </div>
              <div className="flex items-center gap-2">
                <Pill tone="outline">{f.actor}</Pill>
                <Tag kind={f.prio}>{f.prio}</Tag>
              </div>
            </div>

            <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Pasos</div>
                <ol className="space-y-1">
                  {f.steps.map((s, si) => (
                    <li key={si} className="flex gap-2 text-foreground/85">
                      <span className="font-mono text-[10px] text-muted-foreground mt-0.5">{si + 1}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Estados</div>
                <div className="font-mono text-xs text-foreground/80 leading-relaxed">{f.states}</div>
                <div className="mt-3 text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Excepciones</div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {f.exceptions.map((e, ei) => <li key={ei}>• {e}</li>)}
                </ul>
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Automatizaciones</div>
                <GoldList items={f.auto} />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Datos & métrica</div>
                <div className="font-mono text-xs text-foreground/75 break-words">{f.data}</div>
                <div className="mt-3 rp-glass rounded-md p-2 border-l-2 border-[var(--teal)]/50">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Métrica</div>
                  <div className="text-sm rp-teal-text">{f.metric}</div>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard variant="teal" className="mt-8">
        <H3>Requisitos de accesibilidad por flujo</H3>
        <Lead className="mt-2">WCAG 2.2 AA no es opcional en ningún journey.</Lead>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <GoldList items={[
            "Widget de reserva usable con teclado y lector de pantalla.",
            "Confirmación de acción anunciada por live region.",
            "Errores con mensaje y acción de recuperación.",
          ]} />
          <GoldList items={[
            "Plano de sala navegable por flechas y etiquetas ARIA.",
            "Mesas con estado expuesto por nombre, no solo color.",
            "Atajos de teclado documentados.",
          ]} />
          <GoldList items={[
            "Formularios con labels reales y validación anunciada.",
            "Focus visible y trampa de foco prohibida en modales.",
            "Touch targets ≥ 44px en todo el flujo de cliente.",
          ]} />
        </div>
      </GlassCard>
    </Section>
  );
}

/* ============================================================ */
/* 10 — SEGURIDAD Y CUMPLIMIENTO                                */
/* ============================================================ */
const SECURITY = [
  ["RBAC + ABAC", "Roles por organización/local + atributos (turno, zona, sensibilidad).", "Imprescindible"],
  ["MFA / Passkeys", "WebAuthn como default; TOTP fallback controlado.", "Imprescindible"],
  ["Sesiones y dispositivos", "Tracking, revocación, gestión de sesiones activas.", "Imprescindible"],
  ["Turnstile + Rate limit", "Anti-bot y defensa perimetral.", "Imprescindible"],
  ["WAF", "Reglas managed + custom por superficie.", "Imprescindible"],
  ["CSP nonces + HSTS", "Headers estrictos; scripts con nonce.", "Imprescindible"],
  ["Cookies seguras", "Secure, HttpOnly, SameSite.", "Imprescindible"],
  ["CSRF / XSS / SQLi", "Tokens anti-CSRF, escape, consultas parametrizadas.", "Imprescindible"],
  ["Anti-IDOR", "Ownership por objeto verificado en servidor.", "Imprescindible"],
  ["Anti-SSRF", "Allowlist de destinos en cualquier fetch saliente.", "Imprescindible"],
  ["Validación Zod", "Contratos en frontera de API; nunca confiar en cliente.", "Imprescindible"],
  ["Secretos", "Fuera de código, D1, KV, R2 y frontend.", "Imprescindible"],
  ["PII redactada", "Clasificación y redacción en logs y trazas.", "Imprescindible"],
  ["SAST / Secret scan / DAST", "En CI; bloqueo de merge ante hallazgos críticos.", "Importante"],
  ["Pentest pre-prod", "Auditoría externa antes de producción.", "Importante"],
];

const IMPERSONATION = [
  "Solo perfiles de plataforma autorizados.",
  "Motivo obligatorio y ticket cuando proceda.",
  "Alcance mínimo y expiración corta.",
  "Modo lectura por defecto.",
  "Banner persistente en pantalla.",
  "Actor real y actor efectivo registrados.",
  "Prohibición de acceder a secretos.",
  "Revocación inmediata y kill switch global.",
  "Auditoría completa de la sesión.",
];

const PRIVACY = [
  ["Consentimiento", "Captura y versionado de consent por canal y finalidad."],
  ["Retención", "Política por tipo de dato; borrado programado y bajo demanda."],
  ["Derechos del titular", "Acceso, rectificación, supresión, portabilidad."],
  ["Exportación", "Export cifrada y auditable de datos del cliente."],
  ["Minimización", "Solo PII necesaria; redacción por defecto en derivados."],
  ["Backup cifrado", "Exports a R2 cifrados y versionados; pruebas de restauración."],
];

export function SeguridadCumplimiento() {
  return (
    <Section
      id="seguridad"
      index="10"
      eyebrow="Seguridad y cumplimiento"
      title="Seguridad, privacidad y auditoría desde el primer día."
      intro="El navegador nunca decide tenant, permisos ni autoridad administrativa. Toda operación sensible se resuelve en servidor con contexto de tenant, membresía, permisos, entitlement y ownership. La auditoría y la observabilidad no son complementos: son prerrequisitos."
    >
      <H3 className="mb-4">Controles de seguridad</H3>
      <DataTable
        className="mb-12"
        head={["Control", "Descripción", "Prioridad"]}
        rows={SECURITY.map((r) => [r[0], r[1], <Tag key={r[0]}>{r[2]}</Tag>])}
      />

      <div className="grid lg:grid-cols-2 gap-5 mb-12">
        <GlassCard variant="gold">
          <H3>Impersonación</H3>
          <Lead className="mt-2">Capacidad privilegiada, acotada y trazada.</Lead>
          <GoldList className="mt-3" items={IMPERSONATION} />
        </GlassCard>
        <GlassCard>
          <H3>Privacidad y GDPR</H3>
          <div className="mt-3 divide-y divide-border/40">
            {PRIVACY.map(([k, v]) => (
              <div key={k} className="py-2.5">
                <div className="text-[11px] font-mono uppercase tracking-wider rp-gold-text">{k}</div>
                <div className="text-sm text-foreground/85">{v}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Incident response */}
      <GlassCard className="mb-12">
        <H3>Respuesta a incidentes</H3>
        <div className="mt-4 grid md:grid-cols-5 gap-3">
          {[
            ["Detectar", "Alertas de SLO, anomalías, seguridad."],
            ["Contener", "Kill switches por tenant y global; revocación."],
            ["Erradicar", "Rotación de credenciales, parcheo."],
            ["Recuperar", "Restauración desde backup cifrado."],
            ["Aprender", "Postmortem sin culpa; ADR; runbook actualizado."],
          ].map((s, i) => (
            <div key={s[0]} className="rp-glass rounded-lg p-4 relative">
              <div className="font-mono text-xs rp-gold-text">{String(i + 1).padStart(2, "0")}</div>
              <div className="mt-1 font-medium">{s[0]}</div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{s[1]}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* SLO */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          ["RPO", "≤ 15 min", "Punto objetivo de recuperación de datos."],
          ["RTO", "≤ 2 h", "Tiempo objetivo de restauración del servicio."],
          ["SLO núcleo", "99.9%", "Reservas y operación de sala por local."],
        ].map(([k, v, d]) => (
          <GlassCard key={k} variant="teal">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{k}</div>
            <div className="mt-2 font-display text-3xl font-light rp-teal-text">{v}</div>
            <p className="mt-2 text-xs text-muted-foreground">{d}</p>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}
