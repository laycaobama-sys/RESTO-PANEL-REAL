# Task ID: AI-OS-DASHBOARD-AGENTS
# Agent: full-stack-developer

## Summary

Construcción de los 2 componentes centrales del **RestoPanel AI OS** en Next.js 16 + TypeScript + Tailwind CSS v4 + Framer Motion, con premium dark theme (gold #D4AF37, turquoise #3DD6C9, glassmorphism).

## Files Created

### 1. `/home/z/my-project/src/components/rp/ai-os/ai-os-dashboard.tsx`
**Export:** `AiOsDashboard` (named + default) — ~1320 líneas, client component.

Dashboard del "sistema operativo" del restaurante. Responde a 3 preguntas: ¿Qué pasa ahora? ¿Qué riesgo gestiono? ¿Qué acción tomo?

7 secciones scrollable single-page:

1. **Executive Query Bar** — input grande "Pregúntale al AI OS…" + botón Enviar (gold gradient). Pre-cargado con query demo "¿Cómo va mi restaurante hoy?" y respuesta estructurada con 5 sub-bloques diferenciados por badges:
   - Estado confirmado (emerald): ocupación 84%, facturación €4.380, 17 reservas pendientes, 20/24 mesas, 5 grupos en waitlist.
   - Predicciones (teal): riesgo no-show 3 mesas (82%), ocupación 22:00 92% (85%), facturación cierre €5.100 (78%).
   - Recomendaciones (gold): waitlist automática, mover mesas Carlos→Laura, responder 4 reseñas.
   - Acciones pendientes (amber): 2 CTAs inline [Confirmar][Rechazar] → toasts.
   - Ejecutado (emerald + checkmark): "Dashboard actualizado con datos en tiempo real".
   - Sources: "D1 + Durable Objects + CRM + Reviews API · Actualizado hace 12s".
   - **Streaming effect**: typing indicator (3 dots bounce) → reveal char-by-char (~2s) → fade-in progresivo de las 5 secciones (220ms entre cada una).

2. **Real-time Operations Panel** — grid 1/2/4 cols: Mesas (mini floor plan 4×6, 24 dots, 20 gold/2 amber/2 gray), Reservas (mini timeline SVG 13-23h con peak 21:00 destacado), Personal (6 staff load bars animadas con Carlos 92% OVERLOADED), Alertas (3 alertas con SeverityBadge).

3. **AI Recommendations** — 4 cards grid 1/2 cols con: problema bold, impacto estimado (gold badge), recomendación, chips de justificación, ConfidenceBadge (Alta/Media/Baja), RiskBadge (Ninguno/Bajo/Medio), AgentBadge ("Generado por: Revenue Agent"), botones "Ejecutar"/"Posponer"/"Ignorar"/"Ver análisis" → Dialog con razonamiento completo.

4. **Agent Activity Panel** — 6 agentes en grid 1/2/3 cols, cada uno con icon + StatusDot (active=ping emerald, idle=gray, warning=amber), tarea actual italic, contador output. Click expande → objetivo, tools chips, outputs recientes.

5. **Memory & Context** — 4 memorias demo con MemoryTypeBadge (Preferencia/Regla operativa/Restricción/Instrucción temporal), createdBy + date + expires, acciones Edit/Delete (AlertDialog confirm). Input "Recuerda que…" + botón "Guardar memoria" → toast.

6. **Audit Timeline** — 12 entradas inmutables color-coded (executed/pending/rejected/auto/completed), cada una con timestamp, actor con icon (agent/user/system), acción + recurso, AuditResultPill. Botón "Exportar auditoría".

7. **Quick Actions** — 6 botones grandes (min-h 88px) grid 2/3 cols: Resumen del día (streaming), Responder reseñas, Crear campaña, Ver plano, Generar informe (dialog), Configurar IA.

Footer:
- Plan limit indicator: "Plan: Growth · Consultas IA: 1.847/5.000 este mes" + progress bar 37%.
- Security notice: "AI OS aislado por organización · Permisos validados · Toda acción queda auditada · Protección anti prompt injection activa."

4 diálogos: Recommendation Analysis, Daily Summary Streaming, Executive Report Preview (7 secciones), Delete Memory Confirm (AlertDialog).

### 2. `/home/z/my-project/src/components/rp/ai-os/ai-os-agents.tsx`
**Export:** `AiOsAgents` (named + default) — ~1430 líneas, client component.

Panel del Sistema Multi-Agente. Cumple el interface Agent dado (id, name, icon string, status, objective, tools, dataSources, limits, currentTask, recommendationsGenerated, actionsExecuted, actionsPending, qualityScore, lastActiveAt, decisionLog).

- **Header** "Sistema Multi-Agente" + badge "demo" + badge "Cloudflare Workers AI" + modelo `@cf/meta/llama-3.1-8b-instruct`.
- **Executive Agent** (top, prominent rp-glass-strong + rp-glow-gold): icon Crown gradient gold, status Active, summary completo del rol coordinador, tarea actual, QualityRing 94% (emerald), 3 stats, botón "Generar informe ejecutivo" → Dialog con 7 secciones (Resumen, Reservas, Ingresos, Clientes, Reputación, Operaciones, Recomendaciones Prioritarias).
- **6 Agent cards** (grid 1/2/3 cols):
  1. Revenue Agent — Active — quality 88% (emerald).
  2. Marketing Agent — Active — quality 82% (emerald).
  3. Reputation Agent — Active — quality 91% (emerald).
  4. Operations Agent — Warning — quality 85% (emerald).
  5. Finance Agent — Active — quality 79% (gold).
  6. HR Agent — Idle — quality 0% / "Datos insuficientes" (gray).

  Cada card: icon + StatusBadge, objetivo, tarea actual italic, 3 stats grid, QualityRing SVG circular animado (green ≥80, gold ≥60, red <60), último tiempo de actividad, sección expandible con DecisionLog (3-4 entradas con confidence), ToolsChips, DataSourcesChips, LimitsList, botones "Ver detalle" (Dialog) / "Pausar agente" (AlertDialog) / "Activar agente" (AlertDialog).
- **Action classification legend** (3 cards grid 1/3 cols): 🟢 Automática (emerald) / 🟡 Con confirmación (amber) / 🔴 Prohibida sin autorización (rose).
- **Footer**: security notice sobre límites declarados + decision log + auditoría.

### 3. `/home/z/my-project/src/components/rp/ai-os/ai-os-view.tsx`
**Export:** `AiOsView` (named + default) — ~75 líneas.

Wrapper con toggle entre Dashboard y Multi-Agente (AnimatePresence mode=wait, useReducedMotion) para exposición unificada como sección "AI OS" en el sidebar.

## Files Modified

### `/home/z/my-project/src/components/rp/app/nav-store.ts`
- Añadido `"ai-os"` al tipo `Section` (sin tocar `"ai-os-actions"` ni `"ai-os-predictions"` de otros agentes).

### `/home/z/my-project/src/components/rp/app/app-shell.tsx`
- Añadida entrada NAV `{ id: "ai-os", label: "AI OS", icon: BrainCircuit, group: "Plataforma" }`.
- Añadido lazy import en SectionRenderer: `"ai-os": React.lazy(() => import("@/components/rp/ai-os/ai-os-view").then((m) => ({ default: m.AiOsView })))`.
- Mantuve intactos los entries `ai-os-actions` y `ai-os-predictions` ya presentes.

## Design System Compliance

- **Dark theme premium**: tokens `rp-glass`, `rp-glass-strong`, `rp-glow-gold`, `rp-glow-teal`, `rp-scroll-thin` ya definidos en globals.css.
- **Paleta estricta**: gold #D4AF37, gold-soft #E8C766, gold-deep #A8862A, teal #3DD6C9, amber (pending/warnings), emerald (confirmed/executed), rose (critical/rejected). Sin azul/índigo.
- **Tipografía**: Fraunces (display), Inter (UI), JetBrains Mono (datos/timestamps/IDs).
- **Glassmorphism**: rp-glass en cards, rp-glass-strong + rp-glow-gold en secciones hero.
- **Animaciones**: solo transform (y:8→0) + opacity vía framer-motion. `useReducedMotion()` respetado en typing dots, fade-ins, stagger, AnimatePresence mode=wait.
- **Touch targets**: min-h-[44px] en todos los botones, min-h-[88px] en quick actions.
- **Responsive**: grid 1→2→4 cols en ops, 1→2 cols en recommendations, 1→2→3 cols en agents, 2→3 cols en quick actions. overflow-x-auto rp-scroll-thin donde necesario.
- **Accesibilidad**: aria-labels, aria-expanded, sr-only para QualityRing, roles grid/gridcell en floor plan.
- **es-ES**: todo el copy en español. Todos los datos demo con badge "demo".
- **AI model**: Cloudflare Workers AI `@cf/meta/llama-3.1-8b-instruct` visible en headers de ambos componentes (NO OpenAI).
- **5 distinciones de output**: confirmed (emerald) | predictions (teal) | recommendations (gold) | pending (amber) | executed (emerald+check) — siempre presentes en la respuesta del AI OS.

## Lint Status

```
$ bun run lint
$ eslint .
# (no output = pass)
```

**Resultado:** 0 errores, 0 warnings en todos los archivos del proyecto.

### Issues encontrados y resueltos:
1. **`react-hooks/static-components` error (2 ocurrencias)** en ai-os-agents.tsx por `const Icon = getIcon(agent.icon)` dentro de componentes. La regla trata cualquier asignación de componente desde función como "creating component during render".
   - **Intento 1 fallido**: creado wrapper `AgentIcon` con `const Icon = getIcon(name)` → mismo error persistente.
   - **Solución final**: `AgentIcon` con `switch (name)` que retorna directamente `<Crown className=... />`, `<TrendingUp className=... />`, etc. — cada lucide component referenciado por nombre sin variable intermedia.
2. **Imports no usados**: removidos `type LucideIcon` y `ICON_NAMES` const de ai-os-agents.tsx tras la refactorización del switch.

## Dev Server Status

```
GET / 200 OK (compile ~200ms-1s, render ~130ms-820ms)
✓ Compiled in 200ms / 218ms / 341ms / 870ms / 1022ms
```

Sin runtime errors recientes. Componentes lazy-loaded vía React.lazy en el SectionRenderer del AppShell. ErrorBoundary del app-shell captura cualquier error de componente lazy sin crashear toda la app.

## Preview Access

El componente está accesible vía el sidebar del AppShell: grupo "Plataforma" → entrada "AI OS" (icono BrainCircuit). Al hacer click, carga `AiOsView` que ofrece toggle entre:
- **Dashboard**: `AiOsDashboard` (default).
- **Sistema Multi-Agente**: `AiOsAgents`.

Ruta: landing → "Acceder al panel" / "Ver dashboard" → AppShell view → sidebar → Plataforma → AI OS.

## Notes for Downstream Agents

- **No tocar** los archivos `ai-os-actions.tsx` y `ai-os-predictions.tsx` creados por otros agentes paralelos.
- El componente `AiOsView` (wrapper) es el punto de entrada recomendado para navegación; usar `AiOsDashboard` y `AiOsAgents` directamente también es válido.
- El interface `Agent` está definido en `ai-os-agents.tsx` y puede ser reutilizado por otros componentes que necesiten mostrar agentes.
- `AgentIcon` (wrapper con switch sobre nombre) puede reutilizarse para renderizar iconos de agentes por nombre string sin violar `react-hooks/static-components`.
- Para añadir nuevos agentes: editar el array `SPECIALIZED_AGENTS` en `ai-os-agents.tsx` y el array `DEMO_AGENTS_STRIP` en `ai-os-dashboard.tsx` (mantener consistencia de ids).
