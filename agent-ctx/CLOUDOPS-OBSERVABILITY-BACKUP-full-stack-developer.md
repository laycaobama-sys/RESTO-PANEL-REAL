# Task ID: CLOUDOPS-OBSERVABILITY-BACKUP
Agent: full-stack-developer

## Contexto
- SPA app RestoPanel. Next.js 16 + TypeScript + Tailwind CSS v4 + Framer Motion + shadcn/ui.
- Tema premium dark: dorado #D4AF37, turquesa #3DD6C9, glassmorphism (rp-glass / rp-glass-strong).
- Toda la copia en español (es-ES), datos demo con badge "demo".
- Animaciones transform + opacity only, respetando prefers-reduced-motion (useReducedMotion).
- Touch targets ≥44px, sin overflow horizontal en móvil.

## Archivos creados
1. `/home/z/my-project/src/components/rp/cloudops/cloudops-observability.tsx` — Export `CloudOpsObservability` (~1.7K líneas)
2. `/home/z/my-project/src/components/rp/cloudops/cloudops-backup.tsx` — Export `CloudOpsBackup` (~1.2K líneas)

## Wiring
- `nav-store.ts`: añadidos `"observability"` y `"backup-dr"` al tipo `Section`.
- `app-shell.tsx`:
  - Importados iconos `Activity` y `DatabaseBackup` de lucide-react.
  - NAV array: añadidas 2 entradas en grupo `"CloudOps"`:
    - `{ id: "observability", label: "Observabilidad", icon: Activity, group: "CloudOps" }`
    - `{ id: "backup-dr", label: "Backup & DR", icon: DatabaseBackup, group: "CloudOps" }`
  - GROUPS ya incluía `"CloudOps"` (añadido por agente paralelo).
  - SectionRenderer: añadidos lazy imports para `observability` y `backup-dr` apuntando a los nuevos archivos.

## File 1: CloudOpsObservability — Centro de Observabilidad
Header premium con badge "demo" + indicador "live", icono turquesa. 5 tabs con animación framer-motion (opacity + y 6px), respetando reduced-motion.

### Logs tab
- 4 MiniStats (Logs 24h, INFO, WARN, ERROR) con tendencias.
- LogVolumeChart SVG 24h: 24 barras horarias coloreadas por ratio de error (>0.5% rojo, >0.2% ámbar, resto turquesa).
- Filtros: nivel (Todos/INFO/WARN/ERROR) en botones · servicio (Select) · búsqueda por correlation_id (Input con icono).
- Log stream: 18 entradas demo con timestamp, level badge color-coded (INFO=blue, WARN=amber, ERROR=red), service badge color-coded (API=gold, D1=teal, Queues=fucsia, AI=gold, CRM=teal, Billing=amber, Webhooks=emerald), correlation_id, duration_ms.
- Botón "Ver traza" en cada entrada → salta al tab Tracing con ese correlation_id.
- Expandible por entrada: JSON estructurado con PII redactada por allowlist (regex para emails, Bearer tokens, query params sensibles).
- Nota: "Logs estructurados JSON · PII redactada por allowlist · Retención 30 días · correlation_id propagado end-to-end".

### Tracing tab
- 4 MiniStats (spans/trace avg, p50, p95, traces/min).
- Trace search: Input con correlation_id preset + botón "Cargar traza".
- TraceWaterfall SVG: 11 spans (API Gateway 2ms, Auth Middleware 4ms, Tenant Resolver 3ms, RBAC Check 2ms, Reservation Service 12ms, D1 Query 8ms, KV Cache Check 1ms, CRM Update 5ms async-queue, Analytics Event 1ms async-queue, Audit Log 1ms async-queue, Response Serialization 2ms) — total 42ms. Cada span:
  - Color: sync-gold (gateway/lógica), sync-teal (middleware), sync-amber (D1), sync-green (sync cache), async-green (queue).
  - Marcador "↳ queue" en spans async.
  - Status OK/ERROR border.
  - Click → expandir detalle con attributes OTel + events.
  - Animación de pulso en barras (respetando reduced-motion).
- Trace list: 10 traces recientes (correlation_id, endpoint, duration, status, spans count) · clickable.
- Slowest traces: top 5 con bottleneck identificado + insight IA en callout gold.
- Nota: "OpenTelemetry instrumentado en cada Worker, API, Queue y llamada IA · Correlation IDs propagados end-to-end".

### Métricas tab
- Selector de categoría (8 botones): API, D1, Workers, Queues, KV, R2, AI, Billing.
- API: LineChart request rate, LineChart latencia p50/p95/p99 (3 líneas superpuestas), BarChartMini error rate, DonutChart códigos HTTP (2xx/3xx/4xx/5xx), 6 MetricRows con valor/tendencia/fuente/botón "Set alert".
- D1: 2 LineCharts + 6 MetricRows (reads/s, writes/s, storage, latencia p50/p95, slow queries).
- Queues: tabla con throughput, DLQ depth, consumer lag, retry rate por cola (6 colas demo).
- AI: LineChart req/min, LineChart tokens/min (in/out), 7 MetricRows (req/min, tokens, cost/min, p50, p95, fallback rate, error rate).
- KV, R2, Workers, Billing: MetricRows específicas.
- Botón "Crear dashboard" → Dialog con nombre, multi-select de métricas, layout picker.

### Alertas tab
- 4 MiniStats (activas, reconocidas, monitorizando, reglas activas).
- 6 alertas activas demo (ALT-001 a ALT-006) con severidad, rule, currentValue, threshold, triggeredAt, status, assignee, acciones Acknowledge/Resolve/Create incident/View runbook (con animated list collapse).
- 8 reglas configurables con Switch enabled/disabled, último disparo, cooldown.
- 10 entradas de historial.
- 2 diálogos: View runbook (pasos SRE numerados) y Create alert rule (métrica, condición, umbral, ventana, severidad, canales).

### Incidentes tab
- 4 MiniStats (MTTR 4.2h, frecuencia 2, orgs afectadas avg, postmortems 6/8).
- 1 incidente activo demo (INC-2025-001) con severity, status, servicios, orgs afectadas, timeline (5 estados created → investigating → identified → monitoring → resolved), AI Summary box teal, botón Postmortem.
- 6 incidentes recientes resueltos (con link a postmortem si aplica).
- 2 diálogos: Postmortem (resumen, impacto, resolución, causa raíz, acciones de mejora) y Create incident (título, severidad, asignado, servicios, descripción).

## File 2: CloudOpsBackup — Backup & DR Panel
Header premium con badge "demo" + badge "RPO <5min · RTO <15min", icono dorado ShieldCheck. 4 tabs con animación framer-motion.

### Backups tab
- Estado: último backup hace 12min, próximo en 48min, frecuencia hourly+daily+weekly+monthly, 847 backups almacenados, 12.4GB en R2.
- Botón "Crear backup ahora" → loading 3s (spinner) → toast "Backup iniciado · Tipo: Full · Estimado: 2min".
- Tabla schedule (9 entradas): frecuencia, tipo, programa, retención, última, estado, tamaño.
- Lista 10 backups recientes con Restore + Download buttons.
- Verificación: última 15 ene, 6min, Passed ✓ · botón "Ejecutar ahora".

### Restauración tab
- Wizard 3 pasos (stepper con estado completed/active/pending):
  1. Seleccionar backup (Select con 10 backups).
  2. Seleccionar scope (Full database / Specific tables / Specific organization) — radio cards.
  3. Confirmar con caja de impacto amber + datos resumen · botón "Ejecutar restauración" → AlertDialog confirm → loading 3.5s → resultado "Restauración completada en 5min 42s · 0 errores".
- Historial 5 restauraciones con rollback button si reciente.
- Botón "Point-in-time recovery (D1 Time Travel)" → Dialog con date/time pickers, scope, vista previa de datos que se recuperarían.
- Nota: "Time Travel permite recuperar datos hasta 30 días atrás. Para retención mayor, se usan exports cifrados en R2."

### Failover tab
- Estado: Active-Active 4 regiones, 0 failovers activos, último test 15 ene (passed), RPO objetivo <5min.
- Matriz failover: 4 regiones (Europa, NA-East, AP-Southeast, SA-East) con destino, modo, health check, switch time, último test, status.
- Simulación interactiva: Select región → "Iniciar simulación" → 3s loading → panel resultado con:
  - Source/target, switch time (3min 12s), requests perdidas (0), RPO verificado (2min ✓), RTO verificado (3min 12s ✓), servicios afectados, autorecuperación.
- Botón "Ejecutar failover real" (rojo) → AlertDialog con ADVERTENCIA: "Solo para Super Admin en caso de emergencia" → toast.

### Snapshots tab
- D1 snapshots (5): timestamp, size, tipo (Hourly/Daily/Weekly/Monthly color-coded), status, Restore button.
- R2 object versions (4): prefix, size, version count, Browse button → Dialog con lista de archivos.
- KV backups (2): namespace, entries, size, Restore.
- Vectorize index snapshots (1): embeddings count, size, Restore.
- Política de retención (Collapsible): Hourly 24/día, Daily 7/semana, Weekly 4/mes, Monthly 12/año = 47 snapshots por tipo · botón "Configurar retención".
- Storage cost: 12.4GB used · €62/month · +2.1%/month growth.

## Responsive
- Desktop: layouts full, waterfall traces, matriz failover completa.
- Móvil: stacked, charts con overflow-x-auto + scroll-thin, tablas con min-w + overflow-x-auto, touch targets ≥44px (min-h-[44px] en tabs, min-h-[36px] en botones inline, h-11 w-11 en iconos del topbar).
- Sin overflow horizontal en main wrapper (overflow-x-auto interno en tablas/charts).
- Diálogos sm:max-w-lg / sm:max-w-2xl con scroll vertical interno.

## Accesibilidad
- aria-label en inputs, botones de icono, charts SVG (role="img" + aria-label).
- aria-pressed en tabs y filtros tipo toggle.
- aria-expanded en collapsibles y expandibles.
- aria-current="step" en stepper activo.
- sr-only para títulos de Dialog (DialogTitle + DialogDescription).
- Semántica: header, main ya provistos por app-shell; section por tab.

## Lint status
`bun run lint` — PASS · 0 errores, 0 warnings.
(Fix aplicado: refactor DonutChart para no mutar `acc` dentro del map durante render — react-hooks/immutability rule. Sustituido por `.map` + `.slice().reduce()` puro.)
