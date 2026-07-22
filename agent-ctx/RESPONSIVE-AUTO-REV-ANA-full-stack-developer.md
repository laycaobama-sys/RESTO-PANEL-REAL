# Task ID: RESPONSIVE-AUTO-REV-ANA
# Agent: full-stack-developer
# Task: Auditar y corregir issues RESPONSIVE en Automations, Reviews y Analytics

## Archivos tratados
- `/home/z/my-project/src/components/rp/automations/automation-builder.tsx`
- `/home/z/my-project/src/components/rp/reviews/reviews-view.tsx`
- `/home/z/my-project/src/components/rp/reviews/analytics-view.tsx`

## Issues encontrados y fixes aplicados

### automation-builder.tsx (7 fixes)

| # | Issue | Fix |
|---|-------|-----|
| 1 | Three-area grid saltaba de 1-col (móvil) a 3-col (lg), sin tablet intermedio | Añadido `md:grid-cols-[200px_minmax(0,1fr)]` para paleta+canvas lado a lado en tablet, config debajo |
| 2 | Paleta usaba `lg:flex-col` etc. → en tablet seguía horizontal | Cambiado a `md:flex-col`, `md:overflow-visible`, `hidden md:block` (3 lugares) |
| 3 | PaletteCard `lg:w-full` + descripción `hidden lg:block` solo activaban en lg | Cambiado a `md:w-full` y `hidden md:block` |
| 4 | Botón delete de nodo: `h-6 w-6` (24px) + `opacity-0 group-hover:opacity-100` (invisible en touch) | `h-9 w-9 md:h-6 md:w-6` (36px móvil) + `opacity-100 md:opacity-0 md:group-hover:opacity-100` (siempre visible en móvil) |
| 5 | Templates grid `sm:grid-cols-2 lg:grid-cols-5` (salto 2→5) | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5` (progresión gradual) |
| 6 | ConfigPanel no llenaba wrapper al envolverlo en div | Añadido `h-full` a ambos roots (empty + populated) |
| 7 | ConfigPanel necesitaba col-span en tablet | Envuelto en `<div className="md:col-span-2 lg:col-span-1">` |

### reviews-view.tsx (2 fixes)

| # | Issue | Fix |
|---|-------|-----|
| 1 | Rating summary header `gap-6` muy generoso en móvil 360px | Outer `gap-5 sm:gap-6`, inner `gap-4 sm:gap-6` |
| 2 | Copilot form `flex items-center gap-2` apretaba input+botón en móvil 360px | `flex flex-col sm:flex-row items-stretch sm:items-center gap-2` + botón `w-full sm:w-auto` (apila en móvil) |

### analytics-view.tsx (1 fix)

| # | Issue | Fix |
|---|-------|-----|
| 1 | KPI row `grid-cols-2 md:grid-cols-3 xl:grid-cols-6` apretaba 2 cols en móvil 360px (valores "142.580€" tight) | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6` (1-col en móvil para legibilidad) |

## Issues auditados y ya correctos (sin cambios)

### automation-builder.tsx
- Canvas horizontal flow: `overflow-x-auto` + `min-w-min` en contenedor de nodos (230px fixed). ✓
- Config panel form: inputs ya w-full y stacked. ✓
- Controls bar: `flex flex-wrap`. ✓
- Execution history table: `overflow-x-auto rp-scroll-thin`. ✓

### reviews-view.tsx
- Master-detail: `grid lg:grid-cols-[1fr_1.35fr]` (1-col móvil, 2-col lg). ✓
- Filters/tabs: `flex flex-col md:flex-row` + tabs `overflow-x-auto`. ✓
- Review cards: `line-clamp-2` snippet, `truncate` autor/ubicación. ✓
- IA suggested reply textarea: w-full por defecto. ✓
- Star evolution chart: `overflow-x-auto` + SVG `viewBox` + `w-full min-w-[640px] h-auto`. ✓
- Copilot chips: `flex-wrap`. ✓
- Answer bubble: `flex-1 min-w-0`. ✓

### analytics-view.tsx
- Filters bar: `flex items-center gap-2 flex-wrap`. ✓
- Heatmap 24h×7d: `overflow-x-auto` + SVG `viewBox` + `w-full min-w-[640px] h-auto`. ✓
- Donut chart: SVG `viewBox` + `w-44 h-44 shrink-0` en `flex flex-wrap` (leyenda wraps). ✓
- Dual-axis line chart: `overflow-x-auto` + `w-full min-w-[640px]`. ✓
- Locales compare: mismo patrón. ✓
- Forecast chart: mismo patrón. ✓
- Export buttons: header `flex flex-wrap`. ✓

## Lint status
- `bun run lint` → 0 errores, 0 warnings.
- Dev log: compila correctamente, GET / 200.

## Principios aplicados
- NO horizontal overflow en móvil (charts con `overflow-x-auto` + `min-w-[640px]`).
- SVG charts: `w-full` + `viewBox` + `h-auto` (o fixed shrink-0 en flex-wrap para donut).
- Touch targets: delete button 36px en móvil (compromiso para botón esquinado).
- Copy es-ES: sin cambios (ya estaba en español).
- Fix minimal: solo clases Tailwind + 1 wrapper div, no reescritura de lógica.
