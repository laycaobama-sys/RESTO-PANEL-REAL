"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion, useReducedMotion } from "framer-motion";
import {
  ShieldCheck, Sparkles, Zap, Crown, Check, X, Server,
  Building2, Users, BrainCircuit, Mail, KeyRound, Gauge,
  AlertTriangle, Ban, ArrowUpRight, ChevronDown, Lightbulb,
  Terminal, RefreshCw, Database, Cpu, Globe, Route as RouteIcon,
  Infinity as InfinityIcon, Activity, CircleCheck, CircleX,
  TrendingUp, Lock,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/

export type PlanId = "starter" | "professional" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // €/mes
  accent: "muted" | "gold" | "teal";
  icon: React.ElementType;
}

export interface EntitlementMap {
  features: Record<string, boolean>;
  limits: Record<string, number>; // -1 = unlimited, 0 = blocked
}

export interface RouteRow {
  route: string;
  feature: string;
  label: string;
}

export interface UsageRow {
  id: string;
  label: string;
  feature: string;
  icon: React.ElementType;
  byPlan: Record<PlanId, { current: number; limit: number; unit: string }>;
}

/* =========================================================
 * Mock data — motor de entitlements real
 * =======================================================*/

const PLANS: Plan[] = [
  { id: "starter", name: "Starter", price: 49, accent: "muted", icon: Sparkles },
  { id: "professional", name: "Professional", price: 99, accent: "gold", icon: Zap },
  { id: "enterprise", name: "Enterprise", price: 249, accent: "teal", icon: Crown },
];

/** Per-plan entitlements — single source of truth, evaluated in runtime. */
const ENTITLEMENTS: Record<PlanId, EntitlementMap> = {
  starter: {
    features: {
      "pos.terminal": true,
      "reservas.engine": true,
      "carta.qr": true,
      "delivery.own_channel": false,
      "delivery.aggregators": false,
      "api.read": true,
      "api.write": false,
      "gov.multi_local": false,
      "crm.advanced": false,
      "ia.copilot": false,
      "whatsapp.business": false,
      "yield.pricing": false,
    },
    limits: {
      locales: 1,
      usuarios: 10,
      ia_requests: 10,
      emails: 500,
      automatizaciones: 3,
      kds_pantallas: 1,
    },
  },
  professional: {
    features: {
      "pos.terminal": true,
      "reservas.engine": true,
      "carta.qr": true,
      "delivery.own_channel": true,
      "delivery.aggregators": true,
      "api.read": true,
      "api.write": false,
      "gov.multi_local": false,
      "crm.advanced": true,
      "ia.copilot": true,
      "whatsapp.business": false,
      "yield.pricing": false,
    },
    limits: {
      locales: 5,
      usuarios: -1,
      ia_requests: -1,
      emails: 5000,
      automatizaciones: 25,
      kds_pantallas: 3,
    },
  },
  enterprise: {
    features: {
      "pos.terminal": true,
      "reservas.engine": true,
      "carta.qr": true,
      "delivery.own_channel": true,
      "delivery.aggregators": true,
      "api.read": true,
      "api.write": true,
      "gov.multi_local": true,
      "crm.advanced": true,
      "ia.copilot": true,
      "whatsapp.business": true,
      "yield.pricing": true,
    },
    limits: {
      locales: -1,
      usuarios: -1,
      ia_requests: -1,
      emails: -1,
      automatizaciones: -1,
      kds_pantallas: -1,
    },
  },
};

const ROUTES: RouteRow[] = [
  { route: "/tpv", feature: "pos.terminal", label: "TPV terminal" },
  { route: "/delivery", feature: "delivery.own_channel", label: "Delivery propio canal" },
  { route: "/api", feature: "api.write", label: "API escritura" },
  { route: "/multi-local", feature: "gov.multi_local", label: "Multi-local consolidado" },
  { route: "/crm/advanced", feature: "crm.advanced", label: "CRM avanzado" },
  { route: "/copilot", feature: "ia.copilot", label: "Copiloto IA" },
];

const USAGE: UsageRow[] = [
  {
    id: "locales",
    label: "Locales",
    feature: "limit:locales",
    icon: Building2,
    byPlan: {
      starter: { current: 1, limit: 1, unit: "locales" },
      professional: { current: 3, limit: 5, unit: "locales" },
      enterprise: { current: 12, limit: -1, unit: "locales" },
    },
  },
  {
    id: "usuarios",
    label: "Usuarios",
    feature: "limit:usuarios",
    icon: Users,
    byPlan: {
      starter: { current: 8, limit: 10, unit: "usuarios" },
      professional: { current: 24, limit: -1, unit: "usuarios" },
      enterprise: { current: 47, limit: -1, unit: "usuarios" },
    },
  },
  {
    id: "ia",
    label: "IA requests",
    feature: "limit:ia_requests",
    icon: BrainCircuit,
    byPlan: {
      starter: { current: 8, limit: 10, unit: "req/mes" },
      professional: { current: 142, limit: -1, unit: "req/mes" },
      enterprise: { current: 1247, limit: -1, unit: "req/mes" },
    },
  },
  {
    id: "emails",
    label: "Emails",
    feature: "limit:emails",
    icon: Mail,
    byPlan: {
      starter: { current: 480, limit: 500, unit: "envíos/mes" },
      professional: { current: 1820, limit: 5000, unit: "envíos/mes" },
      enterprise: { current: 4820, limit: -1, unit: "envíos/mes" },
    },
  },
];

const MIDDLEWARE_SNIPPET = `// lib/entitlements/middleware.ts — backend, no solo UI
import { getOrg, getSubscription } from "@/lib/auth";
import { ENTITLEMENTS } from "@/lib/entitlements/registry";

export async function requireFeature(req: Request, feature: string) {
  const org = await getOrg(req);
  const sub = await getSubscription(org.id);

  // Re-evalua el plan en cada request (cache 5 min)
  const ent = ENTITLEMENTS[sub.planId];
  const allowed = ent.features[feature] === true;
  if (!allowed) {
    // 404, no 403: no revelar que la ruta existe
    return new Response(null, { status: 404 });
  }
  return null; // OK, continuar
}

// Uso en handler:
export async function POST(req: Request) {
  const blocked = await requireFeature(req, "api.write");
  if (blocked) return blocked;
  // ... handler
}`;

const REGISTRY_SNIPPET = `// lib/entitlements/registry.ts — fuente unica de verdad
export const ENTITLEMENTS = {
  starter: {
    features: { "pos.terminal": true, "api.write": false, ... },
    limits: { locales: 1, usuarios: 10, ia_requests: 10, ... },
  },
  professional: { ... },
  enterprise: { ... },
} as const;

// can() y limit() consumen este registry — en backend y en UI
export function can(plan: PlanId, feature: string): boolean {
  return ENTITLEMENTS[plan].features[feature] === true;
}
export function limit(plan: PlanId, key: string): number {
  return ENTITLEMENTS[plan].limits[key] ?? 0;
}`;

/* =========================================================
 * Helpers
 * =======================================================*/

function planAccentCls(plan: Plan): {
  border: string;
  bg: string;
  text: string;
  ring: string;
} {
  switch (plan.accent) {
    case "gold":
      return {
        border: "border-[var(--gold)]/60",
        bg: "bg-[var(--gold)]/10",
        text: "text-[var(--gold-soft)]",
        ring: "ring-[var(--gold)]/40",
      };
    case "teal":
      return {
        border: "border-[var(--teal)]/55",
        bg: "bg-[var(--teal)]/10",
        text: "text-[var(--teal)]",
        ring: "ring-[var(--teal)]/40",
      };
    default:
      return {
        border: "border-border/60",
        bg: "bg-foreground/[0.04]",
        text: "text-muted-foreground",
        ring: "ring-foreground/15",
      };
  }
}

/** can(org, feature) → bool. */
function can(plan: PlanId, feature: string): boolean {
  return ENTITLEMENTS[plan].features[feature] === true;
}

/** limit(org, key) → number (-1 = unlimited, 0 = blocked). */
function limitOf(plan: PlanId, key: string): number {
  return ENTITLEMENTS[plan].limits[key] ?? 0;
}

/** usage(org, key) → { current, limit }. */
function usageOf(
  plan: PlanId,
  key: string
): { current: number; limit: number; unit: string } | null {
  const row = USAGE.find((u) => u.feature === `limit:${key}`);
  if (!row) return null;
  return row.byPlan[plan];
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

function CodeBlock({
  code,
  label,
  icon: Icon = Terminal,
}: {
  code: string;
  label: string;
  icon?: React.ElementType;
}) {
  const [open, setOpen] = React.useState(true);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-xl border border-border/40 overflow-hidden">
      <CollapsibleTrigger asChild>
        <button
          className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-foreground/[0.03] hover:bg-foreground/[0.05] transition-colors min-h-9"
          aria-expanded={open}
        >
          <span className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <Icon className="h-3.5 w-3.5 text-[var(--gold)]" />
            {label}
          </span>
          <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open ? "" : "-rotate-90")} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre className="overflow-x-auto rp-scroll-thin p-3 text-[11px] leading-relaxed font-mono text-foreground/85 bg-foreground/[0.02]">
          <code>{code}</code>
        </pre>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* =========================================================
 * Plan selector — switches entitlements live
 * =======================================================*/

function PlanSelector({
  value,
  onChange,
}: {
  value: PlanId;
  onChange: (p: PlanId) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {PLANS.map((p) => {
        const active = p.id === value;
        const accent = planAccentCls(p);
        const Icon = p.icon;
        return (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            className={cn(
              "rounded-xl border p-3 flex flex-col items-center gap-1.5 transition-all min-h-[88px] justify-center",
              active
                ? cn(accent.border, accent.bg, "ring-1", accent.ring)
                : "border-border/40 hover:bg-foreground/[0.04]"
            )}
            aria-pressed={active}
          >
            <Icon className={cn("h-5 w-5", active ? accent.text : "text-muted-foreground")} />
            <div className={cn("font-display text-sm", active && accent.text)}>{p.name}</div>
            <div className="text-[10px] font-mono text-muted-foreground">{p.price}€/mes</div>
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
 * API simulator — input + can() + limit() + usage()
 * =======================================================*/

function ApiSimulator({ plan }: { plan: PlanId }) {
  const [feature, setFeature] = React.useState<string>("delivery.own_channel");
  const allFeatures = Object.keys(ENTITLEMENTS[plan].features);
  const allowed = can(plan, feature);
  const matchedLimit = React.useMemo(() => {
    // Try to derive a "limit key" from the feature string
    // by mapping features to limits where applicable.
    const map: Record<string, string> = {
      "pos.terminal": "locales",
      "delivery.own_channel": "locales",
      "ia.copilot": "ia_requests",
      "crm.advanced": "emails",
    };
    return map[feature] ? limitOf(plan, map[feature]!) : null;
  }, [plan, feature]);

  const matchedUsage = React.useMemo(() => {
    const map: Record<string, string> = {
      "ia.copilot": "ia_requests",
      "crm.advanced": "emails",
      "pos.terminal": "locales",
    };
    return map[feature] ? usageOf(plan, map[feature]!) : null;
  }, [plan, feature]);

  const suggestions = ["pos.terminal", "delivery.own_channel", "api.write", "gov.multi_local", "ia.copilot", "crm.advanced"];

  return (
    <div className="space-y-4">
      <div>
        <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block mb-1.5">
          Funcionalidad a evaluar
        </label>
        <Input
          value={feature}
          onChange={(e) => setFeature(e.target.value)}
          placeholder="ej. delivery.own_channel"
          className="min-h-11 font-mono text-sm"
          aria-label="Funcionalidad"
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setFeature(s)}
              className={cn(
                "rounded-md border px-2 py-0.5 text-[10px] font-mono transition-colors",
                feature === s
                  ? "border-[var(--gold)]/50 bg-[var(--gold)]/10 text-[var(--gold-soft)]"
                  : "border-border/40 text-muted-foreground hover:bg-foreground/[0.04]"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="text-[10px] text-muted-foreground/70 mt-1.5 font-mono">
          {allFeatures.length} features registradas en el plan actual
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* can() result */}
        <div className="rp-glass rounded-xl p-3 border border-border/40 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <KeyRound className="h-3.5 w-3.5 text-[var(--gold)]" />
            <code className="text-[10px] font-mono text-muted-foreground truncate">
              can(org, "{feature}")
            </code>
          </div>
          {allowed ? (
            <div className="flex items-center gap-2">
              <CircleCheck className="h-5 w-5 text-emerald-300 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-emerald-300">true</div>
                <div className="text-[10px] text-muted-foreground truncate">Permitido</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CircleX className="h-5 w-5 text-rose-300 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-rose-300">false</div>
                <div className="text-[10px] text-muted-foreground truncate">Bloqueado · 404</div>
              </div>
            </div>
          )}
        </div>

        {/* limit() result */}
        <div className="rp-glass rounded-xl p-3 border border-border/40 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Gauge className="h-3.5 w-3.5 text-[var(--teal)]" />
            <code className="text-[10px] font-mono text-muted-foreground truncate">
              limit(org, "{feature.split(".")[0]}")
            </code>
          </div>
          {matchedLimit === null ? (
            <div className="text-[11px] text-muted-foreground/70 italic">
              Sin cuota numérica asociada
            </div>
          ) : matchedLimit === -1 ? (
            <div className="flex items-baseline gap-1">
              <InfinityIcon className="h-4 w-4 text-[var(--teal)]" />
              <span className="text-xs text-[var(--teal)]">ilimitado</span>
            </div>
          ) : matchedLimit === 0 ? (
            <div className="flex items-baseline gap-1">
              <Ban className="h-4 w-4 text-rose-300" />
              <span className="text-xs text-rose-300">bloqueado</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="font-display text-lg tabular-nums text-[var(--gold-soft)]">
                {matchedLimit}
              </span>
              <span className="text-[10px] text-muted-foreground">uds.</span>
            </div>
          )}
        </div>

        {/* usage() result */}
        <div className="rp-glass rounded-xl p-3 border border-border/40 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Activity className="h-3.5 w-3.5 text-[var(--gold)]" />
            <code className="text-[10px] font-mono text-muted-foreground truncate">
              usage(org, "{feature.split(".")[0]}")
            </code>
          </div>
          {matchedUsage ? (
            <div className="min-w-0">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-lg tabular-nums">
                  {matchedUsage.current.toLocaleString("es-ES")}
                </span>
                <span className="text-muted-foreground">/</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {matchedUsage.limit === -1 ? "∞" : matchedUsage.limit.toLocaleString("es-ES")}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground truncate">{matchedUsage.unit}</div>
            </div>
          ) : (
            <div className="text-[11px] text-muted-foreground/70 italic">
              Sin contador de uso asociado
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border/40 bg-foreground/[0.02] p-2.5 flex items-start gap-2">
        <Lightbulb className="h-3.5 w-3.5 text-[var(--gold)] shrink-0 mt-0.5" />
        <div className="text-[11px] text-muted-foreground leading-relaxed">
          Las 3 funciones <code className="font-mono text-foreground/80">can()</code>,{" "}
          <code className="font-mono text-foreground/80">limit()</code> y{" "}
          <code className="font-mono text-foreground/80">usage()</code> se evalúan
          contra el mismo registry. Cambiar el plan arriba actualiza las 3 en caliente.
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Route access table
 * =======================================================*/

function RouteAccessTable({ plan }: { plan: PlanId }) {
  return (
    <div className="overflow-x-auto rp-scroll-thin -mx-1 px-1">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <th className="py-2 pr-3 font-normal">Ruta</th>
            <th className="py-2 px-2 font-normal">Feature</th>
            <th className="py-2 px-2 font-normal text-center">Starter</th>
            <th className="py-2 px-2 font-normal text-center text-[var(--gold-soft)]">Professional</th>
            <th className="py-2 pl-2 font-normal text-center text-[var(--teal)]">Enterprise</th>
          </tr>
        </thead>
        <tbody>
          {ROUTES.map((r) => {
            const rowPlans: PlanId[] = ["starter", "professional", "enterprise"];
            return (
              <tr
                key={r.route}
                className="border-t border-border/30 hover:bg-foreground/[0.02]"
              >
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <RouteIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="font-mono text-xs truncate">{r.route}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate ml-5">{r.label}</div>
                </td>
                <td className="py-2.5 px-2">
                  <code className="text-[11px] text-[var(--gold-soft)] font-mono">{r.feature}</code>
                </td>
                {rowPlans.map((p) => {
                  const allowed = can(p, r.feature);
                  const isCurrent = p === plan;
                  return (
                    <td
                      key={p}
                      className={cn(
                        "py-2.5 px-2 text-center",
                        isCurrent && "bg-[var(--gold)]/[0.05]"
                      )}
                    >
                      {allowed ? (
                        <span className="inline-flex items-center gap-1 text-emerald-300 text-[11px] font-mono">
                          <Check className="h-3 w-3" /> Existe
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-300/80 text-[11px] font-mono">
                          <X className="h-3 w-3" /> 404
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex items-start gap-2 mt-3 text-[11px] text-muted-foreground leading-relaxed">
        <Lightbulb className="h-3.5 w-3.5 text-[var(--gold)] shrink-0 mt-0.5" />
        <span>
          La columna del plan actual ({PLANS.find((p) => p.id === plan)!.name}) está resaltada.
          Cambiar el plan arriba re-evalúa cada celda en caliente.
        </span>
      </div>
    </div>
  );
}

/* =========================================================
 * Usage counters (per current plan)
 * =======================================================*/

function UsageCounters({ plan }: { plan: PlanId }) {
  const planName = PLANS.find((p) => p.id === plan)!.name;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant="outline"
          className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] text-[10px] uppercase tracking-wider font-mono"
        >
          {planName} · consumo actual
        </Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {USAGE.map((u) => {
          const u2 = u.byPlan[plan];
          return <UsageCounterCard key={u.id} u={u} current={u2.current} limit={u2.limit} unit={u2.unit} plan={plan} />;
        })}
      </div>
    </div>
  );
}

function UsageCounterCard({
  u,
  current,
  limit,
  unit,
  plan,
}: {
  u: UsageRow;
  current: number;
  limit: number;
  unit: string;
  plan: PlanId;
}) {
  const reduce = useReducedMotion();
  const Icon = u.icon;

  const isUnlimited = limit === -1;
  const isBlocked = limit === 0;
  const pct = isUnlimited || isBlocked ? 0 : Math.min(100, Math.round((current / limit) * 100));
  const tone: "ok" | "warn" | "danger" | "blocked" | "unlimited" =
    isUnlimited ? "unlimited" : isBlocked ? "blocked" : pct >= 100 ? "danger" : pct >= 80 ? "warn" : "ok";

  const barCls =
    tone === "danger"
      ? "bg-rose-500"
      : tone === "warn"
        ? "bg-amber-400"
        : tone === "unlimited"
          ? "bg-[var(--teal)]"
          : "bg-[var(--gold)]";
  const textCls =
    tone === "danger"
      ? "text-rose-300"
      : tone === "warn"
        ? "text-amber-300"
        : tone === "unlimited"
          ? "text-[var(--teal)]"
          : tone === "blocked"
            ? "text-rose-300"
            : "text-[var(--gold-soft)]";

  // Upsell logic: at limit OR > 80% → show contextual upsell
  const showUpsell = tone === "danger" || tone === "warn";
  const targetPlan: PlanId = plan === "starter" ? "professional" : "enterprise";
  const targetPlanName = PLANS.find((p) => p.id === targetPlan)!.name;
  const deltaCost = targetPlan === "professional" ? 50 : 150;

  const { toast } = useToast();

  return (
    <div className="rp-glass rounded-xl p-4 min-w-0 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center bg-foreground/[0.04] shrink-0", textCls)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium truncate">{u.label}</span>
            {tone === "warn" && (
              <Badge className="border-amber-400/40 bg-amber-400/10 text-amber-300 text-[10px] uppercase tracking-wider font-mono shrink-0">
                <AlertTriangle className="h-3 w-3 mr-1" /> 80%
              </Badge>
            )}
            {tone === "danger" && (
              <Badge className="border-rose-500/40 bg-rose-500/10 text-rose-300 text-[10px] uppercase tracking-wider font-mono shrink-0">
                <Ban className="h-3 w-3 mr-1" /> Límite
              </Badge>
            )}
            {tone === "unlimited" && (
              <Badge className="border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)] text-[10px] uppercase tracking-wider font-mono shrink-0">
                <InfinityIcon className="h-3 w-3 mr-1" /> Sin límite
              </Badge>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground truncate">{u.feature}</div>
        </div>
      </div>

      {isUnlimited ? (
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-display text-xl tabular-nums text-[var(--teal)]">
            {current.toLocaleString("es-ES")}
          </span>
          <span className="text-xs text-muted-foreground font-mono">∞ {unit}</span>
        </div>
      ) : isBlocked ? (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
          No disponible en este plan.
        </div>
      ) : (
        <>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-display text-lg tabular-nums">
              <span className={textCls}>{current.toLocaleString("es-ES")}</span>
              <span className="text-muted-foreground mx-1">/</span>
              <span className="text-muted-foreground">{limit.toLocaleString("es-ES")}</span>
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">{unit}</span>
          </div>
          <div className="h-1.5 rounded-full bg-foreground/[0.08] overflow-hidden">
            <motion.div
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ duration: reduce ? 0 : 0.5, ease: "easeOut" }}
              className={cn("h-full rounded-full", barCls)}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-mono tabular-nums">{pct}% usado</span>
            <span className="font-mono tabular-nums">
              {Math.max(0, limit - current).toLocaleString("es-ES")} restantes
            </span>
          </div>
        </>
      )}

      {showUpsell && (
        <UpsellCard
          targetPlan={targetPlanName}
          deltaCost={deltaCost}
          onUpgrade={() =>
            toast({
              title: `Upgrade a ${targetPlanName}`,
              description: `Prorrateo: +${deltaCost}€/mes · Aplicado al instante.`,
            })
          }
        />
      )}
    </div>
  );
}

function UpsellCard({
  targetPlan,
  deltaCost,
  onUpgrade,
}: {
  targetPlan: string;
  deltaCost: number;
  onUpgrade: () => void;
}) {
  return (
    <div className="rp-gate-upsell rounded-lg p-3 flex items-center justify-between gap-2">
      <div className="min-w-0">
        <div className="text-[12px] font-medium text-[var(--gold-soft)]">
          Mejorar a {targetPlan}
        </div>
        <div className="text-[10px] text-muted-foreground font-mono">
          Prorrateo: +{deltaCost}€/mes
        </div>
      </div>
      <Button
        size="sm"
        className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] min-h-8 shrink-0"
        onClick={onUpgrade}
      >
        <ArrowUpRight className="h-3.5 w-3.5" /> Actualizar
      </Button>
    </div>
  );
}

/* =========================================================
 * Live update indicator + backend check
 * =======================================================*/

function LiveUpdateBar({ plan }: { plan: PlanId }) {
  const planName = PLANS.find((p) => p.id === plan)!.name;
  return (
    <div className="rounded-xl border border-[var(--teal)]/30 bg-[var(--teal)]/[0.06] p-3 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="relative h-2.5 w-2.5 shrink-0">
          <span className="absolute inset-0 rounded-full bg-[var(--teal)]/40 animate-ping" />
          <span className="absolute inset-0 rounded-full bg-[var(--teal)]" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-[var(--teal)]">
            Plan activo: {planName}
          </div>
          <div className="text-[11px] text-muted-foreground leading-snug">
            Cambiar de plan actualiza entitlements en caliente, sin redeploy.
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:ml-auto shrink-0">
        <Badge
          variant="outline"
          className="border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)] text-[10px] uppercase tracking-wider font-mono"
        >
          <RefreshCw className="h-3 w-3 mr-1" /> Sin redeploy
        </Badge>
        <Badge
          variant="outline"
          className="border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)] text-[10px] uppercase tracking-wider font-mono"
        >
          <Activity className="h-3 w-3 mr-1" /> Cache 5 min
        </Badge>
      </div>
    </div>
  );
}

function BackendCheckPanel() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/[0.06] p-3 flex items-start gap-3">
        <Server className="h-4 w-4 text-[var(--gold)] shrink-0 mt-0.5" />
        <div className="text-[12px] text-muted-foreground leading-relaxed">
          <span className="text-foreground font-medium">Aplicado en backend, no solo UI.</span>{" "}
          El motor se evalúa en{" "}
          <code className="font-mono text-[var(--gold-soft)]">middleware.ts</code> y en cada{" "}
          <code className="font-mono text-[var(--gold-soft)]">API route</code> antes de
          mutar datos. El cliente nunca puede pasar un plan falso: si el frontend miente,
          el backend bloquea con 404.
        </div>
      </div>
      <CodeBlock code={MIDDLEWARE_SNIPPET} label="lib/entitlements/middleware.ts" icon={Server} />
      <CodeBlock code={REGISTRY_SNIPPET} label="lib/entitlements/registry.ts" icon={Database} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <BackendTile
          icon={Lock}
          label="Frontend mentiroso"
          value="404"
          desc="Backend bloquea aunque el cliente afirme tener el plan"
        />
        <BackendTile
          icon={Cpu}
          label="Latencia can()"
          value="< 1ms"
          desc="Registry en memoria · sin query DB por request"
        />
        <BackendTile
          icon={Globe}
          label="Cache invalidación"
          value="Webhook"
          desc="Stripe webhook → flush cache → re-check"
        />
      </div>
    </div>
  );
}

function BackendTile({
  icon: Icon,
  label,
  value,
  desc,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-foreground/[0.03] p-3 min-w-0">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="h-3.5 w-3.5 text-[var(--gold)]" />
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground truncate">
          {label}
        </div>
      </div>
      <div className="font-display text-base text-[var(--gold-soft)]">{value}</div>
      <div className="text-[11px] text-muted-foreground leading-snug mt-1">{desc}</div>
    </div>
  );
}

/* =========================================================
 * Main view
 * =======================================================*/

export function EntitlementsEngineView() {
  const { toast } = useToast();
  const [plan, setPlan] = React.useState<PlanId>("starter");

  function handlePlanChange(p: PlanId) {
    if (p === plan) return;
    setPlan(p);
    const planName = PLANS.find((x) => x.id === p)!.name;
    toast({
      title: `Plan cambiado a ${planName}`,
      description: "Entitlements actualizados en caliente · sin redeploy.",
    });
  }

  return (
    <div className="space-y-5 overflow-x-hidden">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
              Entitlements Engine
            </h1>
            
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Fase 4 · Motor real can() / limit() / usage(). Una sola fuente de verdad
            consumida por frontend, backend y middleware. Cambio de plan en caliente.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            variant="outline"
            onClick={() =>
              toast({
                title: "Registry exportado",
                description: "JSON con features + limits por plan · 3 planes · 12 features.",
              })
            }
            className="min-h-11"
          >
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar registry</span>
            <span className="sm:hidden">Exportar</span>
          </Button>
          <Button
            onClick={() =>
              toast({
                title: "Sincronización con Stripe",
                description: "Webhook customer.subscription.updated procesado · cache flush.",
              })
            }
            className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] min-h-11"
          >
            <RefreshCw className="h-4 w-4" /> Sync Stripe
          </Button>
        </div>
      </header>

      {/* Plan selector */}
      <SectionCard
        title="Plan activo"
        desc="Cambia el plan y observa cómo se recalculan todos los entitlements"
        icon={ShieldCheck}
        action={
          <Badge
            variant="outline"
            className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] text-[10px] uppercase tracking-wider font-mono"
          >
            <TrendingUp className="h-3 w-3 mr-1" /> En caliente
          </Badge>
        }
      >
        <div className="space-y-4">
          <PlanSelector value={plan} onChange={handlePlanChange} />
          <LiveUpdateBar plan={plan} />
        </div>
      </SectionCard>

      {/* API simulator */}
      <SectionCard
        title="API simulator"
        desc="Escribe una feature y observa can() / limit() / usage() en tiempo real"
        icon={KeyRound}
      >
        <ApiSimulator plan={plan} />
      </SectionCard>

      {/* Route access table */}
      <SectionCard
        title="Acceso a rutas"
        desc="Cada ruta según feature requerida · ✅ Existe o 🚫 404"
        icon={RouteIcon}
      >
        <RouteAccessTable plan={plan} />
      </SectionCard>

      {/* Usage counters */}
      <SectionCard
        title="Contadores de consumo"
        desc="Por plan · upsell contextual al 80% y al 100%"
        icon={Gauge}
      >
        <UsageCounters plan={plan} />
      </SectionCard>

      {/* Backend check panel */}
      <SectionCard
        title="Aplicado en backend, no solo UI"
        desc="Defensa en profundidad · frontend nunca puede mentir al backend"
        icon={Server}
        action={
          <Badge
            variant="outline"
            className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] text-[10px] uppercase tracking-wider font-mono"
          >
            <Lock className="h-3 w-3 mr-1" /> Defensa
          </Badge>
        }
      >
        <BackendCheckPanel />
      </SectionCard>

      {/* Footer note */}
      <div className="rp-glass rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-[var(--gold)] shrink-0 mt-0.5" />
        <div className="text-[12px] text-muted-foreground leading-relaxed">
          <span className="text-foreground font-medium">Dato demo:</span> el motor{" "}
          <code className="font-mono text-foreground/80">can()</code> /{" "}
          <code className="font-mono text-foreground/80">limit()</code> /{" "}
          <code className="font-mono text-foreground/80">usage()</code> consume el
          registry <code className="font-mono text-foreground/80">ENTITLEMENTS</code> en
          runtime. Cambiar el plan arriba actualiza todas las celdas, contadores y rutas
          sin un redeploy — el backend hace re-fetch del cache (TTL 5 min) o recibe
          un webhook de Stripe que lo invalida.
        </div>
      </div>
    </div>
  );
}

export default EntitlementsEngineView;
