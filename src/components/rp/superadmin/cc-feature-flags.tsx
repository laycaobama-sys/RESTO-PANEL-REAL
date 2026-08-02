"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Switch
} from "@/components/ui/switch";
import {
  Flag, Plus, Pause, Play, Skull, History, Pencil, Info, Beaker, Globe2,
  Building2, Users, AlertOctagon, CheckCircle2, XCircle,
  Sparkles,
} from "lucide-react";

/* ---------------- shared bits ---------------- */


/* ---------------- types ---------------- */
interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  status: "active" | "paused" | "killed";
  rollout: number;
  targeting: {
    plans: string[];
    countries: string[];
    orgs: string[];
    cohorts: string[];
    beta: boolean;
    environment: "production" | "staging" | "all";
  };
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
  metrics: { exposures: number; adoption: number; errors: number };
  history: { at: string; action: string; by: string }[];
}

/* ---------------- demo flags ---------------- */
const INITIAL_FLAGS: FeatureFlag[] = [
  {
    id: "f1",
    key: "new_floor_editor",
    name: "Editor de planos v2",
    description: "Editor de mesas rediseñado con drag-and-drop mejorado y plantillas por tipo de local.",
    status: "active",
    rollout: 100,
    targeting: { plans: ["Starter", "Pro", "Enterprise"], countries: [], orgs: [], cohorts: [], beta: false, environment: "production" },
    dependencies: [],
    createdAt: "2025-03-12",
    updatedAt: "hace 4 días",
    metrics: { exposures: 1240, adoption: 34, errors: 0.1 },
    history: [
      { at: "hace 4 días", action: "Rollout subido a 100%", by: "lucia.m" },
      { at: "hace 11 días", action: "Rollout subido a 75%", by: "lucia.m" },
      { at: "hace 25 días", action: "Rollout subido a 25%", by: "diego.r" },
      { at: "hace 32 días", action: "Flag creada", by: "diego.r" },
    ],
  },
  {
    id: "f2",
    key: "ai_copilot_v2",
    name: "AI Copilot v2",
    description: "Asistente IA con contexto multi-local y sugerencias proactivas de marketing.",
    status: "active",
    rollout: 25,
    targeting: { plans: ["Pro", "Enterprise"], countries: [], orgs: [], cohorts: [], beta: true, environment: "production" },
    dependencies: [],
    createdAt: "2025-04-02",
    updatedAt: "hace 2 días",
    metrics: { exposures: 340, adoption: 89, errors: 0.4 },
    history: [
      { at: "hace 2 días", action: "Rollout subido a 25%", by: "lucia.m" },
      { at: "hace 9 días", action: "Rollout subido a 10%", by: "lucia.m" },
      { at: "hace 18 días", action: "Flag creada (beta)", by: "lucia.m" },
    ],
  },
  {
    id: "f3",
    key: "yield_management",
    name: "Yield management",
    description: "Pricing dinámico de reservas por franja horaria y demanda predicha.",
    status: "active",
    rollout: 50,
    targeting: { plans: ["Enterprise"], countries: [], orgs: [], cohorts: [], beta: false, environment: "production" },
    dependencies: [],
    createdAt: "2025-02-20",
    updatedAt: "hace 6 días",
    metrics: { exposures: 89, adoption: 62, errors: 0.0 },
    history: [
      { at: "hace 6 días", action: "Rollout subido a 50%", by: "diego.r" },
      { at: "hace 14 días", action: "Rollout subido a 25%", by: "diego.r" },
      { at: "hace 28 días", action: "Flag creada", by: "diego.r" },
    ],
  },
  {
    id: "f4",
    key: "waitlist_engine",
    name: "Motor de lista de espera",
    description: "Lista de espera inteligente con notificaciones automáticas al liberarse mesa.",
    status: "paused",
    rollout: 0,
    targeting: { plans: ["Starter", "Pro", "Enterprise"], countries: [], orgs: [], cohorts: [], beta: false, environment: "production" },
    dependencies: ["new_floor_editor"],
    createdAt: "2025-04-15",
    updatedAt: "hace 1 día",
    metrics: { exposures: 0, adoption: 0, errors: 0.0 },
    history: [
      { at: "hace 1 día", action: "Flag pausada (dependencia no resuelta)", by: "lucia.m" },
      { at: "hace 3 días", action: "Rollout subido a 10%", by: "lucia.m" },
      { at: "hace 7 días", action: "Flag creada", by: "lucia.m" },
    ],
  },
  {
    id: "f5",
    key: "vectorize_search",
    name: "Búsqueda semántica Vectorize",
    description: "Búsqueda por significado en clientes, reservas y platos usando embeddings.",
    status: "active",
    rollout: 100,
    targeting: { plans: ["Starter", "Pro", "Enterprise"], countries: [], orgs: [], cohorts: [], beta: false, environment: "all" },
    dependencies: [],
    createdAt: "2025-01-10",
    updatedAt: "hace 20 días",
    metrics: { exposures: 2180, adoption: 71, errors: 0.05 },
    history: [
      { at: "hace 20 días", action: "Rollout subido a 100%", by: "diego.r" },
      { at: "hace 35 días", action: "Rollout subido a 50%", by: "diego.r" },
      { at: "hace 48 días", action: "Flag creada", by: "diego.r" },
    ],
  },
  {
    id: "f6",
    key: "executive_ai",
    name: "Executive AI",
    description: "Resúmenes ejecutivos diarios y alertas estratégicas para direcciones de grupo.",
    status: "active",
    rollout: 10,
    targeting: { plans: ["Enterprise"], countries: [], orgs: ["Ramses Group", "Sakura Sushi Chain"], cohorts: [], beta: true, environment: "production" },
    dependencies: ["ai_copilot_v2"],
    createdAt: "2025-04-22",
    updatedAt: "hace 3 días",
    metrics: { exposures: 47, adoption: 92, errors: 0.0 },
    history: [
      { at: "hace 3 días", action: "Rollout subido a 10%", by: "lucia.m" },
      { at: "hace 8 días", action: "Flag creada (beta)", by: "lucia.m" },
    ],
  },
  {
    id: "f7",
    key: "new_onboarding",
    name: "Onboarding rediseñado",
    description: "Flujo de onboarding en 4 pasos con wizard guiado y plantillas por tipo de cocina.",
    status: "active",
    rollout: 75,
    targeting: { plans: ["Starter", "Pro", "Enterprise"], countries: ["ES", "MX"], orgs: [], cohorts: [], beta: false, environment: "production" },
    dependencies: [],
    createdAt: "2025-03-28",
    updatedAt: "hace 5 días",
    metrics: { exposures: 612, adoption: 58, errors: 0.2 },
    history: [
      { at: "hace 5 días", action: "Rollout subido a 75%", by: "diego.r" },
      { at: "hace 12 días", action: "Rollout subido a 50%", by: "diego.r" },
      { at: "hace 22 días", action: "Flag creada", by: "diego.r" },
    ],
  },
  {
    id: "f8",
    key: "loyalty_wallet",
    name: "Wallet de fidelización",
    description: "Billetera de puntos y recompensas unificada para grupos multi-marca.",
    status: "active",
    rollout: 100,
    targeting: { plans: ["Pro", "Enterprise"], countries: [], orgs: [], cohorts: [], beta: false, environment: "production" },
    dependencies: [],
    createdAt: "2025-02-05",
    updatedAt: "hace 30 días",
    metrics: { exposures: 890, adoption: 44, errors: 0.08 },
    history: [
      { at: "hace 30 días", action: "Rollout subido a 100%", by: "lucia.m" },
      { at: "hace 45 días", action: "Rollout subido a 50%", by: "lucia.m" },
      { at: "hace 60 días", action: "Flag creada", by: "lucia.m" },
    ],
  },
  {
    id: "f9",
    key: "old_reservations_ui",
    name: "UI reservas antigua (deprecada)",
    description: "Interfaz de reservas anterior — mantenida como kill switch de rollback.",
    status: "killed",
    rollout: 0,
    targeting: { plans: ["Starter", "Pro", "Enterprise"], countries: [], orgs: [], cohorts: [], beta: false, environment: "production" },
    dependencies: [],
    createdAt: "2024-11-15",
    updatedAt: "hace 40 días",
    metrics: { exposures: 0, adoption: 0, errors: 0.0 },
    history: [
      { at: "hace 40 días", action: "Flag matada (deprecada)", by: "diego.r" },
      { at: "hace 60 días", action: "Rollout bajado a 0%", by: "diego.r" },
    ],
  },
  {
    id: "f10",
    key: "ab_test_checkout",
    name: "A/B test checkout",
    description: "Test A/B del flujo de checkout con nuevo diseño de confirmación.",
    status: "active",
    rollout: 50,
    targeting: { plans: ["Starter", "Pro", "Enterprise"], countries: [], orgs: [], cohorts: ["test_group_a"], beta: false, environment: "production" },
    dependencies: [],
    createdAt: "2025-04-10",
    updatedAt: "hace 1 día",
    metrics: { exposures: 420, adoption: 51, errors: 0.15 },
    history: [
      { at: "hace 1 día", action: "Rollout ajustado a 50%", by: "lucia.m" },
      { at: "hace 7 días", action: "Flag creada (A/B test)", by: "lucia.m" },
    ],
  },
];

type FlagStatus = FeatureFlag["status"];
type FilterTab = "todas" | "active" | "paused" | "killed" | "beta";

function statusMeta(status: FlagStatus) {
  switch (status) {
    case "active": return { label: "Activa", cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300", dot: "bg-emerald-400" };
    case "paused": return { label: "Pausada", cls: "border-amber-400/40 bg-amber-400/10 text-amber-300", dot: "bg-amber-400" };
    case "killed": return { label: "Killed", cls: "border-rose-400/50 bg-rose-400/10 text-rose-300", dot: "bg-rose-400" };
  }
}

function fmtExposures(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return `${n}`;
}

/* ---------------- Rollout bar (editable) ---------------- */
function RolloutBar({ value, onCommit, disabled }: { value: number; onCommit: (v: number) => void; disabled?: boolean }) {
  const [local, setLocal] = React.useState(value);
  React.useEffect(() => setLocal(value), [value]);
  const tone = local === 0 ? "bg-foreground/30" : local < 50 ? "bg-amber-400" : local < 100 ? "bg-[var(--teal)]" : "bg-emerald-400";
  return (
    <div className="flex items-center gap-2.5">
      <Slider
        value={[local]}
        onValueChange={(v) => setLocal(v[0])}
        onValueCommit={(v) => onCommit(v[0])}
        disabled={disabled}
        aria-label="Rollout percentage"
        className="flex-1"
      />
      <span className={cn(
        "font-mono text-xs w-10 text-right tabular-nums",
        disabled ? "text-muted-foreground" : "rp-gold-text"
      )}>{local}%</span>
      <span className={cn("hidden sm:block h-1.5 w-1.5 rounded-full", tone)} aria-hidden />
    </div>
  );
}

/* ---------------- Targeting chips ---------------- */
function TargetingChips({ flag }: { flag: FeatureFlag }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {flag.targeting.plans.length === 3 ? (
        <span className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-foreground/[0.03] px-1.5 py-0.5 text-[10px] font-mono">
          <Building2 className="h-2.5 w-2.5 text-muted-foreground" aria-hidden />
          todos los planes
        </span>
      ) : flag.targeting.plans.length > 0 ? (
        flag.targeting.plans.map((p) => (
          <span key={p} className="inline-flex items-center gap-1 rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/8 px-1.5 py-0.5 text-[10px] font-mono text-[var(--gold-soft)]">
            <Building2 className="h-2.5 w-2.5" aria-hidden />
            {p}
          </span>
        ))
      ) : null}
      {flag.targeting.countries.map((c) => (
        <span key={c} className="inline-flex items-center gap-1 rounded-md border border-[var(--teal)]/30 bg-[var(--teal)]/8 px-1.5 py-0.5 text-[10px] font-mono text-[var(--teal)]">
          <Globe2 className="h-2.5 w-2.5" aria-hidden />
          {c}
        </span>
      ))}
      {flag.targeting.cohorts.map((c) => (
        <span key={c} className="inline-flex items-center gap-1 rounded-md border border-fuchsia-400/30 bg-fuchsia-400/8 px-1.5 py-0.5 text-[10px] font-mono text-fuchsia-300">
          <Users className="h-2.5 w-2.5" aria-hidden />
          {c}
        </span>
      ))}
      {flag.targeting.orgs.length > 0 && (
        <span className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-foreground/[0.03] px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
          <Building2 className="h-2.5 w-2.5" aria-hidden />
          {flag.targeting.orgs.length} org(s)
        </span>
      )}
      {flag.targeting.beta && (
        <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/40 bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-amber-300">
          <Beaker className="h-2.5 w-2.5" aria-hidden />
          beta
        </span>
      )}
      <span className="inline-flex items-center gap-1 rounded-md border border-border/30 bg-foreground/[0.02] px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
        {flag.targeting.environment === "all" ? "prod+staging" : flag.targeting.environment}
      </span>
    </div>
  );
}

/* ---------------- Metrics row ---------------- */
function MetricsRow({ metrics }: { metrics: FeatureFlag["metrics"] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="rounded-md bg-foreground/[0.03] border border-border/30 px-2 py-1.5">
        <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Exposiciones</div>
        <div className="text-sm font-mono mt-0.5 rp-teal-text">{fmtExposures(metrics.exposures)}</div>
      </div>
      <div className="rounded-md bg-foreground/[0.03] border border-border/30 px-2 py-1.5">
        <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Adopción</div>
        <div className="text-sm font-mono mt-0.5 rp-gold-text">{metrics.adoption}%</div>
      </div>
      <div className="rounded-md bg-foreground/[0.03] border border-border/30 px-2 py-1.5">
        <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Errores</div>
        <div className={cn("text-sm font-mono mt-0.5", metrics.errors > 0.3 ? "text-amber-300" : metrics.errors > 0 ? "text-[var(--teal)]" : "text-emerald-300")}>
          {metrics.errors.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}

/* ---------------- Flag row ---------------- */
function FlagRow({
  flag,
  onEdit, onToggle, onKill, onHistory, onRolloutChange,
}: {
  flag: FeatureFlag;
  onEdit: (f: FeatureFlag) => void;
  onToggle: (f: FeatureFlag) => void;
  onKill: (f: FeatureFlag) => void;
  onHistory: (f: FeatureFlag) => void;
  onRolloutChange: (f: FeatureFlag, rollout: number) => void;
}) {
  const meta = statusMeta(flag.status);
  const isKilled = flag.status === "killed";
  const isPaused = flag.status === "paused";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rp-glass rounded-xl p-4 sm:p-5 grid gap-4",
        isKilled && "opacity-70",
        isPaused && "ring-1 ring-amber-400/20"
      )}
    >
      {/* top: status + key + name */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="relative flex h-2.5 w-2.5 mt-1.5 shrink-0">
            {!isKilled && !isPaused && (
              <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-50", meta.dot)} />
            )}
            <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", meta.dot)} />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <code className="font-mono text-sm text-foreground/95 break-all">{flag.key}</code>
              <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider", meta.cls)}>
                {meta.label}
              </span>
            </div>
            <div className="text-sm font-medium mt-0.5">{flag.name}</div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{flag.description}</p>
          </div>
        </div>
      </div>

      {/* rollout */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Rollout progresivo
          </Label>
          <span className="text-[10px] font-mono text-muted-foreground">actualizado {flag.updatedAt}</span>
        </div>
        <RolloutBar
          value={flag.rollout}
          disabled={isKilled}
          onCommit={(v) => onRolloutChange(flag, v)}
        />
      </div>

      {/* targeting */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Targeting</div>
        <TargetingChips flag={flag} />
      </div>

      {/* metrics */}
      <MetricsRow metrics={flag.metrics} />

      {/* dependencies */}
      {flag.dependencies.length > 0 && (
        <div className="flex items-center gap-2 text-[11px]">
          <AlertOctagon className="h-3.5 w-3.5 text-amber-300 shrink-0" aria-hidden />
          <span className="text-muted-foreground">Depende de:</span>
          {flag.dependencies.map((d) => (
            <code key={d} className="font-mono text-amber-300">{d}</code>
          ))}
        </div>
      )}

      {/* actions */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
        <Button variant="outline" size="sm" className="h-8" onClick={() => onEdit(flag)}>
          <Pencil className="h-3 w-3 mr-1.5" aria-hidden />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          disabled={isKilled}
          onClick={() => onToggle(flag)}
        >
          {isPaused ? <Play className="h-3 w-3 mr-1.5" aria-hidden /> : <Pause className="h-3 w-3 mr-1.5" aria-hidden />}
          {isPaused ? "Activar" : "Pausar"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-rose-400/40 bg-rose-400/8 text-rose-300 hover:bg-rose-400/15 hover:text-rose-200"
          disabled={isKilled}
          onClick={() => onKill(flag)}
        >
          <Skull className="h-3 w-3 mr-1.5" aria-hidden />
          Kill switch
        </Button>
        <Button variant="ghost" size="sm" className="h-8 ml-auto" onClick={() => onHistory(flag)}>
          <History className="h-3 w-3 mr-1.5" aria-hidden />
          Historial
        </Button>
      </div>
    </motion.div>
  );
}

/* ---------------- New/Edit dialog ---------------- */
function FlagFormDialog({
  open, onOpenChange, flag, onSave,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  flag: FeatureFlag | null; onSave: (f: FeatureFlag) => void;
}) {
  const { toast } = useToast();
  const isEdit = !!flag;
  const [key, setKey] = React.useState("");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [rollout, setRollout] = React.useState(25);
  const [plans, setPlans] = React.useState<string[]>(["Starter", "Pro", "Enterprise"]);
  const [beta, setBeta] = React.useState(false);
  const [environment, setEnvironment] = React.useState<"production" | "staging" | "all">("production");

  React.useEffect(() => {
    if (flag) {
      setKey(flag.key); setName(flag.name); setDescription(flag.description);
      setRollout(flag.rollout); setPlans(flag.targeting.plans);
      setBeta(flag.targeting.beta); setEnvironment(flag.targeting.environment);
    } else {
      setKey(""); setName(""); setDescription(""); setRollout(25);
      setPlans(["Starter", "Pro", "Enterprise"]); setBeta(false); setEnvironment("production");
    }
  }, [flag, open]);

  const togglePlan = (p: string) => {
    setPlans((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  const handleSave = () => {
    if (!key.trim() || !name.trim()) {
      toast({ title: "Campos requeridos", description: "Key y nombre son obligatorios", variant: "destructive" });
      return;
    }
    const base = (flag
      ? { ...flag }
      : {
          id: `f${Date.now()}`,
          createdAt: new Date().toISOString().slice(0, 10),
          updatedAt: "ahora",
          status: "paused" as const,
          dependencies: [] as string[],
          metrics: { exposures: 0, adoption: 0, errors: 0 },
          history: [{ at: "ahora", action: "Flag creada", by: "lucia.m" }],
          targeting: { plans: [] as string[], countries: [] as string[], orgs: [] as string[], cohorts: [] as string[], beta: false, environment: "production" as const },
        }) as FeatureFlag;
    onSave({
      ...base,
      key: key.trim(),
      name: name.trim(),
      description: description.trim(),
      rollout,
      targeting: { ...base.targeting, plans, beta, environment },
      updatedAt: "ahora",
      history: [{ at: "ahora", action: isEdit ? "Flag editada" : "Flag creada", by: "lucia.m" }, ...base.history],
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card/95 backdrop-blur-xl border-border/60">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-4 w-4 rp-gold-text" aria-hidden />
            {isEdit ? "Editar flag" : "Nueva flag"}
            
          </DialogTitle>
          <DialogDescription>
            Configura la flag y su rollout progresivo. Los cambios se aplican inmediatamente (demo).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto rp-scroll-thin pr-1">
          <div className="space-y-1.5">
            <Label htmlFor="ff-key">Key (identificador)</Label>
            <Input id="ff-key" value={key} onChange={(e) => setKey(e.target.value)} placeholder="new_flag_key" className="font-mono" disabled={isEdit} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ff-name">Nombre</Label>
            <Input id="ff-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre descriptivo" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ff-desc">Descripción</Label>
            <Textarea id="ff-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="¿Qué hace esta flag?" rows={2} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Rollout inicial</Label>
              <span className="font-mono text-sm rp-gold-text">{rollout}%</span>
            </div>
            <Slider value={[rollout]} onValueChange={(v) => setRollout(v[0])} />
          </div>
          <div className="space-y-2">
            <Label>Planes objetivo</Label>
            <div className="flex flex-wrap gap-1.5">
              {["Starter", "Pro", "Enterprise"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlan(p)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs font-mono transition-colors",
                    plans.includes(p)
                      ? "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]"
                      : "border-border/40 bg-foreground/[0.02] text-muted-foreground hover:bg-foreground/[0.05]"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="ff-beta" className="flex items-center gap-1.5">
              <Beaker className="h-3.5 w-3.5 text-amber-300" aria-hidden />
              Marcar como beta
            </Label>
            <Switch id="ff-beta" checked={beta} onCheckedChange={setBeta} />
          </div>
          <div className="space-y-2">
            <Label>Entorno</Label>
            <div className="flex flex-wrap gap-1.5">
              {(["production", "staging", "all"] as const).map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEnvironment(e)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs font-mono transition-colors",
                    environment === e
                      ? "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]"
                      : "border-border/40 bg-foreground/[0.02] text-muted-foreground hover:bg-foreground/[0.05]"
                  )}
                >
                  {e === "all" ? "prod+staging" : e}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} className="bg-amber-500/90 hover:bg-amber-500 text-amber-950">
            {isEdit ? "Guardar cambios" : "Crear flag"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- History dialog ---------------- */
function HistoryDialog({ flag, open, onOpenChange }: {
  flag: FeatureFlag | null; open: boolean; onOpenChange: (v: boolean) => void;
}) {
  if (!flag) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-border/60">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-4 w-4 rp-gold-text" aria-hidden />
            Historial · <code className="font-mono text-sm">{flag.key}</code>
            
          </DialogTitle>
          <DialogDescription>
            Línea de tiempo de cambios · creada el {flag.createdAt}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-0 max-h-[60vh] overflow-y-auto rp-scroll-thin">
          <ol className="relative border-l border-border/40 ml-2">
            {flag.history.map((h, i) => (
              <li key={i} className="ml-4 pb-4 last:pb-0">
                <span className={cn(
                  "absolute -left-[7px] mt-1 h-3 w-3 rounded-full border-2 border-background",
                  i === 0 ? "bg-[var(--gold)]" : "bg-foreground/30"
                )} />
                <div className="text-sm text-foreground/90">{h.action}</div>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono text-muted-foreground">
                  <Clock className="h-3 w-3" aria-hidden />
                  {h.at} · por {h.by}
                </div>
              </li>
            ))}
          </ol>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Clock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

/* ---------------- Kill confirm dialog ---------------- */
function KillConfirmDialog({ flag, open, onOpenChange, onConfirm }: {
  flag: FeatureFlag | null; open: boolean; onOpenChange: (v: boolean) => void; onConfirm: () => void;
}) {
  if (!flag) return null;
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-rose-400/40">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-rose-300">
            <Skull className="h-5 w-5" aria-hidden />
            ¿Matar flag?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esto desactivará <code className="font-mono text-foreground">{flag.key}</code> inmediatamente
            para todos los usuarios. La acción es instantánea y no se puede deshacer sin re-activar la flag manualmente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="rounded-md border border-rose-400/30 bg-rose-400/5 p-3 text-xs text-rose-200/90 flex items-start gap-2">
          <AlertOctagon className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden />
          <div>
            <strong className="font-medium">Impacto estimado:</strong> {fmtExposures(flag.metrics.exposures)} exposiciones/día
            se verán afectadas. Considera pausar antes de matar si quieres conservar rollback.
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border/60">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-rose-500 hover:bg-rose-600 text-white border-rose-500"
          >
            <Skull className="h-3.5 w-3.5 mr-1.5" aria-hidden />
            Matar flag ahora
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ---------------- Main export ---------------- */
export function CcFeatureFlags() {
  const { toast } = useToast();
  const [flags, setFlags] = React.useState<FeatureFlag[]>(INITIAL_FLAGS);
  const [tab, setTab] = React.useState<FilterTab>("todas");

  // dialogs
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<FeatureFlag | null>(null);
  const [historyFlag, setHistoryFlag] = React.useState<FeatureFlag | null>(null);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [killFlag, setKillFlag] = React.useState<FeatureFlag | null>(null);
  const [killOpen, setKillOpen] = React.useState(false);

  const counts = React.useMemo(() => ({
    active: flags.filter((f) => f.status === "active").length,
    paused: flags.filter((f) => f.status === "paused").length,
    killed: flags.filter((f) => f.status === "killed").length,
    beta: flags.filter((f) => f.targeting.beta).length,
  }), [flags]);

  const filtered = React.useMemo(() => {
    if (tab === "todas") return flags;
    if (tab === "beta") return flags.filter((f) => f.targeting.beta);
    return flags.filter((f) => f.status === tab);
  }, [flags, tab]);

  const handleSave = (f: FeatureFlag) => {
    setFlags((prev) => {
      const idx = prev.findIndex((x) => x.id === f.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = f;
        return copy;
      }
      return [f, ...prev];
    });
    toast({
      title: editing ? "Flag actualizada" : "Flag creada",
      description: <code className="font-mono text-xs">{f.key}</code>,
    });
  };

  const handleToggle = (f: FeatureFlag) => {
    const newStatus: FlagStatus = f.status === "active" ? "paused" : "active";
    setFlags((prev) => prev.map((x) => x.id === f.id ? {
      ...x,
      status: newStatus,
      updatedAt: "ahora",
      history: [{ at: "ahora", action: newStatus === "paused" ? "Flag pausada" : "Flag activada", by: "lucia.m" }, ...x.history],
    } : x));
    toast({
      title: newStatus === "paused" ? "Flag pausada" : "Flag activada",
      description: `${f.key} · ${newStatus === "paused" ? "expone a 0% de usuarios" : "reanuda exposición"}`,
    });
  };

  const handleKill = () => {
    if (!killFlag) return;
    const k = killFlag;
    setFlags((prev) => prev.map((x) => x.id === k.id ? {
      ...x,
      status: "killed",
      rollout: 0,
      updatedAt: "ahora",
      history: [{ at: "ahora", action: "Flag matada (kill switch)", by: "lucia.m" }, ...x.history],
    } : x));
    setKillOpen(false);
    setKillFlag(null);
    toast({
      title: "Flag matada",
      description: <code className="font-mono text-xs">{k.key}</code>,
      variant: "destructive",
    });
  };

  const openEdit = (f: FeatureFlag) => { setEditing(f); setFormOpen(true); };
  const openNew = () => { setEditing(null); setFormOpen(true); };
  const openHistory = (f: FeatureFlag) => { setHistoryFlag(f); setHistoryOpen(true); };
  const openKill = (f: FeatureFlag) => { setKillFlag(f); setKillOpen(true); };

  const handleRolloutChange = (f: FeatureFlag, rollout: number) => {
    if (rollout === f.rollout) return;
    setFlags((prev) => prev.map((x) => x.id === f.id ? {
      ...x,
      rollout,
      updatedAt: "ahora",
      history: [{ at: "ahora", action: `Rollout ajustado a ${rollout}%`, by: "lucia.m" }, ...x.history],
    } : x));
    toast({
      title: "Rollout actualizado",
      description: <code className="font-mono text-xs">{f.key}</code>,
    });
  };

  return (
    <section aria-label="Feature flags" className="space-y-4">
      {/* Header */}
      <div className="rp-glass-strong rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-xl bg-[var(--gold)]/10 border border-[var(--gold)]/25 text-[var(--gold)] flex items-center justify-center shrink-0">
              <Flag className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg sm:text-xl font-medium tracking-tight">Feature Flags</h3>
                
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Rollout progresivo con kill switch · gestión por targeting
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="¿Qué es rollout progresivo?">
                    <Info className="h-4 w-4 text-muted-foreground" aria-hidden />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-xs leading-relaxed">
                    <strong className="rp-gold-text">Rollout progresivo:</strong> exponer una feature a un porcentaje
                    creciente de usuarios (1% → 10% → 50% → 100%) monitorizando errores y adopción antes de avanzar.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button onClick={openNew} size="sm" className="h-9 bg-amber-500/90 hover:bg-amber-500 text-amber-950">
              <Plus className="h-4 w-4 mr-1.5" aria-hidden />
              Nueva flag
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="rounded-lg border border-border/40 bg-foreground/[0.03] px-3 py-2.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Activas</div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-display text-2xl font-light text-emerald-300">{counts.active}</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
            </div>
          </div>
          <div className="rounded-lg border border-border/40 bg-foreground/[0.03] px-3 py-2.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Pausadas</div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-display text-2xl font-light text-amber-300">{counts.paused}</span>
              <Pause className="h-3.5 w-3.5 text-amber-400" aria-hidden />
            </div>
          </div>
          <div className="rounded-lg border border-border/40 bg-foreground/[0.03] px-3 py-2.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Killed</div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-display text-2xl font-light text-rose-300">{counts.killed}</span>
              <Skull className="h-3.5 w-3.5 text-rose-400" aria-hidden />
            </div>
          </div>
          <div className="rounded-lg border border-border/40 bg-foreground/[0.03] px-3 py-2.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">En beta</div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-display text-2xl font-light rp-gold-text">{counts.beta}</span>
              <Beaker className="h-3.5 w-3.5 rp-gold-text" aria-hidden />
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as FilterTab)}>
        <TabsList className="bg-foreground/[0.04] border border-border/40 h-9">
          <TabsTrigger value="todas" className="text-xs">Todas ({flags.length})</TabsTrigger>
          <TabsTrigger value="active" className="text-xs">Activas ({counts.active})</TabsTrigger>
          <TabsTrigger value="paused" className="text-xs">Pausadas ({counts.paused})</TabsTrigger>
          <TabsTrigger value="killed" className="text-xs">Killed ({counts.killed})</TabsTrigger>
          <TabsTrigger value="beta" className="text-xs">Beta ({counts.beta})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Flags list */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((f) => (
            <FlagRow
              key={f.id}
              flag={f}
              onEdit={openEdit}
              onToggle={handleToggle}
              onKill={openKill}
              onHistory={openHistory}
              onRolloutChange={handleRolloutChange}
            />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="rp-glass rounded-xl p-8 text-center text-sm text-muted-foreground">
          <XCircle className="h-6 w-6 mx-auto mb-2 opacity-50" aria-hidden />
          No hay flags en este filtro.
        </div>
      )}

      {/* Footer */}
      <div className="text-[11px] font-mono text-muted-foreground text-center pt-2 flex items-center justify-center gap-2">
        <Sparkles className="h-3 w-3" aria-hidden />
        Feature flags demo · cambios locales (no persisten) · datos simulados
      </div>

      {/* Dialogs */}
      <FlagFormDialog open={formOpen} onOpenChange={setFormOpen} flag={editing} onSave={handleSave} />
      <HistoryDialog flag={historyFlag} open={historyOpen} onOpenChange={setHistoryOpen} />
      <KillConfirmDialog flag={killFlag} open={killOpen} onOpenChange={setKillOpen} onConfirm={handleKill} />
    </section>
  );
}
