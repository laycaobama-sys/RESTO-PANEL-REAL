"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Medal,
  Award,
  Crown,
  Gem,
  Diamond,
  Star,
  Sparkles,
  ChevronDown,
  ArrowRight,
  Check,
  X,
  Clock3,
  Settings2,
  Info,
  Heart,
  Coffee,
  Moon,
  ShieldCheck,
  Crown as CrownAlt,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
interface VipTier {
  id: string;
  name: string;
  color: string;
  icon: string;
  minLtv: number;
  minVisits: number;
  benefits: string[];
  clients: number;
  isSystem: boolean;
  category: "tier" | "frequency";
}

interface VipSuggestion {
  id: string;
  customerId: string;
  customerName: string;
  currentTier: string;
  suggestedTier: string;
  reason: string;
  confidence: number;
  factors: string[];
}

/* =========================================================
 * Icon resolver
 * =======================================================*/
const ICON_MAP: Record<string, React.ElementType> = {
  Medal,
  Award,
  Crown,
  Gem,
  Diamond,
  Star,
  Coffee,
  Moon,
};

function TierIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const IconComp = ICON_MAP[name] ?? Star;
  return <IconComp className={className} aria-hidden />;
}

/* =========================================================
 * Demo data — tiers
 * =======================================================*/
const INITIAL_TIERS: VipTier[] = [
  {
    id: "tier-bronce",
    name: "Bronce",
    color: "#CD7F32",
    icon: "Medal",
    minLtv: 0,
    minVisits: 1,
    benefits: ["Acumulación de puntos 1×", "Ofertas mensuales", "Recordatorio de cumpleaños"],
    clients: 421,
    isSystem: true,
    category: "tier",
  },
  {
    id: "tier-plata",
    name: "Plata",
    color: "#C0C0C0",
    icon: "Award",
    minLtv: 800,
    minVisits: 6,
    benefits: ["Puntos 1.25×", "Prioridad en reserva", "Café o digestivo de cortesía"],
    clients: 198,
    isSystem: true,
    category: "tier",
  },
  {
    id: "tier-oro",
    name: "Oro",
    color: "#D4AF37",
    icon: "Crown",
    minLtv: 2500,
    minVisits: 15,
    benefits: ["Puntos 1.5×", "Mesa preferente", "Invitación a eventos privados", "Botella de cava de bienvenida"],
    clients: 87,
    isSystem: true,
    category: "tier",
  },
  {
    id: "tier-black",
    name: "Black",
    color: "#1a1a1a",
    icon: "Gem",
    minLtv: 5000,
    minVisits: 30,
    benefits: ["Puntos 2×", "Concierge dedicado", "Acceso a menú degustación exclusivo", "Traslado en taxi"],
    clients: 23,
    isSystem: true,
    category: "tier",
  },
  {
    id: "tier-diamond",
    name: "Diamond",
    color: "#B9F2FF",
    icon: "Diamond",
    minLtv: 10000,
    minVisits: 50,
    benefits: ["Puntos 3×", "Mesa fija semanal", "Chef en mesa", "Cena anual con el propietario"],
    clients: 8,
    isSystem: true,
    category: "tier",
  },
  {
    id: "cat-frecuente",
    name: "Frecuente",
    color: "#3DD6C9",
    icon: "Coffee",
    minLtv: 0,
    minVisits: 4,
    benefits: ["Categoría transversal", "4+ visitas en 30 días", "Beneficios según tier actual"],
    clients: 142,
    isSystem: true,
    category: "frequency",
  },
  {
    id: "cat-ocasional",
    name: "Ocasional",
    color: "#E8C766",
    icon: "Star",
    minLtv: 0,
    minVisits: 1,
    benefits: ["Categoría transversal", "1-3 visitas en 30 días", "Campañas de reactivación"],
    clients: 388,
    isSystem: true,
    category: "frequency",
  },
  {
    id: "cat-dormido",
    name: "Dormido",
    color: "#9CA3AF",
    icon: "Moon",
    minLtv: 0,
    minVisits: 0,
    benefits: ["Categoría transversal", "Sin visitas en 90 días", "Reactivación con oferta especial"],
    clients: 124,
    isSystem: true,
    category: "frequency",
  },
];

/* =========================================================
 * Demo data — AI suggestions
 * =======================================================*/
const INITIAL_SUGGESTIONS: VipSuggestion[] = [
  {
    id: "sug-1",
    customerId: "cust-vm",
    customerName: "Vera Mendoza",
    currentTier: "Oro",
    suggestedTier: "Black",
    reason: "LTV aumentado 40% en últimos 3 meses y frecuencia semanal estable.",
    confidence: 88,
    factors: ["LTV €4.820 → €6.740", "Visitas 8 en 90 días", "Ticket medio +18%"],
  },
  {
    id: "sug-2",
    customerId: "cust-jp",
    customerName: "Javier Puente",
    currentTier: "Plata",
    suggestedTier: "Oro",
    reason: "Supera umbral de LTV y visitas mínimas del tier Oro con margen.",
    confidence: 92,
    factors: ["LTV €2.640 (mín. €2.500)", "Visitas 17 (mín. 15)", "0 cancelaciones"],
  },
  {
    id: "sug-3",
    customerId: "cust-lr",
    customerName: "Lola Ríos",
    currentTier: "Black",
    suggestedTier: "Diamond",
    reason: "Patrón de alta frecuencia y gasto sostenido, candidato a Diamond.",
    confidence: 74,
    factors: ["LTV €9.450", "Visitas 47 en 12m", "Refiere a 3 nuevos VIP"],
  },
  {
    id: "sug-4",
    customerId: "cust-tc",
    customerName: "Tomás Castro",
    currentTier: "Oro",
    suggestedTier: "Plata",
    reason: "Caída de frecuencia del 55% en últimos 90 días, revisar retención.",
    confidence: 68,
    factors: ["Visitas 3 en 90 días (antes 9)", "LTV estable", "2 cancelaciones recientes"],
  },
  {
    id: "sug-5",
    customerId: "cust-mn",
    customerName: "Marta Núñez",
    currentTier: "Bronce",
    suggestedTier: "Plata",
    reason: "Crecimiento acelerado en visitas y ticket en últimos 60 días.",
    confidence: 81,
    factors: ["Visitas 5 en 60 días", "Ticket medio €85 (+30%)", "Reservas futuras: 2"],
  },
];

/* =========================================================
 * Tier card
 * =======================================================*/
function TierCard({
  tier,
  index,
  reduceMotion,
  onConfigure,
}: {
  tier: VipTier;
  index: number;
  reduceMotion: boolean | null;
  onConfigure: (t: VipTier) => void;
}) {
  const isFrequency = tier.category === "frequency";
  const isBlack = tier.id === "tier-black";

  return (
    <motion.article
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: reduceMotion ? 0 : Math.min(index * 0.05, 0.4) }}
      className={cn(
        "rp-glass rounded-2xl p-4 sm:p-5 flex flex-col gap-3 relative overflow-hidden min-w-[220px]",
        isBlack && "ring-1 ring-[var(--gold)]/40"
      )}
      style={{
        boxShadow: isBlack
          ? "0 0 0 1px rgba(212,175,55,0.4), 0 8px 40px -12px rgba(212,175,55,0.35)"
          : undefined,
      }}
      aria-labelledby={`tier-name-${tier.id}`}
    >
      {/* Accent stripe top */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(90deg, transparent, ${tier.color}, transparent)`,
        }}
      />

      {/* Header: icon + name */}
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
          style={{
            color: tier.color,
            borderColor: `${tier.color}55`,
            backgroundColor: `${tier.color}15`,
          }}
        >
          <TierIcon name={tier.icon} className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3
            id={`tier-name-${tier.id}`}
            className="font-display text-lg sm:text-xl font-medium leading-tight"
            style={{ color: tier.color }}
          >
            {tier.name}
          </h3>
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {isFrequency ? "Categoría frecuencia" : "Nivel VIP"}
          </p>
        </div>
      </div>

      {/* Thresholds */}
      {!isFrequency && (
        <div className="grid grid-cols-2 gap-2">
          <div className="rp-glass rounded-lg p-2.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              LTV mínimo
            </div>
            <div className="font-display text-base mt-0.5 text-foreground">
              €{tier.minLtv.toLocaleString("es-ES")}
            </div>
          </div>
          <div className="rp-glass rounded-lg p-2.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Visitas mín.
            </div>
            <div className="font-display text-base mt-0.5 text-foreground">
              {tier.minVisits}
            </div>
          </div>
        </div>
      )}

      {/* Client count */}
      <div className="flex items-baseline gap-2">
        <span
          className="font-display text-3xl font-light leading-none"
          style={{ color: tier.color }}
        >
          {tier.clients}
        </span>
        <span className="text-xs text-muted-foreground font-mono">clientes</span>
      </div>

      {/* Benefits */}
      <ul className="space-y-1.5 flex-1">
        {tier.benefits.map((b, i) => (
          <li key={i} className="flex gap-2 text-xs leading-relaxed text-foreground/80">
            <span
              className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
              style={{ backgroundColor: tier.color }}
              aria-hidden
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {/* Configure */}
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs w-full mt-1"
        onClick={() => onConfigure(tier)}
      >
        <Settings2 className="h-3.5 w-3.5 mr-1.5" aria-hidden />
        Configurar
        {tier.isSystem && (
          <span className="ml-1.5 text-[9px] font-mono uppercase tracking-wider text-muted-foreground/70">
            sistema
          </span>
        )}
      </Button>
    </motion.article>
  );
}

/* =========================================================
 * Configure tier dialog
 * =======================================================*/
function ConfigureTierDialog({
  tier,
  onOpenChange,
  onSave,
}: {
  tier: VipTier | null;
  onOpenChange: (v: boolean) => void;
  onSave: (t: VipTier) => void;
}) {
  const { toast } = useToast();
  const [name, setName] = React.useState("");
  const [minLtv, setMinLtv] = React.useState("0");
  const [minVisits, setMinVisits] = React.useState("0");
  const [benefitsText, setBenefitsText] = React.useState("");

  React.useEffect(() => {
    if (tier) {
      setName(tier.name);
      setMinLtv(String(tier.minLtv));
      setMinVisits(String(tier.minVisits));
      setBenefitsText(tier.benefits.join("\n"));
    }
  }, [tier]);

  const handleSave = () => {
    if (!tier) return;
    const updated: VipTier = {
      ...tier,
      name: name.trim() || tier.name,
      minLtv: Number(minLtv) || 0,
      minVisits: Number(minVisits) || 0,
      benefits: benefitsText
        .split("\n")
        .map((b) => b.trim())
        .filter(Boolean),
    };
    onSave(updated);
    toast({
      title: "Tier actualizado",
      description: `“${updated.name}” guardado. Los clientes se reclasificarán en la próxima ejecución.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={!!tier} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rp-scroll-thin bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            {tier && (
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg border"
                style={{
                  color: tier.color,
                  borderColor: `${tier.color}55`,
                  backgroundColor: `${tier.color}15`,
                }}
              >
                <TierIcon name={tier.icon} className="h-4 w-4" />
              </span>
            )}
            Configurar {tier?.name}
          </DialogTitle>
          <DialogDescription>
            Ajusta los umbrales y beneficios. Los cambios se aplican a futuras clasificaciones.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="tier-name-input" className="text-xs font-mono uppercase tracking-wider">
              Nombre del tier
            </Label>
            <Input
              id="tier-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background/40"
            />
          </div>

          {tier?.category === "tier" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tier-ltv" className="text-xs font-mono uppercase tracking-wider">
                  LTV mínimo (€)
                </Label>
                <Input
                  id="tier-ltv"
                  type="number"
                  min={0}
                  value={minLtv}
                  onChange={(e) => setMinLtv(e.target.value)}
                  className="bg-background/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tier-visits" className="text-xs font-mono uppercase tracking-wider">
                  Visitas mínimas
                </Label>
                <Input
                  id="tier-visits"
                  type="number"
                  min={0}
                  value={minVisits}
                  onChange={(e) => setMinVisits(e.target.value)}
                  className="bg-background/40"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="tier-benefits" className="text-xs font-mono uppercase tracking-wider">
              Beneficios (uno por línea)
            </Label>
            <textarea
              id="tier-benefits"
              value={benefitsText}
              onChange={(e) => setBenefitsText(e.target.value)}
              rows={5}
              className="w-full rounded-md border border-input bg-background/40 px-3 py-2 text-sm resize-y rp-scroll-thin focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30"
              placeholder="Puntos 1.5×&#10;Mesa preferente&#10;..."
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
          >
            <Check className="h-4 w-4 mr-2" aria-hidden />
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Suggestion row
 * =======================================================*/
function SuggestionRow({
  suggestion,
  tierColor,
  suggestedColor,
  reduceMotion,
  onApply,
  onReject,
  onPostpone,
}: {
  suggestion: VipSuggestion;
  tierColor: string;
  suggestedColor: string;
  reduceMotion: boolean | null;
  onApply: (s: VipSuggestion) => void;
  onReject: (s: VipSuggestion) => void;
  onPostpone: (s: VipSuggestion) => void;
}) {
  const isUpgrade =
    suggestion.suggestedTier !== suggestion.currentTier &&
    !suggestion.reason.toLowerCase().includes("caída");
  const confidenceTone =
    suggestion.confidence >= 80
      ? "emerald"
      : suggestion.confidence >= 60
      ? "gold"
      : "amber";

  return (
    <motion.div
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, x: -8 }}
      transition={{ duration: 0.3 }}
      className="rp-glass rounded-xl p-4 flex flex-col gap-3"
    >
      {/* Top: name + tier transition */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-foreground/5 font-display text-sm font-medium text-foreground">
            {suggestion.customerName.charAt(0)}
          </span>
          <span className="font-medium text-sm text-foreground truncate">
            {suggestion.customerName}
          </span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span
            className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider"
            style={{ color: tierColor, borderColor: `${tierColor}55`, backgroundColor: `${tierColor}15` }}
          >
            {suggestion.currentTier}
          </span>
          <ArrowRight
            className={cn("h-3.5 w-3.5", isUpgrade ? "rp-gold-text" : "text-amber-300")}
            aria-hidden
          />
          <span
            className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider"
            style={{ color: suggestedColor, borderColor: `${suggestedColor}55`, backgroundColor: `${suggestedColor}15` }}
          >
            {suggestion.suggestedTier}
          </span>
        </div>
      </div>

      {/* Reason */}
      <p className="text-xs text-foreground/80 leading-relaxed">
        {suggestion.reason}
      </p>

      {/* Confidence + factors */}
      <div className="flex flex-wrap items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider cursor-help",
                  confidenceTone === "emerald" && "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
                  confidenceTone === "gold" && "border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
                  confidenceTone === "amber" && "border-amber-400/30 bg-amber-400/10 text-amber-300"
                )}
              >
                <Sparkles className="h-3 w-3" aria-hidden />
                {suggestion.confidence}%
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Confianza del modelo IA en la sugerencia.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {suggestion.factors.map((f, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-md border border-foreground/10 bg-foreground/5 px-2 py-0.5 text-[11px] text-foreground/75"
          >
            <span className="h-1 w-1 rounded-full bg-[var(--teal)]" aria-hidden />
            {f}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/40">
        <Button
          size="sm"
          className="h-8 text-xs bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
          onClick={() => onApply(suggestion)}
        >
          <Check className="h-3.5 w-3.5 mr-1.5" aria-hidden />
          Aplicar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-muted-foreground hover:text-destructive"
          onClick={() => onReject(suggestion)}
        >
          <X className="h-3.5 w-3.5 mr-1.5" aria-hidden />
          Rechazar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs ml-auto"
          onClick={() => onPostpone(suggestion)}
        >
          <Clock3 className="h-3.5 w-3.5 mr-1.5" aria-hidden />
          Posponer
        </Button>
      </div>
    </motion.div>
  );
}

/* =========================================================
 * Main
 * =======================================================*/
export function CrmVip() {
  const reduceMotion = useReducedMotion();
  const { toast } = useToast();
  const [tiers, setTiers] = React.useState<VipTier[]>(INITIAL_TIERS);
  const [suggestions, setSuggestions] = React.useState<VipSuggestion[]>(INITIAL_SUGGESTIONS);
  const [configureTier, setConfigureTier] = React.useState<VipTier | null>(null);
  const [rulesOpen, setRulesOpen] = React.useState(false);

  const tierList = tiers.filter((t) => t.category === "tier");
  const freqList = tiers.filter((t) => t.category === "frequency");

  const tierColorMap = React.useMemo(() => {
    const m: Record<string, string> = {};
    tiers.forEach((t) => (m[t.name] = t.color));
    return m;
  }, [tiers]);

  const handleSaveTier = (t: VipTier) => {
    setTiers((prev) => prev.map((x) => (x.id === t.id ? t : x)));
  };

  const handleApply = (s: VipSuggestion) => {
    setSuggestions((prev) => prev.filter((x) => x.id !== s.id));
    toast({
      title: "Clasificación aplicada",
      description: `${s.customerName} reclassificado a ${s.suggestedTier}. Acción reversible desde auditoría.`,
    });
  };

  const handleReject = (s: VipSuggestion) => {
    setSuggestions((prev) => prev.filter((x) => x.id !== s.id));
    toast({
      title: "Sugerencia rechazada",
      description: `${s.customerName} permanece en ${s.currentTier}.`,
    });
  };

  const handlePostpone = (s: VipSuggestion) => {
    setSuggestions((prev) => prev.filter((x) => x.id !== s.id));
    toast({
      title: "Sugerencia pospuesta",
      description: `La IA reevaluará a ${s.customerName} en 7 días.`,
    });
  };

  const RULES = [
    { factor: "Gasto total (LTV)", weight: "30%", desc: "Valor acumulado de todas las visitas del cliente." },
    { factor: "Frecuencia de visita", weight: "20%", desc: "Número de visitas en los últimos 12 meses." },
    { factor: "Recencia", weight: "10%", desc: "Días desde la última visita." },
    { factor: "Ticket medio", weight: "10%", desc: "Gasto medio por visita." },
    { factor: "Interacción", weight: "8%", desc: "Apertura de campañas, respuestas, uso de cupones." },
    { factor: "Antigüedad", weight: "7%", desc: "Meses desde el alta del cliente." },
    { factor: "Rentabilidad", weight: "8%", desc: "Margen neto generado tras costes." },
    { factor: "Reseñas y referidos", weight: "7%", desc: "Valoraciones positivas y clientes referidos." },
  ];

  return (
    <section className="space-y-6 sm:space-y-8" aria-labelledby="crm-vip-heading">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/10">
            <CrownAlt className="h-5 w-5 rp-gold-text" aria-hidden />
          </span>
          <div>
            <h2
              id="crm-vip-heading"
              className="font-display text-xl sm:text-2xl font-medium tracking-tight text-foreground"
            >
              Clasificación VIP y fidelización
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tiers configurables, beneficios y sugerencias de reclasificación por IA.
            </p>
          </div>
          <Badge
            variant="outline"
            className="ml-1 border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)] font-mono uppercase tracking-wider text-[10px]"
          >
            demo
          </Badge>
        </div>
      </header>

      {/* Tier overview */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-base sm:text-lg font-medium text-foreground">
            Niveles VIP
          </h3>
          <span className="text-xs text-muted-foreground font-mono">
            {tierList.length} tiers · {freqList.length} categorías
          </span>
        </div>
        <div className="flex gap-4 overflow-x-auto rp-scroll-thin pb-3 -mx-1 px-1 snap-x">
          <AnimatePresence>
            {tierList.map((t, i) => (
              <div key={t.id} className="snap-start shrink-0 w-[260px] sm:w-[280px]">
                <TierCard
                  tier={t}
                  index={i}
                  reduceMotion={reduceMotion}
                  onConfigure={(tier) => setConfigureTier(tier)}
                />
              </div>
            ))}
          </AnimatePresence>
        </div>

        {/* Frequency categories */}
        <div className="flex items-center gap-2 pt-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Categorías de frecuencia
          </h4>
          <div className="h-px flex-1 bg-border/40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {freqList.map((t, i) => (
            <TierCard
              key={t.id}
              tier={t}
              index={i + tierList.length}
              reduceMotion={reduceMotion}
              onConfigure={(tier) => setConfigureTier(tier)}
            />
          ))}
        </div>
      </div>

      {/* AI suggestions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/10">
            <Sparkles className="h-4 w-4 rp-gold-text" aria-hidden />
          </span>
          <h3 className="font-display text-base sm:text-lg font-medium text-foreground">
            Sugerencias de reclasificación (IA)
          </h3>
          <Badge
            variant="outline"
            className="border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)] font-mono uppercase tracking-wider text-[10px]"
          >
            {suggestions.length} pendientes
          </Badge>
        </div>

        <AnimatePresence mode="popLayout">
          {suggestions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {suggestions.map((s) => (
                <SuggestionRow
                  key={s.id}
                  suggestion={s}
                  tierColor={tierColorMap[s.currentTier] ?? "#9CA3AF"}
                  suggestedColor={tierColorMap[s.suggestedTier] ?? "#D4AF37"}
                  reduceMotion={reduceMotion}
                  onApply={handleApply}
                  onReject={handleReject}
                  onPostpone={handlePostpone}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rp-glass rounded-2xl p-10 text-center"
            >
              <ShieldCheck className="h-8 w-8 mx-auto rp-teal-text mb-3" aria-hidden />
              <p className="text-sm text-foreground font-medium">Sin sugerencias pendientes</p>
              <p className="text-xs text-muted-foreground mt-1">
                La IA evalúa reclasificaciones cada noche. Vuelve mañana.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="flex items-start gap-2 text-[11px] text-muted-foreground leading-relaxed">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
          <span>
            La IA sugiere. La decisión es tuya y siempre reversible desde el panel de auditoría.
          </span>
        </p>
      </div>

      {/* Tier rules explanation */}
      <Collapsible open={rulesOpen} onOpenChange={setRulesOpen} className="rp-glass rounded-2xl">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 p-4 sm:p-5 text-left"
            aria-expanded={rulesOpen}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--teal)]/30 bg-[var(--teal)]/10">
                <Info className="h-4 w-4 rp-teal-text" aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-base sm:text-lg font-medium text-foreground">
                  Cómo se calcula la clasificación
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Factores ponderados que la IA y las reglas deterministas evalúan.
                </p>
              </div>
            </div>
            <motion.span
              animate={{ rotate: rulesOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0"
            >
              <ChevronDown className="h-5 w-5 text-muted-foreground" aria-hidden />
            </motion.span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-border/40 p-4 sm:p-5 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RULES.map((r, i) => (
                <motion.div
                  key={r.factor}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: reduceMotion ? 0 : i * 0.04 }}
                  className="flex items-start gap-3 rp-glass rounded-lg p-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/10 rp-gold-text font-display text-sm font-medium">
                    {r.weight}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">{r.factor}</div>
                    <div className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                      {r.desc}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="mt-4 flex items-start gap-2 text-[11px] text-muted-foreground leading-relaxed">
              <Heart className="h-3.5 w-3.5 shrink-0 mt-0.5 rp-gold-text" aria-hidden />
              <span>
                Los umbrales LTV + visitas definen el tier mínimo. La IA puede proponer reclasificaciones
                basadas en tendencia y proyección, siempre revisables por el equipo.
              </span>
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Disclaimer */}
      <footer className="rp-glass rounded-xl p-4 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--teal)]/30 bg-[var(--teal)]/10">
          <ShieldCheck className="h-3.5 w-3.5 rp-teal-text" aria-hidden />
        </span>
        <p className="text-xs leading-relaxed text-muted-foreground">
          La clasificación VIP es configurable por organización.{" "}
          <span className="text-foreground/80 font-medium">
            La IA puede sugerir, pero la decisión final es auditable y reversible.
          </span>
        </p>
      </footer>

      {/* Configure dialog */}
      <ConfigureTierDialog
        tier={configureTier}
        onOpenChange={(v) => !v && setConfigureTier(null)}
        onSave={handleSaveTier}
      />
    </section>
  );
}
