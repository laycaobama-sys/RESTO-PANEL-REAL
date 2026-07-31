"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Wallet, TrendingUp, TrendingDown, DollarSign, Cpu, Database, HardDrive,
  Layers, Workflow, Brain, Mail, CreditCard, Headphones, ArrowUpDown,
  Sparkles, Lightbulb, ChevronDown, ChevronRight, PieChart, BarChart3,
  Target, Gauge, Crown, Coins, Percent, ArrowRight, ServerCog, Box, Cloud,
  AlertTriangle, CalendarClock,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

/* ============================================================
   Types & demo data
============================================================ */

interface OrgRow {
  name: string;
  plan: "Starter" | "Professional" | "Enterprise";
  restaurants: number;
  revenue: number;   // €/mes
  cost: number;      // €/mes
  status: "active" | "trial" | "at-risk";
}

const ORGS: OrgRow[] = [
  { name: "Ramses Group",       plan: "Enterprise",    restaurants: 12, revenue: 9840, cost: 1968, status: "active" },
  { name: "Sakura Hospitality", plan: "Enterprise",    restaurants: 8,  revenue: 7220, cost: 1560, status: "active" },
  { name: "Grupo La Tabla",     plan: "Professional",  restaurants: 5,  revenue: 4180, cost: 1216, status: "active" },
  { name: "Bodega 1898",        plan: "Professional",  restaurants: 3,  revenue: 2640, cost: 824,  status: "active" },
  { name: "Mediterráneo S.L.",  plan: "Professional",  restaurants: 4,  revenue: 3120, cost: 948,  status: "active" },
  { name: "Tacos Urbanos",       plan: "Starter",       restaurants: 2,  revenue: 1080, cost: 412,  status: "active" },
  { name: "Pasta & Vino",        plan: "Starter",       restaurants: 1,  revenue: 540,  cost: 268,  status: "trial" },
  { name: "Brunch Bar Co.",       plan: "Professional",  restaurants: 3,  revenue: 2340, cost: 792,  status: "active" },
  { name: "Nori Group",          plan: "Enterprise",    restaurants: 6,  revenue: 5780, cost: 1316, status: "active" },
  { name: "Café Aurora",         plan: "Starter",       restaurants: 2,  revenue: 920,  cost: 446,  status: "at-risk" },
];

interface CfServiceCost {
  service: string;
  usage: string;
  monthlyCost: number; // €
  costPerUnit: string;
  trend: number; // %, negative = down
  suggestion?: string;
  savings?: number; // €/mes
}

const CF_SERVICES: CfServiceCost[] = [
  { service: "Workers",            usage: "2.4M req/día",      monthlyCost: 1240, costPerUnit: "€0.51/M req", trend: 4.2 },
  { service: "D1",                  usage: "412MB · 890k reads/día", monthlyCost: 380,  costPerUnit: "€0.43/M reads", trend: 2.8, suggestion: "Añadir cache KV para queries read-heavy. Reduciría reads 30%.", savings: 114 },
  { service: "R2",                  usage: "8.2GB almacenados",  monthlyCost: 62,   costPerUnit: "€7.5/GB",      trend: 1.4, suggestion: "Mover 2.1GB de exports >90d a tier más barato.", savings: 18 },
  { service: "KV",                  usage: "1.2M ops/día",      monthlyCost: 95,   costPerUnit: "€2.4/M ops",   trend: 3.1 },
  { service: "Queues",              usage: "89 msg/s",          monthlyCost: 125,  costPerUnit: "€0.48/M msg",  trend: 0.6, suggestion: "3 colas <5 msg/s — consolidar.", savings: 31 },
  { service: "Durable Objects",     usage: "47 active",          monthlyCost: 89,   costPerUnit: "€1.89/DO",     trend: -2.1 },
  { service: "AI Gateway",           usage: "1.847 req/día",     monthlyCost: 842,  costPerUnit: "€0.46/req",    trend: 8.4, suggestion: "15% peticiones Llama-3.1-8b → migrar a Llama-3.2-3b.", savings: 126 },
  { service: "Vectorize",           usage: "12.400 embeddings", monthlyCost: 18,   costPerUnit: "€1.5/100k emb", trend: 0.9 },
  { service: "Browser Rendering",    usage: "47 screenshots",    monthlyCost: 23,   costPerUnit: "€0.49/screenshot", trend: -1.2 },
  { service: "Turnstile",           usage: "4.2k challenges",   monthlyCost: 0,    costPerUnit: "Free",         trend: 0 },
  { service: "WAF",                 usage: "incluido",          monthlyCost: 0,    costPerUnit: "Free",         trend: 0 },
];

interface OptimizationTip {
  title: string;
  description: string;
  savings: number;
  icon: React.ElementType;
}

const OPTIMIZATIONS: OptimizationTip[] = [
  { title: "Cache KV para D1 reads",     description: "Reducir D1 reads 30% cacheando queries read-heavy en KV.", savings: 114, icon: Database },
  { title: "Model routing de IA",         description: "Migrar 15% de peticiones Llama-3.1-8b a Llama-3.2-3b (más rápido y barato).", savings: 126, icon: Brain },
  { title: "Storage tier para R2",       description: "Mover 2.1GB de exports >90 días a tier de almacenamiento frío.", savings: 18, icon: HardDrive },
  { title: "Consolidar colas Queues",    description: "3 colas con <5 msg/s de throughput — consolidar para reducir overhead.", savings: 31, icon: Workflow },
];

interface AiModelCost {
  model: string;
  cost: number;
}

const AI_MODEL_COSTS: AiModelCost[] = [
  { model: "Llama-3.1-8b",       cost: 420 },
  { model: "Llama-3.2-3b",       cost: 180 },
  { model: "BGE embeddings",      cost: 18 },
  { model: "Fallback (no AI)",    cost: 0 },
];

const AI_MODULE_DIST = [
  { module: "Reservas",   pct: 28 },
  { module: "CRM",        pct: 22 },
  { module: "Reseñas",    pct: 18 },
  { module: "Marketing",  pct: 14 },
  { module: "Menú",       pct: 10 },
  { module: "Analytics",  pct: 8 },
];

const AI_TOP_ORGS = [
  { name: "Ramses Group",       cost: 218, reqs: 612, tokens: "1.8M" },
  { name: "Sakura Hospitality", cost: 174, reqs: 488, tokens: "1.4M" },
  { name: "Grupo La Tabla",     cost: 96,  reqs: 280, tokens: "840k" },
  { name: "Nori Group",          cost: 84,  reqs: 240, tokens: "720k" },
  { name: "Bodega 1898",        cost: 68,  reqs: 198, tokens: "590k" },
];

interface MarginByPlan {
  plan: string;
  marginPct: number;
  costPerCustomer: number;
  profitPerCustomer: number;
  customers: number;
}

const MARGIN_BY_PLAN: MarginByPlan[] = [
  { plan: "Starter",      marginPct: 65, costPerCustomer: 17, profitPerCustomer: 32, customers: 42 },
  { plan: "Professional", marginPct: 75, costPerCustomer: 28, profitPerCustomer: 71, customers: 24 },
  { plan: "Enterprise",   marginPct: 82, costPerCustomer: 89, profitPerCustomer: 160, customers: 9 },
];

interface SlaMarginHistory {
  month: string;
  gross: number;
  net: number;
}

const MARGIN_HISTORY: SlaMarginHistory[] = [
  { month: "Ago", gross: 68, net: 54 },
  { month: "Sep", gross: 69, net: 55 },
  { month: "Oct", gross: 70, net: 56 },
  { month: "Nov", gross: 71, net: 57 },
  { month: "Dic", gross: 71, net: 57 },
  { month: "Ene", gross: 72, net: 58 },
];

/* ============================================================
   Main component
============================================================ */

type FinopsTab = "resumen" | "orgs" | "cloudflare" | "ia" | "margenes";

const TABS: { id: FinopsTab; label: string; icon: React.ElementType }[] = [
  { id: "resumen",   label: "Resumen",          icon: Wallet },
  { id: "orgs",       label: "Por Organización", icon: ServerCog },
  { id: "cloudflare", label: "Cloudflare",       icon: Cloud },
  { id: "ia",         label: "IA",               icon: Brain },
  { id: "margenes",   label: "Márgenes",          icon: Percent },
];

export function CloudOpsFinOps() {
  const reduceMotion = useReducedMotion();
  const [tab, setTab] = React.useState<FinopsTab>("resumen");

  return (
    <div className="flex flex-col gap-5">
      <Header />
      <Tabs tab={tab} setTab={setTab} />
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "resumen"   && <ResumenTab />}
          {tab === "orgs"       && <OrgsTab />}
          {tab === "cloudflare" && <CloudflareTab />}
          {tab === "ia"         && <IaTab />}
          {tab === "margenes"   && <MargenesTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   Header & Tabs
============================================================ */

function Header() {
  return (
    <header className="flex items-start justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[var(--teal)] to-[var(--teal-deep)] flex items-center justify-center text-black ring-1 ring-[var(--teal)]/40 shrink-0">
          <Wallet className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-xl sm:text-2xl font-medium tracking-tight truncate">
              FinOps
            </h1>
            <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-amber-400/40 bg-amber-400/10 text-amber-300">
              demo
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cost tracking & optimization · Cloudflare + IA · Margen bruto 72%
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5">
        <TrendingUp className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
        <span className="text-xs font-mono text-emerald-300">+€289 ahorro potencial</span>
      </div>
    </header>
  );
}

function Tabs({ tab, setTab }: { tab: FinopsTab; setTab: (t: FinopsTab) => void }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto rp-scroll-thin -mx-1 px-1">
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          className={cn(
            "shrink-0 min-h-[44px] inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors",
            tab === t.id
              ? "border-[var(--gold)]/50 bg-[var(--gold)]/15 text-[var(--gold-soft)]"
              : "border-border/60 bg-foreground/[0.02] text-muted-foreground hover:text-foreground hover:border-foreground/30"
          )}
          aria-pressed={tab === t.id}
        >
          <t.icon className="h-4 w-4" aria-hidden />
          <span className="font-medium">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   Tab: Resumen
============================================================ */

function ResumenTab() {
  return (
    <div className="flex flex-col gap-5">
      <CostKpis />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <CostTrendChart />
        </div>
        <CostBreakdownDonut />
      </div>
      <RevenueVsCostChart />
    </div>
  );
}

const COST_KPIS = [
  { label: "Coste total hoy",        value: "€1.842", sub: "vs ayer +3.2%",         icon: Wallet,        accent: "gold" as const },
  { label: "Coste mes",              value: "€42.580", sub: "Presupuesto €48k",     icon: CalendarClock, accent: "fg" as const },
  { label: "Ingresos mes",          value: "€48.250", sub: "+12% MoM",              icon: TrendingUp,     accent: "teal" as const },
  { label: "Margen bruto",          value: "72%",     sub: "€34.670",              icon: Percent,        accent: "gold" as const },
  { label: "Coste por restaurante",  value: "€0.52/día", sub: "75 restaurantes activos", icon: ServerCog,  accent: "teal" as const },
  { label: "Coste IA mes",          value: "€842",   sub: "2% del coste total",   icon: Brain,          accent: "gold" as const },
  { label: "Coste Workers mes",      value: "€1.240", sub: "29% del coste total",  icon: Cpu,            accent: "fg" as const },
  { label: "Margen neto",            value: "58%",     sub: "€27.990",              icon: Target,         accent: "teal" as const },
];

function CostKpis() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {COST_KPIS.map((k) => (
        <KpiCard key={k.label} {...k} />
      ))}
    </div>
  );
}

function KpiCard({ label, value, sub, icon: Icon, accent }: {
  label: string; value: string; sub: string; icon: React.ElementType; accent: "gold" | "teal" | "fg";
}) {
  const color = accent === "gold" ? "var(--gold)" : accent === "teal" ? "var(--teal)" : "var(--foreground)";
  return (
    <div className="rp-glass rounded-xl p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
        <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} aria-hidden />
      </div>
      <div className="mt-2 font-display text-2xl font-light" style={{ color }}>
        {value}
      </div>
      {sub && <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

/* Cost trend (30d area+line) */
function CostTrendChart() {
  const data = React.useMemo(() => {
    // deterministic pseudo-random walk around €1.4k–€2.2k per day
    const out: number[] = [];
    let v = 1620;
    for (let i = 0; i < 30; i++) {
      v += Math.sin(i / 4) * 60 + (i % 5 === 0 ? -40 : 12);
      v = Math.max(1380, Math.min(2180, v));
      out.push(Math.round(v));
    }
    return out;
  }, []);
  const W = 640, H = 220, pad = 28;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const step = (W - pad * 2) / (data.length - 1);
  const pts = data.map((v, i) => [pad + i * step, H - pad - ((v - min) / range) * (H - pad * 2)] as const);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${path} L ${pts[pts.length - 1][0].toFixed(1)} ${H - pad} L ${pad} ${H - pad} Z`;
  const total = data.reduce((s, v) => s + v, 0);

  return (
    <div className="rp-glass rounded-2xl p-5 h-full">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--gold)]" aria-hidden />
          <h3 className="font-display text-base sm:text-lg font-medium">Tendencia de coste (30 días)</h3>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Total mes</div>
          <div className="font-display text-lg font-light rp-gold-text">€{total.toLocaleString("es-ES")}</div>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Tendencia de coste últimos 30 días">
        <defs>
          <linearGradient id="rp-fo-trend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.36" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((t) => (
          <line key={t} x1={pad} x2={W - pad} y1={pad + t * (H - pad * 2)} y2={pad + t * (H - pad * 2)}
                stroke="color-mix(in oklab, var(--foreground) 8%, transparent)" strokeWidth="1" />
        ))}
        <path d={area} fill="url(#rp-fo-trend)" />
        <path d={path} fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.5" fill="#D4AF37" />
        <text x={pad} y={H - 6} className="fill-muted-foreground font-mono" fontSize="9">hace 30d</text>
        <text x={W - pad} y={H - 6} textAnchor="end" className="fill-muted-foreground font-mono" fontSize="9">hoy</text>
      </svg>
    </div>
  );
}

/* Cost breakdown donut */
const BREAKDOWN = [
  { label: "Workers",        pct: 35, color: "#D4AF37" },
  { label: "D1",            pct: 12, color: "#3DD6C9" },
  { label: "R2",            pct: 8,  color: "#E8C766" },
  { label: "KV",            pct: 3,  color: "#2BA89E" },
  { label: "Queues",        pct: 5,  color: "#C9A961" },
  { label: "AI",            pct: 15, color: "#F4DC8C" },
  { label: "Email/WhatsApp", pct: 8,  color: "#7AD3C8" },
  { label: "Stripe fees",   pct: 6,  color: "#B8964F" },
  { label: "Support",       pct: 8,  color: "#4A9C92" },
];

function CostBreakdownDonut() {
  const total = 100;
  const W = 220, H = 220, R = 80, r = 52, cx = W / 2, cy = H / 2;
  // Build segments via reduce so we never mutate a captured let variable.
  const segments = React.useMemo(
    () =>
      BREAKDOWN.reduce<{ acc: number; out: { label: string; pct: number; color: string; d: string }[] }>(
        ({ acc, out }, b) => {
          const start = acc / total;
          const next = acc + b.pct;
          const end = next / total;
          const a0 = start * Math.PI * 2 - Math.PI / 2;
          const a1 = end * Math.PI * 2 - Math.PI / 2;
          const large = a1 - a0 > Math.PI ? 1 : 0;
          const x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0);
          const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
          const xi1 = cx + r * Math.cos(a1), yi1 = cy + r * Math.sin(a1);
          const xi0 = cx + r * Math.cos(a0), yi0 = cy + r * Math.sin(a0);
          const d = `M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} L ${xi1} ${yi1} A ${r} ${r} 0 ${large} 0 ${xi0} ${yi0} Z`;
          return { acc: next, out: [...out, { ...b, d }] };
        },
        { acc: 0, out: [] }
      ).out,
    [cx, cy]
  );

  return (
    <div className="rp-glass rounded-2xl p-5 h-full">
      <div className="flex items-center gap-2 mb-3">
        <PieChart className="h-4 w-4 text-[var(--teal)]" aria-hidden />
        <h3 className="font-display text-base sm:text-lg font-medium">Desglose de coste</h3>
      </div>
      <div className="flex items-center gap-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-32 h-32 sm:w-36 sm:h-36 shrink-0" role="img" aria-label="Desglose de coste por servicio">
          {segments.map((s) => (
            <path key={s.label} d={s.d} fill={s.color} stroke="#0a0a0d" strokeWidth="1" opacity="0.92" />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-muted-foreground font-mono" fontSize="9">TOTAL MES</text>
          <text x={cx} y={cy + 14} textAnchor="middle" className="fill-foreground" fontSize="14" fontWeight="500">€42.5k</text>
        </svg>
        <ul className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 min-w-0">
          {BREAKDOWN.map((b) => (
            <li key={b.label} className="flex items-center justify-between gap-2 text-[11px]">
              <span className="flex items-center gap-1.5 min-w-0">
                <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: b.color }} />
                <span className="text-muted-foreground truncate">{b.label}</span>
              </span>
              <span className="font-mono text-foreground/85">{b.pct}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* Revenue vs Cost (6m dual-line + margin area) */
function RevenueVsCostChart() {
  const months = ["Ago", "Sep", "Oct", "Nov", "Dic", "Ene"];
  const revenue = [38200, 41200, 43800, 45600, 47000, 48250];
  const cost =    [29800, 31600, 32900, 34100, 35800, 42580];

  const W = 640, H = 240, pad = 32;
  const max = Math.max(...revenue, ...cost) * 1.05;
  const step = (W - pad * 2) / (months.length - 1);
  const toPts = (arr: number[]) => arr.map((v, i) => [pad + i * step, H - pad - (v / max) * (H - pad * 2)] as const);
  const rPts = toPts(revenue), cPts = toPts(cost);
  const toPath = (pts: readonly (readonly [number, number])[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");

  // margin area between rev and cost
  const areaPath =
    `${toPath(rPts)} ` +
    cPts.slice().reverse().map((p) => `L ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ") + " Z";

  return (
    <div className="rp-glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-[var(--gold)]" aria-hidden />
          <h3 className="font-display text-base sm:text-lg font-medium">Ingresos vs Coste (6 meses)</h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider">
          <span className="inline-flex items-center gap-1.5 text-[var(--gold)]">
            <span className="h-1.5 w-3 rounded-full bg-[var(--gold)]" /> Ingresos
          </span>
          <span className="inline-flex items-center gap-1.5 text-destructive">
            <span className="h-1.5 w-3 rounded-full bg-destructive" /> Coste
          </span>
          <span className="inline-flex items-center gap-1.5 text-[var(--teal)]">
            <span className="h-1.5 w-3 rounded-full bg-[var(--teal)]" /> Margen
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Ingresos vs coste últimos 6 meses">
        <defs>
          <linearGradient id="rp-fo-margin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3DD6C9" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3DD6C9" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((t) => (
          <line key={t} x1={pad} x2={W - pad} y1={pad + t * (H - pad * 2)} y2={pad + t * (H - pad * 2)}
                stroke="color-mix(in oklab, var(--foreground) 8%, transparent)" strokeWidth="1" />
        ))}
        <path d={areaPath} fill="url(#rp-fo-margin)" />
        <path d={toPath(cPts)} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <path d={toPath(rPts)} fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {months.map((m, i) => (
          <text key={m} x={pad + i * step} y={H - 8} textAnchor="middle" className="fill-muted-foreground font-mono" fontSize="9">{m}</text>
        ))}
      </svg>
    </div>
  );
}

/* ============================================================
   Tab: Por Organización
============================================================ */

function OrgsTab() {
  const [sort, setSort] = React.useState<"cost" | "margin" | "revenue">("cost");
  const [openDialog, setOpenDialog] = React.useState<OrgRow | null>(null);

  const sorted = React.useMemo(() => {
    const arr = [...ORGS];
    arr.sort((a, b) => {
      if (sort === "cost") return b.cost - a.cost;
      if (sort === "revenue") return b.revenue - a.revenue;
      const ma = (a.revenue - a.cost) / a.revenue;
      const mb = (b.revenue - b.cost) / b.revenue;
      return mb - ma;
    });
    return arr;
  }, [sort]);

  const outliers = ORGS.filter((o) => (o.revenue - o.cost) / o.revenue < 0.4);
  const maxCost = Math.max(...ORGS.map((o) => o.cost));

  return (
    <div className="flex flex-col gap-5">
      <div className="rp-glass rounded-2xl p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ServerCog className="h-4 w-4 text-[var(--gold)]" aria-hidden />
            <h3 className="font-display text-base sm:text-lg font-medium">Coste por organización</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mr-1">Ordenar:</span>
            {(["cost", "margin", "revenue"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={cn(
                  "min-h-[32px] inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] transition-colors capitalize",
                  sort === s
                    ? "border-[var(--gold)]/50 bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                    : "border-border/60 bg-foreground/[0.02] text-muted-foreground hover:text-foreground"
                )}
              >
                {s === "cost" ? "Coste" : s === "margin" ? "Margen" : "Ingresos"}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto rp-scroll-thin -mx-2">
          <table className="w-full border-collapse text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-border/60">
                {["Organización", "Plan", "Restaurantes", "Ingresos mes", "Coste mes", "Margen", "Coste/rest.", "Estado", ""].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((o) => {
                const marginPct = Math.round(((o.revenue - o.cost) / o.revenue) * 1000) / 10;
                const marginColor = marginPct >= 60 ? "#3DD6C9" : marginPct >= 40 ? "#E8C766" : "#ef4444";
                const cpr = Math.round((o.cost / o.restaurants / 30) * 100) / 100;
                return (
                  <tr key={o.name} className="border-b border-border/40 last:border-0 hover:bg-foreground/[0.025] transition-colors">
                    <td className="px-3 py-3 font-medium">{o.name}</td>
                    <td className="px-3 py-3">
                      <PlanBadge plan={o.plan} />
                    </td>
                    <td className="px-3 py-3 font-mono text-muted-foreground">{o.restaurants}</td>
                    <td className="px-3 py-3 font-mono">€{o.revenue.toLocaleString("es-ES")}</td>
                    <td className="px-3 py-3 font-mono rp-gold-text">€{o.cost.toLocaleString("es-ES")}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5 font-mono" style={{ color: marginColor }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: marginColor }} />
                        {marginPct}%
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-muted-foreground">€{cpr}/d</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => setOpenDialog(o)}
                        className="min-h-[32px] inline-flex items-center gap-1 rounded-md border border-border/60 bg-foreground/[0.02] px-2.5 py-1 text-[11px] hover:bg-foreground/5 hover:border-[var(--gold)]/40 transition-colors whitespace-nowrap"
                      >
                        Ver detalle
                        <ChevronRight className="h-3 w-3" aria-hidden />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost distribution bar chart */}
      <div className="rp-glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-[var(--teal)]" aria-hidden />
          <h3 className="font-display text-base sm:text-lg font-medium">Distribución de coste (top 10 orgs)</h3>
        </div>
        <div className="space-y-2">
          {ORGS.slice().sort((a, b) => b.cost - a.cost).map((o) => {
            const pct = Math.round((o.cost / maxCost) * 100);
            return (
              <div key={o.name} className="flex items-center gap-3">
                <div className="w-36 sm:w-48 truncate text-xs text-muted-foreground">{o.name}</div>
                <div className="flex-1 h-5 rounded-md bg-foreground/[0.03] overflow-hidden">
                  <motion.div
                    className="h-full rounded-md bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="w-20 text-right font-mono text-xs rp-gold-text">€{o.cost}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Margin outliers */}
      {outliers.length > 0 && (
        <div className="rp-glass rounded-2xl p-5 border-l-2 border-amber-400/40">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-300 mt-0.5 shrink-0" aria-hidden />
            <div>
              <div className="text-sm font-medium text-amber-300">
                {outliers.length} organizaciones con margen &lt;40%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {outliers.map((o) => o.name).join(", ")} — revisar plan o uso excesivo de IA.
              </p>
            </div>
          </div>
        </div>
      )}

      <OrgDetailDialog org={openDialog} onClose={() => setOpenDialog(null)} />
    </div>
  );
}

function PlanBadge({ plan }: { plan: OrgRow["plan"] }) {
  const color = plan === "Enterprise" ? "var(--gold)" : plan === "Professional" ? "var(--teal)" : "var(--foreground)";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider"
      style={{ color, borderColor: `${color}55`, background: `${color}15` }}
    >
      {plan}
    </span>
  );
}

function StatusBadge({ status }: { status: OrgRow["status"] }) {
  const map = {
    active:   { label: "Activa",    color: "#3DD6C9" },
    trial:    { label: "Trial",     color: "#E8C766" },
    "at-risk":{ label: "En riesgo", color: "#ef4444" },
  } as const;
  const s = map[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono" style={{ color: s.color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

function OrgDetailDialog({ org, onClose }: { org: OrgRow | null; onClose: () => void }) {
  return (
    <Dialog open={!!org} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl rp-glass-strong">
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <ServerCog className="h-4 w-4 text-[var(--gold)]" aria-hidden />
            {org?.name ?? "—"}
          </DialogTitle>
          <DialogDescription>Desglose de coste por servicio</DialogDescription>
        </DialogHeader>
        {org && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <MiniStat label="Ingresos/mes" value={`€${org.revenue.toLocaleString("es-ES")}`} />
              <MiniStat label="Coste/mes" value={`€${org.cost.toLocaleString("es-ES")}`} />
              <MiniStat label="Margen" value={`${Math.round(((org.revenue - org.cost) / org.revenue) * 100)}%`} />
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Desglose por servicio</div>
            <div className="space-y-1.5">
              {[
                { svc: "Workers", cost: Math.round(org.cost * 0.35) },
                { svc: "D1",      cost: Math.round(org.cost * 0.12) },
                { svc: "R2",      cost: Math.round(org.cost * 0.08) },
                { svc: "KV",      cost: Math.round(org.cost * 0.03) },
                { svc: "Queues",  cost: Math.round(org.cost * 0.05) },
                { svc: "AI",      cost: Math.round(org.cost * 0.15) },
                { svc: "Email/WA",cost: Math.round(org.cost * 0.08) },
                { svc: "Stripe",  cost: Math.round(org.cost * 0.06) },
                { svc: "Support", cost: Math.round(org.cost * 0.08) },
              ].map((r) => {
                const pct = Math.round((r.cost / org.cost) * 100);
                return (
                  <div key={r.svc} className="flex items-center gap-3">
                    <div className="w-20 text-xs text-muted-foreground">{r.svc}</div>
                    <div className="flex-1 h-2 rounded-full bg-foreground/[0.05] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)]" style={{ width: `${pct * 2}%` }} />
                    </div>
                    <div className="w-16 text-right font-mono text-xs">€{r.cost} <span className="text-muted-foreground">· {pct}%</span></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-foreground/[0.03] border border-border/40 p-2">
      <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium">{value}</div>
    </div>
  );
}

/* ============================================================
   Tab: Cloudflare
============================================================ */

function CloudflareTab() {
  const totalSavings = OPTIMIZATIONS.reduce((s, o) => s + o.savings, 0);
  const totalPct = Math.round((totalSavings / 42580) * 1000) / 10;

  return (
    <div className="flex flex-col gap-5">
      <div className="rp-glass rounded-2xl p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4 text-[var(--teal)]" aria-hidden />
            <h3 className="font-display text-base sm:text-lg font-medium">Costes por servicio Cloudflare</h3>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Coste total Cloudflare</div>
            <div className="font-display text-lg font-light rp-teal-text">€2.874/mes</div>
          </div>
        </div>
        <div className="overflow-x-auto rp-scroll-thin -mx-2">
          <table className="w-full border-collapse text-sm min-w-[820px]">
            <thead>
              <tr className="border-b border-border/60">
                {["Servicio", "Uso", "Coste/mes", "Coste unitario", "Tendencia", "Optimización"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CF_SERVICES.map((s) => (
                <tr key={s.service} className="border-b border-border/40 last:border-0 hover:bg-foreground/[0.025] transition-colors align-top">
                  <td className="px-3 py-3 font-medium">{s.service}</td>
                  <td className="px-3 py-3 text-muted-foreground font-mono text-xs">{s.usage}</td>
                  <td className="px-3 py-3 font-mono rp-gold-text">€{s.monthlyCost}/mes</td>
                  <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{s.costPerUnit}</td>
                  <td className="px-3 py-3">
                    <TrendBadge pct={s.trend} />
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground max-w-[280px]">
                    {s.suggestion ? (
                      <div className="flex items-start gap-1.5">
                        <Lightbulb className="h-3 w-3 text-amber-300 mt-0.5 shrink-0" aria-hidden />
                        <span>{s.suggestion} <span className="text-emerald-300 font-mono">−€{s.savings}/mes</span></span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/60">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Optimization suggestions */}
      <div className="rp-glass rounded-2xl p-5 rp-glow-gold">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--gold)]" aria-hidden />
            <h3 className="font-display text-base sm:text-lg font-medium">Sugerencias de optimización (IA)</h3>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Ahorro potencial</div>
            <div className="font-display text-lg font-light text-emerald-300">€{totalSavings}/mes · {totalPct}%</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {OPTIMIZATIONS.map((o) => (
            <div key={o.title} className="rounded-xl border border-border/40 bg-foreground/[0.02] p-3.5">
              <div className="flex items-start gap-2.5">
                <div className="h-7 w-7 rounded-md bg-[var(--gold)]/15 flex items-center justify-center shrink-0">
                  <o.icon className="h-3.5 w-3.5 text-[var(--gold)]" aria-hidden />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-medium">{o.title}</h4>
                    <span className="text-xs font-mono text-emerald-300 shrink-0">−€{o.savings}/mes</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{o.description}</p>
                  <button
                    onClick={() => toast("Optimización aplicada (demo)", { description: `${o.title} · −€${o.savings}/mes estimados` })}
                    className="mt-2 min-h-[32px] inline-flex items-center gap-1 rounded-md border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-2.5 py-1 text-[11px] text-[var(--gold-soft)] hover:bg-[var(--gold)]/15 transition-colors"
                  >
                    Aplicar
                    <ArrowRight className="h-3 w-3" aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrendBadge({ pct }: { pct: number }) {
  const isDown = pct < 0;
  const isFlat = pct === 0;
  const color = isFlat ? "text-muted-foreground" : isDown ? "text-emerald-300" : "text-amber-300";
  const Icon = isFlat ? ArrowUpDown : isDown ? TrendingDown : TrendingUp;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-mono", color)}>
      <Icon className="h-3 w-3" aria-hidden />
      {isFlat ? "0%" : `${isDown ? "−" : "+"}${Math.abs(pct)}%`}
    </span>
  );
}

/* ============================================================
   Tab: IA
============================================================ */

function IaTab() {
  const totalAi = AI_MODEL_COSTS.reduce((s, m) => s + m.cost, 0);
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Model costs */}
        <div className="rp-glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-4 w-4 text-[var(--gold)]" aria-hidden />
            <h3 className="font-display text-base sm:text-lg font-medium">Coste por modelo</h3>
          </div>
          <div className="space-y-2">
            {AI_MODEL_COSTS.map((m) => {
              const pct = totalAi > 0 ? Math.round((m.cost / totalAi) * 100) : 0;
              return (
                <div key={m.model} className="flex items-center gap-3">
                  <div className="w-32 text-xs text-muted-foreground truncate">{m.model}</div>
                  <div className="flex-1 h-3 rounded-full bg-foreground/[0.05] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="w-20 text-right font-mono text-xs">€{m.cost} <span className="text-muted-foreground">· {pct}%</span></div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Total IA/mes</span>
            <span className="font-display text-lg font-light rp-gold-text">€{totalAi}</span>
          </div>
        </div>

        {/* Module distribution */}
        <div className="rp-glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Box className="h-4 w-4 text-[var(--teal)]" aria-hidden />
            <h3 className="font-display text-base sm:text-lg font-medium">Distribución por módulo</h3>
          </div>
          <div className="space-y-2">
            {AI_MODULE_DIST.map((m) => (
              <div key={m.module} className="flex items-center gap-3">
                <div className="w-24 text-xs text-muted-foreground">{m.module}</div>
                <div className="flex-1 h-3 rounded-full bg-foreground/[0.05] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--teal)] to-[var(--teal-deep)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${m.pct * 3}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="w-12 text-right font-mono text-xs">{m.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI cost trend */}
      <AiCostTrend />

      {/* AI cost per organization */}
      <div className="rp-glass rounded-2xl p-5 overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <Coins className="h-4 w-4 text-[var(--gold)]" aria-hidden />
          <h3 className="font-display text-base sm:text-lg font-medium">Coste IA por organización (top 5)</h3>
        </div>
        <div className="overflow-x-auto rp-scroll-thin -mx-2">
          <table className="w-full border-collapse text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border/60">
                {["Organización", "Requests mes", "Tokens", "Coste mes", "Coste/request"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AI_TOP_ORGS.map((o) => (
                <tr key={o.name} className="border-b border-border/40 last:border-0 hover:bg-foreground/[0.025] transition-colors">
                  <td className="px-3 py-3 font-medium">{o.name}</td>
                  <td className="px-3 py-3 font-mono text-muted-foreground">{o.reqs.toLocaleString("es-ES")}</td>
                  <td className="px-3 py-3 font-mono text-muted-foreground">{o.tokens}</td>
                  <td className="px-3 py-3 font-mono rp-gold-text">€{o.cost}</td>
                  <td className="px-3 py-3 font-mono text-muted-foreground">€{(o.cost / o.reqs * 1000).toFixed(2)}/k req</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost optimization */}
      <div className="rp-glass rounded-2xl p-5 border-l-2 border-[var(--gold)]/40">
        <div className="flex items-start gap-3">
          <Sparkles className="h-4 w-4 text-[var(--gold)] mt-0.5 shrink-0" aria-hidden />
          <div>
            <div className="text-sm font-medium">Optimización de coste IA</div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Auto-routing a modelo más barato para queries de baja complejidad podría ahorrar <span className="text-emerald-300 font-mono">€126/mes</span>.
              Se detectaron 15% de peticiones en Llama-3.1-8b que cumplen criterios para migrar a Llama-3.2-3b sin pérdida de calidad observable.
            </p>
            <button
              onClick={() => toast("Auto-routing IA activado (demo)", { description: "Model routing Llama-3.1-8b → Llama-3.2-3b · Ahorro estimado €126/mes" })}
              className="mt-3 min-h-[36px] inline-flex items-center gap-1.5 rounded-md bg-[var(--gold)] text-black px-3 py-1.5 text-xs font-medium hover:bg-[var(--gold-soft)] transition-colors"
            >
              Activar auto-routing
              <ArrowRight className="h-3 w-3" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AiCostTrend() {
  const data = React.useMemo(() => {
    const out: number[] = [];
    let v = 24;
    for (let i = 0; i < 30; i++) {
      v += Math.sin(i / 5) * 4 + (i % 6 === 0 ? -3 : 1.2);
      v = Math.max(18, Math.min(38, v));
      out.push(Math.round(v));
    }
    return out;
  }, []);
  const W = 640, H = 180, pad = 28;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const step = (W - pad * 2) / (data.length - 1);
  const pts = data.map((v, i) => [pad + i * step, H - pad - ((v - min) / range) * (H - pad * 2)] as const);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${path} L ${pts[pts.length - 1][0].toFixed(1)} ${H - pad} L ${pad} ${H - pad} Z`;

  return (
    <div className="rp-glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--gold)]" aria-hidden />
          <h3 className="font-display text-base sm:text-lg font-medium">Tendencia de coste IA (30 días)</h3>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="text-muted-foreground">Media: €28/día</span>
          <span className="text-emerald-300">−12% vs mes anterior</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Tendencia de coste IA últimos 30 días">
        <defs>
          <linearGradient id="rp-fo-ai" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((t) => (
          <line key={t} x1={pad} x2={W - pad} y1={pad + t * (H - pad * 2)} y2={pad + t * (H - pad * 2)}
                stroke="color-mix(in oklab, var(--foreground) 8%, transparent)" strokeWidth="1" />
        ))}
        <path d={area} fill="url(#rp-fo-ai)" />
        <path d={path} fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.5" fill="#D4AF37" />
        <text x={pad} y={H - 6} className="fill-muted-foreground font-mono" fontSize="9">hace 30d</text>
        <text x={W - pad} y={H - 6} textAnchor="end" className="fill-muted-foreground font-mono" fontSize="9">hoy</text>
      </svg>
    </div>
  );
}

/* ============================================================
   Tab: Márgenes
============================================================ */

function MargenesTab() {
  return (
    <div className="flex flex-col gap-5">
      <MarginKpis />
      <MarginByPlanTable />
      <MarginTrendChart />
      <CostPerCustomer />
    </div>
  );
}

function MarginKpis() {
  const kpis = [
    { label: "Margen bruto",    value: "72%", sub: "Target 70% ✓", color: "#3DD6C9" },
    { label: "Margen neto",     value: "58%", sub: "Target 55% ✓", color: "#3DD6C9" },
    { label: "Contribución por org", value: "€149", sub: "Media mensual", color: "#D4AF37" },
    { label: "LTV/CAC",          value: "9.3x", sub: "Saludable (>3x)", color: "#D4AF37" },
    { label: "Payback",          value: "3.2m", sub: "Por cliente", color: "#E8C766" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {kpis.map((k) => (
        <div key={k.label} className="rp-glass rounded-xl p-4">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{k.label}</div>
          <div className="mt-2 font-display text-2xl font-light" style={{ color: k.color }}>{k.value}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">{k.sub}</div>
        </div>
      ))}
    </div>
  );
}

function MarginByPlanTable() {
  return (
    <div className="rp-glass rounded-2xl p-5 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <Crown className="h-4 w-4 text-[var(--gold)]" aria-hidden />
        <h3 className="font-display text-base sm:text-lg font-medium">Margen por plan</h3>
      </div>
      <div className="overflow-x-auto rp-scroll-thin -mx-2">
        <table className="w-full border-collapse text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border/60">
              {["Plan", "Clientes", "Margen %", "Coste/cliente", "Beneficio/cliente"].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MARGIN_BY_PLAN.map((r) => {
              const color = r.plan === "Enterprise" ? "var(--gold)" : r.plan === "Professional" ? "var(--teal)" : "var(--foreground)";
              return (
                <tr key={r.plan} className="border-b border-border/40 last:border-0 hover:bg-foreground/[0.025] transition-colors">
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                      <span className="font-medium">{r.plan}</span>
                    </span>
                  </td>
                  <td className="px-3 py-3 font-mono text-muted-foreground">{r.customers}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono" style={{ color }}>{r.marginPct}%</span>
                      <div className="w-20 h-1.5 rounded-full bg-foreground/[0.05] overflow-hidden">
                        <div className="h-full rounded-full" style={{ background: color, width: `${r.marginPct}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-mono text-muted-foreground">€{r.costPerCustomer}/org</td>
                  <td className="px-3 py-3 font-mono text-emerald-300">€{r.profitPerCustomer}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MarginTrendChart() {
  const W = 640, H = 220, pad = 32;
  const max = 80;
  const step = (W - pad * 2) / (MARGIN_HISTORY.length - 1);
  const toPts = (arr: number[]) => arr.map((v, i) => [pad + i * step, H - pad - (v / max) * (H - pad * 2)] as const);
  const gPts = toPts(MARGIN_HISTORY.map((m) => m.gross));
  const nPts = toPts(MARGIN_HISTORY.map((m) => m.net));
  const toPath = (pts: (readonly [number, number])[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");

  return (
    <div className="rp-glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--teal)]" aria-hidden />
          <h3 className="font-display text-base sm:text-lg font-medium">Tendencia de margen (6 meses)</h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider">
          <span className="inline-flex items-center gap-1.5 text-[var(--gold)]">
            <span className="h-1.5 w-3 rounded-full bg-[var(--gold)]" /> Bruto
          </span>
          <span className="inline-flex items-center gap-1.5 text-[var(--teal)]">
            <span className="h-1.5 w-3 rounded-full bg-[var(--teal)]" /> Neto
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Tendencia de margen bruto y neto últimos 6 meses">
        {[0, 0.5, 1].map((t) => (
          <line key={t} x1={pad} x2={W - pad} y1={pad + t * (H - pad * 2)} y2={pad + t * (H - pad * 2)}
                stroke="color-mix(in oklab, var(--foreground) 8%, transparent)" strokeWidth="1" />
        ))}
        {/* target line at 70% */}
        <line
          x1={pad} x2={W - pad}
          y1={H - pad - (70 / max) * (H - pad * 2)}
          y2={H - pad - (70 / max) * (H - pad * 2)}
          stroke="#E8C766" strokeWidth="1" strokeDasharray="4 3" opacity="0.5"
        />
        <text x={W - pad} y={H - pad - (70 / max) * (H - pad * 2) - 4} textAnchor="end" className="fill-[#E8C766] font-mono" fontSize="9">target 70%</text>
        <path d={toPath(gPts)} fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <path d={toPath(nPts)} fill="none" stroke="#3DD6C9" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {MARGIN_HISTORY.map((m, i) => (
          <text key={m.month} x={pad + i * step} y={H - 8} textAnchor="middle" className="fill-muted-foreground font-mono" fontSize="9">{m.month}</text>
        ))}
      </svg>
    </div>
  );
}

function CostPerCustomer() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Cost per customer */}
      <div className="rp-glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-4 w-4 text-[var(--gold)]" aria-hidden />
          <h3 className="font-display text-base sm:text-lg font-medium">Coste por cliente (por plan)</h3>
        </div>
        <div className="space-y-3">
          {MARGIN_BY_PLAN.map((p) => {
            const max = 89;
            return (
              <div key={p.plan}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{p.plan}</span>
                  <span className="font-mono rp-gold-text">€{p.costPerCustomer}/org</span>
                </div>
                <div className="h-2 rounded-full bg-foreground/[0.05] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--gold-deep)] to-[var(--gold)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${(p.costPerCustomer / max) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Profit per customer */}
      <div className="rp-glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Coins className="h-4 w-4 text-emerald-400" aria-hidden />
          <h3 className="font-display text-base sm:text-lg font-medium">Beneficio por cliente (por plan)</h3>
        </div>
        <div className="space-y-3">
          {MARGIN_BY_PLAN.map((p) => {
            const max = 160;
            return (
              <div key={p.plan}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{p.plan}</span>
                  <span className="font-mono text-emerald-300">€{p.profitPerCustomer}</span>
                </div>
                <div className="h-2 rounded-full bg-foreground/[0.05] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${(p.profitPerCustomer / max) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
          Total beneficio mensual: <span className="text-emerald-300 font-mono">€{(MARGIN_BY_PLAN.reduce((s, p) => s + p.profitPerCustomer * p.customers, 0)).toLocaleString("es-ES")}</span>
        </div>
      </div>
    </div>
  );
}
