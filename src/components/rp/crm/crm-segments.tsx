"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Layers,
  Plus,
  Trash2,
  Pencil,
  Eye,
  Pause,
  Play,
  ShieldCheck,
  Users,
  Filter,
  Sparkles,
  TrendingUp,
  Clock,
  X,
  Settings2,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type SegmentType = "static" | "dynamic" | "predictive";
type SegmentStatus = "active" | "paused" | "draft";

interface Condition {
  field: string;
  operator: string;
  value: string;
}

interface Segment {
  id: string;
  name: string;
  description: string;
  type: SegmentType;
  size: number;
  conditions: Condition[];
  updatedAt: string;
  consentRequired: boolean;
  status: SegmentStatus;
}

/* =========================================================
 * Meta
 * =======================================================*/
const TYPE_META: Record<
  SegmentType,
  { label: string; badge: string; dot: string; icon: React.ElementType }
> = {
  static: {
    label: "Estático",
    badge: "border-foreground/20 bg-foreground/5 text-foreground/70",
    dot: "bg-foreground/40",
    icon: Layers,
  },
  dynamic: {
    label: "Dinámico",
    badge: "border-[var(--teal)]/30 bg-[var(--teal)]/10 text-[var(--teal)]",
    dot: "bg-[var(--teal)]",
    icon: Filter,
  },
  predictive: {
    label: "Predictivo",
    badge: "border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
    dot: "bg-[var(--gold)]",
    icon: Sparkles,
  },
};

const STATUS_META: Record<
  SegmentStatus,
  { label: string; badge: string; dot: string }
> = {
  active: {
    label: "Activa",
    badge: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    dot: "bg-emerald-400",
  },
  paused: {
    label: "Pausada",
    badge: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
  },
  draft: {
    label: "Borrador",
    badge: "border-foreground/20 bg-foreground/5 text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

const FIELD_OPTIONS = [
  { value: "last_visit", label: "Última visita" },
  { value: "avg_ticket", label: "Ticket medio" },
  { value: "total_visits", label: "Visitas totales" },
  { value: "ltv", label: "LTV" },
  { value: "channel", label: "Canal" },
  { value: "zone", label: "Zona" },
  { value: "birthday", label: "Cumpleaños" },
  { value: "churn_risk", label: "Riesgo abandono" },
];

const OPERATOR_OPTIONS: Record<string, { value: string; label: string }[]> = {
  numeric: [
    { value: ">", label: ">" },
    { value: "<", label: "<" },
    { value: "=", label: "=" },
  ],
  time: [
    { value: "older_than", label: "hace más de" },
    { value: "newer_than", label: "hace menos de" },
  ],
  text: [{ value: "contains", label: "contiene" }],
  other: [{ value: "is", label: "es" }],
};

function opsForField(field: string): { value: string; label: string }[] {
  if (field === "last_visit") return OPERATOR_OPTIONS.time;
  if (["avg_ticket", "total_visits", "ltv", "churn_risk"].includes(field))
    return OPERATOR_OPTIONS.numeric;
  if (field === "channel" || field === "zone")
    return OPERATOR_OPTIONS.text;
  if (field === "birthday") return OPERATOR_OPTIONS.other;
  return OPERATOR_OPTIONS.numeric;
}

function fieldLabel(field: string): string {
  return FIELD_OPTIONS.find((f) => f.value === field)?.label ?? field;
}

function operatorLabel(op: string): string {
  const all = [
    ...OPERATOR_OPTIONS.numeric,
    ...OPERATOR_OPTIONS.time,
    ...OPERATOR_OPTIONS.text,
    ...OPERATOR_OPTIONS.other,
  ];
  return all.find((o) => o.value === op)?.label ?? op;
}

/* =========================================================
 * Helpers
 * =======================================================*/
function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `hace ${d} d`;
  const mo = Math.floor(d / 30);
  return `hace ${mo} m`;
}

function uid(): string {
  return `seg-${Math.random().toString(36).slice(2, 9)}`;
}

/* Mock size calculation for live preview in rule builder */
function mockEstimate(conditions: Condition[], consentRequired: boolean): number {
  if (conditions.length === 0) return 0;
  let base = 847;
  if (consentRequired) base = Math.floor(base * 0.72);
  for (let i = 1; i < conditions.length; i++) base = Math.floor(base * 0.55);
  // deterministic pseudo-random based on conditions length + first value
  const seed = (conditions.length + (conditions[0]?.value?.length ?? 0)) % 7;
  base = base - (base % 10) - seed * 3;
  return Math.max(1, Math.min(base, 847));
}

/* =========================================================
 * Demo data
 * =======================================================*/
const now = Date.now();

const INITIAL_SEGMENTS: Segment[] = [
  {
    id: "seg-1",
    name: "Inactivos 60 días",
    description: "Clientes que no visitan el restaurante en los últimos 60 días.",
    type: "dynamic",
    size: 127,
    conditions: [{ field: "last_visit", operator: "older_than", value: "60 días" }],
    updatedAt: new Date(now - 1000 * 60 * 30).toISOString(),
    consentRequired: false,
    status: "active",
  },
  {
    id: "seg-2",
    name: "Alto ticket",
    description: "Clientes con ticket medio superior a 150€.",
    type: "static",
    size: 43,
    conditions: [{ field: "avg_ticket", operator: ">", value: "150€" }],
    updatedAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
    consentRequired: true,
    status: "active",
  },
  {
    id: "seg-3",
    name: "Cumpleaños este mes",
    description: "Clientes que cumplen años en el mes actual — objetivo de campaña.",
    type: "dynamic",
    size: 28,
    conditions: [{ field: "birthday", operator: "is", value: "mes actual" }],
    updatedAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
    consentRequired: true,
    status: "active",
  },
  {
    id: "seg-4",
    name: "Riesgo de abandono",
    description: "La IA marca probabilidad de abandono superior al 60%.",
    type: "predictive",
    size: 19,
    conditions: [{ field: "churn_risk", operator: ">", value: "60%" }],
    updatedAt: new Date(now - 1000 * 60 * 45).toISOString(),
    consentRequired: false,
    status: "active",
  },
  {
    id: "seg-5",
    name: "Viernes habituales",
    description: "Clientes que reservan habitualmente en viernes.",
    type: "dynamic",
    size: 62,
    conditions: [{ field: "zone", operator: "contains", value: "viernes" }],
    updatedAt: new Date(now - 1000 * 60 * 60 * 18).toISOString(),
    consentRequired: false,
    status: "active",
  },
  {
    id: "seg-6",
    name: "Prefieren terraza",
    description: "Clientes con preferencia marcada por la zona terraza.",
    type: "static",
    size: 89,
    conditions: [{ field: "zone", operator: "contains", value: "terraza" }],
    updatedAt: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
    consentRequired: false,
    status: "active",
  },
  {
    id: "seg-7",
    name: "Alta cancelación",
    description: "La IA detecta tasa de cancelación superior al 30%.",
    type: "predictive",
    size: 12,
    conditions: [{ field: "churn_risk", operator: ">", value: "30% cancelaciones" }],
    updatedAt: new Date(now - 1000 * 60 * 90).toISOString(),
    consentRequired: false,
    status: "paused",
  },
  {
    id: "seg-8",
    name: "VIP potencial",
    description: "La IA proyecta LTV superior a 5000€ en próximos 12 meses.",
    type: "predictive",
    size: 7,
    conditions: [{ field: "ltv", operator: ">", value: "5000€ (proyectado)" }],
    updatedAt: new Date(now - 1000 * 60 * 15).toISOString(),
    consentRequired: true,
    status: "active",
  },
  {
    id: "seg-9",
    name: "Responden por WhatsApp",
    description: "Clientes cuyo canal de respuesta preferido es WhatsApp.",
    type: "dynamic",
    size: 156,
    conditions: [{ field: "channel", operator: "contains", value: "whatsapp" }],
    updatedAt: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
    consentRequired: true,
    status: "active",
  },
  {
    id: "seg-10",
    name: "Nuevos con potencial",
    description: "La IA detecta menos de 3 visitas pero LTV proyectado > 1000€.",
    type: "predictive",
    size: 34,
    conditions: [
      { field: "total_visits", operator: "<", value: "3" },
      { field: "ltv", operator: ">", value: "1000€ (proyectado)" },
    ],
    updatedAt: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
    consentRequired: true,
    status: "draft",
  },
];

/* =========================================================
 * Stats
 * =======================================================*/
function StatCell({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  tone: "gold" | "teal" | "emerald" | "fg";
  icon: React.ElementType;
}) {
  const color =
    tone === "gold"
      ? "rp-gold-text"
      : tone === "teal"
      ? "rp-teal-text"
      : tone === "emerald"
      ? "text-emerald-300"
      : "text-foreground";
  return (
    <div className="rp-glass rounded-xl p-3 sm:p-4 flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-foreground/5">
        <Icon className={cn("h-4 w-4", color)} aria-hidden />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className={cn("font-display text-xl sm:text-2xl font-light leading-tight", color)}>
          {value}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Rule builder dialog
 * =======================================================*/
function RuleBuilderDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (seg: Segment) => void;
}) {
  const { toast } = useToast();
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<SegmentType>("dynamic");
  const [consent, setConsent] = React.useState(true);
  const [conditions, setConditions] = React.useState<Condition[]>([
    { field: "last_visit", operator: "older_than", value: "" },
  ]);
  const [error, setError] = React.useState<string | null>(null);

  // reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setName("");
      setType("dynamic");
      setConsent(true);
      setConditions([{ field: "last_visit", operator: "older_than", value: "" }]);
      setError(null);
    }
  }, [open]);

  const estimate = React.useMemo(
    () => mockEstimate(conditions, consent),
    [conditions, consent]
  );

  const addCondition = () => {
    setConditions((prev) => [
      ...prev,
      { field: "total_visits", operator: ">", value: "" },
    ]);
  };

  const removeCondition = (i: number) => {
    setConditions((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateCondition = (i: number, patch: Partial<Condition>) => {
    setConditions((prev) =>
      prev.map((c, idx) => {
        if (idx !== i) return c;
        const next = { ...c, ...patch };
        // if field changed, reset operator to first valid op for that field
        if (patch.field && patch.field !== c.field) {
          const ops = opsForField(patch.field);
          next.operator = ops[0]?.value ?? ">";
        }
        return next;
      })
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError("El nombre del segmento es obligatorio.");
      return;
    }
    const valid = conditions.filter((c) => c.value.trim() !== "");
    if (valid.length === 0) {
      setError("Añade al menos una condición con valor.");
      return;
    }
    const seg: Segment = {
      id: uid(),
      name: name.trim(),
      description: `Segmento ${TYPE_META[type].label.toLowerCase()} creado manualmente con ${valid.length} condición${valid.length > 1 ? "es" : ""}.`,
      type,
      size: estimate,
      conditions: valid,
      updatedAt: new Date().toISOString(),
      consentRequired: consent,
      status: "draft",
    };
    onSave(seg);
    toast({
      title: "Segmento creado",
      description: `"${seg.name}" creado en estado borrador con ~${seg.size} clientes.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rp-scroll-thin bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/10">
              <Plus className="h-4 w-4 rp-gold-text" aria-hidden />
            </span>
            Nuevo segmento
          </DialogTitle>
          <DialogDescription>
            Construye un segmento con reglas. La IA puede aplicar predicciones si lo marcas como predictivo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Name + type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="seg-name" className="text-xs font-mono uppercase tracking-wider">
                Nombre del segmento
              </Label>
              <Input
                id="seg-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Clientes VIP inactivos"
                className="bg-background/40"
                aria-invalid={!!error && !name.trim()}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seg-type" className="text-xs font-mono uppercase tracking-wider">
                Tipo
              </Label>
              <Select value={type} onValueChange={(v) => setType(v as SegmentType)}>
                <SelectTrigger id="seg-type" className="bg-background/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="static">Estático</SelectItem>
                  <SelectItem value="dynamic">Dinámico</SelectItem>
                  <SelectItem value="predictive">Predictivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conditions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-mono uppercase tracking-wider">
                Condiciones
              </Label>
              <span className="text-[11px] text-muted-foreground font-mono">
                {conditions.length} regla{conditions.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-2">
              {conditions.map((c, i) => {
                const ops = opsForField(c.field);
                return (
                  <div
                    key={i}
                    className="flex flex-wrap sm:flex-nowrap items-center gap-2 rp-glass rounded-lg p-2.5"
                  >
                    <Select
                      value={c.field}
                      onValueChange={(v) => updateCondition(i, { field: v })}
                    >
                      <SelectTrigger className="h-9 bg-background/40 flex-1 min-w-[140px]">
                        <SelectValue placeholder="Campo" />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_OPTIONS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={c.operator}
                      onValueChange={(v) => updateCondition(i, { operator: v })}
                    >
                      <SelectTrigger className="h-9 bg-background/40 w-[140px] sm:w-[150px]">
                        <SelectValue placeholder="Operador" />
                      </SelectTrigger>
                      <SelectContent>
                        {ops.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={c.value}
                      onChange={(e) => updateCondition(i, { value: e.target.value })}
                      placeholder="Valor"
                      className="h-9 bg-background/40 flex-1 min-w-[100px]"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeCondition(i)}
                      disabled={conditions.length === 1}
                      aria-label={`Quitar condición ${i + 1}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addCondition}
              className="h-9 border-dashed w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" aria-hidden />
              Añadir condición
            </Button>
          </div>

          {/* Consent */}
          <div className="rp-glass rounded-lg p-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 rp-teal-text" aria-hidden />
                Requiere consentimiento marketing
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Si activo, el segmento excluye clientes sin consentimiento de marketing válido.
              </p>
            </div>
            <Switch checked={consent} onCheckedChange={setConsent} aria-label="Requiere consentimiento" />
          </div>

          {/* Live preview */}
          <div className="rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/5 p-3 flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--gold)]/15">
              <Users className="h-4 w-4 rp-gold-text" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Vista previa (estimación)
              </div>
              <div className="font-display text-lg rp-gold-text">
                ~{estimate} clientes
              </div>
            </div>
            <span className="ml-auto text-[10px] font-mono text-muted-foreground/70 hidden sm:inline">
              cálculo demo
            </span>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive"
            >
              <X className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
          >
            <Sparkles className="h-4 w-4 mr-2" aria-hidden />
            Guardar segmento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Segment card
 * =======================================================*/
function SegmentCard({
  segment,
  index,
  reduceMotion,
  onView,
  onToggle,
  onEdit,
  onDelete,
}: {
  segment: Segment;
  index: number;
  reduceMotion: boolean | null;
  onView: (s: Segment) => void;
  onToggle: (s: Segment) => void;
  onEdit: (s: Segment) => void;
  onDelete: (s: Segment) => void;
}) {
  const typeMeta = TYPE_META[segment.type];
  const statusMeta = STATUS_META[segment.status];
  const TypeIcon = typeMeta.icon;

  return (
    <motion.article
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.3, delay: reduceMotion ? 0 : Math.min(index * 0.04, 0.3) }}
      className="rp-glass rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5"
      aria-labelledby={`seg-name-${segment.id}`}
    >
      {/* Top row: name + badges */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-foreground/5">
            <TypeIcon className={cn("h-4 w-4", segment.type === "predictive" ? "rp-gold-text" : segment.type === "dynamic" ? "rp-teal-text" : "text-foreground/70")} aria-hidden />
          </span>
          <h3
            id={`seg-name-${segment.id}`}
            className="font-display text-base sm:text-lg font-medium text-foreground leading-tight truncate"
          >
            {segment.name}
          </h3>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider shrink-0",
            typeMeta.badge
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", typeMeta.dot)} />
          {typeMeta.label}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
        {segment.description}
      </p>

      {/* Size */}
      <div className="flex items-baseline gap-2">
        <span className="font-display text-3xl font-light rp-gold-text leading-none">
          {segment.size}
        </span>
        <span className="text-xs text-muted-foreground font-mono">clientes</span>
      </div>

      {/* Conditions chips */}
      <div className="flex flex-wrap gap-1.5">
        {segment.conditions.map((c, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-md border border-foreground/10 bg-foreground/5 px-2 py-0.5 text-[11px] text-foreground/75"
          >
            <span className="h-1 w-1 rounded-full bg-[var(--teal)]" aria-hidden />
            {fieldLabel(c.field)} {operatorLabel(c.operator)} {c.value}
          </span>
        ))}
      </div>

      {/* Meta row: status + consent + updated */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
            statusMeta.badge
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", statusMeta.dot)} />
          {statusMeta.label}
        </span>
        {segment.consentRequired && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1 rounded-md border border-[var(--teal)]/30 bg-[var(--teal)]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]">
                  <ShieldCheck className="h-3 w-3" aria-hidden />
                  Consentimiento
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Excluye clientes sin consentimiento de marketing.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground/70 ml-auto">
          <Clock className="h-3 w-3" aria-hidden />
          {formatRelative(segment.updatedAt)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/40">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => onView(segment)}
        >
          <Eye className="h-3.5 w-3.5 mr-1.5" aria-hidden />
          Ver clientes
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => onToggle(segment)}
        >
          {segment.status === "active" ? (
            <>
              <Pause className="h-3.5 w-3.5 mr-1.5" aria-hidden />
              Pausar
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 mr-1.5" aria-hidden />
              Activar
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs ml-auto"
          onClick={() => onEdit(segment)}
          aria-label={`Editar ${segment.name}`}
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden />
          <span className="sr-only">Editar</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(segment)}
          aria-label={`Eliminar ${segment.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          <span className="sr-only">Eliminar</span>
        </Button>
      </div>
    </motion.article>
  );
}

/* =========================================================
 * Main
 * =======================================================*/
export function CrmSegments() {
  const reduceMotion = useReducedMotion();
  const { toast } = useToast();
  const [segments, setSegments] = React.useState<Segment[]>(INITIAL_SEGMENTS);
  const [filter, setFilter] = React.useState<"all" | SegmentType>("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Segment | null>(null);

  const filtered = React.useMemo(() => {
    if (filter === "all") return segments;
    return segments.filter((s) => s.type === filter);
  }, [segments, filter]);

  const stats = React.useMemo(() => {
    return {
      total: segments.length,
      clientes: segments.reduce((sum, s) => sum + s.size, 0),
      activos: segments.filter((s) => s.status === "active").length,
      predictivos: segments.filter((s) => s.type === "predictive").length,
    };
  }, [segments]);

  const FILTER_TABS: { value: "all" | SegmentType; label: string; count: number }[] = [
    { value: "all", label: "Todos", count: segments.length },
    { value: "static", label: "Estáticos", count: segments.filter((s) => s.type === "static").length },
    { value: "dynamic", label: "Dinámicos", count: segments.filter((s) => s.type === "dynamic").length },
    { value: "predictive", label: "Predictivos", count: segments.filter((s) => s.type === "predictive").length },
  ];

  const handleSave = (seg: Segment) => {
    setSegments((prev) => [seg, ...prev]);
  };

  const handleToggle = (seg: Segment) => {
    setSegments((prev) =>
      prev.map((s) =>
        s.id === seg.id
          ? { ...s, status: s.status === "active" ? "paused" : "active", updatedAt: new Date().toISOString() }
          : s
      )
    );
    toast({
      title: seg.status === "active" ? "Segmento pausado" : "Segmento activado",
      description: `"${seg.name}" ${seg.status === "active" ? "ya no se actualiza automáticamente" : "vuelve a estar activo"}.`,
    });
  };

  const handleView = (seg: Segment) => {
    toast({
      title: "Clientes del segmento",
      description: `"${seg.name}" contiene ${seg.size} clientes. Vista de lista próximamente.`,
    });
  };

  const handleEdit = (seg: Segment) => {
    toast({
      title: "Editar segmento",
      description: `Editor de "${seg.name}" — disponible en próxima iteración.`,
    });
  };

  const handleDelete = (seg: Segment) => {
    setSegments((prev) => prev.filter((s) => s.id !== seg.id));
    toast({
      title: "Segmento eliminado",
      description: `"${seg.name}" fue eliminado permanentemente.`,
    });
    setDeleteTarget(null);
  };

  return (
    <section className="space-y-5 sm:space-y-6" aria-labelledby="crm-seg-heading">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--teal)]/30 bg-[var(--teal)]/10">
            <Layers className="h-5 w-5 rp-teal-text" aria-hidden />
          </span>
          <div>
            <h2
              id="crm-seg-heading"
              className="font-display text-xl sm:text-2xl font-medium tracking-tight text-foreground"
            >
              Segmentación inteligente
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Segmentos dinámicos y predictivos con constructor de reglas.
            </p>
          </div>
          <Badge
            variant="outline"
            className="ml-1 border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)] font-mono uppercase tracking-wider text-[10px]"
          >
            demo
          </Badge>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="h-10 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] font-medium self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 mr-2" aria-hidden />
          Nuevo segmento
        </Button>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCell label="Segmentos totales" value={stats.total} tone="gold" icon={Layers} />
        <StatCell label="Clientes segmentados" value={stats.clientes} tone="teal" icon={Users} />
        <StatCell label="Segmentos activos" value={stats.activos} tone="emerald" icon={TrendingUp} />
        <StatCell label="Predictivos (IA)" value={stats.predictivos} tone="gold" icon={Sparkles} />
      </div>

      {/* Filter tabs */}
      <div
        role="tablist"
        aria-label="Filtrar segmentos por tipo"
        className="flex items-center gap-1.5 rp-glass rounded-xl p-1.5 overflow-x-auto rp-scroll-thin"
      >
        {FILTER_TABS.map((tab) => {
          const active = filter === tab.value;
          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => setFilter(tab.value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors min-h-[36px]",
                active
                  ? "bg-[var(--gold)]/15 rp-gold-text border border-[var(--gold)]/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5 border border-transparent"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "inline-flex items-center justify-center rounded-full px-1.5 text-[10px] font-mono",
                  active ? "bg-[var(--gold)]/20" : "bg-foreground/10"
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Segments grid */}
      <AnimatePresence mode="popLayout">
        <motion.div
          layout={!reduceMotion}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5"
        >
          {filtered.map((seg, i) => (
            <SegmentCard
              key={seg.id}
              segment={seg}
              index={i}
              reduceMotion={reduceMotion}
              onView={handleView}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={(s) => setDeleteTarget(s)}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="rp-glass rounded-2xl p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No hay segmentos en este filtro. Crea uno con el botón “Nuevo segmento”.
          </p>
        </div>
      )}

      {/* Rule builder dialog */}
      <RuleBuilderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-destructive" aria-hidden />
              Eliminar segmento
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que quieres eliminar <span className="text-foreground font-medium">“{deleteTarget?.name}”</span>?
              Esta acción no se puede deshacer. Los clientes del segmento no se verán afectados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Disclaimer footer */}
      <footer className="rp-glass rounded-xl p-4 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--teal)]/30 bg-[var(--teal)]/10">
          <Settings2 className="h-3.5 w-3.5 rp-teal-text" aria-hidden />
        </span>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Los segmentos dinámicos se recalculan automáticamente. Los predictivos usan modelos ML
          con calidad de datos visible.{" "}
          <span className="text-foreground/80 font-medium">El consentimiento de marketing siempre se respeta.</span>
        </p>
      </footer>
    </section>
  );
}
