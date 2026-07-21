# Task ID: PROD-E
# Agent: full-stack-developer

## Task
Crear `src/components/rp/sections-producto/p-e.tsx` con 6 componentes (ProductoBilling, ProductoSuperAdmin, ProductoDemo, ProductoTests, ProductoRiesgos, ProductoDeploy) — bloque E de la Fase 5 (Producto RestoPanel). Cierre del documento: billing/marketplace, super admin, datos demo, tests, riesgos y deploy.

## Work Log
- Leí worklog.md (fases previas 0/1.1/1.2/4) y primitivas disponibles (Section, Tag, Risk, GlassCard, Stat, Pill, H3, Lead, DataTable, GoldList, KV, Callout, Code + Mermaid).
- Leí p-hero.tsx y f4-e.tsx para alinear estilo visual (premium dark, glassmorphism, gold/teal, Mono helper, keys estables por celda).
- Confirmé que page.tsx ya importa los 6 exports desde `@/components/rp/sections-producto/p-e` (línea 51). El archivo no existía → dev.log mostraba `Can't resolve '@/components/rp/sections-producto/p-e'`.
- Creé `p-e.tsx` (~640 líneas):
  - **ProductoBilling** (id=p-billing, index=15): DataTable "Capacidades de billing" (12 filas: subs→status), DataTable "Marketplace de integraciones" (11 filas: stripe→tpv), GlassCard gold "Cada integración muestra" (GoldList 10 ítems), Callout warn "No simular conexiones reales".
  - **ProductoSuperAdmin** (id=p-super-admin, index=16): DataTable "Métricas de plataforma" (13 filas: mrr→cost), DataTable "Acceso de soporte (impersonación)" (13 filas: consent→deny), Mermaid stateDiagram-v2 (ciclo Solicitada→Verificada→ActivaLectura→ActivaEscritura→Revocada), GlassCard gold "Reglas de Super Admin" (6 ítems), Callout warn "Nunca acceso silencioso".
  - **ProductoDemo** (id=p-demo, index=17): DataTable "Tipos de datos en el producto" (6 filas), GlassCard gold "Reglas de datos demo" (6 ítems), Callout ok "Desacoplado = degradable", Code typescript (ReviewsAdapter + DemoReviewsAdapter + GoogleReviewsAdapter).
  - **ProductoTests** (id=p-tests, index=18): DataTable "Estrategia de testing" (9 filas: unit→sec), Code typescript (Playwright e2e: login + reserva + permisos), DataTable "Checklist QA" (22 filas: q1→q22), Callout ok "Criterios mínimos de aceptación".
  - **ProductoRiesgos** (id=p-riesgos, index=19): DataTable "Riesgos técnicos" (8 filas con componente `<Risk level=.../>` en columna impacto: rls crítico, ai/floor/fiscal alto, prov/load/pend/deuda medio), DataTable "Funcionalidades pendientes" (10 filas: wa→api), GlassCard gold "Honestidad" (5 ítems), Callout warn "Piloto antes de escala".
  - **ProductoDeploy** (id=p-deploy, index=20): Code bash (install → env → D1 → dev → tests → wrangler deploy), DataTable "Entornos" (4 filas: local/preview/staging/production), GlassCard gold "Reglas de despliegue" (7 ítems), GlassCard strong (cierre del documento).
- React keys: cada celda en arrays `rows` usa key semántica única por fila+columna (`cap-${c.id}`, `impl-${c.id}`, `est-${c.id}`, `integ-${m.id}`, `met-${m.id}`, `req-${r.id}`, `tipo-${d.id}`, `nivel-${t.id}`, `item-${q.id}`, `riesgo-${r.id}`, `imp-${r.id}`, `feat-${f.id}`, `ent-${e.id}`) — sin colisiones, patrón alineado con f4-e.tsx. Los `id` strings en los arrays (`subs`, `checkout`, `mrr`, `consent`, `demo`, `q1`…`q22`, `rls`, `wa`, `local`, etc.) son únicos dentro de cada DataTable.
- Mermaid: `stateDiagram-v2` con estados PascalCase (Solicitada, Verificada, ActivaLectura, ActivaEscritura, Revocada) y transiciones etiquetadas (`staff + motivo`, `MFA reciente OK`, etc.). Tema dark ya inicializado en mermaid.tsx (gold border, teal lines).
- Code blocks: 3 bloques (1 typescript adapter pattern, 1 typescript Playwright e2e con regex `/\/dashboard/` escapada como `/\\/dashboard/` dentro de template literal, 1 bash deploy). Sin backticks sueltos dentro del código — todos los bloques usan template literals TS limpias.
- Componente `<Risk level="crítico|alto|medio"/>` usado directamente como nodo React en celdas de DataTable (columna "Impacto"), siguiendo el patrón de primitivas.
- Cloudflare-native: wrangler d1 create/migrations apply/execute/secret put/deploy, .dev.vars, sandbox por entorno, smoke-prod.ts post-deploy. Honestidad técnica: integraciones "pendientes" declaradas, modo demo explícito, piloto antes de escala, D1 sin RLS mitigado con Tenant Enforcement Layer + tests IDOR.

## Stage Summary
- Archivo creado: `src/components/rp/sections-producto/p-e.tsx` (~640 líneas, 6 exports).
- 6 secciones navegables (índices 15–20) — bloque E cierra la Fase 5 (Producto) con billing, super admin, datos demo, tests, riesgos y deploy + cierre del documento.
- 8 DataTables (12 + 11 + 13 + 13 + 6 + 9 + 22 + 8 + 10 + 4 = 108 filas totales) con keys estables y únicas por celda.
- 3 Code blocks (1 typescript adapter, 1 typescript Playwright e2e, 1 bash deploy) — código ejecutable, sintácticamente correcto.
- 1 Mermaid stateDiagram-v2 (ciclo de vida del acceso de soporte).
- 4 GlassCards gold + 1 GlassCard strong (cierre del documento).
- 5 Callouts (warn no simular, warn nunca acceso silencioso, ok desacoplado, ok criterios, warn piloto).
- 8 componentes `<Risk>` (1 crítico, 3 altos, 4 medios) en tabla de riesgos técnicos.
- Lint: `bun run lint` → 0 errores, 0 warnings. `bunx tsc --noEmit` → sin errores en p-e.tsx.
- Dev log: tras crear p-e.tsx, el error `Can't resolve '@/components/rp/sections-producto/p-e'` desapareció; `✓ Compiled in 486ms`. Los restantes errores de módulo son p-a/p-b/p-c/p-d pendientes de otros subagentes paralelos.
- Cierre del documento RestoPanel: GlassCard strong con statement "sistema operativo digital para restaurantes, con aislamiento real, componentes interactivos, datos demo honestos y un camino claro de piloto a escala."
