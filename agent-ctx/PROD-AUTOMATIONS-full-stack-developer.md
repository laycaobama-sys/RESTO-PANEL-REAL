# PROD-AUTOMATIONS — full-stack-developer

## Task
Construir la vista "Automatizaciones" (visual builder) de RestoPanel — `src/components/rp/automations/automation-builder.tsx` exportando `AutomationBuilder`. Builder visual trigger → conditions → actions con paleta, canvas, panel de config, plantillas, controles e historial de ejecuciones. Renderizado dentro de AppShell.

## Contexto previo aprovechado
- Worklog completo de fases 0/1.1/1.2/4 + Producto.
- `app-shell.tsx` línea 224 ya tiene el lazy import: `automatizaciones: React.lazy(() => import("@/components/rp/automations/automation-builder").then((m) => ({ default: m.AutomationBuilder })))`.
- Design tokens en `globals.css`: dark theme primario, `--gold` #D4AF37, `--teal` #3DD6C9, utilities `rp-glass`, `rp-glass-strong`, `rp-glow-gold`, `rp-glow-teal`, `rp-scroll-thin`, `rp-gold-text`, `rp-teal-text`.
- Toaster montado en `layout.tsx`; hook `useToast` en `@/hooks/use-toast`.
- shadcn/ui completos en `@/components/ui/*` (button, switch, input, label, textarea, dialog, select, badge, etc.).
- Restricción de color: NO indigo/blue. Usé gold/teal/emerald/amber/fuchsia.

## Decisiones de implementación
- **Archivo único autónomo**: 1610 líneas en `automation-builder.tsx`. No depende de `@/components/rp/primitives` para mantener el builder autocontenido y evitar acoplamientos con la landing.
- **`NodeConfig` como interfaz plana con campos opcionales** (en vez de unión discriminada): simplifica el `updateConfig` (merge shallow) y el render del form adaptativo. Cada tipo lee solo sus campos relevantes.
- **Plantillas como factorías `build()`**: generan ids frescos en cada carga → recargar la misma plantilla no colisiona ids.
- **`buildSimLog` recorre los nodos reales** del estado (no es un log estático): el dry-run refleja el flujo actual del usuario, lo que hace que Simular se sienta real.
- **Nodos como `role="button"` + `aria-pressed`** (no `<button>` nativo): permite anidar el botón delete sin violar HTML (nested buttons inválido). Keyboard handler Enter/Space manual.
- **Accents sin azul**: gold (trigger), teal (condition), emerald (action), amber (wait), fuchsia (branch). Conectores con gradiente gold→teal.
- **Canvas siempre horizontal-scroll** (`overflow-x-auto` + `min-w-min`): cumple "canvas scrolls horizontally on mobile". Paleta y config apilan encima/debajo en mobile vía grid `lg:grid-cols-[220px_1fr_340px]`.
- **ConfigPanel adaptativo por `actionType`**: send_* muestra template+variables; add/remove_tag muestra etiqueta; create_task muestra título+assignee; apply_loyalty_points muestra puntos; notify_staff muestra canal; update_reservation_status muestra estado. Hace que cada acción se sienta específica.
- **Demo badges** en header, templates, historial, simulate dialog, history dialog. Datos demo claramente etiquetados.
- **Toasts** para: añadir nodo, cargar plantilla, duplicar, guardar, confirmar simulación.
- **Historial**: 5 ejecuciones demo con estados success/failed/pending + log modal creíble (incluye banner de error 429 para la fallida).

## Estado de verificación
- `bun run lint` → 0 errores, 0 warnings.
- `bunx eslint src/components/rp/automations/automation-builder.tsx` → exit 0.
- `bunx tsc --noEmit -p tsconfig.json` → sin errores en el archivo (filtrado por "automation-builder" → vacío).
- Dev log: mi módulo no aparece como error. Los `Module not found` restantes son de vistas de otros agentes (team-view, integrations-view, etc.).

## Sin blockers
Archivo completo, lint-clean, typecheck-clean, integrado con AppShell. Listo para que el usuario navegue a "Automatizaciones" en el sidebar y vea el builder.
