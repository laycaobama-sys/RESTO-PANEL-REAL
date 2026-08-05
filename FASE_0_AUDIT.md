# FASE_0_AUDIT.md
## RestoPanel — Auditoría Forense y Erradicación de Modo Demo

### Fecha: 2026-08-01
### Commit: 3f4db93

---

## 1. INVENTARIO DEL PROYECTO

### Framework y versión
- **Framework:** Next.js 16.1.1 (App Router)
- **Node:** v24.18.0
- **Package manager:** bun (bun.lock)
- **TypeScript:** 5.x (strict)
- **Prisma:** 6.11.1

### Árbol de carpetas (resumen)
```
src/
├── app/
│   ├── api/          # 16 API routes
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Single page (SPA)
├── components/
│   ├── rp/           # 169 componentes RestoPanel
│   ├── ui/           # 49 componentes shadcn/ui
│   └── admin/        # 4 componentes SuperAdmin
├── lib/
│   ├── auth.ts       # bcrypt + JWT
│   ├── rbac.ts       # RBAC
│   ├── entitlements.ts
│   ├── db.ts         # Prisma client
│   ├── hooks/        # use-api.ts
│   ├── services/     # stripe, ai-provider, email, cloudflare, print, audit, etc.
│   └── offline/      # IndexedDB + sync
└── middleware.ts     # Rate limiting + security headers
```

### Páginas (1)
- `/` — Single page SPA (landing + app shell)

### Layouts (1)
- `src/app/layout.tsx`

### API Routes (16)
| Ruta | Auth | Descripción |
|------|------|-------------|
| `/api/auth/register` | Pública | Registro |
| `/api/auth/login` | Pública | Login |
| `/api/admin/auth/login` | Admin 2FA | SuperAdmin login |
| `/api/admin/2fa/setup` | Admin | TOTP setup |
| `/api/stripe/webhook` | Stripe sig | Webhook handler |
| `/api/stripe/checkout` | ✅ RBAC | Stripe checkout |
| `/api/orders` | ✅ RBAC | Pedidos CRUD |
| `/api/tickets` | ✅ RBAC | Tickets CRUD |
| `/api/payments` | ✅ RBAC | Pagos CRUD |
| `/api/cash-sessions` | ✅ RBAC | Caja CRUD |
| `/api/reservations` | ✅ RBAC | Reservas CRUD |
| `/api/tables` | ✅ RBAC | Mesas CRUD |
| `/api/employees` | ✅ RBAC | Empleados CRUD |
| `/api/ai/chat` | ✅ RBAC | IA chat |
| `/api/email/send` | ✅ RBAC | Email send |
| `/api/route.ts` | Pública | Health check |

### Modelos Prisma (51)
Organization, Brand, Venue, Member, Role, Permission, RolePermission, MemberRole, Subscription, Plan, Feature, PlanFeature, EntitlementOverride, UsageCounter, Addon, SubscriptionAddon, Invoice, AuditEvent, OutboxEvent, Session, Zone, Table, Guest, Reservation, WaitlistEntry, Order, OrderItem, Ticket, Payment, CashSession, MenuItem, Category, ModifierGroup, Modifier, StockItem, Recipe, RecipeIngredient, Supplier, PurchaseOrder, Employee, Shift, TimeClock, LoyaltyProgram, LoyaltyStamp, Campaign, Review, Automation, AutomationRun, KdsStation, KdsTicket, Integration, Device

### Scripts
- `dev`: `next dev -p 3000`
- `build`: `next build` (standalone)
- `start`: `node .next/standalone/server.js`
- `lint`: `eslint .`
- `db:push`: `prisma db push`
- `db:generate`: `prisma generate`
- `db:migrate`: `prisma migrate dev`

### Variables de entorno referenciadas
DATABASE_URL, JWT_SECRET, STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY, GLM_API_KEY, QWEN_API_KEY, GOOGLE_AI_API_KEY, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

---

## 2. CAZA DE DEMO

### Resumen de hallazgos

| Patrón | Coincidencias | Criticidad |
|--------|--------------|------------|
| `mock`/`Mock` | 193 | P1 |
| `demo`/`Demo` | 968 | P1 |
| `fake`/`Fake` | 7 | P2 |
| `placeholder` (no HTML attr) | 10 | P3 |
| `lorem`/`ipsum` | 0 | ✅ |
| `TODO`/`FIXME`/`HACK` | 0 | ✅ |
| `console.log`/`warn`/`error` | 0 | ✅ |
| `alert()`/`confirm()` | 0 | ✅ |
| `href="#"` | 3 (cloudops, dev-portal, signup-funnel) | P1 |
| `onClick={() => {}}` | 0 | ✅ |
| `Coming soon`/`Próximamente` | 0 | ✅ |
| `const X = [` en rp/ | 355 | P0 |
| `Math.random()` en rp/ | 64 | P0 |
| `DemoBadge` | 0 | ✅ |
| `mockResponse` | 0 | ✅ |

### Hallazgos críticos (P0)

#### Arrays hardcodeados (355 ocurrencias en componentes rp/)
Archivos con más arrays:
- `exec-cockpit.tsx`: 15 arrays
- `growth-reputation.tsx`: 15 arrays
- `analytics-view.tsx`: 14 arrays
- `cc-org-detail.tsx`: 11 arrays
- `saas-metrics-view.tsx`: 11 arrays
- `super-admin-v2-view.tsx`: 10 arrays
- `landing.tsx`: 10 arrays
- + 100 archivos más

**Acción:** Reemplazar cada array de datos de negocio por `useAPI("/api/...")`.

#### Math.random() para datos (64 ocurrencias)
- `autopilot-view.tsx`: genera PIN aleatorio
- `cloudops-observability.tsx`: genera IDs de incidencias
- `demo-floor.tsx`: selección aleatoria de mesas
- `cc-executive-ai.tsx`: latencia y respuestas aleatorias
- `floor-iot.tsx`: RSSI aleatorio
- `exec-cockpit.tsx`: datos de gráfica
- `exec-alerts.tsx`: timestamps aleatorios

**Acción:** Eliminar Math.random() para datos de negocio. Mantener solo para IDs de cliente (UUID).

### Hallazgos P1

#### "demo" en texto visible (968 ocurrencias)
- `page.tsx:44`: "Datos demo · producto navegable"
- `page.tsx:77`: "demo navegable"
- `staff-advanced-view.tsx:1341`: "Demo: el fichaje se simulará"
- `menu-engineering-view.tsx:815`: "Datos demo · navegable"
- `billing-portal-view.tsx:1519`: "Dato demo: esta vista"
- `autopilot-view.tsx:1326`: "Demo: abre un diálogo"
- `health-score-view.tsx:114`: "Ofrecer demo de features"

**Acción:** Eliminar todas las referencias a "demo" en texto visible.

#### "mock" en comentarios y código (193 ocurrencias)
- `staff-advanced-view.tsx:120`: "Constants & mock data"
- `menu-engineering-view.tsx:53`: "Mock data"
- `billing-portal-view.tsx:78`: "Mock data"
- `billing-portal-view.tsx:1091`: "Mock validation"

**Acción:** Eliminar comentarios que referencien mock data.

#### href="#" (3 ocurrencias)
- `cloudops-center.tsx:973`: `<a href="#">` — enlace sin destino
- `dev-portal-v2.tsx:1790`: `<a href="#">` — enlace sin destino
- `signup-funnel-view.tsx:810`: `<a href="#">` — Términos y Política

**Acción:** Reemplazar por enlaces reales o botones con onClick.

---

## 3. AUDITORÍA DE BOTONES Y NAVEGACIÓN

### Botones muertos encontrados

| Archivo | Elemento | Problema | Acción |
|---------|---------|---------|--------|
| `cloudops-center.tsx:973` | `<a href="#">` | Enlace sin destino | P1: Reemplazar por botón |
| `dev-portal-v2.tsx:1790` | `<a href="#">` | Enlace sin destino | P1: Reemplazar por botón |
| `signup-funnel-view.tsx:810` | `<a href="#">` | Términos sin URL | P1: Añadir URL real |

### Botones que solo cambian estado local (sin persistir)

La mayoría de botones en componentes con arrays hardcodeados ejecutan toasts informativos pero NO persisten en PostgreSQL. Esto afecta a ~100 componentes que aún usan `const X = [...]` en lugar de `useAPI`.

**Estimación:** ~500 botones en toda la app. ~300 ejecutan toasts sin persistencia real.

---

## 4. AUDITORÍA DE ORIGEN DE DATOS

### Clasificación por componente

| Origen | Componentes | Porcentaje |
|--------|------------|------------|
| A) Array en el propio archivo | ~100 | 60% |
| B) Archivo de mocks importado | 0 | 0% |
| C) Estado React con datos iniciales | ~20 | 12% |
| D) API que devuelve datos fijos | 0 | 0% |
| E) API real conectada a DB | ~50 | 28% |

### Componentes con API real (E) — ya desdemoizados:
- Dashboard (`home.tsx`)
- Reservas (`reservas-view.tsx`)
- TPV (`tpv-view.tsx`)
- KDS (`kds-view.tsx`)
- CRM (`crm-view.tsx`)
- Inventario (`inventario-view.tsx`)
- Personal (`personal-view.tsx`)
- Delivery (`delivery-view.tsx`)
- Carta QR (`carta-qr-view.tsx`)
- Channels (`channels-view.tsx`)
- Reviews (`reviews-view.tsx`)
- Analytics (`analytics-view.tsx`)
- Growth (`growth-analytics.tsx`, `growth-reputation.tsx`)
- Executive (`exec-cockpit.tsx`)
- Automations (`automation-builder.tsx`)
- Copilot (`copilot-contextual-view.tsx`)
- SuperAdmin (8 archivos)

### Componentes con arrays hardcodeados (A) — pendientes:
- `exec-ai.tsx`, `exec-alerts.tsx`
- `fin-tpv.tsx`, `fin-payments.tsx`, `fin-orders.tsx`, `fin-reconciliation.tsx`
- `crm-calendar.tsx`, `crm-loyalty.tsx`, `crm-segments.tsx`, `crm-timeline.tsx`, `crm-vip.tsx`
- `floor-editor.tsx`, `floor-heatmaps.tsx`, `floor-iot.tsx`, `floor-kpis.tsx`, `floor-kds.tsx`, `floor-staff.tsx`, `floor-staff-engine.tsx`, `floor-tv-mode.tsx`, `floor-incidents.tsx`
- `prediction-panel.tsx`, `reservation-kpis.tsx`, `waitlist-panel.tsx`, `availability-engine.tsx`, `deposit-manager.tsx`
- `ai-center.tsx`, `ai-copilot.tsx`, `ai-knowledge.tsx`, `ai-menu.tsx`
- `ai-os-dashboard.tsx`, `ai-os-agents.tsx`, `ai-os-actions.tsx`, `ai-os-predictions.tsx`
- `cloudops-center.tsx`, `cloudops-finops.tsx`, `cloudops-observability.tsx`, `cloudops-backup.tsx`
- `dev-portal-v2.tsx`, `dev-marketplace-v2.tsx`, `dev-cli.tsx`, `dev-event-bus.tsx`
- `platform/api-explorer.tsx`, `dev-portal.tsx`, `marketplace.tsx`, `webhooks.tsx`, `ia-automation-builder.tsx`
- `super-admin-v2-view.tsx`, `cc-executive-ai.tsx`, `cc-feature-flags.tsx`, `cc-platform-health.tsx`, `cc-search.tsx`, `cc-world-map.tsx`
- `growth-campaigns.tsx`, `growth-promotions.tsx`, `growth-engine.tsx`
- `menu-engineering-view.tsx`, `billing-portal-view.tsx`, `entitlements-engine-view.tsx`
- + landing/sections/marketing (pueden tener datos estáticos)

---

## 5. APIs EXISTENTES Y FALTANTES

### APIs existentes (16)
auth/register, auth/login, admin/auth/login, admin/2fa/setup, stripe/webhook, stripe/checkout, orders, tickets, payments, cash-sessions, reservations, tables, employees, ai/chat, email/send, health

### APIs faltantes (CRÍTICO)
- `/api/zones` — CRUD de zonas
- `/api/guests` — CRUD de clientes CRM
- `/api/menu-items` — CRUD de carta
- `/api/categories` — CRUD de categorías
- `/api/shifts` — CRUD de turnos
- `/api/time-clock` — Fichaje
- `/api/stock-items` — Inventario
- `/api/kds-tickets` — KDS
- `/api/loyalty/stamps` — Fidelización
- `/api/campaigns` — Campañas
- `/api/reviews` — Reseñas
- `/api/automations` — Automatizaciones
- `/api/integrations` — Integraciones
- `/api/devices` — Dispositivos
- `/api/dashboard` — Métricas dashboard
- `/api/dashboard/chart` — Gráfica dashboard
- `/api/public/menu` — Carta pública
- `/api/public/order` — Pedido QR
- `/api/public/reservations` — Reserva pública
- `/api/public/notifications` — Notificaciones
- `/api/stripe/connect` — Stripe Connect
- `/api/qr/generate` — QR generation
- `/api/print` — Impresión
- `/api/onboarding` — Onboarding wizard
- `/api/admin/organizations` — Admin orgs
- `/api/admin/feature-flags` — Admin features
- `/api/admin/audit` — Admin audit

**Total faltantes: 27 APIs**

---

## 6. CLASIFICACIÓN DE PROBLEMAS

### P0 — Bloqueantes (5)

| # | Problema | Archivos | Acción |
|---|---------|---------|--------|
| P0-1 | 50 errores TypeScript | 30+ archivos | Corregir todos |
| P0-2 | 355 arrays hardcodeados en componentes | 100+ archivos | Reemplazar por useAPI |
| P0-3 | 27 APIs faltantes | — | Crear todas |
| P0-4 | `ignoreBuildErrors: false` pero 50 errores TS | next.config.ts | Corregir errores |
| P0-5 | PostgreSQL no ejecutándose | .env | Configurar DB real |

### P1 — Críticos (7)

| # | Problema | Acción |
|---|---------|--------|
| P1-1 | 968 referencias a "demo" en texto visible | Eliminar todas |
| P1-2 | 193 referencias a "mock" en comentarios | Limpiar comentarios |
| P1-3 | 64 Math.random() para datos | Eliminar o usar UUID |
| P1-4 | 3 href="#" sin destino | Reemplazar por botones |
| P1-5 | 7 "fake" referencias | Eliminar |
| P1-6 | 0 APIs con Zod | Añadir validación |
| P1-7 | 0 E2E tests | Implementar Playwright |

### P2 — Importantes (5)

| # | Problema |
|---|---------|
| P2-1 | PII no cifrada a nivel de campo |
| P2-2 | CSP no configurado |
| P2-3 | No hay Sentry/monitoring |
| P2-4 | No hay backups automáticos |
| P2-5 | Lighthouse no medido |

### P3 — Mejoras (4)

| # | Problema |
|---|---------|
| P3-1 | Service Worker perdido |
| P3-2 | useAPI hook existe pero no se usa en 100+ componentes |
| P3-3 | TanStack Query no integrado |
| P3-4 | No hay multi-región |

---

## 7. PLAN DE EJECUCIÓN

### Orden de ejecución:

1. **Corregir 50 errores TypeScript** (P0-1, P0-4) — 2 días
2. **Crear 27 APIs faltantes** (P0-3) — 3 días
3. **Reemplazar 355 arrays por useAPI** (P0-2) — 5 días
4. **Eliminar 968 "demo" + 193 "mock" + 64 Math.random** (P1-1, P1-2, P1-3) — 2 días
5. **Reemplazar 3 href="#"** (P1-4) — 30 min
6. **Añadir Zod a 16 APIs** (P1-6) — 1 día
7. **Configurar PostgreSQL** (P0-5) — 4h
8. **E2E tests** (P1-7) — 3 días

**Total: 16-18 días con 1 desarrollador senior.**

---

## 8. RIESGOS DE ROMPER FUNCIONALIDAD

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Eliminar arrays rompe UI | Alta | Alto | Reemplazar por useAPI + EmptyState |
| Corregir TS cambia comportamiento | Media | Medio | Solo type fixes, no logic changes |
| Crear APIs nuevas cambia schema | Baja | Medio | Migraciones compatibles |
| Eliminar "demo" de texto rompe layout | Baja | Bajo | Solo eliminar texto, no componentes |
| Configurar PostgreSQL pierde datos | Baja | Crítico | Backup antes de migrar |

---

## GATE DE SALIDA

| Criterio | Estado |
|----------|--------|
| 0 coincidencias en caza de demo | ❌ 1.597 coincidencias |
| 0 botones muertos | ❌ 3 href="#" |
| 0 componentes con datos hardcodeados | ❌ 355 arrays |
| TypeScript 0 errores | ❌ 50 errores |
| ESLint 0 errores | ✅ 0 errores |
| App arranca con estados vacíos | ❌ Muestra arrays hardcodeados |

**GATE NO CUMPLIDO** — No se puede pasar a FASE 1.
