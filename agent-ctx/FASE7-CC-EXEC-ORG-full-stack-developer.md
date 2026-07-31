# Task ID: FASE7-CC-EXEC-ORG
**Agent:** full-stack-developer
**Stage:** Phase 7 — Command Center (Executive Dashboard + Organization Detail)

## Task
Construir 2 componentes para el "Command Center" de RestoPanel Phase 7:
1. `CcExecutive` — Executive Dashboard con KPI grid (4 categorías), charts row (MRR forecast + heatmap reservas) y bottom row (AI Recommendations, Services Status, Orgs needing attention).
2. `CcOrgDetail` — Drill-down de organización con selector, header card y 8 tabs (Overview, Locales, Usuarios, Ingresos, Reservas, CRM, Integraciones, Auditoría).

Stack: Next.js 16, TypeScript, Tailwind CSS v4, Framer Motion, premium dark theme (gold #D4AF37, turquoise #3DD6C9, glassmorphism).

## Work Log
- Revisé `worklog.md`, `primitives.tsx`, `super-admin-view.tsx`, `globals.css` para alinear con design tokens (gold/teal, glassmorphism `rp-glass`, fuentes Fraunces/Inter/JetBrains Mono) y convenciones (DemoBadge, TrendPill, StatusPill).
- Verifiqué disponibles: `Tooltip`, `Tabs`, `Select`, `Skeleton`, `Badge`, `Button` de shadcn/ui; `framer-motion@12.23.2`, `lucide-react@0.525.0`.

### File 1: `src/components/rp/superadmin/cc-executive.tsx` (CcExecutive)
- Header con título "Command Center", badge demo, badge nivel plataforma, indicador "Tiempo real" con dot verde pulsante (`animate-ping`), timestamp última sincronización.
- Sección 1 — KPI grid con 4 categorías GlassCard:
  - **Finanzas** (13 KPIs aggregated daily): MRR €48.250 (+€1.200 +2.5%), ARR €579.000, Ingresos hoy €4.182, Ingresos mes €98.540, MRR Growth +2.5%, Expansion MRR +€800, Contraction MRR -€300, Refunds -€120, ARPU €149, LTV €3.840, CAC €412, Margen 72%, Beneficio €35.300.
  - **Clientes y suscripciones** (9 KPIs aggregated): Clientes 324, Nuevos 8, Trials 12, Renovaciones 15, Impagos 3, Upgrades 2, Downgrades 1, Cancelaciones 4, Churn 2.1%.
  - **Operaciones** (7 KPIs near-real-time 30s): Reservas 1.247, Completadas 1.189, Cancelaciones 58, No-shows 42, Usuarios conectados 87 (realtime), Emails 320, WhatsApps 89.
  - **Infraestructura** (13 KPIs near-real-time): Disponibilidad 99.97%, Uptime 99.97%, Latencia p50 42ms / p95 89ms / p99 156ms, Tasa errores 0.03%, Incidencias 1, Workers 2.4M req/día, D1 412MB, R2 8.2GB, KV 1.2M ops, Queues 4, DO 47.
- Cada KpiCard incluye: label mono uppercase, valor font-display con color contextual (verde/rojo/dorado), variación abs+pct con TrendArrow, período comparado, sparkline SVG 7 puntos, SourceBadge, FrequencyBadge (verde "Tiempo real" pulsante / teal "Casi tiempo real" / gris "Agregado"), InfoDot → Tooltip con definición + fórmula, last updated.
- Sección 2 — Charts row (2 charts lg:grid-cols-2):
  - **MRR Forecast Chart** SVG viewBox 760×320: 12 meses reales (línea gold con área degradada), 3 meses forecast (línea teal dashed), confidence band (área teal semi-transparente), divisor forecast, grid horizontal, axis labels, anotaciones "Lanzamiento Pro" (Ago) y "Black Friday" (Nov), tooltips nativos SVG `<title>` en cada punto. Leyenda: MRR real / Forecast / Intervalo confianza. Source: "Stripe + D1 agregado diariamente".
  - **Reservas Heatmap** SVG 24×7 (24h × 7d): patrón realista (picos 13-15h comida y 20-22h cena, fines de semana +25-40%), color intensity con gradiente gold (low→high), native tooltips por celda, leyenda "menos→más", labels de día y hora. Source: "Analytics Engine, últimos 30 días".
- Sección 3 — Bottom row (3 panels lg:grid-cols-3):
  - **AI Recommendations** (teal accent, border-left teal): 4 recomendaciones ejecutivas (riesgo churn 3 orgs, forecast MRR +8% confianza 78%, consumo IA +15% Ramses, latencia p99 EU-West 156ms). Cada una con icono contextual, severity badge (info/warning/critical/opportunity), insight one-line, ConfidenceBar + valor %, botón "Ver detalle".
  - **Services Status** (compact): 6 servicios (API 99.97%, D1 100%, R2 100%, Queues 99.95% degraded, AI Gateway 99.8%, Stripe webhook 100%) con dot estado pulsante, uptime, label. Alerta amber por servicio degradado.
  - **Orgs needing attention**: 4 orgs (Parrilla Sur churn 12d inactiva, Trattoria Bellini pago fallido, El Club del Chef spike errores, Café Central Lisboa trial expira) con initials en gradiente, plan badge, issue con icono, priority badge (alta/media), botón "Ver ficha".
- Framer Motion: fade-in-up sutil en KpiCard, AI recs y org header card.
- Responsive: KPIs `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`, charts `lg:grid-cols-2`, bottom `lg:grid-cols-3`. Charts con `overflow-x-auto rp-scroll-thin` y `min-w-[560px]` en mobile. Touch targets ≥44px en botones y filas.

### File 2: `src/components/rp/superadmin/cc-org-detail.tsx` (CcOrgDetail)
- Props: `orgId?: string`. Si no se provee, muestra selector con 6 orgs demo; si se provee, sincroniza vía useEffect.
- Selector shadcn Select con 6 organizaciones demo: Ramses Group (Enterprise), Sushi Bar Tokyo (Enterprise), La Tagliatella (Professional), Beach Club Marbella (Professional), Hotel Andalucía (Enterprise), Grupo Gastrolateral (Professional trial).
- **OrgHeaderCard**: avatar gradient circle con initials, name, PlanBadge (Enterprise=Crown gold, Professional=teal, Starter=muted), StatusBadge (activa/trial/pausada), owner, member since, country, grid 3 con MRR/Locales/Usuarios. Border-left accent color según org.
- **8 tabs** con iconos lucide + labels:
  1. **Overview**: 8 metrics grid (reservas mes, ingresos mes, ticket medio, ocupación, no-shows, Google rating, uso IA, storage) con InfoDot tooltip. Activity feed (5 eventos con iconos tonalizados) + Integraciones activas list con scroll. Source labels.
  2. **Locales**: tabla con name, city, reservas/mes, ingresos, occupancy, status. Source: Workers casi tiempo real.
  3. **Usuarios**: tabla con avatar initials, name, email, rol badge, last active, status. Source: D1 sessions tiempo real.
  4. **Ingresos**: MiniLineChart MRR 12 meses + variación %, tabla facturas (5 invoices con id, fecha, importe, estado paid/pending/failed), usage con ProgressBar (reservas, emails, WhatsApps, IA credits vs plan limits, tone automático verde/dorado/rojo según %). Source: Stripe + D1.
  5. **Reservas**: 4 metrics (reservas 30d, tasa cancelación, tasa no-show, reservas hoy) + MiniBarChart 30 días + DonutChart canales (Widget web, Google Reserve, WhatsApp, Teléfono, Walk-in) con leyenda. Source: Workers + Analytics.
  6. **CRM**: 5 metrics (Clientes, VIPs, Segmentos activos, Campañas enviadas, NPS) + tabla resumen (conversión trial, reapertura email, clic WhatsApp, frecuencia visita). Source: Analytics Engine crm_events.
  7. **Integraciones**: lista con icono, name, versión, última sync, status (Conectado/Pendiente/Error) con icono CheckCircle2/Clock/XCircle. 6 integraciones (Stripe, WhatsApp Business, Google Business, Mailchimp, Meta Instagram, Cloudflare R2).
  8. **Auditoría**: tabla con actor, acción badge tonalizada (CREATE/UPDATE/DELETE/EXPORT/WEBHOOK), recurso, timestamp, IP. Source: D1 audit_log.
- Loading skeleton (420ms) al cambiar de org o tab usando `Skeleton` shadcn. EmptyState con icono + título + hint. SourceLabel y TabSourceFooter en cada tab. Framer Motion fade-in en contenido.
- Generadores helpers paramétricos (`makeLocales`, `makeUsuarios`, `makeMrrHistory`, `makeInvoices`, `makeUsage`, `makeReservas30d`, `makeChannels`, `makeIntegrations`, `makeAudit`, `makeActivity`) con `seed` por org para variación consistente entre orgs.
- Touch targets ≥44px (min-h-[44px] en filas de tablas, items de lista y botones). Tabs responsive: scroll horizontal en mobile, grid 4 cols en sm, grid 8 cols en lg. Refresh button con spin animation cuando loading.

### Lint
- 1ª pasada: 1 error en `DonutChart` (reassign `offset` después de render → react-hooks/immutability) + 1 warning (unused eslint-disable).
- Fix 1: refactor `DonutChart` para usar `segments.slice(0, i).reduce(...)` en lugar de `let offset` mutable.
- Fix 2: eliminé `eslint-disable-next-line react-hooks/exhaustive-deps` y añadí `selectedId` al array de deps del useEffect.
- 2ª pasada: **clean** (0 errors, 0 warnings).

## Stage Summary
- 2 archivos creados: `cc-executive.tsx` (~1100 líneas) y `cc-org-detail.tsx` (~1310 líneas).
- Total: ~42 KPIs ejecutivos con todos los metadatos (value, abs+pct variation, period, source, updated, frequency, definition+formula tooltip, sparkline), 2 charts SVG complejos (forecast MRR con confidence band + heatmap 24×7), 3 panels bottom, y 8 tabs con tablas/charts/donuts/progress bars en org detail.
- Todas las copys en español (es-ES). Todos los datos demo badged "demo". Tres frecuencias distinguibles (Tiempo real verde pulsante / Casi tiempo real teal / Agregado gris) en cada KPI y header de categoría.
- Design system 100% alineado: gold #D4AF37, turquoise #3DD6C9, glassmorphism `rp-glass`, fuentes Fraunces (display) + Inter (UI) + JetBrains Mono (datos), border-radius `rounded-xl/2xl`, hover states, focus-visible rings.
- Framer Motion con `prefers-reduced-motion` respetado vía CSS global existente.
- Responsive: 1 col mobile → 2 cols tablet → 3-4 cols laptop → 4 cols desktop en KPIs; 1 col → 2 cols en charts; 1 col → 3 cols en bottom row. Charts con scroll horizontal en mobile. Touch targets ≥44px garantizados.
- Lint: **PASA** limpio (0 errors, 0 warnings).
