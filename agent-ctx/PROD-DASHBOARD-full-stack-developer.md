# PROD-DASHBOARD — full-stack-developer

## Task
Construir la vista Home del Dashboard de RestoPanel (SaaS Enterprise, dark theme premium dorado #D4AF37 + turquesa #3DD6C9 + glassmorphism). Componente `Home` en `src/components/rp/dashboard/home.tsx` renderizado dentro del AppShell (sidebar + topbar ya provistos).

## Contexto leído
- worklog.md previo: Fases 0, 1.1, 1.2, 4, 5 (Producto) completas.
- `nav-store.ts`: `useNav` con `go(section)`, `setView`, `org`, `location`. Secciones: dashboard/reservas/crm/marketing/automatizaciones/reviews/analytics/integraciones/billing/equipo/configuracion/superadmin.
- `primitives.tsx`: tokens rp-glass, rp-glow-gold, rp-gold-text, rp-teal-text, DEMO_BADGE amber pattern.
- `app-shell.tsx`: línea 220 referencia `dashboard: React.lazy(() => import("@/components/rp/dashboard/home").then(m => ({ default: m.Home })))` — mi archivo es la dependencia que falta.
- `globals.css`: --gold #D4AF37, --gold-soft #E8C766, --teal #3DD6C9, --teal-deep #2BA89E, fuentes Fraunces (display) + Inter (UI) + JetBrains (mono), utilities rp-glass/rp-glass-strong/rp-glow-gold/rp-glow-teal/rp-scroll-thin/rp-grid-bg/rp-gold-gradient/rp-divider.
- shadcn/ui disponibles: checkbox, badge, card, button, etc.

## Work Log
- Verifiqué dev.log: error previo "Module not found: @/components/rp/dashboard/home" era antes de crear el archivo. Errores restantes son de otros subagentes (team-view, integrations-view, billing-view, settings-view, super-admin-view) — fuera de mi scope.
- Creé `src/components/rp/dashboard/home.tsx` (1224 líneas, ~41KB, export `Home`, `"use client"`):
  - **Header**: greeting "Buenas tardes, Ana" con accent dorado, indicador "En servicio" turquesa pulsante, fecha, botón "Ver reservas" que llama `useNav.getState().go("reservas")`.
  - **Alerts strip**: 2 alertas demo (3 reservas sin confirmar amber / reseña negativa red) con action buttons.
  - **Widget settings**: 3 checkboxes shadcn/ui (Mostrar Google Rating, Mostrar No-shows, Mostrar Recomendaciones IA) con useState. Labels htmlFor asociados, aria-label en cada checkbox.
  - **KPI grid** responsive 1/2/3 cols: 6 widgets con icono, label mono uppercase, número font-display + tabular-nums coloreado (gold-soft/teal según spec), trend pill con arrow + delta colored según bueno/malo, caption, sparkline SVG inline (gradient fill + línea + último punto). Contador widgets visibles. EmptyState si todos ocultos.
    1. Reservas hoy — 47, +12% vs ayer, teal (up)
    2. Ingresos hoy — 1.842€, +8%, gold (up)
    3. Ocupación — 78%, +5pp, teal (up)
    4. Ticket medio — 38€, +2€, gold (up)
    5. No-shows — 3, −1, teal (down=good)
    6. Google Rating — 4.6★, +0.1, gold (up)
  - **Layout 2 columnas** (lg:grid-cols-3): main (lg:col-span-2) + aside (1 col).
  - **Reservas de hoy** widget (main, gold): lista de 7 reservas demo clickeables con useState(selected). Time mono + customer + icon Crown si VIP + table info + pax + status pill (confirmed/waitlist/checked-in). Hover + selected state con ring gold. Botón "Ver todo" llama go("reservas").
  - **Timeline del día** widget (main, teal): timeline vertical con dots colored conectados por línea gradient. 5 eventos (10:00 Apertura, 13:00 Primer servicio, 14:30 Pico comida, 20:30 Pico cena, 23:30 Cierre) con notes.
  - **Gráfico de rendimiento** widget (main, gold): bar chart SVG inline viewBox 560×200 width 100% responsive. 7 barras para últimos 7 días. Gridlines + Y-axis labels, barras gold (hoy teal), valor encima, label día+fecha debajo. Media + total en header. Legend desktop inline + mobile below.
  - **Recomendaciones de IA** widget (aside, gold, rp-glow-gold): 3 recomendaciones con icono, título, rationale, confidence badge colored (≥85 emerald, ≥75 gold, resto muted), botón "Revisar antes de ejecutar" con icon Zap y aria-label. Disclaimer "IA propone, humano decide". Se oculta cuando toggle off.
  - **Actividad reciente** widget (aside, teal): 5 eventos con icono colored, texto + timestamp "hace X min" mono tabular.
  - **Próximas reservas** widget (aside, gold): 4 reservas en próximas 2h con time, customer, VIP Crown, pax, "en X min".
  - **Estado de integraciones** widget (aside, teal): 4 integraciones (Stripe/WhatsApp/Google/Resend) con status pill (conectado teal CheckCircle2 / pendiente amber Hourglass).
- **Sub-componentes**: DemoBadge, WidgetShell (wrapper rp-glass con header), EmptyState, Sparkline (SVG useId sanitizado), KpiCard, WidgetSettings, AlertsStrip, ReservasHoyWidget, TimelineWidget, PerformanceWidget, AiRecommendationsWidget, ActivityWidget, UpcomingReservationsWidget, IntegrationsWidget.
- **Sparkline SVG**: useId() sanitizado (replace `:`), polyline + area path con gradient stop, último punto destacado. 6 instancias únicas.
- **Bar chart SVG**: viewBox + width 100% + preserveAspectRatio, gridlines 5 niveles, barras rx=2, valores encima, labels día+fecha debajo, today teal.
- **React keys**: ids semánticos estables (k.id, r.id, e.id, d.day, ai.id, a.id, u.id, it.id, al.id, g-${lvl}). Sin colisiones.
- **Accesibilidad**: `<section aria-label>` en cada widget, `<header>`/`<main>`/`<aside>` semánticos, `aria-pressed` en reservas, `aria-label` en botones/checkboxes, `aria-hidden` en iconos decorativos, `role="img"`+`aria-label` en chart, `role="list"` en listas, `role="status"` en EmptyState, focus-visible rings en botones, labels htmlFor asociados, tabular-nums en números.
- **Responsive**: mobile 1 col → sm 2 → xl 3 (KPIs); main+aside stack en mobile (grid-cols-1 lg:grid-cols-3); chart SVG 100% con viewBox; legend desktop inline + mobile below.
- **Lint**: `bun run lint` exit 0, 0 errores, 0 warnings. `bunx tsc --noEmit` sin errores en dashboard/home.tsx.
- **Dev log**: tras crear archivo, ya no aparece "Module not found: @/components/rp/dashboard/home" en logs recientes.

## Stage Summary
- Archivo creado: `src/components/rp/dashboard/home.tsx` (1224 líneas, ~41KB, export `Home`, `"use client"`).
- Vista Home completa con: header greeting + alert strip (2 alertas) + panel de 3 toggles + grid 6 KPIs interactivos + layout 2-col (main: reservas clickeables + timeline + bar chart SVG; aside: AI recs con glow + actividad + próximas + integraciones).
- 3 useState reales para toggles de visibilidad. KPI grid filtra dinámicamente, AI widget condicional.
- Sparklines SVG inline (6 instancias únicas) + bar chart SVG inline responsive con gridlines, valores, labels día+fecha, highlight "hoy" en teal.
- 9 widgets con DEMO_BADGE amber visible, todos con aria-label, role semántico, focus-visible rings.
- 7 reservas demo clickeables con selected state + status pills, integración con useNav.getState().go("reservas").
- EmptyState reutilizable para escenarios sin items.
- Dark theme premium: rp-glass + rp-glow-gold en AI widget, dorado #D4AF37 / turquesa #3DD6C9 consistentes, font-display (Fraunces) + tabular-nums para alineación, font-mono (JetBrains) para labels y timestamps.
- Lint limpio (0 errores, 0 warnings). TypeScript limpio. Sin bloqueadores.
