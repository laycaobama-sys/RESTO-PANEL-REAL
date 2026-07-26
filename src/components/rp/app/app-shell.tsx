"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useNav, type Section } from "./nav-store";
import { Logo, BrandMark } from "./brand";
import {
  LayoutDashboard, CalendarDays, Users, Megaphone, Workflow, Star, BarChart3,
  Plug, CreditCard, UserCog, Settings, ShieldCheck, Bell, Search, ChevronDown,
  Menu, X, HelpCircle, LogOut, Command as CommandIcon, CornerDownLeft,
  CalendarPlus, UserSearch, Map as MapIcon, Sparkles, TrendingUp, Award, Ticket,
  Crown, BrainCircuit, BookOpen, UtensilsCrossed,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const NAV: { id: Section; label: string; icon: React.ElementType; group: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Operación" },
  { id: "executive", label: "Centro Ejecutivo", icon: Crown, group: "Operación" },
  { id: "reservas", label: "Reservas", icon: CalendarDays, group: "Operación" },
  { id: "crm", label: "Clientes", icon: Users, group: "Relación" },
  { id: "marketing", label: "Marketing", icon: Megaphone, group: "Relación" },
  { id: "automatizaciones", label: "Automatizaciones", icon: Workflow, group: "Relación" },
  { id: "growth-analytics", label: "Growth Analytics", icon: TrendingUp, group: "Growth" },
  { id: "growth-reputation", label: "Centro Reputación", icon: Award, group: "Growth" },
  { id: "campaigns", label: "Campañas", icon: Megaphone, group: "Growth" },
  { id: "promotions", label: "Promociones", icon: Ticket, group: "Growth" },
  { id: "reviews", label: "Google Reviews", icon: Star, group: "Reputación" },
  { id: "analytics", label: "Analytics", icon: BarChart3, group: "Reputación" },
  { id: "integraciones", label: "Integraciones", icon: Plug, group: "Plataforma" },
  { id: "billing", label: "Facturación", icon: CreditCard, group: "Plataforma" },
  { id: "equipo", label: "Equipo", icon: UserCog, group: "Plataforma" },
  { id: "configuracion", label: "Configuración", icon: Settings, group: "Plataforma" },
  { id: "ai-center", label: "Centro de IA", icon: BrainCircuit, group: "Plataforma" },
  { id: "ai-knowledge", label: "Conocimiento IA", icon: BookOpen, group: "Plataforma" },
  { id: "ai-menu", label: "IA Menú", icon: UtensilsCrossed, group: "Plataforma" },
  { id: "superadmin", label: "Super Admin", icon: ShieldCheck, group: "Plataforma" },
];

export function AppShell() {
  const section = useNav((s) => s.section);
  const go = useNav((s) => s.go);
  const setView = useNav((s) => s.setView);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [cmdOpen, setCmdOpen] = React.useState(false);

  const current = NAV.find((n) => n.id === section);

  // Lock body scroll when mobile drawer is open
  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Global ⌘K / Ctrl+K shortcut to open the command palette
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop — sticky, fixed while scrolling */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border/60 rp-glass-strong sticky top-0 h-screen">
        <div className="h-16 flex items-center px-5 border-b border-border/60">
          <button onClick={() => setView("landing")} className="flex items-center gap-2.5" aria-label="Volver a landing">
            <BrandMark className="h-8 w-8" />
            <span className="font-display text-lg tracking-tight">RestoPanel</span>
          </button>
        </div>
        <OrgSelector />
        <nav className="flex-1 overflow-y-auto rp-scroll-thin px-3 py-3" aria-label="Navegación principal">
          {GROUPS.map((g) => (
            <div key={g} className="mb-4">
              <div className="px-2 mb-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{g}</div>
              <ul className="space-y-0.5">
                {NAV.filter((n) => n.group === g).map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => go(n.id)}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                        section === n.id
                          ? "bg-[var(--gold)]/10 text-[var(--gold-soft)]"
                          : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                      )}
                      aria-current={section === n.id ? "page" : undefined}
                    >
                      <n.icon className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="truncate">{n.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-border/60 p-3">
          <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-foreground/5 cursor-pointer">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] flex items-center justify-center text-black text-xs font-medium">AM</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">Ana Martínez</div>
              <div className="text-[11px] text-muted-foreground truncate">Owner · Ramses Group</div>
            </div>
            <LogOut className="h-4 w-4 text-muted-foreground" aria-hidden />
          </div>
        </div>
      </aside>

      {/* Mobile sidebar — drawer with all nav items, closes on click */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 rp-glass-strong border-r border-border/60 flex flex-col">
            <div className="h-16 flex items-center justify-between pl-5 pr-2 border-b border-border/60">
              <Logo />
              <button onClick={() => setMobileOpen(false)} aria-label="Cerrar menú" className="h-11 w-11 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <OrgSelector />
            <nav className="flex-1 overflow-y-auto rp-scroll-thin px-3 py-3" aria-label="Navegación móvil">
              {GROUPS.map((g) => (
                <div key={g} className="mb-4">
                  <div className="px-2 mb-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{g}</div>
                  <ul className="space-y-0.5">
                    {NAV.filter((n) => n.group === g).map((n) => (
                      <li key={n.id}>
                        <button
                          onClick={() => { go(n.id); setMobileOpen(false); }}
                          className={cn(
                            "w-full min-h-[44px] flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                            section === n.id ? "bg-[var(--gold)]/10 text-[var(--gold-soft)]" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                          )}
                          aria-current={section === n.id ? "page" : undefined}
                        >
                          <n.icon className="h-4 w-4 shrink-0" aria-hidden />
                          <span className="truncate">{n.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar
          onMenu={() => setMobileOpen(true)}
          title={current?.label ?? "Dashboard"}
          onOpenCmd={() => setCmdOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8" id="app-main">
          <SectionRenderer section={section} />
        </main>
      </div>

      {/* Command palette (⌘K) */}
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </div>
  );
}

const GROUPS = ["Operación", "Relación", "Growth", "Reputación", "Plataforma"];

function OrgSelector() {
  const org = useNav((s) => s.org);
  const location = useNav((s) => s.location);
  const [open, setOpen] = React.useState(false);
  return (
    <div className="px-3 py-3 border-b border-border/40 relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full min-h-[44px] flex items-center gap-2.5 rounded-md border border-border/60 px-3 py-2 text-left hover:border-[var(--gold)]/40 transition-colors"
        aria-expanded={open}
        aria-label="Seleccionar organización y local"
      >
        <div className="h-7 w-7 rounded-md bg-[var(--gold)]/15 flex items-center justify-center text-[var(--gold)] text-xs font-medium">R</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{org}</div>
          <div className="text-[11px] text-muted-foreground truncate">{location}</div>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden />
      </button>
      {open && (
        <div className="absolute left-3 right-3 top-full mt-1 rp-glass-strong rounded-md border border-border/60 py-1 z-10 max-h-[60vh] overflow-y-auto rp-scroll-thin">
          {["Ramses Madrid", "Ramses Barcelona", "Ramses Valencia"].map((l) => (
            <button
              key={l}
              onClick={() => { useNav.getState().setLocation(l); setOpen(false); }}
              className="w-full min-h-[44px] text-left px-3 py-2 text-sm hover:bg-foreground/5"
            >
              {l}
            </button>
          ))}
          <div className="border-t border-border/40 my-1" />
          <button className="w-full min-h-[44px] text-left px-3 py-2 text-sm text-muted-foreground hover:bg-foreground/5">
            + Añadir local
          </button>
        </div>
      )}
    </div>
  );
}

function Topbar({ onMenu, title, onOpenCmd }: { onMenu: () => void; title: string; onOpenCmd: () => void }) {
  const [period, setPeriod] = React.useState<"hoy" | "semana" | "mes">("hoy");
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border/60 rp-glass-strong flex items-center gap-2 sm:gap-3 px-3 sm:px-6">
      <button onClick={onMenu} className="lg:hidden h-11 w-11 -ml-1 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors" aria-label="Abrir menú">
        <Menu className="h-5 w-5" />
      </button>
      {/* Breadcrumb / title (left) */}
      <div className="flex items-center gap-2 text-sm min-w-0 flex-1 md:flex-none">
        <span className="text-muted-foreground hidden sm:inline shrink-0">RestoPanel /</span>
        <span className="font-medium truncate">{title}</span>
      </div>
      {/* Global search (center, hidden on mobile) — clickable, opens command palette */}
      <button
        onClick={onOpenCmd}
        className="flex-1 max-w-[180px] md:max-w-xs xl:max-w-md mx-auto hidden md:flex items-center gap-2 rounded-lg border border-border/60 px-3 py-1.5 text-sm text-muted-foreground hover:border-[var(--gold)]/40 hover:bg-foreground/[0.03] transition-colors text-left"
        aria-label="Abrir paleta de comandos"
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden />
        <span className="flex-1 truncate">Buscar reservas, clientes, mesas…</span>
        <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border/60 shrink-0 flex items-center gap-0.5">
          <CommandIcon className="h-2.5 w-2.5" />K
        </kbd>
      </button>
      {/* Right cluster: period selector, notifications, help, avatar */}
      <div className="ml-auto flex items-center gap-1 sm:gap-1.5 lg:gap-2 shrink-0">
        <div className="hidden 2xl:flex items-center rounded-md border border-border/60 p-0.5">
          {(["hoy", "semana", "mes"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "min-h-[36px] rounded px-2.5 py-1 text-xs capitalize transition-colors",
                period === p ? "bg-[var(--gold)] text-black" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          onClick={onOpenCmd}
          className="md:hidden h-11 w-11 sm:h-9 sm:w-9 rounded-md border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors hover:bg-foreground/5"
          aria-label="Buscar (paleta de comandos)"
        >
          <Search className="h-4 w-4" />
        </button>
        <button className="relative h-11 w-11 sm:h-9 sm:w-9 rounded-md border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors hover:bg-foreground/5" aria-label="Notificaciones">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--teal)] ring-2 ring-background" aria-hidden />
        </button>
        <button className="hidden sm:flex h-9 w-9 rounded-md border border-border/60 items-center justify-center text-muted-foreground hover:text-foreground transition-colors hover:bg-foreground/5" aria-label="Ayuda">
          <HelpCircle className="h-4 w-4" />
        </button>
        <button
          className="h-9 w-9 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] flex items-center justify-center text-black text-xs font-medium ring-2 ring-transparent hover:ring-[var(--gold)]/40 transition-shadow"
          aria-label="Cuenta de Ana Martínez"
        >
          AM
        </button>
      </div>
    </header>
  );
}

/* =========================================================
 * Command palette (⌘K)
 * Quick actions modal with search and keyboard navigation.
 * Navigates via useNav.getState().go(section).
 * =======================================================*/
interface CmdAction {
  id: string;
  label: string;
  hint: string;
  icon: React.ElementType;
  group: "Navegación" | "Acciones";
  run: () => void;
}

function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const actions = React.useMemo<CmdAction[]>(() => {
    const nav: CmdAction[] = NAV.map((n) => ({
      id: `nav-${n.id}`,
      label: n.label,
      hint: "Ir a sección",
      icon: n.icon,
      group: "Navegación",
      run: () => useNav.getState().go(n.id),
    }));
    const quick: CmdAction[] = [
      { id: "qa-executive", label: "Abrir Centro Ejecutivo", hint: "IA + Alertas", icon: Crown, group: "Acciones", run: () => useNav.getState().go("executive") },
      { id: "qa-new-reserva", label: "Nueva reserva", hint: "Crear reserva", icon: CalendarPlus, group: "Acciones", run: () => useNav.getState().go("reservas") },
      { id: "qa-search-client", label: "Buscar cliente", hint: "Abrir CRM", icon: UserSearch, group: "Acciones", run: () => useNav.getState().go("crm") },
      { id: "qa-floor-plan", label: "Ver plano de mesas", hint: "Abrir reservas", icon: MapIcon, group: "Acciones", run: () => useNav.getState().go("reservas") },
      { id: "qa-marketing", label: "Lanzar campaña", hint: "Marketing", icon: Megaphone, group: "Acciones", run: () => useNav.getState().go("marketing") },
      { id: "qa-growth-analytics", label: "Ver Growth Analytics", hint: "ROI e insights IA", icon: TrendingUp, group: "Acciones", run: () => useNav.getState().go("growth-analytics") },
      { id: "qa-growth-reputation", label: "Gestionar reputación", hint: "Reseñas + NPS", icon: Award, group: "Acciones", run: () => useNav.getState().go("growth-reputation") },
      { id: "qa-reviews", label: "Responder reviews", hint: "Google Reviews", icon: Star, group: "Acciones", run: () => useNav.getState().go("reviews") },
      { id: "qa-analytics", label: "Ver analítica", hint: "Analytics", icon: BarChart3, group: "Acciones", run: () => useNav.getState().go("analytics") },
      { id: "qa-settings", label: "Configuración", hint: "Ajustes del local", icon: Settings, group: "Acciones", run: () => useNav.getState().go("configuracion") },
    ];
    return [...quick, ...nav];
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((a) =>
      a.label.toLowerCase().includes(q) || a.hint.toLowerCase().includes(q)
    );
  }, [actions, query]);

  // Reset state on open
  React.useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      // focus input after dialog mounts
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Keep active index in range
  React.useEffect(() => {
    if (active >= filtered.length) setActive(0);
  }, [filtered, active]);

  // Scroll active item into view
  React.useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function execute(a: CmdAction) {
    a.run();
    onOpenChange(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % Math.max(filtered.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + filtered.length) % Math.max(filtered.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const a = filtered[active];
      if (a) execute(a);
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  }

  // Group filtered actions for rendering
  const groups = React.useMemo(() => {
    const map = new Map<string, CmdAction[]>();
    for (const a of filtered) {
      const arr = map.get(a.group) ?? [];
      arr.push(a);
      map.set(a.group, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  // Flat index lookup for keyboard nav
  let flatIdx = -1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="p-0 gap-0 sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
        onKeyDown={onKeyDown}
      >
        <DialogTitle className="sr-only">Paleta de comandos</DialogTitle>
        <DialogDescription className="sr-only">
          Busca acciones rápidas o secciones y navega con el teclado.
        </DialogDescription>
        {/* Search input */}
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border/60">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            placeholder="Busca una acción o sección…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground min-w-0"
            aria-label="Buscar acción"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border/60 shrink-0">ESC</kbd>
        </div>
        {/* Actions list */}
        <div ref={listRef} className="flex-1 overflow-y-auto rp-scroll-thin p-2 max-h-[60vh]">
          {filtered.length === 0 ? (
            <div className="px-3 py-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <Sparkles className="h-5 w-5 opacity-50" />
              Sin resultados para “{query}”.
            </div>
          ) : (
            groups.map(([group, items]) => (
              <div key={group} className="mb-1">
                <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                  {group}
                </div>
                <ul role="listbox" aria-label={group}>
                  {items.map((a) => {
                    flatIdx += 1;
                    const idx = flatIdx;
                    const isActive = idx === active;
                    return (
                      <li key={a.id} role="option" aria-selected={isActive}>
                        <button
                          data-idx={idx}
                          onMouseMove={() => setActive(idx)}
                          onClick={() => execute(a)}
                          className={cn(
                            "w-full flex items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                            isActive ? "bg-[var(--gold)]/12 text-[var(--gold-soft)]" : "hover:bg-foreground/5"
                          )}
                        >
                          <a.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-[var(--gold)]" : "text-muted-foreground")} aria-hidden />
                          <span className="flex-1 min-w-0 truncate font-medium">{a.label}</span>
                          <span className="text-[11px] text-muted-foreground shrink-0 hidden sm:inline">{a.hint}</span>
                          {isActive && (
                            <CornerDownLeft className="h-3.5 w-3.5 text-[var(--gold)] shrink-0" aria-hidden />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>
        {/* Footer hint */}
        <div className="flex items-center justify-between gap-2 px-4 h-10 border-t border-border/60 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="font-mono px-1 py-0.5 rounded border border-border/60">↑↓</kbd> navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono px-1 py-0.5 rounded border border-border/60">↵</kbd> seleccionar
            </span>
          </div>
          <span className="font-mono">RestoPanel · ⌘K</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SectionRenderer({ section }: { section: Section }) {
  const Lazy = React.useMemo(() => {
    const map: Record<Section, React.LazyExoticComponent<React.ComponentType>> = {
      dashboard: React.lazy(() => import("@/components/rp/dashboard/home").then((m) => ({ default: m.Home }))),
      executive: React.lazy(() => import("@/components/rp/executive/executive-view").then((m) => ({ default: m.ExecutiveView }))),
      reservas: React.lazy(() => import("@/components/rp/reservas/reservas-view").then((m) => ({ default: m.ReservasView }))),
      crm: React.lazy(() => import("@/components/rp/crm/crm-view").then((m) => ({ default: m.CrmView }))),
      marketing: React.lazy(() => import("@/components/rp/crm/marketing-view").then((m) => ({ default: m.MarketingView }))),
      automatizaciones: React.lazy(() => import("@/components/rp/automations/automation-builder").then((m) => ({ default: m.AutomationBuilder }))),
      "growth-analytics": React.lazy(() => import("@/components/rp/growth/growth-analytics").then((m) => ({ default: m.GrowthAnalytics }))),
      "growth-reputation": React.lazy(() => import("@/components/rp/growth/growth-reputation").then((m) => ({ default: m.GrowthReputation }))),
      campaigns: React.lazy(() => import("@/components/rp/growth/growth-campaigns").then((m) => ({ default: m.GrowthCampaigns }))),
      promotions: React.lazy(() => import("@/components/rp/growth/growth-promotions").then((m) => ({ default: m.GrowthPromotions }))),
      reviews: React.lazy(() => import("@/components/rp/reviews/reviews-view").then((m) => ({ default: m.ReviewsView }))),
      analytics: React.lazy(() => import("@/components/rp/reviews/analytics-view").then((m) => ({ default: m.AnalyticsView }))),
      integraciones: React.lazy(() => import("@/components/rp/superadmin/integrations-view").then((m) => ({ default: m.IntegrationsView }))),
      billing: React.lazy(() => import("@/components/rp/superadmin/billing-view").then((m) => ({ default: m.BillingView }))),
      equipo: React.lazy(() => import("@/components/rp/superadmin/team-view").then((m) => ({ default: m.TeamView }))),
      configuracion: React.lazy(() => import("@/components/rp/superadmin/settings-view").then((m) => ({ default: m.SettingsView }))),
      superadmin: React.lazy(() => import("@/components/rp/superadmin/super-admin-view").then((m) => ({ default: m.SuperAdminView }))),
      "ai-center": React.lazy(() => import("@/components/rp/ai-center/ai-center").then((m) => ({ default: m.AiCenter }))),
      "ai-knowledge": React.lazy(() => import("@/components/rp/ai-center/ai-knowledge").then((m) => ({ default: m.AiKnowledge }))),
      "ai-menu": React.lazy(() => import("@/components/rp/ai-center/ai-menu").then((m) => ({ default: m.AiMenu }))),
    };
    return map[section];
  }, [section]);

  return (
    <React.Suspense fallback={<SectionSkeleton />}>
      <Lazy />
    </React.Suspense>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Cargando sección">
      <div className="h-8 w-48 rounded-md bg-foreground/10 animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-foreground/5 animate-pulse" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-foreground/5 animate-pulse" />
    </div>
  );
}
