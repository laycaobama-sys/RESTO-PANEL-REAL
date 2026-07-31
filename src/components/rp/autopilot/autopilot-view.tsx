"use client";

/* ============================================================================
 * RestoPanel · Autopilot
 * El sistema "listo para operar": después del pago, el restaurante queda
 * completamente provisionado en 21 pasos. Wizard de 8 pasos para configurar,
 * 5 presets por tipo de negocio y panel de mantenimiento automático.
 * ========================================================================== */

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
  CheckCircle2, Circle, Sparkles, Rocket, Clock, ShieldCheck,
  Building2, Palette, MapPin, CalendarClock, FileText, Users,
  Settings2, Gift, ClipboardCheck, Zap, Wrench, Database,
  RefreshCw, Lock, Upload, Image as ImageIcon, Plus, Trash2,
  Store, Bike, ChefHat, Hotel, Utensils, Star, ArrowRight,
  ArrowLeft, PartyPopper, AlertCircle, Bell, FileCheck2,
  ShieldAlert, Server, Activity, Boxes, Brain, Wifi,
  Sun, Moon, Loader2,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type Section = "pipeline" | "wizard" | "presets" | "maintenance";

interface PipelineStep {
  id: number;
  label: string;
  group: "estructura" | "datos" | "operativa" | "onboarding";
}

interface WizardStepMeta {
  id: WizardStepId;
  label: string;
  icon: React.ElementType;
  short: string;
}

type WizardStepId =
  | "identidad"
  | "local"
  | "horarios"
  | "carta"
  | "equipo"
  | "operativa"
  | "fidelizacion"
  | "prueba";

interface Preset {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  modules: string[];
  tone: "emerald" | "yellow" | "blue" | "violet" | "red";
}

interface MaintenanceItem {
  id: string;
  label: string;
  status: "activo" | "requiere" | "proximo";
  detail: string;
}

interface EmployeeDraft {
  id: string;
  nombre: string;
  apellidos: string;
  puesto: string;
  email: string;
  telefono: string;
  codigo: string;
  pin: string;
  rol: string;
}

interface CartaRow {
  id: string;
  categoria: string;
  producto: string;
  precio: number;
  alergenos: string[];
}

interface OperativaFlag {
  id: string;
  label: string;
  hint: string;
  active: boolean;
}

interface FidelizacionFlag {
  id: string;
  label: string;
  active: boolean;
}

/* =========================================================
 * Static data
 * =======================================================*/
const PIPELINE_STEPS: PipelineStep[] = [
  { id: 1,  label: "Organización creada",            group: "estructura" },
  { id: 2,  label: "Marca creada",                   group: "estructura" },
  { id: 3,  label: "Local creado",                   group: "estructura" },
  { id: 4,  label: "Roles base creados",             group: "estructura" },
  { id: 5,  label: "Permisos configurados",          group: "estructura" },
  { id: 6,  label: "Dashboard del plan creado",      group: "estructura" },
  { id: 7,  label: "Configuración regional",         group: "datos" },
  { id: 8,  label: "Zonas y mesas iniciales",        group: "datos" },
  { id: 9,  label: "Carta editable",                 group: "datos" },
  { id: 10, label: "TPV creado",                     group: "datos" },
  { id: 11, label: "PDA creada",                     group: "datos" },
  { id: 12, label: "KDS creado",                     group: "datos" },
  { id: 13, label: "Reservas activadas",             group: "operativa" },
  { id: 14, label: "CRM inicializado",               group: "operativa" },
  { id: 15, label: "Fidelización configurada",       group: "operativa" },
  { id: 16, label: "Analíticas activadas",           group: "operativa" },
  { id: 17, label: "Automatizaciones iniciales",     group: "operativa" },
  { id: 18, label: "Fichaje activado",               group: "operativa" },
  { id: 19, label: "Empleados (espacio)",            group: "operativa" },
  { id: 20, label: "Email de bienvenida enviado",    group: "onboarding" },
  { id: 21, label: "Onboarding guiado abierto",      group: "onboarding" },
];

const PIPELINE_GROUP_META: Record<
  PipelineStep["group"],
  { label: string; tone: string; dot: string }
> = {
  estructura: { label: "Estructura", tone: "text-[var(--rp-emerald-soft)]", dot: "bg-[var(--rp-emerald)]" },
  datos: { label: "Datos base", tone: "text-[var(--rp-blue-soft)]", dot: "bg-[var(--rp-blue)]" },
  operativa: { label: "Operativa", tone: "text-[var(--rp-violet-soft)]", dot: "bg-[var(--rp-violet)]" },
  onboarding: { label: "Onboarding", tone: "text-[var(--rp-yellow-soft)]", dot: "bg-[var(--rp-yellow)]" },
};

const WIZARD_STEPS: WizardStepMeta[] = [
  { id: "identidad",    label: "Identidad",                icon: Palette,      short: "Marca" },
  { id: "local",        label: "Local y zonas",            icon: MapPin,       short: "Local" },
  { id: "horarios",     label: "Horarios",                 icon: CalendarClock,short: "Horarios" },
  { id: "carta",        label: "Carta",                    icon: FileText,     short: "Carta" },
  { id: "equipo",       label: "Equipo",                   icon: Users,        short: "Equipo" },
  { id: "operativa",    label: "Operativa",                icon: Settings2,    short: "Operativa" },
  { id: "fidelizacion", label: "Fidelización y marketing", icon: Gift,         short: "Marketing" },
  { id: "prueba",       label: "Prueba completa",          icon: ClipboardCheck, short: "Prueba" },
];

const PRESETS: Preset[] = [
  {
    id: "sala",
    name: "Restaurante con Sala",
    icon: Utensils,
    description: "Servicio en sala con reservas, plano de mesas y experiencia completa.",
    modules: [
      "Reservas", "Plano mesas", "PDA", "TPV", "KDS",
      "Turnos", "CRM", "Fidelización", "Analítica",
    ],
    tone: "emerald",
  },
  {
    id: "bar",
    name: "Bar o Cafetería",
    icon: Store,
    description: "Venta rápida en barra y take away. Cobro inmediato y comanda simplificada.",
    modules: [
      "FastMode", "Venta rápida", "Barra", "Take away",
      "Cobro inmediato", "Comanda simplificada", "KDS rápido",
      "Apertura automática de cuenta",
    ],
    tone: "yellow",
  },
  {
    id: "delivery",
    name: "Delivery",
    icon: Bike,
    description: "Pedidos online con agregadores o flota propia. Zonas y tiempos por canal.",
    modules: [
      "Pedidos online", "Agregadores", "Delivery propio",
      "KDS", "Repartidores", "Zonas", "Tiempos", "Stock por canal",
    ],
    tone: "blue",
  },
  {
    id: "darkkitchen",
    name: "Dark Kitchen",
    icon: ChefHat,
    description: "Varias marcas virtuales con una sola cocina y catálogos separados.",
    modules: [
      "Varias marcas virtuales", "Una cocina central",
      "Catálogos separados", "Producción unificada",
      "Pedidos por plataforma", "Rentabilidad por marca", "Stock compartido",
    ],
    tone: "violet",
  },
  {
    id: "grupo",
    name: "Hotel o Grupo",
    icon: Hotel,
    description: "Multi-local con carta central, permisos por local e informes consolidados.",
    modules: [
      "Multi-local", "Carta central", "Permisos por local",
      "Informes consolidados", "Facturación central", "Roles corporativos",
    ],
    tone: "red",
  },
];

const MAINTENANCE_ITEMS: MaintenanceItem[] = [
  { id: "updates",    label: "Actualizaciones de software",     status: "activo",   detail: "v3.4.2 · auto-aplicada hace 4h" },
  { id: "migrations", label: "Migraciones compatibles",         status: "activo",   detail: "0 pendientes · última 12d" },
  { id: "backups",    label: "Backups",                         status: "activo",   detail: "Diario 03:00 · 30d retención" },
  { id: "security",   label: "Seguridad",                       status: "activo",   detail: "WAF · rate-limit · 0 incidentes" },
  { id: "monitor",    label: "Monitorización",                  status: "activo",   detail: "Uptime 99,98% · p95 142ms" },
  { id: "features",   label: "Nuevas funciones",                status: "requiere", detail: "3 pendientes de revisión" },
  { id: "legal",      label: "Cambios legales",                 status: "proximo",  detail: "RGPD restaurante · en roadmap" },
  { id: "integ",      label: "Mantenimiento integraciones",     status: "activo",   detail: "Glovo · Uber · Just Eat · Stripe OK" },
  { id: "perf",       label: "Optimización rendimiento",        status: "activo",   detail: "Índice SQL · cache 94% hit" },
];

const ROLES_EQUIPO = [
  "Propietario", "Gerente", "Encargado", "Maître", "Camarero",
  "Runner", "Cocinero", "Jefe de cocina", "Barra", "Repartidor", "Solo fichaje",
];

const OPERATIVA_FLAGS_INIT: OperativaFlag[] = [
  { id: "sala",       label: "¿Usa sala?",            hint: "Servicio en mesa con camareros",  active: true },
  { id: "barra",      label: "¿Barra?",               hint: "Venta directa en mostrador",     active: true },
  { id: "takeaway",   label: "¿Take away?",           hint: "Recogida en local",              active: false },
  { id: "delivery",   label: "¿Delivery?",            hint: "Reparto propio o agregadores",   active: false },
  { id: "reservas",   label: "¿Reservas?",            hint: "Acepta reservas online",         active: true },
  { id: "orderpay",   label: "¿Order & Pay?",         hint: "Carta QR con pago en mesa",      active: false },
  { id: "qr",         label: "¿QR?",                  hint: "Carta digital accesible por QR", active: true },
  { id: "kds",        label: "¿KDS?",                 hint: "Cocina con pantallas",           active: true },
  { id: "printer",    label: "¿Impresora?",           hint: "Impresión de comandas y tickets",active: true },
  { id: "dataphone",  label: "¿Datáfono?",            hint: "Cobro con tarjeta físico",       active: true },
  { id: "multibrand", label: "¿Varias marcas?",       hint: "Una cocina, varios catálogos",   active: false },
  { id: "central",    label: "¿Cocina central?",      hint: "Producción centralizada",        active: false },
];

const FIDELIZACION_FLAGS_INIT: FidelizacionFlag[] = [
  { id: "sellos",      label: "Programa de sellos",                 active: true },
  { id: "recompensa",  label: "Recompensa inicial al registrarse",  active: true },
  { id: "segmentos",   label: "Segmentos básicos de clientes",      active: true },
  { id: "bienvenida",  label: "Campaña de bienvenida",              active: true },
  { id: "cumple",      label: "Cumpleaños del cliente",             active: true },
  { id: "inactivo",    label: "Cliente inactivo 30 días",           active: true },
  { id: "postvisita",  label: "Reseña post-visita",                 active: true },
  { id: "noshow",      label: "Recuperación de no-show",            active: false },
  { id: "valle",       label: "Promoción en horas valle",           active: false },
];

const CARTA_PREVIEW: CartaRow[] = [
  { id: "c1", categoria: "Entrantes",   producto: "Croquetas de jamón (6 uds)", precio: 9.50,  alergenos: ["Gluten", "Lactosa"] },
  { id: "c2", categoria: "Entrantes",   producto: "Tartar de atún rojo",        precio: 14.00, alergenos: ["Pescado", "Soja"] },
  { id: "c3", categoria: "Principales", producto: "Risotto de setas",            precio: 16.50, alergenos: ["Lactosa"] },
  { id: "c4", categoria: "Principales", producto: "Secreto ibérico",             precio: 19.90, alergenos: [] },
  { id: "c5", categoria: "Postres",     producto: "Tarta de queso",              precio: 6.50,  alergenos: ["Lactosa", "Huevo"] },
  { id: "c6", categoria: "Bebidas",     producto: "Vino tinto copa",            precio: 4.00,  alergenos: ["Sulfitos"] },
];

const PRUEBA_CHECKLIST = [
  { id: "p1", label: "Crear reserva" },
  { id: "p2", label: "Asignar mesa" },
  { id: "p3", label: "Enviar comanda PDA" },
  { id: "p4", label: "Recibir en KDS" },
  { id: "p5", label: "Marcar listo" },
  { id: "p6", label: "Cobrar ticket" },
  { id: "p7", label: "Aplicar sello de fidelización" },
  { id: "p8", label: "Verificar KPI" },
  { id: "p9", label: "Probar carta QR" },
  { id: "p10", label: "Verificar fichaje" },
  { id: "p11", label: "Verificar permisos" },
];

const BRAND_COLORS = [
  "#10B981", "#F59E0B", "#3B82F6", "#8B5CF6", "#EF4444",
  "#EC4899", "#06B6D4", "#84CC16",
];

const STORAGE_KEY = "rp:autopilot:wizard";

/* =========================================================
 * Helpers
 * =======================================================*/
function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-amber-400/40 bg-amber-400/10 text-amber-300 font-mono uppercase tracking-wider text-[10px]",
        className
      )}
    >
      demo
    </Badge>
  );
}

function genPin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function genCodigo(nombre: string, idx: number): string {
  const base = (nombre || "EMP").slice(0, 3).toUpperCase().padEnd(3, "X");
  return `${base}-${String(idx).padStart(3, "0")}`;
}

function euro(n: number): string {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

/* =========================================================
 * Main view
 * =======================================================*/
export function AutopilotView() {
  const reduce = useReducedMotion();
  const [section, setSection] = React.useState<Section>("pipeline");

  return (
    <div className="space-y-6">
      <Header />

      {/* Section tabs */}
      <div className="relative">
        <div
          className="flex items-center gap-1 overflow-x-auto rp-scroll-thin pb-1 -mb-2"
          role="tablist"
          aria-label="Secciones de Autopilot"
        >
          {([
            { id: "pipeline",    label: "Provisioning",  icon: Rocket },
            { id: "wizard",      label: "Configuración", icon: ClipboardCheck },
            { id: "presets",     label: "Presets",       icon: Sparkles },
            { id: "maintenance", label: "Mantenimiento", icon: Wrench },
          ] as const).map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={section === t.id}
              onClick={() => setSection(t.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors min-h-[40px] border",
                section === t.id
                  ? "bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)] border-[var(--rp-emerald)]/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5 border-transparent"
              )}
            >
              <t.icon className="h-4 w-4" aria-hidden />
              {t.label}
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute left-0 top-0 bottom-1 w-6 bg-gradient-to-r from-background to-transparent" aria-hidden />
        <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-6 bg-gradient-to-l from-background to-transparent" aria-hidden />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={section}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {section === "pipeline"    && <PipelineSection />}
          {section === "wizard"      && <WizardSection />}
          {section === "presets"     && <PresetsSection />}
          {section === "maintenance" && <MaintenanceSection />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
 * Header
 * =======================================================*/
function Header() {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
            Autopilot
          </h1>
          <DemoBadge />
        </div>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          El sistema «listo para operar». Tras el pago, el restaurante queda
          provisionado en 21 pasos. Configura con el wizard, aplica un preset y
          deja el mantenimiento en nuestras manos.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge
          variant="outline"
          className="border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)] text-[10px] uppercase tracking-[0.15em]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--rp-emerald)] mr-1.5 animate-pulse" />
          Operativo
        </Badge>
      </div>
    </header>
  );
}

/* =========================================================
 * Section A: Provisioning pipeline
 * =======================================================*/
function PipelineSection() {
  const reduce = useReducedMotion();
  const [completed, setCompleted] = React.useState<number>(0);
  const [elapsed, setElapsed] = React.useState<number>(0);

  // Animate completion with 300ms stagger (or instant if reduced motion)
  React.useEffect(() => {
    if (reduce) {
      setCompleted(PIPELINE_STEPS.length);
      setElapsed(47);
      return;
    }
    setCompleted(0);
    setElapsed(0);
    let i = 0;
    const start = Date.now();
    const interval = window.setInterval(() => {
      i += 1;
      setCompleted(i);
      setElapsed(Math.round(((Date.now() - start) / 1000) * (47 / PIPELINE_STEPS.length) * i / i));
      if (i >= PIPELINE_STEPS.length) {
        window.clearInterval(interval);
        setElapsed(47);
      }
    }, 300);
    return () => window.clearInterval(interval);
  }, [reduce]);

  // Smooth elapsed counter
  React.useEffect(() => {
    if (reduce) return;
    if (completed >= PIPELINE_STEPS.length) return;
    const start = Date.now();
    const baseElapsed = elapsed;
    const interval = window.setInterval(() => {
      const t = (Date.now() - start) / 1000;
      setElapsed(Math.min(47, Math.round(baseElapsed + t * (47 / PIPELINE_STEPS.length))));
    }, 100);
    return () => window.clearInterval(interval);
  }, [completed, reduce, elapsed]);

  const progress = (completed / PIPELINE_STEPS.length) * 100;
  const isDone = completed >= PIPELINE_STEPS.length;

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "rp-glass rounded-2xl p-5 sm:p-6 border",
          isDone
            ? "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/[0.06]"
            : "border-border/60"
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[var(--rp-emerald)]/15 border border-[var(--rp-emerald)]/40 flex items-center justify-center shrink-0">
              {isDone ? (
                <PartyPopper className="h-6 w-6 text-[var(--rp-emerald-soft)]" />
              ) : (
                <Loader2 className="h-6 w-6 text-[var(--rp-emerald-soft)] animate-spin" />
              )}
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Estado del provisioning
              </div>
              <h2 className="font-display text-xl sm:text-2xl tracking-tight">
                {isDone
                  ? "Tu restaurante está listo para operar"
                  : "Provisionando tu restaurante…"}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {completed}/{PIPELINE_STEPS.length} pasos completados
                {isDone && ` · ${elapsed}s total`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Provisioning completado en
              </div>
              <div className="font-display text-3xl tabular-nums text-[var(--rp-emerald-soft)]">
                {elapsed}s
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Progress
            value={progress}
            className="h-2 bg-foreground/10"
          />
        </div>
      </motion.div>

      {/* Pipeline by group */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {(Object.keys(PIPELINE_GROUP_META) as PipelineStep["group"][]).map((group) => {
          const meta = PIPELINE_GROUP_META[group];
          const steps = PIPELINE_STEPS.filter((s) => s.group === group);
          return (
            <div key={group} className="rp-glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/40">
                <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
                <span className={cn("text-xs font-mono uppercase tracking-wider", meta.tone)}>
                  {meta.label}
                </span>
                <span className="ml-auto text-[10px] font-mono text-muted-foreground">
                  {steps.filter((s) => s.id <= completed).length}/{steps.length}
                </span>
              </div>
              <ul className="space-y-1.5">
                {steps.map((s) => {
                  const done = s.id <= completed;
                  return (
                    <motion.li
                      key={s.id}
                      initial={reduce ? false : { opacity: 0, x: -6 }}
                      animate={{ opacity: done ? 1 : 0.45, x: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      <span className="mt-0.5 shrink-0">
                        {done ? (
                          <motion.span
                            initial={reduce ? false : { scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 380, damping: 18 }}
                          >
                            <CheckCircle2 className="h-4 w-4 text-[var(--rp-emerald-soft)]" />
                          </motion.span>
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground/40" />
                        )}
                      </span>
                      <span className={cn(
                        "leading-snug",
                        done ? "text-foreground" : "text-muted-foreground"
                      )}>
                        <span className="font-mono text-[10px] text-muted-foreground/70 mr-1.5 tabular-nums">
                          {String(s.id).padStart(2, "0")}
                        </span>
                        {s.label}
                      </span>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Final CTA */}
      <div className="rp-glass rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-[var(--rp-emerald-soft)] shrink-0" />
          <div>
            <div className="text-sm font-medium">Provisioning completo y verificado</div>
            <div className="text-xs text-muted-foreground">
              Todos los módulos base están activos. Ahora configura tu operativa.
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          className="border-[var(--rp-emerald)]/40 text-[var(--rp-emerald-soft)] hover:bg-[var(--rp-emerald)]/10 min-h-11"
          onClick={() => {
            // Scroll handled by parent tab change in real app
          }}
        >
          Ir a configuración <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* =========================================================
 * Section B: 8-step wizard
 * =======================================================*/
function WizardSection() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [stepIdx, setStepIdx] = React.useState(0);
  const [identidad, setIdentidad] = React.useState({
    nombreComercial: "Bistró Marisol",
    razonSocial: "Bistró Marisol S.L.",
    cif: "B-12345678",
    color: BRAND_COLORS[0],
    contacto: "+34 93 555 0101",
    instagram: "@bistromarisol",
    descripcion: "Cocina mediterránea de mercado en el corazón del Born.",
  });
  const [local, setLocal] = React.useState({
    nombre: "Bistró Marisol · Born",
    direccion: "Carrer del Comerç 24, 08003 Barcelona",
    mesas: 28,
    capacidad: 64,
    zonas: ["Comedor", "Terraza"] as string[],
  });
  const [horarios, setHorarios] = React.useState({
    general: "13:00–16:00 · 20:00–23:30",
    cocina: "13:30–15:30 · 20:30–23:00",
    reservas: "13:00–15:30 · 20:00–23:00",
    comida: "13:00–16:00",
    cena: "20:00–23:30",
    cerrados: "Domingo noche",
    festivos: "25/12, 01/01, 06/01",
    duracionReserva: 120,
    buffer: 15,
    valle: "15:00–17:00",
  });
  const [carta, setCarta] = React.useState<CartaRow[]>(CARTA_PREVIEW);
  const [equipo, setEquipo] = React.useState<EmployeeDraft[]>([
    { id: "e1", nombre: "Marc", apellidos: "Puig", puesto: "Maître",  email: "marc@marisol.es", telefono: "+34 600 111 222", codigo: "MAR-001", pin: "4821", rol: "Maître" },
    { id: "e2", nombre: "Laia", apellidos: "Font",  puesto: "Camarera", email: "laia@marisol.es",  telefono: "+34 600 333 444", codigo: "LAI-002", pin: "7193", rol: "Camarero" },
  ]);
  const [operativa, setOperativa] = React.useState<OperativaFlag[]>(OPERATIVA_FLAGS_INIT);
  const [fidelizacion, setFidelizacion] = React.useState<FidelizacionFlag[]>(FIDELIZACION_FLAGS_INIT);
  const [pruebaCheck, setPruebaCheck] = React.useState<string[]>([]);
  const [autoGenOpen, setAutoGenOpen] = React.useState(false);
  const [finalOpen, setFinalOpen] = React.useState(false);

  const currentStep = WIZARD_STEPS[stepIdx];
  const stepNumber = stepIdx + 1;

  // Load draft on mount
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as { stepIdx?: number };
        if (typeof data.stepIdx === "number") {
          setStepIdx(data.stepIdx);
        }
      }
    } catch {
      // ignore corrupted draft
    }
  }, []);

  function saveLater() {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ stepIdx, savedAt: new Date().toISOString() })
      );
    } catch {
      // ignore quota errors
    }
    toast({
      title: "Progreso guardado",
      description: "Puedes continuar la configuración más tarde.",
    });
  }

  function next() {
    if (stepIdx < WIZARD_STEPS.length - 1) {
      setStepIdx(stepIdx + 1);
    } else {
      setFinalOpen(true);
    }
  }
  function prev() {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  }
  function gotoStep(i: number) {
    setStepIdx(i);
  }

  const progress = (stepNumber / WIZARD_STEPS.length) * 100;

  return (
    <div className="space-y-5">
      {/* Progress header */}
      <div className="rp-glass rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <currentStep.icon className="h-5 w-5 text-[var(--rp-emerald-soft)] shrink-0" />
            <div className="min-w-0">
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Paso {stepNumber} de {WIZARD_STEPS.length}
              </div>
              <h2 className="font-display text-lg sm:text-xl tracking-tight truncate">
                {currentStep.label}
              </h2>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground min-h-9"
            onClick={saveLater}
          >
            <Clock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Continuar más tarde</span>
            <span className="sm:hidden">Guardar</span>
          </Button>
        </div>
        <Progress value={progress} className="h-1.5 bg-foreground/10" />
        {/* Step pills — clickable on desktop */}
        <div className="hidden lg:flex items-center gap-1.5 mt-3 overflow-x-auto rp-scroll-thin">
          {WIZARD_STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === stepIdx;
            const isDone = i < stepIdx;
            return (
              <button
                key={s.id}
                onClick={() => gotoStep(i)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs border transition-colors whitespace-nowrap",
                  isActive
                    ? "border-[var(--rp-emerald)]/50 bg-[var(--rp-emerald)]/15 text-[var(--rp-emerald-soft)]"
                    : isDone
                      ? "border-[var(--rp-emerald)]/30 text-[var(--rp-emerald-soft)] hover:bg-[var(--rp-emerald)]/10"
                      : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <Icon className="h-3 w-3" />
                )}
                {s.short}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="rp-glass rounded-2xl p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={reduce ? false : { opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {currentStep.id === "identidad" && (
              <StepIdentidad data={identidad} onChange={setIdentidad} />
            )}
            {currentStep.id === "local" && (
              <StepLocal data={local} onChange={setLocal} />
            )}
            {currentStep.id === "horarios" && (
              <StepHorarios data={horarios} onChange={setHorarios} />
            )}
            {currentStep.id === "carta" && (
              <StepCarta rows={carta} onChange={setCarta} onAutoGen={() => setAutoGenOpen(true)} />
            )}
            {currentStep.id === "equipo" && (
              <StepEquipo equipo={equipo} setEquipo={setEquipo} />
            )}
            {currentStep.id === "operativa" && (
              <StepOperativa flags={operativa} setFlags={setOperativa} />
            )}
            {currentStep.id === "fidelizacion" && (
              <StepFidelizacion flags={fidelizacion} setFlags={setFidelizacion} />
            )}
            {currentStep.id === "prueba" && (
              <StepPrueba checked={pruebaCheck} setChecked={setPruebaCheck} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer nav */}
        <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between gap-2">
          <Button
            variant="outline"
            className="min-h-11"
            onClick={prev}
            disabled={stepIdx === 0}
          >
            <ArrowLeft className="h-4 w-4" /> Anterior
          </Button>
          <div className="text-[11px] font-mono text-muted-foreground tabular-nums hidden sm:block">
            {stepNumber} / {WIZARD_STEPS.length}
          </div>
          <Button
            className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)] min-h-11"
            onClick={next}
          >
            {stepIdx === WIZARD_STEPS.length - 1 ? (
              <>
                <PartyPopper className="h-4 w-4" /> Finalizar
              </>
            ) : (
              <>
                Continuar <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      <AutoGenDialog open={autoGenOpen} onOpenChange={setAutoGenOpen} />
      <FinalDialog open={finalOpen} onOpenChange={setFinalOpen} />
    </div>
  );
}

/* ---------- Step components ---------- */

function StepIdentidad({
  data,
  onChange,
}: {
  data: {
    nombreComercial: string;
    razonSocial: string;
    cif: string;
    color: string;
    contacto: string;
    instagram: string;
    descripcion: string;
  };
  onChange: (next: typeof data) => void;
}) {
  function update<K extends keyof typeof data>(k: K, v: (typeof data)[K]) {
    onChange({ ...data, [k]: v });
  }
  return (
    <div className="space-y-4">
      <StepIntro
        title="Identidad de tu marca"
        desc="Nombre comercial, razón social, CIF, logo, color y descripción. Se aplica a TPV, carta digital, web y emails."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nombre comercial">
          <Input
            value={data.nombreComercial}
            onChange={(e) => update("nombreComercial", e.target.value)}
            className="bg-input/30 min-h-11"
          />
        </Field>
        <Field label="Razón social">
          <Input
            value={data.razonSocial}
            onChange={(e) => update("razonSocial", e.target.value)}
            className="bg-input/30 min-h-11"
          />
        </Field>
        <Field label="CIF / NIF">
          <Input
            value={data.cif}
            onChange={(e) => update("cif", e.target.value)}
            className="bg-input/30 min-h-11 font-mono"
          />
        </Field>
        <Field label="Teléfono de contacto">
          <Input
            value={data.contacto}
            onChange={(e) => update("contacto", e.target.value)}
            className="bg-input/30 min-h-11 font-mono"
          />
        </Field>
      </div>

      <Field label="Descripción (se usa en SEO, Google Business y carta digital)">
        <Textarea
          value={data.descripcion}
          onChange={(e) => update("descripcion", e.target.value)}
          className="bg-input/30 min-h-[80px] resize-none"
          rows={3}
        />
      </Field>

      <Field label="Logo">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 rounded-xl border-2 border-dashed border-border/60 bg-foreground/[0.03] flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-muted-foreground/60" />
          </div>
          <Button variant="outline" className="min-h-11" type="button">
            <Upload className="h-4 w-4" /> Subir logo
          </Button>
          <span className="text-[11px] text-muted-foreground">PNG/SVG · máx 2MB</span>
        </div>
      </Field>

      <Field label="Color de marca">
        <div className="flex items-center gap-2 flex-wrap">
          {BRAND_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => update("color", c)}
              aria-label={`Color ${c}`}
              className={cn(
                "h-9 w-9 rounded-full border-2 transition-transform",
                data.color === c
                  ? "border-foreground scale-110"
                  : "border-transparent hover:scale-105"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
          <div className="flex items-center gap-1.5 ml-1">
            <input
              type="color"
              value={data.color}
              onChange={(e) => update("color", e.target.value)}
              className="h-9 w-12 rounded-md bg-transparent border border-border/60 cursor-pointer"
              aria-label="Selector de color personalizado"
            />
            <span className="font-mono text-xs text-muted-foreground tabular-nums">{data.color}</span>
          </div>
        </div>
      </Field>

      <Field label="Instagram (y otras redes)">
        <Input
          value={data.instagram}
          onChange={(e) => update("instagram", e.target.value)}
          className="bg-input/30 min-h-11"
          placeholder="@tucuenta"
        />
      </Field>

      {/* Live preview */}
      <div className="rounded-xl border border-border/40 bg-foreground/[0.02] p-4">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          Vista previa en carta digital
        </div>
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center font-display text-lg font-bold"
            style={{
              backgroundColor: `${data.color}20`,
              color: data.color,
              border: `1px solid ${data.color}55`,
            }}
          >
            {data.nombreComercial.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="font-display text-base" style={{ color: data.color }}>
              {data.nombreComercial || "Tu marca"}
            </div>
            <div className="text-xs text-muted-foreground">{data.descripcion}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepLocal({
  data,
  onChange,
}: {
  data: {
    nombre: string;
    direccion: string;
    mesas: number;
    capacidad: number;
    zonas: string[];
  };
  onChange: (next: typeof data) => void;
}) {
  const allZonas = ["Comedor", "Terraza", "Barra", "Reservado", "VIP", "Delivery", "Take away"];
  function toggleZona(z: string) {
    const has = data.zonas.includes(z);
    onChange({
      ...data,
      zonas: has ? data.zonas.filter((x) => x !== z) : [...data.zonas, z],
    });
  }
  return (
    <div className="space-y-4">
      <StepIntro
        title="Local y zonas"
        desc="Dirección, capacidad inicial y zonas de servicio. El plano de mesas se genera automáticamente."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nombre del local">
          <Input
            value={data.nombre}
            onChange={(e) => onChange({ ...data, nombre: e.target.value })}
            className="bg-input/30 min-h-11"
          />
        </Field>
        <Field label="Dirección">
          <Input
            value={data.direccion}
            onChange={(e) => onChange({ ...data, direccion: e.target.value })}
            className="bg-input/30 min-h-11"
          />
        </Field>
        <Field label="Nº de mesas">
          <Input
            type="number"
            value={data.mesas}
            onChange={(e) => onChange({ ...data, mesas: Number(e.target.value) || 0 })}
            className="bg-input/30 min-h-11 tabular-nums"
          />
        </Field>
        <Field label="Capacidad (comensales)">
          <Input
            type="number"
            value={data.capacidad}
            onChange={(e) => onChange({ ...data, capacidad: Number(e.target.value) || 0 })}
            className="bg-input/30 min-h-11 tabular-nums"
          />
        </Field>
      </div>

      <Field label="Zonas activas">
        <div className="flex flex-wrap gap-2">
          {allZonas.map((z) => {
            const active = data.zonas.includes(z);
            return (
              <button
                key={z}
                type="button"
                onClick={() => toggleZona(z)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm border transition-colors min-h-9",
                  active
                    ? "border-[var(--rp-emerald)]/50 bg-[var(--rp-emerald)]/15 text-[var(--rp-emerald-soft)]"
                    : "border-border/60 text-muted-foreground hover:text-foreground"
                )}
              >
                {z}
              </button>
            );
          })}
        </div>
      </Field>

      {/* Auto floor preview */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          Plano automático inicial — drag &amp; drop disponible en editor
        </div>
        <div className="rounded-xl border border-border/40 bg-foreground/[0.02] p-3">
          <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
            {Array.from({ length: Math.min(data.mesas, 28) }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-md border border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 flex items-center justify-center text-[10px] font-mono text-[var(--rp-emerald-soft)] cursor-grab active:cursor-grabbing"
                draggable
              >
                M{i + 1}
              </div>
            ))}
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            {data.mesas} mesas distribuidas en {data.zonas.length} zonas · plano editable
            posteriormente.
          </div>
        </div>
      </div>
    </div>
  );
}

function StepHorarios({
  data,
  onChange,
}: {
  data: {
    general: string;
    cocina: string;
    reservas: string;
    comida: string;
    cena: string;
    cerrados: string;
    festivos: string;
    duracionReserva: number;
    buffer: number;
    valle: string;
  };
  onChange: (next: typeof data) => void;
}) {
  function update<K extends keyof typeof data>(k: K, v: (typeof data)[K]) {
    onChange({ ...data, [k]: v });
  }
  return (
    <div className="space-y-4">
      <StepIntro
        title="Horarios y turnos"
        desc="Horario general, de cocina y de reservas. Define días cerrados, festivos, duración de reserva y buffer entre servicios."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Horario general">
          <Input value={data.general} onChange={(e) => update("general", e.target.value)} className="bg-input/30 min-h-11 font-mono" />
        </Field>
        <Field label="Horario de cocina">
          <Input value={data.cocina} onChange={(e) => update("cocina", e.target.value)} className="bg-input/30 min-h-11 font-mono" />
        </Field>
        <Field label="Ventana de reservas">
          <Input value={data.reservas} onChange={(e) => update("reservas", e.target.value)} className="bg-input/30 min-h-11 font-mono" />
        </Field>
        <Field label="Turno comida">
          <Input value={data.comida} onChange={(e) => update("comida", e.target.value)} className="bg-input/30 min-h-11 font-mono" />
        </Field>
        <Field label="Turno cena">
          <Input value={data.cena} onChange={(e) => update("cena", e.target.value)} className="bg-input/30 min-h-11 font-mono" />
        </Field>
        <Field label="Días cerrados">
          <Input value={data.cerrados} onChange={(e) => update("cerrados", e.target.value)} className="bg-input/30 min-h-11" />
        </Field>
        <Field label="Festivos">
          <Input value={data.festivos} onChange={(e) => update("festivos", e.target.value)} className="bg-input/30 min-h-11 font-mono" />
        </Field>
        <Field label="Horas valle">
          <Input value={data.valle} onChange={(e) => update("valle", e.target.value)} className="bg-input/30 min-h-11 font-mono" />
        </Field>
        <Field label={`Duración reserva (${data.duracionReserva} min)`}>
          <input
            type="range"
            min={45}
            max={240}
            step={15}
            value={data.duracionReserva}
            onChange={(e) => update("duracionReserva", Number(e.target.value))}
            className="w-full accent-[var(--rp-emerald)]"
          />
        </Field>
        <Field label={`Buffer entre servicios (${data.buffer} min)`}>
          <input
            type="range"
            min={0}
            max={60}
            step={5}
            value={data.buffer}
            onChange={(e) => update("buffer", Number(e.target.value))}
            className="w-full accent-[var(--rp-emerald)]"
          />
        </Field>
      </div>
      <div className="rounded-md border border-[var(--rp-blue)]/30 bg-[var(--rp-blue)]/[0.06] p-3 text-xs text-[var(--rp-blue-soft)] flex items-start gap-2">
        <Sun className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          Las <strong>horas valle</strong> activarán automáticamente promociones de
          relleno y sugerencias de yield pricing en Reservas.
        </span>
      </div>
    </div>
  );
}

function StepCarta({
  rows,
  onChange,
  onAutoGen,
}: {
  rows: CartaRow[];
  onChange: (next: CartaRow[]) => void;
  onAutoGen: () => void;
}) {
  const importOptions = [
    { id: "excel",  label: "Excel",   icon: FileText },
    { id: "csv",    label: "CSV",     icon: FileText },
    { id: "pdf",    label: "PDF",     icon: FileText },
    { id: "img",    label: "Imagen",  icon: ImageIcon },
    { id: "url",    label: "URL",     icon: Upload },
    { id: "manual", label: "Manual",  icon: Plus },
  ];
  return (
    <div className="space-y-4">
      <StepIntro
        title="Carta"
        desc="Importa tu carta desde Excel, CSV, PDF, una imagen o una URL. La IA detecta categorías, productos, precios, variantes, modificadores y alérgenos."
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {importOptions.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={onAutoGen}
            className="rounded-lg border border-border/60 bg-foreground/[0.02] p-3 text-left hover:border-[var(--rp-emerald)]/40 hover:bg-[var(--rp-emerald)]/5 transition-colors min-h-[64px]"
          >
            <o.icon className="h-4 w-4 text-[var(--rp-emerald-soft)] mb-1.5" />
            <div className="text-sm font-medium">{o.label}</div>
            <div className="text-[11px] text-muted-foreground">Importar</div>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          Preview · {rows.length} productos detectados
        </div>
        <Button variant="outline" size="sm" className="min-h-9" type="button" onClick={onAutoGen}>
          <Zap className="h-3.5 w-3.5" /> Auto-generar todo
        </Button>
      </div>

      <div className="overflow-x-auto rp-scroll-thin rounded-xl border border-border/40">
        <table className="w-full text-sm min-w-[560px]">
          <thead className="bg-foreground/[0.03] text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-3 py-2">Categoría</th>
              <th className="text-left px-3 py-2">Producto</th>
              <th className="text-right px-3 py-2">Precio</th>
              <th className="text-left px-3 py-2">Alérgenos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-foreground/[0.02]">
                <td className="px-3 py-2 text-muted-foreground">{r.categoria}</td>
                <td className="px-3 py-2 font-medium">{r.producto}</td>
                <td className="px-3 py-2 text-right font-mono tabular-nums">{euro(r.precio)}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {r.alergenos.length === 0 ? (
                      <span className="text-[11px] text-muted-foreground/60">—</span>
                    ) : (
                      r.alergenos.map((a) => (
                        <span
                          key={a}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[var(--rp-yellow)]/30 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow-soft)]"
                        >
                          {a}
                        </span>
                      ))
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-md border border-[var(--rp-emerald)]/30 bg-[var(--rp-emerald)]/[0.06] p-3 text-xs text-[var(--rp-emerald-soft)] flex items-start gap-2">
        <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          Al confirmar, se generan automáticamente: <strong>carta digital + QR + TPV + PDA + KDS + delivery + take away</strong> con los mismos productos.
        </span>
      </div>
    </div>
  );
}

function StepEquipo({
  equipo,
  setEquipo,
}: {
  equipo: EmployeeDraft[];
  setEquipo: React.Dispatch<React.SetStateAction<EmployeeDraft[]>>;
}) {
  const { toast } = useToast();
  const [nuevo, setNuevo] = React.useState<EmployeeDraft | null>(null);

  function addEmp() {
    setNuevo({
      id: `e${Date.now()}`,
      nombre: "",
      apellidos: "",
      puesto: "",
      email: "",
      telefono: "",
      codigo: "",
      pin: genPin(),
      rol: "Camarero",
    });
  }
  function confirmAdd() {
    if (!nuevo) return;
    if (!nuevo.nombre.trim()) {
      toast({ title: "Falta el nombre", description: "El nombre es obligatorio.", variant: "destructive" });
      return;
    }
    const codigo = genCodigo(nuevo.nombre, equipo.length + 1);
    const withCode = { ...nuevo, codigo };
    setEquipo((prev) => [...prev, withCode]);
    setNuevo(null);
    toast({
      title: "Empleado añadido",
      description: `${withCode.nombre} · ${withCode.rol} · PIN ${withCode.pin}`,
    });
  }
  function removeEmp(id: string) {
    setEquipo((prev) => prev.filter((e) => e.id !== id));
  }
  function regenPin(id: string) {
    setEquipo((prev) => prev.map((e) => (e.id === id ? { ...e, pin: genPin() } : e)));
  }

  return (
    <div className="space-y-4">
      <StepIntro
        title="Equipo"
        desc="Añade empleados manualmente o impórtalos. Se generan PIN, QR de fichaje y accesos a PDA/TPV/KDS según el rol."
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)] min-h-11" onClick={addEmp}>
          <Plus className="h-4 w-4" /> Añadir empleado
        </Button>
        <Button type="button" variant="outline" className="min-h-11" onClick={() => toast({ title: "Importar CSV", description: "Demo: abre un diálogo de importación." })}>
          <Upload className="h-4 w-4" /> Importar CSV
        </Button>
      </div>

      {/* Roles palette */}
      <div className="rounded-xl border border-border/40 bg-foreground/[0.02] p-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          Roles disponibles
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ROLES_EQUIPO.map((r) => (
            <span key={r} className="text-[11px] font-mono px-2 py-1 rounded border border-border/60 text-muted-foreground">
              {r}
            </span>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {equipo.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-6">
            Aún no hay empleados. Añade el primero.
          </div>
        )}
        {equipo.map((e) => (
          <div
            key={e.id}
            className="rounded-xl border border-border/40 bg-foreground/[0.02] p-3 flex flex-wrap items-center gap-3"
          >
            <div className="h-9 w-9 rounded-full bg-[var(--rp-emerald)]/15 border border-[var(--rp-emerald)]/30 flex items-center justify-center text-sm font-display text-[var(--rp-emerald-soft)]">
              {e.nombre.slice(0, 1).toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-[140px]">
              <div className="text-sm font-medium">
                {e.nombre} {e.apellidos}
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">
                {e.codigo} · {e.rol}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono px-2 py-1 rounded border border-border/60 text-muted-foreground tabular-nums">
                PIN {e.pin}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => regenPin(e.id)}
                aria-label="Regenerar PIN"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-[var(--rp-red-soft)] hover:text-[var(--rp-red-soft)]"
                onClick={() => removeEmp(e.id)}
                aria-label="Eliminar empleado"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* New employee form */}
      <Dialog open={!!nuevo} onOpenChange={(o) => !o && setNuevo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo empleado</DialogTitle>
            <DialogDescription>
              El PIN y el código se generan automáticamente. Puedes regenerarlos después.
            </DialogDescription>
          </DialogHeader>
          {nuevo && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nombre">
                <Input value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} className="bg-input/30 min-h-11" />
              </Field>
              <Field label="Apellidos">
                <Input value={nuevo.apellidos} onChange={(e) => setNuevo({ ...nuevo, apellidos: e.target.value })} className="bg-input/30 min-h-11" />
              </Field>
              <Field label="Puesto">
                <Input value={nuevo.puesto} onChange={(e) => setNuevo({ ...nuevo, puesto: e.target.value })} className="bg-input/30 min-h-11" />
              </Field>
              <Field label="Rol">
                <Select value={nuevo.rol} onValueChange={(v) => setNuevo({ ...nuevo, rol: v })}>
                  <SelectTrigger className="bg-input/30 min-h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES_EQUIPO.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Email">
                <Input type="email" value={nuevo.email} onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })} className="bg-input/30 min-h-11" />
              </Field>
              <Field label="Teléfono">
                <Input value={nuevo.telefono} onChange={(e) => setNuevo({ ...nuevo, telefono: e.target.value })} className="bg-input/30 min-h-11 font-mono" />
              </Field>
              <Field label="PIN generado">
                <div className="flex items-center gap-2">
                  <span className="font-mono px-3 py-2 rounded border border-[var(--rp-emerald)]/30 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)] tabular-nums min-h-11 flex items-center">
                    {nuevo.pin}
                  </span>
                  <Button type="button" variant="outline" size="sm" className="min-h-11" onClick={() => setNuevo({ ...nuevo, pin: genPin() })}>
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Field>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="min-h-11" onClick={() => setNuevo(null)}>Cancelar</Button>
            <Button className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)] min-h-11" onClick={confirmAdd}>
              Añadir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StepOperativa({
  flags,
  setFlags,
}: {
  flags: OperativaFlag[];
  setFlags: React.Dispatch<React.SetStateAction<OperativaFlag[]>>;
}) {
  function toggle(id: string) {
    setFlags((prev) => prev.map((f) => (f.id === id ? { ...f, active: !f.active } : f)));
  }
  return (
    <div className="space-y-4">
      <StepIntro
        title="Operativa"
        desc="Marca lo que usa tu negocio. Cada casilla activa o desactiva módulos automáticamente."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {flags.map((f) => (
          <label
            key={f.id}
            className={cn(
              "flex items-center justify-between gap-3 rounded-xl border p-3 cursor-pointer transition-colors",
              f.active
                ? "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/[0.06]"
                : "border-border/60 bg-foreground/[0.02] hover:bg-foreground/[0.04]"
            )}
          >
            <div className="min-w-0">
              <div className={cn("text-sm font-medium", f.active && "text-[var(--rp-emerald-soft)]")}>
                {f.label}
              </div>
              <div className="text-[11px] text-muted-foreground">{f.hint}</div>
            </div>
            <Switch checked={f.active} onCheckedChange={() => toggle(f.id)} aria-label={f.label} />
          </label>
        ))}
      </div>
    </div>
  );
}

function StepFidelizacion({
  flags,
  setFlags,
}: {
  flags: FidelizacionFlag[];
  setFlags: React.Dispatch<React.SetStateAction<FidelizacionFlag[]>>;
}) {
  function toggle(id: string) {
    setFlags((prev) => prev.map((f) => (f.id === id ? { ...f, active: !f.active } : f)));
  }
  return (
    <div className="space-y-4">
      <StepIntro
        title="Fidelización y marketing"
        desc="Programa de sellos, segmentos y campañas automáticas. Configura una vez y déjalo correr."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {flags.map((f) => (
          <label
            key={f.id}
            className={cn(
              "flex items-center justify-between gap-3 rounded-xl border p-3 cursor-pointer transition-colors",
              f.active
                ? "border-[var(--rp-violet)]/40 bg-[var(--rp-violet)]/[0.06]"
                : "border-border/60 bg-foreground/[0.02] hover:bg-foreground/[0.04]"
            )}
          >
            <div className="text-sm font-medium flex items-center gap-2">
              <Gift className={cn("h-3.5 w-3.5", f.active ? "text-[var(--rp-violet-soft)]" : "text-muted-foreground")} />
              <span className={f.active ? "text-[var(--rp-violet-soft)]" : ""}>{f.label}</span>
            </div>
            <Switch checked={f.active} onCheckedChange={() => toggle(f.id)} aria-label={f.label} />
          </label>
        ))}
      </div>
      <div className="rounded-md border border-[var(--rp-red)]/30 bg-[var(--rp-red)]/[0.06] p-3 text-xs text-[var(--rp-red-soft)] flex items-start gap-2">
        <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          <strong>Nada se envía sin consentimiento.</strong> Todas las campañas
          requieren opt-in explícito del cliente (RGPD + LOPDGDD).
        </span>
      </div>
    </div>
  );
}

function StepPrueba({
  checked,
  setChecked,
}: {
  checked: string[];
  setChecked: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  function toggle(id: string) {
    setChecked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }
  const allDone = checked.length === PRUEBA_CHECKLIST.length;
  return (
    <div className="space-y-4">
      <StepIntro
        title="Prueba completa"
        desc="Recorre el flujo de extremo a extremo para verificar que todo funciona."
      />
      <ul className="space-y-1.5">
        {PRUEBA_CHECKLIST.map((p, i) => {
          const done = checked.includes(p.id);
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => toggle(p.id)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors min-h-11",
                  done
                    ? "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/[0.06]"
                    : "border-border/60 hover:bg-foreground/[0.03]"
                )}
              >
                <span
                  className={cn(
                    "h-5 w-5 rounded-md border flex items-center justify-center shrink-0",
                    done
                      ? "border-[var(--rp-emerald)] bg-[var(--rp-emerald)] text-black"
                      : "border-border/60"
                  )}
                >
                  {done && <CheckCircle2 className="h-3.5 w-3.5" />}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={cn("text-sm", done && "text-[var(--rp-emerald-soft)] line-through")}>
                  {p.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div
        className={cn(
          "rounded-xl border p-4 flex items-center gap-3 transition-colors",
          allDone
            ? "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/[0.06]"
            : "border-border/40 bg-foreground/[0.02]"
        )}
      >
        <PartyPopper className={cn("h-5 w-5", allDone ? "text-[var(--rp-emerald-soft)]" : "text-muted-foreground")} />
        <div>
          <div className="text-sm font-medium">
            {allDone ? "Tu restaurante está listo para operar." : `Te faltan ${PRUEBA_CHECKLIST.length - checked.length} pasos.`}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {checked.length}/{PRUEBA_CHECKLIST.length} verificados
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Wizard subcomponents ---------- */

function StepIntro({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h3 className="font-display text-lg tracking-tight">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-2xl">{desc}</p>
      <Separator className="mt-3" />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function AutoGenDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { toast } = useToast();
  const [phase, setPhase] = React.useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (!open) {
      setPhase("idle");
      setProgress(0);
      return;
    }
    setPhase("running");
    setProgress(0);
    const interval = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          window.clearInterval(interval);
          setPhase("done");
          return 100;
        }
        return p + 8;
      });
    }, 80);
    return () => window.clearInterval(interval);
  }, [open]);

  const items = [
    "Carta digital + QR",
    "TPV con productos y precios",
    "PDA con categorías y modificadores",
    "KDS con estaciones de cocina",
    "Delivery y take away",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--rp-emerald-soft)]" />
            Auto-generación
          </DialogTitle>
          <DialogDescription>
            Creando carta digital + QR + TPV + PDA + KDS + delivery + take away a partir de los productos detectados.
          </DialogDescription>
        </DialogHeader>

        {phase === "running" && (
          <div className="space-y-3 py-2">
            <Progress value={progress} className="h-2 bg-foreground/10" />
            <div className="text-[11px] font-mono text-muted-foreground tabular-nums">
              {progress}% · generando…
            </div>
          </div>
        )}
        {phase === "done" && (
          <ul className="space-y-1.5 py-2">
            {items.map((it, i) => (
              <motion.li
                key={it}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-2 text-sm"
              >
                <CheckCircle2 className="h-4 w-4 text-[var(--rp-emerald-soft)]" />
                {it}
              </motion.li>
            ))}
          </ul>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            className="min-h-11"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
          <Button
            className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)] min-h-11"
            disabled={phase !== "done"}
            onClick={() => {
              onOpenChange(false);
              toast({
                title: "Módulos generados",
                description: "Carta, TPV, PDA, KDS, delivery y take away listos.",
              });
            }}
          >
            <CheckCircle2 className="h-4 w-4" /> Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FinalDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { toast } = useToast();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PartyPopper className="h-5 w-5 text-[var(--rp-emerald-soft)]" />
            ¡Listo para operar!
          </DialogTitle>
          <DialogDescription>
            Has completado la configuración inicial. Tu restaurante está
            provisionado y verificado.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-[var(--rp-emerald)]/30 bg-[var(--rp-emerald)]/[0.06] p-4 text-sm text-[var(--rp-emerald-soft)]">
          Ya puedes abrir el servicio. Los siguientes pasos recomendados son
          importar tu carta real, invitar al equipo y configurar integraciones.
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className="min-h-11"
            onClick={() => {
              try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
              toast({ title: "Borrador descartado" });
              onOpenChange(false);
            }}
          >
            Descartar borrador
          </Button>
          <Button
            className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)] min-h-11"
            onClick={() => {
              toast({ title: "Configuración guardada", description: "Tu restaurante está listo." });
              onOpenChange(false);
            }}
          >
            <CheckCircle2 className="h-4 w-4" /> Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Section C: Presets
 * =======================================================*/
function PresetsSection() {
  const { toast } = useToast();
  const [applied, setApplied] = React.useState<string | null>(null);
  const [confirmPreset, setConfirmPreset] = React.useState<Preset | null>(null);

  function applyPreset(p: Preset) {
    setConfirmPreset(null);
    setApplied(p.id);
    toast({
      title: `Preset aplicado: ${p.name}`,
      description: `${p.modules.length} módulos activados.`,
    });
  }

  const toneMap: Record<Preset["tone"], { ring: string; icon: string; chip: string }> = {
    emerald: { ring: "border-[var(--rp-emerald)]/40", icon: "text-[var(--rp-emerald-soft)]", chip: "border-[var(--rp-emerald)]/30 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]" },
    yellow:  { ring: "border-[var(--rp-yellow)]/40",  icon: "text-[var(--rp-yellow-soft)]",  chip: "border-[var(--rp-yellow)]/30 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow-soft)]" },
    blue:    { ring: "border-[var(--rp-blue)]/40",    icon: "text-[var(--rp-blue-soft)]",    chip: "border-[var(--rp-blue)]/30 bg-[var(--rp-blue)]/10 text-[var(--rp-blue-soft)]" },
    violet:  { ring: "border-[var(--rp-violet)]/40",  icon: "text-[var(--rp-violet-soft)]",  chip: "border-[var(--rp-violet)]/30 bg-[var(--rp-violet)]/10 text-[var(--rp-violet-soft)]" },
    red:     { ring: "border-[var(--rp-red)]/40",     icon: "text-[var(--rp-red-soft)]",     chip: "border-[var(--rp-red)]/30 bg-[var(--rp-red)]/10 text-[var(--rp-red-soft)]" },
  };

  return (
    <div className="space-y-5">
      <div className="rp-glass rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2.5 mb-1">
          <Sparkles className="h-4 w-4 text-[var(--rp-emerald-soft)]" />
          <h2 className="font-display text-lg tracking-tight">Presets por tipo de negocio</h2>
        </div>
        <p className="text-xs text-muted-foreground max-w-2xl">
          Aplica un preset y tu entorno queda configurado con los módulos típicos de ese tipo de negocio. Puedes ajustar cualquier módulo después.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {PRESETS.map((p, idx) => {
          const tone = toneMap[p.tone];
          const Icon = p.icon;
          const isApplied = applied === p.id;
          return (
            <motion.div
              key={p.id}
              initial={false}
              className={cn(
                "rp-glass rounded-2xl p-5 border flex flex-col gap-3 transition-colors",
                isApplied ? tone.ring : "border-border/60"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className={cn("h-10 w-10 rounded-lg bg-foreground/[0.04] flex items-center justify-center", tone.icon)}>
                  <Icon className="h-5 w-5" />
                </div>
                {isApplied && (
                  <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", tone.chip)}>
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Aplicado
                  </Badge>
                )}
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Preset {String(idx + 1).padStart(2, "0")}
                </div>
                <h3 className="font-display text-lg tracking-tight">{p.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">{p.description}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.modules.map((m) => (
                  <span key={m} className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded border", tone.chip)}>
                    {m}
                  </span>
                ))}
              </div>
              <div className="mt-auto pt-2">
                <Button
                  variant={isApplied ? "outline" : "default"}
                  className={cn(
                    "w-full min-h-11",
                    !isApplied && "bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
                  )}
                  onClick={() => setConfirmPreset(p)}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Aplicado
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" /> Aplicar preset
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          );
        })}

        {/* Helper card */}
        <div className="rp-glass rounded-2xl p-5 border border-dashed border-border/60 flex flex-col gap-3 justify-center text-center">
          <div className="mx-auto h-10 w-10 rounded-full bg-foreground/[0.04] flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-[var(--rp-violet-soft)]" />
          </div>
          <div>
            <h3 className="font-display text-base">¿Necesitas otro preset?</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Próximamente: food truck, heladería, pastelería y más.
            </p>
          </div>
        </div>
      </div>

      {/* Confirm dialog */}
      <Dialog open={!!confirmPreset} onOpenChange={(o) => !o && setConfirmPreset(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[var(--rp-emerald-soft)]" />
              Aplicar preset «{confirmPreset?.name}»
            </DialogTitle>
            <DialogDescription>
              Se activarán {confirmPreset?.modules.length ?? 0} módulos. Tu configuración actual se mantendrá y se añadirán los que falten.
            </DialogDescription>
          </DialogHeader>
          {confirmPreset && (
            <div className="flex flex-wrap gap-1.5">
              {confirmPreset.modules.map((m) => (
                <span key={m} className="text-[11px] font-mono px-2 py-1 rounded border border-border/60 text-muted-foreground">
                  {m}
                </span>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="min-h-11" onClick={() => setConfirmPreset(null)}>Cancelar</Button>
            <Button className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)] min-h-11" onClick={() => confirmPreset && applyPreset(confirmPreset)}>
              <Zap className="h-4 w-4" /> Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =========================================================
 * Section D: Maintenance
 * =======================================================*/
function MaintenanceSection() {
  const { toast } = useToast();

  const statusMeta: Record<
    MaintenanceItem["status"],
    { label: string; cls: string; dot: string; icon: React.ElementType }
  > = {
    activo:   { label: "Activo",            cls: "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]", dot: "bg-[var(--rp-emerald)]", icon: CheckCircle2 },
    requiere: { label: "Requiere revisión", cls: "border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow-soft)]",   dot: "bg-[var(--rp-yellow)]",  icon: AlertCircle },
    proximo:  { label: "Próximamente",      cls: "border-[var(--rp-blue)]/40 bg-[var(--rp-blue)]/10 text-[var(--rp-blue-soft)]",         dot: "bg-[var(--rp-blue)]",    icon: Clock },
  };

  const activeCount = MAINTENANCE_ITEMS.filter((i) => i.status === "activo").length;
  const requiereCount = MAINTENANCE_ITEMS.filter((i) => i.status === "requiere").length;
  const proximoCount = MAINTENANCE_ITEMS.filter((i) => i.status === "proximo").length;

  return (
    <div className="space-y-5">
      <div className="rp-glass rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2.5 mb-1">
          <Wrench className="h-4 w-4 text-[var(--rp-emerald-soft)]" />
          <h2 className="font-display text-lg tracking-tight">Mantenimiento automático</h2>
        </div>
        <p className="text-xs text-muted-foreground max-w-2xl">
          Todo lo relacionado con la operación de la plataforma se mantiene de forma centralizada. Tú te ocupas de tu restaurante, nosotros del software.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <MiniKpi
          icon={CheckCircle2}
          tone="emerald"
          label="Activos"
          value={String(activeCount)}
        />
        <MiniKpi
          icon={AlertCircle}
          tone="yellow"
          label="Requiere revisión"
          value={String(requiereCount)}
        />
        <MiniKpi
          icon={Clock}
          tone="blue"
          label="Próximamente"
          value={String(proximoCount)}
        />
      </div>

      {/* Items list */}
      <div className="rp-glass rounded-2xl overflow-hidden">
        <ul className="divide-y divide-border/40">
          {MAINTENANCE_ITEMS.map((item) => {
            const meta = statusMeta[item.status];
            const Icon = meta.icon;
            return (
              <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">{item.detail}</div>
                </div>
                <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", meta.cls)}>
                  <Icon className="h-3 w-3 mr-1" />
                  {meta.label}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    toast({
                      title: item.label,
                      description: item.detail,
                    })
                  }
                >
                  Ver detalle
                </Button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Legal disclaimer */}
      <div className="rp-glass rounded-2xl p-4 border-l-2 border-l-[var(--rp-red)]/60">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-[var(--rp-red-soft)] shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium">Cumplimiento normativo</div>
            <p className="text-xs text-muted-foreground mt-1">
              No afirmamos que una normativa esté cubierta sin implementación real.
              Las funcionalidades de cumplimiento (RGPD, LOPDGDD, facturación electrónica,
              APP/ccbi) requieren activación y verificación documental por caso.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 min-h-9 border-[var(--rp-red)]/40 text-[var(--rp-red-soft)] hover:bg-[var(--rp-red)]/10"
              onClick={() =>
                toast({
                  title: "Centro de cumplimiento",
                  description: "Demo: redirige al módulo de cumplimiento normativo.",
                })
              }
            >
              <FileCheck2 className="h-3.5 w-3.5" /> Ver centro de cumplimiento
            </Button>
          </div>
        </div>
      </div>

      {/* Activity feed (mock) */}
      <div className="rp-glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[var(--rp-emerald-soft)]" />
            <span className="text-sm font-medium">Actividad reciente</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">últimas 24h</span>
        </div>
        <ul className="space-y-2 text-xs">
          {[
            { t: "03:00", icon: Database,   label: "Backup diario completado", tone: "emerald" },
            { t: "06:12", icon: RefreshCw,  label: "Actualización v3.4.2 aplicada sin downtime", tone: "emerald" },
            { t: "09:30", icon: Server,     label: "Índice SQL optimizado · ganancia p95 -28ms", tone: "blue" },
            { t: "11:45", icon: Wifi,       label: "Integración Glovo reconectada tras mantenimiento", tone: "yellow" },
            { t: "13:20", icon: ShieldCheck,label: "Escaneo de seguridad · 0 hallazgos críticos", tone: "emerald" },
          ].map((row, i) => {
            const Icon = row.icon;
            const toneCls =
              row.tone === "emerald" ? "text-[var(--rp-emerald-soft)]" :
              row.tone === "yellow"  ? "text-[var(--rp-yellow-soft)]" :
              "text-[var(--rp-blue-soft)]";
            return (
              <li key={i} className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-muted-foreground tabular-nums w-10 shrink-0">{row.t}</span>
                <Icon className={cn("h-3.5 w-3.5 shrink-0", toneCls)} />
                <span className="text-muted-foreground">{row.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function MiniKpi({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: React.ElementType;
  tone: "emerald" | "yellow" | "blue";
  label: string;
  value: string;
}) {
  const toneCls =
    tone === "emerald" ? "text-[var(--rp-emerald-soft)]" :
    tone === "yellow"  ? "text-[var(--rp-yellow-soft)]" :
    "text-[var(--rp-blue-soft)]";
  return (
    <div className="rp-glass rounded-xl p-3 sm:p-4 flex items-center gap-3">
      <div className={cn("h-9 w-9 rounded-lg bg-foreground/[0.04] flex items-center justify-center", toneCls)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground truncate">
          {label}
        </div>
        <div className="text-xl font-display font-medium tabular-nums leading-tight">{value}</div>
      </div>
    </div>
  );
}
