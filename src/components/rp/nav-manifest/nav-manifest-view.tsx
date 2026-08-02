"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  LayoutDashboard, CalendarDays, Armchair, Monitor, Smartphone,
  Users, CreditCard, UtensilsCrossed, UserCog, Settings,
  Map as MapIcon, ChefHat, Bike, Award, Megaphone, Star, Workflow,
  BarChart3, Package, ClipboardList, BrainCircuit, Plug,
  Globe, Building2, Network, BookOpen, TrendingUp, Store, Code2,
  Database, KeyRound, ShieldCheck, Activity, Crown, Sparkles, Zap,
  ChevronRight, Check, X, Plus, Minus, Layers, FileCode2, Cpu,
  MousePointerClick, Palette, GripVertical, Search, Sliders, Lock,
  Chrome, Smartphone as PhoneIcon, MonitorSmartphone, ArrowRight,
} from "lucide-react";
import {
  useInView,
  useEntranceProgress,
} from "@/components/rp/charts";

/* =========================================================
 * Types
 * =======================================================*/

export type PlanId = "starter" | "professional" | "enterprise";

export type ManifestGroup =
  | "Operación"
  | "Sala"
  | "Cocina"
  | "Relación"
  | "Growth"
  | "Analítica"
  | "Plataforma"
  | "Multi-local"
  | "Gobernanza";

export interface ManifestEntry {
  id: string;
  label: string;
  icon: React.ElementType;
  feature: string; // feature required
  permission: string; // permission required
  group: ManifestGroup;
  order: number;
  plans: PlanId[]; // which plans include this entry
}

export interface PlanManifestMeta {
  id: PlanId;
  name: string;
  tagline: string;
  description: string;
  accent: "muted" | "gold" | "teal";
  price: number;
  sectionCount: number;
  widgetCount: number;
  bundleSize: string; // JS bundle size for code-split viz
  bundleKb: number;
  widgets: string[];
}

/* =========================================================
 * Plan metadata
 * =======================================================*/

const PLAN_META: Record<PlanId, PlanManifestMeta> = {
  starter: {
    id: "starter",
    name: "Starter",
    tagline: "Operar bien hoy",
    description:
      "Todo lo necesario para operar un local: reservas, TPV, comandas, caja, carta y equipo.",
    accent: "muted",
    price: 49,
    sectionCount: 10,
    widgetCount: 5,
    bundleSize: "284 KB",
    bundleKb: 284,
    widgets: [
      "ventas de hoy",
      "reservas de hoy",
      "ocupación",
      "tickets",
      "alertas",
    ],
  },
  professional: {
    id: "professional",
    name: "Professional",
    tagline: "Crecer",
    description:
      "Sala, cocina, delivery, CRM, marketing, automatizaciones, analítica e inventario. Para escalar de 1 a 5 locales.",
    accent: "gold",
    price: 99,
    sectionCount: 22,
    widgetCount: 6,
    bundleSize: "612 KB",
    bundleKb: 612,
    widgets: [
      "rotación de mesa",
      "ticket medio por canal",
      "ROI campañas",
      "food cost",
      "ranking platos",
      "coste personal",
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Escanear sin perder el control",
    description:
      "Multi-local global, BI y forecast, App Store, API/webhooks, Data Warehouse, SSO, auditoría y monitorización.",
    accent: "teal",
    price: 249,
    sectionCount: 33,
    widgetCount: 7,
    bundleSize: "1.18 MB",
    bundleKb: 1180,
    widgets: [
      "mapa locales",
      "comparativa",
      "forecast",
      "anomalías",
      "consumo API",
      "SLA",
      "health",
    ],
  },
};

const PLAN_ORDER: PlanId[] = ["starter", "professional", "enterprise"];

/* =========================================================
 * Manifest entries (full union of all sections)
 * =======================================================*/

const MANIFEST: ManifestEntry[] = [
  // Starter core (10) — group Operación
  { id: "inicio", label: "Inicio", icon: LayoutDashboard, feature: "dashboard", permission: "read", group: "Operación", order: 1, plans: ["starter", "professional", "enterprise"] },
  { id: "reservas", label: "Reservas", icon: CalendarDays, feature: "reservas", permission: "read", group: "Operación", order: 2, plans: ["starter", "professional", "enterprise"] },
  { id: "mesas", label: "Mesas", icon: Armchair, feature: "floor_plan", permission: "read", group: "Operación", order: 3, plans: ["starter", "professional", "enterprise"] },
  { id: "tpv", label: "TPV", icon: Monitor, feature: "tpv", permission: "read", group: "Operación", order: 4, plans: ["starter", "professional", "enterprise"] },
  { id: "comandas", label: "Comandas", icon: Smartphone, feature: "pda", permission: "read", group: "Operación", order: 5, plans: ["starter", "professional", "enterprise"] },
  { id: "clientes", label: "Clientes", icon: Users, feature: "crm", permission: "read", group: "Relación", order: 6, plans: ["starter", "professional", "enterprise"] },
  { id: "caja", label: "Caja", icon: CreditCard, feature: "caja", permission: "read", group: "Operación", order: 7, plans: ["starter", "professional", "enterprise"] },
  { id: "carta", label: "Carta", icon: UtensilsCrossed, feature: "carta_qr", permission: "read", group: "Operación", order: 8, plans: ["starter", "professional", "enterprise"] },
  { id: "equipo", label: "Equipo", icon: UserCog, feature: "team", permission: "read", group: "Plataforma", order: 9, plans: ["starter", "professional", "enterprise"] },
  { id: "configuracion", label: "Configuración", icon: Settings, feature: "settings", permission: "read", group: "Plataforma", order: 10, plans: ["starter", "professional", "enterprise"] },

  // Professional additions (12) → 22 total
  { id: "sala", label: "Sala", icon: MapIcon, feature: "floor_plan_pro", permission: "sala:read", group: "Sala", order: 11, plans: ["professional", "enterprise"] },
  { id: "cocina", label: "Cocina", icon: ChefHat, feature: "kds", permission: "kds:read", group: "Cocina", order: 12, plans: ["professional", "enterprise"] },
  { id: "delivery", label: "Delivery", icon: Bike, feature: "delivery", permission: "delivery:read", group: "Operación", order: 13, plans: ["professional", "enterprise"] },
  { id: "fidelizacion", label: "Fidelización", icon: Award, feature: "loyalty", permission: "loyalty:read", group: "Relación", order: 14, plans: ["professional", "enterprise"] },
  { id: "marketing", label: "Marketing", icon: Megaphone, feature: "marketing", permission: "marketing:read", group: "Relación", order: 15, plans: ["professional", "enterprise"] },
  { id: "resenas", label: "Reseñas", icon: Star, feature: "reviews", permission: "reviews:read", group: "Relación", order: 16, plans: ["professional", "enterprise"] },
  { id: "automatizaciones", label: "Automatizaciones", icon: Workflow, feature: "automations", permission: "automations:read", group: "Plataforma", order: 17, plans: ["professional", "enterprise"] },
  { id: "analitica", label: "Analítica", icon: BarChart3, feature: "analytics", permission: "analytics:read", group: "Analítica", order: 18, plans: ["professional", "enterprise"] },
  { id: "inventario", label: "Inventario", icon: Package, feature: "inventory", permission: "inventory:read", group: "Operación", order: 19, plans: ["professional", "enterprise"] },
  { id: "personal", label: "Personal", icon: ClipboardList, feature: "hr", permission: "hr:read", group: "Plataforma", order: 20, plans: ["professional", "enterprise"] },
  { id: "copilot", label: "Copilot", icon: BrainCircuit, feature: "ai_copilot", permission: "ai:read", group: "Plataforma", order: 21, plans: ["professional", "enterprise"] },
  { id: "integraciones", label: "Integraciones", icon: Plug, feature: "integrations", permission: "integrations:read", group: "Plataforma", order: 22, plans: ["professional", "enterprise"] },

  // Enterprise additions (11) → 33 total
  { id: "dashboard-global", label: "Dashboard Global", icon: Globe, feature: "global_dashboard", permission: "global:read", group: "Multi-local", order: 23, plans: ["enterprise"] },
  { id: "locales", label: "Locales", icon: Building2, feature: "locals_mgmt", permission: "locals:read", group: "Multi-local", order: 24, plans: ["enterprise"] },
  { id: "franquicias", label: "Franquicias", icon: Network, feature: "franchises", permission: "franchise:read", group: "Multi-local", order: 25, plans: ["enterprise"] },
  { id: "carta-central", label: "Carta Central", icon: BookOpen, feature: "central_menu", permission: "menu:read", group: "Multi-local", order: 26, plans: ["enterprise"] },
  { id: "bi-forecast", label: "BI y Forecast", icon: TrendingUp, feature: "bi_forecast", permission: "bi:read", group: "Analítica", order: 27, plans: ["enterprise"] },
  { id: "app-store", label: "App Store", icon: Store, feature: "app_store", permission: "apps:read", group: "Plataforma", order: 28, plans: ["enterprise"] },
  { id: "api-webhooks", label: "API y Webhooks", icon: Code2, feature: "api_write", permission: "api:read", group: "Plataforma", order: 29, plans: ["enterprise"] },
  { id: "data-warehouse", label: "Data Warehouse", icon: Database, feature: "data_warehouse", permission: "dw:read", group: "Analítica", order: 30, plans: ["enterprise"] },
  { id: "sso", label: "SSO", icon: KeyRound, feature: "sso", permission: "sso:read", group: "Gobernanza", order: 31, plans: ["enterprise"] },
  { id: "auditoria", label: "Auditoría", icon: ShieldCheck, feature: "audit_log", permission: "audit:read", group: "Gobernanza", order: 32, plans: ["enterprise"] },
  { id: "monitorizacion", label: "Monitorización", icon: Activity, feature: "monitoring", permission: "monitor:read", group: "Gobernanza", order: 33, plans: ["enterprise"] },
];

/* =========================================================
 * Helpers
 * =======================================================*/

function planAccentCls(plan: PlanId): {
  border: string;
  bg: string;
  text: string;
  ring: string;
  dot: string;
  gradient: string;
} {
  const meta = PLAN_META[plan];
  if (meta.accent === "gold") {
    return {
      border: "border-[var(--gold)]/60",
      bg: "bg-[var(--gold)]/10",
      text: "text-[var(--gold-soft)]",
      ring: "ring-[var(--gold)]/40",
      dot: "bg-[var(--gold)]",
      gradient: "from-[var(--gold)]/20 to-transparent",
    };
  }
  if (meta.accent === "teal") {
    return {
      border: "border-[var(--teal)]/55",
      bg: "bg-[var(--teal)]/10",
      text: "text-[var(--teal)]",
      ring: "ring-[var(--teal)]/40",
      dot: "bg-[var(--teal)]",
      gradient: "from-[var(--teal)]/20 to-transparent",
    };
  }
  return {
    border: "border-border/60",
    bg: "bg-foreground/[0.04]",
    text: "text-muted-foreground",
    ring: "ring-foreground/15",
    dot: "bg-zinc-500",
    gradient: "from-foreground/[0.06] to-transparent",
  };
}

function entriesForPlan(plan: PlanId): ManifestEntry[] {
  return MANIFEST.filter((m) => m.plans.includes(plan)).sort((a, b) => a.order - b.order);
}

function addedVsLowerPlan(plan: PlanId): ManifestEntry[] {
  if (plan === "starter") return [];
  if (plan === "professional") {
    return MANIFEST.filter((m) => m.plans.includes("professional") && !m.plans.includes("starter"));
  }
  return MANIFEST.filter((m) => m.plans.includes("enterprise") && !m.plans.includes("professional"));
}

function groupLabel(group: ManifestGroup): string {
  return group;
}

function groupOrder(group: ManifestGroup): number {
  const order: ManifestGroup[] = [
    "Operación", "Sala", "Cocina", "Relación", "Growth",
    "Analítica", "Plataforma", "Multi-local", "Gobernanza",
  ];
  return order.indexOf(group);
}

/* =========================================================
 * Shared atoms
 * =======================================================*/


function SectionCard({
  title,
  desc,
  icon: Icon,
  action,
  children,
  className,
}: {
  title: string;
  desc?: string;
  icon: React.ElementType;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rp-glass rounded-2xl overflow-hidden flex flex-col min-w-0", className)}>
      <div className="flex items-center justify-between gap-3 p-4 border-b border-border/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-foreground/[0.05] text-[var(--gold)] shrink-0">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-base sm:text-lg leading-tight truncate">{title}</h2>
            {desc && <p className="text-[11px] text-muted-foreground truncate">{desc}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-4 flex-1 min-w-0">{children}</div>
    </section>
  );
}

/* =========================================================
 * Plan selector (3 buttons)
 * =======================================================*/

function PlanSelector({
  current,
  onChange,
}: {
  current: PlanId;
  onChange: (p: PlanId) => void;
}) {
  return (
    <div className="inline-flex flex-wrap items-center gap-1.5 rounded-xl border border-border/50 bg-card/40 p-1 rp-scroll-thin overflow-x-auto">
      {PLAN_ORDER.map((p) => {
        const meta = PLAN_META[p];
        const active = p === current;
        const accent = planAccentCls(p);
        const Icon = p === "starter" ? Sparkles : p === "professional" ? Zap : Crown;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-pressed={active}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors whitespace-nowrap min-h-10",
              active
                ? p === "professional"
                  ? "bg-[var(--gold)] text-black font-medium"
                  : p === "enterprise"
                    ? "bg-[var(--teal)] text-black font-medium"
                    : "bg-foreground/[0.1] text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{meta.name}</span>
            <span
              className={cn(
                "text-[10px] font-mono tabular-nums",
                active
                  ? p === "professional"
                    ? "text-black/70"
                    : p === "enterprise"
                      ? "text-black/70"
                      : "text-muted-foreground"
                  : "text-muted-foreground/70"
              )}
            >
              {meta.sectionCount}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
 * Navigation tree (left panel)
 * =======================================================*/

function NavTree({ plan }: { plan: PlanId }) {
  const reduce = useReducedMotion();
  const entries = entriesForPlan(plan);
  const grouped = React.useMemo(() => {
    const map = new Map<ManifestGroup, ManifestEntry[]>();
    for (const e of entries) {
      const arr = map.get(e.group) ?? [];
      arr.push(e);
      map.set(e.group, arr);
    }
    return Array.from(map.entries()).sort(
      (a, b) => groupOrder(a[0]) - groupOrder(b[0])
    );
  }, [entries]);

  const accent = planAccentCls(plan);

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        <motion.div
          key={plan}
          initial={reduce ? false : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="space-y-3"
        >
          {grouped.map(([group, items]) => (
            <div key={group}>
              <div className="flex items-center gap-1.5 mb-1.5 px-1">
                <span
                  className={cn(
                    "text-[10px] font-mono uppercase tracking-wider",
                    accent.text
                  )}
                >
                  {groupLabel(group)}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/50">
                  ({items.length})
                </span>
              </div>
              <div className="space-y-0.5">
                {items.map((entry, i) => {
                  const Icon = entry.icon;
                  return (
                    <motion.div
                      key={entry.id}
                      initial={reduce ? false : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: reduce ? 0 : Math.min(0.3, i * 0.015),
                        ease: "easeOut",
                      }}
                      className="group flex items-center gap-2.5 rounded-lg border border-transparent hover:border-border/40 hover:bg-foreground/[0.03] p-2 min-w-0"
                    >
                      <div
                        className={cn(
                          "h-7 w-7 rounded-md flex items-center justify-center shrink-0",
                          "bg-foreground/[0.05] text-muted-foreground group-hover:text-foreground transition-colors"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium truncate">{entry.label}</div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/70 truncate">
                          <span className="truncate">feat: {entry.feature}</span>
                          <span className="text-muted-foreground/40">·</span>
                          <span className="truncate">perm: {entry.permission}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono tabular-nums text-muted-foreground/50 shrink-0">
                        #{entry.order}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
 * Right panel — plan summary
 * =======================================================*/

function PlanSummary({ plan }: { plan: PlanId }) {
  const reduce = useReducedMotion();
  const meta = PLAN_META[plan];
  const accent = planAccentCls(plan);
  const Icon = plan === "starter" ? Sparkles : plan === "professional" ? Zap : Crown;
  const added = addedVsLowerPlan(plan);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={plan}
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="space-y-4"
      >
        {/* Header */}
        <div className={cn("rounded-2xl border p-4 bg-gradient-to-br", accent.border, accent.gradient)}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center border",
                accent.border,
                accent.bg,
                accent.text
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display text-xl leading-tight">{meta.name}</h3>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] uppercase tracking-wider font-mono",
                    accent.border,
                    accent.bg,
                    accent.text
                  )}
                >
                  {meta.tagline}
                </Badge>
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {meta.price}€/mes + IVA
              </div>
            </div>
          </div>
          <p className="text-sm text-foreground/85 leading-relaxed">{meta.description}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="rounded-xl border border-border/40 bg-foreground/[0.02] p-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Secciones
            </div>
            <div className={cn("font-display text-xl tabular-nums mt-0.5", accent.text)}>
              {meta.sectionCount}
            </div>
          </div>
          <div className="rounded-xl border border-border/40 bg-foreground/[0.02] p-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Widgets
            </div>
            <div className={cn("font-display text-xl tabular-nums mt-0.5", accent.text)}>
              {meta.widgetCount}
            </div>
          </div>
          <div className="rounded-xl border border-border/40 bg-foreground/[0.02] p-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Bundle JS
            </div>
            <div className={cn("font-display text-xl tabular-nums mt-0.5", accent.text)}>
              {meta.bundleSize}
            </div>
          </div>
          <div className="rounded-xl border border-border/40 bg-foreground/[0.02] p-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Plan
            </div>
            <div className={cn("font-display text-xl tabular-nums mt-0.5", accent.text)}>
              {meta.price}€
            </div>
          </div>
        </div>

        {/* Widgets preview */}
        <div className="rounded-xl border border-border/40 bg-foreground/[0.02] p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
            <Layers className="h-3 w-3" /> Widgets disponibles
          </div>
          <div className="flex flex-wrap gap-1.5">
            {meta.widgets.map((w) => (
              <span
                key={w}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px]",
                  accent.border,
                  accent.bg,
                  "text-foreground/85"
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", accent.dot)} />
                {w}
              </span>
            ))}
          </div>
        </div>

        {/* Comparison vs lower plan */}
        <div className="rounded-xl border border-border/40 bg-foreground/[0.02] p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
            {plan === "starter" ? (
              <>
                <Minus className="h-3 w-3" /> Plan base
              </>
            ) : (
              <>
                <Plus className="h-3 w-3" /> Añadido vs {plan === "professional" ? "Starter" : "Professional"}
              </>
            )}
          </div>
          {added.length === 0 ? (
            <div className="text-[11px] text-muted-foreground">
              Starter es el plan base. Todas las secciones listadas a la izquierda son el núcleo
              operativo — sin extras.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {added.map((e) => {
                const Icon = e.icon;
                return (
                  <div
                    key={e.id}
                    className="flex items-center gap-2 rounded-md border border-emerald-400/30 bg-emerald-400/[0.06] px-2 py-1.5 min-w-0"
                  >
                    <Icon className={cn("h-3.5 w-3.5 shrink-0", accent.text)} />
                    <span className="text-[11px] truncate">{e.label}</span>
                    <Check className="h-3 w-3 text-emerald-300 ml-auto shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* =========================================================
 * Code splitting visualization
 * =======================================================*/

function BundleBar({
  plan,
  isActive,
  delay,
}: {
  plan: PlanId;
  isActive: boolean;
  delay: number;
}) {
  const meta = PLAN_META[plan];
  const accent = planAccentCls(plan);
  const maxKb = PLAN_META.enterprise.bundleKb;
  const widthPct = Math.max(8, Math.round((meta.bundleKb / maxKb) * 100));
  const reduce = useReducedMotion();

  const BrowserIcon = plan === "starter" ? PhoneIcon : plan === "professional" ? Chrome : MonitorSmartphone;

  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition-colors min-w-0",
        isActive
          ? cn(accent.border, accent.bg)
          : "border-border/40 bg-foreground/[0.02]"
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              "h-7 w-7 rounded-md flex items-center justify-center shrink-0 border",
              accent.border,
              accent.bg,
              accent.text
            )}
          >
            <BrowserIcon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium truncate">
              {plan === "starter" ? "Navegador Starter" : plan === "professional" ? "Navegador Professional" : "Navegador Enterprise"}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground tabular-nums">
              {meta.bundleSize} · {meta.sectionCount} secciones
            </div>
          </div>
        </div>
        {isActive ? (
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] uppercase tracking-wider font-mono",
              accent.border,
              accent.bg,
              accent.text
            )}
          >
            <Check className="h-3 w-3 mr-1" /> actual
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-[10px] uppercase tracking-wider font-mono border-border/40 text-muted-foreground"
          >
            <Lock className="h-3 w-3 mr-1" /> no cargado
          </Badge>
        )}
      </div>
      {/* Bundle bar */}
      <div className="h-2 rounded-full bg-foreground/[0.08] overflow-hidden">
        <motion.div
          initial={reduce ? false : { width: 0 }}
          whileInView={{ width: `${widthPct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay, ease: "easeOut" }}
          className={cn("h-full rounded-full", accent.dot)}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5 text-[10px] font-mono text-muted-foreground">
        <span>JS descargado</span>
        <span className="tabular-nums">{meta.bundleSize}</span>
      </div>
    </div>
  );
}

function CodeSplitViz({ current }: { current: PlanId }) {
  const reduce = useReducedMotion();
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[var(--teal)]/30 bg-[var(--teal)]/[0.06] p-3 flex items-start gap-2.5">
        <FileCode2 className="h-4 w-4 text-[var(--teal)] shrink-0 mt-0.5" />
        <div className="text-[12px] text-foreground/85 leading-relaxed">
          <span className="font-medium text-[var(--teal)]">El JS de Enterprise no llega al navegador de un Starter.</span>{" "}
          Cada plan carga solo el bundle de sus secciones — code-splitting por ruta y por entitlement.
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {PLAN_ORDER.map((p, i) => (
          <BundleBar
            key={p}
            plan={p}
            isActive={p === current}
            delay={reduce ? 0 : 0.1 + i * 0.15}
          />
        ))}
      </div>
      {/* Flow diagram */}
      <div className="rounded-xl border border-border/40 bg-foreground/[0.02] p-3 overflow-x-auto rp-scroll-thin">
        <div className="flex items-center gap-2 sm:gap-3 min-w-[560px]">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <Cpu className="h-5 w-5 text-[var(--gold)]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Server
            </span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
          <div className="flex flex-col items-center gap-1 shrink-0">
            <FileCode2 className="h-5 w-5 text-[var(--gold-soft)]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Manifest
            </span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
          <div className="flex flex-col items-center gap-1 shrink-0">
            <Layers className="h-5 w-5 text-[var(--gold-soft)]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Split chunks
            </span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
          <div className="flex flex-col items-center gap-1 shrink-0">
            <Chrome className="h-5 w-5 text-[var(--teal)]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Browser
            </span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
          <div className="flex flex-col items-center gap-1 shrink-0">
            <MousePointerClick className="h-5 w-5 text-emerald-300" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Solo plan
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Personalization preview (Fase 3+)
 * =======================================================*/

const PERSONALIZATION_FEATURES: { icon: React.ElementType; label: string; detail: string; tone: "gold" | "teal" }[] = [
  { icon: GripVertical, label: "Widgets movibles", detail: "Drag & drop en el dashboard", tone: "gold" },
  { icon: Palette, label: "Temas", detail: "Dark / light / compact gold", tone: "gold" },
  { icon: Star, label: "Favoritos", detail: "Pin de secciones frecuentes", tone: "teal" },
  { icon: Search, label: "Ctrl+K", detail: "Command palette global", tone: "teal" },
  { icon: Sliders, label: "Densidad", detail: "Compacta / cómoda / amplia", tone: "gold" },
];

function PersonalizationPreview() {
  const reduce = useReducedMotion();
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {PERSONALIZATION_FEATURES.map((f, i) => {
          const Icon = f.icon;
          const tone = f.tone === "gold"
            ? planAccentCls("professional")
            : planAccentCls("enterprise");
          return (
            <motion.div
              key={f.label}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: reduce ? 0 : i * 0.06 }}
              className="rounded-xl border border-border/40 bg-foreground/[0.02] p-3 min-w-0"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={cn(
                    "h-7 w-7 rounded-md flex items-center justify-center border shrink-0",
                    tone.border,
                    tone.bg,
                    tone.text
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-medium truncate">{f.label}</span>
              </div>
              <div className="text-[11px] text-muted-foreground leading-relaxed">
                {f.detail}
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="rounded-xl border border-dashed border-border/50 p-3 flex items-start gap-2">
        <Sparkles className="h-4 w-4 text-[var(--gold)] shrink-0 mt-0.5" />
        <div className="text-[11px] text-muted-foreground leading-relaxed">
          Fase 3+ · la personalización vive en{" "}
          <code className="font-mono text-foreground/80">user_preferences</code>{" "}
          y se aplica al manifest en runtime: cada usuario ve su propio layout sin
          tocar el árbol de navegación global.
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Manifest inspector — feature × plan matrix mini
 * =======================================================*/

function ManifestMatrix({ current }: { current: PlanId }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = React.useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="overflow-x-auto rp-scroll-thin -mx-1 px-1">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3 font-normal">Sección</th>
              <th className="py-2 px-2 font-normal text-center w-[60px]">S</th>
              <th className="py-2 px-2 font-normal text-center w-[60px] text-[var(--gold-soft)]">P</th>
              <th className="py-2 px-2 font-normal text-center w-[60px] text-[var(--teal)]">E</th>
              <th className="py-2 pl-2 font-normal">Grupo</th>
            </tr>
          </thead>
          <tbody>
            {MANIFEST.map((entry, i) => {
              const Icon = entry.icon;
              const inS = entry.plans.includes("starter");
              const inP = entry.plans.includes("professional");
              const inE = entry.plans.includes("enterprise");
              const inCurrent = entry.plans.includes(current);
              return (
                <tr
                  key={entry.id}
                  className={cn(
                    "border-t border-border/30",
                    inCurrent && "bg-foreground/[0.03]",
                    i === MANIFEST.length - 1 && "border-b"
                  )}
                >
                  <td className="py-1.5 pr-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs text-foreground/90 truncate">{entry.label}</span>
                    </div>
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    {inS ? (
                      <Check className="h-3.5 w-3.5 text-emerald-300 inline" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-muted-foreground/40 inline" />
                    )}
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    {inP ? (
                      <Check className="h-3.5 w-3.5 text-[var(--gold-soft)] inline" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-muted-foreground/40 inline" />
                    )}
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    {inE ? (
                      <Check className="h-3.5 w-3.5 text-[var(--teal)] inline" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-muted-foreground/40 inline" />
                    )}
                  </td>
                  <td className="py-1.5 pl-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      {entry.group}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <CollapsibleTrigger asChild>
        <button
          className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          aria-expanded={open}
        >
          <ChevronRight
            className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-90")}
          />
          {open ? "Contraer matriz" : "Ver matriz completa"}
        </button>
      </CollapsibleTrigger>
    </Collapsible>
  );
}

/* =========================================================
 * Animated stats strip (using chart-utils)
 * =======================================================*/

function AnimatedStat({
  icon: Icon,
  label,
  value,
  sub,
  tone = "muted",
  inView,
  progress,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  tone?: "muted" | "gold" | "teal" | "emerald";
  inView: boolean;
  progress: number;
}) {
  const reduce = useReducedMotion();
  const textCls =
    tone === "gold"
      ? "text-[var(--gold-soft)]"
      : tone === "teal"
        ? "text-[var(--teal)]"
        : tone === "emerald"
          ? "text-emerald-300"
          : "text-foreground";
  return (
    <div className="rounded-xl border border-border/40 bg-foreground/[0.02] p-3 min-w-0">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="h-7 w-7 rounded-md flex items-center justify-center bg-foreground/[0.05] text-muted-foreground shrink-0">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground truncate">
          {label}
        </span>
      </div>
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: inView ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={cn("font-display text-lg sm:text-xl tabular-nums leading-none", textCls)}
        style={{ opacity: reduce ? 1 : Math.max(0, Math.min(1, progress)) }}
      >
        {value}
      </motion.div>
      {sub && (
        <div className="text-[10px] text-muted-foreground mt-1 truncate">{sub}</div>
      )}
    </div>
  );
}

/* =========================================================
 * Main view
 * =======================================================*/

export function NavManifestView() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [plan, setPlan] = React.useState<PlanId>("professional");

  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.05 });
  const progress = useEntranceProgress(inView, 700);

  function handlePlanChange(next: PlanId) {
    if (next === plan) return;
    setPlan(next);
    const meta = PLAN_META[next];
    toast({
      title: `Manifiesto cargado: ${meta.name}`,
      description: `${meta.sectionCount} secciones · ${meta.widgetCount} widgets · ${meta.bundleSize} JS · "${meta.tagline}"`,
    });
  }

  const meta = PLAN_META[plan];

  return (
    <div className="space-y-5 overflow-x-hidden">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
              Navigation Manifest
            </h1>
            
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            El shell se compone dinámicamente desde entitlements. Cambia de plan
            y verás cómo cambia la navegación entera — sin recargar.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            variant="outline"
            onClick={() =>
              toast({
                title: "Manifest JSON exportado",
                description: `${MANIFEST.length} entradas · 3 planes · code-split por ruta.`,
              })
            }
            className="min-h-11"
          >
            <FileCode2 className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar manifest</span>
            <span className="sm:hidden">Exportar</span>
          </Button>
        </div>
      </header>

      {/* Plan selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          Plan:
        </span>
        <PlanSelector current={plan} onChange={handlePlanChange} />
      </div>

      {/* Stats strip */}
      <div ref={ref} className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <AnimatedStat
          icon={Layers}
          label="Secciones"
          value={meta.sectionCount.toString()}
          sub={`${meta.sectionCount} entradas`}
          tone="gold"
          inView={inView}
          progress={progress}
        />
        <AnimatedStat
          icon={LayoutDashboard}
          label="Widgets"
          value={meta.widgetCount.toString()}
          sub="en dashboard"
          tone="teal"
          inView={inView}
          progress={progress}
        />
        <AnimatedStat
          icon={FileCode2}
          label="Bundle JS"
          value={meta.bundleSize}
          sub={`${meta.bundleKb} KB descargados`}
          inView={inView}
          progress={progress}
        />
        <AnimatedStat
          icon={Crown}
          label="Plan"
          value={`${meta.price}€/mes`}
          sub={meta.tagline}
          tone="emerald"
          inView={inView}
          progress={progress}
        />
      </div>

      {/* Main 2-col layout: nav tree (left) + plan summary (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Nav tree — left */}
        <SectionCard
          title="Árbol de navegación"
          desc={`${meta.sectionCount} secciones · agrupadas por dominio`}
          icon={Layers}
          className="lg:col-span-3"
          action={
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] uppercase tracking-wider font-mono",
                plan === "professional"
                  ? "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]"
                  : plan === "enterprise"
                    ? "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]"
                    : "border-border/40 bg-foreground/[0.04] text-muted-foreground"
              )}
            >
              <span className="inline-flex items-center gap-1">
                <span className={cn("h-1.5 w-1.5 rounded-full", planAccentCls(plan).dot)} />
                {meta.name}
              </span>
            </Badge>
          }
        >
          <NavTree plan={plan} />
        </SectionCard>

        {/* Plan summary — right */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Sparkles className="h-4 w-4 text-[var(--gold)]" />
            <h2 className="font-display text-lg">Resumen del plan</h2>
            <Badge
              variant="outline"
              className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] text-[10px] uppercase tracking-wider font-mono"
            >
              {meta.sectionCount} secciones · {meta.widgetCount} widgets
            </Badge>
          </div>
          <PlanSummary plan={plan} />
        </div>
      </div>

      {/* Code splitting visualization */}
      <SectionCard
        title="Code splitting por plan"
        desc="El JS de Enterprise no llega al navegador de un Starter"
        icon={FileCode2}
      >
        <CodeSplitViz current={plan} />
      </SectionCard>

      {/* Personalization preview (Fase 3+) */}
      <SectionCard
        title="Personalización (Fase 3+)"
        desc="Widgets movibles, temas, favoritos, Ctrl+K, densidad"
        icon={Palette}
        action={
          <Badge
            variant="outline"
            className="border-amber-400/40 bg-amber-400/10 text-amber-300 text-[10px] uppercase tracking-wider font-mono"
          >
            roadmap
          </Badge>
        }
      >
        <PersonalizationPreview />
      </SectionCard>

      {/* Manifest matrix */}
      <SectionCard
        title="Matriz completa del manifest"
        desc={`${MANIFEST.length} entradas × 3 planes · ✔ disponible · ✖ no cargado`}
        icon={Layers}
      >
        <ManifestMatrix current={plan} />
      </SectionCard>

      {/* Footer — how it composes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            icon: ShieldCheck,
            tone: "gold" as const,
            title: "1 · Entitlements",
            detail: "can(org, feature) → bool. Define qué secciones están disponibles.",
          },
          {
            icon: Layers,
            tone: "gold" as const,
            title: "2 · Manifest",
            detail: "Lista de entradas con icon, label, feature, permiso, grupo y orden.",
          },
          {
            icon: FileCode2,
            tone: "teal" as const,
            title: "3 · Code split",
            detail: "Cada sección es un chunk lazy-load — solo se carga si está en el plan.",
          },
        ].map((step) => {
          const Icon = step.icon;
          const tone = planAccentCls(step.tone === "gold" ? "professional" : "enterprise");
          return (
            <motion.div
              key={step.title}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="rp-glass rounded-xl border border-border/40 p-3 min-w-0"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={cn(
                    "h-7 w-7 rounded-md flex items-center justify-center border shrink-0",
                    tone.border,
                    tone.bg,
                    tone.text
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  {step.title}
                </span>
              </div>
              <div className="text-[11px] text-foreground/80 leading-relaxed">
                {step.detail}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="rp-glass rounded-2xl p-4 flex items-start gap-3">
        <Layers className="h-5 w-5 text-[var(--teal)] shrink-0 mt-0.5" />
        <div className="text-[12px] text-muted-foreground leading-relaxed">
          <span className="text-foreground font-medium">Dato demo:</span> esta vista
          muestra el manifest completo de RestoPanel — <span className="font-mono text-foreground/80">{MANIFEST.length} entradas</span>{" "}
          repartidas en <span className="text-[var(--gold-soft)] font-medium">3 planes</span>. El shell
          consulta el manifest en runtime contra los entitlements del usuario y compone
          el sidebar + dashboard sin recargar la página.
        </div>
      </div>
    </div>
  );
}
