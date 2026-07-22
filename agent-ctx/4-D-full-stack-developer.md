# Task 4-D · full-stack-developer · Fase 4 — Bloque D (Caché / Billing / CRM / Dashboard)

## Contexto leído
- `worklog.md`: Fases 0, 1.1, 1.2 completas y verificadas. Infraestructura Fase 4 ya desplegada por main architect (phase-store con `fase0|fase1|fase2|fase4` default fase4, NAV_FASE4 con 24 items, `f4-hero.tsx` con 6 principios y stats, `page.tsx` que importa `Fase4Cache, Fase4Billing, Fase4CRM, Fase4Dashboard` de `f4-d` en línea 44, función `Fase4()` con 24 secciones). Directorio `sections-fase4/` esperando bloques A-E de subagentes paralelos.
- `primitives.tsx`: Section, Tag, Risk, GlassCard, Stat, Pill, H3, Lead, DataTable, GoldList, KV, Callout, Code (firmas exactas).
- `mermaid.tsx`: client, theme dark + gold/teal, securityLevel loose, fallback de error legible.
- `f2-d.tsx` / `f2-c.tsx`: patrones de helper `Mono` con `rp-gold-text`, DataTable con keys por celda `${prefix}-${id}-${field}`, GlassCard variant gold con Pill+H3 header, Callout warn/ok/info, Mermaid sequenceDiagram con aliases sin paréntesis ni `+`.

## Archivo creado
`src/components/rp/sections-fase4/f4-d.tsx` — 4 exports:

### `Fase4Cache` (id=f4-cache, index=14, eyebrow "Caché namespaced")
- Title "KV con namespace por organización e invalidación por tenant." + intro (KV lectura frecuente, namespace por org, no fuente de verdad transaccional, prevención cache poisoning).
- Code lang=typescript con `OrgCache` completo (key con prefijo `org:{id}:`, get/set/invalidate, invalidateOrg por prefijo con `kv.list` + Promise.all delete) + `getAvailability` ejemplo (cache 30s).
- DataTable "Qué cachear y qué no" 4 cols × 9 filas (Tipo | ¿KV? | TTL | Notas): settings 300s, flags 60s, avail 30s, layout 600s, permisos/sesiones/entitlements/transaccional/tokens → No autoridad D1.
- GlassCard gold "Reglas de caché" GoldList 7 items (prefijo org, TTL siempre, invalidar al mutar, cache poisoning prevenido, purge por org, KV nunca autoridad, lectura cacheada+escritura D1).
- Callout warn "KV no es fuente de verdad" (consistencia eventual, datos consistentes en D1, sistema sigue si KV se pierde).

### `Fase4Billing` (id=f4-billing, index=15, eyebrow "Facturación (Stripe)")
- Title "Stripe como fuente de cobro; entitlements reflejados en D1." + intro (planes, suscripciones, facturas, IVA, pagos, límites por plan, webhooks idempotentes, historial, Stripe = fuente de cobro, D1 refleja).
- Mermaid sequenceDiagram (Owner→Worker→Stripe→D1→WebhookQueue→Worker→D1→Owner) con 5 participantes.
- Code lang=typescript con `handleStripeWebhook` (verificación firma, dedup `event_id` en `stripe_events`, switch `invoice.paid` inserta `invoices` con ULID + ISO currency + tax, `customer.subscription.updated` update `subscriptions` con period start/end, insert final en `stripe_events`).
- DataTable "Límites por plan (ejemplo)" 6 cols × 4 filas (Plan | Locales | Usuarios | Almacenamiento | Reservas/mes | IA/mes): solo/pro/group/enterprise.
- GlassCard gold "Reglas de billing" GoldList 7 items (Stripe fuente cobro, webhooks idempotentes event_id dedup, límites enforced servidor, IVA Stripe Tax, historial consultable, prorrata, cancelación degradación graciosa).
- Callout ok "Webhooks idempotentes" (event_id único persistido, dedup, inserción post-procesamiento transaccional, exactly-once efectivo sobre D1).

### `Fase4CRM` (id=f4-crm, index=16, eyebrow "CRM y reputación")
- Title "Memoria del cliente y reputación conectada." + intro (tags, segments, VIP, history, campaigns, preferences, consents, exports, customer value, integraciones Google/Tripadvisor/TheFork/Facebook/Instagram, consentimiento por canal/finalidad, horario silencioso, cuota por plan).
- DataTable "Entidades CRM" 3 cols × 8 filas (Entidad | Propósito | Sensible): customers PII alta, customer_preferences medio, customer_tags bajo, customer_visits medio, customer_notes medio, segments bajo, campaigns bajo, consents alto (legal).
- Code lang=typescript con servicio CRM (`evaluateSegment` con org_id forzado en SQL compilada, `exportCrm` con check permiso `crm.export` + EXPORT_QUEUE + audit, `hasConsent` query sobre consents con granted=1).
- DataTable "Integraciones de reputación" 4 cols × 5 filas (Proveedor | Datos | Auth | Sync): Google Business Profile OAuth scopes incremental por cursor, Tripadvisor/TheFork/Facebook/Instagram futuros.
- GlassCard gold "Reglas de CRM y reputación" GoldList 6 items (PII alta consent versionado, exportación requiere crm.export audita, segmentos org_id forzado, campañas consent+horario+cuota, reseñas IA propone + humano aprueba, tags VIP/risk por eventos).
- Callout warn "Consentimiento obligatorio" (nada sin consentimiento, versionado, retirada bloquea envíos, hasConsent en momento del envío).

### `Fase4Dashboard` (id=f4-dashboard, index=17, eyebrow "Dashboard, hooks y widgets")
- Title "Dashboard configurable tipo Stripe: widgets, hooks y tiempo real." + intro (KPIs, tiempo real, heatmaps, horas punta, evolución mensual, comparativa multi-local, forecast IA, alertas, anomalías, widgets movibles/ocultables/restaurables, configuración por usuario y por org, dashboards por rol).
- DataTable "KPIs del dashboard" 3 cols × 11 filas (KPI | Fuente | Frecuencia): ingresos batch, reservas tiempo real, ocupación tiempo real, ticket medio batch, no-shows tiempo real, cancelaciones tiempo real, clientes nuevos tiempo real, recurrentes batch, valor del cliente batch, tiempo medio estancia batch, comparativa periodos batch.
- Grid lg:2 cols con dos Code lang=typescript lado a lado: (1) hook `useReservations` con TanStack Query (queryKey, fetch credentials:include, staleTime 15s, retry 2) + widget `ReservationsWidget` con skeleton/error/region ARIA; (2) registro `WIDGETS` con 5 widgets (reservations_today/occupancy/no_shows/revenue/ai_forecast) con requiredPermission + defaultSize, función `visibleWidgets` filtra por `ctx.permission_keys`.
- Lead explicando hook llama a API que aplica tenant + registro filtra por permisos efectivos.
- GlassCard gold "Sistema de widgets" GoldList 8 items (movibles/ocultables/restaurables, configuración por usuario y org, dashboards por rol vía requiredPermission, tiempo real WebSocket DO floor, KPIs batch analytics_daily, forecast IA con badge confianza, alertas operativas y anomalías, responsive accesible ARIA foco teclado).
- Callout ok "Dashboard por rol" (cada rol ve widgets con permiso, Recepción/Marketing/Contabilidad/Owner, configuración por usuario dentro del rol).

## Calidad técnica
- Contenido 100% en español.
- Honestidad Cloudflare: D1 = SQLite con `env.DB.prepare(...).bind(...).run()`, `env.CONFIG` como `KVNamespace` con `get/put/delete/list` y `expirationTtl`, `env.EXPORT_QUEUE.send()` para exportaciones pesadas, `env.STRIPE_WEBHOOK_SECRET` como secreto, idempotencia vía `stripe_events` (tabla dedup en D1), Stripe Tax para IVA, TanStack Query `staleTime: 15s` + `retry: 2` para server state, fetch con `credentials: "include"` para cookies SameSite, WidgetRegistry filtra por `permission_keys` (no por campo `role`).
- Dark theme premium: dorado #D4AF37 (rp-gold-text, ids, Mono helper, GlassCard gold), turquesa #3DD6C9 (rp-teal-text, info accents), amber-300 (Callout warn), emerald (Callout ok), destructive (Callout error si lo hubiera).
- Glassmorphism: `rp-glass` para default cards, `rp-glass rp-glow-gold` para GlassCard gold de reglas.

## Lint
- `bunx eslint src/components/rp/sections-fase4/f4-d.tsx` → 0 errores, 0 warnings.
- `bun run lint` global → 0 errores, 0 warnings.
- Dev log: tras crear f4-d.tsx, "✓ Compiled in 866ms". El error residual `Module not found: '@/components/rp/sections-fase4/f4-c'` es de otros subagentes paralelos (A, B, C, E) que aún no entregan; mi f4-d resuelve correctamente desde page.tsx (import en línea 44).

## React keys
- DataTable Caché: keys `cache-{settings,flags,avail,layout,perms,sessions,entitlements,txn,tokens}-{tipo,kv,ttl,notas}`.
- DataTable Planes: keys `plan-{solo,pro,group,enterprise}-{name,loc,usr,sto,res,ia}`.
- DataTable CRM entidades: keys `crm-{customers,preferences,tags,visits,notes,segments,campaigns,consents}-{ent,pro,sen}`.
- DataTable Reputación: keys `rep-{google,tripadvisor,thefork,facebook,instagram}-{prov,datos,auth,sync}`.
- DataTable KPIs: keys `kpi-{revenue,reservations,occupancy,avg_ticket,no_shows,cancellations,new_customers,recurring,ltv,stay,compare}-{name,src,freq}`.
- Sin colisiones dentro de la misma fila. GoldList usa key `i` interno del componente (no colisiona porque cada GoldList se renderiza en su propio árbol).

## Escaping de código
- Los 4 bloques de código TypeScript contienen backticks (template literals SQL/URLs) y `${}` (interpolación). Escapados como `\`` y `\${` dentro de template literals de TS para preservarse literalmente en el string y mostrarse tal cual en el componente `Code`. Verificado visualmente.

## Sin blockers
- Mi archivo está completo y lint-limpio.
- Pendiente de otros subagentes: f4-a, f4-b, f4-c, f4-e — su ausencia impide que page.tsx compile (module-not-found), pero no afecta la calidad de f4-d.
