# Task: MOTOR-SMART-DEPOSIT-KPI

**Agent:** full-stack-developer
**Date:** 2025-06-10
**Stage:** Motor de Reservas Enterprise (3 componentes)

## Task
Construir 3 componentes para RestoPanel Motor de Reservas Enterprise:
1. SmartAssignment — Asignación inteligente de mesas con IA scoring + fallback determinista explicable.
2. DepositManager — Gestor de depósitos y pagos con políticas configurables + Stripe mock.
3. ReservationKpis — KPIs de reservas con distinción clara real-time vs aggregated.

Stack: Next.js 16, TypeScript, Tailwind CSS v4, Framer Motion, tema dark premium (gold #D4AF37, turquoise #3DD6C9, glassmorphism).

## Files Created
- `/home/z/my-project/src/components/rp/reservas/smart-assignment.tsx` — Export `SmartAssignment`
- `/home/z/my-project/src/components/rp/reservas/deposit-manager.tsx` — Export `DepositManager`
- `/home/z/my-project/src/components/rp/reservas/reservation-kpis.tsx` — Export `ReservationKpis`

## Work Log

### Setup & Context
- Revisé `worklog.md` (300KB+) y `primitives.tsx` para alinear design tokens: `rp-glass`, `rp-glass-strong`, `rp-gold-text`, `rp-teal-text`, `rp-glow-gold`, `rp-glow-teal`, `rp-scroll-thin`.
- Estudié `yield-panel.tsx` como referencia de patrones: tooltips con TooltipProvider, motion con `useReducedMotion()`, badges tone (gold/teal/emerald/amber/destructive), estilo `rp-glass rounded-2xl p-5`.
- Confirmé hooks disponibles: `useToast` (@/hooks/use-toast) y shadcn/ui completo en `src/components/ui`.
- Dev server activo en :3000, compilando limpio.

### File 1: smart-assignment.tsx (~830 líneas)
**Tipos** según spec: `TableCandidate`, `AssignmentRequest`.

**Demo data:**
- Reservation: Elena Marín, 4 pax, VIP, Terraza, mesa favorita T3, 15 visitas.
- IA candidates: T3 (92, recommended), T7 (78), V1 (71), T12 (65), T5 (58).
- Fallback candidates: T3 (70, recommended), T7 (58), T12 (42), V1 (35), T5 (28) — algoritmo determinista.

**UI:**
- Header "Asignación inteligente" + demo badge.
- Reservation context card: nombre, VIP badge, party size, zona preferida, mesa favorita, visitas previas.
- AI vs Fallback indicator: toggle "Simular caída de IA" — ON muestra amber "IA no disponible — usando algoritmo determinista (fallback)"; OFF muestra teal "IA activa · Modelo: glm-4-flash".
- Recommended card prominent (lg:col-span-3): mesa T3 grande, score gold 92/100, confianza 88%, badges Recomendada/Fallback, 6 razones con impact bars animadas (transform/opacity). Botón "Asignar mesa T3" (primary gold) → toast + spinner 600ms. Botón "Ver alternativas".
- Alternatives grid (lg:col-span-2): 4 cards con score, zona, seats, confianza. Botón "Seleccionar" → toast.
- Collapsible "Factores considerados por el motor": 18 factores con icono y descripción.
- Fallback explanation (condicional IA DOWN): 5 pasos numerados + nota "Una caída de la IA nunca impide reservar. El fallback garantiza operación."
- Disclaimer con border-left gold.

### File 2: deposit-manager.tsx (~1490 líneas)
**Tipos** según spec: `DepositType`, `DepositStatus`, `DepositPolicy`, `DepositTransaction`.

**Tabs:** Políticas | Transacciones | Conciliación.

**Políticas tab:**
- 5 políticas demo (Sin depósito default, 10€ fijo high_risk, 30% large_groups, 50% weekends, 100% events inactivo).
- Cada card: tipo badge (none/fixed/percentage), appliesTo, importe, minParty, cancel window, toggle activo, Editar/Eliminar (AlertDialog confirm; default deshabilitado).
- Botón "Nueva política" → Dialog con form completo (nombre, tipo, importe €/%, appliesTo, minParty, cancel window).
- Note: "Los depósitos se procesan mediante Stripe Payment Intents. El estado de pago está separado del estado de reserva."

**Transacciones tab:**
- Tabla desktop (8 cols) + cards mobile.
- 10 transacciones demo (RES-2025-0142…0147) con todos los estados (not_required, pending, preauthorized, paid, failed, refunded, partially_refunded).
- Stripe PI IDs enmascarados: `pi_••••••`.
- Filter por estado (Select). Botón Exportar.
- Acciones: Reembolsar (if paid) → Dialog full/partial con importe input; Ver detalle → Dialog con timeline completo (3 steps) + error si fallido.

**Conciliación tab:**
- Summary: cobrado hoy €340 (gold), reembolsado €20 (teal), 2 pendientes (amber).
- Lista 2 items con mismatch (delta Δ positivo/negativo).
- Botón "Ejecutar conciliación" → loading 1.8s → "Conciliación completada · 0 discrepancias" (emerald check).
- Note: "Conciliación automática cada hora. Webhooks de Stripe verificados criptográficamente."

**Security note bottom:** "Los pagos nunca se confirman únicamente desde el frontend. Stripe webhooks idempotentes verifican cada transacción. Estados de pago separados de estados de reserva."

**Helpers:** formatEuro (cents→€), formatTime (es-ES), maskStripeId, STATUS_META con icon+cls, TYPE_META, APPLIES_TO_LABEL.

### File 3: reservation-kpis.tsx (~960 líneas)
**Tipo** según spec: `KpiMetric`.

**Frequency legend:** 3 badges (RT emerald <5s, NRT teal 15-60s, AGG gray).

**Header:** LiveDot pulsante (real-time simulation cada 5s via setInterval) + timestamp es-ES + botones CSV/PDF (toast).

**4 secciones KPI:**

1. **Tiempo real** (emerald accent): 5 KPIs — reservas activas 47, ocupación 78%, mesas 18/24, lista espera 7, usuarios sala 87. Source: D1, DO+D1, DO.

2. **Casi tiempo real · 30s** (teal accent): 4 KPIs — reservas 1h 12, cancelaciones 2, check-ins 8, no-shows 3. Source: Analytics Engine, D1.

3. **Agregado · diario** (gold accent): 8 KPIs con fórmulas (tooltip InfoDot) — ocupación media 74% (sum(ocupado)/sum(capacidad)), rotación 2.3 (reservas/mesas/día), ticket €38, tiempo mesa 92min, cleaning 14min, conversión 34%, no-show rate 8.2%, cancelación 5.1%.

4. **Agregado histórico semanal/mensual:** 4 KPI cards (clientes nuevos 412, recurrentes 847, LTV €3.840, ingresos €98.540) + 3-up grid:
   - Channel bars: Web 42% / Google 28% / WhatsApp 18% / Phone 12%.
   - Zone bars: Sala 82% / Terraza 91% / VIP 45% / Barra 67%.
   - Franja chart: 13/14/20/21/22h (bar chart vertical con valores €).
   - Waiter table: Carlos 4.6★ (142), María 4.8★ (168), Juan 4.2★ (96).

**Cada KPI card:** label mono uppercase, value font-display 2xl-3xl, trend (arrow context-dependent good/bad → emerald/destructive/muted), source badge, frequency badge (RT/NRT/AGG), formula tooltip (InfoDot → tooltip), last updated implícito en header global.

**Period comparison:** card con select (semana/mes) → 5 métricas before→after con delta good/bad color (Reservas +11.2%, Ocupación +2pp, No-show -0.4pp, Ticket +5.6%, Cancelación -0.2pp).

**Data quality note:** "Las métricas 'Agregado' pueden tener un retraso de hasta 5 minutos. Las métricas 'Tiempo real' se actualizan en menos de 5 segundos. El ticket medio requiere integración con TPV."

### Animations & Accessibility
- Todas con `motion` + `useReducedMotion()` (fallback sin motion para prefers-reduced-motion).
- Solo transform + opacity (no layout thrash).
- AnimatePresence en lists y dialogs.
- Touch targets ≥44px (`min-h-11` en botones mobile).
- Aria-labels en toggles/switches, roles semánticos (`section`, `header`).
- Tablas con `overflow-x-auto rp-scroll-thin` para evitar overflow horizontal.

### Responsive
- KPIs: grid-cols-2 (mobile) → sm:3 → lg:4 → xl:5.
- Deposit transactions: tabla desktop (hidden lg:block) + cards mobile (lg:hidden grid).
- Deposit policies: sm:2 → lg:3.
- Alternatives: sm:2 → lg:1 (lado a lado con recommended en lg:grid-cols-5).
- Recommended + alternatives: lg:grid-cols-5 (recommended 3, alternatives 2).

### Lint & Type-check Fixes
- **Issue 1:** Import conflict en reservation-kpis.tsx — `Star` importado de lucide-react AND declarado localmente como SVG component. **Fix:** Removí `Star` de lucide-react imports.
- **Issue 2:** Unused imports en reservation-kpis.tsx (Users, Clock, UserX, Ban, Sparkles, Smartphone, Instagram, CheckCircle2, CircleDot) y constante `TREND_GOOD` no usada. **Fix:** Limpié todos los imports/constantes no usados.

## Stage Summary

### Files Created (3)
| File | Lines | Export | Status |
|------|-------|--------|--------|
| smart-assignment.tsx | ~830 | `SmartAssignment` | ✅ |
| deposit-manager.tsx | ~1490 | `DepositManager` | ✅ |
| reservation-kpis.tsx | ~960 | `ReservationKpis` | ✅ |

### Lint Status
- `bun run lint` (ESLint): **PASS**, 0 errores.
- `bunx tsc --noEmit`: 0 errores en mis 3 archivos (errores pre-existing en floor-editor/reservas-view/waitlist-panel/landing NO introducidos por mí).
- Dev server: `✓ Compiled in 589ms` (último build limpio).

### Features Cubiertas (vs spec)
✅ Tipos exactos según spec (TableCandidate, AssignmentRequest, DepositType, DepositStatus, DepositPolicy, DepositTransaction, KpiMetric)
✅ Demo data completa (Elena Marín reservation, 5 políticas, 10 transacciones, todos los estados, todos los KPIs)
✅ IA vs Fallback toggle con indicadores amber/teal
✅ Recommended card prominent con score gold grande + razones con impact bars
✅ Alternatives grid sorted by score desc
✅ 18 factores en collapsible
✅ Fallback explanation condicional con 5 pasos
✅ Tabs: Políticas | Transacciones | Conciliación
✅ CRUD políticas (create/edit dialog, delete confirm)
✅ Tabla transacciones con filter + export + actions (refund full/partial, detail timeline)
✅ Conciliación con deltas + execute button (loading → done)
✅ Security note (Stripe webhooks idempotentes)
✅ 4 secciones KPI (RT, NRT, AGG daily, AGG historical)
✅ Frequency legend (3 badges)
✅ LiveDot pulsante + timestamp es-ES
✅ Formula tooltips (InfoDot)
✅ Trend context-dependent (good/bad → emerald/destructive)
✅ Channel bars + Zone bars + Franja chart + Waiter table
✅ Period comparison (semana/mes select)
✅ Export buttons CSV/PDF (toast)
✅ Data quality note
✅ Animations transform+opacity only, prefers-reduced-motion respetado
✅ Responsive completo (mobile stacked, desktop grids)
✅ Touch targets ≥44px
✅ Toda copy es-ES, badge "demo"
✅ Tema dark premium (gold #D4AF37, turquoise #3DD6C9, glassmorphism rp-glass)
