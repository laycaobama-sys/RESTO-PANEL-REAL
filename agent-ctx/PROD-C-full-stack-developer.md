# Task ID: PROD-C
**Agent:** full-stack-developer
**Task:** Construir el bloque C de la fase Producto (RestoPanel SaaS) con tres secciones interactivas reales usando React useState: ProductoPricing (calculadora), ProductoDashboard (widgets vivos) y ProductoReservas (plano de mesas interactivo).

## File created
- `src/components/rp/sections-producto/p-c.tsx` (1581 líneas)
- `"use client"` en la primera línea; 3 exports: `ProductoPricing`, `ProductoDashboard`, `ProductoReservas`.

## Sections built

### 09 — ProductoPricing (id="p-pricing")
Interactive pricing calculator with React useState:
- **State:** `plan` (starter/professional/enterprise), `billing` (monthly/annual), `locations` (1-50).
- **Plan prices:** Starter 69€/mes · 690€/año · 1 local; Professional 149€/mes · 1.490€/año · 5 locales; Enterprise desde 399€/mes · 3.990€/año · 10 incluidos + 25€/local adicional.
- **Behavior:** `selectPlan()` clampea `locations` al límite del plan. Cálculo dinámico de monthlyCost, annualCost (×12×0.9), savings.
- **UI:** 3 PlanCard seleccionables, toggle mensual/anual, slider de locales con hint "subir de plan" al alcanzar límite, precio grande actualizado en tiempo real, badge de ahorro, CTA dinámico por plan ("Crear cuenta Starter/Pro" vs "Solicitar demo Enterprise").
- **Tooltips:** InfoDot en límites y en features que requieren implementación real (SSO, RBAC, White label, SLA, CF Enterprise, Soporte 24/7).
- **Tables:** Comparativa de 27 características (Check/Dash por plan) + DataTable "Detalle por plan" (3 filas).
- **GlassCard gold "Reglas de pricing"** + **Callout warn "No prometer lo no implementado"**.

### 10 — ProductoDashboard (id="p-dashboard")
Interactive dashboard shell with React useState:
- **State:** `period` (hoy/semana/mes), `showGoogleRating`, `showNoShows`, `showAI` (toggles de widgets).
- **Top bar mockup:** org selector ("Ramses Madrid"), restaurante selector, periodo selector, búsqueda con kbd ⌘K, bell con badge, perfil con avatar.
- **Widget visibility toggle:** 3 checkboxes que ocultan/muestran KPIs y el widget de IA en tiempo real.
- **KPI row (6 widgets):** Reservas hoy 47 (+12%), Ocupación 78% (+5pp), Ticket medio 38€ (+2€), No-shows 3 (−1), Clientes nuevos 8 (+2), Google Rating 4.6★ (estable). Cada KPI tiene label, big number, Sparkline SVG propio, TrendPill y DemoBadge.
- **Widgets:** Reservas de hoy (6 reservas), Timeline del día (7 eventos), Actividad reciente (5 eventos), Recomendaciones IA (3 con badge confianza 64-82%).
- **DataTable "Widgets disponibles":** 13 widgets con permiso requerido y default on/off.
- **GlassCard gold "Shell de aplicación"** (11 items) + **Callout ok "Widgets por rol"**.

### 11 — ProductoReservas (id="p-reservas")
Interactive floor plan with React useState:
- **State:** `statuses` (Record<string, TableStatus> de 12 mesas), `selected`, `pendingRes`.
- **Floor plan:** 12 mesas (M1-M12) en zonas (Ventana, Centro, Barra, Privado, Terraza) con 2-8 comensales.
- **Click behavior:** clic en mesa cicla free → reserved → occupied → blocked → free. Si hay `pendingRes` activo y la mesa está libre, el clic asigna la reserva a esa mesa (status → reserved).
- **Side panel "Mesa seleccionada":** nombre, comensales, zona, estado, reserva actual (demo data contextual), 4 botones manuales de cambio de estado.
- **Leyenda** con dot + label + count por estado.
- **Reservas de hoy list** (6 reservas): clic selecciona → clic en mesa libre asigna. Banner de asignación activa con botón Cancelar.
- **Tables:** "Estados de mesa" (5 filas: libre/reservada/ocupada/bloqueada/por limpiar) + "Funciones de reservas" (11 filas: calendario, timeline, drag&drop, filtros, confirmaciones, pagos, historial, reconfirmaciones, cancelaciones, no-show, lista de espera).
- **GlassCard gold "Concurrencia en tiempo real"** (7 items: DO, locks, WebSocket sync, D1 canónico, reconstrucción, conflictos, idempotencia) + **Callout warn "Drag & drop con confirmación"**.

## Lint & TypeScript
- `bun run lint` → 0 errores, 0 warnings.
- `bunx tsc --noEmit` → 0 errores en p-c.tsx (errores residuales solo en examples/ y skills/ preexistentes).
- Dev log: `✓ Compiled in 137ms` y `GET / 200` confirman render exitoso tras crear el archivo.

## Blockers
Ninguno. Bloque C (PROD-C) listo e integrado.
