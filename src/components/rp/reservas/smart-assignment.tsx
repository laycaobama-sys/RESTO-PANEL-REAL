"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  BrainCircuit,
  Sparkles,
  Crown,
  Users,
  Clock,
  MapPin,
  Star,
  Volume2,
  RefreshCw,
  ShieldAlert,
  ChevronDown,
  Info,
  Armchair,
  Baby,
  Accessibility,
  Sun,
  CalendarClock,
  UserCog,
  Layers,
  TrendingUp,
  CircleDot,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Zap,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
interface TableCandidate {
  tableId: string;
  tableName: string;
  zone: string;
  seats: number;
  score: number; // 0-100
  reasons: { factor: string; impact: number; detail: string }[];
  confidence: number;
  isRecommended: boolean;
  isFallback: boolean;
}

interface AssignmentRequest {
  reservationId: string;
  customerName: string;
  partySize: number;
  vip: boolean;
  preferences: { zone?: string; table?: string; accessibility?: boolean; children?: boolean };
  history: { visitCount: number; favoriteTable?: string; favoriteZone?: string };
}

/* =========================================================
 * Demo data — reservation
 * =======================================================*/
const DEMO_RESERVATION: AssignmentRequest = {
  reservationId: "RES-2025-0142",
  customerName: "Elena Marín",
  partySize: 4,
  vip: true,
  preferences: { zone: "Terraza", table: "T3", accessibility: false, children: false },
  history: { visitCount: 15, favoriteTable: "T3", favoriteZone: "Terraza" },
};

/* =========================================================
 * Demo data — AI candidates
 * =======================================================*/
const AI_CANDIDATES: TableCandidate[] = [
  {
    tableId: "T3",
    tableName: "T3",
    zone: "Terraza",
    seats: 4,
    score: 92,
    confidence: 88,
    isRecommended: true,
    isFallback: false,
    reasons: [
      { factor: "Capacidad compatible", impact: 20, detail: "Mesa de 4 para 4 comensales" },
      { factor: "Zona preferida", impact: 15, detail: "Cliente prefiere Terraza (historial: 8 visitas)" },
      { factor: "Mesa favorita", impact: 25, detail: "Mesa T3 es la favorita del cliente (5 visitas)" },
      { factor: "Bajo ruido", impact: 10, detail: "Zona tranquila, adecuada para conversación" },
      { factor: "Rotación óptima", impact: 12, detail: "Duración estimada 90min encaja con próxima reserva 22:30" },
      { factor: "Camarero asignado", impact: 10, detail: "Carlos conoce al cliente (3 servicios previos)" },
    ],
  },
  {
    tableId: "T7",
    tableName: "T7",
    zone: "Terraza",
    seats: 4,
    score: 78,
    confidence: 74,
    isRecommended: false,
    isFallback: false,
    reasons: [
      { factor: "Capacidad compatible", impact: 20, detail: "Mesa de 4 para 4 comensales" },
      { factor: "Zona preferida", impact: 15, detail: "Cliente prefiere Terraza" },
      { factor: "Rotación óptima", impact: 8, detail: "Libre a las 21:45, encaja con duración 90min" },
      { factor: "Bajo ruido", impact: 8, detail: "Zona tranquila" },
    ],
  },
  {
    tableId: "V1",
    tableName: "V1",
    zone: "VIP",
    seats: 4,
    score: 71,
    confidence: 68,
    isRecommended: false,
    isFallback: false,
    reasons: [
      { factor: "Capacidad compatible", impact: 20, detail: "Mesa de 4 para 4 comensales" },
      { factor: "Cliente VIP", impact: 18, detail: "Sala VIP reservada a clientes VIP" },
      { factor: "Rotación subóptima", impact: -8, detail: "Mesa VIP ocupada hasta 22:15 (posible conflicto)" },
      { factor: "Sin preferencia explícita", impact: -3, detail: "Cliente no marcó VIP como preferencia" },
    ],
  },
  {
    tableId: "T12",
    tableName: "T12",
    zone: "Sala",
    seats: 4,
    score: 65,
    confidence: 62,
    isRecommended: false,
    isFallback: false,
    reasons: [
      { factor: "Capacidad compatible", impact: 20, detail: "Mesa de 4 para 4 comensales" },
      { factor: "Zona no preferida", impact: -10, detail: "Cliente prefiere Terraza (no Sala)" },
      { factor: "Ruido medio", impact: -5, detail: "Sala principal, ruido moderado en hora pico" },
      { factor: "Rotación óptima", impact: 10, detail: "Disponible todo el turno" },
    ],
  },
  {
    tableId: "T5",
    tableName: "T5",
    zone: "Terraza",
    seats: 6,
    score: 58,
    confidence: 54,
    isRecommended: false,
    isFallback: false,
    reasons: [
      { factor: "Sobrecapacidad", impact: -8, detail: "Mesa de 6 para 4 comensales (capacidad desperdiciada)" },
      { factor: "Zona preferida", impact: 15, detail: "Cliente prefiere Terraza" },
      { factor: "Rotación subóptima", impact: -4, detail: "Mesa de 6 alta demanda: podría usarse para grupos" },
      { factor: "Bajo ruido", impact: 10, detail: "Zona tranquila" },
    ],
  },
];

/* =========================================================
 * Demo data — fallback candidates (sorted deterministically)
 * =======================================================*/
const FALLBACK_CANDIDATES: TableCandidate[] = [
  {
    tableId: "T3",
    tableName: "T3",
    zone: "Terraza",
    seats: 4,
    score: 70,
    confidence: 100,
    isRecommended: true,
    isFallback: true,
    reasons: [
      { factor: "Capacidad compatible", impact: 20, detail: "Mesa de 4 para 4 comensales (filtro determinista)" },
      { factor: "Mesa favorita", impact: 25, detail: "T3 es la mesa favorita del cliente (paso 3 del algoritmo)" },
      { factor: "Zona preferida", impact: 15, detail: "Terraza coincide con preferencia (paso 2)" },
      { factor: "Rotación óptima", impact: 10, detail: "Primera disponible sin impacto en próxima reserva" },
    ],
  },
  {
    tableId: "T7",
    tableName: "T7",
    zone: "Terraza",
    seats: 4,
    score: 58,
    confidence: 100,
    isRecommended: false,
    isFallback: true,
    reasons: [
      { factor: "Capacidad compatible", impact: 20, detail: "Mesa de 4 para 4 comensales" },
      { factor: "Zona preferida", impact: 15, detail: "Terraza coincide con preferencia" },
      { factor: "Rotación óptima", impact: 8, detail: "Disponible sin impacto" },
    ],
  },
  {
    tableId: "T12",
    tableName: "T12",
    zone: "Sala",
    seats: 4,
    score: 42,
    confidence: 100,
    isRecommended: false,
    isFallback: true,
    reasons: [
      { factor: "Capacidad compatible", impact: 20, detail: "Mesa de 4 para 4 comensales" },
      { factor: "Zona no preferida", impact: -10, detail: "Sala no coincide con Terraza" },
      { factor: "Rotación óptima", impact: 10, detail: "Disponible" },
    ],
  },
  {
    tableId: "V1",
    tableName: "V1",
    zone: "VIP",
    seats: 4,
    score: 35,
    confidence: 100,
    isRecommended: false,
    isFallback: true,
    reasons: [
      { factor: "Capacidad compatible", impact: 20, detail: "Mesa de 4 para 4 comensales" },
      { factor: "Zona no preferida", impact: -10, detail: "VIP no coincide con Terraza" },
      { factor: "Rotación subóptima", impact: -8, detail: "Conflicto con reserva posterior" },
    ],
  },
  {
    tableId: "T5",
    tableName: "T5",
    zone: "Terraza",
    seats: 6,
    score: 28,
    confidence: 100,
    isRecommended: false,
    isFallback: true,
    reasons: [
      { factor: "Sobrecapacidad", impact: -8, detail: "Mesa de 6 para 4 comensales" },
      { factor: "Zona preferida", impact: 15, detail: "Terraza coincide" },
      { factor: "Rotación subóptima", impact: -4, detail: "Mesa alta demanda para grupos" },
    ],
  },
];

/* =========================================================
 * All factors (for explanation collapsible)
 * =======================================================*/
const ALL_FACTORS: { name: string; icon: React.ElementType; description: string }[] = [
  { name: "Capacidad", icon: Users, description: "Número de asientos vs tamaño del grupo" },
  { name: "Zona", icon: MapPin, description: "Preferencia explícita de zona del cliente" },
  { name: "Disponibilidad", icon: Clock, description: "Mesa libre durante la franja estimada" },
  { name: "Rotación", icon: RefreshCw, description: "Impacto en reservas posteriores" },
  { name: "Mesa favorita", icon: Star, description: "Mesa recurrente del cliente en historial" },
  { name: "Historial", icon: TrendingUp, description: "Visitas previas, preferencias inferidas" },
  { name: "VIP", icon: Crown, description: "Acceso a zonas VIP para clientes VIP" },
  { name: "Niños", icon: Baby, description: "Zonas aptas para familias con niños" },
  { name: "Accesibilidad", icon: Accessibility, description: "Mesas accesibles (sin barreras)" },
  { name: "Terraza/Interior", icon: MapPin, description: "Preferencia meteorológica o estacional" },
  { name: "Sombra/Sol", icon: Sun, description: "Posición de la mesa en terraza" },
  { name: "Ruido", icon: Volume2, description: "Nivel de ruido ambiente por zona" },
  { name: "Camarero", icon: UserCog, description: "Camarero con relación previa al cliente" },
  { name: "Carga camarero", icon: Layers, description: "Carga actual del camarero asignado" },
  { name: "Eventos", icon: CalendarClock, description: "Compatibilidad con eventos activos" },
  { name: "Rentabilidad", icon: TrendingUp, description: "Ticket medio esperado por mesa" },
  { name: "Compatibilidad posterior", icon: CalendarClock, description: "Encaje con la próxima reserva en esa mesa" },
  { name: "Unión mesas", icon: Layers, description: "Posibilidad de unir mesas adyacentes" },
];

/* =========================================================
 * Helpers
 * =======================================================*/
function confidenceClass(c: number) {
  if (c >= 85) return "bg-emerald-400/10 text-emerald-300 border-emerald-400/30";
  if (c >= 65) return "bg-amber-400/10 text-amber-300 border-amber-400/30";
  return "bg-destructive/10 text-destructive border-destructive/30";
}

function scoreColor(score: number) {
  if (score >= 85) return "text-emerald-300";
  if (score >= 70) return "rp-gold-text";
  if (score >= 50) return "text-amber-300";
  return "text-destructive";
}

/* =========================================================
 * Recommended table card
 * =======================================================*/
function RecommendedCard({
  candidate,
  onAssign,
  onAlternatives,
  index,
}: {
  candidate: TableCandidate;
  onAssign: () => void;
  onAlternatives: () => void;
  index: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: reduce ? 0 : index * 0.05 }}
      className={cn(
        "rp-glass-strong rounded-2xl p-5 sm:p-6",
        candidate.isFallback
          ? "rp-glow-gold ring-1 ring-amber-400/40"
          : "rp-glow-gold ring-1 ring-[var(--gold)]/40"
      )}
    >
      {/* Top: badges */}
      <div className="flex flex-wrap items-center gap-2">
        {candidate.isFallback ? (
          <Badge
            variant="outline"
            className="border-amber-400/50 bg-amber-400/10 text-amber-300 font-mono text-[10px] uppercase tracking-wider"
          >
            <AlertTriangle className="mr-1 h-3 w-3" />
            Fallback
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-[var(--gold)]/50 bg-[var(--gold)]/10 text-[var(--gold-soft)] font-mono text-[10px] uppercase tracking-wider"
          >
            <Sparkles className="mr-1 h-3 w-3" />
            Recomendada
          </Badge>
        )}
        <span className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-foreground/[0.04] px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
          <Armchair className="h-3 w-3" />
          {candidate.zone}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-foreground/[0.04] px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
          <Users className="h-3 w-3" />
          {candidate.seats} pax
        </span>
      </div>

      {/* Main */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Mesa
          </div>
          <div className="mt-1 font-display text-4xl font-light tracking-tight sm:text-5xl">
            {candidate.tableName}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "inline-flex cursor-help items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-mono",
                    confidenceClass(candidate.confidence)
                  )}
                >
                  <ShieldAlert className="h-3 w-3" />
                  Confianza {candidate.confidence}%
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[220px]">
                Confianza del modelo en la recomendación. En fallback, confianza = 100% (algoritmo determinista).
              </TooltipContent>
            </Tooltip>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Cpu className="h-3 w-3" />
              <code className="font-mono">
                {candidate.isFallback ? "fallback-v1.0" : "glm-4-flash"}
              </code>
            </span>
          </div>
        </div>

        {/* Score */}
        <div className="text-right">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Score
          </div>
          <div
            className={cn(
              "mt-1 font-display text-5xl font-light tabular-nums sm:text-6xl",
              scoreColor(candidate.score)
            )}
          >
            {candidate.score}
            <span className="text-2xl text-muted-foreground">/100</span>
          </div>
        </div>
      </div>

      {/* Reasons */}
      <div className="mt-5">
        <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          Factores que justifican el score
        </div>
        <ul className="mt-3 space-y-2.5">
          {candidate.reasons.map((r, i) => (
            <ReasonRow key={i} reason={r} index={i} reduce={!!reduce} />
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap gap-2.5">
        <Button
          size="default"
          className="h-11 bg-[var(--gold)] text-[#0a0a0a] px-5 hover:bg-[var(--gold-soft)]"
          onClick={onAssign}
        >
          <CheckCircle2 className="h-4 w-4" />
          Asignar mesa {candidate.tableName}
        </Button>
        <Button
          variant="ghost"
          size="default"
          className="h-11 px-4"
          onClick={onAlternatives}
        >
          <Layers className="h-4 w-4" />
          Ver alternativas
        </Button>
      </div>
    </motion.article>
  );
}

/* =========================================================
 * Reason row — single factor with impact bar
 * =======================================================*/
function ReasonRow({
  reason,
  index,
  reduce,
}: {
  reason: { factor: string; impact: number; detail: string };
  index: number;
  reduce: boolean;
}) {
  const positive = reason.impact >= 0;
  const maxAbs = 25;
  const width = Math.min(Math.abs(reason.impact) / maxAbs, 1) * 100;

  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: reduce ? 0 : index * 0.04 }}
      className="rp-glass rounded-xl p-3 sm:p-3.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{reason.factor}</span>
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-mono tabular-nums",
                positive
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              )}
            >
              {positive ? "+" : ""}
              {reason.impact}
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {reason.detail}
          </p>
        </div>
      </div>
      {/* Impact bar */}
      <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-foreground/[0.08]">
        <motion.div
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.5, delay: reduce ? 0 : 0.1 + index * 0.04, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full",
            positive
              ? "bg-gradient-to-r from-emerald-400/60 to-emerald-400"
              : "bg-gradient-to-r from-destructive/60 to-destructive"
          )}
        />
      </div>
    </motion.li>
  );
}

/* =========================================================
 * Alternative table card
 * =======================================================*/
function AlternativeCard({
  candidate,
  index,
  onSelect,
}: {
  candidate: TableCandidate;
  index: number;
  onSelect: () => void;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: reduce ? 0 : index * 0.04 }}
      className="rp-glass flex flex-col rounded-xl p-4 transition-colors hover:bg-foreground/[0.04]"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="font-display text-2xl font-light tracking-tight">
          {candidate.tableName}
        </div>
        <div className={cn("font-mono text-lg font-medium tabular-nums", scoreColor(candidate.score))}>
          {candidate.score}
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
        <MapPin className="h-3 w-3" />
        {candidate.zone}
        <span className="text-foreground/30">·</span>
        <Users className="h-3 w-3" />
        {candidate.seats} pax
      </div>
      <div className="mt-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono",
            confidenceClass(candidate.confidence)
          )}
        >
          <ShieldAlert className="h-2.5 w-2.5" />
          {candidate.confidence}%
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="mt-3 h-9 min-h-11 w-full text-xs"
        onClick={onSelect}
      >
        Seleccionar
      </Button>
    </motion.article>
  );
}

/* =========================================================
 * Main component
 * =======================================================*/
export function SmartAssignment() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [iaDown, setIaDown] = React.useState(false);
  const [showAlternatives, setShowAlternatives] = React.useState(false);
  const [factorsOpen, setFactorsOpen] = React.useState(false);
  const [selectedAlt, setSelectedAlt] = React.useState<string | null>(null);
  const [assigning, setAssigning] = React.useState(false);

  const candidates = iaDown ? FALLBACK_CANDIDATES : AI_CANDIDATES;
  const recommended = candidates[0];
  const alternatives = candidates.slice(1);

  const handleAssign = (candidate: TableCandidate) => {
    setAssigning(true);
    window.setTimeout(() => {
      setAssigning(false);
      toast({
        title: "Mesa asignada",
        description: `Mesa ${candidate.tableName} asignada a ${DEMO_RESERVATION.customerName} (demo)`,
      });
    }, 600);
  };

  const handleSelectAlt = (c: TableCandidate) => {
    setSelectedAlt(c.tableId);
    toast({
      title: "Mesa seleccionada",
      description: `Mesa ${c.tableName} (${c.zone}) · Score ${c.score}/100 (demo)`,
    });
  };

  return (
    <TooltipProvider delayDuration={150}>
      <section aria-labelledby="smart-assign-title" className="flex flex-col gap-5">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--gold)]/10 text-[var(--gold)]">
                <BrainCircuit className="h-5 w-5" />
              </span>
              <h2
                id="smart-assign-title"
                className="font-display text-xl sm:text-2xl font-medium tracking-tight"
              >
                Asignación inteligente
              </h2>
              <Badge
                variant="outline"
                className="border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)] font-mono text-[10px] uppercase tracking-wider"
              >
                demo
              </Badge>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Scoring IA con fallback determinista explicable. Nunca impide reservar.
            </p>
          </div>
        </header>

        {/* Reservation context card */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rp-glass rounded-2xl p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-foreground/[0.05] text-foreground">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  Reserva {DEMO_RESERVATION.reservationId}
                </div>
                <div className="mt-0.5 font-display text-lg font-medium">
                  {DEMO_RESERVATION.customerName}
                </div>
              </div>
            </div>
            {DEMO_RESERVATION.vip && (
              <Badge
                variant="outline"
                className="border-[var(--gold)]/50 bg-[var(--gold)]/10 text-[var(--gold-soft)] font-mono text-[10px] uppercase tracking-wider"
              >
                <Crown className="mr-1 h-3 w-3" />
                VIP
              </Badge>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ContextCell
              icon={Users}
              label="Comensales"
              value={`${DEMO_RESERVATION.partySize} pax`}
            />
            <ContextCell
              icon={MapPin}
              label="Zona preferida"
              value={DEMO_RESERVATION.preferences.zone || "—"}
            />
            <ContextCell
              icon={Star}
              label="Mesa favorita"
              value={DEMO_RESERVATION.preferences.table || "—"}
            />
            <ContextCell
              icon={TrendingUp}
              label="Visitas previas"
              value={`${DEMO_RESERVATION.history.visitCount}`}
            />
          </div>
        </motion.div>

        {/* AI vs Fallback indicator */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: reduce ? 0 : 0.05 }}
          className={cn(
            "rp-glass flex flex-col gap-3 rounded-xl border-l-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
            iaDown ? "border-l-amber-400/60" : "border-l-[var(--teal)]/60"
          )}
        >
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                iaDown ? "bg-amber-400/12 text-amber-300" : "bg-[var(--teal)]/12 text-[var(--teal)]"
              )}
            >
              {iaDown ? <AlertTriangle className="h-4.5 w-4.5" /> : <BrainCircuit className="h-4.5 w-4.5" />}
            </span>
            <div className="min-w-0">
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Motor de asignación
              </div>
              <div
                className={cn(
                  "mt-0.5 text-sm font-medium",
                  iaDown ? "text-amber-300" : "rp-teal-text"
                )}
              >
                {iaDown
                  ? "IA no disponible — usando algoritmo determinista (fallback)"
                  : "IA activa · Modelo: glm-4-flash"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Label>Simular caída de IA</Label>
            <Switch
              checked={iaDown}
              onCheckedChange={setIaDown}
              aria-label="Simular caída de IA"
            />
          </div>
        </motion.div>

        {/* Recommended + alternatives */}
        <div className="grid gap-5 lg:grid-cols-5">
          {/* Recommended */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={recommended.tableId + (iaDown ? "-fb" : "-ia")}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <RecommendedCard
                  candidate={recommended}
                  index={0}
                  onAssign={() => handleAssign(recommended)}
                  onAlternatives={() => {
                    setShowAlternatives(true);
                    toast({
                      title: "Alternativas cargadas",
                      description: `${alternatives.length} mesas candidatas ordenadas por score (demo)`,
                    });
                  }}
                />
              </motion.div>
            </AnimatePresence>

            {assigning && (
              <motion.div
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"
              >
                <RefreshCw className="h-3 w-3 animate-spin" />
                Asignando mesa…
              </motion.div>
            )}
          </div>

          {/* Alternatives column */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-foreground">Mesas alternativas</h3>
              </div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                {alternatives.length} candidatas
              </span>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <AnimatePresence mode="popLayout">
                {alternatives.map((c, i) => (
                  <AlternativeCard
                    key={c.tableId + (iaDown ? "-fb" : "-ia")}
                    candidate={c}
                    index={i}
                    onSelect={() => handleSelectAlt(c)}
                  />
                ))}
              </AnimatePresence>
            </div>

            {selectedAlt && (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 rp-glass rounded-xl border-l-2 border-[var(--teal)]/60 p-3"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CircleDot className="h-3.5 w-3.5 rp-teal-text" />
                  Mesa <span className="font-mono text-foreground">{selectedAlt}</span> marcada como preferencia alternativa.
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Collapsible: all factors */}
        <Collapsible open={factorsOpen} onOpenChange={setFactorsOpen}>
          <CollapsibleTrigger asChild>
            <button
              className="rp-glass flex w-full items-center justify-between gap-3 rounded-xl p-4 text-left transition-colors hover:bg-foreground/[0.04] min-h-11"
              aria-expanded={factorsOpen}
            >
              <div className="flex items-center gap-2.5">
                <Info className="h-4 w-4 rp-gold-text" />
                <span className="text-sm font-medium text-foreground">
                  Factores considerados por el motor
                </span>
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  {ALL_FACTORS.length} factores
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  factorsOpen && "rotate-180"
                )}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <motion.div
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="mt-3 rp-glass rounded-xl p-4"
            >
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {ALL_FACTORS.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div
                      key={f.name}
                      className="flex items-start gap-2.5 rounded-lg border border-border/40 bg-foreground/[0.025] p-3"
                    >
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[var(--gold)]/10 text-[var(--gold)]">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-foreground">{f.name}</div>
                        <div className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                          {f.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </CollapsibleContent>
        </Collapsible>

        {/* Fallback explanation (only when IA is down) */}
        <AnimatePresence>
          {iaDown && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="rp-glass rounded-xl border-l-2 border-amber-400/60 p-5"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-300" />
                <h3 className="text-sm font-medium text-foreground">
                  Algoritmo determinista aplicado
                </h3>
              </div>
              <ol className="mt-3 space-y-2">
                {[
                  "Filtrar por capacidad ≥ party_size",
                  "Ordenar por preferencia de zona",
                  "Priorizar mesa favorita",
                  "Minimizar impacto en rotación",
                  "Asignar primera disponible",
                ].map((step, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-foreground/85"
                  >
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber-400/15 font-mono text-[10px] text-amber-300">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-400/[0.06] p-3 text-xs leading-relaxed text-amber-200/90">
                <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Una caída de la IA nunca impide reservar. El fallback garantiza operación.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disclaimer */}
        <div className="rp-glass flex items-start gap-3 rounded-xl border-l-2 border-[var(--gold)]/60 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 rp-gold-text" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            El score combina <span className="text-foreground">capacidad, preferencias, historial, rotación y contexto operativo</span>.
            Las razones se muestran para auditoría. La asignación final requiere confirmación del maitre.
            Datos demo — no se modifica ninguna reserva real.
          </p>
        </div>
      </section>
    </TooltipProvider>
  );
}

/* =========================================================
 * Context cell
 * =======================================================*/
function ContextCell({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-foreground truncate">{value}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
      {children}
    </span>
  );
}
