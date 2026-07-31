"use client";

/* ============================================================================
 * RestoPanel · IA Automation Builder (Plataforma Abierta · Fase 8)
 * Natural-language → visual automation flow. Top: NL input + AI analysis;
 * Bottom: generated visual flow (trigger → conditions → actions → wait →
 * branches). Test-run dialog, publish confirm, demo-navegable.
 * FASE8-MKT-WH-AI · dark theme (gold #D4AF37 / teal #3DD6C9).
 * ========================================================================== */

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  Wand2,
  Brain,
  Lock,
  Send,
  Clock,
  GitBranch,
  Zap,
  ArrowRight,
  Mail,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  Play,
  Rocket,
  Pencil,
  ShieldCheck,
  Info,
  TrendingUp,
  Star,
  Gift,
  CalendarCheck,
  UserCheck,
  BellRing,
  Tag,
  FileText,
  Cog,
  Database,
  FlaskConical,
  Terminal,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* --------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------ */

type NodeType = "trigger" | "condition" | "action" | "wait" | "branch_yes" | "branch_no";
type Accent = "gold" | "teal" | "amber" | "emerald" | "rose" | "fuchsia";

interface FlowNode {
  id: string;
  type: NodeType;
  icon: LucideIcon;
  title: string;
  summary: string;
  accent: Accent;
}

interface AiAnalysis {
  intent: string;
  permissions: string[];
  costPerRun: string;
  risks: string;
  riskTone: "ok" | "warn";
  confidence: number;
  model: string;
}

interface FlowDefinition {
  key: string;
  triggerLabel: string;
  nodes: FlowNode[];
  analysis: AiAnalysis;
}

/* --------------------------------------------------------------------------
 * Accent system
 * ------------------------------------------------------------------------ */

const ACCENT: Record<Accent, { chip: string; ring: string; text: string; dot: string; border: string; glow: string }> = {
  gold: {
    chip: "bg-[var(--gold)]/15 text-[var(--gold)] border-[var(--gold)]/30",
    ring: "ring-1 ring-[var(--gold)]/30",
    text: "text-[var(--gold)]",
    dot: "bg-[var(--gold)]",
    border: "border-[var(--gold)]/30",
    glow: "rp-glow-gold",
  },
  teal: {
    chip: "bg-[var(--teal)]/15 text-[var(--teal)] border-[var(--teal)]/30",
    ring: "ring-1 ring-[var(--teal)]/30",
    text: "text-[var(--teal)]",
    dot: "bg-[var(--teal)]",
    border: "border-[var(--teal)]/30",
    glow: "rp-glow-teal",
  },
  amber: {
    chip: "bg-amber-400/15 text-amber-300 border-amber-400/30",
    ring: "ring-1 ring-amber-400/30",
    text: "text-amber-300",
    dot: "bg-amber-400",
    border: "border-amber-400/30",
    glow: "",
  },
  emerald: {
    chip: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
    ring: "ring-1 ring-emerald-400/30",
    text: "text-emerald-300",
    dot: "bg-emerald-400",
    border: "border-emerald-400/30",
    glow: "",
  },
  rose: {
    chip: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    ring: "ring-1 ring-rose-500/30",
    text: "text-rose-300",
    dot: "bg-rose-500",
    border: "border-rose-500/30",
    glow: "",
  },
  fuchsia: {
    chip: "bg-fuchsia-400/15 text-fuchsia-300 border-fuchsia-400/30",
    ring: "ring-1 ring-fuchsia-400/30",
    text: "text-fuchsia-300",
    dot: "bg-fuchsia-400",
    border: "border-fuchsia-400/30",
    glow: "",
  },
};

const NODE_TYPE_META: Record<NodeType, { label: string }> = {
  trigger: { label: "Disparador" },
  condition: { label: "Condición" },
  action: { label: "Acción" },
  wait: { label: "Espera" },
  branch_yes: { label: "Si sí" },
  branch_no: { label: "Si no" },
};

/* --------------------------------------------------------------------------
 * Pre-defined flow definitions
 * ------------------------------------------------------------------------ */

const FLOWS: Record<string, FlowDefinition> = {
  vip: {
    key: "vip",
    triggerLabel: "Cliente VIP inactivo 60 días",
    nodes: [
      { id: "n1", type: "trigger", icon: Zap, title: "Cliente VIP inactivo 60 días", summary: "Segmento: tier=VIP AND última visita ≥ 60 días", accent: "gold" },
      { id: "n2", type: "condition", icon: GitBranch, title: "¿Consentimiento WhatsApp?", summary: "Verifica opt-in marketing en ficha cliente", accent: "teal" },
      { id: "n3", type: "action", icon: MessageCircle, title: "Enviar WhatsApp con oferta personalizada", summary: "Plantilla: winback_vip_v2 · 20% descuento", accent: "gold" },
      { id: "n4", type: "wait", icon: Clock, title: "Esperar 48h", summary: "Retraso antes de evaluar respuesta", accent: "amber" },
      { id: "n5", type: "condition", icon: GitBranch, title: "¿Ha reservado?", summary: "Comprueba nuevas reservas tras envío", accent: "teal" },
      { id: "n6", type: "branch_yes", icon: CheckCircle2, title: "Marcar como recuperado + nota CRM", summary: "Tag: winback_ok · nota automática en ficha", accent: "emerald" },
      { id: "n7", type: "branch_no", icon: Mail, title: "Enviar email recordatorio", summary: "Plantilla: winback_vip_email · 25% descuento", accent: "gold" },
    ],
    analysis: {
      intent: "Recuperar clientes inactivos VIP",
      permissions: ["read:customers", "send:whatsapp", "send:email", "write:crm"],
      costPerRun: "0,02 €",
      risks: "Requiere consentimiento de marketing",
      riskTone: "warn",
      confidence: 86,
      model: "glm-4-flash vía AI Gateway",
    },
  },
  inactive: {
    key: "inactive",
    triggerLabel: "Cliente inactivo 90 días",
    nodes: [
      { id: "n1", type: "trigger", icon: Zap, title: "Cliente inactivo 90 días", summary: "Sin visitas en los últimos 90 días", accent: "gold" },
      { id: "n2", type: "condition", icon: GitBranch, title: "¿Tiene email válido?", summary: "Verifica email en ficha y opt-in", accent: "teal" },
      { id: "n3", type: "action", icon: Mail, title: "Enviar email winback", summary: "Plantilla: winback_90d · 15% descuento", accent: "gold" },
      { id: "n4", type: "wait", icon: Clock, title: "Esperar 7 días", summary: "Retraso antes de siguiente paso", accent: "amber" },
      { id: "n5", type: "condition", icon: GitBranch, title: "¿Ha abierto el email?", summary: "Comprueba aperturas en los últimos 7 días", accent: "teal" },
      { id: "n6", type: "branch_yes", icon: CheckCircle2, title: "Marcar reengaged + 50 pts fidelidad", summary: "Tag: winback_ok · puntos bonificación", accent: "emerald" },
      { id: "n7", type: "branch_no", icon: Tag, title: "Etiquetar como churn-risk alto", summary: "Tag: churn_high · añadir a segmento de seguimiento", accent: "rose" },
    ],
    analysis: {
      intent: "Recuperar clientes inactivos hace 90 días",
      permissions: ["read:customers", "send:email", "write:crm"],
      costPerRun: "0,01 €",
      risks: "Ninguno crítico",
      riskTone: "ok",
      confidence: 91,
      model: "glm-4-flash vía AI Gateway",
    },
  },
  confirm: {
    key: "confirm",
    triggerLabel: "Reserva creada — confirmar por WhatsApp 24h antes",
    nodes: [
      { id: "n1", type: "trigger", icon: CalendarCheck, title: "Reserva creada", summary: "Nueva reserva con estado pendiente", accent: "gold" },
      { id: "n2", type: "wait", icon: Clock, title: "Esperar hasta T-24h", summary: "Calcula 24h antes de la fecha de reserva", accent: "amber" },
      { id: "n3", type: "condition", icon: GitBranch, title: "¿Consentimiento WhatsApp?", summary: "Verifica opt-in canal WhatsApp", accent: "teal" },
      { id: "n4", type: "action", icon: MessageCircle, title: "Enviar WhatsApp de confirmación", summary: "Plantilla: reconfirmacion_t24h", accent: "gold" },
      { id: "n5", type: "wait", icon: Clock, title: "Esperar 2h", summary: "Tiempo límite para respuesta del cliente", accent: "amber" },
      { id: "n6", type: "condition", icon: GitBranch, title: "¿Cliente confirmó?", summary: "Comprueba respuesta o cambio de estado", accent: "teal" },
      { id: "n7", type: "branch_no", icon: BellRing, title: "Notificar al maître", summary: "Alerta en dashboard + WhatsApp interno", accent: "rose" },
    ],
    analysis: {
      intent: "Confirmar reservas por WhatsApp 24h antes",
      permissions: ["read:reservations", "send:whatsapp", "write:reservations", "manage:staff"],
      costPerRun: "0,015 €",
      risks: "Ninguno crítico",
      riskTone: "ok",
      confidence: 89,
      model: "glm-4-flash vía AI Gateway",
    },
  },
  birthday: {
    key: "birthday",
    triggerLabel: "Cumpleaños de cliente VIP",
    nodes: [
      { id: "n1", type: "trigger", icon: Gift, title: "Cumpleaños cliente VIP", summary: "Trigger diario · tier=VIP AND fecha cumpleaños=hoy", accent: "gold" },
      { id: "n2", type: "condition", icon: GitBranch, title: "¿Consentimiento email marketing?", summary: "Verifica opt-in email en ficha", accent: "teal" },
      { id: "n3", type: "action", icon: Mail, title: "Enviar email de cumpleaños", summary: "Plantilla: oferta_cumpleanos · 30% descuento", accent: "gold" },
      { id: "n4", type: "action", icon: UserCheck, title: "Añadir 100 pts fidelidad", summary: "Bonificación automática de puntos", accent: "emerald" },
      { id: "n5", type: "wait", icon: Clock, title: "Esperar 7 días", summary: "Ventana para canjear oferta", accent: "amber" },
      { id: "n6", type: "condition", icon: GitBranch, title: "¿Cliente reservó?", summary: "Comprueba reservas vinculadas al cupón", accent: "teal" },
      { id: "n7", type: "branch_yes", icon: CheckCircle2, title: "Marcar birthday_redeemed + nota CRM", summary: "Tag: birthday_ok · registro en ficha", accent: "emerald" },
    ],
    analysis: {
      intent: "Enviar cupón de cumpleaños a clientes VIP",
      permissions: ["read:customers", "send:email", "write:crm"],
      costPerRun: "0,008 €",
      risks: "Ninguno crítico",
      riskTone: "ok",
      confidence: 94,
      model: "glm-4-flash vía AI Gateway",
    },
  },
  generic: {
    key: "generic",
    triggerLabel: "Automatización genérica",
    nodes: [
      { id: "n1", type: "trigger", icon: Zap, title: "Evento detectado", summary: "Trigger configurable según descripción", accent: "gold" },
      { id: "n2", type: "condition", icon: GitBranch, title: "¿Cumple condiciones?", summary: "Filtros personalizados por IA", accent: "teal" },
      { id: "n3", type: "action", icon: Send, title: "Ejecutar acción principal", summary: "Acción sugerida según análisis", accent: "gold" },
      { id: "n4", type: "wait", icon: Clock, title: "Esperar respuesta", summary: "Retraso configurable", accent: "amber" },
      { id: "n5", type: "condition", icon: GitBranch, title: "¿Éxito?", summary: "Evalúa resultado tras la espera", accent: "teal" },
      { id: "n6", type: "branch_yes", icon: CheckCircle2, title: "Registrar éxito + nota CRM", summary: "Actualiza ficha del cliente", accent: "emerald" },
      { id: "n7", type: "branch_no", icon: Mail, title: "Enviar recordatorio alternativo", summary: "Canal secundario de seguimiento", accent: "gold" },
    ],
    analysis: {
      intent: "Automatización personalizada",
      permissions: ["read:customers", "send:email", "write:crm"],
      costPerRun: "0,012 €",
      risks: "Revisa los permisos antes de publicar",
      riskTone: "warn",
      confidence: 72,
      model: "glm-4-flash vía AI Gateway",
    },
  },
};

const SUGGESTIONS = [
  "Quiero una automatización para clientes VIP",
  "Recuperar clientes inactivos hace 90 días",
  "Confirmar reservas por WhatsApp 24h antes",
  "Enviar cupón de cumpleaños a clientes VIP",
];

/* --------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------ */

function pickFlow(text: string): FlowDefinition {
  const t = text.toLowerCase();
  if (t.includes("vip") && (t.includes("cumple") || t.includes("birthday"))) return FLOWS.birthday;
  if (t.includes("vip")) return FLOWS.vip;
  if (t.includes("inactiv")) return FLOWS.inactive;
  if (t.includes("confirm") || t.includes("reserva")) return FLOWS.confirm;
  if (t.includes("cumple")) return FLOWS.birthday;
  return FLOWS.generic;
}

function permTone(perm: string): string {
  const [, action] = perm.split(":");
  if (action === "write" || action === "manage")
    return "border-amber-400/40 bg-amber-400/10 text-amber-300";
  if (action === "send") return "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]";
  return "border-foreground/15 bg-foreground/5 text-foreground/70";
}

/* --------------------------------------------------------------------------
 * Demo badge
 * ------------------------------------------------------------------------ */
function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-amber-300">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      demo
    </span>
  );
}

/* --------------------------------------------------------------------------
 * Main component
 * ------------------------------------------------------------------------ */
export function IaAutomationBuilder() {
  const prefersReduced = useReducedMotion();
  const { toast } = useToast();

  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [flow, setFlow] = React.useState<FlowDefinition | null>(null);
  const [testDialog, setTestDialog] = React.useState(false);
  const [publishDialog, setPublishDialog] = React.useState(false);

  function handleGenerate() {
    const text = input.trim();
    if (!text) {
      toast({
        title: "Describe tu automatización",
        description: "Escribe qué quieres automatizar o elige una sugerencia.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setFlow(null);
    setTimeout(() => {
      setFlow(pickFlow(text));
      setLoading(false);
    }, 2000);
  }

  function handleEditFlow() {
    toast({
      title: "Abriendo editor visual…",
      description: "Serás redirigido al builder avanzado (demo).",
    });
  }

  function handleTest() {
    setTestDialog(true);
  }

  function handlePublishConfirm() {
    setPublishDialog(false);
    toast({
      title: "Automatización publicada (demo)",
      description: "Tu automatización está activa. Puedes pausarla o editarla cuando quieras.",
    });
  }

  return (
    <div className="space-y-5">
      {/* ---------------- Header ---------------- */}
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rp-glass-strong rounded-2xl p-5 sm:p-6"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--gold)]/15 text-[var(--gold)] ring-1 ring-[var(--gold)]/30">
            <Wand2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-2xl sm:text-3xl font-light tracking-tight">
                IA Automation Builder
              </h2>
              <DemoBadge />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Describe en lenguaje natural qué necesitas y la IA diseñará el flujo. Tú revisas y apruebas antes de publicar.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ---------------- Top: NL input ---------------- */}
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
        className="rp-glass rounded-2xl p-5 sm:p-6"
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Brain className="h-4 w-4 text-[var(--teal)]" />
          <span className="font-mono uppercase tracking-wider">Paso 1 · Describe tu automatización</span>
        </div>

        <div className="mt-3 space-y-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ej: Quiero una automatización para clientes VIP que no han venido en 60 días"
            rows={3}
            className="text-sm"
          />

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Sugerencias:
            </span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setInput(s)}
                className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-foreground/[0.03] px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-[var(--teal)]/40 hover:bg-[var(--teal)]/10 hover:text-[var(--teal)] min-h-[32px]"
              >
                <Sparkles className="h-3 w-3" />
                {s}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              La IA solo lee tu descripción. No accede a tus datos hasta que publiques.
            </div>
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90"
            >
              {loading ? (
                <>
                  <Sparkles className="mr-1.5 h-4 w-4 animate-pulse" /> Generando…
                </>
              ) : (
                <>
                  <Sparkles className="mr-1.5 h-4 w-4" /> Generar con IA
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ---------------- Loading state ---------------- */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReduced ? undefined : { opacity: 0 }}
            className="rp-glass rounded-2xl p-8 text-center"
          >
            <div className="mx-auto flex max-w-md flex-col items-center gap-3">
              <div className="relative flex h-14 w-14 items-center justify-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-[var(--gold)]/20" />
                <Brain className="relative h-7 w-7 text-[var(--gold)]" />
              </div>
              <div>
                <p className="font-display text-base font-medium">La IA está diseñando tu automatización…</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Analizando intención · generando nodos · verificando permisos · estimando coste
                </p>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]"
                    animate={prefersReduced ? undefined : { opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- Bottom: generated flow + analysis ---------------- */}
      <AnimatePresence mode="wait">
        {flow && !loading && (
          <motion.div
            key={flow.key}
            initial={prefersReduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Step 2 label */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-4 w-4 text-[var(--gold)]" />
              <span className="font-mono uppercase tracking-wider">Paso 2 · Revisa el flujo generado</span>
            </div>

            {/* AI analysis panel */}
            <AiAnalysisPanel analysis={flow.analysis} />

            {/* Visual flow */}
            <FlowCanvas flow={flow} />

            {/* Actions */}
            <div className="rp-glass rounded-2xl p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" onClick={handleTest} className="border-foreground/15">
                    <Play className="mr-1.5 h-4 w-4" /> Probar automatización
                  </Button>
                  <Button variant="ghost" onClick={handleEditFlow}>
                    <Pencil className="mr-1.5 h-4 w-4" /> Editar flujo
                  </Button>
                </div>
                <Button
                  onClick={() => setPublishDialog(true)}
                  className="bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90"
                >
                  <Rocket className="mr-1.5 h-4 w-4" /> Publicar
                </Button>
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-lg border border-[var(--teal)]/25 bg-[var(--teal)]/5 p-3 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--teal)]" />
                <span>
                  La IA propone el flujo. Tú revisas y apruebas antes de publicar. No se ejecuta nada sin tu consentimiento.
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- Test dialog ---------------- */}
      <Dialog open={testDialog} onOpenChange={setTestDialog}>
        <DialogContent className="max-w-xl border-border/60 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <FlaskConical className="h-5 w-5 text-[var(--teal)]" />
              Ejecución de prueba
              <DemoBadge />
            </DialogTitle>
            <DialogDescription>
              Simulación de la automatización con datos de muestra. No se envían mensajes reales ni se modifican datos.
            </DialogDescription>
          </DialogHeader>
          <TestRunLog flow={flow} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTestDialog(false)}>Cerrar</Button>
            <Button
              onClick={() => {
                setTestDialog(false);
                toast({ title: "Prueba completada (demo)", description: "Todo OK. Ya puedes publicar." });
              }}
              className="bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90"
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> Aceptar resultado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- Publish confirm ---------------- */}
      <AlertDialog open={publishDialog} onOpenChange={setPublishDialog}>
        <AlertDialogContent className="border-border/60 bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-[var(--gold)]" />
              Publicar automatización
            </AlertDialogTitle>
            <AlertDialogDescription>
              Antes de publicar, revisa que los permisos son correctos. Podrás pausar o editar en cualquier momento. (demo)
            </AlertDialogDescription>
          </AlertDialogHeader>
          {flow && (
            <div className="rounded-lg border border-border/50 bg-foreground/[0.02] p-3 text-xs">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono uppercase tracking-wider text-muted-foreground">Resumen</span>
                <Badge variant="outline" className="border-[var(--gold)]/30 font-mono text-[10px] text-[var(--gold-soft)]">
                  {flow.analysis.confidence}% confianza
                </Badge>
              </div>
              <div className="space-y-1 text-foreground/80">
                <div><span className="text-muted-foreground">Intención:</span> {flow.analysis.intent}</div>
                <div><span className="text-muted-foreground">Nodos:</span> {flow.nodes.length}</div>
                <div><span className="text-muted-foreground">Coste:</span> {flow.analysis.costPerRun} por ejecución</div>
                <div>
                  <span className="text-muted-foreground">Permisos:</span>{" "}
                  <span className="flex flex-wrap gap-1.5 mt-1">
                    {flow.analysis.permissions.map((p) => (
                      <code key={p} className={cn("rounded border px-1.5 py-0.5 font-mono text-[10px]", permTone(p))}>
                        {p}
                      </code>
                    ))}
                  </span>
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePublishConfirm}
              className="bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90"
            >
              <Rocket className="mr-1.5 h-4 w-4" /> Publicar ahora
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * AI analysis panel
 * ------------------------------------------------------------------------ */
function AiAnalysisPanel({ analysis }: { analysis: AiAnalysis }) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rp-glass rounded-2xl p-4 sm:p-5 border-l-2 border-[var(--teal)]/50"
    >
      <div className="mb-3 flex items-center gap-2">
        <Brain className="h-4 w-4 text-[var(--teal)]" />
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Análisis IA
        </span>
        <DemoBadge />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Intención */}
        <div className="rounded-lg border border-border/40 bg-foreground/[0.02] p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Intención detectada
          </div>
          <div className="mt-1 text-sm font-medium text-foreground/90">{analysis.intent}</div>
        </div>

        {/* Permisos */}
        <div className="rounded-lg border border-border/40 bg-foreground/[0.02] p-3 sm:col-span-2 lg:col-span-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Permisos necesarios
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {analysis.permissions.map((p) => (
              <code
                key={p}
                className={cn("rounded border px-1.5 py-0.5 font-mono text-[10px]", permTone(p))}
              >
                {p}
              </code>
            ))}
          </div>
        </div>

        {/* Coste */}
        <div className="rounded-lg border border-border/40 bg-foreground/[0.02] p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Coste estimado
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-[var(--gold)]" />
            <span className="font-display text-lg font-light text-[var(--gold-soft)]">
              {analysis.costPerRun}
            </span>
          </div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">por ejecución</div>
        </div>

        {/* Riesgos */}
        <div
          className={cn(
            "rounded-lg border p-3",
            analysis.riskTone === "ok"
              ? "border-emerald-400/30 bg-emerald-400/[0.06]"
              : "border-amber-400/30 bg-amber-400/[0.06]"
          )}
        >
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Riesgos detectados
          </div>
          <div className="mt-1 flex items-start gap-1.5 text-sm">
            {analysis.riskTone === "ok" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            )}
            <span className={analysis.riskTone === "ok" ? "text-emerald-200" : "text-amber-200"}>
              {analysis.risks}
            </span>
          </div>
        </div>

        {/* Confianza */}
        <div className="rounded-lg border border-border/40 bg-foreground/[0.02] p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Confianza
            </span>
            <span className="font-mono text-sm font-medium text-[var(--gold-soft)]">
              {analysis.confidence}%
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-foreground/10">
            <motion.div
              initial={prefersReduced ? false : { width: 0 }}
              animate={{ width: `${analysis.confidence}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full",
                analysis.confidence >= 85
                  ? "bg-emerald-400"
                  : analysis.confidence >= 70
                  ? "bg-[var(--gold)]"
                  : "bg-amber-400"
              )}
            />
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            {analysis.confidence >= 85 ? "Alta" : analysis.confidence >= 70 ? "Media" : "Baja"}
          </div>
        </div>

        {/* Modelo */}
        <div className="rounded-lg border border-border/40 bg-foreground/[0.02] p-3 sm:col-span-2 lg:col-span-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-[var(--teal)]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Modelo
            </span>
          </div>
          <div className="mt-1 font-mono text-sm text-foreground/85">{analysis.model}</div>
        </div>
      </div>
    </motion.div>
  );
}

/* --------------------------------------------------------------------------
 * Flow canvas (horizontal nodes connected by arrows)
 * ------------------------------------------------------------------------ */
function FlowCanvas({ flow }: { flow: FlowDefinition }) {
  const prefersReduced = useReducedMotion();
  return (
    <div className="rp-glass rounded-2xl p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cog className="h-4 w-4 text-[var(--gold)]" />
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Flujo generado
          </span>
        </div>
        <Badge variant="outline" className="border-foreground/15 font-mono text-[10px]">
          {flow.nodes.length} nodos
        </Badge>
      </div>

      <div className="overflow-x-auto rp-scroll-thin pb-2">
        <div className="flex min-w-max items-stretch gap-2">
          {flow.nodes.map((node, idx) => {
            const isLast = idx === flow.nodes.length - 1;
            const meta = NODE_TYPE_META[node.type];
            const Icon = node.icon;
            const accent = ACCENT[node.accent];
            return (
              <React.Fragment key={node.id}>
                <motion.div
                  initial={prefersReduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.3 }}
                  className={cn(
                    "rp-glass-strong flex w-[200px] shrink-0 flex-col gap-2 rounded-xl border p-3",
                    accent.border,
                    accent.glow
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider",
                        accent.chip
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {meta.label}
                    </span>
                    <span className={cn("h-2 w-2 rounded-full", accent.dot)} />
                  </div>
                  <div className="text-sm font-medium leading-tight text-foreground">
                    {node.title}
                  </div>
                  <div className="text-[11px] leading-snug text-muted-foreground">
                    {node.summary}
                  </div>
                </motion.div>

                {!isLast && (
                  <div className="flex items-center justify-center self-center">
                    <motion.div
                      initial={prefersReduced ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.06 + 0.1 }}
                    >
                      <ArrowRight className="h-5 w-5 text-muted-foreground/60" />
                    </motion.div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
        <Info className="h-3.5 w-3.5" />
        <span>
          Disparador: <span className="text-foreground/80">{flow.triggerLabel}</span>
        </span>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Test run log (mock execution log inside dialog)
 * ------------------------------------------------------------------------ */
function TestRunLog({ flow }: { flow: FlowDefinition | null }) {
  const prefersReduced = useReducedMotion();
  const [lines, setLines] = React.useState<{ ts: string; level: "info" | "ok" | "warn" | "err"; msg: string }[]>([]);

  React.useEffect(() => {
    if (!flow) return;
    const baseLogs: { level: "info" | "ok" | "warn" | "err"; msg: string }[] = [
      { level: "info", msg: `Inicializando ejecución de prueba · flujo "${flow.key}"` },
      { level: "info", msg: `Cliente de muestra: cus_demo_001 · María González · tier=VIP` },
      { level: "info", msg: `Disparador evaluado: ${flow.triggerLabel}` },
      { level: "ok", msg: "Trigger coincidió · última visita hace 67 días" },
      { level: "info", msg: "Evaluando condición: ¿Consentimiento WhatsApp?" },
      { level: "ok", msg: "Cliente con opt-in marketing=true · canal=whatsapp" },
      { level: "info", msg: "Acción: Enviar WhatsApp con oferta personalizada" },
      { level: "ok", msg: "Plantilla winback_vip_v2 enviada · msg_id=wa_demo_8842" },
      { level: "info", msg: "Esperando 48h (simulado · esperando 200ms)" },
      { level: "warn", msg: "Acelerando tiempo para simulación" },
      { level: "info", msg: "Evaluando: ¿Ha reservado?" },
      { level: "ok", msg: "Reserva detectada · res_demo_0042 · 4 pax · 2025-03-22" },
      { level: "ok", msg: "Marca aplicada: winback_ok · nota añadida a CRM" },
      { level: "ok", msg: "Ejecución finalizada · duración simulada: 248 ms" },
    ];

    let i = 0;
    setLines([]);
    const timer = setInterval(() => {
      if (i >= baseLogs.length) {
        clearInterval(timer);
        return;
      }
      const log = baseLogs[i];
      setLines((s) => [
        ...s,
        { ts: new Date(Date.now() + i * 80).toISOString().split("T")[1].replace("Z", "Z"), level: log.level, msg: log.msg },
      ]);
      i += 1;
    }, 180);
    return () => clearInterval(timer);
  }, [flow]);

  const levelTone: Record<string, string> = {
    info: "text-[var(--teal)]",
    ok: "text-emerald-300",
    warn: "text-amber-300",
    err: "text-rose-300",
  };
  const levelIcon: Record<string, LucideIcon> = {
    info: Info,
    ok: CheckCircle2,
    warn: AlertTriangle,
    err: AlertTriangle,
  };

  return (
    <div className="my-2 overflow-hidden rounded-lg border border-border/50 bg-black/40">
      <div className="flex items-center gap-2 border-b border-border/40 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        <Terminal className="h-3.5 w-3.5 text-[var(--teal)]" />
        execution_log · demo
      </div>
      <div className="max-h-72 overflow-y-auto rp-scroll-thin p-3 font-mono text-xs leading-relaxed">
        <AnimatePresence initial={false}>
          {lines.map((line, i) => {
            const LvIcon = levelIcon[line.level];
            return (
              <motion.div
                key={i}
                initial={prefersReduced ? false : { opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2 py-0.5"
              >
                <span className="shrink-0 text-muted-foreground/60">{line.ts}</span>
                <LvIcon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", levelTone[line.level])} />
                <span className={cn("flex-1", line.level === "info" ? "text-foreground/80" : levelTone[line.level])}>
                  {line.msg}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {lines.length === 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--gold)]" />
            Inicializando ejecución…
          </div>
        )}
      </div>
    </div>
  );
}

export default IaAutomationBuilder;
