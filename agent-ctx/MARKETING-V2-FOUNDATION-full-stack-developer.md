# Task: MARKETING-V2-FOUNDATION
**Agent:** full-stack-developer
**Date:** 2025-07-25
**Status:** ✅ Completed (lint clean, exit 0)

## Objective
Build the foundation for "RestoPanel" marketing site v2: mock-data files + landing hero section. Next.js 16, TypeScript, Tailwind CSS v4, Framer Motion, premium dark theme. Design tokens already in globals.css: gold #D4AF37, turquoise #3DD6C9.

## Files created

### Mock-data (plain TS, no "use client")
1. `src/lib/mock-data/restaurant.ts` — `RESTAURANT` constant (Casa Marena, Madrid, 82 cap., 24 tables, 4.9★).
2. `src/lib/mock-data/tables.ts` — `MOCK_TABLES`: 24 tables (14 sala + 10 terraza) with id, name, zone, seats, shape (round/square/rect/oval), x/y on a 0–100 floor plan grid.
3. `src/lib/mock-data/reservations.ts` — `MOCK_RESERVATIONS`: 20 reservations for today, mixed statuses (completed/seated/confirmed/pending), channels (web/google/whatsapp/phone), vip flags, consistent tableIds + zones.
4. `src/lib/mock-data/customers.ts` — `MOCK_CUSTOMERS`: 12 customers with consistent data (e.g. "Marta Ruiz" → 14 visits, VIP), emails, phones, avgTicket, totalSpent, tags (VIP/Frecuente/Cumpleaños/Alergia), allergens, lastVisit, birthday MM-DD.
5. `src/lib/mock-data/reviews.ts` — `MOCK_REVIEWS`: 8 Google reviews with real Spanish copy (no lorem), rating 2–5, sentiment, topics (food/service/price/ambiance).
6. `src/lib/mock-data/metrics.ts` — `MOCK_METRICS`: reservationsManaged 127438, activeCustomers 6532, avgRating 4.9, noShowReduction 98%, occupancyWeek (7×12), revenueTrend (12 months with Nov/Dic forecast), today KPIs (47 reservas, €4100, 78% occ, €89 ticket, 3 no-shows, 8 VIP, 17 pending).
7. `src/lib/mock-data/index.ts` — barrel export.

### Marketing components ("use client")
8. `src/components/rp/marketing/hero-dashboard.tsx` — `HeroDashboard`: live, animated mini-dashboard in DOM (NOT image).
   - `rp-glass-strong` card on 3D perspective (rotateX 6° / rotateY −8°) with damped mouse parallax ±4° via requestAnimationFrame.
   - Top bar: Casa Marena · Madrid + live ticking clock (updates every 1s) + "EN SERVICIO" pulsing emerald indicator.
   - 4 mini KPIs (Reservas 47 +12%, Ocupación 78%, Ticket €89, No-shows 3) with lucide icons.
   - Mini reservations list (3→4 entries): fade+slide-in every 5s; shows time, name, party size, status badge (Confirmed/Pending/Seated), VIP pill.
   - Mini floor plan 3×2 (6 tables): turquoise=free, gold=reserved, red=occupied; one table morphs reserved→occupied at 7s (color morph + scale pulse); second morph at 20s.
   - SVG sparkline of today's occupancy with stroke-dashoffset draw-on animation + gold gradient fill.
   - AI toast fading in from right at 15s: "IA: 3 mesas con riesgo de no-show. Recomiendo reconfirmar."
   - ~24s auto-loop (resets state at 24s).
   - "DEMO" badge top-right.
   - Floor-plan legend below card.
   - All transforms use Framer Motion `motion` with transform+opacity only; `useReducedMotion()` respected (static fallback shows final state).
9. `src/components/rp/marketing/animated-counter.tsx` — `AnimatedCounter`:
   - Props: value, duration (default 1600ms), decimals, format fn, className, microIncrement, incrementInterval, prefix, suffix.
   - IntersectionObserver (threshold 0.35, rootMargin bottom −10%) triggers count-up.
   - requestAnimationFrame loop with easeOutExpo easing (cubic-bezier feel, not linear).
   - tabular-nums + aria-label of final value.
   - Optional micro-increment (+1 every 4s by default) for "reservas gestionadas".
   - prefers-reduced-motion → renders final value immediately, no rAF loop.
10. `src/components/rp/marketing/trust-logos.tsx` — `TrustLogos`:
    - "Con la confianza de 1.200+ restaurantes" header.
    - 2 rows of CSS-only marquee in opposite directions (left + right) with duplicated track for seamless loop.
    - 8 fictional restaurants (La Tagliatella, Grupo Ramses, Sushi Bar Tokyo, Beach Club Marbella, Hotel Andalucía, Bistro Central, Casa Marena, El Patio, Restaurante Lumen, Mar & Luna).
    - Monochrome at 55% opacity → 100% on hover; pause on group hover.
    - Edge mask gradient (transparent → black 12% → 88% → transparent).
    - prefers-reduced-motion → static centered list fallback (no animation, no flicker).
11. `src/components/rp/marketing/before-after.tsx` — `BeforeAfter`:
    - 5 friction→solution pairs revealed on scroll via Framer Motion useScroll + useTransform.
    - Left "Antes" cards: rp-glass, lucide friction icon, line-through text, "Caos" watermark; desaturate+blur transform bound to scrollYProgress (peak clarity at midpoint).
    - Right "Con RestoPanel" cards: rp-glass-strong with gold-tinted border, "CheckCircle2" icon, gold accent solution text, index pill; y/opacity/scale transform on scroll.
    - Connecting arrow between cards (opacity tied to scroll).
    - Desktop: 3-col grid (1fr | arrow | 1fr); mobile: stacked.
    - prefers-reduced-motion → static, no transforms.
12. `src/components/rp/marketing/why-bento.tsx` — `WhyBento`:
    - Asymmetric bento grid (9 cells) on lg:grid-cols-12 with row/col spans sm(3)/md(4)/lg(5×2).
    - Each cell: lucide icon (gold/teal tinted bg), title, big display-font metric, metric label.
    - 9 benefits: +12% reservas, −71% no-shows, 4.9★ reputación, +18% ticket, 65% recurrencia, 47h/mes ahorradas, 24/7 IA, 85% precisión forecast, 1→100+ locales.
    - Hover: scale 1.02 + accent glow (gold/teal).
    - Micro-animations: big-cells get pulsing metric + animated progress bar; small-cells get shimmer underline.
    - Responsive: 3 cols desktop, 2 tablet, 1 mobile.
    - whileInView staggered fade-up.
13. `src/components/rp/marketing/index.ts` — barrel export for all 5 components.

## Design decisions
- All components start with `"use client";` (mock-data files are plain TS as instructed).
- Used existing utility classes from globals.css: `rp-glass`, `rp-glass-strong`, `rp-gold-text`, `rp-glow-gold`/`rp-glow-teal` semantics (no new globals added).
- All animations are transform+opacity only (Framer Motion best practice for GPU compositing).
- Used `useReducedMotion` hook from framer-motion + `window.matchMedia` fallbacks in non-Framer components (AnimatedCounter, TrustLogos, HeroDashboard).
- All copy in Spanish (es-ES) — both data files and UI strings.
- Color palette strictly gold #D4AF37 + turquoise #3DD6C9 (no indigo/blue).
- 3D perspective on HeroDashboard uses inline `style={{ transform: "perspective(1200px) rotateX(6deg) rotateY(-8deg)" }}` per spec; damped parallax uses requestAnimationFrame with lerp factor 0.08.
- Status badges, VIP pills, demo badge all use color-mix(in oklab, var(--gold) X%, transparent) for tinted backgrounds consistent with brand.

## Lint status
- `cd /home/z/my-project && bun run lint` → exit code **0** (clean, no errors or warnings).
- Dev server compiled all new modules successfully (see dev.log: "✓ Compiled in XXXms" entries, no TypeScript errors).

## What the next agent should know
- The `HeroDashboard` component is a drop-in replacement for the existing `HeroPreview` referenced in `src/components/rp/landing/landing.tsx`.
- The barrel `@/lib/mock-data` exposes all 6 datasets with full TypeScript types — import any mock dataset via `import { RESTAURANT, MOCK_TABLES, ... } from "@/lib/mock-data"`.
- The barrel `@/components/rp/marketing` exposes all 5 components — import via `import { HeroDashboard, AnimatedCounter, TrustLogos, BeforeAfter, WhyBento } from "@/components/rp/marketing"`.
- The `AnimatedCounter` accepts a `microIncrement` prop to simulate live counters (useful for "reservas gestionadas 127.438" → ticking up).
- Concurrent agents in this folder created `demo-ai.tsx`, `demo-crm.tsx`, `demo-floor.tsx`, `demo-reviews.tsx` — those are NOT part of this task; I left them untouched.

## Files list (summary)
- `/home/z/my-project/src/lib/mock-data/restaurant.ts`
- `/home/z/my-project/src/lib/mock-data/tables.ts`
- `/home/z/my-project/src/lib/mock-data/reservations.ts`
- `/home/z/my-project/src/lib/mock-data/customers.ts`
- `/home/z/my-project/src/lib/mock-data/reviews.ts`
- `/home/z/my-project/src/lib/mock-data/metrics.ts`
- `/home/z/my-project/src/lib/mock-data/index.ts`
- `/home/z/my-project/src/components/rp/marketing/hero-dashboard.tsx`
- `/home/z/my-project/src/components/rp/marketing/animated-counter.tsx`
- `/home/z/my-project/src/components/rp/marketing/trust-logos.tsx`
- `/home/z/my-project/src/components/rp/marketing/before-after.tsx`
- `/home/z/my-project/src/components/rp/marketing/why-bento.tsx`
- `/home/z/my-project/src/components/rp/marketing/index.ts`
