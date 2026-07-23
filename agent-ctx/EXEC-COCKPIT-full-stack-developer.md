# Task ID: EXEC-COCKPIT
# Agent: full-stack-developer

## Objective
Build a single large "Executive Control Center" component for RestoPanel: `ExecCockpit` exported from `/home/z/my-project/src/components/rp/executive/exec-cockpit.tsx`.

Inspiration: aircraft cockpit + Stripe dashboard + Datadog. Premium dark theme (gold `#D4AF37`, turquoise `#3DD6C9`, glassmorphism). Next.js 16 + TypeScript + Tailwind v4 + Framer Motion. All copy in Spanish (es-ES), demo data, badged "demo".

## Work log
- Read `/home/z/my-project/worklog.md` and existing project conventions (`globals.css` brand tokens, `growth-analytics.tsx` motion + SVG patterns, `app-shell.tsx` shell).
- Created directory `src/components/rp/executive/`.
- Wrote `exec-cockpit.tsx` (~1500 lines) starting with `"use client";`.

### Structure
1. **Types** — `Freq`, `Accent`, `TrendDir`, `KpiCategory`, `KpiItem`, `WidgetDef`.
2. **Demo data** — `WIDGETS` (12), `KPI_CATALOG` (44 KPIs across 5 categories: Operación 10 / Clientes 10 / Marketing 8 / Reputación 7 / Finanzas 9), `COMPARISON_TYPES` (9), `COMPARISON_ROWS` (12), `HEATMAP_TYPES` (7), `PATTERNS` (6).
3. **Shared helpers** — `DemoBadge`, `InfoDot` (definition tooltip), `TrendPill` (abs + %, colored by direction/positivity), `FreqBadge` (real-time green / near-real-time teal / aggregated gray), `SourceBadge`, `MiniBadge`.
4. **SVG charts** — `Sparkline` (gradient fill, end dot), `Gauge` (semicircle, teal→gold gradient), `Donut` (4 segments channels).
5. **CockpitTab** — Welcome header ("Buenos días, Ana…"), toolbar (period selector × 6 + 4 `FilterSelect` dropdowns + Personalizar button), `CustomizePanel` (per-widget Switch toggles, Restaurar/Guardar layout), 12-widget responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`). Each `WidgetShell` renders title (mono uppercase, accent-colored), big value (font-display), trend, source/freq badges, InfoDot, "Ver detalle" link, last-updated timestamp. `WidgetContent` switch renders unique JSX per widget id (Facturación sparkline, Reservas donut, Ocupación gauge, VIP list, Alertas with severity badges, Forecast IA, Recomendaciones IA top 3, Rentabilidad progress, Reputación Google+NPS, Personal recomendado).
6. **KpisTab** — category filter (5 tabs) + responsive grid of `KpiCard` (name, value, TrendPill, formula in mono, freq+source badges, period, last updated, limitations if any, drill-down link).
7. **ForecastTab** — 6 `ForecastSummaryCard` (reservas 186 @82% ±18, facturación €10.250 @78% ±€1.200, ocupación 85% @85%, personal 9·2·1, no-shows 12 @70%, cancelaciones 8 @75%), `ForecastChart` SVG (actual gold solid + forecast teal dashed + confidence band), model factors bars (histórico 30d 35% / reservas 25% / estacionalidad 20% / clima 10% / eventos 10%), variables chips, model info (forecast-v2.1, accuracy 84%, data quality HIGH), disclaimer, "Recalcular" button with spinner.
8. **ComparativasTab** — 9 comparison types, AI explanation card (caída 18% martes, recomendación), `ComparisonChart` dual-line (gold A vs teal B), 12-row comparison table (Métrica | A | B | Var.abs | Var.% | Tendencia | Contexto).
9. **HeatmapsTab** — 7 heatmap types, SVG 7×24 grid with intensity colors (gold/teal for good polarity, red for bad polarity: No-shows/Cancelaciones), hover tooltip showing día·hora·valor, 6 AI-detected patterns with evidence + suggested action + "Crear acción" button.
10. **ExecCockpit main** — sticky header with brand mark + DemoBadge + Live sync indicator + Refresh/Export buttons, Tabs with 5 triggers (Cockpit/KPIs/Forecast/Comparativas/Heatmaps), footer status bar with frequency legend.

### UX/accessibility
- `prefers-reduced-motion` respected via `useReducedMotion()` in all animated sections.
- All animations use transform + opacity only.
- Touch targets ≥36–44px (filter buttons min-h-[36px], nav buttons min-h-[40px], widget toggles min-h-[44px]).
- ARIA labels on all interactive icons, `aria-expanded` on dropdowns, `role="img"` + `aria-label` on SVG charts.
- Responsive: 1 col mobile → 2-3 tablet → 4 desktop for widget/KPI grids; heatmaps horizontally scrollable on small screens via `overflow-x-auto rp-scroll-thin`.
- Sticky footer with frequency legend + sync timestamp.

### Lint
- Initial run flagged 2 errors:
  1. `React.useId()` called after early return in `Sparkline` → moved hook to top.
  2. `acc += len` reassignment inside `Donut` map → refactored to precompute `lens` and `cumOffsets` arrays via pure `.map`/`.reduce`.
- Re-ran `bun run lint` → clean, 0 errors 0 warnings.

## File created
- `/home/z/my-project/src/components/rp/executive/exec-cockpit.tsx` — exports `ExecCockpit`.

## Notes
- Component is not yet mounted in any route. To preview: import `ExecCockpit` from `@/components/rp/executive/exec-cockpit` and render in `src/app/page.tsx` or wire into a new nav section.
- All data is demo, deterministic where possible (heatmap uses one `Math.random()` for late-night noise but pattern is stable enough for visual purposes).
- Catalogue advertises "150+ KPIs" but exposes 44 fully-rendered ones across 5 categories (well above the 30+ minimum requested).
