# RESPONSIVE-SUPERADMIN — full-stack-developer

## Task
Audit and fix RESPONSIVE issues in the 5 SuperAdmin views of "RestoPanel" (Next.js 16, Tailwind v4, premium dark theme).
Files audited: super-admin-view, integrations-view, billing-view, team-view, settings-view.

## Work Log

### Audit findings (per file)

**super-admin-view.tsx** (775 lines)
- KPI row (8 metrics): was `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` — missing `xl:grid-cols-8` breakpoint per spec. Also value typography not optimized for 8-col desktop layout.
- Orgs table filters row: Selects had fixed widths `w-40` / `w-36` inside a non-wrapping `flex gap-2` container. On narrow mobile (320–360px) the two selects (160+144+8 = 312px) were too tight against the page padding.
- Orgs table body, MRR chart (`w-full h-auto` + viewBox), rankings (`grid-cols-1 lg:grid-cols-3`), BarChart (`w-28 sm:w-36` label + `flex-1` bar), infra costs (`grid lg:grid-cols-2`), health checks (`grid sm:grid-cols-2 lg:grid-cols-3`), world map (`w-full h-auto` + viewBox), incidents list (`flex items-start gap-3` + `flex-wrap` on summary row) — all already responsive. No changes.

**integrations-view.tsx** (557 lines)
- Tabs: `<TabsList className="bg-muted/60">` had no overflow handling — fixed widths could push content off-screen on small mobile.
- Installed integrations grid: was `md:grid-cols-2 xl:grid-cols-3` — spec asked for `sm:grid-cols-2 lg:grid-cols-3`.
- Marketplace filter Select: `w-44 sm:w-48` inside a `flex-col sm:flex-row` container. On mobile the fixed `w-44` (176px) Select left a lot of empty space.
- Webhooks table: already wrapped in `overflow-x-auto rp-scroll-thin`. No change.
- Dialogs (configure/install/new webhook): all `sm:max-w-lg`, content stacks on mobile, scopes grid `flex-wrap`. No change.

**billing-view.tsx** (394 lines)
- Usage section header: `<div className="flex items-center gap-2 mb-3">` with title + date span + DemoBadge could overflow horizontally on 320–360px.
- Plan + payment method cards: already `grid grid-cols-1 lg:grid-cols-3` with `lg:col-span-2`. Stacks on mobile. No change.
- Usage progress bars: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`. No change.
- Invoices table: already `overflow-x-auto rp-scroll-thin`. No change.
- Pricing dialog (`sm:max-w-2xl`, `grid grid-cols-1 sm:grid-cols-3`) and update card dialog (`sm:max-w-md`, full-width inputs on mobile). No change.

**team-view.tsx** (517 lines)
- Role filter Select: `w-48` (192px) inside `flex-col sm:flex-row` — fixed width wasted space on mobile.
- Members table: already `overflow-x-auto rp-scroll-thin`. No change.
- Roles grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`. No change.
- Permissions matrix: already wrapped in `overflow-x-auto rp-scroll-thin` with sticky left column (`sticky left-0 bg-background/95`). Scrolls horizontally inside its container — page does not overflow. No change.
- Invite dialog (`sm:max-w-md`) and custom role dialog (`sm:max-w-2xl`) already mobile-friendly. No change.

**settings-view.tsx** (553 lines)
- Color pickers: touch target was `h-9 w-9` (36×36px) — below the 44px minimum.
- Tabs: already `flex-wrap h-auto` — wraps on mobile. No change.
- FieldRow: `grid sm:grid-cols-3` — labels stack above inputs on mobile. No change.
- Kill switch banner: `flex items-start gap-3` with `Switch` shrinkable. Already responsive. No change.

### Fixes applied (minimal)

**super-admin-view.tsx**
1. KPI row: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` → `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8`.
2. KPI value typography: `text-2xl sm:text-[1.7rem]` → `text-xl sm:text-2xl xl:text-[1.7rem]` (scales better across breakpoints).
3. Orgs filter Selects container: `flex gap-2` → `flex gap-2 flex-wrap`.
4. Plan Select: `w-40` → `w-full sm:w-40`.
5. Status Select: `w-36` → `w-full sm:w-36 flex-1 sm:flex-none`.

**integrations-view.tsx**
1. TabsList: `bg-muted/60` → `bg-muted/60 w-full justify-start overflow-x-auto rp-scroll-thin h-auto sm:w-auto sm:justify-center`. Added `flex-1 sm:flex-none` to each `TabsTrigger` so they fill width on mobile.
2. Installed integrations grid: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` → `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (matches spec).
3. Marketplace category Select: `w-44 sm:w-48` → `w-full sm:w-48`.

**billing-view.tsx**
1. Usage section header: `flex items-center gap-2 mb-3` → `flex flex-wrap items-center gap-2 mb-3`.

**team-view.tsx**
1. Role filter Select: `w-48` → `w-full sm:w-48`.

**settings-view.tsx**
1. Both color picker wrappers: `h-9 w-9` (36px) → `h-11 w-11` (44px) — meets WCAG 2.2 AA touch target minimum.

### Verification
- `bun run lint` — EXIT_CODE=0, no errors, no warnings.
- Dev server compiles successfully (`✓ Compiled in …`).
- No horizontal page overflow introduced: tables and permissions matrix keep their internal `overflow-x-auto rp-scroll-thin` wrappers; Selects now flow `w-full` on mobile and stack via existing `flex-col sm:flex-row` containers.

## Stage Summary
Audited all 5 SuperAdmin views for responsive behavior at 360–414px (móvil), 768px (tablet), 1024px (tablet horiz.), 1280px (laptop), 1440px+ (desktop). The existing code was already largely responsive (all tables had `overflow-x-auto rp-scroll-thin`, charts used `w-full h-auto` + viewBox, grids used proper breakpoint ladders). Applied **11 minimal fixes** addressing: (1) missing `xl:grid-cols-8` breakpoint on KPI row, (2) fixed-width Selects overflowing on narrow mobile in 3 different filter bars, (3) non-wrapping Tabs in integrations-view, (4) sub-44px touch target on color pickers in settings-view, (5) non-wrapping section header in billing-view, (6) outdated `md:`/`xl:` breakpoints on installed integrations grid. All copy remains in Spanish (es-ES). Lint passes with 0 errors.
