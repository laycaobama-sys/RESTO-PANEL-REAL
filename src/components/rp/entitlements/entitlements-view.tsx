"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  ShieldCheck,
  Sparkles,
  Crown,
  Check,
  X,
  Lock,
  AlertTriangle,
  TrendingUp,
  Zap,
  Power,
  RotateCcw,
  Users,
  Store,
  Calendar,
  Bot,
  Boxes,
  Webhook,
  History,
  ChevronRight,
  Sliders,
  Code2,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type Plan = "Starter" | "Professional" | "Enterprise";
type Tier = "starter" | "professional" | "enterprise";

interface Feature {
  id: string;
  label: string;
  category: string;
  starter: number | boolean | string;
  professional: number | boolean | string;
  enterprise: number | boolean | string;
}

interface UsageCounter {
  id: string;
  label: string;
  icon: React.ElementType;
  current: number;
  limit: number;
  unit: string;
  critical: boolean; // "Nunca bloquear operación crítica"
}

interface LifecyclePhase {
  phase: "trial" | "active" | "grace" | "frozen" | "churned";
  label: string;
  desc: string;
  color: string;
  current: boolean;
}

interface Override {
  feature: string;
  base: string;
  override: string;
  reason: string;
}

/* =========================================================
 * Feature matrix
 * =======================================================*/
const CATEGORIES = [
  "Locales & usuarios",
  "Operaciones",
  "Marketing & growth",
  "Pagos & billing",
  "IA & automatizaciones",
  "Integraciones & API",
  "Analítica & reports",
  "Compliance & seguridad",
  "Multi-local & franquicia",
  "Datos & almacenamiento",
  "Soporte",
  "Developer",
] as const;

const FEATURES: Feature[] = [
  // Locales & usuarios
  { id: "f1", label: "Locales", category: "Locales & usuarios", starter: 1, professional: 5, enterprise: "∞" },
  { id: "f2", label: "Usuarios", category: "Locales & usuarios", starter: 5, professional: 25, enterprise: 200 },
  { id: "f3", label: "Roles RBAC", category: "Locales & usuarios", starter: 3, professional: 8, enterprise: "∞" },
  { id: "f4", label: "Multi-marca", category: "Locales & usuarios", starter: false, professional: true, enterprise: true },

  // Operaciones
  { id: "f5", label: "Reservas/mes", category: "Operaciones", starter: "∞", professional: "∞", enterprise: "∞" },
  { id: "f6", label: "Mesas activas", category: "Operaciones", starter: 30, professional: 150, enterprise: "∞" },
  { id: "f7", label: "KDS estaciones", category: "Operaciones", starter: 1, professional: 4, enterprise: "∞" },
  { id: "f8", label: "Carta digital QR", category: "Operaciones", starter: true, professional: true, enterprise: true },
  { id: "f9", label: "Carta centralizada", category: "Operaciones", starter: false, professional: false, enterprise: true },
  { id: "f10", label: "Floor editor avanzado", category: "Operaciones", starter: false, professional: true, enterprise: true },

  // Marketing & growth
  { id: "f11", label: "Campañas email", category: "Marketing & growth", starter: 100, professional: 1000, enterprise: "∞" },
  { id: "f12", label: "CRM segmentos", category: "Marketing & growth", starter: 3, professional: 12, enterprise: "∞" },
  { id: "f13", label: "Loyalty program", category: "Marketing & growth", starter: false, professional: true, enterprise: true },
  { id: "f14", label: "Reputation monitoring", category: "Marketing & growth", starter: false, professional: true, enterprise: true },
  { id: "f15", label: "Automations builder", category: "Marketing & growth", starter: 3, professional: 20, enterprise: "∞" },

  // Pagos & billing
  { id: "f16", label: "Métodos de pago", category: "Pagos & billing", starter: 2, professional: 5, enterprise: "∞" },
  { id: "f17", label: "Cobros con tarjeta", category: "Pagos & billing", starter: true, professional: true, enterprise: true },
  { id: "f18", label: "Reconciliación automática", category: "Pagos & billing", starter: false, professional: true, enterprise: true },
  { id: "f19", label: "Multi-divisa", category: "Pagos & billing", starter: false, professional: false, enterprise: true },

  // IA & automatizaciones
  { id: "f20", label: "AI Copilot calls/mes", category: "IA & automatizaciones", starter: 50, professional: 500, enterprise: "∞" },
  { id: "f21", label: "Predict demand", category: "IA & automatizaciones", starter: false, professional: true, enterprise: true },
  { id: "f22", label: "AI Reviews responder", category: "IA & automatizaciones", starter: false, professional: true, enterprise: true },
  { id: "f23", label: "Custom AI models", category: "IA & automatizaciones", starter: false, professional: false, enterprise: true },
  { id: "f24", label: "Workers AI tokens/mes", category: "IA & automatizaciones", starter: "100k", professional: "1M", enterprise: "10M" },

  // Integraciones & API
  { id: "f25", label: "Apps marketplace", category: "Integraciones & API", starter: 5, professional: "∞", enterprise: "∞" },
  { id: "f26", label: "Apps privadas", category: "Integraciones & API", starter: false, professional: false, enterprise: 10 },
  { id: "f27", label: "Webhook RPS", category: "Integraciones & API", starter: 10, professional: 100, enterprise: 1000 },
  { id: "f28", label: "API keys", category: "Integraciones & API", starter: 1, professional: 5, enterprise: 25 },
  { id: "f29", label: "OAuth apps", category: "Integraciones & API", starter: false, professional: 3, enterprise: "∞" },

  // Analítica & reports
  { id: "f30", label: "Reports diarios", category: "Analítica & reports", starter: true, professional: true, enterprise: true },
  { id: "f31", label: "Custom dashboards", category: "Analítica & reports", starter: false, professional: 5, enterprise: "∞" },
  { id: "f32", label: "P&L consolidado", category: "Analítica & reports", starter: false, professional: false, enterprise: true },
  { id: "f33", label: "Exportación BI", category: "Analítica & reports", starter: false, professional: true, enterprise: true },

  // Compliance & seguridad
  { id: "f34", label: "GDPR suite", category: "Compliance & seguridad", starter: false, professional: true, enterprise: true },
  { id: "f35", label: "Audit log retention", category: "Compliance & seguridad", starter: "30 días", professional: "1 año", enterprise: "5 años" },
  { id: "f36", label: "SSO/SAML", category: "Compliance & seguridad", starter: false, professional: false, enterprise: true },
  { id: "f37", label: "MFA enforcement", category: "Compliance & seguridad", starter: false, professional: true, enterprise: true },
  { id: "f38", label: "IP allowlist", category: "Compliance & seguridad", starter: false, professional: false, enterprise: true },

  // Multi-local & franquicia
  { id: "f39", label: "Multi-local dashboard", category: "Multi-local & franquicia", starter: false, professional: true, enterprise: true },
  { id: "f40", label: "Modo franquicia", category: "Multi-local & franquicia", starter: false, professional: false, enterprise: true },
  { id: "f41", label: "Royalties engine", category: "Multi-local & franquicia", starter: false, professional: false, enterprise: true },

  // Datos & almacenamiento
  { id: "f42", label: "D1 storage", category: "Datos & almacenamiento", starter: "1 GB", professional: "10 GB", enterprise: "100 GB" },
  { id: "f43", label: "R2 objects", category: "Datos & almacenamiento", starter: "1k", professional: "50k", enterprise: "1M" },
  { id: "f44", label: "Realtime connections", category: "Datos & almacenamiento", starter: 10, professional: 100, enterprise: "∞" },

  // Soporte
  { id: "f45", label: "Canal soporte", category: "Soporte", starter: "Email", professional: "Email + chat", enterprise: "24/7 + CSM" },
  { id: "f46", label: "SLA respuesta", category: "Soporte", starter: "48h", professional: "8h", enterprise: "1h" },
  { id: "f47", label: "Onboarding asistido", category: "Soporte", starter: false, professional: true, enterprise: true },

  // Developer
  { id: "f48", label: "Developer portal", category: "Developer", starter: false, professional: true, enterprise: true },
  { id: "f49", label: "Sandbox env", category: "Developer", starter: false, professional: true, enterprise: true },
  { id: "f50", label: "Read replica D1", category: "Developer", starter: false, professional: false, enterprise: true },
  { id: "f51", label: "Event bus Kafka", category: "Developer", starter: false, professional: false, enterprise: true },
  { id: "f52", label: "Custom domain", category: "Developer", starter: false, professional: true, enterprise: true },
];

/* =========================================================
 * Usage counters (live, 6 with 80%/100% warnings)
 * =======================================================*/
const USAGE: UsageCounter[] = [
  { id: "u1", label: "Locales", icon: Store, current: 5, limit: 5, unit: "locales", critical: true },
  { id: "u2", label: "Usuarios", icon: Users, current: 22, limit: 25, unit: "usuarios", critical: false },
  { id: "u3", label: "AI Copilot calls", icon: Bot, current: 478, limit: 500, unit: "calls/mes", critical: false },
  { id: "u4", label: "Webhook RPS", icon: Webhook, current: 84, limit: 100, unit: "req/s", critical: false },
  { id: "u5", label: "Reservas/mes", icon: Calendar, current: 1240, limit: Infinity, unit: "reservas", critical: true },
  { id: "u6", label: "API calls/min", icon: Zap, current: 312, limit: 600, unit: "calls/min", critical: false },
];

const LIFECYCLE: LifecyclePhase[] = [
  { phase: "trial", label: "Trial", desc: "14 días · sin tarjeta", color: "var(--rp-blue)", current: false },
  { phase: "active", label: "Activo", desc: "Suscripción vigente", color: "var(--rp-emerald)", current: true },
  { phase: "grace", label: "Grace period", desc: "Pago fallido · 7 días", color: "var(--rp-yellow)", current: false },
  { phase: "frozen", label: "Congelado", desc: "Lectura + export", color: "var(--rp-red)", current: false },
  { phase: "churned", label: "Churned", desc: "Datos 90 días", color: "var(--rp-red)", current: false },
];

const ENTERPRISE_OVERRIDES: Override[] = [
  { feature: "Webhook RPS", base: "1000", override: "2500", reason: "Cliente legacy con high-volume ETL" },
  { feature: "D1 storage", base: "100 GB", override: "500 GB", reason: "Cadena con 80 locales · histórico 5 años" },
  { feature: "Workers AI tokens", base: "10M", override: "40M", reason: "AI Copilot usado en production 24/7" },
  { feature: "API keys", base: "25", override: "60", reason: "Integración con 30+ servicios terceros" },
];

/* =========================================================
 * Helpers
 * =======================================================*/
function CellValue({ v }: { v: number | boolean | string }) {
  if (typeof v === "boolean") {
    return v
      ? <Check className="h-3.5 w-3.5 text-[var(--rp-emerald)]" aria-label="Incluido" />
      : <X className="h-3.5 w-3.5 text-muted-foreground/40" aria-label="No incluido" />;
  }
  if (v === "∞") return <span className="text-[var(--rp-violet)] font-mono">∞</span>;
  return <span className="font-mono text-xs">{String(v)}</span>;
}

function PlanPill({ plan }: { plan: Plan }) {
  const map: Record<Plan, string> = {
    Starter: "border-border/60 text-muted-foreground",
    Professional: "border-[var(--rp-emerald)]/40 text-[var(--rp-emerald)]",
    Enterprise: "border-[var(--rp-violet)]/40 text-[var(--rp-violet)]",
  };
  const Icon = plan === "Enterprise" ? Crown : plan === "Professional" ? Sparkles : Store;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider", map[plan])}>
      <Icon className="h-2.5 w-2.5" aria-hidden /> {plan}
    </span>
  );
}

/* =========================================================
 * Matrix view
 * =======================================================*/
function FeatureMatrix() {
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});
  const [highlight, setHighlight] = React.useState<Tier>("professional");

  const toggle = (c: string) => setCollapsed(prev => ({ ...prev, [c]: !prev[c] }));

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium">Matriz de features</h3>
          <p className="text-[11px] text-muted-foreground">{FEATURES.length} features · {CATEGORIES.length} categorías</p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-[11px] text-muted-foreground">Destacar plan:</Label>
          <div className="flex gap-1">
            {(["starter", "professional", "enterprise"] as const).map((t) => (
              <Button
                key={t}
                size="sm"
                variant={highlight === t ? "default" : "outline"}
                className={cn("h-7 text-[11px] capitalize", highlight === t && (t === "enterprise" ? "bg-[var(--rp-violet)] text-white hover:bg-[var(--rp-violet)]/90" : t === "professional" ? "bg-[var(--rp-emerald)] text-[#062018] hover:bg-[var(--rp-emerald)]/90" : "bg-foreground text-background hover:bg-foreground/90"))}
                onClick={() => setHighlight(t)}
              >
                {t}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Plan headers */}
      <div className="rp-glass rounded-xl border border-border/60 overflow-hidden">
        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full text-xs">
            <thead className="bg-foreground/[0.04] sticky top-0">
              <tr className="border-b border-border/40">
                <th className="py-2.5 px-3 text-left font-medium w-1/2">Feature</th>
                <th className={cn("py-2.5 px-2 text-center font-medium", highlight === "starter" && "bg-foreground/[0.04]")}>
                  <div className="flex items-center justify-center gap-1"><Store className="h-3 w-3 text-muted-foreground" aria-hidden /> Starter</div>
                  <div className="text-[9px] text-muted-foreground font-mono font-normal mt-0.5">49€/mes</div>
                </th>
                <th className={cn("py-2.5 px-2 text-center font-medium", highlight === "professional" && "bg-[var(--rp-emerald)]/[0.06]")}>
                  <div className="flex items-center justify-center gap-1 text-[var(--rp-emerald)]"><Sparkles className="h-3 w-3" aria-hidden /> Professional</div>
                  <div className="text-[9px] text-muted-foreground font-mono font-normal mt-0.5">149€/mes</div>
                </th>
                <th className={cn("py-2.5 px-2 text-center font-medium", highlight === "enterprise" && "bg-[var(--rp-violet)]/[0.06]")}>
                  <div className="flex items-center justify-center gap-1 text-[var(--rp-violet)]"><Crown className="h-3 w-3" aria-hidden /> Enterprise</div>
                  <div className="text-[9px] text-muted-foreground font-mono font-normal mt-0.5">490€/mes</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((cat) => {
                const feats = FEATURES.filter(f => f.category === cat);
                const isCollapsed = collapsed[cat];
                return (
                  <React.Fragment key={cat}>
                    <tr className="border-b border-border/30 bg-foreground/[0.02]">
                      <td colSpan={4} className="py-1.5 px-3">
                        <button
                          type="button"
                          onClick={() => toggle(cat)}
                          className="w-full flex items-center justify-between text-left"
                          aria-expanded={!isCollapsed}
                        >
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{cat}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{feats.length} · {isCollapsed ? "+" : "−"}</span>
                        </button>
                      </td>
                    </tr>
                    {!isCollapsed && feats.map((f) => (
                      <tr key={f.id} className="border-b border-border/20 hover:bg-foreground/[0.02]">
                        <td className="py-2 px-3">{f.label}</td>
                        <td className={cn("py-2 px-2 text-center", highlight === "starter" && "bg-foreground/[0.02]")}><CellValue v={f.starter} /></td>
                        <td className={cn("py-2 px-2 text-center", highlight === "professional" && "bg-[var(--rp-emerald)]/[0.04]")}><CellValue v={f.professional} /></td>
                        <td className={cn("py-2 px-2 text-center", highlight === "enterprise" && "bg-[var(--rp-violet)]/[0.04]")}><CellValue v={f.enterprise} /></td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Usage counters
 * =======================================================*/
function UsagePanel() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Usage counters (live)</h3>
          <p className="text-[11px] text-muted-foreground">Consumo actual · plan <PlanPill plan="Professional" /></p>
        </div>
        <Badge variant="outline" className="border-[var(--rp-red)]/40 text-[var(--rp-red)] text-[10px]">
          <AlertTriangle className="h-3 w-3 mr-1" aria-hidden /> Nunca bloquear operación crítica
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {USAGE.map((u) => {
          const Icon = u.icon;
          const ratio = u.limit === Infinity ? 0 : u.current / u.limit;
          const pct = Math.min(100, Math.round(ratio * 100));
          const isUnlimited = u.limit === Infinity;
          const isWarn = !isUnlimited && pct >= 80 && pct < 100;
          const isMax = !isUnlimited && pct >= 100;
          const color = isUnlimited ? "var(--rp-emerald)" : isMax ? "var(--rp-red)" : isWarn ? "var(--rp-yellow)" : "var(--rp-emerald)";
          return (
            <div
              key={u.id}
              className={cn(
                "rp-glass rounded-xl border p-3.5",
                isMax ? "border-[var(--rp-red)]/40" : isWarn ? "border-[var(--rp-yellow)]/40" : "border-border/60"
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" style={{ color }} aria-hidden />
                  <span className="text-xs font-medium">{u.label}</span>
                </div>
                {u.critical && (
                  <Badge variant="outline" className="text-[9px] h-4 px-1 border-[var(--rp-red)]/40 text-[var(--rp-red)]">
                    <Power className="h-2.5 w-2.5 mr-0.5" aria-hidden /> crítico
                  </Badge>
                )}
              </div>
              <div className="flex items-baseline gap-1 mb-1.5">
                <span className="text-lg font-display font-mono" style={{ color }}>{u.current.toLocaleString("es-ES")}</span>
                <span className="text-[11px] text-muted-foreground font-mono">/ {isUnlimited ? "∞" : u.limit.toLocaleString("es-ES")} {u.unit}</span>
              </div>
              {!isUnlimited && (
                <>
                  <Progress value={pct} className="h-1.5" style={{ ["--progress-foreground" as string]: color }} />
                  <div className="flex items-center justify-between mt-1 text-[10px] font-mono">
                    <span style={{ color }}>{pct}%</span>
                    {isMax
                      ? <span className="text-[var(--rp-red)] flex items-center gap-1"><Lock className="h-2.5 w-2.5" aria-hidden /> límite alcanzado</span>
                      : isWarn
                      ? <span className="text-[var(--rp-yellow)] flex items-center gap-1"><AlertTriangle className="h-2.5 w-2.5" aria-hidden /> acercándote al límite</span>
                      : <span className="text-muted-foreground">ok</span>}
                  </div>
                  {isMax && u.critical && (
                    <div className="mt-1.5 rounded-md bg-[var(--rp-red)]/[0.08] border border-[var(--rp-red)]/30 p-1.5 text-[10px] text-[var(--rp-red)]">
                      <Power className="h-2.5 w-2.5 inline mr-1" aria-hidden />
                      Operación crítica: seguimos sirviendo pero notificamos a admin.
                    </div>
                  )}
                </>
              )}
              {isUnlimited && (
                <div className="text-[10px] text-[var(--rp-emerald)] font-mono flex items-center gap-1">
                  <Check className="h-2.5 w-2.5" aria-hidden /> ilimitado en este plan
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
 * Simulator can()/limit()
 * =======================================================*/
function Simulator() {
  const { toast } = useToast();
  const [plan, setPlan] = React.useState<Plan>("Professional");
  const [feature, setFeature] = React.useState<string>("Webhook RPS");
  const [requested, setRequested] = React.useState(150);

  const featureRow = FEATURES.find(f => f.label === feature) || FEATURES[26];
  const limitForPlan = featureRow[plan.toString().toLowerCase() as "starter" | "professional" | "enterprise"];

  const numericLimit = typeof limitForPlan === "number" ? limitForPlan : (limitForPlan === "∞" ? Infinity : NaN);
  const isUnlimited = limitForPlan === "∞" || numericLimit === Infinity;
  const isBoolean = typeof limitForPlan === "boolean";
  const isString = typeof limitForPlan === "string" && limitForPlan !== "∞";

  const can = !isBoolean
    ? (isUnlimited ? true : !isNaN(numericLimit) ? requested <= numericLimit : false)
    : !!limitForPlan;
  const remaining = isUnlimited ? Infinity : Math.max(0, numericLimit - requested);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Sliders className="h-4 w-4 text-[var(--rp-emerald)]" aria-hidden /> Simulador <code className="text-[var(--rp-emerald)]">can()</code> / <code className="text-[var(--rp-emerald)]">limit()</code>
        </h3>
        <p className="text-[11px] text-muted-foreground">Comprueba en tiempo real qué puede hacer un tenant antes de ejecutar la acción.</p>
      </div>
      <div className="rp-glass rounded-xl border border-border/60 p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label className="text-[11px]">Plan</Label>
            <select value={plan} onChange={(e) => setPlan(e.target.value as Plan)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option>Starter</option><option>Professional</option><option>Enterprise</option>
            </select>
          </div>
          <div>
            <Label className="text-[11px]">Feature</Label>
            <select value={feature} onChange={(e) => setFeature(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
              {FEATURES.filter(f => typeof f.starter === "number").map(f => <option key={f.id}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-[11px]">Cantidad solicitada</Label>
            <Input type="number" value={requested} onChange={(e) => setRequested(Number(e.target.value))} className="h-9 font-mono" />
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-md bg-foreground/[0.04] p-3">
            <div className="text-[10px] uppercase text-muted-foreground font-mono">limit() para {plan}</div>
            <div className="text-lg font-mono mt-1" style={{ color: isUnlimited ? "var(--rp-violet)" : "var(--rp-emerald)" }}>
              {isBoolean ? (limitForPlan ? "true" : "false") : isString ? limitForPlan : isUnlimited ? "∞" : numericLimit}
            </div>
          </div>
          <div className="rounded-md bg-foreground/[0.04] p-3">
            <div className="text-[10px] uppercase text-muted-foreground font-mono">can() = requested ≤ limit</div>
            <div className="text-lg font-mono mt-1 flex items-center gap-2" style={{ color: can ? "var(--rp-emerald)" : "var(--rp-red)" }}>
              {can
                ? <><Check className="h-5 w-5" aria-hidden /> true</>
                : <><X className="h-5 w-5" aria-hidden /> false</>}
            </div>
          </div>
          <div className="rounded-md bg-foreground/[0.04] p-3">
            <div className="text-[10px] uppercase text-muted-foreground font-mono">remaining()</div>
            <div className="text-lg font-mono mt-1" style={{ color: "var(--rp-blue)" }}>
              {isUnlimited ? "∞" : isBoolean ? "—" : remaining}
            </div>
          </div>
        </div>
        <div className={cn("rounded-md border p-2.5 text-[11px] flex items-center gap-2", can ? "border-[var(--rp-emerald)]/30 bg-[var(--rp-emerald)]/[0.04] text-[var(--rp-emerald)]" : "border-[var(--rp-red)]/30 bg-[var(--rp-red)]/[0.04] text-[var(--rp-red)]")}>
          {can
            ? <><Check className="h-3.5 w-3.5" aria-hidden /> Acción permitida. El motor la deja pasar.</>
            : <><Lock className="h-3.5 w-3.5" aria-hidden /> Acción bloqueada. Si es crítica, degradar antes que bloquear.</>}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast({ title: "Test ejecutado", description: `can()=${can} para ${feature}` })}>
            <Code2 className="h-3.5 w-3.5 mr-1" aria-hidden /> Probar API
          </Button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Lifecycle panel
 * =======================================================*/
function LifecyclePanel() {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium flex items-center gap-2">
          <History className="h-4 w-4 text-[var(--rp-emerald)]" aria-hidden /> Lifecycle del tenant
        </h3>
        <p className="text-[11px] text-muted-foreground">Transiciones de estado · degradación progresiva antes de congelar.</p>
      </div>
      <div className="rp-glass rounded-xl border border-border/60 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {LIFECYCLE.map((p, i) => {
            const isLast = i === LIFECYCLE.length - 1;
            return (
              <React.Fragment key={p.phase}>
                <div className={cn("rounded-md border p-2.5", p.current ? "bg-foreground/[0.05]" : "")} style={{ borderColor: p.current ? p.color : undefined }}>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} aria-hidden />
                    <span className="text-[11px] font-medium" style={{ color: p.color }}>{p.label}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{p.desc}</div>
                  {p.current && <Badge variant="outline" className="text-[9px] mt-1 border-[var(--rp-emerald)]/40 text-[var(--rp-emerald)]">actual</Badge>}
                </div>
                {!isLast && <ChevronRight className="hidden sm:block h-3 w-3 text-muted-foreground/40 self-center mx-auto" aria-hidden />}
              </React.Fragment>
            );
          })}
        </div>
        <Separator className="my-4" />
        <div className="space-y-2 text-[11px]">
          <div className="font-medium text-xs mb-1">Reglas de degradación:</div>
          <div className="flex items-start gap-2"><Power className="h-3.5 w-3.5 text-[var(--rp-red)] mt-0.5 shrink-0" aria-hidden /><span><strong>Nunca bloquear operación crítica:</strong> cobros, reservas existentes y envío de comandas se mantienen activos durante grace y frozen. Solo se deshabilitan las funcionalidades no esenciales.</span></div>
          <div className="flex items-start gap-2"><Zap className="h-3.5 w-3.5 text-[var(--rp-yellow)] mt-0.5 shrink-0" aria-hidden /><span><strong>Grace period (7 días):</strong> tras impago, se muestran banners + se restringen exports y campañas.</span></div>
          <div className="flex items-start gap-2"><Lock className="h-3.5 w-3.5 text-[var(--rp-red)] mt-0.5 shrink-0" aria-hidden /><span><strong>Frozen:</strong> acceso de solo lectura + export de datos. Las operaciones críticas siguen disponibles.</span></div>
          <div className="flex items-start gap-2"><RotateCcw className="h-3.5 w-3.5 text-[var(--rp-emerald)] mt-0.5 shrink-0" aria-hidden /><span><strong>Reactivación:</strong> cualquier pago pendiente restaura el plan completo en &lt; 5 min.</span></div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Enterprise overrides
 * =======================================================*/
function EnterpriseOverrides() {
  const { toast } = useToast();
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Crown className="h-4 w-4 text-[var(--rp-violet)]" aria-hidden /> Enterprise overrides
          </h3>
          <p className="text-[11px] text-muted-foreground">Overrides personalizados por contrato. Solo disponible en Enterprise.</p>
        </div>
        <Button size="sm" className="h-7 text-[11px] bg-[var(--rp-violet)] hover:bg-[var(--rp-violet)]/90 text-white" onClick={() => toast({ title: "Override creado", description: "Pendiente aprobación de FinOps." })}>
          + Nuevo override
        </Button>
      </div>
      <div className="rp-glass rounded-xl border border-border/60 overflow-hidden">
        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full text-xs">
            <thead className="bg-foreground/[0.03] text-left text-muted-foreground">
              <tr className="border-b border-border/40">
                <th className="py-2 px-3 font-medium">Feature</th>
                <th className="py-2 px-2 font-medium text-right">Límite base</th>
                <th className="py-2 px-2 font-medium text-right">Override</th>
                <th className="py-2 px-2 font-medium">Motivo</th>
                <th className="py-2 px-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ENTERPRISE_OVERRIDES.map((o) => (
                <tr key={o.feature} className="border-b border-border/30">
                  <td className="py-2 px-3 font-medium">{o.feature}</td>
                  <td className="py-2 px-2 text-right font-mono text-muted-foreground">{o.base}</td>
                  <td className="py-2 px-2 text-right font-mono text-[var(--rp-violet)]">{o.override}</td>
                  <td className="py-2 px-2 text-[11px] text-muted-foreground">{o.reason}</td>
                  <td className="py-2 px-2">
                    <Badge variant="outline" className="text-[9px] border-[var(--rp-emerald)]/40 text-[var(--rp-emerald)]">
                      <Check className="h-2.5 w-2.5 mr-0.5" aria-hidden /> activo
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Main view
 * =======================================================*/
export function EntitlementsView() {
  const [tab, setTab] = React.useState("matrix");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[var(--rp-emerald)]/15 p-2">
            <ShieldCheck className="h-5 w-5 text-[var(--rp-emerald)]" aria-hidden />
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-medium tracking-tight">Motor de entitlements</h2>
            <p className="text-xs text-muted-foreground">Define qué puede hacer cada plan · can() / limit() en tiempo real.</p>
          </div>
        </div>
        <PlanPill plan="Enterprise" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full justify-start overflow-x-auto rp-scroll-thin h-9">
          <TabsTrigger value="matrix" className="text-xs"><Boxes className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Matriz</TabsTrigger>
          <TabsTrigger value="usage" className="text-xs"><TrendingUp className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Usage live</TabsTrigger>
          <TabsTrigger value="simulator" className="text-xs"><Sliders className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Simulador</TabsTrigger>
          <TabsTrigger value="lifecycle" className="text-xs"><History className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Lifecycle</TabsTrigger>
          <TabsTrigger value="overrides" className="text-xs"><Crown className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Enterprise</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="mt-4"><FeatureMatrix /></TabsContent>
        <TabsContent value="usage" className="mt-4"><UsagePanel /></TabsContent>
        <TabsContent value="simulator" className="mt-4"><Simulator /></TabsContent>
        <TabsContent value="lifecycle" className="mt-4"><LifecyclePanel /></TabsContent>
        <TabsContent value="overrides" className="mt-4"><EnterpriseOverrides /></TabsContent>
      </Tabs>
    </div>
  );
}

export default EntitlementsView;
