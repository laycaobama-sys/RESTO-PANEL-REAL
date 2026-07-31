"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Crown,
  TrendingUp,
  Megaphone,
  Star,
  Settings,
  DollarSign,
  Users,
  Cpu,
  ChevronDown,
  ChevronRight,
  Eye,
  Pause,
  Play,
  Shield,
  Wrench,
  Database,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  FileText,
  Download,
  Layers,
  Gauge,
  ShieldCheck,
  Ban,
  CircleDot,
} from "lucide-react";

/* ============================================================
   Types (per spec)
============================================================ */

type AgentStatus = "active" | "idle" | "warning" | "error";
type AgentType =
  | "revenue"
  | "marketing"
  | "reputation"
  | "operations"
  | "finance"
  | "hr"
  | "executive";

interface DecisionLogEntry {
  at: string;
  decision: string;
  confidence: number;
  result: string;
}

interface Agent {
  id: AgentType;
  name: string;
  icon: string;
  status: AgentStatus;
  objective: string;
  tools: string[];
  dataSources: string[];
  limits: string[];
  currentTask: string;
  recommendationsGenerated: number;
  actionsExecuted: number;
  actionsPending: number;
  qualityScore: number; // 0-100
  lastActiveAt: string;
  decisionLog: DecisionLogEntry[];
}

/* ============================================================
   Icon lookup (maps string -> lucide component)
============================================================ */

/* Wrapper component so we never create a component during render.
   We switch on the name so each lucide component is referenced directly. */
function AgentIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  switch (name) {
    case "Crown":
      return <Crown className={className} aria-hidden />;
    case "TrendingUp":
      return <TrendingUp className={className} aria-hidden />;
    case "Megaphone":
      return <Megaphone className={className} aria-hidden />;
    case "Star":
      return <Star className={className} aria-hidden />;
    case "Settings":
      return <Settings className={className} aria-hidden />;
    case "DollarSign":
      return <DollarSign className={className} aria-hidden />;
    case "Users":
      return <Users className={className} aria-hidden />;
    default:
      return <Cpu className={className} aria-hidden />;
  }
}

/* ============================================================
   Status badge
============================================================ */

const STATUS_STYLES: Record<
  AgentStatus,
  { label: string; cls: string; dot: string; ring: string }
> = {
  active: {
    label: "Active",
    cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    dot: "bg-emerald-400",
    ring: "ring-emerald-400/30",
  },
  idle: {
    label: "Idle",
    cls: "border-foreground/20 bg-foreground/5 text-muted-foreground",
    dot: "bg-foreground/30",
    ring: "ring-foreground/15",
  },
  warning: {
    label: "Warning",
    cls: "border-amber-400/45 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
    ring: "ring-amber-400/30",
  },
  error: {
    label: "Error",
    cls: "border-rose-400/45 bg-rose-400/10 text-rose-300",
    dot: "bg-rose-400",
    ring: "ring-rose-400/30",
  },
};

function StatusBadge({ status }: { status: AgentStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
        s.cls
      )}
    >
      <span className="relative flex h-2 w-2">
        {status === "active" ? (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
        ) : null}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", s.dot)} />
      </span>
      {s.label}
    </span>
  );
}

/* ============================================================
   Circular quality score indicator (SVG)
============================================================ */

function QualityRing({ score, size = 56 }: { score: number; size?: number }) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const offset = c - (pct / 100) * c;
  const tone =
    score >= 80
      ? "#10b981"
      : score >= 60
      ? "#D4AF37"
      : score > 0
      ? "#fb7185"
      : "#6b7280";
  const label =
    score === 0 ? "N/D" : score >= 80 ? "Alta" : score >= 60 ? "Media" : "Baja";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-foreground/10"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-xs font-medium" style={{ color: tone }}>
          {score === 0 ? "—" : `${score}%`}
        </span>
      </div>
      <span className="sr-only">Calidad: {label} ({score}%)</span>
    </div>
  );
}

/* ============================================================
   Demo data: Executive Agent
============================================================ */

const EXECUTIVE_AGENT: Agent = {
  id: "executive",
  name: "Executive Agent",
  icon: "Crown",
  status: "active",
  objective:
    "Coordina todos los agentes especializados, resume la situación operativa, prioriza problemas y genera informes ejecutivos.",
  tools: [
    "summarize_state",
    "prioritize_recommendations",
    "generate_executive_report",
    "delegate_to_agent",
  ],
  dataSources: ["Todos los agentes", "D1", "Durable Objects", "CRM", "Reviews API"],
  limits: [
    "No ejecuta acciones directamente",
    "No accede a datos de empleados sin permiso",
    "No envía comunicaciones externas",
  ],
  currentTask:
    "Coordinando 5 agentes activos · Priorizando 3 recomendaciones críticas",
  recommendationsGenerated: 3,
  actionsExecuted: 0,
  actionsPending: 0,
  qualityScore: 94,
  lastActiveAt: "hace 8s",
  decisionLog: [
    {
      at: "14:32:01",
      decision: "Priorizar recomendación 'Reservas dobles 21:30-22:30' (Revenue Agent)",
      confidence: 88,
      result: "Priorizada",
    },
    {
      at: "14:28:15",
      decision: "Escalar alerta 'Carlos OVERLOADED' a Operations Agent",
      confidence: 95,
      result: "Delegada",
    },
    {
      at: "14:25:00",
      decision: "Generar resumen ejecutivo para consulta del usuario",
      confidence: 92,
      result: "Generado",
    },
    {
      at: "14:00:00",
      decision: "Sincronización diaria con todos los agentes",
      confidence: 100,
      result: "Sincronizado",
    },
  ],
};

/* ============================================================
   Demo data: 6 specialized agents
============================================================ */

const SPECIALIZED_AGENTS: Agent[] = [
  {
    id: "revenue",
    name: "Revenue Agent",
    icon: "TrendingUp",
    status: "active",
    objective: "Maximizar ingresos por servicio mediante pricing y gestión de capacidad.",
    tools: [
      "query_revenue",
      "query_reservations",
      "create_recommendation",
      "open_capacity_slot",
    ],
    dataSources: ["D1", "Billing", "Reservations"],
    limits: [
      "No modifica precios sin autorización",
      "No crea campañas automáticamente",
      "Solo lectura en datos de empleados",
    ],
    currentTask: "Analizando facturación y ocupación",
    recommendationsGenerated: 3,
    actionsExecuted: 1,
    actionsPending: 0,
    qualityScore: 88,
    lastActiveAt: "hace 12s",
    decisionLog: [
      {
        at: "14:32:01",
        decision: "Generar recomendación: reservas dobles zona interior 21:30-22:30",
        confidence: 84,
        result: "Generada",
      },
      {
        at: "14:12:20",
        decision: "Generar recomendación: upsell postres mesas <€40",
        confidence: 71,
        result: "Generada",
      },
      {
        at: "14:05:00",
        decision: "Ejecutar: habilitar franja 23:00 para reservas",
        confidence: 89,
        result: "Ejecutada",
      },
      {
        at: "13:48:11",
        decision: "Generar recomendación: promoción vino por copas 22:00+",
        confidence: 76,
        result: "Generada",
      },
    ],
  },
  {
    id: "marketing",
    name: "Marketing Agent",
    icon: "Megaphone",
    status: "active",
    objective: "Activar y fidelizar clientes mediante campañas personalizadas.",
    tools: [
      "query_customers",
      "create_campaign",
      "create_segment",
      "send_communication",
    ],
    dataSources: ["CRM", "Campaign Attribution", "D1"],
    limits: [
      "No envía campañas sin aprobación",
      "No modifica segmentos VIP sin autorización",
      "Límite 500 comunicaciones/día",
    ],
    currentTask: "Segmentando 14 VIPs inactivos",
    recommendationsGenerated: 2,
    actionsExecuted: 0,
    actionsPending: 2,
    qualityScore: 82,
    lastActiveAt: "hace 22s",
    decisionLog: [
      {
        at: "14:30:22",
        decision: "Generar campaña: Recuperación VIPs inactivos (14 destinatarios)",
        confidence: 68,
        result: "Pendiente aprobación",
      },
      {
        at: "14:15:00",
        decision: "Generar campaña: Cumpleaños febrero (8 destinatarios)",
        confidence: 72,
        result: "Pendiente aprobación",
      },
      {
        at: "13:30:00",
        decision: "Segmentar clientes VIP inactivos >90 días",
        confidence: 95,
        result: "Segmento creado",
      },
    ],
  },
  {
    id: "reputation",
    name: "Reputation Agent",
    icon: "Star",
    status: "active",
    objective: "Proteger y mejorar la reputación online respondiendo reseñas.",
    tools: [
      "query_reviews",
      "draft_response",
      "analyze_sentiment",
      "publish_response",
    ],
    dataSources: ["Reviews API", "Sentiment Engine", "D1"],
    limits: [
      "No publica respuestas sin aprobación",
      "No responde a reseñas con contenido legal",
      "Tono definido por guía de marca",
    ],
    currentTask: "4 reseñas analizadas, respuestas generadas",
    recommendationsGenerated: 4,
    actionsExecuted: 0,
    actionsPending: 4,
    qualityScore: 91,
    lastActiveAt: "hace 5s",
    decisionLog: [
      {
        at: "14:22:33",
        decision: "Generar respuesta a reseña 1★ de 'María G.'",
        confidence: 86,
        result: "Pendiente aprobación",
      },
      {
        at: "14:20:10",
        decision: "Generar respuesta a reseña 2★ de 'Javier P.'",
        confidence: 88,
        result: "Pendiente aprobación",
      },
      {
        at: "14:18:45",
        decision: "Analizar sentimiento de 4 reseñas recientes",
        confidence: 94,
        result: "Análisis completado",
      },
      {
        at: "14:15:30",
        decision: "Detectar bajada de rating 0.3 puntos en 7 días",
        confidence: 92,
        result: "Alerta generada",
      },
    ],
  },
  {
    id: "operations",
    name: "Operations Agent",
    icon: "Settings",
    status: "warning",
    objective: "Optimizar el flujo de operación del restaurante en tiempo real.",
    tools: [
      "query_staff_load",
      "reassign_table",
      "open_zone",
      "create_alert",
    ],
    dataSources: ["Durable Objects", "D1", "Staff API"],
    limits: [
      "No cancela reservas sin aprobación",
      "No cambia horarios sin autorización",
      "Solo lectura en nóminas",
    ],
    currentTask: "1 alerta de saturación: Carlos OVERLOADED",
    recommendationsGenerated: 1,
    actionsExecuted: 0,
    actionsPending: 1,
    qualityScore: 85,
    lastActiveAt: "hace 4s",
    decisionLog: [
      {
        at: "14:28:15",
        decision: "Detectar alerta: Carlos M. OVERLOADED (92% carga)",
        confidence: 95,
        result: "Alerta crítica",
      },
      {
        at: "14:05:12",
        decision: "Generar recomendación: reasignar M8+M12 a Laura",
        confidence: 88,
        result: "Pendiente aprobación",
      },
      {
        at: "13:50:00",
        decision: "Monitorear tiempo medio de atención por zona",
        confidence: 90,
        result: "Monitoreo activo",
      },
    ],
  },
  {
    id: "finance",
    name: "Finance Agent",
    icon: "DollarSign",
    status: "active",
    objective: "Vigilar y mejorar márgenes de platos y bebidas.",
    tools: [
      "query_billing",
      "query_recipes",
      "create_margin_alert",
      "recost_dish",
    ],
    dataSources: ["Billing", "Recipes DB", "Inventory"],
    limits: [
      "No modifica precios sin autorización",
      "No cambia proveedores sin aprobación",
      "No accede a datos bancarios",
    ],
    currentTask: "Calculando márgenes de platos",
    recommendationsGenerated: 2,
    actionsExecuted: 0,
    actionsPending: 2,
    qualityScore: 79,
    lastActiveAt: "hace 30s",
    decisionLog: [
      {
        at: "14:18:09",
        decision: "Detectar bajo margen en 'Risotto trufa' (18% vs target 30%)",
        confidence: 91,
        result: "Alerta de margen",
      },
      {
        at: "14:10:00",
        decision: "Detectar bajo margen en 'Vino casa tinto' (22% vs target 40%)",
        confidence: 88,
        result: "Alerta de margen",
      },
      {
        at: "13:45:00",
        decision: "Calcular margen medio por categoría de plato",
        confidence: 95,
        result: "Cálculo completado",
      },
    ],
  },
  {
    id: "hr",
    name: "HR Agent",
    icon: "Users",
    status: "idle",
    objective: "Equilibrar la carga del personal y prevenir burnout.",
    tools: [
      "query_staff_load",
      "create_recommendation",
      "shift_alert",
    ],
    dataSources: ["Staff API", "D1", "Durable Objects"],
    limits: [
      "Solo lectura en datos de empleados",
      "No modifica turnos sin aprobación",
      "No accede a datos salariales",
    ],
    currentTask: "Monitoreando carga personal",
    recommendationsGenerated: 0,
    actionsExecuted: 0,
    actionsPending: 0,
    qualityScore: 0,
    lastActiveAt: "hace 4 min",
    decisionLog: [
      {
        at: "14:28:00",
        decision: "Detectar sobrecarga en Carlos M. (92%)",
        confidence: 90,
        result: "Recomendación generada",
      },
      {
        at: "13:30:00",
        decision: "Monitoreo de carga semanal completado",
        confidence: 95,
        result: "Sin alertas",
      },
    ],
  },
];

/* ============================================================
   Demo data: Executive report sections
============================================================ */

const EXEC_REPORT_SECTIONS: { title: string; lines: string[] }[] = [
  {
    title: "Resumen",
    lines: [
      "Servicio activo con 84% de ocupación y facturación estimada de €4.380.",
      "Cierre del día previsto: €5.100 (intervalo €4.700-€5.400, confianza 78%).",
      "3 recomendaciones críticas pendientes de aprobación.",
    ],
  },
  {
    title: "Reservas",
    lines: [
      "47 reservas hoy (+12% vs ayer).",
      "38 confirmadas, 5 pendientes, 4 en lista de espera.",
      "Franja 21:30-22:30 al 95% — riesgo de saturación.",
    ],
  },
  {
    title: "Ingresos",
    lines: [
      "Ticket medio €55 (+4% vs semana pasada).",
      "Mesa top: M12 (terraza) con €4.820/mes.",
      "Recomendación Revenue Agent: activar reservas dobles 21:30-22:30 (+€340 estimados).",
    ],
  },
  {
    title: "Clientes",
    lines: [
      "8 clientes VIP con reserva hoy.",
      "14 VIPs inactivos más de 90 días — campaña sugerida (ROI 800%).",
      "Segmento 'Cumpleaños febrero' listo para campaña.",
    ],
  },
  {
    title: "Reputación",
    lines: [
      "Google Rating actual: 4.1★ (objetivo 4.3★).",
      "4 reseñas pendientes analizadas por Reputation Agent.",
      "Respuestas redactadas pendientes de aprobación.",
    ],
  },
  {
    title: "Operaciones",
    lines: [
      "6 miembros activos, 1 OVERLOADED (Carlos 92%).",
      "Recomendación: reasignar M8+M12 a Laura.",
      "3 alertas activas (1 crítica, 2 medias).",
    ],
  },
  {
    title: "Recomendaciones prioritarias",
    lines: [
      "1. Activar reservas dobles zona interior 21:30-22:30 (Revenue, +€340).",
      "2. Reasignar M8+M12 de Carlos a Laura (Operations, -4 min espera).",
      "3. Responder 4 reseñas negativas (Reputation, +0.2 pts).",
      "4. Lanzar campaña 'Recuperación VIP' (Marketing, +€1.840).",
    ],
  },
];

/* ============================================================
   Agent card sub-components
============================================================ */

function ToolsChips({ tools }: { tools: string[] }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
        <Wrench className="h-2.5 w-2.5" aria-hidden /> Herramientas
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tools.map((t, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded border border-foreground/15 bg-foreground/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function DataSourcesChips({ sources }: { sources: string[] }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
        <Database className="h-2.5 w-2.5" aria-hidden /> Fuentes de datos
      </div>
      <div className="flex flex-wrap gap-1.5">
        {sources.map((s, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded border border-[var(--teal)]/25 bg-[var(--teal)]/10 px-1.5 py-0.5 text-[10px] font-mono text-[var(--teal)]"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

function LimitsList({ limits }: { limits: string[] }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
        <Shield className="h-2.5 w-2.5" aria-hidden /> Límites
      </div>
      <ul className="space-y-1">
        {limits.map((l, i) => (
          <li key={i} className="text-[11px] text-muted-foreground flex gap-1.5 leading-relaxed">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-foreground/30" />
            <span>{l}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DecisionLog({ log }: { log: DecisionLogEntry[] }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
        <Clock className="h-2.5 w-2.5" aria-hidden /> Decision log
      </div>
      <ul className="space-y-1.5 max-h-48 overflow-y-auto rp-scroll-thin">
        {log.map((d, i) => (
          <li key={i} className="text-[11px] flex flex-col gap-0.5 rounded border border-border/40 bg-foreground/[0.02] px-2 py-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-muted-foreground">{d.at}</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded px-1.5 py-0 text-[9px] font-mono uppercase tracking-wider",
                  d.confidence >= 80
                    ? "bg-emerald-400/10 text-emerald-300"
                    : d.confidence >= 60
                    ? "bg-[var(--gold)]/10 text-[var(--gold-soft)]"
                    : "bg-rose-400/10 text-rose-300"
                )}
              >
                {d.confidence}%
              </span>
            </div>
            <span className="text-foreground/85 leading-relaxed">{d.decision}</span>
            <span className="text-muted-foreground">→ {d.result}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================
   Agent card component
============================================================ */

function AgentCard({
  agent,
  reduceMotion,
  onViewDetail,
  onPause,
  onActivate,
}: {
  agent: Agent;
  reduceMotion: boolean | null;
  onViewDetail: (a: Agent) => void;
  onPause: (a: Agent) => void;
  onActivate: (a: Agent) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const isActive = agent.status === "active";
  const isIdle = agent.status === "idle";

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="rp-glass rounded-xl p-4 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border bg-foreground/[0.04] ring-1",
            STATUS_STYLES[agent.status].ring,
            agent.status === "active"
              ? "border-emerald-400/30 text-emerald-300"
              : agent.status === "warning"
              ? "border-amber-400/30 text-amber-300"
              : agent.status === "error"
              ? "border-rose-400/30 text-rose-300"
              : "border-foreground/20 text-muted-foreground"
          )}
        >
          <AgentIcon name={agent.icon} className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-base font-medium tracking-tight truncate">{agent.name}</h3>
            <StatusBadge status={agent.status} />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground leading-snug line-clamp-2">{agent.objective}</p>
        </div>
      </div>

      {/* Current task */}
      <div className="mt-3 rounded-lg border border-border/40 bg-foreground/[0.02] px-3 py-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Tarea actual</div>
        <p className="text-xs italic text-foreground/90 leading-relaxed">{agent.currentTask}</p>
      </div>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rp-glass rounded-lg p-2 text-center">
          <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Recs</div>
          <div className="font-mono text-sm rp-gold-text font-medium">{agent.recommendationsGenerated}</div>
        </div>
        <div className="rp-glass rounded-lg p-2 text-center">
          <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Ejec.</div>
          <div className="font-mono text-sm text-emerald-300 font-medium">{agent.actionsExecuted}</div>
        </div>
        <div className="rp-glass rounded-lg p-2 text-center">
          <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Pend.</div>
          <div className="font-mono text-sm text-amber-300 font-medium">{agent.actionsPending}</div>
        </div>
      </div>

      {/* Quality + last active */}
      <div className="mt-3 flex items-center gap-3">
        <QualityRing score={agent.qualityScore} size={48} />
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Calidad del agente</div>
          <div className="text-sm">
            {agent.qualityScore === 0 ? (
              <span className="text-muted-foreground">Datos insuficientes</span>
            ) : agent.qualityScore >= 80 ? (
              <span className="text-emerald-300 font-medium">Alta</span>
            ) : agent.qualityScore >= 60 ? (
              <span className="rp-gold-text font-medium">Media</span>
            ) : (
              <span className="text-rose-300 font-medium">Baja</span>
            )}
          </div>
          <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
            Última actividad: {agent.lastActiveAt}
          </div>
        </div>
      </div>

      {/* Expandable detail */}
      <div className="mt-3">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full inline-flex items-center justify-between gap-2 rounded-md border border-border/40 bg-foreground/[0.02] px-3 py-1.5 text-xs hover:bg-foreground/5 transition-colors min-h-[36px]"
          aria-expanded={expanded}
          aria-controls={`agent-detail-${agent.id}`}
        >
          <span className="flex items-center gap-1.5 font-mono uppercase tracking-wider text-muted-foreground">
            <Layers className="h-3 w-3" aria-hidden /> Detalle del agente
          </span>
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded ? "rotate-180" : "")} aria-hidden />
        </button>
        <AnimatePresence initial={false}>
          {expanded ? (
            <motion.div
              id={`agent-detail-${agent.id}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-3 pt-3 border-t border-border/40">
                <DecisionLog log={agent.decisionLog} />
                <ToolsChips tools={agent.tools} />
                <DataSourcesChips sources={agent.dataSources} />
                <LimitsList limits={agent.limits} />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-1.5 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-2.5 text-xs"
          onClick={() => onViewDetail(agent)}
        >
          <Eye className="h-3.5 w-3.5 mr-1" aria-hidden /> Ver detalle
        </Button>
        {isActive ? (
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2.5 text-xs text-amber-300 border-amber-400/40 hover:bg-amber-400/10"
            onClick={() => onPause(agent)}
          >
            <Pause className="h-3.5 w-3.5 mr-1" aria-hidden /> Pausar
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2.5 text-xs text-emerald-300 border-emerald-400/40 hover:bg-emerald-400/10"
            onClick={() => onActivate(agent)}
            disabled={isIdle && agent.qualityScore === 0 ? false : false}
          >
            <Play className="h-3.5 w-3.5 mr-1" aria-hidden /> Activar
          </Button>
        )}
      </div>
    </motion.div>
  );
}

/* ============================================================
   Executive Agent card
============================================================ */

function ExecutiveAgentCard({
  agent,
  onGenerateReport,
  onViewDetail,
}: {
  agent: Agent;
  onGenerateReport: () => void;
  onViewDetail: (a: Agent) => void;
}) {
  return (
    <motion.div
      initial={false}
      className="rp-glass-strong rp-glow-gold rounded-2xl p-5 sm:p-6"
    >
      <div className="flex items-start gap-4 flex-wrap">
        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] flex items-center justify-center shrink-0 ring-1 ring-[var(--gold)]/40">
          <AgentIcon name={agent.icon} className="h-7 w-7 text-black" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display text-lg sm:text-xl font-medium tracking-tight">{agent.name}</h3>
            <StatusBadge status={agent.status} />
            <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]">
              <Crown className="h-2.5 w-2.5" aria-hidden /> Coordinador
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed max-w-3xl">
            El Executive Agent coordina todos los agentes. Resume la situación, prioriza problemas y genera informes.
            Explica qué agente produjo cada recomendación.
          </p>
          <div className="mt-3 rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/[0.04] px-3 py-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)]">Tarea actual</div>
            <p className="text-sm italic text-foreground/90 leading-relaxed">{agent.currentTask}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <QualityRing score={agent.qualityScore} size={64} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rp-glass rounded-lg p-2.5 text-center">
          <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Recomendaciones priorizadas</div>
          <div className="font-mono text-base rp-gold-text font-medium">{agent.recommendationsGenerated}</div>
        </div>
        <div className="rp-glass rounded-lg p-2.5 text-center">
          <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Agentes coordinados</div>
          <div className="font-mono text-base text-emerald-300 font-medium">6</div>
        </div>
        <div className="rp-glass rounded-lg p-2.5 text-center">
          <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Última actividad</div>
          <div className="font-mono text-sm text-foreground/90 font-medium">{agent.lastActiveAt}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <Button
          onClick={onGenerateReport}
          className="bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] text-black hover:opacity-90"
        >
          <FileText className="h-4 w-4 mr-1.5" aria-hidden />
          Generar informe ejecutivo
        </Button>
        <Button variant="outline" onClick={() => onViewDetail(agent)}>
          <Eye className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Ver detalle del coordinador
        </Button>
      </div>
    </motion.div>
  );
}

/* ============================================================
   Action classification legend
============================================================ */

const LEGEND_ITEMS: {
  tone: "auto" | "confirm" | "forbidden";
  title: string;
  items: string[];
}[] = [
  {
    tone: "auto",
    title: "Automática (bajo riesgo)",
    items: [
      "Crear borradores",
      "Generar informes",
      "Añadir etiquetas",
      "Actualizar dashboards",
    ],
  },
  {
    tone: "confirm",
    title: "Con confirmación",
    items: [
      "Enviar comunicaciones",
      "Cambiar horarios",
      "Cancelar reservas",
      "Crear descuentos",
      "Modificar precios",
    ],
  },
  {
    tone: "forbidden",
    title: "Prohibida sin autorización especial",
    items: [
      "Borrar datos",
      "Realizar pagos",
      "Modificar permisos",
      "Exportar datos sensibles",
      "Campañas masivas sin consentimiento",
    ],
  },
];

function ActionLegend() {
  const toneCls = {
    auto: {
      ring: "border-emerald-400/40",
      bg: "bg-emerald-400/10",
      text: "text-emerald-300",
      icon: CheckCircle2,
      label: "Automática",
    },
    confirm: {
      ring: "border-amber-400/45",
      bg: "bg-amber-400/10",
      text: "text-amber-300",
      icon: AlertTriangle,
      label: "Con confirmación",
    },
    forbidden: {
      ring: "border-rose-400/45",
      bg: "bg-rose-400/10",
      text: "text-rose-300",
      icon: Ban,
      label: "Prohibida",
    },
  } as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {LEGEND_ITEMS.map((item, i) => {
        const t = toneCls[item.tone];
        const Icon = t.icon;
        return (
          <div key={i} className={cn("rounded-xl border p-4", t.ring, t.bg)}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className={cn("h-4 w-4", t.text)} aria-hidden />
              <span className={cn("text-xs font-mono uppercase tracking-wider", t.text)}>{t.label}</span>
            </div>
            <ul className="space-y-1.5">
              {item.items.map((it, j) => (
                <li key={j} className="text-xs text-foreground/85 flex gap-2 leading-relaxed">
                  <CircleDot className={cn("h-3 w-3 mt-0.5 shrink-0", t.text)} aria-hidden />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   Main component
============================================================ */

export function AiOsAgents() {
  const reduceMotion = useReducedMotion();
  const { toast } = useToast();

  const [detailAgent, setDetailAgent] = React.useState<Agent | null>(null);
  const [pauseAgent, setPauseAgent] = React.useState<Agent | null>(null);
  const [activateAgent, setActivateAgent] = React.useState<Agent | null>(null);
  const [reportOpen, setReportOpen] = React.useState(false);

  const handlePauseConfirm = () => {
    if (!pauseAgent) return;
    toast({
      title: "Agente pausado",
      description: `${pauseAgent.name} se ha pausado. No generará nuevas recomendaciones hasta que se active.`,
    });
    setPauseAgent(null);
  };

  const handleActivateConfirm = () => {
    if (!activateAgent) return;
    toast({
      title: "Agente activado",
      description: `${activateAgent.name} ha sido activado y empezará a generar recomendaciones.`,
    });
    setActivateAgent(null);
  };

  const handleGenerateReport = () => {
    setReportOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 overflow-x-hidden">
      {/* Header */}
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] flex items-center justify-center text-black ring-1 ring-[var(--gold)]/40 shrink-0">
            <Cpu className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-xl sm:text-2xl font-medium tracking-tight">
                Sistema Multi-Agente
              </h1>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-amber-400/40 bg-amber-400/10 text-amber-300">
                demo
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]">
                <Sparkles className="h-3 w-3" aria-hidden /> Cloudflare Workers AI
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              6 agentes especializados coordinados por el Executive Agent · Modelo <span className="font-mono">@cf/meta/llama-3.1-8b-instruct</span>
            </p>
          </div>
        </div>
      </header>

      {/* Executive Agent (top, prominent) */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            <span className="rp-gold-text">01</span>
            <span className="inline-block h-px w-6 bg-gradient-to-r from-[var(--gold)]/60 to-transparent mx-2 align-middle" />
            Coordinador
          </span>
        </div>
        <ExecutiveAgentCard
          agent={EXECUTIVE_AGENT}
          onGenerateReport={handleGenerateReport}
          onViewDetail={(a) => setDetailAgent(a)}
        />
      </section>

      {/* Specialized agents grid */}
      <section>
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              <span className="rp-gold-text">02</span>
              <span className="inline-block h-px w-6 bg-gradient-to-r from-[var(--gold)]/60 to-transparent mx-2 align-middle" />
              Agentes especializados
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            5 activos · 1 idle · 1 warning
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SPECIALIZED_AGENTS.map((a) => (
            <AgentCard
              key={a.id}
              agent={a}
              reduceMotion={reduceMotion}
              onViewDetail={(ag) => setDetailAgent(ag)}
              onPause={(ag) => setPauseAgent(ag)}
              onActivate={(ag) => setActivateAgent(ag)}
            />
          ))}
        </div>
      </section>

      {/* Action classification legend */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            <span className="rp-gold-text">03</span>
            <span className="inline-block h-px w-6 bg-gradient-to-r from-[var(--gold)]/60 to-transparent mx-2 align-middle" />
            Clasificación de acciones
          </span>
        </div>
        <div className="rp-glass rounded-xl p-4 sm:p-5">
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed max-w-3xl">
            Toda acción propuesta por los agentes se clasifica según su nivel de riesgo. Las acciones automáticas se ejecutan sin intervención humana; las que requieren confirmación generan una aprobación pendiente; las prohibidas nunca se ejecutan sin autorización especial explícita.
          </p>
          <ActionLegend />
        </div>
      </section>

      {/* Footer: security + audit */}
      <footer className="mt-2 pt-6 border-t border-border/40">
        <div className="rp-glass rounded-xl p-4 flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-[var(--teal)]/10 border border-[var(--teal)]/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-4 w-4 rp-teal-text" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium">Seguridad y trazabilidad</div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Cada agente opera dentro de sus límites declarados. Toda decisión queda registrada en el decision log y en el timeline de auditoría. Permisos validados por organización · Protección anti prompt injection activa · Modelo @cf/meta/llama-3.1-8b-instruct.
            </p>
          </div>
        </div>
      </footer>

      {/* ============================================================
         Dialog: Agent detail
      ============================================================ */}
      <Dialog open={!!detailAgent} onOpenChange={(o) => !o && setDetailAgent(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rp-scroll-thin">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {detailAgent ? (
                <AgentIcon name={detailAgent.icon} className="h-4 w-4 rp-gold-text" />
              ) : null}
              {detailAgent?.name}
            </DialogTitle>
            <DialogDescription>
              Informe completo del agente · objetivo, herramientas, límites, decisiones recientes y outputs.
            </DialogDescription>
          </DialogHeader>
          {detailAgent ? (
            <div className="space-y-4">
              {/* Status row */}
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={detailAgent.status} />
                <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-foreground/15 bg-foreground/[0.04] text-muted-foreground">
                  <Clock className="h-2.5 w-2.5" aria-hidden /> {detailAgent.lastActiveAt}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]">
                  <Gauge className="h-2.5 w-2.5" aria-hidden /> Calidad {detailAgent.qualityScore === 0 ? "N/D" : `${detailAgent.qualityScore}%`}
                </span>
              </div>

              {/* Objective */}
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Objetivo</div>
                <p className="text-sm text-foreground/90 leading-relaxed">{detailAgent.objective}</p>
              </div>

              {/* Current task */}
              <div className="rounded-lg border border-border/40 bg-foreground/[0.02] px-3 py-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Tarea actual</div>
                <p className="text-sm italic text-foreground/90 leading-relaxed">{detailAgent.currentTask}</p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rp-glass rounded-lg p-2.5 text-center">
                  <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Recomendaciones</div>
                  <div className="font-mono text-base rp-gold-text font-medium">{detailAgent.recommendationsGenerated}</div>
                </div>
                <div className="rp-glass rounded-lg p-2.5 text-center">
                  <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Ejecutadas</div>
                  <div className="font-mono text-base text-emerald-300 font-medium">{detailAgent.actionsExecuted}</div>
                </div>
                <div className="rp-glass rounded-lg p-2.5 text-center">
                  <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Pendientes</div>
                  <div className="font-mono text-base text-amber-300 font-medium">{detailAgent.actionsPending}</div>
                </div>
              </div>

              {/* Decision log */}
              <DecisionLog log={detailAgent.decisionLog} />

              {/* Tools + sources + limits */}
              <div className="grid sm:grid-cols-2 gap-4">
                <ToolsChips tools={detailAgent.tools} />
                <DataSourcesChips sources={detailAgent.dataSources} />
              </div>
              <LimitsList limits={detailAgent.limits} />

              {/* Recent outputs */}
              {detailAgent.decisionLog.length > 0 ? (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                    <CheckCircle2 className="h-2.5 w-2.5" aria-hidden /> Outputs recientes
                  </div>
                  <ul className="space-y-1.5">
                    {detailAgent.decisionLog.slice(0, 4).map((d, i) => (
                      <li key={i} className="text-xs text-foreground/85 flex gap-2 leading-relaxed">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--gold)]" />
                        <span>
                          <span className="font-mono text-muted-foreground">{d.at}</span> — {d.decision} <span className="text-muted-foreground">({d.result})</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cerrar</Button>
            </DialogClose>
            {detailAgent && detailAgent.status === "active" ? (
              <Button variant="outline" className="text-amber-300 border-amber-400/40 hover:bg-amber-400/10" onClick={() => { setPauseAgent(detailAgent); setDetailAgent(null); }}>
                <Pause className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Pausar agente
              </Button>
            ) : (
              <Button variant="outline" className="text-emerald-300 border-emerald-400/40 hover:bg-emerald-400/10" onClick={() => { setActivateAgent(detailAgent); setDetailAgent(null); }}>
                <Play className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Activar agente
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================
         Dialog: Executive report
      ============================================================ */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rp-scroll-thin">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 rp-gold-text" aria-hidden />
              Informe ejecutivo
            </DialogTitle>
            <DialogDescription>
              Generado por el Executive Agent · Modelo @cf/meta/llama-3.1-8b-instruct · Datos confirmados del servicio de hoy.
            </DialogDescription>
          </DialogHeader>
          <div className="rp-glass rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Fecha: viernes 24 ene · Hora: 14:35
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]">
                <CheckCircle2 className="h-2.5 w-2.5" aria-hidden /> Datos confirmados
              </span>
            </div>
            {EXEC_REPORT_SECTIONS.map((s, i) => (
              <div key={i} className="border-b border-border/40 last:border-0 pb-4 last:pb-0">
                <div className="text-[10px] font-mono uppercase tracking-wider rp-gold-text mb-2 flex items-center gap-1.5">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[10px] font-mono">
                    {i + 1}
                  </span>
                  {s.title}
                </div>
                <ul className="space-y-1.5">
                  {s.lines.map((l, j) => (
                    <li key={j} className="text-sm text-foreground/85 flex gap-2 leading-relaxed">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--gold)]" />
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)}>Cerrar</Button>
            <Button className="bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] text-black hover:opacity-90">
              <Download className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Descargar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================
         Alert dialog: Pause agent confirm
      ============================================================ */}
      <AlertDialog open={!!pauseAgent} onOpenChange={(o) => !o && setPauseAgent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Pause className="h-4 w-4 text-amber-300" aria-hidden />
              ¿Pausar {pauseAgent?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              El agente dejará de generar nuevas recomendaciones hasta que lo reactives. Las acciones pendientes seguirán requiriendo aprobación. Esta decisión queda registrada en la auditoría.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={handlePauseConfirm}
            >
              Pausar agente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ============================================================
         Alert dialog: Activate agent confirm
      ============================================================ */}
      <AlertDialog open={!!activateAgent} onOpenChange={(o) => !o && setActivateAgent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Play className="h-4 w-4 text-emerald-300" aria-hidden />
              ¿Activar {activateAgent?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              El agente empezará a analizar datos y generar recomendaciones según su objetivo. Permisos y límites declarados siguen aplicándose. Esta decisión queda registrada en la auditoría.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={handleActivateConfirm}
            >
              Activar agente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
