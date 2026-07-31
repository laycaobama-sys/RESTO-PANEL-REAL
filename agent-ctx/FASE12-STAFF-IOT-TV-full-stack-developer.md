# Task: FASE12-STAFF-IOT-TV

**Agent**: full-stack-developer
**Date**: 2024-Q4
**Status**: ✓ Completed

## Task
Crear 3 componentes enterprise de Smart Floor Management:
1. **Motor de Carga de Personal v2** (`floor-staff-engine.tsx`) — cognitive load points con stress multipliers
2. **Dashboard IoT** (`floor-iot.tsx`) — sensor ingestion, BLE beacons, pressure sensors
3. **Modo TV GDPR** (`floor-tv-mode.tsx`) — read-only sanitizado para pantallas públicas

## Files created
- `/home/z/my-project/src/components/rp/reservas/floor-staff-engine.tsx` (1732 líneas, `FloorStaffEngine`)
- `/home/z/my-project/src/components/rp/reservas/floor-iot.tsx` (1072 líneas, `FloorIot`)
- `/home/z/my-project/src/components/rp/reservas/floor-tv-mode.tsx` (1216 líneas, `FloorTvMode`)

Total: **4.020 líneas**.

## Work Log
- Reutilizado patrón de `floor-staff.tsx` (1437 líneas existentes): `"use client"`, cn, useToast, Tooltip/Collapsible/Dialog de shadcn/ui, framer-motion con useReducedMotion, badges demo, copy es-ES, paleta `--gold` #D4AF37 / `--teal` #3DD6C9.

### File 1: floor-staff-engine.tsx
- Fórmula: `basePoints × sizeMult × incidentMult × vipMult + distancePenalty`
- Puntos base: ordering=3, drinks=2, dining=2, dessert=1, paying=1, cleaning=0.5
- Multiplicadores: party size (1/1.3/1.6/2), KitchenDelay ×3, CustomerIssue ×2, BrokenTable ×1.5, VIP ×1.5, distancia +0.5/zone
- Estados: IDLE<15, OPTIMAL 15-35, HEAVY 35-60, OVERLOADED>60
- Demo data internamente consistente (per-table totals suman al staff total):
  - Carlos (Terraza, OVERLOADED 63.1pts, 6 mesas con 4 KitchenDelay)
  - María (Sala, IDLE 4.65pts)
  - Juan (VIP, OPTIMAL 17.25pts, 4 mesas VIP ×1.5)
  - Laura (Maître, IDLE 0pts supervisión)
  - Pedro (Runner, OPTIMAL 22pts)
  - Ana (Barra, OPTIMAL 28pts)
- Detector de desequilibrio: alerta Carlos↔María con proyección post-reasignación + confianza 92% + nota de algoritmo determinista + botones Aplicar/Rechazar
- Gauge circular SVG animado por estado (green/teal/gold/red)
- Desglose expandible por mesa con cálculo visible: "3pts × 1.3 (4pax) × 3 (KitchenDelay) = 11.7pts"
- Badges incident (red) y VIP (gold) por mesa
- Zone load summary (4 zonas), 3 optimization suggestions IA

### File 2: floor-iot.tsx
- 10 sensores demo (pressure/ble_beacon/qr_scan/temperature/occupancy/smart_table)
- 4 status (online/offline/low_battery/error)
- Webhook endpoint `POST /v1/webhooks/iot-sensors` con HMAC-SHA256
- Event log con 10 eventos (info/warning/error level)
- Signal history dialog con 12 muestras RSSI demo
- Mapped action destacada por sensor ("→ Sugiere cambio a 'Seated'", etc.)
- Lint fix: `batteryIcon()` refactorizado a componente `BatteryGlyph` declarado fuera de render (react-hooks/static-components)

### File 3: floor-tv-mode.tsx
- GDPR-sanitizado: cero PII — solo hora+partySize+zone en llegadas, sin nombres de camareros, sin IDs de cliente
- Live clock con setInterval 1s + suppressHydrationWarning
- Connection indicator pulsing (EN DIRECTO/SIN CONEXIÓN)
- Occupancy indicator gigante (text-5xl→9xl responsive, color green/gold/red por threshold)
- 6 table states big colored blocks
- Waitlist panel pulsing amber
- Critical alerts (MESA 14 retraso cocina 18min, MESA 8 limpieza 10min)
- 4 zone load bars (10 blocks animados con backgroundColor por estado)
- 4 KPIs del servicio (47/38/9/92min)
- Settings panel admin colapsable: Select refresh interval (5/10/30s), font size, theme, 6 Switch toggles, botón Pantalla completa con requestFullscreen API
- Sanitization log: 4 contadores PII = 0 (Nombres/Teléfonos/Emails/IDs cliente)
- GDPR notice en top

## Lint Status
✓ **PASS** — 0 errors, 0 warnings (después de fix `react-hooks/static-components` en floor-iot.tsx)

## Dev Server
✓ Compila limpio, GET / 200 en ~90-200ms, sin errores en dev.log posteriores a la creación de archivos.

## Responsive
- Todos los grids 1/2/3-4 cols responsive con sm:/lg:/xl:
- min-h-11 touch targets en todos los botones
- max-h-80/96 overflow-y-auto rp-scroll-thin en listas largas
- TV mode diseñado para 1920×1080 pero responsive down to tablet

## Integration Notes (para próximo agente)
Los 3 componentes NO están integrados en `app-shell.tsx` todavía. Para integrar:
1. Extender `Section` type en `src/components/rp/app/nav-store.ts` con 3 nuevos valores: `staffengine`, `iot`, `tvmode`
2. Añadir 3 entradas al array NAV en `app-shell.tsx` con iconos (p.ej. `Gauge` para staff engine, `Radio` para IoT, `Tv` para TV mode) en grupo "Reservas"
3. Añadir 3 lazy imports: `FloorStaffEngine`, `FloorIot`, `FloorTvMode` desde `@/components/rp/reservas/floor-staff-engine` etc.
