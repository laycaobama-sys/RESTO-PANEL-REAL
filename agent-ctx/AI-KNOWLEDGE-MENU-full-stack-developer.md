# AI-KNOWLEDGE-MENU — full-stack-developer

## Task
Construir 2 componentes para el Motor de IA RestoPanel dentro de `src/components/rp/ai-center/`:
- `ai-knowledge.tsx` exportando `AiKnowledge` — Base de Conocimiento IA (RAG) con documentos, búsqueda semántica, pipeline de indexación y estadísticas (Cloudflare Vectorize + R2 + D1).
- `ai-menu.tsx` exportando `AiMenu` — IA para Menú con análisis de rentabilidad, popularidad, margen, recomendaciones y cross-selling.

## Contexto previo aprovechado
- Worklog completo de fases 0/1.1/1.2/4 + Producto + Executive + AI-ENGINE-START + AI-CENTER-COPILOT.
- `exec-ai.tsx` como referencia de patrón: `"use client"`, `cn`, `useToast`, `motion`/`AnimatePresence`/`useReducedMotion`, SectionLabel, glass cards, badges gold/teal, min-h-[40px] touch targets.
- Design tokens en `globals.css`: `--gold` #D4AF37, `--gold-soft` #E8C766, `--gold-deep`, `--teal` #3DD6C9, utilities `rp-glass`, `rp-glass-strong`, `rp-glow-gold`, `rp-scroll-thin`, `rp-gold-text`, `rp-teal-text`, `prefers-reduced-motion` global.
- shadcn/ui completos: usé `Tabs`, `Dialog`, `Select` para no reinventar primitives.
- `useToast` con `TOAST_LIMIT=1` (un toast a la vez).
- Subagent paralelo (AI-CENTER-COPILOT) creó `ai-center.tsx` + `ai-copilot.tsx`; `nav-store.ts` ya incluye `"ai-center"` como Section y el AppShell los navega.

## Decisiones de implementación — ai-knowledge.tsx (~1250 líneas)
- **Tipos fieles al spec**: `DocumentStatus`, `DocumentType`, `KnowledgeDocument` con todos los campos (id, name, type, size, storageKey, status, chunks, embeddings, uploadedBy, uploadedAt, indexedAt, version, checksum, error).
- **4 tabs**: Documentos | Búsqueda semántica | Indexación | Estadísticas. Tablist responsive (label completo en sm+, primera palabra en móvil) con trigger activo en tono gold.
- **Documentos tab**:
  - Upload zone drag&drop + botón "Subir documento" + Select de tipo (7 tipos). Validación 10MB. Simulación: `pending` (1s) → `processing` (1s) → `indexed` con chunks aleatorios, toast por cada transición.
  - Lista de 8 docs demo exactos del spec (menu-navidad-2024.pdf indexed v2, carta-vinos-2025.pdf error "Extracción de texto fallida: PDF corrupto", etc.).
  - Filas: doble layout — grid 7-col en `lg`, card stacked en móvil. Nombre mono, badge tipo (gold/teal/blue/amber/purple/green/gray), tamaño formateado, badge estado, versión, chunks/embeddings, uploadedBy+date.
  - Acciones por doc: Ver (diálogo con R2 key + texto extraído + 3 stats), Reindexar (diálogo confirm → processing → indexed v+1), Eliminar (diálogo con copy exacto "Se eliminarán todos los embeddings asociados. Esta acción es irreversible."), Descargar (toast), Reintentar (solo si error).
- **Búsqueda semántica tab**:
  - Input grande + Enter para buscar. 4 chips de consultas sugeridas. Selects de configuración: nº resultados (5/10/20) y similitud mínima (0.5/0.7/0.9) como button groups.
  - Resultados: 3 por query (4 queries pre-cargadas con DEMO_SEARCH_RESULTS). Cada resultado: nombre doc + tipo + snippet con `<mark>` highlight en rango, % similitud (pill verde/gold/amber según umbral), chunk index, link "Ver documento completo".
  - Nota de aislamiento por organización con `org_{org_id}` namespace.
- **Indexación tab**:
  - 4 stat cards (docs, chunks, embeddings, última reindex "hace 2h").
  - Pipeline 5 pasos con icono, label, detalle técnico (R2 key path, parser, 500 tokens/50 overlap, @cf/baai/bge-base-en-v1.5, namespace). Cada paso con badge OK verde.
  - Botón "Reindexar todo" → diálogo confirm con copy exacto del spec → loading 3s (spinner) → toast "Reindexación completada. 12.400 embeddings actualizados."
  - Log de 5 operaciones con timestamp, doc, pasos/duración, resultado ok/error coloreado.
- **Estadísticas tab**:
  - 8 stat cards (docs, chunks, embeddings, R2 storage, queries hoy, latencia media, cache hit, coste €0.12/mes).
  - Donut chart SVG de embeddings por tipo (6 segmentos con colores de marca) — precompute de offsets con `for` loop para evitar react-hooks/immutability.
  - Line chart SVG 30 días con área degradada gold + punto final + ejes.
  - Nota de aislamiento + cifrado.

## Decisiones de implementación — ai-menu.tsx (~1140 líneas)
- **Tipos fieles al spec**: `MenuCategory` (6 valores), `MenuItemStatus` (5 valores), `MenuItemAnalysis` con price/cost en cents, margin %, popularity, revenue, rating (1-5 | null), status, aiRecommendation, crossSellCandidates, trend + campos extra (reasoning, monthlySales) para el diálogo de detalle.
- **4 tabs**: Análisis | Rentabilidad | Recomendaciones | Cross-selling.
- **Análisis tab**:
  - 12 items demo exactos del spec (Risotto trufa ⭐ €28 margen72% 89orders €2.492 4.8★ up, Sopa del día ❌ €9 margen30% 12orders €108 3.5★ down, Agua mineral 💰 €2 margen85% 234orders €468 N/A stable, etc.).
  - Grid responsive: 1 col móvil, 2 sm, 3 lg. Cada card: nombre, badge categoría + precio + trend arrow, badge status con emoji, metrics row 4-col (margen/pedidos/ingresos/rating), MarginGauge SVG (coste teal + margen gold), recomendación IA con border-l gold, botón "Ver detalle".
  - Diálogo de detalle: badges, 4 mini-metrics, estructura precio con gauge + coste/precio/beneficio, MiniBarChart SVG de 12 meses, recomendación IA, razonamiento extendido, candidatos cross-sell.
- **Rentabilidad tab**:
  - 4 summary stats (coste €4.892, ingresos €15.348, margen medio 68%, beneficio bruto €10.456).
  - Scatter chart SVG: X=popularity, Y=margin, 12 puntos coloreados por status. Cuadrantes con tints (Rentables teal, Estrellas emerald, Problemáticos red, Populares b/margen amber), medianas dashed, etiquetas por cuadrante, axis labels.
  - Bar chart de ingresos por categoría: 6 barras horizontales con gradiente gold-deep→gold + valor embebido.
  - Tabla de optimización de precios: 3 items (Hamburguesa €14→€16, Gin-tonic €12→€13, Patatas €8→€10) con impacto y confianza.
- **Recomendaciones tab**:
  - 8 recomendaciones IA exactas del spec con title, impact (positive/neutral tone color), confidence %, categoría (price/menu/promo/combo/replace/autosuggest), reasoning extendido, data[] de hechos clave.
  - Acciones: "Ver análisis" (diálogo con reasoning + data list), "Rechazar" (thumbs-down, deshabilita), "Aplicar" (gold, deshabilita tras click, toast). Counter de aplicadas.
  - Disclaimer con copy exacto del spec.
- **Cross-selling tab**:
  - Heatmap 8x8 (top 8 items por revenue). Cabeceras verticales rotadas 180°. Cells h-9/h-10 con color por afinidad (5 tramos: emerald → teal → gold → fg-18% → fg-8%). Diagonal atenuada. Leyenda baja/media/alta. `overflow-x-auto rp-scroll-thin` con min-w para móvil sin overflow.
  - 3 sugerencias de combo: Solomillo+Rioja 78% €72 save€5 +€340/mes, Hamburguesa+Patatas 82% €20 save€2 +€156/mes, Tiramisú+Café 65% €10 +€78/mes. Botón "Crear combo" con estado.

## Cumplimiento de restricciones
- **Todos los archivos** comienzan con `"use client";`.
- **Copy 100% es-ES**, badges "demo" en ambos headers.
- **Animaciones**: solo `transform` (y:8→0) + `opacity` vía framer-motion. `useReducedMotion()` respetado en DocumentsTab rows, SearchTab results, IndexingTab pipeline, MenuItemCard, RecommendationItem, CrossSellSuggestion. Cuando reduced=true, `{}` props (sin initial/animate).
- **Sin azul/índigo** excepto donde el spec lo pide explícitamente (Manual=blue, Bebidas=blue). Usé gold/teal/emerald/amber/fuchsia/pink/red.
- **Responsive**: grids 1→2→3/4 cols, tablas con `min-w` + `overflow-x-auto rp-scroll-thin`, touch targets `min-h-[36px]`/`min-h-[40px]`/`min-h-[48px]`, sin overflow horizontal en móvil.
- **shadcn/ui**: usé Tabs, Dialog, Select (no reinventé primitives).
- **Toasts**: 1 límite, copy claro, títulos+descripción.

## Lint
- Primer pase: 1 error react-hooks/immutability en `DonutChart` (reasignar `offset` dentro de `.map` callback). Fix: precompute offsets con `for` loop antes del render y mapear sobre el array resultante.
- Segundo pase: `bun run lint` → 0 errores, 0 warnings en todo el proyecto.
- Dev log: compilación 200 OK, sin errores. Mi módulo no genera Module not found ni errores de tipos.

## Estado de verificación
- `bun run lint` → exit 0, output limpio.
- `tail dev.log` → `✓ Compiled in 337ms`, `GET / 200`, sin warnings de mi código.
- Ambos archivos exportan `AiKnowledge` y `AiMenu` (named + default) para que el integrador (AI-CENTER-COPILOT o siguiente agente) los conecte al AppShell/ai-center container.

## Sin blockers
Archivos completos, lint-clean, type-safe. Listos para integrarse en el contenedor `ai-center.tsx` o para navegación directa vía una nueva Section si se requiere. El Subagent paralelo ya añadió `"ai-center"` al `Section` type en `nav-store.ts`.
