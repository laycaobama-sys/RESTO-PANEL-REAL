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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Shield,
  ShieldAlert,
  TowerControl,
  Building2,
  Eye,
  Activity,
  HeartPulse,
  DollarSign,
  Settings2,
  LifeBuoy,
  TrendingUp,
  TrendingDown,
  Globe2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Server,
  Cpu,
  HardDrive,
  Database,
  Zap,
  Search,
  PlayCircle,
  StopCircle,
  KeyRound,
  History,
  GitBranch,
  ChevronRight,
  FlaskConical,
  Lock,
  Download,
  Upload,
  Flag,
  Snowflake,
  FileWarning,
  TicketCheck,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  Scale,
  RefreshCw,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type Plan = "Starter" | "Professional" | "Enterprise";
type HealthBand = "excellent" | "good" | "warning" | "critical";
type IncidentSeverity = "low" | "medium" | "high" | "critical";
type TenantStatus = "activa" | "trial" | "pausada" | "churned";

interface Tenant {
  id: string;
  name: string;
  plan: Plan;
  locations: number;
  mrr: number;
  coste: number;
  status: TenantStatus;
  health: number;
  country: string;
  signupAt: string;
  lastActive: string;
  entitlements: { feature: string; value: string }[];
  timeline: { ts: string; event: string }[];
}

interface IncidentRow {
  id: string;
  tenant: string;
  severity: IncidentSeverity;
  title: string;
  startedAt: string;
  status: "investigando" | "identificado" | "monitorizando" | "resuelto";
}

interface SupportTicket {
  id: string;
  subject: string;
  tenant: string;
  priority: "P0" | "P1" | "P2" | "P3";
  status: "abierto" | "en progreso" | "esperando cliente" | "resuelto";
  assignee: string;
  linkedError?: string;
  createdAt: string;
}

interface FlagRollout {
  key: string;
  label: string;
  pct: number;
  cohorts: number;
  enabled: boolean;
}

interface MigrationRow {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed" | "rolledback";
  progress: number;
  startedAt: string;
  duration: string;
}

/* =========================================================
 * Mock data
 * =======================================================*/
const KPIS = [
  { label: "MRR", value: "48.250€", trend: "+6.2%", dir: "up" as const, tone: "emerald" },
  { label: "Altas (semana)", value: "23", trend: "+4", dir: "up" as const, tone: "blue" },
  { label: "Bajas (semana)", value: "4", trend: "-1", dir: "down" as const, tone: "yellow" },
  { label: "Incidencias P0/P1", value: "0/2", trend: "estable", dir: "flat" as const, tone: "emerald" },
  { label: "Tenants activos", value: "324", trend: "+14", dir: "up" as const, tone: "violet" },
  { label: "Latencia p95", value: "184ms", trend: "-12ms", dir: "down" as const, tone: "emerald" },
];

const TENANTS: Tenant[] = [
  {
    id: "t1", name: "Ramses Group", plan: "Enterprise", locations: 6, mrr: 1490, coste: 312, status: "activa", health: 92, country: "ES", signupAt: "2024-03-12", lastActive: "hace 4 min",
    entitlements: [{ feature: "Locales", value: "6/∞" }, { feature: "Usuarios", value: "48/200" }, { feature: "Apps privadas", value: "2/10" }, { feature: "Webhook RPS", value: "120/1000" }],
    timeline: [{ ts: "hace 4 min", event: "Login admin" }, { ts: "hace 2 h", event: "Nuevo local: Lisboa" }, { ts: "hace 5 días", event: "Upgrade Pro → Enterprise" }],
  },
  {
    id: "t2", name: "El Club del Chef", plan: "Professional", locations: 3, mrr: 447, coste: 96, status: "activa", health: 78, country: "ES", signupAt: "2024-08-22", lastActive: "hace 22 min",
    entitlements: [{ feature: "Locales", value: "3/5" }, { feature: "Usuarios", value: "12/25" }, { feature: "Apps privadas", value: "0/0" }, { feature: "Webhook RPS", value: "30/100" }],
    timeline: [{ ts: "hace 22 min", event: "Reserva creada" }, { ts: "hace 3 días", event: "Ticket P2 abierto" }],
  },
  {
    id: "t3", name: "Sakura Sushi Chain", plan: "Enterprise", locations: 12, mrr: 2980, coste: 614, status: "activa", health: 95, country: "PT", signupAt: "2023-11-04", lastActive: "hace 1 min",
    entitlements: [{ feature: "Locales", value: "12/∞" }, { feature: "Usuarios", value: "84/200" }, { feature: "Apps privadas", value: "3/10" }, { feature: "Webhook RPS", value: "240/1000" }],
    timeline: [{ ts: "hace 1 min", event: "Pedido cobrado" }, { ts: "hace 1 h", event: "App instalada: StockBot AI" }],
  },
  {
    id: "t4", name: "Trattoria Bellini", plan: "Starter", locations: 1, mrr: 49, coste: 14, status: "trial", health: 52, country: "IT", signupAt: "2025-11-01", lastActive: "hace 3 días",
    entitlements: [{ feature: "Locales", value: "1/1" }, { feature: "Usuarios", value: "3/5" }, { feature: "Apps privadas", value: "0/0" }, { feature: "Webhook RPS", value: "0/10" }],
    timeline: [{ ts: "hace 3 días", event: "Trial día 7/14" }, { ts: "hace 5 días", event: "Signup" }],
  },
  {
    id: "t5", name: "Mar & Sol Resorts", plan: "Professional", locations: 5, mrr: 745, coste: 168, status: "activa", health: 67, country: "ES", signupAt: "2024-06-15", lastActive: "hace 1 h",
    entitlements: [{ feature: "Locales", value: "5/5" }, { feature: "Usuarios", value: "22/25" }, { feature: "Apps privadas", value: "0/0" }, { feature: "Webhook RPS", value: "60/100" }],
    timeline: [{ ts: "hace 1 h", event: "Cierre caja" }, { ts: "hace 4 días", event: "Reach 80% locales" }],
  },
  {
    id: "t6", name: "Parrilla Sur", plan: "Starter", locations: 2, mrr: 98, coste: 28, status: "pausada", health: 28, country: "AR", signupAt: "2024-02-10", lastActive: "hace 12 días",
    entitlements: [{ feature: "Locales", value: "2/1 (exceso)" }, { feature: "Usuarios", value: "8/5" }, { feature: "Apps privadas", value: "0/0" }, { feature: "Webhook RPS", value: "0/10" }],
    timeline: [{ ts: "hace 12 días", event: "Factura impagada" }, { ts: "hace 14 días", event: "Pausa automática" }],
  },
  {
    id: "t7", name: "Brasserie Lumière", plan: "Professional", locations: 4, mrr: 596, coste: 132, status: "activa", health: 81, country: "FR", signupAt: "2024-04-18", lastActive: "hace 8 min",
    entitlements: [{ feature: "Locales", value: "4/5" }, { feature: "Usuarios", value: "16/25" }, { feature: "Apps privadas", value: "0/0" }, { feature: "Webhook RPS", value: "40/100" }],
    timeline: [{ ts: "hace 8 min", event: "Reserva web" }, { ts: "hace 2 h", event: "Nueva carta" }],
  },
  {
    id: "t8", name: "Wok Republic", plan: "Enterprise", locations: 9, mrr: 2235, coste: 478, status: "activa", health: 88, country: "UK", signupAt: "2023-09-30", lastActive: "hace 17 min",
    entitlements: [{ feature: "Locales", value: "9/∞" }, { feature: "Usuarios", value: "62/200" }, { feature: "Apps privadas", value: "1/10" }, { feature: "Webhook RPS", value: "180/1000" }],
    timeline: [{ ts: "hace 17 min", event: "Cobro tarjeta" }, { ts: "hace 6 h", event: "Update carta central" }],
  },
  {
    id: "t9", name: "Café Central Lisboa", plan: "Starter", locations: 1, mrr: 49, coste: 11, status: "trial", health: 64, country: "PT", signupAt: "2025-11-08", lastActive: "hace 2 h",
    entitlements: [{ feature: "Locales", value: "1/1" }, { feature: "Usuarios", value: "2/5" }, { feature: "Apps privadas", value: "0/0" }, { feature: "Webhook RPS", value: "0/10" }],
    timeline: [{ ts: "hace 2 h", event: "Reserva" }, { ts: "hace 14 días", event: "Signup trial" }],
  },
  {
    id: "t10", name: "Taco Loco Group", plan: "Professional", locations: 7, mrr: 1043, coste: 226, status: "activa", health: 84, country: "MX", signupAt: "2024-05-22", lastActive: "hace 33 min",
    entitlements: [{ feature: "Locales", value: "7/10" }, { feature: "Usuarios", value: "31/40" }, { feature: "Apps privadas", value: "0/0" }, { feature: "Webhook RPS", value: "80/100" }],
    timeline: [{ ts: "hace 33 min", event: "Pedido delivery" }, { ts: "hace 1 día", event: "Update apps" }],
  },
  {
    id: "t11", name: "Le Petit Bistro", plan: "Starter", locations: 1, mrr: 49, coste: 13, status: "churned", health: 0, country: "FR", signupAt: "2024-01-10", lastActive: "hace 45 días",
    entitlements: [{ feature: "Locales", value: "0/1" }, { feature: "Usuarios", value: "0/5" }, { feature: "Apps privadas", value: "0/0" }, { feature: "Webhook RPS", value: "0/10" }],
    timeline: [{ ts: "hace 45 días", event: "Churn voluntario" }, { ts: "hace 50 días", event: "Solicitud cancelación" }],
  },
  {
    id: "t12", name: "Sushi Wave", plan: "Professional", locations: 4, mrr: 596, coste: 134, status: "activa", health: 76, country: "ES", signupAt: "2024-07-09", lastActive: "hace 11 min",
    entitlements: [{ feature: "Locales", value: "4/5" }, { feature: "Usuarios", value: "18/25" }, { feature: "Apps privadas", value: "0/0" }, { feature: "Webhook RPS", value: "44/100" }],
    timeline: [{ ts: "hace 11 min", event: "Comanda enviada" }, { ts: "hace 1 día", event: "Update menu" }],
  },
];

const INCIDENTS: IncidentRow[] = [
  { id: "inc1", tenant: "Sakura Sushi Chain", severity: "high", title: "Latencia WhatsApp API > 3s", startedAt: "hace 12 min", status: "identificado" },
  { id: "inc2", tenant: "Mar & Sol Resorts", severity: "medium", title: "Webhook deliveries fallando 3%", startedAt: "hace 1 h", status: "investigando" },
  { id: "inc3", tenant: "El Club del Chef", severity: "low", title: "Reports PDF timeout", startedAt: "hace 3 h", status: "monitorizando" },
  { id: "inc4", tenant: "Ramses Group", severity: "medium", title: "StockBot AI quota exceed", startedAt: "hace 4 h", status: "resuelto" },
];

const WORLD_DOTS = [
  { x: 200, y: 100, size: 6, label: "USA" },
  { x: 165, y: 145, size: 4, label: "MX" },
  { x: 235, y: 180, size: 3, label: "BR" },
  { x: 350, y: 90, size: 5, label: "UK" },
  { x: 375, y: 105, size: 8, label: "ES" },
  { x: 390, y: 100, size: 4, label: "FR" },
  { x: 425, y: 110, size: 4, label: "IT" },
  { x: 445, y: 135, size: 3, label: "AR" },
  { x: 540, y: 115, size: 7, label: "UAE" },
  { x: 600, y: 135, size: 6, label: "IN" },
  { x: 650, y: 105, size: 7, label: "JP" },
  { x: 680, y: 170, size: 4, label: "AU" },
];

const LATENCY_BUCKETS = [
  { label: "p50", value: 64, max: 200 },
  { label: "p75", value: 112, max: 200 },
  { label: "p90", value: 156, max: 200 },
  { label: "p95", value: 184, max: 200 },
  { label: "p99", value: 312, max: 400 },
];

const ERROR_LOGS = [
  { ts: "12:42:01", level: "error", tenant: "t6", msg: "Billing webhook delivery failed: 402", redacted: true },
  { ts: "12:38:44", level: "warn", tenant: "t3", msg: "AI quota near limit (92%)", redacted: false },
  { ts: "12:31:12", level: "error", tenant: "t3", msg: "WhatsApp send failed: timeout 3.2s", redacted: false },
  { ts: "12:24:09", level: "info", tenant: "t1", msg: "Upgrade plan executed: Pro→Ent", redacted: false },
  { ts: "12:18:55", level: "warn", tenant: "t5", msg: "Locales usage at 80%", redacted: false },
];

const TRACES = [
  { id: "tr-1", name: "POST /reservations", duration: 184, status: 201, tenant: "t1" },
  { id: "tr-2", name: "POST /payments/intent", duration: 412, status: 200, tenant: "t3" },
  { id: "tr-3", name: "GET /reports/daily", duration: 1820, status: 504, tenant: "t2" },
  { id: "tr-4", name: "POST /webhooks/stripe", duration: 96, status: 200, tenant: "t1" },
  { id: "tr-5", name: "PATCH /menu/items", duration: 240, status: 200, tenant: "t3" },
];

const SUPPORT: SupportTicket[] = [
  { id: "TKT-1042", subject: "Webhook no llega tras upgrade", tenant: "Ramses Group", priority: "P2", status: "en progreso", assignee: "CSM Ana", linkedError: "err-2041", createdAt: "hace 2 h" },
  { id: "TKT-1041", subject: "Error al exportar PDF mensual", tenant: "El Club del Chef", priority: "P2", status: "esperando cliente", assignee: "Support Tom", linkedError: "err-2039", createdAt: "hace 5 h" },
  { id: "TKT-1040", subject: "StockBot AI no predice", tenant: "Sakura Sushi Chain", priority: "P1", status: "abierto", assignee: "Eng Maria", linkedError: "err-2038", createdAt: "hace 22 min" },
  { id: "TKT-1039", subject: "Consulta sobre factura", tenant: "Mar & Sol Resorts", priority: "P3", status: "abierto", assignee: "CSM Ana", createdAt: "hace 1 día" },
  { id: "TKT-1038", subject: "Solicita cambio de plan", tenant: "Café Central Lisboa", priority: "P3", status: "resuelto", assignee: "CSM Bea", createdAt: "hace 2 días" },
];

const FLAGS: FlagRollout[] = [
  { key: "new_kds_ui", label: "Nuevo KDS UI v2", pct: 35, cohorts: 4, enabled: true },
  { key: "ai_copilot_v2", label: "AI Copilot v2", pct: 12, cohorts: 6, enabled: true },
  { key: "feature_entitlements_v2", label: "Entitlements v2 engine", pct: 100, cohorts: 1, enabled: true },
  { key: "realtime_v3", label: "Realtime WS v3", pct: 0, cohorts: 0, enabled: false },
  { key: "stripe_v3_sdk", label: "Stripe SDK v3", pct: 80, cohorts: 3, enabled: true },
];

const MIGRATIONS: MigrationRow[] = [
  { id: "mig-2401", name: "Add entitlements_v2 table", status: "completed", progress: 100, startedAt: "hace 2 días", duration: "1m 42s" },
  { id: "mig-2402", name: "Backfill health_score", status: "running", progress: 67, startedAt: "hace 4 min", duration: "—" },
  { id: "mig-2403", name: "Index on reservations(tenant,status)", status: "pending", progress: 0, startedAt: "—", duration: "—" },
  { id: "mig-2399", name: "Migrate KDS schema", status: "failed", progress: 45, startedAt: "hace 5 días", duration: "3m 18s" },
];

const BACKUPS = [
  { id: "bk-2025-11-22-03", scope: "tenant-cell:eu-west", size: "412 MB", takenAt: "hace 9 h", type: "scheduled" },
  { id: "bk-2025-11-21-03", scope: "tenant-cell:eu-west", size: "408 MB", takenAt: "hace 1 día", type: "scheduled" },
  { id: "bk-pre-mig-2402", scope: "tenant-cell:eu-west", size: "408 MB", takenAt: "hace 5 min", type: "pre-migration" },
];

const FINANCE_KPIS = [
  { label: "MRR", value: "48.250€", delta: "+6.2% MoM", dir: "up" as const },
  { label: "NRR", value: "118%", delta: "+4pp", dir: "up" as const },
  { label: "ARPA", value: "149€", delta: "+2.3%", dir: "up" as const },
  { label: "CAC payback", value: "8.4 meses", delta: "-0.6m", dir: "down" as const },
  { label: "Gross margin", value: "78%", delta: "+1pp", dir: "up" as const },
  { label: "FinOps coste/tenant", value: "4.16€", delta: "-0.31€", dir: "down" as const },
];

const FINOPS_TABLE = [
  { tenant: "Ramses Group", mrr: 1490, coste: 312, margin: 79, infra: 142, ai: 88, support: 82 },
  { tenant: "Sakura Sushi Chain", mrr: 2980, coste: 614, margin: 79, infra: 240, ai: 198, support: 176 },
  { tenant: "Wok Republic", mrr: 2235, coste: 478, margin: 79, infra: 195, ai: 142, support: 141 },
  { tenant: "Taco Loco Group", mrr: 1043, coste: 226, margin: 78, infra: 96, ai: 64, support: 66 },
  { tenant: "Mar & Sol Resorts", mrr: 745, coste: 168, margin: 77, infra: 72, ai: 48, support: 48 },
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

function HealthBadge({ score }: { score: number }) {
  const band: { label: string; cls: string } = score === 0
    ? { label: "Churned", cls: "border-zinc-500/40 bg-zinc-500/10 text-zinc-400" }
    : score >= 85 ? { label: "Excelente", cls: "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald)]" }
    : score >= 70 ? { label: "Bueno", cls: "border-[var(--rp-blue)]/40 bg-[var(--rp-blue)]/10 text-[var(--rp-blue)]" }
    : score >= 50 ? { label: "Atención", cls: "border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow)]" }
    : { label: "Crítico", cls: "border-[var(--rp-red)]/40 bg-[var(--rp-red)]/10 text-[var(--rp-red)]" };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono", band.cls)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />{score} · {band.label}
    </span>
  );
}

function StatusPill({ status }: { status: TenantStatus }) {
  const map: Record<TenantStatus, { label: string; cls: string }> = {
    activa: { label: "Activa", cls: "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald)]" },
    trial: { label: "Trial", cls: "border-[var(--rp-blue)]/40 bg-[var(--rp-blue)]/10 text-[var(--rp-blue)]" },
    pausada: { label: "Pausada", cls: "border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow)]" },
    churned: { label: "Churned", cls: "border-zinc-500/40 bg-zinc-500/10 text-zinc-400" },
  };
  const entry = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px]", entry.cls)}>
      <span className="h-1 w-1.5 rounded-full bg-current" aria-hidden /> {entry.label}
    </span>
  );
}

function PriorityPill({ p }: { p: "P0" | "P1" | "P2" | "P3" }) {
  const cls = p === "P0" ? "border-[var(--rp-red)]/50 bg-[var(--rp-red)]/15 text-[var(--rp-red)]"
    : p === "P1" ? "border-[var(--rp-yellow)]/50 bg-[var(--rp-yellow)]/15 text-[var(--rp-yellow)]"
    : p === "P2" ? "border-[var(--rp-blue)]/50 bg-[var(--rp-blue)]/15 text-[var(--rp-blue)]"
    : "border-border/50 bg-foreground/5 text-muted-foreground";
  return <span className={cn("inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono", cls)}>{p}</span>;
}

/* =========================================================
 * Torre de Control
 * =======================================================*/
function TorreDeControl() {
  return (
    <div className="space-y-4">
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {KPIS.map((k) => {
          const color = TONE[k.tone];
          const Icon = k.dir === "up" ? TrendingUp : k.dir === "down" ? TrendingDown : Activity;
          return (
            <div key={k.label} className="rp-glass rounded-lg p-3 border border-border/60">
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono">{k.label}</div>
              <div className="mt-1 text-lg font-display font-medium" style={{ color }}>{k.value}</div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                <Icon className="h-2.5 w-2.5" aria-hidden />
                {k.trend}
              </div>
            </div>
          );
        })}
      </div>

      {/* Map + incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rp-glass rounded-xl border border-border/60 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe2 className="h-4 w-4 text-[var(--rp-emerald)]" aria-hidden />
            <h4 className="text-sm font-medium">Actividad global en tiempo real</h4>
          </div>
          <svg viewBox="0 0 880 240" className="w-full h-auto" role="img" aria-label="Mapa mundial con actividad de tenants">
            <defs>
              <radialGradient id="dot-ctrl" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={TONE.emerald} stopOpacity="0.9" />
                <stop offset="100%" stopColor={TONE.emerald} stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* abstract continents */}
            <g fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeOpacity="0.12" strokeWidth="0.75">
              <path d="M120 60 Q160 40 230 50 L280 80 Q300 130 270 170 L210 200 Q150 190 110 150 Z" />
              <path d="M330 50 Q380 40 460 60 L490 100 Q500 140 470 180 L420 190 Q370 180 340 140 Z" />
              <path d="M520 70 Q580 50 660 80 L690 140 Q680 180 640 190 L580 180 Q540 150 520 110 Z" />
              <path d="M660 140 Q720 130 760 160 L770 200 Q740 220 700 210 L670 180 Z" />
            </g>
            {WORLD_DOTS.map((d) => (
              <g key={d.label}>
                <circle cx={d.x} cy={d.y} r={d.size * 1.6} fill="url(#dot-ctrl)" />
                <circle cx={d.x} cy={d.y} r={d.size * 0.4} fill={TONE.emerald}>
                  <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
                </circle>
                <text x={d.x} y={d.y - d.size - 3} fontSize="9" fill="currentColor" fillOpacity="0.55" textAnchor="middle" fontFamily="var(--font-jetbrains)">{d.label}</text>
              </g>
            ))}
          </svg>
          <div className="mt-2 text-[10px] text-muted-foreground flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--rp-emerald)]" aria-hidden /> Activo</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--rp-yellow)]" aria-hidden /> Trial</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-zinc-500" aria-hidden /> Churned</span>
          </div>
        </div>

        <div className="lg:col-span-2 rp-glass rounded-xl border border-border/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[var(--rp-yellow)]" aria-hidden /> Incidencias activas
            </h4>
            <Badge variant="outline" className="text-[10px]">{INCIDENTS.length}</Badge>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto rp-scroll-thin">
            {INCIDENTS.map((inc) => {
              const sevCls = inc.severity === "critical" || inc.severity === "high"
                ? "border-[var(--rp-red)]/40 bg-[var(--rp-red)]/[0.06] text-[var(--rp-red)]"
                : inc.severity === "medium"
                ? "border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/[0.06] text-[var(--rp-yellow)]"
                : "border-[var(--rp-blue)]/40 bg-[var(--rp-blue)]/[0.06] text-[var(--rp-blue)]";
              return (
                <div key={inc.id} className="rounded-md border border-border/50 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] uppercase font-mono", sevCls)}>
                      {inc.severity}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">{inc.startedAt}</span>
                  </div>
                  <div className="text-xs font-medium mt-1">{inc.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Building2 className="h-3 w-3" aria-hidden /> {inc.tenant}
                    <span className="mx-1">·</span>
                    <span className="capitalize">{inc.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Tenants
 * =======================================================*/
function TenantsTab({ onOpenTenant }: { onOpenTenant: (t: Tenant) => void }) {
  const [q, setQ] = React.useState("");
  const [planFilter, setPlanFilter] = React.useState<"all" | Plan>("all");
  const [statusFilter, setStatusFilter] = React.useState<"all" | TenantStatus>("all");

  const filtered = TENANTS.filter(t => {
    if (q && !t.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (planFilter !== "all" && t.plan !== planFilter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          <Input placeholder="Buscar tenant…" value={q} onChange={(e) => setQ(e.target.value)} className="h-8 pl-8 w-48 text-xs" />
        </div>
        <div className="flex gap-1">
          {(["all", "Starter", "Professional", "Enterprise"] as const).map((p) => (
            <Button key={p} size="sm" variant={planFilter === p ? "default" : "outline"}
              className={cn("h-7 text-[11px]", planFilter === p && "bg-[var(--rp-emerald)] text-[#062018] hover:bg-[var(--rp-emerald)]/90")}
              onClick={() => setPlanFilter(p)}>{p === "all" ? "Todos" : p}</Button>
          ))}
        </div>
        <div className="flex gap-1">
          {(["all", "activa", "trial", "pausada", "churned"] as const).map((s) => (
            <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"}
              className={cn("h-7 text-[11px]", statusFilter === s && "bg-[var(--rp-blue)] text-white hover:bg-[var(--rp-blue)]/90")}
              onClick={() => setStatusFilter(s)}>{s === "all" ? "Todos" : s}</Button>
          ))}
        </div>
        <Badge variant="outline" className="text-[10px] ml-auto">{filtered.length} de {TENANTS.length}</Badge>
      </div>

      {/* Table */}
      <div className="rp-glass rounded-xl border border-border/60 overflow-hidden">
        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full text-xs">
            <thead className="bg-foreground/[0.03] text-left text-muted-foreground">
              <tr className="border-b border-border/40">
                <th className="py-2 px-3 font-medium">Tenant</th>
                <th className="py-2 px-2 font-medium">Plan</th>
                <th className="py-2 px-2 font-medium text-right">Locales</th>
                <th className="py-2 px-2 font-medium text-right">MRR</th>
                <th className="py-2 px-2 font-medium text-right">Coste</th>
                <th className="py-2 px-2 font-medium">Estado</th>
                <th className="py-2 px-2 font-medium">Health</th>
                <th className="py-2 px-2 font-medium">Última actividad</th>
                <th className="py-2 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-border/30 hover:bg-foreground/[0.02] cursor-pointer" onClick={() => onOpenTenant(t)}>
                  <td className="py-2 px-3">
                    <div className="font-medium truncate max-w-[180px]">{t.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{t.id} · {t.country}</div>
                  </td>
                  <td className="py-2 px-2">
                    <span className={cn("text-[10px] font-mono",
                      t.plan === "Enterprise" ? "text-[var(--rp-violet)]" : t.plan === "Professional" ? "text-[var(--rp-emerald)]" : "text-muted-foreground")}>
                      {t.plan}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right font-mono">{t.locations}</td>
                  <td className="py-2 px-2 text-right font-mono">{euro(t.mrr)}</td>
                  <td className="py-2 px-2 text-right font-mono text-[var(--rp-red)]">{euro(t.coste)}</td>
                  <td className="py-2 px-2"><StatusPill status={t.status} /></td>
                  <td className="py-2 px-2"><HealthBadge score={t.health} /></td>
                  <td className="py-2 px-2 text-[10px] text-muted-foreground font-mono">{t.lastActive}</td>
                  <td className="py-2 px-2 text-right">
                    <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={(e) => { e.stopPropagation(); onOpenTenant(t); }}>
                      Detalle <ChevronRight className="h-3 w-3 ml-0.5" aria-hidden />
                    </Button>
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

function TenantDrawer({ tenant, open, onOpenChange, onImpersonate }: {
  tenant: Tenant | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onImpersonate: (t: Tenant) => void;
}) {
  if (!tenant) return null;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto rp-scroll-thin">
        <SheetHeader>
          <SheetTitle className="text-base">{tenant.name}</SheetTitle>
          <SheetDescription className="font-mono text-[11px]">{tenant.id} · {tenant.country} · signup {tenant.signupAt}</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-md bg-foreground/[0.04] p-2">
              <div className="text-[9px] uppercase text-muted-foreground font-mono">Plan</div>
              <div className="text-sm font-medium">{tenant.plan}</div>
            </div>
            <div className="rounded-md bg-foreground/[0.04] p-2">
              <div className="text-[9px] uppercase text-muted-foreground font-mono">MRR</div>
              <div className="text-sm font-medium text-[var(--rp-emerald)]">{euro(tenant.mrr)}</div>
            </div>
            <div className="rounded-md bg-foreground/[0.04] p-2">
              <div className="text-[9px] uppercase text-muted-foreground font-mono">Coste</div>
              <div className="text-sm font-medium text-[var(--rp-red)]">{euro(tenant.coste)}</div>
            </div>
          </div>
          <Separator />
          <div>
            <h5 className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wider">Health score</h5>
            <div className="flex items-center gap-3">
              <HealthBadge score={tenant.health} />
              <Progress value={tenant.health} className="h-1.5 flex-1" />
            </div>
          </div>
          <Separator />
          <div>
            <h5 className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wider">Entitlements</h5>
            <div className="space-y-1">
              {tenant.entitlements.map((e) => {
                const overLimit = e.value.includes("exceso");
                return (
                  <div key={e.feature} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{e.feature}</span>
                    <span className={cn("font-mono", overLimit && "text-[var(--rp-red)]")}>{e.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <Separator />
          <div>
            <h5 className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wider">Coste desglose</h5>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">MRR</span><span className="font-mono text-[var(--rp-emerald)]">+{euro(tenant.mrr)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Infra (D1+KV+R2)</span><span className="font-mono text-[var(--rp-red)]">−{euro(Math.round(tenant.coste * 0.45))}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">IA + Workers AI</span><span className="font-mono text-[var(--rp-red)]">−{euro(Math.round(tenant.coste * 0.28))}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Soporte</span><span className="font-mono text-[var(--rp-red)]">−{euro(Math.round(tenant.coste * 0.27))}</span></div>
              <Separator className="my-1" />
              <div className="flex justify-between font-medium"><span>Margen</span><span className="font-mono text-[var(--rp-emerald)]">{euro(tenant.mrr - tenant.coste)} ({Math.round(((tenant.mrr - tenant.coste) / tenant.mrr) * 100)}%)</span></div>
            </div>
          </div>
          <Separator />
          <div>
            <h5 className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wider">Timeline</h5>
            <div className="space-y-2">
              {tenant.timeline.map((ev, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span className="text-[10px] font-mono text-muted-foreground w-24 shrink-0">{ev.ts}</span>
                  <span>{ev.event}</span>
                </div>
              ))}
            </div>
          </div>
          <Separator />
          <Button className="w-full bg-[var(--rp-red)]/15 text-[var(--rp-red)] hover:bg-[var(--rp-red)]/25 border border-[var(--rp-red)]/30" onClick={() => onImpersonate(tenant)}>
            <Eye className="h-4 w-4 mr-1" aria-hidden /> Impersonar tenant
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* =========================================================
 * Impersonación
 * =======================================================*/
function ImpersonacionTab() {
  const { toast } = useToast();
  const [motivo, setMotivo] = React.useState("");
  const [tenant, setTenant] = React.useState<string>("");
  const [consent, setConsent] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const [secondsLeft, setSecondsLeft] = React.useState(60 * 60);
  const [recording, setRecording] = React.useState(false);

  React.useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [active]);

  const start = () => {
    if (!tenant || !motivo || !consent) {
      toast({ title: "Faltan campos", description: "Completa motivo, tenant y consentimiento.", variant: "destructive" });
      return;
    }
    setActive(true);
    setSecondsLeft(60 * 60);
    setRecording(true);
    toast({ title: "Impersonación iniciada", description: `Sesión grabada. Expira en 60 min.` });
  };

  const stop = () => {
    setActive(false);
    setRecording(false);
    setMotivo("");
    setTenant("");
    setConsent(false);
    toast({ title: "Impersonación finalizada", description: "Grabación archivada en auditoría." });
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="space-y-4">
      {/* Red banner when active */}
      {active && (
        <div className="rounded-xl border border-[var(--rp-red)]/50 bg-[var(--rp-red)]/10 p-3 flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--rp-red)] opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--rp-red)]" />
          </div>
          <div className="flex-1 text-sm">
            <span className="font-medium text-[var(--rp-red)]">MODO IMPERSONACIÓN ACTIVO</span>
            <span className="text-foreground/80 ml-2">Tenant: <span className="font-mono">{tenant}</span></span>
          </div>
          <span className="font-mono text-xs text-[var(--rp-red)]">{mins.toString().padStart(2,"0")}:{secs.toString().padStart(2,"0")}</span>
          {recording && (
            <Badge variant="outline" className="border-[var(--rp-red)]/40 text-[var(--rp-red)] text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--rp-red)] mr-1 animate-pulse" aria-hidden /> REC
            </Badge>
          )}
          <Button size="sm" variant="outline" className="h-7 border-[var(--rp-red)]/50 text-[var(--rp-red)] hover:bg-[var(--rp-red)]/10" onClick={stop}>
            <StopCircle className="h-3.5 w-3.5 mr-1" aria-hidden /> Detener
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rp-glass rounded-xl border border-border/60 p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="h-4 w-4 text-[var(--rp-red)]" aria-hidden />
            <h4 className="text-sm font-medium">Iniciar impersonación</h4>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-[11px]">Tenant objetivo</Label>
              <select
                value={tenant}
                onChange={(e) => setTenant(e.target.value)}
                disabled={active}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs disabled:opacity-50"
              >
                <option value="">Selecciona un tenant…</option>
                {TENANTS.map(t => <option key={t.id} value={t.name}>{t.name} ({t.plan})</option>)}
              </select>
            </div>
            <div>
              <Label className="text-[11px]">Motivo (auditable)</Label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                disabled={active}
                placeholder="Ej: Soporte P1 — el webhook no llega tras upgrade."
                className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-xs disabled:opacity-50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="consent" checked={consent} onCheckedChange={setConsent} disabled={active} />
              <Label htmlFor="consent" className="text-[11px] text-muted-foreground">
                Confirmo que tengo consentimiento del tenant (o contrato que lo permite) y que la sesión será grabada.
              </Label>
            </div>
            <Button className="w-full bg-[var(--rp-red)] hover:bg-[var(--rp-red)]/90 text-white" onClick={start} disabled={active}>
              <PlayCircle className="h-4 w-4 mr-1" aria-hidden /> Iniciar (60 min máx)
            </Button>
          </div>
        </div>

        <div className="rp-glass rounded-xl border border-border/60 p-4">
          <div className="flex items-center gap-2 mb-3">
            <History className="h-4 w-4 text-[var(--rp-yellow)]" aria-hidden />
            <h4 className="text-sm font-medium">Sesiones recientes (auditoría)</h4>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto rp-scroll-thin">
            {[
              { who: "eng.maria", tenant: "Sakura Sushi Chain", when: "hace 18 min", duration: "12:04", reason: "Debug StockBot quota" },
              { who: "csm.ana", tenant: "Ramses Group", when: "hace 2 h", duration: "06:32", reason: "Setup webhook post-upgrade" },
              { who: "eng.tom", tenant: "El Club del Chef", when: "hace 1 día", duration: "03:18", reason: "PDF export error" },
              { who: "csm.bea", tenant: "Mar & Sol Resorts", when: "hace 2 días", duration: "08:51", reason: "Onboarding new local" },
            ].map((s, i) => (
              <div key={i} className="rounded-md border border-border/50 p-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px]">{s.who}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{s.when} · {s.duration}</span>
                </div>
                <div className="mt-0.5 text-foreground/80">{s.tenant}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.reason}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[10px] text-muted-foreground flex items-center gap-2">
            <Lock className="h-3 w-3 text-[var(--rp-yellow)]" aria-hidden />
            Todas las sesiones se graban, cifran y conservan 18 meses. Acceso restringido a Compliance.
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Observabilidad
 * =======================================================*/
function ObservabilidadTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Latencia */}
        <div className="rp-glass rounded-xl border border-border/60 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-[var(--rp-emerald)]" aria-hidden />
            <h4 className="text-sm font-medium">Latencia por percentil</h4>
          </div>
          <div className="space-y-2">
            {LATENCY_BUCKETS.map((b) => {
              const pct = (b.value / b.max) * 100;
              const color = b.value < 200 ? "var(--rp-emerald)" : b.value < 300 ? "var(--rp-yellow)" : "var(--rp-red)";
              return (
                <div key={b.label}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono text-muted-foreground">{b.label}</span>
                    <span className="font-mono" style={{ color }}>{b.value}ms</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-foreground/[0.05] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Errors */}
        <div className="rp-glass rounded-xl border border-border/60 p-4">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="h-4 w-4 text-[var(--rp-red)]" aria-hidden />
            <h4 className="text-sm font-medium">Errors rate (5m)</h4>
          </div>
          <div className="text-2xl font-display font-medium text-[var(--rp-red)]">0.42%</div>
          <div className="text-[10px] text-muted-foreground font-mono">14 errores / 3.321 req</div>
          <svg viewBox="0 0 200 60" className="w-full h-12 mt-2">
            <path d="M0 50 L20 48 L40 45 L60 42 L80 38 L100 30 L120 25 L140 32 L160 28 L180 20 L200 18" fill="none" stroke="var(--rp-red)" strokeWidth="1.5" />
            <path d="M0 50 L20 48 L40 45 L60 42 L80 38 L100 30 L120 25 L140 32 L160 28 L180 20 L200 18 L200 60 L0 60 Z" fill="var(--rp-red)" fillOpacity="0.12" />
          </svg>
        </div>

        {/* Infra usage */}
        <div className="rp-glass rounded-xl border border-border/60 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Server className="h-4 w-4 text-[var(--rp-blue)]" aria-hidden />
            <h4 className="text-sm font-medium">Infraestructura</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Cpu className="h-3.5 w-3.5 text-muted-foreground" aria-hidden /><span className="flex-1">Workers CPU</span><span className="font-mono text-[var(--rp-emerald)]">38%</span>
            </div>
            <Progress value={38} className="h-1.5" />
            <div className="flex items-center gap-2 text-xs">
              <Database className="h-3.5 w-3.5 text-muted-foreground" aria-hidden /><span className="flex-1">D1 storage</span><span className="font-mono text-[var(--rp-yellow)]">72%</span>
            </div>
            <Progress value={72} className="h-1.5" style={{ ["--progress-foreground" as string]: "var(--rp-yellow)" }} />
            <div className="flex items-center gap-2 text-xs">
              <HardDrive className="h-3.5 w-3.5 text-muted-foreground" aria-hidden /><span className="flex-1">R2 objects</span><span className="font-mono text-[var(--rp-emerald)]">21%</span>
            </div>
            <Progress value={21} className="h-1.5" />
          </div>
        </div>
      </div>

      {/* Traces */}
      <div className="rp-glass rounded-xl border border-border/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-[var(--rp-violet)]" aria-hidden /> Traces recientes
          </h4>
          <Button size="sm" variant="outline" className="h-7 text-[11px]">Ver en tracing</Button>
        </div>
        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full text-xs">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b border-border/40">
                <th className="py-2 pr-2 font-medium">Trace ID</th>
                <th className="py-2 px-2 font-medium">Operación</th>
                <th className="py-2 px-2 font-medium text-right">Duración</th>
                <th className="py-2 px-2 font-medium">Status</th>
                <th className="py-2 px-2 font-medium">Tenant</th>
              </tr>
            </thead>
            <tbody>
              {TRACES.map((t) => {
                const cls = t.status >= 500 ? "text-[var(--rp-red)]" : t.status >= 400 ? "text-[var(--rp-yellow)]" : "text-[var(--rp-emerald)]";
                const slow = t.duration > 1000;
                return (
                  <tr key={t.id} className="border-b border-border/30">
                    <td className="py-2 pr-2 font-mono text-[10px]">{t.id}</td>
                    <td className="py-2 px-2">{t.name}</td>
                    <td className={cn("py-2 px-2 text-right font-mono", slow && "text-[var(--rp-yellow)]")}>{t.duration}ms</td>
                    <td className={cn("py-2 px-2 font-mono", cls)}>{t.status}</td>
                    <td className="py-2 px-2 font-mono text-[10px]">{t.tenant}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logs */}
      <div className="rp-glass rounded-xl border border-border/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4 text-[var(--rp-emerald)]" aria-hidden /> Logs (redacted)
          </h4>
          <Badge variant="outline" className="text-[10px] border-[var(--rp-yellow)]/40 text-[var(--rp-yellow)]">PII masked</Badge>
        </div>
        <div className="font-mono text-[11px] bg-foreground/[0.04] rounded-md p-3 max-h-60 overflow-y-auto rp-scroll-thin space-y-1">
          {ERROR_LOGS.map((l, i) => {
            const color = l.level === "error" ? "text-[var(--rp-red)]" : l.level === "warn" ? "text-[var(--rp-yellow)]" : "text-[var(--rp-blue)]";
            return (
              <div key={i} className="flex gap-2">
                <span className="text-muted-foreground">{l.ts}</span>
                <span className={cn("uppercase font-medium", color)}>{l.level}</span>
                <span className="text-muted-foreground">[{l.tenant}]</span>
                <span className="flex-1">
                  {l.redacted ? l.msg.replace(/tenant_id=\w+/g, "tenant_id=•••") : l.msg}
                  {l.redacted && <Lock className="inline h-2.5 w-2.5 ml-1 text-[var(--rp-yellow)]" aria-hidden />}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Health Score
 * =======================================================*/
function HealthScoreTab() {
  const buckets = [
    { range: "0-39", label: "Crítico", count: 3, color: "var(--rp-red)" },
    { range: "40-59", label: "Atención", count: 5, color: "var(--rp-yellow)" },
    { range: "60-79", label: "Bueno", count: 9, color: "var(--rp-blue)" },
    { range: "80-100", label: "Excelente", count: 14, color: "var(--rp-emerald)" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {buckets.map((b) => {
          const total = buckets.reduce((s, x) => s + x.count, 0);
          const pct = Math.round((b.count / total) * 100);
          return (
            <div key={b.range} className="rp-glass rounded-xl border p-3" style={{ borderColor: `color-mix(in oklab, ${b.color} 35%, transparent)` }}>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{b.range}</div>
              <div className="text-2xl font-display font-medium" style={{ color: b.color }}>{b.count}</div>
              <div className="text-[10px] text-muted-foreground">{b.label} · {pct}%</div>
              <div className="mt-1.5 h-1.5 rounded-full bg-foreground/[0.05] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: b.color }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="rp-glass rounded-xl border border-border/60 p-4">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <HeartPulse className="h-4 w-4 text-[var(--rp-emerald)]" aria-hidden /> Distribución de health score
        </h4>
        <svg viewBox="0 0 600 120" className="w-full h-auto">
          {[0,1,2,3,4,5,6,7,8,9].map((i) => {
            const x = 30 + i * 57;
            const h = 30 + Math.sin(i * 0.8) * 25 + (i % 2 === 0 ? 15 : 0);
            const color = i < 3 ? "var(--rp-red)" : i < 5 ? "var(--rp-yellow)" : i < 8 ? "var(--rp-blue)" : "var(--rp-emerald)";
            return (
              <g key={i}>
                <rect x={x} y={110 - h} width="40" height={h} rx="3" fill={color} fillOpacity="0.7" />
                <text x={x + 20} y={118} fontSize="9" fill="currentColor" fillOpacity="0.5" textAnchor="middle" fontFamily="var(--font-jetbrains)">{i * 10}-{i * 10 + 9}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="rp-glass rounded-xl border border-border/60 p-4">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-[var(--rp-red)]" aria-hidden /> Tenants críticos (&lt;40)
        </h4>
        <div className="space-y-2">
          {TENANTS.filter(t => t.health < 40 && t.health > 0).map(t => (
            <div key={t.id} className="flex items-center justify-between rounded-md border border-[var(--rp-red)]/30 bg-[var(--rp-red)]/[0.04] px-3 py-2">
              <div>
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-[10px] text-muted-foreground">{t.plan} · {t.country} · última actividad {t.lastActive}</div>
              </div>
              <div className="flex items-center gap-3">
                <HealthBadge score={t.health} />
                <Button size="sm" variant="outline" className="h-7 text-[11px]">Contactar CSM</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Finanzas
 * =======================================================*/
function FinanzasTab() {
  const { toast } = useToast();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {FINANCE_KPIS.map((k) => {
          const color = k.dir === "up" ? "var(--rp-emerald)" : "var(--rp-yellow)";
          const Icon = k.dir === "up" ? ArrowUpRight : ArrowDownRight;
          return (
            <div key={k.label} className="rp-glass rounded-lg p-3 border border-border/60">
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono">{k.label}</div>
              <div className="mt-1 text-lg font-display font-medium" style={{ color }}>{k.value}</div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                <Icon className="h-2.5 w-2.5" style={{ color }} aria-hidden />
                {k.delta}
              </div>
            </div>
          );
        })}
      </div>

      {/* MRR breakdown */}
      <div className="rp-glass rounded-xl border border-border/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Coins className="h-4 w-4 text-[var(--rp-emerald)]" aria-hidden /> MRR desglose
          </h4>
          <Badge variant="outline" className="text-[10px]">Nov 2025</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { label: "New MRR", value: 4280, color: "var(--rp-emerald)" },
            { label: "Expansion MRR", value: 3120, color: "var(--rp-blue)" },
            { label: "Churn MRR", value: -1960, color: "var(--rp-red)" },
            { label: "Contraction MRR", value: -840, color: "var(--rp-yellow)" },
          ].map((m) => (
            <div key={m.label} className="rounded-md bg-foreground/[0.04] p-2.5">
              <div className="text-[10px] uppercase text-muted-foreground font-mono">{m.label}</div>
              <div className="text-base font-mono" style={{ color: m.color }}>{m.value > 0 ? "+" : ""}{euro(m.value)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FinOps */}
      <div className="rp-glass rounded-xl border border-border/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Scale className="h-4 w-4 text-[var(--rp-violet)]" aria-hidden /> FinOps · margen por tenant (top 5)
          </h4>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast({ title: "Exportando FinOps", description: "XLSX con detalle de costes enviado." })}>
            <Download className="h-3.5 w-3.5 mr-1" aria-hidden /> XLSX
          </Button>
        </div>
        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full text-xs">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b border-border/40">
                <th className="py-2 pr-2 font-medium">Tenant</th>
                <th className="py-2 px-2 font-medium text-right">MRR</th>
                <th className="py-2 px-2 font-medium text-right">Infra</th>
                <th className="py-2 px-2 font-medium text-right">IA</th>
                <th className="py-2 px-2 font-medium text-right">Soporte</th>
                <th className="py-2 px-2 font-medium text-right">Coste total</th>
                <th className="py-2 px-2 font-medium text-right">Margen</th>
              </tr>
            </thead>
            <tbody>
              {FINOPS_TABLE.map((r) => {
                const marginPct = Math.round(((r.mrr - r.coste) / r.mrr) * 100);
                return (
                  <tr key={r.tenant} className="border-b border-border/30">
                    <td className="py-2 pr-2 font-medium">{r.tenant}</td>
                    <td className="py-2 px-2 text-right font-mono text-[var(--rp-emerald)]">{euro(r.mrr)}</td>
                    <td className="py-2 px-2 text-right font-mono">{euro(r.infra)}</td>
                    <td className="py-2 px-2 text-right font-mono">{euro(r.ai)}</td>
                    <td className="py-2 px-2 text-right font-mono">{euro(r.support)}</td>
                    <td className="py-2 px-2 text-right font-mono text-[var(--rp-red)]">{euro(r.coste)}</td>
                    <td className="py-2 px-2 text-right">
                      <span className="font-mono text-[var(--rp-emerald)]">{marginPct}%</span>
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
 * Operaciones
 * =======================================================*/
function OperacionesTab() {
  const { toast } = useToast();
  const [flags, setFlags] = React.useState<FlagRollout[]>(FLAGS);
  const [breakGlass, setBreakGlass] = React.useState(false);
  const [breakReason, setBreakReason] = React.useState("");

  return (
    <div className="space-y-4">
      {/* Feature flags */}
      <div className="rp-glass rounded-xl border border-border/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Flag className="h-4 w-4 text-[var(--rp-emerald)]" aria-hidden /> Feature flags rollout
          </h4>
          <Button size="sm" variant="outline" className="h-7 text-[11px]">+ Nuevo flag</Button>
        </div>
        <div className="space-y-2">
          {flags.map((f) => (
            <div key={f.key} className="flex items-center gap-3 rounded-md border border-border/50 p-2.5">
              <Switch checked={f.enabled} onCheckedChange={(v) => setFlags(prev => prev.map(x => x.key === f.key ? { ...x, enabled: v } : x))} aria-label={`Enable ${f.label}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{f.label}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{f.key}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-foreground/[0.05] overflow-hidden">
                    <div className="h-full rounded-full bg-[var(--rp-emerald)]" style={{ width: `${f.pct}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground w-20 text-right">{f.pct}% · {f.cohorts} cohort{f.cohorts !== 1 ? "s" : ""}</span>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => toast({ title: "Editando rollout", description: `${f.label} · ${f.pct}%` })}>
                <FlaskConical className="h-3.5 w-3.5 mr-1" aria-hidden /> Editar
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Migraciones */}
      <div className="rp-glass rounded-xl border border-border/60 p-4">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Database className="h-4 w-4 text-[var(--rp-blue)]" aria-hidden /> Migraciones D1
        </h4>
        <div className="space-y-2">
          {MIGRATIONS.map((m) => {
            const statusMeta = {
              completed: { cls: "text-[var(--rp-emerald)]", icon: CheckCircle2 },
              running: { cls: "text-[var(--rp-blue)]", icon: RefreshCw },
              pending: { cls: "text-muted-foreground", icon: Clock },
              failed: { cls: "text-[var(--rp-red)]", icon: XCircle },
              rolledback: { cls: "text-[var(--rp-yellow)]", icon: Undo },
            }[m.status];
            const Icon = statusMeta.icon;
            return (
              <div key={m.id} className="flex items-center gap-3 rounded-md border border-border/50 p-2.5">
                <Icon className={cn("h-4 w-4", statusMeta.cls, m.status === "running" && "animate-spin")} aria-hidden />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{m.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{m.id}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">{m.startedAt} · {m.duration}</div>
                </div>
                {m.status === "running" && (
                  <div className="w-32">
                    <Progress value={m.progress} className="h-1.5" />
                  </div>
                )}
                <span className={cn("text-[10px] font-mono capitalize", statusMeta.cls)}>{m.status}</span>
                {m.status === "failed" && (
                  <Button size="sm" variant="outline" className="h-7 text-[11px] border-[var(--rp-yellow)]/40 text-[var(--rp-yellow)]">
                    <Undo className="h-3 w-3 mr-1" aria-hidden /> Rollback
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Backups + Break-glass */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rp-glass rounded-xl border border-border/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Snowflake className="h-4 w-4 text-[var(--rp-blue)]" aria-hidden /> Backups
            </h4>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast({ title: "Backup manual creado", description: "Snapshot incremental disponible en 30s." })}>
              <Upload className="h-3.5 w-3.5 mr-1" aria-hidden /> Snapshot
            </Button>
          </div>
          <div className="space-y-2">
            {BACKUPS.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2 text-xs">
                <div className="min-w-0">
                  <div className="font-mono text-[11px] truncate">{b.id}</div>
                  <div className="text-[10px] text-muted-foreground">{b.scope} · {b.size}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground font-mono">{b.takenAt}</div>
                  <Badge variant="outline" className="text-[9px] mt-0.5">{b.type}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rp-glass rounded-xl border border-[var(--rp-red)]/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileWarning className="h-4 w-4 text-[var(--rp-red)]" aria-hidden />
            <h4 className="text-sm font-medium text-[var(--rp-red)]">Break-glass emergency access</h4>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">
            Acceso administrativo sin MFA en caso de emergencia crítica. Registra motivo y on-call. Se notifica a Security.
          </p>
          <div className="space-y-2">
            <Input placeholder="Motivo (P0 incident, on-call ID…)" value={breakReason} onChange={(e) => setBreakReason(e.target.value)} className="h-8 text-xs" />
            <div className="flex items-center gap-2">
              <Switch id="break-glass" checked={breakGlass} onCheckedChange={setBreakGlass} />
              <Label htmlFor="break-glass" className="text-[11px] text-muted-foreground">Confirmo emergencia crítica y acepto auditoría posterior</Label>
            </div>
            <Button
              className="w-full bg-[var(--rp-red)] hover:bg-[var(--rp-red)]/90 text-white"
              disabled={!breakGlass || !breakReason}
              onClick={() => toast({ title: "Break-glass activado", description: "Token temporal 30min · Security notificado." })}
            >
              <KeyRound className="h-4 w-4 mr-1" aria-hidden /> Activar acceso (30 min)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Soporte
 * =======================================================*/
function SoporteTab() {
  const { toast } = useToast();
  const [filter, setFilter] = React.useState<"all" | "P0" | "P1" | "P2" | "P3">("all");
  const filtered = filter === "all" ? SUPPORT : SUPPORT.filter(s => s.priority === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {(["all", "P0", "P1", "P2", "P3"] as const).map((p) => (
            <Button key={p} size="sm" variant={filter === p ? "default" : "outline"}
              className={cn("h-7 text-[11px]", filter === p && "bg-[var(--rp-blue)] text-white hover:bg-[var(--rp-blue)]/90")}
              onClick={() => setFilter(p)}>{p === "all" ? "Todas" : p}</Button>
          ))}
        </div>
        <Button size="sm" className="h-8 text-[11px] bg-[var(--rp-emerald)] text-[#062018] hover:bg-[var(--rp-emerald)]/90" onClick={() => toast({ title: "Nuevo ticket", description: "Formulario de creación abierto." })}>
          <TicketCheck className="h-3.5 w-3.5 mr-1" aria-hidden /> Nuevo ticket
        </Button>
      </div>

      <div className="rp-glass rounded-xl border border-border/60 overflow-hidden">
        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full text-xs">
            <thead className="bg-foreground/[0.03] text-left text-muted-foreground">
              <tr className="border-b border-border/40">
                <th className="py-2 px-3 font-medium">Ticket</th>
                <th className="py-2 px-2 font-medium">Asunto</th>
                <th className="py-2 px-2 font-medium">Tenant</th>
                <th className="py-2 px-2 font-medium">P</th>
                <th className="py-2 px-2 font-medium">Estado</th>
                <th className="py-2 px-2 font-medium">Asignado</th>
                <th className="py-2 px-2 font-medium">Error vinculado</th>
                <th className="py-2 px-2 font-medium">Creado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-border/30 hover:bg-foreground/[0.02]">
                  <td className="py-2 px-3 font-mono text-[10px]">{t.id}</td>
                  <td className="py-2 px-2">{t.subject}</td>
                  <td className="py-2 px-2 text-muted-foreground">{t.tenant}</td>
                  <td className="py-2 px-2"><PriorityPill p={t.priority} /></td>
                  <td className="py-2 px-2 text-muted-foreground capitalize">{t.status}</td>
                  <td className="py-2 px-2 text-muted-foreground">{t.assignee}</td>
                  <td className="py-2 px-2">
                    {t.linkedError
                      ? <span className="font-mono text-[10px] text-[var(--rp-red)] underline cursor-pointer">{t.linkedError}</span>
                      : <span className="text-muted-foreground text-[10px]">—</span>}
                  </td>
                  <td className="py-2 px-2 text-[10px] text-muted-foreground font-mono">{t.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rp-glass rounded-xl border border-[var(--rp-red)]/30 p-3">
          <div className="text-[10px] uppercase text-muted-foreground font-mono">P0 abiertos</div>
          <div className="text-2xl font-display font-medium text-[var(--rp-red)]">0</div>
          <div className="text-[10px] text-muted-foreground">Target: 0 siempre</div>
        </div>
        <div className="rp-glass rounded-xl border border-[var(--rp-yellow)]/30 p-3">
          <div className="text-[10px] uppercase text-muted-foreground font-mono">P1 abiertos</div>
          <div className="text-2xl font-display font-medium text-[var(--rp-yellow)]">1</div>
          <div className="text-[10px] text-muted-foreground">SLA: 1h respuesta</div>
        </div>
        <div className="rp-glass rounded-xl border border-[var(--rp-emerald)]/30 p-3">
          <div className="text-[10px] uppercase text-muted-foreground font-mono">CSAT 30d</div>
          <div className="text-2xl font-display font-medium text-[var(--rp-emerald)]">4.6/5</div>
          <div className="text-[10px] text-muted-foreground">142 respuestas · 96% response rate</div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Undo icon (used inline above)
 * =======================================================*/
function Undo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-15-6.7L3 13" />
    </svg>
  );
}

/* =========================================================
 * Main view
 * =======================================================*/
const TABS = [
  { id: "torre", label: "Torre de Control", icon: TowerControl },
  { id: "tenants", label: "Tenants", icon: Building2 },
  { id: "imperson", label: "Impersonación", icon: Eye },
  { id: "observ", label: "Observabilidad", icon: Activity },
  { id: "health", label: "Health Score", icon: HeartPulse },
  { id: "finanzas", label: "Finanzas", icon: DollarSign },
  { id: "operaciones", label: "Operaciones", icon: Settings2 },
  { id: "soporte", label: "Soporte", icon: LifeBuoy },
] as const;

export function SuperAdminV2View() {
  const { toast } = useToast();
  const [tab, setTab] = React.useState<string>("torre");
  const [selectedTenant, setSelectedTenant] = React.useState<Tenant | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const openTenant = (t: Tenant) => {
    setSelectedTenant(t);
    setDrawerOpen(true);
  };

  const impersonate = (t: Tenant) => {
    setDrawerOpen(false);
    setTab("imperson");
    toast({ title: "Prepara impersonación", description: `Completa motivo y consentimiento para ${t.name}.` });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[var(--rp-violet)]/15 p-2">
            <Shield className="h-5 w-5 text-[var(--rp-violet)]" aria-hidden />
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-medium tracking-tight">Super Admin v2</h2>
            <p className="text-xs text-muted-foreground">Torre de control, tenants, observabilidad, finanzas, operaciones y soporte.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-[var(--rp-red)]/40 text-[var(--rp-red)]">
            <ShieldAlert className="h-3 w-3 mr-1" aria-hidden /> Acceso privileged
          </Badge>
          <Badge variant="outline" className="border-[var(--rp-emerald)]/40 text-[var(--rp-emerald)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--rp-emerald)] mr-1" aria-hidden /> All systems operational
          </Badge>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full justify-start overflow-x-auto rp-scroll-thin h-9">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <TabsTrigger key={t.id} value={t.id} className="text-xs whitespace-nowrap">
                <Icon className="h-3.5 w-3.5 mr-1.5" aria-hidden /> {t.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="torre" className="mt-4"><TorreDeControl /></TabsContent>
        <TabsContent value="tenants" className="mt-4"><TenantsTab onOpenTenant={openTenant} /></TabsContent>
        <TabsContent value="imperson" className="mt-4"><ImpersonacionTab /></TabsContent>
        <TabsContent value="observ" className="mt-4"><ObservabilidadTab /></TabsContent>
        <TabsContent value="health" className="mt-4"><HealthScoreTab /></TabsContent>
        <TabsContent value="finanzas" className="mt-4"><FinanzasTab /></TabsContent>
        <TabsContent value="operaciones" className="mt-4"><OperacionesTab /></TabsContent>
        <TabsContent value="soporte" className="mt-4"><SoporteTab /></TabsContent>
      </Tabs>

      <TenantDrawer
        tenant={selectedTenant}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onImpersonate={impersonate}
      />
    </div>
  );
}

export default SuperAdminV2View;
