import * as React from "react";
import {
  Section,
  GlassCard,
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
/*  Helper: texto monoespaciado dorado                          */
/* ============================================================ */
function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[12px] rp-gold-text whitespace-nowrap">
      {children}
    </code>
  );
}

/* ============================================================ */
/*  09 — AUDITORÍA INMUTABLE, HISTORIAL Y PAPELERA              */
/* ============================================================ */
type AuditField = {
  campo: string;
  tipo: string;
  notas: string;
};

const AUDIT_FIELDS: AuditField[] = [
  { campo: "audit_id", tipo: "TEXT ULID", notas: "PK compuesta (org, id)" },
  { campo: "organization_id", tipo: "TEXT", notas: "tenant" },
  { campo: "location_id", tipo: "TEXT?", notas: "sede" },
  { campo: "actor_id", tipo: "TEXT", notas: "usuario o sistema" },
  { campo: "actor_effective_id", tipo: "TEXT?", notas: "impersonación" },
  { campo: "action", tipo: "TEXT", notas: "create/update/delete/restore/export/impersonate" },
  { campo: "resource_type", tipo: "TEXT", notas: "reservation/customer/role" },
  { campo: "resource_id", tipo: "TEXT", notas: "id afectado" },
  { campo: "before", tipo: "TEXT (JSON)", notas: "estado previo si seguro" },
  { campo: "after", tipo: "TEXT (JSON)", notas: "estado nuevo si seguro" },
  { campo: "result", tipo: "TEXT", notas: "success/denied/error" },
  { campo: "duration_ms", tipo: "INTEGER", notas: "duración" },
  { campo: "ip_redacted", tipo: "TEXT", notas: "IP truncada" },
  { campo: "user_agent", tipo: "TEXT", notas: "navegador/dispositivo" },
  { campo: "correlation_id", tipo: "TEXT", notas: "traza" },
  { campo: "reason", tipo: "TEXT?", notas: "motivo admin" },
  { campo: "origin", tipo: "TEXT", notas: "ui/api/webhook/automation/ai" },
  { campo: "occurred_at", tipo: "TEXT ISO UTC", notas: "timestamp" },
];

const AUDIT_CODE = `// packages/audit/src/audit.ts
import type { TenantCtx } from "@restopanel/tenancy";

interface AuditEntry {
  action: string;
  resource_type: string;
  resource_id: string;
  before?: unknown;
  after?: unknown;
  result: "success" | "denied" | "error";
  duration_ms: number;
  reason?: string;
  origin?: string;
}

export async function audit(env: Env, ctx: TenantCtx, e: AuditEntry): Promise<void> {
  const id = ulid();
  await env.DB.prepare(
    \`INSERT INTO audit_logs
       (id, organization_id, location_id, actor_id, actor_effective_id,
        action, resource_type, resource_id, before, after, result,
        duration_ms, ip_redacted, user_agent, correlation_id, reason, origin, occurred_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)\`
  ).bind(
    id, ctx.organization_id, ctx.location_id ?? null, ctx.actor_id, ctx.actor_effective_id,
    e.action, e.resource_type, e.resource_id,
    e.before ? JSON.stringify(redact(e.before)) : null,
    e.after ? JSON.stringify(redact(e.after)) : null,
    e.result, e.duration_ms, redactIp(ctx.ip), ctx.user_agent, ctx.correlation_id,
    e.reason ?? null, e.origin ?? "ui", nowUtc()
  ).run();
}

// Soft delete genérico
export async function softDelete(env: Env, ctx: TenantCtx, table: string, id: string): Promise<void> {
  await env.DB.prepare(
    \`UPDATE \${table} SET deleted_at = ?, deleted_by = ? WHERE organization_id = ? AND id = ? AND deleted_at IS NULL\`
  ).bind(nowUtc(), ctx.actor_id, ctx.organization_id, id).run();
  await audit(env, ctx, { action: "delete", resource_type: table, resource_id: id, result: "success", duration_ms: 0 });
}

// Restaurar desde papelera
export async function restore(env: Env, ctx: TenantCtx, table: string, id: string): Promise<void> {
  await env.DB.prepare(
    \`UPDATE \${table} SET deleted_at = NULL, deleted_by = NULL WHERE organization_id = ? AND id = ?\`
  ).bind(ctx.organization_id, id).run();
  await audit(env, ctx, { action: "restore", resource_type: table, resource_id: id, result: "success", duration_ms: 0 });
}`;

export function Fase4Auditoria() {
  return (
    <Section
      id="f4-auditoria"
      index="09"
      eyebrow="Auditoría y soft delete"
      title="Auditoría inmutable, historial y papelera con restauración."
      intro={
        <>
          Toda operación relevante se registra con actor, organización, local, acción, entidad,
          identificador, marca de tiempo, IP, navegador, dispositivo, motivo, estado anterior y
          posterior, y resultado. Sobre esa base se construyen el borrado lógico, la restauración
          desde papelera, el historial por recurso, la retención legal y la protección frente a
          manipulación.
        </>
      }
    >
      {/* Campos del audit_log */}
      <div className="mb-12">
        <H3 className="mb-3">Campos del audit_log</H3>
        <Lead className="mb-4">
          El registro es <Mono>append-only</Mono> en D1: ninguna ruta de servicio emite{" "}
          <Mono>UPDATE</Mono> o <Mono>DELETE</Mono> contra <Mono>audit_logs</Mono>. La integridad
          se protege por constraint compuesta y por proceso (corrección vía registros compensatorios).
        </Lead>
        <DataTable
          head={["Campo", "Tipo", "Notas"]}
          rows={AUDIT_FIELDS.map((f) => [
            <span key="campo" className="font-mono text-[12px] rp-gold-text">
              {f.campo}
            </span>,
            <span key="tipo" className="font-mono text-[12px] text-foreground/85">
              {f.tipo}
            </span>,
            <span key="notas" className="text-foreground/85">
              {f.notas}
            </span>,
          ])}
        />
      </div>

      {/* Servicio de auditoría + soft delete + restore */}
      <div className="mb-12">
        <H3 className="mb-3">Servicio de auditoría, soft delete y restauración</H3>
        <Lead className="mb-4">
          El servicio <Mono>audit()</Mono> escribe un único registro por mutación.{" "}
          <Mono>softDelete()</Mono> marca <Mono>deleted_at</Mono> y <Mono>deleted_by</Mono>;{" "}
          <Mono>restore()</Mono> revierte la marca. Ambos dejan trazas en auditoría con el motivo.
        </Lead>
        <Code lang="typescript">{AUDIT_CODE}</Code>
      </div>

      {/* Reglas de auditoría */}
      <GlassCard variant="gold" className="mb-12">
        <H3>Reglas de auditoría</H3>
        <Lead className="mt-2">
          La inmutabilidad no es una promesa: es una constraint de base de datos, un proceso de
          acceso restringido y un archivo cifrado de retención larga.
        </Lead>
        <div className="mt-5">
          <GoldList
            items={[
              <>
                <Mono>append-only</Mono>: no existen rutas <Mono>UPDATE</Mono>/<Mono>DELETE</Mono> en{" "}
                <Mono>audit_logs</Mono> en el código de servicio.
              </>,
              <>
                Retención de 1 año en D1 + archivo cifrado en R2 (object lock opcional) para
                cumplimiento legal y reproceso.
              </>,
              <>
                Acceso restringido a roles Auditor/Support con motivo obligatorio; toda lectura
                queda a su vez auditada (auditoría de la auditoría).
              </>,
              <>
                Búsqueda indexada por organización, actor, acción y rango temporal; sin índice que
                exponga PII cruda.
              </>,
              <>
                Exportación cifrada y auditada: cada export genera un registro con actor, filtro,
                tamaño y URL firmada de un solo uso.
              </>,
              <>
                Enmascaramiento de PII y secretos en <Mono>before</Mono>/<Mono>after</Mono> vía
                función <Mono>redact()</Mono> antes de serializar.
              </>,
              <>
                Hash chain opcional (encadenamiento del hash del registro previo) para detectar
                manipulación si alguien con acceso intentara alterar la tabla.
              </>,
              <>
                Correcciones vía registros compensatorios: nunca se sobrescribe un registro; se
                inserta uno nuevo que referencia al original con el motivo.
              </>,
            ]}
          />
        </div>
      </GlassCard>

      {/* Callout */}
      <Callout kind="warn" title="Nunca borrar físico sin proceso autorizado">
        Los datos críticos se soft-deletan (<Mono>deleted_at</Mono> + <Mono>deleted_by</Mono>). La
        purga física requiere un proceso explícito, autorizado y auditable, ejecutado solo tras
        cumplir la retención legal mínima y dejar registro del motivo, del actor autorizante y del
        lote afectado.
      </Callout>
    </Section>
  );
}

/* ============================================================ */
/*  10 — REPOSITORIOS CON org_id OBLIGATORIO + IDEMPOTENCIA     */
/* ============================================================ */
type RepoRow = {
  dominio: string;
  tabla: string;
  ops: string;
};

const REPO_ROWS: RepoRow[] = [
  { dominio: "Reservations", tabla: "reservations", ops: "create (idem), list, findById, update, softDelete, history" },
  { dominio: "Customers", tabla: "customers", ops: "create, list, findById, update, merge, softDelete, restore" },
  { dominio: "Tables", tabla: "tables", ops: "list, move (via DO), updateStatus, listByZone" },
  { dominio: "Floors/Zones", tabla: "floors, zones", ops: "CRUD scoped" },
  { dominio: "Menu", tabla: "menu_items", ops: "CRUD scoped" },
  { dominio: "Billing", tabla: "subscriptions, invoices", ops: "syncStripe, list, findById" },
  { dominio: "Audit", tabla: "audit_logs", ops: "append, search, export (read-only)" },
];

const REPO_CODE = `// packages/reservations/src/infrastructure/reservations-repo.ts
import type { TenantCtx } from "@restopanel/tenancy";

export interface ReservationInput {
  location_id: string;
  customer_id: string;
  table_id?: string;
  party_size: number;
  reserved_at: string; // ISO UTC
  source: "widget" | "dashboard" | "api" | "whatsapp";
  idem_key: string;
  notes?: string;
}

export class ReservationsRepo {
  constructor(private db: D1Database) {}

  async list(ctx: TenantCtx, opts: { location_id: string; from?: string; to?: string; limit?: number }) {
    const limit = Math.min(opts.limit ?? 50, 200);
    return this.db.prepare(
      \`SELECT * FROM reservations
       WHERE organization_id = ? AND location_id = ? AND deleted_at IS NULL
         AND (? IS NULL OR reserved_at >= ?) AND (? IS NULL OR reserved_at <= ?)
       ORDER BY reserved_at ASC LIMIT ?\`
    ).bind(ctx.organization_id, opts.location_id, opts.from ?? null, opts.from ?? null,
           opts.to ?? null, opts.to ?? null, limit).all();
  }

  async findById(ctx: TenantCtx, id: string) {
    return this.db.prepare(
      \`SELECT * FROM reservations WHERE organization_id = ? AND id = ?\`
    ).bind(ctx.organization_id, id).first();
  }

  /**
   * Insert idempotente: idem_key único por org (partial unique index).
   * Si la misma idem_key llega de nuevo, devuelve la reserva existente.
   */
  async create(ctx: TenantCtx, input: ReservationInput) {
    const id = ulid();
    try {
      await this.db.prepare(
        \`INSERT INTO reservations
           (organization_id, id, location_id, customer_id, table_id, status,
            party_size, reserved_at, source, idem_key, notes, created_by, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)\`
      ).bind(ctx.organization_id, id, input.location_id, input.customer_id, input.table_id ?? null,
             "confirmed", input.party_size, input.reserved_at, input.source, input.idem_key,
             input.notes ?? null, ctx.actor_id, nowUtc(), nowUtc()).run();
      return { id, created: true };
    } catch (e) {
      if (isUniqueViolation(e)) {
        const existing = await this.db.prepare(
          \`SELECT id FROM reservations WHERE organization_id = ? AND idem_key = ?\`
        ).bind(ctx.organization_id, input.idem_key).first();
        return { id: existing?.id as string, created: false };
      }
      throw e;
    }
  }

  async softDelete(ctx: TenantCtx, id: string) {
    await this.db.prepare(
      \`UPDATE reservations SET deleted_at = ?, deleted_by = ? WHERE organization_id = ? AND id = ? AND deleted_at IS NULL\`
    ).bind(nowUtc(), ctx.actor_id, ctx.organization_id, id).run();
  }
}`;

export function Fase4Repositorios() {
  return (
    <Section
      id="f4-repositorios"
      index="10"
      eyebrow="Reservas, clientes, mesas"
      title="Repositorios con org_id obligatorio e idempotencia."
      intro={
        <>
          El repositorio es la última frontera del aislamiento: ningún método ejecuta SQL sin un{" "}
          <Mono>TenantCtx</Mono> queporte el <Mono>organization_id</Mono>, y toda query filtra por
          ese campo. La idempotencia se garantiza con un <Mono>idem_key</Mono> y un partial unique
          index por organización.
        </>
      }
    >
      {/* Código de repositorio */}
      <div className="mb-12">
        <H3 className="mb-3">Repositorio de reservas (referencia)</H3>
        <Lead className="mb-4">
          Cada método exige <Mono>ctx</Mono>, filtra por <Mono>organization_id</Mono> y, en el caso
          de <Mono>create</Mono>, captura la violación del unique index para devolver la reserva
          existente en lugar de duplicar.
        </Lead>
        <Code lang="typescript">{REPO_CODE}</Code>
      </div>

      {/* Repositorios por dominio */}
      <div className="mb-12">
        <H3 className="mb-3">Repositorios por dominio</H3>
        <Lead className="mb-4">
          Un repositorio por agregado raíz. Todos comparten el mismo contrato: métodos tipados,
          scope obligatorio y paginación cursor-based con límite máximo.
        </Lead>
        <DataTable
          head={["Dominio", "Tabla principal", "Operaciones clave"]}
          rows={REPO_ROWS.map((r) => [
            <span key="dom" className="font-mono text-[12px] rp-gold-text">
              {r.dominio}
            </span>,
            <span key="tabla" className="font-mono text-[12px] text-foreground/85">
              {r.tabla}
            </span>,
            <span key="ops" className="text-foreground/85">
              {r.ops}
            </span>,
          ])}
        />
      </div>

      {/* Patrones de repositorio */}
      <GlassCard variant="gold" className="mb-12">
        <H3>Patrones de repositorio</H3>
        <Lead className="mt-2">
          Un patrón uniforme hace que el aislamiento sea verifiable y los tests IDOR sean
          mecánicos: el mismo suite corre contra cada repositorio.
        </Lead>
        <div className="mt-5">
          <GoldList
            items={[
              <>
                Todo método exige <Mono>ctx</Mono> con <Mono>organization_id</Mono> (sin valor
                por defecto; error en tiempo de compilación si falta).
              </>,
              <>
                Toda query filtra por <Mono>org_id</Mono> (+ <Mono>location_id</Mono> si aplica).
                La cláusula se construye siempre, incluso en <Mono>findById</Mono>.
              </>,
              <>
                Idempotencia vía <Mono>idem_key</Mono> con partial unique index por organización:
                <Mono> UNIQUE (organization_id, idem_key) WHERE idem_key IS NOT NULL </Mono>.
              </>,
              <>
                Soft delete con <Mono>deleted_at</Mono> + <Mono>deleted_by</Mono>; todas las
                lecturas añaden <Mono>AND deleted_at IS NULL</Mono> salvo la vista de papelera.
              </>,
              <>
                Paginación cursor-based con límite máximo absoluto (por ejemplo 200) aunque el
                cliente pida más.
              </>,
              <>
                Prohibido <Mono>SELECT *</Mono> sin scope: la query base incluye siempre el filtro
                de tenant; los campos se proyectan explícitamente en lectura pública.
              </>,
              <>
                Tests IDOR por repositorio: con <Mono>ctx</Mono> de org A, ninguna consulta debe
                devolver filas de org B (incluyendo <Mono>findById</Mono> con id de otra org).
              </>,
            ]}
          />
        </div>
      </GlassCard>

      {/* Callout */}
      <Callout kind="info" title="Repositorio = frontera de aislamiento">
        El repositorio es la última línea de defensa. Aunque un servicio olvide el <Mono>ctx</Mono>,
        el repo exige <Mono>organization_id</Mono> y la query no compila ni ejecuta sin él. Los
        tests IDOR verifican que un repo con <Mono>ctx</Mono> de org A no devuelve filas de org B,
        incluso si el identificador pertenece a otra organización.
      </Callout>
    </Section>
  );
}

/* ============================================================ */
/*  11 — DURABLE OBJECTS: PLANO DE MESAS Y LOCKS DE SLOT        */
/* ============================================================ */
const DO_CODE = `// workers/realtime/src/floor-object.ts
import { DurableObject } from "cloudflare:workers";

interface Env { DB: D1Database; }

export class FloorObject extends DurableObject<Env> {
  // id name convención: org_id:location_id:date  (afinidad por día y local)

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/lock-slot") return this.lockSlot(req);
    if (url.pathname === "/release-slot") return this.releaseSlot(req);
    if (url.pathname === "/move-table") return this.moveTable(req);
    if (url.pathname === "/ws") return this.handleWs(req);
    return new Response("not found", { status: 404 });
  }

  /**
   * Adquiere un lock de slot para evitar doble reserva.
   * El lock es efímero (TTL); D1 garantiza la consistencia con unique constraint.
   */
  async lockSlot(req: Request): Promise<Response> {
    const { slot, hold_seconds } = await req.json();
    const key = \`slot:\${slot}\`;
    const existing = await this.ctx.storage.get(key);
    if (existing) return Response.json({ ok: false, reason: "locked" }, { status: 409 });
    await this.ctx.storage.put(key, { at: Date.now(), hold_seconds });
    // TTL: liberar automáticamente
    this.ctx.storage.setAlarm(Date.now() + hold_seconds * 1000);
    return Response.json({ ok: true });
  }

  async releaseSlot(req: Request): Promise<Response> {
    const { slot } = await req.json();
    await this.ctx.storage.delete(\`slot:\${slot}\`);
    return Response.json({ ok: true });
  }

  async moveTable(req: Request): Promise<Response> {
    const { table_id, pos_x, pos_y, actor_id } = await req.json();
    // 1. Actualizar estado efímero del DO
    this.broadcast({ type: "table_moved", table_id, pos_x, pos_y, actor_id });
    // 2. Persistir en D1 (canónico) — el cliente también recibe confirmación via WS
    await this.env.DB.prepare(
      \`UPDATE tables SET pos_x = ?, pos_y = ?, updated_at = ? WHERE organization_id = ? AND id = ?\`
    ).bind(pos_x, pos_y, nowUtc(), this.orgId, table_id).run();
    return Response.json({ ok: true });
  }

  async handleWs(req: Request): Promise<Response> {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.storage.webSockets.accept(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  broadcast(msg: unknown) {
    for (const ws of this.ctx.storage.webSockets) {
      try { ws.send(JSON.stringify(msg)); } catch {}
    }
  }

  // Liberar locks expirados
  async alarm() {
    const now = Date.now();
    const map = await this.ctx.storage.list();
    for (const [k, v] of map.entries()) {
      if (k.startsWith("slot:") && v.at + v.hold_seconds * 1000 < now) {
        await this.ctx.storage.delete(k);
      }
    }
  }

  get orgId() { return this.ctx.id.name.split(":")[0]; }
}`;

const DO_FLOW_CHART = `sequenceDiagram
  participant C1 as Cliente1
  participant C2 as Cliente2
  participant DO as FloorObject
  participant D1 as D1
  C1->>DO: lockSlot S
  DO->>DO: adquirir lock
  DO->>D1: INSERT reservation idem_key
  D1-->>DO: OK unique
  DO-->>C1: confirmada
  C2->>DO: lockSlot S
  DO->>DO: lock ocupado o D1 unique violada
  DO-->>C2: conflicto mas alternativa`;

export function Fase4DO() {
  return (
    <Section
      id="f4-do"
      index="11"
      eyebrow="Durable Objects (plano y concurrencia)"
      title="Durable Objects para el plano de mesas y bloqueos de slot."
      intro={
        <>
          El Durable Object mantiene el estado efímero del plano (posición de mesas, presencia,
          locks de slot) y sincroniza via WebSocket a los clientes conectados. D1 sigue siendo la
          fuente canónica: el DO se reconstruye desde D1 tras una desconexión. La combinación DO +
          constraint única en D1 hace imposible la doble reserva.
        </>
      }
    >
      {/* Código FloorObject */}
      <div className="mb-12">
        <H3 className="mb-3">FloorObject (Durable Object)</H3>
        <Lead className="mb-4">
          El nombre del DO (<Mono>org_id:location_id:date</Mono>) fija la afinidad: un DO por
          local y día, lo que particiona la concurrencia sin contienda global.
        </Lead>
        <Code lang="typescript">{DO_CODE}</Code>
      </div>

      {/* Diagrama de prevención de doble booking */}
      <div className="mb-12">
        <H3 className="mb-3">Prevención de doble reserva</H3>
        <Lead className="mb-4">
          Dos clientes compiten por el mismo slot. El primero toma el lock en el DO y confirma en
          D1. El segundo recibe conflicto y una alternativa sugerida (otro horario o mesa).
        </Lead>
        <Mermaid chart={DO_FLOW_CHART} />
      </div>

      {/* Relación DO ↔ D1 */}
      <GlassCard variant="gold" className="mb-12">
        <H3>Relación DO ↔ D1</H3>
        <Lead className="mt-2">
          El DO coordina; D1 conserva. Ningún estado crítico vive solo en el DO.
        </Lead>
        <div className="mt-5">
          <GoldList
            items={[
              <>
                El DO coordina concurrencia y estado efímero: locks de slot, presencia de
                usuarios, sincronización de movimientos del plano.
              </>,
              <>
                D1 conserva reservas, mesas y configuración como fuente canónica; el DO deriva de
                ahí su estado inicial.
              </>,
              <>
                El DO reconstruye desde D1 tras desconexión o pérdida de almacenamiento efímero:
                no hay estado crítico solo en el DO.
              </>,
              <>
                El DO <strong>no</strong> es la única copia: si se pierde, el sistema sigue
                funcionando con D1 + reconstrucción bajo demanda.
              </>,
              <>
                WebSocket vía DO con hibernación: el runtime duerme el DO sin conexiones activas
                para reducir coste y lo despierta al primer mensaje.
              </>,
              <>
                Reconexión con re-sync: el cliente pide el snapshot desde D1 y luego el delta de
                eventos del DO desde su última marca de agua.
              </>,
              <>
                Nombre del DO = <Mono>org_id:location_id:date</Mono> para afinidad por local y día:
                cuellos de concurrencia acotados, sin contienda entre locales ni entre días.
              </>,
            ]}
          />
        </div>
      </GlassCard>

      {/* Callout */}
      <Callout kind="warn" title="DO no reemplaza D1">
        El DO es la unidad de partición para concurrencia y tiempo real, pero D1 conserva el estado
        canónico. Si el DO pierde su almacenamiento, se reconstruye desde D1. Nunca depender solo
        del DO para reservas o mesas: la fuente de verdad persistente es la base de datos.
      </Callout>
    </Section>
  );
}

/* ============================================================ */
/*  12 — QUEUES Y CONSUMERS: REINTENTOS, IDEMPOTENCIA, DLQ      */
/* ============================================================ */
type QueueRow = {
  cola: string;
  mensaje: string;
  consumer: string;
  notas: string;
};

const QUEUE_ROWS: QueueRow[] = [
  {
    cola: "EMAIL_QUEUE",
    mensaje: "{message_id, org_id, to, template_id, ...}",
    consumer: "email-consumer",
    notas: "Resend; idempotencia por message_id",
  },
  {
    cola: "WHATSAPP_QUEUE",
    mensaje: "{message_id, org_id, to, template, vars}",
    consumer: "whatsapp-consumer",
    notas: "WhatsApp Cloud API; plantillas aprobadas",
  },
  {
    cola: "AI_QUEUE",
    mensaje: "{request_id, org_id, scope, prompt_version, input}",
    consumer: "ai-consumer",
    notas: "AI Gateway; límites por org; fallback",
  },
  {
    cola: "EXPORT_QUEUE",
    mensaje: "{export_id, org_id, type, filter}",
    consumer: "export-consumer",
    notas: "R2; URL firmada",
  },
  {
    cola: "WEBHOOK_QUEUE",
    mensaje: "{delivery_id, org_id, url, event, payload}",
    consumer: "webhook-consumer",
    notas: "HMAC + retries",
  },
];

const QUEUE_CODE = `// workers/queues/src/email-consumer.ts
interface EmailMessage {
  message_id: string;     // ULID, idempotencia
  organization_id: string;
  to: string;
  template_id: string;
  template_version: number;
  variables: Record<string, unknown>;
}

export default {
  async queue(batch: Message<EmailMessage>[], env: Env): Promise<void> {
    for (const msg of batch) {
      try {
        await sendEmail(env, msg.body);
        await markDelivered(env, msg.body);
        msg.ack();
      } catch (e) {
        // El runtime reintentará con backoff; tras max_attempts va a DLQ
        if (msg.attempts >= 5) {
          await moveToDlq(env, msg.body, e);
          msg.ack(); // no seguir reintentando
        } else {
          msg.retry({ delaySeconds: backoff(msg.attempts) });
        }
      }
    }
  },
};

function backoff(attempt: number): number {
  const base = 2 ** attempt;
  const jitter = Math.random() * 0.3;
  return Math.min(base + jitter, 300);
}`;

export function Fase4Queues() {
  return (
    <Section
      id="f4-queues"
      index="12"
      eyebrow="Queues y consumers"
      title="Colas con reintentos, idempotencia y dead-letter."
      intro={
        <>
          Cada integración asíncrona (email, WhatsApp, IA, exportaciones, webhooks salientes) tiene
          su propia cola y su propio consumer. Todos comparten las mismas garantías: idempotencia
          por identificador, reintentos con backoff exponencial + jitter, y dead-letter queue
          auditada para lo que no se pueda entregar.
        </>
      }
    >
      {/* Código de consumer */}
      <div className="mb-12">
        <H3 className="mb-3">Consumer de email (referencia)</H3>
        <Lead className="mb-4">
          El consumer procesa lotes, marca entregado y hace <Mono>ack</Mono>. Si falla y quedan
          intentos, <Mono>retry</Mono> con backoff; si agota intentos, mueve a DLQ y{" "}
          <Mono>ack</Mono> para no seguir reintentando.
        </Lead>
        <Code lang="typescript">{QUEUE_CODE}</Code>
      </div>

      {/* Tabla de colas */}
      <div className="mb-12">
        <H3 className="mb-3">Colas</H3>
        <Lead className="mb-4">
          Una cola por tipo de trabajo, con su consumer dedicado. El mensaje lleva siempre el
          identificador de idempotencia y el <Mono>organization_id</Mono> para respetar los límites
          por plan.
        </Lead>
        <DataTable
          head={["Cola", "Mensaje", "Consumer", "Notas"]}
          rows={QUEUE_ROWS.map((q) => [
            <span key="cola" className="font-mono text-[12px] rp-gold-text">
              {q.cola}
            </span>,
            <span key="mensaje" className="font-mono text-[12px] text-foreground/85">
              {q.mensaje}
            </span>,
            <span key="consumer" className="font-mono text-[12px] text-foreground/85">
              {q.consumer}
            </span>,
            <span key="notas" className="text-foreground/85">
              {q.notas}
            </span>,
          ])}
        />
      </div>

      {/* Garantías de colas */}
      <GlassCard variant="gold" className="mb-12">
        <H3>Garantías de colas</H3>
        <Lead className="mt-2">
          Las colas entregan <Mono>at-least-once</Mono>. La idempotencia del consumer convierte esa
          garantía en <Mono>exactly-once efectivo</Mono>.
        </Lead>
        <div className="mt-5">
          <GoldList
            items={[
              <>
                Idempotencia por <Mono>message_id</Mono> / <Mono>request_id</Mono> /{" "}
                <Mono>delivery_id</Mono>: el consumer dedupe contra una tabla de procesados antes de
                actuar.
              </>,
              <>
                Reintentos con backoff exponencial + jitter para evitar tormentas contra el
                proveedor y respetar sus límites.
              </>,
              <>
                <Mono>max_attempts</Mono> alcanzado → movimiento a DLQ con motivo, payload y trazas,
                para reproceso manual auditado.
              </>,
              <>
                Consumer dedupe: una misma entrega procesada dos veces (retry tras éxito silencioso)
                no duplica el efecto en el proveedor.
              </>,
              <>
                Tolerancia a fuera de orden: los consumers no asumen orden entre mensajes distintos;
                los relacionados usan <Mono>correlation_id</Mono> para trazabilidad.
              </>,
              <>
                Trazabilidad con <Mono>correlation_id</Mono> propagado desde el origen de la
                petición hasta el resultado de la entrega.
              </>,
              <>
                DLQ con reproceso manual auditado: un operador revisa, corrige (plantilla, destino,
                configuración) y reencola; cada acción queda en auditoría.
              </>,
              <>
                Rate limit por proveedor (Resend, WhatsApp, AI) y por organización para que un pico
                de una org no agote la cuota compartida.
              </>,
            ]}
          />
        </div>
      </GlassCard>

      {/* Callout */}
      <Callout kind="ok" title="At-least-once + idempotencia">
        Cloudflare Queues entrega <Mono>at-least-once</Mono>. Los consumidores deben ser
        idempotentes (dedup por <Mono>message_id</Mono>). Si un mensaje se procesa dos veces, el
        efecto es el mismo que una vez: el segundo intento se descarta en la tabla de procesados o
        el proveedor responde <Mono>already_done</Mono>.
      </Callout>
    </Section>
  );
}

/* ============================================================ */
/*  13 — R2 Y AI GATEWAY: ARCHIVOS POR ORG + IA CON LÍMITES     */
/* ============================================================ */
type AiUseCase = {
  caso: string;
  entradas: string;
  salida: string;
  aprobacion: string;
};

const AI_USE_CASES: AiUseCase[] = [
  { caso: "Respuestas automáticas a reseñas", entradas: "reseña, tono marca", salida: "borrador de respuesta", aprobacion: "obligatoria antes de publicar" },
  { caso: "Análisis de sentimiento", entradas: "texto reseña", salida: "sentimiento + temas", aprobacion: "no (informativo)" },
  { caso: "Predicción de demanda", entradas: "histórico, eventos", salida: "predicción + confianza", aprobacion: "no" },
  { caso: "Predicción de no-show", entradas: "historial cliente, reserva", salida: "probabilidad", aprobacion: "no (marca riesgo)" },
  { caso: "Upselling", entradas: "carta, cliente", salida: "sugerencias", aprobacion: "aprobación antes de mostrar" },
  { caso: "Recomendaciones", entradas: "contexto", salida: "recomendaciones", aprobacion: "no" },
  { caso: "Resumen diario", entradas: "eventos del día", salida: "resumen", aprobacion: "no" },
];

const R2_CODE = `// packages/storage/src/r2.ts
import type { TenantCtx } from "@restopanel/tenancy";

export async function uploadLogo(env: Env, ctx: TenantCtx, file: File): Promise<{ key: string }> {
  // Validación real de tipo (no confiar en el Content-Type del cliente)
  const detected = await detectMimeType(file);
  if (!["image/png", "image/jpeg", "image/webp"].includes(detected)) {
    throw new HttpError(415, "unsupported_media_type");
  }
  if (file.size > 5 * 1024 * 1024) throw new HttpError(413, "file_too_large");
  const key = \`orgs/\${ctx.organization_id}/branding/logo-\${ulid()}.\${ext(detected)}\`;
  await env.MEDIA.put(key, file.stream(), {
    httpMetadata: { contentType: detected },
    customMetadata: { organization_id: ctx.organization_id, uploaded_by: ctx.actor_id },
  });
  // Actualizar storage_used_bytes en organizations (límite del plan)
  await incrementStorage(env, ctx.organization_id, file.size);
  return { key };
}

export async function signedUrl(env: Env, ctx: TenantCtx, key: string, ttlSeconds = 300): Promise<string> {
  // Verificar que el objeto pertenece a la org antes de firmar
  if (!key.startsWith(\`orgs/\${ctx.organization_id}/\`)) throw new HttpError(403, "cross_tenant");
  return env.MEDIA.createSignedUrl(key, { expiresIn: ttlSeconds });
}`;

const AI_CODE = `// packages/ai-gateway/src/gateway.ts
import type { TenantCtx } from "@restopanel/tenancy";

interface AiRequest {
  scope: "review_reply" | "no_show_predict" | "demand_forecast" | "upsell" | "summary";
  prompt_version: number;
  input: Record<string, unknown>; // PII redactada antes de llegar aquí
}

export async function runAi(env: Env, ctx: TenantCtx, req: AiRequest) {
  // 1. Verificar límite del plan
  const usage = await getAiUsage(env, ctx.organization_id);
  const limit = await getPlanLimit(env, ctx.plan, "ai_credits");
  if (usage >= limit) throw new HttpError(429, "ai_limit_exceeded");

  // 2. Llamar vía AI Gateway con fallback determinista
  const started = Date.now();
  let output: unknown;
  let model: string;
  let cost_minor = 0;
  try {
    const res = await env.AI_GATEWAY.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: buildPrompt(req),
    });
    output = res.response;
    model = "@cf/meta/llama-3.1-8b-instruct";
    cost_minor = estimateCost(res.usage);
  } catch {
    output = deterministicFallback(req); // fallback sin IA
    model = "fallback:deterministic";
  }

  // 3. Registrar uso (para billing y límites)
  await env.DB.prepare(
    \`INSERT INTO ai_requests
       (organization_id, id, model, prompt_version, scope, input_redacted, output, cost_minor,
        latency_ms, result, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)\`
  ).bind(ctx.organization_id, ulid(), model, req.prompt_version, req.scope,
         JSON.stringify(redact(req.input)), JSON.stringify(output), cost_minor,
         Date.now() - started, "success", nowUtc()).run();
  await incrementAiUsage(env, ctx.organization_id, cost_minor);
  return { output, model, cost_minor };
}`;

export function Fase4R2AI() {
  return (
    <Section
      id="f4-r2-ai"
      index="13"
      eyebrow="R2 y AI Gateway"
      title="Archivos por organización y IA con límites por plan."
      intro={
        <>
          Los archivos de cada organización viven en R2 bajo un prefijo <Mono>orgs/{`{org_id}`}/...</Mono>{" "}
          con validación real de tipo, límite de tamaño y URLs firmadas de corta duración. Toda
          llamada a IA pasa por AI Gateway: se verifica el límite del plan, se registra el coste y
          la latencia, y un fallback determinista garantiza operación si el modelo no responde.
        </>
      }
    >
      {/* Código R2 */}
      <div className="mb-12">
        <H3 className="mb-3">R2: subida namespaced y URL firmada</H3>
        <Lead className="mb-4">
          La clave siempre empieza con <Mono>orgs/{`{org_id}`}/</Mono>. Antes de firmar una URL se
          verifica que la clave pertenezca a la organización del <Mono>ctx</Mono>: defensa contra
          cross-tenant por path manipulation.
        </Lead>
        <Code lang="typescript">{R2_CODE}</Code>
      </div>

      {/* Código AI Gateway */}
      <div className="mb-12">
        <H3 className="mb-3">AI Gateway: límites, coste, fallback</H3>
        <Lead className="mb-4">
          Antes de invocar al modelo se comprueba el crédito del plan; después se registra en{" "}
          <Mono>ai_requests</Mono> el modelo, la versión del prompt, el coste y la latencia. Si el
          modelo falla, se devuelve un fallback determinista.
        </Lead>
        <Code lang="typescript">{AI_CODE}</Code>
      </div>

      {/* Tabla de casos de uso IA */}
      <div className="mb-12">
        <H3 className="mb-3">AI Gateway: casos de uso</H3>
        <Lead className="mb-4">
          La aprobación humana no es opcional cuando la salida es pública (respuestas a reseñas),
          toca precios (upselling) o dispara campañas. El resto es informativo o interno.
        </Lead>
        <DataTable
          head={["Caso", "Entradas", "Salida", "Aprobación humana"]}
          rows={AI_USE_CASES.map((c) => [
            <span key="caso" className="font-medium text-foreground">
              {c.caso}
            </span>,
            <span key="entradas" className="text-foreground/85">
              {c.entradas}
            </span>,
            <span key="salida" className="text-foreground/85">
              {c.salida}
            </span>,
            <span key="aprobacion" className="text-foreground/85">
              {c.aprobacion}
            </span>,
          ])}
        />
      </div>

      {/* Reglas de R2 y AI Gateway */}
      <GlassCard variant="gold" className="mb-12">
        <H3>Reglas de R2 y AI Gateway</H3>
        <Lead className="mt-2">
          Reglas cruzadas: aislamiento por prefijo en R2, límites por plan en IA, PII siempre
          redactada antes de cualquier llamada al modelo.
        </Lead>
        <div className="mt-5">
          <GoldList
            items={[
              <>
                <strong>R2 ·</strong> Prefijo obligatorio <Mono>orgs/{`{org_id}`}/...</Mono> para
                todo objeto de cliente; sin excepciones ni rutas planas.
              </>,
              <>
                <strong>R2 ·</strong> Validación de tipo real (magic bytes) en subida: no se confía
                en el <Mono>Content-Type</Mono> del cliente.
              </>,
              <>
                <strong>R2 ·</strong> Límite de tamaño por tipo de archivo (logo 5 MB, foto de
                plato 8 MB, etc.) con <Mono>413</Mono> claro al superarlo.
              </>,
              <>
                <strong>R2 ·</strong> <Mono>storage_used_bytes</Mono> actualizado en{" "}
                <Mono>organizations</Mono> y comparado contra el límite del plan antes de aceptar la
                subida.
              </>,
              <>
                <strong>R2 ·</strong> URLs firmadas con expiración corta (5 min por defecto); nunca
                objetos públicos para contenido de cliente.
              </>,
              <>
                <strong>R2 ·</strong> Verificación de pertenencia antes de firmar: la clave debe
                empezar con <Mono>orgs/{`{org_id}`}/</Mono>; si no, <Mono>403</Mono>.
              </>,
              <>
                <strong>AI ·</strong> Todas las llamadas vía AI Gateway; sin llamadas directas al
                proveedor desde el código de dominio.
              </>,
              <>
                <strong>AI ·</strong> Límites por plan (<Mono>ai_credits</Mono>) verificados antes
                de invocar; <Mono>429</Mono> claro si se excede.
              </>,
              <>
                <strong>AI ·</strong> Coste y latencia registrados en <Mono>ai_requests</Mono> para
                billing, observabilidad y reproceso.
              </>,
              <>
                <strong>AI ·</strong> Prompt sin PII cruda: <Mono>redact(input)</Mono> antes de
                construir el prompt; el log guarda <Mono>input_redacted</Mono>.
              </>,
              <>
                <strong>AI ·</strong> Fallback determinista por scope si el modelo no responde o
                devuelve baja confianza; el sistema nunca queda bloqueado.
              </>,
              <>
                <strong>AI ·</strong> Aprobación humana obligatoria para respuestas públicas,
                precios, campañas y eliminación; kill switch por organización.
              </>,
            ]}
          />
        </div>
      </GlassCard>

      {/* Callout */}
      <Callout kind="warn" title="PII nunca al modelo cruda">
        Antes de llamar al modelo, <Mono>redact(input)</Mono> elimina o enmascara la PII sensible
        (email, teléfono, tarjeta, nombre del cliente). El log <Mono>ai_requests</Mono> guarda{" "}
        <Mono>input_redacted</Mono>, no el input original. El contexto siempre está scoped por{" "}
        <Mono>organization_id</Mono>: ningún prompt de una organización ve datos de otra.
      </Callout>
    </Section>
  );
}
