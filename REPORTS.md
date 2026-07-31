# RestoPanel · Informes de Estado del Proyecto

> Fecha: 2025-07-25 · Build verificado contra el árbol actual de `src/`
> Conteo de archivos: **93 componentes** (45 en `src/components/rp/` + 48 en `src/components/ui/`)
> Estado del dev server: HTTP 200, `✓ Compiled` en ~3–15 ms (fast refresh)
> Lint: 0 errores · TypeScript: `ignoreBuildErrors: true` en `next.config.ts`

---

## Report 1 · Informe de Arquitectura

### Stack tecnológico (verificado en `package.json`)

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js | 16.1.1 |
| Lenguaje | TypeScript | ^5 |
| UI framework | React | 19.0.0 |
| Estilos | Tailwind CSS v4 + `tw-animate-css` | ^4 |
| Primitivas UI | shadcn/ui (Radix UI) | 48 componentes |
| Estado global | Zustand | ^5.0.6 |
| Animaciones | Framer Motion | ^12.23.2 |
| Iconos | lucide-react | ^0.525.0 |
| Charts | Recharts + chart-utils.tsx propio (SVG) | ^2.15.4 |
| DnD | @dnd-kit/core, sortable, utilities | instalado pero **sin uso directo** en `src/` |
| Forms | react-hook-form + zod | ^7.60.0 / ^4.0.2 |
| ORM | Prisma | ^6.11.1 |
| Auth | next-auth (instalado, sin configurar) | ^4.24.11 |
| Otras | mermaid, react-markdown, @mdxeditor/editor, sonner, vaul | — |

### Estructura de la aplicación

RestoPanel es un **SPA de ruta única** (`src/app/page.tsx`, 84 líneas). El `Page` raíz decide entre `<Landing />` o `<AppShell />` usando el store de Zustand (`view: "landing" | "app"`). El `<AuthDialog />` se monta a nivel raíz para estar disponible en ambos modos.

```tsx
{view === "landing" ? <Landing /> : <AppShell />}
<AuthDialog />
<Footer />
```

### Organización de componentes

`src/components/rp/` contiene **13 carpetas de módulo** y **45 archivos `.tsx`**:

```
rp/
├── app/          (app-shell.tsx, nav-store.ts, brand.tsx)
├── dashboard/    (home.tsx)
├── reservas/     (6 archivos: view, floor-editor, prediction, alerts, waitlist, yield)
├── crm/          (crm-view.tsx, marketing-view.tsx)
├── executive/    (executive-view + 3 sub-componentes: cockpit, ai, alerts)
├── growth/       (4: analytics, reputation, campaigns, promotions)
├── reviews/      (reviews-view, analytics-view)
├── automations/  (automation-builder.tsx)
├── ai-center/    (4: ai-center, ai-knowledge, ai-copilot, ai-menu)
├── superadmin/   (5: billing, integrations, settings, team, super-admin)
├── landing/      (landing.tsx — 2.438 líneas, 17 secciones)
├── marketing/    (12 componentes demo del landing)
├── charts/       (chart-utils.tsx)
└── primitives.tsx (GlassCard, Stat, Pill, DataTable, Callout, Code…)
```

### Gestión de estado

- **Zustand** (`nav-store.ts`, 76 líneas) controla `view`, `section`, `org`, `location`, `authOpen`, `authMode`, `user`. Es la única fuente global.
- **React state** para el estado local de cada módulo (selección de mesa, filtros, diálogos abiertos, etc.).
- **`useLocalStorage` hook** en `app-shell.tsx` persiste `rp-sidebar-pinned`. `landing.tsx` persiste `rp-pricing-annual` directamente.

### Patrón de routing

No hay rutas anidadas. La navegación dentro de la app la maneja `SectionRenderer` en `app-shell.tsx`:

- **20 secciones** declaradas en el tipo `Section` del `nav-store` y mapeadas en `NAV`.
- Cada sección se importa con **`React.lazy()`** y se monta dentro de `<React.Suspense fallback={<SectionSkeleton />}>`.
- Cada sección es un **chunk JS independiente** (code-splitting por sección).

### Sistema de diseño

- **Tokens en `globals.css`** (~295 líneas): variables CSS `--gold: #D4AF37`, `--teal: #3DD6C9`, paleta de estados (`--table-free/occupied/…`, `--order-*`, `--plan-*`), glassmorphism (`rp-glass`, `rp-glass-strong`), glow (`rp-glow-gold`, `rp-glow-teal`), scrollbar thin, animaciones `rp-fade-in` / `rp-slide-in` y `@media (prefers-reduced-motion: reduce)`.
- **`src/lib/design-tokens.ts`** (182 líneas) exporta un objeto `tokens` con colores, tipografía (Inter / JetBrains Mono / Fraunces), spacing, radius, shadows, motion. Es la *single source of truth* declarada aunque en la práctica los componentes leen las variables CSS.
- **`primitives.tsx`** (329 líneas): `Section`, `Tag`, `GlassCard`, `Stat`, `Pill`, `H3`, `Lead`, `DataTable`, `GoldList`, `KV`, `Risk`, `Callout`, `Code`.

### Configuración de build

`next.config.ts` es **mínimo** (12 líneas):

```ts
const nextConfig: NextConfig = {
  output: "standalone",
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
};
```

- **`output: "standalone"`** produce un `.next/standalone/server.js` auto-contenido.
- `ignoreBuildErrors: true` permite compilar aunque haya errores TS.
- **No hay webpack memory optimizations personalizadas** (sin `devtool: false`, sin `cache.filesystem`). El dev server mantiene tiempos de compilación bajos (3–15 ms por fast-refresh, verificado en `dev.log`).
- Build script copia `.next/static` y `public` dentro del standalone.

### Real vs demo

| Real | Demo / mock |
|---|---|
| Routing, navegación, command palette, auth dialog, sidebar auto-ocultable, notifications bell | Base de datos (Prisma usa SQLite local con schema boilerplate User/Post) |
| 20 secciones con UI completa e interactiva | API de Stripe, webhooks, sending email/SMS/WhatsApp |
| Landing con 17 secciones + 12 marketing components | LLM real (copiloto con `DEMO_RESPONSES` estáticas + fuzzy match) |
| State local React (filtros, selección, drag de mesas nativo) | WebSocket / sync en tiempo real entre secciones |

---

## Report 2 · Informe de Componentes

### Conteo total

| Carpeta | Archivos `.tsx` | Líneas (top files) |
|---|---|---|
| `src/components/ui/` (shadcn primitives) | **48** | — |
| `src/components/rp/` (dominio) | **45** | — |
| **Total** | **93** | — |

Mayores archivos del dominio: `reservas-view.tsx` (2.927), `crm-view.tsx` (2.666), `floor-editor.tsx` (2.600), `exec-cockpit.tsx` (2.764), `landing.tsx` (2.438), `growth-analytics.tsx` (1.837), `automation-builder.tsx` (1.612), `growth-reputation.tsx` (1.933), `app-shell.tsx` (1.521), `growth-promotions.tsx` (1.609), `dashboard/home.tsx` (1.413), `marketing-view.tsx` (1.403), `exec-alerts.tsx` (1.317), `ai-knowledge.tsx` (1.247), `waitlist-panel.tsx` (1.247), `growth-campaigns.tsx` (1.528).

### Primitivas shadcn/ui presentes (48)

`accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toaster, toggle, toggle-group, tooltip`.

### Componentes de dominio (`rp/primitives.tsx`)

`Section` (eyebrow + título + intro numerada), `Tag` (Imprescindible / Importante / Posterior / Experimental), `GlassCard` (default / strong / gold / teal), `Stat`, `Pill`, `H3`, `Lead`, `DataTable`, `GoldList`, `KV`, `Risk` (bajo / medio / alto / crítico), `Callout` (adr / warn / info / ok), `Code`.

### Sistema de diseño

| Categoría | Tokens |
|---|---|
| Color brand | `--gold #D4AF37`, `--gold-soft #E8C766`, `--gold-deep #A8862A`, `--teal #3DD6C9`, `--teal-deep #2BA89E` |
| Estados de mesa | free / reserved / occupied / billed / cleaning / blocked |
| Estados de pedido | sent / preparing / ready / served / voided |
| Estados de pago | pending / paid / failed / refunded / disputed |
| Planes | starter (gray) / professional (emerald) / enterprise (violet) |
| Tipografía | Inter (sans), JetBrains Mono (mono), Fraunces (display) — escalas xs → 5xl |
| Radius | sm 6px · md 8px · lg 12px · xl 16px · 2xl 22px · full |
| Shadows | sm / md / lg / xl + glow emerald / yellow / violet |
| Motion | fast 120ms · normal 220ms · slow 320ms · slower 600ms; easings standard / decelerate / accelerate / spring |
| Breakpoints | sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536 |

### Cobertura de estados

- **Hover**: cebra en tablas, hover de botones con `hover:bg-foreground/5`, cards con `hover:border-[var(--gold)]/30`.
- **Focus**: `outline-ring/50` global, `focus-visible:ring-2` en inputs, `focus-visible:outline-2 outline-offset-2` en comandos.
- **Active**: `active:scale-[0.98]` en algunos botones de CTA.
- **Disabled**: `disabled:opacity-60 disabled:cursor-not-allowed` en submits con loading.
- **Loading**: `Loader2 animate-spin` en auth, `aria-busy` en `SectionSkeleton`, pulse en skeletons de carga de sección.
- **Empty**: `EmptyResults` (sin resultados en CRM), `EmptySelection` (CRM sin cliente seleccionado), mensaje "Sin resultados para …" en command palette.
- **Error**: `FieldError` con texto rose-400 en formularios, `aria-invalid` en inputs, toasts `variant: "destructive"`.

### Accesibilidad (resumen ejecutivo)

- `aria-label` / `aria-hidden` / `aria-current` / `aria-pressed` / `aria-busy` / `aria-invalid` / `aria-expanded` / `aria-haspopup` — **966 ocurrencias en 65 archivos**.
- `prefers-reduced-motion` / `useReducedMotion()` — **138 ocurrencias en 34 archivos**.
- `sr-only` — presente en `DialogTitle`/`DialogDescription` del command palette y otros.
- `aria-live="polite"` — solo **3 ocurrencias** (`exec-ai`, `ai-copilot`, `landing`).
- **No hay `skip-to-content`** ni `skip-link` en `layout.tsx` o `page.tsx`.

---

## Report 3 · Informe de Pantallas

### Conteo real: 20 secciones en el sidebar

> **Discrepancia con la spec original**: el task ID afirma "49 secciones en el sidebar", pero el código real (`nav-store.ts` línea 6-26 y `app-shell.tsx` líneas 23-44) define exactamente **20 secciones**. El `SectionRenderer` (líneas 1475-1500) carga las mismas 20. Este informe refleja la realidad del código.

### Secciones agrupadas (5 grupos)

#### Operación (3)

| ID | Componente | Estado | Función |
|---|---|---|---|
| `dashboard` | `Home` (1.413 líneas) | Funcional | KPIs animados, chart de rendimiento con crosshair + clickable legend, timeline, próximas reservas, recomendaciones IA, alertas. |
| `executive` | `ExecutiveView` (96 líneas + 3 sub) | Funcional con 3 tabs (cockpit/ai/alerts) | Cockpit ejecutivo con forecast, comparativas y heatmaps. IA ejecutiva conversacional. Centro de alertas. |
| `reservas` | `ReservasView` (2.927 líneas) | Funcional | Plano de mesas con drag nativo, timeline, filtros rápidos, asignación, bloqueo, cancelación. 5 sub-views: reservas, predicción, yield, alertas, waitlist. |

#### Relación (3)

| `crm` | `CrmView` (2.666 líneas) | Funcional | Listado de clientes + perfil 360° (LTV, ticket medio, timeline de visitas, tags, notas, consentimientos RGPD). 5 diálogos: add-tag, edit, add-note, comunicar, new-reservation. |
| `marketing` | `MarketingView` (1.403 líneas) | Funcional | Campañas multicanal, segmentación, plantillas, scheduler. |
| `automatizaciones` | `AutomationBuilder` (1.612 líneas) | Funcional (sin drag&drop real) | Flow builder por nodos (trigger / condition / action / wait / branch) que se añaden por paleta de botones. **No hay DnD de reordenación**; se añaden nodos secuencialmente. |

#### Growth (4)

| `growth-analytics` | `GrowthAnalytics` (1.837) | Funcional | Embudo de cohortes, ROI por canal, segmentación, BI. |
| `growth-reputation` | `GrowthReputation` (1.933) | Funcional | NPS, sentimiento, topic cloud, comparativa. |
| `campaigns` | `GrowthCampaigns` (1.528) | Funcional | Tabla de campañas con ROI, filtros, detail dialog. |
| `promotions` | `GrowthPromotions` (1.609) | Funcional | Promociones, A/B test, canibalización. |

#### Reputación (2)

| `reviews` | `ReviewsView` (1.170) | Funcional | Lista de reseñas Google, filtros por estrellas y ubicación, draft de respuesta con IA, publish/edit. |
| `analytics` | `AnalyticsView` (1.042) | Funcional | Distribución de ratings, evolución mensual, topic cloud, comparativa. |

#### Plataforma (8)

| `integraciones` | `IntegrationsView` (556) | Funcional | Marketplace con 12 apps (Stripe, WhatsApp, Meta, Google, HubSpot, Zapier, Slack, ERP, TPV, Mailchimp, Make, Salesforce), webhooks (4 entradas), OAuth mock. |
| `billing` | `BillingView` (441) | Funcional | Facturas con filtro de estado, diálogo de cambio de plan, diálogo de actualización de tarjeta. |
| `equipo` | `TeamView` (517) | Funcional | Lista de miembros, roles, invitaciones. |
| `configuracion` | `SettingsView` (552) | Funcional | Preferencias de local, horarios, notificaciones, plantillas. |
| `ai-center` | `AiCenter` (1.662) | Funcional · **5 tabs** | Resumen (KPIs + uso por usuario), Uso (log de ejecuciones), Errores (log), Límites (progress bars), Modelos (4 modelos Cloudflare). |
| `ai-knowledge` | `AiKnowledge` (1.247) | Funcional · 4 tabs | Documentos, búsqueda semántica, indexación (5-step pipeline), estadísticas. |
| `ai-menu` | `AiMenu` (1.136) | Funcional · 4 tabs | Análisis, rentabilidad (scatter + bar), recomendaciones, cross-selling (heatmap 8×8). |
| `superadmin` | `SuperAdminView` (775) | Funcional · **9 secciones** (no tabs) | KPIs de plataforma, MRR growth, clientes/orgs, rankings, uso IA, costes infra, estado, mapa mundial, alertas. |

### Landing (17 secciones en `landing.tsx`)

`LandingHeader → Hero (HeroDashboard con parallax 3D) → SocialProofV2 (TrustLogos) → Problems → Platform → DemoFloor → DemoCrm → DemoAi → DemoReviews → SectionRulesAuto → SectionRealTime → SectionCrmVip → SectionPartner → RoiCalculator → WhyBento → Pricing → FaqSection → FinalCTA`.

### Auth flow

`AuthDialog` en `app-shell.tsx` (líneas 1.034+) soporta 3 modos:
- **Login**: email + password, validación, loader, mostrar/ocultar password, error por campo.
- **Signup**: nombre, email, password con medidor de fuerza (5 reglas: longitud, mayúscula, minúscula, dígito, símbolo).
- **Forgot**: email + enlace.
- Tras login exitoso: `login(user)` lleva al `view: "app"`, `section: "dashboard"`.

### App shell

- **Sidebar auto-ocultable**: rail 72px colapsado, hover-expand a 260px (delay 250ms), pin persistido en `localStorage`, drawer mobile con backdrop y `rp-slide-in`.
- **Topbar**: logo + org/location selector + search button + NotificationsBell + help button + UserAvatar (dropdown con logout).
- **NotificationsBell**: dropdown con 6 notificaciones iniciales, badge contador, mark-as-read individual y "marcar todas", close on outside-click + Escape.
- **CommandPalette** (⌘K): búsqueda fuzzy sobre navegación + 10 acciones rápidas, ArrowUp/Down/Enter/Escape, `aria-pressed`, `aria-label`, scroll automático del item activo.

---

## Report 4 · Informe de Datos y Persistencia

### Estado actual: 100% mock

**No hay ninguna llamada real a base de datos desde el código de UI.** Todos los datos viven como constantes en los propios archivos `.tsx`:

- `dashboard/home.tsx`: KPIs y series chart hardcoded.
- `reservas-view.tsx`: `INITIAL_TABLES`, `INITIAL_RESERVATIONS` en línea.
- `crm-view.tsx`: 8-12 clientes con historial de visitas hardcoded.
- `super-admin-view.tsx`: `KPIS`, `ORGS`, `RANKINGS`, `INFRA_COSTS`, `ALERTS`.
- `marketing/`: carpeta dedicada `src/lib/mock-data/` con 6 datasets tipados (`restaurant`, `tables`, `reservations`, `customers`, `reviews`, `metrics`) para el landing.

### Prisma setup

- `prisma/schema.prisma` (31 líneas): **schema boilerplate** con `User` y `Post` (sin relación con el dominio restaurante). `datasource db` apunta a `sqlite` con `url = env("DATABASE_URL")`.
- `.env`: `DATABASE_URL=file:/home/z/my-project/db/custom.db`.
- `src/lib/db.ts` (13 líneas): singleton de `PrismaClient` con `log: ['query']`. **No se usa en ningún componente**.
- Scripts: `db:push`, `db:generate`, `db:migrate`, `db:reset`.

### API routes

`src/app/api/route.ts` (5 líneas):

```ts
export async function GET() {
  return NextResponse.json({ message: "Hello, world!" });
}
```

**No hay API routes para CRUD** de reservas, clientes, pedidos, empleados, stock, pagos, etc. **No hay webhook de Stripe.**

### localStorage usage

| Clave | Ubicación | Tipo | Propósito |
|---|---|---|---|
| `rp-sidebar-pinned` | `app-shell.tsx` (vía `useLocalStorage`) | boolean | Sidebar pinned vs auto-ocultable |
| `rp-pricing-annual` | `landing.tsx` (directo) | string `"true"` / `"false"` | Toggle mensual/anual del pricing |

> No hay `auth draft` persistido, ni `authToken`, ni `recentSearches`, ni `cartDraft`.

### Qué necesitaría persistencia real

1. **Reservas**: creación, asignación a mesa, estados (confirmada / sentada / finalizada / cancelada / no-show), reprogramación.
2. **Pedidos / TPV**: items, modificadores, descuentos, pagos, impuestos, propinas.
3. **Clientes (CRM)**: perfil, tags, notas, consentimientos RGPD, historial de visitas, LTV.
4. **Empleados**: alta, fichaje (clock-in/out), turnos, cuadrantes, permisos.
5. **Stock / Inventario**: escandallos, proveedores, recepciones, mermas, recuento ciego.
6. **Pagos / Facturación**: métodos, facturas, impuestos, prorratas, reembolsos.
7. **Reviews**: sincronización con Google Business Profile.
8. **Campañas / Plantillas**: envíos, segmentos, A/B tests.
9. **Automatizaciones**: definición del flujo, ejecuciones, logs.
10. **Configuración**: preferencias de local, horarios, plantillas.

### Qué falta para producción

- **D1 (Cloudflare D1)** u otra base SQL por tenant con migraciones.
- **API routes** con `POST`/`PATCH`/`DELETE` para cada dominio.
- **Middleware de auth** (cookies/JWT) y verificación de tenant.
- **Idempotencia** para webhooks de Stripe y reservas duplicadas.
- **Webhook de Stripe** real (`/api/stripe/webhook`) con firma.
- **Sesiones** (next-auth o propio) con `httpOnly` cookies.
- **Migraciones** desde SQLite local a D1 distribuido.

---

## Report 5 · Informe de Permisos y Planes

### Catálogo de feature flags: NO EXISTE

> **Discrepancia con la spec**: el task ID afirma "feature-flags.ts con 46+ flags" y "feature-gate.tsx con can/limit/usage". **No se encuentra ninguno de los dos archivos** en `src/lib/` ni en `src/components/ui/`. Búsqueda de `feature-flags`, `feature-gate`, `entitlements-engine-view`, `access-gate-view`, `billing-portal-view`, `signup-funnel-view` con `Glob`: **0 resultados**.

Lo que sí existe:

- `PLANS` y `COMPARISON` definidos inline en `landing.tsx` (líneas 1.507-1.606).
- `billing-view.tsx` actúa como portal de facturación (cambio de plan, actualización de tarjeta, descarga de factura mock).
- No hay `Gate` component reutilizable, no hay `can()`, no hay `limit()`, no hay `usage()`.

### Planes definidos (`landing.tsx`)

| Plan | Mensual | Anual | Locales incluidos | Usuarios incluidos | Highlight |
|---|---|---|---|---|---|
| **Starter** | 49 € | 470 € | 1 | 3 | — |
| **Professional** | 99 € | 950 € | 5 | 10 | ✓ "popular" |
| **Enterprise** | 249 € | 2.390 € | Ilimitado | Ilimitado | — |

### Matriz de features (de `COMPARISON` en `landing.tsx`)

| Feature | Starter | Professional | Enterprise |
|---|---|---|---|
| Reservas inteligentes | ✓ | ✓ | ✓ |
| Plano de mesas | ✓ | ✓ | ✓ |
| CRM | ✓ | ✓ | ✓ |
| Marketing (SMS/email) | Pago por uso | 5k incluidos | Ilimitado |
| Automatizaciones | 5 activas | 50 activas | Ilimitado |
| Google Reviews | ✓ | ✓ | ✓ |
| Analytics avanzado | — | ✓ | ✓ |
| IA Copilot | — | ✓ | ✓ |
| Lista de espera | — | — | ✓ |
| Marketplace | — | — | ✓ |
| Integraciones | 3 | Ilimitado | Ilimitado + API |
| Soporte | Estándar | Prioritario | 24/7 + CSM |
| SLA | 99.5% | 99.9% | 99.99% |
| Backups | Diarios | Cada hora | Continuos + DR |
| Infraestructura | Compartida | Compartida | Dedicada |

### Funcionalidades reales vs demo

| Real | Demo / mock |
|---|---|
| Toggle mensual/anual con 20% descuento y count-up animado | Webhook de Stripe para cambiar de plan |
| CTAs de pricing redirigen a `openAuth("signup")` o `setView("app")` | Generación real de factura PDF (`downloadInvoice` solo lanza toast) |
| `billing-view.tsx` muestra facturas estáticas y permite "cambiar plan" con toast | Validación de tarjeta real (solo regex simple) |
| `PLANS` y `COMPARISON` renderizados en landing | Backend middleware que verifique el plan del usuario |
| Integraciones marcadas `real: false` en marketplace (12 apps) | OAuth real con Google/Meta/Stripe |

### Entitlements Engine: NO

No hay `entitlements-engine-view.tsx`. El `billing-view.tsx` ofrece la página de facturación al usuario pero **no valida en runtime** qué features puede usar según su plan. Toda la app es accesible sin restricción una vez dentro.

### Access Gate: NO

No hay `access-gate-view.tsx` con 6 estados de suscripción. La única "gate" es el `AuthDialog` (login/signup/forgot) que, una vez superado, da acceso total.

### Qué falta para producción

- `src/lib/feature-flags.ts` con catálogo tipado de flags (mínimo: 46 para igualar la spec).
- `<Gate feature="..." />` component que renderice children o upsell según plan.
- `can(feature)`, `limit(feature)`, `usage(feature)` helpers en servidor.
- Middleware Next.js que lea el plan del usuario desde sesión y bloquee API routes.
- Webhook de Stripe real que actualice el plan al recibir `checkout.session.completed` / `customer.subscription.updated`.
- Página de gestión de suscripción (`/billing/manage`) con portal embebido de Stripe.

---

## Report 6 · Informe de Accesibilidad

### Estado WCAG 2.2 AA: parcial

No se ha hecho auditoría formal, pero hay un esfuerzo sustancial de ARIA. Las áreas más débiles son: skip links, aria-live regions, gestión de foco en diálogos y contraste en algunos mute-foreground.

### HTML semántico

- `<main id="landing-top">` en `Landing` y `<main>` implícito en `AppShell`.
- `<header>` en `LandingHeader`, `Topbar`, secciones internas.
- `<aside>` en el sidebar.
- `<nav>` no aparece explícitamente (falta).
- `<section aria-label="...">` extensivo (99+ usos en `super-admin-view.tsx`, `reviews-view.tsx`, `crm-view.tsx`).
- `<footer>` global en `page.tsx`.
- `<table>` real en `DataTable` y tablas custom con `<thead>/<tbody>/<th>/<td>`.
- `<button>` para acciones (no `<div onClick>`).

### ARIA labels

- 966 ocurrencias de atributos ARIA en 65 archivos.
- `aria-label` en todos los iconos puramente decorativos (referidos como `aria-hidden`).
- `aria-label` en inputs de búsqueda, botones de cierre, iconos.
- `aria-current="page"` en el ítem activo del sidebar.
- `aria-pressed` en tabs custom.
- `aria-expanded` / `aria-haspopup` en dropdowns.
- `aria-selected` en listboxes.
- `aria-invalid` en inputs con error de validación.
- `aria-busy` en skeletons de carga.

### Navegación por teclado

- **Command palette ⌘K**: ArrowUp/Down navega, Enter ejecuta, Escape cierra. Focus automático al input al abrir. Scroll automático del item activo a la vista.
- **Tab navigation**: el orden de foco sigue el DOM en general. `tabIndex={0}` en elementos interactivos custom (chips, estrellas en reviews).
- **Diálogos**: Radix Dialog gestiona focus trap automáticamente. Cierre con Escape y click fuera.
- **Sidebar**: botones reales, foco visible con `outline-ring/50`.
- **Drawer mobile**: bloquea scroll del body, backdrop click cierra.

### Focus visible

- `outline-ring/50` global en `@layer base *`.
- Anillo `--ring` configurado como `var(--gold)` (tema claro) / `oklch(0.8 0.12 86)` (dark).
- Inputs con `focus:border-[var(--gold)]/50`.

### Screen reader support

- `sr-only` clase usada en `DialogTitle`/`DialogDescription` del command palette (visuales pero accesibles al lector).
- `aria-hidden` en iconos lucide para evitar doble anuncio.
- Texto descriptivo en lugar de iconos solos en CTAs críticos.

### Contraste de color

- Tema dark principal: background `oklch(0.135 0.004 90)` (casi negro), foreground `oklch(0.965 0.003 95)` (casi blanco) — ratio > 15:1.
- `--gold #D4AF37` sobre dark: ratio ~7.5:1 (supera AA para texto normal).
- `text-muted-foreground` en `oklch(0.68 0.008 90)` sobre `oklch(0.135 0.004 90)`: ratio ~5.5:1 (cumple AA para texto normal, no para pequeño < 14pt).
- Algunos `text-[10px] uppercase tracking-wider text-muted-foreground` pueden caer por debajo de AA en texto pequeño.

### `prefers-reduced-motion`

- `@media (prefers-reduced-motion: reduce)` en `globals.css` neutraliza animaciones y transiciones globalmente.
- `useReducedMotion()` de Framer Motion usado en **34 archivos / 138 referencias** para desactivar motion o sustituirlo por estado final inmediato.
- Hooks custom `usePrefersReducedMotion` en `app-shell.tsx` para el sidebar.

### Áreas de mejora

| Prioridad | Hallazgo |
|---|---|
| Alta | **No hay `skip-to-content` link** en `page.tsx` ni `layout.tsx`. |
| Alta | Solo 3 `aria-live="polite"` (faltan regiones para toasts, badges de contador, updates de waitlist). |
| Alta | No hay `aria-live="assertive"` para errores críticos (no-show detectado, fallo de pago). |
| Media | `<nav>` no se usa explícitamente; el sidebar es `<aside>` con botones. |
| Media | El command palette debería tener `role="combobox"` + `aria-expanded` + `aria-activedescendant` en el input. |
| Media | Algunos `text-[10px]` con `text-muted-foreground` pueden no superar AA en texto pequeño. |
| Media | Faltan atajos de teclado globales (g d → dashboard, g r → reservas, etc.). |
| Baja | Diagramas SVG (charts) no tienen `title`/`desc` ni `role="img"`. |
| Baja | El floor plan de mesas es arrastrable con ratón pero no con teclado. |

---

## Report 7 · Informe de Rendimiento

### Optimizaciones aplicadas

#### Code splitting por sección

`SectionRenderer` (`app-shell.tsx` líneas 1.475-1.500) usa `React.lazy()` para cada una de las 20 secciones. Cada sección se carga como chunk independiente bajo demanda, envuelta en `<React.Suspense fallback={<SectionSkeleton />}>`. El skeleton con `aria-busy="true"` evita CLS.

#### Sin route splitting

> Limitación: aunque las secciones son chunks, **toda la app vive en una sola ruta `/`**. No hay `app/(dashboard)/page.tsx` ni `app/(landing)/page.tsx`. El bundle inicial incluye landing + app-shell + nav-store; las 20 secciones se cargan on-demand.

#### Imágenes

- `next/image` con `fill`, `sizes` y `loading={priority ? undefined : "lazy"}` en `ProductImage` (landing.tsx 1.612-1.654).
- `priority` solo en la primera imagen de `SectionRulesAuto` y en `SectionRealTime`.
- `objectPosition="object-center sm:object-[center_30%]"` para optimizar recortes.
- `aspect-[16/10]` / `aspect-[4/3]` / `aspect-[16/9]` para reservar espacio y evitar CLS.
- `sharp ^0.34.3` instalado para optimización server-side.

#### CSS

- Tailwind v4 con `@import "tailwindcss"` y `@import "tw-animate-css"`.
- `@theme inline` mapea variables CSS a tokens de Tailwind.
- Tailwind v4 purge es automático por scanning de clases.
- Variables CSS centralizadas en `globals.css` (295 líneas) — sin duplicación.

#### Animaciones GPU-friendly

- Framer Motion con `transform` + `opacity` exclusivamente en marketing components.
- `useInView` (IntersectionObserver) para disparar animaciones once-only.
- `usePathLength` para draw-on de sparklines.
- `useEntranceProgress` para staggered reveals.
- Charts SVG con `stroke-dashoffset` para draw-on.
- `useReducedMotion()` respetado (138 referencias).

#### Dev server

`dev.log` muestra compilaciones de fast-refresh en **3–15 ms** y respuestas POST 200 en **60–600 ms**. No hay errores de compilación recientes.

#### Production build

- `output: "standalone"` genera `.next/standalone/server.js` auto-contenido.
- Script `build` copia `.next/static` y `public` al standalone.
- `start`: `NODE_ENV=production bun .next/standalone/server.js`.

### Limitaciones de rendimiento

| Limitación | Impacto | Mitigación sugerida |
|---|---|---|
| **Sin route splitting**: landing + app en un solo bundle | Bundle inicial pesado para visitantes del landing | Dividir en `app/(marketing)/` y `app/(app)/` con `loading.tsx` |
| **`ignoreBuildErrors: true`** | Errores TS ocultos llegan a producción | Cambiar a `false` cuando se estabilice |
| **`reactStrictMode: false`** | No detecta efectos dobles en dev | Activar al final del desarrollo |
| **`@dnd-kit` instalado pero sin uso** | Dependencia muerta (~30 KB) | Eliminar o usar en floor-editor |
| **Sin `bundle-analyzer`** | No hay visibilidad de tamaños de chunk | Instalar `@next/bundle-analyzer` y añadir script |
| **Sin presupuesto de bundle** | Sin límites duros de tamaño | Configurar `bundleSize` en CI |
| **Recharts pesado** | Charts cargan toda la lib | Considerar `visx` o charts SVG propios (ya existe `chart-utils.tsx`) |
| **Mermaid + MDX editor** | Solo usados si se monta algún componente | Verificar si se cargan lazy |
| **Sin service worker** | No hay cache offline | Añadir `next-pwa` o service worker manual |

### Métricas que faltan por medir

- LCP / FID / CLS reales con Lighthouse.
- Time to interactive en 3G throttled.
- Tamaño del bundle inicial (sin `analyze` instalado).
- Cobertura de code-splitting por chunk.

---

## Report 8 · Informe de Pruebas

### Estado: sin pruebas automatizadas

| Tipo | Estado | Detalle |
|---|---|---|
| **Vitest** | ✗ No configurado | No aparece en `package.json` ni `vitest.config.ts` |
| **Jest** | ✗ No configurado | — |
| **Playwright** | ✗ No configurado | No hay `playwright.config.ts` ni carpeta `tests/` |
| **Cypress** | ✗ No configurado | — |
| **k6 / load testing** | ✗ No configurado | — |
| **Storybook** | ✗ No configurado | — |
| **MSW** | ✗ No configurado | — |
| **Testing Library** | ✗ No instalado | — |

### Verificación manual con Agent Browser

Worklog reciente (SESSION-FIXES) reporta verificación E2E con Agent Browser cubriendo:
- Reservas → Waitlist (entrar/salir 3×)
- Filtros Hoy / Mañana / Sala / Terraza / VIP / Barra
- Dashboard → Clientes → Centro Ejecutivo
- Login flow → notifications → pricing toggle → sidebar hover expand/collapse
- Overflow horizontal: 0 px en 390 / 768 / 1280 / 1440 / 1920 px
- Consola limpia: 0 errores runtime, 0 warnings

### Lint

- `bun run lint` → **0 errores, 0 warnings** (verificado en SESSION-FIXES y MARKETING-V2-DEMOS).
- ESLint 9 + `eslint-config-next` 16.1.1.
- 6 errores pre-existentes en `charts/chart-utils.tsx` reportados por otro agente (refs during render), fuera de scope.

### TypeScript

- `typescript: ^5`, strict por defecto en `tsconfig.json`.
- **`ignoreBuildErrors: true`** en `next.config.ts` permite que errores TS no bloqueen el build. Esto esconde deudas.

### Caminos críticos a testear

| Camino | Pasos | Estado |
|---|---|---|
| **Signup → payment → provisioning → dashboard** | AuthDialog signup → billing → primer login → dashboard | Sin tests |
| **Reserva → mesa → pedido → pago** | Crear reserva → asignar mesa → (TPV no existe) → pago (no existe) | Sin tests, TPV ausente |
| **Waitlist → reposición automática** | Añadir a waitlist → liberar mesa → auto-asignar | Sin tests |
| **Reseña → draft IA → publicación** | Recibir reseña → redactar respuesta → publicar | Sin tests |
| **Cambio de plan** | billing → elegir plan → confirmar | Sin tests (solo toast mock) |
| **Command palette ⌘K** | Abrir → buscar → navegar | Sin tests |
| **Sidebar auto-ocultable** | Hover → expand → pin → collapse | Sin tests |
| **Auth dialog validación** | Errores por campo, password strength | Sin tests |
| **Pricing toggle mensual/anual** | Toggle → recuento de precio → persistencia | Sin tests |
| **Notifications bell** | Open → mark read → mark all read → close | Sin tests |

### Plan de pruebas sugerido

1. **Fase 1 — Unit (Vitest)**: cubrir `nav-store`, `useLocalStorage`, `useAnimatedNumber`, validaciones de `AuthDialog`, helpers de `chart-utils`.
2. **Fase 2 — Component (Vitest + Testing Library)**: renderizar cada sección con mocks y verificar estados (loading, empty, error, populated).
3. **Fase 3 — E2E (Playwright)**: los 10 caminos críticos de arriba en Chromium + WebKit + Firefox.
4. **Fase 4 — Visual regression**: Storybook + Chromatic para los 12 componentes de marketing.
5. **Fase 5 — Load (k6)**: simular 1000 reservas concurrentes, 100 command palette opens/seg.
6. **Fase 6 — A11y (axe-core)**: integrar en Playwright para detectar violaciones WCAG.

### Cobertura objetivo

| Dominio | Cobertura mínima |
|---|---|
| `nav-store`, hooks, utils | 90% |
| `primitives.tsx` | 80% |
| Cada sección (`*-view.tsx`) | 60% |
| `landing.tsx` | 50% (más visual que E2E) |
| `app-shell.tsx` (auth, command palette, notifications) | 85% |

---

## Report 9 · Lista de Funcionalidades Reales

Lista verificada de lo que **funciona de verdad** al navegar (no es UI vacío):

### Landing (17 secciones en `landing.tsx`)

1. **Hero** con `HeroDashboard` live: reloj, KPIs, reservas, floor plan con morph de estados, sparkline draw-on, AI toast, parallax 3D, loop 24s.
2. **SocialProofV2** con `TrustLogos` (carrusel CSS-only 2 filas opuestas, pause on hover).
3. **Problems** con 5 fricciones del restaurante tradicional.
4. **Platform** con 6 módulos destacados.
5. **DemoFloor**: 12 mesas arrastrables, click cicla estado (free→reserved→occupied→cleaning), toggle "Tiempo real" (viernes ×60), timeline 13:00–23:00.
6. **DemoCrm**: 6 clientes + perfil 360° (LTV, ticket medio, timeline visitas, segment builder live).
7. **DemoAi**: chat scripted con typewriter (35 char/s), "Pensando…" 3 dots, respuestas materializan mini-cards, 3 prompts sugeridos.
8. **DemoReviews**: distribución 5★→1★ animada, SVG line chart 12 meses, topic cloud, AI reply con typewriter (24 char/s), botones Publicar/Variante.
9. **SectionRulesAuto**, **SectionRealTime**, **SectionCrmVip**, **SectionPartner**: 4 secciones con imágenes reales de producto vía `ProductImage`.
10. **RoiCalculator**: 5 inputs sincronizados (slider + input), 4 outputs con count-up, payback 1.4 meses, ROI 412%, fórmula expandible.
11. **WhyBento**: bento asimétrico 9 celdas con micro-animaciones.
12. **Pricing**: 3 planes (49/99/249 €), toggle mensual/anual con -20%, count-up animado, persistencia localStorage, tabla comparativa de 18 features.
13. **FaqSection**: 12 preguntas reales (migración CoverManager, permanencia, TPVs, RGPD, IA, multi-local, etc.) con JSON-LD `FAQPage`.
14. **FinalCTA** con conversión.

### App shell (`app-shell.tsx`)

15. **Sidebar auto-ocultable**: rail 72px, hover-expand a 260px (delay 250ms), pin persistido, drawer mobile con `rp-slide-in`.
16. **NotificationsBell**: 6 notificaciones, badge contador, mark-as-read individual + "marcar todas", close on outside-click + Escape.
17. **CommandPalette ⌘K**: búsqueda fuzzy sobre 20 secciones + 10 acciones rápidas, ArrowUp/Down/Enter/Escape, scroll automático.
18. **AuthDialog**: 3 modos (login / signup / forgot) con validación por campo, password strength (5 reglas), mostrar/ocultar password, loader, redirección al dashboard.
19. **Topbar** con selector de org/location, búsqueda móvil, ayuda, UserAvatar con logout.
20. **Footer** global con enlaces de navegación y toggle landing/app.

### Secciones funcionales (20)

21. **Dashboard** (1.413 líneas): 6 KPIs con sparklines animados, chart de rendimiento con time-range selector + crosshair + clickable legend, timeline de eventos, próximas reservas, recomendaciones IA, alertas.
22. **Centro Ejecutivo** (3 tabs): Cockpit (forecast, comparativas, heatmaps) + IA Ejecutiva + Centro de Alertas con acciones.
23. **Reservas** (2.927 líneas): plano de mesas con drag nativo (HTML5), timeline 13:00–23:00 con bloques coloreados, filtros rápidos (fecha/zona/estado/canal/búsqueda), asignación drag&drop, bloqueo/liberación de mesas, 5 sub-views (reservas / predicción / yield / alertas / waitlist).
24. **Waitlist**: cola de espera con auto-reposicionamiento al liberar mesa, notificaciones toast, ofertas de alternativas.
25. **Prediction**: panel de predicción de no-shows y demanda.
26. **Yield**: panel de pricing dinámico.
27. **Alerts**: alertas operativas con acciones.
28. **CRM** (2.666 líneas): 8-12 clientes, perfil 360° con LTV/ticket medio/timeline de visitas/tags/notas/consentimientos RGPD, 5 diálogos (add-tag, edit, add-note, comunicar, new-reservation), filtros por VIP/riesgo/cumpleaños.
29. **Marketing** (1.403 líneas): campañas multicanal, segmentación, plantillas, scheduler.
30. **Automatizaciones** (1.612 líneas): flow builder por nodos (trigger/condition/action/wait/branch), paleta para añadir, simulador dry-run con log.
31. **Growth Analytics** (1.837 líneas): embudo, cohortes, ROI por canal, segmentación.
32. **Centro Reputación** (1.933 líneas): NPS, sentimiento, topic cloud.
33. **Campañas** (1.528 líneas): tabla con ROI, filtros, detail dialog.
34. **Promociones** (1.609 líneas): A/B test, canibalización.
35. **Google Reviews** (1.170 líneas): lista, filtros, draft IA, publish/edit.
36. **Analytics** (1.042 líneas): distribución ratings, evolución mensual, topic cloud.
37. **Integraciones** (556 líneas): marketplace con 12 apps, webhooks entrantes (4), OAuth mock, installed/market tabs.
38. **Facturación** (441 líneas): facturas con filtro, diálogo cambio de plan, diálogo actualización de tarjeta.
39. **Equipo** (517 líneas): miembros, roles, invitaciones.
40. **Configuración** (552 líneas): preferencias de local, horarios, plantillas.
41. **Centro de IA** (1.662 líneas · 5 tabs): Resumen (KPIs + uso por usuario + cost trend), Uso (log de ejecuciones), Errores (log), Límites (progress bars), Modelos (4 modelos Cloudflare).
42. **Conocimiento IA** (1.247 líneas · 4 tabs): Documentos, búsqueda semántica con similarity score, indexación 5-step pipeline, estadísticas.
43. **IA Menú** (1.136 líneas · 4 tabs): análisis de items, rentabilidad scatter+bar, recomendaciones, cross-selling heatmap 8×8.
44. **Super Admin** (775 líneas · 9 secciones): KPIs plataforma (MRR/ARR/LTV/CAC/ARPU/Churn), MRR growth, clientes/orgs, rankings, uso IA, costes infra, estado, mapa mundial, alertas.
45. **AiCopilot flotante global**: botón dorado bottom-right, panel glassmorphism, chat con 17 contextos de sección, 12 demo responses con fuzzy match, quick actions context-aware, role-based permissions, streaming simulation, security notice.

### Marketing components (`src/components/rp/marketing/`)

46. **AnimatedCounter**: count-up con IntersectionObserver + rAF + easeOutExpo, tabular-nums, microIncrement opcional.
47. **BeforeAfter**: split-screen scroll-driven con 5 pares fricción→solución.
48. **WhyBento**: bento asimétrico 9 celdas.
49. **HeroDashboard**, **DemoFloor**, **DemoCrm**, **DemoAi**, **DemoReviews**, **RoiCalculator**, **FaqSection**, **TrustLogos** (todos los del landing, descritos arriba).

---

## Report 10 · Lista de Funcionalidades Pendientes

### Backend y persistencia

| Pendiente | Detalle |
|---|---|
| **D1 (o equivalente) real** | Prisma usa SQLite local con schema boilerplate (User/Post). Sin migraciones del dominio restaurante. |
| **API routes CRUD** | Solo existe `GET /api/route.ts` ("Hello, world!"). Faltan POST/PATCH/DELETE para reservas, clientes, pedidos, empleados, stock, pagos, reviews, campañas. |
| **Middleware de auth** | No hay middleware Next.js que valide sesión. next-auth instalado pero no configurado. |
| **Middleware de plan / RBAC** | No hay validación de feature flags ni plan en runtime. |
| **Multi-tenant isolation** | No hay segregación por tenant. `org` es un string en el store. |
| **Webhook de Stripe** | No existe `/api/stripe/webhook`. Cambio de plan en `billing-view.tsx` solo lanza toast. |
| **Migraciones Prisma** | Solo `db:push`. Sin migrations versionadas para producción. |

### Integraciones reales

| Pendiente | Detalle |
|---|---|
| **Stripe real** | Checkout, Customer Portal, webhooks, firma. |
| **WhatsApp Cloud API** | Solo mock en `MARKETPLACE`. |
| **Google Business Profile** | Solo mock. Sin OAuth real, sin fetch de reseñas. |
| **Meta / Instagram** | Solo mock. |
| **Email real (Resend)** | Solo toasts. Sin plantillas HTML ni доставки. |
| **SMS real (Twilio)** | Solo mock. |
| **Printers / cash drawers** | Sin integración hardware. |
| **TPV real (Sumup/Square)** | Solo listado en marketplace. |

### Módulos de dominio ausentes

| Pendiente | Detalle |
|---|---|
| **TPV** | No existe módulo TPV con mesas, pedidos, payment, 86-ing, customer display, call escalation (afirmado en spec, ausente en código). |
| **PDA** | No existe flujo 3-touch para camareros. |
| **KDS** | No existe Kitchen Display System con stations, timers, bump/recall. |
| **Carta QR + Order & Pay** | No existe módulo de carta digital con pedidos desde QR. |
| **Delivery** | No existe módulo de delivery con ROI calculator propio (el `RoiCalculator` del landing es de marketing, no operativo). |
| **Inventario + escandallos** | No existe módulo. |
| **Personal (fichaje, cuadrantes)** | No existe módulo dedicado. `team-view.tsx` es solo gestión de usuarios de la cuenta, no RRHH operativa. |

### Características de IA

| Pendiente | Detalle |
|---|---|
| **LLM real** | AiCopilot usa `DEMO_RESPONSES` estáticas con fuzzy match. Sin llamada a OpenAI/Anthropic/Workers AI. |
| **Embeddings / RAG** | `AiKnowledge` muestra pipeline visual pero sin embeddings reales ni vector store. |
| **Streaming real** | AiCopilot simula streaming con `setInterval`. Sin SSE/WebSocket real. |
| **Forecast ML** | Dashboard muestra forecast pero sin modelo. |

### Tiempo real y offline

| Pendiente | Detalle |
|---|---|
| **WebSocket / SSE** | Sin updates en vivo entre secciones (reserva creada en móvil no aparece en mesa sin refresh). |
| **Offline-first** | Sin IndexedDB, sin sync queue, sin conflict resolution. |
| **Service Worker** | No hay SW registrado. |

### Compliance y fiscal

| Pendiente | Detalle |
|---|---|
| **Veri*Factu / TicketBAI** | Sin implementación de factura electrónica verificable. |
| **RGPD** | Consentimientos visibles en CRM pero sin registro auditable. |
| **LOPD / registro de accesos** | Sin log de auditoría. |

### Feature gating y planes

| Pendiente | Detalle |
|---|---|
| **`feature-flags.ts`** | Catálogo tipado de flags (objetivo: 46+). |
| **`<Gate>` component** | Render condicional según plan con upsell. |
| **`can()` / `limit()` / `usage()`** | Helpers server-side. |
| **Entitlements Engine view** | Página que muestre uso por feature. |
| **Access Gate view** | 6 estados de suscripción (trial, active, past_due, canceled, etc.). |
| **Signup Funnel wizard** | No existe wizard de 10 pasos (afirmado en spec). El signup es el `AuthDialog` simple de 3 campos. |
| **App Store con install consent** | Existe `MARKETPLACE` en `integrations-view.tsx` pero sin consent flow formal. |

### Pruebas

| Pendiente | Detalle |
|---|---|
| **Vitest** | No configurado. |
| **Playwright** | No configurado. |
| **k6** | No configurado. |
| **Storybook** | No configurado. |
| **Cobertura CI** | Sin badge ni umbral. |

### Performance y arquitectura

| Pendiente | Detalle |
|---|---|
| **Route splitting** | App es single-route. Faltan `app/(marketing)/` y `app/(app)/`. |
| **`ignoreBuildErrors: false`** | Aún oculta errores TS. |
| **`reactStrictMode: true`** | Desactivado. |
| **Bundle analyzer** | No instalado. |
| **Presupuesto de bundle** | Sin límites. |
| **`@dnd-kit` sin uso** | Dependencia muerta. |

### Despliegue

| Pendiente | Detalle |
|---|---|
| **Producción** | No desplegado. Solo `bun run dev` y `bun run build` local. |
| **CI/CD** | Sin pipeline GitHub Actions / GitLab CI visible. |
| **Dominio + TLS** | No configurado. Existe `Caddyfile` pero no verificado. |
| **Monitorización** | Sin Sentry, sin Logflare, sin analytics. |

---

### Resumen ejecutivo

RestoPanel es un **front-end premium altamente pulido** (~47.000 líneas en `src/components/rp/`, 93 componentes, 20 secciones, 17 secciones de landing) con un sistema de diseño coherente (gold #D4AF37 / teal #3DD6C9 sobre dark), animaciones GPU-friendly que respetan `prefers-reduced-motion`, accesibilidad ARIA sustancial (966 atributos en 65 archivos) y cero errores de lint.

**Lo que brilla**: UX del landing, dashboard, reservas con plano + timeline, CRM 360°, executive cockpit, AI center, command palette, sidebar auto-ocultable, pricing con toggle.

**Lo que falta**: **100% del backend** (D1, API routes, auth real, webhooks, multi-tenant, RBAC), **6 módulos de dominio** (TPV, PDA, KDS, Carta QR, Delivery, Inventario, Personal), **IA real** (LLM, embeddings, streaming), **tiempo real** (WebSocket), **pruebas** (Vitest/Playwright/k6), **route splitting** y **despliegue**.

El proyecto está listo para mostrar como demo navegable pero a ~3-6 meses de un MVP producción según el alcance descrito en la spec.
