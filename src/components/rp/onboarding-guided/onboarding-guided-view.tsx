"use client";

/* =========================================================
 * RestoPanel · Onboarding guiado
 * ---------------------------------------------------------
 * Fase 7 · Onboarding operativo en 15 minutos
 * Checklist persistente de 13 pasos, plantillas por tipo de
 * local, import CSV de carta, galería de empty states y
 * persistencia local ("Guardado automáticamente").
 * =======================================================*/

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Check, CheckCircle2, Circle, CircleDot, Loader2, Sparkles,
  LayoutGrid, Map as MapIcon, BookOpen, Users, Printer, CreditCard,
  Smartphone, QrCode, CalendarCheck, Clock, Percent, Heart, Brain,
  RotateCcw, Upload, FileSpreadsheet, Coffee, Wine,
  UtensilsCrossed, Pizza, Fish, Play, SkipForward,
  Save, ShieldCheck, Layers, Info, PlusCircle,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/

type StepStatus = "done" | "in_progress" | "pending";

interface OnboardingStep {
  id: number;
  key: string;
  label: string;
  icon: React.ElementType;
  what: string;
  why: string;
  est: string;
}

type PlantillaTipo =
  | "restaurante"
  | "cafeteria"
  | "bar"
  | "pizzeria"
  | "sushi";

interface PlantillaDef {
  id: PlantillaTipo;
  label: string;
  icon: React.ElementType;
  includes: { carta: number; zonas: number; horarios: string; platosTop: string[] };
}

interface CsvPreviewRow {
  categoria: string;
  nombre: string;
  precio: number;
  iva: number;
}

interface EmptyStateCard {
  id: string;
  title: string;
  message: string;
  icon: React.ElementType;
  accent: "gold" | "teal" | "violet" | "rose" | "emerald" | "amber";
}

/* =========================================================
 * Constants — 13 steps checklist
 * =======================================================*/

const STEPS: OnboardingStep[] = [
  {
    id: 1, key: "mesas", label: "Mesas", icon: LayoutGrid,
    what: "Configura tu plano de sala: número de mesas, capacidad y numeración.",
    why: "Sin mesas no se pueden abrir tickets ni asignar comensales.",
    est: "1 min",
  },
  {
    id: 2, key: "zonas", label: "Zonas", icon: MapIcon,
    what: "Divide tu local en zonas (terraza, salón interior, barra, privado).",
    why: "Las zonas organizan el servicio y activan informes por área.",
    est: "1 min",
  },
  {
    id: 3, key: "carta", label: "Carta", icon: BookOpen,
    what: "Configura tu carta: los platos que tus clientes verán en el QR y tu equipo en el TPV.",
    why: "Sin carta no se puede cobrar ni comandar.",
    est: "3 min",
  },
  {
    id: 4, key: "empleados", label: "Empleados", icon: Users,
    what: "Invita a tu equipo con email, rol y PIN de fichaje.",
    why: "Sin empleados no hay fichaje, cuadrante ni permisos por persona.",
    est: "2 min",
  },
  {
    id: 5, key: "impresoras", label: "Impresoras", icon: Printer,
    what: "Conecta impresoras de cocina, barra y caja vía QR pairing.",
    why: "Sin impresoras los pedidos no llegan a las estaciones.",
    est: "2 min",
  },
  {
    id: 6, key: "tpv", label: "TPV", icon: CreditCard,
    what: "Empareja tu terminal TPV con la app y verifica cobros.",
    why: "El TPV es el corazón de la caja y la trazabilidad fiscal.",
    est: "1 min",
  },
  {
    id: 7, key: "pda", label: "PDA", icon: Smartphone,
    what: "Configura PDAs para comanda en sala desde móvil.",
    why: "Las PDAs eliminan papeles y aceleran el servicio.",
    est: "1 min",
  },
  {
    id: 8, key: "qr", label: "QR", icon: QrCode,
    what: "Activa el QR por mesa para carta digital y auto-pedido.",
    why: "El QR libera carga de sala y abre canal de reserva y reseña.",
    est: "1 min",
  },
  {
    id: 9, key: "reservas", label: "Reservas", icon: CalendarCheck,
    what: "Activa el widget de reservas en tu web y Google Business.",
    why: "Las reservas reducen no-show y anticipan la planificación de cocina.",
    est: "1 min",
  },
  {
    id: 10, key: "horarios", label: "Horarios", icon: Clock,
    what: "Define horarios de apertura, cocina y turnos de servicio.",
    why: "Los horarios controlan cuando se aceptan pedidos y reservas.",
    est: "1 min",
  },
  {
    id: 11, key: "impuestos", label: "Impuestos", icon: Percent,
    what: "Configura IVA 10% / 21% y recargo de equivalencia si aplica.",
    why: "Sin impuestos correctos el cierre de caja y los tickets son ilegales.",
    est: "1 min",
  },
  {
    id: 12, key: "fidelizacion", label: "Fidelización", icon: Heart,
    what: "Activa el programa de sellos, puntos o cashback.",
    why: "La fidelización aumenta recurrencia y ticket medio.",
    est: "2 min",
  },
  {
    id: 13, key: "ia", label: "IA", icon: Brain,
    what: "Conecta la IA: copilot, predicción de demanda y sugerencias de carta.",
    why: "La IA automatiza decisiones operativas y de marketing.",
    est: "1 min",
  },
];

const PLANTILLAS: PlantillaDef[] = [
  {
    id: "restaurante", label: "Restaurante", icon: UtensilsCrossed,
    includes: { carta: 48, zonas: 3, horarios: "13–16h · 20–23:30h", platosTop: ["Menú degustación", "Ración ibéricos", "Pescado del día"] },
  },
  {
    id: "cafeteria", label: "Cafetería", icon: Coffee,
    includes: { carta: 32, zonas: 2, horarios: "7–20h ininterrumpido", platosTop: ["Café especialidad", "Tostada avo-huevo", "Croissant mantequilla"] },
  },
  {
    id: "bar", label: "Bar", icon: Wine,
    includes: { carta: 26, zonas: 2, horarios: "12–01h · vie-sáb hasta 02:30h", platosTop: ["Gin-tonic premium", "Tabla quesos", "Croquetas artesanas"] },
  },
  {
    id: "pizzeria", label: "Pizzería", icon: Pizza,
    includes: { carta: 22, zonas: 2, horarios: "13–15:30h · 19:30–23h", platosTop: ["Margherita DOP", "Diavola", "Tiramisú"] },
  },
  {
    id: "sushi", label: "Sushi", icon: Fish,
    includes: { carta: 38, zonas: 2, horarios: "13–15:30h · 20–23:30h", platosTop: ["Combo 18 piezas", "Nigiri toro", "Tartar de atún"] },
  },
];

const CSV_PREVIEW: CsvPreviewRow[] = [
  { categoria: "Entrantes", nombre: "Croquetas jamón (6 uds)", precio: 8.5, iva: 10 },
  { categoria: "Entrantes", nombre: "Ensaladilla rusa", precio: 7.0, iva: 10 },
  { categoria: "Entrantes", nombre: "Patatas bravas", precio: 7.5, iva: 10 },
  { categoria: "Principales", nombre: "Hamburguesa clásica", precio: 14.0, iva: 10 },
  { categoria: "Principales", nombre: "Risotto funghi", precio: 15.5, iva: 10 },
  { categoria: "Principales", nombre: "Pescado del día", precio: 22.0, iva: 10 },
  { categoria: "Postres", nombre: "Tiramisú", precio: 6.0, iva: 10 },
  { categoria: "Postres", nombre: "Tarta de queso", precio: 6.5, iva: 10 },
  { categoria: "Bebidas", nombre: "Vino tinto copa", precio: 4.5, iva: 21 },
  { categoria: "Bebidas", nombre: "Cerveza artesana", precio: 4.0, iva: 21 },
];

const EMPTY_STATES: EmptyStateCard[] = [
  { id: "e1", title: "Sin mesas", message: "Crea tu primera mesa", icon: LayoutGrid, accent: "gold" },
  { id: "e2", title: "Sin carta", message: "Añade tu primer plato", icon: BookOpen, accent: "teal" },
  { id: "e3", title: "Sin empleados", message: "Invita a tu equipo", icon: Users, accent: "violet" },
  { id: "e4", title: "Sin reservas", message: "Activa tu widget de reservas", icon: CalendarCheck, accent: "rose" },
  { id: "e5", title: "Sin reseñas", message: "Conecta Google Business", icon: Sparkles, accent: "emerald" },
  { id: "e6", title: "Sin automatizaciones", message: "Activa tu primera automatización", icon: Brain, accent: "amber" },
];

const ACCENT_META: Record<EmptyStateCard["accent"], { bg: string; text: string; border: string }> = {
  gold: { bg: "bg-[var(--gold)]/12", text: "text-[var(--gold-soft)]", border: "border-[var(--gold)]/40" },
  teal: { bg: "bg-[var(--teal)]/12", text: "text-[var(--teal)]", border: "border-[var(--teal)]/40" },
  violet: { bg: "bg-violet-500/12", text: "text-violet-300", border: "border-violet-500/40" },
  rose: { bg: "bg-rose-500/12", text: "text-rose-300", border: "border-rose-500/40" },
  emerald: { bg: "bg-emerald-500/12", text: "text-emerald-300", border: "border-emerald-500/40" },
  amber: { bg: "bg-amber-500/12", text: "text-amber-300", border: "border-amber-500/40" },
};

/* =========================================================
 * Persistence (localStorage)
 * =======================================================*/

const STORAGE_KEY = "rp_onboarding_guided_v1";

interface PersistedState {
  done: number[];          // step ids marked done
  current: number;         // active step id (1..13)
  skipped: number[];       // step ids skipped
  appliedPlantilla: PlantillaTipo | null;
  csvImportedFile: string | null;
}

function loadState(): PersistedState {
  if (typeof window === "undefined") {
    return { done: [1, 2], current: 3, skipped: [], appliedPlantilla: null, csvImportedFile: null };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { done: [1, 2], current: 3, skipped: [], appliedPlantilla: null, csvImportedFile: null };
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      done: Array.isArray(parsed.done) ? parsed.done : [1, 2],
      current: typeof parsed.current === "number" ? parsed.current : 3,
      skipped: Array.isArray(parsed.skipped) ? parsed.skipped : [],
      appliedPlantilla: parsed.appliedPlantilla ?? null,
      csvImportedFile: parsed.csvImportedFile ?? null,
    };
  } catch {
    return { done: [1, 2], current: 3, skipped: [], appliedPlantilla: null, csvImportedFile: null };
  }
}

function saveState(s: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore quota errors */
  }
}

/* =========================================================
 * Shared atoms
 * =======================================================*/



function SectionCard({
  title, desc, icon: Icon, action, children, className,
}: {
  title: string; desc?: string; icon: React.ElementType;
  action?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={cn("rp-glass rounded-2xl overflow-hidden flex flex-col min-w-0", className)}>
      <div className="flex items-center justify-between gap-3 p-4 border-b border-border/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-foreground/[0.05] text-[var(--gold)] shrink-0">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-base sm:text-lg leading-tight truncate">{title}</h2>
            {desc && <p className="text-[11px] text-muted-foreground truncate">{desc}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-4 flex-1 min-w-0">{children}</div>
    </section>
  );
}

/* =========================================================
 * Progress bar
 * =======================================================*/

function ProgressBar({ done, total }: { done: number; total: number }) {
  const reduce = useReducedMotion();
  const pct = Math.round((done / total) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          <strong className="text-[var(--gold-soft)] font-display text-sm">{done}</strong> de {total} completados
        </span>
        <span className="text-xs text-muted-foreground">
          <strong className="text-[var(--gold-soft)] font-display text-sm">{pct}%</strong>
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-foreground/[0.06] border border-border/40">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-soft)]"
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/* =========================================================
 * Step status helper
 * =======================================================*/

function getStepStatus(stepId: number, state: PersistedState): StepStatus {
  if (state.done.includes(stepId)) return "done";
  if (stepId === state.current) return "in_progress";
  return "pending";
}

/* =========================================================
 * Checklist (left column, persistent)
 * =======================================================*/

function ChecklistPanel({
  state, onStepClick, onReset,
}: {
  state: PersistedState;
  onStepClick: (id: number) => void;
  onReset: () => void;
}) {
  const done = state.done.length;
  return (
    <SectionCard
      title="Checklist de onboarding"
      desc="13 pasos · operativo en 15 min"
      icon={CheckCircle2}
      action={
        <Button variant="ghost" size="sm" onClick={onReset} className="h-8 text-[11px] text-muted-foreground hover:text-foreground">
          <RotateCcw className="size-3.5 mr-1" /> Reiniciar
        </Button>
      }
      className="lg:sticky lg:top-6"
    >
      <div className="space-y-4">
        <ProgressBar done={done} total={STEPS.length} />

        <div className="rounded-lg border border-border/40 bg-foreground/[0.02] p-2.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          <Save className="size-3.5 text-[var(--teal)] shrink-0" />
          <span className="leading-snug">Guardado automáticamente · Reanuda donde lo dejaste</span>
        </div>

        <ol className="space-y-1.5 max-h-[460px] overflow-y-auto rp-scroll-thin pr-1">
          {STEPS.map((step) => {
            const status = getStepStatus(step.id, state);
            const isSkipped = state.skipped.includes(step.id);
            const Icon = step.icon;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => onStepClick(step.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 rounded-lg p-2 text-left transition-colors border",
                    status === "in_progress"
                      ? "bg-[var(--gold)]/10 border-[var(--gold)]/40"
                      : status === "done"
                        ? "bg-emerald-500/[0.04] border-transparent hover:bg-foreground/[0.04]"
                        : "bg-transparent border-transparent hover:bg-foreground/[0.04]"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-7 place-items-center rounded-full shrink-0 border",
                      status === "done"
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                        : status === "in_progress"
                          ? "bg-[var(--gold)]/15 border-[var(--gold)]/40 text-[var(--gold-soft)]"
                          : "bg-foreground/[0.04] border-border/40 text-muted-foreground"
                    )}
                  >
                    {status === "done" ? (
                      <Check className="size-3.5" />
                    ) : status === "in_progress" ? (
                      <CircleDot className="size-3.5 animate-pulse" />
                    ) : (
                      <Circle className="size-3.5" />
                    )}
                  </span>
                  <Icon
                    className={cn(
                      "size-3.5 shrink-0",
                      status === "done"
                        ? "text-emerald-300"
                        : status === "in_progress"
                          ? "text-[var(--gold-soft)]"
                          : "text-muted-foreground"
                    )}
                  />
                  <span className="flex-1 min-w-0">
                    <span
                      className={cn(
                        "text-sm leading-tight block truncate",
                        status === "done"
                          ? "line-through text-muted-foreground"
                          : isSkipped
                            ? "text-muted-foreground italic"
                            : "text-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground/70 font-mono">
                      Paso {step.id} · ~{step.est}
                    </span>
                  </span>
                  {status === "in_progress" && (
                    <Badge variant="outline" className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] text-[9px] px-1.5 py-0">
                      En progreso
                    </Badge>
                  )}
                  {isSkipped && (
                    <Badge variant="outline" className="border-border/40 text-muted-foreground text-[9px] px-1.5 py-0">
                      Saltado
                    </Badge>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </SectionCard>
  );
}

/* =========================================================
 * Current step card
 * =======================================================*/

function CurrentStepCard({
  state, onConfigure, onSkip, onMarkDone,
}: {
  state: PersistedState;
  onConfigure: () => void;
  onSkip: () => void;
  onMarkDone: () => void;
}) {
  const reduce = useReducedMotion();
  const step = STEPS.find((s) => s.id === state.current) ?? STEPS[0];
  const Icon = step.icon;

  return (
    <SectionCard
      title="Paso actual"
      desc={`Paso ${step.id} de ${STEPS.length}`}
      icon={Play}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-start gap-3">
            <div className="grid size-12 place-items-center rounded-xl bg-[var(--gold)]/12 border border-[var(--gold)]/40 text-[var(--gold-soft)] shrink-0">
              <Icon className="size-6" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-xl leading-tight">{step.label}</h3>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                ~{step.est} · paso {step.id} / {STEPS.length}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-border/40 bg-foreground/[0.02] p-3">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-mono mb-1">
                <Info className="size-3" /> Qué es
              </div>
              <p className="text-sm leading-snug">{step.what}</p>
            </div>
            <div className="rounded-lg border border-[var(--teal)]/30 bg-[var(--teal)]/[0.06] p-3">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--teal)] font-mono mb-1">
                <Sparkles className="size-3" /> Por qué importa
              </div>
              <p className="text-sm leading-snug text-foreground">{step.why}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              onClick={onConfigure}
              className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] h-10"
            >
              <Play className="size-4 mr-1.5" />
              Configurar ahora
            </Button>
            <Button
              variant="outline"
              onClick={onSkip}
              className="h-10"
            >
              <SkipForward className="size-4 mr-1.5" />
              Saltar por ahora
            </Button>
            <Button
              variant="ghost"
              onClick={onMarkDone}
              className="h-10 text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10"
            >
              <Check className="size-4 mr-1.5" />
              Marcar hecho
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </SectionCard>
  );
}

/* =========================================================
 * Step configure dialog (mock)
 * =======================================================*/

function StepConfigDialog({
  open, onOpenChange, step,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  step: OnboardingStep | null;
}) {
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setSaving(false);
    }
  }, [open]);

  function handleSave() {
    if (!step) return;
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      onOpenChange(false);
      toast({
        title: "Paso guardado",
        description: `${step.label} configurado correctamente.`,
      });
    }, 700);
  }

  if (!step) return null;
  const Icon = step.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rp-glass-strong border-border/60 max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-[var(--gold)]/12 border border-[var(--gold)]/40 text-[var(--gold-soft)]">
              <Icon className="size-4" />
            </div>
            Configurar · {step.label}
          </DialogTitle>
          <DialogDescription>{step.what}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="rounded-md border border-border/40 bg-foreground/[0.02] p-3 text-xs">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Mock setup</span>
            <p className="mt-1 leading-snug">
              Esta es una vista demo del asistente de {step.label.toLowerCase()}. En el producto real aquí
              cargaría el editor correspondiente ({step.key}) con guardado en vivo.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px] text-muted-foreground">Nombre</Label>
              <Input placeholder={`Mi ${step.label.toLowerCase()}`} className="mt-1 h-9" />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">Configuración rápida</Label>
              <Select defaultValue="auto">
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue placeholder="Elige…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Automático (recomendado)</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="import">Importar existente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-md border border-[var(--teal)]/30 bg-[var(--teal)]/[0.06] p-2.5 text-[11px] text-[var(--teal)] flex items-start gap-1.5">
            <ShieldCheck className="size-3.5 shrink-0 mt-0.5" />
            <span>Todas las acciones son reversibles. Nada se publica sin tu confirmación.</span>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cancelar</Button>
          </DialogClose>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
          >
            {saving ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : <Check className="size-3.5 mr-1.5" />}
            {saving ? "Guardando…" : "Guardar y continuar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Plantillas por tipo
 * =======================================================*/

function PlantillasCard({
  applied, onApply,
}: {
  applied: PlantillaTipo | null;
  onApply: (id: PlantillaTipo) => void;
}) {
  const [selected, setSelected] = React.useState<PlantillaTipo>(applied ?? "restaurante");
  const tpl = PLANTILLAS.find((p) => p.id === selected)!;
  const Icon = tpl.icon;

  return (
    <SectionCard
      title="Plantillas por tipo de local"
      desc="Precarga carta, zonas y horarios típicos"
      icon={Layers}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PLANTILLAS.map((p) => {
            const PI = p.icon;
            const active = selected === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all",
                  active
                    ? "bg-[var(--gold)]/10 border-[var(--gold)]/50 text-[var(--gold-soft)]"
                    : "bg-foreground/[0.02] border-border/40 hover:bg-foreground/[0.05] text-muted-foreground"
                )}
              >
                <PI className={cn("size-5", active && "text-[var(--gold-soft)]")} />
                <span className="text-xs font-medium leading-tight">{p.label}</span>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-border/40 bg-foreground/[0.02] p-3">
          <div className="flex items-center gap-2 mb-2">
            <Icon className="size-4 text-[var(--gold-soft)]" />
            <span className="text-sm font-medium">{tpl.label}</span>
            <Badge variant="outline" className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] text-[9px] ml-auto">
              Incluido
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md bg-foreground/[0.03] p-2">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Platos</div>
              <div className="font-display text-lg text-[var(--gold-soft)]">{tpl.includes.carta}</div>
            </div>
            <div className="rounded-md bg-foreground/[0.03] p-2">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Zonas</div>
              <div className="font-display text-lg text-[var(--gold-soft)]">{tpl.includes.zonas}</div>
            </div>
            <div className="rounded-md bg-foreground/[0.03] p-2">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Horario</div>
              <div className="font-mono text-[10px] text-foreground leading-tight pt-1.5">
                {tpl.includes.horarios.split(" · ")[0]}
              </div>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Platos top</div>
            <div className="flex flex-wrap gap-1.5">
              {tpl.includes.platosTop.map((pl) => (
                <Badge key={pl} variant="outline" className="border-border/50 text-[10px] text-muted-foreground">
                  {pl}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={() => onApply(selected)}
          className="w-full bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] h-10"
        >
          <Sparkles className="size-4 mr-1.5" />
          Aplicar plantilla «{tpl.label}»
        </Button>
        {applied && (
          <p className="text-[11px] text-[var(--teal)] text-center">
            <CheckCircle2 className="size-3 inline mr-1" />
            Plantilla «{PLANTILLAS.find((p) => p.id === applied)?.label}» aplicada previamente.
          </p>
        )}
      </div>
    </SectionCard>
  );
}

/* =========================================================
 * CSV import card
 * =======================================================*/

function CsvImportCard({
  fileName, onImport,
}: {
  fileName: string | null;
  onImport: (name: string) => void;
}) {
  const { toast } = useToast();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<CsvPreviewRow[] | null>(fileName ? CSV_PREVIEW : null);

  function handleClick() {
    inputRef.current?.click();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onImport(file.name);
    setPreview(CSV_PREVIEW);
    toast({
      title: "Carta importada",
      description: `${file.name} · ${CSV_PREVIEW.length} platos detectados.`,
    });
    // reset input so same file can be re-selected
    e.target.value = "";
  }

  return (
    <SectionCard
      title="Importar carta desde CSV"
      desc="Formato: categoría, nombre, precio, iva"
      icon={FileSpreadsheet}
      action={
        fileName && (
          <Badge variant="outline" className="border-emerald-400/40 bg-emerald-400/10 text-emerald-300 text-[10px]">
            <Check className="size-3 mr-1" /> {fileName}
          </Badge>
        )
      }
    >
      <div className="space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,text/csv"
          className="hidden"
          onChange={handleFile}
        />
        <button
          type="button"
          onClick={handleClick}
          className="w-full rounded-xl border-2 border-dashed border-border/60 hover:border-[var(--gold)]/50 hover:bg-[var(--gold)]/[0.04] transition-colors p-6 flex flex-col items-center gap-2 text-center"
        >
          <div className="grid size-10 place-items-center rounded-full bg-foreground/[0.04] text-[var(--gold-soft)]">
            <Upload className="size-5" />
          </div>
          <span className="text-sm font-medium">Arrastra tu CSV o haz clic para subir</span>
          <span className="text-[11px] text-muted-foreground">
            Acepta .csv y .xlsx · máx 5 MB
          </span>
        </button>

        {preview && (
          <div className="rounded-xl border border-border/40 overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-3 py-2 bg-foreground/[0.03] border-b border-border/40">
              <div className="flex items-center gap-1.5">
                <FileSpreadsheet className="size-3.5 text-[var(--teal)]" />
                <span className="text-xs font-medium">Vista previa</span>
              </div>
              <Badge variant="outline" className="border-border/50 text-[10px] text-muted-foreground">
                {preview.length} filas
              </Badge>
            </div>
            <div className="overflow-x-auto rp-scroll-thin">
              <table className="w-full text-xs min-w-[420px]">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/40">
                    <th className="px-3 py-2 font-mono">Categoría</th>
                    <th className="px-3 py-2 font-mono">Nombre</th>
                    <th className="px-3 py-2 font-mono text-right">Precio</th>
                    <th className="px-3 py-2 font-mono text-right">IVA</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 6).map((r, i) => (
                    <tr key={i} className="border-b border-border/20 last:border-0">
                      <td className="px-3 py-1.5 text-muted-foreground">{r.categoria}</td>
                      <td className="px-3 py-1.5">{r.nombre}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums">
                        {r.precio.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                      </td>
                      <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">{r.iva}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-3 py-2 bg-foreground/[0.02] text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Mostrando 6 de {preview.length} filas</span>
              <button
                type="button"
                className="text-[var(--gold-soft)] hover:underline"
                onClick={() => toast({ title: "Carta cargada", description: "Los 10 platos se han añadido a tu carta." })}
              >
                Ver todo →
              </button>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

/* =========================================================
 * Empty states gallery
 * =======================================================*/

function EmptyStatesGallery() {
  return (
    <SectionCard
      title="Galería de empty states"
      desc="Lo que verá el equipo cuando algo aún no está configurado"
      icon={Layers}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {EMPTY_STATES.map((es) => {
          const Icon = es.icon;
          const meta = ACCENT_META[es.accent];
          return (
            <div
              key={es.id}
              className={cn(
                "rounded-xl border p-4 flex flex-col items-center text-center gap-2 min-h-[150px] justify-center bg-foreground/[0.01]",
                meta.border
              )}
            >
              <div className={cn("grid size-10 place-items-center rounded-full", meta.bg, meta.text)}>
                <Icon className="size-5" />
              </div>
              <div>
                <div className="text-sm font-medium">{es.title}</div>
                <div className={cn("text-xs mt-0.5", meta.text)}>{es.message}</div>
              </div>
              <button
                type="button"
                className={cn(
                  "mt-1 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition-colors",
                  meta.border, meta.text, "hover:bg-foreground/[0.05]"
                )}
              >
                <PlusCircle className="size-3" /> Empezar
              </button>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

/* =========================================================
 * Main view
 * =======================================================*/

export function OnboardingGuidedView() {
  const { toast } = useToast();
  const [state, setState] = React.useState<PersistedState>(() => loadState());
  const [configOpen, setConfigOpen] = React.useState(false);
  const reduce = useReducedMotion();

  // Persist on every change
  React.useEffect(() => {
    saveState(state);
  }, [state]);

  const currentStep = STEPS.find((s) => s.id === state.current) ?? STEPS[0];

  function goToStep(id: number) {
    setState((prev) => ({ ...prev, current: id }));
  }

  function handleReset() {
    const fresh: PersistedState = { done: [1, 2], current: 3, skipped: [], appliedPlantilla: null, csvImportedFile: null };
    setState(fresh);
    toast({
      title: "Onboarding reiniciado",
      description: "Checklist restaurado a su estado inicial.",
    });
  }

  function advanceFromCurrent() {
    setState((prev) => {
      const next = STEPS.find((s) => s.id > prev.current && !prev.done.includes(s.id) && !prev.skipped.includes(s.id));
      const newCurrent = next ? next.id : prev.current;
      return { ...prev, current: newCurrent };
    });
  }

  function handleConfigure() {
    setConfigOpen(true);
  }

  function handleSkip() {
    setState((prev) => ({
      ...prev,
      skipped: [...new Set([...prev.skipped, prev.current])],
    }));
    toast({
      title: "Paso saltado",
      description: `${currentStep.label} se ha pospuesto. Puedes completarlo más tarde.`,
    });
    advanceFromCurrent();
  }

  function handleMarkDone() {
    setState((prev) => ({
      ...prev,
      done: [...new Set([...prev.done, prev.current])],
      skipped: prev.skipped.filter((id) => id !== prev.current),
    }));
    toast({
      title: "Paso completado",
      description: `${currentStep.label} marcado como hecho. ¡Buen trabajo!`,
    });
    advanceFromCurrent();
  }

  function handleApplyPlantilla(id: PlantillaTipo) {
    const tpl = PLANTILLAS.find((p) => p.id === id)!;
    setState((prev) => ({
      ...prev,
      appliedPlantilla: id,
      // Mark mesas, zonas, horarios, impuestos as done when applying plantilla
      done: [...new Set([...prev.done, 1, 2, 10, 11])],
    }));
    toast({
      title: "Plantilla aplicada",
      description: `«${tpl.label}»: ${tpl.includes.carta} platos, ${tpl.includes.zonas} zonas, horarios ${tpl.includes.horarios}.`,
    });
  }

  function handleCsvImport(name: string) {
    setState((prev) => ({
      ...prev,
      csvImportedFile: name,
      done: [...new Set([...prev.done, 3])],
    }));
  }

  // If all done → show celebration
  const allDone = state.done.length === STEPS.length;

  return (
    <div className="space-y-5 overflow-x-hidden">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight">Onboarding guiado</h1>
            
            <Badge variant="outline" className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] text-[10px]">
              Fase 7
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Operativo en 15 minutos · checklist persistente, plantillas por tipo de local e import de carta.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="border-emerald-400/40 bg-emerald-400/10 text-emerald-300 font-mono uppercase tracking-wider text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5" />
            {state.done.length}/{STEPS.length} completados
          </Badge>
        </div>
      </header>

      {allDone && (
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-emerald-500/40 bg-emerald-500/[0.06] p-4 flex items-center gap-3"
        >
          <div className="grid size-10 place-items-center rounded-full bg-emerald-500/20 text-emerald-300 shrink-0">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <h3 className="font-display text-base">¡Onboarding completo!</h3>
            <p className="text-xs text-muted-foreground">
              Has completado los 13 pasos. Tu restaurante está operativo. Puedes revisar o ajustar cualquier sección desde el menú lateral.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="ml-auto text-emerald-200 hover:text-emerald-100 hover:bg-emerald-500/10"
          >
            <RotateCcw className="size-3.5 mr-1" /> Empezar de nuevo
          </Button>
        </motion.div>
      )}

      {/* Layout: 2 columns on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5 items-start">
        {/* Left: persistent checklist */}
        <ChecklistPanel
          state={state}
          onStepClick={goToStep}
          onReset={handleReset}
        />

        {/* Right: current step + plantillas + csv + empty states */}
        <div className="space-y-5 min-w-0">
          <CurrentStepCard
            state={state}
            onConfigure={handleConfigure}
            onSkip={handleSkip}
            onMarkDone={handleMarkDone}
          />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
            <PlantillasCard applied={state.appliedPlantilla} onApply={handleApplyPlantilla} />
            <CsvImportCard fileName={state.csvImportedFile} onImport={handleCsvImport} />
          </div>

          <EmptyStatesGallery />

          {/* Persistence reassurance footer */}
          <div className="rounded-xl border border-border/40 bg-foreground/[0.02] p-3 flex items-center gap-2 text-[11px] text-muted-foreground">
            <Save className="size-3.5 text-[var(--teal)] shrink-0" />
            <span className="leading-snug">
              Tu progreso se guarda en este navegador. Cierra y vuelve cuando quieras: <strong className="text-foreground">Reanuda donde lo dejaste</strong>.
            </span>
          </div>
        </div>
      </div>

      <StepConfigDialog
        open={configOpen}
        onOpenChange={setConfigOpen}
        step={currentStep}
      />
    </div>
  );
}

/* =========================================================
 * Notes
 * =========================================================
 * - Persistencia: localStorage key `rp_onboarding_guided_v1` con done[], current, skipped[], appliedPlantilla, csvImportedFile.
 * - Plantilla aplicada marca automáticamente pasos 1 (mesas), 2 (zonas), 10 (horarios) y 11 (impuestos) como done.
 * - CSV import marca paso 3 (carta) como done.
 * - "Saltar por ahora" añade a skipped[] y avanza al siguiente paso pendiente.
 * - "Marcar hecho" añade a done[], quita de skipped[] y avanza.
 * - Estado "all done" (13/13) muestra banner celebración + botón "Empezar de nuevo".
 * - useToast exclusivamente en handlers (handleSkip, handleMarkDone, handleApplyPlantilla, handleCsvImport, StepConfigDialog.handleSave, CsvImportCard.handleFile).
 * - Sin `any`, TypeScript strict, responsive 390/768/1280+ (grid-cols-1 lg:grid-cols-[360px_1fr], xl:grid-cols-2 en cards internas, overflow-x-auto rp-scroll-thin en tabla CSV con min-w-[420px]).
 * =======================================================*/
