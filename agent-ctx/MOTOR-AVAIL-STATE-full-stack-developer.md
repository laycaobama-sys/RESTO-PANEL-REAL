# MOTOR-AVAIL-STATE — full-stack-developer

## Task
Build 2 components for "RestoPanel" Motor de Reservas Enterprise (Availability Engine + State Machine). Next.js 16, TypeScript, Tailwind v4, Framer Motion, premium dark theme (gold #D4AF37, turquoise #3DD6C9, glassmorphism).

## Files created
1. `/home/z/my-project/src/components/rp/reservas/availability-engine.tsx` — exports `AvailabilityEngine`
2. `/home/z/my-project/src/components/rp/reservas/state-machine.tsx` — exports `StateMachine`

## Integration
- Wired both into `/home/z/my-project/src/components/rp/reservas/reservas-view.tsx` via 2 new tabs ("Motor" / "Estados").
- Added icons `Cpu` and `Network` to lucide-react imports.
- Extended `resTab` union type with `"motor" | "estados"`.

## Design system used
- `rp-glass` / `rp-glass-strong` for surfaces.
- `rp-glow-gold` / `rp-glow-teal` for highlights.
- `rp-gold-text` / `rp-teal-text` for accent text.
- `rp-scroll-thin` for custom scrollbars on horizontal timelines and history list.
- `useReducedMotion()` from framer-motion to disable transforms when prefers-reduced-motion.
- shadcn/ui: Button, Badge, Input, Label, Textarea, Select, Dialog, Collapsible.
- lucide-react icons throughout.

## Lint
`bun run lint` → clean, 0 errors.

## Notes for next agents
- The AvailabilityEngine demo slot generator is deterministic (gaussian peak + sinusoidal noise). Adjust `generateSlots()` to plug real backend.
- The StateMachine state graph is defined in `COMMERCIAL_NODES` / `COMMERCIAL_TRANSITIONS` / `OPERATIONAL_NODES` / `OPERATIONAL_TRANSITIONS`. Add new states/transitions there.
- History is color-coded via `HISTORY_TONE` map. Add new action keys there if you extend transitions.
- Drag&drop uses native HTML5 drag events; if you need touch support, swap to pointer-events based library.
