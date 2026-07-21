# Task 4-E — full-stack-developer

## Task
Bloque E de Fase 4 (RestoPanel) — crear `src/components/rp/sections-fase4/f4-e.tsx` con 6 exports:
`Fase4Tests`, `Fase4Seguridad`, `Fase4Observabilidad`, `Fase4Deploy`, `Fase4Migracion`, `Fase4Criterios`.
Código REAL y ejecutable: Vitest + cloudflare:test, wrangler d1/secret/deploy, TypeScript middleware/logger.

## Contexto relevante (de worklog + page.tsx + primitives.tsx)
- Infra Fase 4 ya está lista (`4-INFRA`): phase-store extiende a `fase4`, NAV_FASE4 con 24 items, page.tsx importa f4-e con 6 exports.
- Bloques A, B, C, D se entregan en paralelo por otros subagentes — sus archivos f4-a/f4-b/f4-c/f4-d pueden no existir aún; los errores `Can't resolve f4-X` en dev.log son de otros agentes y NO son responsabilidad mía.
- Primitivas disponibles en `@/components/rp/primitives`: Section, Tag, Risk, GlassCard, Stat, Pill, H3, Lead, DataTable, GoldList, KV, Callout, Code.
- `Mermaid` disponible en `@/components/rp/mermaid` (no usada en este bloque — no se requieren diagramas).
- Code block toma `lang?: string` y `children: string` (un template string plano). Hay que escapar backticks y `${}` dentro del template.
- DataTable: `head: React.ReactNode[]`, `rows: React.ReactNode[][]` — CADA celda necesita un `key` estable y ÚNICO por posición. Nunca reutilizar keys entre filas con el mismo campo. Patrón seguro: `key={\`campo-\${id}\`}`.
- `Risk level` prop: "bajo" | "medio" | "alto" | "crítico" — se renderiza como tag con color.
- `Callout kind`: "adr" | "warn" | "info" | "ok" — ok = emerald, warn = amber, info = teal, adr = gold.

## Decisiones de implementación
- Helper `Mono` local para texto monoespaciado dorado inline (mismo patrón que f2-d/f2-e).
- IDs cortos y semánticos en arrays (`zod`, `sqli`, `iso`, `loc`...) como sufijo de `key` para evitar colisiones en DataTables grandes (22 filas en seguridad).
- Template strings en Code blocks escapados con `\`...\`` y `\${...}` para que JSX los procese como string literal.
- Stat row en observabilidad usa grid 2x2 dentro del área derecha del grid lg:grid-cols-2 (junto a GlassCard gold reglas).
- Cierre con GlassCard variant="strong" (rp-glass-strong) para máximo énfasis visual del final de fase.

## Archivo creado
- `src/components/rp/sections-fase4/f4-e.tsx` (~640 líneas, 6 exports)

## Conteo de elementos
- 6 DataTables: 9 + 22 + 6 + 11 + 7 + 15 = 70 filas totales
- 8 Code blocks: 3 Vitest (TS), 1 middleware security (TS), 1 logger (TS), 1 deploy (bash), 1 rollback (bash), 0 mermaid
- 6 GlassCards gold + 1 GlassCard strong
- 5 Callouts: 3 ok + 2 warn
- 1 Stat row (4 stats)

## Lint
- `bun run lint` → 0 errores, 0 warnings.
- `bunx tsc --noEmit` → sin errores en f4-e.tsx ni en imports hacia f4-e desde page.tsx.

## Blockers
Ninguno. Bloque E listo e integrado.
