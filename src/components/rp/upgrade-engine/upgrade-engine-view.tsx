"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Zap,
  TrendingUp,
  Sparkles,
  Crown,
  Rocket,
  Clock,
  X,
  Check,
  MousePointerClick,
  Eye,
  DollarSign,
  Activity,
  AlertTriangle,
  Flame,
  ChevronRight,
  History,
  Settings2,
  Bell,
  Target,
  Bot,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type SignalType = "usage" | "expansion" | "trial" | "churn_risk" | "feature_limit";
type SignalStatus = "active" | "shown" | "dismissed" | "converted";

interface Signal {
  id: string;
  type: SignalType;
  tenant: string;
  trigger: string;
  score: number;
  status: SignalStatus;
  detectedAt: string;
  offerId?: string;
}

interface OfferCard {
  id: string;
  plan: "Professional" | "Enterprise";
  title: string;
  cta: string;
  monthlyPrice: number;
  delta: number;
  benefits: string[];
  tone: string;
  signalId: string;
}

interface HistoryRow {
  id: string;
  date: string;
  tenant: string;
  signal: string;
  offer: string;
  outcome: "impresión" | "clic" | "convertido" | "dismissed";
  revenue?: number;
}

/* =========================================================
 * Data
 * =======================================================*/
const ACTIVE_SIGNALS: Signal[] = [
  {
    id: "s1",
    type: "usage",
    tenant: "Mar & Sol Resorts",
    trigger: "Locales usage 4/5 (80%) · 14 días consecutivos",
    score: 88,
    status: "active",
    detectedAt: "hace 12 min",
    offerId: "of1",
  },
  {
    id: "s2",
    type: "feature_limit",
    tenant: "Sushi Wave",
    trigger: "AI Copilot quota 92% · 3 días consecutivos",
    score: 76,
    status: "active",
    detectedAt: "hace 1 h",
    offerId: "of2",
  },
  {
    id: "s3",
    type: "expansion",
    tenant: "Taco Loco Group",
    trigger: "Solicita multi-divisa vía chat de soporte",
    score: 71,
    status: "active",
    detectedAt: "hace 3 h",
    offerId: "of1",
  },
  {
    id: "s4",
    type: "trial",
    tenant: "Café Central Lisboa",
    trigger: "Trial día 12/14 · sin conversión · 0 pagos",
    score: 42,
    status: "active",
    detectedAt: "hace 30 min",
  },
  {
    id: "s5",
    type: "churn_risk",
    tenant: "Parrilla Sur",
    trigger: "Sin login 12 días · impago · health 28",
    score: 14,
    status: "active",
    detectedAt: "hace 2 h",
  },
];

const OFFERS: OfferCard[] = [
  {
    id: "of1",
    plan: "Enterprise",
    title: "Pasa a Enterprise · multi-local ilimitado",
    cta: "Hablar con ventas",
    monthlyPrice: 490,
    delta: 341,
    benefits: [
      "Locales ilimitados (vs 5)",
      "Modo franquicia + royalties engine",
      "CSM dedicado + 1h SLA",
      "Apps privadas y Developer portal",
    ],
    tone: "violet",
    signalId: "s1",
  },
  {
    id: "of2",
    plan: "Enterprise",
    title: "AI Copilot ilimitado en Enterprise",
    cta: "Ver demo",
    monthlyPrice: 490,
    delta: 341,
    benefits: [
      "AI Copilot calls ∞ (vs 500/mes)",
      "Predict demand + reviews IA",
      "Custom AI models con tus datos",
      "Workers AI 10M tokens/mes incluido",
    ],
    tone: "violet",
    signalId: "s2",
  },
];

const HISTORY: HistoryRow[] = [
  { id: "h1", date: "hace 1 h", tenant: "Mar & Sol Resorts", signal: "Locales 80%", offer: "Enterprise upgrade", outcome: "clic" },
  { id: "h2", date: "hace 4 h", tenant: "Sushi Wave", signal: "AI Copilot 92%", offer: "Enterprise AI", outcome: "impresión" },
  { id: "h3", date: "hace 1 día", tenant: "Ramses Group", signal: "Multi-marca solicitada", offer: "Enterprise + onboarding", outcome: "convertido", revenue: 341 },
  { id: "h4", date: "hace 2 días", tenant: "El Club del Chef", signal: "Reach 80% reservas", offer: "Pro upgrade", outcome: "convertido", revenue: 100 },
  { id: "h5", date: "hace 3 días", tenant: "Sakura Sushi Chain", signal: "3 locales nuevos", offer: "Enterprise multi-local", outcome: "clic" },
  { id: "h6", date: "hace 4 días", tenant: "Wok Republic", signal: "AI Copilot 95%", offer: "Enterprise AI", outcome: "dismissed" },
  { id: "h7", date: "hace 5 días", tenant: "Brasserie Lumière", signal: "Reach 80% usuarios", offer: "Pro upgrade", outcome: "impresión" },
  { id: "h8", date: "hace 6 días", tenant: "Taco Loco Group", signal: "Webhook RPS 90%", offer: "Pro upgrade", outcome: "convertido", revenue: 100 },
  { id: "h9", date: "hace 7 días", tenant: "Mar & Sol Resorts", signal: "Locales 75%", offer: "Enterprise", outcome: "impresión" },
  { id: "h10", date: "hace 8 días", tenant: "Parrilla Sur", signal: "Sin login 7 días", offer: "Win-back -50%", outcome: "dismissed" },
];

const METRICS = [
  { label: "Impresiones (30d)", value: "1.284", trend: "+18%", dir: "up" as const, icon: Eye, tone: "blue" },
  { label: "Clics (30d)", value: "312", trend: "+24%", dir: "up" as const, icon: MousePointerClick, tone: "emerald" },
  { label: "Conversión (30d)", value: "48", trend: "+11", dir: "up" as const, icon: Check, tone: "violet" },
  { label: "Ingresos generados", value: "16.380€", trend: "+22% MoM", dir: "up" as const, icon: DollarSign, tone: "emerald" },
  { label: "CTR", value: "24.3%", trend: "+1.8pp", dir: "up" as const, icon: Target, tone: "yellow" },
  { label: "Conv. rate", value: "15.4%", trend: "+3.2pp", dir: "up" as const, icon: TrendingUp, tone: "emerald" },
];

const TONE: Record<string, string> = {
  emerald: "var(--rp-emerald)",
  yellow: "var(--rp-yellow)",
  blue: "var(--rp-blue)",
  red: "var(--rp-red)",
  violet: "var(--rp-violet)",
};

/* =========================================================
 * Helpers
 * =======================================================*/
const euro = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const SIGNAL_META: Record<SignalType, { label: string; icon: React.ElementType; cls: string }> = {
  usage: { label: "Uso elevado", icon: Activity, cls: "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald)]" },
  expansion: { label: "Expansión", icon: TrendingUp, cls: "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald)]" },
  trial: { label: "Trial at risk", icon: Clock, cls: "border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow)]" },
  churn_risk: { label: "Riesgo churn", icon: AlertTriangle, cls: "border-[var(--rp-red)]/40 bg-[var(--rp-red)]/10 text-[var(--rp-red)]" },
  feature_limit: { label: "Límite feature", icon: Zap, cls: "border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow)]" },
};

/* =========================================================
 * Signals panel
 * =======================================================*/
function SignalsPanel({ onShowOffer }: { onShowOffer: (offer: OfferCard) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-[var(--rp-emerald)]" aria-hidden /> Señales activas
          </h3>
          <p className="text-[11px] text-muted-foreground">{ACTIVE_SIGNALS.length} señales detectadas en las últimas 24h</p>
        </div>
        <Badge variant="outline" className="text-[10px]">cooldown: 7 días</Badge>
      </div>
      <div className="space-y-2">
        {ACTIVE_SIGNALS.map((s) => {
          const meta = SIGNAL_META[s.type];
          const Icon = meta.icon;
          const hasOffer = !!s.offerId;
          const offer = OFFERS.find(o => o.id === s.offerId);
          return (
            <div key={s.id} className={cn("rounded-xl border p-3.5", hasOffer ? "border-border/60 rp-glass" : "border-border/40 bg-foreground/[0.02]")}>
              <div className="flex items-start gap-3">
                <div className="rounded-md p-1.5 bg-foreground/[0.06]">
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono", meta.cls)}>
                      <Icon className="h-2.5 w-2.5" aria-hidden /> {meta.label}
                    </span>
                    <span className="text-xs font-medium truncate">{s.tenant}</span>
                    <span className="text-[10px] text-muted-foreground font-mono ml-auto">{s.detectedAt}</span>
                  </div>
                  <p className="text-xs text-foreground/80 mt-1">{s.trigger}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono">
                      <span className="text-muted-foreground">score</span>
                      <span style={{ color: s.score >= 70 ? "var(--rp-emerald)" : s.score >= 40 ? "var(--rp-yellow)" : "var(--rp-red)" }}>{s.score}/100</span>
                    </div>
                    <div className="flex-1 h-1 rounded-full bg-foreground/[0.05] overflow-hidden max-w-32">
                      <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: s.score >= 70 ? "var(--rp-emerald)" : s.score >= 40 ? "var(--rp-yellow)" : "var(--rp-red)" }} />
                    </div>
                  </div>
                </div>
              </div>
              {hasOffer && offer && (
                <div className="mt-3 flex items-center justify-end gap-2">
                  <span className="text-[10px] text-muted-foreground">Oferta disponible:</span>
                  <Button size="sm" className="h-7 text-[11px] bg-[var(--rp-violet)] hover:bg-[var(--rp-violet)]/90 text-white" onClick={() => onShowOffer(offer)}>
                    <Sparkles className="h-3 w-3 mr-1" aria-hidden /> Ver oferta
                  </Button>
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
 * Contextual offer card
 * =======================================================*/
function ContextualOffer({ offer, onDismiss, onAccept }: {
  offer: OfferCard | null;
  onDismiss: () => void;
  onAccept: () => void;
}) {
  const { toast } = useToast();
  if (!offer) {
    return (
      <div className="rp-glass rounded-xl border border-border/60 p-6 text-center">
        <Sparkles className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" aria-hidden />
        <div className="text-sm font-medium">No hay oferta activa</div>
        <p className="text-[11px] text-muted-foreground mt-1 max-w-md mx-auto">
          Las ofertas contextuales se muestran una a la vez y respetan un cooldown de 7 días por tenant.
          Cuando una señal cumpla los criterios, aparecerá aquí.
        </p>
      </div>
    );
  }
  const color = TONE[offer.tone];
  return (
    <div className="rounded-xl border p-5 relative overflow-hidden" style={{ borderColor: `color-mix(in oklab, ${color} 40%, transparent)`, background: `linear-gradient(135deg, color-mix(in oklab, ${color} 8%, transparent), color-mix(in oklab, ${color} 2%, transparent))` }}>
      <button
        type="button"
        onClick={onDismiss}
        className="absolute top-3 right-3 rounded-md p-1 hover:bg-foreground/10 transition-colors"
        aria-label="Descartar oferta"
      >
        <X className="h-4 w-4 text-muted-foreground" aria-hidden />
      </button>
      <div className="flex items-center gap-2 mb-2">
        <div className="rounded-md p-1.5" style={{ background: `color-mix(in oklab, ${color} 20%, transparent)` }}>
          <Crown className="h-4 w-4" style={{ color }} aria-hidden />
        </div>
        <Badge variant="outline" className="text-[10px]" style={{ borderColor: `color-mix(in oklab, ${color} 40%, transparent)`, color }}>
          Oferta contextual
        </Badge>
      </div>
      <h3 className="text-base font-display font-medium">{offer.title}</h3>
      <p className="text-[11px] text-muted-foreground mt-1">Para: Mar &amp; Sol Resorts · detectado por uso elevado en multi-local</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <div className="rounded-md bg-foreground/[0.04] p-3">
          <div className="text-[10px] uppercase text-muted-foreground font-mono">Plan actual</div>
          <div className="text-lg font-display font-medium">149€<span className="text-[10px] text-muted-foreground font-mono">/mes</span></div>
          <div className="text-[10px] text-muted-foreground font-mono">Professional</div>
        </div>
        <div className="rounded-md p-3" style={{ background: `color-mix(in oklab, ${color} 12%, transparent)` }}>
          <div className="text-[10px] uppercase text-muted-foreground font-mono">Plan propuesto</div>
          <div className="text-lg font-display font-medium" style={{ color }}>{offer.monthlyPrice}€<span className="text-[10px] text-muted-foreground font-mono">/mes</span></div>
          <div className="text-[10px] font-mono" style={{ color }}>{offer.plan} · +{offer.delta}€/mes</div>
        </div>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-3">
        {offer.benefits.map((b) => (
          <li key={b} className="text-xs flex items-start gap-1.5">
            <Check className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color }} aria-hidden />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2 mt-4">
        <Button className="bg-[var(--rp-emerald)] text-[#062018] hover:bg-[var(--rp-emerald)]/90" onClick={onAccept}>
          <Rocket className="h-4 w-4 mr-1" aria-hidden /> {offer.cta}
        </Button>
        <Button variant="outline" onClick={() => toast({ title: "Recordatorio fijado", description: "Te avisaremos en 3 días." })}>
          <Clock className="h-4 w-4 mr-1" aria-hidden /> Recordar después
        </Button>
        <span className="ml-auto text-[10px] text-muted-foreground font-mono">
          <Clock className="h-3 w-3 inline mr-1" aria-hidden /> cooldown 7 días tras dismiss
        </span>
      </div>
    </div>
  );
}

/* =========================================================
 * History table
 * =======================================================*/
function HistoryTable() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium flex items-center gap-2">
            <History className="h-4 w-4 text-[var(--rp-emerald)]" aria-hidden /> Historial de señales (30 días)
          </h3>
          <p className="text-[11px] text-muted-foreground">{HISTORY.length} eventos registrados</p>
        </div>
        <Badge variant="outline" className="text-[10px]">audit log</Badge>
      </div>
      <div className="rp-glass rounded-xl border border-border/60 overflow-hidden">
        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full text-xs">
            <thead className="bg-foreground/[0.03] text-left text-muted-foreground">
              <tr className="border-b border-border/40">
                <th className="py-2 px-3 font-medium">Fecha</th>
                <th className="py-2 px-2 font-medium">Tenant</th>
                <th className="py-2 px-2 font-medium">Señal</th>
                <th className="py-2 px-2 font-medium">Oferta mostrada</th>
                <th className="py-2 px-2 font-medium">Outcome</th>
                <th className="py-2 px-2 font-medium text-right">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {HISTORY.map((h) => {
                const outcomeMeta = {
                  impresión: { cls: "border-[var(--rp-blue)]/40 bg-[var(--rp-blue)]/10 text-[var(--rp-blue)]", icon: Eye },
                  clic: { cls: "border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow)]", icon: MousePointerClick },
                  convertido: { cls: "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald)]", icon: Check },
                  dismissed: { cls: "border-zinc-500/40 bg-zinc-500/10 text-zinc-400", icon: X },
                }[h.outcome];
                const Icon = outcomeMeta.icon;
                return (
                  <tr key={h.id} className="border-b border-border/30 hover:bg-foreground/[0.02]">
                    <td className="py-2 px-3 font-mono text-[10px] text-muted-foreground">{h.date}</td>
                    <td className="py-2 px-2 font-medium">{h.tenant}</td>
                    <td className="py-2 px-2 text-muted-foreground">{h.signal}</td>
                    <td className="py-2 px-2">{h.offer}</td>
                    <td className="py-2 px-2">
                      <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono", outcomeMeta.cls)}>
                        <Icon className="h-2.5 w-2.5" aria-hidden /> {h.outcome}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right font-mono">
                      {h.revenue ? <span className="text-[var(--rp-emerald)]">+{euro(h.revenue)}</span> : <span className="text-muted-foreground">—</span>}
                    </td>
                  </tr>
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
 * Metrics
 * =======================================================*/
function MetricsPanel() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <Activity className="h-4 w-4 text-[var(--rp-emerald)]" aria-hidden /> Métricas del motor (30 días)
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {METRICS.map((m) => {
          const color = TONE[m.tone];
          const Icon = m.icon;
          return (
            <div key={m.label} className="rp-glass rounded-lg p-3 border border-border/60">
              <div className="flex items-center justify-between">
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono">{m.label}</div>
                <Icon className="h-3.5 w-3.5" style={{ color }} aria-hidden />
              </div>
              <div className="mt-1 text-lg font-display font-medium" style={{ color }}>{m.value}</div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                <TrendingUp className="h-2.5 w-2.5" style={{ color: m.dir === "up" ? "var(--rp-emerald)" : "var(--rp-red)" }} aria-hidden />
                {m.trend}
              </div>
            </div>
          );
        })}
      </div>
      {/* Funnel */}
      <div className="rp-glass rounded-xl border border-border/60 p-4">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-[var(--rp-violet)]" aria-hidden /> Funnel de conversión
        </h4>
        <div className="space-y-2">
          {[
            { label: "Impresiones", value: 1284, pct: 100, color: "var(--rp-blue)" },
            { label: "Clics", value: 312, pct: 24.3, color: "var(--rp-yellow)" },
            { label: "Conversión", value: 48, pct: 3.7, color: "var(--rp-emerald)" },
            { label: "Ingresos", value: 16380, pct: 100, color: "var(--rp-emerald)", isCurrency: true },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-2">
              <div className="w-28 truncate text-xs">{f.label}</div>
              <div className="flex-1 h-6 rounded-md bg-foreground/[0.04] overflow-hidden">
                <div
                  className="h-full rounded-md flex items-center px-2"
                  style={{ width: f.label === "Ingresos" ? "100%" : `${f.pct}%`, background: `linear-gradient(90deg, ${f.color}, color-mix(in oklab, ${f.color} 60%, transparent))` }}
                >
                  <span className="text-[10px] font-mono text-[#062018] font-medium">
                    {f.isCurrency ? euro(f.value) : f.value.toLocaleString("es-ES")}
                    {!f.isCurrency && f.label !== "Impresiones" && ` · ${f.pct.toFixed(1)}%`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Cooldown rules
 * =======================================================*/
function CooldownRules() {
  const { toast } = useToast();
  const [rules, setRules] = React.useState({
    cooldown7d: true,
    max1offerPerTenant: true,
    noOfferDuringChurn: true,
    noOfferDuringP1: true,
    suppressOnDismiss: true,
  });
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-[var(--rp-emerald)]" aria-hidden /> Reglas de cooldown
          </h3>
          <p className="text-[11px] text-muted-foreground">Evitan spam y protegen la experiencia del tenant.</p>
        </div>
        <Button size="sm" className="h-7 text-[11px] bg-[var(--rp-emerald)] text-[#062018] hover:bg-[var(--rp-emerald)]/90" onClick={() => toast({ title: "Reglas guardadas", description: "Aplicadas a todas las señales futuras." })}>
          <Check className="h-3.5 w-3.5 mr-1" aria-hidden /> Guardar
        </Button>
      </div>
      <div className="rp-glass rounded-xl border border-border/60 p-4 space-y-2">
        {[
          { key: "cooldown7d" as const, label: "Cooldown 7 días tras dismiss/convert", desc: "Tras cualquier interacción, no mostrar oferta al mismo tenant por 7 días." },
          { key: "max1offerPerTenant" as const, label: "Máximo 1 oferta activa por tenant", desc: "Solo una oferta contextual visible a la vez." },
          { key: "noOfferDuringChurn" as const, label: "No mostrar upgrade si churn_risk > 70", desc: "Si el tenant está en riesgo, priorizar retención antes que upsell." },
          { key: "noOfferDuringP1" as const, label: "Suprimir si hay ticket P1 abierto", desc: "No molestar al tenant mientras resolvemos una incidencia crítica." },
          { key: "suppressOnDismiss" as const, label: "Suprimir tipo de oferta si dismissed 3×", desc: "Tras 3 dismisses del mismo tipo, no mostrar esa oferta más durante 30 días." },
        ].map((r) => (
          <label key={r.key} className="flex items-start gap-3 rounded-md border border-border/50 px-3 py-2.5 cursor-pointer">
            <Switch
              checked={rules[r.key]}
              onCheckedChange={(v) => setRules(prev => ({ ...prev, [r.key]: v }))}
              aria-label={r.label}
            />
            <div className="flex-1">
              <div className="text-xs font-medium">{r.label}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{r.desc}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
 * How it works (4 steps)
 * =======================================================*/
function HowItWorks() {
  const steps = [
    { n: 1, title: "Detecta señal", desc: "Workers AI evalúa 14 features en tiempo real (uso, plan, tickets, MRR).", icon: Bot, color: "var(--rp-blue)" },
    { n: 2, title: "Scorea + filtra", desc: "Aplica reglas de cooldown y umbral mínimo (score ≥ 60) antes de mostrar.", icon: Activity, color: "var(--rp-yellow)" },
    { n: 3, title: "Muestra oferta contextual", desc: "Una sola oferta a la vez, renderizada en el panel del tenant (no intrusiva).", icon: Sparkles, color: "var(--rp-violet)" },
    { n: 4, title: "Mide outcome", desc: "Registra impresión, clic o dismiss. Calcula conversión y revenue atribuido.", icon: TrendingUp, color: "var(--rp-emerald)" },
  ];
  return (
    <div className="rp-glass rounded-xl border border-border/60 p-4">
      <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
        <Flame className="h-4 w-4 text-[var(--rp-emerald)]" aria-hidden /> Cómo funciona (4 pasos)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.n} className="relative rounded-md border border-border/50 p-3">
              {i < steps.length - 1 && <ChevronRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" aria-hidden />}
              <div className="flex items-center gap-2 mb-1.5">
                <div className="rounded-md p-1.5" style={{ background: `color-mix(in oklab, ${s.color} 18%, transparent)` }}>
                  <Icon className="h-4 w-4" style={{ color: s.color }} aria-hidden />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">PASO {s.n}</span>
              </div>
              <div className="text-xs font-medium">{s.title}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
 * Offer dialog
 * =======================================================*/
function OfferDialog({ offer, open, onOpenChange, onAccept }: {
  offer: OfferCard | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAccept: () => void;
}) {
  if (!offer) return null;
  const color = TONE[offer.tone];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-4 w-4" style={{ color }} aria-hidden /> {offer.title}
          </DialogTitle>
          <DialogDescription>Revisa los detalles antes de proceder.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-md p-3" style={{ background: `color-mix(in oklab, ${color} 8%, transparent)` }}>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-[10px] uppercase text-muted-foreground font-mono">Plan propuesto</div>
                <div className="text-xl font-display font-medium" style={{ color }}>{offer.monthlyPrice}€<span className="text-[10px] text-muted-foreground font-mono">/mes</span></div>
              </div>
              <Badge variant="outline" className="text-[10px]" style={{ borderColor: `color-mix(in oklab, ${color} 40%, transparent)`, color }}>
                {offer.plan}
              </Badge>
            </div>
          </div>
          <ul className="space-y-1">
            {offer.benefits.map((b) => (
              <li key={b} className="text-xs flex items-start gap-1.5">
                <Check className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color }} aria-hidden />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <div className="text-[11px] text-muted-foreground">
            Al aceptar, se te redirige al checkout de Stripe. Proration automático desde hoy. Cancelable en cualquier momento.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
          <Button className="bg-[var(--rp-emerald)] text-[#062018] hover:bg-[var(--rp-emerald)]/90" onClick={onAccept}>
            <Rocket className="h-4 w-4 mr-1" aria-hidden /> {offer.cta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Main view
 * =======================================================*/
export function UpgradeEngineView() {
  const { toast } = useToast();
  const [tab, setTab] = React.useState("signals");
  const [activeOffer, setActiveOffer] = React.useState<OfferCard | null>(OFFERS[0]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogOffer, setDialogOffer] = React.useState<OfferCard | null>(null);

  const showOfferDialog = (offer: OfferCard) => {
    setDialogOffer(offer);
    setDialogOpen(true);
  };

  const acceptOffer = () => {
    toast({ title: "Oferta aceptada (demo)", description: `Redirigiendo a Stripe · ${dialogOffer?.plan}` });
    setDialogOpen(false);
    setActiveOffer(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[var(--rp-emerald)]/15 p-2">
            <TrendingUp className="h-5 w-5 text-[var(--rp-emerald)]" aria-hidden />
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-medium tracking-tight">Upgrade Engine</h2>
            <p className="text-xs text-muted-foreground">Señales → oferta contextual → conversión. Con cooldowns y medición.</p>
          </div>
        </div>
        <Badge variant="outline" className="border-[var(--rp-emerald)]/40 text-[var(--rp-emerald)]">
          <Bell className="h-3 w-3 mr-1" aria-hidden /> {ACTIVE_SIGNALS.length} señales activas
        </Badge>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full justify-start overflow-x-auto rp-scroll-thin h-9">
          <TabsTrigger value="signals" className="text-xs"><Zap className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Señales</TabsTrigger>
          <TabsTrigger value="offer" className="text-xs"><Sparkles className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Oferta activa</TabsTrigger>
          <TabsTrigger value="history" className="text-xs"><History className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Historial</TabsTrigger>
          <TabsTrigger value="metrics" className="text-xs"><Activity className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Métricas</TabsTrigger>
          <TabsTrigger value="rules" className="text-xs"><Settings2 className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Reglas</TabsTrigger>
          <TabsTrigger value="how" className="text-xs"><Flame className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Cómo funciona</TabsTrigger>
        </TabsList>

        <TabsContent value="signals" className="mt-4">
          <SignalsPanel onShowOffer={showOfferDialog} />
        </TabsContent>

        <TabsContent value="offer" className="mt-4">
          <ContextualOffer
            offer={activeOffer}
            onDismiss={() => { setActiveOffer(null); toast({ title: "Oferta descartada", description: "Cooldown 7 días aplicado." }); }}
            onAccept={() => activeOffer && showOfferDialog(activeOffer)}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <HistoryTable />
        </TabsContent>

        <TabsContent value="metrics" className="mt-4">
          <MetricsPanel />
        </TabsContent>

        <TabsContent value="rules" className="mt-4">
          <CooldownRules />
        </TabsContent>

        <TabsContent value="how" className="mt-4">
          <HowItWorks />
        </TabsContent>
      </Tabs>

      <OfferDialog offer={dialogOffer} open={dialogOpen} onOpenChange={setDialogOpen} onAccept={acceptOffer} />
    </div>
  );
}

export default UpgradeEngineView;
