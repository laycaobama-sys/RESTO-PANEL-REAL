"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useNav, type Section } from "./nav-store";
import { Logo, BrandMark } from "./brand";
import {
  LayoutDashboard, CalendarDays, Users, Megaphone, Workflow, Star, BarChart3,
  Plug, CreditCard, UserCog, Settings, ShieldCheck, Bell, Search, ChevronDown,
  Menu, X, HelpCircle, LogOut,
} from "lucide-react";

const NAV: { id: Section; label: string; icon: React.ElementType; group: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Operación" },
  { id: "reservas", label: "Reservas", icon: CalendarDays, group: "Operación" },
  { id: "crm", label: "Clientes", icon: Users, group: "Relación" },
  { id: "marketing", label: "Marketing", icon: Megaphone, group: "Relación" },
  { id: "automatizaciones", label: "Automatizaciones", icon: Workflow, group: "Relación" },
  { id: "reviews", label: "Google Reviews", icon: Star, group: "Reputación" },
  { id: "analytics", label: "Analytics", icon: BarChart3, group: "Reputación" },
  { id: "integraciones", label: "Integraciones", icon: Plug, group: "Plataforma" },
  { id: "billing", label: "Facturación", icon: CreditCard, group: "Plataforma" },
  { id: "equipo", label: "Equipo", icon: UserCog, group: "Plataforma" },
  { id: "configuracion", label: "Configuración", icon: Settings, group: "Plataforma" },
  { id: "superadmin", label: "Super Admin", icon: ShieldCheck, group: "Plataforma" },
];

export function AppShell() {
  const section = useNav((s) => s.section);
  const go = useNav((s) => s.go);
  const setView = useNav((s) => s.setView);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const current = NAV.find((n) => n.id === section);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
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

      {/* Mobile sidebar */}
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
              {NAV.map((n) => (
                <button
                  key={n.id}
                  onClick={() => { go(n.id); setMobileOpen(false); }}
                  className={cn(
                    "w-full min-h-[44px] flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors mb-0.5",
                    section === n.id ? "bg-[var(--gold)]/10 text-[var(--gold-soft)]" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  )}
                >
                  <n.icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">{n.label}</span>
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onMenu={() => setMobileOpen(true)} title={current?.label ?? "Dashboard"} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8" id="app-main">
          <SectionRenderer section={section} />
        </main>
      </div>
    </div>
  );
}

const GROUPS = ["Operación", "Relación", "Reputación", "Plataforma"];

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

function Topbar({ onMenu, title }: { onMenu: () => void; title: string }) {
  const [period, setPeriod] = React.useState<"hoy" | "semana" | "mes">("hoy");
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border/60 rp-glass-strong flex items-center gap-2 sm:gap-3 px-3 sm:px-6">
      <button onClick={onMenu} className="lg:hidden h-11 w-11 -ml-1 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors" aria-label="Abrir menú">
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-2 text-sm min-w-0 flex-1 md:flex-none">
        <span className="text-muted-foreground hidden sm:inline shrink-0">RestoPanel /</span>
        <span className="font-medium truncate">{title}</span>
      </div>
      <div className="flex-1 max-w-md mx-auto hidden md:flex items-center gap-2 rounded-lg border border-border/60 px-3 py-1.5 text-sm text-muted-foreground">
        <Search className="h-4 w-4" aria-hidden />
        <input
          type="search"
          placeholder="Buscar reservas, clientes, mesas…"
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-0"
          aria-label="Búsqueda global"
        />
        <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border/60 shrink-0">⌘K</kbd>
      </div>
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div className="hidden sm:flex items-center rounded-md border border-border/60 p-0.5">
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
        <button className="relative h-11 w-11 sm:h-9 sm:w-9 rounded-md border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors hover:bg-foreground/5" aria-label="Notificaciones">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--teal)]" aria-hidden />
        </button>
        <button className="h-11 w-11 sm:h-9 sm:w-9 rounded-md border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors hover:bg-foreground/5" aria-label="Ayuda">
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

function SectionRenderer({ section }: { section: Section }) {
  const Lazy = React.useMemo(() => {
    const map: Record<Section, React.LazyExoticComponent<React.ComponentType>> = {
      dashboard: React.lazy(() => import("@/components/rp/dashboard/home").then((m) => ({ default: m.Home }))),
      reservas: React.lazy(() => import("@/components/rp/reservas/reservas-view").then((m) => ({ default: m.ReservasView }))),
      crm: React.lazy(() => import("@/components/rp/crm/crm-view").then((m) => ({ default: m.CrmView }))),
      marketing: React.lazy(() => import("@/components/rp/crm/marketing-view").then((m) => ({ default: m.MarketingView }))),
      automatizaciones: React.lazy(() => import("@/components/rp/automations/automation-builder").then((m) => ({ default: m.AutomationBuilder }))),
      reviews: React.lazy(() => import("@/components/rp/reviews/reviews-view").then((m) => ({ default: m.ReviewsView }))),
      analytics: React.lazy(() => import("@/components/rp/reviews/analytics-view").then((m) => ({ default: m.AnalyticsView }))),
      integraciones: React.lazy(() => import("@/components/rp/superadmin/integrations-view").then((m) => ({ default: m.IntegrationsView }))),
      billing: React.lazy(() => import("@/components/rp/superadmin/billing-view").then((m) => ({ default: m.BillingView }))),
      equipo: React.lazy(() => import("@/components/rp/superadmin/team-view").then((m) => ({ default: m.TeamView }))),
      configuracion: React.lazy(() => import("@/components/rp/superadmin/settings-view").then((m) => ({ default: m.SettingsView }))),
      superadmin: React.lazy(() => import("@/components/rp/superadmin/super-admin-view").then((m) => ({ default: m.SuperAdminView }))),
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
