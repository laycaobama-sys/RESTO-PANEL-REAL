---
Task ID: 1
Agent: main (architect)
Task: Diseñar y construir el entregable de Fase 0 de RestoPanel como un documento estratégico-arquitectónico navegable y premium en Next.js.

Work Log:
- Revisé estado del proyecto: Next.js 16 + shadcn/ui completo, dev server activo en :3000.
- Generé isotipo de marca RestoPanel con image-generation CLI (dorada sobre oscuro, premium operativo) → public/brand/isotipo.png.
- Definí design tokens de marca en globals.css: dark mode primario, dorado (#D4AF37) como acento, turquesa (#3DD6C9) para info, glassmorphism funcional, grid sutil, glow utilities, scroll-thin, prefers-reduced-motion.
- Actualicé layout.tsx: metadata RestoPanel, fuentes Fraunces (display) + Inter (UI) + JetBrains Mono (datos), dark theme por defecto, lang es, favicon = isotipo.
- Construí primitives.tsx: Section, Tag (Imprescindible/Importante/Posterior/Experimental), GlassCard, Stat, Pill, H3, Lead, DataTable, GoldList, KV.
- Construí nav.tsx: sidebar desktop con scrollspy (IntersectionObserver) + top bar mobile colapsable + BrandMark (SVG inline del isotipo).
- Construí hero.tsx: hero con isotipo, tesis, KPIs y 6 principios no negociables.
- Secciones 1-3 (sections-a.tsx): Resumen ejecutivo (tesis, decisiones partida), Supuestos y decisiones clave, Visión estratégica (problemas, segmentos, diferenciadores, modelo, planes, North Star, KPIs, hipótesis).
- Sección 4 (sections-brand.tsx): Arquitectura de marca — posicionamiento, voz, naming de módulos, 4 variantes de logo, app icons, usos prohibidos, paleta de 12 colores, 3 tipografías, escala tipográfica, kit de marca y plantillas.
- Sección 5 (sections-brand.tsx): Design System — tokens, breakpoints, estados, motion, a11y WCAG 2.2 AA, catálogo de componentes base + dominio, showcase en vivo, gobierno.
- Secciones 6-8 (sections-arch.tsx): Arquitectura funcional (6 apps + 17 dominios con owner/riesgo/MVP), Arquitectura técnica (topología Control Plane + Tenant Cells, stack Cloudflare, monorepo, comparativa modular, transversales), Modelo de datos (convenciones, Tenant Enforcement Layer, entidades por dominio).
- Secciones 9-10 (sections-ux.tsx): 9 flujos UX críticos con actor/pasos/estados/excepciones/automatizaciones/datos/métrica + a11y; Seguridad (15 controles, impersonación, GDPR, respuesta a incidentes, SLO/RPO/RTO).
- Secciones 11-14 (sections-plan.tsx): Roadmap 5 fases con timeline, Backlog 25 iniciativas priorizadas + DoR/DoD, Riesgos + decisiones pendientes, Recomendaciones finales.
- Compuse page.tsx: min-h-screen flex-col, SideNav, Hero, 14 secciones, Footer sticky.
- Pendiente: verificación con Agent Browser + lint.

Stage Summary:
- Entregable: documento Fase 0 completo de RestoPanel renderizado en la ruta / (única ruta visible).
- Diseño: dark mode primario, dorado acento, turquesa info, glassmorphism funcional, alta densidad informativa, navegación sticky con scrollspy de 14 secciones, footer sticky al fondo.
- Contenido: 14 secciones que cubren resumen ejecutivo, supuestos/decisiones, visión estratégica, marca, design system, arquitectura funcional (17 dominios), arquitectura técnica (Cloudflare + control plane/tenant cells), modelo de datos, flujos UX (9 journeys), seguridad/cumplimiento, roadmap (5 fases), backlog (25 iniciativas), riesgos, recomendaciones.
- Marca: isotipo generado en public/brand/isotipo.png, tokens de marca en CSS, 4 variantes de logo renderizadas, paleta de 12 colores, 3 tipografías.
- Decisiones clave reflejadas: organization como frontera, D1 canónico, Tenant Enforcement Layer (sin RLS simulada), modular monolith sobre Workers, Workers AI como proveedor primario, sin trial libre, Stripe para billing.

---
Task ID: 1 (verificación)
Agent: main (architect)
Task: Verificación end-to-end con Agent Browser + lint + dev log.

Work Log:
- ESLint: 4 errores jsx-key corregidos (sections-arch.tsx y sections-plan.tsx) → lint limpio.
- Agent Browser: página carga en / con 200, sin errores de consola ni de página.
- Estructura verificada: nav lateral con 14 items + hero + todas las secciones + tablas renderizadas.
- Interacción verificada: clic en item de índice (#datos) navega y hace scroll correctamente; URL actualiza a /#datos.
- Responsive verificado: viewport móvil 390x844, nav superior colapsable abre índice correctamente.
- Footer sticky: en página larga (69k px) el footer queda al final del contenido (natural push, sin overlap).
- VLM confirmó: tema oscuro premium con dorado renderiza bien, layout balanceado, sin glitches, sidebar con estado activo visible.

Stage Summary:
- Entregable Fase 0 de RestoPanel verificado y funcional en la ruta /.
- Listo para revisión del usuario vía Preview Panel.
