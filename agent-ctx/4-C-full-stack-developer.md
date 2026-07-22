# Task 4-C · full-stack-developer · Fase 4 Bloque C

## Task
Construir el bloque C de Fase 4 (Núcleo Enterprise) como 5 componentes en `src/components/rp/sections-fase4/f4-c.tsx`:
`Fase4Auditoria`, `Fase4Repositorios`, `Fase4DO`, `Fase4Queues`, `Fase4R2AI`.

## Work Log
- Leí `worklog.md`: Fase 0/1.1/1.2 completas y verificadas; infra Fase 4 lista (phase-store con 4 fases, default `fase4`; `NAV_FASE4` con 24 items; `page.tsx` que importa `Fase4Hero` + bloques A-E de `sections-fase4/`; `f4-hero.tsx` ya creado por architect; `f4-c.tsx` es mi responsabilidad — los bloques A, B, D, E los escriben otros subagentes en paralelo).
- Revisé `primitives.tsx` (firmas Section/Tag/Risk/GlassCard/Stat/Pill/H3/Lead/DataTable/GoldList/KV/Callout/Code) y `mermaid.tsx` (client, theme dark+gold+teal, securityLevel loose, fallback legible).
- Revisé `f2-c.tsx` para alinear patrones: helper `Mono`, keys por celda en DataTable (`key="campo"` / `key="tipo"` / `key="notas"` etc.), GlassCard variant gold/default, Callout warn/info/ok, Code con `lang="typescript"` y `children: string`.
- Verifiqué sintaxis mental del Mermaid sequenceDiagram del brief (4 participantes C1/C2/DO/D1, flechas `->>`/`-->>`, sin caracteres especiales). Válido.
- Escapé correctamente los template literals dentro de los 6 Code blocks:
  - `AUDIT_CODE`: 3 SQL strings con backticks + 2 con `${table}` → `\`...\`` y `\${table}`.
  - `REPO_CODE`: 4 SQL strings con backticks, sin interpolación.
  - `DO_CODE`: 1 template literal `slot:${slot}` + 2 SQL strings → escape completo.
  - `QUEUE_CODE`: sin template literals (solo `2 ** attempt` y `Math.random()`).
  - `R2_CODE`: 1 template literal con 3 interpolaciones `orgs/${ctx.organization_id}/branding/logo-${ulid()}.${ext(detected)}` + 1 comparación `key.startsWith(...)` → escape completo.
  - `AI_CODE`: 1 SQL string con backticks, sin interpolación.
- Creé `src/components/rp/sections-fase4/f4-c.tsx` con 5 exports:
  - `Fase4Auditoria` (id=f4-auditoria, index 09): intro + DataTable "Campos del audit_log" (18 filas: audit_id ULID PK compuesta, organization_id, location_id?, actor_id, actor_effective_id?, action, resource_type, resource_id, before JSON, after JSON, result, duration_ms INTEGER, ip_redacted, user_agent, correlation_id, reason?, origin, occurred_at ISO UTC) + Code TypeScript audit/softDelete/restore service (env.DB.prepare INSERT/UPDATE bind redact redactIp nowUtc) + GlassCard gold "Reglas de auditoría" (8 items: append-only, retención 1 año D1+R2 cifrado, acceso restringido Auditor/Support con motivo, búsqueda indexada, exportación cifrada+auditada, enmascaramiento PII redact(), hash chain opcional, correcciones via compensatorios) + Callout warn "Nunca borrar físico sin proceso autorizado".
  - `Fase4Repositorios` (id=f4-repositorios, index 10): intro + Code TypeScript ReservationsRepo (list cursor+limit, findById con scope, create idempotente con idem_key + isUniqueViolation fallback, softDelete) + DataTable "Repositorios por dominio" (7 filas: Reservations, Customers, Tables, Floors/Zones, Menu, Billing, Audit) + GlassCard gold "Patrones de repositorio" (7 items: ctx obligatorio, filtro org_id, idem_key partial unique index, soft delete deleted_at+deleted_by, paginación cursor límite 200, sin SELECT * sin scope, tests IDOR por repo) + Callout info "Repositorio = frontera de aislamiento".
  - `Fase4DO` (id=f4-do, index 11): intro (DO estado efímero + D1 canónico) + Code TypeScript FloorObject extends DurableObject (lockSlot con storage.put + setAlarm TTL, releaseSlot, moveTable con broadcast WS + persist D1, handleWs WebSocketPair, broadcast, alarm libera locks expirados, orgId desde id.name split) + Mermaid sequenceDiagram prevención doble booking (C1/C2/DO/D1, lockSlot→INSERT idem_key→unique OK→confirmada; C2 conflicto→alternativa) + GlassCard gold "Relación DO ↔ D1" (7 items: DO coordina concurrencia, D1 canónico, reconstruye desde D1, DO no es única copia, WS con hibernación, reconexión re-sync delta, nombre org_id:location_id:date) + Callout warn "DO no reemplaza D1".
  - `Fase4Queues` (id=f4-queues, index 12): intro + Code TypeScript email-consumer (queue handler con batch, try sendEmail+markDelivered+ack, catch con attempts>=5→moveToDlq+ack, else retry con backoff exponencial+jitter) + DataTable "Colas" (5 filas: EMAIL_QUEUE/Resend, WHATSAPP_QUEUE/Cloud API, AI_QUEUE/AI Gateway, EXPORT_QUEUE/R2 URL firmada, WEBHOOK_QUEUE/HMAC) + GlassCard gold "Garantías de colas" (8 items: idempotencia message_id, backoff exponencial+jitter, max_attempts→DLQ, consumer dedupe, tolerancia fuera de orden, correlation_id, DLQ reproceso manual auditado, rate limit por proveedor y por org) + Callout ok "At-least-once + idempotencia".
  - `Fase4R2AI` (id=f4-r2-ai, index 13): intro (R2 prefijo orgs/{org_id}/ + AI Gateway con límites) + Code TypeScript R2 uploadLogo (detectMimeType real, size check 5MB, key `orgs/${org_id}/branding/logo-${ulid()}.${ext}`, env.MEDIA.put con customMetadata, incrementStorage; signedUrl verifica prefijo antes de firmar, env.MEDIA.createSignedUrl) + Code TypeScript AI Gateway runAi (getAiUsage vs getPlanLimit ai_credits → 429; env.AI_GATEWAY.run llama @cf/meta/llama-3.1-8b-instruct; estimateCost; catch → deterministicFallback; INSERT ai_requests con input_redacted redact(); incrementAiUsage) + DataTable "AI Gateway: casos de uso" (7 filas: respuestas reseñas/obligatoria, sentimiento/no, demanda/no, no-show/no marca riesgo, upselling/aprobación, recomendaciones/no, resumen diario/no) + GlassCard gold "Reglas de R2 y AI Gateway" (12 items: R2 prefijo orgs/{org_id}/, validación tipo real, límite tamaño, storage_used_bytes, URLs firmadas 5min, verificación pertenencia antes de firmar; AI vía AI Gateway, límites plan, coste+latencia en ai_requests, redact(input), fallback determinista, aprobación humana para sensible, kill switch por org) + Callout warn "PII nunca al modelo cruda".
- React keys: cada celda en arrays `rows` usa key semántico por columna. Para tablas con valores únicos por fila (AUDIT_FIELDS, REPO_ROWS, QUEUE_ROWS, AI_USE_CASES), usé keys por campo (`key="campo"`/`key="tipo"`/`key="notas"`, `key="dom"`/`key="tabla"`/`key="ops"`, `key="cola"`/`key="mensaje"`/`key="consumer"`/`key="notas"`, `key="caso"`/`key="entradas"`/`key="salida"`/`key="aprobacion"`). Sin colisiones dentro de la misma fila (cada columna tiene su propio key). GoldList usa índice automático del map (sin colisión porque cada ítem es único por posición).
- Honestidad técnica Cloudflare:
  - D1 = SQLite, sin RLS nativa → aislamiento en app layer con `WHERE organization_id = ?` en cada query (incluido findById).
  - `audit_logs` append-only: sin rutas UPDATE/DELETE en código de servicio; correcciones vía registros compensatorios; retención larga en R2 cifrado.
  - DurableObject extends `DurableObject` from `cloudflare:workers`; nombre del DO = `org_id:location_id:date` para afinidad. WebSocket vía DO con hibernación.
  - DO NO es la única copia: D1 conserva el estado canónico; DO reconstruye desde D1 tras desconexión.
  - Cloudflare Queues entrega at-least-once → consumer idempotente por message_id es obligatorio. DLQ con reproceso manual auditado.
  - R2 con prefijo `orgs/{org_id}/...`; URLs firmadas con `createSignedUrl`; verificación de pertenencia antes de firmar (defensa cross-tenant por path manipulation).
  - AI Gateway binding `env.AI_GATEWAY.run(model, options)`; límites por plan verificados antes de invocar; `redact(input)` elimina PII antes de construir el prompt; el log `ai_requests` guarda `input_redacted` no el input original; fallback determinista garantiza operación si el modelo falla.
  - Aprobación humana obligatoria para salidas públicas (respuestas a reseñas), precios (upselling), campañas y eliminación.
- Lint: `bunx eslint src/components/rp/sections-fase4/f4-c.tsx` → 0 errores, 0 warnings. `bun run lint` global → 0 errores, 0 warnings. `bunx tsc --noEmit` → 0 errores en f4-c.tsx.
- Dev log: tras crear f4-c.tsx, los errores residuales en dev.log son "Can't resolve '@/components/rp/sections-fase4/f4-b'" (y f4-d, f4-e) — responsabilidad de otros subagentes paralelos, no mía. Mi archivo compila limpio y resuelve el import de f4-c en page.tsx.

## Stage Summary
- Archivo creado: `src/components/rp/sections-fase4/f4-c.tsx` (~1007 líneas, 5 exports).
- 5 secciones navegables vía NAV_FASE4 (items 09, 10, 11, 12, 13).
- 1 diagrama Mermaid válido (sequenceDiagram prevención doble booking) con theme dark+gold+teal del proyecto.
- 4 DataTables (18 + 7 + 5 + 7 = 37 filas totales) con keys estables y únicas por celda.
- 6 Code blocks TypeScript (audit service, ReservationsRepo, FloorObject DO, email-consumer queue, R2 uploadLogo+signedUrl, AI Gateway runAi) con escaping correcto de template literals (`\`...\``, `\${var}`).
- 5 GlassCards gold (reglas de auditoría, patrones de repositorio, relación DO↔D1, garantías de colas, reglas de R2 y AI Gateway) con GoldList en cada una.
- 5 Callouts (warn nunca borrar físico, info repositorio=frontera, warn DO no reemplaza D1, ok at-least-once+idempotencia, warn PII nunca al modelo cruda).
- Contenido 100% en español, dark theme premium (dorado #D4AF37, turquesa #3DD6C9, glassmorphism, rp-glow-gold).
- Cloudflare-native honesto: D1 SQLite sin RLS, DO estado efímero + D1 canónico, Queues at-least-once + idempotencia obligatoria, R2 namespaced + signed URLs, AI Gateway con límites por plan + fallback determinista + PII redactada.
- Lint limpio. Sin blockers. Bloque C listo para integración con bloques A, B, D, E en page.tsx (que ya importa mis 5 exports).
