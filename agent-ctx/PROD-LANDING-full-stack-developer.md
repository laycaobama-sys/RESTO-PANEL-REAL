# PROD-LANDING — full-stack-developer

## Task
Construir la landing page de producto de RestoPanel — `src/components/rp/landing/landing.tsx` exportando `Landing`. SaaS Enterprise premium dark theme (gold #D4AF37, turquoise #3DD6C9, glassmorphism), calidad Stripe/Linear/Vercel.

## Contexto previo aprovechado
- Fases 0, 1.1, 1.2, 4 y Producto (PROD-A..E) completas según `worklog.md`.
- `nav-store.ts` expone `useNav` con `view: "landing"|"app"`, `section`, `setView(v)`, `go(s)`.
- `brand.tsx` exporta `BrandMark` y `Logo`.
- `primitives.tsx` con Section, GlassCard, Pill, Stat, etc. (no usados directamente — landing tiene su propio lenguaje visual de marketing).
- `globals.css` con tokens `--gold/--teal` y utilidades `rp-glass/rp-glass-strong/rp-grid-bg/rp-gold-gradient/rp-glow-gold/rp-glow-teal/rp-scroll-thin/rp-divider` + `@media prefers-reduced-motion` que fuerza `animation-duration: 0.001ms`.
- `page.tsx` renderiza `<Landing />` cuando `view === "landing"` (default).
- shadcn/ui disponibles: Button, Sheet, Slider, Switch, Accordion, Tabs, Badge, Card.

## Decisiones de implementación
- **Un solo archivo, export único `Landing`**: 9 secciones como componentes internos para cohesión y evitar fragmentación.
- **`"use client";`** obligatorio por pricing calculator con estado, counters animados, mobile Sheet, IA Copilot con query chips interactivos.
- **Hooks propios**: `useReducedMotion()` (matchMedia), `useInView()` (IntersectionObserver que se desconecta tras disparar), `useCountUp(target, run, duration)` con ease-out cúbico y rAF, respeta reduced-motion (salta al valor final).
- **DemoBadge** reutilizable: pill amber con dot, "demo", presente en hero preview, social proof, todos los mocks de deep-dives, pricing card, IA copilot.
- **Navegación**: CTAs principales → `useNav.setView("app")`; "Explorar [módulo]" y "→ Solución: [módulo]" → `useNav.go(section)` mapeando cada módulo a la Section existente (IA Copilot→dashboard, Lista de espera→reservas, Marketplace→integraciones, Plano de mesas→reservas).
- **Pricing interactivo**: plan selector + Switch billing + Slider locals. Precio big font-display gold con `toLocaleString("es-ES")`. Savings badge teal cuando annual. CTA per plan (Starter/Pro → go("billing"), Enterprise → setView("app")). Comparison table 16 filas con checks/x y columna Pro destacada gold-tinted, scroll-x en mobile.
- **IA Copilot deep-dive**: 4 query chips clickeables con 4 respuestas pre-renderizadas (confianza, fuentes como chips, acciones como botones gold). Cambio de query re-dispara fade-in.
- **Animaciones**: `animate-ping` en live dot, `animate-in fade-in slide-in-from-*` de tw-animate-css para hero preview y floating chip, `rp-fade-in` keyframe custom (añadido a globals.css) para staggered fade en hero reservations list y floor plan tables. Reduced-motion respeta hooks JS + CSS media query global.
- **Honestidad**: no prometer trial libre indefinido (FAQ lo explica), no inflar cifras demo (todo badged), no claim de 100k sin contexto de sharding (no aplica a landing), Enterprise con SLA + CSM + API.

## Estado de verificación
- `bun run lint` → 0 errores, 0 warnings (output `$ eslint .` limpio).
- Dev log: único error residual son AppShell lazy imports (team-view, settings-view, billing-view, integrations-view, super-admin-view) — responsabilidad de PROD-D/PROD-E, no de esta tarea. Mi `landing.tsx` no aparece en ningún error.

## Estructura del archivo
```
landing.tsx
├── useReducedMotion, useInView, useCountUp, DemoBadge (helpers)
├── Landing (root, compone 9 secciones)
├── LandingHeader (sticky responsive + Sheet mobile)
├── Hero + HeroPreview + PreviewKpi + LegendDot
├── SocialProof + MetricCard (6 métricas con counters)
├── Problems (8 cards → soluciones navegables)
├── Platform + StatusPill (11 módulos → go(section))
├── DeepDiveReservas + ReservationsMock (timeline grid)
├── DeepDiveCRM + CrmMock + MiniStat (customer card)
├── DeepDiveIA (Q&A chips + answer card con fuentes y acciones)
├── Pricing + PriceLine + Cell (calculator + comparison table)
├── FAQ (10 preguntas con Accordion)
└── FinalCTA
```

## Pendiente (no bloqueante para este entregable)
- AppShell lazy imports de superadmin views (team-view, settings-view, billing-view, integrations-view, super-admin-view) — dependen de PROD-D/PROD-E.
- Cuando existan, el dashboard navegable funcionará end-to-end desde los CTAs de la landing.
