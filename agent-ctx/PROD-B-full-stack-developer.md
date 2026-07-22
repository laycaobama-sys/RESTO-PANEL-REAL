# Task ID: PROD-B
## Agent: full-stack-developer

### Task
Crear `src/components/rp/sections-producto/p-b.tsx` con tres componentes para la Fase 5 (Producto RestoPanel): `ProductoComponentes`, `ProductoFlujos`, `ProductoLanding`.

### Work Log
- Leí `worklog.md` para entender el contexto previo:
  - Fase 0/1.1/1.2/4 completas y verificadas.
  - Infraestructura Fase 5 (producto) creada por architect: `phase-store.ts` con `Phase = "fase0" | "fase1" | "fase2" | "fase4" | "producto"` (default `producto`), `NAV_PRODUCTO` con 21 items en `nav.tsx`, `page.tsx` que importa `ProductoComponentes, ProductoFlujos, ProductoLanding` desde `@/components/rp/sections-producto/p-b` en la línea 48, directorio `src/components/rp/sections-producto/` listo, `p-hero.tsx` ya creado.
  - 5 subagentes trabajando en paralelo en bloques A-E: p-a (resumen/arquitectura/design/rutas/datos), p-b (este — componentes/flujos/landing), p-c (pricing/dashboard/reservas), p-d (CRM/automatizaciones/reputación), p-e (billing/super-admin/demo/tests/riesgos/deploy).
- Revisé `primitives.tsx` (firmas exactas de `Section`, `GlassCard`, `Stat`, `Pill`, `H3`, `Lead`, `DataTable`, `GoldList`, `KV`, `Risk`, `Callout`, `Code`), `mermaid.tsx` (no usado en este bloque), `p-hero.tsx` (patrones de hero con BrandMark, pills, KPI grid), `f4-c.tsx` (patrones de DataTable con keys por celda, helper `Mono`, GlassCard gold con GoldList, Code con escaping de backticks).
- Verifiqué `nav.tsx`: items `p-componentes` (06), `p-flujos` (07), `p-landing` (08) ya registrados en `NAV_PRODUCTO`.
- Verifiqué `page.tsx`: importa correctamente los 3 exports de `p-b` en orden `ProductoComponentes → ProductoFlujos → ProductoLanding` después de `ProductoDatos` y antes de `ProductoPricing`.
- Creé `src/components/rp/sections-producto/p-b.tsx` con tres exports:

  **1. `ProductoComponentes` (id=`p-componentes`, index 06, eyebrow `Componentes principales`)**
  - Title: "Componentes reutilizables con estados completos."
  - DataTable "Catálogo de componentes" 16 filas (Button, Input, DataTable, Card, Badge/Pill/Tag, Modal/Drawer, Toast, Skeleton, Tabs, ReservationCard, TableNode, CustomerCard, KpiWidget, AutomationNode, ReviewCard, CommandPalette) con columnas Componente (mono gold) / Variantes / Estados.
  - GlassCard gold "Reglas de componentes" con GoldList 7 (botón decorativo prohibido, skeletons en vez de spinners, focus-visible, estados completos loading/error/empty/success, responsive real mobile-first, accesibilidad ARIA, microinteracciones discretas con prefers-reduced-motion).
  - Code lang="typescript" con `BUTTON_CODE` (paquete `@restopanel/ui` Button.tsx canónico: forwardRef + cva + VariantProps + variantes primary/secondary/ghost/destructive + sizes sm/md/lg + loading con aria-busy + focus-visible ring dorado). Sin template literals en el código fuente, no necesita escaping.
  - Callout `ok` title="Estados completos": todo componente expone loading/error/empty/success, skeletons respetan layout final.

  **2. `ProductoFlujos` (id=`p-flujos`, index 07, eyebrow `Flujos críticos`)**
  - Title: "Journeys de extremo a extremo con estados y excepciones."
  - Grid `md:grid-cols-2` de 8 GlassCards, una por flujo:
    1. Alta de restaurante (Owner) — borador→configurado→listo, métrica <48h.
    2. Reserva de cliente (Cliente final) — solicitada→confirmada→check-in→completada, conversión >35%.
    3. Confirmación y recordatorio (Sistema) — confirmada→reconfirmada→check-in|no-show, no-show <8%.
    4. Operación de sala (Host) — libre→reservada→ocupada→por limpiar→libre, latencia sync <500ms.
    5. Solicitud de reseña (Cliente/Manager) — solicitada→recibida→respondida→publicada, respuesta <24h.
    6. Segmentación y campaña (Marketing) — borrador→aprobado→activo→pausado|finalizado, CTR >12%.
    7. Suscripción y billing (Owner) — activa→renovada|cancelada|impagada, MRR por local.
    8. Soporte e impersonación (Soporte) — abierto→investigación→resuelto→cerrado, MTTR <4h.
  - Cada card: número (01-08 mono gold), título H3, actor en pill, objetivo, pasos numerados (ol con indices mono), estados en `code` teal, excepciones (lista con bullet amber), automatizaciones (lista con bullet teal), métrica con pill gold en footer.
  - Callout `warn` title="Acciones destructivas requieren confirmación": ninguna acción destructiva sin confirmación explícita; sensibles requieren permiso + aprobación humana si la salida es IA.

  **3. `ProductoLanding` (id=`p-landing`, index 08, eyebrow `Landing interactiva`)**
  - Title: "Una experiencia de producto, no una página corporativa."
  - **Hero mockup interactivo**: GlassCard strong grande con:
    - Top bar con dot emerald pulsante "Vista previa · datos demo", pills "Servicio en curso" y "Local: Demo · Centro".
    - Hero text block: pills RestoPanel/SaaS Enterprise, título "Software para restaurantes que convierte cada servicio en más ingresos" (con `rp-gold-gradient`), subtítulo, 3 CTAs (Crear cuenta dorado, Solicitar demo, Ver cómo funciona).
    - Mini KPI row: 4 stats (Reservas hoy 84 +12%, Ocupación 78% +5pp, No-shows 3 -42%, Ticket medio 38€ +2€) con badge "demo" en cada uno.
    - Dos columnas: lista de 4 reservas entrantes (Laura M. 13:30 4pax confirmada, Bruno C. 14:00 2pax en espera, Familia Ortega 14:15 6pax confirmada, Sara V. 14:30 2pax confirmada) con pills de estado gold/teal · plano de sala mini con 6 mesas (T1 ocupada, T2 reservada, T3 libre, T4 libre, T5 ocupada, T6 bloqueada) coloreadas por estado (emerald/gold/rose/gray) con hover scale y leyenda de colores.
    - Activity feed con 5 eventos recientes (13:32 reserva confirmada, 13:28 mesa T1 ocupada, 13:21 reseña 5★ respondida por IA, 13:15 walk-in T4, 13:02 campaña VIP CTR 14%) con bullets gold/teal/gray según tipo.
    - Pie del mockup: "Composición estática con datos demo · no es un sistema en vivo".
  - DataTable "Prueba social (métricas demo etiquetadas)" 6 filas (Reservas gestionadas 1.2M, Restaurantes activos 3.400, No-shows reducidos -42%, Horas ahorradas 180k/mes, Clientes fidelizados 2.1M, Mejora media valoración +0.6★) con cada celda Valor en mono gold + Pill outline "demo".
  - "Problemas del sector" grid `lg:grid-cols-4` de 8 GlassCards (reservas dispersas, mesas vacías, no-shows, datos perdidos, reseñas sin responder, procesos manuales, herramientas desconectadas, falta de visibilidad rentabilidad), cada una con icono emoji, título, descripción 1 línea, link `→ Solución: [módulo]` con `href` a la sección del módulo correspondiente.
  - "Plataforma conectada" grid `lg:grid-cols-3` de 11 GlassCards (Reservas inteligentes, Plano de mesas, CRM, Marketing, Automatizaciones, Google Reviews, Analytics, IA Copilot, Lista de espera, Marketplace, Integraciones), cada una con nombre H3, pill de estado (Disponible/Beta/Próximamente/Parcial), beneficio 1 línea, CTA contextual.
  - GlassCard gold "Copy orientado a beneficio" GoldList 6 (hero promesa económica explícita, módulos declaran beneficio no features, CTAs diferenciados Crear/Solicitar demo/Ver cómo funciona, prueba social etiquetada demo, secciones orientadas a caso de uso problema→solución→módulo, tono operativo concreto).
  - Callout `info` title="SEO y AEO": title/meta únicos, canonical absoluto, OG+Twitter Cards, sitemap, robots, Schema.org (SoftwareApplication, FAQPage, Organization), breadcrumbs, URLs limpias, páginas por funcionalidad y caso de uso, comparativas honestas, documentación rastreable, sin keyword stuffing ni promesas de posicionamiento.

### React keys
- DataTable `COMP_ROWS` (16 filas): cada celda con key estable por columna (`key="c"`, `key="v"`, `key="e"`), sin colisión.
- DataTable "Prueba social" (6 filas): celdas inline con keys `key="m"`, `key="v"`, `key="t"` — únicas por posición dentro de cada fila.
- `FLOW_CARDS` (8 cards): key `key={f.n}` (números "01"-"08" únicos).
- Listas internas de cada flow card: `key={i}` indexadas.
- `DEMO_KPIS` (4 stats): `key={k.label}`.
- `DEMO_RESERVATIONS` (4 items): `key={r.time + r.name}` compuesto único.
- `DEMO_TABLES` (6 mesas): `key={t.id}` (T1-T6 únicos).
- `DEMO_ACTIVITY` (5 items): `key={i}` indexado (lista estática).
- `PROBLEMS` (8 cards): `key={p.title}`.
- `MODULES` (11 cards): `key={m.name}`.

### Diseño visual
- Tema dark premium con dorado #D4AF37 (`rp-gold-text`, `rp-gold-gradient`, `rp-glow-gold`), turquesa #3DD6C9 (`rp-teal-text`), glassmorphism (`rp-glass`, `rp-glass-strong`).
- Hover effects discretos: `transition-transform hover:scale-[1.03]` en mesas, `hover:underline` en links.
- Animación sutil: dot emerald `animate-pulse` en el top bar del mockup.
- Leyenda de colores del plano de mesas (libre emerald / reservada gold / ocupada rose / bloqueada gray).
- Estados del mockup claramente etiquetados "demo" en cada GlassCard interna.

### Lint
- `bun run lint` → 0 errores, 0 warnings en todo el repo.
- `grep "Can't resolve.*p-b" /home/z/my-project/dev.log` → solo aparecen errores antes de crear el archivo (líneas 77895-79770). Después de crear p-b.tsx, dev.log muestra "✓ Compiled in 486ms" y "✓ Compiled in 467ms" sin nuevos errores para p-b.
- Los errores residuales en dev.log son para `p-a`, `p-c`, `p-d`, `p-e` (otros subagentes en paralelo), no responsabilidad de este bloque.

### Stage Summary
- Archivo creado: `src/components/rp/sections-producto/p-b.tsx` (~640 líneas, 3 exports).
- 3 secciones navegables vía `NAV_PRODUCTO` (items 06, 07, 08).
- 2 DataTables (16 + 6 = 22 filas) con keys estables y únicas por celda.
- 8 GlassCards flow + 11 GlassCards módulos + 8 GlassCards problemas + 1 GlassCard gold copy = 28 cards.
- 1 Code block TypeScript (Button.tsx canónico con cva + VariantProps + loading + ARIA).
- 1 GlassCard gold (reglas de componentes) + 1 GlassCard gold (copy orientado a beneficio).
- 3 Callouts (ok estados completos, warn acciones destructivas, info SEO y AEO).
- Hero mockup compuesto estático pero realista con: 4 KPIs, 4 reservas entrantes, 6 mesas con estados coloreados, 5 eventos en activity feed, todo etiquetado "demo".
- Contenido 100% en español, dark theme premium consistente con fases anteriores.
- Lint limpio. Sin blockers. Mis archivos compilan limpio; los errores residuales en dev.log son responsabilidad de los subagentes p-a, p-c, p-d, p-e en paralelo.
