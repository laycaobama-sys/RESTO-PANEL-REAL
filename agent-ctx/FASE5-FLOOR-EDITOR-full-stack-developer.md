# Task ID: FASE5-FLOOR-EDITOR
# Agent: full-stack-developer
# Task: Construir editor de plano de mesas interactivo completo para RestoPanel.

## Work Log

### Contexto revisado
- Leí `worklog.md`: proyecto SPA multi-agente, AppShell con `useNav` zustand en `@/components/rp/app/nav-store`, sección `reservas` renderiza `ReservasView` en `src/components/rp/reservas/reservas-view.tsx`. Theme dark premium con tokens `--gold`/`--teal`/`rp-glass*`. shadcn/ui completo en `src/components/ui/`.
- Revisé `app-shell.tsx` para entender layout: sidebar 64 sticky + main `p-4 sm:p-6 lg:p-8` con topbar `h-16` sticky top-0 z-30. Mi toolbar usa `sticky top-16 z-20` para quedar debajo del topbar.
- Revisé `globals.css` para tokens: `--gold #D4AF37`, `--gold-soft #E8C766`, `--teal #3DD6C9`, utilidades `rp-glass`, `rp-glass-strong`, `rp-grid-bg`, `rp-scroll-thin`, `rp-glow-gold/teal`.
- Revisé `use-mobile.ts` (breakpoint 768) y `use-toast.ts` (API `toast({title, description})`).
- Revisé shadcn components: `button` (variantes default/destructive/outline/secondary/ghost/link + sizes default/sm/lg/icon), `slider`, `sheet` (side="bottom" para mobile bottom sheet), `tabs`, `dialog`, `alert-dialog`, `dropdown-menu`, `select`, `switch`, `textarea`, `label`, `badge`, `input`.

### Archivo creado: `src/components/rp/reservas/floor-editor.tsx` (2600 líneas)

Estructura:
1. **Tipos** (exportados): `TableState` (8 estados), `TableShape` (4 formas), `Zone`, `FloorTable`, `FloorState`. Todos los campos del spec implementados (id, name, seats, shape, x/y/w/h, rotation, zoneId, state, customerName, partySize, reservationTime, occupiedSince, estimatedRemaining, nextReservation, vipLevel, assignedTo, notes, mergedFrom).
2. **Constantes**: `DEFAULT_ZONES` (4: Sala principal gold, Terraza teal, VIP fuchsia, Barra amber), `STATE_META` (8 estados con label/short/bg/border/text/dot/icon/hex), `OP_CYCLE` (libre→reservada→ocupada→limpieza→bloqueada→libre), `STATE_ORDER` (orden para leyenda y grid de estados en panel), `SHAPE_OPTIONS` (round/square/rect/oval).
3. **Helpers**: `shapeClass`, `zoneBgClass`, `zoneAccentClass`, `uid`, `clamp`, `nextTableName` (auto-sugiere M/T/V/B+número), `findFreePosition` (grid scan anti-overlap), `formatElapsed` (mins/h), `makeInitialFloor`.
4. **DEMO_TABLES**: 15 mesas distribuidas en 4 zonas con mix de estados (free, reserved, occupied, next_reservation, vip, blocked, cleaning, bill_requested) y formas (round, square, rect, oval). Incluye una mesa VIP con crown, una con próxima reserva badge, una con bill_requested, una con cleaning.

### Componente principal `FloorEditor`
- Estado: `useState<FloorState>` con zones/tables/selectedIds/history/future/editMode.
- Sub-estado: `zoneFilter`, `online` (toggle conectado/offline), `mobileZone` (tab activa mobile), `mobilePanelOpen` (bottom sheet), `addDialogOpen`, `deleteDialogOpen`.
- Refs transient (no re-render): `dragRef`, `resizeRef`, `boxRef`, `historyPushedRef`.
- `boxPreview` en useState para renderizar el rectángulo de caja de selección.

**Selección** (`setSelected`, `selectTable(additive)`, `clearSelection`):
- Click simple → reemplaza selección.
- Shift/Ctrl/Cmd+click → toggle en selección.
- Box-select en zona vacía → selecciona todas las mesas que intersectan.

**Historial** (`pushHistorySnapshot`, `commit(updater)`, `undo`, `redo`):
- Cada mutación empuja snapshot previo a `history` (max 50) y vacía `future`.
- `undo` restaura último snapshot, empuja actual a `future`.
- `redo` revierte.
- Snapshot se empuja UNA vez al inicio de drag (no en cada pointermove) vía `historyPushedRef`.

**Mutaciones**:
- `addTable`: dialog con nombre auto-sugerido, seats 1-20, shape, zona. Posición libre calculada. Auto-selecciona.
- `deleteSelected`: confirmación con AlertDialog.
- `moveSelectedToZone` (KEY FEATURE "traspasar mesa a otra zona"): dropdown del toolbar con las 4 zonas. Cambia `zoneId`, recalcula posición libre en destino, cambia tab mobile.
- `mergeSelected`: 2+ mesas → nueva mesa rect con suma de comensales, nombre "M1+M2", posicionada en centroide, `mergedFrom` guarda ids originales.
- `splitSelected`: mesa rect → 2 mesas cuadradas con seats divididos.
- `rotateSelected(90)`: rota 90° incrementos.
- `updateTable(id, patch)`: edita propiedades individuales.
- `cycleState`: clic en modo operación cicla estados.

**Drag pointer events** (touch-friendly, `touch-action: none`):
- `onTablePointerDown`: en edit mode, selecciona (con modificador), captura pointer, mide zona contenedora vía `closest('[data-zone-id]')`.
- `onTablePointerMove`: si mueve >4px, marca `moved=true`, empuja snapshot una vez, actualiza posición de todas las mesas seleccionadas (delta desde último evento). Clamp a límites de zona.
- `onTablePointerUp`: libera pointer capture, limpia dragRef.
- Mover múltiples mesas a la vez funcionando.

**Resize**: handle dorado 3×3 en esquina inferior-derecha de mesa seleccionada en edit mode. Pointer events propios, clamp 56-280 w / 56-200 h.

**Box-select**: pointerdown en zona vacía (las mesas hacen `stopPropagation`), pointermove actualiza preview rect, pointerup selecciona mesas intersectadas. Soporta shift+box para aditivo.

**Teclado** (effect global):
- Ctrl+Z = undo, Ctrl+Shift+Z / Ctrl+Y = redo.
- Delete/Backspace (si no en input) = abre confirmación de eliminar.
- Arrow keys mueven selección (4px, 10px con shift).
- Escape limpia selección.

**Estadísticas** (memo): total, libres, ocupadas, reservadas, comensales — renderizadas como MiniStat en header.

### Sub-componentes

**`Toolbar`** (sticky `top-16 z-20`):
- Toggle Modo editar / Modo operación (gold cuando activo).
- Añadir mesa (gold primary).
- Eliminar (outline destructive, disabled si no selección).
- **Mover a zona** dropdown (gold outline, KEY FEATURE) con las 4 zonas.
- Fusionar (disabled si <2 seleccionadas).
- Separar (disabled si no es 1 mesa rect).
- Rotar (disabled si no selección).
- Undo/Redo (ghost, disabled si history/future vacío, con kbd hint).
- Zone filter (Select: todas / específica).
- Connection indicator (Wifi/WifiOff toggle, dot animado).
- Selection count badge (gold cuando >0).
- Fila 2: hint contextual cambia según modo (arrastra / clic=ciclo estado).

**`ZoneCanvas`**: section con header (icono zona + nombre + stats: mesas/ocup/pers.) y canvas `relative rp-grid-bg min-h-[300px]`. Pointer events para box-select. Renderiza mesas + box preview + empty state.

**`TableCard`** (`motion.button`):
- Posición absoluta con `left/top/width/height` + `transform: rotate()`.
- Clases por shape: round=rounded-full, square=rounded-lg, rect=rounded-lg, oval=rounded-full.
- Bg/border/text por estado (8 estados).
- Contenido: nombre (font-display), seats (mono `4p`), cliente si ocupada/reservada (en no-round), tiempo transcurrido si ocupada.
- Badges: próxima reserva (amber), bill_requested (turquesa €), VIP crown arriba.
- Selected: `ring-2 ring-[var(--gold)] ring-offset-2 ring-offset-background z-10`.
- Hover (edit mode): scale 1.04 (1.06 si selected). `whileTap` scale 0.96.
- `layout` animation para transiciones suaves (deshabilitado si `prefers-reduced-motion`).
- Resize handle dorado visible solo en edit mode + selected.
- `aria-label` rico: "Mesa M1, 4 comensales, Ocupada, cliente Familia Ruiz, 6 personas, asignada a Carlos".
- `tabIndex=0`, focus-visible gold ring, `aria-pressed`.

**`PropertiesPanel`** (sidebar desktop `w-80 xl:w-96` sticky `top-32` + bottom sheet mobile):
- Empty state: instrucciones según modo.
- Multi (2+): lista de mesas con estado dot, total comensales.
- Single: formulario completo — nombre, comensales, zona (select), forma (4 botones), estado (grid 4×2 con los 8 estados clicables), rotación (slider 0-359° step 15), cliente, tamaño grupo, hora reserva, asignada a, nivel VIP (slider 1-5, solo si estado vip), notas (textarea), próxima reserva (callout), info ocupación (KV), posición/tamaño (KV x/y/w/h, solo edit mode).

**`AddTableDialog`**: form con nombre (auto-sugerido por zona), seats 1-20, zona select, forma (4 botones con preview), preview live de la mesa a crear. Auto-resetea al abrir.

**`Legend`**: grid 2×4 / 4×2 con los 8 estados (dot + icon + label).

**`MiniStat`**: stats compactas en header (Mesas, Libres, Ocupadas, Reservadas, Comensales) con tono por color.

### Responsive
- **2xl** (≥1536px): grid `2xl:grid-cols-4` (las 4 zonas lado a lado).
- **lg** (≥1024px): grid `xl:grid-cols-2` (2×2) + panel lateral `w-80 xl:w-96`.
- **< lg**: Tabs (una zona visible, scroll horizontal en tabs list), panel como bottom Sheet.
- **Mobile**: toolbar `overflow-x-auto rp-scroll-thin`, botones con label oculto en xs (solo icono), FAB dorado "Editar mesa" cuando hay selección.
- Touch targets ≥44px: botones `h-9` (36px) en desktop pero `min-h-[44px]` en mobile para tabs y FAB; `min-w-[44px]` en toggles.
- `touch-action: none` en canvas y mesas para prevenir scroll durante drag.

### Integración
- Añadido en `reservas-view.tsx`: import de `FloorEditor`, iconos `ArrowLeft` y `LayoutGrid`, state `advancedEditor`, early return renderizando `<FloorEditor />` con botón "Volver a Reservas" + badge "Editor avanzado" cuando activo.
- Botón "Editor avanzado" (outline gold) añadido en header de Reservas junto a "Nueva reserva".
- No rompe funcionalidad existente de ReservasView.

### Lint
- `bun run lint` → 0 errores, 0 warnings (tras limpiar 4 directivas `eslint-disable` innecesarias y corregir un effect con deps incompletos).
- Dev log: compila limpio sin errores de runtime.

### Accesibilidad
- Mesas son `motion.button` con `aria-label` descriptivo, `aria-pressed` para selección, `tabIndex=0`, focus-visible ring gold.
- Toolbar buttons con `aria-label` y `aria-pressed`.
- Estados con iconos + texto + color (no solo color).
- Keyboard: Tab navega mesas, Enter/Space activa, Delete elimina, arrows mueven, Ctrl+Z/Y undo/redo, Escape limpia selección.

### Animaciones
- `useReducedMotion()` de framer-motion: si activo, desactiva `layout`, `whileHover`, `whileTap`, `animate` scale.
- Solo `transform` (scale, rotate) y `opacity` animados. Nada de animar width/height/top/left excepto via layout (que framer hace con transform).
- Pulse en connection dot (CSS animate-pulse, decorativo).

## Stage Summary
- **Archivo**: `src/components/rp/reservas/floor-editor.tsx` (2600 líneas), exporta `FloorEditor`.
- **Features**: 12 features del spec implementadas (add, delete, drag dentro de zona, mover entre zonas, merge, split, undo/redo con keyboard, multi-selección + box-select, panel de propiedades, rotate, resize, toggle edit/operation mode).
- **8 estados visuales**: libre, reservada, ocupada, próxima reserva, VIP, bloqueada, limpieza, cuenta solicitada — con colores Tailwind (emerald, sky, red, amber, fuchsia, zinc, orange, var(--teal)) y meta completa.
- **4 zonas**: Sala principal, Terraza, VIP, Barra — con tinte de color propio y header.
- **15 mesas demo**: mix de estados y formas, distribuidas en 4 zonas.
- **Responsive**: 4 cols (2xl) → 2 cols (lg) → tabs (mobile) → bottom sheet (mobile panel) → FAB (mobile edición).
- **Touch**: pointer events con `touch-action: none`, drag funcional en móvil, targets ≥44px.
- **Lint**: 0 errores, 0 warnings.
- **Integración**: accesible vía botón "Editor avanzado" en header de Reservas.
- **Tema**: dark premium con dorado #D4AF37, turquesa #3DD6C9, glassmorphism (`rp-glass`, `rp-glass-strong`), grid bg, glow gold.
