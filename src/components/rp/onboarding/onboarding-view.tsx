"use client";

/* ============================================================================
 * RestoPanel · Onboarding IA conversacional
 * 8-step wizard: nombre → tipo → ciudad → mesas/zonas → horarios → carta(OCR)
 *                 → branding → redes
 * AI suggestions · final preview · checklist
 * ========================================================================== */

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Store, UtensilsCrossed, MapPin, LayoutGrid, Clock, ScanLine,
  Palette, Share2, Sparkles, CheckCircle2, ArrowRight, ArrowLeft,
  Plus, X, Pencil, BrainCircuit, QrCode, Globe, Wand2, FileText,
  Instagram, Facebook, Star, Zap, Award,
  Beer, Wine, Pizza, Fish, Beef, Cake, Salad, Coffee, IceCream,
  Loader2, PartyPopper, ClipboardCheck, ListChecks,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type StepId =
  | "nombre"
  | "tipo"
  | "ciudad"
  | "mesas"
  | "horarios"
  | "carta"
  | "branding"
  | "redes";

interface OnboardingData {
  nombre: string;
  tipo: string;
  ciudad: string;
  mesas: number;
  zonas: { id: string; nombre: string; mesas: number; capacidad: number }[];
  horarios: { dia: string; abierto: boolean; apertura: string; cierre: string }[];
  carta: {
    escaneada: boolean;
    estado: "idle" | "analizando" | "ok" | "error";
    productos: CartaProducto[];
  };
  branding: {
    colorPrimario: string;
    logo: string | null;
    tipografia: string;
    tagline: string;
  };
  redes: {
    instagram: string;
    facebook: string;
    google: string;
    website: string;
  };
}

interface CartaProducto {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  confianza: number; // % OCR
}

/* =========================================================
 * Static data
 * =======================================================*/
const STEPS: { id: StepId; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "nombre", label: "Nombre", icon: Store, desc: "Identifica tu negocio" },
  { id: "tipo", label: "Tipo de local", icon: UtensilsCrossed, desc: "Especialidad gastronómica" },
  { id: "ciudad", label: "Ciudad", icon: MapPin, desc: "Ubicación geográfica" },
  { id: "mesas", label: "Mesas y zonas", icon: LayoutGrid, desc: "Distribución del local" },
  { id: "horarios", label: "Horarios", icon: Clock, desc: "Apertura y cierre" },
  { id: "carta", label: "Carta (OCR)", icon: ScanLine, desc: "Sube tu carta actual" },
  { id: "branding", label: "Branding", icon: Palette, desc: "Identidad visual" },
  { id: "redes", label: "Redes", icon: Share2, desc: "Presencia online" },
];

const TIPOS_LOCAL = [
  { id: "restaurante", label: "Restaurante", icon: UtensilsCrossed, desc: "Servicio completo en mesa" },
  { id: "bar", label: "Bar", icon: Beer, desc: "Tapas y bebidas" },
  { id: "cafeteria", label: "Cafetería", icon: Coffee, desc: "Café, repostería, desayunos" },
  { id: "pizzeria", label: "Pizzería", icon: Pizza, desc: "Pizzas y pasta" },
  { id: "marisqueria", label: "Marisquería", icon: Fish, desc: "Marisco y pescado" },
  { id: "asador", label: "Asador", icon: Beef, desc: "Carnes a la brasa" },
  { id: "pasteleria", label: "Pastelería", icon: Cake, desc: "Repostería artesanal" },
  { id: "vegano", label: "Vegano", icon: Salad, desc: "Plant-based" },
  { id: "heladeria", label: "Heladería", icon: IceCream, desc: "Helados artesanos" },
  { id: "cocteleria", label: "Coctelería", icon: Wine, desc: "Bar de copas" },
];

const CIUDADES = [
  "Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza",
  "Málaga", "Murcia", "Palma", "Bilbao", "Alicante", "Granada",
  "Oviedo", "San Sebastián", "Santander", "Valladolid", "A Coruña",
];

const COLORES_PRIMARIOS = [
  { id: "emerald", value: "#10B981", label: "Esmeralda" },
  { id: "gold", value: "#D4AF37", label: "Dorado" },
  { id: "red", value: "#EF4444", label: "Rojo" },
  { id: "blue", value: "#3B82F6", label: "Azul" },
  { id: "violet", value: "#8B5CF6", label: "Violeta" },
  { id: "orange", value: "#F97316", label: "Naranja" },
  { id: "teal", value: "#3DD6C9", label: "Turquesa" },
  { id: "rose", value: "#F43F5E", label: "Rosa" },
];

const TIPOGRAFIAS = [
  { id: "fraunces", label: "Fraunces", desc: "Display elegante" },
  { id: "inter", label: "Inter", desc: "Sans moderna" },
  { id: "playfair", label: "Playfair Display", desc: "Serif clásica" },
  { id: "poppins", label: "Poppins", desc: "Sans geométrica" },
  { id: "montserrat", label: "Montserrat", desc: "Sans neutra" },
];

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const PRODUCTOS_OCR_DEMO: Omit<CartaProducto, "id">[] = [
  { nombre: "Ensalada César", categoria: "Entrantes", precio: 9.5, confianza: 98 },
  { nombre: "Croquetas de jamón (6 ud)", categoria: "Entrantes", precio: 8.0, confianza: 95 },
  { nombre: "Calamares a la andaluza", categoria: "Entrantes", precio: 11.5, confianza: 92 },
  { nombre: "Tartar de salmón", categoria: "Entrantes", precio: 14.0, confianza: 88 },
  { nombre: "Paella de marisco", categoria: "Arroces", precio: 22.0, confianza: 99 },
  { nombre: "Risotto de setas", categoria: "Pastas", precio: 13.5, confianza: 94 },
  { nombre: "Lasaña boloñesa", categoria: "Pastas", precio: 12.0, confianza: 96 },
  { nombre: "Solomillo de ternera", categoria: "Carnes", precio: 24.5, confianza: 97 },
  { nombre: "Entrecot a la parrilla", categoria: "Carnes", precio: 21.0, confianza: 91 },
  { nombre: "Pollo asado", categoria: "Carnes", precio: 13.5, confianza: 99 },
  { nombre: "Merluza en salsa verde", categoria: "Pescados", precio: 19.5, confianza: 90 },
  { nombre: "Bacalao confitado", categoria: "Pescados", precio: 18.0, confianza: 87 },
  { nombre: "Hamburguesa clásica", categoria: "Carnes", precio: 11.5, confianza: 100 },
  { nombre: "Pulpo a la gallega", categoria: "Entrantes", precio: 16.5, confianza: 84 },
  { nombre: "Tarta de chocolate", categoria: "Postres", precio: 6.5, confianza: 99 },
  { nombre: "Cheesecake", categoria: "Postres", precio: 6.0, confianza: 96 },
  { nombre: "Tiramisú", categoria: "Postres", precio: 5.5, confianza: 93 },
  { nombre: "Café espresso", categoria: "Bebidas", precio: 1.4, confianza: 100 },
  { nombre: "Vino tinto Rioja (copa)", categoria: "Bebidas", precio: 3.5, confianza: 92 },
  { nombre: "Cerveza artesana", categoria: "Bebidas", precio: 3.0, confianza: 98 },
  { nombre: "Refresco", categoria: "Bebidas", precio: 2.0, confianza: 100 },
  { nombre: "Agua mineral", categoria: "Bebidas", precio: 1.5, confianza: 100 },
  { nombre: "Gin-tonic premium", categoria: "Bebidas", precio: 8.5, confianza: 89 },
  { nombre: "Zumo natural", categoria: "Bebidas", precio: 3.5, confianza: 94 },
];

/* =========================================================
 * Helpers
 * =======================================================*/
function euro(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/* =========================================================
 * Initial data
 * =======================================================*/
function buildInitial(): OnboardingData {
  return {
    nombre: "",
    tipo: "restaurante",
    ciudad: "Madrid",
    mesas: 20,
    zonas: [
      { id: "z1", nombre: "Sala", mesas: 14, capacidad: 56 },
      { id: "z2", nombre: "Terraza", mesas: 6, capacidad: 24 },
    ],
    horarios: DIAS_SEMANA.map((d, i) => ({
      dia: d,
      abierto: i < 5,
      apertura: "13:00",
      cierre: "23:30",
    })),
    carta: {
      escaneada: false,
      estado: "idle",
      productos: [],
    },
    branding: {
      colorPrimario: "#10B981",
      logo: null,
      tipografia: "fraunces",
      tagline: "",
    },
    redes: {
      instagram: "",
      facebook: "",
      google: "",
      website: "",
    },
  };
}

/* =========================================================
 * Main view
 * =======================================================*/
export function OnboardingView() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const t = reduce ? { duration: 0 } : { duration: 0.25, ease: "easeOut" as const };

  const [stepIdx, setStepIdx] = React.useState(0);
  const [data, setData] = React.useState<OnboardingData>(buildInitial);
  const [completado, setCompletado] = React.useState(false);
  const [finalOpen, setFinalOpen] = React.useState(false);

  const step = STEPS[stepIdx];
  const progreso = ((stepIdx + 1) / STEPS.length) * 100;

  function updateData(patch: Partial<OnboardingData>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  function next() {
    if (stepIdx < STEPS.length - 1) {
      setStepIdx(stepIdx + 1);
    } else {
      // último paso → finalizar
      setCompletado(true);
      setFinalOpen(true);
      toast({
        title: "Onboarding completado",
        description: `${data.nombre} listo para operar`,
      });
    }
  }

  function prev() {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  }

  function skipTo(id: StepId) {
    const idx = STEPS.findIndex((s) => s.id === id);
    if (idx >= 0) setStepIdx(idx);
  }

  function canNext(): boolean {
    switch (step.id) {
      case "nombre":
        return data.nombre.trim().length >= 2;
      case "carta":
        return true; // opcional
      case "redes":
        return true;
      default:
        return true;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
              Onboarding
            </h1>
            <Badge
              variant="outline"
              className="border-[var(--rp-violet)]/40 bg-[var(--rp-violet)]/10 text-[var(--rp-violet-soft)] font-mono uppercase tracking-wider text-[10px]"
            >
              <Sparkles className="h-3 w-3 mr-1" /> IA conversacional
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Te guiamos paso a paso. Al final tendrás plano, carta digital, QR,
            automatizaciones y sellos listos.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Paso {stepIdx + 1} de {STEPS.length}
          </div>
          <div className="text-2xl font-display font-medium tabular-nums">
            {Math.round(progreso)}%
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="space-y-2">
        <Progress value={progreso} className="h-2" />
        {/* Step pills (desktop) */}
        <div className="hidden lg:flex items-center justify-between gap-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < stepIdx;
            const active = i === stepIdx;
            return (
              <button
                key={s.id}
                onClick={() => (i <= stepIdx || completado) && skipTo(s.id)}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors flex-1 min-w-0",
                  active
                    ? "bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)] border border-[var(--rp-emerald)]/30"
                    : done
                      ? "text-[var(--rp-emerald-soft)]"
                      : "text-muted-foreground hover:text-foreground"
                )}
                disabled={i > stepIdx && !completado}
              >
                {done ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="truncate">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main: step content + AI suggestions sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={t}
            className="rp-glass rounded-2xl p-5 sm:p-6"
          >
            <StepHeader step={step} idx={stepIdx} />
            <Separator className="my-4" />

            {/* Step content */}
            {step.id === "nombre" && (
              <StepNombre data={data} onChange={updateData} />
            )}
            {step.id === "tipo" && (
              <StepTipo data={data} onChange={updateData} />
            )}
            {step.id === "ciudad" && (
              <StepCiudad data={data} onChange={updateData} />
            )}
            {step.id === "mesas" && (
              <StepMesas data={data} onChange={updateData} />
            )}
            {step.id === "horarios" && (
              <StepHorarios data={data} onChange={updateData} />
            )}
            {step.id === "carta" && (
              <StepCarta data={data} onChange={updateData} />
            )}
            {step.id === "branding" && (
              <StepBranding data={data} onChange={updateData} />
            )}
            {step.id === "redes" && (
              <StepRedes data={data} onChange={updateData} />
            )}

            {/* Navigation */}
            <Separator className="my-4" />
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={prev}
                disabled={stepIdx === 0}
                className="min-h-11"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Anterior
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Paso saltado",
                      description: "Puedes completarlo más tarde",
                    });
                    next();
                  }}
                  className="min-h-11"
                >
                  Saltar
                </Button>
                <Button
                  onClick={next}
                  disabled={!canNext()}
                  className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)] min-h-11"
                >
                  {stepIdx === STEPS.length - 1 ? (
                    <>
                      <PartyPopper className="h-4 w-4 mr-1" /> Finalizar
                    </>
                  ) : (
                    <>
                      Siguiente <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* AI suggestions sidebar */}
        <aside className="space-y-4">
          <AISuggestionsPanel data={data} stepId={step.id} />
          <ResumenPanel data={data} />
        </aside>
      </div>

      {/* Final dialog */}
      <FinalDialog
        open={finalOpen}
        onOpenChange={setFinalOpen}
        data={data}
        onRestart={() => {
          setData(buildInitial());
          setStepIdx(0);
          setCompletado(false);
          setFinalOpen(false);
          toast({
            title: "Onboarding reiniciado",
            description: "Datos limpiados",
          });
        }}
      />
    </div>
  );
}

/* =========================================================
 * Step header
 * =======================================================*/
function StepHeader({
  step,
  idx,
}: {
  step: { id: StepId; label: string; icon: React.ElementType; desc: string };
  idx: number;
}) {
  const Icon = step.icon;
  return (
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-lg bg-[var(--rp-emerald)]/15 text-[var(--rp-emerald-soft)] flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          Paso {idx + 1} · {step.label}
        </div>
        <h2 className="text-lg font-display font-medium">{step.desc}</h2>
      </div>
    </div>
  );
}

/* =========================================================
 * Step: Nombre
 * =======================================================*/
function StepNombre({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="onb-nombre">Nombre del establecimiento</Label>
        <Input
          id="onb-nombre"
          value={data.nombre}
          onChange={(e) => onChange({ nombre: e.target.value })}
          placeholder="ej. La Taberna del Puerto"
          className="bg-background/40 mt-1.5 h-12 text-base"
          autoFocus
        />
        <p className="text-xs text-muted-foreground mt-1.5">
          Se usará en la carta digital, QR, web y automatizaciones.
        </p>
      </div>

      <div>
        <Label htmlFor="onb-tagline">Eslogan (opcional)</Label>
        <Input
          id="onb-tagline"
          value={data.branding.tagline}
          onChange={(e) =>
            onChange({
              branding: { ...data.branding, tagline: e.target.value },
            })
          }
          placeholder="ej. Cocina mediterránea de producto"
          className="bg-background/40 mt-1.5"
        />
      </div>

      {/* Sugerencias IA */}
      <div className="rounded-lg border border-[var(--rp-violet)]/30 bg-[var(--rp-violet)]/5 p-3">
        <div className="flex items-center gap-2 mb-2">
          <BrainCircuit className="h-4 w-4 text-[var(--rp-violet-soft)]" />
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--rp-violet-soft)]">
            Sugerencias IA
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["La Taberna del Puerto", "Bistró Marinera", "El Rincón de Lucía", "Casa Solera"].map((s) => (
            <button
              key={s}
              onClick={() => onChange({ nombre: s })}
              className="rounded-md border border-border/40 bg-foreground/[0.03] px-2 py-1 text-xs hover:border-[var(--rp-emerald)]/40 hover:bg-[var(--rp-emerald)]/10 hover:text-[var(--rp-emerald-soft)] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Step: Tipo
 * =======================================================*/
function StepTipo({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Elige el tipo de local. Personalizaremos plantillas de carta,
        automatizaciones y sugerencias de branding.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {TIPOS_LOCAL.map((tipo) => {
          const Icon = tipo.icon;
          const active = data.tipo === tipo.id;
          return (
            <button
              key={tipo.id}
              onClick={() => onChange({ tipo: tipo.id })}
              className={cn(
                "flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors",
                active
                  ? "border-[var(--rp-emerald)]/50 bg-[var(--rp-emerald)]/10"
                  : "border-border/40 hover:bg-foreground/[0.04]"
              )}
            >
              <div
                className={cn(
                  "h-8 w-8 rounded-md flex items-center justify-center",
                  active
                    ? "bg-[var(--rp-emerald)]/20 text-[var(--rp-emerald-soft)]"
                    : "bg-foreground/[0.04] text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium">{tipo.label}</div>
                <div className="text-[10px] text-muted-foreground">{tipo.desc}</div>
              </div>
              {active && (
                <CheckCircle2 className="h-4 w-4 text-[var(--rp-emerald)] ml-auto" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
 * Step: Ciudad
 * =======================================================*/
function StepCiudad({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="onb-ciudad">Ciudad</Label>
        <Select value={data.ciudad} onValueChange={(v) => onChange({ ciudad: v })}>
          <SelectTrigger id="onb-ciudad" className="bg-background/40 mt-1.5 h-12">
            <SelectValue placeholder="Selecciona tu ciudad" />
          </SelectTrigger>
          <SelectContent>
            {CIUDADES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1.5">
          Se usará para horarios festivos locales, idiomas y plantillas de
          campañas regionales.
        </p>
      </div>

      <div className="rounded-lg border border-[var(--rp-violet)]/30 bg-[var(--rp-violet)]/5 p-3">
        <div className="flex items-center gap-2 mb-2">
          <BrainCircuit className="h-4 w-4 text-[var(--rp-violet-soft)]" />
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--rp-violet-soft)]">
            Sugerencias para {data.ciudad}
          </span>
        </div>
        <ul className="text-xs space-y-1.5 text-muted-foreground">
          <li className="flex items-start gap-2">
            <Sparkles className="h-3 w-3 text-[var(--rp-emerald-soft)] mt-0.5 shrink-0" />
            <span>Festivos locales 2025: 14 feriados detectados</span>
          </li>
          <li className="flex items-start gap-2">
            <Sparkles className="h-3 w-3 text-[var(--rp-emerald-soft)] mt-0.5 shrink-0" />
            <span>Plantilla de campañas: Semana Santa, feria local, verbena</span>
          </li>
          <li className="flex items-start gap-2">
            <Sparkles className="h-3 w-3 text-[var(--rp-emerald-soft)] mt-0.5 shrink-0" />
            <span>Horario típico: comida 13-16h, cena 20-23:30h</span>
          </li>
          <li className="flex items-start gap-2">
            <Sparkles className="h-3 w-3 text-[var(--rp-emerald-soft)] mt-0.5 shrink-0" />
            <span>Idiomas sugeridos: ES, EN, FR (según turismo local)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

/* =========================================================
 * Step: Mesas y zonas
 * =======================================================*/
function StepMesas({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
}) {
  const totalMesas = data.zonas.reduce((s, z) => s + z.mesas, 0);
  const totalCap = data.zonas.reduce((s, z) => s + z.capacidad, 0);

  function addZona() {
    onChange({
      zonas: [
        ...data.zonas,
        {
          id: `z${Date.now()}`,
          nombre: `Zona ${data.zonas.length + 1}`,
          mesas: 4,
          capacidad: 16,
        },
      ],
    });
  }
  function updateZona(id: string, patch: Partial<{ nombre: string; mesas: number; capacidad: number }>) {
    onChange({
      zonas: data.zonas.map((z) => (z.id === id ? { ...z, ...patch } : z)),
    });
  }
  function removeZona(id: string) {
    onChange({ zonas: data.zonas.filter((z) => z.id !== id) });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rp-glass rounded-lg p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Total mesas
          </div>
          <div className="text-2xl font-display font-medium tabular-nums">
            {totalMesas}
          </div>
        </div>
        <div className="rp-glass rounded-lg p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Capacidad total
          </div>
          <div className="text-2xl font-display font-medium tabular-nums">
            {totalCap} pax
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Zonas del local</span>
          <Button variant="outline" size="sm" onClick={addZona}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Añadir zona
          </Button>
        </div>
        {data.zonas.map((z, i) => (
          <div
            key={z.id}
            className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg border border-border/40"
          >
            <div className="col-span-12 sm:col-span-5">
              <Input
                value={z.nombre}
                onChange={(e) => updateZona(z.id, { nombre: e.target.value })}
                className="bg-background/40"
                placeholder={`Zona ${i + 1}`}
              />
            </div>
            <div className="col-span-5 sm:col-span-3">
              <Label className="text-[10px] text-muted-foreground">Mesas</Label>
              <Input
                type="number"
                value={z.mesas}
                onChange={(e) => updateZona(z.id, { mesas: +e.target.value })}
                className="bg-background/40"
              />
            </div>
            <div className="col-span-5 sm:col-span-3">
              <Label className="text-[10px] text-muted-foreground">Capacidad</Label>
              <Input
                type="number"
                value={z.capacidad}
                onChange={(e) => updateZona(z.id, { capacidad: +e.target.value })}
                className="bg-background/40"
              />
            </div>
            <div className="col-span-2 sm:col-span-1 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-[var(--rp-red-soft)] hover:text-[var(--rp-red)]"
                onClick={() => removeZona(z.id)}
                aria-label={`Eliminar ${z.nombre}`}
                disabled={data.zonas.length === 1}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Plano preview */}
      <div className="rounded-lg border border-border/40 p-3">
        <div className="flex items-center gap-2 mb-2">
          <LayoutGrid className="h-4 w-4 text-[var(--rp-emerald)]" />
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Previsualización del plano
          </span>
        </div>
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${Math.min(6, Math.ceil(Math.sqrt(totalMesas)))}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: Math.min(24, totalMesas) }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-md border border-[var(--rp-emerald)]/30 bg-[var(--rp-emerald)]/5 flex items-center justify-center text-[10px] font-mono text-[var(--rp-emerald-soft)]"
            >
              {i + 1}
            </div>
          ))}
          {totalMesas > 24 && (
            <div className="aspect-square rounded-md border border-dashed border-border/40 flex items-center justify-center text-[10px] text-muted-foreground">
              +{totalMesas - 24}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Step: Horarios
 * =======================================================*/
function StepHorarios({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
}) {
  function updateDia(idx: number, patch: Partial<{ abierto: boolean; apertura: string; cierre: string }>) {
    onChange({
      horarios: data.horarios.map((h, i) => (i === idx ? { ...h, ...patch } : h)),
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Define los horarios de apertura. Se usarán para reservas, QR dinámico
        y automatizaciones de confirmación.
      </p>
      <div className="space-y-1">
        {data.horarios.map((h, i) => (
          <div
            key={h.dia}
            className="grid grid-cols-12 gap-2 items-center py-2 px-2 rounded-md hover:bg-foreground/[0.02]"
          >
            <div className="col-span-3 sm:col-span-2 font-medium text-sm">
              {h.dia}
            </div>
            <div className="col-span-3 sm:col-span-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch
                  checked={h.abierto}
                  onCheckedChange={(v) => updateDia(i, { abierto: v })}
                  aria-label={`${h.dia} abierto`}
                />
                <span className={cn("text-xs", h.abierto ? "text-[var(--rp-emerald-soft)]" : "text-muted-foreground")}>
                  {h.abierto ? "Abierto" : "Cerrado"}
                </span>
              </label>
            </div>
            <div className={cn("col-span-6 sm:col-span-7 flex items-center gap-2", !h.abierto && "opacity-40 pointer-events-none")}>
              <Input
                type="time"
                value={h.apertura}
                onChange={(e) => updateDia(i, { apertura: e.target.value })}
                className="bg-background/40"
              />
              <span className="text-xs text-muted-foreground">→</span>
              <Input
                type="time"
                value={h.cierre}
                onChange={(e) => updateDia(i, { cierre: e.target.value })}
                className="bg-background/40"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-[var(--rp-violet)]/30 bg-[var(--rp-violet)]/5 p-3">
        <div className="flex items-center gap-2 mb-2">
          <BrainCircuit className="h-4 w-4 text-[var(--rp-violet-soft)]" />
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--rp-violet-soft)]">
            Sugerencia IA
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Detectamos 2 servicios (comida + cena). Activar servicio continuo los
          fines de semana puede aumentar reservas +12%.
        </p>
      </div>
    </div>
  );
}

/* =========================================================
 * Step: Carta (OCR mock)
 * =======================================================*/
function StepCarta({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
}) {
  const { toast } = useToast();
  const [progresoOCR, setProgresoOCR] = React.useState(0);

  function startOCR() {
    onChange({
      carta: { ...data.carta, escaneada: true, estado: "analizando", productos: [] },
    });
    setProgresoOCR(0);
    // Simular progreso
    const interval = setInterval(() => {
      setProgresoOCR((p) => {
        const next = p + Math.random() * 12 + 5;
        if (next >= 100) {
          clearInterval(interval);
          // Productos detectados
          const productos: CartaProducto[] = PRODUCTOS_OCR_DEMO.map((p, i) => ({
            ...p,
            id: `cp${i + 1}`,
          }));
          onChange({
            carta: {
              escaneada: true,
              estado: "ok",
              productos,
            },
          });
          toast({
            title: "Análisis completado",
            description: `${productos.length} productos detectados`,
          });
          return 100;
        }
        return next;
      });
    }, 280);
  }

  function removeProducto(id: string) {
    onChange({
      carta: {
        ...data.carta,
        productos: data.carta.productos.filter((p) => p.id !== id),
      },
    });
  }

  function updateProducto(id: string, patch: Partial<CartaProducto>) {
    onChange({
      carta: {
        ...data.carta,
        productos: data.carta.productos.map((p) =>
          p.id === id ? { ...p, ...patch } : p
        ),
      },
    });
  }

  const categorias = Array.from(
    new Set(data.carta.productos.map((p) => p.categoria))
  );
  const precioMedio =
    data.carta.productos.length > 0
      ? data.carta.productos.reduce((s, p) => s + p.precio, 0) /
        data.carta.productos.length
      : 0;

  return (
    <div className="space-y-4">
      {data.carta.estado === "idle" && (
        <>
          <div className="rounded-lg border-2 border-dashed border-border/60 p-8 text-center">
            <div className="h-14 w-14 mx-auto rounded-xl bg-foreground/[0.04] flex items-center justify-center mb-3">
              <ScanLine className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium">Sube tu carta actual</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              PDF, imagen o foto. La IA detectará productos, precios y categorías.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                onClick={startOCR}
                className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
              >
                <ScanLine className="h-4 w-4 mr-1" /> Escanear carta demo
              </Button>
              <Button variant="outline" onClick={startOCR}>
                <FileText className="h-4 w-4 mr-1" /> Subir PDF
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            O <button onClick={() => onChange({ carta: { ...data.carta, estado: "ok", productos: [] } })} className="text-[var(--rp-emerald-soft)] underline">empezar con carta vacía</button>
          </p>
        </>
      )}

      {data.carta.estado === "analizando" && (
        <div className="rounded-lg border border-[var(--rp-violet)]/40 bg-[var(--rp-violet)]/5 p-8 text-center">
          <Loader2 className="h-8 w-8 mx-auto text-[var(--rp-violet-soft)] animate-spin mb-3" />
          <h3 className="text-sm font-medium">Analizando carta...</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            Detectando productos, precios y categorías
          </p>
          <Progress value={progresoOCR} className="h-1.5 max-w-xs mx-auto" />
          <p className="text-[10px] font-mono tabular-nums text-muted-foreground mt-2">
            {Math.round(progresoOCR)}%
          </p>
        </div>
      )}

      {data.carta.estado === "ok" && (
        <>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--rp-emerald)]" />
              <span className="text-sm font-medium">
                {data.carta.productos.length} productos detectados
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{categorias.length} categorías</span>
              <span>Precio medio: <span className="font-mono text-[var(--rp-emerald-soft)]">{euro(precioMedio)}</span></span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7"
                onClick={() => onChange({ carta: { escaneada: false, estado: "idle", productos: [] } })}
              >
                <Pencil className="h-3 w-3 mr-1" /> Re-escanear
              </Button>
            </div>
          </div>

          {data.carta.productos.length > 0 && (
            <div className="space-y-3 max-h-[380px] overflow-y-auto rp-scroll-thin pr-1">
              {categorias.map((cat) => (
                <div key={cat}>
                  <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 mt-2">
                    {cat}
                  </div>
                  <div className="space-y-1">
                    {data.carta.productos
                      .filter((p) => p.categoria === cat)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="grid grid-cols-12 gap-2 items-center py-1.5 px-2 rounded-md border border-border/30 hover:bg-foreground/[0.02]"
                        >
                          <Input
                            value={p.nombre}
                            onChange={(e) => updateProducto(p.id, { nombre: e.target.value })}
                            className="bg-background/40 col-span-7 h-8 text-xs"
                          />
                          <Input
                            type="number"
                            step="0.10"
                            value={p.precio}
                            onChange={(e) => updateProducto(p.id, { precio: +e.target.value })}
                            className="bg-background/40 col-span-3 h-8 text-xs font-mono"
                          />
                          <div className="col-span-1 text-[10px] font-mono text-muted-foreground text-center">
                            {p.confianza}%
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="col-span-1 h-8 w-8 p-0 text-[var(--rp-red-soft)]"
                            onClick={() => removeProducto(p.id)}
                            aria-label={`Eliminar ${p.nombre}`}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {data.carta.productos.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Carta vacía. Puedes añadir productos manualmente más tarde.
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* =========================================================
 * Step: Branding
 * =======================================================*/
function StepBranding({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
}) {
  const { toast } = useToast();
  function updateBranding(patch: Partial<OnboardingData["branding"]>) {
    onChange({ branding: { ...data.branding, ...patch } });
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Color primario</Label>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-1.5">
          {COLORES_PRIMARIOS.map((c) => (
            <button
              key={c.id}
              onClick={() => updateBranding({ colorPrimario: c.value })}
              className={cn(
                "aspect-square rounded-lg border-2 transition-all",
                data.branding.colorPrimario === c.value
                  ? "border-foreground scale-105"
                  : "border-transparent hover:scale-105"
              )}
              style={{ background: c.value }}
              aria-label={`Color ${c.label}`}
              title={c.label}
            />
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          {COLORES_PRIMARIOS.find((c) => c.value === data.branding.colorPrimario)?.label ?? "Personalizado"}
        </p>
      </div>

      <div>
        <Label>Tipografía</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
          {TIPOGRAFIAS.map((tipo) => (
            <button
              key={tipo.id}
              onClick={() => updateBranding({ tipografia: tipo.id })}
              className={cn(
                "rounded-lg border p-3 text-left transition-colors",
                data.branding.tipografia === tipo.id
                  ? "border-[var(--rp-emerald)]/50 bg-[var(--rp-emerald)]/10"
                  : "border-border/40 hover:bg-foreground/[0.04]"
              )}
            >
              <div className="text-sm font-medium">{tipo.label}</div>
              <div className="text-[10px] text-muted-foreground">{tipo.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="onb-logo">Logo (opcional)</Label>
        <div className="mt-1.5 flex items-center gap-3">
          <div
            className="h-16 w-16 rounded-lg border-2 border-dashed border-border/60 flex items-center justify-center text-xs text-muted-foreground"
            style={{
              background: `${data.branding.colorPrimario}15`,
              color: data.branding.colorPrimario,
            }}
          >
            {data.nombre.slice(0, 2).toUpperCase() || "??"}
          </div>
          <div className="flex-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast({
                  title: "Logo generado",
                  description: "Logo demostración aplicado",
                });
                updateBranding({ logo: "demo" });
              }}
            >
              <Wand2 className="h-3.5 w-3.5 mr-1" /> Generar con IA
            </Button>
            <p className="text-[10px] text-muted-foreground mt-1">
              PNG/SVG hasta 2MB · Cuadrado recomendado
            </p>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-lg border border-border/40 p-4">
        <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
          Previsualización
        </div>
        <div
          className="rounded-lg p-4"
          style={{
            background: `${data.branding.colorPrimario}10`,
            border: `1px solid ${data.branding.colorPrimario}40`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center font-display font-medium"
              style={{ background: data.branding.colorPrimario, color: "#0A0F0E" }}
            >
              {data.nombre.slice(0, 2).toUpperCase() || "?"}
            </div>
            <div>
              <div className="font-display text-lg" style={{ color: data.branding.colorPrimario }}>
                {data.nombre || "Tu restaurante"}
              </div>
              <div className="text-xs text-muted-foreground">
                {data.branding.tagline || "Tu eslogan aquí"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Step: Redes
 * =======================================================*/
function StepRedes({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
}) {
  function updateRedes(patch: Partial<OnboardingData["redes"]>) {
    onChange({ redes: { ...data.redes, ...patch } });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Conecta tus redes sociales. Las usaremos para respuestas automáticas y
        campañas cross-canal.
      </p>
      <div className="space-y-2">
        <RedRow
          icon={Instagram}
          label="Instagram"
          placeholder="@tucuenta"
          value={data.redes.instagram}
          onChange={(v) => updateRedes({ instagram: v })}
          tone="violet"
        />
        <RedRow
          icon={Facebook}
          label="Facebook"
          placeholder="facebook.com/tupagina"
          value={data.redes.facebook}
          onChange={(v) => updateRedes({ facebook: v })}
          tone="blue"
        />
        <RedRow
          icon={MapPin}
          label="Google Business Profile"
          placeholder="Claimed / pendiente"
          value={data.redes.google}
          onChange={(v) => updateRedes({ google: v })}
          tone="emerald"
        />
        <RedRow
          icon={Globe}
          label="Web"
          placeholder="tucuenta.com"
          value={data.redes.website}
          onChange={(v) => updateRedes({ website: v })}
          tone="yellow"
        />
      </div>

      <div className="rounded-lg border border-[var(--rp-violet)]/30 bg-[var(--rp-violet)]/5 p-3">
        <div className="flex items-center gap-2 mb-2">
          <BrainCircuit className="h-4 w-4 text-[var(--rp-violet-soft)]" />
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--rp-violet-soft)]">
            Automatizaciones sugeridas
          </span>
        </div>
        <ul className="text-xs space-y-1.5 text-muted-foreground">
          <li className="flex items-start gap-2">
            <Sparkles className="h-3 w-3 text-[var(--rp-emerald-soft)] mt-0.5 shrink-0" />
            <span>Respuesta automática a DMs de Instagram en horario laboral</span>
          </li>
          <li className="flex items-start gap-2">
            <Sparkles className="h-3 w-3 text-[var(--rp-emerald-soft)] mt-0.5 shrink-0" />
            <span>Responder reseñas Google en &lt; 24h con IA + plantillas</span>
          </li>
          <li className="flex items-start gap-2">
            <Sparkles className="h-3 w-3 text-[var(--rp-emerald-soft)] mt-0.5 shrink-0" />
            <span>Cross-posting de ofertas a FB + Instagram</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function RedRow({
  icon: Icon,
  label,
  placeholder,
  value,
  onChange,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  tone: "violet" | "blue" | "emerald" | "yellow";
}) {
  const toneCls = {
    violet: "text-[var(--rp-violet-soft)]",
    blue: "text-[var(--rp-blue-soft)]",
    emerald: "text-[var(--rp-emerald-soft)]",
    yellow: "text-[var(--rp-yellow-soft)]",
  }[tone];
  return (
    <div className="grid grid-cols-12 gap-2 items-center py-1.5">
      <div className={cn("col-span-3 sm:col-span-2 flex items-center gap-1.5", toneCls)}>
        <Icon className="h-4 w-4" />
        <span className="text-xs hidden sm:inline">{label}</span>
      </div>
      <div className="col-span-9 sm:col-span-10">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-background/40"
        />
      </div>
    </div>
  );
}

/* =========================================================
 * AI suggestions panel
 * =======================================================*/
function AISuggestionsPanel({
  data,
  stepId,
}: {
  data: OnboardingData;
  stepId: StepId;
}) {
  const suggestions = React.useMemo(() => {
    const out: { icon: React.ElementType; title: string; desc: string; tone: "emerald" | "violet" | "blue" | "yellow" }[] = [];
    // Plano de mesas
    out.push({
      icon: LayoutGrid,
      title: "Plano de mesas",
      desc: `Generado con ${data.zonas.length} zonas y ${data.zonas.reduce((s, z) => s + z.mesas, 0)} mesas`,
      tone: "emerald",
    });
    // Catálogo de carta
    if (data.carta.estado === "ok") {
      out.push({
        icon: FileText,
        title: "Catálogo de carta",
        desc: `${data.carta.productos.length} productos importados`,
        tone: "blue",
      });
    }
    // QR
    out.push({
      icon: QrCode,
      title: "QR de carta digital",
      desc: "URL dinámica + analytics por mesa",
      tone: "violet",
    });
    // Automatizaciones
    out.push({
      icon: Zap,
      title: "3 automatizaciones",
      desc: "Recordatorio reserva, cumpleaños, inactividad",
      tone: "yellow",
    });
    // Sellos
    out.push({
      icon: Award,
      title: "Programa de sellos",
      desc: "Plantilla: 10 visitas = bebida gratis",
      tone: "emerald",
    });
    // Web
    if (data.redes.website) {
      out.push({
        icon: Globe,
        title: "Web one-pager",
        desc: `Generada en ${data.redes.website}`,
        tone: "blue",
      });
    }
    return out;
  }, [data]);

  const toneCls = {
    emerald: "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]",
    violet: "border-[var(--rp-violet)]/40 bg-[var(--rp-violet)]/10 text-[var(--rp-violet-soft)]",
    blue: "border-[var(--rp-blue)]/40 bg-[var(--rp-blue)]/10 text-[var(--rp-blue-soft)]",
    yellow: "border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow-soft)]",
  };

  return (
    <div className="rp-glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--rp-violet-soft)]" />
          <h3 className="text-sm font-semibold">Sugerencias IA</h3>
        </div>
        <Badge variant="outline" className="text-[10px]">
          {suggestions.length}
        </Badge>
      </div>
      <Separator className="mb-3" />
      <div className="space-y-2">
        {suggestions.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={`sug-${i}`}
              className={cn("rounded-lg border p-2.5", toneCls[s.tone])}
            >
              <div className="flex items-start gap-2">
                <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{s.title}</div>
                  <div className="text-[11px] opacity-80">{s.desc}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-border/40 text-[10px] text-muted-foreground">
        Actualizado según paso: <span className="font-mono">{stepId}</span>
      </div>
    </div>
  );
}

/* =========================================================
 * Resumen panel
 * =======================================================*/
function ResumenPanel({ data }: { data: OnboardingData }) {
  const totalMesas = data.zonas.reduce((s, z) => s + z.mesas, 0);
  const totalCap = data.zonas.reduce((s, z) => s + z.capacidad, 0);
  return (
    <div className="rp-glass rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <ClipboardCheck className="h-4 w-4 text-[var(--rp-emerald)]" />
        <h3 className="text-sm font-semibold">Resumen actual</h3>
      </div>
      <Separator className="mb-3" />
      <div className="space-y-2 text-xs">
        <ResumenRow label="Nombre" value={data.nombre || "—"} />
        <ResumenRow label="Tipo" value={TIPOS_LOCAL.find((t) => t.id === data.tipo)?.label ?? data.tipo} />
        <ResumenRow label="Ciudad" value={data.ciudad} />
        <ResumenRow label="Mesas" value={`${totalMesas} (${totalCap} pax)`} />
        <ResumenRow label="Zonas" value={data.zonas.map((z) => z.nombre).join(", ")} />
        <ResumenRow
          label="Horarios"
          value={`${data.horarios.filter((h) => h.abierto).length}/7 días abiertos`}
        />
        <ResumenRow
          label="Carta"
          value={
            data.carta.estado === "ok"
              ? `${data.carta.productos.length} productos`
              : data.carta.estado === "analizando"
                ? "Analizando..."
                : "Pendiente"
          }
        />
        <ResumenRow
          label="Branding"
          value={
            <span className="flex items-center gap-1.5">
              <span
                className="h-3 w-3 rounded"
                style={{ background: data.branding.colorPrimario }}
              />
              {TIPOGRAFIAS.find((t) => t.id === data.branding.tipografia)?.label}
            </span>
          }
        />
        <ResumenRow
          label="Redes"
          value={[
            data.redes.instagram && "IG",
            data.redes.facebook && "FB",
            data.redes.google && "G",
            data.redes.website && "Web",
          ].filter(Boolean).join(" · ") || "—"}
        />
      </div>
    </div>
  );
}

function ResumenRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right truncate max-w-[180px]">{value}</span>
    </div>
  );
}

/* =========================================================
 * Final dialog
 * =======================================================*/
function FinalDialog({
  open,
  onOpenChange,
  data,
  onRestart,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  data: OnboardingData;
  onRestart: () => void;
}) {
  const checklist = [
    { label: "Perfil del local configurado", ok: !!data.nombre },
    { label: "Plano de mesas generado", ok: data.zonas.length > 0 },
    { label: "Horarios establecidos", ok: data.horarios.some((h) => h.abierto) },
    { label: "Carta digital creada", ok: data.carta.estado === "ok" },
    { label: "Branding aplicado", ok: !!data.branding.colorPrimario },
    { label: "Redes conectadas", ok: !!(data.redes.instagram || data.redes.google) },
    { label: "QR de carta generado", ok: !!data.nombre },
    { label: "Automatizaciones activadas (3)", ok: !!data.nombre },
    { label: "Programa de sellos creado", ok: !!data.nombre },
  ];
  const completed = checklist.filter((c) => c.ok).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rp-glass-strong max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-[var(--rp-emerald)]/15 text-[var(--rp-emerald-soft)] flex items-center justify-center">
              <PartyPopper className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle>Onboarding completado</DialogTitle>
              <DialogDescription>
                {data.nombre} está listo para operar. {completed}/{checklist.length} elementos listos.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Final preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto rp-scroll-thin py-2">
          {/* Plano */}
          <PreviewCard icon={LayoutGrid} title="Plano de mesas" tone="emerald">
            <div className="grid grid-cols-4 gap-1 mt-2">
              {Array.from({ length: Math.min(12, data.zonas.reduce((s, z) => s + z.mesas, 0)) }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded border border-[var(--rp-emerald)]/30 bg-[var(--rp-emerald)]/5 flex items-center justify-center text-[9px] font-mono text-[var(--rp-emerald-soft)]"
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </PreviewCard>

          {/* Carta digital */}
          <PreviewCard icon={FileText} title="Carta digital" tone="blue">
            <div className="text-xs text-muted-foreground mt-1">
              {data.carta.productos.length} productos · {Array.from(new Set(data.carta.productos.map((p) => p.categoria))).length} categorías
            </div>
            <div className="mt-2 space-y-0.5">
              {data.carta.productos.slice(0, 4).map((p) => (
                <div key={p.id} className="flex justify-between text-[11px]">
                  <span className="truncate">{p.nombre}</span>
                  <span className="font-mono">{euro(p.precio)}</span>
                </div>
              ))}
            </div>
          </PreviewCard>

          {/* QR */}
          <PreviewCard icon={QrCode} title="QR de carta" tone="violet">
            <div className="flex items-center gap-3 mt-2">
              <div className="h-16 w-16 rounded-lg border-2 border-[var(--rp-violet)]/40 bg-[var(--rp-violet)]/5 grid grid-cols-6 gap-px p-1.5">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-sm",
                      (i * 7 + 3) % 3 === 0 && "bg-[var(--rp-violet)]"
                    )}
                  />
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                Escanea para ver la carta
                <div className="font-mono text-[10px] mt-1 text-[var(--rp-violet-soft)]">
                  restopanel.app/{data.nombre.toLowerCase().replace(/\s+/g, "-").slice(0, 12) || "qr"}
                </div>
              </div>
            </div>
          </PreviewCard>

          {/* Web */}
          <PreviewCard icon={Globe} title="Web one-pager" tone="yellow">
            <div
              className="rounded-lg p-3 mt-2"
              style={{
                background: `${data.branding.colorPrimario}10`,
                border: `1px solid ${data.branding.colorPrimario}40`,
              }}
            >
              <div className="font-display text-sm" style={{ color: data.branding.colorPrimario }}>
                {data.nombre || "Tu restaurante"}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {data.ciudad} · {TIPOS_LOCAL.find((t) => t.id === data.tipo)?.label}
              </div>
            </div>
          </PreviewCard>

          {/* Automatizaciones */}
          <PreviewCard icon={Zap} title="Automatizaciones (3)" tone="emerald">
            <ul className="text-xs space-y-1 mt-2 text-muted-foreground">
              <li>· Recordatorio 24h antes de la reserva</li>
              <li>· Cumpleaños del cliente</li>
              <li>· Cliente inactivo 60 días</li>
            </ul>
          </PreviewCard>

          {/* Sellos */}
          <PreviewCard icon={Award} title="Programa de sellos" tone="violet">
            <div className="grid grid-cols-5 gap-1 mt-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "aspect-square rounded-full flex items-center justify-center",
                    i < 3
                      ? "bg-[var(--rp-violet)]/20 text-[var(--rp-violet-soft)]"
                      : "border border-dashed border-border/40"
                  )}
                >
                  {i < 3 && <Star className="h-3 w-3" />}
                </div>
              ))}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              3/10 sellos · Premio: bebida gratis
            </div>
          </PreviewCard>
        </div>

        {/* Checklist */}
        <div className="rounded-lg border border-border/40 p-3">
          <div className="flex items-center gap-2 mb-2">
            <ListChecks className="h-4 w-4 text-[var(--rp-emerald)]" />
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Checklist final
            </span>
            <Badge variant="outline" className="ml-auto text-[10px]">
              {completed}/{checklist.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {checklist.map((c, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2 text-xs py-1",
                  c.ok ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {c.ok ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--rp-emerald)] shrink-0" />
                ) : (
                  <div className="h-3.5 w-3.5 rounded-full border border-border/60 shrink-0" />
                )}
                {c.label}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onRestart}>
            Empezar de nuevo
          </Button>
          <Button
            className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
            onClick={() => onOpenChange(false)}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" /> Ir al dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PreviewCard({
  icon: Icon,
  title,
  tone,
  children,
}: {
  icon: React.ElementType;
  title: string;
  tone: "emerald" | "violet" | "blue" | "yellow";
  children: React.ReactNode;
}) {
  const toneCls = {
    emerald: "text-[var(--rp-emerald-soft)]",
    violet: "text-[var(--rp-violet-soft)]",
    blue: "text-[var(--rp-blue-soft)]",
    yellow: "text-[var(--rp-yellow-soft)]",
  }[tone];
  return (
    <div className="rounded-lg border border-border/40 p-3">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", toneCls)} />
        <span className="text-xs font-medium">{title}</span>
      </div>
      {children}
    </div>
  );
}
