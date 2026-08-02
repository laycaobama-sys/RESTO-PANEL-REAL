"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  AlertOctagon,
  Plus,
  Search,
  Filter,
  BrainCircuit,
  Activity,
  Server,
  Database,
  Mail,
  CreditCard,
  CalendarCheck,
  Clock,
  CheckCircle2,
  Eye,
  UserPlus,
  ArrowUp,
  XCircle,
  Zap,
  Cpu,
  Globe2,
} from "lucide-react";

/* ---------------- shared bits ---------------- */


/* ---------------- types ---------------- */
type IncidentSeverity = "critical" | "high" | "medium" | "low";
type IncidentStatus = "open" | "investigating" | "identified" | "monitoring" | "resolved";

interface TimelineEntry {
  at: string;
  status: IncidentStatus | "created";
  label: string;
  detail?: string;
}

interface Incident {
  id: string; // INC-2025-001
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  impact: string;
  services: string[];
  orgs: { count: number; names: string[] };
  responsible: { name: string; initials: string };
  timeline: TimelineEntry[];
  aiSummary: string;
  errorRate: number[]; // last 12 buckets
  latency: number[]; // last 12 buckets (ms)
  createdAt: string;
}

/* ---------------- meta maps ---------------- */
const SEVERITY_META: Record<
  IncidentSeverity,
  { label: string; cls: string; dot: string; icon: React.ComponentType<{ className?: string }> }
> = {
  critical: {
    label: "Crítica",
    cls: "border-rose-400/50 bg-rose-400/15 text-rose-300",
    dot: "bg-rose-400",
    icon: AlertOctagon,
  },
  high: {
    label: "Alta",
    cls: "border-amber-400/45 bg-amber-400/15 text-amber-300",
    dot: "bg-amber-400",
    icon: AlertTriangle,
  },
  medium: {
    label: "Media",
    cls: "border-[var(--gold)]/45 bg-[var(--gold)]/10 text-[var(--gold)]",
    dot: "bg-[var(--gold)]",
    icon: AlertTriangle,
  },
  low: {
    label: "Baja",
    cls: "border-border/60 bg-foreground/5 text-muted-foreground",
    dot: "bg-muted-foreground",
    icon: AlertTriangle,
  },
};

const STATUS_META: Record<
  IncidentStatus,
  { label: string; cls: string; dot: string; icon: React.ComponentType<{ className?: string }> }
> = {
  open: {
    label: "Abierta",
    cls: "border-rose-400/45 bg-rose-400/10 text-rose-300",
    dot: "bg-rose-400",
    icon: AlertTriangle,
  },
  investigating: {
    label: "Investigando",
    cls: "border-amber-400/45 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
    icon: Activity,
  },
  identified: {
    label: "Identificada",
    cls: "border-[var(--gold)]/45 bg-[var(--gold)]/10 text-[var(--gold)]",
    dot: "bg-[var(--gold)]",
    icon: Eye,
  },
  monitoring: {
    label: "Monitorizando",
    cls: "border-[var(--teal)]/45 bg-[var(--teal)]/10 text-[var(--teal)]",
    dot: "bg-[var(--teal)]",
    icon: Activity,
  },
  resolved: {
    label: "Resuelta",
    cls: "border-emerald-400/45 bg-emerald-400/10 text-emerald-300",
    dot: "bg-emerald-400",
    icon: CheckCircle2,
  },
};

const SERVICE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  API: Server,
  D1: Database,
  Queues: Mail,
  "AI Gateway": BrainCircuit,
  Stripe: CreditCard,
  Reservations: CalendarCheck,
  Workers: Cpu,
  KV: Database,
};

/* ---------------- demo data ---------------- */
const INCIDENTS: Incident[] = [
  {
    id: "INC-2025-001",
    severity: "critical",
    status: "investigating",
    title: "Pico de errores 500 en API",
    impact: "3 organizaciones afectadas · API degradada en EU-West",
    services: ["API", "D1"],
    orgs: {
      count: 3,
      names: ["Ramses Group", "Sakura Sushi Chain", "Beach Club Marbella"],
    },
    responsible: { name: "Marc Vidal", initials: "MV" },
    timeline: [
      { at: "14:32 UTC", status: "created", label: "Incidencia abierta", detail: "Alerta automática: error rate > 5% en /reservas" },
      { at: "14:34 UTC", status: "investigating", label: "Investigando", detail: "On-call asignado · Marc Vidal" },
      { at: "14:48 UTC", status: "investigating", label: "Hipótesis inicial", detail: "Posible saturación de D1 connection pool" },
    ],
    aiSummary:
      "Pico de errores 500 en API a las 14:32 UTC. Causa probable: D1 connection pool saturado tras campaña masiva de Ramses Group. Recomendación: aumentar pool limit y aplicar rate limiting temporal.",
    errorRate: [0.2, 0.3, 0.2, 0.4, 0.5, 1.2, 3.4, 6.8, 8.2, 5.6, 3.8, 2.4],
    latency: [120, 130, 125, 145, 160, 220, 410, 680, 820, 720, 540, 380],
    createdAt: "hace 32 min",
  },
  {
    id: "INC-2025-002",
    severity: "high",
    status: "identified",
    title: "Latencia elevada en AI Gateway",
    impact: "1 organización afectada · respuestas IA > 2s p95",
    services: ["AI Gateway"],
    orgs: { count: 1, names: ["Ramses Group"] },
    responsible: { name: "Núria Solé", initials: "NS" },
    timeline: [
      { at: "12:10 UTC", status: "created", label: "Incidencia abierta", detail: "SLO p95 AI Gateway > 1500ms" },
      { at: "12:18 UTC", status: "investigating", label: "Investigando", detail: "Tráfico normal, sin cambios en modelo" },
      { at: "12:42 UTC", status: "identified", label: "Causa identificada", detail: "Proveedor upstream degradado (demo)" },
    ],
    aiSummary:
      "Latencia p95 en AI Gateway supera SLO desde 12:10 UTC. Causa identificada: proveedor upstream degradado. Recomendación: activar ruta fallback y monitorizar recuperación del proveedor.",
    errorRate: [0.1, 0.1, 0.2, 0.2, 0.3, 0.3, 0.4, 0.5, 0.4, 0.3, 0.3, 0.2],
    latency: [640, 680, 720, 780, 850, 920, 1100, 1450, 1680, 1520, 1380, 1240],
    createdAt: "hace 3 h",
  },
  {
    id: "INC-2025-003",
    severity: "medium",
    status: "monitoring",
    title: "Queue de emails retrasada",
    impact: "12 organizaciones afectadas · retardo medio 4 min",
    services: ["Queues"],
    orgs: { count: 12, names: ["Ramses Group", "Sakura Sushi", "Beach Club", "+9 más"] },
    responsible: { name: "Iván Ruiz", initials: "IR" },
    timeline: [
      { at: "09:05 UTC", status: "created", label: "Incidencia abierta", detail: "Backlog de emails > 1.500" },
      { at: "09:14 UTC", status: "investigating", label: "Investigando", detail: "Throughput de consumidor reducido" },
      { at: "09:32 UTC", status: "identified", label: "Causa identificada", detail: "Consumer scaling limit alcanzado" },
      { at: "10:18 UTC", status: "monitoring", label: "Monitorizando", detail: "Consumidores adicionales activos · backlog reduciéndose" },
    ],
    aiSummary:
      "Backlog en cola de emails desde 09:05 UTC por límite de consumer scaling. Mitigación aplicada: consumidores adicionales activos. Recomendación: revisar configuración de autoescalado para próximos picos.",
    errorRate: [0.0, 0.0, 0.1, 0.0, 0.1, 0.0, 0.0, 0.1, 0.0, 0.0, 0.0, 0.0],
    latency: [800, 950, 1200, 1400, 1600, 1800, 2200, 2600, 2400, 2100, 1700, 1300],
    createdAt: "hace 6 h",
  },
  {
    id: "INC-2025-004",
    severity: "low",
    status: "resolved",
    title: "Webhook de Stripe duplicado",
    impact: "1 organización afectada · 3 webhooks duplicados",
    services: ["Stripe"],
    orgs: { count: 1, names: ["Taco Loco Group"] },
    responsible: { name: "Laia Pont", initials: "LP" },
    timeline: [
      { at: "Ayer 22:10", status: "created", label: "Incidencia abierta", detail: "Doble entrega de evento invoice.paid" },
      { at: "Ayer 22:25", status: "investigating", label: "Investigando", detail: "Idempotencia de handler OK" },
      { at: "Ayer 22:48", status: "identified", label: "Causa identificada", detail: "Reintento de Stripe con retraso > 60s" },
      { at: "Ayer 23:02", status: "monitoring", label: "Monitorizando", detail: "Handler idempotente confirmado" },
      { at: "Ayer 23:30", status: "resolved", label: "Resuelta", detail: "Sin duplicados en últimas 28 min" },
    ],
    aiSummary:
      "Webhooks duplicados de Stripe causados por reintentos con retraso > 60s. Handler idempotente evitó doble facturación. Recomendación: mantener idempotencia y registrar event_id para trazabilidad.",
    errorRate: [0.1, 0.1, 0.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    latency: [180, 175, 170, 165, 160, 170, 175, 180, 170, 165, 160, 158],
    createdAt: "ayer 23:30",
  },
  {
    id: "INC-2025-005",
    severity: "medium",
    status: "open",
    title: "Aumento de no-shows en Ramses Barcelona",
    impact: "1 organización afectada · no-shows +18% en 7 días",
    services: ["Reservations"],
    orgs: { count: 1, names: ["Ramses Group"] },
    responsible: { name: "Pendiente asignar", initials: "??" },
    timeline: [
      { at: "08:00 UTC", status: "created", label: "Incidencia abierta", detail: "Detección automática por Analytics Engine" },
    ],
    aiSummary:
      "Aumento de no-shows del +18% en Ramses Barcelona los últimos 7 días. Patrón concentrado en reservas de fin de semana. Recomendación: activar confirmación por SMS 2h antes y revisar política de depósito.",
    errorRate: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    latency: [85, 88, 90, 92, 88, 85, 86, 90, 92, 88, 86, 85],
    createdAt: "hace 2 h",
  },
];

/* ---------------- mini chart ---------------- */
function MiniChart({
  data,
  type,
  color,
}: {
  data: number[];
  type: "error" | "latency";
  color: string;
}) {
  const max = Math.max(...data, type === "error" ? 1 : 100);
  const w = 180;
  const h = 44;
  const x = (i: number) => (i * w) / (data.length - 1);
  const y = (v: number) => h - (v / max) * h;
  const path = data
    .map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`)
    .join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;
  const label = type === "error" ? "Error rate" : "Latencia p95";
  const unit = type === "error" ? "%" : "ms";
  const last = data[data.length - 1];
  return (
    <div className="rounded-lg border border-border/40 bg-foreground/[0.02] p-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-[11px] font-mono" style={{ color }}>
          {last}
          {unit}
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-11" role="img" aria-label={`${label} últimas 12 muestras`}>
        <defs>
          <linearGradient id={`mc-${type}-${color.replace(/[^a-z0-9]/gi, "")}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#mc-${type}-${color.replace(/[^a-z0-9]/gi, "")})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/* ---------------- avatar ---------------- */
function ResponsibleAvatar({ name, initials }: { name: string; initials: string }) {
  const isUnassigned = initials === "??";
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-mono font-medium border",
          isUnassigned
            ? "border-dashed border-border/60 text-muted-foreground bg-foreground/[0.03]"
            : "border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold)]"
        )}
      >
        {initials}
      </div>
      <span className={cn("text-xs", isUnassigned ? "text-muted-foreground italic" : "text-foreground/85")}>
        {name}
      </span>
    </div>
  );
}

/* ---------------- timeline ---------------- */
function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="relative pl-5 space-y-2.5">
      {/* vertical line */}
      <span className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-gradient-to-b from-border/60 via-border/40 to-transparent" />
      {entries.map((e, i) => {
        const meta =
          e.status === "created"
            ? { dot: "bg-rose-400", cls: "text-rose-300" }
            : STATUS_META[e.status as IncidentStatus];
        return (
          <li key={i} className="relative">
            <span
              className={cn(
                "absolute -left-5 top-1 h-2.5 w-2.5 rounded-full border-2 border-background",
                meta.dot
              )}
            />
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-[10px] font-mono text-muted-foreground">{e.at}</span>
              <span className={cn("text-xs font-medium", meta.cls)}>{e.label}</span>
            </div>
            {e.detail && (
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                {e.detail}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ---------------- incident card ---------------- */
function IncidentCard({
  incident,
  onAction,
}: {
  incident: Incident;
  onAction: (action: string, inc: Incident) => void;
}) {
  const sev = SEVERITY_META[incident.severity];
  const st = STATUS_META[incident.status];
  const SevIcon = sev.icon;
  const StIcon = st.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rp-glass rounded-2xl p-4 sm:p-5"
    >
      {/* header row */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            className={cn(
              "h-9 w-9 shrink-0 rounded-lg border flex items-center justify-center",
              sev.cls
            )}
          >
            <SevIcon className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <code className="text-[11px] font-mono text-muted-foreground">{incident.id}</code>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                  sev.cls
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", sev.dot)} />
                {sev.label}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                  st.cls
                )}
              >
                <StIcon className="h-2.5 w-2.5" aria-hidden />
                {st.label}
              </span>
            </div>
            <h4 className="mt-1 text-base font-medium text-foreground/95 leading-snug">
              {incident.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">{incident.impact}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground shrink-0">
          <Clock className="h-3 w-3" aria-hidden />
          {incident.createdAt}
        </div>
      </div>

      {/* services + orgs */}
      <div className="mt-3 grid sm:grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
            Servicios afectados
          </div>
          <div className="flex flex-wrap gap-1.5">
            {incident.services.map((s) => {
              const Icon = SERVICE_ICON[s] ?? Server;
              return (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-foreground/[0.04] px-2 py-0.5 text-[11px] font-mono text-foreground/85"
                >
                  <Icon className="h-3 w-3 text-muted-foreground" aria-hidden />
                  {s}
                </span>
              );
            })}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
            Organizaciones afectadas ({incident.orgs.count})
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {incident.orgs.names.map((n) => (
              <span
                key={n}
                className="inline-flex items-center rounded-md border border-border/50 bg-foreground/[0.03] px-1.5 py-0.5 text-[11px] text-foreground/80"
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* responsible */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          Responsable:
        </span>
        <ResponsibleAvatar name={incident.responsible.name} initials={incident.responsible.initials} />
      </div>

      {/* AI summary */}
      <div className="mt-3 rounded-xl border border-[var(--teal)]/30 bg-[var(--teal)]/[0.06] p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <BrainCircuit className="h-3.5 w-3.5 text-[var(--teal)]" aria-hidden />
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]">
            Resumen IA
          </span>
          
        </div>
        <p className="text-xs text-foreground/85 leading-relaxed">{incident.aiSummary}</p>
      </div>

      {/* metrics + timeline */}
      <div className="mt-3 grid lg:grid-cols-2 gap-3">
        <div className="grid grid-cols-2 gap-2">
          <MiniChart data={incident.errorRate} type="error" color="#f87171" />
          <MiniChart data={incident.latency} type="latency" color="var(--gold)" />
        </div>
        <div className="rounded-lg border border-border/40 bg-foreground/[0.02] p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
            Línea de tiempo
          </div>
          <Timeline entries={incident.timeline} />
        </div>
      </div>

      {/* actions */}
      <div className="mt-3 pt-3 border-t border-border/40 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" className="h-8" onClick={() => onAction("details", incident)}>
          <Eye className="h-3.5 w-3.5 mr-1.5" aria-hidden />
          Ver detalles
        </Button>
        <Button variant="outline" size="sm" className="h-8" onClick={() => onAction("assign", incident)}>
          <UserPlus className="h-3.5 w-3.5 mr-1.5" aria-hidden />
          Asignar
        </Button>
        <Button variant="outline" size="sm" className="h-8" onClick={() => onAction("escalate", incident)}>
          <ArrowUp className="h-3.5 w-3.5 mr-1.5" aria-hidden />
          Escalar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 ml-auto border-rose-400/40 text-rose-300 hover:bg-rose-400/10"
          onClick={() => onAction("close", incident)}
        >
          <XCircle className="h-3.5 w-3.5 mr-1.5" aria-hidden />
          Cerrar
        </Button>
      </div>
    </motion.div>
  );
}

/* ---------------- new incident dialog ---------------- */
function NewIncidentDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (data: { title: string; severity: IncidentSeverity; services: string[]; description: string }) => void;
}) {
  const [title, setTitle] = React.useState("");
  const [severity, setSeverity] = React.useState<IncidentSeverity>("medium");
  const [description, setDescription] = React.useState("");
  const [services, setServices] = React.useState<string[]>([]);

  const toggleService = (s: string) => {
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const submit = () => {
    if (!title.trim()) return;
    onCreate({ title: title.trim(), severity, services, description: description.trim() });
    setTitle("");
    setDescription("");
    setServices([]);
    setSeverity("medium");
    onOpenChange(false);
  };

  const serviceOptions = ["API", "D1", "Queues", "AI Gateway", "Stripe", "Reservations", "Workers", "KV"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4 rp-gold-text" aria-hidden />
            Nueva incidencia
          </DialogTitle>
          <DialogDescription>
            Crea una nueva incidencia en el centro de control. Los datos se registran con
            correlation_id (demo).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Título
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="p. ej. Degradación de latencia en API"
            />
          </div>
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Severidad
            </Label>
            <Select value={severity} onValueChange={(v) => setSeverity(v as IncidentSeverity)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Crítica</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Servicios afectados
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {serviceOptions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleService(s)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-[11px] font-mono transition-colors min-h-[32px]",
                    services.includes(s)
                      ? "border-[var(--gold)]/50 bg-[var(--gold)]/10 text-[var(--gold)]"
                      : "border-border/50 bg-foreground/[0.03] text-foreground/80 hover:border-[var(--gold)]/30"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Descripción
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el impacto, los síntomas y cualquier contexto relevante…"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={submit}
            disabled={!title.trim()}
            className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
          >
            Crear incidencia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- details drawer ---------------- */
function IncidentDetailsDrawer({
  incident,
  onClose,
}: {
  incident: Incident | null;
  onClose: () => void;
}) {
  return (
    <Drawer open={!!incident} onOpenChange={(o) => !o && onClose()} direction="right">
      <DrawerContent className="sm:max-w-md w-full" data-vaul-drawer-direction="right">
        {incident && (
          <>
            <DrawerHeader>
              <DrawerDescription className="sr-only">Detalle de incidencia</DrawerDescription>
              <DrawerTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 rp-gold-text" aria-hidden />
                {incident.id}
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4 space-y-4 overflow-y-auto rp-scroll-thin max-h-[80vh]">
              <div>
                <h4 className="font-display text-lg">{incident.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{incident.impact}</p>
              </div>
              <div className="rounded-xl border border-[var(--teal)]/30 bg-[var(--teal)]/[0.06] p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <BrainCircuit className="h-3.5 w-3.5 text-[var(--teal)]" aria-hidden />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]">
                    Resumen IA
                  </span>
                  
                </div>
                <p className="text-xs text-foreground/85 leading-relaxed">{incident.aiSummary}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <MiniChart data={incident.errorRate} type="error" color="#f87171" />
                <MiniChart data={incident.latency} type="latency" color="var(--gold)" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Línea de tiempo completa
                </div>
                <Timeline entries={incident.timeline} />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Organizaciones afectadas
                </div>
                <ul className="space-y-1">
                  {incident.orgs.names.map((n) => (
                    <li key={n} className="text-xs text-foreground/85 flex items-center gap-2">
                      <Globe2 className="h-3 w-3 text-muted-foreground" aria-hidden />
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}

/* ---------------- main component ---------------- */
const STATUS_TABS = [
  { id: "all", label: "Todas" },
  { id: "open", label: "Abiertas" },
  { id: "investigating", label: "Investigando" },
  { id: "resolved", label: "Resueltas" },
] as const;

export function CcIncidents() {
  const { toast } = useToast();
  const [tab, setTab] = React.useState<(typeof STATUS_TABS)[number]["id"]>("all");
  const [sevFilter, setSevFilter] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");
  const [list, setList] = React.useState<Incident[]>(INCIDENTS);
  const [details, setDetails] = React.useState<Incident | null>(null);
  const [newOpen, setNewOpen] = React.useState(false);
  const [closeTarget, setCloseTarget] = React.useState<Incident | null>(null);

  // derived stats
  const stats = React.useMemo(() => {
    const open = list.filter((i) => i.status === "open").length;
    const investigating = list.filter((i) => i.status === "investigating").length;
    const criticalToday = list.filter(
      (i) => i.severity === "critical" && i.status !== "resolved"
    ).length;
    return { open, investigating, criticalToday };
  }, [list]);

  const filtered = React.useMemo(() => {
    return list.filter((i) => {
      if (tab === "open" && i.status !== "open") return false;
      if (tab === "investigating" && i.status !== "investigating") return false;
      if (tab === "resolved" && i.status !== "resolved") return false;
      if (sevFilter !== "all" && i.severity !== sevFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = (
          i.id +
          " " +
          i.title +
          " " +
          i.impact +
          " " +
          i.services.join(" ") +
          " " +
          i.orgs.names.join(" ")
        ).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [list, tab, sevFilter, search]);

  const onAction = (action: string, inc: Incident) => {
    if (action === "details") {
      setDetails(inc);
    } else if (action === "assign") {
      toast({
        title: "Asignar incidencia (demo)",
        description: `${inc.id} · pendiente de seleccionar responsable`,
      });
    } else if (action === "escalate") {
      toast({
        title: "Incidencia escalada (demo)",
        description: `${inc.id} · notificado a on-call L2`,
      });
    } else if (action === "close") {
      setCloseTarget(inc);
    }
  };

  const confirmClose = () => {
    if (!closeTarget) return;
    setList((prev) =>
      prev.map((i) =>
        i.id === closeTarget.id
          ? {
              ...i,
              status: "resolved" as IncidentStatus,
              timeline: [
                ...i.timeline,
                {
                  at: "ahora",
                  status: "resolved" as IncidentStatus,
                  label: "Resuelta",
                  detail: "Cerrada manualmente desde el centro de incidencias",
                },
              ],
            }
          : i
      )
    );
    toast({
      title: "Incidencia cerrada",
      description: `${closeTarget.id} marcada como resuelta (demo)`,
    });
    setCloseTarget(null);
  };

  const onCreate = (data: {
    title: string;
    severity: IncidentSeverity;
    services: string[];
    description: string;
  }) => {
    const newId = `INC-2025-${String(list.length + 6).padStart(3, "0")}`;
    const newInc: Incident = {
      id: newId,
      severity: data.severity,
      status: "open",
      title: data.title,
      impact: "Impacto por confirmar · datos demo",
      services: data.services.length ? data.services : ["API"],
      orgs: { count: 0, names: ["Pendiente"] },
      responsible: { name: "Pendiente asignar", initials: "??" },
      timeline: [
        {
          at: "ahora",
          status: "created",
          label: "Incidencia abierta",
          detail: data.description || "Creada manualmente desde el centro de incidencias",
        },
      ],
      aiSummary:
        "Pendiente de análisis IA. El resumen se generará cuando se disponga de métricas suficientes (demo).",
      errorRate: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
      latency: [120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120],
      createdAt: "ahora",
    };
    setList((prev) => [newInc, ...prev]);
    toast({
      title: "Incidencia creada",
      description: `${newId} · ${data.title} (demo)`,
    });
  };

  return (
    <section aria-label="Centro de incidencias" className="space-y-4">
      {/* Header */}
      <div className="rp-glass-strong rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-xl border border-rose-400/30 bg-rose-400/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-rose-300" aria-hidden />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display text-lg sm:text-xl font-medium tracking-tight">
                  Centro de incidencias
                </h3>
                
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Gestión y resolución de incidencias de plataforma con resumen IA.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setNewOpen(true)}
            className="h-9 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" aria-hidden />
            Nueva incidencia
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-rose-400/30 bg-rose-400/[0.06] p-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Abiertas
            </div>
            <div className="font-display text-2xl font-light text-rose-300 mt-0.5">
              {stats.open}
            </div>
          </div>
          <div className="rounded-lg border border-amber-400/30 bg-amber-400/[0.06] p-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Investigando
            </div>
            <div className="font-display text-2xl font-light text-amber-300 mt-0.5">
              {stats.investigating}
            </div>
          </div>
          <div className="rounded-lg border border-border/40 bg-foreground/[0.03] p-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Críticas hoy
            </div>
            <div className="font-display text-2xl font-light text-foreground/80 mt-0.5">
              {stats.criticalToday}
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="rp-glass rounded-2xl p-3 sm:p-4 space-y-3">
        {/* status tabs */}
        <div
          role="tablist"
          aria-label="Filtrar por estado"
          className="flex items-center gap-1 overflow-x-auto rp-scroll-thin pb-1"
        >
          {STATUS_TABS.map((t) => {
            const count =
              t.id === "all"
                ? list.length
                : list.filter((i) =>
                    t.id === "open"
                      ? i.status === "open"
                      : t.id === "investigating"
                      ? i.status === "investigating"
                      : i.status === "resolved"
                  ).length;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap min-h-[40px]",
                  isActive
                    ? "bg-foreground/[0.06] text-foreground border border-border/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03] border border-transparent"
                )}
              >
                {t.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-mono",
                    isActive ? "bg-[var(--gold)]/20 text-[var(--gold)]" : "bg-foreground/5 text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* search + severity */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por ID, título, organización, servicio…"
              className="pl-9 h-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden />
            <Select value={sevFilter} onValueChange={setSevFilter}>
              <SelectTrigger className="w-full sm:w-44 h-10">
                <SelectValue placeholder="Severidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las severidades</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rp-glass rounded-2xl p-10 text-center"
            >
              <div className="h-12 w-12 mx-auto rounded-xl border border-border/40 bg-foreground/[0.03] flex items-center justify-center mb-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" aria-hidden />
              </div>
              <div className="text-sm font-medium text-foreground/90">
                No hay incidencias con estos filtros
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Ajusta los filtros o crea una nueva incidencia.
              </div>
            </motion.div>
          ) : (
            filtered.map((inc) => (
              <IncidentCard key={inc.id} incident={inc} onAction={onAction} />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="text-[11px] font-mono text-muted-foreground text-center pt-2 flex items-center justify-center gap-2">
        <Zap className="h-3 w-3 rp-gold-text" aria-hidden />
        Centro de incidencias · datos demo · correlaciones con correlation_id registradas
      </div>

      {/* Drawers / dialogs */}
      <IncidentDetailsDrawer incident={details} onClose={() => setDetails(null)} />
      <NewIncidentDialog open={newOpen} onOpenChange={setNewOpen} onCreate={onCreate} />

      <AlertDialog open={!!closeTarget} onOpenChange={(o) => !o && setCloseTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-rose-300" aria-hidden />
              Cerrar incidencia {closeTarget?.id}
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Confirmas que la incidencia &quot;{closeTarget?.title}&quot; está resuelta? Se
              añadirá una entrada de cierre a la línea de tiempo y el estado pasará a
              &quot;Resuelta&quot;. Esta acción queda registrada para auditoría (demo).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmClose}
              className="bg-rose-500/90 text-white hover:bg-rose-500"
            >
              Cerrar incidencia
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
