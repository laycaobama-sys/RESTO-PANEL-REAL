"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Download,
  Trash2,
  UserX,
  FileText,
  Eye,
  History,
  AlertTriangle,
  Database,
  Clock,
  ScrollText,
  Check,
  X,
  Filter,
  Plus,
  ChevronRight,
  FileJson,
  FileSpreadsheet,
  Pencil,
  Ban,
  ExternalLink,
  Save,
  ScanSearch,
  HardDrive,
  Inbox,
  UserCog,
  Bot,
  Server,
} from "lucide-react";

/* =========================================================
 * Types — exact from spec
 * =======================================================*/
type ConsentChannel = "email" | "whatsapp" | "sms" | "push" | "phone";
type ConsentPurpose = "service" | "marketing" | "analytics" | "profiling" | "third_party";

interface ConsentRecord {
  channel: ConsentChannel;
  purpose: ConsentPurpose;
  granted: boolean;
  grantedAt?: string;
  revokedAt?: string;
  source: string; // "web_form" | "api" | "manual" | "imported"
  history: { at: string; action: "granted" | "revoked"; by: string; source: string }[];
}

interface DataRequest {
  id: string;
  type: "access" | "rectification" | "export" | "deletion" | "anonymization" | "restriction" | "portability";
  status: "pending" | "processing" | "completed" | "rejected";
  requestedAt: string;
  completedAt?: string;
  requestedBy: string;
  reason?: string;
  artifacts?: string[];
}

interface AuditEntry {
  id: string;
  at: string;
  actor: { type: "user" | "system"; name: string };
  action: string;
  actionCategory:
    | "consent"
    | "data_request"
    | "export"
    | "anonymization"
    | "staff_access"
    | "retention"
    | "rectification";
  resource: string;
  ip: string;
  reason?: string;
  result: "success" | "denied" | "error";
}

/* =========================================================
 * Meta — channels & purposes
 * =======================================================*/
const CHANNELS: {
  id: ConsentChannel;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "email", label: "Email", icon: FileText },
  { id: "whatsapp", label: "WhatsApp", icon: FileText },
  { id: "sms", label: "SMS", icon: FileText },
  { id: "push", label: "Push", icon: FileText },
  { id: "phone", label: "Teléfono", icon: FileText },
];

const PURPOSES: {
  id: ConsentPurpose;
  label: string;
  description: string;
  required?: boolean;
}[] = [
  {
    id: "service",
    label: "Servicio",
    description: "Prestación del servicio contratado",
    required: true,
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Comunicaciones comerciales y promociones",
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Análisis de comportamiento agregado",
  },
  {
    id: "profiling",
    label: "Profiling",
    description: "Perfilamiento para recomendaciones IA",
  },
  {
    id: "third_party",
    label: "Terceros",
    description: "Cesión a terceros autorizados",
  },
];

const SOURCE_LABEL: Record<string, string> = {
  web_form: "Formulario web",
  api: "API",
  manual: "Manual",
  imported: "Importado",
};

const REQ_TYPE_META: Record<
  DataRequest["type"],
  { label: string; icon: React.ElementType; tone: string }
> = {
  access: { label: "Acceso", icon: Eye, tone: "teal" },
  rectification: { label: "Rectificación", icon: Pencil, tone: "gold" },
  export: { label: "Exportación", icon: Download, tone: "teal" },
  deletion: { label: "Eliminación", icon: Trash2, tone: "destructive" },
  anonymization: { label: "Anonimización", icon: UserX, tone: "destructive" },
  restriction: { label: "Restricción", icon: Ban, tone: "gold" },
  portability: { label: "Portabilidad", icon: FileJson, tone: "teal" },
};

const REQ_STATUS_META: Record<
  DataRequest["status"],
  { label: string; tone: string }
> = {
  pending: { label: "Pendiente", tone: "amber" },
  processing: { label: "Procesando", tone: "teal" },
  completed: { label: "Completada", tone: "emerald" },
  rejected: { label: "Rechazada", tone: "destructive" },
};

const AUDIT_CATEGORY_META: Record<
  AuditEntry["actionCategory"],
  { label: string; icon: React.ElementType; tone: string }
> = {
  consent: { label: "Consentimiento", icon: ShieldCheck, tone: "teal" },
  data_request: { label: "Solicitud de datos", icon: FileText, tone: "gold" },
  export: { label: "Exportación", icon: Download, tone: "teal" },
  anonymization: { label: "Anonimización", icon: UserX, tone: "destructive" },
  staff_access: { label: "Acceso de staff", icon: UserCog, tone: "gold" },
  retention: { label: "Retención", icon: HardDrive, tone: "teal" },
  rectification: { label: "Rectificación", icon: Pencil, tone: "gold" },
};

const RESULT_META: Record<AuditEntry["result"], { label: string; tone: string }> = {
  success: { label: "OK", tone: "emerald" },
  denied: { label: "Denegado", tone: "amber" },
  error: { label: "Error", tone: "destructive" },
};

/* =========================================================
 * Demo data
 * =======================================================*/
const NOW = Date.now();
const iso = (offsetMs: number) => new Date(NOW - offsetMs).toISOString();

type ConsentSeed = { granted: boolean; source: string };

const SEED_GRID: Record<ConsentChannel, Record<ConsentPurpose, ConsentSeed>> = {
  email: {
    service: { granted: true, source: "web_form" },
    marketing: { granted: true, source: "web_form" },
    analytics: { granted: true, source: "web_form" },
    profiling: { granted: false, source: "manual" },
    third_party: { granted: false, source: "manual" },
  },
  whatsapp: {
    service: { granted: true, source: "api" },
    marketing: { granted: true, source: "api" },
    analytics: { granted: false, source: "manual" },
    profiling: { granted: false, source: "manual" },
    third_party: { granted: false, source: "manual" },
  },
  sms: {
    service: { granted: true, source: "web_form" },
    marketing: { granted: false, source: "manual" },
    analytics: { granted: false, source: "manual" },
    profiling: { granted: false, source: "manual" },
    third_party: { granted: false, source: "manual" },
  },
  push: {
    service: { granted: true, source: "api" },
    marketing: { granted: true, source: "api" },
    analytics: { granted: true, source: "api" },
    profiling: { granted: false, source: "manual" },
    third_party: { granted: false, source: "manual" },
  },
  phone: {
    service: { granted: true, source: "imported" },
    marketing: { granted: false, source: "manual" },
    analytics: { granted: false, source: "manual" },
    profiling: { granted: false, source: "manual" },
    third_party: { granted: false, source: "manual" },
  },
};

function seedConsent(): ConsentRecord[] {
  const recs: ConsentRecord[] = [];
  const channels = Object.keys(SEED_GRID) as ConsentChannel[];
  channels.forEach((channel, ci) => {
    const purposes = Object.keys(SEED_GRID[channel]) as ConsentPurpose[];
    purposes.forEach((purpose, pi) => {
      const cell: ConsentSeed = SEED_GRID[channel][purpose];
      const grantedAt = cell.granted ? iso(1000 * 60 * 60 * 24 * (30 + ci * 5 + pi)) : undefined;
      const revokedAt = !cell.granted ? iso(1000 * 60 * 60 * 24 * (10 + ci + pi)) : undefined;
      recs.push({
        channel,
        purpose,
        granted: cell.granted,
        grantedAt,
        revokedAt,
        source: cell.source,
        history: [
          {
            at: iso(1000 * 60 * 60 * 24 * (60 + ci * 5 + pi)),
            action: "granted",
            by: "Sistema",
            source: cell.source,
          },
          ...(!cell.granted
            ? [
                {
                  at: iso(1000 * 60 * 60 * 24 * (10 + ci + pi)),
                  action: "revoked" as const,
                  by: "Elena Marín",
                  source: "web_form",
                },
              ]
            : []),
        ],
      });
    });
  });
  return recs;
}

const DEMO_REQUESTS: DataRequest[] = [
  {
    id: "DR-2025-001",
    type: "access",
    status: "completed",
    requestedAt: iso(1000 * 60 * 60 * 24 * 12),
    completedAt: iso(1000 * 60 * 60 * 24 * 10),
    requestedBy: "Elena Marín",
    reason: "Verificación de datos personales almacenados",
    artifacts: ["datos-personales-DR-2025-001.json"],
  },
  {
    id: "DR-2025-002",
    type: "rectification",
    status: "completed",
    requestedAt: iso(1000 * 60 * 60 * 24 * 9),
    completedAt: iso(1000 * 60 * 60 * 24 * 8),
    requestedBy: "Elena Marín",
    reason: "Correo electrónico desactualizado",
  },
  {
    id: "DR-2025-003",
    type: "export",
    status: "completed",
    requestedAt: iso(1000 * 60 * 60 * 24 * 5),
    completedAt: iso(1000 * 60 * 60 * 24 * 5),
    requestedBy: "Elena Marín",
    artifacts: ["export-DR-2025-003.json", "export-DR-2025-003.csv"],
  },
  {
    id: "DR-2025-004",
    type: "restriction",
    status: "processing",
    requestedAt: iso(1000 * 60 * 60 * 24 * 2),
    requestedBy: "Marco Bellini",
    reason: "Solicitud temporal durante disputa",
  },
  {
    id: "DR-2025-005",
    type: "deletion",
    status: "pending",
    requestedAt: iso(1000 * 60 * 60 * 18),
    requestedBy: "Javier Soler",
    reason: "Ya no es cliente del restaurante",
  },
  {
    id: "DR-2025-006",
    type: "anonymization",
    status: "rejected",
    requestedAt: iso(1000 * 60 * 60 * 24 * 30),
    completedAt: iso(1000 * 60 * 60 * 24 * 28),
    requestedBy: "Anónimo",
    reason: "Solicitud no verificada — falta identificación",
  },
];

const DEMO_AUDIT: AuditEntry[] = [
  {
    id: "aud-001",
    at: iso(1000 * 60 * 60 * 24 * 28),
    actor: { type: "system", name: "GDPR Worker" },
    action: "Solicitud de anonimización rechazada",
    actionCategory: "anonymization",
    resource: "DR-2025-006 · perfil anónimo",
    ip: "84.124.x.x",
    reason: "Identidad no verificada",
    result: "denied",
  },
  {
    id: "aud-002",
    at: iso(1000 * 60 * 60 * 24 * 18),
    actor: { type: "user", name: "Javier Soler" },
    action: "Solicitud de eliminación creada",
    actionCategory: "data_request",
    resource: "DR-2025-005 · perfil cust-0042",
    ip: "84.124.x.x",
    reason: "Ya no es cliente",
    result: "success",
  },
  {
    id: "aud-003",
    at: iso(1000 * 60 * 60 * 24 * 5),
    actor: { type: "system", name: "Export Worker" },
    action: "Exportación de datos generada",
    actionCategory: "export",
    resource: "DR-2025-003 · export-DR-2025-003.json",
    ip: "10.0.x.x",
    reason: "Cumplimiento solicitud de portabilidad",
    result: "success",
  },
  {
    id: "aud-004",
    at: iso(1000 * 60 * 60 * 24 * 3),
    actor: { type: "user", name: "Marco Bellini" },
    action: "Acceso a perfil propio",
    actionCategory: "staff_access",
    resource: "perfil cust-0018",
    ip: "91.121.x.x",
    result: "success",
  },
  {
    id: "aud-005",
    at: iso(1000 * 60 * 60 * 24 * 2),
    actor: { type: "user", name: "Carlos Méndez (Manager)" },
    action: "Acceso de staff a perfil de cliente",
    actionCategory: "staff_access",
    resource: "perfil cust-0007 · Elena Marín",
    ip: "192.168.x.x",
    reason: "Resolución de incidencia de reserva",
    result: "success",
  },
  {
    id: "aud-006",
    at: iso(1000 * 60 * 60 * 24 * 1.5),
    actor: { type: "user", name: "Elena Marín" },
    action: "Consentimiento revocado · WhatsApp · Analytics",
    actionCategory: "consent",
    resource: "consent:whatsapp:analytics",
    ip: "84.124.x.x",
    reason: "Preferencia del usuario",
    result: "success",
  },
  {
    id: "aud-007",
    at: iso(1000 * 60 * 60 * 24 * 0.6),
    actor: { type: "user", name: "Elena Marín" },
    action: "Consentimiento otorgado · Email · Marketing",
    actionCategory: "consent",
    resource: "consent:email:marketing",
    ip: "84.124.x.x",
    result: "success",
  },
  {
    id: "aud-008",
    at: iso(1000 * 60 * 60 * 4),
    actor: { type: "system", name: "Retention Worker" },
    action: "Aplicación de política de retención",
    actionCategory: "retention",
    resource: "logs antiguos > 2 años",
    ip: "10.0.x.x",
    reason: "Política de retención automática",
    result: "success",
  },
  {
    id: "aud-009",
    at: iso(1000 * 60 * 60 * 2),
    actor: { type: "user", name: "Sistema" },
    action: "Rectificación de datos aplicada",
    actionCategory: "rectification",
    resource: "perfil cust-0007 · email",
    ip: "10.0.x.x",
    reason: "Solicitud DR-2025-002 completada",
    result: "success",
  },
  {
    id: "aud-010",
    at: iso(1000 * 60 * 30),
    actor: { type: "user", name: "María López (Hostess)" },
    action: "Acceso de staff a perfil de cliente",
    actionCategory: "staff_access",
    resource: "perfil cust-0124",
    ip: "192.168.x.x",
    reason: "Check-in de reserva",
    result: "success",
  },
];

/* =========================================================
 * Helpers
 * =======================================================*/
function fmtDate(isoStr?: string): string {
  if (!isoStr) return "—";
  return new Date(isoStr).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtDateTime(isoStr?: string): string {
  if (!isoStr) return "—";
  return new Date(isoStr).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtRelative(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "hace instantes";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}

function toneBadge(tone: string): string {
  switch (tone) {
    case "gold":
      return "border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)]";
    case "teal":
      return "border-[var(--teal)]/30 bg-[var(--teal)]/10 text-[var(--teal)]";
    case "emerald":
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
    case "amber":
      return "border-amber-400/30 bg-amber-400/10 text-amber-300";
    case "destructive":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

/* =========================================================
 * Shared UI atoms
 * =======================================================*/
function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-amber-300">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden />
      demo
    </span>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  description,
  right,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-display text-lg font-medium tracking-tight sm:text-xl">{title}</h2>
            <DemoBadge />
          </div>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground max-w-2xl">{description}</p>
          )}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

function Note({
  children,
  variant = "info",
}: {
  children: React.ReactNode;
  variant?: "info" | "warn" | "danger";
}) {
  const cls =
    variant === "danger"
      ? "border-destructive/30 bg-destructive/5 text-destructive"
      : variant === "warn"
      ? "border-amber-400/30 bg-amber-400/5 text-amber-200"
      : "border-[var(--teal)]/30 bg-[var(--teal)]/5 text-[var(--teal)]";
  return (
    <div className={cn("flex items-start gap-2.5 rounded-xl border p-3.5 text-sm", cls)}>
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p className="leading-relaxed">{children}</p>
    </div>
  );
}

/* =========================================================
 * Consents tab — matrix + history
 * =======================================================*/
interface ConsentTabProps {
  consents: ConsentRecord[];
  onToggle: (channel: ConsentChannel, purpose: ConsentPurpose) => void;
}

function ConsentTab({ consents, onToggle }: ConsentTabProps) {
  const reduce = useReducedMotion();
  const [pending, setPending] = React.useState<{
    channel: ConsentChannel;
    purpose: ConsentPurpose;
  } | null>(null);

  function getRec(channel: ConsentChannel, purpose: ConsentPurpose): ConsentRecord | undefined {
    return consents.find((c) => c.channel === channel && c.purpose === purpose);
  }

  function confirmToggle() {
    if (!pending) return;
    onToggle(pending.channel, pending.purpose);
    setPending(null);
  }

  const pendingRec = pending ? getRec(pending.channel, pending.purpose) : undefined;

  // Flatten history across all cells, sort desc
  const flatHistory = React.useMemo(() => {
    const rows: {
      at: string;
      channel: ConsentChannel;
      purpose: ConsentPurpose;
      action: "granted" | "revoked";
      by: string;
      source: string;
    }[] = [];
    consents.forEach((c) => {
      c.history.forEach((h) => {
        rows.push({
          at: h.at,
          channel: c.channel,
          purpose: c.purpose,
          action: h.action,
          by: h.by,
          source: h.source,
        });
      });
    });
    return rows.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [consents]);

  return (
    <div className="space-y-5">
      {/* Matrix desktop */}
      <div className="rp-glass rounded-2xl p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-display text-base font-medium">Matriz de consentimientos</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Filas: canales · Columnas: finalidades · Servicio siempre obligatorio
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3 w-3 text-[var(--gold)]" aria-hidden /> Bloqueado
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden /> Otorgado
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/40" aria-hidden /> Revocado
            </span>
          </div>
        </div>

        {/* Desktop grid */}
        <div className="hidden lg:block overflow-x-auto rp-scroll-thin">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-background/60 backdrop-blur-sm text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-3 py-2.5">
                  Canal \ Finalidad
                </th>
                {PURPOSES.map((p) => (
                  <th
                    key={p.id}
                    className="px-3 py-2.5 text-center min-w-[110px]"
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-xs font-medium text-foreground flex items-center gap-1">
                        {p.label}
                        {p.required && (
                          <Lock className="h-3 w-3 text-[var(--gold)]" aria-hidden />
                        )}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-normal leading-tight max-w-[100px]">
                        {p.description}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CHANNELS.map((ch) => (
                <tr key={ch.id}>
                  <td className="sticky left-0 z-10 bg-background/60 backdrop-blur-sm px-3 py-3 text-sm font-medium border-t border-border/60">
                    <div className="flex items-center gap-2">
                      <ch.icon className="h-4 w-4 text-[var(--teal)]" aria-hidden />
                      {ch.label}
                    </div>
                  </td>
                  {PURPOSES.map((p) => {
                    const rec = getRec(ch.id, p.id);
                    const isLocked = p.required;
                    return (
                      <td key={p.id} className="px-3 py-3 text-center border-t border-border/60">
                        <div className="flex flex-col items-center gap-1">
                          <Switch
                            checked={!!rec?.granted}
                            disabled={isLocked}
                            onCheckedChange={() => {
                              if (isLocked) return;
                              setPending({ channel: ch.id, purpose: p.id });
                            }}
                            aria-label={`${ch.label} · ${p.label}`}
                          />
                          <span
                            className={cn(
                              "text-[10px] font-mono uppercase tracking-wider",
                              rec?.granted
                                ? "text-emerald-300"
                                : "text-muted-foreground"
                            )}
                          >
                            {rec?.granted ? "OK" : "OFF"}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: stacked cards per channel */}
        <div className="lg:hidden space-y-3">
          {CHANNELS.map((ch) => (
            <div
              key={ch.id}
              className="rounded-xl border border-border/60 bg-background/40 p-3"
            >
              <div className="flex items-center gap-2 mb-2.5">
                <ch.icon className="h-4 w-4 text-[var(--teal)]" aria-hidden />
                <span className="text-sm font-medium">{ch.label}</span>
              </div>
              <div className="space-y-2">
                {PURPOSES.map((p) => {
                  const rec = getRec(ch.id, p.id);
                  const isLocked = p.required;
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-2 rounded-lg bg-background/30 px-3 py-2 min-h-[44px]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-medium truncate">{p.label}</span>
                        {isLocked && (
                          <Lock className="h-3 w-3 text-[var(--gold)] shrink-0" aria-hidden />
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={cn(
                            "text-[10px] font-mono uppercase tracking-wider",
                            rec?.granted ? "text-emerald-300" : "text-muted-foreground"
                          )}
                        >
                          {rec?.granted ? "OK" : "OFF"}
                        </span>
                        <Switch
                          checked={!!rec?.granted}
                          disabled={isLocked}
                          onCheckedChange={() => {
                            if (isLocked) return;
                            setPending({ channel: ch.id, purpose: p.id });
                          }}
                          aria-label={`${ch.label} · ${p.label}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <Note variant="info">
        El consentimiento de servicio es obligatorio para prestar el servicio. Los demás consentimientos son
        voluntarios y pueden retirarse en cualquier momento. La retirada del consentimiento no afecta a la
        licitud del tratamiento previo.
      </Note>

      {/* History log */}
      <div className="rp-glass rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-[var(--gold)]" aria-hidden />
            <h3 className="font-display text-base font-medium">Historial de consentimientos</h3>
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              inmutable · {flatHistory.length} eventos
            </span>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto rp-scroll-thin rounded-xl border border-border/40 bg-background/30">
          <ul className="divide-y divide-border/40">
            <AnimatePresence initial={false}>
              {flatHistory.map((h, idx) => {
                const granted = h.action === "granted";
                return (
                  <motion.li
                    key={`${h.at}-${idx}`}
                    initial={reduce ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-start gap-3 px-3 py-2.5 text-sm"
                  >
                    <span
                      className={cn(
                        "mt-1 h-2 w-2 rounded-full shrink-0",
                        granted ? "bg-emerald-400" : "bg-destructive"
                      )}
                      aria-hidden
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span
                          className={cn(
                            "text-xs font-mono uppercase tracking-wider px-1.5 py-0.5 rounded",
                            granted
                              ? "bg-emerald-400/10 text-emerald-300"
                              : "bg-destructive/10 text-destructive"
                          )}
                        >
                          {granted ? "Otorgado" : "Revocado"}
                        </span>
                        <span className="font-medium">
                          {CHANNELS.find((c) => c.id === h.channel)?.label}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">
                          {PURPOSES.find((p) => p.id === h.purpose)?.label}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-muted-foreground font-mono">
                        {fmtDateTime(h.at)} · por {h.by} · origen {SOURCE_LABEL[h.source] ?? h.source}
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </div>
      </div>

      {/* Confirm dialog */}
      <Dialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar cambio de consentimiento</DialogTitle>
            <DialogDescription>
              Este cambio quedará registrado en el historial inmutable de consentimientos.
            </DialogDescription>
          </DialogHeader>
          {pending && pendingRec && (
            <div className="space-y-3">
              <div className="rounded-lg border border-border/60 bg-background/40 p-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      Canal
                    </div>
                    <div className="font-medium">{CHANNELS.find((c) => c.id === pending.channel)?.label}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      Finalidad
                    </div>
                    <div className="font-medium">{PURPOSES.find((p) => p.id === pending.purpose)?.label}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      Estado actual
                    </div>
                    <div className={cn("font-medium", pendingRec.granted ? "text-emerald-300" : "text-muted-foreground")}>
                      {pendingRec.granted ? "Otorgado" : "Revocado"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      Nuevo estado
                    </div>
                    <div className={cn("font-medium", pendingRec.granted ? "text-destructive" : "text-emerald-300")}>
                      {pendingRec.granted ? "Revocado" : "Otorgado"}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {pendingRec.granted
                  ? "Al revocar el consentimiento se suspenderán las comunicaciones por este canal y finalidad. La retirada no afecta a la licitud del tratamiento previo."
                  : "Al otorgar el consentimiento se habilitarán las comunicaciones por este canal y finalidad, conforme a la política de privacidad."}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPending(null)} className="min-h-11">
              Cancelar
            </Button>
            <Button
              onClick={confirmToggle}
              className={cn(
                "min-h-11",
                pendingRec?.granted
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
              )}
            >
              {pendingRec?.granted ? "Revocar consentimiento" : "Otorgar consentimiento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =========================================================
 * Data rights tab — 6 cards
 * =======================================================*/
interface DataRightsTabProps {
  onCreateRequest: (
    type: DataRequest["type"],
    reason?: string,
    artifacts?: string[]
  ) => void;
}

function DataRightsTab({ onCreateRequest }: DataRightsTabProps) {
  const reduce = useReducedMotion();
  const [rectOpen, setRectOpen] = React.useState(false);
  const [delOpen, setDelOpen] = React.useState(false);
  const [anonOpen, setAnonOpen] = React.useState(false);
  const [anonTyped, setAnonTyped] = React.useState("");
  const [delReason, setDelReason] = React.useState("");
  const [rectField, setRectField] = React.useState("");
  const [rectValue, setRectValue] = React.useState("");
  const [rectReason, setRectReason] = React.useState("");

  const cards: {
    id: DataRequest["type"];
    icon: React.ElementType;
    title: string;
    description: string;
    cta: string;
    destructive?: boolean;
    onClick: () => void;
  }[] = [
    {
      id: "access",
      icon: Eye,
      title: "Acceso",
      description: "Solicitar copia de todos los datos personales",
      cta: "Solicitar acceso",
      onClick: () => onCreateRequest("access", "Solicitud de acceso a datos personales"),
    },
    {
      id: "rectification",
      icon: Pencil,
      title: "Rectificación",
      description: "Corregir datos inexactos o incompletos",
      cta: "Solicitar rectificación",
      onClick: () => setRectOpen(true),
    },
    {
      id: "export",
      icon: Download,
      title: "Exportación (Portabilidad)",
      description: "Recibir datos en formato estructurado (JSON/CSV)",
      cta: "Exportar datos",
      onClick: () =>
        onCreateRequest("export", "Solicitud de exportación de datos", [
          "export-personal-data.json",
          "export-personal-data.csv",
        ]),
    },
    {
      id: "deletion",
      icon: Trash2,
      title: "Eliminación",
      description: "Solicitar borrado de datos personales",
      cta: "Solicitar eliminación",
      destructive: true,
      onClick: () => setDelOpen(true),
    },
    {
      id: "anonymization",
      icon: UserX,
      title: "Anonimización",
      description: "Anonimizar irreversiblemente el perfil",
      cta: "Anonimizar",
      destructive: true,
      onClick: () => setAnonOpen(true),
    },
    {
      id: "restriction",
      icon: Ban,
      title: "Restricción",
      description: "Limitar el tratamiento de datos temporalmente",
      cta: "Solicitar restricción",
      onClick: () => onCreateRequest("restriction", "Solicitud de restricción de tratamiento"),
    },
  ];

  function submitRect() {
    const reason = `Campo: ${rectField} · Nuevo valor: ${rectValue}${rectReason ? ` · Motivo: ${rectReason}` : ""}`;
    onCreateRequest("rectification", reason);
    setRectOpen(false);
    setRectField("");
    setRectValue("");
    setRectReason("");
  }

  function submitDel() {
    onCreateRequest("deletion", delReason || "Solicitud de eliminación de datos personales");
    setDelOpen(false);
    setDelReason("");
  }

  function submitAnon() {
    if (anonTyped !== "ANONIMIZAR") return;
    onCreateRequest("anonymization", "Anonimización irreversible solicitada por el cliente");
    setAnonOpen(false);
    setAnonTyped("");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card, idx) => (
          <motion.div
            key={card.id}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: reduce ? 0 : idx * 0.03 }}
            className={cn(
              "rp-glass rounded-2xl p-5 flex flex-col gap-3",
              card.destructive && "border-destructive/30"
            )}
          >
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-xl border",
                  card.destructive
                    ? "border-destructive/30 bg-destructive/10 text-destructive"
                    : "border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold)]"
                )}
              >
                <card.icon className="h-5 w-5" aria-hidden />
              </div>
              {card.destructive && (
                <Badge variant="outline" className={cn("border-destructive/30 text-destructive")}>
                  <AlertTriangle className="h-3 w-3 mr-1" aria-hidden /> destructivo
                </Badge>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-display text-base font-medium">{card.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{card.description}</p>
            </div>
            <Button
              onClick={card.onClick}
              variant="outline"
              className={cn(
                "min-h-11 w-full justify-center",
                card.destructive
                  ? "border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  : "border-[var(--gold)]/40 text-[var(--gold-soft)] hover:bg-[var(--gold)]/10"
              )}
            >
              {card.cta}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Rectification dialog */}
      <Dialog open={rectOpen} onOpenChange={setRectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar rectificación</DialogTitle>
            <DialogDescription>
              Indica el campo a corregir, el nuevo valor y el motivo. Se creará una solicitud verificable.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="rect-field">Campo a corregir</Label>
              <Input
                id="rect-field"
                value={rectField}
                onChange={(e) => setRectField(e.target.value)}
                placeholder="Ej. email, teléfono, dirección…"
                className="min-h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rect-value">Nuevo valor</Label>
              <Input
                id="rect-value"
                value={rectValue}
                onChange={(e) => setRectValue(e.target.value)}
                placeholder="Nuevo valor correcto"
                className="min-h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rect-reason">Motivo (opcional)</Label>
              <Textarea
                id="rect-reason"
                value={rectReason}
                onChange={(e) => setRectReason(e.target.value)}
                placeholder="Razón de la rectificación…"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRectOpen(false)} className="min-h-11">
              Cancelar
            </Button>
            <Button
              onClick={submitRect}
              disabled={!rectField.trim() || !rectValue.trim()}
              className="min-h-11 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
            >
              Crear solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deletion AlertDialog */}
      <AlertDialog open={delOpen} onOpenChange={setDelOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" aria-hidden /> ¿Solicitar eliminación?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se iniciarán las obligaciones legales de retención. Algunos datos pueden conservarse por obligación legal.
              La solicitud será revisada por el equipo antes de ejecutarse.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="del-reason">Motivo (opcional)</Label>
            <Textarea
              id="del-reason"
              value={delReason}
              onChange={(e) => setDelReason(e.target.value)}
              placeholder="Razón de la solicitud de eliminación…"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={submitDel}
              className="min-h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Solicitar eliminación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Anonymization AlertDialog — typed confirmation */}
      <AlertDialog open={anonOpen} onOpenChange={setAnonOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <UserX className="h-4 w-4" aria-hidden /> Anonimización irreversible
            </AlertDialogTitle>
            <AlertDialogDescription>
              La anonimización es irreversible. Todos los datos personales se reemplazarán por valores anónimos.
              El historial analítico se conservará agregado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="anon-typed">
              Para confirmar, escribe <span className="font-mono font-bold text-destructive">ANONIMIZAR</span>
            </Label>
            <Input
              id="anon-typed"
              value={anonTyped}
              onChange={(e) => setAnonTyped(e.target.value)}
              placeholder="ANONIMIZAR"
              className="min-h-11 font-mono"
              autoComplete="off"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={submitAnon}
              disabled={anonTyped !== "ANONIMIZAR"}
              className="min-h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              Confirmar anonimización
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* =========================================================
 * Requests tab — table + detail + new
 * =======================================================*/
interface RequestsTabProps {
  requests: DataRequest[];
}

function RequestsTab({ requests }: RequestsTabProps) {
  const reduce = useReducedMotion();
  const [filter, setFilter] = React.useState<"all" | DataRequest["status"]>("all");
  const [detailId, setDetailId] = React.useState<string | null>(null);
  const [newOpen, setNewOpen] = React.useState(false);
  const [newType, setNewType] = React.useState<DataRequest["type"]>("access");
  const [newReason, setNewReason] = React.useState("");
  const { toast } = useToast();

  const filtered = React.useMemo(() => {
    if (filter === "all") return requests;
    return requests.filter((r) => r.status === filter);
  }, [requests, filter]);

  const detail = detailId ? requests.find((r) => r.id === detailId) : null;

  const filterOptions: { id: "all" | DataRequest["status"]; label: string }[] = [
    { id: "all", label: "Todas" },
    { id: "pending", label: "Pendientes" },
    { id: "processing", label: "Procesando" },
    { id: "completed", label: "Completadas" },
    { id: "rejected", label: "Rechazadas" },
  ];

  function submitNew() {
    const id = `DR-2025-${String(requests.length + 1).padStart(3, "0")}`;
    toast({
      title: "Solicitud creada (demo)",
      description: `${REQ_TYPE_META[newType].label} · ${id}`,
    });
    setNewOpen(false);
    setNewReason("");
    setNewType("access");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto rp-scroll-thin pb-1">
          <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0 mr-1" aria-hidden />
          {filterOptions.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={cn(
                "inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors min-h-[36px] border",
                filter === f.id
                  ? "bg-[var(--gold)]/10 text-[var(--gold-soft)] border-[var(--gold)]/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5 border-transparent"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Button
          onClick={() => setNewOpen(true)}
          className="min-h-11 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] shrink-0"
        >
          <Plus className="h-4 w-4 mr-1.5" aria-hidden /> Nueva solicitud
        </Button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rp-glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-background/30">
                <th className="text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-4 py-3">ID</th>
                <th className="text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-4 py-3">Tipo</th>
                <th className="text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-4 py-3">Estado</th>
                <th className="text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-4 py-3">Solicitada</th>
                <th className="text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-4 py-3">Completada</th>
                <th className="text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-4 py-3">Solicitante</th>
                <th className="text-right text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-4 py-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filtered.map((r) => {
                  const typeMeta = REQ_TYPE_META[r.type];
                  const statusMeta = REQ_STATUS_META[r.status];
                  return (
                    <motion.tr
                      key={r.id}
                      initial={reduce ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="border-b border-border/40 last:border-b-0 hover:bg-foreground/[0.03] cursor-pointer"
                      onClick={() => setDetailId(r.id)}
                    >
                      <td className="px-4 py-3 font-mono text-[var(--gold-soft)]">{r.id}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn("gap-1", toneBadge(typeMeta.tone))}>
                          <typeMeta.icon className="h-3 w-3" aria-hidden /> {typeMeta.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={toneBadge(statusMeta.tone)}>
                          {statusMeta.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{fmtDate(r.requestedAt)}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{fmtDate(r.completedAt)}</td>
                      <td className="px-4 py-3">{r.requestedBy}</td>
                      <td className="px-4 py-3 text-right">
                        <ChevronRight className="h-4 w-4 text-muted-foreground inline" aria-hidden />
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-foreground">
            <Inbox className="h-6 w-6 mx-auto mb-2 opacity-50" aria-hidden />
            No hay solicitudes con este filtro
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        <AnimatePresence initial={false}>
          {filtered.map((r) => {
            const typeMeta = REQ_TYPE_META[r.type];
            const statusMeta = REQ_STATUS_META[r.status];
            return (
              <motion.button
                key={r.id}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => setDetailId(r.id)}
                className="rp-glass rounded-2xl p-4 w-full text-left flex flex-col gap-2 min-h-[44px]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[var(--gold-soft)] text-sm">{r.id}</span>
                  <Badge variant="outline" className={toneBadge(statusMeta.tone)}>
                    {statusMeta.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className={cn("gap-1", toneBadge(typeMeta.tone))}>
                    <typeMeta.icon className="h-3 w-3" aria-hidden /> {typeMeta.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{fmtDate(r.requestedAt)}</span>
                </div>
                <div className="text-xs text-muted-foreground">Solicitante: {r.requestedBy}</div>
              </motion.button>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-foreground">
            <Inbox className="h-6 w-6 mx-auto mb-2 opacity-50" aria-hidden />
            No hay solicitudes con este filtro
          </div>
        )}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetailId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[var(--gold-soft)]">{detail?.id}</span>
              {detail && (
                <>
                  <Badge variant="outline" className={cn("gap-1", toneBadge(REQ_TYPE_META[detail.type].tone))}>
                    {REQ_TYPE_META[detail.type].label}
                  </Badge>
                  <Badge variant="outline" className={toneBadge(REQ_STATUS_META[detail.status].tone)}>
                    {REQ_STATUS_META[detail.status].label}
                  </Badge>
                </>
              )}
            </DialogTitle>
            <DialogDescription>Detalle completo de la solicitud de derechos de datos.</DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Solicitada</div>
                  <div className="font-medium">{fmtDateTime(detail.requestedAt)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Completada</div>
                  <div className="font-medium">{fmtDateTime(detail.completedAt)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Solicitante</div>
                  <div className="font-medium">{detail.requestedBy}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Tipo</div>
                  <div className="font-medium">{REQ_TYPE_META[detail.type].label}</div>
                </div>
              </div>
              {detail.reason && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Motivo</div>
                  <div className="rounded-lg border border-border/60 bg-background/40 p-3 text-sm">{detail.reason}</div>
                </div>
              )}
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Timeline de procesamiento
                </div>
                <ol className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400 shrink-0" aria-hidden />
                    <div>
                      <div className="font-medium">Solicitud creada</div>
                      <div className="text-xs text-muted-foreground font-mono">{fmtDateTime(detail.requestedAt)}</div>
                    </div>
                  </li>
                  {detail.status !== "pending" && (
                    <li className="flex items-start gap-2.5 text-sm">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[var(--teal)] shrink-0" aria-hidden />
                      <div>
                        <div className="font-medium">En proceso</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {fmtDateTime(detail.requestedAt ? new Date(new Date(detail.requestedAt).getTime() + 1000 * 60 * 60 * 2).toISOString() : "")}
                        </div>
                      </div>
                    </li>
                  )}
                  {(detail.status === "completed" || detail.status === "rejected") && (
                    <li className="flex items-start gap-2.5 text-sm">
                      <span
                        className={cn(
                          "mt-1 h-2 w-2 rounded-full shrink-0",
                          detail.status === "completed" ? "bg-emerald-400" : "bg-destructive"
                        )}
                        aria-hidden
                      />
                      <div>
                        <div className="font-medium">
                          {detail.status === "completed" ? "Completada" : "Rechazada"}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">{fmtDateTime(detail.completedAt)}</div>
                      </div>
                    </li>
                  )}
                </ol>
              </div>
              {detail.artifacts && detail.artifacts.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                    Artefactos generados
                  </div>
                  <ul className="space-y-1.5">
                    {detail.artifacts.map((a) => (
                      <li
                        key={a}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {a.endsWith(".json") ? (
                            <FileJson className="h-4 w-4 text-[var(--teal)] shrink-0" aria-hidden />
                          ) : (
                            <FileSpreadsheet className="h-4 w-4 text-[var(--gold)] shrink-0" aria-hidden />
                          )}
                          <span className="font-mono text-xs truncate">{a}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() =>
                            toast({
                              title: "Descarga iniciada (demo)",
                              description: a,
                            })
                          }
                        >
                          <Download className="h-3.5 w-3.5 mr-1" aria-hidden /> Descargar
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="rounded-lg border border-[var(--teal)]/30 bg-[var(--teal)]/5 p-3 text-xs text-[var(--teal)] flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                <span>
                  Audit trail inmutable registrado. Cada acceso a esta solicitud queda trazado en la pestaña
                  Auditoría con IP, actor y resultado.
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDetailId(null)} className="min-h-11">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New request dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva solicitud de derechos</DialogTitle>
            <DialogDescription>
              El cliente recibirá un identificador (DR-2025-XXX) y podrá seguir el estado desde su panel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="new-type">Tipo de solicitud</Label>
              <Select value={newType} onValueChange={(v) => setNewType(v as DataRequest["type"])}>
                <SelectTrigger id="new-type" className="min-h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(REQ_TYPE_META) as DataRequest["type"][]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {REQ_TYPE_META[t].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-reason">Motivo (opcional)</Label>
              <Textarea
                id="new-reason"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="Razón de la solicitud…"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewOpen(false)} className="min-h-11">
              Cancelar
            </Button>
            <Button
              onClick={submitNew}
              className="min-h-11 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
            >
              Crear solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =========================================================
 * Audit tab — immutable log
 * =======================================================*/
function AuditTab({ audit }: { audit: AuditEntry[] }) {
  const reduce = useReducedMotion();
  const { toast } = useToast();
  const [filter, setFilter] = React.useState<"all" | AuditEntry["actionCategory"]>("all");

  const filterOptions: { id: "all" | AuditEntry["actionCategory"]; label: string }[] = [
    { id: "all", label: "Todas" },
    { id: "consent", label: "Consentimientos" },
    { id: "data_request", label: "Solicitudes" },
    { id: "export", label: "Exportaciones" },
    { id: "anonymization", label: "Anonimizaciones" },
    { id: "staff_access", label: "Acceso staff" },
    { id: "rectification", label: "Rectificaciones" },
    { id: "retention", label: "Retención" },
  ];

  const filtered = React.useMemo(() => {
    if (filter === "all") return audit;
    return audit.filter((a) => a.actionCategory === filter);
  }, [audit, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto rp-scroll-thin pb-1">
          <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0 mr-1" aria-hidden />
          {filterOptions.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={cn(
                "inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors min-h-[36px] border",
                filter === f.id
                  ? "bg-[var(--gold)]/10 text-[var(--gold-soft)] border-[var(--gold)]/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5 border-transparent"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          className="min-h-11 border-[var(--gold)]/40 text-[var(--gold-soft)] hover:bg-[var(--gold)]/10 shrink-0"
          onClick={() =>
            toast({
              title: "Auditoría exportada (demo)",
              description: "audit-log.csv · 2 años de retención",
            })
          }
        >
          <Download className="h-4 w-4 mr-1.5" aria-hidden /> Exportar auditoría
        </Button>
      </div>

      <div className="rp-glass rounded-2xl overflow-hidden">
        <div className="max-h-[28rem] overflow-y-auto rp-scroll-thin">
          <ul className="divide-y divide-border/40">
            <AnimatePresence initial={false}>
              {filtered.map((e, idx) => {
                const meta = AUDIT_CATEGORY_META[e.actionCategory];
                const resultMeta = RESULT_META[e.result];
                return (
                  <motion.li
                    key={e.id}
                    initial={reduce ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, delay: reduce ? 0 : Math.min(idx * 0.01, 0.1) }}
                    className="px-4 py-3 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3"
                  >
                    <div className="flex items-center gap-2 sm:w-44 shrink-0">
                      <div
                        className={cn(
                          "grid h-7 w-7 place-items-center rounded-md border",
                          toneBadge(meta.tone)
                        )}
                      >
                        <meta.icon className="h-3.5 w-3.5" aria-hidden />
                      </div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground leading-tight">
                        {meta.label}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{e.action}</span>
                        <Badge variant="outline" className={cn("text-[10px]", toneBadge(resultMeta.tone))}>
                          {resultMeta.label}
                        </Badge>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground font-mono break-all">
                        {e.resource}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          {e.actor.type === "user" ? (
                            <UserCog className="h-3 w-3" aria-hidden />
                          ) : (
                            <Bot className="h-3 w-3" aria-hidden />
                          )}
                          {e.actor.name}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden />
                          {fmtDateTime(e.at)} ({fmtRelative(e.at)})
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono">
                          <Server className="h-3 w-3" aria-hidden />
                          IP {e.ip}
                        </span>
                      </div>
                      {e.reason && (
                        <div className="mt-1 text-xs text-muted-foreground italic">Motivo: {e.reason}</div>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </div>
        {filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-foreground">
            <Inbox className="h-6 w-6 mx-auto mb-2 opacity-50" aria-hidden />
            No hay eventos con este filtro
          </div>
        )}
      </div>

      <Note variant="info">
        La auditoría de privacidad es inmutable. Cada acceso a datos personales se registra. Los logs no
        contienen datos sensibles completos.
      </Note>
    </div>
  );
}

/* =========================================================
 * Retention policy card (bottom, always visible)
 * =======================================================*/
function RetentionPolicyCard() {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const policies: {
    icon: React.ElementType;
    label: string;
    period: string;
    note?: string;
    tone: string;
  }[] = [
    {
      icon: Database,
      label: "Datos transaccionales",
      period: "6 años",
      note: "Obligación legal (AGP y normativa fiscal)",
      tone: "gold",
    },
    {
      icon: MegaphoneIcon,
      label: "Datos de marketing",
      period: "Hasta retirada del consentimiento",
      note: "Consentimiento revocable en cualquier momento",
      tone: "teal",
    },
    {
      icon: ScanSearch,
      label: "Datos analíticos agregados",
      period: "Indefinido",
      note: "Anónimos · no identifican a personas",
      tone: "emerald",
    },
    {
      icon: ScrollText,
      label: "Logs de auditoría",
      period: "2 años",
      note: "Retención obligatoria para trazabilidad",
      tone: "gold",
    },
  ];

  return (
    <div className="rp-glass rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-[var(--gold)]" aria-hidden />
          <h3 className="font-display text-base font-medium">Política de retención</h3>
          <Badge variant="outline" className={toneBadge("teal")}>
            Configurable
          </Badge>
        </div>
        <Button
          variant="outline"
          className="min-h-11 border-[var(--gold)]/40 text-[var(--gold-soft)] hover:bg-[var(--gold)]/10"
          onClick={() => setOpen(true)}
        >
          <Save className="h-4 w-4 mr-1.5" aria-hidden /> Configurar retención
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {policies.map((p) => (
          <div
            key={p.label}
            className={cn(
              "rounded-xl border bg-background/40 p-4",
              p.tone === "gold"
                ? "border-[var(--gold)]/30"
                : p.tone === "teal"
                ? "border-[var(--teal)]/30"
                : "border-emerald-400/30"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <p.icon
                className={cn(
                  "h-4 w-4",
                  p.tone === "gold"
                    ? "text-[var(--gold)]"
                    : p.tone === "teal"
                    ? "text-[var(--teal)]"
                    : "text-emerald-300"
                )}
                aria-hidden
              />
              <span className="text-xs font-medium text-muted-foreground">{p.label}</span>
            </div>
            <div className="font-display text-lg font-medium">{p.period}</div>
            {p.note && <div className="text-[11px] text-muted-foreground mt-1">{p.note}</div>}
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar política de retención</DialogTitle>
            <DialogDescription>
              Las políticas de retención obligatorias por ley no se pueden desactivar. Las voluntarias pueden
              ajustarse por organización.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {policies.map((p) => (
              <div
                key={p.label}
                className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/40 p-3"
              >
                <div>
                  <div className="text-sm font-medium">{p.label}</div>
                  <div className="text-[11px] text-muted-foreground">{p.period}</div>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Obligatorio
                </Badge>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} className="min-h-11">
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setOpen(false);
                toast({ title: "Política guardada (demo)", description: "Configuración de retención actualizada" });
              }}
              className="min-h-11 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
            >
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Inline icon to avoid name clash with lucide Megaphone that may be unused
function MegaphoneIcon({ className }: { className?: string }) {
  return <ScrollText className={className} aria-hidden />;
}

/* =========================================================
 * Main component
 * =======================================================*/
export function CrmPrivacy() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [tab, setTab] = React.useState<"consents" | "rights" | "requests" | "audit">("consents");
  const [consents, setConsents] = React.useState<ConsentRecord[]>(() => seedConsent());
  const [requests, setRequests] = React.useState<DataRequest[]>(DEMO_REQUESTS);
  const [audit, setAudit] = React.useState<AuditEntry[]>(DEMO_AUDIT);

  function pushAudit(entry: Omit<AuditEntry, "id" | "at">) {
    setAudit((prev) => [
      { ...entry, id: `aud-${prev.length + 1}`, at: new Date().toISOString() },
      ...prev,
    ]);
  }

  function toggleConsent(channel: ConsentChannel, purpose: ConsentPurpose) {
    setConsents((prev) =>
      prev.map((c) => {
        if (c.channel !== channel || c.purpose !== purpose) return c;
        const next = !c.granted;
        const nowIso = new Date().toISOString();
        return {
          ...c,
          granted: next,
          grantedAt: next ? nowIso : c.grantedAt,
          revokedAt: !next ? nowIso : c.revokedAt,
          source: "manual",
          history: [
            ...c.history,
            {
              at: nowIso,
              action: next ? "granted" : "revoked",
              by: "Elena Marín",
              source: "manual",
            },
          ],
        };
      })
    );
    const rec = consents.find((c) => c.channel === channel && c.purpose === purpose);
    const action = rec?.granted ? "revoked" : "granted";
    const chLabel = CHANNELS.find((c) => c.id === channel)?.label ?? channel;
    const pLabel = PURPOSES.find((p) => p.id === purpose)?.label ?? purpose;
    pushAudit({
      actor: { type: "user", name: "Elena Marín" },
      action: `Consentimiento ${action === "granted" ? "otorgado" : "revocado"} · ${chLabel} · ${pLabel}`,
      actionCategory: "consent",
      resource: `consent:${channel}:${purpose}`,
      ip: "84.124.x.x",
      reason: "Preferencia del usuario",
      result: "success",
    });
    toast({
      title: action === "granted" ? "Consentimiento otorgado (demo)" : "Consentimiento revocado (demo)",
      description: `${chLabel} · ${pLabel}`,
    });
  }

  function createRequest(
    type: DataRequest["type"],
    reason?: string,
    artifacts?: string[]
  ) {
    const id = `DR-2025-${String(requests.length + 1).padStart(3, "0")}`;
    const newReq: DataRequest = {
      id,
      type,
      status: "pending",
      requestedAt: new Date().toISOString(),
      requestedBy: "Elena Marín",
      reason,
      artifacts,
    };
    setRequests((prev) => [newReq, ...prev]);
    pushAudit({
      actor: { type: "user", name: "Elena Marín" },
      action: `Solicitud creada · ${REQ_TYPE_META[type].label}`,
      actionCategory: type === "export" ? "export" : type === "anonymization" ? "anonymization" : type === "rectification" ? "rectification" : "data_request",
      resource: `${id} · perfil cust-0007`,
      ip: "84.124.x.x",
      reason,
      result: "success",
    });
    toast({
      title: "Solicitud creada (demo)",
      description: `${REQ_TYPE_META[type].label} · ${id}`,
    });
  }

  const tabMeta: { id: typeof tab; label: string; icon: React.ElementType }[] = [
    { id: "consents", label: "Consentimientos", icon: ShieldCheck },
    { id: "rights", label: "Derechos de datos", icon: FileText },
    { id: "requests", label: "Solicitudes", icon: ScrollText },
    { id: "audit", label: "Auditoría", icon: History },
  ];

  return (
    <div className="space-y-5">
      <SectionTitle
        icon={ShieldCheck}
        title="Privacidad y consentimientos (GDPR)"
        description="Gestión de consentimientos granulares, derechos ARCO/POL, solicitudes verificables y auditoría inmutable."
        right={
          <Badge variant="outline" className={toneBadge("gold")}>
            <Lock className="h-3 w-3 mr-1" aria-hidden /> GDPR · LOPDGDD
          </Badge>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="bg-muted/40 p-1 h-auto flex flex-wrap gap-1">
          {tabMeta.map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="data-[state=active]:bg-[var(--gold)]/10 data-[state=active]:text-[var(--gold-soft)] min-h-[40px] px-3"
            >
              <t.icon className="h-4 w-4 mr-1.5 sm:mr-1" aria-hidden />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.label.split(" ")[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="consents" className="mt-4 focus-visible:outline-none">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ConsentTab consents={consents} onToggle={toggleConsent} />
          </motion.div>
        </TabsContent>
        <TabsContent value="rights" className="mt-4 focus-visible:outline-none">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <DataRightsTab onCreateRequest={createRequest} />
          </motion.div>
        </TabsContent>
        <TabsContent value="requests" className="mt-4 focus-visible:outline-none">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <RequestsTab requests={requests} />
          </motion.div>
        </TabsContent>
        <TabsContent value="audit" className="mt-4 focus-visible:outline-none">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AuditTab audit={audit} />
          </motion.div>
        </TabsContent>
      </Tabs>

      <RetentionPolicyCard />
    </div>
  );
}
