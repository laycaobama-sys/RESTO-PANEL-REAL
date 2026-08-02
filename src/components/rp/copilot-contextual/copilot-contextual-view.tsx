"use client";

/* ============================================================================
 * RestoPanel · Copilot contextual por módulo
 * 10 contextos · chat con citas y confianza · reglas B.13 · token budget
 * ========================================================================== */

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Home, CalendarDays, Armchair, ChefHat, BookOpen, Users, Star,
  Package, Clock, BarChart3, Sparkles, Send, ShieldCheck,
  AlertTriangle, CheckCircle2, Cpu, FileText, Database, Brain,
  Zap, ChevronRight, X, Plus, History, TrendingUp, Coins,
  AlertCircle, Info, MessageCircle, Mail, ListTodo, Crown,
  Lightbulb, Target, RotateCcw,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type ModuleId =
  | "inicio"
  | "reservas"
  | "sala"
  | "cocina"
  | "carta"
  | "crm"
  | "resenas"
  | "inventario"
  | "personal"
  | "analitica";

type Confidence = "alta" | "media" | "baja";

interface Source {
  label: string;
  kind: "db" | "doc" | "metric" | "calc";
}

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  ts: string;
  sources?: Source[];
  confidence?: Confidence;
  actions?: ActionChip[];
  denied?: boolean;
  noData?: boolean;
}

interface ActionChip {
  label: string;
  kind: "view" | "create" | "apply" | "export";
  target?: string;
}

interface DigestItem {
  icon: React.ElementType;
  title: string;
  detail: string;
  tone: "emerald" | "yellow" | "red" | "blue" | "violet";
}

/* =========================================================
 * Modules metadata
 * =======================================================*/
const MODULES: {
  id: ModuleId;
  label: string;
  icon: React.ElementType;
  tone: "emerald" | "yellow" | "red" | "violet" | "blue";
  desc: string;
}[] = [
  { id: "inicio", label: "Inicio", icon: Home, tone: "emerald", desc: "Dashboard general" },
  { id: "reservas", label: "Reservas", icon: CalendarDays, tone: "yellow", desc: "Libro de reservas" },
  { id: "sala", label: "Sala", icon: Armchair, tone: "emerald", desc: "Plano y turnos" },
  { id: "cocina", label: "Cocina", icon: ChefHat, tone: "red", desc: "KDS y tickets" },
  { id: "carta", label: "Carta", icon: BookOpen, tone: "blue", desc: "Menú digital" },
  { id: "crm", label: "CRM", icon: Users, tone: "violet", desc: "Clientes y fidelidad" },
  { id: "resenas", label: "Reseñas", icon: Star, tone: "yellow", desc: "Reputación online" },
  { id: "inventario", label: "Inventario", icon: Package, tone: "emerald", desc: "Stock y escandallos" },
  { id: "personal", label: "Personal", icon: Clock, tone: "blue", desc: "Fichaje y cuadrante" },
  { id: "analitica", label: "Analítica", icon: BarChart3, tone: "violet", desc: "Métricas y KPIs" },
];

const TONE_CLS: Record<string, { text: string; border: string; bg: string }> = {
  emerald: {
    text: "text-[var(--rp-emerald-soft)]",
    border: "border-[var(--rp-emerald)]/40",
    bg: "bg-[var(--rp-emerald)]/10",
  },
  yellow: {
    text: "text-[var(--rp-yellow-soft)]",
    border: "border-[var(--rp-yellow)]/40",
    bg: "bg-[var(--rp-yellow)]/10",
  },
  red: {
    text: "text-[var(--rp-red-soft)]",
    border: "border-[var(--rp-red)]/40",
    bg: "bg-[var(--rp-red)]/10",
  },
  violet: {
    text: "text-[var(--rp-violet-soft)]",
    border: "border-[var(--rp-violet)]/40",
    bg: "bg-[var(--rp-violet)]/10",
  },
  blue: {
    text: "text-[var(--rp-blue-soft)]",
    border: "border-[var(--rp-blue)]/40",
    bg: "bg-[var(--rp-blue)]/10",
  },
};

/* =========================================================
 * Rules B.13
 * =======================================================*/
const RULES_B13: {
  icon: React.ElementType;
  title: string;
  desc: string;
  tone: "emerald" | "yellow" | "red" | "blue";
}[] = [
  {
    icon: AlertTriangle,
    title: "No inventar",
    desc: "Si no tienes datos, di \"no lo sé\". No generes cifras, nombres ni eventos por defecto.",
    tone: "red",
  },
  {
    icon: FileText,
    title: "Citar fuente",
    desc: "Cada afirmación cuantitativa debe ir con su fuente (D1, CRM, Analytics, etc.).",
    tone: "blue",
  },
  {
    icon: ShieldCheck,
    title: "Confirmar antes de actuar",
    desc: "Toda acción con side-effect (enviar, cobrar, eliminar) requiere confirmación explícita del usuario.",
    tone: "yellow",
  },
  {
    icon: Crown,
    title: "Respetar rol",
    desc: "Solo propone acciones permitidas para el rol del usuario actual (camarero/maitre/gerente/owner).",
    tone: "emerald",
  },
];

/* =========================================================
 * Suggested prompts per module
 * =======================================================*/
const PROMPTS: Record<ModuleId, string[]> = {
  inicio: [
    "¿Cómo va el día vs ayer?",
    "¿Cuáles son mis 3 KPIs críticos ahora?",
    "¿Qué necesito revisar hoy?",
    "Resume las alertas activas",
  ],
  reservas: [
    "¿Cuántas reservas tengo hoy?",
    "¿Qué clientes VIP llegan hoy?",
    "¿Cuál es mi ocupación actual?",
    "¿Hay riesgo de no-show?",
  ],
  sala: [
    "¿Qué mesas están libres ahora?",
    "¿Cuánto tiempo lleva la mesa 12?",
    "¿Hay mesas que necesitan limpieza?",
    "¿Qué comensales llevan > 90min?",
  ],
  cocina: [
    "¿Cuál es el tiempo medio de ticket?",
    "¿Qué tickets llevan > 15min?",
    "¿Hay platos 86-ing hoy?",
    "¿Cuál es la carga por estación?",
  ],
  carta: [
    "¿Cuál es el plato más vendido?",
    "¿Qué platos tienen food cost > 40%?",
    "Sugiéreme un plato del día",
    "¿Qué plato debería descontinuar?",
  ],
  crm: [
    "¿Quiénes son mis top 10 clientes?",
    "¿Qué clientes cumplen años esta semana?",
    "¿Hay clientes en riesgo de fuga?",
    "¿Quién lleva > 90 días sin venir?",
  ],
  resenas: [
    "¿Cuál es mi rating medio?",
    "¿Hay reseñas negativas sin responder?",
    "¿Sobre qué se quejan más?",
    "Compara con la competencia local",
  ],
  inventario: [
    "¿Qué artículos están bajo mínimo?",
    "¿Cuál es mi coste materia prima?",
    "¿Qué lotes caducan esta semana?",
    "¿Cuál es mi merma del periodo?",
  ],
  personal: [
    "¿Quién está fichado ahora?",
    "¿Hay horas extra esta semana?",
    "¿Quién rinde mejor en ventas?",
    "¿Hay desviaciones en el cuadrante?",
  ],
  analitica: [
    "¿Cuál es mi facturación prevista mañana?",
    "¿Cuál es mi ticket medio por turno?",
    "Compara este mes con el anterior",
    "¿Qué día de la semana vendo más?",
  ],
};

/* =========================================================
 * Demo responses per module (mock)
 * =======================================================*/
const RESPONSES: Record<ModuleId, Message[]> = {
  inicio: [
    {
      id: "m1",
      role: "user",
      content: "¿Cómo va el día vs ayer?",
      ts: "10:14",
    },
    {
      id: "m2",
      role: "ai",
      content:
        "Llevas €4.280 facturados hoy (+18% vs ayer mismo). 38 reservas confirmadas (vs 32 ayer), ticket medio €42.50 (+5%). Sin alertas críticas.",
      ts: "10:14",
      sources: [
        { label: "Billing (D1)", kind: "db" },
        { label: "Reservations", kind: "db" },
        { label: "Analytics Engine", kind: "metric" },
      ],
      confidence: "alta",
      actions: [
        { label: "Ver dashboard", kind: "view", target: "inicio" },
        { label: "Exportar resumen", kind: "export" },
      ],
    },
  ],
  reservas: [
    {
      id: "m1",
      role: "user",
      content: "¿Cuántas reservas tengo hoy?",
      ts: "10:14",
    },
    {
      id: "m2",
      role: "ai",
      content:
        "Tienes 47 reservas hoy (+12% vs ayer). 38 confirmadas, 5 pendientes, 4 en lista de espera. La franja 21:30–22:30 está al 95%.",
      ts: "10:14",
      sources: [
        { label: "D1 Reservations", kind: "db" },
        { label: "Durable Objects", kind: "metric" },
      ],
      confidence: "alta",
      actions: [
        { label: "Ver reservas", kind: "view", target: "reservas" },
        { label: "Crear reserva", kind: "create", target: "reservas" },
      ],
    },
  ],
  sala: [
    {
      id: "m1",
      role: "user",
      content: "¿Qué mesas están libres ahora?",
      ts: "10:14",
    },
    {
      id: "m2",
      role: "ai",
      content:
        "6 mesas libres: M3 (sala, 4pax), M7 (sala, 2pax), T2 (terraza, 4pax), T5 (terraza, 6pax), B1 (barra, 2pax), B2 (barra, 2pax). La terraza está al 92% — sugiero abrir zona auxiliar.",
      ts: "10:14",
      sources: [{ label: "Durable Objects", kind: "metric" }],
      confidence: "alta",
      actions: [
        { label: "Ver plano", kind: "view", target: "sala" },
      ],
    },
  ],
  cocina: [
    {
      id: "m1",
      role: "user",
      content: "¿Cuál es el tiempo medio de ticket?",
      ts: "10:14",
    },
    {
      id: "m2",
      role: "ai",
      content:
        "Tiempo medio actual: 12.4 min (-8% vs ayer). Estación caliente: 11.2 min. Fría: 8.7 min. Postres: 6.1 min. 3 tickets llevan > 15min (todos de la mesa 14).",
      ts: "10:14",
      sources: [{ label: "KDS Analytics", kind: "metric" }],
      confidence: "alta",
      actions: [{ label: "Ver KDS", kind: "view", target: "cocina" }],
    },
  ],
  carta: [
    {
      id: "m1",
      role: "user",
      content: "¿Qué platos tienen food cost > 40%?",
      ts: "10:14",
    },
    {
      id: "m2",
      role: "ai",
      content:
        "2 platos con food cost > 40%: Hamburguesa premium (42.1%, precio €14.90) y Tarta de chocolate (44.2%, precio €7.90). Recomiendo subir €1 el precio de la hamburguesa o renegociar coste de solomillo (-15% con proveedor alternativo detectado).",
      ts: "10:14",
      sources: [
        { label: "Escandallos (D1)", kind: "db" },
        { label: "Proveedores", kind: "db" },
      ],
      confidence: "alta",
      actions: [
        { label: "Ver escandallos", kind: "view", target: "inventario" },
        { label: "Aplicar subida €1", kind: "apply" },
      ],
    },
  ],
  crm: [
    {
      id: "m1",
      role: "user",
      content: "¿Quiénes son mis top 10 clientes?",
      ts: "10:14",
    },
    {
      id: "m2",
      role: "ai",
      content:
        "Top 10 por LTV: 1) Elena Marín (€4.820, 28 visitas), 2) Familia Ruiz (€3.940, 12 visitas), 3) Andrés Vidal (€3.210, 22 visitas)... 4 more VIP detectados. 8/10 con cumpleaños en próximos 60 días.",
      ts: "10:14",
      sources: [
        { label: "CRM (D1)", kind: "db" },
        { label: "Loyalty", kind: "db" },
      ],
      confidence: "alta",
      actions: [
        { label: "Ver CRM", kind: "view", target: "crm" },
        { label: "Campaña cumpleaños", kind: "create", target: "crm" },
      ],
    },
  ],
  resenas: [
    {
      id: "m1",
      role: "user",
      content: "¿Hay reseñas negativas sin responder?",
      ts: "10:14",
    },
    {
      id: "m2",
      role: "ai",
      content:
        "3 reseñas negativas (< 3★) sin responder: 1) Google 2★ (hace 2 días) — queja sobre tiempo de espera. 2) TripAdvisor 1★ (hace 5 días) — queja sobre ración pequeña. 3) TheFork 2★ (hace 7 días) — queja sobre servicio. He preparado borradores de respuesta para cada una.",
      ts: "10:14",
      sources: [
        { label: "Reviews Aggregator", kind: "metric" },
        { label: "Response Queue", kind: "db" },
      ],
      confidence: "alta",
      actions: [
        { label: "Ver reseñas", kind: "view", target: "resenas" },
        { label: "Ver borradores", kind: "view", target: "resenas" },
      ],
    },
  ],
  inventario: [
    {
      id: "m1",
      role: "user",
      content: "¿Qué artículos están bajo mínimo?",
      ts: "10:14",
    },
    {
      id: "m2",
      role: "ai",
      content:
        "5 artículos bajo mínimo: Azafrón en hebras (crítico, 0.08/0.1 kg), Gambón rojo (bajo, 4.5/6 kg), Solomillo ternera (bajo, 6.2/8 kg), Harina fuerza (crítico, 5/12 kg), Lechuga romana (bajo, 3/6 ud). Sugiero generar pedido a 3 proveedores por un total de €384.",
      ts: "10:14",
      sources: [{ label: "Stock (D1)", kind: "db" }],
      confidence: "alta",
      actions: [
        { label: "Ver inventario", kind: "view", target: "inventario" },
        { label: "Generar pedido", kind: "create", target: "inventario" },
      ],
    },
  ],
  personal: [
    {
      id: "m1",
      role: "user",
      content: "¿Quién está fichado ahora?",
      ts: "10:14",
    },
    {
      id: "m2",
      role: "ai",
      content:
        "6 empleados fichados: Marta García (maitre, desde 10:02), Pedro Sánchez (camarero, 16:05), Lucía Romero (camarero, 10:00), Andrés Vidal (cocina, 09:00), Sofía Mendoza (barra, 12:00), Carmen Díaz (gerente, 11:00). 1 en pausa: Andrés.",
      ts: "10:14",
      sources: [{ label: "Fichaje (D1)", kind: "db" }],
      confidence: "alta",
      actions: [{ label: "Ver personal", kind: "view", target: "personal" }],
    },
  ],
  analitica: [
    {
      id: "m1",
      role: "user",
      content: "¿Cuál es mi facturación prevista mañana?",
      ts: "10:14",
    },
    {
      id: "m2",
      role: "ai",
      content:
        "Facturación prevista mañana: €10.250 (confianza 78%, margen ±€1.200). Basado en: 186 reservas previstas, ticket medio €55 y factor de estacionalidad 1.08. Día de la semana histórico: viernes promedio €9.840.",
      ts: "10:14",
      sources: [
        { label: "Forecast Model", kind: "calc" },
        { label: "Reservations", kind: "db" },
        { label: "Histórico (D1)", kind: "db" },
      ],
      confidence: "media",
      actions: [{ label: "Ver analítica", kind: "view", target: "analitica" }],
    },
  ],
};

/* =========================================================
 * Daily digest
 * =======================================================*/
const DIGEST: DigestItem[] = [
  {
    icon: TrendingUp,
    title: "Facturación hoy +18%",
    detail: "€4.280 vs €3.625 ayer. Ticket medio sube a €42.50.",
    tone: "emerald",
  },
  {
    icon: AlertTriangle,
    title: "5 alertas de stock",
    detail: "Azafrón y harina en crítico. Generar pedido urgente.",
    tone: "red",
  },
  {
    icon: Star,
    title: "3 reseñas negativas",
    detail: "Sin responder desde hace 2-7 días. Borradores listos.",
    tone: "yellow",
  },
  {
    icon: Users,
    title: "8 VIPs hoy",
    detail: "Elena Marín 21:30, Familia Ruiz 14:00 + 6 más.",
    tone: "violet",
  },
  {
    icon: Clock,
    title: "Cumplimiento horario",
    detail: "2 empleados con +4h extra esta semana. Revisar cuadrante.",
    tone: "blue",
  },
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

function sourceIcon(kind: Source["kind"]): React.ElementType {
  switch (kind) {
    case "db": return Database;
    case "doc": return FileText;
    case "metric": return BarChart3;
    case "calc": return Brain;
  }
}

function confidenceMeta(c: Confidence) {
  return {
    alta: { label: "Confianza alta", cls: "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]", pct: "92%" },
    media: { label: "Confianza media", cls: "border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow-soft)]", pct: "70%" },
    baja: { label: "Confianza baja", cls: "border-[var(--rp-red)]/40 bg-[var(--rp-red)]/10 text-[var(--rp-red-soft)]", pct: "45%" },
  }[c];
}

function actionIcon(kind: ActionChip["kind"]): React.ElementType {
  switch (kind) {
    case "view": return ChevronRight;
    case "create": return Plus;
    case "apply": return Zap;
    case "export": return FileText;
  }
}

/* =========================================================
 * Main view
 * =======================================================*/
export function CopilotContextualView() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const t = reduce ? { duration: 0 } : { duration: 0.2, ease: "easeOut" as const };

  const [activeModule, setActiveModule] = React.useState<ModuleId>("inicio");
  const [messages, setMessages] = React.useState<Record<ModuleId, Message[]>>(
    () => RESPONSES
  );
  const [input, setInput] = React.useState("");
  const [digestOpen, setDigestOpen] = React.useState(false);
  const [rulesOpen, setRulesOpen] = React.useState(false);

  // Token budget
  const [tokenUsed, setTokenUsed] = React.useState(4287);
  const TOKEN_LIMIT = 10000;
  const TOKEN_COST_PER_1K = 0.20; // €
  const tokenCost = (tokenUsed / 1000) * TOKEN_COST_PER_1K;

  const modMessages = messages[activeModule];
  const activeMod = MODULES.find((m) => m.id === activeModule)!;

  /* ----- handlers ----- */
  function sendMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: `u${Date.now()}`,
      role: "user",
      content: text.trim(),
      ts: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => ({
      ...prev,
      [activeModule]: [...prev[activeModule], userMsg],
    }));
    setInput("");
    // simulate tokens
    const tokens = Math.round(text.length * 1.5) + 200;
    setTokenUsed((u) => Math.min(TOKEN_LIMIT, u + tokens));

    // Real AI call via /api/ai/chat
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module: activeModule, query: text, prompt: text }),
      });
      const data = await res.json();
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: data.answer || data.content || "No he podido procesar tu consulta.",
        ts: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        sources: data.sources || [],
        confidence: (data.provider as Confidence) || "media",
      };
      setMessages((prev) => ({ ...prev, [activeModule]: [...prev[activeModule], aiMsg] }));
      setTokenUsed((u) => Math.min(TOKEN_LIMIT, u + (data.tokensUsed || Math.round(aiMsg.content.length * 0.8))));
    } catch {
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: "Error de conexión con el servicio de IA. Inténtalo de nuevo.",
        ts: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        sources: [],
        confidence: "baja",
      };
      setMessages((prev) => ({ ...prev, [activeModule]: [...prev[activeModule], aiMsg] }));
    }
  }

  function clearChat() {
    setMessages((prev) => ({ ...prev, [activeModule]: [] }));
    toast({
      title: "Conversación borrada",
      description: activeMod.label,
    });
  }

  function handleAction(action: ActionChip) {
    if (action.kind === "apply") {
      toast({
        title: "Acción aplicada",
        description: action.label,
      });
    } else if (action.kind === "view" && action.target) {
      toast({
        title: "Navegando...",
        description: `Ir a ${action.target}`,
      });
    } else if (action.kind === "create") {
      toast({
        title: "Creando...",
        description: action.label,
      });
    } else if (action.kind === "export") {
      toast({
        title: "Exportando...",
        description: action.label,
      });
    }
  }

  function applyPrompt(prompt: string) {
    setInput(prompt);
  }

  /* ----- render ----- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
              Copilot contextual
            </h1>
            <Badge
              variant="outline"
              className="border-[var(--rp-violet)]/40 bg-[var(--rp-violet)]/10 text-[var(--rp-violet-soft)] font-mono uppercase tracking-wider text-[10px]"
            >
              <Sparkles className="h-3 w-3 mr-1" /> IA
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Asistente IA con contexto por módulo. Cita fuentes, indica confianza
            y propone acciones.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" onClick={() => setDigestOpen(true)} className="min-h-11">
            <History className="h-4 w-4" /> <span className="hidden sm:inline">Digest diario</span>
          </Button>
          <Button variant="outline" onClick={() => setRulesOpen(true)} className="min-h-11">
            <ShieldCheck className="h-4 w-4" /> <span className="hidden sm:inline">Reglas B.13</span>
          </Button>
        </div>
      </header>

      {/* Module context selector */}
      <div className="rp-glass rounded-2xl p-3">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Contexto activo
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto rp-scroll-thin pb-1">
          {MODULES.map((m) => {
            const Icon = m.icon;
            const toneCls = TONE_CLS[m.tone];
            const active = activeModule === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveModule(m.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium whitespace-nowrap transition-colors border min-h-[36px]",
                  active
                    ? cn(toneCls.border, toneCls.bg, toneCls.text)
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                )}
                title={m.desc}
              >
                <Icon className="h-3.5 w-3.5" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Token budget bar */}
      <div className="rp-glass rounded-2xl p-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <Cpu className="h-4 w-4 text-[var(--rp-emerald)]" />
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Token budget
          </span>
        </div>
        <div className="flex-1 min-w-[140px]">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span className="font-mono tabular-nums">
              {tokenUsed.toLocaleString("es-ES")}/{TOKEN_LIMIT.toLocaleString("es-ES")}
            </span>
            <span className="font-mono tabular-nums text-[var(--rp-emerald-soft)]">
              {euro(tokenCost)}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-foreground/[0.06] overflow-hidden">
            <div
              className={cn(
                "h-full transition-all",
                tokenUsed / TOKEN_LIMIT >= 0.9
                  ? "bg-[var(--rp-red)]"
                  : tokenUsed / TOKEN_LIMIT >= 0.7
                    ? "bg-[var(--rp-yellow)]"
                    : "bg-[var(--rp-emerald)]"
              )}
              style={{ width: `${(tokenUsed / TOKEN_LIMIT) * 100}%` }}
            />
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-[10px] h-7"
          onClick={() => {
            setTokenUsed(0);
            toast({ title: "Token budget reseteado", description: "Nuevo ciclo" });
          }}
        >
          <RotateCcw className="h-3 w-3 mr-1" /> Reset
        </Button>
      </div>

      {/* Main: chat + sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
        {/* Chat */}
        <div className="rp-glass rounded-2xl overflow-hidden flex flex-col min-h-[600px]">
          {/* Chat header */}
          <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", TONE_CLS[activeMod.tone].bg, TONE_CLS[activeMod.tone].text)}>
                <activeMod.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium">{activeMod.label}</div>
                <div className="text-[10px] text-muted-foreground">{activeMod.desc}</div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearChat} className="text-[10px] h-7">
              <RotateCcw className="h-3 w-3 mr-1" /> Limpiar
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto rp-scroll-thin p-4 space-y-4">
            {modMessages.length === 0 && (
              <div className="text-center py-10 text-sm text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Empieza preguntando algo sobre {activeMod.label.toLowerCase()}.
              </div>
            )}
            {modMessages.map((m) => (
              <ChatMessage key={m.id} message={m} onAction={handleAction} />
            ))}
          </div>

          {/* Suggested prompts */}
          {PROMPTS[activeModule].length > 0 && (
            <div className="px-4 py-2 border-t border-border/40 flex items-center gap-1.5 overflow-x-auto rp-scroll-thin">
              <Lightbulb className="h-3.5 w-3.5 text-[var(--rp-yellow)] shrink-0" />
              {PROMPTS[activeModule].slice(0, 4).map((p, i) => (
                <button
                  key={i}
                  onClick={() => applyPrompt(p)}
                  className="text-[11px] px-2 py-1 rounded-md border border-border/40 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04] whitespace-nowrap transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border/40 flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder={`Pregunta sobre ${activeMod.label.toLowerCase()}...`}
              className="bg-background/40 resize-none min-h-[44px] max-h-[120px] text-sm"
              rows={1}
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)] shrink-0"
              aria-label="Enviar"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sidebar: reglas B.13 + digest preview */}
        <aside className="space-y-4">
          <RulesPanel />
          <DigestPreview onSeeMore={() => setDigestOpen(true)} />
        </aside>
      </div>

      {/* Dialogs */}
      <DigestDialog open={digestOpen} onOpenChange={setDigestOpen} />
      <RulesDialog open={rulesOpen} onOpenChange={setRulesOpen} />
    </div>
  );
}

/* =========================================================
 * Mock response generator
 * =======================================================*/


/* =========================================================
 * Chat message
 * =======================================================*/
function ChatMessage({
  message,
  onAction,
}: {
  message: Message;
  onAction: (a: ActionChip) => void;
}) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
          isUser
            ? "bg-foreground/[0.06] text-foreground"
            : "bg-[var(--rp-violet)]/15 text-[var(--rp-violet-soft)]"
        )}
      >
        {isUser ? (
          <Users className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
      </div>

      <div className={cn("flex-1 min-w-0 max-w-[85%]", isUser && "flex flex-col items-end")}>
        {/* Bubble */}
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-sm",
            isUser
              ? "bg-[var(--rp-emerald)]/15 text-foreground rounded-tr-sm"
              : message.noData
                ? "bg-[var(--rp-red)]/10 border border-[var(--rp-red)]/40 rounded-tl-sm"
                : "bg-foreground/[0.04] border border-border/40 rounded-tl-sm"
          )}
        >
          {message.noData && (
            <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--rp-red-soft)]">
              <AlertCircle className="h-3 w-3" /> Sin datos
            </div>
          )}
          <p className="whitespace-pre-wrap">{message.content}</p>

          {/* Sources */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border/30">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                Fuentes
              </div>
              <div className="flex flex-wrap gap-1.5">
                {message.sources.map((s, i) => {
                  const SIcon = sourceIcon(s.kind);
                  return (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border border-border/40 bg-foreground/[0.04] text-muted-foreground"
                    >
                      <SIcon className="h-2.5 w-2.5" />
                      {s.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Confidence */}
          {message.confidence && (
            <div className="mt-2 pt-2 border-t border-border/30 flex items-center justify-between gap-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Confianza
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border",
                  confidenceMeta(message.confidence).cls
                )}
              >
                {confidenceMeta(message.confidence).pct}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        {message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {message.actions.map((a, i) => {
              const AIcon = actionIcon(a.kind);
              return (
                <button
                  key={i}
                  onClick={() => onAction(a)}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition-colors",
                    a.kind === "apply"
                      ? "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)] hover:bg-[var(--rp-emerald)]/20"
                      : "border-border/40 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]"
                  )}
                >
                  <AIcon className="h-3 w-3" />
                  {a.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Timestamp */}
        <div className={cn("text-[10px] text-muted-foreground mt-1", isUser ? "text-right" : "text-left")}>
          {message.ts}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Rules panel (B.13)
 * =======================================================*/
function RulesPanel() {
  return (
    <div className="rp-glass rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="h-4 w-4 text-[var(--rp-emerald)]" />
        <h3 className="text-sm font-semibold">Reglas B.13</h3>
      </div>
      <Separator className="mb-3" />
      <div className="space-y-2">
        {RULES_B13.map((r, i) => {
          const Icon = r.icon;
          const toneCls = TONE_CLS[r.tone];
          return (
            <div
              key={i}
              className={cn("rounded-lg border p-2.5", toneCls.border, toneCls.bg)}
            >
              <div className="flex items-start gap-2">
                <Icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", toneCls.text)} />
                <div className="min-w-0">
                  <div className={cn("text-xs font-medium", toneCls.text)}>
                    {r.title}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {r.desc}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
 * Digest preview
 * =======================================================*/
function DigestPreview({ onSeeMore }: { onSeeMore: () => void }) {
  return (
    <div className="rp-glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-[var(--rp-violet)]" />
          <h3 className="text-sm font-semibold">Digest diario</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onSeeMore} className="text-[10px] h-7">
          Ver todo <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
      <Separator className="mb-3" />
      <div className="space-y-2">
        {DIGEST.slice(0, 3).map((item, i) => {
          const Icon = item.icon;
          const toneCls = TONE_CLS[item.tone];
          return (
            <div key={i} className="flex items-start gap-2">
              <div className={cn("h-7 w-7 rounded-md flex items-center justify-center shrink-0", toneCls.bg, toneCls.text)}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium">{item.title}</div>
                <div className="text-[10px] text-muted-foreground line-clamp-2">
                  {item.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-[10px] text-muted-foreground mt-3 pt-2 border-t border-border/40">
        Generado a las 09:00 · 5 highlights
      </div>
    </div>
  );
}

/* =========================================================
 * Digest dialog
 * =======================================================*/
function DigestDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rp-glass-strong max-w-2xl">
        <DialogHeader>
          <DialogTitle>Digest diario · hoy 09:00</DialogTitle>
          <DialogDescription>
            5 highlights generados por el Copilot durante la madrugada.
            Resumen accionable para tu día.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-[420px] overflow-y-auto rp-scroll-thin py-2">
          {DIGEST.map((item, i) => {
            const Icon = item.icon;
            const toneCls = TONE_CLS[item.tone];
            return (
              <div
                key={i}
                className={cn("rounded-lg border p-3", toneCls.border, toneCls.bg)}
              >
                <div className="flex items-start gap-2">
                  <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", toneCls.text)} />
                  <div className="min-w-0 flex-1">
                    <div className={cn("text-sm font-medium", toneCls.text)}>
                      {item.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {item.detail}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[10px] h-7 shrink-0">
                    Ver <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            <Mail className="h-4 w-4 mr-1" /> Enviar por email
          </Button>
          <Button
            className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
            onClick={() => onOpenChange(false)}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" /> Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Rules dialog
 * =======================================================*/
function RulesDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rp-glass-strong max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reglas B.13 · Gobierno del Copilot</DialogTitle>
          <DialogDescription>
            Cuatro reglas no negociables que rigen el comportamiento del
            Copilot contextual.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[420px] overflow-y-auto rp-scroll-thin py-2">
          {RULES_B13.map((r, i) => {
            const Icon = r.icon;
            const toneCls = TONE_CLS[r.tone];
            return (
              <div
                key={i}
                className={cn("rounded-lg border p-4", toneCls.border, toneCls.bg)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("h-9 w-9 rounded-md flex items-center justify-center shrink-0 bg-foreground/[0.06]", toneCls.text)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        B.13.{i + 1}
                      </span>
                      <h4 className={cn("text-sm font-semibold", toneCls.text)}>
                        {r.title}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {r.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="rounded-lg border border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-[var(--rp-emerald-soft)]" />
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--rp-emerald-soft)]">
                Cumplimiento verificado
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Todas las respuestas del Copilot pasan por un validador automático
              que asegura el cumplimiento de las 4 reglas. Las violaciones
              bloquean la respuesta y notifican al equipo de IA.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[var(--rp-emerald)]" />
                <span className="text-muted-foreground">Sin invenciones: 100%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[var(--rp-emerald)]" />
                <span className="text-muted-foreground">Fuentes citadas: 100%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[var(--rp-emerald)]" />
                <span className="text-muted-foreground">Confirmaciones: 100%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[var(--rp-emerald)]" />
                <span className="text-muted-foreground">RBAC respetado: 100%</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
            onClick={() => onOpenChange(false)}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" /> Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
