"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Globe2, Activity, ShieldCheck, ServerCog, Gauge, Zap, AlertTriangle,
  CheckCircle2, CircleDot, ArrowRight, ArrowRightLeft, Radio, Cpu,
  Database, Cloud, HardDrive, Layers, Mail, MessageCircle, Webhook,
  Brain, ShieldCheck as Shield, Workflow, ChevronDown, ChevronRight,
  Play, Loader2, FileWarning, TrendingUp, TrendingDown, Sparkles,
  Clock, CalendarClock, MapPin, Wifi, Server, Boxes, Network,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";

/* ============================================================
   Types & demo data
============================================================ */

type DotStatus = "healthy" | "degraded" | "down";
type RegionStatus = "active-active" | "failover" | "down";

interface WorldDot {
  id: string;
  city: string;
  region: string;
  continent: "Europa" | "América Norte" | "América Sur" | "Asia-Pacífico" | "Oceanía" | "África";
  x: number; // 0..1000
  y: number; // 0..500
  status: DotStatus;
  trafficPct: number; // 0..100 — drives dot size
  p50: number; // ms
  p95: number; // ms
  reqPerMin: number;
}

const DOTS: WorldDot[] = [
  // Europe (5)
  { id: "mad", city: "Madrid",       region: "Europa",        continent: "Europa",        x: 485, y: 158, status: "healthy",  trafficPct: 88, p50: 38, p95: 76,  reqPerMin: 96000 },
  { id: "par", city: "París",         region: "Europa",        continent: "Europa",        x: 502, y: 140, status: "healthy",  trafficPct: 76, p50: 41, p95: 82,  reqPerMin: 82000 },
  { id: "fra", city: "Frankfurt",    region: "Europa",        continent: "Europa",        x: 518, y: 134, status: "healthy",  trafficPct: 92, p50: 35, p95: 71,  reqPerMin: 110000 },
  { id: "mil", city: "Milán",        region: "Europa",        continent: "Europa",        x: 522, y: 162, status: "degraded", trafficPct: 54, p50: 62, p95: 184, reqPerMin: 41000 },
  { id: "lon", city: "Londres",      region: "Europa",        continent: "Europa",        x: 488, y: 122, status: "healthy",  trafficPct: 70, p50: 44, p95: 88,  reqPerMin: 78000 },
  // Americas North (3)
  { id: "nyc", city: "Nueva York",   region: "América Norte", continent: "América Norte", x: 280, y: 148, status: "healthy",  trafficPct: 95, p50: 33, p95: 68,  reqPerMin: 145000 },
  { id: "tor", city: "Toronto",      region: "América Norte", continent: "América Norte", x: 268, y: 122, status: "healthy",  trafficPct: 48, p50: 39, p95: 79,  reqPerMin: 32000 },
  { id: "mex", city: "Ciudad México", region: "América Norte", continent: "América Norte", x: 215, y: 188, status: "healthy", trafficPct: 62, p50: 47, p95: 94,  reqPerMin: 54000 },
  // Americas South (3)
  { id: "sao", city: "São Paulo",    region: "América Sur",   continent: "América Sur",   x: 332, y: 312, status: "healthy",  trafficPct: 68, p50: 52, p95: 102, reqPerMin: 61000 },
  { id: "scl", city: "Santiago",      region: "América Sur",   continent: "América Sur",   x: 293, y: 358, status: "healthy",  trafficPct: 36, p50: 58, p95: 118, reqPerMin: 18000 },
  { id: "bue", city: "Buenos Aires",  region: "América Sur",   continent: "América Sur",   x: 305, y: 348, status: "healthy",  trafficPct: 44, p50: 55, p95: 109, reqPerMin: 26000 },
  // Asia-Pacific (5 incl. Middle East)
  { id: "tok", city: "Tokio",         region: "Asia-Pacífico", continent: "Asia-Pacífico", x: 812, y: 162, status: "healthy",  trafficPct: 82, p50: 49, p95: 96,  reqPerMin: 92000 },
  { id: "sin", city: "Singapur",      region: "Asia-Pacífico", continent: "Asia-Pacífico", x: 748, y: 268, status: "healthy",  trafficPct: 74, p50: 46, p95: 92,  reqPerMin: 71000 },
  { id: "mum", city: "Mumbai",        region: "Asia-Pacífico", continent: "Asia-Pacífico", x: 660, y: 198, status: "healthy",  trafficPct: 60, p50: 53, p95: 104, reqPerMin: 48000 },
  { id: "sel", city: "Seúl",          region: "Asia-Pacífico", continent: "Asia-Pacífico", x: 788, y: 145, status: "healthy",  trafficPct: 58, p50: 48, p95: 95,  reqPerMin: 44000 },
  { id: "dxb", city: "Dubái",         region: "Asia-Pacífico", continent: "Asia-Pacífico", x: 612, y: 196, status: "healthy",  trafficPct: 40, p50: 51, p95: 99,  reqPerMin: 22000 },
  // Oceania (2)
  { id: "syd", city: "Sídney",        region: "Oceanía",       continent: "Oceanía",      x: 852, y: 342, status: "healthy",  trafficPct: 52, p50: 64, p95: 124, reqPerMin: 31000 },
  { id: "akl", city: "Auckland",      region: "Oceanía",       continent: "Oceanía",      x: 905, y: 364, status: "healthy",  trafficPct: 22, p50: 71, p95: 138, reqPerMin: 8000 },
  // Africa (2)
  { id: "jnb", city: "Johannesburg",  region: "África",        continent: "África",        x: 548, y: 326, status: "healthy",  trafficPct: 34, p50: 68, p95: 132, reqPerMin: 14000 },
  { id: "los", city: "Lagos",         region: "África",        continent: "África",        x: 498, y: 268, status: "degraded", trafficPct: 28, p50: 74, p95: 198, reqPerMin: 11000 },
];

// Stylized continent silhouettes — loose, not geographic accuracy.
const CONTINENT_PATHS: { id: string; d: string }[] = [
  // North America
  { id: "na", d: "M120 110 L210 78 L290 92 L300 138 L268 168 L240 198 L196 196 L158 178 L128 158 Z" },
  // South America
  { id: "sa", d: "M260 220 L300 218 L330 248 L344 296 L320 360 L286 392 L266 358 L260 312 Z" },
  // Europe
  { id: "eu", d: "M466 102 L520 96 L556 116 L548 156 L520 178 L486 172 L468 144 Z" },
  // Africa
  { id: "af", d: "M470 188 L540 184 L582 212 L588 270 L560 330 L520 346 L492 308 L474 248 Z" },
  // Asia
  { id: "as", d: "M560 92 L700 80 L820 96 L838 150 L802 200 L740 244 L694 232 L648 214 L612 210 L578 178 L564 138 Z" },
  // Oceania
  { id: "oc", d: "M810 322 L860 314 L902 332 L912 360 L868 380 L824 372 L808 348 Z" },
];

// Connection arcs between major hubs (active-active traffic flows)
const CONNECTIONS: [string, string][] = [
  ["nyc", "lon"], ["lon", "fra"], ["fra", "mad"], ["mad", "nyc"],
  ["nyc", "sao"], ["fra", "dxb"], ["dxb", "mum"], ["mum", "sin"],
  ["sin", "tok"], ["tok", "sel"], ["sel", "nyc"], ["sin", "syd"],
  ["jnb", "los"], ["los", "sao"],
];

interface RegionCard {
  name: string;
  status: RegionStatus;
  countries: string[];
  dcCount: number;
  dcLocations: string[];
  reqPerMin: number;
  bandwidthGbps: number;
  p50: number; p95: number; p99: number;
  errorRate: number;
  capacityPct: number;
  utilizationPct: number;
  failoverTarget: string;
}

const REGIONS: RegionCard[] = [
  {
    name: "Europa", status: "active-active",
    countries: ["España", "Francia", "Alemania", "Italia", "Reino Unido", "Portugal", "Países Bajos"],
    dcCount: 5, dcLocations: ["Madrid", "París", "Frankfurt", "Milán", "Londres"],
    reqPerMin: 407000, bandwidthGbps: 184,
    p50: 42, p95: 89, p99: 156, errorRate: 0.04,
    capacityPct: 100, utilizationPct: 71, failoverTarget: "América Norte",
  },
  {
    name: "América Norte", status: "active-active",
    countries: ["EEUU", "Canadá", "México"],
    dcCount: 3, dcLocations: ["Nueva York", "Toronto", "Ciudad México"],
    reqPerMin: 231000, bandwidthGbps: 142,
    p50: 38, p95: 82, p99: 134, errorRate: 0.02,
    capacityPct: 100, utilizationPct: 64, failoverTarget: "Europa",
  },
  {
    name: "América Sur", status: "active-active",
    countries: ["Brasil", "Argentina", "Chile", "Uruguay", "Colombia", "Perú"],
    dcCount: 3, dcLocations: ["São Paulo", "Buenos Aires", "Santiago"],
    reqPerMin: 105000, bandwidthGbps: 68,
    p50: 55, p95: 108, p99: 188, errorRate: 0.06,
    capacityPct: 100, utilizationPct: 52, failoverTarget: "América Norte",
  },
  {
    name: "Asia-Pacífico", status: "active-active",
    countries: ["Japón", "Singapur", "India", "Corea del Sur", "UAE"],
    dcCount: 5, dcLocations: ["Tokio", "Singapur", "Mumbai", "Seúl", "Dubái"],
    reqPerMin: 277000, bandwidthGbps: 158,
    p50: 49, p95: 96, p99: 172, errorRate: 0.05,
    capacityPct: 100, utilizationPct: 69, failoverTarget: "América Norte",
  },
  {
    name: "Oceanía", status: "active-active",
    countries: ["Australia", "Nueva Zelanda"],
    dcCount: 2, dcLocations: ["Sídney", "Auckland"],
    reqPerMin: 39000, bandwidthGbps: 24,
    p50: 67, p95: 128, p99: 214, errorRate: 0.03,
    capacityPct: 100, utilizationPct: 41, failoverTarget: "Asia-Pacífico",
  },
];

interface HealthService {
  id: string;
  name: string;
  icon: React.ElementType;
  status: "operational" | "degraded" | "down";
  uptime: string;
  metrics: string;
  lastIncident: string;
}

const HEALTH_SERVICES: HealthService[] = [
  { id: "api",      name: "API (Workers)",        icon: Cpu,        status: "operational", uptime: "99.97%", metrics: "p50 42ms · p95 89ms", lastIncident: "Hace 12 días" },
  { id: "d1",       name: "D1",                    icon: Database,   status: "operational", uptime: "100%",   metrics: "412MB · 12k reads/min", lastIncident: "Sin incidencias (30d)" },
  { id: "r2",       name: "R2",                    icon: HardDrive,  status: "operational", uptime: "100%",   metrics: "8.2GB almacenados", lastIncident: "Sin incidencias (30d)" },
  { id: "kv",       name: "KV",                    icon: Layers,     status: "operational", uptime: "100%",   metrics: "1.2M ops/día · 94% cache hit", lastIncident: "Sin incidencias (30d)" },
  { id: "queues",   name: "Queues",                icon: Workflow,   status: "degraded",   uptime: "99.95%", metrics: "23 delayed · 0 DLQ", lastIncident: "Hace 4 horas" },
  { id: "do",       name: "Durable Objects",       icon: Boxes,      status: "operational", uptime: "100%",   metrics: "47 active", lastIncident: "Sin incidencias (30d)" },
  { id: "aigw",     name: "AI Gateway",             icon: Brain,      status: "operational", uptime: "99.8%",  metrics: "1.847 req/día · p50 1.1s", lastIncident: "Hace 8 días" },
  { id: "email",    name: "Email (Resend)",        icon: Mail,       status: "operational", uptime: "99.9%",  metrics: "320 sent · 0 bounces", lastIncident: "Hace 5 días" },
  { id: "wa",       name: "WhatsApp",               icon: MessageCircle, status: "operational", uptime: "99.9%",  metrics: "89 sent", lastIncident: "Sin incidencias (30d)" },
  { id: "stripe",   name: "Stripe webhooks",       icon: Webhook,    status: "operational", uptime: "100%",   metrics: "47 received", lastIncident: "Sin incidencias (30d)" },
  { id: "vectorize",name: "Vectorize",              icon: Network,    status: "operational", uptime: "100%",   metrics: "890 queries · p50 28ms", lastIncident: "Sin incidencias (30d)" },
  { id: "turnstile",name: "Turnstile",             icon: Shield,     status: "operational", uptime: "100%",   metrics: "4.2k challenges", lastIncident: "Sin incidencias (30d)" },
];

interface Incident {
  ts: string;
  service: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  duration: string;
}

const INCIDENTS: Incident[] = [
  { ts: "2025-01-22 14:32 CET", service: "Queues", severity: "medium", description: "Retrasos p95 >500ms en cola reservations.confirm — under investigation", status: "monitoring", duration: "4h 12m" },
  { ts: "2025-01-15 09:14 CET", service: "AI Gateway", severity: "low", description: "Timeouts esporádicos en endpoint Llama-3.1-8b — fallback automático activado", status: "resolved", duration: "1h 38m" },
  { ts: "2025-01-10 22:08 CET", service: "Email (Resend)", severity: "low", description: "Aumentó latencia en entregas a Gmail — resuelto por proveedor", status: "resolved", duration: "2h 04m" },
  { ts: "2025-01-03 11:47 CET", service: "API (Workers)", severity: "high", description: "Error rate 1.2% en /reservas POST por 6 min — rollback de deploy aplicado", status: "resolved", duration: "23m" },
];

interface FailoverRow {
  region: string;
  target: string;
  status: "Ready" | "Drilling" | "At Risk";
  lastTest: string;
  switchTime: string;
}

const FAILOVER_MATRIX: FailoverRow[] = [
  { region: "Europa",        target: "América Norte", status: "Ready",    lastTest: "15 ene 2025", switchTime: "3min" },
  { region: "América Norte", target: "Europa",        status: "Ready",    lastTest: "15 ene 2025", switchTime: "4min" },
  { region: "América Sur",   target: "América Norte", status: "Ready",    lastTest: "15 ene 2025", switchTime: "5min" },
  { region: "Asia-Pacífico", target: "América Norte", status: "Ready",    lastTest: "15 ene 2025", switchTime: "6min" },
  { region: "Oceanía",       target: "Asia-Pacífico", status: "Ready",    lastTest: "15 ene 2025", switchTime: "7min" },
];

interface SlaTier {
  name: string;
  uptime: string;
  features: string[];
  accent: "gold" | "teal" | "fg";
}

const SLA_TIERS: SlaTier[] = [
  { name: "Starter",     uptime: "99.5%",  accent: "fg",   features: ["Backups diarios", "Infra compartida", "Monitorización básica"] },
  { name: "Professional",uptime: "99.9%",  accent: "teal", features: ["Backups cada hora", "Prioridad Workers", "Monitorización avanzada"] },
  { name: "Enterprise",  uptime: "99.99%", accent: "gold", features: ["Infra dedicada", "Multi-región activa", "Failover automático", "IA dedicada"] },
];

interface SlaCompliance {
  tier: string;
  actual: string;
  target: string;
  ok: boolean;
}

const SLA_COMPLIANCE: SlaCompliance[] = [
  { tier: "Starter",      actual: "99.52%",  target: "99.5%",  ok: true },
  { tier: "Professional",  actual: "99.91%",  target: "99.9%",  ok: true },
  { tier: "Enterprise",    actual: "99.97%",  target: "99.99%", ok: true },
];

interface SlaHistoryRow {
  month: string;
  tier: string;
  actual: string;
  target: string;
  status: "Met" | "Breached";
  compensation?: string;
}

const SLA_HISTORY: SlaHistoryRow[] = [
  { month: "Ene 2025", tier: "Enterprise",   actual: "99.97%", target: "99.99%", status: "Met" },
  { month: "Dic 2024", tier: "Enterprise",   actual: "99.99%", target: "99.99%", status: "Met" },
  { month: "Dic 2024", tier: "Professional",  actual: "99.86%", target: "99.9%",  status: "Breached", compensation: "Crédito €420" },
  { month: "Nov 2024", tier: "Enterprise",   actual: "100%",   target: "99.99%", status: "Met" },
  { month: "Nov 2024", tier: "Starter",      actual: "99.31%", target: "99.5%",  status: "Breached", compensation: "Crédito €90" },
  { month: "Oct 2024", tier: "Professional",  actual: "99.94%", target: "99.9%",  status: "Met" },
  { month: "Sep 2024", tier: "Enterprise",   actual: "99.99%", target: "99.99%", status: "Met" },
];

/* ============================================================
   Utility helpers
============================================================ */

const STATUS_COLOR: Record<DotStatus, string> = {
  healthy: "#3DD6C9",
  degraded: "#E8C766",
  down: "#ef4444",
};
const STATUS_LABEL: Record<DotStatus, string> = {
  healthy: "Saludable",
  degraded: "Degradado",
  down: "Caído",
};
const REGION_STATUS_COLOR: Record<RegionStatus, string> = {
  "active-active": "#3DD6C9",
  "failover": "#E8C766",
  "down": "#ef4444",
};
const REGION_STATUS_LABEL: Record<RegionStatus, string> = {
  "active-active": "Active-Active",
  "failover": "Failover",
  "down": "Down",
};

function dotRadius(trafficPct: number): number {
  // 4px min → 11px max
  return 4 + (trafficPct / 100) * 7;
}

/* ============================================================
   Main component
============================================================ */

type CloudTab = "mapa" | "regiones" | "health" | "dr" | "sla";

const TABS: { id: CloudTab; label: string; icon: React.ElementType }[] = [
  { id: "mapa",     label: "Mapa Global", icon: Globe2 },
  { id: "regiones", label: "Regiones",    icon: Server },
  { id: "health",   label: "Health",      icon: Activity },
  { id: "dr",        label: "DR",          icon: ShieldCheck },
  { id: "sla",       label: "SLA",         icon: Gauge },
];

export function CloudOpsCenter() {
  const reduceMotion = useReducedMotion();
  const [tab, setTab] = React.useState<CloudTab>("mapa");

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
          {tab === "mapa"     && <MapaGlobal />}
          {tab === "regiones" && <RegionesTab />}
          {tab === "health"   && <HealthTab />}
          {tab === "dr"        && <DrTab />}
          {tab === "sla"       && <SlaTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   Header
============================================================ */

function Header() {
  return (
    <header className="flex items-start justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] flex items-center justify-center text-black ring-1 ring-[var(--gold)]/40 shrink-0">
          <Globe2 className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-xl sm:text-2xl font-medium tracking-tight truncate">
              Cloud Operations Center
            </h1>
            <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-amber-400/40 bg-amber-400/10 text-amber-300">
              demo
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Centro global · 16 regiones activas · health.restopanel.com
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <span className="text-xs font-mono text-emerald-300">99.97% uptime</span>
      </div>
    </header>
  );
}

function Tabs({ tab, setTab }: { tab: CloudTab; setTab: (t: CloudTab) => void }) {
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
   Tab: Mapa Global
============================================================ */

function MapaGlobal() {
  const [selected, setSelected] = React.useState<WorldDot | null>(null);
  const [hover, setHover] = React.useState<{ dot: WorldDot; x: number; y: number } | null>(null);
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-5">
      <WorldMap
        dots={DOTS}
        hover={hover}
        setHover={setHover}
        onSelect={setSelected}
        reduceMotion={!!reduceMotion}
      />
      <GlobalKpis />
      <DotDetailDialog dot={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function WorldMap({
  dots, hover, setHover, onSelect, reduceMotion,
}: {
  dots: WorldDot[];
  hover: { dot: WorldDot; x: number; y: number } | null;
  setHover: (h: { dot: WorldDot; x: number; y: number } | null) => void;
  onSelect: (d: WorldDot) => void;
  reduceMotion: boolean;
}) {
  const W = 1000, H = 500;
  const dotById = React.useMemo(() => {
    const m = new Map<string, WorldDot>();
    dots.forEach((d) => m.set(d.id, d));
    return m;
  }, [dots]);

  // Build quadratic-bezier arcs between connected hubs.
  const arcs = React.useMemo(() => {
    const result: { id: string; d: string }[] = [];
    for (const [a, b] of CONNECTIONS) {
      const da = dotById.get(a), db = dotById.get(b);
      if (!da || !db) continue;
      const mx = (da.x + db.x) / 2;
      const my = (da.y + db.y) / 2;
      // lift midpoint to create arc curvature
      const dx = db.x - da.x;
      const dy = db.y - da.y;
      const len = Math.hypot(dx, dy);
      const lift = Math.min(40, len * 0.18);
      const nx = -dy / (len || 1);
      const ny = dx / (len || 1);
      const cx = mx + nx * lift;
      const cy = my + ny * lift;
      result.push({ id: `${a}-${b}`, d: `M ${da.x} ${da.y} Q ${cx} ${cy} ${db.x} ${db.y}` });
    }
    return result;
  }, [dotById]);

  return (
    <div className="rp-glass rounded-2xl p-3 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[var(--gold)]" aria-hidden />
          <h3 className="font-display text-base sm:text-lg font-medium tracking-tight">
            Mapa global de infraestructura
          </h3>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          <LegendDot color={STATUS_COLOR.healthy}  label="Saludable" />
          <LegendDot color={STATUS_COLOR.degraded} label="Degradado" />
          <LegendDot color={STATUS_COLOR.down}     label="Caído" />
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Mapa global de regiones y data centers de RestoPanel">
          <defs>
            <radialGradient id="rp-co-bg" cx="50%" cy="50%" r="60%">
              <stop offset="0%"  stopColor="#1a1a1f" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0a0a0d" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="rp-co-conn" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#D4AF37" stopOpacity="0" />
              <stop offset="50%"  stopColor="#D4AF37" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#3DD6C9" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* subtle bg glow */}
          <rect x="0" y="0" width={W} height={H} fill="url(#rp-co-bg)" />

          {/* latitude/longitude grid */}
          <g aria-hidden>
            {[100, 200, 300, 400].map((y) => (
              <line key={`h${y}`} x1="0" x2={W} y1={y} y2={y} stroke="color-mix(in oklab, var(--foreground) 5%, transparent)" strokeWidth="0.5" />
            ))}
            {[200, 400, 600, 800].map((x) => (
              <line key={`v${x}`} x1={x} x2={x} y1="0" y2={H} stroke="color-mix(in oklab, var(--foreground) 5%, transparent)" strokeWidth="0.5" />
            ))}
          </g>

          {/* continents */}
          <g aria-hidden>
            {CONTINENT_PATHS.map((c) => (
              <path
                key={c.id}
                d={c.d}
                fill="color-mix(in oklab, var(--foreground) 6%, transparent)"
                stroke="color-mix(in oklab, var(--foreground) 18%, transparent)"
                strokeWidth="0.75"
              />
            ))}
          </g>

          {/* connection arcs */}
          <g aria-hidden>
            {arcs.map((a) => (
              <path
                key={a.id}
                d={a.d}
                fill="none"
                stroke="url(#rp-co-conn)"
                strokeWidth="0.8"
                strokeLinecap="round"
                opacity="0.7"
              >
                {!reduceMotion && (
                  <animate attributeName="stroke-dasharray" values="0,300;300,0;0,300" dur="6s" repeatCount="indefinite" />
                )}
              </path>
            ))}
          </g>

          {/* dots */}
          <g>
            {dots.map((d) => {
              const r = dotRadius(d.trafficPct);
              const color = STATUS_COLOR[d.status];
              return (
                <g key={d.id} className="cursor-pointer" onClick={() => onSelect(d)} role="button" aria-label={`${d.city} — ${STATUS_LABEL[d.status]}`}>
                  {/* pulsing halo */}
                  {!reduceMotion && d.status !== "down" && (
                    <circle cx={d.x} cy={d.y} r={r} fill={color} opacity="0.35">
                      <animate attributeName="r" values={`${r};${r + 5};${r}`} dur="2.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.35;0;0.35" dur="2.4s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    cx={d.x} cy={d.y} r={r}
                    fill={color}
                    stroke="#0a0a0d"
                    strokeWidth="1"
                    onMouseEnter={(e) => {
                      const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                      const x = ((d.x / W) * rect.width);
                      const y = ((d.y / H) * rect.height);
                      setHover({ dot: d, x, y });
                    }}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover({ dot: d, x: d.x, y: d.y })}
                    onBlur={() => setHover(null)}
                    tabIndex={0}
                  />
                  <text x={d.x} y={d.y + r + 9} textAnchor="middle" className="fill-muted-foreground" fontSize="8" style={{ pointerEvents: "none" }}>
                    {d.city}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* hover tooltip */}
        <AnimatePresence>
          {hover && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.12 }}
              className="absolute z-20 rp-glass-strong rounded-lg border border-border/60 p-3 min-w-[180px] pointer-events-none"
              style={{
                left: `min(${hover.x}px, calc(100% - 200px))`,
                top: `min(${hover.y + 16}px, calc(100% - 140px))`,
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLOR[hover.dot.status] }} />
                <span className="text-sm font-medium">{hover.dot.city}</span>
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                {hover.dot.continent}
              </div>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
                <dt className="text-muted-foreground">Estado</dt>
                <dd className="text-right" style={{ color: STATUS_COLOR[hover.dot.status] }}>{STATUS_LABEL[hover.dot.status]}</dd>
                <dt className="text-muted-foreground">p50</dt>
                <dd className="text-right font-mono">{hover.dot.p50}ms</dd>
                <dt className="text-muted-foreground">p95</dt>
                <dd className="text-right font-mono">{hover.dot.p95}ms</dd>
                <dt className="text-muted-foreground">Req/min</dt>
                <dd className="text-right font-mono">{(hover.dot.reqPerMin / 1000).toFixed(0)}k</dd>
              </dl>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">
        20 nodos · 5 continentes · Haz click en un nodo para ver métricas detalladas.
      </p>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function DotDetailDialog({ dot, onClose }: { dot: WorldDot | null; onClose: () => void }) {
  return (
    <Dialog open={!!dot} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg rp-glass-strong">
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[var(--gold)]" aria-hidden />
            {dot?.city ?? "—"}
            {dot && (
              <span
                className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border"
                style={{ color: STATUS_COLOR[dot.status], borderColor: `${STATUS_COLOR[dot.status]}55`, background: `${STATUS_COLOR[dot.status]}15` }}
              >
                {STATUS_LABEL[dot.status]}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {dot ? `Región ${dot.region} · ${dot.continent}` : ""}
          </DialogDescription>
        </DialogHeader>
        {dot && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Metric label="p50" value={`${dot.p50}ms`} />
              <Metric label="p95" value={`${dot.p95}ms`} />
              <Metric label="p99" value={`${Math.round(dot.p95 * 1.6)}ms`} />
              <Metric label="Req/min" value={`${(dot.reqPerMin / 1000).toFixed(0)}k`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Tráfico relativo" value={`${dot.trafficPct}%`} />
              <Metric label="Uptime 30d" value="99.97%" />
            </div>
            <div className="rp-glass rounded-lg p-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                Últimas 24h
              </div>
              <Sparkline data={[dot.reqPerMin * 0.7, dot.reqPerMin * 0.75, dot.reqPerMin * 0.82, dot.reqPerMin * 0.78, dot.reqPerMin * 0.9, dot.reqPerMin * 0.95, dot.reqPerMin]} color={STATUS_COLOR[dot.status]} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rp-glass rounded-lg p-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl font-light">{value}</div>
    </div>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 320, h = 56, pad = 6;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const step = (w - pad * 2) / (data.length - 1);
  const pts = data.map((v, i) => [pad + i * step, h - pad - ((v - min) / range) * (h - pad * 2)] as const);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${path} L ${pts[pts.length - 1][0].toFixed(1)} ${h - pad} L ${pad} ${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label="Tendencia últimas 24h">
      <defs>
        <linearGradient id={`sp-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sp-${color.replace("#", "")})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ============================================================
   Global KPIs (8 cards)
============================================================ */

const GLOBAL_KPIS = [
  { label: "Requests/min global",   value: "847k",     sub: "Últimos 60s",        icon: Activity,     accent: "gold" as const },
  { label: "Latencia p50 global",   value: "42ms",    sub: "P50 del tráfico",     icon: Gauge,       accent: "teal" as const },
  { label: "Latencia p95 global",   value: "89ms",    sub: "P95 del tráfico",     icon: Zap,         accent: "gold" as const },
  { label: "Uptime 30 días",        value: "99.97%",  sub: "Acordado 99.9%",     icon: CheckCircle2,accent: "teal" as const },
  { label: "Regiones activas",      value: "16/16",   sub: "5 continentes",      icon: Globe2,       accent: "gold" as const },
  { label: "Workers activos",       value: "2.4M",    sub: "req/día",            icon: Cpu,         accent: "fg" as const },
  { label: "Incidencias abiertas",  value: "1",       sub: "1 medium · 0 high",  icon: AlertTriangle, accent: "gold" as const },
  { label: "Coste hoy",             value: "€1.842",  sub: "FinOps · vease tab", icon: ServerCog,    accent: "teal" as const },
];

function GlobalKpis() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {GLOBAL_KPIS.map((k) => (
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

/* ============================================================
   Tab: Regiones
============================================================ */

function RegionesTab() {
  const [openDialog, setOpenDialog] = React.useState<RegionCard | null>(null);
  const [routingOpen, setRoutingOpen] = React.useState(true);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {REGIONS.map((r) => (
          <RegionCardView key={r.name} region={r} onOpen={() => setOpenDialog(r)} />
        ))}
      </div>

      <Collapsible open={routingOpen} onOpenChange={setRoutingOpen}>
        <div className="rp-glass rounded-xl overflow-hidden">
          <CollapsibleTrigger asChild>
            <button className="w-full min-h-[44px] flex items-center justify-between gap-2 px-4 py-3 hover:bg-foreground/[0.02] transition-colors">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-[var(--teal)]" aria-hidden />
                <span className="font-display text-base font-medium">Reglas de routing</span>
              </div>
              <ChevronDown className={cn("h-4 w-4 transition-transform", routingOpen && "rotate-180")} aria-hidden />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 pt-1 grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { t: "Routing geográfico", d: "Las peticiones se enrutan a la región sana más cercana (latency-based).", icon: MapPin },
                { t: "Failover", d: "Si región p95 > 500ms por 30s → enruta al failover target configurado.", icon: ArrowRightLeft },
                { t: "Load balancing", d: "Active-Active entre 2+ regiones para organizaciones Enterprise.", icon: Network },
                { t: "Session affinity", d: "Peticiones con cookie de sesión se mantienen en la región de origen.", icon: Wifi },
              ].map((r) => (
                <div key={r.t} className="rounded-lg border border-border/40 bg-foreground/[0.02] p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <r.icon className="h-3.5 w-3.5 text-[var(--gold)]" aria-hidden />
                    <span className="text-sm font-medium">{r.t}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{r.d}</p>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      <RegionDetailDialog region={openDialog} onClose={() => setOpenDialog(null)} />
    </div>
  );
}

function RegionCardView({ region, onOpen }: { region: RegionCard; onOpen: () => void }) {
  const statusColor = REGION_STATUS_COLOR[region.status];
  const utilPct = Math.round((region.utilizationPct / region.capacityPct) * 100);
  const utilColor = utilPct < 60 ? "var(--teal)" : utilPct < 80 ? "var(--gold)" : "#ef4444";

  return (
    <div className="rp-glass rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-medium truncate">{region.name}</h3>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {region.dcCount} data centers · {region.dcLocations.join(", ")}
          </div>
        </div>
        <span
          className="shrink-0 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider"
          style={{ color: statusColor, borderColor: `${statusColor}55`, background: `${statusColor}15` }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor }} />
          {REGION_STATUS_LABEL[region.status]}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {region.countries.slice(0, 5).map((c) => (
          <span key={c} className="inline-flex items-center rounded-md border border-border/40 bg-foreground/[0.03] px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {c}
          </span>
        ))}
        {region.countries.length > 5 && (
          <span className="inline-flex items-center rounded-md border border-border/40 bg-foreground/[0.03] px-1.5 py-0.5 text-[10px] text-muted-foreground">
            +{region.countries.length - 5}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <MiniStat label="Req/min"   value={`${(region.reqPerMin / 1000).toFixed(0)}k`} />
        <MiniStat label="BW"         value={`${region.bandwidthGbps}Gbps`} />
        <MiniStat label="Error rate" value={`${region.errorRate}%`} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <MiniStat label="p50" value={`${region.p50}ms`} />
        <MiniStat label="p95" value={`${region.p95}ms`} />
        <MiniStat label="p99" value={`${region.p99}ms`} />
      </div>

      <div>
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="font-mono uppercase tracking-wider text-muted-foreground">Capacidad</span>
          <span style={{ color: utilColor }}>{utilPct}% utilizado</span>
        </div>
        <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: utilColor }}
            initial={{ width: 0 }}
            animate={{ width: `${utilPct}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <ArrowRight className="h-3 w-3" aria-hidden />
          Failover: <span className="text-foreground/90 font-medium">{region.failoverTarget}</span>
        </div>
        <button
          onClick={onOpen}
          className="min-h-[36px] inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-foreground/[0.02] px-3 py-1.5 text-xs hover:bg-foreground/5 hover:border-[var(--gold)]/40 transition-colors"
        >
          Ver detalle
          <ChevronRight className="h-3 w-3" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-foreground/[0.03] border border-border/40 py-1.5 px-1">
      <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium">{value}</div>
    </div>
  );
}

function RegionDetailDialog({ region, onClose }: { region: RegionCard | null; onClose: () => void }) {
  return (
    <Dialog open={!!region} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rp-scroll-thin rp-glass-strong">
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <Server className="h-4 w-4 text-[var(--gold)]" aria-hidden />
            {region?.name ?? "—"}
          </DialogTitle>
          <DialogDescription>
            Métricas por país, tráfico 24h y log de errores.
          </DialogDescription>
        </DialogHeader>
        {region && (
          <div className="space-y-4">
            {/* Per country metrics */}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                Métricas por país
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {region.countries.map((c, i) => {
                  const reqs = Math.round(region.reqPerMin / region.countries.length * (0.7 + i * 0.18));
                  const p50 = Math.round(region.p50 * (0.85 + i * 0.08));
                  return (
                    <div key={c} className="flex items-center justify-between rounded-md border border-border/40 bg-foreground/[0.02] p-2.5">
                      <span className="text-sm">{c}</span>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
                        <span>{(reqs / 1000).toFixed(0)}k/min</span>
                        <span>p50 {p50}ms</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Traffic chart */}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                Tráfico 24h (req/min)
              </div>
              <Sparkline
                data={Array.from({ length: 24 }, (_, i) => Math.round(region.reqPerMin * (0.6 + Math.sin(i / 3) * 0.18 + (i / 48))))}
                color={REGION_STATUS_COLOR[region.status]}
              />
            </div>

            {/* Error log */}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                Log de errores (24h)
              </div>
              <div className="rounded-lg border border-border/40 bg-foreground/[0.02] divide-y divide-border/30 max-h-48 overflow-y-auto rp-scroll-thin">
                {[
                  { ts: "14:32:08", msg: "GET /reservas/confirm → 504 timeout (Milán → Frankfurt)", sev: "warn" },
                  { ts: "13:18:42", msg: "POST /crm/contacts → 429 rate limit burst", sev: "info" },
                  { ts: "11:02:17", msg: "queue:reservations.confirm DLQ=0 delayed=23", sev: "warn" },
                ].map((e) => (
                  <div key={e.ts} className="flex items-start gap-2 px-3 py-2 text-xs">
                    <span className="font-mono text-muted-foreground shrink-0">{e.ts}</span>
                    <span className={cn("h-1.5 w-1.5 rounded-full mt-1.5 shrink-0", e.sev === "warn" ? "bg-amber-400" : "bg-[var(--teal)]")} />
                    <span className="text-foreground/85">{e.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================
   Tab: Health
============================================================ */

function HealthTab() {
  return (
    <div className="flex flex-col gap-5">
      <PlatformStatus />
      <UptimeGrid />
      <RecentIncidents />
    </div>
  );
}

function PlatformStatus() {
  return (
    <div className="rp-glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[var(--gold)]" aria-hidden />
          <h3 className="font-display text-base sm:text-lg font-medium">Estado de la plataforma</h3>
        </div>
        <a href="#" className="text-[11px] font-mono text-[var(--teal)] hover:underline">
          health.restopanel.com
        </a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {HEALTH_SERVICES.map((s) => (
          <ServiceRow key={s.id} svc={s} />
        ))}
      </div>
    </div>
  );
}

function ServiceRow({ svc }: { svc: HealthService }) {
  const color = svc.status === "operational" ? "#3DD6C9" : svc.status === "degraded" ? "#E8C766" : "#ef4444";
  const Icon = svc.icon;
  return (
    <div className="rounded-xl border border-border/40 bg-foreground/[0.02] p-3 hover:bg-foreground/[0.04] transition-colors">
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
        <span className="text-sm font-medium flex-1 min-w-0 truncate">{svc.name}</span>
        <span className="relative flex h-2 w-2 shrink-0">
          {svc.status !== "down" && (
            <span
              className="absolute inline-flex h-full w-full rounded-full opacity-75 motion-safe:animate-ping"
              style={{ background: color }}
            />
          )}
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: color }} />
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono text-muted-foreground">{svc.uptime}</span>
        <span className="text-[10px] text-muted-foreground">{svc.lastIncident}</span>
      </div>
      <div className="mt-1 text-[11px] text-foreground/80 truncate">{svc.metrics}</div>
      <button className="mt-2 text-[10px] font-mono uppercase tracking-wider text-[var(--gold)] hover:underline">
        Ver historial →
      </button>
    </div>
  );
}

function UptimeGrid() {
  // 90 squares, deterministic distribution: most green, a few amber, one red.
  const days = React.useMemo(() => {
    const out: { uptime: string; status: "ok" | "degraded" | "down"; date: string }[] = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      // mostly ok, day 32 and 64 amber, day 18 down
      let status: "ok" | "degraded" | "down" = "ok";
      let uptime = "100%";
      if (i === 18) { status = "down"; uptime = "92.1%"; }
      else if (i === 32 || i === 64) { status = "degraded"; uptime = "99.4%"; }
      out.push({ uptime, status, date: iso });
    }
    return out;
  }, []);

  const color = (s: "ok" | "degraded" | "down") =>
    s === "ok" ? "#3DD6C9" : s === "degraded" ? "#E8C766" : "#ef4444";

  return (
    <div className="rp-glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-[var(--teal)]" aria-hidden />
          <h3 className="font-display text-base sm:text-lg font-medium">Uptime 90 días</h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          <LegendDot color="#3DD6C9" label="100%" />
          <LegendDot color="#E8C766" label="Degradado" />
          <LegendDot color="#ef4444" label="Caída" />
        </div>
      </div>
      <div className="grid grid-cols-[repeat(30,minmax(0,1fr))] sm:grid-cols-[repeat(45,minmax(0,1fr))] lg:grid-cols-[repeat(90,minmax(0,1fr))] gap-[3px]">
        {days.map((d, i) => (
          <div
            key={i}
            className="aspect-square rounded-sm cursor-pointer transition-transform hover:scale-125"
            style={{ background: color(d.status) }}
            title={`${d.date} · ${d.uptime}`}
            aria-label={`${d.date} uptime ${d.uptime}`}
          />
        ))}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Pasa el cursor sobre cada día para ver uptime · Promedio 90d: 99.94%
      </p>
    </div>
  );
}

function RecentIncidents() {
  const sevColor = (s: Incident["severity"]) =>
    s === "critical" ? "#ef4444" : s === "high" ? "#f97316" : s === "medium" ? "#E8C766" : "#3DD6C9";
  const statusColor = (s: Incident["status"]) =>
    s === "resolved" ? "#3DD6C9" : s === "monitoring" ? "#E8C766" : s === "identified" ? "#3DD6C9" : "#f97316";

  return (
    <div className="rp-glass rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-4 w-4 text-[var(--gold)]" aria-hidden />
        <h3 className="font-display text-base sm:text-lg font-medium">Incidencias recientes</h3>
      </div>
      <div className="space-y-2.5">
        {INCIDENTS.map((inc, i) => (
          <div key={i} className="rounded-lg border border-border/40 bg-foreground/[0.02] p-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: sevColor(inc.severity) }} />
                <span className="text-sm font-medium truncate">{inc.service}</span>
                <span
                  className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border"
                  style={{ color: sevColor(inc.severity), borderColor: `${sevColor(inc.severity)}55`, background: `${sevColor(inc.severity)}15` }}
                >
                  {inc.severity}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3" aria-hidden />
                <span className="font-mono">{inc.ts}</span>
              </div>
            </div>
            <p className="mt-1.5 text-sm text-foreground/85 leading-relaxed">{inc.description}</p>
            <div className="mt-2 flex items-center gap-3 text-[11px]">
              <span className="font-mono text-muted-foreground">Duración: {inc.duration}</span>
              <span
                className="inline-flex items-center gap-1.5 font-mono uppercase tracking-wider"
                style={{ color: statusColor(inc.status) }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor(inc.status) }} />
                {inc.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Tab: DR (Disaster Recovery)
============================================================ */

function DrTab() {
  return (
    <div className="flex flex-col gap-5">
      <DrOverview />
      <FailoverMatrix />
      <FailoverSimulation />
    </div>
  );
}

function DrOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <DrCard label="RPO objetivo" value="<5 minutos" status="actual: 2min ✓" ok />
      <DrCard label="RTO objetivo" value="<15 minutos" status="actual: 8min ✓" ok />
      <DrCard label="Último DR test" value="2025-01-15" status="Passed · Duration 6min" ok />
      <DrCard label="Próximo DR test" value="2025-02-01" status="Programado" />
    </div>
  );
}

function DrCard({ label, value, status, ok }: { label: string; value: string; status: string; ok?: boolean }) {
  return (
    <div className="rp-glass rounded-xl p-4">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1.5 font-display text-lg font-medium">{value}</div>
      <div className={cn("mt-1 text-[11px]", ok ? "text-emerald-300" : "text-muted-foreground")}>{status}</div>
    </div>
  );
}

function FailoverMatrix() {
  return (
    <div className="rp-glass rounded-2xl p-5 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <ArrowRightLeft className="h-4 w-4 text-[var(--teal)]" aria-hidden />
        <h3 className="font-display text-base sm:text-lg font-medium">Matriz de failover</h3>
      </div>
      <div className="overflow-x-auto rp-scroll-thin -mx-2">
        <table className="w-full border-collapse text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border/60">
              {["Región origen", "Failover target", "Estado", "Último test", "Switch time"].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FAILOVER_MATRIX.map((r) => (
              <tr key={r.region} className="border-b border-border/40 last:border-0 hover:bg-foreground/[0.025] transition-colors">
                <td className="px-3 py-3 font-medium">{r.region}</td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center gap-1.5">
                    <ArrowRight className="h-3 w-3 text-[var(--gold)]" aria-hidden />
                    {r.target}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/40 bg-emerald-400/10 text-emerald-300 px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider">
                    <CheckCircle2 className="h-3 w-3" aria-hidden />
                    {r.status}
                  </span>
                </td>
                <td className="px-3 py-3 text-muted-foreground font-mono text-xs">{r.lastTest}</td>
                <td className="px-3 py-3 font-mono text-[var(--teal)]">{r.switchTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FailoverSimulation() {
  const reduceMotion = useReducedMotion();
  const [region, setRegion] = React.useState<string>("Europa");
  const [phase, setPhase] = React.useState<"idle" | "running" | "done">("idle");
  const [result, setResult] = React.useState<string | null>(null);
  const target = FAILOVER_MATRIX.find((r) => r.region === region)?.target ?? "—";

  function start() {
    setPhase("running");
    setResult(null);
    setTimeout(() => {
      const sw = "3min 12s";
      setResult(
        `Simulación completada: Failover ${region} → ${target} en ${sw}. 0 requests perdidas. RTO dentro del objetivo. RPO: 2min.`
      );
      setPhase("done");
    }, 3000);
  }

  function runReal() {
    toast("Failover real requerido", {
      description: "Solo disponible para Super Admin. Se ha registrado el intento en audit log.",
    });
  }

  return (
    <div className="rp-glass rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Play className="h-4 w-4 text-[var(--gold)]" aria-hidden />
        <h3 className="font-display text-base sm:text-lg font-medium">Simulación de failover</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Región a simular
            </label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {FAILOVER_MATRIX.map((r) => (
                <button
                  key={r.region}
                  onClick={() => { setRegion(r.region); setResult(null); setPhase("idle"); }}
                  className={cn(
                    "min-h-[36px] inline-flex items-center rounded-md border px-3 py-1.5 text-xs transition-colors",
                    region === r.region
                      ? "border-[var(--gold)]/50 bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                      : "border-border/60 bg-foreground/[0.02] text-muted-foreground hover:text-foreground hover:border-foreground/30"
                  )}
                >
                  {r.region}
                </button>
              ))}
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Target de failover: <span className="text-foreground/90 font-medium">{target}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={start}
              disabled={phase === "running"}
              className="min-h-[44px] inline-flex items-center gap-2 rounded-md bg-[var(--gold)] text-black px-4 py-2 text-sm font-medium hover:bg-[var(--gold-soft)] transition-colors disabled:opacity-50"
            >
              {phase === "running" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Play className="h-4 w-4" aria-hidden />
              )}
              Iniciar simulación
            </button>
            <button
              onClick={runReal}
              className="min-h-[44px] inline-flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 text-destructive px-4 py-2 text-sm font-medium hover:bg-destructive/20 transition-colors"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden />
              Ejecutar DR test real
            </button>
          </div>
        </div>
        <div className="rounded-xl border border-border/40 bg-foreground/[0.02] p-4 min-h-[180px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {phase === "idle" && (
              <motion.div key="idle" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                <Play className="h-6 w-6 mx-auto text-muted-foreground mb-2" aria-hidden />
                <p className="text-xs text-muted-foreground">
                  Selecciona una región y pulsa <span className="text-foreground/80">Iniciar simulación</span>.
                </p>
              </motion.div>
            )}
            {phase === "running" && (
              <motion.div key="running" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                <Loader2 className="h-6 w-6 mx-auto text-[var(--gold)] animate-spin mb-2" aria-hidden />
                <p className="text-xs text-muted-foreground font-mono">
                  Simulando caída de {region}…
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">Re-routeando tráfico a {target}</p>
              </motion.div>
            )}
            {phase === "done" && result && (
              <motion.div
                key="done"
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <CheckCircle2 className="h-6 w-6 mx-auto text-emerald-400 mb-2" aria-hidden />
                <p className="text-sm text-foreground/90 leading-relaxed">{result}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Tab: SLA
============================================================ */

function SlaTab() {
  return (
    <div className="flex flex-col gap-5">
      <SlaTiers />
      <SlaComplianceView />
      <SlaBreaches />
      <SlaHistoryView />
    </div>
  );
}

function SlaTiers() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Gauge className="h-4 w-4 text-[var(--gold)]" aria-hidden />
        <h3 className="font-display text-base sm:text-lg font-medium">Tiers de SLA</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SLA_TIERS.map((t) => {
          const color = t.accent === "gold" ? "var(--gold)" : t.accent === "teal" ? "var(--teal)" : "var(--foreground)";
          return (
            <div
              key={t.name}
              className={cn("rp-glass rounded-2xl p-5", t.accent === "gold" && "rp-glow-gold", t.accent === "teal" && "rp-glow-teal")}
            >
              <div className="flex items-baseline justify-between gap-2">
                <h4 className="font-display text-lg font-medium">{t.name}</h4>
                <span className="font-display text-2xl font-light" style={{ color }}>{t.uptime}</span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 shrink-0" style={{ color }} aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SlaComplianceView() {
  return (
    <div className="rp-glass rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden />
        <h3 className="font-display text-base sm:text-lg font-medium">Cumplimiento SLA (mes actual)</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SLA_COMPLIANCE.map((c) => (
          <div key={c.tier} className="rounded-xl border border-border/40 bg-foreground/[0.02] p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{c.tier}</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                <CheckCircle2 className="h-3 w-3" aria-hidden />
                within SLA ✓
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-2xl font-light text-[var(--teal)]">{c.actual}</span>
              <span className="text-xs text-muted-foreground">/ {c.target}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlaBreaches() {
  return (
    <div className="rp-glass rounded-2xl p-5 border-l-2 border-emerald-400/40">
      <div className="flex items-center gap-3">
        <Sparkles className="h-4 w-4 text-emerald-300" aria-hidden />
        <div>
          <div className="text-sm font-medium">Sin incumplimientos de SLA este mes</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Los 3 tiers cumplen o superan el uptime acordado · 0 créditos por compensación emitidos.
          </div>
        </div>
      </div>
    </div>
  );
}

function SlaHistoryView() {
  return (
    <div className="rp-glass rounded-2xl p-5 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-[var(--teal)]" aria-hidden />
        <h3 className="font-display text-base sm:text-lg font-medium">Historial de SLA (últimos 6 meses)</h3>
      </div>
      <div className="overflow-x-auto rp-scroll-thin -mx-2">
        <table className="w-full border-collapse text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border/60">
              {["Mes", "Tier", "Uptime real", "Objetivo", "Estado", "Compensación"].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLA_HISTORY.map((r, i) => (
              <tr key={i} className="border-b border-border/40 last:border-0 hover:bg-foreground/[0.025] transition-colors">
                <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{r.month}</td>
                <td className="px-3 py-3">{r.tier}</td>
                <td className="px-3 py-3 font-mono">{r.actual}</td>
                <td className="px-3 py-3 text-muted-foreground font-mono">{r.target}</td>
                <td className="px-3 py-3">
                  {r.status === "Met" ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-300 text-xs font-mono uppercase tracking-wider">
                      <CheckCircle2 className="h-3 w-3" aria-hidden /> Met
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-destructive text-xs font-mono uppercase tracking-wider">
                      <FileWarning className="h-3 w-3" aria-hidden /> Breached
                    </span>
                  )}
                </td>
                <td className="px-3 py-3 text-xs text-muted-foreground">{r.compensation ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
