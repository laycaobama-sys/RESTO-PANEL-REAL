"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  HeartPulse,
  Bot,
  Zap,
  Users,
  TrendingUp,
  ShoppingCart,
  Star,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Play,
  Download,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
interface Dimension {
  id: string;
  label: string;
  weight: number; // %
  score: number; // 0-100
  desc: string;
  icon: React.ElementType;
}

interface Playbook {
  id: string;
  title: string;
  trigger: string;
  steps: string[];
  expectedLift: string;
  tone: string;
  icon: React.ElementType;
}

interface CsmTenant {
  id: string;
  tenant: string;
  csm: string;
  score: number;
  trend: "up" | "down" | "flat";
  segment: "expansion" | "stable" | "risk" | "churn";
  mrr: number;
}

/* =========================================================
 * Data
 * =======================================================*/
const DIMENSIONS: Dimension[] = [
  { id: "d1", label: "Uso de producto", weight: 25, score: 88, desc: "DAU/MAU, features clave usadas, sesiones activas", icon: Zap },
  { id: "d2", label: "Adopción del equipo", weight: 20, score: 72, desc: "% usuarios activos vs provisionados, profundidad", icon: Users },
  { id: "d3", label: "Engagement comercial", weight: 15, score: 81, desc: "Respuestas CSM, NPS, participación en webinars", icon: Star },
  { id: "d4", label: "Salud financiera", weight: 20, score: 95, desc: "Pagos al día, MRR estable, sin descuentos pedidos", icon: TrendingUp },
  { id: "d5", label: "Soporte y tickets", weight: 10, score: 64, desc: "Volumen tickets, CSAT, P0/P1 recientes", icon: AlertTriangle },
  { id: "d6", label: "Resultado de negocio", weight: 10, score: 78, desc: "Crecimiento reservas, reducción no-show, ROI", icon: ShoppingCart },
];

const PLAYBOOKS: Playbook[] = [
  {
    id: "pb1",
    title: "Rescate de adopción",
    trigger: "Adopción del equipo < 70% · 14 días consecutivos",
    steps: [
      "Notificar CSM automáticamente",
      "Enviar encuesta de fricción al admin",
      "Agendar sesión de onboarding 1:1 en 48h",
      "Activar tour guiado + tooltips contextuales",
      "Revisar en 14 días · si no mejora, escalar a CS Director",
    ],
    expectedLift: "+18 pts adopción en 30 días",
    tone: "yellow",
    icon: Users,
  },
  {
    id: "pb2",
    title: "Estabilización de soporte",
    trigger: "3+ tickets P2 en 7 días o 1 P1 en 30 días",
    steps: [
      "Auto-clasificar causa raíz con IA",
      "Asignar Solution Engineer senior",
      "Crear grupo de Slack dedicado (si Enterprise)",
      "Postmortem público al cerrar",
      "Rebajar prioridad de futuros issues similares tras fix",
    ],
    expectedLift: "-42% tickets repetidos",
    tone: "red",
    icon: AlertTriangle,
  },
  {
    id: "pb3",
    title: "Expansión proactiva",
    trigger: "Uso > 85% en 3 features clave + 90 días activo",
    steps: [
      "Generar ROI report personalizado",
      "Mostrar comparativa con peers del segmento",
      "Ofrecer demo de features no usadas del plan superior",
      "Aplicar discount de upgrade del 15% (30 días)",
      "Revisar conversión a 30 días",
    ],
    expectedLift: "+€340 MRR expansion",
    tone: "emerald",
    icon: TrendingUp,
  },
  {
    id: "pb4",
    title: "Win-back post-churn",
    trigger: "Tenant churned · 60 días · sin win-back previo",
    steps: [
      "Email personalizado del CSM con novedades",
      "Oferta de 50% descuento 3 meses",
      "Onboarding asistido gratuito",
      "Migración asistida si vienen de competidor",
      "Revisar reactivación a 30/60/90 días",
    ],
    expectedLift: "12% reactivación",
    tone: "blue",
    icon: Sparkles,
  },
];

const CSM_TENANTS: CsmTenant[] = [
  { id: "t1", tenant: "Ramses Group", csm: "Ana Ruiz", score: 92, trend: "up", segment: "stable", mrr: 1490 },
  { id: "t2", tenant: "El Club del Chef", csm: "Ana Ruiz", score: 78, trend: "flat", segment: "stable", mrr: 447 },
  { id: "t3", tenant: "Sakura Sushi Chain", csm: "Bea Sol", score: 95, trend: "up", segment: "expansion", mrr: 2980 },
  { id: "t4", tenant: "Trattoria Bellini", csm: "Bea Sol", score: 52, trend: "down", segment: "risk", mrr: 49 },
  { id: "t5", tenant: "Mar & Sol Resorts", csm: "Ana Ruiz", score: 67, trend: "down", segment: "risk", mrr: 745 },
  { id: "t6", tenant: "Parrilla Sur", csm: "Tom Pey", score: 28, trend: "down", segment: "churn", mrr: 98 },
  { id: "t7", tenant: "Brasserie Lumière", csm: "Tom Pey", score: 81, trend: "flat", segment: "stable", mrr: 596 },
  { id: "t8", tenant: "Wok Republic", csm: "Bea Sol", score: 88, trend: "up", segment: "expansion", mrr: 2235 },
  { id: "t9", tenant: "Café Central Lisboa", csm: "Tom Pey", score: 64, trend: "flat", segment: "risk", mrr: 49 },
  { id: "t10", tenant: "Taco Loco Group", csm: "Ana Ruiz", score: 84, trend: "up", segment: "stable", mrr: 1043 },
  { id: "t11", tenant: "Le Petit Bistro", csm: "Tom Pey", score: 0, trend: "flat", segment: "churn", mrr: 0 },
  { id: "t12", tenant: "Sushi Wave", csm: "Bea Sol", score: 76, trend: "up", segment: "stable", mrr: 596 },
];

const SEGMENTS = [
  { id: "expansion", label: "Expansion", count: 2, mrr: 5215, color: "var(--rp-emerald)" },
  { id: "stable", label: "Stable", count: 5, mrr: 3172, color: "var(--rp-blue)" },
  { id: "risk", label: "Atención", count: 3, mrr: 843, color: "var(--rp-yellow)" },
  { id: "churn", label: "Churned", count: 2, mrr: 0, color: "var(--rp-red)" },
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

function scoreColor(score: number): string {
  if (score >= 80) return "var(--rp-emerald)";
  if (score >= 60) return "var(--rp-blue)";
  if (score >= 40) return "var(--rp-yellow)";
  return "var(--rp-red)";
}

function scoreBand(score: number): { label: string; cls: string } {
  if (score >= 80) return { label: "Excelente", cls: "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald)]" };
  if (score >= 60) return { label: "Bueno", cls: "border-[var(--rp-blue)]/40 bg-[var(--rp-blue)]/10 text-[var(--rp-blue)]" };
  if (score >= 40) return { label: "Atención", cls: "border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow)]" };
  return { label: "Crítico", cls: "border-[var(--rp-red)]/40 bg-[var(--rp-red)]/10 text-[var(--rp-red)]" };
}

/* =========================================================
 * SVG dial
 * =======================================================*/
function HealthDial({ score, size = 200 }: { score: number; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;
  // 270° arc (from 225° to -45° going clockwise = 0.75 of circle)
  const circumference = 2 * Math.PI * r;
  const arcLength = circumference * 0.75;
  const rotation = 135; // start at 225° → rotate -135° from top
  const dashOffset = arcLength - (score / 100) * arcLength;

  const band = scoreBand(score);
  const color = scoreColor(score);

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={`Health score ${score} de 100`}>
        <defs>
          <linearGradient id={`dial-${color.replace(/[^a-z]/gi, "")}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.08"
          strokeWidth="14"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset="0"
          strokeLinecap="round"
          transform={`rotate(${rotation} ${cx} ${cy})`}
        />
        {/* Filled arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={`url(#dial-${color.replace(/[^a-z]/gi, "")})`}
          strokeWidth="14"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(${rotation} ${cx} ${cy})`}
        />
        {/* Bands indicators */}
        {[40, 60, 80].map((b) => {
          const angle = rotation + (b / 100) * 270;
          const rad = (angle * Math.PI) / 180;
          const x1 = cx + Math.cos(rad) * (r - 8);
          const y1 = cy + Math.sin(rad) * (r - 8);
          const x2 = cx + Math.cos(rad) * (r + 8);
          const y2 = cy + Math.sin(rad) * (r + 8);
          return <line key={b} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" />;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-4xl font-display font-medium" style={{ color }}>{score}</div>
        <div className="text-[10px] text-muted-foreground font-mono">/ 100</div>
        <Badge variant="outline" className={cn("mt-1 text-[10px]", band.cls)}>{band.label}</Badge>
      </div>
      {/* Band legend */}
      <div className="mt-2 flex gap-2 text-[9px] font-mono">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "var(--rp-red)" }} /> 0-39</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "var(--rp-yellow)" }} /> 40-59</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "var(--rp-blue)" }} /> 60-79</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "var(--rp-emerald)" }} /> 80-100</span>
      </div>
    </div>
  );
}

/* =========================================================
 * Dimension breakdown
 * =======================================================*/
function Dimensions() {
  return (
    <div className="rp-glass rounded-xl border border-border/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Zap className="h-4 w-4 text-[var(--rp-emerald)]" aria-hidden /> 6 dimensiones (weighted)
        </h4>
        <Badge variant="outline" className="text-[10px]">suma pesos = 100%</Badge>
      </div>
      <div className="space-y-2.5">
        {DIMENSIONS.map((d) => {
          const Icon = d.icon;
          const color = scoreColor(d.score);
          return (
            <div key={d.id} className="rounded-md border border-border/50 p-2.5">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="h-3.5 w-3.5" style={{ color }} aria-hidden />
                <span className="text-xs font-medium flex-1">{d.label}</span>
                <span className="text-[10px] font-mono text-muted-foreground">peso {d.weight}%</span>
                <span className="font-mono text-sm" style={{ color }}>{d.score}</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={d.score} className="h-1.5 flex-1" style={{ ["--progress-foreground" as string]: color }} />
                <span className="text-[10px] font-mono text-muted-foreground w-12 text-right">
                  +{Math.round((d.score * d.weight) / 100)} pts
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{d.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
 * AI diagnosis
 * =======================================================*/
function AiDiagnosis({ score }: { score: number }) {
  const color = scoreColor(score);
  const band = scoreBand(score);

  const diagnosis = score >= 80
    ? "Tenant en excelente salud. Uso de producto y estabilidad financiera sobresalientes. Detectamos oportunidad de expansion por uso elevado en 3 features clave."
    : score >= 60
    ? "Tenant saludable con margen de mejora. Adopción del equipo y volumen de tickets son los puntos más bajos. Recomendamos sesión de onboarding enfocada en features subutilizadas."
    : score >= 40
    ? "Tenant en zona de atención. Adopción baja sostenida + tickets P2 recurrentes. Riesgo de churn en 90 días estimado en 38%. Activar playbook de rescate inmediatamente."
    : "Tenant crítico. Sin login en 7+ días, impago o churn inminente. Escalar a CSM Director y prepara win-back post-churn.";

  return (
    <div className="rp-glass rounded-xl border border-border/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="rounded-md bg-[var(--rp-violet)]/15 p-1.5">
          <Bot className="h-4 w-4 text-[var(--rp-violet)]" aria-hidden />
        </div>
        <h4 className="text-sm font-medium">Diagnóstico IA</h4>
        <Badge variant="outline" className={cn("text-[10px] ml-auto", band.cls)}>{band.label}</Badge>
      </div>
      <p className="text-xs leading-relaxed text-foreground/80">{diagnosis}</p>
      <Separator className="my-3" />
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-md bg-foreground/[0.04] p-2">
          <div className="text-[9px] uppercase text-muted-foreground font-mono">Riesgo churn 90d</div>
          <div className="font-mono" style={{ color: score >= 80 ? "var(--rp-emerald)" : score >= 60 ? "var(--rp-blue)" : "var(--rp-red)" }}>
            {score >= 80 ? "4%" : score >= 60 ? "12%" : score >= 40 ? "38%" : "82%"}
          </div>
        </div>
        <div className="rounded-md bg-foreground/[0.04] p-2">
          <div className="text-[9px] uppercase text-muted-foreground font-mono">NRR proyectado</div>
          <div className="font-mono" style={{ color }}>{score >= 70 ? "+18%" : score >= 50 ? "+4%" : "-12%"}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="font-mono" style={{ color }}>●</span>
        <span>Modelo: gradient-boosted · 14 features · actualizado hace 2h</span>
      </div>
    </div>
  );
}

/* =========================================================
 * Playbooks
 * =======================================================*/
function Playbooks() {
  const { toast } = useToast();
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--rp-emerald)]" aria-hidden /> Playbooks automáticos
          </h4>
          <p className="text-[11px] text-muted-foreground">Se disparan cuando un tenant cruza un umbral.</p>
        </div>
        <Badge variant="outline" className="text-[10px]">{PLAYBOOKS.length} playbooks</Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PLAYBOOKS.map((pb) => {
          const Icon = pb.icon;
          const color = TONE[pb.tone];
          return (
            <div key={pb.id} className="rp-glass rounded-xl border p-3.5" style={{ borderColor: `color-mix(in oklab, ${color} 35%, transparent)` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-md p-1.5" style={{ background: `color-mix(in oklab, ${color} 18%, transparent)` }}>
                  <Icon className="h-4 w-4" style={{ color }} aria-hidden />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{pb.title}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{pb.trigger}</div>
                </div>
              </div>
              <ol className="space-y-1 mb-2.5">
                {pb.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px]">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-mono shrink-0 mt-0.5" style={{ background: `color-mix(in oklab, ${color} 18%, transparent)`, color }}>
                      {i + 1}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono" style={{ color }}>↑ {pb.expectedLift}</span>
                <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast({ title: "Playbook activado", description: `${pb.title} · 5 pasos encolados.` })}>
                  <Play className="h-3 w-3 mr-1" aria-hidden /> Activar
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
 * CSM portfolio table
 * =======================================================*/
function CsmPortfolio() {
  const { toast } = useToast();
  const [filter, setFilter] = React.useState<"all" | CsmTenant["segment"]>("all");
  const filtered = filter === "all" ? CSM_TENANTS : CSM_TENANTS.filter(t => t.segment === filter);

  const csmStats = React.useMemo(() => {
    const map = new Map<string, { count: number; mrr: number; avg: number }>();
    CSM_TENANTS.forEach(t => {
      const s = map.get(t.csm) || { count: 0, mrr: 0, avg: 0 };
      s.count += 1;
      s.mrr += t.mrr;
      s.avg += t.score;
      map.set(t.csm, s);
    });
    return Array.from(map.entries()).map(([csm, s]) => ({ csm, ...s, avg: Math.round(s.avg / s.count) }));
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-[var(--rp-emerald)]" aria-hidden /> Cartera por CSM
          </h4>
          <p className="text-[11px] text-muted-foreground">{CSM_TENANTS.length} tenants · 3 CSMs · 1 CS Director</p>
        </div>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast({ title: "Exportando cartera", description: "XLSX con health + segmentos." })}>
          <Download className="h-3.5 w-3.5 mr-1" aria-hidden /> XLSX
        </Button>
      </div>

      {/* CSM summary cards */}
      <div className="grid grid-cols-3 gap-2">
        {csmStats.map((s) => (
          <div key={s.csm} className="rp-glass rounded-lg border border-border/60 p-2.5">
            <div className="text-[10px] uppercase text-muted-foreground font-mono">{s.csm}</div>
            <div className="flex items-baseline justify-between">
              <div className="text-base font-display font-medium" style={{ color: scoreColor(s.avg) }}>{s.avg}</div>
              <div className="text-[10px] font-mono text-muted-foreground">{s.count}T · {euro(s.mrr)}</div>
            </div>
            <Progress value={s.avg} className="h-1 mt-1" style={{ ["--progress-foreground" as string]: scoreColor(s.avg) }} />
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-1">
        {(["all", "expansion", "stable", "risk", "churn"] as const).map((s) => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"}
            className={cn("h-7 text-[11px]", filter === s && "bg-foreground text-background")}
            onClick={() => setFilter(s)}>{s === "all" ? "Todos" : s}</Button>
        ))}
      </div>

      {/* Table */}
      <div className="rp-glass rounded-xl border border-border/60 overflow-hidden">
        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full text-xs">
            <thead className="bg-foreground/[0.03] text-left text-muted-foreground">
              <tr className="border-b border-border/40">
                <th className="py-2 px-3 font-medium">Tenant</th>
                <th className="py-2 px-2 font-medium">CSM</th>
                <th className="py-2 px-2 font-medium">Segmento</th>
                <th className="py-2 px-2 font-medium text-right">MRR</th>
                <th className="py-2 px-2 font-medium">Health</th>
                <th className="py-2 px-2 font-medium">Trend</th>
                <th className="py-2 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const seg = SEGMENTS.find(s => s.id === t.segment)!;
                const color = scoreColor(t.score);
                const TrendIcon = t.trend === "up" ? TrendingUp : t.trend === "down" ? AlertTriangle : ChevronRight;
                return (
                  <tr key={t.id} className="border-b border-border/30 hover:bg-foreground/[0.02]">
                    <td className="py-2 px-3 font-medium">{t.tenant}</td>
                    <td className="py-2 px-2 text-muted-foreground">{t.csm}</td>
                    <td className="py-2 px-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono" style={{ color: seg.color }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: seg.color }} aria-hidden /> {seg.label}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right font-mono">{t.mrr > 0 ? euro(t.mrr) : "—"}</td>
                    <td className="py-2 px-2">
                      <span className="font-mono" style={{ color }}>{t.score}</span>
                    </td>
                    <td className="py-2 px-2">
                      <TrendIcon className={cn("h-3.5 w-3.5", t.trend === "up" ? "text-[var(--rp-emerald)]" : t.trend === "down" ? "text-[var(--rp-red)]" : "text-muted-foreground")} aria-hidden />
                    </td>
                    <td className="py-2 px-2 text-right">
                      <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => toast({ title: "Abriendo tenant", description: t.tenant })}>
                        Ver <ArrowRight className="h-3 w-3 ml-0.5" aria-hidden />
                      </Button>
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
 * Churn vs expansion donut
 * =======================================================*/
function ChurnExpansionDonut() {
  const segments = [
    { label: "Expansion", value: 5215, color: "var(--rp-emerald)" },
    { label: "Stable", value: 3172, color: "var(--rp-blue)" },
    { label: "Atención", value: 843, color: "var(--rp-yellow)" },
    { label: "Churned", value: 1960, color: "var(--rp-red)" },
  ];
  const total = segments.reduce((s, x) => s + x.value, 0);
  const size = 180;
  const r = size / 2 - 14;
  const cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="rp-glass rounded-xl border border-border/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <HeartPulse className="h-4 w-4 text-[var(--rp-red)]" aria-hidden />
        <h4 className="text-sm font-medium">Churn vs expansión · MRR</h4>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative shrink-0">
          <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Churn vs expansion donut">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeOpacity="0.06" strokeWidth="14" />
            {segments.map((s) => {
              const pct = s.value / total;
              const dash = pct * circumference;
              const el = (
                <circle
                  key={s.label}
                  cx={cx} cy={cy} r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="14"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                  transform={`rotate(-90 ${cx} ${cy})`}
                />
              );
              offset += dash;
              return el;
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-[10px] text-muted-foreground font-mono">Net</div>
            <div className="text-lg font-display font-medium text-[var(--rp-emerald)]">+{euro(5215 - 1960)}</div>
          </div>
        </div>
        <div className="flex-1 min-w-[180px] space-y-1.5">
          {segments.map((s) => {
            const pct = ((s.value / total) * 100).toFixed(1);
            return (
              <div key={s.label} className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} aria-hidden />
                <span className="flex-1">{s.label}</span>
                <span className="font-mono text-muted-foreground">{pct}%</span>
                <span className="font-mono w-16 text-right" style={{ color: s.color }}>{euro(s.value)}</span>
              </div>
            );
          })}
        </div>
      </div>
      <Separator className="my-3" />
      <div className="text-[11px] text-muted-foreground">
        Net revenue retention <span className="font-mono text-[var(--rp-emerald)]">+118%</span> · churn mensual <span className="font-mono text-[var(--rp-red)]">2.1%</span>.
      </div>
    </div>
  );
}

/* =========================================================
 * Main view
 * =======================================================*/
export function HealthScoreView() {
  const [tab, setTab] = React.useState("overview");
  const score = 78; // example score

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[var(--rp-emerald)]/15 p-2">
            <HeartPulse className="h-5 w-5 text-[var(--rp-emerald)]" aria-hidden />
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-medium tracking-tight">Health Score</h2>
            <p className="text-xs text-muted-foreground">Score 0-100 combinando uso, adopción, soporte y resultado de negocio.</p>
          </div>
        </div>
        <Badge variant="outline" className="border-[var(--rp-blue)]/40 text-[var(--rp-blue)] text-[10px]">
          <Bot className="h-3 w-3 mr-1" aria-hidden /> Modelo IA · 14 features
        </Badge>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full justify-start overflow-x-auto rp-scroll-thin h-9">
          <TabsTrigger value="overview" className="text-xs"><HeartPulse className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Overview</TabsTrigger>
          <TabsTrigger value="playbooks" className="text-xs"><Sparkles className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Playbooks</TabsTrigger>
          <TabsTrigger value="portfolio" className="text-xs"><Users className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Cartera CSM</TabsTrigger>
          <TabsTrigger value="segments" className="text-xs"><TrendingUp className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Segmentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rp-glass rounded-xl border border-border/60 p-5 flex flex-col items-center">
              <HealthDial score={score} />
              <Separator className="my-4 w-full" />
              <div className="grid grid-cols-2 gap-2 w-full text-xs">
                <div className="rounded-md bg-foreground/[0.04] p-2">
                  <div className="text-[10px] uppercase text-muted-foreground font-mono">vs mes anterior</div>
                  <div className="font-mono text-[var(--rp-emerald)]">+4 pts</div>
                </div>
                <div className="rounded-md bg-foreground/[0.04] p-2">
                  <div className="text-[10px] uppercase text-muted-foreground font-mono">vs cohort</div>
                  <div className="font-mono text-[var(--rp-blue)]">+8 pts</div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Dimensions />
              <AiDiagnosis score={score} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="playbooks" className="mt-4">
          <Playbooks />
        </TabsContent>

        <TabsContent value="portfolio" className="mt-4">
          <CsmPortfolio />
        </TabsContent>

        <TabsContent value="segments" className="mt-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {SEGMENTS.map((s) => (
                <div key={s.id} className="rp-glass rounded-xl border p-3" style={{ borderColor: `color-mix(in oklab, ${s.color} 35%, transparent)` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-2 w-2 rounded-full" style={{ background: s.color }} aria-hidden />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{s.label}</span>
                  </div>
                  <div className="text-2xl font-display font-medium" style={{ color: s.color }}>{s.count}</div>
                  <div className="text-[10px] text-muted-foreground">{s.count} tenants · {euro(s.mrr)}</div>
                </div>
              ))}
            </div>
            <ChurnExpansionDonut />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default HealthScoreView;
