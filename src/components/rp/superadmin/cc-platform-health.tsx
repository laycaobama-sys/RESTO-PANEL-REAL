"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Server, Database, HardDrive, Zap, ListOrdered, Box, BrainCircuit, Mail,
  MessageCircle, CreditCard, Search, Shield, Activity, CheckCircle2, AlertTriangle,
  RefreshCw, TrendingUp, ChevronRight, XCircle, Clock,
} from "lucide-react";

/* ---------------- shared bits ---------------- */


type ServiceStatus = "operational" | "degraded" | "outage";

function StatusDot({ status, withPulse = false }: { status: ServiceStatus; withPulse?: boolean }) {
  const color =
    status === "operational" ? "bg-emerald-400"
    : status === "degraded" ? "bg-amber-400"
    : "bg-rose-400";
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      {withPulse && status !== "operational" && (
        <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", color)} />
      )}
      <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", color)} />
    </span>
  );
}

function StatusLabel({ status }: { status: ServiceStatus }) {
  const map = {
    operational: { label: "Operacional", cls: "text-emerald-300" },
    degraded: { label: "Degradado", cls: "text-amber-300" },
    outage: { label: "Caída", cls: "text-rose-300" },
  }[status];
  return <span className={cn("text-xs font-medium", map.cls)}>{map.label}</span>;
}

/* ---------------- types ---------------- */
interface ServiceMetric {
  label: string;
  value: string;
  tone?: "default" | "warn" | "ok" | "gold" | "teal";
}
interface ServiceEvent {
  at: string;
  severity: "info" | "warn" | "critical";
  message: string;
}
interface Service {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  status: ServiceStatus;
  uptime: string;          // "99.97%"
  uptimeDisclaimer: boolean;
  slo: number;             // 99.9
  sloActual: number;       // 99.97
  lastIncident: string;    // "hace 3 días" or "Sin incidentes (30 días)"
  metrics: ServiceMetric[];
  // detail dialog content
  latency: { p50: number; p95: number; p99: number };
  errorRate: number;
  dependencies: string[];
  events: ServiceEvent[];
  uptime90d: ServiceStatus[]; // length 90
}

/* ---------------- generate 90-day uptime ---------------- */
function genUptime(seed: number, degradedDays = 2, outageDays = 0): ServiceStatus[] {
  const days: ServiceStatus[] = [];
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i < 90; i++) {
    const r = rand();
    if (r < outageDays / 90) days.push("outage");
    else if (r < (outageDays + degradedDays) / 90) days.push("degraded");
    else days.push("operational");
  }
  return days;
}

/* ---------------- 12 services ---------------- */
const SERVICES: Service[] = [
  {
    id: "api-workers",
    name: "API (Workers)",
    icon: Server,
    status: "operational",
    uptime: "99.97%",
    uptimeDisclaimer: true,
    slo: 99.9,
    sloActual: 99.97,
    lastIncident: "hace 3 días",
    metrics: [
      { label: "p50", value: "42ms" },
      { label: "p95", value: "89ms" },
      { label: "p99", value: "156ms", tone: "warn" },
      { label: "Error rate", value: "0.03%", tone: "ok" },
      { label: "Req/día", value: "2.4M", tone: "teal" },
    ],
    latency: { p50: 42, p95: 89, p99: 156 },
    errorRate: 0.03,
    dependencies: ["D1", "KV", "R2"],
    events: [
      { at: "hace 3 días", severity: "warn", message: "Pico de latencia p99 en eu-west (210ms) durante 8 min" },
      { at: "hace 6 días", severity: "info", message: "Deploy v2.41.0 — sin rollback" },
      { at: "hace 12 días", severity: "info", message: "Escalado automático a 24 instancias" },
    ],
    uptime90d: genUptime(11, 2, 0),
  },
  {
    id: "d1",
    name: "D1",
    icon: Database,
    status: "operational",
    uptime: "99.99%",
    uptimeDisclaimer: true,
    slo: 99.95,
    sloActual: 99.99,
    lastIncident: "Sin incidentes (30 días)",
    metrics: [
      { label: "Uso", value: "412MB" },
      { label: "Reads/min", value: "12k", tone: "teal" },
      { label: "Writes/min", value: "340" },
      { label: "Errores", value: "0", tone: "ok" },
    ],
    latency: { p50: 4, p95: 12, p99: 28 },
    errorRate: 0,
    dependencies: ["Workers"],
    events: [
      { at: "hace 5 días", severity: "info", message: "Migración schema 0042 aplicada" },
      { at: "hace 18 días", severity: "info", message: "Backup automático completado" },
    ],
    uptime90d: genUptime(23, 0, 0),
  },
  {
    id: "r2",
    name: "R2",
    icon: HardDrive,
    status: "operational",
    uptime: "100%",
    uptimeDisclaimer: true,
    slo: 99.9,
    sloActual: 100,
    lastIncident: "Sin incidentes (30 días)",
    metrics: [
      { label: "Uso", value: "8.2GB" },
      { label: "PUTs/min", value: "1.2k" },
      { label: "GETs/min", value: "4.8k", tone: "teal" },
      { label: "Errores", value: "0", tone: "ok" },
    ],
    latency: { p50: 18, p95: 64, p99: 142 },
    errorRate: 0,
    dependencies: [],
    events: [
      { at: "hace 2 días", severity: "info", message: "Lifecycle policy aplicada a bucket temporal" },
    ],
    uptime90d: genUptime(31, 0, 0),
  },
  {
    id: "kv",
    name: "KV",
    icon: Zap,
    status: "operational",
    uptime: "99.98%",
    uptimeDisclaimer: true,
    slo: 99.9,
    sloActual: 99.98,
    lastIncident: "hace 9 días",
    metrics: [
      { label: "Ops/día", value: "1.2M", tone: "teal" },
      { label: "p50", value: "3ms" },
      { label: "Cache hit", value: "94%", tone: "ok" },
      { label: "Errores", value: "0", tone: "ok" },
    ],
    latency: { p50: 3, p95: 9, p99: 22 },
    errorRate: 0.01,
    dependencies: ["Workers"],
    events: [
      { at: "hace 9 días", severity: "warn", message: "Cache hit cayó a 87% durante 14 min" },
    ],
    uptime90d: genUptime(41, 1, 0),
  },
  {
    id: "queues",
    name: "Queues",
    icon: ListOrdered,
    status: "degraded",
    uptime: "99.82%",
    uptimeDisclaimer: true,
    slo: 99.9,
    sloActual: 99.82,
    lastIncident: "ahora",
    metrics: [
      { label: "Activas", value: "4" },
      { label: "Delayed", value: "23", tone: "warn" },
      { label: "DLQ", value: "0", tone: "ok" },
      { label: "Throughput", value: "89 msg/s", tone: "teal" },
    ],
    latency: { p50: 38, p95: 240, p99: 1820 },
    errorRate: 0.4,
    dependencies: ["Workers", "D1"],
    events: [
      { at: "hace 8 min", severity: "warn", message: "Throughput por debajo del baseline (89 msg/s vs 240 esperados)" },
      { at: "hace 22 min", severity: "warn", message: "23 mensajes delayed en cola notification-fanout" },
      { at: "hace 1 h", severity: "info", message: "Auto-escalado de consumers activado" },
    ],
    uptime90d: genUptime(53, 5, 1),
  },
  {
    id: "durable-objects",
    name: "Durable Objects",
    icon: Box,
    status: "operational",
    uptime: "99.96%",
    uptimeDisclaimer: true,
    slo: 99.9,
    sloActual: 99.96,
    lastIncident: "hace 14 días",
    metrics: [
      { label: "Activos", value: "47", tone: "teal" },
      { label: "Hibernando", value: "12" },
      { label: "Errores", value: "0", tone: "ok" },
    ],
    latency: { p50: 8, p95: 28, p99: 96 },
    errorRate: 0,
    dependencies: ["Workers"],
    events: [
      { at: "hace 14 días", severity: "info", message: "Reinicio graceful tras deploy" },
    ],
    uptime90d: genUptime(67, 2, 0),
  },
  {
    id: "ai-gateway",
    name: "AI Gateway",
    icon: BrainCircuit,
    status: "operational",
    uptime: "99.91%",
    uptimeDisclaimer: true,
    slo: 99.5,
    sloActual: 99.91,
    lastIncident: "hace 2 días",
    metrics: [
      { label: "Req/día", value: "1.8k", tone: "teal" },
      { label: "p50", value: "340ms" },
      { label: "Fallbacks", value: "2", tone: "warn" },
      { label: "Coste/día", value: "€12.40", tone: "gold" },
    ],
    latency: { p50: 340, p95: 980, p99: 2400 },
    errorRate: 0.2,
    dependencies: ["Workers", "Vectorize"],
    events: [
      { at: "hace 2 días", severity: "warn", message: "Fallback a modelo secundario (2 veces en 1 h)" },
      { at: "hace 7 días", severity: "info", message: "Rate-limit ajustado a 200 req/min por org" },
    ],
    uptime90d: genUptime(71, 3, 0),
  },
  {
    id: "email-resend",
    name: "Email (Resend)",
    icon: Mail,
    status: "operational",
    uptime: "99.94%",
    uptimeDisclaimer: true,
    slo: 99.0,
    sloActual: 99.94,
    lastIncident: "hace 4 días",
    metrics: [
      { label: "Enviados", value: "320", tone: "teal" },
      { label: "Bounces", value: "0", tone: "ok" },
      { label: "Delivery", value: "94%", tone: "ok" },
    ],
    latency: { p50: 420, p95: 1400, p99: 4200 },
    errorRate: 0,
    dependencies: ["Workers", "Queues"],
    events: [
      { at: "hace 4 días", severity: "info", message: "Dominio verificado DKIM/SPF" },
    ],
    uptime90d: genUptime(83, 1, 0),
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: MessageCircle,
    status: "operational",
    uptime: "99.88%",
    uptimeDisclaimer: true,
    slo: 99.0,
    sloActual: 99.88,
    lastIncident: "hace 6 días",
    metrics: [
      { label: "Enviados", value: "89", tone: "teal" },
      { label: "Fallidos", value: "0", tone: "ok" },
      { label: "Delivery", value: "91%", tone: "ok" },
    ],
    latency: { p50: 580, p95: 2200, p99: 6800 },
    errorRate: 0,
    dependencies: ["Workers"],
    events: [
      { at: "hace 6 días", severity: "info", message: "Template re-aprobado por Meta" },
    ],
    uptime90d: genUptime(97, 2, 0),
  },
  {
    id: "stripe-webhooks",
    name: "Stripe webhooks",
    icon: CreditCard,
    status: "operational",
    uptime: "100%",
    uptimeDisclaimer: true,
    slo: 99.9,
    sloActual: 100,
    lastIncident: "Sin incidentes (30 días)",
    metrics: [
      { label: "Recibidos", value: "47", tone: "teal" },
      { label: "Duplicados", value: "0", tone: "ok" },
      { label: "Fallos", value: "0", tone: "ok" },
    ],
    latency: { p50: 92, p95: 240, p99: 580 },
    errorRate: 0,
    dependencies: ["Workers", "D1"],
    events: [
      { at: "hace 11 días", severity: "info", message: "Endpoint signature verificado" },
    ],
    uptime90d: genUptime(103, 0, 0),
  },
  {
    id: "vectorize",
    name: "Búsqueda (Vectorize)",
    icon: Search,
    status: "operational",
    uptime: "99.93%",
    uptimeDisclaimer: true,
    slo: 99.5,
    sloActual: 99.93,
    lastIncident: "hace 5 días",
    metrics: [
      { label: "Queries", value: "1.2k", tone: "teal" },
      { label: "p50", value: "28ms" },
      { label: "Errores", value: "0", tone: "ok" },
    ],
    latency: { p50: 28, p95: 84, p99: 210 },
    errorRate: 0,
    dependencies: ["Workers", "AI Gateway"],
    events: [
      { at: "hace 5 días", severity: "info", message: "Reindexado completo (1.2M vectores)" },
    ],
    uptime90d: genUptime(113, 1, 0),
  },
  {
    id: "turnstile",
    name: "Turnstile",
    icon: Shield,
    status: "operational",
    uptime: "99.99%",
    uptimeDisclaimer: true,
    slo: 99.9,
    sloActual: 99.99,
    lastIncident: "Sin incidentes (30 días)",
    metrics: [
      { label: "Challenges", value: "4.2k", tone: "teal" },
      { label: "Bypass", value: "0", tone: "ok" },
      { label: "Pass rate", value: "99.8%", tone: "ok" },
    ],
    latency: { p50: 120, p95: 420, p99: 980 },
    errorRate: 0,
    dependencies: ["Workers"],
    events: [
      { at: "hace 8 días", severity: "info", message: "Widget actualizado a v2" },
    ],
    uptime90d: genUptime(127, 0, 0),
  },
];

/* ---------------- helpers ---------------- */
function fmtPct(n: number) { return `${n.toFixed(2)}%`; }

function statusColor(s: ServiceStatus) {
  return s === "operational" ? "#10b981" : s === "degraded" ? "#f59e0b" : "#f43f5e";
}

function metricTone(tone?: ServiceMetric["tone"]) {
  switch (tone) {
    case "ok": return "text-emerald-300";
    case "warn": return "text-amber-300";
    case "gold": return "rp-gold-text";
    case "teal": return "rp-teal-text";
    default: return "text-foreground";
  }
}

/* ---------------- Uptime squares (90d) ---------------- */
function UptimeSquares({ days, compact = false }: { days: ServiceStatus[]; compact?: boolean }) {
  const [hover, setHover] = React.useState<number | null>(null);
  return (
    <div className="relative">
      <div
        className={cn(
          "grid grid-flow-col auto-cols-fr gap-[2px] overflow-x-auto rp-scroll-thin",
          compact ? "grid-rows-3" : "grid-rows-9"
        )}
        role="img"
        aria-label="Disponibilidad últimos 90 días"
      >
        {days.map((d, i) => (
          <div
            key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            tabIndex={0}
            className={cn(
              "h-2.5 w-2.5 rounded-[2px] transition-transform hover:scale-125 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold)]/60",
              compact ? "sm:h-3 sm:w-3" : "sm:h-3.5 sm:w-3.5"
            )}
            style={{ background: statusColor(d), opacity: hover === i ? 1 : 0.85 }}
            title={`Día ${i + 1}: ${d === "operational" ? "Operacional" : d === "degraded" ? "Degradado" : "Caída"}`}
          />
        ))}
      </div>
      {hover !== null && (
        <div className="absolute z-20 -top-9 left-1/2 -translate-x-1/2 rounded-md border border-border/60 bg-popover px-2 py-1 text-[10px] font-mono text-popover-foreground shadow-lg whitespace-nowrap pointer-events-none">
          hace {90 - hover} días · {days[hover] === "operational" ? "OK" : days[hover] === "degraded" ? "Degradado" : "Caída"}
        </div>
      )}
    </div>
  );
}

/* ---------------- SLO progress bar ---------------- */
function SloBar({ actual, target }: { actual: number; target: number }) {
  // visualize actual vs target on a 99-100 scale
  const lo = 98.5;
  const hi = 100;
  const pct = (v: number) => Math.max(0, Math.min(100, ((v - lo) / (hi - lo)) * 100));
  const ok = actual >= target;
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] font-mono mb-1">
        <span className="text-muted-foreground">SLO: {target.toFixed(1)}%</span>
        <span className={ok ? "text-emerald-300" : "text-rose-300"}>{fmtPct(actual)}</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-foreground/10 overflow-hidden">
        <div
          className={cn("absolute inset-y-0 left-0 rounded-full", ok ? "bg-emerald-400" : "bg-rose-400")}
          style={{ width: `${pct(actual)}%` }}
        />
        {/* target marker */}
        <div
          className="absolute inset-y-0 w-px bg-[var(--gold)]"
          style={{ left: `${pct(target)}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}

/* ---------------- Latency mini chart ---------------- */
function LatencyChart({ p50, p95, p99 }: { p50: number; p95: number; p99: number }) {
  const max = Math.max(p99 * 1.15, 1);
  const bars = [
    { label: "p50", value: p50, color: "#3DD6C9" },
    { label: "p95", value: p95, color: "#E8C766" },
    { label: "p99", value: p99, color: "#f43f5e" },
  ];
  return (
    <div className="space-y-2">
      {bars.map((b) => (
        <div key={b.label} className="flex items-center gap-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground w-8">{b.label}</span>
          <div className="flex-1 h-2 rounded-full bg-foreground/8 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(b.value / max) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: b.color }}
            />
          </div>
          <span className="text-xs font-mono w-14 text-right">{b.value}ms</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Error rate chart ---------------- */
function ErrorRateChart({ rate }: { rate: number }) {
  // simulate 24h error rate sparkline
  const pts = React.useMemo(() => {
    // deterministic pseudo-random based on index (no mutation)
    const hash = (i: number) => {
      const x = Math.sin(i * 12.9898 + rate * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };
    return Array.from({ length: 24 }, (_, i) => {
      const r = hash(i);
      const base = rate + (r - 0.5) * rate * 1.5;
      const spike = (i === 14 || i === 18) ? rate * 3 : 0;
      return Math.max(0, base + spike);
    });
  }, [rate]);
  const max = Math.max(...pts, rate * 1.5, 0.1);
  const w = 240, h = 48;
  const path = pts.map((p, i) => {
    const x = (i / (pts.length - 1)) * w;
    const y = h - (p / max) * h;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill="url(#errGrad)" />
        <path d={path} fill="none" stroke="#f43f5e" strokeWidth="1.5" />
      </svg>
      <div className="flex justify-between text-[9px] font-mono text-muted-foreground mt-1">
        <span>hace 24h</span>
        <span>actual: {rate.toFixed(2)}%</span>
        <span>ahora</span>
      </div>
    </div>
  );
}

/* ---------------- Service card ---------------- */
function ServiceCard({ service, onOpen }: { service: Service; onOpen: () => void }) {
  const Icon = service.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "rp-glass rounded-xl p-4 flex flex-col gap-3",
        service.status === "degraded" && "ring-1 ring-amber-400/30",
        service.status === "outage" && "ring-1 ring-rose-400/40"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={cn(
            "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border",
            service.status === "operational" ? "bg-emerald-400/8 border-emerald-400/20 text-emerald-300"
            : service.status === "degraded" ? "bg-amber-400/8 border-amber-400/20 text-amber-300"
            : "bg-rose-400/8 border-rose-400/20 text-rose-300"
          )}>
            <Icon className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{service.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <StatusDot status={service.status} withPulse />
              <StatusLabel status={service.status} />
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] shrink-0" onClick={onOpen}>
          Ver detalles
          <ChevronRight className="h-3 w-3 ml-0.5" aria-hidden />
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {service.metrics.map((m) => (
          <div key={m.label} className="rounded-md bg-foreground/[0.03] border border-border/30 px-2.5 py-1.5">
            <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">{m.label}</div>
            <div className={cn("text-sm font-mono mt-0.5", metricTone(m.tone))}>{m.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-[11px]">
        <span className="font-mono text-muted-foreground">
          Uptime <span className="rp-gold-text">{service.uptime}</span>
          {service.uptimeDisclaimer && <span className="text-muted-foreground/70"> (dato demo)</span>}
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" aria-hidden />
          {service.lastIncident}
        </span>
      </div>

      <SloBar actual={service.sloActual} target={service.slo} />
    </motion.div>
  );
}

/* ---------------- Detail dialog ---------------- */
function ServiceDetailDialog({ service, open, onOpenChange }: {
  service: Service | null; open: boolean; onOpenChange: (v: boolean) => void;
}) {
  if (!service) return null;
  const Icon = service.icon;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-xl border-border/60">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <div className={cn(
              "h-8 w-8 rounded-md flex items-center justify-center border",
              service.status === "operational" ? "bg-emerald-400/8 border-emerald-400/20 text-emerald-300"
              : service.status === "degraded" ? "bg-amber-400/8 border-amber-400/20 text-amber-300"
              : "bg-rose-400/8 border-rose-400/20 text-rose-300"
            )}>
              <Icon className="h-4 w-4" aria-hidden />
            </div>
            <span>{service.name}</span>
            
          </DialogTitle>
          <DialogDescription>
            Estado en tiempo real (dato demo) · SLO {service.slo}% · actual {fmtPct(service.sloActual)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 max-h-[70vh] overflow-y-auto rp-scroll-thin pr-1">
          {/* 90-day uptime */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Disponibilidad · 90 días
              </h4>
              <span className="text-xs font-mono rp-gold-text">{service.uptime} (demo)</span>
            </div>
            <UptimeSquares days={service.uptime90d} />
            <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-[2px] bg-emerald-400" /> Operacional</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-[2px] bg-amber-400" /> Degradado</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-[2px] bg-rose-400" /> Caída</span>
            </div>
          </section>

          {/* Latency */}
          <section>
            <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
              Latencia (ms)
            </h4>
            <LatencyChart p50={service.latency.p50} p95={service.latency.p95} p99={service.latency.p99} />
          </section>

          {/* Error rate */}
          <section>
            <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
              Tasa de error · 24h
            </h4>
            <ErrorRateChart rate={service.errorRate} />
          </section>

          {/* Dependencies */}
          <section>
            <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
              Dependencias
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {service.dependencies.length === 0 && (
                <span className="text-xs text-muted-foreground">Sin dependencias</span>
              )}
              {service.dependencies.map((d) => (
                <span key={d} className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-foreground/[0.03] px-2 py-0.5 text-[11px] font-mono">
                  <Box className="h-3 w-3 text-muted-foreground" aria-hidden />
                  {d}
                </span>
              ))}
            </div>
          </section>

          {/* Recent events */}
          <section>
            <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
              Eventos recientes
            </h4>
            <ul className="space-y-2">
              {service.events.map((e, i) => (
                <li key={i} className="flex items-start gap-2.5 rounded-md border border-border/30 bg-foreground/[0.02] p-2.5">
                  <span className={cn(
                    "mt-1 h-2 w-2 rounded-full shrink-0",
                    e.severity === "info" ? "bg-[var(--teal)]"
                    : e.severity === "warn" ? "bg-amber-400"
                    : "bg-rose-400"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-foreground/90">{e.message}</div>
                    <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{e.at}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cerrar</Button>
          <Button variant="default" size="sm" className="bg-amber-500/90 hover:bg-amber-500 text-amber-950">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" aria-hidden />
            Forzar health check
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Main export ---------------- */
export function CcPlatformHealth() {
  const { toast } = useToast();
  const [selected, setSelected] = React.useState<Service | null>(null);
  const [open, setOpen] = React.useState(false);
  const [lastUpdate, setLastUpdate] = React.useState("hace 12 s");

  const operational = SERVICES.filter((s) => s.status === "operational").length;
  const degraded = SERVICES.filter((s) => s.status === "degraded").length;
  const outage = SERVICES.filter((s) => s.status === "outage").length;
  const overallStatus = outage > 0 ? "outage" : degraded > 0 ? "degraded" : "operational";

  // global uptime = average of all service actuals
  const globalUptime = SERVICES.reduce((acc, s) => acc + s.sloActual, 0) / SERVICES.length;

  // global 90-day chart = combine into a single representative series (any degraded day = degraded)
  const global90d = React.useMemo(() => {
    const out: ServiceStatus[] = [];
    for (let i = 0; i < 90; i++) {
      let has = "operational" as ServiceStatus;
      for (const s of SERVICES) {
        if (s.uptime90d[i] === "outage") { has = "outage"; break; }
        if (s.uptime90d[i] === "degraded") has = "degraded";
      }
      out.push(has);
    }
    return out;
  }, []);

  const handleOpen = (s: Service) => {
    setSelected(s);
    setOpen(true);
  };

  const handleRefresh = () => {
    setLastUpdate("ahora");
    toast({
      title: "Health checks re-ejecutados",
      description: "12 servicios sondados · todos los datos demo",
    });
  };

  return (
    <section aria-label="Salud de la plataforma" className="space-y-4">
      {/* Summary header */}
      <div className="rp-glass-strong rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              "h-11 w-11 rounded-xl flex items-center justify-center border shrink-0",
              overallStatus === "operational" ? "bg-emerald-400/10 border-emerald-400/25 text-emerald-300"
              : overallStatus === "degraded" ? "bg-amber-400/10 border-amber-400/25 text-amber-300"
              : "bg-rose-400/10 border-rose-400/25 text-rose-300"
            )}>
              {overallStatus === "operational" ? <CheckCircle2 className="h-5 w-5" aria-hidden />
                : <AlertTriangle className="h-5 w-5" aria-hidden />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg sm:text-xl font-medium tracking-tight">Salud de la plataforma</h3>
                
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {overallStatus === "operational"
                  ? "Todos los sistemas operacionales"
                  : overallStatus === "degraded"
                  ? `${degraded} servicio degradado · ${operational} operacionales`
                  : `${outage} caída · ${degraded} degradado · ${operational} operacional(es)`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="rounded-lg border border-border/40 bg-foreground/[0.03] px-3 py-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Uptime global</div>
              <div className="font-display text-xl font-light rp-gold-text">
                {fmtPct(globalUptime)} <span className="text-[10px] text-muted-foreground/70 font-mono">(demo)</span>
              </div>
            </div>
            <div className="rounded-lg border border-border/40 bg-foreground/[0.03] px-3 py-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Servicios</div>
              <div className="font-mono text-sm mt-0.5">
                <span className="text-emerald-300">{operational}</span>
                <span className="text-muted-foreground"> / </span>
                <span className="text-amber-300">{degraded}</span>
                <span className="text-muted-foreground"> / </span>
                <span className="text-rose-300">{outage}</span>
              </div>
            </div>
            <div className="rounded-lg border border-border/40 bg-foreground/[0.03] px-3 py-2 flex flex-col">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Actualizado</div>
              <div className="flex items-center gap-1.5 text-xs font-mono mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--teal)] opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--teal)]" />
                </span>
                <span className="text-[var(--teal)]">Tiempo real</span>
                <span className="text-muted-foreground">· {lastUpdate}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="h-9">
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" aria-hidden />
              Refrescar
            </Button>
          </div>
        </div>

        {/* 90-day uptime chart */}
        <div className="mt-5 pt-5 border-t border-border/40">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Disponibilidad global · últimos 90 días
            </h4>
            <span className="text-[10px] font-mono text-muted-foreground">dato demo · simulado</span>
          </div>
          <UptimeSquares days={global90d} />
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 text-[10px] font-mono text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-[2px] bg-emerald-400" /> Operacional</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-[2px] bg-amber-400" /> Degradado</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-[2px] bg-rose-400" /> Caída</span>
            </div>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3 text-emerald-300" aria-hidden />
              Tendencia estable
            </span>
          </div>
        </div>
      </div>

      {/* Service cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {SERVICES.map((s) => (
          <ServiceCard key={s.id} service={s} onOpen={() => handleOpen(s)} />
        ))}
      </div>

      {/* Footer disclaimer */}
      <div className="text-[11px] font-mono text-muted-foreground text-center pt-2 flex items-center justify-center gap-2">
        <XCircle className="h-3 w-3" aria-hidden />
        Todos los datos son simulados con fines demostrativos · no representan métricas reales de producción
      </div>

      <ServiceDetailDialog service={selected} open={open} onOpenChange={setOpen} />
    </section>
  );
}
