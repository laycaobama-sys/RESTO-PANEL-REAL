"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  CheckCircle2, Move, Clock, Ban, GitMerge, Split, CreditCard,
  Crown, UsersRound, RefreshCw, Sparkles, Info, TrendingUp,
  ArrowRight, Cpu, ShieldAlert, Zap,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type YieldType =
  | "accept"
  | "move"
  | "adjust_duration"
  | "block_slot"
  | "merge_tables"
  | "split_table"
  | "activate_deposit"
  | "prioritize_group"
  | "release_waitlist";

type YieldStatus = "pending" | "applied" | "dismissed";

interface YieldRecommendation {
  id: string;
  type: YieldType;
  title: string;
  description: string;
  estimatedImpact: string;
  confidence: number;
  factors: string[];
  modelVersion: string;
  status: YieldStatus;
}

/* =========================================================
 * Type meta
 * =======================================================*/
const TYPE_META: Record<
  YieldType,
  {
    icon: React.ElementType;
    label: string;
    tone: "gold" | "teal" | "emerald" | "amber" | "destructive";
  }
> = {
  accept: { icon: CheckCircle2, label: "Aceptar", tone: "emerald" },
  move: { icon: Move, label: "Mover", tone: "teal" },
  adjust_duration: { icon: Clock, label: "Duración", tone: "amber" },
  block_slot: { icon: Ban, label: "Bloquear slot", tone: "destructive" },
  merge_tables: { icon: GitMerge, label: "Fusionar mesas", tone: "teal" },
  split_table: { icon: Split, label: "Dividir mesa", tone: "teal" },
  activate_deposit: { icon: CreditCard, label: "Activar depósito", tone: "gold" },
  prioritize_group: { icon: Crown, label: "Priorizar grupo", tone: "gold" },
  release_waitlist: { icon: UsersRound, label: "Liberar espera", tone: "emerald" },
};

const TONE_CLASS: Record<string, string> = {
  gold: "bg-[var(--gold)]/10 text-[var(--gold-soft)] border-[var(--gold)]/25",
  teal: "bg-[var(--teal)]/10 text-[var(--teal)] border-[var(--teal)]/25",
  emerald: "bg-emerald-400/10 text-emerald-300 border-emerald-400/25",
  amber: "bg-amber-400/10 text-amber-300 border-amber-400/25",
  destructive: "bg-destructive/10 text-destructive border-destructive/25",
};

const TONE_ICON_BG: Record<string, string> = {
  gold: "bg-[var(--gold)]/12 text-[var(--gold)]",
  teal: "bg-[var(--teal)]/12 text-[var(--teal)]",
  emerald: "bg-emerald-400/12 text-emerald-300",
  amber: "bg-amber-400/12 text-amber-300",
  destructive: "bg-destructive/12 text-destructive",
};

/* =========================================================
 * Demo data
 * =======================================================*/
const INITIAL_RECS: YieldRecommendation[] = [
  {
    id: "y1",
    type: "move",
    title: "Mover reserva de las 21:30 a las 21:00",
    description:
      "Mesa 14 (Sala) queda libre a las 21:00. Mover la reserva de Marco B. reduce el gap entre servicios y libera capacidad para una reserva posterior.",
    estimatedImpact: "+€180 ingresos estimados",
    confidence: 86,
    factors: [
      "Gap de 45 min en mesa 14 a partir de 21:00",
      "Reserva pendiente de 6p para 21:30 en lista de espera",
      "Cliente no ha solicitado horario estricto",
    ],
    modelVersion: "yield-opt-v1.3.0",
    status: "pending",
  },
  {
    id: "y2",
    type: "merge_tables",
    title: "Fusionar mesas 7 + 8 para grupo de 8",
    description:
      "Grupo de 8 (cumpleaños) confirmado. Fusionar mesas 7 y 8 (Terraza) libera la mesa 12 para otra reserva de 4 a las 22:00.",
    estimatedImpact: "+€320 ingresos · +1 rotación",
    confidence: 92,
    factors: [
      "Mesas 7+8 adyacentes en Terraza",
      "Mesa 12 tiene demanda confirmada para 22:00",
      "Grupo VIP recurrente (LTV €4.200)",
    ],
    modelVersion: "yield-opt-v1.3.0",
    status: "pending",
  },
  {
    id: "y3",
    type: "activate_deposit",
    title: "Activar depósito de 30€/persona en reserva de Marco B.",
    description:
      "Cliente con score de no-show de 82/100. Activar depósito reduce el riesgo financiero y desincentiva el no-show.",
    estimatedImpact: "−€420 riesgo de no-show",
    confidence: 78,
    factors: [
      "Score no-show 82/100 (CRÍTICO)",
      "2 no-shows previos en 6 meses",
      "Reserva sin garantía actual",
    ],
    modelVersion: "yield-opt-v1.3.0",
    status: "pending",
  },
  {
    id: "y4",
    type: "adjust_duration",
    title: "Acortar duración de reserva de las 14:00 a 90 min",
    description:
      "3 reservas del turno de comida están en horario solapado. Acortar a 90 min permite encajar la 4ª reserva sin afectar experiencia.",
    estimatedImpact: "+€140 ingresos · +1 reserva",
    confidence: 71,
    factors: [
      "3 reservas solapadas en Salón entre 14:00 y 15:30",
      "Ticket medio €38 (<=4 platos)",
      "Histórico: 82% de comensales salen antes de 90 min en este turno",
    ],
    modelVersion: "yield-opt-v1.3.0",
    status: "pending",
  },
  {
    id: "y5",
    type: "release_waitlist",
    title: "Ofrecer mesa a la 1ª entrada de la lista de espera",
    description:
      "Mesa 5 (Barra) libre ahora. La 1ª entrada en espera (Andrea R., 2p, esperando 11 min) tiene probabilidad de aceptación del 94%.",
    estimatedImpact: "+€55 ingresos inmediatos",
    confidence: 94,
    factors: [
      "Mesa 5 libre con 0 min de cleaning",
      "1ª en espera: VIP, 2p, 11 min esperando",
      "Probabilidad de aceptación 94%",
    ],
    modelVersion: "yield-opt-v1.3.0",
    status: "applied",
  },
  {
    id: "y6",
    type: "block_slot",
    title: "Bloquear slot 23:00-23:30 en Terraza",
    description:
      "Demanda estimada baja para ese slot (12% de ocupación). Bloquearlo permite priorizar limpieza profunda y reducir coste operativo.",
    estimatedImpact: "−€35 coste operativo",
    confidence: 64,
    factors: [
      "Demanda estimada baja (12%)",
      "3 mesas libres acumuladas en Terraza",
      "Necesidad de cleaning profundo post-cena",
    ],
    modelVersion: "yield-opt-v1.3.0",
    status: "pending",
  },
];

/* =========================================================
 * Helpers
 * =======================================================*/
function confidenceClass(c: number) {
  if (c >= 85) return "bg-emerald-400/10 text-emerald-300 border-emerald-400/30";
  if (c >= 65) return "bg-amber-400/10 text-amber-300 border-amber-400/30";
  return "bg-destructive/10 text-destructive border-destructive/30";
}

/* =========================================================
 * Recommendation card
 * =======================================================*/
function RecCard({
  rec,
  index,
  onApply,
  onDismiss,
  onDetail,
}: {
  rec: YieldRecommendation;
  index: number;
  onApply: () => void;
  onDismiss: () => void;
  onDetail: () => void;
}) {
  const reduce = useReducedMotion();
  const meta = TYPE_META[rec.type];
  const Icon = meta.icon;
  const applied = rec.status === "applied";

  return (
    <motion.article
      layout={reduce ? false : true}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.28, delay: reduce ? 0 : index * 0.04 }}
      className={cn(
        "rp-glass rounded-2xl p-4 sm:p-5",
        applied && "ring-1 ring-emerald-400/30"
      )}
    >
      <div className="flex items-start gap-3.5">
        <span
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
            TONE_ICON_BG[meta.tone]
          )}
        >
          <Icon className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                    TONE_CLASS[meta.tone]
                  )}
                >
                  {meta.label}
                </span>
                {applied && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" />
                    Aplicada
                  </span>
                )}
              </div>
              <h4 className="mt-1.5 text-sm font-medium text-foreground sm:text-[15px]">
                {rec.title}
              </h4>
            </div>

            <div className="text-right">
              <div className="rp-gold-text font-mono text-sm font-medium tabular-nums">
                {rec.estimatedImpact}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                impacto estimado
              </div>
            </div>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {rec.description}
          </p>

          {/* Factors */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {rec.factors.map((f, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-foreground/[0.04] px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                <Sparkles className="h-2.5 w-2.5 text-[var(--gold)]" />
                {f}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={cn(
                      "inline-flex cursor-help items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-mono",
                      confidenceClass(rec.confidence)
                    )}
                  >
                    <ShieldAlert className="h-3 w-3" />
                    {rec.confidence}%
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px]">
                  Confianza del modelo en la recomendación. Mayor % = más señales disponibles.
                </TooltipContent>
              </Tooltip>
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Cpu className="h-3 w-3" />
                <code className="font-mono">{rec.modelVersion}</code>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 text-xs"
                onClick={onDetail}
              >
                <Info className="h-3.5 w-3.5" />
                Ver detalle
              </Button>
              {applied ? (
                <Badge
                  variant="outline"
                  className="border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                >
                  Aplicada
                </Badge>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive"
                    onClick={onDismiss}
                  >
                    Descartar
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 bg-[var(--gold)] text-[#0a0a0a] px-3 text-xs hover:bg-[var(--gold-soft)]"
                    onClick={onApply}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Aplicar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/* =========================================================
 * Detail dialog
 * =======================================================*/
function DetailDialog({
  rec,
  open,
  onClose,
}: {
  rec: YieldRecommendation | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!rec) return null;
  const meta = TYPE_META[rec.type];
  const Icon = meta.icon;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "grid h-9 w-9 place-items-center rounded-xl",
                TONE_ICON_BG[meta.tone]
              )}
            >
              <Icon className="h-4.5 w-4.5" />
            </span>
            <div>
              <DialogTitle className="text-base">{rec.title}</DialogTitle>
              <DialogDescription className="text-xs">
                {meta.label} · {rec.modelVersion}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {rec.description}
          </p>

          <div className="rp-glass rounded-xl p-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Impacto estimado
            </div>
            <div className="mt-1 rp-gold-text font-display text-2xl font-light tabular-nums">
              {rec.estimatedImpact}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rp-glass rounded-xl p-3.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Confianza
              </div>
              <div className="mt-1 text-lg font-medium tabular-nums text-foreground">
                {rec.confidence}%
              </div>
            </div>
            <div className="rp-glass rounded-xl p-3.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Estado
              </div>
              <div className="mt-1 text-lg font-medium text-foreground capitalize">
                {rec.status === "pending"
                  ? "Pendiente"
                  : rec.status === "applied"
                  ? "Aplicada"
                  : "Descartada"}
              </div>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Factores considerados
            </div>
            <ul className="mt-2 space-y-1.5">
              {rec.factors.map((f, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-foreground/85"
                >
                  <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--teal)]" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter className="text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            Las recomendaciones son sugerencias. No modifican reservas sin autorización.
          </span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Main component
 * =======================================================*/
export function YieldPanel() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [recs, setRecs] = React.useState<YieldRecommendation[]>(INITIAL_RECS);
  const [generating, setGenerating] = React.useState(false);
  const [detail, setDetail] = React.useState<YieldRecommendation | null>(null);

  const apply = (id: string) => {
    setRecs((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "applied" } : r))
    );
    const r = recs.find((x) => x.id === id);
    toast({
      title: "Recomendación aplicada",
      description: r ? `${r.title} · ${r.estimatedImpact}` : "",
    });
  };

  const dismiss = (id: string) => {
    setRecs((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "dismissed" } : r))
    );
    toast({
      title: "Recomendación descartada",
      description: "No se ha modificado ninguna reserva ni política.",
    });
  };

  const generate = () => {
    setGenerating(true);
    window.setTimeout(() => {
      setGenerating(false);
      // Reset statuses to pending (simulates a fresh run)
      setRecs((prev) =>
        prev.map((r, i) => ({
          ...r,
          status: i === 4 ? "applied" : "pending",
        }))
      );
      toast({
        title: "Recomendaciones generadas",
        description: `${recs.length} recomendaciones actualizadas · yield-opt-v1.3.0`,
      });
    }, 1400);
  };

  const visible = recs.filter((r) => r.status !== "dismissed");
  const counts = {
    pending: recs.filter((r) => r.status === "pending").length,
    applied: recs.filter((r) => r.status === "applied").length,
    dismissed: recs.filter((r) => r.status === "dismissed").length,
  };

  return (
    <TooltipProvider delayDuration={150}>
      <section aria-labelledby="yield-title" className="flex flex-col gap-5">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--gold)]/10 text-[var(--gold)]">
                <TrendingUp className="h-5 w-5" />
              </span>
              <h2
                id="yield-title"
                className="font-display text-xl sm:text-2xl font-medium tracking-tight"
              >
                Yield Management
              </h2>
              <Badge
                variant="outline"
                className="border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)] font-mono text-[10px] uppercase tracking-wider"
              >
                demo
              </Badge>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Recomendaciones accionables para optimizar ingresos y ocupación.
            </p>
          </div>

          <Button
            variant="outline"
            className="h-10"
            onClick={generate}
            disabled={generating}
          >
            <RefreshCw className={cn("h-4 w-4", generating && "animate-spin")} />
            {generating ? "Generando…" : "Generar recomendaciones"}
          </Button>
        </header>

        {/* Summary bar */}
        <div className="rp-glass rounded-2xl p-4 sm:p-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <SummaryCell
              icon={UsersRound}
              label="Ocupación actual"
              value="78%"
              sub="3 de 38 mesas libres"
              tone="gold"
            />
            <SummaryCell
              icon={Zap}
              label="Demanda estimada"
              value="Alta"
              sub="viernes 21:00–22:30"
              tone="teal"
            />
            <SummaryCell
              icon={Clock}
              label="Horario crítico"
              value="21:30"
              sub="overbook 4 reservas"
              tone="amber"
            />
            <SummaryCell
              icon={Sparkles}
              label="Aplicadas hoy"
              value={`${counts.applied}`}
              sub={`${counts.pending} pendientes`}
              tone="emerald"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex flex-col gap-3.5">
          <AnimatePresence mode="popLayout">
            {visible.map((r, i) => (
              <RecCard
                key={r.id}
                rec={r}
                index={i}
                onApply={() => apply(r.id)}
                onDismiss={() => dismiss(r.id)}
                onDetail={() => setDetail(r)}
              />
            ))}
          </AnimatePresence>

          {visible.length === 0 && (
            <div className="rp-glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
              No hay recomendaciones pendientes.
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="rp-glass flex items-start gap-3 rounded-xl border-l-2 border-[var(--gold)]/60 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 rp-gold-text" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Las recomendaciones son <span className="text-foreground">sugerencias</span>.
            No modifican reservas, precios ni políticas sin autorización. Toda acción se
            registra en el log de auditoría del restaurante.
          </p>
        </div>

        <DetailDialog
          rec={detail}
          open={!!detail}
          onClose={() => setDetail(null)}
        />
      </section>
    </TooltipProvider>
  );
}

/* =========================================================
 * Summary cell
 * =======================================================*/
function SummaryCell({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  tone: "gold" | "teal" | "amber" | "emerald";
}) {
  const colorMap: Record<string, string> = {
    gold: "rp-gold-text",
    teal: "rp-teal-text",
    amber: "text-amber-300",
    emerald: "text-emerald-300",
  };
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        <Icon className={cn("h-3 w-3", colorMap[tone])} />
        {label}
      </div>
      <div
        className={cn(
          "mt-1 font-display text-xl font-light tabular-nums sm:text-2xl",
          colorMap[tone]
        )}
      >
        {value}
      </div>
      <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}
