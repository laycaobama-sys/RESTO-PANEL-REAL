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
import { Checkbox } from "@/components/ui/checkbox";
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
  GitMerge,
  Users,
  Mail,
  Phone,
  Calendar,
  Check,
  X,
  AlertTriangle,
  Filter,
  Plus,
  History,
  Download,
  RefreshCw,
  Settings,
  ArrowRight,
  ArrowLeftRight,
  ScanSearch,
  ShieldCheck,
  Undo2,
  Eye,
  Hash,
  Fingerprint,
  IdCard,
  Inbox,
  Sparkles,
  Ban,
} from "lucide-react";

/* =========================================================
 * Types — exact from spec
 * =======================================================*/
type MatchConfidence = "high" | "medium" | "low" | "ambiguous";
type MergeStatus = "proposed" | "approved" | "rejected" | "completed" | "reversed";

interface DuplicateMatch {
  id: string;
  customerA: { id: string; name: string; email: string; phone: string; visitCount: number; lastVisit?: string };
  customerB: { id: string; name: string; email: string; phone: string; visitCount: number; lastVisit?: string };
  matchReasons: { field: string; valueA: string; valueB: string; match: boolean }[];
  confidence: MatchConfidence;
  status: MergeStatus;
  proposedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  reason?: string;
}

interface MergeRecord {
  id: string;
  sourceCustomerId: string;
  targetCustomerId: string;
  sourceName: string;
  targetName: string;
  mergedAt: string;
  mergedBy: string;
  reason: string;
  reversed: boolean;
  reversedAt?: string;
  fieldsMerged: string[];
}

interface MatchingRule {
  id: string;
  condition: string;
  description: string;
  confidence: MatchConfidence;
  autoMerge: boolean;
  active: boolean;
  icon: React.ElementType;
}

/* =========================================================
 * Meta
 * =======================================================*/
const CONFIDENCE_META: Record<
  MatchConfidence,
  { label: string; tone: string; dot: string; description: string }
> = {
  high: {
    label: "Alta",
    tone: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    dot: "bg-emerald-400",
    description: "Coincidencia fuerte — puede fusionarse automáticamente",
  },
  medium: {
    label: "Media",
    tone: "border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
    dot: "bg-[var(--gold)]",
    description: "Coincidencia parcial — revisión recomendada",
  },
  low: {
    label: "Baja",
    tone: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
    description: "Coincidencia débil — requiere confirmación manual",
  },
  ambiguous: {
    label: "Ambigua",
    tone: "border-destructive/30 bg-destructive/10 text-destructive",
    dot: "bg-destructive",
    description: "Conflicto de señales — requiere revisión manual obligatoria",
  },
};

const STATUS_META: Record<MergeStatus, { label: string; tone: string }> = {
  proposed: { label: "Propuesta", tone: "border-amber-400/30 bg-amber-400/10 text-amber-300" },
  approved: { label: "Aprobada", tone: "border-[var(--teal)]/30 bg-[var(--teal)]/10 text-[var(--teal)]" },
  rejected: { label: "Rechazada", tone: "border-destructive/30 bg-destructive/10 text-destructive" },
  completed: { label: "Completada", tone: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" },
  reversed: { label: "Revertida", tone: "border-muted-foreground/30 bg-muted/40 text-muted-foreground" },
};

const FIELD_LABELS: Record<string, string> = {
  name: "Nombre",
  email: "Email",
  phone: "Teléfono",
  preferences: "Preferencias",
  history: "Historial",
  points: "Puntos",
};

/* =========================================================
 * Demo data
 * =======================================================*/
const NOW = Date.now();
const iso = (offsetMs: number) => new Date(NOW - offsetMs).toISOString();

const DEMO_MATCHES: DuplicateMatch[] = [
  {
    id: "dup-001",
    customerA: {
      id: "cust-0007",
      name: "Elena Marín",
      email: "elena.marin@example.com",
      phone: "+34 612 345 678",
      visitCount: 15,
      lastVisit: "hace 6 días",
    },
    customerB: {
      id: "cust-0203",
      name: "Elena Marín García",
      email: "elena.marin@example.com",
      phone: "+34 612 345 678",
      visitCount: 3,
      lastVisit: "hace 3 días",
    },
    matchReasons: [
      { field: "email", valueA: "elena.marin@example.com", valueB: "elena.marin@example.com", match: true },
      { field: "phone", valueA: "+34 612 345 678", valueB: "+34 612 345 678", match: true },
      { field: "name", valueA: "Elena Marín", valueB: "Elena Marín García", match: false },
      { field: "tier", valueA: "Oro", valueB: "Sin tier", match: false },
    ],
    confidence: "high",
    status: "proposed",
    proposedAt: iso(1000 * 60 * 60 * 24 * 2),
  },
  {
    id: "dup-002",
    customerA: {
      id: "cust-0042",
      name: "Javier Soler",
      email: "javier.soler@example.com",
      phone: "+34 600 111 222",
      visitCount: 8,
      lastVisit: "hace 2 semanas",
    },
    customerB: {
      id: "cust-0188",
      name: "J. Soler",
      email: "jsoler.work@example.com",
      phone: "+34 600 111 222",
      visitCount: 2,
      lastVisit: "hace 1 semana",
    },
    matchReasons: [
      { field: "phone", valueA: "+34 600 111 222", valueB: "+34 600 111 222", match: true },
      { field: "name", valueA: "Javier Soler", valueB: "J. Soler", match: false },
      { field: "email", valueA: "javier.soler@example.com", valueB: "jsoler.work@example.com", match: false },
    ],
    confidence: "medium",
    status: "proposed",
    proposedAt: iso(1000 * 60 * 60 * 24 * 4),
  },
  {
    id: "dup-003",
    customerA: {
      id: "cust-0119",
      name: "Marta Iborra",
      email: "marta.iborra@example.com",
      phone: "+34 655 222 333",
      visitCount: 12,
      lastVisit: "hace 4 días",
    },
    customerB: {
      id: "cust-0221",
      name: "Marta I.",
      email: "martaiborra82@example.com",
      phone: "+34 655 222 333",
      visitCount: 1,
      lastVisit: "hace 1 día",
    },
    matchReasons: [
      { field: "name", valueA: "Marta Iborra", valueB: "Marta I.", match: false },
      { field: "phone", valueA: "+34 655 222 333", valueB: "+34 655 222 333", match: true },
      { field: "email", valueA: "marta.iborra@example.com", valueB: "martaiborra82@example.com", match: false },
    ],
    confidence: "ambiguous",
    status: "proposed",
    proposedAt: iso(1000 * 60 * 60 * 24 * 1.5),
  },
  {
    id: "dup-004",
    customerA: {
      id: "cust-0099",
      name: "Andrés Vidal",
      email: "andres.vidal@example.com",
      phone: "+34 677 333 444",
      visitCount: 5,
      lastVisit: "hace 1 mes",
    },
    customerB: {
      id: "cust-0245",
      name: "Andres Vidal",
      email: "avidal.other@example.com",
      phone: "+34 677 999 888",
      visitCount: 1,
      lastVisit: "hace 2 semanas",
    },
    matchReasons: [
      { field: "name", valueA: "Andrés Vidal", valueB: "Andres Vidal", match: false },
      { field: "email", valueA: "andres.vidal@example.com", valueB: "avidal.other@example.com", match: false },
      { field: "phone", valueA: "+34 677 333 444", valueB: "+34 677 999 888", match: false },
    ],
    confidence: "low",
    status: "proposed",
    proposedAt: iso(1000 * 60 * 60 * 24 * 6),
  },
  {
    id: "dup-005",
    customerA: {
      id: "cust-0301",
      name: "Lucía Pons",
      email: "lucia.pons@example.com",
      phone: "+34 688 444 555",
      visitCount: 22,
      lastVisit: "hace 3 días",
    },
    customerB: {
      id: "cust-0312",
      name: "Lucía Pons",
      email: "lucia.pons@example.com",
      phone: "+34 688 444 555",
      visitCount: 4,
      lastVisit: "hace 1 día",
    },
    matchReasons: [
      { field: "email", valueA: "lucia.pons@example.com", valueB: "lucia.pons@example.com", match: true },
      { field: "phone", valueA: "+34 688 444 555", valueB: "+34 688 444 555", match: true },
      { field: "name", valueA: "Lucía Pons", valueB: "Lucía Pons", match: true },
    ],
    confidence: "high",
    status: "proposed",
    proposedAt: iso(1000 * 60 * 60 * 18),
  },
];

const DEMO_MERGE_HISTORY: MergeRecord[] = [
  {
    id: "mr-001",
    sourceCustomerId: "cust-0177",
    targetCustomerId: "cust-0001",
    sourceName: "Carlos M.",
    targetName: "Carlos Méndez",
    mergedAt: iso(1000 * 60 * 60 * 24 * 14),
    mergedBy: "Sistema (auto-merge)",
    reason: "Email y teléfono idénticos — alta confianza",
    reversed: false,
    fieldsMerged: ["name", "email", "phone", "preferences", "history", "points"],
  },
  {
    id: "mr-002",
    sourceCustomerId: "cust-0156",
    targetCustomerId: "cust-0023",
    sourceName: "M. Romero",
    targetName: "María Romero",
    mergedAt: iso(1000 * 60 * 60 * 24 * 30),
    mergedBy: "Carlos Méndez (Manager)",
    reason: "Mismo teléfono confirmado por cliente presencialmente",
    reversed: false,
    fieldsMerged: ["phone", "history", "points"],
  },
  {
    id: "mr-003",
    sourceCustomerId: "cust-0199",
    targetCustomerId: "cust-0048",
    sourceName: "J. Bellini",
    targetName: "Marco Bellini",
    mergedAt: iso(1000 * 60 * 60 * 24 * 45),
    mergedBy: "Sistema (auto-merge)",
    reason: "Email exacto + teléfono normalizado",
    reversed: true,
    reversedAt: iso(1000 * 60 * 60 * 24 * 20),
    fieldsMerged: ["email", "phone", "preferences"],
  },
  {
    id: "mr-004",
    sourceCustomerId: "cust-0210",
    targetCustomerId: "cust-0075",
    sourceName: "Ana Vidal",
    targetName: "Ana Vidal López",
    mergedAt: iso(1000 * 60 * 60 * 24 * 10),
    mergedBy: "María López (Hostess)",
    reason: "Cliente confirmó duplicado por WhatsApp",
    reversed: false,
    fieldsMerged: ["name", "history", "points"],
  },
  {
    id: "mr-005",
    sourceCustomerId: "cust-0266",
    targetCustomerId: "cust-0091",
    sourceName: "Pedro S.",
    targetName: "Pedro Salas",
    mergedAt: iso(1000 * 60 * 60 * 24 * 5),
    mergedBy: "Sistema (auto-merge)",
    reason: "Customer code idéntico (fidelización)",
    reversed: false,
    fieldsMerged: ["email", "phone", "preferences", "history", "points"],
  },
];

const DEMO_RULES: MatchingRule[] = [
  {
    id: "rule-1",
    condition: "Email exacto",
    description: "Los emails coinciden exactamente tras normalización (lowercase + trim)",
    confidence: "high",
    autoMerge: true,
    active: true,
    icon: Mail,
  },
  {
    id: "rule-2",
    condition: "Teléfono normalizado",
    description: "Teléfonos coinciden tras normalización E.164 (+34xxxxxxxxx)",
    confidence: "high",
    autoMerge: true,
    active: true,
    icon: Phone,
  },
  {
    id: "rule-3",
    condition: "Email + teléfono",
    description: "Ambos deben coincidir simultáneamente",
    confidence: "high",
    autoMerge: true,
    active: true,
    icon: Fingerprint,
  },
  {
    id: "rule-4",
    condition: "Nombre similar + teléfono",
    description: "Similitud de Levenshtein ≥ 0.85 en el nombre + teléfono coincidente",
    confidence: "medium",
    autoMerge: false,
    active: true,
    icon: Users,
  },
  {
    id: "rule-5",
    condition: "Nombre similar + email diferente",
    description: "Nombre similar pero emails claramente distintos — revisión obligatoria",
    confidence: "ambiguous",
    autoMerge: false,
    active: true,
    icon: AlertTriangle,
  },
  {
    id: "rule-6",
    condition: "Customer code",
    description: "Identificador interno de fidelización idéntico",
    confidence: "high",
    autoMerge: true,
    active: true,
    icon: Hash,
  },
  {
    id: "rule-7",
    condition: "Identificador externo (Google ID, etc.)",
    description: "ID externo de proveedor de identidad federada idéntico",
    confidence: "high",
    autoMerge: false,
    active: true,
    icon: IdCard,
  },
];

/* =========================================================
 * Helpers
 * =======================================================*/
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

/* =========================================================
 * Shared UI atoms
 * =======================================================*/


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
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--teal)]/10 text-[var(--teal)] border border-[var(--teal)]/20">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-display text-lg font-medium tracking-tight sm:text-xl">{title}</h2>
            
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
 * Customer card
 * =======================================================*/
function CustomerCard({
  customer,
  side,
  isPrimary,
  onSelect,
  selectable,
}: {
  customer: DuplicateMatch["customerA"];
  side: "A" | "B";
  isPrimary?: boolean;
  onSelect?: () => void;
  selectable?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors",
        isPrimary
          ? "border-[var(--gold)]/40 bg-[var(--gold)]/5 rp-glow-gold"
          : "border-border/60 bg-background/40",
        selectable && "cursor-pointer hover:border-[var(--gold)]/40"
      )}
      onClick={selectable ? onSelect : undefined}
      role={selectable ? "button" : undefined}
      aria-pressed={selectable ? isPrimary : undefined}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "grid h-6 w-6 place-items-center rounded-md text-[10px] font-mono font-bold",
              side === "A"
                ? "bg-[var(--teal)]/15 text-[var(--teal)]"
                : "bg-[var(--gold)]/15 text-[var(--gold-soft)]"
            )}
          >
            {side}
          </span>
          {isPrimary && (
            <Badge variant="outline" className="border-[var(--gold)]/30 text-[var(--gold-soft)] text-[10px]">
              <ShieldCheck className="h-3 w-3 mr-1" aria-hidden /> Perfil primario
            </Badge>
          )}
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {customer.id}
        </span>
      </div>
      <div className="font-display text-base font-medium truncate">{customer.name}</div>
      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 truncate">
          <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate font-mono">{customer.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="font-mono">{customer.phone}</span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 pt-2">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3" aria-hidden /> {customer.lastVisit ?? "—"}
        </span>
        <span className="inline-flex items-center gap-1">
          <Users className="h-3 w-3" aria-hidden /> {customer.visitCount} visitas
        </span>
      </div>
    </div>
  );
}

/* =========================================================
 * Duplicate match card
 * =======================================================*/
interface MatchCardProps {
  match: DuplicateMatch;
  onMerge: (m: DuplicateMatch) => void;
  onReject: (m: DuplicateMatch) => void;
  onView: (m: DuplicateMatch) => void;
}

function MatchCard({ match, onMerge, onReject, onView }: MatchCardProps) {
  const reduce = useReducedMotion();
  const confMeta = CONFIDENCE_META[match.confidence];
  const statusMeta = STATUS_META[match.status];
  const isAmbiguous = match.confidence === "ambiguous";

  return (
    <motion.div
      layout
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rp-glass rounded-2xl p-4 sm:p-5",
        isAmbiguous && "border-destructive/30"
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-muted-foreground">{match.id}</span>
          <Badge variant="outline" className={cn("gap-1.5", confMeta.tone)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", confMeta.dot)} aria-hidden />
            Confianza {confMeta.label}
          </Badge>
          <Badge variant="outline" className={statusMeta.tone}>
            {statusMeta.label}
          </Badge>
          <span className="text-[11px] text-muted-foreground font-mono">
            propuesta {fmtDateTime(match.proposedAt)}
          </span>
        </div>
      </div>

      {/* Ambiguous warning */}
      {isAmbiguous && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" aria-hidden />
          <div className="text-sm">
            <div className="font-medium text-destructive">
              Confianza ambigua — requiere revisión manual.
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              No fusionar automáticamente. Las señales entran en conflicto (mismo teléfono, emails distintos, nombre parcial).
            </div>
          </div>
        </div>
      )}

      {/* Customers side-by-side */}
      <div className="grid gap-3 md:grid-cols-2 mb-4">
        <CustomerCard customer={match.customerA} side="A" />
        <div className="hidden md:flex items-center justify-center">
          <div className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background/60">
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" aria-hidden />
          </div>
        </div>
      </div>
      <div className="md:hidden -mt-2 mb-4 flex justify-center">
        <div className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background/60">
          <ArrowLeftRight className="h-4 w-4 text-muted-foreground rotate-90" aria-hidden />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 mb-4">
        <CustomerCard customer={match.customerB} side="B" />
      </div>

      {/* Match reasons */}
      <div className="rounded-xl border border-border/60 bg-background/30 overflow-hidden mb-4">
        <div className="px-3 py-2 border-b border-border/60 bg-background/40 text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <ScanSearch className="h-3.5 w-3.5" aria-hidden /> Razones de matching
        </div>
        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-3 py-2">Campo</th>
                <th className="text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-3 py-2">Valor A</th>
                <th className="text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-3 py-2">Valor B</th>
                <th className="text-center text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-3 py-2">Match</th>
              </tr>
            </thead>
            <tbody>
              {match.matchReasons.map((r) => (
                <tr key={r.field} className="border-b border-border/30 last:border-b-0">
                  <td className="px-3 py-2 font-medium text-xs">{FIELD_LABELS[r.field] ?? r.field}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground break-all">{r.valueA}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground break-all">{r.valueB}</td>
                  <td className="px-3 py-2 text-center">
                    {r.match ? (
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-md bg-emerald-400/15 text-emerald-300">
                        <Check className="h-3.5 w-3.5" aria-hidden />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-md bg-destructive/15 text-destructive">
                        <X className="h-3.5 w-3.5" aria-hidden />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      {match.status === "proposed" && (
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => onMerge(match)}
            className="min-h-11 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
            size="sm"
          >
            <GitMerge className="h-4 w-4 mr-1.5" aria-hidden /> Fusionar
          </Button>
          <Button
            onClick={() => onReject(match)}
            variant="outline"
            className="min-h-11 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            size="sm"
          >
            <X className="h-4 w-4 mr-1.5" aria-hidden /> Rechazar
          </Button>
          <Button
            onClick={() => onView(match)}
            variant="ghost"
            className="min-h-11"
            size="sm"
          >
            <Eye className="h-4 w-4 mr-1.5" aria-hidden /> Ver detalles
          </Button>
        </div>
      )}
      {match.status !== "proposed" && (
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => onView(match)}
            variant="ghost"
            className="min-h-11"
            size="sm"
          >
            <Eye className="h-4 w-4 mr-1.5" aria-hidden /> Ver detalles
          </Button>
        </div>
      )}
    </motion.div>
  );
}

/* =========================================================
 * Duplicates tab
 * =======================================================*/
interface DuplicatesTabProps {
  matches: DuplicateMatch[];
  setMatches: React.Dispatch<React.SetStateAction<DuplicateMatch[]>>;
  addMergeToHistory: (m: DuplicateMatch, targetSide: "A" | "B", fields: string[], reason: string) => void;
}

function DuplicatesTab({ matches, setMatches, addMergeToHistory }: DuplicatesTabProps) {
  const reduce = useReducedMotion();
  const { toast } = useToast();
  const [scanning, setScanning] = React.useState(false);
  const [mergeTarget, setMergeTarget] = React.useState<DuplicateMatch | null>(null);
  const [rejectTarget, setRejectTarget] = React.useState<DuplicateMatch | null>(null);
  const [viewTarget, setViewTarget] = React.useState<DuplicateMatch | null>(null);
  const [primarySide, setPrimarySide] = React.useState<"A" | "B">("A");
  const [fields, setFields] = React.useState<string[]>(["name", "email", "phone", "preferences", "history", "points"]);
  const [reason, setReason] = React.useState("");
  const [rejectReason, setRejectReason] = React.useState("");

  function runScan() {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      toast({
        title: "Búsqueda completada (demo)",
        description: "3 duplicados encontrados",
      });
    }, 1000);
  }

  function openMerge(m: DuplicateMatch) {
    setMergeTarget(m);
    setPrimarySide(m.customerA.visitCount >= m.customerB.visitCount ? "A" : "B");
    setFields(["name", "email", "phone", "preferences", "history", "points"]);
    setReason("");
  }

  function confirmMerge() {
    if (!mergeTarget) return;
    if (!reason.trim()) {
      toast({
        title: "Motivo obligatorio",
        description: "Indica la razón de la fusión para el registro de auditoría.",
        variant: "destructive",
      });
      return;
    }
    addMergeToHistory(mergeTarget, primarySide, fields, reason.trim());
    setMatches((prev) =>
      prev.map((m) =>
        m.id === mergeTarget.id
          ? {
              ...m,
              status: "completed",
              resolvedAt: new Date().toISOString(),
              resolvedBy: "Elena Marín",
              reason: reason.trim(),
            }
          : m
      )
    );
    setMergeTarget(null);
    toast({
      title: "Perfiles fusionados (demo)",
      description: `${mergeTarget.customerA.name} ← ${mergeTarget.customerB.name}`,
    });
  }

  function confirmReject() {
    if (!rejectTarget) return;
    setMatches((prev) =>
      prev.map((m) =>
        m.id === rejectTarget.id
          ? {
              ...m,
              status: "rejected",
              resolvedAt: new Date().toISOString(),
              resolvedBy: "Elena Marín",
              reason: rejectReason.trim() || "Rechazado por el operador",
            }
          : m
      )
    );
    setRejectTarget(null);
    setRejectReason("");
    toast({
      title: "Fusión rechazada (demo)",
      description: `${rejectTarget.id} marcada como rechazada`,
    });
  }

  const proposedCount = matches.filter((m) => m.status === "proposed").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" aria-hidden />
          <span>
            <span className="text-foreground font-medium">{proposedCount}</span> propuestas pendientes de{" "}
            <span className="text-foreground font-medium">{matches.length}</span> duplicados detectados
          </span>
        </div>
        <Button
          onClick={runScan}
          disabled={scanning}
          className="min-h-11 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] shrink-0"
        >
          <RefreshCw className={cn("h-4 w-4 mr-1.5", scanning && "animate-spin")} aria-hidden />
          {scanning ? "Buscando…" : "Buscar duplicados"}
        </Button>
      </div>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {matches.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              onMerge={openMerge}
              onReject={(mm) => setRejectTarget(mm)}
              onView={(mm) => setViewTarget(mm)}
            />
          ))}
        </AnimatePresence>
        {matches.length === 0 && (
          <div className="rp-glass rounded-2xl py-10 text-center text-sm text-muted-foreground">
            <Inbox className="h-6 w-6 mx-auto mb-2 opacity-50" aria-hidden />
            No hay duplicados detectados
          </div>
        )}
      </div>

      <Note variant="info">
        Los perfiles no se fusionan automáticamente cuando existe ambigüedad. Las fusiones son reversibles y
        auditables.
      </Note>

      {/* Merge dialog */}
      <Dialog open={!!mergeTarget} onOpenChange={(o) => !o && setMergeTarget(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitMerge className="h-4 w-4 text-[var(--gold)]" aria-hidden /> Confirmar fusión
            </DialogTitle>
            <DialogDescription>
              Selecciona el perfil primario (target) y los campos a fusionar desde el perfil secundario (source).
              La acción es reversible y queda registrada en el historial de merges.
            </DialogDescription>
          </DialogHeader>
          {mergeTarget && (
            <div className="space-y-4">
              {/* Source → target selector */}
              <div>
                <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Perfil primario (target) — el otro se fusiona en este
                </Label>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <CustomerCard
                    customer={mergeTarget.customerA}
                    side="A"
                    isPrimary={primarySide === "A"}
                    selectable
                    onSelect={() => setPrimarySide("A")}
                  />
                  <CustomerCard
                    customer={mergeTarget.customerB}
                    side="B"
                    isPrimary={primarySide === "B"}
                    selectable
                    onSelect={() => setPrimarySide("B")}
                  />
                </div>
              </div>

              {/* Visualize flow */}
              <div className="rounded-lg border border-border/60 bg-background/40 p-3 text-sm flex items-center gap-2 flex-wrap">
                <span className="text-muted-foreground text-xs">Source:</span>
                <span className="font-medium">
                  {primarySide === "A" ? mergeTarget.customerB.name : mergeTarget.customerA.name}
                </span>
                <ArrowRight className="h-4 w-4 text-[var(--gold)]" aria-hidden />
                <span className="text-muted-foreground text-xs">Target:</span>
                <span className="font-medium">
                  {primarySide === "A" ? mergeTarget.customerA.name : mergeTarget.customerB.name}
                </span>
              </div>

              {/* Fields to merge */}
              <div>
                <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Campos a fusionar desde source
                </Label>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {Object.keys(FIELD_LABELS).map((f) => (
                    <label
                      key={f}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer text-sm min-h-[44px] transition-colors",
                        fields.includes(f)
                          ? "border-[var(--gold)]/40 bg-[var(--gold)]/5"
                          : "border-border/60 hover:bg-foreground/5"
                      )}
                    >
                      <Checkbox
                        checked={fields.includes(f)}
                        onCheckedChange={(checked) => {
                          if (checked) setFields((prev) => [...prev, f]);
                          else setFields((prev) => prev.filter((x) => x !== f));
                        }}
                      />
                      <span>{FIELD_LABELS[f]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-1.5">
                <Label htmlFor="merge-reason">Motivo de la fusión (obligatorio)</Label>
                <Textarea
                  id="merge-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej. Cliente confirmó que es la misma persona en dos reservas…"
                  rows={3}
                />
              </div>

              <div className="rounded-lg border border-[var(--teal)]/30 bg-[var(--teal)]/5 p-3 text-xs text-[var(--teal)] flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                <span>
                  La fusión es reversible: el perfil source se conservará en el historial y podrá restaurarse.
                  Los datos creados después de la fusión se mantendrán en el perfil target.
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMergeTarget(null)} className="min-h-11">
              Cancelar
            </Button>
            <Button
              onClick={confirmMerge}
              disabled={!reason.trim() || fields.length === 0}
              className="min-h-11 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
            >
              <GitMerge className="h-4 w-4 mr-1.5" aria-hidden /> Confirmar fusión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-destructive" aria-hidden /> Rechazar fusión
            </DialogTitle>
            <DialogDescription>
              El duplicado se marcará como rechazado. Indica el motivo para el registro de auditoría.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="reject-reason">Motivo (opcional)</Label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ej. Son personas distintas con mismo teléfono…"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectTarget(null)} className="min-h-11">
              Cancelar
            </Button>
            <Button
              onClick={confirmReject}
              className="min-h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Rechazar fusión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details dialog */}
      <Dialog open={!!viewTarget} onOpenChange={(o) => !o && setViewTarget(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-muted-foreground">{viewTarget?.id}</span>
              {viewTarget && (
                <>
                  <Badge variant="outline" className={CONFIDENCE_META[viewTarget.confidence].tone}>
                    Confianza {CONFIDENCE_META[viewTarget.confidence].label}
                  </Badge>
                  <Badge variant="outline" className={STATUS_META[viewTarget.status].tone}>
                    {STATUS_META[viewTarget.status].label}
                  </Badge>
                </>
              )}
            </DialogTitle>
            <DialogDescription>Comparación completa de los perfiles detectados como duplicados.</DialogDescription>
          </DialogHeader>
          {viewTarget && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <CustomerCard customer={viewTarget.customerA} side="A" />
                <CustomerCard customer={viewTarget.customerB} side="B" />
              </div>
              <div className="rounded-xl border border-border/60 bg-background/30 overflow-hidden">
                <div className="px-3 py-2 border-b border-border/60 bg-background/40 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  Comparativa campo por campo
                </div>
                <div className="overflow-x-auto rp-scroll-thin">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/40">
                        <th className="text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-3 py-2">Campo</th>
                        <th className="text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-3 py-2">A</th>
                        <th className="text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-3 py-2">B</th>
                        <th className="text-center text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-3 py-2">Match</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewTarget.matchReasons.map((r) => (
                        <tr key={r.field} className="border-b border-border/30 last:border-b-0">
                          <td className="px-3 py-2 font-medium text-xs">{FIELD_LABELS[r.field] ?? r.field}</td>
                          <td className="px-3 py-2 font-mono text-xs text-muted-foreground break-all">{r.valueA}</td>
                          <td className="px-3 py-2 font-mono text-xs text-muted-foreground break-all">{r.valueB}</td>
                          <td className="px-3 py-2 text-center">
                            {r.match ? (
                              <Check className="h-4 w-4 text-emerald-300 inline" aria-hidden />
                            ) : (
                              <X className="h-4 w-4 text-destructive inline" aria-hidden />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Propuesta en</div>
                  <div className="font-medium">{fmtDateTime(viewTarget.proposedAt)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Resuelta en</div>
                  <div className="font-medium">{fmtDateTime(viewTarget.resolvedAt)}</div>
                </div>
                {viewTarget.resolvedBy && (
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Resuelta por</div>
                    <div className="font-medium">{viewTarget.resolvedBy}</div>
                  </div>
                )}
                {viewTarget.reason && (
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Motivo</div>
                    <div className="font-medium">{viewTarget.reason}</div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setViewTarget(null)} className="min-h-11">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =========================================================
 * Merge history tab
 * =======================================================*/
interface MergeHistoryTabProps {
  history: MergeRecord[];
  setHistory: React.Dispatch<React.SetStateAction<MergeRecord[]>>;
}

function MergeHistoryTab({ history, setHistory }: MergeHistoryTabProps) {
  const reduce = useReducedMotion();
  const { toast } = useToast();
  const [reverseTarget, setReverseTarget] = React.useState<MergeRecord | null>(null);

  function confirmReverse() {
    if (!reverseTarget) return;
    setHistory((prev) =>
      prev.map((m) =>
        m.id === reverseTarget.id
          ? { ...m, reversed: true, reversedAt: new Date().toISOString() }
          : m
      )
    );
    toast({
      title: "Fusión revertida (demo)",
      description: `${reverseTarget.sourceName} → ${reverseTarget.targetName} revertida`,
    });
    setReverseTarget(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <History className="h-4 w-4" aria-hidden />
          <span>
            <span className="text-foreground font-medium">{history.length}</span> fusiones registradas ·{" "}
            <span className="text-foreground font-medium">
              {history.filter((h) => h.reversed).length}
            </span>{" "}
            revertidas
          </span>
        </div>
        <Button
          variant="outline"
          className="min-h-11 border-[var(--gold)]/40 text-[var(--gold-soft)] hover:bg-[var(--gold)]/10 shrink-0"
          onClick={() =>
            toast({
              title: "Historial exportado (demo)",
              description: "merge-history.csv",
            })
          }
        >
          <Download className="h-4 w-4 mr-1.5" aria-hidden /> Exportar historial
        </Button>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block rp-glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-background/30">
                <th className="text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-4 py-3">Source → Target</th>
                <th className="text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-4 py-3">Fecha</th>
                <th className="text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-4 py-3">Por</th>
                <th className="text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-4 py-3">Campos</th>
                <th className="text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-4 py-3">Estado</th>
                <th className="text-right text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-4 py-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {history.map((m) => (
                  <motion.tr
                    key={m.id}
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="border-b border-border/40 last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[var(--gold-soft)] text-xs">{m.sourceCustomerId}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">{m.sourceName}</span>
                        <ArrowRight className="h-3 w-3 text-[var(--gold)]" aria-hidden />
                        <span className="font-mono text-[var(--teal)] text-xs">{m.targetCustomerId}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">{m.targetName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{fmtDateTime(m.mergedAt)}</td>
                    <td className="px-4 py-3 text-xs">{m.mergedBy}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {m.fieldsMerged.map((f) => (
                          <span
                            key={f}
                            className="inline-flex items-center rounded-md border border-border/60 bg-background/40 px-1.5 py-0.5 text-[10px] font-mono"
                          >
                            {FIELD_LABELS[f] ?? f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {m.reversed ? (
                        <Badge variant="outline" className="text-[10px]">
                          <Undo2 className="h-3 w-3 mr-1" aria-hidden /> Revertida
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                          Activa
                        </Badge>
                      )}
                      {m.reversedAt && (
                        <div className="text-[10px] text-muted-foreground mt-1">{fmtDateTime(m.reversedAt)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!m.reversed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs text-amber-300 hover:bg-amber-400/10"
                          onClick={() => setReverseTarget(m)}
                        >
                          <Undo2 className="h-3.5 w-3.5 mr-1" aria-hidden /> Revertir
                        </Button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        <AnimatePresence initial={false}>
          {history.map((m) => (
            <motion.div
              key={m.id}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="rp-glass rounded-2xl p-4"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                  <span className="text-xs text-muted-foreground truncate">{m.sourceName}</span>
                  <ArrowRight className="h-3 w-3 text-[var(--gold)] shrink-0" aria-hidden />
                  <span className="text-xs font-medium truncate">{m.targetName}</span>
                </div>
                {m.reversed ? (
                  <Badge variant="outline" className="text-[10px]">
                    <Undo2 className="h-3 w-3 mr-1" aria-hidden /> Revertida
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                    Activa
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground mb-2">
                <span>{m.sourceCustomerId}</span>
                <ArrowRight className="h-3 w-3" aria-hidden />
                <span>{m.targetCustomerId}</span>
              </div>
              <div className="text-[11px] text-muted-foreground mb-2">
                {fmtDateTime(m.mergedAt)} · {m.mergedBy}
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {m.fieldsMerged.map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center rounded-md border border-border/60 bg-background/40 px-1.5 py-0.5 text-[10px] font-mono"
                  >
                    {FIELD_LABELS[f] ?? f}
                  </span>
                ))}
              </div>
              {m.reason && (
                <div className="text-xs text-muted-foreground italic mb-2">{m.reason}</div>
              )}
              {!m.reversed && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-2 text-xs text-amber-300 hover:bg-amber-400/10 min-h-[44px]"
                  onClick={() => setReverseTarget(m)}
                >
                  <Undo2 className="h-3.5 w-3.5 mr-1" aria-hidden /> Revertir fusión
                </Button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Reverse confirm */}
      <AlertDialog open={!!reverseTarget} onOpenChange={(o) => !o && setReverseTarget(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-300">
              <Undo2 className="h-4 w-4" aria-hidden /> Revertir fusión
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se restaurará el perfil original. Los datos creados después de la fusión se mantendrán en el
              perfil target. La reversión queda registrada en el historial inmutable de merges.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {reverseTarget && (
            <div className="rounded-lg border border-border/60 bg-background/40 p-3 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-muted-foreground text-xs">Source:</span>
                <span className="font-medium">{reverseTarget.sourceName}</span>
                <ArrowRight className="h-4 w-4 text-[var(--gold)]" aria-hidden />
                <span className="text-muted-foreground text-xs">Target:</span>
                <span className="font-medium">{reverseTarget.targetName}</span>
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground font-mono">
                {fmtDateTime(reverseTarget.mergedAt)} · {reverseTarget.mergedBy}
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReverse}
              className="min-h-11 bg-amber-500 text-black hover:bg-amber-400"
            >
              Confirmar reversión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* =========================================================
 * Matching rules tab
 * =======================================================*/
function MatchingRulesTab({
  rules,
  setRules,
}: {
  rules: MatchingRule[];
  setRules: React.Dispatch<React.SetStateAction<MatchingRule[]>>;
}) {
  const reduce = useReducedMotion();
  const { toast } = useToast();
  const [newOpen, setNewOpen] = React.useState(false);
  const [newCondition, setNewCondition] = React.useState("");
  const [newDesc, setNewDesc] = React.useState("");
  const [newConf, setNewConf] = React.useState<MatchConfidence>("medium");
  const [newAuto, setNewAuto] = React.useState(false);

  function toggleRule(id: string, key: "active" | "autoMerge") {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        // autoMerge only allowed on high confidence
        if (key === "autoMerge" && !r.autoMerge && r.confidence !== "high") {
          toast({
            title: "Auto-merge no disponible",
            description: "Solo las reglas de alta confianza pueden fusionar automáticamente.",
            variant: "destructive",
          });
          return r;
        }
        return { ...r, [key]: !r[key] };
      })
    );
  }

  function addRule() {
    if (!newCondition.trim()) return;
    const id = `rule-${rules.length + 1}`;
    setRules((prev) => [
      ...prev,
      {
        id,
        condition: newCondition.trim(),
        description: newDesc.trim() || "Regla personalizada",
        confidence: newConf,
        autoMerge: newConf === "high" ? newAuto : false,
        active: true,
        icon: Sparkles,
      },
    ]);
    toast({
      title: "Regla creada (demo)",
      description: `${newCondition.trim()} · ${CONFIDENCE_META[newConf].label}`,
    });
    setNewOpen(false);
    setNewCondition("");
    setNewDesc("");
    setNewConf("medium");
    setNewAuto(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Settings className="h-4 w-4" aria-hidden />
          <span>
            <span className="text-foreground font-medium">{rules.length}</span> reglas activas ·{" "}
            <span className="text-foreground font-medium">
              {rules.filter((r) => r.autoMerge).length}
            </span>{" "}
            con auto-merge
          </span>
        </div>
        <Button
          onClick={() => setNewOpen(true)}
          className="min-h-11 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] shrink-0"
        >
          <Plus className="h-4 w-4 mr-1.5" aria-hidden /> Nueva regla
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <AnimatePresence initial={false}>
          {rules.map((r) => {
            const conf = CONFIDENCE_META[r.confidence];
            return (
              <motion.div
                key={r.id}
                layout
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "rp-glass rounded-2xl p-4",
                  !r.active && "opacity-60"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <div
                      className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-lg border",
                        conf.tone
                      )}
                    >
                      <r.icon className="h-4 w-4" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{r.condition}</div>
                      <div className="text-[11px] text-muted-foreground line-clamp-2">{r.description}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("text-[10px] shrink-0", conf.tone)}>
                    {conf.label}
                  </Badge>
                </div>

                <div className="mt-3 space-y-2 border-t border-border/40 pt-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-medium">Auto-merge</div>
                      <div className="text-[10px] text-muted-foreground">
                        {r.confidence === "high"
                          ? "Disponible para alta confianza"
                          : "No disponible para esta confianza"}
                      </div>
                    </div>
                    <Switch
                      checked={r.autoMerge}
                      onCheckedChange={() => toggleRule(r.id, "autoMerge")}
                      disabled={r.confidence !== "high"}
                      aria-label="Auto-merge"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-medium">Activa</div>
                      <div className="text-[10px] text-muted-foreground">
                        {r.active ? "La regla se evalúa" : "La regla está pausada"}
                      </div>
                    </div>
                    <Switch
                      checked={r.active}
                      onCheckedChange={() => toggleRule(r.id, "active")}
                      aria-label="Activa"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <Note variant="info">
        Las reglas de matching son configurables por organización. La fusión automática solo se permite para
        coincidencias de alta confianza. Las coincidencias ambiguas siempre requieren revisión manual.
      </Note>

      {/* New rule dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva regla de matching</DialogTitle>
            <DialogDescription>
              Define una condición de coincidencia, su nivel de confianza y si puede fusionar automáticamente.
              Solo las reglas de alta confianza permiten auto-merge.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="r-cond">Condición</Label>
              <Input
                id="r-cond"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                placeholder="Ej. Fecha nacimiento + código postal"
                className="min-h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-desc">Descripción</Label>
              <Textarea
                id="r-desc"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Explica cómo se evalúa esta regla…"
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-conf">Confianza</Label>
              <Select value={newConf} onValueChange={(v) => setNewConf(v as MatchConfidence)}>
                <SelectTrigger id="r-conf" className="min-h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CONFIDENCE_META) as MatchConfidence[]).map((c) => (
                    <SelectItem key={c} value={c}>
                      {CONFIDENCE_META[c].label} — {CONFIDENCE_META[c].description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/40 p-3">
              <div>
                <div className="text-sm font-medium">Auto-merge</div>
                <div className="text-[11px] text-muted-foreground">
                  {newConf === "high"
                    ? "Disponible para alta confianza"
                    : "Se desactiva automáticamente si la confianza no es alta"}
                </div>
              </div>
              <Switch
                checked={newConf === "high" ? newAuto : false}
                onCheckedChange={setNewAuto}
                disabled={newConf !== "high"}
                aria-label="Auto-merge"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewOpen(false)} className="min-h-11">
              Cancelar
            </Button>
            <Button
              onClick={addRule}
              disabled={!newCondition.trim()}
              className="min-h-11 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
            >
              Crear regla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =========================================================
 * Main component
 * =======================================================*/
export function CrmIdentity() {
  const reduce = useReducedMotion();
  const [tab, setTab] = React.useState<"duplicates" | "history" | "rules">("duplicates");
  const [matches, setMatches] = React.useState<DuplicateMatch[]>(DEMO_MATCHES);
  const [mergeHistory, setMergeHistory] = React.useState<MergeRecord[]>(DEMO_MERGE_HISTORY);
  const [rules, setRules] = React.useState<MatchingRule[]>(DEMO_RULES);

  function addMergeToHistory(
    m: DuplicateMatch,
    primarySide: "A" | "B",
    fields: string[],
    reason: string
  ) {
    const source = primarySide === "A" ? m.customerB : m.customerA;
    const target = primarySide === "A" ? m.customerA : m.customerB;
    const rec: MergeRecord = {
      id: `mr-${mergeHistory.length + 1}`,
      sourceCustomerId: source.id,
      targetCustomerId: target.id,
      sourceName: source.name,
      targetName: target.name,
      mergedAt: new Date().toISOString(),
      mergedBy: "Elena Marín",
      reason,
      reversed: false,
      fieldsMerged: fields,
    };
    setMergeHistory((prev) => [rec, ...prev]);
  }

  const tabMeta: { id: typeof tab; label: string; icon: React.ElementType }[] = [
    { id: "duplicates", label: "Duplicados", icon: Users },
    { id: "history", label: "Historial de merges", icon: History },
    { id: "rules", label: "Reglas de matching", icon: Settings },
  ];

  return (
    <div className="space-y-5">
      <SectionTitle
        icon={Fingerprint}
        title="Resolución de identidad y deduplicación"
        description="Detección de duplicados, propuestas de fusión reversibles y reglas de matching configurables."
        right={
          <Badge variant="outline" className="border-[var(--teal)]/30 bg-[var(--teal)]/10 text-[var(--teal)]">
            <ShieldCheck className="h-3 w-3 mr-1" aria-hidden /> Auditable
          </Badge>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="bg-muted/40 p-1 h-auto flex flex-wrap gap-1">
          {tabMeta.map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="data-[state=active]:bg-[var(--teal)]/10 data-[state=active]:text-[var(--teal)] min-h-[40px] px-3"
            >
              <t.icon className="h-4 w-4 mr-1.5 sm:mr-1" aria-hidden />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">
                {t.id === "duplicates" ? "Duplicados" : t.id === "history" ? "Merges" : "Reglas"}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="duplicates" className="mt-4 focus-visible:outline-none">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <DuplicatesTab
              matches={matches}
              setMatches={setMatches}
              addMergeToHistory={addMergeToHistory}
            />
          </motion.div>
        </TabsContent>
        <TabsContent value="history" className="mt-4 focus-visible:outline-none">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MergeHistoryTab history={mergeHistory} setHistory={setMergeHistory} />
          </motion.div>
        </TabsContent>
        <TabsContent value="rules" className="mt-4 focus-visible:outline-none">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MatchingRulesTab rules={rules} setRules={setRules} />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
