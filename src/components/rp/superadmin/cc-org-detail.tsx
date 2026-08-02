"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Users,
  CalendarDays,
  DollarSign,
  CreditCard,
  Activity,
  Sparkles,
  Database,
  Cloud,
  Cpu,
  Globe2,
  Server,
  Plug,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Mail,
  MessageCircle,
  Crown,
  Star,
  ChevronRight,
  Info,
  MapPin,
  Clock,
  RefreshCw,
} from "lucide-react";

/* ============================================================
   Tipos
   ============================================================ */

type Plan = "Starter" | "Professional" | "Enterprise";
type OrgStatus = "activa" | "trial" | "pausada";

interface Overview {
  reservasMes: number;
  ingresosMes: number;
  ticketMedio: number;
  ocupacionMedia: number;
  noShowPct: number;
  googleRating: number;
  usoIA: number;
  iaLimit: number;
  storageUsed: number;
  storageLimit: number;
}

interface Activity {
  icon: React.ElementType;
  text: string;
  time: string;
  tone: "neutral" | "positive" | "negative" | "info";
}

interface Locale {
  name: string;
  city: string;
  reservas: number;
  ingresos: number;
  occupancy: number;
  status: "operativo" | "degradado" | "inactivo";
}

interface Usuario {
  name: string;
  email: string;
  role: string;
  lastActive: string;
  status: "active" | "inactive";
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
}

interface Usage {
  label: string;
  used: number;
  limit: number;
  unit: string;
  icon: React.ElementType;
}

interface Channel {
  name: string;
  pct: number;
  color: string;
}

interface Integration {
  name: string;
  status: "connected" | "error" | "pending";
  lastSync: string;
  version: string;
  icon: React.ElementType;
}

interface AuditEntry {
  actor: string;
  action: string;
  resource: string;
  timestamp: string;
  ip: string;
}

interface DemoOrg {
  id: string;
  name: string;
  plan: Plan;
  status: OrgStatus;
  owner: string;
  memberSince: string;
  mrr: number;
  locations: number;
  users: number;
  initials: string;
  country: string;
  accent: "gold" | "teal";
  overview: Overview;
  activity: Activity[];
  locales: Locale[];
  usuarios: Usuario[];
  mrrHistory: number[];
  invoices: Invoice[];
  usage: Usage[];
  reservas30d: number[];
  cancelRate: number;
  noShowRate: number;
  channels: Channel[];
  crm: {
    clientes: number;
    vips: number;
    segmentsActive: number;
    campaignsSent: number;
    nps: number;
  };
  integrations: Integration[];
  audit: AuditEntry[];
}

/* ============================================================
   Shared bits
   ============================================================ */


function StatusBadge({ status }: { status: OrgStatus }) {
  const map = {
    activa: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    trial: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
    pausada: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  };
  const label = status === "activa" ? "Activa" : status === "trial" ? "Trial" : "Pausada";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider", map[status])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", status === "activa" ? "bg-emerald-400" : status === "trial" ? "bg-[var(--teal)]" : "bg-amber-400")} />
      {label}
    </span>
  );
}

function PlanBadge({ plan }: { plan: Plan }) {
  const cls =
    plan === "Enterprise" ? "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]"
    : plan === "Professional" ? "border-[var(--teal)]/30 bg-[var(--teal)]/10 text-[var(--teal)]"
    : "border-border/60 bg-foreground/5 text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider", cls)}>
      {plan === "Enterprise" && <Crown className="h-3 w-3" aria-hidden />}
      {plan}
    </span>
  );
}

function SourceLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
      <Database className="h-2.5 w-2.5" aria-hidden />
      Source: {children}
    </span>
  );
}

function InfoDot({ definition, formula }: { definition: string; formula?: string }) {
  return (
    <span className="relative group inline-flex" tabIndex={0}>
      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-border/60 bg-foreground/5 text-muted-foreground transition-colors hover:border-[var(--gold)]/40 hover:text-[var(--gold)]">
        <Info className="h-2.5 w-2.5" aria-hidden />
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 bottom-full z-30 mb-2 w-56 -translate-x-1/2 rounded-lg border border-border/60 bg-popover/95 p-2.5 text-left opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus:opacity-100"
      >
        <span className="block text-xs leading-relaxed text-foreground/90">{definition}</span>
        {formula && (
          <span className="mt-1.5 block rounded border border-border/40 bg-foreground/[0.04] px-2 py-1 text-[10px] font-mono text-muted-foreground">
            {formula}
          </span>
        )}
      </span>
    </span>
  );
}

function TabSourceFooter({ children, updated }: { children: React.ReactNode; updated: string }) {
  return (
    <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-muted-foreground/70">
      <SourceLabel>{children}</SourceLabel>
      <span>Actualizado {updated}</span>
    </div>
  );
}

function EmptyState({ icon: Icon, title, hint }: { icon: React.ElementType; title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-foreground/[0.02] px-6 py-12 text-center">
      <div className="h-10 w-10 rounded-full border border-border/60 bg-foreground/5 flex items-center justify-center text-muted-foreground">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <h4 className="mt-3 text-sm font-medium text-foreground/80">{title}</h4>
      <p className="mt-1 text-xs text-muted-foreground max-w-xs">{hint}</p>
    </div>
  );
}

function LoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-lg" />
      ))}
    </div>
  );
}

/* ============================================================
   Mini SVG charts
   ============================================================ */

function MiniLineChart({
  values,
  color = "var(--gold)",
  height = 80,
}: {
  values: number[];
  color?: string;
  height?: number;
}) {
  if (!values.length) return null;
  const W = 320, H = height, pad = 6;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = (W - pad * 2) / (values.length - 1);
  const pts = values.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (1 - (v - min) / range) * (H - pad * 2);
    return [x, y] as const;
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`;
  const id = `mini-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <div className="overflow-x-auto rp-scroll-thin">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto min-w-[280px]" role="img" aria-label="Evolución de MRR">
        <defs>
          <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${id})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="1.8" fill="var(--background)" stroke={color} strokeWidth="1.2">
            <title>{`Mes ${i + 1}: ${values[i].toLocaleString("es-ES")}€`}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}

function MiniBarChart({ values, color = "var(--teal)", height = 100 }: { values: number[]; color?: string; height?: number }) {
  if (!values.length) return null;
  const W = 320, H = height, pad = 6;
  const max = Math.max(...values) || 1;
  const barW = (W - pad * 2) / values.length - 1.5;
  return (
    <div className="overflow-x-auto rp-scroll-thin">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto min-w-[280px]" role="img" aria-label="Reservas últimos 30 días">
        {values.map((v, i) => {
          const h = (v / max) * (H - pad * 2);
          const x = pad + i * ((W - pad * 2) / values.length);
          const y = H - pad - h;
          return (
            <rect key={i} x={x} y={y} width={barW} height={h} rx="1" fill={color} fillOpacity={0.4 + (v / max) * 0.6}>
              <title>{`Día ${i + 1}: ${v} reservas`}</title>
            </rect>
          );
        })}
      </svg>
    </div>
  );
}

function DonutChart({ segments, size = 140 }: { segments: Channel[]; size?: number }) {
  const total = segments.reduce((a, s) => a + s.pct, 0) || 1;
  const radius = size / 2 - 8;
  const cx = size / 2, cy = size / 2;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0" role="img" aria-label="Distribución de canales de reserva">
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth={strokeWidth} />
      {segments.map((s, i) => {
        const len = (s.pct / total) * circumference;
        const dasharray = `${len} ${circumference - len}`;
        const cumulativeOffset = segments
          .slice(0, i)
          .reduce((acc, prev) => acc + (prev.pct / total) * circumference, 0);
        const dashoffset = -cumulativeOffset;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth={strokeWidth}
            strokeDasharray={dasharray}
            strokeDashoffset={dashoffset}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="butt"
          >
            <title>{`${s.name}: ${s.pct}%`}</title>
          </circle>
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity="0.5" fontFamily="var(--font-jetbrains)">canales</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="16" fill="currentColor" fontFamily="var(--font-fraunces)">{total}%</text>
    </svg>
  );
}

function ProgressBar({ used, limit, color = "var(--gold)" }: { used: number; limit: number; color?: string }) {
  const pct = Math.min(100, (used / limit) * 100);
  const tone = pct >= 90 ? "#fb7185" : pct >= 75 ? "var(--gold)" : "var(--teal)";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/8">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: tone }} />
    </div>
  );
}

/* ============================================================
   Datos demo
   ============================================================ */

const LOCALE_NAMES = ["Centro", "Norte", "Sur", "Costa", "Aeropuerto", "Marina", "Histórico", "Plaza Mayor", "Rambla", "Gótico", "Ensanche", "Salón Principal"];
const LOCALE_CITIES = ["Madrid", "Barcelona", "Valencia", "Sevilla", "Málaga", "Marbella", "Bilbao", "Zaragoza", "Lisboa", "Oporto", "Mallorca", "Ibiza"];

function makeLocales(seed: number, count: number): Locale[] {
  return Array.from({ length: count }, (_, i) => {
    const idx = (seed + i) % LOCALE_NAMES.length;
    const reservas = 220 + ((seed * 7 + i * 13) % 380);
    return {
      name: `${LOCALE_NAMES[idx]} ${i + 1}`,
      city: LOCALE_CITIES[(seed + i * 3) % LOCALE_CITIES.length],
      reservas,
      ingresos: Math.round(reservas * (38 + ((seed + i) % 28))),
      occupancy: 62 + ((seed * 3 + i * 11) % 32),
      status: (i + seed) % 9 === 0 ? "degradado" : "operativo",
    };
  });
}

function makeUsuarios(seed: number, count: number): Usuario[] {
  const names = ["Lucía García", "Marcos Ruiz", "Elena Vidal", "Pablo Cano", "Carmen Soto", "Diego Marín", "Andrea Peña", "Javier Lloret", "Nuria Cabo", "Hugo Pons"];
  const roles = ["Owner", "Admin", "Manager", "Host", "Manager", "Host", "Marketing", "Admin", "Host", "Owner"];
  return Array.from({ length: count }, (_, i) => {
    const idx = (seed + i) % names.length;
    const inactive = (seed + i) % 7 === 0;
    const first = names[idx].split(" ")[0].toLowerCase();
    const last = names[idx].split(" ")[1].toLowerCase();
    return {
      name: names[idx],
      email: `${first}.${last}@restopanel.io`,
      role: roles[idx],
      lastActive: inactive ? "hace 18 días" : ["hace 2 min", "hace 14 min", "hace 1 h", "hace 3 h", "ayer"][(seed + i) % 5],
      status: inactive ? "inactive" as const : "active" as const,
    };
  });
}

function makeMrrHistory(base: number, seed: number): number[] {
  return Array.from({ length: 12 }, (_, i) => {
    const growth = 1 + i * 0.018 + (seed % 3) * 0.005;
    const noise = 1 + (((seed * 7 + i * 13) % 11) - 5) / 200;
    return Math.round((base / 1.25) * growth * noise);
  });
}

function makeInvoices(base: number, seed: number): Invoice[] {
  const months = ["Sep 2025", "Oct 2025", "Nov 2025", "Dic 2025", "Ene 2026"];
  return months.map((m, i) => ({
    id: `INV-2026-${String(2231 + seed * 10 + i).padStart(4, "0")}`,
    date: m,
    amount: Math.round(base * (1 + (((seed + i) % 5) - 2) / 50)),
    status: (i + seed) % 7 === 6 ? "failed" as const : i === months.length - 1 && seed % 2 === 0 ? "pending" as const : "paid" as const,
  }));
}

function makeUsage(plan: Plan): Usage[] {
  const base = plan === "Enterprise" ? 1 : plan === "Professional" ? 0.5 : 0.2;
  return [
    { label: "Reservas", used: Math.round(3840 * base), limit: Math.round(5000 * base) + 5000, unit: "/mes", icon: CalendarDays },
    { label: "Emails", used: Math.round(2140 * base), limit: Math.round(5000 * base) + 5000, unit: "/mes", icon: Mail },
    { label: "WhatsApps", used: Math.round(680 * base), limit: Math.round(1500 * base) + 1500, unit: "/mes", icon: MessageCircle },
    { label: "Créditos IA", used: Math.round(18420 * base), limit: Math.round(25000 * base) + 10000, unit: "cr", icon: Sparkles },
  ];
}

function makeReservas30d(seed: number, base: number): number[] {
  return Array.from({ length: 30 }, (_, i) => {
    const weekend = (i + seed) % 7 >= 5;
    const peak = weekend ? 1.4 : 1;
    const noise = 0.7 + (((seed * 5 + i * 3) % 11) / 11) * 0.6;
    return Math.round(base * peak * noise);
  });
}

const CHANNELS: Channel[] = [
  { name: "Widget web", pct: 42, color: "var(--gold)" },
  { name: "Google Reserve", pct: 23, color: "var(--teal)" },
  { name: "WhatsApp", pct: 18, color: "#a78bfa" },
  { name: "Teléfono", pct: 11, color: "#fb7185" },
  { name: "Walk-in", pct: 6, color: "#fbbf24" },
];

function makeIntegrations(seed: number): Integration[] {
  const all: Omit<Integration, "status" | "lastSync">[] = [
    { name: "Stripe", version: "v2024-11-20", icon: CreditCard },
    { name: "WhatsApp Business", version: "v18.0", icon: MessageCircle },
    { name: "Google Business", version: "v4.9", icon: Globe2 },
    { name: "Mailchimp", version: "v3.0", icon: Mail },
    { name: "Metau00e2u0084u00a2 Instagram", version: "v21.0", icon: Star },
    { name: "Cloudflare R2", version: "v1.0", icon: Cloud },
  ];
  return all.map((it, i) => {
    const rng = (seed * 3 + i * 7) % 11;
    const status: Integration["status"] = rng === 0 ? "error" : rng === 1 ? "pending" : "connected";
    return {
      ...it,
      status,
      lastSync: status === "connected" ? `hace ${(seed + i) % 9 + 1} min` : status === "pending" ? "pendiente" : `hace ${(seed + i) % 30 + 5} min`,
    };
  });
}

function makeAudit(orgName: string, seed: number): AuditEntry[] {
  const actors = ["lucia.garcia", "marcos.ruiz", "system", "elena.vidal", "system", "pablo.cano", "system"];
  const actions = [
    { action: "UPDATE", resource: "config/reservas" },
    { action: "LOGIN", resource: "auth/session" },
    { action: "CREATE", resource: "crm/segment" },
    { action: "EXPORT", resource: "crm/clientes.csv" },
    { action: "UPDATE", resource: "billing/plan" },
    { action: "DELETE", resource: "users/invitations" },
    { action: "WEBHOOK", resource: "stripe/invoice.paid" },
    { action: "UPDATE", resource: "locales/madrid/horarios" },
  ];
  const ts = ["hace 4 min", "hace 18 min", "hace 1 h", "hace 2 h", "hace 3 h", "hace 5 h", "ayer 22:14", "ayer 18:42"];
  return actions.map((a, i) => ({
    actor: actors[(seed + i) % actors.length],
    action: a.action,
    resource: a.resource,
    timestamp: ts[(seed + i) % ts.length],
    ip: `85.${(seed * 3 + i * 7) % 240}.${(seed + i) % 240}.${(seed * 11 + i * 5) % 240}`,
  }));
}

function makeActivity(orgName: string, seed: number): Activity[] {
  const items: Omit<Activity, "icon">[] = [
    { text: `${orgName} completó 47 reservas hoy`, time: "hace 12 min", tone: "positive" },
    { text: "Factura INV-2026-2231 marcada como pagada", time: "hace 1 h", tone: "positive" },
    { text: "Nuevo segmento CRM «Clientes VIP freq.» creado", time: "hace 3 h", tone: "info" },
    { text: "Campaña WhatsApp entregada a 320 destinatarios", time: "hace 5 h", tone: "neutral" },
    { text: "Error de sincronización con Mailchimp resuelto", time: "ayer 22:14", tone: "negative" },
  ];
  const icons = [CalendarDays, CreditCard, Users, MessageCircle, AlertTriangle];
  return items.map((it, i) => ({ ...it, icon: icons[(seed + i) % icons.length] }));
}

/* Orquestador de generación por org */
function buildOrg(
  id: string,
  name: string,
  plan: Plan,
  status: OrgStatus,
  owner: string,
  memberSince: string,
  mrr: number,
  locations: number,
  users: number,
  initials: string,
  country: string,
  accent: "gold" | "teal",
  seed: number,
  overview: Overview,
  crm: DemoOrg["crm"]
): DemoOrg {
  return {
    id, name, plan, status, owner, memberSince, mrr, locations, users, initials, country, accent,
    overview,
    activity: makeActivity(name, seed),
    locales: makeLocales(seed, locations),
    usuarios: makeUsuarios(seed, Math.min(users, 8)),
    mrrHistory: makeMrrHistory(mrr, seed),
    invoices: makeInvoices(mrr, seed),
    usage: makeUsage(plan),
    reservas30d: makeReservas30d(seed, Math.round(overview.reservasMes / 30)),
    cancelRate: 4 + (seed % 4),
    noShowRate: 2 + (seed % 5),
    channels: CHANNELS.map((c, i) => ({ ...c, pct: Math.max(2, c.pct + ((seed + i) % 7) - 3) })),
    crm,
    integrations: makeIntegrations(seed),
    audit: makeAudit(name, seed),
  };
}

const ORGS: DemoOrg[] = [
  buildOrg("o1", "Ramses Group", "Enterprise", "activa", "Karim Ramses", "Mar 2023", 1490, 6, 24, "RG", "ES", "gold", 1,
    { reservasMes: 3892, ingresosMes: 42840, ticketMedio: 38, ocupacionMedia: 84, noShowPct: 3.2, googleRating: 4.7, usoIA: 18420, iaLimit: 25000, storageUsed: 1.4, storageLimit: 10 },
    { clientes: 3840, vips: 142, segmentsActive: 12, campaignsSent: 8, nps: 68 }
  ),
  buildOrg("o2", "Sushi Bar Tokyo", "Enterprise", "activa", "Hiroshi Tanaka", "Jun 2023", 2235, 12, 38, "ST", "ES", "teal", 2,
    { reservasMes: 4821, ingresosMes: 61200, ticketMedio: 52, ocupacionMedia: 89, noShowPct: 2.4, googleRating: 4.8, usoIA: 14870, iaLimit: 25000, storageUsed: 2.8, storageLimit: 10 },
    { clientes: 6120, vips: 218, segmentsActive: 18, campaignsSent: 14, nps: 74 }
  ),
  buildOrg("o3", "La Tagliatella", "Professional", "activa", "Sofia Ricci", "Sep 2023", 447, 3, 12, "LT", "ES", "gold", 3,
    { reservasMes: 1842, ingresosMes: 19800, ticketMedio: 28, ocupacionMedia: 76, noShowPct: 4.1, googleRating: 4.4, usoIA: 6940, iaLimit: 15000, storageUsed: 0.6, storageLimit: 5 },
    { clientes: 2110, vips: 64, segmentsActive: 8, campaignsSent: 5, nps: 58 }
  ),
  buildOrg("o4", "Beach Club Marbella", "Professional", "activa", "Andrés Márquez", "May 2024", 745, 5, 18, "BM", "ES", "teal", 4,
    { reservasMes: 2310, ingresosMes: 38600, ticketMedio: 64, ocupacionMedia: 91, noShowPct: 5.8, googleRating: 4.6, usoIA: 8920, iaLimit: 15000, storageUsed: 1.1, storageLimit: 5 },
    { clientes: 3050, vips: 98, segmentsActive: 10, campaignsSent: 7, nps: 62 }
  ),
  buildOrg("o5", "Hotel Andalucía", "Enterprise", "activa", "Carmen Vargas", "Ene 2024", 1840, 9, 28, "HA", "ES", "gold", 5,
    { reservasMes: 3540, ingresosMes: 54200, ticketMedio: 48, ocupacionMedia: 82, noShowPct: 2.9, googleRating: 4.7, usoIA: 16280, iaLimit: 25000, storageUsed: 2.2, storageLimit: 10 },
    { clientes: 4890, vips: 176, segmentsActive: 15, campaignsSent: 11, nps: 71 }
  ),
  buildOrg("o6", "Grupo Gastrolateral", "Professional", "trial", "Marcos Lima", "Feb 2026", 0, 2, 6, "GG", "ES", "teal", 6,
    { reservasMes: 612, ingresosMes: 5400, ticketMedio: 32, ocupacionMedia: 58, noShowPct: 6.4, googleRating: 4.2, usoIA: 1240, iaLimit: 5000, storageUsed: 0.2, storageLimit: 2 },
    { clientes: 480, vips: 12, segmentsActive: 3, campaignsSent: 1, nps: 42 }
  ),
];

/* ============================================================
   Header card
   ============================================================ */

function OrgHeaderCard({ org }: { org: DemoOrg }) {
  const accentBorder = org.accent === "gold" ? "border-[var(--gold)]/30" : "border-[var(--teal)]/30";
  const gradient =
    org.accent === "gold"
      ? "from-[var(--gold)]/30 to-[var(--gold-deep)]/15"
      : "from-[var(--teal)]/30 to-[var(--teal-deep)]/15";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn("rp-glass rounded-2xl p-4 sm:p-5 border-l-2", accentBorder)}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className={cn("h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-xl border bg-gradient-to-br flex items-center justify-center font-display text-lg sm:text-xl font-medium", accentBorder, gradient, org.accent === "gold" ? "text-[var(--gold-soft)]" : "text-[var(--teal)]")}>
          {org.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl sm:text-2xl font-light tracking-tight truncate">{org.name}</h2>
            <PlanBadge plan={org.plan} />
            <StatusBadge status={org.status} />
            
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" aria-hidden />
              {org.owner}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden />
              Miembro desde {org.memberSince}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" aria-hidden />
              {org.country}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 sm:text-right">
          <div className="rounded-lg border border-border/50 bg-foreground/[0.03] px-3 py-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">MRR</div>
            <div className="font-display text-lg sm:text-xl font-light rp-gold-text">{org.mrr.toLocaleString("es-ES")}€</div>
          </div>
          <div className="rounded-lg border border-border/50 bg-foreground/[0.03] px-3 py-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Locales</div>
            <div className="font-display text-lg sm:text-xl font-light">{org.locations}</div>
          </div>
          <div className="rounded-lg border border-border/50 bg-foreground/[0.03] px-3 py-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Usuarios</div>
            <div className="font-display text-lg sm:text-xl font-light">{org.users}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   Tabs
   ============================================================ */

function OverviewTab({ org }: { org: DemoOrg }) {
  const o = org.overview;
  const metrics = [
    { label: "Reservas mes", value: o.reservasMes.toLocaleString("es-ES"), tone: "neutral" as const, def: "Total de reservas creadas en el mes en curso.", spark: [180, 220, 240, 280, 310, 350, o.reservasMes / 10] },
    { label: "Ingresos mes", value: `${o.ingresosMes.toLocaleString("es-ES")}€`, tone: "positive" as const, def: "Ingresos totales del mes en curso.", spark: [22, 26, 28, 32, 35, 38, o.ingresosMes / 1000] },
    { label: "Ticket medio", value: `${o.ticketMedio}€`, tone: "neutral" as const, def: "Ticket medio por reserva completada.", spark: [28, 30, 32, 34, 36, 37, o.ticketMedio] },
    { label: "Ocupación media", value: `${o.ocupacionMedia}%`, tone: "positive" as const, def: "Porcentaje medio de ocupación de mesas por servicio.", spark: [60, 65, 70, 75, 78, 82, o.ocupacionMedia] },
    { label: "No-shows", value: `${o.noShowPct}%`, tone: "negative" as const, def: "Porcentaje de reservas donde el cliente no se presentó.", spark: [6.5, 6.0, 5.5, 5.0, 4.5, 4.0, o.noShowPct] },
    { label: "Google rating", value: `${o.googleRating}★`, tone: "positive" as const, def: "Puntuación media en Google Business.", spark: [4.2, 4.3, 4.4, 4.5, 4.5, 4.6, o.googleRating] },
    { label: "Uso IA", value: `${(o.usoIA / 1000).toFixed(1)}K cr`, tone: "neutral" as const, def: "Créditos de IA consumidos en el mes actual.", spark: [8, 10, 12, 14, 16, 17, o.usoIA / 1000] },
    { label: "Storage usado", value: `${o.storageUsed}GB`, tone: "neutral" as const, def: "Almacenamiento R2 utilizado.", spark: [0.5, 0.7, 0.9, 1.1, 1.2, 1.3, o.storageUsed] },
  ];
  const toneColor = (t: "positive" | "negative" | "neutral") =>
    t === "positive" ? "text-emerald-300" : t === "negative" ? "text-rose-300" : "rp-gold-text";

  return (
    <div className="space-y-5 overflow-x-hidden">
      {/* Summary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="rp-glass rounded-xl p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{m.label}</div>
              <InfoDot definition={m.def} />
            </div>
            <div className={cn("mt-1.5 font-display text-xl sm:text-2xl font-light", toneColor(m.tone))}>{m.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Activity feed */}
        <div className="rp-glass rounded-xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-medium">Actividad reciente</h4>
            
          </div>
          <ul className="space-y-2.5 max-h-72 overflow-y-auto rp-scroll-thin pr-1">
            {org.activity.map((a, i) => {
              const Icon = a.icon;
              const tone =
                a.tone === "positive" ? "text-emerald-300 bg-emerald-400/10"
                : a.tone === "negative" ? "text-rose-300 bg-rose-400/10"
                : a.tone === "info" ? "text-[var(--teal)] bg-[var(--teal)]/10"
                : "text-muted-foreground bg-foreground/5";
              return (
                <li key={i} className="flex items-start gap-2.5 rounded-lg border border-border/40 bg-foreground/[0.02] p-2.5">
                  <div className={cn("mt-0.5 h-6 w-6 shrink-0 rounded-md flex items-center justify-center", tone)}>
                    <Icon className="h-3 w-3" aria-hidden />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground/85 leading-snug">{a.text}</p>
                    <span className="text-[10px] font-mono text-muted-foreground/70">{a.time}</span>
                  </div>
                </li>
              );
            })}
          </ul>
          <TabSourceFooter updated="hace 4 min">D1 · activity_log</TabSourceFooter>
        </div>

        {/* Active integrations status */}
        <div className="rp-glass rounded-xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-medium">Integraciones activas</h4>
            
          </div>
          <ul className="space-y-1.5 max-h-72 overflow-y-auto rp-scroll-thin pr-1">
            {org.integrations.slice(0, 6).map((it) => {
              const Icon = it.icon;
              const tone =
                it.status === "connected" ? { dot: "bg-emerald-400", text: "text-emerald-300", label: "Conectado" }
                : it.status === "pending" ? { dot: "bg-amber-400", text: "text-amber-300", label: "Pendiente" }
                : { dot: "bg-rose-400", text: "text-rose-300", label: "Error" };
              return (
                <li key={it.name} className="flex items-center justify-between gap-2 rounded-lg border border-border/40 bg-foreground/[0.02] px-3 py-2 min-h-[44px]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden />
                    <span className="text-xs text-foreground/85 truncate">{it.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-muted-foreground/70">{it.version}</span>
                    <span className={cn("inline-flex items-center gap-1.5 text-[11px]", tone.text)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
                      {tone.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
          <TabSourceFooter updated="hace 8 min">D1 · integrations</TabSourceFooter>
        </div>
      </div>
    </div>
  );
}

function LocalesTab({ org }: { org: DemoOrg }) {
  if (!org.locales.length) {
    return <EmptyState icon={Building2} title="Sin locales" hint="Esta organización todavía no ha configurado ningún local." />;
  }
  return (
    <div className="rp-glass rounded-xl overflow-hidden">
      <div className="overflow-x-auto rp-scroll-thin">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-foreground/[0.03]">
              {["Local", "Ciudad", "Reservas/mes", "Ingresos", "Ocupación", "Estado", ""].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {org.locales.map((l) => (
              <tr key={l.name} className="border-b border-border/40 last:border-0 transition-colors hover:bg-foreground/[0.04] cursor-pointer min-h-[44px]">
                <td className="px-4 py-3 font-medium text-foreground/90">{l.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.city}</td>
                <td className="px-4 py-3 text-right font-mono">{l.reservas.toLocaleString("es-ES")}</td>
                <td className="px-4 py-3 text-right font-mono rp-gold-text">{l.ingresos.toLocaleString("es-ES")}€</td>
                <td className="px-4 py-3 text-right font-mono">{l.occupancy}%</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center gap-1.5 text-xs",
                    l.status === "operativo" ? "text-emerald-300" : l.status === "degradado" ? "text-amber-300" : "text-rose-300")}>
                    <span className={cn("h-1.5 w-1.5 rounded-full",
                      l.status === "operativo" ? "bg-emerald-400" : l.status === "degradado" ? "bg-amber-400" : "bg-rose-400")} />
                    {l.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <ChevronRight className="h-4 w-4 text-muted-foreground inline" aria-hidden />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TabSourceFooter updated="hace 30 s">Workers · reservas (casi tiempo real)</TabSourceFooter>
    </div>
  );
}

function UsuariosTab({ org }: { org: DemoOrg }) {
  if (!org.usuarios.length) {
    return <EmptyState icon={Users} title="Sin usuarios" hint="Esta organización todavía no ha invitado usuarios." />;
  }
  return (
    <div className="rp-glass rounded-xl overflow-hidden">
      <div className="overflow-x-auto rp-scroll-thin">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-foreground/[0.03]">
              {["Usuario", "Email", "Rol", "Última actividad", "Estado", ""].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {org.usuarios.map((u, i) => (
              <tr key={i} className="border-b border-border/40 last:border-0 transition-colors hover:bg-foreground/[0.04] min-h-[44px]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-md bg-gradient-to-br from-[var(--gold)]/20 to-[var(--teal)]/15 border border-[var(--gold)]/20 flex items-center justify-center text-[10px] font-mono text-[var(--gold-soft)]">
                      {u.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span className="font-medium text-foreground/90">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={cn(
                    u.role === "Owner" ? "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]"
                    : u.role === "Admin" ? "border-[var(--teal)]/30 bg-[var(--teal)]/10 text-[var(--teal)]"
                    : "border-border/60 bg-foreground/5 text-muted-foreground"
                  )}>{u.role}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{u.lastActive}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center gap-1.5 text-xs",
                    u.status === "active" ? "text-emerald-300" : "text-zinc-400")}>
                    <span className={cn("h-1.5 w-1.5 rounded-full",
                      u.status === "active" ? "bg-emerald-400" : "bg-zinc-500")} />
                    {u.status === "active" ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <ChevronRight className="h-4 w-4 text-muted-foreground inline" aria-hidden />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TabSourceFooter updated="hace 5 s">D1 · sessions (tiempo real)</TabSourceFooter>
    </div>
  );
}

function IngresosTab({ org }: { org: DemoOrg }) {
  const lastMrr = org.mrrHistory[org.mrrHistory.length - 1];
  const prevMrr = org.mrrHistory[org.mrrHistory.length - 2] || lastMrr;
  const growth = prevMrr ? ((lastMrr - prevMrr) / prevMrr) * 100 : 0;
  return (
    <div className="space-y-4">
      {/* MRR evolution mini chart */}
      <div className="rp-glass rounded-xl p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-medium">Evolución MRR · 12 meses</h4>
            <p className="text-[10px] font-mono text-muted-foreground/70">Source: Stripe + D1 agregado diariamente</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("inline-flex items-center gap-1 text-xs font-mono", growth >= 0 ? "text-emerald-300" : "text-rose-300")}>
              {growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {growth >= 0 ? "+" : ""}{growth.toFixed(1)}%
            </span>
            
          </div>
        </div>
        <MiniLineChart values={org.mrrHistory} color={org.accent === "gold" ? "var(--gold)" : "var(--teal)"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Invoices */}
        <div className="rp-glass rounded-xl p-4">
          <h4 className="mb-3 text-sm font-medium">Facturas recientes</h4>
          <div className="overflow-x-auto rp-scroll-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40">
                  {["Factura", "Fecha", "Importe", "Estado"].map((h) => (
                    <th key={h} className="px-2 py-2 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {org.invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/30 last:border-0">
                    <td className="px-2 py-2 font-mono text-xs">{inv.id}</td>
                    <td className="px-2 py-2 text-xs text-muted-foreground">{inv.date}</td>
                    <td className="px-2 py-2 text-right font-mono text-xs rp-gold-text">{inv.amount.toLocaleString("es-ES")}€</td>
                    <td className="px-2 py-2">
                      <span className={cn("inline-flex items-center gap-1 text-[11px]",
                        inv.status === "paid" ? "text-emerald-300" : inv.status === "pending" ? "text-amber-300" : "text-rose-300")}>
                        <span className={cn("h-1.5 w-1.5 rounded-full",
                          inv.status === "paid" ? "bg-emerald-400" : inv.status === "pending" ? "bg-amber-400" : "bg-rose-400")} />
                        {inv.status === "paid" ? "Pagada" : inv.status === "pending" ? "Pendiente" : "Fallida"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TabSourceFooter updated="hace 1 min">Stripe · invoices</TabSourceFooter>
        </div>

        {/* Usage */}
        <div className="rp-glass rounded-xl p-4">
          <h4 className="mb-3 text-sm font-medium">Uso vs límites del plan</h4>
          <ul className="space-y-3">
            {org.usage.map((u) => {
              const Icon = u.icon;
              const pct = Math.round((u.used / u.limit) * 100);
              return (
                <li key={u.label}>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 text-foreground/85">
                      <Icon className="h-3 w-3 text-muted-foreground" aria-hidden />
                      {u.label}
                    </span>
                    <span className="font-mono text-muted-foreground">
                      {u.used.toLocaleString("es-ES")} / {u.limit.toLocaleString("es-ES")} {u.unit}
                      <span className={cn("ml-1.5", pct >= 90 ? "text-rose-300" : pct >= 75 ? "text-amber-300" : "text-emerald-300")}>{pct}%</span>
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <ProgressBar used={u.used} limit={u.limit} />
                  </div>
                </li>
              );
            })}
          </ul>
          <TabSourceFooter updated="hace 1 min">Workers + D1</TabSourceFooter>
        </div>
      </div>
    </div>
  );
}

function ReservasTab({ org }: { org: DemoOrg }) {
  return (
    <div className="space-y-4">
      {/* Rates row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Reservas 30 días", value: org.reservas30d.reduce((a, b) => a + b, 0).toLocaleString("es-ES"), tone: "neutral" as const },
          { label: "Tasa cancelación", value: `${org.cancelRate}%`, tone: org.cancelRate > 5 ? "negative" as const : "neutral" as const },
          { label: "Tasa no-show", value: `${org.noShowRate}%`, tone: org.noShowRate > 5 ? "negative" as const : "neutral" as const },
          { label: "Reservas hoy", value: org.reservas30d[org.reservas30d.length - 1].toString(), tone: "positive" as const },
        ].map((m) => (
          <div key={m.label} className="rp-glass rounded-xl p-3.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{m.label}</div>
            <div className={cn("mt-1.5 font-display text-xl font-light",
              m.tone === "positive" ? "text-emerald-300" : m.tone === "negative" ? "text-rose-300" : "rp-gold-text")}>{m.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 30 day chart */}
        <div className="rp-glass rounded-xl p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-medium">Reservas últimos 30 días</h4>
            
          </div>
          <MiniBarChart values={org.reservas30d} color={org.accent === "gold" ? "var(--gold)" : "var(--teal)"} />
          <TabSourceFooter updated="hace 30 s">Workers (casi tiempo real)</TabSourceFooter>
        </div>

        {/* Channel donut */}
        <div className="rp-glass rounded-xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-medium">Canales</h4>
            
          </div>
          <div className="flex flex-col items-center gap-3">
            <DonutChart segments={org.channels} />
            <ul className="w-full space-y-1.5">
              {org.channels.map((c) => (
                <li key={c.name} className="flex items-center justify-between gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 text-foreground/80">
                    <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                    {c.name}
                  </span>
                  <span className="font-mono text-muted-foreground">{c.pct}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function CrmTab({ org }: { org: DemoOrg }) {
  const c = org.crm;
  const metrics = [
    { label: "Clientes", value: c.clientes.toLocaleString("es-ES"), icon: Users, tone: "neutral" as const },
    { label: "Clientes VIP", value: c.vips.toLocaleString("es-ES"), icon: Crown, tone: "positive" as const },
    { label: "Segmentos activos", value: c.segmentsActive.toString(), icon: Sparkles, tone: "neutral" as const },
    { label: "Campañas enviadas", value: c.campaignsSent.toString(), icon: Mail, tone: "neutral" as const },
    { label: "NPS", value: c.nps.toString(), icon: Star, tone: c.nps >= 60 ? "positive" as const : c.nps >= 40 ? "neutral" as const : "negative" as const },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="rp-glass rounded-xl p-3.5">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{m.label}</div>
                <Icon className="h-3 w-3 text-muted-foreground" aria-hidden />
              </div>
              <div className={cn("mt-1.5 font-display text-xl font-light",
                m.tone === "positive" ? "text-emerald-300" : m.tone === "negative" ? "text-rose-300" : "rp-gold-text")}>{m.value}</div>
            </div>
          );
        })}
      </div>
      <div className="rp-glass rounded-xl p-4">
        <h4 className="mb-3 text-sm font-medium">Resumen CRM</h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between border-b border-border/40 py-2">
            <span className="text-muted-foreground">Tasa de conversión trial → cliente</span>
            <span className="font-mono text-emerald-300">42%</span>
          </div>
          <div className="flex justify-between border-b border-border/40 py-2">
            <span className="text-muted-foreground">Tasa de reapertura email</span>
            <span className="font-mono">28.4%</span>
          </div>
          <div className="flex justify-between border-b border-border/40 py-2">
            <span className="text-muted-foreground">Tasa de clic WhatsApp</span>
            <span className="font-mono">19.2%</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Frecuencia media visita</span>
            <span className="font-mono">2.3 / mes</span>
          </div>
        </div>
        <TabSourceFooter updated="hace 1 h">Analytics Engine · crm_events</TabSourceFooter>
      </div>
    </div>
  );
}

function IntegracionesTab({ org }: { org: DemoOrg }) {
  if (!org.integrations.length) {
    return <EmptyState icon={Plug} title="Sin integraciones" hint="Esta organización no tiene integraciones conectadas." />;
  }
  return (
    <div className="rp-glass rounded-xl p-4">
      <ul className="space-y-2">
        {org.integrations.map((it) => {
          const Icon = it.icon;
          const cfg =
            it.status === "connected"
              ? { dot: "bg-emerald-400", text: "text-emerald-300", label: "Conectado", icon: CheckCircle2 }
              : it.status === "pending"
              ? { dot: "bg-amber-400", text: "text-amber-300", label: "Pendiente", icon: Clock }
              : { dot: "bg-rose-400", text: "text-rose-300", label: "Error", icon: XCircle };
          const StatusIcon = cfg.icon;
          return (
            <li key={it.name} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/40 bg-foreground/[0.02] p-3 min-h-[44px]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-md border border-border/50 bg-foreground/5 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-foreground/80" aria-hidden />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground/90 truncate">{it.name}</div>
                  <div className="text-[10px] font-mono text-muted-foreground/70">{it.version} · última sync {it.lastSync}</div>
                </div>
              </div>
              <span className={cn("inline-flex items-center gap-1.5 text-xs", cfg.text)}>
                <StatusIcon className="h-3.5 w-3.5" aria-hidden />
                {cfg.label}
              </span>
            </li>
          );
        })}
      </ul>
      <TabSourceFooter updated="hace 8 min">D1 · integrations_status</TabSourceFooter>
    </div>
  );
}

function AuditoriaTab({ org }: { org: DemoOrg }) {
  if (!org.audit.length) {
    return <EmptyState icon={ShieldCheck} title="Sin eventos" hint="No hay eventos de auditoría para esta organización." />;
  }
  const actionTone = (a: string) =>
    a === "DELETE" ? "text-rose-300 bg-rose-400/10 border-rose-400/30"
    : a === "CREATE" ? "text-emerald-300 bg-emerald-400/10 border-emerald-400/30"
    : a === "UPDATE" ? "text-amber-300 bg-amber-400/10 border-amber-400/30"
    : a === "EXPORT" ? "text-[var(--gold-soft)] bg-[var(--gold)]/10 border-[var(--gold)]/30"
    : "text-[var(--teal)] bg-[var(--teal)]/10 border-[var(--teal)]/30";
  return (
    <div className="rp-glass rounded-xl overflow-hidden">
      <div className="overflow-x-auto rp-scroll-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-foreground/[0.03]">
              {["Actor", "Acción", "Recurso", "Timestamp", "IP"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {org.audit.map((e, i) => (
              <tr key={i} className="border-b border-border/40 last:border-0 hover:bg-foreground/[0.03] min-h-[44px]">
                <td className="px-4 py-3 font-mono text-xs">{e.actor}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider", actionTone(e.action))}>
                    {e.action}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{e.resource}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{e.timestamp}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground/70">{e.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TabSourceFooter updated="hace 2 min">D1 · audit_log</TabSourceFooter>
    </div>
  );
}

/* ============================================================
   Tab wrapper (skeleton + content)
   ============================================================ */

function TabContent({ value, org, children, loading }: { value: string; org: DemoOrg; children: React.ReactNode; loading: boolean }) {
  return (
    <TabsContent value={value} className="focus-visible:outline-none">
      {loading ? (
        <div className="space-y-3">
          <LoadingSkeleton rows={3} />
          <LoadingSkeleton rows={4} />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children ?? <EmptyState icon={Database} title="Sin datos" hint={`No hay datos de ${value} disponibles para ${org.name}.`} />}
        </motion.div>
      )}
    </TabsContent>
  );
}

/* ============================================================
   Main export
   ============================================================ */

export function CcOrgDetail({ orgId }: { orgId?: string }) {
  const [selectedId, setSelectedId] = React.useState<string>(orgId || ORGS[0].id);
  const [tab, setTab] = React.useState("overview");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (orgId && orgId !== selectedId) setSelectedId(orgId);
  }, [orgId, selectedId]);

  const org = ORGS.find((o) => o.id === selectedId) || ORGS[0];

  // Simular carga al cambiar de org o pestaña
  React.useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(t);
  }, [selectedId, tab]);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 420);
  };

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto px-1">
      {/* Header row */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-md bg-[var(--gold)]/10 border border-[var(--gold)]/30 flex items-center justify-center rp-glow-gold">
                <Building2 className="h-5 w-5 rp-gold-text" aria-hidden />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-light tracking-tight">
                Ficha de <span className="rp-gold-text">organización</span>
              </h1>
            </div>
            
          </div>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Drill-down completo de una organización: finanzas, locales, usuarios, reservas, CRM,
            integraciones y auditoría. Todos los datos son demostrativos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-full sm:w-[260px]" aria-label="Seleccionar organización">
              <SelectValue placeholder="Selecciona organización" />
            </SelectTrigger>
            <SelectContent>
              {ORGS.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">{o.initials}</span>
                    {o.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="min-h-[40px]"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", loading && "animate-spin")} aria-hidden />
            Refrescar
          </Button>
        </div>
      </header>

      {/* Org header card */}
      <OrgHeaderCard org={org} />

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="overflow-x-auto rp-scroll-thin -mx-1 px-1">
          <TabsList className="h-auto w-max sm:w-full sm:grid sm:grid-cols-4 lg:grid-cols-8">
            {[
              { v: "overview", label: "Overview", icon: Activity },
              { v: "locales", label: "Locales", icon: Building2 },
              { v: "usuarios", label: "Usuarios", icon: Users },
              { v: "ingresos", label: "Ingresos", icon: DollarSign },
              { v: "reservas", label: "Reservas", icon: CalendarDays },
              { v: "crm", label: "CRM", icon: Sparkles },
              { v: "integraciones", label: "Integraciones", icon: Plug },
              { v: "auditoria", label: "Auditoría", icon: ShieldCheck },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <TabsTrigger key={t.v} value={t.v} className="min-h-[40px] gap-1.5">
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  <span className="hidden sm:inline">{t.label}</span>
                  <span className="sm:hidden">{t.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabContent value="overview" org={org} loading={loading}>
          <OverviewTab org={org} />
        </TabContent>
        <TabContent value="locales" org={org} loading={loading}>
          <LocalesTab org={org} />
        </TabContent>
        <TabContent value="usuarios" org={org} loading={loading}>
          <UsuariosTab org={org} />
        </TabContent>
        <TabContent value="ingresos" org={org} loading={loading}>
          <IngresosTab org={org} />
        </TabContent>
        <TabContent value="reservas" org={org} loading={loading}>
          <ReservasTab org={org} />
        </TabContent>
        <TabContent value="crm" org={org} loading={loading}>
          <CrmTab org={org} />
        </TabContent>
        <TabContent value="integraciones" org={org} loading={loading}>
          <IntegracionesTab org={org} />
        </TabContent>
        <TabContent value="auditoria" org={org} loading={loading}>
          <AuditoriaTab org={org} />
        </TabContent>
      </Tabs>

      {/* Footer note */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-4 border-t border-border/40 text-[11px] font-mono text-muted-foreground">
        <span>Ficha de organización · RestoPanel · datos demostrativos · acceso restringido</span>
        <span>Organización activa: <span className="rp-gold-text">{org.name}</span></span>
      </div>
    </div>
  );
}
