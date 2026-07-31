"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Activity,
  Crown,
  Sparkles,
  Store,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Coins,
  Target,
  Zap,
  Flame,
  Heart,
  Star,
  Download,
} from "lucide-react";

/* =========================================================
 * Types & data
 * =======================================================*/
type Plan = "Starter" | "Professional" | "Enterprise";

const KPIS = [
  { label: "MRR", value: "48.250€", delta: "+6.2% MoM", dir: "up" as const, tone: "emerald", icon: DollarSign },
  { label: "ARR", value: "579.000€", delta: "+18.4% YoY", dir: "up" as const, tone: "emerald", icon: TrendingUp },
  { label: "ARPA", value: "149€", delta: "+2.3%", dir: "up" as const, tone: "blue", icon: Target },
  { label: "Churn (logo)", value: "2.1%", delta: "-0.3pp", dir: "down" as const, tone: "emerald", icon: TrendingDown },
  { label: "NRR", value: "118%", delta: "+4pp", dir: "up" as const, tone: "violet", icon: Activity },
  { label: "LTV / CAC", value: "9.3x", delta: "+0.8x", dir: "up" as const, tone: "emerald", icon: Coins },
];

const MRR_BREAKDOWN = [
  { month: "Ene", new: 2200, expansion: 1800, churn: -1200, contraction: -400, total: 28500 },
  { month: "Feb", new: 2400, expansion: 2100, churn: -1100, contraction: -500, total: 30200 },
  { month: "Mar", new: 2600, expansion: 2300, churn: -1400, contraction: -300, total: 32800 },
  { month: "Abr", new: 2300, expansion: 2500, churn: -1600, contraction: -400, total: 35100 },
  { month: "May", new: 2800, expansion: 2700, churn: -1300, contraction: -600, total: 37400 },
  { month: "Jun", new: 1900, expansion: 2200, churn: -1500, contraction: -300, total: 39200 },
  { month: "Jul", new: 2600, expansion: 3100, churn: -1700, contraction: -400, total: 41800 },
  { month: "Ago", new: 2200, expansion: 2400, churn: -1400, contraction: -500, total: 43200 },
  { month: "Sep", new: 2400, expansion: 2600, churn: -1300, contraction: -400, total: 44600 },
  { month: "Oct", new: 2100, expansion: 2800, churn: -1500, contraction: -300, total: 45900 },
  { month: "Nov", new: 2600, expansion: 2900, churn: -1100, contraction: -400, total: 47100 },
  { month: "Dic", new: 4280, expansion: 3120, churn: -1960, contraction: -840, total: 48250 },
];

const COHORTS = [
  { label: "Sep 24", size: 32, retention: [100, 88, 81, 75, 72, 69, 66, 64, 62, 60, 58, 56] },
  { label: "Oct 24", size: 41, retention: [100, 90, 83, 78, 74, 71, 68, 65, 63, 61, 58] },
  { label: "Nov 24", size: 38, retention: [100, 92, 85, 80, 76, 72, 70, 67, 64, 62] },
  { label: "Dic 24", size: 55, retention: [100, 91, 84, 79, 75, 71, 68, 65, 63] },
  { label: "Ene 25", size: 47, retention: [100, 89, 82, 76, 73, 70, 67, 64] },
  { label: "Feb 25", size: 52, retention: [100, 93, 86, 81, 77, 74, 71] },
  { label: "Mar 25", size: 49, retention: [100, 91, 84, 78, 75, 72] },
  { label: "Abr 25", size: 44, retention: [100, 90, 82, 77, 74] },
  { label: "May 25", size: 58, retention: [100, 92, 85, 80] },
  { label: "Jun 25", size: 61, retention: [100, 94, 87] },
  { label: "Jul 25", size: 53, retention: [100, 95] },
  { label: "Ago 25", size: 67, retention: [100] },
];

const FEATURE_ADOPTION = [
  { feature: "Reservas", adoption: 96, plan: "Todos" },
  { feature: "Carta QR", adoption: 88, plan: "Todos" },
  { feature: "TPV", adoption: 74, plan: "Pro+" },
  { feature: "CRM", adoption: 62, plan: "Pro+" },
  { feature: "AI Copilot", adoption: 38, plan: "Pro+" },
  { feature: "Multi-local", adoption: 22, plan: "Ent" },
  { feature: "Modo franquicia", adoption: 8, plan: "Ent" },
  { feature: "Developer portal", adoption: 6, plan: "Ent" },
];

const SIGNALS = [
  { type: "upgrade", tenant: "Mar & Sol Resorts", signal: "Reach 80% locales (4/5)", score: 88, action: "Ofrecer Enterprise" },
  { type: "upgrade", tenant: "Sushi Wave", signal: "AI Copilot usage 92% quota", score: 76, action: "Ofrecer plan superior" },
  { type: "upgrade", tenant: "Taco Loco Group", signal: "Solicita multi-divisa", score: 71, action: "Demo Enterprise" },
  { type: "risk", tenant: "Parrilla Sur", signal: "Sin login 12 días · impago", score: 14, action: "CSM intervention" },
  { type: "risk", tenant: "Trattoria Bellini", signal: "Health score 52 · trial día 7", score: 32, action: "Onboarding rescue" },
  { type: "risk", tenant: "Le Petit Bistro", signal: "Churned hace 45 días", score: 0, action: "Win-back campaign" },
];

const PLAN_DISTRIBUTION = [
  { plan: "Starter", count: 184, mrr: 9016, color: "var(--rp-blue)", pct: 57 },
  { plan: "Professional", count: 108, mrr: 16092, color: "var(--rp-emerald)", pct: 33 },
  { plan: "Enterprise", count: 32, mrr: 23142, color: "var(--rp-violet)", pct: 10 },
];

const NRR_BY_PLAN = [
  { plan: "Starter", nrr: 92, color: "var(--rp-blue)" },
  { plan: "Professional", nrr: 121, color: "var(--rp-emerald)" },
  { plan: "Enterprise", nrr: 138, color: "var(--rp-violet)" },
];

const ACQUISITION_CHANNELS = [
  { channel: "Orgánico / SEO", signups: 84, cac: 0, ltv: 1640, count: 26, conversion: 31 },
  { channel: "Google Ads", signups: 142, cac: 380, ltv: 1980, count: 44, conversion: 31 },
  { channel: "Referral", signups: 67, cac: 95, ltv: 2240, count: 28, conversion: 42 },
  { channel: "LinkedIn outbound", signups: 38, cac: 612, ltv: 4280, count: 14, conversion: 37 },
  { channel: "Partnerships", signups: 51, cac: 240, ltv: 3120, count: 18, conversion: 35 },
  { channel: "Content / webinar", signups: 29, cac: 180, ltv: 1840, count: 9, conversion: 31 },
];

const FUNNEL_STEPS = [
  { id: "visit", label: "Visitantes", value: 18420, color: "var(--rp-blue)" },
  { id: "signup", label: "Signups", value: 1240, color: "var(--rp-violet)" },
  { id: "activated", label: "Activados", value: 820, color: "var(--rp-yellow)" },
  { id: "paid", label: "Pago 1er mes", value: 580, color: "var(--rp-emerald)" },
  { id: "expanded", label: "Expansión MRR", value: 142, color: "var(--rp-emerald)" },
];

const CHURN_REASONS = [
  { reason: "Coste percibido alto", pct: 28, count: 11 },
  { reason: "Baja adopción del equipo", pct: 22, count: 9 },
  { reason: "Cierre del negocio", pct: 17, count: 7 },
  { reason: "Cambio a competidor", pct: 14, count: 6 },
  { reason: "Falta de integraciones", pct: 10, count: 4 },
  { reason: "Soporte insuficiente", pct: 5, count: 2 },
  { reason: "Otros", pct: 4, count: 2 },
];

const MONTHLY_ACTIVE_USERS = [
  { month: "Ene", value: 1280 },
  { month: "Feb", value: 1340 },
  { month: "Mar", value: 1480 },
  { month: "Abr", value: 1560 },
  { month: "May", value: 1690 },
  { month: "Jun", value: 1780 },
  { month: "Jul", value: 1920 },
  { month: "Ago", value: 1980 },
  { month: "Sep", value: 2140 },
  { month: "Oct", value: 2260 },
  { month: "Nov", value: 2410 },
  { month: "Dic", value: 2540 },
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

/* =========================================================
 * KPI strip
 * =======================================================*/
function KpiStrip() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
      {KPIS.map((k) => {
        const color = TONE[k.tone];
        const Icon = k.icon;
        const TrendIcon = k.dir === "up" ? ArrowUpRight : ArrowDownRight;
        return (
          <div key={k.label} className="rp-glass rounded-lg p-3 border border-border/60">
            <div className="flex items-center justify-between">
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono">{k.label}</div>
              <Icon className="h-3.5 w-3.5" style={{ color }} aria-hidden />
            </div>
            <div className="mt-1 text-lg font-display font-medium" style={{ color }}>{k.value}</div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
              <TrendIcon className="h-2.5 w-2.5" style={{ color: k.dir === "up" ? "var(--rp-emerald)" : "var(--rp-yellow)" }} aria-hidden />
              {k.delta}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
 * MRR chart with breakdown
 * =======================================================*/
function MrrChart() {
  const { toast } = useToast();
  const w = 880, h = 280, pad = 36;
  const max = Math.max(...MRR_BREAKDOWN.map(m => m.total)) * 1.1;
  const x = (i: number) => pad + (i * (w - pad * 2)) / (MRR_BREAKDOWN.length - 1);
  const y = (v: number) => h - pad - (v / max) * (h - pad * 2);

  const linePath = MRR_BREAKDOWN.map((m, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(m.total)}`).join(" ");
  const areaPath = `${linePath} L${x(MRR_BREAKDOWN.length - 1)},${h - pad} L${x(0)},${h - pad} Z`;

  // Stacked breakdown bar (new + expansion - churn - contraction)
  return (
    <div className="rp-glass rounded-xl border border-border/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-[var(--rp-emerald)]" aria-hidden />
          <h4 className="text-sm font-medium">MRR · últimos 12 meses con breakdown</h4>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[var(--rp-emerald)]" aria-hidden /> New</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[var(--rp-blue)]" aria-hidden /> Expansion</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[var(--rp-red)]" aria-hidden /> Churn</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[var(--rp-yellow)]" aria-hidden /> Contraction</span>
          <Button size="sm" variant="outline" className="h-7 text-[11px] ml-2" onClick={() => toast({ title: "Exportando MRR", description: "XLSX enviado a finance@." })}>
            <Download className="h-3.5 w-3.5 mr-1" aria-hidden /> XLSX
          </Button>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label="MRR chart con desglose">
        <defs>
          <linearGradient id="mrr-area-saas" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={TONE.emerald} stopOpacity="0.3" />
            <stop offset="100%" stopColor={TONE.emerald} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <g key={p}>
            <line x1={pad} x2={w - pad} y1={pad + p * (h - pad * 2)} y2={pad + p * (h - pad * 2)} stroke="currentColor" strokeOpacity="0.06" />
            <text x={pad - 6} y={pad + p * (h - pad * 2) + 3} fontSize="9" fill="currentColor" fillOpacity="0.4" textAnchor="end" fontFamily="var(--font-jetbrains)">
              {Math.round(max * (1 - p) / 1000)}k
            </text>
          </g>
        ))}
        {/* Breakdown bars */}
        {MRR_BREAKDOWN.map((m, i) => {
          const bw = 14;
          const bx = x(i) - bw / 2;
          const newH = (m.new / max) * (h - pad * 2);
          const expH = (m.expansion / max) * (h - pad * 2);
          const chH = (Math.abs(m.churn) / max) * (h - pad * 2);
          const coH = (Math.abs(m.contraction) / max) * (h - pad * 2);
          const baseY = h - pad;
          return (
            <g key={i}>
              {/* positive stack: new + expansion from bottom */}
              <rect x={bx} y={baseY - newH} width={bw} height={newH} fill={TONE.emerald} fillOpacity="0.85" rx="1" />
              <rect x={bx} y={baseY - newH - expH} width={bw} height={expH} fill={TONE.blue} fillOpacity="0.85" rx="1" />
              {/* negative stack: churn + contraction above positive */}
              <rect x={bx} y={baseY - newH - expH - chH} width={bw} height={chH} fill={TONE.red} fillOpacity="0.85" rx="1" />
              <rect x={bx} y={baseY - newH - expH - chH - coH} width={bw} height={coH} fill={TONE.yellow} fillOpacity="0.85" rx="1" />
            </g>
          );
        })}
        {/* Total area */}
        <path d={areaPath} fill="url(#mrr-area-saas)" />
        <path d={linePath} fill="none" stroke={TONE.emerald} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {MRR_BREAKDOWN.map((m, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(m.total)} r="3" fill="var(--background)" stroke={TONE.emerald} strokeWidth="2" />
            <text x={x(i)} y={h - pad + 16} fontSize="10" fill="currentColor" fillOpacity="0.5" textAnchor="middle" fontFamily="var(--font-jetbrains)">
              {m.month}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* =========================================================
 * Cohort retention heatmap
 * =======================================================*/
function CohortHeatmap() {
  return (
    <div className="rp-glass rounded-xl border border-border/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[var(--rp-violet)]" aria-hidden />
          <h4 className="text-sm font-medium">Cohort retention · últimos 12 meses</h4>
        </div>
        <Badge variant="outline" className="text-[10px]">{COHORTS.length} cohorts · M0-M11</Badge>
      </div>
      <div className="overflow-x-auto rp-scroll-thin">
        <table className="w-full text-[10px] font-mono">
          <thead>
            <tr>
              <th className="py-1.5 px-2 text-left text-muted-foreground font-medium sticky left-0 bg-[hsl(var(--card))]/95 backdrop-blur">Cohort</th>
              <th className="py-1.5 px-1 text-right text-muted-foreground font-medium">Size</th>
              {Array.from({ length: 12 }).map((_, i) => (
                <th key={i} className="py-1.5 px-1 text-center text-muted-foreground font-medium">M{i}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COHORTS.map((c) => (
              <tr key={c.label}>
                <td className="py-1 px-2 text-foreground sticky left-0 bg-[hsl(var(--card))]/95 backdrop-blur">{c.label}</td>
                <td className="py-1 px-1 text-right text-muted-foreground">{c.size}</td>
                {Array.from({ length: 12 }).map((_, i) => {
                  const v = c.retention[i];
                  if (v === undefined) return <td key={i} className="p-0.5"><div className="h-5 w-9 rounded-sm bg-foreground/[0.02]" /></td>;
                  const pct = v / 100;
                  // green→yellow→red gradient by retention
                  const bg = pct >= 0.85 ? `color-mix(in oklab, ${TONE.emerald} ${Math.round(pct * 100)}%, transparent)`
                    : pct >= 0.7 ? `color-mix(in oklab, ${TONE.blue} ${Math.round(pct * 100)}%, transparent)`
                    : pct >= 0.5 ? `color-mix(in oklab, ${TONE.yellow} ${Math.round(pct * 100)}%, transparent)`
                    : `color-mix(in oklab, ${TONE.red} ${Math.round(pct * 100)}%, transparent)`;
                  return (
                    <td key={i} className="p-0.5 text-center" title={`${c.label} · M${i} = ${v}%`}>
                      <div
                        className="h-5 w-9 rounded-sm flex items-center justify-center text-[9px]"
                        style={{ background: bg, color: pct >= 0.5 ? "#062018" : "currentColor" }}
                      >
                        {v}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-[10px] text-muted-foreground flex items-center gap-3">
        <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: TONE.emerald }} /> 85%+</span>
        <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: TONE.blue }} /> 70-84%</span>
        <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: TONE.yellow }} /> 50-69%</span>
        <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: TONE.red }} /> &lt; 50%</span>
      </div>
    </div>
  );
}

/* =========================================================
 * Feature adoption bar chart
 * =======================================================*/
function FeatureAdoption() {
  return (
    <div className="rp-glass rounded-xl border border-border/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-4 w-4 text-[var(--rp-yellow)]" aria-hidden />
        <h4 className="text-sm font-medium">Adopción por feature</h4>
      </div>
      <div className="space-y-2">
        {FEATURE_ADOPTION.map((f) => {
          const color = f.adoption >= 80 ? TONE.emerald : f.adoption >= 50 ? TONE.blue : f.adoption >= 25 ? TONE.yellow : TONE.red;
          return (
            <div key={f.feature} className="flex items-center gap-2">
              <div className="w-28 sm:w-36 truncate text-xs">{f.feature}</div>
              <Badge variant="outline" className="text-[9px] h-4 px-1 mr-1 shrink-0">{f.plan}</Badge>
              <div className="flex-1 h-5 rounded-md bg-foreground/[0.04] overflow-hidden">
                <div className="h-full rounded-md flex items-center justify-end pr-1.5" style={{ width: `${f.adoption}%`, background: `linear-gradient(90deg, ${color}, color-mix(in oklab, ${color} 60%, transparent))` }}>
                  <span className="text-[10px] font-mono text-[#062018] font-medium">{f.adoption}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
 * Signals panel
 * =======================================================*/
function SignalsPanel() {
  const { toast } = useToast();
  return (
    <div className="rp-glass rounded-xl border border-border/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-[var(--rp-yellow)]" aria-hidden />
          <h4 className="text-sm font-medium">Señales de upgrade / riesgo</h4>
        </div>
        <Badge variant="outline" className="text-[10px]">{SIGNALS.length} señales activas</Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {SIGNALS.map((s) => {
          const isUpgrade = s.type === "upgrade";
          const color = isUpgrade ? TONE.emerald : s.score < 30 ? TONE.red : TONE.yellow;
          const Icon = isUpgrade ? TrendingUp : AlertTriangle;
          return (
            <button
              key={s.tenant + s.signal}
              type="button"
              onClick={() => toast({ title: isUpgrade ? "Acción de upgrade" : "Acción de retención", description: `${s.tenant} · ${s.action}` })}
              className="text-left rounded-md border border-border/50 p-2.5 hover:border-foreground/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn("inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-mono", isUpgrade ? "text-[var(--rp-emerald)]" : "text-[var(--rp-red)]")}>
                  <Icon className="h-3 w-3" aria-hidden /> {s.type}
                </span>
                <span className="text-[10px] font-mono" style={{ color }}>{s.score}/100</span>
              </div>
              <div className="text-xs font-medium truncate">{s.tenant}</div>
              <div className="text-[11px] text-muted-foreground">{s.signal}</div>
              <div className="mt-1.5 h-1 rounded-full bg-foreground/[0.05] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: color }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
 * Unit economics
 * =======================================================*/
function UnitEconomics() {
  const { toast } = useToast();
  return (
    <div className="rp-glass rounded-xl border border-border/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-[var(--rp-emerald)]" aria-hidden />
          <h4 className="text-sm font-medium">LTV / CAC por canal de adquisición</h4>
        </div>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast({ title: "Exportando unit economics", description: "XLSX con detalle enviado." })}>
          <Download className="h-3.5 w-3.5 mr-1" aria-hidden /> XLSX
        </Button>
      </div>
      <div className="overflow-x-auto rp-scroll-thin">
        <table className="w-full text-xs">
          <thead className="text-left text-muted-foreground">
            <tr className="border-b border-border/40">
              <th className="py-2 pr-2 font-medium">Canal</th>
              <th className="py-2 px-2 font-medium text-right">Signups</th>
              <th className="py-2 px-2 font-medium text-right">Conversiones</th>
              <th className="py-2 px-2 font-medium text-right">Conv. %</th>
              <th className="py-2 px-2 font-medium text-right">CAC</th>
              <th className="py-2 px-2 font-medium text-right">LTV</th>
              <th className="py-2 px-2 font-medium text-right">LTV/CAC</th>
            </tr>
          </thead>
          <tbody>
            {ACQUISITION_CHANNELS.map((c) => {
              const ratio = c.cac === 0 ? Infinity : c.ltv / c.cac;
              const ratioColor = ratio === Infinity || ratio >= 4 ? "var(--rp-emerald)" : ratio >= 2 ? "var(--rp-blue)" : ratio >= 1 ? "var(--rp-yellow)" : "var(--rp-red)";
              return (
                <tr key={c.channel} className="border-b border-border/30 hover:bg-foreground/[0.02]">
                  <td className="py-2 pr-2 font-medium">{c.channel}</td>
                  <td className="py-2 px-2 text-right font-mono">{c.signups}</td>
                  <td className="py-2 px-2 text-right font-mono">{c.count}</td>
                  <td className="py-2 px-2 text-right font-mono text-muted-foreground">{c.conversion}%</td>
                  <td className="py-2 px-2 text-right font-mono">{c.cac === 0 ? "—" : euro(c.cac)}</td>
                  <td className="py-2 px-2 text-right font-mono">{euro(c.ltv)}</td>
                  <td className="py-2 px-2 text-right font-mono font-medium" style={{ color: ratioColor }}>
                    {ratio === Infinity ? "∞" : `${ratio.toFixed(1)}x`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Separator className="my-3" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="rounded-md bg-foreground/[0.04] p-2">
          <div className="text-[10px] uppercase text-muted-foreground font-mono">CAC blended</div>
          <div className="font-mono text-[var(--rp-yellow)]">{euro(412)}</div>
        </div>
        <div className="rounded-md bg-foreground/[0.04] p-2">
          <div className="text-[10px] uppercase text-muted-foreground font-mono">LTV blended</div>
          <div className="font-mono text-[var(--rp-emerald)]">{euro(3840)}</div>
        </div>
        <div className="rounded-md bg-foreground/[0.04] p-2">
          <div className="text-[10px] uppercase text-muted-foreground font-mono">Payback period</div>
          <div className="font-mono">8.4 meses</div>
        </div>
        <div className="rounded-md bg-foreground/[0.04] p-2">
          <div className="text-[10px] uppercase text-muted-foreground font-mono">LTV/CAC blended</div>
          <div className="font-mono text-[var(--rp-emerald)]">9.3x</div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Growth funnel
 * =======================================================*/
function GrowthFunnel() {
  const max = FUNNEL_STEPS[0].value;
  return (
    <div className="rp-glass rounded-xl border border-border/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Target className="h-4 w-4 text-[var(--rp-violet)]" aria-hidden />
        <h4 className="text-sm font-medium">Funnel de adquisición · últimos 30 días</h4>
      </div>
      <div className="space-y-2">
        {FUNNEL_STEPS.map((s, i) => {
          const pct = (s.value / max) * 100;
          const prevPct = i === 0 ? 100 : (s.value / FUNNEL_STEPS[i - 1].value) * 100;
          return (
            <div key={s.id} className="space-y-0.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{s.label}</span>
                <span className="font-mono text-muted-foreground">{s.value.toLocaleString("es-ES")} · {pct.toFixed(1)}%</span>
              </div>
              <div className="h-7 rounded-md bg-foreground/[0.04] overflow-hidden relative">
                <div
                  className="h-full rounded-md flex items-center px-2"
                  style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${s.color}, color-mix(in oklab, ${s.color} 60%, transparent))` }}
                >
                  <span className="text-[10px] font-mono text-[#062018] font-medium">{pct.toFixed(1)}%</span>
                </div>
              </div>
              {i > 0 && (
                <div className="text-[10px] text-muted-foreground font-mono pl-1">
                  → conversión paso anterior: <span className="text-foreground">{prevPct.toFixed(1)}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Separator className="my-3" />
      <div className="text-[11px] text-muted-foreground">
        Mayor caída: <span className="text-foreground">Visitantes → Signups (6.7%)</span>. Optimizando landing + CTA de prueba podría subir a 8-10%.
      </div>
    </div>
  );
}

/* =========================================================
 * Churn analysis
 * =======================================================*/
function ChurnAnalysis() {
  const max = Math.max(...CHURN_REASONS.map(r => r.pct));
  return (
    <div className="rp-glass rounded-xl border border-border/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-[var(--rp-red)]" aria-hidden />
          <h4 className="text-sm font-medium">Análisis de churn · 90 días</h4>
        </div>
        <Badge variant="outline" className="text-[10px] border-[var(--rp-red)]/40 text-[var(--rp-red)]">
          {CHURN_REASONS.reduce((s, r) => s + r.count, 0)} churns · 2.1% rate
        </Badge>
      </div>
      <div className="space-y-2">
        {CHURN_REASONS.map((r) => {
          const pct = (r.pct / max) * 100;
          const color = r.pct >= 20 ? "var(--rp-red)" : r.pct >= 12 ? "var(--rp-yellow)" : "var(--rp-blue)";
          return (
            <div key={r.reason} className="flex items-center gap-2">
              <div className="w-44 truncate text-xs">{r.reason}</div>
              <div className="flex-1 h-5 rounded-md bg-foreground/[0.04] overflow-hidden">
                <div
                  className="h-full rounded-md flex items-center justify-end pr-1.5"
                  style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, color-mix(in oklab, ${color} 60%, transparent))` }}
                >
                  <span className="text-[10px] font-mono text-[#062018] font-medium">{r.pct}%</span>
                </div>
              </div>
              <div className="w-12 text-right text-[10px] font-mono text-muted-foreground">{r.count}</div>
            </div>
          );
        })}
      </div>
      <Separator className="my-3" />
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-md bg-[var(--rp-red)]/[0.06] border border-[var(--rp-red)]/30 p-2">
          <div className="text-[10px] uppercase text-muted-foreground font-mono">Churn logo</div>
          <div className="font-mono text-[var(--rp-red)]">2.1%</div>
        </div>
        <div className="rounded-md bg-[var(--rp-yellow)]/[0.06] border border-[var(--rp-yellow)]/30 p-2">
          <div className="text-[10px] uppercase text-muted-foreground font-mono">Churn revenue</div>
          <div className="font-mono text-[var(--rp-yellow)]">1.4%</div>
        </div>
        <div className="rounded-md bg-[var(--rp-emerald)]/[0.06] border border-[var(--rp-emerald)]/30 p-2">
          <div className="text-[10px] uppercase text-muted-foreground font-mono">Net revenue</div>
          <div className="font-mono text-[var(--rp-emerald)]">+4.8%</div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * MAU chart
 * =======================================================*/
function MauChart() {
  const w = 880, h = 160, pad = 32;
  const max = Math.max(...MONTHLY_ACTIVE_USERS.map(m => m.value)) * 1.1;
  const min = Math.min(...MONTHLY_ACTIVE_USERS.map(m => m.value)) * 0.95;
  const x = (i: number) => pad + (i * (w - pad * 2)) / (MONTHLY_ACTIVE_USERS.length - 1);
  const y = (v: number) => h - pad - ((v - min) / (max - min)) * (h - pad * 2);
  const linePath = MONTHLY_ACTIVE_USERS.map((m, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(m.value)}`).join(" ");
  const areaPath = `${linePath} L${x(MONTHLY_ACTIVE_USERS.length - 1)},${h - pad} L${x(0)},${h - pad} Z`;
  return (
    <div className="rp-glass rounded-xl border border-border/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[var(--rp-blue)]" aria-hidden />
          <h4 className="text-sm font-medium">Monthly Active Users (MAU)</h4>
        </div>
        <Badge variant="outline" className="text-[10px] border-[var(--rp-emerald)]/40 text-[var(--rp-emerald)]">+98.4% YoY</Badge>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label="MAU últimos 12 meses">
        <defs>
          <linearGradient id="mau-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={TONE.blue} stopOpacity="0.3" />
            <stop offset="100%" stopColor={TONE.blue} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((p) => (
          <line key={p} x1={pad} x2={w - pad} y1={pad + p * (h - pad * 2)} y2={pad + p * (h - pad * 2)} stroke="currentColor" strokeOpacity="0.06" />
        ))}
        <path d={areaPath} fill="url(#mau-fill)" />
        <path d={linePath} fill="none" stroke={TONE.blue} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {MONTHLY_ACTIVE_USERS.map((m, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(m.value)} r="3" fill="var(--background)" stroke={TONE.blue} strokeWidth="2" />
            <text x={x(i)} y={h - pad + 14} fontSize="10" fill="currentColor" fillOpacity="0.5" textAnchor="middle" fontFamily="var(--font-jetbrains)">{m.month}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* =========================================================
 * Plan distribution donut + NRR by plan
 * =======================================================*/
function Donut({ segments, size = 160 }: { segments: { label: string; value: number; color: string }[]; size?: number }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = size / 2 - 12;
  const cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  // Compute each segment's dash + offset via reduce (no external mutation).
  const computed = segments.reduce<{ s: { label: string; value: number; color: string }; dash: number; offset: number }[]>((acc, s) => {
    const pct = s.value / total;
    const dash = pct * circumference;
    const offset = acc.length === 0 ? 0 : acc[acc.length - 1].offset + acc[acc.length - 1].dash;
    return [...acc, { s, dash, offset }];
  }, []);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeOpacity="0.06" strokeWidth="12" />
      {computed.map(({ s, dash, offset }) => (
        <circle
          key={s.label}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={s.color}
          strokeWidth="12"
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeDashoffset={-offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          strokeLinecap="butt"
        />
      ))}
    </svg>
  );
}

function PlanDistribution() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Donut */}
      <div className="rp-glass rounded-xl border border-border/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Star className="h-4 w-4 text-[var(--rp-emerald)]" aria-hidden />
          <h4 className="text-sm font-medium">Distribución por plan</h4>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <Donut segments={PLAN_DISTRIBUTION.map(p => ({ label: p.plan, value: p.count, color: p.color }))} size={160} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-2xl font-display font-medium">324</div>
              <div className="text-[10px] text-muted-foreground font-mono">tenants</div>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {PLAN_DISTRIBUTION.map((p) => {
              const Icon = p.plan === "Enterprise" ? Crown : p.plan === "Professional" ? Sparkles : Store;
              return (
                <div key={p.plan} className="flex items-center gap-2 text-xs">
                  <Icon className="h-3.5 w-3.5" style={{ color: p.color }} aria-hidden />
                  <span className="flex-1">{p.plan}</span>
                  <span className="font-mono text-muted-foreground">{p.count}</span>
                  <span className="font-mono text-[var(--rp-emerald)]">{euro(p.mrr)}</span>
                  <span className="text-[10px] text-muted-foreground font-mono w-8 text-right">{p.pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* NRR by plan */}
      <div className="rp-glass rounded-xl border border-border/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-[var(--rp-violet)]" aria-hidden />
          <h4 className="text-sm font-medium">NRR por plan</h4>
        </div>
        <div className="space-y-3">
          {NRR_BY_PLAN.map((n) => {
            const over = n.nrr >= 100;
            const pct = Math.min(100, (n.nrr / 150) * 100);
            return (
              <div key={n.plan}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>{n.plan}</span>
                  <span className="font-mono" style={{ color: n.color }}>{n.nrr}% {over && <Heart className="inline h-3 w-3 ml-0.5" aria-hidden />}</span>
                </div>
                <div className="h-2 rounded-full bg-foreground/[0.05] overflow-hidden relative">
                  <div className="absolute top-0 left-2/3 h-full w-px bg-foreground/30" aria-hidden title="100% target" />
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: n.color }} />
                </div>
              </div>
            );
          })}
        </div>
        <Separator className="my-3" />
        <div className="text-[11px] text-muted-foreground">
          <span className="font-mono text-[var(--rp-emerald)]">118%</span> NRR consolidado · target <span className="font-mono">120%</span>. Starter arrastra por bajo upgrade rate.
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Main view
 * =======================================================*/
export function SaasMetricsView() {
  const [tab, setTab] = React.useState("overview");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[var(--rp-emerald)]/15 p-2">
            <Activity className="h-5 w-5 text-[var(--rp-emerald)]" aria-hidden />
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-medium tracking-tight">Métricas SaaS internas</h2>
            <p className="text-xs text-muted-foreground">MRR, cohorts, adopción, señales y distribución · datos internos.</p>
          </div>
        </div>
        <Badge variant="outline" className="border-[var(--rp-red)]/40 text-[var(--rp-red)] text-[10px]">
          <AlertTriangle className="h-3 w-3 mr-1" aria-hidden /> Internal · no exponer a tenants
        </Badge>
      </div>

      <KpiStrip />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full justify-start overflow-x-auto rp-scroll-thin h-9">
          <TabsTrigger value="overview" className="text-xs"><BarChart3 className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Overview</TabsTrigger>
          <TabsTrigger value="growth" className="text-xs"><Target className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Growth</TabsTrigger>
          <TabsTrigger value="cohorts" className="text-xs"><Users className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Cohorts</TabsTrigger>
          <TabsTrigger value="adoption" className="text-xs"><Zap className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Adopción</TabsTrigger>
          <TabsTrigger value="signals" className="text-xs"><Flame className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Señales</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <MrrChart />
          <PlanDistribution />
        </TabsContent>
        <TabsContent value="growth" className="mt-4 space-y-4">
          <MauChart />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GrowthFunnel />
            <ChurnAnalysis />
          </div>
          <UnitEconomics />
        </TabsContent>
        <TabsContent value="cohorts" className="mt-4">
          <CohortHeatmap />
        </TabsContent>
        <TabsContent value="adoption" className="mt-4">
          <FeatureAdoption />
        </TabsContent>
        <TabsContent value="signals" className="mt-4">
          <SignalsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SaasMetricsView;
