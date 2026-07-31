# Task ID: FASE6-CRM-INTEL
# Agent: full-stack-developer
# Task: Crear 3 componentes para Fase 6 (CRM 360° Intelligence, Segmentation, VIP Classification).

## Work Log

### Contexto revisado
- Leí `worklog.md` (cola): proyecto SPA multi-agente Next.js 16, AppShell con `useNav` zustand. Sección `crm` renderiza `CrmView` (2666 líneas) en `src/components/rp/crm/crm-view.tsx`. Theme dark premium.
- Tokens en `globals.css`: `--gold #D4AF37`, `--gold-soft #E8C766`, `--teal #3DD6C9`. Utilidades: `rp-glass`, `rp-glass-strong`, `rp-glow-gold`, `rp-glow-teal`, `rp-scroll-thin`, `rp-gold-text`, `rp-teal-text`, `rp-grid-bg`. `prefers-reduced-motion` reduce animaciones globalmente.
- shadcn/ui completo en `src/components/ui/`. Usé: Dialog, AlertDialog, Collapsible, Select, Tooltip, Badge, Button, Input, Label, Switch. `useToast` desde `@/hooks/use-toast` con API `toast({title, description})`.
- Lint config: `react-hooks/static-components` ACTIVO (prohíbe `const Icon = map[name]` durante render — requiere componentes estables). `no-explicit-any` / `no-unused-vars` / `react-hooks/exhaustive-deps` OFF.
- Revisé `prediction-panel.tsx` (Fase 5) como referencia de patrones: `DQ_META` con tooltip, confidence bar animada, gauge SVG, `useReducedMotion`.

### Archivo 1: `src/components/rp/crm/crm-intelligence.tsx` (~600 líneas)
Export `CrmIntelligence`. Motor de predicciones IA explicables por cliente.

- **Tipos**: `DataQuality` (HIGH/MEDIUM/LOW/INSUFFICIENT), `Prediction` (label, value, confidence, factors[], dataQuality, modelVersion, calculatedAt, expiresAt), `DemoCustomer`.
- **DQ_META**: HIGH emerald / MEDIUM gold / LOW amber / INSUFFICIENT destructive, cada uno con label, className, dot, tooltip. Confidence tone: green ≥75, gold ≥50, amber <50.
- **3 clientes demo** con perfiles distintos:
  - Elena Marín (Oro, 15v, LTV €2.840) — predicciones sólidas HIGH.
  - Marco Bellini (Black, 42v, LTV €8.450) — predicciones muy altas HIGH.
  - Paula Nieva (Nuevo, 2v, LTV €84) — 3 predicciones INSUFFICIENT (channel/timing/campaign) → warning "Datos insuficientes — usando reglas deterministas" + modelVersion `rules-det-v1.0`.
- **6 prediction cards** en grid responsive (1/2/3 cols): LTV (Wallet, "€2.840" + TrendingUp), Probabilidad volver (RotateCcw, "78%"), Riesgo abandono (ShieldCheck, "Bajo (12%)" emerald + TrendingDown), Canal recomendado (MessageCircle, "WhatsApp"), Mejor momento (Clock, "Martes 11:00"), Respuesta campaña (Megaphone, "64%").
- Cada card: label mono uppercase + icono en caja; data quality badge con tooltip (cursor-help); big value font-display 3xl/4xl con color por tono; confidence bar animada (width 0→X%, delay escalonado, `role="progressbar"` aria-valuenow/min/max); INSUFFICIENT warning box con AlertTriangle; factors chips con bullet gold; footer modelVersion (Cpu) + calculatedAt relativo (CalendarClock) + expiresAt (Clock).
- **Header**: Brain gold + título + badge demo + Select cliente (3 opciones) + botón "Recalcular predicciones" (gold, RefreshCw spin 1s, toast, refreshKey para re-montar cards).
- **CustomerHeader strip**: avatar inicial + nombre + email + grid 4 stats (Tier/Visitas/LTV/Última visita).
- **Disclaimer**: Sparkles teal + "Las predicciones son estimaciones basadas en datos históricos. No son garantías. La IA recomienda, el humano decide."
- Animaciones: AnimatePresence mode="wait" en grid (opacity al cambiar cliente), cards initial opacity+y staggered (delay index*0.05 max 0.35), confidence bar width. Respeta useReducedMotion.

### Archivo 2: `src/components/rp/crm/crm-segments.tsx` (~700 líneas)
Export `CrmSegments`. Motor de segmentación con constructor de reglas.

- **Tipos**: `SegmentType` (static/dynamic/predictive), `SegmentStatus` (active/paused/draft), `Condition` (field/operator/value), `Segment`.
- **TYPE_META**: Estático=gray (Layers), Dinámico=teal (Filter), Predictivo=gold (Sparkles). **STATUS_META**: Activa=emerald, Pausada=amber, Borrador=muted.
- **FIELD_OPTIONS** (8): última visita, ticket medio, visitas totales, LTV, canal, zona, cumpleaños, riesgo abandono. **OPERATOR_OPTIONS** dinámicos por tipo: numeric (>/< =), time (hace más/menos de), text (contiene), other (es). `opsForField()` resuelve operadores válidos; al cambiar campo se resetea operador al primero válido.
- **10 segmentos demo**: Inactivos 60 días (dinámico, 127), Alto ticket (estático, 43, consent), Cumpleaños este mes (dinámico, 28, consent), Riesgo abandono (predictivo, 19), Viernes habituales (dinámico, 62), Prefieren terraza (estático, 89), Alta cancelación (predictivo, 12, paused), VIP potencial (predictivo, 7, consent), Responden WhatsApp (dinámico, 156, consent), Nuevos con potencial (predictivo, 34, 2 condiciones, draft).
- **Header**: Layers teal + título + badge demo + botón "Nuevo segmento" (gold).
- **Stats row** (grid 2/4): Segmentos totales (gold), Clientes segmentados (teal), Segmentos activos (emerald), Predictivos IA (gold).
- **Filter tabs** (`role="tablist"`/`role="tab"` aria-selected): Todos / Estáticos / Dinámicos / Predictivos con count badge. Active = gold bg+border.
- **RuleBuilderDialog** (max-w-2xl, scrollable): nombre input + tipo select; lista de condiciones (campo select + operador select dinámico + valor input + botón X quitar, disabled si solo 1); botón "Añadir condición" (outline dashed); consent Switch (excluye clientes sin consentimiento marketing); live preview "Este segmento tendría ~X clientes" (`mockEstimate` determinista); validación (nombre obligatorio, ≥1 condición con valor); error `role="alert"`; on save → toast + añade a lista en draft.
- **SegmentCard**: icono por tipo + nombre + type badge (dot); description line-clamp-2; big size gold + "clientes"; conditions chips; status badge + consent icon (tooltip) + updatedAt relativo; actions Ver clientes (toast), Pausar/Activar (toggle status + toast), Editar (toast), Eliminar (AlertDialog confirm).
- **AlertDialog delete**: Trash2 destructive, action "Eliminar definitivamente".
- **Empty state** cuando filtro sin segmentos.
- Animaciones: AnimatePresence mode="popLayout" + layout; cards initial opacity+y staggered, exit opacity+y+scale. Respeta useReducedMotion.

### Archivo 3: `src/components/rp/crm/crm-vip.tsx` (~620 líneas)
Export `CrmVip`. Clasificación VIP configurable + sugerencias IA + reglas.

- **Tipos**: `VipTier` (id, name, color, icon, minLtv, minVisits, benefits[], clients, isSystem, category "tier"|"frequency"), `VipSuggestion`.
- **TierIcon component** declarado FUERA del render (cumple `react-hooks/static-components`): resuelve icono por nombre desde `ICON_MAP` (Medal/Award/Crown/Gem/Diamond/Star/Coffee/Moon), fallback Star.
- **5 tiers VIP** con colores especificados: Bronce (#CD7F32, Medal, LTV 0, 421), Plata (#C0C0C0, Award, LTV 800, 198), Oro (#D4AF37, Crown, LTV 2500, 87), Black (#1a1a1a con ring gold + glow, Gem, LTV 5000, 23), Diamond (#B9F2FF, Diamond, LTV 10000, 8).
- **3 categorías frecuencia**: Frecuente (#3DD6C9 teal, Coffee, 142), Ocasional (#E8C766, Star, 388), Dormido (#9CA3AF, Moon, 124).
- **Header**: Crown gold + título "Clasificación VIP y fidelización" + badge demo.
- **Tier overview**: sección "Niveles VIP" + scroll horizontal `rp-scroll-thin` `snap-x` con 5 TierCards (cada una w-[260px] sm:w-[280px] shrink-0 snap-start); debajo "Categorías de frecuencia" grid sm:grid-cols-3.
- **TierCard**: accent stripe top con gradiente del color del tier; icono en caja coloreada; nombre font-display en color del tier; thresholds LTV/visitas (si category=tier) en 2 cells; big client count en color del tier; benefits list con bullet coloreado; botón "Configurar" + badge "sistema" si isSystem. Black tier tiene ring-1 gold + boxShadow glow.
- **ConfigureTierDialog** (max-w-lg): nombre input; LTV mínimo + Visitas mínimas inputs numéricos (si tier); textarea beneficios (uno por línea); on save actualiza tier + toast.
- **AI Suggestions**: header "Sugerencias de reclasificación (IA)" con Sparkles gold + badge "X pendientes"; grid lg:grid-cols-2; 5 sugerencias demo (Vera Mendoza Oro→Black 88%, Javier Puente Plata→Oro 92%, Lola Ríos Black→Diamond 74%, Tomás Castro Oro→Plata 68% downgrade, Marta Núñez Bronce→Plata 81%).
- **SuggestionRow**: avatar inicial + nombre; tier badges con colores reales (tierColorMap) + ArrowRight (gold si upgrade, amber si downgrade); reason; confidence badge con tooltip (emerald ≥80, gold ≥60, amber <60); factors chips teal; actions Aplicar (gold) / Rechazar (ghost destructive) / Posponer (outline). Empty state con ShieldCheck teal.
- **Note**: "La IA sugiere. La decisión es tuya y siempre reversible desde el panel de auditoría."
- **Collapsible "Cómo se calcula la clasificación"**: 8 factores ponderados (Gasto total LTV 30%, Frecuencia 20%, Recencia 10%, Ticket medio 10%, Interacción 8%, Antigüedad 7%, Rentabilidad 8%, Reseñas 7%) cada uno con weight badge gold + descripción. ChevronDown rota 180° al abrir.
- **Disclaimer**: ShieldCheck teal + "La clasificación VIP es configurable por organización. La IA puede sugerir, pero la decisión final es auditable y reversible."
- Animaciones: AnimatePresence en tier scroll y suggestions (opacity+y staggered, exit). Collapsible con ChevronDown rotate. Respeta useReducedMotion.

### Lint
- Primer run: 2 errores `react-hooks/static-components` en `crm-vip.tsx` por `const Icon = getIcon(...)` durante render.
- Fix: extraje `TierIcon` component declarado fuera del render (toma `name` como prop, resuelve internamente). Reemplacé los 2 usos (`<Icon />` en TierCard, `React.createElement(getIcon(...))` en dialog) por `<TierIcon name={...} />`.
- Limpieza: removí imports no usados (`TrendingUp`, `CalendarClock`) y variable `isDiamond` no usada.
- `bun run lint` → **EXIT CODE 0, 0 errores, 0 warnings**. Dev log: ✓ Compiled limpio.

## Stage Summary
3 componentes Fase 6 entregados en `/home/z/my-project/src/components/rp/crm/`:
- `crm-intelligence.tsx` — Motor de 6 predicciones IA explicables (LTV, retorno, churn, canal, timing, campaña) con 3 clientes demo (Oro/Black/Nuevo), confidence bars animadas, data quality badges con tooltip, fallback INSUFFICIENT con reglas deterministas, recalcular con loading 1s, modelVersion/calculatedAt/expiresAt en cada card, disclaimer "La IA recomienda, el humano decide".
- `crm-segments.tsx` — 10 segmentos demo (estáticos/dinámicos/predictivos), stats row 4 KPIs, filter tabs por tipo, constructor de reglas completo (campo+operador dinámico+valor, añadir/quitar condiciones, consent toggle, live preview "Este segmento tendría ~X clientes"), actions ver/pausar/activar/editar/eliminar con AlertDialog de confirmación, consent icon con tooltip.
- `crm-vip.tsx` — 5 tiers VIP (Bronce→Plata→Oro→Black→Diamond con colores hex especificados, Black con ring gold + glow) + 3 categorías frecuencia (Frecuente/Ocasional/Dormido), scroll horizontal con snap, dialog configurar tier (umbrales+beneficios), 5 sugerencias IA de reclasificación (aplicar/rechazar/posponer), Collapsible "Cómo se calcula" con 8 factores ponderados, disclaimers de auditabilidad.

Todos los archivos: `"use client";` inicial, shadcn/ui + lucide-react + framer-motion con `useReducedMotion`, `rp-glass`/`rp-gold-text`/`rp-teal-text`/`rp-glow-gold`/`rp-scroll-thin`. Dark theme premium gold #D4AF37 + turquoise #3DD6C9 + glassmorphism. Animaciones transform+opacity only. Sin horizontal overflow, mobile-first con touch targets ≥36-44px. Copy 100% es-ES, badge "demo" en los 3 headers.

Lint: 0 errores, 0 warnings. Dev server: ✓ Compiled estable.
