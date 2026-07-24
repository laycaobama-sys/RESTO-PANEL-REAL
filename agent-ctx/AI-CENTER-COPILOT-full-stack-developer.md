# Task: AI-CENTER-COPILOT

- **Task ID:** AI-CENTER-COPILOT
- **Agent:** full-stack-developer
- **Parent orchestrator:** AI-ENGINE-START (main)
- **Sibling task:** ai-knowledge.tsx + ai-menu.tsx (Subagent B, paralelo)

## Scope

Construir 2 componentes para el Motor de IA RestoPanel:
1. `AiCenter` — dashboard de consumo IA con 5 tabs (Resumen / Uso / Errores / Límites / Modelos).
2. `AiCopilot` — asistente flotante global con chat contextual.

## Files touched

### Created
- `/home/z/my-project/src/components/rp/ai-center/ai-center.tsx` (~1100 líneas, export `AiCenter`)
- `/home/z/my-project/src/components/rp/ai-center/ai-copilot.tsx` (~600 líneas, export `AiCopilot`)

### Modified
- `/home/z/my-project/src/components/rp/app/nav-store.ts` — añadido `"ai-center"` al tipo `Section`.
- `/home/z/my-project/src/components/rp/app/app-shell.tsx` — añadida entrada NAV (`BrainCircuit` icon, group Plataforma), lazy import en `SectionRenderer`, render global de `<AiCopilot />` dentro de `AppShell`.

## Design alignment

- **Theme**: dark mode default, gold `#D4AF37` (acento principal), teal `#3DD6C9` (info/fuentes), glassmorphism (`rp-glass` / `rp-glass-strong`).
- **Typography**: Fraunces (display) + Inter (UI) + JetBrains Mono (datos). Reutilizado sin tocar layout.
- **Motion**: solo transform + opacity. `useReducedMotion()` respetado en todos los animated elements.
- **Styling utilities**: `rp-glass`, `rp-glass-strong`, `rp-scroll-thin`, `rp-gold-text`, `rp-teal-text` ya definidos en `globals.css`.

## AiCenter — features

### Tabs
- **Resumen** (default)
- **Uso**
- **Errores**
- **Límites**
- **Modelos**

### Resumen
- Header: "Centro de IA" + DemoBadge + indicador "Workers AI activo" (green dot pulsante).
- KPI strip: 8 KPIs en grid 4-col (2-col móvil). Cada KPI: icono, label, value (display font), delta con trend arrow (verde/rojo según goodDirection).
  1. Solicitudes hoy: 1.847 (+12% vs ayer)
  2. Tokens utilizados: 2.4M (+8%)
  3. Tiempo medio respuesta: 1.2s (−0.1s)
  4. Ahorro estimado: 47h/mes
  5. Automatizaciones activas: 12 (+2)
  6. Coste IA mes: €42.80 (+€3.20)
  7. Tasa de éxito: 99.2% (−0.1pp)
  8. Cache hit ratio: 34% (+4pp)
- Service status: 4 cards (Workers AI / Vectorize / AI Gateway / R2) con StatusPill (Operativo · green pulsante) y 3 métricas cada una.
- Uso por módulo: 6 barras horizontales animadas (scaleX con transformOrigin left) con colores de marca.
- Uso por usuario: top-4 con avatar gold gradient initials + barra de progreso teal.
- Tendencia de coste: SVG line+area chart 30 días, gradient gold, animación pathLength, grid lines sutiles.
- Comparativa vs mes anterior: 4 deltas (Tokens +8%, Coste +€3.20, Peticiones +12%, Latencia −0.1s) con iconos y colores semánticos.
- Actions bar: 4 botones (Reindexar conocimiento / Limpiar caché IA / Ver historial completo / Exportar consumo) con AlertDialog confirm para los 2 primeros (con copy exacto del spec) y loading 2s en reindex con toast de progreso y completion.

### Uso
- Summary stats: 6 métricas (peticiones totales / tokens medios / latencia media / coste total / tasa fallback / tasa error).
- Filtros: Select de módulo + Select de resultado + Select de fecha (todas / hoy).
- Tabla desktop (lg+): 10 columnas (hora / módulo / usuario / modelo / v / tokens in-out / latencia / coste / resultado / acción).
- Cards móvil (<lg): mismo dato en formato compacto con grid de 3 stats.
- 18 ejecuciones demo con metadata completa + promptExcerpt + responseExcerpt + redactedPII.
- "Ver detalle" → Dialog con grid 2-col de metadata + prompt + respuesta + nota de PII redactada.

### Errores
- Chart SVG de tasa de error 7 días con gradient rojo (oklch 0.68 0.2 22), puntos + labels de día.
- Log de 7 errores con 5 tipos: timeout, rate_limit, model_error, prompt_injection_blocked, insufficient_data. Cada uno con color de badge específico (ámbar / naranja / rosa / gold / teal).
- Tabla desktop + cards móvil.
- Botones "Reintentar" (toast demo) y "Ver detalle" (Dialog con mensaje + detalle técnico).
- Indicador de estado Resuelto/Abierto.

### Límites
- 5 límites con progress bars animadas:
  1. Peticiones/mes: 1.847 / 50.000 (3.7%)
  2. Tokens/mes: 2.4M / 10M (24%)
  3. Coste/mes: €42.80 / €100 (42.8%)
  4. Concurrencia: 2 / 10
  5. Vectorize queries/mes: 890 / 100.000 (0.9%)
- Tono ok/warn/crit: <60% teal, 60-80% gold, >80% rojo con mensaje de alerta.
- Botón "Ajustar límites" → Dialog con inputs editables + switch "Alertar al 80%" + nota de permiso manager.

### Modelos
- 4 modelos:
  1. `@cf/meta/llama-3.1-8b-instruct` — General purpose — 1.420 req — p50 1.1s — €0.18/M tokens — Activo
  2. `@cf/meta/llama-3.2-3b-instruct` — Fast responses — 380 req — p50 0.4s — €0.10/M tokens — Activo
  3. `@cf/baai/bge-base-en-v1.5` — Embeddings — 12.400 embeddings — p50 8ms — €0.01/M — Embeddings
  4. `Fallback determinista` — Reglas — 47 req — p50 <1ms — €0 — Fallback
- Cada card con grid 3-col (peticiones / latencia p50 / coste).
- Botón "Configurar modelo default" → Dialog con radio cards (solo modelos no-fallback / no-embeddings) + switch "Activar fallback determinista en error".

## AiCopilot — features

### Floating button
- Fixed bottom-right (bottom-4 right-4 móvil, bottom-6 right-6 desktop).
- Circular h-14 (móvil) / h-16 (desktop), gradient gold-soft → gold → gold-deep, ring-2 gold/40, ring-offset-2.
- Glow ring con animate-ping radial gradient.
- Sparkles icon (rotates to X on open).
- Notification dot turquesa cuando hay new AI insights (mientras cerrado).
- Spring animation (stiffness 280, damping 22).

### Panel
- `rp-glass-strong` + ring-1 gold/30 + shadow-2xl.
- Desktop: 400px width, right-4, bottom-24.
- Móvil: full-width, bottom-0 (rounded-t-2xl).
- Height: min(560px, 85vh) móvil, min(560px, calc(100vh-8rem)) desktop.
- Slide-up + scale spring (320/30).

### Header
- Avatar gold gradient + Sparkles.
- "Copilot IA" (display font).
- Badge "Llama 3.1 8B" (Cpu icon, mono font).
- Status: green dot pulsante + "Workers AI · en línea".
- RoleSelector: 3 pills Owner/Manager/Staff (default Owner).
- Botones minimize (Minus) + close (X), 44px touch targets.

### Context indicator
- "Contexto: {sección} · {local}" leído de `useNav(section, location, org)`.
- Icon MessageSquare teal.

### Chat area
- Scrollable, rp-scroll-thin, aria-live="polite".
- User messages: burbuja gold gradient, derecha, font-medium black text.
- AI messages: glass burbuja, izquierda, avatar gold gradient Sparkles.
- Typing indicator: 3 dots gold-soft con stagger (delay 0.15s), opacity + y animation.
- Streaming: cursor dorado pulsante al final del texto mientras se revela.

### AI response structure
- Brief answer (texto streamed).
- Data source chips: turquesa, mono uppercase, dot bullet.
- Confidence badge: Alta (verde), Media (ámbar), Baja (rojo).
- "Ver en módulo" button: gold/40 border, llama `useNav.go(section)` para navegar.
- "No tengo datos suficientes" notice (ámbar, AlertTriangle) cuando no hay match.
- "Tu rol no permite consultar" notice (rosa, Lock) cuando staff intenta query restringida.

### Quick actions
- 4 chips context-aware según `section` actual (`SECTION_QUESTIONS` map con 17 secciones + fallback `DEFAULT_QUESTIONS`).
- Chips: rounded-full, border-border/60, hover gold/40.
- Click envía automáticamente.

### Input
- Text input + Mic icon (decorativo, disabled) + Send button (gold gradient).
- Enter para enviar (sin Shift).
- Disabled durante typing/streaming.

### Streaming simulation
- Al enviar: añade user msg, setIsTyping(true).
- Tras 650ms: setIsTyping(false), busca respuesta, si hay permission check, crea AI msg con `streaming: true` y contenido vacío.
- `streamResponse(id, fullText)`: setInterval 20ms, chunks de `max(2, ceil(len/50))` chars, actualiza `content` del msg. Al terminar (i >= len), limpia interval y `streaming: false`.
- Cleanup en unmount.

### Demo responses
- 12 entradas en `DEMO_RESPONSES` map (incluye las 5 del spec: reservas hoy, clientes VIP, ocupación, campaña mejor, facturación mañana).
- 4 marcadas como `restricted` (campañas, facturación) — requieren rol ≥ manager.
- Fuzzy matching: normalize (lowercase, strip punctuation, collapse spaces), si no match exacto, busca por tokens de >3 chars con threshold 60%.

### Security notice
- "IA aislada por organización · Permiso validado · Sin acceso a otros restaurantes".
- ShieldCheck icon emerald.

## Lint status

- Mis 4 archivos (ai-center.tsx, ai-copilot.tsx, nav-store.ts, app-shell.tsx) pasan ESLint limpio.
- Verificado con: `npx eslint src/components/rp/ai-center/ai-center.tsx src/components/rp/ai-center/ai-copilot.tsx src/components/rp/app/app-shell.tsx src/components/rp/app/nav-store.ts` → sin output (no errors).
- 1 error residual en `ai-knowledge.tsx:273` (Subagent B, `react-hooks/immutability` por reasignar `offset` en map callback). No es de mi scope.

## Dev server

- 200 OK en `/` sin errores de compilación tras añadir lazy import y AiCopilot global.
- Compilaciones ~200-1100ms según hot reload.

## Notes for next agents

- `AiCopilot` está renderizado en `AppShell` (dentro del root div), por lo que solo aparece en view "app" (no en landing). Si se requiere también en landing, mover a `page.tsx`.
- `SECTION_QUESTIONS` en ai-copilot.tsx está tipado como `Partial<Record<Section, string[]>>` — añadir nuevas secciones al mapa si se extiende el tipo `Section`.
- `DEMO_RESPONSES` es fácilmente extensible: añadir entradas con texto normalizado como key.
- El RoleSelector es mock local al componente (no persiste en store). Si se necesita rol global, mover a nav-store o un auth store separado.
