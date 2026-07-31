"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useNav, type Section, type AuthMode } from "./nav-store";
import { Logo, BrandMark } from "./brand";
import {
  LayoutDashboard, CalendarDays, Users, Megaphone, Workflow, Star, BarChart3,
  Plug, CreditCard, UserCog, Settings, ShieldCheck, Bell, Search, ChevronDown,
  Menu, X, HelpCircle, LogOut, Command as CommandIcon, CornerDownLeft,
  CalendarPlus, UserSearch, Map as MapIcon, Sparkles, TrendingUp, Award, Ticket,
  Crown, BrainCircuit, BookOpen, UtensilsCrossed, Pin, PinOff, Check, CheckCheck,
  Mail, Lock, User, Eye, EyeOff, AlertCircle, Loader2, ArrowRight, KeyRound,
  MessageSquare, CalendarX, TrendingDown, UserPlus,
  ShoppingCart, Smartphone, ChefHat, Bike,
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
  { id: "tpv", label: "TPV", icon: UtensilsCrossed, group: "Operación" },
  { id: "pda", label: "PDA Comandero", icon: Smartphone, group: "Operación" },
  { id: "kds", label: "KDS Cocina", icon: ChefHat, group: "Operación" },
  { id: "carta-qr", label: "Carta QR", icon: ShoppingCart, group: "Operación" },
  { id: "delivery", label: "Delivery", icon: Bike, group: "Operación" },
  { id: "inventario", label: "Inventario", icon: Package, group: "Operación" },
  { id: "personal", label: "Personal", icon: ClipboardList, group: "Operación" },
  { id: "onboarding", label: "Onboarding IA", icon: Sparkles, group: "Operación" },
  { id: "autopilot", label: "Autopilot", icon: Rocket, group: "Operación" },
  { id: "channels", label: "Canales", icon: Globe, group: "Operación" },
  { id: "preinstalled-automations", label: "Automatizaciones Preinstaladas", icon: Zap, group: "Operación" },
  { id: "crm", label: "Clientes", icon: Users, group: "Relación" },
  { id: "marketing", label: "Marketing", icon: Megaphone, group: "Relación" },
  { id: "automatizaciones", label: "Automatizaciones", icon: Workflow, group: "Relación" },
  { id: "flow-builder", label: "Flow Builder", icon: Workflow, group: "Relación" },
  { id: "copilot-contextual", label: "Copilot Contextual", icon: BrainCircuit, group: "Relación" },
  { id: "growth-analytics", label: "Growth Analytics", icon: TrendingUp, group: "Growth" },
  { id: "growth-reputation", label: "Centro Reputación", icon: Award, group: "Growth" },
  { id: "roi-calculator", label: "ROI Calculator", icon: Calculator, group: "Growth" },
  { id: "landing-dynamic", label: "Landing Dinámica", icon: Globe, group: "Growth" },
  { id: "campaigns", label: "Campañas", icon: Megaphone, group: "Growth" },
  { id: "promotions", label: "Promociones", icon: Ticket, group: "Growth" },
  { id: "reviews", label: "Google Reviews", icon: Star, group: "Reputación" },
  { id: "analytics", label: "Analytics", icon: BarChart3, group: "Reputación" },
  { id: "integraciones", label: "Integraciones", icon: Plug, group: "Plataforma" },
  { id: "billing", label: "Facturación", icon: CreditCard, group: "Plataforma" },
  { id: "entitlements", label: "Planes y Entitlements", icon: KeyRound, group: "Plataforma" },
  { id: "saas-metrics", label: "Métricas SaaS", icon: ShieldCheck, group: "Plataforma" },
  { id: "health-score", label: "Health Score", icon: HeartPulse, group: "Plataforma" },
  { id: "upgrade-engine", label: "Upgrade Engine", icon: Rocket, group: "Plataforma" },
  { id: "equipo", label: "Equipo", icon: UserCog, group: "Plataforma" },
  { id: "configuracion", label: "Configuración", icon: Settings, group: "Plataforma" },
  { id: "ai-center", label: "Centro de IA", icon: BrainCircuit, group: "Plataforma" },
  { id: "ai-knowledge", label: "Conocimiento IA", icon: BookOpen, group: "Plataforma" },
  { id: "ai-menu", label: "IA Menú", icon: UtensilsCrossed, group: "Plataforma" },
  { id: "superadmin", label: "Super Admin", icon: ShieldCheck, group: "Plataforma" },
  { id: "super-admin-v2", label: "Super Admin v2", icon: Network, group: "Plataforma" },
  { id: "multi-local", label: "Multi-local", icon: Store, group: "Plataforma" },
  { id: "app-store", label: "App Store", icon: Store, group: "Plataforma" },
  { id: "signup-funnel", label: "Funnel de Alta", icon: CreditCard, group: "Plataforma" },
];

const GROUPS = ["Operación", "Relación", "Growth", "Reputación", "Plataforma"];

/* ============================================================
   Hook: prefers-reduced-motion
============================================================ */
function usePrefersReducedMotion() {
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduce;
}

/* ============================================================
   Hook: useLocalStorage
============================================================ */
function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [value, setValue] = React.useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });
  React.useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* noop */
    }
  }, [key, value]);
  return [value, setValue];
}

/* ============================================================
   AppShell — main layout with collapsible sidebar
============================================================ */
export function AppShell() {
  const section = useNav((s) => s.section);
  const go = useNav((s) => s.go);
  const setView = useNav((s) => s.setView);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [cmdOpen, setCmdOpen] = React.useState(false);

  // Sidebar pinned state (persisted)
  const [pinned, setPinned] = useLocalStorage<boolean>("rp-sidebar-pinned", false);
  const [hovered, setHovered] = React.useState(false);
  const reduce = usePrefersReducedMotion();

  const current = NAV.find((n) => n.id === section);

  // Hover close delay (250ms) to avoid accidental closes
  const closeTimer = React.useRef<number | null>(null);
  const onEnter = React.useCallback(() => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    if (!reduce) setHovered(true);
  }, [reduce]);
  const onLeave = React.useCallback(() => {
    closeTimer.current = window.setTimeout(() => setHovered(false), 250);
  }, []);

  // Cleanup timer on unmount
  React.useEffect(() => () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  }, []);

  // Lock body scroll when mobile drawer is open
  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
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

  // Effective sidebar width
  const expanded = pinned || hovered;
  const sidebarWidth = expanded ? 260 : 72;

  return (
    <div className="flex min-h-screen">
      {/* ===== Desktop Sidebar (rail + overlay) ===== */}
      {/* When pinned: sticky, occupies layout space */}
      {/* When not pinned: fixed, placeholder keeps 72px in layout */}
      {pinned ? (
        <DesktopSidebar
          expanded
          pinned
          reduce={reduce}
          onPin={() => setPinned(false)}
          onEnter={onEnter}
          onLeave={onLeave}
          section={section}
          go={go}
          setView={setView}
          width={sidebarWidth}
          className="sticky top-0"
        />
      ) : (
        <>
          {/* Placeholder keeps 72px in layout when sidebar is floating */}
          <div className="hidden lg:block w-[72px] shrink-0" aria-hidden />
          {/* Floating sidebar (no backdrop overlay — onMouseLeave handles close) */}
          <DesktopSidebar
            expanded={expanded}
            pinned={false}
            reduce={reduce}
            onPin={() => setPinned(true)}
            onEnter={onEnter}
            onLeave={onLeave}
            section={section}
            go={go}
            setView={setView}
            width={sidebarWidth}
            className={cn(
              "fixed left-0 top-0 z-30",
              hovered && !reduce && "shadow-2xl rp-glow-gold",
            )}
          />
        </>
      )}

      {/* ===== Mobile Sidebar (drawer) ===== */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="absolute left-0 top-0 h-full w-72 rp-glass-strong border-r border-border/60 flex flex-col rp-slide-in">
            <div className="h-16 flex items-center justify-between pl-5 pr-2 border-b border-border/60">
              <Logo />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Cerrar menú"
                className="h-11 w-11 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
              >
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

      {/* ===== Main column ===== */}
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

/* ============================================================
   Desktop Sidebar component
============================================================ */
function DesktopSidebar({
  expanded,
  pinned,
  reduce,
  onPin,
  onEnter,
  onLeave,
  section,
  go,
  setView,
  width,
  className,
}: {
  expanded: boolean;
  pinned: boolean;
  reduce: boolean;
  onPin: () => void;
  onEnter: () => void;
  onLeave: () => void;
  section: Section;
  go: (s: Section) => void;
  setView: (v: "landing") => void;
  width: number;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-border/60 rp-glass-strong h-screen z-30 overflow-hidden",
        className,
      )}
      style={{
        width: `${width}px`,
        transition: reduce ? "none" : "width 220ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      aria-label="Navegación principal"
    >
      {/* Brand header */}
      <div className={cn("h-16 flex items-center border-b border-border/60", expanded ? "px-5" : "px-4 justify-center")}>
        <button
          onClick={() => setView("landing")}
          className="flex items-center gap-2.5 min-w-0"
          aria-label="Volver a landing"
        >
          <BrandMark className="h-8 w-8 shrink-0" />
          {expanded && (
            <span className="font-display text-lg tracking-tight truncate rp-fade-in">
              RestoPanel
            </span>
          )}
        </button>
        {expanded && (
          <button
            onClick={onPin}
            className="ml-auto h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-[var(--gold)] hover:bg-foreground/5 transition-colors"
            aria-label={pinned ? "Desfijar sidebar" : "Fijar sidebar abierta"}
            aria-pressed={pinned}
            title={pinned ? "Desfijar sidebar" : "Fijar sidebar abierta"}
          >
            {pinned ? <Pin className="h-3.5 w-3.5 fill-current text-[var(--gold)]" /> : <PinOff className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {/* Collapsed pin button (always visible) */}
      {!expanded && (
        <div className="px-4 py-2 flex justify-center">
          <button
            onClick={onPin}
            className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-[var(--gold)] hover:bg-foreground/5 transition-colors"
            aria-label="Fijar sidebar abierta"
            title="Fijar sidebar"
          >
            <PinOff className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <OrgSelector expanded={expanded} />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden rp-scroll-thin px-2 py-2" aria-label="Navegación principal">
        {GROUPS.map((g, gi) => (
          <div key={g} className="mb-3">
            {expanded && (
              <div className="px-2 mb-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground rp-fade-in" style={{ transitionDelay: `${gi * 20}ms` }}>
                {g}
              </div>
            )}
            <ul className="space-y-0.5">
              {NAV.filter((n) => n.group === g).map((n, ni) => (
                <li key={n.id}>
                  <button
                    onClick={() => go(n.id)}
                    className={cn(
                      "w-full flex items-center rounded-md text-sm transition-colors min-h-[40px]",
                      expanded ? "gap-3 px-2.5 py-2" : "justify-center px-2 py-2.5",
                      section === n.id
                        ? "bg-[var(--gold)]/10 text-[var(--gold-soft)]"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                    )}
                    aria-current={section === n.id ? "page" : undefined}
                    aria-label={n.label}
                    title={!expanded ? n.label : undefined}
                  >
                    <n.icon className="h-4 w-4 shrink-0" aria-hidden />
                    {expanded && (
                      <span
                        className="truncate rp-fade-in"
                        style={reduce ? undefined : { transitionDelay: `${(gi * 5 + ni) * 20}ms` }}
                      >
                        {n.label}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User card */}
      <UserCard expanded={expanded} />
    </aside>
  );
}

/* ============================================================
   Fade-in helper class (added via globals.css)
   The class .rp-fade-in is defined in globals.css:
   .rp-fade-in {
     animation: rp-fade-in 220ms cubic-bezier(0.4, 0, 0.2, 1) both;
   }
   @keyframes rp-fade-in {
     from { opacity: 0; transform: translateX(-8px); }
     to   { opacity: 1; transform: translateX(0); }
   }
============================================================ */

/* ============================================================
   OrgSelector
============================================================ */
function OrgSelector({ expanded }: { expanded: boolean }) {
  const org = useNav((s) => s.org);
  const location = useNav((s) => s.location);
  const [open, setOpen] = React.useState(false);
  return (
    <div className={cn("relative border-b border-border/40", expanded ? "px-3 py-3" : "py-3 flex justify-center")}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "rounded-md border border-border/60 text-left hover:border-[var(--gold)]/40 transition-colors min-h-[44px] flex items-center",
          expanded ? "w-full gap-2.5 px-3 py-2" : "h-10 w-10 justify-center",
        )}
        aria-expanded={open}
        aria-label="Seleccionar organización y local"
        title={!expanded ? `${org} · ${location}` : undefined}
      >
        <div className="h-7 w-7 rounded-md bg-[var(--gold)]/15 flex items-center justify-center text-[var(--gold)] text-xs font-medium shrink-0">R</div>
        {expanded && (
          <div className="flex-1 min-w-0 rp-fade-in">
            <div className="text-sm font-medium truncate">{org}</div>
            <div className="text-[11px] text-muted-foreground truncate">{location}</div>
          </div>
        )}
        {expanded && <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />}
      </button>
      {open && (
        <div className={cn("absolute rp-glass-strong rounded-md border border-border/60 py-1 z-30 max-h-[60vh] overflow-y-auto rp-scroll-thin", expanded ? "left-3 right-3 top-full mt-1" : "left-full top-0 ml-2 w-56")}>
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

/* ============================================================
   UserCard — shows user info + logout
============================================================ */
function UserCard({ expanded }: { expanded: boolean }) {
  const user = useNav((s) => s.user);
  const logout = useNav((s) => s.logout);
  const openAuth = useNav((s) => s.openAuth);
  const setView = useNav((s) => s.setView);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    if (!menuOpen) return;
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const initials = user?.initials ?? "AM";
  const name = user?.name ?? "Ana Martínez";
  const role = user?.role ?? "Owner · Ramses Group";

  return (
    <div className="relative border-t border-border/60 p-2" ref={menuRef}>
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className={cn(
          "w-full flex items-center rounded-md hover:bg-foreground/5 transition-colors min-h-[44px]",
          expanded ? "gap-2.5 px-2 py-1.5" : "justify-center px-0 py-2",
        )}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label="Cuenta de usuario"
        title={!expanded ? name : undefined}
      >
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] flex items-center justify-center text-black text-xs font-medium shrink-0">
          {initials}
        </div>
        {expanded && (
          <div className="flex-1 min-w-0 text-left rp-fade-in">
            <div className="text-sm font-medium truncate">{name}</div>
            <div className="text-[11px] text-muted-foreground truncate">{role}</div>
          </div>
        )}
        {expanded && <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />}
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute bottom-full left-2 right-2 mb-2 rp-glass-strong rounded-md border border-border/60 py-1 z-30 shadow-xl"
        >
          <button
            onClick={() => { setView("landing"); setMenuOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-foreground/5 transition-colors"
            role="menuitem"
          >
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" aria-hidden />
            Ver landing
          </button>
          <button
            onClick={() => { openAuth("signup"); setMenuOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-foreground/5 transition-colors"
            role="menuitem"
          >
            <UserPlus className="h-4 w-4 text-muted-foreground" aria-hidden />
            Cambiar de cuenta
          </button>
          <div className="border-t border-border/40 my-1" />
          <button
            onClick={() => { logout(); setMenuOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left text-rose-300 hover:bg-rose-500/10 transition-colors"
            role="menuitem"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Topbar — with working notifications + search + avatar
============================================================ */
function Topbar({ onMenu, title, onOpenCmd }: { onMenu: () => void; title: string; onOpenCmd: () => void }) {
  const [period, setPeriod] = React.useState<"hoy" | "semana" | "mes">("hoy");
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border/60 rp-glass-strong flex items-center gap-2 sm:gap-3 px-3 sm:px-6">
      <button onClick={onMenu} className="lg:hidden h-11 w-11 -ml-1 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors" aria-label="Abrir menú">
        <Menu className="h-5 w-5" />
      </button>
      {/* Breadcrumb / title */}
      <div className="flex items-center gap-2 text-sm min-w-0 flex-1 md:flex-none">
        <span className="text-muted-foreground hidden sm:inline shrink-0">RestoPanel /</span>
        <span className="font-medium truncate">{title}</span>
      </div>
      {/* Global search (center, hidden on mobile) */}
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
      {/* Right cluster */}
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
        <NotificationsBell />
        <button
          onClick={() => {
            useNav.getState().go("configuracion");
          }}
          className="hidden sm:flex h-9 w-9 rounded-md border border-border/60 items-center justify-center text-muted-foreground hover:text-foreground transition-colors hover:bg-foreground/5"
          aria-label="Ayuda y configuración"
          title="Ayuda"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
        <UserAvatar />
      </div>
    </header>
  );
}

/* ============================================================
   NotificationsBell — functional dropdown panel
============================================================ */
interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: React.ElementType;
  iconCls: string;
  read: boolean;
  category: "reserva" | "review" | "alert" | "sistema";
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: "n1", title: "Nueva reserva", description: "Marta López · 4 pax · 21:30 · Mesa 7", time: "hace 2 min", icon: CalendarPlus, iconCls: "text-[var(--teal)]", read: false, category: "reserva" },
  { id: "n2", title: "Reseña 5★", description: "Google · «Servicio excepcional, volveremos»", time: "hace 8 min", icon: Star, iconCls: "text-amber-400", read: false, category: "review" },
  { id: "n3", title: "No-show detectado", description: "Carlos Ruiz · 20:00 · sin confirmar", time: "hace 15 min", icon: CalendarX, iconCls: "text-rose-400", read: false, category: "alert" },
  { id: "n4", title: "Mesa M12 rinde -18%", description: "Análisis IA · facturación por debajo de media", time: "hace 32 min", icon: TrendingDown, iconCls: "text-amber-400", read: false, category: "alert" },
  { id: "n5", title: "Campaña enviada", description: "VIP Marzo · 48 destinatarios · 12 aperturas", time: "hace 1 h", icon: Megaphone, iconCls: "text-[var(--gold-soft)]", read: true, category: "sistema" },
  { id: "n6", title: "Backup completado", description: "R2 · instantánea diaria · 2.4 GB", time: "hace 3 h", icon: ShieldCheck, iconCls: "text-[var(--teal)]", read: true, category: "sistema" },
];

function NotificationsBell() {
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const btnRef = React.useRef<HTMLButtonElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  // Close on outside click + Escape
  React.useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };
  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="relative h-11 w-11 sm:h-9 sm:w-9 rounded-md border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors hover:bg-foreground/5"
        aria-label={`Notificaciones${unread ? `, ${unread} sin leer` : ""}`}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[var(--teal)] text-black text-[10px] font-mono font-bold flex items-center justify-center ring-2 ring-background">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Panel de notificaciones"
          className="absolute right-0 top-full mt-2 w-[min(360px,calc(100vw-1.5rem))] rp-glass-strong rounded-xl border border-border/60 shadow-2xl z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">Notificaciones</h3>
              {unread > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--teal)]/15 text-[var(--teal)]">
                  {unread} nuevas
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="h-3 w-3" />
                Marcar todas
              </button>
            )}
          </div>
          {/* List */}
          <ul className="max-h-[60vh] overflow-y-auto rp-scroll-thin">
            {notifications.length === 0 && (
              <li className="px-4 py-10 text-center text-sm text-muted-foreground">
                <Bell className="mx-auto mb-2 h-5 w-5 opacity-50" />
                Sin notificaciones
              </li>
            )}
            {notifications.map((n) => {
              const Icon = n.icon;
              return (
                <li key={n.id}>
                  <button
                    onClick={() => markRead(n.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 flex gap-3 transition-colors border-b border-border/40 last:border-0",
                      n.read ? "hover:bg-foreground/[0.02]" : "bg-[var(--gold)]/[0.04] hover:bg-[var(--gold)]/[0.08]"
                    )}
                  >
                    <div className={cn("h-8 w-8 rounded-md bg-foreground/5 flex items-center justify-center shrink-0", n.iconCls)}>
                      <Icon className="h-4 w-4" aria-hidden />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className={cn("text-sm truncate", n.read ? "font-normal text-foreground/80" : "font-medium")}>
                          {n.title}
                        </span>
                        {!n.read && (
                          <span className="h-2 w-2 rounded-full bg-[var(--teal)] shrink-0 mt-1.5" aria-label="sin leer" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.description}</p>
                      <span className="text-[10px] font-mono text-muted-foreground/70 mt-1 block">{n.time}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          {/* Footer */}
          <button
            onClick={() => {
              useNav.getState().go("reviews");
              setOpen(false);
            }}
            className="w-full px-4 py-2.5 text-xs text-center text-muted-foreground hover:text-foreground border-t border-border/60 transition-colors hover:bg-foreground/[0.03]"
          >
            Ver todas las notificaciones
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   UserAvatar — top right, opens same menu as sidebar user card
============================================================ */
function UserAvatar() {
  const user = useNav((s) => s.user);
  const logout = useNav((s) => s.logout);
  const openAuth = useNav((s) => s.openAuth);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!menuOpen) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const initials = user?.initials ?? "AM";
  const name = user?.name ?? "Ana Martínez";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="h-9 w-9 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] flex items-center justify-center text-black text-xs font-medium ring-2 ring-transparent hover:ring-[var(--gold)]/40 transition-shadow"
        aria-label={`Cuenta de ${name}`}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
      >
        {initials}
      </button>
      {menuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 rp-glass-strong rounded-md border border-border/60 py-1 z-50 shadow-xl"
        >
          <div className="px-3 py-2 border-b border-border/40">
            <div className="text-sm font-medium truncate">{name}</div>
            <div className="text-[11px] text-muted-foreground truncate">{user?.email ?? "ana@ramsesgroup.com"}</div>
          </div>
          <button
            onClick={() => { useNav.getState().go("configuracion"); setMenuOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-foreground/5 transition-colors"
            role="menuitem"
          >
            <Settings className="h-4 w-4 text-muted-foreground" aria-hidden />
            Configuración
          </button>
          <button
            onClick={() => { openAuth("signup"); setMenuOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-foreground/5 transition-colors"
            role="menuitem"
          >
            <UserPlus className="h-4 w-4 text-muted-foreground" aria-hidden />
            Cambiar de cuenta
          </button>
          <div className="border-t border-border/40 my-1" />
          <button
            onClick={() => { logout(); setMenuOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left text-rose-300 hover:bg-rose-500/10 transition-colors"
            role="menuitem"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Command palette (⌘K) — unchanged, fully functional
============================================================ */
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
      { id: "qa-tpv", label: "Abrir TPV", hint: "Punto de venta", icon: UtensilsCrossed, group: "Acciones", run: () => useNav.getState().go("tpv") },
      { id: "qa-pda", label: "Tomar comanda PDA", hint: "Comandero en sala", icon: Smartphone, group: "Acciones", run: () => useNav.getState().go("pda") },
      { id: "qa-kds", label: "Ver KDS cocina", hint: "Display de cocina", icon: ChefHat, group: "Acciones", run: () => useNav.getState().go("kds") },
      { id: "qa-carta-qr", label: "Carta QR", hint: "Order & Pay móvil", icon: ShoppingCart, group: "Acciones", run: () => useNav.getState().go("carta-qr") },
      { id: "qa-delivery", label: "Delivery propio", hint: "0% comisión", icon: Bike, group: "Acciones", run: () => useNav.getState().go("delivery") },
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

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  React.useEffect(() => {
    if (active >= filtered.length) setActive(0);
  }, [filtered, active]);

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

  const groups = React.useMemo(() => {
    const map = new Map<string, CmdAction[]>();
    for (const a of filtered) {
      const arr = map.get(a.group) ?? [];
      arr.push(a);
      map.set(a.group, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

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

/* ============================================================
   AuthDialog — login / signup / forgot password
   Functional: validation, loading, errors, password strength,
   show/hide password, redirect to dashboard on success
   Rendered at Page level so it's available in both landing and app views.
============================================================ */
export function AuthDialog() {
  const authOpen = useNav((s) => s.authOpen);
  const authMode = useNav((s) => s.authMode);
  const closeAuth = useNav((s) => s.closeAuth);
  const setAuthMode = useNav((s) => s.setAuthMode);
  const login = useNav((s) => s.login);

  return (
    <Dialog open={authOpen} onOpenChange={(o) => !o && closeAuth()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">
          {authMode === "login" ? "Iniciar sesión" : authMode === "signup" ? "Crear cuenta" : "Recuperar contraseña"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {authMode === "login"
            ? "Accede a tu panel de RestoPanel"
            : authMode === "signup"
              ? "Crea tu cuenta de RestoPanel"
              : "Te enviaremos un enlace para restablecer tu contraseña"}
        </DialogDescription>
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-2.5 mb-1">
            <BrandMark className="h-7 w-7" />
            <span className="font-display text-lg tracking-tight">RestoPanel</span>
          </div>
          <h2 className="mt-4 font-display text-2xl font-light tracking-tight">
            {authMode === "login" && "Bienvenido de nuevo"}
            {authMode === "signup" && "Empieza hoy"}
            {authMode === "forgot" && "Recuperar acceso"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {authMode === "login" && "Accede a tu panel de control."}
            {authMode === "signup" && "Crea tu cuenta y prueba 14 días gratis."}
            {authMode === "forgot" && "Introduce tu email y te enviaremos un enlace."}
          </p>
        </div>

        {authMode === "login" && <LoginForm onSwitch={setAuthMode} onLogin={login} />}
        {authMode === "signup" && <SignupForm onSwitch={setAuthMode} onLogin={login} />}
        {authMode === "forgot" && <ForgotForm onSwitch={setAuthMode} />}
      </DialogContent>
    </Dialog>
  );
}

function FieldError({ msg }: { msg?: string | null }) {
  if (!msg) return null;
  return (
    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-400">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>{msg}</span>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  error,
  autoComplete,
  showStrength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  autoComplete?: string;
  showStrength?: boolean;
}) {
  const [show, setShow] = React.useState(false);
  const strength = React.useMemo(() => {
    if (!showStrength) return null;
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[a-z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    return score;
  }, [value, showStrength]);

  const strengthLabel = strength === null ? null : strength <= 1 ? "Débil" : strength <= 3 ? "Media" : "Fuerte";
  const strengthCls = strength === null ? "" : strength <= 1 ? "bg-rose-500" : strength <= 3 ? "bg-amber-400" : "bg-[var(--teal)]";

  return (
    <div>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className={cn(
            "w-full h-11 rounded-md border bg-background/40 pl-10 pr-10 text-sm outline-none transition-colors",
            error ? "border-rose-400/60 focus:border-rose-400" : "border-border/60 focus:border-[var(--gold)]/50",
          )}
          aria-invalid={!!error}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {showStrength && strength !== null && value.length > 0 && (
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-foreground/10 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", strengthCls)}
              style={{ width: `${(strength / 5) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">{strengthLabel}</span>
        </div>
      )}
      <FieldError msg={error} />
    </div>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <label className={cn("block text-foreground", className)}>{children}</label>;
}

function LoginForm({ onSwitch, onLogin }: { onSwitch: (m: AuthMode) => void; onLogin: (u: { name: string; email: string; initials: string; role: string; org: string }) => void }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<{ email?: string | null; password?: string | null; form?: string | null }>({});
  const [loading, setLoading] = React.useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "El email es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Email no válido.";
    if (!password) e.password = "La contraseña es obligatoria.";
    else if (password.length < 6) e.password = "Mínimo 6 caracteres.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      // Simulated async login
      await new Promise((r) => setTimeout(r, 900));
      // Demo: accept any valid email/password
      const name = email.split("@")[0].split(/[._-]/).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
      const initials = name.split(" ").map((s) => s.charAt(0)).slice(0, 2).join("").toUpperCase();
      onLogin({
        name,
        email,
        initials,
        role: "Owner · Ramses Group",
        org: "Ramses Group",
      });
    } catch {
      setErrors({ form: "No se pudo iniciar sesión. Inténtalo de nuevo." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="px-6 pb-6 pt-4 space-y-4">
      <div>
        <Label className="mb-1.5 block text-xs">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className={cn(
              "w-full h-11 rounded-md border bg-background/40 pl-10 pr-3 text-sm outline-none transition-colors",
              errors.email ? "border-rose-400/60 focus:border-rose-400" : "border-border/60 focus:border-[var(--gold)]/50",
            )}
            placeholder="ana@ramsesgroup.com"
            aria-invalid={!!errors.email}
          />
        </div>
        <FieldError msg={errors.email} />
      </div>
      <PasswordInput label="Contraseña" value={password} onChange={setPassword} error={errors.password} autoComplete="current-password" />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <input type="checkbox" className="h-3.5 w-3.5 rounded border-border/60 accent-[var(--gold)]" />
          Recordarme
        </label>
        <button
          type="button"
          onClick={() => onSwitch("forgot")}
          className="text-xs text-muted-foreground hover:text-[var(--gold-soft)] transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>
      {errors.form && <FieldError msg={errors.form} />}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-md bg-[var(--gold)] text-black font-medium text-sm hover:bg-[var(--gold-soft)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Entrando…
          </>
        ) : (
          <>
            Iniciar sesión
            <ArrowRight className="h-4 w-4" aria-hidden />
          </>
        )}
      </button>
      <p className="text-center text-xs text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <button type="button" onClick={() => onSwitch("signup")} className="text-[var(--gold-soft)] hover:underline">
          Crea una gratis
        </button>
      </p>
    </form>
  );
}

function SignupForm({ onSwitch, onLogin }: { onSwitch: (m: AuthMode) => void; onLogin: (u: { name: string; email: string; initials: string; role: string; org: string }) => void }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<{ name?: string | null; email?: string | null; password?: string | null; form?: string | null }>({});
  const [loading, setLoading] = React.useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "El nombre es obligatorio.";
    if (!email.trim()) e.email = "El email es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Email no válido.";
    if (!password) e.password = "La contraseña es obligatoria.";
    else if (password.length < 8) e.password = "Mínimo 8 caracteres.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await new Promise((r) => setTimeout(r, 1100));
      const initials = name.trim().split(/\s+/).map((s) => s.charAt(0)).slice(0, 2).join("").toUpperCase();
      onLogin({
        name: name.trim(),
        email,
        initials,
        role: "Owner",
        org: "Mi Restaurante",
      });
    } catch {
      setErrors({ form: "No se pudo crear la cuenta. Inténtalo de nuevo." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="px-6 pb-6 pt-4 space-y-4">
      <div>
        <Label className="mb-1.5 block text-xs">Nombre completo</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className={cn(
              "w-full h-11 rounded-md border bg-background/40 pl-10 pr-3 text-sm outline-none transition-colors",
              errors.name ? "border-rose-400/60 focus:border-rose-400" : "border-border/60 focus:border-[var(--gold)]/50",
            )}
            placeholder="Ana Martínez"
            aria-invalid={!!errors.name}
          />
        </div>
        <FieldError msg={errors.name} />
      </div>
      <div>
        <Label className="mb-1.5 block text-xs">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className={cn(
              "w-full h-11 rounded-md border bg-background/40 pl-10 pr-3 text-sm outline-none transition-colors",
              errors.email ? "border-rose-400/60 focus:border-rose-400" : "border-border/60 focus:border-[var(--gold)]/50",
            )}
            placeholder="ana@ramsesgroup.com"
            aria-invalid={!!errors.email}
          />
        </div>
        <FieldError msg={errors.email} />
      </div>
      <PasswordInput label="Contraseña" value={password} onChange={setPassword} error={errors.password} autoComplete="new-password" showStrength />
      {errors.form && <FieldError msg={errors.form} />}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-md bg-[var(--gold)] text-black font-medium text-sm hover:bg-[var(--gold-soft)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Creando cuenta…
          </>
        ) : (
          <>
            Crear cuenta
            <ArrowRight className="h-4 w-4" aria-hidden />
          </>
        )}
      </button>
      <p className="text-center text-xs text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <button type="button" onClick={() => onSwitch("login")} className="text-[var(--gold-soft)] hover:underline">
          Inicia sesión
        </button>
      </p>
    </form>
  );
}

function ForgotForm({ onSwitch }: { onSwitch: (m: AuthMode) => void }) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!email.trim()) { setError("El email es obligatorio."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Email no válido."); return; }
    setError(null);
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="px-6 pb-6 pt-4 space-y-4 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-[var(--teal)]/15 flex items-center justify-center">
          <Mail className="h-6 w-6 text-[var(--teal)]" aria-hidden />
        </div>
        <h3 className="font-display text-lg font-medium">Revisa tu email</h3>
        <p className="text-sm text-muted-foreground">
          Hemos enviado un enlace de recuperación a <span className="text-foreground font-medium">{email}</span>. El enlace expira en 30 minutos.
        </p>
        <button
          onClick={() => onSwitch("login")}
          className="w-full h-11 rounded-md border border-border/60 hover:bg-foreground/5 transition-colors text-sm font-medium"
        >
          Volver a iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="px-6 pb-6 pt-4 space-y-4">
      <div>
        <Label className="mb-1.5 block text-xs">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className={cn(
              "w-full h-11 rounded-md border bg-background/40 pl-10 pr-3 text-sm outline-none transition-colors",
              error ? "border-rose-400/60 focus:border-rose-400" : "border-border/60 focus:border-[var(--gold)]/50",
            )}
            placeholder="ana@ramsesgroup.com"
            aria-invalid={!!error}
          />
        </div>
        <FieldError msg={error} />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-md bg-[var(--gold)] text-black font-medium text-sm hover:bg-[var(--gold-soft)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Enviando…
          </>
        ) : (
          <>
            <KeyRound className="h-4 w-4" aria-hidden />
            Enviar enlace
          </>
        )}
      </button>
      <button
        type="button"
        onClick={() => onSwitch("login")}
        className="w-full text-center text-xs text-muted-foreground hover:text-[var(--gold-soft)] transition-colors"
      >
        ← Volver a iniciar sesión
      </button>
    </form>
  );
}

/* ============================================================
   SectionRenderer — lazy-loaded sections
============================================================ */
function SectionRenderer({ section }: { section: Section }) {
  const Lazy = React.useMemo(() => {
    const map: Record<Section, React.LazyExoticComponent<React.ComponentType>> = {
      dashboard: React.lazy(() => import("@/components/rp/dashboard/home").then((m) => ({ default: m.Home }))),
      executive: React.lazy(() => import("@/components/rp/executive/executive-view").then((m) => ({ default: m.ExecutiveView }))),
      reservas: React.lazy(() => import("@/components/rp/reservas/reservas-view").then((m) => ({ default: m.ReservasView }))),
      tpv: React.lazy(() => import("@/components/rp/tpv/tpv-view").then((m) => ({ default: m.TpvView }))),
      pda: React.lazy(() => import("@/components/rp/pda/pda-view").then((m) => ({ default: m.PdaView }))),
      kds: React.lazy(() => import("@/components/rp/kds/kds-view").then((m) => ({ default: m.KdsView }))),
      "carta-qr": React.lazy(() => import("@/components/rp/carta-qr/carta-qr-view").then((m) => ({ default: m.CartaQrView }))),
      delivery: React.lazy(() => import("@/components/rp/delivery/delivery-view").then((m) => ({ default: m.DeliveryView }))),
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
      inventario: React.lazy(() => import("@/components/rp/inventario/inventario-view").then((m) => ({ default: m.InventarioView }))),
      personal: React.lazy(() => import("@/components/rp/personal/personal-view").then((m) => ({ default: m.PersonalView }))),
      onboarding: React.lazy(() => import("@/components/rp/onboarding/onboarding-view").then((m) => ({ default: m.OnboardingView }))),
      "flow-builder": React.lazy(() => import("@/components/rp/flow-builder/flow-builder-view").then((m) => ({ default: m.FlowBuilderView }))),
      "copilot-contextual": React.lazy(() => import("@/components/rp/copilot-contextual/copilot-contextual-view").then((m) => ({ default: m.CopilotContextualView }))),
      "multi-local": React.lazy(() => import("@/components/rp/multi-local/multi-local-view").then((m) => ({ default: m.MultiLocalView }))),
      "app-store": React.lazy(() => import("@/components/rp/app-store/app-store-view").then((m) => ({ default: m.AppStoreView }))),
      "super-admin-v2": React.lazy(() => import("@/components/rp/super-admin-v2/super-admin-v2-view").then((m) => ({ default: m.SuperAdminV2View }))),
      "signup-funnel": React.lazy(() => import("@/components/rp/signup-funnel/signup-funnel-view").then((m) => ({ default: m.SignupFunnelView }))),
      entitlements: React.lazy(() => import("@/components/rp/entitlements/entitlements-view").then((m) => ({ default: m.EntitlementsView }))),
      "saas-metrics": React.lazy(() => import("@/components/rp/saas-metrics/saas-metrics-view").then((m) => ({ default: m.SaasMetricsView }))),
      "health-score": React.lazy(() => import("@/components/rp/health-score/health-score-view").then((m) => ({ default: m.HealthScoreView }))),
      "upgrade-engine": React.lazy(() => import("@/components/rp/upgrade-engine/upgrade-engine-view").then((m) => ({ default: m.UpgradeEngineView }))),
      autopilot: React.lazy(() => import("@/components/rp/autopilot/autopilot-view").then((m) => ({ default: m.AutopilotView }))),
      channels: React.lazy(() => import("@/components/rp/channels/channels-view").then((m) => ({ default: m.ChannelsView }))),
      "preinstalled-automations": React.lazy(() => import("@/components/rp/preinstalled-automations/preinstalled-automations-view").then((m) => ({ default: m.PreinstalledAutomationsView }))),
    };
    return map[section] ?? null;
  }, [section]);

  if (!Lazy) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-md bg-foreground/10" />
        <p className="text-sm text-muted-foreground">Cargando sección…</p>
      </div>
    );
  }

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
