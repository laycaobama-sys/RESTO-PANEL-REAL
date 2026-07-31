# Task ID: AI-OS-ACTIONS-PREDICTIONS — Agent: full-stack-developer

## Summary
Built 2 new components for the RestoPanel AI OS module:
1. **AiOsActions** — Actions Engine with approval workflow, action types catalog, and execution log
2. **AiOsPredictions** — Predictions Panel with 12 forecast models, confidence gauges, and model performance metrics

## Files Created
- `/home/z/my-project/src/components/rp/ai-os/ai-os-actions.tsx` — export `AiOsActions`
- `/home/z/my-project/src/components/rp/ai-os/ai-os-predictions.tsx` — export `AiOsPredictions`

## Files Modified (wiring)
- `/home/z/my-project/src/components/rp/app/nav-store.ts` — added `"ai-os-actions" | "ai-os-predictions"` to `Section` union type
- `/home/z/my-project/src/components/rp/app/app-shell.tsx` — added `Zap` + `Gauge` icon imports, 2 NAV entries under "Plataforma" group, 2 lazy imports in `SectionRenderer` map
- `/home/z/my-project/src/components/rp/ai-center/ai-copilot.tsx` — added entries to `SECTION_LABELS` and `SECTION_QUESTIONS` for the 2 new sections

## Features Delivered

### ai-os-actions.tsx (AiOsActions)
- 3-tab layout: **Pendientes** | **Historial** | **Tipos de acción**
- **Pendientes**: 4 demo pending actions (ACT-001 mover reserva MEDIUM, ACT-002 send_campaign HIGH MFA, ACT-003 reply_review LOW auto-eligible, ACT-004 close_reservations HIGH MFA)
- Each pending card shows: ID (mono), type badge, risk badge (low=green, medium=gold, high=amber, critical=red), confidence badge, auto-eligible badge, title + description, affected entity, impact estimate (gold pill), data used chips, agent pill (Bot icon), relative created time, reversibility ("Reversible hasta HH:MM" / "No reversible"), approval buttons:
  - "Confirmar" (emerald, for low/medium risk)
  - "Confirmar con MFA" (gold gradient with tooltip "Requiere MFA reciente ≤2 min", for high risk)
  - "Rechazar" (ghost)
  - "Ver detalle" (outline → opens dialog with full info + undo info + rollback plan)
- On approve: status → completed, moved to history, toast "Acción ejecutada (demo)"
- On reject: status → rejected, toast "Acción rechazada"
- **Historial**: 12 demo records (completed/rejected/failed/rolled_back), filter chips (Todas/Completadas/Rechazadas/Fallidas/Revertidas), "Exportar historial" button, "Deshacer" button (teal) for canUndo+within-deadline records (opens AlertDialog confirmation → status rolled_back, toast "Acción revertida (demo)"), "Ver detalle" dialog with timeline (requested → approved → executed → result/error → rollback plan)
- **Tipos de acción**: 3 color-coded CatalogSection:
  - Acciones automáticas (green) — 5 items (drafts, reports, tags, CRM updates, recommendations)
  - Acciones con confirmación (amber) — 7 items (campaigns, schedules, cancellations, promos, etc.) with approver + MFA badges
  - Acciones prohibidas (red) — 5 items (delete data, payments, permissions, sensitive exports, non-consent campaigns) with "Bloqueada por defecto" badge
- Audit note: "Toda acción queda registrada en auditoría inmutable..."

### ai-os-predictions.tsx (AiOsPredictions)
- Header "Predicciones IA" + demo badge + "12 modelos activos · Última actualización: hace X min" + KPIs (confianza media, precisión 30d)
- Category filter Tabs: Todas | Reservas | Ingresos | Operaciones | Clientes | Personal | Inventario (with count badge per category)
- **Prediction grid**: 12 demo predictions covering all 6 categories, each card shows:
  - Category badge (reservations=gold, revenue=emerald, operations=teal, customers=purple, staff=sky, inventory=amber)
  - Label + big value (font-display gold gradient)
  - Horizon (small)
  - **Confidence gauge** (circular SVG: ≥80 green, ≥60 gold, ≥40 amber, <40 red)
  - Trend indicator (up/down/stable with context-dependent color)
  - Data used chips
  - Model version (mono tiny, e.g. "forecast-v2.1")
  - Calculated at (relative)
  - Limitations (amber box if present, e.g. "Costes reales parciales")
  - Recommendation (gold box if present, e.g. "Activar waitlist automática para gestionar la demanda")
  - "Ver detalle" button → dialog with full model info: variables with weight bars, historical accuracy, comparison table (period / predicted / actual)
- **Model performance panel**: 4 metrics (confianza media 76%, precisión 30d 84%, predicciones hoy 47, coste hoy €0,18), "Recalcular predicciones" button (loading 2s → toast "12 predicciones actualizadas"), disclaimer

## Compliance Checklist
- ✓ Both files start with `"use client";`
- ✓ All copy in Spanish (es-ES)
- ✓ Demo data badged ("demo" amber pill in headers + sub-panels)
- ✓ Animations: transform + opacity only (initial/animate/exit on motion.div), `useReducedMotion` respected
- ✓ Every action shows: what (title+description), who it affects (affects field), data used (chips), impact estimate (gold pill), confirm/cancel/undo (3 buttons + AlertDialog for undo)
- ✓ Every prediction shows: probability/confidence (gauge + badge), period (horizon), data used (chips), date (calculatedAt), limitations (amber box)
- ✓ Responsive: lg:grid-cols-2 (pending), md:grid-cols-2 xl:grid-cols-3 (predictions), touch targets ≥44px (min-h-[44px] on buttons), overflow-x-auto rp-scroll-thin on mobile filters
- ✓ Dark theme gold #D4AF37 / turquoise #3DD6C9, glassmorphism (rp-glass / rp-glass-strong)

## Lint & TypeScript Status
- `bun run lint` → **PASS** (no errors, no warnings)
- `tsc --noEmit` → **PASS** (no type errors in ai-os/nav-store/app-shell/ai-copilot files)
- Dev server: compiling successfully, GET / 200 consistent

## Navigation Access
From the RestoPanel app sidebar (Plataforma group):
- **Acciones IA** (Zap icon) → loads `AiOsActions`
- **Predicciones IA** (Gauge icon) → loads `AiOsPredictions`

Both sections are lazy-loaded via `React.lazy` in `SectionRenderer` for code-splitting.
