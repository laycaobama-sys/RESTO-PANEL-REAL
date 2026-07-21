# PROD-A — full-stack-developer

## Task
Construir el bloque A de la fase Producto (RestoPanel Producto) — 5 secciones en `src/components/rp/sections-producto/p-a.tsx`:
- `ProductoResumen` (id=p-resumen, 01)
- `ProductoArquitectura` (id=p-arquitectura, 02)
- `ProductoDesignSystem` (id=p-design-system, 03)
- `ProductoRutas` (id=p-rutas, 04)
- `ProductoDatos` (id=p-datos, 05)

## Contexto previo aprovechado
- Infraestructura de fases anteriores (worklog): fases 0, 1.1, 1.2, 4 completas.
- `page.tsx` ya importa los 5 exports desde `p-a` (línea 47) y los renderiza en `Producto()`.
- `nav.tsx` NAV_PRODUCTO ya incluye los 5 IDs con índices 01–05.
- `p-hero.tsx` ya existe como hero de la fase Producto.
- Primitivas en `@/components/rp/primitives`: Section, Tag, Risk, GlassCard, Stat, Pill, H3, Lead, DataTable, GoldList, KV, Callout, Code.
- Mermaid en `@/components/rp/mermaid` (client, theme dark+gold+teal, securityLevel loose).

## Decisiones de implementación
- **Swatch visual en tabla de color tokens**: helper `Swatch` con `inline-block h-3.5 w-3.5 rounded-full border` y `style={{ background: color }}` soporta tanto hex como oklch directamente (CSS acepta ambos).
- **Keys estables y únicas**: cada celda JSX en DataTables usa key semántica por posición dentro de cada fila (`e1`–`e14`, `t1`–`t7`, `b1`–`b6`, `s1`–`s9`, `f1`–`f9`, `p1`–`p12`, `t-/h-/s-${token}`), sin colisiones dentro del mismo array de fila.
- **Mermaid charts**: labels quoted para todos los nodos con caracteres especiales (paréntesis, `·`, `+`, `/`). Cylinders `[(text)]` quoted. ER diagram con cardinalidades estándar `||--o{`, `||--||`, `}o--||` y labels simples sin espacios problemáticos.
- **Honestidad técnica**: D1 ~10GB/shard, sin RLS nativa (SQLite), KV nunca autoritativo, DO efímero vs D1 canónico, sharding obligatorio para escalar, Workers AI como proveedor primario con fallback determinista. Nada de prometer 100k en una sola base.
- **Tono editorial**: cada sección incluye intro clara, H3 para subtítulos, mix de DataTable + GlassCard gold + Callout para variar el ritmo visual.

## Estado de verificación
- `bunx eslint src/components/rp/sections-producto/p-a.tsx` → 0 errores, 0 warnings.
- `bun run lint` global → limpio.
- Dev log: "✓ Compiled in 486ms" — mi módulo resuelve correctamente.
- Únicos module-not-found restantes en dev log: `p-b`, `p-c`, `p-d`, `p-e` (otros subagentes paralelos).

## Sin blockers
El archivo está completo, lint-clean y listo para integración con los bloques B–E cuando esos subagentes terminen.
